/**
 * MediaPipe Tasks Vision の遅延ロード機構
 *
 * 仕様書: 顔検出モデルのみ初期ロードし、
 * 物体検出・セグメンテーションは必要時にロードする
 */

import {
  FaceDetector,
  ObjectDetector,
  ImageSegmenter,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

// WasmFileset はエクスポートされていないため、ReturnType で型を取得
type WasmFileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;

let wasmFileset: WasmFileset | null = null;
let faceDetector: FaceDetector | null = null;
let objectDetector: ObjectDetector | null = null;
let imageSegmenter: ImageSegmenter | null = null;

const WASM_PATH = "/models/wasm";

async function getWasmFileset(): Promise<WasmFileset> {
  if (!wasmFileset) {
    wasmFileset = await FilesetResolver.forVisionTasks(WASM_PATH);
  }
  return wasmFileset;
}

/**
 * 顔検出器を取得（初期ロード対象）
 */
export async function getFaceDetector(): Promise<FaceDetector> {
  if (!faceDetector) {
    const vision = await getWasmFileset();
    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/blaze_face_short_range.tflite",
      },
      runningMode: "IMAGE",
    });
  }
  return faceDetector;
}

/**
 * 物体検出器を取得（遅延ロード）
 */
export async function getObjectDetector(): Promise<ObjectDetector> {
  if (!objectDetector) {
    const vision = await getWasmFileset();
    objectDetector = await ObjectDetector.createFromOptions(vision, {
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

/**
 * 画像セグメンターを取得（遅延ロード）
 */
export async function getImageSegmenter(): Promise<ImageSegmenter> {
  if (!imageSegmenter) {
    const vision = await getWasmFileset();
    imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/selfie_segmenter.tflite",
      },
      runningMode: "IMAGE",
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });
  }
  return imageSegmenter;
}

/**
 * すべての検出器を解放する
 */
export function disposeAllDetectors(): void {
  faceDetector?.close();
  objectDetector?.close();
  imageSegmenter?.close();
  faceDetector = null;
  objectDetector = null;
  imageSegmenter = null;
  wasmFileset = null;
}