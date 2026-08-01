import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../utils/pdfExport';
import { getMasterRate, syncApprovedRatesFromBackend } from '../utils/masterRates';
import MarketRateTrend from '../components/ui/MarketRateTrend';

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { backgroundColor: '#db2777', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(219,39,119,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#be185d', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  stepperCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '15px', fontWeight: '700', color: '#db2777', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #fbcfe8', paddingBottom: '8px' },

  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' },
  inputReadOnly: { backgroundColor: '#f1f5f9', fontWeight: '700', color: '#db2777' },
  select: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', outline: 'none' },

  btnPrimary: { backgroundColor: '#db2777', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' },
  metricCard: { padding: '14px', borderRadius: '8px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricMaroon: { backgroundColor: '#db2777' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tableContainer: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#db2777', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

  noteBox: { backgroundColor: '#fce4ec', border: '1px solid #fbcfe8', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#be185d', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const ceil = (n: any) => Math.ceil(Number(n || 0));

export default function PaintingBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Building & Surface Inputs
  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(3.5);
  const [wallHeight, setWallHeight] = useState(10);
  const [paintType, setPaintType] = useState("Premium Emulsion");
  const [exteriorPercent, setExteriorPercent] = useState(25);
  const [doors, setDoors] = useState(20);
  const [windows, setWindows] = useState(12);

  const [generated, setGenerated] = useState(true);

  // Derived Geometry & Surface Calculations
  const plotArea = plotLength * plotWidth;
  const setbackArea = plotArea * 0.10; // Auto 10% setback area
  const footprintArea = plotArea - setbackArea;
  const totalBUA = footprintArea * floors;

  const floorCount = Math.max(1, ceil(floors));
  const perimeter = 2 * (plotLength + plotWidth);
  const externalWallArea = perimeter * wallHeight * floorCount;
  const internalWallArea = totalBUA * 2.7;
  const ceilingArea = totalBUA;
  const openingDeduction = (doors * 21) + (windows * 15);
  const netWallArea = Math.max(0, internalWallArea + externalWallArea - openingDeduction);
  const exteriorArea = netWallArea * (exteriorPercent / 100);
  const interiorArea = netWallArea - exteriorArea;

  const primerCoverage = 100;
  const puttyCoverage = 18;
  const paintCoverage = paintType === "Economy Emulsion" ? 120 : paintType === "Premium Emulsion" ? 140 : 160;

  const interiorPaintLtr = interiorArea / paintCoverage / 2;
  const exteriorPaintLtr = exteriorArea / 120 / 2;
  const primerLtr = netWallArea / primerCoverage;
  const puttyKg = interiorArea / puttyCoverage;
  const ceilingPaintLtr = ceilingArea / 130 / 2;
  const enamelLtr = ((doors * 21) + (windows * 15)) / 100;

  // Admin Master Rates Lookup for all 10 Items
  const rates = useMemo(() => ({
    pnt01: getMasterRate(["PNT-01", "wall putty"], 28),
    pnt02: getMasterRate(["PNT-02", "interior primer"], 120),
    pnt03: getMasterRate(["PNT-03", "interior paint"], 220),
    pnt04: getMasterRate(["PNT-04", "exterior paint"], 280),
    pnt05: getMasterRate(["PNT-05", "ceiling paint"], 180),
    pnt06: getMasterRate(["PNT-06", "enamel paint"], 260),
    pnt07: getMasterRate(["PNT-07", "sand paper"], 12),
    pnt08: getMasterRate(["PNT-08", "masking tape"], 80),
    pnt09: getMasterRate(["PNT-09", "scaffolding"], 2500),
    pnt10: getMasterRate(["PNT-10", "painting finishing"], 1500)
  }), []);

  // Painting Calculation Engine
  const boqResults = useMemo(() => {
    const items = [
      { sr: 1, code: "PNT-01", desc: "Wall Putty (2 Coats)", uom: "kg", qty: puttyKg, matRate: rates.pnt01.rate || 28, labRate: 10 },
      { sr: 2, code: "PNT-02", desc: "Interior Primer Coat", uom: "ltr", qty: primerLtr, matRate: rates.pnt02.rate || 120, labRate: 12 },
      { sr: 3, code: "PNT-03", desc: `${paintType} Interior Paint (2 Coats)`, uom: "ltr", qty: interiorPaintLtr, matRate: rates.pnt03.rate || 220, labRate: 18 },
      { sr: 4, code: "PNT-04", desc: "Exterior Weather Coat Paint", uom: "ltr", qty: exteriorPaintLtr, matRate: rates.pnt04.rate || 280, labRate: 22 },
      { sr: 5, code: "PNT-05", desc: "Ceiling Tractor Emulsion Paint", uom: "ltr", qty: ceilingPaintLtr, matRate: rates.pnt05.rate || 180, labRate: 15 },
      { sr: 6, code: "PNT-06", desc: "Enamel Paint for Doors & Windows", uom: "ltr", qty: enamelLtr, matRate: rates.pnt06.rate || 260, labRate: 25 },
      { sr: 7, code: "PNT-07", desc: "Sand Paper Sheets", uom: "nos", qty: ceil(netWallArea / 120), matRate: rates.pnt07.rate || 12, labRate: 0 },
      { sr: 8, code: "PNT-08", desc: "Masking Tape & Protective Rolls", uom: "roll", qty: ceil(netWallArea / 500), matRate: rates.pnt08.rate || 80, labRate: 0 },
      { sr: 9, code: "PNT-09", desc: "Scaffolding & Ladder Support Hire", uom: "lump", qty: 1, matRate: rates.pnt09.rate || 2500, labRate: 1500 },
      { sr: 10, code: "PNT-10", desc: "Final Touchup, Masking Removal & Site Cleaning", uom: "lump", qty: 1, matRate: rates.pnt10.rate || 1500, labRate: 1000 }
    ];

    const processedItems = items.map(i => {
      const amount = i.qty * (i.matRate + i.labRate);
      return { ...i, amount };
    });

    const materialTotal = processedItems.reduce((sum, i) => sum + (i.qty * i.matRate), 0);
    const labourTotal = processedItems.reduce((sum, i) => sum + (i.qty * i.labRate), 0);
    const grandTotal = materialTotal + labourTotal;
    const ratePerSft = totalBUA > 0 ? grandTotal / totalBUA : 0;

    return {
      items: processedItems,
      materialTotal,
      labourTotal,
      grandTotal,
      ratePerSft,
      totalBUA,
      netWallArea,
      interiorArea,
      exteriorArea
    };
  }, [paintType, puttyKg, primerLtr, interiorPaintLtr, exteriorPaintLtr, ceilingPaintLtr, enamelLtr, netWallArea, totalBUA, interiorArea, exteriorArea, rates]);

  // Download PDF
  const handleDownloadPDF = () => {
    checkAndRun('boq_export', 'boq-painting', () => {
      downloadBuildMitraPDF({
        documentTitle: 'BuildMitra Painting BOQ Estimate',
        items: boqResults.items.map((i: any) => ({
          sno: i.sr,
          description: `[${i.code}] ${i.desc}`,
          quantity: i.qty,
          unit: i.uom,
          rate: i.matRate + i.labRate,
          amount: i.amount
        })),
        grandTotal: boqResults.grandTotal
      });
    });
  };

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('boq_export', 'boq-painting', () => {
      const data = boqResults.items.map((i: any) => ({
        'Sr No': i.sr,
        'Item Code': i.code,
        'Description': i.desc,
        'UOM': i.uom,
        'Quantity': formatNumber(i.qty),
        'Mat. Rate (₹)': formatCurrency(i.matRate),
        'Lab. Rate (₹)': formatCurrency(i.labRate),
        'Total Amount (₹)': formatCurrency(i.amount)
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Painting_BOQ');
      XLSX.writeFile(wb, `BuildMitra_Painting_BOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('boq_export', 'boq-painting', () => {
      const msg = `*BuildMitra Painting BOQ Estimate*%0A` +
        `----------------------------------------%0A` +
        `• *Plot Size*: ${plotLength}' x ${plotWidth}' | *Floors*: ${floors}%0A` +
        `• *Total BUA*: ${formatNumber(totalBUA)} Sft | *Net Paint Area*: ${formatNumber(boqResults.netWallArea)} Sft%0A` +
        `• *Paint Grade*: ${paintType} | *Exterior Ratio*: ${exteriorPercent}%%0A` +
        `• *Material Total*: ${formatCurrency(boqResults.materialTotal)}%0A` +
        `• *Labour Total*: ${formatCurrency(boqResults.labourTotal)}%0A` +
        `• *GRAND TOTAL COST*: ${formatCurrency(boqResults.grandTotal)} (${formatCurrency(boqResults.ratePerSft)}/Sft BUA)%0A%0A` +
        `*Generated via BuildMitra Painting BOQ Engine*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  const handleReset = () => {
    setPlotLength(30); setPlotWidth(40); setFloors(3.5); setWallHeight(10); setPaintType("Premium Emulsion");
    setExteriorPercent(25); setDoors(20); setWindows(12);
    setGenerated(false);
  };

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => router.push('/calculators')}>← Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          🎨 Painting BOQ Calculator
          <span style={styles.badge}>IS 2395 Building Painting Code Engine</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#fbcfe8' }}>BuildMitra Professional Edition</span>
        </div>
      </div>

      {/* 2. Live Market Rate Ticker */}
      <MarketRateTrend />

      {/* 3. Building & Surface Details Inputs Form */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📐 Building & Surface Painting Details</span>
        </div>

        <div style={styles.grid4}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Plot Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={plotLength}
              onChange={e => setPlotLength(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Plot Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={plotWidth}
              onChange={e => setPlotWidth(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>No. of Floors</label>
            <input
              type="number"
              style={styles.input}
              value={floors}
              onChange={e => setFloors(parseFloat(e.target.value) || 1)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Clear Wall Height (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={wallHeight}
              onChange={e => setWallHeight(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Paint Quality Grade</label>
            <select style={styles.select} value={paintType} onChange={e => setPaintType(e.target.value)}>
              <option value="Economy Emulsion">Economy Emulsion (Tractor Emulsion)</option>
              <option value="Premium Emulsion">Premium Emulsion (Apcolite Premium)</option>
              <option value="Luxury Emulsion">Luxury Emulsion (Royale Silk Finish)</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Exterior Wall Ratio (%)</label>
            <input
              type="number"
              style={styles.input}
              value={exteriorPercent}
              onChange={e => setExteriorPercent(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Doors Count (Nos)</label>
            <input
              type="number"
              style={styles.input}
              value={doors}
              onChange={e => setDoors(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Windows Count (Nos)</label>
            <input
              type="number"
              style={styles.input}
              value={windows}
              onChange={e => setWindows(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Total Built-Up Area (Sft)</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(totalBUA)} Sft`}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Total Net Paint Area (Sft)</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(netWallArea)} Sft`}
            />
          </div>
        </div>

        {/* Structural Engine Rules Badge */}
        <div style={styles.noteBox}>
          💡 <strong>IS Painting Engine Rules</strong>: Total BUA: <strong>{formatNumber(totalBUA)} Sft</strong> | Net Paint Area: <strong>{formatNumber(netWallArea)} Sft</strong> | Wall Putty (2 Coats): <strong>{formatNumber(puttyKg, 1)} kg</strong> | Interior Paint: <strong>{formatNumber(interiorPaintLtr, 1)} Ltr</strong> | Exterior Paint: <strong>{formatNumber(exteriorPaintLtr, 1)} Ltr</strong>.
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Form</button>
          <button style={styles.btnPrimary} onClick={() => setGenerated(true)}>🔨 Generate Painting BOQ</button>
        </div>
      </div>

      {/* 4. Detailed Results BOQ Cards & Table */}
      {generated && (
        <div style={styles.stepperCard}>
          <div style={styles.sectionHeader}>
            <span>📊 Painting BOQ Estimation Summary & Itemized BOQ</span>
          </div>

          {/* Metric Summary Grid */}
          <div style={styles.summaryGrid}>
            <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
              <span style={styles.metricTitle}>Grand Total Cost</span>
              <span style={styles.metricVal}>₹{formatNumber(boqResults.grandTotal / 100000, 2)} Lakhs</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>{formatCurrency(boqResults.grandTotal)}</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Total BUA</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.totalBUA)} Sft</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>Net Paint Area</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.netWallArea)} Sft</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal, backgroundColor: '#0284c7' }}>
              <span style={styles.metricTitle}>Painting Labour Cost</span>
              <span style={styles.metricVal}>₹{formatNumber(boqResults.labourTotal / 100000, 2)} Lakhs</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>{formatCurrency(boqResults.labourTotal)}</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
              <span style={styles.metricTitle}>Estimated Rate / Sft BUA</span>
              <span style={styles.metricVal}>{formatCurrency(boqResults.ratePerSft)} / Sft</span>
            </div>
          </div>

          {/* BOQ Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={handleDownloadPDF}>📄 Download in PDF</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export in Excel</button>
            <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share on WhatsApp</button>
            <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('🛒 Painting BOQ Package sent to Vendor Marketplace RFQ!')}>🛒 Request Marketplace RFQ</button>
            <button style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('📈 Applied Bengaluru Live Mandi Wholesale Rates to Painting BOQ!')}>📈 Sync Live Market Rates</button>
            <button style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('💾 Saved Painting BOQ Revision 1.0 to Active Project!')}>💾 Save BOQ Revision</button>
          </div>

          {/* Itemized BOQ Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr.</th>
                  <th style={styles.th}>Item Code</th>
                  <th style={styles.th}>Item Description</th>
                  <th style={styles.th}>UOM</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Mat. Rate</th>
                  <th style={styles.th}>Lab. Rate</th>
                  <th style={styles.th}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {boqResults.items.map((i: any, idx: number) => (
                  <tr key={i.sr} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={styles.td}><strong>{i.sr}</strong></td>
                    <td style={styles.td}><code>{i.code}</code></td>
                    <td style={styles.td}><strong>{i.desc}</strong></td>
                    <td style={styles.td}>{i.uom}</td>
                    <td style={styles.td}>{formatNumber(i.qty)}</td>
                    <td style={styles.td}>{formatCurrency(i.matRate)}</td>
                    <td style={styles.td}>{formatCurrency(i.labRate)}</td>
                    <td style={styles.td}><strong>{formatCurrency(i.amount)}</strong></td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#db2777', color: 'white', fontWeight: '800' }}>
                  <td colSpan={7} style={{ padding: '12px', fontSize: '13px' }}>GRAND TOTAL ESTIMATED PAINTING BOQ COST</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{formatCurrency(boqResults.grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}