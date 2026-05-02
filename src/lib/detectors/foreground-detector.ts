/**
 * 前景マスク重心検出モジュール
 *
 * 仕様書 7.4: 前景マスクの場合
 *   anchor.x = weightedCentroid(mask).x
 *   anchor.y = weightedCentroid(mask).y
 *
 * MediaPipe ImageSegmenter (Selfie Segmenter) を使用する
 */

import { getImageSegmenter } from "./mediapipe-loader";
import type { EffectAnchor } from "@/types";

/**
 * 信頼度マスクから加重重心を計算する
 */
function computeWeightedCentroid(
  maskData: Float32Array,
  width: number,
  height: number,
): { x: number; y: number; confidence: number } {
  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const weight = maskData[idx];
      if (weight > 0.1) {
        weightedX += x * weight;
        weightedY += y * weight;
        totalWeight += weight;
      }
    }
  }

  if (totalWeight === 0) {
    return { x: width / 2, y: height / 2, confidence: 0 };
  }

  return {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight,
    confidence: Math.min(totalWeight / (width * height * 0.1), 1.0),
  };
}

/**
 * 前景マスクの重心を検出する
 * 検出できなかった場合は null を返す
 */
export async function detectForeground(
  imageBitmap: ImageBitmap,
): Promise<EffectAnchor | null> {
  const segmenter = await getImageSegmenter();
  const result = segmenter.segment(imageBitmap);

  const masks = result.confidenceMasks;
  if (!masks || masks.length === 0) {
    return null;
  }

  // 人物マスク（最初のマスク）を使用
  const mask = masks[0];
  const maskData = mask.getAsFloat32Array();
  const centroid = computeWeightedCentroid(
    maskData,
    mask.width,
    mask.height,
  );

  if (centroid.confidence < 0.05) {
    return null;
  }

  return {
    x: centroid.x,
    y: centroid.y,
    confidence: centroid.confidence,
    source: "foreground",
  };
}