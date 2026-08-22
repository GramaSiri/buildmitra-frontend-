import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";
import { downloadBuildMitraPDF } from "../utils/pdfExport";

type RCCMemberType = 'Slab' | 'Beam' | 'Lintel' | 'Column' | 'Footing' | 'RCC Wall';

const RCC_MEMBERS: { id: RCCMemberType; label: string; icon: string }[] = [
  { id: 'Slab', label: 'One-way / Two-way Slab', icon: '🔲' },
  { id: 'Beam', label: 'RCC Beam / Plinth Beam', icon: '📏' },
  { id: 'Lintel', label: 'Lintel Beam', icon: '🚪' },
  { id: 'Column', label: 'RCC Column', icon: '🏛️' },
  { id: 'Footing', label: 'Footing & Starter Dowels', icon: '🦶' },
  { id: 'RCC Wall', label: 'Retaining / RCC Shear Wall', icon: '🧱' }
];

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
    backgroundColor: '#0284c7',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(2,132,199,0.2)'
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
    backgroundColor: '#0369a1',
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
    color: '#0284c7',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #e0f2fe',
    paddingBottom: '8px'
  },
  memberBar: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    gap: '8px',
    paddingBottom: '8px',
    marginBottom: '14px',
    WebkitOverflowScrolling: 'touch'
  },
  memberTab: (active: boolean) => ({
    padding: '8px 14px',
    borderRadius: '8px',
    border: active ? '2px solid #0284c7' : '1px solid #cbd5e1',
    backgroundColor: active ? '#f0f9ff' : '#ffffff',
    color: active ? '#0284c7' : '#475569',
    fontWeight: active ? '800' : '600',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }),
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
  metricBlue: { backgroundColor: '#0284c7' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTeal: { backgroundColor: '#0f766e' },
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
  th: { backgroundColor: '#0284c7', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '15px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px' },

  btnPrimary: { backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function SteelCalculatorPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [item, setItem] = useState<RCCMemberType>('Slab');
  const [steelGrade, setSteelGrade] = useState('Fe 500D');
  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [wastage, setWastage] = useState(3);
  const [bindingWirePercent, setBindingWirePercent] = useState(1);
  const [memberNos, setMemberNos] = useState(1);
  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(20);
  const [xDia, setXDia] = useState(10);
  const [yDia, setYDia] = useState(8);
  const [xSpacingMm, setXSpacingMm] = useState(150);

  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  const handleInputChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (0 fallback)
  const steelRateRes = getMasterRate(["MAT-STL-01", "tmt steel", "steel rebar", "fe 500d"], 0);
  const bindingWireRateRes = getMasterRate(["MAT-BWR-01", "binding wire", "gi wire"], 0);
  const coverBlockRateRes = getMasterRate(["MAT-CVR-01", "concrete cover block", "cover block"], 0);
  const barBendingLabourRes = getMasterRate(["SRV-RCC-LAY", "bar bending", "steel binding labour"], 0);

  const calculations = useMemo(() => {
    const lM = length * 0.3048;
    const wM = width * 0.3048;

    const xBarsCount = Math.ceil((wM * 1000) / xSpacingMm) + 1;
    const yBarsCount = Math.ceil((lM * 1000) / xSpacingMm) + 1;

    const xWeightKg = (xBarsCount * (lM + 0.3)) * ((xDia * xDia) / 162);
    const yWeightKg = (yBarsCount * (wM + 0.3)) * ((yDia * yDia) / 162);

    const netSteelKg = (xWeightKg + yWeightKg) * memberNos;
    const grossSteelKg = Math.round(netSteelKg * (1 + wastage / 100));
    const bindingWireKg = Math.ceil(grossSteelKg * (bindingWirePercent / 100));
    const coverBlocksPcs = Math.ceil((length * width * memberNos) / 10);

    const items = [
      {
        code: steelRateRes.itemCode || "MAT-STL-01",
        category: "Reinforcement Steel",
        name: `TMT Rebar Steel (${steelGrade} Grade)`,
        uom: "KG",
        qty: grossSteelKg,
        rateObj: steelRateRes
      },
      {
        code: bindingWireRateRes.itemCode || "MAT-BWR-01",
        category: "Steel Accessories",
        name: "Steel Binding Wire (18 Gauge GI)",
        uom: "KG",
        qty: bindingWireKg,
        rateObj: bindingWireRateRes
      },
      {
        code: coverBlockRateRes.itemCode || "MAT-CVR-01",
        category: "Steel Accessories",
        name: "Concrete Cover Blocks (20/25mm)",
        uom: "NOS",
        qty: coverBlocksPcs,
        rateObj: coverBlockRateRes
      },
      {
        code: barBendingLabourRes.itemCode || "SRV-RCC-LAY",
        category: "Labour Services",
        name: "Bar Bending, Cutting & Steel Binding Labour",
        uom: "KG",
        qty: grossSteelKg,
        rateObj: barBendingLabourRes
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
      grossSteelKg,
      grossSteelTonnes: Number((grossSteelKg / 1000).toFixed(2)),
      bindingWireKg,
      coverBlocksPcs,
      totalMaterialCost,
      totalLabourCost,
      grandTotalCost,
      costPerKg: grossSteelKg > 0 ? grandTotalCost / grossSteelKg : 0,
      items: processedItems,
      missingItems
    };
  }, [length, width, xDia, yDia, xSpacingMm, memberNos, wastage, bindingWirePercent, steelGrade, steelRateRes, bindingWireRateRes, coverBlockRateRes, barBendingLabourRes]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("steel_calc_export", "STEEL-CALC", () => {
      const data = [
        ["BUILDMITRA REINFORCEMENT STEEL ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Member Type", item],
        ["Steel Grade", steelGrade],
        ["Total Steel Weight", `${calculations.grossSteelKg} KG (${calculations.grossSteelTonnes} Tonnes)`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calculations.grandTotalCost)],
        [],
        ["ITEMIZED STEEL BOQ"],
        ["Master Code", "Category", "Description", "Quantity", "UOM", "Approved Rate (₹)", "Total Amount (₹)"],
        ...calculations.items.map(it => [
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
      XLSX.utils.book_append_sheet(wb, ws, "Steel_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Steel_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("steel_calc_export", "STEEL-CALC", () => {
      const headers = ["Master Code", "Category", "Description", "Qty", "UOM", "Rate (₹)", "Amount (₹)"];
      const rows = calculations.items.map(it => [
        it.code,
        it.category,
        it.name,
        String(it.qty),
        it.uom,
        it.isFound ? formatCurrency(it.rateVal) : "Rate Pending Admin Update",
        it.isFound ? formatCurrency(it.amountVal) : "—"
      ]);

      downloadBuildMitraPDF(
        "BuildMitra – Reinforcement Steel Estimation Report",
        [
          ["Member Type:", item.toUpperCase()],
          ["Steel Grade:", steelGrade],
          ["Gross Steel Weight:", `${calculations.grossSteelKg} KG (${calculations.grossSteelTonnes} Tonnes)`],
          ["Binding Wire Required:", `${calculations.bindingWireKg} kg`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calculations.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Steel_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>Steel Rebar Weight &amp; Cost Estimator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>REINFORCEMENT STEEL</span>
            <h1 style={styles.headerTitle}>🔩 BuildMitra – Steel Rebar Weight &amp; Cost Estimator</h1>
          </div>
          <button style={styles.backBtn} onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Member Selector Bar */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>🏗️ Select Structural Member Type</span>
          </div>
          <div style={styles.memberBar}>
            {RCC_MEMBERS.map(m => (
              <button
                key={m.id}
                onClick={() => setItem(m.id)}
                style={styles.memberTab(item === m.id)}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Compact Inputs */}
          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Member Length (ft)</label>
              <input type="number" value={length} onChange={(e) => handleInputChange(setLength, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Member Width (ft)</label>
              <input type="number" value={width} onChange={(e) => handleInputChange(setWidth, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Main Bar Dia (mm)</label>
              <select value={xDia} onChange={(e) => handleInputChange(setXDia, Number(e.target.value))} style={styles.select}>
                <option value={8}>8 mm</option>
                <option value={10}>10 mm</option>
                <option value={12}>12 mm</option>
                <option value={16}>16 mm</option>
                <option value={20}>20 mm</option>
                <option value={25}>25 mm</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Distribution Dia (mm)</label>
              <select value={yDia} onChange={(e) => handleInputChange(setYDia, Number(e.target.value))} style={styles.select}>
                <option value={8}>8 mm</option>
                <option value={10}>10 mm</option>
                <option value={12}>12 mm</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Bar Spacing (mm)</label>
              <input type="number" value={xSpacingMm} onChange={(e) => handleInputChange(setXSpacingMm, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Steel Grade</label>
              <select value={steelGrade} onChange={(e) => handleInputChange(setSteelGrade, e.target.value)} style={styles.select}>
                <option value="Fe 500D">Fe 500D High Ductile</option>
                <option value="Fe 550D">Fe 550D High Tensile</option>
                <option value="Fe 500">Fe 500 Standard</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Member Count (Nos)</label>
              <input type="number" value={memberNos} onChange={(e) => handleInputChange(setMemberNos, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Wastage %</label>
              <input type="number" value={wastage} onChange={(e) => handleInputChange(setWastage, Number(e.target.value))} style={styles.input} />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Steel</button>
            <button style={styles.btnReset} onClick={() => setLength(30)}>🔄 Reset</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
          </div>
        </div>

        {/* Result Cards */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
            <span style={styles.metricTitle}>Gross Steel Weight</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#93c5fd' : '#ffffff' }}>{calculations.grossSteelKg.toLocaleString()} KG</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({calculations.grossSteelTonnes} Tonnes)</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Binding Wire</span>
            <span style={styles.metricVal}>{calculations.bindingWireKg} KG</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Cover Blocks</span>
            <span style={styles.metricVal}>{calculations.coverBlocksPcs} Nos</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
            <span style={styles.metricTitle}>Material Subtotal</span>
            <span style={styles.metricVal}>{formatCurrency(calculations.totalMaterialCost)}</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>GRAND ESTIMATED TOTAL</span>
            <span style={{ ...styles.metricValGrand, color: isCalculatedBlue ? '#60a5fa' : '#ffffff' }}>{formatCurrency(calculations.grandTotalCost)}</span>
          </div>
        </div>

        {/* Missing Master Rates Warning Banner */}
        {calculations.missingItems.length > 0 && (
          <div style={styles.warnBanner}>
            ⚠️ <strong>Master Mapping Required / Approved Rate Unavailable ({calculations.missingItems.length} Line Items)</strong>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
              {calculations.missingItems.map(it => (
                <li key={it.code}>
                  <code>{it.code}</code>: {it.name} — Quantity: <strong>{it.qty.toLocaleString()} {it.uom}</strong> (Status: <em>Master Mapping Required</em>)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Itemized BOQ Table */}
        <div style={styles.tableContainer}>
          <div style={{ padding: '12px 16px', backgroundColor: '#0284c7', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized Reinforcement Steel BOQ (Admin Master Linked)
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
              {calculations.items.map(it => (
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
              <tr style={{ backgroundColor: '#0284c7', color: 'white', fontWeight: '800' }}>
                <td colSpan={6} style={{ padding: '12px 14px', fontSize: '16px' }}>GRAND TOTAL ESTIMATED COST</td>
                <td style={{ padding: '12px 14px', fontSize: '18px' }}>{formatCurrency(calculations.grandTotalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
