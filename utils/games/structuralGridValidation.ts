import { BlockItem, PlotConfig, WarningItem, getBoundingBox } from './layoutValidation';

export interface StructuralResult {
  score: number;
  warnings: WarningItem[];
  columnCount: number;
  maxSpanFeet: number;
}

export function validateStructuralGrid(blocks: BlockItem[], plot: PlotConfig): StructuralResult {
  const warnings: WarningItem[] = [];
  const columnBlocks = blocks.filter(b => b.name.toLowerCase().includes('column') || b.name.toLowerCase().includes('pillar'));
  const roomBlocks = blocks.filter(b => b.type === 'room');

  if (columnBlocks.length === 0) {
    return {
      score: 40,
      warnings: [{
        id: 'no-columns',
        category: 'Structure',
        severity: 'warning',
        message: 'No structural columns placed. Add column markers at room corners for safe RCC framing.'
      }],
      columnCount: 0,
      maxSpanFeet: 0
    };
  }

  // 1. Calculate max column-to-column span
  let maxSpan = 0;
  for (let i = 0; i < columnBlocks.length; i++) {
    for (let j = i + 1; j < columnBlocks.length; j++) {
      const c1 = getBoundingBox(columnBlocks[i]);
      const c2 = getBoundingBox(columnBlocks[j]);
      const dist = Math.sqrt(Math.pow(c1.x1 - c2.x1, 2) + Math.pow(c1.y1 - c2.y1, 2));

      // Consider columns roughly aligned in grid line (delta < 2ft)
      if (Math.abs(c1.x1 - c2.x1) < 2 || Math.abs(c1.y1 - c2.y1) < 2) {
        if (dist > maxSpan) {
          maxSpan = dist;
        }
      }
    }
  }

  // Warning for spans exceeding 20 feet (6 meters) without intermediate beams
  if (maxSpan > 20) {
    warnings.push({
      id: 'long-span',
      category: 'Structure',
      severity: 'error',
      message: `Column span reaches ${Math.round(maxSpan)} ${plot.unit}. Spans exceeding 20ft require heavy RCC beam sections or intermediate columns.`
    });
  }

  // 2. Check unsupported room corners
  roomBlocks.forEach(r => {
    const box = getBoundingBox(r);
    const corners = [
      { x: box.x1, y: box.y1 },
      { x: box.x2, y: box.y1 },
      { x: box.x1, y: box.y2 },
      { x: box.x2, y: box.y2 }
    ];

    corners.forEach((corner, idx) => {
      const hasNearColumn = columnBlocks.some(c => {
        const cBox = getBoundingBox(c);
        const dist = Math.sqrt(Math.pow(cBox.x1 - corner.x, 2) + Math.pow(cBox.y1 - corner.y, 2));
        return dist < 3.5; // Within 3.5 ft threshold
      });

      if (!hasNearColumn && box.width * box.length > 120) {
        warnings.push({
          id: `corner-col-${r.id}-${idx}`,
          blockId: r.id,
          category: 'Structure',
          severity: 'info',
          message: `Corner of ${r.name} has no nearby structural column marker.`
        });
      }
    });
  });

  let score = 100;
  warnings.forEach(w => {
    if (w.severity === 'error') score -= 25;
    if (w.severity === 'warning') score -= 15;
    if (w.severity === 'info') score -= 5;
  });

  return {
    score: Math.max(0, Math.min(100, score)),
    warnings,
    columnCount: columnBlocks.length,
    maxSpanFeet: Math.round(maxSpan)
  };
}
