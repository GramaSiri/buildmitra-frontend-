import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#00bcd4', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#00bcd4', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
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
  th: { backgroundColor: '#00bcd4', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  rateInfo: { backgroundColor: '#e8f4f8', padding: '6px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', marginBottom: '10px', color: '#555' }
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Flooring Types with rate keys (from Admin Panel)
const flooringTypes = {
  'Vitrified Tiles': { rateKey: 'vitrifiedTile', defaultRate: 45, unit: 'sqft', skirtingRate: 35 },
  'Granite': { rateKey: 'granite', defaultRate: 120, unit: 'sqft', skirtingRate: 80 },
  'Marble': { rateKey: 'marble', defaultRate: 150, unit: 'sqft', skirtingRate: 100 },
  'Ceramic Tiles': { rateKey: 'ceramicTile', defaultRate: 35, unit: 'sqft', skirtingRate: 25 },
  'IPS': { rateKey: 'ips', defaultRate: 55, unit: 'sqft', skirtingRate: 40 },
  'Wooden Flooring': { rateKey: 'wooden', defaultRate: 200, unit: 'sqft', skirtingRate: 150 },
  'Cladding Tiles': { rateKey: 'cladding', defaultRate: 80, unit: 'sqft', skirtingRate: 0 }
};

// Tile sizes commonly available in India
const commonFloorTileSizes = [
  '8x8', '10x10', '12x12', '16x16', '18x18',
  '24x24', '24x48', '24x60', '32x32', '36x36',
  '48x48', '48x96', '60x60', '80x80', '120x120'
];

const commonWallTileSizes = [
  '8x12', '10x15', '12x18', '12x24', '12x36',
  '12x48', '18x24', '24x48', '24x60'
];

const tileSizes = {
  'Vitrified Tiles': commonFloorTileSizes,
  'Granite': ['12x12', '18x18', '24x24', '24x48', '24x60', '32x32', '36x36', '48x48', '48x96'],
  'Marble': ['12x12', '18x18', '24x24', '24x48', '24x60', '32x32', '36x36', '48x48', '48x96'],
  'Ceramic Tiles': [...commonWallTileSizes, ...commonFloorTileSizes],
  'IPS': ['Cast in situ'],
  'Wooden Flooring': ['Planks 4x36', 'Planks 6x36', 'Planks 8x48', 'Planks 9x48', 'Planks 9x60'],
  'Cladding Tiles': ['4x12', '6x12', '6x24', '8x24', '8x48', '12x12', '12x18', '12x24', '12x36', '12x48', '18x24', '24x48', '24x60']
};

const roomTypesList = ['Living Room', 'Bed Room', 'Kitchen', 'Balcony', 'Dining Room', 'Pooja Room', 'Study Room', 'Office Room', 'Toilet'];

// Get tiles per sqft
const getTilesPerSqft = (tileSize) => {
  if (tileSize === 'Cast in situ') return 1;
  const size = tileSize.split('x');
  const lengthInch = parseFloat(size[0]);
  const widthInch = parseFloat(size[1]);
  const tileAreaSqft = (lengthInch * widthInch) / 144;
  return 1 / tileAreaSqft;
};

export default function TilesPage() {
  const router = useRouter();
  const { rates, loading } = useRates();
  
  // Rooms List
  const [rooms, setRooms] = useState([
    { id: 1, type: 'Living Room', length: 15, width: 12, nos: 1, area: 180, flooringType: 'Vitrified Tiles', tileSize: '12x12', includeSkirting: true }
  ]);
  
  const [newRoom, setNewRoom] = useState({
    type: 'Living Room',
    length: 12,
    width: 10,
    nos: 1,
    flooringType: 'Vitrified Tiles',
    tileSize: '12x12',
    includeSkirting: true
  });
  
  // Cladding Areas
  const [claddings, setCladdings] = useState([]);
  const [claddingLength, setCladdingLength] = useState(10);
  const [claddingWidth, setCladdingWidth] = useState(0);
  const [claddingHeight, setCladdingHeight] = useState(8);
  const [claddingNos, setCladdingNos] = useState(1);
  const [claddingType, setCladdingType] = useState('Cladding Tiles');
  const [claddingTileSize, setCladdingTileSize] = useState('12x12');
  
  // Mortar Details
  const [mortarThickness, setMortarThickness] = useState(1.5);
  const [mortarRatio, setMortarRatio] = useState('1:4');
  const [wastage, setWastage] = useState(5);
  
  const [results, setResults] = useState(null);
  const [generated, setGenerated] = useState(false);
  
  const labourRate = rates?.labour_tiles || 15;
  const cementRate = rates?.cement || 400;
  const sandRate = rates?.sand || 55;

  const getTileRate = (flooringType) => {
    const info = flooringTypes[flooringType];
    return rates?.[info.rateKey] || info.defaultRate;
  };

  const addRoom = () => {
    if (newRoom.length > 0 && newRoom.width > 0 && newRoom.nos > 0) {
      const area = newRoom.length * newRoom.width * newRoom.nos;
      setRooms([...rooms, { 
        id: Date.now(),
        type: newRoom.type,
        length: newRoom.length,
        width: newRoom.width,
        nos: newRoom.nos,
        area: area,
        flooringType: newRoom.flooringType,
        tileSize: newRoom.tileSize,
        includeSkirting: newRoom.includeSkirting
      }]);
    }
  };

  const removeRoom = (id) => {
    setRooms(rooms.filter(room => room.id !== id));
  };

  const updateRoom = (id, field, value) => {
    setRooms(rooms.map(room => {
      if (room.id === id) {
        const updatedRoom = { ...room, [field]: value };
        if (field === 'length' || field === 'width' || field === 'nos') {
          updatedRoom.area = updatedRoom.length * updatedRoom.width * updatedRoom.nos;
        }
        if (field === 'flooringType') {
          updatedRoom.tileSize = tileSizes[value]?.[0] || '12x12';
        }
        return updatedRoom;
      }
      return room;
    }));
  };

  const addCladding = () => {
    if (claddingLength > 0 && claddingHeight > 0 && claddingNos > 0) {
      let area = 0;
      if (claddingWidth > 0) {
        area = claddingLength * claddingWidth * claddingHeight * claddingNos;
      } else {
        area = claddingLength * claddingHeight * claddingNos;
      }
      setCladdings([...claddings, { 
        id: Date.now(),
        length: claddingLength,
        width: claddingWidth,
        height: claddingHeight,
        nos: claddingNos,
        area: area,
        type: claddingType,
        tileSize: claddingTileSize
      }]);
      setCladdingLength(10);
      setCladdingWidth(0);
      setCladdingHeight(8);
      setCladdingNos(1);
    }
  };

  const removeCladding = (id) => {
    setCladdings(claddings.filter(c => c.id !== id));
  };

  const calculateToiletWallArea = (length, width, height, nos, doorDeductionPerToilet = 15) => {
    const wallAreaPerToilet = 2 * (length + width) * height;
    const netWallAreaPerToilet = Math.max(0, wallAreaPerToilet - doorDeductionPerToilet);
    return netWallAreaPerToilet * nos;
  };

  const calculateResults = () => {
    let totalFloorArea = 0;
    let totalSkirtingArea = 0;
    let totalToiletArea = 0;
    let totalTileCost = 0;
    let roomDetails = [];
    
    // Calculate each room
    rooms.forEach(room => {
      const isToilet = room.type === 'Toilet';
      let floorArea = room.area;
      let skirtingArea = 0;
      let toiletWallArea = 0;
      let roomTileCost = 0;
      
      const tileRate = getTileRate(room.flooringType);
      const tilesPerSqft = getTilesPerSqft(room.tileSize);
      
      if (isToilet) {
        toiletWallArea = calculateToiletWallArea(room.length, room.width, 7, room.nos, 15);
        floorArea = room.length * room.width * room.nos;
        totalToiletArea += toiletWallArea;
        const toiletTileArea = floorArea + toiletWallArea;
        roomTileCost = toiletTileArea * tileRate * (1 + wastage / 100);
      } else {
        roomTileCost = floorArea * tileRate * (1 + wastage / 100);
        
        if (room.includeSkirting) {
          const perimeter = 2 * (room.length + room.width);
          const skirtingLength = (perimeter - 3) * room.nos;
          skirtingArea = (skirtingLength * 4) / 12;
          roomTileCost += skirtingArea * tileRate * (1 + wastage / 100);
          totalSkirtingArea += skirtingArea;
        }
      }
      
      totalFloorArea += floorArea;
      totalTileCost += roomTileCost;
      
      roomDetails.push({
        type: room.type,
        area: floorArea,
        flooringType: room.flooringType,
        tileSize: room.tileSize,
        tileRate: tileRate,
        roomTileCost: roomTileCost,
        skirtingArea: skirtingArea,
        isToilet: isToilet,
        toiletWallArea: toiletWallArea
      });
    });
    
    // Calculate Cladding
    let totalCladdingArea = 0;
    let claddingDetails = [];
    claddings.forEach(clad => {
      const tileRate = getTileRate(clad.type);
      const tilesPerSqft = getTilesPerSqft(clad.tileSize);
      const tilesRequired = clad.area * tilesPerSqft * (1 + wastage/100);
      const claddingCost = clad.area * tileRate * (1 + wastage / 100);
      totalCladdingArea += clad.area;
      totalTileCost += claddingCost;
      claddingDetails.push({
        area: clad.area,
        type: clad.type,
        tileSize: clad.tileSize,
        tiles: tilesRequired,
        tileRate: tileRate,
        cost: claddingCost
      });
    });
    
    // Mortar Calculation for total area
    const totalAreaForMortar = totalFloorArea + totalSkirtingArea + totalCladdingArea + totalToiletArea;
    const mortarVolumeCft = totalAreaForMortar * (mortarThickness / 12);
    const mortarVolumeCum = mortarVolumeCft / 35.315;
    
    let cementBags = 0, sandCft = 0;
    if (mortarRatio === '1:3') {
      cementBags = mortarVolumeCum * 10.8;
      sandCft = mortarVolumeCum * 0.9 * 35.315;
    } else if (mortarRatio === '1:4') {
      cementBags = mortarVolumeCum * 8.5;
      sandCft = mortarVolumeCum * 0.95 * 35.315;
    } else if (mortarRatio === '1:5') {
      cementBags = mortarVolumeCum * 7.2;
      sandCft = mortarVolumeCum * 1.0 * 35.315;
    } else {
      cementBags = mortarVolumeCum * 6.2;
      sandCft = mortarVolumeCum * 1.05 * 35.315;
    }
    
    const cementCost = cementBags * cementRate;
    const sandCost = sandCft * sandRate;
    const labourCost = (totalFloorArea + totalSkirtingArea + totalCladdingArea + totalToiletArea) * labourRate;
    
    const materialTotal = totalTileCost + cementCost + sandCost;
    const grandTotal = materialTotal + labourCost;
    
    return {
      rooms: roomDetails,
      claddings: claddingDetails,
      totals: {
        floorArea: formatNumber(totalFloorArea),
        skirtingArea: formatNumber(totalSkirtingArea),
        claddingArea: formatNumber(totalCladdingArea),
        toiletArea: formatNumber(totalToiletArea),
        totalArea: formatNumber(totalFloorArea + totalSkirtingArea + totalCladdingArea + totalToiletArea)
      },
      materials: {
        cement: formatNumber(cementBags),
        sand: formatNumber(sandCft)
      },
      costs: {
        tiles: formatNumber(totalTileCost),
        cement: formatNumber(cementCost),
        sand: formatNumber(sandCost),
        material: formatNumber(materialTotal),
        labour: formatNumber(labourCost),
        grandTotal: formatNumber(grandTotal)
      }
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
      ...results.rooms.map(r => ({ Item: `${r.type} - ${r.flooringType} (${r.tileSize})`, Quantity: formatNumber(r.area), Unit: 'sqft', Cost: `₹${formatNumber(r.roomTileCost)}` })),
      ...results.rooms.filter(r => r.skirtingArea > 0).map(r => ({ Item: `${r.type} - Skirting (4")`, Quantity: formatNumber(r.skirtingArea), Unit: 'sqft', Cost: '-' })),
      ...results.claddings.map(c => ({ Item: `${c.type} - Cladding (${c.tileSize})`, Quantity: formatNumber(c.area), Unit: 'sqft', Cost: `₹${formatNumber(c.cost)}` })),
      { Item: 'Toilet (Floor + Walls)', Quantity: results.totals.toiletArea, Unit: 'sqft', Cost: '-' },
      { Item: 'Cement', Quantity: results.materials.cement, Unit: 'bags', Cost: `₹${results.costs.cement}` },
      { Item: 'Sand', Quantity: results.materials.sand, Unit: 'CFT', Cost: `₹${results.costs.sand}` },
      { Item: 'Material Total', Quantity: '', Unit: '', Cost: `₹${results.costs.material}` },
      { Item: 'Labour', Quantity: results.totals.totalArea, Unit: 'sqft', Cost: `₹${results.costs.labour}` },
      { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Cost: `₹${results.costs.grandTotal}` }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Flooring');
    XLSX.writeFile(wb, `Flooring_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🔲 FLOORING CALCULATION\n\nFloor Area: ${results.totals.floorArea} sqft\nTile Cost: ₹${results.costs.tiles}\nCement: ${results.materials.cement} bags\nSand: ${results.materials.sand} CFT\nTotal Cost: ₹${results.costs.grandTotal}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading rates...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '🔲 Flooring & Tiles Calculator')
    ),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Labour: ₹${labourRate}/sqft | Cement ₹${cementRate}/bag | Sand ₹${sandRate}/CFT`),
      React.createElement('div', null, React.createElement('small', null, `Tile rates from Admin Panel`))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🏠 Rooms'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Room Type'), React.createElement('select', { value: newRoom.type, onChange: (e) => setNewRoom({ ...newRoom, type: e.target.value }), style: styles.select },
        roomTypesList.map(type => React.createElement('option', { key: type, value: type }, type)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length (ft)'), React.createElement('input', { type: 'number', value: newRoom.length, onChange: (e) => setNewRoom({ ...newRoom, length: parseFloat(e.target.value) }), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (ft)'), React.createElement('input', { type: 'number', value: newRoom.width, onChange: (e) => setNewRoom({ ...newRoom, width: parseFloat(e.target.value) }), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Nos'), React.createElement('input', { type: 'number', value: newRoom.nos, onChange: (e) => setNewRoom({ ...newRoom, nos: parseFloat(e.target.value) }), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Flooring'), React.createElement('select', { value: newRoom.flooringType, onChange: (e) => setNewRoom({ ...newRoom, flooringType: e.target.value }), style: styles.select },
        Object.keys(flooringTypes).filter(f => f !== 'Cladding Tiles').map(type => React.createElement('option', { key: type, value: type }, `${type} (₹${getTileRate(type)}/sqft)`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Tile Size'), React.createElement('select', { value: newRoom.tileSize, onChange: (e) => setNewRoom({ ...newRoom, tileSize: e.target.value }), style: styles.select },
        tileSizes[newRoom.flooringType]?.map(size => React.createElement('option', { key: size, value: size }, size)) || []))
    ),
    
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Skirting'), React.createElement('select', { value: newRoom.includeSkirting, onChange: (e) => setNewRoom({ ...newRoom, includeSkirting: e.target.value === 'true' }), style: styles.select },
        React.createElement('option', { value: 'true' }, 'Yes (4")'), React.createElement('option', { value: 'false' }, 'No'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Area'), React.createElement('div', { style: { ...styles.input, backgroundColor: '#e8f4f8' } }, `${(newRoom.length * newRoom.width * newRoom.nos).toFixed(2)} sqft`)),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Tile Cost'), React.createElement('div', { style: { ...styles.input, backgroundColor: '#e8f4f8' } }, `₹${((newRoom.length * newRoom.width * newRoom.nos) * getTileRate(newRoom.flooringType)).toFixed(2)}`)),
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end' } }, React.createElement('button', { onClick: addRoom, style: styles.buttonSmall }, '+ Add Room'))
    ),
    
    rooms.length > 0 && React.createElement('div', { style: styles.tableContainer },
      React.createElement('table', { style: styles.table },
        React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Type'), React.createElement('th', { style: styles.th }, 'Size'), React.createElement('th', { style: styles.th }, 'Nos'), React.createElement('th', { style: styles.th }, 'Area'), React.createElement('th', { style: styles.th }, 'Tile Cost'), React.createElement('th', { style: styles.th }, ''))),
        React.createElement('tbody', null,
          rooms.map(room => React.createElement('tr', { key: room.id, style: styles.evenRow },
            React.createElement('td', { style: styles.td }, React.createElement('select', { value: room.type, onChange: (e) => updateRoom(room.id, 'type', e.target.value), style: styles.input },
              roomTypesList.map(t => React.createElement('option', { key: t, value: t }, t)))),
            React.createElement('td', { style: styles.td }, `${room.length}' x ${room.width}'`),
            React.createElement('td', { style: styles.td }, React.createElement('input', { type: 'number', value: room.nos, onChange: (e) => updateRoom(room.id, 'nos', parseFloat(e.target.value)), style: { ...styles.input, width: '60px' } })),
            React.createElement('td', { style: styles.td }, formatNumber(room.area)),
            React.createElement('td', { style: styles.td }, `₹${formatNumber(room.area * getTileRate(room.flooringType))}`),
            React.createElement('td', { style: styles.td }, React.createElement('button', { onClick: () => removeRoom(room.id), style: { ...styles.buttonSmall, backgroundColor: '#dc3545' } }, 'X'))))
        )
      )
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🎨 Cladding / Feature Walls'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length (ft)'), React.createElement('input', { type: 'number', value: claddingLength, onChange: (e) => setCladdingLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width (ft)'), React.createElement('input', { type: 'number', value: claddingWidth, onChange: (e) => setCladdingWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Height (ft)'), React.createElement('input', { type: 'number', value: claddingHeight, onChange: (e) => setCladdingHeight(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Nos'), React.createElement('input', { type: 'number', value: claddingNos, onChange: (e) => setCladdingNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Tile Type'), React.createElement('select', { value: claddingType, onChange: (e) => setCladdingType(e.target.value), style: styles.select },
        Object.keys(flooringTypes).map(type => React.createElement('option', { key: type, value: type }, `${type} (₹${getTileRate(type)}/sqft)`)))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Tile Size'), React.createElement('select', { value: claddingTileSize, onChange: (e) => setCladdingTileSize(e.target.value), style: styles.select },
        tileSizes[claddingType]?.map(size => React.createElement('option', { key: size, value: size }, size)) || []))
    ),
    
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Area'), React.createElement('div', { style: { ...styles.input, backgroundColor: '#e8f4f8' } }, `${(claddingWidth > 0 ? claddingLength * claddingWidth * claddingHeight * claddingNos : claddingLength * claddingHeight * claddingNos).toFixed(2)} sqft`)),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Tile Cost'), React.createElement('div', { style: { ...styles.input, backgroundColor: '#e8f4f8' } }, `₹${((claddingWidth > 0 ? claddingLength * claddingWidth * claddingHeight * claddingNos : claddingLength * claddingHeight * claddingNos) * getTileRate(claddingType)).toFixed(2)}`)),
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end' } }, React.createElement('button', { onClick: addCladding, style: styles.buttonSmall }, '+ Add Cladding'))
    ),
    
    claddings.length > 0 && React.createElement('div', { style: styles.tableContainer },
      React.createElement('table', { style: styles.table },
        React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Dimensions'), React.createElement('th', { style: styles.th }, 'Area'), React.createElement('th', { style: styles.th }, 'Tile Type'), React.createElement('th', { style: styles.th }, 'Tile Cost'), React.createElement('th', { style: styles.th }, ''))),
        React.createElement('tbody', null,
          claddings.map(clad => React.createElement('tr', { key: clad.id, style: styles.evenRow },
            React.createElement('td', { style: styles.td }, clad.width > 0 ? `${clad.length}' x ${clad.width}' x ${clad.height}'` : `${clad.length}' x ${clad.height}'`),
            React.createElement('td', { style: styles.td }, formatNumber(clad.area)),
            React.createElement('td', { style: styles.td }, clad.type),
            React.createElement('td', { style: styles.td }, `₹${formatNumber(clad.area * getTileRate(clad.type) * (1 + wastage / 100))}`),
            React.createElement('td', { style: styles.td }, React.createElement('button', { onClick: () => removeCladding(clad.id), style: { ...styles.buttonSmall, backgroundColor: '#dc3545' } }, 'X'))))
        )
      )
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '🧱 Mortar Details'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Thickness (in)'), React.createElement('input', { type: 'number', value: mortarThickness, onChange: (e) => setMortarThickness(parseFloat(e.target.value)), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Ratio'), React.createElement('select', { value: mortarRatio, onChange: (e) => setMortarRatio(e.target.value), style: styles.select },
        React.createElement('option', { value: '1:3' }, '1:3'), React.createElement('option', { value: '1:4' }, '1:4'),
        React.createElement('option', { value: '1:5' }, '1:5'), React.createElement('option', { value: '1:6' }, '1:6'))),
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
        React.createElement('div', { style: { ...styles.card, ...styles.cardBlue } }, React.createElement('div', null, '🏠'), React.createElement('div', null, 'Floor Area'), React.createElement('div', { style: styles.cardValue }, `${results.totals.floorArea} sqft`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightGreen } }, React.createElement('div', null, '🎨'), React.createElement('div', null, 'Tile Cost'), React.createElement('div', { style: styles.cardValue }, `₹${results.costs.tiles}`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightOrange } }, React.createElement('div', null, '🪣'), React.createElement('div', null, 'Cement'), React.createElement('div', { style: styles.cardValue }, `${results.materials.cement} bags`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightTeal } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Total Cost'), React.createElement('div', { style: styles.cardValue }, `₹${results.costs.grandTotal}`))
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Item'), React.createElement('th', { style: styles.th }, 'Quantity'), React.createElement('th', { style: styles.th }, 'Unit'), React.createElement('th', { style: styles.th }, 'Cost'))),
          React.createElement('tbody', null,
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 4, style: styles.td }, 'ROOM WISE FLOORING')),
            ...results.rooms.map((room, idx) => [
              React.createElement('tr', { key: `${idx}-floor`, style: idx % 2 === 0 ? {} : styles.evenRow },
                React.createElement('td', { style: styles.td }, `${room.type} - ${room.flooringType} (${room.tileSize})`),
                React.createElement('td', { style: styles.td }, formatNumber(room.area)),
                React.createElement('td', { style: styles.td }, 'sqft'),
                React.createElement('td', { style: styles.td }, `₹${formatNumber(room.roomTileCost)}`)),
              room.skirtingArea > 0 && React.createElement('tr', { key: `${idx}-skirt`, style: idx % 2 === 0 ? styles.evenRow : {} },
                React.createElement('td', { style: styles.td }, `${room.type} - Skirting (4")`),
                React.createElement('td', { style: styles.td }, formatNumber(room.skirtingArea)),
                React.createElement('td', { style: styles.td }, 'sqft'),
                React.createElement('td', { style: styles.td }, '-'))
            ]).flat(),
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 4, style: styles.td }, 'CLADDING / FEATURE WALLS')),
            ...results.claddings.map((clad, idx) => React.createElement('tr', { key: `clad-${idx}`, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement('td', { style: styles.td }, `${clad.type} - Cladding (${clad.tileSize})`),
              React.createElement('td', { style: styles.td }, formatNumber(clad.area)),
              React.createElement('td', { style: styles.td }, 'sqft'),
              React.createElement('td', { style: styles.td }, `₹${formatNumber(clad.cost)}`))),
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 4, style: styles.td }, 'TOILET')),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Toilet Wall Cladding'), React.createElement('td', { style: styles.td }, results.totals.toiletArea), React.createElement('td', { style: styles.td }, 'sqft'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 4, style: styles.td }, 'MATERIALS')),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Cement'), React.createElement('td', { style: styles.td }, results.materials.cement), React.createElement('td', { style: styles.td }, 'bags'), React.createElement('td', { style: styles.td }, `₹${results.costs.cement}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Sand'), React.createElement('td', { style: styles.td }, results.materials.sand), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, `₹${results.costs.sand}`)),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Material Total'), React.createElement('td', { style: styles.td }, ''), React.createElement('td', { style: styles.td }, ''), React.createElement('td', { style: styles.td }, `₹${results.costs.material}`)),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Labour'), React.createElement('td', { style: styles.td }, results.totals.totalArea), React.createElement('td', { style: styles.td }, 'sqft'), React.createElement('td', { style: styles.td }, `₹${results.costs.labour}`)),
            React.createElement('tr', { style: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 3, style: { padding: '8px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '8px' } }, `₹${results.costs.grandTotal}`))
          )
        )
      )
    )
  );
}









