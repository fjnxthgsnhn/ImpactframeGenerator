/**
 * プリセット選択 UI
 */

import { useCallback } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { PRESETS, CATEGORY_LABELS } from "@/lib/presets/preset-definitions";
import type { PresetCategory } from "@/types";

export function PresetSelector() {
  const selectedPresetId = useAppStore((s) => s.selectedPresetId);
  const setSelectedPresetId = useAppStore((s) => s.setSelectedPresetId);
  const setAnchorMode = useAppStore((s) => s.setAnchorMode);

  const handleSelect = useCallback(
    (presetId: string) => {
      setSelectedPresetId(presetId);
      const preset = PRESETS.find((p) => p.id === presetId);
      if (preset) {
        setAnchorMode(preset.anchorMode);
      }
    },
    [setSelectedPresetId, setAnchorMode],
  );

  // カテゴリごとにグループ化
  const categories = new Map<PresetCategory, typeof PRESETS>();
  for (const preset of PRESETS) {
    const list = categories.get(preset.category) || [];
    list.push(preset);
    categories.set(preset.category, list);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-heading-sm font-semibold">プリセット選択</h3>
      <div className="space-y-3">
        {Array.from(categories.entries()).map(([category, presets]) => (
          <div key={category}>
            <h4 className="mb-1.5 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              {CATEGORY_LABELS[category] || category}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelect(preset.id)}
                  className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                    selectedPresetId === preset.id
                      ? "bg-primary-container text-on-primary-container ring-1 ring-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                  type="button"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}