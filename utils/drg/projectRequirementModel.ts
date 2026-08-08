// BUILDMITRA DRG ENGINE — PHASE 1: PROJECT REQUIREMENT MODEL
// SINGLE SOURCE OF TRUTH FOR ALL FUTURE ARCHITECTURAL, STRUCTURAL & MEP GENERATION

export type SiteFacing = "North" | "South" | "East" | "West" | "NE" | "NW" | "SE" | "SW";
export type PlotShape = "Rectangular" | "Square" | "Irregular";
export type PlotUnit = "Feet" | "Metres";
export type ProjectType = "Residential" | "Villa" | "Duplex" | "Triplex" | "Apartment" | "Commercial" | "Mixed Use" | "Other";
export type ConstructionType = "New Construction" | "Extension" | "Renovation";
export type SiteSlope = "Flat" | "Gentle" | "Sloping";
export type StructuralSystemPreference = "RCC Frame" | "Load Bearing" | "Steel" | "Auto Recommend";
export type ConstructionQuality = "Economy" | "Standard" | "Premium" | "Luxury" | "Custom";
export type WallType = "Brick" | "Solid Block" | "AAC Block" | "Other";
export type VastuLevel = "Strict" | "Preferred" | "Balanced" | "No Vastu Preference";
export type ParkingMode = "Full Parking" | "Half Parking" | "No Parking" | "Custom Parking";
export type StaircaseTypePreference = "Dog-legged" | "U-shaped" | "L-shaped" | "Straight" | "Open well" | "Auto Recommend";
export type StaircaseLocationPref = "User Selected" | "Vastu Recommended" | "Auto";
export type LiftLocationPref = "User Selected" | "Near Staircase" | "Auto";

export type Point2D = { x: number; y: number };

// SECTION A: Project Details
export interface ProjectDetails {
  projectName: string;
  clientName: string;
  projectLocation: string;
  city: string;
  state: string;
  pinCode: string;
  projectType: ProjectType;
  constructionType: ConstructionType;
}

// SECTION B: Plot Details
export interface PlotDetails {
  plotWidth: number;
  plotLength: number;
  plotAreaSqFt: number;
  plotUnit: PlotUnit;
  siteFacing: SiteFacing;
  roadSide: SiteFacing;
  roadWidthFt: number;
  isCornerPlot: boolean;
  secondRoadSide?: SiteFacing;
  secondRoadWidthFt?: number;
  plotShape: PlotShape;
  boundaryPoints?: Point2D[];
}

// SECTION C: Site & Soil Information
export interface SiteSoilDetails {
  soilType?: string;
  sbcKpa?: number;
  sbcUnit: string; // e.g. "kN/m²" or "tsf"
  isSoilTestAvailable: boolean;
  groundwaterInfo?: string;
  siteSlope: SiteSlope;
  hasExistingStructures: boolean;
  hasRockEncountered: boolean | "Unknown";
  hasFloodConcern: boolean | "Unknown";
}

// SECTION D: Setbacks
export interface SetbackValues {
  front: number;
  rear: number;
  left: number;
  right: number;
}

export interface SetbackDetails {
  mode: "User Provided" | "Auto Recommend";
  requestedSetback: SetbackValues;
  recommendedSetback: SetbackValues;
  finalAcceptedSetback: SetbackValues;
}

// SECTION E: Building Configuration
export interface BuildingConfig {
  numberOfFloors: number; // e.g. 1 for Ground, 3 for G+2, 4 for G+3
  floorLabels: string[]; // ["Ground Floor", "First Floor", "Second Floor", ...]
  hasBasement: boolean;
  hasStilt: boolean;
  terraceUse: string;
}

// SECTION G & H: Per-Floor Requirement
export interface FloorParkingReq {
  parkingMode: ParkingMode;
  carsCount: number;
  twoWheelersCount: number;
  evChargingRequired: boolean;
  visitorParkingCount: number;
}

export interface CustomRoomReq {
  id: string;
  name: string;
  preferredWidthFt?: number;
  preferredLengthFt?: number;
}

