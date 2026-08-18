import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getApiBase } from "../utils/apiConfig";

const API_BASE = getApiBase();

export default function LoginPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const redirectToDashboard = (rawRole: string) => {
    const role = String(rawRole || "")
      .trim()
      .toLowerCase();

    const routes: Record<string, string> = {
      admin: "/admin-dashboard",
      buyer: "/buyer-dashboard",
      owner: "/buyer-dashboard",
      contractor: "/contractor-dashboard",
      supplier: "/supplier-dashboard",
      vendor: "/vendor-dashboard",
      serviceprovider: "/vendor-dashboard",
      service_provider: "/vendor-dashboard",
      laboursupply: "/laboursupply-dashboard",
      labour: "/laboursupply-dashboard",
      machinehire: "/machinehire-dashboard",
      machinery: "/machinehire-dashboard",
      equipment: "/machinehire-dashboard",
      realestate: "/realestate-dashboard"
    };

    router.replace(routes[role] || "/buyer-dashboard");
  };

  useEffect(() => {
    if (!router.isReady) return;
    setCheckingSession(false);
  }, [router.isReady]);

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!agreedToTerms) {
      alert("Please check 'I Agree' to accept the BuildMitra Terms & User Acknowledgement before logging in.");
      return;
    }

    setError("");
    setSuccess("");

    const cleanLoginId = loginId.trim();

    if (!cleanLoginId) {
      setError("Please enter your mobile number or email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phoneOrEmail: cleanLoginId,
          email: cleanLoginId,
          phone: cleanLoginId,
          password
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
          data.error ||
          "Invalid mobile number, email or password."
        );
      }

      const sourceUser =
        data.user ||
        data.data?.user ||
        data.data ||
        {};

      const token =
        data.token ||
        data.accessToken ||
        data.data?.token ||
        "";

      const rawBusinessRole = String(
        sourceUser.businessRole || sourceUser.userType || ""
      ).trim().toLowerCase();

      const rawRole = String(
        sourceUser.role || ""
      ).trim().toLowerCase();

      let effectiveRole = "buyer";
      if (rawBusinessRole && rawBusinessRole !== "user") {
        effectiveRole = rawBusinessRole;
      } else if (rawRole && rawRole !== "user") {
        effectiveRole = rawRole;
      } else {
        const userCode = String(sourceUser.userCode || sourceUser.uniqueCode || "").toUpperCase();
        if (userCode.startsWith("CON-")) effectiveRole = "contractor";
        else if (userCode.startsWith("SUP-")) effectiveRole = "supplier";
        else if (userCode.startsWith("ADM-")) effectiveRole = "admin";
        else if (userCode.startsWith("BUY-")) effectiveRole = "buyer";
        else if (userCode.startsWith("VEN-")) effectiveRole = "vendor";
        else if (userCode.startsWith("LAB-")) effectiveRole = "laboursupply";
        else if (userCode.startsWith("MAC-")) effectiveRole = "machinehire";
        else if (userCode.startsWith("REA-")) effectiveRole = "realestate";
      }

      const user = {
        id: sourceUser.id || sourceUser._id || "",
        _id: sourceUser._id || sourceUser.id || "",
        name: sourceUser.name || sourceUser.fullName || "",
        email: sourceUser.email || "",
        phone: sourceUser.phone || sourceUser.mobile || "",
        userCode: sourceUser.userCode || sourceUser.uniqueCode || sourceUser.code || "",
        uniqueCode: sourceUser.uniqueCode || sourceUser.userCode || sourceUser.code || "",
        role: effectiveRole,
        businessRole: effectiveRole,
        city: sourceUser.city || sourceUser.location || "",
        location: sourceUser.location || sourceUser.city || "",
        pincode: sourceUser.pincode || "",
        subscriptionPlan: sourceUser.subscriptionPlan || "basic",
        subscriptionStatus: sourceUser.subscriptionStatus || "active",
        paymentStatus: sourceUser.paymentStatus || "",
        assignedProjects: sourceUser.assignedProjects || []
      };

      sessionStorage.clear();
      localStorage.removeItem("buildmitraUser");
      localStorage.removeItem("bm_pending_registration");

      sessionStorage.setItem("currentUser", JSON.stringify(user));
      sessionStorage.setItem("loggedInUser", JSON.stringify(user));
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("userName", user.name || "");
      sessionStorage.setItem("userRole", effectiveRole);
      sessionStorage.setItem("uniqueCode", user.userCode || "");

      if (token) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("accessToken", token);
        sessionStorage.setItem("authToken", token);
      }

      sessionStorage.setItem("justLoggedIn", "true");
      localStorage.setItem("buildmitraUser", JSON.stringify(user));

      try {
        const { createJWTToken } = require("../utils/auth");
        createJWTToken({
          id: user.userCode || user.id,
          name: user.name,
          role: effectiveRole,
          email: user.email
        });
      } catch {}

      setSuccess(`Login successful. Welcome ${user.name || "to BuildMitra"}.`);

      setTimeout(() => {
        redirectToDashboard(effectiveRole);
      }, 400);
    } catch (loginError: any) {
      console.error("Login error:", loginError);
      setError(
        loginError?.message ||
        "Unable to connect to the BuildMitra beta server."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main style={styles.pageContainer}>
        <section style={styles.card}>
          <img src="/logo.png" alt="BuildMitra Logo" style={{ height: "46px", width: "auto", margin: "0 auto 8px", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <div style={styles.loadingText}>Opening BuildMitra...</div>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        
        {/* LIGHTWEIGHT PROMOTIONAL TEXT AREA (NO CARD, NO DUPLICATE LOGO) */}
        <div style={styles.promoArea}>
          <div style={styles.promoPill}>
            One platform. Every construction need.
          </div>

          <div style={styles.promoGroup}>
            <div style={styles.promoRole}>HOMEOWNER / BUYER</div>
            <div style={styles.promoTitle}>Build smarter. <span style={{ color: "#16a34a" }}>Save lakhs.</span></div>
            <div style={styles.promoDesc}>Your construction, in your pocket.</div>
          </div>

          <div style={styles.promoGroup}>
            <div style={styles.promoRole}>SUPPLIERS</div>
            <div style={styles.promoTitle}>Grow your reach.</div>
            <div style={styles.promoDesc}>Connect with buyers. Scale your business.</div>
          </div>

          <div style={styles.promoGroup}>
            <div style={styles.promoRole}>CONTRACTORS</div>
            <div style={styles.promoTitle}>Build with confidence.</div>
            <div style={styles.promoDesc}>Deliver quality projects with clarity and control.</div>
          </div>
        </div>

        {/* SINGLE AUTHORITATIVE LOGIN CARD */}
        <section style={styles.card}>
          {/* SINGLE AUTHORITATIVE BRANDING */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <img src="/logo.png" alt="BuildMitra Logo" style={{ height: "48px", width: "auto", margin: "0 auto 6px", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <h1 style={styles.logo}>BuildMitra</h1>
            <p style={styles.subtitle}>Build Smarter. Save Bigger.</p>
          </div>

          <div style={styles.tabs}>
            <button type="button" style={{ ...styles.tab, ...styles.activeTab }}>
              Login
            </button>
            <button type="button" style={styles.tab} onClick={() => router.push("/register")}>
              Register
            </button>
          </div>

          {showTerms && (
            <div style={{ margin: "10px 0", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc", overflow: "hidden" }}>
              <div style={{ padding: "10px 12px", fontWeight: 800, fontSize: "12px", color: "#172033", borderBottom: "1px solid #e2e8f0", background: "#ffffff" }}>
                BuildMitra – Platform Terms & User Acknowledgement
              </div>
              <div style={{ maxHeight: "160px", overflowY: "auto", padding: "10px", fontSize: "11px", lineHeight: 1.5, color: "#475569" }}>
                <p style={{ margin: 0 }}>BuildMitra facilitates direct connections between buyers, suppliers, contractors and service providers. Users must independently verify credentials and quotations.</p>
              </div>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {/* ROW 1: Mobile Number or Email (Full Width Row) */}
            <div style={{ display: "flex", flexDirection: "column", width: "100%", marginBottom: "14px" }}>
              <label style={styles.label}>Mobile Number or Email</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. 9900112233 or user@buildmitra.com"
                style={styles.inputFull}
                required
              />
            </div>

            {/* ROW 2: Password + Eye Icon (Full Width Row directly below Row 1) */}
            <div style={{ display: "flex", flexDirection: "column", width: "100%", marginBottom: "14px" }}>
              <label style={styles.label}>Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ ...styles.inputFull, paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: "4px"
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* ROW 3: LOGIN BUTTON (Full Width Row directly below Row 2) */}
            <div style={{ display: "flex", flexDirection: "column", width: "100%", marginBottom: "12px" }}>
              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                style={{
                  ...styles.submit,
                  width: "100%",
                  opacity: (!agreedToTerms || loading) ? 0.65 : 1,
                  cursor: (!agreedToTerms || loading) ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          {/* ROW 4: ACTION ROW — LEFT: Forgot Password? | RIGHT: □ I Agree */}
          <div style={styles.actionRow}>
            <button
              type="button"
              style={styles.linkButton}
              onClick={() => router.push("/forgot-password")}
            >
              Forgot Password?
            </button>

            <label style={styles.agreeLabel}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ width: "14px", height: "14px", cursor: "pointer", margin: 0 }}
              />
              <span
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setShowTerms((prev) => !prev);
                }}
                title="Double-click to read Terms & Conditions"
                style={{ fontWeight: 800, color: "#800020", cursor: "pointer", userSelect: "none" }}
              >
                I Agree
              </span>
            </label>
          </div>

        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 16px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box"
  },
  contentWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
    maxWidth: "840px",
    width: "100%",
    alignItems: "center"
  },
  promoArea: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    padding: "8px"
  },
  promoPill: {
    display: "inline-block",
    background: "#800020",
    color: "#ffffff",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
    alignSelf: "flex-start",
    letterSpacing: "0.4px"
  },
  promoGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  promoRole: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#800020",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  promoTitle: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#0f172a"
  },
  promoDesc: {
    fontSize: "12px",
    color: "#475569"
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: 18,
    padding: "26px",
    boxShadow: "0 10px 35px rgba(128,0,32,.08)",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box",
    margin: "0 auto"
  },
  logo: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: 900,
    color: "#800020",
    margin: 0
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    margin: "2px 0 14px",
    fontWeight: "600"
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
    padding: 4,
    background: "#f1f5f9",
    borderRadius: 10,
    marginBottom: 18
  },
  tab: {
    border: 0,
    background: "transparent",
    padding: "8px 0",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    color: "#64748b"
  },
  activeTab: {
    background: "#800020",
    color: "#ffffff",
    boxShadow: "0 2px 6px rgba(128,0,32,.2)"
  },
  fieldFullWidth: {
    marginBottom: 14,
    width: "100%"
  },
  label: {
    display: "block",
    fontWeight: 700,
    fontSize: 12,
    marginBottom: 5,
    color: "#334155"
  },
  inputFull: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 14,
    background: "#ffffff",
    outline: "none"
  },
  submit: {
    width: "100%",
    padding: 13,
    border: 0,
    borderRadius: 8,
    background: "#800020",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: 15,
    marginTop: 4
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9"
  },
  linkButton: {
    border: 0,
    background: "transparent",
    color: "#2563eb",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    padding: 0
  },
  agreeLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#334155",
    cursor: "pointer"
  },
  error: {
    padding: 10,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 14
  },
  success: {
    padding: 10,
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 14
  },
  loadingText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 10
  }
};
