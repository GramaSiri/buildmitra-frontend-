import React, { useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
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

export default function StaircaseCalculator() {
  const router = useRouter();

  const [floors, setFloors] = useState(2);
  const [floorHeightFt, setFloorHeightFt] = useState(10);
  const [stairWidthFt, setStairWidthFt] = useState(4);
  const [riserIn, setRiserIn] = useState(6);
  const [treadIn, setTreadIn] = useState(10);
  const [waistThicknessMm, setWaistThicknessMm] = useState(150);
  const [landingL, setLandingL] = useState(4);
  const [landingB, setLandingB] = useState(4);
  const [landingPerFloor, setLandingPerFloor] = useState(2);
  const [grade, setGrade] = useState("M20");

  const [mainDia, setMainDia] = useState(12);
  const [mainSpacing, setMainSpacing] = useState(150);
  const [distDia, setDistDia] = useState(10);
  const [distSpacing, setDistSpacing] = useState(200);
  const [cover, setCover] = useState(20);
  const [bendLengthMm, setBendLengthMm] = useState(300);
  const [wastage, setWastage] = useState(3);
  const [bindingWirePct, setBindingWirePct] = useState(1);

  const [finishType, setFinishType] = useState("Granite");
  const [railingType, setRailingType] = useState("SS");
  const [railingSides, setRailingSides] = useState(1);

  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  const cementRate = getMasterRate(["cement", "opc", "ppc"], 0);
  const sandRate = getMasterRate(["m sand", "sand"], 0);
  const aggRate = getMasterRate(["20mm aggregate", "aggregate", "ca1"], 0);
  const steelRate = getMasterRate(["steel", "tmt", "rebar"], 0);
  const bindingWireRate = getMasterRate(["binding wire"], 0);
  const waterRate = getMasterRate(["water"], 0, ["bm_service_rates", "bm_material_rates"]);
  const labourRate = getMasterRate(["staircase labour", "rcc labour", "concrete labour"], 0, ["bm_labour_rates", "bm_service_rates"]);
  const graniteRate = getMasterRate(["granite"], 0);
  const marbleRate = getMasterRate(["marble"], 0);
  const tileRate = getMasterRate(["tile", "tiles"], 0);
  const kotaRate = getMasterRate(["kota", "kota stone"], 0);
  const ssRailingRate = getMasterRate(["ss railing", "stainless steel railing"], 0);
  const msRailingRate = getMasterRate(["ms railing", "mild steel railing"], 0);
  const glassRailingRate = getMasterRate(["glass railing"], 0);

  const rateMsg = rateStatusMessage({
    cement: cementRate, sand: sandRate, aggregate: aggRate, steel: steelRate,
    finish: finishType === "Granite" ? graniteRate : finishType === "Marble" ? marbleRate : finishType === "Kota Stone" ? kotaRate : tileRate,
    railing: railingType === "SS" ? ssRailingRate : railingType === "MS" ? msRailingRate : glassRailingRate,
    labour: labourRate
  });

  const getFinishRate = () => finishType === "Granite" ? graniteRate.rate : finishType === "Marble" ? marbleRate.rate : finishType === "Kota Stone" ? kotaRate.rate : tileRate.rate;
  const getRailingRate = () => railingType === "SS" ? ssRailingRate.rate : railingType === "MS" ? msRailingRate.rate : glassRailingRate.rate;

  const calculateResults = () => {
    const totalRiseFt = floors * floorHeightFt;
    const riserFt = riserIn / 12;
    const treadFt = treadIn / 12;

    const totalRisers = Math.ceil(totalRiseFt / riserFt);
    const stepsPerFloor = Math.ceil(floorHeightFt / riserFt);
    const flights = Math.ceil(stepsPerFloor / 12) * floors;
    const totalTreads = Math.max(totalRisers - floors, 0);

    const totalGoingFt = totalTreads * treadFt;
    const slopeLengthFt = Math.sqrt((totalRisers * riserFt) ** 2 + totalGoingFt ** 2);
    const stairSlopeAreaSqft = slopeLengthFt * stairWidthFt;

    const waistThicknessFt = waistThicknessMm / 304.8;
    const waistConcreteCft = stairSlopeAreaSqft * waistThicknessFt;

    const landingAreaSqft = landingL * landingB * landingPerFloor * floors;
    const landingConcreteCft = landingAreaSqft * waistThicknessFt;

    const stepTriangleConcreteCft = 0.5 * riserFt * treadFt * stairWidthFt * totalTreads;
    const totalConcreteCft = waistConcreteCft + landingConcreteCft + stepTriangleConcreteCft;
    const totalConcreteCum = totalConcreteCft / 35.315;

    const cementBags = totalConcreteCum * 7.5;
    const sandCft = totalConcreteCum * 14.83;
    const aggregateCft = totalConcreteCum * 29.67;
    const waterLtr = totalConcreteCum * 170;

    const clearWidthM = Math.max(stairWidthFt * 0.3048 - 2 * cover / 1000, 0.01);
    const mainBarLengthM = slopeLengthFt * 0.3048 + 2 * bendLengthMm / 1000;
    const mainBarsNos = Math.floor((clearWidthM * 1000) / mainSpacing) + 1;
    const mainSteelKg = mainBarsNos * mainBarLengthM * kgPerM(mainDia);

    const distBarLengthM = clearWidthM + 2 * bendLengthMm / 1000;
    const distBarsNos = Math.floor((slopeLengthFt * 0.3048 * 1000) / distSpacing) + 1;
    const distSteelKg = distBarsNos * distBarLengthM * kgPerM(distDia);

    const landingMainBarsNos = Math.floor(((landingB * 0.3048) * 1000) / mainSpacing) + 1;
    const landingDistBarsNos = Math.floor(((landingL * 0.3048) * 1000) / distSpacing) + 1;
    const landingSteelKg =
      ((landingMainBarsNos * (landingL * 0.3048 + 2 * bendLengthMm / 1000) * kgPerM(mainDia)) +
        (landingDistBarsNos * (landingB * 0.3048 + 2 * bendLengthMm / 1000) * kgPerM(distDia))) *
      landingPerFloor * floors;

    const baseSteelKg = mainSteelKg + distSteelKg + landingSteelKg;
    const totalSteelKg = baseSteelKg * (1 + wastage / 100);
    const bindingWireKg = totalSteelKg * (bindingWirePct / 100);

    const finishAreaSqft = (totalTreads * treadFt * stairWidthFt) + (totalRisers * riserFt * stairWidthFt) + landingAreaSqft;
    const railingLengthRft = slopeLengthFt * railingSides;
    const railingLengthRmt = railingLengthRft * 0.3048;

    const cementCost = cementBags * cementRate.rate;
    const sandCost = sandCft * sandRate.rate;
    const aggCost = aggregateCft * aggRate.rate;
    const steelCost = totalSteelKg * steelRate.rate;
    const bindingWireCost = bindingWireKg * bindingWireRate.rate;
    const waterCost = waterLtr * waterRate.rate;
    const finishCost = finishAreaSqft * getFinishRate();
    const railingCost = railingLengthRmt * getRailingRate();
    const labourCost = totalConcreteCum * labourRate.rate;

    const materialTotal = cementCost + sandCost + aggCost + steelCost + bindingWireCost + waterCost + finishCost + railingCost;
    const grandTotal = materialTotal + labourCost;

    const rows = [
      { item: "Building Height", quantity: totalRiseFt, unit: "ft", cost: "" },
      { item: "Total Risers / Steps", quantity: totalRisers, unit: "Nos", cost: "" },
      { item: "Required Flights", quantity: flights, unit: "Nos", cost: "" },
      { item: "Waist Slab Thickness", quantity: waistThicknessMm, unit: "mm", cost: "" },
      { item: "Concrete Volume", quantity: totalConcreteCft, unit: "CFT", cost: "" },
      { item: "Cement", quantity: cementBags, unit: "bags", cost: cementCost },
      { item: "M Sand", quantity: sandCft, unit: "CFT", cost: sandCost },
      { item: "Aggregate", quantity: aggregateCft, unit: "CFT", cost: aggCost },
      { item: `Steel ${mainDia}mm Main Bars + Landing`, quantity: (mainSteelKg + landingSteelKg * 0.6) * (1 + wastage / 100), unit: "kg", cost: (mainSteelKg + landingSteelKg * 0.6) * (1 + wastage / 100) * steelRate.rate },
      { item: `Steel ${distDia}mm Distribution Bars + Landing`, quantity: (distSteelKg + landingSteelKg * 0.4) * (1 + wastage / 100), unit: "kg", cost: (distSteelKg + landingSteelKg * 0.4) * (1 + wastage / 100) * steelRate.rate },
      { item: "Total Steel", quantity: totalSteelKg, unit: "kg", cost: steelCost },
      { item: "Binding Wire", quantity: bindingWireKg, unit: "kg", cost: bindingWireCost },
      { item: "Water", quantity: waterLtr, unit: "Ltr", cost: waterCost },
      { item: `${finishType} Finish`, quantity: finishAreaSqft, unit: "sqft", cost: finishCost },
      { item: `${railingType} Railing`, quantity: railingLengthRmt, unit: "RMT", cost: railingCost },
      { item: "Material Total", quantity: "", unit: "", cost: materialTotal },
      { item: "Labour", quantity: totalConcreteCum, unit: "CUM", cost: labourCost },
      { item: "GRAND TOTAL", quantity: "", unit: "", cost: grandTotal }
    ];

    return {
      concrete: { volumeCft: totalConcreteCft, cementBags },
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
    XLSX.utils.book_append_sheet(wb, ws, "Staircase");
    XLSX.writeFile(wb, `Staircase_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🪜 STAIRCASE CALCULATION

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
      React.createElement("h1", { style: styles.headerTitle }, "🪜 Staircase Calculator")
    ),

    React.createElement("div", { style: styles.rateInfo },
      React.createElement("span", null, `💰 Admin Rates: Cement ₹${cementRate.rate}/bag | Steel ₹${steelRate.rate}/kg | Finish ₹${getFinishRate()}/sqft | Railing ₹${getRailingRate()}/RMT`),
      React.createElement("div", null, React.createElement("small", null, `👷 Labour: ₹${labourRate.rate}/CUM`)),
      rateMsg && React.createElement("div", { style: { color: "#856404", marginTop: 4 } }, rateMsg)
    ),

    React.createElement("div", { style: styles.sectionTitle }, "📐 Staircase Inputs"),
    React.createElement("div", { style: styles.row6 },
      input("No. of Floors", floors, setFloors),
      input("Floor Height (ft)", floorHeightFt, setFloorHeightFt),
      input("Stair Width (ft)", stairWidthFt, setStairWidthFt),
      input("Riser (in)", riserIn, setRiserIn),
      input("Tread (in)", treadIn, setTreadIn),
      input("Waist Slab Thick. (mm)", waistThicknessMm, setWaistThicknessMm),
      input("Landing L (ft)", landingL, setLandingL),
      input("Landing B (ft)", landingB, setLandingB),
      input("Landings / Floor", landingPerFloor, setLandingPerFloor)
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

    React.createElement("div", { style: styles.sectionTitle }, "🎨 Finish & Railing"),
    React.createElement("div", { style: styles.row6 },
      React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Finish Type"),
        React.createElement("select", { value: finishType, onChange: (e: any) => setFinishType(e.target.value), style: styles.select },
          React.createElement("option", null, "Granite"),
          React.createElement("option", null, "Marble"),
          React.createElement("option", null, "Tile"),
          React.createElement("option", null, "Kota Stone")
        )
      ),
      React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Railing Type"),
        React.createElement("select", { value: railingType, onChange: (e: any) => setRailingType(e.target.value), style: styles.select },
          React.createElement("option", null, "SS"),
          React.createElement("option", null, "MS"),
          React.createElement("option", null, "Glass")
        )
      ),
      input("Railing Sides", railingSides, setRailingSides)
    ),

    React.createElement("div", { style: styles.buttonRow },
      React.createElement("button", { onClick: handleGenerate, style: styles.buttonGenerate }, "🔨 Generate"),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement("button", { onClick: handleExportExcel, style: styles.buttonExport }, "📊 Excel"),
        React.createElement("button", { onClick: handleWhatsApp, style: styles.buttonWhatsapp }, "💬 Share")
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