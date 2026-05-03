/**
 * フレーム生成エンジン
 *
 * Worker で画像処理を実行し、メインスレッドで SVG 合成を行う
 */

import { composeSvgEffects, svgToDataUrl } from "@/lib/svg/svg-composer";
import type {
  EffectAnchor,
  EffectStep,
  GeneratedFrame,
  SvgEffectParams,
  RadialLinesParams,
  ShockwaveParams,
  SlashParams,
  LightningParams,
} from "@/types";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

/**
 * EffectStep を SvgEffectParams に変換する
 */
function toSvgEffectParams(effect: EffectStep): SvgEffectParams | null {
  switch (effect.type) {
    case "svgRadialLines":
      return {
        type: "radial-lines",
        count: effect.lineCount ?? 180,
        innerRadius: effect.innerRadius ?? 80,
        outerRadius: effect.outerRadius ?? 1600,
        jitter: effect.jitter ?? 0.25,
        opacity: effect.opacity ?? 0.85,
      } satisfies RadialLinesParams;
    case "svgShockwave":
      return {
        type: "shockwave",
        radius: effect.radius ?? 220,
        irregularity: effect.irregularity ?? 0.25,
        strokeWidth: effect.strokeWidth ?? 12,
        opacity: effect.opacity ?? 0.9,
      } satisfies ShockwaveParams;
    case "svgSlash":
      return {
        type: "slash",
        angle: effect.angle ?? 0.78,
        length: effect.length ?? 1600,
        strokeWidth: effect.strokeWidth ?? 8,
        opacity: effect.opacity ?? 0.9,
      } satisfies SlashParams;
    case "svgLightning":
      return {
        type: "lightning",
        segments: effect.segments ?? 12,
        amplitude: effect.amplitude ?? 35,
        strokeWidth: effect.strokeWidth ?? 4,
        opacity: effect.opacity ?? 0.9,
      } satisfies LightningParams;
    default:
      return null;
  }
}

/**
 * SVG エフェクトを ImageBitmap に合成する
 */
async function compositeSvgOnImage(
  source: ImageBitmap,
  anchor: EffectAnchor,
  svgEffects: SvgEffectParams[],
): Promise<ImageBitmap> {
  if (svgEffects.length === 0) return source;

  const svg = composeSvgEffects(anchor, svgEffects);
  const svgDataUrl = svgToDataUrl(svg);

  // SVG を Image として読み込む
  const img = await loadImage(svgDataUrl);

  const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  return canvas.transferToImageBitmap();
}

/**
 * Data URL から ImageBitmap を生成する
 */
function loadImage(dataUrl: string): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      createImageBitmap(img).then(resolve).catch(reject);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Worker を使ってフレームを生成する
 * sourceCanvas からフレームごとに新しい ImageBitmap を生成して転送する
 */
export async function generateFramesWithWorker(
  sourceCanvas: OffscreenCanvas,
  anchor: EffectAnchor,
  effects: EffectStep[],
  frameCount: number,
  intensity: number,
  randomness: number,
  onProgress?: (progress: number) => void,
): Promise<GeneratedFrame[]> {
  const frames: GeneratedFrame[] = [];

  // SVG エフェクトと画像エフェクトを分離
  const svgEffectSteps = effects.filter(
    (e) =>
      e.type === "svgRadialLines" ||
      e.type === "svgShockwave" ||
      e.type === "svgSlash" ||
      e.type === "svgLightning",
  );
  const imageEffectSteps = effects.filter(
    (e) =>
      e.type !== "svgRadialLines" &&
      e.type !== "svgShockwave" &&
      e.type !== "svgSlash" &&
      e.type !== "svgLightning",
  );

  const svgParams = svgEffectSteps
    .map(toSvgEffectParams)
    .filter((p): p is SvgEffectParams => p !== null);

  // intensity と randomness を 0-1 に正規化
  const normalizedIntensity = intensity / 100;
  const normalizedRandomness = randomness / 100;

  // フレームごとにパラメータを変動させる
  for (let i = 0; i < frameCount; i++) {
    const progress = (i / frameCount);
    const variedEffects = imageEffectSteps.map((effect) => {
      const varied = { ...effect };

      // intensity と randomness に基づいてパラメータを変動
      const factor = 1 + (progress - 0.5) * normalizedIntensity * 2 +
        (Math.random() - 0.5) * normalizedRandomness * 2;

      if (varied.opacity !== undefined) {
        varied.opacity = Math.max(0, Math.min(1, varied.opacity * factor));
      }
      if (varied.amount !== undefined) {
        varied.amount = Math.max(0, Math.min(1, varied.amount * factor));
      }
      if (varied.contrast !== undefined) {
        varied.contrast = Math.max(0, varied.contrast * factor);
      }

      return varied;
    });

    // フレームごとに新しい ImageBitmap を生成（transfer 後も元 Canvas は保持される）
    const sourceImage = await createImageBitmap(sourceCanvas);

    // Worker を生成して画像処理を実行
    const worker = new Worker(
      new URL("@/workers/frame-generator-worker.ts", import.meta.url),
      { type: "module" },
    );

    const processedImage = await new Promise<ImageBitmap>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent) => {
        const { imageBitmap } = e.data;
        resolve(imageBitmap);
        worker.terminate();
      };
      worker.onerror = (e) => {
        reject(new Error(`Worker error: ${e.message}`));
        worker.terminate();
      };

      worker.postMessage(
        {
          type: "generate",
          sourceImage,
          anchor,
          effects: variedEffects,
          frameIndex: i,
        },
        [sourceImage],
      );
    });

    // SVG エフェクトを合成
    const finalImage = await compositeSvgOnImage(
      processedImage,
      anchor,
      svgParams,
    );

    // dataUrl を生成
    const displayCanvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const displayCtx = displayCanvas.getContext("2d")!;
    displayCtx.drawImage(finalImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const blob = await displayCanvas.convertToBlob({ type: "image/png" });
    const dataUrl = URL.createObjectURL(blob);

    frames.push({
      id: `frame_${i}`,
      index: i,
      imageBitmap: finalImage,
      dataUrl,
    });

    if (onProgress) {
      onProgress((i + 1) / frameCount);
    }
  }

  return frames;
}