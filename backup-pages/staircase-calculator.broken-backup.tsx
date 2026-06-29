import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#800020', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#800020', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' },
  row4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' },
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
  th: { backgroundColor: '#800020', color: 'white', padding: '8px', textAlign: 'left' },
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

export default function StaircasePage() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();
  const { rates, loading } = useRates();
  
  // Staircase Dimensions
  const [rise, setRise] = useState(7);
  const [tread, setTread] = useState(10);
  const [width, setWidth] = useState(4);
  const [numSteps, setNumSteps] = useState(12);
  const [numFlights, setNumFlights] = useState(1);
  const [landingLength, setLandingLength] = useState(4);
  const [landingWidth, setLandingWidth] = useState(4);
  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [cover, setCover] = useState(20);
  
  // Step Finish & Railing
  const [stepFinish, setStepFinish] = useState('IPS');
  const [railingType, setRailingType] = useState('MS');
  const [railingLength, setRailingLength] = useState(15);
  const [wastage, setWastage] = useState(3);
  
  // X Direction Reinforcement (Main Bars along Length)
  const [mainBarDia, setMainBarDia] = useState(12);
  const [mainBarSpacing, setMainBarSpacing] = useState(150);
  
  // Y Direction Reinforcement (Distribution Bars along Width)
  const [distBarDia, setDistBarDia] = useState(10);
  const [distBarSpacing, setDistBarSpacing] = useState(200);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);

  const calculateResults = () => {
    // Plan Area
    const planArea = (numSteps * tread / 12) * width;
    const landingArea = landingLength * landingWidth;
    const totalArea = planArea + landingArea;
    
    // Concrete Volume
    const waistSlabThickness = 0.5;
    const stepVolume = numSteps * (rise/12) * (tread/12) * width * 0.5;
    const waistVolume = planArea * waistSlabThickness;
    const landingVolume = landingArea * 0.5;
    const concreteVolume = (stepVolume + waistVolume + landingVolume) * numFlights;
    const concreteVolumeCum = concreteVolume / 35.315;
    
    // X Direction Steel (Main Bars - along length)
    const lengthInFt = (numSteps * tread / 12) + landingLength;
    const lengthInMM = lengthInFt * 304.8;
    const mainBarsNos = Math.floor(lengthInMM / mainBarSpacing) + 1;
    const mainBarLengthPerBarFt = width;
    const mainBarTotalLengthFt = mainBarsNos * mainBarLengthPerBarFt * numFlights;
    const mainBarTotalLengthM = mainBarTotalLengthFt / 3.28084;
    const mainSteelKg = mainBarTotalLengthM * getWeightPerMeter(mainBarDia);
    
    // Y Direction Steel (Distribution Bars - along width)
    const widthInMM = width * 304.8;
    const distBarsNos = Math.floor(widthInMM / distBarSpacing) + 1;
    const distBarLengthPerBarFt = lengthInFt;
    const distBarTotalLengthFt = distBarsNos * distBarLengthPerBarFt * numFlights;
    const distBarTotalLengthM = distBarTotalLengthFt / 3.28084;
    const distSteelKg = distBarTotalLengthM * getWeightPerMeter(distBarDia);
    
    const totalSteelKg = (mainSteelKg + distSteelKg) * (1 + wastage/100);
    
    // Concrete Materials
    const cementBags = concreteVolumeCum * 7.5;
    const sandCft = concreteVolumeCum * 0.42 * 35.315;
    const aggregateCft = concreteVolumeCum * 0.84 * 35.315;
    
    // Finish Area
    const finishArea = totalArea * numFlights;
    
    // Railing Length in RMT
    const railingRMT = railingLength / 3.28;
    
    // Binding Wire
    const bindingWire = totalSteelKg * 0.008;
    
    // Costs
    const cementCost = cementBags * (rates?.cement || 400);
    const sandCost = sandCft * (rates?.sand || 55);
    const aggregateCost = aggregateCft * (rates?.aggregate20 || 50);
    const steelCost = totalSteelKg * (rates?.steel || 68);
    const bindingWireCost = bindingWire * (rates?.bindingWire || 80);
    const finishCost = finishArea * 40;
    const railingCost = railingRMT * 250;
    
    const materialTotal = cementCost + sandCost + aggregateCost + steelCost + bindingWireCost + finishCost + railingCost;
    
    // Labour for staircase
    const labourPerCum = rates?.labour_concrete || 1000;
    const labourCost = concreteVolumeCum * labourPerCum;
    
    const grandTotal = materialTotal + labourCost;
    
    const steelBreakdown = [
      { item: `${mainBarDia}mm Main Bars (X-Dir @ ${mainBarSpacing}mm, ${mainBarsNos} nos)`, quantity: mainSteelKg, length: formatNumber(mainBarTotalLengthFt) },
      { item: `${distBarDia}mm Distribution Bars (Y-Dir @ ${distBarSpacing}mm, ${distBarsNos} nos)`, quantity: distSteelKg, length: formatNumber(distBarTotalLengthFt) }
    ];
    
    return {
      concrete: { volumeCft: formatNumber(concreteVolume), volumeCum: formatNumber(concreteVolumeCum), cement: formatNumber(cementBags), sandCft: formatNumber(sandCft), aggregateCft: formatNumber(aggregateCft) },
      area: { planArea: formatNumber(planArea), landingArea: formatNumber(landingArea), totalArea: formatNumber(totalArea), finishArea: formatNumber(finishArea), lengthInFt: formatNumber(lengthInFt) },
      steel: { main: formatNumber(mainSteelKg), distribution: formatNumber(distSteelKg), total: formatNumber(totalSteelKg) },
      steelBreakdown,
      accessories: { bindingWire: formatNumber(bindingWire) },
      railing: { length: railingLength, rmt: formatNumber(railingRMT) },
      costs: { cement: formatNumber(cementCost), sand: formatNumber(sandCost), aggregate: formatNumber(aggregateCost), steel: formatNumber(steelCost), bindingWire: formatNumber(bindingWireCost), finish: formatNumber(finishCost), railing: formatNumber(railingCost), materialTotal: formatNumber(materialTotal), labour: formatNumber(labourCost), grandTotal: formatNumber(grandTotal) },
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
      { Item: 'Aggregate', Quantity: results.concrete.aggregateCft, Unit: 'CFT', Cost: `₹${results.costs.aggregate}` },
      ...results.steelBreakdown.map(s => ({ Item: `Steel - ${s.item}`, Quantity: formatNumber(s.quantity), Unit: 'kg', Cost: `₹${formatNumber(s.quantity * results.rates.steel)}` })),
      { Item: 'Binding Wire', Quantity: results.accessories.bindingWire, Unit: 'kg', Cost: `₹${results.costs.bindingWire}` },
      { Item: 'Step Finish', Quantity: results.area.finishArea, Unit: 'sqft', Cost: `₹${results.costs.finish}` },
      { Item: 'Railing', Quantity: results.railing.rmt, Unit: 'RMT', Cost: `₹${results.costs.railing}` },
      { Item: 'Material Total', Quantity: '', Unit: '', Cost: `₹${results.costs.materialTotal}` },
      { Item: 'Labour', Quantity: results.concrete.volumeCum, Unit: 'CUM', Cost: `₹${results.costs.labour}` },
      { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Cost: `₹${results.costs.grandTotal}` }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staircase_Calculator');
    XLSX.writeFile(wb, `Staircase_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🪜 STAIRCASE CALCULATION\n\nPlan Area: ${results.area.planArea} sqft\nConcrete: ${results.concrete.volumeCft} CFT\nCement: ${results.concrete.cement} bags\nSteel: ${results.steel.total} kg\nTotal Cost: ₹${results.costs.grandTotal}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🪜 Staircase Calculator')
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Material Rates: Cement ₹${rates?.cement || 400}/bag | Steel ₹${rates?.steel || 68}/kg`),
      React.createElement('div', null, React.createElement('small', null, `👷 Labour: ₹${rates?.labour_concrete || 1000}/CUM`))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Staircase Dimensions'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Riser (in)'),
        React.createElement('input', { type: 'number', value: rise, onChange: (e) => setRise(parseFloat(e.target.value) || 0), style: styles.input })
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Tread (in)'),
        React.createElement('input', { type: 'number', value: tread, onChange: (e) => setTread(parseFloat(e.target.value) || 0), style: styles.input })
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Width (ft)'),
        React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value) || 0), style: styles.input })
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'No. of Floors'),
        React.createElement('input', { type: 'number', value: Math.ceil((noOfFlights || 2) / 2), onChange: (e) => setNoOfFlights((parseFloat(e.target.value) || 1) * 2), style: styles.input })
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Floor Height (ft)'),
        React.createElement('input', { type: 'number', value: (((noOfSteps || 12) * (rise || 7)) / 12).toFixed(2), onChange: (e) => setNoOfSteps(Math.ceil(((parseFloat(e.target.value) || 10) * 12) / (rise || 7))), style: styles.input })
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Grade'),
        React.createElement('select', { value: concreteGrade, onChange: (e) => setConcreteGrade(e.target.value), style: styles.select },
          React.createElement('option', { value: 'M20' }, 'M20'),
          React.createElement('option', { value: 'M25' }, 'M25'),
          React.createElement('option', { value: 'M30' }, 'M30')
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Landing L (ft)'),
        React.createElement('input', { type: 'number', value: landingL, onChange: (e) => setLandingL(parseFloat(e.target.value) || 0), style: styles.input })
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Landing W (ft)'),
        React.createElement('input', { type: 'number', value: landingW, onChange: (e) => setLandingW(parseFloat(e.target.value) || 0), style: styles.input })
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Cover (mm)'),
        React.createElement('input', { type: 'number', value: cover, onChange: (e) => setCover(parseFloat(e.target.value) || 0), style: styles.input })
      ),
      React.createElement('div', null,
        React.createElement('label', { style: styles.label }, 'Wastage (%)'),
        React.createElement('input', { type: 'number', value: wastage, onChange: (e) => setWastage(parseFloat(e.target.value) || 0), style: styles.input })
      )
    ),
    React.createElement('div', { style: styles.sectionTitle }, '🔄 Reinforcement (X & Y Direction)'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'X-Dir Dia (mm)'), React.createElement('input', { type: 'number', value: mainBarDia, onChange: (e) => setMainBarDia(parseFloat(e.target.value)),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'X-Dir Spacing (mm)'), React.createElement('input', { type: 'number', value: mainBarSpacing, onChange: (e) => setMainBarSpacing(parseFloat(e.target.value)),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Y-Dir Dia (mm)'), React.createElement('input', { type: 'number', value: distBarDia, onChange: (e) => setDistBarDia(parseFloat(e.target.value)),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Y-Dir Spacing (mm)'), React.createElement('input', { type: 'number', value: distBarSpacing, onChange: (e) => setDistBarSpacing(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🎨 Finish & Railing'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Step Finish'), React.createElement('select', { value: stepFinish, onChange: (e) => setStepFinish(e.target.value), style: styles.select }, React.createElement('option', { value: 'IPS' }, 'IPS'), React.createElement('option', { value: 'Marble' }, 'Marble'), React.createElement('option', { value: 'Granite' }, 'Granite'), React.createElement('option', { value: 'Wood' }, 'Wood'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Railing Type'), React.createElement('select', { value: railingType, onChange: (e) => setRailingType(e.target.value), style: styles.select }, React.createElement('option', { value: 'MS' }, 'MS'), React.createElement('option', { value: 'SS' }, 'SS'), React.createElement('option', { value: 'Wood' }, 'Wood'), React.createElement('option', { value: 'Glass' }, 'Glass'))),
       style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.buttonRow },
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate'),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'staircase-calculator.broken-backup', handleExportExcel), style: styles.buttonExport }, '📊 Excel'),
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'staircase-calculator.broken-backup', handleWhatsApp), style: styles.buttonWhatsapp }, '💬 Share')
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
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Aggregate'), React.createElement('td', { style: styles.td }, results.concrete.aggregateCft), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.aggregate}`)),
            results.steelBreakdown.map((item, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, `Steel - ${item.item}`), React.createElement('td', { style: styles.td }, formatNumber(item.quantity)), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, `₹${formatNumber(item.quantity * results.rates.steel)}`))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Binding Wire'), React.createElement('td', { style: styles.td }, results.accessories.bindingWire), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, `₹${results.costs.bindingWire}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Step Finish'), React.createElement('td', { style: styles.td }, results.area.finishArea), React.createElement('td', { style: styles.td }, 'sqft'), React.createElement('td', { style: styles.td }, `₹${results.costs.finish}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Railing'), React.createElement('td', { style: styles.td }, results.railing.rmt), React.createElement('td', { style: styles.td }, 'RMT'), React.createElement('td', { style: styles.td }, `₹${results.costs.railing}`)),
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Material Total'), React.createElement('td', { style: styles.td }, `₹${results.costs.materialTotal}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { colSpan: 3, style: styles.td }, 'Labour'), React.createElement('td', { style: styles.td }, `₹${results.costs.labour}`)),
            React.createElement('tr', { style: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: { padding: '8px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '8px' } }, `₹${results.costs.grandTotal}`))
          )
        )
      )
    )
  );
}






