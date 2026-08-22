import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../../utils/pdfExport';
import MarketRateTrend from '../ui/MarketRateTrend';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../../utils/masterRates";

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

const DETAILED_MATERIALS = [
  'Vitrified Tiles',
  'Ceramic Tiles',
  'Porcelain Tiles',
  'Anti-Skid Tiles',
  'Parking Tiles',
  'Staircase Tiles / Step Tiles',
  'Granite',
  'Marble',
  'Kota Stone',
  'Tandur Stone',
  'Wooden Flooring',
  'Laminate Flooring',
  'Vinyl Flooring',
  'SPC Flooring',
  'Internal Wall Cladding',
  'External Wall Cladding',
  'Bathroom Wall Tiles',
  'Kitchen Dado Tiles',
  'Other / Custom Material'
];

const INSTALLATION_METHODS = [
  'Ready-Mix Tile Adhesive',
  'Cement-Sand Mortar Bed',
  'Polymer Modified Adhesive',
  'Stone Adhesive',
  'Dry-Lay / Floating System',
  'Custom'
];

const TILE_SIZES: Record<string, { label: string; sqft: number; pcsPerBox: number }> = {
  '300x300': { label: '300 × 300 mm (12" × 12")', sqft: 0.97, pcsPerBox: 10 },
  '300x450': { label: '300 × 450 mm (12" × 18")', sqft: 1.45, pcsPerBox: 8 },
  '300x600': { label: '300 × 600 mm (12" × 24")', sqft: 1.94, pcsPerBox: 6 },
  '400x400': { label: '400 × 400 mm (16" × 16")', sqft: 1.72, pcsPerBox: 6 },
  '450x450': { label: '450 × 450 mm (18" × 18")', sqft: 2.18, pcsPerBox: 5 },
  '600x600': { label: '600 × 600 mm (24" × 24")', sqft: 3.88, pcsPerBox: 4 },
  '600x900': { label: '600 × 900 mm (24" × 36")', sqft: 5.81, pcsPerBox: 3 },
  '600x1200': { label: '600 × 1200 mm (24" × 48")', sqft: 7.75, pcsPerBox: 2 },
  '800x800': { label: '800 × 800 mm (32" × 32")', sqft: 6.89, pcsPerBox: 3 },
  '800x1600': { label: '800 × 1600 mm (32" × 64")', sqft: 13.78, pcsPerBox: 2 },
  '900x900': { label: '900 × 900 mm (36" × 36")', sqft: 8.72, pcsPerBox: 2 },
  '900x1800': { label: '900 × 1800 mm (36" × 72")', sqft: 17.44, pcsPerBox: 2 },
  '1000x1000': { label: '1000 × 1000 mm (40" × 40")', sqft: 10.76, pcsPerBox: 2 },
  '1200x1200': { label: '1200 × 1200 mm (48" × 48")', sqft: 15.50, pcsPerBox: 2 },
  '1200x1800': { label: '1200 × 1800 mm (48" × 72")', sqft: 23.25, pcsPerBox: 1 },
  '1200x2400': { label: '1200 × 2400 mm (48" × 96")', sqft: 31.00, pcsPerBox: 1 },
  '1600x3200': { label: '1600 × 3200 mm (64" × 128")', sqft: 55.11, pcsPerBox: 1 },
  'Custom': { label: 'Custom Tile / Slab Size...', sqft: 1.0, pcsPerBox: 1 }
};

export interface FloorRow {
  id: string;
  name: string;
  length: number;
  width: number;
  nos: number;
  includeSkirting: boolean;
  skirtingHeightIn: number;
}

export interface BathRow {
  id: string;
  name: string;
  length: number;
  width: number;
  wallHeightFt: number;
  nos: number;
}

export interface DeductionRow {
  id: string;
  name: string;
  height: number;
  width: number;
  nos: number;
  appliesTo: 'Wall Tiles' | 'Skirting' | 'All';
}

export interface StairRow {
  id: string;
  name: string;
  stepWidthFt: number;
  treadIn: number;
  riserIn: number;
  stepsCount: number;
  landingLenFt: number;
  landingWidFt: number;
  landingsCount: number;
}

export interface CladdingRow {
  id: string;
  name: string;
  length: number;
  height: number;
  nos: number;
}

