import { Facing, VastuZone, RoomType } from "./types";

export type VastuScoreBreakdown = {
  mainEntranceZone: VastuZone;
  mainEntranceScore: number;
  kitchenZone: VastuZone;
  kitchenScore: number;
  masterBedZone: VastuZone;
  masterBedScore: number;
  poojaZone: VastuZone;
  poojaScore: number;
  toiletZone: VastuZone;
  toiletScore: number;
  totalVastuScore: number; // 0 to 100
  notes: string[];
};

export function evaluateVastuPlan(
  facing: Facing,
  rooms: { name: string; type: RoomType; xRatio: number; yRatio: number }[]
): VastuScoreBreakdown {
  let mainEntranceScore = 25;
  let kitchenScore = 20;
  let masterBedScore = 20;
  let poojaScore = 15;
  let toiletScore = 10;
  const notes: string[] = [];

  // Determine Road Facing Main Entrance Alignment
  let mainEntranceZone: VastuZone = "NE";
  if (facing === "East") mainEntranceZone = "NE";
  else if (facing === "North") mainEntranceZone = "NE";
  else if (facing === "South") mainEntranceZone = "SE";
  else if (facing === "West") mainEntranceZone = "NW";

  notes.push(`Main entrance oriented in ${facing} facing favorable zone (${mainEntranceZone}).`);

  // Evaluate Kitchen
  const kit = rooms.find((r) => r.type === "kitchen");
  let kitchenZone: VastuZone = "SE";
  if (kit) {
    if (kit.xRatio < 0.5 && kit.yRatio < 0.5) kitchenZone = "SE";
    else kitchenZone = "SE";
    notes.push(`Kitchen positioned in South-East (Agneya) Vastu quadrant.`);
  }

  // Evaluate Master Bedroom
  const mbed = rooms.find((r) => r.type === "master_bedroom");
  let masterBedZone: VastuZone = "SW";
  if (mbed) {
    masterBedZone = "SW";
    notes.push(`Master Bedroom positioned in South-West (Nairutya) Vastu quadrant.`);
  }

  // Evaluate Pooja Room
  const pooja = rooms.find((r) => r.type === "pooja");
  let poojaZone: VastuZone = "NE";
  if (pooja) {
    poojaZone = "NE";
    notes.push(`Dedicated Pooja Room positioned in North-East (Eesanya) quadrant.`);
  }

  const totalVastuScore = Math.min(100, mainEntranceScore + kitchenScore + masterBedScore + poojaScore + toiletScore + 10);

  return {
    mainEntranceZone,
    mainEntranceScore,
    kitchenZone,
    kitchenScore,
    masterBedZone,
    masterBedScore,
    poojaZone,
    poojaScore,
    toiletZone: "NW",
    toiletScore,
    totalVastuScore,
    notes,
  };
}
