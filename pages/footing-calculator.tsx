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
    backgroundColor: '#0f766e',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(15,118,110,0.2)'
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
    backgroundColor: '#14b8a6',
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
    color: '#0f766e',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #ccfbf1',
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
  metricTeal: { backgroundColor: '#0f766e' },
  metricBlue: { backgroundColor: '#2563eb' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
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
  th: { backgroundColor: '#0f766e', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '15px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px' },

  btnPrimary: { backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function FootingCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [footingNos, setFootingNos] = useState(4);
  const [lengthFt, setLengthFt] = useState(5);
  const [widthFt, setWidthFt] = useState(5);
  const [depthFt, setDepthFt] = useState(1.5);
  const [excDepthFt, setExcDepthFt] = useState(4);
  const [workSpaceFt, setWorkSpaceFt] = useState(1);
  const [pccThickMm, setPccThickMm] = useState(100);
  const [pccProjIn, setPccProjIn] = useState(6);
  const [grade, setGrade] = useState('M20');
  const [mainDia, setMainDia] = useState(12);
  const [mainSpacingMm, setMainSpacingMm] = useState(150);
  const [distDia, setDistDia] = useState(12);
  const [distSpacingMm, setDistSpacingMm] = useState(150);
  const [coverMm, setCoverMm] = useState(50);
  const [bendLengthMm, setBendLengthMm] = useState(300);

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
  const excRate = getMasterRate(["SRV-EXC-01", "pit excavation", "earthwork"], 0);
  const shutteringRate = getMasterRate(["SRV-FTG-SHT", "footing shuttering", "formwork"], 0);
  const rccLabourRate = getMasterRate(["SRV-RCC-LAY", "rcc labour", "footing labour"], 0);

  const calcResults = useMemo(() => {
    const pitLengthFt = lengthFt + 2 * workSpaceFt;
    const pitWidthFt = widthFt + 2 * workSpaceFt;
    const excVolCft = footingNos * pitLengthFt * pitWidthFt * excDepthFt;
    const excVolCum = Number((excVolCft / 35.3147).toFixed(2));

    const pccLengthFt = lengthFt + 2 * (pccProjIn / 12);
    const pccWidthFt = widthFt + 2 * (pccProjIn / 12);
    const pccVolCft = footingNos * pccLengthFt * pccWidthFt * (pccThickMm / 304.8);
    const pccVolCum = pccVolCft / 35.3147;
    const pccCementBags = pccVolCum * 3.40;

    const rccVolCft = footingNos * lengthFt * widthFt * depthFt;
    const rccVolCum = Number((rccVolCft / 35.3147).toFixed(2));
    const totalVolCft = Math.round((pccVolCum + rccVolCum) * 35.3147);

    const cementFactor = grade === 'M25' ? 11.10 : grade === 'M30' ? 12.50 : 8.07;
    const mSandFactor = grade === 'M25' ? 13.60 : grade === 'M30' ? 12.80 : 14.81;
    const ca20Factor = grade === 'M25' ? 16.32 : grade === 'M30' ? 15.36 : 17.77;
    const ca12Factor = grade === 'M25' ? 10.88 : grade === 'M30' ? 10.24 : 11.85;

    const rccCementBags = rccVolCum * cementFactor;
    const totalCementBags = Math.ceil(pccCementBags + rccCementBags);
    const mSandCft = Math.round(rccVolCum * mSandFactor + pccVolCum * 14.0);
    const ca20Cft = Math.round(rccVolCum * ca20Factor);
    const ca12Cft = Math.round(rccVolCum * ca12Factor);

    // Reinforcement Mesh Engine (IS 456)
    const mainBarLenM = (lengthFt * 0.3048 - 2 * (coverMm / 1000)) + 2 * (bendLengthMm / 1000);
    const mainBarCount = Math.ceil((widthFt * 304.8 - 2 * coverMm) / mainSpacingMm) + 1;
    const mainWeightKg = footingNos * mainBarCount * mainBarLenM * ((mainDia * mainDia) / 162.2);

    const distBarLenM = (widthFt * 0.3048 - 2 * (coverMm / 1000)) + 2 * (bendLengthMm / 1000);
    const distBarCount = Math.ceil((lengthFt * 304.8 - 2 * coverMm) / distSpacingMm) + 1;
    const distWeightKg = footingNos * distBarCount * distBarLenM * ((distDia * distDia) / 162.2);

    const totalSteelKg = Math.round((mainWeightKg + distWeightKg) * 1.03); // 3% wastage
    const bindingWireKg = Math.ceil(totalSteelKg * 0.015);
    const shutteringSqft = Math.round(2 * (lengthFt + widthFt) * depthFt * footingNos);
    const coverBlockPcs = Math.ceil(footingNos * 8);

    const items = [
      {
        code: excRate.itemCode || "SRV-EXC-01",
        category: "Earthwork & Excavation",
        name: "Footing Foundation Pit Excavation & Backfilling",
        uom: "CUM",
        qty: excVolCum,
        rateObj: excRate
      },
      {
        code: cementRate.itemCode || "MAT-CEM-01",
        category: "Concrete Material",
        name: `Cement (PCC 1:4:8 Bed + RCC ${grade})`,
        uom: "BAG",
        qty: totalCementBags,
        rateObj: cementRate
      },
      {
        code: steelRate.itemCode || "MAT-STL-01",
        category: "Reinforcement Steel",
        name: "TMT Rebar Steel (Fe 500D Footing Mesh)",
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
        name: "Concrete Footing Cover Blocks (50mm)",
        uom: "NOS",
        qty: coverBlockPcs,
        rateObj: coverRate
      },
      {
        code: shutteringRate.itemCode || "SRV-FTG-SHT",
        category: "Formwork Services",
        name: "RCC Footing Side Formwork Shuttering",
        uom: "SQFT",
        qty: shutteringSqft,
        rateObj: shutteringRate
      },
      {
        code: rccLabourRate.itemCode || "SRV-RCC-LAY",
        category: "Labour Services",
        name: "PCC & Footing RCC Casting Labour",
        uom: "CUM",
        qty: rccVolCum,
        rateObj: rccLabourRate
      }
    ];

    let totalMaterialCost = 0;
    let totalLabourCost = 0;

    const processedItems = items.map(it => {
      const isFound = it.rateObj.found && Number(it.rateObj.rate) > 0;
      const rateVal = isFound ? Number(it.rateObj.rate) : 0;
      const amountVal = isFound ? it.qty * rateVal : 0;

      if (it.category.includes("Labour") || it.category.includes("Formwork") || it.category.includes("Earthwork")) {
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
      footingNos,
      excVolCum,
      rccVolCum,
      totalVolCft,
      totalSteelKg,
      shutteringSqft,
      totalMaterialCost,
      totalLabourCost,
      grandTotalCost,
      costPerFooting: footingNos > 0 ? grandTotalCost / footingNos : 0,
      items: processedItems,
      missingItems
    };
  }, [footingNos, lengthFt, widthFt, depthFt, excDepthFt, workSpaceFt, pccThickMm, pccProjIn, grade, mainDia, mainSpacingMm, distDia, distSpacingMm, coverMm, bendLengthMm, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, wireRate, coverRate, excRate, shutteringRate, rccLabourRate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("footing_calc_export", "FOOTING-CALC", () => {
      const data = [
        ["BUILDMITRA RCC FOOTING ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Footing Dimensions", `${lengthFt}ft x ${widthFt}ft x ${depthFt}ft (${footingNos} Footings)`],
        ["Concrete Grade", grade],
        ["RCC Concrete Volume", `${calcResults.rccVolCum} CUM`],
        ["Steel Rebar Required", `${calcResults.totalSteelKg} KG`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calcResults.grandTotalCost)],
        [],
        ["ITEMIZED FOOTING BOQ"],
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
      XLSX.utils.book_append_sheet(wb, ws, "Footing_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Footing_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("footing_calc_export", "FOOTING-CALC", () => {
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
        "BuildMitra – RCC Footing Estimation Report",
        [
          ["Footing Dimensions:", `${lengthFt}ft x ${widthFt}ft x ${depthFt}ft (${footingNos} Footings)`],
          ["Pit Excavation Volume:", `${calcResults.excVolCum} CUM`],
          ["RCC Concrete Volume:", `${calcResults.rccVolCum} CUM`],
          ["Steel Mesh Weight:", `${calcResults.totalSteelKg} KG`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calcResults.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Footing_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>RCC Footing Calculator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>FOUNDATION &amp; RCC ENGINE</span>
            <h1 style={styles.headerTitle}>🔽 BuildMitra – RCC Footing Estimator</h1>
          </div>
          <button style={styles.backBtn} onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Inputs */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>📐 Enter Footing Dimensions &amp; Reinforcement Mesh</span>
          </div>

          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Footing Count (Nos)</label>
              <input type="number" value={footingNos} onChange={(e) => handleInputChange(setFootingNos, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Footing Length (ft)</label>
              <input type="number" value={lengthFt} onChange={(e) => handleInputChange(setLengthFt, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Footing Width (ft)</label>
              <input type="number" value={widthFt} onChange={(e) => handleInputChange(setWidthFt, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>RCC Depth (ft)</label>
              <input type="number" value={depthFt} onChange={(e) => handleInputChange(setDepthFt, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Pit Exc Depth (ft)</label>
              <input type="number" value={excDepthFt} onChange={(e) => handleInputChange(setExcDepthFt, Number(e.target.value))} style={styles.input} />
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
              <label style={styles.label}>Main Rebar Dia (mm)</label>
              <select value={mainDia} onChange={(e) => handleInputChange(setMainDia, Number(e.target.value))} style={styles.select}>
                <option value={10}>10 mm</option>
                <option value={12}>12 mm</option>
                <option value={16}>16 mm</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Main Spacing (mm)</label>
              <input type="number" value={mainSpacingMm} onChange={(e) => handleInputChange(setMainSpacingMm, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Dist Rebar Dia (mm)</label>
              <select value={distDia} onChange={(e) => handleInputChange(setDistDia, Number(e.target.value))} style={styles.select}>
                <option value={10}>10 mm</option>
                <option value={12}>12 mm</option>
                <option value={16}>16 mm</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Dist Spacing (mm)</label>
              <input type="number" value={distSpacingMm} onChange={(e) => handleInputChange(setDistSpacingMm, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Clear Cover (mm)</label>
              <input type="number" value={coverMm} onChange={(e) => handleInputChange(setCoverMm, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>L-Bend Length (mm)</label>
              <input type="number" value={bendLengthMm} onChange={(e) => handleInputChange(setBendLengthMm, Number(e.target.value))} style={styles.input} />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Footing</button>
            <button style={styles.btnReset} onClick={() => setFootingNos(4)}>🔄 Reset</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
          </div>
        </div>

        {/* Result Metric Cards */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>RCC Concrete Volume</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#99f6e4' : '#ffffff' }}>{calcResults.rccVolCum} CUM</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Steel Mesh Weight</span>
            <span style={styles.metricVal}>{calcResults.totalSteelKg.toLocaleString()} KG</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
            <span style={styles.metricTitle}>Pit Excavation</span>
            <span style={styles.metricVal}>{calcResults.excVolCum} CUM</span>
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
          <div style={{ padding: '12px 16px', backgroundColor: '#0f766e', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized RCC Footing BOQ (Admin Master Linked)
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
              <tr style={{ backgroundColor: '#0f766e', color: 'white', fontWeight: '800' }}>
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
