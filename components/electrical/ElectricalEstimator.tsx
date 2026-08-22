import React, { useState, useMemo, useEffect } from "react";
import { exportToExcel, shareWhatsApp } from "../../utils/exportUtils";
import { generateElectricalPdfReport } from "../../utils/pdfExport";
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../../utils/masterRates";

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    boxSizing: 'border-box',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#1d4ed8',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(29,78,216,0.2)'
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  badge: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '18px',
    marginBottom: '16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
  },
  sectionHeader: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1d4ed8',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #bfdbfe',
    paddingBottom: '8px'
  },
  gridCompact: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginBottom: '12px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '2px'
  },
  input: {
    width: '100%',
    height: '38px',
    padding: '8px 12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  inputModified: {
    color: '#dc2626',
    fontWeight: '800',
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  metricCard: {
    padding: '16px',
    borderRadius: '10px',
    color: 'white',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
  },
  metricBlue: { backgroundColor: '#1d4ed8' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '12px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '700', letterSpacing: '0.5px' },
  metricVal: { fontSize: '18px', fontWeight: '800', marginTop: '6px' },
  metricValGrand: { fontSize: '22px', fontWeight: '900', marginTop: '6px' },

  tableContainer: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    marginBottom: '16px'
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '15px' },
  th: { backgroundColor: '#1d4ed8', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '15px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px' },

  btnPrimary: { backgroundColor: '#1d4ed8', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const ElectricalEstimator: React.FC = () => {
  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [lightFanPoints, setLightFanPoints] = useState<number>(36);
  const [powerPoints6A, setPowerPoints6A] = useState<number>(18);
  const [heavyPoints16A, setHeavyPoints16A] = useState<number>(8);
  const [dbBoxCount, setDbBoxCount] = useState<number>(2);
  const [earthPitCount, setEarthPitCount] = useState<number>(2);
  const [sanctionedKw, setSanctionedKw] = useState<number>(5);
  const [solarKw, setSolarKw] = useState<number>(3);

  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  const handleInputChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (0 fallback)
  const lightRateRes = getMasterRate(["MAT-ELE-01", "electrical conduit", "light point"], 0);
  const socket6aRateRes = getMasterRate(["MAT-ELE-01", "6a socket", "electrical socket"], 0);
  const heavy16aRateRes = getMasterRate(["MAT-ELE-01", "16a socket", "heavy power"], 0);
  const dbBoxRateRes = getMasterRate(["MAT-ELE-01", "distribution board", "db box"], 0);
  const earthPitRateRes = getMasterRate(["MAT-ELE-01", "chemical earthing", "earth pit"], 0);
  const bescomRateRes = getMasterRate(["SRV-TRN-LAY", "bescom deposit", "service main"], 0);
  const solarRateRes = getMasterRate(["MAT-PEB-PRM", "solar pv", "solar panel"], 0);

  const boqItems = useMemo(() => {
    const rawItems = [
      {
        code: lightRateRes.itemCode || "MAT-ELE-LGT",
        category: "Wiring & Points",
        name: "Light / Fan Point Wiring (FR-LSH 1.5 sq.mm copper wire, PVC conduit & modular switch)",
        uom: "NOS",
        qty: lightFanPoints,
        rateObj: lightRateRes
      },
      {
        code: socket6aRateRes.itemCode || "MAT-ELE-6A",
        category: "Wiring & Points",
        name: "6A Plug Socket Point (FR-LSH 2.5 sq.mm copper wire, 6A socket & switch)",
        uom: "NOS",
        qty: powerPoints6A,
        rateObj: socket6aRateRes
      },
      {
        code: heavy16aRateRes.itemCode || "MAT-ELE-16A",
        category: "Wiring & Points",
        name: "16A Heavy Power Socket Point for AC / Geyser (4.0 sq.mm wire & MCB)",
        uom: "NOS",
        qty: heavyPoints16A,
        rateObj: heavy16aRateRes
      },
      {
        code: dbBoxRateRes.itemCode || "MAT-ELE-DB",
        category: "Switchgear & Distribution",
        name: "Main Distribution Board (IP42 enclosure, 4-Pole Main Isolator & RCCB 30mA)",
        uom: "NOS",
        qty: dbBoxCount,
        rateObj: dbBoxRateRes
      },
      {
        code: earthPitRateRes.itemCode || "MAT-ELE-ETH",
        category: "Earthing & Protection",
        name: "Chemical Pipe Earthing Pit Complete (50mm dia 3m copper bonded electrode)",
        uom: "NOS",
        qty: earthPitCount,
        rateObj: earthPitRateRes
      },
      {
        code: bescomRateRes.itemCode || "SRV-ELE-UTIL",
        category: "BESCOM Utility Charges",
        name: "BESCOM Official Service Main Charges & Initial Security Deposit (ISD)",
        uom: "KW",
        qty: sanctionedKw,
        rateObj: bescomRateRes
      },
      {
        code: solarRateRes.itemCode || "MAT-SOL-SYS",
        category: "Renewable Solar System",
        name: "Rooftop Solar PV On-Grid System (Net Metering Complete)",
        uom: "KW",
        qty: solarKw,
        rateObj: solarRateRes
      }
    ];

    let totalMaterialCost = 0;
    let totalLabourCost = 0;

    const processedItems = rawItems.map(it => {
      const isFound = it.rateObj.found && Number(it.rateObj.rate) > 0;
      const rateVal = isFound ? Number(it.rateObj.rate) : 0;
      const amountVal = isFound ? it.qty * rateVal : 0;

      if (it.category.includes("Utility") || it.category.includes("Labour")) {
        totalLabourCost += amountVal;
      } else {
        totalMaterialCost += amountVal;
      }

      return {
        ...it,
        isFound,
        rateVal,
        amountVal
      };
    });

    const grandTotalCost = totalMaterialCost + totalLabourCost;
    const missingItems = processedItems.filter(it => !it.isFound);

    return {
      totalPoints: lightFanPoints + powerPoints6A + heavyPoints16A,
      totalMaterialCost,
      totalLabourCost,
      grandTotalCost,
      items: processedItems,
      missingItems
    };
  }, [lightFanPoints, powerPoints6A, heavyPoints16A, dbBoxCount, earthPitCount, sanctionedKw, solarKw, lightRateRes, socket6aRateRes, heavy16aRateRes, dbBoxRateRes, earthPitRateRes, bescomRateRes, solarRateRes]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    exportToExcel(
      boqItems.items.map(it => ({
        "Master Code": it.code,
        "Category": it.category,
        "Description": it.name,
        "Quantity": it.qty,
        "UOM": it.uom,
        "Approved Rate (₹)": it.isFound ? it.rateVal : "Master Mapping Required / Approved Rate Unavailable",
        "Total Amount (₹)": it.isFound ? it.amountVal : "—"
      })),
      `BuildMitra_Electrical_BOQ_${Date.now()}.xlsx`
    );
  };

  const handleExportPDF = () => {
    generateElectricalPdfReport(
      boqItems.items.map(it => ({
        id: it.code,
        category: it.category,
        itemDescription: it.name,
        unit: it.uom,
        quantity: it.qty,
        ratePerUnit: it.rateVal,
        totalAmount: it.amountVal
      })),
      boqItems.grandTotalCost,
      0,
      boqItems.grandTotalCost,
      sanctionedKw,
      solarKw
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.badge}>MEP &amp; ELECTRICAL</span>
          <h1 style={styles.headerTitle}>🔌 BuildMitra – Electrical &amp; Solar BOQ Estimator</h1>
        </div>
      </div>

      {/* Inputs */}
      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <span>📐 Enter Electrical Points &amp; Load Parameters</span>
        </div>

        <div style={styles.gridCompact}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Light &amp; Fan Points (Nos)</label>
            <input type="number" value={lightFanPoints} onChange={(e) => handleInputChange(setLightFanPoints, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>6A Power Sockets (Nos)</label>
            <input type="number" value={powerPoints6A} onChange={(e) => handleInputChange(setPowerPoints6A, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>16A Heavy Sockets (Nos)</label>
            <input type="number" value={heavyPoints16A} onChange={(e) => handleInputChange(setHeavyPoints16A, Number(e.target.value))} style={styles.input} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Distribution Boards (DB)</label>
            <input type="number" value={dbBoxCount} onChange={(e) => handleInputChange(setDbBoxCount, Number(e.target.value))} style={styles.input} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Earthing Pits (Nos)</label>
            <input type="number" value={earthPitCount} onChange={(e) => handleInputChange(setEarthPitCount, Number(e.target.value))} style={styles.input} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>BESCOM Sanctioned Load (kW)</label>
            <input type="number" value={sanctionedKw} onChange={(e) => handleInputChange(setSanctionedKw, Number(e.target.value))} style={styles.input} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Rooftop Solar PV (kW)</label>
            <input type="number" value={solarKw} onChange={(e) => handleInputChange(setSolarKw, Number(e.target.value))} style={styles.input} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
          <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Electrical BOQ</button>
          <button style={styles.btnReset} onClick={() => setLightFanPoints(36)}>🔄 Reset</button>
          <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
          <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
        </div>
      </div>

      {/* Result Metric Cards */}
      <div style={styles.summaryGrid}>
        <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
          <span style={styles.metricTitle}>Total Wiring Points</span>
          <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#93c5fd' : '#ffffff' }}>{boqItems.totalPoints} Points</span>
        </div>
        <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
          <span style={styles.metricTitle}>Sanctioned Power</span>
          <span style={styles.metricVal}>{sanctionedKw} kW</span>
        </div>
        <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
          <span style={styles.metricTitle}>Solar Capacity</span>
          <span style={styles.metricVal}>{solarKw} kW</span>
        </div>
        <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
          <span style={styles.metricTitle}>Material Subtotal</span>
          <span style={styles.metricVal}>{formatCurrency(boqItems.totalMaterialCost)}</span>
        </div>
        <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
          <span style={styles.metricTitle}>GRAND ESTIMATED TOTAL</span>
          <span style={{ ...styles.metricValGrand, color: isCalculatedBlue ? '#60a5fa' : '#ffffff' }}>{formatCurrency(boqItems.grandTotalCost)}</span>
        </div>
      </div>

      {/* Missing Master Items Alert */}
      {boqItems.missingItems.length > 0 && (
        <div style={styles.warnBanner}>
          ⚠️ <strong>Master Mapping Required / Approved Rate Unavailable ({boqItems.missingItems.length} Line Items)</strong>
          <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
            {boqItems.missingItems.map(it => (
              <li key={it.code}>
                <code>{it.code}</code>: {it.name} — Quantity: <strong>{it.qty.toLocaleString()} {it.uom}</strong> (Status: <em>Master Mapping Required</em>)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Itemized BOQ Table */}
      <div style={styles.tableContainer}>
        <div style={{ padding: '12px 16px', backgroundColor: '#1d4ed8', color: 'white', fontWeight: '800', fontSize: '16px' }}>
          📑 Itemized Electrical &amp; Solar BOQ (Admin Master Linked)
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Master Code</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Item Description</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>UOM</th>
              <th style={styles.th}>Approved Rate (₹)</th>
              <th style={styles.th}>Total Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {boqItems.items.map(it => (
              <tr key={it.code}>
                <td style={styles.td}><code>{it.code}</code></td>
                <td style={styles.td}>{it.category}</td>
                <td style={styles.td}><strong>{it.name}</strong></td>
                <td style={styles.td}>{it.qty.toLocaleString()}</td>
                <td style={styles.td}>{it.uom}</td>
                <td style={styles.td}>
                  {it.isFound ? formatCurrency(it.rateVal) : <span style={{ color: '#dc2626', fontWeight: '700' }}>Master Mapping Required / Approved Rate Unavailable</span>}
                </td>
                <td style={styles.td}>
                  {it.isFound ? <strong>{formatCurrency(it.amountVal)}</strong> : <span style={{ color: '#94a3b8' }}>—</span>}
                </td>
              </tr>
            ))}
            <tr style={{ backgroundColor: '#1d4ed8', color: 'white', fontWeight: '800' }}>
              <td colSpan={6} style={{ padding: '12px 14px', fontSize: '16px' }}>GRAND TOTAL ESTIMATED COST</td>
              <td style={{ padding: '12px 14px', fontSize: '18px' }}>{formatCurrency(boqItems.grandTotalCost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ElectricalEstimator;
