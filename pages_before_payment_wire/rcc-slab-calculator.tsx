import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const fmt = (n: number) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const kgPerM = (dia: number) => (dia * dia) / 162;

const styles: any = {
  container: { maxWidth: "100%", margin: 0, padding: "12px", backgroundColor: "#f3f7fb", minHeight: "100vh", boxSizing: "border-box", fontFamily: "Arial" },
  header: { backgroundColor: "#1e3a8a", padding: "12px", borderRadius: "8px", marginBottom: "15px", color: "white", display: "flex", alignItems: "center", gap: "10px" },
  backButton: { backgroundColor: "transparent", border: "none", color: "white", fontSize: "22px", cursor: "pointer", padding: "5px" },
  headerTitle: { margin: 0, fontSize: "18px", flex: 1 },
  sectionTitle: { backgroundColor: "#dbeafe", color: "#1e3a8a", padding: "8px", borderRadius: "6px", marginBottom: "12px", fontSize: "14px", fontWeight: "bold", textAlign: "center", border: "1px solid #bfdbfe" },
  row6: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "12px" },
  label: { display: "block", marginBottom: "3px", fontWeight: 600, fontSize: "10px", color: "#555" },
  input: { width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box", backgroundColor: "#fff" },
  select: { width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "11px", backgroundColor: "#fff" },
  rateInfo: { backgroundColor: "#e8f4f8", padding: "8px", borderRadius: "6px", fontSize: "11px", textAlign: "center", marginBottom: "10px", color: "#333" },
  buttonRow: { display: "flex", justifyContent: "center", gap: "15px", margin: "20px 0", flexWrap: "wrap" },
  buttonGenerate: { backgroundColor: "#800020", color: "white", padding: "8px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" },
  buttonExport: { backgroundColor: "#28a745", color: "white", padding: "8px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  buttonWhatsapp: { backgroundColor: "#25D366", color: "white", padding: "8px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  cardContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px", marginBottom: "20px" },
  card: { padding: "10px", borderRadius: "10px", textAlign: "center", color: "white" },
  cardBlue: { backgroundColor: "#2563eb" },
  cardGreen: { backgroundColor: "#16a34a" },
  cardOrange: { backgroundColor: "#f97316" },
  cardTeal: { backgroundColor: "#0f766e" },
  cardValue: { fontSize: "14px", fontWeight: "bold", marginTop: "4px" },
  tableContainer: { overflowX: "auto", marginTop: "15px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "12px" },
  th: { backgroundColor: "#1e3a8a", color: "white", padding: "8px", textAlign: "left" },
  td: { padding: "6px", borderBottom: "1px solid #eee" },
  evenRow: { backgroundColor: "#f9f9f9" }
};

export default function RCCSlabPage() {
  const router = useRouter();

  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(40);
  const [thickness, setThickness] = useState(150);
  const [slabNos, setSlabNos] = useState(1);
  const [grade, setGrade] = useState("M20");

  const [reinforcementMat, setReinforcementMat] = useState("Single Mat");
  const [mainDia, setMainDia] = useState(8);
  const [mainSpacing, setMainSpacing] = useState(150);
  const [distDia, setDistDia] = useState(10);
  const [distSpacing, setDistSpacing] = useState(150);
  const [cover, setCover] = useState(25);
  const [lapFactor, setLapFactor] = useState(50);
  const [steelWastage, setSteelWastage] = useState(3);
  const [bindingWirePct, setBindingWirePct] = useState(1.5);
  const [provideCrank, setProvideCrank] = useState(true);
  const [crankBarsPct, setCrankBarsPct] = useState(50);

  const [chairDia, setChairDia] = useState(8);
  const [chairSpacing, setChairSpacing] = useState(1200);
  const [coverBlockSpacing, setCoverBlockSpacing] = useState(1000);

  const [hasBeam, setHasBeam] = useState(true);
  const [beamLength, setBeamLength] = useState(30);
  const [beamWidth, setBeamWidth] = useState(0.15);
  const [beamDepth, setBeamDepth] = useState(0.3);
  const [beamNos, setBeamNos] = useState(3);
  const [beamTopDia, setBeamTopDia] = useState(16);
  const [beamTopNos, setBeamTopNos] = useState(2);
  const [beamBottomDia, setBeamBottomDia] = useState(12);
  const [beamBottomNos, setBeamBottomNos] = useState(3);
  const [stirrupDia, setStirrupDia] = useState(8);
  const [stirrupSpacing, setStirrupSpacing] = useState(150);
  const [stirrupHook, setStirrupHook] = useState(135);

  const cementRate = getMasterRate(["cement", "opc", "ppc"], 400);
  const steelRate = getMasterRate(["steel", "tmt", "rebar"], 68);
  const sandRate = getMasterRate(["m sand", "sand"], 55);
  const agg20Rate = getMasterRate(["20mm aggregate", "20 mm aggregate", "aggregate"], 50);
  const agg12Rate = getMasterRate(["12mm aggregate", "12 mm aggregate"], 48);
  const bindingRate = getMasterRate(["binding wire"], 80);
  const coverBlockRate = getMasterRate(["cover block"], 5);
  const labourRccRate = getMasterRate(["rcc labour", "concrete labour", "labour concrete"], 1000, ["bm_labour_rates", "bm_service_rates"]);
  const waterRate = getMasterRate(["water"], 0.5, ["bm_service_rates", "bm_material_rates"]);

  const result = useMemo(() => {
    const Lm = length * 0.3048;
    const Wm = width * 0.3048;
    const clearLm = Math.max(Lm - (2 * cover / 1000), 0);
    const clearWm = Math.max(Wm - (2 * cover / 1000), 0);
    const slabVolumeCum = Lm * Wm * (thickness / 1000) * slabNos;

    const beamVolumeCum = hasBeam ? (beamLength * 0.3048) * beamWidth * beamDepth * beamNos : 0;
    const totalVolumeCum = slabVolumeCum + beamVolumeCum;
    const totalVolumeCft = totalVolumeCum * 35.315;

    const matMultiplier = reinforcementMat === "Double Mat" ? 2 : 1;

    const mainBarsNos = Math.floor((clearWm * 1000) / mainSpacing) + 1;
    const distBarsNos = Math.floor((clearLm * 1000) / distSpacing) + 1;

    const mainLapM = (lapFactor * mainDia) / 1000;
    const distLapM = (lapFactor * distDia) / 1000;
    const crankExtraM = provideCrank ? (0.42 * (thickness / 1000) * (crankBarsPct / 100)) : 0;

    const mainBaseSteelKg = mainBarsNos * clearLm * kgPerM(mainDia) * slabNos * matMultiplier;
    const mainLapSteelKg = mainBarsNos * mainLapM * kgPerM(mainDia) * slabNos * matMultiplier;
    const mainCrankSteelKg = mainBarsNos * crankExtraM * kgPerM(mainDia) * slabNos * matMultiplier;
    const mainSteelKg = mainBaseSteelKg + mainLapSteelKg + mainCrankSteelKg;

    const distBaseSteelKg = distBarsNos * clearWm * kgPerM(distDia) * slabNos * matMultiplier;
    const distLapSteelKg = distBarsNos * distLapM * kgPerM(distDia) * slabNos * matMultiplier;
    const distCrankSteelKg = distBarsNos * crankExtraM * kgPerM(distDia) * slabNos * matMultiplier;
    const distSteelKg = distBaseSteelKg + distLapSteelKg + distCrankSteelKg;

    const chairNos = Math.ceil((Lm * Wm * slabNos) / Math.pow(chairSpacing / 1000, 2));
    const chairHeightM = Math.max((thickness - (2 * cover)) / 1000, 0.05);
    const chairLengthEachM = chairHeightM + 0.6;
    const chairSteelKg = chairNos * chairLengthEachM * kgPerM(chairDia);

    let beamTopKg = 0, beamBottomKg = 0, stirrupKg = 0, stirrupNos = 0;
    if (hasBeam) {
      const bLm = beamLength * 0.3048;
      const beamLapTopM = (lapFactor * beamTopDia) / 1000;
      const beamLapBottomM = (lapFactor * beamBottomDia) / 1000;
      beamTopKg = (bLm + beamLapTopM) * beamTopNos * beamNos * kgPerM(beamTopDia);
      beamBottomKg = (bLm + beamLapBottomM) * beamBottomNos * beamNos * kgPerM(beamBottomDia);

      stirrupNos = (Math.floor((bLm * 1000) / stirrupSpacing) + 1) * beamNos;
      const hookLengthM = stirrupHook === 135 ? (10 * stirrupDia * 2) / 1000 : (8 * stirrupDia * 2) / 1000;
      const stirrupLengthEachM = 2 * Math.max(beamWidth - (2 * cover / 1000), 0.05) + 2 * Math.max(beamDepth - (2 * cover / 1000), 0.05) + hookLengthM;
      stirrupKg = stirrupNos * stirrupLengthEachM * kgPerM(stirrupDia);
    }

    const baseSteelKg = mainSteelKg + distSteelKg + chairSteelKg + beamTopKg + beamBottomKg + stirrupKg;
    const totalSteelKg = baseSteelKg * (1 + steelWastage / 100);
    const bindingWireKg = totalSteelKg * (bindingWirePct / 100);
    const coverBlocks = Math.ceil((Lm * Wm * slabNos) / Math.pow(coverBlockSpacing / 1000, 2));

    const cementBags = totalVolumeCum * 7.5;
    const sandCft = totalVolumeCum * 14.83;
    const agg20Cft = totalVolumeCum * 17.8;
    const agg12Cft = totalVolumeCum * 11.87;
    const waterLtr = totalVolumeCum * 170;

    const materialTotal =
      cementBags * cementRate.rate +
      sandCft * sandRate.rate +
      agg20Cft * agg20Rate.rate +
      agg12Cft * agg12Rate.rate +
      totalSteelKg * steelRate.rate +
      bindingWireKg * bindingRate.rate +
      coverBlocks * coverBlockRate.rate +
      waterLtr * waterRate.rate;

    const labourTotal = totalVolumeCum * labourRccRate.rate;
    const grandTotal = materialTotal + labourTotal;

    return {
      concrete: { slabVolumeCum, beamVolumeCum, totalVolumeCum, totalVolumeCft, cementBags, sandCft, agg20Cft, agg12Cft, waterLtr },
      steel: { mainBarsNos, distBarsNos, mainBaseSteelKg, mainLapSteelKg, mainCrankSteelKg, mainSteelKg, distBaseSteelKg, distLapSteelKg, distCrankSteelKg, distSteelKg, chairNos, chairSteelKg, beamTopKg, beamBottomKg, stirrupNos, stirrupKg, baseSteelKg, totalSteelKg, bindingWireKg, coverBlocks },
      costs: { materialTotal, labourTotal, grandTotal }
    };
  }, [length, width, thickness, slabNos, grade, reinforcementMat, mainDia, mainSpacing, distDia, distSpacing, cover, lapFactor, steelWastage, bindingWirePct, provideCrank, crankBarsPct, chairDia, chairSpacing, coverBlockSpacing, hasBeam, beamLength, beamWidth, beamDepth, beamNos, beamTopDia, beamTopNos, beamBottomDia, beamBottomNos, stirrupDia, stirrupSpacing, stirrupHook, cementRate.rate, steelRate.rate, sandRate.rate, agg20Rate.rate, agg12Rate.rate, bindingRate.rate, coverBlockRate.rate, labourRccRate.rate, waterRate.rate]);

  const addSteel = (map: any, dia: number, label: string, kg: number) => {
    if (!kg || kg <= 0) return;
    const key = `${dia}mm`;
    if (!map[key]) map[key] = { dia, total: 0, parts: [] };
    map[key].total += kg;
    map[key].parts.push({ label, kg });
  };

  const steelSummary: any = {};
  addSteel(steelSummary, mainDia, "Slab Main Base", result.steel.mainBaseSteelKg);
  addSteel(steelSummary, mainDia, "Slab Main Lap", result.steel.mainLapSteelKg);
  addSteel(steelSummary, mainDia, "Slab Main Crank", result.steel.mainCrankSteelKg);
  addSteel(steelSummary, distDia, "Slab Distribution Base", result.steel.distBaseSteelKg);
  addSteel(steelSummary, distDia, "Slab Distribution Lap", result.steel.distLapSteelKg);
  addSteel(steelSummary, distDia, "Slab Distribution Crank", result.steel.distCrankSteelKg);
  addSteel(steelSummary, chairDia, "Chair Bars", result.steel.chairSteelKg);
  addSteel(steelSummary, beamTopDia, "Beam Top Bars", result.steel.beamTopKg);
  addSteel(steelSummary, beamBottomDia, "Beam Bottom Bars", result.steel.beamBottomKg);
  addSteel(steelSummary, stirrupDia, "Beam Stirrups", result.steel.stirrupKg);

  const steelRows = Object.values(steelSummary).map((s: any) => {
    const detail = s.parts.map((p: any) => `${p.label}: ${fmt(p.kg)} kg`).join(" | ");
    return [`Steel ${s.dia}mm Total (${detail})`, s.total, "kg", s.total * steelRate.rate];
  });

  const rows: any[] = [
    ["Concrete Volume", result.concrete.totalVolumeCft, "CFT", "-"],
    ["Cement", result.concrete.cementBags, "bags", result.concrete.cementBags * cementRate.rate],
    ["M Sand", result.concrete.sandCft, "CFT", result.concrete.sandCft * sandRate.rate],
    ["20mm Aggregate", result.concrete.agg20Cft, "CFT", result.concrete.agg20Cft * agg20Rate.rate],
    ["12mm Aggregate", result.concrete.agg12Cft, "CFT", result.concrete.agg12Cft * agg12Rate.rate],
    ...steelRows,
    ["Binding Wire", result.steel.bindingWireKg, "kg", result.steel.bindingWireKg * bindingRate.rate],
    ["Cover Blocks", result.steel.coverBlocks, "Nos", result.steel.coverBlocks * coverBlockRate.rate],
    ["Water", result.concrete.waterLtr, "Ltr", result.concrete.waterLtr * waterRate.rate],
    ["Material Total", "", "", result.costs.materialTotal],
    ["Labour RCC", result.concrete.totalVolumeCum, "CUM", result.costs.labourTotal],
    ["GRAND TOTAL", "", "", result.costs.grandTotal]
  ];

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rows.map(([Item, Quantity, Unit, Cost]) => ({ Item, Quantity: typeof Quantity === "number" ? fmt(Quantity) : Quantity, Unit, Cost: typeof Cost === "number" ? "₹" + fmt(Cost) : Cost })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RCC_Slab_Beam");
    XLSX.writeFile(wb, `RCC_Slab_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`RCC Slab & Beam
Concrete: ${fmt(result.concrete.totalVolumeCft)} CFT
Steel: ${fmt(result.steel.totalSteelKg)} kg
Binding Wire: ${fmt(result.steel.bindingWireKg)} kg
Cover Blocks: ${fmt(result.steel.coverBlocks)} Nos
Total: ₹${fmt(result.costs.grandTotal)}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const rateMsg = rateStatusMessage({ cement: cementRate, steel: steelRate, sand: sandRate, aggregate20: agg20Rate, aggregate12: agg12Rate, bindingWire: bindingRate, coverBlock: coverBlockRate, labour: labourRccRate });

  const input = (label: string, value: any, setter: any, type = "number") =>
    React.createElement("div", null,
      React.createElement("label", { style: styles.label }, label),
      React.createElement("input", { type, value, onChange: (e: any) => setter(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value), style: styles.input })
    );

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("button", { onClick: () => router.push("/calculators"), style: styles.backButton }, "←"),
      React.createElement("h1", { style: styles.headerTitle }, "📏 RCC Slab & Beam Calculator")
    ),

    React.createElement("div", { style: styles.rateInfo },
      React.createElement("div", null, `💰 Admin Master Rates: Cement ₹${cementRate.rate}/bag | Steel ₹${steelRate.rate}/kg | Sand ₹${sandRate.rate}/CFT | 20mm Agg ₹${agg20Rate.rate}/CFT | Labour ₹${labourRccRate.rate}/CUM`),
      rateMsg && React.createElement("div", { style: { color: "#856404", marginTop: 4 } }, rateMsg)
    ),

    React.createElement("div", { style: styles.sectionTitle }, "📐 Slab Dimensions"),
    React.createElement("div", { style: styles.row6 },
      input("Length (ft)", length, setLength),
      input("Width (ft)", width, setWidth),
      input("Thick (mm)", thickness, setThickness),
      input("Nos", slabNos, setSlabNos),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Grade"), React.createElement("select", { value: grade, onChange: (e: any) => setGrade(e.target.value), style: styles.select }, ["M20", "M25", "M30"].map(g => React.createElement("option", { key: g }, g))))
    ),

    React.createElement("div", { style: styles.sectionTitle }, "🔄 Slab Reinforcement"),
    React.createElement("div", { style: styles.row6 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Reinforcement Mat"), React.createElement("select", { value: reinforcementMat, onChange: (e: any) => setReinforcementMat(e.target.value), style: styles.select }, React.createElement("option", null, "Single Mat"), React.createElement("option", null, "Double Mat"))),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Crank Bars"), React.createElement("select", { value: provideCrank ? "Yes" : "No", onChange: (e: any) => setProvideCrank(e.target.value === "Yes"), style: styles.select }, React.createElement("option", null, "Yes"), React.createElement("option", null, "No"))),
      input("Main Dia (mm)", mainDia, setMainDia),
      input("Main Sp (mm)", mainSpacing, setMainSpacing),
      input("Dist Dia (mm)", distDia, setDistDia),
      input("Dist Sp (mm)", distSpacing, setDistSpacing),
      input("Clear Cover (mm)", cover, setCover),
      input("Lap Length Factor", lapFactor, setLapFactor),
      input("Steel Wastage (%)", steelWastage, setSteelWastage),
      input("Binding Wire (%)", bindingWirePct, setBindingWirePct),
      input("Crank Bars (%)", crankBarsPct, setCrankBarsPct),
      input("Chair Dia (mm)", chairDia, setChairDia),
      input("Chair Spacing (mm)", chairSpacing, setChairSpacing),
      input("Cover Block Spacing (mm)", coverBlockSpacing, setCoverBlockSpacing)
    ),

    React.createElement("div", { style: styles.sectionTitle }, "📊 Beam Details"),
    React.createElement("div", { style: styles.buttonRow },
      React.createElement("button", { onClick: () => setHasBeam(true), style: styles.buttonGenerate }, "✅ Include Beam"),
      React.createElement("button", { onClick: () => setHasBeam(false), style: styles.buttonExport }, "❌ No Beam")
    ),
    hasBeam && React.createElement("div", { style: styles.row6 },
      input("Length (ft)", beamLength, setBeamLength),
      input("Width (m)", beamWidth, setBeamWidth),
      input("Depth (m)", beamDepth, setBeamDepth),
      input("Nos", beamNos, setBeamNos),
      input("Top Dia (mm)", beamTopDia, setBeamTopDia),
      input("Top Nos", beamTopNos, setBeamTopNos),
      input("Bottom Dia (mm)", beamBottomDia, setBeamBottomDia),
      input("Bottom Nos", beamBottomNos, setBeamBottomNos),
      input("Stirrup Dia (mm)", stirrupDia, setStirrupDia),
      input("Stirrup Sp (mm)", stirrupSpacing, setStirrupSpacing),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Stirrup Hook"), React.createElement("select", { value: stirrupHook, onChange: (e: any) => setStirrupHook(parseFloat(e.target.value)), style: styles.select }, React.createElement("option", { value: 135 }, "135°"), React.createElement("option", { value: 90 }, "90°")))
    ),

    React.createElement("div", { style: styles.buttonRow },
      React.createElement("button", { style: styles.buttonGenerate }, "🔨 Generate"),
      React.createElement("button", { onClick: exportExcel, style: styles.buttonExport }, "📊 Excel"),
      React.createElement("button", { onClick: shareWhatsApp, style: styles.buttonWhatsapp }, "💬 Share")
    ),

    React.createElement("div", { style: styles.cardContainer },
      React.createElement("div", { style: { ...styles.card, ...styles.cardBlue } }, "📦", React.createElement("div", null, "Concrete"), React.createElement("div", { style: styles.cardValue }, `${fmt(result.concrete.totalVolumeCft)} CFT`)),
      React.createElement("div", { style: { ...styles.card, ...styles.cardGreen } }, "🪣", React.createElement("div", null, "Cement"), React.createElement("div", { style: styles.cardValue }, `${fmt(result.concrete.cementBags)} bags`)),
      React.createElement("div", { style: { ...styles.card, ...styles.cardOrange } }, "⚙️", React.createElement("div", null, "Steel"), React.createElement("div", { style: styles.cardValue }, `${fmt(result.steel.totalSteelKg)} kg`)),
      React.createElement("div", { style: { ...styles.card, ...styles.cardTeal } }, "💰", React.createElement("div", null, "Total Cost"), React.createElement("div", { style: styles.cardValue }, `₹${fmt(result.costs.grandTotal)}`))
    ),

    React.createElement("div", { style: styles.tableContainer },
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null, React.createElement("tr", null, ["Item", "Quantity", "Unit", "Cost"].map(h => React.createElement("th", { key: h, style: styles.th }, h)))),
        React.createElement("tbody", null,
          rows.map((r, i) => React.createElement("tr", { key: i, style: i % 2 ? styles.evenRow : {} },
            React.createElement("td", { style: styles.td }, r[0]),
            React.createElement("td", { style: styles.td }, typeof r[1] === "number" ? fmt(r[1] as number) : r[1]),
            React.createElement("td", { style: styles.td }, r[2]),
            React.createElement("td", { style: styles.td }, typeof r[3] === "number" ? "₹" + fmt(r[3] as number) : r[3])
          ))
        )
      )
    )
  );
}
