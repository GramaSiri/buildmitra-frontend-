import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => 
    location.pathname === path 
      ? "bg-sky-600 text-white shadow-lg shadow-sky-900/40 font-semibold" 
      : "text-slate-300 hover:bg-slate-800/80 hover:text-white";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* MOBILE TOP NAVIGATION HEADER */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="text-slate-300 hover:text-white text-2xl focus:outline-none p-1 transition"
            aria-label="Toggle Mobile Navigation"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="bg-sky-600 text-white font-black px-2 py-0.5 rounded text-xs">BM</span>
            <h1 className="text-lg font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              BuildMitra Pro
            </h1>
          </div>
        </div>
        <span className="text-xs bg-sky-950 text-sky-400 border border-sky-800 px-3 py-1 rounded-full font-bold">
          ERP Live
        </span>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* SIDEBAR NAVIGATION (Desktop Fixed & Mobile Slide-Out Drawer) */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${mobileMenuOpen ? "translate-x-0 pt-16 lg:pt-0" : "-translate-x-full"}
        `}>
          <div className="p-6 border-b border-slate-800 hidden lg:block">
            <div className="flex items-center gap-2.5">
              <span className="bg-sky-600 text-white font-black px-2.5 py-1 rounded text-sm shadow">BM</span>
              <h1 className="text-2xl font-black bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                BuildMitra
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Professional Construction ERP</p>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {/* Core Portals */}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">Portals</p>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/")}`}>📊 Vendor Dashboard</Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/admin")}`}>👑 Admin Panel</Link>
            <Link to="/innovations" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/innovations")}`}>🚀 Innovations</Link>
            <Link to="/daily-tracker" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/daily-tracker")}`}>📋 Milestone Tracker</Link>
            <Link to="/inventory" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/inventory")}`}>📦 Inventory</Link>

            {/* Drawing & Design */}
            <div className="pt-3 mt-3 border-t border-slate-800">
              <p className="text-xs font-bold text-sky-400 mb-2 px-3 uppercase tracking-wider">Drawing & Design</p>
            </div>
            <Link to="/auto-drg" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/auto-drg")}`}>📐 Auto DRG Studio</Link>
            <Link to="/layout-drawing" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/layout-drawing")}`}>🗺️ Layout Drawing</Link>
            <Link to="/2d-floorplan" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/2d-floorplan")}`}>🏠 2D Floor Plan</Link>

            {/* BOQ Estimators */}
            <div className="pt-3 mt-3 border-t border-slate-800">
              <p className="text-xs font-bold text-sky-400 mb-2 px-3 uppercase tracking-wider">BOQ Estimators</p>
            </div>
            <Link to="/civil-boq" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/civil-boq")}`}>🏛️ Civil BOQ</Link>
            <Link to="/electrical-boq" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/electrical-boq")}`}>⚡ Electrical BOQ</Link>
            <Link to="/plumbing-boq" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/plumbing-boq")}`}>🚿 Plumbing BOQ</Link>
            <Link to="/interior-boq" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/interior-boq")}`}>🎨 Interior BOQ</Link>
            <Link to="/peb-boq" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/peb-boq")}`}>🏗️ PEB BOQ</Link>
            <Link to="/paint-boq" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/paint-boq")}`}>🖌️ Paint BOQ</Link>

            {/* Material Calculators */}
            <div className="pt-3 mt-3 border-t border-slate-800">
              <p className="text-xs font-bold text-sky-400 mb-2 px-3 uppercase tracking-wider">Material Calculators</p>
            </div>
            <Link to="/staircase-calc" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/staircase-calc")}`}>🌀 Staircase Calc</Link>
            <Link to="/paint-calc" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/paint-calc")}`}>🎨 Paint Calc</Link>
            <Link to="/earthwork-calc" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/earthwork-calc")}`}>⛰️ Earthwork Calc</Link>
            <Link to="/rcc-steel-calc" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/rcc-steel-calc")}`}>🧱 RCC & Steel Calc</Link>
            <Link to="/wall-masonry-calc" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/wall-masonry-calc")}`}>🧱 Wall Masonry</Link>
            <Link to="/flooring-calc" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/flooring-calc")}`}>🪵 Flooring Calculator</Link>
            <Link to="/doors-windows-calc" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/doors-windows-calc")}`}>🚪 Doors & Windows</Link>

            {/* Daily Hubs */}
            <div className="pt-3 mt-3 border-t border-slate-800">
              <p className="text-xs font-bold text-sky-400 mb-2 px-3 uppercase tracking-wider">Daily Hubs</p>
            </div>
            <Link to="/daily-hub1" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/daily-hub1")}`}>📅 Daily Hub v1</Link>
            <Link to="/daily-hub2" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/daily-hub2")}`}>📅 Daily Hub v2</Link>
          </nav>

          <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center bg-slate-900/50">
            © BuildMitra 2026 • Bengaluru
          </div>
        </aside>

        {/* MOBILE BACKDROP OVERLAY */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)} 
            className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
