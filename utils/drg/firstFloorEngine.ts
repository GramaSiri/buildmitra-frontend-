import {
  DRGInputs,
  Phase0AnalysisReport,
  StructuralPlanningReport,
  GroundFloorPlanningReport,
  GroundFloorStaircase,
  GroundFloorLift,
  Facing,
} from "./types";

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
  windows: { id: string; label: string; x: number; y: number; widthFt: number; orientation: "h" | "v" }[];
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
  groundFloorReport: GroundFloorPlanningReport
): FirstFloorPlanningReport {
  const plotW = Math.max(10, inputs.plotWidth || 30);
  const plotL = Math.max(10, inputs.plotLength || 40);

  const sFront = inputs.setbacks?.front || 3;
  const sRear = inputs.setbacks?.rear || 0;
  const sLeft = inputs.setbacks?.left || 2;
  const sRight = inputs.setbacks?.right || 2;

  const buildX = sLeft;
  const buildY = sFront;
  const buildW = Math.max(10, plotW - sLeft - sRight);
  const buildL = Math.max(10, plotL - sFront - sRear);

  const roadFacing: Facing = inputs.facing || "South";
  const roadWidthFt = inputs.roadWidth || 30;
  const roadLabel = `ROAD — ${roadWidthFt}′-0″ WIDE (${roadFacing.toUpperCase()} FACING)`;

  // HARDCODED GEOMETRIC MATRIX (30 FT x 40 FT SOUTH-FACING DUPLEX)
  // Scale: 1 FT = 20 Canvas Units (Plot 600px x 800px)
  const staircase = groundFloorReport.staircase;
  const lift = groundFloorReport.lift;

  const rooms: FirstFloorRoom[] = [];
  const walls: { id: string; x1: number; y1: number; x2: number; y2: number; thicknessInches: number; isExternal: boolean }[] = [];
  const doors: { id: string; label: string; x: number; y: number; widthFt: number; hinge: "left" | "right"; swingAngle: number; isMainDoor?: boolean }[] = [];
  const windows: { id: string; label: string; x: number; y: number; widthFt: number; orientation: "h" | "v" }[] = [];
  const balconies: FirstFloorBalcony[] = [];

  // Outer Envelope Walls (9" / 230mm)
  walls.push({ id: "ff_w_ext_south", x1: 0, y1: 40, x2: 30, y2: 40, thicknessInches: 9, isExternal: true });
  walls.push({ id: "ff_w_ext_east", x1: 30, y1: 0, x2: 30, y2: 40, thicknessInches: 9, isExternal: true });
  walls.push({ id: "ff_w_ext_north", x1: 0, y1: 0, x2: 30, y2: 0, thicknessInches: 9, isExternal: true });
  walls.push({ id: "ff_w_ext_west", x1: 0, y1: 0, x2: 0, y2: 40, thicknessInches: 9, isExternal: true });

  // 1. STAIR & LIFT CORE (SOUTH-EAST): X: 18 to 30 FT (360-600px), Y: 30 to 40 FT (600-800px)
  // Staircase landing ends cleanly at Y: 30 FT (600px) with ZERO room overlays.

  // 2. CENTRAL FOYER & CORRIDOR (3.5 FT to 4 FT CLEAR):
  // Entry Foyer: X: 18 to 23 FT (360-460px), Y: 25 to 30 FT (500-600px)
  rooms.push({
    id: "ff_foyer",
    name: "ENTRY FOYER",
    dimText: `5′-0″ × 5′-0″`,
    x: 18,
    y: 25,
    w: 5,
    h: 5,
    isFoyer: true,
  });

  // Central Spine Corridor: X: 12 to 18 FT (240-360px), Y: 11 to 30 FT (220-600px)

  // 3. LIVING / HALL (SOUTH-WEST): X: 0 to 18 FT (0-360px), Y: 23 to 40 FT (460-800px)
  rooms.push({
    id: "ff_living",
    name: "FAMILY LIVING",
    dimText: `18′-0″ × 17′-0″`,
    x: 0,
    y: 23,
    w: 18,
    h: 17,
    isLiving: true,
  });

  // 4. DINING AREA (CENTRAL-EAST): X: 18 to 30 FT (360-600px), Y: 19 to 30 FT (380-600px)
  rooms.push({
    id: "ff_dining",
    name: "DINING SPACE",
    dimText: `12′-0″ × 11′-0″`,
    x: 18,
    y: 19,
    w: 12,
    h: 11,
    isDining: true,
  });

  // 5. KITCHEN & STORE (NORTH-EAST):
  // Kitchen: X: 18 to 30 FT (360-600px), Y: 6 to 19 FT (120-380px)
  rooms.push({
    id: "ff_kitchen",
    name: "KITCHEN",
    dimText: `12′-0″ × 13′-0″`,
    x: 18,
    y: 6,
    w: 12,
    h: 13,
    isKitchen: true,
  });

  // Store Room: X: 23 to 30 FT (460-600px), Y: 0 to 6 FT (0-120px)
  rooms.push({
    id: "ff_store",
    name: "STORE ROOM",
    dimText: `7′-0″ × 6′-0″`,
    x: 23,
    y: 0,
    w: 7,
    h: 6,
    isStore: true,
  });

  // 6. VASTU POOJA (NORTH-EAST / ISHANYA CORNER): X: 18 to 23 FT (360-460px), Y: 0 to 6 FT (0-120px)
  rooms.push({
    id: "ff_pooja",
    name: "VASTU POOJA",
    dimText: `5′-0″ × 6′-0″`,
    x: 18,
    y: 0,
    w: 5,
    h: 6,
    isPooja: true,
  });

  // 7. MASTER BEDROOM & EN-SUITE (NORTH-WEST):
  // Master Bedroom: X: 0 to 18 FT (0-360px), Y: 0 to 15 FT (0-300px)
  rooms.push({
    id: "ff_master_bed",
    name: "MASTER BEDROOM",
    dimText: `18′-0″ × 15′-0″`,
    x: 0,
    y: 0,
    w: 18,
    h: 15,
    isMaster: true,
  });

  // En-Suite Toilet: X: 0 to 10 FT (0-200px), Y: 15 to 23 FT (300-460px)
  rooms.push({
    id: "ff_master_toi",
    name: "EN-SUITE TOILET",
    dimText: `10′-0″ × 8′-0″`,
    x: 0,
    y: 15,
    w: 10,
    h: 8,
    isToilet: true,
  });

  // Front Sit-out Balcony (South)
  balconies.push({
    id: "ff_balc_front",
    name: "FRONT SIT-OUT",
    x: 0,
    y: 37,
    w: 18,
    h: 3,
    projectionFt: 3,
    railingType: "Glass",
  });

  // Internal 4.5" Partition Walls (Hardcoded Matrix Alignment)
  walls.push({ id: "ff_w_int_h1", x1: 0, y1: 15, x2: 18, y2: 15, thicknessInches: 4.5, isExternal: false });
  walls.push({ id: "ff_w_int_h2", x1: 0, y1: 23, x2: 30, y2: 23, thicknessInches: 4.5, isExternal: false });
  walls.push({ id: "ff_w_int_h3", x1: 18, y1: 6, x2: 30, y2: 6, thicknessInches: 4.5, isExternal: false });
  walls.push({ id: "ff_w_int_h4", x1: 18, y1: 19, x2: 30, y2: 19, thicknessInches: 4.5, isExternal: false });
  walls.push({ id: "ff_w_int_h5", x1: 18, y1: 30, x2: 30, y2: 30, thicknessInches: 4.5, isExternal: false });
  walls.push({ id: "ff_w_int_v1", x1: 18, y1: 0, x2: 18, y2: 40, thicknessInches: 4.5, isExternal: false });
  walls.push({ id: "ff_w_int_v2", x1: 10, y1: 15, x2: 10, y2: 23, thicknessInches: 4.5, isExternal: false });
  walls.push({ id: "ff_w_int_v3", x1: 23, y1: 0, x2: 23, y2: 6, thicknessInches: 4.5, isExternal: false });

  // Doors with Wall Cutouts & Inward Swing Arcs
  doors.push({ id: "ff_d_main", label: "D1", x: 20, y: 30, widthFt: 3.5, hinge: "left", swingAngle: 90, isMainDoor: true });
  doors.push({ id: "ff_d_mbed", label: "D1", x: 14, y: 15, widthFt: 3.0, hinge: "left", swingAngle: 90 });
  doors.push({ id: "ff_d_mtoi", label: "D2", x: 4, y: 15, widthFt: 2.5, hinge: "left", swingAngle: 90 });
  doors.push({ id: "ff_d_kitch", label: "D1", x: 20, y: 19, widthFt: 3.0, hinge: "left", swingAngle: 90 });
  doors.push({ id: "ff_d_store", label: "D2", x: 25, y: 6, widthFt: 2.5, hinge: "left", swingAngle: 90 });
  doors.push({ id: "ff_d_pooja", label: "D2", x: 19, y: 6, widthFt: 2.5, hinge: "left", swingAngle: 90 });

  // Windows (W1) & Ventilators (V) on External Walls ONLY
  windows.push({ id: "ff_win_liv", label: "W1", x: 9, y: 40, widthFt: 5.0, orientation: "h" });
  windows.push({ id: "ff_win_mbed", label: "W1", x: 9, y: 0, widthFt: 5.0, orientation: "h" });
  windows.push({ id: "ff_win_kitch", label: "W1", x: 30, y: 12, widthFt: 4.0, orientation: "v" });
  windows.push({ id: "ff_win_mtoi", label: "V", x: 0, y: 19, widthFt: 2.0, orientation: "v" });

  const carpetAreaSqFt = rooms.reduce((sum, r) => sum + r.w * r.h, 0);
  const balconyAreaSqFt = balconies.reduce((sum, b) => sum + b.w * b.h, 0);
  const circulationAreaSqFt = staircase.w * staircase.h + (lift ? lift.w * lift.h : 0);
  const builtUpSqFt = Math.round(carpetAreaSqFt + balconyAreaSqFt + circulationAreaSqFt);

  return {
    projectInputs: {
      firstFloorUse: "Luxury Duplex Upper Residence",
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
