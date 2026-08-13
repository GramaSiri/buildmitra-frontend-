import React, { useState } from "react";
import {
  calculateStorageCapacity,
  calculatePumpHorsepower
} from "../../utils/plumbing/pumpEngine";

export default function TankPumpCalculator() {
  const [occupants, setOccupants] = useState<number>(6);
  const [sumpDays, setSumpDays] = useState<number>(1.5);
  const [ohtDays, setOhtDays] = useState<number>(0.75);

  const [floors, setFloors] = useState<number>(3.5);
  const [borewellDepth, setBorewellDepth] = useState<number>(650);

  const storage = calculateStorageCapacity(occupants, sumpDays, ohtDays);
  const pump = calculatePumpHorsepower(Math.ceil(floors), borewellDepth, Math.ceil(floors * 11 + 10));

  return (
    <div style={styles.container}>
      {/* Title Banner */}
      <div style={styles.banner}>
        <div>
          <span style={styles.bannerBadge}>STORAGE & PUMP HP CALCULATOR</span>
          <h2 style={styles.bannerTitle}>IS 1172 Water Storage & Pump Sizing Engine</h2>
          <p style={styles.bannerSub}>
            Calculate underground sump capacity (Liters & ft dimensions), overhead tank (OHT) storage, Total Dynamic Head (TDH), and recommended pump HP for borewells & transfer pumps.
          </p>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div style={styles.grid}>
        {/* Left Card: Input Parameters */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>⚙️ Household & Building Parameters</h3>
          <p style={styles.cardSub}>Input occupants and building height for IS 1172 standards</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Total Occupants / Residents</label>
            <input
              type="number"
              value={occupants}
              onChange={(e) => setOccupants(Math.max(1, parseInt(e.target.value) || 1))}
              style={styles.input}
            />
            <span style={styles.hint}>Baseline Demand: 135 Liters per Head per Day (IS 1172)</span>
          </div>

          <div style={styles.row2}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Sump Buffer Days</label>
              <select
                value={sumpDays}
                onChange={(e) => setSumpDays(parseFloat(e.target.value))}
                style={styles.select}
              >
                <option value={1.0}>1.0 Day Buffer</option>
                <option value={1.5}>1.5 Days Buffer (Standard)</option>
                <option value={2.0}>2.0 Days Buffer (Recommended)</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>OHT Buffer Days</label>
              <select
                value={ohtDays}
                onChange={(e) => setOhtDays(parseFloat(e.target.value))}
                style={styles.select}
              >
                <option value={0.5}>0.5 Day Buffer</option>
                <option value={0.75}>0.75 Day Buffer (Standard)</option>
                <option value={1.0}>1.0 Day Buffer</option>
              </select>
            </div>
          </div>

          <div style={styles.row2}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>No. of Building Floors</label>
              <input
                type="number"
                value={floors}
                onChange={(e) => setFloors(Math.max(1, parseFloat(e.target.value) || 1))}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Borewell Depth (ft)</label>
              <input
                type="number"
                value={borewellDepth}
                onChange={(e) => setBorewellDepth(Math.max(100, parseInt(e.target.value) || 100))}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Right Card: Storage Sizing Output */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🚰 Recommended Storage Tank Capacities</h3>
          <p style={styles.cardSub}>Computed for {occupants} occupants @ 135 LPCD</p>

          <div style={styles.storageGrid}>
            <div style={styles.sumpBox}>
              <div style={styles.boxTitle}>UNDERGROUND SUMP STORAGE</div>
              <div style={styles.boxVal}>{storage.sumpCapacityLiters.toLocaleString()} Liters</div>
              <div style={styles.boxSub}>
                Dimension: ~{storage.recommendedSumpFt.lengthFt} ft (L) x {storage.recommendedSumpFt.widthFt} ft (W) x {storage.recommendedSumpFt.depthFt} ft (D)
              </div>
            </div>

            <div style={styles.ohtBox}>
              <div style={styles.boxTitle}>OVERHEAD TANK (OHT) STORAGE</div>
              <div style={styles.boxVal}>{storage.overheadTankCapacityLiters.toLocaleString()} Liters</div>
              <div style={styles.boxSub}>
                Recommended: 2x 1000L or 1x 2000L 3-Layer Sintex/Supreme Tank
              </div>
            </div>
          </div>

          <div style={styles.demandBox}>
            <strong>Daily Consumption Breakdown:</strong> {storage.totalDailyDemandLiters.toLocaleString()} Liters / Day (135 LPCD standard domestic consumption).
          </div>
        </div>
      </div>

      {/* Pump HP & Pressure Booster Recommendation Banner */}
      <div style={styles.pumpCard}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          ⚡ Pump Horsepower (HP) & Dynamic Head (TDH) Calculations
        </h3>

        <div style={styles.pumpGrid}>
          <div style={styles.pumpBox}>
            <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>TRANSFER PUMP (SUMP → OHT)</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
              {pump.recommendedTransferPumpHp}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Static Lift: {pump.staticVerticalHeadFt} ft | TDH: {pump.totalDynamicHeadFt} ft
            </div>
          </div>

          <div style={styles.pumpBox}>
            <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>BOREWELL SUBMERSIBLE PUMP</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
              {pump.recommendedBorewellPumpHp}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Borewell Depth: {borewellDepth} ft (Bengaluru Aquifer Level)
            </div>
          </div>

          <div style={styles.pumpBox}>
            <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>PRESSURE BOOSTER PUMP</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
              {pump.boosterPumpHp}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              {pump.needsPressureBooster ? "Ensures 2.5 bar pressure for top-floor diverters" : "Gravity head sufficient"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' },
  banner: {
    background: "linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%)",
    color: "#ffffff",
    padding: "20px 24px",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(3, 105, 161, 0.2)"
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.08em",
    color: "#7dd3fc"
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
  inputGroup: { marginBottom: '0px', minWidth: 0 },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },
  label: { display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  input: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '12px', textAlign: 'center', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },
  select: { width: '100%', padding: '2px 4px', height: '30px', fontSize: '11px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' },
  hint: {
    fontSize: 11,
    color: "#64748b"
  },
  storagegrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' },
  sumpBox: {
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    padding: 14,
    borderRadius: 12
  },
  ohtBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: 14,
    borderRadius: 12
  },
  boxTitle: {
    fontSize: 11,
    fontWeight: 800,
    color: "#0369a1",
    letterSpacing: "0.05em"
  },
  boxVal: {
    fontSize: 22,
    fontWeight: 900,
    color: "#0f172a",
    marginTop: 4
  },
  boxSub: {
    fontSize: 12,
    color: "#475569",
    marginTop: 4
  },
  demandBox: {
    background: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    fontSize: 12,
    color: "#334155"
  },
  pumpcard: { padding: "3px 2px", borderRadius: "4px", textAlign: "center", minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  pumpgrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '4px', marginBottom: '6px' },
  pumpBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 14
  }
};
















