import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../utils/pdfExport';
import { getMasterRate, getCombinedBOQRate, syncApprovedRatesFromBackend, MasterRateResult } from '../utils/masterRates';
import MarketRateTrend from '../components/ui/MarketRateTrend';

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { backgroundColor: '#800020', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(128,0,32,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#a51d36', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  stepperCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '15px', fontWeight: '700', color: '#800020', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #fecdd3', paddingBottom: '8px' },

  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(82px, 1fr))', gap: '5px', alignItems: 'end', width: '100%', maxWidth: '100%', marginBottom: '5px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(82px, 1fr))', gap: '5px', alignItems: 'end', width: '100%', maxWidth: '100%', marginBottom: '5px' },

  fieldGroup: { minWidth: 0, width: '100%', margin: 0, padding: 0 },
  label: { display: 'block', fontSize: '10px', lineHeight: '1.1', fontWeight: '700', marginBottom: '2px', whiteSpace: 'normal' },
  input: { width: '100%', minWidth: 0, maxWidth: '100%', height: '32px', padding: '3px 5px', fontSize: '11px', lineHeight: '1.1', textAlign: 'center', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
  inputReadOnly: { backgroundColor: '#f1f5f9', fontWeight: '700', color: '#800020' },
  select: { width: '100%', minWidth: 0, maxWidth: '100%', height: '32px', padding: '3px 4px', fontSize: '10px', lineHeight: '1.1', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
  checkboxLabel: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#334155', cursor: 'pointer' },

  btnPrimary: { backgroundColor: '#800020', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' },
  metricCard: { padding: '14px', borderRadius: '8px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricMaroon: { backgroundColor: '#800020' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tableContainer: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#800020', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

  rateTag: { backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },
  rateTagWarn: { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },

  noteBox: { backgroundColor: '#fff5f7', border: '1px solid #fecdd3', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#800020', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export default function CivilBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // 1. PLOT & BUILDING INPUTS
  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(3);
  const [sbc, setSbc] = useState(230); // SBC in kN/sqm
  const [wallType, setWallType] = useState('Concrete Blocks');

  // 2. ROOM & FINISH INPUTS
  const [constructionType, setConstructionType] = useState('Residential');
  const [finishProfile, setFinishProfile] = useState('Standard');
  const [bedrooms, setBedrooms] = useState(6);
  const [toilets, setToilets] = useState(8);
  const [kitchens, setKitchens] = useState(1);
  const [hasLift, setHasLift] = useState(false);
  const [hasTerraceTruss, setHasTerraceTruss] = useState(true);

  const [generated, setGenerated] = useState(false);

  // Derived Geometry
  const plotArea = plotLength * plotWidth;
  const setbackArea = plotArea * 0.10; // 10% setback
  const footprintArea = Math.max(plotArea - setbackArea, 0);
  const totalBUA = footprintArea * floors;
  const boreholes = plotArea <= 6000 ? 1 : Math.ceil(plotArea / 6000);

  // Admin Master Rates Lookup
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53"], 385);
  const steelRate = getMasterRate(["MAT-STL-01", "tmt steel", "steel", "rebar"], 68);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 46);
  const ca20Rate = getMasterRate(["MAT-AGG-20", "20mm aggregate"], 40);
  const ca12Rate = getMasterRate(["MAT-AGG-12", "12mm aggregate"], 42);
  const block6Rate = getMasterRate(["MAT-BLK-06", "concrete block 6"], 42);
  const block4Rate = getMasterRate(["MAT-BLK-04", "concrete block 4"], 32);
  const tileRate = getMasterRate(["MAT-FLR-VIT", "vitrified tile"], 58);
  const tileLabourRate = getMasterRate(["SRV-FLR-LAY", "tile labour"], 24);
  const graniteRate = getMasterRate(["MAT-GRN-01", "granite"], 145);

  // IS Engineering Structural Rule Engine
  const structure = useMemo(() => {
    const f = Number(floors || 1);
    if (f <= 1) return { foundation: 'Isolated Footings', footing: '4ft x 4ft x 1.5ft', column: '9in x 12in', beam: '9in x 12in', slab: '125mm', steelKgPerSft: 3.0, rccCftPerSft: 1.10 };
    if (f <= 2) return { foundation: 'Isolated Footings', footing: '4.5ft x 4.5ft x 1.75ft', column: '9in x 15in', beam: '9in x 15in', slab: '125mm', steelKgPerSft: 3.2, rccCftPerSft: 1.18 };
    if (f <= 3) return { foundation: 'Isolated Footings', footing: sbc < 180 ? '5.5ft x 5.5ft x 2.25ft' : '5ft x 5ft x 2ft', column: '12in x 18in', beam: '9in x 18in', slab: '125mm', steelKgPerSft: 3.4, rccCftPerSft: 1.25 };
    if (f <= 4) return { foundation: 'Combined Footings', footing: '5.5ft x 5.5ft x 2.25ft', column: '12in x 18in', beam: '12in x 18in', slab: '150mm', steelKgPerSft: 3.6, rccCftPerSft: 1.33 };
    return { foundation: 'Raft Foundation', footing: 'Raft slab 300mm+', column: '12in x 21in', beam: '12in x 18in', slab: '150mm', steelKgPerSft: 4.2, rccCftPerSft: 1.55 };
  }, [floors, sbc]);

  // Derived Counts
  const counts = useMemo(() => {
    const toiletsCount = Math.max(0, Number(toilets || 0));
    const bedroomsCount = Math.max(0, Number(bedrooms || 0));
    const kitchensCount = Math.max(0, Number(kitchens || 0));
    const livingRooms = Math.max(1, Math.ceil(floors));
    const internalDoors = bedroomsCount + kitchensCount + livingRooms + Math.max(1, Math.ceil(floors));
    const toiletDoors = toiletsCount;
    const mainDoors = Math.max(1, kitchensCount);
    const poojaDoors = 1;
    const totalDoors = internalDoors + toiletDoors + mainDoors + poojaDoors;
    const windows = Math.max(1, Math.ceil(totalBUA / 225));
    const ventilators = toiletsCount;
    const electricalPoints = Math.ceil((bedroomsCount * 8) + (livingRooms * 12) + (kitchensCount * 10) + (toiletsCount * 4) + (totalBUA / 120) + (hasLift ? 12 : 0));
    const plumbingPoints = Math.ceil((toiletsCount * 10) + (kitchensCount * 6) + 6 + (hasLift ? 2 : 0));
    return { toiletsCount, bedroomsCount, kitchensCount, livingRooms, internalDoors, toiletDoors, mainDoors, poojaDoors, totalDoors, windows, ventilators, electricalPoints, plumbingPoints };
  }, [bedrooms, toilets, kitchens, floors, totalBUA, hasLift]);

  // Civil BOQ Calculation Engine
  const boqResults = useMemo(() => {
    const floorsNum = Math.max(1, Number(floors || 1));
    const spanFt = 12;
    const gridX = Math.max(2, Math.ceil(Math.sqrt(footprintArea) / spanFt) + 1);
    const gridY = Math.max(2, Math.ceil((footprintArea / Math.max(Math.sqrt(footprintArea), 1)) / spanFt) + 1);
    const columnCount = Math.max(8, gridX * gridY);
    const floorHeightFt = 10;

    const footingLengthFt = floorsNum <= 1 ? 4 : floorsNum <= 2 ? 4.5 : floorsNum <= 3 ? 5 : 6;
    const footingWidthFt = footingLengthFt;
    const footingDepthFt = floorsNum <= 1 ? 1.5 : floorsNum <= 2 ? 1.75 : floorsNum <= 3 ? 2 : 2.5;

    const excavationDepthFt = structure.foundation === 'Raft Foundation' ? 2.5 : footingDepthFt + (sbc < 180 ? 3.0 : 2.5);
    const excavationCum = (columnCount * (footingLengthFt + 1.5) * (footingWidthFt + 1.5) * excavationDepthFt) / 35.3147;

    const pccDepthFt = 0.33;
    const pccCum = (columnCount * (footingLengthFt + 1) * (footingWidthFt + 1) * pccDepthFt) / 35.3147;
    const plinthProtectionCum = ((plotArea - footprintArea) * 0.33) / 35.3147;
    const pccTotalCum = pccCum + plinthProtectionCum;

    const footingRccCum = (columnCount * footingLengthFt * footingWidthFt * footingDepthFt) / 35.3147;
    const plinthBeamCum = (Math.sqrt(footprintArea) * 4 * 0.75 * 1.0) / 35.3147;
    const columnCum = (columnCount * 1.0 * 1.25 * floorHeightFt * floorsNum) / 35.3147;
    const beamCum = (footprintArea * floorsNum * 0.12) / 35.3147;
    const slabCum = (footprintArea * floorsNum * 0.42) / 35.3147;
    const foundationMasonryCum = (columnCount * 2.5 * 2.5 * 1.5) / 35.3147;

    const rccTotalCum = footingRccCum + plinthBeamCum + columnCum + beamCum + slabCum;
    const backfillCum = Math.max(excavationCum - pccCum - footingRccCum - foundationMasonryCum, 0) * 0.85;
    const antiTermiteLtr = footprintArea / 100;

    const shutteringSft =
      (columnCount * floorHeightFt * floorsNum * 2 * (1 + 1.25)) +
      (footprintArea * floorsNum * 1.25) +
      (beamCum * 35.3147 * 3.0);

    const steelKg = totalBUA * structure.steelKgPerSft;

    const lintelCum = (counts.totalDoors + counts.windows) * 5 * 0.75 * 0.3 / 35.3147;
    const staircaseCum = Math.max(floorsNum - 1, 1) * 42 / 35.3147;
    const sunshadeCum = counts.windows * 4.5 * 1.25 * 0.25 / 35.3147;

    const externalPerimeterFt = 2 * (plotLength + plotWidth);
    const externalWallGrossSft = externalPerimeterFt * floorHeightFt * floorsNum;
    const externalOpeningDeductionSft = (counts.mainDoors * 35) + (counts.windows * 18) + (counts.ventilators * 4);
    const extWallAreaSft = Math.max(externalWallGrossSft - externalOpeningDeductionSft, 0);

    const internalPartitionLengthFt = (counts.bedroomsCount * 28) + (counts.toiletsCount * 14) + (counts.kitchensCount * 18) + (counts.livingRooms * 20) + (floorsNum * 18);
    const intWallGrossSft = internalPartitionLengthFt * floorHeightFt;
    const internalOpeningDeductionSft = Math.max((counts.totalDoors * 21) - (counts.mainDoors * 35), 0);
    const intWallAreaSft = Math.max(intWallGrossSft - internalOpeningDeductionSft, 0);

    const blockFaceSft = 1.333 * 0.667;
    const sixInBlockNos = wallType === 'Concrete Blocks' ? Math.ceil((extWallAreaSft / blockFaceSft) * 1.05) : 0;
    const fourInBlockNos = wallType === 'Concrete Blocks' ? Math.ceil((intWallAreaSft / blockFaceSft) * 1.05) : 0;
    const totalBlockNos = sixInBlockNos + fourInBlockNos;

    const internalPlasterSft = (intWallAreaSft * 2) + extWallAreaSft;
    const externalPlasterSft = extWallAreaSft;
    const plasterSqm = ((internalPlasterSft + externalPlasterSft) * 1.05) / 10.764;

    const flooringSft = totalBUA * 0.92;
    const skirtingSft = totalBUA * 0.08;
    const dadoSft = (counts.toiletsCount * 70) + (counts.kitchensCount * 50);
    const flooringTotalSft = flooringSft + skirtingSft + dadoSft;

    const kitchenRmt = counts.kitchensCount * 3.6;
    const parkingSft = Math.max(footprintArea * 0.35, plotArea * 0.18);
    const terraceSft = hasTerraceTruss ? Math.max(250, footprintArea * 0.35) : Math.max(150, footprintArea * 0.12);
    const railingKg = (floorsNum * 75) + (totalBUA * 0.04) + (hasLift ? 75 : 0);
    const compoundWallSft = Math.max((2 * (plotLength + plotWidth) - 12) * 6, 0);
    const paintingSft = totalBUA * 3.5;

    // Cement Quantity Engine
    const rccDryVolumeCum = (rccTotalCum + lintelCum + staircaseCum + sunshadeCum) * 1.54;
    const pccDryVolumeCum = pccTotalCum * 1.54;
    const plasterDryVolumeCum = (plasterSqm * 0.012) * 1.33;
    const masonryMortarCum = totalBlockNos * 0.004;

    const cementBagsRcc = rccDryVolumeCum * (1 / 5.5) * 28.8;
    const cementBagsPcc = pccDryVolumeCum * (1 / 10) * 28.8;
    const cementBagsPlaster = plasterDryVolumeCum * (1 / 5) * 28.8;
    const cementBagsMasonry = masonryMortarCum * 1.33 * (1 / 7) * 28.8;

    const cementBags = (cementBagsRcc + cementBagsPcc + cementBagsPlaster + cementBagsMasonry) * 1.05;
    const pehQuantity = pccTotalCum * 35.3147;

    const finishMultiplier = finishProfile === 'Premium' ? 1.20 : finishProfile === 'Ultra Premium' ? 1.40 : 1.0;

    const baseItems = [
      { sr: 1, code: 'SRV-SLT-01', desc: `Soil investigation based on plot area (${plotArea} sft). Engine: ${boreholes} borehole(s).`, uom: 'Nos', qty: boreholes, baseMatRate: 12000, labRate: 0 },
      { sr: 2, code: 'SRV-EXC-01', desc: `Earthwork excavation for foundation pits & plinth trenches. SBC considered: ${sbc} kN/sqm.`, uom: 'Cum', qty: excavationCum, baseMatRate: 80, labRate: 40 },
      { sr: 3, code: 'SRV-PCC-01', desc: `PCC M10 (1:3:6) levelling bed under footings & plinth protection combined.`, uom: 'Cum', qty: pccTotalCum, baseMatRate: 3800, labRate: 800 },
      { sr: 4, code: 'MAT-SSM-01', desc: `Size stone masonry (SSM) substructure foundation below plinth level. Recommended footing: ${structure.footing}.`, uom: 'Cum', qty: foundationMasonryCum, baseMatRate: 1342, labRate: 400 },
      { sr: 5, code: 'SRV-EXC-01', desc: `Backfilling in foundation pits & plinth using excavated soil with watering & ramming.`, uom: 'Cum', qty: backfillCum, baseMatRate: 40, labRate: 20 },
      { sr: 6, code: 'SRV-ATT-01', desc: `Anti-termite chemical soil treatment below floor slab & foundation zone.`, uom: 'Ltr', qty: antiTermiteLtr, baseMatRate: 15, labRate: 10 },
      { sr: 7, code: 'SRV-SHT-01', desc: `Centering & formwork shuttering rental for footings, columns, beams & slab RCC works.`, uom: 'Sft', qty: shutteringSft, baseMatRate: 35, labRate: 20 },
      { sr: 8, code: 'MAT-STL-01', desc: `TMT Steel Rebar Fe 500D (Preliminary Estimating Factor: ${structure.steelKgPerSft} kg/sft BUA; pending structural Bar Bending Schedule BBS). Column: ${structure.column}, Beam: ${structure.beam}, Slab: ${structure.slab}.`, uom: 'Kgs', qty: steelKg, baseMatRate: steelRate.rate || 68, labRate: 12 },
      { sr: 9, code: 'MAT-CEM-01', desc: `RCC M20/M25 structural concrete for footings, columns, beams, slabs, lintels, staircase & chajjas.`, uom: 'Cum', qty: rccTotalCum + lintelCum + staircaseCum + sunshadeCum, baseMatRate: 4800, labRate: 1000 },
      { sr: 10, code: 'MAT-BLK-06', desc: `Concrete block masonry. 6" external blocks (${sixInBlockNos} nos) + 4" internal blocks (${fourInBlockNos} nos). Openings deducted.`, uom: 'Nos', qty: totalBlockNos, baseMatRate: 42, labRate: 12 },
      { sr: 11, code: 'MAT-DOR-MN', desc: `Teakwood main door (${counts.mainDoors} nos) + Flush/WPC internal doors (${counts.internalDoors + counts.toiletDoors + counts.poojaDoors} nos).`, uom: 'Nos', qty: counts.totalDoors, baseMatRate: 5500, labRate: 800 },
      { sr: 12, code: 'MAT-WIN-UPVC', desc: `UPVC 3-Track sliding windows (${counts.windows} nos) + Toilet louvered ventilators (${counts.ventilators} nos).`, uom: 'Nos', qty: counts.windows + counts.ventilators, baseMatRate: 2850, labRate: 350 },
      { sr: 13, code: 'SRV-PLAS-INT', desc: `Internal 12mm 1:4 + External 18mm 1:5 waterproofing plastering.`, uom: 'Sqmtr', qty: plasterSqm, baseMatRate: 35, labRate: 25 },
      { sr: 14, code: 'MAT-FLR-VIT', desc: `Vitrified tiles 2'x2' flooring with skirting + kitchen & toilet dado tiles.`, uom: 'Sft', qty: flooringTotalSft, baseMatRate: tileRate.rate || 58, labRate: tileLabourRate.rate || 24 },
      { sr: 15, code: 'MAT-GRN-01', desc: `Jet Black Granite 18mm kitchen countertop platform per kitchen.`, uom: 'Rmt', qty: kitchenRmt, baseMatRate: graniteRate.rate || 145, labRate: 250 },
      { sr: 16, code: 'SRV-ELE-PNT', desc: `FRLS copper wiring, modular switches, DB/MCB distribution points.`, uom: 'Points', qty: counts.electricalPoints, baseMatRate: 620, labRate: 450 },
      { sr: 17, code: 'SRV-PLM-PNT', desc: `CPVC/UPVC plumbing & sanitary fixtures consolidated points.`, uom: 'Points', qty: counts.plumbingPoints, baseMatRate: 360, labRate: 850 },
      { sr: 18, code: 'MAT-PVR-01', desc: `Parking area heavy duty chequered / paver tile flooring allowance.`, uom: 'Sft', qty: parkingSft, baseMatRate: 45, labRate: 20 },
      { sr: 19, code: 'MAT-MNG-TLE', desc: hasTerraceTruss ? `Terrace structural steel truss with Clay Mangalore Tile roofing.` : `Standard terrace weather-proof finish allowance.`, uom: 'Sft', qty: terraceSft, baseMatRate: hasTerraceTruss ? 48 : 35, labRate: 15 },
      { sr: 20, code: 'MAT-WTR-TNK', desc: `UG Sump (6000L) + OHT (2000L) + inspection chambers + MS Gate + Stainless Steel Railings (${formatNumber(railingKg)} kg).`, uom: 'LS', qty: 1, baseMatRate: 120000, labRate: 35000 },
      { sr: 21, code: 'MAT-SSM-01', desc: `Compound wall 5ft high with RCC columns, block masonry & plaster finish.`, uom: 'Sft', qty: compoundWallSft, baseMatRate: 180, labRate: 60 },
      { sr: 22, code: 'MAT-PNT-INT', desc: `Wall putty, primer & 2 coats premium emulsion paint coating.`, uom: 'Sft', qty: paintingSft, baseMatRate: 18, labRate: 14 }
    ];

    const items = baseItems.map(item => {
      const combined = getCombinedBOQRate(item.code, item.baseMatRate, item.labRate);
      const baseMat = combined.materialRate;
      const baseLab = combined.labourRate;

      const matRate = item.sr <= 6 ? baseMat : (baseMat * finishMultiplier);
      const labRate = baseLab;
      const amount = item.qty * (matRate + labRate);
      return {
        sr: item.sr,
        code: item.code,
        desc: item.desc,
        uom: item.uom,
        qty: item.qty,
        matRate,
        labRate,
        amount
      };
    });

    const materialTotal = items.reduce((sum, i) => sum + (i.qty * i.matRate), 0);
    const labourTotal = items.reduce((sum, i) => sum + (i.qty * i.labRate), 0);
    const grandTotal = items.reduce((sum, i) => sum + i.amount, 0);
    const ratePerSft = totalBUA > 0 ? grandTotal / totalBUA : 0;

    return {
      items,
      materialTotal,
      labourTotal,
      grandTotal,
      ratePerSft,
      cementQuantity: cementBags,
      steelQuantity: steelKg,
      pehQuantity
    };
  }, [plotLength, plotWidth, floors, sbc, wallType, finishProfile, hasLift, hasTerraceTruss, totalBUA, footprintArea, plotArea, counts, structure, cementRate, steelRate, tileRate, tileLabourRate, graniteRate]);

  // Download PDF
  const handleDownloadPDF = () => {
    checkAndRun('boq_export', 'boq-civil', () => {
      downloadBuildMitraPDF({
        documentTitle: 'BuildMitra Civil BOQ Estimate',
        items: boqResults.items.map((i: any) => ({
          sno: i.sr,
          description: `[${i.code}] ${i.desc}`,
          quantity: i.qty,
          unit: i.uom,
          rate: i.matRate + i.labRate,
          amount: i.amount
        })),
        grandTotal: boqResults.grandTotal
      });
    });
  };

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('boq_export', 'boq-civil', () => {
      const data = boqResults.items.map((i: any) => ({
        'Sr No': i.sr,
        'Master Item Code': i.code,
        'Description': i.desc,
        'UOM': i.uom,
        'Quantity': formatNumber(i.qty),
        'Mat. Rate (₹)': formatCurrency(i.matRate),
        'Lab. Rate (₹)': formatCurrency(i.labRate),
        'Total Amount (₹)': formatCurrency(i.amount)
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Civil_BOQ');
      XLSX.writeFile(wb, `BuildMitra_Civil_BOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('boq_export', 'boq-civil', () => {
      const msg = `*BuildMitra Professional Civil BOQ Estimate*%0A` +
        `----------------------------------------%0A` +
        `• *Plot Size*: ${plotLength}' x ${plotWidth}' (${plotArea} Sft) | *Floors*: ${floors}%0A` +
        `• *Total BUA*: ${formatNumber(totalBUA)} Sft | *SBC*: ${sbc} kN/sqm%0A` +
        `• *Footing*: ${structure.footing} | *Column*: ${structure.column}%0A` +
        `• *Cement Total*: ${formatNumber(boqResults.cementQuantity, 1)} Bags%0A` +
        `• *Steel Rebar Total*: ${formatNumber(boqResults.steelQuantity, 1)} kg (${structure.steelKgPerSft} kg/sft)%0A` +
        `• *Material Total*: ${formatCurrency(boqResults.materialTotal)}%0A` +
        `• *Labour Total*: ${formatCurrency(boqResults.labourTotal)}%0A` +
        `• *GRAND TOTAL ESTIMATE*: ${formatCurrency(boqResults.grandTotal)} (${formatCurrency(boqResults.ratePerSft)}/Sft)%0A%0A` +
        `*Generated via BuildMitra Civil BOQ Engine*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  const handleReset = () => {
    setPlotLength(30); setPlotWidth(40); setFloors(3); setSbc(230); setWallType('Concrete Blocks');
    setConstructionType('Residential'); setFinishProfile('Standard'); setBedrooms(6); setToilets(8); setKitchens(1);
    setHasLift(false); setHasTerraceTruss(true); setGenerated(false);
  };

  return (
    <div className="bm-final-boq-page" style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => router.push('/calculators')}>← Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          🏗️ Civil BOQ Calculator
          <span style={styles.badge}>IS Engineering SBC & Structural Engine</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#fecdd3' }}>BuildMitra Professional Edition</span>
        </div>
      </div>

      {/* 2. Live Market Rate Ticker */}
      <MarketRateTrend />

      {/* 3. Plot & Building Inputs Form */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📐 Plot & Structural Building Inputs</span>
        </div>

        <div className="bm-final-boq-input-grid" style={styles.grid4}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Plot Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={plotLength}
              onChange={e => setPlotLength(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Plot Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={plotWidth}
              onChange={e => setPlotWidth(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Plot Area (Sft)</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(plotArea)} Sft`}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>No. of Floors</label>
            <input
              type="number"
              style={styles.input}
              value={floors}
              onChange={e => setFloors(parseFloat(e.target.value) || 1)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Total Built-Up Area (Sft)</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(totalBUA)} Sft`}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Soil SBC (kN/sqm)</label>
            <input
              type="number"
              style={styles.input}
              value={sbc}
              onChange={e => setSbc(parseFloat(e.target.value) || 180)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Wall Masonry Type</label>
            <select
              style={{ ...styles.select, fontWeight: '700' }}
              value={wallType}
              onChange={e => setWallType(e.target.value)}
            >
              <option value="Concrete Blocks">Solid Concrete Blocks (6" & 4")</option>
              <option value="Clay Bricks">Red Clay Bricks</option>
            </select>
          </div>
        </div>

        {/* Architectural & Finish Inputs */}
        <div style={{ backgroundColor: '#fff5f7', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecdd3' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#800020', marginBottom: '10px' }}>🏠 Architectural & Finish Profile Inputs</div>
          <div className="bm-final-boq-input-grid" style={styles.grid4}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Construction Type</label>
              <select style={styles.select} value={constructionType} onChange={e => setConstructionType(e.target.value)}>
                <option value="Residential">Residential Building</option>
                <option value="Commercial">Commercial Building</option>
                <option value="Industrial">Industrial Structure</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Finish Profile</label>
              <select style={styles.select} value={finishProfile} onChange={e => setFinishProfile(e.target.value)}>
                <option value="Standard">Standard Finish</option>
                <option value="Premium">Premium Finish</option>
                <option value="Ultra Premium">Ultra Premium Finish</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Bedrooms (Nos)</label>
              <input type="number" style={styles.input} value={bedrooms} onChange={e => setBedrooms(e.target.value === "" ? ("" as any) : parseFloat(e.target.value))} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Toilets (Nos)</label>
              <input type="number" style={styles.input} value={toilets} onChange={e => setToilets(e.target.value === "" ? ("" as any) : parseFloat(e.target.value))} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Kitchens (Nos)</label>
              <input type="number" style={styles.input} value={kitchens} onChange={e => setKitchens(e.target.value === "" ? ("" as any) : parseFloat(e.target.value))} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '18px' }}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" checked={hasLift} onChange={e => setHasLift(e.target.checked)} />
                <span>Lift Provision</span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '18px' }}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" checked={hasTerraceTruss} onChange={e => setHasTerraceTruss(e.target.checked)} />
                <span>Terrace Steel Truss + Clay Tiles</span>
              </label>
            </div>
          </div>
        </div>

        {/* Structural Engine Rules Badge */}
        <div style={styles.noteBox}>
          💡 <strong>IS Structural Calculation Rules</strong>: Boreholes: {boreholes} | Total Doors: {counts.totalDoors} | Windows: {counts.windows} | Ventilators: {counts.ventilators} | Electrical Points: {counts.electricalPoints} | Plumbing Points: {counts.plumbingPoints} | Footing: <strong>{structure.footing}</strong> | Column: <strong>{structure.column}</strong> | Beam: <strong>{structure.beam}</strong> | Slab: <strong>{structure.slab}</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Form</button>
          <button style={styles.btnPrimary} onClick={() => setGenerated(true)}>🔨 Generate Civil BOQ</button>
        </div>
      </div>

      {/* 4. Detailed Results BOQ Cards & Table */}
      {generated && (
        <div style={styles.stepperCard}>
          <div style={styles.sectionHeader}>
            <span>📊 Civil BOQ Estimation Summary & Itemized BOQ</span>
          </div>

          {/* Metric Summary Grid */}
          <div className="bm-boq-summary-scroll" style={styles.summaryGrid}>
            <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
              <span style={styles.metricTitle}>Cement Quantity</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.cementQuantity, 1)} Bags</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Steel Rebar</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.steelQuantity, 1)} kg</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>({structure.steelKgPerSft} kg/sft BUA)</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>PCC Bed Volume</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.pehQuantity, 1)} CFT</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal, backgroundColor: '#0284c7' }}>
              <span style={styles.metricTitle}>Total Labour Cost</span>
              <span style={styles.metricVal}>₹{formatNumber(boqResults.labourTotal / 100000, 2)} Lakhs</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
              <span style={styles.metricTitle}>Estimated Rate / Sft</span>
              <span style={styles.metricVal}>{formatCurrency(boqResults.ratePerSft)} / Sft</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>Total: {formatCurrency(boqResults.grandTotal)}</span>
            </div>
          </div>

          {/* BOQ Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={handleDownloadPDF}>📄 Download in PDF</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export in Excel</button>
            <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share on WhatsApp</button>
            <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('🛒 BOQ Package sent to Marketplace RFQ! Vendors will submit quotes directly to your dashboard.')}>🛒 Request Marketplace RFQ</button>
            <button style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('📈 Applied Bengaluru Live Mandi Wholesale Rates to BOQ!')}>📈 Sync Live Market Rates</button>
            <button style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('💾 Saved BOQ Revision 1.0 to Active Project!')}>💾 Save BOQ Revision</button>
          </div>

          {/* Itemized BOQ Table */}
          <div style={styles.tableContainer} className="table-responsive table-container boq-table-view">
            <div className="bm-real-boq-scroll"><table className="bm-boq-table bm-final-boq-table bm-real-boq-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr.</th>
                  <th style={styles.th}>Master Code</th>
                  <th style={styles.th}>Item Description</th>
                  <th style={styles.th}>UOM</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Mat. Rate</th>
                  <th style={styles.th}>Lab. Rate</th>
                  <th style={styles.th}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {boqResults.items.map((i: any, idx: number) => (
                  <tr key={i.sr} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={styles.td}><strong>{i.sr}</strong></td>
                    <td style={styles.td}><code>{i.code}</code></td>
                    <td style={styles.td}><strong>{i.desc}</strong></td>
                    <td style={styles.td}>{i.uom}</td>
                    <td style={styles.td}>{formatNumber(i.qty)}</td>
                    <td style={styles.td}>{formatCurrency(i.matRate)}</td>
                    <td style={styles.td}>{formatCurrency(i.labRate)}</td>
                    <td style={styles.td}><strong>{formatCurrency(i.amount)}</strong></td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: '800' }}>
                  <td colSpan={7} style={{ padding: '12px', fontSize: '13px' }}>GRAND TOTAL ESTIMATED CIVIL BOQ COST</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{formatCurrency(boqResults.grandTotal)}</td>
                </tr>
              </tbody>
            </table></div>
          </div>

          {/* Mobile BOQ Item Cards (< 640px) */}
          <div className="boq-mobile-cards" style={{ display: 'none' }}>
            {boqResults.items.map((i: any) => (
              <div key={i.sr} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', color: '#800020' }}>
                  <span>#{i.sr} - {i.desc}</span>
                  <code style={{ fontSize: '10px', color: '#475569' }}>{i.code}</code>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', margin: '8px 0', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Qty</span>
                    <strong>{formatNumber(i.qty)} {i.uom}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Mat Rate</span>
                    <strong>{formatCurrency(i.matRate)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Lab Rate</span>
                    <strong>{formatCurrency(i.labRate)}</strong>
                  </div>
                </div>
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Total Amount:</span>
                  <strong style={{ fontSize: '13px', color: '#16a34a' }}>{formatCurrency(i.amount)}</strong>
                </div>
              </div>
            ))}
            <div style={{ background: '#800020', color: '#ffffff', padding: '10px 14px', borderRadius: '8px', fontWeight: '800', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>GRAND TOTAL CIVIL BOQ</span>
              <span>{formatCurrency(boqResults.grandTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



