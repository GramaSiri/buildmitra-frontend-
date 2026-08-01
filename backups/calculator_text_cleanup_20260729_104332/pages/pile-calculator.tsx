import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#607d8b', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#607d8b', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
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
  th: { backgroundColor: '#607d8b', color: 'white', padding: '8px', textAlign: 'left' },
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

export default function PileCalculator() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();
  const { rates, loading } = useRates();
  
  const [pileNos, setPileNos] = useState(1);
  const [diameter, setDiameter] = useState(1);
  const [length, setLength] = useState(15);
  const [unit, setUnit] = useState('feet');
  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [cover, setCover] = useState(50);
  const [wastage, setWastage] = useState(3);
  
  const [mainBarDia, setMainBarDia] = useState(16);
  const [mainBarNos, setMainBarNos] = useState(8);
  const [tieDia, setTieDia] = useState(8);
  const [tieSpacing, setTieSpacing] = useState(150);
  const [boringRate, setBoringRate] = useState(500);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);
  
  const cementRate = rates?.cement || 400;
  const sandRate = rates?.sand || 55;
  const aggregate20Rate = rates?.aggregate20 || 50;
  const aggregate12Rate = rates?.aggregate12 || 48;
  const steelRate = rates?.steel || 68;
  const bindingWireRate = rates?.bindingWire || 80;
  const coverBlockRate = rates?.coverBlock || 5;
  const labourRate = rates?.labour_concrete || 1500;

  const calculateResults = () => {
    let D = unit === 'feet' ? diameter * 0.3048 : diameter;
    let L = unit === 'feet' ? length * 0.3048 : length;
    
    const area = Math.PI * Math.pow(D, 2) / 4;
    const volumePerPileCum = area * L;
    const totalVolumeCum = volumePerPileCum * pileNos;
    const totalVolumeCft = totalVolumeCum * 35.315;
    
    const cementBags = totalVolumeCum * 7.5;
    const sandCft = totalVolumeCum * 0.42 * 35.315;
    const aggregateTotalCft = totalVolumeCum * 0.84 * 35.315;
    const aggregate20Cft = aggregateTotalCft * 0.6;
    const aggregate12Cft = aggregateTotalCft * 0.4;
    
    const mainBarLengthM = L + 1.5;
    const mainTotalLengthM = mainBarLengthM * mainBarNos * pileNos;
    const mainSteelWeight = mainTotalLengthM * getWeightPerMeter(mainBarDia);
    
    const circumference = Math.PI * D;
    const tiesNos = Math.ceil(L / (tieSpacing / 1000)) + 1;
    const tiesLengthPerPile = circumference * tiesNos;
    const totalTiesLength = tiesLengthPerPile * pileNos;
    const tieSteelWeight = totalTiesLength * getWeightPerMeter(tieDia);
    
    const totalSteelKg = mainSteelWeight + tieSteelWeight;
    const steelWithWastage = totalSteelKg * (1 + wastage/100);
    
    const bindingWire = steelWithWastage * 0.008;
    const coverBlocks = totalVolumeCum * 25;
    const waterLtr = cementBags * 50 * 0.45;
    
    const totalBoringLength = L * pileNos;
    const boringCost = totalBoringLength * boringRate;
    
    const cementCost = cementBags * cementRate;
    const sandCost = sandCft * sandRate;
    const agg20Cost = aggregate20Cft * aggregate20Rate;
    const agg12Cost = aggregate12Cft * aggregate12Rate;
    const steelCost = steelWithWastage * steelRate;
    const bindingWireCost = bindingWire * bindingWireRate;
    const coverBlockCost = coverBlocks * coverBlockRate;
    const waterCost = waterLtr * 0.5;
    
    const materialTotal = cementCost + sandCost + agg20Cost + agg12Cost + steelCost + bindingWireCost + coverBlockCost + waterCost + boringCost;
    const labourCost = totalVolumeCum * labourRate;
    const grandTotal = materialTotal + labourCost;
    
    const steelBreakdown = [
      { item: `${mainBarDia}mm Main Bars (${mainBarNos} nos)`, quantity: mainSteelWeight },
      { item: `${tieDia}mm Helical Ties @ ${tieSpacing}mm`, quantity: tieSteelWeight }
    ];
    
    return {
      pile: { nos: pileNos, diameter: D, length: L, volume: formatNumber(totalVolumeCum) },
      concrete: { volumeCum: formatNumber(totalVolumeCum), volumeCft: formatNumber(totalVolumeCft), cement: formatNumber(cementBags), sandCft: formatNumber(sandCft), aggregate20Cft: formatNumber(aggregate20Cft), aggregate12Cft: formatNumber(aggregate12Cft), water: formatNumber(waterLtr) },
      steel: { main: formatNumber(mainSteelWeight), ties: formatNumber(tieSteelWeight), total: formatNumber(steelWithWastage) },
      steelBreakdown,
      accessories: { bindingWire: formatNumber(bindingWire), coverBlocks: formatNumber(coverBlocks) },
      boring: { length: formatNumber(totalBoringLength), cost: formatNumber(boringCost) },
      costs: { cement: formatNumber(cementCost), sand: formatNumber(sandCost), agg20: formatNumber(agg20Cost), agg12: formatNumber(agg12Cost), steel: formatNumber(steelCost), bindingWire: formatNumber(bindingWireCost), coverBlock: formatNumber(coverBlockCost), water: formatNumber(waterCost), boring: formatNumber(boringCost), materialTotal: formatNumber(materialTotal), labour: formatNumber(labourCost), grandTotal: formatNumber(grandTotal) },
      rates: { cement: cementRate, sand: sandRate, steel: steelRate }
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
      { Item: 'Pile Diameter', Quantity: results.pile.diameter, Unit: 'm', Cost: '-' },
      { Item: 'Pile Length', Quantity: results.pile.length, Unit: 'm', Cost: '-' },
      { Item: 'Number of Piles', Quantity: results.pile.nos, Unit: 'nos', Cost: '-' },
      { Item: 'Concrete Volume', Quantity: results.concrete.volumeCft, Unit: 'CFT', Cost: '-' },
      { Item: 'Cement', Quantity: results.concrete.cement, Unit: 'bags', Cost: `₹${results.costs.cement}` },
      { Item: 'M Sand', Quantity: results.concrete.sandCft, Unit: 'CFT', Cost: `₹${results.costs.sand}` },
      { Item: 'Steel', Quantity: results.steel.total, Unit: 'kg', Cost: `₹${results.costs.steel}` },
      { Item: 'Boring', Quantity: results.boring.length, Unit: 'm', Cost: `₹${results.costs.boring}` },
      { Item: 'Material Total', Quantity: '', Unit: '', Cost: `₹${results.costs.materialTotal}` },
      { Item: 'Labour', Quantity: results.concrete.volumeCum, Unit: 'CUM', Cost: `₹${results.costs.labour}` },
      { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Cost: `₹${results.costs.grandTotal}` }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pile_Foundation');
    XLSX.writeFile(wb, `Pile_Foundation_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🥧 PILE FOUNDATION\n\nDiameter: ${results.pile.diameter} m\nLength: ${results.pile.length} m\nPiles: ${results.pile.nos} nos\nConcrete: ${results.concrete.volumeCft} CFT\nSteel: ${results.steel.total} kg\nTotal Cost: ₹${results.costs.grandTotal}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🥧 Pile Foundation Calculator')
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Cement: ₹${cementRate}/bag | Steel: ₹${steelRate}/kg | Labour: ₹${labourRate}/CUM | Boring: ₹${boringRate}/m`)
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Pile Dimensions'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Piles'), React.createElement('input', { type: 'number', value: pileNos, onChange: (e) => setPileNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Diameter'), React.createElement('input', { type: 'number', value: diameter, onChange: (e) => setDiameter(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length'), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Unit'), React.createElement('select', { value: unit, onChange: (e) => setUnit(e.target.value), style: styles.select },
        React.createElement('option', { value: 'feet' }, 'Feet'), React.createElement('option', { value: 'meters' }, 'Meters'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Grade'), React.createElement('select', { value: concreteGrade, onChange: (e) => setConcreteGrade(e.target.value), style: styles.select },
        React.createElement('option', { value: 'M20' }, 'M20'), React.createElement('option', { value: 'M25' }, 'M25'), React.createElement('option', { value: 'M30' }, 'M30'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Cover (mm)'), React.createElement('input', { type: 'number', value: cover, onChange: (e) => setCover(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Wastage (%)'), React.createElement('input', { type: 'number', value: wastage, onChange: (e) => setWastage(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Boring Rate (₹/m)'), React.createElement('input', { type: 'number', value: boringRate, onChange: (e) => setBoringRate(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🔄 Reinforcement'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Main Bar Dia (mm)'), React.createElement('input', { type: 'number', value: mainBarDia, onChange: (e) => setMainBarDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Main Bar Nos'), React.createElement('input', { type: 'number', value: mainBarNos, onChange: (e) => setMainBarNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Tie Dia (mm)'), React.createElement('input', { type: 'number', value: tieDia, onChange: (e) => setTieDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Tie Spacing (mm)'), React.createElement('input', { type: 'number', value: tieSpacing, onChange: (e) => setTieSpacing(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.buttonRow },
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate'),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'pile-calculator', handleExportExcel), style: styles.buttonExport }, '📊 Excel'),
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'pile-calculator', handleWhatsApp), style: styles.buttonWhatsapp }, '💬 Share')
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
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Concrete Volume'), React.createElement('td', { style: styles.td }, results.concrete.volumeCft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Cement'), React.createElement('td', { style: styles.td }, results.concrete.cement), React.createElement('td', { style: styles.td }, 'bags'), React.createElement('td', { style: styles.td }, `₹${results.costs.cement}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'M Sand'), React.createElement('td', { style: styles.td }, results.concrete.sandCft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.sand}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Steel'), React.createElement('td', { style: styles.td }, results.steel.total), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, `₹${results.costs.steel}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Boring'), React.createElement('td', { style: styles.td }, results.boring.length), React.createElement('td', { style: styles.td }, 'm'), React.createElement('td', { style: styles.td }, `₹${results.costs.boring}`)),
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Material Total'), React.createElement('td', { style: styles.td }, `₹${results.costs.materialTotal}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Labour'), React.createElement('td', { style: styles.td }, `₹${results.costs.labour}`)),
            React.createElement('tr', { style: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: { padding: '8px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '8px' } }, `₹${results.costs.grandTotal}`))
          )
        )
      )
    )
  );
}



