import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FeatureType, defaultUnlockAmount, featureLabel } from "../utils/accessControl";
import BuildMitraLogo from "./branding/BuildMitraLogo";

type Props = {
  open: boolean;
  featureType?: FeatureType;
  referenceCode?: string;
  loginRequired?: boolean;
  onCancel: () => void;
  onConfirmPaid: () => void;
};

type OptionType = "single" | "basic" | "professional" | "enterprise";

function getPaymentSettings() {
  if (typeof window === "undefined") return { upiId: "9731888377@ybl", payee: "Paint House / BuildMitra", customQr: "/qr-code.png" };
  try {
    const admin = JSON.parse(localStorage.getItem("buildmitraAdminSettings") || "{}");
    const customQr = localStorage.getItem("buildmitra_custom_qr_image") || admin.qrImageUrl || admin.customQrImage || "/qr-code.png";
    return {
      upiId: admin.upiId || admin.paymentUpiId || "9731888377@ybl",
      payee: admin.upiPayeeName || admin.businessName || "Paint House / BuildMitra",
      customQr
    };
  } catch {
    return { upiId: "9731888377@ybl", payee: "Paint House / BuildMitra", customQr: "/qr-code.png" };
  }
}

export default function PaymentBarrierModal({
  open,
  featureType = "calculator_export",
  referenceCode = "global",
  loginRequired = false,
  onCancel,
  onConfirmPaid
}: Props) {
  const router = useRouter();
  const [localQr, setLocalQr] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<OptionType>("professional");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.onload = () => setLocalQr("/qr-code.png");
      img.onerror = () => setLocalQr("");
      img.src = "/qr-code.png";
    }
  }, []);

  if (!open) return null;

  const safeFeatureType = typeof featureType === "string" && featureType ? featureType : "calculator_export";
  const defaultAmt = defaultUnlockAmount(safeFeatureType);

  let amount = 350;
  let planLabel = "Professional Subscription (₹350/mo)";
  if (selectedOption === "single") {
    amount = defaultAmt;
    planLabel = `Single ${featureLabel(safeFeatureType)} Unlock (₹${defaultAmt})`;
  } else if (selectedOption === "basic") {
    amount = 250;
    planLabel = "Basic Subscription (₹250/mo)";
  } else if (selectedOption === "professional") {
    amount = 350;
    planLabel = "Professional Subscription (₹350/mo)";
  } else if (selectedOption === "enterprise") {
    amount = 450;
    planLabel = "Enterprise Subscription (₹450/mo)";
  }

  const settings = getPaymentSettings();
  const upi = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.payee)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`BuildMitra ${planLabel} ${referenceCode}`)}`;
  
  // Use custom QR image if provided by user, otherwise fallback to local /qr-code.png or dynamic UPI QR server
  const qrUrl = settings.customQr || localQr || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upi)}`;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BuildMitraLogo width={42} height={42} />
            <div>
              <h2 style={styles.title}>{loginRequired ? "🔐 Login Required" : "💳 Unlock Feature or Subscribe"}</h2>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#0284c7" }}>BUILDMITRA INFRA & CONSTRUCTION</div>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: "transparent", border: 0, fontSize: "18px", cursor: "pointer", color: "#64748b" }}>✖</button>
        </div>

        {/* SLOGAN BANNER */}
        <div style={styles.sloganBar}>
          🔥 <b>Subscribe to BuildMitra & Save Lakhs</b> on Construction Materials, BOQ Costing & Real Estate Deals!
        </div>

        <p style={styles.message}>
          {loginRequired
            ? "Please login or register to export, share, or download PDFs & Excel reports."
            : "Preview and generation are free. Choose a subscription plan or single unlock to proceed."}
        </p>

        {!loginRequired && (
          <>
            {/* OPTION SELECTOR CARDS */}
            <div style={styles.optionsWrap}>
              <div
                onClick={() => setSelectedOption("basic")}
                style={{
                  ...styles.optCard,
                  ...(selectedOption === "basic" ? styles.optCardActive : {})
                }}
              >
                <div style={styles.optTitle}>Basic</div>
                <div style={styles.optPrice}>₹250/mo</div>
                <div style={styles.optDesc}>Calculators & Live Rates</div>
              </div>

              <div
                onClick={() => setSelectedOption("professional")}
                style={{
                  ...styles.optCard,
                  ...(selectedOption === "professional" ? styles.optCardActive : {}),
                  border: selectedOption === "professional" ? "2px solid #800020" : "1px solid #93c5fd"
                }}
              >
                <div style={{ ...styles.optTitle, color: "#1e40af" }}>Pro 🔥</div>
                <div style={styles.optPrice}>₹350/mo</div>
                <div style={styles.optDesc}>WhatsApp & CAD Studio</div>
              </div>

              <div
                onClick={() => setSelectedOption("enterprise")}
                style={{
                  ...styles.optCard,
                  ...(selectedOption === "enterprise" ? styles.optCardActive : {})
                }}
              >
                <div style={styles.optTitle}>Enterprise</div>
                <div style={styles.optPrice}>₹450/mo</div>
                <div style={styles.optDesc}>Full Suite & Team Access</div>
              </div>

              <div
                onClick={() => setSelectedOption("single")}
                style={{
                  ...styles.optCard,
                  ...(selectedOption === "single" ? styles.optCardActive : {})
                }}
              >
                <div style={styles.optTitle}>Single</div>
                <div style={styles.optPrice}>₹{defaultAmt}</div>
                <div style={styles.optDesc}>One-Time {featureLabel(featureType)}</div>
              </div>
            </div>

            <div style={styles.featureBox}>
              <div style={{ fontSize: "12px", color: "#475569" }}><b>Selected Option:</b> {planLabel}</div>
              <div style={{ fontSize: "12px", color: "#475569" }}><b>Target Action:</b> {featureLabel(featureType)} ({referenceCode || "global"})</div>
              <div style={{ fontSize: "15px", fontWeight: "900", color: "#166534", marginTop: "4px" }}>
                <b>Payable Amount:</b> ₹{amount}
              </div>
            </div>

            <div style={styles.qrWrap}>
              <img src={qrUrl} alt="Payment UPI QR Code" width={170} height={170} style={styles.qr} />
              <div style={styles.upiBox}>
                <b style={{ fontSize: "12px", color: "#0f172a" }}>UPI Payment ID</b>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#0284c7" }}>{settings.upiId}</span>
                <div style={{ margin: "6px 0", padding: "4px 8px", background: "#dcfce7", color: "#15803d", borderRadius: "6px", fontWeight: "800", fontSize: "11px" }}>
                  Scan & Pay ₹{amount}
                </div>
                <small style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>
                  Scan QR with GPay, PhonePe, or Paytm to pay <b>₹{amount}</b>, then click <b>"I Have Paid"</b> to notify admin.
                </small>
              </div>
            </div>
          </>
        )}

        <div style={styles.actions}>
          <button style={styles.secondary} onClick={onCancel}>Cancel</button>
          <button style={styles.secondary} onClick={() => router.push(loginRequired ? "/login" : `/subscription?plan=${selectedOption}`)}>
            {loginRequired ? "Go to Login" : "All Plans & Benefits →"}
          </button>
          {!loginRequired && (
            <button style={styles.primary} onClick={onConfirmPaid}>
              ✓ I Have Paid ₹{amount}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.65)",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backdropFilter: "blur(4px)"
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    background: "#ffffff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 24px 80px rgba(15,23,42,0.35)",
    border: "1px solid #cbd5e1",
    fontFamily: "Inter, sans-serif"
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "900",
    color: "#0f172a"
  },
  sloganBar: {
    background: "linear-gradient(135deg, #800020 0%, #4a0012 100%)",
    color: "#ffffff",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    lineHeight: "1.4",
    marginBottom: "10px",
    textAlign: "center"
  },
  message: {
    fontSize: "12px",
    color: "#475569",
    lineHeight: "1.4",
    margin: "4px 0 12px 0"
  },
  optionsWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginBottom: "14px"
  },
  optCard: {
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "8px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.15s ease"
  },
  optCardActive: {
    background: "#f0fdf4",
    border: "2px solid #16a34a",
    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.2)"
  },
  optTitle: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#0f172a"
  },
  optPrice: {
    fontSize: "13px",
    fontWeight: "900",
    color: "#16a34a",
    margin: "2px 0"
  },
  optDesc: {
    fontSize: "9px",
    color: "#64748b",
    lineHeight: "1.2"
  },
  featureBox: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: "10px",
    padding: "10px 12px",
    marginBottom: "14px"
  },
  qrWrap: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "16px"
  },
  qr: {
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    objectFit: "contain",
    background: "white"
  },
  upiBox: {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  actions: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
    flexWrap: "wrap"
  },
  secondary: {
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    padding: "9px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },
  primary: {
    background: "#16a34a",
    color: "#ffffff",
    border: 0,
    padding: "9px 16px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)"
  }
};
