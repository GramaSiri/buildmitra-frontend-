import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#8d6e63', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px' },
  headerTitle: { margin: 0, fontSize: '20px', flex: 1 },
  headerSub: { margin: '5px 0 0', opacity: 0.9, fontSize: '12px' },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#8d6e63', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' },
  row4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' },
  inputGroup: { marginBottom: '6px' },
  label: { display: 'block', marginBottom: '3px', fontWeight: '600', fontSize: '10px', color: '#555' },
  input: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box', backgroundColor: '#fff' },
  select: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', backgroundColor: '#fff' },
  buttonSmall: { backgroundColor: '#2196F3', color: 'white', padding: '4px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', marginTop: '4px' },
  buttonGenerate: { backgroundColor: '#800020', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', width: '100%', marginTop: '20px' },
  buttonExport: { backgroundColor: '#28a745', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginRight: '10px' },
  buttonWhatsapp: { backgroundColor: '#25D366', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  buttonContainer: { display: 'flex', justifyContent: 'center', gap: '15px', margin: '20px 0' },
  cardContainer: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' },
  card: { padding: '15px', borderRadius: '12px', textAlign: 'center', color: 'white' },
  cardTotal: { backgroundColor: '#800020' },
  cardWood: { backgroundColor: '#8d6e63' },
  cardLaminate: { backgroundColor: '#4CAF50' },
  cardHardware: { backgroundColor: '#FF9800' },
  cardLabour: { backgroundColor: '#2196F3' },
  cardValue: { fontSize: '20px', fontWeight: 'bold', marginTop: '8px' },
  tableContainer: { overflowX: 'auto', marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
  th: { backgroundColor: '#8d6e63', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  totalRow: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' },
  infoBox: { backgroundColor: '#e8f4f8', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Item types with their rates and material factors
const itemTypes = {
  'Wardrobe (Sliding)': { unit: 'rft', rateKey: 'wardrobe', defaultRate: 1800, labourRate: 200, woodFactor: 4.5, laminateFactor: 4.0, hardwareFactor: 2.0 },
  'Wardrobe (Hinged)': { unit: 'rft', rateKey: 'wardrobeHinged', defaultRate: 1500, labourRate: 180, woodFactor: 4.0, laminateFactor: 3.5, hardwareFactor: 1.8 },
  'Modular Kitchen': { unit: 'rft', rateKey: 'modularKitchen', defaultRate: 2500, labourRate: 300, woodFactor: 5.0, laminateFactor: 5.0, hardwareFactor: 3.0 },
  'Loft Storage': { unit: 'rft', rateKey: 'loft', defaultRate: 1200, labourRate: 150, woodFactor: 3.0, laminateFactor: 2.5, hardwareFactor: 1.5 },
  'TV Panel / Unit': { unit: 'rft', rateKey: 'tvUnit', defaultRate: 1200, labourRate: 100, woodFactor: 3.5, laminateFactor: 3.0, hardwareFactor: 1.5 },
  'Shoe Rack': { unit: 'rft', rateKey: 'shoeRack', defaultRate: 800, labourRate: 100, woodFactor: 2.5, laminateFactor: 2.0, hardwareFactor: 1.0 },
  'Toilet Basket / Cabinet': { unit: 'nos', rateKey: 'toiletCabinet', defaultRate: 2500, labourRate: 300, woodFactor: 8, laminateFactor: 7, hardwareFactor: 3 },
  'Pooja Room / Temple': { unit: 'set', rateKey: 'poojaUnit', defaultRate: 15000, labourRate: 500, woodFactor: 30, laminateFactor: 25, hardwareFactor: 10 },
  'Door Panel (Flush)': { unit: 'nos', rateKey: 'flushDoor', defaultRate: 2500, labourRate: 400, woodFactor: 12, laminateFactor: 10, hardwareFactor: 4 },
  'Door Panel (WPC)': { unit: 'nos', rateKey: 'wpcDoor', defaultRate: 2000, labourRate: 300, woodFactor: 10, laminateFactor: 8, hardwareFactor: 3 },
  'Door Panel (Glass)': { unit: 'nos', rateKey: 'glassDoor', defaultRate: 3000, labourRate: 350, woodFactor: 11, laminateFactor: 9, hardwareFactor: 3 },
  'Bed (King Size)': { unit: 'nos', rateKey: 'kingBed', defaultRate: 25000, labourRate: 1000, woodFactor: 45, laminateFactor: 35, hardwareFactor: 15 },
  'Bed (Queen Size)': { unit: 'nos', rateKey: 'queenBed', defaultRate: 20000, labourRate: 800, woodFactor: 35, laminateFactor: 28, hardwareFactor: 12 },
  'Bed (Single)': { unit: 'nos', rateKey: 'singleBed', defaultRate: 12000, labourRate: 500, woodFactor: 25, laminateFactor: 20, hardwareFactor: 8 },
  'Dining Table (4 Seater)': { unit: 'set', rateKey: 'dining4', defaultRate: 15000, labourRate: 600, woodFactor: 25, laminateFactor: 20, hardwareFactor: 8 },
  'Dining Table (6 Seater)': { unit: 'set', rateKey: 'dining6', defaultRate: 25000, labourRate: 800, woodFactor: 35, laminateFactor: 28, hardwareFactor: 12 },
  'Dining Table (8 Seater)': { unit: 'set', rateKey: 'dining8', defaultRate: 35000, labourRate: 1000, woodFactor: 45, laminateFactor: 35, hardwareFactor: 15 },
  'Sofa (3 Seater)': { unit: 'set', rateKey: 'sofa3', defaultRate: 25000, labourRate: 800, woodFactor: 30, laminateFactor: 25, hardwareFactor: 10 },
  'Sofa (2 Seater)': { unit: 'set', rateKey: 'sofa2', defaultRate: 18000, labourRate: 600, woodFactor: 22, laminateFactor: 18, hardwareFactor: 8 },
  'Sofa (L-Shape)': { unit: 'set', rateKey: 'sofaL', defaultRate: 40000, labourRate: 1200, woodFactor: 50, laminateFactor: 40, hardwareFactor: 15 },
  'Sitout / Bench': { unit: 'rft', rateKey: 'sitout', defaultRate: 800, labourRate: 100, woodFactor: 2.0, laminateFactor: 1.5, hardwareFactor: 0.8 },
  'Study Table': { unit: 'set', rateKey: 'studyTable', defaultRate: 8000, labourRate: 300, woodFactor: 15, laminateFactor: 12, hardwareFactor: 5 }
};

export default function InteriorBOQPage() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();
  const { rates, loading } = useRates();
  
  const [projectName, setProjectName] = useState('Jai Sri ram');
  const [clientName, setClientName] = useState('Reddy');
  const [mobileNo, setMobileNo] = useState('7676942386');
  const [city, setCity] = useState('Bengaluru');
  
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('Wardrobe (Sliding)');
  const [length, setLength] = useState(6);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(7);
  const [nos, setNos] = useState(1);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);

  const getItemRate = (itemName) => {
    const itemInfo = itemTypes[itemName];
    return rates?.[itemInfo.rateKey] || itemInfo.defaultRate;
  };

  const getItemLabourRate = (itemName) => {
    const itemInfo = itemTypes[itemName];
    return itemInfo.labourRate;
  };

  const calculateArea = () => {
    const itemInfo = itemTypes[selectedItem];
    if (itemInfo.unit === 'rft') {
      return length * nos;
    } else if (itemInfo.unit === 'nos') {
      return nos;
    } else if (itemInfo.unit === 'set') {
      return nos;
    } else {
      return (length * width * height * nos) / 144;
    }
  };

  const addItem = () => {
    const area = calculateArea();
    const itemInfo = itemTypes[selectedItem];
    const rate = getItemRate(selectedItem);
    const labourRate = getItemLabourRate(selectedItem);
    const amount = area * rate;
    const labourAmount = area * labourRate;
    
    // Calculate all material requirements
    const plywood18mm = area * itemInfo.woodFactor;
    const plywood12mm = area * itemInfo.woodFactor * 0.3;
    const plywood6mm = area * itemInfo.woodFactor * 0.15;
    const externalLaminate = area * itemInfo.laminateFactor;
    const internalLaminate = area * itemInfo.laminateFactor * 0.6;
    const edgeBanding = area * itemInfo.laminateFactor * 2;
    const hinges = area * 0.5;
    const handles = area * 0.2;
    const locks = area * 0.05;
    const drawerChannels = area * 0.15;
    const kitchenAccessories = selectedItem === 'Modular Kitchen' ? area * 1.5 : 0;
    const fevicol = area * 0.05;
    const nails = area * 0.03;
    const screws = area * 0.04;
    const mirrors = selectedItem === 'Wardrobe (Sliding)' ? area * 0.3 : selectedItem === 'Wardrobe (Hinged)' ? area * 0.2 : 0;
    const glass = selectedItem === 'Door Panel (Glass)' ? area * 1.2 : 0;
    
    setItems([...items, {
      id: Date.now(),
      name: selectedItem,
      length: length,
      width: width,
      height: height,
      nos: nos,
      unit: itemInfo.unit,
      area: area,
      rate: rate,
      labourRate: labourRate,
      amount: amount,
      labourAmount: labourAmount,
      total: amount + labourAmount,
      // Material quantities
      plywood18mm, plywood12mm, plywood6mm,
      externalLaminate, internalLaminate, edgeBanding,
      hinges, handles, locks, drawerChannels, kitchenAccessories,
      fevicol, nails, screws, mirrors, glass
    }]);
    
    setLength(6);
    setWidth(0);
    setHeight(7);
    setNos(1);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateBOQ = () => {
    // Item-wise totals
    const materialTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const labourTotal = items.reduce((sum, item) => sum + item.labourAmount, 0);
    const grandTotal = materialTotal + labourTotal;
    const totalArea = items.reduce((sum, item) => sum + item.area, 0);
    
    // Material-wise totals
    const materialBreakdown = {
      plywood18mm: items.reduce((sum, item) => sum + item.plywood18mm, 0),
      plywood12mm: items.reduce((sum, item) => sum + item.plywood12mm, 0),
      plywood6mm: items.reduce((sum, item) => sum + item.plywood6mm, 0),
      externalLaminate: items.reduce((sum, item) => sum + item.externalLaminate, 0),
      internalLaminate: items.reduce((sum, item) => sum + item.internalLaminate, 0),
      edgeBanding: items.reduce((sum, item) => sum + item.edgeBanding, 0),
      hinges: items.reduce((sum, item) => sum + item.hinges, 0),
      handles: items.reduce((sum, item) => sum + item.handles, 0),
      locks: items.reduce((sum, item) => sum + item.locks, 0),
      drawerChannels: items.reduce((sum, item) => sum + item.drawerChannels, 0),
      kitchenAccessories: items.reduce((sum, item) => sum + item.kitchenAccessories, 0),
      fevicol: items.reduce((sum, item) => sum + item.fevicol, 0),
      nails: items.reduce((sum, item) => sum + item.nails, 0),
      screws: items.reduce((sum, item) => sum + item.screws, 0),
      mirrors: items.reduce((sum, item) => sum + item.mirrors, 0),
      glass: items.reduce((sum, item) => sum + item.glass, 0)
    };
    
    // Material costs
    const materialCosts = {
      plywood18mmCost: materialBreakdown.plywood18mm * (rates?.plywood18mm || 80),
      plywood12mmCost: materialBreakdown.plywood12mm * (rates?.plywood12mm || 65),
      plywood6mmCost: materialBreakdown.plywood6mm * (rates?.plywood6mm || 40),
      externalLaminateCost: materialBreakdown.externalLaminate * (rates?.laminateExt || 45),
      internalLaminateCost: materialBreakdown.internalLaminate * (rates?.laminateInt || 30),
      edgeBandingCost: materialBreakdown.edgeBanding * (rates?.edgeBanding || 8),
      hingesCost: materialBreakdown.hinges * (rates?.hinge || 35),
      handlesCost: materialBreakdown.handles * (rates?.handle || 50),
      locksCost: materialBreakdown.locks * (rates?.lock || 120),
      drawerChannelsCost: materialBreakdown.drawerChannels * (rates?.drawerChannel || 80),
      kitchenAccessoriesCost: materialBreakdown.kitchenAccessories * (rates?.kitchenAcc || 150),
      fevicolCost: materialBreakdown.fevicol * (rates?.fevicol || 60),
      nailsCost: materialBreakdown.nails * (rates?.nails || 30),
      screwsCost: materialBreakdown.screws * (rates?.screws || 40),
      mirrorsCost: materialBreakdown.mirrors * (rates?.mirror || 50),
      glassCost: materialBreakdown.glass * (rates?.glass || 60)
    };
    
    const materialCostTotal = Object.values(materialCosts).reduce((a, b) => a + b, 0);
    
    return { 
      items, 
      materialTotal, 
      labourTotal, 
      grandTotal, 
      totalArea,
      materialBreakdown,
      materialCosts,
      materialCostTotal
    };
  };

  const handleGenerate = () => {
    setResults(calculateBOQ());
    setGenerated(true);
  };

  const handleReset = () => {
    setItems([]);
    setResults(null);
    setGenerated(false);
    setProjectName('Jai Sri ram');
    setClientName('Reddy');
    setMobileNo('7676942386');
    setCity('Bengaluru');
  };

  const handleBack = () => {
    router.push('/boq');
  };

  const handleExportExcel = () => {
    if (!results) return;
    
    // Items sheet
    const itemsData = results.items.map(item => ({
      'Item': item.name,
      'Size': `${item.length}' x ${item.width}' x ${item.height}'`,
      'Nos': item.nos,
      'Area (sqft)': formatNumber(item.area),
      'Material (₹)': formatNumber(item.amount),
      'Labour (₹)': formatNumber(item.labourAmount),
      'Total (₹)': formatNumber(item.total)
    }));
    
    // Materials sheet with all details
    const materialsData = [
      { 'Material': '18mm Plywood (BWP)', 'Quantity': formatNumber(results.materialBreakdown.plywood18mm), 'Unit': 'sft', 'Rate': formatNumber(rates?.plywood18mm || 80), 'Cost': formatNumber(results.materialCosts.plywood18mmCost) },
      { 'Material': '12mm Plywood (BWP)', 'Quantity': formatNumber(results.materialBreakdown.plywood12mm), 'Unit': 'sft', 'Rate': formatNumber(rates?.plywood12mm || 65), 'Cost': formatNumber(results.materialCosts.plywood12mmCost) },
      { 'Material': '6mm Plywood (MR)', 'Quantity': formatNumber(results.materialBreakdown.plywood6mm), 'Unit': 'sft', 'Rate': formatNumber(rates?.plywood6mm || 40), 'Cost': formatNumber(results.materialCosts.plywood6mmCost) },
      { 'Material': 'External Laminate (Sunmica)', 'Quantity': formatNumber(results.materialBreakdown.externalLaminate), 'Unit': 'sft', 'Rate': formatNumber(rates?.laminateExt || 45), 'Cost': formatNumber(results.materialCosts.externalLaminateCost) },
      { 'Material': 'Internal Laminate (Back side)', 'Quantity': formatNumber(results.materialBreakdown.internalLaminate), 'Unit': 'sft', 'Rate': formatNumber(rates?.laminateInt || 30), 'Cost': formatNumber(results.materialCosts.internalLaminateCost) },
      { 'Material': 'Edge Banding (PVC)', 'Quantity': formatNumber(results.materialBreakdown.edgeBanding), 'Unit': 'm', 'Rate': formatNumber(rates?.edgeBanding || 8), 'Cost': formatNumber(results.materialCosts.edgeBandingCost) },
      { 'Material': 'Hinges (Soft Close)', 'Quantity': formatNumber(results.materialBreakdown.hinges), 'Unit': 'nos', 'Rate': formatNumber(rates?.hinge || 35), 'Cost': formatNumber(results.materialCosts.hingesCost) },
      { 'Material': 'Handles / Pulls', 'Quantity': formatNumber(results.materialBreakdown.handles), 'Unit': 'nos', 'Rate': formatNumber(rates?.handle || 50), 'Cost': formatNumber(results.materialCosts.handlesCost) },
      { 'Material': 'Locks', 'Quantity': formatNumber(results.materialBreakdown.locks), 'Unit': 'nos', 'Rate': formatNumber(rates?.lock || 120), 'Cost': formatNumber(results.materialCosts.locksCost) },
      { 'Material': 'Drawer Channels (SS)', 'Quantity': formatNumber(results.materialBreakdown.drawerChannels), 'Unit': 'set', 'Rate': formatNumber(rates?.drawerChannel || 80), 'Cost': formatNumber(results.materialCosts.drawerChannelsCost) },
      { 'Material': 'Kitchen Accessories', 'Quantity': formatNumber(results.materialBreakdown.kitchenAccessories), 'Unit': 'set', 'Rate': formatNumber(rates?.kitchenAcc || 150), 'Cost': formatNumber(results.materialCosts.kitchenAccessoriesCost) },
      { 'Material': 'Fevicol / Adhesive', 'Quantity': formatNumber(results.materialBreakdown.fevicol), 'Unit': 'kg', 'Rate': formatNumber(rates?.fevicol || 60), 'Cost': formatNumber(results.materialCosts.fevicolCost) },
      { 'Material': 'Nails', 'Quantity': formatNumber(results.materialBreakdown.nails), 'Unit': 'kg', 'Rate': formatNumber(rates?.nails || 30), 'Cost': formatNumber(results.materialCosts.nailsCost) },
      { 'Material': 'Screws', 'Quantity': formatNumber(results.materialBreakdown.screws), 'Unit': 'box', 'Rate': formatNumber(rates?.screws || 40), 'Cost': formatNumber(results.materialCosts.screwsCost) },
      { 'Material': 'Mirrors', 'Quantity': formatNumber(results.materialBreakdown.mirrors), 'Unit': 'sft', 'Rate': formatNumber(rates?.mirror || 50), 'Cost': formatNumber(results.materialCosts.mirrorsCost) },
      { 'Material': 'Glass', 'Quantity': formatNumber(results.materialBreakdown.glass), 'Unit': 'sft', 'Rate': formatNumber(rates?.glass || 60), 'Cost': formatNumber(results.materialCosts.glassCost) }
    ];
    
    const ws1 = XLSX.utils.json_to_sheet(itemsData);
    const ws2 = XLSX.utils.json_to_sheet(materialsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Items_BOQ');
    XLSX.utils.book_append_sheet(wb, ws2, 'Materials_BOQ');
    XLSX.writeFile(wb, `Interior_BOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🛋️ INTERIOR BOQ\n\nProject: ${projectName}\nTotal Items: ${results.items.length}\nPlywood: ${formatNumber(results.materialBreakdown.plywood18mm)} sft\nLaminate: ${formatNumber(results.materialBreakdown.externalLaminate)} sft\nHardware: ${formatNumber(results.materialBreakdown.hinges)} nos\nTotal Cost: ₹${formatNumber(results.grandTotal/100000)} Lakhs`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('h1', { style: styles.headerTitle }, '🛋️ Interior BOQ Calculator'),
        React.createElement('p', { style: styles.headerSub }, 'Complete material breakdown - Plywood, Laminate, Hardware, Accessories')
      )
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📋 Project Details'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Project Name'), React.createElement('input', { type: 'text', value: projectName, onChange: (e) => setProjectName(e.target.value), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Client Name'), React.createElement('input', { type: 'text', value: clientName, onChange: (e) => setClientName(e.target.value), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Mobile No.'), React.createElement('input', { type: 'text', value: mobileNo, onChange: (e) => setMobileNo(e.target.value), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'City'), React.createElement('input', { type: 'text', value: city, onChange: (e) => setCity(e.target.value), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '➕ Add Interior Item'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Item Type'), React.createElement('select', { value: selectedItem, onChange: (e) => setSelectedItem(e.target.value), style: styles.select },
        Object.keys(itemTypes).map(item => React.createElement('option', { key: item, value: item }, `${item} (${itemTypes[item].unit})`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length (ft)'), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (ft)'), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Height (ft)'), React.createElement('input', { type: 'number', value: height, onChange: (e) => setHeight(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Nos'), React.createElement('input', { type: 'number', value: nos, onChange: (e) => setNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end' } }, React.createElement('button', { onClick: addItem, style: styles.buttonSmall }, '+ Add Item'))
    ),
    
    items.length > 0 && React.createElement('div', { style: styles.tableContainer },
      React.createElement('table', { style: styles.table },
        React.createElement('thead', null, React.createElement('tr', null,
          React.createElement('th', { style: styles.th }, 'Item'), React.createElement('th', { style: styles.th }, 'Size'),
          React.createElement('th', { style: styles.th }, 'Nos'), React.createElement('th', { style: styles.th }, 'Area'),
          React.createElement('th', { style: styles.th }, 'Material'), React.createElement('th', { style: styles.th }, 'Labour'),
          React.createElement('th', { style: styles.th }, 'Total'), React.createElement('th', { style: styles.th }, '')
        )),
        React.createElement('tbody', null,
          items.map((item, idx) => React.createElement('tr', { key: item.id, style: idx % 2 === 0 ? {} : styles.evenRow },
            React.createElement('td', { style: styles.td }, item.name),
            React.createElement('td', { style: styles.td }, `${item.length}' x ${item.width}' x ${item.height}'`),
            React.createElement('td', { style: styles.td }, item.nos),
            React.createElement('td', { style: styles.td }, formatNumber(item.area)),
            React.createElement('td', { style: styles.td }, `₹${formatNumber(item.amount)}`),
            React.createElement('td', { style: styles.td }, `₹${formatNumber(item.labourAmount)}`),
            React.createElement('td', { style: styles.td }, `₹${formatNumber(item.total)}`),
            React.createElement('td', { style: styles.td }, React.createElement('button', { onClick: () => removeItem(item.id), style: { ...styles.buttonSmall, backgroundColor: '#dc3545' } }, 'X'))
          ))
        )
      )
    ),
    
    React.createElement('div', { style: styles.buttonContainer },
      React.createElement('button', { onClick: handleReset, style: styles.buttonExport }, '🔄 Reset'),
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate Interior BOQ')
    ),
    
    generated && results && React.createElement('div', null,
      React.createElement('div', { style: styles.cardContainer },
        React.createElement('div', { style: { ...styles.card, ...styles.cardTotal } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Total Cost'), React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.grandTotal/100000)} L`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardWood } }, React.createElement('div', null, '🪵'), React.createElement('div', null, 'Plywood'), React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.materialBreakdown.plywood18mm)} sft`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLaminate } }, React.createElement('div', null, '🎨'), React.createElement('div', null, 'Laminate'), React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.materialBreakdown.externalLaminate)} sft`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardHardware } }, React.createElement('div', null, '🔧'), React.createElement('div', null, 'Hardware'), React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.materialBreakdown.hinges)} nos`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLabour } }, React.createElement('div', null, '👷'), React.createElement('div', null, 'Labour'), React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.labourTotal/100000)} L`))
      ),
      
      React.createElement('div', { style: styles.buttonContainer },
        React.createElement('button', { onClick: () => checkAndRun('boq_export', 'boq-interior', handleExportExcel), style: styles.buttonExport }, '📊 Excel'),
        React.createElement('button', { onClick: () => checkAndRun('boq_export', 'boq-interior', handleWhatsApp), style: styles.buttonWhatsapp }, '💬 Share')
      ),
      
      // Complete Material BOQ Table
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null,
            React.createElement('th', { style: styles.th }, 'Material'), React.createElement('th', { style: styles.th }, 'Quantity'),
            React.createElement('th', { style: styles.th }, 'Unit'), React.createElement('th', { style: styles.th }, 'Rate'),
            React.createElement('th', { style: styles.th }, 'Cost (₹)')
          )),
          React.createElement('tbody', null,
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, '18mm Plywood (BWP)'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.plywood18mm)), React.createElement('td', { style: styles.td }, 'sft'), React.createElement('td', { style: styles.td }, formatNumber(rates?.plywood18mm || 80)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.plywood18mmCost))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, '12mm Plywood (BWP)'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.plywood12mm)), React.createElement('td', { style: styles.td }, 'sft'), React.createElement('td', { style: styles.td }, formatNumber(rates?.plywood12mm || 65)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.plywood12mmCost))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, '6mm Plywood (MR)'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.plywood6mm)), React.createElement('td', { style: styles.td }, 'sft'), React.createElement('td', { style: styles.td }, formatNumber(rates?.plywood6mm || 40)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.plywood6mmCost))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'External Laminate'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.externalLaminate)), React.createElement('td', { style: styles.td }, 'sft'), React.createElement('td', { style: styles.td }, formatNumber(rates?.laminateExt || 45)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.externalLaminateCost))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Internal Laminate'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.internalLaminate)), React.createElement('td', { style: styles.td }, 'sft'), React.createElement('td', { style: styles.td }, formatNumber(rates?.laminateInt || 30)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.internalLaminateCost))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Edge Banding'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.edgeBanding)), React.createElement('td', { style: styles.td }, 'm'), React.createElement('td', { style: styles.td }, formatNumber(rates?.edgeBanding || 8)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.edgeBandingCost))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Hinges (Soft Close)'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.hinges)), React.createElement('td', { style: styles.td }, 'nos'), React.createElement('td', { style: styles.td }, formatNumber(rates?.hinge || 35)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.hingesCost))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Handles / Pulls'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.handles)), React.createElement('td', { style: styles.td }, 'nos'), React.createElement('td', { style: styles.td }, formatNumber(rates?.handle || 50)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.handlesCost))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Locks'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.locks)), React.createElement('td', { style: styles.td }, 'nos'), React.createElement('td', { style: styles.td }, formatNumber(rates?.lock || 120)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.locksCost))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Drawer Channels'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.drawerChannels)), React.createElement('td', { style: styles.td }, 'set'), React.createElement('td', { style: styles.td }, formatNumber(rates?.drawerChannel || 80)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.drawerChannelsCost))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Kitchen Accessories'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.kitchenAccessories)), React.createElement('td', { style: styles.td }, 'set'), React.createElement('td', { style: styles.td }, formatNumber(rates?.kitchenAcc || 150)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.kitchenAccessoriesCost))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Fevicol / Adhesive'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.fevicol)), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, formatNumber(rates?.fevicol || 60)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.fevicolCost))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Nails'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.nails)), React.createElement('td', { style: styles.td }, 'kg'), React.createElement('td', { style: styles.td }, formatNumber(rates?.nails || 30)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.nailsCost))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Screws'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.screws)), React.createElement('td', { style: styles.td }, 'box'), React.createElement('td', { style: styles.td }, formatNumber(rates?.screws || 40)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.screwsCost))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Mirrors'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.mirrors)), React.createElement('td', { style: styles.td }, 'sft'), React.createElement('td', { style: styles.td }, formatNumber(rates?.mirror || 50)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.mirrorsCost))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Glass'), React.createElement('td', { style: styles.td }, formatNumber(results.materialBreakdown.glass)), React.createElement('td', { style: styles.td }, 'sft'), React.createElement('td', { style: styles.td }, formatNumber(rates?.glass || 60)), React.createElement('td', { style: styles.td }, formatNumber(results.materialCosts.glassCost))),
            React.createElement('tr', { style: styles.totalRow },
              React.createElement('td', { colSpan: 4, style: { padding: '10px' } }, 'TOTAL MATERIAL COST'),
              React.createElement('td', { style: { padding: '10px' } }, `₹${formatNumber(results.materialCostTotal)}`)
            )
          )
        )
      ),
      
      // Items Summary Table
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null,
            React.createElement('th', { style: styles.th }, 'Item'), React.createElement('th', { style: styles.th }, 'Size'),
            React.createElement('th', { style: styles.th }, 'Nos'), React.createElement('th', { style: styles.th }, 'Area'),
            React.createElement('th', { style: styles.th }, 'Material'), React.createElement('th', { style: styles.th }, 'Labour'),
            React.createElement('th', { style: styles.th }, 'Total')
          )),
          React.createElement('tbody', null,
            results.items.map((item, idx) => React.createElement('tr', { key: item.id, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, item.name),
              React.createElement('td', { style: styles.td }, `${item.length}' x ${item.width}' x ${item.height}'`),
              React.createElement('td', { style: styles.td }, item.nos),
              React.createElement('td', { style: styles.td }, formatNumber(item.area)),
              React.createElement('td', { style: styles.td }, `₹${formatNumber(item.amount)}`),
              React.createElement('td', { style: styles.td }, `₹${formatNumber(item.labourAmount)}`),
              React.createElement('td', { style: styles.td }, `₹${formatNumber(item.total)}`)
            )),
            React.createElement('tr', { style: styles.totalRow },
              React.createElement('td', { colSpan: 6, style: { padding: '10px' } }, 'GRAND TOTAL'),
              React.createElement('td', { style: { padding: '10px' } }, `₹${formatNumber(results.grandTotal)}`)
            )
          )
        )
      )
    )
  );
}


