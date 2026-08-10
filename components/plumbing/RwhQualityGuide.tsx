import React, { useState } from "react";
import {
  classifyWaterQuality,
  MECHANIZED_TANK_CLEANING_STAGES,
  calculateRwhYield
} from "../../utils/plumbing/waterQualityEngine";

export default function RwhQualityGuide() {
  const [tdsPpm, setTdsPpm] = useState<number>(650);
  const [plotLength, setPlotLength] = useState<number>(30);
  const [plotWidth, setPlotWidth] = useState<number>(40);

  const waterQuality = classifyWaterQuality(tdsPpm);
  const rwh = calculateRwhYield(plotLength, plotWidth);

  return (
    <div style={styles.container}>
      {/* Title Banner */}
      <div style={styles.banner}>
        <div>
          <span style={styles.bannerBadge}>WATER QUALITY & RAINWATER HARVESTING</span>
          <h2 style={styles.bannerTitle}>TDS Water Treatment, Tank Cleaning & BWSSB RWH Engine</h2>
          <p style={styles.bannerSub}>
            Assess TDS hardness levels, central resin water softeners, semi-annual 6-stage mechanized tank cleaning protocols, and mandatory BWSSB Rainwater Harvesting yield.
          </p>
        </div>
      </div>

      {/* Grid: TDS Treatment & RWH Calculation */}
      <div style={styles.grid}>
        {/* Card 1: TDS & Softener Assessment */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🧪 Water Quality (TDS & Hardness)</h3>
          <p style={styles.cardSub}>Enter groundwater TDS reading in PPM (Parts Per Million)</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Measured Groundwater / Borewell TDS (PPM)</label>
            <input
              type="number"
              value={tdsPpm}
              onChange={(e) => setTdsPpm(Math.max(50, parseInt(e.target.value) || 50))}
              style={styles.input}
            />
          </div>

          <div style={styles.resultBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#0369a1" }}>WATER CLASSIFICATION</span>
              <span style={styles.categoryBadge}>{waterQuality.qualityCategory}</span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginTop: 10 }}>
              Recommended Water Treatment:
            </div>
            <div style={{ fontSize: 12, color: "#334155", marginTop: 4, lineHeight: 1.5 }}>
              {waterQuality.recommendedTreatment}
            </div>

            <div style={styles.geyserNote}>
              <strong>🛡️ Protection Note:</strong> {waterQuality.geyserProtectionNote}
            </div>
          </div>
        </div>

        {/* Card 2: BWSSB Mandatory Rainwater Harvesting (RWH) */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🌧️ BWSSB Rainwater Harvesting (RWH) Calculator</h3>
          <p style={styles.cardSub}>Mandatory for plots 1,200 sq.ft & above under BWSSB bye-laws</p>

          <div style={styles.row2}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Plot Length (ft)</label>
              <input
                type="number"
                value={plotLength}
                onChange={(e) => setPlotLength(Math.max(10, parseInt(e.target.value) || 10))}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Plot Width (ft)</label>
              <input
                type="number"
                value={plotWidth}
                onChange={(e) => setPlotWidth(Math.max(10, parseInt(e.target.value) || 10))}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.rwhBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#065f46" }}>BWSSB COMPLIANCE STATUS</span>
              <span style={rwh.isBwssbMandatory ? styles.mandatoryBadge : styles.optionalBadge}>
                {rwh.isBwssbMandatory ? "MANDATORY RWH RULE" : "OPTIONAL RWH"}
              </span>
            </div>

            <div style={{ fontSize: 22, fontWeight: 900, color: "#065f46", marginTop: 10 }}>
              {rwh.annualHarvestedLiters.toLocaleString()} Liters / Year
            </div>
            <div style={{ fontSize: 12, color: "#047857", marginTop: 4 }}>
              Annual Rooftop Water Yield ({rwh.annualRainfallMm} mm Bengaluru Average Rainfall)
            </div>

            <div style={{ fontSize: 12, marginTop: 10, color: "#065f46", borderTop: "1px solid #a7f3d0", paddingTop: 8 }}>
              <strong>Recommended RWH Filter:</strong> {rwh.recommendedFilterType}<br />
              <strong>Recharge Pit:</strong> {rwh.recommendedRechargePitFt.diameterFt}ft Dia x {rwh.recommendedRechargePitFt.depthFt}ft Depth Charcoal/Gravel Pit
            </div>
          </div>
        </div>
      </div>

      {/* 6-Stage Mechanized Tank Cleaning Protocol Card */}
      <div style={styles.cleaningCard}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          🧼 Semi-Annual 6-Stage Mechanized Tank Cleaning Protocol
        </h3>

        <div style={styles.stageGrid}>
          {MECHANIZED_TANK_CLEANING_STAGES.map((s) => (
            <div key={s.stepNo} style={styles.stageBox}>
              <div style={styles.stepBadge}>Step {s.stepNo}</div>
              <div style={styles.stageName}>{s.stageName}</div>
              <p style={styles.stageDesc}>{s.description}</p>
              <div style={styles.toolBadge}>Tool: {s.toolUsed}</div>
            </div>
          ))}
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
    background: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)",
    color: "#ffffff",
    padding: "20px 24px",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(13, 148, 136, 0.2)"
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.08em",
    color: "#99f6e4"
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
  resultBox: {
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    padding: 14,
    borderRadius: 12
  },
  categoryBadge: {
    background: "#0284c7",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: 6
  },
  geyserNote: {
    marginTop: 10,
    fontSize: 11,
    color: "#0369a1",
    background: "#ffffff",
    padding: 8,
    borderRadius: 8,
    border: "1px solid #bae6fd"
  },
  rwhBox: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    padding: 14,
    borderRadius: 12
  },
  mandatoryBadge: {
    background: "#059669",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 900,
    padding: "3px 8px",
    borderRadius: 6
  },
  optionalBadge: {
    background: "#64748b",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: 6
  },
  cleaningCard: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #e2e8f0"
  },
  stageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12
  },
  stageBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: 900,
    color: "#0d9488",
    background: "#ccfbf1",
    padding: "2px 6px",
    borderRadius: 4,
    width: "fit-content"
  },
  stageName: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a"
  },
  stageDesc: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 1.4,
    margin: "4px 0"
  },
  toolBadge: {
    fontSize: 10,
    color: "#475569",
    fontWeight: 700
  }
};
