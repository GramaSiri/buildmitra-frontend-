import { useState, useMemo } from 'react';

const LayoutStudio = () => {
  // ---------- LAND SURVEY (with diagonal for accurate area) ----------
  const [sideAB, setSideAB] = useState(650);
  const [sideBC, setSideBC] = useState(985);
  const [sideCD, setSideCD] = useState(876);
  const [sideDA, setSideDA] = useState(765);
  const [diagonalAC, setDiagonalAC] = useState(1200); // from A to C

  // ---------- FINANCIAL INPUTS ----------
  const [landCostLumpsum, setLandCostLumpsum] = useState(50000000); // 5 Cr
  const [expectedSaleRate, setExpectedSaleRate] = useState(2500); // ₹/sqft

  // ---------- INFRASTRUCTURE ----------
  const [roadFacing, setRoadFacing] = useState('east');
  const [mainRoadWidth, setMainRoadWidth] = useState(30);
  const [internalRoadWidth, setInternalRoadWidth] = useState(25);
  const [drainageType, setDrainageType] = useState('rcc_closed');
  const [compoundWall, setCompoundWall] = useState('block_masonry');
  const [entranceType, setEntranceType] = useState('grand_arch');

  // ---------- PLOT SIZE MIX & AMENITIES ----------
  const [plotConfig, setPlotConfig] = useState({
    '20x30': true, '30x40': true, '30x50': false, '40x60': true, '50x80': false,
  });
  const [amenities, setAmenities] = useState({
    park: true, temple: true, stp: true, clubhouse: false, waterTank: true,
  });

  // ---------- INTERACTION ----------
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [generationKey, setGenerationKey] = useState(0); // forces recalculation

  // ---------- AREA CALCULATION (Heron's formula on two triangles) ----------
  const totalSqft = useMemo(() => {
    // Triangle ABC
    const s1 = (sideAB + sideBC + diagonalAC) / 2;
    const areaABC = Math.sqrt(s1 * (s1 - sideAB) * (s1 - sideBC) * (s1 - diagonalAC));
    // Triangle ADC (A-C-D)
    const s2 = (sideCD + sideDA + diagonalAC) / 2;
    const areaADC = Math.sqrt(s2 * (s2 - sideCD) * (s2 - sideDA) * (s2 - diagonalAC));
    const total = areaABC + areaADC;
    return isNaN(total) || total <= 0 ? sideAB * sideBC : total; // fallback
  }, [sideAB, sideBC, sideCD, sideDA, diagonalAC, generationKey]);

  const totalAcres = totalSqft / 43560;
  const circulationSqft = totalSqft * 0.30;
  const amenitySqft = totalSqft * 0.10;
  const saleableSqft = totalSqft - circulationSqft - amenitySqft;

  // ---------- PLOT GENERATION ----------
  const { plotsArray, totalPlotsCount } = useMemo(() => {
    const activeSizes = Object.entries(plotConfig).filter(([, active]) => active);
    const sqftPerSize = activeSizes.length ? saleableSqft / activeSizes.length : 0;
    const plots: any[] = [];
    let plotNo = 100;
    for (const [sizeStr] of activeSizes) {
      const [w, h] = sizeStr.split('x').map(Number);
      const plotArea = w * h;
      let count = Math.floor(sqftPerSize / plotArea);
      if (count < 1) count = 1;
      for (let i = 0; i < count; i++) {
        const statusRand = Math.random();
        const status = statusRand > 0.4 ? 'available' : statusRand > 0.2 ? 'booked' : 'sold';
        const facing = ['East', 'West', 'North', 'South'][Math.floor(Math.random() * 4)];
        plots.push({
          no: plotNo++,
          w, h,
          area: plotArea,
          status,
          facing,
          value: plotArea * expectedSaleRate,
          distance: (Math.random() * 5 + 1).toFixed(1),
        });
      }
    }
    return { plotsArray: plots, totalPlotsCount: plots.length };
  }, [plotConfig, saleableSqft, expectedSaleRate, generationKey]);

  // ---------- BOQ CALCULATION ----------
  const boqData = useMemo(() => {
    const perimeter = sideAB + sideBC + sideCD + sideDA;
    const roadLength = circulationSqft / internalRoadWidth;
    const drainLength = roadLength * 2;
    const streetLightCount = Math.ceil(roadLength / 50);
    const treeCount = Math.ceil(roadLength / 30);
    const landmarking = (amenities.park ? 500000 : 0) + (amenities.temple ? 1200000 : 0) +
                        (amenities.stp ? 2500000 : 0) + (amenities.clubhouse ? 5000000 : 0) +
                        (amenities.waterTank ? 1500000 : 0);
    const rates = {
      drainage: { rcc_closed: 1200, open: 600, stone: 800, mud: 200 },
      compound: { block_masonry: 800, size_stone: 1000, precast_slab: 600, chain_link: 400 },
      entrance: { grand_arch: 1500000, security_office: 800000, just_gate: 200000 },
    };
    const roadCost = circulationSqft * 120;
    const drainCost = drainLength * (rates.drainage[drainageType as keyof typeof rates.drainage] || 600);
    const wallCost = perimeter * (rates.compound[compoundWall as keyof typeof rates.compound] || 800);
    const entranceCost = rates.entrance[entranceType as keyof typeof rates.entrance] || 200000;
    const streetLightCost = streetLightCount * 25000;
    const treeCost = treeCount * 2000;
    const devCost = roadCost + drainCost + wallCost + entranceCost + streetLightCost + treeCost + landmarking;
    const totalProjectCost = landCostLumpsum + devCost;
    const costPerSqft = totalProjectCost / saleableSqft;
    const revenue = saleableSqft * expectedSaleRate;
    const profit = revenue - totalProjectCost;
    const roi = (profit / totalProjectCost) * 100;

    const boqItems = [
      { id: 1, desc: 'Land Cost (as entered)', uom: 'lumpsum', qty: 1, rate: landCostLumpsum, amount: landCostLumpsum },
      { id: 2, desc: `Road Formation (${internalRoadWidth}ft WBM/Asphalt)`, uom: 'sqft', qty: circulationSqft, rate: 120, amount: roadCost },
      { id: 3, desc: `Drainage System (${drainageType.replace('_', ' ')})`, uom: 'rft', qty: drainLength, rate: drainCost / drainLength, amount: drainCost },
      { id: 4, desc: `Compound Wall (${compoundWall.replace('_', ' ')})`, uom: 'rft', qty: perimeter, rate: wallCost / perimeter, amount: wallCost },
      { id: 5, desc: `Main Entrance (${entranceType.replace('_', ' ')})`, uom: 'lump', qty: 1, rate: entranceCost, amount: entranceCost },
      { id: 6, desc: `Street Lighting (${streetLightCount} poles)`, uom: 'pole', qty: streetLightCount, rate: 25000, amount: streetLightCost },
      { id: 7, desc: `Tree Avenues & Landscaping`, uom: 'nos', qty: treeCount, rate: 2000, amount: treeCost },
      { id: 8, desc: `Amenities (Park, Temple, STP etc.)`, uom: 'lump', qty: 1, rate: landmarking, amount: landmarking },
      { id: 9, desc: `Developer Profit (${roi.toFixed(1)}% margin)`, uom: '%', qty: roi, rate: 0, amount: profit },
      { id: 10, desc: `Total Saleable Value`, uom: 'sqft', qty: saleableSqft, rate: expectedSaleRate, amount: revenue },
    ];
    return { boqItems, totalDevCost: devCost, totalProjectCost, costPerSqft, revenue, profit, roi };
  }, [sideAB, sideBC, sideCD, sideDA, internalRoadWidth, circulationSqft, drainageType, compoundWall, entranceType,
      amenities, landCostLumpsum, saleableSqft, expectedSaleRate, generationKey]);

  // Helper to simulate generation trigger
  const forceGenerate = () => setGenerationKey(k => k + 1);

  // SVG scaling
  const maxDim = Math.max(sideAB, sideBC, sideCD, sideDA, diagonalAC);
  const scale = 800 / (maxDim || 800);
  const svgW = (sideAB + sideCD) / 2 * scale;
  const svgH = (sideBC + sideDA) / 2 * scale;

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen text-slate-800 font-sans pb-20">
      <div className="flex justify-between items-end border-b pb-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">🗺️ Layout Studio V4</h2>
          <p className="text-slate-500 font-medium">Accurate Area from Sides + Diagonal | Full P&L BOQ</p>
        </div>
        <button
          onClick={forceGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow transition"
        >
          🔄 Generate Plan
        </button>
      </div>

      {/* STATS BOXES */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r shadow-sm">
          <p className="text-xs font-bold text-blue-800 uppercase">Total Land Area</p>
          <p className="text-xl font-black text-blue-900">{Math.round(totalSqft).toLocaleString()} sqft</p>
          <p className="text-sm font-bold text-blue-600">{totalAcres.toFixed(3)} Acres</p>
        </div>
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r shadow-sm">
          <p className="text-xs font-bold text-emerald-800 uppercase">Net Saleable (60%)</p>
          <p className="text-xl font-black text-emerald-900">{Math.round(saleableSqft).toLocaleString()} sqft</p>
          <p className="text-sm font-bold text-emerald-600">{totalPlotsCount} Plots</p>
        </div>
        <div className="bg-slate-100 border-l-4 border-slate-500 p-4 rounded-r shadow-sm">
          <p className="text-xs font-bold text-slate-800 uppercase">Roads (30%)</p>
          <p className="text-xl font-black text-slate-900">{Math.round(circulationSqft).toLocaleString()} sqft</p>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r shadow-sm">
          <p className="text-xs font-bold text-purple-800 uppercase">Amenities (10%)</p>
          <p className="text-xl font-black text-purple-900">{Math.round(amenitySqft).toLocaleString()} sqft</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT PANEL – INPUTS */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3 border-b pb-2 text-red-600">📍 Land Measurements (ft)</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div><label>AB</label><input type="number" value={sideAB} onChange={e=>setSideAB(+e.target.value)} className="w-full border rounded p-1" /></div>
              <div><label>BC</label><input type="number" value={sideBC} onChange={e=>setSideBC(+e.target.value)} className="w-full border rounded p-1" /></div>
              <div><label>CD</label><input type="number" value={sideCD} onChange={e=>setSideCD(+e.target.value)} className="w-full border rounded p-1" /></div>
              <div><label>DA</label><input type="number" value={sideDA} onChange={e=>setSideDA(+e.target.value)} className="w-full border rounded p-1" /></div>
              <div className="col-span-3"><label>Diagonal AC (for area)</label><input type="number" value={diagonalAC} onChange={e=>setDiagonalAC(+e.target.value)} className="w-full border rounded p-1" /></div>
            </div>
            <div className="bg-slate-100 p-2 rounded text-center">
              <span className="text-xs uppercase font-bold">System Calculated Acres</span>
              <input type="text" value={`${totalAcres.toFixed(3)} Acres`} disabled className="w-full text-center bg-transparent font-black text-blue-700" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">🛣️ Infrastructure</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><label>Road Facing</label><select value={roadFacing} onChange={e=>setRoadFacing(e.target.value)} className="border rounded p-1"><option>north</option><option>south</option><option>east</option><option>west</option></select></div>
              <div className="flex justify-between"><label>Main Road (ft)</label><select value={mainRoadWidth} onChange={e=>setMainRoadWidth(+e.target.value)} className="border rounded p-1"><option>20</option><option>30</option><option>40</option></select></div>
              <div className="flex justify-between"><label>Internal Roads (ft)</label><select value={internalRoadWidth} onChange={e=>setInternalRoadWidth(+e.target.value)} className="border rounded p-1 text-blue-700 font-bold"><option>15</option><option>20</option><option>25</option><option>30</option></select></div>
              <div className="flex justify-between"><label>Drainage</label><select value={drainageType} onChange={e=>setDrainageType(e.target.value)} className="border rounded p-1"><option value="rcc_closed">RCC Closed</option><option value="open">Open</option><option value="stone">Stone</option><option value="mud">Mud</option></select></div>
              <div className="flex justify-between"><label>Compound Wall</label><select value={compoundWall} onChange={e=>setCompoundWall(e.target.value)} className="border rounded p-1"><option value="block_masonry">Block Masonry</option><option value="size_stone">Size Stone</option><option value="precast_slab">Precast Slab</option><option value="chain_link">Chain Link</option></select></div>
              <div className="flex justify-between"><label>Main Entrance</label><select value={entranceType} onChange={e=>setEntranceType(e.target.value)} className="border rounded p-1"><option value="grand_arch">Grand Arch</option><option value="security_office">Security Office</option><option value="just_gate">Just Gate</option></select></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2">📏 Plot Sizes</h3>
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              {Object.entries(plotConfig).map(([size, active]) => (
                <label key={size} className="flex items-center gap-1"><input type="checkbox" checked={active} onChange={e=>setPlotConfig({...plotConfig, [size]: e.target.checked})} /> {size}</label>
              ))}
            </div>
            <h3 className="font-bold text-slate-800 mb-2 border-t pt-2">🌳 Amenities</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(amenities).map(([key, val]) => (
                <label key={key} className="flex items-center gap-1"><input type="checkbox" checked={val} onChange={e=>setAmenities({...amenities, [key]: e.target.checked})} /> {key.replace(/([A-Z])/g, ' $1').trim()}</label>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2">💰 Financial Inputs</h3>
            <label>Land Purchase Cost (₹ Lumpsum)</label>
            <input type="number" value={landCostLumpsum} onChange={e=>setLandCostLumpsum(+e.target.value)} className="w-full border rounded p-1 mb-2" />
            <label>Expected Sale Rate (₹/sqft)</label>
            <input type="number" value={expectedSaleRate} onChange={e=>setExpectedSaleRate(+e.target.value)} className="w-full border rounded p-1" />
          </div>
        </div>

        {/* RIGHT PANEL – MAP & BOQ */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 relative">
            <h3 className="font-bold text-xl text-slate-800 mb-4 border-b pb-2">🗺️ Interactive Master Plan</h3>
            {selectedPlot && (
              <div className="absolute top-20 left-8 bg-white p-4 rounded-xl shadow-2xl border-2 border-slate-800 z-10 w-72">
                <div className="flex justify-between items-start border-b pb-2 mb-2">
                  <h4 className="font-black text-lg">Plot #{selectedPlot.no}</h4>
                  <button onClick={() => setSelectedPlot(null)} className="text-slate-400 hover:text-red-500">✖</button>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-500">Dim:</span> {selectedPlot.w}'x{selectedPlot.h}'</p>
                  <p><span className="text-slate-500">Area:</span> {selectedPlot.area} sqft</p>
                  <p><span className="text-slate-500">Facing:</span> {selectedPlot.facing}</p>
                  <p><span className="text-slate-500">Distance from gate:</span> {selectedPlot.distance} km</p>
                  <p><span className="text-slate-500">Value:</span> ₹{(selectedPlot.value/100000).toFixed(2)} L</p>
                </div>
                <a href={`https://wa.me/?text=I am interested in Plot ${selectedPlot.no} (${selectedPlot.w}×${selectedPlot.h}) – Area ${selectedPlot.area} sqft, Facing ${selectedPlot.facing}, Price ₹${(selectedPlot.value/100000).toFixed(2)} L`} target="_blank" className="block w-full mt-4 bg-emerald-500 text-white rounded py-2 text-xs font-bold text-center hover:bg-emerald-600">💬 WhatsApp Enquiry</a>
              </div>
            )}
            <div className="bg-slate-100 rounded-lg p-2 overflow-x-auto flex justify-center border border-slate-300">
              <svg viewBox="0 0 1000 600" className="w-full max-h-[450px] drop-shadow-lg bg-[#e2e8f0]">
                <polygon points={`50,50 ${50+svgW},50 ${50+svgW-40},${50+svgH} 80,${50+svgH+30}`} fill="#dcfce3" stroke="#166534" strokeWidth="4" />
                {/* Roads */}
                <rect x="400" y="200" width="80" height="400" fill="#94a3b8" />
                <rect x="200" y="300" width="600" height="40" fill="#94a3b8" />
                {/* Street lights & trees */}
                <text x="380" y="350" fontSize="20">💡</text><text x="380" y="450" fontSize="20">💡</text>
                <text x="500" y="350" fontSize="20">🌳</text><text x="500" y="450" fontSize="20">🌳</text>
                {/* Drainage */}
                <line x1="390" y1="200" x2="390" y2="600" stroke="#3b82f6" strokeWidth="3" strokeDasharray="5,5" />
                {/* Main gate */}
                <rect x="390" y="580" width="100" height="20" fill="#0f172a" /><text x="440" y="595" fontSize="12" fill="white" textAnchor="middle">MAIN GATE</text>
                {/* Amenities icons */}
                {amenities.temple && <g transform="translate(800, 50)"><rect width="80" height="60" fill="#fef08a" stroke="#ca8a04" /><text x="40" y="35" fontSize="24" textAnchor="middle">🛕</text><text x="40" y="55" fontSize="10" textAnchor="middle">Temple</text></g>}
                {amenities.stp && <g transform="translate(80, 500)"><rect width="80" height="60" fill="#cbd5e1" stroke="#475569" /><text x="40" y="35" fontSize="24" textAnchor="middle">⚙️</text><text x="40" y="55" fontSize="10" textAnchor="middle">STP</text></g>}
                {amenities.park && <g transform="translate(250, 150)"><rect width="150" height="80" fill="#bbf7d0" stroke="#16a34a" /><text x="75" y="45" fontSize="18" textAnchor="middle">🌳🌿</text><text x="75" y="70" fontSize="12" fill="#166534" textAnchor="middle">Central Park</text></g>}
                {/* Plots grid */}
                <g transform="translate(550, 120)">
                  {plotsArray.slice(0, 64).map((plot, idx) => {
                    const col = idx % 8, row = Math.floor(idx / 8);
                    let fill = '#34d399';
                    if (plot.status === 'booked') fill = '#fbbf24';
                    if (plot.status === 'sold') fill = '#ef4444';
                    return (
                      <g key={idx} onClick={() => setSelectedPlot(plot)} className="cursor-pointer hover:opacity-80">
                        <rect x={col * 40} y={row * 50} width="35" height="45" fill={fill} stroke="#fff" strokeWidth="1.5" rx="2" />
                        <text x={col*40 + 17.5} y={row*50 + 25} fontSize="9" fill="#fff" fontWeight="bold" textAnchor="middle">{plot.no}</text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* FINANCIAL SUMMARY */}
          <div className="bg-white rounded-xl shadow border border-slate-200 p-5">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">💰 Project Financials</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="bg-slate-100 p-3 rounded"><p className="text-sm font-bold">Total Project Cost</p><p className="text-2xl font-black">₹{(boqData.totalProjectCost / 1e7).toFixed(2)} Cr</p></div>
                <div className="bg-slate-100 p-3 rounded"><p className="text-sm font-bold">Cost per Saleable Sqft</p><p className="text-2xl font-black">₹{Math.round(boqData.costPerSqft)}</p></div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl">
                <p className="text-emerald-800 font-bold text-sm">Projected Revenue</p>
                <p className="text-3xl font-black text-emerald-900">₹{(boqData.revenue / 1e7).toFixed(2)} Cr</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><p className="text-xs text-slate-500">Profit</p><p className="text-xl font-bold text-blue-700">₹{(boqData.profit / 1e7).toFixed(2)} Cr</p></div>
                  <div><p className="text-xs text-slate-500">ROI</p><p className="text-xl font-bold text-emerald-600">{boqData.roi.toFixed(1)}%</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED BOQ TABLE */}
          <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <h3 className="font-bold text-lg p-4 bg-slate-50 border-b">📋 Detailed Bill of Quantities</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-white"><tr><th className="p-3">#</th><th className="p-3 text-left">Item</th><th className="p-3">UOM</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Rate (₹)</th><th className="p-3 text-right">Amount (₹)</th></tr></thead>
                <tbody>
                  {boqData.boqItems.map((item) => (
                    <tr key={item.id} className="border-b even:bg-slate-50">
                      <td className="p-3 text-center">{item.id}</td>
                      <td className="p-3">{item.desc}</td>
                      <td className="p-3 text-center">{item.uom}</td>
                      <td className="p-3 text-right">{typeof item.qty === 'number' ? item.qty.toLocaleString() : item.qty}</td>
                      <td className="p-3 text-right">{item.rate.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutStudio;