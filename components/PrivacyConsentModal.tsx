import React, { useState } from "react";

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyConsentModal({ isOpen, onClose }: PrivacyConsentModalProps) {
  const [agreed, setAgreed] = useState(true);

  if (!isOpen) return null;

  const handleExportMyData = () => {
    const data = {
      user: sessionStorage.getItem("userName") || "Guest User",
      role: sessionStorage.getItem("userRole") || "Contractor",
      uniqueCode: sessionStorage.getItem("uniqueCode") || "N/A",
      timestamp: new Date().toISOString(),
      gdprStatus: "Compliant & Consented",
      reraJurisdiction: "Karnataka RERA / BBMP"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BuildMitra_Privacy_Data_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(15, 23, 42, 0.75)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "28px",
        maxWidth: "500px",
        width: "100%",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <span style={{ fontSize: "24px" }}>🔒</span>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
            Data Privacy & RERA Compliance
          </h2>
        </div>

        <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", margin: "0 0 16px 0" }}>
          BuildMitra is committed to data protection in compliance with the Digital Personal Data Protection Act (DPDP), GDPR principles, and Karnataka RERA property privacy guidelines.
        </p>

        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#334155", marginBottom: "16px" }}>
          <div>✓ Encrypted session storage & audit log trails</div>
          <div>✓ No third-party data monetization</div>
          <div>✓ Full user right to data portability & erasure</div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", fontWeight: "700", color: "#1e293b", cursor: "pointer", marginBottom: "20px" }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          I consent to processing calculation & property data under BuildMitra Privacy Policy.
        </label>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <button
            onClick={handleExportMyData}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
          >
            📥 Export My Data JSON
          </button>

          <button
            onClick={onClose}
            disabled={!agreed}
            style={{ padding: "8px 20px", borderRadius: "8px", border: 0, background: agreed ? "#2563eb" : "#cbd5e1", color: "#ffffff", fontWeight: "800", fontSize: "13px", cursor: agreed ? "pointer" : "not-allowed" }}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
