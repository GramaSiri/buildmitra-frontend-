import React, { useState } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import { getMasterRate, rateStatusMessage } from "../utils/masterRates";

const fmt = (n: number) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const kgPerM = (d: number) => (d * d) / 162;

export default function StaircaseCalculator() {
  const router = useRouter();

  const [floors, setFloors] = useState(3);
  const [floorHeight, setFloorHeight] = useState(10);
  const [riser, setRiser] = useState(7);
  const [tread, setTread] = useState(10);
  const [width, setWidth] = useState(4);
  const [waist, setWaist] = useState(150);
  const [landingL, setLandingL] = useState(4);
  const [landingW, setLandingW] = useState(4);
  const [landingPerFloor, setLandingPerFloor] = useState(2);
  const [mainDia, setMainDia] = useState(12);
  const [mainSp, setMainSp] = useState(150);
  const [distDia, setDistDia] = useState(10);
  const [distSp, setDistSp] = useState(200);
  const [cover, setCover] = useState(20);
  const [wastage, setWastage] = useState(3);
  const [finish, setFinish] = useState("Granite");
  const [railing, setRailing] = useState("MS");
  const [railingSides, setRailingSides] = useState(1);
  const [result, setResult] = useState<any>(null);

  const cement = getMasterRate(["cement", "opc", "ppc"], 0);
  const sand = getMasterRate(["m sand", "sand"], 0);
  const agg = getMasterRate(["aggregate", "20mm aggregate", "ca1"], 0);
  const steel = getMasterRate(["steel", "tmt", "rebar"], 0);
  const binding = getMasterRate(["binding wire"], 0);
  const labour = getMasterRate(["staircase labour", "rcc labour"], 0, ["bm_labour_rates", "bm_service_rates"]);
  const granite = getMasterRate(["granite"], 0);
  const marble = getMasterRate(["marble"], 0);
  const tile = getMasterRate(["tile", "tiles"], 0);
  const ips = getMasterRate(["ips", "ips finish"], 0);
  const ssRail = getMasterRate(["ss railing"], 0);
  const msRail = getMasterRate(["ms railing"], 0);
  const glassRail = getMasterRate(["glass railing"], 0);

  const finishRate = finish === "Granite" ? granite.rate : finish === "Marble" ? marble.rate : finish === "Tile" ? tile.rate : ips.rate;
  const railingRate = railing === "SS" ? ssRail.rate : railing === "Glass" ? glassRail.rate : msRail.rate;

  const calc = () => {
    const riserFt = riser / 12;
    const treadFt = tread / 12;
    const flights = floors * 2;
    const risersPerFloor = Math.ceil(floorHeight / riserFt);
    const stepsPerFlight = Math.ceil(risersPerFloor / 2);
    const totalRisers = risersPerFloor * floors;
    const totalTreads = Math.max(totalRisers - floors, 0);

    const totalGoing = totalTreads * treadFt;
    const totalRise = totalRisers * riserFt;
    const slopeLength = Math.sqrt(totalGoing * totalGoing + totalRise * totalRise);
    const slopeArea = slopeLength * width;
    const landingArea = landingL * landingW * landingPerFloor * floors;
    const waistFt = waist / 304.8;

    const waistConcrete = slopeArea * waistFt;
    const landingConcrete = landingArea * waistFt;
    const stepConcrete = 0.5 * riserFt * treadFt * width * totalTreads;
    const concreteCft = waistConcrete + landingConcrete + stepConcrete;
    const concreteCum = concreteCft / 35.315;

    const cementBags = concreteCum * 7.5;
    const sandCft = concreteCum * 14.83;
    const aggCft = concreteCum * 29.67;

    const clearWidthM = Math.max(width * 0.3048 - 2 * cover / 1000, 0.01);
    const slopeM = slopeLength * 0.3048;
    const mainBars = Math.floor((clearWidthM * 1000) / mainSp) + 1;
    const distBars = Math.floor((slopeM * 1000) / distSp) + 1;

    const mainSteel = mainBars * slopeM * kgPerM(mainDia);
    const distSteel = distBars * clearWidthM * kgPerM(distDia);
    const landingSteel = landingArea * 0.8;
    const steelTotal = (mainSteel + distSteel + landingSteel) * (1 + wastage / 100);
    const bindingKg = steelTotal * 0.01;

    const finishArea = totalTreads * treadFt * width + totalRisers * riserFt * width + landingArea;

    const flightSlope = Math.sqrt((stepsPerFlight * treadFt) ** 2 + (stepsPerFlight * riserFt) ** 2);
    const landingPerimeter = 2 * (landingL + landingW);
    const railingRft = (flightSlope * flights + landingPerimeter * landingPerFloor * floors) * railingSides;
    const railingRmt = railingRft * 0.3048;

    const rows = [
      ["No. of Floors", floors, "Nos", ""],
      ["Flights = Floors × 2", flights, "Nos", ""],
      ["Calculated Steps / Risers", totalRisers, "Nos", ""],
      ["Steps per Flight", stepsPerFlight, "Nos", ""],
      ["Concrete Volume", concreteCft, "CFT", ""],
      ["Cement", cementBags, "bags", cementBags * cement.rate],
      ["M Sand", sandCft, "CFT", sandCft * sand.rate],
      ["Aggregate", aggCft, "CFT", aggCft * agg.rate],
      [`Steel ${mainDia}mm Main Bars`, mainSteel * (1 + wastage / 100), "kg", mainSteel * (1 + wastage / 100) * steel.rate],
      [`Steel ${distDia}mm Distribution Bars`, distSteel * (1 + wastage / 100), "kg", distSteel * (1 + wastage / 100) * steel.rate],
      ["Landing Steel", landingSteel * (1 + wastage / 100), "kg", landingSteel * (1 + wastage / 100) * steel.rate],
      ["Total Steel", steelTotal, "kg", steelTotal * steel.rate],
      ["Binding Wire", bindingKg, "kg", bindingKg * binding.rate],
      [`${finish} Finish`, finishArea, "sqft", finishArea * finishRate],
      [`${railing} Railing`, railingRmt, "RMT", railingRmt * railingRate],
      ["Labour", concreteCum, "CUM", concreteCum * labour.rate],
    ];

    const total = rows.reduce((s, r) => s + (typeof r[3] === "number" ? Number(r[3]) : 0), 0);
    rows.push(["GRAND TOTAL", "", "", total]);

    setResult({ concreteCft, cementBags, steelTotal, finishArea, railingRmt, total, rows });
  };

  const exportExcel = () => {
    if (!result) return;
    const ws = XLSX.utils.json_to_sheet(result.rows.map((r: any[]) => ({
      Item: r[0], Quantity: typeof r[1] === "number" ? fmt(r[1]) : r[1], Unit: r[2], Cost: typeof r[3] === "number" ? "₹" + fmt(r[3]) : "-"
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staircase");
    XLSX.writeFile(wb, "Staircase.xlsx");
  };

  const share = () => {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Staircase Estimate\nConcrete: ${fmt(result.concreteCft)} CFT\nSteel: ${fmt(result.steelTotal)} kg\nFinish: ${fmt(result.finishArea)} sqft\nRailing: ${fmt(result.railingRmt)} RMT\nTotal: ₹${fmt(result.total)}`)}`, "_blank");
  };

  const styles: any = {
    page: { padding: 12, background: "#f5f0e8", minHeight: "100vh", fontFamily: "Arial" },
    header: { background: "#4a6fa5", color: "white", padding: 12, borderRadius: 8, display: "flex", gap: 10, alignItems: "center" },
    section: { background: "#e8f4f8", color: "#4a6fa5", padding: 8, borderRadius: 6, marginTop: 12, textAlign: "center", fontWeight: "bold" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, marginTop: 10 },
    input: { width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 },
    label: { fontSize: 11, fontWeight: 600 },
    btn: { background: "#800020", color: "white", padding: "8px 20px", border: 0, borderRadius: 6, margin: 5 },
    card: { background: "white", padding: 10, borderRadius: 8, marginTop: 12 },
    th: { background: "#4a6fa5", color: "white", padding: 8 },
    td: { padding: 6, borderBottom: "1px solid #eee" }
  };

  const rateMsg = rateStatusMessage({ cement, sand, agg, steel, binding, labour });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => router.push("/calculators")} style={{ background: "transparent", color: "white", border: 0, fontSize: 22 }}>←</button>
        <h2>🪜 Staircase Calculator</h2>
      </div>

      <div style={styles.card}>
        💰 Admin Rates: Cement ₹{cement.rate}/bag | Steel ₹{steel.rate}/kg | Finish ₹{finishRate}/sqft | Railing ₹{railingRate}/RMT
        {rateMsg && <div style={{ color: "#856404" }}>{rateMsg}</div>}
      </div>

      <div style={styles.section}>📐 Building / Stair Inputs</div>
      <div style={styles.grid}>
        {[
          ["No. of Floors", floors, setFloors],
          ["Floor Height (ft)", floorHeight, setFloorHeight],
          ["Riser (in)", riser, setRiser],
          ["Tread (in)", tread, setTread],
          ["Stair Width (ft)", width, setWidth],
          ["Waist Slab (mm)", waist, setWaist],
          ["Landing L (ft)", landingL, setLandingL],
          ["Landing W (ft)", landingW, setLandingW],
          ["Landings / Floor", landingPerFloor, setLandingPerFloor],
        ].map(([l, v, s]: any) => (
          <div key={l}><label style={styles.label}>{l}</label><input style={styles.input} type="number" value={v} onChange={e => s(parseFloat(e.target.value) || 0)} /></div>
        ))}
      </div>

      <div style={styles.section}>🔄 Reinforcement</div>
      <div style={styles.grid}>
        {[
          ["Main Dia (mm)", mainDia, setMainDia],
          ["Main Spacing (mm)", mainSp, setMainSp],
          ["Dist Dia (mm)", distDia, setDistDia],
          ["Dist Spacing (mm)", distSp, setDistSp],
          ["Cover (mm)", cover, setCover],
          ["Wastage (%)", wastage, setWastage],
        ].map(([l, v, s]: any) => (
          <div key={l}><label style={styles.label}>{l}</label><input style={styles.input} type="number" value={v} onChange={e => s(parseFloat(e.target.value) || 0)} /></div>
        ))}
      </div>

      <div style={styles.section}>🎨 Finish & Railing</div>
      <div style={styles.grid}>
        <div><label style={styles.label}>Finish Type</label><select style={styles.input} value={finish} onChange={e => setFinish(e.target.value)}><option>IPS</option><option>Granite</option><option>Marble</option><option>Tile</option></select></div>
        <div><label style={styles.label}>Railing Type</label><select style={styles.input} value={railing} onChange={e => setRailing(e.target.value)}><option>MS</option><option>SS</option><option>Glass</option></select></div>
        <div><label style={styles.label}>Railing Sides</label><input style={styles.input} type="number" value={railingSides} onChange={e => setRailingSides(parseFloat(e.target.value) || 1)} /></div>
      </div>

      <div style={{ textAlign: "center", marginTop: 15 }}>
        <button style={styles.btn} onClick={calc}>🔨 Generate</button>
        {result && <button style={{ ...styles.btn, background: "#28a745" }} onClick={exportExcel}>📊 Excel</button>}
        {result && <button style={{ ...styles.btn, background: "#25D366" }} onClick={share}>💬 Share</button>}
      </div>

      {result && (
        <div style={styles.card}>
          <h3>Results</h3>
          <p>Concrete: {fmt(result.concreteCft)} CFT | Cement: {fmt(result.cementBags)} bags | Steel: {fmt(result.steelTotal)} kg</p>
          <p>Finish: {fmt(result.finishArea)} sqft | Railing: {fmt(result.railingRmt)} RMT</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={styles.th}>Item</th><th style={styles.th}>Qty</th><th style={styles.th}>Unit</th><th style={styles.th}>Cost</th></tr></thead>
            <tbody>
              {result.rows.map((r: any[], i: number) => (
                <tr key={i}><td style={styles.td}>{r[0]}</td><td style={styles.td}>{typeof r[1] === "number" ? fmt(r[1]) : r[1]}</td><td style={styles.td}>{r[2]}</td><td style={styles.td}>{typeof r[3] === "number" ? "₹" + fmt(r[3]) : "-"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}