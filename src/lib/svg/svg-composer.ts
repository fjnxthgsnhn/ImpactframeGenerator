/**
 * SVG エフェクト合成ユーティリティ
 *
 * 複数の SVG エフェクトを一つの SVG に合成する
 */

import { createSvgElement, SVG_NS } from "./svg-utils";
import { generateRadialLines } from "./generate-radial-lines";
import { generateShockwave } from "./generate-shockwave";
import { generateSlash } from "./generate-slash";
import { generateLightning } from "./generate-lightning";
import type {
  EffectAnchor,
  SvgEffectParams,
  RadialLinesParams,
  ShockwaveParams,
  SlashParams,
  LightningParams,
} from "@/types";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

/**
 * 単一の SVG エフェクトを生成する
 */
export function generateSvgEffect(
  anchor: EffectAnchor,
  params: SvgEffectParams,
): SVGSVGElement {
  switch (params.type) {
    case "radial-lines":
      return generateRadialLines(anchor, params as RadialLinesParams);
    case "shockwave":
      return generateShockwave(anchor, params as ShockwaveParams);
    case "slash":
      return generateSlash(anchor, params as SlashParams);
    case "lightning":
      return generateLightning(anchor, params as LightningParams);
    default:
      throw new Error(`Unknown SVG effect type: ${(params as SvgEffectParams).type}`);
  }
}

/**
 * 複数の SVG エフェクトを合成する
 *
 * @param anchor 中心点
 * @param effects エフェクトパラメータの配列
 * @returns 合成された SVG 要素
 */
export function composeSvgEffects(
  anchor: EffectAnchor,
  effects: SvgEffectParams[],
): SVGSVGElement {
  const svg = createSvgElement("svg", {
    xmlns: SVG_NS,
    viewBox: `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  for (const effect of effects) {
    const effectSvg = generateSvgEffect(anchor, effect);
    // 生成された SVG の子要素をコピー
    while (effectSvg.firstChild) {
      svg.appendChild(effectSvg.firstChild);
    }
  }

  return svg;
}

/**
 * SVG 要素を Data URL に変換する
 */
export function svgToDataUrl(svgElement: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml,${encoded}`;
}