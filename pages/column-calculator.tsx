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
    backgroundColor: '#7f1d1d',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(127,29,29,0.2)'
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
    backgroundColor: '#991b1b',
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
    color: '#7f1d1d',
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
  metricRed: { backgroundColor: '#7f1d1d' },
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
  th: { backgroundColor: '#7f1d1d', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '15px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px' },

  btnPrimary: { backgroundColor: '#7f1d1d', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function ColumnCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [columnNos, setColumnNos] = useState(4);
  const [heightFt, setHeightFt] = useState(10);
  const [widthIn, setWidthIn] = useState(9);
  const [depthIn, setDepthIn] = useState(9);
  const [grade, setGrade] = useState('M20');
  const [cornerDia, setCornerDia] = useState(12);
  const [cornerNos, setCornerNos] = useState(4);
  const [middleDia, setMiddleDia] = useState(12);
  const [middleNos, setMiddleNos] = useState(4);
  const [tieDia, setTieDia] = useState(8);
  const [tieSpacingMm, setTieSpacingMm] = useState(150);
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
  const shutteringBoxRate = getMasterRate(["SRV-COL-SHT", "shuttering box", "column shuttering"], 0);
  const rccLabourRate = getMasterRate(["SRV-RCC-LAY", "rcc labour", "column labour"], 0);

  const calcResults = useMemo(() => {
    const H_m = heightFt * 0.3048;
    const W_m = (widthIn * 25.4) / 1000;
    const D_m = (depthIn * 25.4) / 1000;

    const volPerColCum = H_m * W_m * D_m;
    const totalVolCum = Number((volPerColCum * columnNos).toFixed(2));
    const totalVolCft = Math.round(totalVolCum * 35.3147);

    const cementFactor = grade === 'M25' ? 11.10 : grade === 'M30' ? 12.50 : 8.07;
    const mSandFactor = grade === 'M25' ? 13.60 : grade === 'M30' ? 12.80 : 14.81;
    const ca20Factor = grade === 'M25' ? 16.32 : grade === 'M30' ? 15.36 : 17.77;
    const ca12Factor = grade === 'M25' ? 10.88 : grade === 'M30' ? 10.24 : 11.85;

    const cementBags = Math.ceil(totalVolCum * cementFactor);
    const mSandCft = Math.round(totalVolCum * mSandFactor);
    const ca20Cft = Math.round(totalVolCum * ca20Factor);
    const ca12Cft = Math.round(totalVolCum * ca12Factor);

    // Reinforcement Steel Engine (IS 456)
    const L_cornerM = H_m + (50 * cornerDia / 1000);
    const L_middleM = H_m + (50 * middleDia / 1000);

    const cornerWeightKg = columnNos * cornerNos * L_cornerM * ((cornerDia * cornerDia) / 162.2);
    const middleWeightKg = columnNos * middleNos * L_middleM * ((middleDia * middleDia) / 162.2);

    const W_coreM = Math.max((widthIn * 25.4 - 2 * coverMm) / 1000, 0);
    const D_coreM = Math.max((depthIn * 25.4 - 2 * coverMm) / 1000, 0);
    const cuttingLengthTieM = (2 * (W_coreM + D_coreM)) + (24 * tieDia / 1000);
    const tieNosPerCol = Math.ceil((H_m * 1000) / tieSpacingMm) + 1;
    const tieWeightKg = columnNos * tieNosPerCol * cuttingLengthTieM * ((tieDia * tieDia) / 162.2);

    const totalSteelKg = Math.round((cornerWeightKg + middleWeightKg + tieWeightKg) * 1.03); // 3% wastage
    const bindingWireKg = Math.ceil(totalSteelKg * 0.015);
    const shutteringSqft = Math.round(2 * (widthIn + depthIn) / 12 * heightFt * columnNos);
    const coverBlockPcs = Math.ceil(columnNos * tieNosPerCol * 4);

    const items = [
      {
        code: cementRate.itemCode || "MAT-CEM-01",
        category: "Concrete Material",
        name: `Cement (OPC 53 Grade - ${grade})`,
        uom: "BAG",
        qty: cementBags,
        rateObj: cementRate
      },
      {
        code: steelRate.itemCode || "MAT-STL-01",
        category: "Reinforcement Steel",
        name: "TMT Rebar Steel (Fe 500D Column Cage)",
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
        name: "Concrete Column Cover Blocks (40mm)",
        uom: "NOS",
        qty: coverBlockPcs,
        rateObj: coverRate
      },
      {
        code: shutteringBoxRate.itemCode || "SRV-COL-SHT",
        category: "Formwork Services",
        name: "Column Metal/Plywood Box Formwork Shuttering",
        uom: "SQFT",
        qty: shutteringSqft,
        rateObj: shutteringBoxRate
      },
      {
        code: rccLabourRate.itemCode || "SRV-RCC-LAY",
        category: "Labour Services",
        name: "Column RCC Casting & Steel Binding Labour",
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
      columnNos,
      totalVolCum,
      totalVolCft,
      totalSteelKg,
      shutteringSqft,
      totalMaterialCost,
      totalLabourCost,
      grandTotalCost,
      costPerCol: columnNos > 0 ? grandTotalCost / columnNos : 0,
      items: processedItems,
      missingItems
    };
  }, [columnNos, heightFt, widthIn, depthIn, grade, cornerDia, cornerNos, middleDia, middleNos, tieDia, tieSpacingMm, coverMm, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, wireRate, coverRate, shutteringBoxRate, rccLabourRate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("column_calc_export", "COLUMN-CALC", () => {
      const data = [
        ["BUILDMITRA RCC COLUMN ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Column Dimensions", `${widthIn}" x ${depthIn}" x ${heightFt}ft (${columnNos} Columns)`],
        ["Concrete Grade", grade],
        ["Concrete Volume", `${calcResults.totalVolCum} CUM (${calcResults.totalVolCft} CFT)`],
        ["Steel Rebar Required", `${calcResults.totalSteelKg} KG`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calcResults.grandTotalCost)],
        [],
        ["ITEMIZED COLUMN BOQ"],
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
      XLSX.utils.book_append_sheet(wb, ws, "Column_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Column_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("column_calc_export", "COLUMN-CALC", () => {
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
        "BuildMitra – RCC Column Estimation Report",
        [
          ["Column Dimensions:", `${widthIn}" x ${depthIn}" x ${heightFt}ft (${columnNos} Columns)`],
          ["Concrete Volume:", `${calcResults.totalVolCum} CUM (${calcResults.totalVolCft} CFT)`],
          ["Steel Rebar Weight:", `${calcResults.totalSteelKg} KG`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calcResults.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Column_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>RCC Column Calculator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>CONCRETE &amp; RCC ENGINE</span>
            <h1 style={styles.headerTitle}>🏛️ BuildMitra – RCC Column Estimator</h1>
          </div>
          <button style={styles.backBtn} onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Inputs */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>📐 Enter Column Dimensions &amp; Reinforcement</span>
          </div>

          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Column Count (Nos)</label>
              <input type="number" value={columnNos} onChange={(e) => handleInputChange(setColumnNos, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Height (ft)</label>
              <input type="number" value={heightFt} onChange={(e) => handleInputChange(setHeightFt, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Width (in)</label>
              <input type="number" value={widthIn} onChange={(e) => handleInputChange(setWidthIn, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Depth (in)</label>
              <input type="number" value={depthIn} onChange={(e) => handleInputChange(setDepthIn, Number(e.target.value))} style={styles.input} />
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
              <label style={styles.label}>Corner Rebar Dia (mm)</label>
              <select value={cornerDia} onChange={(e) => handleInputChange(setCornerDia, Number(e.target.value))} style={styles.select}>
                <option value={12}>12 mm</option>
                <option value={16}>16 mm</option>
                <option value={20}>20 mm</option>
                <option value={25}>25 mm</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Corner Bars Count</label>
              <input type="number" value={cornerNos} onChange={(e) => handleInputChange(setCornerNos, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Middle Rebar Dia (mm)</label>
              <select value={middleDia} onChange={(e) => handleInputChange(setMiddleDia, Number(e.target.value))} style={styles.select}>
                <option value={12}>12 mm</option>
                <option value={16}>16 mm</option>
                <option value={20}>20 mm</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Middle Bars Count</label>
              <input type="number" value={middleNos} onChange={(e) => handleInputChange(setMiddleNos, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Tie/Stirrup Dia (mm)</label>
              <select value={tieDia} onChange={(e) => handleInputChange(setTieDia, Number(e.target.value))} style={styles.select}>
                <option value={8}>8 mm</option>
                <option value={10}>10 mm</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Tie Spacing (mm)</label>
              <input type="number" value={tieSpacingMm} onChange={(e) => handleInputChange(setTieSpacingMm, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Clear Cover (mm)</label>
              <input type="number" value={coverMm} onChange={(e) => handleInputChange(setCoverMm, Number(e.target.value))} style={styles.input} />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Column</button>
            <button style={styles.btnReset} onClick={() => setColumnNos(4)}>🔄 Reset</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
          </div>
        </div>

        {/* Result Metric Cards */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricRed }}>
            <span style={styles.metricTitle}>Concrete Volume</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#fecdd3' : '#ffffff' }}>{calcResults.totalVolCum} CUM</span>
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
          <div style={{ padding: '12px 16px', backgroundColor: '#7f1d1d', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized RCC Column BOQ (Admin Master Linked)
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
              <tr style={{ backgroundColor: '#7f1d1d', color: 'white', fontWeight: '800' }}>
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
