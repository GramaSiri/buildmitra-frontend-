import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

// BuildMitra Shared Design System Tokens
export const themeTokens = {
  colors: {
    brandMaroon: "#7f1d1d",
    brandMaroonDark: "#4c0519",
    brandGreen: "#166534",
    primary: "#0f766e", // BuildMitra Teal
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
    glow: "0 0 20px rgba(127, 29, 29, 0.2)"
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    full: "9999px"
  }
};

// Reusable Button Components
export function PrimaryButton({
  children,
  onClick,
  disabled,
  style
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        background: disabled ? "#94a3b8" : themeTokens.colors.brandMaroon,
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

export function SecondaryButton({
  children,
  onClick,
  style
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
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

// Reusable Card Component
export function Card({
  children,
  title,
  subtitle,
  style
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: React.CSSProperties;
}) {
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
      {title && (
        <h3
          style={{
            margin: "0 0 4px 0",
            fontSize: "16px",
            fontWeight: "800",
            color: themeTokens.colors.textPrimary
          }}
        >
          {title}
        </h3>
      )}
      {subtitle && (
        <p
          style={{
            margin: "0 0 16px 0",
            fontSize: "12px",
            color: themeTokens.colors.textSecondary
          }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

// Unified Status Badge Component
export function Badge({
  children,
  variant = "info"
}: {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "danger" | "neutral";
}) {
  const bgMap = {
    info: "#e0f2fe",
    success: "#dcfce7",
    warning: "#fef3c7",
    danger: "#fee2e2",
    neutral: "#f1f5f9"
  };

  const textMap = {
    info: "#0369a1",
    success: "#166534",
    warning: "#b45309",
    danger: "#991b1b",
    neutral: "#475569"
  };

  return (
    <span
      style={{
        background: bgMap[variant] || bgMap.info,
        color: textMap[variant] || textMap.info,
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

// Unified Loading Spinner
export function LoadingSpinner({
  label = "Loading BuildMitra data..."
}: {
  label?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px"
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid #cbd5e1",
          borderTopColor: themeTokens.colors.brandMaroon,
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}
      />
      <span
        style={{
          marginTop: "12px",
          fontSize: "13px",
          color: themeTokens.colors.textSecondary,
          fontWeight: "600"
        }}
      >
        {label}
      </span>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Unified Empty State Component
export function EmptyState({
  title = "No data found",
  description = "There are no items to display at this time."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px 20px",
        background: "#f8fafc",
        borderRadius: "12px",
        border: "1px dashed #cbd5e1"
      }}
    >
      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📦</div>
      <h4
        style={{
          margin: "0 0 4px 0",
          fontSize: "15px",
          fontWeight: "700",
          color: "#1e293b"
        }}
      >
        {title}
      </h4>
      <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
        {description}
      </p>
    </div>
  );
}

// UNIFIED BUILDMITRA PAGE HEADER COMPONENT
export function BuildMitraHeader({
  moduleTitle = "BuildMitra Module",
  pageTitle = "Page Overview",
  subtitle = "Build Smarter. Save Bigger.",
  showBackToDashboard = true
}: {
  moduleTitle?: string;
  pageTitle?: string;
  subtitle?: string;
  showBackToDashboard?: boolean;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userCode, setUserCode] = useState("");
  const [dashboardPath, setDashboardPath] = useState("/buyer-dashboard");

  useEffect(() => {
    try {
      const raw =
        sessionStorage.getItem("currentUser") ||
        sessionStorage.getItem("loggedInUser") ||
        sessionStorage.getItem("user") ||
        localStorage.getItem("buildmitraUser");

      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u.name || "BuildMitra User");
        setUserCode(u.userCode || u.uniqueCode || u.id || "");

        const role = String(u.businessRole || u.role || "buyer").toLowerCase();
        const routes: Record<string, string> = {
          admin: "/admin-dashboard",
          buyer: "/buyer-dashboard",
          contractor: "/contractor-dashboard",
          supplier: "/supplier-dashboard",
          vendor: "/vendor-dashboard",
          laboursupply: "/laboursupply-dashboard",
          machinehire: "/machinehire-dashboard",
          realestate: "/realestate-dashboard"
        };
        setDashboardPath(routes[role] || "/buyer-dashboard");
      }
    } catch {}
  }, []);

  return (
    <header
      style={{
        background: "linear-gradient(135deg, #7f1d1d 0%, #4c0519 100%)",
        color: "#ffffff",
        padding: "16px 24px",
        borderRadius: "14px",
        marginBottom: "20px",
        boxShadow: "0 8px 24px rgba(127,29,29,0.18)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}
    >
      <div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#fcd34d",
            marginBottom: "3px"
          }}
        >
          🏗️ BuildMitra • {moduleTitle}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "900",
            color: "#ffffff"
          }}
        >
          {pageTitle}
        </h1>
        <p
          style={{
            margin: "3px 0 0 0",
            fontSize: "13px",
            color: "#fecdd3"
          }}
        >
          {subtitle}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap"
        }}
      >
        {userCode && (
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(4px)",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700"
            }}
          >
            👤 {userName}{" "}
            <span style={{ color: "#fcd34d" }}>({userCode})</span>
          </div>
        )}

        {showBackToDashboard && (
          <button
            onClick={() => router.push(dashboardPath)}
            style={{
              background: "#166534",
              color: "#ffffff",
              border: 0,
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              transition: "all 0.2s"
            }}
          >
            ← Back to Dashboard
          </button>
        )}
      </div>
    </header>
  );
}
