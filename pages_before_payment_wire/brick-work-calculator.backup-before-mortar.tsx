import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#c0392b', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#c0392b', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' },
  inputGroup: { marginBottom: '6px' },
  label: { display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '10px', color: '#555' },
  input: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box', backgroundColor: '#fff' },
  select: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' },
  buttonSmall: { backgroundColor: '#2196F3', color: 'white', padding: '4px 8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', marginTop: '4px' },
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
  th: { backgroundColor: '#c0392b', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  rateInfo: { backgroundColor: '#e8f4f8', padding: '6px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', marginBottom: '10px', color: '#555' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Block/Brick Types
const blockTypes = {
  'Clay Brick': { length: 9, height: 3, width: 4.5, unitsPerSqft: 10.67, rateName: 'brick' },
  'Clay Brick (Modular)': { length: 8, height: 3, width: 4, unitsPerSqft: 13.5, rateName: 'brick' },
  'Concrete Block (4")': { length: 16, height: 8, width: 4, unitsPerSqft: 1.125, rateName: 'block' },
  'Concrete Block (6")': { length: 16, height: 8, width: 6, unitsPerSqft: 1.125, rateName: 'block' },
  'Concrete Block (8")': { length: 16, height: 8, width: 8, unitsPerSqft: 1.125, rateName: 'block' },
  'AAC Block (4")': { length: 24, height: 8, width: 4, unitsPerSqft: 0.75, rateName: 'aac' },
  'AAC Block (6")': { length: 24, height: 8, width: 6, unitsPerSqft: 0.75, rateName: 'aac' },
  'AAC Block (8")': { length: 24, height: 8, width: 8, unitsPerSqft: 0.75, rateName: 'aac' },
  'Interlock Block': { length: 8, height: 4, width: 6, unitsPerSqft: 4.5, rateName: 'interlock' },
  'Hollow Block (4")': { length: 16, height: 8, width: 4, unitsPerSqft: 1.125, rateName: 'hollow' },
  'Hollow Block (6")': { length: 16, height: 8, width: 6, unitsPerSqft: 1.125, rateName: 'hollow' },
  'Solid Block': { length: 12, height: 6, width: 4, unitsPerSqft: 2, rateName: 'solid' }
};

export default function BrickWorkPage() {
  const router = useRouter();
  const { rates, loading } = useRates();
  
  const [wallNos, setWallNos] = useState(1);
  const [length, setLength] = useState(10);
  const [height, setHeight] = useState(10);
  const [blockType, setBlockType] = useState('Clay Brick');
  const [mortarGrade, setMortarGrade] = useState('1:6');
  const [wastage, setWastage] = useState(3);
  
  const [openings, setOpenings] = useState([]);
  const [newOpening, setNewOpening] = useState({ name: 'Door', length: 3.5, width: 7, nos: 1 });
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);
  
  const blockInfo = blockTypes[blockType];
  
  const getRate = () => {
    const rateName = blockInfo.rateName;
    if (rateName === 'brick') return rates?.brick || 8;
    if (rateName === 'block') return rates?.block || 45;
    if (rateName === 'aac') return rates?.aac || 80;
    if (rateName === 'interlock') return rates?.interlock || 35;
    if (rateName === 'hollow') return rates?.hollow || 50;
    return rates?.solid || 60;
  };
  
  const blockRate = getRate();
  const cementRate = rates?.cement || 400;
  const sandRate = rates?.sand || 55;

  const addOpening = () => {
    if (newOpening.length > 0 && newOpening.width > 0 && newOpening.nos > 0) {
      setOpenings([...openings, { ...newOpening, area: newOpening.length * newOpening.width * newOpening.nos }]);
      setNewOpening({ name: 'Door', length: 3.5, width: 7, nos: 1 });
    }
  };

  const removeOpening = (index) => {
    const newOpenings = [...openings];
    newOpenings.splice(index, 1);
    setOpenings(newOpenings);
  };

  const calculateResults = () => {
    const wallAreaSqft = length * height * wallNos;
    const totalOpeningArea = openings.reduce((sum, opening) => sum + opening.area, 0);
    const netArea = wallAreaSqft - totalOpeningArea;
    
    const blocksPerSqft = blockInfo.unitsPerSqft;
    const totalBlocks = netArea * blocksPerSqft * (1 + wastage/100);
    
    const wallThicknessInches = blockInfo.width;
    const wallVolumeCft = netArea * (wallThicknessInches / 12);
    const mortarVolumeCft = wallVolumeCft * 0.25;
    const mortarVolumeCum = mortarVolumeCft / 35.315;
    
    let cementBags, sandCft;
    if (mortarGrade === '1:3') {
      cementBags = mortarVolumeCum * 10.8;
      sandCft = mortarVolumeCum * 0.9 * 35.315;
    } else if (mortarGrade === '1:4') {
      cementBags = mortarVolumeCum * 8.5;
      sandCft = mortarVolumeCum * 0.95 * 35.315;
    } else if (mortarGrade === '1:5') {
      cementBags = mortarVolumeCum * 7.2;
      sandCft = mortarVolumeCum * 1.0 * 35.315;
    } else {
      cementBags = mortarVolumeCum * 6.2;
      sandCft = mortarVolumeCum * 1.05 * 35.315;
    }
    
    const waterLtr = cementBags * 50 * 0.4;
    
    const blockCost = totalBlocks * blockRate;
    const cementCost = cementBags * cementRate;
    const sandCost = sandCft * sandRate;
    const waterCost = waterLtr * 0.5;
    
    const materialTotal = blockCost + cementCost + sandCost + waterCost;
    const labourRate = rates?.labour_brickwork || 12;
    const labourCost = netArea * labourRate;
    const grandTotal = materialTotal + labourCost;
    
    const openingDetails = openings.map(o => `${o.name}: ${o.length}'x${o.width}' x ${o.nos} = ${formatNumber(o.area)} sqft`);
    
    return {
      area: { wall: formatNumber(wallAreaSqft), openings: formatNumber(totalOpeningArea), net: formatNumber(netArea) },
      blocks: { type: blockType, size: `${blockInfo.length}"x${blockInfo.height}"x${blockInfo.width}"`, quantity: formatNumber(totalBlocks), perSqft: blocksPerSqft, rate: blockRate },
      mortar: { volumeCft: formatNumber(mortarVolumeCft), volumeCum: formatNumber(mortarVolumeCum) },
      materials: { cement: formatNumber(cementBags), sand: formatNumber(sandCft), water: formatNumber(waterLtr) },
      costs: { blocks: formatNumber(blockCost), cement: formatNumber(cementCost), sand: formatNumber(sandCost), water: formatNumber(waterCost), materialTotal: formatNumber(materialTotal), labour: formatNumber(labourCost), grandTotal: formatNumber(grandTotal) },
      openingDetails
    };
  };

  const handleGenerate = () => {
    const calcResults = calculateResults();
    setResults(calcResults);
    setGenerated(true);
  };

  const handleBack = () => {
    router.push('/calculators');
  };

  const handleExportExcel = () => {
    if (!results) return;
    const data = [
      { Item: 'Wall Area', Quantity: results.area.wall, Unit: 'sqft', Cost: '-' },
      { Item: 'Opening Area', Quantity: results.area.openings, Unit: 'sqft', Cost: '-' },
      { Item: 'Net Area', Quantity: results.area.net, Unit: 'sqft', Cost: '-' },
      { Item: `${results.blocks.type} (${results.blocks.size})`, Quantity: results.blocks.quantity, Unit: 'Nos', Cost: `₹${results.costs.blocks}` },
      { Item: 'Cement', Quantity: results.materials.cement, Unit: 'bags', Cost: `₹${results.costs.cement}` },
      { Item: 'Sand', Quantity: results.materials.sand, Unit: 'CFT', Cost: `₹${results.costs.sand}` },
      { Item: 'Water', Quantity: results.materials.water, Unit: 'Ltr', Cost: `₹${results.costs.water}` },
      { Item: 'Material Total', Quantity: '', Unit: '', Cost: `₹${results.costs.materialTotal}` },
      { Item: 'Labour', Quantity: results.area.net, Unit: 'sqft', Cost: `₹${results.costs.labour}` },
      { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Cost: `₹${results.costs.grandTotal}` }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Block_Work');
    XLSX.writeFile(wb, `Block_Work_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🧱 BLOCK WORK\n\nWall: ${length}' x ${height}'\nBlock: ${results.blocks.type}\nNet Area: ${results.area.net} sqft\nBlocks: ${results.blocks.quantity} nos\nCement: ${results.materials.cement} bags\nSand: ${results.materials.sand} CFT\nTotal Cost: ₹${results.costs.grandTotal}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🧱 Block/Brick Work Calculator')
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Rates: ${blockType} ₹${blockRate}/nos | Cement ₹${cementRate}/bag | Sand ₹${sandRate}/CFT`),
      React.createElement('div', null, React.createElement('small', null, `👷 Labour: ₹${rates?.labour_brickwork || 12}/sqft`))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Wall Dimensions'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Nos'), React.createElement('input', { type: 'number', value: wallNos, onChange: (e) => setWallNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length (ft)'), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Height (ft)'), React.createElement('input', { type: 'number', value: height, onChange: (e) => setHeight(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Block Type'), React.createElement('select', { value: blockType, onChange: (e) => setBlockType(e.target.value), style: styles.select },
        Object.keys(blockTypes).map(type => React.createElement('option', { key: type, value: type }, `${type} (${blockTypes[type].width}" wall)`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Mortar Grade'), React.createElement('select', { value: mortarGrade, onChange: (e) => setMortarGrade(e.target.value), style: styles.select },
        React.createElement('option', { value: '1:3' }, '1:3'), React.createElement('option', { value: '1:4' }, '1:4'),
        React.createElement('option', { value: '1:5' }, '1:5'), React.createElement('option', { value: '1:6' }, '1:6'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Wastage (%)'), React.createElement('input', { type: 'number', value: wastage, onChange: (e) => setWastage(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🚪 Openings'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Name'), React.createElement('select', { value: newOpening.name, onChange: (e) => setNewOpening({ ...newOpening, name: e.target.value }), style: styles.select },
        React.createElement('option', { value: 'Door' }, 'Door'), React.createElement('option', { value: 'Window' }, 'Window'),
        React.createElement('option', { value: 'Ventilation' }, 'Ventilation'), React.createElement('option', { value: 'Other' }, 'Other'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length (ft)'), React.createElement('input', { type: 'number', value: newOpening.length, onChange: (e) => setNewOpening({ ...newOpening, length: parseFloat(e.target.value) }), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (ft)'), React.createElement('input', { type: 'number', value: newOpening.width, onChange: (e) => setNewOpening({ ...newOpening, width: parseFloat(e.target.value) }), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Nos'), React.createElement('input', { type: 'number', value: newOpening.nos, onChange: (e) => setNewOpening({ ...newOpening, nos: parseFloat(e.target.value) }), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Area'), React.createElement('div', { style: { ...styles.input, backgroundColor: '#e8f4f8' } }, `${(newOpening.length * newOpening.width * newOpening.nos).toFixed(2)} sqft`)),
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end' } }, React.createElement('button', { onClick: addOpening, style: styles.buttonSmall }, '+ Add'))
    ),
    
    openings.length > 0 && React.createElement('div', { style: styles.tableContainer },
      React.createElement('table', { style: styles.table },
        React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Name'), React.createElement('th', { style: styles.th }, 'Size'), React.createElement('th', { style: styles.th }, 'Nos'), React.createElement('th', { style: styles.th }, 'Area'), React.createElement('th', { style: styles.th }, ''))),
        React.createElement('tbody', null,
          openings.map((opening, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? styles.evenRow : {} },
            React.createElement('td', { style: styles.td }, opening.name),
            React.createElement('td', { style: styles.td }, `${opening.length}' x ${opening.width}'`),
            React.createElement('td', { style: styles.td }, opening.nos),
            React.createElement('td', { style: styles.td }, formatNumber(opening.area)),
            React.createElement('td', { style: styles.td }, React.createElement('button', { onClick: () => removeOpening(idx), style: { ...styles.buttonSmall, backgroundColor: '#dc3545' } }, 'Remove'))
          ))
        )
      )
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
        React.createElement('div', { style: { ...styles.card, ...styles.cardBlue } }, React.createElement('div', null, '🧱'), React.createElement('div', null, 'Blocks'), React.createElement('div', { style: styles.cardValue }, `${results.blocks.quantity} Nos`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightGreen } }, React.createElement('div', null, '🪣'), React.createElement('div', null, 'Cement'), React.createElement('div', { style: styles.cardValue }, `${results.materials.cement} bags`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightOrange } }, React.createElement('div', null, '🏖️'), React.createElement('div', null, 'Sand'), React.createElement('div', { style: styles.cardValue }, `${results.materials.sand} CFT`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightTeal } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Total Cost'), React.createElement('div', { style: styles.cardValue }, `₹${results.costs.grandTotal}`))
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Item'), React.createElement('th', { style: styles.th }, 'Quantity'), React.createElement('th', { style: styles.th }, 'Unit'), React.createElement('th', { style: styles.th }, 'Cost'))),
          React.createElement('tbody', null,
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Wall Area'), React.createElement('td', { style: styles.td }, results.area.wall), React.createElement('td', { style: styles.td }, 'sqft'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Opening Area'), React.createElement('td', { style: styles.td }, results.area.openings), React.createElement('td', { style: styles.td }, 'sqft'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Net Area'), React.createElement('td', { style: styles.td }, results.area.net), React.createElement('td', { style: styles.td }, 'sqft'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, `${results.blocks.type}`), React.createElement('td', { style: styles.td }, results.blocks.quantity), React.createElement('td', { style: styles.td }, 'Nos'), React.createElement('td', { style: styles.td }, `₹${results.costs.blocks}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Cement'), React.createElement('td', { style: styles.td }, results.materials.cement), React.createElement('td', { style: styles.td }, 'bags'), React.createElement('td', { style: styles.td }, `₹${results.costs.cement}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Sand'), React.createElement('td', { style: styles.td }, results.materials.sand), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.sand}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Water'), React.createElement('td', { style: styles.td }, results.materials.water), React.createElement('td', { style: styles.td }, 'Ltr'), React.createElement('td', { style: styles.td }, `₹${results.costs.water}`)),
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Material Total'), React.createElement('td', { style: styles.td }, `₹${results.costs.materialTotal}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Labour'), React.createElement('td', { style: styles.td }, `₹${results.costs.labour}`)),
            React.createElement('tr', { style: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: { padding: '8px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '8px' } }, `₹${results.costs.grandTotal}`))
          )
        )
      )
    )
  );
}

