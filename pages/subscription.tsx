import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

type Billing = "monthly" | "annual";
type PlanId = "basic" | "professional" | "enterprise";

interface PlanConfig {
  id: PlanId;
  name: string;
  badge?: string;
  monthly: number;
  annual: number;
  popular?: boolean;
  accessLevel: string;
  features: string[];
}

const PLANS: PlanConfig[] = [
  {
    id: "basic",
    name: "Basic Plan",
    monthly: 250,
    annual: 2500,
    accessLevel: "basic",
    features: [
      "⚡ Unlimited 19+ Engineering & Material Calculators",
      "📊 Standard BOQ & Cost Estimators (PDF Export)",
      "📐 2D Architectural Floor Plans Viewer",
      "📈 Live Mandi Wholesale Material Rates (5 Cities)",
      "📁 1 Active User Account & Direct Supplier Directory"
    ]
  },
  {
    id: "professional",
    name: "Professional Plan",
    badge: "🔥 MOST POPULAR",
    monthly: 350,
    annual: 3500,
    accessLevel: "professional",
    popular: true,
    features: [
      "⭐ All Basic Features Included",
      "💬 Direct WhatsApp Supplier, Contractor & Labour Contact Unlocks",
      "🏢 Layout & Plotted Land Development Studio (DXF/Excel Export)",
      "🚜 Machinery & Equipment Rental Benchmarks",
      "🔔 Live Wholesale Mandi Price Drop Alerts",
      "👥 5 Team Member Accounts + Priority Support"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    badge: "👑 FULL SUITE",
    monthly: 450,
    annual: 4500,
    accessLevel: "enterprise",
    features: [
      "👑 All Professional Features Included",
      "📜 Custom White-Label BOQ & Quotation Generator (Company Logo)",
      "🤝 Full Marketplace & Real Estate Direct Owner Access",
      "⚡ Unlimited Team User Accounts for your Firm",
      "📱 Dedicated Key Account Manager & 24/7 Priority Hotline"
    ]
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [planId, setPlanId] = useState<PlanId>("professional");
  const [billing, setBilling] = useState<Billing>("monthly");
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const queryPlan = String(router.query.plan || "").toLowerCase();
    const queryBilling = String(router.query.billing || "").toLowerCase();

    if (queryPlan === "basic" || queryPlan === "professional" || queryPlan === "enterprise" || queryPlan === "business") {
      setPlanId(queryPlan === "business" ? "enterprise" : (queryPlan as PlanId));
    }

    if (queryBilling === "annual" || queryBilling === "monthly") {
      setBilling(queryBilling as Billing);
    }
  }, [router.isReady, router.query.plan, router.query.billing]);

  const selected = useMemo(
    () => PLANS.find((plan) => plan.id === planId) || PLANS[1],
    [planId]
  );

  const amount = billing === "monthly" ? selected.monthly : selected.annual;

  const upiId =
    typeof window !== "undefined"
      ? (() => {
          try {
            const settings = JSON.parse(
              localStorage.getItem("buildmitraAdminSettings") || "{}"
            );
            return (
              settings.upiId ||
              settings.paymentUpiId ||
              process.env.NEXT_PUBLIC_PAYMENT_UPI_ID ||
              "buildmitra@upi"
            );
          } catch {
            return process.env.NEXT_PUBLIC_PAYMENT_UPI_ID || "buildmitra@upi";
          }
        })()
      : "buildmitra@upi";

  const phone = String(router.query.phone || "");
  const userCode = String(router.query.userCode || "");
  const registrationId = String(router.query.registrationId || "");
  const customerName = String(router.query.name || "");

  const paymentNote = `BuildMitra ${selected.name} ${billing.toUpperCase()}${
    userCode ? ` Code:${userCode}` : phone ? ` Mob:${phone}` : ""
  }`;

  const upi = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=BuildMitra&am=${amount}&cu=INR&tn=${encodeURIComponent(paymentNote)}`;

  const customQr = typeof window !== "undefined" ? (localStorage.getItem("buildmitra_custom_qr_image") || "") : "";
  const qr = customQr || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upi)}`;

  const handleCopyUpi = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const markPaymentSubmitted = () => {
    const reference =
      userCode ||
      registrationId ||
      `BM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const record = {
      active: false,
      planId: selected.id,
      plan: selected.name,
      accessLevel: selected.accessLevel,
      billing,
      amount,
      phone,
      customerName,
      userCode,
      registrationId,
      referenceCode: reference,
      status: "Payment verification pending",
      paymentMode: "UPI",
      submittedAt: new Date().toISOString()
    };

    localStorage.setItem("bm_pending_payment", JSON.stringify(record));

    const transactions = JSON.parse(
      localStorage.getItem("bm_payment_transactions") || "[]"
    );
    localStorage.setItem(
      "bm_payment_transactions",
      JSON.stringify([record, ...transactions])
    );

    setPaymentSubmitted(true);
  };

  if (paymentSubmitted) {
    const reference =
      userCode ||
      registrationId ||
      (() => {
        try {
          return JSON.parse(
            localStorage.getItem("bm_pending_payment") || "{}"
          ).referenceCode;
        } catch {
          return "";
        }
      })();

    return (
      <main style={styles.page}>
        <Head>
          <title>Payment Submitted | BuildMitra</title>
        </Head>
        <section style={styles.pendingCard}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={{ margin: "16px 0 8px 0", color: "#0f172a" }}>Payment Request Submitted!</h1>
          <p style={styles.pendingText}>
            Thank you for subscribing to <b>BuildMitra {selected.name}</b>. Your payment verification request has been logged.
          </p>

          <div style={styles.referenceBox}>
            <div><b>Selected Plan:</b> {selected.name}</div>
            <div><b>Billing Cycle:</b> {billing === "monthly" ? "Monthly (₹" + selected.monthly + "/mo)" : "Annual (₹" + selected.annual + "/yr)"}</div>
            <div><b>Payable Amount:</b> <span style={{ color: "#16a34a", fontWeight: "900" }}>₹{amount}</span></div>
            {customerName && <div><b>Subscriber Name:</b> {customerName}</div>}
            {phone && <div><b>Mobile Number:</b> {phone}</div>}
            {reference && <div><b>Reference Code:</b> {reference}</div>}
            <div><b>Status:</b> 🟡 Verification Pending Admin Approval</div>
          </div>

          <p style={styles.pendingText}>
            Our admin team will verify your transaction and instantly activate full platform capabilities.
          </p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
            <button style={styles.primary} onClick={() => router.push("/login")}>
              Go to Login Dashboard
            </button>
            <button style={styles.secondaryBtn} onClick={() => router.push("/live-rates")}>
              Explore Live Rates
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <Head>
        <title>Subscription Plans & Pricing | BuildMitra</title>
        <meta name="description" content="Subscribe to BuildMitra to save lakhs on construction materials, BOQ costing, live mandi rates & architectural CAD floor plans." />
      </Head>

      {/* TOP HIGH-IMPACT SLOGAN BANNER */}
      <section style={styles.sloganBanner}>
        <div style={styles.sloganBadge}>🔥 MAXIMIZE SAVINGS & UNLOCK FULL POWER</div>
        <h1 style={styles.sloganTitle}>
          Subscribe to BuildMitra & Save Lakhs on Construction Materials, BOQ & Real Estate Deals!
        </h1>
        <p style={styles.sloganSubtitle}>
          Get Unlimited PDF & Excel Exports, 5-Metro Live Wholesale Mandi Benchmark Rates, Direct WhatsApp Supplier Directory & 2D/3D Architectural CAD Floor Plans.
        </p>
      </section>

      {/* BILLING TOGGLE */}
      <div style={styles.toggleWrap}>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#475569" }}>Select Billing Period:</span>
        <div style={styles.billingToggle}>
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            style={billing === "monthly" ? styles.activeBilling : styles.billingButton}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            style={billing === "annual" ? styles.activeBilling : styles.billingButton}
          >
            Annual (Save 17% - 2 Months Free! 🎁)
          </button>
        </div>
      </div>

      {/* PLAN CARDS GRID */}
      <section style={styles.plansGrid}>
        {PLANS.map((plan) => {
          const isSelected = plan.id === planId;
          const planAmount = billing === "monthly" ? plan.monthly : plan.annual;

          return (
            <div
              key={plan.id}
              onClick={() => setPlanId(plan.id)}
              style={{
                ...styles.planCard,
                ...(isSelected ? styles.selectedPlanCard : {}),
                ...(plan.popular && !isSelected ? styles.popularPlanCard : {})
              }}
            >
              {plan.badge && (
                <div style={{
                  ...styles.planBadge,
                  backgroundColor: plan.popular ? "#2563eb" : "#800020"
                }}>
                  {plan.badge}
                </div>
              )}

              <h2 style={styles.planName}>{plan.name}</h2>
              <div style={styles.priceContainer}>
                <span style={styles.currency}>₹</span>
                <span style={styles.priceNumber}>{planAmount.toLocaleString()}</span>
                <span style={styles.pricePeriod}>/{billing === "monthly" ? "month" : "year"}</span>
              </div>

              {billing === "annual" && (
                <div style={styles.savingsTag}>
                  Equivalent to ₹{Math.round(plan.annual / 12)}/mo
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlanId(plan.id);
                }}
                style={{
                  ...styles.selectBtn,
                  ...(isSelected ? styles.selectedBtn : {})
                }}
              >
                {isSelected ? "✓ Selected Plan" : "Choose " + plan.name}
              </button>

              <div style={styles.featureDivider} />

              <ul style={styles.featureList}>
                {plan.features.map((feat, idx) => (
                  <li key={idx} style={styles.featureItem}>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* PAYMENT & QR SECTION */}
      <section style={styles.paymentSection}>
        <div style={styles.paymentHeader}>
          <h2>💳 Complete Payment via Scan & Pay (GPay / PhonePe / Paytm)</h2>
          <p>Scanning the QR code or clicking Open UPI pre-fills the exact payable amount of <b>₹{amount}</b>.</p>
        </div>

        <div style={styles.paymentGrid}>
          {/* QR DISPLAY BOX */}
          <div style={styles.qrCard}>
            <div style={styles.amountBadge}>
              Payable Amount: ₹{amount} ({billing === "monthly" ? "Monthly" : "Annual"})
            </div>
            
            <img
              src={qr}
              width={220}
              height={220}
              alt="BuildMitra Payment QR Code"
              style={styles.qrImage}
            />

            <div style={{ textAlign: "center", margin: "12px 0" }}>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Official BuildMitra UPI ID</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", fontFamily: "monospace" }}>
                  {upiId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  style={styles.copyBtn}
                >
                  {copiedUpi ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <a href={upi} style={styles.upiAppBtn}>
              📱 Open Installed UPI App (GPay / PhonePe / Paytm)
            </a>
          </div>

          {/* PAYMENT CONFIRMATION FORM */}
          <div style={styles.detailsCard}>
            <h3 style={{ margin: "0 0 14px 0", color: "#0f172a", fontSize: "18px" }}>Order Summary</h3>
            <div style={styles.summaryRow}>
              <span>Selected Plan:</span>
              <b>{selected.name}</b>
            </div>
            <div style={styles.summaryRow}>
              <span>Billing Cycle:</span>
              <b>{billing === "monthly" ? "Monthly" : "Annual"}</b>
            </div>
            <div style={styles.summaryRow}>
              <span>Total Payable Amount:</span>
              <b style={{ color: "#16a34a", fontSize: "18px" }}>₹{amount}</b>
            </div>
            {customerName && (
              <div style={styles.summaryRow}>
                <span>Subscriber Name:</span>
                <b>{customerName}</b>
              </div>
            )}
            {phone && (
              <div style={styles.summaryRow}>
                <span>Mobile Number:</span>
                <b>{phone}</b>
              </div>
            )}

            <div style={{ margin: "20px 0 16px 0", padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>
              <b>💡 Easy Activation Instructions:</b>
              <ol style={{ margin: "6px 0 0 0", paddingLeft: "18px" }}>
                <li>Scan the QR code above with GPay, PhonePe, BHIM or Paytm.</li>
                <li>Verify recipient name as <b>BuildMitra</b> and exact amount <b>₹{amount}</b>.</li>
                <li>Complete payment in your app and click <b>"I Have Paid"</b> below.</li>
              </ol>
            </div>

            <button type="button" onClick={markPaymentSubmitted} style={styles.submitBtn}>
              ✓ I Have Paid (Notify Admin for Activation)
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "24px 16px 60px 16px",
    fontFamily: "Inter, Roboto, sans-serif"
  },
  sloganBanner: {
    maxWidth: 1050,
    margin: "0 auto 28px",
    padding: "32px 28px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #800020 0%, #4a0012 100%)",
    color: "#ffffff",
    textAlign: "center",
    boxShadow: "0 14px 35px rgba(128, 0, 32, 0.25)"
  },
  sloganBadge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 16px",
    borderRadius: 999,
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.5px",
    marginBottom: "14px"
  },
  sloganTitle: {
    fontSize: "26px",
    fontWeight: "900",
    lineHeight: "1.3",
    margin: "0 0 10px 0"
  },
  sloganSubtitle: {
    fontSize: "14px",
    opacity: 0.9,
    maxWidth: 800,
    margin: "0 auto",
    lineHeight: "1.5"
  },
  toggleWrap: {
    maxWidth: 1050,
    margin: "0 auto 24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap"
  },
  billingToggle: {
    display: "inline-flex",
    gap: 6,
    padding: 6,
    borderRadius: 12,
    background: "#e2e8f0"
  },
  billingButton: {
    border: 0,
    background: "transparent",
    padding: "10px 20px",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: "700",
    color: "#475569",
    fontSize: "13px"
  },
  activeBilling: {
    border: 0,
    background: "#800020",
    color: "#ffffff",
    padding: "10px 20px",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "13px",
    boxShadow: "0 4px 12px rgba(128, 0, 32, 0.25)"
  },
  plansGrid: {
    maxWidth: 1050,
    margin: "0 auto 36px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px"
  },
  planCard: {
    background: "#ffffff",
    borderRadius: 20,
    padding: "28px 24px",
    border: "2px solid #e2e8f0",
    position: "relative",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
    display: "flex",
    flexDirection: "column"
  },
  popularPlanCard: {
    border: "2px solid #2563eb"
  },
  selectedPlanCard: {
    border: "3px solid #800020",
    boxShadow: "0 12px 36px rgba(128, 0, 32, 0.2)",
    transform: "translateY(-4px)"
  },
  planBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    color: "#ffffff",
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.5px"
  },
  planName: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#0f172a",
    margin: "0 0 12px 0"
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "2px",
    marginBottom: "4px"
  },
  currency: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#800020"
  },
  priceNumber: {
    fontSize: "36px",
    fontWeight: "900",
    color: "#0f172a"
  },
  pricePeriod: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "600"
  },
  savingsTag: {
    fontSize: "12px",
    color: "#16a34a",
    fontWeight: "700",
    marginBottom: "16px"
  },
  selectBtn: {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    background: "#f8fafc",
    color: "#334155",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "12px",
    marginBottom: "16px"
  },
  selectedBtn: {
    background: "#800020",
    color: "#ffffff",
    border: 0,
    boxShadow: "0 4px 12px rgba(128,0,32,0.3)"
  },
  featureDivider: {
    height: 1,
    background: "#e2e8f0",
    margin: "12px 0 16px 0"
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    fontSize: "13px",
    color: "#334155"
  },
  featureItem: {
    lineHeight: "1.4",
    fontWeight: 500
  },
  paymentSection: {
    maxWidth: 1050,
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: 20,
    padding: "32px 28px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)"
  },
  paymentHeader: {
    textAlign: "center",
    marginBottom: "28px"
  },
  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "28px",
    alignItems: "center"
  },
  qrCard: {
    background: "#f8fafc",
    border: "2px dashed #800020",
    borderRadius: 16,
    padding: 24,
    textAlign: "center"
  },
  amountBadge: {
    display: "inline-block",
    background: "#dcfce7",
    color: "#15803d",
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: "13px",
    fontWeight: "900",
    marginBottom: "16px"
  },
  qrImage: {
    display: "block",
    margin: "0 auto",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    padding: 8
  },
  copyBtn: {
    background: "#e2e8f0",
    border: 0,
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
    color: "#0f172a"
  },
  upiAppBtn: {
    display: "block",
    width: "100%",
    padding: "12px",
    background: "#1e293b",
    color: "#ffffff",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: "800",
    fontSize: "13px",
    marginTop: "12px",
    textAlign: "center"
  },
  detailsCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
    color: "#334155"
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    border: 0,
    borderRadius: 12,
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(22, 163, 74, 0.35)",
    marginTop: "12px"
  },
  pendingCard: {
    maxWidth: 620,
    margin: "40px auto",
    background: "#ffffff",
    padding: 32,
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(15,23,42,0.12)",
    textAlign: "center"
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
    display: "grid",
    placeItems: "center",
    margin: "0 auto"
  },
  pendingText: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: 1.6
  },
  referenceBox: {
    textAlign: "left",
    display: "grid",
    gap: 10,
    padding: 16,
    margin: "20px 0",
    borderRadius: 12,
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    fontSize: "13px"
  },
  secondaryBtn: {
    padding: "12px 20px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#f1f5f9",
    color: "#0f172a",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "13px"
  }
};