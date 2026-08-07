import React, { useState, useMemo, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MarketRateTrend from "../components/ui/MarketRateTrend";

// =========================================================================
// 1. CONSTANTS & CONVERSIONS
// =========================================================================

export const SURVEY_CONVERSIONS = {
  SFT_PER_ACRE: 43560,
  SFT_PER_GUNTA: 1089,       // 40 Guntas = 1 Acre
  SFT_PER_HECTARE: 107639,   // 1 Ha = 2.47105 Acres
  SFT_PER_CENT: 435.6,       // 100 Cents = 1 Acre
  SFT_PER_SQ_YARD: 9,        // 1 Sq Yard = 9 SFT
  SFT_PER_ANKANAM: 72,       // Regional Andhra/TG standard
};

export const UNIT_TO_FT_FACTORS: Record<string, number> = {
  ft: 1,
  m: 3.28084,
  chains: 66,
  yards: 3,
};

export const formatIndianNumber = (num: number, maxDecimals = 2): string => {
  if (!Number.isFinite(num)) return "0";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  }).format(num);
};

// =========================================================================
// 2. INTERFACES & TYPES
// =========================================================================

export type DistanceUnit = "ft" | "m" | "chains" | "yards";

export interface SurveySegment {
  id: string;
  fromPoint: string; // e.g. "A"
  toPoint: string;   // e.g. "B"
  length: number;    // entered length value
  bearingAngle: number; // interior or deflection/azimuth angle (0-360)
  isRoadFacing: boolean;
  roadWidthFt: number;  // e.g. 30, 40, 60
}

export interface SurveyPoint2D {
  name: string;
  x: number;
  y: number;
}

export interface SurveyCalculationResult {
  totalSft: number;
  acres: number;
  remainingGuntas: number;
  totalGuntas: number;
  hectares: number;
  cents: number;
  sqYards: number;
  ankanams: number;
  perimeterFt: number;
  totalRoadFrontageFt: number;
  vertices: SurveyPoint2D[];
}

