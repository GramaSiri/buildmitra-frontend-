import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#e67e22', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#e67e22', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' },
  row4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' },
  inputGroup: { marginBottom: '6px' },
  label: { display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '10px', color: '#555' },
  input: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box', backgroundColor: '#fff' },
  select: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' },
  buttonSmall: { backgroundColor: '#2196F3', color: 'white', padding: '4px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', marginTop: '4px' },
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
  th: { backgroundColor: '#e67e22', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  rateInfo: { backgroundColor: '#e8f4f8', padding: '6px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', marginBottom: '10px', color: '#555' },
  imageBox: { 
    backgroundColor: '#1a1a2e', 
    borderRadius: '8px', 
    padding: '10px', 
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '120px'
  },
  archImage: { 
    maxWidth: '100%', 
    maxHeight: '100px', 
    objectFit: 'contain',
    borderRadius: '4px'
  }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getWeightPerMeter = (dia) => {
  return (dia * dia) / 162.2;
};

// Pre-loaded SVG Arch Images as data URLs
const archImages = {
  'Semi-circular': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%231a1a2e'/%3E%3Cpath d='M30,120 L170,120' stroke='%23ffd700' stroke-width='3' fill='none'/%3E%3Cpath d='M30,120 A70,70 0 0,1 170,120' stroke='%23ffd700' stroke-width='3' fill='none'/%3E%3Ctext x='100' y='30' fill='white' font-size='12' text-anchor='middle' font-family='Arial'%3ESemi-circular Arch%3C/text%3E%3Ctext x='100' y='140' fill='%2390EE90' font-size='10' text-anchor='middle'%3ESpan: 10ft | Rise: 5ft%3C/text%3E%3C/svg%3E",
  'Segmental': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%231a1a2e'/%3E%3Cpath d='M30,120 L170,120' stroke='%23ffd700' stroke-width='3' fill='none'/%3E%3Cpath d='M40,120 A80,40 0 0,1 160,120' stroke='%23ffd700' stroke-width='3' fill='none'/%3E%3Ctext x='100' y='30' fill='white' font-size='12' text-anchor='middle' font-family='Arial'%3ESegmental Arch%3C/text%3E%3Ctext x='100' y='140' fill='%2390EE90' font-size='10' text-anchor='middle'%3ESpan: 12ft | Rise: 4ft%3C/text%3E%3C/svg%3E",
  'Gothic': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%231a1a2e'/%3E%3Cpath d='M30,120 L170,120' stroke='%23ffd700' stroke-width='3' fill='none'/%3E%3Cpath d='M30,120 L100,30 L170,120' stroke='%23ffd700' stroke-width='3' fill='none'/%3E%3Ccircle cx='100' cy='75' r='45' stroke='%23ffd700' stroke-width='2' fill='none' stroke-dasharray='4,4'/%3E%3Ctext x='100' y='30' fill='white' font-size='12' text-anchor='middle' font-family='Arial'%3EGothic Arch%3C/text%3E%3Ctext x='100' y='140' fill='%2390EE90' font-size='10' text-anchor='middle'%3ESpan: 12ft | Rise: 6ft%3C/text%3E%3C/svg%3E",
  'Flat': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%231a1a2e'/%3E%3Cpath d='M30,120 L170,120' stroke='%23ffd700' stroke-width='3' fill='none'/%3E%3Crect x='40' y='80' width='120' height='40' stroke='%23ffd700' stroke-width='3' fill='none'/%3E%3Ctext x='100' y='30' fill='white' font-size='12' text-anchor='middle' font-family='Arial'%3EFlat Arch%3C/text%3E%3Ctext x='100' y='140' fill='%2390EE90' font-size='10' text-anchor='middle'%3ESpan: 12ft | Height: 3ft%3C/text%3E%3C/svg%3E"
};

export default function ArchPage() {
  const router = useRouter();
  const { rates, loading } = useRates();
  
  const [archNos, setArchNos] = useState(1);
  const [span, setSpan] = useState(6);
  const [rise, setRise] = useState(3);
  const [archType, setArchType] = useState('Semi-circular');
  const [thickness, setThickness] = useState(0.3);
  const [width, setWidth] = useState(0.75);
  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [cover, setCover] = useState(25);
  const [wastage, setWastage] = useState(3);
  
  const [mainBarDia, setMainBarDia] = useState(12);
  const [mainBarNos, setMainBarNos] = useState(4);
  const [distBarDia, setDistBarDia] = useState(10);
  const [distBarSpacing, setDistBarSpacing] = useState(150);
  const [stirrupDia, setStirrupDia] = useState(8);
  const [stirrupSpacing, setStirrupSpacing] = useState(150);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);
  
  const cementRate = rates?.cement || 400;
  const sandRate = rates?.sand || 55;
  const aggregate20Rate = rates?.aggregate20 || 50;
  const aggregate12Rate = rates?.aggregate12 || 48;
  const steelRate = rates?.steel || 68;
  const bindingWireRate = rates?.bindingWire || 80;
  const coverBlockRate = rates?.coverBlock || 5;
  const labourRate = rates?.labour_concrete || 1200;

  const calculateArchLength = () => {
    if (archType === 'Semi-circular') {
      return Math.PI * (span / 2);
    } else if (archType === 'Segmental') {
      const radius = (Math.pow(span, 2) + 4 * Math.pow(rise, 2)) / (8 * rise);
      const angle = 2 * Math.asin(span / (2 * radius));
      return radius * angle;
    } else if (archType === 'Gothic') {
      return (span * 2.2);
    } else {
      return span + 2 * rise;
    }
  };

  const calculateResults = () => {
    const archLength = calculateArchLength();
    const archVolume = archLength * thickness * width * archNos;
    const volumeCum = archVolume / 35.315;
    const volumeCft = archVolume;
    
    const cementBags = volumeCum * 7.5;
    const sandCft = volumeCum * 0.42 * 35.315;
    const aggregateTotalCft = volumeCum * 0.84 * 35.315;
    const aggregate20Cft = aggregateTotalCft * 0.6;
    const aggregate12Cft = aggregateTotalCft * 0.4;
    
    const mainTotalLengthM = archLength / 3.28084 * mainBarNos * archNos;
    const mainSteelWeight = mainTotalLengthM * getWeightPerMeter(mainBarDia);
    
    const archWidthInM = width / 3.28084;
    const distBarsNos = Math.floor(archWidthInM * 1000 / distBarSpacing) + 1;
    const distTotalLengthM = archLength / 3.28084 * distBarsNos * archNos;
    const distSteelWeight = distTotalLengthM * getWeightPerMeter(distBarDia);
    
    const stirrupPerimeterM = 2 * (thickness + width) - (8 * cover / 1000) + (24 * stirrupDia / 1000);
    const stirrupNosPerM = Math.ceil(archLength / (stirrupSpacing / 1000)) + 1;
    const totalStirrupNos = stirrupNosPerM * archNos;
    const stirrupTotalLengthM = stirrupPerimeterM * totalStirrupNos;
    const stirrupWeight = stirrupTotalLengthM * getWeightPerMeter(stirrupDia);
    
    const totalSteelKg = mainSteelWeight + distSteelWeight + stirrupWeight;
    const steelWithWastage = totalSteelKg * (1 + wastage/100);
    
    const bindingWire = steelWithWastage * 0.008;
    const coverBlocks = volumeCum * 20;
    const waterLtr = cementBags * 50 * 0.45;
    
    const cementCost = cementBags * cementRate;
    const sandCost = sandCft * sandRate;
    const agg20Cost = aggregate20Cft * aggregate20Rate;
    const agg12Cost = aggregate12Cft * aggregate12Rate;
    const steelCost = steelWithWastage * steelRate;
    const bindingWireCost = bindingWire * bindingWireRate;
    const coverBlockCost = coverBlocks * coverBlockRate;
    const waterCost = waterLtr * 0.5;
    
    const materialTotal = cementCost + sandCost + agg20Cost + agg12Cost + steelCost + bindingWireCost + coverBlockCost + waterCost;
    const labourCost = volumeCum * labourRate;
    const grandTotal = materialTotal + labourCost;
    
    const labourBreakdown = {
      shuttering: volumeCum * 500,
      barBending: volumeCum * 350,
      concreting: volumeCum * 250,
      profit: volumeCum * 100,
      total: labourCost
    };
    
    const steelBreakdown = [
      { item: `${mainBarDia}mm Main Bars (${mainBarNos} nos)`, quantity: mainSteelWeight },
      { item: `${distBarDia}mm Distribution Bars @ ${distBarSpacing}mm`, quantity: distSteelWeight },
      { item: `${stirrupDia}mm Stirrups @ ${stirrupSpacing}mm`, quantity: stirrupWeight }
    ];
    
    return {
      arch: { type: archType, span: span, rise: rise, length: formatNumber(archLength), nos: archNos, thickness: thickness, width: width },
      concrete: { volumeCum: formatNumber(volumeCum), volumeCft: formatNumber(volumeCft), cement: formatNumber(cementBags), sandCft: formatNumber(sandCft), aggregate20Cft: formatNumber(aggregate20Cft), aggregate12Cft: formatNumber(aggregate12Cft), water: formatNumber(waterLtr) },
      steel: { main: formatNumber(mainSteelWeight), distribution: formatNumber(distSteelWeight), stirrups: formatNumber(stirrupWeight), total: formatNumber(steelWithWastage) },
      steelBreakdown,
      accessories: { bindingWire: formatNumber(bindingWire), coverBlocks: formatNumber(coverBlocks) },
      costs: { cement: formatNumber(cementCost), sand: formatNumber(sandCost), agg20: formatNumber(agg20Cost), agg12: formatNumber(agg12Cost), steel: formatNumber(steelCost), bindingWire: formatNumber(bindingWireCost), coverBlock: formatNumber(coverBlockCost), water: formatNumber(waterCost), materialTotal: formatNumber(materialTotal), labour: formatNumber(labourCost), grandTotal: formatNumber(grandTotal) },
      labourBreakdown: {
        shuttering: formatNumber(labourBreakdown.shuttering),
        barBending: formatNumber(labourBreakdown.barBending),
        concreting: formatNumber(labourBreakdown.concreting),
        profit: formatNumber(labourBreakdown.profit),
        total: formatNumber(labourBreakdown.total)
      },
      rates: { cement: cementRate, sand: sandRate, steel: steelRate, labour: labourRate }
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
      { Item: 'Arch Type', Quantity: results.arch.type, Unit: '-', Cost: '-' },
      { Item: 'Span', Quantity: results.arch.span, Unit: 'ft', Cost: '-' },
      { Item: 'Rise', Quantity: results.arch.rise, Unit: 'ft', Cost: '-' },
      { Item: 'Concrete Volume', Quantity: results.concrete.volumeCft, Unit: 'CFT', Cost: '-' },
      { Item: 'Cement', Quantity: results.concrete.cement, Unit: 'bags', Cost: `₹${results.costs.cement}` },
      { Item: 'M Sand', Quantity: results.concrete.sandCft, Unit: 'CFT', Cost: `₹${results.costs.sand}` },
      { Item: '20mm Aggregate', Quantity: results.concrete.aggregate20Cft, Unit: 'CFT', Cost: `₹${results.costs.agg20}` },
      { Item: '12mm Aggregate', Quantity: results.concrete.aggregate12Cft, Unit: 'CFT', Cost: `₹${results.costs.agg12}` },
      ...results.steelBreakdown.map(s => ({ Item: `Steel - ${s.item}`, Quantity: formatNumber(s.quantity), Unit: 'kg', Cost: `₹${formatNumber(s.quantity * results.rates.steel)}` })),
      { Item: 'Binding Wire', Quantity: results.accessories.bindingWire, Unit: 'kg', Cost: `₹${results.costs.bindingWire}` },
      { Item: 'Cover Blocks', Quantity: results.accessories.coverBlocks, Unit: 'Nos', Cost: `₹${results.costs.coverBlock}` },
      { Item: 'Water', Quantity: results.concrete.water, Unit: 'Ltr', Cost: `₹${results.costs.water}` },
      { Item: 'Material Total', Quantity: '', Unit: '', Cost: `₹${results.costs.materialTotal}` },
      { Item: 'Labour', Quantity: results.concrete.volumeCum, Unit: 'CUM', Cost: `₹${results.costs.labour}` },
      { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Cost: `₹${results.costs.grandTotal}` }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Arch');
    XLSX.writeFile(wb, `Arch_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `⛩️ ARCH DESIGN\n\nType: ${results.arch.type}\nSpan: ${results.arch.span} ft\nRise: ${results.arch.rise} ft\nConcrete: ${results.concrete.volumeCft} CFT\nSteel: ${results.steel.total} kg\nTotal Cost: ₹${results.costs.grandTotal}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '⛩️ Arch Design Calculator')
    ),
    
    // Arch Image - Shows based on selected arch type
    React.createElement('div', { style: styles.imageBox },
      React.createElement('img', { src: archImages[archType], alt: archType, style: styles.archImage })
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Cement: ₹${cementRate}/bag | Steel: ₹${steelRate}/kg | Labour: ₹${labourRate}/CUM`)
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Arch Dimensions'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Nos'), React.createElement('input', { type: 'number', value: archNos, onChange: (e) => setArchNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Arch Type'), React.createElement('select', { value: archType, onChange: (e) => setArchType(e.target.value), style: styles.select },
        React.createElement('option', { value: 'Semi-circular' }, '⭕ Semi-circular Arch'),
        React.createElement('option', { value: 'Segmental' }, '📐 Segmental Arch'),
        React.createElement('option', { value: 'Gothic' }, '⛪ Gothic Arch'),
        React.createElement('option', { value: 'Flat' }, '📏 Flat Arch'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Span (ft)'), React.createElement('input', { type: 'number', value: span, onChange: (e) => setSpan(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Rise (ft)'), React.createElement('input', { type: 'number', value: rise, onChange: (e) => setRise(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Thickness (ft)'), React.createElement('input', { type: 'number', value: thickness, onChange: (e) => setThickness(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (ft)'), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Grade'), React.createElement('select', { value: concreteGrade, onChange: (e) => setConcreteGrade(e.target.value), style: styles.select },
        React.createElement('option', { value: 'M20' }, 'M20'), React.createElement('option', { value: 'M25' }, 'M25'), React.createElement('option', { value: 'M30' }, 'M30'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Cover (mm)'), React.createElement('input', { type: 'number', value: cover, onChange: (e) => setCover(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Wastage (%)'), React.createElement('input', { type: 'number', value: wastage, onChange: (e) => setWastage(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🔄 Reinforcement'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Main Bar Dia (mm)'), React.createElement('input', { type: 'number', value: mainBarDia, onChange: (e) => setMainBarDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Main Bar Nos'), React.createElement('input', { type: 'number', value: mainBarNos, onChange: (e) => setMainBarNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Dist Bar Dia (mm)'), React.createElement('input', { type: 'number', value: distBarDia, onChange: (e) => setDistBarDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Dist Spacing (mm)'), React.createElement('input', { type: 'number', value: distBarSpacing, onChange: (e) => setDistBarSpacing(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Stirrup Dia (mm)'), React.createElement('input', { type: 'number', value: stirrupDia, onChange: (e) => setStirrupDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Stirrup Spacing (mm)'), React.createElement('input', { type: 'number', value: stirrupSpacing, onChange: (e) => setStirrupSpacing(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.buttonRow },
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate'),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement('button', { onClick: handleExportExcel, style: styles.buttonExport }, '📊 Excel'),
        React.createElement('button', { onClick: handleWhatsApp, style: styles.buttonWhatsapp }, '💬 Share')
      )
    ),
    
    generated && results && React.createElement('div', null,
      React.createElement('div', { style: styles.cardContainer },
        React.createElement('div', { style: { ...styles.card, ...styles.cardBlue } }, React.createElement('div', null, '📦'), React.createElement('div', null, 'Concrete'), React.createElement('div', { style: styles.cardValue }, `${results.concrete.volumeCft} CFT`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightGreen } }, React.createElement('div', null, '🪣'), React.createElement('div', null, 'Cement'), React.createElement('div', { style: styles.cardValue }, `${results.concrete.cement} bags`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightOrange } }, React.createElement('div', null, '⚙️'), React.createElement('div', null, 'Steel'), React.createElement('div', { style: styles.cardValue }, `${results.steel.total} kg`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightTeal } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Total Cost'), React.createElement('div', { style: styles.cardValue }, `₹${results.costs.grandTotal}`))
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Item'), React.createElement('th', { style: styles.th }, 'Quantity'), React.createElement('th', { style: styles.th }, 'Unit'), React.createElement('th', { style: styles.th }, 'Cost'))),
          React.createElement('tbody', null,
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Arch Type'), React.createElement('td', { style: styles.td }, results.arch.type), React.createElement('td', { style: styles.td }, '-'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Concrete Volume'), React.createElement('td', { style: styles.td }, results.concrete.volumeCft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Cement'), React.createElement('td', { style: styles.td }, results.concrete.cement), React.createElement('td', { style: styles.td }, 'bags'), React.createElement('td', { style: styles.td }, `₹${results.costs.cement}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'M Sand'), React.createElement('td', { style: styles.td }, results.concrete.sandCft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.sand}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, '20mm Aggregate'), React.createElement('td', { style: styles.td }, results.concrete.aggregate20Cft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.agg20}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, '12mm Aggregate'), React.createElement('td', { style: styles.td }, results.concrete.aggregate12Cft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.agg12}`)),
            results.steelBreakdown.map((item, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, `Steel - ${item.item}`), React.createElement('td', { style: styles.td }, formatNumber(item.quantity)), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, `₹${formatNumber(item.quantity * results.rates.steel)}`))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Binding Wire'), React.createElement('td', { style: styles.td }, results.accessories.bindingWire), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, `₹${results.costs.bindingWire}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Cover Blocks'), React.createElement('td', { style: styles.td }, results.accessories.coverBlocks), React.createElement('td', { style: styles.td }, 'Nos'), React.createElement('td', { style: styles.td }, `₹${results.costs.coverBlock}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Water'), React.createElement('td', { style: styles.td }, results.concrete.water), React.createElement('td', { style: styles.td }, 'Ltr'), React.createElement('td', { style: styles.td }, `₹${results.costs.water}`)),
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Material Total'), React.createElement('td', { style: styles.td }, `₹${results.costs.materialTotal}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Labour'), React.createElement('td', { style: styles.td }, `₹${results.costs.labour}`)),
            React.createElement('tr', { style: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: { padding: '8px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '8px' } }, `₹${results.costs.grandTotal}`))
          )
        )
      )
    )
  );
}

