/**
 * 衝撃波エフェクト生成
 *
 * 仕様書 9.1, 9.2: 衝撃波
 *   中心点 = anchor
 *   円形リング = anchorを中心に拡大
 */

import { createSvgElement, SVG_NS } from "./svg-utils";
import type { ShockwaveParams, EffectAnchor } from "@/types";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

/**
 * 不規則な円形パスを生成する
 */
function generateIrregularCirclePath(
  cx: number,
  cy: number,
  radius: number,
  irregularity: number,
  numPoints: number = 60,
): string {
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // 不規則性を適用した半径
    const r = radius + (Math.random() - 0.5) * irregularity * radius * 2;
    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }

  // パス文字列を構築
  const first = points[0];
  let d = `M ${first.x} ${first.y}`;

  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  d += " Z"; // 閉じる

  return d;
}

/**
 * 衝撃波 SVG を生成する
 */
export function generateShockwave(
  anchor: EffectAnchor,
  params: ShockwaveParams,
): SVGSVGElement {
  const svg = createSvgElement("svg", {
    xmlns: SVG_NS,
    viewBox: `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  const { x: cx, y: cy } = anchor;

  // メインの衝撃波リング
  const path = createSvgElement("path", {
    d: generateIrregularCirclePath(cx, cy, params.radius, params.irregularity),
    fill: "none",
    stroke: params.color ?? "#ffffff",
    "stroke-width": params.strokeWidth,
    opacity: params.opacity,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });

  svg.appendChild(path);

  // 内側の小さなリング（二重構造）
  if (params.radius > 60) {
    const innerPath = createSvgElement("path", {
      d: generateIrregularCirclePath(
        cx,
        cy,
        params.radius * 0.6,
        params.irregularity * 1.2,
      ),
      fill: "none",
      stroke: params.color ?? "#ffffff",
      "stroke-width": params.strokeWidth * 0.6,
      opacity: params.opacity * 0.5,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    svg.appendChild(innerPath);
  }

  return svg;
}