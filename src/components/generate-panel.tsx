/**
 * フレーム生成・エクスポートパネル
 */

import { useCallback } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { PRESETS } from "@/lib/presets/preset-definitions";
import { generateFramesWithWorker } from "@/lib/export/frame-generator";
import { downloadPng, downloadZip } from "@/lib/export/exporter";

export function GeneratePanel() {
  const normalizedCanvas = useAppStore((s) => s.image.normalizedCanvas);
  const anchor = useAppStore((s) => s.anchor);
  const selectedPresetId = useAppStore((s) => s.selectedPresetId);
  const frameCount = useAppStore((s) => s.frameCount);
  const intensity = useAppStore((s) => s.intensity);
  const randomness = useAppStore((s) => s.randomness);
  const generatedFrames = useAppStore((s) => s.generatedFrames);
  const isProcessing = useAppStore((s) => s.isProcessing);
  const progress = useAppStore((s) => s.progress);

  const setFrameCount = useAppStore((s) => s.setFrameCount);
  const setIntensity = useAppStore((s) => s.setIntensity);
  const setRandomness = useAppStore((s) => s.setRandomness);
  const setGeneratedFrames = useAppStore((s) => s.setGeneratedFrames);
  const setIsProcessing = useAppStore((s) => s.setIsProcessing);
  const setProgress = useAppStore((s) => s.setProgress);

  const preset = PRESETS.find((p) => p.id === selectedPresetId);

  const handleGenerate = useCallback(async () => {
    if (!normalizedCanvas || !anchor || !preset) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const frames = await generateFramesWithWorker(
        normalizedCanvas,
        anchor,
        preset.effects,
        frameCount,
        intensity,
        randomness,
        (p) => setProgress(p),
      );

      setGeneratedFrames(frames);
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    normalizedCanvas,
    anchor,
    preset,
    frameCount,
    intensity,
    randomness,
    setIsProcessing,
    setProgress,
    setGeneratedFrames,
  ]);

  const handleDownloadPng = useCallback(
    async (frameIndex: number) => {
      const frame = generatedFrames[frameIndex];
      if (!frame || !preset) return;
      await downloadPng(frame, `${preset.id}_frame_${frameIndex + 1}`);
    },
    [generatedFrames, preset],
  );

  const handleDownloadZip = useCallback(async () => {
    if (!preset) return;
    await downloadZip(generatedFrames, preset.id);
  }, [generatedFrames, preset]);

  const canGenerate = normalizedCanvas && anchor && preset && !isProcessing;

  return (
    <div className="space-y-4">
      <h3 className="text-heading-sm font-semibold">フレーム生成</h3>

      {/* パラメータ設定 */}
      <div className="grid grid-cols-3 gap-3">
        {/* フレーム数 */}
        <div className="space-y-1">
          <label className="text-xs text-on-surface-variant">
            フレーム数: {frameCount}
          </label>
          <input
            type="range"
            min={2}
            max={5}
            value={frameCount}
            onChange={(e) => setFrameCount(Number(e.target.value))}
            className="w-full accent-primary"
            disabled={isProcessing}
          />
        </div>

        {/* 強度 */}
        <div className="space-y-1">
          <label className="text-xs text-on-surface-variant">
            強度: {intensity}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full accent-primary"
            disabled={isProcessing}
          />
        </div>

        {/* ランダム性 */}
        <div className="space-y-1">
          <label className="text-xs text-on-surface-variant">
            ランダム性: {randomness}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={randomness}
            onChange={(e) => setRandomness(Number(e.target.value))}
            className="w-full accent-primary"
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* 生成ボタン */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
        type="button"
      >
        {isProcessing
          ? `生成中... ${Math.round(progress * 100)}%`
          : "Generate"}
      </button>

      {/* プログレスバー */}
      {isProcessing && (
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* 生成結果 */}
      {generatedFrames.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">
              生成結果 ({generatedFrames.length} フレーム)
            </h4>
            <button
              onClick={handleDownloadZip}
              className="rounded-md bg-surface-container-high px-3 py-1 text-xs text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              type="button"
            >
              ZIP 一括ダウンロード
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {generatedFrames.map((frame) => (
              <div
                key={frame.id}
                className="group relative overflow-hidden rounded-lg border border-outline-variant"
              >
                <img
                  src={frame.dataUrl}
                  alt={`Frame ${frame.index + 1}`}
                  className="w-full"
                  style={{ aspectRatio: "16/9" }}
                />
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white font-mono">
                    #{frame.index + 1}
                  </span>
                  <button
                    onClick={() => handleDownloadPng(frame.index)}
                    className="rounded bg-white/20 px-2 py-0.5 text-xs text-white hover:bg-white/30 transition-colors"
                    type="button"
                  >
                    PNG
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}