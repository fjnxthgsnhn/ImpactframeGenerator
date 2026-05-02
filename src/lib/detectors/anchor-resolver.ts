/**
 * 中心点決定ロジックの統合
 *
 * 仕様書 7.2: 中心点決定の優先順位
 *   1. ユーザー手動指定ポイント (manual)
 *   2. 顔検出 (face)
 *   3. 人物検出 (person)
 *   4. 物体検出 (object)
 *   5. 前景マスクの重心 (foreground)
 *   6. 画像中央 (center)
 *
 * 検出処理は Web Worker 内で実行される（顔・人物検出）
 * 前景マスク検出はメインスレッドで実行（ImageSegmenter の制約）
 */

import type { EffectAnchor, AnchorMode } from "@/types";
import { detectWithWorker } from "./detection-with-worker";
import { detectForeground } from "./foreground-detector";

const CENTER_ANCHOR: EffectAnchor = {
  x: 960,
  y: 540,
  confidence: 1.0,
  source: "center",
};

/**
 * 指定された AnchorMode に基づいて中心点を解決する
 */
export async function resolveAnchor(
  imageBitmap: ImageBitmap,
  mode: AnchorMode,
  manualAnchor?: EffectAnchor | null,
): Promise<EffectAnchor> {
  // 1. 手動指定がある場合は最優先
  if (mode === "manual" && manualAnchor) {
    return manualAnchor;
  }

  // 2. auto モード: 優先順位に従って自動検出
  if (mode === "auto" || mode === "face") {
    try {
      const faceAnchor = await detectWithWorker(imageBitmap, "face");
      if (faceAnchor) return faceAnchor;
    } catch { /* fallthrough */ }
    if (mode === "face") return CENTER_ANCHOR;
  }

  if (mode === "auto" || mode === "person") {
    try {
      const personAnchor = await detectWithWorker(imageBitmap, "person");
      if (personAnchor) return personAnchor;
    } catch { /* fallthrough */ }
    if (mode === "person") return CENTER_ANCHOR;
  }

  if (mode === "auto" || mode === "object") {
    try {
      const objectAnchor = await detectWithWorker(imageBitmap, "object");
      if (objectAnchor) return objectAnchor;
    } catch { /* fallthrough */ }
    if (mode === "object") return CENTER_ANCHOR;
  }

  // 5. 前景マスクの重心 (foreground)
  if (mode === "auto" || mode === "foreground") {
    try {
      const fgAnchor = await detectForeground(imageBitmap);
      if (fgAnchor) return fgAnchor;
    } catch { /* fallthrough */ }
    if (mode === "foreground") return CENTER_ANCHOR;
  }

  // 6. 画像中央にフォールバック
  return CENTER_ANCHOR;
}

/**
 * すべての検出候補を収集する（E3-05 候補選択 UI 用）
 * 各モードで検出を試み、成功したものを候補リストとして返す
 */
export async function collectAllCandidates(
  imageBitmap: ImageBitmap,
): Promise<EffectAnchor[]> {
  const candidates: EffectAnchor[] = [];

  // 顔検出
  try {
    const face = await detectWithWorker(imageBitmap, "face");
    if (face) candidates.push(face);
  } catch { /* skip */ }

  // 人物検出
  try {
    const person = await detectWithWorker(imageBitmap, "person");
    if (person && person.source === "person") candidates.push(person);
  } catch { /* skip */ }

  // 物体検出
  try {
    const object = await detectWithWorker(imageBitmap, "object");
    if (object) candidates.push(object);
  } catch { /* skip */ }

  // 前景マスク
  try {
    const fg = await detectForeground(imageBitmap);
    if (fg) candidates.push(fg);
  } catch { /* skip */ }

  // 常に中央を候補に含める
  candidates.push(CENTER_ANCHOR);

  return candidates;
}