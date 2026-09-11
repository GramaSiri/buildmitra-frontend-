import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ProfessionalDraftingEngine() {
  const router = useRouter();

  // Custom User Inputs
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [plotWidth, setPlotWidth] = useState<number>(0);
  const [plotLength, setPlotLength] = useState<number>(0);
  const [facing, setFacing] = useState<string>('East');
  const [bhk, setBhk] = useState<string>('3 BHK');
  const [floors, setFloors] = useState<string>('G + 1');

  // Municipal Setbacks (Front 5ft, Rear 3ft, Sides 2ft)
  const frontSet = 5;
  const rearSet = 3;
  const sideSet = 2;

  const effW = plotWidth > 0 ? plotWidth : 30;
  const effL = plotLength > 0 ? plotLength : 40;

  const innerW = Math.max(15, effW - (sideSet * 2));
  const innerL = Math.max(20, effL - (frontSet & 0 ? frontSet : 5) - rearSet);
  const totalArea = effW * effL;
  const plinthArea = Math.round(innerW * innerL);
  const carpetArea = Math.round(plinthArea * 0.78);

  const scale = 14; // Pixels per foot for sharp CAD drafting
  const svgW = effW * scale;
  const svgH = effL * scale;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px', fontFamily: 'Courier New, monospace' }}>
      <Head>
        <title>Professional CAD Blueprint DRG | BuildMitra</title>
      </Head>

      <div style={{ maxWidth: '1450px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '16px 24px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ backgroundColor: '#0284c7', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '1px' }}>
              CAD DRG ENGINE V5.0 — ARCHITECTURAL SANCTION BLUEPRINT
            </span>
            <h1 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: 700, color: '#38bdf8' }}>
              {effW}′ × {effL}′ {facing} Facing {bhk} Working Drawing
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => window.print()} style={{ backgroundColor: '#334155', color: '#fff', border: '1px solid #64748b', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              🖨️ Print CAD PDF
            </button>
            <button onClick={() => router.push(`/boq-calculator?area=${plinthArea}&dimensions=${effW}x${effL}`)} style={{ backgroundColor: '#e11d48', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              🔨 Calculate Turnkey BOQ →
            </button>
            <button onClick={() => router.push('/realestate-hub')} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              ← Hub
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '18px 24px', borderRadius: '10px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>
            Drafting Parameters &amp; Custom Sizing
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 700, minWidth: '120px' }}>Quick Presets:</span>
            {[
              { label: '30x40 East 3BHK', w: 30, l: 40, f: 'East' },
              { label: '30x50 North Duplex', w: 30, l: 50, f: 'North' },
              { label: '40x60 West Villa', w: 40, l: 60, f: 'West' },
              { label: '20x30 South 2BHK', w: 20, l: 30, f: 'South' },
            ].map((p, idx) => (
              <button 
                key={idx} 
                onClick={() => { setPlotWidth(p.w); setPlotLength(p.l); setFacing(p.f); setHasGenerated(true); }}
                style={{ padding: '6px 12px', backgroundColor: '#334155', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 700 }}>Facing:</span>
              {['North', 'East', 'South', 'West'].map(d => (
                <button key={d} onClick={() => setFacing(d)} style={{ padding: '4px 10px', backgroundColor: facing === d ? '#0284c7' : '#334155', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                  {d}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 700 }}>Plot Width (Ft):</span>
              <input type="number" value={plotWidth === 0 ? '' : plotWidth} placeholder="e.g. 30" onChange={e => setPlotWidth(e.target.value === '' ? 0 : Number(e.target.value))} style={{ width: '75px', padding: '6px', textAlign: 'center', background: '#0f172a', color: '#fff', border: '1px solid #64748b', borderRadius: '4px', fontWeight: 700 }} />
              <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 700 }}>Length (Ft):</span>
              <input type="number" value={plotLength === 0 ? '' : plotLength} placeholder="e.g. 40" onChange={e => setPlotLength(e.target.value === '' ? 0 : Number(e.target.value))} style={{ width: '75px', padding: '6px', textAlign: 'center', background: '#0f172a', color: '#fff', border: '1px solid #64748b', borderRadius: '4px', fontWeight: 700 }} />
              <button onClick={() => setHasGenerated(true)} style={{ padding: '8px 18px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                ⚡ Generate CAD Blueprint
              </button>
            </div>
          </div>
        </div>

        {!hasGenerated ? (
          <div style={{
            backgroundColor: '#1e293b',
            border: '2px dashed #0284c7',
            borderRadius: '12px',
            padding: '48px 20px',
            textAlign: 'center',
            color: '#38bdf8',
            fontSize: '16px',
            fontWeight: '700',
            marginTop: '20px',
            boxShadow: '0 4px 12px rgba(2,132,199,0.15)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📐</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#7dd3fc', marginBottom: '8px' }}>Ready for Architectural CAD Drafting</div>
            <div>Enter your plot dimensions or select a quick preset above, then click <strong>"⚡ Generate CAD Blueprint"</strong> to draft your precision working drawings.</div>
          </div>
        ) : (
          /* CAD BLUEPRINT VIEWPORT */
          <div style={{ backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '10px', border: '4px solid #334155', padding: '24px', overflowX: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #0f172a', paddingBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' }}>BUILDMITRA ARCHITECTURAL CONSULTANCY &amp; STRUCTURAL ENGINEERS</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PROJECT: G+1 SANCTION DRAWING • PLOT: {effW}′ × {effL}′ • VASTU COMPLIANT</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#059669' }}>
                PLINTH: {plinthArea} SQ.FT | CARPET: {carpetArea} SQ.FT
              </div>
            </div>

            {/* Precision Architectural SVG Drawing */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', backgroundColor: '#fcfcfc', border: '1px solid #cbd5e1' }}>
              <svg width={svgW + 100} height={svgH + 100} viewBox={`-50 -50 ${svgW + 100} ${svgH + 100}`} style={{ backgroundColor: '#ffffff' }}>
                
                {/* Plot Boundary Line (Red Dashed) */}
                <rect x="0" y="0" width={svgW} height={svgH} fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="8,6" />
                <text x={svgW / 2} y="-18" fill="#dc2626" fontSize="11" fontWeight="700" textAnchor="middle">
                  ROADWAY / APPROACH ROAD ({facing.toUpperCase()} FACING — {effW}′ Wide Frontage)
                </text>

                {/* Outer Load Bearing Wall */}
                <rect 
                  x={sideSet * scale} 
                  y={frontSet * scale} 
                  width={innerW * scale} 
                  height={innerL * scale} 
                  fill="#ffffff" 
                  stroke="#0f172a" 
                  strokeWidth="4" 
                />

                {/* Car Porch */}
                <g transform={`translate(${sideSet * scale}, ${frontSet * scale})`}>
                  <rect x="0" y="0" width={innerW * scale * 0.45} height={innerL * scale * 0.28} fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                  <text x={innerW * scale * 0.225} y={innerL * scale * 0.14} fill="#1e293b" fontSize="10" fontWeight="700" textAnchor="middle">CAR PORCH / VERANDAH</text>
                  <text x={innerW * scale * 0.225} y={innerL * scale * 0.14 + 12} fill="#64748b" fontSize="8" textAnchor="middle">(12′ × 10′)</text>
                </g>

                {/* Puja Room */}
                <g transform={`translate(${sideSet * scale + innerW * scale * 0.45}, ${frontSet * scale})`}>
                  <rect x="0" y="0" width={innerW * scale * 0.20} height={innerL * scale * 0.18} fill="#fef3c7" stroke="#334155" strokeWidth="2" />
                  <text x={innerW * scale * 0.10} y={innerL * scale * 0.09} fill="#78350f" fontSize="9" fontWeight="700" textAnchor="middle">PUJA</text>
                  <text x={innerW * scale * 0.10} y={innerL * scale * 0.09 + 10} fill="#92400e" fontSize="7" textAnchor="middle">(5′ × 5′)</text>
                </g>

                {/* Kitchen & Utility */}
                <g transform={`translate(${sideSet * scale + innerW * scale * 0.65}, ${frontSet * scale})`}>
                  <rect x="0" y="0" width={innerW * scale * 0.35} height={innerL * scale * 0.30} fill="#ffedd5" stroke="#334155" strokeWidth="2" />
                  <text x={innerW * scale * 0.175} y={innerL * scale * 0.14} fill="#9a3412" fontSize="10" fontWeight="700" textAnchor="middle">KITCHEN &amp; UTILITY</text>
                  <text x={innerW * scale * 0.175} y={innerL * scale * 0.14 + 12} fill="#c2410c" fontSize="8" textAnchor="middle">(10′ × 10′)</text>
                  <rect x="10" y="10" width="30" height="8" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                  <rect x={innerW * scale * 0.35 - 4} y={innerL * scale * 0.12} width="8" height="20" fill="#38bdf8" />
                </g>

                {/* Living & Dining Hall */}
                <g transform={`translate(${sideSet * scale}, ${frontSet * scale + innerL * scale * 0.28})`}>
                  <rect x="0" y="0" width={innerW * scale * 0.60} height={innerL * scale * 0.40} fill="#e0e7ff" stroke="#334155" strokeWidth="2" />
                  <text x={innerW * scale * 0.30} y={innerL * scale * 0.20} fill="#1e40af" fontSize="11" fontWeight="700" textAnchor="middle">FORMAL LIVING &amp; DINING HALL</text>
                  <text x={innerW * scale * 0.30} y={innerL * scale * 0.20 + 12} fill="#3b82f6" fontSize="8" textAnchor="middle">(16′ × 14′)</text>
                </g>

                {/* Master Bedroom */}
                <g transform={`translate(${sideSet * scale}, ${frontSet * scale + innerL * scale * 0.68})`}>
                  <rect x="0" y="0" width={innerW * scale * 0.60} height={innerL * scale * 0.32} fill="#dcfce7" stroke="#334155" strokeWidth="2" />
                  <text x={innerW * scale * 0.30} y={innerL * scale * 0.16} fill="#166534" fontSize="11" fontWeight="700" textAnchor="middle">MASTER BEDROOM</text>
                  <text x={innerW * scale * 0.30} y={innerL * scale * 0.16 + 12} fill="#15803d" fontSize="8" textAnchor="middle">(14′ × 13′ — Vastu SW Corner)</text>
                </g>

                {/* Attached Bath */}
                <g transform={`translate(${sideSet * scale + innerW * scale * 0.60}, ${frontSet * scale + innerL * scale * 0.68})`}>
                  <rect x="0" y="0" width={innerW * scale * 0.40} height={innerL * scale * 0.32} fill="#e0f2fe" stroke="#334155" strokeWidth="2" />
                  <text x={innerW * scale * 0.20} y={innerL * scale * 0.16} fill="#0369a1" fontSize="9" fontWeight="700" textAnchor="middle">ATTACHED BATH</text>
                  <text x={innerW * scale * 0.20} y={innerL * scale * 0.16 + 10} fill="#0284c7" fontSize="7" textAnchor="middle">(7′ × 6′)</text>
                </g>

              </svg>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', fontWeight: 700, borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
              <span>NOTE: ALL DIMENSIONS ARE IN FEET AND INCHES. STRUCTURAL COLUMNS (9″×12″) TO BE PLACED AT GRID INTERSECTIONS.</span>
              <span>BUILDMITRA CAD BLUEPRINT SUITE © 2026</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
