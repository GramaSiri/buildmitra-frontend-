import React from "react";
import { PLUMBING_BRAND_DIRECTORY } from "../../utils/plumbing/brandMatrix";

export default function PlumbingBrandGuide() {
  return (
    <div style={styles.container}>
      {/* Title Banner */}
      <div style={styles.banner}>
        <div>
          <span style={styles.bannerBadge}>TIERED BRAND DIRECTORY & MATERIAL MATRIX</span>
          <h2 style={styles.bannerTitle}>Plumbing Materials, Sanitaryware & Brand Matrix</h2>
          <p style={styles.bannerSub}>
            Technical specifications and tiered brand directory for CPVC/UPVC pipes, SWR drainage, sanitaryware, CP bath fittings, submersibles, and UV overhead tanks.
          </p>
        </div>
      </div>

      {/* Brand Matrix Cards */}
      <div style={styles.grid}>
        {PLUMBING_BRAND_DIRECTORY.map((item, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: 20 }}>📦</span>
              <h3 style={styles.categoryTitle}>{item.category}</h3>
            </div>

            <div style={styles.tierSection}>
              {/* Luxury Tier */}
              <div style={styles.tierBox}>
                <span style={{ ...styles.tierBadge, background: "#7e22ce", color: "#ffffff" }}>
                  LUXURY / TOP TIER
                </span>
                <ul style={styles.brandList}>
                  {item.luxuryTier.map((b, i) => (
                    <li key={i} style={styles.brandItem}>• {b}</li>
                  ))}
                </ul>
              </div>

              {/* Premium Tier */}
              <div style={styles.tierBox}>
                <span style={{ ...styles.tierBadge, background: "#0284c7", color: "#ffffff" }}>
                  PREMIUM / POPULAR TIER
                </span>
                <ul style={styles.brandList}>
                  {item.premiumTier.map((b, i) => (
                    <li key={i} style={styles.brandItem}>• {b}</li>
                  ))}
                </ul>
              </div>

              {/* Value Tier */}
              <div style={styles.tierBox}>
                <span style={{ ...styles.tierBadge, background: "#059669", color: "#ffffff" }}>
                  VALUE / BUDGET TIER
                </span>
                <ul style={styles.brandList}>
                  {item.valueTier.map((b, i) => (
                    <li key={i} style={styles.brandItem}>• {b}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={styles.notesBox}>
              <strong>📐 Specification Note:</strong> {item.specificationNotes}
            </div>
          </div>
        ))}
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
    background: "linear-gradient(135deg, #0284c7 0%, #0f172a 100%)",
    color: "#ffffff",
    padding: "20px 24px",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(2, 132, 199, 0.2)"
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.08em",
    color: "#38bdf8"
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
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: 14
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: 10
  },
  categoryTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a"
  },
  tierSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  tierBox: {
    background: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    border: "1px solid #f1f5f9"
  },
  tierBadge: {
    fontSize: 10,
    fontWeight: 900,
    padding: "3px 8px",
    borderRadius: 4,
    display: "inline-block",
    marginBottom: 6
  },
  brandList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 12px"
  },
  brandItem: {
    fontSize: 12,
    fontWeight: 700,
    color: "#334155"
  },
  notesBox: {
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: 8,
    padding: 10,
    fontSize: 11,
    color: "#0369a1",
    lineHeight: 1.45
  }
};
