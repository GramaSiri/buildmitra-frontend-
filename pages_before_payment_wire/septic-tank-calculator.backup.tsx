import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#6b4c3b', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#6b4c3b', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' },
  row4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' },
  row3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' },
  inputGroup: { marginBottom: '6px' },
  label: { display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '10px', color: '#555' },
  input: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box', backgroundColor: '#fff' },
  select: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' },
  buttonRow: { display: 'flex', justifyContent: 'center', gap: '15px', margin: '20px 0' },
  buttonGenerate: { backgroundColor: '#800020', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  buttonExport: { backgroundColor: '#28a745', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  buttonWhatsapp: { backgroundColor: '#25D366', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  cardContainer: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' },
  card: { padding: '8px', borderRadius: '10px', textAlign: 'center', color: 'white' },
  cardBlue: { backgroundColor: '#2196F3' },
  cardLightGreen: { backgroundColor: '#8BC34A' },
  cardLightOrange: { backgroundColor: '#FFB74D' },
  cardLightTeal: { backgroundColor: '#4DB6AC' },
  cardValue: { fontSize: '14px', fontWeight: 'bold', marginTop: '4px' },
  tableContainer: { overflowX: 'auto', marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#6b4c3b', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  rateInfo: { backgroundColor: '#e8f4f8', padding: '6px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', marginBottom: '10px', color: '#555' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getWeightPerMeter = (dia) => {
  return (dia * dia) / 162.2;
};

export default function SepticTankPage() {
  const router = useRouter();
  const { rates, loading } = useRates();
  
  // Tank Dimensions
  const [tankNos, setTankNos] = useState(1);
  const [length, setLength] = useState(8);
  const [width, setWidth] = useState(4);
  const [depth, setDepth] = useState(5);
  const [wallThickness, setWallThickness] = useState(0.2);
  const [topSlabThickness, setTopSlabThickness] = useState(0.15);
  const [unit, setUnit] = useState('feet');
  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [cover, setCover] = useState(40);
  const [wastage, setWastage] = useState(3);
  
  // Pipes and Fittings
  const [inletPipeDia, setInletPipeDia] = useState(110);
  const [inletPipeLength, setInletPipeLength] = useState(5);
  const [outletPipeDia, setOutletPipeDia] = useState(110);
  const [outletPipeLength, setOutletPipeLength] = useState(5);
  const [ventPipeDia, setVentPipeDia] = useState(75);
  const [ventPipeLength, setVentPipeLength] = useState(8);
  const [pipeRate, setPipeRate] = useState(150);
  
  // Waterproofing
  const waterproofingRate = 35;
  
  // Reinforcement
  const [verticalBarDia, setVerticalBarDia] = useState(12);
  const [verticalBarSpacing, setVerticalBarSpacing] = useState(150);
  const [horizontalBarDia, setHorizontalBarDia] = useState(10);
  const [horizontalBarSpacing, setHorizontalBarSpacing] = useState(200);
  const [baseBarDia, setBaseBarDia] = useState(12);
  const [baseBarSpacing, setBaseBarSpacing] = useState(150);
  const [topSlabBarDia, setTopSlabBarDia] = useState(10);
  const [topSlabBarSpacing, setTopSlabBarSpacing] = useState(150);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);

  const calculateResults = () => {
    let L = unit === 'feet' ? length * 0.3048 : length;
    let W = unit === 'feet' ? width * 0.3048 : width;
    let D = unit === 'feet' ? depth * 0.3048 : depth;
    let t = unit === 'feet' ? wallThickness * 0.3048 : wallThickness;
    let topT = topSlabThickness;
    
    // Total Area
    const totalAreaSqft = (L * W) * tankNos * 10.764;
    
    // Concrete Volume (Walls + Base + Top Slab)
    const wallVolume = 2 * (L + W) * D * t;
    const baseVolume = L * W * t;
    const topSlabVolume = L * W * topT;
    const totalVolumeCum = (wallVolume + baseVolume + topSlabVolume) * tankNos;
    const totalVolumeCft = totalVolumeCum * 35.315;
    
    // Septic Tank Capacity
    const tankCapacityCum = L * W * D;
    const tankCapacityLtr = tankCapacityCum * 1000;
    
    // Concrete Materials
    let cement, sand, aggregate20, aggregate12;
    if (concreteGrade === 'M20') {
      cement = totalVolumeCum * 7.5;
      sand = totalVolumeCum * 0.42;
      aggregate20 = totalVolumeCum * 0.5;
      aggregate12 = totalVolumeCum * 0.34;
    } else if (concreteGrade === 'M25') {
      cement = totalVolumeCum * 8.2;
      sand = totalVolumeCum * 0.4;
      aggregate20 = totalVolumeCum * 0.48;
      aggregate12 = totalVolumeCum * 0.32;
    } else {
      cement = totalVolumeCum * 8.8;
      sand = totalVolumeCum * 0.38;
      aggregate20 = totalVolumeCum * 0.45;
      aggregate12 = totalVolumeCum * 0.31;
    }
    
    const cementWithWastage = cement * (1 + wastage/100);
    const sandCft = sand * 35.315;
    const agg20Cft = aggregate20 * 35.315;
    const agg12Cft = aggregate12 * 35.315;
    const waterLtr = cementWithWastage * 50 * 0.45;
    
    // Steel Calculations
    const totalPerimeterM = 2 * (L + W);
    const verticalBarsNos = Math.floor(D / (verticalBarSpacing / 1000)) + 1;
    const verticalTotalLengthM = totalPerimeterM * verticalBarsNos * tankNos;
    const verticalSteelKg = verticalTotalLengthM * getWeightPerMeter(verticalBarDia);
    
    const horizontalBarsNosPerLevel = Math.floor(totalPerimeterM / (horizontalBarSpacing / 1000)) + 1;
    const horizontalBarsNos = horizontalBarsNosPerLevel * (Math.floor(D / 1) + 1);
    const horizontalTotalLengthM = horizontalBarsNos * tankNos;
    const horizontalSteelKg = horizontalTotalLengthM * getWeightPerMeter(horizontalBarDia);
    
    const baseBarsX = Math.floor(L / (baseBarSpacing / 1000)) + 1;
    const baseBarsY = Math.floor(W / (baseBarSpacing / 1000)) + 1;
    const baseTotalLengthM = (baseBarsX * W + baseBarsY * L) * tankNos;
    const baseSteelKg = baseTotalLengthM * getWeightPerMeter(baseBarDia);
    
    const topBarsX = Math.floor(L / (topSlabBarSpacing / 1000)) + 1;
    const topBarsY = Math.floor(W / (topSlabBarSpacing / 1000)) + 1;
    const topTotalLengthM = (topBarsX * W + topBarsY * L) * tankNos;
    const topSlabSteelKg = topTotalLengthM * getWeightPerMeter(topSlabBarDia);
    
    const totalSteelKg = (verticalSteelKg + horizontalSteelKg + baseSteelKg + topSlabSteelKg) * (1 + wastage/100);
    const bindingWire = totalSteelKg * 0.008;
    const coverBlocks = totalVolumeCum * 15;
    
    // Pipe Calculations
    const inletPipeLengthM = inletPipeLength * 0.3048;
    const outletPipeLengthM = outletPipeLength * 0.3048;
    const ventPipeLengthM = ventPipeLength * 0.3048;
    
    const totalPipeLengthM = (inletPipeLengthM + outletPipeLengthM + ventPipeLengthM) * tankNos;
    const pipeCost = totalPipeLengthM * pipeRate;
    
    // Waterproofing Area
    const waterproofingArea = (2 * (L + W) * D * 10.764 + (L * W * 10.764)) * tankNos;
    const waterproofingCost = waterproofingArea * waterproofingRate;
    
    // Costs
    const cementCost = cementWithWastage * (rates?.cement || 400);
    const sandCost = sandCft * (rates?.sand || 55);
    const agg20Cost = agg20Cft * (rates?.aggregate20 || 50);
    const agg12Cost = agg12Cft * (rates?.aggregate12 || 48);
    const waterCost = waterLtr * (rates?.water || 0.5);
    const steelCost = totalSteelKg * (rates?.steel || 68);
    const bindingWireCost = bindingWire * (rates?.bindingWire || 80);
    const coverBlockCost = coverBlocks * (rates?.coverBlock || 5);
    
    const materialTotal = cementCost + sandCost + agg20Cost + agg12Cost + waterCost + steelCost + bindingWireCost + coverBlockCost + pipeCost + waterproofingCost;
    const labourPerCum = rates?.labour_concrete || 1200;
    const labourCost = totalVolumeCum * labourPerCum;
    const grandTotal = materialTotal + labourCost;
    
    const labourBreakdown = {
      shuttering: totalVolumeCum * 500,
      barBending: totalVolumeCum * 350,
      concreting: totalVolumeCum * 250,
      profit: totalVolumeCum * 100,
      total: labourCost
    };
    
    const steelBreakdown = [
      { item: `${verticalBarDia}mm Vertical Bars @ ${verticalBarSpacing}mm`, quantity: verticalSteelKg },
      { item: `${horizontalBarDia}mm Horizontal Bars @ ${horizontalBarSpacing}mm`, quantity: horizontalSteelKg },
      { item: `${baseBarDia}mm Base Mesh @ ${baseBarSpacing}mm`, quantity: baseSteelKg },
      { item: `${topSlabBarDia}mm Top Slab Mesh @ ${topSlabBarSpacing}mm`, quantity: topSlabSteelKg }
    ];
    
    return {
      concrete: { volumeCum: formatNumber(totalVolumeCum), volumeCft: formatNumber(totalVolumeCft), cement: formatNumber(cementWithWastage), sandCft: formatNumber(sandCft), agg20Cft: formatNumber(agg20Cft), agg12Cft: formatNumber(agg12Cft), water: formatNumber(waterLtr) },
      capacity: { cum: formatNumber(tankCapacityCum), liters: formatNumber(tankCapacityLtr) },
      area: { total: formatNumber(totalAreaSqft), waterproofing: formatNumber(waterproofingArea) },
      steel: { vertical: formatNumber(verticalSteelKg), horizontal: formatNumber(horizontalSteelKg), base: formatNumber(baseSteelKg), topSlab: formatNumber(topSlabSteelKg), total: formatNumber(totalSteelKg) },
      steelBreakdown,
      accessories: { bindingWire: formatNumber(bindingWire), coverBlocks: formatNumber(coverBlocks) },
      pipes: { inlet: inletPipeDia, outlet: outletPipeDia, vent: ventPipeDia, length: formatNumber(totalPipeLengthM), cost: formatNumber(pipeCost) },
      waterproofing: { area: formatNumber(waterproofingArea), cost: formatNumber(waterproofingCost) },
      costs: { cement: formatNumber(cementCost), sand: formatNumber(sandCost), agg20: formatNumber(agg20Cost), agg12: formatNumber(agg12Cost), water: formatNumber(waterCost), steel: formatNumber(steelCost), bindingWire: formatNumber(bindingWireCost), coverBlock: formatNumber(coverBlockCost), pipes: formatNumber(pipeCost), waterproofing: formatNumber(waterproofingCost), materialTotal: formatNumber(materialTotal), labour: formatNumber(labourCost), grandTotal: formatNumber(grandTotal) },
      labourBreakdown: {
        shuttering: formatNumber(labourBreakdown.shuttering),
        barBending: formatNumber(labourBreakdown.barBending),
        concreting: formatNumber(labourBreakdown.concreting),
        profit: formatNumber(labourBreakdown.profit),
        total: formatNumber(labourBreakdown.total)
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

  const handleExportExcel = () => {
    if (!results) return;
    const data = [
      { Item: 'Concrete Volume', Quantity: results.concrete.volumeCft, Unit: 'CFT', Cost: '-' },
      { Item: 'Tank Capacity', Quantity: results.capacity.liters, Unit: 'Liters', Cost: '-' },
      { Item: 'Total Area', Quantity: results.area.total, Unit: 'sqft', Cost: '-' },
      { Item: 'Cement', Quantity: results.concrete.cement, Unit: 'bags', Cost: `₹${results.costs.cement}` },
      { Item: 'M Sand', Quantity: results.concrete.sandCft, Unit: 'CFT', Cost: `₹${results.costs.sand}` },
      { Item: '20mm Aggregate', Quantity: results.concrete.agg20Cft, Unit: 'CFT', Cost: `₹${results.costs.agg20}` },
      { Item: '12mm Aggregate', Quantity: results.concrete.agg12Cft, Unit: 'CFT', Cost: `₹${results.costs.agg12}` },
      { Item: 'Water', Quantity: results.concrete.water, Unit: 'Ltr', Cost: `₹${results.costs.water}` },
      ...results.steelBreakdown.map(s => ({ Item: `Steel - ${s.item}`, Quantity: formatNumber(s.quantity), Unit: 'kg', Cost: `₹${formatNumber(s.quantity * (rates?.steel || 68))}` })),
      { Item: 'Binding Wire', Quantity: results.accessories.bindingWire, Unit: 'kg', Cost: `₹${results.costs.bindingWire}` },
      { Item: 'Cover Blocks', Quantity: results.accessories.coverBlocks, Unit: 'Nos', Cost: `₹${results.costs.coverBlock}` },
      { Item: 'Inlet Sleeve Pipe', Quantity: results.pipes.inlet, Unit: 'mm', Cost: `₹${results.costs.pipes * 0.4}` },
      { Item: 'Outlet Sleeve Pipe', Quantity: results.pipes.outlet, Unit: 'mm', Cost: `₹${results.costs.pipes * 0.4}` },
      { Item: 'Air Vent Pipe', Quantity: results.pipes.vent, Unit: 'mm', Cost: `₹${results.costs.pipes * 0.2}` },
      { Item: 'Waterproofing', Quantity: results.waterproofing.area, Unit: 'sqft', Cost: `₹${results.costs.waterproofing}` },
      { Item: 'Material Total', Quantity: '', Unit: '', Cost: `₹${results.costs.materialTotal}` },
      { Item: 'Labour - Shuttering', Quantity: results.concrete.volumeCum, Unit: 'CUM', Cost: `₹${results.labourBreakdown.shuttering}` },
      { Item: 'Labour - Bar Bending', Quantity: results.concrete.volumeCum, Unit: 'CUM', Cost: `₹${results.labourBreakdown.barBending}` },
      { Item: 'Labour - Concreting', Quantity: results.concrete.volumeCum, Unit: 'CUM', Cost: `₹${results.labourBreakdown.concreting}` },
      { Item: 'Contractor Profit', Quantity: results.concrete.volumeCum, Unit: 'CUM', Cost: `₹${results.labourBreakdown.profit}` },
      { Item: 'Total Labour', Quantity: '', Unit: '', Cost: `₹${results.costs.labour}` },
      { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Cost: `₹${results.costs.grandTotal}` }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Septic_Tank');
    XLSX.writeFile(wb, `Septic_Tank_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🚽 SEPTIC TANK CALCULATION\n\nSize: ${length} x ${width} x ${depth} ${unit}\nCapacity: ${results.capacity.liters} Liters\nConcrete: ${results.concrete.volumeCft} CFT\nCement: ${results.concrete.cement} bags\nSteel: ${results.steel.total} kg\nPipes: Inlet ${inletPipeDia}mm, Outlet ${outletPipeDia}mm, Vent ${ventPipeDia}mm\nTotal Cost: ₹${results.costs.grandTotal}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🚽 Septic Tank Calculator')
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Material Rates: Cement ₹${rates?.cement || 400}/bag | Steel ₹${rates?.steel || 68}/kg | Pipe ₹${pipeRate}/m`),
      React.createElement('div', null, React.createElement('small', null, `👷 Labour: ₹${rates?.labour_concrete || 1200}/CUM`))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Tank Dimensions'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Nos'), React.createElement('input', { type: 'number', value: tankNos, onChange: (e) => setTankNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length (ft)'), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (ft)'), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Depth (ft)'), React.createElement('input', { type: 'number', value: depth, onChange: (e) => setDepth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Wall Thick'), React.createElement('input', { type: 'number', value: wallThickness, onChange: (e) => setWallThickness(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Top Slab Thick'), React.createElement('input', { type: 'number', value: topSlabThickness, onChange: (e) => setTopSlabThickness(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Unit'), React.createElement('select', { value: unit, onChange: (e) => setUnit(e.target.value), style: styles.select }, React.createElement('option', { value: 'feet' }, 'Feet'), React.createElement('option', { value: 'meters' }, 'Meters'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Grade'), React.createElement('select', { value: concreteGrade, onChange: (e) => setConcreteGrade(e.target.value), style: styles.select }, React.createElement('option', { value: 'M20' }, 'M20'), React.createElement('option', { value: 'M25' }, 'M25'), React.createElement('option', { value: 'M30' }, 'M30'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Cover (mm)'), React.createElement('input', { type: 'number', value: cover, onChange: (e) => setCover(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Wastage (%)'), React.createElement('input', { type: 'number', value: wastage, onChange: (e) => setWastage(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🔧 Pipes & Fittings'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Inlet Dia (mm)'), React.createElement('input', { type: 'number', value: inletPipeDia, onChange: (e) => setInletPipeDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Inlet Length (ft)'), React.createElement('input', { type: 'number', value: inletPipeLength, onChange: (e) => setInletPipeLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Outlet Dia (mm)'), React.createElement('input', { type: 'number', value: outletPipeDia, onChange: (e) => setOutletPipeDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Outlet Length (ft)'), React.createElement('input', { type: 'number', value: outletPipeLength, onChange: (e) => setOutletPipeLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Vent Dia (mm)'), React.createElement('input', { type: 'number', value: ventPipeDia, onChange: (e) => setVentPipeDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Vent Length (ft)'), React.createElement('input', { type: 'number', value: ventPipeLength, onChange: (e) => setVentPipeLength(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🔄 Reinforcement Details'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', { style: styles.subSection },
        React.createElement('div', { style: styles.subTitle }, '⬆️ Vertical Bars'),
        React.createElement('div', { style: styles.inputGroup }, React.createElement('label', { style: styles.label }, 'Dia (mm)'), React.createElement('input', { type: 'number', value: verticalBarDia, onChange: (e) => setVerticalBarDia(parseFloat(e.target.value)), style: styles.input })),
        React.createElement('div', { style: styles.inputGroup }, React.createElement('label', { style: styles.label }, 'Spacing (mm)'), React.createElement('input', { type: 'number', value: verticalBarSpacing, onChange: (e) => setVerticalBarSpacing(parseFloat(e.target.value)), style: styles.input }))
      ),
      React.createElement('div', { style: styles.subSection },
        React.createElement('div', { style: styles.subTitle }, '↔️ Horizontal Bars'),
        React.createElement('div', { style: styles.inputGroup }, React.createElement('label', { style: styles.label }, 'Dia (mm)'), React.createElement('input', { type: 'number', value: horizontalBarDia, onChange: (e) => setHorizontalBarDia(parseFloat(e.target.value)), style: styles.input })),
        React.createElement('div', { style: styles.inputGroup }, React.createElement('label', { style: styles.label }, 'Spacing (mm)'), React.createElement('input', { type: 'number', value: horizontalBarSpacing, onChange: (e) => setHorizontalBarSpacing(parseFloat(e.target.value)), style: styles.input }))
      ),
      React.createElement('div', { style: styles.subSection },
        React.createElement('div', { style: styles.subTitle }, '🟫 Base Mesh'),
        React.createElement('div', { style: styles.inputGroup }, React.createElement('label', { style: styles.label }, 'Dia (mm)'), React.createElement('input', { type: 'number', value: baseBarDia, onChange: (e) => setBaseBarDia(parseFloat(e.target.value)), style: styles.input })),
        React.createElement('div', { style: styles.inputGroup }, React.createElement('label', { style: styles.label }, 'Spacing (mm)'), React.createElement('input', { type: 'number', value: baseBarSpacing, onChange: (e) => setBaseBarSpacing(parseFloat(e.target.value)), style: styles.input }))
      ),
      React.createElement('div', { style: styles.subSection },
        React.createElement('div', { style: styles.subTitle }, '🏗️ Top Slab Mesh'),
        React.createElement('div', { style: styles.inputGroup }, React.createElement('label', { style: styles.label }, 'Dia (mm)'), React.createElement('input', { type: 'number', value: topSlabBarDia, onChange: (e) => setTopSlabBarDia(parseFloat(e.target.value)), style: styles.input })),
        React.createElement('div', { style: styles.inputGroup }, React.createElement('label', { style: styles.label }, 'Spacing (mm)'), React.createElement('input', { type: 'number', value: topSlabBarSpacing, onChange: (e) => setTopSlabBarSpacing(parseFloat(e.target.value)), style: styles.input }))
      )
    ),
    
    React.createElement('div', { style: styles.buttonRow },
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate Estimate'),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement('button', { onClick: handleExportExcel, style: styles.buttonExport }, '📊 Excel'),
        React.createElement('button', { onClick: handleWhatsApp, style: styles.buttonWhatsapp }, '💬 Share')
      )
    ),
    
    generated && results && React.createElement('div', null,
      React.createElement('div', { style: styles.cardContainer },
        React.createElement('div', { style: { ...styles.card, ...styles.cardBlue } }, React.createElement('div', null, '📦'), React.createElement('div', null, 'Concrete'), React.createElement('div', { style: styles.cardValue }, `${results.concrete.volumeCft} CFT`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightGreen } }, React.createElement('div', null, '🚽'), React.createElement('div', null, 'Capacity'), React.createElement('div', { style: styles.cardValue }, `${results.capacity.liters} L`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightOrange } }, React.createElement('div', null, '⚙️'), React.createElement('div', null, 'Steel'), React.createElement('div', { style: styles.cardValue }, `${results.steel.total} kg`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightTeal } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Total Cost'), React.createElement('div', { style: styles.cardValue }, `₹${results.costs.grandTotal}`))
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Item'), React.createElement('th', { style: styles.th }, 'Quantity'), React.createElement('th', { style: styles.th }, 'Unit'), React.createElement('th', { style: styles.th }, 'Cost'))),
          React.createElement('tbody', null,
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Concrete Volume'), React.createElement('td', { style: styles.td }, results.concrete.volumeCft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Tank Capacity'), React.createElement('td', { style: styles.td }, results.capacity.liters), React.createElement('td', { style: styles.td }, 'Liters'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Cement'), React.createElement('td', { style: styles.td }, results.concrete.cement), React.createElement('td', { style: styles.td }, 'bags'), React.createElement('td', { style: styles.td }, `₹${results.costs.cement}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'M Sand'), React.createElement('td', { style: styles.td }, results.concrete.sandCft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.sand}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, '20mm Aggregate'), React.createElement('td', { style: styles.td }, results.concrete.agg20Cft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.agg20}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, '12mm Aggregate'), React.createElement('td', { style: styles.td }, results.concrete.agg12Cft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.agg12}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Water'), React.createElement('td', { style: styles.td }, results.concrete.water), React.createElement('td', { style: styles.td }, 'Ltr'), React.createElement('td', { style: styles.td }, `₹${results.costs.water}`)),
            results.steelBreakdown.map((item, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, `Steel - ${item.item}`), React.createElement('td', { style: styles.td }, formatNumber(item.quantity)), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, `₹${formatNumber(item.quantity * (rates?.steel || 68))}`))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Binding Wire'), React.createElement('td', { style: styles.td }, results.accessories.bindingWire), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, `₹${results.costs.bindingWire}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Cover Blocks'), React.createElement('td', { style: styles.td }, results.accessories.coverBlocks), React.createElement('td', { style: styles.td }, 'Nos'), React.createElement('td', { style: styles.td }, `₹${results.costs.coverBlock}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Inlet Sleeve'), React.createElement('td', { style: styles.td }, `${results.pipes.inlet}mm x ${inletPipeLength}ft`), React.createElement('td', { style: styles.td }, '-'), React.createElement('td', { style: styles.td }, `₹${results.costs.pipes * 0.4}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Outlet Sleeve'), React.createElement('td', { style: styles.td }, `${results.pipes.outlet}mm x ${outletPipeLength}ft`), React.createElement('td', { style: styles.td }, '-'), React.createElement('td', { style: styles.td }, `₹${results.costs.pipes * 0.4}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Air Vent Pipe'), React.createElement('td', { style: styles.td }, `${results.pipes.vent}mm x ${ventPipeLength}ft`), React.createElement('td', { style: styles.td }, '-'), React.createElement('td', { style: styles.td }, `₹${results.costs.pipes * 0.2}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Waterproofing'), React.createElement('td', { style: styles.td }, results.waterproofing.area), React.createElement('td', { style: styles.td }, 'sqft'), React.createElement('td', { style: styles.td }, `₹${results.costs.waterproofing}`)),
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Material Total'), React.createElement('td', { style: styles.td }, `₹${results.costs.materialTotal}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Labour - Shuttering'), React.createElement('td', { style: styles.td }, results.concrete.volumeCum), React.createElement('td', { style: styles.td }, 'CUM'), React.createElement('td', { style: styles.td }, `₹${results.labourBreakdown.shuttering}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Labour - Bar Bending'), React.createElement('td', { style: styles.td }, results.concrete.volumeCum), React.createElement('td', { style: styles.td }, 'CUM'), React.createElement('td', { style: styles.td }, `₹${results.labourBreakdown.barBending}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Labour - Concreting'), React.createElement('td', { style: styles.td }, results.concrete.volumeCum), React.createElement('td', { style: styles.td }, 'CUM'), React.createElement('td', { style: styles.td }, `₹${results.labourBreakdown.concreting}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Contractor Profit'), React.createElement('td', { style: styles.td }, results.concrete.volumeCum), React.createElement('td', { style: styles.td }, 'CUM'), React.createElement('td', { style: styles.td }, `₹${results.labourBreakdown.profit}`)),
            React.createElement('tr', { style: { backgroundColor: '#f0f7f5', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Total Labour'), React.createElement('td', { style: styles.td }, `₹${results.costs.labour}`)),
            React.createElement('tr', { style: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: { padding: '8px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '8px' } }, `₹${results.costs.grandTotal}`))
          )
        )
      )
    )
  );
}

