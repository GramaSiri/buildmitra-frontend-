import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#f4b400', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: 'white' },
  headerTitle: { margin: 0, fontSize: '20px' },
  headerSub: { margin: '5px 0 0', opacity: 0.9, fontSize: '12px' },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#f4b400', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
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
  cardPoints: { backgroundColor: '#2196F3' },
  cardWire: { backgroundColor: '#4CAF50' },
  cardLight: { backgroundColor: '#FF9800' },
  cardLabour: { backgroundColor: '#9C27B0' },
  cardValue: { fontSize: '20px', fontWeight: 'bold', marginTop: '8px' },
  tableContainer: { overflowX: 'auto', marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
  th: { backgroundColor: '#f4b400', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  totalRow: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' },
  infoBox: { backgroundColor: '#e8f4f8', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function ElectricalBOQPage() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();
  const { rates, loading } = useRates();
  
  // Basic Details
  const [projectName, setProjectName] = useState('Jai Sri ram');
  const [clientName, setClientName] = useState('Reddy');
  const [mobileNo, setMobileNo] = useState('7676942386');
  const [city, setCity] = useState('Bengaluru');
  
  // Building Details
  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [setbackFront, setSetbackFront] = useState(10);
  const [floors, setFloors] = useState(3.5);
  
  // Room Configuration (for point calculation)
  const [bedrooms, setBedrooms] = useState(2);
  const [toilets, setToilets] = useState(5);
  const [kitchens, setKitchens] = useState(1);
  const [livingRooms, setLivingRooms] = useState(1);
  const [studyRooms, setStudyRooms] = useState(1);
  const [guestBedrooms, setGuestBedrooms] = useState(1);
  const [poojaRooms, setPoojaRooms] = useState(1);
  
  // Electrical Specifications
  const [wiringType, setWiringType] = useState('Copper');
  const [acProvision, setAcProvision] = useState(4);
  const [waterHeaterProvision, setWaterHeaterProvision] = useState(2);
  const [exhaustFanProvision, setExhaustFanProvision] = useState(5);
  const [motorProvision, setMotorProvision] = useState(1);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);
  
  // Auto-calculated values
  const setbackArea = (plotLength - setbackFront) * (plotWidth - setbackFront);
  const totalBUA = setbackArea * floors;
  const footprintArea = totalBUA / floors;
  
  const totalBedrooms = bedrooms + guestBedrooms;
  
  // Point Calculations
  const lightingPoints = totalBUA * 0.08;
  const fanPoints = totalBedrooms + livingRooms + studyRooms + poojaRooms;
  const powerPoints = (totalBedrooms * 2) + (kitchens * 4) + (livingRooms * 3);
  const acPoints = acProvision;
  const waterHeaterPoints = waterHeaterProvision;
  const exhaustFanPoints = exhaustFanProvision;
  const motorPoints = motorProvision;
  
  const totalPoints = Math.ceil(lightingPoints + fanPoints + powerPoints + acPoints + waterHeaterPoints + exhaustFanPoints + motorPoints);
  
  // Wire quantities (in meters)
  const wirePerPoint = wiringType === 'Copper' ? 12 : 10;
  const totalWireLength = totalPoints * wirePerPoint * floors;
  const wire1_5mm = totalWireLength * 0.6;
  const wire2_5mm = totalWireLength * 0.3;
  const wire4mm = totalWireLength * 0.1;
  
  const calculateBOQ = () => {
    const items = [
      { sr: 1, code: 'ELEC-01', desc: 'PVC Conduit Pipe (20mm ISI marked)', uom: 'm', qty: totalWireLength * 0.8, matRate: rates?.conduitPipe || 25, labRate: 8, amount: 0 },
      { sr: 2, code: 'ELEC-02', desc: 'PVC Conduit Pipe (25mm ISI marked)', uom: 'm', qty: totalWireLength * 0.2, matRate: rates?.conduitPipe25 || 35, labRate: 10, amount: 0 },
      { sr: 3, code: 'ELEC-03', desc: '1.5 sqmm Copper FRLS Wire (Lighting)', uom: 'm', qty: wire1_5mm, matRate: rates?.wire1_5 || 12, labRate: 3, amount: 0 },
      { sr: 4, code: 'ELEC-04', desc: '2.5 sqmm Copper FRLS Wire (Power)', uom: 'm', qty: wire2_5mm, matRate: rates?.wire2_5 || 18, labRate: 4, amount: 0 },
      { sr: 5, code: 'ELEC-05', desc: '4 sqmm Copper FRLS Wire (AC/Geyser)', uom: 'm', qty: wire4mm, matRate: rates?.wire4 || 28, labRate: 5, amount: 0 },
      { sr: 6, code: 'ELEC-06', desc: '6 sqmm Copper FRLS Wire (Main)', uom: 'm', qty: totalBUA * 0.5, matRate: rates?.wire6 || 42, labRate: 6, amount: 0 },
      { sr: 7, code: 'ELEC-07', desc: 'Modular Switches (Anchor/Northwest)', uom: 'nos', qty: totalPoints * 1.2, matRate: rates?.switch || 85, labRate: 15, amount: 0 },
      { sr: 8, code: 'ELEC-08', desc: 'Modular Switch Plates', uom: 'nos', qty: totalPoints * 0.4, matRate: rates?.plate || 45, labRate: 10, amount: 0 },
      { sr: 9, code: 'ELEC-09', desc: 'LED Bulb (9W B22)', uom: 'nos', qty: lightingPoints, matRate: rates?.ledBulb || 60, labRate: 10, amount: 0 },
      { sr: 10, code: 'ELEC-10', desc: 'LED Batten (20W)', uom: 'nos', qty: kitchens + studyRooms + poojaRooms, matRate: rates?.ledBatten || 180, labRate: 20, amount: 0 },
      { sr: 11, code: 'ELEC-11', desc: 'LED Panel Light (12x12)', uom: 'nos', qty: livingRooms, matRate: rates?.panelLight || 350, labRate: 30, amount: 0 },
      { sr: 12, code: 'ELEC-12', desc: 'Ceiling Fan (Crompton/USHA)', uom: 'nos', qty: fanPoints, matRate: rates?.fan || 1800, labRate: 150, amount: 0 },
      { sr: 13, code: 'ELEC-13', desc: 'Exhaust Fan (6")', uom: 'nos', qty: exhaustFanPoints, matRate: rates?.exhaustFan || 1200, labRate: 100, amount: 0 },
      { sr: 14, code: 'ELEC-14', desc: 'Water Heater (25L)', uom: 'nos', qty: waterHeaterPoints, matRate: rates?.waterHeater || 4500, labRate: 300, amount: 0 },
      { sr: 15, code: 'ELEC-15', desc: 'AC Unit (1.5 Ton)', uom: 'nos', qty: acPoints, matRate: rates?.acUnit || 35000, labRate: 1500, amount: 0 },
      { sr: 16, code: 'ELEC-16', desc: 'Distribution Board (8 Way)', uom: 'nos', qty: floors, matRate: rates?.db || 1200, labRate: 200, amount: 0 },
      { sr: 17, code: 'ELEC-17', desc: 'Distribution Board (12 Way)', uom: 'nos', qty: 1, matRate: rates?.dbMain || 2500, labRate: 300, amount: 0 },
      { sr: 18, code: 'ELEC-18', desc: 'MCB (SP 6A/10A)', uom: 'nos', qty: totalPoints * 0.5, matRate: rates?.mcb || 180, labRate: 30, amount: 0 },
      { sr: 19, code: 'ELEC-19', desc: 'MCB (SP 16A)', uom: 'nos', qty: acPoints + waterHeaterPoints + motorPoints, matRate: rates?.mcb16 || 220, labRate: 30, amount: 0 },
      { sr: 20, code: 'ELEC-20', desc: 'MCB (DP 32A)', uom: 'nos', qty: 1, matRate: rates?.mcbDp || 350, labRate: 50, amount: 0 },
      { sr: 21, code: 'ELEC-21', desc: 'MCB (DP 63A) Main', uom: 'nos', qty: 1, matRate: rates?.mcbMain || 650, labRate: 75, amount: 0 },
      { sr: 22, code: 'ELEC-22', desc: 'Earthing (Plate Type)', uom: 'set', qty: 2, matRate: rates?.earthing || 2500, labRate: 500, amount: 0 },
      { sr: 23, code: 'ELEC-23', desc: 'Lightning Arrester', uom: 'set', qty: 1, matRate: rates?.lightningArrester || 3500, labRate: 600, amount: 0 },
      { sr: 24, code: 'ELEC-24', desc: 'UPS/Inverter (3kVA)', uom: 'set', qty: 1, matRate: rates?.inverter || 12000, labRate: 800, amount: 0 },
      { sr: 25, code: 'ELEC-25', desc: 'Battery (150Ah)', uom: 'nos', qty: 2, matRate: rates?.battery || 8000, labRate: 400, amount: 0 },
      { sr: 26, code: 'ELEC-26', desc: 'Bus Bar / Wiring Accessories', uom: 'lump', qty: 1, matRate: rates?.accessories || 5000, labRate: 500, amount: 0 },
      { sr: 27, code: 'ELEC-27', desc: 'Electrical Testing & Commissioning', uom: 'lump', qty: 1, matRate: rates?.testing || 3000, labRate: 1000, amount: 0 }
    ];
    
    // Calculate amounts
    items.forEach(item => {
      item.amount = (item.qty * item.matRate) + (item.qty * item.labRate);
    });
    
    const materialTotal = items.reduce((sum, item) => sum + (item.qty * item.matRate), 0);
    const labourTotal = items.reduce((sum, item) => sum + (item.qty * item.labRate), 0);
    const grandTotal = materialTotal + labourTotal;
    const ratePerSft = grandTotal / totalBUA;
    
    return { 
      items, 
      materialTotal, 
      labourTotal, 
      grandTotal, 
      ratePerSft, 
      totalBUA,
      totalPoints,
      totalWireLength
    };
  };

  const handleGenerate = () => {
    setResults(calculateBOQ());
    setGenerated(true);
  };

  const handleReset = () => {
    setProjectName('Jai Sri ram');
    setClientName('Reddy');
    setMobileNo('7676942386');
    setCity('Bengaluru');
    setPlotLength(30);
    setPlotWidth(40);
    setSetbackFront(10);
    setFloors(3.5);
    setBedrooms(2);
    setToilets(5);
    setKitchens(1);
    setLivingRooms(1);
    setStudyRooms(1);
    setGuestBedrooms(1);
    setPoojaRooms(1);
    setWiringType('Copper');
    setAcProvision(4);
    setWaterHeaterProvision(2);
    setExhaustFanProvision(5);
    setMotorProvision(1);
    setResults(null);
    setGenerated(false);
  };

  const handleBack = () => {
    router.push('/boq');
  };

  const handleExportExcel = () => {
    if (!results) return;
    const data = results.items.map(item => ({
      'Sr. No.': item.sr,
      'Item Code': item.code,
      'Description': item.desc,
      'UOM': item.uom,
      'Quantity': formatNumber(item.qty),
      'Mat. Rate': formatNumber(item.matRate),
      'Lab. Rate': formatNumber(item.labRate),
      'Total (₹)': formatNumber(item.amount)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Electrical_BOQ');
    XLSX.writeFile(wb, `Electrical_BOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `⚡ ELECTRICAL BOQ\n\nProject: ${projectName}\nArea: ${formatNumber(totalBUA)} sft\nTotal Points: ${results.totalPoints}\nTotal Cost: ₹${formatNumber(results.grandTotal/100000)} Lakhs\nRate: ₹${formatNumber(results.ratePerSft)}/sft`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('h1', { style: styles.headerTitle }, '⚡ Electrical BOQ Calculator'),
      React.createElement('p', { style: styles.headerSub }, 'Complete electrical estimation with point-wise calculation')
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
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Setback Front (ft)'), React.createElement('input', { type: 'number', value: setbackFront, onChange: (e) => setSetbackFront(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Floors'), React.createElement('input', { type: 'number', value: floors, onChange: (e) => setFloors(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.row3 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Total BUA (Sft)'), React.createElement('input', { type: 'text', value: formatNumber(totalBUA), readOnly: true, style: { ...styles.input, ...styles.readOnly } })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Wiring Type'), React.createElement('select', { value: wiringType, onChange: (e) => setWiringType(e.target.value), style: styles.select },
        React.createElement('option', { value: 'Copper' }, 'Copper Wiring'),
        React.createElement('option', { value: 'Aluminium' }, 'Aluminium Wiring'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Total Points (Calc)'), React.createElement('input', { type: 'text', value: totalPoints, readOnly: true, style: { ...styles.input, ...styles.readOnly } }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🏠 Room Configuration'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bedrooms'), React.createElement('input', { type: 'number', value: bedrooms, onChange: (e) => setBedrooms(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Guest Bedrooms'), React.createElement('input', { type: 'number', value: guestBedrooms, onChange: (e) => setGuestBedrooms(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Living Rooms'), React.createElement('input', { type: 'number', value: livingRooms, onChange: (e) => setLivingRooms(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Kitchens'), React.createElement('input', { type: 'number', value: kitchens, onChange: (e) => setKitchens(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Toilets'), React.createElement('input', { type: 'number', value: toilets, onChange: (e) => setToilets(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Study Rooms'), React.createElement('input', { type: 'number', value: studyRooms, onChange: (e) => setStudyRooms(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Pooja Rooms'), React.createElement('input', { type: 'number', value: poojaRooms, onChange: (e) => setPoojaRooms(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '⚡ Electrical Provisions'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'AC Units'), React.createElement('input', { type: 'number', value: acProvision, onChange: (e) => setAcProvision(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Water Heaters'), React.createElement('input', { type: 'number', value: waterHeaterProvision, onChange: (e) => setWaterHeaterProvision(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Exhaust Fans'), React.createElement('input', { type: 'number', value: exhaustFanProvision, onChange: (e) => setExhaustFanProvision(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Water Motors'), React.createElement('input', { type: 'number', value: motorProvision, onChange: (e) => setMotorProvision(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.infoBox },
      React.createElement('span', null, `💡 Lighting Points: ${Math.ceil(lightingPoints)} | 🌀 Fan Points: ${fanPoints} | 🔌 Power Points: ${powerPoints} | ❄️ AC: ${acPoints} | 🔥 Geyser: ${waterHeaterPoints} | 💨 Exhaust: ${exhaustFanPoints}`)
    ),
    
    React.createElement('div', { style: styles.buttonContainer },
      React.createElement('button', { onClick: handleReset, style: styles.buttonExport }, '🔄 Reset'),
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate Electrical BOQ')
    ),
    
    generated && results && React.createElement('div', null,
      React.createElement('div', { style: styles.cardContainer },
        React.createElement('div', { style: { ...styles.card, ...styles.cardTotal } },
          React.createElement('div', null, '💰'),
          React.createElement('div', null, 'Total Cost'),
          React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.grandTotal/100000)} L`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardPoints } },
          React.createElement('div', null, '⚡'),
          React.createElement('div', null, 'Total Points'),
          React.createElement('div', { style: styles.cardValue }, results.totalPoints)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardWire } },
          React.createElement('div', null, '🔌'),
          React.createElement('div', null, 'Wire Length'),
          React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.totalWireLength)} m`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLight } },
          React.createElement('div', null, '📐'),
          React.createElement('div', null, 'Rate/sft'),
          React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.ratePerSft)}`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLabour } },
          React.createElement('div', null, '👷'),
          React.createElement('div', null, 'Labour'),
          React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.labourTotal/100000)} L`))
      ),
      
      React.createElement('div', { style: styles.buttonContainer },
        React.createElement('button', { onClick: () => checkAndRun('boq_export', 'boq-electrical', handleExportExcel), style: styles.buttonExport }, '📊 Export Excel'),
        React.createElement('button', { onClick: () => checkAndRun('boq_export', 'boq-electrical', handleWhatsApp), style: styles.buttonWhatsapp }, '💬 WhatsApp Share')
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null,
            React.createElement('th', { style: styles.th }, 'Sr.'),
            React.createElement('th', { style: styles.th }, 'Code'),
            React.createElement('th', { style: styles.th }, 'Description'),
            React.createElement('th', { style: styles.th }, 'UOM'),
            React.createElement('th', { style: styles.th }, 'Qty'),
            React.createElement('th', { style: styles.th }, 'Mat. Rate'),
            React.createElement('th', { style: styles.th }, 'Lab. Rate'),
            React.createElement('th', { style: styles.th }, 'Total (₹)')
          )),
          React.createElement('tbody', null,
            results.items.map((item, idx) => React.createElement('tr', { key: idx, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, item.sr),
              React.createElement('td', { style: styles.td }, item.code),
              React.createElement('td', { style: styles.td }, item.desc),
              React.createElement('td', { style: styles.td }, item.uom),
              React.createElement('td', { style: styles.td }, formatNumber(item.qty)),
              React.createElement('td', { style: styles.td }, formatNumber(item.matRate)),
              React.createElement('td', { style: styles.td }, formatNumber(item.labRate)),
              React.createElement('td', { style: styles.td }, formatNumber(item.amount))
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


