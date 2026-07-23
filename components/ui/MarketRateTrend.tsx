import React, { useEffect, useState } from "react";

interface TickerRate {
  itemCode: string;
  itemName: string;
  category: string;
  subCategory?: string;
  specification?: string;
  brand?: string;
  rateScope?: string;
  city: string;
  todayRate: number;
  yesterdayRate: number | null;
  comparisonDate: string | null;
  unit: string;
  changeAmount: number;
  percentageChange: number;
  trend: "cheaper" | "costlier" | "unchanged" | "new";
  displayColour: "green" | "red" | "grey" | "neutral";
  sourceType: string;
  sourceLabel: string;
  providerCount: number;
  minimumRate: number;
  maximumRate: number;
  averageRate: number;
  updatedAt: string;
}

export default function MarketRateTrend() {
  const [rates, setRates] = useState<TickerRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRate, setHoveredRate] = useState<TickerRate | null>(null);
  const [paused, setPaused] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  useEffect(() => {
    fetchTickerRates();
  }, []);

  const fetchTickerRates = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE + "/api/rates/ticker?city=Bengaluru");
      const data = await res.json();
      if (data.success && Array.isArray(data.rates)) {
        setRates(data.rates);
      }
    } catch (err) {
      console.log("Ticker rates load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "50px",
          background: "#ffffff",
          border: "1px solid #dbe3ea",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderRadius: "10px",
          marginBottom: "16px",
          fontSize: "12px",
          fontWeight: "600"
        }}
      >
        <div style={{ backgroundColor: "#0f766e", color: "#ffffff", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", marginRight: "12px" }}>
          🏗️ BuildMitra Live Rates
        </div>
        <span>Loading latest market rates...</span>
      </div>
    );
  }

  if (rates.length === 0) return null;

  return (
    <div
      style={{
        position: "relative",
        marginBottom: "16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          align-items: center;
          gap: 18px;
          white-space: nowrap;
          width: max-content;
          animation: tickerScroll 95s linear infinite;
        }
        .ticker-container:hover .ticker-track,
        .ticker-track-paused {
          animation-play-state: paused !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none !important;
            overflow-x: auto;
          }
        }
        @media (max-width: 640px) {
          .ticker-container {
            height: 65px !important;
          }
        }
      `}</style>

      {/* LIGHT COMPACT RUNNING TICKER BAR (Max 55px desktop, 65px mobile) */}
      <div
        className="ticker-container"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          setHoveredRate(null);
        }}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        style={{
          height: "52px",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #dbe3ea",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          padding: "0 12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          color: "#1e293b"
        }}
      >
        {/* TARGET 1: EXACT HEADING BADGE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#0f766e", // Target 2: Teal background
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.4px",
            color: "#ffffff", // Target 2: White text
            whiteSpace: "nowrap",
            marginRight: "16px",
            zIndex: 2,
            boxShadow: "4px 0 10px rgba(255,255,255,0.9)"
          }}
        >
          <span>🏗️</span>
          <span>BuildMitra Live Rates</span>
        </div>

        {/* CONTINUOUS LOOP TICKER TRACK */}
        <div
          className={`ticker-track ${paused ? "ticker-track-paused" : ""}`}
          style={{ cursor: "pointer" }}
        >
          {/* Repeat list twice for smooth seamless loop */}
          {[...rates, ...rates].map((item, idx) => {
            const isCheaper = item.trend === "cheaper";
            const isCostlier = item.trend === "costlier";
            const isUnchanged = item.trend === "unchanged";
            const isNew = item.trend === "new";

            // Target 2: Clean Light Theme Badge & Text Colours
            const badgeBg = isCheaper
              ? "#dcfce7" // Light Green
              : isCostlier
              ? "#fee2e2" // Light Red
              : isUnchanged
              ? "#f1f5f9" // Light Grey
              : "#dbeafe"; // Target 2: Light Blue for NEW

            const borderColor = isCheaper
              ? "#86efac"
              : isCostlier
              ? "#fca5a5"
              : isUnchanged
              ? "#cbd5e1"
              : "#93c5fd";

            const textColor = isCheaper
              ? "#15803d" // Dark Green text ↓
              : isCostlier
              ? "#b91c1c" // Dark Red text ↑
              : isUnchanged
              ? "#64748b" // Grey text →
              : "#1d4ed8"; // Target 2: High contrast Blue text for NEW

            const arrow = isCheaper ? "↓" : isCostlier ? "↑" : isUnchanged ? "→" : "•";
            const labelSuffix = isCheaper ? "cheaper" : isCostlier ? "costlier" : "";

            return (
              <div
                key={`${item.itemCode}-${idx}`}
                onClick={() => setHoveredRate(item)}
                onMouseEnter={() => setHoveredRate(item)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: badgeBg,
                  border: `1px solid ${borderColor}`,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                <span style={{ color: "#1e293b", fontWeight: "700" }}>{item.itemName}</span>
                <span style={{ color: "#0f172a", fontWeight: "900" }}>
                  ₹{item.todayRate.toLocaleString()}/{item.unit}
                </span>

                <span style={{ color: textColor, fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <span>{arrow}</span>
                  {isNew ? (
                    <span>NEW</span>
                  ) : (
                    <span>
                      ₹{Math.abs(item.changeAmount)} {item.percentageChange}% {labelSuffix}
                    </span>
                  )}
                </span>

                <span style={{ color: "#94a3b8", fontSize: "10px", fontWeight: "400" }}>
                  · {item.sourceType === "marketplace" ? "Lowest Marketplace" : "Admin Approved"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIGHT POPOVER TOOLTIP ON HOVER / CLICK */}
      {hoveredRate && (
        <div
          style={{
            position: "absolute",
            top: "58px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#ffffff",
            color: "#1e293b",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            padding: "14px 18px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            zIndex: 100,
            width: "320px",
            fontSize: "12px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <strong style={{ fontSize: "14px", color: "#0f766e" }}>{hoveredRate.itemName}</strong>
            <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
              {hoveredRate.category}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px", backgroundColor: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <div>
              <span style={{ color: "#64748b", fontSize: "10px" }}>Today's Rate:</span>
              <div style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>
                ₹{hoveredRate.todayRate} / {hoveredRate.unit}
              </div>
            </div>
            <div>
              <span style={{ color: "#64748b", fontSize: "10px" }}>Yesterday's Rate:</span>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#334155" }}>
                {hoveredRate.yesterdayRate ? `₹${hoveredRate.yesterdayRate}` : "None"}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "8px", color: "#334155" }}>
            <strong>Trend: </strong>
            <span style={{ fontWeight: "700", color: hoveredRate.displayColour === "green" ? "#15803d" : hoveredRate.displayColour === "red" ? "#b91c1c" : "#64748b" }}>
              {hoveredRate.trend === "cheaper"
                ? `↓ ₹${Math.abs(hoveredRate.changeAmount)} (${hoveredRate.percentageChange}% cheaper)`
                : hoveredRate.trend === "costlier"
                ? `↑ ₹${Math.abs(hoveredRate.changeAmount)} (${hoveredRate.percentageChange}% costlier)`
                : hoveredRate.trend === "unchanged"
                ? `→ 0% change`
                : `NEW ITEM`}
            </span>
          </div>

          <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.5" }}>
            <div>📍 City: <strong>{hoveredRate.city}</strong></div>
            <div>🏷️ Source: <strong>{hoveredRate.sourceLabel}</strong></div>
            {hoveredRate.sourceType === "marketplace" && (
              <div>🏪 Providers: <strong>{hoveredRate.providerCount}</strong> (Min: ₹{hoveredRate.minimumRate} · Max: ₹{hoveredRate.maximumRate})</div>
            )}
            {hoveredRate.comparisonDate && <div>📅 Compared vs: {hoveredRate.comparisonDate}</div>}
          </div>

          <button
            onClick={() => setHoveredRate(null)}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "5px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
}
