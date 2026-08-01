import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

type SurveyPoint = { id: number; name: string; distance: number; bearing: number };
type PlotType = { id: number; name: string; width: number; depth: number; allocation: number };
type AmenityKey = typeof AMENITIES[number];
type XY = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
type DevelopmentStrategy = "Maximize Plots" | "Balanced Development" | "Premium Development" | "User Controlled Allocation";

type GeneratedPlot = Box & {
  number: number;
  type: string;
  width: number;
  depth: number;
  area: number;
  roadAccess: boolean;
  absorbedBufferArea: number;
  extended?: boolean;
  adjusted?: boolean;
  premium?: boolean;
  corner?: boolean;
  odd?: boolean;
  shape?: XY[];
};

type AmenityBox = Box & { name: string; color: string };
type BoqRow = { category: string; item: string; qty: number; unit: string; rate: number; amount: number };

const AMENITIES = [
  "Park",
  "Children Park",
  "Club House",
  "Swimming Pool",
  "STP",
  "UG Tank",
  "Overhead Tank",
  "Jogging Track",
  "Open Gym",
  "Temple",
  "Commercial Block",
  "Security Cabin",
  "Visitors Parking",
  "Compound Wall",
  "Main Entrance Arch",
  "Transformer Yard",
  "Rain Water Harvesting",
  "Landscape Area"
] as const;

const PARK_NAMES = new Set<string>(["Park", "Children Park", "Landscape Area", "Jogging Track", "Open Gym"]);
const UTILITY_NAMES = new Set<string>(["STP", "UG Tank", "Overhead Tank", "Transformer Yard", "Rain Water Harvesting"]);

const COLORS = {
  road: "#334155",
  plot: "#fef3c7",
  plotStroke: "#b45309",
  standard: "#fef3c7",
  extended: "#d1fae5",
  adjusted: "#ffedd5",
  premium: "#dbeafe",
  corner: "#e0e7ff",
  odd: "#ffe4e6",
  park: "#bbf7d0",
  amenity: "#bfdbfe",
  utility: "#ddd6fe",
  commercial: "#fed7aa"
};

const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);
const num = (n: number, d = 0) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: d }).format(Number.isFinite(n) ? n : 0);

const pointInPolygon = (p: XY, poly: XY[]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (((a.y > p.y) !== (b.y > p.y)) && (p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y || 1e-9) + a.x)) inside = !inside;
  }
  return inside;
};

const boxInside = (b: Box, poly: XY[]) =>
  [{ x: b.x, y: b.y }, { x: b.x + b.w, y: b.y }, { x: b.x + b.w, y: b.y + b.h }, { x: b.x, y: b.y + b.h }, { x: b.x + b.w / 2, y: b.y + b.h / 2 }].every(
    p => pointInPolygon(p, poly) || poly.some(v => Math.abs(v.x - p.x) < 0.01 && Math.abs(v.y - p.y) < 0.01)
  );

const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.w - 0.01 && a.x + a.w > b.x + 0.01 && a.y < b.y + b.h - 0.01 && a.y + a.h > b.y + 0.01;

const polygonArea = (poly: XY[]) =>
  Math.abs(poly.reduce((s, p, i) => {
    const q = poly[(i + 1) % poly.length];
    return s + p.x * q.y - q.x * p.y;
  }, 0)) / 2;

const perimeter = (poly: XY[]) =>
  poly.reduce((s, p, i) => {
    const q = poly[(i + 1) % poly.length];
    return s + Math.hypot(q.x - p.x, q.y - p.y);
  }, 0);

function surveyPolygon(points: SurveyPoint[]) {
  const poly: XY[] = [{ x: 0, y: 0 }];
  for (let i = 0; i < points.length - 1; i++) {
    const p = poly[i], rad = points[i].bearing * Math.PI / 180;
    poly.push({ x: p.x + points[i].distance * Math.sin(rad), y: p.y + points[i].distance * Math.cos(rad) });
  }
  const last = poly[poly.length - 1], closing = Math.hypot(last.x, last.y), stated = points[points.length - 1]?.distance || 0;
  return { poly, closureError: Math.abs(closing - stated), closingDistance: closing };
}

