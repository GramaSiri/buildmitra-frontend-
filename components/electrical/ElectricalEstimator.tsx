import React, { useState, useMemo, useEffect } from "react";
import { exportToExcel, shareWhatsApp } from "../../utils/exportUtils";
import { generateElectricalPdfReport } from "../../utils/pdfExport";
import { getMasterRate } from "../../utils/masterRates";

export interface ElectricalBOQItem {
  id: string;
  category: string;
  itemDescription: string;
  unit: string;
  quantity: number;
  ratePerUnit: number;
  totalAmount: number;
}

export const ElectricalEstimator: React.FC = () => {
  // Quantities
  const [lightFanPoints, setLightFanPoints] = useState<number>(36);
  const [powerPoints6A, setPowerPoints6A] = useState<number>(18);
  const [heavyPoints16A, setHeavyPoints16A] = useState<number>(8);
  const [dbBoxCount, setDbBoxCount] = useState<number>(2);
  const [earthPitCount, setEarthPitCount] = useState<number>(2);
  const [sanctionedKw, setSanctionedKw] = useState<number>(5);
  const [solarKw, setSolarKw] = useState<number>(3);
  const [overheadPercent, setOverheadPercent] = useState<number>(10);

  // Custom unit rate overrides initialized with Rate (₹)s if available
  const [rates, setRates] = useState<Record<string, number>>(() => ({
    light_point: getMasterRate(["light", "point", "electrical"], 1000).rate,
    power_6a: getMasterRate(["6a", "socket", "power"], 1200).rate,
    heavy_16a: getMasterRate(["16a", "ac", "geyser", "heavy"], 2200).rate,
    db_box: getMasterRate(["distribution", "db", "switchgear"], 18000).rate,
    earth_pit: getMasterRate(["earth", "pit", "earthing"], 7500).rate,
    bescom_deposit: getMasterRate(["bescom", "deposit", "utility"], 4000).rate,
    solar_turnkey: getMasterRate(["solar", "pv", "rooftop"], 60000).rate,
  }));

  const updateRate = (key: string, val: number) => {
    setRates((prev) => ({ ...prev, [key]: Math.max(0, val) }));
  };

  const boqItems: ElectricalBOQItem[] = useMemo(() => {
    const items: ElectricalBOQItem[] = [
      {
        id: "light_point",
        category: "Wiring & Points",
        itemDescription: "Light / Fan Point Wiring (FR-LSH 1.5 sq.mm copper wire, PVC conduit, MS box & modular switch)",
        unit: "Point",
        quantity: lightFanPoints,
        ratePerUnit: rates.light_point || 1000,
        totalAmount: lightFanPoints * (rates.light_point || 1000),
      },
      {
        id: "power_6a",
        category: "Wiring & Points",
        itemDescription: "6A Plug Socket Point (FR-LSH 2.5 sq.mm copper wire, 6A socket & switch)",
        unit: "Point",
        quantity: powerPoints6A,
        ratePerUnit: rates.power_6a || 1200,
        totalAmount: powerPoints6A * (rates.power_6a || 1200),
      },
      {
        id: "heavy_16a",
        category: "Wiring & Points",
        itemDescription: "16A Heavy Power Socket Point for AC / Geyser / Microwave (4.0 sq.mm wire & MCB)",
        unit: "Point",
        quantity: heavyPoints16A,
        ratePerUnit: rates.heavy_16a || 2200,
        totalAmount: heavyPoints16A * (rates.heavy_16a || 2200),
      },
      {
        id: "db_box",
        category: "Switchgear & Distribution",
        itemDescription: "Main Distribution Board (IP42 enclosure, 4-Pole Main Isolator, RCCB 30mA & MCB breakers)",
        unit: "Assembly",
        quantity: dbBoxCount,
        ratePerUnit: rates.db_box || 18000,
        totalAmount: dbBoxCount * (rates.db_box || 18000),
      },
      {
        id: "earth_pit",
        category: "Earthing & Protection",
        itemDescription: "Chemical Pipe Earthing Pit Complete (50mm dia 3m copper bonded electrode + Bentonite compound)",
        unit: "Pit",
        quantity: earthPitCount,
        ratePerUnit: rates.earth_pit || 7500,
        totalAmount: earthPitCount * (rates.earth_pit || 7500),
      },
      {
        id: "bescom_deposit",
        category: "BESCOM Utility Charges",
        itemDescription: "BESCOM Official Service Main Charges, Initial Security Deposit (ISD) & L-Form Certification",
        unit: "kW",
        quantity: sanctionedKw,
        ratePerUnit: rates.bescom_deposit || 4000,
        totalAmount: sanctionedKw * (rates.bescom_deposit || 4000),
      },
    ];

    if (solarKw > 0) {
      items.push({
        id: "solar_turnkey",
        category: "Renewable Solar PV",
        itemDescription: "On-Grid Rooftop Solar PV Installation Turnkey (Mono PERC panels, String/Micro Inverter, Net Meter)",
        unit: "kW",
        quantity: solarKw,
        ratePerUnit: rates.solar_turnkey || 60000,
        totalAmount: solarKw * (rates.solar_turnkey || 60000),
      });
    }

    return items;
  }, [
    lightFanPoints,
    powerPoints6A,
    heavyPoints16A,
    dbBoxCount,
    earthPitCount,
    sanctionedKw,
    solarKw,
    rates,
  ]);

  const subtotalAmount = useMemo(() => {
    return boqItems.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [boqItems]);

  const overheadAmount = useMemo(() => {
    return Math.round((subtotalAmount * overheadPercent) / 100);
  }, [subtotalAmount, overheadPercent]);

  const grandTotalAmount = subtotalAmount + overheadAmount;

  const handleExportCSV = () => {
    const exportData = boqItems.map((item) => ({
      Category: item.category,
      Item: item.itemDescription,
      Unit: item.unit,
      Quantity: item.quantity,
      Rate: item.ratePerUnit,
      Amount: item.totalAmount,
    }));
    exportData.push({
      Category: "TOTAL",
      Item: `Overheads (${overheadPercent}%) & Grand Total (₹)`,
      Unit: "LumpSum",
      Quantity: 1,
      Rate: grandTotalAmount,
      Amount: grandTotalAmount,
    });
    exportToExcel(exportData, "BuildMitra_Electrical_Solar_BOQ");
  };

  const handleExportPDF = () => {
    generateElectricalPdfReport(
      sanctionedKw,
      solarKw,
      boqItems,
      subtotalAmount,
      overheadAmount,
      grandTotalAmount
    );
  };

  const handleShareWhatsApp = () => {
    const msg = `⚡ *BuildMitra Electrical & Solar Turnkey Estimate* ⚡\n\n- Sanctioned Load: ${sanctionedKw} kW\n- Solar System: ${solarKw} kW PV\n- Total Items: ${boqItems.length}\n- *Grand Total (₹) Estimate:* ₹${grandTotalAmount.toLocaleString()}\n\nGenerated via BuildMitra Electrical Engine.`;
    shareWhatsApp(msg);
  };

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerBadge}>BENGALURU MARKET BENCHMARK COSTING</div>
        <h2 style={styles.bannerTitle}>Automated Electrical & Solar BOQ Estimator</h2>
        <p style={styles.bannerSub}>
          Calculate turnkey material, labor, BESCOM official deposit fees, and rooftop solar installation estimates with instant PDF/CSV exports.
        </p>
      </div>

      {/* Quantities & Parameters Inputs */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>1. Project Quantity Inputs & Load Parameters</h3>

        <div style={styles.inputGrid}>
          <div>
            <label style={styles.label}>Light / Fan Points</label>
            <input
              type="number"
              value={lightFanPoints}
              onChange={(e) => setLightFanPoints(Math.max(0, Number(e.target.value)))}
              style={styles.input}
              min="0"
            />
            <span style={styles.hint}>Lighting, fans & wall lamps</span>
          </div>

          <div>
            <label style={styles.label}>6A Socket Points</label>
            <input
              type="number"
              value={powerPoints6A}
              onChange={(e) => setPowerPoints6A(Math.max(0, Number(e.target.value)))}
              style={styles.input}
              min="0"
            />
            <span style={styles.hint}>TV, desk, laptop chargers</span>
          </div>

          <div>
            <label style={styles.label}>16A Power Points</label>
            <input
              type="number"
              value={heavyPoints16A}
              onChange={(e) => setHeavyPoints16A(Math.max(0, Number(e.target.value)))}
              style={styles.input}
              min="0"
            />
            <span style={styles.hint}>AC, Geysers, Microwave</span>
          </div>

          <div>
            <label style={styles.label}>Main DB Assemblies</label>
            <input
              type="number"
              value={dbBoxCount}
              onChange={(e) => setDbBoxCount(Math.max(1, Number(e.target.value)))}
              style={styles.input}
              min="1"
            />
            <span style={styles.hint}>Distribution Boards</span>
          </div>

          <div>
            <label style={styles.label}>Chemical Earth Pits</label>
            <input
              type="number"
              value={earthPitCount}
              onChange={(e) => setEarthPitCount(Math.max(1, Number(e.target.value)))}
              style={styles.input}
              min="1"
            />
            <span style={styles.hint}>50mm 3m Copper Pipe</span>
          </div>

          <div>
            <label style={styles.label}>Sanctioned Load (kW)</label>
            <input
              type="number"
              value={sanctionedKw}
              onChange={(e) => setSanctionedKw(Math.max(1, Number(e.target.value)))}
              style={styles.input}
              min="1"
            />
            <span style={styles.hint}>For BESCOM deposits</span>
          </div>

          <div>
            <label style={styles.label}>Rooftop Solar Size (kW)</label>
            <input
              type="number"
              value={solarKw}
              onChange={(e) => setSolarKw(Math.max(0, Number(e.target.value)))}
              style={styles.input}
              min="0"
            />
            <span style={styles.hint}>0 for no solar</span>
          </div>

          <div>
            <label style={styles.label}>Labor & Overheads (%)</label>
            <input
              type="number"
              value={overheadPercent}
              onChange={(e) => setOverheadPercent(Math.max(0, Number(e.target.value)))}
              style={styles.input}
              min="0"
            />
            <span style={styles.hint}>Contractor margin & wastage</span>
          </div>
        </div>
      </div>

      {/* BOQ Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>2. Itemized Electrical & Solar Cost Estimate</h3>

          <div style={styles.actionGroup}>
            <button type="button" style={styles.btnExcel} onClick={handleExportCSV}>
              📊 Export CSV / Excel
            </button>
            <button type="button" style={styles.btnPdf} onClick={handleExportPDF}>
              📄 Export PDF
            </button>
            <button type="button" style={styles.btnWa} onClick={handleShareWhatsApp}>
              💬 Share WhatsApp
            </button>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Unit Rate (₹)</th>
                <th>Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {boqItems.map((item) => (
                <tr key={item.id}>
                  <td><span style={styles.catBadge}>{item.category}</span></td>
                  <td style={{ maxWidth: 320 }}>{item.itemDescription}</td>
                  <td>{item.unit}</td>
                  <td><strong>{item.quantity}</strong></td>
                  <td>
                    <input
                      type="number"
                      value={rates[item.id] || item.ratePerUnit}
                      onChange={(e) => updateRate(item.id, Number(e.target.value))}
                      style={styles.rateInput}
                    />
                  </td>
                  <td><strong>₹{item.totalAmount.toLocaleString()}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Banner */}
        <div style={styles.totalsBox}>
          <div style={styles.totRow}>
            <span>Subtotal Material & Service Cost:</span>
            <strong>₹{subtotalAmount.toLocaleString()}</strong>
          </div>
          <div style={styles.totRow}>
            <span>Contractor Overheads & Labor ({overheadPercent}%):</span>
            <strong>₹{overheadAmount.toLocaleString()}</strong>
          </div>
          <div style={{ ...styles.totRow, paddingTop: 10, borderTop: "1px dashed #cbd5e1", fontSize: 18, color: "#166534" }}>
            <span>Grand Total (₹) Estimated Investment:</span>
            <span style={{ fontSize: 24, fontWeight: 900 }}>₹{grandTotalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' },
  banner: {
    padding: 24,
    borderRadius: 16,
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.15)",
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: 900,
    color: "#eab308",
    letterSpacing: "0.08em",
    marginBottom: 8,
  },
  bannerTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1.3,
  },
  bannerSub: {
    margin: "8px 0 0",
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 1.5,
  },
  card: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  cardheader: { maxWidth: '100%', margin: '0 0 8px 0', padding: '6px 10px', borderRadius: '6px' },
  cardTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 800,
    color: "#0f172a",
  },
  inputgrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  input: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '12px', textAlign: 'center', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },
  hint: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    display: "block",
  },
  actionGroup: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  btnExcel: {
    padding: "8px 14px",
    borderRadius: 8,
    border: 0,
    backgroundColor: "#16a34a",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  btnPdf: {
    padding: "8px 14px",
    borderRadius: 8,
    border: 0,
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  btnWa: {
    padding: "8px 14px",
    borderRadius: 8,
    border: 0,
    backgroundColor: "#25d366",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: { width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '10px' },
  catBadge: {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    padding: "3px 7px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
  },
  rateinput: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '12px', textAlign: 'center', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },
  totalsBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  totRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
    color: "#334155",
  },
};

export default ElectricalEstimator;














