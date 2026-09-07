import React, { useEffect, useState } from "react";

import { getApiBase } from "../../utils/apiConfig";
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

const DEFAULT_TICKER_RATES: TickerRate[] = [
  { itemCode: "MAT-CEM-01", itemName: "UltraTech PPC Cement", category: "Cement", city: "Bengaluru", todayRate: 365, yesterdayRate: 370, comparisonDate: "Yesterday", unit: "Bag (50kg)", changeAmount: -5, percentageChange: -1.35, trend: "cheaper", sourceType: "Live", sourceLabel: "Verified Vendor Rate", updatedAt: new Date().toISOString() },
  { itemCode: "MAT-STL-01", itemName: "Tata Tiscon Fe550D TMT", category: "Steel", city: "Bengaluru", todayRate: 58.50, yesterdayRate: 57.00, comparisonDate: "Yesterday", unit: "Kg", changeAmount: 1.5, percentageChange: 2.63, trend: "costlier", sourceType: "Live", sourceLabel: "Quarry Direct Rate", updatedAt: new Date().toISOString() },
  { itemCode: "MAT-MSND-01", itemName: "Triple Washed M-Sand", category: "Sand", city: "Bengaluru", todayRate: 48, yesterdayRate: 48, comparisonDate: "Yesterday", unit: "CFT", changeAmount: 0, percentageChange: 0, trend: "unchanged", sourceType: "Live", sourceLabel: "Quarry Direct Rate", updatedAt: new Date().toISOString() },
  { itemCode: "MAT-BLK-01", itemName: "6-Inch Concrete Solid Blocks", category: "Blocks", city: "Bengaluru", todayRate: 42, yesterdayRate: 43, comparisonDate: "Yesterday", unit: "Block", changeAmount: -1, percentageChange: -2.32, trend: "cheaper", sourceType: "Live", sourceLabel: "Factory Gate", updatedAt: new Date().toISOString() },
  { itemCode: "MAT-AGG-20", itemName: "20mm Coarse Aggregate", category: "Aggregates", city: "Bengaluru", todayRate: 38, yesterdayRate: 37.5, comparisonDate: "Yesterday", unit: "CFT", changeAmount: 0.5, percentageChange: 1.33, trend: "costlier", sourceType: "Live", sourceLabel: "Quarry Rate", updatedAt: new Date().toISOString() },
  { itemCode: "MAT-BRK-01", itemName: "Red Wirecut Chamber Bricks", category: "Bricks", city: "Bengaluru", todayRate: 11, yesterdayRate: 11, comparisonDate: "Yesterday", unit: "Piece", changeAmount: 0, percentageChange: 0, trend: "unchanged", sourceType: "Live", sourceLabel: "Kiln Gate Rate", updatedAt: new Date().toISOString() },
  { itemCode: "MAT-RMC-25", itemName: "M25 Ready Mix Concrete (RMC)", category: "Concrete", city: "Bengaluru", todayRate: 4200, yesterdayRate: 4250, comparisonDate: "Yesterday", unit: "Cu.m", changeAmount: -50, percentageChange: -1.18, trend: "cheaper", sourceType: "Live", sourceLabel: "Plant Direct", updatedAt: new Date().toISOString() },
  { itemCode: "MAT-PNT-01", itemName: "Asian Paints Apex Emulsion", category: "Paints", city: "Bengaluru", todayRate: 320, yesterdayRate: 320, comparisonDate: "Yesterday", unit: "Litre", changeAmount: 0, percentageChange: 0, trend: "unchanged", sourceType: "Live", sourceLabel: "Dealer Price", updatedAt: new Date().toISOString() }
];

export default function MarketRateTrend() {
  const [rates, setRates] = useState<TickerRate[]>(DEFAULT_TICKER_RATES);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);

  const API_BASE = getApiBase();

  useEffect(() => {
    fetchTickerRates();
  }, []);

  const fetchTickerRates = async () => {
    try {
      const res = await fetch(API_BASE + "/api/rates/ticker?city=Bengaluru");
      const data = await res.json();
      if (data.success && Array.isArray(data.rates) && data.rates.length > 0) {
        setRates(data.rates);
      } else {
        setRates(DEFAULT_TICKER_RATES);
      }
    } catch (err) {
      console.log("Ticker rates load fallback activated:", err);
      setRates(DEFAULT_TICKER_RATES);
    }
  };

  const displayRates = rates.length > 0 ? rates : DEFAULT_TICKER_RATES;

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
          {[...displayRates, ...displayRates].map((item, idx) => {
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

