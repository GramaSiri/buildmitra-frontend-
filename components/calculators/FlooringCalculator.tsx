import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../../utils/pdfExport';
import { useRates } from '../../contexts/RateContext';
import MarketRateTrend from '../ui/MarketRateTrend';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../../utils/masterRates";

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

// Common Tile Sizes & Areas (sqft per tile)
const TILE_SIZES: Record<string, { label: string; sqft: number; pcsPerBox: number }> = {
  '24x24': { label: '24" x 24" (600x600 mm)', sqft: 4.0, pcsPerBox: 4 },
  '24x48': { label: '24" x 48" (600x1200 mm)', sqft: 8.0, pcsPerBox: 2 },
  '32x32': { label: '32" x 32" (800x800 mm)', sqft: 7.11, pcsPerBox: 3 },
  '12x24': { label: '12" x 24" (300x600 mm)', sqft: 2.0, pcsPerBox: 6 },
  '12x12': { label: '12" x 12" (300x300 mm)', sqft: 1.0, pcsPerBox: 10 },
  '16x16': { label: '16" x 16" (400x400 mm)', sqft: 1.78, pcsPerBox: 6 },
  '36x36': { label: '36" x 36" (900x900 mm)', sqft: 9.0, pcsPerBox: 2 },
  '48x48': { label: '48" x 48" (1200x1200 mm)', sqft: 16.0, pcsPerBox: 2 },
  'Slab': { label: 'Random Slab (Custom)', sqft: 1.0, pcsPerBox: 1 }
};

