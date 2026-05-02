/**
 * 稲妻エフェクト生成
 *
 * 仕様書 9.1, 9.2: 稲妻
 *   始点 = 画面端またはランダム位置
 *   終点 = anchor
 */

import {
  createSvgElement,
  randomPointOnRectPerimeter,
  randomRange,
  SVG_NS,
} from "./svg-utils";
import type { LightningParams, EffectAnchor } from "@/types";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

/**
 * 稲妻の折れ線パスを生成する
 */
function generateLightningPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  segments: number,
  amplitude: number,
): string {
  const points: { x: number; y: number }[] = [{ x: startX, y: startY }];

  const dx = endX - startX;
  const dy = endY - startY;
  const stepX = dx / segments;
  const stepY = dy / segments;

  // 進行方向に対する垂直方向
  const perpX = -dy;
  const perpY = dx;
  const perpLen = Math.sqrt(perpX * perpX + perpY * perpY) || 1;

  for (let i = 1; i < segments; i++) {
    const baseX = startX + stepX * i;
    const baseY = startY + stepY * i;

    // 垂直方向にランダムにずらす（振幅は徐々に小さく）
    const decay = 1 - (i / segments) * 0.5;
    const offset = randomRange(-amplitude, amplitude) * decay;
    const normX = (perpX / perpLen) * offset;
    const normY = (perpY / perpLen) * offset;

    points.push({
      x: baseX + normX,
      y: baseY + normY,
    });
  }

  points.push({ x: endX, y: endY });

  // パス文字列を構築
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }

  return d;
}

/**
 * 稲妻 SVG を生成する
 */
export function generateLightning(
  anchor: EffectAnchor,
  params: LightningParams,
): SVGSVGElement {
  const svg = createSvgElement("svg", {
    xmlns: SVG_NS,
    viewBox: `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  const { x: endX, y: endY } = anchor;

  // メインの稲妻（画面外周から）
  const start = randomPointOnRectPerimeter(CANVAS_WIDTH, CANVAS_HEIGHT);
  const mainPath = generateLightningPath(
    start.x,
    start.y,
    endX,
    endY,
    params.segments,
    params.amplitude,
  );

  const mainLine = createSvgElement("path", {
    d: mainPath,
    fill: "none",
    stroke: params.color ?? "#ffffcc",
    "stroke-width": params.strokeWidth,
    opacity: params.opacity,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });

  svg.appendChild(mainLine);

  // 分岐稲妻（2〜3本）
  const branchCount = Math.floor(randomRange(2, 4));
  for (let b = 0; b < branchCount; b++) {
    const branchStart = randomPointOnRectPerimeter(CANVAS_WIDTH, CANVAS_HEIGHT);
    const branchPath = generateLightningPath(
      branchStart.x,
      branchStart.y,
      endX,
      endY,
      Math.floor(params.segments * 0.6),
      params.amplitude * 0.5,
    );

    const branchLine = createSvgElement("path", {
      d: branchPath,
      fill: "none",
      stroke: params.color ?? "#ffffcc",
      "stroke-width": params.strokeWidth * 0.4,
      opacity: params.opacity * 0.5,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });

    svg.appendChild(branchLine);
  }

  // 終点のグロー
  const glow = createSvgElement("circle", {
    cx: endX,
    cy: endY,
    r: params.strokeWidth * 3,
    fill: params.color ?? "#ffffcc",
    opacity: params.opacity * 0.7,
  });

  svg.appendChild(glow);

  return svg;
}