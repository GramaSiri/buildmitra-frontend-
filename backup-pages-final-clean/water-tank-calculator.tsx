import React, { useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const fmt = (n:any) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const kgPerM = (d:number) => d * d / 162;

export default function WaterTankCalculator() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();

  const [nos, setNos] = useState(1);
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(6);
  const [unit, setUnit] = useState("Feet");
  const [wallType, setWallType] = useState("RCC");
  const [grade, setGrade] = useState("M20");
  const [wastage, setWastage] = useState(3);
  const [result, setResult] = useState<any>(null);

  const cement = getMasterRate(["cement", "opc", "ppc"], 0);
  const sand = getMasterRate(["m sand", "sand"], 0);
  const agg20 = getMasterRate(["20mm aggregate", "20 mm aggregate", "ca1"], 0);
  const agg12 = getMasterRate(["12mm aggregate", "12 mm aggregate", "ca2"], 0);
  const steel = getMasterRate(["steel", "tmt", "rebar"], 0);
  const block = getMasterRate(["6 inch block", "6\" block", "concrete block"], 0);
  const brick = getMasterRate(["brick", "clay brick"], 0);
  const binding = getMasterRate(["binding wire"], 0);
  const waterproof = getMasterRate(["waterproofing", "water proofing"], 0, ["bm_service_rates", "bm_material_rates"]);
  const foodPaint = getMasterRate(["food grade paint", "tank paint"], 0, ["bm_service_rates", "bm_material_rates"]);
  const frp = getMasterRate(["frp cover", "tank cover"], 0, ["bm_service_rates", "bm_material_rates"]);
  const labour = getMasterRate(["water tank labour", "rcc labour", "concrete labour"], 0, ["bm_labour_rates", "bm_service_rates"]);

  const calc = () => {
    const L = unit === "Meter" ? length * 3.28084 : length;
    const W = unit === "Meter" ? width * 3.28084 : width;
    const H = unit === "Meter" ? height * 3.28084 : height;

    const wallT = 0.5;
    const baseT = 0.5;
    const coverT = 0.5;

    const innerL = Math.max(L - 2 * wallT, 0);
    const innerW = Math.max(W - 2 * wallT, 0);

    const capacityLtr = innerL * innerW * H * 28.3168 * nos;

    const wallArea = 2 * (L + W) * H * nos;
    const baseArea = L * W * nos;
    const coverArea = L * W * nos;

    const wallConcrete = wallArea * wallT;
    const baseConcrete = baseArea * baseT;
    const coverConcrete = coverArea * coverT;

    const rccCft = wallType === "RCC" ? wallConcrete + baseConcrete + coverConcrete : baseConcrete + coverConcrete;
    const rccCum = rccCft / 35.315;

    const cementBags = rccCum * 7.5 * (1 + wastage / 100);
    const sandCft = rccCum * 14.83 * (1 + wastage / 100);
    const agg20Cft = rccCum * 17.8 * (1 + wastage / 100);
    const agg12Cft = rccCum * 11.87 * (1 + wastage / 100);

    const blockNos = wallType === "Block" ? wallArea / 0.89 : 0;
    const brickNos = wallType === "Brick" ? wallConcrete * 13.5 : 0;

    const wallSteel8 = wallType === "RCC" ? wallArea * 0.204 : 0;
    const wallSteel10 = wallType === "RCC" ? wallArea * 0.167 : 0;
    const baseSteel12 = baseArea * 0.297;
    const coverSteel10 = coverArea * 0.204;

    const steel8 = wallSteel8 * (1 + wastage / 100);
    const steel10 = (wallSteel10 + coverSteel10) * (1 + wastage / 100);
    const steel12 = baseSteel12 * (1 + wastage / 100);
    const totalSteel = steel8 + steel10 + steel12;
    const bindingKg = totalSteel * 0.01;

    const waterproofArea = (2 * (innerL + innerW) * H + innerL * innerW) * nos;
    const foodPaintArea = waterproofArea;
    const frpArea = 4 * nos;

    const materialTotal =
      cementBags * cement.rate +
      sandCft * sand.rate +
      agg20Cft * agg20.rate +
      agg12Cft * agg12.rate +
      blockNos * block.rate +
      brickNos * brick.rate +
      totalSteel * steel.rate +
      bindingKg * binding.rate +
      waterproofArea * waterproof.rate +
      foodPaintArea * foodPaint.rate +
      frpArea * frp.rate;

    const labourCost = rccCum * labour.rate;
    const grandTotal = materialTotal + labourCost;

    const rows:any[] = [
      ["Water Capacity", capacityLtr, "Liters", ""],
      ["RCC Concrete", rccCft, "CFT", ""],
      ["Cement", cementBags, "bags", cementBags * cement.rate],
      ["M Sand", sandCft, "CFT", sandCft * sand.rate],
      ["CA1 + CA2 Aggregate", agg20Cft + agg12Cft, "CFT", agg20Cft * agg20.rate + agg12Cft * agg12.rate],
    ];

    if (wallType === "Block") rows.push(["6 inch Block Wall", blockNos, "Nos", blockNos * block.rate]);
    if (wallType === "Brick") rows.push(["Brick Wall", brickNos, "Nos", brickNos * brick.rate]);
    if (steel8 > 0) rows.push(["8mm Steel - RCC Walls", steel8, "kg", steel8 * steel.rate]);
    if (steel10 > 0) rows.push(["10mm Steel - Walls/Cover Slab", steel10, "kg", steel10 * steel.rate]);

    rows.push(
      ["12mm Steel - Base Slab", steel12, "kg", steel12 * steel.rate],
      ["Total Steel", totalSteel, "kg", totalSteel * steel.rate],
      ["Binding Wire", bindingKg, "kg", bindingKg * binding.rate],
      ["Waterproofing", waterproofArea, "sqft", waterproofArea * waterproof.rate],
      ["Food Grade Paint", foodPaintArea, "sqft", foodPaintArea * foodPaint.rate],
      ["FRP Cover 2ft x 2ft", frpArea, "sqft", frpArea * frp.rate],
      ["Material Total", "", "", materialTotal],
      ["Labour", rccCum, "CUM", labourCost],
      ["GRAND TOTAL", "", "", grandTotal]
    );

    setResult({ capacityLtr, rccCft, totalSteel, grandTotal, rows });
  };

  const exportExcel = () => {
    if (!result) return;
    const ws = XLSX.utils.json_to_sheet(result.rows.map((r:any[]) => ({
      Item: r[0], Quantity: typeof r[1] === "number" ? fmt(r[1]) : r[1], Unit: r[2], Cost: typeof r[3] === "number" ? "₹" + fmt(r[3]) : "-"
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Water Tank");
    XLSX.writeFile(wb, "Water_Tank.xlsx");
  };

  const share = () => {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Water Tank Estimate\nCapacity: ${fmt(result.capacityLtr)} L\nConcrete: ${fmt(result.rccCft)} CFT\nSteel: ${fmt(result.totalSteel)} kg\nTotal: ₹${fmt(result.grandTotal)}`)}`, "_blank");
  };

  const styles:any = {
    page: { padding: 12, background: "#f5f0e8", minHeight: "100vh", fontFamily: "Arial" },
    header: { background: "#0288d1", color: "white", padding: 12, borderRadius: 8, display: "flex", gap: 10, alignItems: "center" },
    card: { background: "white", padding: 12, borderRadius: 8, marginTop: 12 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 },
    input: { width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 },
    label: { fontSize: 11, fontWeight: 600 },
    btn: { background: "#800020", color: "white", padding: "8px 18px", border: 0, borderRadius: 6, margin: 5 },
    th: { background: "#0288d1", color: "white", padding: 8 },
    td: { padding: 6, borderBottom: "1px solid #eee" }
  };

  const rateMsg = rateStatusMessage({ cement, sand, agg20, agg12, steel, waterproof, foodPaint, labour });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => router.push("/calculators")} style={{ background: "transparent", color: "white", border: 0, fontSize: 22 }}>←</button>
        <h2>💧 Water Tank Calculator</h2>
      </div>

      <div style={styles.card}>
        💰 Admin Rates: Cement ₹{cement.rate}/bag | Steel ₹{steel.rate}/kg | Waterproofing ₹{waterproof.rate}/sqft | Food Paint ₹{foodPaint.rate}/sqft
        {rateMsg && <div style={{ color: "#856404" }}>{rateMsg}</div>}
      </div>

      <div style={styles.card}>
        <h3>📐 Tank Inputs</h3>
        <div style={styles.grid}>
          {[
            ["Nos", nos, setNos],
            ["Length", length, setLength],
            ["Width", width, setWidth],
            ["Height", height, setHeight],
            ["Wastage (%)", wastage, setWastage],
          ].map(([l, v, s]:any) => (
            <div key={l}><label style={styles.label}>{l}</label><input style={styles.input} type="number" value={v} onChange={e => s(parseFloat(e.target.value) || 0)} /></div>
          ))}

          <div><label style={styles.label}>Unit</label><select style={styles.input} value={unit} onChange={e => setUnit(e.target.value)}><option>Feet</option><option>Meter</option></select></div>
          <div><label style={styles.label}>Wall Type</label><select style={styles.input} value={wallType} onChange={e => setWallType(e.target.value)}><option>RCC</option><option>Block</option><option>Brick</option></select></div>
          <div><label style={styles.label}>Grade</label><select style={styles.input} value={grade} onChange={e => setGrade(e.target.value)}><option>M20</option><option>M25</option><option>M30</option></select></div>
        </div>
        <p style={{ fontSize: 12 }}>Defaults: 6 inch wall, 6 inch base slab, 6 inch cover slab, FRP cover, waterproofing and food-grade paint included.</p>
      </div>

      <div style={{ textAlign: "center" }}>
        <button style={styles.btn} onClick={calc}>🔨 Generate</button>
        {result && <button style={{ ...styles.btn, background: "#28a745" }} onClick={() => checkAndRun('calculator_export', 'water-tank-calculator', exportExcel)}>📊 Excel</button>}
        {result && <button style={{ ...styles.btn, background: "#25D366" }} onClick={share}>💬 Share</button>}
      </div>

      {result && (
        <div style={styles.card}>
          <h3>Results</h3>
          <p>Capacity: {fmt(result.capacityLtr)} L | Concrete: {fmt(result.rccCft)} CFT | Steel: {fmt(result.totalSteel)} kg | Total: ₹{fmt(result.grandTotal)}</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={styles.th}>Item</th><th style={styles.th}>Qty</th><th style={styles.th}>Unit</th><th style={styles.th}>Cost</th></tr></thead>
            <tbody>
              {result.rows.map((r:any[], i:number) => (
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


