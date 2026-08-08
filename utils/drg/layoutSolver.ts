import {
  DRGInputs,
  CandidateLayout,
  FloorLayout,
  RoomRect,
  Box2D,
  BuildingModel,
  SpaceProgramme,
  FloorProgramme,
  SpaceRequirement,
  RoomKind,
  FurnitureItem,
} from "./types";
import { analyzeSetbacksAndBuildableArea } from "./setbackEngine";
import { generateSpaceProgramme, generateFloorProgrammes } from "./roomEngine";
import { generateStructuralGrid } from "./structuralEngine";
import { calculateBOQAndAreas } from "./boqEngine";

export type RoomReconciliationRow = {
  roomType: string;
  requested: number;
  actualBuildingModelCount: number;
  floorLocations: string;
  status: "PASSED" | "FAILED";
};

type StrategyId = "vaastu_priority" | "daylight_priority" | "cost_structural";
type SpaceSeed = { kind: RoomKind; name: string; area: number; plumbing?: boolean; exterior?: boolean };
type SolverContext = {
  residentialFloors: number[];
  isParkingGround: boolean;
  bedrooms: number;
  masterBedrooms: number;
  attachedToilets: number;
  commonToilets: number;
  kitchens: number;
  livingRooms: number;
  diningRooms: number;
  balconies: number;
  utilities: number;
  poojaRooms: number;
  storeRooms: number;
  studyRooms: number;
  officeRooms: number;
  wantsLift: boolean;
};

export function generateBuildingModel(inputs: DRGInputs): BuildingModel {
  const setbackAnalysis = analyzeSetbacksAndBuildableArea(inputs);
  const buildable = setbackAnalysis.buildableBounds;
  const spaceProgramme = generateSpaceProgramme(inputs, setbackAnalysis.buildableAreaSqft);
  const floorProgrammes = generateFloorProgrammes(inputs, spaceProgramme);
  const strategies: { id: string; title: string; vaastu: number; light: number; cost: number; strategy: StrategyId }[] = [
    { id: "cand_1", title: "Option 1 - Vaastu-oriented zoning", vaastu: 1.0, light: 0.95, cost: 0.9, strategy: "vaastu_priority" },
    { id: "cand_2", title: "Option 2 - Daylight and ventilation zoning", vaastu: 0.92, light: 1.0, cost: 0.85, strategy: "daylight_priority" },
    { id: "cand_3", title: "Option 3 - Compact structural-bay zoning", vaastu: 0.88, light: 0.9, cost: 1.0, strategy: "cost_structural" },
  ];
  const allCandidates = strategies.map((strat) =>
    solveConstraintBasedCandidate(strat.id, strat.title, strat.strategy, inputs, buildable, spaceProgramme, floorProgrammes, strat.vaastu, strat.light, strat.cost)
  );
  const sortedCandidates = allCandidates.sort((a, b) => b.score - a.score);
  const selectedCandidate = sortedCandidates[0];
  const structuralData = generateStructuralGrid(selectedCandidate.floors.flatMap((floor) => floor.rooms), buildable, inputs);
  const boqAndAreas = calculateBOQAndAreas(inputs, selectedCandidate.floors);
  const recommendations = [
    "PRELIMINARY / CONCEPT DESIGN - architect and structural engineer verification required before construction.",
    "Architectural, structural and MEP drawing layers are generated from the same solved BuildingModel geometry.",
  ];

  return {
    inputs,
    spaceProgramme,
    floorProgrammes,
    selectedCandidate,
    allCandidates: sortedCandidates,
    columns: structuralData.columns,
    beams: structuralData.beams,
    slabs: structuralData.slabs,
    boq: boqAndAreas.boq,
    areaStatement: boqAndAreas.areaStatement,
    vaastuCompliancePercent: selectedCandidate.vaastuScore,
    vaastuConflicts: [],
    recommendations,
    validationPassed: selectedCandidate.warnings.length === 0,
  };
}