export interface FloorRoomReq {
  livingRoomCount: number;
  diningCount: number;
  kitchenCount: number;
  utilityCount: number;
  masterBedrooms: number;
  otherBedrooms: number;
  guestBedrooms: number;
  childrenBedrooms: number;
  attachedToilets: number;
  commonToilets: number;
  poojaRoom: boolean;
  studyRoom: boolean;
  homeOffice: boolean;
  familyLounge: boolean;
  storeRoom: boolean;
  laundryRoom: boolean;
  walkInWardrobe: boolean;
  balconiesCount: number;
  sitOutCount: number;
  hasTerrace: boolean;
  servantRoom: boolean;
  servantToilet: boolean;
  gym: boolean;
  homeTheatre: boolean;
  partyHall: boolean;
  customRooms: CustomRoomReq[];
}

export interface FloorRequirement {
  floorIndex: number;
  floorLabel: string;
  floorType: string; // "Full Parking", "2BHK", "3BHK", "Commercial", "Custom"
  parking: FloorParkingReq;
  rooms: FloorRoomReq;
  specialRequirements?: string;
}

// SECTION I: Duplex / Triplex
export interface DuplexTriplexConfig {
  isDuplex: boolean;
  duplexFloors: number[]; // e.g. [1, 2] for 1st + 2nd floor
  isTriplex: boolean;
  triplexFloors: number[]; // e.g. [1, 2, 3]
  internalStaircaseRequired: boolean;
}

// SECTION J: Staircase
export interface VerticalStaircase {
  required: boolean;
  typePreference: StaircaseTypePreference;
  locationPref: StaircaseLocationPref;
  isInternal: boolean;
  isExternal: boolean;
  minClearWidthFt?: number;
}

// SECTION K: Lift Core
export interface VerticalLift {
  required: boolean;
  passengerCapacity: "4 Person" | "6 Person" | "8 Person" | "Custom";
  customCapacityText?: string;
  liftType?: string;
  locationPref: LiftLocationPref;
}

export interface VerticalCirculation {
  staircase: VerticalStaircase;
  lift: VerticalLift;
}

// SECTION L: Water & Site Services
export interface WaterSiteServices {
  ugWaterSumpRequired: boolean;
  ugWaterSumpCapacityLiters: number;
  overheadTankRequired: boolean;
  overheadTankCapacityLiters: number;
  rainwaterHarvestingRequired: boolean;
  rechargePitRequired: boolean;
  septicTankRequired: boolean;
  stpRequired: boolean;
  municipalSewerAvailable: boolean;
  borewellRequired: boolean;
  pumpRoomRequired: boolean;
  electricalMeterPanelLocation: string;
  generatorDgRequired: boolean;
  solarRequirement: boolean;
  evChargingSite: boolean;
}

// SECTION M: Vastu Preference
export interface VastuPreferences {
  level: VastuLevel;
  mainDoorDirection?: SiteFacing;
  kitchenDirection?: SiteFacing;
  masterBedDirection?: SiteFacing;
  poojaDirection?: SiteFacing;
  staircaseDirection?: SiteFacing;
  waterSumpDirection?: SiteFacing;
  borewellDirection?: SiteFacing;
  septicTankDirection?: SiteFacing;
}

// SECTION N: Structural Inputs
export interface StructuralInputs {
  sbcKpa?: number;
  numberOfFloors: number;
  floorToFloorHeightFt: number;
  structuralSystemPreference: StructuralSystemPreference;
  specialLoads: {
    waterTankOnTerrace: boolean;
    heavyLiftCore: boolean;
    solarPanelsOnTerrace: boolean;
    partyHallHeavyAssembly: boolean;
    heavyEquipment: boolean;
    customNote?: string;
  };
}

// SECTION O: Construction Preferences
export interface ConstructionPreferences {
  wallType: WallType;
  externalWallThicknessInches: number;
  internalWallThicknessInches: number;
  floorToFloorHeightFt: number;
  constructionQuality: ConstructionQuality;
}

