import React, { useState } from "react";

export default function UtilityProcess() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    plan: true,
    khata: true,
    tax: true,
    deed: true,
    id: true,
    plumber: true
  });

  const docsList = [
    { id: "plan", title: "Sanctioned Building Plan Copy", desc: "Approved by BBMP / BDA / Local Authority with floor area details." },
    { id: "khata", title: "Latest Khata Extract (Form A / e-Khata)", desc: "Valid Khata certificate issued by BBMP." },
    { id: "tax", title: "Latest Tax Paid Receipt", desc: "Current financial year BBMP property tax receipt." },
    { id: "deed", title: "Ownership Sale Deed / Allotment Letter", desc: "Registered property title deed proving ownership." },
    { id: "id", title: "Owner ID & Passport Photos", desc: "Aadhaar Card / PAN Card copy & 2 passport size photos." },
    { id: "plumber", title: "Licensed BWSSB Plumber Certificate", desc: "Form C signed by Grade-1 BWSSB Licensed Plumber." }
  ];

  const steps = [
    {
      stepNo: 1,
      title: "Online BWSSB Portal Application",
      description: "Submit online application via BWSSB Portal or Sakala Services with property details, built-up area, and plumber registration.",
      timeline: "Day 1 – 3",
      costNote: "Registration Fee: ~₹500"
    },
    {
      stepNo: 2,
      title: "AEE Site Inspection & Feasibility Report",
      description: "Assistant Executive Engineer (AEE) visits site to inspect UGD main sewer line depth, road cutting distance, and water main pressure.",
      timeline: "Day 4 – 7",
      costNote: "Inspection Fee: Included"
    },
    {
      stepNo: 3,
      title: "Prorata & GBWASP Infrastructure Payment",
      description: "Official BWSSB advice note issued for Prorata charges based on total built-up area (sq.m) + Sanitary deposit + Meter fee.",
      timeline: "Day 8 – 12",
      costNote: "Prorata Charges: Based on built-up area"
    },
    {
      stepNo: 4,
      title: "UGD Chamber Setup & Water Meter Fixing",
      description: "Licensed Plumber connects 4-inch SWR pipe to UGD main line chamber (2ft x 2ft) and installs BWSSB-approved AMR Class-B Water Meter.",
      timeline: "Day 13 – 15",
      costNote: "Meter & Road Cutting Fee"
    },
    {
      stepNo: 5,
      title: "Water Supply Commissioning & RR Number Issue",
      description: "BWSSB releases main water line valve and issues permanent Revenue Register (RR) Number for monthly billing.",
      timeline: "Day 16 – 18",
      costNote: "Commissioning Complete"
    }
  ];

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalChecked = Object.values(checkedDocs).filter(Boolean).length;

  return (
    <div style={styles.container}>
      {/* Module Title Banner */}
      <div style={styles.heroBanner}>
        <div>
          <span style={styles.heroBadge}>BWSSB UTILITY SANCTIONING ROADMAP</span>
          <h2 style={styles.heroTitle}>Bengaluru BWSSB Water & Sewerage Connection Guide</h2>
          <p style={styles.heroSub}>
            Official procedure, Prorata calculation rules, document checklists, and UGD underground drainage chamber setup for Bengaluru properties.
          </p>
        </div>
      </div>

      {/* Grid Layout: Checklist & Step-by-Step Wizard */}
      <div style={styles.mainGrid}>
        {/* Left Column: Required Documents Checklist */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={{ fontSize: "20px" }}>📑</span>
            <div>
              <h3 style={styles.cardTitle}>Document Readiness Checklist</h3>
              <p style={styles.cardSub}>Check required documents for BWSSB Sakala application</p>
            </div>
            <span style={styles.progressBadge}>{totalChecked} / {docsList.length} Ready</span>
          </div>

          <div style={styles.docList}>
            {docsList.map((doc) => {
              const isDone = checkedDocs[doc.id];
              return (
                <div
                  key={doc.id}
                  style={{
                    ...styles.docItem,
                    ...(isDone ? styles.docItemActive : {})
                  }}
                  onClick={() => toggleDoc(doc.id)}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleDoc(doc.id)}
                    style={{ cursor: "pointer", width: 18, height: 18 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={styles.docTitle}>{doc.title}</div>
                    <div style={styles.docDesc}>{doc.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={styles.infoBox}>
            <strong>💡 Pro-Tip for Property Owners:</strong> Prorata charges are mandatory for all multi-dwelling residential buildings in Bengaluru. Ensure your BWSSB plumber is Grade-1 licensed to avoid application rejection.
          </div>
        </div>

        {/* Right Column: Step-by-Step Connection Roadmap */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={{ fontSize: "20px" }}>🛠️</span>
            <div>
              <h3 style={styles.cardTitle}>Step-by-Step Connection Wizard</h3>
              <p style={styles.cardSub}>Click steps to view procedure & BWSSB inspection criteria</p>
            </div>
          </div>

          <div style={styles.wizardList}>
            {steps.map((s) => {
              const isSelected = activeStep === s.stepNo;
              return (
                <div
                  key={s.stepNo}
                  style={{
                    ...styles.stepCard,
                    ...(isSelected ? styles.stepCardActive : {})
                  }}
                  onClick={() => setActiveStep(s.stepNo)}
                >
                  <div style={styles.stepHeaderRow}>
                    <div style={styles.stepNumBadge}>Step {s.stepNo}</div>
                    <div style={styles.stepName}>{s.title}</div>
                    <span style={styles.timelineBadge}>{s.timeline}</span>
                  </div>

                  <p style={styles.stepDesc}>{s.description}</p>

                  <div style={styles.stepFooterRow}>
                    <span style={styles.costBadge}>{s.costNote}</span>
                    <span style={{ fontSize: 12, color: "#0284c7", fontWeight: 700 }}>
                      {isSelected ? "● Active Step" : "Click to Inspect"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prorata & Sewerage Technical Specification Card */}
      <div style={styles.specCard}>
        <h3 style={styles.specTitle}>📐 UGD Main Sewer Line & Chamber Technical Guidelines</h3>
        <div style={styles.specGrid}>
          <div style={styles.specBox}>
            <span style={styles.specIcon}>🧱</span>
            <div>
              <strong>Inspection Chamber Size:</strong>
              <div>1.5 ft x 1.5 ft (up to 3 ft depth) or 2.0 ft x 2.0 ft with heavy-duty CI / SFRC chamber cover.</div>
            </div>
          </div>
          <div style={styles.specBox}>
            <span style={styles.specIcon}>🚽</span>
            <div>
              <strong>Soil Pipe Separation:</strong>
              <div>4-inch (110mm) SWR PVC soil line for EWC waste; separate 3-inch line for washbasin/shower waste.</div>
            </div>
          </div>
          <div style={styles.specBox}>
            <span style={styles.specIcon}>🚿</span>
            <div>
              <strong>Gully Trap Setup:</strong>
              <div>P-Trap / S-Trap water seal with gully trap mesh to prevent sewer gas backflow.</div>
            </div>
          </div>
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
  heroBanner: {
    background: "linear-gradient(135deg, #0e7490 0%, #155e75 100%)",
    color: "#ffffff",
    padding: "20px 24px",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(14, 116, 144, 0.2)"
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.08em",
    color: "#a5f3fc"
  },
  heroTitle: {
    margin: "4px 0 0",
    fontSize: 22,
    fontWeight: 900
  },
  heroSub: {
    margin: "6px 0 0",
    fontSize: 13,
    opacity: 0.9,
    lineHeight: 1.5
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 20
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid #f1f5f9"
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a"
  },
  cardSub: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#64748b"
  },
  progressBadge: {
    marginLeft: "auto",
    background: "#e0f2fe",
    color: "#0369a1",
    fontSize: 11,
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: 12
  },
  docList: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  docItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #f1f5f9",
    background: "#f8fafc",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  docItemActive: {
    borderColor: "#38bdf8",
    background: "#f0f9ff"
  },
  docTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a"
  },
  docDesc: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    background: "#fffbebe6",
    border: "1px solid #fde68a",
    borderRadius: 10,
    fontSize: 12,
    color: "#b45309",
    lineHeight: 1.5
  },
  wizardList: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  stepCard: {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  stepCardActive: {
    borderColor: "#0e7490",
    background: "#f0fdfa",
    boxShadow: "0 4px 12px rgba(14, 116, 144, 0.08)"
  },
  stepHeaderRow: {
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  stepNumBadge: {
    background: "#0e7490",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 900,
    padding: "3px 8px",
    borderRadius: 6
  },
  stepName: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a",
    flex: 1
  },
  timelineBadge: {
    fontSize: 11,
    color: "#64748b",
    background: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: 6
  },
  stepDesc: {
    fontSize: 12,
    color: "#475569",
    margin: "8px 0 10px",
    lineHeight: 1.45
  },
  stepFooterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  costBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0369a1"
  },
  specCard: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #e2e8f0"
  },
  specTitle: {
    margin: "0 0 14px",
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a"
  },
  specGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14
  },
  specBox: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: 12,
    background: "#f8fafc",
    borderRadius: 10,
    fontSize: 12,
    color: "#334155",
    border: "1px solid #f1f5f9"
  },
  specIcon: {
    fontSize: 20
  }
};
