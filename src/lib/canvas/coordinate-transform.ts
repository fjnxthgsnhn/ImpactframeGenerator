/**
 * 座標変換ユーティリティ
 *
 * 仕様書 8: 手動操作の座標は表示サイズではなく、
 * 内部的に 1920x1080 座標へ変換して保存する
 */

export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

/**
 * 表示座標 → 内部座標（1920x1080）への変換
 */
export function displayToInternal(
  displayX: number,
  displayY: number,
  displayWidth: number,
  displayHeight: number,
): { x: number; y: number } {
  return {
    x: (displayX / displayWidth) * CANVAS_WIDTH,
    y: (displayY / displayHeight) * CANVAS_HEIGHT,
  };
}

/**
 * 内部座標（1920x1080）→ 表示座標への変換
 */
export function internalToDisplay(
  internalX: number,
  internalY: number,
  displayWidth: number,
  displayHeight: number,
): { x: number; y: number } {
  return {
    x: (internalX / CANVAS_WIDTH) * displayWidth,
    y: (internalY / CANVAS_HEIGHT) * displayHeight,
  };
}