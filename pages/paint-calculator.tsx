import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";
import { downloadBuildMitraPDF } from "../utils/pdfExport";

const COVERAGES = {
  putty: 10,     // 1 kg = 10 sqft
  primer: 120,   // 1 L = 120 sqft
  emulsion: 60,  // 1 L = 60 sqft
  royal: 55,     // 1 L = 55 sqft
  exterior: 50,  // 1 L = 50 sqft
  enamel: 100,   // 1 L = 100 sqft
  texture: 25    // 1 L = 25 sqft
};

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
    backgroundColor: '#9333ea',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(147,51,234,0.2)'
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
    backgroundColor: '#7e22ce',
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
    color: '#9333ea',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    borderBottom: '2px solid #f3e8ff',
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
  metricPurple: { backgroundColor: '#9333ea' },
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
  th: { backgroundColor: '#9333ea', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '15px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px' },

  btnPrimary: { backgroundColor: '#9333ea', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
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

export interface WallRow {
  id: string;
  name: string;
  length: number;
  height: number;
  nos: number;
}

export interface RoomRow {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  nos: number;
  includeCeiling: boolean;
}

export interface DeductionRow {
  id: string;
  name: string;
  height: number;
  width: number;
  nos: number;
}

export default function PaintCalculatorPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [calcMode, setCalcMode] = useState<'quick' | 'detailed'>('quick');
  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  // Quick Mode Inputs
  const [totalArea, setTotalArea] = useState(1000);
  const [finishType, setFinishType] = useState('Fresh Coat');
  const [paintType, setPaintType] = useState('Regular Emulsion');
  const [primerCoats, setPrimerCoats] = useState(1);
  const [paintCoats, setPaintCoats] = useState(2);

  // Detailed Mode Inputs
  const [workType, setWorkType] = useState<'Fresh Painting' | 'Repainting'>('Fresh Painting');
  const [locationApp, setLocationApp] = useState('Internal Walls');
  const [finishSystem, setFinishSystem] = useState('Premium Emulsion');

  const [wallRows, setWallRows] = useState<WallRow[]>([
    { id: 'w1', name: 'Living Room Accent Wall', length: 20, height: 10, nos: 1 },
    { id: 'w2', name: 'Passage & Hallway', length: 30, height: 10, nos: 1 }
  ]);

  const [roomRows, setRoomRows] = useState<RoomRow[]>([
    { id: 'r1', name: 'Master Bedroom', length: 15, width: 12, height: 10, nos: 1, includeCeiling: true },
    { id: 'r2', name: 'Guest Bedroom', length: 12, width: 10, height: 10, nos: 1, includeCeiling: true }
  ]);

  const [deductionRows, setDeductionRows] = useState<DeductionRow[]>([
    { id: 'd1', name: 'Main Door & Bedroom Doors', height: 7, width: 3, nos: 4 },
    { id: 'd2', name: 'Windows', height: 4, width: 4, nos: 4 }
  ]);

  const handleAddWallRow = () => {
    setWallRows(prev => [...prev, { id: `w_${Date.now()}`, name: `Wall ${prev.length + 1}`, length: 15, height: 10, nos: 1 }]);
    setIsInputModified(true);
  };

  const handleUpdateWallRow = (id: string, field: keyof WallRow, value: any) => {
    setWallRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };

  const handleDeleteWallRow = (id: string) => {
    setWallRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  const handleAddRoomRow = () => {
    setRoomRows(prev => [...prev, { id: `r_${Date.now()}`, name: `Room ${prev.length + 1}`, length: 12, width: 10, height: 10, nos: 1, includeCeiling: true }]);
    setIsInputModified(true);
  };

  const handleUpdateRoomRow = (id: string, field: keyof RoomRow, value: any) => {
    setRoomRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };

  const handleDeleteRoomRow = (id: string) => {
    setRoomRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  const handleAddDeductionRow = () => {
    setDeductionRows(prev => [...prev, { id: `d_${Date.now()}`, name: 'Door / Window', height: 4, width: 3, nos: 1 }]);
    setIsInputModified(true);
  };

  const handleUpdateDeductionRow = (id: string, field: keyof DeductionRow, value: any) => {
    setDeductionRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };

  const handleDeleteDeductionRow = (id: string) => {
    setDeductionRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (0 fallback)
  const puttyRate = getMasterRate(["MAT-PUT-01", "wall putty", "putty"], 0);
  const primerRate = getMasterRate(["MAT-PRM-01", "wall primer", "primer"], 0);
  const emulsionRate = getMasterRate(["MAT-PNT-01", "emulsion paint", "regular emulsion"], 0);
  const royalRate = getMasterRate(["MAT-PNT-ROY", "royal paint", "premium paint"], 0);
  const exteriorRate = getMasterRate(["MAT-PNT-EXT", "exterior paint", "weatherproof paint"], 0);
  const labourRate = getMasterRate(["SRV-PNT-LAY", "painting labour", "paint labour"], 0);

  const getPaintRateObj = (type: string): MasterRateResult => {
    if (type.includes("Royal") || type.includes("Premium") || type.includes("Luxury")) return royalRate;
    if (type.includes("Exterior") || type.includes("Weatherproof")) return exteriorRate;
    return emulsionRate;
  };

  // Calculations Engine
  const calcResults = useMemo(() => {
    if (calcMode === 'quick') {
      const isFresh = finishType === 'Fresh Coat';
      const puttyKg = isFresh ? Math.ceil(totalArea / COVERAGES.putty) : 0;

      const primerCoverage = COVERAGES.primer / Math.max(1, primerCoats);
      const primerLtr = Math.ceil(totalArea / primerCoverage);

      const covPerLtr = paintType.includes("Royal") ? COVERAGES.royal : paintType.includes("Exterior") ? COVERAGES.exterior : COVERAGES.emulsion;
      const effectivePaintCoverage = covPerLtr / (paintCoats / 2);
      const paintLtr = Math.ceil(totalArea / effectivePaintCoverage);

      const activePaintRateObj = getPaintRateObj(paintType);

      const items = [
        {
          code: puttyRate.itemCode || "MAT-PUT-01",
          category: "Base Preparation",
          name: "Wall Putty (Acrylic Water Resistant)",
          uom: "KG",
          qty: puttyKg,
          rateObj: puttyRate
        },
        {
          code: primerRate.itemCode || "MAT-PRM-01",
          category: "Undercoat Material",
          name: "Wall Primer (Interior / Exterior)",
          uom: "LTR",
          qty: primerLtr,
          rateObj: primerRate
        },
        {
          code: activePaintRateObj.itemCode || "MAT-PNT-01",
          category: "Finish Paint",
          name: `Top Coat Paint (${paintType})`,
          uom: "LTR",
          qty: paintLtr,
          rateObj: activePaintRateObj
        },
        {
          code: labourRate.itemCode || "SRV-PNT-LAY",
          category: "Labour Services",
          name: "Surface Preparation & Painting Labour",
          uom: "SQFT",
          qty: totalArea,
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
        grossArea: totalArea,
        netArea: totalArea,
        deductionArea: 0,
        puttyKg,
        primerLtr,
        paintLtr,
        totalMaterialCost,
        totalLabourCost,
        grandTotalCost,
        items: processedItems,
        missingItems: processedItems.filter(it => !it.isFound)
      };
    } else {
      // Detailed Mode Calculations
      let grossWallSqft = 0;
      wallRows.forEach(row => {
        grossWallSqft += row.length * row.height * row.nos;
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

      const totalGrossArea = grossWallSqft + grossRoomWallSqft + grossRoomCeilingSqft;
      const netPaintArea = Math.max(0, totalGrossArea - totalDeductionSqft);

      const isFresh = workType === 'Fresh Painting';
      const puttyKg = isFresh ? Math.ceil(netPaintArea / COVERAGES.putty) : 0;
      const primerLtr = isFresh ? Math.ceil(netPaintArea / COVERAGES.primer) : Math.ceil(netPaintArea / (COVERAGES.primer * 1.5));

      const covPerLtr = finishSystem.includes("Royal") || finishSystem.includes("Luxury") ? COVERAGES.royal : finishSystem.includes("Exterior") || finishSystem.includes("Weatherproof") ? COVERAGES.exterior : finishSystem.includes("Texture") ? COVERAGES.texture : COVERAGES.emulsion;
      const paintLtr = Math.ceil(netPaintArea / (covPerLtr / 2));

      const activePaintRateObj = getPaintRateObj(finishSystem);

      const items = [
        {
          code: puttyRate.itemCode || "MAT-PUT-01",
          category: "Base Preparation",
          name: "Wall Putty (Acrylic Water Resistant - 2 Coats)",
          uom: "KG",
          qty: puttyKg,
          rateObj: puttyRate
        },
        {
          code: primerRate.itemCode || "MAT-PRM-01",
          category: "Undercoat Material",
          name: "Interior & Exterior Primer Coat",
          uom: "LTR",
          qty: primerLtr,
          rateObj: primerRate
        },
        {
          code: activePaintRateObj.itemCode || "MAT-PNT-01",
          category: "Finish Paint System",
          name: `Top Coat Finish (${finishSystem} - 2 Coats)`,
          uom: "LTR",
          qty: paintLtr,
          rateObj: activePaintRateObj
        },
        {
          code: labourRate.itemCode || "SRV-PNT-LAY",
          category: "Labour Services",
          name: "Surface Scaffolding, Sanding & Painting Labour",
          uom: "SQFT",
          qty: Math.round(netPaintArea),
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
        netArea: Math.round(netPaintArea),
        deductionArea: Math.round(totalDeductionSqft),
        puttyKg,
        primerLtr,
        paintLtr,
        totalMaterialCost,
        totalLabourCost,
        grandTotalCost,
        items: processedItems,
        missingItems: processedItems.filter(it => !it.isFound)
      };
    }
  }, [calcMode, totalArea, finishType, paintType, primerCoats, paintCoats, workType, locationApp, finishSystem, wallRows, roomRows, deductionRows, puttyRate, primerRate, emulsionRate, royalRate, exteriorRate, labourRate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("paint_calc_export", "PAINT-CALC", () => {
      const data = [
        ["BUILDMITRA PAINT ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Calculation Mode", calcMode.toUpperCase()],
        ["Net Paint Area", `${calcResults.netArea} Sq.ft`],
        ["Paint Quantity", `${calcResults.paintLtr} Liters`],
        ["Putty Quantity", `${calcResults.puttyKg} KG`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calcResults.grandTotalCost)],
        [],
        ["ITEMIZED PAINT BOQ"],
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
      XLSX.utils.book_append_sheet(wb, ws, "Paint_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Paint_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("paint_calc_export", "PAINT-CALC", () => {
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
        `BuildMitra – Painting Estimation Report (${calcMode.toUpperCase()})`,
        [
          ["Mode:", calcMode.toUpperCase()],
          ["Gross Paint Area:", `${calcResults.grossArea} Sq.ft`],
          ["Net Paint Area:", `${calcResults.netArea} Sq.ft`],
          ["Openings Deductions:", `${calcResults.deductionArea} Sq.ft`],
          ["Paint Topcoat Required:", `${calcResults.paintLtr} Liters`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calcResults.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Paint_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>Paint Calculator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>FINISHING &amp; COATINGS</span>
            <h1 style={styles.headerTitle}>🎨 BuildMitra – Paint &amp; Coating Estimator</h1>
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
              backgroundColor: calcMode === 'quick' ? '#9333ea' : '#ffffff',
              color: calcMode === 'quick' ? '#ffffff' : '#475569',
              border: calcMode === 'quick' ? '2px solid #9333ea' : '1px solid #cbd5e1'
            }}
          >
            ⚡ Quick Paint Calculator
          </button>
          <button
            onClick={() => setCalcMode('detailed')}
            style={{
              ...styles.modeToggleBtn,
              backgroundColor: calcMode === 'detailed' ? '#9333ea' : '#ffffff',
              color: calcMode === 'detailed' ? '#ffffff' : '#475569',
              border: calcMode === 'detailed' ? '2px solid #9333ea' : '1px solid #cbd5e1'
            }}
          >
            📐 Detailed Paint &amp; Room Calculator
          </button>
        </div>

        {calcMode === 'quick' ? (
          /* QUICK MODE INPUTS */
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <span>📐 Enter Surface Area &amp; Painting Specifications</span>
            </div>

            <div style={styles.gridCompact}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Total Surface Area (sq.ft)</label>
                <input
                  type="number"
                  value={totalArea}
                  onChange={(e) => { setTotalArea(Number(e.target.value)); setIsInputModified(true); }}
                  style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Finish Type</label>
                <select value={finishType} onChange={(e) => { setFinishType(e.target.value); setIsInputModified(true); }} style={styles.select}>
                  <option value="Fresh Coat">Fresh Painting (Putty + Primer + Paint)</option>
                  <option value="Repaint">Repainting (Touch-up Putty + Paint)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Paint System</label>
                <select value={paintType} onChange={(e) => { setPaintType(e.target.value); setIsInputModified(true); }} style={styles.select}>
                  <option value="Regular Emulsion">Interior Tractor/Regular Emulsion</option>
                  <option value="Premium Emulsion">Interior Premium Emulsion</option>
                  <option value="Royal Luxury Emulsion">Royal Luxury Silk Finish</option>
                  <option value="Exterior Emulsion">Exterior Apex Weatherproof</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Primer Coats</label>
                <input type="number" value={primerCoats} onChange={(e) => { setPrimerCoats(Number(e.target.value)); setIsInputModified(true); }} style={styles.input} />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Paint Coats</label>
                <input type="number" value={paintCoats} onChange={(e) => { setPaintCoats(Number(e.target.value)); setIsInputModified(true); }} style={styles.input} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
              <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Paint BOQ</button>
              <button style={styles.btnReset} onClick={() => setTotalArea(1000)}>🔄 Reset</button>
              <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
              <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
            </div>
          </div>
        ) : (
          /* DETAILED MODE INPUTS */
          <>
            {/* Global Paint System Specifications */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <span>⚙️ Detailed Paint System &amp; Application Options</span>
              </div>

              <div style={styles.gridCompact}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Paint Work Type</label>
                  <select value={workType} onChange={(e) => { setWorkType(e.target.value as any); setIsInputModified(true); }} style={styles.select}>
                    <option value="Fresh Painting">Fresh Painting (New Surface)</option>
                    <option value="Repainting">Repainting (Existing Surface)</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Application Scope</label>
                  <select value={locationApp} onChange={(e) => { setLocationApp(e.target.value); setIsInputModified(true); }} style={styles.select}>
                    <option value="Internal Walls">Internal Walls</option>
                    <option value="External Walls">External Walls</option>
                    <option value="Ceiling">Ceiling Only</option>
                    <option value="Internal + Ceiling">Internal Walls + Ceiling</option>
                    <option value="Internal + External">Internal + External</option>
                    <option value="Complete Building">Complete Building</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Paint Quality &amp; Finish</label>
                  <select value={finishSystem} onChange={(e) => { setFinishSystem(e.target.value); setIsInputModified(true); }} style={styles.select}>
                    <option value="Basic Emulsion">Basic Emulsion</option>
                    <option value="Premium Emulsion">Premium Emulsion</option>
                    <option value="Ultra Premium Emulsion">Ultra Premium Emulsion</option>
                    <option value="Luxury / Royal Finish">Luxury / Royal Finish</option>
                    <option value="Exterior Emulsion">Exterior Weatherproof Emulsion</option>
                    <option value="Texture Paint">Texture / Designer Finish</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section A: Individual Wall Measurements */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <span>🧱 Individual Wall Measurements</span>
                <button style={styles.btnAdd} onClick={handleAddWallRow}>+ Add Wall / Area</button>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Wall Description</th>
                      <th style={styles.th}>Length (ft)</th>
                      <th style={styles.th}>Height (ft)</th>
                      <th style={styles.th}>Nos</th>
                      <th style={styles.th}>Calculated Area</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallRows.map((row) => {
                      const areaSqft = row.length * row.height * row.nos;
                      return (
                        <tr key={row.id}>
                          <td style={styles.td}>
                            <input type="text" value={row.name} onChange={(e) => handleUpdateWallRow(row.id, 'name', e.target.value)} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.length} onChange={(e) => handleUpdateWallRow(row.id, 'length', Number(e.target.value))} style={{ ...styles.input, height: '32px', ...(isInputModified ? styles.inputModified : {}) }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.height} onChange={(e) => handleUpdateWallRow(row.id, 'height', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.nos} onChange={(e) => handleUpdateWallRow(row.id, 'nos', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}><strong>{areaSqft.toLocaleString()} Sq.ft</strong></td>
                          <td style={styles.td}>
                            <button style={styles.btnDelete} onClick={() => handleDeleteWallRow(row.id)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section B: Room Measurements */}
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
                <span>🚪 Opening Deductions (Doors, Windows &amp; Vents)</span>
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
                <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Detailed Paint BOQ</button>
                <button style={styles.btnReset} onClick={() => { setWallRows([]); setRoomRows([]); setDeductionRows([]); }}>🔄 Reset All</button>
                <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
                <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
              </div>
            </div>
          </>
        )}

        {/* Result Metrics */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricPurple }}>
            <span style={styles.metricTitle}>Net Paint Area</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#f3e8ff' : '#ffffff' }}>{calcResults.netArea.toLocaleString()} Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Topcoat Paint</span>
            <span style={styles.metricVal}>{calcResults.paintLtr} Liters</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Wall Putty</span>
            <span style={styles.metricVal}>{calcResults.puttyKg} KG</span>
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
          <div style={{ padding: '12px 16px', backgroundColor: '#9333ea', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized Paint BOQ ({calcMode.toUpperCase()} MODE - Admin Master Linked)
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
              <tr style={{ backgroundColor: '#9333ea', color: 'white', fontWeight: '800' }}>
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
