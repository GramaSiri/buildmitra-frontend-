import React, { useState } from "react";
import { useRouter } from "next/router";
import { useRates } from "../contexts/RateContext";
import * as XLSX from "xlsx";
import { usePaymentBarrier } from "../hooks/usePaymentBarrier";

const fmt = (n: any) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ceil = (n: any) => Math.ceil(Number(n || 0));

const styles: any = {
  container: { padding: 12, backgroundColor: "#f5f0e8", minHeight: "100vh" },
  header: { backgroundColor: "#e91e63", padding: 16, borderRadius: 8, marginBottom: 20, color: "white", display: "flex", gap: 15, alignItems: "center" },
  backButton: { background: "transparent", border: "none", color: "white", fontSize: 22, cursor: "pointer" },
  title: { margin: 0, fontSize: 20 },
  section: { backgroundColor: "#fce4ec", color: "#e91e63", padding: 8, borderRadius: 6, textAlign: "center", fontWeight: "bold", marginBottom: 12 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 12 },
  input: { width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 },
  select: { width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 },
  label: { fontSize: 11, fontWeight: 600, marginBottom: 4, display: "block" },
  btn: { backgroundColor: "#800020", color: "white", padding: "11px 20px", border: 0, borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
  green: { backgroundColor: "#28a745", color: "white", padding: "8px 18px", border: 0, borderRadius: 6, cursor: "pointer" },
  whats: { backgroundColor: "#25D366", color: "white", padding: "8px 18px", border: 0, borderRadius: 6, cursor: "pointer" },
  tableBox: { overflowX: "auto", marginTop: 15, border: "1px solid #ddd", borderRadius: 8, background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 11 },
  th: { backgroundColor: "#e91e63", color: "white", padding: 8, textAlign: "left" },
  td: { padding: 6, borderBottom: "1px solid #eee" },
  total: { backgroundColor: "#800020", color: "white", fontWeight: "bold" },
  cards: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 18 },
  card: { color: "white", padding: 15, borderRadius: 12, textAlign: "center" }
};

