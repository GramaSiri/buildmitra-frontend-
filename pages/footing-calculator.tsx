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

export default function FootingCalculator() {
  const { checkAndRun } = usePaymentBarrier();
  const router = useRouter();

  const [footingNos, setFootingNos] = useState(4);
  const [lengthFt, setLengthFt] = useState(5);
  const [widthFt, setWidthFt] = useState(5);
  const [depthFt, setDepthFt] = useState(1.5);
  const [excavationDepthFt, setExcavationDepthFt] = useState(4);
  const [workingSpaceFt, setWorkingSpaceFt] = useState(1);
  const [pccThicknessMm, setPccThicknessMm] = useState(100);
  const [pccProjectionIn, setPccProjectionIn] = useState(6);
  const [grade, setGrade] = useState("M20");

  const [mainDia, setMainDia] = useState(12);
  const [mainSpacing, setMainSpacing] = useState(150);
  const [distDia, setDistDia] = useState(12);
  const [distSpacing, setDistSpacing] = useState(150);
  const [cover, setCover] = useState(50);
  const [bendLengthMm, setBendLengthMm] = useState(300);
  const [wastage, setWastage] = useState(3);
  const [bindingWirePct, setBindingWirePct] = useState(1);

  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  const cementRate = getMasterRate(["cement", "opc", "ppc"], 400);
  const sandRate = getMasterRate(["m sand", "sand"], 55);
  const agg20Rate = getMasterRate(["20mm aggregate", "aggregate", "ca1"], 50);
  const agg12Rate = getMasterRate(["12mm aggregate", "12 mm aggregate", "ca2"], 48);
  const steelRate = getMasterRate(["steel", "tmt", "rebar"], 68);
  const bindingWireRate = getMasterRate(["binding wire"], 80);
  const waterRate = getMasterRate(["water"], 0.5, ["bm_service_rates", "bm_material_rates"]);
  const labourRate = getMasterRate(["footing labour", "rcc labour", "concrete labour"], 1000, ["bm_labour_rates", "bm_service_rates"]);
  const excavationRate = getMasterRate(["earth excavation", "excavation"], 80, ["bm_service_rates", "bm_labour_rates", "bm_material_rates"]);
  const pccLabourRate = getMasterRate(["pcc labour", "concrete labour"], 700, ["bm_labour_rates", "bm_service_rates"]);
  const shutteringRate = getMasterRate(["shuttering labour", "centering labour", "shuttering"], 45, ["bm_labour_rates", "bm_service_rates", "bm_material_rates"]);

  const rateMsg = rateStatusMessage({ cement: cementRate, sand: sandRate, aggregate: agg20Rate, steel: steelRate, labour: labourRate, excavation: excavationRate });

  const mix = (selectedGrade: string) => {
    if (selectedGrade === "M25") return { cementBags: 8.7, sandCft: 13.8, agg20Cft: 17.0, agg12Cft: 11.3, waterLtr: 165 };
    if (selectedGrade === "M30") return { cementBags: 9.3, sandCft: 12.7, agg20Cft: 16.2, agg12Cft: 10.8, waterLtr: 160 };
    return { cementBags: 8.0, sandCft: 14.83, agg20Cft: 17.8, agg12Cft: 11.87, waterLtr: 170 };
  };

  const calculateResults = () => {
    const nos = Math.max(Number(footingNos || 0), 0);
    const pccProjectionFt = Number(pccProjectionIn || 0) / 12;
    const pccThicknessFt = Number(pccThicknessMm || 0) / 304.8;

    const excavationLengthFt = Number(lengthFt || 0) + 2 * Number(workingSpaceFt || 0);
    const excavationWidthFt = Number(widthFt || 0) + 2 * Number(workingSpaceFt || 0);
    const excavationCft = excavationLengthFt * excavationWidthFt * Number(excavationDepthFt || 0) * nos;
    const excavationCum = excavationCft / 35.315;

    const pccLengthFt = Number(lengthFt || 0) + 2 * pccProjectionFt;
    const pccWidthFt = Number(widthFt || 0) + 2 * pccProjectionFt;
    const pccCft = pccLengthFt * pccWidthFt * pccThicknessFt * nos;
    const pccCum = pccCft / 35.315;

    const rccCft = Number(lengthFt || 0) * Number(widthFt || 0) * Number(depthFt || 0) * nos;
    const rccCum = rccCft / 35.315;
    const concreteMix = mix(grade);
    const wastageFactor = 1 + Number(wastage || 0) / 100;

    const cementBags = rccCum * concreteMix.cementBags * wastageFactor;
    const sandCft = rccCum * concreteMix.sandCft * wastageFactor;
    const agg20Cft = rccCum * concreteMix.agg20Cft * wastageFactor;
    const agg12Cft = rccCum * concreteMix.agg12Cft * wastageFactor;
    const waterLtr = rccCum * concreteMix.waterLtr;

    const pccDryCum = pccCum * 1.54 * wastageFactor;
    const pccCementBags = pccDryCum * (1 / 10) * 28.8;
    const pccSandCft = pccDryCum * (3 / 10) * 35.315;
    const pccAggCft = pccDryCum * (6 / 10) * 35.315;

    const clearLengthM = Math.max(Number(lengthFt || 0) * 0.3048 - 2 * Number(cover || 0) / 1000, 0.01);
    const clearWidthM = Math.max(Number(widthFt || 0) * 0.3048 - 2 * Number(cover || 0) / 1000, 0.01);
    const mainBarNosEach = Math.floor((clearWidthM * 1000) / Math.max(Number(mainSpacing || 1), 1)) + 1;
    const distBarNosEach = Math.floor((clearLengthM * 1000) / Math.max(Number(distSpacing || 1), 1)) + 1;
    const mainBarLengthM = clearLengthM + 2 * Number(bendLengthMm || 0) / 1000;
    const distBarLengthM = clearWidthM + 2 * Number(bendLengthMm || 0) / 1000;
    const mainSteelKg = mainBarNosEach * mainBarLengthM * nos * kgPerM(Number(mainDia || 0));
    const distSteelKg = distBarNosEach * distBarLengthM * nos * kgPerM(Number(distDia || 0));
    const totalSteelKg = (mainSteelKg + distSteelKg) * wastageFactor;
    const bindingWireKg = totalSteelKg * (Number(bindingWirePct || 0) / 100);

    const shutteringAreaSft = 2 * (Number(lengthFt || 0) + Number(widthFt || 0)) * Number(depthFt || 0) * nos;

    const excavationCost = excavationCum * excavationRate.rate;
    const pccMaterialCost = pccCementBags * cementRate.rate + pccSandCft * sandRate.rate + pccAggCft * agg20Rate.rate;
    const pccLabourCost = pccCum * pccLabourRate.rate;
    const cementCost = cementBags * cementRate.rate;
    const sandCost = sandCft * sandRate.rate;
    const agg20Cost = agg20Cft * agg20Rate.rate;
    const agg12Cost = agg12Cft * agg12Rate.rate;
    const steelCost = totalSteelKg * steelRate.rate;
    const bindingWireCost = bindingWireKg * bindingWireRate.rate;
    const waterCost = waterLtr * waterRate.rate;
    const shutteringCost = shutteringAreaSft * shutteringRate.rate;
    const labourCost = rccCum * labourRate.rate;
    const materialTotal = pccMaterialCost + cementCost + sandCost + agg20Cost + agg12Cost + steelCost + bindingWireCost + waterCost;
    const grandTotal = materialTotal + excavationCost + pccLabourCost + shutteringCost + labourCost;

    const rows = [
      { item: "Footing Nos", quantity: nos, unit: "Nos", cost: "" },
      { item: "Excavation Volume", quantity: excavationCum, unit: "CUM", cost: excavationCost },
      { item: "PCC Volume", quantity: pccCum, unit: "CUM", cost: pccMaterialCost + pccLabourCost },
      { item: "RCC Footing Concrete", quantity: rccCft, unit: "CFT", cost: "" },
      { item: "Shuttering Area", quantity: shutteringAreaSft, unit: "SFT", cost: shutteringCost },
      { item: "Cement", quantity: cementBags + pccCementBags, unit: "bags", cost: cementCost + pccCementBags * cementRate.rate },
      { item: "M Sand", quantity: sandCft + pccSandCft, unit: "CFT", cost: sandCost + pccSandCft * sandRate.rate },
      { item: "Aggregate", quantity: agg20Cft + agg12Cft + pccAggCft, unit: "CFT", cost: agg20Cost + agg12Cost + pccAggCft * agg20Rate.rate },
      { item: `Steel ${mainDia}mm Main Bars (${mainBarNosEach} nos/footing)`, quantity: mainSteelKg * wastageFactor, unit: "kg", cost: mainSteelKg * wastageFactor * steelRate.rate },
      { item: `Steel ${distDia}mm Distribution Bars (${distBarNosEach} nos/footing)`, quantity: distSteelKg * wastageFactor, unit: "kg", cost: distSteelKg * wastageFactor * steelRate.rate },
      { item: "Total Steel", quantity: totalSteelKg, unit: "kg", cost: steelCost },
      { item: "Binding Wire", quantity: bindingWireKg, unit: "kg", cost: bindingWireCost },
      { item: "Water", quantity: waterLtr, unit: "Ltr", cost: waterCost },
      { item: "Material Total", quantity: "", unit: "", cost: materialTotal },
      { item: "Labour RCC", quantity: rccCum, unit: "CUM", cost: labourCost },
      { item: "GRAND TOTAL", quantity: "", unit: "", cost: grandTotal }
    ];

    return {
      concrete: { volumeCft: rccCft, cementBags: cementBags + pccCementBags },
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
    XLSX.utils.book_append_sheet(wb, ws, "Footing");
    XLSX.writeFile(wb, `Footing_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `FOOTING CALCULATION\n\nRCC Concrete: ${fmt(results.concrete.volumeCft)} CFT\nCement: ${fmt(results.concrete.cementBags)} bags\nSteel: ${fmt(results.steel.totalSteelKg)} kg\nTotal: ₹${fmt(results.costs.grandTotal)}`;
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
      React.createElement("h1", { style: styles.headerTitle }, "🏗️ Footing Calculator")
    ),

    React.createElement("div", { style: styles.rateInfo },
      React.createElement("span", null, `💰 Admin Rates: Cement ₹${cementRate.rate}/bag | Steel ₹${steelRate.rate}/kg | Excavation ₹${excavationRate.rate}/CUM | Labour ₹${labourRate.rate}/CUM`),
      rateMsg && React.createElement("div", { style: { color: "#856404", marginTop: 4 } }, rateMsg)
    ),

    React.createElement("div", { style: styles.sectionTitle }, "📐 Footing Inputs"),
    React.createElement("div", { style: styles.row6 },
      input("Footing Nos", footingNos, setFootingNos),
      input("Length (ft)", lengthFt, setLengthFt),
      input("Width (ft)", widthFt, setWidthFt),
      input("Depth (ft)", depthFt, setDepthFt),
      input("Excavation Depth (ft)", excavationDepthFt, setExcavationDepthFt),
      input("Working Space (ft)", workingSpaceFt, setWorkingSpaceFt),
      input("PCC Thick. (mm)", pccThicknessMm, setPccThicknessMm),
      input("PCC Projection (in)", pccProjectionIn, setPccProjectionIn),
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
      input("Main Dia (mm)", mainDia, setMainDia),
      input("Main Spacing (mm)", mainSpacing, setMainSpacing),
      input("Dist Dia (mm)", distDia, setDistDia),
      input("Dist Spacing (mm)", distSpacing, setDistSpacing),
      input("Cover (mm)", cover, setCover),
      input("Bend Length (mm)", bendLengthMm, setBendLengthMm),
      input("Wastage (%)", wastage, setWastage),
      input("Binding Wire (%)", bindingWirePct, setBindingWirePct)
    ),

    React.createElement("div", { style: styles.buttonRow },
      React.createElement("button", { onClick: handleGenerate, style: styles.buttonGenerate }, "🔨 Generate"),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement("button", { onClick: () => checkAndRun('calculator_export', 'footing-calculator', handleExportExcel), style: styles.buttonExport }, "📊 Excel"),
        React.createElement("button", { onClick: () => checkAndRun('calculator_export', 'footing-calculator', handleWhatsApp), style: styles.buttonWhatsapp }, "💬 Share")
      )
    ),

    generated && results && React.createElement("div", null,
      React.createElement("div", { style: styles.cardContainer },
        React.createElement("div", { style: { ...styles.card, ...styles.cardBlue } }, "📦", React.createElement("div", null, "RCC Concrete"), React.createElement("div", { style: styles.cardValue }, `${fmt(results.concrete.volumeCft)} CFT`)),
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
