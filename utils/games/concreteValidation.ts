export interface ConcreteMixInput {
  grade: string; // 'M5' | 'M7.5' | 'M10' | 'M15' | 'M20' | 'M25' | 'M30' | 'M35' | 'M40'
  cementParts: number;
  fineAggregateParts: number;
  coarseAggregateParts: number;
  waterCementRatio: number;
  admixtureDosePct: number;
  exposureCondition: 'Mild' | 'Moderate' | 'Severe' | 'Very Severe' | 'Extreme';
  maxAggregateSizeMm: 10 | 20 | 40;
}

export interface SlumpResult {
  slumpMm: number;
  type: 'True Slump' | 'Shear Slump' | 'Collapse Slump';
  workability: 'Low' | 'Medium' | 'High' | 'Very High' | 'Segregated';
  suitability: string;
  isSafe: boolean;
}

export interface CTMResult {
  loadKn: number;
  areaMm2: number;
  compressiveStrength7Day: number;
  compressiveStrength14Day: number;
  compressiveStrength28Day: number;
  targetStrength28Day: number;
  passedTarget: boolean;
  failureMode: 'Normal Hourglass' | 'Shear Failure' | 'Explosive Failure' | 'Crushing';
  crackPattern: string;
}

// Characteristic target 28-day strength in N/mm2 (MPa)
export const TARGET_STRENGTHS: Record<string, number> = {
  M5: 5,
  'M7.5': 7.5,
  M10: 10,
  M15: 15,
  M20: 20,
  M25: 25,
  M30: 30,
  M35: 35,
  M40: 40
};

// Nominal mix ratios (Cement : Fine : Coarse) for educational standard benchmarks
export const NOMINAL_MIXES: Record<string, { c: number; fa: number; ca: number; wc: number }> = {
  M5: { c: 1, fa: 5, ca: 10, wc: 0.65 },
  'M7.5': { c: 1, fa: 4, ca: 8, wc: 0.60 },
  M10: { c: 1, fa: 3, ca: 6, wc: 0.55 },
  M15: { c: 1, fa: 2, ca: 4, wc: 0.50 },
  M20: { c: 1, fa: 1.5, ca: 3, wc: 0.45 },
  M25: { c: 1, fa: 1, ca: 2, wc: 0.40 },
  M30: { c: 1, fa: 0.8, ca: 1.6, wc: 0.38 },
  M35: { c: 1, fa: 0.7, ca: 1.4, wc: 0.35 },
  M40: { c: 1, fa: 0.6, ca: 1.2, wc: 0.32 }
};

export function calculateSlumpTest(input: ConcreteMixInput): SlumpResult {
  const { waterCementRatio, admixtureDosePct, coarseAggregateParts, fineAggregateParts } = input;

  // Base slump calculated from w/c ratio and sand ratio
  let slump = (waterCementRatio - 0.30) * 280 + (admixtureDosePct * 25);
  
  if (coarseAggregateParts < 2) slump += 20; // Excess paste increases slump

  slump = Math.max(0, Math.round(slump));

  let type: SlumpResult['type'] = 'True Slump';
  let workability: SlumpResult['workability'] = 'Medium';
  let suitability = '';
  let isSafe = true;

  if (waterCementRatio > 0.60 || slump > 175) {
    type = 'Collapse Slump';
    workability = 'Very High';
    suitability = 'Concrete suffers from excessive segregation and bleeding due to high water-cement ratio.';
    isSafe = false;
  } else if (waterCementRatio < 0.35 && admixtureDosePct === 0) {
    type = 'True Slump';
    workability = 'Low';
    suitability = 'Very dry mix with low workability; requires intense mechanical vibration.';
    isSafe = true;
  } else if (slump >= 25 && slump <= 75) {
    type = 'True Slump';
    workability = 'Low';
    suitability = 'Ideal for mass concrete, pavements, and lightly reinforced slabs.';
    isSafe = true;
  } else if (slump > 75 && slump <= 125) {
    type = 'True Slump';
    workability = 'Medium';
    suitability = 'Suitable for heavily reinforced RCC beams, columns, and slabs (IS 456 target).';
    isSafe = true;
  } else if (slump > 125 && slump <= 175) {
    type = 'True Slump';
    workability = 'High';
    suitability = 'Suitable for congested rebar, pumped concrete, and tremie underwater concreting.';
    isSafe = true;
  } else {
    type = 'Shear Slump';
    workability = 'Low';
    suitability = 'Unstable shear failure; re-test with improved aggregate grading.';
    isSafe = false;
  }

  return { slumpMm: slump, type, workability, suitability, isSafe };
}

export function calculateCTMTest(input: ConcreteMixInput): CTMResult {
  const target28 = TARGET_STRENGTHS[input.grade] || 20;
  const nominal = NOMINAL_MIXES[input.grade] || NOMINAL_MIXES['M20'];

  // Calculate strength factor based on deviation from nominal w/c ratio
  const wcFactor = 1 - (input.waterCementRatio - nominal.wc) * 1.8;
  const aggregateRatioFactor = 1 - Math.abs((input.fineAggregateParts / (input.coarseAggregateParts || 1)) - (nominal.fa / nominal.ca)) * 0.3;

  // 28-day estimated compressive strength in MPa
  let actual28Day = target28 * wcFactor * aggregateRatioFactor;
  if (input.admixtureDosePct > 0) actual28Day += input.admixtureDosePct * 2.5;

  actual28Day = Math.max(2, Math.round(actual28Day * 10) / 10);

  // Strength growth curves: 7-day ~ 65%, 14-day ~ 90%, 28-day ~ 100%
  const day7 = Math.round(actual28Day * 0.67 * 10) / 10;
  const day14 = Math.round(actual28Day * 0.90 * 10) / 10;

  // 150mm standard cube area = 150 * 150 = 22500 mm²
  const areaMm2 = 150 * 150; // 22,500 mm²
  // Failure Load P (N) = Strength (N/mm²) * Area (mm²)
  // P (kN) = P(N) / 1000
  const loadKn = Math.round((actual28Day * areaMm2) / 1000);

  const passedTarget = actual28Day >= target28;

  let failureMode: CTMResult['failureMode'] = 'Normal Hourglass';
  let crackPattern = 'Symmetrical hourglass diagonal shear cracking on four faces.';

  if (!passedTarget && input.waterCementRatio > 0.55) {
    failureMode = 'Crushing';
    crackPattern = 'Soft porous crushing failure due to excessive water voids.';
  } else if (actual28Day > target28 * 1.2) {
    failureMode = 'Explosive Failure';
    crackPattern = 'High-strength sudden explosive vertical spalling with loud pop sound.';
  }

  return {
    loadKn,
    areaMm2,
    compressiveStrength7Day: day7,
    compressiveStrength14Day: day14,
    compressiveStrength28Day: actual28Day,
    targetStrength28Day: target28,
    passedTarget,
    failureMode,
    crackPattern
  };
}

