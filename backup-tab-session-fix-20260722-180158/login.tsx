import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://buildmitra-backend-beta.onrender.com";

export default function LoginPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    router.replace(routes[role] || "/");
  };

  useEffect(() => {
    if (!router.isReady) return;

    // Always display the login page.
    // Do not automatically redirect using an old saved session.
    setCheckingSession(false);
  }, [router.isReady]);

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanLoginId = loginId.trim();

    if (!cleanLoginId) {
      setError(
        "Please enter your mobile number or email."
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/auth/login`,
        {
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
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

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

      const role =
        sourceUser.businessRole ||
        sourceUser.role ||
        "buyer";

      const user = {
        id:
          sourceUser.id ||
          sourceUser._id ||
          "",

        _id:
          sourceUser._id ||
          sourceUser.id ||
          "",

        name:
          sourceUser.name ||
          sourceUser.fullName ||
          "",

        email:
          sourceUser.email ||
          "",

        phone:
          sourceUser.phone ||
          sourceUser.mobile ||
          "",

        userCode:
          sourceUser.userCode ||
          sourceUser.uniqueCode ||
          sourceUser.code ||
          "",

        uniqueCode:
          sourceUser.uniqueCode ||
          sourceUser.userCode ||
          sourceUser.code ||
          "",

        role,

        businessRole: role,

        city:
          sourceUser.city ||
          sourceUser.location ||
          "",

        location:
          sourceUser.location ||
          sourceUser.city ||
          "",

        pincode:
          sourceUser.pincode ||
          "",

        subscriptionPlan:
          sourceUser.subscriptionPlan ||
          "",

        subscriptionStatus:
          sourceUser.subscriptionStatus ||
          "",

        paymentStatus:
          sourceUser.paymentStatus ||
          "",

        assignedProjects:
          sourceUser.assignedProjects ||
          []
      };

      localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "userName",
        user.name
      );

      localStorage.setItem(
        "userRole",
        user.businessRole
      );

      localStorage.setItem(
        "uniqueCode",
        user.userCode
      );

      if (token) {
        localStorage.setItem(
          "token",
          token
        );
      }


      // BUILDMITRA TAB-SPECIFIC SESSION
      // sessionStorage is separate for each browser tab.
      sessionStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify(user)
      );

      sessionStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      sessionStorage.setItem(
        "userName",
        user.name || ""
      );

      sessionStorage.setItem(
        "userRole",
        user.businessRole || user.role || ""
      );

      sessionStorage.setItem(
        "uniqueCode",
        user.userCode || user.uniqueCode || ""
      );

      if (token) {
        sessionStorage.setItem(
          "token",
          token
        );
      }
      sessionStorage.setItem(
        "justLoggedIn",
        "true"
      );

      setSuccess(
        `Login successful. Welcome ${
          user.name || "to BuildMitra"
        }.`
      );

      setTimeout(() => {
        redirectToDashboard(role);
      }, 500);
    } catch (loginError: any) {
      console.error(
        "Login error:",
        loginError
      );

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

          <div style={styles.loadingText}>
            Opening BuildMitra...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.logoIcon}>
          🏗️
        </div>

        <h1 style={styles.logo}>
          BuildMitra
        </h1>

        <p style={styles.subtitle}>
          Build Smarter. Save Bigger.
        </p>

        <div style={styles.tabs}>
          <button
            type="button"
            style={{
              ...styles.tab,
              ...styles.activeTab
            }}
          >
            Login
          </button>

          <button
            type="button"
            style={styles.tab}
            onClick={() =>
              router.push("/register")
            }
          >
            Register
          </button>
        </div>

        <h2 style={styles.title}>
          Welcome Back
        </h2>

        <p style={styles.description}>
          Login using your registered mobile number
          or email.
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label style={styles.field}>
            <span style={styles.label}>
              Mobile Number or Email
            </span>

            <input
              type="text"
              value={loginId}
              onChange={(event) =>
                setLoginId(event.target.value)
              }
              placeholder="Enter mobile number or email"
              autoComplete="username"
              style={styles.input}
              required
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>
              Password
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              style={styles.input}
              required
            />
          </label>

          <div style={styles.forgotRow}>
            <button
              type="button"
              style={styles.linkButton}
              onClick={() =>
                router.push("/forgot-password")
              }
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginButton,
              ...(loading
                ? styles.disabledButton
                : {})
            }}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />

          <span style={styles.dividerText}>
            New to BuildMitra?
          </span>

          <span style={styles.dividerLine} />
        </div>

        <button
          type="button"
          style={styles.registerButton}
          onClick={() =>
            router.push("/register")
          }
        >
          Create New Account
        </button>

        <p style={styles.note}>
          Select your subscription plan during
          registration.
        </p>

        <button
          type="button"
          style={styles.homeButton}
          onClick={() =>
            router.push("/")
          }
        >
          ← Back to Home
        </button>
      </section>
    </main>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "18px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #0f4c5c 0%, #1a6f82 52%, #2c8ca3 100%)",
    fontFamily:
      "Arial, Helvetica, sans-serif"
  },

  card: {
    width: "100%",
    maxWidth: "450px",
    boxSizing: "border-box",
    padding: "34px 30px",
    borderRadius: "22px",
    background: "#ffffff",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.30)"
  },

  logoIcon: {
    textAlign: "center",
    fontSize: "46px",
    lineHeight: 1
  },

  logo: {
    margin: "8px 0 2px",
    textAlign: "center",
    color: "#7f1d1d",
    fontSize: "30px",
    fontWeight: 900
  },

  subtitle: {
    margin: "0 0 24px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px"
  },

  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "5px",
    padding: "5px",
    marginBottom: "24px",
    borderRadius: "12px",
    background: "#e2e8f0"
  },

  tab: {
    padding: "11px 10px",
    border: "none",
    borderRadius: "9px",
    background: "transparent",
    color: "#475569",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "14px"
  },

  activeTab: {
    background: "#16697a",
    color: "#ffffff",
    boxShadow:
      "0 4px 12px rgba(22,105,122,0.25)"
  },

  title: {
    margin: "0 0 6px",
    color: "#0f172a",
    textAlign: "center",
    fontSize: "24px"
  },

  description: {
    margin: "0 0 22px",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 1.5,
    fontSize: "14px"
  },

  field: {
    display: "block",
    marginBottom: "16px"
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 800
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "15px",
    outline: "none"
  },

  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-6px",
    marginBottom: "16px"
  },

  linkButton: {
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#16697a",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800
  },

  loginButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#7f1d1d",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 900
  },

  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed"
  },

  error: {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "9px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.5
  },

  success: {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "9px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.5
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "22px 0 16px"
  },

  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e2e8f0"
  },

  dividerText: {
    color: "#64748b",
    fontSize: "12px",
    whiteSpace: "nowrap"
  },

  registerButton: {
    width: "100%",
    padding: "13px",
    border: "2px solid #16697a",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#16697a",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 900
  },

  note: {
    margin: "12px 0 0",
    padding: "10px",
    borderRadius: "9px",
    background: "#f0fdf4",
    color: "#166534",
    textAlign: "center",
    fontSize: "12px",
    lineHeight: 1.5
  },

  homeButton: {
    display: "block",
    width: "100%",
    marginTop: "16px",
    padding: "6px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontWeight: 700
  },

  loadingText: {
    marginTop: "14px",
    textAlign: "center",
    color: "#16697a",
    fontWeight: 800
  }
};


