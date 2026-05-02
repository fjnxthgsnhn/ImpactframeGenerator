/**
 * 画像正規化 Web Worker
 * 入力画像を 1920x1080 に cover resize + center crop する
 */

const OUTPUT_WIDTH = 1920;
const OUTPUT_HEIGHT = 1080;

type WorkerMessage = {
  type: "normalize";
  imageBitmap: ImageBitmap;
};

type WorkerResponse =
  | {
      type: "normalized";
      canvas: OffscreenCanvas;
      scale: number;
      offsetX: number;
      offsetY: number;
      resizedWidth: number;
      resizedHeight: number;
    }
  | {
      type: "error";
      message: string;
    };

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, imageBitmap } = e.data;

  if (type !== "normalize") return;

  try {
    const sourceWidth = imageBitmap.width;
    const sourceHeight = imageBitmap.height;

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
      throw new Error("Failed to get 2d context");
    }

    ctx.drawImage(imageBitmap, offsetX, offsetY, resizedWidth, resizedHeight);

    // ImageBitmap を解放（Worker 内で使用後）
    imageBitmap.close();

    const response: WorkerResponse = {
      type: "normalized",
      canvas,
      scale,
      offsetX,
      offsetY,
      resizedWidth,
      resizedHeight,
    };

    (self as unknown as Worker).postMessage(response, [canvas]);
  } catch (error) {
    const response: WorkerResponse = {
      type: "error",
      message: error instanceof Error ? error.message : "Normalize failed",
    };
    self.postMessage(response);
  }
};