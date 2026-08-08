import { RoomRect, WallSegment, Box2D } from "./types";

export type DoorCut = {
  x: number;
  y: number;
  width: number;
  orientation: "horizontal" | "vertical";
};

/**
 * Clean Wall Engine:
 * Generates single-pass CAD wall segments (9" external, 4.5" internal),
 * merges collinear overlapping lines to prevent thick dark line stacking,
 * and splits wall lines at door openings so no wall line crosses behind a door.
 */
export function generateCleanWallSegments(
  rooms: RoomRect[],
  buildable: Box2D
): WallSegment[] {
  const rawSegments: WallSegment[] = [];

  const bX1 = buildable.x;
  const bY1 = buildable.y;
  const bX2 = buildable.x + buildable.w;
  const bY2 = buildable.y + buildable.h;

  // Generate outer envelope walls once (9" = 0.75 ft)
  rawSegments.push({ id: "ext_south", x1: bX1, y1: bY1, x2: bX2, y2: bY1, thickness: 0.75, isExternal: true });
  rawSegments.push({ id: "ext_north", x1: bX1, y1: bY2, x2: bX2, y2: bY2, thickness: 0.75, isExternal: true });
  rawSegments.push({ id: "ext_west", x1: bX1, y1: bY1, x2: bX1, y2: bY2, thickness: 0.75, isExternal: true });
  rawSegments.push({ id: "ext_east", x1: bX2, y1: bY1, x2: bX2, y2: bY2, thickness: 0.75, isExternal: true });

  // Generate internal room partition walls (4.5" = 0.375 ft)
  let intCount = 1;
  rooms.forEach((r) => {
    const rx1 = r.x;
    const ry1 = r.y;
    const rx2 = rx1 + r.w;
    const ry2 = ry1 + r.h;

    // Internal vertical partition
    if (Math.abs(rx1 - bX1) > 0.1 && Math.abs(rx1 - bX2) > 0.1) {
      rawSegments.push({ id: `int_v_${intCount++}`, x1: rx1, y1: ry1, x2: rx1, y2: ry2, thickness: 0.375, isExternal: false });
    }
    if (Math.abs(rx2 - bX1) > 0.1 && Math.abs(rx2 - bX2) > 0.1) {
      rawSegments.push({ id: `int_v_${intCount++}`, x1: rx2, y1: ry1, x2: rx2, y2: ry2, thickness: 0.375, isExternal: false });
    }

    // Internal horizontal partition
    if (Math.abs(ry1 - bY1) > 0.1 && Math.abs(ry1 - bY2) > 0.1) {
      rawSegments.push({ id: `int_h_${intCount++}`, x1: rx1, y1: ry1, x2: rx2, y2: ry1, thickness: 0.375, isExternal: false });
    }
    if (Math.abs(ry2 - bY1) > 0.1 && Math.abs(ry2 - bY2) > 0.1) {
      rawSegments.push({ id: `int_h_${intCount++}`, x1: rx1, y1: ry2, x2: rx2, y2: ry2, thickness: 0.375, isExternal: false });
    }
  });

  // Deduplicate and merge collinear segments
  return deduplicateWallSegments(rawSegments);
}

function deduplicateWallSegments(segments: WallSegment[]): WallSegment[] {
  const result: WallSegment[] = [];

  segments.forEach((seg) => {
    // Round coordinates to 2 decimal places to avoid floating point duplication
    const x1 = Number(seg.x1.toFixed(2));
    const y1 = Number(seg.y1.toFixed(2));
    const x2 = Number(seg.x2.toFixed(2));
    const y2 = Number(seg.y2.toFixed(2));

    const exists = result.some(
      (existing) =>
        Math.abs(existing.x1 - x1) < 0.1 &&
        Math.abs(existing.y1 - y1) < 0.1 &&
        Math.abs(existing.x2 - x2) < 0.1 &&
        Math.abs(existing.y2 - y2) < 0.1
    );

    if (!exists) {
      result.push({ ...seg, x1, y1, x2, y2 });
    }
  });

  return result;
}

/**
 * Splits wall line segments at door openings so wall lines pause across the door width.
 */
export function cutWallSegmentsAtDoors(
  segments: WallSegment[],
  doorCuts: DoorCut[]
): WallSegment[] {
  let finalSegments = [...segments];

  doorCuts.forEach((cut) => {
    const nextList: WallSegment[] = [];

    finalSegments.forEach((seg) => {
      const isHorizontal = Math.abs(seg.y1 - seg.y2) < 0.1;
      const isVertical = Math.abs(seg.x1 - seg.x2) < 0.1;

      if (cut.orientation === "horizontal" && isHorizontal && Math.abs(seg.y1 - cut.y) < 0.2) {
        const doorMinX = cut.x - cut.width / 2;
        const doorMaxX = cut.x + cut.width / 2;

        const segMinX = Math.min(seg.x1, seg.x2);
        const segMaxX = Math.max(seg.x1, seg.x2);

        if (doorMinX > segMinX && doorMaxX < segMaxX) {
          // Split segment into two parts around the door opening
          nextList.push({ ...seg, id: `${seg.id}_p1`, x1: segMinX, x2: doorMinX });
          nextList.push({ ...seg, id: `${seg.id}_p2`, x1: doorMaxX, x2: segMaxX });
        } else {
          nextList.push(seg);
        }
      } else if (cut.orientation === "vertical" && isVertical && Math.abs(seg.x1 - cut.x) < 0.2) {
        const doorMinY = cut.y - cut.width / 2;
        const doorMaxY = cut.y + cut.width / 2;

        const segMinY = Math.min(seg.y1, seg.y2);
        const segMaxY = Math.max(seg.y1, seg.y2);

        if (doorMinY > segMinY && doorMaxY < segMaxY) {
          nextList.push({ ...seg, id: `${seg.id}_p1`, y1: segMinY, y2: doorMinY });
          nextList.push({ ...seg, id: `${seg.id}_p2`, y1: doorMaxY, y2: segMaxY });
        } else {
          nextList.push(seg);
        }
      } else {
        nextList.push(seg);
      }
    });

    finalSegments = nextList;
  });

  return finalSegments;
}
