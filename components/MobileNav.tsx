import React, { useState } from "react";

interface MobileNavProps {
  currentModule: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  tabs?: { id: string; name: string; icon?: string; count?: number }[];
  onLogout?: () => void;
  title?: string;
  subtitle?: string;
}

export const MODULES = [
  { id: "buyer", name: "Buyer / Owner", icon: "🏠", path: "/buyer-dashboard" },
  { id: "supplier", name: "Supplier", icon: "📦", path: "/supplier-dashboard" },
  { id: "vendor", name: "Contractor", icon: "🏗️", path: "/vendor-dashboard" },
  { id: "labour", name: "Labour Net", icon: "👷", path: "/laboursupply-dashboard" },
  { id: "machine", name: "Machine Hire", icon: "🚜", path: "/machinehire-dashboard" },
  { id: "realestate", name: "Real Estate", icon: "🏡", path: "/realestate-dashboard" },
  { id: "marketplace", name: "Marketplace", icon: "🛒", path: "/marketplace" },
  { id: "admin", name: "Admin", icon: "👑", path: "/admin-dashboard" }
];

export default function MobileNav({
  currentModule,
  activeTab,
  setActiveTab,
  tabs = [],
  onLogout,
  title,
  subtitle
}: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const currentModObj = MODULES.find((m) => m.id === currentModule) || {
    id: currentModule,
    name: title || "Dashboard",
    icon: "🏗️",
    path: "#"
  };

  const handleModuleClick = (path: string) => {
    setMenuOpen(false);
    if (path && path !== "#") {
      window.location.href = path;
    }
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      if (confirm("Are you sure you want to logout?")) {
        window.location.href = "/";
      }
    }
  };

  return (
    <header className="bm-nav-wrapper">
      {/* Top Header Bar - Fix Only Logo across all DBs */}
      <div className="bm-header-bar">
        <div className="bm-header-left" onClick={() => (window.location.href = "/")}>
          <img
            src="/logo.png"
            alt="BuildMitra Logo"
            style={{ height: "32px", width: "auto", objectFit: "contain", borderRadius: "4px", backgroundColor: "#fff", padding: "2px" }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="bm-brand-text">
            <span className="bm-brand-title">BuildMitra</span>
            <span className="bm-module-badge">{currentModObj.name}</span>
          </div>
        </div>

        <div className="bm-header-right">
          <button
            className="bm-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            {menuOpen ? "✕" : "☰ Grid Menu"}
          </button>
          <button className="bm-logout-btn desktop-only" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Subtitle & Mobile Module Grid Menu */}
      {menuOpen && (
        <div className="bm-mobile-drawer">
          <div className="bm-drawer-header">
            <span>Select Module / App</span>
            <button className="bm-close-btn" onClick={() => setMenuOpen(false)}>
              ✕
            </button>
          </div>
          <div className="bm-icon-grid">
            {MODULES.map((mod) => {
              const isActive = mod.id === currentModule;
              return (
                <div
                  key={mod.id}
                  className={`bm-icon-card ${isActive ? "active" : ""}`}
                  onClick={() => handleModuleClick(mod.path)}
                >
                  <span className="bm-icon-emoji">{mod.icon}</span>
                  <span className="bm-icon-label">{mod.name}</span>
                </div>
              );
            })}
          </div>
          <div className="bm-drawer-footer">
            <button className="bm-drawer-logout" onClick={handleLogoutClick}>
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile Icon Bar */}
      <div className="bm-quick-icon-bar">
        {MODULES.map((mod) => {
          const isActive = mod.id === currentModule;
          return (
            <button
              key={mod.id}
              className={`bm-quick-icon-btn ${isActive ? "active" : ""}`}
              onClick={() => handleModuleClick(mod.path)}
              title={mod.name}
            >
              <span className="bm-quick-emoji">{mod.icon}</span>
              <span className="bm-quick-label">{mod.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Category / Sub-Tab Navigation Bar */}
      {tabs.length > 0 && (
        <nav className="bm-tab-bar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`bm-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab && setActiveTab(tab.id)}
              >
                {tab.icon && <span className="bm-tab-icon">{tab.icon}</span>}
                <span>{tab.name}</span>
                {tab.count !== undefined && <span className="bm-tab-badge">{tab.count}</span>}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
