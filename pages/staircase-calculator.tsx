import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
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

export default function StaircaseCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Scope Option: 'both' vs 'concrete_only' vs 'steel_only'
  const [scopeOption, setScopeOption] = useState<'both' | 'concrete_only' | 'steel_only'>('both');

  // DETAILED STAIRCASE INPUTS
  const initialInputs = {
    floors: 3,            // Number of floors
    floorHeightFt: 10,    // Floor height in feet
    riserIn: 7,           // Riser height in inches
    treadIn: 10,          // Tread width in inches
    widthFt: 4,           // Stair width in feet
    waistThickMm: 150,    // Waist slab thickness in mm
    landingLFt: 4,        // Landing length in feet
    landingWFt: 4,        // Landing width in feet
    landingsPerFloor: 2,  // Landings per floor
    grade: 'M20',         // Concrete grade: M20, M25, M30

    // Reinforcement
    mainDia: 12,          // Waist slab main bar dia in mm
    mainSpacingMm: 150,   // Main bar spacing in mm
    distDia: 10,          // Distribution bar dia in mm
    distSpacingMm: 200,   // Dist bar spacing in mm
    coverMm: 20,          // Clear cover in mm (20mm for slabs)

    // Finishes & Railings
    finishType: 'Granite',// Granite, Tiles, Cement Finish
    railingType: 'MS',    // MS, SS Glass, Wooden
    railingSides: 1       // 1 Side or 2 Sides
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
  const shutteringRate = getMasterRate(["SRV-STR-SHT", "staircase shuttering", "formwork"], 35);
  const finishRate = getMasterRate(["MAT-STR-FIN", "granite finish", "step finish"], inputs.finishType === 'Granite' ? 120 : 45);
  const railingRate = getMasterRate(["MAT-STR-RLG", "railing", "ms railing"], inputs.railingType === 'SS' ? 1800 : 850);
  const rccLabourRate = getMasterRate(["SRV-RCC-LAY", "rcc labour", "staircase labour"], 1000);

  const handleReset = () => setInputs(initialInputs);

  // IS 456 Structural Staircase Engine
  const calcResults = useMemo(() => {
    const hasConcrete = scopeOption === 'both' || scopeOption === 'concrete_only';
    const hasSteel = scopeOption === 'both' || scopeOption === 'steel_only';

    // Step Geometry Calculations
    const heightPerFloorIn = inputs.floorHeightFt * 12;
    const risersPerFloor = Math.round(heightPerFloorIn / inputs.riserIn);
    const totalRisers = risersPerFloor * inputs.floors;
    const flightsPerFloor = 2;
    const stepsPerFlight = risersPerFloor / flightsPerFloor;

    const riserFt = inputs.riserIn / 12;
    const treadFt = inputs.treadIn / 12;

    const flightRunFt = (stepsPerFlight - 1) * treadFt;
    const flightRiseFt = inputs.floorHeightFt / flightsPerFloor;
    const inclinedLenFt = Math.sqrt(flightRunFt * flightRunFt + flightRiseFt * flightRiseFt);

    // Concrete Volumes
    const waistSlabVolCftPerFlight = inclinedLenFt * inputs.widthFt * (inputs.waistThickMm / 304.8);
    const totalWaistSlabVolCft = waistSlabVolCftPerFlight * flightsPerFloor * inputs.floors;

    const stepVolCftPerStep = 0.5 * riserFt * treadFt * inputs.widthFt;
    const totalStepsVolCft = stepVolCftPerStep * totalRisers;

    const landingVolCftPerFloor = inputs.landingsPerFloor * inputs.landingLFt * inputs.landingWFt * (inputs.waistThickMm / 304.8);
    const totalLandingsVolCft = landingVolCftPerFloor * inputs.floors;

    const totalVolCft = totalWaistSlabVolCft + totalStepsVolCft + totalLandingsVolCft;
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
    const mainBarLenM = (inclinedLenFt * 0.3048) + (2 * 50 * inputs.mainDia / 1000);
    const mainBarCountPerFlight = Math.ceil((inputs.widthFt * 304.8 - 40) / inputs.mainSpacingMm) + 1;
    const totalMainWeightKg = hasSteel ? (flightsPerFloor * inputs.floors * mainBarCountPerFlight * mainBarLenM * ((inputs.mainDia * inputs.mainDia) / 162.2)) : 0;

    const distBarLenM = (inputs.widthFt * 0.3048);
    const distBarCountPerFlight = Math.ceil((inclinedLenFt * 304.8) / inputs.distSpacingMm) + 1;
    const totalDistWeightKg = hasSteel ? (flightsPerFloor * inputs.floors * distBarCountPerFlight * distBarLenM * ((inputs.distDia * inputs.distDia) / 162.2)) : 0;

    const landingSteelKgPerFloor = inputs.landingsPerFloor * (inputs.landingLFt * inputs.landingWFt) * 1.5;
    const totalLandingSteelKg = hasSteel ? (landingSteelKgPerFloor * inputs.floors) : 0;

    const totalSteelKg = totalMainWeightKg + totalDistWeightKg + totalLandingSteelKg;
    const bindingWireKg = hasSteel ? (totalSteelKg * 0.015) : 0;
    const coverBlockNos = hasSteel ? (inputs.floors * flightsPerFloor * 20) : 0;
    const waterLtr = hasConcrete ? (cementBags * 25) : 0;

    // Formwork Shuttering Soffit Area
    const shutteringAreaSqft = hasConcrete ? ((inclinedLenFt * inputs.widthFt * flightsPerFloor + inputs.landingsPerFloor * inputs.landingLFt * inputs.landingWFt) * inputs.floors) : 0;

    // Finishes & Railings
    const stepFinishAreaSqft = totalRisers * (riserFt + treadFt) * inputs.widthFt;
    const landingFinishAreaSqft = inputs.landingsPerFloor * inputs.landingLFt * inputs.landingWFt * inputs.floors;
    const totalFinishAreaSqft = stepFinishAreaSqft + landingFinishAreaSqft;

    const railingLengthFt = (inclinedLenFt * flightsPerFloor + inputs.landingLFt * inputs.landingsPerFloor) * inputs.floors * inputs.railingSides;
    const railingLengthRmt = railingLengthFt * 0.3048;

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
    const finishCost = totalFinishAreaSqft * (finishRate.found ? finishRate.rate : (inputs.finishType === 'Granite' ? 120 : 45));
    const railingCost = railingLengthRmt * (railingRate.found ? railingRate.rate : (inputs.railingType === 'SS' ? 1800 : 850));

    const labourRatePerCum = (hasConcrete && hasSteel) ? 1000 : hasConcrete ? 600 : 400;
    const rccLabourCost = totalVolCum * labourRatePerCum;

    const grandMatCost = cementCost + steelCost + sandCost + ca20Cost + ca12Cost + wireCost + coverCost + waterCost + shutteringCost + finishCost + railingCost;
    const grandTotal = grandMatCost + rccLabourCost;
    const costPerCft = totalVolCft > 0 ? grandTotal / totalVolCft : 0;

    const resultItems: any[] = [];

    if (hasConcrete) {
      resultItems.push(
        { code: cementRate.itemCode || "MAT-CEM-01", category: "Material", description: `Cement OPC 53 Grade (${inputs.grade} Mix)`, unit: "BAG", engQty: cementBags, procQty: Math.ceil(cementBags), rate: cementRate.rate, rateFound: cementRate.found, amount: cementCost },
        { code: sandRate.itemCode || "MAT-MSND-01", category: "Material", description: `M-Sand for Concrete Mix`, unit: "CFT", engQty: mSandCft, procQty: Math.ceil(mSandCft), rate: sandRate.rate, rateFound: sandRate.found, amount: sandCost },
        { code: ca20Rate.itemCode || "MAT-AGG-20", category: "Material", description: `20mm Coarse Aggregate`, unit: "CFT", engQty: ca20Cft, procQty: Math.ceil(ca20Cft), rate: ca20Rate.rate, rateFound: ca20Rate.found, amount: ca20Cost },
        { code: ca12Rate.itemCode || "MAT-AGG-12", category: "Material", description: `12mm Coarse Aggregate`, unit: "CFT", engQty: ca12Cft, procQty: Math.ceil(ca12Cft), rate: ca12Rate.rate, rateFound: ca12Rate.found, amount: ca12Cost },
        { code: waterRate.itemCode || "MAT-WTR-01", category: "Site Utility", description: `Construction Water for Curing & Concrete`, unit: "LTR", engQty: waterLtr, procQty: Math.ceil(waterLtr), rate: waterRate.rate, rateFound: waterRate.found, amount: waterCost },
        { code: shutteringRate.itemCode || "SRV-STR-SHT", category: "Formwork", description: `Staircase Formwork Shuttering Rental & Fixing Charges`, unit: "SQFT", engQty: shutteringAreaSqft, procQty: Math.ceil(shutteringAreaSqft), rate: shutteringRate.rate, rateFound: shutteringRate.found, amount: shutteringCost },
        { code: finishRate.itemCode || "MAT-STR-FIN", category: "Finishes", description: `${inputs.finishType} Tread & Riser Step Finish`, unit: "SQFT", engQty: totalFinishAreaSqft, procQty: Math.ceil(totalFinishAreaSqft), rate: finishRate.rate, rateFound: finishRate.found, amount: finishCost },
        { code: railingRate.itemCode || "MAT-STR-RLG", category: "Fabrication", description: `${inputs.railingType} Staircase Handrail & Balustrades`, unit: "RMT", engQty: railingLengthRmt, procQty: Math.ceil(railingLengthRmt), rate: railingRate.rate, rateFound: railingRate.found, amount: railingCost }
      );
    }

    if (hasSteel) {
      resultItems.push(
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - ${inputs.mainDia}mm Main Waist Slab Rebar`, unit: "KG", engQty: totalMainWeightKg, procQty: Math.ceil(totalMainWeightKg), rate: steelRate.rate, rateFound: steelRate.found, amount: totalMainWeightKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - ${inputs.distDia}mm Distribution Rebar`, unit: "KG", engQty: totalDistWeightKg, procQty: Math.ceil(totalDistWeightKg), rate: steelRate.rate, rateFound: steelRate.found, amount: totalDistWeightKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - Landing Slab Mesh Mat Rebar`, unit: "KG", engQty: totalLandingSteelKg, procQty: Math.ceil(totalLandingSteelKg), rate: steelRate.rate, rateFound: steelRate.found, amount: totalLandingSteelKg * steelRate.rate },
        { code: wireRate.itemCode || "MAT-BWR-01", category: "Material", description: `Steel Binding Wire (1.5% of steel)`, unit: "KG", engQty: bindingWireKg, procQty: Math.ceil(bindingWireKg), rate: wireRate.rate, rateFound: wireRate.found, amount: wireCost },
        { code: coverRate.itemCode || "MAT-CVR-01", category: "Material", description: `Staircase Waist Slab Cover Blocks (20mm)`, unit: "NOS", engQty: coverBlockNos, procQty: coverBlockNos, rate: coverRate.rate, rateFound: coverRate.found, amount: coverCost }
      );
    }

    resultItems.push({
      code: rccLabourRate.itemCode || "SRV-RCC-LAY",
      category: "Labour",
      description: `Staircase ${scopeOption === 'both' ? 'Concrete Casting & Bar Bending' : scopeOption === 'concrete_only' ? 'Concrete Casting & Shuttering' : 'Bar Bending & Steel Tying'} Labour`,
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
      totalRisers,
      totalVolCum,
      totalVolCft,
      cementBags,
      totalSteelKg,
      totalMainWeightKg,
      totalDistWeightKg,
      totalLandingSteelKg,
      mSandCft,
      ca20Cft,
      ca12Cft,
      bindingWireKg,
      coverBlockNos,
      waterLtr,
      shutteringAreaSqft,
      totalFinishAreaSqft,
      railingLengthRmt,
      grandMatCost,
      rccLabourCost,
      grandTotal,
      costPerCft,
      resultItems
    };
  }, [inputs, scopeOption, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, wireRate, coverRate, waterRate, shutteringRate, finishRate, railingRate, rccLabourRate]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('calculator_export', 'staircase-calculator', () => {
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
      XLSX.utils.book_append_sheet(wb, ws, "Staircase_Structural_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Staircase_Estimate_${scopeOption}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'staircase-calculator', () => {
      const msg = `*BuildMitra RCC Staircase Structural Report*%0A` +
        `*Scope Option*: ${scopeOption === 'both' ? 'Both Concrete & Steel' : scopeOption === 'concrete_only' ? 'Only Concrete & Shuttering' : 'Only Steel Mesh'}` +
        `----------------------------------------%0A` +
        `• *Floors*: ${inputs.floors} | *Risers*: ${calcResults.totalRisers} Nos (${inputs.riserIn}" Riser x ${inputs.treadIn}" Tread x ${inputs.widthFt}ft Width)%0A` +
        `• *Concrete Volume*: ${formatNumber(calcResults.totalVolCft)} CFT (${formatNumber(calcResults.totalVolCum, 3)} CUM)%0A` +
        (calcResults.hasConcrete ? `• *Cement*: ${formatNumber(calcResults.cementBags)} Bags | *Shuttering*: ${formatNumber(calcResults.shutteringAreaSqft)} Sqft%0A` : '') +
        (calcResults.hasSteel ? `• *Steel Rebar*: ${formatNumber(calcResults.totalSteelKg)} kg (${inputs.mainDia}mm Main + ${inputs.distDia}mm Dist)%0A` : '') +
        `• *Finishes & Railing*: ${inputs.finishType} Finish (${formatNumber(calcResults.totalFinishAreaSqft)} Sqft) | ${inputs.railingType} Railing (${formatNumber(calcResults.railingLengthRmt)} RMT)%0A` +
        `• *Material & Finishes Total*: ${formatCurrency(calcResults.grandMatCost)}%0A` +
        `• *Labour Total*: ${formatCurrency(calcResults.rccLabourCost)}%0A` +
        `• *TOTAL ESTIMATED COST*: ${formatCurrency(calcResults.grandTotal)} (${formatCurrency(calcResults.costPerCft)}/CFT)%0A%0A` +
        `*Generated via BuildMitra Professional Estimator*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => router.push('/calculators')}>← Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          🪜 RCC Staircase Structural & Finishes Calculator
          <span style={styles.badge}>IS 456 Waist Slab & Railings</span>
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
          <option value="both">🔵 Both Concrete Materials & Steel Rebar (Complete RCC Staircase)</option>
          <option value="concrete_only">🧱 Only Concrete Materials & Formwork (No Steel Rebar)</option>
          <option value="steel_only">⚙️ Only Steel Rebar & Bar Bending Schedule (No Concrete Mix)</option>
        </select>
      </div>

      {/* 4. Detailed Input Form */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📐 Staircase Geometry & Structural Specifications</span>
        </div>

        <div style={styles.noteBox}>
          💡 <strong>IS 456 Structural Staircase Standards</strong>: Computes waist slab & triangular step concrete, nominal mix proportions, waist main & distribution rebar with $50d$ anchorage, landing steel mat, soffit formwork shuttering, granite/tile step finishes, and MS/SS handrailings.
        </div>

        <div style={styles.grid4}>
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
            <label style={styles.label}>Floor Height (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.floorHeightFt}
              onChange={e => setInputs({ ...inputs, floorHeightFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Riser Height (Inches)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.riserIn}
              onChange={e => setInputs({ ...inputs, riserIn: parseFloat(e.target.value) || 7 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Tread Width (Inches)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.treadIn}
              onChange={e => setInputs({ ...inputs, treadIn: parseFloat(e.target.value) || 10 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Staircase Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.widthFt}
              onChange={e => setInputs({ ...inputs, widthFt: parseFloat(e.target.value) || 4 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Waist Slab Thick (mm)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.waistThickMm}
              onChange={e => setInputs({ ...inputs, waistThickMm: parseFloat(e.target.value) || 150 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Landing Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.landingLFt}
              onChange={e => setInputs({ ...inputs, landingLFt: parseFloat(e.target.value) || 4 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Landing Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.landingWFt}
              onChange={e => setInputs({ ...inputs, landingWFt: parseFloat(e.target.value) || 4 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Landings Per Floor</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.landingsPerFloor}
              onChange={e => setInputs({ ...inputs, landingsPerFloor: parseFloat(e.target.value) || 2 })}
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
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#800020', marginBottom: '10px' }}>🔄 Waist Slab & Landing Reinforcement (Bar Schedule)</div>
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
                  onChange={e => setInputs({ ...inputs, distDia: parseFloat(e.target.value) || 10 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Dist Bar Spacing (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.distSpacingMm}
                  onChange={e => setInputs({ ...inputs, distSpacingMm: parseFloat(e.target.value) || 200 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Clear Cover (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.coverMm}
                  onChange={e => setInputs({ ...inputs, coverMm: parseFloat(e.target.value) || 20 })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Finishes & Railing Controls */}
        <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#166534', marginBottom: '10px' }}>🎨 Step Finishes & Handrailings Controls</div>
          <div style={styles.grid3}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Step Finish Material</label>
              <select style={styles.select} value={inputs.finishType} onChange={e => setInputs({ ...inputs, finishType: e.target.value })}>
                <option value="Granite">Polished Granite Slabs (₹120/sqft)</option>
                <option value="Tiles">Vitrified Staircase Tiles (₹45/sqft)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Handrailing Material</label>
              <select style={styles.select} value={inputs.railingType} onChange={e => setInputs({ ...inputs, railingType: e.target.value })}>
                <option value="MS">Fabricated MS Railings (₹850/RMT)</option>
                <option value="SS">SS 304 / Toughened Glass Railings (₹1800/RMT)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Railing Sides</label>
              <select style={styles.select} value={inputs.railingSides} onChange={e => setInputs({ ...inputs, railingSides: parseInt(e.target.value) })}>
                <option value={1}>1 Side Railing</option>
                <option value={2}>2 Sides Railings</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Staircase Form</button>
        </div>
      </div>

      {/* Results Summary Cards */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📊 Staircase Results BOQ ({scopeOption === 'both' ? 'Concrete & Steel' : scopeOption === 'concrete_only' ? 'Concrete & Formwork' : 'Steel Rebar Only'})</span>
        </div>

        {/* Metric Grid */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>RCC Concrete Volume</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.totalVolCft)} CFT</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({calcResults.totalRisers} Risers @ {inputs.grade})</span>
          </div>

          {calcResults.hasConcrete && (
            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>Cement & Water</span>
              <span style={styles.metricVal}>{formatNumber(calcResults.cementBags, 1)} Bags | {formatNumber(calcResults.waterLtr, 0)} Ltr</span>
            </div>
          )}

          {calcResults.hasSteel && (
            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Steel Rebar</span>
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
