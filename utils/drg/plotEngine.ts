import { DRGInputs, Polygon2D, Point2D, Box2D, ExistingSiteFeature } from "./types";
import { polygonArea, polygonPerimeter, polygonBounds } from "./geometryEngine";

export type PlotAnalysisResult = {
  plotAreaSqft: number;
  perimeterFt: number;
  bounds: Box2D;
  polygon: Polygon2D;
  roadFrontageFt: number;
  facing: string;
  roadWidth: number;
  existingFeatures: ExistingSiteFeature[];
  isValidShape: boolean;
};

/**
 * Generates plot boundary polygon based on shape and dimensions
 */
export function generatePlotPolygon(inputs: DRGInputs): Polygon2D {
  const { plotWidth, plotLength, plotShape, customPolygon } = inputs;
  const w = Math.max(10, plotWidth);
  const l = Math.max(10, plotLength);

  if (plotShape === "Square") {
    const side = Math.max(w, l);
    return [
      { x: 0, y: 0 },
      { x: side, y: 0 },
      { x: side, y: side },
      { x: 0, y: side },
    ];
  }

  if (plotShape === "L-Shape") {
    const cutW = w * 0.4;
    const cutL = l * 0.4;
    return [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: w, y: l - cutL },
      { x: w - cutW, y: l - cutL },
      { x: w - cutW, y: l },
      { x: 0, y: l },
    ];
  }

  if (plotShape === "Trapezoid") {
    const topW = w * 0.85;
    return [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: (w + topW) / 2, y: l },
      { x: (w - topW) / 2, y: l },
    ];
  }

  if (plotShape === "Irregular" && customPolygon && customPolygon.length >= 3) {
    return customPolygon;
  }

  // Default Rectangle
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: l },
    { x: 0, y: l },
  ];
}

/**
 * Performs complete plot analysis
 */
export function analyzePlot(inputs: DRGInputs): PlotAnalysisResult {
  const polygon = generatePlotPolygon(inputs);
  const area = polygonArea(polygon);
  const perimeter = polygonPerimeter(polygon);
  const bounds = polygonBounds(polygon);

  return {
    plotAreaSqft: Math.round(area),
    perimeterFt: Math.round(perimeter),
    bounds,
    polygon,
    roadFrontageFt: inputs.plotWidth,
    facing: inputs.facing,
    roadWidth: inputs.roadWidth,
    existingFeatures: inputs.existingFeatures || [],
    isValidShape: area > 0,
  };
}