export default function PaintingBOQ() {
  const router = useRouter();
  const { rates, loading } = useRates();
  const { checkAndRun } = usePaymentBarrier();

  const [projectName, setProjectName] = useState("Jai Sri ram");
  const [clientName, setClientName] = useState("Reddy");
  const [mobileNo, setMobileNo] = useState("7676942386");
  const [city, setCity] = useState("Bengaluru");

  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(3.5);
  const [wallHeight, setWallHeight] = useState(10);
  const [paintType, setPaintType] = useState("Premium Emulsion");
  const [exteriorPercent, setExteriorPercent] = useState(25);

  const [doors, setDoors] = useState(20);
  const [windows, setWindows] = useState(12);

  const [results, setResults] = useState<any>(null);

  const getRate = (keys: string[], fallback: number) => {
    for (const k of keys) if (rates?.[k] && Number(rates[k]) > 0) return Number(rates[k]);
    return fallback;
  };

  const plotArea = plotLength * plotWidth;
  const setbackArea = plotArea * 0.1;
  const footprintArea = plotArea - setbackArea;
  const totalBUA = footprintArea * floors;

  const floorCount = Math.max(1, ceil(floors));
  const perimeter = 2 * (plotLength + plotWidth);
  const externalWallArea = perimeter * wallHeight * floorCount;
  const internalWallArea = totalBUA * 2.7;
  const ceilingArea = totalBUA;
  const openingDeduction = (doors * 21) + (windows * 15);
  const netWallArea = Math.max(0, internalWallArea + externalWallArea - openingDeduction);
  const exteriorArea = netWallArea * (exteriorPercent / 100);
  const interiorArea = netWallArea - exteriorArea;

  const calculateBOQ = () => {
    const primerCoverage = 100;
    const puttyCoverage = 18;
    const paintCoverage = paintType === "Economy Emulsion" ? 120 : paintType === "Premium Emulsion" ? 140 : 160;

    const interiorPaintLtr = interiorArea / paintCoverage / 2;
    const exteriorPaintLtr = exteriorArea / 120 / 2;
    const primerLtr = netWallArea / primerCoverage;
    const puttyKg = interiorArea / puttyCoverage;
    const ceilingPaintLtr = ceilingArea / 130 / 2;
    const enamelLtr = ((doors * 21) + (windows * 15)) / 100;

    const items: any[] = [
      { sr: 1, code: "PNT-01", desc: "Wall Putty", uom: "kg", qty: puttyKg, matRate: getRate(["PNTPUT-000001", "wallPutty"], 28), labRate: getRate(["SPNTPUT-000001", "puttyLabour"], 10), amount: 0 },
      { sr: 2, code: "PNT-02", desc: "Interior Primer", uom: "ltr", qty: primerLtr, matRate: getRate(["PNTPRM-000001", "primer"], 120), labRate: getRate(["SPNTPRM-000001", "primerLabour"], 12), amount: 0 },
      { sr: 3, code: "PNT-03", desc: paintType + " Interior Paint", uom: "ltr", qty: interiorPaintLtr, matRate: getRate(["PNTPAI-000001", "interiorPaint"], 220), labRate: getRate(["SPNTPAI-000001", "paintLabour"], 18), amount: 0 },
      { sr: 4, code: "PNT-04", desc: "Exterior Weather Coat Paint", uom: "ltr", qty: exteriorPaintLtr, matRate: getRate(["PNTEXT-000001", "exteriorPaint"], 280), labRate: getRate(["SPNTEXT-000001", "exteriorPaintLabour"], 22), amount: 0 },
      { sr: 5, code: "PNT-05", desc: "Ceiling Paint", uom: "ltr", qty: ceilingPaintLtr, matRate: getRate(["PNTCEL-000001", "ceilingPaint"], 180), labRate: getRate(["SPNTCEL-000001", "ceilingPaintLabour"], 15), amount: 0 },
      { sr: 6, code: "PNT-06", desc: "Enamel Paint for Doors/Windows", uom: "ltr", qty: enamelLtr, matRate: getRate(["PNTENM-000001", "enamelPaint"], 260), labRate: getRate(["SPNTENM-000001", "enamelLabour"], 25), amount: 0 },
      { sr: 7, code: "PNT-07", desc: "Sand Paper", uom: "nos", qty: ceil(netWallArea / 120), matRate: getRate(["PNTSND-000001", "sandPaper"], 12), labRate: 0, amount: 0 },
      { sr: 8, code: "PNT-08", desc: "Masking Tape / Covering", uom: "roll", qty: ceil(netWallArea / 500), matRate: getRate(["PNTMSK-000001", "maskingTape"], 80), labRate: 0, amount: 0 },
      { sr: 9, code: "PNT-09", desc: "Scaffolding / Ladder Support", uom: "lump", qty: 1, matRate: getRate(["PNTSCA-000001", "scaffolding"], 2500), labRate: getRate(["SPNTSCA-000001", "scaffoldingLabour"], 1500), amount: 0 },
      { sr: 10, code: "PNT-10", desc: "Final Touchup & Cleaning", uom: "lump", qty: 1, matRate: getRate(["PNTFIN-000001", "paintingFinishing"], 1500), labRate: getRate(["SPNTFIN-000001", "paintingFinishingLabour"], 1000), amount: 0 }
    ];

    items.forEach(i => i.amount = (i.qty * i.matRate) + (i.qty * i.labRate));

    const materialTotal = items.reduce((s, i) => s + i.qty * i.matRate, 0);
    const labourTotal = items.reduce((s, i) => s + i.qty * i.labRate, 0);
    const grandTotal = materialTotal + labourTotal;

    setResults({ items, materialTotal, labourTotal, grandTotal, ratePerSft: grandTotal / totalBUA, totalBUA, netWallArea, interiorArea, exteriorArea });
  };

  const exportExcel = () => {
    if (!results) return;
    const data = results.items.map((i: any) => ({
      Sr: i.sr, Code: i.code, Description: i.desc, UOM: i.uom,
      Qty: fmt(i.qty), "Mat Rate": fmt(i.matRate), "Lab Rate": fmt(i.labRate), Total: fmt(i.amount)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Painting_BOQ");
    XLSX.writeFile(wb, `Painting_BOQ_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const shareWhatsApp = () => {
    if (!results) return;
    const msg = `Painting BOQ\nProject: ${projectName}\nBUA: ${fmt(results.totalBUA)} sft\nPaint Area: ${fmt(results.netWallArea)} sft\nTotal: ₹${fmt(results.grandTotal)}\nRate/sft: ₹${fmt(results.ratePerSft)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) return <div style={{ padding: 20 }}>Loading rates...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => router.push("/boq")} style={styles.backButton}>←</button>
        <h1 style={styles.title}>🎨 Painting BOQ Calculator</h1>
      </div>

      <div style={styles.section}>📋 Basic Details</div>
      <div style={styles.grid4}>
        <div><label style={styles.label}>Project Name</label><input style={styles.input} value={projectName} onChange={e => setProjectName(e.target.value)} /></div>
        <div><label style={styles.label}>Client Name</label><input style={styles.input} value={clientName} onChange={e => setClientName(e.target.value)} /></div>
        <div><label style={styles.label}>Mobile No.</label><input style={styles.input} value={mobileNo} onChange={e => setMobileNo(e.target.value)} /></div>
        <div><label style={styles.label}>City</label><input style={styles.input} value={city} onChange={e => setCity(e.target.value)} /></div>
      </div>

      <div style={styles.section}>📐 Building / Paint Details</div>
      <div style={styles.grid4}>
        <div><label style={styles.label}>Plot Length</label><input type="number" style={styles.input} value={plotLength} onChange={e => setPlotLength(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Plot Width</label><input type="number" style={styles.input} value={plotWidth} onChange={e => setPlotWidth(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Floors</label><input type="number" style={styles.input} value={floors} onChange={e => setFloors(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Wall Height</label><input type="number" style={styles.input} value={wallHeight} onChange={e => setWallHeight(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Paint Type</label><select style={styles.select} value={paintType} onChange={e => setPaintType(e.target.value)}><option>Economy Emulsion</option><option>Premium Emulsion</option><option>Luxury Emulsion</option></select></div>
        <div><label style={styles.label}>Exterior %</label><input type="number" style={styles.input} value={exteriorPercent} onChange={e => setExteriorPercent(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Doors</label><input type="number" style={styles.input} value={doors} onChange={e => setDoors(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Windows</label><input type="number" style={styles.input} value={windows} onChange={e => setWindows(Number(e.target.value))} /></div>
      </div>

      <button onClick={calculateBOQ} style={styles.btn}>🔨 Generate Painting BOQ</button>

      {results && <>
        <div style={styles.cards}>
          <div style={{ ...styles.card, backgroundColor: "#800020" }}>💰<div>Total</div><b>₹{fmt(results.grandTotal)}</b></div>
          <div style={{ ...styles.card, backgroundColor: "#2196F3" }}>📐<div>BUA</div><b>{fmt(results.totalBUA)} sft</b></div>
          <div style={{ ...styles.card, backgroundColor: "#4CAF50" }}>🎨<div>Paint Area</div><b>{fmt(results.netWallArea)} sft</b></div>
          <div style={{ ...styles.card, backgroundColor: "#9C27B0" }}>👷<div>Labour</div><b>₹{fmt(results.labourTotal)}</b></div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 18 }}>
          <button onClick={() => checkAndRun("boq_export", "boq-painting", exportExcel)} style={styles.green}>📊 Excel</button>
          <button onClick={() => checkAndRun("boq_export", "boq-painting", shareWhatsApp)} style={styles.whats}>💬 Share</button>
        </div>

        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Sr</th><th style={styles.th}>Code</th><th style={styles.th}>Description</th><th style={styles.th}>UOM</th><th style={styles.th}>Qty</th><th style={styles.th}>Mat Rate</th><th style={styles.th}>Lab Rate</th><th style={styles.th}>Total</th></tr></thead>
            <tbody>
              {results.items.map((i: any, idx: number) => <tr key={i.sr} style={idx % 2 ? styles.evenRow : {}}>
                <td style={styles.td}>{i.sr}</td><td style={styles.td}>{i.code}</td><td style={styles.td}>{i.desc}</td><td style={styles.td}>{i.uom}</td><td style={styles.td}>{fmt(i.qty)}</td><td style={styles.td}>{fmt(i.matRate)}</td><td style={styles.td}>{fmt(i.labRate)}</td><td style={styles.td}>{fmt(i.amount)}</td>
              </tr>)}
              <tr style={styles.total}><td colSpan={7} style={styles.td}>GRAND TOTAL</td><td style={styles.td}>₹{fmt(results.grandTotal)}</td></tr>
            </tbody>
          </table>
        </div>
      </>}
    </div>
  );
}