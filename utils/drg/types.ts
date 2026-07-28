export type Facing = "East" | "West" | "North" | "South";
export type PlotShape = "Rectangle" | "Square" | "Irregular";
export type ParkingPreference = "Full Parking" | "Half Parking" | "No Parking";
export type GroundFloorUse =
  | "Residential"
  | "Parking with residential"
  | "Full parking"
  | "Commercial"
  | "Office"
  | "Shop"
  | "Mixed use"
  | "Custom";

export type StaircaseRequirement =
  | "Internal Staircase"
  | "External Staircase"
  | "Both Internal and External"
  | "Automatic Logical Selection"
  | "No Staircase";

export type LiftRequirementOption = "Lift Required" | "Future Lift Provision" | "Neither";

export type BuildingType =
  | "Independent House"
  | "Villa"
  | "Apartment"
  | "Residential Building"
  | "Commercial Building"
  | "Office Building"
  | "Shop"
  | "Mixed Use"
  | "Rental Building"
  | "Custom";

export type BuildingUsage = "Own Use" | "Rental Use" | "Own and Rental Use";

export type StructuralSystemPreference =
  | "RCC Framed Structure"
  | "Load-Bearing Structure"
  | "Steel Structure"
  | "Automatic Preliminary Recommendation";

export type BuildingUse = "Own Use" | "Rental" | "Own Use + Rental" | "Duplex" | "Villa" | "Commercial" | "Mixed";
export type StaircaseType = "Internal" | "External" | "Duplex Cutout";
export type StaircaseShape = "L-Shaped" | "Dog-Legged" | "Straight" | "Spiral" | "U-Shaped" | "Open-Well";
export type KitchenType = "Open" | "Closed" | "Island";
export type KitchenPlatformType = "L-Shaped" | "U-Shaped" | "Straight" | "Parallel";
export type PreferenceLevel = "Mandatory" | "Preferred" | "Optional";
export type VaastuStrictness = "Strict" | "Preferred" | "Ignore";
export type ArchitecturalStyle = "Modern" | "Traditional" | "Minimalist" | "Contemporary";

export type PrimaryTab =
  | "phase0"
  | "structural_planning"
  | "ground_floor"
  | "circulation_planning"
  | "architectural"
  | "elevation"
  | "section"
  | "structural"
  | "boq"
  | "candidates";

export type StructuralSubview = "column_grid" | "footing_plan" | "beam_layout" | "slab_layout" | "stair_core" | "specimen_detail" | "all_combined";

export type Point2D = { x: number; y: number };
export type Box2D = { x: number; y: number; w: number; h: number };