// SECTION P: User Priorities
export interface UserPriorities {
  maxBuiltUpArea: number; // 1 (Low) to 5 (High)
  moreOpenSpace: number;
  moreParking: number;
  largerBedrooms: number;
  largerLivingDining: number;
  vastuCompliance: number;
  naturalLightVentilation: number;
  privacy: number;
  rentalOptimization: number;
  constructionEconomy: number;
  luxuryPlanning: number;
}

// SECTION Q: NORMALIZED PROJECT REQUIREMENT MODEL (SINGLE SOURCE OF TRUTH)
export interface ProjectRequirementModel {
  version: string;
  requirementVersion: string;
  status: "draft" | "confirmed";
  confirmedAt?: string;
  confirmedBy?: string;
  updatedAt: string;
  isConfirmed: boolean; // Confirmed by user to proceed to Phase 2
  project: ProjectDetails;
  plot: PlotDetails;
  siteSoil: SiteSoilDetails;
  setbacks: SetbackDetails;
  building: BuildingConfig;
  floors: FloorRequirement[];
  duplexTriplex: DuplexTriplexConfig;
  verticalCirculation: VerticalCirculation;
  waterServices: WaterSiteServices;
  vastu: VastuPreferences;
  structuralInputs: StructuralInputs;
  constructionPreferences: ConstructionPreferences;
  userPriorities: UserPriorities;
}

// FACTORY FOR INITIALIZING DEFAULT ROOM REQUIREMENTS
export const createDefaultFloorRoomReq = (): FloorRoomReq => ({
  livingRoomCount: 1,
  diningCount: 1,
  kitchenCount: 1,
  utilityCount: 1,
  masterBedrooms: 1,
  otherBedrooms: 1,
  guestBedrooms: 0,
  childrenBedrooms: 0,
  attachedToilets: 2,
  commonToilets: 1,
  poojaRoom: true,
  studyRoom: false,
  homeOffice: false,
  familyLounge: false,
  storeRoom: false,
  laundryRoom: false,
  walkInWardrobe: false,
  balconiesCount: 1,
  sitOutCount: 0,
  hasTerrace: false,
  servantRoom: false,
  servantToilet: false,
  gym: false,
  homeTheatre: false,
  partyHall: false,
  customRooms: [],
});