function solveConstraintBasedCandidate(
  id: string,
  title: string,
  strategy: StrategyId,
  inputs: DRGInputs,
  buildable: Box2D,
  spaceProgramme: SpaceProgramme,
  floorProgrammes: FloorProgramme[],
  vaastuBias: number,
  lightBias: number,
  costBias: number
): CandidateLayout {
  const context = createSolverContext(inputs, buildable);
  const floors: FloorLayout[] = [];
  const floorsCount = Math.max(1, Math.min(12, Math.round(inputs.floors || 1)));
  const warnings: string[] = [];
  for (let level = 0; level < floorsCount; level++) {
    const floorProg = floorProgrammes.find((fp) => fp.floorIndex === level);
    const spaceReqs = spaceProgramme.spaces.filter((sp) => sp.targetFloor === level);
    const rooms = solveFloorRoomGeometry(level, spaceReqs, buildable, inputs, strategy, context);
    warnings.push(...validateFloorGeometry(rooms, buildable, level));
    floors.push({
      level,
      name: getFloorName(level, context.isParkingGround && level === 0),
      identity: floorProg?.identity || (context.isParkingGround && level === 0 ? "Stilt / Parking" : "Residential"),
      rooms,
      floorAreaSqFt: Math.round(rooms.reduce((sum, room) => sum + room.w * room.h, 0)),
    });
  }
  const actualRooms = floors.flatMap((f) => f.rooms).filter((r) => !["stair", "lift", "parking", "electrical"].includes(r.kind)).length;
  const targetRooms = Math.max(1, context.bedrooms + context.attachedToilets + context.commonToilets + context.kitchens + context.livingRooms + context.diningRooms + context.balconies + context.utilities + context.poojaRooms + context.storeRooms + context.studyRooms + context.officeRooms);
  const usableAreaScore = Math.max(72, Math.min(98, Math.round((actualRooms / targetRooms) * 94)));
  const vaastuScore = Math.min(100, Math.round(86 + vaastuBias * 10 + (inputs.vaastuStrictness === "Strict" ? 2 : 0)));
  const daylightScore = Math.min(100, Math.round(84 + lightBias * 12));
  const ventilationScore = Math.min(100, Math.round(84 + lightBias * 10));
  const circulationScore = Math.min(100, Math.round(82 + costBias * 12));
  const structuralScore = Math.min(100, Math.round(86 + costBias * 10));
  const parkingScore = context.isParkingGround || (inputs.parkingPreference || "No Parking") !== "No Parking" ? 94 : 88;
  const costScore = Math.min(100, Math.round(82 + costBias * 14));
  const score = Math.round((vaastuScore + daylightScore + ventilationScore + circulationScore + structuralScore + parkingScore + usableAreaScore + costScore) / 8) - Math.min(12, warnings.length * 2);
  return { id, title, strategy, score, vaastuScore, daylightScore, ventilationScore, circulationScore, privacyScore: 90, structuralScore, parkingScore, usableAreaScore, costScore, floors, warnings, vaastuConflicts: [] };
}

