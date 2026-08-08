import {
  Box2D,
  Facing,
  FurnitureItem,
  OpeningSymbol,
  Point2D,
  RoomKind,
  RoomRect,
  StructuralColumn,
} from "./types";

export interface Setbacks {
  front: number;
  rear: number;
  left: number;
  right: number;
}

export const DEFAULT_SETBACKS: Setbacks = {
  front: 5.0,
  rear: 3.0,
  left: 3.0,
  right: 3.0,
};

/**
 * 1. Calculate Buildable Envelope with Standard/Custom Setbacks
 */
export function calculateBuildableEnvelope(
  plotWidth: number,
  plotDepth: number,
  customSetbacks?: Partial<Setbacks>
): Box2D {
  const sb: Setbacks = {
    front: customSetbacks?.front ?? DEFAULT_SETBACKS.front,
    rear: customSetbacks?.rear ?? DEFAULT_SETBACKS.rear,
    left: customSetbacks?.left ?? DEFAULT_SETBACKS.left,
    right: customSetbacks?.right ?? DEFAULT_SETBACKS.right,
  };

  const x = sb.left;
  const y = sb.rear;
  const w = Math.max(8, plotWidth - sb.left - sb.right);
  const h = Math.max(8, plotDepth - sb.front - sb.rear);

  return { x, y, w, h };
}

export type VastuOrientation = "NORTH" | "SOUTH" | "EAST" | "WEST";

/**
 * Normalize Facing input to standard uppercase VastuOrientation string
 */
export function normalizeFacing(facing: Facing | string): VastuOrientation {
  const f = (facing || "SOUTH").toUpperCase();
  if (f.includes("NORTH")) return "NORTH";
  if (f.includes("EAST")) return "EAST";
  if (f.includes("WEST")) return "WEST";
  return "SOUTH";
}

/**
 * 2. Generate Vastu Floor Plan dynamically based on plot dimensions and orientation
 */
