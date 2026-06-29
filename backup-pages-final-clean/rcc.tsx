import { useState } from "react";

export default function RCCCalculator() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");

  const l = Number(length);
  const w = Number(width);
  const t = Number(thickness);

  const volume = l * w * (t / 12); // ft³ approx

  const cementBags = volume * 0.35;
  const steelKg = volume * 80;

  return (
    <div style={{ padding: 20 }}>
      <h2>RCC Slab Calculator</h2>

      <input placeholder="Length (ft)" onChange={(e) => setLength(e.target.value)} />
      <br /><br />

      <input placeholder="Width (ft)" onChange={(e) => setWidth(e.target.value)} />
      <br /><br />

      <input placeholder="Thickness (inch)" onChange={(e) => setThickness(e.target.value)} />
      <br /><br />

      <h3>Volume: {volume.toFixed(2)} ft³</h3>
      <h3>Cement Bags: {cementBags.toFixed(2)}</h3>
      <h3>Steel: {steelKg.toFixed(2)} kg</h3>
    </div>
  );
}