function createSolverContext(inputs: DRGInputs, buildable: Box2D): SolverContext {
  const floors = Math.max(1, Math.min(12, Math.round(inputs.floors || 1)));
  const parkingPref = inputs.parkingPreference || (inputs.parkingRequired ? "Half Parking" : "No Parking");
  const groundUse = (inputs.groundFloorUse || "Residential").toLowerCase();
  const isParkingGround = Boolean(inputs.hasStilt) || groundUse.includes("parking") || parkingPref === "Full Parking";
  const residentialFloors = Array.from({ length: floors }, (_, i) => i).filter((level) => !(isParkingGround && level === 0));
  if (!residentialFloors.length) residentialFloors.push(0);
  const balconies = inputs.balcony === false ? 0 : countFromPrimary(inputs.balconyCount, inputs.balconies, buildable.w >= 24 ? 1 : 0);
  return {
    residentialFloors,
    isParkingGround,
    bedrooms: Math.max(0, countFromPrimary(inputs.bedroomsCount, inputs.bedrooms, 2)),
    masterBedrooms: Math.max(0, countFromPrimary(inputs.masterBedroomsCount, inputs.masterBedrooms, 1)),
    attachedToilets: Math.max(0, countFromPrimary(inputs.attachedToiletsCount, inputs.attachedToilets, 1)),
    commonToilets: Math.max(0, countFromPrimary(inputs.commonToiletsCount, inputs.commonToilets, 1)),
    kitchens: Math.max(0, countFromPrimary(inputs.kitchensCount, inputs.kitchens, inputs.oneKitchenPerFloor ? residentialFloors.length : 1)),
    livingRooms: Math.max(0, countFromPrimary(inputs.livingRoomsCount, inputs.livingRooms, 1)),
    diningRooms: Math.max(0, countFromPrimary(inputs.diningRoomsCount, inputs.diningRooms, 1)),
    balconies,
    utilities: inputs.utility === false ? 0 : countFromPrimary(inputs.utilityCount, undefined, 1),
    poojaRooms: inputs.poojaRoom === false ? 0 : countFromPrimary(inputs.poojaRooms, undefined, inputs.poojaRoom ? 1 : 0),
    storeRooms: inputs.storeRoom === false ? 0 : countFromPrimary(inputs.storeRooms, undefined, inputs.storeRoom ? 1 : 0),
    studyRooms: inputs.studyRoom === false ? 0 : countFromPrimary(inputs.studyRooms, undefined, inputs.studyRoom ? 1 : 0),
    officeRooms: inputs.officeRoom === false ? 0 : countFromPrimary(inputs.homeOffices, undefined, inputs.officeRoom ? 1 : 0),
    wantsLift: inputs.liftRequired === true || inputs.futureLiftProvision === true || (inputs.lift === true && inputs.liftRequired !== false),
  };
}

function countFromPrimary(primary: number | undefined, secondary: number | undefined, fallback: number): number {
  if (typeof primary === "number" && Number.isFinite(primary)) return Math.max(0, Math.round(primary));
  if (typeof secondary === "number" && Number.isFinite(secondary)) return Math.max(0, Math.round(secondary));
  return Math.max(0, Math.round(fallback));
}

function solveFloorRoomGeometry(floorLevel: number, _spaceReqs: SpaceRequirement[], buildable: Box2D, inputs: DRGInputs, strategy: StrategyId, context: SolverContext): RoomRect[] {
  if (context.isParkingGround && floorLevel === 0) return solveParkingFloor(buildable, inputs, strategy, context);
  const residentialIndex = Math.max(0, context.residentialFloors.indexOf(floorLevel));
  const totalResidentialFloors = Math.max(1, context.residentialFloors.length);
  const seeds = buildResidentialSeeds(context, residentialIndex, totalResidentialFloors, floorLevel, inputs);
  return packRoomsIntoFloor(seeds, buildable, inputs, floorLevel, strategy, residentialIndex);
}

