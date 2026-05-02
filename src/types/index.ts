/** 出力サイズ（固定） */
export type OutputSize = {
  width: 1920;
  height: 1080;
};

/** エフェクト中心点の検出ソース */
export type AnchorSource =
  | "manual"
  | "face"
  | "person"
  | "object"
  | "foreground"
  | "center";

/** エフェクト中心点 */
export type EffectAnchor = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  confidence: number;
  source: AnchorSource;
};

/** アンカーモード */
export type AnchorMode =
  | "auto"
  | "face"
  | "person"
  | "object"
  | "foreground"
  | "manual"
  | "center";

/** エフェクトステップ */
export type EffectStep = {
  type: string;
  blend?: string;
  lineCount?: number;
  innerRadius?: number;
  outerRadius?: number;
  opacity?: number;
  jitter?: number;
  contrast?: number;
  saturation?: number;
  amount?: number;
  radius?: number;
  irregularity?: number;
  strokeWidth?: number;
  segments?: number;
  amplitude?: number;
  [key: string]: unknown;
};

/** プリセットカテゴリ */
export type PresetCategory =
  | "flash"
  | "battle"
  | "manga"
  | "horror"
  | "glitch"
  | "comedy"
  | "cinematic";

/** インパクトプリセット */
export type ImpactPreset = {
  id: string;
  name: string;
  category: PresetCategory;
  anchorMode: AnchorMode;
  effects: EffectStep[];
};

/** 生成フレーム */
export type GeneratedFrame = {
  id: string;
  index: number;
  imageBitmap: ImageBitmap | null;
  dataUrl: string;
};

/** 正規化情報 */
export type NormalizeInfo = {
  scale: number;
  offsetX: number;
  offsetY: number;
  resizedWidth: number;
  resizedHeight: number;
};

/** 画像入力状態 */
export type ImageInputState = {
  sourceImage: ImageBitmap | null;
  normalizedCanvas: OffscreenCanvas | null;
  previewDataUrl: string;
  normalizeInfo: NormalizeInfo | null;
};

/** アプリケーション全体の状態 */
export type AppState = {
  image: ImageInputState;
  anchor: EffectAnchor | null;
  anchorMode: AnchorMode;
  isAnchorLocked: boolean;
  selectedPresetId: string | null;
  frameCount: number;
  intensity: number;
  randomness: number;
  generatedFrames: GeneratedFrame[];
  isProcessing: boolean;
  progress: number;
};