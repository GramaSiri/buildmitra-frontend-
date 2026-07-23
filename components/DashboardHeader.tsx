import React from "react";
import { useRouter } from "next/router";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  role?: string;
}

export default function DashboardHeader({
  title = "Vendor Dashboard",
  subtitle = "Manage ongoing construction projects, claims, and labour attendance",
  role = "Vendor / Contractor"
}: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <div style={{
      background: "#1e293b",
      color: "#ffffff",
      padding: "20px 24px",
      borderRadius: "12px",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <div>
        <div style={{ fontSize: "11px", textTransform: "uppercase", tracking: "1px", color: "#38bdf8", fontWeight: "800", marginBottom: "4px" }}>
          BuildMitra • {role}
        </div>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>{title}</h1>
        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>{subtitle}</p>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => router.push("/marketplace")}
          style={{
            background: "#2563eb",
            color: "#ffffff",
            border: 0,
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "800",
            cursor: "pointer"
          }}
        >
          🛒 Marketplace
        </button>
        <button
          onClick={() => router.push("/reports")}
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            border: "1px solid #334155",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "800",
            cursor: "pointer"
          }}
        >
          📑 Reports
        </button>
      </div>
    </div>
  );
}
