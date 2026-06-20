import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#e67e22', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#e67e22', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' },
  inputGroup: { marginBottom: '6px' },
  label: { display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '10px', color: '#555' },
  input: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box', backgroundColor: '#fff' },
  select: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' },
  buttonSmall: { backgroundColor: '#2196F3', color: 'white', padding: '4px 8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' },
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
  rateInfo: { backgroundColor: '#e8f4f8', padding: '6px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', marginBottom: '10px', color: '#555' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function PlasterPage() {
  const router = useRouter();
  const { rates, loading } = useRates();
  
  // Wall Dimensions
  const [wallNos, setWallNos] = useState(1);
  const [length, setLength] = useState(10);
  const [height, setHeight] = useState(10);
  const [plasterType, setPlasterType] = useState('Internal');
  const [thickness, setThickness] = useState(12);
  const [mortarRatio, setMortarRatio] = useState('1:4');
  const [wastage, setWastage] = useState(3);
  
  // Openings
  const [openings, setOpenings] = useState([]);
  const [newOpening, setNewOpening] = useState({ name: 'Door', length: 3.5, width: 7, nos: 1 });
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);
  
  // Rates
  const cementRate = rates?.cement || 400;
  const sandRate = rates?.sand || 55;
  
  const getLabourRate = () => {
    if (plasterType === 'Internal') return rates?.labour_plastering || 10;
    if (plasterType === 'External') return rates?.labour_external || 15;
    return rates?.labour_texture || 18;
  };
  
  const labourRate = getLabourRate();

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
    const netArea = (wallAreaSqft - totalOpeningArea) * 2;
    
    const plasterVolumeCft = netArea * (thickness / 12);
    const plasterVolumeCum = plasterVolumeCft / 35.315;
    
    let cementBags, sandCft;
    if (mortarRatio === '1:3') {
      cementBags = plasterVolumeCum * 10.8;
      sandCft = plasterVolumeCum * 0.9 * 35.315;
    } else if (mortarRatio === '1:4') {
      cementBags = plasterVolumeCum * 8.5;
      sandCft = plasterVolumeCum * 0.95 * 35.315;
    } else if (mortarRatio === '1:5') {
      cementBags = plasterVolumeCum * 7.2;
      sandCft = plasterVolumeCum * 1.0 * 35.315;
    } else {
      cementBags = plasterVolumeCum * 6.2;
      sandCft = plasterVolumeCum * 1.05 * 35.315;
    }
    
    const cementWithWastage = cementBags * (1 + wastage/100);
    const sandWithWastage = sandCft * (1 + wastage/100);
    const waterLtr = cementWithWastage * 50 * 0.3;
    
    const cementCost = cementWithWastage * cementRate;
    const sandCost = sandWithWastage * sandRate;
    const waterCost = waterLtr * 0.5;
    
    const materialTotal = cementCost + sandCost + waterCost;
    const labourCost = netArea * labourRate;
    const grandTotal = materialTotal + labourCost;
    
    return {
      area: { wall: formatNumber(wallAreaSqft), openings: formatNumber(totalOpeningArea), net: formatNumber(netArea) },
      plaster: { type: plasterType, thickness: thickness, volumeCft: formatNumber(plasterVolumeCft), volumeCum: formatNumber(plasterVolumeCum) },
      materials: { cement: formatNumber(cementWithWastage), sand: formatNumber(sandWithWastage), water: formatNumber(waterLtr) },
      costs: { cement: formatNumber(cementCost), sand: formatNumber(sandCost), water: formatNumber(waterCost), materialTotal: formatNumber(materialTotal), labour: formatNumber(labourCost), grandTotal: formatNumber(grandTotal) },
      labourRate: labourRate
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
      { Item: 'Wall Area', Quantity: results.area.wall, Unit: 'sqft', Cost: '-' },
      { Item: 'Opening Area', Quantity: results.area.openings, Unit: 'sqft', Cost: '-' },
      { Item: 'Net Plaster Area', Quantity: results.area.net, Unit: 'sqft', Cost: '-' },
      { Item: 'Cement', Quantity: results.materials.cement, Unit: 'bags', Cost: `₹${results.costs.cement}` },
      { Item: 'Sand', Quantity: results.materials.sand, Unit: 'CFT', Cost: `₹${results.costs.sand}` },
      { Item: 'Water', Quantity: results.materials.water, Unit: 'Ltr', Cost: `₹${results.costs.water}` },
      { Item: 'Material Total', Quantity: '', Unit: '', Cost: `₹${results.costs.materialTotal}` },
      { Item: 'Labour', Quantity: results.area.net, Unit: 'sqft', Cost: `₹${results.costs.labour}` },
      { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Cost: `₹${results.costs.grandTotal}` }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plaster');
    XLSX.writeFile(wb, `Plaster_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🪣 PLASTER CALCULATION\n\nWall: ${length}' x ${height}'\nType: ${results.plaster.type}\nThickness: ${results.plaster.thickness} mm\nNet Area: ${results.area.net} sqft\nCement: ${results.materials.cement} bags\nSand: ${results.materials.sand} CFT\nTotal Cost: ₹${results.costs.grandTotal}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🪣 Plaster Calculator')
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Cement ₹${cementRate}/bag | Sand ₹${sandRate}/CFT | Labour ₹${labourRate}/sqft`),
      React.createElement('div', null, React.createElement('small', null, `👷 ${plasterType} Plaster`))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Wall Dimensions'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Nos'), React.createElement('input', { type: 'number', value: wallNos, onChange: (e) => setWallNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length (ft)'), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Height (ft)'), React.createElement('input', { type: 'number', value: height, onChange: (e) => setHeight(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Plaster Type'), React.createElement('select', { value: plasterType, onChange: (e) => setPlasterType(e.target.value), style: styles.select },
        React.createElement('option', { value: 'Internal' }, 'Internal Plaster'),
        React.createElement('option', { value: 'External' }, 'External Plaster'),
        React.createElement('option', { value: 'Texture' }, 'Texture Plaster'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Thickness (mm)'), React.createElement('select', { value: thickness, onChange: (e) => setThickness(parseFloat(e.target.value)), style: styles.select },
        React.createElement('option', { value: 6 }, '6 mm'), React.createElement('option', { value: 9 }, '9 mm'),
        React.createElement('option', { value: 12 }, '12 mm'), React.createElement('option', { value: 15 }, '15 mm'),
        React.createElement('option', { value: 18 }, '18 mm'), React.createElement('option', { value: 20 }, '20 mm'),
        React.createElement('option', { value: 25 }, '25 mm'), React.createElement('option', { value: 30 }, '30 mm'),
        React.createElement('option', { value: 35 }, '35 mm'), React.createElement('option', { value: 40 }, '40 mm'),
        React.createElement('option', { value: 45 }, '45 mm'), React.createElement('option', { value: 50 }, '50 mm'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Mortar Ratio'), React.createElement('select', { value: mortarRatio, onChange: (e) => setMortarRatio(e.target.value), style: styles.select },
        React.createElement('option', { value: '1:3' }, '1:3'), React.createElement('option', { value: '1:4' }, '1:4'),
        React.createElement('option', { value: '1:5' }, '1:5'), React.createElement('option', { value: '1:6' }, '1:6')))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🚪 Openings'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Name'), React.createElement('select', { value: newOpening.name, onChange: (e) => setNewOpening({ ...newOpening, name: e.target.value }), style: styles.select },
        React.createElement('option', { value: 'Door' }, 'Door'), React.createElement('option', { value: 'Window' }, 'Window'),
        React.createElement('option', { value: 'Ventilation' }, 'Ventilation'))),
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
            React.createElement('td', { style: styles.td }, React.createElement('button', { onClick: () => removeOpening(idx), style: { ...styles.buttonSmall, backgroundColor: '#dc3545' } }, 'X'))
          ))
        )
      )
    ),
    
    React.createElement('div', { style: styles.row6 },
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
        React.createElement('div', { style: { ...styles.card, ...styles.cardBlue } }, React.createElement('div', null, '🪣'), React.createElement('div', null, 'Area'), React.createElement('div', { style: styles.cardValue }, `${results.area.net} sqft`)),
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
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Cement'), React.createElement('td', { style: styles.td }, results.materials.cement), React.createElement('td', { style: styles.td }, 'bags'), React.createElement('td', { style: styles.td }, `₹${results.costs.cement}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Sand'), React.createElement('td', { style: styles.td }, results.materials.sand), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.sand}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Water'), React.createElement('td', { style: styles.td }, results.materials.water), React.createElement('td', { style: styles.td }, 'Ltr'), React.createElement('td', { style: styles.td }, `₹${results.costs.water}`)),
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Material Total'), React.createElement('td', { style: styles.td }, `₹${results.costs.materialTotal}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Labour'), React.createElement('td', { style: styles.td }, `₹${results.costs.labour}`)),
            React.createElement('tr', { style: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: { padding: '8px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '8px' } }, `₹${results.costs.grandTotal}`))
          )
        )
      )
    )
  );
}
