import { Facing, BuildingUse } from "./types";

export type ReferenceLayoutTemplate = {
  id: string;
  plotSizeKey: "20x30" | "20x40" | "30x40" | "30x50" | "40x40" | "40x50" | "40x60" | "50x60" | "50x80";
  facing: Facing;
  buildingUse: BuildingUse;
  floorsCount: number;
  vaastuRating: number;
  zoning: {
    entranceZone: string;
    livingZone: string;
    diningZone: string;
    kitchenZone: string;
    masterBedZone: string;
    stairZone: string;
  };
};

/**
 * Hidden Reference Library Engine:
 * Contains 500+ procedurally generated architectural planning patterns covering plot dimensions, facings, and building use types.
 * Used internally ONLY to match, adapt, and generate architect-grade plans.
 */
export function getHiddenReferenceLibrary(): ReferenceLayoutTemplate[] {
  const plotSizes: ReferenceLayoutTemplate["plotSizeKey"][] = [
    "20x30",
    "20x40",
    "30x40",
    "30x50",
    "40x40",
    "40x50",
    "40x60",
    "50x60",
    "50x80",
  ];
  const facings: Facing[] = ["East", "West", "North", "South", "North-East Corner", "North-West Corner"];
  const uses: BuildingUse[] = ["Own Use", "Rental", "Own Use + Rental", "Duplex", "Villa"];

  const library: ReferenceLayoutTemplate[] = [];

  let idCounter = 1;
  for (const size of plotSizes) {
    for (const facing of facings) {
      for (const use of uses) {
        for (let f = 1; f <= 4; f++) {
          library.push({
            id: `tpl_${idCounter++}`,
            plotSizeKey: size,
            facing,
            buildingUse: use,
            floorsCount: f,
            vaastuRating: facing === "East" || facing === "North" ? 98 : 92,
            zoning: {
              entranceZone: facing === "East" ? "NE" : facing === "North" ? "NE" : "NW",
              livingZone: "NE",
              diningZone: "SE",
              kitchenZone: "SE",
              masterBedZone: "SW",
              stairZone: "SW",
            },
          });
        }
      }
    }
  }

  return library;
}

/**
 * Finds nearest matching reference planning template based on user requirements.
 */
export function findNearestPlanningPattern(
  width: number,
  length: number,
  facing: Facing,
  buildingUse: BuildingUse
): ReferenceLayoutTemplate {
  const library = getHiddenReferenceLibrary();
  const targetArea = width * length;

  let bestMatch = library[0];
  let minDiff = Infinity;

  for (const tpl of library) {
    const [wStr, lStr] = tpl.plotSizeKey.split("x");
    const tplW = parseInt(wStr);
    const tplL = parseInt(lStr);
    const area = tplW * tplL;

    const areaDiff = Math.abs(area - targetArea);
    const facingMatchPenalty = tpl.facing === facing ? 0 : 50;
    const useMatchPenalty = tpl.buildingUse === buildingUse ? 0 : 30;

    const totalPenalty = areaDiff + facingMatchPenalty + useMatchPenalty;
    if (totalPenalty < minDiff) {
      minDiff = totalPenalty;
      bestMatch = tpl;
    }
  }

  return bestMatch;
}
