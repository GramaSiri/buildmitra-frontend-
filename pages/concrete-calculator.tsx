import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate } from "../utils/masterRates";
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

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' as const },
  header: { background: 'linear-gradient(135deg, #4a2c11, #7f1d1d)', padding: '16px 20px', borderRadius: '12px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(127, 29, 29, 0.15)' },
  backButton: { backgroundColor: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', flex: 1 },
  sectionTitle: { backgroundColor: '#e2e8f0', color: '#1e293b', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', fontWeight: '800', borderLeft: '4px solid #7f1d1d' },
  memberBar: { display: 'flex', gap: '8px', overflowX: 'auto' as const, paddingBottom: '8px', marginBottom: '16px' },
  memberTab: (active: boolean) => ({
    padding: '8px 14px',
    borderRadius: '8px',
    border: active ? '2px solid #7f1d1d' : '1px solid #cbd5e1',
    backgroundColor: active ? '#fef2f2' : 'white',
    color: active ? '#7f1d1d' : '#475569',
    fontWeight: active ? '800' : '600',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' },
  inputGroup: { marginBottom: '8px' },
  label: { display: 'block', marginBottom: '4px', fontWeight: '700', fontSize: '11px', color: '#475569', textTransform: 'uppercase' as const },
  input: { width: '100%', padding: '9px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' as const, backgroundColor: '#fff' },
  select: { width: '100%', padding: '9px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff' },
  buttonRow: { display: 'flex', justifyContent: 'center', gap: '14px', margin: '20px 0' },
  buttonGenerate: { backgroundColor: '#7f1d1d', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '800' },
  buttonExport: { backgroundColor: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  buttonWhatsapp: { backgroundColor: '#25D366', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  cardContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' },
  card: { padding: '14px', borderRadius: '10px', textAlign: 'center' as const, color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardBlue: { backgroundColor: '#0284c7' },
  cardLightGreen: { backgroundColor: '#16a34a' },
  cardLightOrange: { backgroundColor: '#ea580c' },
  cardLightTeal: { backgroundColor: '#0f766e' },
  cardValue: { fontSize: '16px', fontWeight: '800', marginTop: '4px' },
  tableContainer: { overflowX: 'auto' as const, marginTop: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '12px' },
  th: { backgroundColor: '#334155', color: 'white', padding: '10px 12px', textAlign: 'left' as const, fontWeight: '700' },
  td: { padding: '9px 12px', borderBottom: '1px solid #f1f5f9' },
  evenRow: { backgroundColor: '#f8fafc' },
  rateInfo: { backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', textAlign: 'center' as const, marginBottom: '16px', color: '#334155', border: '1px solid #cbd5e1' }
};

const formatNumber = (num: number | null | undefined, decimals = 2): string => {
  if (num === null || num === undefined || isNaN(num)) return "0.00";
  return num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rate Unavailable";
  return `₹${formatNumber(amount, 2)}`;
};

export default function ConcretePage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();
  const { rates: contextRates, loading } = useRates();
  
  // Selected Member Type
  const [memberType, setMemberType] = useState<MemberType>('slab');

  // Generic & Member-Specific Dimension Inputs
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [length, setLength] = useState(26);
  const [width, setWidth] = useState(37);
  const [thickness, setThickness] = useState(150); // mm
  const [height, setHeight] = useState(10); // ft (for columns / walls)
  const [quantityCount, setQuantityCount] = useState(1); // Nos of members

  // Staircase inputs
  const [flightWidth, setFlightWidth] = useState(4); // ft
  const [flightLength, setFlightLength] = useState(10); // ft
  const [stepCount, setStepCount] = useState(10);
  const [riser, setRiser] = useState(150); // mm
  const [tread, setTread] = useState(250); // mm

  // Retaining Wall inputs
  const [stemTopThickness, setStemTopThickness] = useState(150); // mm
  const [stemBottomThickness, setStemBottomThickness] = useState(300); // mm
  const [baseWidth, setBaseWidth] = useState(5); // ft
  const [baseThickness, setBaseThickness] = useState(300); // mm

  // Custom Structural Member Inputs
  const [customVolumeCum, setCustomVolumeCum] = useState(10);
  const [customShutteringSqft, setCustomShutteringSqft] = useState(500);
  const [customSteelRatioKg, setCustomSteelRatioKg] = useState(80); // kg/m3

  // Mix & Wastage
  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [wastage, setWastage] = useState(3);
  
  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  // Dynamic Rate Lookups with Realistic Indian Master Rates Fallbacks (Bengaluru / India 2026 Standards)
  const cementRateRes = getMasterRate(["cement", "opc", "ppc", "cement bag"], 380, ["bm_material_rates"]);
  const sandRateRes = getMasterRate(["m sand", "m-sand", "sand", "fine aggregate"], 46, ["bm_material_rates"]);
  const agg20RateRes = getMasterRate(["20mm aggregate", "20 mm aggregate", "ca1", "20mm"], 38, ["bm_material_rates"]);
  const agg12RateRes = getMasterRate(["12mm aggregate", "12 mm aggregate", "ca2", "12mm", "10mm aggregate"], 32.64, ["bm_material_rates"]);
  const waterRateRes = getMasterRate(["water", "construction water"], 0.15, ["bm_material_rates", "bm_service_rates"]); // ₹0.15 / Ltr = ₹150 / 1000L kL
  const rmcRateRes = getMasterRate(["rmc", "ready mix concrete", "ready-mix concrete"], 4200, ["bm_material_rates", "bm_service_rates"]);

  // Labour Rates with standard fallback defaults
  const concretingLabourRes = getMasterRate(["concrete labour", "concreting labour", "concrete pouring", "labour concrete"], 450, ["bm_labour_rates", "bm_service_rates"]); // ₹450 / m³ (₹12.75 / CFT)
  const shutteringLabourRes = getMasterRate(["shuttering labour", "formwork labour", "shuttering"], 35, ["bm_labour_rates", "bm_service_rates"]); // ₹35 / SQFT
  const barBendingLabourRes = getMasterRate(["bar bending", "steel binding", "rebar labour", "bar bending labour"], 16, ["bm_labour_rates", "bm_service_rates"]); // ₹16 / KG

  // Standard Mix Ratios according to IS 456:2000 & IS 10262:2019 (Quantities per CUM of wet concrete)
  const concreteMix: Record<string, { cementBags: number; sandCft: number; agg20Cft: number; agg12Cft: number; waterLtr: number; isRmc?: boolean }> = {
    M15: { cementBags: 6.34, sandCft: 15.54, agg20Cft: 18.65, agg12Cft: 12.43, waterLtr: 175 },
    M20: { cementBags: 8.06, sandCft: 14.83, agg20Cft: 17.80, agg12Cft: 11.87, waterLtr: 195 },
    M25: { cementBags: 8.70, sandCft: 13.80, agg20Cft: 17.00, agg12Cft: 11.30, waterLtr: 165 },
    M30: { cementBags: 9.30, sandCft: 12.70, agg20Cft: 16.20, agg12Cft: 10.80, waterLtr: 160 },
    M35: { cementBags: 9.80, sandCft: 12.10, agg20Cft: 15.80, agg12Cft: 10.50, waterLtr: 155 },
    M40: { cementBags: 10.40, sandCft: 11.50, agg20Cft: 15.20, agg12Cft: 10.10, waterLtr: 150 },
    RMC_M20: { cementBags: 0, sandCft: 0, agg20Cft: 0, agg12Cft: 0, waterLtr: 0, isRmc: true },
    RMC_M25: { cementBags: 0, sandCft: 0, agg20Cft: 0, agg12Cft: 0, waterLtr: 0, isRmc: true }
  };

  const calculateResults = () => {
    let volumeCft = 0;
    let volumeCum = 0;
    let shutteringAreaSqft = 0;
    let steelWeightKg = 0;

    const toFt = (val: number) => unit === 'feet' ? val : val * 3.2808399;

    // Member Specific Geometry & Engineering Quantities per IS 456
    if (memberType === 'slab') {
      const lFt = toFt(length), wFt = toFt(width), tFt = thickness / 304.8;
      volumeCft = lFt * wFt * tFt * quantityCount;
      volumeCum = volumeCft / 35.3146667;
      // Formwork: Bottom Soffit + Edge Perimeter
      shutteringAreaSqft = ((lFt * wFt) + (2 * (lFt + wFt) * tFt)) * quantityCount;
      // Steel: 1% nominal steel ratio (~78.5 kg/m³)
      steelWeightKg = volumeCum * 78.5;
    } else if (memberType === 'column') {
      const lFt = toFt(length), wFt = toFt(width), hFt = toFt(height);
      volumeCft = lFt * wFt * hFt * quantityCount;
      volumeCum = volumeCft / 35.3146667;
      // Formwork: 4 vertical faces
      shutteringAreaSqft = (2 * (lFt + wFt) * hFt) * quantityCount;
      // Steel: 1.8% nominal column steel ratio (~141.3 kg/m³)
      steelWeightKg = volumeCum * 141.3;
    } else if (memberType === 'beam') {
      const wFt = thickness / 304.8, dFt = (height || 450) / 304.8, lFt = toFt(length);
      volumeCft = wFt * dFt * lFt * quantityCount;
      volumeCum = volumeCft / 35.3146667;
      // Formwork: Bottom Soffit + 2 vertical sides
      shutteringAreaSqft = ((wFt + 2 * dFt) * lFt) * quantityCount;
      // Steel: 1.5% beam steel ratio (~117.8 kg/m³)
      steelWeightKg = volumeCum * 117.8;
    } else if (memberType === 'footing') {
      const lFt = toFt(length), wFt = toFt(width), dFt = thickness / 304.8;
      volumeCft = lFt * wFt * dFt * quantityCount;
      volumeCum = volumeCft / 35.3146667;
      // Formwork: 4 side faces
      shutteringAreaSqft = (2 * (lFt + wFt) * dFt) * quantityCount;
      // Steel: 0.8% footing steel mesh (~62.8 kg/m³)
      steelWeightKg = volumeCum * 62.8;
    } else if (memberType === 'staircase') {
      const fwFt = toFt(flightWidth), flFt = toFt(flightLength), wtFt = thickness / 304.8;
      const rFt = riser / 304.8, trFt = tread / 304.8;
      const waistVolume = fwFt * flFt * wtFt;
      const stepsVolume = 0.5 * rFt * trFt * fwFt * stepCount;
      volumeCft = (waistVolume + stepsVolume) * quantityCount;
      volumeCum = volumeCft / 35.3146667;
      // Formwork: Soffit + Risers + Side Stringers
      shutteringAreaSqft = (flFt * fwFt + (stepCount * rFt * fwFt) + (2 * 0.5 * flFt * (stepCount * rFt))) * quantityCount;
      // Steel: 1.2% staircase rebar (~94.2 kg/m³)
      steelWeightKg = volumeCum * 94.2;
    } else if (memberType === 'lintel') {
      const lFt = toFt(length), wFt = thickness / 304.8, dFt = (height || 200) / 304.8;
      volumeCft = lFt * wFt * dFt * quantityCount;
      volumeCum = volumeCft / 35.3146667;
      shutteringAreaSqft = ((wFt + 2 * dFt) * lFt) * quantityCount;
      steelWeightKg = volumeCum * 78.5;
    } else if (memberType === 'chajja') {
      const lFt = toFt(length), projFt = toFt(width), tFt = thickness / 304.8;
      volumeCft = lFt * projFt * tFt * quantityCount;
      volumeCum = volumeCft / 35.3146667;
      shutteringAreaSqft = (lFt * projFt + (2 * projFt + lFt) * tFt) * quantityCount;
      steelWeightKg = volumeCum * 70.7;
    } else if (memberType === 'retaining_wall') {
      const lFt = toFt(length), hFt = toFt(height), stemAvgTFt = ((stemTopThickness + stemBottomThickness) / 2) / 304.8;
      const bWFt = toFt(baseWidth), bTFt = baseThickness / 304.8;
      const stemVol = lFt * hFt * stemAvgTFt;
      const baseVol = lFt * bWFt * bTFt;
      volumeCft = (stemVol + baseVol) * quantityCount;
      volumeCum = volumeCft / 35.3146667;
      shutteringAreaSqft = (2 * lFt * hFt + 2 * lFt * bTFt) * quantityCount;
      steelWeightKg = volumeCum * 109.9;
    } else if (memberType === 'raft') {
      const lFt = toFt(length), wFt = toFt(width), tFt = thickness / 304.8;
      volumeCft = lFt * wFt * tFt * quantityCount;
      volumeCum = volumeCft / 35.3146667;
      shutteringAreaSqft = (2 * (lFt + wFt) * tFt) * quantityCount;
      steelWeightKg = volumeCum * 78.5;
    } else {
      // Custom Structural Member
      volumeCum = customVolumeCum;
      volumeCft = volumeCum * 35.3146667;
      shutteringAreaSqft = customShutteringSqft;
      steelWeightKg = volumeCum * customSteelRatioKg;
    }

    const mix = concreteMix[concreteGrade] || concreteMix.M20;
    const wastageFactor = 1 + (Number(wastage || 0) / 100);

    // Apply wastage ONLY ONCE to dry material quantities
    const cementBags = mix.isRmc ? 0 : volumeCum * mix.cementBags * wastageFactor;
    const sandCft = mix.isRmc ? 0 : volumeCum * mix.sandCft * wastageFactor;
    const agg20Cft = mix.isRmc ? 0 : volumeCum * mix.agg20Cft * wastageFactor;
    const agg12Cft = mix.isRmc ? 0 : volumeCum * mix.agg12Cft * wastageFactor;
    const waterLtr = mix.isRmc ? 0 : volumeCum * mix.waterLtr * wastageFactor;
    const rmcVolumeCum = mix.isRmc ? volumeCum * wastageFactor : 0;

    // Rates Evaluation
    const cementRate = cementRateRes.rate || 380;
    const sandRate = sandRateRes.rate || 46;
    const agg20Rate = agg20RateRes.rate || 38;
    const agg12Rate = agg12RateRes.rate || 32.64;
    const waterRate = waterRateRes.rate || 0.15; // ₹0.15 per liter
    const rmcRate = rmcRateRes.rate || 4200;

    const concretingLabourRate = concretingLabourRes.rate || 450;
    const shutteringLabourRate = shutteringLabourRes.rate || 35;
    const barBendingLabourRate = barBendingLabourRes.rate || 16;

    // Item Cost Calculation
    const cementCost = mix.isRmc ? 0 : cementBags * cementRate;
    const sandCost = mix.isRmc ? 0 : sandCft * sandRate;
    const agg20Cost = mix.isRmc ? 0 : agg20Cft * agg20Rate;
    const agg12Cost = mix.isRmc ? 0 : agg12Cft * agg12Rate;
    const waterCost = mix.isRmc ? 0 : waterLtr * waterRate;
    const rmcCost = mix.isRmc ? rmcVolumeCum * rmcRate : 0;

    const materialTotal = mix.isRmc ? rmcCost : (cementCost + sandCost + agg20Cost + agg12Cost + waterCost);

    const concretingLabourCost = volumeCum * concretingLabourRate;
    const shutteringLabourCost = shutteringAreaSqft * shutteringLabourRate;
    const barBendingLabourCost = steelWeightKg * barBendingLabourRate;
    const labourTotal = concretingLabourCost + shutteringLabourCost + barBendingLabourCost;

    const grandTotal = materialTotal + labourTotal;

    return {
      volumeCum,
      volumeCft,
      shutteringAreaSqft,
      steelWeightKg,
      quantities: {
        cementBags,
        sandCft,
        agg20Cft,
        agg12Cft,
        waterLtr,
        rmcVolumeCum
      },
      rates: {
        cement: cementRate,
        sand: sandRate,
        agg20: agg20Rate,
        agg12: agg12Rate,
        water: waterRate,
        rmc: rmcRate,
        concretingLabour: concretingLabourRate,
        shutteringLabour: shutteringLabourRate,
        barBendingLabour: barBendingLabourRate
      },
      costs: {
        cement: cementCost,
        sand: sandCost,
        agg20: agg20Cost,
        agg12: agg12Cost,
        water: waterCost,
        rmc: rmcCost,
        materialTotal,
        concretingLabour: concretingLabourCost,
        shutteringLabour: shutteringLabourCost,
        barBendingLabour: barBendingLabourCost,
        labourTotal,
        grandTotal
      }
    };
  };

  const handleGenerate = () => {
    setResults(calculateResults());
    setGenerated(true);
  };

  const handleBack = () => {
    router.push('/calculators');
  };

  const handleExportPDF = () => {
    if (!results) return;
    checkAndRun('calculator_export', 'concrete-calculator', () => {
      const isRmc = concreteGrade.startsWith("RMC");
      downloadBuildMitraPDF({
        documentTitle: `CONCRETE & STRUCTURAL BOQ (${memberType.toUpperCase()})`,
        documentNo: `BM-CNC-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        projectName: `Concrete Structural Work — ${memberType}`,
        buyerName: "Client / Buyer",
        contractorName: "BuildMitra Structural Division",
        items: [
          ...(isRmc ? [
            { sno: 1, itemCode: "MAT-RMC", category: "Material", description: `Ready-Mix Concrete (${concreteGrade})`, quantity: results.quantities.rmcVolumeCum, unit: "CUM", rate: results.rates.rmc, amount: results.costs.rmc }
          ] : [
            { sno: 1, itemCode: "MAT-CEM", category: "Material", description: "Cement (OPC/PPC 50kg Bags)", quantity: results.quantities.cementBags, unit: "BAG", rate: results.rates.cement, amount: results.costs.cement },
            { sno: 2, itemCode: "MAT-MSN", category: "Material", description: "M-Sand (Fine Aggregate)", quantity: results.quantities.sandCft, unit: "CFT", rate: results.rates.sand, amount: results.costs.sand },
            { sno: 3, itemCode: "MAT-AGG20", category: "Material", description: "20mm Coarse Aggregate", quantity: results.quantities.agg20Cft, unit: "CFT", rate: results.rates.agg20, amount: results.costs.agg20 },
            { sno: 4, itemCode: "MAT-AGG12", category: "Material", description: "12mm Coarse Aggregate", quantity: results.quantities.agg12Cft, unit: "CFT", rate: results.rates.agg12, amount: results.costs.agg12 }
          ]),
          { sno: 5, itemCode: "SRV-CNC-LAB", category: "Labour", description: "Concreting Labour Charges", quantity: results.volumeCum, unit: "CUM", rate: results.rates.concretingLabour, amount: results.costs.concretingLabour },
          { sno: 6, itemCode: "SRV-SHT-LAB", category: "Labour", description: "Formwork & Shuttering Labour", quantity: results.shutteringAreaSqft, unit: "SQFT", rate: results.rates.shutteringLabour, amount: results.costs.shutteringLabour }
        ],
        notes: `Concrete Volume: ${formatNumber(results.volumeCft)} CFT (${formatNumber(results.volumeCum)} CUM) | Grade: ${concreteGrade}`
      });
    });
  };

  const handleExportExcel = () => {
    if (!results) return;
    checkAndRun('calculator_export', 'concrete-calculator', () => {
      const isRmc = concreteGrade.startsWith("RMC");
      const data = [
        { Item: 'Concrete Net Volume (CFT)', Quantity: formatNumber(results.volumeCft), Unit: 'CFT', Rate: '-', Cost: '-' },
        { Item: 'Concrete Volume (CUM)', Quantity: formatNumber(results.volumeCum), Unit: 'CUM', Rate: '-', Cost: '-' },
        ...(isRmc ? [
          { Item: 'Ready-Mix Concrete (RMC)', Quantity: formatNumber(results.quantities.rmcVolumeCum), Unit: 'CUM', Rate: formatCurrency(results.rates.rmc), Cost: formatCurrency(results.costs.rmc) }
        ] : [
          { Item: 'Cement (PPC / OPC)', Quantity: formatNumber(results.quantities.cementBags), Unit: 'bags', Rate: formatCurrency(results.rates.cement), Cost: formatCurrency(results.costs.cement) },
          { Item: 'M Sand / Fine Agg', Quantity: formatNumber(results.quantities.sandCft), Unit: 'CFT', Rate: formatCurrency(results.rates.sand), Cost: formatCurrency(results.costs.sand) },
          { Item: '20mm Coarse Aggregate', Quantity: formatNumber(results.quantities.agg20Cft), Unit: 'CFT', Rate: formatCurrency(results.rates.agg20), Cost: formatCurrency(results.costs.agg20) },
          { Item: '12mm Coarse Aggregate', Quantity: formatNumber(results.quantities.agg12Cft), Unit: 'CFT', Rate: formatCurrency(results.rates.agg12), Cost: formatCurrency(results.costs.agg12) },
          { Item: 'Water', Quantity: formatNumber(results.quantities.waterLtr), Unit: 'Ltr', Rate: `₹${results.rates.water}/Ltr`, Cost: formatCurrency(results.costs.water) }
        ]),
        { Item: 'Material Subtotal', Quantity: '', Unit: '', Rate: '', Cost: formatCurrency(results.costs.materialTotal) },
        { Item: 'Labour - Concreting', Quantity: formatNumber(results.volumeCum), Unit: 'CUM', Rate: formatCurrency(results.rates.concretingLabour), Cost: formatCurrency(results.costs.concretingLabour) },
        { Item: 'Labour - Formwork / Shuttering', Quantity: formatNumber(results.shutteringAreaSqft), Unit: 'SQFT', Rate: formatCurrency(results.rates.shutteringLabour), Cost: formatCurrency(results.costs.shutteringLabour) },
        { Item: 'Labour - Steel Bar Bending', Quantity: formatNumber(results.steelWeightKg), Unit: 'KG', Rate: formatCurrency(results.rates.barBendingLabour), Cost: formatCurrency(results.costs.barBendingLabour) },
        { Item: 'Labour Subtotal', Quantity: '', Unit: '', Rate: '', Cost: formatCurrency(results.costs.labourTotal) },
        { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Rate: '', Cost: formatCurrency(results.costs.grandTotal) }
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Concrete_Calculator');
      XLSX.writeFile(wb, `Concrete_${memberType}_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  };

  const handleWhatsApp = () => {
    if (!results) return;
    checkAndRun('calculator_export', 'concrete-calculator', () => {
      const memberObj = MEMBER_TYPES.find(m => m.id === memberType);
      const message = `🏗️ *BUILDMITRA INFRA — CONCRETE BOQ REPORT*\nNo:378, Near Gurusidheswra theater, 80 ft Road, JP Nagar, 4th Block, 9th Phase, Bengaluru- 560062 | 📱 +91 76769 42386\n\n*MEMBER TYPE*: ${memberObj?.label || memberType}\n• *Concrete Volume*: ${formatNumber(results.volumeCft)} CFT (${formatNumber(results.volumeCum)} CUM)\n• *Cement Bags*: ${formatNumber(results.quantities.cementBags)} Bags\n• *Material Cost*: ${formatCurrency(results.costs.materialTotal)}\n• *Labour Cost*: ${formatCurrency(results.costs.labourTotal)}\n• *GRAND TOTAL*: ${formatCurrency(results.costs.grandTotal)}\n\nGenerated via BuildMitra Construction Suite.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    });
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Admin Master Rates...</div>;
  }

  const isRmc = concreteGrade.startsWith("RMC");

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backButton}>←</button>
        <h1 style={styles.headerTitle}>Concrete Calculator (IS 456:2000 & IS 10262:2019)</h1>
      </div>

      <MarketRateTrend />
      
      <div style={styles.rateInfo}>
        <div>💰 <b>Admin Master Rates:</b> Cement ₹{cementRateRes.rate}/bag | Sand ₹{sandRateRes.rate}/CFT | 20mm Agg ₹{agg20RateRes.rate}/CFT | Water ₹{waterRateRes.rate}/Ltr</div>
        <div style={{ marginTop: '4px' }}>👷 <b>Labour Rates:</b> Concreting ₹{concretingLabourRes.rate}/CUM | Shuttering ₹{shutteringLabourRes.rate}/SQFT | Bar Bending ₹{barBendingLabourRes.rate}/KG</div>
      </div>
      
      <div style={styles.sectionTitle}>🏗️ Select Structural Member Type</div>
      <div style={styles.memberBar}>
        {MEMBER_TYPES.map(m => (
          <button key={m.id} onClick={() => setMemberType(m.id)} style={styles.memberTab(memberType === m.id)}>
            <span>{m.icon}</span> {m.label}
          </button>
        ))}
      </div>

      <div style={styles.sectionTitle}>📐 {MEMBER_TYPES.find(m => m.id === memberType)?.label} Dimensions & Mix Specifications</div>
      
      {/* MEMBER SPECIFIC INPUT FIELDS */}
      {memberType === 'custom' ? (
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Net Volume (CUM m³)</label>
            <input type="number" value={customVolumeCum} onChange={(e) => setCustomVolumeCum(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Shuttering Area (SQFT)</label>
            <input type="number" value={customShutteringSqft} onChange={(e) => setCustomShutteringSqft(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Steel Ratio (KG / m³)</label>
            <input type="number" value={customSteelRatioKg} onChange={(e) => setCustomSteelRatioKg(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
        </div>
      ) : memberType === 'staircase' ? (
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Flight Width ({unit})</label>
            <input type="number" value={flightWidth} onChange={(e) => setFlightWidth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Flight Length ({unit})</label>
            <input type="number" value={flightLength} onChange={(e) => setFlightLength(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Waist Thickness (mm)</label>
            <input type="number" value={thickness} onChange={(e) => setThickness(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Number of Steps</label>
            <input type="number" value={stepCount} onChange={(e) => setStepCount(parseInt(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Riser Height (mm)</label>
            <input type="number" value={riser} onChange={(e) => setRiser(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Tread Width (mm)</label>
            <input type="number" value={tread} onChange={(e) => setTread(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Number of Flights</label>
            <input type="number" value={quantityCount} onChange={(e) => setQuantityCount(parseInt(e.target.value) || 1)} style={styles.input} />
          </div>
        </div>
      ) : memberType === 'retaining_wall' ? (
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Wall Length ({unit})</label>
            <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Stem Height ({unit})</label>
            <input type="number" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Stem Top Thickness (mm)</label>
            <input type="number" value={stemTopThickness} onChange={(e) => setStemTopThickness(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Stem Bottom Thickness (mm)</label>
            <input type="number" value={stemBottomThickness} onChange={(e) => setStemBottomThickness(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Base Slab Width ({unit})</label>
            <input type="number" value={baseWidth} onChange={(e) => setBaseWidth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Base Thickness (mm)</label>
            <input type="number" value={baseThickness} onChange={(e) => setBaseThickness(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Length ({unit})</label>
            <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Width ({unit})</label>
            <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Thickness / Depth (mm)</label>
            <input type="number" value={thickness} onChange={(e) => setThickness(parseFloat(e.target.value) || 0)} style={styles.input} />
          </div>
          {memberType === 'column' && (
            <div>
              <label style={styles.label}>Height ({unit})</label>
              <input type="number" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} style={styles.input} />
            </div>
          )}
          <div>
            <label style={styles.label}>Quantity (Nos)</label>
            <input type="number" value={quantityCount} onChange={(e) => setQuantityCount(parseInt(e.target.value) || 1)} style={styles.input} />
          </div>
        </div>
      )}

      {/* CONCRETE MIX SPECIFICATIONS */}
      <div style={styles.grid}>
        <div>
          <label style={styles.label}>Measurement Unit</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value as any)} style={styles.select}>
            <option value="feet">Feet (ft)</option>
            <option value="meters">Meters (m)</option>
          </select>
        </div>
        <div>
          <label style={styles.label}>Concrete Grade (IS 456)</label>
          <select value={concreteGrade} onChange={(e) => setConcreteGrade(e.target.value)} style={styles.select}>
            <option value="M15">M15 (1:2:4)</option>
            <option value="M20">M20 (1:1.5:3)</option>
            <option value="M25">M25 (1:1:2)</option>
            <option value="M30">M30 (Design Mix)</option>
            <option value="M35">M35 (Design Mix)</option>
            <option value="M40">M40 (High Strength)</option>
            <option value="RMC_M20">RMC M20 (Ready Mix)</option>
            <option value="RMC_M25">RMC M25 (Ready Mix)</option>
          </select>
        </div>
        <div>
          <label style={styles.label}>Wastage Allowance (%)</label>
          <input type="number" value={wastage} onChange={(e) => setWastage(parseFloat(e.target.value) || 0)} style={styles.input} />
        </div>
      </div>
      
      <div style={styles.buttonRow}>
        <button onClick={handleGenerate} style={styles.buttonGenerate}>🔨 Calculate Concrete & Materials</button>
        {generated && results && (
          <>
            <button onClick={handleExportPDF} style={{ ...styles.buttonExport, backgroundColor: '#800020', color: 'white' }}>🖨️ PDF Letterhead</button>
            <button onClick={handleExportExcel} style={styles.buttonExport}>📊 Excel</button>
            <button onClick={handleWhatsApp} style={styles.buttonWhatsapp}>💬 Share</button>
          </>
        )}
      </div>
      
      {generated && results && (
        <div>
          <div style={styles.cardContainer}>
            <div style={{ ...styles.card, ...styles.cardBlue }}>
              <div>📦</div>
              <div>Concrete Volume</div>
              <div style={styles.cardValue}>{formatNumber(results.volumeCft)} CFT ({formatNumber(results.volumeCum)} m³)</div>
            </div>
            <div style={{ ...styles.card, ...styles.cardLightGreen }}>
              <div>🪣</div>
              <div>{isRmc ? 'RMC Volume' : 'Cement Bags'}</div>
              <div style={styles.cardValue}>{isRmc ? `${formatNumber(results.quantities.rmcVolumeCum)} m³` : `${formatNumber(results.quantities.cementBags)} bags`}</div>
            </div>
            <div style={{ ...styles.card, ...styles.cardLightOrange }}>
              <div>💰</div>
              <div>Material Subtotal</div>
              <div style={styles.cardValue}>{formatCurrency(results.costs.materialTotal)}</div>
            </div>
            <div style={{ ...styles.card, ...styles.cardLightTeal }}>
              <div>💎</div>
              <div>Grand Total</div>
              <div style={styles.cardValue}>{formatCurrency(results.costs.grandTotal)}</div>
            </div>
          </div>
          
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Item / Material Description</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Master Rate</th>
                  <th style={styles.th}>Cost (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}><b>Concrete Net Volume</b></td>
                  <td style={styles.td}>{formatNumber(results.volumeCft)}</td>
                  <td style={styles.td}>CFT</td>
                  <td style={styles.td}>-</td>
                  <td style={styles.td}>-</td>
                </tr>
                <tr style={styles.evenRow}>
                  <td style={styles.td}><b>Concrete Metric Volume</b></td>
                  <td style={styles.td}>{formatNumber(results.volumeCum)}</td>
                  <td style={styles.td}>CUM (m³)</td>
                  <td style={styles.td}>-</td>
                  <td style={styles.td}>-</td>
                </tr>
                
                {!isRmc && (
                  <>
                    <tr>
                      <td style={styles.td}>Cement (PPC / OPC 43/53)</td>
                      <td style={styles.td}>{formatNumber(results.quantities.cementBags)}</td>
                      <td style={styles.td}>bags</td>
                      <td style={styles.td}>{formatCurrency(results.rates.cement)}</td>
                      <td style={styles.td}><b>{formatCurrency(results.costs.cement)}</b></td>
                    </tr>
                    <tr style={styles.evenRow}>
                      <td style={styles.td}>M Sand / Fine Aggregate</td>
                      <td style={styles.td}>{formatNumber(results.quantities.sandCft)}</td>
                      <td style={styles.td}>CFT</td>
                      <td style={styles.td}>{formatCurrency(results.rates.sand)}</td>
                      <td style={styles.td}><b>{formatCurrency(results.costs.sand)}</b></td>
                    </tr>
                    <tr>
                      <td style={styles.td}>20mm Coarse Aggregate</td>
                      <td style={styles.td}>{formatNumber(results.quantities.agg20Cft)}</td>
                      <td style={styles.td}>CFT</td>
                      <td style={styles.td}>{formatCurrency(results.rates.agg20)}</td>
                      <td style={styles.td}><b>{formatCurrency(results.costs.agg20)}</b></td>
                    </tr>
                    <tr style={styles.evenRow}>
                      <td style={styles.td}>12mm Coarse Aggregate</td>
                      <td style={styles.td}>{formatNumber(results.quantities.agg12Cft)}</td>
                      <td style={styles.td}>CFT</td>
                      <td style={styles.td}>{formatCurrency(results.rates.agg12)}</td>
                      <td style={styles.td}><b>{formatCurrency(results.costs.agg12)}</b></td>
                    </tr>
                    <tr>
                      <td style={styles.td}>Water (Mix & Curing)</td>
                      <td style={styles.td}>{formatNumber(results.quantities.waterLtr)}</td>
                      <td style={styles.td}>Ltr</td>
                      <td style={styles.td}>₹{results.rates.water}/Ltr</td>
                      <td style={styles.td}><b>{formatCurrency(results.costs.water)}</b></td>
                    </tr>
                  </>
                )}

                {isRmc && (
                  <tr>
                    <td style={styles.td}>Ready-Mix Concrete (RMC)</td>
                    <td style={styles.td}>{formatNumber(results.quantities.rmcVolumeCum)}</td>
                    <td style={styles.td}>CUM</td>
                    <td style={styles.td}>{formatCurrency(results.rates.rmc)}</td>
                    <td style={styles.td}><b>{formatCurrency(results.costs.rmc)}</b></td>
                  </tr>
                )}

                <tr style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                  <td colSpan={4} style={styles.td}>MATERIAL SUBTOTAL</td>
                  <td style={{ ...styles.td, color: '#0369a1', fontSize: '13px' }}>{formatCurrency(results.costs.materialTotal)}</td>
                </tr>

                <tr>
                  <td style={styles.td}>Labour — Concreting (Pouring, Vibration & Compaction)</td>
                  <td style={styles.td}>{formatNumber(results.volumeCum)}</td>
                  <td style={styles.td}>CUM</td>
                  <td style={styles.td}>{formatCurrency(results.rates.concretingLabour)}</td>
                  <td style={styles.td}><b>{formatCurrency(results.costs.concretingLabour)}</b></td>
                </tr>
                <tr style={styles.evenRow}>
                  <td style={styles.td}>Labour — Formwork & Shuttering (Surface Area)</td>
                  <td style={styles.td}>{formatNumber(results.shutteringAreaSqft)}</td>
                  <td style={styles.td}>SQFT</td>
                  <td style={styles.td}>{formatCurrency(results.rates.shutteringLabour)}</td>
                  <td style={styles.td}><b>{formatCurrency(results.costs.shutteringLabour)}</b></td>
                </tr>
                <tr>
                  <td style={styles.td}>Labour — Steel Bar Bending & Tying (Rebar Weight)</td>
                  <td style={styles.td}>{formatNumber(results.steelWeightKg)}</td>
                  <td style={styles.td}>KG</td>
                  <td style={styles.td}>{formatCurrency(results.rates.barBendingLabour)}</td>
                  <td style={styles.td}><b>{formatCurrency(results.costs.barBendingLabour)}</b></td>
                </tr>

                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                  <td colSpan={4} style={styles.td}>LABOUR SUBTOTAL</td>
                  <td style={{ ...styles.td, color: '#0f766e', fontSize: '13px' }}>{formatCurrency(results.costs.labourTotal)}</td>
                </tr>

                <tr style={{ backgroundColor: '#7f1d1d', color: 'white', fontWeight: 'bold' }}>
                  <td colSpan={4} style={{ padding: '12px' }}>ESTIMATED GRAND TOTAL (MATERIAL + LABOUR)</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{formatCurrency(results.costs.grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => alert(`Saved ${MEMBER_TYPES.find(m => m.id === memberType)?.label} Concrete Calculation to Active Project!`)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 0, backgroundColor: '#0f766e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            >
              💾 Save to Project
            </button>
            <button
              onClick={() => alert(`Added ${MEMBER_TYPES.find(m => m.id === memberType)?.label} Concrete Line Items to BOQ!`)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: 'white', color: '#0f766e', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📋 Add to BOQ
            </button>
          </div>

          <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', color: '#334155', lineHeight: '1.6' }}>
            <b style={{ fontSize: '12px', color: '#7f1d1d' }}>📜 Applicable Standards & Engineering Basis:</b>
            <div style={{ marginTop: '6px' }}>• <b>IS 456:2000:</b> Plain and Reinforced Concrete — Code of Practice</div>
            <div>• <b>IS 10262:2019:</b> Concrete Mix Proportioning Guidelines (Dry Volume Factor = 1.54)</div>
            <div>• <b>Water Cost Correction:</b> Water mix requirement calculated per liter (₹0.15/Ltr) preventing rate unit overflow</div>
            <div>• <b>Labour Rates Standard:</b> Concreting (CUM), Formwork/Shuttering (SQFT Contact Area), Bar Bending (KG Rebar Weight)</div>
            <div>• <b>⚠️ Structural Warning:</b> Calculations are for preliminary estimation. Formal structural designs require approval from a certified structural engineer.</div>
          </div>
        </div>
      )}
    </div>
  );
}
