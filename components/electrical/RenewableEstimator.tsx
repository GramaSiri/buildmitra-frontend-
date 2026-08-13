import React, { useState, useMemo } from "react";
import {
  calculateRooftopSolar,
  calculateHybridWindBess,
} from "../../utils/electrical/renewableEngine";

export const RenewableEstimator: React.FC = () => {
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState<number>(5);
  const [monthlyBillAmount, setMonthlyBillAmount] = useState<number>(4500);
  const [rooftopAreaSqFt, setRooftopAreaSqFt] = useState<number>(400);
  const [desiredSolarKw, setDesiredSolarKw] = useState<number>(3);
  const [floorsCount, setFloorsCount] = useState<number>(3);

  const solarResult = useMemo(() => {
    return calculateRooftopSolar({
      sanctionedLoadKw,
      monthlyBillAmount,
      availableRooftopSqFt: rooftopAreaSqFt,
      desiredSolarKw,
    });
  }, [sanctionedLoadKw, monthlyBillAmount, rooftopAreaSqFt, desiredSolarKw]);

  const hybridResult = useMemo(() => {
    return calculateHybridWindBess(floorsCount, sanctionedLoadKw);
  }, [floorsCount, sanctionedLoadKw]);

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerBadge}>BESCOM NET METERING & SOLAR SUBSIDY ENGINE</div>
        <h2 style={styles.bannerTitle}>Rooftop Solar PV, Wind & Hybrid Renewable Estimator</h2>
        <p style={styles.bannerSub}>
          Calculate solar PV generation, PM Surya Ghar Muft Bijli Yojana subsidy applicability, payback period, and rooftop micro wind & BESS battery storage sizing.
        </p>
      </div>

      {/* Input Form */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>1. Solar PV & Roof Parameters</h3>
        <div style={styles.inputGrid}>
          <div>
            <label style={styles.label}>BESCOM Sanctioned Load (kW)</label>
            <input
              type="number"
              value={sanctionedLoadKw}
              onChange={(e) => setSanctionedLoadKw(Math.max(1, Number(e.target.value)))}
              style={styles.input}
              min="1"
            />
            <span style={styles.hint}>Net Metering capped up to 100% of sanctioned load</span>
          </div>

          <div>
            <label style={styles.label}>Average Monthly Electricity Bill (₹)</label>
            <input
              type="number"
              value={monthlyBillAmount}
              onChange={(e) => setMonthlyBillAmount(Math.max(0, Number(e.target.value)))}
              style={styles.input}
              step="500"
            />
            <span style={styles.hint}>Used to estimate monthly unit consumption</span>
          </div>

          <div>
            <label style={styles.label}>Desired Solar Capacity (kW)</label>
            <select
              value={desiredSolarKw}
              onChange={(e) => setDesiredSolarKw(Number(e.target.value))}
              style={styles.input}
            >
              <option value={1}>1 kW Solar PV (Basic Light Load)</option>
              <option value={2}>2 kW Solar PV (Small Family)</option>
              <option value={3}>3 kW Solar PV (Standard Residence - Max Subsidy)</option>
              <option value={5}>5 kW Solar PV (Heavy Appliance / AC Home)</option>
              <option value={8}>8 kW Solar PV (Duplex / Villa)</option>
              <option value={10}>10 kW Solar PV (Multi-Family / Commercial)</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Building Floors Count</label>
            <input
              type="number"
              value={floorsCount}
              onChange={(e) => setFloorsCount(Math.max(1, Number(e.target.value)))}
              style={styles.input}
              min="1"
            />
            <span style={styles.hint}>3+ Floors eligible for Rooftop VAWT Micro Wind</span>
          </div>
        </div>
      </div>

      {/* Solar Calculation Results */}
      <div style={styles.resultCard}>
        <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "#ffffff" }}>
          ☀️ Rooftop Solar PV & Net Metering Financial Summary
        </h3>

        <div style={styles.statGrid}>
          <div style={styles.statBoxHighlight}>
            <div style={styles.statLabel}>Recommended Solar Size</div>
            <div style={styles.statValHighlight}>{solarResult.recommendedSolarKw} kW PV</div>
            <div style={styles.statSubHighlight}>Capped to Sanctioned Load ({solarResult.maxPermissibleNetMeteringKw} kW)</div>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statLabel}>Daily Generation</div>
            <div style={styles.statVal}>{solarResult.dailyGenerationKwh} Units</div>
            <div style={styles.statSub}>(~{solarResult.monthlyGenerationKwh} kWh / month)</div>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statLabel}>PM Surya Ghar Subsidy</div>
            <div style={styles.statVal} style={{ color: "#10b981" }}>₹{solarResult.governmentSubsidyAmount.toLocaleString()}</div>
            <div style={styles.statSub}>{solarResult.subsidyTierLabel}</div>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statLabel}>Net Turnkey Cost</div>
            <div style={styles.statVal}>₹{solarResult.netTurnkeyCost.toLocaleString()}</div>
            <div style={styles.statSub}>Gross ₹{solarResult.estimatedTurnkeyCostGross.toLocaleString()}</div>
          </div>
        </div>

        {/* Financial & Environmental Benefits */}
        <div style={styles.financialBanner}>
          <div style={styles.finCol}>
            <div style={styles.finLabel}>Monthly Electricity Bill Savings</div>
            <div style={styles.finVal}>₹{solarResult.monthlyBillSavingsRupees.toLocaleString()} / month</div>
            <div style={styles.finSub}>~₹{solarResult.annualBillSavingsRupees.toLocaleString()} per year offset</div>
          </div>

          <div style={styles.finCol}>
            <div style={styles.finLabel}>Estimated Payback Period</div>
            <div style={styles.finValPayback}>{solarResult.simplePaybackYears} Years</div>
            <div style={styles.finSub}>~20 Years of Free Electricity After Payback</div>
          </div>

          <div style={styles.finCol}>
            <div style={styles.finLabel}>Annual CO₂ Offset</div>
            <div style={styles.finVal}>{solarResult.co2OffsetTonsPerYear} Tons</div>
            <div style={styles.finSub}>Equivalent to planting ~45 trees/year</div>
          </div>
        </div>

        {/* Technical Hardware Recommendation */}
        <div style={styles.hardwareBox}>
          <h4 style={{ margin: "0 0 10px", fontSize: 14, color: "#ffffff" }}>
            ⚙️ Tier-1 Approved Hardware Recommendation
          </h4>
          <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>
            <div><strong>Inverter:</strong> {solarResult.recommendedHardware.inverterType} ({solarResult.recommendedHardware.inverterBrands.join(", ")})</div>
            <div style={{ marginTop: 4 }}><strong>Solar Panels:</strong> {solarResult.recommendedHardware.panelType} ({solarResult.recommendedHardware.panelBrands.join(", ")})</div>
            <div style={{ marginTop: 4 }}><strong>Rooftop Space Required:</strong> ~{solarResult.requiredShadowFreeAreaSqFt} sq.ft shadow-free area</div>
          </div>
        </div>
      </div>

      {/* Hybrid Wind & BESS Storage Module */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>2. Hybrid Micro Wind (VAWT) & BESS Battery Storage</h3>

        <div style={styles.hybridGrid}>
          <div style={styles.hybridCard}>
            <div style={styles.hybridHeader}>
              <span style={{ fontSize: 24 }}>🌀</span>
              <div>
                <strong>Vertical-Axis Wind Turbine (VAWT)</strong>
                <div style={{ fontSize: 12, color: "#64748b" }}>Off-peak rooftop night currents</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#334155" }}>
              {hybridResult.vawtRecommended ? (
                <>
                  <div style={{ color: "#166534", fontWeight: 800, marginBottom: 4 }}>
                    ✅ Recommended for {floorsCount}-Story Building Rooftop
                  </div>
                  <div>Capacity: <strong>{hybridResult.vawtCapacityWatts}W VAWT Turbine</strong></div>
                  <div>Generates ~{hybridResult.vawtNightUnitsPerMonth} kWh/month during night wind currents.</div>
                </>
              ) : (
                <div style={{ color: "#9a3412" }}>
                  ℹ️ Rooftop wind turbines recommended primarily for elevated buildings (3+ floors). Current building height: {floorsCount} story.
                </div>
              )}
            </div>
          </div>

          <div style={styles.hybridCard}>
            <div style={styles.hybridHeader}>
              <span style={{ fontSize: 24 }}>🔋</span>
              <div>
                <strong>Battery Energy Storage (BESS)</strong>
                <div style={{ fontSize: 12, color: "#64748b" }}>Power outage resilience & peak shaving</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#334155" }}>
              <div>Recommended Capacity: <strong>{hybridResult.bessCapacityKwh} kWh Modular Bank</strong></div>
              <div style={{ marginTop: 4 }}>Technology: <strong>{hybridResult.recommendedBatteryTech}</strong></div>
              <div style={{ marginTop: 4, color: "#2563eb", fontWeight: 700 }}>
                Autonomy: ~{hybridResult.backupAutonomyHours} Hours full backup during BESCOM grid power outages.
              </div>
            </div>
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
    background: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 20px rgba(6, 95, 70, 0.15)",
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: 900,
    color: "#a7f3d0",
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
    color: "#d1fae5",
    fontSize: 14,
    lineHeight: 1.5,
  },
  card: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  cardTitle: {
    margin: "0 0 16px",
    fontSize: 16,
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
  resultcard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  statgrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' },
  statBox: {
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 14,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  statBoxHighlight: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    padding: 14,
    borderRadius: 12,
    border: "1px solid #10b981",
  },
  statlabel: { display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  statVal: {
    fontSize: 22,
    fontWeight: 900,
    color: "#ffffff",
    marginTop: 4,
  },
  statValHighlight: {
    fontSize: 24,
    fontWeight: 900,
    color: "#34d399",
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  statSubHighlight: {
    fontSize: 11,
    color: "#a7f3d0",
    marginTop: 2,
  },
  financialBanner: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  finCol: {
    display: "flex",
    flexDirection: "column",
  },
  finlabel: { display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  finVal: {
    fontSize: 20,
    fontWeight: 900,
    color: "#ffffff",
    marginTop: 4,
  },
  finValPayback: {
    fontSize: 22,
    fontWeight: 900,
    color: "#f59e0b",
    marginTop: 4,
  },
  finSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  hardwareBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  hybridgrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' },
  hybridcard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  hybridheader: { maxWidth: '100%', margin: '0 0 8px 0', padding: '6px 10px', borderRadius: '6px' },
};

export default RenewableEstimator;












