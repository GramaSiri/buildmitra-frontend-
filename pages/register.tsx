import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import BuildMitraLogo from "../components/branding/BuildMitraLogo";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000";

type Billing = "monthly" | "annual";
type PlanId = "basic" | "professional" | "business";

type RegistrationSuccess = {
  name: string;
  phone: string;
  role: string;
  planId: PlanId;
  planName: string;
  billing: Billing;
  amount: number;
  userCode: string;
  registrationId: string;
};

type RegisterForm = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  password: string;
  businessRole: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subscriptionPlan: PlanId;
  billing: Billing;
};

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
    features: FEATURES.slice(0, 5)
  },
  {
    id: "professional" as PlanId,
    name: "Professional Plan",
    monthly: 350,
    annual: 3000,
    features: FEATURES.slice(0, 6)
  },
  {
    id: "business" as PlanId,
    name: "Business Module",
    monthly: 450,
    annual: 4000,
    features: FEATURES
  }
];

const initialForm: RegisterForm = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  password: "",
  businessRole: "buyer",
  address: "",
  city: "",
  state: "",
  pincode: "",
  subscriptionPlan: "basic",
  billing: "monthly"
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] =
    useState<RegistrationSuccess | null>(null);

  const selectedPlan = useMemo(
    () => PLANS.find((plan) => plan.id === form.subscriptionPlan) || PLANS[0],
    [form.subscriptionPlan]
  );

  const selectedAmount =
    form.billing === "monthly" ? selectedPlan.monthly : selectedPlan.annual;

  const updateField = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    const cleanName = form.name.trim();
    const cleanPhone = form.phone.replace(/\D/g, "").slice(-10);
    const cleanPincode = form.pincode.replace(/\D/g, "").slice(-6);

    if (!cleanName) {
      setIsError(true);
      setMessage("Please enter your name.");
      return;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      setIsError(true);
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(cleanPincode)) {
      setIsError(true);
      setMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (form.password.length < 6) {
      setIsError(true);
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          companyName: form.companyName.trim(),
          email: form.email.trim(),
          phone: cleanPhone,
          password: form.password,
          businessRole: String(form.businessRole || "buyer").trim().toLowerCase(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: cleanPincode,
          subscriptionPlan: form.subscriptionPlan,
          subscriptionBilling: form.billing,
          subscriptionAmount: selectedAmount,
          subscriptionStatus: "payment_pending"
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || "Registration failed.");
      }

      const user = data.user || {};
      const userCode = user.userCode || data.userCode || "";
      const registrationId = user._id || data.userId || "";

      localStorage.setItem(
        "bm_pending_registration",
        JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          role: form.businessRole,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          billing: form.billing,
          amount: selectedAmount,
          userCode,
          registrationId,
          createdAt: new Date().toISOString()
        })
      );

      setRegistrationSuccess({
        name: cleanName,
        phone: cleanPhone,
        role: form.businessRole,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        billing: form.billing,
        amount: selectedAmount,
        userCode,
        registrationId
      });
    } catch (error: any) {
  console.error("REGISTER ERROR:", error);

  setIsError(true);

  alert(
    "Registration Error\n\n" +
    (error?.message || "Unknown Error")
  );

  setMessage(error?.message || "Registration failed. Please try again.");
} finally {
  setLoading(false);
}
};

