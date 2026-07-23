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
          background: "#0f172a",
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "12px"
        }}
      >
        <span>🏗️ BuildMitra Current Rate Trend • Loading market rates...</span>
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
          gap: 20px;
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

      {/* COMPACT RUNNING TICKER BAR (Max 55px desktop, 65px mobile) */}
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
          backgroundColor: "#0f172a",
          borderRadius: "10px",
          border: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          padding: "0 12px",
          boxShadow: "0 4px 12px rgba(15,23,42,0.15)",
          color: "#ffffff"
        }}
      >
        {/* HEADER BADGE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#1e293b",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.5px",
            color: "#f59e0b",
            whiteSpace: "nowrap",
            marginRight: "16px",
            zIndex: 2,
            boxShadow: "4px 0 12px rgba(15,23,42,0.8)"
          }}
        >
          <span>🏗️</span>
          <span>BuildMitra Current Rate Trend</span>
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

            // Target 4: Construction colour logic
            const badgeBg = isCheaper
              ? "#14532d"
              : isCostlier
              ? "#7f1d1d"
              : isUnchanged
              ? "#334155"
              : "#1e3a8a";

            const textColor = isCheaper
              ? "#4ade80" // Green for cheaper ↓
              : isCostlier
              ? "#fca5a5" // Red for costlier ↑
              : isUnchanged
              ? "#cbd5e1" // Grey for unchanged →
              : "#93c5fd";

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
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  transition: "transform 0.15s ease"
                }}
              >
                <span style={{ color: "#ffffff", fontWeight: "700" }}>{item.itemName}</span>
                <span style={{ color: "#ffffff", fontWeight: "900" }}>
                  ₹{item.todayRate.toLocaleString()}/{item.unit}
                </span>

                <span style={{ color: textColor, fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                  <span>{arrow}</span>
                  {item.trend === "new" ? (
                    <span>NEW</span>
                  ) : (
                    <span>
                      ₹{Math.abs(item.changeAmount)} {item.percentageChange}% {labelSuffix}
                    </span>
                  )}
                </span>

                <span style={{ color: "#94a3b8", fontSize: "10px", fontWeight: "400" }}>
                  • {item.sourceType === "marketplace" ? "Lowest Marketplace" : "Admin Approved"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPOVER TOOLTIP ON HOVER / CLICK */}
      {hoveredRate && (
        <div
          style={{
            position: "absolute",
            top: "58px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1e293b",
            color: "#ffffff",
            border: "1px solid #334155",
            borderRadius: "10px",
            padding: "14px 18px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
            zIndex: 100,
            width: "320px",
            fontSize: "12px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <strong style={{ fontSize: "14px", color: "#fcd34d" }}>{hoveredRate.itemName}</strong>
            <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>
              {hoveredRate.category}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px", backgroundColor: "#0f172a", padding: "10px", borderRadius: "6px" }}>
            <div>
              <span style={{ color: "#94a3b8", fontSize: "10px" }}>Today's Rate:</span>
              <div style={{ fontSize: "15px", fontWeight: "900", color: "#ffffff" }}>
                ₹{hoveredRate.todayRate} / {hoveredRate.unit}
              </div>
            </div>
            <div>
              <span style={{ color: "#94a3b8", fontSize: "10px" }}>Yesterday's Rate:</span>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#cbd5e1" }}>
                {hoveredRate.yesterdayRate ? `₹${hoveredRate.yesterdayRate}` : "None"}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "8px", color: "#cbd5e1" }}>
            <strong>Trend: </strong>
            <span style={{ color: hoveredRate.displayColour === "green" ? "#4ade80" : hoveredRate.displayColour === "red" ? "#fca5a5" : "#cbd5e1" }}>
              {hoveredRate.trend === "cheaper"
                ? `↓ ₹${Math.abs(hoveredRate.changeAmount)} (${hoveredRate.percentageChange}% cheaper)`
                : hoveredRate.trend === "costlier"
                ? `↑ ₹${Math.abs(hoveredRate.changeAmount)} (${hoveredRate.percentageChange}% costlier)`
                : hoveredRate.trend === "unchanged"
                ? `→ 0% change`
                : `NEW ITEM`}
            </span>
          </div>

          <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.5" }}>
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
              padding: "4px",
              border: 0,
              borderRadius: "4px",
              backgroundColor: "#334155",
              color: "#ffffff",
              fontSize: "11px",
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
