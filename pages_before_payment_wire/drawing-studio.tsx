import React, { useState } from "react";

export default function DRGPage() {
  const [activeTab, setActiveTab] = useState("ground");
  
  // Design Grid Constants matching your 30x40 blueprint dimensions exactly
  const scale = 16; 
  const canvasW = 30 * scale; // 480px
  const canvasH = 40 * scale; // 640px
  
  // Professional Styling Guidelines
  const styles = {
    page: { padding: "24px", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" },
    header: { marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" },
    tabBar: { display: "flex", gap: "10px", marginBottom: "20px" },
    tabButton: (isActive) => ({
      padding: "10px 20px",
      backgroundColor: isActive ? "#1a5f7a" : "#fff",
      color: isActive ? "#fff" : "#1a5f7a",
      border: "1px solid #1a5f7a",
      borderRadius: "6px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "all 0.2s"
    }),
    layoutContainer: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" },
    canvasCard: { backgroundColor: "#ffffff", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" },
    sidebarCard: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" },
    specTable: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
    specRow: { borderBottom: "1px solid #f1f5f9" },
    specCellLabel: { padding: "10px 0", fontWeight: "600", color: "#475569" },
    specCellValue: { padding: "10px 0", textAlign: "right", fontWeight: "700", color: "#0f172a" }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px" }}>📐 BuildMitra Blueprint Generation Studio</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>High-fidelity 2D CAD architectural plans and front structural elevation drawings.</p>
      </div>

      {/* Blueprint Navigation Tab Bars */}
      <div style={styles.tabBar}>
        <button style={styles.tabButton(activeTab === "ground")} onClick={() => setActiveTab("ground")}>Ground Floor Plan</button>
        <button style={styles.tabButton(activeTab === "first")} onClick={() => setActiveTab("first")}>First Floor Plan</button>
        <button style={styles.tabButton(activeTab === "second")} onClick={() => setActiveTab("second")}>Second Floor Plan</button>
        <button style={styles.tabButton(activeTab === "elevation")} onClick={() => setActiveTab("elevation")}>Front Modern Elevation</button>
      </div>

      <div style={styles.layoutContainer}>
        {/* Dynamic Canvas Area */}
        <div style={styles.canvasCard}>
          {activeTab === "ground" && (
            <div>
              <h3 style={{ margin: "0 0 12px 0", color: "#1a5f7a" }}>1. Ground Floor Plan (Parking Layout)</h3>
              <svg width="100%" viewBox="-40 -20 560 700" style={{ background: "#f8fafc", borderRadius: "8px" }}>
                {/* Outer Compound Walls */}
                <rect x="0" y="0" width={canvasW} height={canvasH} fill="#ffffff" stroke="#000000" strokeWidth="3" />
                
                {/* 4 Car Bays Layout Paths */}
                {[0, 1, 2].map((i) => (
                  <g key={`car-${i}`} transform={`translate(${20 + i * 90}, 20)`}>
                    <rect x="0" y="0" width="70" height="130" rx="8" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="22" y="70" fontSize="18" opacity="0.3">🚘</text>
                  </g>
                ))}
                <g transform={`translate(20, 360)`}>
                  <rect x="0" y="0" width="70" height="130" rx="8" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="22" y="70" fontSize="18" opacity="0.3">🚘</text>
                </g>

                {/* Bike Parking Bays */}
                {[0, 1, 2].map((i) => (
                  <text key={`bike-${i}`} x={220 + i * 45} y={430} fontSize="22" opacity="0.4">🏍️</text>
                ))}
                <text x="330" y="90" fontSize="22" opacity="0.4">🏍️</text>

                {/* Structural Staircase Center Right Block */}
                <g transform={`translate(340, 240)`}>
                  <rect x="0" y="0" width="140" height="120" fill="none" stroke="#000" strokeWidth="2.5" />
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line key={i} x1="0" y1={i * 15} x2="70" y2={i * 15} stroke="#000" strokeWidth="1" />
                  ))}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line key={i} x1="70" y1={i * 15} x2="140" y2={i * 15} stroke="#000" strokeWidth="1" />
                  ))}
                  <line x1="70" y1="0" x2="70" y2="120" stroke="#000" strokeWidth="1.5" />
                  <text x="45" y="65" fontSize="10" fontWeight="bold">STAIRWELL UP</text>
                </g>

                {/* Lift Box Block */}
                <g transform={`translate(380, 140)`}>
                  <rect x="0" y="0" width="100" height="70" fill="#f1f5f9" stroke="#000" strokeWidth="2.5" />
                  <text x="35" y="40" fontSize="12" fontWeight="bold">LIFT</text>
                  <text x="32" y="55" fontSize="9" fill="#64748b">3' × 4'</text>
                </g>

                {/* Top Corner Toilet Block */}
                <g transform={`translate(380, 20)`}>
                  <rect x="0" y="0" width="100" height="90" fill="none" stroke="#000" strokeWidth="2.5" />
                  <text x="15" y="35" fontSize="11" fontWeight="bold">TOILET 1</text>
                  <text x="15" y="50" fontSize="9" fill="#64748b">4' × 6'</text>
                </g>

                {/* Bottom Toilet Block */}
                <g transform={`translate(380, 390)`}>
                  <rect x="0" y="0" width="100" height="90" fill="none" stroke="#000" strokeWidth="2.5" />
                  <text x="15" y="35" fontSize="11" fontWeight="bold">TOILET 1</text>
                  <text x="15" y="50" fontSize="9" fill="#64748b">4' × 6'</text>
                </g>

                {/* Underground Water Tank Block */}
                <g transform={`translate(340, 500)`}>
                  <rect x="0" y="0" width="140" height="110" fill="none" stroke="#475569" strokeDasharray="4 4" strokeWidth="2" />
                  <text x="30" y="55" fontSize="12" fontWeight="bold" fill="#475569">UG TANK</text>
                  <text x="35" y="70" fontSize="10" fill="#64748b">appr. 6' × 8'</text>
                </g>

                {/* Main Compound Entry Sliding Gates */}
                <g transform={`translate(100, 625)`}>
                  <rect x="0" y="0" width="280" height="15" fill="#e2e8f0" stroke="#000" strokeWidth="2" />
                  <line x1="140" y1="0" x2="140" y2="15" stroke="#000" strokeWidth="2" />
                  <text x="90" y="12" fontSize="10" fontWeight="bold">MAIN SLIDING GATE</text>
                </g>

                {/* Boundary Dimension Rules Labels */}
                <text x="210" y="-8" fontSize="12" fontWeight="bold">30'0"</text>
                <text x="-35" y="320" fontSize="12" fontWeight="bold" transform="rotate(-90 -35 320)">40'0"</text>
              </svg>
            </div>
          )}

          {activeTab === "first" && (
            <div>
              <h3 style={{ margin: "0 0 12px 0", color: "#1a5f7a" }}>2. First Floor Plan (Residential Unit)</h3>
              <svg width="100%" viewBox="-40 -20 560 700" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                {/* Outer Framing walls */}
                <rect x="0" y="0" width={canvasW} height={canvasH} fill="none" stroke="#000" strokeWidth="3" />

                {/* Master Bedroom 1 Block (Top Left) */}
                <g transform={`translate(20, 20)`}>
                  <rect x="0" y="0" width="170" height="210" fill="none" stroke="#000" strokeWidth="2.5" />
                  <text x="20" y="40" fontSize="13" fontWeight="bold">BEDROOM 1</text>
                  <text x="20" y="60" fontSize="11" fill="#64748b">12' × 14'</text>
                  {/* Bed Outline */}
                  <rect x="110" y="80" width="50" height="60" fill="none" stroke="#94a3b8" />
                </g>

                {/* Living Room Area (Bottom Left) */}
                <g transform={`translate(20, 260)`}>
                  <rect x="0" y="0" width="200" height="320" fill="none" stroke="#000" strokeWidth="2.5" />
                  <text x="30" y="50" fontSize="14" fontWeight="bold">LIVING ROOM</text>
                  <text x="30" y="70" fontSize="11" fill="#64748b">14' × 20'</text>
                  {/* Sofa Set Layout */}
                  <rect x="20" y="140" width="30" height="120" fill="none" stroke="#94a3b8" />
                </g>

                {/* Vastu Kitchen Area (Top Center/Right) */}
                <g transform={`translate(240, 20)`}>
                  <rect x="0" y="0" width="150" height="170" fill="none" stroke="#000" strokeWidth="2.5" />
                  <text x="20" y="40" fontSize="13" fontWeight="bold">KITCHEN</text>
                  <text x="20" y="60" fontSize="11" fill="#64748b">10' × 10'</text>
                  {/* Kitchen L-Counter platform */}
                  <path d="M 0,130 L 120,130 L 120,0" fill="none" stroke="#64748b" strokeWidth="12" />
                </g>

                {/* Central Open Dining Hall Area */}
                <g transform={`translate(240, 210)`}>
                  <text x="40" y="60" fontSize="14" fontWeight="bold">DINING AREA</text>
                  <text x="55" y="80" fontSize="11" fill="#64748b">10' × 12'</text>
                </g>

                {/* Front Balcony Extension Deck */}
                <rect x="20" y="600" width="200" height="40" fill="#f8fafc" stroke="#000" strokeWidth="1.5" />
                <text x="80" y="624" fontSize="11" fontWeight="bold">BALCONY (4' Wide)</text>

                {/* Door Arc Indicators */}
                <path d="M 190,190 A 30 30 0 0 1 220,220" fill="none" stroke="#b91c1c" strokeWidth="2" strokeDasharray="2 2" />
                <line x1="190" y1="190" x2="190" y2="220" stroke="#b91c1c" strokeWidth="2" />
              </svg>
            </div>
          )}

          {activeTab === "second" && (
            <div>
              <h3 style={{ margin: "0 0 12px 0", color: "#1a5f7a" }}>3. Second Floor Plan Layout</h3>
              <svg width="100%" viewBox="-40 -20 560 700" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                <rect x="0" y="0" width={canvasW} height={canvasH} fill="none" stroke="#000" strokeWidth="3" />
                
                {/* Multi Room Structural Grid Partition Blocks */}
                <g transform={`translate(20, 20)`}>
                  <rect x="0" y="0" width="160" height="190" fill="none" stroke="#000" strokeWidth="2.5" />
                  <text x="20" y="40" fontSize="13" fontWeight="bold">BEDROOM 2</text>
                  <text x="20" y="60" fontSize="11" fill="#64748b">12' × 13'</text>
                </g>
                <g transform={`translate(260, 20)`}>
                  <rect x="0" y="0" width="180" height="190" fill="none" stroke="#000" strokeWidth="2.5" />
                  <text x="20" y="40" fontSize="13" fontWeight="bold">BEDROOM 3</text>
                  <text x="20" y="60" fontSize="11" fill="#64748b">11' × 12'</text>
                </g>
                <g transform={`translate(20, 240)`}>
                  <rect x="0" y="0" width="160" height="190" fill="none" stroke="#000" strokeWidth="2.5" />
                  <text x="20" y="40" fontSize="13" fontWeight="bold">BEDROOM 4</text>
                  <text x="20" y="60" fontSize="11" fill="#64748b">10' × 10'</text>
                </g>

                {/* Central Family Private Lounge Arena */}
                <g transform={`translate(200, 260)`}>
                  <text x="30" y="50" fontSize="14" fontWeight="bold">FAMILY LOUNGE</text>
                  <text x="45" y="70" fontSize="11" fill="#64748b">10' × 12'</text>
                </g>
              </svg>
            </div>
          )}

          {activeTab === "elevation" && (
            <div>
              <h3 style={{ margin: "0 0 12px 0", color: "#1a5f7a" }}>4. Front Modern Facade Elevation View</h3>
              <svg width="100%" viewBox="-40 -20 560 700" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                {/* Structural Foundation Ground Line base */}
                <line x1="-20" y1="600" x2="520" y2="600" stroke="#000" strokeWidth="4" />
                
                {/* Ground Level Frame (Parking Clear Heights) */}
                <rect x="40" y="460" width="360" height="140" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                <text x="180" y="530" fontSize="12" fill="#64748b" fontWeight="bold">GROUND PARKING FRAME</text>
                
                {/* First Floor Architecture Deck Panels */}
                <rect x="30" y="300" width="380" height="160" fill="none" stroke="#1e293b" strokeWidth="3" />
                {/* Large French Glazing Glass Windows */}
                <rect x="60" y="330" width="140" height="100" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                <line x1="130" y1="330" x2="130" y2="430" stroke="#0284c7" strokeWidth="1.5" />

                {/* Second Floor Framing Structures */}
                <rect x="30" y="140" width="380" height="160" fill="none" stroke="#1e293b" strokeWidth="3" />
                <rect x="60" y="170" width="140" height="100" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                
                {/* Continuous Vertical Concrete Glass Lift Column Shaft Tower */}
                <rect x="410" y="80" width="60" height="520" fill="#f1f5f9" stroke="#000" strokeWidth="3" />
                {/* Grid glass panels along lift well */}
                {[140, 240, 340, 440].map((y, idx) => (
                  <rect key={idx} x="420" y={y} width="40" height="60" fill="#e2e8f0" stroke="#475569" />
                ))}
                
                {/* Level Elevation Markings Right Height Metrics Columns */}
                <line x1="490" y1="600" x2="490" y2="80" stroke="#000" strokeWidth="1" />
                <text x="500" y="530" fontSize="10">21'0" Ground</text>
                <text x="500" y="380" fontSize="10">12'0" 1st Flr</text>
                <text x="500" y="220" fontSize="10">12'0" 2nd Flr</text>
              </svg>
            </div>
          )}
        </div>

        {/* Dynamic Parameter Summary Desk Sidebar Container Panel */}
        <div style={styles.sidebarCard}>
          <h4 style={{ margin: "0 0 14px 0", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>Drawing Spec Sheet</h4>
          <table style={styles.specTable}>
            <tbody>
              <tr style={styles.specRow}><td style={styles.specCellLabel}>Plot Area Size</td><td style={styles.specCellValue}>1,200 sqft</td></tr>
              <tr style={styles.specRow}><td style={styles.specCellLabel}>Dimensions Bound</td><td style={styles.specCellValue}>30' × 40'</td></tr>
              <tr style={styles.specRow}><td style={styles.specCellLabel}>Facing Setup</td><td style={styles.specCellValue}>East Road</td></tr>
              <tr style={styles.specRow}><td style={styles.specCellLabel}>Stair Configuration</td><td style={styles.specCellValue}>Internal Well</td></tr>
              <tr style={styles.specRow}><td style={styles.specCellLabel}>Total Car Bays</td><td style={styles.specCellValue}>4 Spaces</td></tr>
              <tr style={styles.specRow}><td style={styles.specCellLabel}>Lift Shaft Block</td><td style={styles.specCellValue}>3' × 4' Ready</td></tr>
              <tr style={styles.specRow}><td style={styles.specCellLabel}>UG Sump Capacity</td><td style={styles.specCellValue}>12,000 Liters</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
