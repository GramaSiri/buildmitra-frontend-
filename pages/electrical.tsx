import React, { useState } from "react";
import Head from "next/head";
import UtilityProcess from "../components/electrical/UtilityProcess";
import LoadCalculator from "../components/electrical/LoadCalculator";
import RenewableEstimator from "../components/electrical/RenewableEstimator";
import WiringBrandGuide from "../components/electrical/WiringBrandGuide";
import ElectricalEstimator from "../components/electrical/ElectricalEstimator";

export default function ElectricalPage() {
  const [activeTab, setActiveTab] = useState<
    "utility" | "load" | "renewable" | "wiring" | "boq"
  >("utility");

  const tabs = [
    {
      id: "utility" as const,
      label: "BESCOM Utility Approval",
      icon: "📜",
      desc: "LT-7(a) Temporary to LT-2(a) Domestic Roadmap",
    },
    {
      id: "load" as const,
      label: "Load & Power Saving",
      icon: "⚡",
      desc: "Connected Load, 3-Phase & BLDC Energy Savings",
    },
    {
      id: "renewable" as const,
      label: "Rooftop Solar & Wind",
      icon: "☀️",
      desc: "BESCOM Net Metering, Subsidy & VAWT Wind",
    },
    {
      id: "wiring" as const,
      label: "Wiring & Brand Directory",
      icon: "🔌",
      desc: "Conductor Sizing, Earthing & Brand Matrix",
    },
    {
      id: "boq" as const,
      label: "BOQ & Cost Estimator",
      icon: "💰",
      desc: "Itemized Turnkey Cost & PDF/CSV Exports",
    },
  ];

  return (
    <>
      <Head>
        <title>Electrical, BESCOM Utility & Renewable Energy Engine | BuildMitra</title>
        <meta
          name="description"
          content="End-to-end residential electrical, BESCOM utility sanctioning, connected load estimation, rooftop solar net metering, and BOQ cost calculator for Bengaluru."
        />
      </Head>

      <div style={styles.pageWrap}>
        {/* Main Module Top Header */}
        <div style={styles.topHeader}>
          <div>
            <span style={styles.topBadge}>BUILDMITRA TECHNICAL ENGINE</span>
            <h1 style={styles.topTitle}>Electrical, BESCOM Utility & Renewable Energy Module</h1>
            <p style={styles.topSub}>
              Complete residential electrical workflow for Bengaluru/Karnataka—spanning official BESCOM power sanctioning, load calculation, circuit protection rules, rooftop solar net metering, and turnkey BOQ estimates.
            </p>
          </div>
        </div>

        {/* Module Tab Navigation */}
        <div style={styles.tabBar}>
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                style={{
                  ...styles.tabItem,
                  ...(isActive ? styles.tabItemActive : {}),
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

        {/* Active Tab Component Render */}
        <div style={styles.tabContentArea}>
          {activeTab === "utility" && <UtilityProcess />}
          {activeTab === "load" && <LoadCalculator />}
          {activeTab === "renewable" && <RenewableEstimator />}
          {activeTab === "wiring" && <WiringBrandGuide />}
          {activeTab === "boq" && <ElectricalEstimator />}
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
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  topHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid #cbd5e1",
  },
  topBadge: {
    fontSize: 11,
    fontWeight: 900,
    color: "#2563eb",
    letterSpacing: "0.08em",
  },
  topTitle: {
    margin: "4px 0 0",
    fontSize: 26,
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1.25,
  },
  topSub: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.5,
  },
  tabBar: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 8,
    marginBottom: 24,
    touchAction: "pan-x",
    scrollbarWidth: "none",
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
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
  },
  tabItemActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
    color: "#ffffff",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.2)",
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 800,
  },
  tabDesc: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  tabContentArea: {
    marginTop: 8,
  },
};
