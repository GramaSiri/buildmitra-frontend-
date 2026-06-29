import React, { useState } from "react";

const dias = [6, 8, 10, 12, 16, 20, 25, 32];
const kgPerM = (dia: number) => (dia * dia) / 162;
const ftToM = (ft: number) => ft * 0.3048;
const inchToFt = (inch: number) => inch / 12;

export default function SteelCalculator() {
  const [item, setItem] = useState("Slab");
  const [rate, setRate] = useState(68);
  const [wastage, setWastage] = useState(3);
  const [bindingWirePercent, setBindingWirePercent] = useState(1);
  const [generated, setGenerated] = useState(false);

  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(20);
  const [thickness, setThickness] = useState(5);
  const [cover, setCover] = useState(1);
  const [xDia, setXDia] = useState(10);
  const [yDia, setYDia] = useState(8);
  const [xSpacing, setXSpacing] = useState(6);
  const [ySpacing, setYSpacing] = useState(6);

  const [memberNos, setMemberNos] = useState(1);
  const [memberLength, setMemberLength] = useState(10);
  const [memberWidth, setMemberWidth] = useState(9);
  const [memberDepth, setMemberDepth] = useState(12);

  const [topDia, setTopDia] = useState(12);
  const [topBars, setTopBars] = useState(2);
  const [bottomDia, setBottomDia] = useState(16);
  const [bottomBars, setBottomBars] = useState(2);

  const [cornerDia, setCornerDia] = useState(16);
  const [cornerBars, setCornerBars] = useState(4);
  const [middleDia, setMiddleDia] = useState(12);
  const [middleBars, setMiddleBars] = useState(4);

  const [stirrupDia, setStirrupDia] = useState(8);
  const [stirrupSpacing, setStirrupSpacing] = useState(6);

  const styles: any = {
    page: { fontFamily: "Arial", padding: 20, background: "#f5f7fb", minHeight: "100vh" },
    card: { background: "white", padding: 18, borderRadius: 12, marginBottom: 16, boxShadow: "0 2px 8px #ddd" },
    row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 },
    input: { padding: 10, border: "1px solid #ccc", borderRadius: 8, width: "100%" },
    label: { fontWeight: "bold", fontSize: 13 },
    button: { background: "#800020", color: "white", border: 0, padding: "12px 20px", borderRadius: 8, cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: 12 },
    th: { background: "#800020", color: "white", padding: 10, textAlign: "left" },
    td: { border: "1px solid #ddd", padding: 10 },
    note: { background: "#fff7ed", padding: 10, borderRadius: 8, fontSize: 13, color: "#92400e" }
  };

  const input = (label: string, value: any, setValue: any) => (
    <div>
      <label style={styles.label}>{label}</label>
      <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} style={styles.input} />
    </div>
  );

  const diaSelect = (label: string, value: number, setValue: any) => (
    <div>
      <label style={styles.label}>{label}</label>
      <select value={value} onChange={(e) => setValue(Number(e.target.value))} style={styles.input}>
        {dias.map(d => <option key={d} value={d}>{d} mm</option>)}
      </select>
    </div>
  );

  const finalRows = (baseKg: number, rows: any[]) => {
    const wasteKg = baseKg * wastage / 100;
    const totalKg = baseKg + wasteKg;
    const bindingWireKg = totalKg * bindingWirePercent / 100;
    return [
      ...rows,
      ["Base Steel", "-", `${baseKg.toFixed(2)} kg`],
      [`Wastage ${wastage}%`, "-", `${wasteKg.toFixed(2)} kg`],
      ["Total Steel", "-", `${totalKg.toFixed(2)} kg`],
      ["Binding Wire", `${bindingWirePercent}%`, `${bindingWireKg.toFixed(2)} kg`],
      ["Steel Cost", `₹${rate}/kg`, `₹${(totalKg * rate).toFixed(2)}`]
    ];
  };

  const calculateSlab = () => {
    const clearLength = Math.max(0, length - 2 * inchToFt(cover));
    const clearWidth = Math.max(0, width - 2 * inchToFt(cover));
    const xBarsCount = Math.floor((width * 12) / xSpacing) + 1;
    const yBarsCount = Math.floor((length * 12) / ySpacing) + 1;
    const crankExtraFt = thickness * 2 * 0.42 / 12;
    const lapExtraFt = 1.5;
    const xBarLengthFt = clearLength + crankExtraFt + lapExtraFt;
    const yBarLengthFt = clearWidth + crankExtraFt + lapExtraFt;
    const xKg = ftToM(xBarLengthFt * xBarsCount) * kgPerM(xDia);
    const yKg = ftToM(yBarLengthFt * yBarsCount) * kgPerM(yDia);
    const baseKg = xKg + yKg;
    const coverBlocksNos = Math.ceil((length * width) / 4);

    return {
      title: item + " Steel",
      rows: finalRows(baseKg, [
        ["X Direction Bars", `${xBarsCount} nos × ${xBarLengthFt.toFixed(2)} ft`, `${xKg.toFixed(2)} kg`],
        ["Y Direction Bars", `${yBarsCount} nos × ${yBarLengthFt.toFixed(2)} ft`, `${yKg.toFixed(2)} kg`],
        ["Cover Blocks", "Approx 1 per 4 sqft", `${coverBlocksNos} nos`]
      ])
    };
  };

  const calculateBeamOrLintel = () => {
    const clearLength = Math.max(0, memberLength - 2 * inchToFt(cover));
    const lapExtraFt = item === "Lintel" ? 1 : 1.5;
    const topKg = ftToM((clearLength + lapExtraFt) * topBars * memberNos) * kgPerM(topDia);
    const bottomKg = ftToM((clearLength + lapExtraFt) * bottomBars * memberNos) * kgPerM(bottomDia);

    const stirrupCountPerMember = Math.floor((memberLength * 12) / stirrupSpacing) + 1;
    const hookFt = stirrupDia <= 8 ? 0.75 : 1;
    const stirrupLengthFt = 2 * ((memberWidth - 2 * cover) / 12 + (memberDepth - 2 * cover) / 12) + hookFt;
    const stirrupKg = ftToM(stirrupLengthFt * stirrupCountPerMember * memberNos) * kgPerM(stirrupDia);

    const baseKg = topKg + bottomKg + stirrupKg;

    return {
      title: item + " Steel",
      rows: finalRows(baseKg, [
        ["Top Bars", `${topBars} nos × ${memberNos} members`, `${topKg.toFixed(2)} kg`],
        ["Bottom Bars", `${bottomBars} nos × ${memberNos} members`, `${bottomKg.toFixed(2)} kg`],
        ["Stirrups", `${stirrupCountPerMember} nos/member`, `${stirrupKg.toFixed(2)} kg`],
        ["Cover Blocks", "Approx", `${Math.ceil(memberNos * (topBars + bottomBars))} nos`]
      ])
    };
  };

  const calculateColumn = () => {
    const clearHeight = Math.max(0, memberLength - 2 * inchToFt(cover));
    const lapExtraFt = 2.5;
    const cornerKg = ftToM((clearHeight + lapExtraFt) * cornerBars * memberNos) * kgPerM(cornerDia);
    const middleKg = ftToM((clearHeight + lapExtraFt) * middleBars * memberNos) * kgPerM(middleDia);

    const ringCountPerColumn = Math.floor((memberLength * 12) / stirrupSpacing) + 1;
    const hookFt = stirrupDia <= 8 ? 0.75 : 1;
    const ringLengthFt = 2 * ((memberWidth - 2 * cover) / 12 + (memberDepth - 2 * cover) / 12) + hookFt;
    const ringKg = ftToM(ringLengthFt * ringCountPerColumn * memberNos) * kgPerM(stirrupDia);

    const baseKg = cornerKg + middleKg + ringKg;

    return {
      title: "Column Steel",
      rows: finalRows(baseKg, [
        ["Corner Rods", `${cornerBars} nos × ${memberNos} columns`, `${cornerKg.toFixed(2)} kg`],
        ["Intermediate Rods", `${middleBars} nos × ${memberNos} columns`, `${middleKg.toFixed(2)} kg`],
        ["Rings/Ties", `${ringCountPerColumn} nos/column`, `${ringKg.toFixed(2)} kg`],
        ["Cover Blocks", "Approx", `${Math.ceil(memberNos * (cornerBars + middleBars) * 2)} nos`]
      ])
    };
  };

  const calculateWall = () => {
    const verticalBars = Math.floor((length * 12) / xSpacing) + 1;
    const horizontalBars = Math.floor((width * 12) / ySpacing) + 1;
    const verticalLengthFt = width + 1.5;
    const horizontalLengthFt = length + 1.5;

    const verticalKg = ftToM(verticalBars * verticalLengthFt) * kgPerM(xDia);
    const horizontalKg = ftToM(horizontalBars * horizontalLengthFt) * kgPerM(yDia);
    const baseKg = verticalKg + horizontalKg;

    return {
      title: "RCC Wall Steel",
      rows: finalRows(baseKg, [
        ["Vertical Bars", `${verticalBars} nos × ${verticalLengthFt.toFixed(2)} ft`, `${verticalKg.toFixed(2)} kg`],
        ["Horizontal Bars", `${horizontalBars} nos × ${horizontalLengthFt.toFixed(2)} ft`, `${horizontalKg.toFixed(2)} kg`],
        ["Cover Blocks", "Approx 1 per 6 sqft", `${Math.ceil((length * width) / 6)} nos`]
      ])
    };
  };

  const result =
    item === "Slab" || item === "Footing" ? calculateSlab() :
    item === "Beam" || item === "Lintel" ? calculateBeamOrLintel() :
    item === "Column" ? calculateColumn() :
    calculateWall();

  return (
    <div style={styles.page}>
      <h1>🔩 RCC Steel Calculator</h1>
      <div style={styles.note}>Formula: Steel kg/m = Dia²/162. Includes lap, crank/hooks, wastage, binding wire and cover blocks.</div>

      <div style={styles.card}>
        <div style={styles.row}>
          <div>
            <label style={styles.label}>RCC Item</label>
            <select value={item} onChange={(e) => setItem(e.target.value)} style={styles.input}>
              {["Slab", "Beam", "Column", "Lintel", "Footing", "RCC Wall"].map(x => <option key={x}>{x}</option>)}
            </select>
          </div>
          {input("Steel Rate ₹/kg", rate, setRate)}
          {input("Wastage %", wastage, setWastage)}
          {input("Binding Wire %", bindingWirePercent, setBindingWirePercent)}
        </div>
      </div>

      {(item === "Slab" || item === "Footing" || item === "RCC Wall") ? (
        <div style={styles.card}>
          <h2>{item} Inputs</h2>
          <div style={styles.row}>
            {input(item === "RCC Wall" ? "Wall Length (ft)" : "Length (ft)", length, setLength)}
            {input(item === "RCC Wall" ? "Wall Height (ft)" : "Width (ft)", width, setWidth)}
            {input("Thickness (inch)", thickness, setThickness)}
            {input("Clear Cover (inch)", cover, setCover)}
            {diaSelect(item === "RCC Wall" ? "Vertical Bar Dia" : "X Bar Dia", xDia, setXDia)}
            {diaSelect(item === "RCC Wall" ? "Horizontal Bar Dia" : "Y Bar Dia", yDia, setYDia)}
            {input(item === "RCC Wall" ? "Vertical Spacing (inch)" : "X Bar Spacing (inch)", xSpacing, setXSpacing)}
            {input(item === "RCC Wall" ? "Horizontal Spacing (inch)" : "Y Bar Spacing (inch)", ySpacing, setYSpacing)}
          </div>
        </div>
      ) : item === "Column" ? (
        <div style={styles.card}>
          <h2>Column Inputs</h2>
          <div style={styles.row}>
            {input("Column Height (ft)", memberLength, setMemberLength)}
            {input("No. of Columns", memberNos, setMemberNos)}
            {input("Column Width (inch)", memberWidth, setMemberWidth)}
            {input("Column Depth (inch)", memberDepth, setMemberDepth)}
            {input("Clear Cover (inch)", cover, setCover)}
            {diaSelect("Corner Rod Dia", cornerDia, setCornerDia)}
            {input("Corner Rod Nos", cornerBars, setCornerBars)}
            {diaSelect("Intermediate Rod Dia", middleDia, setMiddleDia)}
            {input("Intermediate Rod Nos", middleBars, setMiddleBars)}
            {diaSelect("Ring/Tie Dia", stirrupDia, setStirrupDia)}
            {input("Ring Spacing (inch)", stirrupSpacing, setStirrupSpacing)}
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <h2>{item} Inputs</h2>
          <div style={styles.row}>
            {input("Member Length (ft)", memberLength, setMemberLength)}
            {input("No. of Members", memberNos, setMemberNos)}
            {input("Width (inch)", memberWidth, setMemberWidth)}
            {input("Depth (inch)", memberDepth, setMemberDepth)}
            {input("Clear Cover (inch)", cover, setCover)}
            {diaSelect("Top Bar Dia", topDia, setTopDia)}
            {input("Top Bar Nos", topBars, setTopBars)}
            {diaSelect("Bottom Bar Dia", bottomDia, setBottomDia)}
            {input("Bottom Bar Nos", bottomBars, setBottomBars)}
            {diaSelect("Stirrup Dia", stirrupDia, setStirrupDia)}
            {input("Stirrup Spacing (inch)", stirrupSpacing, setStirrupSpacing)}
          </div>
        </div>
      )}

      <button style={styles.button} onClick={() => setGenerated(true)}>Generate</button>

      {generated && (
        <div style={styles.card}>
          <h2>{result.title} Result</h2>
          <table style={styles.table}>
            <thead>
              <tr><th style={styles.th}>Item</th><th style={styles.th}>Calculation</th><th style={styles.th}>Quantity</th></tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={i}><td style={styles.td}>{r[0]}</td><td style={styles.td}>{r[1]}</td><td style={styles.td}>{r[2]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
