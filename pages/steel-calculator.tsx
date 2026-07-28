import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate } from "../utils/masterRates";

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#5a3e2b', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#5a3e2b', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginBottom: '12px' },
  label: { display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '11px', color: '#555' },
  input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff' },
  select: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff' },
  buttonRow: { display: 'flex', justifyContent: 'center', gap: '15px', margin: '20px 0' },
  buttonGenerate: { backgroundColor: '#800020', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  buttonExport: { backgroundColor: '#28a745', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  buttonWhatsapp: { backgroundColor: '#25D366', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  cardContainer: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' },
  card: { padding: '8px', borderRadius: '10px', textAlign: 'center', color: 'white' },
  cardBlue: { backgroundColor: '#2196F3' },
  cardLightGreen: { backgroundColor: '#8BC34A' },
  cardLightOrange: { backgroundColor: '#FFB74D' },
  cardLightTeal: { backgroundColor: '#4DB6AC' },
  cardValue: { fontSize: '14px', fontWeight: 'bold', marginTop: '4px' },
  tableContainer: { overflowX: 'auto', marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#5a3e2b', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  rateInfo: { backgroundColor: '#e8f4f8', padding: '8px', borderRadius: '6px', fontSize: '11px', textAlign: 'center', marginBottom: '12px', color: '#334155', border: '1px solid #cbd5e1' },
  warningBox: { backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '11px', fontWeight: '600' },
  detailsBox: { backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginTop: '15px', fontSize: '11px', color: '#334155' }
};

const formatNumber = (num: number | null | undefined, decimals = 2): string => {
  if (num === null || num === undefined || isNaN(num)) return "Rate Unavailable in Admin Master";
  return num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rate Unavailable in Admin Master";
  return `₹${formatNumber(amount, 2)}`;
};

const dias = [6, 8, 10, 12, 16, 20, 25, 32];
// IS 456 Unit Weight formula: W = d²/162 (kg/m)
const kgPerM = (dia: number) => (dia * dia) / 162;
const mmToM = (mm: number) => mm / 1000;
const ftToM = (ft: number) => ft * 0.3048;

// IS 456:2000 Clause 26.2.1 Development Length (Ld) Calculator
const calculateDevelopmentLength = (dia: number, concreteGrade: string, steelGrade: string) => {
  // Permissible bond stress tau_bd for plain bars in tension (N/mm²)
  const tauBdMap: Record<string, number> = { M15: 1.0, M20: 1.2, M25: 1.4, M30: 1.5, M35: 1.7, M40: 1.9 };
  const baseTauBd = tauBdMap[concreteGrade] || 1.2;
  // HYSD / TMT deformed bars bond stress increased by 60%
  const tauBdHysd = baseTauBd * 1.6;
  
  const fyMap: Record<string, number> = { Fe415: 415, Fe500: 500, Fe550: 550 };
  const fy = fyMap[steelGrade] || 500;
  const sigmaS = 0.87 * fy;

  // Ld = (phi * sigma_s) / (4 * tau_bd)
  const ldMm = (dia * sigmaS) / (4 * tauBdHysd);
  const ldFactor = ldMm / dia; // e.g. ~48d to 57d
  return { ldMm, ldFactor: Math.round(ldFactor * 10) / 10, ldM: ldMm / 1000 };
};

export default function SteelCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();
  const { rates: contextRates, loading } = useRates();

  // Primary Member Type Dropdown (Slab, Beam, Lintel, Footing, Column, RCC Wall)
  const [item, setItem] = useState("Slab");

  // Common Specifications Inputs
  const [concreteGrade, setConcreteGrade] = useState("M20");
  const [steelGrade, setSteelGrade] = useState("Fe500");
  const [exposureCondition, setExposureCondition] = useState("Moderate");
  const [unitSystem, setUnitSystem] = useState("feet"); // 'feet' or 'meters'
  const [stockBarLengthM, setStockBarLengthM] = useState(12); // Standard 12m stock commercial bar
  const [wastage, setWastage] = useState(3);
  const [bindingWirePercent, setBindingWirePercent] = useState(1);
  const [lapSetting, setLapSetting] = useState("Auto"); // Auto, Yes, No
  const [matType, setMatType] = useState("Single Mat"); // Single Mat / Double Mat

  // Member Dimension & Detailing Inputs
  const [memberNos, setMemberNos] = useState(1);
  const [length, setLength] = useState(30); // length (ft or m)
  const [width, setWidth] = useState(20);   // width (ft or m)
  const [depth, setDepth] = useState(150);  // thickness/depth (mm)
  const [coverMm, setCoverMm] = useState(20); // clear cover in mm

  // Slab specific
  const [slabType, setSlabType] = useState("One-way Slab"); // One-way, Two-way, Cantilever
  const [xDia, setXDia] = useState(10);
  const [yDia, setYDia] = useState(8);
  const [xSpacingMm, setXSpacingMm] = useState(150);
  const [ySpacingMm, setYSpacingMm] = useState(175);
  const [hasCranks, setHasCranks] = useState(true);
  const [crankAngle, setCrankAngle] = useState(45); // 30, 45, 60
  const [crankPct, setCrankPct] = useState(50); // 50% alternate bars cranked

  // Beam / Lintel specific
  const [topDia, setTopDia] = useState(12);
  const [topBarsCount, setTopBarsCount] = useState(2);
  const [bottomDia, setBottomDia] = useState(16);
  const [bottomBarsCount, setBottomBarsCount] = useState(3);
  const [extraTopDia, setExtraTopDia] = useState(12);
  const [extraTopBarsCount, setExtraTopBarsCount] = useState(2);
  const [stirrupDia, setStirrupDia] = useState(8);
  const [stirrupSpacingEndMm, setStirrupSpacingEndMm] = useState(100);
  const [stirrupSpacingMidMm, setStirrupSpacingMidMm] = useState(150);
  const [stirrupLegs, setStirrupLegs] = useState(2);
  const [lintelBearingMm, setLintelBearingMm] = useState(230);

  // Column specific
  const [cornerDia, setCornerDia] = useState(16);
  const [cornerBarsCount, setCornerBarsCount] = useState(4);
  const [middleDia, setMiddleDia] = useState(12);
  const [middleBarsCount, setMiddleBarsCount] = useState(4);
  const [tieDia, setTieDia] = useState(8);
  const [tieSpacingConfinedMm, setTieSpacingConfinedMm] = useState(100);
  const [tieSpacingMidMm, setTieSpacingMidMm] = useState(150);

  // Footing specific
  const [footingType, setFootingType] = useState("Isolated Footing");
  const [columnWidthMm, setColumnWidthMm] = useState(300);
  const [columnDepthMm, setColumnDepthMm] = useState(450);
  const [dowelDia, setDowelDia] = useState(16);
  const [dowelCount, setDowelCount] = useState(6);

  // RCC Wall specific
  const [wallFace, setWallFace] = useState("Double Face");
  const [vertDia, setVertDia] = useState(10);
  const [vertSpacingMm, setVertSpacingMm] = useState(150);
  const [horizDia, setHorizDia] = useState(8);
  const [horizSpacingMm, setHorizSpacingMm] = useState(175);

  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  // Dynamic Admin Master Rates Integration
  const steelRateRes = getMasterRate(["tmt steel", "tmt bar", "steel", "rebar", "reinforcement steel", "tmt"], 0, ["bm_material_rates"]);
  const bindingWireRateRes = getMasterRate(["binding wire", "gi binding wire", "wire"], 0, ["bm_material_rates"]);
  const coverBlockRateRes = getMasterRate(["cover block", "concrete cover block", "cover blocks"], 0, ["bm_material_rates"]);
  const barBendingLabourRes = getMasterRate(["bar bending", "steel binding", "rebar labour", "bar bending labour", "steel fixing"], 0, ["bm_labour_rates", "bm_service_rates"]);

  const getNormalizedRatePerKg = (res: any) => {
    if (!res.found || res.rate <= 0) return null;
    return res.rate > 500 ? res.rate / 1000 : res.rate;
  };

  const steelRatePerKg = getNormalizedRatePerKg(steelRateRes);
  const bindingWireRatePerKg = getNormalizedRatePerKg(bindingWireRateRes);
  const coverBlockRatePerPc = coverBlockRateRes.found && coverBlockRateRes.rate > 0 ? coverBlockRateRes.rate : null;
  const barBendingLabourRatePerKg = getNormalizedRatePerKg(barBendingLabourRes);

  // Validation Warnings Check
  const getValidationWarnings = () => {
    const warnings: string[] = [];
    const minCoverMap: Record<string, number> = { Slab: 15, Beam: 25, Column: 40, Footing: 50, Lintel: 20, "RCC Wall": 20 };
    const reqMinCover = minCoverMap[item] || 20;
    if (coverMm < reqMinCover) {
      warnings.push(`⚠️ Cover Warning: ${coverMm}mm is below IS 456 Table 16 minimum specified clear cover of ${reqMinCover}mm for ${item} under ${exposureCondition} exposure.`);
    }
    if (item === "Slab" && xSpacingMm > 300) {
      warnings.push(`⚠️ Spacing Warning: ${xSpacingMm}mm exceeds IS 456 Cl. 26.5.2.2 maximum main bar spacing limit of 300mm (3d).`);
    }
    if (item === "Column") {
      warnings.push(`ℹ️ IS 456 Detailing Directive: Ensure not more than 50% of column main bars are lapped at the same section.`);
    }
    return warnings;
  };

  const calculateResults = () => {
    const warnings = getValidationWarnings();

    // Unit Conversion to Meters
    const lengthM = unitSystem === "feet" ? ftToM(length) : length;
    const widthM = unitSystem === "feet" ? ftToM(width) : width;
    const depthM = mmToM(depth);
    const coverM = mmToM(coverMm);

    // Development Lengths
    const devX = calculateDevelopmentLength(xDia, concreteGrade, steelGrade);
    const devY = calculateDevelopmentLength(yDia, concreteGrade, steelGrade);
    const devTop = calculateDevelopmentLength(topDia, concreteGrade, steelGrade);
    const devBottom = calculateDevelopmentLength(bottomDia, concreteGrade, steelGrade);
    const devCorner = calculateDevelopmentLength(cornerDia, concreteGrade, steelGrade);
    const devDowel = calculateDevelopmentLength(dowelDia, concreteGrade, steelGrade);

    // Dynamic BBS Item Rows
    let bbsRows: Array<{
      barMark: string;
      description: string;
      dia: number;
      shape: string;
      barsPerMember: number;
      totalBars: number;
      cuttingLengthM: number;
      totalLengthM: number;
      unitWeightKgM: number;
      weightKg: number;
      lapsCount: number;
      remarks: string;
    }> = [];

    let coverBlocksCount = 0;
    let chairsCount = 0;
    let chairsWeightKg = 0;

    // MEMBER SPECIFIC BBS LOGIC
    if (item === "Slab") {
      const clearLengthM = Math.max(0, lengthM - 2 * coverM);
      const clearWidthM = Math.max(0, widthM - 2 * coverM);
      
      const xBarsCount = Math.floor((widthM * 1000) / xSpacingMm) + 1;
      const yBarsCount = Math.floor((lengthM * 1000) / ySpacingMm) + 1;

      // Geometrical Crank Extra
      // D = Slab Thickness - 2*Cover - Main Bar Dia
      const crankEffectiveDM = Math.max(0, depthM - 2 * coverM - mmToM(xDia));
      let crankExtraPerBarM = 0;
      if (hasCranks) {
        if (crankAngle === 30) crankExtraPerBarM = 0.268 * crankEffectiveDM;
        else if (crankAngle === 60) crankExtraPerBarM = 0.578 * crankEffectiveDM;
        else crankExtraPerBarM = 0.414 * crankEffectiveDM; // 45° default
      }

      // Check commercial laps for long spans (> 12m)
      const lapCountX = lapSetting !== "No" && clearLengthM > stockBarLengthM ? Math.floor(clearLengthM / stockBarLengthM) : 0;
      const lapLengthX = lapCountX * devX.ldM;
      const xCuttingLengthM = clearLengthM + (hasCranks ? crankExtraPerBarM * (crankPct / 100) * 2 : 0) + lapLengthX + (2 * devX.ldM * 0.25); // hook/bend

      const lapCountY = lapSetting !== "No" && clearWidthM > stockBarLengthM ? Math.floor(clearWidthM / stockBarLengthM) : 0;
      const lapLengthY = lapCountY * devY.ldM;
      const yCuttingLengthM = clearWidthM + lapLengthY + (2 * devY.ldM * 0.25);

      const totalXLengthM = xCuttingLengthM * xBarsCount * memberNos;
      const totalXWeightKg = totalXLengthM * kgPerM(xDia);

      const totalYLengthM = yCuttingLengthM * yBarsCount * memberNos;
      const totalYWeightKg = totalYLengthM * kgPerM(yDia);

      bbsRows.push({
        barMark: "01",
        description: `Bottom Main (X) Bars (${slabType})`,
        dia: xDia,
        shape: hasCranks ? "Straight + Cranked (45°)" : "Straight",
        barsPerMember: xBarsCount,
        totalBars: xBarsCount * memberNos,
        cuttingLengthM: xCuttingLengthM,
        totalLengthM: totalXLengthM,
        unitWeightKgM: kgPerM(xDia),
        weightKg: totalXWeightKg,
        lapsCount: lapCountX * xBarsCount * memberNos,
        remarks: `Ld = ${devX.ldFactor}d (${devX.ldMm.toFixed(0)}mm)`
      });

      bbsRows.push({
        barMark: "02",
        description: "Bottom Distribution (Y) Bars",
        dia: yDia,
        shape: "Straight",
        barsPerMember: yBarsCount,
        totalBars: yBarsCount * memberNos,
        cuttingLengthM: yCuttingLengthM,
        totalLengthM: totalYLengthM,
        unitWeightKgM: kgPerM(yDia),
        weightKg: totalYWeightKg,
        lapsCount: lapCountY * yBarsCount * memberNos,
        remarks: `Spacing = ${ySpacingMm}mm c/c`
      });

      // Double Mat Top Reinforcement & Chairs
      if (matType === "Double Mat") {
        const topXBarsCount = xBarsCount;
        const topYBarsCount = yBarsCount;
        const totalTopXLengthM = xCuttingLengthM * topXBarsCount * memberNos;
        const totalTopXWeightKg = totalTopXLengthM * kgPerM(xDia);

        bbsRows.push({
          barMark: "03",
          description: "Top Mat Reinforcement (X & Y)",
          dia: xDia,
          shape: "Straight Grid",
          barsPerMember: topXBarsCount + topYBarsCount,
          totalBars: (topXBarsCount + topYBarsCount) * memberNos,
          cuttingLengthM: xCuttingLengthM,
          totalLengthM: totalTopXLengthM * 2,
          unitWeightKgM: kgPerM(xDia),
          weightKg: totalTopXWeightKg * 2,
          lapsCount: 0,
          remarks: "Double Mat Top Layer"
        });

        // Chairs ONLY for Double Mat (1 per sq.m)
        chairsCount = Math.ceil(lengthM * widthM * memberNos);
        const chairDia = 10;
        const chairHeightM = Math.max(0.08, depthM - 2 * coverM - 2 * mmToM(xDia) - 2 * mmToM(yDia));
        const chairCuttingLengthM = 2 * chairHeightM + 0.3; // height + feet
        const totalChairLengthM = chairCuttingLengthM * chairsCount;
        chairsWeightKg = totalChairLengthM * kgPerM(chairDia);

        bbsRows.push({
          barMark: "CHAIR",
          description: "Chairs for Double Mat Support",
          dia: chairDia,
          shape: "Chair Shape (Omega)",
          barsPerMember: Math.ceil(lengthM * widthM),
          totalBars: chairsCount,
          cuttingLengthM: chairCuttingLengthM,
          totalLengthM: totalChairLengthM,
          unitWeightKgM: kgPerM(chairDia),
          weightKg: chairsWeightKg,
          lapsCount: 0,
          remarks: `Height = ${(chairHeightM * 1000).toFixed(0)}mm (1 per sq.m)`
        });
      }

      coverBlocksCount = Math.ceil(lengthM * widthM * memberNos * 2);

    } else if (item === "Beam") {
      const clearSpanM = Math.max(0, lengthM - 2 * coverM);
      const beamWidthM = mmToM(width);
      const beamDepthM = mmToM(depth);

      // Bottom Main Longitudinal Bars
      const lapCount = lapSetting !== "No" && clearSpanM > stockBarLengthM ? Math.floor(clearSpanM / stockBarLengthM) : 0;
      const bottomCuttingM = clearSpanM + 2 * devBottom.ldM + lapCount * devBottom.ldM;
      const totalBottomLenM = bottomCuttingM * bottomBarsCount * memberNos;
      const totalBottomWeightKg = totalBottomLenM * kgPerM(bottomDia);

      bbsRows.push({
        barMark: "01",
        description: "Bottom Main Longitudinal Bars",
        dia: bottomDia,
        shape: "Straight with L-bends",
        barsPerMember: bottomBarsCount,
        totalBars: bottomBarsCount * memberNos,
        cuttingLengthM: bottomCuttingM,
        totalLengthM: totalBottomLenM,
        unitWeightKgM: kgPerM(bottomDia),
        weightKg: totalBottomWeightKg,
        lapsCount: lapCount * bottomBarsCount * memberNos,
        remarks: `Anchorage Ld = ${devBottom.ldFactor}d (${devBottom.ldMm.toFixed(0)}mm)`
      });

      // Top Hanger Bars
      const topCuttingM = clearSpanM + 2 * devTop.ldM;
      const totalTopLenM = topCuttingM * topBarsCount * memberNos;
      const totalTopWeightKg = totalTopLenM * kgPerM(topDia);

      bbsRows.push({
        barMark: "02",
        description: "Top Hanger Bars",
        dia: topDia,
        shape: "Straight with L-bends",
        barsPerMember: topBarsCount,
        totalBars: topBarsCount * memberNos,
        cuttingLengthM: topCuttingM,
        totalLengthM: totalTopLenM,
        unitWeightKgM: kgPerM(topDia),
        weightKg: totalTopWeightKg,
        lapsCount: 0,
        remarks: "Top Hanger Reinforcement"
      });

      // Extra Top Support Bars
      if (extraTopBarsCount > 0) {
        const extraTopLenM = (clearSpanM / 3) + devTop.ldM;
        const totalExtraTopLenM = extraTopLenM * extraTopBarsCount * 2 * memberNos; // Both ends
        const totalExtraTopWeightKg = totalExtraTopLenM * kgPerM(extraTopDia);

        bbsRows.push({
          barMark: "03",
          description: "Extra Top Bars over Supports (Both Ends)",
          dia: extraTopDia,
          shape: "Straight with End Hook",
          barsPerMember: extraTopBarsCount * 2,
          totalBars: extraTopBarsCount * 2 * memberNos,
          cuttingLengthM: extraTopLenM,
          totalLengthM: totalExtraTopLenM,
          unitWeightKgM: kgPerM(extraTopDia),
          weightKg: totalExtraTopWeightKg,
          lapsCount: 0,
          remarks: "Span/3 Extent over Support"
        });
      }

      // Shear Stirrups (End Zone & Mid Zone)
      const endZoneLenM = clearSpanM / 4;
      const midZoneLenM = clearSpanM - 2 * endZoneLenM;
      const endStirrupCount = (Math.floor((endZoneLenM * 1000) / stirrupSpacingEndMm) + 1) * 2; // both ends
      const midStirrupCount = Math.floor((midZoneLenM * 1000) / stirrupSpacingMidMm);
      const totalStirrupCountPerBeam = endStirrupCount + midStirrupCount;

      // IS 456 135° Hook allowance = 24d
      const stirrupHookM = (24 * stirrupDia) / 1000;
      const stirrupPerimeterM = 2 * ((beamWidthM - 2 * coverM) + (beamDepthM - 2 * coverM));
      const stirrupCuttingM = stirrupPerimeterM + stirrupHookM;
      const totalStirrupLenM = stirrupCuttingM * totalStirrupCountPerBeam * memberNos * (stirrupLegs / 2);
      const totalStirrupWeightKg = totalStirrupLenM * kgPerM(stirrupDia);

      bbsRows.push({
        barMark: "04",
        description: `Shear Stirrups (${stirrupLegs}-Legged)`,
        dia: stirrupDia,
        shape: "Rectangular Closed Ring (135° Seismic Hook)",
        barsPerMember: totalStirrupCountPerBeam * (stirrupLegs / 2),
        totalBars: totalStirrupCountPerBeam * memberNos * (stirrupLegs / 2),
        cuttingLengthM: stirrupCuttingM,
        totalLengthM: totalStirrupLenM,
        unitWeightKgM: kgPerM(stirrupDia),
        weightKg: totalStirrupWeightKg,
        lapsCount: 0,
        remarks: `End: ${stirrupSpacingEndMm}mm, Mid: ${stirrupSpacingMidMm}mm`
      });

      coverBlocksCount = Math.ceil(lengthM * memberNos * 3);

    } else if (item === "Lintel") {
      const clearSpanM = lengthM;
      const bearingM = mmToM(lintelBearingMm);
      const totalLintelLenM = clearSpanM + 2 * bearingM;
      const lintelWidthM = mmToM(width);
      const lintelDepthM = mmToM(depth);

      // Bottom Main Bars
      const bottomCuttingM = totalLintelLenM + 2 * devBottom.ldM * 0.25;
      const totalBottomLenM = bottomCuttingM * bottomBarsCount * memberNos;
      const totalBottomWeightKg = totalBottomLenM * kgPerM(bottomDia);

      bbsRows.push({
        barMark: "01",
        description: "Lintel Bottom Main Bars",
        dia: bottomDia,
        shape: "Straight with L-bends",
        barsPerMember: bottomBarsCount,
        totalBars: bottomBarsCount * memberNos,
        cuttingLengthM: bottomCuttingM,
        totalLengthM: totalBottomLenM,
        unitWeightKgM: kgPerM(bottomDia),
        weightKg: totalBottomWeightKg,
        lapsCount: 0,
        remarks: `Bearing = ${lintelBearingMm}mm each side`
      });

      // Top Hanger Bars
      const topCuttingM = totalLintelLenM;
      const totalTopLenM = topCuttingM * topBarsCount * memberNos;
      const totalTopWeightKg = totalTopLenM * kgPerM(topDia);

      bbsRows.push({
        barMark: "02",
        description: "Lintel Top Hanger Bars",
        dia: topDia,
        shape: "Straight",
        barsPerMember: topBarsCount,
        totalBars: topBarsCount * memberNos,
        cuttingLengthM: topCuttingM,
        totalLengthM: totalTopLenM,
        unitWeightKgM: kgPerM(topDia),
        weightKg: totalTopWeightKg,
        lapsCount: 0,
        remarks: "Top Hangers"
      });

      // Lintel Stirrups
      const stirrupCount = Math.floor((totalLintelLenM * 1000) / stirrupSpacingMidMm) + 1;
      const stirrupHookM = (24 * stirrupDia) / 1000;
      const stirrupCuttingM = 2 * ((lintelWidthM - 2 * coverM) + (lintelDepthM - 2 * coverM)) + stirrupHookM;
      const totalStirrupLenM = stirrupCuttingM * stirrupCount * memberNos;
      const totalStirrupWeightKg = totalStirrupLenM * kgPerM(stirrupDia);

      bbsRows.push({
        barMark: "03",
        description: "Lintel Ring Stirrups",
        dia: stirrupDia,
        shape: "Closed Ring",
        barsPerMember: stirrupCount,
        totalBars: stirrupCount * memberNos,
        cuttingLengthM: stirrupCuttingM,
        totalLengthM: totalStirrupLenM,
        unitWeightKgM: kgPerM(stirrupDia),
        weightKg: totalStirrupWeightKg,
        lapsCount: 0,
        remarks: `Spacing = ${stirrupSpacingMidMm}mm c/c`
      });

      coverBlocksCount = Math.ceil(totalLintelLenM * memberNos * 2);

    } else if (item === "Column") {
      const colHeightM = lengthM;
      const colWidthM = mmToM(width);
      const colDepthM = mmToM(depth);

      // Main Vertical Corner & Intermediate Bars
      const lapCount = lapSetting !== "No" && colHeightM > stockBarLengthM ? Math.floor(colHeightM / stockBarLengthM) : 0;
      const mainBarCuttingM = colHeightM + devCorner.ldM + (lapCount + 1) * devCorner.ldM; // Height + Dowel Lap + Beam Anchorage
      
      const totalCornerLenM = mainBarCuttingM * cornerBarsCount * memberNos;
      const totalCornerWeightKg = totalCornerLenM * kgPerM(cornerDia);

      bbsRows.push({
        barMark: "01",
        description: "Column Main Corner Vertical Rods",
        dia: cornerDia,
        shape: "Straight with L-bend Anchorage",
        barsPerMember: cornerBarsCount,
        totalBars: cornerBarsCount * memberNos,
        cuttingLengthM: mainBarCuttingM,
        totalLengthM: totalCornerLenM,
        unitWeightKgM: kgPerM(cornerDia),
        weightKg: totalCornerWeightKg,
        lapsCount: (lapCount + 1) * cornerBarsCount * memberNos,
        remarks: `Dowel Lap Ld = ${devCorner.ldFactor}d (${devCorner.ldMm.toFixed(0)}mm)`
      });

      if (middleBarsCount > 0) {
        const totalMiddleLenM = mainBarCuttingM * middleBarsCount * memberNos;
        const totalMiddleWeightKg = totalMiddleLenM * kgPerM(middleDia);

        bbsRows.push({
          barMark: "02",
          description: "Column Intermediate Vertical Rods",
          dia: middleDia,
          shape: "Straight with L-bend Anchorage",
          barsPerMember: middleBarsCount,
          totalBars: middleBarsCount * memberNos,
          cuttingLengthM: mainBarCuttingM,
          totalLengthM: totalMiddleLenM,
          unitWeightKgM: kgPerM(middleDia),
          weightKg: totalMiddleWeightKg,
          lapsCount: (lapCount + 1) * middleBarsCount * memberNos,
          remarks: `Interm Rebar (${middleDia}mm)`
        });
      }

      // Column Ties (Confined End Zones & Mid Zone)
      const confinedZoneLenM = Math.max(0.45, colHeightM / 6);
      const midZoneLenM = colHeightM - 2 * confinedZoneLenM;

      const confinedTiesCount = (Math.floor((confinedZoneLenM * 1000) / tieSpacingConfinedMm) + 1) * 2;
      const midTiesCount = Math.floor((midZoneLenM * 1000) / tieSpacingMidMm);
      const totalTiesPerCol = confinedTiesCount + midTiesCount;

      const tieHookM = (24 * tieDia) / 1000;
      const tieCuttingM = 2 * ((colWidthM - 2 * coverM) + (colDepthM - 2 * coverM)) + tieHookM;
      const totalTieLenM = tieCuttingM * totalTiesPerCol * memberNos;
      const totalTieWeightKg = totalTieLenM * kgPerM(tieDia);

      bbsRows.push({
        barMark: "03",
        description: "Column Lateral Ties / Outer Rings",
        dia: tieDia,
        shape: "Rectangular Ring (135° Seismic Hook)",
        barsPerMember: totalTiesPerCol,
        totalBars: totalTiesPerCol * memberNos,
        cuttingLengthM: tieCuttingM,
        totalLengthM: totalTieLenM,
        unitWeightKgM: kgPerM(tieDia),
        weightKg: totalTieWeightKg,
        lapsCount: 0,
        remarks: `Confined: ${tieSpacingConfinedMm}mm, Mid: ${tieSpacingMidMm}mm`
      });

      coverBlocksCount = Math.ceil(colHeightM * memberNos * 4);

    } else if (item === "Footing") {
      const clearLengthM = Math.max(0, lengthM - 2 * coverM);
      const clearWidthM = Math.max(0, widthM - 2 * coverM);

      const xBarsCount = Math.floor((widthM * 1000) / xSpacingMm) + 1;
      const yBarsCount = Math.floor((lengthM * 1000) / ySpacingMm) + 1;

      // 90° Bend up allowance = 2 * 9d
      const xCuttingLengthM = clearLengthM + (2 * 9 * xDia) / 1000;
      const yCuttingLengthM = clearWidthM + (2 * 9 * yDia) / 1000;

      const totalXLengthM = xCuttingLengthM * xBarsCount * memberNos;
      const totalXWeightKg = totalXLengthM * kgPerM(xDia);

      const totalYLengthM = yCuttingLengthM * yBarsCount * memberNos;
      const totalYWeightKg = totalYLengthM * kgPerM(yDia);

      bbsRows.push({
        barMark: "01",
        description: "Footing Bottom Mesh X-Direction",
        dia: xDia,
        shape: "Mesh Bar with End L-Bends",
        barsPerMember: xBarsCount,
        totalBars: xBarsCount * memberNos,
        cuttingLengthM: xCuttingLengthM,
        totalLengthM: totalXLengthM,
        unitWeightKgM: kgPerM(xDia),
        weightKg: totalXWeightKg,
        lapsCount: 0,
        remarks: `90° L-bend = 9d (${(9 * xDia)}mm)`
      });

      bbsRows.push({
        barMark: "02",
        description: "Footing Bottom Mesh Y-Direction",
        dia: yDia,
        shape: "Mesh Bar with End L-Bends",
        barsPerMember: yBarsCount,
        totalBars: yBarsCount * memberNos,
        cuttingLengthM: yCuttingLengthM,
        totalLengthM: totalYLengthM,
        unitWeightKgM: kgPerM(yDia),
        weightKg: totalYWeightKg,
        lapsCount: 0,
        remarks: `90° L-bend = 9d (${(9 * yDia)}mm)`
      });

      // Dowel / Starter Bars into Footing
      if (dowelCount > 0) {
        const dowelCuttingM = devDowel.ldM + 0.3; // Footing Ld + 300mm starter projection
        const totalDowelLenM = dowelCuttingM * dowelCount * memberNos;
        const totalDowelWeightKg = totalDowelLenM * kgPerM(dowelDia);

        bbsRows.push({
          barMark: "03",
          description: "Column Starter / Dowel Bars in Footing",
          dia: dowelDia,
          shape: "L-Bend Starter Rebar",
          barsPerMember: dowelCount,
          totalBars: dowelCount * memberNos,
          cuttingLengthM: dowelCuttingM,
          totalLengthM: totalDowelLenM,
          unitWeightKgM: kgPerM(dowelDia),
          weightKg: totalDowelWeightKg,
          lapsCount: 0,
          remarks: `Anchorage Ld in Footing = ${devDowel.ldMm.toFixed(0)}mm`
        });
      }

      // Chairs for Double Mat Footing
      if (matType === "Double Mat") {
        chairsCount = Math.ceil(lengthM * widthM * memberNos);
        const chairDia = 12;
        const chairHeightM = Math.max(0.1, depthM - 2 * coverM - 2 * mmToM(xDia) - 2 * mmToM(yDia));
        const chairCuttingM = 2 * chairHeightM + 0.4;
        const totalChairLenM = chairCuttingM * chairsCount;
        chairsWeightKg = totalChairLenM * kgPerM(chairDia);

        bbsRows.push({
          barMark: "CHAIR",
          description: "Chairs for Footing Double Mat",
          dia: chairDia,
          shape: "Heavy Support Chair",
          barsPerMember: Math.ceil(lengthM * widthM),
          totalBars: chairsCount,
          cuttingLengthM: chairCuttingM,
          totalLengthM: totalChairLenM,
          unitWeightKgM: kgPerM(chairDia),
          weightKg: chairsWeightKg,
          lapsCount: 0,
          remarks: `Footing Double Mat Chair`
        });
      }

      coverBlocksCount = Math.ceil(lengthM * widthM * memberNos * 2);

    } else {
      // RCC WALL
      const wallLenM = lengthM;
      const wallHeightM = widthM; // height passed in widthM field

      const facesMultiplier = wallFace === "Double Face" ? 2 : 1;
      const vertBarsCount = (Math.floor((wallLenM * 1000) / vertSpacingMm) + 1) * facesMultiplier;
      const horizBarsCount = (Math.floor((wallHeightM * 1000) / horizSpacingMm) + 1) * facesMultiplier;

      const vertCuttingM = wallHeightM + devX.ldM * 0.5;
      const horizCuttingM = wallLenM + devY.ldM * 0.5;

      const totalVertLenM = vertCuttingM * vertBarsCount * memberNos;
      const totalVertWeightKg = totalVertLenM * kgPerM(vertDia);

      const totalHorizLenM = horizCuttingM * horizBarsCount * memberNos;
      const totalHorizWeightKg = totalHorizLenM * kgPerM(horizDia);

      bbsRows.push({
        barMark: "01",
        description: `RCC Wall Vertical Bars (${wallFace})`,
        dia: vertDia,
        shape: "Straight Rebar",
        barsPerMember: vertBarsCount,
        totalBars: vertBarsCount * memberNos,
        cuttingLengthM: vertCuttingM,
        totalLengthM: totalVertLenM,
        unitWeightKgM: kgPerM(vertDia),
        weightKg: totalVertWeightKg,
        lapsCount: 0,
        remarks: `Spacing = ${vertSpacingMm}mm c/c`
      });

      bbsRows.push({
        barMark: "02",
        description: `RCC Wall Horizontal Bars (${wallFace})`,
        dia: horizDia,
        shape: "Straight Rebar",
        barsPerMember: horizBarsCount,
        totalBars: horizBarsCount * memberNos,
        cuttingLengthM: horizCuttingM,
        totalLengthM: totalHorizLenM,
        unitWeightKgM: kgPerM(horizDia),
        weightKg: totalHorizWeightKg,
        lapsCount: 0,
        remarks: `Spacing = ${horizSpacingMm}mm c/c`
      });

      coverBlocksCount = Math.ceil(wallLenM * wallHeightM * memberNos * 2);
    }

    // BASE STEEL WEIGHT & WASTAGE CALCULATIONS
    const baseKg = bbsRows.reduce((s, r) => s + r.weightKg, 0);
    const wastageKg = baseKg * (Number(wastage || 0) / 100);
    const totalSteelKg = baseKg + wastageKg;
    const totalSteelMT = totalSteelKg / 1000;
    const bindingWireKg = totalSteelKg * (Number(bindingWirePercent || 1) / 100);

    // Group Summary by Diameters (6, 8, 10, 12, 16, 20, 25, 32 mm)
    const diaSummaryMap: Record<number, { kg: number; mt: number; lengthM: number; stockBarsReq: number }> = {};
    dias.forEach(d => { diaSummaryMap[d] = { kg: 0, mt: 0, lengthM: 0, stockBarsReq: 0 }; });

    bbsRows.forEach(r => {
      if (!diaSummaryMap[r.dia]) diaSummaryMap[r.dia] = { kg: 0, mt: 0, lengthM: 0, stockBarsReq: 0 };
      diaSummaryMap[r.dia].kg += r.weightKg;
      diaSummaryMap[r.dia].lengthM += r.totalLengthM;
    });

    Object.keys(diaSummaryMap).forEach(dKey => {
      const d = Number(dKey);
      diaSummaryMap[d].mt = diaSummaryMap[d].kg / 1000;
      diaSummaryMap[d].stockBarsReq = Math.ceil(diaSummaryMap[d].lengthM / stockBarLengthM);
    });

    // Costs using Admin Master Rates
    const steelCost = steelRatePerKg !== null ? totalSteelKg * steelRatePerKg : null;
    const bindingWireCost = bindingWireRatePerKg !== null ? bindingWireKg * bindingWireRatePerKg : null;
    const coverBlockCost = coverBlockRatePerPc !== null ? coverBlocksCount * coverBlockRatePerPc : null;

    let materialTotal: number | null = 0;
    if (steelCost !== null && bindingWireCost !== null) {
      materialTotal = steelCost + bindingWireCost + (coverBlockCost || 0);
    } else {
      materialTotal = null;
    }

    const labourCost = barBendingLabourRatePerKg !== null ? totalSteelKg * barBendingLabourRatePerKg : null;

    let grandTotal: number | null = 0;
    if (materialTotal !== null && labourCost !== null) {
      grandTotal = materialTotal + labourCost;
    } else {
      grandTotal = null;
    }

    return {
      item,
      concreteGrade,
      steelGrade,
      exposureCondition,
      warnings,
      baseKg,
      wastageKg,
      totalSteelKg,
      totalSteelMT,
      bindingWireKg,
      coverBlocksCount,
      chairsCount,
      chairsWeightKg,
      bbsRows,
      diaSummaryMap,
      rates: {
        steel: steelRateRes,
        bindingWire: bindingWireRateRes,
        coverBlock: coverBlockRateRes,
        barBendingLabour: barBendingLabourRes,
        steelRatePerKg,
        bindingWireRatePerKg,
        coverBlockRatePerPc,
        barBendingLabourRatePerKg
      },
      costs: {
        steel: steelCost,
        bindingWire: bindingWireCost,
        coverBlock: coverBlockCost,
        materialTotal,
        labour: labourCost,
        grandTotal
      }
    };
  };

  const handleGenerate = () => {
    setResults(calculateResults());
    setGenerated(true);
  };

  const handleBack = () => {
    router.push('/calculators');
  };

  const handleExportExcel = () => {
    if (!results) return;
    const data = [
      { Item: 'Structural Member', Quantity: results.item, Unit: '-', Rate: '-', Cost: '-' },
      ...results.bbsRows.map((r: any) => ({
        Item: `[Mark ${r.barMark}] ${r.description}`, Quantity: `${formatNumber(r.weightKg)} kg (${r.totalBars} bars)`, Unit: 'KG', Rate: '-', Cost: '-'
      })),
      { Item: `Base TMT Steel Weight`, Quantity: formatNumber(results.baseKg), Unit: 'KG', Rate: '-', Cost: '-' },
      { Item: `Wastage Allowance (${wastage}%)`, Quantity: formatNumber(results.wastageKg), Unit: 'KG', Rate: '-', Cost: '-' },
      { Item: `Total TMT Rebar Steel`, Quantity: `${formatNumber(results.totalSteelKg)} kg (${formatNumber(results.totalSteelMT, 3)} MT)`, Unit: 'KG', Rate: formatCurrency(results.rates.steelRatePerKg), Cost: formatCurrency(results.costs.steel) },
      { Item: `GI Binding Wire (${bindingWirePercent}%)`, Quantity: formatNumber(results.bindingWireKg), Unit: 'KG', Rate: formatCurrency(results.rates.bindingWireRatePerKg), Cost: formatCurrency(results.costs.bindingWire) },
      { Item: `Concrete Cover Blocks`, Quantity: formatNumber(results.coverBlocksCount, 0), Unit: 'Nos', Rate: formatCurrency(results.rates.coverBlockRatePerPc), Cost: formatCurrency(results.costs.coverBlock) },
      { Item: 'Material Subtotal', Quantity: '', Unit: '', Rate: '', Cost: formatCurrency(results.costs.materialTotal) },
      { Item: 'Labour — Bar Bending, Cutting & Fixing', Quantity: formatNumber(results.totalSteelKg), Unit: 'KG', Rate: formatCurrency(results.rates.barBendingLabourRatePerKg), Cost: formatCurrency(results.costs.labour) },
      { Item: 'Labour Subtotal', Quantity: '', Unit: '', Rate: '', Cost: formatCurrency(results.costs.labour) },
      { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Rate: '', Cost: formatCurrency(results.costs.grandTotal) }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BBS_Steel_Calculator');
    XLSX.writeFile(wb, `RCC_BBS_Steel_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🔩 BUILDMITRA RCC STEEL BBS ESTIMATE\n\nMember: ${results.item}\nGrade: ${concreteGrade} / ${steelGrade}\nTotal TMT Steel: ${formatNumber(results.totalSteelKg)} kg (${formatNumber(results.totalSteelMT, 3)} MT)\nBinding Wire: ${formatNumber(results.bindingWireKg)} kg\nGrand Total: ${formatCurrency(results.costs.grandTotal)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading Admin Master Rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🔩 RCC Steel Calculator & BBS Estimator (IS 456:2000 & SP 34:1987)')
    ),

    React.createElement(MarketRateTrend, null),

    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Admin Master Rates: TMT Steel ${steelRatePerKg ? `₹${formatNumber(steelRatePerKg)}/kg` : 'Rate Unavailable in Admin Master'} | Binding Wire ${bindingWireRatePerKg ? `₹${formatNumber(bindingWireRatePerKg)}/kg` : 'Rate Unavailable in Admin Master'}`),
      React.createElement('div', null, React.createElement('small', null, `👷 Labour: Bar Bending & Fixing ${barBendingLabourRatePerKg ? `₹${formatNumber(barBendingLabourRatePerKg)}/kg` : 'Rate Unavailable in Admin Master'}`))
    ),

    React.createElement('div', { style: styles.sectionTitle }, '📋 Common Specifications & Detailing Configuration'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'RCC Item'),
        React.createElement('select', { value: item, onChange: (e) => setItem(e.target.value), style: styles.select },
          ["Slab", "Beam", "Column", "Lintel", "Footing", "RCC Wall"].map(x => React.createElement('option', { key: x, value: x }, x))
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Concrete Grade'),
        React.createElement('select', { value: concreteGrade, onChange: (e) => setConcreteGrade(e.target.value), style: styles.select },
          ["M15", "M20", "M25", "M30", "M35", "M40"].map(x => React.createElement('option', { key: x, value: x }, x))
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Steel Grade'),
        React.createElement('select', { value: steelGrade, onChange: (e) => setSteelGrade(e.target.value), style: styles.select },
          ["Fe415", "Fe500", "Fe550"].map(x => React.createElement('option', { key: x, value: x }, x))
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Exposure Condition'),
        React.createElement('select', { value: exposureCondition, onChange: (e) => setExposureCondition(e.target.value), style: styles.select },
          ["Mild", "Moderate", "Severe", "Very Severe", "Extreme"].map(x => React.createElement('option', { key: x, value: x }, x))
        )
      ),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Commercial Bar Length (m)'), React.createElement('input', { type: 'number', value: stockBarLengthM, onChange: (e) => setStockBarLengthM(parseFloat(e.target.value) || 12), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Wastage (%)'), React.createElement('input', { type: 'number', value: wastage, onChange: (e) => setWastage(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Binding Wire (%)'), React.createElement('input', { type: 'number', value: bindingWirePercent, onChange: (e) => setBindingWirePercent(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Commercial Laps'),
        React.createElement('select', { value: lapSetting, onChange: (e) => setLapSetting(e.target.value), style: styles.select },
          ["Auto", "Yes", "No"].map(x => React.createElement('option', { key: x, value: x }, x))
        )
      )
    ),

    React.createElement('div', { style: styles.sectionTitle }, `📐 ${item} Dimensions & Member Detailing`),
    
    item === "Slab" && React.createElement('div', { style: styles.row6 },
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Slab Type'),
        React.createElement('select', { value: slabType, onChange: (e) => setSlabType(e.target.value), style: styles.select },
          ["One-way Slab", "Two-way Slab", "Cantilever Slab", "Continuous Slab"].map(x => React.createElement('option', { key: x, value: x }, x))
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Reinforcement Mat'),
        React.createElement('select', { value: matType, onChange: (e) => setMatType(e.target.value), style: styles.select },
          ["Single Mat", "Double Mat"].map(x => React.createElement('option', { key: x, value: x }, x))
        )
      ),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, `Length (${unitSystem})`), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, `Width (${unitSystem})`), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Thickness (mm)'), React.createElement('input', { type: 'number', value: depth, onChange: (e) => setDepth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Clear Cover (mm)'), React.createElement('input', { type: 'number', value: coverMm, onChange: (e) => setCoverMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Main (X) Dia'), React.createElement('select', { value: xDia, onChange: (e) => setXDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Main (X) Spacing (mm)'), React.createElement('input', { type: 'number', value: xSpacingMm, onChange: (e) => setXSpacingMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Dist (Y) Dia'), React.createElement('select', { value: yDia, onChange: (e) => setYDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Dist (Y) Spacing (mm)'), React.createElement('input', { type: 'number', value: ySpacingMm, onChange: (e) => setYSpacingMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Bent-up Cranks'),
        React.createElement('select', { value: hasCranks ? "Yes" : "No", onChange: (e) => setHasCranks(e.target.value === "Yes"), style: styles.select },
          React.createElement('option', { value: 'Yes' }, 'Yes'), React.createElement('option', { value: 'No' }, 'No')
        )
      ),
      hasCranks && React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Crank Angle'),
        React.createElement('select', { value: crankAngle, onChange: (e) => setCrankAngle(Number(e.target.value)), style: styles.select },
          [30, 45, 60].map(a => React.createElement('option', { key: a, value: a }, `${a}°`))
        )
      )
    ),

    item === "Beam" && React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Beams'), React.createElement('input', { type: 'number', value: memberNos, onChange: (e) => setMemberNos(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, `Beam Length (${unitSystem})`), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (mm)'), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Depth (mm)'), React.createElement('input', { type: 'number', value: depth, onChange: (e) => setDepth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Clear Cover (mm)'), React.createElement('input', { type: 'number', value: coverMm, onChange: (e) => setCoverMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bottom Bar Dia'), React.createElement('select', { value: bottomDia, onChange: (e) => setBottomDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bottom Bar Count'), React.createElement('input', { type: 'number', value: bottomBarsCount, onChange: (e) => setBottomBarsCount(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Top Bar Dia'), React.createElement('select', { value: topDia, onChange: (e) => setTopDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Top Bar Count'), React.createElement('input', { type: 'number', value: topBarsCount, onChange: (e) => setTopBarsCount(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Extra Top Dia'), React.createElement('select', { value: extraTopDia, onChange: (e) => setExtraTopDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Extra Top Count'), React.createElement('input', { type: 'number', value: extraTopBarsCount, onChange: (e) => setExtraTopBarsCount(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Stirrup Dia'), React.createElement('select', { value: stirrupDia, onChange: (e) => setStirrupDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'End Stirrup Spacing (mm)'), React.createElement('input', { type: 'number', value: stirrupSpacingEndMm, onChange: (e) => setStirrupSpacingEndMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Mid Stirrup Spacing (mm)'), React.createElement('input', { type: 'number', value: stirrupSpacingMidMm, onChange: (e) => setStirrupSpacingMidMm(parseFloat(e.target.value) || 0), style: styles.input }))
    ),

    item === "Lintel" && React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Lintels'), React.createElement('input', { type: 'number', value: memberNos, onChange: (e) => setMemberNos(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, `Clear Span (${unitSystem})`), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bearing each side (mm)'), React.createElement('input', { type: 'number', value: lintelBearingMm, onChange: (e) => setLintelBearingMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (mm)'), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Depth (mm)'), React.createElement('input', { type: 'number', value: depth, onChange: (e) => setDepth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Clear Cover (mm)'), React.createElement('input', { type: 'number', value: coverMm, onChange: (e) => setCoverMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bottom Bar Dia'), React.createElement('select', { value: bottomDia, onChange: (e) => setBottomDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bottom Bar Count'), React.createElement('input', { type: 'number', value: bottomBarsCount, onChange: (e) => setBottomBarsCount(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Top Bar Dia'), React.createElement('select', { value: topDia, onChange: (e) => setTopDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Top Bar Count'), React.createElement('input', { type: 'number', value: topBarsCount, onChange: (e) => setTopBarsCount(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Stirrup Dia'), React.createElement('select', { value: stirrupDia, onChange: (e) => setStirrupDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Stirrup Spacing (mm)'), React.createElement('input', { type: 'number', value: stirrupSpacingMidMm, onChange: (e) => setStirrupSpacingMidMm(parseFloat(e.target.value) || 0), style: styles.input }))
    ),

    item === "Column" && React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Columns'), React.createElement('input', { type: 'number', value: memberNos, onChange: (e) => setMemberNos(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, `Column Height (${unitSystem})`), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (mm)'), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Depth (mm)'), React.createElement('input', { type: 'number', value: depth, onChange: (e) => setDepth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Clear Cover (mm)'), React.createElement('input', { type: 'number', value: coverMm, onChange: (e) => setCoverMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Corner Rod Dia'), React.createElement('select', { value: cornerDia, onChange: (e) => setCornerDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Corner Rod Count'), React.createElement('input', { type: 'number', value: cornerBarsCount, onChange: (e) => setCornerBarsCount(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Interm Rod Dia'), React.createElement('select', { value: middleDia, onChange: (e) => setMiddleDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Interm Rod Count'), React.createElement('input', { type: 'number', value: middleBarsCount, onChange: (e) => setMiddleBarsCount(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Tie Dia'), React.createElement('select', { value: tieDia, onChange: (e) => setTieDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Confined Tie Spacing (mm)'), React.createElement('input', { type: 'number', value: tieSpacingConfinedMm, onChange: (e) => setTieSpacingConfinedMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Mid Tie Spacing (mm)'), React.createElement('input', { type: 'number', value: tieSpacingMidMm, onChange: (e) => setTieSpacingMidMm(parseFloat(e.target.value) || 0), style: styles.input }))
    ),

    item === "Footing" && React.createElement('div', { style: styles.row6 },
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Footing Type'),
        React.createElement('select', { value: footingType, onChange: (e) => setFootingType(e.target.value), style: styles.select },
          ["Isolated Footing", "Combined Footing", "Strip Footing", "Stepped Footing"].map(x => React.createElement('option', { key: x, value: x }, x))
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Reinforcement Mat'),
        React.createElement('select', { value: matType, onChange: (e) => setMatType(e.target.value), style: styles.select },
          ["Single Mat", "Double Mat"].map(x => React.createElement('option', { key: x, value: x }, x))
        )
      ),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, `Length (${unitSystem})`), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, `Width (${unitSystem})`), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Depth/Thickness (mm)'), React.createElement('input', { type: 'number', value: depth, onChange: (e) => setDepth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Clear Cover (mm)'), React.createElement('input', { type: 'number', value: coverMm, onChange: (e) => setCoverMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Main (X) Dia'), React.createElement('select', { value: xDia, onChange: (e) => setXDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Main (X) Spacing (mm)'), React.createElement('input', { type: 'number', value: xSpacingMm, onChange: (e) => setXSpacingMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Dist (Y) Dia'), React.createElement('select', { value: yDia, onChange: (e) => setYDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Dist (Y) Spacing (mm)'), React.createElement('input', { type: 'number', value: ySpacingMm, onChange: (e) => setYSpacingMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Column Dowel Dia'), React.createElement('select', { value: dowelDia, onChange: (e) => setDowelDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Column Dowel Count'), React.createElement('input', { type: 'number', value: dowelCount, onChange: (e) => setDowelCount(parseFloat(e.target.value) || 0), style: styles.input }))
    ),

    item === "RCC Wall" && React.createElement('div', { style: styles.row6 },
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Wall Face Type'),
        React.createElement('select', { value: wallFace, onChange: (e) => setWallFace(e.target.value), style: styles.select },
          ["Single Face", "Double Face"].map(x => React.createElement('option', { key: x, value: x }, x))
        )
      ),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, `Wall Length (${unitSystem})`), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, `Wall Height (${unitSystem})`), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Thickness (mm)'), React.createElement('input', { type: 'number', value: depth, onChange: (e) => setDepth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Clear Cover (mm)'), React.createElement('input', { type: 'number', value: coverMm, onChange: (e) => setCoverMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Vertical Dia'), React.createElement('select', { value: vertDia, onChange: (e) => setVertDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Vertical Spacing (mm)'), React.createElement('input', { type: 'number', value: vertSpacingMm, onChange: (e) => setVertSpacingMm(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Horizontal Dia'), React.createElement('select', { value: horizDia, onChange: (e) => setHorizDia(Number(e.target.value)), style: styles.select }, dias.map(d => React.createElement('option', { key: d, value: d }, `${d} mm`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Horizontal Spacing (mm)'), React.createElement('input', { type: 'number', value: horizSpacingMm, onChange: (e) => setHorizSpacingMm(parseFloat(e.target.value) || 0), style: styles.input }))
    ),

    React.createElement('div', { style: styles.buttonRow },
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Calculate Rebar BBS & Quantities'),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'steel-calculator', handleExportExcel), style: styles.buttonExport }, '📊 Excel BBS'),
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'steel-calculator', handleWhatsApp), style: styles.buttonWhatsapp }, '💬 Share')
      )
    ),

    generated && results && React.createElement('div', null,
      results.warnings.length > 0 && React.createElement('div', { style: styles.warningBox },
        results.warnings.map((w: string, i: number) => React.createElement('div', { key: i }, w))
      ),

      React.createElement('div', { style: styles.cardContainer },
        React.createElement('div', { style: { ...styles.card, ...styles.cardBlue } }, React.createElement('div', null, '🔩'), React.createElement('div', null, 'Total Steel'), React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.totalSteelKg)} kg (${formatNumber(results.totalSteelMT, 3)} MT)`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightGreen } }, React.createElement('div', null, '🧵'), React.createElement('div', null, 'Binding Wire'), React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.bindingWireKg)} kg`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightOrange } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Material Subtotal'), React.createElement('div', { style: styles.cardValue }, formatCurrency(results.costs.materialTotal))),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightTeal } }, React.createElement('div', null, '💎'), React.createElement('div', null, 'Grand Total'), React.createElement('div', { style: styles.cardValue }, formatCurrency(results.costs.grandTotal)))
      ),

      React.createElement('div', { style: styles.sectionTitle }, '📋 Detailed Bar Bending Schedule (BBS Table per IS 456 / SP 34)'),
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null,
            React.createElement('th', { style: styles.th }, 'Mark'),
            React.createElement('th', { style: styles.th }, 'Bar Description'),
            React.createElement('th', { style: styles.th }, 'Dia'),
            React.createElement('th', { style: styles.th }, 'Shape Code'),
            React.createElement('th', { style: styles.th }, 'Bars/Member'),
            React.createElement('th', { style: styles.th }, 'Total Bars'),
            React.createElement('th', { style: styles.th }, 'Cut Len (m)'),
            React.createElement('th', { style: styles.th }, 'Total Len (m)'),
            React.createElement('th', { style: styles.th }, 'Weight (kg)'),
            React.createElement('th', { style: styles.th }, 'Remarks / Laps')
          )),
          React.createElement('tbody', null,
            results.bbsRows.map((r: any, i: number) =>
              React.createElement('tr', { key: i, style: i % 2 === 1 ? styles.evenRow : {} },
                React.createElement('td', { style: styles.td }, r.barMark),
                React.createElement('td', { style: styles.td }, r.description),
                React.createElement('td', { style: styles.td }, `${r.dia}mm`),
                React.createElement('td', { style: styles.td }, r.shape),
                React.createElement('td', { style: styles.td }, r.barsPerMember),
                React.createElement('td', { style: styles.td }, r.totalBars),
                React.createElement('td', { style: styles.td }, formatNumber(r.cuttingLengthM)),
                React.createElement('td', { style: styles.td }, formatNumber(r.totalLengthM)),
                React.createElement('td', { style: { ...styles.td, fontWeight: 'bold' } }, formatNumber(r.weightKg)),
                React.createElement('td', { style: styles.td }, r.remarks)
              )
            )
          )
        )
      ),

      React.createElement('div', { style: styles.sectionTitle }, '📦 Rebar Diameter Summary & 12m Commercial Stock Requirement'),
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null,
            React.createElement('th', { style: styles.th }, 'Diameter'),
            React.createElement('th', { style: styles.th }, 'Unit Weight (kg/m)'),
            React.createElement('th', { style: styles.th }, 'Total Length (m)'),
            React.createElement('th', { style: styles.th }, '12m Stock Bars Req'),
            React.createElement('th', { style: styles.th }, 'Weight (kg)'),
            React.createElement('th', { style: styles.th }, 'Weight (MT)')
          )),
          React.createElement('tbody', null,
            dias.map((d: number) => {
              const info = results.diaSummaryMap[d];
              if (!info || info.kg <= 0) return null;
              return React.createElement('tr', { key: d },
                React.createElement('td', { style: { ...styles.td, fontWeight: 'bold' } }, `${d} mm`),
                React.createElement('td', { style: styles.td }, formatNumber(kgPerM(d), 3)),
                React.createElement('td', { style: styles.td }, formatNumber(info.lengthM)),
                React.createElement('td', { style: styles.td }, `${info.stockBarsReq} nos`),
                React.createElement('td', { style: styles.td }, formatNumber(info.kg)),
                React.createElement('td', { style: styles.td }, formatNumber(info.mt, 3))
              );
            })
          )
        )
      ),

      React.createElement('div', { style: styles.sectionTitle }, '💰 Admin Master Rates Cost Estimation'),
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null,
            React.createElement('th', { style: styles.th }, 'Item / Material'),
            React.createElement('th', { style: styles.th }, 'Quantity'),
            React.createElement('th', { style: styles.th }, 'Unit'),
            React.createElement('th', { style: styles.th }, 'Master Rate'),
            React.createElement('th', { style: styles.th }, 'Cost')
          )),
          React.createElement('tbody', null,
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, `Base TMT Rebar Steel (${steelGrade})`), React.createElement('td', { style: styles.td }, formatNumber(results.baseKg)), React.createElement('td', { style: styles.td }, 'KG'), React.createElement('td', { style: styles.td }, '-'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, `Wastage Allowance (${wastage}%)`), React.createElement('td', { style: styles.td }, formatNumber(results.wastageKg)), React.createElement('td', { style: styles.td }, 'KG'), React.createElement('td', { style: styles.td }, '-'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', { style: { fontWeight: 'bold' } }, React.createElement('td', { style: styles.td }, 'Total TMT Rebar Steel'), React.createElement('td', { style: styles.td }, `${formatNumber(results.totalSteelKg)} kg (${formatNumber(results.totalSteelMT, 3)} MT)`), React.createElement('td', { style: styles.td }, 'KG'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.steelRatePerKg)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.steel))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, `GI Binding Wire (${bindingWirePercent}%)`), React.createElement('td', { style: styles.td }, formatNumber(results.bindingWireKg)), React.createElement('td', { style: styles.td }, 'KG'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.bindingWireRatePerKg)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.bindingWire))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Concrete Cover Blocks'), React.createElement('td', { style: styles.td }, formatNumber(results.coverBlocksCount, 0)), React.createElement('td', { style: styles.td }, 'Nos'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.coverBlockRatePerPc)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.coverBlock))),

            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 4, style: styles.td }, 'Material Subtotal'), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.materialTotal))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Labour — Bar Bending, Cutting, Cranking & Fixing'), React.createElement('td', { style: styles.td }, formatNumber(results.totalSteelKg)), React.createElement('td', { style: styles.td }, 'KG'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.barBendingLabourRatePerKg)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.labour))),
            React.createElement('tr', { style: { backgroundColor: '#f0f7f5', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 4, style: styles.td }, 'Labour Subtotal'), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.labour))),
            React.createElement('tr', { style: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 4, style: { padding: '8px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '8px' } }, formatCurrency(results.costs.grandTotal)))
          )
        )
      ),

      React.createElement('div', { style: { display: 'flex', gap: '10px', marginTop: '15px' } },
        React.createElement('button', {
          onClick: () => {
            alert('Saved RCC Steel BBS Calculation to Active Project!');
          },
          style: { flex: 1, padding: '10px', borderRadius: '6px', border: 0, backgroundColor: '#0f766e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }
        }, '💾 Save to Project'),
        React.createElement('button', {
          onClick: () => {
            alert('Added Rebar Quantities & BBS to BOQ Line Items!');
          },
          style: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #0f766e', backgroundColor: 'white', color: '#0f766e', fontWeight: 'bold', cursor: 'pointer' }
        }, '📋 Add to BOQ')
      ),

      React.createElement('div', { style: styles.detailsBox },
        React.createElement('b', null, '📜 Expandable Engineering Explanation & Standards (IS 456:2000 & SP 34:1987)'),
        React.createElement('div', { style: { marginTop: '6px' } }, '• Rebar Unit Weight Formula: W = d²/162 kg/m (IS 1786 High Yield Strength Deformed Fe500 / Fe550 bars).'),
        React.createElement('div', null, `• Dynamic Tension Development Length (Ld): Computed per Cl. 26.2.1. For ${steelGrade} in ${concreteGrade}, Ld = ${(calculateDevelopmentLength(16, concreteGrade, steelGrade).ldFactor)}d.`),
        React.createElement('div', null, '• Geometrical Bent-up Bar Crank Extra: Calculated from angle theta (45° = 0.42D, 30° = 0.27D, 60° = 0.58D) where D = Depth - 2*Cover - BarDia.'),
        React.createElement('div', null, '• Double Mat Chairs: Calculated as 1 per sq.m for double reinforcement mats only; height = Depth - 2*Cover - 4*BarDia.'),
        React.createElement('div', null, '• Dynamic Rates loaded live from Admin Master Rates. Displays "Rate Unavailable in Admin Master" when unconfigured.')
      )
    )
  );
}
