/**
 * エクスポート機能
 *
 * PNG 単体ダウンロードと ZIP 一括ダウンロード
 */

import type { GeneratedFrame } from "@/types";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

/**
 * ImageBitmap を PNG Blob に変換する
 */
export async function imageBitmapToPngBlob(
  imageBitmap: ImageBitmap,
): Promise<Blob> {
  const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imageBitmap, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  return canvas.convertToBlob({ type: "image/png" });
}

/**
 * 単一フレームを PNG としてダウンロードする
 */
export async function downloadPng(
  frame: GeneratedFrame,
  filename: string,
): Promise<void> {
  if (!frame.imageBitmap) return;

  const blob = await imageBitmapToPngBlob(frame.imageBitmap);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 複数フレームを ZIP として一括ダウンロードする
 */
export async function downloadZip(
  frames: GeneratedFrame[],
  zipFilename: string,
): Promise<void> {
  // 動的インポートで JSZip をロード
  const { default: JSZip } = await import("jszip");

  const zip = new JSZip();

  for (const frame of frames) {
    if (!frame.imageBitmap) continue;

    const blob = await imageBitmapToPngBlob(frame.imageBitmap);
    zip.file(`frame_${String(frame.index + 1).padStart(3, "0")}.png`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${zipFilename}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}