import { useRouter } from "next/router";

export default function BOQPage() {
  const router = useRouter();
  const { type } = router.query;

  const items = [
    { name: "Cement", qty: 100, rate: 420 },
    { name: "Steel", qty: 200, rate: 65 }
  ];

  const total = items.reduce((s, i) => s + i.qty * i.rate, 0);

  return (
    <div style={{ padding: 20 }}>
      <h2>BOQ: {type}</h2>

      {items.map((i, idx) => (
        <p key={idx}>
          {i.name} - {i.qty} × {i.rate}
        </p>
      ))}

      <h3>Total: ₹{total}</h3>
    </div>
  );
}