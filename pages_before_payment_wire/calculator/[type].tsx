import { useRouter } from "next/router";
import { useState } from "react";

export default function CalculatorPage() {
  const router = useRouter();
  const { type } = router.query;

  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const result = Number(a || 0) * Number(b || 0);

  return (
    <div style={{ padding: 20 }}>
      <h2>Calculator: {type}</h2>

      <input placeholder="Value A" onChange={(e) => setA(e.target.value)} />
      <br /><br />
      <input placeholder="Value B" onChange={(e) => setB(e.target.value)} />

      <h3>Result: {result}</h3>
    </div>
  );
}