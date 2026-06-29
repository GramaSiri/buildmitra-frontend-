import React, { useState } from "react";
import { useRouter } from "next/router";

const plans = [
  { name: "BuildMitra Basic", price: 250, features: ["Calculator exports", "Basic BOQ exports", "Email support"] },
  { name: "BuildMitra Pro", price: 350, features: ["All exports", "WhatsApp share", "Drawing/BOQ packs", "Priority support"] },
  { name: "Export Pack", price: 99, features: ["One module export pack", "PDF/Excel/Image downloads"] },
  { name: "Drawing Export Pack", price: 199, features: ["Drawing PDF/Image/DXF", "WhatsApp drawing share"] },
  { name: "BOQ Export Pack", price: 149, features: ["BOQ PDF/Excel", "BOQ WhatsApp share"] }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(plans[1]);
  const upiId = typeof window !== "undefined" ? (() => {
    try {
      const settings = JSON.parse(localStorage.getItem("buildmitraAdminSettings") || "{}");
      return settings.upiId || settings.paymentUpiId || "buildmitra@upi";
    } catch {
      return "buildmitra@upi";
    }
  })() : "buildmitra@upi";
  const upi = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=BuildMitra&am=${selected.price}&cu=INR&tn=${encodeURIComponent(selected.name)}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(upi)}`;

  const markPaid = () => {
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const record = { active: true, plan: selected.name, amount: selected.price, validUntil, date: new Date().toISOString(), status: "Paid", paymentMode: "UPI" };
    localStorage.setItem("buildmitraSubscription", JSON.stringify(record));
    localStorage.setItem("bm_active_subscription", JSON.stringify(record));
    const transactions = JSON.parse(localStorage.getItem("bm_payment_transactions") || "[]");
    localStorage.setItem("bm_payment_transactions", JSON.stringify([{ ...record, featureType: "subscription", referenceCode: selected.name }, ...transactions]));
    alert("Subscription marked paid for local MVP testing. Export/share is now unlocked.");
    router.push("/drg");
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <button onClick={() => router.back()} style={styles.back}>←</button>
        <div>
          <h1 style={{ margin: 0 }}>BuildMitra Subscription</h1>
          <p style={{ margin: "6px 0 0", opacity: .9 }}>Preview is free. Export, download and share are unlocked by subscription or one-time packs.</p>
        </div>
      </section>

      <section style={styles.grid}>
        {plans.map((plan) => (
          <button key={plan.name} onClick={() => setSelected(plan)} style={{ ...styles.card, borderColor: selected.name === plan.name ? "#7f1d1d" : "#e2e8f0" }}>
            <h2 style={{ margin: "0 0 8px", color: "#7f1d1d" }}>{plan.name}</h2>
            <div style={styles.price}>₹{plan.price}</div>
            <ul style={{ margin: "10px 0 0", paddingLeft: 18, textAlign: "left" }}>
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </button>
        ))}
      </section>

      <section style={styles.payment}>
        <div>
          <h2 style={{ marginTop: 0 }}>Pay by UPI</h2>
          <p><b>Selected:</b> {selected.name}</p>
          <p><b>Amount:</b> ₹{selected.price}</p>
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 },
  card: { background: "#fff", border: "2px solid #e2e8f0", borderRadius: 14, padding: 16, textAlign: "left", cursor: "pointer", boxShadow: "0 3px 14px rgba(15,23,42,.08)" },
  price: { fontSize: 26, fontWeight: 900 },
  payment: { marginTop: 18, background: "#fff", borderRadius: 14, padding: 18, display: "flex", gap: 20, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", boxShadow: "0 3px 14px rgba(15,23,42,.08)" },
  primary: { padding: "11px 18px", border: 0, borderRadius: 8, background: "#7f1d1d", color: "white", fontWeight: 900, cursor: "pointer" },
  qr: { border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff" }
};

