import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import {
  DRGInputs,
  FacingDirection,
  ParkingOption,
  generateCalculatedBlueprint
} from "../lib/drgEngine";

export default function ProfessionalDRGStudio() {
  const router = useRouter();

  // --- PARAMETRIC USER INPUTS ---
  const [projectName, setProjectName] = useState<string>("Reddy Vastu-Compliant Residence");
  const [plotWidth, setPlotWidth] = useState<number>(40);
  const [plotLength, setPlotLength] = useState<number>(60);
  const [facing, setFacing] = useState<FacingDirection>("North");
  const [floorsCount, setFloorsCount] = useState<number>(3); // G+2
  const [parkingOption, setParkingOption] = useState<ParkingOption>("Half Parking");
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [toilets, setToilets] = useState<number>(3);
  const [sbcKpa, setSbcKpa] = useState<number>(250); // Soil SBC in kN/m²

  // --- VIEW & LAYER CONTROLS ---
  type TabType = "ground" | "upper" | "structural" | "nbc_schedule";
  const [activeTab, setActiveTab] = useState<TabType>("ground");
  const [showVastuTags, setShowVastuTags] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showSymbols, setShowSymbols] = useState<boolean>(true);

  // --- INPUT CONSOLIDATION & DYNAMIC ENGINE EXECUTION ---
  const inputs: DRGInputs = useMemo(() => ({
    projectName,
    plotWidth: Math.max(20, Math.min(150, Number(plotWidth) || 30)),
    plotLength: Math.max(25, Math.min(200, Number(plotLength) || 40)),
    facing,
    floorsCount: Math.max(1, Math.min(8, Number(floorsCount) || 1)),
    parkingOption,
    bedrooms: Math.max(1, Math.min(6, Number(bedrooms) || 1)),
    toilets: Math.max(1, Math.min(6, Number(toilets) || 1)),
    sbcKpa: Math.max(100, Math.min(500, Number(sbcKpa) || 200))
  }), [projectName, plotWidth, plotLength, facing, floorsCount, parkingOption, bedrooms, toilets, sbcKpa]);

  const bp = useMemo(() => {
    return generateCalculatedBlueprint(inputs);
  }, [inputs]);

  // Quick Preset Handlers
  const applyPreset = useCallback((w: number, l: number, defaultFacing: FacingDirection) => {
    setPlotWidth(w);
    setPlotLength(l);
    setFacing(defaultFacing);
  }, []);

  // North Compass Rotation based on facing
  const compassRotation = useMemo(() => {
    switch (facing) {
      case "North": return 0;
      case "East": return -90;
      case "South": return 180;
      case "West": return 90;
      default: return 0;
    }
  }, [facing]);

  return (
    <div style={{ minHeight: "100vh", background: "#05070f", color: "#f1f5f9", fontFamily: "Inter, system-ui, -apple-system, sans-serif", padding: "16px 24px" }}>
      {/* PRINT-OPTIMIZED STYLESHEET */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          header, .no-print { display: none !important; }
          .blueprint-container { border: 2px solid #000000 !important; background: #ffffff !important; box-shadow: none !important; }
          svg text { fill: #000000 !important; }
          svg rect, svg line, svg path { stroke: #000000 !important; }
        }
      `}} />

      {/* HEADER */}
      <header
        className="no-print"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "16px 24px",
          borderRadius: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
          border: "1px solid #334155",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, #0284c7, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 0 15px rgba(56,189,248,0.4)" }}>
            📐
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "19px", fontWeight: "800", letterSpacing: "0.5px", color: "#ffffff" }}>
              BUILDMITRA PROFESSIONAL ARCHITECTURAL &amp; STRUCTURAL CAD STUDIO
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#38bdf8" }}>
              Parametric Vector Grid Engine • Double-Line Walls • NBC 2016 Compliant • IS 456 Column &amp; Footing Schedules
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: "9px 18px",
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              color: "#ffffff",
              border: 0,
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(22,163,74,0.3)"
            }}
          >
            🖨️ Print Blueprint (A3/A4)
          </button>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "9px 16px",
              background: "#1e293b",
              color: "#cbd5e1",
              border: "1px solid #475569",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* PARAMETRIC CONTROLS PANEL */}
      <div
        className="no-print"
        style={{
          background: "#0c1322",
          padding: "18px 22px",
          borderRadius: "14px",
          border: "1px solid #1e293b",
          marginBottom: "18px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px", color: "#38bdf8", textTransform: "uppercase" }}>
            ⚙️ Parametric Site Specifications (Dynamic Real-Time CAD Redraw)
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", marginRight: "4px" }}>Quick Presets:</span>
            {[
              { label: "30×40 North", w: 30, l: 40, f: "North" as FacingDirection },
              { label: "30×50 East", w: 30, l: 50, f: "East" as FacingDirection },
              { label: "40×60 North", w: 40, l: 60, f: "North" as FacingDirection },
              { label: "50×80 South", w: 50, l: 80, f: "South" as FacingDirection }
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p.w, p.l, p.f)}
                style={{
                  padding: "4px 9px",
                  fontSize: "11px",
                  background: plotWidth === p.w && plotLength === p.l && facing === p.f ? "#0284c7" : "#1e293b",
                  color: "#ffffff",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          {/* Project Name */}
          <div style={{ background: "#111827", padding: "10px 12px", borderRadius: "8px", border: "1px solid #1f2937" }}>
            <label style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
              Project Title
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{ width: "100%", padding: "6px 8px", background: "#090d16", border: "1px solid #374151", color: "#ffffff", borderRadius: "6px", fontSize: "12px", fontWeight: "600", boxSizing: "border-box" }}
            />
          </div>

          {/* Plot Dimensions */}
          <div style={{ background: "#111827", padding: "10px 12px", borderRadius: "8px", border: "1px solid #1f2937" }}>
            <label style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
              Plot Width × Length (Ft)
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              <input
                type="number"
                min="20"
                max="150"
                value={plotWidth}
                onChange={(e) => setPlotWidth(Math.max(20, Math.min(150, Number(e.target.value) || 20)))}
                style={{ width: "100%", padding: "6px 8px", background: "#090d16", border: "1px solid #374151", color: "#ffffff", borderRadius: "6px", fontSize: "12px", fontWeight: "700", boxSizing: "border-box" }}
                title="Width in feet"
              />
              <input
                type="number"
                min="25"
                max="200"
                value={plotLength}
                onChange={(e) => setPlotLength(Math.max(25, Math.min(200, Number(e.target.value) || 25)))}
                style={{ width: "100%", padding: "6px 8px", background: "#090d16", border: "1px solid #374151", color: "#ffffff", borderRadius: "6px", fontSize: "12px", fontWeight: "700", boxSizing: "border-box" }}
                title="Length in feet"
              />
            </div>
          </div>

          {/* Road Facing */}
          <div style={{ background: "#111827", padding: "10px 12px", borderRadius: "8px", border: "1px solid #1f2937" }}>
            <label style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
              Road Orientation (Vastu)
            </label>
            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value as FacingDirection)}
              style={{ width: "100%", padding: "6px 8px", background: "#090d16", border: "1px solid #374151", color: "#38bdf8", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", boxSizing: "border-box" }}
            >
              <option value="North">North Facing (Kubera / Wealth)</option>
              <option value="East">East Facing (Surya / Vitality)</option>
              <option value="South">South Facing (Yama / Agni Energy)</option>
              <option value="West">West Facing (Varuna / Stability)</option>
            </select>
          </div>

          {/* Ground Floor Parking Strategy */}
          <div style={{ background: "#111827", padding: "10px 12px", borderRadius: "8px", border: "1px solid #1f2937" }}>
            <label style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
              Ground Floor Strategy
            </label>
            <select
              value={parkingOption}
              onChange={(e) => setParkingOption(e.target.value as ParkingOption)}
              style={{ width: "100%", padding: "6px 8px", background: "#090d16", border: "1px solid #374151", color: "#22c55e", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", boxSizing: "border-box" }}
            >
              <option value="Half Parking">Half Parking + Half Living</option>
              <option value="Full Parking">100% Stilt Parking Bay</option>
              <option value="No Parking">No Parking (Full Living)</option>
            </select>
          </div>

          {/* Configuration: Floors, Beds, Baths */}
          <div style={{ background: "#111827", padding: "10px 12px", borderRadius: "8px", border: "1px solid #1f2937" }}>
            <label style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
              Floors, Beds &amp; Baths
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
              <select
                value={floorsCount}
                onChange={(e) => setFloorsCount(Number(e.target.value))}
                style={{ padding: "6px 2px", background: "#090d16", border: "1px solid #374151", color: "#ffffff", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}
                title="Floors count"
              >
                <option value={1}>G Floor</option>
                <option value={2}>G + 1</option>
                <option value={3}>G + 2</option>
                <option value={4}>G + 3</option>
                <option value={5}>G + 4</option>
              </select>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                style={{ padding: "6px 2px", background: "#090d16", border: "1px solid #374151", color: "#ffffff", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}
                title="Bedrooms count"
              >
                <option value={1}>1 Bed</option>
                <option value={2}>2 Bed</option>
                <option value={3}>3 Bed</option>
                <option value={4}>4 Bed</option>
                <option value={5}>5 Bed</option>
              </select>
              <select
                value={toilets}
                onChange={(e) => setToilets(Number(e.target.value))}
                style={{ padding: "6px 2px", background: "#090d16", border: "1px solid #374151", color: "#ffffff", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}
                title="Toilets/Baths count"
              >
                <option value={1}>1 Bath</option>
                <option value={2}>2 Bath</option>
                <option value={3}>3 Bath</option>
                <option value={4}>4 Bath</option>
                <option value={5}>5 Bath</option>
              </select>
            </div>
          </div>

          {/* Soil Bearing Capacity (SBC) */}
          <div style={{ background: "#111827", padding: "10px 12px", borderRadius: "8px", border: "1px solid #1f2937" }}>
            <label style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
              Soil SBC (IS 456 Footing)
            </label>
            <select
              value={sbcKpa}
              onChange={(e) => setSbcKpa(Number(e.target.value))}
              style={{ width: "100%", padding: "6px 8px", background: "#090d16", border: "1px solid #374151", color: "#f97316", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", boxSizing: "border-box" }}
            >
              <option value={120}>120 kN/m² (Soft Clay / Silty Soil)</option>
              <option value={180}>180 kN/m² (Medium Cohesive Soil)</option>
              <option value={250}>250 kN/m² (Dense Sand / Moorum - Std)</option>
              <option value={350}>350 kN/m² (Hard Murrum / Soft Rock)</option>
              <option value={450}>450 kN/m² (Hard Bedrock / High SBC)</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW NAVIGATION & LAYER TOGGLES */}
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px"
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "ground" as TabType, label: "🏠 Ground Floor Architectural Plan", color: "#16a34a" },
            { id: "upper" as TabType, label: `🏢 Upper Typical Floor (${inputs.bedrooms} BHK)`, color: "#0284c7" },
            { id: "structural" as TabType, label: "🏗️ IS 456 Column & Footing Grid", color: "#ea580c" },
            { id: "nbc_schedule" as TabType, label: "📋 NBC 2016 Compliance & Rebar Schedules", color: "#8b5cf6" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "9px 16px",
                background: activeTab === tab.id ? tab.color : "#111827",
                color: "#ffffff",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "12px",
                border: activeTab === tab.id ? `1px solid ${tab.color}` : "1px solid #1f2937",
                cursor: "pointer",
                boxShadow: activeTab === tab.id ? `0 0 14px ${tab.color}40` : "none"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ fontSize: "11px", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
            <input type="checkbox" checked={showVastuTags} onChange={(e) => setShowVastuTags(e.target.checked)} />
            Vastu Badges
          </label>
          <label style={{ fontSize: "11px", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
            <input type="checkbox" checked={showDimensions} onChange={(e) => setShowDimensions(e.target.checked)} />
            Dimensions
          </label>
          <label style={{ fontSize: "11px", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
            <input type="checkbox" checked={showSymbols} onChange={(e) => setShowSymbols(e.target.checked)} />
            Doors &amp; Windows
          </label>
        </div>
      </div>

      {/* BLUEPRINT DRAWING CANVAS CONTAINER */}
      {activeTab !== "nbc_schedule" && (
        <div
          className="blueprint-container"
          style={{
            background: "#030611",
            borderRadius: "14px",
            border: "2px solid #1e293b",
            padding: "20px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.6)"
          }}
        >
          {/* SHEET TITLE BAR */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "12px", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                BUILDMITRA DIGITAL CAD BLUEPRINT SHEET • DWG-V2
              </div>
              <h2 style={{ margin: "2px 0 0", fontSize: "16px", color: "#ffffff", fontWeight: "800" }}>
                {projectName.toUpperCase()} — {
                  activeTab === "ground" ? "GROUND FLOOR ARCHITECTURAL CAD LAYOUT" :
                  activeTab === "upper" ? "UPPER FLOOR TYPICAL RESIDENTIAL PLAN" :
                  "IS 456 STRUCTURAL COLUMN & ISOLATED FOOTING GRID"
                }
              </h2>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", background: "#1e293b", color: "#38bdf8", padding: "4px 8px", borderRadius: "5px", fontWeight: "600", border: "1px solid #334155" }}>
                Plot: {bp.inputs.plotWidth}′ × {bp.inputs.plotLength}′ ({bp.metrics.plotArea} Sq.Ft)
              </span>
              <span style={{ fontSize: "11px", background: "#065f46", color: "#34d399", padding: "4px 8px", borderRadius: "5px", fontWeight: "700" }}>
                {bp.inputs.facing} Road Facing
              </span>
              <span style={{ fontSize: "11px", background: "#1e293b", color: "#e2e8f0", padding: "4px 8px", borderRadius: "5px", fontWeight: "600" }}>
                Proposed BUA: {bp.metrics.proposedTotalBua} Sq.Ft
              </span>
            </div>
          </div>

          {/* SVG BLUEPRINT RENDERER */}
          <div style={{ width: "100%", overflowX: "auto", display: "flex", justifyContent: "center", background: "#040714", borderRadius: "10px", padding: "10px 0" }}>
            <svg
              viewBox="0 0 1100 740"
              style={{
                width: "100%",
                maxWidth: "1020px",
                height: "auto",
                background: "#030612",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)"
              }}
            >
              <defs>
                {/* Exterior Wall 9" Hatch */}
                <pattern id="extWallHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#334155" strokeWidth="1.2" />
                </pattern>
                {/* Setback Green Grass Pattern */}
                <pattern id="setbackLawn" width="14" height="14" patternUnits="userSpaceOnUse">
                  <circle cx="3" cy="3" r="1.2" fill="#14532d" />
                  <circle cx="10" cy="10" r="1.2" fill="#14532d" />
                </pattern>
                {/* Rebar Column Pattern */}
                <pattern id="columnSteel" width="6" height="6" patternUnits="userSpaceOnUse">
                  <rect width="6" height="6" fill="#ea580c" />
                  <circle cx="3" cy="3" r="1.2" fill="#ffffff" />
                </pattern>
              </defs>

              {/* 1. PROPERTY BOUNDARY LINE */}
              <rect
                x={bp.originX}
                y={bp.originY}
                width={bp.plotSvgW}
                height={bp.plotSvgH}
                fill="url(#setbackLawn)"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="8 6"
              />
              <text x={bp.originX + 12} y={bp.originY - 8} fill="#94a3b8" fontSize="10" fontWeight="700" letterSpacing="0.5px">
                PROPERTY BOUNDARY: {bp.inputs.plotWidth}′-0″ × {bp.inputs.plotLength}′-0″ ({bp.metrics.plotArea} SQ.FT) — {bp.inputs.facing.toUpperCase()} ROAD ACCESS
              </text>

              {/* 2. SETBACK MARGIN CALLOUTS */}
              {showDimensions && (
                <>
                  <text x={bp.originX + bp.plotSvgW / 2} y={bp.originY + 16} fill="#22c55e" fontSize="9" fontWeight="700" textAnchor="middle">
                    FRONT SETBACK: {bp.metrics.front}′-0″ (ROAD ACCESS)
                  </text>
                  <text x={bp.originX + bp.plotSvgW / 2} y={bp.originY + bp.plotSvgH - 8} fill="#22c55e" fontSize="9" fontWeight="700" textAnchor="middle">
                    REAR SETBACK: {bp.metrics.rear}′-0″ (VENTILATION BUFFER)
                  </text>
                  <text x={bp.originX + 8} y={bp.originY + bp.plotSvgH / 2} fill="#22c55e" fontSize="9" fontWeight="700" transform={`rotate(-90 ${bp.originX + 8} ${bp.originY + bp.plotSvgH / 2})`} textAnchor="middle">
                    SIDE SETBACK: {bp.metrics.left}′-0″
                  </text>
                  <text x={bp.originX + bp.plotSvgW - 8} y={bp.originY + bp.plotSvgH / 2} fill="#22c55e" fontSize="9" fontWeight="700" transform={`rotate(90 ${bp.originX + bp.plotSvgW - 8} ${bp.originY + bp.plotSvgH / 2})`} textAnchor="middle">
                    SIDE SETBACK: {bp.metrics.right}′-0″
                  </text>
                </>
              )}

              {/* 3. UNDERGROUND WATER SUMP (UGT in North-East / Ishan Setback) */}
              {activeTab === "ground" && (
                <g>
                  <rect
                    x={bp.waterSump.x}
                    y={bp.waterSump.y}
                    width={bp.waterSump.w}
                    height={bp.waterSump.h}
                    fill="#082f49"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    rx="3"
                  />
                  {/* Manhole Cover */}
                  <circle cx={bp.waterSump.x + bp.waterSump.w / 2} cy={bp.waterSump.y + bp.waterSump.h / 2} r="9" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
                  <text x={bp.waterSump.x + bp.waterSump.w / 2} y={bp.waterSump.y - 4} fill="#38bdf8" fontSize="8" fontWeight="800" textAnchor="middle">
                    UGT SUMP (RCC)
                  </text>
                  <text x={bp.waterSump.x + bp.waterSump.w / 2} y={bp.waterSump.y + bp.waterSump.h + 10} fill="#7dd3fc" fontSize="7.5" fontWeight="600" textAnchor="middle">
                    {bp.waterSump.capacityLitres.toLocaleString()} LTRS (VASTU NE)
                  </text>
                </g>
              )}

              {/* 4. BUILDING EXTERIOR 9-INCH DOUBLE-LINE MASONRY WALLS */}
              {/* Outer Wall Boundary */}
              <rect
                x={bp.bldgSvgX}
                y={bp.bldgSvgY}
                width={bp.bldgSvgW}
                height={bp.bldgSvgH}
                fill="#0b1120"
                stroke="#38bdf8"
                strokeWidth="3"
              />
              {/* Inner 9-Inch Boundary Line */}
              <rect
                x={bp.bldgSvgX + bp.extWallThickPx}
                y={bp.bldgSvgY + bp.extWallThickPx}
                width={bp.bldgSvgW - (bp.extWallThickPx * 2)}
                height={bp.bldgSvgH - (bp.extWallThickPx * 2)}
                fill="#050814"
                stroke="#1e293b"
                strokeWidth="1.5"
              />

              {/* 5. ARCHITECTURAL ROOM ZONES & 4.5" INTERIOR PARTITIONS */}
              {activeTab !== "structural" && (
                (activeTab === "ground" ? bp.groundZones : bp.upperZones).map((zone) => (
                  <g key={zone.id}>
                    {/* Interior 4.5" Double-Line Partition */}
                    <rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.w}
                      height={zone.h}
                      fill="#0c1322"
                      stroke="#0284c7"
                      strokeWidth="2"
                    />
                    <rect
                      x={zone.x + bp.intWallThickPx}
                      y={zone.y + bp.intWallThickPx}
                      width={Math.max(4, zone.w - (bp.intWallThickPx * 2))}
                      height={Math.max(4, zone.h - (bp.intWallThickPx * 2))}
                      fill="#060913"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />

                    {/* Room Name & Dimensions */}
                    <text x={zone.x + 12} y={zone.y + 22} fill="#ffffff" fontSize="11" fontWeight="800" letterSpacing="0.3px">
                      {zone.name}
                    </text>
                    <text x={zone.x + 12} y={zone.y + 38} fill="#38bdf8" fontSize="10" fontWeight="700">
                      {zone.dimsText} ({zone.areaSqFt} Sq.Ft)
                    </text>

                    {/* Vastu Shastra Indicator Tag */}
                    {showVastuTags && (
                      <g>
                        <rect
                          x={zone.x + 12}
                          y={zone.y + 46}
                          width={zone.vastuZone.length * 6.2 + 14}
                          height="16"
                          rx="3"
                          fill="#064e3b"
                          stroke="#059669"
                          strokeWidth="1"
                        />
                        <text x={zone.x + 18} y={zone.y + 58} fill="#6ee7b7" fontSize="8.5" fontWeight="700">
                          ✦ {zone.vastuZone}
                        </text>
                        {zone.w > 120 && zone.h > 90 && (
                          <text x={zone.x + 12} y={zone.y + 74} fill="#64748b" fontSize="7.5" fontWeight="500">
                            {zone.vastuSignificance.slice(0, 42)}...
                          </text>
                        )}
                      </g>
                    )}

                    {/* DOORS & 90-DEGREE SWING ARCS */}
                    {showSymbols && zone.doors.map((door) => (
                      <g key={door.id}>
                        {/* Door opening jamb gap */}
                        <circle cx={door.hingeX} cy={door.hingeY} r="2.5" fill="#38bdf8" />
                        {/* Door Leaf (Panel) */}
                        <line
                          x1={door.hingeX}
                          y1={door.hingeY}
                          x2={door.leafEndX}
                          y2={door.leafEndY}
                          stroke="#f8fafc"
                          strokeWidth="2"
                        />
                        {/* 90° Swing Arc */}
                        <path d={door.arcPath} fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
                        {/* Door Tag Label */}
                        <circle cx={door.hingeX + 10} cy={door.hingeY + 10} r="6" fill="#0284c7" />
                        <text x={door.hingeX + 10} y={door.hingeY + 13} fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">
                          {door.label}
                        </text>
                      </g>
                    ))}

                    {/* WINDOWS & VENTILATORS */}
                    {showSymbols && zone.windows.map((win) => (
                      <g key={win.id}>
                        {/* Window Wall Gap Symbol */}
                        <rect
                          x={win.orientation === "H" ? win.x : win.x - 2}
                          y={win.orientation === "H" ? win.y - 2 : win.y}
                          width={win.orientation === "H" ? win.widthPx : 4}
                          height={win.orientation === "H" ? 4 : win.widthPx}
                          fill="#38bdf8"
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                        {/* Triple Glass Pane Symbol */}
                        <line
                          x1={win.orientation === "H" ? win.x + 2 : win.x}
                          y1={win.orientation === "H" ? win.y : win.y + 2}
                          x2={win.orientation === "H" ? win.x + win.widthPx - 2 : win.x}
                          y2={win.orientation === "H" ? win.y : win.y + win.widthPx - 2}
                          stroke="#0284c7"
                          strokeWidth="2"
                        />
                        {/* Window Callout */}
                        <text
                          x={win.orientation === "H" ? win.x + win.widthPx / 2 : win.x + 8}
                          y={win.orientation === "H" ? win.y - 6 : win.y + win.widthPx / 2}
                          fill="#38bdf8"
                          fontSize="8"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {win.label}
                        </text>
                      </g>
                    ))}
                  </g>
                ))
              )}

              {/* 6. DOG-LEGGED STAIRCASE CORE WITH UP ARROWS (West / Center) */}
              {activeTab !== "structural" && (
                <g>
                  {/* Staircase Enclosure */}
                  <rect
                    x={bp.staircase.x}
                    y={bp.staircase.y}
                    width={bp.staircase.width}
                    height={bp.staircase.length}
                    fill="#0f172a"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                  {/* Flight 1 Treads */}
                  {bp.staircase.flight1Treads.map((tr, idx) => (
                    <line key={`f1_${idx}`} x1={tr.x1} y1={tr.y1} x2={tr.x2} y2={tr.y2} stroke="#475569" strokeWidth="1.2" />
                  ))}
                  {/* Flight 2 Treads */}
                  {bp.staircase.flight2Treads.map((tr, idx) => (
                    <line key={`f2_${idx}`} x1={tr.x1} y1={tr.y1} x2={tr.x2} y2={tr.y2} stroke="#475569" strokeWidth="1.2" />
                  ))}
                  {/* Mid-Landing Slab */}
                  <rect
                    x={bp.staircase.landingX}
                    y={bp.staircase.landingY}
                    width={bp.staircase.landingW}
                    height={bp.staircase.landingH}
                    fill="#1e293b"
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                  <text x={bp.staircase.landingX + bp.staircase.landingW / 2} y={bp.staircase.landingY + bp.staircase.landingH / 2 + 3} fill="#94a3b8" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                    MID-LANDING SLAB
                  </text>
                  {/* Directional UP Arrow */}
                  <line
                    x1={bp.staircase.arrowStart.x}
                    y1={bp.staircase.arrowStart.y}
                    x2={bp.staircase.arrowEnd.x}
                    y2={bp.staircase.arrowEnd.y}
                    stroke="#22c55e"
                    strokeWidth="2"
                  />
                  <polygon
                    points={`${bp.staircase.arrowEnd.x - 4},${bp.staircase.arrowEnd.y} ${bp.staircase.arrowEnd.x + 4},${bp.staircase.arrowEnd.y} ${bp.staircase.arrowEnd.x},${bp.staircase.arrowEnd.y - 8}`}
                    fill="#22c55e"
                  />
                  <text x={bp.staircase.arrowEnd.x} y={bp.staircase.arrowEnd.y + 16} fill="#22c55e" fontSize="7.5" fontWeight="800" textAnchor="middle">
                    UP
                  </text>

                  {/* PASSENGER LIFT SHAFT */}
                  {bp.liftShaft && (
                    <g>
                      <rect
                        x={bp.liftShaft.x}
                        y={bp.liftShaft.y}
                        width={bp.liftShaft.w}
                        height={bp.liftShaft.h}
                        fill="#090d16"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                      <line x1={bp.liftShaft.x} y1={bp.liftShaft.y} x2={bp.liftShaft.x + bp.liftShaft.w} y2={bp.liftShaft.y + bp.liftShaft.h} stroke="#f59e0b" strokeWidth="0.8" />
                      <line x1={bp.liftShaft.x + bp.liftShaft.w} y1={bp.liftShaft.y} x2={bp.liftShaft.x} y2={bp.liftShaft.y + bp.liftShaft.h} stroke="#f59e0b" strokeWidth="0.8" />
                      <text x={bp.liftShaft.x + bp.liftShaft.w / 2} y={bp.liftShaft.y + bp.liftShaft.h / 2 + 3} fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">
                        PASSENGER LIFT
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* 7. STRUCTURAL VIEW: IS 456 COLUMN GRID & FOOTING SCHEDULE */}
              {activeTab === "structural" && (
                <g>
                  {/* Grid Lines X (A, B, C...) */}
                  {bp.structural.xGridLines.map((gl) => (
                    <g key={gl.label}>
                      <line
                        x1={gl.x}
                        y1={bp.bldgSvgY - 26}
                        x2={gl.x}
                        y2={bp.bldgSvgY + bp.bldgSvgH + 26}
                        stroke="#ea580c"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                      />
                      {/* Top Grid Bubble */}
                      <circle cx={gl.x} cy={bp.bldgSvgY - 32} r="10" fill="#0c1322" stroke="#ea580c" strokeWidth="1.5" />
                      <text x={gl.x} y={bp.bldgSvgY - 28} fill="#ea580c" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {gl.label}
                      </text>
                      {/* Bottom Grid Bubble */}
                      <circle cx={gl.x} cy={bp.bldgSvgY + bp.bldgSvgH + 32} r="10" fill="#0c1322" stroke="#ea580c" strokeWidth="1.5" />
                      <text x={gl.x} y={bp.bldgSvgY + bp.bldgSvgH + 36} fill="#ea580c" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {gl.label}
                      </text>
                      {/* Span Dimension */}
                      {gl.spanFt && (
                        <text x={gl.x - 30} y={bp.bldgSvgY - 10} fill="#f97316" fontSize="8" fontWeight="700">
                          {gl.spanFt}′
                        </text>
                      )}
                    </g>
                  ))}

                  {/* Grid Lines Y (1, 2, 3...) */}
                  {bp.structural.yGridLines.map((gl) => (
                    <g key={gl.label}>
                      <line
                        x1={bp.bldgSvgX - 26}
                        y1={gl.y}
                        x2={bp.bldgSvgX + bp.bldgSvgW + 26}
                        y2={gl.y}
                        stroke="#ea580c"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                      />
                      {/* Left Grid Bubble */}
                      <circle cx={bp.bldgSvgX - 32} cy={gl.y} r="10" fill="#0c1322" stroke="#ea580c" strokeWidth="1.5" />
                      <text x={bp.bldgSvgX - 32} y={gl.y + 4} fill="#ea580c" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {gl.label}
                      </text>
                      {/* Right Grid Bubble */}
                      <circle cx={bp.bldgSvgX + bp.bldgSvgW + 32} cy={gl.y} r="10" fill="#0c1322" stroke="#ea580c" strokeWidth="1.5" />
                      <text x={bp.bldgSvgX + bp.bldgSvgW + 32} y={gl.y + 4} fill="#ea580c" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {gl.label}
                      </text>
                    </g>
                  ))}

                  {/* Columns & Dynamic Isolated Footing Pads */}
                  {bp.structural.columns.map((col) => {
                    const padHalf = col.footingSidePx / 2;
                    return (
                      <g key={col.id}>
                        {/* Dynamic Footing Pad Sized from Soil SBC */}
                        <rect
                          x={col.cx - padHalf}
                          y={col.cy - padHalf}
                          width={col.footingSidePx}
                          height={col.footingSidePx}
                          fill="#182235"
                          fillOpacity="0.45"
                          stroke="#eab308"
                          strokeWidth="1.4"
                          strokeDasharray="4 3"
                        />
                        {/* Concrete Pedestal Step */}
                        <rect
                          x={col.cx - (padHalf * 0.5)}
                          y={col.cy - (padHalf * 0.5)}
                          width={padHalf}
                          height={padHalf}
                          fill="none"
                          stroke="#ca8a04"
                          strokeWidth="1"
                        />
                        {/* Reinforced Concrete Column */}
                        <rect
                          x={col.cx - (col.colWidthPx / 2)}
                          y={col.cy - (col.colDepthPx / 2)}
                          width={col.colWidthPx}
                          height={col.colDepthPx}
                          fill="url(#columnSteel)"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        {/* Column Mark Tag */}
                        <text x={col.cx} y={col.cy - padHalf - 6} fill="#ea580c" fontSize="9.5" fontWeight="800" textAnchor="middle">
                          {col.mark} ({col.gridRef})
                        </text>
                        {/* Footing Size Tag */}
                        <text x={col.cx} y={col.cy + padHalf + 12} fill="#eab308" fontSize="8" fontWeight="600" textAnchor="middle">
                          F: {col.footingSideM}m×{col.footingSideM}m
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 8. ARCHITECTURAL NORTH COMPASS ROSE */}
              <g transform={`translate(${bp.originX + bp.plotSvgW - 45}, ${bp.originY + 45})`}>
                <circle cx="0" cy="0" r="22" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
                <g transform={`rotate(${compassRotation})`}>
                  <polygon points="0,-18 5,-4 0,0" fill="#ef4444" />
                  <polygon points="0,-18 -5,-4 0,0" fill="#dc2626" />
                  <polygon points="0,18 5,4 0,0" fill="#94a3b8" />
                  <polygon points="0,18 -5,4 0,0" fill="#64748b" />
                  <text x="0" y="-22" fill="#ef4444" fontSize="10" fontWeight="900" textAnchor="middle">N</text>
                  <text x="0" y="27" fill="#94a3b8" fontSize="9" fontWeight="700" textAnchor="middle">S</text>
                  <text x="24" y="3" fill="#94a3b8" fontSize="9" fontWeight="700" textAnchor="middle">E</text>
                  <text x="-24" y="3" fill="#94a3b8" fontSize="9" fontWeight="700" textAnchor="middle">W</text>
                </g>
              </g>

              {/* 9. CAD SCALE BAR & TITLE BLOCK */}
              <g transform={`translate(${bp.originX + 10}, ${bp.originY + bp.plotSvgH - 36})`}>
                <rect x="0" y="0" width="180" height="26" fill="#090d16" stroke="#334155" strokeWidth="1" rx="4" />
                <text x="8" y="12" fill="#94a3b8" fontSize="7.5" fontWeight="700">SCALE: 1:100 (VECTOR CAD)</text>
                <rect x="8" y="16" width="30" height="4" fill="#ffffff" />
                <rect x="38" y="16" width="30" height="4" fill="#0284c7" />
                <rect x="68" y="16" width="30" height="4" fill="#ffffff" />
                <rect x="98" y="16" width="30" height="4" fill="#0284c7" />
                <text x="8" y="25" fill="#64748b" fontSize="6">0</text>
                <text x="38" y="25" fill="#64748b" fontSize="6">5′</text>
                <text x="68" y="25" fill="#64748b" fontSize="6">10′</text>
                <text x="128" y="25" fill="#64748b" fontSize="6">20 FT</text>
              </g>
            </svg>
          </div>

          {/* BLUEPRINT SUMMARY FOOTER */}
          <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", background: "#0a101f", padding: "12px 16px", borderRadius: "8px", border: "1px solid #1e293b", fontSize: "11px" }}>
            <div><b style={{ color: "#94a3b8" }}>Plot Dimensions:</b> {bp.inputs.plotWidth}′-0″ × {bp.inputs.plotLength}′-0″ ({bp.metrics.plotArea} Sq.Ft)</div>
            <div><b style={{ color: "#94a3b8" }}>Ground Coverage:</b> {bp.metrics.groundCoverageSqFt} Sq.Ft ({bp.metrics.groundCoveragePct}%)</div>
            <div><b style={{ color: "#94a3b8" }}>Vastu Alignment:</b> <span style={{ color: "#38bdf8", fontWeight: "700" }}>{bp.inputs.facing} Facing</span> (Ishan NE / Agni SE)</div>
            <div><b style={{ color: "#94a3b8" }}>Soil Bearing (SBC):</b> <span style={{ color: "#ea580c", fontWeight: "700" }}>{bp.inputs.sbcKpa} kN/m²</span></div>
          </div>
        </div>
      )}

      {/* NBC 2016 COMPLIANCE & STRUCTURAL REBAR SCHEDULE TABLE TAB */}
      {activeTab === "nbc_schedule" && (
        <div style={{ background: "#0b1120", borderRadius: "14px", border: "1px solid #1e293b", padding: "22px", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
          {/* NBC COMPLIANCE HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "14px", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "11px", background: "#065f46", color: "#34d399", padding: "4px 10px", borderRadius: "5px", fontWeight: "700" }}>
                NBC 2016 CLAUSE 4.3 VALIDATED
              </span>
              <h2 style={{ margin: "6px 0 0", fontSize: "18px", color: "#ffffff", fontWeight: "800" }}>
                NATIONAL BUILDING CODE 2016 STATUTORY AREA STATEMENT
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Max Permissible FAR: <b style={{ color: "#38bdf8" }}>{bp.metrics.maxFar}:1</b></div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Ground Coverage Limit: <b style={{ color: "#22c55e" }}>75% Max (Current: {bp.metrics.groundCoveragePct}%)</b></div>
            </div>
          </div>

          {/* NBC METRICS GRID CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", marginBottom: "24px" }}>
            <div style={{ background: "#0f172a", padding: "14px", borderRadius: "10px", border: "1px solid #1e293b" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>TOTAL PLOT AREA</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#38bdf8", marginTop: "4px" }}>{bp.metrics.plotArea} Sq.Ft</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{bp.inputs.plotWidth}′ Width × {bp.inputs.plotLength}′ Depth</div>
            </div>

            <div style={{ background: "#0f172a", padding: "14px", borderRadius: "10px", border: "1px solid #1e293b" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>MANDATORY SETBACKS</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#22c55e", marginTop: "6px" }}>
                Front: {bp.metrics.front}′ | Rear: {bp.metrics.rear}′
              </div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#22c55e", marginTop: "2px" }}>
                Sides: {bp.metrics.left}′ (L) &amp; {bp.metrics.right}′ (R)
              </div>
            </div>

            <div style={{ background: "#0f172a", padding: "14px", borderRadius: "10px", border: "1px solid #1e293b" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>BUILDABLE PLINTH AREA</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#f59e0b", marginTop: "4px" }}>{bp.metrics.groundCoverageSqFt} Sq.Ft</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{bp.metrics.buildableWidth}′ × {bp.metrics.buildableLength}′ Plinth</div>
            </div>

            <div style={{ background: "#0f172a", padding: "14px", borderRadius: "10px", border: "1px solid #1e293b" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>PROPOSED TOTAL BUA</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#a855f7", marginTop: "4px" }}>{bp.metrics.proposedTotalBua} Sq.Ft</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Max Allowable: {bp.metrics.maxAllowableBua} Sq.Ft</div>
            </div>
          </div>

          {/* IS 456 STRUCTURAL COLUMN & FOOTING SCHEDULE TABLE */}
          <div style={{ marginTop: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", color: "#ea580c", fontWeight: "800" }}>
                🏗️ IS 456:2000 STRUCTURAL COLUMN &amp; ISOLATED FOOTING REBAR SCHEDULE
              </h3>
              <span style={{ fontSize: "11px", color: "#f97316", background: "#431407", padding: "4px 8px", borderRadius: "4px", fontWeight: "700", border: "1px solid #7c2d12" }}>
                Soil SBC: {bp.inputs.sbcKpa} kN/m² • Concrete M25 • Steel Fe500D
              </span>
            </div>

            <div style={{ overflowX: "auto", border: "1px solid #1e293b", borderRadius: "8px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#1e293b", color: "#f8fafc", borderBottom: "1px solid #334155" }}>
                    <th style={{ padding: "10px 12px" }}>Mark</th>
                    <th style={{ padding: "10px 12px" }}>Grid</th>
                    <th style={{ padding: "10px 12px" }}>Column Size</th>
                    <th style={{ padding: "10px 12px" }}>Longitudinal Rebar</th>
                    <th style={{ padding: "10px 12px" }}>Lateral Ties</th>
                    <th style={{ padding: "10px 12px" }}>Footing Size (L×B×D)</th>
                    <th style={{ padding: "10px 12px" }}>Footing Rebar Mesh</th>
                    <th style={{ padding: "10px 12px" }}>Depth Below GL</th>
                  </tr>
                </thead>
                <tbody>
                  {bp.structural.footingSchedule.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #1e293b", background: idx % 2 === 0 ? "#0c1322" : "#0f172a" }}>
                      <td style={{ padding: "10px 12px", fontWeight: "800", color: "#ea580c" }}>{row.columnMark}</td>
                      <td style={{ padding: "10px 12px", fontWeight: "700", color: "#38bdf8" }}>{row.gridRef}</td>
                      <td style={{ padding: "10px 12px", color: "#f1f5f9" }}>{row.columnSize}</td>
                      <td style={{ padding: "10px 12px", color: "#4ade80", fontWeight: "600" }}>{row.mainBars}</td>
                      <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{row.ties}</td>
                      <td style={{ padding: "10px 12px", fontWeight: "700", color: "#facc15" }}>{row.footingSize}</td>
                      <td style={{ padding: "10px 12px", color: "#facc15" }}>{row.footingMesh}</td>
                      <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{row.depthBelowGl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
