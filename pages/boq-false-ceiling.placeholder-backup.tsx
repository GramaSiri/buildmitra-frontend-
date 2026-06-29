import React, { useState } from "react";
import { useRouter } from "next/router";
import { useRates } from "../contexts/RateContext";
import * as XLSX from "xlsx";
import { usePaymentBarrier } from "../hooks/usePaymentBarrier";

const fmt = (n: any) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ceil = (n: any) => Math.ceil(Number(n || 0));

const styles: any = {
  container: { padding: 12, backgroundColor: "#f5f0e8", minHeight: "100vh" },
  header: { backgroundColor: "#795548", padding: 16, borderRadius: 8, marginBottom: 20, color: "white", display: "flex", gap: 15, alignItems: "center" },
  backButton: { background: "transparent", border: "none", color: "white", fontSize: 22, cursor: "pointer" },
  title: { margin: 0, fontSize: 20 },
  section: { backgroundColor: "#e8f4f8", color: "#795548", padding: 8, borderRadius: 6, textAlign: "center", fontWeight: "bold", marginBottom: 12 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 12 },
  input: { width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 },
  label: { fontSize: 11, fontWeight: 600, marginBottom: 4, display: "block" },
  btn: { backgroundColor: "#800020", color: "white", padding: "11px 20px", border: 0, borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
  green: { backgroundColor: "#28a745", color: "white", padding: "8px 18px", border: 0, borderRadius: 6, cursor: "pointer" },
  whats: { backgroundColor: "#25D366", color: "white", padding: "8px 18px", border: 0, borderRadius: 6, cursor: "pointer" },
  tableBox: { overflowX: "auto", marginTop: 15, border: "1px solid #ddd", borderRadius: 8, background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 11 },
  th: { backgroundColor: "#795548", color: "white", padding: 8, textAlign: "left" },
  td: { padding: 6, borderBottom: "1px solid #eee" },
  total: { backgroundColor: "#800020", color: "white", fontWeight: "bold" },
  cards: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 18 },
  card: { color: "white", padding: 15, borderRadius: 12, textAlign: "center" }
};

