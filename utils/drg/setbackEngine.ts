import { DRGInputs, Setbacks, Polygon2D, Box2D } from "./types";
import { generatePlotPolygon } from "./plotEngine";
import { polygonArea, polygonBounds } from "./geometryEngine";

export type SetbackAnalysisResult = {
  setbacks: Setbacks;
  buildablePolygon: Polygon2D;
  buildableBounds: Box2D;
  plotAreaSqft: number;
  setbackAreaSqft: number;
  buildableAreaSqft: number;
  coveragePercentAllowed: number;
  maxGroundCoverageSqft: number;
  farAllowed: number;
  maxTotalBUASqft: number;
  warnings: string[];
};

/**
 * Computes statutory/recommended setbacks based on plot size and road width
 */
export function calculateDefaultSetbacks(plotWidth: number, plotLength: number): Setbacks {
  const minDim = Math.min(plotWidth, plotLength);
  const area = plotWidth * plotLength;

  if (area <= 900) {
    // Compact plot (20x30, 20x40)
    return { front: 3.0, rear: 2.0, left: 2.0, right: 2.0 };
  } else if (area <= 1600) {
    // Medium plot (30x40, 30x50)
    return { front: 4.0, rear: 3.0, left: 3.0, right: 3.0 };
  } else if (area <= 2400) {
    // Standard plot (40x50, 40x60)
    return { front: 5.0, rear: 4.0, left: 4.0, right: 4.0 };
  } else {
    // Large plot (50x60, 50x80+)
    return { front: 8.0, rear: 5.0, left: 5.0, right: 5.0 };
  }
}

/**
 * Performs complete setback, ground coverage, and FAR analysis
 */
export function analyzeSetbacksAndBuildableArea(inputs: DRGInputs): SetbackAnalysisResult {
  const plotPoly = generatePlotPolygon(inputs);
  const plotAreaSqft = polygonArea(plotPoly);
  const plotBounds = polygonBounds(plotPoly);

  // User setbacks or fallback default
  const defaultS = calculateDefaultSetbacks(inputs.plotWidth, inputs.plotLength);
  const setbacks: Setbacks = {
    front: Number(inputs.setbacks?.front) || defaultS.front,
    rear: Number(inputs.setbacks?.rear) || defaultS.rear,
    left: Number(inputs.setbacks?.left) || defaultS.left,
    right: Number(inputs.setbacks?.right) || defaultS.right,
  };

  // Build buildable bounding box within plot bounds
  const x1 = Math.min(plotBounds.w, setbacks.left);
  const x2 = Math.max(x1, plotBounds.w - setbacks.right);
  const y1 = Math.min(plotBounds.h, setbacks.front);
  const y2 = Math.max(y1, plotBounds.h - setbacks.rear);

  const buildableBounds: Box2D = {
    x: x1,
    y: y1,
    w: Math.max(0, x2 - x1),
    h: Math.max(0, y2 - y1),
  };

  const buildablePolygon: Polygon2D = [
    { x: x1, y: y1 },
    { x: x2, y: y1 },
    { x: x2, y: y2 },
    { x: x1, y: y2 },
  ];

  const buildableAreaSqft = polygonArea(buildablePolygon);
  const setbackAreaSqft = Math.max(0, plotAreaSqft - buildableAreaSqft);

  // FAR & Coverage Limits
  const coveragePercentAllowed = inputs.maxCoveragePercent || (plotAreaSqft > 2400 ? 65 : 75);
  const maxGroundCoverageSqft = (plotAreaSqft * coveragePercentAllowed) / 100;

  const farAllowed = inputs.farLimit || (inputs.roadWidth >= 40 ? 2.25 : 1.75);
  const maxTotalBUASqft = plotAreaSqft * farAllowed;

  const warnings: string[] = [];
  if (buildableBounds.w < 12 || buildableBounds.h < 15) {
    warnings.push("Buildable width/length is narrow due to setback settings. Adjust setbacks for optimum room layout.");
  }
  if (buildableAreaSqft > maxGroundCoverageSqft) {
    warnings.push("Buildable footprint exceeds local maximum ground coverage rule.");
  }

  return {
    setbacks,
    buildablePolygon,
    buildableBounds,
    plotAreaSqft,
    setbackAreaSqft,
    buildableAreaSqft,
    coveragePercentAllowed,
    maxGroundCoverageSqft,
    farAllowed,
    maxTotalBUASqft,
    warnings,
  };
}