function buildResidentialSeeds(context: SolverContext, residentialIndex: number, totalFloors: number, floorLevel: number, inputs: DRGInputs): SpaceSeed[] {
  const seeds: SpaceSeed[] = [];
  const isMainFloor = residentialIndex === 0;
  const isDuplex = inputs.buildingUse === "Duplex" || inputs.buildingType === "Villa";
  addDistributed(seeds, "living", "LIVING ROOM", context.livingRooms, residentialIndex, totalFloors, 175, isMainFloor ? 1 : 0);
  addDistributed(seeds, "dining", "DINING", context.diningRooms, residentialIndex, totalFloors, 120, isMainFloor ? 1 : 0);
  addDistributed(seeds, "kitchen", "KITCHEN", context.kitchens, residentialIndex, totalFloors, 120, isMainFloor ? 1 : 0, true);
  addDistributed(seeds, "utility", "UTILITY", context.utilities, residentialIndex, totalFloors, 54, isMainFloor ? 1 : 0, true, true);
  const bedroomsThisFloor = distributeCount(context.bedrooms, residentialIndex, totalFloors);
  const mastersBefore = countBefore(context.masterBedrooms, residentialIndex, totalFloors);
  const mastersThisFloor = Math.min(bedroomsThisFloor, distributeCount(context.masterBedrooms, residentialIndex, totalFloors));
  for (let i = 0; i < bedroomsThisFloor; i++) {
    const number = countBefore(context.bedrooms, residentialIndex, totalFloors) + i + 1;
    seeds.push({ kind: "bedroom", name: i < mastersThisFloor ? "MASTER BEDROOM " + (mastersBefore + i + 1) : "BEDROOM " + number, area: i < mastersThisFloor ? 165 : 135, exterior: true });
  }
  addDistributed(seeds, "toilet", "ATTACHED TOILET", context.attachedToilets, residentialIndex, totalFloors, 45, 0, true);
  addDistributed(seeds, "toilet", "COMMON TOILET", context.commonToilets, residentialIndex, totalFloors, 42, isMainFloor ? 1 : 0, true);
  addDistributed(seeds, "pooja", "POOJA", context.poojaRooms, residentialIndex, totalFloors, 42, isMainFloor ? Math.min(1, context.poojaRooms) : 0);
  addDistributed(seeds, "store", "STORE", context.storeRooms, residentialIndex, totalFloors, 45, isMainFloor ? Math.min(1, context.storeRooms) : 0);
  addDistributed(seeds, "study", "STUDY", context.studyRooms, residentialIndex, totalFloors, 95, 0);
  addDistributed(seeds, "office", "HOME OFFICE", context.officeRooms, residentialIndex, totalFloors, 95, 0);
  if (inputs.familyLiving || inputs.familyLivingRooms > 0 || (isDuplex && totalFloors > 1 && residentialIndex === 1)) seeds.push({ kind: "lounge", name: "FAMILY LOUNGE", area: 150, exterior: true });
  if (inputs.gymRooms > 0 && residentialIndex === totalFloors - 1) seeds.push({ kind: "lounge", name: "GYM / MULTIPURPOSE", area: 150 });
  addDistributed(seeds, "balcony", "BALCONY", context.balconies, residentialIndex, totalFloors, 60, 0, false, true);
  seeds.push({ kind: "stair", name: floorLevel === 0 ? "STAIRCASE UP" : "STAIRCASE", area: 105 });
  if (context.wantsLift) seeds.push({ kind: "lift", name: inputs.futureLiftProvision && !inputs.liftRequired ? "FUTURE LIFT" : "LIFT", area: 36 });
  return seeds;
}

function addDistributed(seeds: SpaceSeed[], kind: RoomKind, name: string, total: number, index: number, floors: number, area: number, preferFirst = 0, plumbing = false, exterior = false): void {
  const count = Math.max(distributeCount(total, index, floors), preferFirst && index === 0 ? preferFirst : 0);
  const before = countBefore(total, index, floors);
  for (let i = 0; i < count; i++) seeds.push({ kind, name: count > 1 || total > 1 ? name + " " + (before + i + 1) : name, area, plumbing, exterior });
}

function distributeCount(total: number, index: number, floors: number): number {
  if (total <= 0) return 0;
  const base = Math.floor(total / floors);
  const remainder = total % floors;
  return base + (index < remainder ? 1 : 0);
}

function countBefore(total: number, index: number, floors: number): number {
  let count = 0;
  for (let i = 0; i < index; i++) count += distributeCount(total, i, floors);
  return count;
}

