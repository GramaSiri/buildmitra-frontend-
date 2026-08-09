import { RoomType, VastuZone } from "../utils/floorPlans/types";

export type Facing = "North" | "South" | "East" | "West";
export type Parking = "Full Parking" | "Half Parking" | "No Parking";
export type BuildingType = "Own Use" | "Rental Use" | "Duplex" | "Multi-unit";

export type LibraryRoomGeometry = {
  id: string;
  name: string;
  type: RoomType;
  xRatio: number; // Ratio of buildable width (0 to 1)
  yRatio: number; // Ratio of buildable length (0 to 1)
  wRatio: number;
  hRatio: number;
  minWidthFt: number;
  minLengthFt: number;
  vastuZone: VastuZone;
  connections: string[];
  doorWall: "north" | "south" | "east" | "west";
  windowWall?: "north" | "south" | "east" | "west";
};

export type FloorPlanTemplate = {
  id: string;
  title: string;
  plotWidth: number;
  plotLength: number;
  minWidth: number;
  maxWidth: number;
  minLength: number;
  maxLength: number;
  facing: Facing;
  roadWidthFt: number;
  supportedFloors: number[];
  bedroomOptions: number[];
  toiletOptions: number[];
  buildingTypes: BuildingType[];
  parkingOptions: Parking[];
  liftSupported: boolean;
  vaastu: boolean;
  vastuScore: number;
  features: {
    pooja: boolean;
    utility: boolean;
    balcony: boolean;
    store: boolean;
  };
  style: "compact" | "standard" | "premium" | "villa" | "estate";
  architectVerified: boolean;
  tags: string[];
  verticalCore: {
    lift: { xRatio: number; yRatio: number; wFt: number; hFt: number };
    stair: { xRatio: number; yRatio: number; wFt: number; hFt: number; type: string };
    shaft: { xRatio: number; yRatio: number; wFt: number; hFt: number };
  };
  layoutGeometry: LibraryRoomGeometry[];
};

export type FloorPlanRequirement = {
  plotWidth: number;
  plotLength: number;
  facing: Facing;
  floors: number;
  bedrooms: number;
  toilets: number;
  buildingType: BuildingType;
  parking: Parking;
  lift: boolean;
  vaastu: boolean;
  pooja: boolean;
  utility: boolean;
  balcony: boolean;
};

