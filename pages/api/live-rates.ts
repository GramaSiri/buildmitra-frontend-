import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set Redis / CDN Cache-Control headers for high throughput (Cache for 5 mins, S-Maxage 10 mins)
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  const rates = [
    { id: "MAT-CEM-01", name: "UltraTech OPC 53 Grade Cement", category: "Cement", unit: "50 kg Bag", currentRate: 385, prevRate: 378, location: "Bengaluru Peenya / Whitefield" },
    { id: "MAT-STL-01", name: "Tata Tiscon TMT Rebar Fe500D (12mm)", category: "Steel", unit: "Ton", currentRate: 64500, prevRate: 65200, location: "KR Market / Electronic City" },
    { id: "MAT-SND-01", name: "Manufactured Sand (M-Sand) Double Washed", category: "Aggregates", unit: "Cft", currentRate: 48, prevRate: 46, location: "Kanakapura Road" },
    { id: "MAT-RMC-01", name: "Ready Mix Concrete (RMC M25 Grade)", category: "Cement", unit: "Cum", currentRate: 4600, prevRate: 4550, location: "Bannerghatta Road" }
  ];

  return res.status(200).json({
    status: "success",
    timestamp: new Date().toISOString(),
    city: "Bengaluru",
    cached: true,
    data: rates
  });
}
