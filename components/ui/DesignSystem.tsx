import React from "react";

// BuildMitra Shared Design Tokens
export const themeTokens = {
  colors: {
    primary: "#0f766e", // BuildMitra Teal Primary
    primaryHover: "#0d9488",
    primaryDark: "#115e59",
    secondary: "#0284c7",
    accent: "#f59e0b",
    danger: "#ef4444",
    success: "#10b981",
    bgDark: "#0f172a",
    bgLight: "#f8fafc",
    cardBg: "#ffffff",
    border: "#e2e8f0",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8"
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    glow: "0 0 20px rgba(15, 118, 110, 0.25)"
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    full: "9999px"
  }
};

// Reusable UI Components
export function PrimaryButton({ children, onClick, disabled, style }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        background: disabled ? "#94a3b8" : themeTokens.colors.primary,
        color: "#ffffff",
        border: 0,
        borderRadius: themeTokens.radii.sm,
        padding: "10px 18px",
        fontWeight: "700",
        fontSize: "13px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease-in-out",
        boxShadow: themeTokens.shadows.sm,
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#ffffff",
        color: themeTokens.colors.textPrimary,
        border: `1px solid ${themeTokens.colors.border}`,
        borderRadius: themeTokens.radii.sm,
        padding: "10px 18px",
        fontWeight: "600",
        fontSize: "13px",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children, title, subtitle, style }: { children: React.ReactNode; title?: string; subtitle?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: themeTokens.colors.cardBg,
        borderRadius: themeTokens.radii.md,
        padding: "20px",
        border: `1px solid ${themeTokens.colors.border}`,
        boxShadow: themeTokens.shadows.md,
        marginBottom: "16px",
        ...style
      }}
    >
      {title && <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "800", color: themeTokens.colors.textPrimary }}>{title}</h3>}
      {subtitle && <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: themeTokens.colors.textSecondary }}>{subtitle}</p>}
      {children}
    </div>
  );
}

export function Badge({ children, variant = "info" }: { children: React.ReactNode; variant?: "info" | "success" | "warning" | "danger" }) {
  const bgMap = {
    info: "#e0f2fe",
    success: "#d1fae5",
    warning: "#fef3c7",
    danger: "#fee2e2"
  };

  const textMap = {
    info: "#0369a1",
    success: "#047857",
    warning: "#b45309",
    danger: "#b91c1c"
  };

  return (
    <span
      style={{
        background: bgMap[variant],
        color: textMap[variant],
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "700",
        display: "inline-block"
      }}
    >
      {children}
    </span>
  );
}

export function LoadingSpinner({ label = "Loading data..." }: { label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #cbd5e1", borderTopColor: themeTokens.colors.primary, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <span style={{ marginTop: "12px", fontSize: "13px", color: themeTokens.colors.textSecondary, fontWeight: "600" }}>{label}</span>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function EmptyState({ title = "No data found", description = "There are no items to display at this time." }: { title?: string; description?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📦</div>
      <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>{title}</h4>
      <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{description}</p>
    </div>
  );
}
