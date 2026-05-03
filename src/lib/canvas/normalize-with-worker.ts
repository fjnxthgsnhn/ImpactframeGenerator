/**
 * Web Worker を使った画像正規化のラッパー
 * Worker から ImageBitmap を受け取り、OffscreenCanvas を再構築する
 */

import type { NormalizeResult } from "./normalize-image";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("@/workers/normalize-worker.ts", import.meta.url),
      { type: "module" },
    );
  }
  return worker;
}

/**
 * Worker を使って画像を正規化する
 * Worker は ImageBitmap を返し、メインスレッドで OffscreenCanvas を再構築する
 */
export function normalizeWithWorker(
  imageBitmap: ImageBitmap,
): Promise<NormalizeResult> {
  return new Promise((resolve, reject) => {
    const w = getWorker();

    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (data.type === "normalized") {
        w.removeEventListener("message", handleMessage);

        // Worker から受け取った ImageBitmap から OffscreenCanvas を再構築
        const receivedBitmap = data.imageBitmap as ImageBitmap;
        const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          receivedBitmap.close();
          reject(new Error("Failed to get 2d context for normalized canvas"));
          return;
        }

        ctx.drawImage(receivedBitmap, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 使用済み ImageBitmap を解放
        receivedBitmap.close();

        resolve({
          canvas,
          scale: data.scale,
          offsetX: data.offsetX,
          offsetY: data.offsetY,
          resizedWidth: data.resizedWidth,
          resizedHeight: data.resizedHeight,
        });
      } else if (data.type === "error") {
        w.removeEventListener("message", handleMessage);
        reject(new Error(data.message));
      }
    };

    w.addEventListener("message", handleMessage);
    w.postMessage({ type: "normalize", imageBitmap }, [imageBitmap]);
  });
}

/**
 * Worker を終了する（アプリ終了時など）
 */
export function terminateNormalizeWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}