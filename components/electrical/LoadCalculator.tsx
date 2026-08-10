import React, { useState, useMemo } from "react";
import {
  APPLIANCE_PRESETS,
  SelectedAppliance,
  calculateConnectedLoad,
  calculatePowerSavings,
} from "../../utils/electrical/loadEngine";

export const LoadCalculator: React.FC = () => {
  const [buaSqFt, setBuaSqFt] = useState<number>(1800);
  const [diversityFactor, setDiversityFactor] = useState<number>(0.7);

  // Initialize selected appliances
  const [quantities, setQuantities] = useState<Record<string, number>>({
    led_downlight: 24,
    led_panel: 6,
    led_strip: 20,
    bldc_fan: 6,
    exhaust_fan: 4,
    ac_1_5t: 2,
    ac_2t: 1,
    heat_pump_geyser: 1,
    solar_geyser_backup: 1,
    induction_cooktop: 1,
    submersible_pump: 1,
    refrigerator: 1,
    washing_machine: 1,
    ev_charger_slow: 1,
  });

  // Power savings inputs
  const [bldcFanCount, setBldcFanCount] = useState<number>(6);
  const [inverterAcCount, setInverterAcCount] = useState<number>(3);
  const [hasOccupancySensors, setHasOccupancySensors] = useState<boolean>(true);

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  const selectedAppliancesList: SelectedAppliance[] = useMemo(() => {
    return Object.entries(quantities).map(([id, count]) => ({
      id,
      count,
    }));
  }, [quantities]);

  const loadResult = useMemo(() => {
    return calculateConnectedLoad(selectedAppliancesList, buaSqFt, diversityFactor);
  }, [selectedAppliancesList, buaSqFt, diversityFactor]);

  const savingsResult = useMemo(() => {
    return calculatePowerSavings({
      bldcFanCount,
      standardFanCount: 0,
      inverterAcCount,
      standardAcCount: 0,
      hasOccupancySensors,
    });
  }, [bldcFanCount, inverterAcCount, hasOccupancySensors]);

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerBadge}>CONNECTED LOAD & PHASE BALANCING</div>
        <h2 style={styles.bannerTitle}>Connected Load Estimator & Energy Optimizer</h2>
        <p style={styles.bannerSub}>
          Calculate Total Connected Load (TCL), Maximum Demand, BESCOM Sanctioned Load, 3-Phase load distribution, and yearly ₹ power savings.
        </p>
      </div>

      {/* Building Parameters */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>1. Building Built-up Area & Diversity Settings</h3>
        <div style={styles.inputGrid}>
          <div>
            <label style={styles.label}>Built-up Area (Sq.Ft)</label>
            <input
              type="number"
              value={buaSqFt}
              onChange={(e) => setBuaSqFt(Math.max(100, Number(e.target.value)))}
              style={styles.input}
              min="100"
              step="100"
            />
            <span style={styles.hint}>Mandatory regulatory baseline: 1 kW per 500 sq.ft</span>
          </div>

          <div>
            <label style={styles.label}>Diversity Factor</label>
            <select
              value={diversityFactor}
              onChange={(e) => setDiversityFactor(Number(e.target.value))}
              style={styles.input}
            >
              <option value={0.65}>0.65 (High Diversity / Multi-Unit)</option>
              <option value={0.7}>0.70 (Standard Residential Benchmark)</option>
              <option value={0.75}>0.75 (Heavy Simultaneity Use)</option>
            </select>
            <span style={styles.hint}>Ratio of Maximum Demand to Total Connected Load</span>
          </div>
        </div>
      </div>

      {/* Appliance Selection Grid */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>2. Room-by-Room Appliance Load Calculator</h3>
        <div style={styles.applianceGrid}>
          {APPLIANCE_PRESETS.map((app) => {
            const qty = quantities[app.id] || 0;
            const subtotalWatts = qty * app.defaultWattage;

            return (
              <div key={app.id} style={styles.appItem}>
                <div style={styles.appDetails}>
                  <div style={styles.appName}>{app.name}</div>
                  <div style={styles.appDesc}>
                    {app.defaultWattage}W per {app.unitLabel} • {app.description}
                  </div>
                </div>

                <div style={styles.controlGroup}>
                  <button
                    type="button"
                    style={styles.qtyBtn}
                    onClick={() => updateQuantity(app.id, -1)}
                  >
                    −
                  </button>
                  <span style={styles.qtyText}>{qty}</span>
                  <button
                    type="button"
                    style={styles.qtyBtn}
                    onClick={() => updateQuantity(app.id, 1)}
                  >
                    +
                  </button>
                </div>

                <div style={styles.wattBadge}>
                  {subtotalWatts >= 1000 ? `${(subtotalWatts / 1000).toFixed(2)} kW` : `${subtotalWatts} W`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculation Summary Card */}
      <div style={styles.resultCard}>
        <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "#ffffff" }}>
          ⚡ BESCOM Load Sanction & Phase Recommendation Summary
        </h3>

        <div style={styles.statGrid}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Total Connected Load (TCL)</div>
            <div style={styles.statVal}>{loadResult.totalConnectedLoadKw} kW</div>
            <div style={styles.statSub}>({loadResult.totalConnectedLoadWatts.toLocaleString()} Watts)</div>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statLabel}>Maximum Demand (MD)</div>
            <div style={styles.statVal}>{loadResult.maxDemandKw} kW</div>
            <div style={styles.statSub}>(Diversity {diversityFactor * 100}%)</div>
          </div>

          <div style={styles.statBoxHighlight}>
            <div style={styles.statLabel}>Recommended Sanctioned Load</div>
            <div style={styles.statValHighlight}>{loadResult.recommendedSanctionedLoadKw} kW</div>
            <div style={styles.statSubHighlight}>BESCOM Sanction Benchmark</div>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statLabel}>Supply Phase Type</div>
            <div style={styles.statVal} style={{ color: loadResult.recommendedSanctionedLoadKw > 5 ? "#f59e0b" : "#10b981" }}>
              {loadResult.phaseType}
            </div>
            <div style={styles.statSub}>Threshold: 5 kW</div>
          </div>
        </div>

        <div style={styles.techDetailsBox}>
          <div>
            <strong>Meter Board Spec:</strong> {loadResult.bescomPhaseRequirement}
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Recommended Main MCB & Incomer Cable:</strong> {loadResult.recommendedMainMcbRating} with {loadResult.recommendedIncomerCableSqMm} sq.mm FR-LSH Copper Armoured Cable
          </div>
        </div>

        {/* 3-Phase Load Balancing Diagram */}
        {loadResult.phaseBalancing && (
          <div style={styles.phaseBalanceSection}>
            <h4 style={{ margin: "0 0 12px", fontSize: 15, color: "#ffffff" }}>
              ⚖️ 3-Phase Load Balancing Visualizer (R - Y - B Phases)
            </h4>

            <div style={styles.phaseBarGrid}>
              <div style={styles.phaseCol}>
                <div style={{ ...styles.phaseTag, backgroundColor: "#ef4444" }}>R-PHASE</div>
                <div style={styles.phaseWatts}>{loadResult.phaseBalancing.rPhaseWatts} W</div>
                <div style={styles.phaseAmps}>{loadResult.phaseBalancing.rPhaseAmps} Amps</div>
              </div>

              <div style={styles.phaseCol}>
                <div style={{ ...styles.phaseTag, backgroundColor: "#eab308" }}>Y-PHASE</div>
                <div style={styles.phaseWatts}>{loadResult.phaseBalancing.yPhaseWatts} W</div>
                <div style={styles.phaseAmps}>{loadResult.phaseBalancing.yPhaseAmps} Amps</div>
              </div>

              <div style={styles.phaseCol}>
                <div style={{ ...styles.phaseTag, backgroundColor: "#3b82f6" }}>B-PHASE</div>
                <div style={styles.phaseWatts}>{loadResult.phaseBalancing.bPhaseWatts} W</div>
                <div style={styles.phaseAmps}>{loadResult.phaseBalancing.bPhaseAmps} Amps</div>
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
              Status: {loadResult.phaseBalancing.isBalanced ? "✅ Balanced phase distribution across R, Y, B lines." : "⚠️ Minor unbalance detected. Adjust heavy 16A circuits."}
            </div>
          </div>
        )}
      </div>

      {/* Energy Efficiency & Power Saving Optimizer */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>3. Power Saving & Energy Efficiency Upgrade Optimizer</h3>

        <div style={styles.savingsControlsGrid}>
          <div>
            <label style={styles.label}>BLDC Energy Saving Fans Count</label>
            <input
              type="number"
              value={bldcFanCount}
              onChange={(e) => setBldcFanCount(Math.max(0, Number(e.target.value)))}
              style={styles.input}
              min="0"
            />
            <span style={styles.hint}>Saves ~43W per fan operated 10 hrs/day</span>
          </div>

          <div>
            <label style={styles.label}>Dual-Inverter AC Count</label>
            <input
              type="number"
              value={inverterAcCount}
              onChange={(e) => setInverterAcCount(Math.max(0, Number(e.target.value)))}
              style={styles.input}
              min="0"
            />
            <span style={styles.hint}>Saves ~500W per AC vs non-inverter unit</span>
          </div>

          <div>
            <label style={styles.label}>Lighting Automation & Sensors</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={hasOccupancySensors}
                onChange={(e) => setHasOccupancySensors(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#2563eb" }}
              />
              Occupancy & Daylight Sensors (40% idle reduction)
            </label>
          </div>
        </div>

        <div style={styles.savingsResultGrid}>
          <div style={styles.savingBox}>
            <div style={styles.savingLabel}>Annual Units Saved</div>
            <div style={styles.savingVal}>{savingsResult.annualKwhSaved.toLocaleString()} kWh</div>
            <div style={styles.savingSub}>Electricity units saved / year</div>
          </div>

          <div style={styles.savingBoxHighlight}>
            <div style={styles.savingLabel}>Annual Utility Bill Reduction</div>
            <div style={styles.savingValHighlight}>₹{savingsResult.annualRupeesSaved.toLocaleString()}</div>
            <div style={styles.savingSubHighlight}>@ ₹7.50 / BESCOM Tariff Unit</div>
          </div>

          <div style={styles.savingBox}>
            <div style={styles.savingLabel}>CO₂ Emissions Offset</div>
            <div style={styles.savingVal}>{savingsResult.co2ReducedKg} kg</div>
            <div style={styles.savingSub}>Carbon reduction per year</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  banner: {
    padding: 24,
    borderRadius: 16,
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.15)",
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: 900,
    color: "#38bdf8",
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
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  cardTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 800,
    color: "#475569",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
  },
  hint: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    display: "block",
  },
  applianceGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  appItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
    flexWrap: "wrap",
  },
  appDetails: {
    flex: 1,
    minWidth: 200,
  },
  appName: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
  },
  appDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  controlGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "2px 6px",
  },
  qtyBtn: {
    width: 28,
    height: 28,
    border: 0,
    backgroundColor: "transparent",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
    color: "#2563eb",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: 800,
    minWidth: 24,
    textAlign: "center",
  },
  wattBadge: {
    minWidth: 80,
    textAlign: "right",
    fontSize: 13,
    fontWeight: 900,
    color: "#2563eb",
  },
  resultCard: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: 24,
    borderRadius: 16,
    boxShadow: "0 4px 25px rgba(15, 23, 42, 0.2)",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },
  statBox: {
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 14,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  statBoxHighlight: {
    backgroundColor: "rgba(37, 99, 235, 0.25)",
    padding: 14,
    borderRadius: 12,
    border: "1px solid #3b82f6",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
  },
  statVal: {
    fontSize: 22,
    fontWeight: 900,
    color: "#ffffff",
    marginTop: 4,
  },
  statValHighlight: {
    fontSize: 24,
    fontWeight: 900,
    color: "#60a5fa",
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  statSubHighlight: {
    fontSize: 11,
    color: "#93c5fd",
    marginTop: 2,
  },
  techDetailsBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
  phaseBalanceSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1px dashed rgba(255,255,255,0.15)",
  },
  phaseBarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },
  phaseCol: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 10,
    textAlign: "center",
  },
  phaseTag: {
    fontSize: 10,
    fontWeight: 900,
    color: "#ffffff",
    padding: "3px 6px",
    borderRadius: 4,
    display: "inline-block",
    marginBottom: 6,
  },
  phaseWatts: {
    fontSize: 16,
    fontWeight: 900,
    color: "#ffffff",
  },
  phaseAmps: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  savingsControlsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  savingsResultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
    marginTop: 20,
  },
  savingBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  savingBoxHighlight: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
  },
  savingLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
  },
  savingVal: {
    fontSize: 22,
    fontWeight: 900,
    color: "#0f172a",
    marginTop: 4,
  },
  savingValHighlight: {
    fontSize: 24,
    fontWeight: 900,
    color: "#166534",
    marginTop: 4,
  },
  savingSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  savingSubHighlight: {
    fontSize: 11,
    color: "#15803d",
    marginTop: 2,
  },
};

export default LoadCalculator;
