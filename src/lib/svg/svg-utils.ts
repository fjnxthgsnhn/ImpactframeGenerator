/**
 * SVG ユーティリティ
 *
 * SVG 要素の生成・操作の共通関数
 */

export const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * SVG 要素を作成する
 */
export function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tagName: K,
  attributes: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tagName);
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, String(value));
  }
  return el;
}

/**
 * 角度をラジアンに変換
 */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * 2点間の距離
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 2点間の角度（ラジアン）
 */
export function angleBetween(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * 指定範囲のランダムな数値
 */
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * ジッター（揺らぎ）を適用
 */
export function jitter(value: number, amount: number): number {
  return value + (Math.random() - 0.5) * amount * 2;
}

/**
 * 円周上の点を計算
 */
export function pointOnCircle(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

/**
 * 矩形の外周上のランダムな点を計算
 */
export function randomPointOnRectPerimeter(
  width: number,
  height: number,
): { x: number; y: number } {
  const perimeter = 2 * (width + height);
  let pos = Math.random() * perimeter;

  // 上辺
  if (pos < width) return { x: pos, y: 0 };
  pos -= width;
  // 右辺
  if (pos < height) return { x: width, y: pos };
  pos -= height;
  // 下辺
  if (pos < width) return { x: pos, y: height };
  pos -= width;
  // 左辺
  return { x: 0, y: pos };
}