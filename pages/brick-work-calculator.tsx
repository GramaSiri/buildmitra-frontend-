import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";
import { downloadBuildMitraPDF } from "../utils/pdfExport";

const BLOCK_SPECS: Record<string, { label: string; lMm: number; hMm: number; wMm: number; isBrick?: boolean; isAAC?: boolean }> = {
  'Clay Brick (4.5" Wall)': { label: 'Standard Clay Brick (190 x 90 x 90 mm)', lMm: 190, hMm: 90, wMm: 90, isBrick: true },
  'Clay Brick (9" Wall)': { label: 'Standard Clay Brick (190 x 90 x 90 mm)', lMm: 190, hMm: 90, wMm: 90, isBrick: true },
  'Concrete Block (4")': { label: 'Concrete Solid Block 4" (400 x 100 x 200 mm)', lMm: 400, hMm: 200, wMm: 100 },
  'Concrete Block (6")': { label: 'Concrete Solid Block 6" (400 x 150 x 200 mm)', lMm: 400, hMm: 200, wMm: 150 },
  'Concrete Block (8")': { label: 'Concrete Solid Block 8" (400 x 200 x 200 mm)', lMm: 400, hMm: 200, wMm: 200 },
  'AAC Block (4")': { label: 'AAC Block 4" (600 x 100 x 200 mm)', lMm: 600, hMm: 200, wMm: 100, isAAC: true },
  'AAC Block (6")': { label: 'AAC Block 6" (600 x 150 x 200 mm)', lMm: 600, hMm: 200, wMm: 150, isAAC: true },
  'AAC Block (8")': { label: 'AAC Block 8" (600 x 200 x 200 mm)', lMm: 600, hMm: 200, wMm: 200, isAAC: true }
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
    backgroundColor: '#b45309',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(180,83,9,0.2)'
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
    backgroundColor: '#d97706',
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
    color: '#b45309',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    borderBottom: '2px solid #fef3c7',
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
  metricAmber: { backgroundColor: '#b45309' },
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
  th: { backgroundColor: '#b45309', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '15px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px' },

  btnPrimary: { backgroundColor: '#b45309', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
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

export interface BrickWallRow {
  id: string;
  name: string;
  length: number;
  height: number;
  thicknessIn: number;
  masonryType: string;
  nos: number;
}

export interface BrickDeductionRow {
  id: string;
  name: string;
  height: number;
  width: number;
  thicknessIn: number;
  nos: number;
}

export default function BrickWorkCalculatorPage() {
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
  const [masonryType, setMasonryType] = useState('Clay Brick (9" Wall)');
  const [mortarRatio, setMortarRatio] = useState('1:6');
  const [wastagePct, setWastagePct] = useState(5);

  // Detailed Mode Inputs
  const [wallRows, setWallRows] = useState<BrickWallRow[]>([
    { id: 'bw1', name: 'External Outer Wall (9")', length: 40, height: 10, thicknessIn: 9, masonryType: 'Clay Brick (9" Wall)', nos: 2 },
    { id: 'bw2', name: 'Internal Partition Wall (4.5")', length: 30, height: 10, thicknessIn: 4.5, masonryType: 'Clay Brick (4.5" Wall)', nos: 2 }
  ]);

  const [deductionRows, setDeductionRows] = useState<BrickDeductionRow[]>([
    { id: 'bd1', name: 'Main Door & Doors', height: 7, width: 3, thicknessIn: 9, nos: 4 },
    { id: 'bd2', name: 'Windows & Ventilators', height: 4, width: 4, thicknessIn: 9, nos: 4 }
  ]);

  const handleAddWallRow = () => {
    setWallRows(prev => [...prev, { id: `bw_${Date.now()}`, name: `Wall ${prev.length + 1}`, length: 20, height: 10, thicknessIn: 9, masonryType: 'Clay Brick (9" Wall)', nos: 1 }]);
    setIsInputModified(true);
  };

  const handleUpdateWallRow = (id: string, field: keyof BrickWallRow, value: any) => {
    setWallRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };

  const handleDeleteWallRow = (id: string) => {
    setWallRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  const handleAddDeductionRow = () => {
    setDeductionRows(prev => [...prev, { id: `bd_${Date.now()}`, name: 'Door / Window', height: 4, width: 3, thicknessIn: 9, nos: 1 }]);
    setIsInputModified(true);
  };

  const handleUpdateDeductionRow = (id: string, field: keyof BrickDeductionRow, value: any) => {
    setDeductionRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };

  const handleDeleteDeductionRow = (id: string) => {
    setDeductionRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (0 fallback)
  const clayBrickRate = getMasterRate(["MAT-BRK-01", "clay brick", "red brick"], 0);
  const concreteBlock4Rate = getMasterRate(["MAT-BLK-04", "solid block 4", "concrete block"], 0);
  const concreteBlock6Rate = getMasterRate(["MAT-BLK-06", "solid block 6", "concrete block"], 0);
  const aacBlockRate = getMasterRate(["MAT-AAC-01", "aac block", "lightweight block"], 0);

  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53"], 0);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 0);
  const labourRate = getMasterRate(["SRV-MAS-LAY", "brickwork labour", "masonry labour"], 0);

  const getMasonryRateObj = (type: string): MasterRateResult => {
    if (type.includes("Clay")) return clayBrickRate;
    if (type.includes("AAC")) return aacBlockRate;
    if (type.includes("4\"")) return concreteBlock4Rate;
    return concreteBlock6Rate;
  };

  // Calculations Engine
  const calcResults = useMemo(() => {
    if (calcMode === 'quick') {
      const spec = BLOCK_SPECS[masonryType] || BLOCK_SPECS['Clay Brick (9" Wall)'];
      const areaSqft = Math.max(0, totalArea);

      // Volume in CUM
      const thicknessFt = spec.wMm / 304.8;
      const volCum = (areaSqft * thicknessFt) / 35.3147;

      // Unit Block Volume with 10mm Mortar Joint
      const blockVolWithMortarM3 = ((spec.lMm + 10) / 1000) * ((spec.hMm + 10) / 1000) * (spec.wMm / 1000);
      const netUnits = Math.ceil(volCum / blockVolWithMortarM3);
      const grossUnits = Math.ceil(netUnits * (1 + wastagePct / 100));

      // Mortar Calculations
      const dryMortarVolCum = volCum * 0.25 * 1.25; // 25% wet mortar + 25% dry expansion
      const parts = mortarRatio.split(':').map(Number);
      const cementPart = parts[0] || 1;
      const sandPart = parts[1] || 6;

      const cementBags = Math.ceil(((dryMortarVolCum * cementPart) / (cementPart + sandPart) * 1440) / 50);
      const sandCft = Math.round(((dryMortarVolCum * sandPart) / (cementPart + sandPart)) * 35.3147);

      const masonryRateObj = getMasonryRateObj(masonryType);

      const items = [
        {
          code: masonryRateObj.itemCode || "MAT-BRK-01",
          category: "Masonry Units",
          name: `Masonry Blocks / Bricks (${spec.label})`,
          uom: "NOS",
          qty: grossUnits,
          rateObj: masonryRateObj
        },
        {
          code: cementRate.itemCode || "MAT-CEM-01",
          category: "Mortar Material",
          name: `Cement (OPC 53 Grade - ${mortarRatio} Masonry Mortar)`,
          uom: "BAG",
          qty: cementBags,
          rateObj: cementRate
        },
        {
          code: sandRate.itemCode || "MAT-MSND-01",
          category: "Mortar Material",
          name: "M-Sand (Masonry Course Sand)",
          uom: "CFT",
          qty: sandCft,
          rateObj: sandRate
        },
        {
          code: labourRate.itemCode || "SRV-MAS-LAY",
          category: "Labour Services",
          name: "Brickwork / Blockwork Construction Labour",
          uom: "CUM",
          qty: Number(volCum.toFixed(2)),
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
        grossArea: areaSqft,
        netArea: areaSqft,
        grossVolCum: Number(volCum.toFixed(2)),
        netVolCum: Number(volCum.toFixed(2)),
        grossUnits,
        cementBags,
        sandCft,
        totalMaterialCost,
        totalLabourCost,
        grandTotalCost,
        items: processedItems,
        missingItems: processedItems.filter(it => !it.isFound)
      };
    } else {
      // Detailed Mode Calculations
      let grossWallAreaSqft = 0;
      let grossVolCumTotal = 0;
      let totalUnitsGross = 0;

      wallRows.forEach(row => {
        const areaSqft = row.length * row.height * row.nos;
        const volCum = (areaSqft * (row.thicknessIn / 12)) / 35.3147;
        grossWallAreaSqft += areaSqft;
        grossVolCumTotal += volCum;

        const spec = BLOCK_SPECS[row.masonryType] || BLOCK_SPECS['Clay Brick (9" Wall)'];
        const blockVolM3 = ((spec.lMm + 10) / 1000) * ((spec.hMm + 10) / 1000) * (spec.wMm / 1000);
        const units = Math.ceil(volCum / blockVolM3);
        totalUnitsGross += Math.ceil(units * 1.05); // 5% wastage
      });

      let deductionAreaSqft = 0;
      let deductionVolCumTotal = 0;

      deductionRows.forEach(row => {
        const areaSqft = row.height * row.width * row.nos;
        const volCum = (areaSqft * (row.thicknessIn / 12)) / 35.3147;
        deductionAreaSqft += areaSqft;
        deductionVolCumTotal += volCum;
      });

      const netAreaSqft = Math.max(0, grossWallAreaSqft - deductionAreaSqft);
      const netVolCum = Math.max(0, grossVolCumTotal - deductionVolCumTotal);

      // Mortar Requirements
      const dryMortarVolCum = netVolCum * 0.25 * 1.25;
      const cementBags = Math.ceil(((dryMortarVolCum * 1) / 7 * 1440) / 50); // 1:6 ratio
      const sandCft = Math.round(((dryMortarVolCum * 6) / 7) * 35.3147);

      const activeMasonryRateObj = clayBrickRate;

      const items = [
        {
          code: activeMasonryRateObj.itemCode || "MAT-BRK-01",
          category: "Masonry Units",
          name: "Clay Bricks / Solid Concrete Blocks (Assorted Walls)",
          uom: "NOS",
          qty: totalUnitsGross,
          rateObj: activeMasonryRateObj
        },
        {
          code: cementRate.itemCode || "MAT-CEM-01",
          category: "Mortar Material",
          name: "Cement (OPC 53 Grade - Masonry Mortar)",
          uom: "BAG",
          qty: cementBags,
          rateObj: cementRate
        },
        {
          code: sandRate.itemCode || "MAT-MSND-01",
          category: "Mortar Material",
          name: "M-Sand (Fine Sand)",
          uom: "CFT",
          qty: sandCft,
          rateObj: sandRate
        },
        {
          code: labourRate.itemCode || "SRV-MAS-LAY",
          category: "Labour Services",
          name: "Brickwork / Blockwork Masonry Labour",
          uom: "CUM",
          qty: Number(netVolCum.toFixed(2)),
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
        grossArea: Math.round(grossWallAreaSqft),
        netArea: Math.round(netAreaSqft),
        grossVolCum: Number(grossVolCumTotal.toFixed(2)),
        netVolCum: Number(netVolCum.toFixed(2)),
        grossUnits: totalUnitsGross,
        cementBags,
        sandCft,
        totalMaterialCost,
        totalLabourCost,
        grandTotalCost,
        items: processedItems,
        missingItems: processedItems.filter(it => !it.isFound)
      };
    }
  }, [calcMode, totalArea, masonryType, mortarRatio, wastagePct, wallRows, deductionRows, clayBrickRate, concreteBlock4Rate, concreteBlock6Rate, aacBlockRate, cementRate, sandRate, labourRate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("brickwork_calc_export", "BRICKWORK-CALC", () => {
      const data = [
        ["BUILDMITRA BRICKWORK & MASONRY ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Calculation Mode", calcMode.toUpperCase()],
        ["Net Masonry Volume", `${calcResults.netVolCum} CUM`],
        ["Bricks / Blocks Required", `${calcResults.grossUnits} Nos`],
        ["Cement Bags Required", `${calcResults.cementBags} Bags`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calcResults.grandTotalCost)],
        [],
        ["ITEMIZED BRICKWORK BOQ"],
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
      XLSX.utils.book_append_sheet(wb, ws, "Brickwork_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Brickwork_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("brickwork_calc_export", "BRICKWORK-CALC", () => {
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
        `BuildMitra – Brickwork Estimation Report (${calcMode.toUpperCase()})`,
        [
          ["Mode:", calcMode.toUpperCase()],
          ["Gross Masonry Volume:", `${calcResults.grossVolCum} CUM`],
          ["Net Masonry Volume:", `${calcResults.netVolCum} CUM`],
          ["Bricks / Blocks Required:", `${calcResults.grossUnits} Nos`],
          ["Cement Bags Required:", `${calcResults.cementBags} Bags`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calcResults.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Brickwork_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>Brickwork Calculator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>MASONRY &amp; CIVIL ENGINE</span>
            <h1 style={styles.headerTitle}>🧱 BuildMitra – Brick Work &amp; Block Estimator</h1>
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
              backgroundColor: calcMode === 'quick' ? '#b45309' : '#ffffff',
              color: calcMode === 'quick' ? '#ffffff' : '#475569',
              border: calcMode === 'quick' ? '2px solid #b45309' : '1px solid #cbd5e1'
            }}
          >
            ⚡ Quick Brickwork Calculator
          </button>
          <button
            onClick={() => setCalcMode('detailed')}
            style={{
              ...styles.modeToggleBtn,
              backgroundColor: calcMode === 'detailed' ? '#b45309' : '#ffffff',
              color: calcMode === 'detailed' ? '#ffffff' : '#475569',
              border: calcMode === 'detailed' ? '2px solid #b45309' : '1px solid #cbd5e1'
            }}
          >
            📐 Detailed Wall &amp; Opening Calculator
          </button>
        </div>

        {calcMode === 'quick' ? (
          /* QUICK MODE INPUTS */
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <span>📐 Enter Wall Area &amp; Masonry Specifications</span>
            </div>

            <div style={styles.gridCompact}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Total Wall Area (sq.ft)</label>
                <input
                  type="number"
                  value={totalArea}
                  onChange={(e) => { setTotalArea(Number(e.target.value)); setIsInputModified(true); }}
                  style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Masonry Type</label>
                <select value={masonryType} onChange={(e) => { setMasonryType(e.target.value); setIsInputModified(true); }} style={styles.select}>
                  {Object.entries(BLOCK_SPECS).map(([key, val]) => (
                    <option key={key} value={key}>{key} - {val.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mortar Ratio</label>
                <select value={mortarRatio} onChange={(e) => { setMortarRatio(e.target.value); setIsInputModified(true); }} style={styles.select}>
                  <option value="1:4">1:4 (Rich Mortar)</option>
                  <option value="1:6">1:6 (Standard Wall)</option>
                  <option value="1:8">1:8 (Lean Wall)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Wastage %</label>
                <input type="number" value={wastagePct} onChange={(e) => { setWastagePct(Number(e.target.value)); setIsInputModified(true); }} style={styles.input} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
              <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Brickwork BOQ</button>
              <button style={styles.btnReset} onClick={() => setTotalArea(1000)}>🔄 Reset</button>
              <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
              <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
            </div>
          </div>
        ) : (
          /* DETAILED MODE INPUTS */
          <>
            {/* Section A: Individual Wall Measurements */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <span>🧱 Individual Wall Measurements</span>
                <button style={styles.btnAdd} onClick={handleAddWallRow}>+ Add Wall</button>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Wall Description</th>
                      <th style={styles.th}>Length (ft)</th>
                      <th style={styles.th}>Height (ft)</th>
                      <th style={styles.th}>Thickness (in)</th>
                      <th style={styles.th}>Masonry Type</th>
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
                            <input type="number" step="0.5" value={row.thicknessIn} onChange={(e) => handleUpdateWallRow(row.id, 'thicknessIn', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <select value={row.masonryType} onChange={(e) => handleUpdateWallRow(row.id, 'masonryType', e.target.value)} style={{ ...styles.select, height: '32px' }}>
                              {Object.entries(BLOCK_SPECS).map(([key, val]) => (
                                <option key={key} value={key}>{key}</option>
                              ))}
                            </select>
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

            {/* Section B: Opening Deductions */}
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
                      <th style={styles.th}>Thickness (in)</th>
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
                            <input type="number" step="0.5" value={row.thicknessIn} onChange={(e) => handleUpdateDeductionRow(row.id, 'thicknessIn', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
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
                <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Detailed Brickwork BOQ</button>
                <button style={styles.btnReset} onClick={() => { setWallRows([]); setDeductionRows([]); }}>🔄 Reset All</button>
                <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
                <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
              </div>
            </div>
          </>
        )}

        {/* Result Metrics */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricAmber }}>
            <span style={styles.metricTitle}>Bricks / Blocks</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#fef3c7' : '#ffffff' }}>{calcResults.grossUnits.toLocaleString()} Nos</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Net Masonry Volume</span>
            <span style={styles.metricVal}>{calcResults.netVolCum} CUM</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Cement Required</span>
            <span style={styles.metricVal}>{calcResults.cementBags} Bags</span>
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
          <div style={{ padding: '12px 16px', backgroundColor: '#b45309', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized Brickwork &amp; Masonry BOQ ({calcMode.toUpperCase()} MODE - Admin Master Linked)
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
              <tr style={{ backgroundColor: '#b45309', color: 'white', fontWeight: '800' }}>
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
