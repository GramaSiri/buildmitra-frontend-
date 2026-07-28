import { DRGInputs, FloorLayout } from "./types";

export type SectionLevel = {
  name: string;
  elevationFt: number;
  slabThicknessIn: number;
  beamDepthIn: number;
  clearHeightFt: number;
};

/**
 * Generates longitudinal & cross section specs (floor levels, foundation, slab, beam, parapet)
 */
export function generateBuildingSection(
  inputs: DRGInputs,
  floors: FloorLayout[]
): {
  levels: SectionLevel[];
  foundationDepthFt: number;
  plinthHeightFt: number;
  stairRiserIn: number;
  stairTreadIn: number;
} {
  const floorsCount = Math.max(1, inputs.floors);
  const levels: SectionLevel[] = [];

  // Plinth Level
  levels.push({
    name: "PLINTH LEVEL (±0.00)",
    elevationFt: 2.5,
    slabThicknessIn: 5,
    beamDepthIn: 18,
    clearHeightFt: 10,
  });

  for (let i = 1; i <= floorsCount; i++) {
    levels.push({
      name: i === 1 ? "FIRST FLOOR LEVEL (+10.00')" : `FLOOR LEVEL ${i} (+${i * 10}.00')`,
      elevationFt: 2.5 + i * 10,
      slabThicknessIn: 5,
      beamDepthIn: 18,
      clearHeightFt: 9.5,
    });
  }

  // Terrace Parapet Level
  levels.push({
    name: "TERRACE PARAPET TOP",
    elevationFt: 2.5 + floorsCount * 10 + 3.5,
    slabThicknessIn: 4,
    beamDepthIn: 12,
    clearHeightFt: 3.5,
  });

  return {
    levels,
    foundationDepthFt: 6.0,
    plinthHeightFt: 2.5,
    stairRiserIn: 6.0,
    stairTreadIn: 10.0,
  };
}
