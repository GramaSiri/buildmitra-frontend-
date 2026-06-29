import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#00bcd4', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px' },
  headerTitle: { margin: 0, fontSize: '20px', flex: 1 },
  headerSub: { margin: '5px 0 0', opacity: 0.9, fontSize: '12px' },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#00bcd4', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' },
  row3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' },
  inputGroup: { marginBottom: '12px' },
  label: { display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '11px', color: '#555' },
  input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff' },
  readOnly: { backgroundColor: '#e8f4f8', fontWeight: 'bold' },
  select: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff' },
  buttonGenerate: { backgroundColor: '#800020', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', width: '100%', marginTop: '20px' },
  buttonExport: { backgroundColor: '#28a745', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginRight: '10px' },
  buttonWhatsapp: { backgroundColor: '#25D366', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  buttonContainer: { display: 'flex', justifyContent: 'center', gap: '15px', margin: '20px 0' },
  cardContainer: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' },
  card: { padding: '15px', borderRadius: '12px', textAlign: 'center', color: 'white' },
  cardTotal: { backgroundColor: '#800020' },
  cardPipe: { backgroundColor: '#2196F3' },
  cardFittings: { backgroundColor: '#4CAF50' },
  cardSanitary: { backgroundColor: '#FF9800' },
  cardLabour: { backgroundColor: '#9C27B0' },
  cardValue: { fontSize: '20px', fontWeight: 'bold', marginTop: '8px' },
  tableContainer: { overflowX: 'auto', marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
  th: { backgroundColor: '#00bcd4', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  totalRow: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' },
  infoBox: { backgroundColor: '#e8f4f8', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function PlumbingBOQPage() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();
  const { rates, loading } = useRates();
  
  const [projectName, setProjectName] = useState('Jai Sri ram');
  const [clientName, setClientName] = useState('Reddy');
  const [mobileNo, setMobileNo] = useState('7676942386');
  const [city, setCity] = useState('Bengaluru');
  
  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [setbackFront, setSetbackFront] = useState(10);
  const [floors, setFloors] = useState(3.5);
  
  const [toilets, setToilets] = useState(5);
  const [kitchens, setKitchens] = useState(1);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);
  
  const plotArea = plotLength * plotWidth;
  const footprintArea = plotArea * 0.9; // Auto 10% setback area
  const totalBUA = footprintArea * floors;

  const floorCount = Math.max(1, Math.ceil(floors));
  const floorHeightM = 3.0;
  const wetPoints = toilets + kitchens;

  const horizontalWaterPipe = (toilets * 12) + (kitchens * 10);
  const verticalRiserPipe = wetPoints * floorCount * floorHeightM;
  const totalPipeLength = horizontalWaterPipe + verticalRiserPipe;
  
  const calculateBOQ = () => {
    const items = [
      { sr: 1, code: 'PLB-01', desc: 'CPVC Pipe 15mm', uom: 'm', qty: totalPipeLength * 0.4, matRate: rates?.cpvc15 || 35, labRate: 12, amount: 0 },
      { sr: 2, code: 'PLB-02', desc: 'CPVC Pipe 20mm', uom: 'm', qty: totalPipeLength * 0.35, matRate: rates?.cpvc20 || 45, labRate: 14, amount: 0 },
      { sr: 3, code: 'PLB-03', desc: 'CPVC Pipe 25mm', uom: 'm', qty: totalPipeLength * 0.15, matRate: rates?.cpvc25 || 60, labRate: 16, amount: 0 },
      { sr: 4, code: 'PLB-04', desc: 'UPVC Waste Pipe 110mm', uom: 'm', qty: toilets * 4 * floors, matRate: rates?.wastePipe || 120, labRate: 25, amount: 0 },
      { sr: 5, code: 'PLB-05', desc: 'UPVC Waste Pipe 75mm', uom: 'm', qty: totalPipeLength * 0.1, matRate: rates?.wastePipe75 || 80, labRate: 20, amount: 0 },
      { sr: 6, code: 'PLB-06', desc: 'UPVC Vent Pipe 50mm', uom: 'm', qty: toilets * 3 * floors, matRate: rates?.ventPipe || 55, labRate: 15, amount: 0 },
      { sr: 7, code: 'PLB-07', desc: 'CPVC Elbow 15mm', uom: 'nos', qty: totalPipeLength * 0.15, matRate: rates?.elbow15 || 15, labRate: 8, amount: 0 },
      { sr: 8, code: 'PLB-08', desc: 'CPVC Elbow 20mm', uom: 'nos', qty: totalPipeLength * 0.1, matRate: rates?.elbow20 || 20, labRate: 10, amount: 0 },
      { sr: 9, code: 'PLB-09', desc: 'CPVC Tee 15mm', uom: 'nos', qty: totalPipeLength * 0.08, matRate: rates?.tee15 || 18, labRate: 8, amount: 0 },
      { sr: 10, code: 'PLB-10', desc: 'CPVC Tee 20mm', uom: 'nos', qty: totalPipeLength * 0.06, matRate: rates?.tee20 || 25, labRate: 10, amount: 0 },
      { sr: 11, code: 'PLB-11', desc: 'Gate Valve 15mm', uom: 'nos', qty: Math.ceil(toilets + kitchens), matRate: rates?.gateValve15 || 180, labRate: 30, amount: 0 },
{ sr: 12, code: 'PLB-12', desc: 'Gate Valve 20mm', uom: 'nos', qty: Math.ceil(floorCount), matRate: rates?.gateValve20 || 250, labRate: 40, amount: 0 },
{ sr: 13, code: 'PLB-13', desc: 'Stop Cock 15mm', uom: 'nos', qty: Math.ceil(kitchens), matRate: rates?.stopCock || 120, labRate: 25, amount: 0 },
{ sr: 14, code: 'PLB-14', desc: 'Bib Cock', uom: 'nos', qty: Math.ceil((toilets * 2) + kitchens), matRate: rates?.bibCock || 250, labRate: 30, amount: 0 },
{ sr: 15, code: 'PLB-15', desc: 'Pillar Tap', uom: 'nos', qty: Math.ceil(kitchens), matRate: rates?.pillarTap || 300, labRate: 30, amount: 0 },
{ sr: 16, code: 'PLB-16', desc: 'Angle Valve', uom: 'nos', qty: Math.ceil((toilets * 3) + (kitchens * 2)), matRate: rates?.angleValve || 80, labRate: 20, amount: 0 },
{ sr: 17, code: 'PLB-17', desc: 'Health Faucet', uom: 'nos', qty: Math.ceil(toilets), matRate: rates?.healthFaucet || 350, labRate: 40, amount: 0 },
{ sr: 18, code: 'PLB-18', desc: 'Western Commode (EWC)', uom: 'set', qty: Math.ceil(toilets), matRate: rates?.wc || 3500, labRate: 400, amount: 0 },
{ sr: 19, code: 'PLB-19', desc: 'Wash Basin', uom: 'set', qty: Math.ceil(toilets), matRate: rates?.washBasin || 1200, labRate: 250, amount: 0 },
{ sr: 20, code: 'PLB-20', desc: 'Kitchen Sink', uom: 'set', qty: Math.ceil(kitchens), matRate: rates?.kitchenSink || 2500, labRate: 350, amount: 0 },
{ sr: 21, code: 'PLB-21', desc: 'Floor Trap', uom: 'nos', qty: Math.ceil(toilets + kitchens), matRate: rates?.floorTrap || 150, labRate: 40, amount: 0 },
{ sr: 22, code: 'PLB-22', desc: 'Nahani Trap', uom: 'nos', qty: Math.ceil(toilets), matRate: rates?.nahaniTrap || 120, labRate: 35, amount: 0 },
{ sr: 23, code: 'PLB-23', desc: 'Grease Trap', uom: 'nos', qty: Math.ceil(kitchens), matRate: rates?.greaseTrap || 400, labRate: 80, amount: 0 },
{ sr: 24, code: 'PLB-24', desc: 'Chamber Cover', uom: 'nos', qty: Math.ceil(toilets + kitchens + floorCount), matRate: rates?.chamberCover || 250, labRate: 50, amount: 0 },
      { sr: 25, code: 'PLB-25', desc: 'UPVC Solvent Cement', uom: 'bottle', qty: totalPipeLength * 0.01, matRate: rates?.solvent || 80, labRate: 0, amount: 0 },
      { sr: 26, code: 'PLB-26', desc: 'PTFE Tape', uom: 'roll', qty: totalPipeLength * 0.005, matRate: rates?.ptfe || 15, labRate: 0, amount: 0 },
      { sr: 27, code: 'PLB-27', desc: 'Clamps & Hangers', uom: 'set', qty: totalPipeLength * 0.05, matRate: rates?.clamps || 20, labRate: 10, amount: 0 },
      { sr: 28, code: 'PLB-28', desc: 'Testing & Commissioning', uom: 'lump', qty: 1, matRate: rates?.plumbingTesting || 3000, labRate: 1000, amount: 0 }
    ];
    
    items.forEach(item => {
      item.amount = (item.qty * item.matRate) + (item.qty * item.labRate);
    });
    
    const materialTotal = items.reduce((sum, item) => sum + (item.qty * item.matRate), 0);
    const labourTotal = items.reduce((sum, item) => sum + (item.qty * item.labRate), 0);
    const grandTotal = materialTotal + labourTotal;
    const ratePerSft = grandTotal / totalBUA;
    
    return { items, materialTotal, labourTotal, grandTotal, ratePerSft, totalBUA, totalPipeLength };
  };

  const handleGenerate = () => {
    setResults(calculateBOQ());
    setGenerated(true);
  };

  const handleBack = () => {
    router.push('/boq');
  };

  const handleExportExcel = () => {
    if (!results) return;
    const data = results.items.map(item => ({
      'Sr. No.': item.sr, 'Item Code': item.code, 'Description': item.desc,
      'UOM': item.uom, 'Quantity': formatNumber(item.qty),
      'Mat. Rate': formatNumber(item.matRate), 'Lab. Rate': formatNumber(item.labRate),
      'Total (₹)': formatNumber(item.amount)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plumbing_BOQ');
    XLSX.writeFile(wb, `Plumbing_BOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🚰 PLUMBING BOQ\n\nProject: ${projectName}\nArea: ${formatNumber(totalBUA)} sft\nToilets: ${toilets}\nKitchens: ${kitchens}\nTotal Cost: ₹${formatNumber(results.grandTotal/100000)} Lakhs`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('h1', { style: styles.headerTitle }, '🚰 Plumbing BOQ Calculator'),
        React.createElement('p', { style: styles.headerSub }, 'Complete plumbing estimation')
      )
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📋 Basic Details'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Project Name'), React.createElement('input', { type: 'text', value: projectName, onChange: (e) => setProjectName(e.target.value), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Client Name'), React.createElement('input', { type: 'text', value: clientName, onChange: (e) => setClientName(e.target.value), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Mobile No.'), React.createElement('input', { type: 'text', value: mobileNo, onChange: (e) => setMobileNo(e.target.value), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'City'), React.createElement('input', { type: 'text', value: city, onChange: (e) => setCity(e.target.value), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Building Details'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Plot Length (ft)'), React.createElement('input', { type: 'number', value: plotLength, onChange: (e) => setPlotLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Plot Width (ft)'), React.createElement('input', { type: 'number', value: plotWidth, onChange: (e) => setPlotWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Setback (ft)'), React.createElement('input', { type: 'number', value: setbackFront, onChange: (e) => setSetbackFront(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Floors'), React.createElement('input', { type: 'number', value: floors, onChange: (e) => setFloors(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.row3 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Total BUA (Sft)'), React.createElement('input', { type: 'text', value: formatNumber(totalBUA), readOnly: true, style: { ...styles.input, ...styles.readOnly } })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Toilets'), React.createElement('input', { type: 'number', value: toilets, onChange: (e) => setToilets(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Kitchens'), React.createElement('input', { type: 'number', value: kitchens, onChange: (e) => setKitchens(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.infoBox },
      React.createElement('span', null, `📏 Pipe Length: ${formatNumber(totalPipeLength)} m | 🚽 Toilets: ${toilets} | 🍳 Kitchens: ${kitchens}`)
    ),
    
    React.createElement('div', { style: styles.buttonContainer },
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate Plumbing BOQ'),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement('button', { onClick: () => checkAndRun('boq_export', 'boq-plumbing', handleExportExcel), style: styles.buttonExport }, '📊 Excel'),
        React.createElement('button', { onClick: () => checkAndRun('boq_export', 'boq-plumbing', handleWhatsApp), style: styles.buttonWhatsapp }, '💬 Share')
      )
    ),
    
    generated && results && React.createElement('div', null,
      React.createElement('div', { style: styles.cardContainer },
        React.createElement('div', { style: { ...styles.card, ...styles.cardTotal } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Total Cost'), React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.grandTotal/100000)} L`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardPipe } }, React.createElement('div', null, '📏'), React.createElement('div', null, 'Pipe Length'), React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.totalPipeLength)} m`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardSanitary } }, React.createElement('div', null, '🚽'), React.createElement('div', null, 'Sanitary'), React.createElement('div', { style: styles.cardValue }, `${toilets} sets`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLabour } }, React.createElement('div', null, '👷'), React.createElement('div', null, 'Labour'), React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.labourTotal/100000)} L`))
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null,
            React.createElement('th', { style: styles.th }, 'Sr.'), React.createElement('th', { style: styles.th }, 'Code'),
            React.createElement('th', { style: styles.th }, 'Description'), React.createElement('th', { style: styles.th }, 'UOM'),
            React.createElement('th', { style: styles.th }, 'Qty'), React.createElement('th', { style: styles.th }, 'Mat. Rate'),
            React.createElement('th', { style: styles.th }, 'Lab. Rate'), React.createElement('th', { style: styles.th }, 'Total (₹)')
          )),
          React.createElement('tbody', null,
            results.items.map((item, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, item.sr), React.createElement('td', { style: styles.td }, item.code),
              React.createElement('td', { style: styles.td }, item.desc), React.createElement('td', { style: styles.td }, item.uom),
              React.createElement('td', { style: styles.td }, formatNumber(item.qty)), React.createElement('td', { style: styles.td }, formatNumber(item.matRate)),
              React.createElement('td', { style: styles.td }, formatNumber(item.labRate)), React.createElement('td', { style: styles.td }, formatNumber(item.amount))
            )),
            React.createElement('tr', { style: styles.totalRow },
              React.createElement('td', { colSpan: 7, style: { padding: '10px' } }, 'GRAND TOTAL'),
              React.createElement('td', { style: { padding: '10px' } }, `₹${formatNumber(results.grandTotal)}`)
            )
          )
        )
      )
    )
  );
}


