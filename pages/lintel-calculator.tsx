import React, { useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const fmt = (n: any) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const kgPerM = (dia: number) => (dia * dia) / 162;

export default function LintelCalculator() {
  const { checkAndRun } = usePaymentBarrier();
  const router = useRouter();

  const [lintelNos, setLintelNos] = useState(4);
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(9);
  const [depth, setDepth] = useState(6);
  const [dimensionUnit, setDimensionUnit] = useState("Feet/Inch");
  const [grade, setGrade] = useState("M20");
  const [cover, setCover] = useState(25);
  const [wastage, setWastage] = useState(3);
  const [mainDia, setMainDia] = useState(12);
  const [mainNos, setMainNos] = useState(4);
  const [stirrupDia, setStirrupDia] = useState(8);
  const [stirrupSpacing, setStirrupSpacing] = useState(150);
  const [bearingLengthMm, setBearingLengthMm] = useState(150);
  const [result, setResult] = useState<any>(null);

  const cement = getMasterRate(["cement", "opc", "ppc"], 400);
  const sand = getMasterRate(["m sand", "sand"], 55);
  const agg20 = getMasterRate(["20mm aggregate", "ca1"], 50);
  const agg12 = getMasterRate(["12mm aggregate", "ca2"], 48);
  const steel = getMasterRate(["steel", "tmt", "rebar"], 68);
  const binding = getMasterRate(["binding wire"], 80);
  const coverBlock = getMasterRate(["cover block", "spacer"], 5);
  const shuttering = getMasterRate(["shuttering labour", "centering labour", "shuttering"], 45, ["bm_labour_rates", "bm_service_rates", "bm_material_rates"]);
  const labour = getMasterRate(["lintel labour", "rcc labour", "concrete labour"], 1000, ["bm_labour_rates", "bm_service_rates"]);
  const water = getMasterRate(["water"], 0.5, ["bm_service_rates", "bm_material_rates"]);

  const mix = (selectedGrade: string) => {
    if (selectedGrade === "M25") return { cementBags: 8.7, sandCft: 13.8, agg20Cft: 17.0, agg12Cft: 11.3, waterLtr: 165 };
    if (selectedGrade === "M30") return { cementBags: 9.3, sandCft: 12.7, agg20Cft: 16.2, agg12Cft: 10.8, waterLtr: 160 };
    return { cementBags: 8.0, sandCft: 14.83, agg20Cft: 17.8, agg12Cft: 11.87, waterLtr: 170 };
  };

  const calc = () => {
    const lenM = dimensionUnit === "Meter/MM" ? Number(length || 0) : Number(length || 0) * 0.3048;
    const widthM = dimensionUnit === "Meter/MM" ? Number(width || 0) / 1000 : Number(width || 0) * 0.0254;
    const depthM = dimensionUnit === "Meter/MM" ? Number(depth || 0) / 1000 : Number(depth || 0) * 0.0254;
    const nos = Math.max(Number(lintelNos || 0), 0);
    const concreteCum = lenM * widthM * depthM * nos;
    const concreteCft = concreteCum * 35.315;
    const concreteMix = mix(grade);
    const wastageFactor = 1 + Number(wastage || 0) / 100;

    const cementBags = concreteCum * concreteMix.cementBags * wastageFactor;
    const sandCft = concreteCum * concreteMix.sandCft * wastageFactor;
    const agg20Cft = concreteCum * concreteMix.agg20Cft * wastageFactor;
    const agg12Cft = concreteCum * concreteMix.agg12Cft * wastageFactor;
    const waterLtr = concreteCum * concreteMix.waterLtr;

    const bearingM = Number(bearingLengthMm || 0) / 1000;
    const mainLengthEachM = lenM + 2 * bearingM;
    const mainSteelKg = mainLengthEachM * Number(mainNos || 0) * nos * kgPerM(Number(mainDia || 0)) * wastageFactor;

    const clearW = Math.max(widthM - 2 * Number(cover || 0) / 1000, 0.01);
    const clearD = Math.max(depthM - 2 * Number(cover || 0) / 1000, 0.01);
    const stirrupLengthEachM = 2 * clearW + 2 * clearD + (2 * 10 * Number(stirrupDia || 0)) / 1000;
    const stirrupNosEach = Math.floor((lenM * 1000) / Math.max(Number(stirrupSpacing || 1), 1)) + 1;
    const stirrupSteelKg = stirrupLengthEachM * stirrupNosEach * nos * kgPerM(Number(stirrupDia || 0)) * wastageFactor;

    const totalSteelKg = mainSteelKg + stirrupSteelKg;
    const bindingKg = totalSteelKg * 0.01;
    const coverBlocks = Math.ceil(nos * Math.max(stirrupNosEach, 1) * 0.5);
    const shutteringAreaSft = ((2 * (lenM * depthM)) + (lenM * widthM)) * nos * 10.764;

    const cementCost = cementBags * cement.rate;
    const sandCost = sandCft * sand.rate;
    const aggCost = agg20Cft * agg20.rate + agg12Cft * agg12.rate;
    const steelCost = totalSteelKg * steel.rate;
    const bindingCost = bindingKg * binding.rate;
    const coverBlockCost = coverBlocks * coverBlock.rate;
    const shutteringCost = shutteringAreaSft * shuttering.rate;
    const waterCost = waterLtr * water.rate;
    const materialTotal = cementCost + sandCost + aggCost + steelCost + bindingCost + coverBlockCost + waterCost;
    const labourCost = concreteCum * labour.rate;
    const grandTotal = materialTotal + labourCost + shutteringCost;

    const rows: any[] = [
      ["No. of Lintels", nos, "Nos", ""],
      ["Lintel Concrete Volume", concreteCft, "CFT", ""],
      ["Shuttering Area (sides + bottom)", shutteringAreaSft, "SFT", shutteringCost],
      ["Cement", cementBags, "bags", cementCost],
      ["M Sand", sandCft, "CFT", sandCost],
      ["CA1 + CA2 Aggregate", agg20Cft + agg12Cft, "CFT", aggCost],
      [`Steel ${mainDia}mm Main Bars (${mainNos} nos/lintel)`, mainSteelKg, "kg", mainSteelKg * steel.rate],
      [`Steel ${stirrupDia}mm Stirrups @ ${stirrupSpacing}mm`, stirrupSteelKg, "kg", stirrupSteelKg * steel.rate],
      ["Total Steel", totalSteelKg, "kg", steelCost],
      ["Binding Wire", bindingKg, "kg", bindingCost],
      ["Cover Blocks / Spacers", coverBlocks, "Nos", coverBlockCost],
      ["Water", waterLtr, "Ltr", waterCost],
      ["Material Total", "", "", materialTotal],
      ["Labour RCC", concreteCum, "CUM", labourCost],
      ["GRAND TOTAL", "", "", grandTotal],
    ];

    setResult({ concreteCft, cementBags, totalSteelKg, shutteringAreaSft, grandTotal, rows });
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
    XLSX.utils.book_append_sheet(wb, ws, "Lintel");
    XLSX.writeFile(wb, "Lintel.xlsx");
  };

  const share = () => {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Lintel Estimate\nConcrete: ${fmt(result.concreteCft)} CFT\nCement: ${fmt(result.cementBags)} bags\nSteel: ${fmt(result.totalSteelKg)} kg\nShuttering: ${fmt(result.shutteringAreaSft)} SFT\nTotal: ₹${fmt(result.grandTotal)}`)}`, "_blank");
  };

  const styles: any = {
    page: { padding: 12, background: "#f5f0e8", minHeight: "100vh", fontFamily: "Arial" },
    header: { background: "#6d4c41", color: "white", padding: 12, borderRadius: 8, display: "flex", gap: 10, alignItems: "center" },
    card: { background: "white", padding: 12, borderRadius: 8, marginTop: 12 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 },
    input: { width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 },
    label: { fontSize: 11, fontWeight: 600 },
    btn: { background: "#800020", color: "white", padding: "8px 18px", border: 0, borderRadius: 6, margin: 5 },
    th: { background: "#6d4c41", color: "white", padding: 8 },
    td: { padding: 6, borderBottom: "1px solid #eee" }
  };

  const rateMsg = rateStatusMessage({ cement, sand, agg20, agg12, steel, shuttering, labour, water });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => router.push("/calculators")} style={{ background: "transparent", color: "white", border: 0, fontSize: 22 }}>←</button>
        <h2>🚪 Lintel Calculator</h2>
      </div>

      <div style={styles.card}>
        💰 Admin Rates: Cement ₹{cement.rate}/bag | Steel ₹{steel.rate}/kg | Shuttering ₹{shuttering.rate}/SFT | Labour ₹{labour.rate}/CUM
        {rateMsg && <div style={{ color: "#856404" }}>{rateMsg}</div>}
      </div>

      <div style={styles.card}>
        <h3>📐 Lintel Inputs</h3>
        <div style={styles.grid}>
          <div><label style={styles.label}>No. of Lintels</label><input style={styles.input} type="number" value={lintelNos} onChange={e => setLintelNos(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Length</label><input style={styles.input} type="number" value={length} onChange={e => setLength(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Width</label><input style={styles.input} type="number" value={width} onChange={e => setWidth(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Depth</label><input style={styles.input} type="number" value={depth} onChange={e => setDepth(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Unit</label><select style={styles.input} value={dimensionUnit} onChange={e => setDimensionUnit(e.target.value)}><option>Feet/Inch</option><option>Meter/MM</option></select></div>
          <div><label style={styles.label}>Grade</label><select style={styles.input} value={grade} onChange={e => setGrade(e.target.value)}><option>M20</option><option>M25</option><option>M30</option></select></div>
          <div><label style={styles.label}>Cover (mm)</label><input style={styles.input} type="number" value={cover} onChange={e => setCover(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Wastage (%)</label><input style={styles.input} type="number" value={wastage} onChange={e => setWastage(parseFloat(e.target.value) || 0)} /></div>
        </div>
      </div>

      <div style={styles.card}>
        <h3>🔄 Reinforcement</h3>
        <div style={styles.grid}>
          <div><label style={styles.label}>Main Bar Dia (mm)</label><input style={styles.input} type="number" value={mainDia} onChange={e => setMainDia(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Main Bar Nos</label><input style={styles.input} type="number" value={mainNos} onChange={e => setMainNos(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Stirrup Dia (mm)</label><input style={styles.input} type="number" value={stirrupDia} onChange={e => setStirrupDia(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Stirrup Spacing (mm)</label><input style={styles.input} type="number" value={stirrupSpacing} onChange={e => setStirrupSpacing(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Bearing Each Side (mm)</label><input style={styles.input} type="number" value={bearingLengthMm} onChange={e => setBearingLengthMm(parseFloat(e.target.value) || 0)} /></div>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <button style={styles.btn} onClick={calc}>🔨 Generate</button>
        {result && <button style={{ ...styles.btn, background: "#28a745" }} onClick={() => checkAndRun('calculator_export', 'lintel-calculator', exportExcel)}>📊 Excel</button>}
        {result && <button style={{ ...styles.btn, background: "#25D366" }} onClick={share}>💬 Share</button>}
      </div>

      {result && (
        <div style={styles.card}>
          <h3>Results</h3>
          <p>Concrete: {fmt(result.concreteCft)} CFT | Cement: {fmt(result.cementBags)} bags | Steel: {fmt(result.totalSteelKg)} kg | Total: ₹{fmt(result.grandTotal)}</p>
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