// DEFAULT PROJECT REQUIREMENT MODEL
export const createDefaultProjectRequirementModel = (): ProjectRequirementModel => ({
  version: "1.0.0",
  requirementVersion: "1.0.0",
  status: "draft",
  updatedAt: new Date().toISOString(),
  isConfirmed: false,
  project: {
    projectName: "Reddy Residential Building",
    clientName: "Srikanth Reddy",
    projectLocation: "Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pinCode: "560038",
    projectType: "Duplex",
    constructionType: "New Construction",
  },
  plot: {
    plotWidth: 30,
    plotLength: 40,
    plotAreaSqFt: 1200,
    plotUnit: "Feet",
    siteFacing: "South",
    roadSide: "South",
    roadWidthFt: 30,
    isCornerPlot: false,
    plotShape: "Rectangular",
  },
  siteSoil: {
    soilType: "Medium Clay",
    sbcKpa: 200,
    sbcUnit: "kN/m²",
    isSoilTestAvailable: true,
    groundwaterInfo: "Below 12 ft",
    siteSlope: "Flat",
    hasExistingStructures: false,
    hasRockEncountered: false,
    hasFloodConcern: false,
  },
  setbacks: {
    mode: "User Provided",
    requestedSetback: { front: 3, rear: 2, left: 2, right: 2 },
    recommendedSetback: { front: 3, rear: 2, left: 2.5, right: 2.5 },
    finalAcceptedSetback: { front: 3, rear: 2, left: 2, right: 2 },
  },
  building: {
    numberOfFloors: 3, // Ground, 1st, 2nd (G+2)
    floorLabels: ["Ground Floor", "First Floor", "Second Floor"],
    hasBasement: false,
    hasStilt: true,
    terraceUse: "Open Terrace & Solar",
  },
  floors: [
    {
      floorIndex: 0,
      floorLabel: "Ground Floor",
      floorType: "Full Parking",
      parking: {
        parkingMode: "Full Parking",
        carsCount: 2,
        twoWheelersCount: 4,
        evChargingRequired: true,
        visitorParkingCount: 1,
      },
      rooms: { ...createDefaultFloorRoomReq(), livingRoomCount: 0, diningCount: 0, kitchenCount: 0, masterBedrooms: 0, otherBedrooms: 0, attachedToilets: 0, commonToilets: 1 },
      specialRequirements: "Driver rest room + EV charging panel",
    },
    {
      floorIndex: 1,
      floorLabel: "First Floor",
      floorType: "Duplex Lower Level (Living & Kitchen)",
      parking: { parkingMode: "No Parking", carsCount: 0, twoWheelersCount: 0, evChargingRequired: false, visitorParkingCount: 0 },
      rooms: { ...createDefaultFloorRoomReq(), masterBedrooms: 1, otherBedrooms: 0, attachedToilets: 1, commonToilets: 1, familyLounge: true },
      specialRequirements: "Double height ceiling for living room",
    },
    {
      floorIndex: 2,
      floorLabel: "Second Floor",
      floorType: "Duplex Upper Level (Bedrooms)",
      parking: { parkingMode: "No Parking", carsCount: 0, twoWheelersCount: 0, evChargingRequired: false, visitorParkingCount: 0 },
      rooms: { ...createDefaultFloorRoomReq(), masterBedrooms: 1, otherBedrooms: 2, attachedToilets: 2, commonToilets: 0, studyRoom: true },
      specialRequirements: "Walk-in wardrobe attached to Master Bedroom",
    },
  ],
  duplexTriplex: {
    isDuplex: true,
    duplexFloors: [1, 2],
    isTriplex: false,
    triplexFloors: [],
    internalStaircaseRequired: true,
  },
  verticalCirculation: {
    staircase: {
      required: true,
      typePreference: "Dog-legged",
      locationPref: "User Selected",
      isInternal: true,
      isExternal: true,
      minClearWidthFt: 3.5,
    },
    lift: {
      required: true,
      passengerCapacity: "4 Person",
      locationPref: "Near Staircase",
    },
  },
  waterServices: {
    ugWaterSumpRequired: true,
    ugWaterSumpCapacityLiters: 8000,
    overheadTankRequired: true,
    overheadTankCapacityLiters: 4000,
    rainwaterHarvestingRequired: true,
    rechargePitRequired: true,
    septicTankRequired: false,
    stpRequired: false,
    municipalSewerAvailable: true,
    borewellRequired: true,
    pumpRoomRequired: true,
    electricalMeterPanelLocation: "Ground Floor Stilt Area",
    generatorDgRequired: false,
    solarRequirement: true,
    evChargingSite: true,
  },
  vastu: {
    level: "Preferred",
    mainDoorDirection: "East",
    kitchenDirection: "SE",
    masterBedDirection: "SW",
    poojaDirection: "NE",
    staircaseDirection: "NW",
    waterSumpDirection: "NE",
    borewellDirection: "NE",
    septicTankDirection: "NW",
  },
  structuralInputs: {
    sbcKpa: 200,
    numberOfFloors: 3,
    floorToFloorHeightFt: 10,
    structuralSystemPreference: "RCC Frame",
    specialLoads: {
      waterTankOnTerrace: true,
      heavyLiftCore: true,
      solarPanelsOnTerrace: true,
      partyHallHeavyAssembly: false,
      heavyEquipment: false,
    },
  },
  constructionPreferences: {
    wallType: "AAC Block",
    externalWallThicknessInches: 9,
    internalWallThicknessInches: 4.5,
    floorToFloorHeightFt: 10,
    constructionQuality: "Premium",
  },
  userPriorities: {
    maxBuiltUpArea: 4,
    moreOpenSpace: 3,
    moreParking: 5,
    largerBedrooms: 4,
    largerLivingDining: 5,
    vastuCompliance: 4,
    naturalLightVentilation: 5,
    privacy: 4,
    rentalOptimization: 2,
    constructionEconomy: 3,
    luxuryPlanning: 4,
  },
});

