import React, { useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const fmt = (n: any) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const kgPerM = (dia: number) => (dia * dia) / 162;

export default function PileFoundationCalculator() {
  const router = useRouter();

  const [pileNos, setPileNos] = useState(1);
  const [diameter, setDiameter] = useState(1);
  const [length, setLength] = useState(15);
  const [unit, setUnit] = useState("Feet");
  const [grade, setGrade] = useState("M20");
  const [cover, setCover] = useState(50);
  const [wastage, setWastage] = useState(3);
  const [mainDia, setMainDia] = useState(16);
  const [mainNos, setMainNos] = useState(8);
  const [tieDia, setTieDia] = useState(8);
  const [tieSpacing, setTieSpacing] = useState(150);
  const [result, setResult] = useState<any>(null);

  const cement = getMasterRate(["cement", "opc", "ppc"], 0);
  const sand = getMasterRate(["m sand", "sand"], 0);
  const agg20 = getMasterRate(["20mm aggregate", "ca1"], 0);
  const agg12 = getMasterRate(["12mm aggregate", "ca2"], 0);
  const steel = getMasterRate(["steel", "tmt"], 0);
  const binding = getMasterRate(["binding wire"], 0);
  const coverBlock = getMasterRate(["cover block", "spacer"], 0);
  const boring = getMasterRate(["pile boring", "boring"], 0, ["bm_service_rates", "bm_material_rates"]);
  const labour = getMasterRate(["pile labour", "rcc labour", "concrete labour"], 0, ["bm_labour_rates", "bm_service_rates"]);

  const calc = () => {
    const diaM = unit === "Feet" ? diameter * 0.3048 : diameter;
    const lenM = unit === "Feet" ? length * 0.3048 : length;

    const concreteCum = Math.PI * Math.pow(diaM / 2, 2) * lenM * pileNos;
    const concreteCft = concreteCum * 35.315;

    const cementBags = concreteCum * 7.5 * (1 + wastage / 100);
    const sandCft = concreteCum * 14.83 * (1 + wastage / 100);
    const agg20Cft = concreteCum * 17.8 * (1 + wastage / 100);
    const agg12Cft = concreteCum * 11.87 * (1 + wastage / 100);

    const mainLengthM = lenM * mainNos * pileNos;
    const mainSteelKg = mainLengthM * kgPerM(mainDia) * (1 + wastage / 100);

    const clearDiaM = Math.max(diaM - 2 * cover / 1000, 0.05);
    const tieLengthEachM = Math.PI * clearDiaM + (2 * 10 * tieDia) / 1000;
    const tieNosEachPile = Math.floor((lenM * 1000) / tieSpacing) + 1;
    const tieSteelKg = tieLengthEachM * tieNosEachPile * pileNos * kgPerM(tieDia) * (1 + wastage / 100);

    const totalSteelKg = mainSteelKg + tieSteelKg;
    const bindingKg = totalSteelKg * 0.01;
    const coverBlocks = Math.ceil(pileNos * tieNosEachPile * 0.25);

    const boringM = lenM * pileNos;

    const materialTotal =
      cementBags * cement.rate +
      sandCft * sand.rate +
      agg20Cft * agg20.rate +
      agg12Cft * agg12.rate +
      totalSteelKg * steel.rate +
      bindingKg * binding.rate +
      coverBlocks * coverBlock.rate +
      boringM * boring.rate;

    const labourCost = concreteCum * labour.rate;
    const grandTotal = materialTotal + labourCost;

    const rows: any[] = [
      ["Concrete Volume", concreteCft, "CFT", ""],
      ["Cement", cementBags, "bags", cementBags * cement.rate],
      ["M Sand", sandCft, "CFT", sandCft * sand.rate],
      ["CA1 + CA2 Aggregate", agg20Cft + agg12Cft, "CFT", agg20Cft * agg20.rate + agg12Cft * agg12.rate],
      [`Steel ${mainDia}mm Main Bars (${mainNos} nos/pile)`, mainSteelKg, "kg", mainSteelKg * steel.rate],
      [`Steel ${tieDia}mm Circular Ties @ ${tieSpacing}mm`, tieSteelKg, "kg", tieSteelKg * steel.rate],
      ["Total Steel", totalSteelKg, "kg", totalSteelKg * steel.rate],
      ["Binding Wire", bindingKg, "kg", bindingKg * binding.rate],
      ["Cover Blocks / Spacers", coverBlocks, "Nos", coverBlocks * coverBlock.rate],
      ["Pile Boring", boringM, "RMT", boringM * boring.rate],
      ["Material Total", "", "", materialTotal],
      ["Labour", concreteCum, "CUM", labourCost],
      ["GRAND TOTAL", "", "", grandTotal],
    ];

    setResult({ concreteCft, cementBags, totalSteelKg, boringM, grandTotal, rows });
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
    XLSX.utils.book_append_sheet(wb, ws, "Pile Foundation");
    XLSX.writeFile(wb, "Pile_Foundation.xlsx");
  };

  const share = () => {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Pile Foundation Estimate\nConcrete: ${fmt(result.concreteCft)} CFT\nCement: ${fmt(result.cementBags)} bags\nSteel: ${fmt(result.totalSteelKg)} kg\nBoring: ${fmt(result.boringM)} RMT\nTotal: ₹${fmt(result.grandTotal)}`)}`, "_blank");
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

  const rateMsg = rateStatusMessage({ cement, sand, agg20, agg12, steel, boring, labour });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => router.push("/calculators")} style={{ background: "transparent", color: "white", border: 0, fontSize: 22 }}>←</button>
        <h2>🥧 Pile Foundation Calculator</h2>
      </div>

      <div style={styles.card}>
        💰 Admin Rates: Cement ₹{cement.rate}/bag | Steel ₹{steel.rate}/kg | Boring ₹{boring.rate}/RMT | Labour ₹{labour.rate}/CUM
        {rateMsg && <div style={{ color: "#856404" }}>{rateMsg}</div>}
      </div>

      <div style={styles.card}>
        <h3>📐 Pile Inputs</h3>
        <div style={styles.grid}>
          <div><label style={styles.label}>No. of Piles</label><input style={styles.input} type="number" value={pileNos} onChange={e => setPileNos(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Diameter</label><input style={styles.input} type="number" value={diameter} onChange={e => setDiameter(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Length</label><input style={styles.input} type="number" value={length} onChange={e => setLength(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Unit</label><select style={styles.input} value={unit} onChange={e => setUnit(e.target.value)}><option>Feet</option><option>Meter</option></select></div>
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
          <div><label style={styles.label}>Tie Dia (mm)</label><input style={styles.input} type="number" value={tieDia} onChange={e => setTieDia(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Tie Spacing (mm)</label><input style={styles.input} type="number" value={tieSpacing} onChange={e => setTieSpacing(parseFloat(e.target.value) || 0)} /></div>
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