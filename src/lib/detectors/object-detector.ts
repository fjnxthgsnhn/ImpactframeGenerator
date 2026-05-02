/**
 * 物体検出モジュール（人物検出含む）
 *
 * 仕様書 7.4: 人物検出の場合
 *   anchor.x = personBox.x + personBox.width / 2
 *   anchor.y = personBox.y + personBox.height * 0.38
 *
 * MediaPipe ObjectDetector は人物クラスを含む汎用物体検出を行う
 */

import { getObjectDetector } from "./mediapipe-loader";
import type { EffectAnchor } from "@/types";

/**
 * 人物検出を実行し、EffectAnchor を返す
 * 検出できなかった場合は null を返す
 */
export async function detectPersons(
  imageBitmap: ImageBitmap,
): Promise<EffectAnchor | null> {
  const detector = await getObjectDetector();
  const result = detector.detect(imageBitmap);

  if (result.detections.length === 0) {
    return null;
  }

  // "person" カテゴリの検出結果を優先
  const personDetections = result.detections.filter((d) =>
    d.categories?.some(
      (c) => c.categoryName?.toLowerCase() === "person" && c.score > 0.3,
    ),
  );

  const target = personDetections.length > 0 ? personDetections : result.detections;

  // 最も信頼度の高い検出結果を使用
  const best = target.reduce((a, b) => {
    const scoreA = a.categories?.[0]?.score ?? 0;
    const scoreB = b.categories?.[0]?.score ?? 0;
    return scoreA > scoreB ? a : b;
  });

  const box = best.boundingBox;
  if (!box) return null;

  const confidence = best.categories?.[0]?.score ?? 0;
  const isPerson = best.categories?.some(
    (c) => c.categoryName?.toLowerCase() === "person",
  );

  // 仕様書 7.4 の計算式
  const x = box.originX + box.width / 2;
  const y = box.originY + box.height * (isPerson ? 0.38 : 0.5);

  return {
    x,
    y,
    width: box.width,
    height: box.height,
    confidence,
    source: isPerson ? "person" : "object",
  };
}