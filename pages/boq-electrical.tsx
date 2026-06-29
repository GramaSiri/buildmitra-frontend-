import React, { useState } from "react";
import { useRouter } from "next/router";
import { useRates } from "../contexts/RateContext";
import * as XLSX from "xlsx";
import { usePaymentBarrier } from "../hooks/usePaymentBarrier";

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "100%", margin: 0, padding: "12px", backgroundColor: "#f5f0e8", minHeight: "100vh", boxSizing: "border-box" },
  header: { backgroundColor: "#f4b400", padding: "16px", borderRadius: "8px", marginBottom: "20px", color: "white" },
  headerTitle: { margin: 0, fontSize: "20px" },
  headerSub: { margin: "5px 0 0", opacity: 0.9, fontSize: "12px" },
  sectionTitle: { backgroundColor: "#e8f4f8", color: "#b8860b", padding: "8px", borderRadius: "6px", marginBottom: "12px", fontSize: "14px", fontWeight: "bold", textAlign: "center", border: "1px solid #cce5ed" },
  row4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "12px" },
  row3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "12px" },
  label: { display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "11px", color: "#555" },
  input: { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box", backgroundColor: "#fff" },
  readOnly: { backgroundColor: "#e8f4f8", fontWeight: "bold" },
  select: { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "13px", backgroundColor: "#fff" },
  buttonGenerate: { backgroundColor: "#800020", color: "white", padding: "12px 24px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", width: "100%", marginTop: "20px" },
  buttonExport: { backgroundColor: "#28a745", color: "white", padding: "8px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  buttonWhatsapp: { backgroundColor: "#25D366", color: "white", padding: "8px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  buttonContainer: { display: "flex", justifyContent: "center", gap: "15px", margin: "20px 0", flexWrap: "wrap" },
  cardContainer: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "12px", marginBottom: "20px" },
  card: { padding: "15px", borderRadius: "12px", textAlign: "center", color: "white" },
  cardValue: { fontSize: "20px", fontWeight: "bold", marginTop: "8px" },
  tableContainer: { overflowX: "auto", marginTop: "15px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "11px" },
  th: { backgroundColor: "#f4b400", color: "white", padding: "8px", textAlign: "left" },
  td: { padding: "6px", borderBottom: "1px solid #eee" },
  evenRow: { backgroundColor: "#f9f9f9" },
  totalRow: { backgroundColor: "#800020", color: "white", fontWeight: "bold" },
  infoBox: { backgroundColor: "#e8f4f8", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "12px", textAlign: "center" }
};

const formatNumber = (num: any) => {
  const n = Number(num || 0);
  if (isNaN(n)) return "0";
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ceil = (n: any) => Math.ceil(Number(n || 0));

export default function ElectricalBOQPage() {
  const { checkAndRun } = usePaymentBarrier();
  const router = useRouter();
  const { rates, loading } = useRates();

  const [projectName, setProjectName] = useState("Jai Sri ram");
  const [clientName, setClientName] = useState("Reddy");
  const [mobileNo, setMobileNo] = useState("7676942386");
  const [city, setCity] = useState("Bengaluru");

  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(3.5);

  const [bedrooms, setBedrooms] = useState(2);
  const [guestBedrooms, setGuestBedrooms] = useState(1);
  const [livingRooms, setLivingRooms] = useState(1);
  const [kitchens, setKitchens] = useState(1);
  const [toilets, setToilets] = useState(5);
  const [studyRooms, setStudyRooms] = useState(1);
  const [poojaRooms, setPoojaRooms] = useState(1);

  const [wiringType, setWiringType] = useState("Copper");
  const [acProvision, setAcProvision] = useState(4);
  const [waterHeaterProvision, setWaterHeaterProvision] = useState(2);
  const [exhaustFanProvision, setExhaustFanProvision] = useState(5);
  const [motorProvision, setMotorProvision] = useState(1);

  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  const plotArea = plotLength * plotWidth;
  const setbackArea = plotArea * 0.10;
  const footprintArea = plotArea - setbackArea;
  const totalBUA = footprintArea * floors;
  const floorCount = Math.max(1, ceil(floors));

  const totalBedrooms = bedrooms + guestBedrooms;

  const lightBedroom = totalBedrooms * 3;
  const lightLiving = livingRooms * 5;
  const lightKitchen = kitchens * 3;
  const lightToilet = toilets * 2;
  const lightStudy = studyRooms * 3;
  const lightPooja = poojaRooms * 1;
  const lightCommon = floorCount * 4;
  const lightingPoints = ceil(lightBedroom + lightLiving + lightKitchen + lightToilet + lightStudy + lightPooja + lightCommon);

  const fanPoints = ceil(totalBedrooms + livingRooms + studyRooms + poojaRooms);
  const powerPoints = ceil((totalBedrooms * 3) + (livingRooms * 4) + (kitchens * 6) + (studyRooms * 3) + (poojaRooms * 1));
  const acPoints = ceil(acProvision);
  const waterHeaterPoints = ceil(waterHeaterProvision);
  const exhaustFanPoints = ceil(exhaustFanProvision);
  const motorPoints = ceil(motorProvision);

  const totalPoints = ceil(lightingPoints + fanPoints + powerPoints + acPoints + waterHeaterPoints + exhaustFanPoints + motorPoints);

  const lightingWire = lightingPoints * 9;
  const fanWire = fanPoints * 10;
  const powerWire = powerPoints * 14;
  const acWire = acPoints * 22;
  const geyserWire = waterHeaterPoints * 18;
  const exhaustWire = exhaustFanPoints * 9;
  const motorWire = motorPoints * 25;

  const wire1_5mm = lightingWire + fanWire + exhaustWire;
  const wire2_5mm = powerWire;
  const wire4mm = acWire + geyserWire;
  const wire6mm = Math.max(totalBUA * 0.25, floorCount * 35 + motorWire);
  const totalWireLength = wire1_5mm + wire2_5mm + wire4mm + wire6mm;

  const conduit20 = (wire1_5mm + wire2_5mm) * 0.65;
  const conduit25 = (wire4mm + wire6mm) * 0.75;

  const getRate = (keys: string[], fallback: number) => {
    for (const k of keys) {
      if (rates?.[k] !== undefined && rates?.[k] !== null && Number(rates[k]) > 0) return Number(rates[k]);
    }
    return fallback;
  };

  const calculateBOQ = () => {
    const switchCount = ceil(totalPoints * 1.05);
    const switchPlateCount = ceil(totalPoints / 3);
    const lightFixtureCount = lightingPoints;
    const fanCount = fanPoints;

    const lightingCircuits = ceil(lightingPoints / 10);
    const powerCircuits = ceil(powerPoints / 8);
    const acCircuits = acPoints;
    const geyserCircuits = waterHeaterPoints;
    const motorCircuits = motorPoints;
    const totalCircuits = lightingCircuits + powerCircuits + acCircuits + geyserCircuits + motorCircuits;

    const db8Way = Math.max(1, ceil(totalCircuits / 8));
    const db12Way = totalCircuits > 8 ? Math.max(1, ceil(totalCircuits / 12)) : 0;

    const mcb6_10 = lightingCircuits + fanCount;
    const mcb16 = powerCircuits + acCircuits + geyserCircuits + motorCircuits;
    const mcbDp32 = Math.max(1, ceil(floorCount / 2));
    const mcbDp63 = 1;

    const earthingSets = totalBUA > 3000 ? 2 : 1;
    const lightningArrester = floors >= 3 ? 1 : 0;

    const items: any[] = [
      { sr: 1, code: "ELEC-01", desc: "PVC Conduit Pipe 20mm ISI marked", uom: "m", qty: conduit20, matRate: getRate(["ELECPC20-000001", "conduitPipe", "conduit20", "pvcConduit20"], 25), labRate: getRate(["SELEPC20-000001", "conduitPipeLabour", "conduit20Labour"], 8), amount: 0 },
      { sr: 2, code: "ELEC-02", desc: "PVC Conduit Pipe 25mm ISI marked", uom: "m", qty: conduit25, matRate: getRate(["ELECPC25-000001", "conduitPipe25", "conduit25", "pvcConduit25"], 35), labRate: getRate(["SELEPC25-000001", "conduitPipe25Labour", "conduit25Labour"], 10), amount: 0 },
      { sr: 3, code: "ELEC-03", desc: "1.5 sqmm Copper FRLS Wire Lighting/Fan", uom: "m", qty: wire1_5mm, matRate: getRate(["ELECW15-000001", "wire1_5", "wire15", "copperWire15"], 12), labRate: getRate(["SELEW15-000001", "wire15Labour"], 3), amount: 0 },
      { sr: 4, code: "ELEC-04", desc: "2.5 sqmm Copper FRLS Wire Power", uom: "m", qty: wire2_5mm, matRate: getRate(["ELECW25-000001", "wire2_5", "wire25", "copperWire25"], 18), labRate: getRate(["SELEW25-000001", "wire25Labour"], 4), amount: 0 },
      { sr: 5, code: "ELEC-05", desc: "4 sqmm Copper FRLS Wire AC/Geyser", uom: "m", qty: wire4mm, matRate: getRate(["ELECW40-000001", "wire4", "wire40", "copperWire4"], 28), labRate: getRate(["SELEW40-000001", "wire4Labour"], 5), amount: 0 },
      { sr: 6, code: "ELEC-06", desc: "6 sqmm Copper FRLS Wire Main", uom: "m", qty: wire6mm, matRate: getRate(["ELECW60-000001", "wire6", "wire60", "copperWire6"], 42), labRate: getRate(["SELEW60-000001", "wire6Labour"], 6), amount: 0 },
      { sr: 7, code: "ELEC-07", desc: "Modular Switches", uom: "nos", qty: switchCount, matRate: getRate(["ELECSW01-000001", "switch", "modularSwitch"], 85), labRate: getRate(["SELESW01-000001", "switchLabour"], 15), amount: 0 },
      { sr: 8, code: "ELEC-08", desc: "Modular Switch Plates", uom: "nos", qty: switchPlateCount, matRate: getRate(["ELECPL01-000001", "plate", "switchPlate"], 45), labRate: getRate(["SELEPL01-000001", "plateLabour"], 10), amount: 0 },
      { sr: 9, code: "ELEC-09", desc: "LED Light Point / Bulb", uom: "nos", qty: lightFixtureCount, matRate: getRate(["ELECLT01-000001", "ledBulb", "lightPoint"], 60), labRate: getRate(["SELELT01-000001", "lightLabour"], 10), amount: 0 },
      { sr: 10, code: "ELEC-10", desc: "LED Batten 20W", uom: "nos", qty: ceil(kitchens + studyRooms + poojaRooms), matRate: getRate(["ELECLB20-000001", "ledBatten"], 180), labRate: getRate(["SELELB20-000001", "ledBattenLabour"], 20), amount: 0 },
      { sr: 11, code: "ELEC-11", desc: "LED Panel Light 12x12", uom: "nos", qty: ceil(livingRooms), matRate: getRate(["ELECLP12-000001", "panelLight"], 350), labRate: getRate(["SELELP12-000001", "panelLightLabour"], 30), amount: 0 },
      { sr: 12, code: "ELEC-12", desc: "Ceiling Fan", uom: "nos", qty: fanCount, matRate: getRate(["ELECFAN1-000001", "fan"], 1800), labRate: getRate(["SELEFAN1-000001", "fanLabour"], 150), amount: 0 },
      { sr: 13, code: "ELEC-13", desc: "Exhaust Fan 6 inch", uom: "nos", qty: exhaustFanPoints, matRate: getRate(["ELECEXF1-000001", "exhaustFan"], 1200), labRate: getRate(["SELEEXF1-000001", "exhaustFanLabour"], 100), amount: 0 },
      { sr: 14, code: "ELEC-14", desc: "Water Heater 25L", uom: "nos", qty: waterHeaterPoints, matRate: getRate(["ELECWH25-000001", "waterHeater"], 4500), labRate: getRate(["SELEWH25-000001", "waterHeaterLabour"], 300), amount: 0 },
      { sr: 15, code: "ELEC-15", desc: "AC Unit 1.5 Ton", uom: "nos", qty: acPoints, matRate: getRate(["ELECAC15-000001", "acUnit"], 35000), labRate: getRate(["SELEAC15-000001", "acLabour"], 1500), amount: 0 },
      { sr: 16, code: "ELEC-16", desc: "Distribution Board 8 Way", uom: "nos", qty: db8Way, matRate: getRate(["ELECDB08-000001", "db", "db8"], 1200), labRate: getRate(["SELEDB08-000001", "dbLabour"], 200), amount: 0 },
      { sr: 17, code: "ELEC-17", desc: "Distribution Board 12 Way", uom: "nos", qty: db12Way, matRate: getRate(["ELECDB12-000001", "dbMain", "db12"], 2500), labRate: getRate(["SELEDB12-000001", "dbMainLabour"], 300), amount: 0 },
      { sr: 18, code: "ELEC-18", desc: "MCB SP 6A/10A", uom: "nos", qty: mcb6_10, matRate: getRate(["ELECMB10-000001", "mcb", "mcb10"], 180), labRate: getRate(["SELEMB10-000001", "mcbLabour"], 30), amount: 0 },
      { sr: 19, code: "ELEC-19", desc: "MCB SP 16A", uom: "nos", qty: mcb16, matRate: getRate(["ELECMB16-000001", "mcb16"], 220), labRate: getRate(["SELEMB16-000001", "mcb16Labour"], 30), amount: 0 },
      { sr: 20, code: "ELEC-20", desc: "MCB DP 32A", uom: "nos", qty: mcbDp32, matRate: getRate(["ELECMD32-000001", "mcbDp"], 350), labRate: getRate(["SELEMD32-000001", "mcbDpLabour"], 50), amount: 0 },
      { sr: 21, code: "ELEC-21", desc: "MCB DP 63A Main", uom: "nos", qty: mcbDp63, matRate: getRate(["ELECMD63-000001", "mcbMain"], 650), labRate: getRate(["SELEMD63-000001", "mcbMainLabour"], 75), amount: 0 },
      { sr: 22, code: "ELEC-22", desc: "Earthing Plate Type", uom: "set", qty: earthingSets, matRate: getRate(["ELECEAR1-000001", "earthing"], 2500), labRate: getRate(["SELEEAR1-000001", "earthingLabour"], 500), amount: 0 },
      { sr: 23, code: "ELEC-23", desc: "Lightning Arrester", uom: "set", qty: lightningArrester, matRate: getRate(["ELECLAR1-000001", "lightningArrester"], 3500), labRate: getRate(["SELELAR1-000001", "lightningArresterLabour"], 600), amount: 0 },
      { sr: 24, code: "ELEC-24", desc: "UPS/Inverter 3kVA", uom: "set", qty: 1, matRate: getRate(["ELECUPS3-000001", "inverter"], 12000), labRate: getRate(["SELEUPS3-000001", "inverterLabour"], 800), amount: 0 },
      { sr: 25, code: "ELEC-25", desc: "Battery 150Ah", uom: "nos", qty: 2, matRate: getRate(["ELECBAT1-000001", "battery"], 8000), labRate: getRate(["SELEBAT1-000001", "batteryLabour"], 400), amount: 0 },
      { sr: 26, code: "ELEC-26", desc: "Bus Bar / Wiring Accessories", uom: "lump", qty: 1, matRate: getRate(["ELECACC1-000001", "accessories"], 5000), labRate: getRate(["SELEACC1-000001", "accessoriesLabour"], 500), amount: 0 },
      { sr: 27, code: "ELEC-27", desc: "Electrical Testing & Commissioning", uom: "lump", qty: 1, matRate: getRate(["ELECTST1-000001", "testing"], 3000), labRate: getRate(["SELETST1-000001", "testingLabour"], 1000), amount: 0 }
    ];

    items.forEach(item => {
      item.qty = item.uom === "m" ? Number(item.qty || 0) : ceil(item.qty);
      item.amount = (item.qty * item.matRate) + (item.qty * item.labRate);
    });

    const materialTotal = items.reduce((sum, item) => sum + (item.qty * item.matRate), 0);
    const labourTotal = items.reduce((sum, item) => sum + (item.qty * item.labRate), 0);
    const grandTotal = materialTotal + labourTotal;
    const ratePerSft = totalBUA > 0 ? grandTotal / totalBUA : 0;

    return {
      items,
      materialTotal,
      labourTotal,
      grandTotal,
      ratePerSft,
      totalBUA,
      totalPoints,
      totalWireLength,
      lightingPoints,
      fanPoints,
      powerPoints,
      acPoints,
      waterHeaterPoints,
      exhaustFanPoints,
      floorCount
    };
  };

  const handleGenerate = () => {
    setResults(calculateBOQ());
    setGenerated(true);
  };

  const handleReset = () => {
    setProjectName("Jai Sri ram");
    setClientName("Reddy");
    setMobileNo("7676942386");
    setCity("Bengaluru");
    setPlotLength(30);
    setPlotWidth(40);
    setFloors(3.5);
    setBedrooms(2);
    setGuestBedrooms(1);
    setLivingRooms(1);
    setKitchens(1);
    setToilets(5);
    setStudyRooms(1);
    setPoojaRooms(1);
    setWiringType("Copper");
    setAcProvision(4);
    setWaterHeaterProvision(2);
    setExhaustFanProvision(5);
    setMotorProvision(1);
    setResults(null);
    setGenerated(false);
  };

  const handleBack = () => router.push("/boq");

  const handleExportExcel = () => {
    if (!results) return;

    const data = results.items.map((item: any) => ({
      "Sr. No.": item.sr,
      "Item Code": item.code,
      "Description": item.desc,
      "UOM": item.uom,
      "Quantity": formatNumber(item.qty),
      "Mat. Rate": formatNumber(item.matRate),
      "Lab. Rate": formatNumber(item.labRate),
      "Total (₹)": formatNumber(item.amount)
    }));

    data.push({
      "Sr. No.": "",
      "Item Code": "",
      "Description": "GRAND TOTAL",
      "UOM": "",
      "Quantity": "",
      "Mat. Rate": "",
      "Lab. Rate": "",
      "Total (₹)": formatNumber(results.grandTotal)
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Electrical_BOQ");
    XLSX.writeFile(wb, `Electrical_BOQ_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;

    const message =
      `⚡ ELECTRICAL BOQ\n\n` +
      `Project: ${projectName}\n` +
      `Client: ${clientName}\n` +
      `City: ${city}\n` +
      `Plot Area: ${formatNumber(plotArea)} sft\n` +
      `Auto Setback Area: ${formatNumber(setbackArea)} sft (10%)\n` +
      `Footprint Area: ${formatNumber(footprintArea)} sft\n` +
      `Total BUA: ${formatNumber(totalBUA)} sft\n` +
      `Total Points: ${results.totalPoints}\n` +
      `Wire Length: ${formatNumber(results.totalWireLength)} m\n` +
      `Total Cost: ₹${formatNumber(results.grandTotal)}\n` +
      `Rate/sft: ₹${formatNumber(results.ratePerSft)}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) {
    return React.createElement("div", { style: { padding: "20px", textAlign: "center" } }, "Loading rates...");
  }

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("h1", { style: styles.headerTitle }, "⚡ Electrical BOQ Calculator"),
      React.createElement("p", { style: styles.headerSub }, "Professional electrical estimation with room-wise point calculation")
    ),

    React.createElement("div", { style: styles.sectionTitle }, "📋 Basic Details"),
    React.createElement("div", { style: styles.row4 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Project Name"), React.createElement("input", { type: "text", value: projectName, onChange: (e: any) => setProjectName(e.target.value), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Client Name"), React.createElement("input", { type: "text", value: clientName, onChange: (e: any) => setClientName(e.target.value), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Mobile No."), React.createElement("input", { type: "text", value: mobileNo, onChange: (e: any) => setMobileNo(e.target.value), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "City"), React.createElement("input", { type: "text", value: city, onChange: (e: any) => setCity(e.target.value), style: styles.input }))
    ),

    React.createElement("div", { style: styles.sectionTitle }, "📐 Building Details"),
    React.createElement("div", { style: styles.row4 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Plot Length (ft)"), React.createElement("input", { type: "number", value: plotLength, onChange: (e: any) => setPlotLength(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Plot Width (ft)"), React.createElement("input", { type: "number", value: plotWidth, onChange: (e: any) => setPlotWidth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "No. of Floors"), React.createElement("input", { type: "number", value: floors, onChange: (e: any) => setFloors(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Wiring Type"), React.createElement("select", { value: wiringType, onChange: (e: any) => setWiringType(e.target.value), style: styles.select },
        React.createElement("option", { value: "Copper" }, "Copper Wiring"),
        React.createElement("option", { value: "Aluminium" }, "Aluminium Wiring")
      ))
    ),

    React.createElement("div", { style: styles.row4 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Plot Area"), React.createElement("input", { type: "text", value: formatNumber(plotArea), readOnly: true, style: { ...styles.input, ...styles.readOnly } })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Auto Setback 10% Area"), React.createElement("input", { type: "text", value: formatNumber(setbackArea), readOnly: true, style: { ...styles.input, ...styles.readOnly } })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Footprint Area"), React.createElement("input", { type: "text", value: formatNumber(footprintArea), readOnly: true, style: { ...styles.input, ...styles.readOnly } })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Total BUA"), React.createElement("input", { type: "text", value: formatNumber(totalBUA), readOnly: true, style: { ...styles.input, ...styles.readOnly } }))
    ),

    React.createElement("div", { style: styles.sectionTitle }, "🏠 Room Configuration"),
    React.createElement("div", { style: styles.row4 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Bedrooms"), React.createElement("input", { type: "number", value: bedrooms, onChange: (e: any) => setBedrooms(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Guest Bedrooms"), React.createElement("input", { type: "number", value: guestBedrooms, onChange: (e: any) => setGuestBedrooms(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Living Rooms"), React.createElement("input", { type: "number", value: livingRooms, onChange: (e: any) => setLivingRooms(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Kitchens"), React.createElement("input", { type: "number", value: kitchens, onChange: (e: any) => setKitchens(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Toilets"), React.createElement("input", { type: "number", value: toilets, onChange: (e: any) => setToilets(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Study Rooms"), React.createElement("input", { type: "number", value: studyRooms, onChange: (e: any) => setStudyRooms(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Pooja Rooms"), React.createElement("input", { type: "number", value: poojaRooms, onChange: (e: any) => setPoojaRooms(parseFloat(e.target.value) || 0), style: styles.input }))
    ),

    React.createElement("div", { style: styles.sectionTitle }, "⚡ Electrical Provisions"),
    React.createElement("div", { style: styles.row4 },
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "AC Units"), React.createElement("input", { type: "number", value: acProvision, onChange: (e: any) => setAcProvision(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Water Heaters"), React.createElement("input", { type: "number", value: waterHeaterProvision, onChange: (e: any) => setWaterHeaterProvision(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Exhaust Fans"), React.createElement("input", { type: "number", value: exhaustFanProvision, onChange: (e: any) => setExhaustFanProvision(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement("div", null, React.createElement("label", { style: styles.label }, "Water Motors"), React.createElement("input", { type: "number", value: motorProvision, onChange: (e: any) => setMotorProvision(parseFloat(e.target.value) || 0), style: styles.input }))
    ),

    React.createElement("div", { style: styles.infoBox },
      `💡 Lighting: ${lightingPoints} | 🌀 Fan: ${fanPoints} | 🔌 Power: ${powerPoints} | ❄️ AC: ${acPoints} | 🔥 Geyser: ${waterHeaterPoints} | 💨 Exhaust: ${exhaustFanPoints} | Total Points: ${totalPoints}`
    ),

    React.createElement("div", { style: styles.buttonContainer },
      React.createElement("button", { onClick: handleReset, style: styles.buttonExport }, "🔄 Reset"),
      React.createElement("button", { onClick: handleGenerate, style: styles.buttonGenerate }, "🔨 Generate Electrical BOQ")
    ),

    generated && results && React.createElement("div", null,
      React.createElement("div", { style: styles.cardContainer },
        React.createElement("div", { style: { ...styles.card, backgroundColor: "#800020" } }, React.createElement("div", null, "💰"), React.createElement("div", null, "Total Cost"), React.createElement("div", { style: styles.cardValue }, `₹${formatNumber(results.grandTotal / 100000)} L`)),
        React.createElement("div", { style: { ...styles.card, backgroundColor: "#2196F3" } }, React.createElement("div", null, "⚡"), React.createElement("div", null, "Total Points"), React.createElement("div", { style: styles.cardValue }, results.totalPoints)),
        React.createElement("div", { style: { ...styles.card, backgroundColor: "#4CAF50" } }, React.createElement("div", null, "🔌"), React.createElement("div", null, "Wire Length"), React.createElement("div", { style: styles.cardValue }, `${formatNumber(results.totalWireLength)} m`)),
        React.createElement("div", { style: { ...styles.card, backgroundColor: "#FF9800" } }, React.createElement("div", null, "📐"), React.createElement("div", null, "Rate/sft"), React.createElement("div", { style: styles.cardValue }, `₹${formatNumber(results.ratePerSft)}`)),
        React.createElement("div", { style: { ...styles.card, backgroundColor: "#9C27B0" } }, React.createElement("div", null, "👷"), React.createElement("div", null, "Labour"), React.createElement("div", { style: styles.cardValue }, `₹${formatNumber(results.labourTotal / 100000)} L`))
      ),

      React.createElement("div", { style: styles.buttonContainer },
        React.createElement("button", { onClick: () => checkAndRun("boq_export", "boq-electrical", handleExportExcel), style: styles.buttonExport }, "📊 Export Excel"),
        React.createElement("button", { onClick: () => checkAndRun("boq_export", "boq-electrical", handleWhatsApp), style: styles.buttonWhatsapp }, "💬 WhatsApp Share")
      ),

      React.createElement("div", { style: styles.tableContainer },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null, React.createElement("tr", null,
            React.createElement("th", { style: styles.th }, "Sr."),
            React.createElement("th", { style: styles.th }, "Code"),
            React.createElement("th", { style: styles.th }, "Description"),
            React.createElement("th", { style: styles.th }, "UOM"),
            React.createElement("th", { style: styles.th }, "Qty"),
            React.createElement("th", { style: styles.th }, "Mat. Rate"),
            React.createElement("th", { style: styles.th }, "Lab. Rate"),
            React.createElement("th", { style: styles.th }, "Total (₹)")
          )),
          React.createElement("tbody", null,
            results.items.map((item: any, idx: number) => React.createElement("tr", { key: idx, style: idx % 2 === 0 ? {} : styles.evenRow },
              React.createElement("td", { style: styles.td }, item.sr),
              React.createElement("td", { style: styles.td }, item.code),
              React.createElement("td", { style: styles.td }, item.desc),
              React.createElement("td", { style: styles.td }, item.uom),
              React.createElement("td", { style: styles.td }, formatNumber(item.qty)),
              React.createElement("td", { style: styles.td }, formatNumber(item.matRate)),
              React.createElement("td", { style: styles.td }, formatNumber(item.labRate)),
              React.createElement("td", { style: styles.td }, formatNumber(item.amount))
            )),
            React.createElement("tr", { style: styles.totalRow },
              React.createElement("td", { colSpan: 7, style: { padding: "10px" } }, "GRAND TOTAL"),
              React.createElement("td", { style: { padding: "10px" } }, `₹${formatNumber(results.grandTotal)}`)
            )
          )
        )
      )
    )
  );
}
