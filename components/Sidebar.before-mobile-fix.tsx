import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { clearBuildMitraSession } from "../utils/session";

const styles = {
  sidebar: {
    width: "280px",
    background: "#1a1a2e",
    color: "#fff",
    height: "100vh",
    position: "fixed" as const,
    left: 0,
    top: 0,
    overflowY: "auto",
    transition: "0.3s",
    zIndex: 1000,
    boxShadow: "2px 0 10px rgba(0,0,0,0.3)"
  },

  collapsed: {
    width: "70px"
  },

  toggleBtn: {
    width: "100%",
    padding: "14px",
    background: "#16213e",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    borderBottom: "1px solid #2a2a4a",
    transition: "0.2s"
  },

  toggleBtnHover: {
    background: "#ff7a00",
    color: "#fff"
  },

  main: {
    padding: "12px 16px",
    margin: "6px 10px",
    background: "#16213e",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    fontWeight: "bold" as const,
    fontSize: "13px",
    color: "#e0e0e0",
    transition: "all 0.2s ease",
    letterSpacing: "0.5px",
    border: "1px solid transparent"
  },

  mainHover: {
    background: "#ff7a00",
    color: "#fff",
    border: "1px solid #ff7a00",
    transform: "translateX(3px)"
  },

  mainActive: {
    background: "#ff7a00",
    color: "#fff",
    border: "1px solid #ff7a00"
  },

  item: {
    padding: "8px 16px",
    margin: "2px 10px",
    cursor: "pointer",
    fontSize: "13px",
    borderRadius: "6px",
    color: "#bbb",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
    transition: "all 0.2s ease",
    paddingLeft: "28px"
  },

  itemHover: {
    background: "#ff7a00",
    color: "#fff",
    transform: "translateX(3px)"
  },

  itemActive: {
    background: "#ff7a00",
    color: "#fff"
  },

  icon: {
    fontSize: "16px",
    width: "24px",
    display: "inline-block"
  },

  content: {
    marginLeft: "280px",
    width: "100%",
    minHeight: "100vh",
    background: "#f0f2f5",
    transition: "0.3s"
  },

  contentCollapsed: {
    marginLeft: "70px"
  },

  badge: {
    background: "#ff7a00",
    color: "#fff",
    fontSize: "10px",
    padding: "2px 8px",
    borderRadius: "12px",
    marginLeft: "8px"
  },

  logo: {
    padding: "16px 20px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#fff",
    borderBottom: "1px solid #2a2a4a",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "10px"
  },

  logoIcon: {
    fontSize: "28px"
  },

  userInfo: {
    padding: "12px 16px",
    borderBottom: "1px solid #2a2a4a",
    marginBottom: "8px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "10px"
  },

  userAvatar: {
    fontSize: "32px",
    background: "#ff7a00",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const
  },

  userName: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#fff"
  },

  userRole: {
    fontSize: "11px",
    color: "#8ab3d8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px"
  },

  divider: {
    borderTop: "1px solid #2a2a4a",
    margin: "8px 16px"
  },

  logoutBtn: {
    margin: "12px 16px",
    padding: "10px",
    width: "calc(100% - 32px)",
    background: "transparent",
    border: "1px solid #e74c3c",
    color: "#e74c3c",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "0.2s",
    textAlign: "center" as const
  },

  logoutBtnHover: {
    background: "#e74c3c",
    color: "#fff"
  }
};

