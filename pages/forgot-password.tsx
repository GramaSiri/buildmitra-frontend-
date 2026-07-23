import React, { useState } from "react";
import { useRouter } from "next/router";

export default function ForgotPassword() {
  const router = useRouter();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://buildmitra-backend-beta.onrender.com";

  const [phone, setPhone] = useState("");
  const [businessRole, setBusinessRole] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const styles: any = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,#1a5f7a,#2d8db5)",
      padding: 20
    },
    card: {
      background: "white",
      borderRadius: 20,
      padding: 35,
      width: "100%",
      maxWidth: 430,
      boxShadow: "0 20px 60px rgba(0,0,0,.25)"
    },
    title: {
      textAlign: "center",
      color: "#1a5f7a",
      marginBottom: 8
    },
    sub: {
      textAlign: "center",
      color: "#666",
      fontSize: 13,
      marginBottom: 25
    },
    label: {
      display: "block",
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 6
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      border: "1px solid #ddd",
      borderRadius: 10,
      marginBottom: 15,
      boxSizing: "border-box"
    },
    button: {
      width: "100%",
      padding: 13,
      background: "#1a5f7a",
      color: "white",
      border: 0,
      borderRadius: 10,
      fontWeight: "bold",
      cursor: "pointer"
    },
    disabledButton: {
      opacity: 0.65,
      cursor: "not-allowed"
    },
    back: {
      width: "100%",
      padding: 11,
      background: "transparent",
      color: "#1a5f7a",
      border: "1px solid #1a5f7a",
      borderRadius: 10,
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: 10
    },
    success: {
      background: "#d1fae5",
      color: "#065f46",
      padding: 10,
      borderRadius: 8,
      marginBottom: 12,
      fontSize: 13
    },
    error: {
      background: "#fee2e2",
      color: "#dc2626",
      padding: 10,
      borderRadius: 8,
      marginBottom: 12,
      fontSize: 13
    }
  };

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);

  const sendOtp = async () => {
    setError("");
    setMessage("");

    if (cleanPhone.length !== 10) {
      setError("Enter a valid 10-digit registered mobile number.");
      return;
    }

    if (!businessRole) {
      setError("Select your registered role.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/auth/forgot-password/check-phone`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: cleanPhone,
            businessRole
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to verify mobile number.");
      }

      setPhone(cleanPhone);
      setStep(2);
      setMessage(
        "Mobile number verified. Beta testing OTP is 123456. SMS OTP will be connected later."
      );
    } catch (err: any) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = () => {
    setError("");
    setMessage("");

    if (otp.trim() !== "123456") {
      setError("Invalid OTP.");
      return;
    }

    setStep(3);
    setMessage("OTP verified. Set your new password.");
  };

  const resetPassword = async () => {
    setError("");
    setMessage("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/auth/forgot-password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: cleanPhone,
            businessRole,
            otp: otp.trim(),
            newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Password reset failed.");
      }

      setMessage("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔐 Forgot Password</h1>
        <p style={styles.sub}>Reset your BuildMitra login password</p>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {step === 1 && (
          <>
            <label style={styles.label}>Registered Mobile Number</label>

            <input
              style={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter mobile number"
              inputMode="numeric"
              maxLength={13}
            />

            <label style={styles.label}>Registered Role</label>

            <select
              style={styles.input}
              value={businessRole}
              onChange={(e) => setBusinessRole(e.target.value)}
            >
              <option value="">Select your role</option>
              <option value="buyer">Buyer / Owner</option>
              <option value="contractor">Contractor</option>
              <option value="supplier">Supplier</option>
              <option value="vendor">Vendor</option>
              <option value="laboursupply">Labour Supplier</option>
              <option value="machinehire">Machine Hire</option>
              <option value="realestate">Real Estate</option>
              <option value="admin">Admin</option>
            </select>

            <button
              style={{
                ...styles.button,
                ...(loading ? styles.disabledButton : {})
              }}
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? "Checking..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label style={styles.label}>Enter OTP</label>

            <input
              style={styles.input}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              inputMode="numeric"
              maxLength={6}
            />

            <button
              style={styles.button}
              onClick={verifyOtp}
            >
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <label style={styles.label}>New Password</label>

            <input
              type="password"
              style={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />

            <label style={styles.label}>Confirm Password</label>

            <input
              type="password"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />

            <label style={styles.label}>Registered Role</label>

            <select
              style={styles.input}
              value={businessRole}
              onChange={(e) => setBusinessRole(e.target.value)}
            >
              <option value="">Select your role</option>
              <option value="buyer">Buyer / Owner</option>
              <option value="contractor">Contractor</option>
              <option value="supplier">Supplier</option>
              <option value="vendor">Vendor</option>
              <option value="laboursupply">Labour Supplier</option>
              <option value="machinehire">Machine Hire</option>
              <option value="realestate">Real Estate</option>
              <option value="admin">Admin</option>
            </select>

            <button
              style={{
                ...styles.button,
                ...(loading ? styles.disabledButton : {})
              }}
              onClick={resetPassword}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <button
          style={styles.back}
          onClick={() => router.push("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}


