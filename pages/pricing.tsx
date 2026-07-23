import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

interface BreakupItem {
  id: number;
  item: string;
  unit: "Cum" | "Cft" | "Sft" | "Nos" | "Points" | "Rft";
  qtyPer1000Sqft: number;
  materialRate: number;
  labourRate: number;
}

const DEFAULT_1000SQFT_ITEMS: BreakupItem[] = [
  { id: 1, item: "Earthwork Excavation in Foundation", unit: "Cft", qtyPer1000Sqft: 350, materialRate: 0, labourRate: 18 },
  { id: 2, item: "PCC 1:4:8 Bed under Footings & Plinth", unit: "Cft", qtyPer1000Sqft: 80, materialRate: 140, labourRate: 25 },
  { id: 3, item: "RCC M25 Grade Footing & Columns", unit: "Cft", qtyPer1000Sqft: 320, materialRate: 190, labourRate: 45 },
  { id: 4, item: "Plinth Beam & Anti-Termite Treatment", unit: "Cft", qtyPer1000Sqft: 180, materialRate: 210, labourRate: 50 },
  { id: 5, item: "Solid Concrete Block Masonry (6 inch)", unit: "Sft", qtyPer1000Sqft: 1200, materialRate: 65, labourRate: 28 },
  { id: 6, item: "RCC M25 Roof Slab & Beams", unit: "Cft", qtyPer1000Sqft: 450, materialRate: 220, labourRate: 55 },
  { id: 7, item: "Internal Plastering 1:6 (12mm thick)", unit: "Sft", qtyPer1000Sqft: 2800, materialRate: 18, labourRate: 16 },
  { id: 8, item: "External Plastering 1:4 (20mm waterproof)", unit: "Sft", qtyPer1000Sqft: 1400, materialRate: 24, labourRate: 20 },
  { id: 9, item: "Vitrified Flooring Tiles (2x2 ft)", unit: "Sft", qtyPer1000Sqft: 950, materialRate: 68, labourRate: 22 },
  { id: 10, item: "Electrical FRLS Wiring & Modular Switches", unit: "Points", qtyPer1000Sqft: 48, materialRate: 650, labourRate: 350 },
  { id: 11, item: "Plumbing CPVC Piping & Sanitaryware", unit: "Points", qtyPer1000Sqft: 18, materialRate: 2200, labourRate: 1100 },
  { id: 12, item: "Internal Primer + 2 Coats Premium Emulsion", unit: "Sft", qtyPer1000Sqft: 2800, materialRate: 16, labourRate: 12 },
  { id: 13, item: "Main Teakwood Door & UPVC Windows", unit: "Nos", qtyPer1000Sqft: 6, materialRate: 18500, labourRate: 2500 }
];

