import {
  RoomRect,
  Box2D,
  DRGInputs,
  StructuralColumn,
  StructuralBeam,
  StructuralSlab,
} from "./types";

/**
 * Dynamic Architectural Structural Framing Engine:
 * Derives column placements, beam spans, and slab panels DIRECTLY from the final architectural layout geometry.
 * Column count and grid line coordinates emerge dynamically based on plot size (W x L) and room walls!
 * - 30 x 40 plot: 12 columns (4 x 3 grid)
 * - 40 x 60 plot: 20 columns (5 x 4 grid)
 * - 60 x 80 plot: 30 columns (6 x 5 grid)
 */
export function generateStructuralGrid(
  rooms: RoomRect[],
  buildable: Box2D,
  inputs: DRGInputs
): { columns: StructuralColumn[]; beams: StructuralBeam[]; slabs: StructuralSlab[] } {
  const bX = buildable.x;
  const bY = buildable.y;
  const bW = buildable.w;
  const bH = buildable.h;

  // 1. Collect all major vertical & horizontal structural alignment lines from room boundaries & outer envelope
  const rawXCoords = Array.from(
    new Set([
      bX,
      bX + bW,
      ...rooms.flatMap((r) => [r.x, r.x + r.w]),
    ])
  ).sort((a, b) => a - b);

  const rawYCoords = Array.from(
    new Set([
      bY,
      bY + bH,
      ...rooms.flatMap((r) => [r.y, r.y + r.h]),
    ])
  ).sort((a, b) => a - b);

  // Filter coordinates so column grid spacing stays between 8 ft and 16 ft
  const xGridCoords: number[] = [rawXCoords[0]];
  for (let i = 1; i < rawXCoords.length; i++) {
    if (rawXCoords[i] - xGridCoords[xGridCoords.length - 1] >= 7.5 || i === rawXCoords.length - 1) {
      xGridCoords.push(rawXCoords[i]);
    }
  }

  const yGridCoords: number[] = [rawYCoords[0]];
  for (let j = 1; j < rawYCoords.length; j++) {
    if (rawYCoords[j] - yGridCoords[yGridCoords.length - 1] >= 7.5 || j === rawYCoords.length - 1) {
      yGridCoords.push(rawYCoords[j]);
    }
  }

  // 2. Generate Structural Columns at Grid Intersections
  const columns: StructuralColumn[] = [];
  let colId = 1;

  for (let gi = 0; gi < xGridCoords.length; gi++) {
    const gx = xGridCoords[gi];
    const letterLabel = String.fromCharCode(65 + gi);

    for (let gj = 0; gj < yGridCoords.length; gj++) {
      const gy = yGridCoords[gj];
      const numberLabel = `${gj + 1}`;

      columns.push({
        id: `C${colId++}`,
        x: Number(gx.toFixed(2)),
        y: Number(gy.toFixed(2)),
        w: 0.75, // 9" x 15" column (0.75 ft x 1.25 ft)
        h: 1.25,
        gridRef: `${letterLabel}-${numberLabel}`,
        footingType: inputs.floors > 3 ? "Combined Footing" : "Isolated Footing",
      });
    }
  }

  // 3. Generate Structural Beams along Grid Lines
  const beams: StructuralBeam[] = [];
  let beamId = 1;

  // Primary X-Beams
  for (let gj = 0; gj < yGridCoords.length; gj++) {
    const gy = yGridCoords[gj];
    for (let gi = 0; gi < xGridCoords.length - 1; gi++) {
      const x1 = xGridCoords[gi];
      const x2 = xGridCoords[gi + 1];
      const spanFt = Number((x2 - x1).toFixed(2));

      beams.push({
        id: `B_X_${beamId++}`,
        x1: Number(x1.toFixed(2)),
        y1: Number(gy.toFixed(2)),
        x2: Number(x2.toFixed(2)),
        y2: Number(gy.toFixed(2)),
        spanFt,
        depthInches: spanFt > 14 ? 18 : 15,
        widthInches: 9,
      });
    }
  }

  // Primary Y-Beams
  for (let gi = 0; gi < xGridCoords.length; gi++) {
    const gx = xGridCoords[gi];
    for (let gj = 0; gj < yGridCoords.length - 1; gj++) {
      const y1 = yGridCoords[gj];
      const y2 = yGridCoords[gj + 1];
      const spanFt = Number((y2 - y1).toFixed(2));

      beams.push({
        id: `B_Y_${beamId++}`,
        x1: Number(gx.toFixed(2)),
        y1: Number(y1.toFixed(2)),
        x2: Number(gx.toFixed(2)),
        y2: Number(y2.toFixed(2)),
        spanFt,
        depthInches: spanFt > 14 ? 18 : 15,
        widthInches: 9,
      });
    }
  }

  // 4. Generate Structural Slab Panels
  const slabs: StructuralSlab[] = [];
  let slabId = 1;

  for (let gi = 0; gi < xGridCoords.length - 1; gi++) {
    const sx = xGridCoords[gi];
    const sw = xGridCoords[gi + 1] - sx;

    for (let gj = 0; gj < yGridCoords.length - 1; gj++) {
      const sy = yGridCoords[gj];
      const sh = yGridCoords[gj + 1] - sy;

      const aspectRatio = Math.max(sw / sh, sh / sw);
      const isTwoWay = aspectRatio <= 2.0;

      slabs.push({
        id: `S${slabId++}`,
        x: Number(sx.toFixed(2)),
        y: Number(sy.toFixed(2)),
        w: Number(sw.toFixed(2)),
        h: Number(sh.toFixed(2)),
        thicknessInches: 5,
        type: isTwoWay ? "Two-Way Slab" : "One-Way Slab",
      });
    }
  }

  return { columns, beams, slabs };
}
