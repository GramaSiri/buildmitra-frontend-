import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import EngineeringSpecimen from '../components/engineering/EngineeringSpecimen';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' },
  header: { maxWidth: '100%', margin: '0 0 8px 0', padding: '6px 10px', borderRadius: '6px' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#14b8a6', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  dropdowncard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  dropdownlabel: { display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  modeselect: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '11px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },

  steppercard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  sectionheader: { maxWidth: '100%', margin: '0 0 8px 0', padding: '6px 10px', borderRadius: '6px' },

  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '14px' },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  input: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '12px', textAlign: 'center', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },
  select: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '11px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },

  btnPrimary: { backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnDanger: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summarygrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' },
  metriccard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  metricTeal: { backgroundColor: '#0f766e' },
  metricBlue: { backgroundColor: '#2563eb' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tablecontainer: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' },
  table: { width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '10px' },
  th: { padding: '3px 4px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#f1f5f9', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  td: { padding: '3px 4px', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

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

// IS 2395 & CPWD Paint Coverages
const COVERAGES = {
  putty: 10,     // 1 kg = 10 sqft (2 coats)
  primer: 120,   // 1 L = 120 sqft (1 coat)
  emulsion: 60,  // 1 L = 60 sqft (2 coats)
  royal: 55,     // 1 L = 55 sqft (2 coats)
  exterior: 50,  // 1 L = 50 sqft (2 coats) Weatherproof Emulsion
  enamel: 100,   // 1 L = 100 sqft (1 coat)
  ceiling: 65,   // 1 L = 65 sqft (2 coats)
  texture: 25
};

export default function PaintCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Estimation Method Selector Mode: 'quick' vs 'detailed'
  const [calcMode, setCalcMode] = useState<'quick' | 'detailed'>('quick');

  // QUICK CALCULATION MODE INPUTS
  const initialQuickInputs = {
    totalArea: 1000,
    areaType: 'Net Paintable Surface Area',
    locationScope: 'Internal Painting', // 'Internal Painting' | 'External Painting' | 'Both (Internal & External)'
    finishType: 'Fresh Coat',
    paintType: 'Regular Emulsion',
    includeCeiling: true,
    primerCoats: 1,
    paintCoats: 2
  };

  const [quickInputs, setQuickInputs] = useState(initialQuickInputs);

  // Auto Update Recommended Paint Type Based on Location Selection
  const handleQuickLocationChange = (loc: string) => {
    let recPaint = quickInputs.paintType;
    if (loc === 'External Painting') recPaint = 'Exterior Weatherproof Paint';
    if (loc === 'Internal Painting') recPaint = 'Regular Emulsion';
    setQuickInputs({ ...quickInputs, locationScope: loc, paintType: recPaint });
  };

  // DETAILED WALL-WISE CALCULATOR INPUTS
  const initialDetailedInputs = {
    locationScope: 'Internal Painting',
    finishType: 'Fresh Coat',
    paintType: 'Regular Emulsion',
    length: 20,
    height: 10,
    wallNos: 4,
    includeCeiling: true,
    primerCoats: 1,
    paintCoats: 2
  };

  const [detailedInputs, setDetailedInputs] = useState(initialDetailedInputs);

  const handleDetailedLocationChange = (loc: string) => {
    let recPaint = detailedInputs.paintType;
    if (loc === 'External Painting') recPaint = 'Exterior Weatherproof Paint';
    if (loc === 'Internal Painting') recPaint = 'Regular Emulsion';
    setDetailedInputs({ ...detailedInputs, locationScope: loc, paintType: recPaint });
  };

  // Openings (Doors & Windows) for Detailed Mode
  const [openings, setOpenings] = useState<any[]>([
    { type: 'Door', width: 3, height: 7, nos: 1, area: 21, hasShutter: true, hasFrame: true }
  ]);

  const [openingInput, setOpeningInput] = useState({
    type: 'Door',
    width: 3,
    height: 7,
    nos: 1,
    hasShutter: true,
    hasFrame: true
  });

  // Special / Texture Paints
  const [specialPaints, setSpecialPaints] = useState<any[]>([]);
  const [specialInput, setSpecialInput] = useState({
    type: 'Texture',
    area: 100
  });

  // Admin Rate (₹) Fetches
  const puttyRate = getMasterRate(["MAT-PUT-01", "MAT-PNT-PUT", "wall putty", "putty"], 19.50);
  const primerRate = getMasterRate(["MAT-PRM-01", "MAT-PNT-PRM", "wall primer", "primer"], 160);
  const emulsionRate = getMasterRate(["MAT-PNT-01", "MAT-PNT-EML", "emulsion paint", "regular emulsion"], 235);
  const royalRate = getMasterRate(["MAT-PNT-ROY", "royal paint", "premium paint"], 380);
  const exteriorRate = getMasterRate(["MAT-PNT-EXT", "exterior paint", "weatherproof paint"], 285);
  const enamelRate = getMasterRate(["MAT-ENM-01", "enamel paint", "enamel"], 240);
  const ceilingRate = getMasterRate(["MAT-PNT-CEL", "ceiling paint"], 180);
  const textureRate = getMasterRate(["MAT-PNT-TXT", "texture paint"], 95);

  const labourRate = getMasterRate(["SRV-PNT-LAY", "painting labour", "paint labour"], quickInputs.finishType === 'Repaint' ? 9 : 14);

  const getPaintRateObj = (type: string): MasterRateResult => {
    if (type.includes("Royal") || type.includes("Premium")) return royalRate;
    if (type.includes("Exterior") || type.includes("Weatherproof")) return exteriorRate;
    if (type.includes("Enamel")) return enamelRate;
    if (type.includes("Ceiling")) return ceilingRate;
    if (type.includes("Texture")) return textureRate;
    return emulsionRate;
  };

  const getCoverageFactor = (type: string) => {
    if (type.includes("Royal") || type.includes("Premium")) return COVERAGES.royal;
    if (type.includes("Exterior") || type.includes("Weatherproof")) return COVERAGES.exterior;
    if (type.includes("Enamel")) return COVERAGES.enamel;
    if (type.includes("Ceiling")) return COVERAGES.ceiling;
    if (type.includes("Texture")) return COVERAGES.texture;
    return COVERAGES.emulsion;
  };

  const handleAddOpening = () => {
    if (openingInput.width > 0 && openingInput.height > 0 && openingInput.nos > 0) {
      const area = openingInput.width * openingInput.height * openingInput.nos;
      setOpenings([...openings, { ...openingInput, area, id: Date.now() }]);
    }
  };

  const handleRemoveOpening = (index: number) => {
    const next = [...openings];
    next.splice(index, 1);
    setOpenings(next);
  };

  const handleAddSpecialPaint = () => {
    if (specialInput.area > 0) {
      setSpecialPaints([...specialPaints, { ...specialInput, id: Date.now() }]);
    }
  };

  const handleRemoveSpecialPaint = (index: number) => {
    const next = [...specialPaints];
    next.splice(index, 1);
    setSpecialPaints(next);
  };

  const handleResetQuick = () => {
    setQuickInputs(initialQuickInputs);
  };

  const handleResetDetailed = () => {
    setDetailedInputs(initialDetailedInputs);
    setOpenings([{ type: 'Door', width: 3, height: 7, nos: 1, area: 21, hasShutter: true, hasFrame: true }]);
    setSpecialPaints([]);
  };

  // 1. QUICK CALCULATION ENGINE
  const quickCalcResults = useMemo(() => {
    const q = quickInputs;

    let paintableArea = q.totalArea;
    if (q.areaType === 'Built-Up / Floor Area') {
      paintableArea = q.totalArea * 3.5;
    }

    const isRepaint = q.finishType === 'Repaint';
    const isTouchup = q.finishType === 'One Coat Touch-up';

    let unpricedCount = 0;
    const unpricedList: string[] = [];

    const resultItems: any[] = [];
    let grandMatCost = 0;

    if (q.locationScope === 'Both (Internal & External)') {
      const intArea = paintableArea * 0.75;
      const extArea = paintableArea * 0.25;

      const intPuttyKg = isRepaint || isTouchup ? 0 : (intArea / COVERAGES.putty);
      const intPrimerLtr = isTouchup ? 0 : (intArea / COVERAGES.primer) * (isRepaint ? 0.5 : q.primerCoats);
      const intPaintLtr = (intArea / COVERAGES.emulsion) * (isTouchup ? 1 : q.paintCoats) / 2;

      const extPrimerLtr = isTouchup ? 0 : (extArea / COVERAGES.primer) * (isRepaint ? 0.5 : q.primerCoats);
      const extPaintLtr = (extArea / COVERAGES.exterior) * (isTouchup ? 1 : q.paintCoats) / 2;

      const puttyCost = intPuttyKg * (puttyRate.found ? puttyRate.rate : 0);
      const intPrimerCost = intPrimerLtr * (primerRate.found ? primerRate.rate : 0);
      const intPaintCost = intPaintLtr * (emulsionRate.found ? emulsionRate.rate : 0);
      const extPrimerCost = extPrimerLtr * (primerRate.found ? primerRate.rate : 0);
      const extPaintCost = extPaintLtr * (exteriorRate.found ? exteriorRate.rate : 0);

      grandMatCost = puttyCost + intPrimerCost + intPaintCost + extPrimerCost + extPaintCost;

      resultItems.push(
        { code: puttyRate.itemCode || "MAT-PUT-01", category: "Material", description: `Interior Wall Putty (750 sqft)`, unit: "KG", engQty: intPuttyKg, procQty: Math.ceil(intPuttyKg), rate: puttyRate.rate, rateFound: puttyRate.found, amount: puttyCost },
        { code: primerRate.itemCode || "MAT-PRM-01", category: "Material", description: `Interior Wall Primer (750 sqft)`, unit: "LTR", engQty: intPrimerLtr, procQty: Math.ceil(intPrimerLtr), rate: primerRate.rate, rateFound: primerRate.found, amount: intPrimerCost },
        { code: emulsionRate.itemCode || "MAT-PNT-01", category: "Material", description: `Interior Emulsion Paint (750 sqft)`, unit: "LTR", engQty: intPaintLtr, procQty: Math.ceil(intPaintLtr), rate: emulsionRate.rate, rateFound: emulsionRate.found, amount: intPaintCost },
        { code: primerRate.itemCode || "MAT-PRM-01", category: "Material", description: `Exterior Weatherproof Wall Primer (250 sqft)`, unit: "LTR", engQty: extPrimerLtr, procQty: Math.ceil(extPrimerLtr), rate: primerRate.rate, rateFound: primerRate.found, amount: extPrimerCost },
        { code: exteriorRate.itemCode || "MAT-PNT-EXT", category: "Material", description: `Exterior Weatherproof Emulsion Paint (250 sqft)`, unit: "LTR", engQty: extPaintLtr, procQty: Math.ceil(extPaintLtr), rate: exteriorRate.rate, rateFound: exteriorRate.found, amount: extPaintCost }
      );
    } else {
      const isExternal = q.locationScope === 'External Painting';
      const puttyKg = (isRepaint || isTouchup || isExternal) ? 0 : (paintableArea / COVERAGES.putty);
      const primerLtr = isTouchup ? 0 : (paintableArea / COVERAGES.primer) * (isRepaint ? 0.5 : q.primerCoats);

      const activePaintRate = getPaintRateObj(q.paintType);
      const paintCoverage = getCoverageFactor(q.paintType);
      const effectivePaintCoats = isTouchup ? 1 : q.paintCoats;
      const paintLtr = (paintableArea / paintCoverage) * (effectivePaintCoats / 2);

      if (!puttyRate.found && puttyKg > 0) { unpricedCount++; unpricedList.push("Wall Putty"); }
      if (!primerRate.found && primerLtr > 0) { unpricedCount++; unpricedList.push("Wall Primer"); }
      if (!activePaintRate.found) { unpricedCount++; unpricedList.push(q.paintType); }

      const puttyCost = puttyKg * (puttyRate.found ? puttyRate.rate : 0);
      const primerCost = primerLtr * (primerRate.found ? primerRate.rate : 0);
      const paintCost = paintLtr * (activePaintRate.found ? activePaintRate.rate : 0);

      grandMatCost = puttyCost + primerCost + paintCost;

      if (puttyKg > 0) {
        resultItems.push({
          code: puttyRate.itemCode || "MAT-PUT-01",
          category: "Material",
          description: `Interior Wall Putty (2 Coats) - ${Math.ceil(puttyKg / 40)} Bags (40kg)`,
          unit: "KG",
          engQty: puttyKg,
          procQty: Math.ceil(puttyKg),
          rate: puttyRate.rate,
          rateFound: puttyRate.found,
          amount: puttyCost
        });
      }

      resultItems.push(
        {
          code: primerRate.itemCode || "MAT-PRM-01",
          category: "Material",
          description: isExternal ? `Exterior Weatherproof Wall Primer (${q.primerCoats} Coat)` : `Interior Wall Primer (${q.primerCoats} Coat)`,
          unit: "LTR",
          engQty: primerLtr,
          procQty: Math.ceil(primerLtr),
          rate: primerRate.rate,
          rateFound: primerRate.found,
          amount: primerCost
        },
        {
          code: activePaintRate.itemCode || "MAT-PNT-01",
          category: "Material",
          description: isExternal ? `Exterior Weatherproof Emulsion Paint (${q.paintCoats} Coats)` : `${q.paintType} (${q.paintCoats} Coats)`,
          unit: "LTR",
          engQty: paintLtr,
          procQty: Math.ceil(paintLtr),
          rate: activePaintRate.rate,
          rateFound: activePaintRate.found,
          amount: paintCost
        }
      );
    }

    const labourCost = paintableArea * (labourRate.found ? labourRate.rate : 0);
    resultItems.push({
      code: labourRate.itemCode || "SRV-PNT-LAY",
      category: "Labour",
      description: `Painting Labour (${q.locationScope} - ${q.finishType})`,
      unit: "SQFT",
      engQty: paintableArea,
      procQty: paintableArea,
      rate: labourRate.rate,
      rateFound: labourRate.found,
      amount: labourCost
    });

    const grandTotal = grandMatCost + labourCost;
    const costPerSqft = paintableArea > 0 ? grandTotal / paintableArea : 0;

    return {
      paintableArea,
      grandMatCost,
      grandLabCost: labourCost,
      grandTotal,
      costPerSqft,
      resultItems,
      unpricedCount,
      unpricedList
    };
  }, [quickInputs, puttyRate, primerRate, labourRate, exteriorRate, emulsionRate]);

  // 2. DETAILED WALL-WISE CALCULATION ENGINE
  const detailedCalcResults = useMemo(() => {
    const d = detailedInputs;

    const grossWallArea = d.length * d.height * d.wallNos;
    const ceilingArea = d.includeCeiling ? (d.length * d.height) : 0;

    let totalOpeningArea = 0;
    let totalShutterArea = 0;
    let totalFrameRft = 0;

    openings.forEach(o => {
      totalOpeningArea += o.area;
      if (o.hasShutter) totalShutterArea += o.area * 2;
      if (o.hasFrame) totalFrameRft += 2 * (o.width + o.height) * o.nos;
    });

    const netWallArea = Math.max(0, grossWallArea - totalOpeningArea);
    const totalPaintArea = netWallArea + ceilingArea;

    const isRepaint = d.finishType === 'Repaint';
    const isTouchup = d.finishType === 'One Coat Touch-up';
    const isExternal = d.locationScope === 'External Painting';

    const puttyKg = (isRepaint || isTouchup || isExternal) ? 0 : (totalPaintArea / COVERAGES.putty);
    const primerLtr = isTouchup ? 0 : (totalPaintArea / COVERAGES.primer) * (isRepaint ? 0.5 : d.primerCoats);

    const activePaintRate = getPaintRateObj(d.paintType);
    const paintCoverage = getCoverageFactor(d.paintType);
    const effectivePaintCoats = isTouchup ? 1 : d.paintCoats;
    const paintLtr = (totalPaintArea / paintCoverage) * (effectivePaintCoats / 2);

    const enamelLtr = (totalShutterArea / COVERAGES.enamel) + (totalFrameRft / 100);

    let unpricedCount = 0;
    const unpricedList: string[] = [];

    if (!puttyRate.found && puttyKg > 0) { unpricedCount++; unpricedList.push("Wall Putty"); }
    if (!primerRate.found && primerLtr > 0) { unpricedCount++; unpricedList.push("Wall Primer"); }
    if (!activePaintRate.found) { unpricedCount++; unpricedList.push(d.paintType); }
    if (!enamelRate.found && enamelLtr > 0) { unpricedCount++; unpricedList.push("Enamel Paint"); }
    if (!labourRate.found) { unpricedCount++; unpricedList.push("Painting Labour"); }

    const puttyCost = puttyKg * (puttyRate.found ? puttyRate.rate : 0);
    const primerCost = primerLtr * (primerRate.found ? primerRate.rate : 0);
    const paintCost = paintLtr * (activePaintRate.found ? activePaintRate.rate : 0);
    const enamelCost = enamelLtr * (enamelRate.found ? enamelRate.rate : 0);
    const labourCost = totalPaintArea * (labourRate.found ? labourRate.rate : 0);

    let specialCostTotal = 0;
    const specialResultRows: any[] = [];
    specialPaints.forEach(sp => {
      const spRateObj = getPaintRateObj(sp.type);
      const spLtr = sp.area / COVERAGES.texture;
      const spCost = spLtr * (spRateObj.found ? spRateObj.rate : 0);
      specialCostTotal += spCost;

      specialResultRows.push({
        code: spRateObj.itemCode || "MAT-PNT-TXT",
        category: "Special Paint",
        description: `${sp.type} Design Paint (${sp.area} sqft)`,
        unit: "LTR",
        engQty: spLtr,
        procQty: Math.ceil(spLtr),
        rate: spRateObj.rate,
        rateFound: spRateObj.found,
        amount: spCost
      });
    });

    const grandMatCost = puttyCost + primerCost + paintCost + enamelCost + specialCostTotal;
    const grandTotal = grandMatCost + labourCost;
    const costPerSqft = totalPaintArea > 0 ? grandTotal / totalPaintArea : 0;

    const resultItems: any[] = [];

    if (puttyKg > 0) {
      resultItems.push({
        code: puttyRate.itemCode || "MAT-PUT-01",
        category: "Material",
        description: `Interior Wall Putty (2 Coats) - ${Math.ceil(puttyKg / 40)} Bags (40kg)`,
        unit: "KG",
        engQty: puttyKg,
        procQty: Math.ceil(puttyKg),
        rate: puttyRate.rate,
        rateFound: puttyRate.found,
        amount: puttyCost
      });
    }

    resultItems.push(
      {
        code: primerRate.itemCode || "MAT-PRM-01",
        category: "Material",
        description: isExternal ? `Exterior Weatherproof Wall Primer (${d.primerCoats} Coat)` : `Interior Wall Primer (${d.primerCoats} Coat)`,
        unit: "LTR",
        engQty: primerLtr,
        procQty: Math.ceil(primerLtr),
        rate: primerRate.rate,
        rateFound: primerRate.found,
        amount: primerCost
      },
      {
        code: activePaintRate.itemCode || "MAT-PNT-01",
        category: "Material",
        description: isExternal ? `Exterior Weatherproof Emulsion Paint (${d.paintCoats} Coats)` : `${d.paintType} (${d.paintCoats} Coats)`,
        unit: "LTR",
        engQty: paintLtr,
        procQty: Math.ceil(paintLtr),
        rate: activePaintRate.rate,
        rateFound: activePaintRate.found,
        amount: paintCost
      }
    );

    if (enamelLtr > 0) {
      resultItems.push({
        code: enamelRate.itemCode || "MAT-ENM-01",
        category: "Material",
        description: `Enamel Paint for Door/Window Frames & Shutters`,
        unit: "LTR",
        engQty: enamelLtr,
        procQty: Math.ceil(enamelLtr),
        rate: enamelRate.rate,
        rateFound: enamelRate.found,
        amount: enamelCost
      });
    }

    resultItems.push(...specialResultRows);

    resultItems.push({
      code: labourRate.itemCode || "SRV-PNT-LAY",
      category: "Labour",
      description: `Painting Labour (${d.locationScope} - ${d.finishType})`,
      unit: "SQFT",
      engQty: totalPaintArea,
      procQty: totalPaintArea,
      rate: labourRate.rate,
      rateFound: labourRate.found,
      amount: labourCost
    });

    return {
      grossWallArea,
      totalOpeningArea,
      netWallArea,
      ceilingArea,
      totalPaintArea,
      grandMatCost,
      grandLabCost: labourCost,
      grandTotal,
      costPerSqft,
      resultItems,
      unpricedCount,
      unpricedList
    };
  }, [detailedInputs, openings, specialPaints, puttyRate, primerRate, labourRate, enamelRate]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun(() => {
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
      XLSX.utils.book_append_sheet(wb, ws, "Paint Estimation Results");
      XLSX.writeFile(wb, `BuildMitra_Paint_Calculator_${calcMode}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun(() => {
      const res = calcMode === 'quick' ? quickCalcResults : detailedCalcResults;
      const msg = `*BuildMitra Paint Calculator Report*%0A` +
        `*Estimation Mode*: ${calcMode === 'quick' ? 'Quick Calculation' : 'Detailed Wall-Wise Calculation'}%0A` +
        `----------------------------------------%0A` +
        `• *Paint Area*: ${formatNumber(calcMode === 'quick' ? quickCalcResults.paintableArea : detailedCalcResults.totalPaintArea)} Sqft%0A` +
        `• *Mat. Cost (₹)*: ${formatCurrency(res.grandMatCost)}%0A` +
        `• *Labour (₹)*: ${formatCurrency(res.grandLabCost)}%0A` +
        `• *TOTAL ESTIMATED COST*: ${formatCurrency(res.grandTotal)} (${formatCurrency(res.costPerSqft)}/Sqft)%0A%0A` +
        `*Generated via BuildMitra Professional Estimator*`;
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
          Paint Calculator
          <span style={styles.badge}>IS 2395 / IS 5410 Compliant</span>
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
          <option value="quick">Quick Calculation (Estimate from Total Surface or Built-Up Area)</option>
          <option value="detailed">Detailed Wall-Wise Calculation (Exact Room & Opening Measurements)</option>
        </select>
      </div>
        </div>
        <div className="engineering-specimen-top">
      <EngineeringSpecimen kind="paint" title="Dynamic Paint Surface Specimen" material={calcMode === 'quick' ? quickInputs.paintType : detailedInputs.paintType} data={calcMode === 'quick' ? { lengthFt: Math.sqrt(quickInputs.totalArea), heightFt: Math.sqrt(quickInputs.totalArea), type: quickInputs.paintType } : { lengthFt: detailedInputs.length, heightFt: detailedInputs.height, type: detailedInputs.paintType }} />
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
              <span>⚡ Quick Paint Calculation Inputs</span>
            </div>

            <div style={styles.noteBox}>
              💡 <strong>IS 2395 Recommendations & Standards</strong>:
              <br />• <strong>External Painting</strong>: Exterior Weatherproof Primer + Exterior Weatherproof Emulsion.
              <br />• <strong>Internal Painting</strong>: Interior Putty (2 Coats ~0.10 kg/sqft) + Interior Primer + Acrylic / Royal Emulsion.
            </div>

            <div style={styles.grid3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Painting Location / Scope</label>
                <select
                  style={{ ...styles.select, border: '2px solid #0f766e', backgroundColor: '#f0fdfa', fontWeight: '700' }}
                  value={quickInputs.locationScope}
                  onChange={e => handleQuickLocationChange(e.target.value)}
                >
                  <option value="Internal Painting">Internal Painting (Interior Putty + Primer + Emulsion)</option>
                  <option value="External Painting">External Painting (Exterior Weatherproof Primer + Emulsion)</option>
                  <option value="Both (Internal & External)">Both Internal & External Combined (75% Int / 25% Ext)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Area Type Reference</label>
                <select
                  style={styles.select}
                  value={quickInputs.areaType}
                  onChange={e => setQuickInputs({ ...quickInputs, areaType: e.target.value })}
                >
                  <option value="Net Paintable Surface Area">Net Paintable Surface Area (Sqft)</option>
                  <option value="Built-Up / Floor Area">Total Built-Up / Floor Area (Sqft)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Area Input (Sqft)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={quickInputs.totalArea}
                  onChange={e => setQuickInputs({ ...quickInputs, totalArea: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Finish Type</label>
                <select
                  style={styles.select}
                  value={quickInputs.finishType}
                  onChange={e => setQuickInputs({ ...quickInputs, finishType: e.target.value })}
                >
                  <option value="Fresh Coat">Fresh Coat (Putty + Primer + Paint)</option>
                  <option value="Repaint">Repaint (Primer + Paint)</option>
                  <option value="One Coat Touch-up">One Coat Touch-up (Paint Only)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Main Paint Selection</label>
                <select
                  style={styles.select}
                  value={quickInputs.paintType}
                  onChange={e => setQuickInputs({ ...quickInputs, paintType: e.target.value })}
                >
                  <option value="Regular Emulsion">Regular Acrylic Emulsion</option>
                  <option value="Exterior Weatherproof Paint">Exterior Weatherproof Paint</option>
                  <option value="Premium / Royal Paint">Premium / Royal Luxury Emulsion</option>
                  <option value="Enamel Paint">Enamel / Oil Paint</option>
                  <option value="Ceiling Paint">Ceiling White Paint</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Primer Coats</label>
                <select
                  style={styles.select}
                  value={quickInputs.primerCoats}
                  onChange={e => setQuickInputs({ ...quickInputs, primerCoats: parseInt(e.target.value) })}
                >
                  <option value={1}>1 Coat Primer</option>
                  <option value={2}>2 Coats Primer</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Paint Coats</label>
                <select
                  style={styles.select}
                  value={quickInputs.paintCoats}
                  onChange={e => setQuickInputs({ ...quickInputs, paintCoats: parseInt(e.target.value) })}
                >
                  <option value={1}>1 Coat Paint</option>
                  <option value={2}>2 Coats Paint</option>
                  <option value={3}>3 Coats Paint</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button style={styles.btnReset} onClick={handleResetQuick}>🔄 Reset Quick Form</button>
            </div>
          </div>

          {/* Quick Results Summary & BOQ */}
          <div style={styles.stepperCard}>
            <div style={styles.sectionHeader}>
              <span>📊 Paint Calculation Results & Materials BOQ</span>
            </div>

            {quickCalcResults.unpricedCount > 0 ? (
              <div style={styles.warnBanner}>
                ⚠️ Partial Estimate: Admin Rate (₹)s unavailable for: {quickCalcResults.unpricedList.join(', ')}.
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '700' }}>
                ✓ Complete Estimate: All rates verified against BuildMitra Admin Master Database.
              </div>
            )}

            {/* Summary Metric Cards */}
            <div style={styles.summaryGrid}>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Paint Area</span>
                <span style={styles.metricVal}>{formatNumber(quickCalcResults.paintableArea)} Sqft</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                <span style={styles.metricTitle}>Mat. Cost (₹)</span>
                <span style={styles.metricVal}>{formatCurrency(quickCalcResults.grandMatCost)}</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                <span style={styles.metricTitle}>Labour (₹)</span>
                <span style={styles.metricVal}>{formatCurrency(quickCalcResults.grandLabCost)}</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                <span style={styles.metricTitle}>Grand Total (₹)</span>
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
            <span>📐 Detailed Wall-Wise Paint Calculation Inputs</span>
          </div>

          <div style={styles.grid4}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Painting Location Scope</label>
              <select
                style={{ ...styles.select, border: '2px solid #0f766e', backgroundColor: '#f0fdfa', fontWeight: '700' }}
                value={detailedInputs.locationScope}
                onChange={e => handleDetailedLocationChange(e.target.value)}
              >
                <option value="Internal Painting">Internal Painting (Interior Putty + Primer + Emulsion)</option>
                <option value="External Painting">External Painting (Exterior Weatherproof Primer + Emulsion)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Finish Type</label>
              <select
                style={styles.select}
                value={detailedInputs.finishType}
                onChange={e => setDetailedInputs({ ...detailedInputs, finishType: e.target.value })}
              >
                <option value="Fresh Coat">Fresh Coat (Putty + Primer + Paint)</option>
                <option value="Repaint">Repaint (Primer + Paint)</option>
                <option value="One Coat Touch-up">One Coat Touch-up (Paint Only)</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Main Paint Selection</label>
              <select
                style={styles.select}
                value={detailedInputs.paintType}
                onChange={e => setDetailedInputs({ ...detailedInputs, paintType: e.target.value })}
              >
                <option value="Regular Emulsion">Regular Acrylic Emulsion</option>
                <option value="Exterior Weatherproof Paint">Exterior Weatherproof Paint</option>
                <option value="Premium / Royal Paint">Premium / Royal Luxury Emulsion</option>
                <option value="Enamel Paint">Enamel / Oil Paint</option>
              </select>
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
              <label style={styles.label}>Number of Walls (Nos)</label>
              <input
                type="number"
                style={styles.input}
                value={detailedInputs.wallNos}
                onChange={e => setDetailedInputs({ ...detailedInputs, wallNos: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Include Ceiling</label>
              <select
                style={styles.select}
                value={String(detailedInputs.includeCeiling)}
                onChange={e => setDetailedInputs({ ...detailedInputs, includeCeiling: e.target.value === 'true' })}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Primer Coats</label>
              <select
                style={styles.select}
                value={detailedInputs.primerCoats}
                onChange={e => setDetailedInputs({ ...detailedInputs, primerCoats: parseInt(e.target.value) })}
              >
                <option value={1}>1 Coat</option>
                <option value={2}>2 Coats</option>
              </select>
            </div>
          </div>

          {/* Openings Section */}
          <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f766e', marginBottom: '8px' }}>🚪 Openings (Doors & Windows Deduction & Enamel Paint)</div>
            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Type</label>
                <select style={styles.select} value={openingInput.type} onChange={e => setOpeningInput({ ...openingInput, type: e.target.value })}>
                  <option value="Door">Door</option>
                  <option value="Window">Window</option>
                  <option value="Ventilation">Ventilation</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Width (Ft)</label>
                <input type="number" style={styles.input} value={openingInput.width} onChange={e => setOpeningInput({ ...openingInput, width: parseFloat(e.target.value) || 0 })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Height (Ft)</label>
                <input type="number" style={styles.input} value={openingInput.height} onChange={e => setOpeningInput({ ...openingInput, height: parseFloat(e.target.value) || 0 })} />
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
                      <th style={styles.th}>Area</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openings.map((o, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{o.type}</td>
                        <td style={styles.td}>{o.width}' x {o.height}'</td>
                        <td style={styles.td}>{o.nos}</td>
                        <td style={styles.td}><strong>{formatNumber(o.area)} Sqft</strong></td>
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

          {/* Special / Design Paints Section */}
          <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f766e', marginBottom: '8px' }}>🎨 Special / Texture Design Paints</div>
            <div style={styles.grid3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Design Type</label>
                <select style={styles.select} value={specialInput.type} onChange={e => setSpecialInput({ ...specialInput, type: e.target.value })}>
                  <option value="Texture">Texture Finish Paint</option>
                  <option value="Royal">Royal Luxury Paint</option>
                  <option value="Design">Design / Stencil Paint</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Area (Sqft)</label>
                <input type="number" style={styles.input} value={specialInput.area} onChange={e => setSpecialInput({ ...specialInput, area: parseFloat(e.target.value) || 0 })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button style={styles.btnPrimary} onClick={handleAddSpecialPaint}>+ Add Special Paint</button>
              </div>
            </div>

            {specialPaints.length > 0 && (
              <div style={{ marginTop: '10px', ...styles.tableContainer }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Design Type</th>
                      <th style={styles.th}>Area</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialPaints.map((sp, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{sp.type} Paint</td>
                        <td style={styles.td}><strong>{formatNumber(sp.area)} Sqft</strong></td>
                        <td style={styles.td}>
                          <button style={styles.btnDanger} onClick={() => handleRemoveSpecialPaint(idx)}>Remove</button>
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
              <span>📊 Detailed Paint Calculation Results & Materials BOQ</span>
            </div>

            {detailedCalcResults.unpricedCount > 0 ? (
              <div style={styles.warnBanner}>
                ⚠️ Partial Estimate: Admin Rate (₹)s unavailable for: {detailedCalcResults.unpricedList.join(', ')}.
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '700' }}>
                ✓ Complete Estimate: All rates verified against BuildMitra Admin Master Database.
              </div>
            )}

            <div style={styles.summaryGrid}>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Paint Area</span>
                <span style={styles.metricVal}>{formatNumber(detailedCalcResults.totalPaintArea)} Sqft</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                <span style={styles.metricTitle}>Mat. Cost (₹)</span>
                <span style={styles.metricVal}>{formatCurrency(detailedCalcResults.grandMatCost)}</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                <span style={styles.metricTitle}>Labour (₹)</span>
                <span style={styles.metricVal}>{formatCurrency(detailedCalcResults.grandLabCost)}</span>
              </div>
              <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                <span style={styles.metricTitle}>Grand Total (₹)</span>
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
              <button style={styles.btnSecondary} onClick={handleExportExcel}>📥 Export BOQ to Excel</button>
              <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share Estimate on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}