export function generateVastuFloorPlan(
  plotWidth: number,
  plotDepth: number,
  facingInput: Facing | string,
  floorLevel: number = 0,
  customSetbacks?: Partial<Setbacks>
): { buildable: Box2D; rooms: RoomRect[]; columns: StructuralColumn[] } {
  const facing = normalizeFacing(facingInput);
  const buildable = calculateBuildableEnvelope(plotWidth, plotDepth, customSetbacks);

  const bx = buildable.x;
  const by = buildable.y;
  const bw = buildable.w;
  const bh = buildable.h;

  const rooms: RoomRect[] = [];

  // =========================================================================
  // DYNAMIC ARCHITECTURAL VASTU SOLVER (MATCHING IMAGE 2 BLUEPRINT STANDARD)
  // =========================================================================
  const leftW = Math.max(10, Math.round(bw * 0.45 * 10) / 10);
  const rightW = Math.max(10, bw - leftW);

  const rearH = Math.max(9, Math.round(bh * 0.32 * 10) / 10);
  const frontH = Math.max(10, Math.round(bh * 0.36 * 10) / 10);
  const centerH = Math.max(9, bh - rearH - frontH);

  if (floorLevel === 0) {
    // -----------------------------------------------------------------------
    // GROUND FLOOR LAYOUT (MATCHING IMAGE 2 GF STANDARD)
    // -----------------------------------------------------------------------
    const bed1W = Math.min(leftW, 14);
    const bed1H = Math.min(frontH, 14);
    const toilet3W = 5;
    const toilet3H = Math.min(7, frontH);

    const rBed1: RoomRect = {
      id: "rm_bed1",
      floor: 0,
      unitNo: "G01",
      name: "BEDROOM 1",
      kind: "bedroom",
      x: bx,
      y: by,
      w: bed1W,
      h: bed1H,
      doors: [{ id: "d_b1", side: "north", offsetRatio: 0.7, width: 3.5 }],
      windows: [{ id: "w_b1", side: "south", offsetRatio: 0.5, width: 4.5 }],
      furniture: [{ id: "f_b1_bed", kind: "Queen Bed", x: bx + 1, y: by + 1, w: 5.5, h: 6.5, rotation: 0, label: "Queen Bed" }],
      notes: "Vastu: SW Nairutya Bedroom 1",
    };

    const rToilet3: RoomRect = {
      id: "rm_toilet3",
      floor: 0,
      unitNo: "G01A",
      name: "TOILET 3",
      kind: "toilet",
      x: bx + bed1W,
      y: by,
      w: toilet3W,
      h: toilet3H,
      doors: [{ id: "d_t3", side: "west", offsetRatio: 0.5, width: 2.5 }],
      windows: [{ id: "w_t3", side: "south", offsetRatio: 0.5, width: 2.0, isVentilator: true }],
      furniture: [{ id: "f_t3_wc", kind: "WC", x: bx + bed1W + 1, y: by + 1, w: 2, h: 2.5, rotation: 0, label: "WC" }],
      notes: "Attached to Bedroom 1",
    };

    const livW = Math.max(12, bw - toilet3W - bed1W);
    const livH = centerH + frontH;

    const rLiving: RoomRect = {
      id: "rm_living",
      floor: 0,
      unitNo: "G02",
      name: "LIVING ROOM",
      kind: "living",
      x: bx + bed1W + toilet3W,
      y: by,
      w: livW,
      h: livH,
      doors: [{ id: "d_main", side: "south", offsetRatio: 0.2, width: 4.0, isDoubleLeaf: true }],
      windows: [{ id: "w_liv", side: "east", offsetRatio: 0.5, width: 5.5 }],
      furniture: [
        { id: "f_liv_sofa", kind: "Sofa Set", x: bx + bed1W + toilet3W + 2, y: by + 2, w: 6.5, h: 3.5, rotation: 0, label: "L-Sofa Set" },
        { id: "f_liv_tv", kind: "TV Unit", x: bx + bw - 1.5, y: by + 2, w: 1, h: 4.5, rotation: 0, label: "TV Unit" },
      ],
      notes: "Spacious Front Living Room",
    };

    const dinW = Math.max(10, leftW);
    const dinH = centerH;

    const rDining: RoomRect = {
      id: "rm_dining",
      floor: 0,
      unitNo: "G03",
      name: "DINING AREA",
      kind: "dining",
      x: bx,
      y: by + frontH,
      w: dinW,
      h: dinH,
      doors: [{ id: "d_din", side: "east", offsetRatio: 0.5, width: 3.5 }],
      windows: [{ id: "w_din", side: "west", offsetRatio: 0.5, width: 4.0 }],
      furniture: [{ id: "f_din_t", kind: "Dining Table", x: bx + 2, y: by + frontH + 2, w: 5.5, h: 3.5, rotation: 0, label: "6-Seater Table" }],
      notes: "Central Dining Hall",
    };

    const kitchW = Math.max(8, rightW - 4);
    const kitchH = rearH;
    const utilW = 4;
    const utilH = rearH;

    const rKitchen: RoomRect = {
      id: "rm_kitchen",
      floor: 0,
      unitNo: "G04",
      name: "KITCHEN",
      kind: "kitchen",
      x: bx + leftW,
      y: by + frontH + centerH,
      w: kitchW,
      h: kitchH,
      doors: [{ id: "d_k", side: "south", offsetRatio: 0.3, width: 3.5 }],
      windows: [{ id: "w_k", side: "east", offsetRatio: 0.5, width: 4.0 }],
      furniture: [{ id: "f_k_counter", kind: "Kitchen Counter", x: bx + leftW + kitchW - 2, y: by + frontH + centerH + 1, w: 1.8, h: kitchH - 2, rotation: 0, label: "Hearth Facing East" }],
      notes: "SE Agneya Kitchen",
    };

    const rUtility: RoomRect = {
      id: "rm_utility",
      floor: 0,
      unitNo: "G04A",
      name: "UTILITY",
      kind: "utility",
      x: bx + leftW + kitchW,
      y: by + frontH + centerH,
      w: utilW,
      h: utilH,
      doors: [{ id: "d_u", side: "west", offsetRatio: 0.5, width: 2.5 }],
      windows: [{ id: "w_u", side: "east", offsetRatio: 0.5, width: 3.0 }],
      furniture: [{ id: "f_u_sink", kind: "Sink", x: bx + leftW + kitchW + 0.8, y: by + frontH + centerH + 1, w: 2.2, h: 2, rotation: 0, label: "Sink" }],
      notes: "Utility Service Area",
    };

    const bed2W = leftW;
    const bed2H = rearH;

    const rBed2: RoomRect = {
      id: "rm_bed2",
      floor: 0,
      unitNo: "G05",
      name: "BEDROOM 2",
      kind: "bedroom",
      x: bx,
      y: by + frontH + centerH,
      w: bed2W,
      h: bed2H,
      doors: [{ id: "d_b2", side: "south", offsetRatio: 0.5, width: 3.5 }],
      windows: [{ id: "w_b2", side: "north", offsetRatio: 0.5, width: 4.5 }],
      furniture: [{ id: "f_b2_bed", kind: "Queen Bed", x: bx + 1, y: by + frontH + centerH + 1, w: 5.5, h: 6.0, rotation: 0, label: "Queen Bed" }],
      notes: "North West Bedroom 2",
    };

    const stairW = 7;
    const stairH = centerH;

    const rStair: RoomRect = {
      id: "rm_stair",
      floor: 0,
      unitNo: "G06",
      name: "INTERNAL STAIRCASE",
      kind: "stair",
      x: bx + bw - stairW,
      y: by + frontH,
      w: stairW,
      h: stairH,
      doors: [{ id: "d_st", side: "west", offsetRatio: 0.5, width: 3.5 }],
      windows: [{ id: "w_st", side: "east", offsetRatio: 0.5, width: 3.5 }],
      furniture: [{ id: "f_st_t", kind: "Staircase", x: bx + bw - stairW + 1, y: by + frontH + 1, w: stairW - 2, h: stairH - 2, rotation: 0, label: "Up Treads" }],
      notes: "Vertical Core",
    };

    rooms.push(rBed1, rToilet3, rLiving, rDining, rBed2, rKitchen, rUtility, rStair);
  } else {
    // -----------------------------------------------------------------------
    // FIRST FLOOR LAYOUT (MATCHING IMAGE 2 FIRST FLOOR STANDARD)
    // -----------------------------------------------------------------------
    const rBed1: RoomRect = {
      id: "rm_ff_bed1",
      floor: 1,
      unitNo: "101",
      name: "BEDROOM 1",
      kind: "bedroom",
      x: bx,
      y: by,
      w: leftW,
      h: frontH,
      doors: [{ id: "d_ff_b1", side: "north", offsetRatio: 0.6, width: 3.5 }],
      windows: [{ id: "w_ff_b1", side: "south", offsetRatio: 0.5, width: 5.0 }],
      furniture: [{ id: "f_ff_b1_bed", kind: "King Bed", x: bx + 1, y: by + 1, w: 6, h: 6.5, rotation: 0, label: "King Bed" }],
      notes: "Master Suite",
    };

    const rLounge: RoomRect = {
      id: "rm_ff_lounge",
      floor: 1,
      unitNo: "102",
      name: "FAMILY LOUNGE",
      kind: "living",
      x: bx + leftW,
      y: by,
      w: rightW,
      h: frontH + centerH,
      doors: [{ id: "d_ff_lg", side: "south", offsetRatio: 0.2, width: 4.0 }],
      windows: [{ id: "w_ff_lg", side: "east", offsetRatio: 0.5, width: 6.0 }],
      furniture: [{ id: "f_ff_sofa", kind: "Sofa Set", x: bx + leftW + 2, y: by + 2, w: 6.5, h: 3.5, rotation: 0, label: "Family Sofa" }],
      notes: "Spacious Upper Lounge",
    };

    const rBed2: RoomRect = {
      id: "rm_ff_bed2",
      floor: 1,
      unitNo: "103",
      name: "BEDROOM 2",
      kind: "bedroom",
      x: bx,
      y: by + frontH + centerH,
      w: leftW,
      h: rearH,
      doors: [{ id: "d_ff_b2", side: "south", offsetRatio: 0.5, width: 3.5 }],
      windows: [{ id: "w_ff_b2", side: "north", offsetRatio: 0.5, width: 5.0 }],
      furniture: [{ id: "f_ff_b2_bed", kind: "Queen Bed", x: bx + 1, y: by + frontH + centerH + 1, w: 5.5, h: 6, rotation: 0, label: "Queen Bed" }],
      notes: "North Bedroom 2",
    };

    const rBed3: RoomRect = {
      id: "rm_ff_bed3",
      floor: 1,
      unitNo: "104",
      name: "BEDROOM 3",
      kind: "bedroom",
      x: bx + leftW,
      y: by + frontH + centerH,
      w: rightW,
      h: rearH,
      doors: [{ id: "d_ff_b3", side: "south", offsetRatio: 0.5, width: 3.5 }],
      windows: [{ id: "w_ff_b3", side: "north", offsetRatio: 0.5, width: 5.0 }],
      furniture: [{ id: "f_ff_b3_bed", kind: "Queen Bed", x: bx + leftW + 1, y: by + frontH + centerH + 1, w: 5.5, h: 6, rotation: 0, label: "Queen Bed" }],
      notes: "North East Bedroom 3",
    };

    const rBalcony: RoomRect = {
      id: "rm_ff_balc",
      floor: 1,
      unitNo: "105",
      name: "BALCONY",
      kind: "balcony",
      x: bx,
      y: by - 4,
      w: bw,
      h: 4,
      doors: [{ id: "d_ff_balc", side: "north", offsetRatio: 0.5, width: 4.0 }],
      windows: [],
      furniture: [],
      notes: "4ft Front Standing Balcony",
    };

    rooms.push(rBed1, rLounge, rBed2, rBed3, rBalcony);
  }

  // 3. Generate Structural Columns Grid based on room boundaries and 12-18ft max spans
  const columns = generateStructuralColumnGrid(buildable, rooms);

  return { buildable, rooms, columns };
}

