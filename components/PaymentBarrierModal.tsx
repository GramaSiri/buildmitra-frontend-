import React from "react";
import { useRouter } from "next/router";
import { FeatureType, defaultUnlockAmount, featureLabel } from "../utils/accessControl";

type Props = {
  open: boolean;
  featureType?: FeatureType;
  referenceCode?: string;
  loginRequired?: boolean;
  onCancel: () => void;
  onConfirmPaid: () => void;
};

function getPaymentSettings() {
  if (typeof window === "undefined") return { upiId: "buildmitra@upi", payee: "BuildMitra" };
  try {
    const admin = JSON.parse(localStorage.getItem("buildmitraAdminSettings") || "{}");
    return {
      upiId: admin.upiId || admin.paymentUpiId || "buildmitra@upi",
      payee: admin.upiPayeeName || admin.businessName || "BuildMitra"
    };
  } catch {
    return { upiId: "buildmitra@upi", payee: "BuildMitra" };
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
  if (!open) return null;

  const amount = defaultUnlockAmount(featureType);
  const settings = getPaymentSettings();
  const upi = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.payee)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`BuildMitra ${featureLabel(featureType)} ${referenceCode}`)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upi)}`;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{loginRequired ? "Login Required" : "Subscribe / Pay to Unlock"}</h2>
        <p style={styles.message}>
          {loginRequired
            ? "Login required to export/share. Preview and generate remain free."
            : "Preview is free. Export/share/download requires subscription or one-time payment."}
        </p>

        {!loginRequired && (
          <>
            <div style={styles.featureBox}>
              <div><b>Feature:</b> {featureLabel(featureType)}</div>
              <div><b>Reference:</b> {referenceCode || "global"}</div>
              <div><b>Amount:</b> ₹{amount}</div>
            </div>
            <div style={styles.qrWrap}>
              <img src={qrUrl} alt="UPI QR Code" width={180} height={180} style={styles.qr} />
              <div style={styles.upiBox}>
                <b>UPI ID</b>
                <span>{settings.upiId}</span>
                <small>Scan QR or pay to this UPI ID, then click “I Have Paid”.</small>
              </div>
            </div>
          </>
        )}

        <div style={styles.actions}>
          <button style={styles.secondary} onClick={onCancel}>Cancel</button>
          <button style={styles.secondary} onClick={() => router.push(loginRequired ? "/login" : "/subscription")}>
            {loginRequired ? "Go to Login" : "Go to Subscription"}
          </button>
          {!loginRequired && <button style={styles.primary} onClick={onConfirmPaid}>I Have Paid</button>}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,.55)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  },
  modal: {
    width: "100%",
    maxWidth: 460,
    background: "#fff",
    borderRadius: 16,
    padding: 22,
    boxShadow: "0 24px 80px rgba(15,23,42,.3)",
    color: "#1f2937"
  },
  title: { margin: "0 0 8px", color: "#7f1d1d", fontSize: 22 },
  message: { margin: "0 0 14px", color: "#475569", fontSize: 14, lineHeight: 1.5 },
  featureBox: { background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 10, padding: 12, fontSize: 13, lineHeight: 1.7 },
  qrWrap: { display: "flex", gap: 16, alignItems: "center", marginTop: 16, flexWrap: "wrap" },
  qr: { border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff" },
  upiBox: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#334155", maxWidth: 210 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" },
  secondary: { padding: "10px 13px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 800 },
  primary: { padding: "10px 14px", borderRadius: 8, border: 0, background: "#7f1d1d", color: "#fff", cursor: "pointer", fontWeight: 900 }
};