export type DRGInputs = {
  // Section 1 — Project Information
  projectName: string;
  projectLocation: string;
  city: string;
  state: string;
  pinCode: string;
  projectNotes: string;

  // Section 2 — Plot Information
  plotWidth: number;
  plotLength: number;
  plotUnit: "ft" | "m";
  plotShape: PlotShape;
  facing: Facing;
  roadWidth: number;
  roadDirection: Facing;
  northDirection: Facing;
  isCornerPlot: boolean;
  secondRoadFacing?: Facing;
  secondRoadWidth?: number;
  setbacks: { front: number; rear: number; left: number; right: number };

  // Section 3 — Building Information
  floors: number; // 1 to 12 (Ground Floor plus 11 upper floors, max 12 storeys)
  buildingType: BuildingType;
  buildingUsage: BuildingUsage;
  buildingUse: BuildingUse;
  hasBasement: boolean;
  hasStilt: boolean;
  terraceUse: string;
  farLimit: number;
  maxCoveragePercent: number;
  heightRestriction: number;
  localRuleProfile: string;

  // Section 4 — Soil and Structural Information
  soilType: "Auto" | "Hard Rock" | "Medium Clay/Sand" | "Soft Soil" | "Loose Sand";
  sbcKpa: number;
  sbcUnit: "kN/m²" | "kPa";
  isSoilTestAvailable: boolean;
  groundwaterCondition: string;
  structuralSystemPreference: StructuralSystemPreference;
  customStructuralNotes: string;

  // Structural Engineering Parameters
  concreteGrade: "M20" | "M25" | "M30" | "M35" | "M40";
  steelGrade: "Fe500D" | "Fe550D";
  externalWallThicknessInches: number;
  internalWallThicknessInches: number;
  floorToFloorHeightFt: number;
  seismicZone: "Zone II" | "Zone III" | "Zone IV" | "Zone V";
  windZoneMs: number;

  // Section 5 — Architectural Circulation & Services
  staircaseRequirement: StaircaseRequirement;
  liftRequired: boolean;
  futureLiftProvision: boolean;
  ugtRequired: boolean;
  ugtCapacityLiters?: number;

  // Section 6 — Parking Preference (ONLY 3 OPTIONS)
  parkingPreference: ParkingPreference;

  // Section 7 — Fixed Room Requirement Inputs (Counts)
  bedroomsCount: number;
  masterBedroomsCount: number;
  attachedToiletsCount: number;
  commonToiletsCount: number;
  kitchensCount: number;
  livingRoomsCount: number;
  diningRoomsCount: number;

  // Section 8 — Optional Spaces (Checkboxes)
  poojaRoom: boolean;
  storeRoom: boolean;
  balcony: boolean;
  utility: boolean;
  verandah: boolean;
  studyRoom: boolean;
  officeRoom: boolean;
  familyLiving: boolean;
  guestRoom: boolean;
  servantRoom: boolean;
  laundryArea: boolean;
  sitOut: boolean;
  courtyard: boolean;
  landscape: boolean;
  futureExpansion: boolean;

  // Dedicated Ground Floor Toggle Fields
  groundFloorUse: GroundFloorUse;
  landscapePreference: "Required" | "Not required";
  futureExpansionPreference: "Required" | "Not required";
  gfLiving: boolean;
  gfFamilyLiving: boolean;
  gfDining: boolean;
  gfKitchen: boolean;
  gfUtility: boolean;
  gfBedroomsCount: number;
  gfMasterBedroomsCount: number;
  gfGuestBedroomsCount: number;
  gfAttachedToiletsCount: number;
  gfCommonToiletsCount: number;
  gfPoojaRoom: boolean;
  gfStudyRoom: boolean;
  gfStoreRoom: boolean;
  gfOfficeRoom: boolean;
  gfServantRoom: boolean;

  // Legacy Compatibility
  existingBorewell: boolean;
  existingSepticTank: boolean;
  existingTrees: boolean;
  existingBuilding: boolean;
  existingGate: boolean;
  existingFeatures: string[];
  parkingRequired?: boolean;
  parking?: string;
  carCount?: number;
  twoWheelerCount?: number;
  coveredParking?: boolean;
  visitorParking?: boolean;
  parkingEntrySide?: Facing;
  separatePedestrianGate?: boolean;
  staircaseType: StaircaseType;
  staircaseShape: StaircaseShape;
  staircaseWidthFt: number;
  separateRentalStaircase: boolean;
  lift: boolean;
  liftOption?: string;
  liftCapacity: string;
  liftPositionPreference: string;
  bedrooms: number;
  masterBedrooms: number;
  guestBedrooms: number;
  childrenBedrooms: number;
  toilets?: number;
  attachedToilets: number;
  commonToilets: number;
  powderToilets: number;
  livingRooms: number;
  familyLivingRooms: number;
  diningRooms: number;
  kitchens: number;
  kitchenType: KitchenType;
  utilityCount: number;
  storeRooms: number;
  poojaRooms: number;
  studyRooms: number;
  homeOffices: number;
  servantRooms: number;
  homeTheatres: number;
  gymRooms: number;
  laundryRooms: number;
  balconies: number;
  sitouts: number;
  foyers: number;
  courtyards: number;
  oneKitchenPerFloor: boolean;
  separateRentalKitchen: boolean;
  utilityAttachedToKitchen: PreferenceLevel;
  storeAttachedToKitchen: PreferenceLevel;
  kitchenPlatformType: KitchenPlatformType;
  sinkPositionPreference: string;
  refrigeratorSpace: boolean;
  breakfastCounter: boolean;
  attachedToiletChoice: string;
  commonToiletLocation: string;
  separateBathAndWC: boolean;
  toiletVentilatorMandatory: boolean;
  wetAreaVerticalStacking: boolean;
  balconyPreference: string;
  balconyAttachedTo: string;
  masterBalconyChoice: PreferenceLevel;
  livingBalconyChoice: PreferenceLevel;
  utilityBalcony: boolean;
  balconyCount: number;
  minBalconyWidthFt: number;
  vaastuStrictness: VaastuStrictness;
  stylePreference: ArchitecturalStyle;
  ventilationPriority: boolean;
  daylightPriority: boolean;
  privacyPriority: boolean;
};

