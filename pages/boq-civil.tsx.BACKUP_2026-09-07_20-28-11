import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../utils/pdfExport';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from '../utils/masterRates';
import MarketRateTrend from '../components/ui/MarketRateTrend';

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
    backgroundColor: '#800020',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(128,0,32,0.2)'
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
    backgroundColor: '#a51d36',
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
    color: '#800020',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
    marginBottom: '16px'
  },
  metricCard: {
    padding: '12px 10px',
    borderRadius: '10px',
    color: 'white',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
  },
  metricMaroon: { backgroundColor: '#800020' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricBlue: { backgroundColor: '#2563eb' },
  metricPurple: { backgroundColor: '#7c3aed' },
  metricCyan: { backgroundColor: '#0891b2' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '700', letterSpacing: '0.5px' },
  metricVal: { fontSize: '16px', fontWeight: '800', marginTop: '4px' },
  metricValGrand: { fontSize: '18px', fontWeight: '900', marginTop: '4px' },

  tableContainer: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    marginBottom: '16px'
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '15px' },
  th: { backgroundColor: '#800020', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '15px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px' },

  btnPrimary: { backgroundColor: '#800020', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ALL_BOQ_ITEMS_DEF = [
  { id: "MAT-CEM-01", code: "MAT-CEM-01", name: "Cement (OPC 53 Grade)" },
  { id: "MAT-STL-01", code: "MAT-STL-01", name: "Steel (TMT Fe 500D / 550D Rebar)" },
  { id: "MAT-MSND-01", code: "MAT-MSND-01", name: "M-Sand (Fine Aggregate)" },
  { id: "MAT-AGG-01", code: "MAT-AGG-01", name: "Aggregates CA-1 & CA-2 (20mm & 12mm)" },
  { id: "CIV-CLR-01", code: "CIV-CLR-01", name: "Site Clearing, Marking & Leveling" },
  { id: "CIV-FND-01", code: "CIV-FND-01", name: "Foundation + Damp Proof Course (DPC)" },
  { id: "CIV-RCC-01", code: "CIV-RCC-01", name: "All RCC Concrete Works (Footings, Beams, Columns, Slabs)" },
  { id: "CIV-MAS-01", code: "CIV-MAS-01", name: "Masonry Walls (Bricks/Blocks/AAC)" },
  { id: "CIV-PLS-01", code: "CIV-PLS-01", name: "All Plastering (Internal + External)" },
  { id: "CIV-FLR-01", code: "CIV-FLR-01", name: "Flooring + Kitchen Platform" },
  { id: "CIV-WND-01", code: "CIV-WND-01", name: "Windows & Doors (UPVC/Teak)" },
  { id: "CIV-GRL-01", code: "CIV-GRL-01", name: "Grills & Railings (MS/SS)" },
  { id: "CIV-PNT-01", code: "CIV-PNT-01", name: "Painting Works (Interior + Exterior)" },
  { id: "CIV-FCL-01", code: "CIV-FCL-01", name: "False Ceiling Works" },
  { id: "CIV-ELE-01", code: "CIV-ELE-01", name: "Electrical + External Lighting + MCBs" },
  { id: "CIV-PLB-01", code: "CIV-PLB-01", name: "Plumbing Works (CP fittings + Piping)" },
  { id: "CIV-WTP-01", code: "CIV-WTP-01", name: "Waterproofing Works" },
  { id: "CIV-SMP-01", code: "CIV-SMP-01", name: "Underground Sump (Concrete RCC)" },
  { id: "CIV-OHT-01", code: "CIV-OHT-01", name: "Overhead Tank" },
  { id: "CIV-CCTV-01", code: "CIV-CCTV-01", name: "CCTV Installation" },
  { id: "CIV-CWD-01", code: "CIV-CWD-01", name: "Compound Wall + Gate + Paving" },
  { id: "CIV-TRC-01", code: "CIV-TRC-01", name: "Terrace Canopy / Party Hall" },
  { id: "CIV-INT-01", code: "CIV-INT-01", name: "All Interiors (Cabinets, Kitchen)" }
];

export default function CivilBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(3);
  const [wallType, setWallType] = useState('Concrete Blocks');
  const [packageTier, setPackageTier] = useState<'Standard' | 'Premium' | 'Ultra Premium'>('Standard');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(ALL_BOQ_ITEMS_DEF.map(it => it.id));
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [itemSearch, setItemSearch] = useState<string>('');

  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  const handleInputChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setIsInputModified(true);
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    setIsInputModified(true);
  };

  const selectAllItems = () => {
    setSelectedItemIds(ALL_BOQ_ITEMS_DEF.map(it => it.id));
    setIsInputModified(true);
  };

  const deselectAllItems = () => {
    setSelectedItemIds([]);
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (with benchmark fallbacks from uploaded CSV)
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53"], 410);
  const steelRate = getMasterRate(["MAT-STL-01", "tmt steel", "steel rebar"], 67);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 48);
  const aggRate = getMasterRate(["MAT-AGG-01", "MAT-AGG-12", "MAT-AGG-20", "aggregates ca-1 & ca-2"], 42);
  const clearRate = getMasterRate(["CIV-CLR-01", "site clearing"], 20);
  const fndRate = getMasterRate(["CIV-FND-01", "CIV-FND-CON", "foundation + damp proof course"], 45);
  const rccRate = getMasterRate(["CIV-RCC-01", "all rcc concrete works"], 4850);
  const masonryRate = getMasterRate(["CIV-MAS-01", "MAT-BLK-01", "masonry walls"], wallType === "Clay Bricks" ? 9 : (wallType === "AAC Blocks" ? 65 : 42));
  const plasterRate = getMasterRate(["CIV-PLS-01", "MAT-PLS-01", "all plastering"], 48);
  const flooringRate = getMasterRate(["CIV-FLR-01", "MAT-GRN-01", "flooring + kitchen platform"], 85);
  const doorsWinRate = getMasterRate(["CIV-WND-01", "windows & doors"], 680);
  const grillsRate = getMasterRate(["CIV-GRL-01", "grills & railings"], 120);
  const paintRate = getMasterRate(["CIV-PNT-01", "MAT-PNT-01", "painting works"], 35);
  const ceilingRate = getMasterRate(["CIV-FCL-01", "false ceiling works"], 65);
  const elecRate = getMasterRate(["CIV-ELE-01", "electrical works"], 135);
  const plbRate = getMasterRate(["CIV-PLB-01", "plumbing works"], 105);
  const wtpRate = getMasterRate(["CIV-WTP-01", "waterproofing works"], 42);
  const sumpRate = getMasterRate(["CIV-SMP-01", "underground sump"], 9.5);
  const ohtRate = getMasterRate(["CIV-OHT-01", "overhead tank"], 6.5);
  const cctvRate = getMasterRate(["CIV-CCTV-01", "cctv installation"], 3500);
  const compoundRate = getMasterRate(["CIV-CWD-01", "compound wall + gate"], 160);
  const canopyRate = getMasterRate(["CIV-TRC-01", "terrace canopy"], 480);
  const interiorRate = getMasterRate(["CIV-INT-01", "all interiors"], 950);

  const calculations = useMemo(() => {
    const plotArea = plotLength * plotWidth;
    const footprintArea = plotArea * 0.9; // 10% setback
    const totalBUA = Math.round(footprintArea * floors);

    // Package Multipliers (Standard = 1.0 -> ₹1,800/sqft, Premium = 1.25 -> +25%, Ultra Premium = 1.50 -> +50%)
    const packageMultiplier = packageTier === 'Ultra Premium' ? 1.50 : (packageTier === 'Premium' ? 1.25 : 1.0);

    const isRccSelected = selectedItemIds.includes("CIV-RCC-01");

    // IS Standard Empirical QS Quantities based on BUA & Structure Specification
    // Deduplication rule: If RCC Concrete Works (RMC/structural concrete) is included:
    // 1. Aggregates CA-1 & CA-2 = 0 CFT (coarse aggregate is 100% inside RCC Concrete)
    // 2. Cement = 0.16 bags / sqft BUA (covers non-RCC mortar: Masonry, Plastering, Tiles, Waterproofing)
    // 3. M-Sand = 0.60 CFT / sqft BUA (covers non-RCC mortar: Masonry, Plastering, Tiles bedding)
    // If RCC Concrete Works is NOT selected:
    // Raw materials revert to full quantities (Cement: 0.42 bags/sqft, M-Sand: 1.35 CFT/sqft, Aggregates: 1.35 CFT/sqft).
    const cementBags = isRccSelected ? Math.ceil(totalBUA * 0.16) : Math.ceil(totalBUA * 0.42);
    const steelKg = Math.round(totalBUA * 3.8);
    const sandCft = isRccSelected ? Math.round(totalBUA * 0.60) : Math.round(totalBUA * 1.35);
    const aggCft = isRccSelected ? 0 : Math.round(totalBUA * 1.35);
    const clearSqft = Math.round(plotArea);
    const fndSqft = Math.round(footprintArea);
    const rccCum = Math.round((totalBUA * 0.15) / 3.28084);
    
    let masonryQty = Math.ceil(totalBUA * 1.2);
    let masonryUom = "NOS";
    if (wallType === "Clay Bricks") {
      masonryQty = Math.ceil(totalBUA * 18);
    } else if (wallType === "AAC Blocks") {
      masonryQty = Math.ceil(totalBUA * 0.8);
    }

    const plasterSqft = Math.round(totalBUA * 2.8);
    const flooringSqft = Math.round(totalBUA * 0.85);
    const doorsWinSqft = Math.round(totalBUA * 0.13);
    const grillsSqft = Math.round(totalBUA * 0.08);
    const paintSqft = Math.round(totalBUA * 3.2);
    const ceilingSqft = Math.round(totalBUA * 0.45);
    const elecSqft = totalBUA;
    const plbsqft = totalBUA;
    const wtpSqft = Math.round(totalBUA * 0.25);
    const sumpLtr = Math.max(5000, Math.round(totalBUA * 5));
    const ohtLtr = Math.max(1000, floors * 1000);
    const cctvQty = Math.max(4, Math.ceil(totalBUA / 500));
    const compoundSqft = Math.round((plotLength + plotWidth) * 2 * 6);
    const canopySqft = Math.round(footprintArea * 0.20);
    const interiorSqft = Math.round(totalBUA * 0.30);

    const allItems = [
      { id: "MAT-CEM-01", code: cementRate.itemCode || "MAT-CEM-01", category: "Substructure & Superstructure", name: "Cement (OPC 53 Grade - Non-RCC / Mortar)", uom: "BAG", qty: cementBags, rateObj: cementRate },
      { id: "MAT-STL-01", code: steelRate.itemCode || "MAT-STL-01", category: "Reinforcement Steel", name: "Steel (TMT Fe 500D / 550D Rebar)", uom: "KG", qty: steelKg, rateObj: steelRate },
      { id: "MAT-MSND-01", code: sandRate.itemCode || "MAT-MSND-01", category: "Aggregates & Mortar", name: "M-Sand (Manufactured Fine Aggregate)", uom: "CFT", qty: sandCft, rateObj: sandRate },
      { id: "MAT-AGG-01", code: aggRate.itemCode || "MAT-AGG-01", category: "Aggregates & Mortar", name: "Aggregates CA-1 & CA-2 (20mm & 12mm Coarse Jelly)", uom: "CFT", qty: aggCft, rateObj: aggRate },
      { id: "CIV-CLR-01", code: clearRate.itemCode || "CIV-CLR-01", category: "Earthwork & Site Prep", name: "Site Clearing, Marking & Leveling", uom: "SQFT", qty: clearSqft, rateObj: clearRate },
      { id: "CIV-FND-01", code: fndRate.itemCode || "CIV-FND-01", category: "Substructure & Foundation", name: "Foundation + Damp Proof Course (DPC 50mm)", uom: "SQFT", qty: fndSqft, rateObj: fndRate },
      { id: "CIV-RCC-01", code: rccRate.itemCode || "CIV-RCC-01", category: "Superstructure Concrete", name: "All RCC Concrete Works (Footings, Beams, Columns, Slabs)", uom: "CUM", qty: rccCum, rateObj: rccRate },
      { id: "CIV-MAS-01", code: masonryRate.itemCode || "CIV-MAS-01", category: "Masonry Construction", name: `Masonry Walls (${wallType} + Interlock Masonry)`, uom: masonryUom, qty: masonryQty, rateObj: masonryRate },
      { id: "CIV-PLS-01", code: plasterRate.itemCode || "CIV-PLS-01", category: "Wall & Ceiling Finishes", name: "All Plastering (Internal Smooth + External Sponge)", uom: "SQFT", qty: plasterSqft, rateObj: plasterRate },
      { id: "CIV-FLR-01", code: flooringRate.itemCode || "CIV-FLR-01", category: "Flooring & Surfaces", name: "Flooring + Kitchen Platform (Vitrified Tiles / Granite)", uom: "SQFT", qty: flooringSqft, rateObj: flooringRate },
      { id: "CIV-WND-01", code: doorsWinRate.itemCode || "CIV-WND-01", category: "Doors & Windows", name: "Windows & Doors (UPVC/Teak Frames + Shutters)", uom: "SQFT", qty: doorsWinSqft, rateObj: doorsWinRate },
      { id: "CIV-GRL-01", code: grillsRate.itemCode || "CIV-GRL-01", category: "Metal Fabrication", name: "Grills & Railings (MS Window Grills + SS Balcony Railings)", uom: "SQFT", qty: grillsSqft, rateObj: grillsRate },
      { id: "CIV-PNT-01", code: paintRate.itemCode || "CIV-PNT-01", category: "Painting & Protective Coatings", name: "Painting Works (Interior Emulsion + Exterior Weather Shield)", uom: "SQFT", qty: paintSqft, rateObj: paintRate },
      { id: "CIV-FCL-01", code: ceilingRate.itemCode || "CIV-FCL-01", category: "Ceiling & Joinery", name: "False Ceiling Works (Gypsum / POP Grid System)", uom: "SQFT", qty: ceilingSqft, rateObj: ceilingRate },
      { id: "CIV-ELE-01", code: elecRate.itemCode || "CIV-ELE-01", category: "MEP Services - Electrical", name: "Electrical + External Lighting + Distribution Boards/MCBs", uom: "SQFT", qty: elecSqft, rateObj: elecRate },
      { id: "CIV-PLB-01", code: plbRate.itemCode || "CIV-PLB-01", category: "MEP Services - Plumbing", name: "Plumbing Works (CP fittings + CPVC Piping + Sanitary)", uom: "SQFT", qty: plbsqft, rateObj: plbRate },
      { id: "CIV-WTP-01", code: wtpRate.itemCode || "CIV-WTP-01", category: "Waterproofing & Insulation", name: "Waterproofing Works (Terrace, Toilets & Sump Coating)", uom: "SQFT", qty: wtpSqft, rateObj: wtpRate },
      { id: "CIV-SMP-01", code: sumpRate.itemCode || "CIV-SMP-01", category: "Water Storage Systems", name: "Underground Sump (Concrete RCC Tank)", uom: "LTR", qty: sumpLtr, rateObj: sumpRate },
      { id: "CIV-OHT-01", code: ohtRate.itemCode || "CIV-OHT-01", category: "Water Storage Systems", name: "Overhead Tank (Triple Layer Storage)", uom: "LTR", qty: ohtLtr, rateObj: ohtRate },
      { id: "CIV-CCTV-01", code: cctvRate.itemCode || "CIV-CCTV-01", category: "Security & Automation", name: "CCTV Installation (HD Cameras + DVR + Cabling)", uom: "NOS", qty: cctvQty, rateObj: cctvRate },
      { id: "CIV-CWD-01", code: compoundRate.itemCode || "CIV-CWD-01", category: "External & Site Infra", name: "Compound Wall + Gate + External Paving + Landscaping", uom: "SQFT", qty: compoundSqft, rateObj: compoundRate },
      { id: "CIV-TRC-01", code: canopyRate.itemCode || "CIV-TRC-01", category: "Special Structures", name: "Terrace Canopy / Party Hall", uom: "SQFT", qty: canopySqft, rateObj: canopyRate },
      { id: "CIV-INT-01", code: interiorRate.itemCode || "CIV-INT-01", category: "Interior Works", name: "All Interiors (Cabinets, Wardrobes, Modular Kitchen)", uom: "SQFT", qty: interiorSqft, rateObj: interiorRate }
    ];

    const selectedItems = allItems.filter(it => selectedItemIds.includes(it.id));
    const effectiveTierScale = packageMultiplier;

    let totalMaterialCost = 0;
    let totalLabourCost = 0;

    const processedItems = selectedItems.map(it => {
      const isFound = it.rateObj.found && Number(it.rateObj.rate) > 0;
      const baseRateVal = isFound ? Number(it.rateObj.rate) : 0;
      const rateVal = Math.round(baseRateVal * effectiveTierScale * 100) / 100;
      const amountVal = Math.round(it.qty * rateVal);

      let matRatio = 0.68;
      if (it.category.includes("Labour") || it.category.includes("Services")) {
        matRatio = 0.35;
      } else if (["Substructure & Superstructure", "Reinforcement Steel", "Aggregates & Mortar"].includes(it.category)) {
        matRatio = 1.0;
      }

      const itemMatCost = amountVal * matRatio;
      const itemLabCost = amountVal * (1 - matRatio);

      totalMaterialCost += itemMatCost;
      totalLabourCost += itemLabCost;

      return {
        ...it,
        isFound,
        rateVal,
        amountVal
      };
    });

    const grandTotalCost = processedItems.reduce((sum, item) => sum + item.amountVal, 0);
    const costPerSqft = totalBUA > 0 ? grandTotalCost / totalBUA : (1800 * packageMultiplier);
    const missingItems = processedItems.filter(it => !it.isFound);

    return {
      plotArea,
      footprintArea: Math.round(footprintArea),
      totalBUA,
      cementBags,
      steelKg,
      isRccSelected,
      totalMaterialCost,
      totalLabourCost,
      grandTotalCost,
      costPerSqft,
      items: processedItems,
      missingItems
    };
  }, [selectedItemIds, plotLength, plotWidth, floors, wallType, packageTier, cementRate, steelRate, sandRate, aggRate, clearRate, fndRate, rccRate, masonryRate, plasterRate, flooringRate, doorsWinRate, grillsRate, paintRate, ceilingRate, elecRate, plbRate, wtpRate, sumpRate, ohtRate, cctvRate, compoundRate, canopyRate, interiorRate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("civil_boq_export", "CIVIL-BOQ", () => {
      const data = [
        ["BUILDMITRA CIVIL BUILDING CONSTRUCTION BOQ REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Plot Dimensions", `${plotLength}ft (L) x ${plotWidth}ft (W)`],
        ["Floors Count", floors],
        ["Construction Package", packageTier],
        ["Total Built-up Area", `${calculations.totalBUA} Sq.ft`],
        ["Material Subtotal", formatCurrency(calculations.totalMaterialCost)],
        ["Labour Subtotal", formatCurrency(calculations.totalLabourCost)],
        ["Estimated Rate / Sq.ft", `${formatCurrency(calculations.costPerSqft)} / Sq.ft`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calculations.grandTotalCost)],
        [],
        ["ITEMIZED CIVIL BOQ"],
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
      XLSX.utils.book_append_sheet(wb, ws, "Civil_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Civil_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("civil_boq_export", "CIVIL-BOQ", () => {
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
        "BuildMitra – Civil Building Construction BOQ Report",
        [
          ["Plot Dimensions:", `${plotLength}ft (L) x ${plotWidth}ft (W)`],
          ["Floors Count:", floors],
          ["Package Specification:", packageTier],
          ["Total Built-up Area:", `${calculations.totalBUA} Sq.ft`],
          ["Material Subtotal:", formatCurrency(calculations.totalMaterialCost)],
          ["Labour Subtotal:", formatCurrency(calculations.totalLabourCost)],
          ["Est. Rate / Sq.ft:", `₹${calculations.costPerSqft.toFixed(2)} / Sq.ft`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calculations.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Civil_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>Civil Construction BOQ Estimator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>CIVIL BUILDING BOQ</span>
            <h1 style={styles.headerTitle}>🏗️ BuildMitra – Civil Construction BOQ</h1>
          </div>
          <button style={styles.backBtn} onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Inputs */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>📐 Enter Plot &amp; Building Specifications</span>
          </div>

          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Plot Length (ft)</label>
              <input type="number" value={plotLength} onChange={(e) => handleInputChange(setPlotLength, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Plot Width (ft)</label>
              <input type="number" value={plotWidth} onChange={(e) => handleInputChange(setPlotWidth, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Floors Count</label>
              <input type="number" value={floors} onChange={(e) => handleInputChange(setFloors, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Wall Material</label>
              <select value={wallType} onChange={(e) => handleInputChange(setWallType, e.target.value)} style={styles.select}>
                <option value="Concrete Blocks">Concrete Solid Blocks (6 inch)</option>
                <option value="Clay Bricks">Clay Bricks (9 inch)</option>
                <option value="AAC Blocks">AAC Blocks (6 inch)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Construction Package</label>
              <select
                value={packageTier}
                onChange={(e) => handleInputChange(setPackageTier, e.target.value as any)}
                style={{
                  ...styles.select,
                  fontWeight: '800',
                  color: packageTier === 'Ultra Premium' ? '#7c3aed' : (packageTier === 'Premium' ? '#2563eb' : '#0f766e')
                }}
              >
                <option value="Standard">Standard (₹1,800 / Sq.ft)</option>
                <option value="Premium">Premium (+25% — ₹2,250 / Sq.ft)</option>
                <option value="Ultra Premium">Ultra Premium (+50% — ₹2,700 / Sq.ft)</option>
              </select>
            </div>

            {/* Horizontal BOQ Line Items Filter Bar & Pill Checklist */}
          <div style={{ marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <span>📋 <strong>Include / Exclude BOQ Line Items</strong></span>
                <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#800020', color: '#ffffff', padding: '3px 10px', borderRadius: '12px' }}>
                  {selectedItemIds.length} of {ALL_BOQ_ITEMS_DEF.length} Selected
                </span>
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔍 Search items..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    outline: 'none',
                    width: '160px'
                  }}
                />
                <button
                  type="button"
                  onClick={selectAllItems}
                  style={{ padding: '5px 10px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: '1px solid #16a34a', backgroundColor: '#f0fdf4', color: '#15803d', cursor: 'pointer' }}
                >
                  ✓ Select All ({ALL_BOQ_ITEMS_DEF.length})
                </button>
                <button
                  type="button"
                  onClick={deselectAllItems}
                  style={{ padding: '5px 10px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: '1px solid #dc2626', backgroundColor: '#fef2f2', color: '#b91c1c', cursor: 'pointer' }}
                >
                  ✕ Deselect All
                </button>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ padding: '5px 12px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: '1px solid #800020', backgroundColor: isDropdownOpen ? '#800020' : '#ffffff', color: isDropdownOpen ? '#ffffff' : '#800020', cursor: 'pointer' }}
                >
                  {isDropdownOpen ? '▲ Hide Items' : '▼ Filter Items List'}
                </button>
              </div>
            </div>

            {/* Horizontal Pill Badges List */}
            {isDropdownOpen && (
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px', marginTop: '8px', maxHeight: '300px', overflowY: 'auto', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALL_BOQ_ITEMS_DEF.filter(it => it.name.toLowerCase().includes(itemSearch.toLowerCase()) || it.code.toLowerCase().includes(itemSearch.toLowerCase())).map(item => {
                    const isChecked = selectedItemIds.includes(item.id);
                    const isRccItem = item.id === 'CIV-RCC-01';
                    return (
                      <label
                        key={item.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          backgroundColor: isChecked ? '#800020' : '#ffffff',
                          color: isChecked ? '#ffffff' : '#475569',
                          border: isChecked ? '1px solid #800020' : '1px solid #cbd5e1',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: isChecked ? '700' : '500',
                          boxShadow: isChecked ? '0 2px 4px rgba(128,0,32,0.15)' : 'none',
                          transition: 'all 0.15s ease',
                          userSelect: 'none'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item.id)}
                          style={{ width: '14px', height: '14px', accentColor: '#ffffff', cursor: 'pointer' }}
                        />
                        <span>
                          <code style={{ fontSize: '11px', color: isChecked ? '#fef08a' : '#800020' }}>{item.code}</code> – {item.name} {isRccItem && <span style={{ color: isChecked ? '#a7f3d0' : '#059669', fontSize: '11px', fontWeight: '800' }}>(Auto-Deducts Concrete Materials)</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Deduplication Info Notice */}
          {calculations.isRccSelected && (
            <div style={{ marginTop: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
              💡 <strong>IS Standard Concrete Deduplication Active:</strong> Because <code>CIV-RCC-01</code> (All RCC Concrete Works) is selected, Aggregates CA-1 &amp; CA-2 quantity is set to 0 CFT, and Cement &amp; M-Sand quantities automatically adjust to non-RCC mortar works (Masonry, Plastering, Flooring, Waterproofing) to prevent double counting.
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Civil BOQ</button>
            <button style={styles.btnReset} onClick={() => { setPlotLength(30); setPackageTier('Standard'); selectAllItems(); }}>🔄 Reset</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
          </div>
        </div>

        {/* Result Cards */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>Built-up Area</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#fecdd3' : '#ffffff' }}>{calculations.totalBUA.toLocaleString()} Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
            <span style={styles.metricTitle}>Material Subtotal</span>
            <span style={styles.metricVal}>{formatCurrency(calculations.totalMaterialCost)}</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricPurple }}>
            <span style={styles.metricTitle}>Labour Subtotal</span>
            <span style={styles.metricVal}>{formatCurrency(calculations.totalLabourCost)}</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricCyan }}>
            <span style={styles.metricTitle}>Est. Rate / Sq.ft</span>
            <span style={styles.metricVal}>₹{calculations.costPerSqft.toFixed(2)} / Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Cement Bags</span>
            <span style={styles.metricVal}>{calculations.cementBags} Bags</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>Steel Rebar</span>
            <span style={styles.metricVal}>{calculations.steelKg.toLocaleString()} KG</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>GRAND TOTAL COST</span>
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
          <div style={{ padding: '12px 16px', backgroundColor: '#800020', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized Civil Construction BOQ (Admin Master Linked)
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
              <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: '800' }}>
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
