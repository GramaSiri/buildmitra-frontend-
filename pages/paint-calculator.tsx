import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";
import { downloadBuildMitraPDF } from "../utils/pdfExport";

const COVERAGES: Record<string, { covPerLtr: number; puttyPerSqft: number; primerPerSqft: number }> = {
  'Royale / Luxury Silk Emulsion': { covPerLtr: 55, puttyPerSqft: 0.1, primerPerSqft: 0.0083 },
  'Premium Interior Emulsion': { covPerLtr: 60, puttyPerSqft: 0.1, primerPerSqft: 0.0083 },
  'Tractor / Standard Emulsion': { covPerLtr: 65, puttyPerSqft: 0.1, primerPerSqft: 0.0083 },
  'Apex / Exterior Weatherproof Paint': { covPerLtr: 50, puttyPerSqft: 0.08, primerPerSqft: 0.0083 },
  'Royale Play / Metallic Texture Paint': { covPerLtr: 25, puttyPerSqft: 0.12, primerPerSqft: 0.01 },
  'Exterior Texture Paint': { covPerLtr: 20, puttyPerSqft: 0.12, primerPerSqft: 0.01 },
  'Enamel Paint (Wood & Metal)': { covPerLtr: 80, puttyPerSqft: 0, primerPerSqft: 0.01 },
  'Ceiling White Emulsion': { covPerLtr: 70, puttyPerSqft: 0.08, primerPerSqft: 0.0083 }
};

const PAINT_SYSTEMS = [
  'Royale / Luxury Silk Emulsion',
  'Premium Interior Emulsion',
  'Tractor / Standard Emulsion',
  'Apex / Exterior Weatherproof Paint',
  'Royale Play / Metallic Texture Paint',
  'Exterior Texture Paint',
  'Enamel Paint (Wood & Metal)',
  'Ceiling White Emulsion'
];

