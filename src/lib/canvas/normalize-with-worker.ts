/**
 * Web Worker を使った画像正規化のラッパー
 */

import type { NormalizeResult } from "./normalize-image";

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
        resolve({
          canvas: data.canvas as OffscreenCanvas,
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