function makeAmenityBoxes(poly: XY[], selected: AmenityKey[], gross: number, bounds: { minX: number; minY: number; maxX: number; maxY: number }, forbidden: Box[] = []): AmenityBox[] {
  if (!selected.length) return [];
  const bw = bounds.maxX - bounds.minX, bh = bounds.maxY - bounds.minY, blockW = Math.max(35, bw * 0.17), share = Math.min(gross * 0.16, gross * (0.025 + selected.length * 0.0075)), each = share / selected.length, blockH = Math.max(24, Math.min(bh * 0.13, each / blockW));
  const boxes: AmenityBox[] = [];
  selected.forEach((name, i) => {
    let b: Box | null = null;
    for (let attempt = 0; attempt < 80 && !b; attempt++) {
      const col = attempt % 5, row = Math.floor(attempt / 5), candidate = { x: bounds.minX + bw * 0.025 + col * (blockW + bw * 0.012), y: bounds.minY + bh * 0.025 + row * (blockH + bh * 0.01), w: blockW, h: blockH };
      if (boxInside(candidate, poly) && ![...forbidden, ...boxes].some(o => overlaps(candidate, o))) b = candidate;
    }
    if (!b) b = { x: bounds.minX + bw * 0.03 + (i % 3) * blockW, y: bounds.minY + bh * 0.03 + Math.floor(i / 3) * blockH, w: blockW, h: blockH };
    const color = PARK_NAMES.has(name) ? COLORS.park : UTILITY_NAMES.has(name) ? COLORS.utility : name === "Commercial Block" ? COLORS.commercial : COLORS.amenity;
    boxes.push({ ...b, name, color });
  });
  return boxes;
}

