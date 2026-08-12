import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "https://buildmitra-backend-beta.onrender.com";

export default function LoginPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
      alert("Please agree to the BuildMitra Platform Terms & User Acknowledgement before login.");
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

      // Clear previous stale session keys
      sessionStorage.clear();
      localStorage.removeItem("buildmitraUser");
      localStorage.removeItem("bm_pending_registration");

      // SAVE ALL CONSISTENT SESSION KEYS
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

      // Create JWT session for auth.ts
      try {
        const { createJWTToken } = require("../utils/auth");
        createJWTToken({
          id: user.userCode || user.id,
          name: user.name,
          role: effectiveRole,
          email: user.email
        });
      } catch {}

      setSuccess(
        `Login successful. Welcome ${
          user.name || "to BuildMitra"
        }.`
      );

      setTimeout(() => {
        redirectToDashboard(effectiveRole);
      }, 500);
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
      <main style={styles.page}>
        <section style={styles.card}>
          <div style={styles.logoIcon}>🏗️</div>
          <div style={styles.loadingText}>Opening BuildMitra...</div>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.logoIcon}>🏗️</div>
        <h1 style={styles.logo}>BuildMitra</h1>
        <p style={styles.subtitle}>Build Smarter. Save Bigger.</p>

        <div style={styles.tabs}>
          
          <div
            style={{
              marginTop: "14px",
              marginBottom: "10px",
              border: "1px solid #d9e1ea",
              borderRadius: "10px",
              background: "#f8fafc",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                fontWeight: 800,
                fontSize: "13px",
                color: "#172033",
                borderBottom: "1px solid #e5e7eb",
                background: "#ffffff",
              }}
            >
              BuildMitra – Platform Terms & User Acknowledgement
            </div>

            <div
              style={{
                maxHeight: "190px",
                overflowY: "auto",
                padding: "10px 12px",
                fontSize: "11px",
                lineHeight: 1.55,
                color: "#475569",
                textAlign: "left",
              }}
            >
              <p>
                BuildMitra is a technology and information platform designed to
                connect buyers, property owners and other users with independent
                sellers, suppliers, manufacturers, contractors, consultants,
                service providers, labour providers, machinery providers,
                real-estate owners/agents and other participating users.
              </p>

              <p>
                <strong>1. Platform Role:</strong> BuildMitra primarily
                facilitates discovery, communication, enquiries, quotations and
                connections between users. Unless specifically stated otherwise
                for a particular BuildMitra service, BuildMitra is not the
                manufacturer, seller, contractor, employer, property owner,
                broker, lender, guarantor or party to an independent transaction
                concluded between users.
              </p>

              <p>
                <strong>2. Independent Verification:</strong> Before placing an
                order, making a payment, entering into an agreement or commencing
                work, users must independently verify the identity and
                credentials of the other party and verify quotations,
                specifications, quantities, brands, quality, warranties,
                licences, GST details, delivery terms, workmanship, property
                ownership/title, approvals and other relevant documents or
                information.
              </p>

              <p>
                <strong>3. Payments:</strong> Users should exercise appropriate
                care before transferring money or making cash, UPI, bank or
                other direct payments to another user. Unless a payment is
                expressly collected by BuildMitra through an authorised
                BuildMitra payment facility, BuildMitra does not receive, hold
                or control that user-to-user payment.
              </p>

              <p>
                <strong>4. Materials & Products:</strong> BuildMitra does not
                independently guarantee the quality, quantity, specification,
                authenticity, suitability, availability or delivery of
                materials/products supplied by independent sellers. Disputes
                concerning wrong, defective, damaged, short-supplied, delayed or
                rejected material should ordinarily be resolved between the
                buyer and the responsible seller/supplier, subject to applicable
                law and any rights available to the consumer.
              </p>

              <p>
                <strong>5. Contractors & Services:</strong> Independent
                contractors, consultants, labour providers, machinery providers
                and other professionals remain responsible for their own
                quotations, representations, personnel, safety, statutory
                compliance, workmanship, schedules and contractual obligations.
              </p>

              <p>
                <strong>6. Real Estate:</strong> Property advertisements and
                information may be supplied by owners, agents or other users.
                Users must independently verify ownership/title, encumbrances,
                measurements, approvals, RERA applicability/registration where
                required, taxes, documents and legal status before paying money
                or entering into any property transaction. BuildMitra listing or
                displaying a property does not by itself constitute legal
                verification or approval of that property.
              </p>

              <p>
                <strong>7. User-Generated Information:</strong> Sellers and
                other users are responsible for the accuracy and legality of
                information, photographs, documents, prices, specifications,
                advertisements and representations they upload or communicate
                through BuildMitra. BuildMitra may moderate, restrict, suspend
                or remove content/accounts where reasonably necessary for
                platform safety, legal compliance or prevention of misuse.
              </p>

              <p>
                <strong>8. Fraud & Prohibited Conduct:</strong> Users must not
                use BuildMitra for fraud, impersonation, cheating, misleading
                advertisements, counterfeit or unlawful goods, forged
                documents, manipulation, harassment, unauthorised access,
                scraping/automated abuse, malicious activity or any activity
                prohibited by applicable law. Suspected unlawful activity may
                be restricted and may be reported or disclosed to competent
                authorities where required or permitted by law.
              </p>

              <p>
                <strong>9. Statutory Rights:</strong> Nothing in these terms is
                intended to remove any statutory consumer right or other legal
                right that cannot lawfully be excluded. BuildMitra's
                responsibility, if any, remains subject to applicable law.
              </p>

              <p>
                <strong>10. Privacy & Data:</strong> By using BuildMitra, users
                acknowledge that information necessary for account operation,
                enquiries, quotations, communication, security and platform
                functionality may be processed in accordance with BuildMitra's
                Privacy Policy and applicable data-protection law.
              </p>

              <p>
                <strong>11. User Responsibility:</strong> Each user is
                responsible for decisions made based on listings, quotations,
                communications or information available through the platform and
                should obtain appropriate technical, financial or legal advice
                where the transaction requires it.
              </p>

              <p style={{ marginBottom: 0 }}>
                <strong>12. Applicable Law:</strong> Use of BuildMitra is
                subject to applicable laws and regulations in India, including
                applicable consumer-protection, information-technology,
                data-protection and other laws as amended from time to time.
              </p>
            </div>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              margin: "8px 0 12px",
              cursor: "pointer",
              fontSize: "12px",
              lineHeight: 1.45,
              color: "#334155",
              textAlign: "left",
            }}
          >
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{
                marginTop: "2px",
                width: "16px",
                height: "16px",
                flexShrink: 0,
                cursor: "pointer",
              }}
            />

            <span>
              <strong>I Agree.</strong> I confirm that I have read and
              understood the above Platform Terms & User Acknowledgement and
              agree to BuildMitra's Terms of Use and Privacy Policy.
            </span>
          </label>
