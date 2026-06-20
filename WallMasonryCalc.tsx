import React, { useState } from 'react';

// Block data: name, length (inches), height (inches), thickness (inches), coverage per block (sqft)
const blockData = {
  'concrete6': { name: 'Concrete Block 6"', l: 16, h: 8, thickness: 6, area: (16*8)/144, mortarFactor: 0.15 },
  'concrete8': { name: 'Concrete Block 8"', l: 16, h: 8, thickness: 8, area: (16*8)/144, mortarFactor: 0.18 },
  'aac': { name: 'AAC Block (24"x8"x8")', l: 24, h: 8, thickness: 8, area: (24*8)/144, mortarFactor: 0.12 },
  'interlock': { name: 'Interlock Block (12"x4"x6")', l: 12, h: 4, thickness: 6, area: (12*4)/144, mortarFactor: 0.2 },
  'clay': { name: 'Clay Red Brick (9"x4"x3")', l: 9, h: 3, thickness: 4, area: (9*3)/144, mortarFactor: 0.25 },
};

const WallMasonryCalc = () => {
  const [plotLength, setPlotLength] = useState(40);
  const [plotWidth, setPlotWidth] = useState(30);
  const [floors, setFloors] = useState(2);
  const [wallHeight, setWallHeight] = useState(10);
  const [externalWallType, setExternalWallType] = useState('concrete6');
  const [internalWallType, setInternalWallType] = useState('concrete4');
  const [doorCount, setDoorCount] = useState(4);
  const [windowCount, setWindowCount] = useState(6);
  const [doorArea, setDoorArea] = useState(21);   // sqft (7x3)
  const [windowArea, setWindowArea] = useState(12); // sqft (4x3)
  const [results, setResults] = useState(null);

  const calculate = () => {
    // External wall perimeter
    const externalPerimeter = 2 * (plotLength + plotWidth);
    const internalWallLength = externalPerimeter * 0.7 * floors; // approx internal wall length (70% of external)
    const totalWallLength = externalPerimeter * floors + internalWallLength;

    // Deductions for doors and windows
    const totalDeductions = (doorCount * doorArea + windowCount * windowArea) * floors;
    const netWallArea = (totalWallLength * wallHeight) - totalDeductions;

    // External blocks
    const extBlock = blockData[externalWallType];
    const extBlockQty = Math.ceil((netWallArea * 0.7) / extBlock.area) * 1.05; // 70% of wall area is external
    // Internal blocks (4" thick) – use same block type but 4" thickness (we approximate)
    const intBlock = { ...blockData[internalWallType], area: blockData[internalWallType].area };
    const intBlockQty = Math.ceil((netWallArea * 0.3) / intBlock.area) * 1.05;
    const totalBlockQty = Math.ceil(extBlockQty + intBlockQty);

    // Mortar volume (per block)
    const mortarCftPerBlock = (extBlock.mortarFactor + intBlock.mortarFactor) / 2;
    const totalMortarCft = totalBlockQty * mortarCftPerBlock;
    const cementBags = Math.ceil(totalMortarCft * 0.45); // 1 bag cement per 2.2 cft of mortar
    const sandCft = totalMortarCft * 1.2;
    const waterLtr = cementBags * 20;

    // Cill concrete (4"x4" beam at every 1m of wall length)
    const cillLengthTotal = totalWallLength / 3.28; // convert ft to m (approx)
    const cillConcreteCft = cillLengthTotal * (4/12) * (4/12); // cubic ft
    const cillSteelLength = cillLengthTotal * 2 * 3.28; // m to ft → two rods of 8mm
    const cillSteelKg = (8*8/162) * cillSteelLength; // 8mm rod weight per m = 0.395 kg

    setResults({
      extBlockType: extBlock.name,
      extBlockQty: Math.ceil(extBlockQty),
      intBlockType: intBlock.name,
      intBlockQty: Math.ceil(intBlockQty),
      totalBlocks: totalBlockQty,
      cementBags,
      sandCft: sandCft.toFixed(1),
      waterLtr: waterLtr.toFixed(0),
      cillConcreteCft: cillConcreteCft.toFixed(1),
      cillSteelKg: cillSteelKg.toFixed(1),
      totalWallLength: totalWallLength.toFixed(0),
      netWallArea: netWallArea.toFixed(0),
    });
  };

  const exportCSV = () => {
    if (!results) return;
    const rows = [
      ['Item', 'Quantity', 'Unit'],
      ['External Blocks', results.extBlockQty, 'nos'],
      ['Internal Blocks', results.intBlockQty, 'nos'],
      ['Total Blocks', results.totalBlocks, 'nos'],
      ['Cement (OPC 53)', results.cementBags, 'bags'],
      ['M Sand', results.sandCft, 'cft'],
      ['Water', results.waterLtr, 'litres'],
      ['Cill Concrete (4"x4")', results.cillConcreteCft, 'cft'],
      ['Cill Steel (8mm rods)', results.cillSteelKg, 'kg'],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wall_masonry_boq.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareWhatsApp = () => {
    if (!results) return;
    const msg = `🧱 Wall Masonry Estimate%0ATotal Blocks: ${results.totalBlocks} nos%0ACement: ${results.cementBags} bags%0ASand: ${results.sandCft} cft%0ATotal Cost: ₹${(results.cementBags*380 + results.sandCft*40).toLocaleString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-4">🧱 Wall Masonry Calculator (Blocks & Mortar)</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div><label>Plot Length (ft)</label><input type="number" value={plotLength} onChange={e=>setPlotLength(+e.target.value)} className="input-field w-full" /></div>
        <div><label>Plot Width (ft)</label><input type="number" value={plotWidth} onChange={e=>setPlotWidth(+e.target.value)} className="input-field w-full" /></div>
        <div><label>Floors</label><input type="number" value={floors} onChange={e=>setFloors(+e.target.value)} className="input-field w-full" /></div>
        <div><label>Wall Height (ft)</label><input type="number" value={wallHeight} onChange={e=>setWallHeight(+e.target.value)} className="input-field w-full" /></div>
        <div><label>External Wall Type</label><select value={externalWallType} onChange={e=>setExternalWallType(e.target.value)} className="input-field w-full">
          <option value="concrete6">Concrete Block 6"</option><option value="concrete8">Concrete Block 8"</option>
          <option value="aac">AAC Block 8"</option><option value="interlock">Interlock Block 6"</option>
          <option value="clay">Clay Red Brick 4"</option>
        </select></div>
        <div><label>Internal Wall Type</label><select value={internalWallType} onChange={e=>setInternalWallType(e.target.value)} className="input-field w-full">
          <option value="concrete6">Concrete Block 6"</option><option value="concrete8">Concrete Block 8"</option>
          <option value="aac">AAC Block 8"</option><option value="interlock">Interlock Block 6"</option>
          <option value="clay">Clay Red Brick 4"</option>
        </select></div>
        <div><label>No. of Doors</label><input type="number" value={doorCount} onChange={e=>setDoorCount(+e.target.value)} className="input-field w-full" /></div>
        <div><label>No. of Windows</label><input type="number" value={windowCount} onChange={e=>setWindowCount(+e.target.value)} className="input-field w-full" /></div>
        <div><label>Door Area (sqft)</label><input type="number" value={doorArea} onChange={e=>setDoorArea(+e.target.value)} className="input-field w-full" /></div>
        <div><label>Window Area (sqft)</label><input type="number" value={windowArea} onChange={e=>setWindowArea(+e.target.value)} className="input-field w-full" /></div>
      </div>
      <button onClick={calculate} className="bg-emerald-600 text-white px-5 py-2 rounded-xl">📊 Calculate</button>
      {results && (
        <div className="mt-6">
          <div className="flex gap-3 mb-4">
            <button onClick={exportCSV} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">📎 Export CSV</button>
            <button onClick={shareWhatsApp} className="bg-green-500 text-white px-3 py-1 rounded text-sm">📱 WhatsApp</button>
            <button onClick={()=>window.print()} className="bg-purple-600 text-white px-3 py-1 rounded text-sm">🖨️ Print</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead className="bg-gray-100">
                <tr><th className="p-2 border">Item</th><th className="p-2 border">Quantity</th><th className="p-2 border">Unit</th><th className="p-2 border">Rate (₹)</th><th className="p-2 border">Amount (₹)</th></tr>
              </thead>
              <tbody>
                <tr><td className="p-2 border">{results.extBlockType}</td><td className="p-2 border">{results.extBlockQty}</td><td className="p-2 border">nos</td><td className="p-2 border">45</td><td className="p-2 border">{results.extBlockQty*45}</td></tr>
                <tr><td className="p-2 border">{results.intBlockType}</td><td className="p-2 border">{results.intBlockQty}</td><td className="p-2 border">nos</td><td className="p-2 border">40</td><td className="p-2 border">{results.intBlockQty*40}</td></tr>
                <tr><td className="p-2 border">Cement (OPC 53)</td><td className="p-2 border">{results.cementBags}</td><td className="p-2 border">bags</td><td className="p-2 border">380</td><td className="p-2 border">{results.cementBags*380}</td></tr>
                <tr><td className="p-2 border">M Sand</td><td className="p-2 border">{results.sandCft}</td><td className="p-2 border">cft</td><td className="p-2 border">40</td><td className="p-2 border">{results.sandCft*40}</td></tr>
                <tr><td className="p-2 border">Water (approx)</td><td className="p-2 border">{results.waterLtr}</td><td className="p-2 border">litres</td><td className="p-2 border">0</td><td className="p-2 border">0</td></tr>
                <tr><td className="p-2 border">Cill Concrete (4"x4")</td><td className="p-2 border">{results.cillConcreteCft}</td><td className="p-2 border">cft</td><td className="p-2 border">4500</td><td className="p-2 border">{results.cillConcreteCft*4500}</td></tr>
                <tr><td className="p-2 border">Cill Steel (8mm rods)</td><td className="p-2 border">{results.cillSteelKg}</td><td className="p-2 border">kg</td><td className="p-2 border">65</td><td className="p-2 border">{results.cillSteelKg*65}</td></tr>
                <tr className="font-bold"><td className="p-2 border">Total Estimate</td><td colSpan={4} className="p-2 border text-right">₹{(
                  results.extBlockQty*45 + results.intBlockQty*40 + results.cementBags*380 + results.sandCft*40 + results.cillConcreteCft*4500 + results.cillSteelKg*65
                ).toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-500 text-center">Assumptions: 5% wastage; mortar mix 1:6; cill concrete every 1m of wall length; rates sample.</div>
    </div>
  );
};

export default WallMasonryCalc;
'@

$wallCalc | Out-File -FilePath src/components/Calculators/WallMasonryCalc.tsx -Encoding utf8 -Force

# ----------------------------------------------------------------------
# 2. Add route to App.tsx
# ----------------------------------------------------------------------
$appPath = "src/App.tsx"
$appContent = Get-Content $appPath -Raw
if ($appContent -notmatch "WallMasonryCalc") {
    $appContent = $appContent -replace "(import .+ from 'react-router-dom';)", "`$1`nimport WallMasonryCalc from './components/Calculators/WallMasonryCalc';"
    $appContent = $appContent -replace "(<Route path='/earthwork-calc'.*?/>)", "`$1`n          <Route path='/wall-masonry-calc' element={<WallMasonryCalc />} />"
    $appContent | Set-Content $appPath -Encoding utf8 -Force
    Write-Host "✅ Added route for /wall-masonry-calc" -ForegroundColor Green
} else {
    Write-Host "Route already exists." -ForegroundColor Yellow
}

# ----------------------------------------------------------------------
# 3. Add sidebar link to Layout.tsx
# ----------------------------------------------------------------------
$layoutPath = "src/components/Layout.tsx"
$layoutContent = Get-Content $layoutPath -Raw
if ($layoutContent -notmatch "wall-masonry-calc") {
    $newLink = '<Link to="/wall-masonry-calc" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(\'/wall-masonry-calc\')}`}>🧱 Wall Masonry Calculator</Link>'
    $layoutContent = $layoutContent -replace '(?<=MATERIAL CALCULATOR.*?<div className="flex-1 p-4 space-y-1">)', "`$1`n          $newLink"
    $layoutContent | Set-Content $layoutPath -Encoding utf8 -Force
    Write-Host "✅ Added Wall Masonry Calculator to sidebar" -ForegroundColor Green
} else {
    Write-Host "Sidebar link already exists." -ForegroundColor Yellow
}

Write-Host "🎉 Wall Masonry Calculator created. Restart dev server: npm run dev" -ForegroundColor Cyan