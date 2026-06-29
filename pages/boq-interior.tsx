import React, { useState } from "react";
import { useRouter } from "next/router";
import { useRates } from "../contexts/RateContext";
import * as XLSX from "xlsx";
import { usePaymentBarrier } from "../hooks/usePaymentBarrier";

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "100%", margin: 0, padding: "12px", backgroundColor: "#f5f0e8", minHeight: "100vh", boxSizing: "border-box" },
  header: { backgroundColor: "#8d6e63", padding: "16px", borderRadius: "8px", marginBottom: "20px", color: "white", display: "flex", alignItems: "center", gap: "15px" },
  backButton: { backgroundColor: "transparent", border: "none", color: "white", fontSize: "22px", cursor: "pointer", padding: "5px 10px", borderRadius: "6px" },
  headerTitle: { margin: 0, fontSize: "20px", flex: 1 },
  headerSub: { margin: "5px 0 0", opacity: 0.9, fontSize: "12px" },
  sectionTitle: { backgroundColor: "#e8f4f8", color: "#8d6e63", padding: "8px", borderRadius: "6px", marginBottom: "12px", fontSize: "14px", fontWeight: "bold", textAlign: "center", border: "1px solid #cce5ed" },
  row4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "12px" },
  row5: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "8px", marginBottom: "12px" },
  label: { display: "block", marginBottom: "3px", fontWeight: 600, fontSize: "10px", color: "#555" },
  input: { width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box", backgroundColor: "#fff" },
  select: { width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "11px", backgroundColor: "#fff" },
  buttonSmall: { backgroundColor: "#2196F3", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" },
  buttonGenerate: { backgroundColor: "#800020", color: "white", padding: "12px 24px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  buttonExport: { backgroundColor: "#28a745", color: "white", padding: "8px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  buttonWhatsapp: { backgroundColor: "#25D366", color: "white", padding: "8px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  buttonContainer: { display: "flex", justifyContent: "center", gap: "15px", margin: "20px 0", flexWrap: "wrap" },
  cardContainer: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "12px", marginBottom: "20px" },
  card: { padding: "15px", borderRadius: "12px", textAlign: "center", color: "white" },
  cardValue: { fontSize: "20px", fontWeight: "bold", marginTop: "8px" },
  tableContainer: { overflowX: "auto", marginTop: "15px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "11px" },
  th: { backgroundColor: "#8d6e63", color: "white", padding: "8px", textAlign: "left" },
  td: { padding: "6px", borderBottom: "1px solid #eee" },
  evenRow: { backgroundColor: "#f9f9f9" },
  totalRow: { backgroundColor: "#800020", color: "white", fontWeight: "bold" },
  infoBox: { backgroundColor: "#fff8e1", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "12px", textAlign: "center", border: "1px solid #ffe082" }
};

const itemTypes: any = {
  "Wardrobe (Sliding)": { kind: "sliding", defaultHeight: 7, depth: 1.5, rate: 1800, labour: 220 },
  "Wardrobe (Hinged)": { kind: "hinged", defaultHeight: 7, depth: 1.5, rate: 1500, labour: 200 },
  "Modular Kitchen": { kind: "kitchen", defaultHeight: 3, depth: 1.5, rate: 2500, labour: 300 },
  "Loft Storage": { kind: "loft", defaultHeight: 2.5, depth: 1.5, rate: 1200, labour: 150 },
  "TV Panel / Unit": { kind: "tv", defaultHeight: 7, depth: 0.5, rate: 1200, labour: 120 },
  "Shoe Rack": { kind: "shoe", defaultHeight: 4, depth: 1, rate: 800, labour: 120 },
  "Pooja Unit": { kind: "pooja", defaultHeight: 7, depth: 1.5, rate: 1800, labour: 250 },
  "Study Table": { kind: "study", defaultHeight: 2.5, depth: 1.5, rate: 1200, labour: 180 },
  "Crockery Unit": { kind: "crockery", defaultHeight: 7, depth: 1.5, rate: 1600, labour: 220 },
  "Bathroom Vanity": { kind: "vanity", defaultHeight: 2.5, depth: 1.5, rate: 1800, labour: 220 }
};

const fmt = (n: any) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ceil = (n: number) => Math.ceil(Number(n || 0));

function calcItem(name: string, length: number, height: number, nos: number, rates: any) {
  const t = itemTypes[name];
  const L = Number(length || 0);
  const H = Number(height || t.defaultHeight || 0);
  const N = Number(nos || 1);
  const depth = t.depth;
  const frontArea = L * H * N;
  const rft = L * N;

  let q: any = {
    plywood18mm: 0, plywood12mm: 0, plywood6mm: 0,
    externalLaminate: 0, internalLaminate: 0, edgeBanding: 0,
    hinges: 0, handles: 0, locks: 0, drawerChannels: 0,
    slidingTrack: 0, kitchenAccessories: 0, countertop: 0,
    fevicol: 0, nails: 0, screws: 0, mirrors: 0, glass: 0
  };

  if (t.kind === "sliding") {
    q.plywood18mm = frontArea * 2.2;
    q.plywood12mm = frontArea * 0.3;
    q.plywood6mm = frontArea;
    q.externalLaminate = frontArea;
    q.internalLaminate = q.plywood18mm * 0.55;
    q.edgeBanding = frontArea * 1.8;
    q.slidingTrack = rft;
    q.handles = 2 * N;
    q.locks = N;
    q.mirrors = frontArea * 0.25;
  } else if (t.kind === "hinged") {
    q.plywood18mm = frontArea * 2.4;
    q.plywood12mm = frontArea * 0.25;
    q.plywood6mm = frontArea;
    q.externalLaminate = frontArea;
    q.internalLaminate = q.plywood18mm * 0.6;
    q.edgeBanding = frontArea * 2;
    q.hinges = ceil(frontArea / 7);
    q.handles = ceil(frontArea / 14);
    q.locks = N;
  } else if (t.kind === "kitchen") {
    q.plywood18mm = rft * 18;
    q.plywood12mm = rft * 5;
    q.plywood6mm = rft * 6;
    q.externalLaminate = rft * 5;
    q.internalLaminate = (q.plywood18mm + q.plywood12mm) * 0.5;
    q.edgeBanding = rft * 8;
    q.hinges = ceil(rft * 1.5);
    q.handles = ceil(rft * 1.5);
    q.drawerChannels = ceil(rft / 2);
    q.kitchenAccessories = ceil(rft / 2);
    q.countertop = rft;
  } else if (t.kind === "loft") {
    q.plywood18mm = frontArea * 1.6;
    q.plywood12mm = frontArea * 0.25;
    q.plywood6mm = frontArea;
    q.externalLaminate = frontArea;
    q.internalLaminate = frontArea * 0.5;
    q.edgeBanding = frontArea * 1.6;
    q.hinges = ceil(frontArea / 8);
    q.handles = ceil(frontArea / 12);
    q.locks = N;
  } else if (t.kind === "tv") {
    q.plywood18mm = frontArea * 1.25;
    q.plywood12mm = frontArea * 0.2;
    q.externalLaminate = frontArea;
    q.internalLaminate = frontArea * 0.2;
    q.edgeBanding = (L + H) * 2 * N;
  } else if (t.kind === "shoe") {
    q.plywood18mm = frontArea * 1.5;
    q.plywood12mm = frontArea * 0.2;
    q.plywood6mm = frontArea;
    q.externalLaminate = frontArea;
    q.internalLaminate = frontArea * 0.5;
    q.edgeBanding = frontArea * 1.8;
    q.hinges = ceil(frontArea / 8);
    q.handles = ceil(frontArea / 12);
    q.locks = N;
  } else {
    q.plywood18mm = frontArea * 1.8;
    q.plywood12mm = frontArea * 0.25;
    q.plywood6mm = frontArea * 0.5;
    q.externalLaminate = frontArea;
    q.internalLaminate = frontArea * 0.5;
    q.edgeBanding = frontArea * 1.5;
    q.hinges = ceil(frontArea / 8);
    q.handles = ceil(frontArea / 12);
    q.locks = N;
  }

  q.fevicol = (q.plywood18mm + q.plywood12mm) * 0.015;
  q.nails = frontArea * 0.01;
  q.screws = ceil(frontArea / 30);

  const rate = rates?.[t.kind] || t.rate;
  const labourRate = t.labour;
  const chargeQty = t.kind === "kitchen" ? rft : frontArea;
  const amount = chargeQty * rate;
  const labourAmount = chargeQty * labourRate;

  return {
    id: Date.now() + Math.random(),
    name, length: L, depth, height: H, nos: N,
    displayQty: t.kind === "kitchen" ? rft : frontArea,
    displayUnit: t.kind === "kitchen" ? "rft" : "sft",
    frontArea, rft, rate, labourRate, amount, labourAmount, total: amount + labourAmount,
    ...q
  };
}

export default function InteriorBOQPage() {
  const { checkAndRun } = usePaymentBarrier();
  const router = useRouter();
  const { rates, loading } = useRates();

  const [projectName, setProjectName] = useState("Jai Sri ram");
  const [clientName, setClientName] = useState("Reddy");
  const [mobileNo, setMobileNo] = useState("7676942386");
  const [city, setCity] = useState("Bengaluru");
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState("Wardrobe (Sliding)");
  const [length, setLength] = useState(6);
  const [height, setHeight] = useState(7);
  const [nos, setNos] = useState(1);
  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  const addItem = () => {
    if (!length || length <= 0) return alert("Enter valid length.");
    if (!height || height <= 0) return alert("Enter valid height.");
    const item = calcItem(selectedItem, length, height, nos, rates);
    setItems([...items, item]);
    setHeight(itemTypes[selectedItem].defaultHeight);
  };

  const removeItem = (id: any) => setItems(items.filter(i => i.id !== id));

  const calculateBOQ = () => {
    const sum = (k: string) => items.reduce((s, i) => s + Number(i[k] || 0), 0);
    const materialBreakdown: any = {
      plywood18mm: sum("plywood18mm"), plywood12mm: sum("plywood12mm"), plywood6mm: sum("plywood6mm"),
      externalLaminate: sum("externalLaminate"), internalLaminate: sum("internalLaminate"), edgeBanding: sum("edgeBanding"),
      hinges: sum("hinges"), handles: sum("handles"), locks: sum("locks"), drawerChannels: sum("drawerChannels"),
      slidingTrack: sum("slidingTrack"), kitchenAccessories: sum("kitchenAccessories"), countertop: sum("countertop"),
      fevicol: sum("fevicol"), nails: sum("nails"), screws: sum("screws"), mirrors: sum("mirrors"), glass: sum("glass")
    };

    const r = {
      plywood18mm: rates?.plywood18mm || 80,
      plywood12mm: rates?.plywood12mm || 65,
      plywood6mm: rates?.plywood6mm || 40,
      externalLaminate: rates?.laminateExt || 45,
      internalLaminate: rates?.laminateInt || 30,
      edgeBanding: rates?.edgeBanding || 8,
      hinges: rates?.hinge || 35,
      handles: rates?.handle || 50,
      locks: rates?.lock || 120,
      drawerChannels: rates?.drawerChannel || 80,
      slidingTrack: rates?.slidingTrack || 250,
      kitchenAccessories: rates?.kitchenAcc || 150,
      countertop: rates?.countertop || 1200,
      fevicol: rates?.fevicol || 60,
      nails: rates?.nails || 30,
      screws: rates?.screws || 40,
      mirrors: rates?.mirror || 50,
      glass: rates?.glass || 60
    };

    const materialCosts: any = {};
    Object.keys(materialBreakdown).forEach(k => materialCosts[k + "Cost"] = materialBreakdown[k] * (r as any)[k]);

    const materialCostTotal = Object.values(materialCosts).reduce((a: any, b: any) => a + b, 0);
    const labourTotal = items.reduce((s, i) => s + i.labourAmount, 0);
    const itemTotal = items.reduce((s, i) => s + i.amount, 0);
    const grandTotal = materialCostTotal + labourTotal;

    return { items, materialBreakdown, materialCosts, materialCostTotal, labourTotal, itemTotal, grandTotal };
  };

  const handleGenerate = () => { setResults(calculateBOQ()); setGenerated(true); };
  const handleReset = () => { setItems([]); setResults(null); setGenerated(false); };
  const handleBack = () => router.push("/boq");

  const materialRows = (res: any) => [
    ["18mm Plywood BWP", res.materialBreakdown.plywood18mm, "sft", rates?.plywood18mm || 80, res.materialCosts.plywood18mmCost],
    ["12mm Plywood BWP", res.materialBreakdown.plywood12mm, "sft", rates?.plywood12mm || 65, res.materialCosts.plywood12mmCost],
    ["6mm Plywood MR", res.materialBreakdown.plywood6mm, "sft", rates?.plywood6mm || 40, res.materialCosts.plywood6mmCost],
    ["External Laminate", res.materialBreakdown.externalLaminate, "sft", rates?.laminateExt || 45, res.materialCosts.externalLaminateCost],
    ["Internal Laminate", res.materialBreakdown.internalLaminate, "sft", rates?.laminateInt || 30, res.materialCosts.internalLaminateCost],
    ["Edge Banding", res.materialBreakdown.edgeBanding, "m", rates?.edgeBanding || 8, res.materialCosts.edgeBandingCost],
    ["Hinges Soft Close", res.materialBreakdown.hinges, "nos", rates?.hinge || 35, res.materialCosts.hingesCost],
    ["Handles / Pulls", res.materialBreakdown.handles, "nos", rates?.handle || 50, res.materialCosts.handlesCost],
    ["Locks", res.materialBreakdown.locks, "nos", rates?.lock || 120, res.materialCosts.locksCost],
    ["Drawer Channels", res.materialBreakdown.drawerChannels, "set", rates?.drawerChannel || 80, res.materialCosts.drawerChannelsCost],
    ["Sliding Track", res.materialBreakdown.slidingTrack, "rft", rates?.slidingTrack || 250, res.materialCosts.slidingTrackCost],
    ["Kitchen Accessories", res.materialBreakdown.kitchenAccessories, "set", rates?.kitchenAcc || 150, res.materialCosts.kitchenAccessoriesCost],
    ["Countertop", res.materialBreakdown.countertop, "rft", rates?.countertop || 1200, res.materialCosts.countertopCost],
    ["Fevicol / Adhesive", res.materialBreakdown.fevicol, "kg", rates?.fevicol || 60, res.materialCosts.fevicolCost],
    ["Nails", res.materialBreakdown.nails, "kg", rates?.nails || 30, res.materialCosts.nailsCost],
    ["Screws", res.materialBreakdown.screws, "box", rates?.screws || 40, res.materialCosts.screwsCost],
    ["Mirrors", res.materialBreakdown.mirrors, "sft", rates?.mirror || 50, res.materialCosts.mirrorsCost],
    ["Glass", res.materialBreakdown.glass, "sft", rates?.glass || 60, res.materialCosts.glassCost]
  ];

  const handleExportExcel = () => {
    if (!results) return;
    const itemsData = results.items.map((i: any) => ({
      Item: i.name, Size: `${i.length}' x ${i.depth}' x ${i.height}'`, Nos: i.nos,
      Qty: fmt(i.displayQty), Unit: i.displayUnit, Material: fmt(i.amount), Labour: fmt(i.labourAmount), Total: fmt(i.total)
    }));
    const materialsData = materialRows(results).map(r => ({ Material: r[0], Quantity: fmt(r[1]), Unit: r[2], Rate: fmt(r[3]), Cost: fmt(r[4]) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemsData), "Interior_Items");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(materialsData), "Material_BOQ");
    XLSX.writeFile(wb, `Interior_BOQ_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const msg = `Interior BOQ\nProject: ${projectName}\nItems: ${results.items.length}\nPlywood: ${fmt(results.materialBreakdown.plywood18mm)} sft\nLaminate: ${fmt(results.materialBreakdown.externalLaminate)} sft\nTotal: ₹${fmt(results.grandTotal)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Loading rates...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backButton}>←</button>
        <div>
          <h1 style={styles.headerTitle}>🛋️ Interior BOQ Calculator</h1>
          <p style={styles.headerSub}>Accurate plywood, laminate, hardware and labour BOQ</p>
        </div>
      </div>

      <div style={styles.sectionTitle}>📋 Project Details</div>
      <div style={styles.row4}>
        <div><label style={styles.label}>Project Name</label><input value={projectName} onChange={e => setProjectName(e.target.value)} style={styles.input} /></div>
        <div><label style={styles.label}>Client Name</label><input value={clientName} onChange={e => setClientName(e.target.value)} style={styles.input} /></div>
        <div><label style={styles.label}>Mobile No.</label><input value={mobileNo} onChange={e => setMobileNo(e.target.value)} style={styles.input} /></div>
        <div><label style={styles.label}>City</label><input value={city} onChange={e => setCity(e.target.value)} style={styles.input} /></div>
      </div>

      <div style={styles.infoBox}>Depth fixed by standard: Wardrobe / Kitchen / Loft = 18&quot; | Shoe Rack = 12&quot;. Area is calculated from Length × Height × Nos.</div>

      <div style={styles.sectionTitle}>➕ Add Interior Item</div>
      <div style={styles.row5}>
        <div><label style={styles.label}>Item Type</label><select value={selectedItem} onChange={e => { setSelectedItem(e.target.value); setHeight(itemTypes[e.target.value].defaultHeight); }} style={styles.select}>{Object.keys(itemTypes).map(i => <option key={i}>{i}</option>)}</select></div>
        <div><label style={styles.label}>Length / RFT</label><input type="number" value={length} onChange={e => setLength(Number(e.target.value))} style={styles.input} /></div>
        <div><label style={styles.label}>Height</label><input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} style={styles.input} /></div>
        <div><label style={styles.label}>Nos</label><input type="number" value={nos} onChange={e => setNos(Number(e.target.value))} style={styles.input} /></div>
        <div style={{ display: "flex", alignItems: "end" }}><button onClick={addItem} style={styles.buttonSmall}>+ Add Item</button></div>
      </div>

      {items.length > 0 && <div style={styles.tableContainer}><table style={styles.table}><thead><tr>
        <th style={styles.th}>Item</th><th style={styles.th}>Size</th><th style={styles.th}>Nos</th><th style={styles.th}>Qty</th><th style={styles.th}>Unit</th><th style={styles.th}>Material</th><th style={styles.th}>Labour</th><th style={styles.th}>Total</th><th style={styles.th}></th>
      </tr></thead><tbody>{items.map((i, idx) => <tr key={i.id} style={idx % 2 ? styles.evenRow : {}}>
        <td style={styles.td}>{i.name}</td><td style={styles.td}>{i.length}' x {i.depth}' x {i.height}'</td><td style={styles.td}>{i.nos}</td><td style={styles.td}>{fmt(i.displayQty)}</td><td style={styles.td}>{i.displayUnit}</td>
        <td style={styles.td}>₹{fmt(i.amount)}</td><td style={styles.td}>₹{fmt(i.labourAmount)}</td><td style={styles.td}>₹{fmt(i.total)}</td>
        <td style={styles.td}><button onClick={() => removeItem(i.id)} style={{ ...styles.buttonSmall, backgroundColor: "#dc3545" }}>X</button></td>
      </tr>)}</tbody></table></div>}

      <div style={styles.buttonContainer}>
        <button onClick={handleReset} style={styles.buttonExport}>🔄 Reset</button>
        <button onClick={handleGenerate} style={styles.buttonGenerate}>🔨 Generate Interior BOQ</button>
      </div>

      {generated && results && <>
        <div style={styles.cardContainer}>
          <div style={{ ...styles.card, backgroundColor: "#800020" }}>💰<div>Total Cost</div><div style={styles.cardValue}>₹{fmt(results.grandTotal / 100000)} L</div></div>
          <div style={{ ...styles.card, backgroundColor: "#8d6e63" }}>🪵<div>Plywood</div><div style={styles.cardValue}>{fmt(results.materialBreakdown.plywood18mm)} sft</div></div>
          <div style={{ ...styles.card, backgroundColor: "#4CAF50" }}>🎨<div>Laminate</div><div style={styles.cardValue}>{fmt(results.materialBreakdown.externalLaminate)} sft</div></div>
          <div style={{ ...styles.card, backgroundColor: "#FF9800" }}>🔧<div>Hardware</div><div style={styles.cardValue}>{fmt(results.materialBreakdown.hinges + results.materialBreakdown.handles)} nos</div></div>
          <div style={{ ...styles.card, backgroundColor: "#2196F3" }}>👷<div>Labour</div><div style={styles.cardValue}>₹{fmt(results.labourTotal / 100000)} L</div></div>
        </div>

        <div style={styles.buttonContainer}>
          <button onClick={() => checkAndRun("boq_export", "boq-interior", handleExportExcel)} style={styles.buttonExport}>📊 Excel</button>
          <button onClick={() => checkAndRun("boq_export", "boq-interior", handleWhatsApp)} style={styles.buttonWhatsapp}>💬 Share</button>
        </div>

        <div style={styles.tableContainer}><table style={styles.table}><thead><tr><th style={styles.th}>Material</th><th style={styles.th}>Quantity</th><th style={styles.th}>Unit</th><th style={styles.th}>Rate</th><th style={styles.th}>Cost</th></tr></thead><tbody>
          {materialRows(results).map((r, idx) => <tr key={String(r[0])} style={idx % 2 ? styles.evenRow : {}}><td style={styles.td}>{r[0]}</td><td style={styles.td}>{fmt(r[1])}</td><td style={styles.td}>{r[2]}</td><td style={styles.td}>{fmt(r[3])}</td><td style={styles.td}>{fmt(r[4])}</td></tr>)}
          <tr style={styles.totalRow}><td colSpan={4} style={styles.td}>TOTAL MATERIAL COST</td><td style={styles.td}>₹{fmt(results.materialCostTotal)}</td></tr>
          <tr style={styles.totalRow}><td colSpan={4} style={styles.td}>GRAND TOTAL</td><td style={styles.td}>₹{fmt(results.grandTotal)}</td></tr>
        </tbody></table></div>
      </>}
    </div>
  );
}

