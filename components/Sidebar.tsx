import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { clearBuildMitraSession, getBuildMitraUser } from "../utils/session";

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

export const mainNavigationItems = [
  { name: "Marketplace", icon: "🛒", path: "/marketplace" },
  { name: "DRG", icon: "📐", path: "/drg" },
  { name: "Pre Floor Plan DRG", icon: "🏠", path: "/pre-floor-plan-drg" },
  { name: "Layout Plans", icon: "🗺️", path: "/layout-plans" },
  { name: "Learn & Earn", icon: "📚", path: "/learn-earn" },
  { name: "Real Estate Hub", icon: "🏘️", path: "/realestate-hub" },
  { name: "Pricing", icon: "💰", path: "/pricing" },
  { name: "Electrical & Utility", icon: "⚡", path: "/electrical", badge: "NEW" },
  { name: "Housing Loan Finance", icon: "🏦", path: "/subscription" },
  { name: "Live Rates", icon: "📈", path: "/live-rates" },
  { name: "Reports Hub", icon: "📑", path: "/reports" }
];

export default function Sidebar({ children, currentPath }: { children?: any; currentPath?: any }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredMain, setHoveredMain] = useState(null);
  const [hoveredLogout, setHoveredLogout] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
  else if (role === "realestate") { dashboardName = "Real Estate Dashboard";dashboardIcon = "🏢"; }
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
    { name: "Lintel", path: "/lintel-calculator", icon: "📏" },
    { name: "Land Survey Calculator", path: "/plot-layout", icon: "🗺️" },
    { name: "Housing Loan Finance", path: "/subscription", icon: "🏦" }
  ];

  // ---------------- BOQ ----------------
  const boqTabs = [
    { name: "Waterproofing BOQ", path: "/boq-waterproofing", icon: "💧" },
    { name: "Civil BOQ", path: "/boq-civil", icon: "📄" },
    { name: "Interior BOQ", path: "/boq-interior", icon: "🪑" },
    { name: "Plumbing BOQ", path: "/boq-plumbing", icon: "🔧" },
    { name: "Electrical & Utility", path: "/electrical", icon: "⚡", badge: "NEW" },
    { name: "Painting BOQ", path: "/boq-painting", icon: "🎨" },
    { name: "False Ceiling BOQ", path: "/boq-false-ceiling", icon: "⬇️" }
  ];

  // ---------------- OTHER MODULES ----------------
  const otherTabs = mainNavigationItems;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia("(max-width: 1024px)").matches;
      setIsMobile(mobile);
      if (mobile && !currentPath?.includes("dashboard")) {
        setShowMobileMenu(false);
      }
      if (mobile && currentPath?.includes("dashboard")) {
        setShowMobileMenu(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [currentPath]);

  // ---------------- GET CURRENT USER ----------------
  const [mounted, setMounted] = useState(false);
const [userName, setUserName] = useState("Guest");
const [userRole, setUserRole] = useState("Contractor");
const [uniqueCode, setUniqueCode] = useState("");

useEffect(() => {
  setMounted(true);

  const storedName = sessionStorage.getItem("userName");
  const storedRole = sessionStorage.getItem("userRole");
  const storedCode = sessionStorage.getItem("uniqueCode");
  let sessionUser: any = null;
  try {
    sessionUser = getBuildMitraUser();
  } catch {}

  if (storedName || sessionUser?.name) setUserName(storedName || sessionUser.name);
  if (storedRole || sessionUser?.businessRole || sessionUser?.role) setUserRole(storedRole || sessionUser.businessRole || sessionUser.role);
  if (storedCode || sessionUser?.userCode || sessionUser?.uniqueCode) setUniqueCode(storedCode || sessionUser.userCode || sessionUser.uniqueCode);
}, []);

if (!mounted) {
  return null;
}

const mobileDashboardPath =
  userRole?.toLowerCase() === "buyer" ? "/buyer-dashboard" :
  userRole?.toLowerCase() === "supplier" ? "/supplier-dashboard" :
  userRole?.toLowerCase() === "admin" ? "/admin-dashboard" :
  userRole?.toLowerCase() === "realestate" ? "/realestate-dashboard" :
  ["machinehire", "machinery", "equipment"].includes(userRole?.toLowerCase()) ? "/machinehire-dashboard" :
  ["laboursupply", "labour"].includes(userRole?.toLowerCase()) ? "/laboursupply-dashboard" :
  "/contractor-dashboard";

const mobileTabs = [
  {
    name: "Electrical & Utility",
    icon: "⚡",
    path: "/electrical",
  },
  {
    name: "Pricing",
    icon: "💰",
    path: "/pricing",
  },
  {
    name: "Floor Plan",
    icon: "🏠",
    path: "/pre-floor-plan-drg",
  },
  {
    name: dashboardName,
    icon: dashboardIcon,
    path: `${mobileDashboardPath}?mobileModule=1`
  },
  ...otherTabs,
  ...calculatorTabs,
  ...boqTabs
];

const showMobileGrid =
  Boolean(currentPath?.includes("dashboard")) &&
  router.query.mobileModule !== "1";

const handleMobileBack = () => {
  router.push(mobileDashboardPath);
};

if (isMobile) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      width: "100%"
    }}>
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "#1a1a2e",
        color: "#ffffff",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 10px rgba(0,0,0,0.18)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              border: 0,
              borderRadius: 6,
              padding: "6px 10px",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            {showMobileMenu ? "✕ Close" : "☰ Menu"}
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>🏗️ BuildMitra</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>
              Build Smarter. Save Bigger.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showMobileGrid) {
              clearBuildMitraSession();
              router.push("/login");
            } else {
              handleMobileBack();
            }
          }}
          style={{
            border: 0,
            borderRadius: 8,
            padding: "8px 10px",
            background: showMobileGrid ? "#ef4444" : "#ffffff",
            color: showMobileGrid ? "#ffffff" : "#1a1a2e",
            fontWeight: 800
          }}
        >
          {showMobileGrid ? "Logout" : "← Back"}
        </button>
      </div>

      {showMobileMenu && (
        <div style={{
          position: "fixed",
          top: 54,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          background: "#1a1a2e",
          color: "#ffffff",
          overflowY: "auto",
          padding: "16px"
        }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#ff7a00", marginBottom: 10 }}>⚡ UTILITIES & MODULES</div>
          {otherTabs.map((o: any, i) => (
            <div
              key={i}
              onClick={() => {
                setShowMobileMenu(false);
                go(o.path);
              }}
              style={{
                padding: "12px 14px",
                margin: "4px 0",
                borderRadius: "8px",
                background: currentPath === o.path ? "#ff7a00" : "#16213e",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "13px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }}
            >
              <span>{o.icon} {o.name}</span>
              {o.badge && <span style={{ background: "#ff7a00", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "10px" }}>{o.badge}</span>}
            </div>
          ))}

          <div style={{ fontSize: 13, fontWeight: 900, color: "#38bdf8", marginTop: 18, marginBottom: 10 }}>📋 BOQ MODULES</div>
          {boqTabs.map((b: any, i) => (
            <div
              key={i}
              onClick={() => {
                setShowMobileMenu(false);
                go(b.path);
              }}
              style={{
                padding: "12px 14px",
                margin: "4px 0",
                borderRadius: "8px",
                background: currentPath === b.path ? "#ff7a00" : "#16213e",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "13px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }}
            >
              <span>{b.icon} {b.name}</span>
              {b.badge && <span style={{ background: "#ff7a00", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "10px" }}>{b.badge}</span>}
            </div>
          ))}
        </div>
      )}

      {showMobileGrid ? (
        <div style={{
          padding: "12px",
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "10px"
          }}>
            {mobileTabs.map((tab, i) => (
              <button
                key={`${tab.path}-${i}`}
                type="button"
                onClick={() => go(tab.path)}
                style={{
                  minHeight: "82px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  background: "#ffffff",
                  padding: "9px 5px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  color: "#111827",
                  cursor: "pointer",
                  boxShadow: "0 2px 7px rgba(0,0,0,0.06)"
                }}
              >
                <span style={{ fontSize: "25px", lineHeight: 1 }}>
                  {tab.icon}
                </span>

                <span style={{
                  fontSize: "10px",
                  lineHeight: 1.15,
                  fontWeight: 800,
                  textAlign: "center",
                  overflowWrap: "anywhere"
                }}>
                  {tab.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <main style={{
          width: "100%",
          minWidth: 0,
          minHeight: "calc(100vh - 70px)",
          overflowX: "hidden"
        }}>
          {children}
        </main>
      )}
    </div>
  );
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
          <>
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
                } else if (userRole?.toLowerCase() === "realestate") {
                  go("/realestate-dashboard");
                } else if (["machinehire", "machinery", "equipment"].includes(userRole?.toLowerCase())) {
                  go("/machinehire-dashboard");
                } else if (["laboursupply", "labour"].includes(userRole?.toLowerCase())) {
                  go("/laboursupply-dashboard");
                } else {
                  go("/contractor-dashboard");
                }
              }}
            >
              {dashboardIcon} {dashboardName}
            </div>

            {otherTabs.map((o: any, i) => {
              const isActive = currentPath === o.path || (o.path !== '/' && Boolean(currentPath?.startsWith(o.path)));
              const isHovered = hoveredItem === `other-${i}`;
              return (
                <div
                  key={i}
                  className="item"
                  style={{
                    ...styles.item,
                    ...(isActive ? styles.itemActive : {}),
                    ...(isHovered && !isActive ? styles.itemHover : {}),
                  }}
                  onMouseEnter={() => setHoveredItem(`other-${i}` as any)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => go(o.path)}
                >
                  <span>{o.icon} {o.name}</span>
                  {o.badge && <span style={styles.badge}>{o.badge}</span>}
                </div>
              );
            })}
          </>
        )}

        {/* STANDALONE SEPARATE ELECTRICAL & UTILITY TAB */}
        {(() => {
          const isElectricalActive = currentPath === "/electrical" || currentPath?.startsWith("/electrical");
          const isHovered = hoveredMain === 'electrical-standalone';
          return (
            <div
              className="main"
              style={{
                ...styles.main,
                background: isElectricalActive ? "#ff7a00" : "#16213e",
                color: "#ffffff",
                fontWeight: "bold",
                ...(isHovered && !isElectricalActive ? styles.mainHover : {})
              }}
              onMouseEnter={() => setHoveredMain('electrical-standalone' as any)}
              onMouseLeave={() => setHoveredMain(null)}
              onClick={() => go("/electrical")}
            >
              <span>⚡ ELECTRICAL & UTILITY</span>
              <span style={{ background: "#ff7a00", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "10px" }}>NEW</span>
            </div>
          );
        })()}

        {/* CALCULATORS */}
        <div
          className="main"
          style={{
            ...styles.main,
            ...(hoveredMain === 'calculators' ? styles.mainHover : {})
          }}
          onMouseEnter={() => setHoveredMain('calculators' as any)}
          onMouseLeave={() => setHoveredMain(null)}
          onClick={() => toggle("calculators")}
        >
          <span>📐 CALCULATORS (19)</span>
          <span>{open.calculators ? "▼" : "▶"}</span>
        </div>

        {open.calculators &&
          calculatorTabs.map((c, i) => {
            const isActive = currentPath === c.path || (c.path !== '/' && Boolean(currentPath?.startsWith(c.path)));
            const isHovered = hoveredItem === `calc-${i}`;
            return (
              <div
                key={i}
                className="item"
                style={{
                  ...styles.item,
                  ...(isActive ? styles.itemActive : {}),
                  ...(isHovered && !isActive ? styles.itemHover : {}),
                }}
                onMouseEnter={() => setHoveredItem(`calc-${i}` as any)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => go(c.path)}
              >
                {c.icon} {c.name}
              </div>
            );
          })}

        {/* BOQ */}
        <div
          className="main"
          style={{
            ...styles.main,
            ...(hoveredMain === 'boq' ? styles.mainHover : {})
          }}
          onMouseEnter={() => setHoveredMain('boq' as any)}
          onMouseLeave={() => setHoveredMain(null)}
          onClick={() => toggle("boq")}
        >
          <span>📋 BOQ MODULES (7)</span>
          <span>{open.boq ? "▼" : "▶"}</span>
        </div>

        {open.boq &&
          boqTabs.map((b: any, i) => {
            const isActive = currentPath === b.path || (b.path !== '/' && Boolean(currentPath?.startsWith(b.path)));
            const isHovered = hoveredItem === `boq-${i}`;
            return (
              <div
                key={i}
                className="item"
                style={{
                  ...styles.item,
                  ...(isActive ? styles.itemActive : {}),
                  ...(isHovered && !isActive ? styles.itemHover : {}),
                }}
                onMouseEnter={() => setHoveredItem(`boq-${i}` as any)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => go(b.path)}
              >
                <span>{b.icon} {b.name}</span>
                {b.badge && <span style={styles.badge}>{b.badge}</span>}
              </div>
            );
          })}

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




















