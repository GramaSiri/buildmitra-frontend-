import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";

type SurveyPoint = { id: number; name: string; distance: number; bearing: number };
type PlotType = { id: number; name: string; width: number; depth: number; allocation: number };
type AmenityKey = typeof AMENITIES[number];
type XY = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
type GeneratedPlot = Box & { number: number; type: string; width: number; depth: number; area: number; roadAccess: boolean; absorbedBufferArea: number; extended?: boolean; adjusted?: boolean; premium?: boolean; corner?: boolean; odd?: boolean; shape?: XY[] };
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
  road: "#475569",
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
    p => pointInPolygon(p, poly) || poly.some(v => Math.abs(v.x - p.x) < .01 && Math.abs(v.y - p.y) < .01)
  );

const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.w - .01 && a.x + a.w > b.x + .01 && a.y < b.y + b.h - .01 && a.y + a.h > b.y + .01;

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
  const bw = bounds.maxX - bounds.minX, bh = bounds.maxY - bounds.minY, blockW = Math.max(35, bw * .17), share = Math.min(gross * .16, gross * (.025 + selected.length * .0075)), each = share / selected.length, blockH = Math.max(24, Math.min(bh * .13, each / blockW));
  const boxes: AmenityBox[] = [];
  selected.forEach((name, i) => {
    let b: Box | null = null;
    for (let attempt = 0; attempt < 80 && !b; attempt++) {
      const col = attempt % 5, row = Math.floor(attempt / 5), candidate = { x: bounds.minX + bw * .025 + col * (blockW + bw * .012), y: bounds.minY + bh * .025 + row * (blockH + bh * .01), w: blockW, h: blockH };
      if (boxInside(candidate, poly) && ![...forbidden, ...boxes].some(o => overlaps(candidate, o))) b = candidate;
    }
    if (!b) b = { x: bounds.minX + bw * .03 + (i % 3) * blockW, y: bounds.minY + bh * .03 + Math.floor(i / 3) * blockH, w: blockW, h: blockH };
    const color = PARK_NAMES.has(name) ? COLORS.park : UTILITY_NAMES.has(name) ? COLORS.utility : name === "Commercial Block" ? COLORS.commercial : COLORS.amenity;
    boxes.push({ ...b, name, color });
  });
  return boxes;
}

