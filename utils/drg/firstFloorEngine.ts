import {
  DRGInputs,
  Phase0AnalysisReport,
  StructuralPlanningReport,
  GroundFloorPlanningReport,
  GroundFloorStaircase,
  GroundFloorLift,
  Facing,
} from "./types";
import { generateCleanWallSegments } from "./wallEngine";

export type FirstFloorBalcony = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  projectionFt: number;
  railingType: "Glass" | "SS Railing" | "Parapet";
};

export type FirstFloorRoom = {
  id: string;
  name: string;
  dimText: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isMaster?: boolean;
  isKitchen?: boolean;
  isToilet?: boolean;
  isPooja?: boolean;
  isDining?: boolean;
  isLiving?: boolean;
  isUtility?: boolean;
  isStore?: boolean;
  isFoyer?: boolean;
};

export type FirstFloorPlanningReport = {
  projectInputs: {
    firstFloorUse: string;
    isDuplex: boolean;
    staircaseType: string;
    liftStatus: string;
    balconyPreference: string;
  };
  plotBoundary: { x: number; y: number; w: number; h: number };
  road: { facing: Facing; widthFt: number; label: string };
  setbacks: { front: number; rear: number; left: number; right: number };
  buildableEnvelope: { x: number; y: number; w: number; h: number };
  rooms: FirstFloorRoom[];
  walls: { id: string; x1: number; y1: number; x2: number; y2: number; thicknessInches: number; isExternal: boolean }[];
  doors: { id: string; label: string; x: number; y: number; widthFt: number; hinge: "left" | "right"; swingAngle: number; isMainDoor?: boolean }[];
  windows: { id: string; label: string; x: number; y: number; widthFt: number; orientation: "h" | "v"; isVentilator?: boolean }[];
  balconies: FirstFloorBalcony[];
  staircase: GroundFloorStaircase;
  lift?: GroundFloorLift;
  columns: { id: string; x: number; y: number; w: number; h: number; gridRef: string; footingType: string }[];
  areaSchedule: {
    totalGroundSqFt: number;
    builtUpSqFt: number;
    carpetAreaSqFt: number;
    balconyAreaSqFt: number;
    circulationAreaSqFt: number;
  };
};

