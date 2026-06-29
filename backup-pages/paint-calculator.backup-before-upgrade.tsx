import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#9b59b6', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#9b59b6', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' },
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
  th: { backgroundColor: '#9b59b6', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  rateInfo: { backgroundColor: '#e8f4f8', padding: '6px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', marginBottom: '10px', color: '#555' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const coverageRates = {
  primer: 120,
  putty: 10,
  emulsion: { 1: 130, 2: 80, 3: 60 },
  enamel: { 1: 120, 2: 80, 3: 60 },
  texture: 25,
  royal: 20,
  design: 30,
  art: 35
};

export default function PaintPage() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();
  const { rates, loading } = useRates();
  
  const [length, setLength] = useState(20);
  const [height, setHeight] = useState(10);
  const [wallNos, setWallNos] = useState(4);
  const [includeCeiling, setIncludeCeiling] = useState(true);
  const [paintCategory, setPaintCategory] = useState('Interior');
  const [primerCoats, setPrimerCoats] = useState(1);
  const [paintCoats, setPaintCoats] = useState(2);
  
  const [openings, setOpenings] = useState([]);
  const [openingType, setOpeningType] = useState('Door');
  const [openingWidth, setOpeningWidth] = useState(3);
  const [openingHeight, setOpeningHeight] = useState(7);
  const [openingNos, setOpeningNos] = useState(1);
  const [hasShutter, setHasShutter] = useState(true);
  const [hasFrame, setHasFrame] = useState(true);
  
  const [specialPaints, setSpecialPaints] = useState([]);
  const [specialType, setSpecialType] = useState('Texture');
  const [specialArea, setSpecialArea] = useState(100);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);
  
  const puttyRate = rates?.putty || 25;
  const primerRate = rates?.primer || 180;
  const emulsionRate = rates?.emulsion || 220;
  const enamelRate = rates?.enamel || 250;
  const textureRate = rates?.texture || 60;
  const royalRate = rates?.royal || 80;
  const designRate = rates?.design || 100;
  const artRate = rates?.art || 150;
  const labourRate = rates?.labour_painting || 12;

  const addOpening = () => {
    if (openingWidth > 0 && openingHeight > 0 && openingNos > 0) {
      const area = openingWidth * openingHeight * openingNos;
      setOpenings([...openings, { 
        type: openingType, 
        width: openingWidth, 
        height: openingHeight, 
        nos: openingNos, 
        area: area,
        hasShutter: hasShutter,
        hasFrame: hasFrame
      }]);
      setOpeningWidth(3);
      setOpeningHeight(7);
      setOpeningNos(1);
    }
  };

  const removeOpening = (index) => {
    const newOpenings = [...openings];
    newOpenings.splice(index, 1);
    setOpenings(newOpenings);
  };

  const addSpecialPaint = () => {
    if (specialArea > 0) {
      setSpecialPaints([...specialPaints, { type: specialType, area: specialArea }]);
      setSpecialArea(100);
      setSpecialType('Texture');
    }
  };

  const removeSpecialPaint = (index) => {
    const newPaints = [...specialPaints];
    newPaints.splice(index, 1);
    setSpecialPaints(newPaints);
  };

  const calculateResults = () => {
    const wallArea = length * height * wallNos;
    const ceilingArea = includeCeiling ? length * height : 0;
    
    let totalOpeningArea = 0;
    let totalShutterArea = 0;
    let totalFrameRFT = 0;
    
    openings.forEach(opening => {
      totalOpeningArea += opening.area;
      if (opening.hasShutter) {
        totalShutterArea += opening.area * 2;
      }
      if (opening.hasFrame) {
        totalFrameRFT += 2 * (opening.width + opening.height) * opening.nos;
      }
    });
    
    const wallPaintArea = wallArea - totalOpeningArea;
    const totalPlainArea = wallPaintArea + ceilingArea;
    const netPaintArea = totalPlainArea;
    
    // Special Paints Calculation
    let specialPaintLtr = 0;
    let specialPaintCost = 0;
    specialPaints.forEach(paint => {
      let coverage = 0;
      let rate = 0;
      if (paint.type === 'Texture') {
        coverage = coverageRates.texture;
        rate = textureRate;
      } else if (paint.type === 'Royal') {
        coverage = coverageRates.royal;
        rate = royalRate;
      } else if (paint.type === 'Design') {
        coverage = coverageRates.design;
        rate = designRate;
      } else if (paint.type === 'Art') {
        coverage = coverageRates.art;
        rate = artRate;
      }
      specialPaintLtr += paint.area / coverage;
      specialPaintCost += paint.area * rate;
    });
    
    const puttyKg = netPaintArea / coverageRates.putty;
    const primerLtr = (netPaintArea / coverageRates.primer) * primerCoats;
    
    let regularPaintLtr = 0;
    if (paintCategory === 'Interior') {
      const coverage = coverageRates.emulsion[paintCoats] || coverageRates.emulsion[2];
      regularPaintLtr = (netPaintArea / coverage) * paintCoats;
    } else {
      const coverage = coverageRates.enamel[paintCoats] || coverageRates.enamel[2];
      regularPaintLtr = (netPaintArea / coverage) * paintCoats;
    }
    
    const shutterPaintLtr = totalShutterArea / 80;
    const framePaintLtr = totalFrameRFT / 10;
    const totalPaint = regularPaintLtr + shutterPaintLtr + framePaintLtr + specialPaintLtr;
    
    const puttyCost = puttyKg * puttyRate;
    const primerCost = primerLtr * primerRate;
    const regularPaintCost = paintCategory === 'Interior' ? regularPaintLtr * emulsionRate : (regularPaintLtr + shutterPaintLtr + framePaintLtr) * enamelRate;
    const specialCost = specialPaintCost;
    
    const materialTotal = puttyCost + primerCost + regularPaintCost + specialCost;
    const labourCost = netPaintArea * labourRate;
    const grandTotal = materialTotal + labourCost;
    
    return {
      netArea: formatNumber(netPaintArea),
      materials: [
        { item: 'Wall Putty', quantity: formatNumber(puttyKg), unit: 'kg', cost: formatNumber(puttyCost) },
        { item: 'Primer', quantity: formatNumber(primerLtr), unit: 'L', cost: formatNumber(primerCost) },
        { item: paintCategory === 'Interior' ? 'Emulsion Paint' : 'Enamel Paint', quantity: formatNumber(regularPaintLtr + shutterPaintLtr + framePaintLtr), unit: 'L', cost: formatNumber(regularPaintCost) },
        ...specialPaints.map(paint => {
          let coverage = paint.type === 'Texture' ? 25 : paint.type === 'Royal' ? 20 : paint.type === 'Design' ? 30 : 35;
          let rate = paint.type === 'Texture' ? textureRate : paint.type === 'Royal' ? royalRate : paint.type === 'Design' ? designRate : artRate;
          return { item: `${paint.type} Paint`, quantity: formatNumber(paint.area / coverage), unit: 'L', cost: formatNumber(paint.area * rate) };
        }),
        { item: 'Material Total', quantity: '', unit: '', cost: formatNumber(materialTotal) },
        { item: 'Labour', quantity: formatNumber(netPaintArea), unit: 'sqft', cost: formatNumber(labourCost) },
        { item: 'GRAND TOTAL', quantity: '', unit: '', cost: formatNumber(grandTotal) }
      ]
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
    const data = results.materials.map(m => ({ Item: m.item, Quantity: m.quantity, Unit: m.unit, Cost: m.cost ? `₹${m.cost}` : '-' }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Paint');
    XLSX.writeFile(wb, `Paint_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const materialList = results.materials.map(m => `${m.item}: ${m.quantity} ${m.unit}${m.cost ? ` - ₹${m.cost}` : ''}`).join('\n');
    const message = `🎨 PAINT CALCULATION\n\n${materialList}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🎨 Paint Calculator')
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Putty ₹${puttyRate}/kg | Primer ₹${primerRate}/L | ${paintCategory === 'Interior' ? 'Emulsion' : 'Enamel'} ${paintCategory === 'Interior' ? emulsionRate : enamelRate}/L | Labour ₹${labourRate}/sqft`)
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Surface Details'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Paint Type'), React.createElement('select', { value: paintCategory, onChange: (e) => setPaintCategory(e.target.value), style: styles.select },
        React.createElement('option', { value: 'Interior' }, 'Interior (Emulsion)'),
        React.createElement('option', { value: 'Exterior' }, 'Exterior (Enamel)'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length (ft)'), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Height (ft)'), React.createElement('input', { type: 'number', value: height, onChange: (e) => setHeight(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Walls'), React.createElement('input', { type: 'number', value: wallNos, onChange: (e) => setWallNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Include Ceiling'), React.createElement('select', { value: includeCeiling, onChange: (e) => setIncludeCeiling(e.target.value === 'true'), style: styles.select },
        React.createElement('option', { value: 'true' }, 'Yes'), React.createElement('option', { value: 'false' }, 'No'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Paint Coats'), React.createElement('select', { value: paintCoats, onChange: (e) => setPaintCoats(parseFloat(e.target.value)), style: styles.select },
        React.createElement('option', { value: 1 }, '1 Coat'), React.createElement('option', { value: 2 }, '2 Coats'), React.createElement('option', { value: 3 }, '3 Coats')))
    ),
    
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Primer Coats'), React.createElement('select', { value: primerCoats, onChange: (e) => setPrimerCoats(parseFloat(e.target.value)), style: styles.select },
        React.createElement('option', { value: 1 }, '1 Coat'), React.createElement('option', { value: 2 }, '2 Coats')))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🚪 Openings'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Type'), React.createElement('select', { value: openingType, onChange: (e) => setOpeningType(e.target.value), style: styles.select },
        React.createElement('option', { value: 'Door' }, 'Door'),
        React.createElement('option', { value: 'Window' }, 'Window'),
        React.createElement('option', { value: 'Ventilation' }, 'Ventilation'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (ft)'), React.createElement('input', { type: 'number', value: openingWidth, onChange: (e) => setOpeningWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Height (ft)'), React.createElement('input', { type: 'number', value: openingHeight, onChange: (e) => setOpeningHeight(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Nos'), React.createElement('input', { type: 'number', value: openingNos, onChange: (e) => setOpeningNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Has Shutter'), React.createElement('select', { value: hasShutter, onChange: (e) => setHasShutter(e.target.value === 'true'), style: styles.select },
        React.createElement('option', { value: 'true' }, 'Yes'), React.createElement('option', { value: 'false' }, 'No'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Has Frame'), React.createElement('select', { value: hasFrame, onChange: (e) => setHasFrame(e.target.value === 'true'), style: styles.select },
        React.createElement('option', { value: 'true' }, 'Yes'), React.createElement('option', { value: 'false' }, 'No')))
    ),
    
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('button', { onClick: addOpening, style: styles.buttonSmall }, '+ Add Opening'))
    ),
    
    openings.length > 0 && React.createElement('div', { style: styles.tableContainer },
      React.createElement('table', { style: styles.table },
        React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Type'), React.createElement('th', { style: styles.th }, 'Size'), React.createElement('th', { style: styles.th }, 'Nos'), React.createElement('th', { style: styles.th }, 'Shutter'), React.createElement('th', { style: styles.th }, 'Frame'), React.createElement('th', { style: styles.th }, ''))),
        React.createElement('tbody', null,
          openings.map((opening, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? styles.evenRow : {} },
            React.createElement('td', { style: styles.td }, opening.type),
            React.createElement('td', { style: styles.td }, `${opening.width}' x ${opening.height}'`),
            React.createElement('td', { style: styles.td }, opening.nos),
            React.createElement('td', { style: styles.td }, opening.hasShutter ? 'Yes' : 'No'),
            React.createElement('td', { style: styles.td }, opening.hasFrame ? 'Yes' : 'No'),
            React.createElement('td', { style: styles.td }, React.createElement('button', { onClick: () => removeOpening(idx), style: { ...styles.buttonSmall, backgroundColor: '#dc3545' } }, 'X'))))
        )
      )
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🎨 Special Paints'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Type'), React.createElement('select', { value: specialType, onChange: (e) => setSpecialType(e.target.value), style: styles.select },
        React.createElement('option', { value: 'Texture' }, 'Texture Paint'),
        React.createElement('option', { value: 'Royal' }, 'Royal Paint'),
        React.createElement('option', { value: 'Design' }, 'Design Paint'),
        React.createElement('option', { value: 'Art' }, 'Art Paint'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Area (sqft)'), React.createElement('input', { type: 'number', value: specialArea, onChange: (e) => setSpecialArea(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('button', { onClick: addSpecialPaint, style: styles.buttonSmall }, '+ Add Special Paint'))
    ),
    
    specialPaints.length > 0 && React.createElement('div', { style: styles.tableContainer },
      React.createElement('table', { style: styles.table },
        React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Type'), React.createElement('th', { style: styles.th }, 'Area'), React.createElement('th', { style: styles.th }, ''))),
        React.createElement('tbody', null,
          specialPaints.map((paint, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? styles.evenRow : {} },
            React.createElement('td', { style: styles.td }, paint.type),
            React.createElement('td', { style: styles.td }, formatNumber(paint.area)),
            React.createElement('td', { style: styles.td }, React.createElement('button', { onClick: () => removeSpecialPaint(idx), style: { ...styles.buttonSmall, backgroundColor: '#dc3545' } }, 'X'))))
        )
      )
    ),
    
    React.createElement('div', { style: styles.buttonRow },
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate'),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'paint-calculator.backup-before-upgrade', handleExportExcel), style: styles.buttonExport }, '📊 Excel'),
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'paint-calculator.backup-before-upgrade', handleWhatsApp), style: styles.buttonWhatsapp }, '💬 Share')
      )
    ),
    
    generated && results && React.createElement('div', null,
      React.createElement('div', { style: styles.cardContainer },
        React.createElement('div', { style: { ...styles.card, ...styles.cardBlue } }, React.createElement('div', null, '🎨'), React.createElement('div', null, 'Paint Area'), React.createElement('div', { style: styles.cardValue }, `${results.netArea} sqft`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightGreen } }, React.createElement('div', null, '🪣'), React.createElement('div', null, 'Putty'), React.createElement('div', { style: styles.cardValue }, `${results.materials.find(m => m.item === 'Wall Putty')?.quantity || '0'} kg`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightOrange } }, React.createElement('div', null, '🎨'), React.createElement('div', null, 'Primer'), React.createElement('div', { style: styles.cardValue }, `${results.materials.find(m => m.item === 'Primer')?.quantity || '0'} L`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightTeal } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Total Cost'), React.createElement('div', { style: styles.cardValue }, `₹${results.materials.find(m => m.item === 'GRAND TOTAL')?.cost || '0'}`))
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Item'), React.createElement('th', { style: styles.th }, 'Quantity'), React.createElement('th', { style: styles.th }, 'Unit'), React.createElement('th', { style: styles.th }, 'Cost (₹)'))),
          React.createElement('tbody', null,
            results.materials.map((item, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, item.item),
              React.createElement('td', { style: styles.td }, item.quantity),
              React.createElement('td', { style: styles.td }, item.unit),
              React.createElement('td', { style: styles.td }, item.cost ? `₹${item.cost}` : '-')
            ))
          )
        )
      )
    )
  );
}


