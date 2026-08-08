import React, { useState, useMemo } from "react";
import Head from "next/head";
import useRouter from "next/router";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";

export type MeasurementMode = "layman" | "polygon";
export type UnitType = "meters" | "feet" | "yards";

export type BoundarySegment = {
  id: string;
  fromLabel: string;
  toLabel: string;
  length: number;
  diagonalTo?: string;
  diagonalLength?: number;
  notes?: string;
};

// Preset Examples
const LAYMAN_DEFAULT_SEGMENTS: BoundarySegment[] = [
  { id: "seg_1", fromLabel: "A", toLabel: "B", length: 150 },
  { id: "seg_2", fromLabel: "B1", toLabel: "B2", length: 45 },
  { id: "seg_3", fromLabel: "B2", toLabel: "C", length: 125 },
  { id: "seg_4", fromLabel: "C1", toLabel: "C2", length: 65 },
  { id: "seg_5", fromLabel: "C2", toLabel: "D", length: 145 },
  { id: "seg_6", fromLabel: "D1", toLabel: "D2", length: 25 },
  { id: "seg_7", fromLabel: "D2", toLabel: "D3", length: 15 },
  { id: "seg_8", fromLabel: "D3", toLabel: "A", length: 145 },
];

export type AdvancedPoint = {
  id: string;
  pointName: string;
  distance: number;
  bearingDeg: number;
};

const ADVANCED_DEFAULT_POINTS: AdvancedPoint[] = [
  { id: "p1", pointName: "P1 (A)", distance: 150, bearingDeg: 0 },
  { id: "p2", pointName: "P2 (B)", distance: 125, bearingDeg: 90 },
  { id: "p3", pointName: "P3 (C)", distance: 145, bearingDeg: 180 },
  { id: "p4", pointName: "P4 (D)", distance: 145, bearingDeg: 270 },
];

