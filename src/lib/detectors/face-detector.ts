/**
 * 顔検出モジュール
 *
 * 仕様書 7.4: 顔検出の場合
 *   anchor.x = faceBox.x + faceBox.width / 2
 *   anchor.y = faceBox.y + faceBox.height * 0.45
 */

import { getFaceDetector } from "./mediapipe-loader";
import type { EffectAnchor } from "@/types";

/**
 * 顔検出を実行し、EffectAnchor を返す
 * 検出できなかった場合は null を返す
 */
export async function detectFaces(
  imageBitmap: ImageBitmap,
): Promise<EffectAnchor | null> {
  const detector = await getFaceDetector();
  const result = detector.detect(imageBitmap);

  if (result.detections.length === 0) {
    return null;
  }

  // 最も信頼度の高い検出結果を使用
  const best = result.detections.reduce((a, b) =>
    (a.categories?.[0]?.score ?? 0) > (b.categories?.[0]?.score ?? 0) ? a : b,
  );

  const box = best.boundingBox;
  if (!box) return null;

  const confidence = best.categories?.[0]?.score ?? 0;

  // 仕様書 7.4 の計算式
  const x = box.originX + box.width / 2;
  const y = box.originY + box.height * 0.45;

  return {
    x,
    y,
    width: box.width,
    height: box.height,
    confidence,
    source: "face",
  };
}