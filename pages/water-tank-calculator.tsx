import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
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

export default function WaterTankCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Scope Option: 'both' vs 'concrete_only' vs 'steel_only'
  const [scopeOption, setScopeOption] = useState<'both' | 'concrete_only' | 'steel_only'>('both');

  // DETAILED TANK INPUTS
  const initialInputs = {
    tankNos: 1,           // Number of tanks
    lengthFt: 10,         // Internal length in feet
    widthFt: 8,           // Internal width in feet
    heightFt: 6,          // Internal height in feet
    wallType: 'RCC',      // RCC vs Brickwork
    grade: 'M20',         // Concrete grade: M20, M25, M30

    // Component Thicknesses
    baseThickIn: 6,       // Base slab thickness in inches
    wallThickIn: 6,       // Side wall thickness in inches
    coverThickIn: 6,      // Cover slab thickness in inches

    // Coatings & Accessories
    includeWaterproofing: true,
    includeFoodPaint: true,
    includeFRPManhole: true
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
  const wprRate = getMasterRate(["MAT-WPR-01", "waterproofing", "liquid compound"], 42);
  const foodPaintRate = getMasterRate(["MAT-FDP-01", "food grade paint", "epoxy paint"], 35);
  const frpCoverRate = getMasterRate(["MAT-FRP-01", "frp cover", "manhole cover"], 1000);
  const shutteringRate = getMasterRate(["SRV-TNK-SHT", "tank shuttering", "formwork"], 35);
  const rccLabourRate = getMasterRate(["SRV-RCC-LAY", "rcc labour", "tank labour"], 1000);

  const handleReset = () => setInputs(initialInputs);

  // IS Code Water Tank Structural Engine
  const calcResults = useMemo(() => {
    const hasConcrete = scopeOption === 'both' || scopeOption === 'concrete_only';
    const hasSteel = scopeOption === 'both' || scopeOption === 'steel_only';

    // Internal Volume & Water Capacity
    const internalVolCft = inputs.lengthFt * inputs.widthFt * inputs.heightFt;
    const capacityLiters = internalVolCft * 28.3168 * inputs.tankNos;

    // Component Dimensions
    const wallThickFt = inputs.wallThickIn / 12;
    const baseThickFt = inputs.baseThickIn / 12;
    const coverThickFt = inputs.coverThickIn / 12;

    const outerLengthFt = inputs.lengthFt + 2 * wallThickFt;
    const outerWidthFt = inputs.widthFt + 2 * wallThickFt;

    // Concrete Volumes
    const baseSlabVolCft = outerLengthFt * outerWidthFt * baseThickFt;
    const sideWallsVolCft = 2 * (inputs.lengthFt + inputs.widthFt) * inputs.heightFt * wallThickFt;
    const coverSlabVolCft = (outerLengthFt * outerWidthFt * coverThickFt) - (2 * 2 * coverThickFt);

    const rccVolCft = (baseSlabVolCft + sideWallsVolCft + coverSlabVolCft) * inputs.tankNos;
    const rccVolCum = rccVolCft / 35.3147;

    // Concrete Mix Ingredients
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

    const cementBags = hasConcrete ? (rccVolCum * cementFactor) : 0;
    const mSandCft = hasConcrete ? (rccVolCum * mSandFactor) : 0;
    const ca20Cft = hasConcrete ? (rccVolCum * ca20Factor) : 0;
    const ca12Cft = hasConcrete ? (rccVolCum * ca12Factor) : 0;

    // Reinforcement Steel
    const baseSteelKg = hasSteel ? (baseSlabVolCft * inputs.tankNos * 1.60) : 0;
    const wallSteelKg = hasSteel ? (sideWallsVolCft * inputs.tankNos * 1.50) : 0;
    const coverSteelKg = hasSteel ? (coverSlabVolCft * inputs.tankNos * 1.40) : 0;

    const totalSteelKg = baseSteelKg + wallSteelKg + coverSteelKg;
    const bindingWireKg = hasSteel ? (totalSteelKg * 0.015) : 0;
    const coverBlockNos = hasSteel ? (inputs.tankNos * 40) : 0;
    const waterLtr = hasConcrete ? (cementBags * 25) : 0;

    // Internal Wetted Area for Waterproofing & Food Paint
    const internalFloorArea = inputs.lengthFt * inputs.widthFt;
    const internalWallArea = 2 * (inputs.lengthFt + inputs.widthFt) * inputs.heightFt;
    const wettedAreaSqft = (internalFloorArea + internalWallArea) * inputs.tankNos;

    // Formwork Shuttering Surface Area
    const shutteringAreaSqft = hasConcrete ? ((2 * (inputs.lengthFt + inputs.widthFt) * inputs.heightFt + outerLengthFt * outerWidthFt) * inputs.tankNos) : 0;

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
    const wprCost = inputs.includeWaterproofing ? (wettedAreaSqft * (wprRate.found ? wprRate.rate : 42)) : 0;
    const foodPaintCost = inputs.includeFoodPaint ? (wettedAreaSqft * (foodPaintRate.found ? foodPaintRate.rate : 35)) : 0;
    const frpCoverCost = inputs.includeFRPManhole ? (inputs.tankNos * (frpCoverRate.found ? frpCoverRate.rate : 1000)) : 0;

    const labourRatePerCum = (hasConcrete && hasSteel) ? 1000 : hasConcrete ? 600 : 400;
    const rccLabourCost = rccVolCum * labourRatePerCum;

    const grandMatCost = cementCost + steelCost + sandCost + ca20Cost + ca12Cost + wireCost + coverCost + waterCost + shutteringCost + wprCost + foodPaintCost + frpCoverCost;
    const grandTotal = grandMatCost + rccLabourCost;
    const costPerLitre = capacityLiters > 0 ? grandTotal / capacityLiters : 0;

    const resultItems: any[] = [];

    if (hasConcrete) {
      resultItems.push(
        { code: cementRate.itemCode || "MAT-CEM-01", category: "Material", description: `Cement OPC 53 Grade (${inputs.grade} Mix)`, unit: "BAG", engQty: cementBags, procQty: Math.ceil(cementBags), rate: cementRate.rate, rateFound: cementRate.found, amount: cementCost },
        { code: sandRate.itemCode || "MAT-MSND-01", category: "Material", description: `M-Sand for Concrete Mix`, unit: "CFT", engQty: mSandCft, procQty: Math.ceil(mSandCft), rate: sandRate.rate, rateFound: sandRate.found, amount: sandCost },
        { code: ca20Rate.itemCode || "MAT-AGG-20", category: "Material", description: `20mm Coarse Aggregate`, unit: "CFT", engQty: ca20Cft, procQty: Math.ceil(ca20Cft), rate: ca20Rate.rate, rateFound: ca20Rate.found, amount: ca20Cost },
        { code: ca12Rate.itemCode || "MAT-AGG-12", category: "Material", description: `12mm Coarse Aggregate`, unit: "CFT", engQty: ca12Cft, procQty: Math.ceil(ca12Cft), rate: ca12Rate.rate, rateFound: ca12Rate.found, amount: ca12Cost },
        { code: waterRate.itemCode || "MAT-WTR-01", category: "Site Utility", description: `Construction Water for Curing & Concrete`, unit: "LTR", engQty: waterLtr, procQty: Math.ceil(waterLtr), rate: waterRate.rate, rateFound: waterRate.found, amount: waterCost },
        { code: shutteringRate.itemCode || "SRV-TNK-SHT", category: "Formwork", description: `Tank Formwork Shuttering Rental & Fixing Charges`, unit: "SQFT", engQty: shutteringAreaSqft, procQty: Math.ceil(shutteringAreaSqft), rate: shutteringRate.rate, rateFound: shutteringRate.found, amount: shutteringCost }
      );
    }

    if (hasSteel) {
      resultItems.push(
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - 12mm Base Slab Mesh Rebar`, unit: "KG", engQty: baseSteelKg, procQty: Math.ceil(baseSteelKg), rate: steelRate.rate, rateFound: steelRate.found, amount: baseSteelKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - 8mm/10mm Side Wall Double Mesh Rebar`, unit: "KG", engQty: wallSteelKg, procQty: Math.ceil(wallSteelKg), rate: steelRate.rate, rateFound: steelRate.found, amount: wallSteelKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - 10mm Cover Slab Reinforcement Mesh`, unit: "KG", engQty: coverSteelKg, procQty: Math.ceil(coverSteelKg), rate: steelRate.rate, rateFound: steelRate.found, amount: coverSteelKg * steelRate.rate },
        { code: wireRate.itemCode || "MAT-BWR-01", category: "Material", description: `Steel Binding Wire (1.5% of steel)`, unit: "KG", engQty: bindingWireKg, procQty: Math.ceil(bindingWireKg), rate: wireRate.rate, rateFound: wireRate.found, amount: wireCost },
        { code: coverRate.itemCode || "MAT-CVR-01", category: "Material", description: `Heavy Duty Tank Concrete Cover Blocks`, unit: "NOS", engQty: coverBlockNos, procQty: coverBlockNos, rate: coverRate.rate, rateFound: coverRate.found, amount: coverCost }
      );
    }

    if (inputs.includeWaterproofing) {
      resultItems.push({ code: wprRate.itemCode || "MAT-WPR-01", category: "Coatings", description: `Internal Liquid Waterproofing Compound / Membrane`, unit: "SQFT", engQty: wettedAreaSqft, procQty: Math.ceil(wettedAreaSqft), rate: wprRate.rate, rateFound: wprRate.found, amount: wprCost });
    }

    if (inputs.includeFoodPaint) {
      resultItems.push({ code: foodPaintRate.itemCode || "MAT-FDP-01", category: "Coatings", description: `Food Grade Non-Toxic Tank Epoxy Paint Coating`, unit: "SQFT", engQty: wettedAreaSqft, procQty: Math.ceil(wettedAreaSqft), rate: foodPaintRate.rate, rateFound: foodPaintRate.found, amount: foodPaintCost });
    }

    if (inputs.includeFRPManhole) {
      resultItems.push({ code: frpCoverRate.itemCode || "MAT-FRP-01", category: "Accessories", description: `FRP Manhole Cover (2ft x 2ft Set)`, unit: "NOS", engQty: inputs.tankNos, procQty: inputs.tankNos, rate: frpCoverRate.rate, rateFound: frpCoverRate.found, amount: frpCoverCost });
    }

    resultItems.push({
      code: rccLabourRate.itemCode || "SRV-RCC-LAY",
      category: "Labour",
      description: `Water Tank ${scopeOption === 'both' ? 'Concrete Casting & Mesh Tying' : scopeOption === 'concrete_only' ? 'Concrete Casting & Shuttering' : 'Mesh Bar Bending & Tying'} Labour`,
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
      capacityLiters,
      internalVolCft,
      rccVolCft,
      rccVolCum,
      cementBags,
      totalSteelKg,
      baseSteelKg,
      wallSteelKg,
      coverSteelKg,
      mSandCft,
      ca20Cft,
      ca12Cft,
      bindingWireKg,
      coverBlockNos,
      waterLtr,
      wettedAreaSqft,
      shutteringAreaSqft,
      grandMatCost,
      rccLabourCost,
      grandTotal,
      costPerLitre,
      resultItems
    };
  }, [inputs, scopeOption, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, wireRate, coverRate, waterRate, wprRate, foodPaintRate, frpCoverRate, shutteringRate, rccLabourRate]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('calculator_export', 'water-tank-calculator', () => {
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
      XLSX.utils.book_append_sheet(wb, ws, "Water_Tank_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Water_Tank_Estimate_${scopeOption}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'water-tank-calculator', () => {
      const msg = `*BuildMitra Water Storage Tank Structural Report*%0A` +
        `*Scope Option*: ${scopeOption === 'both' ? 'Both Concrete & Steel' : scopeOption === 'concrete_only' ? 'Only Concrete & Shuttering' : 'Only Steel Mesh'}%0A` +
        `----------------------------------------%0A` +
        `• *Tank*: ${inputs.tankNos} Nos (${inputs.lengthFt}'x${inputs.widthFt}' x ${inputs.heightFt}ft Internal - ${inputs.grade})%0A` +
        `• *Water Capacity*: ${formatNumber(calcResults.capacityLiters)} Litres (${formatNumber(calcResults.internalVolCft)} CFT)%0A` +
        `• *RCC Concrete Volume*: ${formatNumber(calcResults.rccVolCft)} CFT (${formatNumber(calcResults.rccVolCum, 3)} CUM)%0A` +
        (calcResults.hasConcrete ? `• *Cement*: ${formatNumber(calcResults.cementBags)} Bags | *Shuttering*: ${formatNumber(calcResults.shutteringAreaSqft)} Sqft%0A` : '') +
        (calcResults.hasSteel ? `• *Steel Rebar*: ${formatNumber(calcResults.totalSteelKg)} kg%0A` : '') +
        `• *Coatings*: Waterproofing & Food Paint (${formatNumber(calcResults.wettedAreaSqft)} Sqft)%0A` +
        `• *Material & Coatings Total*: ${formatCurrency(calcResults.grandMatCost)}%0A` +
        `• *Labour Total*: ${formatCurrency(calcResults.rccLabourCost)}%0A` +
        `• *TOTAL ESTIMATED COST*: ${formatCurrency(calcResults.grandTotal)} (${formatCurrency(calcResults.costPerLitre)}/Litre)%0A%0A` +
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
          💧 Water Storage Tank Structural & Coatings Calculator
          <span style={styles.badge}>IS Code Capacity & Waterproofing</span>
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
          <option value="both">🔵 Both Concrete Materials & Steel Rebar (Complete RCC Water Tank)</option>
          <option value="concrete_only">🧱 Only Concrete Materials, PCC & Formwork (No Steel Rebar)</option>
          <option value="steel_only">⚙️ Only Steel Rebar Mesh & Cover Slab Bar Schedule (No Concrete Mix)</option>
        </select>
      </div>
        </div>
        <div className="engineering-specimen-top">
      <EngineeringSpecimen kind="water-tank" title="Dynamic Water Tank Specimen" material={inputs.wallType} data={{ lengthFt: inputs.lengthFt, widthFt: inputs.widthFt, heightFt: inputs.heightFt, wallType: inputs.wallType, grade: inputs.grade, wallThickIn: inputs.wallThickIn, mainDia: inputs.mainDia, distDia: inputs.distDia, mainSpacingMm: inputs.mainSpacingMm, distSpacingMm: inputs.distSpacingMm, coverMm: inputs.coverMm, showSteel: calcResults.hasSteel, scopeOption }} />
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
          <span>📐 Water Tank Geometry & Structural Specifications</span>
        </div>

        <div style={styles.noteBox}>
          💡 <strong>IS Code Water Tank Standards</strong>: Computes net internal storage volume in Litres, RCC base/side wall/cover slab concrete, double mesh rebar schedule, internal liquid waterproofing, non-toxic food grade paint coating, and FRP manhole cover.
        </div>

        <div style={styles.grid4}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Number of Tanks (Nos)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.tankNos}
              onChange={e => setInputs({ ...inputs, tankNos: parseFloat(e.target.value) || 1 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Internal Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.lengthFt}
              onChange={e => setInputs({ ...inputs, lengthFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Internal Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.widthFt}
              onChange={e => setInputs({ ...inputs, widthFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Internal Height (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.heightFt}
              onChange={e => setInputs({ ...inputs, heightFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Base Slab Thick (Inches)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.baseThickIn}
              onChange={e => setInputs({ ...inputs, baseThickIn: parseFloat(e.target.value) || 6 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Side Wall Thick (Inches)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.wallThickIn}
              onChange={e => setInputs({ ...inputs, wallThickIn: parseFloat(e.target.value) || 6 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Cover Slab Thick (Inches)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.coverThickIn}
              onChange={e => setInputs({ ...inputs, coverThickIn: parseFloat(e.target.value) || 6 })}
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

        {/* Coatings & Accessories Controls */}
        <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#166534', marginBottom: '10px' }}>🛡️ Waterproofing, Food-Grade Paint & Accessories Controls</div>
          <div style={styles.grid3}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Internal Waterproofing</label>
              <select style={styles.select} value={inputs.includeWaterproofing ? "Yes" : "No"} onChange={e => setInputs({ ...inputs, includeWaterproofing: e.target.value === "Yes" })}>
                <option value="Yes">Include Internal Liquid Waterproofing (₹42/sqft)</option>
                <option value="No">Exclude Waterproofing</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Food Grade Tank Paint</label>
              <select style={styles.select} value={inputs.includeFoodPaint ? "Yes" : "No"} onChange={e => setInputs({ ...inputs, includeFoodPaint: e.target.value === "Yes" })}>
                <option value="Yes">Include Non-Toxic Epoxy Food Paint (₹35/sqft)</option>
                <option value="No">Exclude Food Paint</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>FRP Manhole Cover</label>
              <select style={styles.select} value={inputs.includeFRPManhole ? "Yes" : "No"} onChange={e => setInputs({ ...inputs, includeFRPManhole: e.target.value === "Yes" })}>
                <option value="Yes">Include FRP 2ft x 2ft Manhole Cover (₹1000/nos)</option>
                <option value="No">Exclude FRP Cover</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Water Tank Form</button>
        </div>
      </div>

      {/* Results Summary Cards */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📊 Water Tank Results BOQ ({scopeOption === 'both' ? 'Concrete & Steel' : scopeOption === 'concrete_only' ? 'Concrete & Formwork' : 'Steel Rebar Only'})</span>
        </div>

        {/* Metric Grid */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>Water Storage Capacity</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.capacityLiters, 0)} Litres</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatNumber(calcResults.internalVolCft, 1)} CFT Net Storage)</span>
          </div>

          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>RCC Concrete Volume</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.rccVolCft, 1)} CFT</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatNumber(calcResults.rccVolCum, 3)} CUM @ {inputs.grade})</span>
          </div>

          {calcResults.hasSteel && (
            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Steel Rebar</span>
              <span style={styles.metricVal}>{formatNumber(calcResults.totalSteelKg, 1)} kg</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>(Base, Walls & Cover Slab)</span>
            </div>
          )}

          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>Total Cost</span>
            <span style={styles.metricVal}>{formatCurrency(calcResults.grandTotal)}</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(calcResults.costPerLitre)} / Litre)</span>
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
          <button style={styles.btnSecondary} onClick={handleExportExcel}>📥 Export BOQ to Excel</button>
          <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share Estimate on WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
