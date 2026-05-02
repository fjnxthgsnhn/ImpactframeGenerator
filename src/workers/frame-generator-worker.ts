/**
 * フレーム生成 Web Worker
 *
 * 画像処理エフェクトを Worker 内で実行する
 */

import { applyColorAdjust, applyWhiteFlash, applyBlackFlash, applyNegativeInvert, applyRgbShift, applyBlur, applyNoise, applyRedBlackImpact } from "@/lib/effects/image-processor";
import type { EffectStep, EffectAnchor } from "@/types";

type WorkerMessage = {
  type: "generate";
  sourceImage: ImageBitmap;
  anchor: EffectAnchor;
  effects: EffectStep[];
  frameIndex: number;
};

type WorkerResponse = {
  type: "generated";
  frameIndex: number;
  imageBitmap: ImageBitmap;
};

/**
 * 画像エフェクトを適用する
 */
function applyImageEffect(
  source: ImageBitmap,
  effect: EffectStep,
): ImageBitmap {
  switch (effect.type) {
    case "colorAdjust":
      return applyColorAdjust(
        source,
        effect.contrast ?? 1.0,
        effect.saturation ?? 1.0,
      );
    case "whiteFlash":
      return applyWhiteFlash(source, effect.amount ?? 0.5);
    case "blackFlash":
      return applyBlackFlash(source, effect.amount ?? 0.5);
    case "negativeInvert":
      return applyNegativeInvert(source);
    case "rgbShift":
      return applyRgbShift(source, effect.amount ?? 4);
    case "blur":
      return applyBlur(source, effect.amount ?? 2);
    case "noise":
      return applyNoise(source, effect.amount ?? 0.1);
    case "redBlackImpact":
      return applyRedBlackImpact(source, effect.amount ?? 0.5);
    default:
      return source;
  }
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { sourceImage, effects, frameIndex } = e.data;

  try {
    let currentImage = sourceImage;

    for (const effect of effects) {
      const effectType = effect.type;

      // SVG エフェクトはメインスレッドで合成するためスキップ
      if (
        effectType === "svgRadialLines" ||
        effectType === "svgShockwave" ||
        effectType === "svgSlash" ||
        effectType === "svgLightning"
      ) {
        continue;
      }

      // 画像処理エフェクトを適用
      const processed = applyImageEffect(currentImage, effect);
      if (processed !== currentImage) {
        if (currentImage !== sourceImage) {
          currentImage.close();
        }
        currentImage = processed;
      }
    }

    const response: WorkerResponse = {
      type: "generated",
      frameIndex,
      imageBitmap: currentImage,
    };
    (self as unknown as Worker).postMessage(response, [currentImage]);
  } catch (error) {
    console.error("Frame generation error:", error);
    // エラー時は元画像を返す
    const response: WorkerResponse = {
      type: "generated",
      frameIndex,
      imageBitmap: sourceImage,
    };
    (self as unknown as Worker).postMessage(response, [sourceImage]);
  }
};