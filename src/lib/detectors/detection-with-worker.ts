/**
 * Web Worker を使った検出処理のラッパー
 */

import type { EffectAnchor } from "@/types";

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("@/workers/detection-worker.ts", import.meta.url),
      { type: "module" },
    );
  }
  return worker;
}

/**
 * Worker の初期化（MediaPipe モデルのロード）
 */
export function initDetectionWorker(): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    const handler = (e: MessageEvent) => {
      if (e.data.type === "ready") {
        w.removeEventListener("message", handler);
        resolve();
      } else if (e.data.type === "error") {
        w.removeEventListener("message", handler);
        reject(new Error(e.data.message));
      }
    };
    w.addEventListener("message", handler);
    w.postMessage({ type: "init" });
  });
}

/**
 * Worker を使って検出を実行する
 */
export function detectWithWorker(
  imageBitmap: ImageBitmap,
  mode: "face" | "person" | "object",
): Promise<EffectAnchor | null> {
  return new Promise((resolve, reject) => {
    const w = getWorker();

    const handler = (e: MessageEvent) => {
      if (e.data.type === "detected") {
        w.removeEventListener("message", handler);
        const anchor = e.data.anchor;
        if (anchor) {
          resolve({
            x: anchor.x,
            y: anchor.y,
            width: anchor.width,
            height: anchor.height,
            confidence: anchor.confidence,
            source: anchor.source,
          });
        } else {
          resolve(null);
        }
      } else if (e.data.type === "error") {
        w.removeEventListener("message", handler);
        reject(new Error(e.data.message));
      }
    };

    w.addEventListener("message", handler);
    w.postMessage({ type: "detect", mode, imageBitmap }, [imageBitmap]);
  });
}

/**
 * Worker を終了する
 */
export function terminateDetectionWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}