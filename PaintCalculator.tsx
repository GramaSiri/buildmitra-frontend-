import React, { useState } from 'react';
import { Calculator, FileText, Share2, Download, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export default function PaintBOQ() {
  // --- STATE: Inputs ---
  const [plotL, setPlotL] = useState(40);
  const [plotW, setPlotW] = useState(30);
  const [floors, setFloors] = useState(2);
  const [rooms, setRooms] = useState(4);
  const [toilets, setToilets] = useState(3);
  const [setback, setSetback] = useState(3);

  const [paintType, setPaintType] = useState('Fresh');
  const [finishType, setFinishType] = useState('Emulsion');
  const [quality, setQuality] = useState('Premium');
  const [coats, setCoats] = useState(2);
  
  const [textureArea, setTextureArea] = useState(0);
  const [royalArea, setRoyalArea] = useState(0);
  
  const [incDoors, setIncDoors] = useState(true);
  const [incWindows, setIncWindows] = useState(true);
  const [incRailing, setIncRailing] = useState(true);
  const [incGate, setIncGate] = useState(true);

  // --- STATE: Outputs ---
  const [boqData, setBoqData] = useState<any[]>([]);

  // --- MATH: IS Thumb Rules ---
  const bua = plotL * plotW * floors;
  // Thumb Rule: Internal surface area (walls + ceiling) is approx 3x to 3.5x the Carpet Area. (Assuming Carpet = 75% of BUA)
  const calcInternal = Math.round((bua * 0.75) * 3.5); 
  // External Area: Perimeter * Height (Assuming 10ft height per floor), minus shared walls/setbacks
  const calcExternal = Math.round((plotL + plotW) * 2 * (floors * 10));
  // Doors & Windows: Approx 10% of BUA
  const calcDoorsWindows = (incDoors || incWindows) ? Math.round(bua * 0.1) : 0;
  // Railing & Gate: Approx 5% of BUA in rft converted to sqft
  const calcRailingGate = (incRailing || incGate) ? Math.round(bua * 0.05) : 0;

  // --- GENERATE BOQ ---
  const generateBOQ = () => {
    // Rates based on Paint Type & Quality (Fresh includes putty/primer)
    const baseRate = paintType === 'Fresh' ? 18 : 8; // Primer/Putty baseline
    
    let internalRate = baseRate + (quality === 'Premium' ? 14 : quality === 'Ultra Premium' ? 22 : 10);
    let externalRate = baseRate + (quality === 'Premium' ? 18 : quality === 'Ultra Premium' ? 28 : 14);
    let woodEnamelRate = 45; // Asian Paints Apcolite
    let royalRate = 55; // Asian Paints Royale Play
    let textureRate = 75; // Apex Ultima Protek Durasil

    const items = [];

    // Internal Paint
    const standardInternal = calcInternal - royalArea;
    if (standardInternal > 0) {
      items.push({ id: 1, item: `Internal Paint (${finishType} - ${quality}) 2 Coats + Putty`, qty: standardInternal, unit: "SQFT", rate: internalRate });
    }
    
    // Royal Area
    if (royalArea > 0) {
      items.push({ id: 2, item: `Highlight Walls (Asian Paints Royale/Velvet)`, qty: royalArea, unit: "SQFT", rate: royalRate });
    }

    // External Paint
    const standardExternal = calcExternal - textureArea;
    if (standardExternal > 0) {
      items.push({ id: 3, item: `External Paint (Weather-proof - ${quality})`, qty: standardExternal, unit: "SQFT", rate: externalRate });
    }

    // Texture Area
    if (textureArea > 0) {
      items.push({ id: 4, item: `Elevation Texture Paint (Scratch/Dholpur finish)`, qty: textureArea, unit: "SQFT", rate: textureRate });
    }

    // Wood & Metal
    if (calcDoorsWindows > 0) {
      items.push({ id: 5, item: `Enamel Paint for Doors & Windows (Satin finish)`, qty: calcDoorsWindows, unit: "SQFT", rate: woodEnamelRate });
    }
    if (calcRailingGate > 0) {
      items.push({ id: 6, item: `Anti-rust Epoxy & Enamel for MS Railings/Gate`, qty: calcRailingGate, unit: "SQFT", rate: 50 });
    }

    // Labor/Scaffolding (If Fresh, higher cost)
    items.push({ id: 7, item: `Scaffolding & Masking Tape/Sheets Charges`, qty: bua, unit: "LUMPSUM", rate: 5 });

    setBoqData(items);
  };

  const grandTotal = boqData.reduce((sum, i) => sum + (i.qty * i.rate), 0);

  // --- EXPORT FUNCTIONS ---
  const exportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(boqData.map(i => ({ "Item": i.item, "Qty": i.qty, "Unit": i.unit, "Rate": i.rate, "Amount": i.qty * i.rate })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Paint BOQ");
    XLSX.writeFile(workbook, `Paint_BOQ_${bua}sqft.csv`);
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <span className="mr-3">🎨</span> Paint BOQ (IS Thumb Rules – Asian Paints)
        </h1>
      </div>

      {/* TOP ROW: Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {[
          { label: "Total BUA", val: bua, c: "bg-blue-100 text-blue-800 border-blue-200" },
          { label: "Internal Paint", val: calcInternal, c: "bg-emerald-100 text-emerald-800 border-emerald-200" },
          { label: "External Paint", val: calcExternal, c: "bg-orange-100 text-orange-800 border-orange-200" },
          { label: "Doors+Windows", val: calcDoorsWindows, c: "bg-amber-100 text-amber-800 border-amber-200" },
          { label: "Railing+Gate", val: calcRailingGate, c: "bg-slate-200 text-slate-800 border-slate-300" },
          { label: "Texture Area", val: textureArea, c: "bg-purple-100 text-purple-800 border-purple-200" },
          { label: "Royal Area", val: royalArea, c: "bg-pink-100 text-pink-800 border-pink-200" },
        ].map((stat, idx) => (
          <div key={idx} className={`p-3 rounded-lg border text-center shadow-sm ${stat.c}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{stat.label}</p>
            <p className="text-lg font-black">{stat.val} <span className="text-xs font-normal">sqft</span></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Inputs */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 border-b pb-2">Project Parameters</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div><label className="text-xs font-bold text-slate-500">Plot L (ft)</label><input type="number" value={plotL} onChange={e=>setPlotL(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded mt-1"/></div>
            <div><label className="text-xs font-bold text-slate-500">Plot W (ft)</label><input type="number" value={plotW} onChange={e=>setPlotW(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded mt-1"/></div>
            <div><label className="text-xs font-bold text-slate-500">Floors</label><input type="number" value={floors} onChange={e=>setFloors(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded mt-1"/></div>
            <div><label className="text-xs font-bold text-slate-500">Rooms</label><input type="number" value={rooms} onChange={e=>setRooms(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded mt-1"/></div>
            <div><label className="text-xs font-bold text-slate-500">Texture Area (sqft)</label><input type="number" value={textureArea} onChange={e=>setTextureArea(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded mt-1"/></div>
            <div><label className="text-xs font-bold text-slate-500">Royal Area (sqft)</label><input type="number" value={royalArea} onChange={e=>setRoyalArea(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded mt-1"/></div>
          </div>

          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 border-b pb-2">Paint Specifications</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-slate-500">Paint Type</label>
              <select value={paintType} onChange={e=>setPaintType(e.target.value)} className="w-full p-2 bg-slate-50 border rounded mt-1"><option>Fresh</option><option>Repaint</option></select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">Quality</label>
              <select value={quality} onChange={e=>setQuality(e.target.value)} className="w-full p-2 bg-slate-50 border rounded mt-1"><option>Standard</option><option>Premium</option><option>Ultra Premium</option></select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm font-bold text-slate-600">
            <label className="flex items-center"><input type="checkbox" checked={incDoors} onChange={e=>setIncDoors(e.target.checked)} className="mr-2"/> Doors</label>
            <label className="flex items-center"><input type="checkbox" checked={incWindows} onChange={e=>setIncWindows(e.target.checked)} className="mr-2"/> Windows</label>
            <label className="flex items-center"><input type="checkbox" checked={incRailing} onChange={e=>setIncRailing(e.target.checked)} className="mr-2"/> Railing</label>
            <label className="flex items-center"><input type="checkbox" checked={incGate} onChange={e=>setIncGate(e.target.checked)} className="mr-2"/> Gate</label>
          </div>

          <button onClick={generateBOQ} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md flex justify-center items-center">
            <Calculator size={18} className="mr-2"/> Generate BOQ
          </button>
        </div>

        {/* RIGHT: Output Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Generated Estimate</h2>
            <div className="flex space-x-2">
              <button onClick={exportCSV} className="px-3 py-2 bg-green-100 text-green-700 rounded font-bold text-xs flex items-center hover:bg-green-200"><Download size={14} className="mr-1"/> CSV</button>
              <button className="px-3 py-2 bg-teal-100 text-teal-700 rounded font-bold text-xs flex items-center hover:bg-teal-200"><Share2 size={14} className="mr-1"/> WhatsApp</button>
              <button onClick={handlePrint} className="px-3 py-2 bg-slate-100 text-slate-700 rounded font-bold text-xs flex items-center hover:bg-slate-200"><Printer size={14} className="mr-1"/> Print</button>
            </div>
          </div>

          {boqData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              <Calculator size={48} className="mb-4 opacity-50"/>
              <p>Adjust parameters and click Generate BOQ</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-left">
                    <th className="p-3 rounded-tl-lg">Item Description</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3 text-right">Rate (₹)</th>
                    <th className="p-3 text-right rounded-tr-lg">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {boqData.map(row => (
                    <tr key={row.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-700">{row.item}</td>
                      <td className="p-3 text-slate-600 font-mono">{row.qty.toLocaleString()}</td>
                      <td className="p-3 text-slate-500 text-xs">{row.unit}</td>
                      <td className="p-3 text-right text-slate-600 font-mono">{row.rate}</td>
                      <td className="p-3 text-right font-bold text-slate-800 font-mono">{(row.qty * row.rate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 text-blue-900 text-lg font-black">
                    <td colSpan={4} className="p-4 text-right uppercase tracking-widest text-xs">Total Paint Estimate</td>
                    <td className="p-4 text-right font-mono">₹{grandTotal.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}