export type ProjectDesignBrief = {
  projectType: string;
  plotSize: string;
  plotFacing: string;
  plotShape: string;
  floorsRequested: string;
  buildingUsage: string;
  parkingRequirement: string;
  liftRequirement: string;
  vaastuStatus: string;
  userDesignGoal: string;
};

export type DynamicDesignObjective = {
  id: string;
  category: string;
  objective: string;
  rationale: string;
};

export type StructuralPlanningRecommendations = {
  structuralRequirement: string;
  verticalCirculationRequirement: string;
  parkingRequirement: string;
  alignmentRequirement: string;
  siteConstraints: string[];
};

export type Phase0AnalysisReport = {
  projectDesignBrief: ProjectDesignBrief;
  plotSummary: {
    plotDimensions: string;
    plotAreaSqFt: number;
    plotShape: string;
    facing: string;
    roadInfo: string;
    cornerPlot: boolean;
  };
  regulatorySummary: {
    permittedFAR: number;
    maxCoveragePercent: number;
    maxHeightFt: number;
    buildableEnvelopeFt: string;
    buildableFootprintSqFt: number;
    maxPermittedFootprintSqFt: number;
    permittedTotalBUASqFt: number;
    setbackAreaSqFt: number;
  };
  orientationRecommendation: {
    bestBuildingOrientation: string;
    entryExitLocation: string;
    vehicleAccessPoint: string;
    pedestrianGateLocation: string;
  };
  openSpaceAndClimate: {
    naturalLightOpportunities: string;
    crossVentilationOpportunities: string;
    openSpaceAllocationSqFt: number;
  };
  serviceZones: {
    kitchenUtilityZone: string;
    toiletsStaircaseZone: string;
    masterBedroomZone: string;
    poojaMandirZone: string;
  };
  constraintsAndOpportunities: {
    siteConstraints: string[];
    designOpportunities: string[];
  };
  designObjectives: DynamicDesignObjective[];
  recommendationsForStructuralPlanning: StructuralPlanningRecommendations;
};

export type StructuralFooting = {
  id: string;
  supportedColumnId: string;
  x: number;
  y: number;
  lengthM: number;
  widthM: number;
  thicknessM: number;
  depthFt: number;
  type: "isolated" | "combined" | "strap" | "raft" | "pile";
};

export type StructuralMarkingValidation = {
  columnCheck: {
    generatedColumns: number;
    displayedColumnMarks: number;
    scheduledColumns: number;
    status: "PASS" | "FAIL";
  };
  footingCheck: {
    generatedFootings: number;
    displayedFootingMarks: number;
    scheduledFootings: number;
    status: "PASS" | "FAIL";
  };
  validationPassed: boolean;
};

