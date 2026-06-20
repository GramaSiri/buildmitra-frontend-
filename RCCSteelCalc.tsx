import React, { useState } from 'react';

const RCCSteelCalc = () => {
  const [member, setMember] = useState('slab');
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(5);
  const [depth, setDepth] = useState(0.15);
  const [quantity, setQuantity] = useState(1);
  const [includeRCC, setIncludeRCC] = useState(true);
  const [includeSteel, setIncludeSteel] = useState(true);

  const [topBarDia, setTopBarDia] = useState(12);
  const [topBarRods, setTopBarRods] = useState(5);
  const [bottomBarDia, setBottomBarDia] = useState(12);
  const [bottomBarRods, setBottomBarRods] = useState(5);
  const [stirrupDia, setStirrupDia] = useState(8);
  const [spacing, setSpacing] = useState(150);
  const [lapLength, setLapLength] = useState(50);
  const [bendLength, setBendLength] = useState(6);
  const [wastage, setWastage] = useState(3);

  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [concreteBOQ, setConcreteBOQ] = useState([]);
  const [steelBOQ, setSteelBOQ] = useState([]);

  const concreteMix = {
    M5:  { cement: 110, sand: 0.44, aggregate: 0.88, admixture: 0, water: 150 },
    M10: { cement: 150, sand: 0.44, aggregate: 0.88, admixture: 0, water: 150 },
    M15: { cement: 210, sand: 0.44, aggregate: 0.88, admixture: 0, water: 150 },
    M20: { cement: 280, sand: 0.44, aggregate: 0.88, admixture: 0, water: 150 },
    M25: { cement: 330, sand: 0.44, aggregate: 0.88, admixture: 1.5, water: 150 },
    M30: { cement: 380, sand: 0.44, aggregate: 0.88, admixture: 2.0, water: 150 },
    M35: { cement: 420, sand: 0.44, aggregate: 0.88, admixture: 2.5, water: 150 },
    M40: { cement: 450, sand: 0.44, aggregate: 0.88, admixture: 3.0, water: 150 },
    M45: { cement: 480, sand: 0.44, aggregate: 0.88, admixture: 3.5, water: 150 },
    M50: { cement: 520, sand: 0.44, aggregate: 0.88, admixture: 4.0, water: 150 },
  };

  const barWeight = (dia) => (dia * dia) / 162;

  const getMainBarLength = () => {
    if (member === 'column') return depth;
    return length;
  };

  const getStirrupLength = () => {
    if (member === 'beam' || member === 'column') {
      const perimeter = 2 * (width + depth);
      return perimeter + (bendLength * 2 * (stirrupDia / 1000));
    }
    return 0;
  };

  const getStirrupCount = () => {
    if (member === 'beam' || member === 'lintel') {
      return Math.ceil(length / (spacing / 1000)) + 1;
    }
    if (member === 'column') {
      return Math.ceil(depth / (spacing / 1000)) + 1;
    }
    return 0;
  };

  const calculate = () => {
    const volume = length * width * depth * quantity;
    const mix = concreteMix[concreteGrade];
    if (!mix) return;

    const cementKg = mix.cement * volume;
    const cementBags = Math.ceil(cementKg / 50);
    const sandCft = mix.sand * volume * 35.315;
    const aggregateCft = mix.aggregate * volume * 35.315;
    const admixtureKg = mix.admixture ? mix.admixture * volume : 0;
    const waterLtr = mix.water * volume;

    if (includeRCC) {
      setConcreteBOQ([
        { name: 'Cement (OPC 53 Grade)', qty: cementBags, unit: 'bags', rate: 380 },
        { name: 'Manufactured Sand (M Sand)', qty: sandCft.toFixed(1), unit: 'cft', rate: 40 },
        { name: 'Coarse Aggregate 20mm', qty: (aggregateCft * 0.6).toFixed(1), unit: 'cft', rate: 45 },
        { name: 'Coarse Aggregate 10mm', qty: (aggregateCft * 0.4).toFixed(1), unit: 'cft', rate: 48 },
        { name: 'Admixture (Plasticizer)', qty: admixtureKg.toFixed(1), unit: 'kg', rate: 80 },
        { name: 'Water (Potable)', qty: waterLtr.toFixed(0), unit: 'litres', rate: 0 },
        { name: 'Cover Blocks (concrete)', qty: Math.ceil(volume * 50), unit: 'nos', rate: 5 },
        { name: 'Binding Wire (annealed)', qty: (volume * 5).toFixed(1), unit: 'kg', rate: 60 },
      ]);
    } else {
      setConcreteBOQ([]);
    }

    if (includeSteel) {
      const mainBarLength = getMainBarLength();
      const extra = (lapLength * topBarDia / 1000) + (bendLength * topBarDia / 1000);
      const topBarLengthM = mainBarLength + extra;
      const bottomBarLengthM = mainBarLength + extra;

      const topBarWt = barWeight(topBarDia) * topBarLengthM * topBarRods * quantity;
      const bottomBarWt = barWeight(bottomBarDia) * bottomBarLengthM * bottomBarRods * quantity;

      const stirrupLength = getStirrupLength();
      const stirrupCount = getStirrupCount();
      const stirrupWt = stirrupLength > 0 ? barWeight(stirrupDia) * stirrupLength * stirrupCount * quantity : 0;

      const totalSteelKg = (topBarWt + bottomBarWt + stirrupWt) * (1 + wastage / 100);

      setSteelBOQ([
        { name: `Top Main Bar (${topBarDia}mm) - ${topBarRods} rods`, qty: topBarWt.toFixed(1), unit: 'kg', length: (topBarLengthM * topBarRods * quantity).toFixed(1), rate: 65 },
        { name: `Bottom Main Bar (${bottomBarDia}mm) - ${bottomBarRods} rods`, qty: bottomBarWt.toFixed(1), unit: 'kg', length: (bottomBarLengthM * bottomBarRods * quantity).toFixed(1), rate: 65 },
        { name: `Stirrups (${stirrupDia}mm @${spacing}mm)`, qty: stirrupWt.toFixed(1), unit: 'kg', length: stirrupCount.toFixed(0), rate: 65 },
        { name: 'Total Steel (including wastage)', qty: totalSteelKg.toFixed(1), unit: 'kg', length: '-', rate: 65 },
      ]);
    } else {
      setSteelBOQ([]);
    }
  };

  const exportCSV = (type) => {
    const data = type === 'concrete' ? concreteBOQ : steelBOQ;
    if (data.length === 0) return;
    const rows = [['Item', 'Quantity', 'Unit', 'Rate (₹)', 'Amount (₹)']];
    data.forEach(i => rows.push([i.name, i.qty, i.unit, i.rate, (parseFloat(i.qty)*i.rate).toFixed(2)]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_rcc_boq.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareWhatsApp = () => {
    const msg = `🧱 RCC & Steel Calculator%0AConcrete Grade: ${concreteGrade}%0AVolume: ${(length*width*depth*quantity).toFixed(2)} m³%0ATotal Steel: ${steelBOQ.find(b => b.name.includes('Total'))?.qty || 0} kg%0AGenerated by BuildMitra`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-4">🧱 RCC & Steel Calculator</h2>
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <div><label>Member Type</label><select value={member} onChange={e=>setMember(e.target.value)} className="input-field w-full">
          <option value="slab">Slab</option><option value="beam">Beam</option><option value="lintel">Lintel</option>
          <option value="footing">Footing</option><option value="sunshade">Sunshade</option>
          <option value="column">Column</option><option value="staircase">Staircase</option>
        </select></div>
        <div><label>Length (m)</label><input type="number" value={length} onChange={e=>setLength(parseFloat(e.target.value))} className="input-field w-full" /></div>
        <div><label>Width / Breadth (m)</label><input type="number" value={width} onChange={e=>setWidth(parseFloat(e.target.value))} className="input-field w-full" /></div>
        <div><label>Depth / Height (m)</label><input type="number" value={depth} onChange={e=>setDepth(parseFloat(e.target.value))} className="input-field w-full" /></div>
        <div><label>Quantity (nos)</label><input type="number" value={quantity} onChange={e=>setQuantity(parseInt(e.target.value))} className="input-field w-full" /></div>
        <div><label>Concrete Grade</label><select value={concreteGrade} onChange={e=>setConcreteGrade(e.target.value)} className="input-field w-full">
          {['M5','M10','M15','M20','M25','M30','M35','M40','M45','M50'].map(g => <option key={g}>{g}</option>)}
        </select></div>
      </div>
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <div><label>Top Bar Dia (mm)</label><input type="number" value={topBarDia} onChange={e=>setTopBarDia(parseInt(e.target.value))} className="input-field w-full" /></div>
        <div><label>Top Bar No. of Rods</label><input type="number" value={topBarRods} onChange={e=>setTopBarRods(parseInt(e.target.value))} className="input-field w-full" /></div>
        <div><label>Bottom Bar Dia (mm)</label><input type="number" value={bottomBarDia} onChange={e=>setBottomBarDia(parseInt(e.target.value))} className="input-field w-full" /></div>
        <div><label>Bottom Bar No. of Rods</label><input type="number" value={bottomBarRods} onChange={e=>setBottomBarRods(parseInt(e.target.value))} className="input-field w-full" /></div>
        <div><label>Stirrup Dia (mm)</label><input type="number" value={stirrupDia} onChange={e=>setStirrupDia(parseInt(e.target.value))} className="input-field w-full" /></div>
        <div><label>Spacing (mm)</label><input type="number" value={spacing} onChange={e=>setSpacing(parseInt(e.target.value))} className="input-field w-full" /></div>
        <div><label>Lap Length (×dia)</label><input type="number" value={lapLength} onChange={e=>setLapLength(parseInt(e.target.value))} className="input-field w-full" /></div>
        <div><label>Bend Length (×dia)</label><input type="number" value={bendLength} onChange={e=>setBendLength(parseInt(e.target.value))} className="input-field w-full" /></div>
        <div><label>Wastage (%)</label><input type="number" value={wastage} onChange={e=>setWastage(parseFloat(e.target.value))} className="input-field w-full" /></div>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        <label><input type="checkbox" checked={includeRCC} onChange={e=>setIncludeRCC(e.target.checked)} /> Include RCC (Concrete)</label>
        <label><input type="checkbox" checked={includeSteel} onChange={e=>setIncludeSteel(e.target.checked)} /> Include Steel</label>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={calculate} className="bg-emerald-600 text-white px-5 py-2 rounded-xl">📊 Calculate</button>
        {includeRCC && <button onClick={()=>exportCSV('concrete')} className="bg-blue-600 text-white px-5 py-2 rounded-xl">📎 Export Concrete CSV</button>}
        {includeSteel && <button onClick={()=>exportCSV('steel')} className="bg-blue-600 text-white px-5 py-2 rounded-xl">📎 Export Steel CSV</button>}
        <button onClick={shareWhatsApp} className="bg-green-500 text-white px-5 py-2 rounded-xl">📱 WhatsApp</button>
        <button onClick={()=>window.print()} className="bg-purple-600 text-white px-5 py-2 rounded-xl">🖨️ Print</button>
      </div>
      
      <div className="flex flex-wrap gap-6">
        {includeRCC && concreteBOQ.length > 0 && (
          <div className="flex-1 min-w-[300px]">
            <h3 className="text-lg font-bold mb-2">🔨 Concrete BOQ (for {concreteGrade})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Material</th>
                    <th className="p-2 border">Qty</th>
                    <th className="p-2 border">Unit</th>
                    <th className="p-2 border">Rate (₹)</th>
                    <th className="p-2 border">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {concreteBOQ.map((i, idx) => (
                    <tr key={idx} className="even:bg-gray-50">
                      <td className="p-2 border">{i.name}</td>
                      <td className="p-2 border text-right">{i.qty}</td>
                      <td className="p-2 border">{i.unit}</td>
                      <td className="p-2 border text-right">{i.rate.toLocaleString()}</td>
                      <td className="p-2 border text-right">₹{(parseFloat(i.qty)*i.rate).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {includeSteel && steelBOQ.length > 0 && (
          <div className="flex-1 min-w-[300px]">
            <h3 className="text-lg font-bold mb-2">⚙️ Steel BOQ</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Bar Type</th>
                    <th className="p-2 border">Weight (kg)</th>
                    <th className="p-2 border">Length (m)</th>
                    <th className="p-2 border">Rate (₹)</th>
                    <th className="p-2 border">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {steelBOQ.map((i, idx) => (
                    <tr key={idx} className="even:bg-gray-50">
                      <td className="p-2 border">{i.name}</td>
                      <td className="p-2 border text-right">{i.qty}</td>
                      <td className="p-2 border text-right">{i.length || '-'}</td>
                      <td className="p-2 border text-right">{i.rate.toLocaleString()}</td>
                      <td className="p-2 border text-right">₹{(parseFloat(i.qty)*i.rate).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">Steel quantities based on IS thumb rules. Adjust rates as needed. Use Print to save as PDF.</div>
    </div>
  );
};

export default RCCSteelCalc;