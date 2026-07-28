import { DRGInputs, FloorLayout, BOQItem, AreaStatement } from "./types";

/**
 * Coordinated Quantity Surveyor Engine & Floor-wise Area Derivation:
 * Calculates actual planned floor areas directly from floor room geometry.
 */
export function calculateBOQAndAreas(
  inputs: DRGInputs,
  floors: FloorLayout[]
): { boq: BOQItem[]; areaStatement: AreaStatement } {
  const plotW = Math.max(10, inputs.plotWidth || 30);
  const plotL = Math.max(10, inputs.plotLength || 40);

  const sFront = inputs.setbacks?.front || 0;
  const sRear = inputs.setbacks?.rear || 0;
  const sLeft = inputs.setbacks?.left || 0;
  const sRight = inputs.setbacks?.right || 0;

  const buildW = Math.max(0, plotW - sLeft - sRight);
  const buildL = Math.max(0, plotL - sFront - sRear);

  const plotAreaSqft = plotW * plotL;
  const buildableEnvelopeSqft = buildW * buildL;
  const coverageLimitSqft = Math.round(plotAreaSqft * ((inputs.maxCoveragePercent || 75) / 100));

  // Footprint cap: min(Buildable Envelope, Coverage Limit)
  const groundCoverageSqft = Math.min(buildableEnvelopeSqft, coverageLimitSqft);
  const groundCoveragePercent = Number(((groundCoverageSqft / plotAreaSqft) * 100).toFixed(1));

  // Compute actual floor-wise areas derived directly from room geometry
  let stiltExemptAreaSqft = 0;
  let residentialBuaSqft = 0;

  floors.forEach((f) => {
    const floorRoomArea = f.rooms.reduce((sum, r) => sum + r.w * r.h, 0);
    // Add 15% for wall thickness & circulation corridor
    const floorConstructedArea = Math.round(floorRoomArea * 1.15);

    if (f.level === 0 && inputs.parking === "Full Parking") {
      const stiltRoom = f.rooms.find((r) => r.kind === "parking");
      stiltExemptAreaSqft = stiltRoom ? Math.round(stiltRoom.w * stiltRoom.h) : 384;
      // Remainder of ground floor (stair/lift core) counts towards construction
      residentialBuaSqft += Math.max(0, floorConstructedArea - stiltExemptAreaSqft);
    } else {
      residentialBuaSqft += floorConstructedArea;
    }
  });

  const grossConstructedAreaSqft = stiltExemptAreaSqft + residentialBuaSqft;
  const permittedTotalBUASqft = Math.round(plotAreaSqft * (inputs.farLimit || 1.75));
  const requiredTotalBUASqft = residentialBuaSqft;
  const buaBalanceSqft = permittedTotalBUASqft - requiredTotalBUASqft;
  const farAchieved = Number((residentialBuaSqft / plotAreaSqft).toFixed(2));

  const areaStatement: AreaStatement = {
    plotAreaSqft,
    buildableFootprintSqft: buildableEnvelopeSqft,
    groundCoverageSqft,
    groundCoveragePercent,
    totalBUASqft: grossConstructedAreaSqft,
    permittedTotalBUASqft,
    requiredTotalBUASqft,
    buaBalanceSqft,
    farAchieved,
    setbackAreaSqft: plotAreaSqft - buildableEnvelopeSqft,
    stiltExemptAreaSqft,
    residentialBuaSqft,
    grossConstructedAreaSqft,
  };

  // Coordinated Civil Quantities
  const totalFloorArea = grossConstructedAreaSqft;
  const steelKg = Math.round(totalFloorArea * 3.8); // 3.8 kg/sq.ft
  const cementBags = Math.round(totalFloorArea * 0.42); // 0.42 bags/sq.ft
  const sandCuft = Math.round(totalFloorArea * 1.25); // 1.25 cu.ft/sq.ft
  const aggregateCuft = Math.round(totalFloorArea * 1.35); // 1.35 cu.ft/sq.ft
  const bricksNos = Math.round(totalFloorArea * 18); // 18 bricks/sq.ft

  const boq: BOQItem[] = [
    { category: "Structure", item: "TMT Reinforcement Steel (Fe 550D)", qty: steelKg, unit: "kg", rate: 68, amount: steelKg * 68 },
    { category: "Structure", item: "PPC Cement (43/53 Grade)", qty: cementBags, unit: "bags", rate: 380, amount: cementBags * 380 },
    { category: "Masonry", item: "Red Clay Bricks / AAC Blocks", qty: bricksNos, unit: "nos", rate: 9, amount: bricksNos * 9 },
    { category: "Aggregates", item: "M-Sand Fine Aggregate", qty: sandCuft, unit: "cu.ft", rate: 55, amount: sandCuft * 55 },
    { category: "Aggregates", item: "20mm Coarse Aggregate", qty: aggregateCuft, unit: "cu.ft", rate: 48, amount: aggregateCuft * 48 },
    { category: "Finishes", item: "Vitrified Tile Flooring (600x600mm)", qty: Math.round(totalFloorArea * 0.8), unit: "sq.ft", rate: 120, amount: Math.round(totalFloorArea * 0.8) * 120 },
  ];

  return { boq, areaStatement };
}
