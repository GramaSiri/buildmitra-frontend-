import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

// Dynamic Recharts import for SSR compatibility
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface MaterialItem {
  id: string;
  name: string;
  category: "Cement" | "Steel" | "Aggregates & Sand" | "Blocks & Bricks" | "Electrical & Plumbing" | "Paints & Tiles";
  unit: string;
  currentRate: number;
  prevRate: number;
  unitCode: "Cum" | "Cft" | "Sft" | "Nos" | "Kg" | "Ton" | "Bags";
  vendors: {
    name: string;
    location: string;
    rate: number;
    phone: string;
    stock: "In Stock" | "Low Stock" | "Pre-Order";
    rating: number;
  }[];
  trendData: { date: string; rate: number; avgRate: number }[];
}

const BENGALURU_MATERIAL_DATABASE: MaterialItem[] = [
  {
    id: "MAT-CEM-01",
    name: "UltraTech OPC 53 Grade Cement",
    category: "Cement",
    unit: "50 kg Bag",
    currentRate: 385,
    prevRate: 378,
    unitCode: "Bags",
    vendors: [
      { name: "Sri Laxmi Building Supplies", location: "Peenya Industrial Area", rate: 380, phone: "919880012345", stock: "In Stock", rating: 4.8 },
      { name: "Karnataka Cement Depot", location: "Whitefield Road", rate: 388, phone: "919880023456", stock: "In Stock", rating: 4.6 },
      { name: "Bengaluru Traders & Co.", location: "Mysore Road", rate: 385, phone: "919880034567", stock: "In Stock", rating: 4.7 }
    ],
    trendData: [
      { date: "01 Jul", rate: 370, avgRate: 372 },
      { date: "05 Jul", rate: 372, avgRate: 373 },
      { date: "10 Jul", rate: 375, avgRate: 375 },
      { date: "15 Jul", rate: 378, avgRate: 377 },
      { date: "20 Jul", rate: 382, avgRate: 380 },
      { date: "23 Jul", rate: 385, avgRate: 382 }
    ]
  },
  {
    id: "MAT-STL-01",
    name: "Tata Tiscon TMT Rebar Fe500D (12mm)",
    category: "Steel",
    unit: "Ton",
    currentRate: 64500,
    prevRate: 65200,
    unitCode: "Ton",
    vendors: [
      { name: "Venkateshwara Steel Traders", location: "KRS Market / Chamarajpet", rate: 64000, phone: "919880045678", stock: "In Stock", rating: 4.9 },
      { name: "South India TMT Hub", location: "Electronic City Phase 1", rate: 64800, phone: "919880056789", stock: "In Stock", rating: 4.5 },
      { name: "Nandi Steel Suppliers", location: "Yelahanka New Town", rate: 64700, phone: "919880067890", stock: "Low Stock", rating: 4.7 }
    ],
    trendData: [
      { date: "01 Jul", rate: 66000, avgRate: 65800 },
      { date: "05 Jul", rate: 65800, avgRate: 65600 },
      { date: "10 Jul", rate: 65500, avgRate: 65400 },
      { date: "15 Jul", rate: 65200, avgRate: 65100 },
      { date: "20 Jul", rate: 64800, avgRate: 64900 },
      { date: "23 Jul", rate: 64500, avgRate: 64600 }
    ]
  },
  {
    id: "MAT-SND-01",
    name: "Manufactured Sand (M-Sand) Double Washed",
    category: "Aggregates & Sand",
    unit: "Cft",
    currentRate: 48,
    prevRate: 46,
    unitCode: "Cft",
    vendors: [
      { name: "BMR Quarry & Crusher Association", location: "Kanakapura Road", rate: 46, phone: "919880078901", stock: "In Stock", rating: 4.8 },
      { name: "Deccan Aggregates Ltd", location: "Bidadi / Kengeri", rate: 49, phone: "919880089012", stock: "In Stock", rating: 4.6 }
    ],
    trendData: [
      { date: "01 Jul", rate: 44, avgRate: 45 },
      { date: "05 Jul", rate: 45, avgRate: 45 },
      { date: "10 Jul", rate: 46, avgRate: 46 },
      { date: "15 Jul", rate: 46, avgRate: 46 },
      { date: "20 Jul", rate: 47, avgRate: 47 },
      { date: "23 Jul", rate: 48, avgRate: 47 }
    ]
  },
  {
    id: "MAT-SND-02",
    name: "Plastering Sand (P-Sand)",
    category: "Aggregates & Sand",
    unit: "Cft",
    currentRate: 58,
    prevRate: 56,
    unitCode: "Cft",
    vendors: [
      { name: "BMR Quarry & Crusher Association", location: "Kanakapura Road", rate: 56, phone: "919880078901", stock: "In Stock", rating: 4.8 },
      { name: "Deccan Aggregates Ltd", location: "Bidadi / Kengeri", rate: 60, phone: "919880089012", stock: "In Stock", rating: 4.6 }
    ],
    trendData: [
      { date: "01 Jul", rate: 54, avgRate: 55 },
      { date: "05 Jul", rate: 55, avgRate: 55 },
      { date: "10 Jul", rate: 56, avgRate: 56 },
      { date: "15 Jul", rate: 56, avgRate: 56 },
      { date: "20 Jul", rate: 57, avgRate: 57 },
      { date: "23 Jul", rate: 58, avgRate: 57 }
    ]
  },
  {
    id: "MAT-BLK-01",
    name: "AAC Blocks (600 x 200 x 150 mm)",
    category: "Blocks & Bricks",
    unit: "Nos",
    currentRate: 62,
    prevRate: 64,
    unitCode: "Nos",
    vendors: [
      { name: "EcoBlock Infra Solutions", location: "Hosur Road / Bommasandra", rate: 60, phone: "919880090123", stock: "In Stock", rating: 4.7 },
      { name: "GreenTech Masonry Blocks", location: "Nelamangala Highway", rate: 64, phone: "919880001234", stock: "In Stock", rating: 4.4 }
    ],
    trendData: [
      { date: "01 Jul", rate: 66, avgRate: 65 },
      { date: "05 Jul", rate: 65, avgRate: 65 },
      { date: "10 Jul", rate: 64, avgRate: 64 },
      { date: "15 Jul", rate: 64, avgRate: 63 },
      { date: "20 Jul", rate: 63, avgRate: 63 },
      { date: "23 Jul", rate: 62, avgRate: 62 }
    ]
  },
  {
    id: "MAT-RMC-01",
    name: "Ready Mix Concrete (RMC M25 Grade)",
    category: "Cement",
    unit: "Cum",
    currentRate: 4600,
    prevRate: 4550,
    unitCode: "Cum",
    vendors: [
      { name: "ACC Concrete Plant", location: "Bannerghatta Road", rate: 4550, phone: "919880112233", stock: "In Stock", rating: 4.9 },
      { name: "UltraTech Concrete Express", location: "Hebbal Outer Ring Road", rate: 4650, phone: "919880223344", stock: "In Stock", rating: 4.8 }
    ],
    trendData: [
      { date: "01 Jul", rate: 4500, avgRate: 4520 },
      { date: "05 Jul", rate: 4520, avgRate: 4530 },
      { date: "10 Jul", rate: 4550, avgRate: 4540 },
      { date: "15 Jul", rate: 4550, avgRate: 4550 },
      { date: "20 Jul", rate: 4580, avgRate: 4560 },
      { date: "23 Jul", rate: 4600, avgRate: 4580 }
    ]
  }
];