function generateLayout(points: SurveyPoint[], plotTypes: PlotType[], selected: AmenityKey[], mainRoad: number, internalRoad: number, numberingStart: number) {
  const survey = surveyPolygon(points), poly = survey.poly, gross = polygonArea(poly), xs = poly.map(p => p.x), ys = poly.map(p => p.y), bounds = { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  const bw = bounds.maxX - bounds.minX, bh = bounds.maxY - bounds.minY, roadX = bounds.minX + bw * 0.52, internalRoadYs = [0.25, 0.5, 0.75].map(v => bounds.minY + bh * v);
  const roadBoxes: Box[] = [{ x: roadX - mainRoad / 2, y: bounds.minY, w: mainRoad, h: bh }, ...internalRoadYs.map(y => ({ x: bounds.minX, y: y - internalRoad / 2, w: bw, h: internalRoad }))];
  const amenityBoxes = makeAmenityBoxes(poly, selected, gross, bounds, roadBoxes), active = plotTypes.filter(p => p.allocation > 0 && p.width > 0 && p.depth > 0), sequence: PlotType[] = [];
  active.forEach(t => { for (let i = 0; i < Math.max(1, Math.round(t.allocation / 5)); i++) sequence.push(t); });
  const plots: GeneratedPlot[] = [], occupied: Box[] = [...roadBoxes, ...amenityBoxes];
  let seq = 0, number = Math.max(1, Math.round(numberingStart) || 101);

  const accept = (b: Box, t: PlotType) => {
    if (!boxInside(b, poly) || occupied.some(o => overlaps(b, o))) return;
    const touchesMain = Math.abs(b.x + b.w - (roadX - mainRoad / 2)) <= 2 || Math.abs(b.x - (roadX + mainRoad / 2)) <= 2;
    const isExtended = (b.w > t.width + 0.5 || b.h > t.depth + 0.5);
    plots.push({
      ...b,
      number: number++,
      type: isExtended ? "Extended Plot" : t.name,
      width: t.width,
      depth: t.depth,
      area: t.width * t.depth,
      roadAccess: true,
      absorbedBufferArea: isExtended ? (b.w - t.width) * t.depth : 0,
      extended: isExtended,
      corner: touchesMain
    });
    occupied.push(b);
  };

  if (sequence.length) {
    internalRoadYs.forEach(roadY => {
      for (let x = bounds.minX; x < bounds.maxX;) {
        const t = sequence[seq++ % sequence.length], w = t.width, d = t.depth;
        accept({ x, y: roadY - internalRoad / 2 - d, w, h: d }, t);
        accept({ x, y: roadY + internalRoad / 2, w, h: d }, t);
        x += w;
      }
    });
  }

  const mainRoadArea = bh * mainRoad, internalRoadArea = bw * internalRoad * internalRoadYs.length, roadArea = Math.min(gross * 0.35, mainRoadArea + internalRoadArea - mainRoad * internalRoad * internalRoadYs.length), saleableArea = plots.reduce((s, p) => s + p.area, 0);
  const amenityTarget = Math.min(gross * 0.16, gross * (0.025 + selected.length * 0.0075)), parkArea = selected.some(a => PARK_NAMES.has(a)) ? amenityTarget * selected.filter(a => PARK_NAMES.has(a)).length / selected.length : 0, utilityArea = selected.some(a => UTILITY_NAMES.has(a)) ? amenityTarget * selected.filter(a => UTILITY_NAMES.has(a)).length / selected.length : gross * 0.02;

  return { ...survey, poly, gross, bounds, bw, bh, roadX, internalRoadYs, roadArea, parkArea, amenityArea: Math.max(0, amenityTarget - parkArea), utilityArea, plots, amenityBoxes, saleableArea, geometryValidated: true, roadLength: bh + bw * internalRoadYs.length };
}

function buildBoq(layout: ReturnType<typeof generateLayout>, selected: AmenityKey[]): BoqRow[] {
  const has = (n: AmenityKey) => selected.includes(n), r = (category: string, item: string, qty: number, unit: string, rate: number): BoqRow => ({ category, item, qty, unit, rate, amount: qty * rate });
  return [
    r("Preliminaries", "Site clearing & grubbing", layout.gross, "sqft", 4),
    r("Earthwork", "Earthwork cutting & levelling", layout.gross * 0.35, "cft", 18),
    r("Road Works", "Main road 40ft formation", layout.bh, "rft", 2200),
    r("Road Works", "Internal 30ft road formation", layout.bw * layout.internalRoadYs.length, "rft", 1450),
    r("Road Works", "WMM & asphalt road paving", layout.roadArea, "sqft", 120),
    r("Drainage", "RCC storm water side drains", layout.roadLength * 2, "rft", 450),
    r("Water Supply", "Piped water supply lines", layout.roadLength, "rft", 280),
    r("Sewerage", "Underground sewer lines", layout.roadLength, "rft", 360),
    r("Utilities", "STP Plant (100 KLD)", has("STP") ? 1 : 0, "LS", 1800000),
    r("Utilities", "Underground water storage tank", has("UG Tank") ? 1 : 0, "LS", 950000),
    r("Site Works", "Perimeter compound wall", has("Compound Wall") ? perimeter(layout.poly) : 0, "rft", 1200),
    r("Site Works", "Grand entrance arch & gate", has("Main Entrance Arch") ? 1 : 0, "nos", 800000),
    r("Electrical", "LED street lights & cabling", Math.ceil(layout.roadLength / 100), "nos", 30000),
    r("Electrical", "Electrical transformer yard", has("Transformer Yard") ? 1 : 0, "LS", 1200000),
    r("Amenities", "Clubhouse & community center", has("Club House") ? layout.gross * 0.015 : 0, "sqft", 2500),
    r("Amenities", "Park & landscape development", has("Landscape Area") || has("Park") ? layout.parkArea : 0, "sqft", 120)
  ];
}

function LayoutSvg({ layout, mainRoad, internalRoad, selected }: { layout: ReturnType<typeof generateLayout>; mainRoad: number; internalRoad: number; selected: AmenityKey[] }) {
  const { bounds, bw, bh } = layout, pad = 70, scale = Math.min(820 / (bw || 1), 560 / (bh || 1)), sx = (x: number) => pad + (x - bounds.minX) * scale, sy = (y: number) => pad + (bounds.maxY - y) * scale, path = layout.poly.map((p, i) => (i ? "L" : "M") + sx(p.x) + "," + sy(p.y)).join(" ") + " Z";
  const roadYs = layout.internalRoadYs.map(sy), roadX = sx(layout.roadX), mainW = mainRoad * scale, internalH = internalRoad * scale;
  return (
    <svg id="layout-svg" viewBox="0 0 960 720" width="100%" style={{ minWidth: 760, display: "block" }} role="img" aria-label="Generated residential layout plan">
      <defs><clipPath id="siteClip"><path d={path} /></clipPath></defs>
      <rect width="960" height="720" fill="#fffef9" />
      <text x="24" y="28" fontSize="16" fontWeight="800" fill="#0f172a">BUILDMITRA — MASTER TOWNSHIP LAYOUT & PLOT SUBDIVISION PLAN</text>
      <text x="24" y="45" fontSize="8" fill="#64748b">PLOTTED DEVELOPMENT • OPTIMAL ROAD NETWORK • ALL DIMENSIONS IN FEET</text>

      {/* COMPASS ROSES */}
      <g transform="translate(900 62)">
        <text y="-24" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0f172a">N</text>
        <path d="M0,-18 L-9,9 L0,4 L9,9 Z" fill="#1f2937" />
        <line y1="-18" y2="25" stroke="#1f2937" strokeWidth="1.5" />
      </g>

      <g clipPath="url(#siteClip)">
        <rect x={roadX - mainW / 2} y={pad} width={mainW} height={bh * scale} fill={COLORS.road} />
        {roadYs.map((y, i) => <rect key={i} x={pad} y={y - internalH / 2} width={bw * scale} height={internalH} fill="#64748b" />)}
        <line x1={roadX} y1={pad} x2={roadX} y2={pad + bh * scale} stroke="white" strokeDasharray="12 8" />
        {roadYs.map((y, i) => <line key={i} x1={pad} y1={y} x2={pad + bw * scale} y2={y} stroke="white" strokeDasharray="10 7" />)}

        {layout.amenityBoxes.map((a, i) => (
          <g key={i}>
            <rect x={sx(a.x)} y={sy(a.y + a.h)} width={a.w * scale} height={a.h * scale} fill={a.color} stroke="#334155" strokeWidth="1" />
            <text x={sx(a.x + a.w / 2)} y={sy(a.y + a.h / 2)} textAnchor="middle" fontSize={Math.max(6, Math.min(10, a.w * scale / 9))} fontWeight="800" fill="#0f172a">{a.name.toUpperCase()}</text>
          </g>
        ))}

        {layout.plots.map(p => (
          <g key={p.number}>
            <rect x={sx(p.x)} y={sy(p.y + p.h)} width={p.w * scale} height={p.h * scale} fill={p.extended ? COLORS.extended : p.corner ? COLORS.corner : COLORS.plot} stroke={p.extended ? "#047857" : COLORS.plotStroke} strokeWidth="1" />
            <text x={sx(p.x + p.w / 2)} y={sy(p.y + p.h / 2) - 2} textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#0f172a">#{p.number}</text>
            <text x={sx(p.x + p.w / 2)} y={sy(p.y + p.h / 2) + 7} textAnchor="middle" fontSize="6" fill="#334155">{p.width}×{p.depth}</text>
          </g>
        ))}
      </g>

      <path d={path} fill="none" stroke="#111827" strokeWidth={selected.includes("Compound Wall") ? 4 : 2} />
      {layout.poly.map((p, i) => (
        <g key={i}>
          <circle cx={sx(p.x)} cy={sy(p.y)} r="4" fill="#7f1d1d" />
          <text x={sx(p.x) + 6} y={sy(p.y) - 6} fontSize="8" fontWeight="800" fill="#7f1d1d">{String.fromCharCode(65 + i)}</text>
        </g>
      ))}

      <g>
        <line x1={pad} y1={pad + bh * scale + 22} x2={pad + bw * scale} y2={pad + bh * scale + 22} stroke="#334155" />
        <text x={pad + bw * scale / 2} y={pad + bh * scale + 37} textAnchor="middle" fontSize="8" fill="#334155" fontWeight="700">BOUNDING WIDTH {num(bw, 1)} FT</text>
        <line x1={pad - 22} y1={pad} x2={pad - 22} y2={pad + bh * scale} stroke="#334155" />
        <text x={pad - 36} y={pad + bh * scale / 2} transform={`rotate(-90 ${pad - 36} ${pad + bh * scale / 2})`} textAnchor="middle" fontSize="8" fill="#334155" fontWeight="700">BOUNDING LENGTH {num(bh, 1)} FT</text>
      </g>

      <text x={roadX + 8} y={pad + bh * scale * 0.88} transform={`rotate(-90 ${roadX + 8} ${pad + bh * scale * 0.88})`} textAnchor="middle" fontSize="8" fill="white" fontWeight="800">MAIN ROAD • {mainRoad} FT</text>
      {roadYs.map((y, i) => <text key={i} x={pad + bw * scale * 0.78} y={y + 4} textAnchor="middle" fontSize="7" fill="white" fontWeight="700">INTERNAL ROAD {i + 1} • {internalRoad} FT</text>)}
    </svg>
  );
}

export default function PlotLayoutPage() {
  const router = useRouter();

  const [points, setPoints] = useState<SurveyPoint[]>([
    { id: 1, name: "A", distance: 200, bearing: 90 },
    { id: 2, name: "B", distance: 435, bearing: 180 },
    { id: 3, name: "C", distance: 200, bearing: 270 },
    { id: 4, name: "D", distance: 435, bearing: 0 }
  ]);

  const [plotTypes, setPlotTypes] = useState<PlotType[]>([
    { id: 1, name: "30x40 Standard", width: 30, depth: 40, allocation: 40 },
    { id: 2, name: "30x50 Premium", width: 30, depth: 50, allocation: 30 },
    { id: 3, name: "40x60 Villa Plot", width: 40, depth: 60, allocation: 30 }
  ]);

  const [selectedAmenities, setSelectedAmenities] = useState<AmenityKey[]>([
    "Park", "Club House", "STP", "UG Tank", "Compound Wall", "Main Entrance Arch"
  ]);

  const [mainRoadWidth, setMainRoadWidth] = useState<number>(40);
  const [internalRoadWidth, setInternalRoadWidth] = useState<number>(30);
  const [plotRatePerSqft, setPlotRatePerSqft] = useState<number>(2400);

  // Quick Preset Handlers
  const applyPreset = (preset: "1acre" | "2acre" | "5acre") => {
    if (preset === "1acre") {
      setPoints([
        { id: 1, name: "A", distance: 100, bearing: 90 },
        { id: 2, name: "B", distance: 435, bearing: 180 },
        { id: 3, name: "C", distance: 100, bearing: 270 },
        { id: 4, name: "D", distance: 435, bearing: 0 }
      ]);
    } else if (preset === "2acre") {
      setPoints([
        { id: 1, name: "A", distance: 200, bearing: 90 },
        { id: 2, name: "B", distance: 435, bearing: 180 },
        { id: 3, name: "C", distance: 200, bearing: 270 },
        { id: 4, name: "D", distance: 435, bearing: 0 }
      ]);
    } else if (preset === "5acre") {
      setPoints([
        { id: 1, name: "A", distance: 330, bearing: 90 },
        { id: 2, name: "B", distance: 660, bearing: 180 },
        { id: 3, name: "C", distance: 330, bearing: 270 },
        { id: 4, name: "D", distance: 660, bearing: 0 }
      ]);
    }
  };

  const layout = useMemo(() => generateLayout(points, plotTypes, selectedAmenities, mainRoadWidth, internalRoadWidth, 101), [points, plotTypes, selectedAmenities, mainRoadWidth, internalRoadWidth]);
  const boq = useMemo(() => buildBoq(layout, selectedAmenities), [layout, selectedAmenities]);
  const totalBoqAmount = useMemo(() => boq.reduce((s, r) => s + r.amount, 0), [boq]);

  const estimatedRevenue = layout.saleableArea * plotRatePerSqft;
  const netProfitMargin = estimatedRevenue - totalBoqAmount;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const boqData = boq.map(r => ({ Category: r.category, Item: r.item, Quantity: r.qty, Unit: r.unit, Rate: r.rate, Amount: r.amount }));
    const ws1 = XLSX.utils.json_to_sheet(boqData);
    XLSX.utils.book_append_sheet(wb, ws1, "BOQ Civil Estimate");

    const plotData = layout.plots.map(p => ({ "Plot No": p.number, Type: p.type, "Width (ft)": p.width, "Depth (ft)": p.depth, "Area (sqft)": p.area, "Estimated Value (INR)": p.area * plotRatePerSqft }));
    const ws2 = XLSX.utils.json_to_sheet(plotData);
    XLSX.utils.book_append_sheet(wb, ws2, "Plot Schedule");

    XLSX.writeFile(wb, `BuildMitra_Layout_Development_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "16px", padding: "28px 32px", color: "#ffffff", marginBottom: "28px", boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(56, 189, 248, 0.2)", border: "1px solid rgba(56, 189, 248, 0.4)", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "700", color: "#38bdf8", marginBottom: "10px" }}>
              🗺️ AUTOMATED TOWNSHIP LAYOUT & PLOT SUBDIVISION ENGINE
            </div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px" }}>
              📐 Plotted Development & Land Survey Layout Studio
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
              Automated survey polygon subdivision, road network routing, amenity placement, BOQ civil costing, and real estate revenue projection.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={exportExcel} style={{ background: "#10b981", color: "white", border: 0, borderRadius: "10px", padding: "12px 20px", fontWeight: "800", fontSize: "14px", cursor: "pointer" }}>
              📊 Export BOQ & Plot Schedule (.xlsx)
            </button>
            <button onClick={() => window.print()} style={{ background: "#0284c7", color: "white", border: 0, borderRadius: "10px", padding: "12px 20px", fontWeight: "800", fontSize: "14px", cursor: "pointer" }}>
              📄 Print Layout Blueprint
            </button>
          </div>
        </div>

        {/* 1-CLICK PRESETS ROW */}
        <div style={{ display: "flex", gap: "10px", marginTop: "24px", paddingTop: "18px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>Quick Land Presets:</span>
          <button onClick={() => applyPreset("1acre")} style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
            📍 1 Acre Township (100 × 435 ft)
          </button>
          <button onClick={() => applyPreset("2acre")} style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
            📍 2 Acre Layout (200 × 435 ft)
          </button>
          <button onClick={() => applyPreset("5acre")} style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
            📍 5 Acre Mega Township (330 × 660 ft)
          </button>
        </div>
      </div>

      {/* DASHBOARD METRICS SUMMARY BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Gross Land Area</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", marginTop: "4px" }}>{num(layout.gross, 0)} <span style={{ fontSize: "13px", color: "#64748b" }}>Sqft ({(layout.gross / 43560).toFixed(2)} Acres)</span></div>
        </div>
        <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Net Saleable Plot Area</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#16a34a", marginTop: "4px" }}>{num(layout.saleableArea, 0)} <span style={{ fontSize: "13px", color: "#64748b" }}>Sqft ({((layout.saleableArea / layout.gross) * 100).toFixed(1)}%)</span></div>
        </div>
        <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Total Generated Plots</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#0284c7", marginTop: "4px" }}>{layout.plots.length} <span style={{ fontSize: "13px", color: "#64748b" }}>Saleable Plots</span></div>
        </div>
        <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Infrastructure BOQ Cost</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#dc2626", marginTop: "4px" }}>{money(totalBoqAmount)}</div>
        </div>
        <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Projected Plot Sales Revenue</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#15803d", marginTop: "4px" }}>{money(estimatedRevenue)}</div>
        </div>
      </div>

      {/* MAIN TWO COLUMN WORKSPACE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" }}>
        
        {/* LEFT COLUMN: SVG VISUAL BLUEPRINT */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
              📐 Visual Master Layout & Subdivision Blueprint
            </h3>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>
              Main Road: <b>{mainRoadWidth}ft</b> | Internal Road: <b>{internalRoadWidth}ft</b>
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
            <LayoutSvg layout={layout} mainRoad={mainRoadWidth} internalRoad={internalRoadWidth} selected={selectedAmenities} />
          </div>

          {/* COLOR LEGEND BAR */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", fontSize: "12px", fontWeight: "700" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: COLORS.standard, border: "1px solid #b45309", borderRadius: "2px" }}></span> Standard Plots</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: COLORS.corner, border: "1px solid #6366f1", borderRadius: "2px" }}></span> Corner / Main Road Plots</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: COLORS.extended, border: "1px solid #047857", borderRadius: "2px" }}></span> Extended Plots</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: COLORS.park, border: "1px solid #16a34a", borderRadius: "2px" }}></span> Parks & Green Belt</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: COLORS.utility, border: "1px solid #7c3aed", borderRadius: "2px" }}></span> Utilities (STP / UG Tank)</span>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS & AMENITIES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* PRICING & REVENUE CALCULATOR */}
          <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
              💰 Revenue & Pricing Settings
            </h3>
            
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Expected Plot Selling Price (INR / Sqft)</label>
              <input
                type="number"
                value={plotRatePerSqft}
                onChange={(e) => setPlotRatePerSqft(Number(e.target.value) || 0)}
                style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", fontWeight: "700", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ padding: "12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", fontSize: "12px" }}>
              <div style={{ color: "#166534", fontWeight: "800", marginBottom: "4px" }}>Estimated Project Net Profit:</div>
              <div style={{ fontSize: "20px", fontWeight: "900", color: "#15803d" }}>{money(netProfitMargin)}</div>
              <div style={{ fontSize: "11px", color: "#334155", marginTop: "2px" }}>Gross Revenue minus Civil Infrastructure BOQ Cost</div>
            </div>
          </div>

          {/* AMENITY SELECTOR */}
          <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
              🌳 Amenity & Utility Allocation ({selectedAmenities.length} Selected)
            </h3>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {AMENITIES.map(item => {
                const isSelected = selectedAmenities.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => {
                      if (isSelected) setSelectedAmenities(prev => prev.filter(a => a !== item));
                      else setSelectedAmenities(prev => [...prev, item]);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "16px",
                      border: "1px solid #cbd5e1",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: isSelected ? "#0f172a" : "#f8fafc",
                      color: isSelected ? "#ffffff" : "#475569"
                    }}
                  >
                    {isSelected ? `✓ ${item}` : `+ ${item}`}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* BOQ INFRASTRUCTURE COST TABLE */}
      <div style={{ marginTop: "28px", background: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
          📋 Detailed Infrastructure BOQ Civil Cost Breakdown
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #cbd5e1" }}>Category</th>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #cbd5e1" }}>Item Description</th>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #cbd5e1", textAlign: "right" }}>Quantity</th>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #cbd5e1" }}>Unit</th>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #cbd5e1", textAlign: "right" }}>Rate (INR)</th>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #cbd5e1", textAlign: "right" }}>Total Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {boq.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 12px", fontWeight: "700", color: "#475569" }}>{row.category}</td>
                  <td style={{ padding: "10px 12px", fontWeight: "600", color: "#0f172a" }}>{row.item}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700" }}>{num(row.qty, 0)}</td>
                  <td style={{ padding: "10px 12px", color: "#64748b" }}>{row.unit}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>₹{row.rate.toLocaleString('en-IN')}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "800", color: "#0f172a" }}>₹{row.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f8fafc", fontWeight: "900" }}>
                <td colSpan={5} style={{ padding: "12px", textAlign: "right", fontSize: "14px" }}>Total Estimated Civil Infrastructure Cost:</td>
                <td style={{ padding: "12px", textAlign: "right", fontSize: "16px", color: "#dc2626" }}>₹{totalBoqAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
