import { Point2D, Box2D, Polygon2D } from "./types";

/**
 * Checks if a 2D point is inside a polygon using ray-casting algorithm
 */
export function pointInPolygon(point: Point2D, polygon: Polygon2D): boolean {
  let inside = false;
  const { x, y } = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calculates the area of a 2D polygon using Shoelace formula
 */
export function polygonArea(polygon: Polygon2D): number {
  if (polygon.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Calculates the total perimeter of a 2D polygon
 */
export function polygonPerimeter(polygon: Polygon2D): number {
  if (polygon.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const dx = polygon[j].x - polygon[i].x;
    const dy = polygon[j].y - polygon[i].y;
    perimeter += Math.hypot(dx, dy);
  }
  return perimeter;
}

/**
 * Gets bounding box of a 2D polygon
 */
export function polygonBounds(polygon: Polygon2D): Box2D {
  if (!polygon.length) return { x: 0, y: 0, w: 0, h: 0 };
  let minX = polygon[0].x;
  let maxX = polygon[0].x;
  let minY = polygon[0].y;
  let maxY = polygon[0].y;

  for (const pt of polygon) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  return {
    x: minX,
    y: minY,
    w: Math.max(0, maxX - minX),
    h: Math.max(0, maxY - minY),
  };
}

/**
 * Checks if two bounding boxes intersect with optional buffer
 */
export function boxIntersects(a: Box2D, b: Box2D, buffer = 0.01): boolean {
  return (
    a.x < b.x + b.w - buffer &&
    a.x + a.w > b.x + buffer &&
    a.y < b.y + b.h - buffer &&
    a.y + a.h > b.y + buffer
  );
}

/**
 * Checks if box A strictly contains box B
 */
export function boxContains(container: Box2D, inner: Box2D, tolerance = 0.01): boolean {
  return (
    inner.x >= container.x - tolerance &&
    inner.y >= container.y - tolerance &&
    inner.x + inner.w <= container.x + container.w + tolerance &&
    inner.y + inner.h <= container.y + container.h + tolerance
  );
}

/**
 * Snaps a number to grid resolution (default 0.25 ft / 3 inches)
 */
export function snapToGrid(value: number, step = 0.25): number {
  return Math.round(value / step) * step;
}

/**
 * Clamps a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Generates an inward setback polygon offset from a rectangular/polygon plot
 */
export function createSetbackPolygon(
  width: number,
  length: number,
  setbacks: { front: number; rear: number; left: number; right: number },
  facing: "East" | "West" | "North" | "South"
): Polygon2D {
  let frontS = setbacks.front;
  let rearS = setbacks.rear;
  let leftS = setbacks.left;
  let rightS = setbacks.right;

  // Orient setbacks based on road facing direction
  // Assuming default orientation: Y=0 is Front (South), Y=length is Rear (North), X=0 is Left (West), X=width is Right (East)
  if (facing === "North") {
    // North facing: Y=length is Front, Y=0 is Rear
    const temp = frontS;
    frontS = rearS;
    rearS = temp;
  } else if (facing === "East") {
    // East facing: X=width is Front, X=0 is Rear, Y=0 is Right, Y=length is Left
    const tempF = frontS;
    frontS = rightS;
    rightS = tempF;
  } else if (facing === "West") {
    // West facing: X=0 is Front, X=width is Rear
    const tempF = frontS;
    frontS = leftS;
    leftS = tempF;
  }

  const x1 = Math.min(width, Math.max(0, leftS));
  const x2 = Math.max(x1, width - rightS);
  const y1 = Math.min(length, Math.max(0, frontS));
  const y2 = Math.max(y1, length - rearS);

  return [
    { x: x1, y: y1 },
    { x: x2, y: y1 },
    { x: x2, y: y2 },
    { x: x1, y: y2 },
  ];
}
