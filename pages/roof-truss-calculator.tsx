import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#8d6e63', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#8d6e63', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
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
  th: { backgroundColor: '#8d6e63', color: 'white', padding: '8px', textAlign: 'left' },
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

// Roof Types with coverage and rates
const roofTypes = {
  'Mangalore Tiles': { coverage: 1.15, rateKey: 'mangaloreTile', defaultRate: 45, unit: 'sqft', material: 'Clay Tile' },
  'Clay Tiles': { coverage: 1.2, rateKey: 'clayTile', defaultRate: 55, unit: 'sqft', material: 'Clay' },
  'RCC Terrace': { coverage: 1.0, rateKey: 'rcc', defaultRate: 350, unit: 'sqft', material: 'Concrete' },
  'Metal Sheet': { coverage: 1.05, rateKey: 'metalSheet', defaultRate: 80, unit: 'sqft', material: 'Steel' },
  'Polycarbonate Sheet': { coverage: 1.02, rateKey: 'polycarbonate', defaultRate: 120, unit: 'sqft', material: 'Polycarbonate' },
  'Fiber Sheet': { coverage: 1.08, rateKey: 'fiberSheet', defaultRate: 60, unit: 'sqft', material: 'Fiber' },
  'Asbestos Sheet': { coverage: 1.1, rateKey: 'asbestos', defaultRate: 50, unit: 'sqft', material: 'Asbestos' },
  'Terracotta Tiles': { coverage: 1.18, rateKey: 'terracotta', defaultRate: 70, unit: 'sqft', material: 'Terracotta' },
  'Concrete Tiles': { coverage: 1.12, rateKey: 'concreteTile', defaultRate: 65, unit: 'sqft', material: 'Concrete' }
};

// Steel Section Weights
const sectionWeights = {
  'ISA 50x50x6': 4.5,
  'ISA 65x65x6': 5.8,
  'ISA 75x75x6': 6.8,
  'ISA 90x90x6': 8.2,
  'ISMB 150': 15.0,
  'ISMB 200': 25.4,
  'ISMB 250': 37.3,
  'ISMB 300': 46.0,
  'ISMC 100': 9.6,
  'ISMC 150': 16.4,
  'ISMC 200': 22.1
};

