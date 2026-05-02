/**
 * 画像正規化ユーティリティ
 * 入力画像を 1920x1080 に cover resize + center crop する
 *
 * 仕様書 4.2 の計算式に従う
 */

export const OUTPUT_WIDTH = 1920;
export const OUTPUT_HEIGHT = 1080;

export type NormalizeResult = {
  canvas: OffscreenCanvas;
  scale: number;
  offsetX: number;
  offsetY: number;
  resizedWidth: number;
  resizedHeight: number;
};

/**
 * 入力画像を 1920x1080 に正規化する
 * CSS object-fit: cover 相当の処理
 */
export function normalizeImage(
  source: ImageBitmap,
): NormalizeResult {
  const sourceWidth = source.width;
  const sourceHeight = source.height;

  const scale = Math.max(
    OUTPUT_WIDTH / sourceWidth,
    OUTPUT_HEIGHT / sourceHeight,
  );

  const resizedWidth = sourceWidth * scale;
  const resizedHeight = sourceHeight * scale;

  const offsetX = (OUTPUT_WIDTH - resizedWidth) / 2;
  const offsetY = (OUTPUT_HEIGHT - resizedHeight) / 2;

  const canvas = new OffscreenCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2d context from OffscreenCanvas");
  }

  ctx.drawImage(source, offsetX, offsetY, resizedWidth, resizedHeight);

  return {
    canvas,
    scale,
    offsetX,
    offsetY,
    resizedWidth,
    resizedHeight,
  };
}

/**
 * OffscreenCanvas を data URL に変換する
 */
export async function canvasToDataUrl(
  canvas: OffscreenCanvas,
  type: "image/png" | "image/webp" = "image/png",
  quality?: number,
): Promise<string> {
  const blob = await canvas.convertToBlob({ type, quality });
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}