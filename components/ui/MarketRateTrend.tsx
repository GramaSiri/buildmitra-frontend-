import React, { useEffect, useState } from "react";

interface RateItem {
  itemCode: string;
  itemName: string;
  category: string;
  currentRate: number;
  previousRate: number;
  unit: string;
  city: string;
  change: number;
  percentageChange: number;
  sourceName?: string;
  updatedAt?: string;
}

export default function MarketRateTrend() {
  const [rates, setRates] = useState<RateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE + "/api/rates/approved");
      const data = await res.json();
      if (data.success && Array.isArray(data.rates)) {
        setRates(data.rates);
      }
    } catch (err) {
      console.log("Market rates loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Materials", "Labour", "Services"];
  const filteredRates = rates.filter(
    r => selectedCategory === "All" || r.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        padding: "16px 20px",
        marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: collapsed ? "0" : "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>📈</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1e293b" }}>
              BuildMitra Approved Market Rate Trends
            </h3>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Verified market rates & daily price movements
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!collapsed && (
            <div style={{ display: "flex", gap: "6px" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                    backgroundColor: selectedCategory === cat ? "#7f1d1d" : "#f1f5f9",
                    color: selectedCategory === cat ? "#ffffff" : "#475569"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              fontSize: "12px",
              cursor: "pointer",
              color: "#475569"
            }}
          >
            {collapsed ? "Expand ▼" : "Collapse ▲"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              Loading market rate trends...
            </div>
          ) : filteredRates.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
              Rate not available
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "12px",
                marginTop: "10px"
              }}
            >
              {filteredRates.map(item => {
                const isUp = item.change > 0;
                const isDown = item.change < 0;
                const color = isUp ? "#16a34a" : isDown ? "#dc2626" : "#64748b";
                const arrow = isUp ? "↑" : isDown ? "↓" : "→";

                return (
                  <div
                    key={item.itemCode}
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      border: "1px solid #f1f5f9"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "700", fontSize: "13px", color: "#334155" }}>
                        {item.itemName}
                      </span>
                      <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>
                        {item.category}
                      </span>
                    </div>

                    <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>
                      ₹{item.currentRate.toLocaleString()}{" "}
                      <span style={{ fontSize: "11px", fontWeight: "500", color: "#64748b" }}>
                        / {item.unit}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color,
                        marginTop: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <span>
                        {arrow} ₹{Math.abs(item.change)} · {Math.abs(item.percentageChange)}%
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "10px",
                        color: "#94a3b8",
                        marginTop: "6px",
                        display: "flex",
                        justifyContent: "space-between"
                      }}
                    >
                      <span>{item.sourceName || "BuildMitra Approved"}</span>
                      <span>{item.city}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
