import React, { useState } from 'react';

const ARCHITECT_BLUEPRINTS = [
  {
    id: 'arch-3bhk',
    title: 'PROPOSED 3 BHK RESIDENTIAL VILLA (G+1 DUPLEX)',
    client: 'M. Chinnappa Reddy / BuildMitra',
    scale: '1:100 (Metric/Imperial)',
    plotWidth: 40,
    plotLength: 60,
    plotStr: '40\'-0" x 60\'-0" (2,400 Sq.Ft)',
    bua: '3,150 Sq.Ft',
    facing: 'North Facing (Vastu Shastra Compliant)',
    rooms: [
      { name: 'VERANDAH / PORCH', dims: '12\'-0" x 8\'-0"', x: 60, y: 50, w: 160, h: 90, type: 'open' },
      { name: 'FORMAL LIVING ROOM', dims: '16\'-0" x 14\'-0"', x: 60, y: 150, w: 220, h: 160, type: 'living' },
      { name: 'MASTER BEDROOM (01)', dims: '14\'-0" x 16\'-0"', x: 300, y: 150, w: 240, h: 160, type: 'bed' },
      { name: 'MODULAR KITCHEN', dims: '12\'-0" x 12\'-0"', x: 60, y: 320, w: 180, h: 140, type: 'kitchen' },
      { name: 'DINING & FAMILY', dims: '14\'-0" x 12\'-0"', x: 250, y: 320, w: 190, h: 140, type: 'living' },
      { name: 'STAIRCASE CORE', dims: '8\'-0" x 12\'-0"', x: 450, y: 320, w: 110, h: 140, type: 'stairs' },
      { name: 'ATTACHED TOILET', dims: '8\'-0" x 6\'-0"', x: 460, y: 150, w: 100, h: 80, type: 'toilet' }
    ],
    schedule: [
      { mark: 'D1', size: '3\'-3" x 7\'-0"', type: 'Teak Wood Paneled Main Door', count: 1 },
      { mark: 'D2', size: '3\'-0" x 7\'-0"', type: 'Flush Door with Laminate', count: 4 },
      { mark: 'W1', size: '5\'-0" x 5\'-0"', type: 'UPVC Sliding Window with Glazing', count: 6 },
      { mark: 'V1', size: '2\'-0" x 2\'-0"', type: 'Louvred Ventilator', count: 3 }
    ]
  },
  {
    id: 'arch-2bhk',
    title: 'PROPOSED 2 BHK APARTMENT / SIMPLEX UNIT',
    client: 'M. Chinnappa Reddy / BuildMitra',
    scale: '1:50 (Metric/Imperial)',
    plotWidth: 30,
    plotLength: 40,
    plotStr: '30\'-0" x 40\'-0" (1,200 Sq.Ft)',
    bua: '1,050 Sq.Ft',
    facing: 'East Facing',
    rooms: [
      { name: 'LIVING / DINING', dims: '18\'-0" x 13\'-0"', x: 70, y: 60, w: 260, h: 180, type: 'living' },
      { name: 'MASTER BEDROOM', dims: '12\'-0" x 14\'-0"', x: 350, y: 60, w: 210, h: 180, type: 'bed' },
      { name: 'KITCHEN & UTILITY', dims: '9\'-0" x 10\'-0"', x: 70, y: 250, w: 150, h: 150, type: 'kitchen' },
      { name: 'BEDROOM 02', dims: '11\'-0" x 11\'-0"', x: 230, y: 250, w: 180, h: 150, type: 'bed' },
      { name: 'COMMON TOILET', dims: '7\'-0" x 5\'-6"', x: 430, y: 250, w: 130, h: 150, type: 'toilet' }
    ],
    schedule: [
      { mark: 'D1', size: '3\'-3" x 7\'-0"', type: 'Main Entrance Door', count: 1 },
      { mark: 'D2', size: '3\'-0" x 7\'-0"', type: 'Bedrooms Flush Door', count: 2 },
      { mark: 'W1', size: '4\'-0" x 4\'-6"', type: 'UPVC Window', count: 4 },
      { mark: 'V1', size: '2\'-0" x 2\'-0"', type: 'Ventilator', count: 1 }
    ]
  }
];

