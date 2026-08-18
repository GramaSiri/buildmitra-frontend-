import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
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

  btnPrimary: { backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnDanger: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '6px', width: '100%', maxWidth: '100%', overflowX: 'scroll', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x', overscrollBehaviorX: 'contain', scrollSnapType: 'x proximity', scrollbarWidth: 'thin', padding: '3px 2px 8px', margin: '3px 0 6px' },
  metricCard: { flex: '0 0 138px', width: '138px', minWidth: '138px', maxWidth: '150px', minHeight: '68px', height: 'auto', padding: '6px', margin: 0, borderRadius: '7px', boxSizing: 'border-box', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', scrollSnapAlign: 'start' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricBlue: { backgroundColor: '#2563eb' },
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
  noteBox: { backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#0f766e', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "Rate Unavailable in Admin Master";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export default function PlasterCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Mode: 'quick' vs 'detailed'
  const [calcMode, setCalcMode] = useState<'quick' | 'detailed'>('quick');

  // QUICK CALCULATION INPUTS (PLOT SIZE L x W x FLOORS BUA THUMB RULE)
  const initialQuickInputs = {
    inputType: 'Plot Dimensions (L x W x Floors)', // 'Plot Dimensions (L x W x Floors)' | 'Direct Plaster Surface Area'
    plotLength: 30, // ft
    plotWidth: 40,  // ft
    floors: 2,      // floors count
    directSurfaceArea: 1000,
    plasterType: 'Internal Plaster',
    thicknessMm: 12,
    mortarRatio: '1:6',
    wastagePct: 3
  };
  const [quickInputs, setQuickInputs] = useState(initialQuickInputs);

  // DETAILED WALL-WISE INPUTS
  const initialDetailedInputs = {
    nos: 2,
    length: 100,
    height: 10,
    plasterType: 'Internal Plaster',
    thicknessMm: 20,
    mortarRatio: '1:6',
    wastagePct: 3
  };
  const [detailedInputs, setDetailedInputs] = useState(initialDetailedInputs);

  // Openings for Detailed Mode
  const [openings, setOpenings] = useState<any[]>([
    { name: "Door", length: 3.5, width: 7, nos: 2, area: 49 },
    { name: "Window", length: 5, width: 4, nos: 2, area: 40 }
  ]);
  const [openingInput, setOpeningInput] = useState({ name: 'Door', length: 3.5, width: 7, nos: 1 });

  // Admin Approved Rate (₹) Lookup
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53", "opc"], 385);
  const sandRate = getMasterRate(["MAT-MSND-01", "MAT-PSND-01", "m-sand", "p-sand", "sand"], 46);
  const waterRate = getMasterRate(["MAT-WTR-01", "construction water", "water"], 0.05); // ₹0.05 per Litre
  const chemicalRate = getMasterRate(["MAT-WPR-01", "waterproofing liquid", "chemical"], 135);
  const labourRate = getMasterRate(["SRV-PLS-LAY", "plastering labour", "plaster labour", "plaster"], 18);

  const handleAddOpening = () => {
    if (openingInput.length > 0 && openingInput.width > 0 && openingInput.nos > 0) {
      const area = openingInput.length * openingInput.width * openingInput.nos;
      setOpenings([...openings, { ...openingInput, area, id: Date.now() }]);
    }
  };

  const handleRemoveOpening = (index: number) => {
    const next = [...openings];
    next.splice(index, 1);
    setOpenings(next);
  };

  const handleResetQuick = () => setQuickInputs(initialQuickInputs);
  const handleResetDetailed = () => {
    setDetailedInputs(initialDetailedInputs);
    setOpenings([
      { name: "Door", length: 3.5, width: 7, nos: 2, area: 49 },
      { name: "Window", length: 5, width: 4, nos: 2, area: 40 }
    ]);
  };

  // Helper Mortar Calculation Function (IS 1661 / IS 2250)
  const calculatePlasterMortar = (netArea: number, thicknessMm: number, mortarRatio: string, wastagePct: number, isExternal: boolean) => {
    const thicknessFt = thicknessMm / 304.8;
    const wetVolCft = netArea * thicknessFt;
    const wetVolCum = wetVolCft / 35.3147;

    // Mortar dry volume factor = 1.33 (30-35% dry shrinkage + joint filling)
    const dryVolCum = wetVolCum * 1.33;

    const [cemPart, sandPart] = mortarRatio.split(":").map(Number);
    const totalParts = cemPart + sandPart;

    const cemVolCum = dryVolCum * (cemPart / totalParts);
    const cemWeightKg = cemVolCum * 1440; // 1440 kg/m3 OPC 53
    const wastageFactor = 1 + (wastagePct / 100);

    const cemBags = (cemWeightKg / 50) * wastageFactor; // 50kg Bags
    const sandCft = (cemVolCum * sandPart * 35.3147) * wastageFactor;
    const waterLtr = cemBags * 28; // ~28 Ltr per bag

    // External Plaster Waterproofing Chemical Liquid (200ml per bag of cement)
    const chemicalLtr = isExternal ? (cemBags * 0.20) : 0;

    let unpricedCount = 0;
    const unpricedList: string[] = [];

    if (!cementRate.found) { unpricedCount++; unpricedList.push("Cement (OPC 53)"); }
    if (!sandRate.found) { unpricedCount++; unpricedList.push("M-Sand / P-Sand"); }
    if (!waterRate.found) { unpricedCount++; unpricedList.push("Site Water"); }
    if (!labourRate.found) { unpricedCount++; unpricedList.push("Plastering Labour"); }

    const cemCost = cemBags * (cementRate.found ? cementRate.rate : 0);
    const sandCost = sandCft * (sandRate.found ? sandRate.rate : 0);
    const waterCost = waterLtr * (waterRate.found ? waterRate.rate : 0);
    const chemicalCost = chemicalLtr * (chemicalRate.found ? chemicalRate.rate : 0);
    const labourCost = netArea * (labourRate.found ? labourRate.rate : 0);

    const grandMatCost = cemCost + sandCost + waterCost + chemicalCost;
    const grandTotal = grandMatCost + labourCost;
    const costPerSqft = netArea > 0 ? grandTotal / netArea : 0;

    const resultItems: any[] = [
      {
        code: cementRate.itemCode || "MAT-CEM-01",
        category: "Material",
        description: `Cement (OPC 53 Grade 50kg Bags)`,
        unit: "BAG",
        engQty: (cemWeightKg / 50),
        procQty: Math.ceil(cemBags),
        rate: cementRate.rate,
        rateFound: cementRate.found,
        amount: cemCost
      },
      {
        code: sandRate.itemCode || "MAT-MSND-01",
        category: "Material",
        description: `Fine M-Sand / P-Sand (Mortar Grade)`,
        unit: "CFT",
        engQty: (cemVolCum * sandPart * 35.3147),
        procQty: Math.ceil(sandCft),
        rate: sandRate.rate,
        rateFound: sandRate.found,
        amount: sandCost
      },
      {
        code: waterRate.itemCode || "MAT-WTR-01",
        category: "Site Utility",
        description: `Construction Site Water Supply`,
        unit: "LTR",
        engQty: waterLtr,
        procQty: Math.ceil(waterLtr),
        rate: waterRate.rate,
        rateFound: waterRate.found,
        amount: waterCost
      }
    ];

    if (chemicalLtr > 0) {
      resultItems.push({
        code: chemicalRate.itemCode || "MAT-WPR-01",
        category: "Material",
        description: `Waterproofing Compound Liquid (200ml/bag)`,
        unit: "LTR",
        engQty: chemicalLtr,
        procQty: Math.ceil(chemicalLtr),
        rate: chemicalRate.rate,
        rateFound: chemicalRate.found,
        amount: chemicalCost
      });
    }

    resultItems.push({
      code: labourRate.itemCode || "SRV-PLS-LAY",
      category: "Labour",
      description: `Plastering Labour (${thicknessMm}mm ${mortarRatio})`,
      unit: "SQFT",
      engQty: netArea,
      procQty: netArea,
      rate: labourRate.rate,
      rateFound: labourRate.found,
      amount: labourCost
    });

    return {
      netArea,
      cemBags,
      sandCft,
      waterLtr,
      chemicalLtr,
      grandMatCost,
      grandLabCost: labourCost,
      grandTotal,
      costPerSqft,
      resultItems,
      unpricedCount,
      unpricedList
    };
  };

  // 1. QUICK CALCULATION ENGINE (Plot Size L x W x Floors BUA Civil Thumb Rule)
  const quickCalcResults = useMemo(() => {
    const q = quickInputs;
    let netArea = 0;
    let builtUpArea = 0;

    if (q.inputType === 'Plot Dimensions (L x W x Floors)') {
      const plotArea = q.plotLength * q.plotWidth;
      builtUpArea = plotArea * q.floors;
      // Civil Engineering Thumb Rule: Total Plaster Area = Built-Up Area x 3.5
      netArea = builtUpArea * 3.5;
    } else {
      netArea = q.directSurfaceArea;
      builtUpArea = netArea / 3.5;
    }

    const isExternal = q.plasterType === "External Plaster";
    const res = calculatePlasterMortar(netArea, q.thicknessMm, q.mortarRatio, q.wastagePct, isExternal);

    return {
      ...res,
      builtUpArea,
      plotArea: q.plotLength * q.plotWidth
    };
  }, [quickInputs, cementRate, sandRate, waterRate, labourRate, chemicalRate]);

  // 2. DETAILED WALL-WISE CALCULATION ENGINE (Exact IS 1200 Code Calculations)
  const detailedCalcResults = useMemo(() => {
    const d = detailedInputs;
    const wallArea = d.nos * d.length * d.height;

    let openingAreaDeduction = 0;
    openings.forEach(o => {
      const area = o.length * o.width * o.nos;
      if (area < 5.38) openingAreaDeduction += 0;
      else if (area <= 32.29) openingAreaDeduction += area * 0.5;
      else openingAreaDeduction += area;
    });

    const multiplier = d.plasterType === "Both Side Wall Plaster" ? 2 : 1;
    const netArea = Math.max(0, (wallArea - openingAreaDeduction) * multiplier);
    const isExternal = d.plasterType === "External Plaster";

    const res = calculatePlasterMortar(netArea, d.thicknessMm, d.mortarRatio, d.wastagePct, isExternal);
    return {
      ...res,
      wallArea,
      openingAreaDeduction,
      grossOpeningArea: openings.reduce((s, o) => s + (o.length * o.width * o.nos), 0)
    };
  }, [detailedInputs, openings, cementRate, sandRate, waterRate, labourRate, chemicalRate]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('calculator_export', 'plaster-calculator', () => {
      const items = calcMode === 'quick' ? quickCalcResults.resultItems : detailedCalcResults.resultItems;
      const data = items.map(item => ({
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
      XLSX.utils.book_append_sheet(wb, ws, "Plaster Estimation Results");
      XLSX.writeFile(wb, `BuildMitra_Plaster_Calculator_${calcMode}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'plaster-calculator', () => {
      const res = calcMode === 'quick' ? quickCalcResults : detailedCalcResults;
      const msg = `*BuildMitra Plaster Calculator Report*%0A` +
        `*Estimation Mode*: ${calcMode === 'quick' ? 'Quick Calculation' : 'Detailed Wall-Wise Calculation'}%0A` +
        `----------------------------------------%0A` +
        `• *Net Plaster Area*: ${formatNumber(res.netArea)} Sqft%0A` +
        `• *Cement (50kg OPC 53)*: ${formatNumber(res.cemBags)} Bags%0A` +
        `• *M-Sand / P-Sand*: ${formatNumber(res.sandCft)} CFT%0A` +
        `• *Site Water*: ${formatNumber(res.waterLtr)} Litres%0A` +
        `• *Mat. Cost (₹)*: ${formatCurrency(res.grandMatCost)}%0A` +
        `• *Labour (₹)*: ${formatCurrency(res.grandLabCost)}%0A` +
        `• *TOTAL ESTIMATED COST*: ${formatCurrency(res.grandTotal)} (${formatCurrency(res.costPerSqft)}/Sqft)%0A%0A` +
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
          Plaster Calculator
          <span style={styles.badge}>IS 1661 / IS 2250 / IS 1200 Compliant</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#e0f2fe' }}>BuildMitra Professional Edition</span>
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
          <option value="quick">Quick Calculation (Estimate from Plot Dimensions L x W x Floors BUA)</option>
          <option value="detailed">Detailed Wall-Wise Calculation (Exact Room Dimensions & IS 1200 Deductions)</option>
        </select>
      </div>
        </div>
        <div className="engineering-specimen-top">
      <EngineeringSpecimen kind="plaster" title="Dynamic Plaster Specimen" material={calcMode === 'quick' ? quickInputs.plasterType : detailedInputs.plasterType} data={calcMode === 'quick' ? { lengthFt: quickInputs.plotLength, heightFt: 10, type: quickInputs.plasterType } : { lengthFt: detailedInputs.length, heightFt: detailedInputs.height, type: detailedInputs.plasterType }} />
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

      {/* ========================================================= */}
      {/* 4. QUICK CALCULATION MODE */}
      {/* ========================================================= */}
      {calcMode === 'quick' && (
        <>
          <div style={styles.stepperCard}>
            <div style={styles.sectionHeader}>
              <span>Quick Calculation (Plot Dimensions & BUA Civil Thumb Rule)</span>
            </div>

            <div style={styles.noteBox}>
              💡 <strong>Civil Engineering Thumb Rule</strong>: Built-Up Area (BUA) = Plot Length x Plot Width x Floors. Plasterable Surface Area (Walls & Ceilings) = BUA x 3.5 Sqft.
            </div>

            <div style={styles.grid3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Input Calculation Method</label>
                <select
                  style={{ ...styles.select, border: '2px solid #0f766e', backgroundColor: '#f0fdfa', fontWeight: '700' }}
                  value={quickInputs.inputType}
                  onChange={e => setQuickInputs({ ...quickInputs, inputType: e.target.value })}
                >
                  <option value="Plot Dimensions (L x W x Floors)">Plot Dimensions (Length x Width x Floors)</option>
                  <option value="Direct Plaster Surface Area">Direct Plaster Surface Area (Sqft)</option>
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
                  <label style={styles.label}>Direct Surface Area (Sqft)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={quickInputs.directSurfaceArea}
                    onChange={e => setQuickInputs({ ...quickInputs, directSurfaceArea: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>

            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Plaster Type</label>
                <select
                  style={styles.select}
                  value={quickInputs.plasterType}
                  onChange={e => setQuickInputs({ ...quickInputs, plasterType: e.target.value })}
                >
                  <option value="Internal Plaster">Internal Plaster (Single Side)</option>
                  <option value="External Plaster">External Plaster (2-Coat Weatherproof)</option>
                  <option value="Ceiling Plaster">Ceiling Plaster (6mm - 12mm)</option>
                  <option value="Both Side Wall Plaster">Both Side Wall Plaster</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Thickness (mm)</label>
                <select
                  style={styles.select}
                  value={quickInputs.thicknessMm}
                  onChange={e => setQuickInputs({ ...quickInputs, thicknessMm: parseInt(e.target.value) })}
                >
                  <option value={12}>12 mm (Internal Single Coat)</option>
                  <option value={15}>15 mm (Internal Smooth Finish)</option>
                  <option value={20}>20 mm (External 2-Coat Finish)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mortar Ratio (Cement : Sand)</label>
                <select
                  style={styles.select}
                  value={quickInputs.mortarRatio}
                  onChange={e => setQuickInputs({ ...quickInputs, mortarRatio: e.target.value })}
                >
                  <option value="1:3">1:3 (Rich Mortar)</option>
                  <option value="1:4">1:4 (External / Ceiling Standard)</option>
                  <option value="1:5">1:5 (Internal Wall Standard)</option>
                  <option value="1:6">1:6 (General Brick Masonry Plaster)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Wastage (%)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={quickInputs.wastagePct}
                  onChange={e => setQuickInputs({ ...quickInputs, wastagePct: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button style={styles.btnReset} onClick={handleResetQuick}>🔄 Reset Quick Form</button>
            </div>
          </div>

          {/* Quick Results Summary & BOQ */}
          <div style={styles.stepperCard}>
            <div style={styles.sectionHeader}>
              <span>📊 Plaster Calculation Results & Materials BOQ</span>
            </div>

            {quickCalcResults.unpricedCount > 0 ? (
              <div style={styles.warnBanner}>
                ⚠️ Partial Estimate: Admin Rate (₹)s unavailable for: {quickCalcResults.unpricedList.join(', ')}.
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '700' }}>
                ✓ Complete Estimate: All rates verified against BuildMitra Admin Master Database.
              </div>
            )}

            {/* Summary Metric Cards */}
            <div style={styles.summaryGrid}>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Built-Up Area (BUA)</span>
                <span style={styles.metricVal}>{formatNumber(quickCalcResults.builtUpArea)} Sqft</span>
                <span style={{ fontSize: '10px', opacity: 0.85 }}>{`(${quickInputs.plotLength} ft x ${quickInputs.plotWidth} ft x ${quickInputs.floors} floors)`}</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Net Plaster Area</span>
                <span style={styles.metricVal}>{formatNumber(quickCalcResults.netArea)} Sqft</span>
                <span style={{ fontSize: '10px', opacity: 0.85 }}>(BUA x 3.5 Thumb Rule)</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                <span style={styles.metricTitle}>Mat. Cost (₹)</span>
                <span style={styles.metricVal}>{formatCurrency(quickCalcResults.grandMatCost)}</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                <span style={styles.metricTitle}>Labour (₹)</span>
                <span style={styles.metricVal}>{formatCurrency(quickCalcResults.grandLabCost)}</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                <span style={styles.metricTitle}>Grand Total (₹)</span>
                <span style={styles.metricVal}>{formatCurrency(quickCalcResults.grandTotal)}</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(quickCalcResults.costPerSqft)} / Sqft)</span>
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
                  {quickCalcResults.resultItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="bm-mobile-hide-col" style={styles.td}><code>{item.code}</code></td>
                      <td className="bm-mobile-hide-col" style={styles.td}><span style={{
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
              <button style={styles.btnSecondary} onClick={handleExportExcel}>📥 Export BOQ to Excel</button>
              <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share Estimate on WhatsApp</button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 5. DETAILED WALL-WISE CALCULATION MODE */}
      {/* ========================================================= */}
      {calcMode === 'detailed' && (
        <div style={styles.stepperCard}>
          <div style={styles.sectionHeader}>
            <span>📐 Detailed Wall-Wise Plaster Calculation Inputs (IS 1661 & IS 1200 Exact Rules)</span>
          </div>

          <div style={styles.grid4}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Number of Walls (Nos)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.nos}
                onChange={e => setDetailedInputs({ ...detailedInputs, nos: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Length per Wall (Ft)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.length}
                onChange={e => setDetailedInputs({ ...detailedInputs, length: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Height per Wall (Ft)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.height}
                onChange={e => setDetailedInputs({ ...detailedInputs, height: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Plaster Type</label>
              <select
                style={styles.select}
                value={detailedInputs.plasterType}
                onChange={e => setDetailedInputs({ ...detailedInputs, plasterType: e.target.value })}
              >
                <option value="Internal Plaster">Internal Plaster (Single Side)</option>
                <option value="External Plaster">External Plaster (2-Coat Weatherproof)</option>
                <option value="Ceiling Plaster">Ceiling Plaster</option>
                <option value="Both Side Wall Plaster">Both Side Wall Plaster</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Thickness (mm)</label>
              <select
                style={styles.select}
                value={detailedInputs.thicknessMm}
                onChange={e => setDetailedInputs({ ...detailedInputs, thicknessMm: parseInt(e.target.value) })}
              >
                <option value={12}>12 mm</option>
                <option value={15}>15 mm</option>
                <option value={20}>20 mm</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Mortar Ratio (Cement : Sand)</label>
              <select
                style={styles.select}
                value={detailedInputs.mortarRatio}
                onChange={e => setDetailedInputs({ ...detailedInputs, mortarRatio: e.target.value })}
              >
                <option value="1:3">1:3</option>
                <option value="1:4">1:4</option>
                <option value="1:5">1:5</option>
                <option value="1:6">1:6</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Wastage (%)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.wastagePct}
                onChange={e => setDetailedInputs({ ...detailedInputs, wastagePct: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Openings Section */}
          <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f766e', marginBottom: '8px' }}>🚪 Openings Deduction (IS 1200 Part 12 Standard Rules)</div>
            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Opening Type</label>
                <select style={styles.select} value={openingInput.name} onChange={e => setOpeningInput({ ...openingInput, name: e.target.value })}>
                  <option value="Door">Door</option>
                  <option value="Window">Window</option>
                  <option value="Ventilation">Ventilation</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Width (Ft)</label>
                <input type="number" style={styles.input} value={openingInput.length} onChange={e => setOpeningInput({ ...openingInput, length: parseFloat(e.target.value) || 0 })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Height (Ft)</label>
                <input type="number" style={styles.input} value={openingInput.width} onChange={e => setOpeningInput({ ...openingInput, width: parseFloat(e.target.value) || 0 })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Quantity (Nos)</label>
                <input type="number" style={styles.input} value={openingInput.nos} onChange={e => setOpeningInput({ ...openingInput, nos: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <button style={styles.btnPrimary} onClick={handleAddOpening}>+ Add Opening</button>

            {openings.length > 0 && (
              <div style={{ marginTop: '10px', ...styles.tableContainer }}>
                <table className="bm-item-results-table" style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Size</th>
                      <th style={styles.th}>Nos</th>
                      <th style={styles.th}>Gross Area</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openings.map((o, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{o.name}</td>
                        <td style={styles.td}>{`${o.length} ft x ${o.width} ft`}</td>
                        <td style={styles.td}>{o.nos}</td>
                        <td style={styles.td}><strong>{formatNumber(o.length * o.width * o.nos)} Sqft</strong></td>
                        <td style={styles.td}>
                          <button style={styles.btnDanger} onClick={() => handleRemoveOpening(idx)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button style={styles.btnReset} onClick={handleResetDetailed}>🔄 Reset Detailed Form</button>
          </div>

          {/* DETAILED RESULTS TABLE */}
          <div style={{ marginTop: '16px' }}>
            <div style={styles.sectionHeader}>
              <span>📊 Detailed Plaster Calculation Results & Materials BOQ</span>
            </div>

            {detailedCalcResults.unpricedCount > 0 ? (
              <div style={styles.warnBanner}>
                ⚠️ Partial Estimate: Admin Rate (₹)s unavailable for: {detailedCalcResults.unpricedList.join(', ')}.
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '700' }}>
                ✓ Complete Estimate: All rates verified against BuildMitra Admin Master Database.
              </div>
            )}

            <div style={styles.summaryGrid}>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Net Plaster Area</span>
                <span style={styles.metricVal}>{formatNumber(detailedCalcResults.netArea)} Sqft</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                <span style={styles.metricTitle}>Mat. Cost (₹)</span>
                <span style={styles.metricVal}>{formatCurrency(detailedCalcResults.grandMatCost)}</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                <span style={styles.metricTitle}>Labour (₹)</span>
                <span style={styles.metricVal}>{formatCurrency(detailedCalcResults.grandLabCost)}</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                <span style={styles.metricTitle}>Grand Total (₹)</span>
                <span style={styles.metricVal}>{formatCurrency(detailedCalcResults.grandTotal)}</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(detailedCalcResults.costPerSqft)} / Sqft)</span>
              </div>
            </div>

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
                  {detailedCalcResults.resultItems.map((item, i) => (
                    <tr key={i}>
                      <td className="bm-mobile-hide-col" style={styles.td}><code>{item.code}</code></td>
                      <td className="bm-mobile-hide-col" style={styles.td}><span style={{
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
              <button style={styles.btnSecondary} onClick={handleExportExcel}>📥 Export BOQ to Excel</button>
              <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share Estimate on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




















