import { useState } from "react";
import Head from "next/head";

export default function RCCCalculator() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");

  const l = Number(length);
  const w = Number(width);
  const t = Number(thickness);

  const volume = l * w * (t / 12); // ft³ approx

  const cementBags = volume * 0.35;
  const steelKg = volume * 80;

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#f8fafc", padding: "20px 16px", boxSizing: "border-box" }}>
      <Head>
        <title>RCC Slab Calculator | BuildMitra</title>
      </Head>
      <div style={{ maxWidth: 500, margin: "0 auto", backgroundColor: "#ffffff", padding: "24px 20px", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", boxSizing: "border-box" }}>
        <h2 style={{ marginTop: 0, fontSize: 20, color: "#1e293b", marginBottom: 20 }}>RCC Slab Calculator</h2>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13, color: "#475569" }}>
            Length (ft)
          </label>
          <input
            type="number"
            placeholder="e.g. 20"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 16, boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13, color: "#475569" }}>
            Width (ft)
          </label>
          <input
            type="number"
            placeholder="e.g. 15"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 16, boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13, color: "#475569" }}>
            Thickness (inch)
          </label>
          <input
            type="number"
            placeholder="e.g. 5"
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 16, boxSizing: "border-box" }}
          />
        </div>

        <div style={{ backgroundColor: "#f1f5f9", padding: "16px", borderRadius: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
            Volume: <span style={{ color: "#2563eb" }}>{volume.toFixed(2)} ft³</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
            Cement Bags: <span style={{ color: "#16a34a" }}>{cementBags.toFixed(2)}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Steel: <span style={{ color: "#dc2626" }}>{steelKg.toFixed(2)} kg</span>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 600px) {
          input {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
