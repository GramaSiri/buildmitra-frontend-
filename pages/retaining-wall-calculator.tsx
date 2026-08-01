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

export default function RetainingWallCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Scope Option: 'both' vs 'concrete_only' vs 'steel_only'
  const [scopeOption, setScopeOption] = useState<'both' | 'concrete_only' | 'steel_only'>('both');

  // DETAILED RETAINING WALL INPUTS
  const initialInputs = {
    lengthFt: 20,       // Wall length in feet
    heightFt: 3,        // Stem height in feet
    thicknessFt: 0.5,   // Stem thickness in feet (6 inches)
    grade: 'M20',       // Concrete grade: M20, M25, M30

    // Reinforcement
    vertDia: 12,        // Stem vertical main bar dia in mm
    horizDia: 10,       // Stem horizontal distribution bar dia in mm
    toeHeelDia: 12,     // Base slab toe & heel bar dia in mm
    spacingMm: 150,     // Common bar spacing in mm
    coverMm: 40         // Clear cover in mm (40mm for retaining walls)
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
  const weepholeRate = getMasterRate(["MAT-WPH-01", "weephole", "pvc pipe"], 120);
  const shutteringRate = getMasterRate(["SRV-RET-SHT", "retaining wall shuttering", "formwork"], 35);
  const rccLabourRate = getMasterRate(["SRV-RCC-LAY", "rcc labour", "retaining labour"], 1000);

  const handleReset = () => setInputs(initialInputs);

  // IS 456 Cantilever Retaining Wall Engine
  const calcResults = useMemo(() => {
    const hasConcrete = scopeOption === 'both' || scopeOption === 'concrete_only';
    const hasSteel = scopeOption === 'both' || scopeOption === 'steel_only';

    // Cantilever Proportions per IS 456
    const stemHeightFt = inputs.heightFt;
    const stemThickFt = inputs.thicknessFt;
    const baseWidthFt = Math.max(inputs.heightFt * 0.60, 2.5);
    const baseThickFt = Math.max(inputs.thicknessFt, 0.75);

    // Concrete Volumes
    const stemVolCft = inputs.lengthFt * stemHeightFt * stemThickFt;
    const baseVolCft = inputs.lengthFt * baseWidthFt * baseThickFt;

    const totalVolCft = stemVolCft + baseVolCft;
    const totalVolCum = totalVolCft / 35.3147;

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

    const cementBags = hasConcrete ? (totalVolCum * cementFactor) : 0;
    const mSandCft = hasConcrete ? (totalVolCum * mSandFactor) : 0;
    const ca20Cft = hasConcrete ? (totalVolCum * ca20Factor) : 0;
    const ca12Cft = hasConcrete ? (totalVolCum * ca12Factor) : 0;

    // Steel Reinforcement Bar Schedule
    const vertBarLenM = (stemHeightFt * 0.3048 - (inputs.coverMm / 1000)) + (50 * inputs.vertDia / 1000);
    const vertBarCount = Math.ceil((inputs.lengthFt * 304.8) / inputs.spacingMm) + 1;
    const totalVertSteelKg = hasSteel ? (vertBarCount * vertBarLenM * ((inputs.vertDia * inputs.vertDia) / 162.2)) : 0;

    const horizBarLenM = (inputs.lengthFt * 0.3048);
    const horizBarCount = Math.ceil((stemHeightFt * 304.8) / inputs.spacingMm) + 1;
    const totalHorizSteelKg = hasSteel ? (horizBarCount * horizBarLenM * ((inputs.horizDia * inputs.horizDia) / 162.2)) : 0;

    const toeHeelBarLenM = (baseWidthFt * 0.3048) + (2 * 50 * inputs.toeHeelDia / 1000);
    const toeHeelBarCount = Math.ceil((inputs.lengthFt * 304.8) / inputs.spacingMm) + 1;
    const totalToeHeelSteelKg = hasSteel ? (toeHeelBarCount * toeHeelBarLenM * ((inputs.toeHeelDia * inputs.toeHeelDia) / 162.2)) : 0;

    const totalSteelKg = totalVertSteelKg + totalHorizSteelKg + totalToeHeelSteelKg;
    const bindingWireKg = hasSteel ? (totalSteelKg * 0.015) : 0;
    const coverBlockNos = hasSteel ? (Math.ceil(inputs.lengthFt / 4) * 8) : 0;
    const waterLtr = hasConcrete ? (cementBags * 25) : 0;

    // Formwork Shuttering Surface Area (Front & Back Stem Faces)
    const shutteringAreaSqft = hasConcrete ? (2 * inputs.lengthFt * stemHeightFt) : 0;

    // PVC Weepholes
    const weepholeNos = hasConcrete ? Math.ceil((inputs.lengthFt / 5.0) * Math.max(Math.floor(inputs.heightFt / 3.0), 1)) : 0;

    // Cost Breakdown
    const cementCost = cementBags * (cementRate.found ? cementRate.rate : 385);
    const steelCost = totalSteelKg * (steelRate.found ? steelRate.rate : 68);
    const sandCost = mSandCft * (sandRate.found ? sandRate.rate : 46);
    const ca20Cost = ca20Cft * (ca20Rate.found ? ca20Rate.rate : 40);
    const ca12Cost = ca12Cft * (ca12Rate.found ? ca12Rate.rate : 42);
    const wireCost = bindingWireKg * (wireRate.found ? wireRate.rate : 80);
    const coverCost = coverBlockNos * (coverRate.found ? coverRate.rate : 5);
    const waterCost = waterLtr * (waterRate.found ? waterRate.rate : 0.05);
    const shutteringCost = shutteringAreaSqft * (shutteringRate.found ? shutteringRate.rate : 35);
    const weepholeCost = weepholeNos * (weepholeRate.found ? weepholeRate.rate : 120);

    const labourRatePerCum = (hasConcrete && hasSteel) ? 1000 : hasConcrete ? 600 : 400;
    const rccLabourCost = totalVolCum * labourRatePerCum;

    const grandMatCost = cementCost + steelCost + sandCost + ca20Cost + ca12Cost + wireCost + coverCost + waterCost + shutteringCost + weepholeCost;
    const grandTotal = grandMatCost + rccLabourCost;
    const costPerCft = totalVolCft > 0 ? grandTotal / totalVolCft : 0;

    const resultItems: any[] = [];

    if (hasConcrete) {
      resultItems.push(
        { code: cementRate.itemCode || "MAT-CEM-01", category: "Material", description: `Cement OPC 53 Grade (${inputs.grade} Mix)`, unit: "BAG", engQty: cementBags, procQty: Math.ceil(cementBags), rate: cementRate.rate, rateFound: cementRate.found, amount: cementCost },
        { code: sandRate.itemCode || "MAT-MSND-01", category: "Material", description: `M-Sand for Retaining Wall Concrete`, unit: "CFT", engQty: mSandCft, procQty: Math.ceil(mSandCft), rate: sandRate.rate, rateFound: sandRate.found, amount: sandCost },
        { code: ca20Rate.itemCode || "MAT-AGG-20", category: "Material", description: `20mm Coarse Aggregate`, unit: "CFT", engQty: ca20Cft, procQty: Math.ceil(ca20Cft), rate: ca20Rate.rate, rateFound: ca20Rate.found, amount: ca20Cost },
        { code: ca12Rate.itemCode || "MAT-AGG-12", category: "Material", description: `12mm Coarse Aggregate`, unit: "CFT", engQty: ca12Cft, procQty: Math.ceil(ca12Cft), rate: ca12Rate.rate, rateFound: ca12Rate.found, amount: ca12Cost },
        { code: waterRate.itemCode || "MAT-WTR-01", category: "Site Utility", description: `Construction Water for Curing & Concrete`, unit: "LTR", engQty: waterLtr, procQty: Math.ceil(waterLtr), rate: waterRate.rate, rateFound: waterRate.found, amount: waterCost },
        { code: shutteringRate.itemCode || "SRV-RET-SHT", category: "Formwork", description: `Stem Formwork Shuttering Rental & Fixing Charges`, unit: "SQFT", engQty: shutteringAreaSqft, procQty: Math.ceil(shutteringAreaSqft), rate: shutteringRate.rate, rateFound: shutteringRate.found, amount: shutteringCost },
        { code: weepholeRate.itemCode || "MAT-WPH-01", category: "Accessories", description: `PVC 75mm Sub-surface Drainage Weepholes`, unit: "NOS", engQty: weepholeNos, procQty: weepholeNos, rate: weepholeRate.rate, rateFound: weepholeRate.found, amount: weepholeCost }
      );
    }

    if (hasSteel) {
      resultItems.push(
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - ${inputs.vertDia}mm Stem Vertical Main Rebar`, unit: "KG", engQty: totalVertSteelKg, procQty: Math.ceil(totalVertSteelKg), rate: steelRate.rate, rateFound: steelRate.found, amount: totalVertSteelKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - ${inputs.horizDia}mm Stem Horizontal Distribution Rebar`, unit: "KG", engQty: totalHorizSteelKg, procQty: Math.ceil(totalHorizSteelKg), rate: steelRate.rate, rateFound: steelRate.found, amount: totalHorizSteelKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - ${inputs.toeHeelDia}mm Base Slab Toe & Heel Rebar`, unit: "KG", engQty: totalToeHeelSteelKg, procQty: Math.ceil(totalToeHeelSteelKg), rate: steelRate.rate, rateFound: steelRate.found, amount: totalToeHeelSteelKg * steelRate.rate },
        { code: wireRate.itemCode || "MAT-BWR-01", category: "Material", description: `Steel Binding Wire (1.5% of steel)`, unit: "KG", engQty: bindingWireKg, procQty: Math.ceil(bindingWireKg), rate: wireRate.rate, rateFound: wireRate.found, amount: wireCost },
        { code: coverRate.itemCode || "MAT-CVR-01", category: "Material", description: `Heavy Duty Retaining Wall Cover Blocks (40mm)`, unit: "NOS", engQty: coverBlockNos, procQty: coverBlockNos, rate: coverRate.rate, rateFound: coverRate.found, amount: coverCost }
      );
    }

    resultItems.push({
      code: rccLabourRate.itemCode || "SRV-RCC-LAY",
      category: "Labour",
      description: `Retaining Wall ${scopeOption === 'both' ? 'Concrete Casting & Mesh Tying' : scopeOption === 'concrete_only' ? 'Concrete Casting & Shuttering' : 'Mesh Bar Bending & Steel Tying'} Labour`,
      unit: "CUM",
      engQty: totalVolCum,
      procQty: totalVolCum,
      rate: labourRatePerCum,
      rateFound: rccLabourRate.found,
      amount: rccLabourCost
    });

    return {
      hasConcrete,
      hasSteel,
      baseWidthFt,
      baseThickFt,
      stemVolCft,
      baseVolCft,
      totalVolCft,
      totalVolCum,
      cementBags,
      totalSteelKg,
      totalVertSteelKg,
      totalHorizSteelKg,
      totalToeHeelSteelKg,
      mSandCft,
      ca20Cft,
      ca12Cft,
      bindingWireKg,
      coverBlockNos,
      waterLtr,
      shutteringAreaSqft,
      weepholeNos,
      grandMatCost,
      rccLabourCost,
      grandTotal,
      costPerCft,
      resultItems
    };
  }, [inputs, scopeOption, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, wireRate, coverRate, waterRate, shutteringRate, weepholeRate, rccLabourRate]);

  // Download PDF
  const handleDownloadPDF = () => {
    checkAndRun('calculator_export', 'retaining-wall-calculator', () => {
      downloadBuildMitraPDF({
        documentTitle: `BuildMitra Retaining Wall Estimate (${scopeOption})`,
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
    checkAndRun('calculator_export', 'retaining-wall-calculator', () => {
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
      XLSX.utils.book_append_sheet(wb, ws, "Retaining_Wall_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Retaining_Wall_Estimate_${scopeOption}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'retaining-wall-calculator', () => {
      const msg = `*BuildMitra Cantilever RCC Retaining Wall Report*%0A` +
        `*Scope Option*: ${scopeOption === 'both' ? 'Both Concrete & Steel' : scopeOption === 'concrete_only' ? 'Only Concrete & Formwork' : 'Only Steel Rebar'}%0A` +
        `----------------------------------------%0A` +
        `• *Retaining Wall*: ${inputs.lengthFt}' L x ${inputs.heightFt}' H x ${inputs.thicknessFt}' T (${inputs.grade})%0A` +
        `• *Base Slab*: ${formatNumber(calcResults.baseWidthFt)}' W x ${formatNumber(calcResults.baseThickFt)}' T%0A` +
        `• *Concrete Volume*: ${formatNumber(calcResults.totalVolCft)} CFT (${formatNumber(calcResults.totalVolCum, 3)} CUM)%0A` +
        (calcResults.hasConcrete ? `• *Cement*: ${formatNumber(calcResults.cementBags)} Bags | *Shuttering*: ${formatNumber(calcResults.shutteringAreaSqft)} Sqft%0A` : '') +
        (calcResults.hasSteel ? `• *Steel Rebar*: ${formatNumber(calcResults.totalSteelKg)} kg (${inputs.vertDia}mm Vert + ${inputs.horizDia}mm Horiz + ${inputs.toeHeelDia}mm Toe/Heel)%0A` : '') +
        `• *PVC Weepholes*: ${calcResults.weepholeNos} Nos%0A` +
        `• *Material Total*: ${formatCurrency(calcResults.grandMatCost)}%0A` +
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
          🧱 Retaining Wall Structural & Formwork Calculator
          <span style={styles.badge}>IS 456 Cantilever Wall & Weepholes</span>
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
          <option value="both">🔵 Both Concrete Materials & Steel Rebar (Complete Cantilever RCC Retaining Wall)</option>
          <option value="concrete_only">🧱 Only Concrete Materials & Formwork Shuttering (No Steel Rebar)</option>
          <option value="steel_only">⚙️ Only Steel Rebar & Bar Bending Schedule (Stem & Base Slab Rebar)</option>
        </select>
      </div>
        </div>
        <div className="engineering-specimen-top">
      <EngineeringSpecimen kind="retaining-wall" title="Dynamic Retaining Wall Specimen" material={inputs.grade} data={{ lengthFt: inputs.lengthFt, heightFt: inputs.heightFt, widthIn: inputs.thicknessFt * 12, grade: inputs.grade, vertDia: inputs.vertDia, horizDia: inputs.horizDia, vertSpacingMm: inputs.vertSpacingMm, horizSpacingMm: inputs.horizSpacingMm, coverMm: inputs.coverMm, showSteel: calcResults.hasSteel, scopeOption }} />
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
          <span>📐 Retaining Wall Geometry & Cantilever Specifications</span>
        </div>

        <div style={styles.noteBox}>
          💡 <strong>IS 456 Retaining Wall Design Standards</strong>: Computes stem and cantilever base slab concrete volume ($B \approx 0.6H$), stem vertical main rebar with $50d$ anchorage, stem horizontal distribution rebar, toe & heel slab mesh, stem front/back formwork shuttering, and 75mm PVC sub-surface drainage weepholes.
        </div>

        <div style={styles.grid4}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Wall Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.lengthFt}
              onChange={e => setInputs({ ...inputs, lengthFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Stem Height (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.heightFt}
              onChange={e => setInputs({ ...inputs, heightFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Stem Thickness (Ft)</label>
            <input
              type="number"
              step="0.05"
              style={styles.input}
              value={inputs.thicknessFt}
              onChange={e => setInputs({ ...inputs, thicknessFt: parseFloat(e.target.value) || 0.5 })}
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

        {/* Reinforcement Controls */}
        {calcResults.hasSteel && (
          <div style={{ backgroundColor: '#fff5f7', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecdd3' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#800020', marginBottom: '10px' }}>🔄 Stem & Base Slab Reinforcement (Bar Bending Schedule)</div>
            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Stem Vert Main Dia (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.vertDia}
                  onChange={e => setInputs({ ...inputs, vertDia: parseFloat(e.target.value) || 12 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Stem Horiz Dist Dia (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.horizDia}
                  onChange={e => setInputs({ ...inputs, horizDia: parseFloat(e.target.value) || 10 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Toe/Heel Slab Dia (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.toeHeelDia}
                  onChange={e => setInputs({ ...inputs, toeHeelDia: parseFloat(e.target.value) || 12 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Bar Spacing (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.spacingMm}
                  onChange={e => setInputs({ ...inputs, spacingMm: parseFloat(e.target.value) || 150 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Clear Cover (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.coverMm}
                  onChange={e => setInputs({ ...inputs, coverMm: parseFloat(e.target.value) || 40 })}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Form</button>
        </div>
      </div>

      {/* Results Summary Cards */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📊 Retaining Wall Results BOQ ({scopeOption === 'both' ? 'Concrete & Steel' : scopeOption === 'concrete_only' ? 'Concrete & Formwork' : 'Steel Rebar Only'})</span>
        </div>

        {/* Metric Grid */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>RCC Volume (Stem + Base)</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.totalVolCft)} CFT</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatNumber(calcResults.totalVolCum, 3)} CUM @ {inputs.grade})</span>
          </div>

          {calcResults.hasConcrete && (
            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>Cement & Shuttering</span>
              <span style={styles.metricVal}>{formatNumber(calcResults.cementBags, 1)} Bags | {formatNumber(calcResults.shutteringAreaSqft)} Sqft</span>
            </div>
          )}

          {calcResults.hasSteel && (
            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Steel Rebar</span>
              <span style={styles.metricVal}>{formatNumber(calcResults.totalSteelKg, 1)} kg</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>({inputs.vertDia}mm / {inputs.horizDia}mm / {inputs.toeHeelDia}mm)</span>
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
                      backgroundColor: item.category === 'Material' ? '#e0f2fe' : item.category === 'Labour' ? '#ffedd5' : '#f0fdf4',
                      color: item.category === 'Material' ? '#0369a1' : item.category === 'Labour' ? '#c2410c' : '#166534',
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