export default function LandSurveyCalculator() {
  const [mode, setMode] = useState<MeasurementMode>("layman");
  const [unit, setUnit] = useState<UnitType>("meters");
  const [plotName, setPlotName] = useState<string>("Survey Plot 101");
  const [surveyNo, setSurveyNo] = useState<string>("Sy.No 142/3A");
  const [locationName, setLocationName] = useState<string>("Bengaluru East, Karnataka");

  // Layman Segments State
  const [segments, setSegments] = useState<BoundarySegment[]>(LAYMAN_DEFAULT_SEGMENTS);

  // Advanced Traverse Points State
  const [advancedPoints, setAdvancedPoints] = useState<AdvancedPoint[]>(ADVANCED_DEFAULT_POINTS);

  // Manual Diagonal Cross Ties for Exact Layman Triangulation
  const [diagonal1, setDiagonal1] = useState<number>(180);
  const [diagonal2, setDiagonal2] = useState<number>(160);

  // --------------------------------------------------------------------------
  // LAYMAN SEGMENT CONTROLS
  // --------------------------------------------------------------------------
  const updateSegment = (id: string, field: keyof BoundarySegment, value: any) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addSegment = () => {
    const nextIdx = segments.length + 1;
    const lastSeg = segments[segments.length - 1];
    const newFrom = lastSeg ? lastSeg.toLabel : `P${nextIdx}`;
    const newTo = `P${nextIdx + 1}`;
    setSegments((prev) => [
      ...prev,
      {
        id: `seg_${Date.now()}_${Math.random()}`,
        fromLabel: newFrom,
        toLabel: newTo,
        length: 50,
      },
    ]);
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 3) {
      alert("A land boundary requires at least 3 points/sides to form a closed area.");
      return;
    }
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  const loadLaymanPreset = (presetType: "layman_example" | "rectangle" | "triangle" | "l_shape") => {
    if (presetType === "layman_example") {
      setSegments(LAYMAN_DEFAULT_SEGMENTS);
      setUnit("meters");
    } else if (presetType === "rectangle") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", length: 100 },
        { id: "r2", fromLabel: "B", toLabel: "C", length: 60 },
        { id: "r3", fromLabel: "C", toLabel: "D", length: 100 },
        { id: "r4", fromLabel: "D", toLabel: "A", length: 60 },
      ]);
      setUnit("feet");
    } else if (presetType === "triangle") {
      setSegments([
        { id: "t1", fromLabel: "A", toLabel: "B", length: 120 },
        { id: "t2", fromLabel: "B", toLabel: "C", length: 90 },
        { id: "t3", fromLabel: "C", toLabel: "A", length: 150 },
      ]);
      setUnit("meters");
    } else if (presetType === "l_shape") {
      setSegments([
        { id: "l1", fromLabel: "A", toLabel: "B", length: 80 },
        { id: "l2", fromLabel: "B", toLabel: "C", length: 40 },
        { id: "l3", fromLabel: "C", toLabel: "D", length: 40 },
        { id: "l4", fromLabel: "D", toLabel: "E", length: 40 },
        { id: "l5", fromLabel: "E", toLabel: "F", length: 40 },
        { id: "l6", fromLabel: "F", toLabel: "A", length: 80 },
      ]);
      setUnit("feet");
    }
  };

  // --------------------------------------------------------------------------
  // ADVANCED TRAVERSE CONTROLS
  // --------------------------------------------------------------------------
  const updateAdvPoint = (id: string, field: keyof AdvancedPoint, value: any) => {
    setAdvancedPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addAdvPoint = () => {
    const nextIdx = advancedPoints.length + 1;
    setAdvancedPoints((prev) => [
      ...prev,
      {
        id: `p_${Date.now()}`,
        pointName: `P${nextIdx}`,
        distance: 50,
        bearingDeg: (nextIdx * 60) % 360,
      },
    ]);
  };

  const removeAdvPoint = (id: string) => {
    if (advancedPoints.length <= 3) {
      alert("Traverse boundary requires at least 3 points.");
      return;
    }
    setAdvancedPoints((prev) => prev.filter((p) => p.id !== id));
  };

  // --------------------------------------------------------------------------
  // AREA & PERIMETER CALCULATION ENGINE
  // --------------------------------------------------------------------------
  const surveyCalculations = useMemo(() => {
    let totalPerimeterUnit = 0;
    let areaSqMeters = 0;
    const polygonNodes: { x: number; y: number; label: string; len: number }[] = [];

    if (mode === "layman") {
      totalPerimeterUnit = segments.reduce((sum, s) => sum + (Number(s.length) || 0), 0);

      // Reconstruct 2D polygon vertices using sequential chain angle heuristic & closure
      const n = segments.length;
      const angleStep = (2 * Math.PI) / n;
      let currX = 0;
      let currY = 0;
      let currentHeading = 0;

      polygonNodes.push({ x: 0, y: 0, label: segments[0]?.fromLabel || "A", len: 0 });

      segments.forEach((seg, idx) => {
        const len = Number(seg.length) || 0;
        // Direction change heuristic for closed polygon loop
        const dx = len * Math.cos(currentHeading);
        const dy = len * Math.sin(currentHeading);
        currX += dx;
        currY += dy;

        polygonNodes.push({
          x: currX,
          y: currY,
          label: seg.toLabel || `P${idx + 1}`,
          len,
        });

        currentHeading += angleStep;
      });

      // Calculate Area using Shoelace Polygon Formula on reconstructed nodes
      let sumShoelace = 0;
      for (let i = 0; i < polygonNodes.length - 1; i++) {
        const p1 = polygonNodes[i];
        const p2 = polygonNodes[i + 1];
        sumShoelace += p1.x * p2.y - p2.x * p1.y;
      }
      let rawArea = Math.abs(sumShoelace) / 2;

      // Convert rawArea to Sq Meters based on selected input unit
      if (unit === "meters") {
        areaSqMeters = rawArea;
      } else if (unit === "feet") {
        areaSqMeters = rawArea * 0.092903;
      } else if (unit === "yards") {
        areaSqMeters = rawArea * 0.836127;
      }
    } else {
      // ADVANCED TRAVERSE BEARING MODE
      totalPerimeterUnit = advancedPoints.reduce((sum, p) => sum + (Number(p.distance) || 0), 0);

      let currX = 0;
      let currY = 0;
      polygonNodes.push({ x: 0, y: 0, label: advancedPoints[0]?.pointName || "P1", len: 0 });

      advancedPoints.forEach((pt) => {
        const dist = Number(pt.distance) || 0;
        const rad = ((Number(pt.bearingDeg) || 0) * Math.PI) / 180;
        currX += dist * Math.sin(rad);
        currY += dist * Math.cos(rad);
        polygonNodes.push({
          x: currX,
          y: currY,
          label: pt.pointName,
          len: dist,
        });
      });

      let sumShoelace = 0;
      for (let i = 0; i < polygonNodes.length - 1; i++) {
        const p1 = polygonNodes[i];
        const p2 = polygonNodes[i + 1];
        sumShoelace += p1.x * p2.y - p2.x * p1.y;
      }
      let rawArea = Math.abs(sumShoelace) / 2;

      if (unit === "meters") {
        areaSqMeters = rawArea;
      } else if (unit === "feet") {
        areaSqMeters = rawArea * 0.092903;
      } else if (unit === "yards") {
        areaSqMeters = rawArea * 0.836127;
      }
    }

    // Units Conversion Matrix
    const sqFeet = areaSqMeters * 10.7639;
    const acres = sqFeet / 43560;
    const guntas = sqFeet / 1089; // 1 Gunta = 1089 sq.ft (Karnataka/Telangana/MH)
    const cents = sqFeet / 435.6; // 1 Cent = 435.6 sq.ft (TN/Kerala/AP)
    const ankanam = sqFeet / 72; // 1 Ankanam = 72 sq.ft (Rayalaseema/Nellore)
    const grounds = sqFeet / 2400; // 1 Ground = 2400 sq.ft (Chennai)
    const bigha = sqFeet / 27225; // 1 Bigha ~ 27,225 sq.ft (North India)
    const hectares = areaSqMeters / 10000; // 1 Hectare = 10,000 m²

    // Convert total perimeter into feet and meters
    const perimeterMeters = unit === "meters" ? totalPerimeterUnit : unit === "feet" ? totalPerimeterUnit * 0.3048 : totalPerimeterUnit * 0.9144;
    const perimeterFeet = perimeterMeters * 3.28084;

    return {
      nodes: polygonNodes,
      totalPerimeterUnit,
      perimeterMeters,
      perimeterFeet,
      areaSqMeters,
      sqFeet,
      acres,
      guntas,
      cents,
      ankanam,
      grounds,
      bigha,
      hectares,
    };
  }, [mode, unit, segments, advancedPoints]);

  // --------------------------------------------------------------------------
  // SVG BOUNDARY POLYGON CANVASS SCALING
  // --------------------------------------------------------------------------
  const svgMap = useMemo(() => {
    const nodes = surveyCalculations.nodes;
    if (!nodes || nodes.length === 0) return { pathD: "", viewBox: "0 0 500 400", scaledNodes: [] };

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);

    const pad = 50;
    const svgW = 600;
    const svgH = 420;

    const scaleX = (svgW - pad * 2) / width;
    const scaleY = (svgH - pad * 2) / height;
    const scale = Math.min(scaleX, scaleY);

    const scaledNodes = nodes.map((n) => ({
      ...n,
      px: pad + (n.x - minX) * scale,
      py: svgH - pad - (n.y - minY) * scale,
    }));

    let pathD = "";
    scaledNodes.forEach((sn, idx) => {
      if (idx === 0) {
        pathD += `M ${sn.px} ${sn.py}`;
      } else {
        pathD += ` L ${sn.px} ${sn.py}`;
      }
    });
    pathD += " Z";

    return { pathD, viewBox: `0 0 ${svgW} ${svgH}`, scaledNodes };
  }, [surveyCalculations.nodes]);

  // --------------------------------------------------------------------------
  // EXPORT EXCEL REPORT
  // --------------------------------------------------------------------------
  const exportToExcel = () => {
    const wsData = [
      ["BUILDMITRA LAND SURVEY & PLOT MEASUREMENT REPORT"],
      ["Plot Name", plotName],
      ["Survey Number", surveyNo],
      ["Location", locationName],
      ["Measurement Mode", mode === "layman" ? "Simple Boundary Chain Mode (Layman)" : "Advanced Polygon Bearing Mode"],
      ["Input Unit", unit.toUpperCase()],
      [],
      ["SURVEY SUMMARY RESULTS"],
      ["Total Area (Sq.Meters)", surveyCalculations.areaSqMeters.toFixed(2)],
      ["Total Area (Sq.Feet)", surveyCalculations.sqFeet.toFixed(2)],
      ["Total Area (Acres)", surveyCalculations.acres.toFixed(4)],
      ["Total Area (Guntas)", surveyCalculations.guntas.toFixed(2)],
      ["Total Area (Cents)", surveyCalculations.cents.toFixed(2)],
      ["Total Area (Hectares)", surveyCalculations.hectares.toFixed(4)],
      ["Total Perimeter (Meters)", surveyCalculations.perimeterMeters.toFixed(2)],
      ["Total Perimeter (Feet)", surveyCalculations.perimeterFeet.toFixed(2)],
      [],
      ["BOUNDARY SEGMENT MEASUREMENT BREAKDOWN"],
      mode === "layman"
        ? ["From Point", "To Point", `Length (${unit})`]
        : ["Point Name", `Distance (${unit})`, "Bearing Angle (Deg)"],
    ];

    if (mode === "layman") {
      segments.forEach((s) => {
        wsData.push([s.fromLabel, s.toLabel, s.length.toString()]);
      });
    } else {
      advancedPoints.forEach((p) => {
        wsData.push([p.pointName, p.distance.toString(), p.bearingDeg.toString()]);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Land Survey Report");
    XLSX.writeFile(wb, `${plotName.replace(/\s+/g, "_")}_Land_Survey_Report.xlsx`);
  };

  const shareOnWhatsApp = () => {
    const text = `🗺️ *BUILDMITRA LAND SURVEY REPORT*
📌 *Plot:* ${plotName} (${surveyNo})
📍 *Location:* ${locationName}

📐 *TOTAL PLOT AREA SUMMARY:*
• *Sq.Feet:* ${surveyCalculations.sqFeet.toLocaleString("en-IN", { maximumFractionDigits: 1 })} sq.ft
• *Sq.Meters:* ${surveyCalculations.areaSqMeters.toLocaleString("en-IN", { maximumFractionDigits: 1 })} m²
• *Acres:* ${surveyCalculations.acres.toFixed(3)} Acres
• *Guntas:* ${surveyCalculations.guntas.toFixed(2)} Guntas
• *Cents:* ${surveyCalculations.cents.toFixed(2)} Cents
• *Perimeter:* ${surveyCalculations.perimeterFeet.toFixed(1)} FT (${surveyCalculations.perimeterMeters.toFixed(1)} m)

Generated using BuildMitra Architectural & Land Survey Engine.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <>
      <Head>
        <title>BuildMitra — Land Survey & Plot Measurement Calculator</title>
        <meta name="description" content="Simple layman and professional land survey calculator for instant plot area calculation in sq.ft, sq.m, acres, guntas, and cents." />
      </Head>

      <Sidebar currentPath="/land-survey-calculator">
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px", color: "#1e293b", fontFamily: "system-ui, -apple-system, sans-serif" }}>
          
          {/* TOP BANNER HEADER */}
          <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "#ffffff", padding: "24px", borderRadius: "16px", marginBottom: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ background: "#ff7a00", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                🗺️ Professional &amp; Layman Land Survey Tool
              </span>
              <h1 style={{ margin: "8px 0 4px", fontSize: "24px", fontWeight: "900" }}>
                Land Survey &amp; Plot Area Calculator
              </h1>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                Zero math required for laymen! Enter side measurements directly (e.g. A-B, B1-B2, B2-C) for instant Land Area calculation in Sq.Ft, Sq.M, Acres, Guntas &amp; Cents.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={exportToExcel} style={{ padding: "10px 18px", background: "#16a34a", color: "#fff", border: 0, borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                📊 Export Excel
              </button>
              <button onClick={shareOnWhatsApp} style={{ padding: "10px 18px", background: "#25D366", color: "#fff", border: 0, borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                💬 Share WhatsApp
              </button>
            </div>
          </div>

          {/* MODE SELECTOR & INPUT UNIT TOP BAR */}
          <div style={{ background: "#ffffff", padding: "18px 24px", borderRadius: "14px", border: "1px solid #cbd5e1", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            
            {/* Mode Switcher */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#64748b", marginBottom: "6px" }}>
                MEASUREMENT TYPE / MODE
              </label>
              <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                <button
                  onClick={() => setMode("layman")}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: 0,
                    fontSize: "12px",
                    fontWeight: "bold",
                    background: mode === "layman" ? "#ff7a00" : "transparent",
                    color: mode === "layman" ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  🟢 Normal Boundary Mode (Layman Entry)
                </button>
                <button
                  onClick={() => setMode("polygon")}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: 0,
                    fontSize: "12px",
                    fontWeight: "bold",
                    background: mode === "polygon" ? "#0284c7" : "transparent",
                    color: mode === "polygon" ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  📐 Advanced Polygon / Traverse (Degree Mode)
                </button>
              </div>
            </div>

            {/* Unit Switcher */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#64748b", marginBottom: "6px" }}>
                MEASUREMENT UNIT
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "bold", background: "#f8fafc", color: "#0f172a", minWidth: "150px" }}
              >
                <option value="meters">Meters (m)</option>
                <option value="feet">Feet (ft)</option>
                <option value="yards">Yards (yd)</option>
              </select>
            </div>

            {/* Quick Presets */}
            {mode === "layman" && (
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#64748b", marginBottom: "6px" }}>
                  PRESET TEMPLATES
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => loadLaymanPreset("layman_example")} style={{ padding: "6px 12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                    Layman A-B, B1-B2 Plot
                  </button>
                  <button onClick={() => loadLaymanPreset("rectangle")} style={{ padding: "6px 12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                    Standard 4-Side Plot
                  </button>
                  <button onClick={() => loadLaymanPreset("l_shape")} style={{ padding: "6px 12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                    L-Shaped Land
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* MAIN CONTENT GRID (LEFT FORM INPUTS | RIGHT RESULTS & SVG MAP) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>

            {/* LEFT PANEL: MEASUREMENT INPUT TABLE */}
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              
              {/* Plot Meta Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#64748b", marginBottom: "3px" }}>PLOT NAME</label>
                  <input type="text" value={plotName} onChange={(e) => setPlotName(e.target.value)} style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#64748b", marginBottom: "3px" }}>SURVEY NO / SY NO</label>
                  <input type="text" value={surveyNo} onChange={(e) => setSurveyNo(e.target.value)} style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#64748b", marginBottom: "3px" }}>LOCATION</label>
                  <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }} />
                </div>
              </div>

              {/* LAYMAN NORMAL MODE INPUT FORM */}
              {mode === "layman" ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "14px", color: "#0f172a", fontWeight: "bold" }}>
                        🟢 Boundary Measurements (Layman Chain Mode)
                      </h3>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
                        Enter consecutive point measurements (e.g. A-B = 150, B1-B2 = 45, B2-C = 125):
                      </p>
                    </div>
                    <button onClick={addSegment} style={{ padding: "6px 12px", background: "#ff7a00", color: "#fff", border: 0, borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                      + Add Point / Side
                    </button>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "2px solid #cbd5e1" }}>
                        <th style={{ padding: "8px", textAlign: "left" }}>#</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>From Point</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>To Point</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Length ({unit})</th>
                        <th style={{ padding: "8px", textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segments.map((seg, idx) => (
                        <tr key={seg.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px", fontWeight: "bold", color: "#64748b" }}>{idx + 1}</td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="text"
                              value={seg.fromLabel}
                              onChange={(e) => updateSegment(seg.id, "fromLabel", e.target.value)}
                              style={{ width: "65px", padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontWeight: "bold", textAlign: "center" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="text"
                              value={seg.toLabel}
                              onChange={(e) => updateSegment(seg.id, "toLabel", e.target.value)}
                              style={{ width: "65px", padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontWeight: "bold", textAlign: "center" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              value={seg.length || ""}
                              onChange={(e) => updateSegment(seg.id, "length", parseFloat(e.target.value) || 0)}
                              style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid #0284c7", fontWeight: "bold", color: "#0369a1" }}
                            />
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            <button
                              onClick={() => removeSegment(seg.id)}
                              style={{ padding: "4px 8px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* ADVANCED TRAVERSE DEGREE MODE */
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "14px", color: "#0f172a", fontWeight: "bold" }}>
                        📐 Advanced Polygon / Traverse (Degree &amp; Bearing Mode)
                      </h3>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
                        For surveyor compass / total station bearing and distance inputs:
                      </p>
                    </div>
                    <button onClick={addAdvPoint} style={{ padding: "6px 12px", background: "#0284c7", color: "#fff", border: 0, borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                      + Add Station
                    </button>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "2px solid #cbd5e1" }}>
                        <th style={{ padding: "8px", textAlign: "left" }}>Station</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Distance ({unit})</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Bearing Angle (°)</th>
                        <th style={{ padding: "8px", textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advancedPoints.map((pt, idx) => (
                        <tr key={pt.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="text"
                              value={pt.pointName}
                              onChange={(e) => updateAdvPoint(pt.id, "pointName", e.target.value)}
                              style={{ width: "80px", padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontWeight: "bold" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              value={pt.distance || ""}
                              onChange={(e) => updateAdvPoint(pt.id, "distance", parseFloat(e.target.value) || 0)}
                              style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid #0284c7", fontWeight: "bold" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              value={pt.bearingDeg || 0}
                              onChange={(e) => updateAdvPoint(pt.id, "bearingDeg", parseFloat(e.target.value) || 0)}
                              style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", fontWeight: "bold" }}
                            />
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            <button
                              onClick={() => removeAdvPoint(pt.id)}
                              style={{ padding: "4px 8px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: RESULTS & VISUAL BOUNDARY SVG CANVAS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* TOTAL PLOT AREA CARDS MATRIX */}
              <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#ff7a00", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  📊 Instant Calculated Land Area
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ background: "rgba(255,255,255,0.06)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>TOTAL AREA (SQUARE FEET)</div>
                    <div style={{ fontSize: "24px", fontWeight: "900", color: "#38bdf8", marginTop: "2px" }}>
                      {surveyCalculations.sqFeet.toLocaleString("en-IN", { maximumFractionDigits: 1 })} <span style={{ fontSize: "14px" }}>SQ.FT</span>
                    </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.06)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>TOTAL AREA (SQUARE METERS)</div>
                    <div style={{ fontSize: "24px", fontWeight: "900", color: "#4ade80", marginTop: "2px" }}>
                      {surveyCalculations.areaSqMeters.toLocaleString("en-IN", { maximumFractionDigits: 1 })} <span style={{ fontSize: "14px" }}>SQ.M</span>
                    </div>
                  </div>
                </div>

                {/* Regional Units Matrix */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", fontSize: "11px" }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px 10px", borderRadius: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Acres:</span> <b style={{ color: "#ffffff" }}>{surveyCalculations.acres.toFixed(3)}</b>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px 10px", borderRadius: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Guntas:</span> <b style={{ color: "#ffffff" }}>{surveyCalculations.guntas.toFixed(2)}</b>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px 10px", borderRadius: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Cents:</span> <b style={{ color: "#ffffff" }}>{surveyCalculations.cents.toFixed(2)}</b>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px 10px", borderRadius: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Hectares:</span> <b style={{ color: "#ffffff" }}>{surveyCalculations.hectares.toFixed(3)}</b>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px 10px", borderRadius: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Ankanam:</span> <b style={{ color: "#ffffff" }}>{surveyCalculations.ankanam.toFixed(1)}</b>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px 10px", borderRadius: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>Perimeter:</span> <b style={{ color: "#ffffff" }}>{surveyCalculations.perimeterFeet.toFixed(1)} FT</b>
                  </div>
                </div>
              </div>

              {/* VISUAL 2D CAD BOUNDARY MAP */}
              <div style={{ background: "#ffffff", padding: "18px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "14px", color: "#0f172a", fontWeight: "bold" }}>
                    🗺️ Visual Land Boundary Map
                  </h3>
                  <span style={{ fontSize: "10px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: "#64748b", fontWeight: "bold" }}>
                    Auto-Drawn Vector Map
                  </span>
                </div>

                <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "12px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <svg viewBox={svgMap.viewBox} width="100%" height="320" style={{ background: "#0f172a", borderRadius: "8px" }}>
                    {/* Grid Pattern */}
                    <defs>
                      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.4" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Polygon Path fill and boundary stroke */}
                    {svgMap.pathD && (
                      <path
                        d={svgMap.pathD}
                        fill="rgba(56, 189, 248, 0.15)"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="none"
                      />
                    )}

                    {/* Node points and text tags */}
                    {svgMap.scaledNodes.map((n, idx) => (
                      <g key={idx}>
                        <circle cx={n.px} cy={n.py} r="5" fill="#ff7a00" stroke="#ffffff" strokeWidth="2" />
                        <text
                          x={n.px}
                          y={n.py - 10}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill="#ffffff"
                        >
                          {n.label}
                        </text>
                      </g>
                    ))}

                    {/* Compass North Arrow */}
                    <g transform="translate(40, 45)">
                      <circle cx="0" cy="0" r="16" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                      <path d="M0 -12 L-5 4 L0 0 L5 4 Z" fill="#ff7a00" />
                      <text x="0" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">N</text>
                    </g>
                  </svg>
                </div>
              </div>

            </div>

          </div>

        </div>
      </Sidebar>
    </>
  );
}
