import React, { useState } from 'react';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { getMasterRate, rateStatusMessage } from '../utils/masterRates';

const styles: any = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#1a7f6e', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: 'white' },
  headerTitle: { margin: 0, fontSize: '20px' },
  headerSub: { margin: '5px 0 0', opacity: 0.9, fontSize: '12px' },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#1a7f6e', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' },
  inputGroup: { marginBottom: '12px' },
  label: { display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '11px', color: '#555' },
  input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff' },
  readOnly: { backgroundColor: '#e8f4f8', fontWeight: 'bold' },
  select: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#555', paddingTop: '22px' },
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
};

const formatNumber = (num: any) => {
  if (num === '' || num === null || num === undefined || isNaN(Number(num))) return '0.00';
  return Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function CivilBOQPage() {
  const router = useRouter();

  const [projectName, setProjectName] = useState('Jai Sri ram');
  const [clientName, setClientName] = useState('Reddy');
  const [mobileNo, setMobileNo] = useState('7676942386');
  const [city, setCity] = useState('Bengaluru');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(3);
  const [sbc, setSbc] = useState(180);
  const [wallType, setWallType] = useState('Concrete Blocks');
  const [constructionType, setConstructionType] = useState('Residential');
  const [finishProfile, setFinishProfile] = useState('Standard');
  const [bedrooms, setBedrooms] = useState(2);
  const [toilets, setToilets] = useState(3);
  const [kitchens, setKitchens] = useState(1);
  const [hasLift, setHasLift] = useState(false);
  const [hasTerraceTruss, setHasTerraceTruss] = useState(false);

  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  const plotArea = plotLength * plotWidth;
  const setbackArea = plotArea * 0.10;
  const footprintArea = Math.max(plotArea - setbackArea, 0);
  const totalBUA = footprintArea * floors;
  const boreholes = plotArea <= 6000 ? 1 : Math.ceil(plotArea / 6000);

  const getRateObj = (keys: string[], fallback = 0, stores?: string[]) => getMasterRate(keys, fallback, stores);
  const matRate = (keys: string[], fallback = 0, stores?: string[]) => getRateObj(keys, fallback, stores).rate || 0;
  const labRate = (keys: string[], fallback = 0) => getRateObj(keys, fallback, ['bm_labour_rates', 'bm_service_rates']).rate || 0;

  const structure = (() => {
    const f = Number(floors || 1);
    if (f <= 1) return { foundation: 'Isolated Footings', footing: '4ft x 4ft x 1.5ft', column: '9in x 12in', beam: '9in x 12in', slab: '125mm', steelKgPerSft: 3.0, rccCftPerSft: 1.10 };
    if (f <= 2) return { foundation: 'Isolated Footings', footing: '4.5ft x 4.5ft x 1.75ft', column: '9in x 15in', beam: '9in x 15in', slab: '125mm', steelKgPerSft: 3.2, rccCftPerSft: 1.18 };
    if (f <= 3) return { foundation: 'Isolated Footings', footing: '5ft x 5ft x 2ft', column: '12in x 18in', beam: '9in x 18in', slab: '125mm', steelKgPerSft: 3.4, rccCftPerSft: 1.25 };
    if (f <= 4) return { foundation: 'Combined Footings', footing: '5.5ft x 5.5ft x 2.25ft', column: '12in x 18in', beam: '12in x 18in', slab: '150mm', steelKgPerSft: 3.6, rccCftPerSft: 1.33 };
    if (f <= 5) return { foundation: 'Combined Footings', footing: '6ft x 6ft x 2.5ft', column: '12in x 21in', beam: '12in x 18in', slab: '150mm', steelKgPerSft: 3.8, rccCftPerSft: 1.42 };
    return { foundation: 'Raft Foundation', footing: 'Raft slab 300mm+', column: 'Engineer designed', beam: 'Engineer designed', slab: '150-175mm', steelKgPerSft: 4.2, rccCftPerSft: 1.55 };
  })();

  const foundationType = structure.foundation;

  const counts = (() => {
    const toiletsCount = Math.max(0, Number(toilets || 0));
    const bedroomsCount = Math.max(0, Number(bedrooms || 0));
    const kitchensCount = Math.max(0, Number(kitchens || 0));
    const livingRooms = Math.max(1, Math.ceil(floors));
    const internalDoors = bedroomsCount + kitchensCount + livingRooms + Math.max(1, Math.ceil(floors));
    const toiletDoors = toiletsCount;
    const mainDoors = Math.max(1, kitchensCount);
    const poojaDoors = 1;
    const totalDoors = internalDoors + toiletDoors + mainDoors + poojaDoors;
    const windows = Math.max(1, Math.ceil(totalBUA / 225)); // engine rule: 1 window per 200-250 sft
    const ventilators = toiletsCount; // engine rule: 1 ventilator per toilet
    const electricalPoints = Math.ceil((bedroomsCount * 8) + (livingRooms * 12) + (kitchensCount * 10) + (toiletsCount * 4) + (totalBUA / 120) + (hasLift ? 12 : 0));
    const plumbingPoints = Math.ceil((toiletsCount * 10) + (kitchensCount * 6) + 6 + (hasLift ? 2 : 0));
    return { toiletsCount, bedroomsCount, kitchensCount, livingRooms, internalDoors, toiletDoors, mainDoors, poojaDoors, totalDoors, windows, ventilators, electricalPoints, plumbingPoints };
  })();

  const calculateBOQ = () => {
    const finishMultiplier = finishProfile === 'Standard' ? 1 : finishProfile === 'Premium' ? 1.1 : 1.25;
    const areaFactor = constructionType === 'Commercial' ? 1.12 : constructionType === 'Industrial' ? 1.18 : 1;
    const floorsNum = Math.max(1, Number(floors || 1));

    const columnCount = Math.max(8, Math.ceil(footprintArea / 150) + 4);
    const excavationCum = foundationType === 'Raft Foundation' ? (footprintArea * 0.65) / 35.315 : (columnCount * 5 * 5 * 5.5) / 35.315;
    const pccCum = foundationType === 'Raft Foundation' ? (footprintArea * 0.33) / 35.315 : (columnCount * 5.5 * 5.5 * 0.33) / 35.315;
    const foundationMasonryCum = foundationType === 'Raft Foundation' ? 0 : (columnCount * 4.5 * 4.5 * 1.5) / 35.315;
    const backfillCum = Math.max(excavationCum - pccCum - foundationMasonryCum, 0) * 0.85;
    const plinthProtectionCum = ((plotArea - footprintArea) * 0.33) / 35.315;
    const pccTotalCum = pccCum + plinthProtectionCum;
    const antiTermiteLtr = footprintArea / 100;
    const shutteringSft = totalBUA * (2.15 + floorsNum * 0.06);
    const steelKg = totalBUA * structure.steelKgPerSft * areaFactor;
    const rccCum = (totalBUA * structure.rccCftPerSft) / 35.315;
    const cementBags = totalBUA * 0.40 * areaFactor;
    const lintelCum = (counts.totalDoors + counts.windows) * 5 * 0.75 * 0.3 / 35.315;
    const staircaseCum = Math.max(floorsNum - 1, 1) * 42 / 35.315;
    const sunshadeCum = counts.windows * 4.5 * 1.25 * 0.25 / 35.315;
    const extWallAreaSft = totalBUA * 0.90;
    const intWallAreaSft = totalBUA * 0.55;
    const sixInBlockNos = wallType === 'Concrete Blocks' ? extWallAreaSft / 0.89 : 0;
    const fourInBlockNos = wallType === 'Concrete Blocks' ? intWallAreaSft / 0.89 : 0;
    const clayBrickSqm = wallType === 'Clay Bricks' ? (extWallAreaSft + intWallAreaSft) / 10.764 : 0;
    const wallMasonryQty = wallType === 'Concrete Blocks' ? (sixInBlockNos + fourInBlockNos) : clayBrickSqm;
    const wallMasonryUom = wallType === 'Concrete Blocks' ? 'Nos' : 'Sqmtr';
    const wallMasonryDesc = wallType === 'Concrete Blocks' ? 'Concrete block masonry: 6 inch external walls + 4 inch internal partitions as per wall area.' : 'Clay brick masonry in CM 1:6 as per wall area.';
    const plasterSqm = (totalBUA * 3.4) / 10.764;
    const flooringSft = totalBUA * 1.08;
    const dadoSft = counts.toiletsCount * 55 + counts.kitchensCount * 45;
    const flooringTotalSft = flooringSft + dadoSft;
    const kitchenRmt = counts.kitchensCount * 3.6;
    const parkingSft = Math.max(footprintArea * 0.35, plotArea * 0.18);
    const otherQty = 1;
    const terraceSft = hasTerraceTruss ? Math.max(250, footprintArea * 0.35) : Math.max(150, footprintArea * 0.12);
    const railingKg = (floorsNum * 75) + (totalBUA * 0.04) + (hasLift ? 75 : 0);
    const compoundWallSft = Math.max((2 * (plotLength + plotWidth) - 12) * 6, 0);
    const paintingSft = totalBUA * 3.5;

    const item = (sr: number, code: string, desc: string, uom: string, qty: number, mr: number, lr: number) => ({
      sr, code, desc, uom, qty: Number(qty || 0), matRate: Number(mr || 0), labRate: Number(lr || 0), amount: Number(qty || 0) * (Number(mr || 0) + Number(lr || 0))
    });

    const items = [
      item(1, 'Soil Test', `Soil investigation based on plot area. Engine rule: 1200-6000 sft = 1 borehole; above 6000 sft = 1 additional borehole per 6000 sft.`, 'Nos', boreholes, matRate(['soil test', 'soil investigation', 'borehole'], 0, ['bm_service_rates', 'bm_material_rates']), 0),
      item(2, 'Earth Excavation', `Earthwork excavation for foundation pits/plinth. SBC considered: ${sbc} kN/sqm.`, 'Cum', excavationCum, matRate(['earth excavation', 'excavation'], 0), labRate(['excavation labour', 'earthwork labour'], 0)),
      item(3, 'PCC Total', 'PCC M10 levelling bed + plinth protection combined. Plinth protection line item included here.', 'Cum', pccTotalCum, matRate(['pcc', 'plain cement concrete', 'm10 concrete', 'plinth protection'], 0), labRate(['pcc labour', 'concrete labour', 'plinth labour'], 0)),
      item(4, 'Foundation Masonry', foundationMasonryCum > 0 ? `Size stone masonry / substructure masonry below plinth. Recommended footing size: ${structure.footing}.` : 'Substructure masonry not applicable for selected structural system.', 'Cum', foundationMasonryCum, matRate(['foundation masonry', 'size stone masonry', 'stone masonry'], 0), labRate(['masonry labour', 'foundation labour'], 0)),
      item(5, 'Backfilling', 'Backfilling in foundation/plinth using excavated soil.', 'Cum', backfillCum, matRate(['backfilling', 'back filling'], 0), labRate(['backfilling labour', 'earthwork labour'], 0)),
      item(6, 'Anti-Termite', 'Anti-termite treatment below floor and foundation zone.', 'Ltr', antiTermiteLtr, matRate(['anti termite', 'anti-termite'], 0), labRate(['anti termite labour', 'chemical treatment labour'], 0)),
      item(7, 'Shuttering', 'Centering and shuttering for footing, column, beam and slab RCC works.', 'Sft', shutteringSft, matRate(['shuttering material', 'shuttering'], 0), labRate(['shuttering labour', 'centering labour'], 0)),
      item(8, 'Steel', `Fe-500 TMT steel. Engine: ${structure.steelKgPerSft} kg/sft, Column: ${structure.column}, Beam: ${structure.beam}, Slab: ${structure.slab}.`, 'Kgs', steelKg, matRate(['steel', 'tmt', 'rebar'], 0), labRate(['bar bending labour', 'steel labour'], 0)),
      item(9, 'RCC Total', `RCC total includes footings, columns, beams, slabs, lintels, staircase and sunshades/chajjas. Column ${structure.column}; beam ${structure.beam}; slab ${structure.slab}.`, 'Cum', rccCum + lintelCum + staircaseCum + sunshadeCum, matRate(['rcc', 'rcc concrete', 'm20 concrete'], 0), labRate(['rcc labour', 'concrete labour'], 0)),
      item(10, 'Wall Masonry', wallMasonryDesc, wallMasonryUom, wallMasonryQty, matRate(wallType === 'Concrete Blocks' ? ['6 inch block', '4 inch block', 'concrete block', 'block'] : ['clay brick', 'brick'], 0), labRate(['block masonry labour', 'brick masonry labour', 'masonry labour'], 0)),
      item(11, 'Doors Total', `Main doors - ${counts.mainDoors}; internal doors - ${counts.internalDoors}; pooja doors - ${counts.poojaDoors}; toilet doors - ${counts.toiletDoors}. Size/Make: main teak/engineered door; internal flush/WPC; toilet WPC.`, 'Nos', counts.totalDoors, matRate(['door', 'main door', 'internal door', 'toilet door', 'pooja door'], 0), labRate(['door fixing labour'], 0)),
      item(12, 'Windows + Ventilators', `Windows - ${counts.windows}; toilet ventilators - ${counts.ventilators}. Size/Make: UPVC/aluminium 3-track windows; ventilators for toilets.`, 'Nos', counts.windows + counts.ventilators, matRate(['window', 'upvc window', 'aluminium window', 'ventilator'], 0), labRate(['window fixing labour'], 0)),
      item(13, 'Plastering', 'Internal + external plastering quantity by BUA thumb rule.', 'Sqmtr', plasterSqm, matRate(['plastering', 'plaster'], 0), labRate(['plaster labour'], 0)),
      item(14, 'Flooring + Dado', 'Vitrified flooring with skirting + kitchen dado + toilet dado included by default.', 'Sft', flooringTotalSft, matRate(['flooring', 'vitrified tile', 'wall dado', 'dado tile'], 0), labRate(['flooring labour', 'tile laying labour'], 0)),
      item(15, 'Kitchen Platform', 'Kitchen granite/RCC platform per kitchen.', 'Rmt', kitchenRmt, matRate(['kitchen platform', 'granite platform'], 0), labRate(['kitchen platform labour'], 0)),
      item(16, 'Electrical', 'FRLS wiring, modular switches, DB/MCB consolidated points.', 'Points', counts.electricalPoints, matRate(['electrical point', 'electrical'], 0), labRate(['electrical labour'], 0)),
      item(17, 'Plumbing', 'CPVC/UPVC plumbing and sanitary consolidated points.', 'Points', counts.plumbingPoints, matRate(['plumbing point', 'plumbing'], 0), labRate(['plumbing labour'], 0)),
      item(18, 'Parking Area', 'Parking RCC/tile flooring allowance.', 'Sft', parkingSft, matRate(['parking flooring', 'parking area'], 0), labRate(['flooring labour'], 0)),
      item(19, 'Terrace', hasTerraceTruss ? 'Terrace steel truss with clay tile roofing selected.' : 'Standard terrace finish allowance.', 'Sft', terraceSft, matRate(hasTerraceTruss ? ['roof truss', 'mangalore tile roofing', 'terrace truss'] : ['terrace', 'terrace finish'], 0), labRate(['terrace labour', 'roof truss labour'], 0)),
      item(20, 'Other Works', `UGT + OHT + inspection chambers + gate + railing + miscellaneous external works. Railing allowance included: ${formatNumber(railingKg)} kg.`, 'LS', otherQty, matRate(['other works', 'ug tank', 'oht', 'inspection chamber', 'gate', 'railing'], 0), labRate(['misc labour', 'fabrication labour', 'water tank labour'], 0)),
      item(21, 'Compound Wall', 'Compound wall with RCC columns, masonry infill and plaster finish.', 'Sft', compoundWallSft, matRate(['compound wall'], 0), labRate(['compound wall labour', 'masonry labour'], 0)),
      item(22, 'Painting', 'Wall putty, primer and two coats emulsion paint.', 'Sft', paintingSft, matRate(['painting', 'emulsion paint', 'wall paint'], 0), labRate(['painting labour'], 0)),
    ];

    const materialTotal = items.reduce((sum, i) => sum + i.qty * i.matRate, 0);
    const labourTotal = items.reduce((sum, i) => sum + i.qty * i.labRate, 0);
    const grandTotal = materialTotal + labourTotal;
    const ratePerSft = totalBUA > 0 ? grandTotal / totalBUA : 0;
    const pehQuantity = pccTotalCum * 35.315;

    return { items, materialTotal, labourTotal, grandTotal, ratePerSft, totalBUA, foundationType, cementQuantity: cementBags, steelQuantity: steelKg, pehQuantity };
  };

  const handleGenerate = () => {
    setResults(calculateBOQ());
    setGenerated(true);
  };

  const handleReset = () => {
    setProjectName('Jai Sri ram'); setClientName('Reddy'); setMobileNo('7676942386'); setCity('Bengaluru');
    setPlotLength(30); setPlotWidth(40); setFloors(3); setSbc(180); setWallType('Concrete Blocks');
    setConstructionType('Residential'); setFinishProfile('Standard'); setBedrooms(2); setToilets(3); setKitchens(1);
    setHasLift(false); setHasTerraceTruss(false); setResults(null); setGenerated(false);
  };

  const handleExportExcel = () => {
    if (!results) return;
    const data = results.items.map((i: any) => ({ 'Sr. No.': i.sr, 'Item Code': i.code, Description: i.desc, UOM: i.uom, Quantity: formatNumber(i.qty), 'Mat. Rate': formatNumber(i.matRate), 'Lab. Rate': formatNumber(i.labRate), 'Total (₹)': formatNumber(i.amount) }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Civil_BOQ');
    XLSX.writeFile(wb, `Civil_BOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const msg = `🏗️ CIVIL BOQ\nProject: ${projectName}\nClient: ${clientName}\nBUA: ${formatNumber(totalBUA)} sft\nTotal: ₹${formatNumber(results.grandTotal)}\nRate: ₹${formatNumber(results.ratePerSft)}/sft`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const input = (label: string, value: any, setter: any, type = 'number') => React.createElement('div', null,
    React.createElement('label', { style: styles.label }, label),
    React.createElement('input', { type, value, onChange: (e: any) => setter(type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value), style: styles.input })
  );

  const rateMsg = rateStatusMessage({
    cement: getRateObj(['cement', 'opc', 'ppc'], 0),
    steel: getRateObj(['steel', 'tmt', 'rebar'], 0),
    rcc: getRateObj(['rcc', 'rcc concrete', 'm20 concrete'], 0),
    plaster: getRateObj(['plastering', 'plaster'], 0),
    flooring: getRateObj(['flooring', 'vitrified tile', 'granite'], 0),
    painting: getRateObj(['painting', 'emulsion paint', 'wall paint'], 0),
  });

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('h1', { style: styles.headerTitle }, '🏗️ Civil BOQ Calculator'),
      React.createElement('p', { style: styles.headerSub }, 'Professional Civil BOQ — 10% setback, SBC based quantities and Admin Master Rates')
    ),

    React.createElement('div', { style: styles.infoBox },
      `Admin Master Rates linked. ${rateMsg || 'All core rate keys loaded or fallback ₹0 is used where rate is missing.'}`
    ),

    React.createElement('div', { style: styles.sectionTitle }, '📋 Basic Details'),
    React.createElement('div', { style: styles.row4 },
      input('Project Name', projectName, setProjectName, 'text'),
      input('Client Name', clientName, setClientName, 'text'),
      input('Mobile No.', mobileNo, setMobileNo, 'text'),
      input('City', city, setCity, 'text')
    ),

    React.createElement('div', { style: styles.sectionTitle }, '📐 Plot & Building Inputs'),
    React.createElement('div', { style: styles.row4 },
      input('Plot Length (ft)', plotLength, setPlotLength),
      input('Plot Width (ft)', plotWidth, setPlotWidth),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Plot Area (Sft)'), React.createElement('input', { type: 'text', value: formatNumber(plotArea), readOnly: true, style: { ...styles.input, ...styles.readOnly } })),
      input('No. of Floors', floors, setFloors),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Total BUA (Sft)'), React.createElement('input', { type: 'text', value: formatNumber(totalBUA), readOnly: true, style: { ...styles.input, ...styles.readOnly } })),
      input('SBC (kN/sqm)', sbc, setSbc),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Wall Type'), React.createElement('select', { value: wallType, onChange: (e: any) => setWallType(e.target.value), style: styles.select }, React.createElement('option', null, 'Concrete Blocks'), React.createElement('option', null, 'Clay Bricks')))
    ),

    React.createElement('div', { style: styles.sectionTitle }, '🏠 Reduced Room & Finish Inputs'),
    React.createElement('div', { style: styles.row4 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Construction Type'), React.createElement('select', { value: constructionType, onChange: (e: any) => setConstructionType(e.target.value), style: styles.select }, React.createElement('option', null, 'Residential'), React.createElement('option', null, 'Commercial'), React.createElement('option', null, 'Industrial'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Finish Profile'), React.createElement('select', { value: finishProfile, onChange: (e: any) => setFinishProfile(e.target.value), style: styles.select }, React.createElement('option', null, 'Standard'), React.createElement('option', null, 'Premium'), React.createElement('option', null, 'Ultra Premium'))),
      input('Bedrooms', bedrooms, setBedrooms),
      input('Toilets', toilets, setToilets),
      input('Kitchens', kitchens, setKitchens),
      React.createElement('label', { style: styles.checkboxLabel }, React.createElement('input', { type: 'checkbox', checked: hasLift, onChange: (e: any) => setHasLift(e.target.checked) }), 'Lift Required'),
      React.createElement('label', { style: styles.checkboxLabel }, React.createElement('input', { type: 'checkbox', checked: hasTerraceTruss, onChange: (e: any) => setHasTerraceTruss(e.target.checked) }), 'Terrace Truss + Clay Tiles')
    ),

    React.createElement('div', { style: styles.infoBox },
      `Boreholes: ${boreholes} | Doors: ${counts.totalDoors} | Windows: ${counts.windows} | Ventilators: ${counts.ventilators} | Electrical Points: ${counts.electricalPoints} | Plumbing Points: ${counts.plumbingPoints} | Column: ${structure.column} | Beam: ${structure.beam} | Slab: ${structure.slab}`
    ),

    React.createElement('div', { style: styles.buttonContainer },
      React.createElement('button', { onClick: handleReset, style: styles.buttonExport }, '🔄 Reset'),
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Generate Civil BOQ')
    ),

    generated && results && React.createElement('div', null,
      React.createElement('div', { style: styles.cardContainer },
        React.createElement('div', { style: { ...styles.card, ...styles.cardCement } }, React.createElement('div', null, '🪣'), React.createElement('div', null, 'Cement'), React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.cementQuantity)} bags`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardSteel } }, React.createElement('div', null, '⚙️'), React.createElement('div', null, 'Steel'), React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.steelQuantity)} kg`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardPEH } }, React.createElement('div', null, '🏗️'), React.createElement('div', null, 'PCC'), React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.pehQuantity)} Cft`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLabour } }, React.createElement('div', null, '👷'), React.createElement('div', null, 'Labour Cost'), React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.labourTotal / 100000)} L`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardRate } }, React.createElement('div', null, '📐'), React.createElement('div', null, 'Rate/sft'), React.createElement('div', { style: styles.cardValue }, `₹${formatNumber(results.ratePerSft)}`))
      ),
      React.createElement('div', { style: styles.buttonContainer },
        React.createElement('button', { onClick: handleExportExcel, style: styles.buttonExport }, '📊 Export Excel'),
        React.createElement('button', { onClick: handleWhatsApp, style: styles.buttonWhatsapp }, '💬 WhatsApp Share')
      ),
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null,
            React.createElement('th', { style: styles.th }, 'Sr.'), React.createElement('th', { style: styles.th }, 'Item Code'), React.createElement('th', { style: styles.th }, 'Description'), React.createElement('th', { style: styles.th }, 'UOM'), React.createElement('th', { style: styles.th }, 'Qty'), React.createElement('th', { style: styles.th }, 'Mat. Rate'), React.createElement('th', { style: styles.th }, 'Lab. Rate'), React.createElement('th', { style: styles.th }, 'Total (₹)')
          )),
          React.createElement('tbody', null,
            results.items.map((i: any, idx: number) => React.createElement('tr', { key: i.sr, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, i.sr), React.createElement('td', { style: styles.td }, i.code), React.createElement('td', { style: styles.td }, i.desc), React.createElement('td', { style: styles.td }, i.uom), React.createElement('td', { style: styles.td }, formatNumber(i.qty)), React.createElement('td', { style: styles.td }, formatNumber(i.matRate)), React.createElement('td', { style: styles.td }, formatNumber(i.labRate)), React.createElement('td', { style: styles.td }, formatNumber(i.amount))
            )),
            React.createElement('tr', { style: styles.totalRow }, React.createElement('td', { colSpan: 7, style: { padding: '10px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '10px' } }, `₹${formatNumber(results.grandTotal)}`))
          )
        )
      )
    )
  );
}
