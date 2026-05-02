/**
 * 対象物検出 Web Worker
 *
 * MediaPipe による顔検出・人物検出を Worker 内で実行する
 */

import {
  FaceDetector,
  ObjectDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

type WasmFileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;

type WorkerMessage =
  | {
      type: "init";
    }
  | {
      type: "detect";
      mode: "face" | "person" | "object";
      imageBitmap: ImageBitmap;
    };

type DetectedAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  source: "face" | "person" | "object";
};

type WorkerResponse =
  | {
      type: "ready";
    }
  | {
      type: "detected";
      anchor: DetectedAnchor | null;
    }
  | {
      type: "error";
      message: string;
    };

let wasmFileset: WasmFileset | null = null;
let faceDetector: FaceDetector | null = null;
let objectDetector: ObjectDetector | null = null;

const WASM_PATH = "/models/wasm";

async function init(): Promise<void> {
  if (!wasmFileset) {
    wasmFileset = await FilesetResolver.forVisionTasks(WASM_PATH);
  }
}

async function getFaceDetector(): Promise<FaceDetector> {
  if (!faceDetector) {
    if (!wasmFileset) await init();
    faceDetector = await FaceDetector.createFromOptions(wasmFileset!, {
      baseOptions: {
        modelAssetPath: "/models/blaze_face_short_range.tflite",
      },
      runningMode: "IMAGE",
    });
  }
  return faceDetector;
}

async function getObjectDetector(): Promise<ObjectDetector> {
  if (!objectDetector) {
    if (!wasmFileset) await init();
    objectDetector = await ObjectDetector.createFromOptions(wasmFileset!, {
      baseOptions: {
        modelAssetPath: "/models/efficientdet_lite0.tflite",
      },
      runningMode: "IMAGE",
      maxResults: 5,
      scoreThreshold: 0.3,
    });
  }
  return objectDetector;
}

async function detectFaces(
  imageBitmap: ImageBitmap,
): Promise<DetectedAnchor | null> {
  const detector = await getFaceDetector();
  const result = detector.detect(imageBitmap);

  if (result.detections.length === 0) return null;

  const best = result.detections.reduce((a, b) =>
    (a.categories?.[0]?.score ?? 0) > (b.categories?.[0]?.score ?? 0) ? a : b,
  );

  const box = best.boundingBox;
  if (!box) return null;

  return {
    x: box.originX + box.width / 2,
    y: box.originY + box.height * 0.45,
    width: box.width,
    height: box.height,
    confidence: best.categories?.[0]?.score ?? 0,
    source: "face",
  };
}

async function detectPersons(
  imageBitmap: ImageBitmap,
): Promise<DetectedAnchor | null> {
  const detector = await getObjectDetector();
  const result = detector.detect(imageBitmap);

  if (result.detections.length === 0) return null;

  const personDetections = result.detections.filter((d) =>
    d.categories?.some(
      (c) => c.categoryName?.toLowerCase() === "person" && c.score > 0.3,
    ),
  );

  const target =
    personDetections.length > 0 ? personDetections : result.detections;

  const best = target.reduce((a, b) => {
    const scoreA = a.categories?.[0]?.score ?? 0;
    const scoreB = b.categories?.[0]?.score ?? 0;
    return scoreA > scoreB ? a : b;
  });

  const box = best.boundingBox;
  if (!box) return null;

  const isPerson = best.categories?.some(
    (c) => c.categoryName?.toLowerCase() === "person",
  );

  return {
    x: box.originX + box.width / 2,
    y: box.originY + box.height * (isPerson ? 0.38 : 0.5),
    width: box.width,
    height: box.height,
    confidence: best.categories?.[0]?.score ?? 0,
    source: isPerson ? "person" : "object",
  };
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data;

  try {
    switch (type) {
      case "init": {
        await init();
        const response: WorkerResponse = { type: "ready" };
        self.postMessage(response);
        break;
      }

      case "detect": {
        const { mode, imageBitmap } = e.data;
        let anchor: DetectedAnchor | null = null;

        if (mode === "face") {
          anchor = await detectFaces(imageBitmap);
        } else {
          anchor = await detectPersons(imageBitmap);
        }

        // ImageBitmap を解放
        imageBitmap.close();

        const response: WorkerResponse = { type: "detected", anchor };
        self.postMessage(response);
        break;
      }
    }
  } catch (error) {
    const response: WorkerResponse = {
      type: "error",
      message: error instanceof Error ? error.message : "Detection failed",
    };
    self.postMessage(response);
  }
};