import React, { useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const fmt = (n: number) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const kgPerM = (dia: number) => (dia * dia) / 162;

const styles: any = {
  container: { maxWidth: "100%", margin: 0, padding: "12px", backgroundColor: "#f5f0e8", minHeight: "100vh", boxSizing: "border-box" },
  header: { backgroundColor: "#4a6fa5", padding: "12px", borderRadius: "8px", marginBottom: "15px", color: "white", display: "flex", alignItems: "center", gap: "10px" },
  backButton: { backgroundColor: "transparent", border: "none", color: "white", fontSize: "22px", cursor: "pointer", padding: "5px" },
  headerTitle: { margin: 0, fontSize: "18px", flex: 1 },
  sectionTitle: { backgroundColor: "#e8f4f8", color: "#4a6fa5", padding: "8px", borderRadius: "6px", marginBottom: "12px", fontSize: "14px", fontWeight: "bold", textAlign: "center", border: "1px solid #cce5ed" },
  row6: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: "8px", marginBottom: "12px" },
  label: { display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "11px", color: "#555" },
  input: { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box", backgroundColor: "#fff" },
  select: { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "13px", backgroundColor: "#fff" },
  buttonRow: { display: "flex", justifyContent: "center", gap: "15px", margin: "20px 0", flexWrap: "wrap" },
  buttonGenerate: { backgroundColor: "#800020", color: "white", padding: "8px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" },
  buttonExport: { backgroundColor: "#28a745", color: "white", padding: "8px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  buttonWhatsapp: { backgroundColor: "#25D366", color: "white", padding: "8px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  cardContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px", marginBottom: "20px" },
  card: { padding: "8px", borderRadius: "10px", textAlign: "center", color: "white" },
  cardBlue: { backgroundColor: "#2196F3" },
  cardLightGreen: { backgroundColor: "#8BC34A" },
  cardLightOrange: { backgroundColor: "#FFB74D" },
  cardLightTeal: { backgroundColor: "#4DB6AC" },
  cardValue: { fontSize: "14px", fontWeight: "bold", marginTop: "4px" },
  tableContainer: { overflowX: "auto", marginTop: "15px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "12px" },
  th: { backgroundColor: "#4a6fa5", color: "white", padding: "8px", textAlign: "left" },
  td: { padding: "6px", borderBottom: "1px solid #eee" },
  evenRow: { backgroundColor: "#f9f9f9" },
  rateInfo: { backgroundColor: "#e8f4f8", padding: "6px", borderRadius: "4px", fontSize: "10px", textAlign: "center", marginBottom: "10px", color: "#555" }
};

export default function BeamCalculator() {
  
  const { checkAndRun } = usePaymentBarrier();
const router = useRouter();

  const [beamNos, setBeamNos] = useState(3);
  const [lengthFt, setLengthFt] = useState(40);
  const [width, setWidth] = useState(6);
  const [depth, setDepth] = useState(12);
  const [dimensionUnit, setDimensionUnit] = useState("inch");
  const [grade, setGrade] = useState("M20");

  const [bottomDia, setBottomDia] = useState(12);
  const [bottomNos, setBottomNos] = useState(3);
  const [topDia, setTopDia] = useState(16);
  const [topNos, setTopNos] = useState(2);

  const [stirrupDia, setStirrupDia] = useState(8);
  const [stirrupSpacing, setStirrupSpacing] = useState(150);
  const [cover, setCover] = useState(25);
  const [lapFactor, setLapFactor] = useState(50);
  const [hookType, setHookType] = useState(135);
  const [wastage, setWastage] = useState(3);
  const [bindingWirePct, setBindingWirePct] = useState(1);

  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  const cementRate = getMasterRate(["cement", "opc", "ppc"], 0);
  const sandRate = getMasterRate(["m sand", "sand"], 0);
  const agg20Rate = getMasterRate(["20mm aggregate", "20 mm aggregate", "ca1"], 0);
  const agg12Rate = getMasterRate(["12mm aggregate", "12 mm aggregate", "ca2"], 0);
  const steelRate = getMasterRate(["steel", "tmt", "rebar"], 0);
  const bindingWireRate = getMasterRate(["binding wire"], 0);
  const coverBlockRate = getMasterRate(["cover block"], 0);
  const waterRate = getMasterRate(["water"], 0, ["bm_service_rates", "bm_material_rates"]);
  const labourRate = getMasterRate(["beam labour", "rcc labour", "concrete labour"], 0, ["bm_labour_rates", "bm_service_rates"]);

  const rateMsg = rateStatusMessage({ cement: cementRate, sand: sandRate, ca1: agg20Rate, ca2: agg12Rate, steel: steelRate, bindingWire: bindingWireRate, coverBlock: coverBlockRate, water: waterRate, labour: labourRate });

  const toMeter = (value: number) => {
    if (dimensionUnit === "meter") return value;
    if (dimensionUnit === "mm") return value / 1000;
    return value * 0.0254;
  };

  const calculateResults = () => {
    const Lm = lengthFt * 0.3048;
    const Wm = toMeter(width);
    const Dm = toMeter(depth);

    const volumeCum = Lm * Wm * Dm * beamNos;
    const volumeCft = volumeCum * 35.315;

    const cementBags = volumeCum * 7.5;
    const sandCft = volumeCum * 14.83;
    const agg20Cft = volumeCum * 17.8;
    const agg12Cft = volumeCum * 11.87;
    const waterLtr = volumeCum * 170;

    const bottomLapM = (lapFactor * bottomDia) / 1000;
    const topLapM = (lapFactor * topDia) / 1000;

    const bottomLengthM = (Lm + bottomLapM) * bottomNos * beamNos;
    const topLengthM = (Lm + topLapM) * topNos * beamNos;

    const bottomSteelKg = bottomLengthM * kgPerM(bottomDia);
    const topSteelKg = topLengthM * kgPerM(topDia);

    const clearW = Math.max(Wm - 2 * cover / 1000, 0.01);
    const clearD = Math.max(Dm - 2 * cover / 1000, 0.01);
    const hookLengthM = hookType === 135 ? (2 * 10 * stirrupDia) / 1000 : (2 * 8 * stirrupDia) / 1000;
    const stirrupLengthEachM = 2 * clearW + 2 * clearD + hookLengthM;

    const stirrupNosEachBeam = Math.floor((Lm * 1000) / stirrupSpacing) + 1;
    const totalStirrupNos = stirrupNosEachBeam * beamNos;
    const stirrupSteelKg = totalStirrupNos * stirrupLengthEachM * kgPerM(stirrupDia);

    const baseSteelKg = bottomSteelKg + topSteelKg + stirrupSteelKg;
    const wastageFactor = 1 + (wastage / 100);
    const wastageSteelKg = baseSteelKg * (wastage / 100);
    const totalSteelKg = baseSteelKg * wastageFactor;
    const bindingWireKg = totalSteelKg * (bindingWirePct / 100);
    const coverBlocks = Math.ceil(Lm * beamNos * 4);

    const steelSummary: any = {};
    const addSteel = (dia: number, label: string, kg: number) => {
      const key = `${dia}mm`;
      if (!steelSummary[key]) steelSummary[key] = { dia, total: 0, parts: [] };
      steelSummary[key].total += kg;
      steelSummary[key].parts.push(`${label}: ${fmt(kg)} kg`);
    };

    addSteel(bottomDia, "Bottom bars with lap + wastage", bottomSteelKg * wastageFactor);
    addSteel(topDia, "Top bars with lap + wastage", topSteelKg * wastageFactor);
    addSteel(stirrupDia, `Stirrups ${totalStirrupNos} nos + wastage`, stirrupSteelKg * wastageFactor);

    const steelRows = Object.values(steelSummary).map((s: any) => ({
      item: `Steel ${s.dia} Total (${s.parts.join(" | ")})`,
      quantity: s.total,
      unit: "kg",
      cost: s.total * steelRate.rate
    }));

    const cementCost = cementBags * cementRate.rate;
    const sandCost = sandCft * sandRate.rate;
    const agg20Cost = agg20Cft * agg20Rate.rate;
    const agg12Cost = agg12Cft * agg12Rate.rate;
    const steelCost = totalSteelKg * steelRate.rate;
    const bindingWireCost = bindingWireKg * bindingWireRate.rate;
    const coverBlockCost = coverBlocks * coverBlockRate.rate;
    const waterCost = waterLtr * waterRate.rate;
    const labourCost = volumeCum * labourRate.rate;

    const materialTotal = cementCost + sandCost + agg20Cost + agg12Cost + steelCost + bindingWireCost + coverBlockCost + waterCost;
    const grandTotal = materialTotal + labourCost;

    const rows = [
      { item: "Concrete Volume", quantity: volumeCft, unit: "CFT", cost: "" },
      { item: "Cement", quantity: cementBags, unit: "bags", cost: cementCost },
      { item: "M Sand", quantity: sandCft, unit: "CFT", cost: sandCost },
      { item: "Coarse Aggregate CA1 + CA2", quantity: agg20Cft + agg12Cft, unit: "CFT", cost: agg20Cost + agg12Cost },
      ...steelRows,
      { item: "Total Steel", quantity: totalSteelKg, unit: "kg", cost: steelCost },
      { item: "Binding Wire", quantity: bindingWireKg, unit: "kg", cost: bindingWireCost },
      { item: "Cover Blocks", quantity: coverBlocks, unit: "Nos", cost: coverBlockCost },
      { item: "Water", quantity: waterLtr, unit: "Ltr", cost: waterCost },
      { item: "Material Total", quantity: "", unit: "", cost: materialTotal },
      { item: "Labour RCC", quantity: volumeCum, unit: "CUM", cost: labourCost },
      { item: "GRAND TOTAL", quantity: "", unit: "", cost: grandTotal }
    ];

    return {
      concrete: { volumeCft, volumeCum, cementBags },
      steel: { totalSteelKg },
      costs: { grandTotal },
      rows
    };
  };

  const handleGenerate = () => {
    setResults(calculateResults());
    setGenerated(true);
  };

  const handleExportExcel = () => {
    if (!results) return;
    const data = results.rows.map((r: any) => ({
      Item: r.item,
      Quantity: typeof r.quantity === "number" ? fmt(r.quantity) : r.quantity,
      Unit: r.unit,
      Cost: typeof r.cost === "number" ? `₹${fmt(r.cost)}` : "-"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Beam");
    XLSX.writeFile(wb, `Beam_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `📊 BEAM CALCULATION

Beams: ${beamNos} nos
Size: ${lengthFt}ft x ${width}${dimensionUnit} x ${depth}${dimensionUnit}
Concrete: ${fmt(results.concrete.volumeCft)} CFT
Cement: ${fmt(results.concrete.cementBags)} bags
Steel: ${fmt(results.steel.totalSteelKg)} kg
Total: ₹${fmt(results.costs.grandTotal)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const input = (label: string, value: any, setter: any) =>
    React.createElement("div", null,
      React.createElement("label", { style: styles.label }, label),
      React.createElement("input", { type: "number", value, onChange: (e: any) => setter(parseFloat(e.target.value) || 0), style: styles.input })
    );

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("button", { onClick: () => router.push("/calculators"), style: styles.backButton }, "←"),
      React.createElement("h1", { style: styles.headerTitle }, "📊 Beam Calculator")
    ),

    React.createElement("div", { style: styles.rateInfo },
      React.createElement("span", null, `💰 Admin Master Rates: Cement ₹${cementRate.rate}/bag | M Sand ₹${sandRate.rate}/CFT | CA1 ₹${agg20Rate.rate}/CFT | CA2 ₹${agg12Rate.rate}/CFT | Steel ₹${steelRate.rate}/kg`),
      React.createElement("div", null, React.createElement("small", null, `👷 Labour: ₹${labourRate.rate}/CUM`)),
      rateMsg && React.createElement("div", { style: { color: "#856404", marginTop: 4 } }, rateMsg)
    ),

    React.createElement("div", { style: styles.sectionTitle }, "📐 Beam Dimensions"),
    React.createElement("div", { style: styles.row6 },
      input("Nos", beamNos, setBeamNos),
      input("Length (ft)", lengthFt, setLengthFt),
      input("Width", width, setWidth),
      input("Depth", depth, setDepth),
      React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Width/Depth Unit"),
        React.createElement("select", { value: dimensionUnit, onChange: (e: any) => setDimensionUnit(e.target.value), style: styles.select },
          React.createElement("option", { value: "inch" }, "Inch"),
          React.createElement("option", { value: "meter" }, "Meter"),
          React.createElement("option", { value: "mm" }, "MM")
        )
      ),
      React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Grade"),
        React.createElement("select", { value: grade, onChange: (e: any) => setGrade(e.target.value), style: styles.select },
          React.createElement("option", null, "M20"),
          React.createElement("option", null, "M25"),
          React.createElement("option", null, "M30")
        )
      )
    ),

    React.createElement("div", { style: styles.sectionTitle }, "🔄 Reinforcement"),
    React.createElement("div", { style: styles.row6 },
      input("Bottom Dia (mm)", bottomDia, setBottomDia),
      input("Bottom Nos", bottomNos, setBottomNos),
      input("Top Dia (mm)", topDia, setTopDia),
      input("Top Nos", topNos, setTopNos),
      input("Lap Factor", lapFactor, setLapFactor),
      input("Wastage (%)", wastage, setWastage)
    ),

    React.createElement("div", { style: styles.sectionTitle }, "🔄 Stirrups"),
    React.createElement("div", { style: styles.row6 },
      input("Dia (mm)", stirrupDia, setStirrupDia),
      input("Spacing (mm)", stirrupSpacing, setStirrupSpacing),
      input("Cover (mm)", cover, setCover),
      input("Binding Wire (%)", bindingWirePct, setBindingWirePct),
      React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Hook Type"),
        React.createElement("select", { value: hookType, onChange: (e: any) => setHookType(parseFloat(e.target.value)), style: styles.select },
          React.createElement("option", { value: 135 }, "135°"),
          React.createElement("option", { value: 90 }, "90°")
        )
      )
    ),

    React.createElement("div", { style: styles.buttonRow },
      React.createElement("button", { onClick: handleGenerate, style: styles.buttonGenerate }, "🔨 Generate"),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement("button", { onClick: () => checkAndRun('calculator_export', 'beam-calculator', handleExportExcel), style: styles.buttonExport }, "📊 Excel"),
        React.createElement("button", { onClick: () => checkAndRun('calculator_export', 'beam-calculator', handleWhatsApp), style: styles.buttonWhatsapp }, "💬 Share")
      )
    ),

    generated && results && React.createElement("div", null,
      React.createElement("div", { style: styles.cardContainer },
        React.createElement("div", { style: { ...styles.card, ...styles.cardBlue } }, "📦", React.createElement("div", null, "Concrete"), React.createElement("div", { style: styles.cardValue }, `${fmt(results.concrete.volumeCft)} CFT`)),
        React.createElement("div", { style: { ...styles.card, ...styles.cardLightGreen } }, "🪣", React.createElement("div", null, "Cement"), React.createElement("div", { style: styles.cardValue }, `${fmt(results.concrete.cementBags)} bags`)),
        React.createElement("div", { style: { ...styles.card, ...styles.cardLightOrange } }, "⚙️", React.createElement("div", null, "Steel"), React.createElement("div", { style: styles.cardValue }, `${fmt(results.steel.totalSteelKg)} kg`)),
        React.createElement("div", { style: { ...styles.card, ...styles.cardLightTeal } }, "💰", React.createElement("div", null, "Total Cost"), React.createElement("div", { style: styles.cardValue }, `₹${fmt(results.costs.grandTotal)}`))
      ),

      React.createElement("div", { style: styles.tableContainer },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null, React.createElement("tr", null, ["Item", "Quantity", "Unit", "Cost"].map(h => React.createElement("th", { key: h, style: styles.th }, h)))),
          React.createElement("tbody", null,
            results.rows.map((r: any, i: number) => React.createElement("tr", { key: i, style: i % 2 ? styles.evenRow : {} },
              React.createElement("td", { style: styles.td }, r.item),
              React.createElement("td", { style: styles.td }, typeof r.quantity === "number" ? fmt(r.quantity) : r.quantity),
              React.createElement("td", { style: styles.td }, r.unit),
              React.createElement("td", { style: styles.td }, typeof r.cost === "number" ? `₹${fmt(r.cost)}` : "-")
            ))
          )
        )
      )
    )
  );
}


