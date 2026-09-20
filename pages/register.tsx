import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getApiBase } from "../utils/apiConfig";

const API_BASE = getApiBase();

type Billing = "monthly" | "annual";
type PlanId = "basic" | "professional" | "enterprise";

type RegisterForm = {
  name: string;
  phone: string;
  password: string;
  address: string;
  pincode: string;
  businessRole: string;
  companyName: string;
  gstNumber: string;
  city: string;
  state: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
};

const initialForm: RegisterForm = {
  name: "",
  phone: "",
  password: "",
  address: "",
  pincode: "",
  businessRole: "buyer",
  companyName: "",
  gstNumber: "",
  city: "",
  state: "",
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  ifscCode: ""
};

const BUSINESS_ROLES = [
  "contractor",
  "supplier",
  "vendor",
  "laboursupply",
  "machinehire",
  "realestate"
];

const GST_ROLES = ["contractor", "supplier", "vendor", "realestate"];

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
    annual: 3500,
    features: FEATURES.slice(0, 6)
  },
  {
    id: "enterprise" as PlanId,
    name: "Enterprise Plan",
    monthly: 450,
    annual: 4500,
    features: FEATURES
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Subscription state (shown after registration)
  const [billing, setBilling] = useState<Billing>("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("basic");

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const showBusiness = BUSINESS_ROLES.includes(form.businessRole);
  const showGst = GST_ROLES.includes(form.businessRole);

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === selectedPlanId) || PLANS[0],
    [selectedPlanId]
  );

  const selectedAmount =
    billing === "monthly" ? selectedPlan.monthly : selectedPlan.annual;

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
            return (
              process.env.NEXT_PUBLIC_PAYMENT_UPI_ID || "buildmitra@upi"
            );
          }
        })()
      : "buildmitra@upi";

  const paymentNote = `BuildMitra ${selectedPlan.name} ${billing.toUpperCase()} ${form.phone}`;

  const upiLink =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=BuildMitra` +
    `&am=${selectedAmount}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(paymentNote)}`;

  const customQr =
    typeof window !== "undefined"
      ? localStorage.getItem("buildmitra_custom_qr_image") || ""
      : "";

  const qrImage =
    customQr ||
    `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
      upiLink
    )}`;

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (message) {
      setMessage("");
      setIsError(false);
    }
  };

  const handleRegister = async () => {
    setMessage("");
    setIsError(false);

    const cleanName = form.name.trim();
    const cleanPhone = form.phone.replace(/\D/g, "").slice(-10);
    const cleanPincode = form.pincode.replace(/\D/g, "").slice(-6);

    // Required fields (only the ones with *)
    if (!cleanName) { setIsError(true); setMessage("Please enter your name."); return; }
    if (!/^\d{10}$/.test(cleanPhone)) { setIsError(true); setMessage("Please enter a valid 10-digit mobile number."); return; }
    if (form.password.length < 6) { setIsError(true); setMessage("Password must contain at least 6 characters."); return; }
    if (!form.address.trim()) { setIsError(true); setMessage("Please enter your address."); return; }
    if (!/^\d{6}$/.test(cleanPincode)) { setIsError(true); setMessage("Please enter a valid 6-digit PIN code."); return; }

    // GST format check ONLY if user typed something
    if (showGst && form.gstNumber.trim()) {
      const gst = form.gstNumber.trim().toUpperCase();
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gst)) {
        setIsError(true);
        setMessage("GST number format looks invalid. Please check.");
        return;
      }
    }

    // IFSC format check ONLY if user typed something
    if (form.ifscCode.trim()) {
      const ifsc = form.ifscCode.trim().toUpperCase();
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifsc)) {
        setIsError(true);
        setMessage("IFSC code format looks invalid. Please check.");
        return;
      }
    }

    try {
      setLoading(true);

      const payload: any = {
        name: cleanName,
        phone: cleanPhone,
        password: form.password,
        address: form.address.trim(),
        pincode: cleanPincode,
        businessRole: String(form.businessRole || "buyer").trim().toLowerCase()
      };

      if (showBusiness) {
        // companyName/city/state are optional now
        if (form.companyName.trim()) payload.companyName = form.companyName.trim();
        if (form.city.trim()) payload.city = form.city.trim();
        if (form.state.trim()) payload.state = form.state.trim();
        if (showGst && form.gstNumber.trim()) {
          payload.gstNumber = form.gstNumber.trim().toUpperCase();
        }
        if (
          form.bankName.trim() ||
          form.accountHolder.trim() ||
          form.accountNumber.trim() ||
          form.ifscCode.trim()
        ) {
          payload.bankDetails = {
            bankName: form.bankName.trim(),
            accountHolder: form.accountHolder.trim(),
            accountNumber: form.accountNumber.trim(),
            ifscCode: form.ifscCode.trim().toUpperCase()
          };
        }
      }

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || "Registration failed.");
      }

      const user = data.user || {};
      const userCode = user.userCode || data.userCode || "";
      const registrationId = user._id || data.userId || "";

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "bm_pending_registration",
          JSON.stringify({
            name: cleanName,
            phone: cleanPhone,
            role: form.businessRole,
            userCode,
            registrationId,
            createdAt: new Date().toISOString()
          })
        );
      }

      setMessage("✅ Registration successful! Choose your plan below.");
      setIsError(false);
      setRegistered(true);

      // Smooth-scroll to the subscription section
      setTimeout(() => {
        const el = document.getElementById("bm-subscription-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    } catch (error: any) {
      console.error("REGISTER ERROR:", error);
      setIsError(true);
      setMessage(error?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.brand}>🏗️ BuildMitra</div>
        <h1 style={S.h1}>
          {registered ? "Complete Your Subscription" : "Create your account"}
        </h1>
        <p style={S.sub}>
          {registered
            ? "Choose a plan and scan the QR to activate your account."
            : "One mobile number can be registered only once."}
        </p>

        {/* ============================================================
            PHASE 1 — REGISTRATION FORM (hidden after success)
        ============================================================ */}
        {!registered && (
          <>
            <label style={S.lab}>Name *</label>
            <input
              style={S.inp}
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              placeholder="Enter your full name"
            />

            <label style={S.lab}>Mobile Number *</label>
            <input
              style={S.inp}
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={updateField}
              placeholder="10-digit mobile number"
            />

            <label style={S.lab}>Password *</label>
            <input
              style={S.inp}
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Minimum 6 characters"
            />

            <label style={S.lab}>Address *</label>
            <input
              style={S.inp}
              name="address"
              type="text"
              value={form.address}
              onChange={updateField}
              placeholder="House / Street / Area"
            />

            <label style={S.lab}>PIN Code *</label>
            <input
              style={S.inp}
              name="pincode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={form.pincode}
              onChange={updateField}
              placeholder="6-digit PIN code"
            />

            <label style={S.lab}>I am a *</label>
            <select
              style={S.inp}
              name="businessRole"
              value={form.businessRole}
              onChange={updateField}
            >
              <option value="buyer">Buyer / Owner</option>
              <option value="contractor">Contractor</option>
              <option value="supplier">Supplier</option>
              <option value="vendor">Vendor / Service Provider</option>
              <option value="laboursupply">Labour Supplier</option>
              <option value="machinehire">Machine Hire</option>
              <option value="realestate">Real Estate</option>
            </select>

            {/* BUSINESS DETAILS — all optional now (no *) */}
            {showBusiness && (
              <>
                <div style={S.sectionTitle}>Business Details (optional)</div>

                <label style={S.lab}>Company / Business Name</label>
                <input
                  style={S.inp}
                  name="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={updateField}
                  placeholder="Enter your business name"
                />

                {showGst && (
                  <>
                    <label style={S.lab}>GST Number</label>
                    <input
                      style={S.inp}
                      name="gstNumber"
                      type="text"
                      value={form.gstNumber}
                      onChange={updateField}
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                    />
                  </>
                )}

                <label style={S.lab}>City</label>
                <input
                  style={S.inp}
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={updateField}
                  placeholder="City"
                />

                <label style={S.lab}>State</label>
                <input
                  style={S.inp}
                  name="state"
                  type="text"
                  value={form.state}
                  onChange={updateField}
                  placeholder="State"
                />

                <div style={S.sectionTitle}>
                  Bank Account Details (optional)
                </div>

                <label style={S.lab}>Bank Name</label>
                <input
                  style={S.inp}
                  name="bankName"
                  type="text"
                  value={form.bankName}
                  onChange={updateField}
                  placeholder="e.g. State Bank of India"
                />

                <label style={S.lab}>Account Holder Name</label>
                <input
                  style={S.inp}
                  name="accountHolder"
                  type="text"
                  value={form.accountHolder}
                  onChange={updateField}
                  placeholder="As per bank records"
                />

                <label style={S.lab}>Account Number</label>
                <input
                  style={S.inp}
                  name="accountNumber"
                  type="text"
                  inputMode="numeric"
                  value={form.accountNumber}
                  onChange={updateField}
                  placeholder="Bank account number"
                />

                <label style={S.lab}>IFSC Code</label>
                <input
                  style={S.inp}
                  name="ifscCode"
                  type="text"
                  value={form.ifscCode}
                  onChange={updateField}
                  placeholder="SBIN0001234"
                  maxLength={11}
                />
              </>
            )}

            {message && (
              <div
                style={{
                  ...S.msg,
                  background: isError ? "#fee2e2" : "#dcfce7",
                  color: isError ? "#991b1b" : "#166534"
                }}
              >
                {message}
              </div>
            )}

            <button
              type="button"
              style={{
                ...S.btn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "wait" : "pointer"
              }}
              disabled={loading}
              onClick={handleRegister}
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>

            <button
              type="button"
              style={S.login}
              onClick={() => router.push("/login")}
            >
              Already have an account? Log in
            </button>
          </>
        )}

        {/* ============================================================
            PHASE 2 — SUBSCRIPTION + UPI QR (shown after success)
        ============================================================ */}
        {registered && (
          <div id="bm-subscription-section">
            {message && (
              <div
                style={{
                  ...S.msg,
                  background: "#dcfce7",
                  color: "#166534",
                  marginBottom: 16
                }}
              >
                {message}
              </div>
            )}

            {/* Billing toggle at TOP */}
            <div style={S.billingWrap}>
              <button
                type="button"
                style={
                  billing === "monthly" ? S.billActive : S.billInactive
                }
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                style={
                  billing === "annual" ? S.billActive : S.billInactive
                }
                onClick={() => setBilling("annual")}
              >
                Annual
              </button>
            </div>

            {/* Plans stacked vertically */}
            {PLANS.map((plan) => {
              const selected = selectedPlanId === plan.id;
              const amount =
                billing === "monthly" ? plan.monthly : plan.annual;

              return (
                <button
                  type="button"
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  style={{
                    ...S.planCard,
                    ...(selected ? S.planSelected : {})
                  }}
                >
                  {selected && (
                    <span style={S.planBadge}>Selected</span>
                  )}
                  <div style={S.planName}>{plan.name}</div>
                  <div style={S.planPrice}>₹{amount}</div>
                  <div style={S.planPeriod}>
                    {billing === "monthly" ? "per month" : "per year"}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    {FEATURES.map((feature) => {
                      const available = plan.features.includes(feature);
                      return (
                        <div key={feature} style={S.featureRow}>
                          <span
                            style={
                              available
                                ? S.featureYes
                                : S.featureNo
                            }
                          >
                            {available ? "✓" : "—"}
                          </span>
                          <span
                            style={{
                              color: available ? "#166534" : "#94a3b8",
                              fontSize: 14
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

            {/* Selected summary box at bottom of subscription */}
            <div style={S.summaryBox}>
              <div style={S.summaryLabel}>Selected Plan</div>
              <div style={S.summaryValue}>{selectedPlan.name}</div>
              <div style={S.summaryAmount}>
                ₹{selectedAmount}
                <span style={S.summaryPeriod}>
                  {" "}
                  / {billing === "monthly" ? "month" : "year"}
                </span>
              </div>
            </div>

            {/* Payment — UPI QR */}
            <div style={S.paymentBox}>
              <div style={S.paymentTitle}>Complete Payment</div>

              <div style={S.paymentAmount}>
                ₹{selectedAmount}
                <span style={S.paymentPeriod}>
                  /{billing === "monthly" ? "month" : "year"}
                </span>
              </div>

              <div style={S.qrWrap}>
                <img
                  src={qrImage}
                  alt="BuildMitra UPI Payment QR Code"
                  style={S.qrImg}
                />
              </div>

              <p style={S.scanText}>
                Scan with GPay, PhonePe, Paytm, BHIM or any UPI app.
              </p>

              <div style={S.upiLabel}>Official BuildMitra UPI ID</div>
              <div style={S.upiId}>{upiId}</div>

              <a href={upiLink} style={S.upiBtn}>
                Open UPI App
              </a>

              {upiId === "buildmitra@upi" && (
                <div style={S.upiWarn}>
                  Payment setup pending. Configure the official BuildMitra
                  UPI ID before accepting live payments.
                </div>
              )}
            </div>

            <button
              type="button"
              style={S.login}
              onClick={() => router.push("/login")}
            >
              Already paid? Log in to continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#f1f5f9",
    padding: "20px 12px 40px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "#ffffff",
    borderRadius: 16,
    padding: "22px 18px",
    boxShadow: "0 8px 28px rgba(15, 23, 42, 0.1)",
    boxSizing: "border-box"
  },
  brand: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: 900,
    color: "#7f1d1d",
    marginBottom: 6
  },
  h1: {
    textAlign: "center",
    fontSize: 22,
    margin: "6px 0 4px",
    color: "#0f172a",
    fontWeight: 900
  },
  sub: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    margin: "0 0 20px"
  },
  sectionTitle: {
    margin: "18px 0 4px",
    paddingTop: 16,
    borderTop: "1px solid #e2e8f0",
    fontSize: 15,
    fontWeight: 900,
    color: "#166534",
    letterSpacing: 0.3
  },
  lab: {
    display: "block",
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 6,
    marginTop: 12
  },
  inp: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    height: 46,
    padding: "10px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 15,
    fontFamily: "Arial, sans-serif",
    outline: "none"
  },
  msg: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: 14,
    padding: 11,
    borderRadius: 9,
    fontWeight: 700,
    fontSize: 14,
    textAlign: "center"
  },
  btn: {
    display: "block",
    width: "100%",
    marginTop: 18,
    padding: 14,
    border: 0,
    borderRadius: 10,
    background: "#7f1d1d",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer",
    fontFamily: "Arial, sans-serif"
  },
  login: {
    display: "block",
    width: "100%",
    marginTop: 10,
    padding: 8,
    border: 0,
    background: "transparent",
    color: "#153b69",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "Arial, sans-serif"
  },

  /* ---- Subscription styles ---- */
  billingWrap: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    padding: 5,
    background: "#e2e8f0",
    borderRadius: 10,
    margin: "0 auto 18px",
    width: "fit-content"
  },
  billActive: {
    border: 0,
    background: "#166534",
    color: "#fff",
    padding: "10px 22px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
    fontFamily: "Arial, sans-serif"
  },
  billInactive: {
    border: 0,
    background: "transparent",
    color: "#334155",
    padding: "10px 22px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
    fontFamily: "Arial, sans-serif"
  },
  planCard: {
    position: "relative",
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    textAlign: "left",
    border: "2px solid #cbd5e1",
    background: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    cursor: "pointer",
    fontFamily: "Arial, sans-serif"
  },
  planSelected: {
    border: "3px solid #16a34a",
    background: "#f0fdf4",
    boxShadow: "0 5px 18px rgba(22,163,74,.18)"
  },
  planBadge: {
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
  planName: {
    color: "#7f1d1d",
    fontWeight: 900,
    fontSize: 18,
    marginBottom: 6
  },
  planPrice: {
    fontSize: 26,
    fontWeight: 900,
    color: "#0f172a"
  },
  planPeriod: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 12
  },
  featureRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    fontSize: 14,
    marginBottom: 6
  },
  featureYes: {
    display: "inline-grid",
    placeItems: "center",
    width: 21,
    height: 21,
    minWidth: 21,
    borderRadius: "50%",
    background: "#16a34a",
    color: "#fff",
    fontWeight: 900,
    fontSize: 12
  },
  featureNo: {
    display: "inline-grid",
    placeItems: "center",
    width: 21,
    height: 21,
    minWidth: 21,
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#64748b",
    fontWeight: 900,
    fontSize: 12
  },
  summaryBox: {
    marginTop: 4,
    marginBottom: 18,
    padding: "16px 18px",
    borderRadius: 12,
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#166534",
    textAlign: "center"
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#047857",
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 900,
    color: "#065f46",
    marginBottom: 4
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: 900,
    color: "#166534"
  },
  summaryPeriod: {
    fontSize: 14,
    fontWeight: 700,
    color: "#64748b"
  },
  paymentBox: {
    width: "100%",
    padding: "22px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#f8fafc",
    textAlign: "center",
    boxSizing: "border-box"
  },
  paymentTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 12
  },
  paymentAmount: {
    color: "#166534",
    fontSize: 28,
    fontWeight: 900,
    marginBottom: 16
  },
  paymentPeriod: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: 700
  },
  qrWrap: {
    width: 260,
    maxWidth: "100%",
    margin: "0 auto",
    padding: 12,
    border: "2px dashed #7f1d1d",
    borderRadius: 16,
    background: "#ffffff",
    boxSizing: "border-box"
  },
  qrImg: {
    display: "block",
    width: "100%",
    maxWidth: 220,
    height: "auto",
    margin: "0 auto"
  },
  scanText: {
    margin: "14px 0",
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.45
  },
  upiLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800
  },
  upiId: {
    marginTop: 5,
    color: "#0f172a",
    fontSize: 17,
    fontWeight: 900,
    overflowWrap: "anywhere"
  },
  upiBtn: {
    display: "block",
    width: "100%",
    maxWidth: 330,
    margin: "18px auto 0",
    padding: "13px 18px",
    borderRadius: 10,
    background: "#166534",
    color: "#ffffff",
    textAlign: "center",
    textDecoration: "none",
    fontWeight: 900,
    boxSizing: "border-box",
    fontSize: 15
  },
  upiWarn: {
    maxWidth: 500,
    margin: "15px auto 0",
    padding: 11,
    borderRadius: 9,
    background: "#fff7ed",
    color: "#9a3412",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.4
  }
};
