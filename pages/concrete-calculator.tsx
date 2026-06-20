import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#5a3e2b', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#5a3e2b', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
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
  th: { backgroundColor: '#5a3e2b', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  rateInfo: { backgroundColor: '#e8f4f8', padding: '6px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', marginBottom: '10px', color: '#555' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function ConcretePage() {
  const router = useRouter();
  const { rates, loading } = useRates();
  
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(10);
  const [thickness, setThickness] = useState(150);
  const [unit, setUnit] = useState('feet');
  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [wastage, setWastage] = useState(3);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);

  const calculateResults = () => {
    let L = unit === 'feet' ? length * 0.3048 : length;
    let W = unit === 'feet' ? width * 0.3048 : width;
    let T = unit === 'feet' ? thickness / 304.8 : thickness / 1000;
    
    const volumeCum = L * W * T;
    const volumeCft = volumeCum * 35.315;
    
    let cement, sand, aggregate20, aggregate12;
    if (concreteGrade === 'M20') {
      cement = volumeCum * 7.5;
      sand = volumeCum * 0.42;
      aggregate20 = volumeCum * 0.5;
      aggregate12 = volumeCum * 0.34;
    } else if (concreteGrade === 'M25') {
      cement = volumeCum * 8.2;
      sand = volumeCum * 0.4;
      aggregate20 = volumeCum * 0.48;
      aggregate12 = volumeCum * 0.32;
    } else {
      cement = volumeCum * 8.8;
      sand = volumeCum * 0.38;
      aggregate20 = volumeCum * 0.45;
      aggregate12 = volumeCum * 0.31;
    }
    
    const sandCft = sand * 35.315;
    const agg20Cft = aggregate20 * 35.315;
    const agg12Cft = aggregate12 * 35.315;
    
    const cementWithWastage = cement * (1 + wastage/100);
    const waterLtr = cementWithWastage * 50 * 0.45;
    
    const cementCost = cementWithWastage * (rates?.cement || 400);
    const sandCost = sandCft * (rates?.sand || 55);
    const agg20Cost = agg20Cft * (rates?.aggregate20 || 50);
    const agg12Cost = agg12Cft * (rates?.aggregate12 || 48);
    const waterCost = waterLtr * (rates?.water || 0.5);
    
    const materialTotal = cementCost + sandCost + agg20Cost + agg12Cost + waterCost;
    
    // Labour for concrete works (per CUM)
    const labourPerCum = rates?.labour_concrete || 1000;
    const labourCost = volumeCum * labourPerCum;
    
    const grandTotal = materialTotal + labourCost;
    
    // Labour breakdown
    const labourBreakdown = {
      shuttering: volumeCum * 400,
      barBending: volumeCum * 300,
      concreting: volumeCum * 200,
      profit: volumeCum * 100,
      total: labourCost
    };
    
    return {
      concrete: { volumeCum: formatNumber(volumeCum), volumeCft: formatNumber(volumeCft), cement: formatNumber(cementWithWastage), sandCft: formatNumber(sandCft), agg20Cft: formatNumber(agg20Cft), agg12Cft: formatNumber(agg12Cft), water: formatNumber(waterLtr) },
      costs: { cement: formatNumber(cementCost), sand: formatNumber(sandCost), agg20: formatNumber(agg20Cost), agg12: formatNumber(agg12Cost), water: formatNumber(waterCost), materialTotal: formatNumber(materialTotal), labour: formatNumber(labourCost), grandTotal: formatNumber(grandTotal) },
      labourBreakdown: {
        shuttering: formatNumber(labourBreakdown.shuttering),
        barBending: formatNumber(labourBreakdown.barBending),
        concreting: formatNumber(labourBreakdown.concreting),
        profit: formatNumber(labourBreakdown.profit),
        total: formatNumber(labourBreakdown.total)
      },
      rates: { cement: rates?.cement || 400, sand: rates?.sand || 55, steel: rates?.steel || 68 }
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
      { Item: '20mm Aggregate', Quantity: results.concrete.agg20Cft, Unit: 'CFT', Cost: `₹${results.costs.agg20}` },
      { Item: '12mm Aggregate', Quantity: results.concrete.agg12Cft, Unit: 'CFT', Cost: `₹${results.costs.agg12}` },
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
    XLSX.utils.book_append_sheet(wb, ws, 'Concrete_Calculator');
    XLSX.writeFile(wb, `Concrete_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🧱 CONCRETE CALCULATION\n\nDimensions: ${length} x ${width} x ${thickness} ${unit === 'feet' ? 'ft' : 'm'}\nConcrete: ${results.concrete.volumeCft} CFT\nCement: ${results.concrete.cement} bags\nTotal Cost: ₹${results.costs.grandTotal}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🧱 Concrete Calculator')
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Material Rates: Cement ₹${rates?.cement || 400}/bag | Sand ₹${rates?.sand || 55}/CFT`),
      React.createElement('div', null, React.createElement('small', null, `👷 Labour: ₹${rates?.labour_concrete || 1000}/CUM`))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Concrete Dimensions'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length'), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width'), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Thickness (mm)'), React.createElement('input', { type: 'number', value: thickness, onChange: (e) => setThickness(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Unit'), React.createElement('select', { value: unit, onChange: (e) => setUnit(e.target.value), style: styles.select }, React.createElement('option', { value: 'feet' }, 'Feet'), React.createElement('option', { value: 'meters' }, 'Meters'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Grade'), React.createElement('select', { value: concreteGrade, onChange: (e) => setConcreteGrade(e.target.value), style: styles.select }, React.createElement('option', { value: 'M20' }, 'M20'), React.createElement('option', { value: 'M25' }, 'M25'), React.createElement('option', { value: 'M30' }, 'M30'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Wastage (%)'), React.createElement('input', { type: 'number', value: wastage, onChange: (e) => setWastage(parseFloat(e.target.value)), style: styles.input }))
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
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightOrange } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Material Total'), React.createElement('div', { style: styles.cardValue }, `₹${results.costs.materialTotal}`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightTeal } }, React.createElement('div', null, '💎'), React.createElement('div', null, 'Grand Total'), React.createElement('div', { style: styles.cardValue }, `₹${results.costs.grandTotal}`))
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Item'), React.createElement('th', { style: styles.th }, 'Quantity'), React.createElement('th', { style: styles.th }, 'Unit'), React.createElement('th', { style: styles.th }, 'Cost'))),
          React.createElement('tbody', null,
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Concrete Volume'), React.createElement('td', { style: styles.td }, results.concrete.volumeCft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Cement'), React.createElement('td', { style: styles.td }, results.concrete.cement), React.createElement('td', { style: styles.td }, 'bags'), React.createElement('td', { style: styles.td }, `₹${results.costs.cement}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'M Sand'), React.createElement('td', { style: styles.td }, results.concrete.sandCft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.sand}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, '20mm Aggregate'), React.createElement('td', { style: styles.td }, results.concrete.agg20Cft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.agg20}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, '12mm Aggregate'), React.createElement('td', { style: styles.td }, results.concrete.agg12Cft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.agg12}`)),
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