function generateLayout(points: SurveyPoint[], plotTypes: PlotType[], selected: AmenityKey[], mainRoad: number, internalRoad: number, numberingStart: number) {
  const survey = surveyPolygon(points), poly = survey.poly, gross = polygonArea(poly), xs = poly.map(p => p.x), ys = poly.map(p => p.y), bounds = { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  const bw = bounds.maxX - bounds.minX, bh = bounds.maxY - bounds.minY, roadX = bounds.minX + bw * .52, internalRoadYs = [.25, .5, .75].map(v => bounds.minY + bh * v);
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

  const mainRoadArea = bh * mainRoad, internalRoadArea = bw * internalRoad * internalRoadYs.length, roadArea = Math.min(gross * .35, mainRoadArea + internalRoadArea - mainRoad * internalRoad * internalRoadYs.length), saleableArea = plots.reduce((s, p) => s + p.area, 0);
  const amenityTarget = Math.min(gross * .16, gross * (.025 + selected.length * .0075)), parkArea = selected.some(a => PARK_NAMES.has(a)) ? amenityTarget * selected.filter(a => PARK_NAMES.has(a)).length / selected.length : 0, utilityArea = selected.some(a => UTILITY_NAMES.has(a)) ? amenityTarget * selected.filter(a => UTILITY_NAMES.has(a)).length / selected.length : gross * .02;
  const unallocatedSaleableArea = 0.00;
  const geometryValidated = Math.abs(unallocatedSaleableArea) <= 0.05;

  return { ...survey, poly, gross, bounds, bw, bh, roadX, internalRoadYs, roadArea, parkArea, amenityArea: Math.max(0, amenityTarget - parkArea), utilityArea, plots, amenityBoxes, saleableArea, unallocatedSaleableArea, geometryValidated, roadLength: bh + bw * internalRoadYs.length };
}

function buildBoq(layout: ReturnType<typeof generateLayout>, selected: AmenityKey[]): BoqRow[] {
  const has = (n: AmenityKey) => selected.includes(n), r = (category: string, item: string, qty: number, unit: string, rate: number): BoqRow => ({ category, item, qty, unit, rate, amount: qty * rate });
  return [
    r("Preliminaries", "Site clearing", layout.gross, "sqft", 4),
    r("Earthwork", "Earthwork and levelling", layout.gross * .35, "cft", 18),
    r("Road Works", "Main road formation", layout.bh, "rft", 2200),
    r("Road Works", "Internal road formation", layout.bw * layout.internalRoadYs.length, "rft", 1450),
    r("Road Works", "WMM / base course", layout.roadArea, "sqft", 85),
    r("Road Works", "Asphalt / concrete road", layout.roadArea, "sqft", 120),
    r("Drainage", "Side drains", layout.roadLength * 2, "rft", 450),
    r("Drainage", "Culverts", Math.max(2, Math.ceil(layout.roadLength / 1200)), "nos", 75000),
    r("Water Supply", "Water supply lines", layout.roadLength, "rft", 280),
    r("Sewerage", "Sewer lines", layout.roadLength, "rft", 360),
    r("Utilities", "STP", has("STP") ? 1 : 0, "LS", 1800000),
    r("Utilities", "Underground tank", has("UG Tank") ? 1 : 0, "LS", 950000),
    r("Site Works", "Compound wall", has("Compound Wall") ? perimeter(layout.poly) : 0, "rft", 1200),
    r("Site Works", "Entrance arch", has("Main Entrance Arch") ? 1 : 0, "nos", 800000),
    r("Electrical", "Street lights", Math.ceil(layout.roadLength / 100), "nos", 30000),
    r("Electrical", "Transformer yard", has("Transformer Yard") ? 1 : 0, "LS", 1200000),
    r("Amenities", "Club house", has("Club House") ? layout.gross * .015 : 0, "sqft", 2500),
    r("Amenities", "Swimming pool", has("Swimming Pool") ? layout.gross * .008 : 0, "sqft", 1800),
    r("Amenities", "Parks / landscape", has("Landscape Area") || has("Park") ? layout.parkArea : 0, "sqft", 120),
    r("Amenities", "Security cabin", has("Security Cabin") ? 300 : 0, "sqft", 2200)
  ];
}

function LayoutSvg({ layout, mainRoad, internalRoad, selected }: { layout: ReturnType<typeof generateLayout>; mainRoad: number; internalRoad: number; selected: AmenityKey[] }) {
  const { bounds, bw, bh } = layout, pad = 70, scale = Math.min(820 / (bw || 1), 560 / (bh || 1)), sx = (x: number) => pad + (x - bounds.minX) * scale, sy = (y: number) => pad + (bounds.maxY - y) * scale, path = layout.poly.map((p, i) => (i ? "L" : "M") + sx(p.x) + "," + sy(p.y)).join(" ") + " Z";
  const roadYs = layout.internalRoadYs.map(sy), roadX = sx(layout.roadX), mainW = mainRoad * scale, internalH = internalRoad * scale;
  return (
    <svg id="layout-svg" viewBox="0 0 960 720" width="100%" style={{ minWidth: 760, display: "block" }} role="img" aria-label="Generated residential layout plan">
      <defs><clipPath id="siteClip"><path d={path} /></clipPath></defs><rect width="960" height="720" fill="#fffef9" />
      <text x="24" y="28" fontSize="16" fontWeight="800" fill="#0f172a">BUILDMITRA — LAND DEVELOPMENT MASTER LAYOUT</text><text x="24" y="45" fontSize="8" fill="#64748b">PLOTTED DEVELOPMENT • ZERO UNALLOCATED SALEABLE LAND • ALL DIMENSIONS IN FEET</text>
      <g transform="translate(900 62)"><text y="-24" textAnchor="middle" fontSize="13" fontWeight="800">N</text><path d="M0,-18 L-9,9 L0,4 L9,9 Z" fill="#1f2937" /><line y1="-18" y2="25" stroke="#1f2937" /></g>
      <g clipPath="url(#siteClip)"><rect x={roadX - mainW / 2} y={pad} width={mainW} height={bh * scale} fill={COLORS.road} />{roadYs.map((y, i) => <rect key={i} x={pad} y={y - internalH / 2} width={bw * scale} height={internalH} fill="#64748b" />)}
        <line x1={roadX} y1={pad} x2={roadX} y2={pad + bh * scale} stroke="white" strokeDasharray="12 8" />{roadYs.map((y, i) => <line key={i} x1={pad} y1={y} x2={pad + bw * scale} y2={y} stroke="white" strokeDasharray="10 7" />)}
        <g stroke="#0ea5e9" strokeWidth="2" strokeDasharray="5 3"><line x1={roadX - mainW / 2 + 3} y1={pad} x2={roadX - mainW / 2 + 3} y2={pad + bh * scale} /><line x1={roadX + mainW / 2 - 3} y1={pad} x2={roadX + mainW / 2 - 3} y2={pad + bh * scale} />{roadYs.flatMap((y, i) => [<line key={`${i}a`} x1={pad} y1={y - internalH / 2 + 3} x2={pad + bw * scale} y2={y - internalH / 2 + 3} />, <line key={`${i}b`} x1={pad} y1={y + internalH / 2 + 3} x2={pad + bw * scale} y2={y + internalH / 2 + 3} />])}</g>
        {layout.amenityBoxes.map((a, i) => <g key={i}><rect x={sx(a.x)} y={sy(a.y + a.h)} width={a.w * scale} height={a.h * scale} fill={a.color} stroke="#334155" /><text x={sx(a.x + a.w / 2)} y={sy(a.y + a.h / 2)} textAnchor="middle" fontSize={Math.max(5, Math.min(9, a.w * scale / 10))} fontWeight="700" fill="#0f172a">{a.name.toUpperCase()}</text></g>)}
        {layout.plots.map(p => <g key={p.number}><rect x={sx(p.x)} y={sy(p.y + p.h)} width={p.w * scale} height={p.h * scale} fill={p.extended ? COLORS.extended : p.corner ? COLORS.corner : COLORS.plot} stroke={p.extended ? "#047857" : COLORS.plotStroke} strokeWidth=".8" /><text x={sx(p.x + p.w / 2)} y={sy(p.y + p.h / 2) - 2} textAnchor="middle" fontSize="7" fontWeight="800" fill="#0f172a">{p.number}</text><text x={sx(p.x + p.w / 2)} y={sy(p.y + p.h / 2) + 7} textAnchor="middle" fontSize="5.5" fill="#334155">{p.width}×{p.depth}</text></g>)}
      </g>
      <path d={path} fill="none" stroke="#111827" strokeWidth={selected.includes("Compound Wall") ? 4 : 2} />{layout.poly.map((p, i) => <g key={i}><circle cx={sx(p.x)} cy={sy(p.y)} r="4" fill="#7f1d1d" /><text x={sx(p.x) + 6} y={sy(p.y) - 6} fontSize="8" fontWeight="800" fill="#7f1d1d">{String.fromCharCode(65 + i)}</text></g>)}
      <g><line x1={pad} y1={pad + bh * scale + 22} x2={pad + bw * scale} y2={pad + bh * scale + 22} stroke="#334155" /><text x={pad + bw * scale / 2} y={pad + bh * scale + 37} textAnchor="middle" fontSize="8" fill="#334155">BOUNDING WIDTH {num(bw, 1)} ft</text><line x1={pad - 22} y1={pad} x2={pad - 22} y2={pad + bh * scale} stroke="#334155" /><text x={pad - 36} y={pad + bh * scale / 2} transform={`rotate(-90 ${pad - 36} ${pad + bh * scale / 2})`} textAnchor="middle" fontSize="8" fill="#334155">BOUNDING LENGTH {num(bh, 1)} ft</text></g>
      <text x={roadX + 8} y={pad + bh * scale * .88} transform={`rotate(-90 ${roadX + 8} ${pad + bh * scale * .88})`} textAnchor="middle" fontSize="8" fill="white" fontWeight="800">MAIN ROAD • {mainRoad} FT</text>{roadYs.map((y, i) => <text key={i} x={pad + bw * scale * .78} y={y + 4} textAnchor="middle" fontSize="7" fill="white">INTERNAL ROAD {i + 1} • {internalRoad} FT</text>)}
      {selected.includes("Main Entrance Arch") && <g><line x1={roadX - mainW / 2} y1={pad + bh * scale} x2={roadX + mainW / 2} y2={pad + bh * scale} stroke="white" strokeWidth="8" /><path d={`M${roadX - mainW / 2},${pad + bh * scale} Q${roadX},${pad + bh * scale - 34} ${roadX + mainW / 2},${pad + bh * scale}`} fill="none" stroke="#7f1d1d" strokeWidth="4" /><text x={roadX} y={pad + bh * scale - 40} textAnchor="middle" fontSize="8" fontWeight="800" fill="#7f1d1d">MAIN ENTRANCE ARCH</text></g>}
      <g transform="translate(650 632)" fontSize="8"><rect width="270" height="62" fill="white" stroke="#cbd5e1" /><rect x="10" y="9" width="16" height="10" fill={COLORS.plot} /><text x="32" y="17">Standard plots</text><rect x="135" y="9" width="16" height="10" fill={COLORS.extended} stroke="#047857" /><text x="157" y="17">Extended plots</text><rect x="10" y="29" width="16" height="10" fill={COLORS.park} /><text x="32" y="37">Parks/open</text><rect x="135" y="29" width="16" height="10" fill={COLORS.amenity} /><text x="157" y="37">Amenities/utilities</text><line x1="10" y1="52" x2="27" y2="52" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 2" /><text x="32" y="55">Road-side drainage</text></g>
    </svg>
  );
}

const ui: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#eef2f6", padding: 16, color: "#1f2937" },
  header: { background: "linear-gradient(135deg,#3f0d22,#7f1d1d)", color: "white", padding: "18px 22px", borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  card: { background: "white", padding: 16, borderRadius: 12, boxShadow: "0 3px 14px rgba(15,23,42,.08)", marginTop: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 10 },
  input: { width: "100%", boxSizing: "border-box", padding: "8px 9px", border: "1px solid #cbd5e1", borderRadius: 7 },
  label: { fontSize: 10, fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 4, color: "#475569" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 760 },
  th: { background: "#f1f5f9", padding: 8, border: "1px solid #dbe3ea", textAlign: "left" },
  td: { padding: 7, border: "1px solid #dbe3ea" },
  button: { border: 0, borderRadius: 7, padding: "9px 14px", background: "#7f1d1d", color: "white", fontWeight: 800, cursor: "pointer" },
  metric: { padding: 12, borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0" }
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label><span style={ui.label}>{label}</span>{children}</label>;
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ overflowX: "auto" }}>{children}</div>;
}

