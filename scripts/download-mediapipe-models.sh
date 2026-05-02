#!/bin/bash
# MediaPipe モデルファイルのダウンロードスクリプト
# 実行方法: bash scripts/download-mediapipe-models.sh

set -e

MODELS_DIR="public/models"
BASE_URL="https://storage.googleapis.com/mediapipe-models"

mkdir -p "$MODELS_DIR"

echo "Downloading MediaPipe models..."

# Face Detector (BlazeFace)
echo "  -> Face Detector..."
curl -L -o "$MODELS_DIR/blaze_face_short_range.tflite" \
  "$BASE_URL/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite"

# Object Detector (EfficientDet-Lite0)
echo "  -> Object Detector..."
curl -L -o "$MODELS_DIR/efficientdet_lite0.tflite" \
  "$BASE_URL/object_detector/efficientdet_lite0/float16/latest/efficientdet_lite0.tflite"

# Image Segmenter (Selfie Segmenter)
echo "  -> Image Segmenter..."
curl -L -o "$MODELS_DIR/selfie_segmenter.tflite" \
  "$BASE_URL/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite"

# WASM files (MediaPipe Tasks Vision ランタイム)
echo "  -> WASM files..."
WASM_DIR="$MODELS_DIR/wasm"
mkdir -p "$WASM_DIR"

curl -L -o "$WASM_DIR/vision_wasm_internal.js" \
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/vision_wasm_internal.js"
curl -L -o "$WASM_DIR/vision_wasm_internal.wasm" \
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/vision_wasm_internal.wasm"
curl -L -o "$WASM_DIR/vision_wasm_nosimd_internal.js" \
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/vision_wasm_nosimd_internal.js"
curl -L -o "$WASM_DIR/vision_wasm_nosimd_internal.wasm" \
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/vision_wasm_nosimd_internal.wasm"

echo "Done! Models downloaded to $MODELS_DIR"