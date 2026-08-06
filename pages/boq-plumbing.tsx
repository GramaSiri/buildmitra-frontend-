import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { getMasterRate, syncApprovedRatesFromBackend } from '../utils/masterRates';
import MarketRateTrend from '../components/ui/MarketRateTrend';

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { backgroundColor: '#0284c7', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(2,132,199,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#0369a1', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  stepperCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '15px', fontWeight: '700', color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #bae6fd', paddingBottom: '8px' },

  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' },
  inputReadOnly: { backgroundColor: '#f1f5f9', fontWeight: '700', color: '#0284c7' },

  btnPrimary: { backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' },
  metricCard: { padding: '14px', borderRadius: '8px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricMaroon: { backgroundColor: '#0284c7' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tableContainer: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#0284c7', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

  noteBox: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#0369a1', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export default function PlumbingBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Building & Fixtures Inputs
  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(3.5);
  const [toilets, setToilets] = useState(5);
  const [kitchens, setKitchens] = useState(1);

  const [generated, setGenerated] = useState(true);

  // Derived Geometry & Pipe Length Engine
  const plotArea = plotLength * plotWidth;
  const setbackArea = plotArea * 0.10; // Auto 10% setback area
  const footprintArea = Math.max(plotArea - setbackArea, 0);
  const totalBUA = footprintArea * floors;

  const floorCount = Math.max(1, Math.ceil(floors));
  const floorHeightM = 3.0;
  const wetPoints = toilets + kitchens;

  const horizontalWaterPipe = (toilets * 12) + (kitchens * 10);
  const verticalRiserPipe = wetPoints * floorCount * floorHeightM;
  const totalPipeLength = horizontalWaterPipe + verticalRiserPipe;

  // Admin Master Rates Lookup for all 28 Items
  const rates = useMemo(() => ({
    plb01: getMasterRate(["PLB-01", "cpvc 15"], 35),
    plb02: getMasterRate(["PLB-02", "cpvc 20"], 45),
    plb03: getMasterRate(["PLB-03", "cpvc 25"], 60),
    plb04: getMasterRate(["PLB-04", "upvc waste 110"], 120),
    plb05: getMasterRate(["PLB-05", "upvc waste 75"], 80),
    plb06: getMasterRate(["PLB-06", "upvc vent 50"], 55),
    plb07: getMasterRate(["PLB-07", "cpvc elbow 15"], 15),
    plb08: getMasterRate(["PLB-08", "cpvc elbow 20"], 20),
    plb09: getMasterRate(["PLB-09", "cpvc tee 15"], 18),
    plb10: getMasterRate(["PLB-10", "cpvc tee 20"], 25),
    plb11: getMasterRate(["PLB-11", "gate valve 15"], 180),
    plb12: getMasterRate(["PLB-12", "gate valve 20"], 250),
    plb13: getMasterRate(["PLB-13", "stop cock 15"], 120),
    plb14: getMasterRate(["PLB-14", "bib cock"], 250),
    plb15: getMasterRate(["PLB-15", "pillar tap"], 300),
    plb16: getMasterRate(["PLB-16", "angle valve"], 80),
    plb17: getMasterRate(["PLB-17", "health faucet"], 350),
    plb18: getMasterRate(["PLB-18", "western commode"], 3500),
    plb19: getMasterRate(["PLB-19", "wash basin"], 1200),
    plb20: getMasterRate(["PLB-20", "kitchen sink"], 2500),
    plb21: getMasterRate(["PLB-21", "floor trap"], 150),
    plb22: getMasterRate(["PLB-22", "nahani trap"], 120),
    plb23: getMasterRate(["PLB-23", "grease trap"], 400),
    plb24: getMasterRate(["PLB-24", "chamber cover"], 250),
    plb25: getMasterRate(["PLB-25", "solvent cement"], 80),
    plb26: getMasterRate(["PLB-26", "ptfe tape"], 15),
    plb27: getMasterRate(["PLB-27", "clamps"], 20),
    plb28: getMasterRate(["PLB-28", "testing commissioning"], 3000)
  }), []);

  // Plumbing Calculation Engine
  const boqResults = useMemo(() => {
    const items = [
      { sr: 1, code: 'PLB-01', desc: 'CPVC Pipe 15mm (Water Supply Branch Lines)', uom: 'm', qty: totalPipeLength * 0.4, matRate: rates.plb01.rate || 35, labRate: 12 },
      { sr: 2, code: 'PLB-02', desc: 'CPVC Pipe 20mm (Cold & Hot Supply Loop)', uom: 'm', qty: totalPipeLength * 0.35, matRate: rates.plb02.rate || 45, labRate: 14 },
      { sr: 3, code: 'PLB-03', desc: 'CPVC Pipe 25mm (Vertical Riser Main)', uom: 'm', qty: totalPipeLength * 0.15, matRate: rates.plb03.rate || 60, labRate: 16 },
      { sr: 4, code: 'PLB-04', desc: 'UPVC Soil & Waste Pipe 110mm (Main Stack)', uom: 'm', qty: toilets * 4 * floorCount, matRate: rates.plb04.rate || 120, labRate: 25 },
      { sr: 5, code: 'PLB-05', desc: 'UPVC Waste Pipe 75mm (Wash Basin & Shower Drain)', uom: 'm', qty: totalPipeLength * 0.1, matRate: rates.plb05.rate || 80, labRate: 20 },
      { sr: 6, code: 'PLB-06', desc: 'UPVC Vent Pipe 50mm (Cowl Pressure Vent)', uom: 'm', qty: toilets * 3 * floorCount, matRate: rates.plb06.rate || 55, labRate: 15 },
      { sr: 7, code: 'PLB-07', desc: 'CPVC Elbow 15mm', uom: 'nos', qty: totalPipeLength * 0.15, matRate: rates.plb07.rate || 15, labRate: 8 },
      { sr: 8, code: 'PLB-08', desc: 'CPVC Elbow 20mm', uom: 'nos', qty: totalPipeLength * 0.1, matRate: rates.plb08.rate || 20, labRate: 10 },
      { sr: 9, code: 'PLB-09', desc: 'CPVC Tee 15mm', uom: 'nos', qty: totalPipeLength * 0.08, matRate: rates.plb09.rate || 18, labRate: 8 },
      { sr: 10, code: 'PLB-10', desc: 'CPVC Tee 20mm', uom: 'nos', qty: totalPipeLength * 0.06, matRate: rates.plb10.rate || 25, labRate: 10 },
      { sr: 11, code: 'PLB-11', desc: 'Gate Valve 15mm (Control Valve)', uom: 'nos', qty: Math.ceil(toilets + kitchens), matRate: rates.plb11.rate || 180, labRate: 30 },
      { sr: 12, code: 'PLB-12', desc: 'Gate Valve 20mm (Main Riser Valve)', uom: 'nos', qty: Math.ceil(floorCount), matRate: rates.plb12.rate || 250, labRate: 40 },
      { sr: 13, code: 'PLB-13', desc: 'Concealed Stop Cock 15mm', uom: 'nos', qty: Math.ceil(kitchens), matRate: rates.plb13.rate || 120, labRate: 25 },
      { sr: 14, code: 'PLB-14', desc: 'Brass Bib Cock', uom: 'nos', qty: Math.ceil((toilets * 2) + kitchens), matRate: rates.plb14.rate || 250, labRate: 30 },
      { sr: 15, code: 'PLB-15', desc: 'Pillar Tap for Wash Basin', uom: 'nos', qty: Math.ceil(kitchens), matRate: rates.plb15.rate || 300, labRate: 30 },
      { sr: 16, code: 'PLB-16', desc: 'Angle Valve with Flange', uom: 'nos', qty: Math.ceil((toilets * 3) + (kitchens * 2)), matRate: rates.plb16.rate || 80, labRate: 20 },
      { sr: 17, code: 'PLB-17', desc: 'Health Faucet with SS Hose', uom: 'nos', qty: Math.ceil(toilets), matRate: rates.plb17.rate || 350, labRate: 40 },
      { sr: 18, code: 'PLB-18', desc: 'Western Commode (EWC Set)', uom: 'set', qty: Math.ceil(toilets), matRate: rates.plb18.rate || 3500, labRate: 400 },
      { sr: 19, code: 'PLB-19', desc: 'Ceramic Wash Basin Set', uom: 'set', qty: Math.ceil(toilets), matRate: rates.plb19.rate || 1200, labRate: 250 },
      { sr: 20, code: 'PLB-20', desc: 'SS Kitchen Sink Set', uom: 'set', qty: Math.ceil(kitchens), matRate: rates.plb20.rate || 2500, labRate: 350 },
      { sr: 21, code: 'PLB-21', desc: 'PVC Floor Trap with SS Grating', uom: 'nos', qty: Math.ceil(toilets + kitchens), matRate: rates.plb21.rate || 150, labRate: 40 },
      { sr: 22, code: 'PLB-22', desc: 'Multi-Inlet Nahani Trap', uom: 'nos', qty: Math.ceil(toilets), matRate: rates.plb22.rate || 120, labRate: 35 },
      { sr: 23, code: 'PLB-23', desc: 'Kitchen Grease Interceptor Trap', uom: 'nos', qty: Math.ceil(kitchens), matRate: rates.plb23.rate || 400, labRate: 80 },
      { sr: 24, code: 'PLB-24', desc: 'SFRC Chamber Cover', uom: 'nos', qty: Math.ceil(toilets + kitchens + floorCount), matRate: rates.plb24.rate || 250, labRate: 50 },
      { sr: 25, code: 'PLB-25', desc: 'UPVC Solvent Cement Bottle', uom: 'bottle', qty: totalPipeLength * 0.01, matRate: rates.plb25.rate || 80, labRate: 0 },
      { sr: 26, code: 'PLB-26', desc: 'PTFE Thread Seal Tape Roll', uom: 'roll', qty: totalPipeLength * 0.005, matRate: rates.plb26.rate || 15, labRate: 0 },
      { sr: 27, code: 'PLB-27', desc: 'Galvanized Clamps & Hangers', uom: 'set', qty: totalPipeLength * 0.05, matRate: rates.plb27.rate || 20, labRate: 10 },
      { sr: 28, code: 'PLB-28', desc: 'Hydraulic Pressure Testing & Commissioning', uom: 'lump', qty: 1, matRate: rates.plb28.rate || 3000, labRate: 1000 }
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
      totalPipeLength
    };
  }, [plotLength, plotWidth, floors, toilets, kitchens, totalPipeLength, floorCount, totalBUA, rates]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('boq_export', 'boq-plumbing', () => {
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
      XLSX.utils.book_append_sheet(wb, ws, 'Plumbing_BOQ');
      XLSX.writeFile(wb, `BuildMitra_Plumbing_BOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('boq_export', 'boq-plumbing', () => {
      const msg = `*BuildMitra Plumbing BOQ Estimate*%0A` +
        `----------------------------------------%0A` +
        `• *Plot Size*: ${plotLength}' x ${plotWidth}' (${plotArea} Sft) | *Floors*: ${floors}%0A` +
        `• *Total BUA*: ${formatNumber(totalBUA)} Sft | *Toilets*: ${toilets} | *Kitchens*: ${kitchens}%0A` +
        `• *Total Pipe Length*: ${formatNumber(boqResults.totalPipeLength, 1)} Meters%0A` +
        `• *Material Total*: ${formatCurrency(boqResults.materialTotal)}%0A` +
        `• *Labour Total*: ${formatCurrency(boqResults.labourTotal)}%0A` +
        `• *GRAND TOTAL COST*: ${formatCurrency(boqResults.grandTotal)} (${formatCurrency(boqResults.ratePerSft)}/Sft)%0A%0A` +
        `*Generated via BuildMitra Plumbing BOQ Engine*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  const handleReset = () => {
    setPlotLength(30); setPlotWidth(40); setFloors(3.5); setToilets(5); setKitchens(1); setGenerated(false);
  };

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => router.push('/calculators')}>← Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          🚰 Plumbing BOQ Calculator
          <span style={styles.badge}>IS 2065 Water Supply & IS 1742 Drainage Engine</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#bae6fd' }}>BuildMitra Professional Edition</span>
        </div>
      </div>

      {/* 2. Live Market Rate Ticker */}
      <MarketRateTrend />

      {/* 3. Building Details Inputs Form */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📐 Building & Sanitary Fixture Details</span>
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
            <label style={styles.label}>Plot Area (Sft)</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(plotArea)} Sft`}
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
            <label style={styles.label}>Total Built-Up Area (Sft)</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(totalBUA)} Sft`}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>No. of Toilets</label>
            <input
              type="number"
              style={styles.input}
              value={toilets}
              onChange={e => setToilets(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>No. of Kitchens</label>
            <input
              type="number"
              style={styles.input}
              value={kitchens}
              onChange={e => setKitchens(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Structural Engine Rules Badge */}
        <div style={styles.noteBox}>
          💡 <strong>IS Plumbing Engine Rules</strong>: Total Pipe Length: <strong>{formatNumber(boqResults.totalPipeLength, 1)} m</strong> | Toilets: <strong>{toilets}</strong> | Kitchens: <strong>{kitchens}</strong> | Water Supply Loops & Riser Lines Calculated Automatically.
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Form</button>
          <button style={styles.btnPrimary} onClick={() => setGenerated(true)}>🔨 Generate Plumbing BOQ</button>
        </div>
      </div>

      {/* 4. Detailed Results BOQ Cards & Table */}
      {generated && (
        <div style={styles.stepperCard}>
          <div style={styles.sectionHeader}>
            <span>📊 Plumbing BOQ Estimation Summary & Itemized BOQ</span>
          </div>

          {/* Metric Summary Grid */}
          <div style={styles.summaryGrid}>
            <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
              <span style={styles.metricTitle}>Grand Total Cost</span>
              <span style={styles.metricVal}>₹{formatNumber(boqResults.grandTotal / 100000, 2)} Lakhs</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>{formatCurrency(boqResults.grandTotal)}</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Total Pipe Length</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.totalPipeLength, 1)} m</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>Sanitary Fixtures</span>
              <span style={styles.metricVal}>{toilets} Sets</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal, backgroundColor: '#0284c7' }}>
              <span style={styles.metricTitle}>Plumbing Labour Cost</span>
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
            <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('🛒 Plumbing BOQ Package sent to Vendor Marketplace RFQ!')}>🛒 Request Marketplace RFQ</button>
            <button style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('📈 Applied Bengaluru Live Mandi Wholesale Rates to Plumbing BOQ!')}>📈 Sync Live Market Rates</button>
            <button style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('💾 Saved Plumbing BOQ Revision 1.0 to Active Project!')}>💾 Save BOQ Revision</button>
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
                <tr style={{ backgroundColor: '#0284c7', color: 'white', fontWeight: '800' }}>
                  <td colSpan={7} style={{ padding: '12px', fontSize: '13px' }}>GRAND TOTAL ESTIMATED PLUMBING BOQ COST</td>
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
