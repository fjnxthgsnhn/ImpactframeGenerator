import { useCallback, useRef, useState, type DragEvent } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { normalizeWithWorker } from "@/lib/canvas/normalize-with-worker";
import { canvasToDataUrl } from "@/lib/canvas/normalize-image";

export function ImageDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setSourceImage = useAppStore((s) => s.setSourceImage);
  const setNormalizedCanvas = useAppStore((s) => s.setNormalizedCanvas);
  const setPreviewDataUrl = useAppStore((s) => s.setPreviewDataUrl);
  const setNormalizeInfo = useAppStore((s) => s.setNormalizeInfo);
  const reset = useAppStore((s) => s.reset);
  const previewDataUrl = useAppStore((s) => s.image.previewDataUrl);
  const normalizeInfo = useAppStore((s) => s.image.normalizeInfo);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);
      try {
        const bitmap = await createImageBitmap(file);
        const result = await normalizeWithWorker(bitmap);
        const dataUrl = await canvasToDataUrl(result.canvas);

        setSourceImage(bitmap);
        setNormalizedCanvas(result.canvas);
        setPreviewDataUrl(dataUrl);
        setNormalizeInfo({
          scale: result.scale,
          offsetX: result.offsetX,
          offsetY: result.offsetY,
          resizedWidth: result.resizedWidth,
          resizedHeight: result.resizedHeight,
        });
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "画像の読み込みに失敗しました",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [setSourceImage, setNormalizedCanvas, setPreviewDataUrl, setNormalizeInfo],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          processFile(file);
        } else {
          setError("画像ファイルをドロップしてください");
        }
      }
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleReset = useCallback(() => {
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [reset]);

  return (
    <div className="flex flex-col gap-4">
      {previewDataUrl ? (
        <div className="space-y-3">
          {/* クロッププレビュー */}
          <div className="relative overflow-hidden rounded-lg border border-outline-variant">
            <img
              src={previewDataUrl}
              alt="正規化済みプレビュー (1920x1080)"
              className="w-full"
              style={{ aspectRatio: "16/9" }}
            />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                <div className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-sm text-on-surface">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  処理中...
                </div>
              </div>
            )}
          </div>

          {/* 正規化情報 */}
          {normalizeInfo && (
            <div className="rounded-lg bg-surface-container px-4 py-3">
              <h3 className="mb-2 text-sm font-medium text-on-surface">
                クロップ情報
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-on-surface-variant">
                <div className="flex justify-between">
                  <span>元画像サイズ</span>
                  <span className="font-mono text-on-surface">
                    {Math.round(normalizeInfo.resizedWidth / normalizeInfo.scale)}×{Math.round(normalizeInfo.resizedHeight / normalizeInfo.scale)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>拡大率</span>
                  <span className="font-mono text-on-surface">
                    {normalizeInfo.scale.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>リサイズ後</span>
                  <span className="font-mono text-on-surface">
                    {Math.round(normalizeInfo.resizedWidth)}×{Math.round(normalizeInfo.resizedHeight)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>出力サイズ</span>
                  <span className="font-mono text-on-surface">1920×1080</span>
                </div>
                <div className="col-span-2 mt-1 flex justify-between border-t border-outline-variant pt-1">
                  <span>クロップオフセット</span>
                  <span className="font-mono text-on-surface">
                    X: {normalizeInfo.offsetX.toFixed(0)}px / Y: {normalizeInfo.offsetY.toFixed(0)}px
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full rounded-md bg-surface-container-high px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            type="button"
          >
            画像を変更
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors ${
            isDragging
              ? "border-primary bg-primary-container/20"
              : "border-outline-variant hover:border-outline"
          } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleClick();
            }
          }}
        >
          {isProcessing ? (
            <>
              <svg
                className="h-8 w-8 animate-spin text-primary"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-sm text-on-surface-variant">画像を処理中...</p>
            </>
          ) : (
            <>
              <svg
                className="h-12 w-12 text-on-surface-variant"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-on-surface">
                  画像をドラッグ&ドロップ
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  またはクリックしてファイルを選択
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">
          {error}
        </p>
      )}
    </div>
  );
}