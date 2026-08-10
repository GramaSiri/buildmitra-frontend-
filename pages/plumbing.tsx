import React, { useState } from "react";
import Head from "next/head";
import UtilityProcess from "../components/plumbing/UtilityProcess";
import FixtureCalculator from "../components/plumbing/FixtureCalculator";
import TankPumpCalculator from "../components/plumbing/TankPumpCalculator";
import RwhQualityGuide from "../components/plumbing/RwhQualityGuide";
import PlumbingBrandGuide from "../components/plumbing/PlumbingBrandGuide";
import PlumbingEstimator from "../components/plumbing/PlumbingEstimator";

export default function PlumbingPage() {
  const [activeTab, setActiveTab] = useState<
    "utility" | "pipe" | "pump" | "quality" | "brand" | "boq"
  >("utility");

  const tabs = [
    {
      id: "utility" as const,
      label: "BWSSB Utility Process",
      icon: "📜",
      desc: "Water & UGD Connection Roadmap"
    },
    {
      id: "pipe" as const,
      label: "Pipe Sizing & Aerators",
      icon: "🚰",
      desc: "WSFU Fixtures & 70% Water Savings"
    },
    {
      id: "pump" as const,
      label: "Sump, OHT & Pump HP",
      icon: "⚙️",
      desc: "IS 1172 Storage & TDH Sizing"
    },
    {
      id: "quality" as const,
      label: "TDS, Softener & RWH",
      icon: "🌧️",
      desc: "BWSSB Rainwater Yield & Softener"
    },
    {
      id: "brand" as const,
      label: "Plumbing Brand Matrix",
      icon: "🔌",
      desc: "CPVC/UPVC, Sanitaryware & Tanks"
    },
    {
      id: "boq" as const,
      label: "BOQ & Cost Estimator",
      icon: "💰",
      desc: "Turnkey BOQ & PDF/CSV Export"
    }
  ];

  return (
    <>
      <Head>
        <title>Plumbing, BWSSB Utility & Rainwater Harvesting Engine | BuildMitra</title>
        <meta
          name="description"
          content="End-to-end residential plumbing, BWSSB water sanctioning roadmap, IS 1172 storage sizing, rainwater harvesting, TDS softeners, and turnkey BOQ cost calculator for Bengaluru."
        />
      </Head>

      <div style={styles.pageWrap}>
        {/* Main Header */}
        <div style={styles.topHeader}>
          <div>
            <span style={styles.topBadge}>BUILDMITRA TECHNICAL ENGINE</span>
            <h1 style={styles.topTitle}>Plumbing, BWSSB Utility & Conservation Engine</h1>
            <p style={styles.topSub}>
              Complete residential plumbing workflow for Bengaluru/Karnataka—spanning official BWSSB water connection sanctioning, fixture sizing, rainwater harvesting, water softeners, and turnkey BOQ estimates.
            </p>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div style={styles.tabBar}>
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                style={{
                  ...styles.tabItem,
                  ...(isActive ? styles.tabItemActive : {})
                }}
                onClick={() => setActiveTab(t.id)}
              >
                <span style={styles.tabIcon}>{t.icon}</span>
                <div>
                  <div style={styles.tabLabel}>{t.label}</div>
                  <div style={styles.tabDesc}>{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div style={styles.tabContentArea}>
          {activeTab === "utility" && <UtilityProcess />}
          {activeTab === "pipe" && <FixtureCalculator />}
          {activeTab === "pump" && <TankPumpCalculator />}
          {activeTab === "quality" && <RwhQualityGuide />}
          {activeTab === "brand" && <PlumbingBrandGuide />}
          {activeTab === "boq" && <PlumbingEstimator />}
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageWrap: {
    padding: "24px 28px",
    maxWidth: 1280,
    margin: "0 auto",
    boxSizing: "border-box",
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  topHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid #cbd5e1"
  },
  topBadge: {
    fontSize: 11,
    fontWeight: 900,
    color: "#0e7490",
    letterSpacing: "0.08em"
  },
  topTitle: {
    margin: "4px 0 0",
    fontSize: 26,
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1.25
  },
  topSub: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.5
  },
  tabBar: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 8,
    marginBottom: 24,
    touchAction: "pan-x",
    scrollbarWidth: "none"
  },
  tabItem: {
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
  },
  tabItemActive: {
    backgroundColor: "#0e7490",
    borderColor: "#0e7490",
    color: "#ffffff",
    boxShadow: "0 4px 16px rgba(14, 116, 144, 0.25)"
  },
  tabIcon: {
    fontSize: 22
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 800
  },
  tabDesc: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2
  },
  tabContentArea: {
    marginTop: 8
  }
};
