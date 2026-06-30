import React, { useState } from "react";
import { useRouter } from "next/router";

export default function ForgotPassword() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const styles: any = {
    page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1a5f7a,#2d8db5)", padding: 20 },
    card: { background: "white", borderRadius: 20, padding: 35, width: "100%", maxWidth: 430, boxShadow: "0 20px 60px rgba(0,0,0,.25)" },
    title: { textAlign: "center", color: "#1a5f7a", marginBottom: 8 },
    sub: { textAlign: "center", color: "#666", fontSize: 13, marginBottom: 25 },
    label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 },
    input: { width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: 10, marginBottom: 15 },
    button: { width: "100%", padding: 13, background: "#1a5f7a", color: "white", border: 0, borderRadius: 10, fontWeight: "bold", cursor: "pointer" },
    back: { width: "100%", padding: 11, background: "transparent", color: "#1a5f7a", border: "1px solid #1a5f7a", borderRadius: 10, fontWeight: "bold", cursor: "pointer", marginTop: 10 },
    success: { background: "#d1fae5", color: "#065f46", padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 },
    error: { background: "#fee2e2", color: "#dc2626", padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 }
  };

  const sendOtp = () => {
    setError("");
    setMessage("");
    if (!phone || phone.length < 10) {
      setError("Enter valid registered mobile number.");
      return;
    }
    localStorage.setItem("bm_reset_phone", phone);
    localStorage.setItem("bm_reset_otp", "123456");
    setStep(2);
    setMessage("OTP sent successfully. Beta testing OTP is 123456. SMS OTP will be connected later.");
  };

  const verifyOtp = () => {
    setError("");
    setMessage("");
    const savedOtp = localStorage.getItem("bm_reset_otp");
    if (otp !== savedOtp) {
      setError("Invalid OTP.");
      return;
    }
    setStep(3);
    setMessage("OTP verified. Set your new password.");
  };

  const resetPassword = () => {
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

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const index = users.findIndex((u: any) => u.phone === phone);

    if (index === -1) {
      setError("No user found with this mobile number.");
      return;
    }

    users[index].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.removeItem("bm_reset_otp");
    localStorage.removeItem("bm_reset_phone");

    setMessage("Password reset successful. Redirecting to login...");
    setTimeout(() => router.push("/login"), 1200);
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
            <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter mobile number" />
            <button style={styles.button} onClick={sendOtp}>Send OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <label style={styles.label}>Enter OTP</label>
            <input style={styles.input} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
            <button style={styles.button} onClick={verifyOtp}>Verify OTP</button>
          </>
        )}

        {step === 3 && (
          <>
            <label style={styles.label}>New Password</label>
            <input type="password" style={styles.input} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />

            <label style={styles.label}>Confirm Password</label>
            <input type="password" style={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />

            <button style={styles.button} onClick={resetPassword}>Reset Password</button>
          </>
        )}

        <button style={styles.back} onClick={() => router.push("/login")}>Back to Login</button>
      </div>
    </div>
  );
}