const WORK_TYPES = [
  '2 Coats + Putty + Primer (Fresh)',
  '2 Coats + Primer (Repaint)',
  '2 Coats Paint Only (Touch-up)',
  '1 Coat Texture + Base Primer',
  '3 Coats Luxury Finish'
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
    fontSize: '14px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '2px'
  },
  input: {
    width: '100%',
    height: '38px',
    padding: '6px 10px',
    fontSize: '14px',
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
    padding: '6px 10px',
    fontSize: '13px',
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
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { backgroundColor: '#9333ea', color: 'white', padding: '10px 12px', textAlign: 'left', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap' },
  td: { padding: '8px 12px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '14px' },

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
  paintSystem: string;
  workType: string;
  length: number;
  height: number;
  nos: number;
}

export interface RoomRow {
  id: string;
  name: string;
  wallPaintSystem: string;
  ceilingPaintSystem: string;
  workType: string;
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

  const [calcMode, setCalcMode] = useState<'quick' | 'detailed'>('detailed');
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  // Quick Mode Inputs
  const [totalArea, setTotalArea] = useState(0);
  const [finishType, setFinishType] = useState('Fresh Coat');
  const [paintType, setPaintType] = useState('Premium Emulsion');
  const [primerCoats, setPrimerCoats] = useState(1);
  const [paintCoats, setPaintCoats] = useState(2);

  // Dynamic Rows with In-Table Paint System Selection
  const [wallRows, setWallRows] = useState<WallRow[]>([]);

  const [roomRows, setRoomRows] = useState<RoomRow[]>([
    { id: 'r1', name: 'Living Room & Dining', wallPaintSystem: 'Royale / Luxury Silk Emulsion', ceilingPaintSystem: 'Ceiling White Emulsion', workType: '2 Coats + Putty + Primer (Fresh)', length: 0, width: 0, height: 0, nos: 1, includeCeiling: true }
  ]);

  const [deductionRows, setDeductionRows] = useState<DeductionRow[]>([]);

  // Handlers for Row Mutations
  const handleAddWallRow = () => {
    setWallRows(prev => [...prev, { id: `w_${Date.now()}`, name: `Wall ${prev.length + 1}`, paintSystem: 'Premium Interior Emulsion', workType: '2 Coats + Putty + Primer (Fresh)', length: 15, height: 10, nos: 1 }]);
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
    setRoomRows(prev => [...prev, { id: `r_${Date.now()}`, name: `Room ${prev.length + 1}`, wallPaintSystem: 'Premium Interior Emulsion', ceilingPaintSystem: 'Ceiling White Emulsion', workType: '2 Coats + Putty + Primer (Fresh)', length: 12, width: 10, height: 10, nos: 1, includeCeiling: true }]);
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
    setDeductionRows(prev => [...prev, { id: `d_${Date.now()}`, name: 'Door / Window Opening', height: 4, width: 3, nos: 1 }]);
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
  const textureRate = getMasterRate(["MAT-PNT-TXT", "texture paint", "royale play"], 0);
  const enamelRate = getMasterRate(["MAT-PNT-ENM", "enamel paint", "synthetic enamel"], 0);
  const ceilingRate = getMasterRate(["MAT-PNT-CEL", "ceiling paint", "distemper"], 0);

  const labourRate = getMasterRate(["SRV-PNT-LAY", "painting labour", "paint labour"], 0);
  const textureLabourRate = getMasterRate(["SRV-TXT-LAY", "texture labour", "designer paint labour"], 0);

  const getPaintRateObj = (sys: string): MasterRateResult => {
    if (sys.includes("Royale") || sys.includes("Luxury") || sys.includes("Silk")) return royalRate;
    if (sys.includes("Exterior") || sys.includes("Apex") || sys.includes("Weatherproof")) return exteriorRate;
    if (sys.includes("Texture") || sys.includes("Play")) return textureRate;
    if (sys.includes("Enamel")) return enamelRate;
    if (sys.includes("Ceiling")) return ceilingRate;
    return emulsionRate;
  };

  // Multi-Material & Multi-System Calculations Engine
  const calcResults = useMemo(() => {
    if (calcMode === 'quick') {
      const isFresh = finishType === 'Fresh Coat';
      const puttyKg = isFresh ? Math.ceil(totalArea / 10) : 0;
      const primerLtr = Math.ceil(totalArea / 120);

      const covInfo = COVERAGES[paintType] || COVERAGES['Premium Interior Emulsion'];
      const paintLtr = Math.ceil(totalArea / covInfo.covPerLtr);

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
          category: "Finish Paint System",
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
      // Detailed Mode Calculations: Group by Paint System
      interface SystemGroup {
        system: string;
        sqft: number;
        needsPutty: boolean;
        needsPrimer: boolean;
      }

      const sysMap: Record<string, SystemGroup> = {};
      let grossAreaTotal = 0;
      let totalDeductionSqft = 0;

      // 1. Process Wall Rows
      wallRows.forEach(row => {
        const area = row.length * row.height * row.nos;
        grossAreaTotal += area;

        const key = row.paintSystem;
        if (!sysMap[key]) {
          sysMap[key] = {
            system: row.paintSystem,
            sqft: 0,
            needsPutty: row.workType.includes("Putty"),
            needsPrimer: row.workType.includes("Primer")
          };
        }
        sysMap[key].sqft += area;
        if (row.workType.includes("Putty")) sysMap[key].needsPutty = true;
        if (row.workType.includes("Primer")) sysMap[key].needsPrimer = true;
      });

      // 2. Process Room Rows (Walls + Ceilings)
      roomRows.forEach(row => {
        const wallArea = 2 * (row.length + row.width) * row.height * row.nos;
        const ceilingArea = row.includeCeiling ? (row.length * row.width * row.nos) : 0;
        grossAreaTotal += wallArea + ceilingArea;

        // Walls
        const wKey = row.wallPaintSystem;
        if (!sysMap[wKey]) {
          sysMap[wKey] = {
            system: row.wallPaintSystem,
            sqft: 0,
            needsPutty: row.workType.includes("Putty"),
            needsPrimer: row.workType.includes("Primer")
          };
        }
        sysMap[wKey].sqft += wallArea;
        if (row.workType.includes("Putty")) sysMap[wKey].needsPutty = true;
        if (row.workType.includes("Primer")) sysMap[wKey].needsPrimer = true;

        // Ceilings
        if (ceilingArea > 0) {
          const cKey = row.ceilingPaintSystem;
          if (!sysMap[cKey]) {
            sysMap[cKey] = {
              system: row.ceilingPaintSystem,
              sqft: 0,
              needsPutty: false,
              needsPrimer: true
            };
          }
          sysMap[cKey].sqft += ceilingArea;
        }
      });

      // 3. Process Deductions
      deductionRows.forEach(row => {
        totalDeductionSqft += row.height * row.width * row.nos;
      });

      const netPaintArea = Math.max(0, grossAreaTotal - totalDeductionSqft);

      let totalPuttyKgAll = 0;
      let totalPrimerLtrAll = 0;
      let totalPaintLtrAll = 0;
      let totalTextureSqft = 0;

      const items: Array<{
        code: string;
        category: string;
        name: string;
        uom: string;
        qty: number;
        rateObj: MasterRateResult;
      }> = [];

      // Generate Consolidated Topcoat Paint Line Items per System
      Object.values(sysMap).forEach(grp => {
        const info = COVERAGES[grp.system] || COVERAGES['Premium Interior Emulsion'];
        const ltrReq = Math.ceil(grp.sqft / info.covPerLtr);
        totalPaintLtrAll += ltrReq;

        if (grp.system.includes("Texture") || grp.system.includes("Play")) {
          totalTextureSqft += grp.sqft;
        }

        if (grp.needsPutty) {
          totalPuttyKgAll += Math.ceil(grp.sqft * info.puttyPerSqft);
        }
        if (grp.needsPrimer) {
          totalPrimerLtrAll += Math.ceil(grp.sqft * info.primerPerSqft);
        }

        const rateObj = getPaintRateObj(grp.system);

        items.push({
          code: rateObj.itemCode || "MAT-PNT-01",
          category: grp.system.includes("Ceiling") ? "Ceiling Finish Paint" : grp.system.includes("Texture") ? "Texture & Accent Paint" : "Finish Paint System",
          name: `${grp.system} — Consolidated Total (${grp.sqft.toLocaleString()} Sq.ft)`,
          uom: "LTR",
          qty: ltrReq,
          rateObj
        });
      });

      // Base Preparation & Undercoat Items
      if (totalPuttyKgAll > 0) {
        items.push({
          code: puttyRate.itemCode || "MAT-PUT-01",
          category: "Base Preparation",
          name: `Wall Putty (Acrylic Water Resistant - Consolidated ${totalPuttyKgAll} KG)`,
          uom: "KG",
          qty: totalPuttyKgAll,
          rateObj: puttyRate
        });
      }

      if (totalPrimerLtrAll > 0) {
        items.push({
          code: primerRate.itemCode || "MAT-PRM-01",
          category: "Undercoat Material",
          name: `Wall & Ceiling Primer (Consolidated ${totalPrimerLtrAll} LTR)`,
          uom: "LTR",
          qty: totalPrimerLtrAll,
          rateObj: primerRate
        });
      }

      // Labour Services (Regular + Texture Labour)
      const regularPaintSqft = Math.max(0, Math.round(netPaintArea) - totalTextureSqft);
      if (regularPaintSqft > 0) {
        items.push({
          code: labourRate.itemCode || "SRV-PNT-LAY",
          category: "Labour Services",
          name: "Standard Wall & Ceiling Painting Labour (Preparation, Putty & 2 Coats)",
          uom: "SQFT",
          qty: regularPaintSqft,
          rateObj: labourRate
        });
      }

      if (totalTextureSqft > 0) {
        items.push({
          code: textureLabourRate.itemCode || "SRV-TXT-LAY",
          category: "Labour Services",
          name: "Specialized Texture & Designer Feature Wall Labour",
          uom: "SQFT",
          qty: Math.round(totalTextureSqft),
          rateObj: textureLabourRate
        });
      }

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
        grossArea: Math.round(grossAreaTotal),
        netArea: Math.round(netPaintArea),
        deductionArea: Math.round(totalDeductionSqft),
        puttyKg: totalPuttyKgAll,
        primerLtr: totalPrimerLtrAll,
        paintLtr: totalPaintLtrAll,
        totalMaterialCost,
        totalLabourCost,
        grandTotalCost,
        items: processedItems,
        missingItems: processedItems.filter(it => !it.isFound)
      };
    }
  }, [calcMode, totalArea, finishType, paintType, wallRows, roomRows, deductionRows, puttyRate, primerRate, emulsionRate, royalRate, exteriorRate, textureRate, enamelRate, ceilingRate, labourRate, textureLabourRate]);

  const handleCalculate = () => {
    setHasCalculated(true);
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleReset = () => {
    setRoomRows([{ id: 'r1', name: 'Living Room & Dining', wallPaintSystem: 'Royale / Luxury Silk Emulsion', ceilingPaintSystem: 'Ceiling White Emulsion', workType: '2 Coats + Putty + Primer (Fresh)', length: 0, width: 0, height: 0, nos: 1, includeCeiling: true }]);
    setWallRows([]);
    setDeductionRows([]);
    setTotalArea(0);
    setHasCalculated(false);
    setIsInputModified(false);
  };

  const handleExportExcel = () => {
    checkAndRun("paint_calc_export", "PAINT-CALC", () => {
      const data = [
        ["BUILDMITRA MULTI-SYSTEM PAINT ESTIMATION REPORT"],
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
        <title>Paint &amp; Coating Estimator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header} className="bm-boq-top-header">
          <div>
            <span style={styles.badge}>FINISHING &amp; COATINGS</span>
            <h1 style={styles.headerTitle}>🎨 BuildMitra – Paint &amp; Coating Estimator</h1>
          </div>
          <button style={styles.backBtn} className="bm-top-back-btn" onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
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
            📐 Detailed Multi-System Paint Calculator
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
                  {PAINT_SYSTEMS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
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

            <div className="bm-boq-actions" style={{ marginTop: '12px' }}>
              <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Paint BOQ</button>
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
                <span>🧱 Individual Wall &amp; Feature Accent Measurements (In-Table Paint Selection)</span>
                <button style={styles.btnAdd} onClick={handleAddWallRow}>+ Add Wall / Feature Area</button>
              </div>

              <div style={styles.tableContainer} className="bm-boq-table-scroll">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Wall Description</th>
                      <th style={styles.th}>Paint System / Category</th>
                      <th style={styles.th}>Coats &amp; Work Type</th>
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
                            <select value={row.paintSystem} onChange={(e) => handleUpdateWallRow(row.id, 'paintSystem', e.target.value)} style={{ ...styles.select, height: '32px' }}>
                              {PAINT_SYSTEMS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td style={styles.td}>
                            <select value={row.workType} onChange={(e) => handleUpdateWallRow(row.id, 'workType', e.target.value)} style={{ ...styles.select, height: '32px' }}>
                              {WORK_TYPES.map(w => (
                                <option key={w} value={w}>{w}</option>
                              ))}
                            </select>
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
                <span>🏠 Room Measurements (In-Table Wall &amp; Ceiling Paint Selection)</span>
                <button style={styles.btnAdd} onClick={handleAddRoomRow}>+ Add Room</button>
              </div>

              <div style={styles.tableContainer} className="bm-boq-table-scroll">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Room Name</th>
                      <th style={styles.th}>Wall Paint System</th>
                      <th style={styles.th}>Ceiling Paint System</th>
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
                            <select value={row.wallPaintSystem} onChange={(e) => handleUpdateRoomRow(row.id, 'wallPaintSystem', e.target.value)} style={{ ...styles.select, height: '32px' }}>
                              {PAINT_SYSTEMS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td style={styles.td}>
                            <select value={row.ceilingPaintSystem} onChange={(e) => handleUpdateRoomRow(row.id, 'ceilingPaintSystem', e.target.value)} style={{ ...styles.select, height: '32px' }}>
                              {PAINT_SYSTEMS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
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

              <div style={styles.tableContainer} className="bm-boq-table-scroll">
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

              <div className="bm-boq-actions" style={{ marginTop: '12px' }}>
                <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Detailed Paint BOQ</button>
                <button style={styles.btnReset} onClick={handleReset}>🔄 Reset All</button>
                <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
                <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
              </div>
            </div>
          </>
        )}

        {!hasCalculated ? (
          <div style={{
            backgroundColor: '#faf5ff',
            border: '2px dashed #9333ea',
            borderRadius: '12px',
            padding: '32px 20px',
            textAlign: 'center',
            color: '#6b21a8',
            fontSize: '16px',
            fontWeight: '700',
            marginTop: '16px',
            boxShadow: '0 2px 8px rgba(147,51,234,0.08)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎨</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#581c87', marginBottom: '6px' }}>Ready for Paint &amp; Coating Calculations</div>
            <div>Enter room dimensions and select paint systems above, then click <strong>"⚡ Calculate Paint BOQ"</strong> to view topcoat liters, wall putty, primer &amp; BOQ estimation.</div>
          </div>
        ) : (
          <>
            {/* Result Metrics */}
            <div style={styles.summaryGrid} className="bm-boq-summary-scroll">
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
            <div style={styles.tableContainer} className="bm-boq-table-scroll">
              <div style={{ padding: '12px 16px', backgroundColor: '#9333ea', color: 'white', fontWeight: '800', fontSize: '16px' }}>
                📑 Itemized Paint BOQ ({calcMode.toUpperCase()} MODE - Admin Master Linked)
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
                  {calcResults.items.map((it, idx) => (
                    <tr key={it.code + '_' + idx}>
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
                  <tr style={{ backgroundColor: '#9333ea', color: 'white', fontWeight: '800' }}>
                    <td colSpan={6} style={{ padding: '12px 14px', fontSize: '16px' }}>GRAND TOTAL ESTIMATED COST</td>
                    <td style={{ padding: '12px 14px', fontSize: '18px' }}>{formatCurrency(calcResults.grandTotalCost)}</td>
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
