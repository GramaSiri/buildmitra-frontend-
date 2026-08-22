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
  modeToggleContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px'
  },
  modeToggleBtn: {
    padding: '10px 20px',
    fontSize: '15px',
    fontWeight: '800',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: '0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
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
    justifyContent: 'space-between',
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
  btnAdd: { backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' },
  btnDelete: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export interface PlasterAreaRow {
  id: string;
  name: string;
  length: number;
  height: number;
  nos: number;
}

export interface PlasterRoomRow {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  nos: number;
  includeCeiling: boolean;
}

export interface PlasterDeductionRow {
  id: string;
  name: string;
  height: number;
  width: number;
  nos: number;
}

export default function PlasterCalculatorPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [calcMode, setCalcMode] = useState<'quick' | 'detailed'>('quick');
  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  // Quick Mode State
  const [totalArea, setTotalArea] = useState(1000);
  const [thicknessMm, setThicknessMm] = useState(12);
  const [mortarRatio, setMortarRatio] = useState('1:4');
  const [wastagePct, setWastagePct] = useState(5);

  // Detailed Mode State
  const [plasterLocation, setPlasterLocation] = useState('Internal Wall');
  const [detailedThickMm, setDetailedThickMm] = useState(12);
  const [detailedRatio, setDetailedRatio] = useState('1:4');
  const [includeChickenMesh, setIncludeChickenMesh] = useState(true);
  const [includeWaterproofing, setIncludeWaterproofing] = useState(false);

  const [areaRows, setAreaRows] = useState<PlasterAreaRow[]>([
    { id: 'pa1', name: 'Internal Wall Plaster', length: 30, height: 10, nos: 2 },
    { id: 'pa2', name: 'Staircase Wall Plaster', length: 15, height: 10, nos: 1 }
  ]);

  const [roomRows, setRoomRows] = useState<PlasterRoomRow[]>([
    { id: 'pr1', name: 'Living Room', length: 20, width: 15, height: 10, nos: 1, includeCeiling: true },
    { id: 'pr2', name: 'Master Bedroom', length: 15, width: 12, height: 10, nos: 1, includeCeiling: true }
  ]);

  const [deductionRows, setDeductionRows] = useState<PlasterDeductionRow[]>([
    { id: 'pd1', name: 'Main Door & Doors', height: 7, width: 3, nos: 4 },
    { id: 'pd2', name: 'Windows & Ventilators', height: 4, width: 4, nos: 4 }
  ]);

  const handleAddAreaRow = () => {
    setAreaRows(prev => [...prev, { id: `pa_${Date.now()}`, name: `Wall Area ${prev.length + 1}`, length: 15, height: 10, nos: 1 }]);
    setIsInputModified(true);
  };

  const handleUpdateAreaRow = (id: string, field: keyof PlasterAreaRow, value: any) => {
    setAreaRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };

  const handleDeleteAreaRow = (id: string) => {
    setAreaRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  const handleAddRoomRow = () => {
    setRoomRows(prev => [...prev, { id: `pr_${Date.now()}`, name: `Room ${prev.length + 1}`, length: 12, width: 10, height: 10, nos: 1, includeCeiling: true }]);
    setIsInputModified(true);
  };

  const handleUpdateRoomRow = (id: string, field: keyof PlasterRoomRow, value: any) => {
    setRoomRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };

  const handleDeleteRoomRow = (id: string) => {
    setRoomRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  const handleAddDeductionRow = () => {
    setDeductionRows(prev => [...prev, { id: `pd_${Date.now()}`, name: 'Door / Window', height: 4, width: 3, nos: 1 }]);
    setIsInputModified(true);
  };

  const handleUpdateDeductionRow = (id: string, field: keyof PlasterDeductionRow, value: any) => {
    setDeductionRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };

  const handleDeleteDeductionRow = (id: string) => {
    setDeductionRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (0 fallback)
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53"], 0);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 0);
  const meshRate = getMasterRate(["MAT-MSH-01", "chicken mesh", "gi mesh"], 0);
  const wprRate = getMasterRate(["MAT-WPR-01", "waterproofing chemical"], 0);
  const labourRate = getMasterRate(["SRV-PLS-LAY", "plastering labour", "plaster labour"], 0);

  // Calculations Engine
  const calcResults = useMemo(() => {
    if (calcMode === 'quick') {
      const areaSft = Math.max(0, totalArea);
      const areaSqm = areaSft / 10.7639;
      const thkM = thicknessMm / 1000;

      const wetVolCum = areaSqm * thkM;
      const dryVolCum = wetVolCum * 1.33 * (1 + wastagePct / 100);

      const parts = mortarRatio.split(':').map(Number);
      const cementPart = parts[0] || 1;
      const sandPart = parts[1] || 4;
      const totalParts = cementPart + sandPart;

      const cementVolCum = (dryVolCum * cementPart) / totalParts;
      const cementBags = Math.ceil((cementVolCum * 1440) / 50); // 1440 kg/m3 density

      const sandVolCum = (dryVolCum * sandPart) / totalParts;
      const sandCft = Math.round(sandVolCum * 35.3147);

      const items = [
        {
          code: cementRate.itemCode || "MAT-CEM-01",
          category: "Plastering Material",
          name: `Cement (OPC 53 Grade - ${mortarRatio} Mortar)`,
          uom: "BAG",
          qty: cementBags,
          rateObj: cementRate
        },
        {
          code: sandRate.itemCode || "MAT-MSND-01",
          category: "Plastering Material",
          name: "M-Sand (Plastering Fine Sand)",
          uom: "CFT",
          qty: sandCft,
          rateObj: sandRate
        },
        {
          code: labourRate.itemCode || "SRV-PLS-LAY",
          category: "Labour Services",
          name: `Wall/Ceiling Plastering Labour (${thicknessMm}mm)`,
          uom: "SQFT",
          qty: areaSft,
          rateObj: labourRate
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

        return { ...it, isFound, rateVal, amountVal };
      });

      const grandTotalCost = totalMaterialCost + totalLabourCost;

      return {
        grossArea: areaSft,
        netArea: areaSft,
        deductionArea: 0,
        cementBags,
        sandCft,
        wetVolCum: Number(wetVolCum.toFixed(2)),
        totalMaterialCost,
        totalLabourCost,
        grandTotalCost,
        items: processedItems,
        missingItems: processedItems.filter(it => !it.isFound)
      };
    } else {
      // Detailed Mode Calculations
      let grossAreaSqft = 0;
      areaRows.forEach(row => {
        grossAreaSqft += row.length * row.height * row.nos;
      });

      let grossRoomWallSqft = 0;
      let grossRoomCeilingSqft = 0;

      roomRows.forEach(row => {
        grossRoomWallSqft += 2 * (row.length + row.width) * row.height * row.nos;
        if (row.includeCeiling) {
          grossRoomCeilingSqft += row.length * row.width * row.nos;
        }
      });

      let totalDeductionSqft = 0;
      deductionRows.forEach(row => {
        totalDeductionSqft += row.height * row.width * row.nos;
      });

      const totalGrossArea = grossAreaSqft + grossRoomWallSqft + grossRoomCeilingSqft;
      const netPlasterArea = Math.max(0, totalGrossArea - totalDeductionSqft);
      const netPlasterSqm = netPlasterArea / 10.7639;

      const thkM = detailedThickMm / 1000;
      const wetVolCum = netPlasterSqm * thkM;
      const dryVolCum = wetVolCum * 1.33 * 1.05; // 33% dry expansion + 5% wastage

      const parts = detailedRatio.split(':').map(Number);
      const cementPart = parts[0] || 1;
      const sandPart = parts[1] || 4;
      const totalParts = cementPart + sandPart;

      const cementVolCum = (dryVolCum * cementPart) / totalParts;
      const cementBags = Math.ceil((cementVolCum * 1440) / 50);

      const sandVolCum = (dryVolCum * sandPart) / totalParts;
      const sandCft = Math.round(sandVolCum * 35.3147);

      const meshSqft = includeChickenMesh ? Math.round(netPlasterArea * 0.15) : 0;
      const wprLtr = includeWaterproofing ? Math.ceil(cementBags * 0.20) : 0;

      const items = [
        {
          code: cementRate.itemCode || "MAT-CEM-01",
          category: "Plastering Material",
          name: `Cement (OPC 53 Grade - ${detailedRatio} Mortar)`,
          uom: "BAG",
          qty: cementBags,
          rateObj: cementRate
        },
        {
          code: sandRate.itemCode || "MAT-MSND-01",
          category: "Plastering Material",
          name: "M-Sand (Plastering Fine Sand)",
          uom: "CFT",
          qty: sandCft,
          rateObj: sandRate
        },
        {
          code: meshRate.itemCode || "MAT-MSH-01",
          category: "Plaster Accessories",
          name: "Chicken GI Wire Mesh (Column-Masonry Junctions)",
          uom: "SQFT",
          qty: meshSqft,
          rateObj: meshRate
        },
        {
          code: wprRate.itemCode || "MAT-WPR-01",
          category: "Additives",
          name: "Integral Waterproofing Compound",
          uom: "LTR",
          qty: wprLtr,
          rateObj: wprRate
        },
        {
          code: labourRate.itemCode || "SRV-PLS-LAY",
          category: "Labour Services",
          name: `Plastering Labour (${plasterLocation} - ${detailedThickMm}mm)`,
          uom: "SQFT",
          qty: Math.round(netPlasterArea),
          rateObj: labourRate
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

        return { ...it, isFound, rateVal, amountVal };
      });

      const grandTotalCost = totalMaterialCost + totalLabourCost;

      return {
        grossArea: Math.round(totalGrossArea),
        netArea: Math.round(netPlasterArea),
        deductionArea: Math.round(totalDeductionSqft),
        cementBags,
        sandCft,
        wetVolCum: Number(wetVolCum.toFixed(2)),
        totalMaterialCost,
        totalLabourCost,
        grandTotalCost,
        items: processedItems,
        missingItems: processedItems.filter(it => !it.isFound)
      };
    }
  }, [calcMode, totalArea, thicknessMm, mortarRatio, wastagePct, plasterLocation, detailedThickMm, detailedRatio, includeChickenMesh, includeWaterproofing, areaRows, roomRows, deductionRows, cementRate, sandRate, meshRate, wprRate, labourRate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("plaster_calc_export", "PLASTER-CALC", () => {
      const data = [
        ["BUILDMITRA PLASTERING ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Calculation Mode", calcMode.toUpperCase()],
        ["Net Plaster Area", `${calcResults.netArea} Sq.ft`],
        ["Cement Required", `${calcResults.cementBags} Bags`],
        ["Sand Required", `${calcResults.sandCft} CFT`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calcResults.grandTotalCost)],
        [],
        ["ITEMIZED PLASTERING BOQ"],
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
      XLSX.utils.book_append_sheet(wb, ws, "Plaster_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Plaster_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("plaster_calc_export", "PLASTER-CALC", () => {
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
        `BuildMitra – Plastering Estimation Report (${calcMode.toUpperCase()})`,
        [
          ["Mode:", calcMode.toUpperCase()],
          ["Gross Plaster Area:", `${calcResults.grossArea} Sq.ft`],
          ["Net Plaster Area:", `${calcResults.netArea} Sq.ft`],
          ["Deductions Area:", `${calcResults.deductionArea} Sq.ft`],
          ["Cement Bags Required:", `${calcResults.cementBags} Bags`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calcResults.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Plaster_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>Plaster Calculator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>MASONRY &amp; FINISHING</span>
            <h1 style={styles.headerTitle}>🧱 BuildMitra – Plastering Estimator</h1>
          </div>
          <button style={styles.backBtn} onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Mode Switcher */}
        <div style={styles.modeToggleContainer}>
          <button
            onClick={() => setCalcMode('quick')}
            style={{
              ...styles.modeToggleBtn,
              backgroundColor: calcMode === 'quick' ? '#0f766e' : '#ffffff',
              color: calcMode === 'quick' ? '#ffffff' : '#475569',
              border: calcMode === 'quick' ? '2px solid #0f766e' : '1px solid #cbd5e1'
            }}
          >
            ⚡ Quick Plaster Calculator
          </button>
          <button
            onClick={() => setCalcMode('detailed')}
            style={{
              ...styles.modeToggleBtn,
              backgroundColor: calcMode === 'detailed' ? '#0f766e' : '#ffffff',
              color: calcMode === 'detailed' ? '#ffffff' : '#475569',
              border: calcMode === 'detailed' ? '2px solid #0f766e' : '1px solid #cbd5e1'
            }}
          >
            📐 Detailed Room/Area Plaster Calculator
          </button>
        </div>

        {calcMode === 'quick' ? (
          /* QUICK MODE INPUTS */
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <span>📐 Enter Plaster Surface Area &amp; Mortar Specifications</span>
            </div>

            <div style={styles.gridCompact}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Total Plaster Area (sq.ft)</label>
                <input
                  type="number"
                  value={totalArea}
                  onChange={(e) => { setTotalArea(Number(e.target.value)); setIsInputModified(true); }}
                  style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Thickness (mm)</label>
                <select value={thicknessMm} onChange={(e) => { setThicknessMm(Number(e.target.value)); setIsInputModified(true); }} style={styles.select}>
                  <option value={12}>12 mm (Internal Smooth)</option>
                  <option value={15}>15 mm (Internal/Rough)</option>
                  <option value={20}>20 mm (External Double Coat)</option>
                  <option value={6}>6 mm (Ceiling Neeru)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mortar Ratio (Cement:Sand)</label>
                <select value={mortarRatio} onChange={(e) => { setMortarRatio(e.target.value); setIsInputModified(true); }} style={styles.select}>
                  <option value="1:3">1:3 (Rich Mortar)</option>
                  <option value="1:4">1:4 (Standard Internal)</option>
                  <option value="1:5">1:5 (Ceiling/Internal)</option>
                  <option value="1:6">1:6 (External Rough)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Wastage %</label>
                <input type="number" value={wastagePct} onChange={(e) => { setWastagePct(Number(e.target.value)); setIsInputModified(true); }} style={styles.input} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
              <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Plaster BOQ</button>
              <button style={styles.btnReset} onClick={() => setTotalArea(1000)}>🔄 Reset</button>
              <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
              <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
            </div>
          </div>
        ) : (
          /* DETAILED MODE INPUTS */
          <>
            {/* Global Specifications Card */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <span>⚙️ Detailed Plaster Specifications &amp; Accessories</span>
              </div>

              <div style={styles.gridCompact}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Plaster Location</label>
                  <select value={plasterLocation} onChange={(e) => { setPlasterLocation(e.target.value); setIsInputModified(true); }} style={styles.select}>
                    <option value="Internal Wall">Internal Wall</option>
                    <option value="External Wall">External Wall</option>
                    <option value="Ceiling">Ceiling Only</option>
                    <option value="Internal + Ceiling">Internal + Ceiling</option>
                    <option value="External">External Building</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Plaster Thickness (mm)</label>
                  <select value={detailedThickMm} onChange={(e) => { setDetailedThickMm(Number(e.target.value)); setIsInputModified(true); }} style={styles.select}>
                    <option value={12}>12 mm (Internal Smooth)</option>
                    <option value={15}>15 mm (Internal/Rough)</option>
                    <option value={20}>20 mm (External Double Coat)</option>
                    <option value={6}>6 mm (Ceiling Neeru)</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Mortar Mix Ratio</label>
                  <select value={detailedRatio} onChange={(e) => { setDetailedRatio(e.target.value); setIsInputModified(true); }} style={styles.select}>
                    <option value="1:3">1:3 (Rich Mortar)</option>
                    <option value="1:4">1:4 (Standard Internal)</option>
                    <option value="1:5">1:5 (Ceiling/Internal)</option>
                    <option value="1:6">1:6 (External Rough)</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Chicken GI Wire Mesh</label>
                  <select value={includeChickenMesh ? 'YES' : 'NO'} onChange={(e) => { setIncludeChickenMesh(e.target.value === 'YES'); setIsInputModified(true); }} style={styles.select}>
                    <option value="YES">Include GI Mesh (Junctions)</option>
                    <option value="NO">No Mesh</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Waterproofing Chemical</label>
                  <select value={includeWaterproofing ? 'YES' : 'NO'} onChange={(e) => { setIncludeWaterproofing(e.target.value === 'YES'); setIsInputModified(true); }} style={styles.select}>
                    <option value="YES">Include Waterproofing</option>
                    <option value="NO">No Waterproofing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section A: Individual Area Rows */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <span>🧱 Individual Plaster Wall Areas</span>
                <button style={styles.btnAdd} onClick={handleAddAreaRow}>+ Add Plaster Area</button>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Area Description</th>
                      <th style={styles.th}>Length (ft)</th>
                      <th style={styles.th}>Height (ft)</th>
                      <th style={styles.th}>Nos</th>
                      <th style={styles.th}>Calculated Area</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areaRows.map((row) => {
                      const areaSqft = row.length * row.height * row.nos;
                      return (
                        <tr key={row.id}>
                          <td style={styles.td}>
                            <input type="text" value={row.name} onChange={(e) => handleUpdateAreaRow(row.id, 'name', e.target.value)} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.length} onChange={(e) => handleUpdateAreaRow(row.id, 'length', Number(e.target.value))} style={{ ...styles.input, height: '32px', ...(isInputModified ? styles.inputModified : {}) }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.height} onChange={(e) => handleUpdateAreaRow(row.id, 'height', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.nos} onChange={(e) => handleUpdateAreaRow(row.id, 'nos', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}><strong>{areaSqft.toLocaleString()} Sq.ft</strong></td>
                          <td style={styles.td}>
                            <button style={styles.btnDelete} onClick={() => handleDeleteAreaRow(row.id)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section B: Room Rows */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <span>🏠 Room Measurements (Walls + Ceiling)</span>
                <button style={styles.btnAdd} onClick={handleAddRoomRow}>+ Add Room</button>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Room Name</th>
                      <th style={styles.th}>Length (ft)</th>
                      <th style={styles.th}>Width (ft)</th>
                      <th style={styles.th}>Height (ft)</th>
                      <th style={styles.th}>Nos</th>
                      <th style={styles.th}>Ceiling</th>
                      <th style={styles.th}>Calculated Area</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomRows.map((row) => {
                      const wallArea = 2 * (row.length + row.width) * row.height * row.nos;
                      const ceilingArea = row.includeCeiling ? row.length * row.width * row.nos : 0;
                      const totalRoomArea = wallArea + ceilingArea;
                      return (
                        <tr key={row.id}>
                          <td style={styles.td}>
                            <input type="text" value={row.name} onChange={(e) => handleUpdateRoomRow(row.id, 'name', e.target.value)} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.length} onChange={(e) => handleUpdateRoomRow(row.id, 'length', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.width} onChange={(e) => handleUpdateRoomRow(row.id, 'width', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.height} onChange={(e) => handleUpdateRoomRow(row.id, 'height', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.nos} onChange={(e) => handleUpdateRoomRow(row.id, 'nos', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="checkbox" checked={row.includeCeiling} onChange={(e) => handleUpdateRoomRow(row.id, 'includeCeiling', e.target.checked)} style={{ width: '18px', height: '18px' }} />
                          </td>
                          <td style={styles.td}><strong>{totalRoomArea.toLocaleString()} Sq.ft</strong></td>
                          <td style={styles.td}>
                            <button style={styles.btnDelete} onClick={() => handleDeleteRoomRow(row.id)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section C: Opening Deductions */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <span>🚪 Opening Deductions (Doors &amp; Windows)</span>
                <button style={styles.btnAdd} onClick={handleAddDeductionRow}>+ Add Deduction</button>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Opening Description</th>
                      <th style={styles.th}>Height (ft)</th>
                      <th style={styles.th}>Width (ft)</th>
                      <th style={styles.th}>Nos</th>
                      <th style={styles.th}>Deduction Area</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deductionRows.map((row) => {
                      const dedSqft = row.height * row.width * row.nos;
                      return (
                        <tr key={row.id}>
                          <td style={styles.td}>
                            <input type="text" value={row.name} onChange={(e) => handleUpdateDeductionRow(row.id, 'name', e.target.value)} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.height} onChange={(e) => handleUpdateDeductionRow(row.id, 'height', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.width} onChange={(e) => handleUpdateDeductionRow(row.id, 'width', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.nos} onChange={(e) => handleUpdateDeductionRow(row.id, 'nos', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}><strong>{dedSqft.toLocaleString()} Sq.ft</strong></td>
                          <td style={styles.td}>
                            <button style={styles.btnDelete} onClick={() => handleDeleteDeductionRow(row.id)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Detailed Plaster BOQ</button>
                <button style={styles.btnReset} onClick={() => { setAreaRows([]); setRoomRows([]); setDeductionRows([]); }}>🔄 Reset All</button>
                <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
                <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
              </div>
            </div>
          </>
        )}

        {/* Result Metrics */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Net Plaster Area</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#99f6e4' : '#ffffff' }}>{calcResults.netArea.toLocaleString()} Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Cement Bags</span>
            <span style={styles.metricVal}>{calcResults.cementBags} Bags</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
            <span style={styles.metricTitle}>Sand Quantity</span>
            <span style={styles.metricVal}>{calcResults.sandCft.toLocaleString()} CFT</span>
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

        {/* Missing Master Items Warning */}
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
            📑 Itemized Plastering BOQ ({calcMode.toUpperCase()} MODE - Admin Master Linked)
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
