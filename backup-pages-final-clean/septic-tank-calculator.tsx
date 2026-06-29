import React, { useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const fmt = (n: any) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SepticTankCalculator() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();

  const [length, setLength] = useState(8);
  const [width, setWidth] = useState(4);
  const [depth, setDepth] = useState(5);
  const [unit, setUnit] = useState("Feet");
  const [wallType, setWallType] = useState("Concrete Block");
  const [grade, setGrade] = useState("M20");
  const [wastage, setWastage] = useState(3);
  const [result, setResult] = useState<any>(null);

  const cement = getMasterRate(["cement", "opc", "ppc"], 0);
  const sand = getMasterRate(["m sand", "sand"], 0);
  const agg20 = getMasterRate(["20mm aggregate", "ca1"], 0);
  const agg12 = getMasterRate(["12mm aggregate", "ca2"], 0);
  const steel = getMasterRate(["steel", "tmt"], 0);
  const block = getMasterRate(["6 inch block", "concrete block"], 0);
  const stone = getMasterRate(["size stone", "stone masonry"], 0);
  const binding = getMasterRate(["binding wire"], 0);
  const pvc = getMasterRate(["pvc pipe", "110mm pvc pipe", "75mm pvc pipe"], 0);
  const labour = getMasterRate(["septic tank labour", "masonry labour", "rcc labour"], 0, ["bm_labour_rates", "bm_service_rates"]);

  const calc = () => {
    const L = unit === "Meter" ? length * 3.28084 : length;
    const W = unit === "Meter" ? width * 3.28084 : width;
    const H = unit === "Meter" ? depth * 3.28084 : depth;

    const wallT = 1;        // default 1 ft wall
    const slabT = 150 / 304.8; // 150mm slab
    const innerL = Math.max(L - 2 * wallT, 0);
    const innerW = Math.max(W - 2 * wallT, 0);

    const capacityLtr = innerL * innerW * H * 28.3168;
    const wallArea = 2 * (L + W) * H;
    const slabArea = L * W;
    const wallVolume = wallArea * wallT;
    const slabConcrete = slabArea * slabT * 2; // base + cover slab
    const rccCft = slabConcrete + (wallType === "RCC" ? wallVolume : 0);
    const rccCum = rccCft / 35.315;

    const cementBags = rccCum * 7.5 * (1 + wastage / 100);
    const sandCft = rccCum * 14.83 * (1 + wastage / 100);
    const aggCft = (rccCum * 17.8 + rccCum * 11.87) * (1 + wastage / 100);

    const blockQty = wallType === "Concrete Block" ? wallArea / 0.89 : 0;
    const stoneQty = wallType === "Size Stone" ? wallVolume : 0;

    const mortarCft = wallType === "RCC" ? 0 : wallVolume * 0.18;
    const mortarCum = mortarCft / 35.315;
    const mortarCement = mortarCum * 5.5;
    const mortarSand = mortarCum * 28;

    const slabSteel12 = slabArea * 0.55;
    const slabSteel10 = slabArea * 0.38;
    const wallSteel = wallType === "RCC" ? wallArea * 0.35 : 0;
    const totalSteel = (slabSteel12 + slabSteel10 + wallSteel) * (1 + wastage / 100);
    const bindingKg = totalSteel * 0.01;

    const sleevesVentQty = 3;
    const sleevesVentCost = sleevesVentQty * pvc.rate;

    const materialTotal =
      cementBags * cement.rate +
      sandCft * sand.rate +
      aggCft * ((agg20.rate + agg12.rate) / 2) +
      blockQty * block.rate +
      stoneQty * stone.rate +
      mortarCement * cement.rate +
      mortarSand * sand.rate +
      totalSteel * steel.rate +
      bindingKg * binding.rate 
      sleevesVentCost;


    const labourCost = (rccCum + mortarCum) * labour.rate;
    const grandTotal = materialTotal + labourCost;

    const rows: any[] = [
      ["Tank Capacity", capacityLtr, "Liters", ""],
      ["RCC Concrete - Base + Cover Slab + RCC Wall if selected", rccCft, "CFT", ""],
      ["Cement", cementBags + mortarCement, "bags", (cementBags + mortarCement) * cement.rate],
      ["M Sand", sandCft + mortarSand, "CFT", (sandCft + mortarSand) * sand.rate],
      ["CA1 + CA2 Aggregate", aggCft, "CFT", aggCft * ((agg20.rate + agg12.rate) / 2)],
    ];

    if (wallType === "Concrete Block") rows.push(["Concrete Block Wall", blockQty, "Nos", blockQty * block.rate]);
    if (wallType === "Size Stone") rows.push(["Size Stone Wall", stoneQty, "CFT", stoneQty * stone.rate]);

    rows.push(
      ["Steel - 12mm + 10mm Cover/Base Slab + RCC Wall if selected", totalSteel, "kg", totalSteel * steel.rate],
      ["Binding Wire", bindingKg, "kg", bindingKg * binding.rate],
      ["PVC Inlet + Outlet Sleeves + Air Vent", sleevesVentQty, "Set", sleevesVentCost],
      ["Material Total", "", "", materialTotal],
      ["Labour", rccCum + mortarCum, "CUM", labourCost],
      ["GRAND TOTAL", "", "", grandTotal]
    );

    setResult({ capacityLtr, rccCft, totalSteel, grandTotal, rows });
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
    XLSX.utils.book_append_sheet(wb, ws, "Septic Tank");
    XLSX.writeFile(wb, "Septic_Tank.xlsx");
  };

  const share = () => {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Septic Tank Estimate\nCapacity: ${fmt(result.capacityLtr)} L\nConcrete: ${fmt(result.rccCft)} CFT\nSteel: ${fmt(result.totalSteel)} kg\nTotal: ₹${fmt(result.grandTotal)}`)}`, "_blank");
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
        <h2>🚽 Septic Tank Calculator</h2>
      </div>

      <div style={styles.card}>
        💰 Admin Rates: Cement ₹{cement.rate}/bag | Steel ₹{steel.rate}/kg | PVC ₹{pvc.rate}/set
        {rateMsg && <div style={{ color: "#856404" }}>{rateMsg}</div>}
      </div>

      <div style={styles.card}>
        <h3>📐 Tank Inputs</h3>
        <div style={styles.grid}>
          <div><label style={styles.label}>Length</label><input style={styles.input} type="number" value={length} onChange={e => setLength(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Width</label><input style={styles.input} type="number" value={width} onChange={e => setWidth(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Depth</label><input style={styles.input} type="number" value={depth} onChange={e => setDepth(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Wastage (%)</label><input style={styles.input} type="number" value={wastage} onChange={e => setWastage(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Unit</label><select style={styles.input} value={unit} onChange={e => setUnit(e.target.value)}><option>Feet</option><option>Meter</option></select></div>
          <div><label style={styles.label}>Wall Type</label><select style={styles.input} value={wallType} onChange={e => setWallType(e.target.value)}><option>Concrete Block</option><option>Size Stone</option><option>RCC</option></select></div>
          <div><label style={styles.label}>Grade</label><select style={styles.input} value={grade} onChange={e => setGrade(e.target.value)}><option>M20</option><option>M25</option><option>M30</option></select></div>
        </div>
        <p style={{ fontSize: 12 }}>Defaults: 1 ft wall, 150mm base slab, 150mm cover slab, 12mm + 10mm steel @ 100mm, PVC inlet/outlet/vent seting included.</p>
      </div>

      <div style={{ textAlign: "center" }}>
        <button style={styles.btn} onClick={calc}>🔨 Generate</button>
        {result && <button style={{ ...styles.btn, background: "#28a745" }} onClick={() => checkAndRun('calculator_export', 'septic-tank-calculator', exportExcel)}>📊 Excel</button>}
        {result && <button style={{ ...styles.btn, background: "#25D366" }} onClick={share}>💬 Share</button>}
      </div>

      {result && (
        <div style={styles.card}>
          <h3>Results</h3>
          <p>Capacity: {fmt(result.capacityLtr)} L | Concrete: {fmt(result.rccCft)} CFT | Steel: {fmt(result.totalSteel)} kg | Total: ₹{fmt(result.grandTotal)}</p>
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