export default function FalseCeilingBOQ() {
  const router = useRouter();
  const { rates, loading } = useRates();
  const { checkAndRun } = usePaymentBarrier();

  const [projectName, setProjectName] = useState("Jai Sri ram");
  const [clientName, setClientName] = useState("Reddy");
  const [mobileNo, setMobileNo] = useState("7676942386");
  const [city, setCity] = useState("Bengaluru");

  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(40);
  const [rooms, setRooms] = useState(1);
  const [ceilingType, setCeilingType] = useState("Gypsum Board Ceiling");
  const [coveLength, setCoveLength] = useState(60);
  const [lightPoints, setLightPoints] = useState(12);

  const [results, setResults] = useState<any>(null);

  const getRate = (keys: string[], fallback: number) => {
    for (const k of keys) if (rates?.[k] && Number(rates[k]) > 0) return Number(rates[k]);
    return fallback;
  };

  const area = length * width * rooms;
  const perimeter = 2 * (length + width) * rooms;
  const boardArea = area * 1.08;
  const boardNos = ceil(boardArea / 32);
  const mainChannel = area / 3.5;
  const furringChannel = area / 2.5;
  const perimeterChannel = perimeter;
  const hangerRod = area / 20;
  const screws = ceil(area / 4);
  const jointCompound = area * 0.08;
  const fiberTape = area * 0.35;
  const paintArea = area * 1.05;
  const labourArea = area;

  const calculateBOQ = () => {
    const materialFactor =
      ceilingType === "POP Ceiling" ? 0.85 :
      ceilingType === "Grid Ceiling" ? 0.95 :
      ceilingType === "PVC Ceiling" ? 0.9 :
      ceilingType === "Wooden Ceiling" ? 1.35 : 1;

    const items: any[] = [
      { sr: 1, code: "FCL-01", desc: `${ceilingType} Work Area`, uom: "sft", qty: area, matRate: getRate(["FCLAREA-000001", "falseCeilingArea"], 0), labRate: getRate(["SFCLAREA-000001", "falseCeilingLabour"], 45), amount: 0 },
      { sr: 2, code: "FCL-02", desc: "Gypsum / Ceiling Board 8x4", uom: "nos", qty: boardNos, matRate: getRate(["FCLBRD-000001", "gypsumBoard"], 420) * materialFactor, labRate: 0, amount: 0 },
      { sr: 3, code: "FCL-03", desc: "Perimeter Channel", uom: "rft", qty: perimeterChannel, matRate: getRate(["FCLPER-000001", "perimeterChannel"], 18), labRate: getRate(["SFCLPER-000001", "perimeterChannelLabour"], 4), amount: 0 },
      { sr: 4, code: "FCL-04", desc: "Main Channel", uom: "rft", qty: mainChannel, matRate: getRate(["FCLMAIN-000001", "mainChannel"], 28), labRate: getRate(["SFCLMAIN-000001", "mainChannelLabour"], 5), amount: 0 },
      { sr: 5, code: "FCL-05", desc: "Furring / Intermediate Channel", uom: "rft", qty: furringChannel, matRate: getRate(["FCLFUR-000001", "furringChannel"], 22), labRate: getRate(["SFCLFUR-000001", "furringChannelLabour"], 5), amount: 0 },
      { sr: 6, code: "FCL-06", desc: "Hanger Rod with Fastener", uom: "nos", qty: ceil(hangerRod), matRate: getRate(["FCLHNG-000001", "hangerRod"], 35), labRate: getRate(["SFCLHNG-000001", "hangerRodLabour"], 8), amount: 0 },
      { sr: 7, code: "FCL-07", desc: "Drywall Screws", uom: "box", qty: screws, matRate: getRate(["FCLSWR-000001", "drywallScrews"], 120), labRate: 0, amount: 0 },
      { sr: 8, code: "FCL-08", desc: "Jointing Compound", uom: "kg", qty: jointCompound, matRate: getRate(["FCLJNT-000001", "jointCompound"], 45), labRate: getRate(["SFCLJNT-000001", "jointingLabour"], 8), amount: 0 },
      { sr: 9, code: "FCL-09", desc: "Fiber Mesh Tape", uom: "rft", qty: fiberTape, matRate: getRate(["FCLTAP-000001", "fiberTape"], 3), labRate: 1, amount: 0 },
      { sr: 10, code: "FCL-10", desc: "Cove / Tray Ceiling Running Work", uom: "rft", qty: coveLength, matRate: getRate(["FCLCOV-000001", "coveCeiling"], 180), labRate: getRate(["SFCLCOV-000001", "coveLabour"], 60), amount: 0 },
      { sr: 11, code: "FCL-11", desc: "LED Spot Light Cutout", uom: "nos", qty: lightPoints, matRate: getRate(["FCLCUT-000001", "lightCutout"], 40), labRate: getRate(["SFCLCUT-000001", "cutoutLabour"], 25), amount: 0 },
      { sr: 12, code: "FCL-12", desc: "Putty / Primer / Finishing Paint Area", uom: "sft", qty: paintArea, matRate: getRate(["FCLPNT-000001", "ceilingPaint"], 18), labRate: getRate(["SFCLPNT-000001", "ceilingPaintLabour"], 12), amount: 0 },
      { sr: 13, code: "FCL-13", desc: "Final Cleaning & Finishing", uom: "lump", qty: 1, matRate: getRate(["FCLFIN-000001", "ceilingFinishing"], 1500), labRate: getRate(["SFCLFIN-000001", "ceilingFinishingLabour"], 800), amount: 0 }
    ];

    items.forEach(i => i.amount = (i.qty * i.matRate) + (i.qty * i.labRate));

    const materialTotal = items.reduce((s, i) => s + i.qty * i.matRate, 0);
    const labourTotal = items.reduce((s, i) => s + i.qty * i.labRate, 0);
    const grandTotal = materialTotal + labourTotal;

    setResults({ items, materialTotal, labourTotal, grandTotal, ratePerSft: grandTotal / area, area, boardNos });
  };

  const exportExcel = () => {
    if (!results) return;
    const data = results.items.map((i: any) => ({
      Sr: i.sr, Code: i.code, Description: i.desc, UOM: i.uom,
      Qty: fmt(i.qty), "Mat Rate": fmt(i.matRate), "Lab Rate": fmt(i.labRate), Total: fmt(i.amount)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "False_Ceiling_BOQ");
    XLSX.writeFile(wb, `False_Ceiling_BOQ_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const shareWhatsApp = () => {
    if (!results) return;
    const msg = `False Ceiling BOQ\nProject: ${projectName}\nArea: ${fmt(results.area)} sft\nBoards: ${results.boardNos} nos\nTotal: ₹${fmt(results.grandTotal)}\nRate/sft: ₹${fmt(results.ratePerSft)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) return <div style={{ padding: 20 }}>Loading rates...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => router.push("/boq")} style={styles.backButton}>←</button>
        <h1 style={styles.title}>⬇️ False Ceiling BOQ Calculator</h1>
      </div>

      <div style={styles.section}>📋 Basic Details</div>
      <div style={styles.grid4}>
        <div><label style={styles.label}>Project Name</label><input style={styles.input} value={projectName} onChange={e => setProjectName(e.target.value)} /></div>
        <div><label style={styles.label}>Client Name</label><input style={styles.input} value={clientName} onChange={e => setClientName(e.target.value)} /></div>
        <div><label style={styles.label}>Mobile No.</label><input style={styles.input} value={mobileNo} onChange={e => setMobileNo(e.target.value)} /></div>
        <div><label style={styles.label}>City</label><input style={styles.input} value={city} onChange={e => setCity(e.target.value)} /></div>
      </div>

      <div style={styles.section}>📐 Ceiling Details</div>
      <div style={styles.grid4}>
        <div><label style={styles.label}>Ceiling Type</label><select style={styles.select} value={ceilingType} onChange={e => setCeilingType(e.target.value)}><option>Gypsum Board Ceiling</option><option>POP Ceiling</option><option>Grid Ceiling</option><option>PVC Ceiling</option><option>Wooden Ceiling</option></select></div>
        <div><label style={styles.label}>Length (ft)</label><input type="number" style={styles.input} value={length} onChange={e => setLength(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Width (ft)</label><input type="number" style={styles.input} value={width} onChange={e => setWidth(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Rooms / Nos</label><input type="number" style={styles.input} value={rooms} onChange={e => setRooms(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Cove Length (rft)</label><input type="number" style={styles.input} value={coveLength} onChange={e => setCoveLength(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Light Points</label><input type="number" style={styles.input} value={lightPoints} onChange={e => setLightPoints(Number(e.target.value))} /></div>
        <div><label style={styles.label}>Ceiling Area</label><input style={{ ...styles.input, ...styles.readOnly }} value={fmt(area)} readOnly /></div>
        <div><label style={styles.label}>Board Nos</label><input style={{ ...styles.input, ...styles.readOnly }} value={boardNos} readOnly /></div>
      </div>

      <button onClick={calculateBOQ} style={styles.btn}>🔨 Generate False Ceiling BOQ</button>

      {results && (
        <>
          <div style={styles.cards}>
            <div style={{ ...styles.card, backgroundColor: "#800020" }}>💰<div>Total</div><b>₹{fmt(results.grandTotal)}</b></div>
            <div style={{ ...styles.card, backgroundColor: "#2196F3" }}>📐<div>Area</div><b>{fmt(results.area)} sft</b></div>
            <div style={{ ...styles.card, backgroundColor: "#4CAF50" }}>⬇️<div>Boards</div><b>{results.boardNos} nos</b></div>
            <div style={{ ...styles.card, backgroundColor: "#9C27B0" }}>👷<div>Labour</div><b>₹{fmt(results.labourTotal)}</b></div>
          </div>

          <div style={styles.buttonContainer}>
            <button onClick={() => checkAndRun("boq_export", "boq-false-ceiling", exportExcel)} style={styles.green}>📊 Excel</button>
            <button onClick={() => checkAndRun("boq_export", "boq-false-ceiling", shareWhatsApp)} style={styles.whats}>💬 Share</button>
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
        </>
      )}
    </div>
  );
}