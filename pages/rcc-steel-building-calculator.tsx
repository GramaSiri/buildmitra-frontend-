import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";
import { downloadBuildMitraPDF } from "../utils/pdfExport";

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
    backgroundColor: '#800020',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(128,0,32,0.2)'
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
    backgroundColor: '#a51d36',
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
    color: '#800020',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #fecdd3',
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
  metricMaroon: { backgroundColor: '#800020' },
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
  th: { backgroundColor: '#800020', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '15px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px' },

  btnPrimary: { backgroundColor: '#800020', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function FullBuildingCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(2);
  const [buaFactor, setBuaFactor] = useState(0.85);
  const [floorHeight, setFloorHeight] = useState(10);
  const [qualityGrade, setQualityGrade] = useState('Standard');

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
  const block6Rate = getMasterRate(["MAT-BLK-01", "concrete block 6"], 0);
  const block4Rate = getMasterRate(["MAT-BRK-01", "clay brick"], 0);
  const civilLabourRate = getMasterRate(["SRV-BLD-LAY", "civil building labour"], 0);

  const calcResults = useMemo(() => {
    const plotArea = plotLength * plotWidth;
    const floorArea = plotArea * buaFactor;
    const bua = Math.round(floorArea * floors);

    const gradeMultiplier = qualityGrade === 'Basic' ? 0.95 : qualityGrade === 'Premium' ? 1.15 : 1.0;

    const cementBags = Math.ceil(bua * 0.40 * gradeMultiplier);
    const concreteCum = Number((cementBags / 7.5).toFixed(2));
    const steelKgPerSqft = (3.0 + Math.max(floors - 1, 0) * 0.10) * gradeMultiplier;
    const totalSteelKg = Math.round(bua * steelKgPerSqft);

    const mSandCft = Math.round(cementBags * 1.98);
    const ca20Cft = Math.round(cementBags * 2.38);
    const ca12Cft = Math.round(cementBags * 1.58);

    const perimeter = 2 * (plotLength + plotWidth);
    const externalWallArea = perimeter * floorHeight * floors;
    const internalWallArea = bua * 1.15;
    const block6Nos = Math.ceil(externalWallArea / 0.89);
    const block4Nos = Math.ceil(internalWallArea / 0.89);

    const items = [
      {
        code: cementRate.itemCode || "MAT-CEM-01",
        category: "Structural Materials",
        name: `Cement (OPC 53 Grade - ${qualityGrade} Specification)`,
        uom: "BAG",
        qty: cementBags,
        rateObj: cementRate
      },
      {
        code: steelRate.itemCode || "MAT-STL-01",
        category: "Reinforcement Steel",
        name: "TMT Rebar Steel (Fe 500D Structural)",
        uom: "KG",
        qty: totalSteelKg,
        rateObj: steelRate
      },
      {
        code: sandRate.itemCode || "MAT-MSND-01",
        category: "Aggregates",
        name: "M-Sand (Manufactured Fine Aggregate)",
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
        code: block6Rate.itemCode || "MAT-BLK-01",
        category: "Masonry Blocks",
        name: "Concrete Solid Blocks (6 inch External Walls)",
        uom: "NOS",
        qty: block6Nos,
        rateObj: block6Rate
      },
      {
        code: block4Rate.itemCode || "MAT-BRK-01",
        category: "Masonry Blocks",
        name: "Clay Bricks / Partition Blocks (Internal Walls)",
        uom: "NOS",
        qty: block4Nos,
        rateObj: block4Rate
      },
      {
        code: civilLabourRate.itemCode || "SRV-BLD-LAY",
        category: "Labour Services",
        name: "RCC + Steel + Blockwork Composite Turnkey Labour",
        uom: "SQFT",
        qty: bua,
        rateObj: civilLabourRate
      }
    ];

    let totalMaterialCost = 0;
    let totalLabourCost = 0;

    const processedItems = items.map(it => {
      const isFound = it.rateObj.found && Number(it.rateObj.rate) > 0;
      const rateVal = isFound ? Number(it.rateObj.rate) : 0;
      const amountVal = isFound ? it.qty * rateVal : 0;

      if (it.category.includes("Labour")) {
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
      plotArea,
      bua,
      cementBags,
      concreteCum,
      totalSteelKg,
      block6Nos,
      block4Nos,
      totalMaterialCost,
      totalLabourCost,
      grandTotalCost,
      costPerSqft: bua > 0 ? grandTotalCost / bua : 0,
      items: processedItems,
      missingItems
    };
  }, [plotLength, plotWidth, floors, buaFactor, floorHeight, qualityGrade, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, block6Rate, block4Rate, civilLabourRate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("rcc_steel_calc_export", "RCC-STEEL-CALC", () => {
      const data = [
        ["BUILDMITRA RCC + STEEL + BLOCKWORK COMPOSITE ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Plot Area", `${calcResults.plotArea} Sq.ft`],
        ["Total Built-up Area", `${calcResults.bua} Sq.ft`],
        ["Floors Count", floors],
        ["Specification Grade", qualityGrade],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calcResults.grandTotalCost)],
        [],
        ["ITEMIZED COMPOSITE BUILDING BOQ"],
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
      XLSX.utils.book_append_sheet(wb, ws, "Composite_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Composite_Building_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("rcc_steel_calc_export", "RCC-STEEL-CALC", () => {
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
        "BuildMitra – RCC + Steel + Blockwork Composite Report",
        [
          ["Total Built-up Area:", `${calcResults.bua} Sq.ft`],
          ["Concrete Volume:", `${calcResults.concreteCum} CUM`],
          ["Steel Rebar Required:", `${calcResults.totalSteelKg} KG`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calcResults.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Composite_Building_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>RCC + Steel + Blockwork Building Estimator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>COMPOSITE STRUCTURAL ESTIMATOR</span>
            <h1 style={styles.headerTitle}>🏢 BuildMitra – RCC + Steel + Blockwork Estimator</h1>
          </div>
          <button style={styles.backBtn} onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Inputs */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>📐 Enter Plot &amp; Building Specifications</span>
          </div>

          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Plot Length (ft)</label>
              <input type="number" value={plotLength} onChange={(e) => handleInputChange(setPlotLength, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Plot Width (ft)</label>
              <input type="number" value={plotWidth} onChange={(e) => handleInputChange(setPlotWidth, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Floors Count</label>
              <input type="number" value={floors} onChange={(e) => handleInputChange(setFloors, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>BUA Coverage Factor</label>
              <input type="number" step="0.05" value={buaFactor} onChange={(e) => handleInputChange(setBuaFactor, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Floor Height (ft)</label>
              <input type="number" value={floorHeight} onChange={(e) => handleInputChange(setFloorHeight, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Quality Specification</label>
              <select value={qualityGrade} onChange={(e) => handleInputChange(setQualityGrade, e.target.value)} style={styles.select}>
                <option value="Basic">Basic Specification</option>
                <option value="Standard">Standard Premium</option>
                <option value="Premium">Ultra Luxury Premium</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Composite Building</button>
            <button style={styles.btnReset} onClick={() => setPlotLength(30)}>🔄 Reset</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
          </div>
        </div>

        {/* Result Metric Cards */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>Built-up Area</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#fecdd3' : '#ffffff' }}>{calcResults.bua.toLocaleString()} Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Concrete Volume</span>
            <span style={styles.metricVal}>{calcResults.concreteCum} CUM</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Steel Rebar Required</span>
            <span style={styles.metricVal}>{calcResults.totalSteelKg.toLocaleString()} KG</span>
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
          <div style={{ padding: '12px 16px', backgroundColor: '#800020', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized RCC + Steel + Blockwork Composite BOQ (Admin Master Linked)
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
              <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: '800' }}>
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
