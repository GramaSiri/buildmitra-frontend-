import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';
import * as XLSX from 'xlsx';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#1a7f6e', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: 'white' },
  headerTitle: { margin: 0, fontSize: '20px' },
  headerSub: { margin: '5px 0 0', opacity: 0.9, fontSize: '12px' },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#1a7f6e', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' },
  row5: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' },
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
  cardCement: { backgroundColor: '#607d8b' },
  cardSteel: { backgroundColor: '#ff9800' },
  cardPEH: { backgroundColor: '#4caf50' },
  cardLabour: { backgroundColor: '#2196f3' },
  cardRate: { backgroundColor: '#9c27b0' },
  cardValue: { fontSize: '20px', fontWeight: 'bold', marginTop: '8px' },
  tableContainer: { overflowX: 'auto', marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
  th: { backgroundColor: '#1a7f6e', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  totalRow: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' },
  infoBox: { backgroundColor: '#e8f4f8', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' },
  resetButton: { backgroundColor: '#dc3545', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginLeft: '10px' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function CivilBOQPage() {
  const router = useRouter();
  const { rates, loading } = useRates();
  
  // Basic Details
  const [projectName, setProjectName] = useState('Jai Sri ram');
  const [clientName, setClientName] = useState('Reddy');
  const [mobileNo, setMobileNo] = useState('7676942386');
  const [city, setCity] = useState('Bengaluru');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Plot Details
  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [setbackFront, setSetbackFront] = useState(10);
  const [floors, setFloors] = useState(3.5);
  
  // Soil Investigation
  const [constructionType, setConstructionType] = useState('Residential');
  const [boreholes, setBoreholes] = useState(2);
  const [finishProfile, setFinishProfile] = useState('Standard');
  
  // Building Type
  const [buildingType, setBuildingType] = useState('Own use');
  const [staircaseType, setStaircaseType] = useState('Internal');
  const [terraceSetup, setTerraceSetup] = useState('Standard');
  
  // Room Configuration
  const [bedrooms, setBedrooms] = useState(2);
  const [toilets, setToilets] = useState(5);
  const [kitchens, setKitchens] = useState(1);
  const [livingRooms, setLivingRooms] = useState(1);
  const [balconies, setBalconies] = useState(2);
  const [poojaRooms, setPoojaRooms] = useState(1);
  const [studyRooms, setStudyRooms] = useState(1);
  const [gymRooms, setGymRooms] = useState(1);
  const [homeTheater, setHomeTheater] = useState(1);
  const [guestBedrooms, setGuestBedrooms] = useState(1);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);
  
  // Auto-calculated values
  const plotArea = plotLength * plotWidth;
  const setbackArea = (plotLength - setbackFront) * (plotWidth - setbackFront);
  const totalBUA = setbackArea * floors;
  const footprintArea = totalBUA / floors;
  const foundationType = floors <= 5 ? 'Isolated Footings' : 'Raft Foundation';
  
  // Room counts
  const totalBedrooms = bedrooms + guestBedrooms;
  const internalDoors = totalBedrooms + studyRooms + gymRooms + homeTheater + poojaRooms;
  const windows = totalBedrooms + livingRooms + kitchens + studyRooms + gymRooms + homeTheater + poojaRooms + balconies;
  const electricalPoints = (livingRooms * 12) + (totalBedrooms * 8) + (kitchens * 9) + (toilets * 4) + (totalBUA * 0.02);
  const plumbingPoints = (toilets * 10) + (kitchens * 6) + 5;
  
  // Foundation calculation based on floors
  const getFoundationQty = () => {
    if (floors <= 5) {
      const columns = 8;
      const footingSize = 4.8;
      const depth = 5.3;
      return {
        excavation: (columns * (footingSize * footingSize * depth)) / 35.315,
        footingMasonry: (columns * (footingSize * footingSize * 2.5)) / 35.315,
        backfilling: (columns * (footingSize * footingSize * 2.3)) / 35.315
      };
    } else {
      const raftArea = footprintArea / 10.764;
      const raftThickness = 0.5;
      return {
        excavation: raftArea * raftThickness * 1.2,
        footingMasonry: raftArea * raftThickness,
        backfilling: raftArea * raftThickness * 0.8
      };
    }
  };
  
  const foundation = getFoundationQty();

  // Calculate key material quantities
  const steelQty = totalBUA * (2.75 + floors * 0.25);
  const cementQty = (totalBUA * 0.03545) * 7.5;
  const pehQty = totalBUA * 0.5;
  const totalMaterialCost = 0;
  const totalLabourCost = 0;

  const calculateBOQ = () => {
    const finishMultiplier = finishProfile === 'Standard' ? 1 : finishProfile === 'Premium' ? 1.1 : 1.25;
    
    const items = [
      { sr: 1, code: 'Soil Test', desc: 'Soil investigation — boreholes for construction to determine Safe Bearing Capacity (SBC).', uom: 'Nos', qty: boreholes, matRate: rates?.soilTestRate || 6500, labRate: 0, amount: (rates?.soilTestRate || 6500) * boreholes },
      { sr: 2, code: 'Earth Excavation', desc: `Excavation in ordinary soil. ${foundationType}`, uom: 'Cum', qty: foundation.excavation, matRate: rates?.excavation || 1000, labRate: 250, amount: (rates?.excavation || 1000) * foundation.excavation + 250 * foundation.excavation },
      { sr: 3, code: 'PCC', desc: 'Providing and laying PCC grade M-10 below foundations — 4" leveling bed.', uom: 'Cum', qty: 1.69, matRate: rates?.pcc || 3200, labRate: 1800, amount: (rates?.pcc || 3200) * 1.69 + 1800 * 1.69 },
      { sr: 4, code: 'Foundation Masonry', desc: 'Size stone masonry in cement mortar using dressed stones.', uom: 'Cum', qty: foundation.footingMasonry, matRate: rates?.footingMasonry || 1500, labRate: 750, amount: (rates?.footingMasonry || 1500) * foundation.footingMasonry + 750 * foundation.footingMasonry },
      { sr: 5, code: 'Backfilling', desc: 'Backfilling in foundation/plinth with excavated soil.', uom: 'Cum', qty: foundation.backfilling, matRate: rates?.backfilling || 1000, labRate: 200, amount: (rates?.backfilling || 1000) * foundation.backfilling + 200 * foundation.backfilling },
      { sr: 6, code: 'Plinth Protection', desc: '2\' from natural ground level. Plinth protection (PCC) at all setback area.', uom: 'Cum', qty: 5.79, matRate: rates?.plinthProtection || 5500, labRate: 1500, amount: (rates?.plinthProtection || 5500) * 5.79 + 1500 * 5.79 },
      { sr: 7, code: 'Anti-Termite', desc: 'Anti-termite chemical treatment using approved chemical.', uom: 'Ltr', qty: (footprintArea / 10.764) / 5, matRate: rates?.antiTermite || 200, labRate: 75, amount: (rates?.antiTermite || 200) * ((footprintArea / 10.764) / 5) + 75 * ((footprintArea / 10.764) / 5) },
      { sr: 8, code: 'Shuttering', desc: 'Centering and shuttering for RCC works.', uom: 'Sft', qty: totalBUA * (2.35 + floors * 0.05), matRate: rates?.shuttering || 10, labRate: 55, amount: (rates?.shuttering || 10) * (totalBUA * (2.35 + floors * 0.05)) + 55 * (totalBUA * (2.35 + floors * 0.05)) },
      { sr: 9, code: 'Steel', desc: 'Fe-500 grade TMT bars. Dynamic formula scales for seismic/wind loads.', uom: 'Kgs', qty: totalBUA * (2.75 + floors * 0.25), matRate: rates?.steel || 65, labRate: 15, amount: (rates?.steel || 65) * (totalBUA * (2.75 + floors * 0.25)) + 15 * (totalBUA * (2.75 + floors * 0.25)) },
      { sr: 10, code: 'RCC Works', desc: 'RCC grade M-20 for footings, columns, beams, slabs — machine-mixed, vibrated, cured.', uom: 'Cum', qty: totalBUA * 0.03545, matRate: rates?.rcc || 5500, labRate: 1500, amount: (rates?.rcc || 5500) * (totalBUA * 0.03545) + 1500 * (totalBUA * 0.03545) },
      { sr: 11, code: 'Lintels', desc: 'RCC lintels M-20 over door and window openings.', uom: 'Cum', qty: totalBUA * 0.003, matRate: rates?.lintels || 6500, labRate: 2000, amount: (rates?.lintels || 6500) * (totalBUA * 0.003) + 2000 * (totalBUA * 0.003) },
      { sr: 12, code: 'Staircase', desc: 'RCC staircase M-20 with 300mm tread / 150mm riser.', uom: 'Cum', qty: totalBUA * 0.0005, matRate: rates?.staircase || 6500, labRate: 2000, amount: (rates?.staircase || 6500) * (totalBUA * 0.0005) + 2000 * (totalBUA * 0.0005) },
      { sr: 13, code: 'Sunshades', desc: 'Window chajja projections 15"–18" deep.', uom: 'Cum', qty: totalBUA * 0.0008, matRate: rates?.sunshades || 6500, labRate: 4000, amount: (rates?.sunshades || 6500) * (totalBUA * 0.0008) + 4000 * (totalBUA * 0.0008) },
      { sr: 14, code: 'Clay Bricks', desc: 'First-class burnt clay bricks in CM 1:6.', uom: 'Sqmtr', qty: totalBUA * 0.16, matRate: rates?.clayBricks || 0, labRate: 0, amount: 0 },
      { sr: 15, code: 'Block Masonry (6")', desc: 'Solid concrete blocks 400×200×150 mm in CM mortar.', uom: 'Nos', qty: totalBUA * 1.115, matRate: rates?.blockMasonry || 40, labRate: 45, amount: (rates?.blockMasonry || 40) * (totalBUA * 1.115) + 45 * (totalBUA * 1.115) },
      { sr: 16, code: 'Block Masonry (4")', desc: 'Solid concrete blocks 400×200×100 mm in CM mortar.', uom: 'Nos', qty: totalBUA * 0.3345, matRate: rates?.blockMasonry4 || 40, labRate: 40, amount: (rates?.blockMasonry4 || 40) * (totalBUA * 0.3345) + 40 * (totalBUA * 0.3345) },
      { sr: 17, code: 'Main Door', desc: 'Burma Teak / Mysore Rosewood main door with PU polish.', uom: 'Nos', qty: 1, matRate: rates?.mainDoor || 35000, labRate: 3500, amount: 38500 },
      { sr: 18, code: 'Pooja Room Door', desc: 'Traditional carved CNC door with LED provision.', uom: 'Nos', qty: 1, matRate: rates?.poojaDoor || 25000, labRate: 5000, amount: 30000 },
      { sr: 19, code: 'Internal Doors', desc: '30mm flush shutters, Mortise lock, SS hardware.', uom: 'Nos', qty: internalDoors, matRate: rates?.internalDoor || 18500, labRate: 2500, amount: (rates?.internalDoor || 18500) * internalDoors + 2500 * internalDoors },
      { sr: 20, code: 'Windows', desc: 'UPVC / Aluminium 3-track sliding windows with mosquito mesh.', uom: 'Nos', qty: windows, matRate: rates?.window || 8500, labRate: 2000, amount: (rates?.window || 8500) * windows + 2000 * windows },
      { sr: 21, code: 'Toilet Doors', desc: '30mm WPC shutters for toilets with louvered ventilators.', uom: 'Nos', qty: toilets, matRate: rates?.toiletDoor || 8750, labRate: 1250, amount: (rates?.toiletDoor || 8750) * toilets + 1250 * toilets },
      { sr: 22, code: 'Plastering', desc: 'CM 1:4 plaster – 12mm internal / 15mm external, cured.', uom: 'Sqmtr', qty: totalBUA * 0.27, matRate: rates?.plastering || 200, labRate: 250, amount: (rates?.plastering || 200) * (totalBUA * 0.27) + 250 * (totalBUA * 0.27) },
      { sr: 23, code: 'Flooring', desc: 'Vitrified / Granite / Marble tiles with skirting.', uom: 'Sft', qty: totalBUA * 1.1, matRate: rates?.flooring || 110, labRate: 25, amount: (rates?.flooring || 110) * (totalBUA * 1.1) + 25 * (totalBUA * 1.1) },
      { sr: 24, code: 'Wall Dadoing', desc: 'Ceramic / vitrified wall dado in toilets up to 7\' height.', uom: 'Sft', qty: toilets * 56, matRate: rates?.wallDadoing || 80, labRate: 25, amount: (rates?.wallDadoing || 80) * (toilets * 56) + 25 * (toilets * 56) },
      { sr: 25, code: 'Kitchen Platform', desc: 'RCC platform with polished granite / vitrified top.', uom: 'Rmt', qty: kitchens * 3.6, matRate: rates?.kitchenPlatform || 15000, labRate: 2500, amount: (rates?.kitchenPlatform || 15000) * (kitchens * 3.6) + 2500 * (kitchens * 3.6) },
      { sr: 26, code: 'Electrical', desc: 'Complete electrical installation – FRLS wiring, modular switches, DB, MCBs.', uom: 'Points', qty: Math.ceil(electricalPoints), matRate: rates?.electrical || 750, labRate: 450, amount: (rates?.electrical || 750) * Math.ceil(electricalPoints) + 450 * Math.ceil(electricalPoints) },
      { sr: 27, code: 'Plumbing', desc: 'CPVC/UPVC plumbing with Cera/Hindware sanitary ware.', uom: 'Points', qty: plumbingPoints, matRate: rates?.plumbing || 10000, labRate: 500, amount: (rates?.plumbing || 10000) * plumbingPoints + 500 * plumbingPoints },
      { sr: 28, code: 'Parking Area', desc: 'RCC flooring with anti-skid tiles for parking.', uom: 'Sft', qty: footprintArea * 0.99, matRate: rates?.parking || 75, labRate: 25, amount: (rates?.parking || 75) * (footprintArea * 0.99) + 25 * (footprintArea * 0.99) },
      { sr: 29, code: 'UG Tank', desc: 'RCC underground water tank.', uom: 'Cft', qty: (toilets * 1000 + kitchens * 500) / 28.31, matRate: rates?.ugTank || 400, labRate: 125, amount: (rates?.ugTank || 400) * ((toilets * 1000 + kitchens * 500) / 28.31) + 125 * ((toilets * 1000 + kitchens * 500) / 28.31) },
      { sr: 30, code: 'Terrace', desc: `RCC terrace with MS framework and clay tile roofing. Setup: ${terraceSetup}.`, uom: 'Sft', qty: Math.max(250, footprintArea * 0.15), matRate: rates?.terrace || 650, labRate: 220, amount: (rates?.terrace || 650) * Math.max(250, footprintArea * 0.15) + 220 * Math.max(250, footprintArea * 0.15) },
      { sr: 31, code: 'Railings', desc: 'MS/SS decorative gates and railings.', uom: 'Kgs', qty: totalBUA * 0.1737, matRate: rates?.railings || 105, labRate: 45, amount: (rates?.railings || 105) * (totalBUA * 0.1737) + 45 * (totalBUA * 0.1737) },
      { sr: 32, code: 'Compound Wall', desc: 'RCC columns with brick infill, plaster finish.', uom: 'Sft', qty: (2 * (plotLength + plotWidth) - 12) * 6, matRate: rates?.compoundWall || 50, labRate: 150, amount: (rates?.compoundWall || 50) * ((2 * (plotLength + plotWidth) - 12) * 6) + 150 * ((2 * (plotLength + plotWidth) - 12) * 6) },
      { sr: 33, code: 'Painting', desc: 'Wall putty, primer, and two coats emulsion paint.', uom: 'Sft', qty: totalBUA * 3.5, matRate: rates?.painting || 6, labRate: 12, amount: (rates?.painting || 6) * (totalBUA * 3.5) + 12 * (totalBUA * 3.5) }
    ];
    
    const materialTotal = items.reduce((sum, item) => sum + (item.qty * item.matRate), 0);
    const labourTotal = items.reduce((sum, item) => sum + (item.qty * item.labRate), 0);
    const grandTotal = materialTotal + labourTotal;
    const ratePerSft = grandTotal / totalBUA;
    
    // Calculate summary values
    const cementQuantity = (totalBUA * 0.03545) * 7.5;
    const steelQuantity = totalBUA * (2.75 + floors * 0.25);
    const pehQuantity = totalBUA * 0.5;
    
    return { 
      items, 
      materialTotal, 
      labourTotal, 
      grandTotal, 
      ratePerSft, 
      totalBUA, 
      foundationType,
      cementQuantity,
      steelQuantity,
      pehQuantity
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
    setConstructionType('Residential');
    setBoreholes(2);
    setFinishProfile('Standard');
    setBuildingType('Own use');
    setStaircaseType('Internal');
    setTerraceSetup('Standard');
    setBedrooms(2);
    setToilets(5);
    setKitchens(1);
    setLivingRooms(1);
    setBalconies(2);
    setPoojaRooms(1);
    setStudyRooms(1);
    setGymRooms(1);
    setHomeTheater(1);
    setGuestBedrooms(1);
    setResults(null);
    setGenerated(false);
  };

  const handleBack = () => {
    router.push('/calculators');
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
    XLSX.utils.book_append_sheet(wb, ws, 'Civil_BOQ');
    XLSX.writeFile(wb, `Civil_BOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🏗️ CIVIL BOQ\n\nProject: ${projectName}\nClient: ${clientName}\nArea: ${formatNumber(totalBUA)} sft\nTotal Cost: ₹${formatNumber(results.grandTotal/100000)} Lakhs\nRate: ₹${formatNumber(results.ratePerSft)}/sft`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('h1', { style: styles.headerTitle }, '🏗️ Civil BOQ Calculator'),
      React.createElement('p', { style: styles.headerSub }, 'Dynamic structural engine — Auto-switches between Isolated Footings (≤5F) / Raft Foundation (>5F)')
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📋 Basic Details'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Project Name'), React.createElement('input', { type: 'text', value: projectName, onChange: (e) => setProjectName(e.target.value), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Client Name'), React.createElement('input', { type: 'text', value: clientName, onChange: (e) => setClientName(e.target.value), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Mobile No.'), React.createElement('input', { type: 'text', value: mobileNo, onChange: (e) => setMobileNo(e.target.value), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'City'), React.createElement('input', { type: 'text', value: city, onChange: (e) => setCity(e.target.value), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Plot Details (Auto-Calculated)'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Plot Length (ft)'), React.createElement('input', { type: 'number', value: plotLength, onChange: (e) => setPlotLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Plot Width (ft)'), React.createElement('input', { type: 'number', value: plotWidth, onChange: (e) => setPlotWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Plot Area (Sft)'), React.createElement('input', { type: 'text', value: formatNumber(plotArea), readOnly: true, style: { ...styles.input, ...styles.readOnly } })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Setback Front (ft)'), React.createElement('input', { type: 'number', value: setbackFront, onChange: (e) => setSetbackFront(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🏗️ Building Configuration'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Floors'), React.createElement('input', { type: 'number', value: floors, onChange: (e) => setFloors(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Foundation Type'), React.createElement('input', { type: 'text', value: foundationType, readOnly: true, style: { ...styles.input, ...styles.readOnly, color: foundationType === 'Raft Foundation' ? '#f44336' : '#4CAF50', fontWeight: 'bold' } })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Total BUA (Sft)'), React.createElement('input', { type: 'text', value: formatNumber(totalBUA), readOnly: true, style: { ...styles.input, ...styles.readOnly } })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Footprint Area (Sft)'), React.createElement('input', { type: 'text', value: formatNumber(footprintArea), readOnly: true, style: { ...styles.input, ...styles.readOnly } }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🏠 Soil & Finishing'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Construction Type'), React.createElement('select', { value: constructionType, onChange: (e) => setConstructionType(e.target.value), style: styles.select },
        React.createElement('option', { value: 'Residential' }, 'Residential'),
        React.createElement('option', { value: 'Commercial' }, 'Commercial'),
        React.createElement('option', { value: 'Industrial' }, 'Industrial'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'No. of Boreholes'), React.createElement('input', { type: 'number', value: boreholes, onChange: (e) => setBoreholes(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Finish Profile'), React.createElement('select', { value: finishProfile, onChange: (e) => setFinishProfile(e.target.value), style: styles.select },
        React.createElement('option', { value: 'Standard' }, 'Standard'),
        React.createElement('option', { value: 'Premium' }, 'Premium (+10%)'),
        React.createElement('option', { value: 'Ultra Premium' }, 'Ultra Premium (+25%)'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Building Type'), React.createElement('select', { value: buildingType, onChange: (e) => setBuildingType(e.target.value), style: styles.select },
        React.createElement('option', { value: 'Own use' }, 'Own use'),
        React.createElement('option', { value: 'Rental' }, 'Rental'),
        React.createElement('option', { value: 'Mixed' }, 'Mixed')))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🚪 Room Configuration'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Bedrooms'), React.createElement('input', { type: 'number', value: bedrooms, onChange: (e) => setBedrooms(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Toilets'), React.createElement('input', { type: 'number', value: toilets, onChange: (e) => setToilets(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Kitchens'), React.createElement('input', { type: 'number', value: kitchens, onChange: (e) => setKitchens(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Living Rooms'), React.createElement('input', { type: 'number', value: livingRooms, onChange: (e) => setLivingRooms(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Balconies'), React.createElement('input', { type: 'number', value: balconies, onChange: (e) => setBalconies(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Pooja Rooms'), React.createElement('input', { type: 'number', value: poojaRooms, onChange: (e) => setPoojaRooms(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Study Rooms'), React.createElement('input', { type: 'number', value: studyRooms, onChange: (e) => setStudyRooms(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Gym Rooms'), React.createElement('input', { type: 'number', value: gymRooms, onChange: (e) => setGymRooms(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Home Theater'), React.createElement('input', { type: 'number', value: homeTheater, onChange: (e) => setHomeTheater(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Guest Bedrooms'), React.createElement('input', { type: 'number', value: guestBedrooms, onChange: (e) => setGuestBedrooms(parseFloat(e.target.value)), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.infoBox },
      React.createElement('span', null, `🚪 Internal Doors: ${internalDoors} | 🪟 Windows: ${windows} | ⚡ Electrical Points: ${Math.ceil(electricalPoints)} | 🚰 Plumbing Points: ${plumbingPoints}`)
    ),
    
    React.createElement('div', { style: styles.buttonContainer },
      React.createElement('button', { onClick: handleReset, style: styles.buttonExport }, '🔄 Reset'),
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate Civil BOQ')
    ),
    
    generated && results && React.createElement('div', null,
      // Summary Cards at the top
      React.createElement('div', { style: styles.cardContainer },
        React.createElement('div', { style: { ...styles.card, ...styles.cardCement } },
          React.createElement('div', null, '🪣'),
          React.createElement('div', null, 'Cement'),
          React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.cementQuantity)} bags`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardSteel } },
          React.createElement('div', null, '⚙️'),
          React.createElement('div', null, 'Steel'),
          React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.steelQuantity)} kg`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardPEH } },
          React.createElement('div', null, '🏗️'),
          React.createElement('div', null, 'PEH (PCC)'),
          React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.pehQuantity)} Cft`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLabour } },
          React.createElement('div', null, '👷'),
          React.createElement('div', null, 'Labour Cost'),
          React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.labourTotal/100000)} L`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardRate } },
          React.createElement('div', null, '📐'),
          React.createElement('div', null, 'Rate/sft'),
          React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.ratePerSft)}`))
      ),
      
      React.createElement('div', { style: styles.buttonContainer },
        React.createElement('button', { onClick: handleExportExcel, style: styles.buttonExport }, '📊 Export Excel'),
        React.createElement('button', { onClick: handleWhatsApp, style: styles.buttonWhatsapp }, '💬 WhatsApp Share')
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null,
            React.createElement('th', { style: styles.th }, 'Sr.'),
            React.createElement('th', { style: styles.th }, 'Item Code'),
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
