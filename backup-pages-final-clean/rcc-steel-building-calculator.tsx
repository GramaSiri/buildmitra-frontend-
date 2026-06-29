import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const fmt = (n: number) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function RCCSteelBuildingCalculator() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();

  const [plotL, setPlotL] = useState(30);
  const [plotW, setPlotW] = useState(40);
  const [floors, setFloors] = useState(2);
  const [buaFactor, setBuaFactor] = useState(0.85);
  const [floorHeight, setFloorHeight] = useState(10);

  const cement = getMasterRate(["cement", "opc", "ppc"], 0);
  const sand = getMasterRate(["m sand", "sand"], 0);
  const ca20 = getMasterRate(["20mm aggregate", "20 mm aggregate", "ca1", "coarse aggregate 20"], 0);
  const ca12 = getMasterRate(["12mm aggregate", "12 mm aggregate", "ca2", "coarse aggregate 12"], 0);
  const steel = getMasterRate(["steel", "tmt", "rebar"], 0);
  const block6 = getMasterRate(["6 inch block", "6\" block", "concrete block 6", "6 block"], 0);
  const block4 = getMasterRate(["4 inch block", "4\" block", "concrete block 4", "4 block"], 0);
  const labour = getMasterRate(["civil labour", "rcc labour", "construction labour"], 0, ["bm_labour_rates", "bm_service_rates"]);

  const result = useMemo(() => {
    const plotArea = plotL * plotW;
    const floorArea = plotArea * buaFactor;
    const bua = floorArea * floors;

    // Civil thumb rule benchmarks
    const cementBags = bua * 0.4;
    const concreteCum = cementBags / 7.5;
    const concreteCft = concreteCum * 35.315;

    // Thumb rule concrete ingredients from cement benchmark
    // Approx per bag equivalent: M-sand 1.98 CFT, CA1 2.38 CFT, CA2 1.58 CFT
    const mSandCft = cementBags * 1.98;
    const ca20Cft = cementBags * 2.38;
    const ca12Cft = cementBags * 1.58;

    // Steel thumb rule: GF 3.0 kg/sft, every extra floor +0.1 kg/sft
    const steelKgPerSft = 3 + Math.max(floors - 1, 0) * 0.1;
    const totalSteelKg = bua * steelKgPerSft;

    let steel8 = 0;
    let steel10 = 0;
    let steel12 = 0;
    let steel16 = 0;
    let steel20 = 0;

    if (floors < 5) {
      steel8 = totalSteelKg * 0.22;
      steel10 = totalSteelKg * 0.28;
      steel12 = totalSteelKg * 0.30;
      steel16 = totalSteelKg * 0.20;
      steel20 = 0;
    } else {
      steel8 = totalSteelKg * 0.15;
      steel10 = totalSteelKg * 0.22;
      steel12 = totalSteelKg * 0.28;
      steel16 = totalSteelKg * 0.25;
      steel20 = totalSteelKg * 0.10;
    }

    // Blockwork thumb rule
    const perimeter = 2 * (plotL + plotW);
    const externalWallArea = perimeter * floorHeight * floors;
    const internalWallArea = bua * 1.15;

    // 16"x8" block with mortar average face area approx 0.89 sqft/block
    const blockFaceArea = 0.89;
    const block6Nos = externalWallArea / blockFaceArea;
    const block4Nos = internalWallArea / blockFaceArea;

    const grade = floors <= 2 ? "M20" : floors <= 4 ? "M25" : "M30";
    const footing = floors <= 2 ? "Isolated footing approx 5'×5'×1.5'" : floors <= 4 ? "Isolated/combined footing approx 6'×6'×1.75'" : "Raft / pile / structural design required";
    const column = floors <= 2 ? "9\"×12\" with 12mm/16mm bars" : floors <= 4 ? "12\"×18\" with 12mm/16mm bars" : "Designed column required";
    const beam = floors <= 2 ? "9\"×12\" with 12mm/16mm bars" : floors <= 4 ? "9\"×15\" with 12mm/16mm bars" : "Designed beam required";
    const slab = floors <= 2 ? "125mm slab with 8/10mm mesh" : "150mm slab with 8/10/12mm mesh";

    const cementCost = cementBags * cement.rate;
    const sandCost = mSandCft * sand.rate;
    const ca20Cost = ca20Cft * ca20.rate;
    const ca12Cost = ca12Cft * ca12.rate;
    const steelCost = totalSteelKg * steel.rate;
    const block6Cost = block6Nos * block6.rate;
    const block4Cost = block4Nos * block4.rate;
    const labourCost = bua * labour.rate;

    const materialTotal = cementCost + sandCost + ca20Cost + ca12Cost + steelCost + block6Cost + block4Cost;
    const grandTotal = materialTotal + labourCost;

    const rows: any[] = [
      ["Plot Area", plotArea, "sqft", ""],
      ["Floor Area after BUA Factor", floorArea, "sqft", ""],
      ["Total BUA", bua, "sqft", ""],
      ["Recommended Concrete Grade", grade, "", ""],
      ["Concrete Derived from Cement Benchmark", concreteCum, "CUM", ""],
      ["Cement - BUA × 0.4 bags/sft", cementBags, "bags", cementCost],
      ["M Sand - Cement bags × 1.98 CFT", mSandCft, "CFT", sandCost],
      ["CA1 / 20mm Aggregate - Cement bags × 2.38 CFT", ca20Cft, "CFT", ca20Cost],
      ["CA2 / 12mm Aggregate - Cement bags × 1.58 CFT", ca12Cft, "CFT", ca12Cost],
      ["External Wall 6 inch Blocks", block6Nos, "Nos", block6Cost],
      ["Internal Wall 4 inch Blocks", block4Nos, "Nos", block4Cost],
      ["Steel Rate Rule", steelKgPerSft, "kg/sft", ""],
      ["8mm Steel", steel8, "kg", steel8 * steel.rate],
      ["10mm Steel", steel10, "kg", steel10 * steel.rate],
      ["12mm Steel", steel12, "kg", steel12 * steel.rate],
      ["16mm Steel", steel16, "kg", steel16 * steel.rate]
    ];

    if (floors >= 5) {
      rows.push(["20mm Steel", steel20, "kg", steel20 * steel.rate]);
    }

    rows.push(
      ["Total Steel", totalSteelKg, "kg", steelCost],
      ["Material Total", "", "", materialTotal],
      ["Labour", bua, "sqft", labourCost],
      ["GRAND TOTAL", "", "", grandTotal]
    );

    return {
      plotArea,
      floorArea,
      bua,
      grade,
      concreteCum,
      concreteCft,
      cementBags,
      mSandCft,
      ca20Cft,
      ca12Cft,
      totalSteelKg,
      steelKgPerSft,
      block6Nos,
      block4Nos,
      footing,
      column,
      beam,
      slab,
      materialTotal,
      labourCost,
      grandTotal,
      rows
    };
  }, [plotL, plotW, floors, buaFactor, floorHeight, cement.rate, sand.rate, ca20.rate, ca12.rate, steel.rate, block6.rate, block4.rate, labour.rate]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(result.rows.map(([Item, Quantity, Unit, Cost]: any[]) => ({
      Item,
      Quantity: typeof Quantity === "number" ? fmt(Quantity) : Quantity,
      Unit,
      Cost: typeof Cost === "number" ? "₹" + fmt(Cost) : Cost
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RCC_Steel_Block");
    XLSX.writeFile(wb, "RCC_Steel_Block_Building_Estimate.xlsx");
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`RCC + Steel + Blockwork Estimate
BUA: ${fmt(result.bua)} sqft
Concrete Grade: ${result.grade}
Concrete: ${fmt(result.concreteCum)} CUM
Cement: ${fmt(result.cementBags)} bags
Steel: ${fmt(result.totalSteelKg)} kg
6" Blocks: ${fmt(result.block6Nos)} Nos
4" Blocks: ${fmt(result.block4Nos)} Nos
Total: ₹${fmt(result.grandTotal)}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const rateMsg = rateStatusMessage({ cement, sand, ca20, ca12, steel, block6, block4, labour });

  const styles: any = {
    container: { padding: 14, background: "#f5f0e8", minHeight: "100vh", fontFamily: "Arial" },
    header: { background: "#800020", color: "white", padding: 14, borderRadius: 8, display: "flex", gap: 12, alignItems: "center" },
    card: { background: "white", padding: 14, borderRadius: 10, marginTop: 14, boxShadow: "0 2px 8px #ddd" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 },
    input: { width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 },
    label: { fontSize: 12, fontWeight: 700 },
    btn: { background: "#800020", color: "white", padding: "9px 16px", border: 0, borderRadius: 6, cursor: "pointer" },
    th: { background: "#800020", color: "white", padding: 8, textAlign: "left" },
    td: { padding: 8, borderBottom: "1px solid #eee" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => router.push("/calculators")} style={{ background: "transparent", color: "white", border: 0, fontSize: 22 }}>←</button>
        <h2>🏗️ RCC + Steel + Blockwork Building Calculator</h2>
      </div>

      <div style={styles.card}>
        <b>💰 Admin Master Rates:</b> Cement ₹{cement.rate}/bag | Steel ₹{steel.rate}/kg | Sand ₹{sand.rate}/CFT | CA1 ₹{ca20.rate}/CFT | CA2 ₹{ca12.rate}/CFT | 6" Block ₹{block6.rate}/Nos | 4" Block ₹{block4.rate}/Nos
        {rateMsg && <div style={{ color: "#856404", marginTop: 6 }}>{rateMsg}</div>}
      </div>

      <div style={styles.card}>
        <h3>📐 Building Inputs</h3>
        <div style={styles.grid}>
          <div><label style={styles.label}>Plot Length (ft)</label><input style={styles.input} type="number" value={plotL} onChange={e => setPlotL(Number(e.target.value))} /></div>
          <div><label style={styles.label}>Plot Width (ft)</label><input style={styles.input} type="number" value={plotW} onChange={e => setPlotW(Number(e.target.value))} /></div>
          <div><label style={styles.label}>No. of Floors</label><input style={styles.input} type="number" value={floors} onChange={e => setFloors(Number(e.target.value))} /></div>
          <div><label style={styles.label}>BUA Factor</label><input style={styles.input} type="number" step="0.01" value={buaFactor} onChange={e => setBuaFactor(Number(e.target.value))} /></div>
          <div><label style={styles.label}>Floor Height (ft)</label><input style={styles.input} type="number" value={floorHeight} onChange={e => setFloorHeight(Number(e.target.value))} /></div>
        </div>
      </div>

      <div style={styles.card}>
        <h3>📊 Summary</h3>
        <div style={styles.grid}>
          <div><b>Total BUA</b><br />{fmt(result.bua)} sqft</div>
          <div><b>Concrete Grade</b><br />{result.grade}</div>
          <div><b>Concrete</b><br />{fmt(result.concreteCum)} CUM</div>
          <div><b>Cement</b><br />{fmt(result.cementBags)} bags</div>
          <div><b>Steel</b><br />{fmt(result.totalSteelKg)} kg</div>
          <div><b>Total</b><br />₹{fmt(result.grandTotal)}</div>
        </div>
      </div>

      <div style={styles.card}>
        <h3>🏗️ Suggested Structural Thumb Rule</h3>
        <p><b>Footing:</b> {result.footing}</p>
        <p><b>Column:</b> {result.column}</p>
        <p><b>Beam:</b> {result.beam}</p>
        <p><b>Slab:</b> {result.slab}</p>
        <p style={{ color: "#b91c1c" }}>Note: This is thumb-rule BOQ estimate. Final structural design must be verified by a licensed structural engineer.</p>
      </div>

      <div style={{ margin: "16px 0", display: "flex", gap: 10 }}>
        <button style={styles.btn}>🔨 Generate</button>
        <button onClick={() => checkAndRun('calculator_export', 'rcc-steel-building-calculator', exportExcel)} style={{ ...styles.btn, background: "#28a745" }}>📊 Excel</button>
        <button onClick={() => checkAndRun('calculator_export', 'rcc-steel-building-calculator', shareWhatsApp)} style={{ ...styles.btn, background: "#25D366" }}>💬 Share</button>
      </div>

      <div style={styles.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={styles.th}>Item</th><th style={styles.th}>Quantity</th><th style={styles.th}>Unit</th><th style={styles.th}>Cost</th></tr></thead>
          <tbody>
            {result.rows.map((r: any, i: number) => (
              <tr key={i}>
                <td style={styles.td}>{r[0]}</td>
                <td style={styles.td}>{typeof r[1] === "number" ? fmt(r[1]) : r[1]}</td>
                <td style={styles.td}>{r[2]}</td>
                <td style={styles.td}>{typeof r[3] === "number" ? "₹" + fmt(r[3]) : r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

