import React, { useState } from "react";
import {
  CONDUCTOR_STANDARDS,
  EARTHING_PROTECTION_STANDARDS,
  BRAND_DIRECTORY,
} from "../../utils/electrical/brandMatrix";

export const WiringBrandGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Wires & Cables", "Modular Switches", "Switchgear (MCB / RCCB / DB)", "Solar Hardware"];

  const filteredBrands = selectedCategory === "All"
    ? BRAND_DIRECTORY
    : BRAND_DIRECTORY.filter((b) => b.category === selectedCategory);

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerBadge}>IS 694 & IS 12640 TECHNICAL STANDARDS</div>
        <h2 style={styles.bannerTitle}>Circuit Design, Wiring Sizing & Tiered Brand Directory</h2>
        <p style={styles.bannerSub}>
          Conductor sizing rules ($1.5\text{mm}^2$–$16\text{mm}^2$ FR-LSH Copper), chemical earthing protection standards, MCB/RCCB curve selection, and tiered brand matrix.
        </p>
      </div>

      {/* 1. Conductor & Wiring Sizing Standards Table */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>1. FR-LSH Copper Conductor Sizing & Conduit Standards</h3>
        <p style={styles.text}>
          Standard wire gauges recommended for residential distribution lines under IS 694 for Flame Retardant Low Smoke & Halogen (FR-LSH) copper cables.
        </p>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Wire Gauge</th>
                <th>Max Current</th>
                <th>Max Power @ 230V</th>
                <th>Primary Application Use-Case</th>
                <th>Conduit Size</th>
                <th>Color Code Standard</th>
              </tr>
            </thead>
            <tbody>
              {CONDUCTOR_STANDARDS.map((c) => (
                <tr key={c.sizeSqMm}>
                  <td>
                    <span style={styles.gaugeBadge}>{c.sizeSqMm} sq.mm</span>
                  </td>
                  <td><strong>{c.maxCurrentRatingAmps} A</strong></td>
                  <td>{c.maxWatts230V.toLocaleString()} W</td>
                  <td>{c.useCase}</td>
                  <td>{c.recommendedConduitMm} mm PVC</td>
                  <td><span style={styles.colorTag}>{c.colorCode}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Earthing & Protection Standards */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>2. Earthing & Circuit Protection Standards</h3>

        <div style={styles.protGrid}>
          {EARTHING_PROTECTION_STANDARDS.map((p, idx) => (
            <div key={idx} style={styles.protCard}>
              <div style={styles.protHeader}>
                <span style={styles.protCategory}>{p.category}</span>
                <span style={styles.protReq}>{p.requirement}</span>
              </div>
              <div style={styles.protSpec}>{p.specification}</div>
              <div style={styles.protRule}><strong>CEA / IS Compliance Rule:</strong> {p.complianceRule}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tiered Brand Directory */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>3. Tiered Electrical & Solar Brand Directory</h3>

          <div style={styles.filterGroup}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                style={{
                  ...styles.filterBtn,
                  ...(selectedCategory === cat ? styles.filterBtnActive : {}),
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.brandGrid}>
          {filteredBrands.map((b, idx) => {
            const isPremium = b.tier.includes("Premium") || b.tier.includes("Top Tier");
            const isLuxury = b.tier.includes("Luxury");

            return (
              <div
                key={idx}
                style={{
                  ...styles.brandCard,
                  borderColor: isPremium ? "#3b82f6" : "#e2e8f0",
                }}
              >
                <div style={styles.brandTop}>
                  <span
                    style={{
                      ...styles.tierBadge,
                      backgroundColor: isPremium ? "#dbeafe" : "#f1f5f9",
                      color: isPremium ? "#1e40af" : "#475569",
                    }}
                  >
                    {b.tier}
                  </span>
                  <span style={styles.brandCategory}>{b.category}</span>
                </div>

                <h4 style={styles.brandName}>{b.brandName}</h4>
                <p style={styles.brandFeatures}>{b.keyFeatures}</p>

                <div style={styles.warrantyBox}>
                  <strong>Warranty:</strong> {b.warrantyPeriod}
                </div>
              </div>
            );
          })}
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
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 20px rgba(30, 27, 75, 0.15)",
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: 900,
    color: "#818cf8",
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
    color: "#c7d2fe",
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
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 800,
    color: "#0f172a",
  },
  text: {
    color: "#475569",
    fontSize: 14,
    margin: "0 0 16px",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    textAlign: "left",
  },
  gaugeBadge: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    padding: "4px 8px",
    borderRadius: 6,
    fontWeight: 900,
    fontSize: 12,
  },
  colorTag: {
    fontSize: 11,
    color: "#475569",
  },
  protGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
  protCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  protHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  protCategory: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a",
  },
  protReq: {
    fontSize: 11,
    fontWeight: 700,
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    padding: "2px 6px",
    borderRadius: 4,
  },
  protSpec: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 1.4,
  },
  protRule: {
    marginTop: 10,
    paddingTop: 8,
    borderTop: "1px dashed #cbd5e1",
    fontSize: 11,
    color: "#64748b",
  },
  filterGroup: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    cursor: "pointer",
  },
  filterBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    color: "#ffffff",
  },
  brandGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  brandCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    border: "1px solid",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  brandTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tierBadge: {
    fontSize: 10,
    fontWeight: 900,
    padding: "3px 8px",
    borderRadius: 6,
    letterSpacing: "0.04em",
  },
  brandCategory: {
    fontSize: 11,
    color: "#94a3b8",
  },
  brandName: {
    margin: "0 0 6px",
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
  },
  brandFeatures: {
    margin: 0,
    fontSize: 12,
    color: "#475569",
    lineHeight: 1.4,
  },
  warrantyBox: {
    marginTop: 12,
    fontSize: 11,
    color: "#166534",
    fontWeight: 700,
  },
};

export default WiringBrandGuide;
