import React, { useMemo, useState } from "react";
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

type Opening = { name: string; length: number; width: number; nos: number };

const readArray = (key: string): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const findRate = (keywords: string[], fallback: number) => {
  const rows = [
    ...readArray("bm_material_rates"),
    ...readArray("bm_labour_rates"),
    ...readArray("bm_service_rates")
  ];

  const found = rows.find((r) => {
    const text = `${r.item || ""} ${r.itemName || ""} ${r.material || ""} ${r.service || ""} ${r.trade || ""} ${r.category || ""}`.toLowerCase();
    return keywords.some((k) => text.includes(k.toLowerCase())) && Number(r.rate || 0) > 0;
  });

  return {
    rate: Number(found?.rate || fallback),
    fromMaster: Boolean(found)
  };
};

export default function PlasterCalculator() {
  const [nos, setNos] = useState(2);
  const [length, setLength] = useState(100);
  const [height, setHeight] = useState(10);
  const [plasterType, setPlasterType] = useState("Internal Plaster");
  const [thicknessMm, setThicknessMm] = useState(20);
  const [mortarRatio, setMortarRatio] = useState("1:6");
  const [wastage, setWastage] = useState(3);

  const [opening, setOpening] = useState<Opening>({ name: "Door", length: 3.5, width: 7, nos: 1 });
  const [openings, setOpenings] = useState<Opening[]>([
    { name: "Door", length: 3.5, width: 7, nos: 2 },
    { name: "Window", length: 5, width: 4, nos: 2 }
  ]);

  const cement = getMasterRate(["cement", "opc", "ppc"], 400);
  const sand = getMasterRate(["sand"], 55);
  const labour = getMasterRate(["plaster labour", "plaster"], 10, ["bm_labour_rates", "bm_service_rates"]);
  const waterRate = 0.5;

  const calc = useMemo(() => {
    const wallArea = Number(nos || 0) * Number(length || 0) * Number(height || 0);
    const openingArea = openings.reduce((s, o) => s + Number(o.length || 0) * Number(o.width || 0) * Number(o.nos || 0), 0);

    const multiplier = plasterType === "Both Side Wall Plaster" ? 2 : 1;
    const netBeforeWastage = Math.max((wallArea - openingArea) * multiplier, 0);
    const netArea = netBeforeWastage * (1 + Number(wastage || 0) / 100);

    const thicknessFt = Number(thicknessMm || 0) / 304.8;
    const wetVolumeCft = netArea * thicknessFt;
    const dryVolumeCft = wetVolumeCft * 1.33;

    const [cementPart, sandPart] = mortarRatio.split(":").map(Number);
    const totalPart = cementPart + sandPart;

    const cementBags = ((dryVolumeCft * (cementPart / totalPart)) / 1.25);
    const sandCft = dryVolumeCft * (sandPart / totalPart);
    const waterLtr = wetVolumeCft * 20;

    const cementCost = cementBags * cement.rate;
    const sandCost = sandCft * sand.rate;
    const waterCost = waterLtr * waterRate;
    const labourCost = netArea * labour.rate;
    const materialTotal = cementCost + sandCost + waterCost;
    const totalCost = materialTotal + labourCost;

    return { wallArea, openingArea, netArea, cementBags, sandCft, waterLtr, cementCost, sandCost, waterCost, labourCost, materialTotal, totalCost };
  }, [nos, length, height, openings, plasterType, thicknessMm, mortarRatio, wastage, cement.rate, sand.rate, labour.rate]);

  const addOpening = () => {
    if (!opening.name || !opening.length || !opening.width || !opening.nos) return alert("Fill opening details");
    setOpenings([...openings, opening]);
    setOpening({ name: "Window", length: 5, width: 4, nos: 1 });
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Plaster Calculator Result
Area: ${calc.netArea.toFixed(2)} sqft
Cement: ${calc.cementBags.toFixed(2)} bags
Sand: ${calc.sandCft.toFixed(2)} CFT
Total: ₹${calc.totalCost.toFixed(2)}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const exportExcel = () => {
    const rows = [
      ["Item", "Quantity", "Unit", "Cost"],
      ["Wall Area", calc.wallArea.toFixed(2), "sqft", "-"],
      ["Opening Area", calc.openingArea.toFixed(2), "sqft", "-"],
      ["Net Area", calc.netArea.toFixed(2), "sqft", "-"],
      ["Cement", calc.cementBags.toFixed(2), "bags", calc.cementCost.toFixed(2)],
      ["Sand", calc.sandCft.toFixed(2), "CFT", calc.sandCost.toFixed(2)],
      ["Water", calc.waterLtr.toFixed(2), "Ltr", calc.waterCost.toFixed(2)],
      ["Labour", calc.netArea.toFixed(2), "sqft", calc.labourCost.toFixed(2)],
      ["Grand Total", "", "", calc.totalCost.toFixed(2)]
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plaster-calculator.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const card = { background: "white", borderRadius: 18, padding: 18, marginBottom: 16, boxShadow: "0 8px 24px rgba(128,0,32,.12)", border: "1px solid #f3d4df" };
  const input = { padding: 11, border: "1px solid #e7c6d0", borderRadius: 10, width: "100%", boxSizing: "border-box" as const, background: "#fffafc" };
  const th = { border: "1px solid #ead5dc", padding: 9, background: "#800020", color: "white" };
  const td = { border: "1px solid #ead5dc", padding: 9, background: "#fff" };

  return (
    <div style={{ padding: 20, background: "linear-gradient(135deg,#fdf2f8,#fff7ed,#eef2ff)", minHeight: "100vh", fontFamily: "Arial" }}>
      <button onClick={() => history.back()} style={{ marginBottom: 12 }}>←</button>
      <h1 style={{ color: "#800020", fontSize: 34, marginBottom: 6 }}>🪣 Plaster Calculator</h1>
      <p style={{ background: "#800020", color: "white", padding: 12, borderRadius: 12, display: "inline-block" }}>
        💰 Cement ₹{cement.rate}/bag | Sand ₹{sand.rate}/CFT | Labour ₹{labour.rate}/sqft
      </p>
      {rateStatusMessage({ cement, sand, labour }) && (
        <div style={{ ...card, background: "#fff3cd", color: "#856404" }}>
          {rateStatusMessage({ cement, sand, labour })}
        </div>
      )}

      <div style={card}>
        <h2>👷 {plasterType}</h2>
        <h3>📐 Wall Dimensions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
          <div><label>Nos</label><input style={input} type="number" value={nos} onChange={(e) => setNos(Number(e.target.value))} /></div>
          <div><label>Length (ft)</label><input style={input} type="number" value={length} onChange={(e) => setLength(Number(e.target.value))} /></div>
          <div><label>Height (ft)</label><input style={input} type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} /></div>
          <div><label>Plaster Type</label>
            <select style={input} value={plasterType} onChange={(e) => setPlasterType(e.target.value)}>
              <option value="Internal Plaster">Internal Plaster - One Side</option>
              <option value="External Plaster">External Plaster - One Side</option>
              <option value="Ceiling Plaster">Ceiling Plaster</option>
              <option value="Both Side Wall Plaster">Both Side Wall Plaster</option>
            </select>
          </div>
          <div><label>Thickness (mm)</label>
            <select style={input} value={thicknessMm} onChange={(e) => setThicknessMm(Number(e.target.value))}>
              <option value={12}>12 mm</option>
              <option value={15}>15 mm</option>
              <option value={20}>20 mm</option>
            </select>
          </div>
          <div><label>Mortar Ratio</label>
            <select style={input} value={mortarRatio} onChange={(e) => setMortarRatio(e.target.value)}>
              <option value="1:4">1:4</option>
              <option value="1:5">1:5</option>
              <option value="1:6">1:6</option>
            </select>
          </div>
        </div>
      </div>

      <div style={card}>
        <h3>🚪 Openings</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
          <input style={input} placeholder="Name" value={opening.name} onChange={(e) => setOpening({ ...opening, name: e.target.value })} />
          <input style={input} type="number" placeholder="Length" value={opening.length} onChange={(e) => setOpening({ ...opening, length: Number(e.target.value) })} />
          <input style={input} type="number" placeholder="Width" value={opening.width} onChange={(e) => setOpening({ ...opening, width: Number(e.target.value) })} />
          <input style={input} type="number" placeholder="Nos" value={opening.nos} onChange={(e) => setOpening({ ...opening, nos: Number(e.target.value) })} />
          <div style={{ padding: 10 }}>Area {(opening.length * opening.width * opening.nos).toFixed(2)} sqft</div>
          <button onClick={addOpening} style={{ background: "#2d6a4f", color: "white", border: 0, borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>+ Add</button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead><tr><th style={th}>Name</th><th style={th}>Size</th><th style={th}>Nos</th><th style={th}>Area</th><th style={th}></th></tr></thead>
          <tbody>
            {openings.map((o, i) => (
              <tr key={i}>
                <td style={td}>{o.name}</td>
                <td style={td}>{o.length}' x {o.width}'</td>
                <td style={td}>{o.nos}</td>
                <td style={td}>{(o.length * o.width * o.nos).toFixed(2)}</td>
                <td style={td}><button onClick={() => setOpenings(openings.filter((_, idx) => idx !== i))}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 12 }}>
          <label>Wastage (%)</label>
          <input style={{ ...input, maxWidth: 180, marginLeft: 10 }} type="number" value={wastage} onChange={(e) => setWastage(Number(e.target.value))} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button style={{ background: "#800020", color: "white", border: 0, borderRadius: 10, padding: "12px 18px", cursor: "pointer" }}>🔨 Generate</button>
        <button onClick={exportExcel} style={{ background: "#0d6efd", color: "white", border: 0, borderRadius: 10, padding: "12px 18px", cursor: "pointer" }}>📊 Excel</button>
        <button onClick={shareWhatsApp} style={{ background: "#25D366", color: "white", border: 0, borderRadius: 10, padding: "12px 18px", cursor: "pointer" }}>💬 Share</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        <div style={card}>🪣<br />Area<br /><b>{calc.netArea.toLocaleString(undefined, { maximumFractionDigits: 2 })} sqft</b></div>
        <div style={card}>🪣<br />Cement<br /><b>{calc.cementBags.toFixed(2)} bags</b></div>
        <div style={card}>🏖️<br />Sand<br /><b>{calc.sandCft.toFixed(2)} CFT</b></div>
        <div style={card}>💰<br />Total Cost<br /><b>₹{calc.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></div>
      </div>

      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Item</th><th style={th}>Quantity</th><th style={th}>Unit</th><th style={th}>Cost</th></tr></thead>
          <tbody>
            <tr><td style={td}>Wall Area</td><td style={td}>{calc.wallArea.toFixed(2)}</td><td style={td}>sqft</td><td style={td}>-</td></tr>
            <tr><td style={td}>Opening Area</td><td style={td}>{calc.openingArea.toFixed(2)}</td><td style={td}>sqft</td><td style={td}>-</td></tr>
            <tr><td style={td}>Net Area</td><td style={td}>{calc.netArea.toFixed(2)}</td><td style={td}>sqft</td><td style={td}>-</td></tr>
            <tr><td style={td}>Cement</td><td style={td}>{calc.cementBags.toFixed(2)}</td><td style={td}>bags</td><td style={td}>₹{calc.cementCost.toFixed(2)}</td></tr>
            <tr><td style={td}>Sand</td><td style={td}>{calc.sandCft.toFixed(2)}</td><td style={td}>CFT</td><td style={td}>₹{calc.sandCost.toFixed(2)}</td></tr>
            <tr><td style={td}>Water</td><td style={td}>{calc.waterLtr.toFixed(2)}</td><td style={td}>Ltr</td><td style={td}>₹{calc.waterCost.toFixed(2)}</td></tr>
            <tr><td style={td}>Material Total</td><td style={td}></td><td style={td}></td><td style={td}>₹{calc.materialTotal.toFixed(2)}</td></tr>
            <tr><td style={td}>Labour</td><td style={td}></td><td style={td}></td><td style={td}>₹{calc.labourCost.toFixed(2)}</td></tr>
            <tr><td style={td}><b>GRAND TOTAL</b></td><td style={td}></td><td style={td}></td><td style={td}><b>₹{calc.totalCost.toFixed(2)}</b></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