export default function FlooringCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [calcMode, setCalcMode] = useState<'quick' | 'detailed'>('quick');
  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  // Quick Mode State
  const [quickInputs, setQuickInputs] = useState({
    totalArea: 2500,
    mainMat: 'Vitrified Tiles',
    mainTileSize: '600x600',
    wastagePct: 5,
    includeSkirting: true,
    skirtingRft: 178
  });

  const handleQuickInputChange = (field: string, value: any) => {
    setQuickInputs(prev => ({ ...prev, [field]: value }));
    setIsInputModified(true);
  };

  // Detailed Mode Main State
  const [detailedMat, setDetailedMat] = useState('Vitrified Tiles');
  const [installMethod, setInstallMethod] = useState('Ready-Mix Tile Adhesive');
  const [detailedTileSize, setDetailedTileSize] = useState('600x600');
  const [detailedWastagePct, setDetailedWastagePct] = useState(5);

  // Custom Size State
  const [customTileLenIn, setCustomTileLenIn] = useState(24);
  const [customTileWidIn, setCustomTileWidIn] = useState(24);
  const [customTileThkMm, setCustomTileThkMm] = useState(8);
  const [customPcsPerBox, setCustomPcsPerBox] = useState(4);

  // Dynamic Rows
  const [floorRows, setFloorRows] = useState<FloorRow[]>([
    { id: 'f1', name: 'Living Room', length: 20, width: 15, nos: 1, includeSkirting: true, skirtingHeightIn: 4 },
    { id: 'f2', name: 'Master Bedroom', length: 15, width: 12, nos: 1, includeSkirting: true, skirtingHeightIn: 4 }
  ]);

  const [bathRows, setBathRows] = useState<BathRow[]>([
    { id: 'b1', name: 'Master Bathroom', length: 8, width: 6, wallHeightFt: 7, nos: 1 }
  ]);

  const [deductionRows, setDeductionRows] = useState<DeductionRow[]>([
    { id: 'd1', name: 'Main Door Opening', height: 7, width: 3, nos: 2, appliesTo: 'Wall Tiles' }
  ]);

  const [stairRows, setStairRows] = useState<StairRow[]>([
    { id: 'st1', name: 'Main Internal Staircase', stepWidthFt: 3.5, treadIn: 11, riserIn: 6, stepsCount: 16, landingLenFt: 7, landingWidFt: 3.5, landingsCount: 1 }
  ]);

  const [claddingRows, setCladdingRows] = useState<CladdingRow[]>([
    { id: 'c1', name: 'Elevation Wall Cladding', length: 30, height: 12, nos: 1 }
  ]);

  const [claddingDeductions, setCladdingDeductions] = useState<DeductionRow[]>([
    { id: 'cd1', name: 'Elevation Window', height: 5, width: 4, nos: 2, appliesTo: 'Wall Tiles' }
  ]);

  // Handlers for Row Mutations
  const handleAddFloorRow = () => {
    setFloorRows(prev => [...prev, { id: `f_${Date.now()}`, name: `Room ${prev.length + 1}`, length: 12, width: 10, nos: 1, includeSkirting: true, skirtingHeightIn: 4 }]);
    setIsInputModified(true);
  };
  const handleUpdateFloorRow = (id: string, field: keyof FloorRow, value: any) => {
    setFloorRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };
  const handleDeleteFloorRow = (id: string) => {
    setFloorRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  const handleAddBathRow = () => {
    setBathRows(prev => [...prev, { id: `b_${Date.now()}`, name: `Bathroom ${prev.length + 1}`, length: 7, width: 5, wallHeightFt: 7, nos: 1 }]);
    setIsInputModified(true);
  };
  const handleUpdateBathRow = (id: string, field: keyof BathRow, value: any) => {
    setBathRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };
  const handleDeleteBathRow = (id: string) => {
    setBathRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  const handleAddDeductionRow = () => {
    setDeductionRows(prev => [...prev, { id: `d_${Date.now()}`, name: 'Door / Window Opening', height: 4, width: 3, nos: 1, appliesTo: 'Wall Tiles' }]);
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

  const handleAddStairRow = () => {
    setStairRows(prev => [...prev, { id: `st_${Date.now()}`, name: `Flight ${prev.length + 1}`, stepWidthFt: 3.5, treadIn: 11, riserIn: 6, stepsCount: 10, landingLenFt: 7, landingWidFt: 3.5, landingsCount: 1 }]);
    setIsInputModified(true);
  };
  const handleUpdateStairRow = (id: string, field: keyof StairRow, value: any) => {
    setStairRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };
  const handleDeleteStairRow = (id: string) => {
    setStairRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  const handleAddCladdingRow = () => {
    setCladdingRows(prev => [...prev, { id: `c_${Date.now()}`, name: `Cladding Wall ${prev.length + 1}`, length: 20, height: 10, nos: 1 }]);
    setIsInputModified(true);
  };
  const handleUpdateCladdingRow = (id: string, field: keyof CladdingRow, value: any) => {
    setCladdingRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setIsInputModified(true);
  };
  const handleDeleteCladdingRow = (id: string) => {
    setCladdingRows(prev => prev.filter(r => r.id !== id));
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (0 fallback)
  const vitrifiedRate = getMasterRate(["MAT-VIT-01", "vitrified tiles", "vitrified"], 0);
  const ceramicRate = getMasterRate(["MAT-CER-01", "ceramic tiles", "ceramic"], 0);
  const porcelainRate = getMasterRate(["MAT-POR-01", "porcelain tiles", "porcelain"], 0);
  const antiSkidRate = getMasterRate(["MAT-PRK-01", "anti-skid tiles", "anti skid"], 0);
  const parkingRate = getMasterRate(["MAT-PRK-02", "parking tiles", "paver tiles"], 0);
  const stepTileRate = getMasterRate(["MAT-STP-01", "staircase tiles", "step tiles"], 0);

  const graniteRate = getMasterRate(["MAT-GRN-01", "granite slab", "granite"], 0);
  const marbleRate = getMasterRate(["MAT-MRB-01", "marble slab", "marble"], 0);
  const kotaRate = getMasterRate(["MAT-KOT-01", "kota stone", "kota"], 0);
  const tandurRate = getMasterRate(["MAT-TND-01", "tandur stone", "tandur"], 0);

  const woodenRate = getMasterRate(["MAT-WOD-01", "wooden flooring", "hardwood"], 0);
  const laminateRate = getMasterRate(["MAT-LAM-01", "laminate flooring", "laminate"], 0);
  const vinylRate = getMasterRate(["MAT-VNY-01", "vinyl flooring", "pvc flooring"], 0);
  const spcRate = getMasterRate(["MAT-SPC-01", "spc flooring", "rigid core"], 0);

  const claddingRate = getMasterRate(["MAT-CLD-01", "wall cladding", "elevation stone"], 0);

  const adhesiveRate = getMasterRate(["MAT-ADH-01", "tile adhesive", "adhesive"], 0);
  const stoneAdhesiveRate = getMasterRate(["MAT-ADH-02", "stone adhesive", "granite adhesive"], 0);
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53"], 0);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 0);
  const groutRate = getMasterRate(["MAT-GRT-01", "tile grout", "grout"], 0);
  const spacerRate = getMasterRate(["MAT-SPC-02", "tile spacers", "spacers"], 0);
  const underlayRate = getMasterRate(["MAT-UND-01", "underlay foam", "flooring pad"], 0);
  const trimRate = getMasterRate(["MAT-TRM-01", "floor trims", "skirting profile"], 0);

  const tileLabourRate = getMasterRate(["SRV-TIL-LAY", "tile laying labour", "tile labour"], 0);
  const stoneLabourRate = getMasterRate(["SRV-GRN-LAY", "granite laying labour", "stone labour"], 0);
  const woodenLabourRate = getMasterRate(["SRV-WOD-LAY", "wooden flooring labour", "laminate labour"], 0);
  const claddingLabourRate = getMasterRate(["SRV-CLD-LAY", "cladding labour", "elevation labour"], 0);
  const skirtingLabourRate = getMasterRate(["SRV-SKT-LAY", "skirting labour", "skirting fixing"], 0);

  const getMaterialRateObj = (type: string): MasterRateResult => {
    if (type.includes("Vitrified")) return vitrifiedRate;
    if (type.includes("Ceramic") || type.includes("Kitchen")) return ceramicRate;
    if (type.includes("Porcelain")) return porcelainRate;
    if (type.includes("Anti-Skid")) return antiSkidRate;
    if (type.includes("Parking")) return parkingRate;
    if (type.includes("Staircase")) return stepTileRate;
    if (type.includes("Granite")) return graniteRate;
    if (type.includes("Marble")) return marbleRate;
    if (type.includes("Kota")) return kotaRate;
    if (type.includes("Tandur")) return tandurRate;
    if (type.includes("Wooden")) return woodenRate;
    if (type.includes("Laminate")) return laminateRate;
    if (type.includes("Vinyl")) return vinylRate;
    if (type.includes("SPC")) return spcRate;
    if (type.includes("Cladding")) return claddingRate;
    return vitrifiedRate;
  };

  const getLabourRateObj = (type: string): MasterRateResult => {
    if (type.includes("Granite") || type.includes("Marble") || type.includes("Kota") || type.includes("Tandur")) return stoneLabourRate;
    if (type.includes("Wooden") || type.includes("Laminate") || type.includes("Vinyl") || type.includes("SPC")) return woodenLabourRate;
    if (type.includes("Cladding")) return claddingLabourRate;
    return tileLabourRate;
  };

  // Calculations Engine
  const calcResults = useMemo(() => {
    if (calcMode === 'quick') {
      const mainArea = Math.max(0, quickInputs.totalArea);
      const mainTileSpec = TILE_SIZES[quickInputs.mainTileSize] || TILE_SIZES['600x600'];

      const mainTileGrossSqft = mainArea * (1 + quickInputs.wastagePct / 100);
      const mainTileBoxes = Math.ceil(mainTileGrossSqft / (mainTileSpec.sqft * mainTileSpec.pcsPerBox));

      const mainMatObj = getMaterialRateObj(quickInputs.mainMat);
      const mainLabourObj = getLabourRateObj(quickInputs.mainMat);

      const mainMatCost = mainMatObj.found ? mainTileGrossSqft * mainMatObj.rate : 0;
      const mainLabourCost = mainLabourObj.found ? mainArea * mainLabourObj.rate : 0;

      const adhesiveBags = Math.ceil(mainTileGrossSqft / 50);
      const adhesiveCost = adhesiveRate.found ? adhesiveBags * adhesiveRate.rate : 0;

      const groutKg = Math.ceil(mainTileGrossSqft / 100);
      const groutCost = groutRate.found ? groutKg * groutRate.rate : 0;

      const skirtingCost = (quickInputs.includeSkirting && skirtingLabourRate.found) ? quickInputs.skirtingRft * skirtingLabourRate.rate : 0;

      const items = [
        {
          code: mainMatObj.itemCode || "MAT-VIT-01",
          category: "Flooring Material",
          name: `Flooring Material (${quickInputs.mainMat} - ${mainTileSpec.label})`,
          uom: "SQFT",
          engQty: Math.round(mainArea),
          procQty: Math.round(mainTileGrossSqft),
          rateObj: mainMatObj
        },
        {
          code: adhesiveRate.itemCode || "MAT-ADH-01",
          category: "Adhesive & Mortar",
          name: "Tile Polymer Adhesive (20kg Bags)",
          uom: "BAG",
          engQty: adhesiveBags,
          procQty: adhesiveBags,
          rateObj: adhesiveRate
        },
        {
          code: groutRate.itemCode || "MAT-GRT-01",
          category: "Tile Accessories",
          name: "Tile Joint Epoxy Grout",
          uom: "KG",
          engQty: groutKg,
          procQty: groutKg,
          rateObj: groutRate
        },
        {
          code: mainLabourObj.itemCode || "SRV-TIL-LAY",
          category: "Labour Services",
          name: `Flooring Installation Labour (${quickInputs.mainMat})`,
          uom: "SQFT",
          engQty: Math.round(mainArea),
          procQty: Math.round(mainArea),
          rateObj: mainLabourObj
        },
        {
          code: skirtingLabourRate.itemCode || "SRV-SKT-LAY",
          category: "Labour Services",
          name: "Skirting Cutting & Fixing Labour",
          uom: "RFT",
          engQty: quickInputs.includeSkirting ? quickInputs.skirtingRft : 0,
          procQty: quickInputs.includeSkirting ? quickInputs.skirtingRft : 0,
          rateObj: skirtingLabourRate
        }
      ];

      const totalMaterialCost = mainMatCost + adhesiveCost + groutCost;
      const totalLabourCost = mainLabourCost + skirtingCost;
      const grandTotalCost = totalMaterialCost + totalLabourCost;

      const processedItems = items.map(it => {
        const isFound = it.rateObj.found && Number(it.rateObj.rate) > 0;
        const rateVal = isFound ? Number(it.rateObj.rate) : 0;
        const amountVal = isFound ? it.procQty * rateVal : 0;
        return { ...it, isFound, rateVal, amountVal };
      });

      return {
        grossArea: Math.round(mainTileGrossSqft),
        netArea: Math.round(mainArea),
        deductionArea: 0,
        mainTileBoxes,
        skirtingRft: quickInputs.skirtingRft,
        totalMaterialCost,
        totalLabourCost,
        grandTotalCost,
        items: processedItems,
        missingItems: processedItems.filter(it => !it.isFound)
      };
    } else {
      // Detailed Mode Calculations based on selected material type
      const isStaircase = detailedMat === 'Staircase Tiles / Step Tiles';
      const isCladding = detailedMat === 'Internal Wall Cladding' || detailedMat === 'External Wall Cladding';
      const isWoodenOrFloating = ['Wooden Flooring', 'Laminate Flooring', 'Vinyl Flooring', 'SPC Flooring'].includes(detailedMat);
      const isStone = ['Granite', 'Marble', 'Kota Stone', 'Tandur Stone'].includes(detailedMat);

      let grossSqft = 0;
      let totalDeductionSqft = 0;
      let totalSkirtingRft = 0;
      let totalSkirtingSqft = 0;

      if (isStaircase) {
        stairRows.forEach(row => {
          const treadSqft = (row.stepWidthFt * (row.treadIn / 12)) * row.stepsCount;
          const riserSqft = (row.stepWidthFt * (row.riserIn / 12)) * row.stepsCount;
          const landingSqft = row.landingLenFt * row.landingWidFt * row.landingsCount;
          grossSqft += treadSqft + riserSqft + landingSqft;
        });
      } else if (isCladding) {
        claddingRows.forEach(row => {
          grossSqft += row.length * row.height * row.nos;
        });
        claddingDeductions.forEach(row => {
          totalDeductionSqft += row.height * row.width * row.nos;
        });
      } else {
        // Normal Floor / Room / Bath Tiling
        floorRows.forEach(row => {
          const area = row.length * row.width * row.nos;
          grossSqft += area;
          if (row.includeSkirting) {
            const perim = 2 * (row.length + row.width) * row.nos;
            totalSkirtingRft += perim;
            totalSkirtingSqft += perim * (row.skirtingHeightIn / 12);
          }
        });

        bathRows.forEach(row => {
          grossSqft += row.length * row.width * row.nos; // Bath floor
          grossSqft += 2 * (row.length + row.width) * row.wallHeightFt * row.nos; // Bath wall
        });

        deductionRows.forEach(row => {
          totalDeductionSqft += row.height * row.width * row.nos;
        });
      }

      const netSqft = Math.max(0, grossSqft - totalDeductionSqft + totalSkirtingSqft);
      const totalProcurementSqft = Math.round(netSqft * (1 + detailedWastagePct / 100));

      // Calculate Tile / Box specs
      let sqftPerPiece = 1.0;
      let pcsPerBox = 1;

      if (detailedTileSize === 'Custom') {
        sqftPerPiece = (customTileLenIn * customTileWidIn) / 144;
        pcsPerBox = Math.max(1, customPcsPerBox);
      } else {
        const spec = TILE_SIZES[detailedTileSize] || TILE_SIZES['600x600'];
        sqftPerPiece = spec.sqft;
        pcsPerBox = spec.pcsPerBox;
      }

      const totalPiecesReq = Math.ceil(totalProcurementSqft / sqftPerPiece);
      const totalBoxes = Math.ceil(totalPiecesReq / pcsPerBox);

      // Materials & Ancillaries Selection
      const mainMatObj = getMaterialRateObj(detailedMat);
      const mainLabourObj = getLabourRateObj(detailedMat);
      const mainMatCost = mainMatObj.found ? totalProcurementSqft * mainMatObj.rate : 0;

      const items: Array<{
        code: string;
        category: string;
        name: string;
        uom: string;
        engQty: number;
        procQty: number;
        rateObj: MasterRateResult;
      }> = [
        {
          code: mainMatObj.itemCode || "MAT-VIT-01",
          category: isCladding ? "Wall Cladding Material" : isStaircase ? "Step Tiling Material" : "Flooring Material",
          name: `${detailedMat} (${detailedTileSize === 'Custom' ? `${customTileLenIn}"x${customTileWidIn}" Custom Slab` : TILE_SIZES[detailedTileSize]?.label || detailedTileSize})`,
          uom: "SQFT",
          engQty: Math.round(netSqft),
          procQty: totalProcurementSqft,
          rateObj: mainMatObj
        }
      ];

      let totalMaterialCost = mainMatCost;
      let totalLabourCost = 0;

      // Conditional Bedding & Accessories
      if (isWoodenOrFloating) {
        const underlayBags = Math.ceil(totalProcurementSqft / 100);
        items.push({
          code: underlayRate.itemCode || "MAT-UND-01",
          category: "Floating Accessories",
          name: "Acoustic Foam Underlay Pad (2mm)",
          uom: "SQFT",
          engQty: Math.round(netSqft),
          procQty: totalProcurementSqft,
          rateObj: underlayRate
        });
        items.push({
          code: trimRate.itemCode || "MAT-TRM-01",
          category: "Profiles & Trims",
          name: "Skirting Profiles & T-Moulding Trims",
          uom: "RFT",
          engQty: Math.round(totalSkirtingRft),
          procQty: Math.round(totalSkirtingRft),
          rateObj: trimRate
        });
      } else if (installMethod === 'Cement-Sand Mortar Bed') {
        const cementBags = Math.ceil((totalProcurementSqft * 0.05 * 1.33 * 1440) / 50); // 50mm bed
        const sandCft = Math.round(totalProcurementSqft * 0.16);
        const groutKg = Math.ceil(totalProcurementSqft / 100);

        items.push({
          code: cementRate.itemCode || "MAT-CEM-01",
          category: "Mortar Bed",
          name: "Cement (OPC 53 Grade for 2\" Mortar Bed)",
          uom: "BAG",
          engQty: cementBags,
          procQty: cementBags,
          rateObj: cementRate
        });
        items.push({
          code: sandRate.itemCode || "MAT-MSND-01",
          category: "Mortar Bed",
          name: "M-Sand (Screened Bedding Sand)",
          uom: "CFT",
          engQty: sandCft,
          procQty: sandCft,
          rateObj: sandRate
        });
        items.push({
          code: groutRate.itemCode || "MAT-GRT-01",
          category: "Grout",
          name: "Tile Joint Grout",
          uom: "KG",
          engQty: groutKg,
          procQty: groutKg,
          rateObj: groutRate
        });
      } else {
        // Adhesive Systems (Ready-Mix / Polymer / Stone)
        const adhesiveBags = Math.ceil(totalProcurementSqft / 50);
        const groutKg = Math.ceil(totalProcurementSqft / 100);
        const activeAdhesiveObj = isStone ? stoneAdhesiveRate : adhesiveRate;

        items.push({
          code: activeAdhesiveObj.itemCode || "MAT-ADH-01",
          category: "Adhesive System",
          name: isStone ? "High Bond Stone Adhesive (20kg Bags)" : "Polymer Tile Adhesive (20kg Bags)",
          uom: "BAG",
          engQty: adhesiveBags,
          procQty: adhesiveBags,
          rateObj: activeAdhesiveObj
        });
        items.push({
          code: groutRate.itemCode || "MAT-GRT-01",
          category: "Grout & Accessories",
          name: "Epoxy Waterproof Joint Grout & Spacers",
          uom: "KG",
          engQty: groutKg,
          procQty: groutKg,
          rateObj: groutRate
        });
      }

      // Labour Services
      const mainLabourCost = mainLabourObj.found ? netSqft * mainLabourObj.rate : 0;
      items.push({
        code: mainLabourObj.itemCode || "SRV-TIL-LAY",
        category: "Labour Services",
        name: `${detailedMat} Installation & Laying Labour`,
        uom: "SQFT",
        engQty: Math.round(netSqft),
        procQty: Math.round(netSqft),
        rateObj: mainLabourObj
      });

      if (totalSkirtingRft > 0 && !isWoodenOrFloating) {
        items.push({
          code: skirtingLabourRate.itemCode || "SRV-SKT-LAY",
          category: "Labour Services",
          name: "Skirting Cutting & Fixing Labour",
          uom: "RFT",
          engQty: Math.round(totalSkirtingRft),
          procQty: Math.round(totalSkirtingRft),
          rateObj: skirtingLabourRate
        });
      }

      const processedItems = items.map(it => {
        const isFound = it.rateObj.found && Number(it.rateObj.rate) > 0;
        const rateVal = isFound ? Number(it.rateObj.rate) : 0;
        const amountVal = isFound ? it.procQty * rateVal : 0;

        if (it.category.includes("Labour")) {
          totalLabourCost += amountVal;
        } else {
          totalMaterialCost += amountVal;
        }

        return { ...it, isFound, rateVal, amountVal };
      });

      const grandTotalCost = totalMaterialCost + totalLabourCost;

      return {
        grossArea: Math.round(grossSqft),
        netArea: Math.round(netSqft),
        deductionArea: Math.round(totalDeductionSqft),
        mainTileBoxes: totalBoxes,
        skirtingRft: Math.round(totalSkirtingRft),
        totalMaterialCost,
        totalLabourCost,
        grandTotalCost,
        items: processedItems,
        missingItems: processedItems.filter(it => !it.isFound)
      };
    }
  }, [calcMode, quickInputs, floorRows, bathRows, deductionRows, stairRows, claddingRows, claddingDeductions, detailedMat, installMethod, detailedTileSize, detailedWastagePct, customTileLenIn, customTileWidIn, customTileThkMm, customPcsPerBox, vitrifiedRate, ceramicRate, porcelainRate, antiSkidRate, parkingRate, stepTileRate, graniteRate, marbleRate, kotaRate, tandurRate, woodenRate, laminateRate, vinylRate, spcRate, claddingRate, adhesiveRate, stoneAdhesiveRate, cementRate, sandRate, groutRate, underlayRate, trimRate, tileLabourRate, stoneLabourRate, woodenLabourRate, claddingLabourRate, skirtingLabourRate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("flooring_calc_export", "FLOORING-CALC", () => {
      const data = [
        ["BUILDMITRA TILE & FLOORING ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Calculation Mode", calcMode.toUpperCase()],
        ["Material Type", detailedMat],
        ["Net Area Required", `${calcResults.netArea} Sq.ft`],
        ["Procurement Boxes", `${calcResults.mainTileBoxes} Boxes / Packs`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calcResults.grandTotalCost)],
        [],
        ["ITEMIZED FLOORING BOQ"],
        ["Master Code", "Category", "Description", "Engineering Qty", "Procurement Qty", "UOM", "Approved Rate (₹)", "Total Amount (₹)"],
        ...calcResults.items.map(it => [
          it.code,
          it.category,
          it.name,
          it.engQty,
          it.procQty,
          it.uom,
          it.isFound ? it.rateVal : "Master Mapping Required / Approved Rate Unavailable",
          it.isFound ? it.amountVal : "—"
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tile_Flooring_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Tile_Flooring_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("flooring_calc_export", "FLOORING-CALC", () => {
      const headers = ["Master Code", "Category", "Description", "Eng Qty", "Proc Qty", "UOM", "Rate (₹)", "Amount (₹)"];
      const rows = calcResults.items.map(it => [
        it.code,
        it.category,
        it.name,
        String(it.engQty),
        String(it.procQty),
        it.uom,
        it.isFound ? formatCurrency(it.rateVal) : "Rate Pending Admin Update",
        it.isFound ? formatCurrency(it.amountVal) : "—"
      ]);

      downloadBuildMitraPDF(
        `BuildMitra – Tile & Flooring Report (${calcMode.toUpperCase()})`,
        [
          ["Mode:", calcMode.toUpperCase()],
          ["Material:", detailedMat],
          ["Gross Area:", `${calcResults.grossArea} Sq.ft`],
          ["Net Area:", `${calcResults.netArea} Sq.ft`],
          ["Deductions:", `${calcResults.deductionArea} Sq.ft`],
          ["Boxes Required:", `${calcResults.mainTileBoxes} Boxes`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calcResults.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Tile_Flooring_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.badge}>FINISHING &amp; FLOORING</span>
          <h1 style={styles.headerTitle}>📐 BuildMitra – Tile &amp; Flooring Calculator</h1>
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
          ⚡ Quick Calculator
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
          📐 Detailed Tile &amp; Flooring Calculator
        </button>
      </div>

      {calcMode === 'quick' ? (
        /* QUICK MODE INPUTS */
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>📐 Enter Total Area &amp; Material Specifications</span>
          </div>

          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Total Area (Sq.ft)</label>
              <input
                type="number"
                value={quickInputs.totalArea}
                onChange={(e) => handleQuickInputChange("totalArea", Number(e.target.value))}
                style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Flooring Material</label>
              <select
                value={quickInputs.mainMat}
                onChange={(e) => handleQuickInputChange("mainMat", e.target.value)}
                style={styles.select}
              >
                <option value="Vitrified Tiles">Vitrified Tiles (600x600 mm)</option>
                <option value="Ceramic Tiles">Ceramic Tiles</option>
                <option value="Anti-Skid Tiles">Anti-Skid Tiles</option>
                <option value="Granite Slab">Granite Slab</option>
                <option value="Marble Slab">Marble Slab</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Tile Size</label>
              <select
                value={quickInputs.mainTileSize}
                onChange={(e) => handleQuickInputChange("mainTileSize", e.target.value)}
                style={styles.select}
              >
                {Object.entries(TILE_SIZES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Wastage %</label>
              <input
                type="number"
                value={quickInputs.wastagePct}
                onChange={(e) => handleQuickInputChange("wastagePct", Number(e.target.value))}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Skirting (RFT)</label>
              <input
                type="number"
                value={quickInputs.skirtingRft}
                onChange={(e) => handleQuickInputChange("skirtingRft", Number(e.target.value))}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Flooring</button>
            <button style={styles.btnReset} onClick={() => setQuickInputs({ ...quickInputs, totalArea: 2500 })}>🔄 Reset</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
          </div>
        </div>
      ) : (
        /* DETAILED MODE ENHANCED INPUTS */
        <>
          {/* Main Specifications Card */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <span>⚙️ Detailed Material, Installation Bed &amp; Tile Size</span>
            </div>

            <div style={styles.gridCompact}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Surface / Material Category</label>
                <select value={detailedMat} onChange={(e) => { setDetailedMat(e.target.value); setIsInputModified(true); }} style={styles.select}>
                  {DETAILED_MATERIALS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Bedding / Installation Method</label>
                <select value={installMethod} onChange={(e) => { setInstallMethod(e.target.value); setIsInputModified(true); }} style={styles.select}>
                  {INSTALLATION_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Tile / Slab Size</label>
                <select value={detailedTileSize} onChange={(e) => { setDetailedTileSize(e.target.value); setIsInputModified(true); }} style={styles.select}>
                  {Object.entries(TILE_SIZES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Wastage %</label>
                <input type="number" value={detailedWastagePct} onChange={(e) => { setDetailedWastagePct(Number(e.target.value)); setIsInputModified(true); }} style={styles.input} />
              </div>
            </div>

            {/* Custom Size Dynamic Input Fields */}
            {detailedTileSize === 'Custom' && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '10px', marginTop: '12px' }}>
                <strong style={{ color: '#166534', fontSize: '14px', display: 'block', marginBottom: '8px' }}>📏 Custom Tile / Slab Dimensions</strong>
                <div style={styles.gridCompact}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Tile Length (inches)</label>
                    <input type="number" value={customTileLenIn} onChange={(e) => { setCustomTileLenIn(Number(e.target.value)); setIsInputModified(true); }} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Tile Width (inches)</label>
                    <input type="number" value={customTileWidIn} onChange={(e) => { setCustomTileWidIn(Number(e.target.value)); setIsInputModified(true); }} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Thickness (mm)</label>
                    <input type="number" value={customTileThkMm} onChange={(e) => { setCustomTileThkMm(Number(e.target.value)); setIsInputModified(true); }} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Pieces per Box / Pack</label>
                    <input type="number" value={customPcsPerBox} onChange={(e) => { setCustomPcsPerBox(Number(e.target.value)); setIsInputModified(true); }} style={styles.input} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conditional Input Section: Staircase Mode */}
          {detailedMat === 'Staircase Tiles / Step Tiles' ? (
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <span>🪜 Staircase Step &amp; Landing Measurements</span>
                <button style={styles.btnAdd} onClick={handleAddStairRow}>+ Add Stair Flight</button>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Flight Description</th>
                      <th style={styles.th}>Step Width (ft)</th>
                      <th style={styles.th}>Tread (in)</th>
                      <th style={styles.th}>Riser (in)</th>
                      <th style={styles.th}>Steps Count</th>
                      <th style={styles.th}>Landing (L × W)</th>
                      <th style={styles.th}>Total Area</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stairRows.map((row) => {
                      const treadArea = (row.stepWidthFt * (row.treadIn / 12)) * row.stepsCount;
                      const riserArea = (row.stepWidthFt * (row.riserIn / 12)) * row.stepsCount;
                      const landingArea = row.landingLenFt * row.landingWidFt * row.landingsCount;
                      const totalArea = treadArea + riserArea + landingArea;
                      return (
                        <tr key={row.id}>
                          <td style={styles.td}>
                            <input type="text" value={row.name} onChange={(e) => handleUpdateStairRow(row.id, 'name', e.target.value)} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.stepWidthFt} onChange={(e) => handleUpdateStairRow(row.id, 'stepWidthFt', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.treadIn} onChange={(e) => handleUpdateStairRow(row.id, 'treadIn', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.riserIn} onChange={(e) => handleUpdateStairRow(row.id, 'riserIn', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.stepsCount} onChange={(e) => handleUpdateStairRow(row.id, 'stepsCount', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            {row.landingLenFt}′ × {row.landingWidFt}′ ({row.landingsCount})
                          </td>
                          <td style={styles.td}><strong>{Math.round(totalArea)} Sq.ft</strong></td>
                          <td style={styles.td}>
                            <button style={styles.btnDelete} onClick={() => handleDeleteStairRow(row.id)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : detailedMat.includes('Cladding') ? (
            /* Conditional Input Section: Wall Cladding Mode */
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <span>🧱 Wall Cladding Measurements &amp; Openings</span>
                <button style={styles.btnAdd} onClick={handleAddCladdingRow}>+ Add Cladding Wall</button>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Cladding Wall Description</th>
                      <th style={styles.th}>Length (ft)</th>
                      <th style={styles.th}>Height (ft)</th>
                      <th style={styles.th}>Nos</th>
                      <th style={styles.th}>Calculated Area</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claddingRows.map((row) => {
                      const areaSqft = row.length * row.height * row.nos;
                      return (
                        <tr key={row.id}>
                          <td style={styles.td}>
                            <input type="text" value={row.name} onChange={(e) => handleUpdateCladdingRow(row.id, 'name', e.target.value)} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.length} onChange={(e) => handleUpdateCladdingRow(row.id, 'length', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.height} onChange={(e) => handleUpdateCladdingRow(row.id, 'height', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}>
                            <input type="number" value={row.nos} onChange={(e) => handleUpdateCladdingRow(row.id, 'nos', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                          </td>
                          <td style={styles.td}><strong>{areaSqft.toLocaleString()} Sq.ft</strong></td>
                          <td style={styles.td}>
                            <button style={styles.btnDelete} onClick={() => handleDeleteCladdingRow(row.id)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Standard Floor / Room / Bath Tiling Rows */
            <>
              {/* Floor / Room Rows */}
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  <span>🏠 Floor / Room Measurements</span>
                  <button style={styles.btnAdd} onClick={handleAddFloorRow}>+ Add Floor Area / Room</button>
                </div>

                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Room Description</th>
                        <th style={styles.th}>Length (ft)</th>
                        <th style={styles.th}>Width (ft)</th>
                        <th style={styles.th}>Nos</th>
                        <th style={styles.th}>Skirting</th>
                        <th style={styles.th}>Skirting Ht (in)</th>
                        <th style={styles.th}>Calculated Area</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {floorRows.map((row) => {
                        const areaSqft = row.length * row.width * row.nos;
                        return (
                          <tr key={row.id}>
                            <td style={styles.td}>
                              <input type="text" value={row.name} onChange={(e) => handleUpdateFloorRow(row.id, 'name', e.target.value)} style={{ ...styles.input, height: '32px' }} />
                            </td>
                            <td style={styles.td}>
                              <input type="number" value={row.length} onChange={(e) => handleUpdateFloorRow(row.id, 'length', Number(e.target.value))} style={{ ...styles.input, height: '32px', ...(isInputModified ? styles.inputModified : {}) }} />
                            </td>
                            <td style={styles.td}>
                              <input type="number" value={row.width} onChange={(e) => handleUpdateFloorRow(row.id, 'width', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                            </td>
                            <td style={styles.td}>
                              <input type="number" value={row.nos} onChange={(e) => handleUpdateFloorRow(row.id, 'nos', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                            </td>
                            <td style={styles.td}>
                              <input type="checkbox" checked={row.includeSkirting} onChange={(e) => handleUpdateFloorRow(row.id, 'includeSkirting', e.target.checked)} style={{ width: '18px', height: '18px' }} />
                            </td>
                            <td style={styles.td}>
                              <input type="number" value={row.skirtingHeightIn} disabled={!row.includeSkirting} onChange={(e) => handleUpdateFloorRow(row.id, 'skirtingHeightIn', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                            </td>
                            <td style={styles.td}><strong>{areaSqft.toLocaleString()} Sq.ft</strong></td>
                            <td style={styles.td}>
                              <button style={styles.btnDelete} onClick={() => handleDeleteFloorRow(row.id)}>🗑️</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bathroom Rows */}
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  <span>🚿 Bathroom / Toilet Tiling (Floor + Dado Wall)</span>
                  <button style={styles.btnAdd} onClick={handleAddBathRow}>+ Add Bathroom / Toilet</button>
                </div>

                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Bathroom Name</th>
                        <th style={styles.th}>Length (ft)</th>
                        <th style={styles.th}>Width (ft)</th>
                        <th style={styles.th}>Wall Tile Ht (ft)</th>
                        <th style={styles.th}>Nos</th>
                        <th style={styles.th}>Floor Area</th>
                        <th style={styles.th}>Wall Area</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bathRows.map((row) => {
                        const floorSqft = row.length * row.width * row.nos;
                        const wallSqft = 2 * (row.length + row.width) * row.wallHeightFt * row.nos;
                        return (
                          <tr key={row.id}>
                            <td style={styles.td}>
                              <input type="text" value={row.name} onChange={(e) => handleUpdateBathRow(row.id, 'name', e.target.value)} style={{ ...styles.input, height: '32px' }} />
                            </td>
                            <td style={styles.td}>
                              <input type="number" value={row.length} onChange={(e) => handleUpdateBathRow(row.id, 'length', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                            </td>
                            <td style={styles.td}>
                              <input type="number" value={row.width} onChange={(e) => handleUpdateBathRow(row.id, 'width', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                            </td>
                            <td style={styles.td}>
                              <input type="number" value={row.wallHeightFt} onChange={(e) => handleUpdateBathRow(row.id, 'wallHeightFt', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                            </td>
                            <td style={styles.td}>
                              <input type="number" value={row.nos} onChange={(e) => handleUpdateBathRow(row.id, 'nos', Number(e.target.value))} style={{ ...styles.input, height: '32px' }} />
                            </td>
                            <td style={styles.td}>{floorSqft.toLocaleString()} Sq.ft</td>
                            <td style={styles.td}><strong>{wallSqft.toLocaleString()} Sq.ft</strong></td>
                            <td style={styles.td}>
                              <button style={styles.btnDelete} onClick={() => handleDeleteBathRow(row.id)}>🗑️</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deductions Section */}
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  <span>🚪 Door &amp; Window Opening Deductions</span>
                  <button style={styles.btnAdd} onClick={handleAddDeductionRow}>+ Add Deduction</button>
                </div>

                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Opening Type</th>
                        <th style={styles.th}>Height (ft)</th>
                        <th style={styles.th}>Width (ft)</th>
                        <th style={styles.th}>Nos</th>
                        <th style={styles.th}>Applies To</th>
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
                            <td style={styles.td}>
                              <select value={row.appliesTo} onChange={(e) => handleUpdateDeductionRow(row.id, 'appliesTo', e.target.value as any)} style={{ ...styles.select, height: '32px' }}>
                                <option value="Wall Tiles">Wall Tiles</option>
                                <option value="Skirting">Skirting</option>
                                <option value="All">All</option>
                              </select>
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
              </div>
            </>
          )}

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Detailed Tile BOQ</button>
            <button style={styles.btnReset} onClick={() => { setFloorRows([]); setBathRows([]); setDeductionRows([]); setStairRows([]); setCladdingRows([]); }}>🔄 Reset All</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
          </div>
        </>
      )}

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
          <span style={styles.metricTitle}>Gross Surface Area</span>
          <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#93c5fd' : '#ffffff' }}>{calcResults.grossArea.toLocaleString()} Sq.ft</span>
        </div>
        <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
          <span style={styles.metricTitle}>Procurement Boxes</span>
          <span style={styles.metricVal}>{calcResults.mainTileBoxes} Boxes / Packs</span>
        </div>
        <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
          <span style={styles.metricTitle}>Skirting / Trims</span>
          <span style={styles.metricVal}>{calcResults.skirtingRft} RFT</span>
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

      {/* Missing Master Items Warning Banner */}
      {calcResults.missingItems.length > 0 && (
        <div style={styles.warnBanner}>
          ⚠️ <strong>Master Mapping Required / Approved Rate Unavailable ({calcResults.missingItems.length} Line Items)</strong>
          <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
            {calcResults.missingItems.map(it => (
              <li key={it.code}>
                <code>{it.code}</code>: {it.name} — Quantity: <strong>{it.procQty.toLocaleString()} {it.uom}</strong> (Status: <em>Master Mapping Required</em>)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Result Table */}
      <div style={styles.tableContainer}>
        <div style={{ padding: '12px 16px', backgroundColor: '#0f766e', color: 'white', fontWeight: '800', fontSize: '16px' }}>
          📑 Itemized Tile &amp; Flooring BOQ ({calcMode.toUpperCase()} MODE - Admin Master Linked)
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Master Code</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Item Description</th>
              <th style={styles.th}>Engineering Qty</th>
              <th style={styles.th}>Procurement Qty</th>
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
                <td style={styles.td}>{it.engQty.toLocaleString()}</td>
                <td style={styles.td}>{it.procQty.toLocaleString()}</td>
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
              <td colSpan={7} style={{ padding: '12px 14px', fontSize: '16px' }}>GRAND TOTAL ESTIMATED COST</td>
              <td style={{ padding: '12px 14px', fontSize: '18px' }}>{formatCurrency(calcResults.grandTotalCost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