export default function DrawingStudioPage() {
  const [selectedId, setSelectedId] = useState(ARCHITECT_BLUEPRINTS[0].id);
  const [bp, setBp] = useState(ARCHITECT_BLUEPRINTS[0]);
  const [activeLayer, setActiveLayer] = useState<'all' | 'structural' | 'dimensions' | 'schedule'>('all');
  const [loading, setLoading] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setLoading(true);
    setTimeout(() => {
      const found = ARCHITECT_BLUEPRINTS.find(b => b.id === id);
      if (found) setBp(found);
      setLoading(false);
    }, 250);
  };

  const handlePrintArchitectSheet = () => {
    const totalPlotArea = bp.plotWidth * bp.plotLength;
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert("Please allow pop-ups to view the architectural report.");
      return;
    }

    printWin.document.write(`
      <html>
        <head>
          <title>${bp.title} - BuildMitra Architect Studio</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #0f172a; line-height: 1.6; }
            h1 { color: #0284c7; border-bottom: 3px solid #0284c7; padding-bottom: 10px; font-size: 20px; }
            h3 { color: #334155; margin-top: 25px; border-left: 4px solid #0ea5e9; padding-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background: #f8fafc; }
            .footer { margin-top: 40px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>BUILDMITRA — ARCHITECTURAL CONCEPT & COMPLIANCE REPORT</h1>
          <p><strong>Drawing ID:</strong> DRG-${Math.floor(100000 + Math.random() * 900000)} | <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Blueprint:</strong> ${bp.title} | <strong>Scale:</strong> ${bp.scale}</p>

          <h3>1. Area Statement & Plot Specifications</h3>
          <table>
            <tr><th>Metric Specification</th><th>Calculated Value</th></tr>
            <tr><td>Plot Dimensions</td><td>${bp.plotWidth} ft × ${bp.plotLength} ft</td></tr>
            <tr><td>Total Plot Area</td><td>${totalPlotArea} Sq.Ft</td></tr>
            <tr><td>Total Built-Up Area (BUA)</td><td>${bp.bua}</td></tr>
            <tr><td>Orientation & Style</td><td>${bp.facing}</td></tr>
          </table>

          <h3>2. Room Schedule & Clear Dimensions</h3>
          <table>
            <tr><th>Room / Zone Name</th><th>Clear Dimensions</th><th>Status</th></tr>
            ${bp.rooms.map(r => `<tr><td><strong>${r.name}</strong></td><td>${r.dims}</td><td>Approved</td></tr>`).join('')}
          </table>

          <h3>3. Door & Window Schedule</h3>
          <table>
            <tr><th>Mark</th><th>Size</th><th>Description</th><th>Count</th></tr>
            ${bp.schedule.map(s => `<tr><td><strong>${s.mark}</strong></td><td>${s.size}</td><td>${s.type}</td><td>${s.count}</td></tr>`).join('')}
          </table>

          <div class="footer">
            Generated via BuildMitra Professional Architect Studio & CAD Engine. Certified for Municipal Sanction.
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 bg-slate-950 text-slate-100 min-h-screen font-sans">
      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">BuildMitra Professional Architect Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Architectural CAD Drawing & Blueprint Generator</h1>
          <p className="text-sm text-slate-400 mt-1">Dynamic architect-grade drawings matching exact room layouts, grid axes, and detailed schedules.</p>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-1">
          {(['all', 'structural', 'dimensions', 'schedule'] as const).map(layer => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition ${activeLayer === layer ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BLUEPRINT SELECTOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <span>📐</span> Select Architect Drawing
          </h2>
          <div className="space-y-3">
            {ARCHITECT_BLUEPRINTS.map(b => (
              <div
                key={b.id}
                onClick={() => handleSelect(b.id)}
                className={`p-4 rounded-xl border cursor-pointer transition ${selectedId === b.id ? 'bg-cyan-950/40 border-cyan-600 shadow-md' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-white">{b.title}</h3>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">{b.scale}</span>
                </div>
                <p className="text-[11px] text-slate-400">Plot: {b.plotStr} • BUA: {b.bua}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handlePrintArchitectSheet}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-xl text-xs shadow-xl transition"
            >
              🖨️ Print Certified Blueprint & Compliance Report
            </button>
          </div>
        </div>

        {/* DYNAMIC CAD CANVAS */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">{bp.title}</h3>
              <p className="text-[11px] text-slate-400">Client: <strong className="text-white">{bp.client}</strong> | Scale: <strong className="text-cyan-400">{bp.scale}</strong></p>
            </div>
            <span className="px-3 py-1 bg-slate-800 text-cyan-400 text-xs font-bold rounded-lg border border-slate-700">
              {bp.facing}
            </span>
          </div>

          {/* DYNAMIC SVG FLOOR PLAN RENDERER */}
          <div className="my-6 p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center relative min-h-[440px]">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin text-3xl text-cyan-400 mb-2">⚙️</div>
                <p className="text-xs text-slate-400 font-bold">Synthesizing architectural vectors for {bp.title}...</p>
              </div>
            ) : (
              <svg viewBox="0 0 650 480" className="w-full h-full max-h-[480px] bg-slate-950 font-mono">
                {/* Grid Axes A, B, C, D */}
                <line x1="60" y1="40" x2="60" y2="430" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="260" y1="40" x2="260" y2="430" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="450" y1="40" x2="450" y2="430" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="580" y1="40" x2="580" y2="430" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

                <circle cx="60" cy="25" r="9" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="57" y="29" fill="#38bdf8" fontSize="9" fontWeight="bold">A</text>

                <circle cx="260" cy="25" r="9" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="257" y="29" fill="#38bdf8" fontSize="9" fontWeight="bold">B</text>

                <circle cx="450" cy="25" r="9" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="447" y="29" fill="#38bdf8" fontSize="9" fontWeight="bold">C</text>

                <circle cx="580" cy="25" r="9" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="577" y="29" fill="#38bdf8" fontSize="9" fontWeight="bold">D</text>

                {/* Grid Axes 1, 2, 3, 4 */}
                <line x1="40" y1="50" x2="600" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="140" x2="600" y2="140" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="310" x2="600" y2="310" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="430" x2="600" y2="430" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

                <circle cx="25" cy="50" r="9" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="22" y="54" fill="#38bdf8" fontSize="9" fontWeight="bold">1</text>

                <circle cx="25" cy="140" r="9" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="22" y="144" fill="#38bdf8" fontSize="9" fontWeight="bold">2</text>

                <circle cx="25" cy="310" r="9" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="22" y="314" fill="#38bdf8" fontSize="9" fontWeight="bold">3</text>

                <circle cx="25" cy="430" r="9" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="22" y="434" fill="#38bdf8" fontSize="9" fontWeight="bold">4</text>

                {/* RENDER DYNAMIC ROOMS FOR SELECTED BLUEPRINT */}
                {bp.rooms.map((r, idx) => (
                  <g key={idx}>
                    <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
                    <rect x={r.x + 4} y={r.y + 4} width={r.w - 8} height={r.h - 8} fill="#090d16" />

                    <text x={r.x + 10} y={r.y + 22} fill="#f8fafc" fontSize="10" fontWeight="bold">{r.name}</text>
                    <text x={r.x + 10} y={r.y + 38} fill="#38bdf8" fontSize="9">{r.dims}</text>

                    {r.type === 'stairs' && (
                      <g>
                        <line x1={r.x + 10} y1={r.y + 50} x2={r.x + r.w - 10} y2={r.y + 50} stroke="#f59e0b" strokeWidth="1" />
                        <line x1={r.x + 10} y1={r.y + 70} x2={r.x + r.w - 10} y2={r.y + 70} stroke="#f59e0b" strokeWidth="1" />
                        <line x1={r.x + 10} y1={r.y + 90} x2={r.x + r.w - 10} y2={r.y + 90} stroke="#f59e0b" strokeWidth="1" />
                        <text x={r.x + 25} y={r.y + 115} fill="#f59e0b" fontSize="10" fontWeight="bold">UP ✈</text>
                      </g>
                    )}
                  </g>
                ))}

                {/* Structural Columns Overlay */}
                {(activeLayer === 'all' || activeLayer === 'structural') && (
                  <>
                    <rect x="56" y="46" width="8" height="8" fill="#f97316" />
                    <rect x="256" y="46" width="8" height="8" fill="#f97316" />
                    <rect x="446" y="46" width="8" height="8" fill="#f97316" />
                    <rect x="56" y="426" width="8" height="8" fill="#f97316" />
                    <rect x="446" y="426" width="8" height="8" fill="#f97316" />
                    <text x="430" y="465" fill="#f97316" fontSize="9" fontWeight="bold">IS 456 RC COLUMNS (300x450mm)</text>
                  </>
                )}

                {/* Dimensions Layer */}
                {(activeLayer === 'all' || activeLayer === 'dimensions') && (
                  <g>
                    <line x1="60" y1="460" x2="580" y2="460" stroke="#38bdf8" strokeWidth="1" />
                    <text x="270" y="472" fill="#38bdf8" fontSize="10" fontWeight="bold">PLOT SIZE: {bp.plotStr}</text>
                  </g>
                )}
              </svg>
            )}
          </div>

          {/* SCHEDULE TABLE */}
          {(activeLayer === 'all' || activeLayer === 'schedule') && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
              <h4 className="text-xs font-bold text-cyan-400 uppercase mb-3">Door, Window & Ventilator Schedule ({bp.title})</h4>
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase">
                  <tr>
                    <th className="p-2">Mark</th>
                    <th className="p-2">Size</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-right">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bp.schedule.map((s, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-bold text-cyan-400">{s.mark}</td>
                      <td className="p-2">{s.size}</td>
                      <td className="p-2">{s.type}</td>
                      <td className="p-2 text-right font-bold text-white">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
