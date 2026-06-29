import React, { useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const fmt = (n: any) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function RoofTrussCalculator() {
  const router = useRouter();

  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(20);
  const [rise, setRise] = useState(5);
  const [spacing, setSpacing] = useState(8);
  const [roofType, setRoofType] = useState("Mangalore Tiles");
  const [paintCoats, setPaintCoats] = useState(2);
  const [result, setResult] = useState<any>(null);

  const steel = getMasterRate(["steel", "structural steel", "ms steel"], 0);
  const tile = getMasterRate(["mangalore tile", "mangalore tiles", "clay tile"], 0);
  const sheet = getMasterRate(["roof sheet", "gi sheet", "colour coated sheet"], 0);
  const bolt = getMasterRate(["bolt", "fastener"], 0);
  const anchorBolt = getMasterRate(["anchor bolt"], 0);
  const welding = getMasterRate(["welding"], 0, ["bm_service_rates", "bm_material_rates"]);
  const primer = getMasterRate(["red oxide", "steel primer", "primer"], 0);
  const paint = getMasterRate(["enamel paint", "steel paint", "metal paint"], 0);
  const labour = getMasterRate(["roof truss labour", "fabrication labour", "steel labour"], 0, ["bm_labour_rates", "bm_service_rates"]);

  const getAutoSection = () => {
    if (width <= 20) {
      return {
        category: "Light",
        rafter: { name: "Rafter / Top Chord", size: "ISA 65x65x6 Angle", kg: 5.8 },
        chord: { name: "Bottom Chord", size: "ISA 50x50x6 Angle", kg: 4.5 },
        bracing: { name: "Bracing / Web Member", size: "ISA 40x40x5 Angle", kg: 3.0 },
        purlin: { name: "Purlin", size: "ISA 50x50x6 Angle", kg: 4.5 },
        pillar: { name: "Pillar / Support", size: "ISMB 150", kg: 14.9 },
        gusset: { name: "Gusset Plate / Bracket", size: "8mm MS Plate", pct: 0.08 }
      };
    }
    if (width <= 35) {
      return {
        category: "Medium",
        rafter: { name: "Rafter / Top Chord", size: "ISA 75x75x6 Angle", kg: 6.8 },
        chord: { name: "Bottom Chord", size: "ISA 65x65x6 Angle", kg: 5.8 },
        bracing: { name: "Bracing / Web Member", size: "ISA 50x50x6 Angle", kg: 4.5 },
        purlin: { name: "Purlin", size: "ISA 65x65x6 Angle", kg: 5.8 },
        pillar: { name: "Pillar / Support", size: "ISMB 200", kg: 25.4 },
        gusset: { name: "Gusset Plate / Bracket", size: "10mm MS Plate", pct: 0.08 }
      };
    }
    return {
      category: "Heavy",
      rafter: { name: "Rafter / Top Chord", size: "ISA 90x90x8 Angle", kg: 10.8 },
      chord: { name: "Bottom Chord", size: "ISA 75x75x8 Angle", kg: 8.9 },
      bracing: { name: "Bracing / Web Member", size: "ISA 65x65x6 Angle", kg: 5.8 },
      purlin: { name: "Purlin", size: "ISA 75x75x6 Angle", kg: 6.8 },
      pillar: { name: "Pillar / Support", size: "ISMB 250", kg: 37.3 },
      gusset: { name: "Gusset Plate / Bracket", size: "12mm MS Plate", pct: 0.08 }
    };
  };

  const calc = () => {
    const sec = getAutoSection();

    const trussNos = Math.floor(length / spacing) + 1;
    const halfSpan = width / 2;
    const slopeFt = Math.sqrt(halfSpan * halfSpan + rise * rise);
    const slopeM = slopeFt * 0.3048;
    const widthM = width * 0.3048;
    const lengthM = length * 0.3048;

    const roofArea = 2 * slopeFt * length * 1.1;
    const roofRate = roofType === "Mangalore Tiles" ? tile.rate : sheet.rate;
    const roofCost = roofArea * roofRate;

    const rafterKg = trussNos * 2 * slopeM * sec.rafter.kg;
    const bottomChordKg = trussNos * widthM * sec.chord.kg;
    const bracingKg = trussNos * (widthM + slopeM) * 0.55 * sec.bracing.kg;

    const purlinRows = Math.ceil(slopeFt / 3) * 2;
    const purlinKg = purlinRows * lengthM * sec.purlin.kg;

    const pillarNos = trussNos * 2;
    const pillarHeightM = 10 * 0.3048;
    const pillarKg = pillarNos * pillarHeightM * sec.pillar.kg;

    const gussetKg = (rafterKg + bottomChordKg + bracingKg) * sec.gusset.pct;
    const totalSteel = rafterKg + bottomChordKg + bracingKg + purlinKg + pillarKg + gussetKg;

    const boltNos = Math.ceil(trussNos * 24);
    const anchorBoltNos = pillarNos * 2;
    const boltCost = boltNos * bolt.rate;
    const anchorBoltCost = anchorBoltNos * anchorBolt.rate;

    const weldingM = totalSteel * 0.015;
    const weldingCost = weldingM * welding.rate;

    const paintAreaSqft = totalSteel * 0.35;
    const primerCost = paintAreaSqft * primer.rate;
    const paintCost = paintAreaSqft * paintCoats * paint.rate;

    const steelCost = totalSteel * steel.rate;
    const labourCost = totalSteel * labour.rate;

    const materialTotal =
      roofCost +
      steelCost +
      boltCost +
      anchorBoltCost +
      weldingCost +
      primerCost +
      paintCost;

    const grandTotal = materialTotal + labourCost;

    const rows: any[] = [
      ["Auto Section Category", sec.category, "", ""],
      ["No. of Trusses", trussNos, "Nos", ""],
      ["Roof Area", roofArea, "sqft", ""],
      [`${roofType} Roofing Qty`, roofArea, "sqft", roofCost],
      [`${sec.rafter.name} - ${sec.rafter.size}`, rafterKg, "kg", rafterKg * steel.rate],
      [`${sec.chord.name} - ${sec.chord.size}`, bottomChordKg, "kg", bottomChordKg * steel.rate],
      [`${sec.bracing.name} - ${sec.bracing.size}`, bracingKg, "kg", bracingKg * steel.rate],
      [`${sec.purlin.name} - ${sec.purlin.size}`, purlinKg, "kg", purlinKg * steel.rate],
      [`${sec.pillar.name} - ${sec.pillar.size} (${pillarNos} Nos)`, pillarKg, "kg", pillarKg * steel.rate],
      [`${sec.gusset.name} - ${sec.gusset.size}`, gussetKg, "kg", gussetKg * steel.rate],
      ["Total Structural Steel", totalSteel, "kg", steelCost],
      ["Bolts & Fasteners - M16", boltNos, "Nos", boltCost],
      ["Anchor Bolts - M20", anchorBoltNos, "Nos", anchorBoltCost],
      ["Welding - 6mm Fillet", weldingM, "RMT", weldingCost],
      ["Red Oxide Primer - 1 Coat", paintAreaSqft, "sqft", primerCost],
      [`Enamel / Epoxy Paint - ${paintCoats} Coats`, paintAreaSqft * paintCoats, "sqft", paintCost],
      ["Material Total", "", "", materialTotal],
      ["Labour - Fabrication + Erection", totalSteel, "kg", labourCost],
      ["GRAND TOTAL", "", "", grandTotal],
    ];

    setResult({ roofArea, totalSteel, materialTotal, grandTotal, rows });
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
    XLSX.utils.book_append_sheet(wb, ws, "Roof Truss");
    XLSX.writeFile(wb, "Roof_Truss.xlsx");
  };

  const share = () => {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Roof Truss Estimate\nRoof Area: ${fmt(result.roofArea)} sqft\nSteel: ${fmt(result.totalSteel)} kg\nTotal: ₹${fmt(result.grandTotal)}`)}`, "_blank");
  };

  const styles: any = {
    page: { padding: 12, background: "#f5f0e8", minHeight: "100vh", fontFamily: "Arial" },
    header: { background: "#5d4037", color: "white", padding: 12, borderRadius: 8, display: "flex", gap: 10, alignItems: "center" },
    card: { background: "white", padding: 12, borderRadius: 8, marginTop: 12 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 },
    input: { width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 },
    label: { fontSize: 11, fontWeight: 600 },
    btn: { background: "#800020", color: "white", padding: "8px 18px", border: 0, borderRadius: 6, margin: 5 },
    th: { background: "#5d4037", color: "white", padding: 8 },
    td: { padding: 6, borderBottom: "1px solid #eee" }
  };

  const rateMsg = rateStatusMessage({ steel, tile, sheet, bolt, anchorBolt, welding, primer, paint, labour });
  const activeRoofRate = roofType === "Mangalore Tiles" ? tile.rate : sheet.rate;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => router.push("/calculators")} style={{ background: "transparent", color: "white", border: 0, fontSize: 22 }}>←</button>
        <h2>🏗️ Roof Truss Calculator</h2>
      </div>

      <div style={styles.card}>
        💰 Admin Rates: Steel ₹{steel.rate}/kg | Roof ₹{activeRoofRate}/sqft | Labour ₹{labour.rate}/kg
        {rateMsg && <div style={{ color: "#856404" }}>{rateMsg}</div>}
      </div>

      <div style={styles.card}>
        <h3>📐 Minimum Inputs</h3>
        <div style={styles.grid}>
          <div><label style={styles.label}>Building Length (ft)</label><input style={styles.input} type="number" value={length} onChange={e => setLength(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Building Width / Span (ft)</label><input style={styles.input} type="number" value={width} onChange={e => setWidth(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Roof Rise / Height (ft)</label><input style={styles.input} type="number" value={rise} onChange={e => setRise(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Truss Spacing (ft)</label><input style={styles.input} type="number" value={spacing} onChange={e => setSpacing(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={styles.label}>Roof Type</label><select style={styles.input} value={roofType} onChange={e => setRoofType(e.target.value)}><option>Mangalore Tiles</option><option>Roof Sheet</option></select></div>
          <div><label style={styles.label}>Paint Coats</label><input style={styles.input} type="number" value={paintCoats} onChange={e => setPaintCoats(parseFloat(e.target.value) || 0)} /></div>
        </div>
        <p style={{ fontSize: 12 }}>
          System auto-selects standard sections based on span: Light up to 20ft, Medium up to 35ft, Heavy above 35ft.
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <button style={styles.btn} onClick={calc}>🔨 Generate</button>
        {result && <button style={{ ...styles.btn, background: "#28a745" }} onClick={exportExcel}>📊 Excel</button>}
        {result && <button style={{ ...styles.btn, background: "#25D366" }} onClick={share}>💬 Share</button>}
      </div>

      {result && (
        <div style={styles.card}>
          <h3>Results</h3>
          <p>
            Roof Area: {fmt(result.roofArea)} sqft | Steel: {fmt(result.totalSteel)} kg |
            Material: ₹{fmt(result.materialTotal)} | Total: ₹{fmt(result.grandTotal)}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={styles.th}>Item / Standard Section</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Cost</th>
              </tr>
            </thead>
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