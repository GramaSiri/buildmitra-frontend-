import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import CollapsibleSection from '../components/ui/CollapsibleSection';
import { getMasterRate, syncApprovedRatesFromBackend } from "../utils/masterRates";
import { downloadBuildMitraPDF } from "../utils/pdfExport";

type RCCMemberType = 'Slab' | 'Beam' | 'Lintel' | 'Column' | 'Footing' | 'RCC Wall';

const RCC_MEMBERS: { id: RCCMemberType; label: string; icon: string }[] = [
  { id: 'Slab', label: 'One-way / Two-way Slab', icon: '🔲' },
  { id: 'Beam', label: 'RCC Beam / Plinth Beam', icon: '📏' },
  { id: 'Lintel', label: 'Lintel Beam', icon: '🚪' },
  { id: 'Column', label: 'RCC Column', icon: '🏛️' },
  { id: 'Footing', label: 'Footing & Starter Dowels', icon: '🦶' },
  { id: 'RCC Wall', label: 'Retaining / RCC Shear Wall', icon: '🧱' }
];

const styles = {
  container: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' },
  header: { maxWidth: '100%', margin: '0 0 8px 0', padding: '6px 10px', borderRadius: '6px' },
  backButton: { backgroundColor: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px' },
  headerTitle: { margin: 0, fontSize: '16px', lineHeight: '1.15', fontWeight: '800', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' },
  sectionTitle: { backgroundColor: '#e2e8f0', color: '#1e293b', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', fontWeight: '800', borderLeft: '4px solid #7f1d1d' },
  memberBar: { display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '6px', padding: '4px 2px', marginBottom: '8px', WebkitOverflowScrolling: 'touch' },
  memberTab: (active: boolean) => ({
    padding: '8px 14px',
    borderRadius: '8px',
    border: active ? '2px solid #7f1d1d' : '1px solid #cbd5e1',
    backgroundColor: active ? '#fef2f2' : 'white',
    color: active ? '#7f1d1d' : '#475569',
    fontWeight: active ? '800' : '600',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'normal' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(68px, 1fr))', gap: '4px', marginBottom: '6px' },
  inputGroup: { marginBottom: '0px', minWidth: 0 },
  label: { display: 'block', fontSize: '10px', lineHeight: '1.1', fontWeight: '700', marginBottom: '2px', whiteSpace: 'normal' },
  input: { width: '100%', minWidth: 0, maxWidth: '100%', height: '32px', padding: '3px 5px', fontSize: '12px', lineHeight: '1.1', textAlign: 'center', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
  select: { width: '100%', minWidth: 0, maxWidth: '100%', height: '32px', padding: '3px 4px', fontSize: '11px', lineHeight: '1.1', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box', overflow: 'hidden', textOverflow: 'ellipsis' },
  buttonRow: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(68px, 1fr))', gap: '4px', marginBottom: '6px', width: '100%' },
  buttonGenerate: { backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 6px', height: '32px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'normal' },
  buttonExport: { backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 6px', height: '32px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'normal' },
  buttonWhatsapp: { backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 6px', height: '32px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'normal' },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(112px, 1fr))',
    gap: '5px',
    width: '100%',
    maxWidth: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',
    touchAction: 'pan-x',
    overscrollBehaviorX: 'contain',
    scrollSnapType: 'x proximity',
    padding: '3px 2px 7px',
    margin: '3px 0 6px'
  },
  card: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  cardBlue: { backgroundColor: '#0284c7' },
  cardLightGreen: { backgroundColor: '#16a34a' },
  cardLightOrange: { backgroundColor: '#ea580c' },
  cardLightTeal: { backgroundColor: '#0f766e' },
  cardValue: { fontSize: "10px", fontWeight: "bold", margin: "1px 0 0 0", color: "#0f172a", whiteSpace: "nowrap" },
  tablecontainer: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' },
  table: { width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '10px' },
  th: { padding: '3px 4px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#f1f5f9', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' },
  td: { padding: '3px 4px', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' },
  evenRow: { backgroundColor: '#f8fafc' },
  rateInfo: { maxWidth: '100%', margin: '0 0 8px 0', padding: '4px 8px', borderRadius: '6px' },
  warningBox: { backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '11px', fontWeight: '700' }
};

const formatNumber = (num: number | null | undefined, decimals = 2): string => {
  if (num === null || num === undefined || isNaN(num)) return "0.00";
  return num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rate Unavailable";
  return `₹${formatNumber(amount, 2)}`;
};

const dias = [6, 8, 10, 12, 16, 20, 25, 32];
const kgPerM = (dia: number) => (dia * dia) / 162;
const mmToM = (mm: number) => mm / 1000;
const ftToM = (ft: number) => ft * 0.3048;

const calculateDevelopmentLength = (dia: number, concreteGrade: string, steelGrade: string) => {
  const tauBdMap: Record<string, number> = { M15: 1.0, M20: 1.2, M25: 1.4, M30: 1.5, M35: 1.7, M40: 1.9 };
  const baseTauBd = tauBdMap[concreteGrade] || 1.2;
  const tauBdHysd = baseTauBd * 1.6;
  const fyMap: Record<string, number> = { Fe415: 415, Fe500: 500, Fe550: 550 };
  const fy = fyMap[steelGrade] || 500;
  const sigmaS = 0.87 * fy;
  const ldMm = (dia * sigmaS) / (4 * tauBdHysd);
  const ldFactor = ldMm / dia;
  return { ldMm, ldFactor: Math.round(ldFactor * 10) / 10, ldM: ldMm / 1000 };
};

export default function SteelCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();
  const { rates: contextRates, loading } = useRates();

  const [item, setItem] = useState<RCCMemberType>("Slab");
  const [concreteGrade, setConcreteGrade] = useState("M20");
  const [steelGrade, setSteelGrade] = useState("Fe500");
  const [exposureCondition, setExposureCondition] = useState("Moderate");
  const [unitSystem, setUnitSystem] = useState("feet");
  const [stockBarLengthM, setStockBarLengthM] = useState(12);
  const [wastage, setWastage] = useState(3);
  const [bindingWirePercent, setBindingWirePercent] = useState(1);
  const [lapSetting, setLapSetting] = useState("Auto");
  const [matType, setMatType] = useState("Single Mat");

  const [memberNos, setMemberNos] = useState(1);
  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(20);
  const [depth, setDepth] = useState(150);
  const [coverMm, setCoverMm] = useState(20);

  const [slabType, setSlabType] = useState("One-way Slab");
  const [xDia, setXDia] = useState(10);
  const [yDia, setYDia] = useState(8);
  const [xSpacingMm, setXSpacingMm] = useState(150);
  const [ySpacingMm, setYSpacingMm] = useState(175);
  const [hasCranks, setHasCranks] = useState(true);
  const [crankAngle, setCrankAngle] = useState(45);
  const [crankPct, setCrankPct] = useState(50);

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

  const [cornerDia, setCornerDia] = useState(16);
  const [cornerBarsCount, setCornerBarsCount] = useState(4);
  const [middleDia, setMiddleDia] = useState(12);
  const [middleBarsCount, setMiddleBarsCount] = useState(4);
  const [tieDia, setTieDia] = useState(8);
  const [tieSpacingConfinedMm, setTieSpacingConfinedMm] = useState(100);
  const [tieSpacingMidMm, setTieSpacingMidMm] = useState(150);

  const [footingType, setFootingType] = useState("Isolated Footing");
  const [dowelDia, setDowelDia] = useState(16);
  const [dowelCount, setDowelCount] = useState(6);

  const [wallFace, setWallFace] = useState("Double Face");
  const [vertDia, setVertDia] = useState(10);
  const [vertSpacingMm, setVertSpacingMm] = useState(150);
  const [horizDia, setHorizDia] = useState(8);
  const [horizSpacingMm, setHorizSpacingMm] = useState(175);

  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  // Admin Rate (₹)s with Standard Market Fallbacks
  const steelRateRes = getMasterRate(["tmt steel", "tmt bar", "steel", "rebar", "reinforcement steel", "tmt"], 145, ["bm_material_rates"]);
  const bindingWireRateRes = getMasterRate(["binding wire", "gi binding wire", "wire"], 180, ["bm_material_rates"]);
  const coverBlockRateRes = getMasterRate(["cover block", "concrete cover block", "cover blocks"], 5.0, ["bm_material_rates"]);
  const barBendingLabourRes = getMasterRate(["bar bending", "steel binding", "rebar labour", "bar bending labour", "steel fixing"], 16.0, ["bm_labour_rates", "bm_service_rates"]);

  const getNormalizedRatePerKg = (res: any, fallback: number) => {
    if (!res.found || res.rate <= 0) return fallback;
    return res.rate > 500 ? res.rate / 1000 : res.rate;
  };

  const steelRatePerKg = getNormalizedRatePerKg(steelRateRes, 145);
  const bindingWireRatePerKg = getNormalizedRatePerKg(bindingWireRateRes, 180);
  const coverBlockRatePerPc = coverBlockRateRes.found && coverBlockRateRes.rate > 0 ? coverBlockRateRes.rate : 5.0;
  const barBendingLabourRatePerKg = getNormalizedRatePerKg(barBendingLabourRes, 16.0);

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

    const lengthM = unitSystem === "feet" ? ftToM(length) : length;
    const widthM = unitSystem === "feet" ? ftToM(width) : width;
    const depthM = mmToM(depth);
    const coverM = mmToM(coverMm);

    const devX = calculateDevelopmentLength(xDia, concreteGrade, steelGrade);
    const devY = calculateDevelopmentLength(yDia, concreteGrade, steelGrade);
    const devTop = calculateDevelopmentLength(topDia, concreteGrade, steelGrade);
    const devBottom = calculateDevelopmentLength(bottomDia, concreteGrade, steelGrade);
    const devCorner = calculateDevelopmentLength(cornerDia, concreteGrade, steelGrade);
    const devDowel = calculateDevelopmentLength(dowelDia, concreteGrade, steelGrade);

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

    if (item === "Slab") {
      const clearLengthM = Math.max(0, lengthM - 2 * coverM);
      const clearWidthM = Math.max(0, widthM - 2 * coverM);
      
      const xBarsCount = Math.floor((widthM * 1000) / xSpacingMm) + 1;
      const yBarsCount = Math.floor((lengthM * 1000) / ySpacingMm) + 1;

      const crankEffectiveDM = Math.max(0, depthM - 2 * coverM - mmToM(xDia));
      let crankExtraPerBarM = 0;
      if (hasCranks) {
        if (crankAngle === 30) crankExtraPerBarM = 0.268 * crankEffectiveDM;
        else if (crankAngle === 60) crankExtraPerBarM = 0.578 * crankEffectiveDM;
        else crankExtraPerBarM = 0.414 * crankEffectiveDM;
      }

      const lapCountX = lapSetting !== "No" && clearLengthM > stockBarLengthM ? Math.floor(clearLengthM / stockBarLengthM) : 0;
      const lapLengthX = lapCountX * devX.ldM;
      const xCuttingLengthM = clearLengthM + (hasCranks ? crankExtraPerBarM * (crankPct / 100) * 2 : 0) + lapLengthX + (2 * devX.ldM * 0.25);

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

        chairsCount = Math.ceil(lengthM * widthM * memberNos);
        const chairDia = 10;
        const chairHeightM = Math.max(0.08, depthM - 2 * coverM - 2 * mmToM(xDia) - 2 * mmToM(yDia));
        const chairCuttingLengthM = 2 * chairHeightM + 0.3;
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

      if (extraTopBarsCount > 0) {
        const extraTopLenM = (clearSpanM / 3) + devTop.ldM;
        const totalExtraTopLenM = extraTopLenM * extraTopBarsCount * 2 * memberNos;
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

      const endZoneLenM = clearSpanM / 4;
      const midZoneLenM = clearSpanM - 2 * endZoneLenM;
      const endStirrupCount = (Math.floor((endZoneLenM * 1000) / stirrupSpacingEndMm) + 1) * 2;
      const midStirrupCount = Math.floor((midZoneLenM * 1000) / stirrupSpacingMidMm);
      const totalStirrupCountPerBeam = endStirrupCount + midStirrupCount;

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

      const lapCount = lapSetting !== "No" && colHeightM > stockBarLengthM ? Math.floor(colHeightM / stockBarLengthM) : 0;
      const mainBarCuttingM = colHeightM + devCorner.ldM + (lapCount + 1) * devCorner.ldM;
      
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

      if (dowelCount > 0) {
        const dowelCuttingM = devDowel.ldM + 0.3;
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

      coverBlocksCount = Math.ceil(lengthM * widthM * memberNos * 2);

    } else {
      const wallLenM = lengthM;
      const wallHeightM = widthM;

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

    const baseKg = bbsRows.reduce((s, r) => s + r.weightKg, 0);
    const wastageKg = baseKg * (Number(wastage || 0) / 100);
    const totalSteelKg = baseKg + wastageKg;
    const totalSteelMT = totalSteelKg / 1000;
    const bindingWireKg = totalSteelKg * (Number(bindingWirePercent || 1) / 100);

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

    const steelCost = totalSteelKg * steelRatePerKg;
    const bindingWireCost = bindingWireKg * bindingWireRatePerKg;
    const coverBlockCost = coverBlocksCount * coverBlockRatePerPc;

    const materialTotal = steelCost + bindingWireCost + coverBlockCost;
    const labourCost = totalSteelKg * barBendingLabourRatePerKg;
    const grandTotal = materialTotal + labourCost;

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
        steel: steelRatePerKg,
        bindingWire: bindingWireRatePerKg,
        coverBlock: coverBlockRatePerPc,
        barBendingLabour: barBendingLabourRatePerKg
      },
      costs: {
        baseSteel: baseKg * steelRatePerKg,
        wastageSteel: wastageKg * steelRatePerKg,
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

  const handleExportPDF = () => {
    if (!results) return;
    checkAndRun('calculator_export', 'steel-calculator', () => {
      downloadBuildMitraPDF({
        documentTitle: `STEEL REBAR BAR BENDING SCHEDULE (BBS) — ${item.toUpperCase()}`,
        documentNo: `BM-BBS-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        projectName: `RCC Steel Rebar Work — ${item}`,
        buyerName: "Client / Buyer",
        contractorName: "BuildMitra Bar Bending Division",
        items: results.bbsRows.map((row: any, idx: number) => ({
          sno: idx + 1,
          itemCode: `BAR-${row.barMark}`,
          category: "Steel Rebar",
          description: `${row.description} (${row.dia}mm Dia, ${row.shape})`,
          quantity: row.weightKg,
          unit: "KG",
          rate: results.rates.steel,
          amount: row.weightKg * results.rates.steel
        })),
        notes: `Total Steel: ${formatNumber(results.totalSteelKg)} kg (${formatNumber(results.totalSteelMT, 3)} MT) | Steel Grade: ${steelGrade} | Wastage: ${wastage}%`
      });
    });
  };

  const handleExportExcel = () => {
    if (!results) return;
    checkAndRun('calculator_export', 'steel-calculator', () => {
      const wb = XLSX.utils.book_new();
      const bbsSheetData = results.bbsRows.map((r: any) => ({
        "Mark": r.barMark,
        "Description": r.description,
        "Diameter (mm)": r.dia,
        "Shape Code": r.shape,
        "Bars / Member": r.barsPerMember,
        "Total Bars": r.totalBars,
        "Cut Length (m)": formatNumber(r.cuttingLengthM),
        "Total Length (m)": formatNumber(r.totalLengthM),
        "Weight (kg)": formatNumber(r.weightKg),
        "Remarks / Laps": r.remarks
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bbsSheetData), "BBS Schedule");
      XLSX.writeFile(wb, `BBS_${item}_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  };

  const handleWhatsApp = () => {
    if (!results) return;
    checkAndRun('calculator_export', 'steel-calculator', () => {
      const message = `🏗️ *BUILDMITRA INFRA — REBAR BBS REPORT*\nNo:378, Near Gurusidheswra theater, 80 ft Road, JP Nagar, 4th Block, 9th Phase, Bengaluru- 560062 | 📱 +91 76769 42386\n\n*MEMBER*: ${item}\n• *Total Steel*: ${formatNumber(results.totalSteelKg)} kg (${formatNumber(results.totalSteelMT, 3)} MT)\n• *Binding Wire*: ${formatNumber(results.bindingWireKg)} kg\n• *Mat. Cost (₹)*: ${formatCurrency(results.costs.materialTotal)}\n• *Labour (₹)*: ${formatCurrency(results.costs.labour)}\n• *Grand Total (₹)*: ${formatCurrency(results.costs.grandTotal)}\n\nGenerated via BuildMitra Construction Suite.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    });
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Admin Rate (₹)s...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backButton}>←</button>
        <h1 style={styles.headerTitle}>RCC Steel Calculator & BBS Estimator (IS 456:2000 & SP 34:1987)</h1>
      </div>

      <MarketRateTrend />
      
      <CollapsibleSection title="Rates & Assumptions" defaultOpen={false}>
        <div>💰 <b>Admin Rates:</b> TMT Steel ₹{steelRatePerKg}/kg | Binding Wire ₹{bindingWireRatePerKg}/kg | Cover Blocks ₹{coverBlockRatePerPc}/pc</div>
        <div style={{ marginTop: '4px' }}>👷 <b>Labour Rate:</b> Bar Bending, Cutting & Fixing ₹{barBendingLabourRatePerKg}/kg (₹{barBendingLabourRatePerKg * 1000}/MT)</div>
      </CollapsibleSection>

      <div style={styles.sectionTitle}>Member Type</div>
      <div style={styles.memberBar}>
        {RCC_MEMBERS.map(m => (
          <button key={m.id} onClick={() => setItem(m.id)} style={styles.memberTab(item === m.id)}>
            <span>{m.icon}</span> {m.label}
          </button>
        ))}
      </div>

      <div style={styles.sectionTitle}>📋 Common Specifications & Detailing Configuration</div>
      <div style={styles.grid}>
        <div>
          <label style={styles.label}>Concrete Grade</label>
          <select value={concreteGrade} onChange={(e) => setConcreteGrade(e.target.value)} style={styles.select}>
            {["M15", "M20", "M25", "M30", "M35", "M40"].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label style={styles.label}>Steel Grade (IS 1786)</label>
          <select value={steelGrade} onChange={(e) => setSteelGrade(e.target.value)} style={styles.select}>
            {["Fe415", "Fe500", "Fe550"].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label style={styles.label}>Exposure Condition</label>
          <select value={exposureCondition} onChange={(e) => setExposureCondition(e.target.value)} style={styles.select}>
            {["Mild", "Moderate", "Severe", "Very Severe"].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label style={styles.label}>Commercial Bar Length (m)</label>
          <input type="number" value={stockBarLengthM} onChange={(e) => setStockBarLengthM(parseFloat(e.target.value) || 12)} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>Wastage (%)</label>
          <input type="number" value={wastage} onChange={(e) => setWastage(parseFloat(e.target.value) || 0)} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>Binding Wire (%)</label>
          <input type="number" value={bindingWirePercent} onChange={(e) => setBindingWirePercent(parseFloat(e.target.value) || 0)} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>Commercial Laps</label>
          <select value={lapSetting} onChange={(e) => setLapSetting(e.target.value)} style={styles.select}>
            <option value="Auto">Auto (Span &gt; 12m)</option>
            <option value="Yes">Always Add Laps</option>
            <option value="No">No Laps</option>
          </select>
        </div>
        <div>
          <label style={styles.label}>Unit System</label>
          <select value={unitSystem} onChange={(e) => setUnitSystem(e.target.value)} style={styles.select}>
            <option value="feet">Feet (ft)</option>
            <option value="meters">Meters (m)</option>
          </select>
        </div>
      </div>

      <div style={styles.sectionTitle}>📐 {item} Dimensions & Rebar Detailing</div>
      {item === "Slab" && (
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Slab Type</label>
            <select value={slabType} onChange={(e) => setSlabType(e.target.value)} style={styles.select}>
              <option value="One-way Slab">One-way Slab</option>
              <option value="Two-way Slab">Two-way Slab</option>
              <option value="Cantilever Slab">Cantilever Slab</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Reinforcement Mat</label>
            <select value={matType} onChange={(e) => setMatType(e.target.value)} style={styles.select}>
              <option value="Single Mat">Single Mat</option>
              <option value="Double Mat">Double Mat (Top + Bottom + Chairs)</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Length ({unitSystem})</label>
            <input type="number" value={length} onChange={(e) => setLength(e.target.value === "" ? ("" as any) : parseFloat(e.target.value))} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Width ({unitSystem})</label>
            <input type="number" value={width} onChange={(e) => setWidth(e.target.value === "" ? ("" as any) : parseFloat(e.target.value))} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Thickness (mm)</label>
            <input type="number" value={depth} onChange={(e) => setDepth(e.target.value === "" ? ("" as any) : parseFloat(e.target.value))} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Clear Cover (mm)</label>
            <input type="number" value={coverMm} onChange={(e) => setCoverMm(e.target.value === "" ? ("" as any) : parseFloat(e.target.value))} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Main (X) Dia</label>
            <select value={xDia} onChange={(e) => setXDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Main (X) Spacing (mm)</label>
            <input type="number" value={xSpacingMm} onChange={(e) => setXSpacingMm(e.target.value === "" ? ("" as any) : parseFloat(e.target.value))} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Dist (Y) Dia</label>
            <select value={yDia} onChange={(e) => setYDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Dist (Y) Spacing (mm)</label>
            <input type="number" value={ySpacingMm} onChange={(e) => setYSpacingMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Bent-up Cranks</label>
            <select value={hasCranks ? "Yes" : "No"} onChange={(e) => setHasCranks(e.target.value === "Yes")} style={styles.select}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          {hasCranks && (
            <div>
              <label style={styles.label}>Crank Angle</label>
              <select value={crankAngle} onChange={(e) => setCrankAngle(Number(e.target.value))} style={styles.select}>
                <option value={30}>30° (0.27D)</option>
                <option value={45}>45° (0.42D)</option>
                <option value={60}>60° (0.58D)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {item === "Beam" && (
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Clear Span Length ({unitSystem})</label>
            <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Beam Width (mm)</label>
            <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Beam Depth (mm)</label>
            <input type="number" value={depth} onChange={(e) => setDepth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Clear Cover (mm)</label>
            <input type="number" value={coverMm} onChange={(e) => setCoverMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Bottom Main Dia</label>
            <select value={bottomDia} onChange={(e) => setBottomDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Bottom Bars Count</label>
            <input type="number" value={bottomBarsCount} onChange={(e) => setBottomBarsCount(parseInt(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Top Hanger Dia</label>
            <select value={topDia} onChange={(e) => setTopDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Top Bars Count</label>
            <input type="number" value={topBarsCount} onChange={(e) => setTopBarsCount(parseInt(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Extra Top Dia</label>
            <select value={extraTopDia} onChange={(e) => setExtraTopDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Extra Top Bars (per end)</label>
            <input type="number" value={extraTopBarsCount} onChange={(e) => setExtraTopBarsCount(parseInt(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Stirrup Ring Dia</label>
            <select value={stirrupDia} onChange={(e) => setStirrupDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>End Zone Spacing (mm)</label>
            <input type="number" value={stirrupSpacingEndMm} onChange={(e) => setStirrupSpacingEndMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Mid Zone Spacing (mm)</label>
            <input type="number" value={stirrupSpacingMidMm} onChange={(e) => setStirrupSpacingMidMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
        </div>
      )}

      {item === "Column" && (
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Column Height ({unitSystem})</label>
            <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Column Width (mm)</label>
            <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Column Depth (mm)</label>
            <input type="number" value={depth} onChange={(e) => setDepth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Clear Cover (mm)</label>
            <input type="number" value={coverMm} onChange={(e) => setCoverMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Corner Rods Dia</label>
            <select value={cornerDia} onChange={(e) => setCornerDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Corner Rods Count</label>
            <input type="number" value={cornerBarsCount} onChange={(e) => setCornerBarsCount(parseInt(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Intermediate Rods Dia</label>
            <select value={middleDia} onChange={(e) => setMiddleDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Intermediate Rods Count</label>
            <input type="number" value={middleBarsCount} onChange={(e) => setMiddleBarsCount(parseInt(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Lateral Tie Ring Dia</label>
            <select value={tieDia} onChange={(e) => setTieDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Confined Zone Spacing (mm)</label>
            <input type="number" value={tieSpacingConfinedMm} onChange={(e) => setTieSpacingConfinedMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Mid Zone Spacing (mm)</label>
            <input type="number" value={tieSpacingMidMm} onChange={(e) => setTieSpacingMidMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
        </div>
      )}

      {item === "Footing" && (
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Footing Length ({unitSystem})</label>
            <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Footing Width ({unitSystem})</label>
            <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Footing Depth (mm)</label>
            <input type="number" value={depth} onChange={(e) => setDepth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Clear Cover (mm)</label>
            <input type="number" value={coverMm} onChange={(e) => setCoverMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Mesh X-Dia</label>
            <select value={xDia} onChange={(e) => setXDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Mesh X-Spacing (mm)</label>
            <input type="number" value={xSpacingMm} onChange={(e) => setXSpacingMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Mesh Y-Dia</label>
            <select value={yDia} onChange={(e) => setYDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Mesh Y-Spacing (mm)</label>
            <input type="number" value={ySpacingMm} onChange={(e) => setYSpacingMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Starter Dowels Dia</label>
            <select value={dowelDia} onChange={(e) => setDowelDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Starter Dowels Count</label>
            <input type="number" value={dowelCount} onChange={(e) => setDowelCount(parseInt(e.target.value) || 0)} style={styles.input} />
          </div>
        </div>
      )}

      {item === "Lintel" && (
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Clear Opening Length ({unitSystem})</label>
            <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Lintel Width (mm)</label>
            <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Lintel Depth (mm)</label>
            <input type="number" value={depth} onChange={(e) => setDepth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Wall Bearing (mm)</label>
            <input type="number" value={lintelBearingMm} onChange={(e) => setLintelBearingMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Bottom Main Dia</label>
            <select value={bottomDia} onChange={(e) => setBottomDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Bottom Bars Count</label>
            <input type="number" value={bottomBarsCount} onChange={(e) => setBottomBarsCount(parseInt(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Top Hanger Dia</label>
            <select value={topDia} onChange={(e) => setTopDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Top Bars Count</label>
            <input type="number" value={topBarsCount} onChange={(e) => setTopBarsCount(parseInt(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Stirrup Ring Dia</label>
            <select value={stirrupDia} onChange={(e) => setStirrupDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Stirrup Spacing (mm)</label>
            <input type="number" value={stirrupSpacingMidMm} onChange={(e) => setStirrupSpacingMidMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
        </div>
      )}

      {item === "RCC Wall" && (
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Wall Length ({unitSystem})</label>
            <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Wall Height ({unitSystem})</label>
            <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Wall Thickness (mm)</label>
            <input type="number" value={depth} onChange={(e) => setDepth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Reinforcement Face</label>
            <select value={wallFace} onChange={(e) => setWallFace(e.target.value)} style={styles.select}>
              <option value="Single Face">Single Face Curtain</option>
              <option value="Double Face">Double Face Curtain</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Vertical Dia</label>
            <select value={vertDia} onChange={(e) => setVertDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Vertical Spacing (mm)</label>
            <input type="number" value={vertSpacingMm} onChange={(e) => setVertSpacingMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Horizontal Dia</label>
            <select value={horizDia} onChange={(e) => setHorizDia(Number(e.target.value))} style={styles.select}>
              {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Horizontal Spacing (mm)</label>
            <input type="number" value={horizSpacingMm} onChange={(e) => setHorizSpacingMm(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
        </div>
      )}

      <div style={styles.grid}>
        <div>
          <label style={styles.label}>Member Quantity (Nos)</label>
          <input type="number" value={memberNos} onChange={(e) => setMemberNos(parseInt(e.target.value) || 1)} style={styles.input} />
        </div>
      </div>

      <div style={styles.buttonRow}>
        <button onClick={handleGenerate} style={styles.buttonGenerate}>🔨 Calculate Rebar BBS & Quantities</button>
        {generated && results && (
          <>
            <button onClick={handleExportPDF} style={{ ...styles.buttonExport, backgroundColor: '#800020', color: 'white' }}>🖨️ PDF</button>
            <button onClick={handleExportExcel} style={styles.buttonExport}>📊 Excel BBS</button>
            <button onClick={handleWhatsApp} style={styles.buttonWhatsapp}>💬 Share</button>
          </>
        )}
      </div>

      {generated && results && (
        <div>
          {results.warnings.length > 0 && (
            <div style={styles.warningBox}>
              {results.warnings.map((w: string, i: number) => <div key={i}>{w}</div>)}
            </div>
          )}

          <div style={styles.cardContainer}>
            <div style={{ ...styles.card, ...styles.cardBlue }}>
              <div>🔩</div>
              <div>Total Steel Weight</div>
              <div style={styles.cardValue}>{formatNumber(results.totalSteelKg)} kg ({formatNumber(results.totalSteelMT, 3)} MT)</div>
            </div>
            <div style={{ ...styles.card, ...styles.cardLightGreen }}>
              <div>🧵</div>
              <div>Binding Wire (GI)</div>
              <div style={styles.cardValue}>{formatNumber(results.bindingWireKg)} kg</div>
            </div>
            <div style={{ ...styles.card, ...styles.cardLightOrange }}>
              <div>💰</div>
              <div>Tot. Mat (₹)</div>
              <div style={styles.cardValue}>{formatCurrency(results.costs.materialTotal)}</div>
            </div>
            <div style={{ ...styles.card, ...styles.cardLightTeal }}>
              <div>💎</div>
              <div>Estimated Grand Total (₹)</div>
              <div style={styles.cardValue}>{formatCurrency(results.costs.grandTotal)}</div>
            </div>
          </div>

          {/* DETAILED BBS SCHEDULE TABLE */}
          <div className="bm-item-results-scroll" style={styles.tableContainer}>
            <div style={{ padding: '12px 16px', background: '#334155', color: 'white', fontWeight: '800', fontSize: '13px' }}>
              📋 Detailed Bar Bending Schedule (BBS Table per IS 456 / SP 34)
            </div>
            <table className="bm-item-results-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Mark</th>
                  <th style={styles.th}>Bar Description</th>
                  <th style={styles.th}>Dia</th>
                  <th style={styles.th}>Shape Code</th>
                  <th style={styles.th}>Bars/Member</th>
                  <th style={styles.th}>Total Bars</th>
                  <th style={styles.th}>Cut Len (m)</th>
                  <th style={styles.th}>Total Len (m)</th>
                  <th style={styles.th}>Weight (kg)</th>
                  <th style={styles.th}>Remarks / Laps</th>
                </tr>
              </thead>
              <tbody>
                {results.bbsRows.map((r: any, idx: number) => (
                  <tr key={idx} style={idx % 2 === 1 ? styles.evenRow : undefined}>
                    <td style={styles.td}><b>{r.barMark}</b></td>
                    <td style={styles.td}>{r.description}</td>
                    <td style={styles.td}>{r.dia} mm</td>
                    <td style={styles.td}>{r.shape}</td>
                    <td style={styles.td}>{r.barsPerMember}</td>
                    <td style={styles.td}><b>{r.totalBars}</b></td>
                    <td style={styles.td}>{formatNumber(r.cuttingLengthM)} m</td>
                    <td style={styles.td}>{formatNumber(r.totalLengthM)} m</td>
                    <td style={styles.td}><b>{formatNumber(r.weightKg)} kg</b></td>
                    <td style={styles.td}><small>{r.remarks}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DIAMETER WISE STOCK BAR SUMMARY */}
          <div className="bm-item-results-scroll" style={styles.tableContainer}>
            <div style={{ padding: '12px 16px', background: '#0f766e', color: 'white', fontWeight: '800', fontSize: '13px' }}>
              📦 Rebar Diameter Summary & 12m Commercial Stock Requirement
            </div>
            <table className="bm-item-results-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Diameter</th>
                  <th style={styles.th}>Unit Weight (kg/m)</th>
                  <th style={styles.th}>Total Length (m)</th>
                  <th style={styles.th}>12m Stock Bars Req</th>
                  <th style={styles.th}>Weight (kg)</th>
                  <th style={styles.th}>Weight (MT)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results.diaSummaryMap)
                  .filter(([_, d]: any) => d.kg > 0)
                  .map(([dia, data]: any, idx: number) => (
                    <tr key={dia} style={idx % 2 === 1 ? styles.evenRow : undefined}>
                      <td style={styles.td}><b>{dia} mm</b></td>
                      <td style={styles.td}>{formatNumber(kgPerM(Number(dia)), 3)} kg/m</td>
                      <td style={styles.td}>{formatNumber(data.lengthM)} m</td>
                      <td style={{ ...styles.td, color: '#16a34a', fontWeight: '800' }}>{data.stockBarsReq} nos</td>
                      <td style={styles.td}><b>{formatNumber(data.kg)} kg</b></td>
                      <td style={styles.td}>{formatNumber(data.mt, 3)} MT</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* COST ESTIMATE BREAKDOWN TABLE */}
          <div className="bm-item-results-scroll" style={styles.tableContainer}>
            <div style={{ padding: '12px 16px', background: '#7f1d1d', color: 'white', fontWeight: '800', fontSize: '13px' }}>
              💰 Admin Rate (₹)s Cost Estimation
            </div>
            <table className="bm-item-results-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Item / Material</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Rate (₹)</th>
                  <th style={styles.th}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>Base TMT Rebar Steel ({steelGrade})</td>
                  <td style={styles.td}>{formatNumber(results.baseKg)}</td>
                  <td style={styles.td}>KG</td>
                  <td style={styles.td}>₹{results.rates.steel}/kg</td>
                  <td style={styles.td}><b>{formatCurrency(results.costs.baseSteel)}</b></td>
                </tr>
                <tr style={styles.evenRow}>
                  <td style={styles.td}>Wastage Allowance ({wastage}%)</td>
                  <td style={styles.td}>{formatNumber(results.wastageKg)}</td>
                  <td style={styles.td}>KG</td>
                  <td style={styles.td}>₹{results.rates.steel}/kg</td>
                  <td style={styles.td}><b>{formatCurrency(results.costs.wastageSteel)}</b></td>
                </tr>
                <tr>
                  <td style={styles.td}><b>Total TMT Rebar Steel</b></td>
                  <td style={styles.td}><b>{formatNumber(results.totalSteelKg)} kg ({formatNumber(results.totalSteelMT, 3)} MT)</b></td>
                  <td style={styles.td}>KG</td>
                  <td style={styles.td}>₹{results.rates.steel}/kg</td>
                  <td style={styles.td}><b>{formatCurrency(results.costs.steel)}</b></td>
                </tr>
                <tr style={styles.evenRow}>
                  <td style={styles.td}>GI Binding Wire ({bindingWirePercent}%)</td>
                  <td style={styles.td}>{formatNumber(results.bindingWireKg)}</td>
                  <td style={styles.td}>KG</td>
                  <td style={styles.td}>₹{results.rates.bindingWire}/kg</td>
                  <td style={styles.td}><b>{formatCurrency(results.costs.bindingWire)}</b></td>
                </tr>
                <tr>
                  <td style={styles.td}>Concrete Cover Blocks</td>
                  <td style={styles.td}>{results.coverBlocksCount}</td>
                  <td style={styles.td}>Nos</td>
                  <td style={styles.td}>₹{results.rates.coverBlock}/pc</td>
                  <td style={styles.td}><b>{formatCurrency(results.costs.coverBlock)}</b></td>
                </tr>
                <tr style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                  <td colSpan={4} style={styles.td}>Tot. Mat (₹)</td>
                  <td style={{ ...styles.td, color: '#0369a1', fontSize: '13px' }}>{formatCurrency(results.costs.materialTotal)}</td>
                </tr>
                <tr>
                  <td style={styles.td}>Labour — Bar Bending, Cutting, Cranking & Fixing</td>
                  <td style={styles.td}>{formatNumber(results.totalSteelKg)}</td>
                  <td style={styles.td}>KG</td>
                  <td style={styles.td}>₹{results.rates.barBendingLabour}/kg</td>
                  <td style={styles.td}><b>{formatCurrency(results.costs.labour)}</b></td>
                </tr>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                  <td colSpan={4} style={styles.td}>LABOUR SUBTOTAL</td>
                  <td style={{ ...styles.td, color: '#0f766e', fontSize: '13px' }}>{formatCurrency(results.costs.labour)}</td>
                </tr>
                <tr style={{ backgroundColor: '#7f1d1d', color: 'white', fontWeight: 'bold' }}>
                  <td colSpan={4} style={{ padding: '12px' }}>ESTIMATED Grand Total (₹) (MATERIAL + LABOUR)</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{formatCurrency(results.costs.grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => alert(`Saved ${item} Steel BBS Calculation to Active Project!`)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 0, backgroundColor: '#0f766e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            >
              💾 Save to Project
            </button>
            <button
              onClick={() => alert(`Added ${item} Steel Rebar to BOQ Line Items!`)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: 'white', color: '#0f766e', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📋 Add to BOQ
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <CollapsibleSection title="Advanced / Technical Details" defaultOpen={false}>
              <b>📜 Engineering Explanation & Standards (IS 456:2000 & SP 34:1987):</b>
              <div style={{ marginTop: '4px' }}>• <b>Rebar Unit Weight Formula:</b> W = d²/162 kg/m (IS 1786 High Yield Strength Deformed Fe500 / Fe550 bars).</div>
              <div>• <b>Dynamic Tension Development Length (Ld):</b> Computed per Cl. 26.2.1. For Fe500 in M20, Ld = 56.6d.</div>
              <div>• <b>Geometrical Bent-up Bar Crank Extra:</b> Calculated from angle theta (45° = 0.414D, 30° = 0.268D, 60° = 0.578D) where D = Depth - 2*Cover - BarDia.</div>
              <div>• <b>Double Mat Chairs:</b> Calculated as 1 per sq.m for double reinforcement mats only; height = Depth - 2*Cover - 4*BarDia.</div>
              <div>• <b>Dynamic Rate (₹)s:</b> Admin rates fallback to standard market values when unconfigured, preventing Rate Unavailable errors.</div>
            </CollapsibleSection>
          </div>
        </div>
      )}
    </div>
  );
}

















