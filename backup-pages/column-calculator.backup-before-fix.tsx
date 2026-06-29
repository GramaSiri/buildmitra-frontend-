import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#4a6fa5', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#4a6fa5', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' },
  inputGroup: { marginBottom: '8px' },
  label: { display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '11px', color: '#555' },
  input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff' },
  select: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff' },
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
  th: { backgroundColor: '#4a6fa5', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  rateInfo: { backgroundColor: '#e8f4f8', padding: '6px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', marginBottom: '10px', color: '#555' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Weight per meter formula: Dia² / 162.2
const getWeightPerMeter = (dia) => {
  return (dia * dia) / 162.2;
};

export default function ColumnPage() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();
  const { rates, loading } = useRates();
  
  // Column inputs
  const [columnNos, setColumnNos] = useState(4);
  const [height, setHeight] = useState(10);
  const [width, setWidth] = useState(9);
  const [depth, setDepth] = useState(9);
  const [unit, setUnit] = useState('feet');
  const [concreteGrade, setConcreteGrade] = useState('M20');
  
  // Vertical reinforcement
  const [cornerDia, setCornerDia] = useState(12);
  const [cornerNos, setCornerNos] = useState(4);
  const [middleDia, setMiddleDia] = useState(12);
  const [middleNos, setMiddleNos] = useState(4);
  
  // Ties reinforcement
  const [tieDia, setTieDia] = useState(8);
  const [tieSpacing, setTieSpacing] = useState(150);
  const [cover, setCover] = useState(40);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);

  const calculateResults = () => {
    // Convert dimensions to meters
    let H = unit === 'feet' ? height * 0.3048 : height;
    let W = unit === 'feet' ? width * 0.0254 : width * 0.001; // inches to meters
    let D = unit === 'feet' ? depth * 0.0254 : depth * 0.001;
    
    // Concrete Volume per column
    const volumePerColumnCum = H * W * D;
    const totalVolumeCum = volumePerColumnCum * columnNos;
    const totalVolumeCft = totalVolumeCum * 35.315;
    
    // Concrete Materials (M20: 1:1.5:3)
    const cementBags = totalVolumeCum * 7.5;
    const sandCft = totalVolumeCum * 0.42 * 35.315;
    const aggregateTotalCft = totalVolumeCum * 0.84 * 35.315;
    const aggregate20Cft = aggregateTotalCft * 0.6;
    const aggregate12Cft = aggregateTotalCft * 0.4;
    
    // Vertical Steel Calculation
    const totalVerticalBars = cornerNos + middleNos;
    const verticalBarLengthM = H;
    const verticalTotalLengthM = verticalBarLengthM * totalVerticalBars * columnNos;
    
    // Average dia for vertical steel
    const avgVerticalDia = ((cornerDia * cornerNos) + (middleDia * middleNos)) / totalVerticalBars;
    const verticalWeight = verticalTotalLengthM * getWeightPerMeter(avgVerticalDia);
    
    // Ties Steel Calculation
    const tiePerimeterM = 2 * ((W - cover/1000) + (D - cover/1000));
    const tieNosPerColumn = Math.ceil(H / (tieSpacing / 1000)) + 1;
    const totalTieNos = tieNosPerColumn * columnNos;
    const tieTotalLengthM = tiePerimeterM * totalTieNos;
    const tieWeight = tieTotalLengthM * getWeightPerMeter(tieDia);
    
    const totalSteelKg = verticalWeight + tieWeight;
    const bindingWire = totalSteelKg * 0.008;
    const coverBlocks = totalVolumeCum * 20;
    const waterLtr = cementBags * 50 * 0.45;
    
    // Labour for RCC works (per CUM)
    const labourPerCum = rates?.labour_concrete || 1000;
    const labourCost = totalVolumeCum * labourPerCum;
    
    // Material Costs
    const cementCost = cementBags * (rates?.cement || 400);
    const sandCost = sandCft * (rates?.sand || 55);
    const agg20Cost = aggregate20Cft * (rates?.aggregate20 || 50);
    const agg12Cost = aggregate12Cft * (rates?.aggregate12 || 48);
    const steelCost = totalSteelKg * (rates?.steel || 68);
    const bindingWireCost = bindingWire * (rates?.bindingWire || 80);
    const coverBlockCost = coverBlocks * (rates?.coverBlock || 5);
    const waterCost = waterLtr * (rates?.water || 0.5);
    
    const materialTotal = cementCost + sandCost + agg20Cost + agg12Cost + steelCost + bindingWireCost + coverBlockCost + waterCost;
    const grandTotal = materialTotal + labourCost;
    
    // Labour breakdown
    const labourBreakdown = {
      shuttering: totalVolumeCum * 400,
      barBending: totalVolumeCum * 300,
      concreting: totalVolumeCum * 200,
      profit: totalVolumeCum * 100,
      total: labourCost
    };
    
    const steelBreakdown = [
      { item: `${cornerDia}mm Corner Bars (${cornerNos} nos x ${columnNos})`, quantity: verticalWeight * (cornerNos/totalVerticalBars), length: formatNumber(verticalTotalLengthM) },
      { item: `${middleDia}mm Middle Bars (${middleNos} nos x ${columnNos})`, quantity: verticalWeight * (middleNos/totalVerticalBars), length: formatNumber(verticalTotalLengthM) },
      { item: `${tieDia}mm Ties @ ${tieSpacing}mm`, quantity: tieWeight, length: formatNumber(tieTotalLengthM) }
    ];
    
    return {
      concrete: { volumeCum: formatNumber(totalVolumeCum), volumeCft: formatNumber(totalVolumeCft), cement: formatNumber(cementBags), sandCft: formatNumber(sandCft), aggregate20Cft: formatNumber(aggregate20Cft), aggregate12Cft: formatNumber(aggregate12Cft), water: formatNumber(waterLtr) },
      steel: { vertical: formatNumber(verticalWeight), ties: formatNumber(tieWeight), total: formatNumber(totalSteelKg) },
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
      rates: { cement: rates?.cement || 400, sand: rates?.sand || 55, steel: rates?.steel || 68, labourPerCum: labourPerCum }
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
      { Item: 'Cement', Quantity: results.concrete.cement, Unit: 'bags', Cost: `₹${results.costs.cement}` },
      { Item: 'M Sand', Quantity: results.concrete.sandCft, Unit: 'CFT', Cost: `₹${results.costs.sand}` },
      { Item: '20mm Aggregate', Quantity: results.concrete.aggregate20Cft, Unit: 'CFT', Cost: `₹${results.costs.agg20}` },
      { Item: '12mm Aggregate', Quantity: results.concrete.aggregate12Cft, Unit: 'CFT', Cost: `₹${results.costs.agg12}` },
      ...results.steelBreakdown.map(s => ({ Item: `Steel - ${s.item}`, Quantity: formatNumber(s.quantity), Unit: 'kg', Cost: `₹${formatNumber(s.quantity * results.rates.steel)}` })),
      { Item: 'Binding Wire', Quantity: results.accessories.bindingWire, Unit: 'kg', Cost: `₹${results.costs.bindingWire}` },
      { Item: 'Cover Blocks', Quantity: results.accessories.coverBlocks, Unit: 'Nos', Cost: `₹${results.costs.coverBlock}` },
      { Item: 'Water', Quantity: results.concrete.water, Unit: 'Ltr', Cost: `₹${results.costs.water}` },
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
    XLSX.utils.book_append_sheet(wb, ws, 'Column_Calculator');
    XLSX.writeFile(wb, `Column_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🏛️ COLUMN CALCULATION\n\nColumns: ${columnNos} nos | Size: ${width}" x ${depth}" x ${height}ft\nConcrete: ${results.concrete.volumeCft} CFT\nCement: ${results.concrete.cement} bags\nSteel: ${results.steel.total} kg\nLabour: ₹${results.costs.labour}\nTotal Cost: ₹${results.costs.grandTotal}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🏛️ Column Calculator')
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Material Rates: Cement ₹${rates?.cement || 400}/bag | Steel ₹${rates?.steel || 68}/kg`),
      React.createElement('div', null, React.createElement('small', null, `👷 Labour for RCC: ₹${rates?.labour_concrete || 1000}/CUM`))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Column Dimensions'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Nos'), React.createElement('input', { type: 'number', value: columnNos, onChange: (e) => setColumnNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Height (ft)'), React.createElement('input', { type: 'number', value: height, onChange: (e) => setHeight(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (in)'), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Depth (in)'), React.createElement('input', { type: 'number', value: depth, onChange: (e) => setDepth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Grade'), React.createElement('select', { value: concreteGrade, onChange: (e) => setConcreteGrade(e.target.value), style: styles.select }, React.createElement('option', { value: 'M20' }, 'M20'), React.createElement('option', { value: 'M25' }, 'M25'), React.createElement('option', { value: 'M30' }, 'M30')))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🔄 Vertical Reinforcement'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Corner Dia (mm)'), React.createElement('input', { type: 'number', value: cornerDia, onChange: (e) => setCornerDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Corner Nos'), React.createElement('input', { type: 'number', value: cornerNos, onChange: (e) => setCornerNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Middle Dia (mm)'), React.createElement('input', { type: 'number', value: middleDia, onChange: (e) => setMiddleDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Middle Nos'), React.createElement('input', { type: 'number', value: middleNos, onChange: (e) => setMiddleNos(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🔄 Ties / Stirrups'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Tie Dia (mm)'), React.createElement('input', { type: 'number', value: tieDia, onChange: (e) => setTieDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Tie Spacing (mm)'), React.createElement('input', { type: 'number', value: tieSpacing, onChange: (e) => setTieSpacing(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Cover (mm)'), React.createElement('input', { type: 'number', value: cover, onChange: (e) => setCover(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.buttonRow },
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate'),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'column-calculator.backup-before-fix', handleExportExcel), style: styles.buttonExport }, '📊 Excel'),
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'column-calculator.backup-before-fix', handleWhatsApp), style: styles.buttonWhatsapp }, '💬 Share')
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
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, '20mm Aggregate'), React.createElement('td', { style: styles.td }, results.concrete.aggregate20Cft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.agg20}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, '12mm Aggregate'), React.createElement('td', { style: styles.td }, results.concrete.aggregate12Cft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.agg12}`)),
            results.steelBreakdown.map((item, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, `Steel - ${item.item}`), React.createElement('td', { style: styles.td }, formatNumber(item.quantity)), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, `₹${formatNumber(item.quantity * results.rates.steel)}`))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Binding Wire'), React.createElement('td', { style: styles.td }, results.accessories.bindingWire), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, `₹${results.costs.bindingWire}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Cover Blocks'), React.createElement('td', { style: styles.td }, results.accessories.coverBlocks), React.createElement('td', { style: styles.td }, 'Nos'), React.createElement('td', { style: styles.td }, `₹${results.costs.coverBlock}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Water'), React.createElement('td', { style: styles.td }, results.concrete.water), React.createElement('td', { style: styles.td }, 'Ltr'), React.createElement('td', { style: styles.td }, `₹${results.costs.water}`)),
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


