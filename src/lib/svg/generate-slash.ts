/**
 * 斬撃エフェクト生成
 *
 * 仕様書 9.1: 斬撃
 *   中心点 = anchor
 *   角度 = プリセット指定または対象物の長辺方向
 */

import { createSvgElement, SVG_NS } from "./svg-utils";
import type { SlashParams, EffectAnchor } from "@/types";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

/**
 * 斬撃 SVG を生成する
 */
export function generateSlash(
  anchor: EffectAnchor,
  params: SlashParams,
): SVGSVGElement {
  const svg = createSvgElement("svg", {
    xmlns: SVG_NS,
    viewBox: `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  const { x: cx, y: cy } = anchor;
  const angle = params.angle; // ラジアン
  const halfLen = params.length / 2;

  // 斬撃の始点と終点を計算
  const x1 = cx - Math.cos(angle) * halfLen;
  const y1 = cy - Math.sin(angle) * halfLen;
  const x2 = cx + Math.cos(angle) * halfLen;
  const y2 = cy + Math.sin(angle) * halfLen;

  // メインの斬撃線
  const mainLine = createSvgElement("line", {
    x1,
    y1,
    x2,
    y2,
    stroke: params.color ?? "#ffffff",
    "stroke-width": params.strokeWidth,
    opacity: params.opacity,
    "stroke-linecap": "round",
  });

  svg.appendChild(mainLine);

  // 斬撃の軌跡エフェクト（複数の細い線）
  const trailCount = 5;
  const perpAngle = angle + Math.PI / 2;

  for (let i = 0; i < trailCount; i++) {
    const offset = (i - trailCount / 2) * (params.strokeWidth * 1.5);
    const trailX1 = x1 + Math.cos(perpAngle) * offset;
    const trailY1 = y1 + Math.sin(perpAngle) * offset;
    const trailX2 = x2 + Math.cos(perpAngle) * offset;
    const trailY2 = y2 + Math.sin(perpAngle) * offset;

    const trailLine = createSvgElement("line", {
      x1: trailX1,
      y1: trailY1,
      x2: trailX2,
      y2: trailY2,
      stroke: params.color ?? "#ffffff",
      "stroke-width": params.strokeWidth * 0.3,
      opacity: params.opacity * 0.4,
      "stroke-linecap": "round",
    });

    svg.appendChild(trailLine);
  }

  // 中心点のフラッシュ
  const flash = createSvgElement("circle", {
    cx,
    cy,
    r: params.strokeWidth * 2,
    fill: params.color ?? "#ffffff",
    opacity: params.opacity * 0.8,
  });

  svg.appendChild(flash);

  return svg;
}