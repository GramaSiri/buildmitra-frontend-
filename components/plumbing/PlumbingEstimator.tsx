import React, { useState } from "react";
import { generatePlumbingPdfReport } from "../../utils/pdfExport";
import * as XLSX from "xlsx";
import { useRates } from "../../contexts/RateContext";

export default function PlumbingEstimator() {
  const { getRate } = useRates();

  const [bathrooms, setBathrooms] = useState<number>(4);
  const [kitchens, setKitchens] = useState<number>(2);
  const [swrRunFeet, setSwrRunFeet] = useState<number>(180);
  const [includeSoftener, setIncludeSoftener] = useState<boolean>(true);
  const [includeRwh, setIncludeRwh] = useState<boolean>(true);

  // Base Bengaluru Market Rates
  const internalPointRate = getRate("internal_plumbing_point") || 3200; // ₹3,200 / bathroom point
  const swrPipeRatePerFt = getRate("swr_drainage_pipe_per_ft") || 320; // ₹320 / running ft
  const bwssbFeesLumpSum = getRate("bwssb_prorata_deposit") || 35000; // ₹35,000 lump sum
  const softenerCost = includeSoftener ? 45000 : 0; // ₹45,000 for 1000 LPH automatic softener
  const rwhCost = includeRwh ? 25000 : 0; // ₹25,000 for Rainy filter & sump connect

  const totalPoints = bathrooms * 6 + kitchens * 3; // ~6 points per bathroom, ~3 per kitchen
  const plumbingMaterialCost = totalPoints * internalPointRate;
  const swrDrainageCost = swrRunFeet * swrPipeRatePerFt;

  const subtotal = plumbingMaterialCost + swrDrainageCost + bwssbFeesLumpSum + softenerCost + rwhCost;
  const overheadAmount = Math.round(subtotal * 0.12); // 12% labor & fitting overhead
  const grandTotal = subtotal + overheadAmount;

  const boqItems = [
    {
      category: "Internal Piping & Taps",
      itemDescription: `CPVC/UPVC Piping & Bath Points (${totalPoints} Points across ${bathrooms} Baths, ${kitchens} Kitchens)`,
      unit: "Points",
      quantity: totalPoints,
      ratePerUnit: internalPointRate,
      totalAmount: plumbingMaterialCost
    },
    {
      category: "SWR Soil & Waste Drainage",
      itemDescription: "4-inch SWR Drainage Line & Underground Inspection Chamber",
      unit: "Rft",
      quantity: swrRunFeet,
      ratePerUnit: swrPipeRatePerFt,
      totalAmount: swrDrainageCost
    },
    {
      category: "BWSSB Sanction & Prorata",
      itemDescription: "Official BWSSB Prorata Deposit, Inspection & Water Meter Charge",
      unit: "LS",
      quantity: 1,
      ratePerUnit: bwssbFeesLumpSum,
      totalAmount: bwssbFeesLumpSum
    },
    ...(includeSoftener
      ? [
          {
            category: "Water Treatment",
            itemDescription: "1000 LPH Automatic Resin Centralized Water Softener",
            unit: "Unit",
            quantity: 1,
            ratePerUnit: 45000,
            totalAmount: 45000
          }
        ]
      : []),
    ...(includeRwh
      ? [
          {
            category: "Rainwater Harvesting",
            itemDescription: "BWSSB Mandatory Rooftop RWH Rainy Filter & Sump Direct Connection",
            unit: "Unit",
            quantity: 1,
            ratePerUnit: 25000,
            totalAmount: 25000
          }
        ]
      : [])
  ];

  const handleExportPdf = () => {
    generatePlumbingPdfReport(8000, 48000, boqItems, subtotal, overheadAmount, grandTotal);
  };

  const handleExportCsv = () => {
    const data = boqItems.map((item) => ({
      Category: item.category,
      Description: item.itemDescription,
      Unit: item.unit,
      Quantity: item.quantity,
      "Rate (Rs)": item.ratePerUnit,
      "Total Amount (Rs)": item.totalAmount
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plumbing_BOQ");
    XLSX.writeFile(wb, `BuildMitra_Plumbing_BOQ_${Date.now()}.xlsx`);
  };

  const handleShareWhatsApp = () => {
    const text = `*BUILDMITRA — PLUMBING & RWH ESTIMATE*\n\n` +
      `• Bathrooms: ${bathrooms}\n` +
      `• Total Plumbing Points: ${totalPoints}\n` +
      `• SWR Drainage: ${swrRunFeet} ft\n` +
      `• Grand Total Estimate: ₹ ${grandTotal.toLocaleString()}\n\n` +
      `Export PDF/Excel from BuildMitra Plumbing Engine!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div style={styles.container}>
      {/* Title Banner */}
      <div style={styles.banner}>
        <div>
          <span style={styles.bannerBadge}>BOQ COST ESTIMATOR</span>
          <h2 style={styles.bannerTitle}>Plumbing, BWSSB & RWH Cost Estimator</h2>
          <p style={styles.bannerSub}>
            Generate itemized material & labor estimates based on Bengaluru market benchmark rates, export official PDF/Excel reports, and share with clients.
          </p>
        </div>
      </div>

      {/* Inputs & Summary Grid */}
      <div style={styles.grid}>
        {/* Left Card: Input Parameters */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📋 Estimation Inputs</h3>
          <p style={styles.cardSub}>Set bathroom count, SWR run, softener & RWH requirements</p>

          <div style={styles.row2}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>No. of Bathrooms</label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(Math.max(1, parseInt(e.target.value) || 1))}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>No. of Kitchens / Utilities</label>
              <input
                type="number"
                value={kitchens}
                onChange={(e) => setKitchens(Math.max(1, parseInt(e.target.value) || 1))}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>SWR Drainage Line Run (ft)</label>
            <input
              type="number"
              value={swrRunFeet}
              onChange={(e) => setSwrRunFeet(Math.max(20, parseInt(e.target.value) || 20))}
              style={styles.input}
            />
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={includeSoftener}
                onChange={(e) => setIncludeSoftener(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              Include 1000 LPH Centralized Water Softener (₹45,000)
            </label>

            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={includeRwh}
                onChange={(e) => setIncludeRwh(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              Include BWSSB Mandatory Rooftop RWH Rainy Filter Setup (₹25,000)
            </label>
          </div>
        </div>

        {/* Right Card: Financial Summary */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>💰 Investment Summary</h3>
          <p style={styles.cardSub}>Itemized turn-key cost breakdown</p>

          <div style={styles.costGrid}>
            <div style={styles.costRow}>
              <span>Subtotal Material & Service:</span>
              <span style={{ fontWeight: 800 }}>₹ {subtotal.toLocaleString()}</span>
            </div>
            <div style={styles.costRow}>
              <span>Labor & Fittings Overhead (12%):</span>
              <span style={{ fontWeight: 800 }}>₹ {overheadAmount.toLocaleString()}</span>
            </div>
            <div style={styles.grandTotalBox}>
              <div style={{ fontSize: 11, color: "#0e7490", fontWeight: 800 }}>ESTIMATED TURNKEY INVESTMENT</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
                ₹ {grandTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionRow}>
            <button type="button" style={{ ...styles.btn, background: "#0e7490", color: "#ffffff" }} onClick={handleExportPdf}>
              📄 Download PDF Report
            </button>
            <button type="button" style={{ ...styles.btn, background: "#15803d", color: "#ffffff" }} onClick={handleExportCsv}>
              📊 Export Excel (XLSX)
            </button>
            <button type="button" style={{ ...styles.btn, background: "#25D366", color: "#ffffff" }} onClick={handleShareWhatsApp}>
              💬 WhatsApp Share
            </button>
          </div>
        </div>
      </div>

      {/* Itemized BOQ Table */}
      <div style={styles.tableCard}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          📄 Itemized Plumbing, Water Treatment & RWH BOQ Breakdown
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Item Description</th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Rate (₹)</th>
                <th style={styles.th}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {boqItems.map((item, i) => (
                <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={{ ...styles.td, fontWeight: 800, color: "#0e7490" }}>{item.category}</td>
                  <td style={styles.td}>{item.itemDescription}</td>
                  <td style={styles.td}>{item.unit}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>₹ {item.ratePerUnit.toLocaleString()}</td>
                  <td style={{ ...styles.td, fontWeight: 800 }}>₹ {item.totalAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 20
  },
  banner: {
    background: "linear-gradient(135deg, #0e7490 0%, #164e63 100%)",
    color: "#ffffff",
    padding: "20px 24px",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(14, 116, 144, 0.2)"
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.08em",
    color: "#a5f3fc"
  },
  bannerTitle: {
    margin: "4px 0 0",
    fontSize: 22,
    fontWeight: 900
  },
  bannerSub: {
    margin: "6px 0 0",
    fontSize: 13,
    opacity: 0.9,
    lineHeight: 1.5
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 20
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #e2e8f0"
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a"
  },
  cardSub: {
    margin: "2px 0 16px",
    fontSize: 12,
    color: "#64748b"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 12
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#334155"
  },
  input: {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 13,
    fontWeight: 700,
    outline: "none"
  },
  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 10
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
    cursor: "pointer"
  },
  costGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 16
  },
  costRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#475569"
  },
  grandTotalBox: {
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    padding: 14,
    borderRadius: 12,
    marginTop: 6
  },
  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  btn: {
    flex: 1,
    minWidth: 120,
    padding: "10px 14px",
    borderRadius: 10,
    border: 0,
    fontWeight: 800,
    fontSize: 12,
    cursor: "pointer"
  },
  tableCard: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #e2e8f0"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12
  },
  trHead: {
    background: "#0e7490",
    color: "#ffffff"
  },
  th: {
    padding: "10px 12px",
    textAlign: "left",
    fontWeight: 800
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155"
  },
  trEven: {
    background: "#f8fafc"
  },
  trOdd: {
    background: "#ffffff"
  }
};