<button disabled={!agreedToTerms}
            type="button"
            style={{ ...styles.tab, ...styles.activeTab }}
          >
            Login
          </button>
          <button
            type="button"
            style={styles.tab}
            onClick={() => router.push("/register")}
          >
            Register
          </button>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.description}>
          Login using your registered mobile number or email.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label style={styles.label}>Mobile Number or Email</label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="e.g. 9900112233 or user@buildmitra.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submit}>
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>

        <div style={styles.links}>
          <button
            type="button"
            style={styles.linkButton}
            onClick={() => router.push("/forgot-password")}
          >
            Forgot Password?
          </button>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    display: "grid",
    placeItems: "center",
    padding: 16,
    fontFamily: "Arial, sans-serif"
  },
  card: {
    width: "100%",
    maxWidth: 440,
    background: "#ffffff",
    borderRadius: 18,
    padding: 28,
    boxShadow: "0 10px 35px rgba(15,23,42,.10)",
    boxSizing: "border-box"
  },
  logoIcon: {
    fontSize: 42,
    textAlign: "center",
    marginBottom: 4
  },
  logo: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: 900,
    color: "#7f1d1d",
    margin: 0
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    margin: "4px 0 20px"
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    padding: 4,
    background: "#e2e8f0",
    borderRadius: 10,
    marginBottom: 20
  },
  tab: {
    border: 0,
    background: "transparent",
    padding: "10px 0",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    color: "#64748b"
  },
  activeTab: {
    background: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 2px 6px rgba(0,0,0,.08)"
  },
  title: {
    fontSize: 20,
    fontWeight: 800,
    margin: "0 0 4px",
    color: "#0f172a"
  },
  description: {
    color: "#64748b",
    fontSize: 13,
    margin: "0 0 16px"
  },
  field: {
    marginBottom: 16
  },
  label: {
    display: "block",
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 6,
    color: "#334155"
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    fontSize: 15,
    background: "#ffffff"
  },
  submit: {
    width: "100%",
    padding: 14,
    border: 0,
    borderRadius: 10,
    background: "#7f1d1d",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
    marginTop: 8
  },
  error: {
    padding: 12,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 16
  },
  success: {
    padding: 12,
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 16
  },
  loadingText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 10
  },
  links: {
    marginTop: 18,
    textAlign: "center"
  },
  linkButton: {
    border: 0,
    background: "transparent",
    color: "#0f766e",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer"
  }
};