const proceedToPayment = () => {

if (!registrationSuccess) return;

    router.push({
      pathname: "/subscription",
      query: {
        source: "registration",
        plan: registrationSuccess.planId,
        billing: registrationSuccess.billing,
        phone: registrationSuccess.phone,
        name: registrationSuccess.name,
        role: registrationSuccess.role,
        userCode: registrationSuccess.userCode,
        registrationId: registrationSuccess.registrationId
      }
    });
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <BuildMitraLogo width={50} height={50} showText />
        </div>
        <h1 style={styles.title}>Create Your Account</h1>
        <p style={styles.subtitle}>
          One mobile number can be registered only once.
        </p>

        <form onSubmit={handleRegister} autoComplete="off">
          <div style={styles.twoColumn}>
            <Field label="Name *">
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Enter your name"
                style={styles.input}
              />
            </Field>

            <Field label="Company / Business Name">
              <input
                name="companyName"
                value={form.companyName}
                onChange={updateField}
                placeholder="Optional"
                style={styles.input}
              />
            </Field>

            <Field label="Email Address">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="Optional"
                style={styles.input}
              />
            </Field>

            <Field label="Mobile Number *">
              <input
                name="phone"
                inputMode="numeric"
                value={form.phone}
                onChange={updateField}
                placeholder="10-digit mobile number"
                style={styles.input}
                maxLength={10}
              />
            </Field>

            <Field label="PIN Code *">
              <input
                name="pincode"
                inputMode="numeric"
                value={form.pincode}
                onChange={updateField}
                placeholder="6-digit PIN code"
                style={styles.input}
                maxLength={6}
              />
            </Field>

            <Field label="User Role *">
              <select
                name="businessRole"
                value={form.businessRole}
                onChange={updateField}
                style={styles.input}
              >
                <option value="buyer">Buyer / Owner</option>
                <option value="contractor">Contractor</option>
                <option value="supplier">Supplier</option>
                <option value="vendor">Vendor / Service Provider</option>
                <option value="laboursupply">Labour Supplier</option>
                <option value="machinehire">Machine Hire</option>
                <option value="realestate">Real Estate</option>
              </select>
            </Field>
          </div>

          <Field label="Address">
            <input
              name="address"
              value={form.address}
              onChange={updateField}
              placeholder="House / Street / Area"
              style={styles.input}
            />
          </Field>

          <div style={styles.twoColumn}>
            <Field label="City">
              <input
                name="city"
                value={form.city}
                onChange={updateField}
                placeholder="City"
                style={styles.input}
              />
            </Field>

            <Field label="State">
              <input
                name="state"
                value={form.state}
                onChange={updateField}
                placeholder="State"
                style={styles.input}
              />
            </Field>
          </div>

          <Field label="Password *">
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Minimum 6 characters"
              style={styles.input}
            />
          </Field>

          <h2 style={styles.sectionTitle}>Subscription Plan</h2>

          <div style={styles.billingToggle}>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, billing: "monthly" }))}
              style={
                form.billing === "monthly"
                  ? styles.activeBilling
                  : styles.billingButton
              }
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, billing: "annual" }))}
              style={
                form.billing === "annual"
                  ? styles.activeBilling
                  : styles.billingButton
              }
            >
              Annual
            </button>
          </div>

          <div style={styles.planGrid}>
            {PLANS.map((plan) => {
              const selected = form.subscriptionPlan === plan.id;
              const amount =
                form.billing === "monthly" ? plan.monthly : plan.annual;

              return (
                <button
                  type="button"
                  key={plan.id}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      subscriptionPlan: plan.id
                    }))
                  }
                  style={{
                    ...styles.planCard,
                    ...(selected ? styles.selectedPlan : {})
                  }}
                >
                  {selected && <span style={styles.selectedBadge}>Selected</span>}
                  <h3 style={styles.planName}>{plan.name}</h3>
                  <div style={styles.planPrice}>₹{amount}</div>
                  <div style={styles.planPeriod}>
                    {form.billing === "monthly" ? "per month" : "per year"}
                  </div>

                  <div style={styles.featureList}>
                    {FEATURES.map((feature) => {
                      const available = plan.features.includes(feature);
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
                              color: available ? "#166534" : "#94a3b8"
                            }}
                          >
                            {feature}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={styles.summary}>
            <strong>
              Selected: {selectedPlan.name} — ₹{selectedAmount}/
              {form.billing === "monthly" ? "month" : "year"}
            </strong>
          </div>

          <div style={styles.notice}>
            During beta testing, Admin can activate free access or extend the
            subscription period.
          </div>

          {message && (
            <div
              style={{
                ...styles.message,
                background: isError ? "#fee2e2" : "#dcfce7",
                color: isError ? "#991b1b" : "#166534"
              }}
            >
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.submit}>
            {loading ? "Creating Account..." : "Continue Registration"}
          </button>
        </form>

        <button
          type="button"
          style={styles.login}
          onClick={() => router.push("/login")}
        >
          Already registered? Login
        </button>
      </section>

      {registrationSuccess && (
  <div style={styles.modalOverlay}>
    <div style={styles.successModal}>

      <div style={{
        fontSize: 70,
        color: "#16a34a",
        marginBottom: 15
      }}>
        ✅
      </div>

      <h1 style={{
        color:"#166534",
        marginBottom:5
      }}>
        Welcome to BuildMitra
      </h1>

      <h2>
        Congratulations,
      </h2>

      <h2 style={{
        color:"#7f1d1d"
      }}>
        {registrationSuccess.name}
      </h2>

      <p style={{
        fontSize:18,
        marginTop:10
      }}>
        Your account has been successfully registered.
      </p>

      <hr />

      <table style={{
        width:"100%",
        marginTop:20,
        marginBottom:20
      }}>

        <tbody>

          <tr>
            <td><b>User Code</b></td>
            <td>{registrationSuccess.userCode}</td>
          </tr>

          <tr>
            <td><b>Mobile</b></td>
            <td>{registrationSuccess.phone}</td>
          </tr>

          <tr>
            <td><b>Plan</b></td>
            <td>{registrationSuccess.planName}</td>
          </tr>

          <tr>
            <td><b>Billing</b></td>
            <td>{registrationSuccess.billing}</td>
          </tr>

          <tr>
            <td><b>Amount</b></td>
            <td>
              ₹{registrationSuccess.amount}
            </td>
          </tr>

        </tbody>

      </table>

      <div style={{
        background:"#fff7ed",
        padding:15,
        borderRadius:10,
        color:"#92400e",
        fontWeight:"bold",
        marginBottom:20
      }}>
        Please complete your subscription payment to activate your BuildMitra account.
      </div>

      <button
        onClick={proceedToPayment}
        style={{
          width:"100%",
          padding:15,
          fontSize:18,
          fontWeight:"bold",
          background:"#16a34a",
          color:"#fff",
          border:0,
          borderRadius:10,
          cursor:"pointer"
        }}
      >
        Proceed to Payment →
      </button>

    </div>
  </div>
)}
              
    </main>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: "28px 14px",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    maxWidth: 1050,
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 10px 35px rgba(15,23,42,.10)"
  },
  logo: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: 900,
    color: "#7f1d1d"
  },
  title: { textAlign: "center", margin: "10px 0 4px" },
  subtitle: { textAlign: "center", color: "#64748b", marginBottom: 22 },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 14
  },
  field: { display: "block", marginBottom: 14 },
  label: { display: "block", fontWeight: 700, marginBottom: 6 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    fontSize: 15,
    background: "#fff"
  },
  sectionTitle: { margin: "16px 0 10px", color: "#0f172a" },
  billingToggle: {
    display: "inline-flex",
    gap: 8,
    padding: 5,
    borderRadius: 10,
    background: "#e2e8f0",
    marginBottom: 16
  },
  billingButton: {
    border: 0,
    background: "transparent",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800
  },
  activeBilling: {
    border: 0,
    background: "#166534",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 900
  },
  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: 14
  },
  planCard: {
    position: "relative",
    display: "block",
    width: "100%",
    textAlign: "left",
    border: "2px solid #cbd5e1",
    background: "#fff",
    borderRadius: 14,
    padding: 18,
    cursor: "pointer"
  },
  selectedPlan: {
    border: "3px solid #16a34a",
    background: "#f0fdf4",
    boxShadow: "0 5px 18px rgba(22,163,74,.18)"
  },
  selectedBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    background: "#16a34a",
    color: "#fff",
    padding: "4px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900
  },
  planName: { margin: "0 0 8px", color: "#7f1d1d" },
  planPrice: { fontSize: 28, fontWeight: 900, color: "#0f172a" },
  planPeriod: { color: "#64748b", fontSize: 13, marginBottom: 14 },
  featureList: { display: "grid", gap: 8 },
  featureRow: { display: "flex", gap: 9, alignItems: "center", fontSize: 14 },
  availableIcon: {
    display: "inline-grid",
    placeItems: "center",
    width: 21,
    height: 21,
    minWidth: 21,
    borderRadius: "50%",
    background: "#16a34a",
    color: "#fff",
    fontWeight: 900
  },
  unavailableIcon: {
    display: "inline-grid",
    placeItems: "center",
    width: 21,
    height: 21,
    minWidth: 21,
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#64748b",
    fontWeight: 900
  },
  summary: {
    marginTop: 16,
    padding: 13,
    borderRadius: 10,
    background: "#ecfdf5",
    color: "#166534"
  },
  notice: {
    marginTop: 12,
    padding: 12,
    borderRadius: 9,
    background: "#fff7ed",
    color: "#9a3412"
  },
  message: { marginTop: 12, padding: 12, borderRadius: 9, fontWeight: 700 },
  submit: {
    width: "100%",
    marginTop: 16,
    padding: 13,
    border: 0,
    borderRadius: 10,
    background: "#7f1d1d",
    color: "#fff",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "grid",
    placeItems: "center",
    padding: 16,
    background: "rgba(15,23,42,.72)",
    backdropFilter: "blur(4px)"
  },
  successModal: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "92vh",
    overflowY: "auto",
    boxSizing: "border-box",
    padding: "28px 24px",
    borderRadius: 20,
    background: "#ffffff",
    textAlign: "center",
    boxShadow: "0 24px 70px rgba(0,0,0,.28)",
    border: "1px solid #bbf7d0"
  },
  successCircle: {
    width: 72,
    height: 72,
    margin: "0 auto 14px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: 40,
    fontWeight: 900,
    boxShadow: "0 8px 22px rgba(22,163,74,.30)"
  },
  welcomeText: {
    color: "#7f1d1d",
    fontWeight: 900,
    fontSize: 18
  },
  successTitle: {
    margin: "8px 0",
    color: "#0f172a",
    fontSize: 25
  },
  successText: {
    margin: "0 0 18px",
    color: "#166534",
    fontWeight: 800
  },
  successDetails: {
    display: "grid",
    gap: 10,
    padding: 16,
    borderRadius: 13,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    textAlign: "left"
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    color: "#475569",
    fontSize: 14
  },
  activationText: {
    margin: "18px 0",
    padding: 12,
    borderRadius: 10,
    background: "#fff7ed",
    color: "#9a3412",
    lineHeight: 1.5,
    fontWeight: 700
  },
  proceedButton: {
    width: "100%",
    padding: 14,
    border: 0,
    borderRadius: 11,
    background: "#166534",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer"
  },
  login: {
    width: "100%",
    marginTop: 10,
    border: 0,
    background: "transparent",
    color: "#153b69",
    cursor: "pointer",
    fontWeight: 800
  }
};
