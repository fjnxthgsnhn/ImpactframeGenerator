import { useCallback, useRef, useState, type DragEvent } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { normalizeImage, canvasToDataUrl } from "@/lib/canvas/normalize-image";

export function ImageDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setSourceImage = useAppStore((s) => s.setSourceImage);
  const setNormalizedCanvas = useAppStore((s) => s.setNormalizedCanvas);
  const setPreviewDataUrl = useAppStore((s) => s.setPreviewDataUrl);
  const reset = useAppStore((s) => s.reset);
  const previewDataUrl = useAppStore((s) => s.image.previewDataUrl);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const bitmap = await createImageBitmap(file);
        const result = normalizeImage(bitmap);
        const dataUrl = await canvasToDataUrl(result.canvas);

        setSourceImage(bitmap);
        setNormalizedCanvas(result.canvas);
        setPreviewDataUrl(dataUrl);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "画像の読み込みに失敗しました",
        );
      }
    },
    [setSourceImage, setNormalizedCanvas, setPreviewDataUrl],
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
        <div className="relative">
          <img
            src={previewDataUrl}
            alt="正規化済みプレビュー"
            className="w-full rounded-lg border border-outline-variant"
            style={{ aspectRatio: "16/9" }}
          />
          <button
            onClick={handleReset}
            className="absolute top-2 right-2 rounded-md bg-surface-container-high px-3 py-1 text-sm text-on-surface-variant hover:bg-surface-container-highest"
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
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleClick();
            }
          }}
        >
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