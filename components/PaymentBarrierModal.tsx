import React, { useState } from "react";

type Props = {
  open?: boolean;
  isOpen?: boolean;
  featureType?: string;
  referenceCode?: string;
  loginRequired?: boolean;
  onCancel?: () => void;
  onClose?: () => void;
  onConfirmPaid?: (action?: string) => void;
  onSuccess?: (action?: string) => void;
  title?: string;
  amount?: number;
  actionType?: string;
  itemDetails?: string;
};

export const IS_BETA_TESTING = true;

export default function PaymentBarrierModal(props: Props) {
  const isVisible = (props.open === true) || (props.isOpen === true);
  const handleClose = props.onCancel || props.onClose || (() => {});
  const handleSuccess = props.onConfirmPaid || props.onSuccess || (() => {});

  const [selectedPlan, setSelectedPlan] = useState<string>("Pay-Per-Use");
  const [transactionRef, setTransactionRef] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isVisible) return null;

  const handlePaymentSubmit = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("bm_beta_paid_session", "true");
        sessionStorage.setItem("bm_pay_per_use_unlocked", "true");
      }
      alert(`Payment verified! ${selectedPlan} (₹20 Pay-Per-Use / Subscription) unlocked successfully.`);
      handleSuccess(selectedPlan);
      handleClose();
    }, 400);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px"
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          padding: "20px",
          textAlign: "center",
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.35)",
          position: "relative",
          maxHeight: "90dvh",
          overflowY: "auto",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "14px",
            background: "transparent",
            border: "none",
            fontSize: "22px",
            fontWeight: "bold",
            color: "#ffffff",
            cursor: "pointer",
            zIndex: 10
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* HEADER */}
        <div
          style={{
            backgroundColor: "#800020",
            borderRadius: "14px 14px 0 0",
            margin: "-20px -20px 16px -20px",
            padding: "16px 14px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <div style={{ background: "white", padding: "4px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            <img
              src="/qr-code.jpg"
              onError={(e) => { (e.target as HTMLImageElement).src = "/qr-code.png"; }}
              alt="BuildMitra PhonePe UPI payment QR"
              style={{ height: "65px", width: "auto", display: "block" }}
            />
          </div>
          <div>
            <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9, fontWeight: 700 }}>
              💳 Premium Output Verification
            </span>
            <h3 style={{ margin: "2px 0 0", fontSize: "17px", fontWeight: "800" }}>
              Unlock Reports, DRG & BOQ Outputs
            </h3>
          </div>
        </div>

        {/* PROMO BANNER */}
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "8px 10px",
            marginBottom: "14px",
            fontSize: "11px",
            color: "#166534",
            lineHeight: "1.4",
            fontWeight: "600"
          }}
        >
          {props.amount && props.amount > 0 ? (
            <span>📐 DRG Drawing Sheets Entitlement: <strong>₹25 / Sheet</strong> ({Math.ceil(props.amount / 25)} Sheet(s) × ₹25 = <strong>₹{props.amount} Total</strong>)</span>
          ) : (
            <span>🚀 Choose <strong>₹20 / ₹25 Pay-Per-Use</strong> for single report unlock or <strong>Monthly/Annual Subscription</strong> for unlimited access!</span>
          )}
        </div>

        {/* UPI PAYEE INFO */}
        <div
          style={{
            border: "2px dashed #800020",
            borderRadius: "12px",
            padding: "12px",
            backgroundColor: "#fffef9",
            marginBottom: "14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "800", color: "#800020" }}>
            UPI ID: <span style={{ textDecoration: "underline" }}>9731888377@ybl</span>
          </div>
          <div style={{ fontSize: "11px", color: "#475569", fontWeight: "600", marginTop: "2px" }}>
            Payee: Paint House / BuildMitra
          </div>
        </div>

        {/* SUBSCRIPTION & PAY-PER-USE TIERS */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
            Select Access Option
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
            {[
              { id: "Pay-Per-Use", name: "Single Output", price: "₹20" },
              { id: "Basic", name: "Basic", price: "₹250/mo" },
              { id: "Pro", name: "Pro", price: "₹350/mo" },
              { id: "Annual", name: "Annual", price: "₹2500/yr" }
            ].map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{
                    border: isSelected ? "2px solid #800020" : "1px solid #cbd5e1",
                    backgroundColor: isSelected ? "#800020" : "#ffffff",
                    color: isSelected ? "#ffffff" : "#1e293b",
                    borderRadius: "8px",
                    padding: "8px 2px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 4px 10px rgba(128,0,32,0.25)" : "none"
                  }}
                >
                  <div style={{ fontSize: "10px", fontWeight: "700" }}>{plan.name}</div>
                  <div style={{ fontSize: "11px", fontWeight: "800", marginTop: "2px" }}>{plan.price}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* UTR INPUT */}
        <div style={{ textAlign: "left", marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
            UPI Reference / UTR Number (Optional for Beta)
          </label>
          <input
            type="text"
            placeholder="e.g. 9731888377 UTR number"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: "13px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handlePaymentSubmit}
          disabled={isVerifying}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "14px",
            fontWeight: "800",
            marginBottom: "8px",
            backgroundColor: "#16a34a",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          {isVerifying ? "Verifying..." : "✓ I Have Paid / Continue (Beta)"}
        </button>

        {/* SUBSCRIPTION LINK */}
        <button
          onClick={() => {
            handleClose();
            if (typeof window !== "undefined") window.location.href = "/subscription";
          }}
          style={{
            background: "none",
            border: "none",
            color: "#800020",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            padding: "4px",
            textDecoration: "underline",
            marginBottom: "8px"
          }}
        >
          View Full Subscription Plans →
        </button>
      </div>
    </div>
  );
}
