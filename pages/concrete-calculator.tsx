import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";
import { downloadBuildMitraPDF } from "../utils/pdfExport";

type MemberType =
  | 'slab'
  | 'column'
  | 'beam'
  | 'footing'
  | 'staircase'
  | 'lintel'
  | 'chajja'
  | 'retaining_wall'
  | 'raft'
  | 'custom';

const MEMBER_TYPES: { id: MemberType; label: string; icon: string }[] = [
  { id: 'slab', label: 'Roof / Floor Slab', icon: '🔲' },
  { id: 'column', label: 'RCC Column', icon: '🏛️' },
  { id: 'beam', label: 'RCC Beam / Plinth Beam', icon: '📏' },
  { id: 'footing', label: 'Isolated / Combined Footing', icon: '🦶' },
  { id: 'staircase', label: 'Staircase (Waist Slab & Steps)', icon: '🪜' },
  { id: 'lintel', label: 'Lintel Beam', icon: '🚪' },
  { id: 'chajja', label: 'Chajja / Sunshade', icon: '☂️' },
  { id: 'retaining_wall', label: 'Retaining Wall', icon: '🧱' },
  { id: 'raft', label: 'Raft Foundation', icon: '⏹️' },
  { id: 'custom', label: 'Custom Structural Member', icon: '⚙️' }
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
    border: active ? '2px solid #7f1d1d' : '1px solid #cbd5e1',
    backgroundColor: active ? '#fef2f2' : '#ffffff',
    color: active ? '#7f1d1d' : '#475569',
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
  metricMaroon: { backgroundColor: '#7f1d1d' },
  metricBlue: { backgroundColor: '#2563eb' },
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

export default function ConcretePage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [memberType, setMemberType] = useState<MemberType>('slab');
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [thickness, setThickness] = useState<number>(0); // mm
  const [height, setHeight] = useState<number>(0); // ft
  const [quantityCount, setQuantityCount] = useState<number>(1);
  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [wastage, setWastage] = useState(3);

  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  const handleInputChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setIsInputModified(true);
  };

  const handleMemberTypeChange = (type: MemberType) => {
    setMemberType(type);
    setIsInputModified(true);
    setLength(0);
    setWidth(0);
    setThickness(0);
    setHeight(0);
    setQuantityCount(1);
    setHasCalculated(false);
  };

  const handleReset = () => {
    setLength(0);
    setWidth(0);
    setThickness(0);
    setHeight(0);
    setQuantityCount(1);
    setHasCalculated(false);
    setIsInputModified(false);
  };

  // Authoritative Admin Rate Master Lookups (0 fallback)
  const cementRateRes = getMasterRate(["MAT-CEM-01", "cement", "opc 53"], 0);
  const sandRateRes = getMasterRate(["MAT-MSND-01", "m-sand", "m sand"], 0);
  const agg20RateRes = getMasterRate(["MAT-AGG-20", "20mm aggregate", "coarse aggregate"], 0);
  const agg12RateRes = getMasterRate(["MAT-AGG-12", "12mm aggregate"], 0);
  const rebarRateRes = getMasterRate(["MAT-STL-01", "tmt steel", "steel rebar"], 0);

  const rccLabourRes = getMasterRate(["SRV-RCC-LAY", "rcc casting labour", "concrete labour"], 0);
  const shutteringLabourRes = getMasterRate(["SRV-COL-SHT", "shuttering labour", "formwork"], 0);

  // Concrete Mix Data (IS 456 / CPWD Standard Quantities per CUM of Finished Concrete)
  const concreteMix: Record<string, { cementBags: number; sandCft: number; agg20Cft: number; agg12Cft: number; waterLtr: number }> = {
    M15: { cementBags: 6.30, sandCft: 15.00, agg20Cft: 18.00, agg12Cft: 12.00, waterLtr: 175 },
    M20: { cementBags: 6.80, sandCft: 14.50, agg20Cft: 17.40, agg12Cft: 11.60, waterLtr: 195 },
    M25: { cementBags: 7.60, sandCft: 13.50, agg20Cft: 16.20, agg12Cft: 10.80, waterLtr: 165 },
    M30: { cementBags: 8.20, sandCft: 12.50, agg20Cft: 15.00, agg12Cft: 10.00, waterLtr: 160 }
  };

  const calculations = useMemo(() => {
    const toFt = (val: number) => unit === 'feet' ? val : val * 3.28084;
    const lFt = toFt(length), wFt = toFt(width), hFt = toFt(height);
    const tFt = thickness / 304.8;

    let volumeCft = 0;
    let shutteringSqft = 0;
    let steelKg = 0;

    if (memberType === 'slab') {
      volumeCft = lFt * wFt * tFt * quantityCount;
      shutteringSqft = (lFt * wFt + 2 * (lFt + wFt) * tFt) * quantityCount;
      steelKg = (volumeCft / 35.3147) * 80;
    } else if (memberType === 'column') {
      volumeCft = lFt * wFt * hFt * quantityCount;
      shutteringSqft = (2 * (lFt + wFt) * hFt) * quantityCount;
      steelKg = (volumeCft / 35.3147) * 160;
    } else if (memberType === 'beam') {
      const wBeamFt = width / 304.8;
      const tBeamFt = thickness / 304.8;
      volumeCft = lFt * wBeamFt * tBeamFt * quantityCount;
      shutteringSqft = (wBeamFt + 2 * tBeamFt) * lFt * quantityCount;
      steelKg = (volumeCft / 35.3147) * 135;
    } else if (memberType === 'footing') {
      volumeCft = lFt * wFt * tFt * quantityCount;
      shutteringSqft = 2 * (lFt + wFt) * tFt * quantityCount;
      steelKg = (volumeCft / 35.3147) * 70;
    } else if (memberType === 'staircase') {
      const lInc = Math.sqrt(lFt * lFt + hFt * hFt);
      const vWaist = lInc * wFt * tFt;
      const vSteps = 0.5 * hFt * lFt * wFt;
      const vLanding = wFt * wFt * tFt;
      volumeCft = (vWaist + vSteps + vLanding) * quantityCount;
      shutteringSqft = (lInc * wFt + hFt * wFt + lFt * hFt) * quantityCount;
      steelKg = (volumeCft / 35.3147) * 110;
    } else if (memberType === 'lintel') {
      const wLintelFt = width / 304.8;
      const tLintelFt = thickness / 304.8;
      volumeCft = lFt * wLintelFt * tLintelFt * quantityCount;
      shutteringSqft = (wLintelFt + 2 * tLintelFt) * lFt * quantityCount;
      steelKg = (volumeCft / 35.3147) * 90;
    } else if (memberType === 'chajja') {
      volumeCft = lFt * wFt * tFt * quantityCount;
      shutteringSqft = (lFt * wFt + (lFt + 2 * wFt) * tFt) * quantityCount;
      steelKg = (volumeCft / 35.3147) * 75;
    } else if (memberType === 'retaining_wall') {
      const vStem = lFt * hFt * tFt;
      const vBase = lFt * (0.6 * hFt) * (1.2 * tFt);
      volumeCft = (vStem + vBase) * quantityCount;
      shutteringSqft = (2 * lFt * hFt + 2 * lFt * (1.2 * tFt)) * quantityCount;
      steelKg = (volumeCft / 35.3147) * 125;
    } else if (memberType === 'raft') {
      volumeCft = lFt * wFt * tFt * quantityCount;
      shutteringSqft = 2 * (lFt + wFt) * tFt * quantityCount;
      steelKg = (volumeCft / 35.3147) * 110;
    } else {
      const depthFt = hFt > 0 ? hFt : tFt;
      volumeCft = lFt * wFt * depthFt * quantityCount;
      shutteringSqft = 2 * (lFt * wFt + lFt * depthFt + wFt * depthFt) * quantityCount;
      steelKg = (volumeCft / 35.3147) * 100;
    }

    const volumeCum = volumeCft / 35.3147;
    const wasteFactor = 1 + (wastage / 100);

    const mix = concreteMix[concreteGrade] || concreteMix['M20'];
    const totalCementBags = Math.ceil(volumeCum * mix.cementBags * wasteFactor);
    const totalSandCft = Math.round(volumeCum * mix.sandCft * wasteFactor);
    const totalAgg20Cft = Math.round(volumeCum * mix.agg20Cft * wasteFactor);
    const totalAgg12Cft = Math.round(volumeCum * mix.agg12Cft * wasteFactor);

    const items = [
      {
        code: cementRateRes.itemCode || "MAT-CEM-01",
        category: "Cement Material",
        name: `Cement (OPC 53 Grade - ${concreteGrade} Mix)`,
        uom: "BAG",
        qty: totalCementBags,
        rateObj: cementRateRes
      },
      {
        code: sandRateRes.itemCode || "MAT-MSND-01",
        category: "Aggregates",
        name: "M-Sand (Manufactured Fine Aggregate)",
        uom: "CFT",
        qty: totalSandCft,
        rateObj: sandRateRes
      },
      {
        code: agg20RateRes.itemCode || "MAT-AGG-20",
        category: "Aggregates",
        name: "20mm Coarse Aggregate",
        uom: "CFT",
        qty: totalAgg20Cft,
        rateObj: agg20RateRes
      },
      {
        code: agg12RateRes.itemCode || "MAT-AGG-12",
        category: "Aggregates",
        name: "12mm Coarse Aggregate",
        uom: "CFT",
        qty: totalAgg12Cft,
        rateObj: agg12RateRes
      },
      {
        code: rebarRateRes.itemCode || "MAT-STL-01",
        category: "Reinforcement Steel",
        name: "TMT Steel Rebar Fe 500D",
        uom: "KG",
        qty: Math.round(steelKg),
        rateObj: rebarRateRes
      },
      {
        code: rccLabourRes.itemCode || "SRV-RCC-LAY",
        category: "Labour Services",
        name: "RCC Casting & Concrete Labour",
        uom: "CUM",
        qty: Number(volumeCum.toFixed(2)),
        rateObj: rccLabourRes
      },
      {
        code: shutteringLabourRes.itemCode || "SRV-COL-SHT",
        category: "Labour Services",
        name: "Steel / Ply Formwork Shuttering Rental & Labour",
        uom: "SQFT",
        qty: Math.round(shutteringSqft),
        rateObj: shutteringLabourRes
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
      volumeCft: Number(volumeCft.toFixed(2)),
      volumeCum: Number(volumeCum.toFixed(2)),
      shutteringSqft: Math.round(shutteringSqft),
      steelKg: Math.round(steelKg),
      totalCementBags,
      totalSandCft,
      totalMaterialCost,
      totalLabourCost,
      grandTotalCost,
      costPerCum: volumeCum > 0 ? grandTotalCost / volumeCum : 0,
      items: processedItems,
      missingItems
    };
  }, [memberType, unit, length, width, thickness, height, quantityCount, concreteGrade, wastage, cementRateRes, sandRateRes, agg20RateRes, agg12RateRes, rebarRateRes, rccLabourRes, shutteringLabourRes]);

  const handleCalculate = () => {
    setHasCalculated(true);
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("concrete_calc_export", "CONCRETE-CALC", () => {
      const data = [
        ["BUILDMITRA CONCRETE & STRUCTURAL ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Member Type", memberType],
        ["Concrete Volume", `${calculations.volumeCum} CUM (${calculations.volumeCft} CFT)`],
        ["Concrete Grade", concreteGrade],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calculations.grandTotalCost)],
        [],
        ["ITEMIZED CONCRETE BOQ"],
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
      XLSX.utils.book_append_sheet(wb, ws, "Concrete_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Concrete_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("concrete_calc_export", "CONCRETE-CALC", () => {
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
        "BuildMitra – Concrete & Structural Estimation Report",
        [
          ["Member Type:", memberType.toUpperCase()],
          ["Concrete Volume:", `${calculations.volumeCum} CUM (${calculations.volumeCft} CFT)`],
          ["Formwork Shuttering:", `${calculations.shutteringSqft} Sq.ft`],
          ["Reinforcement Steel:", `${calculations.steelKg} kg`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calculations.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Concrete_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>Concrete &amp; Structural Estimator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header} className="bm-boq-top-header">
          <div>
            <span style={styles.badge}>CONCRETE &amp; RCC ENGINE</span>
            <h1 style={styles.headerTitle}>🧱 BuildMitra – Concrete Estimator</h1>
          </div>
          <button style={styles.backBtn} className="bm-top-back-btn" onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Member Selector Bar */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>🏗️ Select Structural Member Type</span>
          </div>
          <div style={styles.memberBar}>
            {MEMBER_TYPES.map(m => (
              <button
                key={m.id}
                onClick={() => handleMemberTypeChange(m.id)}
                style={styles.memberTab(memberType === m.id)}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Compact Input Controls */}
          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Dimension Unit</label>
              <select value={unit} onChange={(e) => handleInputChange(setUnit, e.target.value as any)} style={styles.select}>
                <option value="feet">Feet (ft)</option>
                <option value="meters">Meters (m)</option>
              </select>
            </div>

            {/* Dynamic Length Input */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {memberType === 'slab' && `Length (${unit === 'feet' ? 'ft' : 'm'})`}
                {memberType === 'column' && `Column Size X (${unit === 'feet' ? 'ft' : 'm'})`}
                {memberType === 'beam' && `Beam Span / Length (${unit === 'feet' ? 'ft' : 'm'})`}
                {memberType === 'footing' && `Footing Length (${unit === 'feet' ? 'ft' : 'm'})`}
                {memberType === 'staircase' && `Flight Span / Horiz. Length (${unit === 'feet' ? 'ft' : 'm'})`}
                {memberType === 'lintel' && `Lintel Span / Length (${unit === 'feet' ? 'ft' : 'm'})`}
                {memberType === 'chajja' && `Length along Wall (${unit === 'feet' ? 'ft' : 'm'})`}
                {memberType === 'retaining_wall' && `Wall Length (${unit === 'feet' ? 'ft' : 'm'})`}
                {memberType === 'raft' && `Raft Length (${unit === 'feet' ? 'ft' : 'm'})`}
                {memberType === 'custom' && `Length (${unit === 'feet' ? 'ft' : 'm'})`}
              </label>
              <input type="number" value={length === 0 ? '' : length} placeholder={unit === 'feet' ? "e.g. 30" : "e.g. 9.1"} onChange={(e) => handleInputChange(setLength, e.target.value === '' ? 0 : Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            {/* Dynamic Width Input */}
            {memberType !== 'retaining_wall' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  {memberType === 'beam' && 'Beam Width (mm)'}
                  {memberType === 'lintel' && 'Wall / Lintel Width (mm)'}
                  {memberType === 'column' && `Column Size Y (${unit === 'feet' ? 'ft' : 'm'})`}
                  {memberType === 'footing' && `Footing Width (${unit === 'feet' ? 'ft' : 'm'})`}
                  {memberType === 'staircase' && `Staircase Width (${unit === 'feet' ? 'ft' : 'm'})`}
                  {memberType === 'chajja' && `Projection Width (${unit === 'feet' ? 'ft' : 'm'})`}
                  {memberType === 'raft' && `Raft Width (${unit === 'feet' ? 'ft' : 'm'})`}
                  {memberType === 'slab' && `Width (${unit === 'feet' ? 'ft' : 'm'})`}
                  {memberType === 'custom' && `Width (${unit === 'feet' ? 'ft' : 'm'})`}
                </label>
                <input type="number" value={width === 0 ? '' : width} placeholder={memberType === 'beam' || memberType === 'lintel' ? "e.g. 230" : (unit === 'feet' ? "e.g. 45" : "e.g. 13.7")} onChange={(e) => handleInputChange(setWidth, e.target.value === '' ? 0 : Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
              </div>
            )}

            {/* Dynamic Height Input */}
            {(memberType === 'column' || memberType === 'staircase' || memberType === 'retaining_wall' || memberType === 'custom') && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  {memberType === 'column' && `Column Height (${unit === 'feet' ? 'ft' : 'm'})`}
                  {memberType === 'staircase' && `Flight Total Height (${unit === 'feet' ? 'ft' : 'm'})`}
                  {memberType === 'retaining_wall' && `Stem Height (${unit === 'feet' ? 'ft' : 'm'})`}
                  {memberType === 'custom' && `Height (${unit === 'feet' ? 'ft' : 'm'})`}
                </label>
                <input type="number" value={height === 0 ? '' : height} placeholder={unit === 'feet' ? "e.g. 10" : "e.g. 3.0"} onChange={(e) => handleInputChange(setHeight, e.target.value === '' ? 0 : Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
              </div>
            )}

            {/* Dynamic Thickness / Depth Input */}
            {memberType !== 'column' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  {memberType === 'slab' && 'Slab Thickness (mm)'}
                  {memberType === 'beam' && 'Beam Depth (mm)'}
                  {memberType === 'footing' && 'Footing Depth (mm)'}
                  {memberType === 'staircase' && 'Waist Slab Thickness (mm)'}
                  {memberType === 'lintel' && 'Lintel Depth (mm)'}
                  {memberType === 'chajja' && 'Avg. Thickness (mm)'}
                  {memberType === 'retaining_wall' && 'Stem Thickness (mm)'}
                  {memberType === 'raft' && 'Raft Thickness (mm)'}
                  {memberType === 'custom' && 'Thickness / Depth (mm)'}
                </label>
                <input type="number" value={thickness === 0 ? '' : thickness} placeholder="e.g. 125" onChange={(e) => handleInputChange(setThickness, e.target.value === '' ? 0 : Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Member Quantity (Nos)</label>
              <input type="number" value={quantityCount} onChange={(e) => handleInputChange(setQuantityCount, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Concrete Grade</label>
              <select value={concreteGrade} onChange={(e) => handleInputChange(setConcreteGrade, e.target.value)} style={styles.select}>
                <option value="M15">M15 (1:2:4 Standard)</option>
                <option value="M20">M20 (1:1.5:3 RCC)</option>
                <option value="M25">M25 (1:1:2 High Strength)</option>
                <option value="M30">M30 (Design Mix)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Wastage %</label>
              <input type="number" value={wastage} onChange={(e) => handleInputChange(setWastage, Number(e.target.value))} style={styles.input} />
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="bm-boq-actions" style={{ marginTop: '12px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>
              <span className="bm-desktop-only">⚡ Calculate Concrete</span>
              <span className="bm-mobile-only">⚡ Calc</span>
            </button>
            <button style={styles.btnReset} onClick={handleReset}>
              <span className="bm-desktop-only">🔄 Reset</span>
              <span className="bm-mobile-only">🔄 Reset</span>
            </button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>
              <span className="bm-desktop-only">📊 Export Excel</span>
              <span className="bm-mobile-only">📊 Excel</span>
            </button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>
              <span className="bm-desktop-only">📄 Export PDF Report</span>
              <span className="bm-mobile-only">📄 PDF</span>
            </button>
          </div>
        </div>

        {!hasCalculated ? (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '2px dashed #3b82f6',
            borderRadius: '12px',
            padding: '32px 20px',
            textAlign: 'center',
            color: '#1e40af',
            fontSize: '16px',
            fontWeight: '700',
            marginTop: '16px',
            boxShadow: '0 2px 8px rgba(59,130,246,0.08)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧱</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e3a8a', marginBottom: '6px' }}>Ready for Concrete &amp; Structural Calculations</div>
            <div>Enter your structural member dimensions above and click <strong>"⚡ Calculate Concrete"</strong> to display detailed material quantities, cement bags, sand, aggregate, shuttering &amp; BOQ estimation.</div>
          </div>
        ) : (
          <>
            {/* Result Metric Cards */}
            <div style={styles.summaryGrid} className="bm-boq-summary-scroll">
              <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
                <span style={styles.metricTitle}>
                  <span className="bm-desktop-only">Concrete Volume</span>
                  <span className="bm-mobile-only">Conc Vol</span>
                </span>
                <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#93c5fd' : '#ffffff' }}>{calculations.volumeCum} CUM</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({calculations.volumeCft} CFT)</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>
                  <span className="bm-desktop-only">Cement Bags</span>
                  <span className="bm-mobile-only">Cement</span>
                </span>
                <span style={styles.metricVal}>{calculations.totalCementBags} Bags</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                <span style={styles.metricTitle}>
                  <span className="bm-desktop-only">M-Sand Quantity</span>
                  <span className="bm-mobile-only">Sand</span>
                </span>
                <span style={styles.metricVal}>{calculations.totalSandCft} CFT</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                <span style={styles.metricTitle}>
                  <span className="bm-desktop-only">Material Subtotal</span>
                  <span className="bm-mobile-only">Mat ₹</span>
                </span>
                <span style={styles.metricVal}>{formatCurrency(calculations.totalMaterialCost)}</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                <span style={styles.metricTitle}>
                  <span className="bm-desktop-only">GRAND ESTIMATED TOTAL</span>
                  <span className="bm-mobile-only">Grand ₹</span>
                </span>
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

            {/* Detailed Itemized BOQ Table */}
            <div style={styles.tableContainer} className="bm-boq-table-scroll">
              <div style={{ padding: '12px 16px', backgroundColor: '#7f1d1d', color: 'white', fontWeight: '800', fontSize: '16px' }}>
                📑 Itemized Concrete &amp; Structural BOQ (Admin Master Linked)
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th} className="bm-hide-mobile">Master Code</th>
                    <th style={styles.th} className="bm-hide-mobile">Category</th>
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
                      <td style={styles.td} className="bm-hide-mobile"><code>{it.code}</code></td>
                      <td style={styles.td} className="bm-hide-mobile">{it.category}</td>
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
                    <td style={{ padding: '12px 14px', fontSize: '18px' }}>{formatCurrency(calculations.grandTotalCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

