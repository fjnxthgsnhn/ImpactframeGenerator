/**
 * 画像処理エンジン
 *
 * Canvas API を使った画像エフェクト処理
 * 仕様書 12: インパクトフレーム種類に対応
 */

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

/**
 * 色調補正（コントラスト・彩度）
 */
export function applyColorAdjust(
  source: ImageBitmap,
  contrast: number,
  saturation: number,
): ImageBitmap {
  const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  ctx.filter = `contrast(${contrast}) saturate(${saturation})`;
  ctx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  return canvas.transferToImageBitmap();
}

/**
 * ホワイトフラッシュ
 */
export function applyWhiteFlash(
  source: ImageBitmap,
  amount: number,
): ImageBitmap {
  const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  // 元画像を描画
  ctx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 白オーバーレイ
  ctx.fillStyle = `rgba(255, 255, 255, ${amount})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  return canvas.transferToImageBitmap();
}

/**
 * ブラックフラッシュ
 */
export function applyBlackFlash(
  source: ImageBitmap,
  amount: number,
): ImageBitmap {
  const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = `rgba(0, 0, 0, ${amount})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  return canvas.transferToImageBitmap();
}

/**
 * ネガティブ反転
 */
export function applyNegativeInvert(source: ImageBitmap): ImageBitmap {
  const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];       // R
    data[i + 1] = 255 - data[i + 1]; // G
    data[i + 2] = 255 - data[i + 2]; // B
    // Alpha はそのまま
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.transferToImageBitmap();
}

/**
 * RGB シフト（色収差エフェクト）
 */
export function applyRgbShift(
  source: ImageBitmap,
  amount: number,
): ImageBitmap {
  const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  // R チャンネルを右にシフト
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const tempCanvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const tempCtx = tempCanvas.getContext("2d")!;

  // R チャンネル（赤のみ表示）
  tempCtx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const rData = tempCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const rPixels = rData.data;
  for (let i = 0; i < rPixels.length; i += 4) {
    rPixels[i + 1] = 0; // G を 0 に
    rPixels[i + 2] = 0; // B を 0 に
  }
  tempCtx.putImageData(rData, 0, 0);

  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(tempCanvas, amount, 0);

  // B チャンネル（青のみ表示）
  tempCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  tempCtx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const bData = tempCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const bPixels = bData.data;
  for (let i = 0; i < bPixels.length; i += 4) {
    bPixels[i] = 0;     // R を 0 に
    bPixels[i + 1] = 0; // G を 0 に
  }
  tempCtx.putImageData(bData, 0, 0);

  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(tempCanvas, -amount, 0);

  ctx.globalCompositeOperation = "source-over";
  return canvas.transferToImageBitmap();
}

/**
 * ブラー（ガウシアン近似）
 */
export function applyBlur(
  source: ImageBitmap,
  amount: number,
): ImageBitmap {
  const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  ctx.filter = `blur(${amount}px)`;
  ctx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  return canvas.transferToImageBitmap();
}

/**
 * ノイズ追加
 */
export function applyNoise(
  source: ImageBitmap,
  amount: number,
): ImageBitmap {
  const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * amount * 255;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.transferToImageBitmap();
}

/**
 * 赤黒インパクト（赤み強調 + 暗く）
 */
export function applyRedBlackImpact(
  source: ImageBitmap,
  amount: number,
): ImageBitmap {
  const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // 暗い部分をより暗く、赤みを強調
    data[i] = Math.min(255, data[i] * (1 + amount * 0.5));       // R 強調
    data[i + 1] = Math.max(0, data[i + 1] * (1 - amount * 0.3)); // G 抑制
    data[i + 2] = Math.max(0, data[i + 2] * (1 - amount * 0.3)); // B 抑制
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.transferToImageBitmap();
}