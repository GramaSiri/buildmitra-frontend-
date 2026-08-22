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
    backgroundColor: '#ea580c',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(234,88,12,0.2)'
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
    backgroundColor: '#c2410c',
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
    color: '#ea580c',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #ffedd5',
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
  metricOrange: { backgroundColor: '#ea580c' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
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
  th: { backgroundColor: '#ea580c', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '15px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px' },

  btnPrimary: { backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function RoofTrussCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [lengthFt, setLengthFt] = useState(30);
  const [widthFt, setWidthFt] = useState(40);
  const [riseFt, setRiseFt] = useState(10);
  const [spacingFt, setSpacingFt] = useState(8);
  const [roofType, setRoofType] = useState('Mangalore Tiles');
  const [structureType, setStructureType] = useState('Terrace Light');

  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  const handleInputChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (0 fallback)
  const steelRate = getMasterRate(["MAT-STL-01", "structural steel", "tmt steel"], 0);
  const roofRate = getMasterRate(["MAT-MNG-TLE", "MAT-ROF-SHT", "roof sheeting", "mangalore tiles"], 0);
  const paintRate = getMasterRate(["MAT-ROF-PNT", "primer paint", "enamel paint"], 0);
  const fabLabourRate = getMasterRate(["SRV-TRU-LAB", "truss fabrication labour", "steel labour"], 0);

  const calcResults = useMemo(() => {
    const halfSpanFt = widthFt / 2;
    const rafterLenFt = Math.sqrt(halfSpanFt * halfSpanFt + riseFt * riseFt);
    const overhangFt = 1.5;
    const totalRafterLenFt = rafterLenFt + overhangFt;
    const totalRoofAreaSqft = Math.round(2 * totalRafterLenFt * (lengthFt + 2 * overhangFt));

    const trussNos = Math.ceil(lengthFt / spacingFt) + 1;
    const purlinRows = Math.ceil((2 * totalRafterLenFt) / 4.0);
    const totalPurlinLenFt = purlinRows * (lengthFt + 2 * overhangFt);

    let topChordKg = 0;
    let botChordKg = 0;
    let webBracingKg = 0;
    let purlinKg = 0;
    let columnKg = 0;
    let plateKg = 0;

    if (structureType === 'Terrace Light') {
      topChordKg = (trussNos * (2 * totalRafterLenFt) * 0.3048 * 4.8);
      botChordKg = (trussNos * widthFt * 0.3048 * 3.8);
      webBracingKg = (trussNos * (widthFt * 0.6) * 0.3048 * 2.8);
      purlinKg = (totalPurlinLenFt * 0.3048 * 2.8);
      columnKg = ((trussNos * 2) * 10 * 0.3048 * 8.5);
      plateKg = ((topChordKg + botChordKg + webBracingKg) * 0.04);
    } else {
      topChordKg = (trussNos * (2 * totalRafterLenFt) * 0.3048 * 10.9);
      botChordKg = (trussNos * widthFt * 0.3048 * 8.9);
      webBracingKg = (trussNos * (widthFt * 0.8) * 0.3048 * 5.8);
      purlinKg = (totalPurlinLenFt * 0.3048 * 8.9);
      columnKg = ((trussNos * 2) * 10 * 0.3048 * 37.3);
      plateKg = ((topChordKg + botChordKg + webBracingKg) * 0.08);
    }

    const totalSteelKg = Math.round((topChordKg + botChordKg + webBracingKg + purlinKg + columnKg + plateKg) * 1.05); // 5% wastage
    const paintSqft = Math.round(totalRoofAreaSqft * 1.25);
    const tilesNos = Math.ceil(totalRoofAreaSqft * 1.15); // Mangalore tiles per sqft

    const items = [
      {
        code: steelRate.itemCode || "MAT-STL-01",
        category: "Structural Steel Framing",
        name: `Structural Steel Members (${structureType === 'Terrace Light' ? 'SHS/RHS Hollow Sections' : 'Heavy Angles & Channel Sections'})`,
        uom: "KG",
        qty: totalSteelKg,
        rateObj: steelRate
      },
      {
        code: roofRate.itemCode || "MAT-MNG-TLE",
        category: "Roof Sheeting & Tiles",
        name: `Roof Covering (${roofType})`,
        uom: roofType === 'Mangalore Tiles' ? "NOS" : "SQFT",
        qty: roofType === 'Mangalore Tiles' ? tilesNos : totalRoofAreaSqft,
        rateObj: roofRate
      },
      {
        code: paintRate.itemCode || "MAT-ROF-PNT",
        category: "Surface Coating",
        name: "Red Oxide Primer & Anti-Corrosive Paint",
        uom: "SQFT",
        qty: paintSqft,
        rateObj: paintRate
      },
      {
        code: fabLabourRate.itemCode || "SRV-TRU-LAB",
        category: "Labour Services",
        name: "Roof Truss Fabrication & Erection Labour",
        uom: "KG",
        qty: totalSteelKg,
        rateObj: fabLabourRate
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
      trussNos,
      totalRoofAreaSqft,
      totalSteelKg,
      totalMaterialCost,
      totalLabourCost,
      grandTotalCost,
      items: processedItems,
      missingItems
    };
  }, [lengthFt, widthFt, riseFt, spacingFt, roofType, structureType, steelRate, roofRate, paintRate, fabLabourRate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("roof_truss_calc_export", "ROOF-TRUSS-CALC", () => {
      const data = [
        ["BUILDMITRA ROOF TRUSS ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Building Span & Length", `${lengthFt}ft (L) x ${widthFt}ft (W) x ${riseFt}ft (Rise)`],
        ["Roof Covered Area", `${calcResults.totalRoofAreaSqft} SQFT`],
        ["Steel Weight Required", `${calcResults.totalSteelKg} KG`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calcResults.grandTotalCost)],
        [],
        ["ITEMIZED ROOF TRUSS BOQ"],
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
      XLSX.utils.book_append_sheet(wb, ws, "Roof_Truss_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Roof_Truss_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("roof_truss_calc_export", "ROOF-TRUSS-CALC", () => {
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
        "BuildMitra – Roof Truss Estimation Report",
        [
          ["Building Dimensions:", `${lengthFt}ft (L) x ${widthFt}ft (W) x ${riseFt}ft (Rise)`],
          ["Roof Covered Area:", `${calcResults.totalRoofAreaSqft} SQFT`],
          ["Structural Steel Weight:", `${calcResults.totalSteelKg} KG`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calcResults.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Roof_Truss_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>Roof Truss Calculator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>ROOFING &amp; STEEL ENGINE</span>
            <h1 style={styles.headerTitle}>🏠 BuildMitra – Roof Truss Estimator</h1>
          </div>
          <button style={styles.backBtn} onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Inputs */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>📐 Enter Roof Truss &amp; Sheeting Specifications</span>
          </div>

          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Building Length (ft)</label>
              <input type="number" value={lengthFt} onChange={(e) => handleInputChange(setLengthFt, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Span Width (ft)</label>
              <input type="number" value={widthFt} onChange={(e) => handleInputChange(setWidthFt, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Truss Rise/Height (ft)</label>
              <input type="number" value={riseFt} onChange={(e) => handleInputChange(setRiseFt, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Truss Spacing (ft)</label>
              <input type="number" value={spacingFt} onChange={(e) => handleInputChange(setSpacingFt, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Roof Type</label>
              <select value={roofType} onChange={(e) => handleInputChange(setRoofType, e.target.value)} style={styles.select}>
                <option value="Mangalore Tiles">Mangalore Clay Tiles</option>
                <option value="Galvalume Sheets">Galvalume Color Coated Sheets</option>
                <option value="Polycarbonate">Polycarbonate Sheets</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Structure Type</label>
              <select value={structureType} onChange={(e) => handleInputChange(setStructureType, e.target.value)} style={styles.select}>
                <option value="Terrace Light">Terrace Light (Hollow SHS/RHS Sections)</option>
                <option value="Heavy Industrial">Heavy Industrial (Angle &amp; Channel Truss)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Roof Truss</button>
            <button style={styles.btnReset} onClick={() => setLengthFt(30)}>🔄 Reset</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
          </div>
        </div>

        {/* Result Metric Cards */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Steel Weight</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#ffedd5' : '#ffffff' }}>{calcResults.totalSteelKg.toLocaleString()} KG</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Roof Area</span>
            <span style={styles.metricVal}>{calcResults.totalRoofAreaSqft} Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
            <span style={styles.metricTitle}>Truss Count</span>
            <span style={styles.metricVal}>{calcResults.trussNos} Nos</span>
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
          <div style={{ padding: '12px 16px', backgroundColor: '#ea580c', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized Roof Truss BOQ (Admin Master Linked)
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
              <tr style={{ backgroundColor: '#ea580c', color: 'white', fontWeight: '800' }}>
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