export default function Sidebar({ children, currentPath }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredMain, setHoveredMain] = useState(null);
  const [hoveredLogout, setHoveredLogout] = useState(false);

  const [open, setOpen] = useState({
    dashboards: true,
    calculators: true,
    boq: true
  });

  const toggle = (key: string) => {
    setOpen((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const go = (path: string) => {
    if (!path) return;
    router.push(path);
  };

  // ---------------- DASHBOARD ROLE ----------------
  const role = currentPath?.replace("-dashboard", "")?.replace("/", "") || "contractor";

  let dashboardName = "Dashboard";
  let dashboardIcon = "📊";
  if (role === "buyer") { dashboardName = "Buyer Dashboard"; dashboardIcon = "👤"; }
  else if (role === "supplier") { dashboardName = "Supplier Dashboard"; dashboardIcon = "📦"; }
  else if (role === "contractor") { dashboardName = "Contractor Dashboard"; dashboardIcon = "👷"; }
  else if (role === "admin") { dashboardName = "Admin Dashboard"; dashboardIcon = "👑"; }

  // ---------------- CALCULATORS ----------------
  const calculatorTabs = [
    { name: "Concrete Calculator", path: "/concrete-calculator", icon: "🧱" },
    { name: "Steel Calculator", path: "/steel-calculator", icon: "🔩" },
    { name: "Tile Calculator", path: "/tile-calculator", icon: "📐" },
    { name: "Paint Calculator", path: "/paint-calculator", icon: "🎨" },
    { name: "Plaster Calculator", path: "/plaster-calculator", icon: "🧱" },
    { name: "Brick Work", path: "/brick-work-calculator", icon: "🧱" },
    { name: "RCC Slab", path: "/rcc-slab-calculator", icon: "🏗️" },
    { name: "RCC + Steel + Blockwork", path: "/rcc-steel-building-calculator", icon: "🏢" },
    { name: "Column Calculator", path: "/column-calculator", icon: "📏" },
    { name: "Beam Calculator", path: "/beam-calculator", icon: "📐" },
    { name: "Footing Calculator", path: "/footing-calculator", icon: "🔽" },
    { name: "Staircase", path: "/staircase-calculator", icon: "🪜" },
    { name: "Water Tank", path: "/water-tank-calculator", icon: "💧" },
    { name: "Septic Tank", path: "/septic-tank-calculator", icon: "🪠" },
    { name: "Retaining Wall", path: "/retaining-wall-calculator", icon: "🧱" },
    { name: "Roof Truss", path: "/roof-truss-calculator", icon: "🏠" },
    { name: "Pile Foundation", path: "/pile-foundation-calculator", icon: "⛏️" },
    { name: "Lintel", path: "/lintel-calculator", icon: "📏" }
  ];

  // ---------------- BOQ ----------------
  const boqTabs = [
    { name: "Civil BOQ", path: "/boq-civil", icon: "📄" },
    { name: "Interior BOQ", path: "/boq-interior", icon: "🪑" },
    { name: "Plumbing BOQ", path: "/boq-plumbing", icon: "🔧" },
    { name: "Electrical BOQ", path: "/boq-electrical", icon: "⚡" },
    { name: "Painting BOQ", path: "/boq-painting", icon: "🎨" },
    { name: "False Ceiling BOQ", path: "/boq-false-ceiling", icon: "⬇️" }
  ];

  // ---------------- OTHER MODULES ----------------
  const otherTabs = [
    { name: "Marketplace", icon: "🛒", path: "/marketplace" },
    { name: "Admin Dashboard", icon: "👑", path: "/admin-dashboard" },
    { name: "DRG", icon: "📐", path: "/drg" },
    { name: "Layout Plans", icon: "🗺️", path: "/layout-plans" },
    { name: "Learn & Earn", icon: "📚", path: "/learn-earn" },
    { name: "Real Estate", icon: "🏠", path: "/realestate-dashboard" },
    { name: "Pricing", icon: "💰", path: "/pricing" }
  ];

  // ---------------- GET CURRENT USER ----------------
  const [mounted, setMounted] = useState(false);
const [userName, setUserName] = useState("Guest");
const [userRole, setUserRole] = useState("Contractor");
const [uniqueCode, setUniqueCode] = useState("");

useEffect(() => {
  setMounted(true);

  const storedName = localStorage.getItem("userName");
  const storedRole = localStorage.getItem("userRole");
  const storedCode = localStorage.getItem("uniqueCode");
  let sessionUser: any = null;
  try {
    sessionUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  } catch {}

  if (storedName || sessionUser?.name) setUserName(storedName || sessionUser.name);
  if (storedRole || sessionUser?.role) setUserRole(storedRole || sessionUser.role);
  if (storedCode || sessionUser?.uniqueCode) setUniqueCode(storedCode || sessionUser.uniqueCode);
}, []);

if (!mounted) {
  return null;
}

return (

  <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <div
        style={
          collapsed
            ? { ...styles.sidebar, ...styles.collapsed }
            : styles.sidebar
        }
      >
        {/* TOGGLE BUTTON */}
        <button
          style={styles.toggleBtn}
          onMouseEnter={() => setHoveredItem('toggle')}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "☰" : "◀"}
        </button>

        {/* LOGO */}
        {!collapsed && (
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🏗️</span>
            <span>BuildMitra</span>
          </div>
        )}

        {/* USER INFO */}
        {!collapsed && (
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>👤</div>
            <div>
              {uniqueCode && (
                <div style={{ fontSize: "11px", color: "#ffb366", marginBottom: "3px" }}>
                  {uniqueCode}
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(uniqueCode)}
                    style={{ marginLeft: "6px", padding: "1px 5px", fontSize: "9px", cursor: "pointer", borderRadius: "4px", border: 0 }}
                  >
                    Copy
                  </button>
                </div>
              )}
              <div style={styles.userName}>{userName}</div>
              <div style={styles.userRole}>{userRole.toUpperCase()}</div>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        <div
          className="main"
          style={styles.main}
          onMouseEnter={() => setHoveredMain('dashboards')}
          onMouseLeave={() => setHoveredMain(null)}
          onClick={() => toggle("dashboards")}
        >
          <span>📊 DASHBOARD</span>
          <span>{open.dashboards ? "▼" : "▶"}</span>
        </div>

        {open.dashboards && (
       <div
       className="item"
       style={styles.item}
       onClick={() => {
      if (userRole?.toLowerCase() === "buyer") {
        go("/buyer-dashboard");
      } else if (userRole?.toLowerCase() === "supplier") {
        go("/supplier-dashboard");
      } else if (userRole?.toLowerCase() === "admin") {
        go("/admin-dashboard");
      } else {
        go("/contractor-dashboard");
      }
    }}
  >
    {dashboardIcon} {dashboardName}
  </div>
)}

        {/* OTHER MODULES */}
        {otherTabs.map((o, i) => (
          <div
            key={i}
            className="item"
            style={styles.item}
            onClick={() => go(o.path)}
          >
            {o.icon} {o.name}
          </div>
        ))}

        {/* CALCULATORS */}
        <div
          className="main"
          style={styles.main}
          onMouseEnter={() => setHoveredMain('calculators')}
          onMouseLeave={() => setHoveredMain(null)}
          onClick={() => toggle("calculators")}
        >
          <span>📐 CALCULATORS (19)</span>
          <span>{open.calculators ? "▼" : "▶"}</span>
        </div>

        {open.calculators &&
          calculatorTabs.map((c, i) => (
            <div
              key={i}
              className="item"
              style={styles.item}
              onClick={() => go(c.path)}
            >
              {c.icon} {c.name}
            </div>
          ))}

        {/* BOQ */}
        <div
          className="main"
          style={styles.main}
          onMouseEnter={() => setHoveredMain('boq')}
          onMouseLeave={() => setHoveredMain(null)}
          onClick={() => toggle("boq")}
        >
          <span>📋 BOQ MODULES (6)</span>
          <span>{open.boq ? "▼" : "▶"}</span>
        </div>

        {open.boq &&
          boqTabs.map((b, i) => (
            <div
              key={i}
              className="item"
              style={styles.item}
              onClick={() => go(b.path)}
            >
              {b.icon} {b.name}
            </div>
          ))}

        {/* DIVIDER */}
        {!collapsed && <div style={styles.divider}></div>}

        {/* LOGOUT */}
        {!collapsed && (
          <button
            style={styles.logoutBtn}
            onMouseEnter={() => setHoveredLogout(true)}
            onMouseLeave={() => setHoveredLogout(false)}
            onClick={() => {
              clearBuildMitraSession();
              router.push("/login");
            }}
          >
            🚪 Logout
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div
        style={
          collapsed
            ? { ...styles.content, ...styles.contentCollapsed }
            : styles.content
        }
      >
        {children}
      </div>
    </div>
  );
}




