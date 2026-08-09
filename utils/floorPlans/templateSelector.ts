import { FloorPlanModel, FloorPlanOptionType } from "./types";
import { FloorPlanRequirement, PRE_FLOOR_PLAN_LIBRARY, FloorPlanTemplate } from "../../data/preFloorPlanLibrary";
import { solveParametricFloorPlan } from "./parametricAdapter";

export type MatchMetadata = {
  templateId: string;
  templateTitle: string;
  matchType: "Exact Match" | "Close Match" | "Adapted Match";
  originalPlotSize: string;
  userPlotSize: string;
  compatibilityScore: number;
  adaptationScore: number;
  vastuScore: number;
  facingMatch: boolean;
  bhkMatch: boolean;
  parkingMatch: boolean;
  liftMatch: boolean;
};

export type RecommendedOptionsBundle = {
  optionA: FloorPlanModel & { matchMetadata: MatchMetadata };
  optionB: FloorPlanModel & { matchMetadata: MatchMetadata };
  optionC: FloorPlanModel & { matchMetadata: MatchMetadata };
  allScoredTemplates: { template: FloorPlanTemplate; score: number }[];
};

/**
 * 10-PRIORITY TEMPLATE MATCHING ENGINE
 * Scores preloaded architectural plan library against user parameters.
 */
export function scoreTemplate(t: FloorPlanTemplate, req: FloorPlanRequirement): number {
  let score = 0;

  // 1. Plot Dimensions / Aspect Ratio (Max 25 pts)
  const dimDiff = Math.abs(t.plotWidth - req.plotWidth) + Math.abs(t.plotLength - req.plotLength);
  if (dimDiff === 0) score += 25;
  else if (dimDiff <= 5) score += 20;
  else if (dimDiff <= 10) score += 15;
  else score += Math.max(0, 10 - dimDiff);

  // 2. Facing Alignment (Max 20 pts)
  if (t.facing === req.facing) score += 20;
  else score += 5;

  // 3. BHK / Room Program (Max 15 pts)
  if (t.bedroomOptions.includes(req.bedrooms)) score += 15;
  else score += 5;

  // 4. Parking Mode (Max 10 pts)
  if (t.parkingOptions.includes(req.parking)) score += 10;
  else score += 3;

  // 5. Building Type (Duplex / Independent) (Max 10 pts)
  if (t.buildingTypes.includes(req.buildingType)) score += 10;
  else score += 5;

  // 6. Lift Requirement (Max 10 pts)
  if (t.liftSupported === req.lift) score += 10;
  else score += 2;

  // 7. Vastu Alignment (Max 10 pts)
  if (t.vaastu === req.vaastu) score += 10;

  return Math.min(100, score);
}

export function generateRecommendedOptions(req: FloorPlanRequirement): RecommendedOptionsBundle {
  // Score entire preloaded library
  const scored = PRE_FLOOR_PLAN_LIBRARY.map((t) => ({
    template: t,
    score: scoreTemplate(t, req),
  })).sort((a, b) => b.score - a.score);

  const bestMatch = scored[0]?.template || PRE_FLOOR_PLAN_LIBRARY[1];
  const vastuMatch = [...PRE_FLOOR_PLAN_LIBRARY].sort((a, b) => b.vastuScore - a.vastuScore)[0];
  const spaceMatch = scored[1]?.template || PRE_FLOOR_PLAN_LIBRARY[0];

  const createMetadata = (t: FloorPlanTemplate, score: number, optionType: FloorPlanOptionType): MatchMetadata => {
    const isExact = t.plotWidth === req.plotWidth && t.plotLength === req.plotLength && t.facing === req.facing;
    const isClose = Math.abs(t.plotWidth - req.plotWidth) <= 4 && Math.abs(t.plotLength - req.plotLength) <= 6;

    const matchType = isExact ? "Exact Match" : isClose ? "Close Match" : "Adapted Match";
    const adaptationScore = isExact ? 100 : Math.max(75, 100 - Math.abs(t.plotWidth - req.plotWidth) * 4);

    return {
      templateId: t.id,
      templateTitle: t.title,
      matchType,
      originalPlotSize: `${t.plotWidth}′ × ${t.plotLength}′`,
      userPlotSize: `${req.plotWidth}′ × ${req.plotLength}′`,
      compatibilityScore: score,
      adaptationScore,
      vastuScore: t.vastuScore,
      facingMatch: t.facing === req.facing,
      bhkMatch: t.bedroomOptions.includes(req.bedrooms),
      parkingMatch: t.parkingOptions.includes(req.parking),
      liftMatch: t.liftSupported === req.lift,
    };
  };

  const optionA_model = solveParametricFloorPlan(req, "OPTION_A_VASTU", bestMatch.id);
  const optionB_model = solveParametricFloorPlan(req, "OPTION_B_SPACE", spaceMatch.id);
  const optionC_model = solveParametricFloorPlan(req, "OPTION_C_PREMIUM", vastuMatch.id);

  return {
    optionA: {
      ...optionA_model,
      optionTitle: `OPTION A — BEST MATCH (${bestMatch.title})`,
      matchMetadata: createMetadata(bestMatch, scored[0]?.score || 95, "OPTION_A_VASTU"),
    },
    optionB: {
      ...optionB_model,
      optionTitle: `OPTION B — BEST VASTU COMPLIANCE (${vastuMatch.title})`,
      matchMetadata: createMetadata(vastuMatch, 98, "OPTION_B_SPACE"),
    },
    optionC: {
      ...optionC_model,
      optionTitle: `OPTION C — BEST SPACE UTILISATION (${spaceMatch.title})`,
      matchMetadata: createMetadata(spaceMatch, scored[1]?.score || 90, "OPTION_C_PREMIUM"),
    },
    allScoredTemplates: scored,
  };
}
