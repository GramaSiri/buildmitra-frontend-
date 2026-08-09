import { Facing } from "../../data/preFloorPlanLibrary";

export type { Facing };

export type RoomType =
  | "living"
  | "dining"
  | "kitchen"
  | "master_bedroom"
  | "bedroom"
  | "guest_bedroom"
  | "attached_toilet"
  | "common_toilet"
  | "pooja"
  | "utility"
  | "store"
  | "balcony"
  | "staircase"
  | "lift"
  | "corridor"
  | "parking"
  | "gym"
  | "party_hall"
  | "foyer";

export type VastuZone = "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW" | "N" | "CENTER";

export type TopologyRoomNode = {
  id: string;
  name: string;
  type: RoomType;
  minWidthFt: number;
  minLengthFt: number;
  minAreaSqFt: number;
  preferredVastu: VastuZone[];
  connectsTo: string[];
  isOptional: boolean;
  priority: number;
  stretchAxis: "x" | "y" | "both" | "none";
  shrinkPriority: number;
};

export type TemplateTopologyFamily = {
  id: string;
  name: string;
  description: string;
  category: string;
  minPlotWidth: number;
  maxPlotWidth: number;
  minPlotLength: number;
  maxPlotLength: number;
  supportedFacings: Facing[];
  supportedFloors: number[];
  verticalCore: {
    lift: { xRatio: number; yRatio: number; wFt: number; hFt: number };
    stair: { xRatio: number; yRatio: number; wFt: number; hFt: number; type: string };
    shaft: { xRatio: number; yRatio: number; wFt: number; hFt: number };
  };
  roomNodes: TopologyRoomNode[];
  vastuBaseScore: number;
  spaceBaseScore: number;
  ventilationBaseScore: number;
};

export type VerticalCoreReservation = {
  lift: { x: number; y: number; w: number; h: number; capacity: string };
  staircase: { x: number; y: number; w: number; h: number; type: string };
  shaft: { x: number; y: number; w: number; h: number };
};

export type DoorDefinition = {
  id: string;
  label: string;
  x: number;
  y: number;
  widthFt: number;
  hinge: "left" | "right";
  swingAngle: number;
  isMainDoor?: boolean;
};

export type WindowDefinition = {
  id: string;
  label: string;
  x: number;
  y: number;
  widthFt: number;
  orientation: "h" | "v";
  isVentilator?: boolean;
};

export type FurnitureBlock = {
  id: string;
  type: "bed" | "sofa" | "dining" | "wardrobe" | "kitchen_counter" | "tv_unit" | "wc" | "washbasin" | "car";
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
};

export type SolvedRoom = {
  id: string;
  name: string;
  type: RoomType;
  x: number;
  y: number;
  w: number;
  h: number;
  areaSqFt: number;
  vastuZone: VastuZone;
  connections: string[];
  doors: DoorDefinition[];
  windows: WindowDefinition[];
  furniture: FurnitureBlock[];
};

export type SolvedWall = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thicknessInches: number;
  isExternal: boolean;
};

export type SolvedFloor = {
  level: number;
  name: string;
  rooms: SolvedRoom[];
  walls: SolvedWall[];
  balconies: { id: string; name: string; x: number; y: number; w: number; h: number }[];
  staircase: { id: string; x: number; y: number; w: number; h: number; type: string };
  lift?: { id: string; x: number; y: number; w: number; h: number; capacity: string };
  parkingBays: { id: string; type: "Car" | "Two-Wheeler"; x: number; y: number; w: number; h: number }[];
};

export type FloorPlanOptionType = "OPTION_A_VASTU" | "OPTION_B_SPACE" | "OPTION_C_PREMIUM";

export type FloorPlanModel = {
  projectId: string;
  optionType: FloorPlanOptionType;
  optionTitle: string;
  optionDescription: string;
  templateFamilyId: string;
  plot: { width: number; length: number; areaSqFt: number; facing: Facing; roadWidth: number };
  setbacks: { front: number; rear: number; left: number; right: number };
  buildable: { x: number; y: number; w: number; h: number; areaSqFt: number };
  verticalCore: VerticalCoreReservation;
  floors: SolvedFloor[];
  validation: {
    isFeasible: boolean;
    status: "PASS" | "FAIL" | "PROGRAM_NOT_FEASIBLE";
    vastuScore: number;
    spaceScore: number;
    circulationScore: number;
    overlapCount: number;
    unmatchedRequirements: string[];
    notes: string[];
  };
};
