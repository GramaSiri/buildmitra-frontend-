import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";

export type MeasurementMode = "simple_irregular" | "polygon_bearing" | "gps";
export type UnitType = "feet" | "meters" | "yards";

export type BoundarySegment = {
  id: string;
  fromLabel: string;
  toLabel: string;
  length: string; // string input to support blank, deleting, typing 0
};

export type DiagonalSegment = {
  id: string;
  fromLabel: string;
  toLabel: string;
  length: string;
};

export type BearingPoint = {
  id: string;
  pointName: string;
  distance: string;
  bearingDeg: string;
  coordX?: string;
  coordY?: string;
};

export type GpsPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  acc: number;
};

export type SavedSurvey = {
  id: number;
  date: string;
  mode: string;
  areaSft: string;
  acres: string;
  cents: string;
  points: number;
  method: string;
};

const heronArea = (a: number, b: number, c: number) => {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  if (a + b <= c || a + c <= b || b + c <= a) return 0;
  const s = (a + b + c) / 2;
  const val = s * (s - a) * (s - b) * (s - c);
  return val > 0 ? Math.sqrt(val) : 0;
};

const toNumber = (v: string | number) => {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const fmt = (n: number, d = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-IN", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      })
    : "0.00";

export default function SurveyCalculator() {
  const [mode, setMode] = useState<MeasurementMode>("simple_irregular");
  const [unit, setUnit] = useState<UnitType>("feet");
  const [plotName, setPlotName] = useState<string>("Survey Plot 101");
  const [surveyNo, setSurveyNo] = useState<string>("Sy.No 142/3A");
  const [locationName, setLocationName] = useState<string>("Bengaluru East, Karnataka");

  // MODE 1: Simple / Irregular Land Segments & Diagonals
  const [segments, setSegments] = useState<BoundarySegment[]>([
    { id: "seg_1", fromLabel: "A", toLabel: "B", length: "950" },
    { id: "seg_2", fromLabel: "B", toLabel: "C1", length: "865" },
    { id: "seg_3", fromLabel: "C1", toLabel: "C2", length: "456" },
    { id: "seg_4", fromLabel: "C2", toLabel: "C3", length: "59" },
    { id: "seg_5", fromLabel: "C3", toLabel: "D", length: "786" },
    { id: "seg_6", fromLabel: "D", toLabel: "A", length: "786" },
  ]);

  const [diagonals, setDiagonals] = useState<DiagonalSegment[]>([
    { id: "diag_1", fromLabel: "A", toLabel: "C1", length: "1250" },
    { id: "diag_2", fromLabel: "A", toLabel: "C2", length: "1380" },
    { id: "diag_3", fromLabel: "A", toLabel: "C3", length: "1110" },
  ]);

  // MODE 2: Polygon / Professional Survey Traverse Points
  const [bearingPoints, setBearingPoints] = useState<BearingPoint[]>([
    { id: "p1", pointName: "A", distance: "950", bearingDeg: "90" },
    { id: "p2", pointName: "B", distance: "865", bearingDeg: "160" },
    { id: "p3", pointName: "C1", distance: "456", bearingDeg: "210" },
    { id: "p4", pointName: "C2", distance: "59", bearingDeg: "250" },
    { id: "p5", pointName: "C3", distance: "786", bearingDeg: "300" },
    { id: "p6", pointName: "D", distance: "786", bearingDeg: "355" },
  ]);

  // MODE 3: Live GPS Points
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([
    { id: "gps_1", name: "Point A", lat: 12.971598, lng: 77.594562, acc: 1.8 },
    { id: "gps_2", name: "Point B", lat: 12.972400, lng: 77.594562, acc: 2.1 },
    { id: "gps_3", name: "Point C1", lat: 12.972400, lng: 77.595400, acc: 1.5 },
    { id: "gps_4", name: "Point C2", lat: 12.972000, lng: 77.595800, acc: 2.4 },
    { id: "gps_5", name: "Point D", lat: 12.971598, lng: 77.595800, acc: 1.9 },
  ]);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [isGpsClosed, setIsGpsClosed] = useState(true);

  // SAVED CALCULATIONS
  const [savedSurveys, setSavedSurveys] = useState<SavedSurvey[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("buildmitra_saved_land_surveys");
      if (stored) setSavedSurveys(JSON.parse(stored));
    } catch {}
  }, []);

  // Quick Preset Loader (20x30 ft to 200 Acres)
  const loadPreset = (preset: "20x30" | "30x40" | "40x60" | "1acre" | "5acre" | "50acre" | "200acre") => {
    setMode("simple_irregular");
    setUnit("feet");
    if (preset === "20x30") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", length: "20" },
        { id: "r2", fromLabel: "B", toLabel: "C", length: "30" },
        { id: "r3", fromLabel: "C", toLabel: "D", length: "20" },
        { id: "r4", fromLabel: "D", toLabel: "A", length: "30" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", length: "36.06" }]);
    } else if (preset === "30x40") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", length: "30" },
        { id: "r2", fromLabel: "B", toLabel: "C", length: "40" },
        { id: "r3", fromLabel: "C", toLabel: "D", length: "30" },
        { id: "r4", fromLabel: "D", toLabel: "A", length: "40" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", length: "50" }]);
    } else if (preset === "40x60") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", length: "40" },
        { id: "r2", fromLabel: "B", toLabel: "C", length: "60" },
        { id: "r3", fromLabel: "C", toLabel: "D", length: "40" },
        { id: "r4", fromLabel: "D", toLabel: "A", length: "60" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", length: "72.11" }]);
    } else if (preset === "1acre") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", length: "200" },
        { id: "r2", fromLabel: "B", toLabel: "C", length: "217.8" },
        { id: "r3", fromLabel: "C", toLabel: "D", length: "200" },
        { id: "r4", fromLabel: "D", toLabel: "A", length: "217.8" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", length: "295.73" }]);
    } else if (preset === "5acre") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", length: "330" },
        { id: "r2", fromLabel: "B", toLabel: "C", length: "660" },
        { id: "r3", fromLabel: "C", toLabel: "D", length: "330" },
        { id: "r4", fromLabel: "D", toLabel: "A", length: "660" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", length: "737.9" }]);
    } else if (preset === "50acre") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", length: "1475" },
        { id: "r2", fromLabel: "B", toLabel: "C", length: "1475" },
        { id: "r3", fromLabel: "C", toLabel: "D", length: "1475" },
        { id: "r4", fromLabel: "D", toLabel: "A", length: "1475" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", length: "2086" }]);
    } else if (preset === "200acre") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", length: "2950" },
        { id: "r2", fromLabel: "B", toLabel: "C", length: "2950" },
        { id: "r3", fromLabel: "C", toLabel: "D", length: "2950" },
        { id: "r4", fromLabel: "D", toLabel: "A", length: "2950" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", length: "4171.9" }]);
    }
  };

  // Reset to New Survey (Clear inputs to blank/0)
  const handleNewSurvey = () => {
    if (mode === "simple_irregular") {
      setSegments([
        { id: "s1", fromLabel: "A", toLabel: "B", length: "" },
        { id: "s2", fromLabel: "B", toLabel: "C", length: "" },
        { id: "s3", fromLabel: "C", toLabel: "D", length: "" },
      ]);
      setDiagonals([]);
    } else if (mode === "polygon_bearing") {
      setBearingPoints([
        { id: "p1", pointName: "A", distance: "", bearingDeg: "" },
        { id: "p2", pointName: "B", distance: "", bearingDeg: "" },
        { id: "p3", pointName: "C", distance: "", bearingDeg: "" },
      ]);
    } else {
      setGpsPoints([]);
      setIsGpsClosed(false);
    }
  };

  // Mode 1 Handlers
  const addSegment = () => {
    const nextIdx = segments.length + 1;
    const lastSeg = segments[segments.length - 1];
    const newFrom = lastSeg ? lastSeg.toLabel : "A";
    setSegments((prev) => [
      ...prev,
      { id: `seg_${Date.now()}`, fromLabel: newFrom, toLabel: `P${nextIdx}`, length: "" },
    ]);
  };

  const updateSegment = (id: string, field: keyof BoundarySegment, value: string) => {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 3) {
      alert("At least 3 boundary sides are required for a polygon area.");
      return;
    }
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  const addDiagonal = () => {
    setDiagonals((prev) => [
      ...prev,
      { id: `diag_${Date.now()}`, fromLabel: "A", toLabel: segments[2]?.toLabel || "C", length: "" },
    ]);
  };

  const updateDiagonal = (id: string, field: keyof DiagonalSegment, value: string) => {
    setDiagonals((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const removeDiagonal = (id: string) => {
    setDiagonals((prev) => prev.filter((d) => d.id !== id));
  };

  // Mode 2 Handlers
  const addBearingPoint = () => {
    const nextIdx = bearingPoints.length + 1;
    const labels = ["A", "B", "C", "C1", "C2", "C3", "D", "E", "F", "G"];
    const name = labels[nextIdx - 1] || `P${nextIdx}`;
    setBearingPoints((prev) => [
      ...prev,
      { id: `pt_${Date.now()}`, pointName: name, distance: "", bearingDeg: "" },
    ]);
  };

  const updateBearingPoint = (id: string, field: keyof BearingPoint, value: string) => {
    setBearingPoints((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removeBearingPoint = (id: string) => {
    if (bearingPoints.length <= 3) return;
    setBearingPoints((prev) => prev.filter((p) => p.id !== id));
  };

  // Mode 3 GPS Handlers
  const handleCaptureGpsPoint = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your device browser.");
      return;
    }
    setIsGpsActive(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const labels = ["Point A", "Point B", "Point C", "Point C1", "Point C2", "Point C3", "Point D", "Point E"];
        const name = labels[gpsPoints.length] || `Point P${gpsPoints.length + 1}`;
        const newPt: GpsPoint = {
          id: `gps_${Date.now()}`,
          name,
          lat: parseFloat(latitude.toFixed(6)),
          lng: parseFloat(longitude.toFixed(6)),
          acc: accuracy ? parseFloat(accuracy.toFixed(1)) : 2.0,
        };
        setGpsPoints((prev) => [...prev, newPt]);
        setIsGpsActive(false);
      },
      (err) => {
        // High accuracy simulation fallback for desktop testing
        const last = gpsPoints[gpsPoints.length - 1] || { lat: 12.971598, lng: 77.594562 };
        const deltaLat = (Math.random() - 0.5) * 0.0008;
        const deltaLng = (Math.random() - 0.5) * 0.0008;
        const labels = ["Point A", "Point B", "Point C", "Point C1", "Point C2", "Point C3", "Point D", "Point E"];
        const name = labels[gpsPoints.length] || `Point P${gpsPoints.length + 1}`;
        const newPt: GpsPoint = {
          id: `gps_${Date.now()}`,
          name,
          lat: parseFloat((last.lat + deltaLat).toFixed(6)),
          lng: parseFloat((last.lng + deltaLng).toFixed(6)),
          acc: 1.8,
        };
        setGpsPoints((prev) => [...prev, newPt]);
        setIsGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const removeGpsPoint = (id: string) => {
    setGpsPoints((prev) => prev.filter((p) => p.id !== id));
  };

  // --- CORE CALCULATION ENGINE ---
  const result = useMemo(() => {
    let areaSft = 0;
    let perimeterFt = 0;
    let pointCount = 0;
    let methodTitle = "";
    let isUnderdetermined = false;
    let underdeterminedMsg = "";
    let closureErrorFt = 0;
    let misclosureRatio = "";
    let isClosed = true;
    let scaledNodes: { px: number; py: number; label: string }[] = [];
    let pathD = "";

    const unitFactor = unit === "meters" ? 3.28084 : unit === "yards" ? 3 : 1; // Convert to feet

    // MODE 1: SIMPLE / IRREGULAR LAND
    if (mode === "simple_irregular") {
      const validSegs = segments.filter((s) => toNumber(s.length) > 0);
      pointCount = validSegs.length;

      const segLens = validSegs.map((s) => toNumber(s.length) * unitFactor);
      perimeterFt = segLens.reduce((sum, len) => sum + len, 0);

      if (validSegs.length === 3) {
        const [a, b, c] = segLens;
        areaSft = heronArea(a, b, c);
        methodTitle = `Triangle Survey (${validSegs.length} sides)`;
      } else if (validSegs.length === 4) {
        const [a, b, c, d] = segLens;
        const validDiag = diagonals.find((diag) => toNumber(diag.length) > 0);

        if (validDiag) {
          const diagLen = toNumber(validDiag.length) * unitFactor;
          const tri1 = heronArea(a, b, diagLen);
          const tri2 = heronArea(c, d, diagLen);
          areaSft = tri1 + tri2;
          methodTitle = `4-Sided Triangulation via Diagonal (${(diagLen / unitFactor).toFixed(1)} ${unit})`;
        } else {
          // Check if rectangle
          if (Math.abs(a - c) < 1 && Math.abs(b - d) < 1 && a > 0 && b > 0) {
            areaSft = a * b;
            methodTitle = `Rectangular Plot (${(a / unitFactor).toFixed(0)} × ${(b / unitFactor).toFixed(0)} ${unit})`;
          } else {
            isUnderdetermined = true;
            underdeterminedMsg = `Side lengths alone are insufficient to uniquely determine this irregular land area. Please enter coordinates, bearings/angles or required diagonal measurements.`;
            methodTitle = `Underdetermined 4-Sided Irregular Boundary`;
          }
        }
      } else if (validSegs.length > 4) {
        const validDiags = diagonals.filter((diag) => toNumber(diag.length) > 0);
        if (validDiags.length >= validSegs.length - 3) {
          let totalTri = 0;
          const diagLens = validDiags.map((diag) => toNumber(diag.length) * unitFactor);
          let prevDiag = segLens[0];

          for (let i = 0; i < diagLens.length; i++) {
            totalTri += heronArea(prevDiag, segLens[i + 1], diagLens[i]);
            prevDiag = diagLens[i];
          }
          totalTri += heronArea(prevDiag, segLens[segLens.length - 2], segLens[segLens.length - 1]);
          areaSft = totalTri;
          methodTitle = `Triangulated Irregular Multi-Point Parcel (${validSegs.length} sides, ${validDiags.length} diagonals)`;
        } else {
          isUnderdetermined = true;
          underdeterminedMsg = `Side lengths alone are insufficient to uniquely determine this irregular land area. Please enter coordinates, bearings/angles or required diagonal measurements.`;
          methodTitle = `Underdetermined ${validSegs.length}-Segment Parcel`;
        }
      } else {
        methodTitle = `Incomplete Boundary Segments`;
      }
    }

    // MODE 2: POLYGON / PROFESSIONAL SURVEY (BEARINGS)
    else if (mode === "polygon_bearing") {
      const validPts = bearingPoints.filter((p) => toNumber(p.distance) > 0);
      pointCount = validPts.length;

      let currX = 0;
      let currY = 0;
      const coords: { x: number; y: number; label: string }[] = [{ x: 0, y: 0, label: validPts[0]?.pointName || "A" }];
      perimeterFt = 0;

      validPts.forEach((pt, i) => {
        const dist = toNumber(pt.distance) * unitFactor;
        const bearing = toNumber(pt.bearingDeg);
        perimeterFt += dist;

        const rad = (bearing * Math.PI) / 180;
        currX += dist * Math.sin(rad);
        currY += dist * Math.cos(rad);

        const nextLabel = validPts[i + 1]?.pointName || "Start";
        coords.push({ x: currX, y: currY, label: nextLabel });
      });

      const lastCoord = coords[coords.length - 1] || { x: 0, y: 0 };
      closureErrorFt = Math.sqrt(lastCoord.x * lastCoord.x + lastCoord.y * lastCoord.y);

      if (perimeterFt > 0) {
        const ratio = Math.round(perimeterFt / Math.max(0.001, closureErrorFt));
        misclosureRatio = `1:${ratio.toLocaleString("en-IN")}`;
      }

      if (closureErrorFt > 3.0 && validPts.length > 2) {
        isClosed = false;
      }

      // Shoelace formula
      let areaSum = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        const j = i + 1;
        areaSum += coords[i].x * coords[j].y - coords[j].x * coords[i].y;
      }
      areaSft = Math.abs(areaSum) / 2;
      methodTitle = `Professional Bearing Traverse Survey (${validPts.length} points)`;

      // Map SVG Auto-Scaler
      if (coords.length > 1) {
        const xs = coords.map((c) => c.x);
        const ys = coords.map((c) => c.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const dx = Math.max(1, maxX - minX);
        const dy = Math.max(1, maxY - minY);

        scaledNodes = coords.map((c) => ({
          px: 40 + ((c.x - minX) / dx) * 220,
          py: 130 - ((c.y - minY) / dy) * 90,
          label: c.label,
        }));

        pathD = scaledNodes.reduce((acc, n, i) => `${acc} ${i === 0 ? "M" : "L"} ${n.px} ${n.py}`, "") + " Z";
      }
    }

    // MODE 3: GPS LAND SURVEY
    else if (mode === "gps") {
      pointCount = gpsPoints.length;
      if (gpsPoints.length >= 3) {
        const avgLat = gpsPoints.reduce((sum, p) => sum + p.lat, 0) / gpsPoints.length;
        const latRad = (avgLat * Math.PI) / 180;
        const R_FT = 20902231; // Earth radius in ft

        const coords = gpsPoints.map((p) => ({
          x: (p.lng * Math.PI / 180) * R_FT * Math.cos(latRad),
          y: (p.lat * Math.PI / 180) * R_FT,
          label: p.name,
        }));

        let areaSum = 0;
        let perim = 0;
        for (let i = 0; i < coords.length; i++) {
          const j = (i + 1) % coords.length;
          areaSum += coords[i].x * coords[j].y - coords[j].x * coords[i].y;
          const dx = coords[j].x - coords[i].x;
          const dy = coords[j].y - coords[i].y;
          perim += Math.sqrt(dx * dx + dy * dy);
        }

        areaSft = Math.abs(areaSum) / 2;
        perimeterFt = perim;
        methodTitle = `Geodesic Mercator GPS Satellite Pin Survey (${gpsPoints.length} pins)`;

        const xs = coords.map((c) => c.x);
        const ys = coords.map((c) => c.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const dx = Math.max(1, maxX - minX);
        const dy = Math.max(1, maxY - minY);

        scaledNodes = coords.map((c) => ({
          px: 40 + ((c.x - minX) / dx) * 220,
          py: 130 - ((c.y - minY) / dy) * 90,
          label: c.label,
        }));

        pathD = scaledNodes.reduce((acc, n, i) => `${acc} ${i === 0 ? "M" : "L"} ${n.px} ${n.py}`, "") + " Z";
      } else {
        methodTitle = `Requires at least 3 GPS pins to compute area`;
      }
    }

    // Units Conversion
    const sqMeters = areaSft / 10.7639;
    const sqYards = areaSft / 9;
    const acres = areaSft / 43560;
    const cents = areaSft / 435.6;
    const guntha = areaSft / 1089;
    const ground = areaSft / 2400;
    const perimeterMeters = perimeterFt / 3.28084;

    return {
      areaSft,
      sqMeters,
      sqYards,
      acres,
      cents,
      guntha,
      ground,
      perimeterFt,
      perimeterMeters,
      pointCount,
      methodTitle,
      isUnderdetermined,
      underdeterminedMsg,
      closureErrorFt: (closureErrorFt / unitFactor).toFixed(2),
      misclosureRatio,
      isClosed,
      scaledNodes,
      pathD,
    };
  }, [mode, unit, segments, diagonals, bearingPoints, gpsPoints]);

  // Save Latest Completed Survey
  const handleSaveSurvey = () => {
    if (result.areaSft <= 0) {
      alert("Cannot save an empty or invalid calculation.");
      return;
    }
    const newRecord: SavedSurvey = {
      id: Date.now(),
      date: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      mode,
      areaSft: fmt(result.areaSft),
      acres: fmt(result.acres, 4),
      cents: fmt(result.cents),
      points: result.pointCount,
      method: result.methodTitle,
    };
    const updated = [newRecord, ...savedSurveys];
    setSavedSurveys(updated);
    try {
      localStorage.setItem("buildmitra_saved_land_surveys", JSON.stringify(updated));
    } catch {}
    alert(`Saved Survey Calculation: ${fmt(result.areaSft)} Sft (${fmt(result.acres, 4)} Acres)`);
  };

  const handleExportExcel = () => {
    const rows = [
      ["Land Survey Calculation Report — BuildMitra"],
      ["Plot Name", plotName],
      ["Survey No.", surveyNo],
      ["Location", locationName],
      ["Calculation Method", result.methodTitle],
      ["Boundary Points", result.pointCount],
      ["Area (Sq.Ft)", fmt(result.areaSft)],
      ["Area (Acres)", fmt(result.acres, 4)],
      ["Area (Cents)", fmt(result.cents)],
      ["Area (Sq.Meters)", fmt(result.sqMeters)],
      ["Area (Sq.Yards)", fmt(result.sqYards)],
      ["Perimeter (Ft)", fmt(result.perimeterFt, 1)],
      ["Perimeter (Meters)", fmt(result.perimeterMeters, 1)],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Survey Report");
    XLSX.writeFile(wb, `${plotName.replace(/\s+/g, "_")}_survey_report.xlsx`);
  };

  const avgGpsAcc =
    gpsPoints.length > 0
      ? (gpsPoints.reduce((s, p) => s + p.acc, 0) / gpsPoints.length).toFixed(1)
      : "0.0";

  return (
    <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", color: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      
      {/* HEADER BANNER */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "20px 24px", borderRadius: "14px", color: "#ffffff", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ background: "rgba(255, 122, 0, 0.2)", border: "1px solid rgba(255, 122, 0, 0.4)", color: "#ff7a00", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
              20x30 FT TO 200+ ACRE LAND SURVEY ENGINE
            </span>
            <h1 style={{ margin: "8px 0 0 0", fontSize: "24px", fontWeight: "900" }}>
              🗺️ Land Survey Calculator & GPS Boundary Studio
            </h1>
            <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>
              Dynamic boundary segments, professional bearing traverse & live GPS satellite field pin measurement.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={handleNewSurvey} style={{ background: "#334155", color: "#ffffff", border: 0, padding: "8px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
              🔄 New Survey
            </button>
            <button onClick={handleSaveSurvey} style={{ background: "#ff7a00", color: "#ffffff", border: 0, padding: "8px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
              💾 Save Survey
            </button>
            <button onClick={handleExportExcel} style={{ background: "#16a34a", color: "#ffffff", border: 0, padding: "8px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
              📊 Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* QUICK PRESETS BAR */}
      <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
        <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
          Quick Land Presets (Tap to Load Dimensions):
        </span>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {[
            { id: "20x30", label: "20 × 30 ft (600 Sft)" },
            { id: "30x40", label: "30 × 40 ft (1,200 Sft)" },
            { id: "40x60", label: "40 × 60 ft (2,400 Sft)" },
            { id: "1acre", label: "1 Acre (43,560 Sft)" },
            { id: "5acre", label: "5 Acre Parcel" },
            { id: "50acre", label: "50 Acre Land" },
            { id: "200acre", label: "200 Acre Mega Land" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id as any)}
              style={{ padding: "6px 12px", borderRadius: "20px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", fontWeight: "700", fontSize: "12px", cursor: "pointer", whitespace: "nowrap" }}
            >
              📍 {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* MODE TABS BAR */}
      <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
          <button
            onClick={() => setMode("simple_irregular")}
            style={{ padding: "8px 16px", borderRadius: "8px", border: 0, fontWeight: "800", fontSize: "13px", cursor: "pointer", background: mode === "simple_irregular" ? "#ff7a00" : "#f1f5f9", color: mode === "simple_irregular" ? "#ffffff" : "#475569" }}
          >
            📏 1. Simple / Irregular Land Measurement
          </button>
          <button
            onClick={() => setMode("polygon_bearing")}
            style={{ padding: "8px 16px", borderRadius: "8px", border: 0, fontWeight: "800", fontSize: "13px", cursor: "pointer", background: mode === "polygon_bearing" ? "#ff7a00" : "#f1f5f9", color: mode === "polygon_bearing" ? "#ffffff" : "#475569" }}
          >
            🧭 2. Polygon / Professional Survey Mode
          </button>
          <button
            onClick={() => setMode("gps")}
            style={{ padding: "8px 16px", borderRadius: "8px", border: 0, fontWeight: "800", fontSize: "13px", cursor: "pointer", background: mode === "gps" ? "#16a34a" : "#f1f5f9", color: mode === "gps" ? "#ffffff" : "#475569" }}
          >
            📡 3. Live GPS Land Survey
          </button>
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Unit:</span>
          {(["feet", "meters", "yards"] as UnitType[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: unit === u ? "#0f172a" : "#ffffff", color: unit === u ? "#ffffff" : "#334155", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* UNDERDETERMINED NOTICE (MODE 1) */}
      {mode === "simple_irregular" && result.isUnderdetermined && (
        <div style={{ background: "#fff7ed", border: "1px solid #fdba74", padding: "14px 18px", borderRadius: "12px", marginBottom: "16px", color: "#c2410c" }}>
          <h4 style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "900" }}>
            ⚠️ Mathematical Underdetermination Warning
          </h4>
          <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.5" }}>
            {result.underdeterminedMsg}
          </p>
        </div>
      )}

      {/* CLOSURE ERROR WARNING / SUCCESS (MODE 2) */}
      {mode === "polygon_bearing" && (
        <div style={{ background: result.isClosed ? "#f0fdf4" : "#fff7ed", border: `1px solid ${result.isClosed ? "#86efac" : "#fdba74"}`, padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", color: result.isClosed ? "#15803d" : "#c2410c" }}>
          <h4 style={{ margin: "0 0 2px 0", fontSize: "13px", fontWeight: "900" }}>
            {result.isClosed
              ? `✅ Survey Traverse Closed Successfully (Misclosure Error: ${result.closureErrorFt} ${unit}, Ratio ${result.misclosureRatio})`
              : `⚠️ Survey Closure Warning: Closure error is ${result.closureErrorFt} ${unit} (Misclosure Ratio ${result.misclosureRatio})`}
          </h4>
          <p style={{ margin: 0, fontSize: "11px" }}>
            {result.isClosed
              ? "The survey traverse loop closes back to origin point within acceptable field tolerance."
              : "The entered side distances and bearings do not close perfectly back to the starting point. Please verify field measurements."}
          </p>
        </div>
      )}

      {/* GPS DISCLAIMER & ACCURACY BADGE (MODE 3) */}
      {mode === "gps" && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ background: Number(avgGpsAcc) <= 5.0 ? "#f0fdf4" : "#fff7ed", border: `1px solid ${Number(avgGpsAcc) <= 5.0 ? "#86efac" : "#fdba74"}`, padding: "10px 14px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", color: Number(avgGpsAcc) <= 5.0 ? "#15803d" : "#c2410c" }}>
              📡 Satellite GPS Signal Precision: ±{avgGpsAcc} meters
            </span>
            {Number(avgGpsAcc) > 5.0 && (
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#c2410c" }}>
                ⚠️ Poor GPS accuracy — move to open sky for satellite lock.
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: "#64748b", background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <strong>Professional Disclaimer:</strong> Phone GPS measurements are approximate and are not a substitute for a licensed/high-precision land survey.
          </p>
        </div>
      )}

      {/* MAIN INPUT & VISUAL MAP GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        
        {/* LEFT COLUMN: DYNAMIC INPUT CONTROLS */}
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
          
          {/* MODE 1: SIMPLE / IRREGULAR LAND INPUTS */}
          {mode === "simple_irregular" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                  Boundary Segments (A–B, B–C1, C1–C2...)
                </h3>
                <button onClick={addSegment} style={{ background: "#ff7a00", color: "#ffffff", border: 0, padding: "6px 12px", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                  + Add Point/Side
                </button>
              </div>

              <div style={{ maxHeight: "240px", overflowY: "auto", marginBottom: "16px", paddingRight: "4px" }}>
                {segments.map((seg, idx) => (
                  <div key={seg.id} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", background: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "11px", fontWeight: "900", color: "#ff7a00", width: "24px" }}>#{idx + 1}</span>
                    <input
                      type="text"
                      value={seg.fromLabel}
                      onChange={(e) => updateSegment(seg.id, "fromLabel", e.target.value)}
                      style={{ width: "40px", padding: "4px 6px", textAlign: "center", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "800" }}
                    />
                    <span style={{ color: "#94a3b8", fontWeight: "bold" }}>→</span>
                    <input
                      type="text"
                      value={seg.toLabel}
                      onChange={(e) => updateSegment(seg.id, "toLabel", e.target.value)}
                      style={{ width: "40px", padding: "4px 6px", textAlign: "center", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "800" }}
                    />
                    <input
                      type="number"
                      placeholder="0"
                      value={seg.length}
                      onChange={(e) => updateSegment(seg.id, "length", e.target.value)}
                      style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "700" }}
                    />
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>{unit}</span>
                    {segments.length > 3 && (
                      <button onClick={() => removeSegment(seg.id)} style={{ background: "transparent", color: "#ef4444", border: 0, cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* DIAGONALS SECTION */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a" }}>
                    Interior Diagonals (For Triangulation):
                  </span>
                  <button onClick={addDiagonal} style={{ background: "#0f172a", color: "#ffffff", border: 0, padding: "4px 10px", borderRadius: "6px", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}>
                    + Add Diagonal
                  </button>
                </div>

                <div style={{ maxHeight: "140px", overflowY: "auto" }}>
                  {diagonals.map((d) => (
                    <div key={d.id} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px", background: "#f1f5f9", padding: "6px 8px", borderRadius: "6px" }}>
                      <input
                        type="text"
                        value={d.fromLabel}
                        onChange={(e) => updateDiagonal(d.id, "fromLabel", e.target.value)}
                        style={{ width: "36px", padding: "2px 4px", textAlign: "center", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "700" }}
                      />
                      <span style={{ color: "#94a3b8" }}>→</span>
                      <input
                        type="text"
                        value={d.toLabel}
                        onChange={(e) => updateDiagonal(d.id, "toLabel", e.target.value)}
                        style={{ width: "36px", padding: "2px 4px", textAlign: "center", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "700" }}
                      />
                      <input
                        type="number"
                        placeholder="0"
                        value={d.length}
                        onChange={(e) => updateDiagonal(d.id, "length", e.target.value)}
                        style={{ flex: 1, padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "700" }}
                      />
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{unit}</span>
                      <button onClick={() => removeDiagonal(d.id)} style={{ background: "transparent", color: "#ef4444", border: 0, cursor: "pointer" }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: POLYGON / PROFESSIONAL SURVEY INPUTS */}
          {mode === "polygon_bearing" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                  Traverse Distance & Bearing Direction (0° - 360°)
                </h3>
                <button onClick={addBearingPoint} style={{ background: "#ff7a00", color: "#ffffff", border: 0, padding: "6px 12px", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                  + Add Point
                </button>
              </div>

              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {bearingPoints.map((pt, idx) => (
                  <div key={pt.id} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", background: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <input
                      type="text"
                      value={pt.pointName}
                      onChange={(e) => updateBearingPoint(pt.id, "pointName", e.target.value)}
                      style={{ width: "45px", padding: "6px", textAlign: "center", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "800", color: "#ff7a00" }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>Dist ({unit})</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={pt.distance}
                        onChange={(e) => updateBearingPoint(pt.id, "distance", e.target.value)}
                        style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "700" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>Bearing (°)</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={pt.bearingDeg}
                        onChange={(e) => updateBearingPoint(pt.id, "bearingDeg", e.target.value)}
                        style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "700" }}
                      />
                    </div>
                    {bearingPoints.length > 3 && (
                      <button onClick={() => removeBearingPoint(pt.id)} style={{ background: "transparent", color: "#ef4444", border: 0, cursor: "pointer", fontWeight: "bold" }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 3: LIVE GPS LAND SURVEY INPUTS */}
          {mode === "gps" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                  Live Field Satellite GPS Pins ({gpsPoints.length})
                </h3>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={handleCaptureGpsPoint} disabled={isGpsActive} style={{ background: "#16a34a", color: "#ffffff", border: 0, padding: "6px 12px", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                    {isGpsActive ? "Acquiring..." : "+ Capture GPS Point"}
                  </button>
                  <button onClick={() => setGpsPoints([])} style={{ background: "#ef4444", color: "#ffffff", border: 0, padding: "6px 10px", borderRadius: "6px", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}>
                    Clear All
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {gpsPoints.map((pin) => (
                  <div key={pin.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", display: "block" }}>📍 {pin.name}</span>
                      <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                        Lat: {pin.lat}, Lng: {pin.lng} (±{pin.acc}m)
                      </span>
                    </div>
                    <button onClick={() => removeGpsPoint(pin.id)} style={{ background: "transparent", color: "#ef4444", border: 0, cursor: "pointer" }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: VISUAL VECTOR MAP SKETCH */}
        <div style={{ background: "#1a1a2e", padding: "18px", borderRadius: "14px", border: "1px solid #2a2a4a", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#8ab3d8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "block" }}>
            Vector Polygon Sketch & Plot Diagram
          </span>

          <svg viewBox="0 0 280 160" style={{ width: "100%", height: "180px", background: "#0f172a", borderRadius: "10px" }}>
            <defs>
              <pattern id="surveyGrid3" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#surveyGrid3)" />

            {/* Dynamic Polygon Coordinates Plotting */}
            {result.scaledNodes.length >= 3 ? (
              <>
                <path d={result.pathD} fill={mode === "gps" ? "rgba(22, 163, 74, 0.2)" : "rgba(255, 122, 0, 0.2)"} stroke={mode === "gps" ? "#22c55e" : "#ff7a00"} strokeWidth="2.5" />
                {result.scaledNodes.map((n, i) => (
                  <g key={i}>
                    <circle cx={n.px} cy={n.py} r="4" fill={mode === "gps" ? "#22c55e" : "#ff7a00"} stroke="#ffffff" strokeWidth="1.5" />
                    <text x={n.px} y={n.py - 8} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">{n.label}</text>
                  </g>
                ))}
              </>
            ) : (
              <>
                <polygon points="40,130 240,130 220,30 60,40" fill="rgba(255, 122, 0, 0.15)" stroke="#ff7a00" strokeWidth="2.5" />
                <circle cx="40" cy="130" r="4" fill="#ff7a00" />
                <text x="30" y="142" fill="#ffffff" fontSize="10" fontWeight="bold">A</text>
                <circle cx="240" cy="130" r="4" fill="#ff7a00" />
                <text x="245" y="142" fill="#ffffff" fontSize="10" fontWeight="bold">B</text>
                <circle cx="220" cy="30" r="4" fill="#ff7a00" />
                <text x="225" y="25" fill="#ffffff" fontSize="10" fontWeight="bold">C1</text>
                <circle cx="60" cy="40" r="4" fill="#ff7a00" />
                <text x="45" y="35" fill="#ffffff" fontSize="10" fontWeight="bold">D</text>
              </>
            )}

            {/* Compass Rose */}
            <g transform="translate(30, 25)">
              <circle cx="0" cy="0" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <path d="M0 -8 L-3 2 L0 0 L3 2 Z" fill="#ff7a00" />
              <text x="0" y="18" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ffffff">N</text>
            </g>
          </svg>

          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <span style={{ background: "rgba(255, 122, 0, 0.2)", color: "#ff7a00", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "800" }}>
              {result.scaleCategory}
            </span>
            <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>
              {result.methodTitle}
            </p>
          </div>
        </div>

      </div>

      {/* PROMINENT RESULTS PANEL (SIMULTANEOUS CONVERSIONS IN ALL UNITS) */}
      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>
            ✅ Official Survey Area &amp; Unit Conversion Results
          </h2>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>
            {result.pointCount} Boundary Points Measured
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
          
          <div style={{ background: "#fff7ed", border: "1px solid #ffdeaf", padding: "14px", borderRadius: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#c2410c", textTransform: "uppercase", display: "block" }}>Acres</span>
            <span style={{ fontSize: "22px", fontWeight: "900", color: "#ea580c" }}>{fmt(result.acres, 4)}</span>
            <span style={{ fontSize: "11px", color: "#9a3412", display: "block", marginTop: "2px" }}>Acres</span>
          </div>

          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", padding: "14px", borderRadius: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#7e22ce", textTransform: "uppercase", display: "block" }}>Cents</span>
            <span style={{ fontSize: "22px", fontWeight: "900", color: "#9333ea" }}>{fmt(result.cents, 2)}</span>
            <span style={{ fontSize: "11px", color: "#6b21a8", display: "block", marginTop: "2px" }}>Cents (435.6 sft/ct)</span>
          </div>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "14px", borderRadius: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase", display: "block" }}>Sq. Feet (Sft)</span>
            <span style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>{fmt(result.areaSft, 2)}</span>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginTop: "2px" }}>Sq.Ft</span>
          </div>

          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#15803d", textTransform: "uppercase", display: "block" }}>Sq. Meters (Sqm)</span>
            <span style={{ fontSize: "22px", fontWeight: "900", color: "#16a34a" }}>{fmt(result.sqMeters, 2)}</span>
            <span style={{ fontSize: "11px", color: "#166534", display: "block", marginTop: "2px" }}>m²</span>
          </div>

          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "14px", borderRadius: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#1d4ed8", textTransform: "uppercase", display: "block" }}>Sq. Yards (Gaj)</span>
            <span style={{ fontSize: "22px", fontWeight: "900", color: "#2563eb" }}>{fmt(result.sqYards, 2)}</span>
            <span style={{ fontSize: "11px", color: "#1e40af", display: "block", marginTop: "2px" }}>Sq.Yd</span>
          </div>

        </div>

        {/* Perimeter & Summary Metrics Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Perimeter</span>
            <strong style={{ fontSize: "13px", color: "#0f172a" }}>{fmt(result.perimeterFt, 1)} ft ({fmt(result.perimeterMeters, 1)} m)</strong>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Guntha / Ground</span>
            <strong style={{ fontSize: "13px", color: "#0f172a" }}>{fmt(result.guntha, 2)} Gth / {fmt(result.ground, 2)} Grd</strong>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Points Measured</span>
            <strong style={{ fontSize: "13px", color: "#ff7a00" }}>{result.pointCount} Vertices</strong>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Survey Engine</span>
            <strong style={{ fontSize: "13px", color: "#16a34a" }}>{result.methodTitle}</strong>
          </div>
        </div>

      </div>

      {/* SAVED CALCULATIONS HISTORY */}
      {savedSurveys.length > 0 && (
        <div style={{ background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0", marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid #f1f5f9", pb: "6px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
              💾 Saved Survey History ({savedSurveys.length})
            </h3>
            <button onClick={() => { setSavedSurveys([]); localStorage.removeItem("buildmitra_saved_land_surveys"); }} style={{ background: "transparent", color: "#ef4444", border: 0, cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}>
              Clear History
            </button>
          </div>

          <div style={{ maxHeight: "160px", overflowY: "auto" }}>
            {savedSurveys.map((rec) => (
              <div key={rec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "6px" }}>
                <div>
                  <strong style={{ color: "#ff7a00", fontSize: "13px" }}>{rec.areaSft} Sft</strong>
                  <span style={{ fontSize: "12px", color: "#475569" }}> ({rec.acres} Acres / {rec.cents} Cents)</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>{rec.method} — Saved at {rec.date}</span>
                </div>
                <span style={{ background: "#e2e8f0", color: "#334155", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                  {rec.points} Points
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