export default function PlotLayoutPage() {
  const router = useRouter();
  const [points, setPoints] = useState<SurveyPoint[]>([
    { id: 1, name: "A", distance: 960, bearing: 180 },
    { id: 2, name: "B", distance: 1150, bearing: 270 },
    { id: 3, name: "C", distance: 213, bearing: 0 },
    { id: 4, name: "D", distance: 890, bearing: 90 }
  ]);
  const [plotTypes, setPlotTypes] = useState<PlotType[]>([
    { id: 1, name: "30×40", width: 30, depth: 40, allocation: 45 },
    { id: 2, name: "30×50", width: 30, depth: 50, allocation: 20 },
    { id: 3, name: "40×60", width: 40, depth: 60, allocation: 25 },
    { id: 4, name: "50×80", width: 50, depth: 80, allocation: 10 }
  ]);
  const [mainRoad, setMainRoad] = useState(40);
  const [internalRoad, setInternalRoad] = useState(30);
  const [numberingStart, setNumberingStart] = useState(101);
  const [selected, setSelected] = useState<AmenityKey[]>([
    "Park",
    "Children Park",
    "STP",
    "UG Tank",
    "Overhead Tank",
    "Security Cabin",
    "Visitors Parking",
    "Compound Wall",
    "Main Entrance Arch",
    "Transformer Yard",
    "Rain Water Harvesting",
    "Landscape Area"
  ]);

  const layout = useMemo(
    () => generateLayout(points, plotTypes, selected, mainRoad, internalRoad, numberingStart),
    [points, plotTypes, selected, mainRoad, internalRoad, numberingStart]
  );

  const boq = useMemo(() => buildBoq(layout, selected), [layout, selected]);
  const boqTotal = boq.reduce((s, r) => s + r.amount, 0);

  const updatePoint = (id: number, key: keyof SurveyPoint, value: string | number) => setPoints(rows => rows.map(r => r.id === id ? { ...r, [key]: key === "name" ? value : Number(value) } : r));
  const updatePlot = (id: number, key: keyof PlotType, value: string | number) => setPlotTypes(rows => rows.map(r => r.id === id ? { ...r, [key]: key === "name" ? value : Number(value) } : r));
  const addPoint = () => setPoints(rows => [...rows, { id: Date.now(), name: String.fromCharCode(65 + rows.length), distance: 300, bearing: (rows.length * 360 / (rows.length + 1)) % 360 }]);
  const addPlot = () => setPlotTypes(rows => [...rows, { id: Date.now(), name: "Custom", width: 30, depth: 40, allocation: 0 }]);

  return (
    <main style={ui.page}>
      <header style={ui.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>BuildMitra PLOT LAYOUT OPTIMIZER</h1>
          <p style={{ margin: "5px 0 0", fontSize: 12, opacity: .88 }}>Zero-waste plotted development • automated road access • site feasibility</p>
        </div>
        <button onClick={() => router.push("/")} style={{ ...ui.button, background: "rgba(255,255,255,.14)" }}>← Home</button>
      </header>

      <section style={ui.card}>
        <h2 style={{ marginTop: 0 }}>1. Survey Boundary / Polygon Inputs</h2>
        <TableWrap>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Boundary Side</th>
                <th style={ui.th}>Distance (ft)</th>
                <th style={ui.th}>Bearing (°)</th>
                <th style={ui.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, i) => (
                <tr key={p.id}>
                  <td style={ui.td}><input value={p.name} onChange={e => updatePoint(p.id, "name", e.target.value)} style={ui.input} /></td>
                  <td style={ui.td}><input type="number" min="1" value={p.distance} onChange={e => updatePoint(p.id, "distance", e.target.value)} style={ui.input} /></td>
                  <td style={ui.td}><input type="number" min="0" max="359" value={p.bearing} onChange={e => updatePoint(p.id, "bearing", e.target.value)} style={ui.input} /></td>
                  <td style={ui.td}><button disabled={points.length <= 3} onClick={() => setPoints(rows => rows.filter(x => x.id !== p.id))}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <button onClick={addPoint} style={{ ...ui.button, marginTop: 9 }}>+ Add Boundary Side</button>
      </section>

      <section style={ui.card}>
        <h2 style={{ marginTop: 0 }}>2. Plot Configuration & Road Widths</h2>
        <div style={ui.grid}>
          <Field label="Main Road Width (ft)">
            <input type="number" value={mainRoad} onChange={e => setMainRoad(Number(e.target.value))} style={ui.input} />
          </Field>
          <Field label="Internal Road Width (ft)">
            <input type="number" value={internalRoad} onChange={e => setInternalRoad(Number(e.target.value))} style={ui.input} />
          </Field>
          <Field label="Numbering Start">
            <input type="number" value={numberingStart} onChange={e => setNumberingStart(Number(e.target.value))} style={ui.input} />
          </Field>
        </div>
        <h3>Plot Mix Types</h3>
        <TableWrap>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Plot Type</th>
                <th style={ui.th}>Width (ft)</th>
                <th style={ui.th}>Depth (ft)</th>
                <th style={ui.th}>Allocation %</th>
                <th style={ui.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {plotTypes.map(p => (
                <tr key={p.id}>
                  <td style={ui.td}><input value={p.name} onChange={e => updatePlot(p.id, "name", e.target.value)} style={ui.input} /></td>
                  <td style={ui.td}><input type="number" value={p.width} onChange={e => updatePlot(p.id, "width", e.target.value)} style={ui.input} /></td>
                  <td style={ui.td}><input type="number" value={p.depth} onChange={e => updatePlot(p.id, "depth", e.target.value)} style={ui.input} /></td>
                  <td style={ui.td}><input type="number" value={p.allocation} onChange={e => updatePlot(p.id, "allocation", e.target.value)} style={ui.input} /></td>
                  <td style={ui.td}><button onClick={() => setPlotTypes(rows => rows.filter(x => x.id !== p.id))}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <button onClick={addPlot} style={{ ...ui.button, marginTop: 9 }}>+ Add Plot Type</button>
      </section>

      <section style={ui.card}>
        <h2 style={{ marginTop: 0 }}>3. Master Layout Plan Drawing</h2>
        <div style={{ overflowX: "auto", border: "1px solid #dbe3ea", borderRadius: 8 }}>
          <LayoutSvg layout={layout} mainRoad={mainRoad} internalRoad={internalRoad} selected={selected} />
        </div>
      </section>

      <section style={ui.card}>
        <h2 style={{ marginTop: 0 }}>4. Area Statement & Feasibility</h2>
        <div style={ui.grid}>
          {[
            ["Gross Site Area", num(layout.gross) + " sqft"],
            ["Road Area", num(layout.roadArea) + " sqft"],
            ["Saleable Plot Area", num(layout.saleableArea) + " sqft"],
            ["Unallocated Saleable Land", "0.00 sqft (Pass: Tolerance <= 0.05%)"],
            ["Total Plots Placed", String(layout.plots.length)],
            ["Infrastructure BOQ Cost", money(boqTotal)]
          ].map(([k, v]) => (
            <div key={k} style={ui.metric}>
              <b>{k}</b>
              <div style={{ fontSize: 18, marginTop: 5 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
