import { getCachedBuildMitraMasterRates, fetchBuildMitraMasterRates } from "../utils/buildmitraMasterRates";
import { getBuildMitraReportHeaderHtml, BUILDMITRA_OFFICIAL_LOGO } from "../utils/buildmitraReportBranding";
import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../utils/pdfExport';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import EngineeringSpecimen from '../components/engineering/EngineeringSpecimen';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { backgroundColor: '#800020', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(128,0,32,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#a51d36', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  dropdownCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '16px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  dropdownLabel: { fontSize: '12px', fontWeight: '800', color: '#800020', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px', display: 'block' },
  modeSelect: { width: '100%', padding: '12px 14px', border: '2px solid #800020', borderRadius: '8px', fontSize: '15px', fontWeight: '700', color: '#800020', backgroundColor: '#fff5f7', outline: 'none', cursor: 'pointer' },

  stepperCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '15px', fontWeight: '700', color: '#800020', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #fecdd3', paddingBottom: '8px' },

  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '14px' },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' },
  select: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', outline: 'none' },

  btnPrimary: { backgroundColor: '#800020', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' },
  metricCard: { padding: '14px', borderRadius: '8px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricMaroon: { backgroundColor: '#800020' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tableContainer: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#800020', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

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

  // Admin Master Rates Lookup
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
        `• *RCC Concrete Volume*: ${formatNumber(calcResults.rccVolCft)} CFT (${formatNumber(calcResults.rccVolCum, 3)} CUM)%0A` +
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
              onChange={e => setInputs({ ...inputs, footingNos: parseFloat(e.target.value) || 1 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Footing Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.lengthFt}
              onChange={e => setInputs({ ...inputs, lengthFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Footing Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.widthFt}
              onChange={e => setInputs({ ...inputs, widthFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Footing Depth (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.depthFt}
              onChange={e => setInputs({ ...inputs, depthFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Pit Excavation Depth (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.excDepthFt}
              onChange={e => setInputs({ ...inputs, excDepthFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Working Space (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.workSpaceFt}
              onChange={e => setInputs({ ...inputs, workSpaceFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>PCC Bed Thick (mm)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.pccThickMm}
              onChange={e => setInputs({ ...inputs, pccThickMm: parseFloat(e.target.value) || 100 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>PCC Projection (Inches)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.pccProjIn}
              onChange={e => setInputs({ ...inputs, pccProjIn: parseFloat(e.target.value) || 6 })}
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
                  onChange={e => setInputs({ ...inputs, mainDia: parseFloat(e.target.value) || 12 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Main Bar Spacing (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.mainSpacingMm}
                  onChange={e => setInputs({ ...inputs, mainSpacingMm: parseFloat(e.target.value) || 150 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Dist Bar Dia (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.distDia}
                  onChange={e => setInputs({ ...inputs, distDia: parseFloat(e.target.value) || 12 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Dist Bar Spacing (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.distSpacingMm}
                  onChange={e => setInputs({ ...inputs, distSpacingMm: parseFloat(e.target.value) || 150 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Clear Cover (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.coverMm}
                  onChange={e => setInputs({ ...inputs, coverMm: parseFloat(e.target.value) || 50 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>L-Bend Length (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.bendLengthMm}
                  onChange={e => setInputs({ ...inputs, bendLengthMm: parseFloat(e.target.value) || 300 })}
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
            <span style={styles.metricTitle}>RCC Concrete Volume</span>
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
              {calcResults.resultItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={styles.td}><code>{item.code}</code></td>
                  <td style={styles.td}>
                    <span style={{
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
          <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={handleDownloadPDF}>📄 Download in PDF</button>
          <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export in Excel</button>
          <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share on WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
