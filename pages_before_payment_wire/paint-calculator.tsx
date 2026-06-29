import React, { useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const styles: any = {
  container: { maxWidth: "100%", margin: 0, padding: "12px", backgroundColor: "#f5f0e8", minHeight: "100vh", boxSizing: "border-box" },
  header: { backgroundColor: "#9b59b6", padding: "12px", borderRadius: "8px", marginBottom: "15px", color: "white", display: "flex", alignItems: "center", gap: "10px" },
  backButton: { backgroundColor: "transparent", border: "none", color: "white", fontSize: "22px", cursor: "pointer", padding: "5px" },
  headerTitle: { margin: 0, fontSize: "18px", flex: 1 },
  sectionTitle: { backgroundColor: "#e8f4f8", color: "#9b59b6", padding: "8px", borderRadius: "6px", marginBottom: "12px", fontSize: "14px", fontWeight: "bold", textAlign: "center", border: "1px solid #cce5ed" },
  row6: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "12px" },
  label: { display: "block", marginBottom: "3px", fontWeight: "600", fontSize: "10px", color: "#555" },
  input: { width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box", backgroundColor: "#fff" },
  select: { width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "11px", backgroundColor: "#fff" },
  buttonSmall: { backgroundColor: "#2196F3", color: "white", padding: "4px 12px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px", marginTop: "4px" },
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
  th: { backgroundColor: "#9b59b6", color: "white", padding: "8px", textAlign: "left" },
  td: { padding: "6px", borderBottom: "1px solid #eee" },
  evenRow: { backgroundColor: "#f9f9f9" },
  rateInfo: { backgroundColor: "#e8f4f8", padding: "6px", borderRadius: "4px", fontSize: "10px", textAlign: "center", marginBottom: "10px", color: "#555" }
};

const formatNumber = (num: number) => {
  if (!num || isNaN(num)) return "0.00";
  return Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const coverage: any = {
  putty: 10,
  primer: 120,
  emulsion: 120,
  royal: 100,
  exterior: 90,
  enamel: 85,
  ceiling: 130,
  texture: 25,
  design: 30,
  stencil: 35
};

export default function PaintPage() {
  const router = useRouter();

  const [calculationMode, setCalculationMode] = useState("Particular Wall / Room");
  const [finishType, setFinishType] = useState("Fresh Coat");
  const [paintType, setPaintType] = useState("Regular Emulsion");

  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(2);
  const [floorHeight, setFloorHeight] = useState(10);

  const [length, setLength] = useState(20);
  const [height, setHeight] = useState(10);
  const [wallNos, setWallNos] = useState(4);
  const [includeCeiling, setIncludeCeiling] = useState(true);
  const [primerCoats, setPrimerCoats] = useState(1);
  const [paintCoats, setPaintCoats] = useState(2);

  const [openings, setOpenings] = useState<any[]>([]);
  const [openingType, setOpeningType] = useState("Door");
  const [openingWidth, setOpeningWidth] = useState(3);
  const [openingHeight, setOpeningHeight] = useState(7);
  const [openingNos, setOpeningNos] = useState(1);
  const [hasShutter, setHasShutter] = useState(true);
  const [hasFrame, setHasFrame] = useState(true);

  const [specialPaints, setSpecialPaints] = useState<any[]>([]);
  const [specialType, setSpecialType] = useState("Texture");
  const [specialArea, setSpecialArea] = useState(100);

  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  const puttyRate = getMasterRate(["wall putty", "putty"], 0);
  const primerRate = getMasterRate(["primer"], 0);
  const emulsionRate = getMasterRate(["emulsion paint", "emulsion"], 0);
  const royalRate = getMasterRate(["royal paint", "premium paint", "royal"], 0);
  const exteriorRate = getMasterRate(["exterior paint", "weatherproof paint", "weather proof"], 0);
  const enamelRate = getMasterRate(["enamel paint", "enamel"], 0);
  const ceilingRate = getMasterRate(["ceiling paint", "ceiling"], 0);
  const textureRate = getMasterRate(["texture paint", "texture"], 0);
  const designRate = getMasterRate(["design paint", "stencil paint", "design"], 0);
  const labourRate = getMasterRate(["painting labour", "paint labour", "labour painting"], 0, ["bm_labour_rates", "bm_service_rates"]);

  const rateMsg = rateStatusMessage({
    putty: puttyRate,
    primer: primerRate,
    emulsion: emulsionRate,
    royal: royalRate,
    exterior: exteriorRate,
    enamel: enamelRate,
    ceiling: ceilingRate,
    texture: textureRate,
    design: designRate,
    labour: labourRate
  });

  const getPaintRate = (type: string) => {
    if (type === "Premium / Royal Paint") return royalRate.rate;
    if (type === "Exterior Weatherproof Paint") return exteriorRate.rate;
    if (type === "Enamel Paint") return enamelRate.rate;
    if (type === "Ceiling Paint") return ceilingRate.rate;
    if (type === "Texture Paint") return textureRate.rate;
    if (type === "Design / Stencil Paint") return designRate.rate;
    return emulsionRate.rate;
  };

  const getCoverage = (type: string) => {
    if (type === "Premium / Royal Paint") return coverage.royal;
    if (type === "Exterior Weatherproof Paint") return coverage.exterior;
    if (type === "Enamel Paint") return coverage.enamel;
    if (type === "Ceiling Paint") return coverage.ceiling;
    if (type === "Texture Paint") return coverage.texture;
    if (type === "Design / Stencil Paint") return coverage.design;
    return coverage.emulsion;
  };

  const addOpening = () => {
    if (openingWidth > 0 && openingHeight > 0 && openingNos > 0) {
      const area = openingWidth * openingHeight * openingNos;
      setOpenings([...openings, { type: openingType, width: openingWidth, height: openingHeight, nos: openingNos, area, hasShutter, hasFrame }]);
      setOpeningWidth(3);
      setOpeningHeight(7);
      setOpeningNos(1);
    }
  };

  const removeOpening = (index: number) => {
    const next = [...openings];
    next.splice(index, 1);
    setOpenings(next);
  };

  const addSpecialPaint = () => {
    if (specialArea > 0) {
      setSpecialPaints([...specialPaints, { type: specialType, area: specialArea }]);
      setSpecialArea(100);
      setSpecialType("Texture");
    }
  };

  const removeSpecialPaint = (index: number) => {
    const next = [...specialPaints];
    next.splice(index, 1);
    setSpecialPaints(next);
  };

  const calculateResults = () => {
    let wallArea = 0;
    let ceilingArea = 0;
    let bua = 0;

    if (calculationMode === "Full Building") {
      const floorArea = plotLength * plotWidth;
      bua = floorArea * floors;
      const totalPaintableArea = bua * 3.5; // Civil thumb rule: total BUA x 3.5 sqft
      wallArea = totalPaintableArea;
      ceilingArea = 0;
    } else {
      wallArea = length * height * wallNos;
      ceilingArea = includeCeiling ? length * height : 0;
    }

    let openingArea = 0;
    let shutterArea = 0;
    let frameRft = 0;

    openings.forEach((o) => {
      openingArea += o.area;
      if (o.hasShutter) shutterArea += o.area * 2;
      if (o.hasFrame) frameRft += 2 * (o.width + o.height) * o.nos;
    });

    const netWallArea = Math.max(wallArea - openingArea, 0);
    const plainArea = netWallArea + ceilingArea;

    const isRepaint = finishType === "Repaint";
    const isTouchup = finishType === "One Coat Touch-up";

    const puttyArea = isRepaint || isTouchup ? 0 : plainArea;
    const primerArea = isTouchup ? 0 : plainArea;
    const paintArea = plainArea;

    const internalArea = calculationMode === "Full Building" ? paintArea * 0.70 : paintArea;
    const externalArea = calculationMode === "Full Building" ? paintArea * 0.25 : 0;
    const enamelArea = calculationMode === "Full Building" ? paintArea * 0.05 : 0;

    const puttyKg = puttyArea / coverage.putty;
    const primerLtr = (primerArea / coverage.primer) * (isRepaint ? 0.5 : primerCoats);

    const effectivePaintCoats = isTouchup ? 1 : paintCoats;

    let internalEmulsionLtr = 0;
    let externalWeatherLtr = 0;
    let enamelPrimerLtr = 0;
    let enamelPaintLtr = 0;
    let regularPaintLtr = 0;

    if (calculationMode === "Full Building") {
      internalEmulsionLtr = (internalArea / coverage.emulsion) * effectivePaintCoats;
      externalWeatherLtr = (externalArea / coverage.exterior) * effectivePaintCoats;
      enamelPrimerLtr = enamelArea / coverage.primer;
      enamelPaintLtr = (enamelArea / coverage.enamel) * effectivePaintCoats;
      regularPaintLtr = internalEmulsionLtr + externalWeatherLtr;
    } else {
      regularPaintLtr = (paintArea / getCoverage(paintType)) * effectivePaintCoats;
    }

    const shutterPaintLtr = calculationMode === "Full Building" ? 0 : shutterArea / coverage.enamel;
    const framePaintLtr = calculationMode === "Full Building" ? 0 : frameRft / 100;

    const specialRows = specialPaints.map((p) => {
      const cov = p.type === "Texture" ? coverage.texture : p.type === "Royal" ? coverage.royal : p.type === "Design" ? coverage.design : coverage.stencil;
      const rate = p.type === "Texture" ? textureRate.rate : p.type === "Royal" ? royalRate.rate : designRate.rate;
      const ltr = p.area / cov;
      return { item: `${p.type} Paint`, quantity: ltr, unit: "L", cost: ltr * rate };
    });

    const puttyCost = puttyKg * puttyRate.rate;
    const primerCost = primerLtr * primerRate.rate;
    const internalEmulsionCost = internalEmulsionLtr * emulsionRate.rate;
    const externalWeatherCost = externalWeatherLtr * exteriorRate.rate;
    const enamelPrimerCost = enamelPrimerLtr * primerRate.rate;
    const enamelPaintCost = enamelPaintLtr * enamelRate.rate;
    const regularPaintCost = calculationMode === "Full Building"
      ? internalEmulsionCost + externalWeatherCost + enamelPrimerCost + enamelPaintCost
      : regularPaintLtr * getPaintRate(paintType);
    const enamelCost = calculationMode === "Full Building" ? 0 : (shutterPaintLtr + framePaintLtr) * enamelRate.rate;
    const specialCost = specialRows.reduce((sum, r) => sum + r.cost, 0);

    const materialTotal = puttyCost + primerCost + regularPaintCost + enamelCost + specialCost;
    const labourCost = paintArea * labourRate.rate;
    const grandTotal = materialTotal + labourCost;

    const rows = [
      { item: "BUA / Floor Area Reference", quantity: bua || length * height, unit: "sqft", cost: "" },
      { item: "Gross Wall Area", quantity: wallArea, unit: "sqft", cost: "" },
      { item: "Opening Deduction", quantity: openingArea, unit: "sqft", cost: "" },
      { item: "Ceiling Area", quantity: ceilingArea, unit: "sqft", cost: "" },
      { item: "Net Paint Area", quantity: paintArea, unit: "sqft", cost: "" },
      { item: "Wall Putty", quantity: puttyKg, unit: "kg", cost: puttyCost },
      { item: "Primer", quantity: primerLtr, unit: "L", cost: primerCost },
      ...(calculationMode === "Full Building" ? [
        { item: "Internal Emulsion Paint", quantity: internalEmulsionLtr, unit: "L", cost: internalEmulsionCost },
        { item: "External Weatherproof Paint", quantity: externalWeatherLtr, unit: "L", cost: externalWeatherCost },
        { item: "Enamel Primer", quantity: enamelPrimerLtr, unit: "L", cost: enamelPrimerCost },
        { item: "Enamel / Oil Paint", quantity: enamelPaintLtr, unit: "L", cost: enamelPaintCost }
      ] : [
        { item: paintType, quantity: regularPaintLtr, unit: "L", cost: regularPaintCost },
        { item: "Enamel for Shutters / Frames", quantity: shutterPaintLtr + framePaintLtr, unit: "L", cost: enamelCost }
      ]),
      ...specialRows,
      { item: "Material Total", quantity: "", unit: "", cost: materialTotal },
      { item: "Labour", quantity: paintArea, unit: "sqft", cost: labourCost },
      { item: "GRAND TOTAL", quantity: "", unit: "", cost: grandTotal }
    ];

    return {
      netArea: formatNumber(paintArea),
      puttyKg,
      primerLtr,
      totalCost: grandTotal,
      materials: rows.map((r) => ({
        item: r.item,
        quantity: typeof r.quantity === "number" ? formatNumber(r.quantity) : r.quantity,
        unit: r.unit,
        cost: typeof r.cost === "number" ? formatNumber(r.cost) : r.cost
      }))
    };
  };

  const handleGenerate = () => {
    setResults(calculateResults());
    setGenerated(true);
  };

  const handleBack = () => router.push("/calculators");

  const handleExportExcel = () => {
    if (!results) return;
    const data = results.materials.map((m: any) => ({ Item: m.item, Quantity: m.quantity, Unit: m.unit, Cost: m.cost ? `₹${m.cost}` : "-" }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paint");
    XLSX.writeFile(wb, `Paint_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const materialList = results.materials.map((m: any) => `${m.item}: ${m.quantity} ${m.unit}${m.cost ? ` - ₹${m.cost}` : ""}`).join("\n");
    const message = `🎨 PAINT CALCULATION\n\nMode: ${calculationMode}\nFinish: ${finishType}\nPaint: ${paintType}\n\n${materialList}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("button", { onClick: handleBack, style: styles.backButton }, "←"),
      React.createElement("h1", { style: styles.headerTitle }, "🎨 Paint Calculator")
    ),

    React.createElement("div", { style: styles.rateInfo },
      React.createElement("span", null, `💰 Admin Master Rates: Putty ₹${puttyRate.rate}/kg | Primer ₹${primerRate.rate}/L | Paint ₹${getPaintRate(paintType)}/L | Enamel ₹${enamelRate.rate}/L | Labour ₹${labourRate.rate}/sqft`),
      rateMsg && React.createElement("div", { style: { color: "#856404", marginTop: 4 } }, rateMsg)
    ),

    React.createElement("div", { style: styles.sectionTitle }, "📐 Surface Details"),
    React.createElement("div", { style: styles.row6 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Calculation Mode"), React.createElement("select", { value: calculationMode, onChange: (e: any) => setCalculationMode(e.target.value), style: styles.select },
        React.createElement("option", null, "Particular Wall / Room"),
        React.createElement("option", null, "Full Building")
      )),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Finish Type"), React.createElement("select", { value: finishType, onChange: (e: any) => setFinishType(e.target.value), style: styles.select },
        React.createElement("option", null, "Fresh Coat"),
        React.createElement("option", null, "Repaint"),
        React.createElement("option", null, "One Coat Touch-up")
      )),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Paint Type"), React.createElement("select", { value: paintType, onChange: (e: any) => setPaintType(e.target.value), style: styles.select },
        React.createElement("option", null, "Regular Emulsion"),
        React.createElement("option", null, "Premium / Royal Paint"),
        React.createElement("option", null, "Exterior Weatherproof Paint"),
        React.createElement("option", null, "Enamel Paint"),
        React.createElement("option", null, "Texture Paint"),
        React.createElement("option", null, "Design / Stencil Paint"),
        React.createElement("option", null, "Ceiling Paint")
      )),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Include Ceiling"), React.createElement("select", { value: String(includeCeiling), onChange: (e: any) => setIncludeCeiling(e.target.value === "true"), style: styles.select },
        React.createElement("option", { value: "true" }, "Yes"),
        React.createElement("option", { value: "false" }, "No")
      )),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Primer Coats"), React.createElement("select", { value: primerCoats, onChange: (e: any) => setPrimerCoats(parseFloat(e.target.value)), style: styles.select },
        React.createElement("option", { value: 1 }, "1 Coat"),
        React.createElement("option", { value: 2 }, "2 Coats")
      )),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Paint Coats"), React.createElement("select", { value: paintCoats, onChange: (e: any) => setPaintCoats(parseFloat(e.target.value)), style: styles.select },
        React.createElement("option", { value: 1 }, "1 Coat"),
        React.createElement("option", { value: 2 }, "2 Coats"),
        React.createElement("option", { value: 3 }, "3 Coats")
      ))
    ),

    calculationMode === "Full Building" && React.createElement("div", { style: styles.row6 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Plot Length (ft)"), React.createElement("input", { type: "number", value: plotLength, onChange: (e: any) => setPlotLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Plot Width (ft)"), React.createElement("input", { type: "number", value: plotWidth, onChange: (e: any) => setPlotWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "No. of Floors"), React.createElement("input", { type: "number", value: floors, onChange: (e: any) => setFloors(parseFloat(e.target.value)), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Floor Height (ft)"), React.createElement("input", { type: "number", value: floorHeight, onChange: (e: any) => setFloorHeight(parseFloat(e.target.value)), style: styles.input }))
    ),

    calculationMode !== "Full Building" && React.createElement("div", { style: styles.row6 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Length (ft)"), React.createElement("input", { type: "number", value: length, onChange: (e: any) => setLength(parseFloat(e.target.value)), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Height (ft)"), React.createElement("input", { type: "number", value: height, onChange: (e: any) => setHeight(parseFloat(e.target.value)), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "No. of Walls"), React.createElement("input", { type: "number", value: wallNos, onChange: (e: any) => setWallNos(parseFloat(e.target.value)), style: styles.input }))
    ),

    React.createElement("div", { style: styles.sectionTitle }, "🚪 Openings"),
    React.createElement("div", { style: styles.row6 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Type"), React.createElement("select", { value: openingType, onChange: (e: any) => setOpeningType(e.target.value), style: styles.select },
        React.createElement("option", null, "Door"),
        React.createElement("option", null, "Window"),
        React.createElement("option", null, "Ventilation")
      )),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Width (ft)"), React.createElement("input", { type: "number", value: openingWidth, onChange: (e: any) => setOpeningWidth(parseFloat(e.target.value)), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Height (ft)"), React.createElement("input", { type: "number", value: openingHeight, onChange: (e: any) => setOpeningHeight(parseFloat(e.target.value)), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Nos"), React.createElement("input", { type: "number", value: openingNos, onChange: (e: any) => setOpeningNos(parseFloat(e.target.value)), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Has Shutter"), React.createElement("select", { value: String(hasShutter), onChange: (e: any) => setHasShutter(e.target.value === "true"), style: styles.select }, React.createElement("option", { value: "true" }, "Yes"), React.createElement("option", { value: "false" }, "No"))),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Has Frame"), React.createElement("select", { value: String(hasFrame), onChange: (e: any) => setHasFrame(e.target.value === "true"), style: styles.select }, React.createElement("option", { value: "true" }, "Yes"), React.createElement("option", { value: "false" }, "No")))
    ),
    React.createElement("div", { style: styles.row6 }, React.createElement("div", null, React.createElement("button", { onClick: addOpening, style: styles.buttonSmall }, "+ Add Opening"))),

    openings.length > 0 && React.createElement("div", { style: styles.tableContainer },
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null, React.createElement("tr", null, ["Type", "Size", "Nos", "Area", "Shutter", "Frame", ""].map(h => React.createElement("th", { key: h, style: styles.th }, h)))),
        React.createElement("tbody", null,
          openings.map((o, idx) => React.createElement("tr", { key: idx, style: idx % 2 === 0 ? styles.evenRow : {} },
            React.createElement("td", { style: styles.td }, o.type),
            React.createElement("td", { style: styles.td }, `${o.width}' x ${o.height}'`),
            React.createElement("td", { style: styles.td }, o.nos),
            React.createElement("td", { style: styles.td }, formatNumber(o.area)),
            React.createElement("td", { style: styles.td }, o.hasShutter ? "Yes" : "No"),
            React.createElement("td", { style: styles.td }, o.hasFrame ? "Yes" : "No"),
            React.createElement("td", { style: styles.td }, React.createElement("button", { onClick: () => removeOpening(idx), style: { ...styles.buttonSmall, backgroundColor: "#dc3545" } }, "X"))
          ))
        )
      )
    ),

    React.createElement("div", { style: styles.sectionTitle }, "🎨 Special / Design Paints"),
    React.createElement("div", { style: styles.row6 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Type"), React.createElement("select", { value: specialType, onChange: (e: any) => setSpecialType(e.target.value), style: styles.select },
        React.createElement("option", null, "Texture"),
        React.createElement("option", null, "Royal"),
        React.createElement("option", null, "Design"),
        React.createElement("option", null, "Stencil")
      )),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Area (sqft)"), React.createElement("input", { type: "number", value: specialArea, onChange: (e: any) => setSpecialArea(parseFloat(e.target.value)), style: styles.input })),
      React.createElement("div", null, React.createElement("button", { onClick: addSpecialPaint, style: styles.buttonSmall }, "+ Add Special Paint"))
    ),

    specialPaints.length > 0 && React.createElement("div", { style: styles.tableContainer },
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null, React.createElement("tr", null, ["Type", "Area", ""].map(h => React.createElement("th", { key: h, style: styles.th }, h)))),
        React.createElement("tbody", null,
          specialPaints.map((p, idx) => React.createElement("tr", { key: idx, style: idx % 2 === 0 ? styles.evenRow : {} },
            React.createElement("td", { style: styles.td }, p.type),
            React.createElement("td", { style: styles.td }, formatNumber(p.area)),
            React.createElement("td", { style: styles.td }, React.createElement("button", { onClick: () => removeSpecialPaint(idx), style: { ...styles.buttonSmall, backgroundColor: "#dc3545" } }, "X"))
          ))
        )
      )
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
        React.createElement("div", { style: { ...styles.card, ...styles.cardBlue } }, React.createElement("div", null, "🎨"), React.createElement("div", null, "Paint Area"), React.createElement("div", { style: styles.cardValue }, `${results.netArea} sqft`)),
        React.createElement("div", { style: { ...styles.card, ...styles.cardLightGreen } }, React.createElement("div", null, "🪣"), React.createElement("div", null, "Putty"), React.createElement("div", { style: styles.cardValue }, `${formatNumber(results.puttyKg)} kg`)),
        React.createElement("div", { style: { ...styles.card, ...styles.cardLightOrange } }, React.createElement("div", null, "🎨"), React.createElement("div", null, "Primer"), React.createElement("div", { style: styles.cardValue }, `${formatNumber(results.primerLtr)} L`)),
        React.createElement("div", { style: { ...styles.card, ...styles.cardLightTeal } }, React.createElement("div", null, "💰"), React.createElement("div", null, "Total Cost"), React.createElement("div", { style: styles.cardValue }, `₹${formatNumber(results.totalCost)}`))
      ),

      React.createElement("div", { style: styles.tableContainer },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null, React.createElement("tr", null, ["Item", "Quantity", "Unit", "Cost (₹)"].map(h => React.createElement("th", { key: h, style: styles.th }, h)))),
          React.createElement("tbody", null,
            results.materials.map((item: any, idx: number) => React.createElement("tr", { key: idx, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement("td", { style: styles.td }, item.item),
              React.createElement("td", { style: styles.td }, item.quantity),
              React.createElement("td", { style: styles.td }, item.unit),
              React.createElement("td", { style: styles.td }, item.cost ? `₹${item.cost}` : "-")
            ))
          )
        )
      )
    )
  );
}