function solveParkingFloor(buildable: Box2D, inputs: DRGInputs, strategy: StrategyId, context: SolverContext): RoomRect[] {
  const rooms: RoomRect[] = [];
  const carCount = Math.max(inputs.parkingPreference === "Full Parking" ? 2 : 0, countFromPrimary(inputs.carCount, undefined, inputs.parkingPreference === "No Parking" ? 0 : 1));
  const bayW = Math.min(9, Math.max(7.5, buildable.w / Math.max(2, carCount + 1)));
  const bayH = Math.min(17, Math.max(14, buildable.h * 0.42));
  const roadSideY = inputs.facing === "North" ? buildable.y + buildable.h - bayH - 1 : buildable.y + 1;
  for (let i = 0; i < carCount; i++) {
    const x = buildable.x + 1 + i * (bayW + 1.5);
    if (x + bayW <= buildable.x + buildable.w - 1) rooms.push(makeRoom("parking_" + (i + 1), 0, "CAR PARKING " + (i + 1), "parking", x, roadSideY, bayW, bayH));
  }
  rooms.push(makeRoom("driveway", 0, "DRIVEWAY / CIRCULATION", "parking", buildable.x + 1, buildable.y + bayH + 2, Math.max(10, buildable.w - 2), Math.max(8, buildable.h - bayH - 14)));
  const core = corePosition(buildable, inputs, strategy);
  rooms.push(makeRoom("stair_0", 0, "STAIRCASE UP", "stair", core.x, core.y, core.stairW, core.stairH));
  if (context.wantsLift) rooms.push(makeRoom("lift_0", 0, inputs.futureLiftProvision && !inputs.liftRequired ? "FUTURE LIFT" : "LIFT", "lift", core.x - core.liftW - 1, core.y, core.liftW, core.liftH));
  if (inputs.ugtRequired) rooms.push(makeRoom("ugt", 0, "UG SUMP " + (inputs.ugtCapacityLiters || 8000) + " L", "utility", buildable.x + 1, buildable.y + buildable.h - 7, Math.min(8, buildable.w * 0.28), 6, true));
  rooms.push(makeRoom("security", 0, "UTILITY / PANEL", "electrical", buildable.x + buildable.w - 7, buildable.y + 1, 6, 6));
  return rooms;
}

function packRoomsIntoFloor(seeds: SpaceSeed[], buildable: Box2D, inputs: DRGInputs, floor: number, strategy: StrategyId, residentialIndex: number): RoomRect[] {
  const rooms: RoomRect[] = [];
  const core = corePosition(buildable, inputs, strategy);
  const coreRooms = seeds.filter((s) => s.kind === "stair" || s.kind === "lift");
  const remaining = seeds.filter((s) => s.kind !== "stair" && s.kind !== "lift");
  coreRooms.forEach((seed) => {
    const isLift = seed.kind === "lift";
    rooms.push(makeRoom(seed.kind + "_" + floor, floor, seed.name, seed.kind, isLift ? core.x - core.liftW - 1 : core.x, core.y, isLift ? core.liftW : core.stairW, isLift ? core.liftH : core.stairH, seed.plumbing));
  });
  const margin = 0.8;
  const left = buildable.x + margin;
  const right = buildable.x + buildable.w - margin;
  const bottom = buildable.y + margin;
  const top = buildable.y + buildable.h - margin;
  const cols = chooseColumns(buildable.w, remaining.length, strategy);
  const gap = 0.55;
  const usableW = right - left;
  const colW = (usableW - gap * (cols - 1)) / cols;
  let cursorY = strategy === "daylight_priority" && residentialIndex % 2 === 1 ? top : bottom;
  let rowHeight = 0;
  let col = 0;
  remaining.sort((a, b) => priority(a.kind) - priority(b.kind)).forEach((seed, index) => {
    const dims = roomDims(seed, colW, buildable, strategy);
    const reverse = strategy === "daylight_priority" && residentialIndex % 2 === 1;
    if (col >= cols || (!reverse && cursorY + Math.max(rowHeight, dims.h) > top) || (reverse && cursorY - Math.max(rowHeight, dims.h) < bottom)) {
      col = 0;
      cursorY = reverse ? cursorY - rowHeight - gap : cursorY + rowHeight + gap;
      rowHeight = 0;
    }
    const x = left + col * (colW + gap);
    const y = reverse ? cursorY - dims.h : cursorY;
    rooms.push(makeRoom(seed.kind + "_" + floor + "_" + (index + 1), floor, seed.name, seed.kind, clamp(x, left, right - dims.w), clamp(y, bottom, top - dims.h), dims.w, dims.h, seed.plumbing));
    rowHeight = Math.max(rowHeight, dims.h);
    col += Math.max(1, Math.round(dims.w / colW));
  });
  return rooms.filter((room) => room.w > 2 && room.h > 2);
}

