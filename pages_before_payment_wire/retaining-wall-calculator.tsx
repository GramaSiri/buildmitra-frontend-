import React, { useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const fmt = (n: any) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const kgPerM = (dia: number) => (dia * dia) / 162;

export default function RetainingWallCalculator() {
  const router = useRouter();

  const [length, setLength] = useState(20);
  const [height, setHeight] = useState(3);
  const [thickness, setThickness] = useState(0.5);
  const [unit, setUnit] = useState("Feet");
  const [grade, setGrade] = useState("M20");
  const [cover, setCover] = useState(40);
  const [wastage, setWastage] = useState(3);

  const [verticalDia, setVerticalDia] = useState(12);
  const [horizontalDia, setHorizontalDia] = useState(10);
  const [toeHeelDia, setToeHeelDia] = useState(12);
  const [spacing, setSpacing] = useState(150);

  const [result, setResult] = useState<any>(null);

  const cement = getMasterRate(["cement", "opc", "ppc"], 0);
  const sand = getMasterRate(["m sand", "sand"], 0);
  const agg20 = getMasterRate(["20mm aggregate", "ca1"], 0);
  const agg12 = getMasterRate(["12mm aggregate", "ca2"], 0);
  const steel = getMasterRate(["steel", "tmt"], 0);
  const binding = getMasterRate(["binding wire"], 0);
  const coverBlock = getMasterRate(["cover block"], 0);
  const water = getMasterRate(["water"], 0, ["bm_service_rates", "bm_material_rates"]);
  const labour = getMasterRate(["retaining wall labour", "rcc labour", "concrete labour"], 0, ["bm_labour_rates", "bm_service_rates"]);

  const calc = () => {
    const Lft = unit === "Meter" ? length * 3.28084 : length;
    const Hft = unit === "Meter" ? height * 3.28084 : height;
    const Tft = unit === "Meter" ? thickness * 3.28084 : thickness;

    const concreteCft = Lft * Hft * Tft;
    const concreteCum = concreteCft / 35.315;

    const cementBags = concreteCum * 7.5 * (1 + wastage / 100);
    const sandCft = concreteCum * 14.83 * (1 + wastage / 100);
    const agg20Cft = concreteCum * 17.8 * (1 + wastage / 100);
    const agg12Cft = concreteCum * 11.87 * (1 + wastage / 100);
    const waterLtr = concreteCum * 170;

    const Lm = Lft * 0.3048;
    const Hm = Hft * 0.3048;
    const spacingM = spacing / 1000;
    const coverM = cover / 1000;

    const clearL = Math.max(Lm - 2 * coverM, 0.01);
    const clearH = Math.max(Hm - 2 * coverM, 0.01);

    const verticalBars = Math.floor((clearL * 1000) / spacing) + 1;
    const horizontalBars = Math.floor((clearH * 1000) / spacing) + 1;

    const toeHeelProjectionM = Math.max(Hm * 0.5, 0.6);
    const toeHeelBars = verticalBars;

    const verticalSteel = verticalBars * clearH * kgPerM(verticalDia);
    const horizontalSteel = horizontalBars * clearL * kgPerM(horizontalDia);
    const toeHeelSteel = toeHeelBars * toeHeelProjectionM * kgPerM(toeHeelDia);

    const totalSteel = (verticalSteel + horizontalSteel + toeHeelSteel) * (1 + wastage / 100);
    const bindingKg = totalSteel * 0.01;
    const coverBlocks = Math.ceil((Lft * Hft) / 5);

    const materialTotal =
      cementBags * cement.rate +
      sandCft * sand.rate +
      agg20Cft * agg20.rate +
      agg12Cft * agg12.rate +
      totalSteel * steel.rate +
      bindingKg * binding.rate +
      coverBlocks * coverBlock.rate +
      waterLtr * water.rate;

    const labourCost = concreteCum * labour.rate;
    const grandTotal = materialTotal + labourCost;

    const steelMap: any = {};
    const addSteel = (dia: number, label: string, qty: number) => {
      const key = `${dia}mm`;
      if (!steelMap[key]) steelMap[key] = { dia, qty: 0, parts: [] };
      steelMap[key].qty += qty;
      steelMap[key].parts.push(`${label}: ${fmt(qty)} kg`);
    };

    addSteel(verticalDia, "Vertical Bars", verticalSteel * (1 + wastage / 100));
    addSteel(horizontalDia, "Horizontal Bars", horizontalSteel * (1 + wastage / 100));
    addSteel(toeHeelDia, "Toe/Heel Bars", toeHeelSteel * (1 + wastage / 100));

    const rows: any[] = [
      ["Concrete Volume", concreteCft, "CFT", ""],
      ["Cement", cementBags, "bags", cementBags * cement.rate],
      ["M Sand", sandCft, "CFT", sandCft * sand.rate],
      ["CA1 + CA2 Aggregate", agg20Cft + agg12Cft, "CFT", agg20Cft * agg20.rate + agg12Cft * agg12.rate],
      ...Object.values(steelMap).map((s: any) => [
        `Steel ${s.dia} Total (${s.parts.join(" | ")})`,
        s.qty,
        "kg",
        s.qty * steel.rate
      ]),
      ["Total Steel", totalSteel, "kg", totalSteel * steel.rate],
      ["Binding Wire", bindingKg, "kg", bindingKg * binding.rate],
      ["Cover Blocks", coverBlocks, "Nos", coverBlocks * coverBlock.rate],
      ["Water", waterLtr, "Ltr", waterLtr * water.rate],
      ["Material Total", "", "", materialTotal],
      ["Labour", concreteCum, "CUM", labourCost],
      ["GRAND TOTAL", "", "", grandTotal],
    ];

    setResult({ concreteCft, cementBags, totalSteel, grandTotal, rows });
  };

  const exportExcel = () => {
    if (!result) return;
    const ws = XLSX.utils.json_to_sheet(result.rows.map((r: any[]) => ({
      Item: r[0],
      Quantity: typeof r[1] === "number" ? fmt(r[1]) : r[1],
      Unit: r[2],
      Cost: typeof r[3] === "number" ? "₹" + fmt(r[3]) : "-"
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Retaining Wall");
    XLSX.writeFile(wb, "Retaining_Wall.xlsx");
  };

  const share = () => {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Retaining Wall Estimate\nConcrete: ${fmt(result.concreteCft)} CFT\nCement: ${fmt(result.cementBags)} bags\nSteel: ${fmt(result.totalSteel)} kg\nTotal: ₹${fmt(result.grandTotal)}`)}`, "_blank");
  };

  const styles: any = {
    page: { padding: 12, background: "#f5f0e8", minHeight: "100vh", fontFamily: "Arial" },
    header: { background: "#795548", color: "white", padding: 12, borderRadius: 8, display: "flex", gap: 10, alignItems: "center" },
    card: { background: "white", padding: 12, borderRadius: 8, marginTop: 12 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 },
    input: { width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 },
    label: { fontSize: 11, fontWeight: 600 },
    btn: { background: "#800020", color: "white", padding: "8px 18px", border: 0, borderRadius: 6, margin: 5 },
    th: { background: "#795548", color: "white", padding: 8 },
    td: { padding: 6, borderBottom: "1px solid #eee" }
  };

  const rateMsg = rateStatusMessage({ cement, sand, agg20, agg12, steel, labour });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => router.push("/calculators")} style={{ background: "transparent", color: "white", border: 0, fontSize: 22 }}>←</button>
        <h2>🧱 Retaining Wall Calculator</h2>
      </div>

      <div style={styles.card}>
        💰 Admin Rates: Cement ₹{cement.rate}/bag | Steel ₹{steel.rate}/kg | Labour ₹{labour.rate}/CUM
        {rateMsg && <div style={{ color: "#856404" }}>{rateMsg}</div>}
      </div>

      <div style={styles.card}>
        <h3>📐 Wall Dimensions</h3>
        <div style={styles.grid}>
          <div><label style={styles.label}>Length</label><input style={styles.input} type="number" value={length} onChange={e => setLength(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Height</label><input style={styles.input} type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Thickness</label><input style={styles.input} type="number" value={thickness} onChange={e => setThickness(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Cover (mm)</label><input style={styles.input} type="number" value={cover} onChange={e => setCover(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Wastage (%)</label><input style={styles.input} type="number" value={wastage} onChange={e => setWastage(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Unit</label><select style={styles.input} value={unit} onChange={e => setUnit(e.target.value)}><option>Feet</option><option>Meter</option></select></div>
          <div><label style={styles.label}>Grade</label><select style={styles.input} value={grade} onChange={e => setGrade(e.target.value)}><option>M20</option><option>M25</option><option>M30</option></select></div>
        </div>
      </div>

      <div style={styles.card}>
        <h3>🔄 Reinforcement</h3>
        <div style={styles.grid}>
          <div><label style={styles.label}>Vertical Dia (mm)</label><input style={styles.input} type="number" value={verticalDia} onChange={e => setVerticalDia(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Horizontal Dia (mm)</label><input style={styles.input} type="number" value={horizontalDia} onChange={e => setHorizontalDia(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Toe/Heel Dia (mm)</label><input style={styles.input} type="number" value={toeHeelDia} onChange={e => setToeHeelDia(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Common Spacing (mm)</label><input style={styles.input} type="number" value={spacing} onChange={e => setSpacing(parseFloat(e.target.value) || 0)} /></div>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <button style={styles.btn} onClick={calc}>🔨 Generate</button>
        {result && <button style={{ ...styles.btn, background: "#28a745" }} onClick={exportExcel}>📊 Excel</button>}
        {result && <button style={{ ...styles.btn, background: "#25D366" }} onClick={share}>💬 Share</button>}
      </div>

      {result && (
        <div style={styles.card}>
          <h3>Results</h3>
          <p>Concrete: {fmt(result.concreteCft)} CFT | Cement: {fmt(result.cementBags)} bags | Steel: {fmt(result.totalSteel)} kg | Total: ₹{fmt(result.grandTotal)}</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={styles.th}>Item</th><th style={styles.th}>Qty</th><th style={styles.th}>Unit</th><th style={styles.th}>Cost</th></tr></thead>
            <tbody>
              {result.rows.map((r: any[], i: number) => (
                <tr key={i}>
                  <td style={styles.td}>{r[0]}</td>
                  <td style={styles.td}>{typeof r[1] === "number" ? fmt(r[1]) : r[1]}</td>
                  <td style={styles.td}>{r[2]}</td>
                  <td style={styles.td}>{typeof r[3] === "number" ? "₹" + fmt(r[3]) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}