export default function RoofTrussPage() {
  const router = useRouter();
  const { rates, loading } = useRates();
  
  // Building Dimensions
  const [buildingLength, setBuildingLength] = useState(30);
  const [buildingWidth, setBuildingWidth] = useState(20);
  const [trussSpacing, setTrussSpacing] = useState(4);
  const [roofHeight, setRoofHeight] = useState(5);
  
  // Roof Type Selection
  const [roofType, setRoofType] = useState('Mangalore Tiles');
  
  // Structural Steel Members
  const [rafterSection, setRafterSection] = useState('ISA 75x75x6');
  const [bottomChordSection, setBottomChordSection] = useState('ISA 65x65x6');
  const [bracingSection, setBracingSection] = useState('ISA 50x50x6');
  const [columnSection, setColumnSection] = useState('ISMB 200');
  const [beamSection, setBeamSection] = useState('ISMB 150');
  const [purlinSection, setPurlinSection] = useState('ISA 75x75x6');
  
  // Fasteners
  const [boltDia, setBoltDia] = useState(16);
  const [boltNos, setBoltNos] = useState(50);
  const [anchorBoltDia, setAnchorBoltDia] = useState(20);
  const [anchorBoltNos, setAnchorBoltNos] = useState(12);
  const [weldLength, setWeldLength] = useState(20);
  const [paintCoats, setPaintCoats] = useState(2);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);
  
  const roofInfo = roofTypes[roofType];
  const roofRate = rates?.[roofInfo.rateKey] || roofInfo.defaultRate;
  const steelRate = rates?.steel || 68;
  const boltRate = rates?.bolt || 15;
  const anchorBoltRate = rates?.anchorBolt || 25;
  const paintRate = rates?.paint || 50;
  const labourRate = rates?.labour_steel || 15;

  const calculateResults = () => {
    // Number of trusses
    const trussNos = Math.ceil(buildingLength / trussSpacing) + 1;
    
    // Rafter length calculation
    const rafterLength = Math.sqrt(Math.pow(buildingWidth / 2, 2) + Math.pow(roofHeight, 2));
    
    // 1. RAFTERS (Top chords) - 2 per truss
    const rafterWeightPerM = sectionWeights[rafterSection] || 6.8;
    const rafterTotalLength = rafterLength * 2 * trussNos;
    const rafterWeight = rafterTotalLength * rafterWeightPerM;
    
    // 2. BOTTOM CHORDS - 1 per truss
    const bottomChordWeightPerM = sectionWeights[bottomChordSection] || 5.8;
    const bottomChordTotalLength = buildingWidth * trussNos;
    const bottomChordWeight = bottomChordTotalLength * bottomChordWeightPerM;
    
    // 3. BRACINGS
    const bracingLength = Math.sqrt(Math.pow(buildingWidth, 2) + Math.pow(buildingLength, 2));
    const bracingWeightPerM = sectionWeights[bracingSection] || 4.5;
    const bracingTotalLength = bracingLength * trussNos * 0.8;
    const bracingWeight = bracingTotalLength * bracingWeightPerM;
    
    // 4. PURLINS
    const purlinSpacing = 2.5;
    const purlinNos = Math.ceil(rafterLength / purlinSpacing) * trussNos;
    const purlinWeightPerM = sectionWeights[purlinSection] || 6.8;
    const purlinTotalLength = buildingLength * purlinNos;
    const purlinWeight = purlinTotalLength * purlinWeightPerM;
    
    // 5. COLUMNS
    const columnHeight = 10;
    const columnWeightPerM = sectionWeights[columnSection] || 25.4;
    const columnNos = trussNos * 2;
    const columnTotalLength = columnHeight * columnNos;
    const columnWeight = columnTotalLength * columnWeightPerM;
    
    // 6. BEAMS
    const beamWeightPerM = sectionWeights[beamSection] || 15.0;
    const beamTotalLength = buildingLength * trussNos;
    const beamWeight = beamTotalLength * beamWeightPerM;
    
    // 7. BRACKETS & GUSSET PLATES
    const bracketWeight = trussNos * 8;
    const gussetPlateWeight = trussNos * 15;
    
    // Total Steel Weight
    const totalSteelKg = rafterWeight + bottomChordWeight + bracingWeight + purlinWeight + columnWeight + beamWeight + bracketWeight + gussetPlateWeight;
    const steelCost = totalSteelKg * steelRate;
    
    // 8. Roofing Area
    const roofArea = buildingLength * buildingWidth * roofInfo.coverage;
    const roofingCost = roofArea * roofRate;
    
    // 9. Fasteners
    const boltCost = boltNos * boltRate;
    const anchorBoltCost = anchorBoltNos * anchorBoltRate;
    const weldCost = weldLength * 50;
    
    // 10. Painting
    const paintArea = totalSteelKg / 10;
    const paintCost = paintArea * paintRate * paintCoats;
    
    // Material Total
    const materialTotal = steelCost + roofingCost + boltCost + anchorBoltCost + weldCost + paintCost;
    const labourCost = totalSteelKg * labourRate;
    const grandTotal = materialTotal + labourCost;
    
    const memberDetails = [
      { member: 'Rafters (Top Chords)', section: rafterSection, length: formatNumber(rafterTotalLength), weight: formatNumber(rafterWeight) },
      { member: 'Bottom Chords', section: bottomChordSection, length: formatNumber(bottomChordTotalLength), weight: formatNumber(bottomChordWeight) },
      { member: 'Bracings', section: bracingSection, length: formatNumber(bracingTotalLength), weight: formatNumber(bracingWeight) },
      { member: 'Purlins', section: purlinSection, length: formatNumber(purlinTotalLength), weight: formatNumber(purlinWeight) },
      { member: 'Columns', section: columnSection, length: formatNumber(columnTotalLength), weight: formatNumber(columnWeight) },
      { member: 'Beams', section: beamSection, length: formatNumber(beamTotalLength), weight: formatNumber(beamWeight) },
      { member: 'Brackets & Gusset Plates', section: 'Plate', nos: trussNos * 2, weight: formatNumber(bracketWeight + gussetPlateWeight) }
    ];
    
    return {
      building: { length: buildingLength, width: buildingWidth, height: roofHeight, trussNos: trussNos, trussSpacing: trussSpacing },
      roof: { type: roofType, material: roofInfo.material, coverage: roofInfo.coverage, area: formatNumber(roofArea), rate: roofRate, cost: formatNumber(roofingCost) },
      members: memberDetails,
      steel: { totalKg: formatNumber(totalSteelKg), cost: formatNumber(steelCost), rate: steelRate },
      fasteners: { bolts: boltNos, boltCost: formatNumber(boltCost), anchorBolts: anchorBoltNos, anchorBoltCost: formatNumber(anchorBoltCost), weldLength: weldLength, weldCost: formatNumber(weldCost) },
      painting: { area: formatNumber(paintArea), coats: paintCoats, cost: formatNumber(paintCost) },
      costs: { material: formatNumber(materialTotal), labour: formatNumber(labourCost), grand: formatNumber(grandTotal) }
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
      { Item: 'Building Length', Quantity: results.building.length, Unit: 'ft', Cost: '-' },
      { Item: 'Building Width', Quantity: results.building.width, Unit: 'ft', Cost: '-' },
      { Item: 'Roof Height', Quantity: results.building.height, Unit: 'ft', Cost: '-' },
      { Item: 'Number of Trusses', Quantity: results.building.trussNos, Unit: 'nos', Cost: '-' },
      { Item: 'Roof Type', Quantity: results.roof.type, Unit: '-', Cost: '-' },
      { Item: 'Roof Area', Quantity: results.roof.area, Unit: 'sqft', Cost: `₹${results.roof.cost}` },
      ...results.members.map(m => ({ Item: m.member, Quantity: m.weight, Unit: 'kg', Cost: '-' })),
      { Item: 'Total Steel', Quantity: results.steel.totalKg, Unit: 'kg', Cost: `₹${results.steel.cost}` },
      { Item: 'Bolts & Nuts', Quantity: results.fasteners.bolts, Unit: 'nos', Cost: `₹${results.fasteners.boltCost}` },
      { Item: 'Anchor Bolts', Quantity: results.fasteners.anchorBolts, Unit: 'nos', Cost: `₹${results.fasteners.anchorBoltCost}` },
      { Item: 'Welding', Quantity: results.fasteners.weldLength, Unit: 'm', Cost: `₹${results.fasteners.weldCost}` },
      { Item: 'Painting', Quantity: results.painting.area, Unit: 'sqft', Cost: `₹${results.painting.cost}` },
      { Item: 'Material Total', Quantity: '', Unit: '', Cost: `₹${results.costs.material}` },
      { Item: 'Labour', Quantity: results.steel.totalKg, Unit: 'kg', Cost: `₹${results.costs.labour}` },
      { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Cost: `₹${results.costs.grand}` }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Roof_Truss');
    XLSX.writeFile(wb, `Roof_Truss_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🏠 ROOF TRUSS - ${results.roof.type}\n\nBuilding: ${results.building.length}' x ${results.building.width}'\nTrusses: ${results.building.trussNos} nos\nSteel: ${results.steel.totalKg} kg\nRoof Area: ${results.roof.area} sqft\nTotal Cost: ₹${results.costs.grand}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🏗️ Roof Truss - Steel Structure Calculator')
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Steel: ₹${steelRate}/kg | ${roofType}: ₹${roofRate}/sqft | Labour: ₹${labourRate}/kg`)
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Building Dimensions'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Building Length (ft)'), React.createElement('input', { type: 'number', value: buildingLength, onChange: (e) => setBuildingLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Building Width (ft)'), React.createElement('input', { type: 'number', value: buildingWidth, onChange: (e) => setBuildingWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Roof Height (ft)'), React.createElement('input', { type: 'number', value: roofHeight, onChange: (e) => setRoofHeight(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Truss Spacing (ft)'), React.createElement('input', { type: 'number', value: trussSpacing, onChange: (e) => setTrussSpacing(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🏠 Roof Type (For Terrace/Sloped Roof)'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Roof Type'), React.createElement('select', { value: roofType, onChange: (e) => setRoofType(e.target.value), style: styles.select },
        React.createElement('option', { value: 'Mangalore Tiles' }, '🏺 Mangalore Tiles'),
        React.createElement('option', { value: 'Clay Tiles' }, '🏺 Clay Tiles'),
        React.createElement('option', { value: 'Terracotta Tiles' }, '🏺 Terracotta Tiles'),
        React.createElement('option', { value: 'Concrete Tiles' }, '🏺 Concrete Tiles'),
        React.createElement('option', { value: 'RCC Terrace' }, '🏢 RCC Terrace (Flat Roof)'),
        React.createElement('option', { value: 'Metal Sheet' }, '🔩 Metal Sheet'),
        React.createElement('option', { value: 'Polycarbonate Sheet' }, '💎 Polycarbonate Sheet'),
        React.createElement('option', { value: 'Fiber Sheet' }, '🔧 Fiber Sheet'),
        React.createElement('option', { value: 'Asbestos Sheet' }, '⚠️ Asbestos Sheet'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Material'), React.createElement('div', { style: { ...styles.input, backgroundColor: '#e8f4f8' } }, roofInfo.material)),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Coverage Factor'), React.createElement('div', { style: { ...styles.input, backgroundColor: '#e8f4f8' } }, `${roofInfo.coverage}x`)),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Rate (₹/sqft)'), React.createElement('div', { style: { ...styles.input, backgroundColor: '#e8f4f8' } }, roofRate))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🏗️ Structural Steel Sections'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Rafter Section'), React.createElement('select', { value: rafterSection, onChange: (e) => setRafterSection(e.target.value), style: styles.select },
        Object.keys(sectionWeights).map(s => React.createElement('option', { key: s, value: s }, s)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bottom Chord'), React.createElement('select', { value: bottomChordSection, onChange: (e) => setBottomChordSection(e.target.value), style: styles.select },
        Object.keys(sectionWeights).map(s => React.createElement('option', { key: s, value: s }, s)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bracing'), React.createElement('select', { value: bracingSection, onChange: (e) => setBracingSection(e.target.value), style: styles.select },
        Object.keys(sectionWeights).map(s => React.createElement('option', { key: s, value: s }, s)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Column'), React.createElement('select', { value: columnSection, onChange: (e) => setColumnSection(e.target.value), style: styles.select },
        Object.keys(sectionWeights).filter(s => s.includes('ISMB')).map(s => React.createElement('option', { key: s, value: s }, s)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Beam'), React.createElement('select', { value: beamSection, onChange: (e) => setBeamSection(e.target.value), style: styles.select },
        Object.keys(sectionWeights).filter(s => s.includes('ISMB')).map(s => React.createElement('option', { key: s, value: s }, s)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Purlin'), React.createElement('select', { value: purlinSection, onChange: (e) => setPurlinSection(e.target.value), style: styles.select },
        Object.keys(sectionWeights).map(s => React.createElement('option', { key: s, value: s }, s))))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🔩 Fasteners & Accessories'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bolt Dia (mm)'), React.createElement('input', { type: 'number', value: boltDia, onChange: (e) => setBoltDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bolt Nos'), React.createElement('input', { type: 'number', value: boltNos, onChange: (e) => setBoltNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Anchor Bolt Dia'), React.createElement('input', { type: 'number', value: anchorBoltDia, onChange: (e) => setAnchorBoltDia(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Anchor Bolt Nos'), React.createElement('input', { type: 'number', value: anchorBoltNos, onChange: (e) => setAnchorBoltNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Weld Length (m)'), React.createElement('input', { type: 'number', value: weldLength, onChange: (e) => setWeldLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Paint Coats'), React.createElement('input', { type: 'number', value: paintCoats, onChange: (e) => setPaintCoats(parseFloat(e.target.value)), style: styles.input }))
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
        React.createElement('div', { style: { ...styles.card, ...styles.cardBlue } }, React.createElement('div', null, '🏗️'), React.createElement('div', null, 'Steel'), React.createElement('div', { style: styles.cardValue }, `${results.steel.totalKg} kg`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightGreen } }, React.createElement('div', null, '🏠'), React.createElement('div', null, 'Roof Area'), React.createElement('div', { style: styles.cardValue }, `${results.roof.area} sqft`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightOrange } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Material Cost'), React.createElement('div', { style: styles.cardValue }, `₹${results.costs.material}`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightTeal } }, React.createElement('div', null, '💎'), React.createElement('div', null, 'Grand Total'), React.createElement('div', { style: styles.cardValue }, `₹${results.costs.grand}`))
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Member'), React.createElement('th', { style: styles.th }, 'Section'), React.createElement('th', { style: styles.th }, 'Weight (kg)'))),
          React.createElement('tbody', null,
            results.members.map((member, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, member.member),
              React.createElement('td', { style: styles.td }, member.section),
              React.createElement('td', { style: styles.td }, member.weight)))
          ),
          React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th, colSpan: 3 }, 'COST BREAKDOWN'))),
          React.createElement('tbody', null,
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { colSpan: 2, style: styles.td }, results.roof.type), React.createElement('td', { style: styles.td }, `₹${results.roof.cost}`)),
            React.createElement('tr', null, React.createElement('td', { colSpan: 2, style: styles.td }, 'Structural Steel'), React.createElement('td', { style: styles.td }, `₹${results.steel.cost}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { colSpan: 2, style: styles.td }, 'Bolts & Fasteners'), React.createElement('td', { style: styles.td }, `₹${results.fasteners.boltCost}`)),
            React.createElement('tr', null, React.createElement('td', { colSpan: 2, style: styles.td }, 'Anchor Bolts'), React.createElement('td', { style: styles.td }, `₹${results.fasteners.anchorBoltCost}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { colSpan: 2, style: styles.td }, 'Welding'), React.createElement('td', { style: styles.td }, `₹${results.fasteners.weldCost}`)),
            React.createElement('tr', null, React.createElement('td', { colSpan: 2, style: styles.td }, 'Painting'), React.createElement('td', { style: styles.td }, `₹${results.painting.cost}`)),
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 2, style: styles.td }, 'Material Total'), React.createElement('td', { style: styles.td }, `₹${results.costs.material}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { colSpan: 2, style: styles.td }, 'Labour'), React.createElement('td', { style: styles.td }, `₹${results.costs.labour}`)),
            React.createElement('tr', { style: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 2, style: { padding: '8px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '8px' } }, `₹${results.costs.grand}`))
          )
        )
      )
    )
  );
}
