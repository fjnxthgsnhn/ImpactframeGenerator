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
 * 検出処理は Web Worker 内で実行される
 */

import type { EffectAnchor, AnchorMode } from "@/types";
import { detectWithWorker } from "./detection-with-worker";

const CENTER_ANCHOR: EffectAnchor = {
  x: 960,
  y: 540,
  confidence: 1.0,
  source: "center",
};

/**
 * 指定された AnchorMode に基づいて中心点を解決する
 *
 * @param imageBitmap 正規化済み画像 (1920x1080)
 * @param mode アンカーモード
 * @param manualAnchor 手動指定されたアンカー（mode === "manual" の場合に使用）
 * @returns 解決された EffectAnchor
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

  // 2. auto モード: 優先順位に従って自動検出（Worker 内で実行）
  if (mode === "auto" || mode === "face") {
    try {
      const faceAnchor = await detectWithWorker(imageBitmap, "face");
      if (faceAnchor) return faceAnchor;
    } catch {
      // 顔検出失敗時は次の手段へ
    }
    if (mode === "face") return CENTER_ANCHOR;
  }

  if (mode === "auto" || mode === "person") {
    try {
      const personAnchor = await detectWithWorker(imageBitmap, "person");
      if (personAnchor) return personAnchor;
    } catch {
      // 人物検出失敗時は次の手段へ
    }
    if (mode === "person") return CENTER_ANCHOR;
  }

  if (mode === "auto" || mode === "object") {
    try {
      const objectAnchor = await detectWithWorker(imageBitmap, "object");
      if (objectAnchor) return objectAnchor;
    } catch {
      // 物体検出失敗時は次の手段へ
    }
    if (mode === "object") return CENTER_ANCHOR;
  }

  // 5. 前景マスクの重心 (foreground) - 未実装のためスキップ
  if (mode === "foreground") {
    // TODO: 前景セグメンテーション実装後に追加
    return CENTER_ANCHOR;
  }

  // 6. 画像中央にフォールバック
  return CENTER_ANCHOR;
}