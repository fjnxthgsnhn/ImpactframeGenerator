import { create } from "zustand";
import type {
  AppState,
  EffectAnchor,
  AnchorMode,
  GeneratedFrame,
  NormalizeInfo,
} from "@/types";

type AppActions = {
  setSourceImage: (image: ImageBitmap) => void;
  setNormalizedCanvas: (canvas: OffscreenCanvas) => void;
  setPreviewDataUrl: (dataUrl: string) => void;
  setNormalizeInfo: (info: NormalizeInfo) => void;
  setAnchor: (anchor: EffectAnchor) => void;
  setAnchorMode: (mode: AnchorMode) => void;
  setAnchorLocked: (locked: boolean) => void;
  setSelectedPresetId: (id: string | null) => void;
  setFrameCount: (count: number) => void;
  setIntensity: (value: number) => void;
  setRandomness: (value: number) => void;
  setGeneratedFrames: (frames: GeneratedFrame[]) => void;
  setIsProcessing: (processing: boolean) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
};

const initialState: AppState = {
  image: {
    sourceImage: null,
    normalizedCanvas: null,
    previewDataUrl: "",
    normalizeInfo: null,
  },
  anchor: null,
  anchorMode: "auto",
  isAnchorLocked: false,
  selectedPresetId: null,
  frameCount: 3,
  intensity: 50,
  randomness: 30,
  generatedFrames: [],
  isProcessing: false,
  progress: 0,
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,

  setSourceImage: (image) =>
    set((state) => ({
      image: { ...state.image, sourceImage: image },
    })),

  setNormalizedCanvas: (canvas) =>
    set((state) => ({
      image: { ...state.image, normalizedCanvas: canvas },
    })),

  setPreviewDataUrl: (dataUrl) =>
    set((state) => ({
      image: { ...state.image, previewDataUrl: dataUrl },
    })),

  setNormalizeInfo: (normalizeInfo) =>
    set((state) => ({
      image: { ...state.image, normalizeInfo },
    })),

  setAnchor: (anchor) => set({ anchor }),

  setAnchorMode: (anchorMode) => set({ anchorMode }),

  setAnchorLocked: (isAnchorLocked) => set({ isAnchorLocked }),

  setSelectedPresetId: (selectedPresetId) => set({ selectedPresetId }),

  setFrameCount: (frameCount) => set({ frameCount }),

  setIntensity: (intensity) => set({ intensity }),

  setRandomness: (randomness) => set({ randomness }),

  setGeneratedFrames: (generatedFrames) => set({ generatedFrames }),

  setIsProcessing: (isProcessing) => set({ isProcessing }),

  setProgress: (progress) => set({ progress }),

  reset: () => set(initialState),
}));