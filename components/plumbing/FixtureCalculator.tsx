import React, { useState } from "react";
import {
  FIXTURE_PRESETS,
  CPVC_PIPE_STANDARDS,
  calculateWaterSavings
} from "../../utils/plumbing/pipeEngine";

export default function FixtureCalculator() {
  const [counts, setCounts] = useState<Record<string, number>>({
    shower: 3,
    health_faucet: 5,
    wash_basin: 5,
    ewc_flush: 5,
    diverter: 3,
    kitchen_sink: 2,
    washing_machine: 1,
    dishwasher: 1
  });

  const [occupants, setOccupants] = useState<number>(5);

  const updateCount = (id: string, delta: number) => {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  // Compute Total WSFU & Flow LPM
  let totalWsfu = 0;
  let totalLpm = 0;
  let totalTapsForAerator = 0;

  FIXTURE_PRESETS.forEach((f) => {
    const qty = counts[f.id] || 0;
    totalWsfu += qty * f.wsfu;
    totalLpm += qty * f.lpm;

    if (["health_faucet", "wash_basin", "kitchen_sink"].includes(f.id)) {
      totalTapsForAerator += qty;
    }
  });

  // Pipe Recommendation based on WSFU
  let recommendedRiserInch = "0.75 in (20mm)";
  let riserNote = "Suitable for up to 2 Bathrooms";
  if (totalWsfu > 25) {
    recommendedRiserInch = "1.5 in (40mm)";
    riserNote = "High-flow multi-floor main riser line";
  } else if (totalWsfu > 15) {
    recommendedRiserInch = "1.25 in (32mm)";
    riserNote = "Standard 3–4 floor vertical riser line";
  } else if (totalWsfu > 8) {
    recommendedRiserInch = "1.0 in (25mm)";
    riserNote = "Main down-comer for 2–3 bathrooms";
  }

  // Aerator & Dual Flush Water Savings
  const savings = calculateWaterSavings(totalTapsForAerator, 10, occupants);

  return (
    <div style={styles.container}>
      {/* Title Banner */}
      <div style={styles.banner}>
        <div>
          <span style={styles.bannerBadge}>FIXTURE CALCULATOR & PIPE SIZING</span>
          <h2 style={styles.bannerTitle}>Plumbing Fixture Unit (WSFU) & Pipe Sizing Engine</h2>
          <p style={styles.bannerSub}>
            Calculate total peak flow (LPM), Water Supply Fixture Units (WSFU), recommended riser pipe diameters, and yearly water/money savings from low-flow aerators.
          </p>
        </div>
      </div>

      {/* Grid: Fixtures & Pipe Sizing Results */}
      <div style={styles.grid}>
        {/* Left: Fixture Counter Controls */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🚰 Plumbing Fixtures Count</h3>
          <p style={styles.cardSub}>Adjust fixture quantities across your property</p>

          <div style={styles.fixtureList}>
            {FIXTURE_PRESETS.map((f) => {
              const count = counts[f.id] || 0;
              return (
                <div key={f.id} style={styles.fixtureRow}>
                  <div>
                    <div style={styles.fixtureName}>{f.name}</div>
                    <div style={styles.fixtureDetails}>
                      {f.lpm} LPM | {f.wsfu} WSFU | Rec: {f.recommendedPipeInch}
                    </div>
                  </div>

                  <div style={styles.counterWrap}>
                    <button
                      type="button"
                      style={styles.btnCounter}
                      onClick={() => updateCount(f.id, -1)}
                    >
                      -
                    </button>
                    <span style={styles.counterVal}>{count}</span>
                    <button
                      type="button"
                      style={styles.btnCounter}
                      onClick={() => updateCount(f.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Summary & Pipe Sizing Standards */}
        <div style={styles.rightCol}>
          {/* Summary Box */}
          <div style={styles.summaryCard}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800 }}>
              📊 Peak Flow & Pipe Sizing Result
            </h3>

            <div style={styles.metricsGrid}>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Total Fixture Units</div>
                <div style={styles.metricVal}>{totalWsfu.toFixed(1)} WSFU</div>
              </div>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Connected Peak Flow</div>
                <div style={styles.metricVal}>{totalLpm} LPM</div>
              </div>
            </div>

            <div style={styles.riserBox}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.8 }}>
                RECOMMENDED VERTICAL MAIN RISER
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
                {recommendedRiserInch}
              </div>
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>
                {riserNote}
              </div>
            </div>
          </div>

          {/* Water Savings Aerator Card */}
          <div style={styles.savingsCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#065f46" }}>
                🌱 Aerator & Dual-Flush Water Savings
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#047857", fontWeight: 700 }}>Occupants:</span>
                <input
                  type="number"
                  value={occupants}
                  onChange={(e) => setOccupants(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: 45, padding: "3px 6px", borderRadius: 6, border: "1px solid #a7f3d0", textAlign: "center", fontWeight: 800 }}
                />
              </div>
            </div>

            <p style={{ margin: "8px 0 12px", fontSize: 12, color: "#047857", lineHeight: 1.45 }}>
              Retrofitting standard 10 LPM taps with 3 LPM low-flow aerators and installing 6L/3L dual-flush valves saves up to 70% tap water.
            </p>

            <div style={styles.savingsGrid}>
              <div style={styles.savingsBox}>
                <div style={{ fontSize: 11, color: "#047857" }}>Yearly Water Saved</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#065f46", marginTop: 2 }}>
                  {(savings.aeratorYearlySavedLiters + savings.flushYearlySavedLiters).toLocaleString()} Liters
                </div>
              </div>
              <div style={styles.savingsBox}>
                <div style={{ fontSize: 11, color: "#047857" }}>Yearly Financial Savings</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#047857", marginTop: 2 }}>
                  ₹ {savings.totalYearlySavedRupees.toLocaleString()} / year
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CPVC Conductor Standards Table */}
      <div style={styles.tableCard}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          📐 CPVC / UPVC Pipe Diameter Standards (IS 15778 / ASTM D2846)
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Diameter (Inch)</th>
                <th style={styles.th}>Size (mm)</th>
                <th style={styles.th}>Primary Plumbing Application</th>
                <th style={styles.th}>Capacity Limit</th>
              </tr>
            </thead>
            <tbody>
              {CPVC_PIPE_STANDARDS.map((p, i) => (
                <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={{ ...styles.td, fontWeight: 800, color: "#0284c7" }}>{p.sizeInch}</td>
                  <td style={styles.td}>{p.sizeMm} mm</td>
                  <td style={styles.td}>{p.application}</td>
                  <td style={{ ...styles.td, fontWeight: 700 }}>{p.maxFixtures}</td>
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
  container: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' },
  banner: {
    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    color: "#ffffff",
    padding: "20px 24px",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(2, 132, 199, 0.2)"
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.08em",
    color: "#bae6fd"
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' },
  card: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
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
  fixtureList: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  fixtureRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    background: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #f1f5f9"
  },
  fixtureName: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a"
  },
  fixtureDetails: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2
  },
  counterWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#ffffff",
    padding: "3px 6px",
    borderRadius: 8,
    border: "1px solid #cbd5e1"
  },
  btnCounter: {
    width: 24,
    height: 24,
    border: 0,
    background: "#0f172a",
    color: "#ffffff",
    borderRadius: 6,
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14
  },
  counterVal: {
    fontSize: 14,
    fontWeight: 900,
    minWidth: 20,
    textAlign: "center"
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  summarycard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  metricsgrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' },
  metricBox: {
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: 10,
    padding: 12
  },
  metriclabel: { display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  metricVal: {
    fontSize: 18,
    fontWeight: 900,
    color: "#0284c7",
    marginTop: 2
  },
  riserBox: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    color: "#ffffff",
    padding: 16,
    borderRadius: 12
  },
  savingscard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  savingsgrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' },
  savingsBox: {
    background: "#ffffff",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #a7f3d0"
  },
  tablecard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  table: { width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '10px' },
  trHead: {
    background: "#0f172a",
    color: "#ffffff"
  },
  th: { padding: '3px 4px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#f1f5f9', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  td: { padding: '3px 4px', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  trEven: {
    background: "#f8fafc"
  },
  trOdd: {
    background: "#ffffff"
  }
};