export function analyzeFirstFloorPlanning(
  inputs: DRGInputs,
  phase0Report: Phase0AnalysisReport,
  structuralReport: StructuralPlanningReport,
  groundFloorReport: GroundFloorPlanningReport,
  floorLevel: number = 1
): FirstFloorPlanningReport {
  const plotW = Math.max(10, inputs.plotWidth || 30);
  const plotL = Math.max(10, inputs.plotLength || 40);

  const sFront = inputs.setbacks?.front || 0;
  const sRear = inputs.setbacks?.rear || 0;
  const sLeft = inputs.setbacks?.left || 0;
  const sRight = inputs.setbacks?.right || 0;

  const buildX = sLeft;
  const buildY = sFront;
  const buildW = Math.max(10, plotW - sLeft - sRight);
  const buildL = Math.max(10, plotL - sFront - sRear);

  const roadFacing: Facing = inputs.facing || "South";
  const roadWidthFt = inputs.roadWidth || 30;
  const roadLabel = `ROAD — ${roadWidthFt}′-0″ WIDE (${roadFacing.toUpperCase()} FACING)`;

  // STAIRCASE & LIFT CORES: 100% IDENTICAL POSITION ACROSS ALL FLOORS
  const staircase = groundFloorReport.staircase;
  const lift = groundFloorReport.lift;

  const scaleW = buildW / 30.0;
  const scaleL = buildL / 40.0;

  const bedW = 12.0 * scaleW;
  const bedH = 12.0 * scaleL;
  const toiW = 5.0 * scaleW;
  const toiH = 8.0 * scaleL;

  const kitW = 12.0 * scaleW;
  const kitH = 10.0 * scaleL;
  const utilW = 6.0 * scaleW;
  const utilH = 9.0 * scaleL;

  const livW = 15.0 * scaleW;
  const livH = 13.0 * scaleL;
  const dinW = (buildW - livW);
  const dinH = 10.0 * scaleL;

  let rooms: FirstFloorRoom[] = [];
  const doors: { id: string; label: string; x: number; y: number; widthFt: number; hinge: "left" | "right"; swingAngle: number; isMainDoor?: boolean }[] = [];
  const windows: { id: string; label: string; x: number; y: number; widthFt: number; orientation: "h" | "v"; isVentilator?: boolean }[] = [];
  const balconies: FirstFloorBalcony[] = [];

  if (floorLevel === 3 || inputs.terraceUse === "Open Terrace") {
    // TERRACE FLOOR PLAN
    rooms = [
      { id: "ter_gym", name: "GYM / MULTIPURPOSE ROOM", dimText: "12′-0″ × 12′-0″", x: buildX, y: buildY + buildL - bedH, w: bedW, h: bedH, isLiving: true },
      { id: "ter_toilet", name: "COMMON TOILET", dimText: "5′-0″ × 8′-0″", x: buildX + bedW, y: buildY + buildL - toiH, w: toiW, h: toiH, isToilet: true },
      { id: "ter_party", name: "PARTY HALL / OPEN LAWN (~300 SQ FT)", dimText: "OPEN TERRACE", x: buildX, y: buildY, w: buildW, h: buildL - bedH },
    ];

    doors.push({ id: "dr_gym", label: "D2 (3′-0″)", x: buildX + bedW / 2, y: buildY + buildL - bedH, widthFt: 3.0, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_ter_toi", label: "D4 (2′-6″)", x: buildX + bedW, y: buildY + buildL - toiH / 2, widthFt: 2.5, hinge: "left", swingAngle: 90 });
    windows.push({ id: "win_gym", label: "W1 (5′-0″)", x: buildX, y: buildY + buildL - bedH / 2, widthFt: 5.0, orientation: "v" });
    windows.push({ id: "win_ter_toi", label: "V1 VENT", x: buildX + bedW + toiW / 2, y: buildY + buildL, widthFt: 2.0, orientation: "h", isVentilator: true });
  } else {
    // FIRST FLOOR & UPPER FLOOR PLANS (EXACT MATCHING TARGET REFERENCE DRG)
    rooms = [
      // Top Row (Rear):
      { id: "ff_bed1", name: "BEDROOM 1", dimText: `${bedW.toFixed(0)}′-0″ × ${bedH.toFixed(0)}′-0″`, x: buildX, y: buildY + buildL - bedH, w: bedW, h: bedH, isMaster: true },
      { id: "ff_toi1", name: "TOILET", dimText: `${toiW.toFixed(0)}′-0″ × ${toiH.toFixed(0)}′-0″`, x: buildX + bedW, y: buildY + buildL - toiH, w: toiW, h: toiH, isToilet: true },

      // Middle Row:
      { id: "ff_kit", name: "KITCHEN", dimText: `${kitW.toFixed(0)}′-0″ × ${kitH.toFixed(0)}′-0″`, x: buildX, y: buildY + buildL - bedH - kitH, w: kitW, h: kitH, isKitchen: true },
      { id: "ff_util", name: "UTILITY", dimText: `${utilW.toFixed(0)}′-0″ × ${utilH.toFixed(0)}′-0″`, x: buildX + buildW - utilW, y: buildY + buildL - staircase.h - utilH, w: utilW, h: utilH, isUtility: true },

      // Bottom Row (Front):
      { id: "ff_liv", name: "LIVING ROOM", dimText: `${livW.toFixed(0)}′-0″ × ${livH.toFixed(0)}′-0″`, x: buildX, y: buildY, w: livW, h: livH, isLiving: true },
      { id: "ff_din", name: "DINING", dimText: `${dinW.toFixed(0)}′-0″ × ${dinH.toFixed(0)}′-0″`, x: buildX + livW, y: buildY, w: dinW, h: dinH, isDining: true },
    ];

    doors.push({ id: "dr_ff_main", label: "MAIN D1 (4′-0″)", x: buildX + livW / 2, y: buildY, widthFt: 4.0, hinge: "left", swingAngle: 90, isMainDoor: true });
    doors.push({ id: "dr_ff_kit", label: "KITCHEN D3 (3′-0″)", x: buildX + kitW / 2, y: buildY + livH, widthFt: 3.0, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_ff_util", label: "UTILITY D5 (2′-6″)", x: buildX + kitW, y: buildY + buildL - bedH - kitH / 2, widthFt: 2.5, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_ff_bed1", label: "D2 (3′-0″)", x: buildX + bedW / 2, y: buildY + buildL - bedH, widthFt: 3.0, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_ff_toi1", label: "TOILET D4 (2′-6″)", x: buildX + bedW, y: buildY + buildL - toiH / 2, widthFt: 2.5, hinge: "left", swingAngle: 90 });

    windows.push({ id: "win_ff_liv", label: "W1 (5′-0″)", x: buildX, y: buildY + livH / 2, widthFt: 5.0, orientation: "v" });
    windows.push({ id: "win_ff_din", label: "W2 (4′-6″)", x: buildX + buildW, y: buildY + dinH / 2, widthFt: 4.5, orientation: "v" });
    windows.push({ id: "win_ff_kit", label: "W3 (4′-0″)", x: buildX, y: buildY + buildL - bedH - kitH / 2, widthFt: 4.0, orientation: "v" });
    windows.push({ id: "win_ff_bed1", label: "W1 (5′-0″)", x: buildX + bedW / 2, y: buildY + buildL, widthFt: 5.0, orientation: "h" });
    windows.push({ id: "win_ff_toi1", label: "V1 VENT", x: buildX + bedW + toiW / 2, y: buildY + buildL, widthFt: 2.0, orientation: "h", isVentilator: true });
  }

  const rawWalls = generateCleanWallSegments(
    rooms.map((r) => ({ id: r.id, name: r.name, x: r.x, y: r.y, w: r.w, h: r.h, isMaster: false, isLiving: false, isKitchen: false, isToilet: false, doors: [], windows: [] })),
    { x: buildX, y: buildY, w: buildW, h: buildL }
  );

  const walls: { id: string; x1: number; y1: number; x2: number; y2: number; thicknessInches: number; isExternal: boolean }[] = rawWalls.map((w) => ({
    id: w.id,
    x1: w.x1,
    y1: w.y1,
    x2: w.x2,
    y2: w.y2,
    thicknessInches: w.isExternal ? 9 : 4.5,
    isExternal: w.isExternal,
  }));

  const carpetAreaSqFt = rooms.reduce((sum, r) => sum + r.w * r.h, 0);
  const balconyAreaSqFt = balconies.reduce((sum, b) => sum + b.w * b.h, 0);
  const circulationAreaSqFt = staircase.w * staircase.h + (lift ? lift.w * lift.h : 0);
  const builtUpSqFt = Math.round(carpetAreaSqFt + balconyAreaSqFt + circulationAreaSqFt);

  return {
    projectInputs: {
      firstFloorUse: floorLevel === 3 ? "Terrace Floor Plan" : "Upper Floor Target Reference DRG",
      isDuplex: true,
      staircaseType: staircase.type,
      liftStatus: lift ? `Lift Active (${lift.capacity})` : "No Elevator",
      balconyPreference: "Front Standing Sit-out (3 ft)",
    },
    plotBoundary: { x: 0, y: 0, w: plotW, h: plotL },
    road: { facing: roadFacing, widthFt: roadWidthFt, label: roadLabel },
    setbacks: { front: sFront, rear: sRear, left: sLeft, right: sRight },
    buildableEnvelope: { x: buildX, y: buildY, w: buildW, h: buildL },
    rooms,
    walls,
    doors,
    windows,
    balconies,
    staircase,
    lift,
    columns: groundFloorReport.columns,
    areaSchedule: {
      totalGroundSqFt: plotW * plotL,
      builtUpSqFt,
      carpetAreaSqFt,
      balconyAreaSqFt,
      circulationAreaSqFt,
    },
  };
}