export default function FlooringCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Mode Selector: 'quick' vs 'detailed'
  const [calcMode, setCalcMode] = useState<'quick' | 'detailed'>('quick');

  // QUICK CALCULATION MODE INPUTS
  const initialQuickInputs = {
    totalArea: 2500,
    bathrooms: 5,
    kitchens: 1,
    kitchenDadoSqft: 50,
    mainMat: 'Vitrified Tiles',
    bathFloorMat: 'Anti-Skid Tiles',
    bathWallMat: 'Ceramic Wall Tiles',
    kitchenDadoMat: 'Ceramic Wall Tiles',
    mainTileSize: '24x24',
    wastagePct: 5,
    installMethod: 'Tile Adhesive',
    includeSkirting: true,
    skirtingRft: 178
  };

  const [quickInputs, setQuickInputs] = useState(initialQuickInputs);

  const [showQuickAssumptions, setShowQuickAssumptions] = useState(false);
  const [bathAssumptions, setBathAssumptions] = useState({
    length: 8,
    width: 6,
    wallHeight: 7,
    doorDeductionSqft: 21,
    ventDeductionSqft: 4
  });

  // DETAILED ROOM-WISE CALCULATOR INPUTS
  const initialDetailedRooms = [
    { id: 1, type: 'Living Room', length: 15, width: 12, nos: 1, deductions: 0, flooringType: 'Vitrified Tiles', tileSize: '24x24', layingMethod: 'Tile adhesive thin-bed', wastagePct: 5, includeSkirting: true, skirtingHeightIn: 4, doorDeductionFt: 3 },
    { id: 2, type: 'Bedroom 1', length: 12, width: 11, nos: 1, deductions: 0, flooringType: 'Vitrified Tiles', tileSize: '24x24', layingMethod: 'Tile adhesive thin-bed', wastagePct: 5, includeSkirting: true, skirtingHeightIn: 4, doorDeductionFt: 3 },
    { id: 3, type: 'Bedroom 2', length: 12, width: 11, nos: 1, deductions: 0, flooringType: 'Vitrified Tiles', tileSize: '24x24', layingMethod: 'Tile adhesive thin-bed', wastagePct: 5, includeSkirting: true, skirtingHeightIn: 4, doorDeductionFt: 3 },
    { id: 4, type: 'Bedroom 3', length: 12, width: 10, nos: 1, deductions: 0, flooringType: 'Vitrified Tiles', tileSize: '24x24', layingMethod: 'Tile adhesive thin-bed', wastagePct: 5, includeSkirting: true, skirtingHeightIn: 4, doorDeductionFt: 3 },
    { id: 5, type: 'Kitchen', length: 10, width: 10, nos: 1, deductions: 0, flooringType: 'Granite', tileSize: 'Slab', layingMethod: 'Cement-sand mortar bed', wastagePct: 5, includeSkirting: true, skirtingHeightIn: 4, doorDeductionFt: 3 },
    { id: 6, type: 'Passage', length: 16, width: 5, nos: 1, deductions: 0, flooringType: 'Granite', tileSize: 'Slab', layingMethod: 'Cement-sand mortar bed', wastagePct: 5, includeSkirting: true, skirtingHeightIn: 4, doorDeductionFt: 3 }
  ];

  const [rooms, setRooms] = useState<any[]>(initialDetailedRooms);

  const [roomInput, setRoomInput] = useState<any>({
    type: 'Bed Room',
    length: 12,
    width: 10,
    nos: 1,
    deductions: 0,
    flooringType: 'Vitrified Tiles',
    tileSize: '24x24',
    layingMethod: 'Tile adhesive thin-bed',
    wastagePct: 5,
    includeSkirting: true,
    skirtingHeightIn: 4,
    doorDeductionFt: 3
  });

  // Admin Rate (₹)s
  const vitrifiedRate = getMasterRate(["MAT-VIT-01", "MAT-002507", "vitrified tiles", "vitrified"], 65);
  const ceramicRate = getMasterRate(["MAT-CER-01", "MAT-000158", "ceramic tiles", "ceramic"], 45);
  const antiSkidRate = getMasterRate(["MAT-PRK-01", "anti-skid tiles", "anti skid"], 52);
  const graniteRate = getMasterRate(["MAT-GRN-01", "MAT-000854", "granite slab", "granite"], 165);
  const marbleRate = getMasterRate(["MAT-MRB-01", "MAT-001268", "marble slab", "marble"], 220);

  const cementRate = getMasterRate(["MAT-CEM-01", "MAT-000190", "cement"], 385);
  const sandRate = getMasterRate(["MAT-MSND-01", "MAT-000163", "m-sand", "sand"], 45);
  const adhesiveRate = getMasterRate(["MAT-ADH-01", "MAT-002430", "tile adhesive", "adhesive"], 450);
  const groutRate = getMasterRate(["MAT-GRT-01", "tile grout", "grout"], 65);
  const spacerRate = getMasterRate(["MAT-SPC-01", "tile spacers", "spacers"], 120);

  const tileLabourRate = getMasterRate(["SRV-TIL-LAY", "tile laying labour", "tile labour"], 24);
  const graniteLabourRate = getMasterRate(["SRV-GRN-LAY", "granite laying labour", "granite labour"], 38);
  const marbleLabourRate = getMasterRate(["SRV-MRB-LAY", "marble laying labour", "marble labour"], 45);
  const claddingLabourRate = getMasterRate(["SRV-CLD-LAY", "wall cladding labour", "cladding labour"], 30);
  const skirtingLabourRate = getMasterRate(["SRV-SKT-LAY", "skirting labour", "skirting fixing"], 15);

  const getMaterialRateObj = (type: string): MasterRateResult => {
    if (type.includes("Vitrified")) return vitrifiedRate;
    if (type.includes("Ceramic")) return ceramicRate;
    if (type.includes("Anti-Skid") || type.includes("Parking")) return antiSkidRate;
    if (type.includes("Granite")) return graniteRate;
    if (type.includes("Marble")) return marbleRate;
    return vitrifiedRate;
  };

  const getLabourRateObj = (type: string): MasterRateResult => {
    if (type.includes("Granite")) return graniteLabourRate;
    if (type.includes("Marble")) return marbleLabourRate;
    return tileLabourRate;
  };

  // Detailed Handlers
  const handleAddRoom = () => {
    if (roomInput.length <= 0 || roomInput.width <= 0 || roomInput.nos <= 0) {
      alert("Please enter valid room length, width, and quantity (> 0).");
      return;
    }
    setRooms([...rooms, { ...roomInput, id: Date.now() }]);
  };

  const handleDuplicateRoom = (room: any) => {
    setRooms([...rooms, { ...room, id: Date.now() }]);
  };

  const handleRemoveRoom = (id: number) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const handleResetQuick = () => {
    setQuickInputs(initialQuickInputs);
  };

  const handleResetDetailed = () => {
    setRooms(initialDetailedRooms);
  };

  // QUICK ESTIMATE CALCULATIONS ENGINE
  const quickCalcResults = useMemo(() => {
    const q = quickInputs;

    const bathFloorPerBath = bathAssumptions.length * bathAssumptions.width;
    const totalBathFloorSqft = q.bathrooms * bathFloorPerBath;

    const bath4SidesWallGrossPerBath = 2 * (bathAssumptions.length + bathAssumptions.width) * bathAssumptions.wallHeight;
    const bath4SidesWallNetPerBath = Math.max(0, bath4SidesWallGrossPerBath - bathAssumptions.doorDeductionSqft - bathAssumptions.ventDeductionSqft);
    const totalBathWallSqft = q.bathrooms * bath4SidesWallNetPerBath;

    const mainFlooringNetSqft = q.bathFloorMat === 'Same as Main Flooring'
      ? q.totalArea
      : Math.max(0, q.totalArea - totalBathFloorSqft);

    const totalKitchenDadoSqft = q.kitchens * q.kitchenDadoSqft;
    const totalWallTileSqft = totalBathWallSqft + totalKitchenDadoSqft;

    const wastageFactor = 1 + (q.wastagePct / 100);
    const mainReqSqft = mainFlooringNetSqft * wastageFactor;
    const bathFloorReqSqft = q.bathFloorMat === 'Same as Main Flooring' ? 0 : totalBathFloorSqft * wastageFactor;
    const wallReqSqft = totalWallTileSqft * wastageFactor;

    let skirtingSqft = 0;
    if (q.includeSkirting && q.skirtingRft > 0) {
      skirtingSqft = q.skirtingRft * (4 / 12);
    }

    const mainSizeObj = TILE_SIZES[q.mainTileSize] || TILE_SIZES['24x24'];
    const mainTilesCount = Math.ceil(mainReqSqft / mainSizeObj.sqft);
    const mainBoxesCount = Math.ceil(mainTilesCount / mainSizeObj.pcsPerBox);

    const bathFloorTilesCount = Math.ceil(bathFloorReqSqft / 1.0);
    const bathFloorBoxesCount = Math.ceil(bathFloorTilesCount / 10);

    const wallTilesCount = Math.ceil(wallReqSqft / 2.0);
    const wallBoxesCount = Math.ceil(wallTilesCount / 6);

    const totalTiledSqft = mainReqSqft + bathFloorReqSqft + wallReqSqft + (skirtingSqft * 1.05);
    const adhesiveKg = totalTiledSqft * 0.45;
    const adhesiveBags = Math.ceil(adhesiveKg / 20);

    const groutKg = Math.ceil(totalTiledSqft * 0.05);
    const spacersPacks = Math.ceil((totalTiledSqft / 4) / 100);
    const waterLitres = Math.ceil(totalTiledSqft * 0.5);

    let cementBags = 0;
    let sandCft = 0;
    if (q.installMethod.includes("Mortar")) {
      const wetVolCuM = (totalTiledSqft * 0.092903) * ((0.75 * 25.4) / 1000);
      const dryVolCuM = wetVolCuM * 1.33;
      const cementVol = dryVolCuM / 5;
      cementBags = Math.ceil((cementVol * 1440) / 50);
      sandCft = Math.ceil(((dryVolCuM * 4) / 5) * 35.3147);
    } else {
      cementBags = Math.ceil(totalTiledSqft * 0.02);
      sandCft = Math.ceil(totalTiledSqft * 0.08);
    }

    let grandMatCost = 0;
    let grandLabCost = 0;
    const resultItems: any[] = [];
    let unpricedCount = 0;
    const unpricedList: string[] = [];

    const mainMatRate = getMaterialRateObj(q.mainMat);
    const mainLabRate = getLabourRateObj(q.mainMat);

    if (!mainMatRate.found) { unpricedCount++; unpricedList.push(`${q.mainMat} Material`); }
    if (!mainLabRate.found) { unpricedCount++; unpricedList.push(`${q.mainMat} Laying Labour`); }

    const mainMatCost = mainReqSqft * (mainMatRate.found ? mainMatRate.rate : 0);
    const mainLabCost = mainFlooringNetSqft * (mainLabRate.found ? mainLabRate.rate : 0);

    grandMatCost += mainMatCost;
    grandLabCost += mainLabCost;

    resultItems.push({
      code: mainMatRate.itemCode || "MAT-VIT-01",
      category: "Tiles Material",
      description: `${q.mainMat} Main Flooring (${q.mainTileSize}) - Pcs: ${mainTilesCount}, Boxes: ${mainBoxesCount}`,
      unit: "SQFT",
      engQty: mainFlooringNetSqft,
      procQty: Math.ceil(mainReqSqft),
      rate: mainMatRate.rate,
      rateFound: mainMatRate.found,
      amount: mainMatCost
    });

    resultItems.push({
      code: mainLabRate.itemCode || "SRV-TIL-LAY",
      category: "Labour",
      description: `${q.mainMat} Main Flooring Laying Labour`,
      unit: "SQFT",
      engQty: mainFlooringNetSqft,
      procQty: mainFlooringNetSqft,
      rate: mainLabRate.rate,
      rateFound: mainLabRate.found,
      amount: mainLabCost
    });

    if (q.bathFloorMat !== 'Same as Main Flooring' && totalBathFloorSqft > 0) {
      const bFloorMatRate = getMaterialRateObj(q.bathFloorMat);
      const bFloorLabRate = tileLabourRate;

      if (!bFloorMatRate.found) { unpricedCount++; unpricedList.push(`${q.bathFloorMat} Material`); }

      const bFloorMatCost = bathFloorReqSqft * (bFloorMatRate.found ? bFloorMatRate.rate : 0);
      const bFloorLabCost = totalBathFloorSqft * (bFloorLabRate.found ? bFloorLabRate.rate : 0);

      grandMatCost += bFloorMatCost;
      grandLabCost += bFloorLabCost;

      resultItems.push({
        code: bFloorMatRate.itemCode || "MAT-PRK-01",
        category: "Tiles Material",
        description: `${q.bathFloorMat} Bathroom Flooring (${q.bathrooms} Baths x ${bathFloorPerBath} sqft) - Pcs: ${bathFloorTilesCount}, Boxes: ${bathFloorBoxesCount}`,
        unit: "SQFT",
        engQty: totalBathFloorSqft,
        procQty: Math.ceil(bathFloorReqSqft),
        rate: bFloorMatRate.rate,
        rateFound: bFloorMatRate.found,
        amount: bFloorMatCost
      });

      resultItems.push({
        code: bFloorLabRate.itemCode || "SRV-TIL-LAY",
        category: "Labour",
        description: `Bathroom Flooring Laying Labour (${q.bathrooms} Baths)`,
        unit: "SQFT",
        engQty: totalBathFloorSqft,
        procQty: totalBathFloorSqft,
        rate: bFloorLabRate.rate,
        rateFound: bFloorLabRate.found,
        amount: bFloorLabCost
      });
    }

    if (totalBathWallSqft > 0) {
      const wallMatRate = ceramicRate;
      const wallLabRate = claddingLabourRate;

      if (!wallMatRate.found) { unpricedCount++; unpricedList.push(`Ceramic Wall Tiles`); }

      const wallMatCost = (totalBathWallSqft * wastageFactor) * (wallMatRate.found ? wallMatRate.rate : 0);
      const wallLabCost = totalBathWallSqft * (wallLabRate.found ? wallLabRate.rate : 0);

      grandMatCost += wallMatCost;
      grandLabCost += wallLabCost;

      resultItems.push({
        code: wallMatRate.itemCode || "MAT-CER-01",
        category: "Tiles Material",
        description: `Ceramic Bathroom Wall Tiles (4 Sides Wall: 2x(${bathAssumptions.length}+${bathAssumptions.width})x${bathAssumptions.wallHeight} = ${totalBathWallSqft} sqft for ${q.bathrooms} Baths)`,
        unit: "SQFT",
        engQty: totalBathWallSqft,
        procQty: Math.ceil(totalBathWallSqft * wastageFactor),
        rate: wallMatRate.rate,
        rateFound: wallMatRate.found,
        amount: wallMatCost
      });

      resultItems.push({
        code: wallLabRate.itemCode || "SRV-CLD-LAY",
        category: "Labour",
        description: `Bathroom Wall Cladding Labour (${q.bathrooms} Baths)`,
        unit: "SQFT",
        engQty: totalBathWallSqft,
        procQty: totalBathWallSqft,
        rate: wallLabRate.rate,
        rateFound: wallLabRate.found,
        amount: wallLabCost
      });
    }

    if (totalKitchenDadoSqft > 0) {
      const dadoMatRate = ceramicRate;
      const dadoLabRate = claddingLabourRate;

      const dadoMatCost = (totalKitchenDadoSqft * wastageFactor) * (dadoMatRate.found ? dadoMatRate.rate : 0);
      const dadoLabCost = totalKitchenDadoSqft * (dadoLabRate.found ? dadoLabRate.rate : 0);

      grandMatCost += dadoMatCost;
      grandLabCost += dadoLabCost;

      resultItems.push({
        code: dadoMatRate.itemCode || "MAT-CER-01",
        category: "Tiles Material",
        description: `Kitchen Wall Dado Tiles (${q.kitchens} Kitchen x ${q.kitchenDadoSqft} sqft)`,
        unit: "SQFT",
        engQty: totalKitchenDadoSqft,
        procQty: Math.ceil(totalKitchenDadoSqft * wastageFactor),
        rate: dadoMatRate.rate,
        rateFound: dadoMatRate.found,
        amount: dadoMatCost
      });

      resultItems.push({
        code: dadoLabRate.itemCode || "SRV-CLD-LAY",
        category: "Labour",
        description: `Kitchen Dado Fixing Labour`,
        unit: "SQFT",
        engQty: totalKitchenDadoSqft,
        procQty: totalKitchenDadoSqft,
        rate: dadoLabRate.rate,
        rateFound: dadoLabRate.found,
        amount: dadoLabCost
      });
    }

    if (q.includeSkirting && q.skirtingRft > 0) {
      const skLabCost = q.skirtingRft * (skirtingLabourRate.found ? skirtingLabourRate.rate : 0);
      grandLabCost += skLabCost;

      resultItems.push({
        code: skirtingLabourRate.itemCode || "SRV-SKT-LAY",
        category: "Labour",
        description: `Skirting Fixing Labour (${q.skirtingRft} RFT)`,
        unit: "RFT",
        engQty: q.skirtingRft,
        procQty: q.skirtingRft,
        rate: skirtingLabourRate.rate,
        rateFound: skirtingLabourRate.found,
        amount: skLabCost
      });
    }

    if (adhesiveBags > 0) {
      const adhCost = adhesiveBags * (adhesiveRate.found ? adhesiveRate.rate : 0);
      grandMatCost += adhCost;

      resultItems.push({
        code: adhesiveRate.itemCode || "MAT-ADH-01",
        category: "Ancillary Material",
        description: `Tile Adhesive (20kg Bags) - Thin/Medium Bed (${adhesiveKg.toFixed(1)} kg)`,
        unit: "BAG",
        engQty: Number((adhesiveKg / 20).toFixed(1)),
        procQty: adhesiveBags,
        rate: adhesiveRate.rate,
        rateFound: adhesiveRate.found,
        amount: adhCost
      });
    }

    if (cementBags > 0) {
      const cemCost = cementBags * (cementRate.found ? cementRate.rate : 0);
      grandMatCost += cemCost;

      resultItems.push({
        code: cementRate.itemCode || "MAT-CEM-01",
        category: "Ancillary Material",
        description: `Cement 50kg Bags (OPC 53)`,
        unit: "BAG",
        engQty: cementBags,
        procQty: cementBags,
        rate: cementRate.rate,
        rateFound: cementRate.found,
        amount: cemCost
      });
    }

    if (sandCft > 0) {
      const sandCost = sandCft * (sandRate.found ? sandRate.rate : 0);
      grandMatCost += sandCost;

      resultItems.push({
        code: sandRate.itemCode || "MAT-MSND-01",
        category: "Ancillary Material",
        description: `M-Sand (Fine Grade)`,
        unit: "CFT",
        engQty: sandCft,
        procQty: sandCft,
        rate: sandRate.rate,
        rateFound: sandRate.found,
        amount: sandCost
      });
    }

    if (groutKg > 0) {
      const groutCost = groutKg * (groutRate.found ? groutRate.rate : 0);
      grandMatCost += groutCost;

      resultItems.push({
        code: groutRate.itemCode || "MAT-GRT-01",
        category: "Ancillary Material",
        description: "Tile Joint Grout (Waterproof)",
        unit: "KG",
        engQty: groutKg,
        procQty: groutKg,
        rate: groutRate.rate,
        rateFound: groutRate.found,
        amount: groutCost
      });
    }

    if (spacersPacks > 0) {
      const spcCost = spacersPacks * (spacerRate.found ? spacerRate.rate : 0);
      grandMatCost += spcCost;

      resultItems.push({
        code: spacerRate.itemCode || "MAT-SPC-01",
        category: "Ancillary Material",
        description: "Tile Spacers (100 pcs per pack)",
        unit: "PACK",
        engQty: spacersPacks,
        procQty: spacersPacks,
        rate: spacerRate.rate,
        rateFound: spacerRate.found,
        amount: spcCost
      });
    }

    resultItems.push({
      code: "INFO-WTR-01",
      category: "Site Water",
      description: "Approximate Site Water Requirement (Mortar & Cleaning)",
      unit: "LTR",
      engQty: waterLitres,
      procQty: waterLitres,
      rate: 0,
      rateFound: true,
      amount: 0
    });

    const grandTotal = grandMatCost + grandLabCost;
    const costPerSqft = q.totalArea > 0 ? grandTotal / q.totalArea : 0;

    return {
      bathFloorPerBath,
      totalBathFloorSqft,
      bath4SidesWallNetPerBath,
      totalBathWallSqft,
      totalKitchenDadoSqft,
      mainFlooringNetSqft,
      grandMatCost,
      grandLabCost,
      grandTotal,
      costPerSqft,
      resultItems,
      unpricedCount,
      unpricedList
    };
  }, [quickInputs, bathAssumptions]);

  // DETAILED ROOM CALCULATION ENGINE WITH ALL ANCILLARY MATERIALS & LABOUR
  const detailedCalcResults = useMemo(() => {
    let totalNetSqft = 0;
    let totalGrossSqft = 0;
    let totalAdhesiveKg = 0;
    let totalMortarVolCuM = 0;
    let totalSkirtingRft = 0;
    let totalSkirtingSqft = 0;

    let unpricedCount = 0;
    const unpricedList: string[] = [];

    const materialGroups: Record<string, any> = {};

    rooms.forEach(r => {
      const grossArea = r.length * r.width * r.nos;
      const netArea = Math.max(0, grossArea - (r.deductions || 0));
      const wastageArea = netArea * ((r.wastagePct || 5) / 100);
      const reqArea = netArea + wastageArea;

      totalGrossSqft += grossArea;
      totalNetSqft += netArea;

      let skirtingRft = 0;
      let skirtingSqft = 0;
      if (r.includeSkirting) {
        skirtingRft = (2 * (r.length + r.width) * r.nos) - (r.doorDeductionFt || 3);
        skirtingSqft = skirtingRft * ((r.skirtingHeightIn || 4) / 12);
        totalSkirtingRft += skirtingRft;
        totalSkirtingSqft += skirtingSqft;
      }

      if (r.layingMethod.includes("adhesive")) {
        totalAdhesiveKg += reqArea * 0.45;
      } else {
        const thicknessM = (0.75 * 25.4) / 1000;
        totalMortarVolCuM += (netArea * 0.092903) * thicknessM;
      }

      const matType = r.flooringType;
      if (!materialGroups[matType]) {
        const matRateObj = getMaterialRateObj(matType);
        const labRateObj = getLabourRateObj(matType);

        if (!matRateObj.found) { unpricedCount++; unpricedList.push(`${matType} Material`); }
        if (!labRateObj.found) { unpricedCount++; unpricedList.push(`${matType} Laying Labour`); }

        materialGroups[matType] = {
          materialType: matType,
          matRateObj,
          labRateObj,
          roomsIncluded: [],
          netFlooringSqft: 0,
          reqFlooringSqft: 0,
          skirtingRft: 0,
          skirtingSqft: 0,
          totalTilesPcs: 0,
          totalBoxes: 0,
          materialCost: 0,
          labourCost: 0
        };
      }

      const grp = materialGroups[matType];
      if (!grp.roomsIncluded.includes(r.type)) grp.roomsIncluded.push(r.type);

      grp.netFlooringSqft += netArea;
      grp.reqFlooringSqft += reqArea;
      grp.skirtingRft += skirtingRft;
      grp.skirtingSqft += skirtingSqft;

      const sizeObj = TILE_SIZES[r.tileSize] || TILE_SIZES['24x24'];
      const tilesCount = Math.ceil(reqArea / sizeObj.sqft);
      const boxesCount = Math.ceil(tilesCount / sizeObj.pcsPerBox);

      grp.totalTilesPcs += tilesCount;
      grp.totalBoxes += boxesCount;

      const mCost = reqArea * (grp.matRateObj.found ? grp.matRateObj.rate : 0);
      const lCost = netArea * (grp.labRateObj.found ? grp.labRateObj.rate : 0);

      grp.materialCost += mCost;
      grp.labourCost += lCost;
    });

    // Mortar Bed Calculations (IS 2250 / IS 456)
    let cementBags = 0;
    let sandCft = 0;
    if (totalMortarVolCuM > 0) {
      const dryVolCuM = totalMortarVolCuM * 1.33; // 1.33 dry shrinkage factor
      const cementVol = dryVolCuM / 5; // 1:4 ratio
      cementBags = Math.ceil((cementVol * 1440) / 50); // 1440 kg/m3 density, 50kg bag
      sandCft = Math.ceil(((dryVolCuM * 4) / 5) * 35.3147);
    }

    const adhesiveBags = Math.ceil(totalAdhesiveKg / 20);
    const groutKg = Math.ceil(totalNetSqft * 0.05);
    const spacersPacks = Math.ceil((totalNetSqft / 4) / 100);
    const waterLitres = Math.ceil((cementBags * 25) + (totalNetSqft * 0.5));

    let grandMatCost = 0;
    let grandLabCost = 0;
    const resultItems: any[] = [];

    // 1. Flooring Materials & Laying Labour per Material Type
    Object.values(materialGroups).forEach(g => {
      grandMatCost += g.materialCost;
      grandLabCost += g.labourCost;

      resultItems.push({
        code: g.matRateObj.itemCode || "MAT-VIT-01",
        category: "Tiles Material",
        description: `${g.materialType} (${g.roomsIncluded.join(', ')}) - Pcs: ${g.totalTilesPcs}, Boxes: ${g.totalBoxes}`,
        unit: "SQFT",
        engQty: g.netFlooringSqft,
        procQty: Math.ceil(g.reqFlooringSqft + (g.skirtingSqft * 1.05)),
        rate: g.matRateObj.rate,
        rateFound: g.matRateObj.found,
        amount: g.materialCost
      });

      resultItems.push({
        code: g.labRateObj.itemCode || "SRV-TIL-LAY",
        category: "Labour",
        description: `${g.materialType} Laying Labour (${g.roomsIncluded.join(', ')})`,
        unit: "SQFT",
        engQty: g.netFlooringSqft,
        procQty: g.netFlooringSqft,
        rate: g.labRateObj.rate,
        rateFound: g.labRateObj.found,
        amount: g.labourCost
      });
    });

    // 2. Skirting Labour
    if (totalSkirtingRft > 0) {
      const skLabCost = totalSkirtingRft * (skirtingLabourRate.found ? skirtingLabourRate.rate : 0);
      grandLabCost += skLabCost;

      resultItems.push({
        code: skirtingLabourRate.itemCode || "SRV-SKT-LAY",
        category: "Labour",
        description: `Skirting Fixing Labour (${totalSkirtingRft} RFT)`,
        unit: "RFT",
        engQty: totalSkirtingRft,
        procQty: totalSkirtingRft,
        rate: skirtingLabourRate.rate,
        rateFound: skirtingLabourRate.found,
        amount: skLabCost
      });
    }

    // 3. Ancillary Construction Materials (Adhesive, Cement, Sand, Grout, Spacers, Water)
    if (adhesiveBags > 0) {
      const adhCost = adhesiveBags * (adhesiveRate.found ? adhesiveRate.rate : 0);
      grandMatCost += adhCost;

      resultItems.push({
        code: adhesiveRate.itemCode || "MAT-ADH-01",
        category: "Ancillary Material",
        description: `Tile Adhesive (20kg Bags) - Thin/Medium Bed (${totalAdhesiveKg.toFixed(1)} kg)`,
        unit: "BAG",
        engQty: Number((totalAdhesiveKg / 20).toFixed(1)),
        procQty: adhesiveBags,
        rate: adhesiveRate.rate,
        rateFound: adhesiveRate.found,
        amount: adhCost
      });
    }

    if (cementBags > 0) {
      const cemCost = cementBags * (cementRate.found ? cementRate.rate : 0);
      grandMatCost += cemCost;

      resultItems.push({
        code: cementRate.itemCode || "MAT-CEM-01",
        category: "Ancillary Material",
        description: `Cement 50kg Bags (OPC 53) - Mortar Bedding`,
        unit: "BAG",
        engQty: cementBags,
        procQty: cementBags,
        rate: cementRate.rate,
        rateFound: cementRate.found,
        amount: cemCost
      });
    }

    if (sandCft > 0) {
      const sandCost = sandCft * (sandRate.found ? sandRate.rate : 0);
      grandMatCost += sandCost;

      resultItems.push({
        code: sandRate.itemCode || "MAT-MSND-01",
        category: "Ancillary Material",
        description: `M-Sand (Fine Grade) - Mortar Bedding`,
        unit: "CFT",
        engQty: sandCft,
        procQty: sandCft,
        rate: sandRate.rate,
        rateFound: sandRate.found,
        amount: sandCost
      });
    }

    if (groutKg > 0) {
      const groutCost = groutKg * (groutRate.found ? groutRate.rate : 0);
      grandMatCost += groutCost;

      resultItems.push({
        code: groutRate.itemCode || "MAT-GRT-01",
        category: "Ancillary Material",
        description: "Tile Joint Grout (Waterproof)",
        unit: "KG",
        engQty: groutKg,
        procQty: groutKg,
        rate: groutRate.rate,
        rateFound: groutRate.found,
        amount: groutCost
      });
    }

    if (spacersPacks > 0) {
      const spcCost = spacersPacks * (spacerRate.found ? spacerRate.rate : 0);
      grandMatCost += spcCost;

      resultItems.push({
        code: spacerRate.itemCode || "MAT-SPC-01",
        category: "Ancillary Material",
        description: "Tile Spacers (100 pcs per pack)",
        unit: "PACK",
        engQty: spacersPacks,
        procQty: spacersPacks,
        rate: spacerRate.rate,
        rateFound: spacerRate.found,
        amount: spcCost
      });
    }

    resultItems.push({
      code: "INFO-WTR-01",
      category: "Site Water",
      description: "Approximate Site Water Requirement (Mortar & Cleaning)",
      unit: "LTR",
      engQty: waterLitres,
      procQty: waterLitres,
      rate: 0,
      rateFound: true,
      amount: 0
    });

    const grandTotal = grandMatCost + grandLabCost;
    const costPerSqft = totalNetSqft > 0 ? grandTotal / totalNetSqft : 0;

    return {
      totalNetSqft,
      grandMatCost,
      grandLabCost,
      grandTotal,
      costPerSqft,
      resultItems,
      unpricedCount,
      unpricedList
    };
  }, [rooms]);

  // Download PDF
  const handleDownloadPDF = () => {
    checkAndRun('calculator_export', 'flooring-calculator', () => {
      const res = calcMode === 'quick' ? quickCalcResults : detailedCalcResults;
      downloadBuildMitraPDF({
        documentTitle: `BuildMitra Tile & Flooring Estimate (${calcMode.toUpperCase()})`,
        items: res.resultItems.map((item: any, idx: number) => ({
          sno: idx + 1,
          description: `[${item.category}] ${item.description}`,
          quantity: item.procQty,
          unit: item.unit,
          rate: item.rateFound ? item.rate : 0,
          amount: item.rateFound ? item.amount : 0
        })),
        grandTotal: res.grandTotal
      });
    });
  };

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
      XLSX.utils.book_append_sheet(wb, ws, "Tile Calculation Results");
      XLSX.writeFile(wb, `BuildMitra_Tile_Calculator_${calcMode}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun(() => {
      const res = calcMode === 'quick' ? quickCalcResults : detailedCalcResults;
      const msg = `*BuildMitra Tile & Flooring Estimation Report*%0A` +
        `*Estimation Mode*: ${calcMode === 'quick' ? 'Quick Calculation' : 'Detailed Room-Wise Calculation'}%0A` +
        `----------------------------------------%0A` +
        `• *Total Flooring Area*: ${formatNumber(calcMode === 'quick' ? quickInputs.totalArea : res.totalNetSqft)} Sqft%0A` +
        `• *Mat. Cost (₹)*: ${formatCurrency(res.grandMatCost)}%0A` +
        `• *Labour (₹)*: ${formatCurrency(res.grandLabCost)}%0A` +
        `• *TOTAL ESTIMATED COST*: ${formatCurrency(res.grandTotal)} (${formatCurrency(res.costPerSqft)}/Sqft)%0A%0A` +
        `*Generated via BuildMitra Professional Estimator*`;
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => router.push('/calculators')}>← Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          🏢 Tile & Flooring Calculator
          <span style={styles.badge}>IS 15622 / IS 2571 / IS 2250 Compliant</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#e0f2fe' }}>BuildMitra Professional Edition</span>
        </div>
      </div>

      {/* Live Market Rate Ticker */}
      <MarketRateTrend />

      {/* Estimation Method Dropdown */}
      <div style={styles.dropdownCard}>
        <label style={styles.dropdownLabel}>Select Estimation Method</label>
        <select
          style={styles.modeSelect}
          value={calcMode}
          onChange={(e) => setCalcMode(e.target.value as 'quick' | 'detailed')}
        >
          <option value="quick">Quick Calculation (Estimate from approximate total area)</option>
          <option value="detailed">📐 Detailed Room-Wise Calculation (Room-by-room exact measurements)</option>
        </select>
      </div>

      {/* ========================================================= */}
      {/* QUICK CALCULATION MODE */}
      {/* ========================================================= */}
      {calcMode === 'quick' && (
        <>
          <div style={styles.stepperCard}>
            <div style={styles.sectionHeader}>
              <span>Quick Calculation Inputs</span>
            </div>

            <div style={styles.noteBox}>
              💡 <strong>Automatic Calculation Logic</strong>:
              <br />• <strong>Bathroom Flooring Qty</strong> = Length × Width ({bathAssumptions.length}' × {bathAssumptions.width}' = {quickCalcResults.bathFloorPerBath} sqft per bath)
              <br />• <strong>Bathroom Wall Tiling Qty</strong> = 4 Sides Wall = 2 × (Length + Width) × Height ({2 * (bathAssumptions.length + bathAssumptions.width)}' × {bathAssumptions.wallHeight}' = {quickCalcResults.bath4SidesWallNetPerBath} net sqft per bath)
            </div>

            <div style={styles.grid3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Total Built-Up / Flooring Area (Sqft)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={quickInputs.totalArea}
                  onChange={e => setQuickInputs({ ...quickInputs, totalArea: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Number of Bathrooms</label>
                <input
                  type="number"
                  style={styles.input}
                  value={quickInputs.bathrooms}
                  onChange={e => setQuickInputs({ ...quickInputs, bathrooms: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Number of Kitchens</label>
                <input
                  type="number"
                  style={styles.input}
                  value={quickInputs.kitchens}
                  onChange={e => setQuickInputs({ ...quickInputs, kitchens: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <button style={styles.btnSecondary} onClick={() => setShowQuickAssumptions(!showQuickAssumptions)}>
                {showQuickAssumptions ? '▲ Hide Bathroom & Kitchen Assumptions' : '⚙️ Edit Bathroom Dimensions & Wall Height (Length x Width x Height)'}
              </button>

              {showQuickAssumptions && (
                <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', marginTop: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f766e', marginBottom: '8px' }}>
                    Bathroom Dimensions (4 Sides Wall Calculation: 2 x (L + W) x H)
                  </div>
                  <div style={styles.grid4}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Bath Length (Ft)</label>
                      <input type="number" style={styles.input} value={bathAssumptions.length} onChange={e => setBathAssumptions({ ...bathAssumptions, length: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Bath Width (Ft)</label>
                      <input type="number" style={styles.input} value={bathAssumptions.width} onChange={e => setBathAssumptions({ ...bathAssumptions, width: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Wall Tile Height (Ft)</label>
                      <input type="number" style={styles.input} value={bathAssumptions.wallHeight} onChange={e => setBathAssumptions({ ...bathAssumptions, wallHeight: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Door Deduction (Sqft)</label>
                      <input type="number" style={styles.input} value={bathAssumptions.doorDeductionSqft} onChange={e => setBathAssumptions({ ...bathAssumptions, doorDeductionSqft: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f766e', margin: '10px 0 8px 0' }}>Kitchen Dado Assumption</div>
                  <div style={styles.grid2}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Kitchen Dado Area Per Kitchen (Sqft)</label>
                      <input type="number" style={styles.input} value={quickInputs.kitchenDadoSqft} onChange={e => setQuickInputs({ ...quickInputs, kitchenDadoSqft: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Main Flooring Material</label>
                <select style={styles.select} value={quickInputs.mainMat} onChange={e => setQuickInputs({ ...quickInputs, mainMat: e.target.value })}>
                  <option value="Vitrified Tiles">Vitrified Tiles</option>
                  <option value="Ceramic Tiles">Ceramic Tiles</option>
                  <option value="Granite">Granite Slab</option>
                  <option value="Marble">Marble Slab</option>
                  <option value="Anti-Skid Tiles">Anti-Skid Tiles</option>
                  <option value="Parking Tiles">Parking Tiles</option>
                  <option value="Kota Stone">Kota Stone</option>
                  <option value="Tandur Stone">Tandur Stone</option>
                  <option value="Wooden Flooring">Wooden Flooring</option>
                  <option value="Vinyl Flooring">Vinyl Flooring</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Bathroom Floor Material</label>
                <select style={styles.select} value={quickInputs.bathFloorMat} onChange={e => setQuickInputs({ ...quickInputs, bathFloorMat: e.target.value })}>
                  <option value="Anti-Skid Tiles">Anti-Skid Tiles</option>
                  <option value="Ceramic Tiles">Ceramic Tiles</option>
                  <option value="Vitrified Tiles">Vitrified Tiles</option>
                  <option value="Granite">Granite</option>
                  <option value="Same as Main Flooring">Same as Main Flooring</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Bathroom Wall Material</label>
                <select style={styles.select} value={quickInputs.bathWallMat} onChange={e => setQuickInputs({ ...quickInputs, bathWallMat: e.target.value })}>
                  <option value="Ceramic Wall Tiles">Ceramic Wall Tiles</option>
                  <option value="Glazed Wall Tiles">Glazed Wall Tiles</option>
                  <option value="Vitrified Wall Tiles">Vitrified Wall Tiles</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Kitchen Dado Material</label>
                <select style={styles.select} value={quickInputs.kitchenDadoMat} onChange={e => setQuickInputs({ ...quickInputs, kitchenDadoMat: e.target.value })}>
                  <option value="Ceramic Wall Tiles">Ceramic Wall Tiles</option>
                  <option value="Glazed Wall Tiles">Glazed Wall Tiles</option>
                  <option value="Vitrified Wall Tiles">Vitrified Wall Tiles</option>
                </select>
              </div>
            </div>

            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Main Tile Size</label>
                <select style={styles.select} value={quickInputs.mainTileSize} onChange={e => setQuickInputs({ ...quickInputs, mainTileSize: e.target.value })}>
                  {Object.keys(TILE_SIZES).map(sz => (
                    <option key={sz} value={sz}>{TILE_SIZES[sz].label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Wastage Allowance</label>
                <select style={styles.select} value={quickInputs.wastagePct} onChange={e => setQuickInputs({ ...quickInputs, wastagePct: parseFloat(e.target.value) })}>
                  <option value={5}>Standard Straight Laying (5%)</option>
                  <option value={8}>Large Format Tiles (8%)</option>
                  <option value={10}>Diagonal Laying (10%)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Installation Method</label>
                <select style={styles.select} value={quickInputs.installMethod} onChange={e => setQuickInputs({ ...quickInputs, installMethod: e.target.value })}>
                  <option value="Tile Adhesive">Tile Adhesive (Thin-Bed)</option>
                  <option value="Cement-Sand Mortar Bed">Cement-Sand Mortar Bed (1:4)</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Estimated Skirting (RFT)</label>
                <input type="number" style={styles.input} value={quickInputs.skirtingRft} onChange={e => setQuickInputs({ ...quickInputs, skirtingRft: parseFloat(e.target.value) || 0 })} placeholder="Enter RFT length" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button style={styles.btnReset} onClick={handleResetQuick}>🔄 Reset Quick Form</button>
            </div>
          </div>

          {/* QUICK RESULTS TABLE */}
          <div style={styles.stepperCard}>
            <div style={styles.sectionHeader}>
              <span>Quick Calculation Results (Tiles Qty, Ancillary Materials & Labour)</span>
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

            <div style={styles.summaryGrid}>
              <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                <span style={styles.metricTitle}>Total Area</span>
                <span style={styles.metricVal}>{formatNumber(quickInputs.totalArea)} Sqft</span>
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
                <span style={styles.metricTitle}>Grand Estimated Total</span>
                <span style={styles.metricVal}>{formatCurrency(quickCalcResults.grandTotal)}</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(quickCalcResults.costPerSqft)} / Sqft)</span>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Master Code</th>
                    <th style={styles.th}>Item Category</th>
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
                          backgroundColor: item.category.includes('Tiles') ? '#e0f2fe' : item.category.includes('Labour') ? '#ffedd5' : '#f1f5f9',
                          color: item.category.includes('Tiles') ? '#0369a1' : item.category.includes('Labour') ? '#c2410c' : '#334155',
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
              <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={handleDownloadPDF}>📄 Download in PDF</button>
              <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export in Excel</button>
              <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share on WhatsApp</button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 5. DETAILED ROOM-WISE MODE */}
      {/* ========================================================= */}
      {calcMode === 'detailed' && (
        <div style={styles.stepperCard}>
          <div style={styles.sectionHeader}>
            <span>📐 Detailed Room-Wise Calculator</span>
          </div>

          <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Room Name</label>
                <input style={styles.input} value={roomInput.type} onChange={e => setRoomInput({ ...roomInput, type: e.target.value })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Length (Ft)</label>
                <input type="number" style={styles.input} value={roomInput.length} onChange={e => setRoomInput({ ...roomInput, length: parseFloat(e.target.value) || 0 })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Width (Ft)</label>
                <input type="number" style={styles.input} value={roomInput.width} onChange={e => setRoomInput({ ...roomInput, width: parseFloat(e.target.value) || 0 })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Quantity (Nos)</label>
                <input type="number" style={styles.input} value={roomInput.nos} onChange={e => setRoomInput({ ...roomInput, nos: parseInt(e.target.value) || 1 })} />
              </div>
            </div>

            <div style={styles.grid3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Flooring Material</label>
                <select style={styles.select} value={roomInput.flooringType} onChange={e => setRoomInput({ ...roomInput, flooringType: e.target.value })}>
                  <option value="Vitrified Tiles">Vitrified Tiles</option>
                  <option value="Ceramic Tiles">Ceramic Tiles</option>
                  <option value="Granite">Granite Slab</option>
                  <option value="Marble">Marble Slab</option>
                  <option value="Kota Stone">Kota Stone</option>
                  <option value="Tandur Stone">Tandur Stone</option>
                  <option value="Parking Tiles">Parking Tiles</option>
                  <option value="Wooden Flooring">Wooden Flooring</option>
                  <option value="Vinyl Flooring">Vinyl Flooring</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Tile Size</label>
                <select style={styles.select} value={roomInput.tileSize} onChange={e => setRoomInput({ ...roomInput, tileSize: e.target.value })}>
                  {Object.keys(TILE_SIZES).map(sz => (
                    <option key={sz} value={sz}>{TILE_SIZES[sz].label}</option>
                  ))}
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Installation Bed</label>
                <select style={styles.select} value={roomInput.layingMethod} onChange={e => setRoomInput({ ...roomInput, layingMethod: e.target.value })}>
                  <option value="Tile adhesive thin-bed">Tile Adhesive Thin-Bed</option>
                  <option value="Tile adhesive medium-bed">Tile Adhesive Medium-Bed</option>
                  <option value="Cement-sand mortar bed">Cement-Sand Mortar Bed</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button style={styles.btnPrimary} onClick={handleAddRoom}>+ Add Room to List</button>
              <button style={styles.btnReset} onClick={handleResetDetailed}>🔄 Reset Detailed Rooms</button>
            </div>
          </div>

          {/* Rooms Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Room</th>
                  <th style={styles.th}>Dimensions</th>
                  <th style={styles.th}>Net Area</th>
                  <th style={styles.th}>Material</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => {
                  const area = (r.length * r.width * r.nos) - (r.deductions || 0);
                  return (
                    <tr key={r.id}>
                      <td style={styles.td}><strong>{r.type}</strong> (x{r.nos})</td>
                      <td style={styles.td}>{r.length}' x {r.width}'</td>
                      <td style={styles.td}><strong>{formatNumber(area)} Sqft</strong></td>
                      <td style={styles.td}>{r.flooringType}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button style={styles.btnSecondary} onClick={() => handleDuplicateRoom(r)}>Duplicate</button>
                          <button style={styles.btnDanger} onClick={() => handleRemoveRoom(r.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DETAILED RESULTS TABLE WITH ANCILLARY MATERIALS & LABOUR */}
          <div style={{ marginTop: '16px' }}>
            <div style={styles.sectionHeader}>
              <span>Detailed Calculation Results (Tiles Qty, Ancillary Materials & Labour)</span>
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
                <span style={styles.metricTitle}>Net Flooring Area</span>
                <span style={styles.metricVal}>{formatNumber(detailedCalcResults.totalNetSqft)} Sqft</span>
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
                <span style={styles.metricTitle}>Grand Estimated Total</span>
                <span style={styles.metricVal}>{formatCurrency(detailedCalcResults.grandTotal)}</span>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(detailedCalcResults.costPerSqft)} / Sqft)</span>
              </div>
            </div>

            {/* Detailed Itemized Results Table (Tiles + Cement + Adhesive + Sand + Grout + Spacers + Water + Labour) */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Master Code</th>
                    <th style={styles.th}>Item Category</th>
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
                          backgroundColor: item.category.includes('Tiles') ? '#e0f2fe' : item.category.includes('Labour') ? '#ffedd5' : '#f1f5f9',
                          color: item.category.includes('Tiles') ? '#0369a1' : item.category.includes('Labour') ? '#c2410c' : '#334155',
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={handleDownloadPDF}>📄 Download in PDF</button>
              <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export in Excel</button>
              <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}














