import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'bg-primary text-white shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white';
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-dark text-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-gray-700"><h1 className="text-2xl font-black text-primary">BuildMitra</h1><p className="text-xs text-gray-400">Construction ERP</p></div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/')}`}>📊 Vendor Dashboard</Link>
          <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin')}`}>👑 Admin Panel</Link>
          <Link to="/innovations" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/innovations')}`}>🚀 Innovations</Link>
          <Link to="/daily-tracker" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/daily-tracker')}`}>📋 Milestone Tracker</Link>
          <Link to="/inventory" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/inventory')}`}>📦 Inventory</Link>
          <div className="pt-2 mt-2 border-t border-gray-700"><p className="text-xs text-gray-500 mb-2 px-2">📐 DRAWING & DESIGN</p></div>
          <Link to="/auto-drg" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/auto-drg')}`}>📐 Auto DRG</Link>
          <Link to="/layout-drawing" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/layout-drawing')}`}>📏 Layout Drawing</Link>
          <Link to="/2d-floorplan" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/2d-floorplan')}`}>📐 2D Floor Plan</Link>
          <div className="pt-2 mt-2 border-t border-gray-700"><p className="text-xs text-gray-500 mb-2 px-2">📋 BOQs</p></div>
          <Link to="/civil-boq" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/civil-boq')}`}>🏗️ Civil BOQ</Link>
          <Link to="/electrical-boq" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/electrical-boq')}`}>⚡ Electrical BOQ</Link>
          <Link to="/plumbing-boq" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/plumbing-boq')}`}>🚰 Plumbing BOQ</Link>
          <Link to="/interior-boq" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/interior-boq')}`}>🎨 Interior BOQ</Link>
          <Link to="/peb-boq" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/peb-boq')}`}>🏭 PEB BOQ</Link>
          <Link to="/paint-boq" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/paint-boq')}`}>🎨 Paint BOQ</Link>
          <div className="pt-2 mt-2 border-t border-gray-700"><p className="text-xs text-gray-500 mb-2 px-2">🧮 MATERIAL CALCULATOR</p></div>
          <Link to="/staircase-calc" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/staircase-calc')}`}>🪜 Staircase Calc</Link>
          <Link to="/paint-calc" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/paint-calc')}`}>🎨 Paint Calc</Link>
          <Link to="/earthwork-calc" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/earthwork-calc')}`}>⛏️ Earthwork Calc</Link>
          <Link to="/rcc-steel-calc" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/rcc-steel-calc')}`}>🧱 RCC & Steel Calc</Link>
          <Link to="/wall-masonry-calc" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/wall-masonry-calc')}`}>🧱 Wall Masonry</Link>
          <Link to="/flooring-calc" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/flooring-calc')}`}>🏠 Flooring Calculator</Link>
          <Link to="/doors-windows-calc" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/doors-windows-calc')}`}>🚪 Doors & Windows</Link>
          <div className="pt-2 mt-2 border-t border-gray-700"><p className="text-xs text-gray-500 mb-2 px-2">📅 DAILY HUBS</p></div>
          <Link to="/daily-hub1" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/daily-hub1')}`}>📅 Daily Hub v1</Link>
          <Link to="/daily-hub2" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/daily-hub2')}`}>📅 Daily Hub v2</Link>
        </nav>
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">© BuildMitra 2026</div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
};
export default Layout;