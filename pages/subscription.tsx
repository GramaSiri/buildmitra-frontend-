@'
import React, { useState } from "react";
import { useRouter } from "next/router";

const plans = [
  {
    name: "Basic Plan",
    price: 250,
    yearlyPrice: 2500,
    accessLevel: "basic",
    features: ["Calculators", "Real Estate", "Marketplace", "Machine Rental", "Learn & Earn"]
  },
  {
    name: "Professional Plan",
    price: 350,
    yearlyPrice: 3000,
    accessLevel: "professional",
    features: ["Calculators", "Real Estate", "Marketplace", "Machine Rental", "Learn & Earn", "BOQ"]
  },
  {
    name: "Business Module",
    price: 450,
    yearlyPrice: 4000,
    accessLevel: "business",
    features: ["Calculators", "Real Estate", "Marketplace", "Machine Rental", "Learn & Earn", "BOQ", "Share & Export", "DRG & Layout"]
  },
  {
    name: "DRG / Layout Per Copy",
    price: 50,
    yearlyPrice: 50,
    accessLevel: "drg_copy",
    features: ["One DRG/Layout copy", "PDF / Share / Download for one drawing"]
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [selected, setSelected] = useState(plans[0]);

  const amount = billing === "monthly" ? selected.price : selected.yearlyPrice;

  const upiId = typeof window !== "undefined" ? (() => {
    try {
      const settings = JSON.parse(localStorage.getItem("buildmitraAdminSettings") || "{}");
      return settings.upiId || settings.paymentUpiId || "buildmitra@upi";
    } catch {
      return "buildmitra@upi";
    }
  })() : "buildmitra@upi";

  const upi = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=BuildMitra&am=${amount}&cu=INR&tn=${encodeURIComponent(selected.name + " " + billing)}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(upi)}`;

  const markPaid = () => {
    const days = billing === "yearly" ? 365 : 30;
    const validUntil = selected.accessLevel === "drg_copy"
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const record = {
      active: true,
      plan: selected.name,
      accessLevel: selected.accessLevel,
      billing,
      amount,
      validUntil,
      date: new Date().toISOString(),
      status: "Paid",
      paymentMode: "UPI"
    };

    localStorage.setItem("buildmitraSubscription", JSON.stringify(record));
    localStorage.setItem("bm_active_subscription", JSON.stringify(record));

    const transactions = JSON.parse(localStorage.getItem("bm_payment_transactions") || "[]");
    localStorage.setItem("bm_payment_transactions", JSON.stringify([
      { ...record, featureType: "subscription", referenceCode: selected.name },
      ...transactions
    ]));

    alert("Payment marked paid for local MVP testing. Access unlocked.");
    router.push("/drg");
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <button onClick={() => router.back()} style={styles.back}>←</button>
        <div>
          <h1 style={{ margin: 0 }}>BuildMitra Subscription</h1>
          <p style={{ margin: "6px 0 0", opacity: .9 }}>
            Preview is free. Export, download, share, BOQ and DRG/Layout access depend on your plan.
          </p>
        </div>
      </section>

      <div style={styles.toggle}>
        <button onClick={() => setBilling("monthly")} style={billing === "monthly" ? styles.activeToggle : styles.toggleBtn}>Monthly</button>
        <button onClick={() => setBilling("yearly")} style={billing === "yearly" ? styles.activeToggle : styles.toggleBtn}>Yearly</button>
      </div>

      <section style={styles.grid}>
        {plans.map((plan) => {
          const planAmount = billing === "monthly" ? plan.price : plan.yearlyPrice;
          return (
            <button key={plan.name} onClick={() => setSelected(plan)} style={{ ...styles.card, borderColor: selected.name === plan.name ? "#7f1d1d" : "#e2e8f0" }}>
              <h2 style={{ margin: "0 0 8px", color: "#7f1d1d" }}>{plan.name}</h2>
              <div style={styles.price}>₹{planAmount}</div>
              <div style={styles.period}>{billing === "monthly" ? "per month" : "per annum"}</div>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, textAlign: "left" }}>
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </button>
          );
        })}
      </section>

      <section style={styles.payment}>
        <div>
          <h2 style={{ marginTop: 0 }}>Pay by UPI</h2>
          <p><b>Selected:</b> {selected.name}</p>
          <p><b>Billing:</b> {billing}</p>
          <p><b>Amount:</b> ₹{amount}</p>
          <p><b>UPI ID:</b> {upiId}</p>
          <button onClick={markPaid} style={styles.primary}>I Have Paid</button>
        </div>
        <img src={qr} width={190} height={190} alt="BuildMitra UPI QR" style={styles.qr} />
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#edf1f5", padding: 18, color: "#1f2937" },
  hero: { display: "flex", gap: 14, alignItems: "center", padding: 18, borderRadius: 14, background: "linear-gradient(135deg,#641229,#8b1d39)", color: "white", marginBottom: 18 },
  back: { width: 38, height: 38, borderRadius: 8, border: "1px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.12)", color: "white", fontSize: 20, cursor: "pointer" },
  toggle: { display: "flex", gap: 10, marginBottom: 16 },
  toggleBtn: { padding: "10px 18px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 800 },
  activeToggle: { padding: "10px 18px", borderRadius: 8, border: "1px solid #7f1d1d", background: "#7f1d1d", color: "#fff", cursor: "pointer", fontWeight: 900 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 },
  card: { background: "#fff", border: "2px solid #e2e8f0", borderRadius: 14, padding: 16, textAlign: "left", cursor: "pointer", boxShadow: "0 3px 14px rgba(15,23,42,.08)" },
  price: { fontSize: 26, fontWeight: 900 },
  period: { fontSize: 12, color: "#64748b", marginTop: 2 },
  payment: { marginTop: 18, background: "#fff", borderRadius: 14, padding: 18, display: "flex", gap: 20, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", boxShadow: "0 3px 14px rgba(15,23,42,.08)" },
  primary: { padding: "11px 18px", border: 0, borderRadius: 8, background: "#7f1d1d", color: "white", fontWeight: 900, cursor: "pointer" },
  qr: { border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff" }
};
'@ | Set-Content ".\pages\subscription.tsx" -Encoding UTF8