export type StructuralPlanningReport = {
  siteParameters: {
    floors: number;
    sbcKpa: number;
    soilType: string;
    seismicZone: string;
    windZoneMs: number;
    isAutoSBC: boolean;
  };
  structuralGridSummary: {
    gridLinesX: string[];
    gridLinesY: string[];
    columnCount: number;
    baySpacingFt: string;
    verticalContinuityStatus: string;
    spanChainX: { label: string; lengthFt: string }[];
    totalLengthXFt: string;
    spanChainY: { label: string; lengthFt: string }[];
    totalLengthYFt: string;
  };
  footings: StructuralFooting[];
  foundationRecommendation: {
    foundationType: string;
    footingType: string;
    recommendedFootingSize: string;
    minEmbedmentDepthFt: number;
    reason: string;
  };
  columnRecommendation: {
    columnSizeInches: string;
    mainBarDetail: string;
    stirrupDetail: string;
    columnSpacingStrategy: string;
    reason: string;
  };
  plinthBeamRecommendation: {
    beamSizeInches: string;
    mainReinforcement: string;
    stirrupDetail: string;
    reason: string;
  };
  floorBeamRecommendation: {
    primaryBeamSizeInches: string;
    beamSpanStrategy: string;
    maxSpanFt: number;
    reason: string;
  };
  materials: {
    concreteGrade: string;
    concreteReason: string;
    reinforcementSteelGrade: string;
    steelReason: string;
    isCodeCompliant: boolean;
  };
  schedules: {
    columnSchedule: { mark: string; size: string; mainBars: string; ties: string }[];
    footingSchedule: { mark: string; size: string; thickness: string; depth: string; column: string }[];
    beamSchedule: { mark: string; type: string; size: string; mainBars: string; stirrups: string }[];
  };
  markingValidation: StructuralMarkingValidation;
  validationWarnings: {
    id: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    title: string;
    message: string;
  }[];
  engineeringNotes: string[];
};

export type GroundFloorParkingBay = {
  id: string;
  vehicleType: "Car" | "Two-Wheeler";
  x: number;
  y: number;
  w: number;
  h: number;
  bayWidthFt: number;
  bayLengthFt: number;
  drivewayWidthFt: number;
  gateWidthFt: number;
  orientation: "north" | "south" | "east" | "west";
  usabilityStatus: "Usable - Clear Manoeuvring Route";
  movementPath: Point2D[];
  isAccessible?: boolean;
  isVisitor?: boolean;
};

export type GroundFloorStaircase = {
  id: string;
  type: "Dog-Legged" | "U-Shaped" | "L-Shaped" | "Straight" | "Open-Well" | "External";
  x: number;
  y: number;
  w: number;
  h: number;
  numRisers: number;
  riserSizeInches: number;
  treadSizeInches: number;
  landingWidthFt: number;
  stairWidthFt: number;
  isExternal: boolean;
  flightDirection: "north" | "south" | "east" | "west";
  headroomStatus: "Clear 7′0″ Minimum Headroom";
};

export type GroundFloorLift = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shaftWidthFt: number;
  shaftLengthFt: number;
  carWidthFt: number;
  carLengthFt: number;
  doorWidthFt: number;
  lobbyClearWidthFt: number;
  capacity: string;
  isFutureProvision: boolean;
  pitDepthFt: number;
  overheadFt: number;
  verticalAlignmentStatus: "100% Vertically Aligned & Stacked";
};

export type GroundFloorUGT = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  capacityLiters: number;
  manholeLocation: Point2D;
  inletLocation: Point2D;
  outletLocation: Point2D;
  pumpConnection: string;
  structuralNote: string;
};

export type GroundFloorLandscapeZone = {
  id: string;
  kind: "Lawn" | "Paved Walkway" | "Planter" | "Courtyard" | "Kitchen Garden" | "Rainwater Pit" | "Future Expansion Zone" | "Sit-out";
  x: number;
  y: number;
  w: number;
  h: number;
  areaSqFt: number;
};

export type GroundFloorAreaScheduleItem = {
  spaceName: string;
  lengthFt: number;
  widthFt: number;
  areaSqFt: number;
  category: "Built-Up" | "Parking" | "Circulation" | "Landscape" | "Utility";
};

