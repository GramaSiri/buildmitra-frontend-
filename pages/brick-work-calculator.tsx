import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import EngineeringSpecimen from '../components/engineering/EngineeringSpecimen';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";
import { downloadBuildMitraPDF } from "../utils/pdfExport";

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { backgroundColor: '#0f766e', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(15,118,110,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#14b8a6', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  dropdownCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '16px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  dropdownLabel: { fontSize: '12px', fontWeight: '800', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px', display: 'block' },
  modeSelect: { width: '100%', padding: '12px 14px', border: '2px solid #0f766e', borderRadius: '8px', fontSize: '15px', fontWeight: '700', color: '#0f766e', backgroundColor: '#f0fdfa', outline: 'none', cursor: 'pointer' },

  stepperCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '15px', fontWeight: '700', color: '#0f766e', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #ccfbf1', paddingBottom: '8px' },

  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '14px' },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' },
  select: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', outline: 'none' },

  btnPrimary: { backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnDanger: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' },
  metricCard: { padding: '14px', borderRadius: '8px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricBlue: { backgroundColor: '#2563eb' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tableContainer: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#0f766e', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

  rateTag: { backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },
  rateTagWarn: { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '600' },
  noteBox: { backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#0f766e', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "Rate Unavailable in Admin Master";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

// Block & Brick Specifications (Dimensions in Inches)
const BLOCK_SPECS: Record<string, { length: number; height: number; width: number; category: string }> = {
  'Clay Brick (4.5" Wall)': { length: 9, height: 3, width: 4.5, category: 'Brick' },
  'Clay Brick (9" Wall)': { length: 9, height: 3, width: 9.0, category: 'Brick' },
  'Concrete Block (4")': { length: 16, height: 8, width: 4.0, category: 'Concrete Block' },
  'Concrete Block (6")': { length: 16, height: 8, width: 6.0, category: 'Concrete Block' },
  'Concrete Block (8")': { length: 16, height: 8, width: 8.0, category: 'Concrete Block' },
  'AAC Block (4")': { length: 24, height: 8, width: 4.0, category: 'AAC Block' },
  'AAC Block (6")': { length: 24, height: 8, width: 6.0, category: 'AAC Block' },
  'AAC Block (8")': { length: 24, height: 8, width: 8.0, category: 'AAC Block' }
};

export default function BrickWorkCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Mode: 'quick' vs 'detailed'
  const [calcMode, setCalcMode] = useState<'quick' | 'detailed'>('quick');

  // QUICK CALCULATION INPUTS
  const initialQuickInputs = {
    inputType: 'Plot Dimensions (L x W x Floors)',
    plotLength: 30, // ft
    plotWidth: 40,  // ft
    floors: 2,      // floors
    directWallArea: 1000,
    internalWallSize: '4.5" Partition Wall', // 4.5" Partition Wall | 6" Block Wall | 8" Block Wall
    mortarThicknessMm: 10, // 10mm, 12mm, 15mm, 4mm
    blockType: 'Clay Brick (4.5" Wall)',
    mortarRatio: '1:6',
    wastagePct: 3
  };
  const [quickInputs, setQuickInputs] = useState(initialQuickInputs);

  // DETAILED WALL-WISE INPUTS
  const initialDetailedInputs = {
    wallNos: 4,
    length: 10,
    height: 10,
    wallThicknessInches: 4.5, // 4.5", 6", 8", 9"
    mortarThicknessMm: 10, // 10mm, 12mm
    blockType: 'Clay Brick (4.5" Wall)',
    mortarRatio: '1:6',
    wastagePct: 3
  };
  const [detailedInputs, setDetailedInputs] = useState(initialDetailedInputs);

  // Auto Sync Block Type when Wall Thickness changes
  const syncBlockTypeWithThickness = (thicknessInches: number, currentType: string) => {
    if (thicknessInches === 4.5 || thicknessInches === 4) {
      if (currentType.includes("AAC")) return 'AAC Block (4")';
      if (currentType.includes("Concrete")) return 'Concrete Block (4")';
      return 'Clay Brick (4.5" Wall)';
    } else if (thicknessInches === 6) {
      if (currentType.includes("AAC")) return 'AAC Block (6")';
      if (currentType.includes("Brick")) return 'Clay Brick (4.5" Wall)';
      return 'Concrete Block (6")';
    } else if (thicknessInches === 8 || thicknessInches === 9) {
      if (currentType.includes("AAC")) return 'AAC Block (8")';
      if (currentType.includes("Concrete")) return 'Concrete Block (8")';
      return 'Clay Brick (9" Wall)';
    }
    return currentType;
  };

  // Openings for Detailed Mode
  const [openings, setOpenings] = useState<any[]>([
    { name: "Door", length: 3.5, width: 7, nos: 1, area: 24.5 },
    { name: "Window", length: 4, width: 5, nos: 2, area: 40 }
  ]);
  const [openingInput, setOpeningInput] = useState({ name: 'Door', length: 3.5, width: 7, nos: 1 });

  // Admin Master Rates Lookup
  const clayBrickRate = getMasterRate(["MAT-BRK-01", "clay brick", "brick"], 7.50);
  const concreteBlockRate = getMasterRate(["MAT-BLK-01", "concrete block", "solid block"], 45);
  const aacBlockRate = getMasterRate(["MAT-AAC-01", "aac block", "aac"], 75);
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53", "opc"], 385);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 46);
  const waterRate = getMasterRate(["MAT-WTR-01", "construction water", "water"], 0.05); // ₹0.05 / Ltr
  const labourRate = getMasterRate(["SRV-BRK-LAY", "brickwork labour", "masonry labour"], 12);

  const getBlockRateObj = (type: string): MasterRateResult => {
    if (type.includes("AAC")) return aacBlockRate;
    if (type.includes("Concrete") || type.includes("Solid")) return concreteBlockRate;
    return clayBrickRate;
  };

  const handleAddOpening = () => {
    if (openingInput.length > 0 && openingInput.width > 0 && openingInput.nos > 0) {
      const area = openingInput.length * openingInput.width * openingInput.nos;
      setOpenings([...openings, { ...openingInput, area, id: Date.now() }]);
    }
  };

  const handleRemoveOpening = (index: number) => {
    const next = [...openings];
    next.splice(index, 1);
    setOpenings(next);
  };

  const handleResetQuick = () => setQuickInputs(initialQuickInputs);
  const handleResetDetailed = () => {
    setDetailedInputs(initialDetailedInputs);
    setOpenings([
      { name: "Door", length: 3.5, width: 7, nos: 1, area: 24.5 },
      { name: "Window", length: 4, width: 5, nos: 2, area: 40 }
    ]);
  };

  // IS Code Volumetric Masonry & Mortar Calculation Engine (IS 2212 / IS 2185 / IS 1077)
  const calculateMasonry = (netWallArea: number, wallThicknessInches: number, mortarThickMm: number, blockTypeKey: string, mortarRatio: string, wastagePct: number) => {
    const spec = BLOCK_SPECS[blockTypeKey] || BLOCK_SPECS['Clay Brick (4.5" Wall)'];
    const wallThicknessFt = wallThicknessInches / 12;
    const wastageFactor = 1 + (wastagePct / 100);

    // Total Masonry Volume
    const masonryVolCft = netWallArea * wallThicknessFt;
    const masonryVolCum = masonryVolCft / 35.3147;

    const activeBlockRate = getBlockRateObj(blockTypeKey);

    let blockL = spec.length * 0.0254; // meters
    let blockH = spec.height * 0.0254;
    let blockW = wallThicknessInches * 0.0254;

    const mortarThickM = mortarThickMm / 1000;

    // Nominal Block Dimensions with Mortar Joint
    const nominalL = blockL + mortarThickM;
    const nominalH = blockH + mortarThickM;
    const nominalW = blockW + mortarThickM;

    // Nominal Block Volume
    const nominalVolCum = nominalL * nominalH * nominalW;

    // Nominal Block Count
    const nominalBlocksTotal = nominalVolCum > 0 ? (masonryVolCum / nominalVolCum) : 0;
    const totalBlocks = Math.ceil(nominalBlocksTotal * wastageFactor);

    // Single Block Net Volume without Mortar
    const singleBlockNetVolCum = blockL * blockH * blockW;
    const totalBlocksNetVolCum = nominalBlocksTotal * singleBlockNetVolCum;

    // Wet Volume of Mortar
    const wetMortarVolCum = Math.max(0, masonryVolCum - totalBlocksNetVolCum);
    // Mortar dry volume factor = 1.33 (30-35% dry shrinkage + joint filling allowance)
    const dryMortarVolCum = wetMortarVolCum * 1.33;

    const [cemPart, sandPart] = mortarRatio.split(":").map(Number);
    const totalParts = cemPart + sandPart;

    const cemVolCum = dryMortarVolCum * (cemPart / totalParts);
    const cemBags = ((cemVolCum * 1440) / 50) * wastageFactor; // 50kg Bags OPC 53
    const sandCft = (cemVolCum * sandPart * 35.3147) * wastageFactor;
    const waterLtr = cemBags * 28; // ~28 Ltr per bag

    let unpricedCount = 0;
    const unpricedList: string[] = [];

    if (!activeBlockRate.found) { unpricedCount++; unpricedList.push(blockTypeKey); }
    if (!cementRate.found) { unpricedCount++; unpricedList.push("Cement (OPC 53)"); }
    if (!sandRate.found) { unpricedCount++; unpricedList.push("M-Sand"); }
    if (!waterRate.found) { unpricedCount++; unpricedList.push("Site Water"); }
    if (!labourRate.found) { unpricedCount++; unpricedList.push("Brickwork Labour"); }

    const blockCost = totalBlocks * (activeBlockRate.found ? activeBlockRate.rate : 0);
    const cemCost = cemBags * (cementRate.found ? cementRate.rate : 0);
    const sandCost = sandCft * (sandRate.found ? sandRate.rate : 0);
    const waterCost = waterLtr * (waterRate.found ? waterRate.rate : 0);
    const labourCost = netWallArea * (labourRate.found ? labourRate.rate : 0);

    const grandMatCost = blockCost + cemCost + sandCost + waterCost;
    const grandTotal = grandMatCost + labourCost;
    const costPerSqft = netWallArea > 0 ? grandTotal / netWallArea : 0;

    const resultItems: any[] = [
      {
        code: activeBlockRate.itemCode || "MAT-BRK-01",
        category: "Material",
        description: `${blockTypeKey} (${spec.length}"x${spec.height}"x${wallThicknessInches}")`,
        unit: "NOS",
        engQty: totalBlocks / wastageFactor,
        procQty: totalBlocks,
        rate: activeBlockRate.rate,
        rateFound: activeBlockRate.found,
        amount: blockCost
      },
      {
        code: cementRate.itemCode || "MAT-CEM-01",
        category: "Material",
        description: `Cement (OPC 53 Grade 50kg Bags)`,
        unit: "BAG",
        engQty: (cemVolCum * 1440) / 50,
        procQty: Math.ceil(cemBags),
        rate: cementRate.rate,
        rateFound: cementRate.found,
        amount: cemCost
      },
      {
        code: sandRate.itemCode || "MAT-MSND-01",
        category: "Material",
        description: `Mortar M-Sand / Fine Sand (${mortarThickMm}mm Mortar Joint)`,
        unit: "CFT",
        engQty: (cemVolCum * sandPart * 35.3147),
        procQty: Math.ceil(sandCft),
        rate: sandRate.rate,
        rateFound: sandRate.found,
        amount: sandCost
      },
      {
        code: waterRate.itemCode || "MAT-WTR-01",
        category: "Site Utility",
        description: `Construction Water Supply`,
        unit: "LTR",
        engQty: waterLtr,
        procQty: Math.ceil(waterLtr),
        rate: waterRate.rate,
        rateFound: waterRate.found,
        amount: waterCost
      },
      {
        code: labourRate.itemCode || "SRV-BRK-LAY",
        category: "Labour",
        description: `Brickwork / Blockwork Masonry Labour (${wallThicknessInches}" Wall)`,
        unit: "SQFT",
        engQty: netWallArea,
        procQty: netWallArea,
        rate: labourRate.rate,
        rateFound: labourRate.found,
        amount: labourCost
      }
    ];

    return {
      netWallArea,
      masonryVolCft,
      totalBlocks,
      cemBags,
      sandCft,
      waterLtr,
      grandMatCost,
      grandLabCost: labourCost,
      grandTotal,
      costPerSqft,
      resultItems,
      unpricedCount,
      unpricedList
    };
  };

  // 1. QUICK CALCULATION ENGINE (Plot Size L x W x Floors BUA + Wall Size Sync)
  const quickCalcResults = useMemo(() => {
    const q = quickInputs;
    let netWallArea = 0;
    let builtUpArea = 0;

    if (q.inputType === 'Plot Dimensions (L x W x Floors)') {
      const plotArea = q.plotLength * q.plotWidth;
      builtUpArea = plotArea * q.floors;
      // Civil Engineering Thumb Rule: Total Masonry Surface Area = BUA x 1.4 Sqft
      netWallArea = builtUpArea * 1.4;
    } else {
      netWallArea = q.directWallArea;
      builtUpArea = netWallArea / 1.4;
    }

    const wallThickness = q.internalWallSize.includes("4.5") ? 4.5 : q.internalWallSize.includes("6") ? 6 : 8;
    const res = calculateMasonry(netWallArea, wallThickness, q.mortarThicknessMm, q.blockType, q.mortarRatio, q.wastagePct);

    return {
      ...res,
      builtUpArea,
      plotArea: q.plotLength * q.plotWidth
    };
  }, [quickInputs, clayBrickRate, concreteBlockRate, aacBlockRate, cementRate, sandRate, waterRate, labourRate]);

  // 2. DETAILED WALL-WISE CALCULATION ENGINE
  const detailedCalcResults = useMemo(() => {
    const d = detailedInputs;
    const grossWallArea = d.wallNos * d.length * d.height;

    let openingArea = 0;
    openings.forEach(o => {
      openingArea += (o.length * o.width * o.nos);
    });

    const netWallArea = Math.max(0, grossWallArea - openingArea);
    const res = calculateMasonry(netWallArea, d.wallThicknessInches, d.mortarThicknessMm, d.blockType, d.mortarRatio, d.wastagePct);

    return {
      ...res,
      grossWallArea,
      openingArea
    };
  }, [detailedInputs, openings, clayBrickRate, concreteBlockRate, aacBlockRate, cementRate, sandRate, waterRate, labourRate]);

  // Export PDF BuildMitra Letterhead
  const handleExportPDF = () => {
    checkAndRun('calculator_export', 'brick-work-calculator', () => {
      const res = calcMode === 'quick' ? quickCalcResults : detailedCalcResults;
      downloadBuildMitraPDF({
        documentTitle: `BRICK & BLOCK MASONRY BOQ REPORT (${calcMode.toUpperCase()})`,
        documentNo: `BM-BRK-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        projectName: "Masonry Construction",
        buyerName: "Client / Buyer",
        contractorName: "BuildMitra Masonry Division",
        items: res.resultItems.map((item: any, idx: number) => ({
          sno: idx + 1,
          itemCode: item.code,
          category: item.category,
          description: item.description,
          quantity: item.procQty,
          unit: item.unit,
          rate: item.rateFound ? item.rate : 0,
          amount: item.amount
        })),
        notes: `Net Wall Area: ${formatNumber(res.netWallArea)} Sqft | Masonry Vol: ${formatNumber(res.masonryVolCft)} CFT | Total Blocks: ${formatNumber(res.totalBlocks, 0)} Nos`
      });
    });
  };

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('calculator_export', 'brick-work-calculator', () => {
      const items = calcMode === 'quick' ? quickCalcResults.resultItems : detailedCalcResults.resultItems;
      const data = items.map(item => ({
        "Master Item Code": item.code,
        "Category": item.category,
        "Description": item.description,
        "Unit": item.unit,
        "Engineering Qty": item.engQty,
        "Procurement Qty": item.procQty,
        "Approved Rate (₹)": item.rateFound ? item.rate : "Rate Unavailable in Admin Master",
        "Amount (₹)": item.rateFound ? item.amount : 0
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Brickwork Estimation Results");
      XLSX.writeFile(wb, `BuildMitra_Brickwork_Calculator_${calcMode}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'brick-work-calculator', () => {
      const res = calcMode === 'quick' ? quickCalcResults : detailedCalcResults;
      const msg = `🏗️ *BUILDMITRA INFRA — MASONRY BOQ REPORT*\nNo:378, Near Gurusidheswra theater, 80 ft Road, JP Nagar, 4th Block, 9th Phase, Bengaluru- 560062 | 📱 +91 76769 42386\n\n*MODE*: ${calcMode === 'quick' ? 'Quick Plot Area' : 'Detailed Wall-Wise'}\n• *Net Wall Area*: ${formatNumber(res.netWallArea)} Sqft\n• *Masonry Volume*: ${formatNumber(res.masonryVolCft)} CFT\n• *Bricks / Blocks*: ${formatNumber(res.totalBlocks, 0)} Nos\n• *Cement Bags*: ${formatNumber(res.cemBags, 1)} Bags\n• *Estimated Cost*: ${formatCurrency(res.grandTotal)}\n\n*BOQ ITEM BREAKDOWN*\n${res.resultItems.map((it: any, i: number) => `${i+1}. [${it.code}] ${it.description} — ${it.procQty} ${it.unit} @ ₹${it.rate} = ₹${it.amount}`).join('\n')}\n\nGenerated via BuildMitra Construction Suite.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  return (
    <div style={styles.container}>
            <div className="engineering-top-layout">
        <div className="engineering-top-left">
{/* 1. Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => router.push('/calculators')}>← Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          Block/Brick Work Calculator
          <span style={styles.badge}>IS 2212 / IS 2185 Compliant</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#e0f2fe' }}>BuildMitra Professional Edition</span>
        </div>
      </div>

      {/* 2. Single Live Market Rate Ticker */}
      <MarketRateTrend />

      {/* 3. Estimation Method Dropdown Selector */}
      <div style={styles.dropdownCard}>
        <label style={styles.dropdownLabel}>Select Estimation Method</label>
        <select
          style={styles.modeSelect}
          value={calcMode}
          onChange={(e) => setCalcMode(e.target.value as 'quick' | 'detailed')}
        >
          <option value="quick">Quick Calculation (Estimate from Plot Dimensions L x W x Floors BUA)</option>
          <option value="detailed">Detailed Wall-Wise Calculation (Exact Room Dimensions & Openings)</option>
        </select>
      </div>
        </div>
        <div className="engineering-specimen-top">
      <EngineeringSpecimen kind="masonry" title="Dynamic Brick / Block Specimen" material={calcMode === 'quick' ? quickInputs.blockType : detailedInputs.blockType} data={calcMode === 'quick' ? { length: quickInputs.plotLength, heightFt: 10, wallThicknessInches: quickInputs.internalWallSize.includes('4.5') ? 4.5 : quickInputs.internalWallSize.includes('6') ? 6 : 8, mortarThicknessMm: quickInputs.mortarThicknessMm } : { length: detailedInputs.length, heightFt: detailedInputs.height, wallThicknessInches: detailedInputs.wallThicknessInches, mortarThicknessMm: detailedInputs.mortarThicknessMm }} />
        </div>
      </div>
      <style jsx>{`
        .engineering-top-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          gap: 16px;
          align-items: start;
          margin-bottom: 18px;
        }
        .engineering-top-left { min-width: 0; overflow: hidden; }
        .engineering-specimen-top {
          width: 260px;
          position: sticky;
          top: 12px;
          align-self: start;
          z-index: 2;
        }
        @media (max-width: 900px) {
          .engineering-top-layout { grid-template-columns: 1fr; }
          .engineering-specimen-top {
            width: 100%; max-width: 260px; position: static;
            margin-left: auto; margin-right: auto;
          }
        }
      `}</style>

      {/* ========================================================= */}
      {/* 4. QUICK CALCULATION MODE */}
      {/* ========================================================= */}
      {calcMode === 'quick' && (
        <>
          <div style={styles.stepperCard}>
            <div style={styles.sectionHeader}>
              <span>Quick Calculation (Plot Dimensions & Wall Thickness BUA Rule)</span>
            </div>

            <div style={styles.noteBox}>
              💡 <strong>IS Code Volumetric Rule</strong>: Block count, Cement Bags, Sand CFT, and Water Litres automatically scale with Wall Thickness (4.5", 6", 8", 9") and Mortar Joint Thickness.
            </div>

            <div style={styles.grid3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Input Calculation Method</label>
                <select
                  style={{ ...styles.select, border: '2px solid #0f766e', backgroundColor: '#f0fdfa', fontWeight: '700' }}
                  value={quickInputs.inputType}
                  onChange={e => setQuickInputs({ ...quickInputs, inputType: e.target.value })}
                >
                  <option value="Plot Dimensions (L x W x Floors)">Plot Dimensions (Length x Width x Floors)</option>
                  <option value="Direct Wall Area">Direct Wall Area (Sqft)</option>
                </select>
              </div>

              {quickInputs.inputType === 'Plot Dimensions (L x W x Floors)' ? (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Plot Length (Ft)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={quickInputs.plotLength}
                      onChange={e => setQuickInputs({ ...quickInputs, plotLength: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Plot Width (Ft)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={quickInputs.plotWidth}
                      onChange={e => setQuickInputs({ ...quickInputs, plotWidth: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Number of Floors (Nos)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={quickInputs.floors}
                      onChange={e => setQuickInputs({ ...quickInputs, floors: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                </>
              ) : (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Direct Wall Area (Sqft)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={quickInputs.directWallArea}
                    onChange={e => setQuickInputs({ ...quickInputs, directWallArea: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>

            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Wall Size / Thickness</label>
                <select
                  style={{ ...styles.select, border: '2px solid #0f766e', fontWeight: '700' }}
                  value={quickInputs.internalWallSize}
                  onChange={e => {
                    const newThickness = e.target.value.includes("4.5") ? 4.5 : e.target.value.includes("6") ? 6 : 8;
                    const syncedBlock = syncBlockTypeWithThickness(newThickness, quickInputs.blockType);
                    setQuickInputs({ ...quickInputs, internalWallSize: e.target.value, blockType: syncedBlock });
                  }}
                >
                  <option value='4.5" Partition Wall'>4.5" Partition Wall (4" Blocks / Bricks)</option>
                  <option value='6" Block Wall'>6" Concrete / AAC Block Wall</option>
                  <option value='8" Main Wall'>8" / 9" Heavy Main Wall (8" Blocks / 9" Bricks)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mortar Joint Thickness (mm)</label>
                <select
                  style={{ ...styles.select, border: '2px solid #0f766e', fontWeight: '700' }}
                  value={quickInputs.mortarThicknessMm}
                  onChange={e => setQuickInputs({ ...quickInputs, mortarThicknessMm: parseInt(e.target.value) || 10 })}
                >
                  <option value={10}>10 mm (Standard Mortar Joint)</option>
                  <option value={12}>12 mm (Heavy Masonry Joint)</option>
                  <option value={15}>15 mm (Rough Stone/Brick Joint)</option>
                  <option value={4}>4 mm (AAC Thin-Bed Jointing)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Block / Brick Type</label>
                <select
                  style={styles.select}
                  value={quickInputs.blockType}
                  onChange={e => setQuickInputs({ ...quickInputs, blockType: e.target.value })}
                >
                  {Object.keys(BLOCK_SPECS).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mortar Grade (Cement : Sand)</label>
                <select
                  style={styles.select}
                  value={quickInputs.mortarRatio}
                  onChange={e => setQuickInputs({ ...quickInputs, mortarRatio: e.target.value })}
                >
                  <option value="1:3">1:3 (Rich Mortar)</option>
                  <option value="1:4">1:4 (Standard Load Bearing)</option>
                  <option value="1:5">1:5 (Standard Brickwork)</option>
                  <option value="1:6">1:6 (General Partition Wall)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Wastage (%)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={quickInputs.wastagePct}
                  onChange={e => setQuickInputs({ ...quickInputs, wastagePct: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button style={styles.btnReset} onClick={handleResetQuick}>🔄 Reset Quick Form</button>
            </div>
          </div>

          {/* Quick Results Summary & BOQ */}
          <div style={styles.stepperCard}>
            <div style={styles.sectionHeader}>
              <span>📊 Block/Brick Work Calculation Results & Materials BOQ</span>
            </div>

            {quickCalcResults.unpricedCount > 0 ? (
              <div style={styles.warnBanner}>
                ⚠️ Partial Estimate: Admin Master Rates unavailable for: {quickCalcResults.unpricedList.join(', ')}.
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '700' }}>
                ✓ Complete Estimate: All rates verified against BuildMitra Admin Master Database.
              </div>
            )}

            {/* Summary Metric Cards */}
            <div style={styles.summaryGrid}>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Built-Up Area (BUA)</span>
                <span style={styles.metricVal}>{formatNumber(quickCalcResults.builtUpArea)} Sqft</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Masonry Volume</span>
                <span style={styles.metricVal}>{formatNumber(quickCalcResults.masonryVolCft)} CFT</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                <span style={styles.metricTitle}>Bricks / Blocks</span>
                <span style={styles.metricVal}>{formatNumber(quickCalcResults.totalBlocks, 0)} Nos</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                <span style={styles.metricTitle}>Cement & Sand</span>
                <span style={styles.metricVal}>{formatNumber(quickCalcResults.cemBags, 1)} Bags | {formatNumber(quickCalcResults.sandCft, 1)} CFT</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                <span style={styles.metricTitle}>Grand Total</span>
                <span style={styles.metricVal}>{formatCurrency(quickCalcResults.grandTotal)}</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(quickCalcResults.costPerSqft)} / Sqft)</span>
              </div>
            </div>

            {/* BOQ Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Master Code</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Item Description</th>
                    <th style={styles.th}>Unit</th>
                    <th style={styles.th}>Eng Qty</th>
                    <th style={styles.th}>Proc Qty</th>
                    <th style={styles.th}>Approved Rate</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quickCalcResults.resultItems.map((item, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}><code>{item.code}</code></td>
                      <td style={styles.td}>
                        <span style={{
                          backgroundColor: item.category === 'Material' ? '#e0f2fe' : '#ffedd5',
                          color: item.category === 'Material' ? '#0369a1' : '#c2410c',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '10px'
                        }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={styles.td}><strong>{item.description}</strong></td>
                      <td style={styles.td}>{item.unit}</td>
                      <td style={styles.td}>{formatNumber(item.engQty)}</td>
                      <td style={styles.td}><strong>{formatNumber(item.procQty)}</strong></td>
                      <td style={styles.td}>
                        {item.rateFound ? (
                          <span style={styles.rateTag}>{formatCurrency(item.rate)}</span>
                        ) : (
                          <span style={styles.rateTagWarn}>Rate Unavailable</span>
                        )}
                      </td>
                      <td style={styles.td}><strong>{formatCurrency(item.amount)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button style={styles.btnSecondary} onClick={handleExportExcel}>📥 Export BOQ to Excel</button>
              <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share Estimate on WhatsApp</button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 5. DETAILED WALL-WISE CALCULATION MODE */}
      {/* ========================================================= */}
      {calcMode === 'detailed' && (
        <div style={styles.stepperCard}>
          <div style={styles.sectionHeader}>
            <span>📐 Detailed Wall-Wise Brickwork Calculation Inputs (IS 2212 Exact Rules)</span>
          </div>

          <div style={styles.grid4}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Number of Walls (Nos)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.wallNos}
                onChange={e => setDetailedInputs({ ...detailedInputs, wallNos: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Length per Wall (Ft)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.length}
                onChange={e => setDetailedInputs({ ...detailedInputs, length: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Height per Wall (Ft)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.height}
                onChange={e => setDetailedInputs({ ...detailedInputs, height: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Wall Size / Thickness (Inches)</label>
              <select
                style={{ ...styles.select, fontWeight: '700' }}
                value={detailedInputs.wallThicknessInches}
                onChange={e => {
                  const newThickness = parseFloat(e.target.value);
                  const syncedBlock = syncBlockTypeWithThickness(newThickness, detailedInputs.blockType);
                  setDetailedInputs({ ...detailedInputs, wallThicknessInches: newThickness, blockType: syncedBlock });
                }}
              >
                <option value={4.5}>4.5" (Half-Brick Partition Wall)</option>
                <option value={6}>6.0" (Concrete / AAC Block Wall)</option>
                <option value={8}>8.0" (Heavy Block Main Wall)</option>
                <option value={9}>9.0" (Full-Brick Main Outer Wall)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Mortar Joint Thickness (mm)</label>
              <select
                style={{ ...styles.select, fontWeight: '700' }}
                value={detailedInputs.mortarThicknessMm}
                onChange={e => setDetailedInputs({ ...detailedInputs, mortarThicknessMm: parseInt(e.target.value) || 10 })}
              >
                <option value={10}>10 mm (Standard Mortar Joint)</option>
                <option value={12}>12 mm (Heavy Masonry Joint)</option>
                <option value={15}>15 mm (Rough Stone/Brick Joint)</option>
                <option value={4}>4 mm (AAC Thin-Bed Jointing)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Block / Brick Type</label>
              <select
                style={styles.select}
                value={detailedInputs.blockType}
                onChange={e => setDetailedInputs({ ...detailedInputs, blockType: e.target.value })}
              >
                {Object.keys(BLOCK_SPECS).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Mortar Grade (Cement : Sand)</label>
              <select
                style={styles.select}
                value={detailedInputs.mortarRatio}
                onChange={e => setDetailedInputs({ ...detailedInputs, mortarRatio: e.target.value })}
              >
                <option value="1:3">1:3</option>
                <option value="1:4">1:4</option>
                <option value="1:5">1:5</option>
                <option value="1:6">1:6</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Wastage (%)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.wastagePct}
                onChange={e => setDetailedInputs({ ...detailedInputs, wastagePct: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Openings Section */}
          <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f766e', marginBottom: '8px' }}>🚪 Openings Deduction (Doors & Windows Volume Deduction)</div>
            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Opening Type</label>
                <select style={styles.select} value={openingInput.name} onChange={e => setOpeningInput({ ...openingInput, name: e.target.value })}>
                  <option value="Door">Door</option>
                  <option value="Window">Window</option>
                  <option value="Ventilation">Ventilation</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Width (Ft)</label>
                <input type="number" style={styles.input} value={openingInput.length} onChange={e => setOpeningInput({ ...openingInput, length: parseFloat(e.target.value) || 0 })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Height (Ft)</label>
                <input type="number" style={styles.input} value={openingInput.width} onChange={e => setOpeningInput({ ...openingInput, width: parseFloat(e.target.value) || 0 })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Quantity (Nos)</label>
                <input type="number" style={styles.input} value={openingInput.nos} onChange={e => setOpeningInput({ ...openingInput, nos: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <button style={styles.btnPrimary} onClick={handleAddOpening}>+ Add Opening</button>

            {openings.length > 0 && (
              <div style={{ marginTop: '10px', ...styles.tableContainer }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Size</th>
                      <th style={styles.th}>Nos</th>
                      <th style={styles.th}>Gross Area</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openings.map((o, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{o.name}</td>
                        <td style={styles.td}>{`${o.length} ft x ${o.width} ft`}</td>
                        <td style={styles.td}>{o.nos}</td>
                        <td style={styles.td}><strong>{formatNumber(o.length * o.width * o.nos)} Sqft</strong></td>
                        <td style={styles.td}>
                          <button style={styles.btnDanger} onClick={() => handleRemoveOpening(idx)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button style={styles.btnReset} onClick={handleResetDetailed}>🔄 Reset Detailed Form</button>
          </div>

          {/* DETAILED RESULTS TABLE */}
          <div style={{ marginTop: '16px' }}>
            <div style={styles.sectionHeader}>
              <span>📊 Detailed Block/Brick Work Calculation Results & Materials BOQ</span>
            </div>

            {detailedCalcResults.unpricedCount > 0 ? (
              <div style={styles.warnBanner}>
                ⚠️ Partial Estimate: Admin Master Rates unavailable for: {detailedCalcResults.unpricedList.join(', ')}.
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '700' }}>
                ✓ Complete Estimate: All rates verified against BuildMitra Admin Master Database.
              </div>
            )}

            <div style={styles.summaryGrid}>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Net Wall Area</span>
                <span style={styles.metricVal}>{formatNumber(detailedCalcResults.netWallArea)} Sqft</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Masonry Volume</span>
                <span style={styles.metricVal}>{formatNumber(detailedCalcResults.masonryVolCft)} CFT</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                <span style={styles.metricTitle}>Bricks / Blocks</span>
                <span style={styles.metricVal}>{formatNumber(detailedCalcResults.totalBlocks, 0)} Nos</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                <span style={styles.metricTitle}>Cement & Sand</span>
                <span style={styles.metricVal}>{formatNumber(detailedCalcResults.cemBags, 1)} Bags | {formatNumber(detailedCalcResults.sandCft, 1)} CFT</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                <span style={styles.metricTitle}>Grand Total</span>
                <span style={styles.metricVal}>{formatCurrency(detailedCalcResults.grandTotal)}</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(detailedCalcResults.costPerSqft)} / Sqft)</span>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Master Code</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Item Description</th>
                    <th style={styles.th}>Unit</th>
                    <th style={styles.th}>Eng Qty</th>
                    <th style={styles.th}>Proc Qty</th>
                    <th style={styles.th}>Approved Rate</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedCalcResults.resultItems.map((item, i) => (
                    <tr key={i}>
                      <td style={styles.td}><code>{item.code}</code></td>
                      <td style={styles.td}>
                        <span style={{
                          backgroundColor: item.category === 'Material' ? '#e0f2fe' : '#ffedd5',
                          color: item.category === 'Material' ? '#0369a1' : '#c2410c',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '10px'
                        }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={styles.td}><strong>{item.description}</strong></td>
                      <td style={styles.td}>{item.unit}</td>
                      <td style={styles.td}>{formatNumber(item.engQty)}</td>
                      <td style={styles.td}><strong>{formatNumber(item.procQty)}</strong></td>
                      <td style={styles.td}>
                        {item.rateFound ? (
                          <span style={styles.rateTag}>{formatCurrency(item.rate)}</span>
                        ) : (
                          <span style={styles.rateTagWarn}>Rate Unavailable</span>
                        )}
                      </td>
                      <td style={styles.td}><strong>{formatCurrency(item.amount)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button style={styles.btnPrimary} onClick={handleExportPDF}>🖨️ Download PDF (BuildMitra Letterhead)</button>
              <button style={styles.btnSecondary} onClick={handleExportExcel}>📥 Export BOQ to Excel</button>
              <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share Estimate on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
