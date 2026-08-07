import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { getMasterRate, getCombinedBOQRate, syncApprovedRatesFromBackend } from '../utils/masterRates';
import MarketRateTrend from '../components/ui/MarketRateTrend';

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { backgroundColor: '#78350f', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(120,53,15,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#92400e', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  stepperCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '15px', fontWeight: '700', color: '#78350f', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #fde68a', paddingBottom: '8px' },

  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' },
  inputReadOnly: { backgroundColor: '#f1f5f9', fontWeight: '700', color: '#78350f' },
  select: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', outline: 'none' },

  btnPrimary: { backgroundColor: '#78350f', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' },
  metricCard: { padding: '14px', borderRadius: '8px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricMaroon: { backgroundColor: '#78350f' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tableContainer: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#78350f', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

  noteBox: { backgroundColor: '#fef3c7', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#92400e', marginBottom: '14px' }
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

export default function FalseCeilingBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Ceiling Details Inputs
  const [ceilingType, setCeilingType] = useState("Gypsum Board Ceiling");
  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(40);
  const [rooms, setRooms] = useState(1);
  const [coveLength, setCoveLength] = useState(60);
  const [lightPoints, setLightPoints] = useState(12);

  const [generated, setGenerated] = useState(true);

  // Derived Geometry & Material Calculations
  const area = length * width * rooms;
  const perimeter = 2 * (length + width) * rooms;
  const boardArea = area * 1.08;
  const boardNos = ceil(boardArea / 32);
  const mainChannel = area / 3.5;
  const furringChannel = area / 2.5;
  const perimeterChannel = perimeter;
  const hangerRod = area / 20;
  const screwsBox = ceil((area * 1.2) / 1000); // 1 box = 1000 pcs (1.2 screws/sft)
  const jointCompound = area * 0.08;
  const fiberTape = area * 0.35;
  const paintArea = area * 1.05;

  // Admin Master Rates Lookup for all 13 Items
  const rates = useMemo(() => ({
    fcl01: getMasterRate(["FCL-01", "false ceiling area"], 45),
    fcl02: getMasterRate(["FCL-02", "gypsum board"], 420),
    fcl03: getMasterRate(["FCL-03", "perimeter channel"], 18),
    fcl04: getMasterRate(["FCL-04", "main channel"], 28),
    fcl05: getMasterRate(["FCL-05", "furring channel"], 22),
    fcl06: getMasterRate(["FCL-06", "hanger rod"], 35),
    fcl07: getMasterRate(["FCL-07", "drywall screws"], 250),
    fcl08: getMasterRate(["FCL-08", "joint compound"], 45),
    fcl09: getMasterRate(["FCL-09", "fiber tape"], 3),
    fcl10: getMasterRate(["FCL-10", "cove ceiling"], 180),
    fcl11: getMasterRate(["FCL-11", "light cutout"], 40),
    fcl12: getMasterRate(["FCL-12", "ceiling paint"], 18),
    fcl13: getMasterRate(["FCL-13", "ceiling finishing"], 1500)
  }), []);

  // False Ceiling Calculation Engine
  const boqResults = useMemo(() => {
    const materialFactor =
      ceilingType === "POP Ceiling" ? 0.85 :
      ceilingType === "Grid Ceiling" ? 0.95 :
      ceilingType === "PVC Ceiling" ? 0.9 :
      ceilingType === "Wooden Ceiling" ? 1.35 : 1;

    const items = [
      { sr: 1, code: "FCL-01", desc: `${ceilingType} Work Area (Framing & Board Fixing Labour)`, uom: "sft", qty: area, matRate: 0, labRate: rates.fcl01.rate || 45 },
      { sr: 2, code: "FCL-02", desc: "Gypsum Plaster Board 12.5mm (8x4 Sheet)", uom: "nos", qty: boardNos, matRate: (rates.fcl02.rate || 420) * materialFactor, labRate: 0 },
      { sr: 3, code: "FCL-03", desc: "Perimeter Channel (0.5mm GI Section)", uom: "rft", qty: perimeterChannel, matRate: rates.fcl03.rate || 18, labRate: 4 },
      { sr: 4, code: "FCL-04", desc: "Main Channel (0.5mm GI Section)", uom: "rft", qty: mainChannel, matRate: rates.fcl04.rate || 28, labRate: 5 },
      { sr: 5, code: "FCL-05", desc: "Furring / Intermediate Channel (0.5mm GI Section)", uom: "rft", qty: furringChannel, matRate: rates.fcl05.rate || 22, labRate: 5 },
      { sr: 6, code: "FCL-06", desc: "Hanger Rod with Fasteners & Soffit Cleats", uom: "nos", qty: ceil(hangerRod), matRate: rates.fcl06.rate || 35, labRate: 8 },
      { sr: 7, code: "FCL-07", desc: "Drywall Self-Tapping Screws (Box of 1000 pcs)", uom: "box", qty: screwsBox, matRate: rates.fcl07.rate || 250, labRate: 0 },
      { sr: 8, code: "FCL-08", desc: "Jointing Compound / Joint Filler Paste", uom: "kg", qty: jointCompound, matRate: rates.fcl08.rate || 45, labRate: 8 },
      { sr: 9, code: "FCL-09", desc: "Self-Adhesive Fiber Mesh Joint Tape", uom: "rft", qty: fiberTape, matRate: rates.fcl09.rate || 3, labRate: 1 },
      { sr: 10, code: "FCL-10", desc: "Cove / Tray Ceiling Running Profile Work", uom: "rft", qty: coveLength, matRate: rates.fcl10.rate || 180, labRate: 60 },
      { sr: 11, code: "FCL-11", desc: "LED Spot Light Cutout Openings", uom: "nos", qty: lightPoints, matRate: rates.fcl11.rate || 40, labRate: 25 },
      { sr: 12, code: "FCL-12", desc: "Touch-up Putty, Primer & 2 Coats Emulsion Paint", uom: "sft", qty: paintArea, matRate: rates.fcl12.rate || 18, labRate: 12 },
      { sr: 13, code: "FCL-13", desc: "Final Cleaning, Surface Protection & Finishing", uom: "lump", qty: 1, matRate: rates.fcl13.rate || 1500, labRate: 800 }
    ];

    const processedItems = items.map(i => {
      const combined = getCombinedBOQRate(i.code, i.matRate, i.labRate);
      const matRate = i.sr === 2 ? combined.materialRate * materialFactor : combined.materialRate;
      const labRate = combined.labourRate;
      const amount = i.qty * (matRate + labRate);
      return { ...i, matRate, labRate, amount };
    });

    const materialTotal = processedItems.reduce((sum, i) => sum + (i.qty * i.matRate), 0);
    const labourTotal = processedItems.reduce((sum, i) => sum + (i.qty * i.labRate), 0);
    const grandTotal = materialTotal + labourTotal;
    const ratePerSft = area > 0 ? grandTotal / area : 0;

    return {
      items: processedItems,
      materialTotal,
      labourTotal,
      grandTotal,
      ratePerSft,
      area,
      boardNos
    };
  }, [ceilingType, area, boardNos, perimeterChannel, mainChannel, furringChannel, hangerRod, screwsBox, jointCompound, fiberTape, coveLength, lightPoints, paintArea, rates]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('boq_export', 'boq-false-ceiling', () => {
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
      XLSX.utils.book_append_sheet(wb, ws, 'False_Ceiling_BOQ');
      XLSX.writeFile(wb, `BuildMitra_False_Ceiling_BOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('boq_export', 'boq-false-ceiling', () => {
      const msg = `*BuildMitra False Ceiling BOQ Estimate*%0A` +
        `----------------------------------------%0A` +
        `• *Ceiling Type*: ${ceilingType}%0A` +
        `• *Ceiling Area*: ${formatNumber(boqResults.area)} Sft | *Rooms*: ${rooms}%0A` +
        `• *Gypsum Boards (8x4)*: ${boqResults.boardNos} Sheets%0A` +
        `• *Cove Profile Length*: ${coveLength} Rft | *Light Cutouts*: ${lightPoints} Nos%0A` +
        `• *Material Total*: ${formatCurrency(boqResults.materialTotal)}%0A` +
        `• *Labour Total*: ${formatCurrency(boqResults.labourTotal)}%0A` +
        `• *GRAND TOTAL COST*: ${formatCurrency(boqResults.grandTotal)} (${formatCurrency(boqResults.ratePerSft)}/Sft)%0A%0A` +
        `*Generated via BuildMitra False Ceiling BOQ Engine*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  const handleReset = () => {
    setCeilingType("Gypsum Board Ceiling"); setLength(30); setWidth(40); setRooms(1); setCoveLength(60); setLightPoints(12);
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
          ⬇️ False Ceiling BOQ Calculator
          <span style={styles.badge}>IS 2095 Gypsum Board Specification Engine</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#fde68a' }}>BuildMitra Professional Edition</span>
        </div>
      </div>

      {/* 2. Live Market Rate Ticker */}
      <MarketRateTrend />

      {/* 3. Ceiling Details Inputs Form */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📐 Ceiling Specifications & Dimensions</span>
        </div>

        <div style={styles.grid4}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Ceiling Type</label>
            <select style={styles.select} value={ceilingType} onChange={e => setCeilingType(e.target.value)}>
              <option value="Gypsum Board Ceiling">Gypsum Board Ceiling (12.5mm Plain)</option>
              <option value="POP Ceiling">POP Ceiling (Plaster of Paris)</option>
              <option value="Grid Ceiling">Modular Grid Ceiling (2x2 Tile)</option>
              <option value="PVC Ceiling">PVC Ceiling Panel</option>
              <option value="Wooden Ceiling">Wooden Fluted / Louvre Ceiling</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={length}
              onChange={e => setLength(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={width}
              onChange={e => setWidth(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>No. of Rooms</label>
            <input
              type="number"
              style={styles.input}
              value={rooms}
              onChange={e => setRooms(parseFloat(e.target.value) || 1)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Cove / Tray Length (Rft)</label>
            <input
              type="number"
              style={styles.input}
              value={coveLength}
              onChange={e => setCoveLength(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Light Point Cutouts</label>
            <input
              type="number"
              style={styles.input}
              value={lightPoints}
              onChange={e => setLightPoints(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Total Ceiling Area (Sft)</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(area)} Sft`}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Gypsum Boards (8x4)</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${boardNos} Sheets`}
            />
          </div>
        </div>

        {/* Structural Engine Rules Badge */}
        <div style={styles.noteBox}>
          💡 <strong>IS False Ceiling Rules</strong>: Ceiling Area: <strong>{formatNumber(area)} Sft</strong> | Boards (8x4): <strong>{boardNos} sheets</strong> | Drywall Screws: <strong>{screwsBox} Box (1000 pcs/box)</strong> | Channels: Main & Furring GI 0.5mm Sections Calculated.
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Form</button>
          <button style={styles.btnPrimary} onClick={() => setGenerated(true)}>🔨 Generate False Ceiling BOQ</button>
        </div>
      </div>

      {/* 4. Detailed Results BOQ Cards & Table */}
      {generated && (
        <div style={styles.stepperCard}>
          <div style={styles.sectionHeader}>
            <span>📊 False Ceiling BOQ Estimation Summary & Itemized BOQ</span>
          </div>

          {/* Metric Summary Grid */}
          <div style={styles.summaryGrid}>
            <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
              <span style={styles.metricTitle}>Grand Total Cost</span>
              <span style={styles.metricVal}>₹{formatNumber(boqResults.grandTotal / 100000, 2)} Lakhs</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>{formatCurrency(boqResults.grandTotal)}</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Ceiling Area</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.area)} Sft</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>Gypsum Board Sheets</span>
              <span style={styles.metricVal}>{boqResults.boardNos} Nos</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal, backgroundColor: '#0284c7' }}>
              <span style={styles.metricTitle}>Framing & Fixing Labour</span>
              <span style={styles.metricVal}>₹{formatNumber(boqResults.labourTotal / 100000, 2)} Lakhs</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>{formatCurrency(boqResults.labourTotal)}</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
              <span style={styles.metricTitle}>Estimated Rate / Sft</span>
              <span style={styles.metricVal}>{formatCurrency(boqResults.ratePerSft)} / Sft</span>
            </div>
          </div>

          {/* BOQ Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>💬 WhatsApp Share</button>
            <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('🛒 False Ceiling BOQ Package sent to Vendor Marketplace RFQ!')}>🛒 Request Marketplace RFQ</button>
            <button style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('📈 Applied Bengaluru Live Mandi Wholesale Rates to False Ceiling BOQ!')}>📈 Sync Live Market Rates</button>
            <button style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('💾 Saved False Ceiling BOQ Revision 1.0 to Active Project!')}>💾 Save BOQ Revision</button>
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
                <tr style={{ backgroundColor: '#78350f', color: 'white', fontWeight: '800' }}>
                  <td colSpan={7} style={{ padding: '12px', fontSize: '13px' }}>GRAND TOTAL ESTIMATED FALSE CEILING BOQ COST</td>
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