export default function LiveRatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("MAT-CEM-01");
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const categories = ["All", "Cement", "Steel", "Aggregates & Sand", "Blocks & Bricks", "Electrical & Plumbing", "Paints & Tiles"];

  const filteredMaterials = BENGALURU_MATERIAL_DATABASE.filter(mat => {
    const matchesCat = selectedCategory === "All" || mat.category === selectedCategory;
    const matchesSearch = mat.name.toLowerCase().includes(searchQuery.toLowerCase()) || mat.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeMaterial = BENGALURU_MATERIAL_DATABASE.find(m => m.id === selectedMaterialId) || BENGALURU_MATERIAL_DATABASE[0];

  const exportCSV = () => {
    let csv = "Material ID,Name,Category,Unit,Current Rate (INR),Previous Rate (INR),Change (%)\n";
    filteredMaterials.forEach(m => {
      const pct = (((m.currentRate - m.prevRate) / m.prevRate) * 100).toFixed(2);
      csv += `"${m.id}","${m.name}","${m.category}","${m.unit}",${m.currentRate},${m.prevRate},${pct}%\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BuildMitra_Bengaluru_Live_Rates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleWhatsAppQuote = (vendorName: string, phone: string, matName: string, rate: number, unit: string) => {
    const text = encodeURIComponent(
      `Hello ${vendorName},\nI am inquiring via BuildMitra Live Rates for:\n- Material: *${matName}*\n- Listed Rate: *₹${rate.toLocaleString()} / ${unit}*\nPlease share bulk quote and delivery timeline for Bengaluru.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <>
      <Head>
        <title>Bengaluru Live Building Material Rates | BuildMitra</title>
        <meta name="description" content="Real-time building material prices in Bengaluru market including Cement, TMT Steel, M-Sand, Aggregates, and RMC with historical trend charts." />
      </Head>

      <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "Inter, sans-serif" }}>
        
        {/* HEADER BAR */}
        <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "16px", padding: "28px 32px", color: "#ffffff", marginBottom: "28px", boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "700", color: "#fca5a5", marginBottom: "10px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }}></span>
                LIVE BENGALURU MANDI FEED
              </div>
              <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px" }}>
                📈 Real-Time Building Material Rates
              </h1>
              <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
                Verified wholesale and distributor market prices across Peenya, Whitefield, Mysore Road, and KR Market.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={exportCSV}
                style={{ background: "#2563eb", color: "#ffffff", border: 0, borderRadius: "10px", padding: "12px 20px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
              >
                📥 Export Rates CSV
              </button>
              <button
                onClick={() => router.push("/pricing")}
                style={{ background: "#0f172a", color: "#38bdf8", border: "1px solid #334155", borderRadius: "10px", padding: "12px 20px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
              >
                📊 View 1000 sqft Turnkey Rate Sheet →
              </button>
            </div>
          </div>

          {/* QUICK STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Market Index Status</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#34d399", marginTop: "4px" }}>+0.85% (Moderate Bullish)</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>UltraTech OPC 53</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>₹385 <span style={{ fontSize: "12px", color: "#ef4444" }}>+₹7</span></div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Tata Fe500D Steel</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>₹64,500/Ton <span style={{ fontSize: "12px", color: "#10b981" }}>-₹700</span></div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>M-Sand Average</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>₹48 / Cft</div>
            </div>
          </div>
        </div>

        {/* MAIN TWO-COLUMN DASHBOARD */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
          
          {/* LEFT: MATERIAL TICKER & VENDORS */}
          <div>
            {/* SEARCH AND CATEGORY FILTER */}
            <div style={{ background: "#ffffff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="🔍 Search material name, brand or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, minWidth: "240px", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: 0,
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      background: selectedCategory === cat ? "#0f172a" : "#f1f5f9",
                      color: selectedCategory === cat ? "#ffffff" : "#475569"
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* MATERIAL CARDS LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filteredMaterials.map((mat) => {
                const diff = mat.currentRate - mat.prevRate;
                const isSelected = mat.id === selectedMaterialId;

                return (
                  <div
                    key={mat.id}
                    onClick={() => setSelectedMaterialId(mat.id)}
                    style={{
                      background: "#ffffff",
                      borderRadius: "14px",
                      padding: "20px",
                      border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                      boxShadow: isSelected ? "0 4px 14px rgba(37, 99, 235, 0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "6px" }}>
                            {mat.category}
                          </span>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{mat.id}</span>
                          <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "10px", fontWeight: "900", padding: "2px 6px", borderRadius: "4px" }}>
                            {mat.unitCode}
                          </span>
                        </div>
                        <h3 style={{ margin: "8px 0 4px 0", fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                          {mat.name}
                        </h3>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          Benchmark Standard Unit: <strong>{mat.unit}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>
                          ₹{mat.currentRate.toLocaleString()}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: diff > 0 ? "#dc2626" : diff < 0 ? "#16a34a" : "#64748b" }}>
                          {diff > 0 ? `▲ +₹${diff}` : diff < 0 ? `▼ -₹${Math.abs(diff)}` : "▶ Unchanged"} vs prev week
                        </div>
                      </div>
                    </div>

                    {/* VENDOR QUICK COMPARISON */}
                    <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px dashed #e2e8f0" }}>
                      <div style={{ fontSize: "12px", fontWeight: "800", color: "#475569", marginBottom: "8px" }}>
                        Top Verified Bengaluru Suppliers ({mat.vendors.length}):
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {mat.vendors.map((v, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", fontSize: "13px" }}>
                            <div>
                              <strong style={{ color: "#1e293b" }}>{v.name}</strong>
                              <span style={{ color: "#64748b", fontSize: "11px", marginLeft: "8px" }}>📍 {v.location}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <span style={{ fontWeight: "900", color: "#0f172a" }}>₹{v.rate.toLocaleString()}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsAppQuote(v.name, v.phone, mat.name, v.rate, mat.unit);
                                }}
                                style={{ background: "#22c55e", color: "#ffffff", border: 0, padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}
                              >
                                💬 WhatsApp Quote
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: HISTORICAL TREND CHART & ANALYTICS */}
          <div>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", position: "sticky", top: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                    📊 30-Day Rate Trend
                  </h3>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    {activeMaterial.name}
                  </div>
                </div>
                <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "20px" }}>
                  Active Chart
                </span>
              </div>

              {/* RECHARTS LINE CHART */}
              {isClient && (
                <div style={{ width: "100%", height: "260px", marginTop: "10px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeMaterial.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip formatter={(val: any) => [`₹${val}`, "Price"]} contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: "8px", border: 0 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="rate" name="Wholesale Rate (₹)" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb" }} />
                      <Line type="monotone" dataKey="avgRate" name="Market Avg (₹)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* VENDOR SPREAD ANALYSIS */}
              <div style={{ marginTop: "20px", background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>
                  💡 Market Insights & Savings Tip
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>
                  Buying in bulk directly from <strong>{activeMaterial.vendors[0]?.name}</strong> in Peenya offers up to <strong>₹{(activeMaterial.vendors[activeMaterial.vendors.length-1]?.rate - activeMaterial.vendors[0]?.rate).toLocaleString()}</strong> lower cost per unit compared to retail depots.
                </p>
              </div>

              {/* ACTION LINKS */}
              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => router.push("/marketplace")}
                  style={{ width: "100%", background: "#0f172a", color: "#ffffff", border: 0, borderRadius: "10px", padding: "12px", fontWeight: "800", fontSize: "13px", cursor: "pointer", textAlign: "center" }}
                >
                  🛒 Order Bulk Materials in Marketplace →
                </button>
                <button
                  onClick={() => router.push("/boq-civil")}
                  style={{ width: "100%", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "10px", fontWeight: "700", fontSize: "12px", cursor: "pointer", textAlign: "center" }}
                >
                  📋 Sync with Civil BOQ Calculator
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