export type GroundFloorValidationReport = {
  parkingValidation: {
    requestedPreference: ParkingPreference;
    generatedBays: number;
    carSymbolsRendered: number;
    routeAvailable: boolean;
    columnConflict: boolean;
    status: "PASS" | "FAIL";
  };
  staircaseValidation: {
    requested: boolean;
    generated: boolean;
    typeSymbolRendered: boolean;
    upArrowRendered: boolean;
    geometryComplete: boolean;
    landingGenerated: boolean;
    status: "PASS" | "FAIL";
  };
  liftValidation: {
    requested: boolean;
    generated: boolean;
    isFutureProvision: boolean;
    shaftSymbolRendered: boolean;
    doorLobbyRendered: boolean;
    status: "PASS" | "FAIL";
  };
  ugtValidation: {
    requested: boolean;
    positioned: boolean;
    capacityLiters: number;
    columnFootingConflict: boolean;
    manholeShown: boolean;
    status: "PASS" | "FAIL";
  };
  roomProportionsValidation: {
    oversizedRoomsDetected: boolean;
    largePlotCompactLayout: boolean;
    status: "PASS" | "FAIL";
  };
  allPassed: boolean;
};

export type GroundFloorPlanningReport = {
  projectInputs: {
    groundFloorUse: GroundFloorUse;
    parkingPreference: ParkingPreference;
    staircaseRequirement: StaircaseRequirement;
    liftRequirement: string;
    ugtRequirement: string;
    landscapePreference: string;
    futureExpansion: string;
  };
  userRequirements: {
    requestedRoomsList: string[];
    roomCountTotal: number;
  };
  parkingPreference: ParkingPreference;
  plotBoundary: Box2D;
  road: { facing: Facing; widthFt: number; label: string };
  setbacks: { front: number; rear: number; left: number; right: number };
  buildableEnvelope: Box2D;
  buildingOutline: Box2D;
  gates: { id: string; x: number; y: number; widthFt: number; type: "VG1" | "PG1" }[];
  driveway: { x: number; y: number; w: number; h: number; minWidthFt: number };
  parkingBays: GroundFloorParkingBay[];
  vehicleSymbols: { id: string; x: number; y: number; type: "Car" | "Two-Wheeler" }[];
  twoWheelerSymbols: { id: string; x: number; y: number }[];
  rooms: { id: string; name: string; x: number; y: number; w: number; h: number; areaSqFt: number }[];
  walls: { id: string; x1: number; y1: number; x2: number; y2: number; isExternal: boolean }[];
  doors: Point2D[];
  windows: Point2D[];
  columns: StructuralColumn[];
  staircase: GroundFloorStaircase;
  lift?: GroundFloorLift;
  ugt?: GroundFloorUGT;
  landscapeZones: GroundFloorLandscapeZone[];
  dimensions: { label: string; valFt: number; orientation: "h" | "v" }[];
  areaSchedule: {
    items: GroundFloorAreaScheduleItem[];
    totalGroundSqFt: number;
    builtUpSqFt: number;
    parkingAreaSqFt: number;
    landscapeAreaSqFt: number;
    circulationAreaSqFt: number;
    coveragePercent: number;
    farAchieved: number;
    farBalance: number;
  };
  validations: GroundFloorValidationReport;
  renderingValidation: {
    parkingRendering: { requested: ParkingPreference; generated: number; rendered: number; carSymbolsRendered: number; status: "PASS" | "FAIL" };
    staircaseRendering: { requested: boolean; generated: boolean; rendered: boolean; treadsRendered: boolean; upArrowRendered: boolean; status: "PASS" | "FAIL" };
    liftRendering: { requested: boolean; generated: boolean; shaftRendered: boolean; carRendered: boolean; doorRendered: boolean; status: "PASS" | "FAIL" };
    tankRendering: { requested: boolean; generated: boolean; outlineRendered: boolean; manholeRendered: boolean; status: "PASS" | "FAIL" };
    accessRendering: { roadRendered: boolean; gateRendered: boolean; gateConnectedToRoad: boolean; status: "PASS" | "FAIL" };
    setbackRendering: { fourSetbacksGenerated: boolean; redDottedStyleConfirmed: boolean; labelsRendered: boolean; status: "PASS" | "FAIL" };
    visualCompletenessStatus: "PASS" | "FAIL";
  };
};

