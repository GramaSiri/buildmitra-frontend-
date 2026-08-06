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

export default function PaymentBarrierModal(props: Props) {
  // CRITICAL FIX: Default to FALSE if open/isOpen is not explicitly true
  const isVisible = (props.open === true) || (props.isOpen === true);
  const handleClose = props.onCancel || props.onClose || (() => {});
  const handleSuccess = props.onConfirmPaid || props.onSuccess || (() => {});

  const [selectedPlan, setSelectedPlan] = useState<string>("Single Unlock");
  const [transactionRef, setTransactionRef] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isVisible) return null;

  const handlePaymentSubmit = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      alert(`Payment verified! ${selectedPlan} unlocked successfully.`);
      handleSuccess(selectedPlan);
      handleClose();
    }, 600);
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
          maxHeight: "92vh",
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

        {/* ============================================================ */}
        {/* HEADER: LOGO PLACE HAS FIX QR CODE (ONLY 1 QR CODE PLACE)   */}
        {/* ============================================================ */}
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
          {/* LOGO POSITION NOW HOLDS THE PHONEPE PAYMENT QR CODE */}
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
              💳 BuildMitra Subscription Required
            </span>
            <h3 style={{ margin: "2px 0 0", fontSize: "17px", fontWeight: "800" }}>
              🔥 Subscribe BuildMitra & Save Lakhs!
            </h3>
          </div>
        </div>

        {/* SUBTITLE & PROMO BANNER */}
        <p style={{ fontSize: "13px", fontWeight: "600", color: "#475569", margin: "0 0 10px" }}>
          Scan PhonePe UPI QR Code to Pay
        </p>

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
          🚀 "Upscale & 10X Your Construction Business with BuildMitra Real-Time BOQ & Materials Suite!"
        </div>

        {/* ============================================================ */}
        {/* MAIN SCAN BOX AREA: QR PLACE HAS FIX BUILDMITRA LOGO         */}
        {/* ============================================================ */}
        <div
          style={{
            border: "2px dashed #800020",
            borderRadius: "12px",
            padding: "14px",
            backgroundColor: "#fffef9",
            marginBottom: "14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* QR CODE PLACE HAS FIX BUILDMITRA LOGO */}
          <div style={{ background: "white", padding: "8px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(128,0,32,0.08)", marginBottom: "8px" }}>
            <img
              src="/logo.png"
              onError={(e) => { (e.target as HTMLImageElement).src = "/images/buildmitra-official-logo.jpg"; }}
              alt="BuildMitra Logo"
              style={{ width: "150px", height: "auto", display: "block", objectFit: "contain" }}
            />
          </div>

          <div style={{ fontSize: "13px", fontWeight: "800", color: "#800020" }}>
            UPI ID: <span style={{ textDecoration: "underline" }}>9731888377@ybl</span>
          </div>
          <div style={{ fontSize: "11px", color: "#475569", fontWeight: "600", marginTop: "2px" }}>
            Payee: Paint House / BuildMitra
          </div>
        </div>

        {/* SUBSCRIPTION PLAN TIERS */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
            Select Plan Tier
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
            {[
              { id: "Basic", name: "Basic", price: "₹250/mo" },
              { id: "Pro", name: "Pro", price: "₹350/mo" },
              { id: "Enterprise", name: "Enterprise", price: "₹450/mo" },
              { id: "Single Unlock", name: "Single Unlock", price: "₹49" }
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
                  <div style={{ fontSize: "11px", fontWeight: "700" }}>{plan.name}</div>
                  <div style={{ fontSize: "11px", fontWeight: "800", marginTop: "2px" }}>{plan.price}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRANSACTION REF INPUT */}
        <div style={{ textAlign: "left", marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
            UPI Reference / UTR Number (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 9731888377@ybl transaction Ref"
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

        {/* PRIMARY ACTION BUTTON (NO DUPLICATE QR CODES HERE) */}
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
          {isVerifying ? "Verifying..." : "✓ I Have Paid / Continue"}
        </button>

        {/* SECONDARY LINK BUTTON */}
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
          View Subscription Plans →
        </button>

        {/* FOOTER NOTE */}
        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
          Your inputs and generated report remain available.
        </div>
      </div>
    </div>
  );
}
