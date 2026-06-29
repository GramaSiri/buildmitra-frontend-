import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    const { plotW, plotL, roomCount, stairType, buildingType, terraceRoof } = req.body;
    
    const w = Number(plotW) || 30;
    const l = Number(plotL) || 40;
    const totalArea = w * l;

    // Auto UG Tank Volume Calculation
    const ugTankCapacity = buildingType === "Rental" ? totalArea * 6 : totalArea * 4;

    // Advanced Civil Engineering Schedules Matrix
    const footingSize = w > 35 ? "5.5 ft x 5.5 ft" : "4.5 ft x 4.5 ft";
    const columnSize = w > 35 ? "9 in x 15 in" : "9 in x 12 in";
    const reinforcement = w > 35 
      ? "4 Nos - 16mm + 2 Nos - 12mm Fe550 Main Bars | 8mm Stirrups @ 120mm c/c"
      : "4 Nos - 12mm Fe550 Main Bars | 8mm Stirrups @ 150mm c/c";

    const stairW = 6.0; const stairH = 18.0;
    const stairX = w - stairW; const stairY = l * 0.42;
    const liftW = 4.5; const liftH = 3.5;
    const liftX = w - liftW; const liftY = stairY - liftH;

    const leftW = w * 0.55; const rightW = w - leftW;
    const topH = l * 0.35; const midH = l * 0.35; const botH = l - topH - midH;

    // Re-assembling the complete dynamic layouts mapping grid
    const computedLayout = {
      ground: [
        { id: "g_park", name: buildingType === "Rental" ? "COMPACT PARKING AREA" : "PREMIUM VEHICLE PARKING", dimensions: stairX + " ft x " + l + " ft", x: 0, y: 0, w: stairX, h: l, color: "#fcfcfc" },
        { id: "g_toilet1", name: "TOILET 1\nCOMMON", dimensions: stairW + " ft x 6 ft", x: stairX, y: 0, w: stairW, h: 6.0 },
        { id: "g_staircase", name: stairType + "\nSTAIRCASE", dimensions: "6 ft x 18 ft", x: stairX, y: stairY, w: stairW, h: stairH, fixtures: [{ type: "stairwell" }] }
      ],
      first: [
        { id: "f_bedroom1", name: "BEDROOM 1", dimensions: leftW + " ft x " + topH + " ft", x: 0, y: 0, w: leftW, h: topH },
        { id: "f_toilet2", name: "TOILET 2", dimensions: "5 ft x " + topH + " ft", x: leftW, y: 0, w: 5.0, h: topH },
        { id: "f_kitchen", name: "VASTU KITCHEN", dimensions: (rightW - 5.0) + " ft x " + topH + " ft", x: leftW + 5.0, y: 0, w: rightW - 5.0, h: topH, fixtures: [{ type: "kitchen_platform" }] },
        { id: "f_living", name: "LIVING HALL ROOM", dimensions: leftW + " ft x " + midH + " ft", x: 0, y: topH, w: leftW, h: midH },
        { id: "f_dining", name: "DINING AREA", dimensions: (w - leftW - stairW) + " ft x " + midH + " ft", x: leftW, y: topH, w: w - leftW - stairW, h: midH },
        { id: "f_bedroom_bottom", name: "BEDROOM 2", dimensions: (w - stairW) + " ft x " + (botH - 4.0) + " ft", x: 0, y: topH + midH, w: w - stairW, h: botH - 4.0 },
        { id: "f_balcony", name: "BALCONY", dimensions: (w - stairW) + " ft x 4 ft", x: 0, y: l - 4.0, w: w - stairW, h: 4.0, color: "#f8fafc", fixtures: [{ type: "railing" }] },
        { id: "f_staircase", name: "INTERNAL\nSTAIRCASE", dimensions: "6 ft x 18 ft", x: stairX, y: stairY, w: stairW, h: stairH, fixtures: [{ type: "stairwell" }] }
      ],
      second: [
        { id: "s_bedroom2", name: "BEDROOM 3", dimensions: "12 ft x " + topH + " ft", x: 0, y: 0, w: 12.0, h: topH },
        { id: "s_bedroom3", name: "BEDROOM 4", dimensions: (w - 12.0 - stairW) + " ft x " + topH + " ft", x: 12.0, y: 0, w: w - 12.0 - stairW, h: topH },
        { id: "s_lounge", name: "FAMILY LOUNGE", dimensions: stairX + " ft x " + midH + " ft", x: 0, y: topH, w: stairX, h: midH },
        { id: "s_balcony_edge", name: "FRONT BALCONY DECK", dimensions: stairX + " ft x " + botH + " ft", x: 0, y: topH + midH, w: stairX, h: botH, color: "#f8fafc", fixtures: [{ type: "railing" }] },
        { id: "s_staircase", name: "INTERNAL\nSTAIRCASE", dimensions: "6 ft x 18 ft", x: stairX, y: stairY, w: stairW, h: stairH, fixtures: [{ type: "stairwell" }] }
      ],
      terrace: [
        { id: "t_roof", name: "OPEN ROOF TERRACE ACCESS AREA\n(" + terraceRoof + ")", dimensions: stairX + " ft x " + l + " ft", x: 0, y: 0, w: stairX, h: l, color: "#f1f5f9" },
        { id: "t_pantry", name: "ROOF PANTRY", dimensions: "5 ft x 10 ft", x: 0, y: 0, w: 5.0, h: 10.0, fixtures: [{ type: "kitchen_platform" }] },
        { id: "t_toilet", name: "ROOF TOILET", dimensions: "4.5 ft x 6 ft", x: liftX, y: 0, w: liftW, h: 6.0 },
        { id: "t_staircase", name: "TERRACE HEADROOM", dimensions: "6 ft x 18 ft", x: stairX, y: stairY, w: stairW, h: stairH, fixtures: [{ type: "stairwell" }] }
      ]
    };

    if (lift === "Yes") {
      computedLayout.ground.push({ id: "g_lift", name: "LIFT WELL", dimensions: "4.5' x 3.5'", x: liftX, y: liftY, w: liftW, h: liftH, color: "#fee2e2" });
      computedLayout.first.push({ id: "f_lift", name: "LIFT WELL", dimensions: "4.5' x 3.5'", x: liftX, y: liftY, w: liftW, h: liftH, color: "#fee2e2" });
      computedLayout.second.push({ id: "s_lift", name: "LIFT WELL", dimensions: "4.5' x 3.5'", x: liftX, y: liftY, w: liftW, h: liftH, color: "#fee2e2" });
      computedLayout.terrace.push({ id: "t_lift", name: "LIFT HEAD", dimensions: "4.5' x 3.5'", x: liftX, y: liftY, w: liftW, h: liftH, color: "#fee2e2" });
    }

    return res.status(200).json({
      success: true,
      footprint: totalArea + " Sq.Ft",
      ugTankCapacity: ugTankCapacity + " Liters",
      footingSize,
      columnSize,
      reinforcement,
      spanX: (w / 3).toFixed(1) + " ft",
      spanY: (l / 3).toFixed(1) + " ft",
      rooms: computedLayout
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
