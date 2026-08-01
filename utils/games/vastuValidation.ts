import { BlockItem, PlotConfig, WarningItem, getBoundingBox } from './layoutValidation';

export interface VastuResult {
  score: number;
  warnings: WarningItem[];
  tips: string[];
}

export function validateVastu(blocks: BlockItem[], plot: PlotConfig): VastuResult {
  const warnings: WarningItem[] = [];
  const tips: string[] = [];

  const roomBlocks = blocks.filter(b => b.type === 'room' || b.name.toLowerCase().includes('door') || b.name.toLowerCase().includes('puja'));

  if (roomBlocks.length === 0) {
    return {
      score: 100,
      warnings: [],
      tips: ['Place Kitchen in SE, Master Bedroom in SW, Puja in NE for traditional Vastu compliance.']
    };
  }

  let totalPoints = 0;
  let maxPoints = 0;

  // Helper to determine quadrant (0..1 normalized X, Y)
  const getQuadrant = (b: BlockItem) => {
    const box = getBoundingBox(b);
    const centerX = (box.x1 + box.x2) / 2;
    const centerY = (box.y1 + box.y2) / 2;

    const normX = centerX / plot.width;
    const normY = centerY / plot.length;

    // Y=0 is Top (North/Road depending on orientation), X=0 is Left (West)
    // Assuming North at Top:
    // Top-Right = NE, Bottom-Right = SE, Bottom-Left = SW, Top-Left = NW
    const isNorth = normY < 0.5;
    const isEast = normX > 0.5;

    if (isNorth && isEast) return 'NE';
    if (!isNorth && isEast) return 'SE';
    if (!isNorth && !isEast) return 'SW';
    return 'NW';
  };

  // 1. Kitchen Check (Preferred: SE, Alternate: NW)
  const kitchen = roomBlocks.find(b => b.name.toLowerCase().includes('kitchen'));
  if (kitchen) {
    maxPoints += 25;
    const quad = getQuadrant(kitchen);
    if (quad === 'SE') {
      totalPoints += 25;
      tips.push('✅ Excellent! Kitchen is positioned in the Agneya (Southeast) zone.');
    } else if (quad === 'NW') {
      totalPoints += 15;
      tips.push('ℹ️ Kitchen in NW is acceptable as an alternative Vastu zone.');
    } else {
      warnings.push({
        id: `vastu-kit-${kitchen.id}`,
        blockId: kitchen.id,
        category: 'Vastu',
        severity: 'info',
        message: `Vastu preference: Kitchen is currently in ${quad}. Southeast (SE) is traditionally recommended for fire elements.`
      });
    }
  }

  // 2. Master Bedroom (Preferred: SW)
  const masterBed = roomBlocks.find(b => b.name.toLowerCase().includes('master bedroom'));
  if (masterBed) {
    maxPoints += 25;
    const quad = getQuadrant(masterBed);
    if (quad === 'SW') {
      totalPoints += 25;
      tips.push('✅ Master Bedroom in Nairutya (Southwest) provides stability according to Vastu.');
    } else {
      warnings.push({
        id: `vastu-bed-${masterBed.id}`,
        blockId: masterBed.id,
        category: 'Vastu',
        severity: 'info',
        message: `Vastu preference: Master Bedroom is in ${quad}. Southwest (SW) is preferred for master bedroom.`
      });
    }
  }

  // 3. Puja Room (Preferred: NE)
  const puja = roomBlocks.find(b => b.name.toLowerCase().includes('puja'));
  if (puja) {
    maxPoints += 25;
    const quad = getQuadrant(puja);
    if (quad === 'NE') {
      totalPoints += 25;
      tips.push('✅ Puja Room in Ishanya (Northeast) brings optimal natural light and peaceful energy.');
    } else {
      warnings.push({
        id: `vastu-puja-${puja.id}`,
        blockId: puja.id,
        category: 'Vastu',
        severity: 'info',
        message: `Vastu preference: Puja Room is in ${quad}. Northeast (NE) is preferred.`
      });
    }
  }

  // 4. Main Entrance (Preferred: North or East)
  const mainDoor = blocks.find(b => b.name.toLowerCase().includes('main door'));
  if (mainDoor) {
    maxPoints += 25;
    const quad = getQuadrant(mainDoor);
    if (quad === 'NE' || quad === 'NW') {
      totalPoints += 25;
      tips.push('✅ Main Entrance located in North/Northeast sector.');
    } else {
      warnings.push({
        id: `vastu-door-${mainDoor.id}`,
        blockId: mainDoor.id,
        category: 'Vastu',
        severity: 'info',
        message: `Vastu preference: Main Entrance is in ${quad}. Eastern or Northern placements are traditional preferences.`
      });
    }
  }

  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 80;

  return {
    score,
    warnings,
    tips
  };
}
