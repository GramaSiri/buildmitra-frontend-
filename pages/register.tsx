import React, { useState } from "react";
import { useRouter } from "next/router";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    businessRole: "buyer",
    companyName: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const clearForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      businessRole: "buyer",
      companyName: ""
    });
  };

  const updateField = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.replace(/\D/g, ""),
          password: form.password,
          businessRole: form.businessRole,
          companyName:
            form.companyName.trim() ||
            form.name.trim()
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage(
        `Account created successfully. Your user code is ${data.user.userCode}.`
      );

      clearForm();

      setTimeout(() => {
        router.replace("/login");
      }, 700);
    } catch (error: any) {
      setIsError(true);
      setMessage(error?.message || "Registration failed");
      setForm({
        ...form,
        password: ""
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Create BuildMitra Account</h1>

        <form onSubmit={handleRegister} autoComplete="off">
          <input
            style={styles.input}
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={updateField}
            required
          />

          <input
            style={styles.input}
            name="companyName"
            placeholder="Company / Business Name"
            value={form.companyName}
            onChange={updateField}
          />

          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={updateField}
            required
          />

          <input
            style={styles.input}
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={updateField}
            required
          />

          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password - minimum 6 characters"
            value={form.password}
            onChange={updateField}
            autoComplete="new-password"
            required
          />

          <select
            style={styles.input}
            name="businessRole"
            value={form.businessRole}
            onChange={updateField}
          >
            <option value="buyer">Buyer / Owner</option>
            <option value="contractor">Contractor</option>
            <option value="supplier">Supplier</option>
            <option value="vendor">Vendor</option>
            <option value="laboursupply">Labour Supplier</option>
            <option value="machinehire">Machine Hire</option>
            <option value="realestate">Real Estate</option>
          </select>

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

          <button
            style={styles.submit}
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
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
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f6fa",
    padding: 20,
    fontFamily: "Arial, sans-serif"
  },
  card: {
    width: "100%",
    maxWidth: 470,
    padding: 30,
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 12px 35px rgba(0,0,0,0.10)"
  },
  title: {
    textAlign: "center",
    color: "#153b69",
    marginBottom: 22
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 13,
    marginBottom: 13,
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    fontSize: 15
  },
  message: {
    padding: 11,
    marginBottom: 13,
    borderRadius: 8
  },
  submit: {
    width: "100%",
    padding: 13,
    border: 0,
    borderRadius: 9,
    background: "#153b69",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer"
  },
  login: {
    width: "100%",
    marginTop: 12,
    padding: 12,
    border: "1px solid #153b69",
    borderRadius: 9,
    background: "#ffffff",
    color: "#153b69",
    fontWeight: 800,
    cursor: "pointer"
  }
};