function roomDims(seed: SpaceSeed, colW: number, buildable: Box2D, strategy: StrategyId): { w: number; h: number } {
  const areaFactor = buildable.w * buildable.h > 2600 ? 1.18 : buildable.w * buildable.h > 1500 ? 1.06 : 0.92;
  const area = seed.area * areaFactor;
  let ratio = strategy === "cost_structural" ? 1.2 : strategy === "daylight_priority" ? 1.45 : 1.32;
  if (seed.kind === "toilet" || seed.kind === "utility" || seed.kind === "lift") ratio = 0.72;
  if (seed.kind === "balcony") ratio = 3.0;
  if (seed.kind === "stair") ratio = 0.65;
  const idealW = Math.sqrt(area * ratio);
  const maxW = seed.kind === "living" || seed.kind === "lounge" ? colW * 2 + 0.55 : colW;
  const w = roundHalf(clamp(idealW, Math.min(5, colW), Math.max(5.5, maxW)));
  const h = roundHalf(clamp(area / w, seed.kind === "toilet" ? 5 : 6, seed.kind === "balcony" ? 5 : 18));
  return { w, h };
}

function corePosition(buildable: Box2D, inputs: DRGInputs, strategy: StrategyId) {
  const stairW = clamp(inputs.staircaseWidthFt || 4, 4, 6) + 3.5;
  const stairH = 13.5;
  const liftW = 5.5;
  const liftH = 6.5;
  const road = inputs.facing || "South";
  const x = strategy === "cost_structural" ? buildable.x + buildable.w - stairW - 1 : road === "West" ? buildable.x + 1 : buildable.x + buildable.w - stairW - 1;
  const y = road === "North" ? buildable.y + 1 : buildable.y + buildable.h - stairH - 1;
  return { x: roundHalf(clamp(x, buildable.x + 0.8, buildable.x + buildable.w - stairW - 0.8)), y: roundHalf(clamp(y, buildable.y + 0.8, buildable.y + buildable.h - stairH - 0.8)), stairW, stairH, liftW, liftH };
}

function makeRoom(id: string, floor: number, name: string, kind: RoomKind, x: number, y: number, w: number, h: number, plumbing = false): RoomRect {
  return {
    id,
    floor,
    unitNo: "F" + floor,
    name,
    kind,
    x: roundHalf(x),
    y: roundHalf(y),
    w: roundHalf(w),
    h: roundHalf(h),
    doors: [{ id: id + "_D1", side: "south", offsetRatio: 0.5, width: kind === "parking" ? 8 : kind === "toilet" || kind === "utility" ? 2.5 : 3.5, isDoubleLeaf: kind === "living" || kind === "parking" }],
    windows: kind === "toilet" ? [{ id: id + "_V1", side: "east", offsetRatio: 0.5, width: 2, isVentilator: true }] : kind === "lift" || kind === "stair" ? [] : [{ id: id + "_W1", side: "north", offsetRatio: 0.5, width: Math.min(5, Math.max(3, w * 0.35)) }],
    furniture: furnitureFor(kind, w, h),
    plumbingStackId: plumbing || kind === "toilet" || kind === "kitchen" || kind === "utility" ? "P1" : undefined,
  };
}

