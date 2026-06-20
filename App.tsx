import React, { useState, useMemo } from 'react';
import { Calculator, FileText, Map, Share2, Download, CheckCircle2, LayoutDashboard, PaintBucket, Layers, Component, Shovel, Home } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// --- IMPORTING ALL YOUR CUSTOM MODULES ---
import PaintBOQ from './components/PaintBOQ';
import RCCCalculator from './components/RCCCalculator';
import WallMasonry from './components/WallMasonry';
import EarthworkCalc from './components/EarthworkCalc';
import FloorPlanGenerator from './components/FloorPlanGenerator';

export default function BuildMitraUnified() {
  // --- NAVIGATION STATE ---
  const [activeModule, setActiveModule] = useState('master');

  // --- MASTER BOQ STATE & LOGIC ---
  const [plotWidth, setPlotWidth] = useState(30);
  const [plotLength, setPlotLength] = useState(40);
  const [floors, setFloors] = useState(5); 
  const [facing, setFacing] = useState('East');
  const [tier, setTier] = useState('Luxury');

  const builtUpArea = plotWidth * plotLength;
  const totalArea = builtUpArea * floors;
  
  const multipliers = {
    Steel: tier === 'Ultra-Luxury' ? 5.2 : 4.8, 
    Concrete: 0.042, 
  };

  const boqData = useMemo(() => {
    return [
      { id: 1, cat: "PRE-CONSTRUCTION", item: "Site Clearance & Marking", qty: 1, unit: "JOB", rate: 15000 },
      { id: 2, cat: "PRE-CONSTRUCTION", item: "Temporary Site Shed & Office", qty: 1, unit: "JOB", rate: 35000 },
      { id: 3, cat: "PRE-CONSTRUCTION", item: "Deep Borewell Drilling & Casing", qty: 1, unit: "NOS", rate: 120000 },
      { id: 4, cat: "SITE WORK", item: "Earthwork excavation for footings", qty: (totalArea * 0.15).toFixed(2), unit: "CUM", rate: 450 },
      { id: 5, cat: "SITE WORK", item: "Anti-termite treatment (Pre-con)", qty: totalArea, unit: "SFT", rate: 14 },
      { id: 6, cat: "CIVIL", item: "PCC 1:4:8 Bed for footings", qty: (totalArea * 0.02).toFixed(2), unit: "CUM", rate: 5200 },
      { id: 7, cat: "CIVIL", item: "Footing Concrete (M25 Grade)", qty: (totalArea * 0.08).toFixed(2), unit: "CUM", rate: 6800 },
      { id: 8, cat: "CIVIL", item: "Plinth Beams & RCC Pedestals", qty: (totalArea * 0.04).toFixed(2), unit: "CUM", rate: 7100 },
      { id: 9, cat: "CIVIL", item: "Columns & Beams (M30 Grade)", qty: (totalArea * 0.12).toFixed(2), unit: "CUM", rate: 7500 },
      { id: 10, cat: "CIVIL", item: "Roof Slabs & Staircase Concrete", qty: (totalArea * 0.18).toFixed(2), unit: "CUM", rate: 7000 },
      { id: 11, cat: "STEEL", item: "Reinforcement Steel (Fe550D TMT)", qty: (totalArea * multipliers.Steel / 1000).toFixed(2), unit: "TONS", rate: 74000 },
      { id: 12, cat: "STEEL", item: "Binding Wire & Cover Blocks", qty: floors, unit: "LUMPSUM", rate: 8000 },
      { id: 13, cat: "MASONRY", item: "6\" Solid Block Work (External)", qty: (totalArea * 0.65).toFixed(2), unit: "SFT", rate: 120 },
      { id: 14, cat: "MASONRY", item: "4\" Solid Block Work (Internal)", qty: (totalArea * 0.45).toFixed(2), unit: "SFT", rate: 105 },
      { id: 15, cat: "PLASTER", item: "Ceiling Plastering", qty: (totalArea).toFixed(2), unit: "SFT", rate: 45 },
      { id: 16, cat: "PLASTER", item: "Internal Wall Plastering (Sponge)", qty: (totalArea * 1.8).toFixed(2), unit: "SFT", rate: 48 },
      { id: 17, cat: "PLASTER", item: "External Smooth Plastering", qty: (totalArea * 1.2).toFixed(2), unit: "SFT", rate: 65 },
      { id: 18, cat: "WATERPROOF", item: "Terrace Waterproofing (Screed)", qty: builtUpArea, unit: "SFT", rate: 75 },
      { id: 19, cat: "WATERPROOF", item: "Toilet & Balcony Base Coat", qty: (floors * 120), unit: "SFT", rate: 55 },
      { id: 20, cat: "FINISH", item: "Italian Marble (Living & Dining)", qty: (builtUpArea * 0.4).toFixed(2), unit: "SFT", rate: 450 },
      { id: 21, cat: "FINISH", item: "Vitrified Tiles (Bedrooms/Kitchen)", qty: (builtUpArea * 0.6).toFixed(2), unit: "SFT", rate: 110 },
      { id: 22, cat: "FINISH", item: "Premium Wall Tiles (Toilets)", qty: (floors * 280), unit: "SFT", rate: 85 },
      { id: 23, cat: "FINISH", item: "Granite Flooring (Staircase)", qty: (floors * 150), unit: "SFT", rate: 180 },
      { id: 24, cat: "PAINT", item: "Birla Putty (2 Coats)", qty: (totalArea * 3).toFixed(2), unit: "SFT", rate: 18 },
      { id: 25, cat: "PAINT", item: "Primer Coat (Interior & Exterior)", qty: (totalArea * 4.2).toFixed(2), unit: "SFT", rate: 12 },
      { id: 26, cat: "PAINT", item: "Royal Emulsion (Interior)", qty: (totalArea * 3).toFixed(2), unit: "SFT", rate: 35 },
      { id: 27, cat: "PAINT", item: "Apex Ultima (Exterior Protect)", qty: (totalArea * 1.2).toFixed(2), unit: "SFT", rate: 42 },
      { id: 28, cat: "ELECTRICAL", item: "Concealed Conduits & Backboxes", qty: Math.round(totalArea/15), unit: "PTS", rate: 350 },
      { id: 29, cat: "ELECTRICAL", item: "Finolex/Polycab Wiring", qty: Math.round(totalArea/15), unit: "PTS", rate: 450 },
      { id: 30, cat: "ELECTRICAL", item: "Modular Switches & DB Boards", qty: floors, unit: "FLR", rate: 25000 },
      { id: 31, cat: "PLUMBING", item: "CPVC/UPVC Piping Network", qty: floors, unit: "FLR", rate: 85000 },
      { id: 32, cat: "CP FITTINGS", item: "Sanitary Wares (Jaguar/Kohler)", qty: (floors * 2), unit: "SET", rate: 45000 },
      { id: 33, cat: "DOORS", item: "Teakwood Main Door (5' x 8')", qty: 1, unit: "NOS", rate: 125000 },
      { id: 34, cat: "DOORS", item: "Internal Flush Doors with Veneer", qty: (floors * 4), unit: "NOS", rate: 18000 },
      { id: 35, cat: "WINDOWS", item: "UPVC Sliding Windows with Mesh", qty: (totalArea * 0.12).toFixed(2), unit: "SFT", rate: 550 },
      { id: 36, cat: "ELEVATION", item: "Front Facade CNC/HPL Cladding", qty: 1, unit: "LUMPSUM", rate: 150000 },
      { id: 37, cat: "MISC", item: "SS Glass Railings for Balcony", qty: (floors * 30), unit: "RFT", rate: 1800 },
      { id: 38, cat: "MISC", item: "Compound Wall & Main Gate", qty: (plotWidth + plotLength * 2), unit: "RFT", rate: 1600 },
      { id: 39, cat: "MISC", item: "Sump Tank (10,000 Liters)", qty: 1, unit: "NOS", rate: 95000 },
      { id: 40, cat: "LABOR", item: "Civil & MEP Site Labor (Finish-to-Start)", qty: totalArea, unit: "SFT", rate: 380 },
    ];
  }, [totalArea, builtUpArea, plotWidth, plotLength, floors, multipliers.Steel]);

  const grandTotal = boqData.reduce((sum, i) => sum + (parseFloat(i.qty.toString()) * i.rate), 0);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('letterhead');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`BuildMitra_Report_${plotWidth}x${plotLength}.pdf`);
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(boqData.map(item => ({
      "Category": item.cat, "Item Description": item.item, "Quantity": item.qty,
      "Unit": item.unit, "Rate (INR)": item.rate, "Total Cost (INR)": parseFloat(item.qty.toString()) * item.rate
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BOQ Estimate");
    XLSX.writeFile(workbook, `BuildMitra_BOQ_${plotWidth}x${plotLength}.xlsx`);
  };

  const handleWhatsAppShare = () => {
    const text = `*BUILDMITRA ESTIMATE*\nPlot: ${plotWidth}x${plotLength} ft\nFloors: G+${floors-1}\nTotal Estimate: ₹${grandTotal.toLocaleString()}\n\nPowered by BuildMitra ConTech.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* --- MASTER SIDEBAR --- */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-10">
        <div className="p-6 bg-slate-950 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-tighter text-white">BUILD<span className="text-blue-500">MITRA</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Construction ERP</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Main Dashboard</p></div>
          <button onClick={() => setActiveModule('master')} className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeModule === 'master' ? 'bg-blue-600 text-white border-l-4 border-blue-400' : 'hover:bg-slate-800 border-l-4 border-transparent'}`}>
            <LayoutDashboard size={18} className="mr-3" /> Unified Master BOQ
          </button>

          <div className="px-4 mt-6 mb-2"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engineering Calculators</p></div>
          <button onClick={() => setActiveModule('earthwork')} className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeModule === 'earthwork' ? 'bg-slate-800 text-amber-400 border-l-4 border-amber-400' : 'hover:bg-slate-800 border-l-4 border-transparent'}`}>
            <Shovel size={18} className="mr-3" /> Earthwork Calc
          </button>
          <button onClick={() => setActiveModule('rcc')} className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeModule === 'rcc' ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-400' : 'hover:bg-slate-800 border-l-4 border-transparent'}`}>
            <Layers size={18} className="mr-3" /> RCC & Steel Calc
          </button>
          <button onClick={() => setActiveModule('masonry')} className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeModule === 'masonry' ? 'bg-slate-800 text-orange-400 border-l-4 border-orange-400' : 'hover:bg-slate-800 border-l-4 border-transparent'}`}>
            <Component size={18} className="mr-3" /> Wall Masonry Calc
          </button>
          <button onClick={() => setActiveModule('paint')} className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeModule === 'paint' ? 'bg-slate-800 text-emerald-400 border-l-4 border-emerald-400' : 'hover:bg-slate-800 border-l-4 border-transparent'}`}>
            <PaintBucket size={18} className="mr-3" /> Paint BOQ
          </button>

          <div className="px-4 mt-6 mb-2"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drawings & Design</p></div>
          <button onClick={() => setActiveModule('floorplan')} className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeModule === 'floorplan' ? 'bg-slate-800 text-indigo-400 border-l-4 border-indigo-400' : 'hover:bg-slate-800 border-l-4 border-transparent'}`}>
            <Home size={18} className="mr-3" /> 2D Floor Plans
          </button>
        </div>
      </div>

      {/* --- DYNAMIC CANVAS AREA --- */}
      <div className="flex-1 overflow-y-auto bg-slate-100">
        
        {/* Render Master BOQ */}
        {activeModule === 'master' && (
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-600">
                  <h2 className="flex items-center text-xl font-bold text-slate-800 mb-6"><Calculator className="mr-2 text-blue-600"/> Parameters</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">Width (ft)</label><input type="number" value={plotWidth} onChange={(e)=>setPlotWidth(Number(e.target.value))} className="w-full p-3 bg-slate-50 border rounded-lg font-bold" /></div>
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">Length (ft)</label><input type="number" value={plotLength} onChange={(e)=>setPlotLength(Number(e.target.value))} className="w-full p-3 bg-slate-50 border rounded-lg font-bold" /></div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Total Floors</label>
                      <div className="flex bg-slate-50 p-1 rounded-lg border">
                        {[1, 2, 3, 4, 5].map((f) => (
                          <button key={f} onClick={() => setFloors(f)} className={`flex-1 py-2 text-sm font-bold rounded ${floors === f ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>{f === 1 ? 'G' : `G+${f-1}`}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Facing</label>
                      <select value={facing} onChange={(e)=>setFacing(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-lg font-bold">
                        <option>East</option><option>West</option><option>North</option><option>South</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center"><Map className="mr-2 text-green-500"/> Vastu Compliance Engine</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded"><span className="text-xs font-medium">Pooja Room (NE)</span><CheckCircle2 size={16} className="text-green-600"/></div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded"><span className="text-xs font-medium">Kitchen (SE)</span><CheckCircle2 size={16} className="text-green-600"/></div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div id="letterhead" className="bg-white p-8 rounded-sm shadow-2xl border border-slate-200">
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                    <div>
                      <h1 className="text-4xl font-black tracking-tighter text-slate-900">BUILDMITRA</h1>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Digital Civil Solutions | Bengaluru</p>
                    </div>
                    <div className="text-right text-[10px] font-bold text-slate-500 uppercase">
                      <p>Project ID: BM-2026-{Math.floor(Math.random()*9000)}</p><p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <h2 className="text-center text-xl font-bold underline mb-8">STRUCTURAL DRAWING & BOQ REPORT: G+{floors-1} VILLA</h2>

                  <div className="mb-10 bg-slate-50 border-2 border-dashed border-slate-300 p-4 rounded-lg flex flex-col items-center">
                    <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase">Dynamic 2D Site Layout (Not to Scale)</p>
                    <svg width="300" height="200" className="drop-shadow-md">
                      <rect x="50" y="20" width="200" height="150" fill="white" stroke="#1e293b" strokeWidth="3" />
                      <rect x="50" y="20" width="60" height="40" fill="#f1f5f9" stroke="#94a3b8" />
                      <text x="55" y="45" fontSize="8" fontWeight="bold">POOJA</text>
                      <rect x="190" y="130" width="60" height="40" fill="#f1f5f9" stroke="#94a3b8" />
                      <text x="195" y="155" fontSize="8" fontWeight="bold">KITCHEN</text>
                      <line x1="150" y1="20" x2="150" y2="170" stroke="#cbd5e1" strokeDasharray="4" />
                      <text x="120" y="100" fontSize="10" fill="#64748b" fontWeight="bold">LIVING HALL</text>
                      <text x="10" y="100" transform="rotate(-90 10,100)" fontSize="10" fontWeight="bold">{plotLength} FT</text>
                      <text x="140" y="190" fontSize="10" fontWeight="bold">{plotWidth} FT</text>
                    </svg>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="border p-2 text-left">ITEM DESCRIPTION</th><th className="border p-2">QTY</th><th className="border p-2">UNIT</th><th className="border p-2">RATE (₹)</th><th className="border p-2 text-right">TOTAL (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {boqData.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="border p-2 font-medium"><span className="text-[8px] text-blue-600 block">{item.cat}</span>{item.item}</td>
                            <td className="border p-2 text-center">{item.qty}</td><td className="border p-2 text-center">{item.unit}</td><td className="border p-2 text-center">{item.rate.toLocaleString()}</td><td className="border p-2 text-right font-bold">{(parseFloat(item.qty.toString()) * item.rate).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 font-black text-[14px]">
                          <td colSpan={4} className="border p-4 text-right uppercase">Total Project Estimate (Excl. GST)</td><td className="border p-4 text-right text-blue-700">₹{grandTotal.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pb-20">
                  <button onClick={handleDownloadPDF} className="flex items-center justify-center bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all"><Download size={18} className="mr-2"/> PDF EXPORT</button>
                  <button onClick={handleDownloadExcel} className="flex items-center justify-center bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all"><FileText size={18} className="mr-2"/> EXCEL BOQ</button>
                  <button onClick={handleWhatsAppShare} className="flex items-center justify-center bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all"><Share2 size={18} className="mr-2"/> WHATSAPP SHARE</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Render Other Modules Dynamically */}
        {activeModule === 'paint' && <PaintBOQ />}
        {activeModule === 'rcc' && <RCCCalculator />}
        {activeModule === 'masonry' && <WallMasonry />}
        {activeModule === 'earthwork' && <EarthworkCalc />}
        {activeModule === 'floorplan' && <FloorPlanGenerator />}

      </div>
    </div>
  );
}