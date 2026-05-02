/**
 * 集中線エフェクト生成
 *
 * 仕様書 9.1, 9.2: 集中線
 *   中心点 = anchor
 *   線の始点 = 画面外周
 *   線の終点 = anchor周辺の円
 */

import { createSvgElement, pointOnCircle, jitter, SVG_NS } from "./svg-utils";
import type { RadialLinesParams, EffectAnchor } from "@/types";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

/**
 * 集中線 SVG を生成する
 */
export function generateRadialLines(
  anchor: EffectAnchor,
  params: RadialLinesParams,
): SVGSVGElement {
  const svg = createSvgElement("svg", {
    xmlns: SVG_NS,
    viewBox: `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  const group = createSvgElement("g", {
    opacity: params.opacity,
    stroke: params.color ?? "#ffffff",
    "stroke-width": params.strokeWidth ?? 1.5,
    "stroke-linecap": "round",
  });

  const { x: cx, y: cy } = anchor;
  const count = params.count;
  const innerR = params.innerRadius;
  const outerR = params.outerRadius;
  const jitterAmount = params.jitter;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;

    // 外側の点（画面外周方向）- ジッターを適用
    const outerAngle = angle + jitter(0, jitterAmount * 0.5);
    const outerPoint = pointOnCircle(cx, cy, outerR, outerAngle);

    // 内側の点（anchor周辺の円）- ジッターを適用
    const innerAngle = angle + jitter(0, jitterAmount * 0.3);
    const innerPoint = pointOnCircle(cx, cy, innerR, innerAngle);

    const line = createSvgElement("line", {
      x1: outerPoint.x,
      y1: outerPoint.y,
      x2: innerPoint.x,
      y2: innerPoint.y,
    });

    group.appendChild(line);
  }

  svg.appendChild(group);
  return svg;
}