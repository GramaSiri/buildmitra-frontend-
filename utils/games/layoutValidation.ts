export interface BlockItem {
  id: string;
  type: string; // 'room' | 'structure' | 'door_window' | 'furniture' | 'external'
  name: string;
  x: number; // in feet or meters relative to plot origin
  y: number;
  width: number;
  length: number;
  rotation: number; // 0, 90, 180, 270
  color?: string;
  label?: string;
  isLocked?: boolean;
  material?: string;
}

export interface PlotConfig {
  width: number; // e.g. 30
  length: number; // e.g. 40
  unit: 'ft' | 'm';
  roadSide: 'North' | 'South' | 'East' | 'West';
  northDirection: number; // 0=Top, 90=Right, 180=Bottom, 270=Left
  setbackFront: number;
  setbackRear: number;
  setbackLeft: number;
  setbackRight: number;
  wallThickness: number;
}

export interface WarningItem {
  id: string;
  blockId?: string;
  category: 'Space' | 'Ventilation' | 'Structure' | 'Vastu' | 'Safety';
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface AreaMetrics {
  plotArea: number;
  carpetArea: number;
  builtUpArea: number;
  circulationArea: number;
  openArea: number;
  efficiencyRatio: number; // Carpet / Built-up %
}

// Bounding box calculation accounting for 90 degree rotation
export function getBoundingBox(b: BlockItem) {
  const isRotated = (b.rotation / 90) % 2 !== 0;
  const w = isRotated ? b.length : b.width;
  const l = isRotated ? b.width : b.length;
  return {
    x1: b.x,
    y1: b.y,
    x2: b.x + w,
    y2: b.y + l,
    width: w,
    length: l
  };
}

// Check intersection of two blocks
export function checkOverlap(b1: BlockItem, b2: BlockItem): boolean {
  const box1 = getBoundingBox(b1);
  const box2 = getBoundingBox(b2);

  return !(
    box1.x2 <= box2.x1 ||
    box1.x1 >= box2.x2 ||
    box1.y2 <= box2.y1 ||
    box1.y1 >= box2.y2
  );
}

export function calculateAreaMetrics(blocks: BlockItem[], plot: PlotConfig): AreaMetrics {
  const plotArea = plot.width * plot.length;
  let carpetArea = 0;
  let circulationArea = 0;

  const roomBlocks = blocks.filter(b => b.type === 'room');

  roomBlocks.forEach(b => {
    const box = getBoundingBox(b);
    const area = box.width * box.length;
    if (b.name.toLowerCase().includes('passage') || b.name.toLowerCase().includes('corridor') || b.name.toLowerCase().includes('veranda')) {
      circulationArea += area;
    } else {
      carpetArea += area;
    }
  });

  const wallFactor = 1.12; // Wall allowance
  const builtUpArea = (carpetArea + circulationArea) * wallFactor;
  const openArea = Math.max(0, plotArea - builtUpArea);
  const efficiencyRatio = builtUpArea > 0 ? Math.min(100, Math.round((carpetArea / builtUpArea) * 100)) : 0;

  return {
    plotArea: Math.round(plotArea),
    carpetArea: Math.round(carpetArea),
    builtUpArea: Math.round(builtUpArea),
    circulationArea: Math.round(circulationArea),
    openArea: Math.round(openArea),
    efficiencyRatio
  };
}

export function validateSpacePlanning(blocks: BlockItem[], plot: PlotConfig): { score: number; warnings: WarningItem[] } {
  const warnings: WarningItem[] = [];
  const roomBlocks = blocks.filter(b => b.type === 'room');

  if (roomBlocks.length === 0) {
    return { score: 0, warnings: [{ id: 'no-rooms', category: 'Space', severity: 'info', message: 'Add rooms from the block palette to begin space planning.' }] };
  }

  // 1. Outside Plot & Setback Violation
  roomBlocks.forEach(b => {
    const box = getBoundingBox(b);
    if (box.x1 < 0 || box.y1 < 0 || box.x2 > plot.width || box.y2 > plot.length) {
      warnings.push({
        id: `outside-${b.id}`,
        blockId: b.id,
        category: 'Space',
        severity: 'error',
        message: `${b.name} (${b.label || ''}) extends outside the plot boundary!`
      });
    }
  });

  // 2. Room Overlaps
  for (let i = 0; i < roomBlocks.length; i++) {
    for (let j = i + 1; j < roomBlocks.length; j++) {
      if (checkOverlap(roomBlocks[i], roomBlocks[j])) {
        warnings.push({
          id: `overlap-${roomBlocks[i].id}-${roomBlocks[j].id}`,
          blockId: roomBlocks[i].id,
          category: 'Space',
          severity: 'error',
          message: `${roomBlocks[i].name} overlaps with ${roomBlocks[j].name}.`
        });
      }
    }
  }

  // 3. Proportions & Minimum Dimension Checks
  roomBlocks.forEach(b => {
    const box = getBoundingBox(b);
    const minDim = Math.min(box.width, box.length);
    if (b.name.toLowerCase().includes('bedroom') && minDim < 8) {
      warnings.push({
        id: `narrow-bed-${b.id}`,
        blockId: b.id,
        category: 'Space',
        severity: 'warning',
        message: `${b.name} width is ${minDim}${plot.unit}. Recommended minimum bedroom width is 9 ${plot.unit}.`
      });
    }
    if (b.name.toLowerCase().includes('kitchen') && minDim < 5) {
      warnings.push({
        id: `narrow-kit-${b.id}`,
        blockId: b.id,
        category: 'Space',
        severity: 'warning',
        message: `Kitchen width is too narrow (${minDim}${plot.unit}). Minimum recommended is 6 ${plot.unit}.`
      });
    }
  });

  // 4. Door and Furniture Obstruction
  const doorBlocks = blocks.filter(b => b.name.toLowerCase().includes('door'));
  const furnitureBlocks = blocks.filter(b => b.type === 'furniture');

  doorBlocks.forEach(d => {
    furnitureBlocks.forEach(f => {
      if (checkOverlap(d, f)) {
        warnings.push({
          id: `door-obstruct-${d.id}-${f.id}`,
          blockId: d.id,
          category: 'Safety',
          severity: 'warning',
          message: `Door (${d.name}) swing path is obstructed by ${f.name}.`
        });
      }
    });
  });

  // Score Calculation
  let baseScore = 100;
  warnings.forEach(w => {
    if (w.severity === 'error') baseScore -= 20;
    if (w.severity === 'warning') baseScore -= 8;
  });

  return {
    score: Math.max(0, Math.min(100, baseScore)),
    warnings
  };
}