// PRESET TEST CASE A: 30x40 South Facing G+2 Duplex
export const TEST_CASE_A_MODEL: ProjectRequirementModel = createDefaultProjectRequirementModel();

// PRESET TEST CASE B: 40x60 East Facing G+2 Multi-Unit (Soil Test Pending)
export const TEST_CASE_B_MODEL: ProjectRequirementModel = {
  ...createDefaultProjectRequirementModel(),
  project: {
    projectName: "Anand Apartment & Residency",
    clientName: "Rajesh Anand",
    projectLocation: "Whitefield",
    city: "Bengaluru",
    state: "Karnataka",
    pinCode: "560066",
    projectType: "Apartment",
    constructionType: "New Construction",
  },
  plot: {
    plotWidth: 40,
    plotLength: 60,
    plotAreaSqFt: 2400,
    plotUnit: "Feet",
    siteFacing: "East",
    roadSide: "East",
    roadWidthFt: 40,
    isCornerPlot: false,
    plotShape: "Rectangular",
  },
  siteSoil: {
    soilType: "Unknown",
    sbcKpa: undefined, // UNKNOWN SBC -> TRIGGERS WARNING
    sbcUnit: "kN/m²",
    isSoilTestAvailable: false,
    siteSlope: "Flat",
    hasExistingStructures: false,
    hasRockEncountered: "Unknown",
    hasFloodConcern: false,
  },
  setbacks: {
    mode: "Auto Recommend",
    requestedSetback: { front: 4, rear: 3, left: 3, right: 3 },
    recommendedSetback: { front: 4.5, rear: 3, left: 3.5, right: 3.5 },
    finalAcceptedSetback: { front: 4.5, rear: 3, left: 3.5, right: 3.5 },
  },
  building: {
    numberOfFloors: 3,
    floorLabels: ["Ground Floor", "First Floor", "Second Floor"],
    hasBasement: false,
    hasStilt: true,
    terraceUse: "Common Terrace",
  },
  floors: [
    {
      floorIndex: 0,
      floorLabel: "Ground Floor",
      floorType: "Half Parking + 1BHK Rental",
      parking: { parkingMode: "Half Parking", carsCount: 3, twoWheelersCount: 6, evChargingRequired: true, visitorParkingCount: 2 },
      rooms: { ...createDefaultFloorRoomReq(), masterBedrooms: 1, otherBedrooms: 0, attachedToilets: 1, commonToilets: 1 },
    },
    {
      floorIndex: 1,
      floorLabel: "First Floor",
      floorType: "3BHK Owner Residence",
      parking: { parkingMode: "No Parking", carsCount: 0, twoWheelersCount: 0, evChargingRequired: false, visitorParkingCount: 0 },
      rooms: { ...createDefaultFloorRoomReq(), masterBedrooms: 1, otherBedrooms: 2, attachedToilets: 2, commonToilets: 1 },
    },
    {
      floorIndex: 2,
      floorLabel: "Second Floor",
      floorType: "2 Units of 2BHK Rental",
      parking: { parkingMode: "No Parking", carsCount: 0, twoWheelersCount: 0, evChargingRequired: false, visitorParkingCount: 0 },
      rooms: { ...createDefaultFloorRoomReq(), masterBedrooms: 2, otherBedrooms: 2, attachedToilets: 2, commonToilets: 1 },
    },
  ],
  duplexTriplex: {
    isDuplex: false,
    duplexFloors: [],
    isTriplex: false,
    triplexFloors: [],
    internalStaircaseRequired: false,
  },
  verticalCirculation: {
    staircase: { required: true, typePreference: "Dog-legged", locationPref: "Vastu Recommended", isInternal: false, isExternal: true },
    lift: { required: true, passengerCapacity: "6 Person", locationPref: "Near Staircase" },
  },
};