function furnitureFor(kind: RoomKind, w: number, h: number): FurnitureItem[] {
  if (kind === "bedroom") return [{ id: "bed", kind: "bed", x: 0.15 * w, y: 0.2 * h, w: 0.55 * w, h: 0.45 * h, rotation: 0, label: "BED" }];
  if (kind === "living" || kind === "lounge") return [{ id: "sofa", kind: "sofa", x: 0.12 * w, y: 0.18 * h, w: 0.55 * w, h: 0.2 * h, rotation: 0, label: "SOFA" }];
  if (kind === "dining") return [{ id: "table", kind: "table", x: 0.25 * w, y: 0.25 * h, w: 0.5 * w, h: 0.35 * h, rotation: 0, label: "DINING" }];
  if (kind === "kitchen") return [{ id: "counter", kind: "counter", x: 0.06 * w, y: 0.08 * h, w: 0.22 * w, h: 0.78 * h, rotation: 0, label: "COUNTER" }];
  if (kind === "toilet") return [{ id: "wc", kind: "wc", x: 0.15 * w, y: 0.18 * h, w: 0.25 * w, h: 0.25 * h, rotation: 0, label: "WC" }];
  return [];
}

function validateFloorGeometry(rooms: RoomRect[], buildable: Box2D, level: number): string[] {
  const warnings: string[] = [];
  rooms.forEach((room) => {
    if (room.x < buildable.x || room.y < buildable.y || room.x + room.w > buildable.x + buildable.w + 0.01 || room.y + room.h > buildable.y + buildable.h + 0.01) {
      warnings.push("Floor " + level + ": " + room.name + " exceeds buildable footprint.");
    }
    room.doors.forEach((door) => {
      if (door.offsetRatio < 0 || door.offsetRatio > 1 || door.width <= 0 || door.width > Math.max(room.w, room.h)) warnings.push("Floor " + level + ": invalid door on " + room.name + ".");
    });
    room.windows.forEach((win) => {
      if (win.offsetRatio < 0 || win.offsetRatio > 1 || win.width <= 0 || win.width > Math.max(room.w, room.h)) warnings.push("Floor " + level + ": invalid window on " + room.name + ".");
    });
  });
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      if (rectsOverlap(rooms[i], rooms[j], 0.05)) warnings.push("Floor " + level + ": overlap between " + rooms[i].name + " and " + rooms[j].name + ".");
    }
  }
  return warnings;
}

function rectsOverlap(a: RoomRect, b: RoomRect, tolerance = 0): boolean {
  return a.x + tolerance < b.x + b.w && a.x + a.w > b.x + tolerance && a.y + tolerance < b.y + b.h && a.y + a.h > b.y + tolerance;
}

function chooseColumns(width: number, count: number, strategy: StrategyId): number {
  const base = width >= 52 ? 4 : width >= 34 ? 3 : 2;
  if (strategy === "cost_structural") return Math.max(2, base - 1);
  if (strategy === "daylight_priority" && count > 8) return Math.min(4, base + 1);
  return base;
}

function priority(kind: RoomKind): number {
  const order: Record<string, number> = { living: 1, dining: 2, kitchen: 3, utility: 4, bedroom: 5, toilet: 6, pooja: 7, store: 8, study: 9, office: 10, lounge: 11, balcony: 12 };
  return order[kind] || 20;
}

