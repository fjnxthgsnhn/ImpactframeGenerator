/**
 * プリセット定義
 *
 * 仕様書 12: インパクトフレーム種類（全30種）
 */

import type { ImpactPreset } from "@/types";

export const PRESETS: ImpactPreset[] = [
  // 1. White Flash
  {
    id: "white_flash",
    name: "White Flash",
    category: "flash",
    anchorMode: "center",
    effects: [
      { type: "colorAdjust", contrast: 1.3, saturation: 0.7 },
      { type: "whiteFlash", amount: 0.6 },
    ],
  },
  // 2. Black Flash
  {
    id: "black_flash",
    name: "Black Flash",
    category: "flash",
    anchorMode: "center",
    effects: [
      { type: "colorAdjust", contrast: 1.5, saturation: 0.5 },
      { type: "blackFlash", amount: 0.7 },
    ],
  },
  // 3. Negative Invert
  {
    id: "negative_invert",
    name: "Negative Invert",
    category: "glitch",
    anchorMode: "center",
    effects: [
      { type: "negativeInvert", amount: 1.0 },
    ],
  },
  // 4. Target Speed Lines
  {
    id: "target_speed_lines",
    name: "Target Speed Lines",
    category: "battle",
    anchorMode: "auto",
    effects: [
      { type: "colorAdjust", contrast: 1.4, saturation: 0.8 },
      {
        type: "svgRadialLines",
        lineCount: 180,
        innerRadius: 80,
        outerRadius: 1600,
        opacity: 0.85,
        jitter: 0.25,
      },
      { type: "whiteFlash", amount: 0.18 },
    ],
  },
  // 5. Radial Shockwave
  {
    id: "radial_shockwave",
    name: "Radial Shockwave",
    category: "battle",
    anchorMode: "auto",
    effects: [
      { type: "colorAdjust", contrast: 1.3, saturation: 0.9 },
      {
        type: "svgShockwave",
        radius: 220,
        irregularity: 0.25,
        strokeWidth: 12,
        opacity: 0.9,
      },
      { type: "whiteFlash", amount: 0.15 },
    ],
  },
  // 6. Slash Impact
  {
    id: "slash_impact",
    name: "Slash Impact",
    category: "battle",
    anchorMode: "auto",
    effects: [
      { type: "colorAdjust", contrast: 1.5, saturation: 0.6 },
      {
        type: "svgSlash",
        angle: 0.78,
        length: 1600,
        strokeWidth: 8,
        opacity: 0.9,
      },
      { type: "whiteFlash", amount: 0.25 },
    ],
  },
  // 7. Lightning Strike
  {
    id: "lightning_strike",
    name: "Lightning Strike",
    category: "battle",
    anchorMode: "auto",
    effects: [
      { type: "colorAdjust", contrast: 1.4, saturation: 0.7 },
      {
        type: "svgLightning",
        segments: 12,
        amplitude: 35,
        strokeWidth: 4,
        opacity: 0.9,
      },
      { type: "whiteFlash", amount: 0.2 },
    ],
  },
  // 8. Manga Shadow
  {
    id: "manga_shadow",
    name: "Manga Shadow",
    category: "manga",
    anchorMode: "face",
    effects: [
      { type: "colorAdjust", contrast: 1.8, saturation: 0.3 },
      { type: "blackFlash", amount: 0.3 },
    ],
  },
  // 9. Heavy Ink
  {
    id: "heavy_ink",
    name: "Heavy Ink",
    category: "manga",
    anchorMode: "face",
    effects: [
      { type: "colorAdjust", contrast: 2.0, saturation: 0.0 },
      { type: "noise", amount: 0.08 },
    ],
  },
  // 10. Screentone Burst
  {
    id: "screentone_burst",
    name: "Screentone Burst",
    category: "manga",
    anchorMode: "center",
    effects: [
      { type: "colorAdjust", contrast: 1.6, saturation: 0.2 },
      {
        type: "svgRadialLines",
        lineCount: 240,
        innerRadius: 60,
        outerRadius: 1800,
        opacity: 0.6,
        jitter: 0.15,
      },
    ],
  },
  // 11. Halftone Comic
  {
    id: "halftone_comic",
    name: "Halftone Comic",
    category: "manga",
    anchorMode: "center",
    effects: [
      { type: "colorAdjust", contrast: 1.8, saturation: 0.4 },
      { type: "noise", amount: 0.05 },
    ],
  },
  // 12. Red Black Impact
  {
    id: "red_black_impact",
    name: "Red Black Impact",
    category: "battle",
    anchorMode: "auto",
    effects: [
      { type: "redBlackImpact", amount: 0.7 },
      {
        type: "svgRadialLines",
        lineCount: 200,
        innerRadius: 100,
        outerRadius: 1700,
        opacity: 0.7,
        jitter: 0.3,
      },
    ],
  },
  // 13. Blue Electric
  {
    id: "blue_electric",
    name: "Blue Electric",
    category: "battle",
    anchorMode: "auto",
    effects: [
      { type: "colorAdjust", contrast: 1.3, saturation: 1.5 },
      {
        type: "svgLightning",
        segments: 16,
        amplitude: 50,
        strokeWidth: 3,
        opacity: 0.85,
      },
      { type: "whiteFlash", amount: 0.1 },
    ],
  },
  // 14. Golden Awakening
  {
    id: "golden_awakening",
    name: "Golden Awakening",
    category: "cinematic",
    anchorMode: "person",
    effects: [
      { type: "colorAdjust", contrast: 1.2, saturation: 1.3 },
      { type: "whiteFlash", amount: 0.3 },
      {
        type: "svgShockwave",
        radius: 180,
        irregularity: 0.15,
        strokeWidth: 10,
        opacity: 0.7,
      },
    ],
  },
  // 15. Glitch Crash
  {
    id: "glitch_crash",
    name: "Glitch Crash",
    category: "glitch",
    anchorMode: "center",
    effects: [
      { type: "colorAdjust", contrast: 1.5, saturation: 1.2 },
      { type: "rgbShift", amount: 6 },
      { type: "noise", amount: 0.1 },
    ],
  },
  // 16. RGB Split
  {
    id: "rgb_split",
    name: "RGB Split",
    category: "glitch",
    anchorMode: "center",
    effects: [
      { type: "colorAdjust", contrast: 1.3, saturation: 1.1 },
      { type: "rgbShift", amount: 8 },
    ],
  },
  // 17. VHS Noise
  {
    id: "vhs_noise",
    name: "VHS Noise",
    category: "glitch",
    anchorMode: "center",
    effects: [
      { type: "colorAdjust", contrast: 1.2, saturation: 0.8 },
      { type: "noise", amount: 0.15 },
      { type: "rgbShift", amount: 3 },
    ],
  },
  // 18. Horror Red Focus
  {
    id: "horror_red_focus",
    name: "Horror Red Focus",
    category: "horror",
    anchorMode: "face",
    effects: [
      { type: "redBlackImpact", amount: 0.8 },
      { type: "blur", amount: 2 },
      {
        type: "svgRadialLines",
        lineCount: 120,
        innerRadius: 120,
        outerRadius: 1500,
        opacity: 0.5,
        jitter: 0.2,
      },
    ],
  },
  // 19. Ghost Afterimage
  {
    id: "ghost_afterimage",
    name: "Ghost Afterimage",
    category: "horror",
    anchorMode: "person",
    effects: [
      { type: "colorAdjust", contrast: 0.8, saturation: 0.3 },
      { type: "blur", amount: 4 },
      { type: "whiteFlash", amount: 0.15 },
    ],
  },
  // 20. Double Exposure
  {
    id: "double_exposure",
    name: "Double Exposure",
    category: "cinematic",
    anchorMode: "person",
    effects: [
      { type: "colorAdjust", contrast: 1.4, saturation: 0.5 },
      { type: "blur", amount: 1 },
      { type: "whiteFlash", amount: 0.2 },
    ],
  },
  // 21. Flame Burst
  {
    id: "flame_burst",
    name: "Flame Burst",
    category: "battle",
    anchorMode: "person",
    effects: [
      { type: "redBlackImpact", amount: 0.5 },
      {
        type: "svgShockwave",
        radius: 200,
        irregularity: 0.35,
        strokeWidth: 14,
        opacity: 0.8,
      },
      { type: "whiteFlash", amount: 0.3 },
    ],
  },
  // 22. Smoke Impact
  {
    id: "smoke_impact",
    name: "Smoke Impact",
    category: "battle",
    anchorMode: "auto",
    effects: [
      { type: "colorAdjust", contrast: 0.9, saturation: 0.2 },
      { type: "blur", amount: 3 },
      { type: "noise", amount: 0.06 },
    ],
  },
  // 23. Frozen Blue
  {
    id: "frozen_blue",
    name: "Frozen Blue",
    category: "battle",
    anchorMode: "person",
    effects: [
      { type: "colorAdjust", contrast: 1.2, saturation: 0.4 },
      { type: "whiteFlash", amount: 0.25 },
      {
        type: "svgShockwave",
        radius: 160,
        irregularity: 0.2,
        strokeWidth: 8,
        opacity: 0.6,
      },
    ],
  },
  // 24. Edge Burst
  {
    id: "edge_burst",
    name: "Edge Burst",
    category: "battle",
    anchorMode: "object",
    effects: [
      { type: "colorAdjust", contrast: 1.6, saturation: 0.9 },
      {
        type: "svgRadialLines",
        lineCount: 150,
        innerRadius: 90,
        outerRadius: 1400,
        opacity: 0.8,
        jitter: 0.35,
      },
    ],
  },
  // 25. Comedy Shock Mark
  {
    id: "comedy_shock_mark",
    name: "Comedy Shock Mark",
    category: "comedy",
    anchorMode: "face",
    effects: [
      { type: "colorAdjust", contrast: 1.3, saturation: 1.1 },
      {
        type: "svgShockwave",
        radius: 140,
        irregularity: 0.3,
        strokeWidth: 6,
        opacity: 0.7,
      },
      { type: "whiteFlash", amount: 0.1 },
    ],
  },
  // 26. Sweat Panic Mark
  {
    id: "sweat_panic_mark",
    name: "Sweat Panic Mark",
    category: "comedy",
    anchorMode: "face",
    effects: [
      { type: "colorAdjust", contrast: 1.1, saturation: 0.9 },
      { type: "blur", amount: 1 },
      { type: "whiteFlash", amount: 0.08 },
    ],
  },
  // 27. Eye Focus Lines
  {
    id: "eye_focus_lines",
    name: "Eye Focus Lines",
    category: "manga",
    anchorMode: "face",
    effects: [
      { type: "colorAdjust", contrast: 1.5, saturation: 0.6 },
      {
        type: "svgRadialLines",
        lineCount: 90,
        innerRadius: 40,
        outerRadius: 900,
        opacity: 0.9,
        jitter: 0.1,
      },
    ],
  },
  // 28. Explosion Debris
  {
    id: "explosion_debris",
    name: "Explosion Debris",
    category: "battle",
    anchorMode: "object",
    effects: [
      { type: "colorAdjust", contrast: 1.4, saturation: 0.8 },
      { type: "noise", amount: 0.12 },
      {
        type: "svgShockwave",
        radius: 250,
        irregularity: 0.4,
        strokeWidth: 16,
        opacity: 0.85,
      },
      { type: "whiteFlash", amount: 0.35 },
    ],
  },
  // 29. Paint Smear
  {
    id: "paint_smear",
    name: "Paint Smear",
    category: "cinematic",
    anchorMode: "person",
    effects: [
      { type: "colorAdjust", contrast: 1.3, saturation: 1.4 },
      { type: "blur", amount: 2 },
      { type: "rgbShift", amount: 4 },
    ],
  },
  // 30. Final Blow Frame
  {
    id: "final_blow_frame",
    name: "Final Blow Frame",
    category: "battle",
    anchorMode: "auto",
    effects: [
      { type: "colorAdjust", contrast: 1.8, saturation: 0.4 },
      { type: "whiteFlash", amount: 0.4 },
      {
        type: "svgRadialLines",
        lineCount: 240,
        innerRadius: 50,
        outerRadius: 2000,
        opacity: 0.95,
        jitter: 0.4,
      },
      {
        type: "svgShockwave",
        radius: 280,
        irregularity: 0.3,
        strokeWidth: 18,
        opacity: 0.9,
      },
      { type: "noise", amount: 0.08 },
    ],
  },
];

/**
 * カテゴリ名の日本語表示
 */
export const CATEGORY_LABELS: Record<string, string> = {
  flash: "フラッシュ",
  battle: "バトル",
  manga: "漫画",
  horror: "ホラー",
  glitch: "グリッチ",
  comedy: "コメディ",
  cinematic: "シネマティック",
};