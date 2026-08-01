import { BlockItem, PlotConfig, WarningItem, getBoundingBox, checkOverlap } from './layoutValidation';

export interface VentilationResult {
  score: number;
  warnings: WarningItem[];
  windowToFloorRatio: number;
}

export function validateVentilation(blocks: BlockItem[], plot: PlotConfig): VentilationResult {
  const warnings: WarningItem[] = [];
  const roomBlocks = blocks.filter(b => b.type === 'room');
  const windowBlocks = blocks.filter(b => b.name.toLowerCase().includes('window') || b.name.toLowerCase().includes('ventilator'));

  if (roomBlocks.length === 0) {
    return { score: 100, warnings: [], windowToFloorRatio: 0 };
  }

  let totalRoomArea = 0;
  let totalWindowArea = 0;

  roomBlocks.forEach(r => {
    const box = getBoundingBox(r);
    const roomArea = box.width * box.length;
    totalRoomArea += roomArea;

    // Find windows placed inside or along the boundary of this room
    const roomWindows = windowBlocks.filter(w => checkOverlap(r, w));

    let roomWinArea = 0;
    roomWindows.forEach(w => {
      const wBox = getBoundingBox(w);
      roomWinArea += wBox.width * wBox.length;
    });

    totalWindowArea += roomWinArea;

    // Minimum window area requirement: NBC / IS code specifies min 10% of floor area
    const ratio = roomArea > 0 ? (roomWinArea / roomArea) * 100 : 0;
    if (ratio < 8 && !r.name.toLowerCase().includes('store') && !r.name.toLowerCase().includes('passage')) {
      warnings.push({
        id: `vent-${r.id}`,
        blockId: r.id,
        category: 'Ventilation',
        severity: ratio === 0 ? 'error' : 'warning',
        message: `${r.name} has insufficient window area (${Math.round(ratio)}% of floor area). NBC recommends at least 10%.`
      });
    }

    // Toilet ventilator check
    if (r.name.toLowerCase().includes('toilet') || r.name.toLowerCase().includes('bathroom')) {
      const hasVent = roomWindows.some(w => w.name.toLowerCase().includes('ventilator') || w.name.toLowerCase().includes('window'));
      if (!hasVent) {
        warnings.push({
          id: `toilet-vent-${r.id}`,
          blockId: r.id,
          category: 'Ventilation',
          severity: 'error',
          message: `${r.name} lacks a ventilator for odor extraction & air movement.`
        });
      }
    }
  });

  const overallRatio = totalRoomArea > 0 ? Math.round((totalWindowArea / totalRoomArea) * 100 * 10) / 10 : 0;

  let score = 100;
  warnings.forEach(w => {
    if (w.severity === 'error') score -= 20;
    if (w.severity === 'warning') score -= 10;
  });

  return {
    score: Math.max(0, Math.min(100, score)),
    warnings,
    windowToFloorRatio: overallRatio
  };
}
