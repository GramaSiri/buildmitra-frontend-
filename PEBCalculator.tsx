import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface Rate {
  _id: string;
  name: string;
  price: number;
  unit: string;
}

const PEBCalculator = () => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(false);
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // User inputs
  const [plotLength, setPlotLength] = useState(100);   // ft
  const [plotWidth, setPlotWidth] = useState(60);      // ft
  const [eaveHeight, setEaveHeight] = useState(12);    // ft
  const [roofSlope, setRoofSlope] = useState(1.5);     // in 10 (e.g. 1.5/10 = 0.15)
  const [hasOffice, setHasOffice] = useState(true);
  const [officeArea, setOfficeArea] = useState(200);    // sqft
  const [hasToilets, setHasToilets] = useState(true);
  const [hasPantry, setHasPantry] = useState(false);
  const [flooringType, setFlooringType] = useState<'ips' | 'tiles'>('ips');
  const [hasUGTank, setHasUGTank] = useState(true);
  const [quality, setQuality] = useState<'standard' | 'premium'>('standard');

  useEffect(() => {
    axios.get('http://localhost:5000/api/rates')
      .then(res => setRates(res.data))
      .catch(err => console.error('Failed to fetch rates', err));
  }, []);

  const getRate = (name: string, defaultVal: number): number => {
    const item = rates.find(r => r.name.toLowerCase().includes(name.toLowerCase()));
    return item ? item.price : defaultVal;
  };

  const calculate = () => {
    setLoading(true);
    setError(null);
    try {
      const areaSqft = plotLength * plotWidth;
      const qualityFactor = quality === 'standard' ? 1.0 : 1.2;
      const builtUpM2 = areaSqft * 0.092903;

      // ---------- 1. STRUCTURAL STEEL (Main frame + purlins + bracing) ----------
      let steelPerSqft = 3.5; // kg/sqft
      if (areaSqft > 5000) steelPerSqft = 4.0;
      if (areaSqft > 10000) steelPerSqft = 4.5;
      const steelKg = areaSqft * steelPerSqft * qualityFactor;
      const steelRate = getRate('PEB Steel (fabricated)', 85);
      const steelCost = steelKg * steelRate;

      // ---------- 2. ROOF SHEETING (GI colour coated) ----------
      const slopeFactor = Math.sqrt(1 + (roofSlope / 10) ** 2);
      const roofAreaSqft = areaSqft * slopeFactor;
      const sheetRate = getRate('GI Roof Sheet (0.5mm)', 45);
      const sheetCost = roofAreaSqft * sheetRate;
      const ridgeFlashing = roofAreaSqft * 2; // approximate extra cost

      // ---------- 3. FOUNDATION & PLINTH ----------
      // Column grid (spacing ~20 ft)
      const colsX = Math.ceil(plotLength / 20) + 1;
      const colsY = Math.ceil(plotWidth / 20) + 1;
      const numColumns = colsX * colsY;
      const footingSize = 4; // ft (cube)
      const footingVolCft = numColumns * (footingSize ** 3);
      const footingConcreteM3 = footingVolCft * 0.0283168;
      const steelInFoundationKg = footingConcreteM3 * 50;
      const excavationCft = footingVolCft * 1.2;
      const concreteRate = getRate('Concrete M20', 5400);
      const steelRateFix = getRate('Steel', 65);
      const excavationRate = getRate('Excavation', 50);
      const footingCost = footingConcreteM3 * concreteRate + steelInFoundationKg * steelRateFix + excavationCft * excavationRate;

      // Plinth beam
      const perimeter = 2 * (plotLength + plotWidth);
      const beamVolCft = perimeter * 1.5 * 1.5;
      const beamConcreteM3 = beamVolCft * 0.0283168;
      const beamSteelKg = beamConcreteM3 * 80;
      const beamCost = beamConcreteM3 * concreteRate + beamSteelKg * steelRateFix;

      // ---------- 4. BLOCK MASONRY (3 ft high all around) ----------
      const wallHeight = 3;
      const wallThickness = 0.75;
      const wallVolCft = perimeter * wallHeight * wallThickness;
      const blockVolCft = wallVolCft * 0.85;
      let blockCount = Math.ceil(blockVolCft / 0.847);
      const blockRate = getRate('AAC Block', 55);
      const blockCost = blockCount * blockRate;
      const mortarVolCft = wallVolCft - blockVolCft;
      const cementBags = mortarVolCft / 2.5;
      const sandCft = mortarVolCft * 1.2;
      const cementRate = getRate('cement', 400);
      const sandRate = getRate('sand', 55);
      const mortarCost = cementBags * cementRate + sandCft * sandRate;
      const blockMasonryCost = blockCost + mortarCost;

      // ---------- 5. INTERNAL PARTITIONS ----------
      let partitionAreaSqft = 0;
      if (hasOffice) partitionAreaSqft += officeArea;
      if (hasToilets) partitionAreaSqft += 100;
      if (hasPantry) partitionAreaSqft += 80;
      const partWallHeight = 9;
      const partVolCft = partitionAreaSqft * 0.5 * partWallHeight;
      const partBlockCount = Math.ceil(partVolCft / 0.847);
      const partBlockCost = partBlockCount * blockRate;
      const partMortarCft = partVolCft - (partBlockCount * 0.847);
      const partCement = partMortarCft / 2.5;
      const partSand = partMortarCft * 1.2;
      const partMortarCost = partCement * cementRate + partSand * sandRate;
      const partitionCost = partBlockCost + partMortarCost;

      // ---------- 6. FLOORING ----------
      let flooringSqft = areaSqft;
      let floorRate = 0;
      if (flooringType === 'ips') floorRate = getRate('IPS Flooring', 35);
      else floorRate = getRate('Vitrified Tiles', 55);
      const flooringCost = flooringSqft * floorRate;

      // ---------- 7. OPENINGS (Rolling shutter, GI windows) ----------
      const mainGateWidth = plotWidth * 0.3;
      const rollingShutterRate = getRate('Rolling Shutter (MS)', 180);
      const shutterCost = mainGateWidth * 12 * rollingShutterRate; // height 12ft

      const windowCount = Math.ceil(areaSqft / 500);
      const windowRate = getRate('GI Window (4x4 ft)', 4000);
      const windowsCost = windowCount * windowRate;

      const ventilatorCount = Math.ceil(areaSqft / 800);
      const ventilatorRate = getRate('Turbo Ventilator', 3500);
      const ventilatorsCost = ventilatorCount * ventilatorRate;

      // ---------- 8. UG TANK ----------
      let ugTankCost = 0;
      if (hasUGTank) {
        const tankLitres = Math.ceil(builtUpM2 * 50);
        const tankRate = getRate('UG Tank (per Litre)', 5);
        ugTankCost = tankLitres * tankRate;
      }

      // ---------- 9. ELECTRICAL & PLUMBING (rough estimate) ----------
      const electricalPoints = Math.ceil(areaSqft / 100);
      const electricalRate = getRate('Electrical Point', 500);
      const electricalCost = electricalPoints * electricalRate;

      const plumbingFixtures = (hasToilets ? 3 : 0) + (hasPantry ? 1 : 0);
      const plumbingRate = getRate('Plumbing Fixture', 800);
      const plumbingCost = plumbingFixtures * plumbingRate;

      // ---------- 10. LABOUR & OVERHEADS ----------
      const labourCost = (steelKg / 100) * 8000; // rough
      const miscCost = (steelCost + sheetCost + footingCost + beamCost + blockMasonryCost + partitionCost + flooringCost + shutterCost + windowsCost + ventilatorsCost + ugTankCost + electricalCost + plumbingCost + labourCost) * 0.05;

      // Build BOQ items array
      const items = [
        { desc: 'PEB Steel Structure (fabricated & erected)', qty: steelKg.toFixed(0), unit: 'kg', rate: steelRate, amount: steelCost },
        { desc: 'GI Colour Coated Roof Sheet (0.5mm)', qty: roofAreaSqft.toFixed(0), unit: 'sqft', rate: sheetRate, amount: sheetCost },
        { desc: 'Ridge, Flashing & Accessories', qty: 1, unit: 'LS', rate: ridgeFlashing, amount: ridgeFlashing },
        { desc: 'Footing Concrete (M20)', qty: footingConcreteM3.toFixed(2), unit: 'm³', rate: concreteRate, amount: footingConcreteM3 * concreteRate },
        { desc: 'Steel Reinforcement for Footings', qty: steelInFoundationKg.toFixed(0), unit: 'kg', rate: steelRateFix, amount: steelInFoundationKg * steelRateFix },
        { desc: 'Earthwork Excavation (footings)', qty: excavationCft.toFixed(0), unit: 'CFT', rate: excavationRate, amount: excavationCft * excavationRate },
        { desc: 'Plinth Beam Concrete (M20)', qty: beamConcreteM3.toFixed(2), unit: 'm³', rate: concreteRate, amount: beamConcreteM3 * concreteRate },
        { desc: 'Plinth Beam Steel', qty: beamSteelKg.toFixed(0), unit: 'kg', rate: steelRateFix, amount: beamSteelKg * steelRateFix },
        { desc: 'AAC Block Masonry (3 ft height – perimeter wall)', qty: blockCount, unit: 'pcs', rate: blockRate, amount: blockCost },
        { desc: 'Cement & Sand for Perimeter Wall Mortar', qty: 1, unit: 'LS', rate: 0, amount: mortarCost },
        { desc: 'Internal Partitions (AAC Blocks)', qty: partBlockCount, unit: 'pcs', rate: blockRate, amount: partBlockCost },
        { desc: 'Mortar for Partitions', qty: 1, unit: 'LS', rate: 0, amount: partMortarCost },
        { desc: `${flooringType === 'ips' ? 'IPS Flooring (4" thick)' : 'Vitrified Tile Flooring'}`, qty: flooringSqft.toFixed(0), unit: 'sqft', rate: floorRate, amount: flooringCost },
        { desc: 'Rolling Shutter (Main Gate)', qty: mainGateWidth.toFixed(1), unit: 'ft', rate: rollingShutterRate, amount: shutterCost },
        { desc: 'GI Windows (4×4 ft)', qty: windowCount, unit: 'Nos', rate: windowRate, amount: windowsCost },
        { desc: 'Turbo Ventilators', qty: ventilatorCount, unit: 'Nos', rate: ventilatorRate, amount: ventilatorsCost },
        { desc: 'UG Water Tank', qty: hasUGTank ? 1 : 0, unit: 'LS', rate: ugTankCost / (hasUGTank ? 1 : 1), amount: ugTankCost },
        { desc: 'Electrical Wiring & Points', qty: electricalPoints, unit: 'point', rate: electricalRate, amount: electricalCost },
        { desc: 'Plumbing & Sanitary Fixtures', qty: plumbingFixtures, unit: 'fixture', rate: plumbingRate, amount: plumbingCost },
        { desc: 'Labour & Erection Charges', qty: 1, unit: 'LS', rate: 0, amount: labourCost },
        { desc: 'Miscellaneous (5%)', qty: 1, unit: 'LS', rate: 0, amount: miscCost },
      ];

      const subtotal = items.reduce((s, i) => s + i.amount, 0);
      const total = subtotal;
      setBoqItems(items.map(i => ({ ...i, amount: Math.round(i.amount) })));
      setGrandTotal(Math.round(total));
    } catch (err) {
      console.error(err);
      setError('Calculation error. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const wsData = [['#', 'Description', 'Quantity', 'Unit', 'Rate (₹)', 'Amount (₹)']];
    boqItems.forEach((item, idx) => {
      wsData.push([idx+1, item.desc, item.qty, item.unit, item.rate, item.amount]);
    });
    wsData.push(['', '', '', '', 'Grand Total', grandTotal]);
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PEB Shed BOQ');
    XLSX.writeFile(wb, `peb_shed_boq_${Date.now()}.xlsx`);
  };

  const shareWhatsApp = () => {
    const text = `🏗️ PEB Shed Estimate\nTotal cost: ₹${grandTotal.toLocaleString()}\nDownload full report from BuildMitra.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-2xl font-extrabold text-blue-600 mb-2">🏭 PEB / Temporary Shed Calculator</h2>
        <p className="text-sm text-gray-500 mb-4">Pre‑engineered building – steel structure, roofing, foundation, block work, finishes</p>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div><label className="text-xs uppercase">Plot Length (ft)</label><input type="number" value={plotLength} onChange={e=>setPlotLength(+e.target.value)} className="border p-1 w-full" /></div>
          <div><label className="text-xs uppercase">Plot Width (ft)</label><input type="number" value={plotWidth} onChange={e=>setPlotWidth(+e.target.value)} className="border p-1 w-full" /></div>
          <div><label className="text-xs uppercase">Eave Height (ft)</label><input type="number" value={eaveHeight} onChange={e=>setEaveHeight(+e.target.value)} className="border p-1 w-full" /></div>
          <div><label className="text-xs uppercase">Roof Slope (in 10)</label><input type="number" step="0.5" value={roofSlope} onChange={e=>setRoofSlope(+e.target.value)} className="border p-1 w-full" /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={hasOffice} onChange={e=>setHasOffice(e.target.checked)} /> Office</div>
          {hasOffice && <div><label className="text-xs uppercase">Office Area (sqft)</label><input type="number" value={officeArea} onChange={e=>setOfficeArea(+e.target.value)} className="border p-1 w-full" /></div>}
          <div className="flex items-center gap-2"><input type="checkbox" checked={hasToilets} onChange={e=>setHasToilets(e.target.checked)} /> Toilets</div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={hasPantry} onChange={e=>setHasPantry(e.target.checked)} /> Pantry</div>
          <div><label className="text-xs uppercase">Flooring Type</label><select value={flooringType} onChange={e=>setFlooringType(e.target.value as any)} className="border p-1 w-full"><option value="ips">IPS (Indian Patent Stone)</option><option value="tiles">Vitrified Tiles</option></select></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={hasUGTank} onChange={e=>setHasUGTank(e.target.checked)} /> UG Tank</div>
          <div><label className="text-xs uppercase">Quality</label><select value={quality} onChange={e=>setQuality(e.target.value as any)} className="border p-1 w-full"><option value="standard">Standard</option><option value="premium">Premium</option></select></div>
        </div>
        <button onClick={calculate} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">{loading ? 'Calculating...' : 'Calculate PEB Shed BOQ'}</button>
      </div>

      {boqItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
            <div><h3 className="text-xl font-bold">📋 PEB Shed Bill of Quantities</h3><p className="text-sm text-gray-500">Area: {plotLength*plotWidth} sqft</p></div>
            <div className="flex gap-2">
              <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1 rounded text-sm">📊 Excel</button>
              <button onClick={shareWhatsApp} className="bg-green-500 text-white px-3 py-1 rounded text-sm">💬 WhatsApp</button>
            </div>
          </div>
          <div className="overflow-x-auto p-4 max-h-[600px]">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr><th className="p-2">#</th><th className="p-2 text-left">Description</th><th className="p-2 text-right">Quantity</th><th className="p-2">Unit</th><th className="p-2 text-right">Rate (₹)</th><th className="p-2 text-right">Amount (₹)</th></tr>
              </thead>
              <tbody>
                {boqItems.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 text-center">{idx+1}</td>
                    <td className="p-2">{item.desc}</td>
                    <td className="p-2 text-right">{item.qty.toLocaleString()}</td>
                    <td className="p-2">{item.unit}</td>
                    <td className="p-2 text-right">{item.rate.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={5} className="p-2 text-right">Grand Total</td>
                  <td className="p-2 text-right">₹{grandTotal.toLocaleString()}</td>
                </table>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PEBCalculator;
'@ | Set-Content -Path src/PEBCalculator.tsx -Encoding utf8

Write-Host "✅ PEBCalculator.tsx created. Add route and navigation link to see it in action." -ForegroundColor Green