export default function PricingPage() {
  const router = useRouter();
  const [targetSqft, setTargetSqft] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState<"turnkey" | "rates" | "plans">("turnkey");

  const scaleFactor = Math.max(100, targetSqft) / 1000;

  const calculatedItems = DEFAULT_1000SQFT_ITEMS.map(item => {
    const qty = Math.round(item.qtyPer1000Sqft * scaleFactor);
    const matTotal = qty * item.materialRate;
    const labTotal = qty * item.labourRate;
    const totalCost = matTotal + labTotal;
    return { ...item, qty, matTotal, labTotal, totalCost };
  });

  const grandTotalCost = calculatedItems.reduce((sum, item) => sum + item.totalCost, 0);
  const ratePerSqft = Math.round(grandTotalCost / Math.max(1, targetSqft));

  const exportCSV = () => {
    let csv = `BuildMitra ${targetSqft} sqft Turnkey Breakup Sheet\n`;
    csv += `Item No,Description,Qty,Unit,Material Rate (INR),Labour Rate (INR),Material Total (INR),Labour Total (INR),Total Cost (INR)\n`;
    calculatedItems.forEach(i => {
      csv += `${i.id},"${i.item}",${i.qty},${i.unit},${i.materialRate},${i.labourRate},${i.matTotal},${i.labTotal},${i.totalCost}\n`;
    });
    csv += `,,,,,GRAND TOTAL,,₹${grandTotalCost.toLocaleString()}\n`;
    csv += `,,,,,COST PER SQFT,,₹${ratePerSqft}/sqft\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BuildMitra_${targetSqft}sqft_Turnkey_Rate_Sheet.csv`;
    a.click();
  };

  return (
    <>
      <Head>
        <title>Standardized Pricing & 1000 sqft Cost Breakup | BuildMitra</title>
        <meta name="description" content="Turnkey construction rate sheet for 1000 sqft built-up area in Bengaluru with quantity, material rate, labour rate, and total cost breakdown." />
      </Head>

      <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "Inter, sans-serif" }}>
        
        {/* HEADER BAR */}
        <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "16px", padding: "28px 32px", color: "#ffffff", marginBottom: "28px", boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38bdf8", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800" }}>
                BENGALURU TURNKEY STANDARD
              </span>
              <h1 style={{ margin: "10px 0 0 0", fontSize: "28px", fontWeight: "900" }}>
                💰 Standardized Pricing & Turnkey Rate Sheet
              </h1>
              <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
                Detailed itemized breakup of material rates, labour charges, and quantities for custom built-up areas.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={exportCSV}
                style={{ background: "#2563eb", color: "#ffffff", border: 0, borderRadius: "10px", padding: "12px 20px", fontWeight: "800", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                📥 Export Rate Sheet CSV
              </button>
              <button
                onClick={() => router.push("/live-rates")}
                style={{ background: "#0f172a", color: "#38bdf8", border: "1px solid #334155", borderRadius: "10px", padding: "12px 20px", fontWeight: "800", fontSize: "14px", cursor: "pointer" }}
              >
                📈 View Live Material Rates Feed →
              </button>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button
            onClick={() => setActiveTab("turnkey")}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: 0,
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              background: activeTab === "turnkey" ? "#0f172a" : "#ffffff",
              color: activeTab === "turnkey" ? "#ffffff" : "#475569",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            🏗️ 1000 sqft Turnkey Breakup Sheet
          </button>
          <button
            onClick={() => setActiveTab("rates")}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: 0,
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              background: activeTab === "rates" ? "#0f172a" : "#ffffff",
              color: activeTab === "rates" ? "#ffffff" : "#475569",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            📋 Master Unit Rate Cards
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: 0,
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              background: activeTab === "plans" ? "#0f172a" : "#ffffff",
              color: activeTab === "plans" ? "#ffffff" : "#475569",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            ⭐ Platform Subscription Plans
          </button>
        </div>

        {/* TAB 1: 1000 SQFT TURNKEY BREAKUP */}
        {activeTab === "turnkey" && (
          <div>
            {/* AREA CUSTOMIZER BAR */}
            <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", marginBottom: "24px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <label style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b" }}>
                  Adjust Built-up Area (Sq.ft):
                </label>
                <input
                  type="number"
                  value={targetSqft}
                  onChange={(e) => setTargetSqft(Number(e.target.value) || 1000)}
                  style={{ width: "120px", padding: "8px 12px", border: "2px solid #2563eb", borderRadius: "8px", fontSize: "16px", fontWeight: "900", color: "#0f172a" }}
                />
                <div style={{ display: "flex", gap: "6px" }}>
                  {[600, 1000, 1200, 1500, 2400].map(s => (
                    <button
                      key={s}
                      onClick={() => setTargetSqft(s)}
                      style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: targetSqft === s ? "#eff6ff" : "#ffffff", color: targetSqft === s ? "#1d4ed8" : "#475569", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                    >
                      {s} sqft
                    </button>
                  ))}
                </div>
              </div>

              {/* SUMMARY HIGHLIGHTS */}
              <div style={{ display: "flex", gap: "24px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Total Estimated Cost</div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>₹{grandTotalCost.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Turnkey Rate / Sq.ft</div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#16a34a" }}>₹{ratePerSqft} / sqft</div>
                </div>
              </div>
            </div>

            {/* BREAKUP TABLE */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#0f172a", color: "#ffffff" }}>
                    <th style={{ padding: "12px" }}>#</th>
                    <th style={{ padding: "12px" }}>Work Description</th>
                    <th style={{ padding: "12px" }}>Quantity</th>
                    <th style={{ padding: "12px" }}>Unit</th>
                    <th style={{ padding: "12px" }}>Material Rate (₹)</th>
                    <th style={{ padding: "12px" }}>Labour Rate (₹)</th>
                    <th style={{ padding: "12px" }}>Material Total (₹)</th>
                    <th style={{ padding: "12px" }}>Labour Total (₹)</th>
                    <th style={{ padding: "12px" }}>Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedItems.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <td style={{ padding: "12px", fontWeight: "700", color: "#64748b" }}>{item.id}</td>
                      <td style={{ padding: "12px", fontWeight: "800", color: "#0f172a" }}>{item.item}</td>
                      <td style={{ padding: "12px", fontWeight: "800", color: "#2563eb" }}>{item.qty.toLocaleString()}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "900",
                          background: item.unit === "Cum" ? "#dbeafe" : item.unit === "Cft" ? "#f3e8ff" : item.unit === "Sft" ? "#dcfce7" : "#fef3c7",
                          color: item.unit === "Cum" ? "#1d4ed8" : item.unit === "Cft" ? "#7e22ce" : item.unit === "Sft" ? "#15803d" : "#b45309"
                        }}>
                          {item.unit}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>₹{item.materialRate.toLocaleString()}</td>
                      <td style={{ padding: "12px" }}>₹{item.labourRate.toLocaleString()}</td>
                      <td style={{ padding: "12px", color: "#475569" }}>₹{item.matTotal.toLocaleString()}</td>
                      <td style={{ padding: "12px", color: "#475569" }}>₹{item.labTotal.toLocaleString()}</td>
                      <td style={{ padding: "12px", fontWeight: "900", color: "#0f172a" }}>₹{item.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f1f5f9", borderTop: "2px solid #cbd5e1" }}>
                    <td colSpan={8} style={{ padding: "16px 12px", textAlign: "right", fontWeight: "900", fontSize: "15px", color: "#0f172a" }}>
                      GRAND TOTAL ESTIMATED TURNKEY COST ({targetSqft} sqft):
                    </td>
                    <td style={{ padding: "16px 12px", fontWeight: "900", fontSize: "18px", color: "#2563eb" }}>
                      ₹{grandTotalCost.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MASTER UNIT RATES */}
        {activeTab === "rates" && (
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
              📋 Standardized Material & Labour Unit Rate Card
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div style={{ border: "1px solid #e2e8f0", padding: "16px", borderRadius: "10px" }}>
                <div style={{ color: "#2563eb", fontWeight: "800", fontSize: "14px" }}>Cement (OPC 53 Grade)</div>
                <div style={{ fontSize: "20px", fontWeight: "900", margin: "6px 0" }}>₹385 / 50kg Bag</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Unit Code: <strong>Bags</strong></div>
              </div>
              <div style={{ border: "1px solid #e2e8f0", padding: "16px", borderRadius: "10px" }}>
                <div style={{ color: "#2563eb", fontWeight: "800", fontSize: "14px" }}>TMT Rebar Steel (Fe500D)</div>
                <div style={{ fontSize: "20px", fontWeight: "900", margin: "6px 0" }}>₹64,500 / Ton</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Unit Code: <strong>Ton / Kg</strong></div>
              </div>
              <div style={{ border: "1px solid #e2e8f0", padding: "16px", borderRadius: "10px" }}>
                <div style={{ color: "#2563eb", fontWeight: "800", fontSize: "14px" }}>M-Sand Double Washed</div>
                <div style={{ fontSize: "20px", fontWeight: "900", margin: "6px 0" }}>₹48 / Cft</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Unit Code: <strong>Cft / Cum</strong></div>
              </div>
              <div style={{ border: "1px solid #e2e8f0", padding: "16px", borderRadius: "10px" }}>
                <div style={{ color: "#2563eb", fontWeight: "800", fontSize: "14px" }}>Solid Concrete Blocks (6")</div>
                <div style={{ fontSize: "20px", fontWeight: "900", margin: "6px 0" }}>₹42 / Piece</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Unit Code: <strong>Nos</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION PLANS */}
        {activeTab === "plans" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", textAlign: "center", border: "1px solid #e2e8f0" }}>
              <h3 style={{ color: "#0f172a", fontSize: "20px", fontWeight: "800" }}>Basic Contractor</h3>
              <p style={{ fontSize: "32px", fontWeight: "900", margin: "12px 0", color: "#2563eb" }}>₹250 <span style={{ fontSize: "14px", color: "#64748b" }}>/mo</span></p>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0", textAlign: "left", fontSize: "13px", color: "#475569", lineHeight: "2" }}>
                <li>✓ Access to 19 Construction Calculators</li>
                <li>✓ Civil & Interior BOQ Export</li>
                <li>✓ Standard 2D DRG Floor Plans</li>
              </ul>
              <button style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#f1f5f9", color: "#0f172a", border: 0, fontWeight: "800", cursor: "pointer" }}>
                Select Plan
              </button>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", textAlign: "center", border: "2px solid #2563eb", boxShadow: "0 8px 24px rgba(37, 99, 235, 0.15)" }}>
              <span style={{ background: "#2563eb", color: "#ffffff", padding: "4px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "900" }}>RECOMMENDED</span>
              <h3 style={{ color: "#0f172a", fontSize: "20px", fontWeight: "800", marginTop: "8px" }}>Professional Builder</h3>
              <p style={{ fontSize: "32px", fontWeight: "900", margin: "12px 0", color: "#2563eb" }}>₹350 <span style={{ fontSize: "14px", color: "#64748b" }}>/mo</span></p>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0", textAlign: "left", fontSize: "13px", color: "#475569", lineHeight: "2" }}>
                <li>✓ All 19 Calculators + 6 BOQ Modules</li>
                <li>✓ Live Bengaluru Market Rates API & Charts</li>
                <li>✓ FMB Polygon Plot Generator & DRG Export</li>
                <li>✓ Learn & Earn Quiz Certification</li>
              </ul>
              <button style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#2563eb", color: "#ffffff", border: 0, fontWeight: "800", cursor: "pointer" }}>
                Upgrade to Professional
              </button>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", textAlign: "center", border: "1px solid #e2e8f0" }}>
              <h3 style={{ color: "#0f172a", fontSize: "20px", fontWeight: "800" }}>Enterprise / Developer</h3>
              <p style={{ fontSize: "32px", fontWeight: "900", margin: "12px 0", color: "#2563eb" }}>₹450 <span style={{ fontSize: "14px", color: "#64748b" }}>/mo</span></p>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0", textAlign: "left", fontSize: "13px", color: "#475569", lineHeight: "2" }}>
                <li>✓ Unlimited Multi-User Team Access</li>
                <li>✓ Dedicated Account Manager</li>
                <li>✓ Custom API Hooks & Report Branding</li>
              </ul>
              <button style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0f172a", color: "#ffffff", border: 0, fontWeight: "800", cursor: "pointer" }}>
                Contact Enterprise
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
