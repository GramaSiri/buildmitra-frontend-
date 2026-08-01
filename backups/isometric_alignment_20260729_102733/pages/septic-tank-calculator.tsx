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
  header: { backgroundColor: '#800020', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(128,0,32,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#a51d36', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

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
  return `â‚¹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export default function SepticTankCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // DETAILED SEPTIC TANK INPUTS
  const initialInputs = {
    lengthFt: 8,            // Internal length in feet
    widthFt: 4,             // Internal width in feet
    depthFt: 5,             // Internal depth in feet
    wallMaterial: 'Size Stones', // Size Stones (SS Masonry) vs Concrete Block
    coverThickMm: 200,      // RCC Cover slab thickness in mm (200mm = 8 inches)
    grade: 'M20',           // RCC Cover slab grade
    includePCC: false       // Direct bedding / No heavy PCC bed
  };

  const [inputs, setInputs] = useState(initialInputs);

  // Admin Master Rates Lookup
  const sizeStoneRate = getMasterRate(["MAT-SSM-01", "size stone", "ss masonry"], 38);
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53", "opc"], 385);
  const steelRate = getMasterRate(["MAT-STL-01", "tmt steel", "steel", "rebar"], 68);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 46);
  const ca20Rate = getMasterRate(["MAT-AGG-20", "20mm aggregate", "aggregate"], 40);
  const ca12Rate = getMasterRate(["MAT-AGG-12", "12mm aggregate"], 42);
  const blockRate = getMasterRate(["MAT-BLK-06", "solid block", "block"], 45);
  const wireRate = getMasterRate(["MAT-BWR-01", "binding wire"], 80);
  const coverRate = getMasterRate(["MAT-CVR-01", "cover block"], 5);
  const waterRate = getMasterRate(["MAT-WTR-01", "construction water", "water"], 0.05);
  const pvcRate = getMasterRate(["MAT-PVC-01", "pvc sleeve", "pvc set"], 450);
  const shutteringRate = getMasterRate(["SRV-SEP-SHT", "septic shuttering", "formwork"], 35);
  const rccLabourRate = getMasterRate(["SRV-RCC-LAY", "rcc labour", "tank labour"], 1000);

  const handleReset = () => setInputs(initialInputs);

  // IS 2470 Code Septic Tank Engine
  const calcResults = useMemo(() => {
    // 1. Storage Capacity
    const internalVolCft = inputs.lengthFt * inputs.widthFt * inputs.depthFt;
    const totalCapacityLiters = internalVolCft * 28.3168;
    const liquidDepthFt = Math.max(inputs.depthFt - 1.0, 3.5); // 1ft freeboard per IS 2470
    const effectiveCapacityLiters = inputs.lengthFt * inputs.widthFt * liquidDepthFt * 28.3168;
    const userCapacityNos = Math.floor(effectiveCapacityLiters / 180);

    // 2. Wall Construction: Size Stones / Solid Blocks in 1:20 Lean Mortar Ratio
    const wallAreaSqft = 2 * (inputs.lengthFt + inputs.widthFt) * inputs.depthFt;

    let wallUnitName = "Size Stones (SS Masonry)";
    let wallUnitCode = sizeStoneRate.itemCode || "MAT-SSM-01";
    let wallQty = Math.ceil(wallAreaSqft * 1.0); // 1 CFT Size Stones per sqft of 1ft thick SS wall
    let wallRateVal = sizeStoneRate.rate;
    let wallRateFound = sizeStoneRate.found;
    let cementBagsWall = wallAreaSqft * 0.015; // Very minimal cement in 1:20 lean mortar ratio

    if (inputs.wallMaterial === 'Concrete Block') {
      wallUnitName = 'Solid Concrete Blocks (8" Wall)';
      wallUnitCode = blockRate.itemCode || "MAT-BLK-06";
      wallQty = Math.ceil(wallAreaSqft * 1.125);
      wallRateVal = blockRate.rate;
      wallRateFound = blockRate.found;
      cementBagsWall = wallQty * 0.012; // Minimal cement
    }

    const wallCost = wallQty * (wallRateFound ? wallRateVal : (inputs.wallMaterial === 'Size Stones' ? 38 : 45));

    // 3. RCC Cover Slab (200mm / 8 inches Thickness)
    const coverThickFt = inputs.coverThickMm / 304.8;
    const outerLengthFt = inputs.lengthFt + 2 * (1.0);
    const outerWidthFt = inputs.widthFt + 2 * (1.0);

    const coverSlabVolCft = (outerLengthFt * outerWidthFt * coverThickFt) - (1.5 * 1.5 * coverThickFt);
    const coverSlabVolCum = coverSlabVolCft / 35.3147;

    // Concrete Mix Ingredients (M20)
    let cementFactor = 8.07;
    let mSandFactor = 14.81;
    let ca20Factor = 17.77;
    let ca12Factor = 11.85;

    if (inputs.grade === 'M25') {
      cementFactor = 11.10;
      mSandFactor = 13.60;
      ca20Factor = 16.32;
      ca12Factor = 10.88;
    }

    const coverCementBags = coverSlabVolCum * cementFactor;
    const totalCementBags = cementBagsWall + coverCementBags;

    const mSandCft = coverSlabVolCum * mSandFactor + wallAreaSqft * 0.15;
    const ca20Cft = coverSlabVolCum * ca20Factor;
    const ca12Cft = coverSlabVolCum * ca12Factor;

    // Steel Reinforcement (10mm/12mm Mesh in 200mm Cover Slab)
    const coverSteelKg = coverSlabVolCft * 1.50; // ~1.5 kg/CFT for 200mm slab mesh
    const bindingWireKg = coverSteelKg * 0.015;
    const coverBlockNos = 16;
    const waterLtr = totalCementBags * 25;

    // Formwork Shuttering Surface Area
    const shutteringAreaSqft = coverSlabVolCft * 2;

    // PVC Inlet, Outlet Sleeves & 100mm Air Vent Set
    const pvcSets = 1;

    // Cost Breakdown
    const cementCost = totalCementBags * (cementRate.found ? cementRate.rate : 385);
    const steelCost = coverSteelKg * (steelRate.found ? steelRate.rate : 68);
    const sandCost = mSandCft * (sandRate.found ? sandRate.rate : 46);
    const ca20Cost = ca20Cft * (ca20Rate.found ? ca20Rate.rate : 40);
    const ca12Cost = ca12Cft * (ca12Rate.found ? ca12Rate.rate : 42);
    const wireCost = bindingWireKg * (wireRate.found ? wireRate.rate : 80);
    const coverCost = coverBlockNos * (coverRate.found ? coverRate.rate : 5);
    const waterCost = waterLtr * (waterRate.found ? waterRate.rate : 0.05);
    const pvcCost = pvcSets * (pvcRate.found ? pvcRate.rate : 450);
    const shutteringCost = shutteringAreaSqft * (shutteringRate.found ? shutteringRate.rate : 35);

    const rccLabourCost = coverSlabVolCum * (rccLabourRate.found ? rccLabourRate.rate : 1000);

    const grandMatCost = wallCost + cementCost + steelCost + sandCost + ca20Cost + ca12Cost + wireCost + coverCost + waterCost + pvcCost + shutteringCost;
    const grandTotal = grandMatCost + rccLabourCost;
    const costPerLitre = effectiveCapacityLiters > 0 ? grandTotal / effectiveCapacityLiters : 0;

    const resultItems: any[] = [
      { code: wallUnitCode, category: "Masonry", description: `Pit Wall Masonry - ${wallUnitName} in 1:20 Lean Mortar Ratio`, unit: inputs.wallMaterial === 'Size Stones' ? "CFT" : "NOS", engQty: wallQty, procQty: wallQty, rate: wallRateVal, rateFound: wallRateFound, amount: wallCost },
      { code: cementRate.itemCode || "MAT-CEM-01", category: "Material", description: `Minimal Cement OPC 53 Grade (RCC 200mm Cover Slab + Lean Mortar)`, unit: "BAG", engQty: totalCementBags, procQty: Math.ceil(totalCementBags), rate: cementRate.rate, rateFound: cementRate.found, amount: cementCost },
      { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel Rebar - 10mm/12mm Mesh for 200mm RCC Cover Slab`, unit: "KG", engQty: coverSteelKg, procQty: Math.ceil(coverSteelKg), rate: steelRate.rate, rateFound: steelRate.found, amount: steelCost },
      { code: sandRate.itemCode || "MAT-MSND-01", category: "Material", description: `M-Sand for 200mm RCC Cover Slab & Plaster`, unit: "CFT", engQty: mSandCft, procQty: Math.ceil(mSandCft), rate: sandRate.rate, rateFound: sandRate.found, amount: sandCost },
      { code: ca20Rate.itemCode || "MAT-AGG-20", category: "Material", description: `20mm Coarse Aggregate for Cover Slab`, unit: "CFT", engQty: ca20Cft, procQty: Math.ceil(ca20Cft), rate: ca20Rate.rate, rateFound: ca20Rate.found, amount: ca20Cost },
      { code: ca12Rate.itemCode || "MAT-AGG-12", category: "Material", description: `12mm Coarse Aggregate for Cover Slab`, unit: "CFT", engQty: ca12Cft, procQty: Math.ceil(ca12Cft), rate: ca12Rate.rate, rateFound: ca12Rate.found, amount: ca12Cost },
      { code: pvcRate.itemCode || "MAT-PVC-01", category: "Plumbing", description: `PVC Inlet Pipe Sleeve, Outlet Dip Pipe & 100mm Air Vent Set`, unit: "SET", engQty: pvcSets, procQty: pvcSets, rate: pvcRate.rate, rateFound: pvcRate.found, amount: pvcCost },
      { code: waterRate.itemCode || "MAT-WTR-01", category: "Site Utility", description: `Construction Water for Curing`, unit: "LTR", engQty: waterLtr, procQty: Math.ceil(waterLtr), rate: waterRate.rate, rateFound: waterRate.found, amount: waterCost },
      { code: shutteringRate.itemCode || "SRV-SEP-SHT", category: "Formwork", description: `RCC Cover Slab Formwork Shuttering Rental & Fixing`, unit: "SQFT", engQty: shutteringAreaSqft, procQty: Math.ceil(shutteringAreaSqft), rate: shutteringRate.rate, rateFound: shutteringRate.found, amount: shutteringCost },
      { code: wireRate.itemCode || "MAT-BWR-01", category: "Material", description: `Steel Binding Wire (1.5% of steel)`, unit: "KG", engQty: bindingWireKg, procQty: Math.ceil(bindingWireKg), rate: wireRate.rate, rateFound: wireRate.found, amount: wireCost },
      { code: coverRate.itemCode || "MAT-CVR-01", category: "Material", description: `Cover Slab Concrete Cover Blocks`, unit: "NOS", engQty: coverBlockNos, procQty: coverBlockNos, rate: coverRate.rate, rateFound: coverRate.found, amount: coverCost },
      { code: rccLabourRate.itemCode || "SRV-RCC-LAY", category: "Labour", description: `Septic Tank Masonry & RCC Cover Slab Casting Labour`, unit: "CUM", engQty: coverSlabVolCum, procQty: coverSlabVolCum, rate: rccLabourRate.rate, rateFound: rccLabourRate.found, amount: rccLabourCost }
    ];

    return {
      totalCapacityLiters,
      effectiveCapacityLiters,
      userCapacityNos,
      internalVolCft,
      coverSlabVolCft,
      coverSlabVolCum,
      wallQty,
      cementBagsWall,
      totalCementBags,
      coverSteelKg,
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
      costPerLitre,
      resultItems
    };
  }, [inputs, sizeStoneRate, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, blockRate, wireRate, coverRate, waterRate, pvcRate, shutteringRate, rccLabourRate]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('calculator_export', 'septic-tank-calculator', () => {
      const data = calcResults.resultItems.map(item => ({
        "Master Item Code": item.code,
        "Category": item.category,
        "Description": item.description,
        "Unit": item.unit,
        "Engineering Qty": item.engQty,
        "Procurement Qty": item.procQty,
        "Approved Rate (â‚¹)": item.rateFound ? item.rate : "Rate Unavailable in Admin Master",
        "Amount (â‚¹)": item.rateFound ? item.amount : 0
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Septic_Tank_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Septic_Tank_Estimate.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'septic-tank-calculator', () => {
      const msg = `*BuildMitra Septic Tank Structural Report*%0A` +
        `----------------------------------------%0A` +
        `â€¢ *Septic Tank*: ${inputs.lengthFt}'x${inputs.widthFt}' x ${inputs.depthFt}ft Internal (${inputs.wallMaterial} in 1:20 Lean Mortar)%0A` +
        `â€¢ *Effective Capacity*: ${formatNumber(calcResults.effectiveCapacityLiters)} Litres (~${calcResults.userCapacityNos} Users)%0A` +
        `â€¢ *200mm RCC Cover Slab*: ${formatNumber(calcResults.coverSlabVolCft)} CFT (${formatNumber(calcResults.coverSlabVolCum, 3)} CUM)%0A` +
        `â€¢ *Minimal Cement Total*: ${formatNumber(calcResults.totalCementBags, 1)} Bags (Wall Mortar: ${formatNumber(calcResults.cementBagsWall, 1)} Bags)%0A` +
        `â€¢ *Cover Slab Steel Rebar*: ${formatNumber(calcResults.coverSteelKg, 1)} kg%0A` +
        `â€¢ *Plumbing*: PVC Inlet, Outlet & 100mm Air Vent Set%0A` +
        `â€¢ *Material Total*: ${formatCurrency(calcResults.grandMatCost)}%0A` +
        `â€¢ *Labour Total*: ${formatCurrency(calcResults.rccLabourCost)}%0A` +
        `â€¢ *TOTAL ESTIMATED COST*: ${formatCurrency(calcResults.grandTotal)} (${formatCurrency(calcResults.costPerLitre)}/Litre)%0A%0A` +
        `*Generated via BuildMitra Professional Estimator*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => router.push('/calculators')}>â† Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          ðŸš½ Septic Tank Volumetric & Structural Calculator
          <span style={styles.badge}>IS 2470 Code Sizing & Lean Mortar</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#fecdd3' }}>BuildMitra Professional Edition</span>
        </div>
      </div>

      {/* 2. Single Live Market Rate Ticker */}
      <MarketRateTrend />
      <EngineeringSpecimen kind="septic-tank" title="Dynamic Septic Tank Specimen" material={inputs.wallMaterial} data={{ lengthFt: inputs.lengthFt, widthFt: inputs.widthFt, heightFt: inputs.depthFt, wallType: inputs.wallMaterial, grade: inputs.grade }} />

      {/* 3. Detailed Input Form */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>ðŸ“ Septic Tank Geometry, Masonry & Cover Slab Specifications</span>
        </div>

        <div style={styles.noteBox}>
          ðŸ’¡ <strong>IS 2470 Septic Tank Code Standards</strong>: Recommends Size Stones or Concrete Blocks laid in 1:20 lean mortar ratio to minimize cement usage (no heavy PCC bed). Includes 200mm (8") RCC cover slab, PVC inlet/outlet sleeves, and 100mm air vent pipe set.
        </div>

        <div style={styles.grid4}>
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
            <label style={styles.label}>Internal Depth (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.depthFt}
              onChange={e => setInputs({ ...inputs, depthFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Wall Construction Material</label>
            <select
              style={{ ...styles.select, fontWeight: '700' }}
              value={inputs.wallMaterial}
              onChange={e => setInputs({ ...inputs, wallMaterial: e.target.value })}
            >
              <option value="Size Stones">Size Stones (SS Masonry in 1:20 Lean Mortar)</option>
              <option value="Concrete Block">Solid Concrete Blocks (8" Wall in 1:20 Lean Mortar)</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Cover Slab Thick (mm)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.coverThickMm}
              onChange={e => setInputs({ ...inputs, coverThickMm: parseFloat(e.target.value) || 200 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Cover Slab Grade</label>
            <select
              style={{ ...styles.select, fontWeight: '700' }}
              value={inputs.grade}
              onChange={e => setInputs({ ...inputs, grade: e.target.value })}
            >
              <option value="M20">M20 (1 : 1.5 : 3)</option>
              <option value="M25">M25 (1 : 1 : 2)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>ðŸ”„ Reset Septic Tank Form</button>
        </div>
      </div>

      {/* Results Summary Cards */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>ðŸ“Š Septic Tank Results BOQ (Size Stones / Blocks + 200mm Cover Slab)</span>
        </div>

        {/* Metric Grid */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>Effective Capacity</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.effectiveCapacityLiters, 0)} Litres</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>(~{calcResults.userCapacityNos} User Capacity)</span>
          </div>

          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Minimal Cement Usage</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.totalCementBags, 1)} Bags</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>(Wall Mortar: {formatNumber(calcResults.cementBagsWall, 1)} Bags)</span>
          </div>

          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Cover Slab Rebar</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.coverSteelKg, 1)} kg</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>(200mm RCC Slab Mesh)</span>
          </div>

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
                      backgroundColor: item.category === 'Material' || item.category === 'Masonry' ? '#e0f2fe' : item.category === 'Labour' ? '#ffedd5' : '#f0fdf4',
                      color: item.category === 'Material' || item.category === 'Masonry' ? '#0369a1' : item.category === 'Labour' ? '#c2410c' : '#166534',
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
          <button style={styles.btnSecondary} onClick={handleExportExcel}>ðŸ“¥ Export BOQ to Excel</button>
          <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>ðŸ“² Share Estimate on WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