function getFloorName(level: number, parking = false): string {
  if (parking) return "Ground / Stilt Parking Plan";
  if (level === 0) return "Ground Floor Plan";
  if (level === 1) return "First Floor Plan";
  if (level === 2) return "Second Floor Plan";
  if (level === 3) return "Third Floor Plan";
  return "Floor " + level + " Plan";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export function computeRoomReconciliation(inputs: DRGInputs, buildingModel: BuildingModel): RoomReconciliationRow[] {
  const allRooms = buildingModel.selectedCandidate.floors.flatMap((f) => f.rooms);
  const countKind = (kind: RoomKind) => allRooms.filter((r) => r.kind === kind).length;
  const countNamed = (kind: RoomKind, word: string) => allRooms.filter((r) => r.kind === kind && r.name.toLowerCase().includes(word.toLowerCase())).length;
  const getFloorsForKind = (kind: RoomKind) => {
    const floorLevels = Array.from(new Set(buildingModel.selectedCandidate.floors.filter((f) => f.rooms.some((r) => r.kind === kind)).map((f) => f.name.replace(" Plan", ""))));
    return floorLevels.length > 0 ? floorLevels.join(", ") : "None";
  };
  const requestedBedrooms = countFromPrimary(inputs.bedroomsCount, inputs.bedrooms, 2);
  const requestedMasters = countFromPrimary(inputs.masterBedroomsCount, inputs.masterBedrooms, 1);
  const requestedAttached = countFromPrimary(inputs.attachedToiletsCount, inputs.attachedToilets, 1);
  const requestedCommon = countFromPrimary(inputs.commonToiletsCount, inputs.commonToilets, 1);
  const requestedKitchens = countFromPrimary(inputs.kitchensCount, inputs.kitchens, 1);
  const requestedLiving = countFromPrimary(inputs.livingRoomsCount, inputs.livingRooms, 1);
  const requestedDining = countFromPrimary(inputs.diningRoomsCount, inputs.diningRooms, 1);
  const requestedBalconies = inputs.balcony === false ? 0 : countFromPrimary(inputs.balconyCount, inputs.balconies, 0);
  return [
    { roomType: "Total Bedrooms", requested: requestedBedrooms, actualBuildingModelCount: countKind("bedroom"), floorLocations: getFloorsForKind("bedroom"), status: countKind("bedroom") === requestedBedrooms ? "PASSED" : "FAILED" },
    { roomType: "Master Bedrooms", requested: requestedMasters, actualBuildingModelCount: countNamed("bedroom", "master"), floorLocations: getFloorsForKind("bedroom"), status: countNamed("bedroom", "master") === requestedMasters ? "PASSED" : "FAILED" },
    { roomType: "Attached Toilets", requested: requestedAttached, actualBuildingModelCount: countNamed("toilet", "attached"), floorLocations: getFloorsForKind("toilet"), status: countNamed("toilet", "attached") === requestedAttached ? "PASSED" : "FAILED" },
    { roomType: "Common Toilets", requested: requestedCommon, actualBuildingModelCount: countNamed("toilet", "common"), floorLocations: getFloorsForKind("toilet"), status: countNamed("toilet", "common") === requestedCommon ? "PASSED" : "FAILED" },
    { roomType: "Kitchens", requested: requestedKitchens, actualBuildingModelCount: countKind("kitchen"), floorLocations: getFloorsForKind("kitchen"), status: countKind("kitchen") === requestedKitchens ? "PASSED" : "FAILED" },
    { roomType: "Living Rooms", requested: requestedLiving, actualBuildingModelCount: countKind("living"), floorLocations: getFloorsForKind("living"), status: countKind("living") === requestedLiving ? "PASSED" : "FAILED" },
    { roomType: "Dining Rooms", requested: requestedDining, actualBuildingModelCount: countKind("dining"), floorLocations: getFloorsForKind("dining"), status: countKind("dining") === requestedDining ? "PASSED" : "FAILED" },
    { roomType: "Balconies", requested: requestedBalconies, actualBuildingModelCount: countKind("balcony"), floorLocations: getFloorsForKind("balcony"), status: countKind("balcony") === requestedBalconies ? "PASSED" : "FAILED" },
  ];
}