export type SpaceRequirement = {
  id: string;
  type: string;
  name: string;
  count: number;
  targetFloor: number;
  allowedFloors: number[];
  minWidthFt: number;
  maxWidthFt: number;
  minDepthFt: number;
  maxDepthFt: number;
  minAreaSqFt: number;
  preferredAreaSqFt: number;
  maxAreaSqFt: number;
  privacyZone: "public" | "semi-private" | "private" | "service";
  adjacency: string[];
  avoidAdjacency: string[];
  plumbingRequired: boolean;
  exteriorAccessRequired: boolean;
  aspectRatioRange: [number, number];
};

export type SpaceProgramme = {
  totalRequestedRooms: number;
  spaces: SpaceRequirement[];
};

export type FloorProgramme = {
  floorIndex: number;
  identity: string;
  allocatedSpaceIds: string[];
};

export type RoomKind =
  | "bedroom"
  | "living"
  | "dining"
  | "kitchen"
  | "toilet"
  | "utility"
  | "pooja"
  | "store"
  | "balcony"
  | "sitout"
  | "stair"
  | "lift"
  | "foyer"
  | "parking"
  | "study"
  | "office"
  | "lounge"
  | "electrical"
  | "security";

export type FurnitureItem = {
  id: string;
  kind: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  label: string;
};

export type OpeningSymbol = {
  id: string;
  side: "north" | "south" | "east" | "west";
  offsetRatio: number;
  width: number;
  isDoubleLeaf?: boolean;
  isVentilator?: boolean;
};

export type RoomRect = {
  id: string;
  floor: number;
  unitNo: string;
  name: string;
  kind: RoomKind;
  x: number;
  y: number;
  w: number;
  h: number;
  doors: OpeningSymbol[];
  windows: OpeningSymbol[];
  furniture: FurnitureItem[];
  notes?: string;
  plumbingStackId?: string;
};

export type WallSegment = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  isExternal: boolean;
};

export type StructuralColumn = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  gridRef: string;
  footingType: "Isolated Footing" | "Combined Footing" | "Mat Foundation" | "Pile Foundation";
};

export type StructuralBeam = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  spanFt: number;
  depthInches: number;
  widthInches: number;
};

export type StructuralSlab = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  thicknessInches: number;
  type: "One-Way Slab" | "Two-Way Slab";
};

export type FloorLayout = {
  level: number;
  name: string;
  identity?: string;
  rooms: RoomRect[];
  walls?: WallSegment[];
  floorAreaSqFt?: number;
};

export type CandidateLayout = {
  id: string;
  title: string;
  strategy: string;
  score: number;
  vaastuScore: number;
  daylightScore: number;
  ventilationScore: number;
  circulationScore: number;
  privacyScore: number;
  structuralScore: number;
  parkingScore: number;
  usableAreaScore: number;
  costScore: number;
  floors: FloorLayout[];
  warnings: string[];
  vaastuConflicts: string[];
};

export type BOQItem = {
  category: string;
  item: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
};

export type AreaStatement = {
  plotAreaSqft: number;
  buildableFootprintSqft: number;
  groundCoverageSqft: number;
  groundCoveragePercent: number;
  totalBUASqft: number;
  permittedTotalBUASqft: number;
  requiredTotalBUASqft: number;
  buaBalanceSqft: number;
  farAchieved: number;
  setbackAreaSqft: number;
  stiltExemptAreaSqft: number;
  residentialBuaSqft: number;
  grossConstructedAreaSqft: number;
};

export type BuildingModel = {
  inputs: DRGInputs;
  spaceProgramme: SpaceProgramme;
  floorProgrammes: FloorProgramme[];
  selectedCandidate: CandidateLayout;
  allCandidates: CandidateLayout[];
  columns: StructuralColumn[];
  beams: StructuralBeam[];
  slabs: StructuralSlab[];
  boq: BOQItem[];
  areaStatement: AreaStatement;
  vaastuCompliancePercent: number;
  vaastuConflicts: string[];
  recommendations: string[];
  validationPassed: boolean;
};
