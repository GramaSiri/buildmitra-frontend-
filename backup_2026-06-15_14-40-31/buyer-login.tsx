import React, { useState } from "react";
import { useRouter } from "next/router";

export default function BuyerLogin() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const stored = localStorage.getItem("buyer_user");

    if (!stored) {
      alert("No account found. Please register first.");
      return;
    }

    const user = JSON.parse(stored);

    if (user.mobile === mobile && user.password === password) {
      if (user.status === "approved") {
        user.isLoggedIn = true;
        localStorage.setItem("buyer_user", JSON.stringify(user));

        // 👇 STORE NAME FOR DASHBOARD WELCOME
        localStorage.setItem("logged_user_name", user.name || "User");

        router.push("/buyer-dashboard");
      } else {
        alert("Account pending admin approval");
      }
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,#667eea,#764ba2)"
    }}>
      <div style={{
        width: "380px",
        padding: "30px",
        background: "#fff",
        borderRadius: "16px"
      }}>
        <h2 style={{ textAlign: "center" }}>🏗️ Buyer Login</h2>

        <input
          placeholder="Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          style={{ width: "100%", padding: "10px", marginTop: "10px" }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", marginTop: "10px" }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "10px",
            background: "#1a7f6e",
            color: "#fff",
            border: "none"
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}