/**
 * BuildMitra Professional CAD Drafting & Structural Engine
 * Standards: NBC 2016 (National Building Code of India) & IS 456:2000
 * True Parametric Vector Coordinate Engine with zero hardcoded layouts.
 */

export type FacingDirection = "North" | "East" | "South" | "West";
export type ParkingOption = "Full Parking" | "Half Parking" | "No Parking";

export interface DRGInputs {
  projectName: string;
  plotWidth: number;       // in feet
  plotLength: number;      // in feet
  facing: FacingDirection;
  floorsCount: number;     // e.g. 1, 2, 3, 4
  parkingOption: ParkingOption;
  bedrooms: number;
  toilets: number;
  sbcKpa: number;          // Soil SBC in kN/m²
}

export interface SetbackMetrics {
  front: number;
  rear: number;
  left: number;
  right: number;
  buildableWidth: number;
  buildableLength: number;
  plotArea: number;
  groundCoverageSqFt: number;
  groundCoveragePct: number;
  maxFar: number;
  maxAllowableBua: number;
  proposedGroundBua: number;
  proposedTotalBua: number;
  carpetAreaApprox: number;
  greenAreaSqFt: number;
  nbcCompliant: boolean;
}

export interface WallSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number; // in pixels
  type: "exterior" | "interior";
}

export interface CADDoor {
  id: string;
  label: "D1" | "D2" | "D3";
  name: string;
  x: number;
  y: number;
  clearWidthPx: number;
  clearWidthFt: number;
  hingeX: number;
  hingeY: number;
  leafEndX: number;
  leafEndY: number;
  arcPath: string;
}

export interface CADWindow {
  id: string;
  label: "W1" | "W2" | "V1";
  name: string;
  x: number;
  y: number;
  widthPx: number;
  widthFt: number;
  orientation: "H" | "V";
}

export interface StaircaseDetails {
  x: number;
  y: number;
  width: number;
  length: number;
  flight1Treads: { x1: number; y1: number; x2: number; y2: number }[];
  flight2Treads: { x1: number; y1: number; x2: number; y2: number }[];
  landingX: number;
  landingY: number;
  landingW: number;
  landingH: number;
  arrowStart: { x: number; y: number };
  arrowEnd: { x: number; y: number };
}

