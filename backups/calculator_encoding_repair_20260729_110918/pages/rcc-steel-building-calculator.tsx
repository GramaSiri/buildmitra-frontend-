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
  btnDanger: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },
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
  return `Ã¢â€šÂ¹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export default function FullBuildingCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Mode: 'quick' vs 'turnkey'
  const [calcMode, setCalcMode] = useState<'quick' | 'turnkey'>('quick');

  // BUILDING INPUTS
  const initialInputs = {
    plotLength: 30, // ft
    plotWidth: 40,  // ft
    floors: 2,      // floors
    buaFactor: 0.85,// BUA Coverage Factor
    floorHeight: 10,// ft
    qualityGrade: 'Standard' // Basic, Standard, Premium
  };
  const [inputs, setInputs] = useState(initialInputs);

  // Admin Master Rates Lookup
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53", "opc"], 385);
  const steelRate = getMasterRate(["MAT-STL-01", "tmt steel", "steel", "rebar"], 68);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 46);
  const ca20Rate = getMasterRate(["MAT-AGG-20", "20mm aggregate", "aggregate"], 40);
  const ca12Rate = getMasterRate(["MAT-AGG-12", "12mm aggregate"], 42);
  const block6Rate = getMasterRate(["MAT-BLK-01", "6 inch block", "concrete block 6"], 45);
  const block4Rate = getMasterRate(["MAT-BRK-01", "clay brick", "4 inch block"], 7.50);
  const waterRate = getMasterRate(["MAT-WTR-01", "construction water", "water"], 0.05);

  const tilesRate = getMasterRate(["MAT-TIL-01", "flooring tiles", "tiles"], 65);
  const sanitaryRate = getMasterRate(["MAT-SAN-01", "sanitaryware", "cp fittings"], 18500);
  const doorRate = getMasterRate(["MAT-DOR-01", "door shutter", "teak door"], 6500);
  const windowRate = getMasterRate(["MAT-WIN-01", "upvc window", "window"], 3500);
  const paintRate = getMasterRate(["MAT-PNT-01", "painting", "wall putty"], 16);
  const railingsGateRate = getMasterRate(["MAT-RLG-01", "railings", "ms gate"], 45);
  const compoundWallRate = getMasterRate(["MAT-CWD-01", "compound wall"], 350);
  const wiringRate = getMasterRate(["MAT-ELE-01", "copper wiring", "electrical"], 65);
  const ohtTankRate = getMasterRate(["MAT-OHT-01", "overhead tank", "oht"], 8500);
  const ugSumpPumpRate = getMasterRate(["MAT-UGT-01", "sump tank", "pump set"], 45000);

  const civilLabourRate = getMasterRate(["SRV-BLD-LAY", "civil labour", "building labour"], 240);
  const turnkeyFinishingLabourRate = getMasterRate(["SRV-TRN-LAY", "turnkey finishing labour", "finishing labour"], 160);

  const handleReset = () => setInputs(initialInputs);

  // Consolidated Building Engine
  const calcResults = useMemo(() => {
    const plotArea = inputs.plotLength * inputs.plotWidth;
    const floorArea = plotArea * inputs.buaFactor;
    const bua = floorArea * inputs.floors;

    const gradeMultiplier = inputs.qualityGrade === 'Basic' ? 0.95 : inputs.qualityGrade === 'Premium' ? 1.15 : 1.0;

    // 1. Civil Structure Core
    const cementBags = bua * 0.40 * gradeMultiplier;
    const concreteCum = cementBags / 7.5;
    const concreteCft = concreteCum * 35.3147;

    const steelKgPerSqft = (3.0 + Math.max(inputs.floors - 1, 0) * 0.10) * gradeMultiplier;
    const totalSteelKg = bua * steelKgPerSqft;

    const mSandCft = cementBags * 1.98;
    const ca20Cft = cementBags * 2.38;
    const ca12Cft = cementBags * 1.58;

    const perimeter = 2 * (inputs.plotLength + inputs.plotWidth);
    const externalWallArea = perimeter * inputs.floorHeight * inputs.floors;
    const internalWallArea = bua * 1.15;
    const block6Nos = Math.ceil(externalWallArea / 0.89);
    const block4Nos = Math.ceil(internalWallArea / 0.89);
    const waterLtr = cementBags * 25;

    // 2. Turnkey Finishing Scope
    const tilesSqft = bua * 1.20;
    const bathroomSets = Math.ceil(inputs.floors * 2);
    const doorSets = Math.ceil(inputs.floors * 4);
    const windowNos = Math.ceil(inputs.floors * 4);
    const paintAreaSqft = bua * 3.5;
    const railingsGateSqft = bua;
    const compoundWallSqft = perimeter * 6;
    const wiringSqft = bua;
    const ohtTankNos = Math.ceil(inputs.floors / 2);
    const ugSumpPumpSets = 1;

    // 3. Item Costs Calculation
    const cementCost = cementBags * (cementRate.found ? cementRate.rate : 385);
    const steelCost = totalSteelKg * (steelRate.found ? steelRate.rate : 68);
    const sandCost = mSandCft * (sandRate.found ? sandRate.rate : 46);
    const ca20Cost = ca20Cft * (ca20Rate.found ? ca20Rate.rate : 40);
    const ca12Cost = ca12Cft * (ca12Rate.found ? ca12Rate.rate : 42);
    const block6Cost = block6Nos * (block6Rate.found ? block6Rate.rate : 45);
    const block4Cost = block4Nos * (block4Rate.found ? block4Rate.rate : 7.50);
    const waterCost = waterLtr * (waterRate.found ? waterRate.rate : 0.05);

    const tilesCost = tilesSqft * (tilesRate.found ? tilesRate.rate : 65);
    const sanitaryCost = bathroomSets * (sanitaryRate.found ? sanitaryRate.rate : 18500);
    const doorCost = doorSets * (doorRate.found ? doorRate.rate : 6500);
    const windowCost = windowNos * (windowRate.found ? windowRate.rate : 3500);
    const paintCost = paintAreaSqft * (paintRate.found ? paintRate.rate : 16);
    const railingsGateCost = railingsGateSqft * (railingsGateRate.found ? railingsGateRate.rate : 45);
    const compoundWallCost = compoundWallSqft * (compoundWallRate.found ? compoundWallRate.rate : 350);
    const wiringCost = wiringSqft * (wiringRate.found ? wiringRate.rate : 65);
    const ohtTankCost = ohtTankNos * (ohtTankRate.found ? ohtTankRate.rate : 8500);
    const ugSumpPumpCost = ugSumpPumpSets * (ugSumpPumpRate.found ? ugSumpPumpRate.rate : 45000);

    const civilLabourCost = bua * (civilLabourRate.found ? civilLabourRate.rate : 240);
    const turnkeyLabourCost = bua * ((civilLabourRate.found ? civilLabourRate.rate : 240) + (turnkeyFinishingLabourRate.found ? turnkeyFinishingLabourRate.rate : 160));

    // QUICK CIVIL SHELL CONSOLIDATION
    const quickMatCost = cementCost + steelCost + sandCost + ca20Cost + ca12Cost + block6Cost + block4Cost + waterCost;
    const quickGrandTotal = quickMatCost + civilLabourCost;
    const quickRatePerSqft = bua > 0 ? quickGrandTotal / bua : 0;

    // TURNKEY FULL FINISHED BUILDING CONSOLIDATION
    const turnkeyMatCost = quickMatCost + tilesCost + sanitaryCost + doorCost + windowCost + paintCost + railingsGateCost + compoundWallCost + wiringCost + ohtTankCost + ugSumpPumpCost;
    const turnkeyGrandTotal = turnkeyMatCost + turnkeyLabourCost;
    const turnkeyRatePerSqft = bua > 0 ? turnkeyGrandTotal / bua : 0;

    // Active Results depending on Selected Mode
    const activeMatCost = calcMode === 'quick' ? quickMatCost : turnkeyMatCost;
    const activeLabourCost = calcMode === 'quick' ? civilLabourCost : turnkeyLabourCost;
    const activeGrandTotal = calcMode === 'quick' ? quickGrandTotal : turnkeyGrandTotal;
    const activeRatePerSqft = calcMode === 'quick' ? quickRatePerSqft : turnkeyRatePerSqft;

    const resultItems: any[] = [
      { code: cementRate.itemCode || "MAT-CEM-01", category: "Material", description: `Cement OPC 53 Grade (Structure + Masonry + Plaster)`, unit: "BAG", engQty: cementBags, procQty: Math.ceil(cementBags), rate: cementRate.rate, rateFound: cementRate.found, amount: cementCost },
      { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `TMT Steel Rebar Fe 500D (Footings, Columns, Beams, Slabs)`, unit: "KG", engQty: totalSteelKg, procQty: Math.ceil(totalSteelKg), rate: steelRate.rate, rateFound: steelRate.found, amount: steelCost },
      { code: sandRate.itemCode || "MAT-MSND-01", category: "Material", description: `M-Sand (Concrete, Mortar & Plastering)`, unit: "CFT", engQty: mSandCft, procQty: Math.ceil(mSandCft), rate: sandRate.rate, rateFound: sandRate.found, amount: sandCost },
      { code: ca20Rate.itemCode || "MAT-AGG-20", category: "Material", description: `20mm Coarse Aggregate for Concrete`, unit: "CFT", engQty: ca20Cft, procQty: Math.ceil(ca20Cft), rate: ca20Rate.rate, rateFound: ca20Rate.found, amount: ca20Cost },
      { code: ca12Rate.itemCode || "MAT-AGG-12", category: "Material", description: `12mm Coarse Aggregate for Concrete & Lintels`, unit: "CFT", engQty: ca12Cft, procQty: Math.ceil(ca12Cft), rate: ca12Rate.rate, rateFound: ca12Rate.found, amount: ca12Cost },
      { code: block6Rate.itemCode || "MAT-BLK-01", category: "Material", description: `6" Concrete Solid Blocks (External Outer Walls)`, unit: "NOS", engQty: block6Nos, procQty: block6Nos, rate: block6Rate.rate, rateFound: block6Rate.found, amount: block6Cost },
      { code: block4Rate.itemCode || "MAT-BRK-01", category: "Material", description: `4.5" Partition Bricks / Blocks (Internal Walls)`, unit: "NOS", engQty: block4Nos, procQty: block4Nos, rate: block4Rate.rate, rateFound: block4Rate.found, amount: block4Cost },
      { code: waterRate.itemCode || "MAT-WTR-01", category: "Site Utility", description: `Construction Water Supply (Mixing & Curing)`, unit: "LTR", engQty: waterLtr, procQty: Math.ceil(waterLtr), rate: waterRate.rate, rateFound: waterRate.found, amount: waterCost }
    ];

    if (calcMode === 'turnkey') {
      resultItems.push(
        { code: tilesRate.itemCode || "MAT-TIL-01", category: "Material", description: `Vitrified Flooring & Anti-skid Wall Tiles`, unit: "SQFT", engQty: tilesSqft, procQty: Math.ceil(tilesSqft), rate: tilesRate.rate, rateFound: tilesRate.found, amount: tilesCost },
        { code: sanitaryRate.itemCode || "MAT-SAN-01", category: "Material", description: `Sanitaryware & CP Fittings Complete Bathroom Sets`, unit: "SET", engQty: bathroomSets, procQty: bathroomSets, rate: sanitaryRate.rate, rateFound: sanitaryRate.found, amount: sanitaryCost },
        { code: doorRate.itemCode || "MAT-DOR-01", category: "Material", description: `Teak Main Door & Flush Door Shutters + Frame Polishing`, unit: "SET", engQty: doorSets, procQty: doorSets, rate: doorRate.rate, rateFound: doorRate.found, amount: doorCost },
        { code: windowRate.itemCode || "MAT-WIN-01", category: "Material", description: `UPVC Sliding Windows & Sunshade Chajja Sets`, unit: "NOS", engQty: windowNos, procQty: windowNos, rate: windowRate.rate, rateFound: windowRate.found, amount: windowCost },
        { code: paintRate.itemCode || "MAT-PNT-01", category: "Material", description: `Internal Putty & External Weatherproof Painting`, unit: "SQFT", engQty: paintAreaSqft, procQty: Math.ceil(paintAreaSqft), rate: paintRate.rate, rateFound: paintRate.found, amount: paintCost },
        { code: railingsGateRate.itemCode || "MAT-RLG-01", category: "Material", description: `Staircase SS 304 Railings & Fabricated Main MS Gate`, unit: "SQFT", engQty: railingsGateSqft, procQty: Math.ceil(railingsGateSqft), rate: railingsGateRate.rate, rateFound: railingsGateRate.found, amount: railingsGateCost },
        { code: compoundWallRate.itemCode || "MAT-CWD-01", category: "Material", description: `Perimeter Compound Wall Masonry & Plaster (6ft Height)`, unit: "SQFT", engQty: compoundWallSqft, procQty: Math.ceil(compoundWallSqft), rate: compoundWallRate.rate, rateFound: compoundWallRate.found, amount: compoundWallCost },
        { code: wiringRate.itemCode || "MAT-ELE-01", category: "Material", description: `Concealed Fire-Resistant Copper Wiring & Modular Switches DB`, unit: "SQFT", engQty: wiringSqft, procQty: Math.ceil(wiringSqft), rate: wiringRate.rate, rateFound: wiringRate.found, amount: wiringCost },
        { code: ohtTankRate.itemCode || "MAT-OHT-01", category: "Material", description: `Overhead Water Tank (1000L Triple Layer PVC)`, unit: "NOS", engQty: ohtTankNos, procQty: ohtTankNos, rate: ohtTankRate.rate, rateFound: ohtTankRate.found, amount: ohtTankCost },
        { code: ugSumpPumpRate.itemCode || "MAT-UGT-01", category: "Material", description: `Underground Sump Tank (5000L) & Submersible Water Pump Set`, unit: "SET", engQty: ugSumpPumpSets, procQty: ugSumpPumpSets, rate: ugSumpPumpRate.rate, rateFound: ugSumpPumpRate.found, amount: ugSumpPumpCost },
        { code: turnkeyFinishingLabourRate.itemCode || "SRV-TRN-LAY", category: "Labour", description: `Turnkey Full Building Finishing & Contracting Labour`, unit: "SQFT", engQty: bua, procQty: bua, rate: 400, rateFound: true, amount: turnkeyLabourCost }
      );
    } else {
      resultItems.push({ code: civilLabourRate.itemCode || "SRV-BLD-LAY", category: "Labour", description: `Structure & Core Civil Construction Labour`, unit: "SQFT", engQty: bua, procQty: bua, rate: civilLabourRate.rate, rateFound: civilLabourRate.found, amount: civilLabourCost });
    }

    return {
      plotArea,
      floorArea,
      bua,
      concreteCum,
      concreteCft,
      cementBags,
      totalSteelKg,
      mSandCft,
      ca20Cft,
      ca12Cft,
      block6Nos,
      block4Nos,
      tilesSqft,
      bathroomSets,
      doorSets,
      windowNos,
      paintAreaSqft,
      compoundWallSqft,
      waterLtr,

      quickGrandTotal,
      quickRatePerSqft,
      turnkeyGrandTotal,
      turnkeyRatePerSqft,

      activeMatCost,
      activeLabourCost,
      activeGrandTotal,
      activeRatePerSqft,
      resultItems
    };
  }, [inputs, calcMode, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, block6Rate, block4Rate, waterRate, tilesRate, sanitaryRate, doorRate, windowRate, paintRate, railingsGateRate, compoundWallRate, wiringRate, ohtTankRate, ugSumpPumpRate, civilLabourRate, turnkeyFinishingLabourRate]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('calculator_export', 'rcc-steel-building-calculator', () => {
      const items = calcResults.resultItems;
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
      XLSX.utils.book_append_sheet(wb, ws, "Building_Estimation_Results");
      XLSX.writeFile(wb, `BuildMitra_Building_Calculator_${calcMode}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'rcc-steel-building-calculator', () => {
      const msg = `*BuildMitra Full Building Construction Estimate Report*%0A` +
        `*Estimation Mode*: ${calcMode === 'quick' ? 'Ã¢Å¡Â¡ Quick Civil Shell' : 'Ã°Å¸â€â€˜ Turnkey Full Finished Building'}%0A` +
        `----------------------------------------%0A` +
        `Ã¢â‚¬Â¢ *Total Built-Up Area (BUA)*: ${formatNumber(calcResults.bua)} Sqft (${inputs.floors} Floors)%0A` +
        `Ã¢â‚¬Â¢ *Cement (50kg OPC 53)*: ${formatNumber(calcResults.cementBags)} Bags%0A` +
        `Ã¢â‚¬Â¢ *TMT Steel Rebar (Fe 500D)*: ${formatNumber(calcResults.totalSteelKg)} kg%0A` +
        `Ã¢â‚¬Â¢ *Masonry Blocks*: 6" Outer ${formatNumber(calcResults.block6Nos, 0)} Nos | 4.5" Partition ${formatNumber(calcResults.block4Nos, 0)} Nos%0A` +
        `----------------------------------------%0A` +
        `Ã¢â‚¬Â¢ *Ã¢Å¡Â¡ Quick Civil Shell Cost*: ${formatCurrency(calcResults.quickGrandTotal)} (${formatCurrency(calcResults.quickRatePerSqft)}/Sqft)%0A` +
        `Ã¢â‚¬Â¢ *Ã°Å¸â€â€˜ Turnkey Full Finished Cost*: ${formatCurrency(calcResults.turnkeyGrandTotal)} (${formatCurrency(calcResults.turnkeyRatePerSqft)}/Sqft)%0A%0A` +
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
          Ã°Å¸Ââ€”Ã¯Â¸Â Full Building Structural & Turnkey Finishes Calculator
          <span style={styles.badge}>Civil Shell & Turnkey BOQ</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#fecdd3' }}>BuildMitra Professional Edition</span>
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
          onChange={(e) => setCalcMode(e.target.value as 'quick' | 'turnkey')}
        >
          <option value="quick">Ã¢Å¡Â¡ Quick Civil Shell Calculation (Structure + Masonry + Plastering + Civil Labour)</option>
          <option value="turnkey">Ã°Å¸â€â€˜ Turnkey Full Finished Building Calculation (Complete Shell + Tiles + Sanitary + Doors + Painting + Gates + Wiring + Tanks)</option>
        </select>
      </div>
        </div>
        <div className="engineering-specimen-top">
      <EngineeringSpecimen kind="steel-building" title="Dynamic RCC Building Specimen" material={calcMode} data={{ lengthFt: inputs.plotLength, widthFt: inputs.plotWidth, heightFt: inputs.floorHeight, type: calcMode }} />
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

      {/* Building Input Card */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>Ã°Å¸â€œÂ Building Plot & Floor Dimensions</span>
        </div>

        <div style={styles.noteBox}>
          Ã°Å¸â€™Â¡ <strong>Consolidated Civil Engineering Benchmark</strong>: Enter Plot Dimensions & Floors. System calculates consolidated quantities for Structure, Masonry, Plaster, Doors/Windows, MEP, Plumbing, Electrical, Compound Wall, Tanks, and Turnkey Labour.
        </div>

        <div style={styles.grid4}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Plot Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.plotLength}
              onChange={e => setInputs({ ...inputs, plotLength: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Plot Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.plotWidth}
              onChange={e => setInputs({ ...inputs, plotWidth: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Number of Floors (Nos)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.floors}
              onChange={e => setInputs({ ...inputs, floors: parseFloat(e.target.value) || 1 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>BUA Factor (Coverage Ratio)</label>
            <input
              type="number"
              step="0.01"
              style={styles.input}
              value={inputs.buaFactor}
              onChange={e => setInputs({ ...inputs, buaFactor: parseFloat(e.target.value) || 0.85 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Floor Height (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.floorHeight}
              onChange={e => setInputs({ ...inputs, floorHeight: parseFloat(e.target.value) || 10 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Quality Specification Grade</label>
            <select
              style={{ ...styles.select, fontWeight: '700' }}
              value={inputs.qualityGrade}
              onChange={e => setInputs({ ...inputs, qualityGrade: e.target.value })}
            >
              <option value="Standard">Standard Residential Construction</option>
              <option value="Basic">Economy Basic Structure</option>
              <option value="Premium">Premium Luxury Structure</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>Ã°Å¸â€â€ž Reset Building Form</button>
        </div>
      </div>

      {/* Results Summary Cards */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>Ã°Å¸â€œÅ  Full Building Consolidated Results & Cost Comparisons</span>
        </div>

        {/* Dual Rate Summary Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '10px', padding: '16px', color: '#166534' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Ã¢Å¡Â¡ Quick Civil Shell Estimate</div>
            <div style={{ fontSize: '24px', fontWeight: '900', margin: '6px 0' }}>{formatCurrency(calcResults.quickGrandTotal)}</div>
            <div style={{ fontSize: '13px', fontWeight: '700' }}>Rate: {formatCurrency(calcResults.quickRatePerSqft)} / Sqft</div>
            <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px' }}>(Structure + Masonry + Plaster + Civil Labour)</div>
          </div>

          <div style={{ backgroundColor: '#fff5f7', border: '2px solid #fecdd3', borderRadius: '10px', padding: '16px', color: '#800020' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Ã°Å¸â€â€˜ Turnkey Full Finished Building</div>
            <div style={{ fontSize: '24px', fontWeight: '900', margin: '6px 0' }}>{formatCurrency(calcResults.turnkeyGrandTotal)}</div>
            <div style={{ fontSize: '13px', fontWeight: '700' }}>Rate: {formatCurrency(calcResults.turnkeyRatePerSqft)} / Sqft</div>
            <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px' }}>(Complete Shell + Tiles + Doors + Painting + Gates + Wiring + Tanks + Labour)</div>
          </div>
        </div>

        {/* Metric Grid */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>Built-Up Area (BUA)</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.bua)} Sqft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Cement & Steel</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.cementBags, 0)} Bags | {formatNumber(calcResults.totalSteelKg, 0)} kg</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Masonry Blocks</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.block6Nos + calcResults.block4Nos, 0)} Nos</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>Active Mode Cost</span>
            <span style={styles.metricVal}>{formatCurrency(calcResults.activeGrandTotal)}</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(calcResults.activeRatePerSqft)} / Sqft)</span>
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
          <button style={styles.btnSecondary} onClick={handleExportExcel}>Ã°Å¸â€œÂ¥ Export BOQ to Excel</button>
          <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>Ã°Å¸â€œÂ² Share Estimate on WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