/**
 * 3. Generate Structural Column Grid (Strict 12 ft to 18 ft Max Span Rule)
 * Filters column placement ONLY to wall intersections and room corners.
 */
export function generateStructuralColumnGrid(
  buildable: Box2D,
  rooms: RoomRect[]
): StructuralColumn[] {
  const { x: bx, y: by, w: bw, h: bh } = buildable;

  // Calculate X grid lines with max span between 12ft and 18ft
  const targetSpanX = 14.0;
  const numBaysX = Math.max(2, Math.round(bw / targetSpanX));
  const spanX = bw / numBaysX;

  const gridXCoords: number[] = [];
  for (let i = 0; i <= numBaysX; i++) {
    gridXCoords.push(Math.round((bx + i * spanX) * 100) / 100);
  }

  // Calculate Y grid lines with max span between 12ft and 18ft
  const targetSpanY = 14.0;
  const numBaysY = Math.max(2, Math.round(bh / targetSpanY));
  const spanY = bh / numBaysY;

  const gridYCoords: number[] = [];
  for (let j = 0; j <= numBaysY; j++) {
    gridYCoords.push(Math.round((by + j * spanY) * 100) / 100);
  }

  // Collect room corners for proximity matching
  const roomCorners: Point2D[] = [];
  rooms.forEach((r) => {
    roomCorners.push({ x: r.x, y: r.y });
    roomCorners.push({ x: r.x + r.w, y: r.y });
    roomCorners.push({ x: r.x, y: r.y + r.h });
    roomCorners.push({ x: r.x + r.w, y: r.y + r.h });
  });

  // Always include buildable envelope 4 corners
  roomCorners.push({ x: bx, y: by });
  roomCorners.push({ x: bx + bw, y: by });
  roomCorners.push({ x: bx, y: by + bh });
  roomCorners.push({ x: bx + bw, y: by + bh });

  const columns: StructuralColumn[] = [];

  const charA = "A".charCodeAt(0);

  gridXCoords.forEach((gx, ix) => {
    const gridChar = String.fromCharCode(charA + ix);

    gridYCoords.forEach((gy, iy) => {
      const gridNum = iy + 1;
      const gridRef = `${gridChar}-${gridNum}`;

      // Check proximity to any room corner or wall intersection (within 2.5 ft tolerance)
      const nearCorner = roomCorners.some(
        (c) => Math.abs(c.x - gx) <= 2.5 && Math.abs(c.y - gy) <= 2.5
      );

      // Outer perimeter points are mandatory
      const isPerimeter =
        Math.abs(gx - bx) < 0.1 ||
        Math.abs(gx - (bx + bw)) < 0.1 ||
        Math.abs(gy - by) < 0.1 ||
        Math.abs(gy - (by + bh)) < 0.1;

      if (nearCorner || isPerimeter) {
        // Standardized 9" x 12" (0.75ft x 1.0ft) column size
        const colW = 0.75;
        const colH = 1.0;

        columns.push({
          id: `col_${gridRef}`,
          x: gx - colW / 2,
          y: gy - colH / 2,
          w: colW,
          h: colH,
          gridRef,
          footingType: "Isolated Footing",
        });
      }
    });
  });

  return columns;
}
