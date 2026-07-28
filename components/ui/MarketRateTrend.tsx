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
  displayColour?: string;
  sourceType: string;
  sourceLabel: string;
  updatedAt: string;
}

export default function MarketRateTrend() {
  const [rates, setRates] = useState<TickerRate[]>([]);
  const [loading, setLoading] = useState(true);
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
          height: "48px",
          background: "#ffffff",
          border: "1px solid #dbe3ea",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderRadius: "8px",
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
          gap: 16px;
          white-space: nowrap;
          width: max-content;
          animation: tickerScroll 85s linear infinite;
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
      `}</style>

      <div
        className="ticker-container"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        style={{
          height: "48px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          padding: "0 12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          color: "#1e293b"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#0f766e",
            padding: "5px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "800",
            color: "#ffffff",
            whiteSpace: "nowrap",
            marginRight: "14px",
            zIndex: 2,
            boxShadow: "4px 0 10px rgba(255,255,255,0.9)"
          }}
        >
          <span>🏗️</span>
          <span>BuildMitra Live Rates</span>
        </div>

        <div className={`ticker-track ${paused ? "ticker-track-paused" : ""}`}>
          {[...rates, ...rates].map((item, idx) => {
            const isCheaper = item.trend === "cheaper";
            const isCostlier = item.trend === "costlier";
            const isNew = item.trend === "new" || isNaN(item.percentageChange) || item.percentageChange === 0;

            const badgeBg = isCheaper ? "#dcfce7" : isCostlier ? "#fee2e2" : "#f1f5f9";
            const borderColor = isCheaper ? "#86efac" : isCostlier ? "#fca5a5" : "#cbd5e1";
            const textColor = isCheaper ? "#15803d" : isCostlier ? "#b91c1c" : "#475569";
            const arrow = isCheaper ? "↓" : isCostlier ? "↑" : "•";

            const rawPct = isNaN(item.percentageChange) ? 0 : Math.abs(item.percentageChange);
            const rawAmt = isNaN(item.changeAmount) ? 0 : Math.abs(item.changeAmount);

            return (
              <div
                key={`${item.itemCode}-${idx}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: badgeBg,
                  border: `1px solid ${borderColor}`,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600"
                }}
              >
                <span style={{ color: "#1e293b", fontWeight: "700" }}>{item.itemName}</span>
                <span style={{ color: "#0f172a", fontWeight: "800" }}>
                  ₹{Number(item.todayRate || 0).toLocaleString('en-IN')}/{item.unit}
                </span>

                <span style={{ color: textColor, fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <span>{arrow}</span>
                  {isNew || rawPct === 0 ? (
                    <span>New Rate</span>
                  ) : (
                    <span>₹{rawAmt} ({rawPct}%)</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