// PRESET TEST CASE C: 60x80 North Facing Luxury G+3 Villa
export const TEST_CASE_C_MODEL: ProjectRequirementModel = {
  ...createDefaultProjectRequirementModel(),
  project: {
    projectName: "Grand Royal Villa",
    clientName: "Dr. Vikram Patil",
    projectLocation: "Sadashivanagar",
    city: "Bengaluru",
    state: "Karnataka",
    pinCode: "560080",
    projectType: "Villa",
    constructionType: "New Construction",
  },
  plot: {
    plotWidth: 60,
    plotLength: 80,
    plotAreaSqFt: 4800,
    plotUnit: "Feet",
    siteFacing: "North",
    roadSide: "North",
    roadWidthFt: 50,
    isCornerPlot: true,
    secondRoadSide: "East",
    secondRoadWidthFt: 30,
    plotShape: "Rectangular",
  },
  siteSoil: {
    soilType: "Hard Rock",
    sbcKpa: 350,
    sbcUnit: "kN/m²",
    isSoilTestAvailable: true,
    siteSlope: "Flat",
    hasExistingStructures: false,
    hasRockEncountered: true,
    hasFloodConcern: false,
  },
  building: {
    numberOfFloors: 4,
    floorLabels: ["Ground Floor", "First Floor", "Second Floor", "Third Floor"],
    hasBasement: true,
    hasStilt: true,
    terraceUse: "Private Sky Lounge & Infinity Pool",
  },
  floors: [
    {
      floorIndex: 0,
      floorLabel: "Ground Floor",
      floorType: "Grand Stilt Parking & Lobby",
      parking: { parkingMode: "Full Parking", carsCount: 6, twoWheelersCount: 8, evChargingRequired: true, visitorParkingCount: 4 },
      rooms: { ...createDefaultFloorRoomReq(), livingRoomCount: 0, diningCount: 0, kitchenCount: 0, masterBedrooms: 0, otherBedrooms: 0 },
    },
    {
      floorIndex: 1,
      floorLabel: "First Floor",
      floorType: "Triplex Level 1 (Living & Formal Dining)",
      parking: { parkingMode: "No Parking", carsCount: 0, twoWheelersCount: 0, evChargingRequired: false, visitorParkingCount: 0 },
      rooms: { ...createDefaultFloorRoomReq(), livingRoomCount: 2, diningCount: 1, kitchenCount: 1, guestBedrooms: 1, homeTheatre: true },
    },
    {
      floorIndex: 2,
      floorLabel: "Second Floor",
      floorType: "Triplex Level 2 (Family Bedrooms)",
      parking: { parkingMode: "No Parking", carsCount: 0, twoWheelersCount: 0, evChargingRequired: false, visitorParkingCount: 0 },
      rooms: { ...createDefaultFloorRoomReq(), masterBedrooms: 2, childrenBedrooms: 2, attachedToilets: 4, familyLounge: true },
    },
    {
      floorIndex: 3,
      floorLabel: "Third Floor",
      floorType: "Triplex Level 3 (Gym, Spa & Sky Lounge)",
      parking: { parkingMode: "No Parking", carsCount: 0, twoWheelersCount: 0, evChargingRequired: false, visitorParkingCount: 0 },
      rooms: { ...createDefaultFloorRoomReq(), gym: true, partyHall: true, attachedToilets: 2 },
    },
  ],
  duplexTriplex: {
    isDuplex: false,
    duplexFloors: [],
    isTriplex: true,
    triplexFloors: [1, 2, 3],
    internalStaircaseRequired: true,
  },
  verticalCirculation: {
    staircase: { required: true, typePreference: "Open well", locationPref: "User Selected", isInternal: true, isExternal: true, minClearWidthFt: 4.5 },
    lift: { required: true, passengerCapacity: "8 Person", locationPref: "Near Staircase" },
  },
};
