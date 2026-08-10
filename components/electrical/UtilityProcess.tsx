import React, { useState } from "react";

export const UtilityProcess: React.FC = () => {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    plan: true,
    khata: true,
    deed: true,
    id: true,
    photo: true,
  });

  const toggleDoc = (key: string) => {
    setCheckedDocs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedDocsCount = Object.values(checkedDocs).filter(Boolean).length;
  const isDocsComplete = completedDocsCount === 5;

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerBadge}>BESCOM BENGALURU UTILITY ENGINE</div>
        <h2 style={styles.bannerTitle}>BESCOM Power Sanction & Tariff Conversion Roadmap</h2>
        <p style={styles.bannerSub}>
          Official step-by-step procedural workflow for Bengaluru residential construction—from LT-7(a) Temporary Commercial Power to LT-2(a) Permanent Domestic Connection.
        </p>
      </div>

      {/* Phase Selector Tabs */}
      <div style={styles.phaseNav}>
        <button
          style={{
            ...styles.phaseTab,
            ...(activePhase === 1 ? styles.phaseTabActive : {}),
          }}
          onClick={() => setActivePhase(1)}
        >
          <span style={styles.phaseStepNum}>PHASE 1</span>
          <span style={styles.phaseStepTitle}>LT-7(a) Temporary Commercial Power</span>
        </button>
        <button
          style={{
            ...styles.phaseTab,
            ...(activePhase === 2 ? styles.phaseTabActive : {}),
          }}
          onClick={() => setActivePhase(2)}
        >
          <span style={styles.phaseStepNum}>PHASE 2</span>
          <span style={styles.phaseStepTitle}>Load Sanctioning & Phase Rules</span>
        </button>
        <button
          style={{
            ...styles.phaseTab,
            ...(activePhase === 3 ? styles.phaseTabActive : {}),
          }}
          onClick={() => setActivePhase(3)}
        >
          <span style={styles.phaseStepNum}>PHASE 3</span>
          <span style={styles.phaseStepTitle}>LT-2(a) Permanent Domestic Conversion</span>
        </button>
      </div>

      {/* Phase 1 Content */}
      {activePhase === 1 && (
        <div style={styles.phaseBody}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Phase 1: Temporary Commercial Connection (LT-7a)</h3>
              <span style={styles.tariffTag}>Tariff: LT-7(a) Construction Era</span>
            </div>
            <p style={styles.text}>
              Mandatory for ongoing building construction. Powers site equipment, borewell pumps, concrete mixers, and temporary lighting during the construction phase.
            </p>

            <h4 style={styles.sectionTitle}>📋 Mandatory Application Document Checklist</h4>
            <div style={styles.docGrid}>
              <label style={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={checkedDocs.plan}
                  onChange={() => toggleDoc("plan")}
                  style={styles.checkbox}
                />
                <div>
                  <strong>BBMP / BDA Sanctioned Building Plan Copy</strong>
                  <div style={styles.docHint}>Approved floor layout plan with valid sanction LP number</div>
                </div>
              </label>

              <label style={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={checkedDocs.khata}
                  onChange={() => toggleDoc("khata")}
                  style={styles.checkbox}
                />
                <div>
                  <strong>Latest Khata Extract & Tax Paid Receipt</strong>
                  <div style={styles.docHint}>BBMP A-Khata / E-Swathu Khata extract with recent tax receipt</div>
                </div>
              </label>

              <label style={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={checkedDocs.deed}
                  onChange={() => toggleDoc("deed")}
                  style={styles.checkbox}
                />
                <div>
                  <strong>Ownership Sale Deed / Allotment Letter</strong>
                  <div style={styles.docHint}>Registered title deed proving property ownership</div>
                </div>
              </label>

              <label style={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={checkedDocs.id}
                  onChange={() => toggleDoc("id")}
                  style={styles.checkbox}
                />
                <div>
                  <strong>Applicant Identity Proof</strong>
                  <div style={styles.docHint}>Owner Aadhaar Card / PAN Card copy</div>
                </div>
              </label>

              <label style={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={checkedDocs.photo}
                  onChange={() => toggleDoc("photo")}
                  style={styles.checkbox}
                />
                <div>
                  <strong>Owner Passport Photographs</strong>
                  <div style={styles.docHint}>2 passport size photos for consumer register</div>
                </div>
              </label>
            </div>

            <div style={{ ...styles.alertBox, backgroundColor: isDocsComplete ? "#f0fdf4" : "#fff7ed", borderColor: isDocsComplete ? "#bbf7d0" : "#fed7aa" }}>
              <strong>Document Readiness Status:</strong> {completedDocsCount}/5 Completed. {isDocsComplete ? "✅ All documents ready for BESCOM Online Portal upload!" : "⚠️ Complete all 5 checklist items before submitting your application."}
            </div>

            <h4 style={styles.sectionTitle}>⚙️ Step-by-Step BESCOM Temporary Power Wizard</h4>
            <div style={styles.timeline}>
              <div style={styles.timelineItem}>
                <div style={styles.timelineBadge}>STEP 1</div>
                <div>
                  <strong>Online Application Filing</strong>
                  <p style={styles.timelineDesc}>Submit online application on BESCOM Customer Portal (bescom.karnataka.gov.in) under LT-7(a) Temporary Commercial tariff.</p>
                </div>
              </div>
              <div style={styles.timelineItem}>
                <div style={styles.timelineBadge}>STEP 2</div>
                <div>
                  <strong>Field Officer (FO) Site Inspection</strong>
                  <p style={styles.timelineDesc}>BESCOM FO inspects plot boundary, verifies sanctioned plan, checks service pole distance, and calculates Line Extension charges.</p>
                </div>
              </div>
              <div style={styles.timelineItem}>
                <div style={styles.timelineBadge}>STEP 3</div>
                <div>
                  <strong>Demand Note Payment</strong>
                  <p style={styles.timelineDesc}>Pay Service Main charges, Meter Security Deposit (MSD), and Initial Security Deposit (ISD) against official BESCOM advice note.</p>
                </div>
              </div>
              <div style={styles.timelineItem}>
                <div style={styles.timelineBadge}>STEP 4</div>
                <div>
                  <strong>Meter Installation & Commissioning</strong>
                  <p style={styles.timelineDesc}>BESCOM installs weatherproof temporary digital energy meter on site board. Power commissioned under LT-7(a).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2 Content */}
      {activePhase === 2 && (
        <div style={styles.phaseBody}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Phase 2: Regulatory Load Sanctioning & Phase Threshold Rules</h3>
              <span style={styles.tariffTag}>BESCOM KERC Benchmark</span>
            </div>
            <p style={styles.text}>
              Regulatory rules governing minimum power sanctioning per built-up area and Phase threshold boundaries in Karnataka.
            </p>

            <div style={styles.grid2}>
              <div style={styles.ruleBox}>
                <div style={styles.ruleIcon}>📐</div>
                <h4 style={styles.ruleTitle}>Regulatory Minimum Baseline</h4>
                <div style={styles.ruleValue}>1 kW per 500 sq.ft</div>
                <p style={styles.ruleDesc}>
                  KERC mandates a minimum of 1 kW sanctioned load for every 500 sq.ft of total built-up area (BUA), plus additional allowances for heavy appliances.
                </p>
              </div>

              <div style={styles.ruleBox}>
                <div style={styles.ruleIcon}>⚡</div>
                <h4 style={styles.ruleTitle}>Single Phase vs 3-Phase Boundary</h4>
                <div style={styles.ruleValue}>5 kW Threshold</div>
                <p style={styles.ruleDesc}>
                  <strong>≤ 5 kW Sanctioned Load:</strong> Single Phase (230V AC) meter.<br />
                  <strong>&gt; 5 kW up to 25 kW:</strong> Three-Phase (415V AC) meter mandatory.
                </p>
              </div>
            </div>

            <h4 style={styles.sectionTitle}>📊 BESCOM Residential Phase Threshold Matrix</h4>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Sanctioned Load Range</th>
                    <th>Supply Voltage & Phase</th>
                    <th>Meter Board Spec</th>
                    <th>Recommended Appliance Capacities</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>1 kW – 3 kW</strong></td>
                    <td>Single-Phase (230V)</td>
                    <td>32A SPN Meter Box</td>
                    <td>Basic lighting, Fans, TV, 1 Geyser (1.5 kW), Refrigerator</td>
                  </tr>
                  <tr>
                    <td><strong>4 kW – 5 kW</strong></td>
                    <td>Single-Phase (230V)</td>
                    <td>40A SPN Weatherproof Box</td>
                    <td>Lighting, Fans, 2 Geysers, 1 Inverter AC (1.5T), EV Slow Charger</td>
                  </tr>
                  <tr>
                    <td><strong>6 kW – 12 kW</strong></td>
                    <td>Three-Phase (415V)</td>
                    <td>63A TPN Meter Board + Neutral Link</td>
                    <td>Multi-story independent home, 3+ ACs, Heat Pump, EV Wallbox Charger</td>
                  </tr>
                  <tr>
                    <td><strong>13 kW – 25 kW</strong></td>
                    <td>Three-Phase (415V)</td>
                    <td>100A TPN Heavy Duty DB</td>
                    <td>Multi-unit apartments, VRF HVAC systems, Lift, Solar Grid-Tie Net Meter</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3 Content */}
      {activePhase === 3 && (
        <div style={styles.phaseBody}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Phase 3: LT-2(a) Permanent Residential Tariff Conversion</h3>
              <span style={styles.tariffTag}>Tariff: LT-2(a) Domestic</span>
            </div>
            <p style={styles.text}>
              Once internal electrical wiring and building construction are completed, apply for tariff conversion from LT-7(a) Temporary Commercial to LT-2(a) Domestic to enjoy lower slab-based residential electricity rates.
            </p>

            <h4 style={styles.sectionTitle}>📜 Mandatory Compliance Certificates Required</h4>
            <div style={styles.complianceGrid}>
              <div style={styles.compCard}>
                <div style={styles.compIcon}>✍️</div>
                <div>
                  <strong>Wiring Completion & L-Form Certificate</strong>
                  <p style={styles.compDesc}>Official wiring completion certificate signed by a licensed Class-1 Electrical Contractor (LEC) registered with Karnataka Electrical Inspectorate.</p>
                </div>
              </div>

              <div style={styles.compCard}>
                <div style={styles.compIcon}>🛡️</div>
                <div>
                  <strong>RCCB / ELCB Operational Test Report</strong>
                  <p style={styles.compDesc}>Test certificate confirming 30mA residual current circuit breaker trip test under 30 milliseconds.</p>
                </div>
              </div>

              <div style={styles.compCard}>
                <div style={styles.compIcon}>🌱</div>
                <div>
                  <strong>Earth Resistance Test Certificate</strong>
                  <p style={styles.compDesc}>Earth pit resistance measurement report verifying earth loop impedance is strictly below 5.0 Ohms.</p>
                </div>
              </div>
            </div>

            <h4 style={styles.sectionTitle}>🎛️ Weatherproof Meter Board Technical Specifications</h4>
            <div style={styles.specsBox}>
              <ul style={styles.specsList}>
                <li><strong>Enclosure:</strong> Weatherproof IP65 powder-coated sheet steel or UV-resistant FRP meter enclosure with transparent viewing window.</li>
                <li><strong>Backing Board:</strong> Fire-retardant SMC / Hylam backing board (minimum 6mm thickness).</li>
                <li><strong>Main Switch:</strong> Heavy duty 4-Pole 63A Isolator / Rotary switch for 3-phase setups (2-Pole 40A for single phase).</li>
                <li><strong>Neutral Link:</strong> Solid brass neutral distribution block with insulated shroud.</li>
                <li><strong>Protection Unit:</strong> 4-Pole 30mA RCCB (Residual Current Circuit Breaker) installed downstream of the energy meter.</li>
                <li><strong>Seal Provisions:</strong> BESCOM official lead seal lugs on terminal cover and meter box door latch.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
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
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
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
  phaseNav: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  phaseTab: {
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  phaseTabActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
  },
  phaseStepNum: {
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.05em",
    opacity: 0.8,
  },
  phaseStepTitle: {
    fontSize: 14,
    fontWeight: 800,
    marginTop: 4,
  },
  phaseBody: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
  },
  tariffTag: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 800,
  },
  text: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.5,
    margin: 0,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#1e293b",
    marginTop: 20,
    marginBottom: 12,
  },
  docGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
  },
  checkboxItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    fontSize: 13,
  },
  checkbox: {
    marginTop: 3,
    width: 16,
    height: 16,
    accentColor: "#2563eb",
  },
  docHint: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  alertBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    border: "1px solid",
    fontSize: 13,
    color: "#1e293b",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  timelineItem: {
    display: "flex",
    gap: 14,
    padding: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderLeft: "4px solid #2563eb",
  },
  timelineBadge: {
    fontSize: 11,
    fontWeight: 900,
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    padding: "4px 8px",
    borderRadius: 6,
    height: "fit-content",
  },
  timelineDesc: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.4,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
    marginTop: 16,
  },
  ruleBox: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  ruleIcon: {
    fontSize: 28,
  },
  ruleTitle: {
    margin: "8px 0 4px",
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
  },
  ruleValue: {
    fontSize: 20,
    fontWeight: 900,
    color: "#2563eb",
    marginBottom: 8,
  },
  ruleDesc: {
    margin: 0,
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.5,
  },
  tableWrap: {
    overflowX: "auto",
    marginTop: 12,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    textAlign: "left",
  },
  complianceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
  },
  compCard: {
    display: "flex",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  compIcon: {
    fontSize: 24,
  },
  compDesc: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#475569",
    lineHeight: 1.4,
  },
  specsBox: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  specsList: {
    margin: 0,
    paddingLeft: 20,
    fontSize: 13,
    color: "#334155",
    lineHeight: 1.7,
  },
};

export default UtilityProcess;