// Default Presets
const PRESET_PLOTS = [
  {
    name: "30×40 Residential Plot",
    badge: "1,200 SFT",
    mode: "standard",
    unit: "ft" as DistanceUnit,
    segments: [
      { id: "s1", fromPoint: "A", toPoint: "B", length: 30, bearingAngle: 90, isRoadFacing: true, roadWidthFt: 30 },
      { id: "s2", fromPoint: "B", toPoint: "C", length: 40, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
      { id: "s3", fromPoint: "C", toPoint: "D", length: 30, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
      { id: "s4", fromPoint: "D", toPoint: "A", length: 40, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
    ],
  },
  {
    name: "30×50 Corner Plot",
    badge: "1,500 SFT",
    mode: "standard",
    unit: "ft" as DistanceUnit,
    segments: [
      { id: "s1", fromPoint: "A", toPoint: "B", length: 30, bearingAngle: 90, isRoadFacing: true, roadWidthFt: 40 },
      { id: "s2", fromPoint: "B", toPoint: "C", length: 50, bearingAngle: 90, isRoadFacing: true, roadWidthFt: 30 },
      { id: "s3", fromPoint: "C", toPoint: "D", length: 30, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
      { id: "s4", fromPoint: "D", toPoint: "A", length: 50, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
    ],
  },
  {
    name: "1 Acre Farm Land",
    badge: "43,560 SFT",
    mode: "acreage",
    unit: "ft" as DistanceUnit,
    segments: [
      { id: "s1", fromPoint: "A", toPoint: "B", length: 208.71, bearingAngle: 90, isRoadFacing: true, roadWidthFt: 40 },
      { id: "s2", fromPoint: "B", toPoint: "C", length: 208.71, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
      { id: "s3", fromPoint: "C", toPoint: "D", length: 208.71, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
      { id: "s4", fromPoint: "D", toPoint: "A", length: 208.71, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
    ],
  },
  {
    name: "5 Acre Agricultural Parcel",
    badge: "2,17,800 SFT",
    mode: "acreage",
    unit: "ft" as DistanceUnit,
    segments: [
      { id: "s1", fromPoint: "A", toPoint: "B", length: 466.69, bearingAngle: 90, isRoadFacing: true, roadWidthFt: 60 },
      { id: "s2", fromPoint: "B", toPoint: "C", length: 466.69, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
      { id: "s3", fromPoint: "C", toPoint: "D", length: 466.69, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
      { id: "s4", fromPoint: "D", toPoint: "A", length: 466.69, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
    ],
  },
  {
    name: "25 Acre Large Estate",
    badge: "10,89,000 SFT",
    mode: "acreage",
    unit: "ft" as DistanceUnit,
    segments: [
      { id: "s1", fromPoint: "A", toPoint: "B", length: 1043.55, bearingAngle: 90, isRoadFacing: true, roadWidthFt: 80 },
      { id: "s2", fromPoint: "B", toPoint: "C", length: 1043.55, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
      { id: "s3", fromPoint: "C", toPoint: "D", length: 1043.55, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
      { id: "s4", fromPoint: "D", toPoint: "A", length: 1043.55, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
    ],
  },
  {
    name: "100 Acre Commercial Tract",
    badge: "43,56,000 SFT",
    mode: "acreage",
    unit: "ft" as DistanceUnit,
    segments: [
      { id: "s1", fromPoint: "A", toPoint: "B", length: 2087.1, bearingAngle: 90, isRoadFacing: true, roadWidthFt: 100 },
      { id: "s2", fromPoint: "B", toPoint: "C", length: 2087.1, bearingAngle: 90, isRoadFacing: true, roadWidthFt: 60 },
      { id: "s3", fromPoint: "C", toPoint: "D", length: 2087.1, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
      { id: "s4", fromPoint: "D", toPoint: "A", length: 2087.1, bearingAngle: 90, isRoadFacing: false, roadWidthFt: 0 },
    ],
  },
];

// Helper to generate point names A, B, C ... Z, AA, BB ...
function getPointName(index: number): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (index < 26) return alphabet[index];
  const char = alphabet[Math.floor(index / 26) - 1];
  const char2 = alphabet[index % 26];
  return `${char}${char2}`;
}

export default function LandSurveyCalculator() {
  const router = useRouter();

  // State
  const [surveyMode, setSurveyMode] = useState<"standard" | "acreage">("standard");
  const [globalUnit, setGlobalUnit] = useState<DistanceUnit>("ft");
  const [projectName, setProjectName] = useState("Green Valley Survey Layout");
  const [surveyorName, setSurveyorName] = useState("BuildMitra Certified Surveyor");
  const [locationName, setLocationName] = useState("Bengaluru, Karnataka");

  const [segments, setSegments] = useState<SurveySegment[]>(PRESET_PLOTS[0].segments);

  // Canvas View Controls (Zoom & Pan)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle global unit change with optional length conversion
  const handleGlobalUnitChange = (newUnit: DistanceUnit) => {
    const oldFactor = UNIT_TO_FT_FACTORS[globalUnit] || 1;
    const newFactor = UNIT_TO_FT_FACTORS[newUnit] || 1;
    const ratio = oldFactor / newFactor;

    setGlobalUnit(newUnit);
    setSegments((prev) =>
      prev.map((s) => ({
        ...s,
        length: Number((s.length * ratio).toFixed(2)),
      }))
    );
  };

  // -------------------------------------------------------------------------
  // 3. GEOMETRY ENGINE: VERTEX SOLVER & SHOELACE AREA CALCULATION
  // -------------------------------------------------------------------------
  const calcResults: SurveyCalculationResult = useMemo(() => {
    let currentX = 0;
    let currentY = 0;
    let currentHeadingDeg = 0; // Starts facing East (0 deg)

    const vertices: SurveyPoint2D[] = [];
    let perimeterFt = 0;
    let totalRoadFrontageFt = 0;

    // Add origin vertex A
    const firstPointName = segments[0]?.fromPoint || "A";
    vertices.push({ name: firstPointName, x: currentX, y: currentY });

    const unitFactor = UNIT_TO_FT_FACTORS[globalUnit] || 1;

    segments.forEach((seg, idx) => {
      const lengthFt = seg.length * unitFactor;
      perimeterFt += lengthFt;

      if (seg.isRoadFacing) {
        totalRoadFrontageFt += lengthFt;
      }

      // Convert bearing/interior angle to Cartesian direction
      const angleRad = (currentHeadingDeg * Math.PI) / 180;
      currentX += lengthFt * Math.cos(angleRad);
      currentY += lengthFt * Math.sin(angleRad);

      const nextPointName = seg.toPoint || getPointName(idx + 1);
      
      // Don't add last vertex if it closes back to origin point A
      if (idx < segments.length - 1) {
        vertices.push({ name: nextPointName, x: currentX, y: currentY });
      }

      // Update heading for next segment based on turn angle (default 90 deg right turn)
      const turnAngle = seg.bearingAngle ?? 90;
      currentHeadingDeg = (currentHeadingDeg + (180 - turnAngle)) % 360;
    });

    // Shoelace Formula (Gauss's Area Formula) for N-sided polygon area
    let areaSum = 0;
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      areaSum += vertices[i].x * vertices[j].y;
      areaSum -= vertices[j].x * vertices[i].y;
    }
    const totalSft = Math.abs(areaSum) / 2;

    // Unit conversions
    const acres = Math.floor(totalSft / SURVEY_CONVERSIONS.SFT_PER_ACRE);
    const remainingSft = totalSft % SURVEY_CONVERSIONS.SFT_PER_ACRE;
    const remainingGuntas = Number((remainingSft / SURVEY_CONVERSIONS.SFT_PER_GUNTA).toFixed(2));
    const totalGuntas = Number((totalSft / SURVEY_CONVERSIONS.SFT_PER_GUNTA).toFixed(2));
    const hectares = Number((totalSft / SURVEY_CONVERSIONS.SFT_PER_HECTARE).toFixed(4));
    const cents = Number((totalSft / SURVEY_CONVERSIONS.SFT_PER_CENT).toFixed(2));
    const sqYards = Number((totalSft / SURVEY_CONVERSIONS.SFT_PER_SQ_YARD).toFixed(2));
    const ankanams = Number((totalSft / SURVEY_CONVERSIONS.SFT_PER_ANKANAM).toFixed(2));

    return {
      totalSft,
      acres,
      remainingGuntas,
      totalGuntas,
      hectares,
      cents,
      sqYards,
      ankanams,
      perimeterFt,
      totalRoadFrontageFt,
      vertices,
    };
  }, [segments, globalUnit]);

  // -------------------------------------------------------------------------
  // 4. BOUNDING BOX & AUTO-SCALING SVG VIEWBOX
  // -------------------------------------------------------------------------
  const svgViewBoxData = useMemo(() => {
    const { vertices } = calcResults;
    if (vertices.length === 0) return { viewBox: "0 0 400 400", scaleFactor: 1, cx: 200, cy: 200 };

    const xs = vertices.map((v) => v.x);
    const ys = vertices.map((v) => v.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const rawW = maxX - minX || 100;
    const rawH = maxY - minY || 100;

    // Add 25% padding so labels & road bars fit cleanly
    const pad = Math.max(rawW, rawH) * 0.25;

    const vbX = minX - pad + panOffset.x;
    const vbY = minY - pad + panOffset.y;
    const vbW = (rawW + pad * 2) / zoomLevel;
    const vbH = (rawH + pad * 2) / zoomLevel;

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    return {
      viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
      scaleFactor: Math.max(rawW, rawH) / 350,
      cx,
      cy,
      minX,
      maxX,
      minY,
      maxY,
      w: rawW,
      h: rawH,
    };
  }, [calcResults, zoomLevel, panOffset]);

  // -------------------------------------------------------------------------
  // 5. SEGMENT ACTIONS (ADD, REMOVE, UPDATE)
  // -------------------------------------------------------------------------
  const addSegment = () => {
    setSegments((prev) => {
      const nextIdx = prev.length;
      const fromP = getPointName(nextIdx);
      const toP = getPointName((nextIdx + 1) % (prev.length + 1));
      return [
        ...prev,
        {
          id: `seg_${Date.now()}_${nextIdx}`,
          fromPoint: fromP,
          toPoint: toP,
          length: 30,
          bearingAngle: 90,
          isRoadFacing: false,
          roadWidthFt: 0,
        },
      ];
    });
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 3) {
      alert("A land survey plot must contain at least 3 boundary segments.");
      return;
    }
    setSegments((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      // Re-index point names cleanly
      return filtered.map((s, idx) => ({
        ...s,
        fromPoint: getPointName(idx),
        toPoint: getPointName((idx + 1) % filtered.length),
      }));
    });
  };

  const updateSegment = (id: string, field: keyof SurveySegment, value: any) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const applyPreset = (preset: typeof PRESET_PLOTS[0]) => {
    setGlobalUnit(preset.unit || "ft");
    setSegments(preset.segments);
    setSurveyMode(preset.mode as "standard" | "acreage");
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Zoom & Pan Handlers
  const handleZoom = (delta: number) => {
    setZoomLevel((current) => Math.min(5, Math.max(0.5, current + delta)));
  };

  const resetCanvasView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePrintReport = () => {
    window.print();
  };

  const unitLabel = globalUnit === "ft" ? "Feet (ft)" : globalUnit === "m" ? "Meters (m)" : globalUnit === "chains" ? "Chains (ch)" : "Yards (yd)";

  return (
    <>
      <Head>
        <title>Land Survey Calculator &amp; Area Converter | BuildMitra</title>
        <meta
          name="description"
          content="High-precision Land Survey Calculator supporting small plots (30x40) up to 100+ Acres with SFT, Acres, Guntas, Hectares, Cents area breakdown and interactive SVG plot sketching."
        />
      </Head>

      <div style={{ padding: "16px", minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "Inter, sans-serif" }}>
        
        {/* HEADER BRANDING */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "16px", padding: "20px 24px", color: "#ffffff", marginBottom: "20px", boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ background: "rgba(34, 197, 94, 0.2)", border: "1px solid rgba(34, 197, 94, 0.4)", color: "#4ade80", padding: "3px 10px", borderRadius: "16px", fontSize: "11px", fontWeight: "800" }}>
                  IS &amp; REGIONAL LAND SURVEY TOOL
                </span>
                <span style={{ background: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.4)", color: "#60a5fa", padding: "3px 10px", borderRadius: "16px", fontSize: "11px", fontWeight: "800" }}>
                  SMALL PLOTS TO 100+ ACRES
                </span>
              </div>
              <h1 style={{ margin: "4px 0", fontSize: "24px", fontWeight: "900" }}>
                🗺️ Land Survey Calculator &amp; Area Converter
              </h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                Gauss Shoelace boundary solver supporting SFT, Acres &amp; Guntas, Hectares, Cents, Sq Yards &amp; Ankanams.
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px" }} className="no-print">
              <button
                type="button"
                onClick={handlePrintReport}
                style={{ background: "#2563eb", color: "#ffffff", border: 0, borderRadius: "8px", padding: "10px 16px", fontWeight: "800", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                🖨️ Download Executive Land Summary / Print
              </button>
            </div>
          </div>
        </div>

        <MarketRateTrend />

        {/* PRESET QUICK SELECTOR TOOLBAR */}
        <div style={{ background: "#ffffff", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", border: "1px solid #e2e8f0" }} className="no-print">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "#334155" }}>⚡ Quick Plot &amp; Acreage Presets:</span>
            
            {/* Mode Switcher Toggle */}
            <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <button
                type="button"
                onClick={() => setSurveyMode("standard")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: 0,
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  background: surveyMode === "standard" ? "#0f172a" : "transparent",
                  color: surveyMode === "standard" ? "#ffffff" : "#475569",
                }}
              >
                📐 Standard Plot Mode
              </button>
              <button
                type="button"
                onClick={() => setSurveyMode("acreage")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: 0,
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  background: surveyMode === "acreage" ? "#0f172a" : "transparent",
                  color: surveyMode === "acreage" ? "#ffffff" : "#475569",
                }}
              >
                🌾 Large Acreage / Boundary Mode
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "10px", overflowX: "auto", paddingBottom: "4px" }}>
            {PRESET_PLOTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  color: "#1e293b",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>📍 {preset.name}</span>
                <span style={{ background: "#e2e8f0", padding: "1px 6px", borderRadius: "4px", fontSize: "10px", color: "#0f172a" }}>
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN SPLIT-SCREEN LAYOUT */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px", alignItems: "start" }}>
          
          {/* ========================================================================= */}
          {/* LEFT PANEL: BOUNDARY EDITOR & PROJECT INPUTS */}
          {/* ========================================================================= */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Project Details */}
            <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                📋 Project &amp; Location Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "3px" }}>Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "3px" }}>Location / Village / Taluk</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "3px" }}>Surveyor / Engineer Name</label>
                  <input
                    type="text"
                    value={surveyorName}
                    onChange={(e) => setSurveyorName(e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Segment Inputs */}
            <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              
              {/* TOP GLOBAL UNIT SELECTOR & HEADER */}
              <div style={{ background: "#f1f5f9", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "900", color: "#0f172a" }}>📏 Input Unit:</span>
                  <select
                    value={globalUnit}
                    onChange={(e) => handleGlobalUnitChange(e.target.value as DistanceUnit)}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1.5px solid #2563eb", background: "#ffffff", fontSize: "12px", fontWeight: "900", color: "#1d4ed8", outline: "none", cursor: "pointer" }}
                  >
                    <option value="ft">Feet (ft)</option>
                    <option value="m">Meters (m / mtr)</option>
                    <option value="chains">Chains (ch)</option>
                    <option value="yards">Yards (yd)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={addSegment}
                  style={{ background: "#059669", color: "#ffffff", border: 0, borderRadius: "6px", padding: "6px 14px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                >
                  + Add Point
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                  📐 Dynamic Boundary Segments ({segments.length} Vertices)
                </h3>
                <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "700" }}>All values in {globalUnit}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "460px", overflowY: "auto", paddingRight: "4px" }}>
                {segments.map((seg, idx) => (
                  <div
                    key={seg.id}
                    style={{
                      background: seg.isRoadFacing ? "#f0fdf4" : "#f8fafc",
                      border: seg.isRoadFacing ? "1px solid #86efac" : "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "900", color: seg.isRoadFacing ? "#166534" : "#0f172a" }}>
                        Segment {idx + 1}: Edge {seg.fromPoint} → {seg.toPoint}
                      </span>
                      {segments.length > 3 && (
                        <button
                          type="button"
                          onClick={() => removeSegment(seg.id)}
                          style={{ background: "#ef4444", color: "#fff", border: 0, borderRadius: "4px", padding: "2px 6px", fontSize: "10px", fontWeight: "800", cursor: "pointer" }}
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", alignItems: "center" }}>
                      <div>
                        <label style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "2px" }}>
                          Length ({globalUnit})
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={seg.length}
                          onChange={(e) => updateSegment(seg.id, "length", Number(e.target.value))}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "800" }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "2px" }}>Turn Angle (°)</label>
                        <input
                          type="number"
                          min={0}
                          max={360}
                          value={seg.bearingAngle}
                          onChange={(e) => updateSegment(seg.id, "bearingAngle", Number(e.target.value))}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", paddingTop: "6px", borderTop: "1px dashed #cbd5e1" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "800", color: seg.isRoadFacing ? "#15803d" : "#475569", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={seg.isRoadFacing}
                          onChange={(e) => updateSegment(seg.id, "isRoadFacing", e.target.checked)}
                        />
                        🚗 Road Facing Edge
                      </label>

                      {seg.isRoadFacing && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#166534" }}>Road Width:</span>
                          <input
                            type="number"
                            placeholder="30"
                            value={seg.roadWidthFt || ""}
                            onChange={(e) => updateSegment(seg.id, "roadWidthFt", Number(e.target.value))}
                            style={{ width: "55px", padding: "3px 5px", borderRadius: "4px", border: "1px solid #86efac", fontSize: "11px", fontWeight: "800" }}
                          />
                          <span style={{ fontSize: "10px", color: "#166534" }}>ft</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT PANEL: VISUAL SKETCH & AREA OUTPUT MATRIX */}
          {/* ========================================================================= */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Multi-Unit Area Breakdown Cards */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                📊 Calculated Area Breakdown &amp; Regional Conversion Matrix
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }} className="results-grid">
                
                {/* Primary Square Feet Box */}
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px", borderRadius: "8px", gridColumn: "1 / -1" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#166534", textTransform: "uppercase" }}>Total Land Area (Square Feet)</span>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#15803d", margin: "2px 0" }}>
                    {formatIndianNumber(calcResults.totalSft, 2)} <span style={{ fontSize: "13px" }}>SFT</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#166534", fontWeight: "700" }}>
                    Equivalent to {calcResults.acres} Acres, {calcResults.remainingGuntas} Guntas
                  </span>
                </div>

                {/* Acres & Guntas */}
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#1e40af" }}>Acres &amp; Guntas</span>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#1d4ed8" }}>
                    {calcResults.acres} Ac {calcResults.remainingGuntas} Gun
                  </div>
                  <span style={{ fontSize: "9.5px", color: "#3b82f6" }}>Total: {calcResults.totalGuntas} Guntas</span>
                </div>

                {/* Hectares */}
                <div style={{ background: "#fdf4ff", border: "1px solid #f5d0fe", padding: "8px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#86198f" }}>Hectares (Ha)</span>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#a21caf" }}>
                    {calcResults.hectares} <span style={{ fontSize: "11px" }}>Ha</span>
                  </div>
                  <span style={{ fontSize: "9.5px", color: "#c026d3" }}>1 Ha = 2.471 Acres</span>
                </div>

                {/* Cents */}
                <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", padding: "8px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#9a3412" }}>Cents</span>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#c2410c" }}>
                    {formatIndianNumber(calcResults.cents, 2)} <span style={{ fontSize: "11px" }}>Cents</span>
                  </div>
                  <span style={{ fontSize: "9.5px", color: "#ea580c" }}>100 Cents = 1 Acre</span>
                </div>

                {/* Square Yards */}
                <div style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#334155" }}>Square Yards</span>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#0f172a" }}>
                    {formatIndianNumber(calcResults.sqYards, 2)} <span style={{ fontSize: "11px" }}>Sq Yd</span>
                  </div>
                  <span style={{ fontSize: "9.5px", color: "#64748b" }}>1 Sq Yd = 9 SFT</span>
                </div>

                {/* Ankanams */}
                <div style={{ background: "#fefce8", border: "1px solid #fef08a", padding: "8px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#854d0e" }}>Ankanams (AP/TG)</span>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#a16207" }}>
                    {formatIndianNumber(calcResults.ankanams, 2)} <span style={{ fontSize: "11px" }}>Ank</span>
                  </div>
                  <span style={{ fontSize: "9.5px", color: "#ca8a04" }}>1 Ankanam = 72 SFT</span>
                </div>

                {/* Total Perimeter */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#475569" }}>Total Perimeter</span>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#1e293b" }}>
                    {formatIndianNumber(calcResults.perimeterFt / (UNIT_TO_FT_FACTORS[globalUnit] || 1), 1)} <span style={{ fontSize: "11px" }}>{globalUnit}</span>
                  </div>
                  <span style={{ fontSize: "9.5px", color: "#64748b" }}>{formatIndianNumber(calcResults.perimeterFt, 1)} ft</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Plot Sketching Canvas */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                    🗺️ Auto-Scaling Interactive Plot Diagram
                  </h3>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Shows vertices, side lengths &amp; road frontage corridor</span>
                </div>

                {/* SVG Zoom & Pan Controls */}
                <div style={{ display: "flex", gap: "4px" }} className="no-print">
                  <button
                    type="button"
                    onClick={() => handleZoom(0.25)}
                    style={{ padding: "4px 8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoom(-0.25)}
                    style={{ padding: "4px 8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={resetCanvasView}
                    style={{ padding: "4px 8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}
                    title="Reset View"
                  >
                    ↺ Reset
                  </button>
                </div>
              </div>

              {/* SVG Canvas Container */}
              <div
                style={{
                  width: "100%",
                  height: "360px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "grab",
                }}
              >
                <svg
                  viewBox={svgViewBoxData.viewBox}
                  style={{ width: "100%", height: "100%", display: "block" }}
                >
                  <defs>
                    {/* Grid Pattern */}
                    <pattern id="surveyGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                    </pattern>
                  </defs>

                  <rect width="100%" height="100%" fill="url(#surveyGrid)" />

                  {/* Render Main Polygon Shape */}
                  {calcResults.vertices.length >= 3 && (
                    <polygon
                      points={calcResults.vertices.map((v) => `${v.x},${v.y}`).join(" ")}
                      fill="#10b9811f"
                      stroke="#059669"
                      strokeWidth={svgViewBoxData.scaleFactor * 2}
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Render Segment Lines & Road Facing Indicators */}
                  {segments.map((seg, i) => {
                    const v1 = calcResults.vertices[i];
                    const v2 = calcResults.vertices[(i + 1) % calcResults.vertices.length];

                    if (!v1 || !v2) return null;

                    const midX = (v1.x + v2.x) / 2;
                    const midY = (v1.y + v2.y) / 2;

                    return (
                      <g key={`edge_${i}`}>
                        {/* Road corridor double line indicator */}
                        {seg.isRoadFacing && (
                          <line
                            x1={v1.x}
                            y1={v1.y}
                            x2={v2.x}
                            y2={v2.y}
                            stroke="#334155"
                            strokeWidth={svgViewBoxData.scaleFactor * 7}
                            strokeDasharray={`${svgViewBoxData.scaleFactor * 4},${svgViewBoxData.scaleFactor * 2}`}
                            strokeLinecap="round"
                            opacity={0.8}
                          />
                        )}

                        {/* Edge line */}
                        <line
                          x1={v1.x}
                          y1={v1.y}
                          x2={v2.x}
                          y2={v2.y}
                          stroke={seg.isRoadFacing ? "#166534" : "#0284c7"}
                          strokeWidth={svgViewBoxData.scaleFactor * 2.5}
                        />

                        {/* Edge Distance Label */}
                        <text
                          x={midX}
                          y={midY - svgViewBoxData.scaleFactor * 4}
                          fill="#0f172a"
                          fontSize={svgViewBoxData.scaleFactor * 9}
                          fontWeight="800"
                          textAnchor="middle"
                          style={{ textShadow: "0 0 3px #ffffff, 0 0 3px #ffffff" }}
                        >
                          {seg.length} {globalUnit} {seg.isRoadFacing ? `(🚘 ${seg.roadWidthFt || 30}ft Road)` : ""}
                        </text>
                      </g>
                    );
                  })}

                  {/* Render Vertices & Points A, B, C */}
                  {calcResults.vertices.map((v, i) => (
                    <g key={`vertex_${i}`}>
                      <circle
                        cx={v.x}
                        cy={v.y}
                        r={svgViewBoxData.scaleFactor * 6}
                        fill="#059669"
                        stroke="#ffffff"
                        strokeWidth={svgViewBoxData.scaleFactor * 1.5}
                      />
                      <text
                        x={v.x}
                        y={v.y + svgViewBoxData.scaleFactor * 3.5}
                        fill="#ffffff"
                        fontSize={svgViewBoxData.scaleFactor * 7.5}
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {v.name}
                      </text>
                    </g>
                  ))}

                  {/* Center Badge showing Total Area */}
                  {calcResults.totalSft > 0 && (
                    <g transform={`translate(${svgViewBoxData.cx}, ${svgViewBoxData.cy})`}>
                      <rect
                        x={-svgViewBoxData.scaleFactor * 55}
                        y={-svgViewBoxData.scaleFactor * 20}
                        width={svgViewBoxData.scaleFactor * 110}
                        height={svgViewBoxData.scaleFactor * 40}
                        rx={svgViewBoxData.scaleFactor * 6}
                        fill="#0f172a"
                        opacity={0.92}
                      />
                      <text
                        x="0"
                        y={-svgViewBoxData.scaleFactor * 3}
                        fill="#4ade80"
                        fontSize={svgViewBoxData.scaleFactor * 9}
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {formatIndianNumber(calcResults.totalSft)} SFT
                      </text>
                      <text
                        x="0"
                        y={svgViewBoxData.scaleFactor * 10}
                        fill="#ffffff"
                        fontSize={svgViewBoxData.scaleFactor * 7.5}
                        fontWeight="800"
                        textAnchor="middle"
                      >
                        {calcResults.acres} Ac {calcResults.remainingGuntas} Guntas
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Boundary Vertices Schedule Table */}
            <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                📋 Boundary Schedule &amp; Road Access Summary
              </h3>
              <div className="table-responsive">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
                  <thead>
                    <tr style={{ background: "#0f172a", color: "#ffffff" }}>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Edge</th>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Length ({globalUnit})</th>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Length (ft)</th>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Road Facing</th>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Road Width</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((seg, idx) => {
                      const lenFt = seg.length * (UNIT_TO_FT_FACTORS[globalUnit] || 1);
                      return (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                          <td style={{ padding: "6px 8px", border: "1px solid #e2e8f0", fontWeight: "800" }}>{seg.fromPoint} → {seg.toPoint}</td>
                          <td style={{ padding: "6px 8px", border: "1px solid #e2e8f0", fontWeight: "700" }}>{seg.length} {globalUnit}</td>
                          <td style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}>{formatIndianNumber(lenFt, 1)} ft</td>
                          <td style={{ padding: "6px 8px", border: "1px solid #e2e8f0", color: seg.isRoadFacing ? "#166534" : "#64748b", fontWeight: "800" }}>
                            {seg.isRoadFacing ? "✓ Yes" : "No"}
                          </td>
                          <td style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}>
                            {seg.isRoadFacing ? `${seg.roadWidthFt || 30} ft Road` : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>

      <style jsx global>{`
        @media print {
          .no-print,
          nav,
          header,
          button {
            display: none !important;
          }
          body {
            background: #ffffff !important;
          }
        }
      `}</style>
    </>
  );
}
