export type BeamType = 'simply_supported' | 'cantilever' | 'fixed' | 'continuous';

export interface SupportBlock {
  id: string;
  type: 'pin' | 'roller' | 'fixed';
  x: number; // position along beam length in meters
}

export interface LoadBlock {
  id: string;
  type: 'point' | 'udl' | 'uvl' | 'moment';
  x: number; // start position in meters
  length?: number; // length for UDL/UVL in meters
  magnitude: number; // kN for point, kN/m for UDL/UVL, kNm for moment
}

export interface BeamSection {
  widthMm: number; // e.g. 230 mm
  depthMm: number; // e.g. 450 mm
  elasticModulusGpa: number; // e.g. 25 GPa for M25 concrete
}

export interface BeamAnalysisResult {
  lengthM: number;
  reactionA: number; // kN
  reactionB: number; // kN
  momentA: number; // kNm (for fixed support)
  maxShearKn: number;
  maxMomentKnm: number;
  maxDeflectionMm: number;
  allowableDeflectionMm: number;
  isSafe: boolean;
  statusMessage: string;
  sfdPoints: { x: number; v: number }[];
  bmdPoints: { x: number; m: number }[];
  deflectionPoints: { x: number; d: number }[];
}

export function analyzeBeam(
  beamType: BeamType,
  lengthM: number,
  supports: SupportBlock[],
  loads: LoadBlock[],
  section: BeamSection
): BeamAnalysisResult {
  const numPoints = 100;
  const dx = lengthM / numPoints;
  const sfdPoints: { x: number; v: number }[] = [];
  const bmdPoints: { x: number; m: number }[] = [];
  const deflectionPoints: { x: number; d: number }[] = [];

  let reactionA = 0;
  let reactionB = 0;
  let momentA = 0;

  // 1. Calculate reactions based on beam type
  if (beamType === 'simply_supported') {
    // Standard simply supported beam with supports at x=0 (pin) and x=L (roller)
    let totalMomentAboutA = 0;
    let totalVerticalLoad = 0;

    loads.forEach(load => {
      if (load.type === 'point') {
        totalVerticalLoad += load.magnitude;
        totalMomentAboutA += load.magnitude * load.x;
      } else if (load.type === 'udl') {
        const udlLen = load.length || lengthM;
        const totalUdl = load.magnitude * udlLen;
        const centroid = load.x + udlLen / 2;
        totalVerticalLoad += totalUdl;
        totalMomentAboutA += totalUdl * centroid;
      } else if (load.type === 'moment') {
        totalMomentAboutA += load.magnitude;
      }
    });

    reactionB = lengthM > 0 ? totalMomentAboutA / lengthM : 0;
    reactionA = totalVerticalLoad - reactionB;
  } else if (beamType === 'cantilever') {
    // Fixed support at x=0, free end at x=L
    loads.forEach(load => {
      if (load.type === 'point') {
        reactionA += load.magnitude;
        momentA += load.magnitude * load.x;
      } else if (load.type === 'udl') {
        const udlLen = load.length || lengthM;
        const totalUdl = load.magnitude * udlLen;
        const centroid = load.x + udlLen / 2;
        reactionA += totalUdl;
        momentA += totalUdl * centroid;
      } else if (load.type === 'moment') {
        momentA += load.magnitude;
      }
    });
    reactionB = 0;
  } else {
    // Fixed / Continuous simplified approximation
    let totalVertical = 0;
    loads.forEach(l => {
      if (l.type === 'point') totalVertical += l.magnitude;
      if (l.type === 'udl') totalVertical += l.magnitude * (l.length || lengthM);
    });
    reactionA = totalVertical / 2;
    reactionB = totalVertical / 2;
  }

  // 2. Generate Shear Force V(x) and Bending Moment M(x) along length
  let maxShear = 0;
  let maxMoment = 0;

  for (let i = 0; i <= numPoints; i++) {
    const x = i * dx;
    let v = 0;
    let m = 0;

    if (beamType === 'simply_supported') {
      v += reactionA;
      m += reactionA * x;

      loads.forEach(l => {
        if (l.type === 'point' && x >= l.x) {
          v -= l.magnitude;
          m -= l.magnitude * (x - l.x);
        } else if (l.type === 'udl' && x >= l.x) {
          const udlLen = l.length || lengthM;
          const endX = l.x + udlLen;
          const activeLen = Math.min(x, endX) - l.x;
          if (activeLen > 0) {
            const loadOnSection = l.magnitude * activeLen;
            v -= loadOnSection;
            m -= loadOnSection * (activeLen / 2 + Math.max(0, x - endX));
          }
        }
      });
    } else if (beamType === 'cantilever') {
      v += reactionA;
      m -= momentA;
      m += reactionA * x;

      loads.forEach(l => {
        if (l.type === 'point' && x >= l.x) {
          v -= l.magnitude;
          m -= l.magnitude * (x - l.x);
        } else if (l.type === 'udl' && x >= l.x) {
          const udlLen = l.length || lengthM;
          const endX = l.x + udlLen;
          const activeLen = Math.min(x, endX) - l.x;
          if (activeLen > 0) {
            const loadOnSection = l.magnitude * activeLen;
            v -= loadOnSection;
            m -= loadOnSection * (activeLen / 2 + Math.max(0, x - endX));
          }
        }
      });
    } else {
      // Simplified Fixed / Continuous
      v = reactionA - (x / lengthM) * (reactionA + reactionB);
      m = reactionA * x - 0.5 * (reactionA + reactionB) * x * (x / lengthM);
    }

    if (Math.abs(v) > maxShear) maxShear = Math.abs(v);
    if (Math.abs(m) > maxMoment) maxMoment = Math.abs(m);

    sfdPoints.push({ x: Math.round(x * 100) / 100, v: Math.round(v * 100) / 100 });
    bmdPoints.push({ x: Math.round(x * 100) / 100, m: Math.round(m * 100) / 100 });
  }

  // 3. Approximate elastic deflection curve (delta = 5 w L^4 / 384 E I)
  // Moment of Inertia I = b * d^3 / 12 (mm4)
  const b = section.widthMm;
  const d = section.depthMm;
  const I_mm4 = (b * Math.pow(d, 3)) / 12;
  const E_Nmm2 = section.elasticModulusGpa * 1000; // GPa to N/mm²

  // Max deflection approximation (mm)
  // delta_max = M_max * L^2 / (10 * E * I)
  const L_mm = lengthM * 1000;
  const M_Nmm = maxMoment * 1e6;
  const EI = E_Nmm2 * I_mm4;
  let maxDeflectionMm = EI > 0 ? (M_Nmm * Math.pow(L_mm, 2)) / (10 * EI) : 0;
  maxDeflectionMm = Math.round(maxDeflectionMm * 10) / 10;

  // Allowable Deflection as per IS 456 (Span / 250)
  const allowableDeflectionMm = Math.round((L_mm / 250) * 10) / 10;

  for (let i = 0; i <= numPoints; i++) {
    const x = i * dx;
    // Sinusoidal/Parabolic shape profile for visualization
    const normX = x / lengthM;
    const shape = Math.sin(Math.PI * normX);
    const def = maxDeflectionMm * shape;
    deflectionPoints.push({ x: Math.round(x * 100) / 100, d: Math.round(def * 100) / 100 });
  }

  const isSafe = maxDeflectionMm <= allowableDeflectionMm && maxMoment < 180;
  let statusMessage = 'Safe Structural Design: Deflection & Bending Moment within IS 456 limits.';
  if (!isSafe) {
    if (maxDeflectionMm > allowableDeflectionMm) {
      statusMessage = `Engineering Review Required: Deflection (${maxDeflectionMm}mm) exceeds IS 456 limit of ${allowableDeflectionMm}mm (Span/250). Increase depth or reduce span.`;
    } else {
      statusMessage = `Engineering Review Required: High Bending Moment (${Math.round(maxMoment)} kNm). Increase reinforcement or section width.`;
    }
  }

  return {
    lengthM,
    reactionA: Math.round(reactionA * 10) / 10,
    reactionB: Math.round(reactionB * 10) / 10,
    momentA: Math.round(momentA * 10) / 10,
    maxShearKn: Math.round(maxShear * 10) / 10,
    maxMomentKnm: Math.round(maxMoment * 10) / 10,
    maxDeflectionMm,
    allowableDeflectionMm,
    isSafe,
    statusMessage,
    sfdPoints,
    bmdPoints,
    deflectionPoints
  };
}