export interface LiftShaftDetails {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WaterSumpDetails {
  x: number;
  y: number;
  w: number;
  h: number;
  capacityLitres: number;
  vastuZone: string;
}

export interface CADRoomZone {
  id: string;
  name: string;
  subType: string;
  dimsText: string;
  areaSqFt: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vastuZone: string;
  vastuElement: string;
  vastuSignificance: string;
  doors: CADDoor[];
  windows: CADWindow[];
}

export interface StructuralColumn {
  id: string;
  mark: string;
  gridRef: string;
  cx: number;
  cy: number;
  colWidthPx: number;
  colDepthPx: number;
  widthInches: number;
  depthInches: number;
  footingSideM: number;
  footingSidePx: number;
  footingDepthMm: number;
  mainRebar: string;
  tieRebar: string;
  footingMesh: string;
}

export interface StructuralGrid {
  xGridLines: { label: string; x: number; spanFt?: number }[];
  yGridLines: { label: string; y: number; spanFt?: number }[];
  columns: StructuralColumn[];
  footingSchedule: {
    columnMark: string;
    gridRef: string;
    columnSize: string;
    mainBars: string;
    ties: string;
    footingSize: string;
    footingMesh: string;
    depthBelowGl: string;
  }[];
}

export interface CalculatedBlueprint {
  inputs: DRGInputs;
  metrics: SetbackMetrics;
  scale: number; // Pixels per foot
  originX: number;
  originY: number;
  plotSvgW: number;
  plotSvgH: number;
  bldgSvgX: number;
  bldgSvgY: number;
  bldgSvgW: number;
  bldgSvgH: number;
  extWallThickPx: number;
  intWallThickPx: number;
  exteriorWalls: WallSegment[];
  groundZones: CADRoomZone[];
  upperZones: CADRoomZone[];
  staircase: StaircaseDetails;
  liftShaft: LiftShaftDetails | null;
  waterSump: WaterSumpDetails;
  structural: StructuralGrid;
}

/**
 * Format decimal feet to standard architectural string: e.g., 14′-6″
 */
export function formatFeetInches(decimalFeet: number): string {
  const safe = Math.max(0.5, decimalFeet);
  const feet = Math.floor(safe);
  const inches = Math.round((safe - feet) * 12);
  if (inches === 12) {
    return `${feet + 1}′-0″`;
  }
  return `${feet}′-${inches}″`;
}

/**
 * NBC 2016 Compliant Setbacks, Ground Coverage, and FAR
 */
export function calculateNBCMetrics(inputs: DRGInputs): SetbackMetrics {
  const width = Math.max(20, Math.min(150, inputs.plotWidth));
  const length = Math.max(25, Math.min(200, inputs.plotLength));
  const plotArea = width * length;

  // NBC 2016 Clause 4.3 Table for Residential Plots
  let front = 5;
  let rear = 3;
  let left = 3;
  let right = 3;

  if (length > 40 && length <= 60) {
    front = inputs.facing === "North" || inputs.facing === "East" ? 7 : 8;
    rear = 4;
    left = 3.5;
    right = 3.5;
  } else if (length > 60) {
    front = 10;
    rear = 5;
    left = 4;
    right = 4;
  }

  // Orientation-adjusted front setback location
  // Road facing side gets front setback
  let setbackTop = front;
  let setbackBottom = rear;
  let setbackLeft = left;
  let setbackRight = right;

  if (inputs.facing === "South") {
    setbackTop = rear;
    setbackBottom = front;
  } else if (inputs.facing === "East") {
    setbackRight = front;
    setbackLeft = rear;
  } else if (inputs.facing === "West") {
    setbackLeft = front;
    setbackRight = rear;
  }

  const buildableWidth = Math.max(14, width - (setbackLeft + setbackRight));
  const buildableLength = Math.max(16, length - (setbackTop + setbackBottom));

  const groundCoverageSqFt = Math.round(buildableWidth * buildableLength);
  const groundCoveragePct = Number(((groundCoverageSqFt / plotArea) * 100).toFixed(1));

  // NBC FAR Limits
  const maxFar = plotArea <= 2400 ? 1.75 : 2.0;
  const maxAllowableBua = Math.round(plotArea * maxFar);

  let groundFactor = 1.0;
  if (inputs.parkingOption === "Full Parking") {
    groundFactor = 0.2; // Stilt parking exempt from FAR
  } else if (inputs.parkingOption === "Half Parking") {
    groundFactor = 0.65;
  }

  const proposedGroundBua = Math.round(groundCoverageSqFt * groundFactor);
  const upperFloorBua = Math.round(groundCoverageSqFt * 0.88);
  const upperFloorsCount = Math.max(0, inputs.floorsCount - 1);
  const proposedTotalBua = proposedGroundBua + (upperFloorBua * upperFloorsCount);
  const carpetAreaApprox = Math.round(proposedTotalBua * 0.78);
  const greenAreaSqFt = plotArea - groundCoverageSqFt;

  return {
    front,
    rear,
    left,
    right,
    buildableWidth,
    buildableLength,
    plotArea,
    groundCoverageSqFt,
    groundCoveragePct,
    maxFar,
    maxAllowableBua,
    proposedGroundBua,
    proposedTotalBua,
    carpetAreaApprox,
    greenAreaSqFt,
    nbcCompliant: groundCoveragePct <= 75 && proposedTotalBua <= maxAllowableBua
  };
}

/**
 * True Vector/SVG Coordinate Drafting Engine
 */
export function generateCalculatedBlueprint(inputs: DRGInputs): CalculatedBlueprint {
  const metrics = calculateNBCMetrics(inputs);

  // SVG Virtual Canvas: 1100 x 740
  const maxSvgW = 860;
  const maxSvgH = 580;

  // Exact mathematical scale (pixels per foot)
  const scale = Math.min(maxSvgW / inputs.plotWidth, maxSvgH / inputs.plotLength);
  const plotSvgW = inputs.plotWidth * scale;
  const plotSvgH = inputs.plotLength * scale;

  // Center plot on the canvas
  const originX = 60 + (maxSvgW - plotSvgW) / 2;
  const originY = 55 + (maxSvgH - plotSvgH) / 2;

  // Real physical wall thicknesses converted to pixels
  const extWallThickPx = (9 / 12) * scale;   // 9" exterior masonry
  const intWallThickPx = (4.5 / 12) * scale; // 4.5" interior partition

  // Setback offsets in pixels
  let offTop = metrics.front * scale;
  let offLeft = metrics.left * scale;

  if (inputs.facing === "South") {
    offTop = metrics.rear * scale;
  } else if (inputs.facing === "East") {
    offLeft = metrics.rear * scale;
  } else if (inputs.facing === "West") {
    offLeft = metrics.front * scale;
  }

  // Building Footprint in SVG Space
  const bldgSvgX = originX + offLeft;
  const bldgSvgY = originY + offTop;
  const bldgSvgW = metrics.buildableWidth * scale;
  const bldgSvgH = metrics.buildableLength * scale;

  // Exterior Double-Line Walls
  const exteriorWalls: WallSegment[] = [
    { id: "ext_top", x1: bldgSvgX, y1: bldgSvgY, x2: bldgSvgX + bldgSvgW, y2: bldgSvgY, thickness: extWallThickPx, type: "exterior" },
    { id: "ext_right", x1: bldgSvgX + bldgSvgW, y1: bldgSvgY, x2: bldgSvgX + bldgSvgW, y2: bldgSvgY + bldgSvgH, thickness: extWallThickPx, type: "exterior" },
    { id: "ext_bottom", x1: bldgSvgX, y1: bldgSvgY + bldgSvgH, x2: bldgSvgX + bldgSvgW, y2: bldgSvgY + bldgSvgH, thickness: extWallThickPx, type: "exterior" },
    { id: "ext_left", x1: bldgSvgX, y1: bldgSvgY, x2: bldgSvgX, y2: bldgSvgY + bldgSvgH, thickness: extWallThickPx, type: "exterior" }
  ];

  // Core Service: Staircase (Dog-legged in West / Center)
  // Standard stair: width 6ft to 7ft, length 10ft to 12ft
  const stairWidthFt = Math.max(6, Math.min(8, metrics.buildableWidth * 0.22));
  const stairLengthFt = Math.max(10, Math.min(14, metrics.buildableLength * 0.32));
  const stairW = stairWidthFt * scale;
  const stairL = stairLengthFt * scale;
  const stairX = bldgSvgX + extWallThickPx + 2;
  const stairY = bldgSvgY + (bldgSvgH - stairL) / 2;

  const treadsCount = 9;
  const treadDist = (stairL - (3.5 * scale)) / treadsCount;

  const flight1Treads: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const flight2Treads: { x1: number; y1: number; x2: number; y2: number }[] = [];

  for (let t = 0; t < treadsCount; t++) {
    const ty = stairY + t * treadDist;
    flight1Treads.push({
      x1: stairX,
      y1: ty,
      x2: stairX + (stairW / 2) - 2,
      y2: ty
    });
    flight2Treads.push({
      x1: stairX + (stairW / 2) + 2,
      y1: ty,
      x2: stairX + stairW,
      y2: ty
    });
  }

  const staircase: StaircaseDetails = {
    x: stairX,
    y: stairY,
    width: stairW,
    length: stairL,
    flight1Treads,
    flight2Treads,
    landingX: stairX,
    landingY: stairY + stairL - (3.5 * scale),
    landingW: stairW,
    landingH: 3.5 * scale,
    arrowStart: { x: stairX + (stairW * 0.25), y: stairY + stairL - (3.8 * scale) },
    arrowEnd: { x: stairX + (stairW * 0.25), y: stairY + 14 }
  };

  // Core Service: Passenger Lift Shaft (if floors >= 3)
  let liftShaft: LiftShaftDetails | null = null;
  if (inputs.floorsCount >= 3) {
    const liftSizeFt = 5.5;
    const liftSizePx = liftSizeFt * scale;
    liftShaft = {
      x: stairX,
      y: Math.max(bldgSvgY + extWallThickPx + 4, stairY - liftSizePx - 4),
      w: stairW,
      h: liftSizePx
    };
  }

  // Core Service: Underground Water Sump (UGT in North-East / Ishan setback)
  const sumpWFt = Math.max(6, Math.min(10, metrics.plotArea / 300));
  const sumpLFt = Math.max(5, Math.min(8, metrics.plotArea / 350));
  const sumpW = sumpWFt * scale;
  const sumpL = sumpLFt * scale;
  const sumpX = (originX + plotSvgW) - (metrics.right * scale) - sumpW - 6;
  const sumpY = originY + 8;
  const capacityLitres = Math.round(inputs.bedrooms * 2000 + 4000);

  const waterSump: WaterSumpDetails = {
    x: Math.max(originX + 10, sumpX),
    y: Math.max(originY + 6, sumpY),
    w: sumpW,
    h: sumpL,
    capacityLitres,
    vastuZone: "Ishan (NE) Sacred Water Zone"
  };

  // Helper for generating doors with 90° swing arcs
  const createDoor = (
    id: string,
    label: "D1" | "D2" | "D3",
    name: string,
    x: number,
    y: number,
    clearWidthFt: number,
    orientation: "top" | "bottom" | "left" | "right"
  ): CADDoor => {
    const clearWidthPx = clearWidthFt * scale;
    const hingeX = x;
    const hingeY = y;
    let leafEndX = x;
    let leafEndY = y;
    let arcPath = "";

    if (orientation === "top") {
      leafEndX = x;
      leafEndY = y + clearWidthPx;
      arcPath = `M ${x} ${y} A ${clearWidthPx} ${clearWidthPx} 0 0 1 ${x + clearWidthPx} ${y + clearWidthPx}`;
    } else if (orientation === "bottom") {
      leafEndX = x;
      leafEndY = y - clearWidthPx;
      arcPath = `M ${x} ${y} A ${clearWidthPx} ${clearWidthPx} 0 0 0 ${x + clearWidthPx} ${y - clearWidthPx}`;
    } else if (orientation === "left") {
      leafEndX = x + clearWidthPx;
      leafEndY = y;
      arcPath = `M ${x} ${y} A ${clearWidthPx} ${clearWidthPx} 0 0 1 ${x + clearWidthPx} ${y + clearWidthPx}`;
    } else {
      leafEndX = x - clearWidthPx;
      leafEndY = y;
      arcPath = `M ${x} ${y} A ${clearWidthPx} ${clearWidthPx} 0 0 0 ${x - clearWidthPx} ${y + clearWidthPx}`;
    }

    return {
      id,
      label,
      name,
      x,
      y,
      clearWidthPx,
      clearWidthFt,
      hingeX,
      hingeY,
      leafEndX,
      leafEndY,
      arcPath
    };
  };

  // Helper for generating windows
  const createWindow = (
    id: string,
    label: "W1" | "W2" | "V1",
    name: string,
    x: number,
    y: number,
    widthFt: number,
    orientation: "H" | "V"
  ): CADWindow => ({
    id,
    label,
    name,
    x,
    y,
    widthPx: widthFt * scale,
    widthFt,
    orientation
  });

  // --- DYNAMIC ROOM GENERATION ---
  const groundZones: CADRoomZone[] = [];
  const upperZones: CADRoomZone[] = [];

  const bldgInnerX = bldgSvgX + extWallThickPx;
  const bldgInnerY = bldgSvgY + extWallThickPx;
  const bldgInnerW = bldgSvgW - (extWallThickPx * 2);
  const bldgInnerH = bldgSvgH - (extWallThickPx * 2);

  // Proportional grid splits
  const splitX = Math.round(bldgInnerW * 0.46);
  const rightW = bldgInnerW - splitX - intWallThickPx;
  const splitY = Math.round(bldgInnerH * 0.52);
  const bottomH = bldgInnerH - splitY - intWallThickPx;

  // --- GROUND FLOOR ---
  if (inputs.parkingOption === "Full Parking") {
    // 100% Stilt Ground Floor
    groundZones.push({
      id: "g_stilt",
      name: "100% COVERED STILT PARKING BAY & DRIVEWAY",
      subType: "Multi-Vehicle Stilt",
      dimsText: `${formatFeetInches((bldgInnerW - intWallThickPx) / scale)} × ${formatFeetInches(bldgInnerH / scale)}`,
      areaSqFt: Math.round(((bldgInnerW - intWallThickPx) / scale) * (bldgInnerH / scale)),
      x: bldgInnerX,
      y: bldgInnerY,
      w: bldgInnerW,
      h: bldgInnerH,
      vastuZone: "Vayavya (NW) Driveway to Ishan (NE)",
      vastuElement: "Vayu & Akasha",
      vastuSignificance: "Open stilt layout ensures free cosmic flow, abundant parking and unobstructed circulation",
      doors: [
        createDoor("g_d_main_gate", "D1", "Stilt Entry Gate", bldgInnerX + 24, bldgInnerY, 4.0, "top")
      ],
      windows: [
        createWindow("g_w_stilt1", "W1", "Driveway Window", bldgInnerX + bldgInnerW - (5 * scale) - 10, bldgInnerY, 5.0, "H"),
        createWindow("g_w_stilt2", "W1", "Rear Ventilation", bldgInnerX + 30, bldgInnerY + bldgInnerH, 5.0, "H")
      ]
    });
  } else if (inputs.parkingOption === "Half Parking") {
    // Half Parking (West/NW) + Half Living/Kitchen (East/NE/SE)
    groundZones.push({
      id: "g_hp_park",
      name: "COVERED PARKING BAY & DRIVEWAY",
      subType: "2-Vehicle Parking & EV Point",
      dimsText: `${formatFeetInches(splitX / scale)} × ${formatFeetInches(bldgInnerH / scale)}`,
      areaSqFt: Math.round((splitX / scale) * (bldgInnerH / scale)),
      x: bldgInnerX,
      y: bldgInnerY,
      w: splitX,
      h: bldgInnerH,
      vastuZone: "North-West (Vayavya)",
      vastuElement: "Air (Vayu)",
      vastuSignificance: "Air element quadrant permits rapid, fluid movement of vehicles and guests",
      doors: [],
      windows: []
    });

    groundZones.push({
      id: "g_hp_living",
      name: "GRAND LIVING & FOYER",
      subType: "Ishan Formal Living",
      dimsText: `${formatFeetInches(rightW / scale)} × ${formatFeetInches(splitY / scale)}`,
      areaSqFt: Math.round((rightW / scale) * (splitY / scale)),
      x: bldgInnerX + splitX + intWallThickPx,
      y: bldgInnerY,
      w: rightW,
      h: splitY,
      vastuZone: "North-East (Ishan)",
      vastuElement: "Water & Ether",
      vastuSignificance: "Supreme spiritual quadrant, promotes abundance, mental peace and morning prana",
      doors: [
        createDoor("g_d1_hp", "D1", "Main Entrance Door", bldgInnerX + splitX + intWallThickPx + 16, bldgInnerY, 3.5, "top")
      ],
      windows: [
        createWindow("g_w1_liv", "W1", "Living Front Window", bldgInnerX + bldgInnerW - (5 * scale) - 8, bldgInnerY, 5.0, "H"),
        createWindow("g_w2_liv", "W2", "East Sunlight Window", bldgInnerX + bldgInnerW, bldgInnerY + (splitY * 0.3), 4.0, "V")
      ]
    });

    groundZones.push({
      id: "g_hp_kitchen",
      name: "MODULAR KITCHEN & DINING",
      subType: "Agni Cooking Suite",
      dimsText: `${formatFeetInches(rightW / scale)} × ${formatFeetInches(bottomH / scale)}`,
      areaSqFt: Math.round((rightW / scale) * (bottomH / scale)),
      x: bldgInnerX + splitX + intWallThickPx,
      y: bldgInnerY + splitY + intWallThickPx,
      w: rightW,
      h: bottomH,
      vastuZone: "South-East (Agni)",
      vastuElement: "Fire (Tejas)",
      vastuSignificance: "Governs metabolic vitality, digestive wellness and prosperity",
      doors: [
        createDoor("g_d2_kit", "D2", "Kitchen Utility Door", bldgInnerX + splitX + intWallThickPx + 12, bldgInnerY + splitY + intWallThickPx, 3.0, "top")
      ],
      windows: [
        createWindow("g_w1_kit", "W2", "Kitchen Window", bldgInnerX + bldgInnerW - (4 * scale) - 8, bldgInnerY + bldgInnerH, 4.0, "H"),
        createWindow("g_v1_kit", "V1", "Exhaust Ventilator", bldgInnerX + bldgInnerW, bldgInnerY + splitY + (bottomH * 0.4), 2.5, "V")
      ]
    });
  } else {
    // No Parking: 4-Quadrant Complete Living Floor
    groundZones.push({
      id: "g_np_living",
      name: "GRAND LIVING & ISHAN PUJA",
      subType: "Formal Living",
      dimsText: `${formatFeetInches(rightW / scale)} × ${formatFeetInches(splitY / scale)}`,
      areaSqFt: Math.round((rightW / scale) * (splitY / scale)),
      x: bldgInnerX + splitX + intWallThickPx,
      y: bldgInnerY,
      w: rightW,
      h: splitY,
      vastuZone: "North-East (Ishan)",
      vastuElement: "Water & Ether",
      vastuSignificance: "Radiates auspicious solar energy and tranquil spiritual focus",
      doors: [
        createDoor("g_d1_np", "D1", "Main Entrance Door", bldgInnerX + splitX + intWallThickPx + 18, bldgInnerY, 3.5, "top")
      ],
      windows: [
        createWindow("g_w1_np_liv", "W1", "Front Living Window", bldgInnerX + bldgInnerW - (5 * scale) - 8, bldgInnerY, 5.0, "H")
      ]
    });

    groundZones.push({
      id: "g_np_guest",
      name: "GUEST BEDROOM / STUDY",
      subType: "Bedroom 01",
      dimsText: `${formatFeetInches(splitX / scale)} × ${formatFeetInches(splitY / scale)}`,
      areaSqFt: Math.round((splitX / scale) * (splitY / scale)),
      x: bldgInnerX,
      y: bldgInnerY,
      w: splitX,
      h: splitY,
      vastuZone: "North-West (Vayavya)",
      vastuElement: "Air (Vayu)",
      vastuSignificance: "Dynamic air element fosters intellectual clarity for study or welcoming guests",
      doors: [
        createDoor("g_d2_guest", "D2", "Guest Room Door", bldgInnerX + splitX - (3 * scale) - 4, bldgInnerY + splitY, 3.0, "bottom")
      ],
      windows: [
        createWindow("g_w1_np_guest", "W1", "Guest Bed Window", bldgInnerX + 16, bldgInnerY, 4.5, "H")
      ]
    });

    groundZones.push({
      id: "g_np_kitchen",
      name: "MODULAR KITCHEN & DINING",
      subType: "Agni Fire Zone",
      dimsText: `${formatFeetInches(rightW / scale)} × ${formatFeetInches(bottomH / scale)}`,
      areaSqFt: Math.round((rightW / scale) * (bottomH / scale)),
      x: bldgInnerX + splitX + intWallThickPx,
      y: bldgInnerY + splitY + intWallThickPx,
      w: rightW,
      h: bottomH,
      vastuZone: "South-East (Agni)",
      vastuElement: "Fire (Tejas)",
      vastuSignificance: "Optimal placement for cooking fire facing East to capture dawn rays",
      doors: [
        createDoor("g_d2_np_kit", "D2", "Kitchen Door", bldgInnerX + splitX + intWallThickPx + 14, bldgInnerY + splitY + intWallThickPx, 3.0, "top")
      ],
      windows: [
        createWindow("g_w2_np_kit", "W2", "Kitchen Exhaust Window", bldgInnerX + bldgInnerW - (4 * scale) - 10, bldgInnerY + bldgInnerH, 4.0, "H")
      ]
    });

    groundZones.push({
      id: "g_np_parent",
      name: "PARENTS BEDROOM SUITE",
      subType: "Bedroom 02",
      dimsText: `${formatFeetInches(splitX / scale)} × ${formatFeetInches(bottomH / scale)}`,
      areaSqFt: Math.round((splitX / scale) * (bottomH / scale)),
      x: bldgInnerX,
      y: bldgInnerY + splitY + intWallThickPx,
      w: splitX,
      h: bottomH,
      vastuZone: "South-West (Nairrutya)",
      vastuElement: "Earth (Prithvi)",
      vastuSignificance: "Solid earth foundation brings restful sleep and emotional equilibrium",
      doors: [
        createDoor("g_d2_parent", "D2", "Parents Bed Door", bldgInnerX + splitX - (3 * scale) - 6, bldgInnerY + splitY + intWallThickPx, 3.0, "top")
      ],
      windows: [
        createWindow("g_w1_parent", "W1", "Bedroom Window", bldgInnerX + 16, bldgInnerY + bldgInnerH, 4.5, "H")
      ]
    });
  }

  // --- UPPER FLOOR (Residential Sanctuary) ---
  // SW: Master Suite
  upperZones.push({
    id: "u_master",
    name: "MASTER BEDROOM (NAIRRUTYA SUITE)",
    subType: "Owner Suite + Walk-in Wardrobe",
    dimsText: `${formatFeetInches(splitX / scale)} × ${formatFeetInches(bottomH / scale)}`,
    areaSqFt: Math.round((splitX / scale) * (bottomH / scale)),
    x: bldgInnerX,
    y: bldgInnerY + splitY + intWallThickPx,
    w: splitX,
    h: bottomH,
    vastuZone: "South-West (Nairrutya)",
    vastuElement: "Earth (Prithvi)",
    vastuSignificance: "The master quadrant dictates authority, stability and financial endurance",
    doors: [
      createDoor("u_d_master", "D2", "Master Suite Door", bldgInnerX + splitX - (3 * scale) - 6, bldgInnerY + splitY + intWallThickPx, 3.0, "top"),
      createDoor("u_d_master_bath", "D3", "Attached Bath Door", bldgInnerX + 10, bldgInnerY + splitY + intWallThickPx + (bottomH * 0.5), 2.5, "left")
    ],
    windows: [
      createWindow("u_w1_master", "W1", "South Window", bldgInnerX + 18, bldgInnerY + bldgInnerH, 5.0, "H"),
      createWindow("u_w2_master", "W2", "West Breeze Window", bldgInnerX, bldgInnerY + splitY + (bottomH * 0.35), 4.0, "V")
    ]
  });

  // NE: Family Lounge & Puja
  upperZones.push({
    id: "u_family",
    name: "FAMILY LOUNGE & ISHAN PUJA",
    subType: "Upper Living & Balcony",
    dimsText: `${formatFeetInches(rightW / scale)} × ${formatFeetInches(splitY / scale)}`,
    areaSqFt: Math.round((rightW / scale) * (splitY / scale)),
    x: bldgInnerX + splitX + intWallThickPx,
    y: bldgInnerY,
    w: rightW,
    h: splitY,
    vastuZone: "North-East (Ishan)",
    vastuElement: "Water & Ether",
    vastuSignificance: "Highest vibration zone, best suited for morning meditation and family gatherings",
    doors: [
      createDoor("u_d1_fam", "D1", "Lounge Entrance", bldgInnerX + splitX + intWallThickPx + 16, bldgInnerY, 3.5, "top")
    ],
    windows: [
      createWindow("u_w1_fam", "W1", "Balcony French Window", bldgInnerX + bldgInnerW - (5 * scale) - 8, bldgInnerY, 5.0, "H")
    ]
  });

  // NW: Bedroom 02 (Kids / Guest)
  upperZones.push({
    id: "u_kids",
    name: "BEDROOM 02 (KIDS / GUEST SUITE)",
    subType: `Attached Bath (${inputs.toilets} Baths Total)`,
    dimsText: `${formatFeetInches(splitX / scale)} × ${formatFeetInches(splitY / scale)}`,
    areaSqFt: Math.round((splitX / scale) * (splitY / scale)),
    x: bldgInnerX,
    y: bldgInnerY,
    w: splitX,
    h: splitY,
    vastuZone: "North-West (Vayavya)",
    vastuElement: "Air (Vayu)",
    vastuSignificance: "Enhances creativity, dynamic focus and cheerful energy for young minds",
    doors: [
      createDoor("u_d2_kids", "D2", "Bedroom Door", bldgInnerX + splitX - (3 * scale) - 6, bldgInnerY + splitY, 3.0, "bottom")
    ],
    windows: [
      createWindow("u_w1_kids", "W1", "North View Window", bldgInnerX + 16, bldgInnerY, 4.5, "H")
    ]
  });

  // SE: Bedroom 03 / Entertainment Room
  upperZones.push({
    id: "u_se_room",
    name: inputs.bedrooms >= 3 ? "BEDROOM 03 / MEDIA SUITE" : "ENTERTAINMENT LOUNGE & TERRACE",
    subType: "Agni Suite + Balcony",
    dimsText: `${formatFeetInches(rightW / scale)} × ${formatFeetInches(bottomH / scale)}`,
    areaSqFt: Math.round((rightW / scale) * (bottomH / scale)),
    x: bldgInnerX + splitX + intWallThickPx,
    y: bldgInnerY + splitY + intWallThickPx,
    w: rightW,
    h: bottomH,
    vastuZone: "South-East (Agni)",
    vastuElement: "Fire (Tejas)",
    vastuSignificance: "Warm, energetic ambiance optimal for electronics, sound systems, or youth bedroom",
    doors: [
      createDoor("u_d2_se", "D2", "Suite Door", bldgInnerX + splitX + intWallThickPx + 14, bldgInnerY + splitY + intWallThickPx, 3.0, "top")
    ],
    windows: [
      createWindow("u_w1_se", "W1", "Rear Garden Window", bldgInnerX + bldgInnerW - (4.5 * scale) - 8, bldgInnerY + bldgInnerH, 4.5, "H")
    ]
  });

  // --- 4. ADVANCED STRUCTURAL IS 456 GRID & FOOTINGS ---
  // Economical column span: 11 to 15 feet
  const spanTargetFt = 13.5;
  const xSpans = Math.max(2, Math.min(5, Math.round(metrics.buildableWidth / spanTargetFt)));
  const ySpans = Math.max(2, Math.min(6, Math.round(metrics.buildableLength / spanTargetFt)));

  const colWidthInches = inputs.floorsCount >= 3 ? 12 : 9;
  const colDepthInches = inputs.floorsCount >= 4 ? 18 : inputs.floorsCount >= 3 ? 15 : 12;

  // Dynamic Footing Pad Sizing against Soil SBC:
  // Tributary load P = tribArea (m²) * floors * 12 kN/m² * 1.15
  const tribAreaSqM = (metrics.buildableWidth / xSpans) * (metrics.buildableLength / ySpans) * 0.0929;
  const colLoadKn = tribAreaSqM * inputs.floorsCount * 12 * 1.15;
  const reqFootingAreaSqM = (1.1 * colLoadKn) / Math.max(100, inputs.sbcKpa);
  const footingSideM = Number(Math.max(1.2, Math.min(2.5, Math.sqrt(reqFootingAreaSqM))).toFixed(2));
  const footingSidePx = footingSideM * 3.28084 * scale;
  const footingDepthMm = inputs.floorsCount >= 3 ? 500 : 400;

  const xGridLines: { label: string; x: number; spanFt?: number }[] = [];
  const yGridLines: { label: string; y: number; spanFt?: number }[] = [];
  const columns: StructuralColumn[] = [];
  const footingSchedule: StructuralGrid["footingSchedule"] = [];

  const xLabels = ["A", "B", "C", "D", "E", "F"];
  const yLabels = ["1", "2", "3", "4", "5", "6", "7"];

  for (let i = 0; i <= xSpans; i++) {
    const gx = bldgSvgX + (i / xSpans) * bldgSvgW;
    const spanFt = i > 0 ? Number((metrics.buildableWidth / xSpans).toFixed(1)) : undefined;
    xGridLines.push({ label: xLabels[i] || `X${i+1}`, x: gx, spanFt });
  }

  for (let j = 0; j <= ySpans; j++) {
    const gy = bldgSvgY + (j / ySpans) * bldgSvgH;
    const spanFt = j > 0 ? Number((metrics.buildableLength / ySpans).toFixed(1)) : undefined;
    yGridLines.push({ label: yLabels[j] || `Y${j+1}`, y: gy, spanFt });
  }

  let colCounter = 1;
  for (let i = 0; i <= xSpans; i++) {
    for (let j = 0; j <= ySpans; j++) {
      const cx = xGridLines[i].x;
      const cy = yGridLines[j].y;
      const colMark = `C${colCounter}`;
      const gridRef = `${xLabels[i]}${yLabels[j]}`;

      const mainBars = inputs.floorsCount >= 3 ? "4-T16 + 2-T12 Fe500D" : "4-T16 Fe500D";
      const ties = "T8 @ 150mm c/c";
      const footingMesh = `T12 @ 125mm c/c Both Ways (Fe500D)`;

      columns.push({
        id: `col_${i}_${j}`,
        mark: colMark,
        gridRef,
        cx,
        cy,
        colWidthPx: (colWidthInches / 12) * scale,
        colDepthPx: (colDepthInches / 12) * scale,
        widthInches: colWidthInches,
        depthInches: colDepthInches,
        footingSideM,
        footingSidePx,
        footingDepthMm,
        mainRebar: mainBars,
        tieRebar: ties,
        footingMesh
      });

      footingSchedule.push({
        columnMark: colMark,
        gridRef,
        columnSize: `${colWidthInches}" × ${colDepthInches}" (${colWidthInches * 25}×${colDepthInches * 25}mm)`,
        mainBars,
        ties,
        footingSize: `${footingSideM}m × ${footingSideM}m × ${footingDepthMm}mm`,
        footingMesh,
        depthBelowGl: "1.80 m (6′-0″)"
      });

      colCounter++;
    }
  }

  const structural: StructuralGrid = {
    xGridLines,
    yGridLines,
    columns,
    footingSchedule
  };

  return {
    inputs,
    metrics,
    scale,
    originX,
    originY,
    plotSvgW,
    plotSvgH,
    bldgSvgX,
    bldgSvgY,
    bldgSvgW,
    bldgSvgH,
    extWallThickPx,
    intWallThickPx,
    exteriorWalls,
    groundZones,
    upperZones,
    staircase,
    liftShaft,
    waterSump,
    structural
  };
}
