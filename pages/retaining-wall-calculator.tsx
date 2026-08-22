import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../utils/pdfExport';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    boxSizing: 'border-box',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#475569',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(71,85,105,0.2)'
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  badge: {
    backgroundColor: '#334155',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    transition: '0.2s'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '18px',
    marginBottom: '16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
  },
  sectionHeader: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#334155',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #cbd5e1',
    paddingBottom: '8px'
  },
  gridCompact: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginBottom: '12px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '2px'
  },
  input: {
    width: '100%',
    height: '38px',
    padding: '8px 12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  inputModified: {
    color: '#dc2626',
    fontWeight: '800',
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2'
  },
  select: {
    width: '100%',
    height: '38px',
    padding: '8px 12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  metricCard: {
    padding: '16px',
    borderRadius: '10px',
    color: 'white',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
  },
  metricSlate: { backgroundColor: '#475569' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricBlue: { backgroundColor: '#2563eb' },
  metricTitle: { fontSize: '12px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '700', letterSpacing: '0.5px' },
  metricVal: { fontSize: '18px', fontWeight: '800', marginTop: '6px' },
  metricValGrand: { fontSize: '22px', fontWeight: '900', marginTop: '6px' },

  tableContainer: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    marginBottom: '16px'
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '15px' },
  th: { backgroundColor: '#475569', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '15px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px' },

  btnPrimary: { backgroundColor: '#475569', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function RetainingWallCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [lengthFt, setLengthFt] = useState(20);
  const [heightFt, setHeightFt] = useState(6);
  const [thicknessFt, setThicknessFt] = useState(0.75);
  const [grade, setGrade] = useState('M20');
  const [vertDia, setVertDia] = useState(12);
  const [horizDia, setHorizDia] = useState(10);
  const [spacingMm, setSpacingMm] = useState(150);
  const [coverMm, setCoverMm] = useState(40);

  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  const handleInputChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (0 fallback)
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53"], 0);
  const steelRate = getMasterRate(["MAT-STL-01", "tmt steel", "steel rebar"], 0);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 0);
  const ca20Rate = getMasterRate(["MAT-AGG-20", "20mm aggregate"], 0);
  const ca12Rate = getMasterRate(["MAT-AGG-12", "12mm aggregate"], 0);
  const wireRate = getMasterRate(["MAT-BWR-01", "binding wire"], 0);
  const coverRate = getMasterRate(["MAT-CVR-01", "cover block"], 0);
  const shutteringRate = getMasterRate(["SRV-RET-SHT", "retaining wall shuttering", "formwork"], 0);
  const rccLabourRate = getMasterRate(["SRV-RCC-LAY", "rcc labour", "retaining labour"], 0);

  const calcResults = useMemo(() => {
    const stemHeightFt = heightFt;
    const stemThickFt = thicknessFt;
    const baseWidthFt = Math.max(heightFt * 0.60, 2.5);
    const baseThickFt = Math.max(thicknessFt, 0.75);

    const stemVolCft = lengthFt * stemHeightFt * stemThickFt;
    const baseVolCft = lengthFt * baseWidthFt * baseThickFt;
    const totalVolCft = stemVolCft + baseVolCft;
    const totalVolCum = Number((totalVolCft / 35.3147).toFixed(2));

    const cementFactor = grade === 'M25' ? 11.10 : grade === 'M30' ? 12.50 : 8.07;
    const mSandFactor = grade === 'M25' ? 13.60 : grade === 'M30' ? 12.80 : 14.81;
    const ca20Factor = grade === 'M25' ? 16.32 : grade === 'M30' ? 15.36 : 17.77;
    const ca12Factor = grade === 'M25' ? 10.88 : grade === 'M30' ? 10.24 : 11.85;

    const cementBags = Math.ceil(totalVolCum * cementFactor);
    const mSandCft = Math.round(totalVolCum * mSandFactor);
    const ca20Cft = Math.round(totalVolCum * ca20Factor);
    const ca12Cft = Math.round(totalVolCum * ca12Factor);

    // Reinforcement Steel Engine (IS 456)
    const vertBarLenM = (stemHeightFt * 0.3048) + (50 * vertDia / 1000);
    const vertBarCount = Math.ceil((lengthFt * 304.8) / spacingMm) + 1;
    const vertSteelKg = vertBarCount * vertBarLenM * ((vertDia * vertDia) / 162.2);

    const horizBarLenM = lengthFt * 0.3048;
    const horizBarCount = Math.ceil((stemHeightFt * 304.8) / spacingMm) + 1;
    const horizSteelKg = horizBarCount * horizBarLenM * ((horizDia * horizDia) / 162.2);

    const baseSteelKg = baseVolCft * 1.55;

    const totalSteelKg = Math.round((vertSteelKg + horizSteelKg + baseSteelKg) * 1.03); // 3% wastage
    const bindingWireKg = Math.ceil(totalSteelKg * 0.015);
    const shutteringSqft = Math.round(2 * lengthFt * stemHeightFt);
    const coverBlockPcs = Math.ceil(lengthFt * stemHeightFt * 2);

    const items = [
      {
        code: cementRate.itemCode || "MAT-CEM-01",
        category: "Concrete Material",
        name: `Cement (OPC 53 Grade - ${grade} Cantilever Wall)`,
        uom: "BAG",
        qty: cementBags,
        rateObj: cementRate
      },
      {
        code: steelRate.itemCode || "MAT-STL-01",
        category: "Reinforcement Steel",
        name: "TMT Rebar Steel (Fe 500D Stem & Base Reinforcement)",
        uom: "KG",
        qty: totalSteelKg,
        rateObj: steelRate
      },
      {
        code: sandRate.itemCode || "MAT-MSND-01",
        category: "Aggregates",
        name: "M-Sand (Fine Aggregate)",
        uom: "CFT",
        qty: mSandCft,
        rateObj: sandRate
      },
      {
        code: ca20Rate.itemCode || "MAT-AGG-20",
        category: "Aggregates",
        name: "20mm Coarse Aggregate",
        uom: "CFT",
        qty: ca20Cft,
        rateObj: ca20Rate
      },
      {
        code: ca12Rate.itemCode || "MAT-AGG-12",
        category: "Aggregates",
        name: "12mm Coarse Aggregate",
        uom: "CFT",
        qty: ca12Cft,
        rateObj: ca12Rate
      },
      {
        code: wireRate.itemCode || "MAT-BWR-01",
        category: "Steel Accessories",
        name: "Steel Binding Wire (18 Gauge GI)",
        uom: "KG",
        qty: bindingWireKg,
        rateObj: wireRate
      },
      {
        code: coverRate.itemCode || "MAT-CVR-01",
        category: "Steel Accessories",
        name: "Concrete Wall Cover Blocks (40mm)",
        uom: "NOS",
        qty: coverBlockPcs,
        rateObj: coverRate
      },
      {
        code: shutteringRate.itemCode || "SRV-RET-SHT",
        category: "Formwork Services",
        name: "Retaining Wall Double-Sided Formwork Shuttering",
        uom: "SQFT",
        qty: shutteringSqft,
        rateObj: shutteringRate
      },
      {
        code: rccLabourRate.itemCode || "SRV-RCC-LAY",
        category: "Labour Services",
        name: "Retaining Wall RCC Casting & Concrete Pouring Labour",
        uom: "CUM",
        qty: totalVolCum,
        rateObj: rccLabourRate
      }
    ];

    let totalMaterialCost = 0;
    let totalLabourCost = 0;

    const processedItems = items.map(it => {
      const isFound = it.rateObj.found && Number(it.rateObj.rate) > 0;
      const rateVal = isFound ? Number(it.rateObj.rate) : 0;
      const amountVal = isFound ? it.qty * rateVal : 0;

      if (it.category.includes("Labour") || it.category.includes("Formwork")) {
        totalLabourCost += amountVal;
      } else {
        totalMaterialCost += amountVal;
      }

      return {
        ...it,
        isFound,
        rateVal,
        amountVal
      };
    });

    const grandTotalCost = totalMaterialCost + totalLabourCost;
    const missingItems = processedItems.filter(it => !it.isFound);

    return {
      lengthFt,
      totalVolCum,
      totalVolCft: Math.round(totalVolCum * 35.3147),
      totalSteelKg,
      shutteringSqft,
      totalMaterialCost,
      totalLabourCost,
      grandTotalCost,
      items: processedItems,
      missingItems
    };
  }, [lengthFt, heightFt, thicknessFt, grade, vertDia, horizDia, spacingMm, coverMm, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, wireRate, coverRate, shutteringRate, rccLabourRate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("retaining_wall_calc_export", "RET-WALL-CALC", () => {
      const data = [
        ["BUILDMITRA CANTILEVER RETAINING WALL ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Wall Dimensions", `${lengthFt}ft (L) x ${heightFt}ft (H) x ${thicknessFt}ft (Thk)`],
        ["Concrete Volume", `${calcResults.totalVolCum} CUM (${calcResults.totalVolCft} CFT)`],
        ["Steel Rebar Required", `${calcResults.totalSteelKg} KG`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calcResults.grandTotalCost)],
        [],
        ["ITEMIZED RETAINING WALL BOQ"],
        ["Master Code", "Category", "Description", "Quantity", "UOM", "Approved Rate (₹)", "Total Amount (₹)"],
        ...calcResults.items.map(it => [
          it.code,
          it.category,
          it.name,
          it.qty,
          it.uom,
          it.isFound ? it.rateVal : "Master Mapping Required / Approved Rate Unavailable",
          it.isFound ? it.amountVal : "—"
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Retaining_Wall_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Retaining_Wall_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("retaining_wall_calc_export", "RET-WALL-CALC", () => {
      const headers = ["Master Code", "Category", "Description", "Qty", "UOM", "Rate (₹)", "Amount (₹)"];
      const rows = calcResults.items.map(it => [
        it.code,
        it.category,
        it.name,
        String(it.qty),
        it.uom,
        it.isFound ? formatCurrency(it.rateVal) : "Rate Pending Admin Update",
        it.isFound ? formatCurrency(it.amountVal) : "—"
      ]);

      downloadBuildMitraPDF(
        "BuildMitra – Cantilever Retaining Wall Estimation Report",
        [
          ["Wall Dimensions:", `${lengthFt}ft (L) x ${heightFt}ft (H) x ${thicknessFt}ft (Thk)`],
          ["Concrete Volume:", `${calcResults.totalVolCum} CUM (${calcResults.totalVolCft} CFT)`],
          ["Steel Rebar Weight:", `${calcResults.totalSteelKg} KG`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calcResults.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Retaining_Wall_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>Retaining Wall Calculator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>EARTH RETAINING &amp; CIVIL ENGINE</span>
            <h1 style={styles.headerTitle}>🧱 BuildMitra – Retaining Wall Estimator</h1>
          </div>
          <button style={styles.backBtn} onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Inputs */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>📐 Enter Retaining Wall Specifications</span>
          </div>

          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Wall Length (ft)</label>
              <input type="number" value={lengthFt} onChange={(e) => handleInputChange(setLengthFt, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Wall Height (ft)</label>
              <input type="number" value={heightFt} onChange={(e) => handleInputChange(setHeightFt, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Stem Thickness (ft)</label>
              <input type="number" step="0.1" value={thicknessFt} onChange={(e) => handleInputChange(setThicknessFt, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Concrete Grade</label>
              <select value={grade} onChange={(e) => handleInputChange(setGrade, e.target.value)} style={styles.select}>
                <option value="M20">M20 (1:1.5:3 RCC)</option>
                <option value="M25">M25 (1:1:2 High Strength)</option>
                <option value="M30">M30 (Design Mix)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Vert Rebar Dia (mm)</label>
              <select value={vertDia} onChange={(e) => handleInputChange(setVertDia, Number(e.target.value))} style={styles.select}>
                <option value={12}>12 mm</option>
                <option value={16}>16 mm</option>
                <option value={20}>20 mm</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Horiz Rebar Dia (mm)</label>
              <select value={horizDia} onChange={(e) => handleInputChange(setHorizDia, Number(e.target.value))} style={styles.select}>
                <option value={10}>10 mm</option>
                <option value={12}>12 mm</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Bar Spacing (mm)</label>
              <input type="number" value={spacingMm} onChange={(e) => handleInputChange(setSpacingMm, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Clear Cover (mm)</label>
              <input type="number" value={coverMm} onChange={(e) => handleInputChange(setCoverMm, Number(e.target.value))} style={styles.input} />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Retaining Wall</button>
            <button style={styles.btnReset} onClick={() => setLengthFt(20)}>🔄 Reset</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
          </div>
        </div>

        {/* Result Metric Cards */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricSlate }}>
            <span style={styles.metricTitle}>Concrete Volume</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#cbd5e1' : '#ffffff' }}>{calcResults.totalVolCum} CUM</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({calcResults.totalVolCft} CFT)</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Steel Rebar Weight</span>
            <span style={styles.metricVal}>{calcResults.totalSteelKg.toLocaleString()} KG</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Formwork Shuttering</span>
            <span style={styles.metricVal}>{calcResults.shutteringSqft} Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
            <span style={styles.metricTitle}>Material Subtotal</span>
            <span style={styles.metricVal}>{formatCurrency(calcResults.totalMaterialCost)}</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>GRAND ESTIMATED TOTAL</span>
            <span style={{ ...styles.metricValGrand, color: isCalculatedBlue ? '#60a5fa' : '#ffffff' }}>{formatCurrency(calcResults.grandTotalCost)}</span>
          </div>
        </div>

        {/* Missing Master Rates Warning Banner */}
        {calcResults.missingItems.length > 0 && (
          <div style={styles.warnBanner}>
            ⚠️ <strong>Master Mapping Required / Approved Rate Unavailable ({calcResults.missingItems.length} Line Items)</strong>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
              {calcResults.missingItems.map(it => (
                <li key={it.code}>
                  <code>{it.code}</code>: {it.name} — Quantity: <strong>{it.qty.toLocaleString()} {it.uom}</strong> (Status: <em>Master Mapping Required</em>)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Itemized BOQ Table */}
        <div style={styles.tableContainer}>
          <div style={{ padding: '12px 16px', backgroundColor: '#475569', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized Retaining Wall BOQ (Admin Master Linked)
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Master Code</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Item Description</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>UOM</th>
                <th style={styles.th}>Approved Rate (₹)</th>
                <th style={styles.th}>Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {calcResults.items.map(it => (
                <tr key={it.code}>
                  <td style={styles.td}><code>{it.code}</code></td>
                  <td style={styles.td}>{it.category}</td>
                  <td style={styles.td}><strong>{it.name}</strong></td>
                  <td style={styles.td}>{it.qty.toLocaleString()}</td>
                  <td style={styles.td}>{it.uom}</td>
                  <td style={styles.td}>
                    {it.isFound ? formatCurrency(it.rateVal) : <span style={{ color: '#dc2626', fontWeight: '700' }}>Master Mapping Required / Approved Rate Unavailable</span>}
                  </td>
                  <td style={styles.td}>
                    {it.isFound ? <strong>{formatCurrency(it.amountVal)}</strong> : <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#475569', color: 'white', fontWeight: '800' }}>
                <td colSpan={6} style={{ padding: '12px 14px', fontSize: '16px' }}>GRAND TOTAL ESTIMATED COST</td>
                <td style={{ padding: '12px 14px', fontSize: '18px' }}>{formatCurrency(calcResults.grandTotalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
