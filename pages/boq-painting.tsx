import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../utils/pdfExport';
import { getMasterRate, getCombinedBOQRate, syncApprovedRatesFromBackend } from '../utils/masterRates';
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
    backgroundColor: '#db2777',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(219,39,119,0.2)'
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
    backgroundColor: '#be185d',
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
    color: '#db2777',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #fbcfe8',
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
    marginBottom: '2px',
    whiteSpace: 'nowrap'
  },
  input: {
    width: '100%',
    height: '38px',
    padding: '8px 12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  inputReadOnly: {
    backgroundColor: '#f1f5f9',
    fontWeight: '800',
    color: '#db2777'
  },
  select: {
    width: '100%',
    height: '38px',
    padding: '8px 12px',
    fontSize: '14px',
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
  metricMaroon: { backgroundColor: '#db2777' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricPurple: { backgroundColor: '#7c3aed' },
  metricBlue: { backgroundColor: '#0284c7' },
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
  th: { backgroundColor: '#db2777', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '14px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '14px' },

  btnPrimary: { backgroundColor: '#db2777', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  noteBox: { backgroundColor: '#fce4ec', border: '1px solid #fbcfe8', padding: '12px', borderRadius: '10px', fontSize: '13px', color: '#be185d', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const ceil = (n: any) => Math.ceil(Number(n || 0));

const ALL_PAINTING_ITEMS_DEF = [
  { id: "PNT-01", slNo: 1, code: "PNT-01", name: "Wall Putty (2 Coats / Patch Touchup)", materials: "Acrylic Wall Putty / White Cement Putty", defaultUom: "kg" },
  { id: "PNT-02", slNo: 2, code: "PNT-02", name: "Interior Primer Coat", materials: "Water-based interior acrylic primer", defaultUom: "ltr" },
  { id: "PNT-03", slNo: 3, code: "PNT-03", name: "Interior Emulsion Paint (2 Coats)", materials: "Interior Emulsion (Tractor / Apcolite / Royale)", defaultUom: "ltr" },
  { id: "PNT-04", slNo: 4, code: "PNT-04", name: "Exterior Weather Coat Paint", materials: "Exterior weather-proof acrylic emulsion", defaultUom: "ltr" },
  { id: "PNT-05", slNo: 5, code: "PNT-05", name: "Ceiling Tractor Emulsion Paint", materials: "White ceiling emulsion paint", defaultUom: "ltr" },
  { id: "PNT-06", slNo: 6, code: "PNT-06", name: "Enamel Paint for Doors & Windows", materials: "Synthetic enamel paint for metal & wood surfaces", defaultUom: "ltr" },
  { id: "PNT-07", slNo: 7, code: "PNT-07", name: "Sand Paper Sheets", materials: "Silicon carbide abrasive paper (120 & 180 grit)", defaultUom: "nos" },
  { id: "PNT-08", slNo: 8, code: "PNT-08", name: "Masking Tape & Protective Rolls", materials: "Self-adhesive paper tape & plastic masking sheets", defaultUom: "roll" },
  { id: "PNT-09", slNo: 9, code: "PNT-09", name: "Scaffolding & Ladder Support Hire", materials: "H-frame steel scaffolding, aluminum ladders", defaultUom: "LS" },
  { id: "PNT-10", slNo: 10, code: "PNT-10", name: "Final Touchup, Masking Removal & Site Cleaning", materials: "Solvents, masking tape removal, surface cleaning", defaultUom: "LS" },
  { id: "PNT-11", slNo: 11, code: "PNT-11", name: "Wood & Door Polishing (PU / Melamyne Finish)", materials: "PU Coating / Melamyne Clear Polish for Teak & Flush Doors/Windows", defaultUom: "sqft" },
  { id: "PNT-12", slNo: 12, code: "PNT-12", name: "Feature Wall Texture Paint (10% BUA Coverage)", materials: "Specialty Decorative Texture Paint / Metallic Finish", defaultUom: "sqft" },
  { id: "PNT-13", slNo: 13, code: "PNT-13", name: "Royale / Luxury Accent Wall Emulsion Paint (10% BUA Coverage)", materials: "Royale Luxury Emulsion / Teflon Surface Protector Paint", defaultUom: "sqft" }
];

export default function PaintingBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Building & Surface Inputs
  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(3);
  const [wallHeight, setWallHeight] = useState(10);
  const [workType, setWorkType] = useState<'Fresh' | 'Repaint'>('Fresh');
  const [packageTier, setPackageTier] = useState<'Standard' | 'Premium' | 'Ultra Premium'>('Standard');
  const [paintType, setPaintType] = useState("Premium Emulsion");
  const [exteriorPercent, setExteriorPercent] = useState(25);
  const [doors, setDoors] = useState(20);
  const [windows, setWindows] = useState(12);

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(ALL_PAINTING_ITEMS_DEF.map(it => it.id));
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(true);
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
    setSelectedItemIds(ALL_PAINTING_ITEMS_DEF.map(it => it.id));
    setIsInputModified(true);
  };

  const deselectAllItems = () => {
    setSelectedItemIds([]);
    setIsInputModified(true);
  };

  // Admin Master Rates Lookup for all 13 Items
  const rates = useMemo(() => ({
    pnt01: getMasterRate(["PNT-01", "wall putty"], 28),
    pnt02: getMasterRate(["PNT-02", "interior primer"], 120),
    pnt03: getMasterRate(["PNT-03", "interior paint"], 220),
    pnt04: getMasterRate(["PNT-04", "exterior paint"], 280),
    pnt05: getMasterRate(["PNT-05", "ceiling paint"], 180),
    pnt06: getMasterRate(["PNT-06", "enamel paint"], 260),
    pnt07: getMasterRate(["PNT-07", "sand paper"], 12),
    pnt08: getMasterRate(["PNT-08", "masking tape"], 80),
    pnt09: getMasterRate(["PNT-09", "scaffolding"], 2500),
    pnt10: getMasterRate(["PNT-10", "painting finishing"], 1500),
    pnt11: getMasterRate(["PNT-11", "wood polishing"], 45),
    pnt12: getMasterRate(["PNT-12", "texture paint"], 65),
    pnt13: getMasterRate(["PNT-13", "royale paint"], 38)
  }), []);

  // Painting Calculation Engine
  const boqResults = useMemo(() => {
    const plotArea = plotLength * plotWidth;
    const setbackArea = plotArea * 0.10;
    const footprintArea = plotArea - setbackArea;
    const totalBUA = footprintArea * floors;

    const floorCount = Math.max(1, ceil(floors));
    const perimeter = 2 * (plotLength + plotWidth);
    const externalWallArea = perimeter * wallHeight * floorCount;
    const internalWallArea = totalBUA * 2.7;
    const ceilingArea = totalBUA;
    const openingDeduction = (doors * 21) + (windows * 15);
    const netWallArea = Math.max(0, internalWallArea + externalWallArea - openingDeduction);
    const exteriorArea = netWallArea * (exteriorPercent / 100);
    const interiorArea = netWallArea - exteriorArea;

    const tierMultiplier = packageTier === 'Ultra Premium' ? 1.50 : packageTier === 'Premium' ? 1.25 : 1.0;
    const primerCoverage = 100;
    const puttyCoverage = 18;
    const paintCoverage = paintType === "Economy Emulsion" ? 120 : paintType === "Premium Emulsion" ? 140 : 160;

    // Fresh Painting vs Repainting Logic
    // If Repaint: no full wall putty work (0 or minor patch touchup ~10%), primer reduced to touchup (25%)
    const puttyKg = workType === 'Repaint' ? (interiorArea / puttyCoverage) * 0.10 : interiorArea / puttyCoverage;
    const primerLtr = workType === 'Repaint' ? (netWallArea / primerCoverage) * 0.25 : netWallArea / primerCoverage;
    const interiorPaintLtr = interiorArea / paintCoverage / 2;
    const exteriorPaintLtr = exteriorArea / 120 / 2;
    const ceilingPaintLtr = ceilingArea / 130 / 2;
    const enamelLtr = ((doors * 21) + (windows * 15)) / 100;
    const sandPaperQty = workType === 'Repaint' ? ceil(netWallArea / 300) : ceil(netWallArea / 120);

    const rawItems = [
      { id: "PNT-01", sr: 1, code: rates.pnt01.itemCode || "PNT-01", desc: workType === 'Repaint' ? "Wall Putty (Patch Touchup Only - Repaint Mode)" : "Wall Putty (2 Coats)", materials: "Acrylic Wall Putty / White Cement Putty", uom: "kg", qty: puttyKg, defaultMat: rates.pnt01.rate || 28, defaultLab: 10 },
      { id: "PNT-02", sr: 2, code: rates.pnt02.itemCode || "PNT-02", desc: workType === 'Repaint' ? "Interior Primer Coat (Patch Touchup)" : "Interior Primer Coat", materials: "Water-based interior acrylic primer", uom: "ltr", qty: primerLtr, defaultMat: rates.pnt02.rate || 120, defaultLab: 12 },
      { id: "PNT-03", sr: 3, code: rates.pnt03.itemCode || "PNT-03", desc: `${paintType} Interior Paint (2 Coats)`, materials: "Interior Emulsion (Tractor / Apcolite / Royale)", uom: "ltr", qty: interiorPaintLtr, defaultMat: rates.pnt03.rate || 220, defaultLab: 18 },
      { id: "PNT-04", sr: 4, code: rates.pnt04.itemCode || "PNT-04", desc: "Exterior Weather Coat Paint", materials: "Exterior weather-proof acrylic emulsion", uom: "ltr", qty: exteriorPaintLtr, defaultMat: rates.pnt04.rate || 280, defaultLab: 22 },
      { id: "PNT-05", sr: 5, code: rates.pnt05.itemCode || "PNT-05", desc: "Ceiling Tractor Emulsion Paint", materials: "White ceiling emulsion paint", uom: "ltr", qty: ceilingPaintLtr, defaultMat: rates.pnt05.rate || 180, defaultLab: 15 },
      { id: "PNT-06", sr: 6, code: rates.pnt06.itemCode || "PNT-06", desc: "Enamel Paint for Doors & Windows", materials: "Synthetic enamel paint for metal & wood", uom: "ltr", qty: enamelLtr, defaultMat: rates.pnt06.rate || 260, defaultLab: 25 },
      { id: "PNT-07", sr: 7, code: rates.pnt07.itemCode || "PNT-07", desc: "Sand Paper Sheets", materials: "Silicon carbide abrasive paper", uom: "nos", qty: sandPaperQty, defaultMat: rates.pnt07.rate || 12, defaultLab: 0 },
      { id: "PNT-08", sr: 8, code: rates.pnt08.itemCode || "PNT-08", desc: "Masking Tape & Protective Rolls", materials: "Self-adhesive paper tape & plastic sheets", uom: "roll", qty: ceil(netWallArea / 500), defaultMat: rates.pnt08.rate || 80, defaultLab: 0 },
      { id: "PNT-09", sr: 9, code: rates.pnt09.itemCode || "PNT-09", desc: "Scaffolding & Ladder Support Hire", materials: "H-frame steel scaffolding, aluminum ladders", uom: "LS", qty: 1, defaultMat: rates.pnt09.rate || 2500, defaultLab: 1500 },
      { id: "PNT-10", sr: 10, code: rates.pnt10.itemCode || "PNT-10", desc: "Final Touchup, Masking Removal & Site Cleaning", materials: "Solvents, masking tape removal, surface cleaning", uom: "LS", qty: 1, defaultMat: rates.pnt10.rate || 1500, defaultLab: 1000 },
      { id: "PNT-11", sr: 11, code: rates.pnt11.itemCode || "PNT-11", desc: "Wood & Door Polishing (PU / Melamyne Finish)", materials: "PU Coating / Melamyne Clear Polish for Teak & Flush Doors/Windows", uom: "sqft", qty: (doors * 21) + (windows * 15), defaultMat: rates.pnt11.rate || 45, defaultLab: 20 },
      { id: "PNT-12", sr: 12, code: rates.pnt12.itemCode || "PNT-12", desc: "Feature Wall Texture Paint (10% BUA Coverage)", materials: "Specialty Decorative Texture Paint / Metallic Finish", uom: "sqft", qty: Math.round(totalBUA * 0.10), defaultMat: rates.pnt12.rate || 65, defaultLab: 25 },
      { id: "PNT-13", sr: 13, code: rates.pnt13.itemCode || "PNT-13", desc: "Royale / Luxury Accent Wall Emulsion Paint (10% BUA Coverage)", materials: "Royale Luxury Emulsion / Teflon Surface Protector Paint", uom: "sqft", qty: Math.round(totalBUA * 0.10), defaultMat: rates.pnt13.rate || 38, defaultLab: 18 }
    ];

    const selectedItems = rawItems.filter(it => selectedItemIds.includes(it.id));

    const processedItems = selectedItems.map((i, idx) => {
      const combined = getCombinedBOQRate(i.code, i.defaultMat, i.defaultLab);
      const matRate = Math.round(combined.materialRate * tierMultiplier);
      const labRate = Math.round(combined.labourRate * tierMultiplier);
      const amount = Math.round(i.qty * (matRate + labRate));
      return { ...i, sr: idx + 1, matRate, labRate, amount };
    });

    const materialTotal = Math.round(processedItems.reduce((sum, i) => sum + (i.qty * i.matRate), 0));
    const labourTotal = Math.round(processedItems.reduce((sum, i) => sum + (i.qty * i.labRate), 0));
    const grandTotal = Math.round(materialTotal + labourTotal);
    const ratePerSft = totalBUA > 0 ? grandTotal / totalBUA : 0;

    return {
      items: processedItems,
      materialTotal,
      labourTotal,
      grandTotal,
      ratePerSft,
      plotArea,
      totalBUA,
      netWallArea,
      interiorArea,
      exteriorArea,
      puttyKg,
      interiorPaintLtr,
      exteriorPaintLtr
    };
  }, [selectedItemIds, workType, packageTier, paintType, plotLength, plotWidth, floors, wallHeight, exteriorPercent, doors, windows, rates]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun('boq_export', 'boq-painting', () => {
      const data = [
        ["BUILDMITRA RESIDENTIAL PAINTING BOQ REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Painting Work Type", `${workType} Painting (${workType === 'Repaint' ? 'Patch Touchup Only - No Full Putty' : 'Full Surface Putty + Primer + 2 Coats'})`],
        ["Package Tier", `${packageTier} (${packageTier === 'Ultra Premium' ? '+50% Luxury Multiplier' : packageTier === 'Premium' ? '+25% Premium Multiplier' : 'Baseline Standard Multiplier'})`],
        ["Plot Area", `${boqResults.plotArea} Sq.ft`],
        ["Built-up Area", `${boqResults.totalBUA} Sq.ft`],
        ["Net Paint Area", `${formatNumber(boqResults.netWallArea)} Sq.ft`],
        ["Material Subtotal", formatCurrency(boqResults.materialTotal)],
        ["Labour Subtotal", formatCurrency(boqResults.labourTotal)],
        ["Est. Rate / Sq.ft", `${formatCurrency(boqResults.ratePerSft)} / Sq.ft`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(boqResults.grandTotal)],
        [],
        ["ITEMIZED PAINTING BOQ"],
        ["Sl.No", "Item Code", "Description", "Key Materials", "UOM", "Quantity", "Material Rate (₹)", "Labour Rate (₹)", "Total Amount (₹)"],
        ...boqResults.items.map(it => [
          it.sr,
          it.code,
          it.desc,
          it.materials,
          it.uom,
          formatNumber(it.qty),
          formatCurrency(it.matRate),
          formatCurrency(it.labRate),
          formatCurrency(it.amount)
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Painting_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Painting_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("boq_export", "boq-painting", () => {
      const headers = ["Sl.No", "Item Code", "Description", "Key Materials", "Qty", "UOM", "Mat. Rate (₹)", "Lab. Rate (₹)", "Amount (₹)"];
      const rows = boqResults.items.map(it => [
        String(it.sr),
        it.code,
        it.desc,
        it.materials,
        formatNumber(it.qty),
        it.uom,
        formatCurrency(it.matRate),
        formatCurrency(it.labRate),
        formatCurrency(it.amount)
      ]);

      downloadBuildMitraPDF(
        "BuildMitra – Residential Painting BOQ Report",
        [
          ["Painting Work Type:", `${workType} Painting (${workType === 'Repaint' ? 'Patch Touchup Only' : 'Full 2-Coat Putty + Primer'})`],
          ["Package Tier:", `${packageTier} (${packageTier === 'Ultra Premium' ? '+50% Luxury' : packageTier === 'Premium' ? '+25% Premium' : 'Baseline Standard'})`],
          ["Built-up Area:", `${boqResults.totalBUA} Sq.ft`],
          ["Net Paint Area:", `${formatNumber(boqResults.netWallArea)} Sq.ft`],
          ["Material Subtotal:", formatCurrency(boqResults.materialTotal)],
          ["Labour Subtotal:", formatCurrency(boqResults.labourTotal)],
          ["Est. Rate / Sq.ft:", `₹${boqResults.ratePerSft.toFixed(2)} / Sq.ft`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(boqResults.grandTotal)]
        ],
        headers,
        rows,
        `BuildMitra_Painting_BOQ_${Date.now()}.pdf`
      );
    });
  };

  const handleShareWhatsApp = () => {
    checkAndRun('boq_export', 'boq-painting', () => {
      const msg = `*BuildMitra Painting BOQ Estimate*%0A` +
        `----------------------------------------%0A` +
        `• *Work Type*: ${workType} Painting | *Tier*: ${packageTier}%0A` +
        `• *Plot Area*: ${boqResults.plotArea} Sq.ft | *Total BUA*: ${formatNumber(boqResults.totalBUA)} Sq.ft%0A` +
        `• *Net Paint Area*: ${formatNumber(boqResults.netWallArea)} Sq.ft%0A` +
        `• *Material Total*: ${formatCurrency(boqResults.materialTotal)}%0A` +
        `• *Labour Total*: ${formatCurrency(boqResults.labourTotal)}%0A` +
        `• *GRAND TOTAL COST*: ${formatCurrency(boqResults.grandTotal)} (${formatCurrency(boqResults.ratePerSft)}/Sq.ft BUA)%0A%0A` +
        `*Generated via BuildMitra Painting BOQ Engine*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  const handleReset = () => {
    setPlotLength(30); setPlotWidth(40); setFloors(3); setWallHeight(10); setWorkType('Fresh'); setPackageTier('Standard'); setPaintType("Premium Emulsion");
    setExteriorPercent(25); setDoors(20); setWindows(12); selectAllItems();
  };

  return (
    <>
      <Head>
        <title>Painting BOQ Estimator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header} className="bm-boq-top-header">
          <div>
            <span style={styles.badge}>FINISHES &amp; PAINTING BOQ</span>
            <h1 style={styles.headerTitle}>🎨 BuildMitra – Painting BOQ Estimator</h1>
          </div>
          <button style={styles.backBtn} className="bm-top-back-btn" onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Inputs */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>📐 Enter Painting &amp; Building Specifications</span>
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
              <label style={styles.label}>Clear Wall Height (ft)</label>
              <input type="number" value={wallHeight} onChange={(e) => handleInputChange(setWallHeight, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Painting Work Type</label>
              <select
                value={workType}
                onChange={(e) => handleInputChange(setWorkType, e.target.value as any)}
                style={{
                  ...styles.select,
                  fontWeight: '700',
                  color: workType === 'Repaint' ? '#0284c7' : '#db2777',
                  borderColor: workType === 'Repaint' ? '#93c5fd' : '#fbcfe8',
                  backgroundColor: workType === 'Repaint' ? '#f0f9ff' : '#fce4ec'
                }}
              >
                <option value="Fresh">Fresh Painting (Full 2-Coat Putty + Primer)</option>
                <option value="Repaint">Repainting (Patch Touchup Only - No Full Putty)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Specification Package Tier</label>
              <select
                value={packageTier}
                onChange={(e) => handleInputChange(setPackageTier, e.target.value as any)}
                style={{
                  ...styles.select,
                  fontWeight: '700',
                  color: packageTier === 'Ultra Premium' ? '#7c3aed' : packageTier === 'Premium' ? '#2563eb' : '#db2777',
                  borderColor: packageTier === 'Ultra Premium' ? '#c4b5fd' : packageTier === 'Premium' ? '#93c5fd' : '#fbcfe8',
                  backgroundColor: packageTier === 'Ultra Premium' ? '#f5f3ff' : packageTier === 'Premium' ? '#eff6ff' : '#fce4ec'
                }}
              >
                <option value="Standard">Standard (Tractor Emulsion Baseline)</option>
                <option value="Premium">Premium (+25% Premium Emulsion)</option>
                <option value="Ultra Premium">Ultra Premium (+50% Luxury Royale)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Exterior Wall Ratio (%)</label>
              <input type="number" value={exteriorPercent} onChange={(e) => handleInputChange(setExteriorPercent, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Doors Count (Nos)</label>
              <input type="number" value={doors} onChange={(e) => handleInputChange(setDoors, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Windows Count (Nos)</label>
              <input type="number" value={windows} onChange={(e) => handleInputChange(setWindows, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Total Built-Up Area (Sq.ft)</label>
              <input type="text" readOnly style={{ ...styles.input, ...styles.inputReadOnly }} value={`${boqResults.totalBUA.toLocaleString()} Sq.ft`} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Net Paint Area (Sq.ft)</label>
              <input type="text" readOnly style={{ ...styles.input, ...styles.inputReadOnly }} value={`${formatNumber(boqResults.netWallArea)} Sq.ft`} />
            </div>
          </div>

          {/* IS Painting Engine Technical Note */}
          <div style={styles.noteBox}>
            💡 <strong>IS 2395 Painting Engine Rules</strong>: Mode: <strong>{workType} Painting</strong> | Tier: <strong>{packageTier}</strong> | Total BUA: <strong>{boqResults.totalBUA.toLocaleString()} Sq.ft</strong> | Net Paint Area: <strong>{formatNumber(boqResults.netWallArea)} Sq.ft</strong> | Putty: <strong>{formatNumber(boqResults.puttyKg, 1)} kg</strong> {workType === 'Repaint' ? '(Patch Touchup Only)' : '(Full 2 Coats)'} | Interior Paint: <strong>{formatNumber(boqResults.interiorPaintLtr, 1)} Ltr</strong> | Exterior Paint: <strong>{formatNumber(boqResults.exteriorPaintLtr, 1)} Ltr</strong>.
          </div>

          {/* Horizontal Painting Line Items Selector */}
          <div style={{ marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <span>📋 <strong>Include / Exclude Painting BOQ Line Items</strong></span>
                <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#db2777', color: '#ffffff', padding: '3px 10px', borderRadius: '12px' }}>
                  {selectedItemIds.length} of {ALL_PAINTING_ITEMS_DEF.length} Selected
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
                  ✓ Select All ({ALL_PAINTING_ITEMS_DEF.length})
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
                  style={{ padding: '5px 12px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: '1px solid #db2777', backgroundColor: isDropdownOpen ? '#db2777' : '#ffffff', color: isDropdownOpen ? '#ffffff' : '#db2777', cursor: 'pointer' }}
                >
                  {isDropdownOpen ? '▲ Hide Items' : '▼ Filter Items List'}
                </button>
              </div>
            </div>

            {/* Horizontal Pill Badges List */}
            {isDropdownOpen && (
              <div style={{ backgroundColor: '#fce4ec', border: '1px solid #fbcfe8', borderRadius: '10px', padding: '14px', marginTop: '8px', maxHeight: '280px', overflowY: 'auto', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALL_PAINTING_ITEMS_DEF.filter(it => it.name.toLowerCase().includes(itemSearch.toLowerCase()) || it.code.toLowerCase().includes(itemSearch.toLowerCase()) || it.materials.toLowerCase().includes(itemSearch.toLowerCase())).map(item => {
                    const isChecked = selectedItemIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          backgroundColor: isChecked ? '#db2777' : '#ffffff',
                          color: isChecked ? '#ffffff' : '#475569',
                          border: isChecked ? '1px solid #db2777' : '1px solid #cbd5e1',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: isChecked ? '700' : '500',
                          boxShadow: isChecked ? '0 2px 4px rgba(219,39,119,0.18)' : 'none',
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
                          <code style={{ fontSize: '11px', color: isChecked ? '#fde047' : '#db2777' }}>{item.code}</code> – {item.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bm-boq-actions" style={{ marginTop: '12px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>
              <span className="bm-desktop-only">⚡ Calculate Painting BOQ</span>
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
            <button style={{ backgroundColor: '#15803d', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }} className="bm-desktop-only" onClick={handleShareWhatsApp}>💬 WhatsApp Share</button>
          </div>
        </div>

        {/* Result Metric Cards */}
        <div style={styles.summaryGrid} className="bm-boq-summary-scroll">
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">Built-up Area</span>
              <span className="bm-mobile-only">BUA</span>
            </span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#fbcfe8' : '#ffffff' }}>{boqResults.totalBUA.toLocaleString()} Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">Net Paint Area</span>
              <span className="bm-mobile-only">Paint Area</span>
            </span>
            <span style={styles.metricVal}>{formatNumber(boqResults.netWallArea)} Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">Material Subtotal</span>
              <span className="bm-mobile-only">Mat ₹</span>
            </span>
            <span style={styles.metricVal}>{formatCurrency(boqResults.materialTotal)}</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricPurple }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">Labour Subtotal</span>
              <span className="bm-mobile-only">Lab ₹</span>
            </span>
            <span style={styles.metricVal}>{formatCurrency(boqResults.labourTotal)}</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">Est. Rate / Sq.ft</span>
              <span className="bm-mobile-only">Rate/Sq.ft</span>
            </span>
            <span style={styles.metricVal}>₹{boqResults.ratePerSft.toFixed(2)} / Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">GRAND ESTIMATED TOTAL</span>
              <span className="bm-mobile-only">Grand ₹</span>
            </span>
            <span style={{ ...styles.metricValGrand, color: isCalculatedBlue ? '#60a5fa' : '#ffffff' }}>{formatCurrency(boqResults.grandTotal)}</span>
          </div>
        </div>

        {/* Itemized BOQ Table */}
        <div style={styles.tableContainer} className="bm-boq-table-scroll">
          <div style={{ padding: '12px 16px', backgroundColor: '#db2777', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized Painting BOQ ({workType} Mode - Admin Master Linked)
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sl.No</th>
                <th style={styles.th} className="bm-hide-mobile">Item Code</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Key Materials</th>
                <th style={styles.th}>UOM</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Material Rate (₹)</th>
                <th style={styles.th}>Labour Rate (₹)</th>
                <th style={styles.th}>Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {boqResults.items.map(it => (
                <tr key={it.code}>
                  <td style={styles.td}><strong>{it.sr}</strong></td>
                  <td style={styles.td} className="bm-hide-mobile"><code>{it.code}</code></td>
                  <td style={styles.td}><strong>{it.desc}</strong></td>
                  <td style={styles.td}>{it.materials}</td>
                  <td style={styles.td}>{it.uom}</td>
                  <td style={styles.td}>{formatNumber(it.qty)}</td>
                  <td style={styles.td}>{formatCurrency(it.matRate)}</td>
                  <td style={styles.td}>{formatCurrency(it.labRate)}</td>
                  <td style={styles.td}><strong>{formatCurrency(it.amount)}</strong></td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#db2777', color: 'white', fontWeight: '800' }}>
                <td colSpan={8} style={{ padding: '12px 14px', fontSize: '16px' }}>GRAND TOTAL ESTIMATED COST</td>
                <td style={{ padding: '12px 14px', fontSize: '18px' }}>{formatCurrency(boqResults.grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}





