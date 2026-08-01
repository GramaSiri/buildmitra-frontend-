import { getCachedBuildMitraMasterRates, fetchBuildMitraMasterRates } from "../../../utils/buildmitraMasterRates";
import { getBuildMitraReportHeaderHtml, BUILDMITRA_OFFICIAL_LOGO } from "../../../utils/buildmitraReportBranding";
import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import EngineeringSpecimen from '../components/engineering/EngineeringSpecimen';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { backgroundColor: '#1e3a8a', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(30,58,138,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#2563eb', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  dropdownCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '16px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  dropdownLabel: { fontSize: '12px', fontWeight: '800', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px', display: 'block' },
  modeSelect: { width: '100%', padding: '12px 14px', border: '2px solid #1e3a8a', borderRadius: '8px', fontSize: '15px', fontWeight: '700', color: '#1e3a8a', backgroundColor: '#eff6ff', outline: 'none', cursor: 'pointer' },

  stepperCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '15px', fontWeight: '700', color: '#1e3a8a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #bfdbfe', paddingBottom: '8px' },

  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '14px' },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' },
  select: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', outline: 'none' },

  btnPrimary: { backgroundColor: '#1e3a8a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnDanger: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' },
  metricCard: { padding: '14px', borderRadius: '8px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricBlue: { backgroundColor: '#1e3a8a' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tableContainer: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#1e3a8a', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

  rateTag: { backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },
  rateTagWarn: { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '600' },
  noteBox: { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#1e3a8a', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "Rate Unavailable in Admin Master";
  return `Ã¢â€šÂ¹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const kgPerM = (dia: number) => (dia * dia) / 162.2;

export default function RCCSlabCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Mode: 'quick' vs 'detailed'
  const [calcMode, setCalcMode] = useState<'quick' | 'detailed'>('quick');

  // QUICK CALCULATION INPUTS
  const initialQuickInputs = {
    inputType: 'Plot Dimensions (L x W x Floors)',
    plotLength: 30, // ft
    plotWidth: 40,  // ft
    floors: 1,      // floors
    directSlabArea: 1200,
    slabThicknessMm: 150, // 125mm, 150mm, 175mm
    concreteGrade: 'M20', // M20, M25, M30
    includeBeams: true,
    steelRatioPct: 1.0 // 0.8% - 1.2% by volume per IS 456
  };
  const [quickInputs, setQuickInputs] = useState(initialQuickInputs);

  // DETAILED STRUCTURAL INPUTS
  const initialDetailedInputs = {
    length: 30,
    width: 40,
    thicknessMm: 150,
    slabNos: 1,
    grade: "M20",

    reinforcementMat: "Single Mat",
    provideCrank: true,
    mainDia: 8,
    mainSpacing: 150,
    distDia: 10,
    distSpacing: 150,
    coverMm: 25,
    lapFactor: 50,
    steelWastagePct: 3,
    bindingWirePct: 1.5,
    crankBarsPct: 50,

    chairDia: 8,
    chairSpacingMm: 1200,
    coverBlockSpacingMm: 1000,

    hasBeam: true,
    beamLengthFt: 30,
    beamWidthIn: 9,   // 9 inches (0.225m)
    beamDepthIn: 12,  // 12 inches (0.300m)
    beamNos: 3,
    beamTopDia: 16,
    beamTopNos: 2,
    beamBottomDia: 12,
    beamBottomNos: 3,
    stirrupDia: 8,
    stirrupSpacingMm: 150,
    stirrupHookDeg: 135
  };
  const [detailedInputs, setDetailedInputs] = useState(initialDetailedInputs);

  // Admin Master Rates Lookup
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53", "opc"], 385);
  const steelRate = getMasterRate(["MAT-STL-01", "tmt steel", "steel", "rebar"], 68);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 46);
  const agg20Rate = getMasterRate(["MAT-AGG-20", "20mm aggregate", "aggregate"], 40);
  const agg12Rate = getMasterRate(["MAT-AGG-12", "12mm aggregate"], 42);
  const bindingRate = getMasterRate(["MAT-BWR-01", "binding wire"], 80);
  const coverBlockRate = getMasterRate(["MAT-CVR-01", "cover block"], 5);
  const labourRccRate = getMasterRate(["SRV-RCC-LAY", "rcc labour", "concrete labour"], 1000);
  const waterRate = getMasterRate(["MAT-WTR-01", "construction water", "water"], 0.05); // Ã¢â€šÂ¹0.05 / Ltr

  const handleResetQuick = () => setQuickInputs(initialQuickInputs);
  const handleResetDetailed = () => setDetailedInputs(initialDetailedInputs);

  // Helper IS 456 RCC Engine
  const calculateRccConcreteAndSteel = (
    slabVolCft: number,
    beamVolCft: number,
    grade: string,
    steelKgOverride?: number
  ) => {
    const totalVolCft = slabVolCft + beamVolCft;
    const totalVolCum = totalVolCft / 35.3147;

    // Nominal Mix Proportions per m3 (IS 456)
    let cemBagsPerCum = 8.07;
    let sandCftPerCum = 14.81;
    let agg20CftPerCum = 17.77;
    let agg12CftPerCum = 11.85;
    let waterLtrPerBag = 25;

    if (grade === "M25") {
      cemBagsPerCum = 11.10;
      sandCftPerCum = 13.60;
      agg20CftPerCum = 16.32;
      agg12CftPerCum = 10.88;
      waterLtrPerBag = 22.5;
    } else if (grade === "M30") {
      cemBagsPerCum = 12.50;
      sandCftPerCum = 12.50;
      agg20CftPerCum = 15.00;
      agg12CftPerCum = 10.00;
      waterLtrPerBag = 20.0;
    }

    const cemBags = totalVolCum * cemBagsPerCum;
    const sandCft = totalVolCum * sandCftPerCum;
    const agg20Cft = totalVolCum * agg20CftPerCum;
    const agg12Cft = totalVolCum * agg12CftPerCum;
    const waterLtr = cemBags * waterLtrPerBag;

    // Quick Mode Steel Override (0.8% - 1.2% density = 7850 kg/m3 * 1% = 78.5 kg/m3)
    const steelKg = steelKgOverride !== undefined ? steelKgOverride : (totalVolCum * 78.5);
    const bindingWireKg = steelKg * 0.015;
    const coverBlocksCount = Math.ceil(slabVolCft / 10.76);

    let unpricedCount = 0;
    const unpricedList: string[] = [];

    if (!cementRate.found) { unpricedCount++; unpricedList.push("Cement (OPC 53)"); }
    if (!steelRate.found) { unpricedCount++; unpricedList.push("TMT Steel Rebar"); }
    if (!sandRate.found) { unpricedCount++; unpricedList.push("M-Sand"); }
    if (!agg20Rate.found) { unpricedCount++; unpricedList.push("20mm Aggregate"); }
    if (!agg12Rate.found) { unpricedCount++; unpricedList.push("12mm Aggregate"); }
    if (!waterRate.found) { unpricedCount++; unpricedList.push("Curing Water"); }
    if (!labourRccRate.found) { unpricedCount++; unpricedList.push("RCC Labour"); }

    const cemCost = cemBags * (cementRate.found ? cementRate.rate : 0);
    const sandCost = sandCft * (sandRate.found ? sandRate.rate : 0);
    const agg20Cost = agg20Cft * (agg20Rate.found ? agg20Rate.rate : 0);
    const agg12Cost = agg12Cft * (agg12Rate.found ? agg12Rate.rate : 0);
    const steelCost = steelKg * (steelRate.found ? steelRate.rate : 0);
    const bindingCost = bindingWireKg * (bindingRate.found ? bindingRate.rate : 0);
    const coverCost = coverBlocksCount * (coverBlockRate.found ? coverBlockRate.rate : 0);
    const waterCost = waterLtr * (waterRate.found ? waterRate.rate : 0);
    const labourCost = totalVolCum * (labourRccRate.found ? labourRccRate.rate : 0);

    const grandMatCost = cemCost + sandCost + agg20Cost + agg12Cost + steelCost + bindingCost + coverCost + waterCost;
    const grandTotal = grandMatCost + labourCost;
    const costPerCft = totalVolCft > 0 ? grandTotal / totalVolCft : 0;

    const resultItems: any[] = [
      {
        code: cementRate.itemCode || "MAT-CEM-01",
        category: "Material",
        description: `Cement OPC 53 Grade (${grade} Mix Design)`,
        unit: "BAG",
        engQty: cemBags,
        procQty: Math.ceil(cemBags),
        rate: cementRate.rate,
        rateFound: cementRate.found,
        amount: cemCost
      },
      {
        code: steelRate.itemCode || "MAT-STL-01",
        category: "Material",
        description: `TMT Steel Reinforcement Rebar (Fe 500D Grade)`,
        unit: "KG",
        engQty: steelKg,
        procQty: Math.ceil(steelKg),
        rate: steelRate.rate,
        rateFound: steelRate.found,
        amount: steelCost
      },
      {
        code: sandRate.itemCode || "MAT-MSND-01",
        category: "Material",
        description: `M-Sand (Washed Concrete Grade)`,
        unit: "CFT",
        engQty: sandCft,
        procQty: Math.ceil(sandCft),
        rate: sandRate.rate,
        rateFound: sandRate.found,
        amount: sandCost
      },
      {
        code: agg20Rate.itemCode || "MAT-AGG-20",
        category: "Material",
        description: `20mm Coarse Aggregate`,
        unit: "CFT",
        engQty: agg20Cft,
        procQty: Math.ceil(agg20Cft),
        rate: agg20Rate.rate,
        rateFound: agg20Rate.found,
        amount: agg20Cost
      },
      {
        code: agg12Rate.itemCode || "MAT-AGG-12",
        category: "Material",
        description: `12mm Coarse Aggregate`,
        unit: "CFT",
        engQty: agg12Cft,
        procQty: Math.ceil(agg12Cft),
        rate: agg12Rate.rate,
        rateFound: agg12Rate.found,
        amount: agg12Cost
      },
      {
        code: bindingRate.itemCode || "MAT-BWR-01",
        category: "Material",
        description: `Annealed Steel Binding Wire`,
        unit: "KG",
        engQty: bindingWireKg,
        procQty: Math.ceil(bindingWireKg),
        rate: bindingRate.rate,
        rateFound: bindingRate.found,
        amount: bindingCost
      },
      {
        code: coverBlockRate.itemCode || "MAT-CVR-01",
        category: "Material",
        description: `High-Density Concrete Cover Blocks (25mm/30mm)`,
        unit: "NOS",
        engQty: coverBlocksCount,
        procQty: coverBlocksCount,
        rate: coverBlockRate.rate,
        rateFound: coverBlockRate.found,
        amount: coverCost
      },
      {
        code: waterRate.itemCode || "MAT-WTR-01",
        category: "Site Utility",
        description: `Curing & Concrete Mixing Water`,
        unit: "LTR",
        engQty: waterLtr,
        procQty: Math.ceil(waterLtr),
        rate: waterRate.rate,
        rateFound: waterRate.found,
        amount: waterCost
      },
      {
        code: labourRccRate.itemCode || "SRV-RCC-LAY",
        category: "Labour",
        description: `RCC Slab & Beam Shuttering, Steel Bending & Concrete Casting Labour`,
        unit: "CUM",
        engQty: totalVolCum,
        procQty: totalVolCum,
        rate: labourRccRate.rate,
        rateFound: labourRccRate.found,
        amount: labourCost
      }
    ];

    return {
      totalVolCft,
      totalVolCum,
      slabVolCft,
      beamVolCft,
      cemBags,
      sandCft,
      agg20Cft,
      agg12Cft,
      steelKg,
      bindingWireKg,
      coverBlocksCount,
      waterLtr,
      grandMatCost,
      grandLabCost: labourCost,
      grandTotal,
      costPerCft,
      resultItems,
      unpricedCount,
      unpricedList
    };
  };

  // 1. QUICK CALCULATION ENGINE
  const quickCalcResults = useMemo(() => {
    const q = quickInputs;
    let slabAreaSqft = 0;

    if (q.inputType === 'Plot Dimensions (L x W x Floors)') {
      slabAreaSqft = q.plotLength * q.plotWidth * q.floors;
    } else {
      slabAreaSqft = q.directSlabArea;
    }

    const slabVolCft = slabAreaSqft * (q.slabThicknessMm / 304.8);
    // Beams add ~12-15% concrete volume in monolithic RCC slab construction
    const beamVolCft = q.includeBeams ? (slabVolCft * 0.12) : 0;

    const totalVolCum = (slabVolCft + beamVolCft) / 35.3147;
    // Steel weight density per IS 456 ~ 7850 kg/m3 * (steelRatio / 100)
    const steelKg = totalVolCum * 7850 * (q.steelRatioPct / 100);

    const res = calculateRccConcreteAndSteel(slabVolCft, beamVolCft, q.concreteGrade, steelKg);

    return {
      ...res,
      slabAreaSqft
    };
  }, [quickInputs, cementRate, steelRate, sandRate, agg20Rate, agg12Rate, waterRate, labourRccRate]);

  // 2. DETAILED STRUCTURAL CALCULATION ENGINE (IS 456 Clause 26)
  const detailedCalcResults = useMemo(() => {
    const d = detailedInputs;
    const Lm = d.length * 0.3048;
    const Wm = d.width * 0.3048;
    const clearLm = Math.max(Lm - (2 * d.coverMm / 1000), 0);
    const clearWm = Math.max(Wm - (2 * d.coverMm / 1000), 0);

    const slabVolCft = d.length * d.width * (d.thicknessMm / 304.8) * d.slabNos;

    let beamVolCft = 0;
    let beamTopKg = 0, beamBottomKg = 0, stirrupKg = 0, stirrupNos = 0;

    if (d.hasBeam) {
      const beamWidthFt = d.beamWidthIn / 12;
      const beamDepthFt = d.beamDepthIn / 12;
      beamVolCft = d.beamNos * d.beamLengthFt * beamWidthFt * beamDepthFt;

      const bLm = d.beamLengthFt * 0.3048;
      const beamLapTopM = (d.lapFactor * d.beamTopDia) / 1000;
      const beamLapBottomM = (d.lapFactor * d.beamBottomDia) / 1000;

      beamTopKg = (bLm + beamLapTopM) * d.beamTopNos * d.beamNos * kgPerM(d.beamTopDia);
      beamBottomKg = (bLm + beamLapBottomM) * d.beamBottomNos * d.beamNos * kgPerM(d.beamBottomDia);

      stirrupNos = (Math.floor((bLm * 1000) / d.stirrupSpacingMm) + 1) * d.beamNos;
      const hookLengthM = d.stirrupHookDeg === 135 ? (10 * d.stirrupDia * 2) / 1000 : (8 * d.stirrupDia * 2) / 1000;
      const beamWidthM = beamWidthFt * 0.3048;
      const beamDepthM = beamDepthFt * 0.3048;
      const stirrupLengthEachM = 2 * Math.max(beamWidthM - (2 * d.coverMm / 1000), 0.05) + 2 * Math.max(beamDepthM - (2 * d.coverMm / 1000), 0.05) + hookLengthM;
      stirrupKg = stirrupNos * stirrupLengthEachM * kgPerM(d.stirrupDia);
    }

    const matMultiplier = d.reinforcementMat === "Double Mat" ? 2 : 1;

    const mainBarsNos = Math.floor((clearWm * 1000) / d.mainSpacing) + 1;
    const distBarsNos = Math.floor((clearLm * 1000) / d.distSpacing) + 1;

    const mainLapM = (d.lapFactor * d.mainDia) / 1000;
    const distLapM = (d.lapFactor * d.distDia) / 1000;
    const crankExtraM = d.provideCrank ? (0.42 * (d.thicknessMm / 1000) * (d.crankBarsPct / 100)) : 0;

    const mainBaseSteelKg = mainBarsNos * clearLm * kgPerM(d.mainDia) * d.slabNos * matMultiplier;
    const mainLapSteelKg = mainBarsNos * mainLapM * kgPerM(d.mainDia) * d.slabNos * matMultiplier;
    const mainCrankSteelKg = mainBarsNos * crankExtraM * kgPerM(d.mainDia) * d.slabNos * matMultiplier;
    const mainSteelKg = mainBaseSteelKg + mainLapSteelKg + mainCrankSteelKg;

    const distBaseSteelKg = distBarsNos * clearWm * kgPerM(d.distDia) * d.slabNos * matMultiplier;
    const distLapSteelKg = distBarsNos * distLapM * kgPerM(d.distDia) * d.slabNos * matMultiplier;
    const distCrankSteelKg = distBarsNos * crankExtraM * kgPerM(d.distDia) * d.slabNos * matMultiplier;
    const distSteelKg = distBaseSteelKg + distLapSteelKg + distCrankSteelKg;

    const chairNos = Math.ceil((Lm * Wm * d.slabNos) / Math.pow(d.chairSpacingMm / 1000, 2));
    const chairHeightM = Math.max((d.thicknessMm - (2 * d.coverMm)) / 1000, 0.05);
    const chairLengthEachM = chairHeightM + 0.6;
    const chairSteelKg = chairNos * chairLengthEachM * kgPerM(d.chairDia);

    const baseSteelKg = mainSteelKg + distSteelKg + chairSteelKg + beamTopKg + beamBottomKg + stirrupKg;
    const totalSteelKg = baseSteelKg * (1 + d.steelWastagePct / 100);

    const res = calculateRccConcreteAndSteel(slabVolCft, beamVolCft, d.grade, totalSteelKg);

    return {
      ...res,
      mainSteelKg,
      distSteelKg,
      chairSteelKg,
      beamTopKg,
      beamBottomKg,
      stirrupKg,
      stirrupNos
    };
  }, [detailedInputs, cementRate, steelRate, sandRate, agg20Rate, agg12Rate, waterRate, labourRccRate]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('calculator_export', 'rcc-slab-calculator', () => {
      const items = calcMode === 'quick' ? quickCalcResults.resultItems : detailedCalcResults.resultItems;
      const data = items.map(item => ({
        "Master Item Code": item.code,
        "Category": item.category,
        "Description": item.description,
        "Unit": item.unit,
        "Engineering Qty": item.engQty,
        "Procurement Qty": item.procQty,
        "Approved Rate (Ã¢â€šÂ¹)": item.rateFound ? item.rate : "Rate Unavailable in Admin Master",
        "Amount (Ã¢â€šÂ¹)": item.rateFound ? item.amount : 0
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RCC_Slab_Beam_Estimation");
      XLSX.writeFile(wb, `BuildMitra_RCC_Slab_Beam_${calcMode}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'rcc-slab-calculator', () => {
      const res = calcMode === 'quick' ? quickCalcResults : detailedCalcResults;
      const msg = `*BuildMitra RCC Slab & Beam Calculator Report*%0A` +
        `*Estimation Mode*: ${calcMode === 'quick' ? 'Quick Calculation' : 'Detailed Structural Calculation'}%0A` +
        `----------------------------------------%0A` +
        `Ã¢â‚¬Â¢ *Total Concrete Volume*: ${formatNumber(res.totalVolCft)} CFT (${formatNumber(res.totalVolCum)} mÃ‚Â³)%0A` +
        `Ã¢â‚¬Â¢ *Cement (50kg OPC 53)*: ${formatNumber(res.cemBags)} Bags%0A` +
        `Ã¢â‚¬Â¢ *TMT Steel Rebar*: ${formatNumber(res.steelKg)} kg%0A` +
        `Ã¢â‚¬Â¢ *M-Sand*: ${formatNumber(res.sandCft)} CFT%0A` +
        `Ã¢â‚¬Â¢ *20mm Aggregate*: ${formatNumber(res.agg20Cft)} CFT%0A` +
        `Ã¢â‚¬Â¢ *Curing Water*: ${formatNumber(res.waterLtr)} Litres%0A` +
        `Ã¢â‚¬Â¢ *Material Total*: ${formatCurrency(res.grandMatCost)}%0A` +
        `Ã¢â‚¬Â¢ *Labour Total*: ${formatCurrency(res.grandLabCost)}%0A` +
        `Ã¢â‚¬Â¢ *TOTAL ESTIMATED COST*: ${formatCurrency(res.grandTotal)} (${formatCurrency(res.costPerCft)}/CFT)%0A%0A` +
        `*Generated via BuildMitra Professional Estimator*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  return (
    <div style={styles.container}>
            <div className="engineering-top-layout">
        <div className="engineering-top-left">
{/* 1. Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => router.push('/calculators')}>Ã¢â€ Â Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          Ã°Å¸â€œÂ RCC Slab & Beam Calculator
          <span style={styles.badge}>IS 456:2000 Compliant</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#e0f2fe' }}>BuildMitra Structural Edition</span>
        </div>
      </div>

      {/* 2. Single Live Market Rate Ticker */}
      <MarketRateTrend />

      {/* 3. Estimation Method Dropdown Selector */}
      <div style={styles.dropdownCard}>
        <label style={styles.dropdownLabel}>Select Estimation Method</label>
        <select
          style={styles.modeSelect}
          value={calcMode}
          onChange={(e) => setCalcMode(e.target.value as 'quick' | 'detailed')}
        >
          <option value="quick">Ã¢Å¡Â¡ Quick Calculation (Estimate from Plot Dimensions L x W x Floors BUA)</option>
          <option value="detailed">Ã°Å¸â€œÂ Detailed Structural Calculation (Exact Reinforcement & Beam Schedule)</option>
        </select>
      </div>
        </div>
        <div className="engineering-specimen-top">
      <EngineeringSpecimen kind="slab" title="Dynamic RCC Slab Specimen" material={calcMode === 'quick' ? quickInputs.concreteGrade : detailedInputs.grade} data={calcMode === 'quick' ? { lengthFt: quickInputs.plotLength, widthFt: quickInputs.plotWidth, depthIn: quickInputs.slabThicknessMm / 25.4, grade: quickInputs.concreteGrade, mainDia: quickInputs.mainDia, distDia: quickInputs.distDia, mainSpacingMm: quickInputs.mainSpacingMm, distSpacingMm: quickInputs.distSpacingMm, coverMm: quickInputs.coverMm, showSteel: true } : { lengthFt: detailedInputs.length, widthFt: detailedInputs.width, depthIn: detailedInputs.thicknessMm / 25.4, grade: detailedInputs.grade, mainDia: detailedInputs.mainDia, distDia: detailedInputs.distDia, mainSpacingMm: detailedInputs.mainSpacingMm, distSpacingMm: detailedInputs.distSpacingMm, coverMm: detailedInputs.coverMm, showSteel: true }} />
        </div>
      </div>
      <style jsx>{`
        .engineering-top-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          gap: 16px;
          align-items: start;
          margin-bottom: 18px;
        }
        .engineering-top-left { min-width: 0; overflow: hidden; }
        .engineering-specimen-top {
          width: 260px;
          position: sticky;
          top: 12px;
          align-self: start;
          z-index: 2;
        }
        @media (max-width: 900px) {
          .engineering-top-layout { grid-template-columns: 1fr; }
          .engineering-specimen-top {
            width: 100%; max-width: 260px; position: static;
            margin-left: auto; margin-right: auto;
          }
        }
      `}</style>

      {/* ========================================================= */}
      {/* 4. QUICK CALCULATION MODE */}
      {/* ========================================================= */}
      {calcMode === 'quick' && (
        <>
          <div style={styles.stepperCard}>
            <div style={styles.sectionHeader}>
              <span>Ã¢Å¡Â¡ Quick Calculation (Plot Dimensions & Slab Thickness Rule)</span>
            </div>

            <div style={styles.noteBox}>
              Ã°Å¸â€™Â¡ <strong>IS 456 Structural Standard</strong>: Concrete Volume = Built-Up Area x Slab Thickness + Monolithic Beam Volume Allowance (~12%). Steel Rebar density = 1.0% volume ratio.
            </div>

            <div style={styles.grid3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Input Calculation Method</label>
                <select
                  style={{ ...styles.select, border: '2px solid #1e3a8a', backgroundColor: '#eff6ff', fontWeight: '700' }}
                  value={quickInputs.inputType}
                  onChange={e => setQuickInputs({ ...quickInputs, inputType: e.target.value })}
                >
                  <option value="Plot Dimensions (L x W x Floors)">Plot Dimensions (Length x Width x Floors)</option>
                  <option value="Direct Slab Area">Direct Slab Area (Sqft)</option>
                </select>
              </div>

              {quickInputs.inputType === 'Plot Dimensions (L x W x Floors)' ? (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Plot Length (Ft)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={quickInputs.plotLength}
                      onChange={e => setQuickInputs({ ...quickInputs, plotLength: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Plot Width (Ft)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={quickInputs.plotWidth}
                      onChange={e => setQuickInputs({ ...quickInputs, plotWidth: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Number of Floors (Nos)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={quickInputs.floors}
                      onChange={e => setQuickInputs({ ...quickInputs, floors: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                </>
              ) : (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Direct Slab Area (Sqft)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={quickInputs.directSlabArea}
                    onChange={e => setQuickInputs({ ...quickInputs, directSlabArea: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>

            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Slab Thickness (mm)</label>
                <select
                  style={{ ...styles.select, border: '2px solid #1e3a8a', fontWeight: '700' }}
                  value={quickInputs.slabThicknessMm}
                  onChange={e => setQuickInputs({ ...quickInputs, slabThicknessMm: parseInt(e.target.value) || 150 })}
                >
                  <option value={125}>125 mm (5 Inches Standard Residential)</option>
                  <option value={150}>150 mm (6 Inches Heavy Slab)</option>
                  <option value={175}>175 mm (7 Inches Commercial Slab)</option>
                  <option value={100}>100 mm (4 Inches Light Roof)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Concrete Grade (IS 456)</label>
                <select
                  style={styles.select}
                  value={quickInputs.concreteGrade}
                  onChange={e => setQuickInputs({ ...quickInputs, concreteGrade: e.target.value })}
                >
                  <option value="M20">M20 (1 : 1.5 : 3 Nominal Mix)</option>
                  <option value="M25">M25 (1 : 1 : 2 Standard RCC)</option>
                  <option value="M30">M30 (Design Mix High Strength)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Include Monolithic Beams</label>
                <select
                  style={styles.select}
                  value={quickInputs.includeBeams ? "Yes" : "No"}
                  onChange={e => setQuickInputs({ ...quickInputs, includeBeams: e.target.value === "Yes" })}
                >
                  <option value="Yes">Yes (+12% Beam Volume Allowance)</option>
                  <option value="No">No (Slab Only)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Steel Volume Ratio (%)</label>
                <select
                  style={styles.select}
                  value={quickInputs.steelRatioPct}
                  onChange={e => setQuickInputs({ ...quickInputs, steelRatioPct: parseFloat(e.target.value) || 1.0 })}
                >
                  <option value={0.8}>0.8% (Light Slab Steel)</option>
                  <option value={1.0}>1.0% (Standard Slab + Beam Steel)</option>
                  <option value={1.2}>1.2% (Heavy Structural Steel)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button style={styles.btnReset} onClick={handleResetQuick}>Ã°Å¸â€â€ž Reset Quick Form</button>
            </div>
          </div>

          {/* Quick Results Summary & BOQ */}
          <div style={styles.stepperCard}>
            <div style={styles.sectionHeader}>
              <span>Ã°Å¸â€œÅ  RCC Slab & Beam Calculation Results & Materials BOQ</span>
            </div>

            {quickCalcResults.unpricedCount > 0 ? (
              <div style={styles.warnBanner}>
                Ã¢Å¡Â Ã¯Â¸Â Partial Estimate: Admin Master Rates unavailable for: {quickCalcResults.unpricedList.join(', ')}.
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '700' }}>
                Ã¢Å“â€œ Complete Estimate: All rates verified against BuildMitra Admin Master Database.
              </div>
            )}

            {/* Summary Metric Cards */}
            <div style={styles.summaryGrid}>
              <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                <span style={styles.metricTitle}>Total Concrete Volume</span>
                <span style={styles.metricVal}>{formatNumber(quickCalcResults.totalVolCft)} CFT</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatNumber(quickCalcResults.totalVolCum)} mÃ‚Â³)</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Cement & Steel</span>
                <span style={styles.metricVal}>{formatNumber(quickCalcResults.cemBags, 1)} Bags | {formatNumber(quickCalcResults.steelKg, 1)} kg</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                <span style={styles.metricTitle}>Sand & Aggregate</span>
                <span style={styles.metricVal}>{formatNumber(quickCalcResults.sandCft, 1)} CFT Sand | {formatNumber(quickCalcResults.agg20Cft, 1)} CFT 20mm</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                <span style={styles.metricTitle}>Grand Total</span>
                <span style={styles.metricVal}>{formatCurrency(quickCalcResults.grandTotal)}</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(quickCalcResults.costPerCft)} / CFT)</span>
              </div>
            </div>

            {/* BOQ Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Master Code</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Item Description</th>
                    <th style={styles.th}>Unit</th>
                    <th style={styles.th}>Eng Qty</th>
                    <th style={styles.th}>Proc Qty</th>
                    <th style={styles.th}>Approved Rate</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quickCalcResults.resultItems.map((item, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}><code>{item.code}</code></td>
                      <td style={styles.td}>
                        <span style={{
                          backgroundColor: item.category === 'Material' ? '#e0f2fe' : '#ffedd5',
                          color: item.category === 'Material' ? '#0369a1' : '#c2410c',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '10px'
                        }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={styles.td}><strong>{item.description}</strong></td>
                      <td style={styles.td}>{item.unit}</td>
                      <td style={styles.td}>{formatNumber(item.engQty)}</td>
                      <td style={styles.td}><strong>{formatNumber(item.procQty)}</strong></td>
                      <td style={styles.td}>
                        {item.rateFound ? (
                          <span style={styles.rateTag}>{formatCurrency(item.rate)}</span>
                        ) : (
                          <span style={styles.rateTagWarn}>Rate Unavailable</span>
                        )}
                      </td>
                      <td style={styles.td}><strong>{formatCurrency(item.amount)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button style={styles.btnSecondary} onClick={handleExportExcel}>Ã°Å¸â€œÂ¥ Export BOQ to Excel</button>
              <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>Ã°Å¸â€œÂ² Share Estimate on WhatsApp</button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 5. DETAILED STRUCTURAL CALCULATION MODE */}
      {/* ========================================================= */}
      {calcMode === 'detailed' && (
        <div style={styles.stepperCard}>
          <div style={styles.sectionHeader}>
            <span>Ã°Å¸â€œÂ Detailed Structural RCC Calculation Inputs (IS 456 Bar Bending & Beam Schedule)</span>
          </div>

          <div style={styles.grid4}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Slab Length (Ft)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.length}
                onChange={e => setDetailedInputs({ ...detailedInputs, length: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Slab Width (Ft)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.width}
                onChange={e => setDetailedInputs({ ...detailedInputs, width: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Slab Thickness (mm)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.thicknessMm}
                onChange={e => setDetailedInputs({ ...detailedInputs, thicknessMm: parseFloat(e.target.value) || 150 })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Concrete Grade</label>
              <select
                style={styles.select}
                value={detailedInputs.grade}
                onChange={e => setDetailedInputs({ ...detailedInputs, grade: e.target.value })}
              >
                <option value="M20">M20 (1 : 1.5 : 3)</option>
                <option value="M25">M25 (1 : 1 : 2)</option>
                <option value="M30">M30 (Design Mix)</option>
              </select>
            </div>
          </div>

          {/* Slab Reinforcement Sub-section */}
          <div style={{ backgroundColor: '#f1f5f9', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a', marginBottom: '10px' }}>Ã°Å¸â€â€ž Slab Reinforcement Details (IS 456 Reinforcement Schedule)</div>

            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Reinforcement Mat</label>
                <select style={styles.select} value={detailedInputs.reinforcementMat} onChange={e => setDetailedInputs({ ...detailedInputs, reinforcementMat: e.target.value })}>
                  <option value="Single Mat">Single Mat</option>
                  <option value="Double Mat">Double Mat</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Provide Crank Bars</label>
                <select style={styles.select} value={detailedInputs.provideCrank ? "Yes" : "No"} onChange={e => setDetailedInputs({ ...detailedInputs, provideCrank: e.target.value === "Yes" })}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Main Bar Dia (mm)</label>
                <input type="number" style={styles.input} value={detailedInputs.mainDia} onChange={e => setDetailedInputs({ ...detailedInputs, mainDia: parseFloat(e.target.value) || 8 })} />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Main Bar Spacing (mm)</label>
                <input type="number" style={styles.input} value={detailedInputs.mainSpacing} onChange={e => setDetailedInputs({ ...detailedInputs, mainSpacing: parseFloat(e.target.value) || 150 })} />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Dist Bar Dia (mm)</label>
                <input type="number" style={styles.input} value={detailedInputs.distDia} onChange={e => setDetailedInputs({ ...detailedInputs, distDia: parseFloat(e.target.value) || 10 })} />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Dist Bar Spacing (mm)</label>
                <input type="number" style={styles.input} value={detailedInputs.distSpacing} onChange={e => setDetailedInputs({ ...detailedInputs, distSpacing: parseFloat(e.target.value) || 150 })} />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Clear Cover (mm)</label>
                <input type="number" style={styles.input} value={detailedInputs.coverMm} onChange={e => setDetailedInputs({ ...detailedInputs, coverMm: parseFloat(e.target.value) || 25 })} />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Steel Wastage (%)</label>
                <input type="number" style={styles.input} value={detailedInputs.steelWastagePct} onChange={e => setDetailedInputs({ ...detailedInputs, steelWastagePct: parseFloat(e.target.value) || 3 })} />
              </div>
            </div>
          </div>

          {/* Beam Details Sub-section */}
          <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a' }}>Ã°Å¸â€œÅ  Beam Structural Schedule (IS 456 Beam Design)</div>
              <button
                style={{ ...styles.btnPrimary, backgroundColor: detailedInputs.hasBeam ? '#ef4444' : '#16a34a' }}
                onClick={() => setDetailedInputs({ ...detailedInputs, hasBeam: !detailedInputs.hasBeam })}
              >
                {detailedInputs.hasBeam ? "Ã¢ÂÅ’ Exclude Beams" : "Ã¢Å“â€¦ Include Beams"}
              </button>
            </div>

            {detailedInputs.hasBeam && (
              <div style={styles.grid4}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Beam Length (Ft)</label>
                  <input type="number" style={styles.input} value={detailedInputs.beamLengthFt} onChange={e => setDetailedInputs({ ...detailedInputs, beamLengthFt: parseFloat(e.target.value) || 0 })} />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Beam Width (Inches)</label>
                  <input type="number" style={styles.input} value={detailedInputs.beamWidthIn} onChange={e => setDetailedInputs({ ...detailedInputs, beamWidthIn: parseFloat(e.target.value) || 9 })} />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Beam Depth (Inches)</label>
                  <input type="number" style={styles.input} value={detailedInputs.beamDepthIn} onChange={e => setDetailedInputs({ ...detailedInputs, beamDepthIn: parseFloat(e.target.value) || 12 })} />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Number of Beams (Nos)</label>
                  <input type="number" style={styles.input} value={detailedInputs.beamNos} onChange={e => setDetailedInputs({ ...detailedInputs, beamNos: parseInt(e.target.value) || 1 })} />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Top Bar Dia (mm)</label>
                  <input type="number" style={styles.input} value={detailedInputs.beamTopDia} onChange={e => setDetailedInputs({ ...detailedInputs, beamTopDia: parseFloat(e.target.value) || 16 })} />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Top Bar Count (Nos)</label>
                  <input type="number" style={styles.input} value={detailedInputs.beamTopNos} onChange={e => setDetailedInputs({ ...detailedInputs, beamTopNos: parseInt(e.target.value) || 2 })} />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Bottom Bar Dia (mm)</label>
                  <input type="number" style={styles.input} value={detailedInputs.beamBottomDia} onChange={e => setDetailedInputs({ ...detailedInputs, beamBottomDia: parseFloat(e.target.value) || 12 })} />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Bottom Bar Count (Nos)</label>
                  <input type="number" style={styles.input} value={detailedInputs.beamBottomNos} onChange={e => setDetailedInputs({ ...detailedInputs, beamBottomNos: parseInt(e.target.value) || 3 })} />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Stirrup Dia (mm)</label>
                  <input type="number" style={styles.input} value={detailedInputs.stirrupDia} onChange={e => setDetailedInputs({ ...detailedInputs, stirrupDia: parseFloat(e.target.value) || 8 })} />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Stirrup Spacing (mm)</label>
                  <input type="number" style={styles.input} value={detailedInputs.stirrupSpacingMm} onChange={e => setDetailedInputs({ ...detailedInputs, stirrupSpacingMm: parseFloat(e.target.value) || 150 })} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button style={styles.btnReset} onClick={handleResetDetailed}>Ã°Å¸â€â€ž Reset Detailed Form</button>
          </div>

          {/* DETAILED RESULTS TABLE */}
          <div style={{ marginTop: '16px' }}>
            <div style={styles.sectionHeader}>
              <span>Ã°Å¸â€œÅ  Detailed Structural RCC Calculation Results & Materials BOQ</span>
            </div>

            {detailedCalcResults.unpricedCount > 0 ? (
              <div style={styles.warnBanner}>
                Ã¢Å¡Â Ã¯Â¸Â Partial Estimate: Admin Master Rates unavailable for: {detailedCalcResults.unpricedList.join(', ')}.
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '700' }}>
                Ã¢Å“â€œ Complete Estimate: All rates verified against BuildMitra Admin Master Database.
              </div>
            )}

            <div style={styles.summaryGrid}>
              <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                <span style={styles.metricTitle}>Total Concrete Volume</span>
                <span style={styles.metricVal}>{formatNumber(detailedCalcResults.totalVolCft)} CFT</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatNumber(detailedCalcResults.totalVolCum)} mÃ‚Â³)</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Cement & Steel</span>
                <span style={styles.metricVal}>{formatNumber(detailedCalcResults.cemBags, 1)} Bags | {formatNumber(detailedCalcResults.steelKg, 1)} kg</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                <span style={styles.metricTitle}>Sand & Aggregate</span>
                <span style={styles.metricVal}>{formatNumber(detailedCalcResults.sandCft, 1)} CFT Sand | {formatNumber(detailedCalcResults.agg20Cft, 1)} CFT 20mm</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                <span style={styles.metricTitle}>Grand Total</span>
                <span style={styles.metricVal}>{formatCurrency(detailedCalcResults.grandTotal)}</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(detailedCalcResults.costPerCft)} / CFT)</span>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Master Code</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Item Description</th>
                    <th style={styles.th}>Unit</th>
                    <th style={styles.th}>Eng Qty</th>
                    <th style={styles.th}>Proc Qty</th>
                    <th style={styles.th}>Approved Rate</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedCalcResults.resultItems.map((item, i) => (
                    <tr key={i}>
                      <td style={styles.td}><code>{item.code}</code></td>
                      <td style={styles.td}>
                        <span style={{
                          backgroundColor: item.category === 'Material' ? '#e0f2fe' : '#ffedd5',
                          color: item.category === 'Material' ? '#0369a1' : '#c2410c',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '10px'
                        }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={styles.td}><strong>{item.description}</strong></td>
                      <td style={styles.td}>{item.unit}</td>
                      <td style={styles.td}>{formatNumber(item.engQty)}</td>
                      <td style={styles.td}><strong>{formatNumber(item.procQty)}</strong></td>
                      <td style={styles.td}>
                        {item.rateFound ? (
                          <span style={styles.rateTag}>{formatCurrency(item.rate)}</span>
                        ) : (
                          <span style={styles.rateTagWarn}>Rate Unavailable</span>
                        )}
                      </td>
                      <td style={styles.td}><strong>{formatCurrency(item.amount)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button style={styles.btnSecondary} onClick={handleExportExcel}>Ã°Å¸â€œÂ¥ Export BOQ to Excel</button>
              <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>Ã°Å¸â€œÂ² Share Estimate on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
