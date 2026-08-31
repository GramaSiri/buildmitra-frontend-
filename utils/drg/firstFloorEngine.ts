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
  } else if (floorLevel === 2) {
    // SECOND FLOOR: PRIVATE BEDROOM FLOOR (4 BEDROOMS + 4 ATTACHED TOILETS + FAMILY LOUNGE + BALCONIES)
    const roomW = (buildW - staircase.w) / 2;
    const roomH = buildL / 2;

    rooms = [
      { id: "sf_bed1", name: "BEDROOM 1 (SW MASTER)", dimText: `${roomW.toFixed(0)}′-0″ × ${roomH.toFixed(0)}′-0″`, x: buildX, y: buildY + buildL - roomH, w: roomW, h: roomH, isMaster: true },
      { id: "sf_toi1", name: "TOILET 1", dimText: "5′-0″ × 7′-0″", x: buildX + roomW - 5, y: buildY + buildL - roomH, w: 5, h: 7, isToilet: true },

      { id: "sf_bed2", name: "BEDROOM 2 (NW)", dimText: `${roomW.toFixed(0)}′-0″ × ${roomH.toFixed(0)}′-0″`, x: buildX, y: buildY, w: roomW, h: roomH },
      { id: "sf_toi2", name: "TOILET 2", dimText: "5′-0″ × 7′-0″", x: buildX + roomW - 5, y: buildY, w: 5, h: 7, isToilet: true },

      { id: "sf_bed3", name: "BEDROOM 3 (NE)", dimText: `${(buildW - roomW - staircase.w).toFixed(0)}′-0″ × ${roomH.toFixed(0)}′-0″`, x: buildX + roomW, y: buildY, w: buildW - roomW - staircase.w, h: roomH },
      { id: "sf_toi3", name: "TOILET 3", dimText: "5′-0″ × 7′-0″", x: buildX + roomW, y: buildY + roomH - 7, w: 5, h: 7, isToilet: true },

      { id: "sf_bed4", name: "BEDROOM 4 (SE)", dimText: `${(buildW - roomW - staircase.w).toFixed(0)}′-0″ × ${roomH.toFixed(0)}′-0″`, x: buildX + roomW, y: buildY + buildL - roomH, w: buildW - roomW - staircase.w, h: roomH },
      { id: "sf_toi4", name: "TOILET 4", dimText: "5′-0″ × 7′-0″", x: buildX + roomW, y: buildY + buildL - 7, w: 5, h: 7, isToilet: true },

      { id: "sf_lounge", name: "FAMILY LOUNGE", dimText: "10′-0″ × 12′-0″", x: buildX + roomW / 2, y: buildY + roomH / 2, w: 10, h: 12, isLiving: true },
    ];

    balconies.push({ id: "bal_sf_mbr", name: "MASTER BALCONY", x: buildX, y: buildY + buildL, w: roomW, h: 4, projectionFt: 4, railingType: "Glass" });

    doors.push({ id: "dr_sf_bed1", label: "D2", x: buildX + roomW / 2, y: buildY + buildL - roomH, widthFt: 3.0, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_sf_toi1", label: "TOILET D", x: buildX + roomW - 5, y: buildY + buildL - roomH + 3.5, widthFt: 2.5, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_sf_bed2", label: "D2", x: buildX + roomW / 2, y: buildY + roomH, widthFt: 3.0, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_sf_toi2", label: "TOILET D", x: buildX + roomW - 5, y: buildY + 3.5, widthFt: 2.5, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_sf_bed3", label: "D2", x: buildX + roomW + 3, y: buildY + roomH, widthFt: 3.0, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_sf_bed4", label: "D2", x: buildX + roomW + 3, y: buildY + buildL - roomH, widthFt: 3.0, hinge: "left", swingAngle: 90 });

    windows.push({ id: "win_sf_b1", label: "W1", x: buildX, y: buildY + buildL - roomH / 2, widthFt: 5.0, orientation: "v" });
    windows.push({ id: "win_sf_b2", label: "W1", x: buildX, y: buildY + roomH / 2, widthFt: 5.0, orientation: "v" });
  } else {
    // FIRST FLOOR: PRIMARY LIVING FLOOR (LIVING + BALCONY, KITCHEN SE + UTILITY + STORE, DINING, POOJA NE, FOYER, COMMON TOILET)
    rooms = [
      { id: "ff_foyer", name: "FOYER / LOBBY", dimText: "8′-0″ × 8′-0″", x: buildX, y: buildY, w: 8, h: livH, isFoyer: true },
      { id: "ff_liv", name: "LIVING ROOM", dimText: `${(livW - 8).toFixed(0)}′-0″ × ${livH.toFixed(0)}′-0″`, x: buildX + 8, y: buildY, w: livW - 8, h: livH, isLiving: true },
      { id: "ff_din", name: "DINING AREA", dimText: `${dinW.toFixed(0)}′-0″ × ${dinH.toFixed(0)}′-0″`, x: buildX + livW, y: buildY, w: dinW, h: dinH, isDining: true },

      { id: "ff_kit", name: "KITCHEN (SE)", dimText: `${kitW.toFixed(0)}′-0″ × ${kitH.toFixed(0)}′-0″`, x: buildX, y: buildY + livH, w: kitW, h: kitH, isKitchen: true },
      { id: "ff_store", name: "STORE ROOM", dimText: "5′-0″ × 6′-0″", x: buildX + kitW, y: buildY + livH, w: 5, h: 6, isStore: true },
      { id: "ff_util", name: "UTILITY", dimText: `${utilW.toFixed(0)}′-0″ × ${utilH.toFixed(0)}′-0″`, x: buildX + buildW - utilW, y: buildY + buildL - staircase.h - utilH, w: utilW, h: utilH, isUtility: true },

      { id: "ff_pooja", name: "POOJA ROOM (NE)", dimText: "6′-0″ × 6′-0″", x: buildX + buildW - 6, y: buildY, w: 6, h: 6, isPooja: true },
      { id: "ff_toi_common", name: "COMMON TOILET", dimText: "5′-0″ × 7′-0″", x: buildX + buildW - utilW - 5, y: buildY + buildL - staircase.h - utilH, w: 5, h: 7, isToilet: true },
    ];

    balconies.push({ id: "bal_ff_living", name: "FRONT LIVING BALCONY", x: buildX, y: buildY - 4, w: livW, h: 4, projectionFt: 4, railingType: "Glass" });

    doors.push({ id: "dr_ff_main", label: "MAIN D1 (4′-0″)", x: buildX + 4, y: buildY, widthFt: 4.0, hinge: "left", swingAngle: 90, isMainDoor: true });
    doors.push({ id: "dr_ff_kit", label: "KITCHEN D3 (3′-0″)", x: buildX + kitW / 2, y: buildY + livH, widthFt: 3.0, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_ff_store", label: "STORE D", x: buildX + kitW, y: buildY + livH + 3, widthFt: 2.5, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_ff_util", label: "UTILITY D", x: buildX + buildW - utilW, y: buildY + buildL - staircase.h - utilH / 2, widthFt: 2.5, hinge: "left", swingAngle: 90 });
    doors.push({ id: "dr_ff_pooja", label: "POOJA D", x: buildX + buildW - 6, y: buildY + 3, widthFt: 2.5, hinge: "left", swingAngle: 90 });

    windows.push({ id: "win_ff_liv", label: "W1 (5′-0″)", x: buildX, y: buildY + livH / 2, widthFt: 5.0, orientation: "v" });
    windows.push({ id: "win_ff_kit", label: "W3 (4′-0″)", x: buildX, y: buildY + livH + kitH / 2, widthFt: 4.0, orientation: "v" });
    windows.push({ id: "win_ff_pooja", label: "W4", x: buildX + buildW - 3, y: buildY, widthFt: 3.0, orientation: "h" });
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
