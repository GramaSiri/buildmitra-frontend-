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
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#a51d36', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  dropdowncard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  dropdownlabel: { display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  modeselect: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '11px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },

  steppercard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  sectionheader: { maxWidth: '100%', margin: '0 0 8px 0', padding: '6px 10px', borderRadius: '6px' },

  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '14px' },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  input: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '12px', textAlign: 'center', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },
  select: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '11px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },

  btnPrimary: { backgroundColor: '#800020', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summarygrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' },
  metriccard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  metricMaroon: { backgroundColor: '#800020' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

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

export default function RoofTrussCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Scope Option: 'both' vs 'sheeting_only' vs 'framing_only'
  const [scopeOption, setScopeOption] = useState<'both' | 'sheeting_only' | 'framing_only'>('both');

  // DETAILED ROOF TRUSS INPUTS
  const initialInputs = {
    lengthFt: 30,         // Building length in feet
    widthFt: 40,          // Span width in feet
    riseFt: 10,           // Roof rise/height in feet
    spacingFt: 8,         // Truss spacing in feet
    roofType: 'Mangalore Tiles', // Mangalore Tiles, Galvalume Sheets, Polycarbonate
    paintCoats: 2,        // 1 or 2 Coats of enamel paint
    structureType: 'Terrace Light' // Terrace Open (Hollow Tubes & Round Pipe) vs Heavy Industrial
  };

  const [inputs, setInputs] = useState(initialInputs);

  // Admin Rate (₹)s Lookup
  const steelRate = getMasterRate(["MAT-STL-01", "structural steel", "steel", "rebar"], 68);
  const roofRate = getMasterRate(["MAT-MNG-TLE", "MAT-ROF-SHT", "roof sheeting", "tiles"], inputs.roofType === 'Mangalore Tiles' ? 48 : 45);
  const paintRate = getMasterRate(["MAT-ROF-PNT", "primer paint", "enamel paint"], 15);
  const fabLabourRate = getMasterRate(["SRV-TRU-LAB", "truss labour", "fabrication labour"], 12);

  const handleReset = () => setInputs(initialInputs);

  // IS 800 Terrace / Light Roof Structure Engine
  const calcResults = useMemo(() => {
    const hasFraming = scopeOption === 'both' || scopeOption === 'framing_only';
    const hasSheeting = scopeOption === 'both' || scopeOption === 'sheeting_only';

    // Geometry Calculations
    const halfSpanFt = inputs.widthFt / 2;
    const rafterLenFt = Math.sqrt(halfSpanFt * halfSpanFt + inputs.riseFt * inputs.riseFt);
    const overhangFt = 1.5;
    const totalRafterLenFt = rafterLenFt + overhangFt;
    const totalRoofAreaSqft = 2 * totalRafterLenFt * (inputs.lengthFt + 2 * overhangFt);

    const trussNos = Math.ceil(inputs.lengthFt / inputs.spacingFt) + 1;
    const purlinRows = Math.ceil((2 * totalRafterLenFt) / 4.0);
    const totalPurlinLenFt = purlinRows * (inputs.lengthFt + 2 * overhangFt);

    // Structural Member Weights (Lightweight SHS/RHS Tubes & MS Round Pipe Columns for Terrace Open Roofs)
    let topChordKg = 0;
    let botChordKg = 0;
    let webBracingKg = 0;
    let purlinKg = 0;
    let columnKg = 0;
    let plateKg = 0;

    let topDesc = 'RHS 60x40x3mm Rectangular Hollow Tubes';
    let botDesc = 'SHS 50x50x2.5mm Square Hollow Tubes';
    let webDesc = 'SHS 40x40x2.5mm Square Hollow Tubes';
    let colDesc = '75mm/100mm NB MS Round Pipe Columns';

    if (inputs.structureType === 'Terrace Light') {
      topChordKg = hasFraming ? (trussNos * (2 * totalRafterLenFt) * 0.3048 * 4.8) : 0;
      botChordKg = hasFraming ? (trussNos * inputs.widthFt * 0.3048 * 3.8) : 0;
      webBracingKg = hasFraming ? (trussNos * (inputs.widthFt * 0.6) * 0.3048 * 2.8) : 0;
      purlinKg = hasSheeting ? (totalPurlinLenFt * 0.3048 * 2.8) : 0;
      columnKg = hasFraming ? ((trussNos * 2) * 10 * 0.3048 * 8.5) : 0;
      plateKg = hasFraming ? ((topChordKg + botChordKg + webBracingKg) * 0.04) : 0;
    } else {
      topDesc = 'ISA 90x90x8 Angle Rafters';
      botDesc = 'ISA 75x75x8 Angle Ties';
      webDesc = 'ISA 65x65x6 Angle Web Bracing';
      colDesc = 'ISMB 250 Heavy Rolled Steel I-Columns';

      topChordKg = hasFraming ? (trussNos * (2 * totalRafterLenFt) * 0.3048 * 10.9) : 0;
      botChordKg = hasFraming ? (trussNos * inputs.widthFt * 0.3048 * 8.9) : 0;
      webBracingKg = hasFraming ? (trussNos * (inputs.widthFt * 0.8) * 0.3048 * 5.8) : 0;
      purlinKg = hasSheeting ? (totalPurlinLenFt * 0.3048 * 8.9) : 0;
      columnKg = hasFraming ? ((trussNos * 2) * 10 * 0.3048 * 37.3) : 0;
      plateKg = hasFraming ? ((topChordKg + botChordKg + webBracingKg) * 0.08) : 0;
    }

    const totalSteelKg = topChordKg + botChordKg + webBracingKg + purlinKg + columnKg + plateKg;

    // Fasteners & Paint
    const m16BoltNos = hasFraming ? (trussNos * 16) : 0;
    const m16AnchorNos = hasFraming ? (trussNos * 4) : 0;
    const paintAreaSqft = hasFraming ? (totalSteelKg * 0.35 * inputs.paintCoats) : 0;

    // Cost Breakdown
    const steelCost = totalSteelKg * (steelRate.found ? steelRate.rate : 68);
    const roofCost = hasSheeting ? (totalRoofAreaSqft * (roofRate.found ? roofRate.rate : (inputs.roofType === 'Mangalore Tiles' ? 48 : 45))) : 0;
    const boltCost = m16BoltNos * 35;
    const anchorCost = m16AnchorNos * 120;
    const paintCost = paintAreaSqft * (paintRate.found ? paintRate.rate : 15);
    const fabLabourCost = totalSteelKg * (fabLabourRate.found ? fabLabourRate.rate : 12);

    const grandMatCost = steelCost + roofCost + boltCost + anchorCost + paintCost;
    const grandTotal = grandMatCost + fabLabourCost;
    const costPerSqft = totalRoofAreaSqft > 0 ? grandTotal / totalRoofAreaSqft : 0;

    const resultItems: any[] = [];

    if (hasFraming) {
      resultItems.push(
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Top Chord Rafters (${topDesc})`, unit: "KG", engQty: topChordKg, procQty: Math.ceil(topChordKg), rate: steelRate.rate, rateFound: steelRate.found, amount: topChordKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Bottom Chord Ties (${botDesc})`, unit: "KG", engQty: botChordKg, procQty: Math.ceil(botChordKg), rate: steelRate.rate, rateFound: steelRate.found, amount: botChordKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Web Bracing Members (${webDesc})`, unit: "KG", engQty: webBracingKg, procQty: Math.ceil(webBracingKg), rate: steelRate.rate, rateFound: steelRate.found, amount: webBracingKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Support Columns (${colDesc} - ${trussNos * 2} Nos)`, unit: "KG", engQty: columnKg, procQty: Math.ceil(columnKg), rate: steelRate.rate, rateFound: steelRate.found, amount: columnKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Base Plates & Gusset Brackets (6mm/12mm MS Plate)`, unit: "KG", engQty: plateKg, procQty: Math.ceil(plateKg), rate: steelRate.rate, rateFound: steelRate.found, amount: plateKg * steelRate.rate }
      );
    }

    if (hasSheeting) {
      resultItems.push(
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Roof Purlins (SHS 40x40x2.5mm / Light C-Purlin - ${purlinRows} Rows)`, unit: "KG", engQty: purlinKg, procQty: Math.ceil(purlinKg), rate: steelRate.rate, rateFound: steelRate.found, amount: purlinKg * steelRate.rate },
        { code: roofRate.itemCode || "MAT-ROF-SHT", category: "Roofing", description: `${inputs.roofType} Roof Cover`, unit: "SQFT", engQty: totalRoofAreaSqft, procQty: Math.ceil(totalRoofAreaSqft), rate: roofRate.rate, rateFound: roofRate.found, amount: roofCost }
      );
    }

    if (hasFraming) {
      resultItems.push(
        { code: "MAT-BOLT-01", category: "Fasteners", description: `M16 Structural Bolts`, unit: "NOS", engQty: m16BoltNos, procQty: m16BoltNos, rate: 35, rateFound: true, amount: boltCost },
        { code: "MAT-ANCH-01", category: "Fasteners", description: `M16 Anchor J-Bolts for Column Base`, unit: "NOS", engQty: m16AnchorNos, procQty: m16AnchorNos, rate: 120, rateFound: true, amount: anchorCost },
        { code: paintRate.itemCode || "MAT-ROF-PNT", category: "Coatings", description: `Anti-Corrosive Red Oxide Primer & Synthetic Enamel (${inputs.paintCoats} Coats)`, unit: "SQFT", engQty: paintAreaSqft, procQty: Math.ceil(paintAreaSqft), rate: paintRate.rate, rateFound: paintRate.found, amount: paintCost }
      );
    }

    resultItems.push({
      code: fabLabourRate.itemCode || "SRV-TRU-LAB",
      category: "Labour",
      description: `Terrace Roof Truss Hollow Tube & Pipe Fabrication & Site Erection Labour`,
      unit: "KG",
      engQty: totalSteelKg,
      procQty: Math.ceil(totalSteelKg),
      rate: fabLabourRate.rate,
      rateFound: fabLabourRate.found,
      amount: fabLabourCost
    });

    return {
      hasFraming,
      hasSheeting,
      trussNos,
      purlinRows,
      totalRoofAreaSqft,
      totalSteelKg,
      topChordKg,
      botChordKg,
      webBracingKg,
      purlinKg,
      columnKg,
      plateKg,
      paintAreaSqft,
      grandMatCost,
      fabLabourCost,
      grandTotal,
      costPerSqft,
      resultItems
    };
  }, [inputs, scopeOption, steelRate, roofRate, paintRate, fabLabourRate]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('calculator_export', 'roof-truss-calculator', () => {
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
      XLSX.utils.book_append_sheet(wb, ws, "Roof_Truss_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Roof_Truss_Estimate_${scopeOption}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'roof-truss-calculator', () => {
      const msg = `*BuildMitra Terrace Roof Truss Report*%0A` +
        `*Scope Option*: ${scopeOption === 'both' ? 'Both Framing & Sheeting' : scopeOption === 'sheeting_only' ? 'Only Sheeting & Purlins' : 'Only Structural Steel Framing'}%0A` +
        `----------------------------------------%0A` +
        `• *Roof Structure*: ${inputs.lengthFt}' L x ${inputs.widthFt}' Span x ${inputs.riseFt}ft Rise (Terrace Hollow Tube & Round Pipe Columns - ${inputs.roofType})%0A` +
        `• *Roof Area*: ${formatNumber(calcResults.totalRoofAreaSqft)} Sqft | *Trusses*: ${calcResults.trussNos} Nos%0A` +
        (calcResults.hasFraming ? `• *Structural Steel Weight*: ${formatNumber(calcResults.totalSteelKg, 1)} kg%0A` : '') +
        `• *Anti-Corrosive Paint*: ${formatNumber(calcResults.paintAreaSqft, 0)} Sqft (${inputs.paintCoats} Coats)%0A` +
        `• *Material Total*: ${formatCurrency(calcResults.grandMatCost)}%0A` +
        `• *Fabrication & Erection Labour*: ${formatCurrency(calcResults.fabLabourCost)}%0A` +
        `• *TOTAL ESTIMATED COST*: ${formatCurrency(calcResults.grandTotal)} (${formatCurrency(calcResults.costPerSqft)}/Sqft)%0A%0A` +
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
          🏗️ Terrace Open Roof Truss & Sheeting Calculator
          <span style={styles.badge}>Hollow Tubes & MS Pipe Columns</span>
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
          onChange={(e) => setScopeOption(e.target.value as 'both' | 'sheeting_only' | 'framing_only')}
        >
          <option value="both">🔵 Both Structural Steel Framing & Roof Sheeting / Tiles (Complete Terrace Roof)</option>
          <option value="sheeting_only">🧱 Only Roof Sheeting / Tiles & Purlins (No Main Structural Framing)</option>
          <option value="framing_only">⚙️ Only Structural Steel Framing & Fabrication (Hollow Tubes & Pipe Columns)</option>
        </select>
      </div>
        </div>
        <div className="engineering-specimen-top">
      <EngineeringSpecimen kind="roof-truss" title="Dynamic Roof Truss Specimen" material={inputs.roofType} data={{ lengthFt: inputs.lengthFt, spanFt: inputs.widthFt, heightFt: inputs.riseFt, riseFt: inputs.riseFt, trussType: inputs.structureType, type: inputs.roofType }} />
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
          <span>📐 Terrace Roof Geometry & Structural Specifications</span>
        </div>

        <div style={styles.noteBox}>
          💡 <strong>Terrace Open Structure Standards</strong>: Tailored for 3-side open terrace roofs with air passage. Uses lightweight Square/Rectangular Hollow Section (SHS/RHS) tubes for rafters and web bracing, with MS Round Pipe Columns for light structural weight and maximum durability.
        </div>

        <div style={styles.grid4}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Building Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.lengthFt}
              onChange={e => setInputs({ ...inputs, lengthFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Span Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.widthFt}
              onChange={e => setInputs({ ...inputs, widthFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Roof Rise / Height (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.riseFt}
              onChange={e => setInputs({ ...inputs, riseFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Truss Spacing (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.spacingFt}
              onChange={e => setInputs({ ...inputs, spacingFt: parseFloat(e.target.value) || 8 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Structure Design Type</label>
            <select
              style={{ ...styles.select, fontWeight: '700' }}
              value={inputs.structureType}
              onChange={e => setInputs({ ...inputs, structureType: e.target.value })}
            >
              <option value="Terrace Light">Terrace Light Structure (MS Round Pipes & SHS/RHS Tubes)</option>
              <option value="Heavy Industrial">Heavy Industrial Structure (Rolled ISMB I-Beams & Heavy Angles)</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Roof Covering Material</label>
            <select
              style={{ ...styles.select, fontWeight: '700' }}
              value={inputs.roofType}
              onChange={e => setInputs({ ...inputs, roofType: e.target.value })}
            >
              <option value="Mangalore Tiles">Clay Mangalore Roof Tiles (₹48/sqft)</option>
              <option value="Galvalume Sheets">Metal GI / Galvalume Sheets (₹45/sqft)</option>
              <option value="Polycarbonate">Polycarbonate / Fiber Sheets (₹65/sqft)</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Paint Coats (Primer + Enamel)</label>
            <select
              style={styles.select}
              value={inputs.paintCoats}
              onChange={e => setInputs({ ...inputs, paintCoats: parseInt(e.target.value) })}
            >
              <option value={1}>1 Coat Anti-Corrosive Red Oxide</option>
              <option value={2}>2 Coats (Red Oxide + Synthetic Enamel)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Terrace Form</button>
        </div>
      </div>

      {/* Results Summary Cards */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📊 Terrace Roof Results BOQ ({scopeOption === 'both' ? 'Framing & Sheeting' : scopeOption === 'sheeting_only' ? 'Sheeting Only' : 'Structural Framing Only'})</span>
        </div>

        {/* Metric Grid */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>Inclined Roof Area</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.totalRoofAreaSqft)} Sqft</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({calcResults.trussNos} Trusses @ Hollow Tube Design)</span>
          </div>

          {calcResults.hasFraming && (
            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>Structural Steel Weight</span>
              <span style={styles.metricVal}>{formatNumber(calcResults.totalSteelKg, 1)} kg</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>(SHS/RHS Tubes & Pipe Columns)</span>
            </div>
          )}

          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Coating & Paint</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.paintAreaSqft, 0)} Sqft</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({inputs.paintCoats} Coats Anti-Corrosive)</span>
          </div>

          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>Total Cost</span>
            <span style={styles.metricVal}>{formatCurrency(calcResults.grandTotal)}</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(calcResults.costPerSqft)} / Sqft)</span>
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