// PERMANENT ARCHITECTURAL PLAN LIBRARY STORED INSIDE APP
export const PRE_FLOOR_PLAN_LIBRARY: FloorPlanTemplate[] = [
  // 1. 20x30 NORTH FACING COMPACT
  {
    id: "BM-N-2030-01",
    title: "20 × 30 North-Facing Compact 2BHK Vastu Plan",
    plotWidth: 20,
    plotLength: 30,
    minWidth: 18,
    maxWidth: 24,
    minLength: 26,
    maxLength: 35,
    facing: "North",
    roadWidthFt: 30,
    supportedFloors: [1, 2],
    bedroomOptions: [2],
    toiletOptions: [1, 2],
    buildingTypes: ["Own Use", "Rental Use"],
    parkingOptions: ["Half Parking", "No Parking"],
    liftSupported: false,
    vaastu: true,
    vastuScore: 94,
    features: { pooja: true, utility: true, balcony: true, store: false },
    style: "compact",
    architectVerified: true,
    tags: ["North", "20x30", "2BHK", "Compact"],
    verticalCore: {
      lift: { xRatio: 0.65, yRatio: 0.5, wFt: 0, hFt: 0 },
      stair: { xRatio: 0.65, yRatio: 0.55, wFt: 6.5, hFt: 13.0, type: "Dog-Legged" },
      shaft: { xRatio: 0.85, yRatio: 0.85, wFt: 2.0, hFt: 2.5 },
    },
    layoutGeometry: [
      { id: "liv", name: "LIVING ROOM", type: "living", xRatio: 0, yRatio: 0, wRatio: 0.65, hRatio: 0.45, minWidthFt: 10, minLengthFt: 11, vastuZone: "NE", connections: ["din"], doorWall: "south" },
      { id: "din", name: "DINING AREA", type: "dining", xRatio: 0, yRatio: 0.45, wRatio: 0.65, hRatio: 0.25, minWidthFt: 9, minLengthFt: 8, vastuZone: "E", connections: ["liv", "kit"], doorWall: "north" },
      { id: "kit", name: "KITCHEN (SE)", type: "kitchen", xRatio: 0.65, yRatio: 0, wRatio: 0.35, hRatio: 0.45, minWidthFt: 6.5, minLengthFt: 9, vastuZone: "SE", connections: ["din", "util"], doorWall: "west" },
      { id: "util", name: "UTILITY", type: "utility", xRatio: 0.65, yRatio: 0.45, wRatio: 0.35, hRatio: 0.15, minWidthFt: 4, minLengthFt: 5, vastuZone: "SE", connections: ["kit"], doorWall: "north" },
      { id: "bed1", name: "MASTER BEDROOM", type: "master_bedroom", xRatio: 0, yRatio: 0.7, wRatio: 0.65, hRatio: 0.3, minWidthFt: 10, minLengthFt: 10, vastuZone: "SW", connections: ["toi1"], doorWall: "south" },
      { id: "toi1", name: "ATTACHED TOILET", type: "attached_toilet", xRatio: 0.65, yRatio: 0.7, wRatio: 0.35, hRatio: 0.3, minWidthFt: 4.5, minLengthFt: 6.5, vastuZone: "NW", connections: ["bed1"], doorWall: "west" },
    ],
  },

  // 2. 30x40 SOUTH FACING 3BHK DUPLEX WITH LIFT & HALF PARKING (TARGET REFERENCE DRG QUALITY)
  {
    id: "BM-S-3040-02",
    title: "30 × 40 South-Facing 3BHK Duplex Plan with Lift & Parking",
    plotWidth: 30,
    plotLength: 40,
    minWidth: 28,
    maxWidth: 34,
    minLength: 36,
    maxLength: 44,
    facing: "South",
    roadWidthFt: 30,
    supportedFloors: [2, 3, 4],
    bedroomOptions: [3, 4],
    toiletOptions: [3, 4],
    buildingTypes: ["Duplex", "Own Use"],
    parkingOptions: ["Half Parking", "Full Parking"],
    liftSupported: true,
    vaastu: true,
    vastuScore: 98,
    features: { pooja: true, utility: true, balcony: true, store: true },
    style: "standard",
    architectVerified: true,
    tags: ["South", "30x40", "3BHK", "Duplex", "Lift"],
    verticalCore: {
      lift: { xRatio: 0.57, yRatio: 0.62, wFt: 5.0, hFt: 5.0 },
      stair: { xRatio: 0.75, yRatio: 0.62, wFt: 7.5, hFt: 15.0, type: "Dog-Legged" },
      shaft: { xRatio: 0.57, yRatio: 0.9, wFt: 2.5, hFt: 3.0 },
    },
    layoutGeometry: [
      { id: "liv", name: "SPACIOUS LIVING ROOM", type: "living", xRatio: 0, yRatio: 0, wRatio: 0.5, hRatio: 0.325, minWidthFt: 15, minLengthFt: 13, vastuZone: "NE", connections: ["din"], doorWall: "south", windowWall: "west" },
      { id: "din", name: "DINING ROOM", type: "dining", xRatio: 0.5, yRatio: 0, wRatio: 0.5, hRatio: 0.25, minWidthFt: 12, minLengthFt: 10, vastuZone: "E", connections: ["liv", "kit"], doorWall: "west", windowWall: "east" },
      { id: "kit", name: "KITCHEN (SE AGNEYA)", type: "kitchen", xRatio: 0, yRatio: 0.325, wRatio: 0.4, hRatio: 0.25, minWidthFt: 12, minLengthFt: 10, vastuZone: "SE", connections: ["din", "util"], doorWall: "south", windowWall: "west" },
      { id: "util", name: "UTILITY", type: "utility", xRatio: 0.75, yRatio: 0.375, wRatio: 0.25, hRatio: 0.225, minWidthFt: 6, minLengthFt: 9, vastuZone: "SE", connections: ["kit"], doorWall: "west" },
      { id: "bed1", name: "MASTER BEDROOM 1", type: "master_bedroom", xRatio: 0, yRatio: 0.7, wRatio: 0.4, hRatio: 0.3, minWidthFt: 12, minLengthFt: 12, vastuZone: "SW", connections: ["toi1"], doorWall: "south", windowWall: "north" },
      { id: "toi1", name: "ATTACHED TOILET", type: "attached_toilet", xRatio: 0.4, yRatio: 0.8, wRatio: 0.17, hRatio: 0.2, minWidthFt: 5, minLengthFt: 8, vastuZone: "W", connections: ["bed1"], doorWall: "west", windowWall: "north" },
    ],
  },

  // 3. 30x50 EAST FACING 3BHK EXTENDED DUPLEX
  {
    id: "BM-E-3050-03",
    title: "30 × 50 East-Facing Premium 3BHK Duplex Plan",
    plotWidth: 30,
    plotLength: 50,
    minWidth: 28,
    maxWidth: 35,
    minLength: 45,
    maxLength: 56,
    facing: "East",
    roadWidthFt: 30,
    supportedFloors: [2, 3],
    bedroomOptions: [3, 4],
    toiletOptions: [3, 4],
    buildingTypes: ["Duplex", "Own Use"],
    parkingOptions: ["Half Parking", "Full Parking"],
    liftSupported: true,
    vaastu: true,
    vastuScore: 96,
    features: { pooja: true, utility: true, balcony: true, store: true },
    style: "premium",
    architectVerified: true,
    tags: ["East", "30x50", "3BHK", "Duplex"],
    verticalCore: {
      lift: { xRatio: 0.6, yRatio: 0.5, wFt: 5.5, hFt: 5.5 },
      stair: { xRatio: 0.75, yRatio: 0.5, wFt: 8.0, hFt: 16.0, type: "Open-Well" },
      shaft: { xRatio: 0.85, yRatio: 0.85, wFt: 3.5, hFt: 3.5 },
    },
    layoutGeometry: [
      { id: "liv", name: "GRAND DOUBLE HEIGHT LIVING", type: "living", xRatio: 0, yRatio: 0, wRatio: 0.55, hRatio: 0.3, minWidthFt: 15, minLengthFt: 14, vastuZone: "NE", connections: ["din"], doorWall: "east" },
      { id: "din", name: "ROYAL DINING AREA", type: "dining", xRatio: 0, yRatio: 0.3, wRatio: 0.55, hRatio: 0.25, minWidthFt: 12, minLengthFt: 12, vastuZone: "E", connections: ["liv", "kit"], doorWall: "north" },
      { id: "kit", name: "MODULAR KITCHEN & PANTRY", type: "kitchen", xRatio: 0.55, yRatio: 0, wRatio: 0.45, hRatio: 0.3, minWidthFt: 11, minLengthFt: 10, vastuZone: "SE", connections: ["din", "util"], doorWall: "west" },
      { id: "bed1", name: "MASTER BEDROOM SUITE", type: "master_bedroom", xRatio: 0, yRatio: 0.7, wRatio: 0.55, hRatio: 0.3, minWidthFt: 13, minLengthFt: 14, vastuZone: "SW", connections: ["toi1"], doorWall: "south" },
      { id: "toi1", name: "PREMIUM ATTACHED BATH", type: "attached_toilet", xRatio: 0.55, yRatio: 0.7, wRatio: 0.45, hRatio: 0.3, minWidthFt: 6, minLengthFt: 8, vastuZone: "W", connections: ["bed1"], doorWall: "west" },
    ],
  },

  // 4. 40x60 EAST FACING 4BHK PREMIUM VILLA
  {
    id: "BM-E-4060-04",
    title: "40 × 60 East-Facing 4BHK Presidential Villa",
    plotWidth: 40,
    plotLength: 60,
    minWidth: 36,
    maxWidth: 45,
    minLength: 54,
    maxLength: 66,
    facing: "East",
    roadWidthFt: 40,
    supportedFloors: [2, 3, 4],
    bedroomOptions: [4, 5],
    toiletOptions: [4, 5],
    buildingTypes: ["Duplex", "Own Use"],
    parkingOptions: ["Full Parking", "Half Parking"],
    liftSupported: true,
    vaastu: true,
    vastuScore: 99,
    features: { pooja: true, utility: true, balcony: true, store: true },
    style: "villa",
    architectVerified: true,
    tags: ["East", "40x60", "4BHK", "Villa", "Luxury"],
    verticalCore: {
      lift: { xRatio: 0.55, yRatio: 0.45, wFt: 6.0, hFt: 6.0 },
      stair: { xRatio: 0.7, yRatio: 0.5, wFt: 8.5, hFt: 17.0, type: "Open-Well" },
      shaft: { xRatio: 0.85, yRatio: 0.85, wFt: 4.0, hFt: 4.0 },
    },
    layoutGeometry: [
      { id: "liv", name: "ROYAL FOYER & LIVING", type: "living", xRatio: 0, yRatio: 0, wRatio: 0.5, hRatio: 0.35, minWidthFt: 16, minLengthFt: 16, vastuZone: "NE", connections: ["din"], doorWall: "east" },
      { id: "din", name: "FORMAL BANQUET DINING", type: "dining", xRatio: 0, yRatio: 0.35, wRatio: 0.5, hRatio: 0.3, minWidthFt: 14, minLengthFt: 13, vastuZone: "E", connections: ["liv", "kit"], doorWall: "north" },
      { id: "kit", name: "ISLAND KITCHEN & CHEF PANTRY", type: "kitchen", xRatio: 0.5, yRatio: 0, wRatio: 0.5, hRatio: 0.35, minWidthFt: 13, minLengthFt: 12, vastuZone: "SE", connections: ["din", "util"], doorWall: "west" },
      { id: "bed1", name: "PRESIDENTIAL MASTER SUITE", type: "master_bedroom", xRatio: 0, yRatio: 0.65, wRatio: 0.5, hRatio: 0.35, minWidthFt: 15, minLengthFt: 16, vastuZone: "SW", connections: ["toi1"], doorWall: "south" },
      { id: "toi1", name: "LUXURY MASTER BATH & TUB", type: "attached_toilet", xRatio: 0.5, yRatio: 0.65, wRatio: 0.5, hRatio: 0.35, minWidthFt: 8, minLengthFt: 10, vastuZone: "W", connections: ["bed1"], doorWall: "west" },
    ],
  },

  // 5. 50x80 NORTH FACING PALATIAL VILLA
  {
    id: "BM-N-5080-05",
    title: "50 × 80 North-Facing Palatial Estate Residence",
    plotWidth: 50,
    plotLength: 80,
    minWidth: 46,
    maxWidth: 60,
    minLength: 72,
    maxLength: 90,
    facing: "North",
    roadWidthFt: 40,
    supportedFloors: [2, 3, 4],
    bedroomOptions: [4, 5, 6],
    toiletOptions: [4, 5, 6],
    buildingTypes: ["Duplex", "Own Use"],
    parkingOptions: ["Full Parking", "Half Parking"],
    liftSupported: true,
    vaastu: true,
    vastuScore: 100,
    features: { pooja: true, utility: true, balcony: true, store: true },
    style: "estate",
    architectVerified: true,
    tags: ["North", "50x80", "5BHK", "Estate", "Palace"],
    verticalCore: {
      lift: { xRatio: 0.5, yRatio: 0.45, wFt: 6.5, hFt: 6.5 },
      stair: { xRatio: 0.65, yRatio: 0.5, wFt: 9.0, hFt: 18.0, type: "Open-Well" },
      shaft: { xRatio: 0.85, yRatio: 0.85, wFt: 4.5, hFt: 4.5 },
    },
    layoutGeometry: [
      { id: "liv", name: "GRAND PALATIAL LIVING", type: "living", xRatio: 0, yRatio: 0, wRatio: 0.5, hRatio: 0.35, minWidthFt: 18, minLengthFt: 20, vastuZone: "NE", connections: ["din"], doorWall: "north" },
      { id: "din", name: "BANQUET DINING HALL", type: "dining", xRatio: 0, yRatio: 0.35, wRatio: 0.5, hRatio: 0.3, minWidthFt: 16, minLengthFt: 15, vastuZone: "E", connections: ["liv", "kit"], doorWall: "south" },
      { id: "kit", name: "CHEF'S KITCHEN & PREP KITCHEN", type: "kitchen", xRatio: 0.5, yRatio: 0, wRatio: 0.5, hRatio: 0.35, minWidthFt: 15, minLengthFt: 14, vastuZone: "SE", connections: ["din", "util"], doorWall: "west" },
      { id: "bed1", name: "MASTER SUITE WITH DRESSING", type: "master_bedroom", xRatio: 0, yRatio: 0.65, wRatio: 0.5, hRatio: 0.35, minWidthFt: 16, minLengthFt: 18, vastuZone: "SW", connections: ["toi1"], doorWall: "south" },
      { id: "toi1", name: "SPA ATTACHED BATH", type: "attached_toilet", xRatio: 0.5, yRatio: 0.65, wRatio: 0.5, hRatio: 0.35, minWidthFt: 9, minLengthFt: 12, vastuZone: "W", connections: ["bed1"], doorWall: "west" },
    ],
  },

  // 6. 60x80 WEST FACING LARGE ESTATE RESIDENCE
  {
    id: "BM-W-6080-06",
    title: "60 × 80 West-Facing Courtyard Estate Residence",
    plotWidth: 60,
    plotLength: 80,
    minWidth: 55,
    maxWidth: 70,
    minLength: 72,
    maxLength: 90,
    facing: "West",
    roadWidthFt: 40,
    supportedFloors: [2, 3, 4],
    bedroomOptions: [4, 5, 6],
    toiletOptions: [4, 5, 6],
    buildingTypes: ["Duplex", "Own Use"],
    parkingOptions: ["Full Parking", "Half Parking"],
    liftSupported: true,
    vaastu: true,
    vastuScore: 97,
    features: { pooja: true, utility: true, balcony: true, store: true },
    style: "estate",
    architectVerified: true,
    tags: ["West", "60x80", "5BHK", "Estate"],
    verticalCore: {
      lift: { xRatio: 0.5, yRatio: 0.45, wFt: 6.5, hFt: 6.5 },
      stair: { xRatio: 0.65, yRatio: 0.5, wFt: 9.0, hFt: 18.0, type: "Open-Well" },
      shaft: { xRatio: 0.85, yRatio: 0.85, wFt: 4.5, hFt: 4.5 },
    },
    layoutGeometry: [
      { id: "liv", name: "GRAND LIVING FOYER", type: "living", xRatio: 0, yRatio: 0, wRatio: 0.5, hRatio: 0.35, minWidthFt: 18, minLengthFt: 20, vastuZone: "NW", connections: ["din"], doorWall: "west" },
      { id: "din", name: "ROYAL DINING HALL", type: "dining", xRatio: 0, yRatio: 0.35, wRatio: 0.5, hRatio: 0.3, minWidthFt: 16, minLengthFt: 15, vastuZone: "E", connections: ["liv", "kit"], doorWall: "north" },
      { id: "kit", name: "AGNEYA MODULAR KITCHEN", type: "kitchen", xRatio: 0.5, yRatio: 0, wRatio: 0.5, hRatio: 0.35, minWidthFt: 15, minLengthFt: 14, vastuZone: "SE", connections: ["din"], doorWall: "west" },
      { id: "bed1", name: "MASTER BEDROOM SUITE", type: "master_bedroom", xRatio: 0, yRatio: 0.65, wRatio: 0.5, hRatio: 0.35, minWidthFt: 16, minLengthFt: 18, vastuZone: "SW", connections: ["toi1"], doorWall: "south" },
      { id: "toi1", name: "ATTACHED LUXURY BATH", type: "attached_toilet", xRatio: 0.5, yRatio: 0.65, wRatio: 0.5, hRatio: 0.35, minWidthFt: 9, minLengthFt: 12, vastuZone: "W", connections: ["bed1"], doorWall: "west" },
    ],
  },
];

export function findBestTemplates(req: FloorPlanRequirement): FloorPlanTemplate[] {
  return PRE_FLOOR_PLAN_LIBRARY.filter((t) => t.facing === req.facing || Math.abs(t.plotWidth - req.plotWidth) <= 5).slice(0, 3);
}
