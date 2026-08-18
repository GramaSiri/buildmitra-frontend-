import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../utils/pdfExport';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import EngineeringSpecimen from '../components/engineering/EngineeringSpecimen';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' },
  header: { maxWidth: '100%', margin: '0 0 8px 0', padding: '6px 10px', borderRadius: '6px' },
  headerTitle: { margin: 0, fontSize: '16px', lineHeight: '1.15', fontWeight: '800', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' },
  badge: { padding: '2px 6px', borderRadius: '10px', fontSize: '9px', lineHeight: '1.1', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  dropdowncard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  dropdownlabel: { display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  modeselect: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '11px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },

  steppercard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  sectionheader: { maxWidth: '100%', margin: '0 0 8px 0', padding: '6px 10px', borderRadius: '6px' },

  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(78px, 1fr))', gap: '5px', alignItems: 'end', width: '100%', maxWidth: '100%', marginBottom: '5px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(78px, 1fr))', gap: '5px', alignItems: 'end', width: '100%', maxWidth: '100%', marginBottom: '5px' },

  fieldGroup: { minWidth: 0, width: '100%', margin: 0, padding: 0 },
  label: { display: 'block', fontSize: '10px', lineHeight: '1.1', fontWeight: '700', marginBottom: '2px', whiteSpace: 'normal' },
  input: { width: '100%', minWidth: 0, maxWidth: '100%', height: '32px', padding: '3px 5px', fontSize: '12px', lineHeight: '1.1', textAlign: 'center', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
  select: { width: '100%', minWidth: 0, maxWidth: '100%', height: '32px', padding: '3px 4px', fontSize: '11px', lineHeight: '1.1', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box', overflow: 'hidden', textOverflow: 'ellipsis' },

  btnPrimary: { backgroundColor: '#800020', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '6px', width: '100%', maxWidth: '100%', overflowX: 'scroll', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x', overscrollBehaviorX: 'contain', scrollSnapType: 'x proximity', scrollbarWidth: 'thin', padding: '3px 2px 8px', margin: '3px 0 6px' },
  metricCard: { flex: '0 0 138px', width: '138px', minWidth: '138px', maxWidth: '150px', minHeight: '68px', height: 'auto', padding: '6px', margin: 0, borderRadius: '7px', boxSizing: 'border-box', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', scrollSnapAlign: 'start' },
  metricMaroon: { backgroundColor: '#800020' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '10px', lineHeight: '1.1', textTransform: 'uppercase', opacity: 0.95, fontWeight: '700', whiteSpace: 'normal', marginBottom: '2px' },
  metricVal: { fontSize: '15px', lineHeight: '1.15', fontWeight: '800', marginTop: '2px', whiteSpace: 'normal', overflowWrap: 'anywhere' },

  tablecontainer: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' },
  table: { width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '10px' },
  th: { padding: '3px 4px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#f1f5f9', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  td: { padding: '3px 4px', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  rateTag: { backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },
  rateTagWarn: { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '600' },
  noteBox: { backgroundColor: '#fff5f7', border: '1px solid #fecdd3', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#800020', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "Rate Unavailable in Admin Master";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export default function FootingCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Scope Option: 'both' vs 'concrete_only' vs 'steel_only'
  const [scopeOption, setScopeOption] = useState<'both' | 'concrete_only' | 'steel_only'>('both');

  // DETAILED FOOTING INPUTS
  const initialInputs = {
    footingNos: 4,      // Number of footings
    lengthFt: 5,        // Length in feet
    widthFt: 5,         // Width in feet
    depthFt: 1.5,       // RCC depth in feet
    excDepthFt: 4,      // Pit excavation depth in feet
    workSpaceFt: 1,     // Working space around pit in feet
    pccThickMm: 100,    // PCC thickness in mm
    pccProjIn: 6,       // PCC bed projection in inches
    grade: 'M20',       // Concrete grade: M20, M25, M30

    // Reinforcement Mesh Mat
    mainDia: 12,        // Main bar dia in mm
    mainSpacingMm: 150, // Main bar spacing in mm
    distDia: 12,        // Dist bar dia in mm
    distSpacingMm: 150, // Dist bar spacing in mm
    coverMm: 50,        // Clear cover in mm (50mm for footing)
    bendLengthMm: 300   // L-bend length in mm
  };

  const [inputs, setInputs] = useState(initialInputs);

  // Admin Rate (₹)s Lookup
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53", "opc"], 385);
  const steelRate = getMasterRate(["MAT-STL-01", "tmt steel", "steel", "rebar"], 68);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 46);
  const ca20Rate = getMasterRate(["MAT-AGG-20", "20mm aggregate", "aggregate"], 40);
  const ca12Rate = getMasterRate(["MAT-AGG-12", "12mm aggregate"], 42);
  const wireRate = getMasterRate(["MAT-BWR-01", "binding wire"], 80);
  const coverRate = getMasterRate(["MAT-CVR-01", "cover block"], 5);
  const waterRate = getMasterRate(["MAT-WTR-01", "construction water", "water"], 0.05);
  const excRate = getMasterRate(["SRV-EXC-01", "excavation", "earthwork"], 80);
  const shutteringRate = getMasterRate(["SRV-FTG-SHT", "footing shuttering", "formwork"], 35);
  const rccLabourRate = getMasterRate(["SRV-RCC-LAY", "rcc labour", "footing labour"], 1000);

  const handleReset = () => setInputs(initialInputs);

  // IS 456 Structural Footing Engine
  const calcResults = useMemo(() => {
    const hasConcrete = scopeOption === 'both' || scopeOption === 'concrete_only';
    const hasSteel = scopeOption === 'both' || scopeOption === 'steel_only';

    // 1. Earthwork Pit Excavation
    const pitLengthFt = inputs.lengthFt + 2 * inputs.workSpaceFt;
    const pitWidthFt = inputs.widthFt + 2 * inputs.workSpaceFt;
    const excVolCft = inputs.footingNos * pitLengthFt * pitWidthFt * inputs.excDepthFt;
    const excVolCum = excVolCft / 35.3147;

    // 2. PCC Bed Volume (1:4:8)
    const pccLengthFt = inputs.lengthFt + 2 * (inputs.pccProjIn / 12);
    const pccWidthFt = inputs.widthFt + 2 * (inputs.pccProjIn / 12);
    const pccVolCft = inputs.footingNos * pccLengthFt * pccWidthFt * (inputs.pccThickMm / 304.8);
    const pccVolCum = pccVolCft / 35.3147;
    const pccCementBags = hasConcrete ? (pccVolCum * 3.40) : 0;

    // 3. RCC Footing Volume
    const rccVolCft = inputs.footingNos * inputs.lengthFt * inputs.widthFt * inputs.depthFt;
    const rccVolCum = rccVolCft / 35.3147;

    // Concrete Mix Ingredients Proportions
    let cementFactor = 8.07;
    let mSandFactor = 14.81;
    let ca20Factor = 17.77;
    let ca12Factor = 11.85;

    if (inputs.grade === 'M25') {
      cementFactor = 11.10;
      mSandFactor = 13.60;
      ca20Factor = 16.32;
      ca12Factor = 10.88;
    } else if (inputs.grade === 'M30') {
      cementFactor = 12.50;
      mSandFactor = 12.80;
      ca20Factor = 15.36;
      ca12Factor = 10.24;
    }

    const rccCementBags = hasConcrete ? (rccVolCum * cementFactor) : 0;
    const totalCementBags = pccCementBags + rccCementBags;
    const mSandCft = hasConcrete ? (rccVolCum * mSandFactor + pccVolCum * 14.0) : 0;
    const ca20Cft = hasConcrete ? (rccVolCum * ca20Factor) : 0;
    const ca12Cft = hasConcrete ? (rccVolCum * ca12Factor) : 0;

    // 4. Reinforcement Steel (Mesh Mat)
    const mainBarLenM = (inputs.lengthFt * 0.3048 - 2 * (inputs.coverMm / 1000)) + 2 * (inputs.bendLengthMm / 1000);
    const mainBarCount = Math.ceil((inputs.widthFt * 304.8 - 2 * inputs.coverMm) / inputs.mainSpacingMm) + 1;
    const totalMainWeightKg = hasSteel ? (inputs.footingNos * mainBarCount * mainBarLenM * ((inputs.mainDia * inputs.mainDia) / 162.2)) : 0;

    const distBarLenM = (inputs.widthFt * 0.3048 - 2 * (inputs.coverMm / 1000)) + 2 * (inputs.bendLengthMm / 1000);
    const distBarCount = Math.ceil((inputs.lengthFt * 304.8 - 2 * inputs.coverMm) / inputs.distSpacingMm) + 1;
    const totalDistWeightKg = hasSteel ? (inputs.footingNos * distBarCount * distBarLenM * ((inputs.distDia * inputs.distDia) / 162.2)) : 0;

    const totalSteelKg = totalMainWeightKg + totalDistWeightKg;
    const bindingWireKg = hasSteel ? (totalSteelKg * 0.015) : 0;
    const coverBlockNos = hasSteel ? (inputs.footingNos * 4) : 0;
    const waterLtr = hasConcrete ? (totalCementBags * 25) : 0;

    // 5. Footing Formwork Shuttering Area (4 sides)
    const shutteringAreaSqft = hasConcrete ? (2 * (inputs.lengthFt + inputs.widthFt) * inputs.depthFt * inputs.footingNos) : 0;

    // Cost Breakdown
    const cementCost = totalCementBags * (cementRate.found ? cementRate.rate : 385);
    const steelCost = totalSteelKg * (steelRate.found ? steelRate.rate : 68);
    const sandCost = mSandCft * (sandRate.found ? sandRate.rate : 46);
    const ca20Cost = ca20Cft * (ca20Rate.found ? ca20Rate.rate : 40);
    const ca12Cost = ca12Cft * (ca12Rate.found ? ca12Rate.rate : 42);
    const wireCost = bindingWireKg * (wireRate.found ? wireRate.rate : 80);
    const coverCost = coverBlockNos * (coverRate.found ? coverRate.rate : 5);
    const waterCost = waterLtr * (waterRate.found ? waterRate.rate : 0.05);
    const excCost = excVolCum * (excRate.found ? excRate.rate : 80);
    const shutteringCost = shutteringAreaSqft * (shutteringRate.found ? shutteringRate.rate : 35);

    const labourRatePerCum = (hasConcrete && hasSteel) ? 1000 : hasConcrete ? 600 : 400;
    const rccLabourCost = rccVolCum * labourRatePerCum;

    const grandMatCost = cementCost + steelCost + sandCost + ca20Cost + ca12Cost + wireCost + coverCost + waterCost + shutteringCost + excCost;
    const grandTotal = grandMatCost + rccLabourCost;
    const costPerCft = rccVolCft > 0 ? grandTotal / rccVolCft : 0;

    const resultItems: any[] = [];

    if (hasConcrete) {
      resultItems.push(
        { code: excRate.itemCode || "SRV-EXC-01", category: "Earthwork", description: `Earthwork Pit Excavation for ${inputs.footingNos} Footing Pits`, unit: "CUM", engQty: excVolCum, procQty: excVolCum, rate: excRate.rate, rateFound: excRate.found, amount: excCost },
        { code: cementRate.itemCode || "MAT-CEM-01", category: "Material", description: `Cement OPC 53 Grade (PCC Bed + RCC ${inputs.grade})`, unit: "BAG", engQty: totalCementBags, procQty: Math.ceil(totalCementBags), rate: cementRate.rate, rateFound: cementRate.found, amount: cementCost },
        { code: sandRate.itemCode || "MAT-MSND-01", category: "Material", description: `M-Sand for PCC & Concrete Mix`, unit: "CFT", engQty: mSandCft, procQty: Math.ceil(mSandCft), rate: sandRate.rate, rateFound: sandRate.found, amount: sandCost },
        { code: ca20Rate.itemCode || "MAT-AGG-20", category: "Material", description: `20mm Coarse Aggregate`, unit: "CFT", engQty: ca20Cft, procQty: Math.ceil(ca20Cft), rate: ca20Rate.rate, rateFound: ca20Rate.found, amount: ca20Cost },
        { code: ca12Rate.itemCode || "MAT-AGG-12", category: "Material", description: `12mm Coarse Aggregate`, unit: "CFT", engQty: ca12Cft, procQty: Math.ceil(ca12Cft), rate: ca12Rate.rate, rateFound: ca12Rate.found, amount: ca12Cost },
        { code: waterRate.itemCode || "MAT-WTR-01", category: "Site Utility", description: `Construction Water for Curing & Concrete`, unit: "LTR", engQty: waterLtr, procQty: Math.ceil(waterLtr), rate: waterRate.rate, rateFound: waterRate.found, amount: waterCost },
        { code: shutteringRate.itemCode || "SRV-FTG-SHT", category: "Formwork", description: `Footing Steel/Ply Formwork Shuttering Rental & Fixing Charges`, unit: "SQFT", engQty: shutteringAreaSqft, procQty: Math.ceil(shutteringAreaSqft), rate: shutteringRate.rate, rateFound: shutteringRate.found, amount: shutteringCost }
      );
    }

    if (hasSteel) {
      resultItems.push(
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - ${inputs.mainDia}mm Main Rebar (${mainBarCount} nos x ${inputs.footingNos} footings)`, unit: "KG", engQty: totalMainWeightKg, procQty: Math.ceil(totalMainWeightKg), rate: steelRate.rate, rateFound: steelRate.found, amount: totalMainWeightKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - ${inputs.distDia}mm Distribution Rebar (${distBarCount} nos x ${inputs.footingNos} footings)`, unit: "KG", engQty: totalDistWeightKg, procQty: Math.ceil(totalDistWeightKg), rate: steelRate.rate, rateFound: steelRate.found, amount: totalDistWeightKg * steelRate.rate },
        { code: wireRate.itemCode || "MAT-BWR-01", category: "Material", description: `Steel Binding Wire (1.5% of steel)`, unit: "KG", engQty: bindingWireKg, procQty: Math.ceil(bindingWireKg), rate: wireRate.rate, rateFound: wireRate.found, amount: wireCost },
        { code: coverRate.itemCode || "MAT-CVR-01", category: "Material", description: `Heavy Duty Footing Concrete Cover Blocks (50mm)`, unit: "NOS", engQty: coverBlockNos, procQty: coverBlockNos, rate: coverRate.rate, rateFound: coverRate.found, amount: coverCost }
      );
    }

    resultItems.push({
      code: rccLabourRate.itemCode || "SRV-RCC-LAY",
      category: "Labour",
      description: `Footing ${scopeOption === 'both' ? 'Concrete Casting & Mesh Tying' : scopeOption === 'concrete_only' ? 'Concrete Casting & Shuttering' : 'Mesh Bar Bending & Steel Tying'} Labour`,
      unit: "CUM",
      engQty: rccVolCum,
      procQty: rccVolCum,
      rate: labourRatePerCum,
      rateFound: rccLabourRate.found,
      amount: rccLabourCost
    });

    return {
      hasConcrete,
      hasSteel,
      excVolCft,
      excVolCum,
      pccVolCft,
      pccVolCum,
      rccVolCum,
      rccVolCft,
      totalCementBags,
      totalSteelKg,
      totalMainWeightKg,
      totalDistWeightKg,
      mainBarCount,
      distBarCount,
      mSandCft,
      ca20Cft,
      ca12Cft,
      bindingWireKg,
      coverBlockNos,
      waterLtr,
      shutteringAreaSqft,
      grandMatCost,
      rccLabourCost,
      grandTotal,
      costPerCft,
      resultItems
    };
  }, [inputs, scopeOption, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, wireRate, coverRate, waterRate, excRate, shutteringRate, rccLabourRate]);

  // Download PDF
  const handleDownloadPDF = () => {
    checkAndRun('calculator_export', 'footing-calculator', () => {
      downloadBuildMitraPDF({
        documentTitle: `BuildMitra Footing Structural Estimate (${scopeOption})`,
        items: calcResults.resultItems.map((item: any, idx: number) => ({
          sno: idx + 1,
          description: `[${item.category}] ${item.description}`,
          quantity: item.procQty,
          unit: item.unit,
          rate: item.rateFound ? item.rate : 0,
          amount: item.rateFound ? item.amount : 0
        })),
        grandTotal: calcResults.grandTotal
      });
    });
  };

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('calculator_export', 'footing-calculator', () => {
      const data = calcResults.resultItems.map(item => ({
        "Master Item Code": item.code,
        "Category": item.category,
        "Description": item.description,
        "Unit": item.unit,
        "Engineering Qty": item.engQty,
        "Procurement Qty": item.procQty,
        "Approved Rate (₹)": item.rateFound ? item.rate : "Rate Unavailable in Admin Master",
        "Amount (₹)": item.rateFound ? item.amount : 0
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Footing_Structural_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Footing_Estimate_${scopeOption}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'footing-calculator', () => {
      const msg = `*BuildMitra RCC Footing Structural Report*%0A` +
        `*Scope Option*: ${scopeOption === 'both' ? 'Both Concrete & Steel' : scopeOption === 'concrete_only' ? 'Only Concrete, PCC & Shuttering' : 'Only Steel Mesh Mat'}%0A` +
        `----------------------------------------%0A` +
        `• *Footings*: ${inputs.footingNos} Nos (${inputs.lengthFt}'x${inputs.widthFt}' x ${inputs.depthFt}ft - ${inputs.grade})%0A` +
        `• *Excavation Volume*: ${formatNumber(calcResults.excVolCum)} CUM | *PCC Volume*: ${formatNumber(calcResults.pccVolCum)} CUM%0A` +
        `• *RCC Con. Vol*: ${formatNumber(calcResults.rccVolCft)} CFT (${formatNumber(calcResults.rccVolCum, 3)} CUM)%0A` +
        (calcResults.hasConcrete ? `• *Cement*: ${formatNumber(calcResults.totalCementBags)} Bags | *Shuttering*: ${formatNumber(calcResults.shutteringAreaSqft)} Sqft%0A` : '') +
        (calcResults.hasSteel ? `• *Steel Rebar*: ${formatNumber(calcResults.totalSteelKg)} kg (${inputs.mainDia}mm Main + ${inputs.distDia}mm Dist)%0A` : '') +
        `• *Material & Formwork Total*: ${formatCurrency(calcResults.grandMatCost)}%0A` +
        `• *Labour Total*: ${formatCurrency(calcResults.rccLabourCost)}%0A` +
        `• *TOTAL ESTIMATED COST*: ${formatCurrency(calcResults.grandTotal)} (${formatCurrency(calcResults.costPerCft)}/CFT)%0A%0A` +
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
          <button style={styles.backBtn} onClick={() => router.push('/calculators')}>← Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          🏗️ RCC Footing Structural & Formwork Calculator
          <span style={styles.badge}>IS 456 Mesh Mat & Excavation</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#fecdd3' }}>BuildMitra Professional Edition</span>
        </div>
      </div>

      {/* 2. Single Live Market Rate Ticker */}
      <MarketRateTrend />

      {/* 3. Scope Option Dropdown Selector */}
      <div style={styles.dropdownCard}>
        <label style={styles.dropdownLabel}>Select Scope Option</label>
        <select
          style={styles.modeSelect}
          value={scopeOption}
          onChange={(e) => setScopeOption(e.target.value as 'both' | 'concrete_only' | 'steel_only')}
        >
          <option value="both">🔵 Both Concrete Materials, PCC & Steel Rebar (Complete RCC Footing)</option>
          <option value="concrete_only">🧱 Only Concrete Materials, PCC Bed & Shuttering (No Steel Rebar)</option>
          <option value="steel_only">⚙️ Only Steel Rebar & Footing Mesh Mat (No Concrete Mix)</option>
        </select>
      </div>
        </div>
        <div className="engineering-specimen-top">
      <EngineeringSpecimen kind="footing" title="Dynamic Footing Specimen" material={inputs.grade} data={{ lengthFt: inputs.lengthFt, widthFt: inputs.widthFt, depthFt: inputs.depthFt, widthIn: inputs.columnWidthIn, grade: inputs.grade, mainDia: inputs.mainDia, distDia: inputs.distDia, mainSpacingMm: inputs.mainSpacingMm, distSpacingMm: inputs.distSpacingMm, coverMm: inputs.coverMm, showSteel: calcResults.hasSteel, scopeOption }} />
        </div>
      </div>
      <style jsx>{`
        .engineering-top-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 118px;
          gap: 8px;
          align-items: start;
          margin-bottom: 6px;
        }
        .engineering-top-left { min-width: 0; overflow: hidden; }
        .engineering-specimen-top {
          width: 150px;
          position: sticky;
          top: 12px;
          align-self: start;
          z-index: 2;
        }
        @media (max-width: 900px) {
          .engineering-top-layout {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) 118px !important;
            gap: 5px !important;
            align-items: start !important;
            margin-bottom: 5px !important;
            position: relative !important;
          }

          .engineering-top-left {
            min-width: 0 !important;
            overflow: visible !important;
          }

          .engineering-specimen-top {
            width: 118px !important;
            min-width: 118px !important;
            max-width: 118px !important;

            height: 125px !important;
            max-height: 125px !important;

            position: relative !important;
            top: 0 !important;
            right: 0 !important;

            margin: 0 0 0 auto !important;
            padding: 0 !important;

            overflow: hidden !important;
            align-self: start !important;
          }

          /*
             Preserve specimen proportions but reduce its VERTICAL
             footprint heavily. Scaling the complete component avoids
             the ugly wrapped "3D ISOMETRIC" text seen previously.
          */
          .engineering-specimen-top > * {
            width: 185% !important;
            max-width: 185% !important;

            transform: none !important;
            transform-origin: top right !important;

            margin-left: auto !important;
            margin-right: 0 !important;
          }

          .engineering-specimen-top img,
          .engineering-specimen-top svg,
          .engineering-specimen-top canvas {
            max-width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* 4. Detailed Input Form */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📐 Footing Geometry, Excavation & PCC Specifications</span>
        </div>

        <div style={styles.noteBox}>
          💡 <strong>IS 456 Structural Footing Standards</strong>: Select whether to compute Concrete Materials, Steel Rebar, or Both. Includes pit excavation volume, PCC 1:4:8 bed, nominal mix proportions, mesh mat bar schedule with L-bends, 50mm footing cover, and 4-side formwork shuttering.
        </div>

        <div style={styles.grid4}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Number of Footings (Nos)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.footingNos}
              onChange={e => setInputs({ ...inputs, footingNos: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Footing Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.lengthFt}
              onChange={e => setInputs({ ...inputs, lengthFt: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Footing Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.widthFt}
              onChange={e => setInputs({ ...inputs, widthFt: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Footing Depth (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.depthFt}
              onChange={e => setInputs({ ...inputs, depthFt: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Pit Excavation Depth (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.excDepthFt}
              onChange={e => setInputs({ ...inputs, excDepthFt: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Working Space (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.workSpaceFt}
              onChange={e => setInputs({ ...inputs, workSpaceFt: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>PCC Bed Thick (mm)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.pccThickMm}
              onChange={e => setInputs({ ...inputs, pccThickMm: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>PCC Projection (Inches)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.pccProjIn}
              onChange={e => setInputs({ ...inputs, pccProjIn: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
            />
          </div>

          {calcResults.hasConcrete && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Concrete Mix Grade</label>
              <select
                style={{ ...styles.select, fontWeight: '700' }}
                value={inputs.grade}
                onChange={e => setInputs({ ...inputs, grade: e.target.value })}
              >
                <option value="M20">M20 (1 : 1.5 : 3)</option>
                <option value="M25">M25 (1 : 1 : 2)</option>
                <option value="M30">M30 (Design Mix)</option>
              </select>
            </div>
          )}
        </div>

        {/* Reinforcement Mesh Controls */}
        {calcResults.hasSteel && (
          <div style={{ backgroundColor: '#fff5f7', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecdd3' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#800020', marginBottom: '10px' }}>🔄 Footing Mesh Mat Reinforcement (Bar Schedule)</div>
            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Main Bar Dia (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.mainDia}
                  onChange={e => setInputs({ ...inputs, mainDia: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Main Bar Spacing (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.mainSpacingMm}
                  onChange={e => setInputs({ ...inputs, mainSpacingMm: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Dist Bar Dia (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.distDia}
                  onChange={e => setInputs({ ...inputs, distDia: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Dist Bar Spacing (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.distSpacingMm}
                  onChange={e => setInputs({ ...inputs, distSpacingMm: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Clear Cover (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.coverMm}
                  onChange={e => setInputs({ ...inputs, coverMm: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>L-Bend Length (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.bendLengthMm}
                  onChange={e => setInputs({ ...inputs, bendLengthMm: (e.target.value === "" ? ("" as any) : parseFloat(e.target.value)) })}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Footing Form</button>
        </div>
      </div>

      {/* Results Summary Cards */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📊 Footing Results BOQ ({scopeOption === 'both' ? 'Concrete & Steel' : scopeOption === 'concrete_only' ? 'Concrete & Formwork' : 'Steel Rebar Only'})</span>
        </div>

        {/* Metric Grid */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>RCC Con. Vol</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.rccVolCft)} CFT</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatNumber(calcResults.rccVolCum, 3)} CUM @ {inputs.grade})</span>
          </div>

          {calcResults.hasConcrete && (
            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>Excavation & Cement</span>
              <span style={styles.metricVal}>{formatNumber(calcResults.excVolCum, 2)} CUM | {formatNumber(calcResults.totalCementBags, 1)} Bags</span>
            </div>
          )}

          {calcResults.hasSteel && (
            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Steel Rebar Mesh</span>
              <span style={styles.metricVal}>{formatNumber(calcResults.totalSteelKg, 1)} kg</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>({inputs.mainDia}mm Main + {inputs.distDia}mm Dist)</span>
            </div>
          )}

          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>Total Cost</span>
            <span style={styles.metricVal}>{formatCurrency(calcResults.grandTotal)}</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(calcResults.costPerCft)} / CFT)</span>
          </div>
        </div>

        {/* BOQ Table */}
        <div className="bm-item-results-scroll" style={styles.tableContainer}>
          <table className="bm-item-results-table" style={styles.table}>
            <thead>
              <tr>
                <th className="bm-mobile-hide-col" style={styles.th}>Master Code</th>
                <th className="bm-mobile-hide-col" style={styles.th}>Category</th>
                <th style={styles.th}>Item Description</th>
                <th style={styles.th}>Unit</th>
                <th className="bm-mobile-hide-col" style={styles.th}>Eng Qty</th>
                <th style={styles.th}>Proc Qty</th>
                <th className="bm-mobile-hide-col" style={styles.th}>Approved Rate</th>
                <th style={styles.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {calcResults.resultItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="bm-mobile-hide-col" style={styles.td}><code>{item.code}</code></td>
                  <td className="bm-mobile-hide-col" style={styles.td}><span style={{
                      backgroundColor: item.category === 'Material' ? '#e0f2fe' : item.category === 'Labour' || item.category === 'Earthwork' ? '#ffedd5' : '#f0fdf4',
                      color: item.category === 'Material' ? '#0369a1' : item.category === 'Labour' || item.category === 'Earthwork' ? '#c2410c' : '#166534',
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
                  <td className="bm-mobile-hide-col" style={styles.td}>{formatNumber(item.engQty)}</td>
                  <td style={styles.td}><strong>{formatNumber(item.procQty)}</strong></td>
                  <td className="bm-mobile-hide-col" style={styles.td}>{item.rateFound ? (
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
          <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={handleDownloadPDF}>📄 Download in PDF</button>
          <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export in Excel</button>
          <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share on WhatsApp</button>
        </div>
      </div>
    </div>
  );
}





















