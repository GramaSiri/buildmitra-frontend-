import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type Billing = "monthly" | "annual";
type PlanId = "basic" | "professional" | "business";

const FEATURES = [
  "Construction Calculators",
  "Real Estate Hub",
  "Marketplace",
  "Machine Rental",
  "Learn & Earn",
  "BOQ Modules",
  "Export / Download / Share",
  "DRG & Layout Tools"
];

const PLANS = [
  {
    id: "basic" as PlanId,
    name: "Basic Plan",
    monthly: 250,
    annual: 2500,
    accessLevel: "basic",
    features: FEATURES.slice(0, 5)
  },
  {
    id: "professional" as PlanId,
    name: "Professional Plan",
    monthly: 350,
    annual: 3000,
    accessLevel: "professional",
    features: FEATURES.slice(0, 6)
  },
  {
    id: "business" as PlanId,
    name: "Business Module",
    monthly: 450,
    annual: 4000,
    accessLevel: "business",
    features: FEATURES
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [planId, setPlanId] = useState<PlanId>("basic");
  const [billing, setBilling] = useState<Billing>("monthly");
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const queryPlan = String(router.query.plan || "").toLowerCase();
    const queryBilling = String(router.query.billing || "").toLowerCase();

    if (PLANS.some((plan) => plan.id === queryPlan)) {
      setPlanId(queryPlan as PlanId);
    }

    if (queryBilling === "annual" || queryBilling === "monthly") {
      setBilling(queryBilling as Billing);
    }
  }, [router.isReady, router.query.plan, router.query.billing]);

  const selected = useMemo(
    () => PLANS.find((plan) => plan.id === planId) || PLANS[0],
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

  const paymentNote = `${selected.name} ${billing}${
    userCode ? ` ${userCode}` : phone ? ` ${phone}` : ""
  }`;

  const upi = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=BuildMitra&am=${amount}&cu=INR&tn=${encodeURIComponent(paymentNote)}`;

  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upi
  )}`;

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
        <section style={styles.pendingCard}>
          <div style={styles.successIcon}>✓</div>
          <h1>Payment Submitted</h1>
          <p style={styles.pendingText}>
            Your payment details were recorded for verification.
          </p>

          <div style={styles.referenceBox}>
            <div><b>Plan:</b> {selected.name}</div>
            <div><b>Billing:</b> {billing === "monthly" ? "Monthly" : "Annual"}</div>
            <div><b>Amount:</b> ₹{amount}</div>
            {phone && <div><b>Mobile:</b> {phone}</div>}
            {reference && <div><b>Reference:</b> {reference}</div>}
            <div><b>Status:</b> Payment verification pending</div>
          </div>

          <p style={styles.pendingText}>
            Admin will verify the payment and activate the account. During beta,
            Admin may also provide free access or extend the subscription.
          </p>

          <button style={styles.primary} onClick={() => router.push("/login")}>
            Go to Login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <button onClick={() => router.back()} style={styles.back}>
          ←
        </button>
        <div>
          <h1 style={{ margin: 0 }}>BuildMitra Subscription Payment</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.9 }}>
            Confirm your selected plan and pay through UPI.
          </p>
        </div>
      </section>

      <section style={styles.selectedCard}>
        <div>
          <div style={styles.selectedLabel}>Selected Plan</div>
          <h2 style={{ margin: "5px 0" }}>{selected.name}</h2>
          <div style={styles.price}>
            ₹{amount}
            <span style={styles.period}>
              /{billing === "monthly" ? "month" : "year"}
            </span>
          </div>
        </div>

        <div style={styles.billingToggle}>
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            style={
              billing === "monthly"
                ? styles.activeBilling
                : styles.billingButton
            }
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            style={
              billing === "annual"
                ? styles.activeBilling
                : styles.billingButton
            }
          >
            Annual
          </button>
        </div>
      </section>

      <section style={styles.contentGrid}>
        <div style={styles.featuresCard}>
          <h2 style={{ marginTop: 0 }}>Included Features</h2>
          <div style={styles.featureList}>
            {FEATURES.map((feature) => {
              const available = selected.features.includes(feature);
              return (
                <div key={feature} style={styles.featureRow}>
                  <span
                    style={
                      available
                        ? styles.availableIcon
                        : styles.unavailableIcon
                    }
                  >
                    {available ? "✓" : "—"}
                  </span>
                  <span
                    style={{
                      color: available ? "#166534" : "#94a3b8",
                      fontWeight: available ? 700 : 500
                    }}
                  >
                    {feature}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.paymentCard}>
          <h2 style={{ marginTop: 0 }}>Pay by UPI</h2>
          {customerName && <p><b>Name:</b> {customerName}</p>}
          {phone && <p><b>Mobile:</b> {phone}</p>}
          {userCode && <p><b>User Code:</b> {userCode}</p>}
          <p><b>Plan:</b> {selected.name}</p>
          <p><b>Billing:</b> {billing === "monthly" ? "Monthly" : "Annual"}</p>
          <p><b>Amount:</b> ₹{amount}</p>
          <p><b>UPI ID:</b> {upiId}</p>

          <img
            src={qr}
            width={220}
            height={220}
            alt="BuildMitra UPI QR"
            style={styles.qr}
          />

          <a href={upi} style={styles.upiLink}>
            Open UPI App
          </a>

          <button onClick={markPaymentSubmitted} style={styles.primary}>
            I Have Paid
          </button>

          <small style={styles.helpText}>
            Click “I Have Paid” only after completing the UPI payment.
          </small>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: 20,
    fontFamily: "Arial, sans-serif"
  },
  hero: {
    maxWidth: 1050,
    margin: "0 auto 16px",
    padding: 20,
    borderRadius: 15,
    background: "#7f1d1d",
    color: "#fff",
    display: "flex",
    gap: 14,
    alignItems: "center"
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: 0,
    cursor: "pointer",
    fontSize: 22
  },
  selectedCard: {
    maxWidth: 1050,
    margin: "0 auto 16px",
    background: "#fff",
    border: "3px solid #16a34a",
    borderRadius: 15,
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "center",
    flexWrap: "wrap"
  },
  selectedLabel: {
    display: "inline-block",
    padding: "4px 9px",
    background: "#16a34a",
    color: "#fff",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12
  },
  price: { fontSize: 30, fontWeight: 900, color: "#0f172a" },
  period: { fontSize: 14, fontWeight: 600, color: "#64748b" },
  billingToggle: {
    display: "inline-flex",
    gap: 7,
    padding: 5,
    borderRadius: 10,
    background: "#e2e8f0"
  },
  billingButton: {
    border: 0,
    background: "transparent",
    padding: "10px 17px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800
  },
  activeBilling: {
    border: 0,
    background: "#166534",
    color: "#fff",
    padding: "10px 17px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 900
  },
  contentGrid: {
    maxWidth: 1050,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: 16
  },
  featuresCard: {
    background: "#fff",
    borderRadius: 15,
    padding: 20,
    boxShadow: "0 5px 18px rgba(15,23,42,.08)"
  },
  paymentCard: {
    background: "#fff",
    borderRadius: 15,
    padding: 20,
    boxShadow: "0 5px 18px rgba(15,23,42,.08)"
  },
  featureList: { display: "grid", gap: 11 },
  featureRow: { display: "flex", gap: 10, alignItems: "center" },
  availableIcon: {
    display: "inline-grid",
    placeItems: "center",
    width: 24,
    height: 24,
    minWidth: 24,
    borderRadius: "50%",
    background: "#16a34a",
    color: "#fff",
    fontWeight: 900
  },
  unavailableIcon: {
    display: "inline-grid",
    placeItems: "center",
    width: 24,
    height: 24,
    minWidth: 24,
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#64748b",
    fontWeight: 900
  },
  qr: {
    display: "block",
    margin: "14px auto",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    background: "#fff"
  },
  upiLink: {
    display: "block",
    textAlign: "center",
    marginBottom: 10,
    padding: 11,
    borderRadius: 9,
    background: "#153b69",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900
  },
  primary: {
    width: "100%",
    padding: 12,
    border: 0,
    borderRadius: 9,
    background: "#16a34a",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer"
  },
  helpText: {
    display: "block",
    textAlign: "center",
    color: "#64748b",
    marginTop: 9
  },
  pendingCard: {
    maxWidth: 620,
    margin: "55px auto",
    background: "#fff",
    padding: 28,
    borderRadius: 17,
    textAlign: "center",
    boxShadow: "0 10px 35px rgba(15,23,42,.12)"
  },
  successIcon: {
    margin: "0 auto",
    width: 62,
    height: 62,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#16a34a",
    color: "#fff",
    fontWeight: 900,
    fontSize: 34
  },
  pendingText: { color: "#475569", lineHeight: 1.6 },
  referenceBox: {
    textAlign: "left",
    display: "grid",
    gap: 9,
    padding: 16,
    margin: "18px 0",
    borderRadius: 11,
    background: "#f8fafc",
    border: "1px solid #cbd5e1"
  }
};