import type { NextApiRequest, NextApiResponse } from "next";
import { getApiUrl } from "../../../utils/apiConfig";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  const { category, subCategory, search } = req.query;
  const params = new URLSearchParams();
  if (typeof category === "string") params.set("category", category);
  if (typeof subCategory === "string") params.set("subCategory", subCategory);
  if (typeof search === "string") params.set("search", search);

  try {
    const backendUrl = getApiUrl(`/api/bulk-buying/catalog-items?${params.toString()}`);
    const backendRes = await fetch(backendUrl);
    if (backendRes.ok) {
      const data = await backendRes.json();
      return res.status(200).json(data);
    }
  } catch (err) {
    // Graceful fallback to canonical catalog
  }

  const canonicalCatalog = [
    { id: "MAT-CEM-01", masterItemCode: "MAT-CEM-01", itemName: "UltraTech PPC Cement (50kg Bag)", name: "UltraTech PPC Cement (50kg Bag)", category: "CEMENT", subCategory: "Structural Cement", brand: "UltraTech Cement", grade: "PPC (IS 1489 Part 1)", specification: "50kg HDPE Bag • Fly Ash Based", unit: "BAGS", benchmarkRate: 365, gstPercent: 28 },
    { id: "MAT-CEM-02", masterItemCode: "MAT-CEM-02", itemName: "UltraTech Super OPC 53 Grade", name: "UltraTech Super OPC 53 Grade Cement", category: "CEMENT", subCategory: "High Strength", brand: "UltraTech Cement", grade: "OPC 53 (IS 269)", specification: "50kg Bag • 28-Day Strength 53+ MPa", unit: "BAGS", benchmarkRate: 385, gstPercent: 28 },
    { id: "MAT-CEM-03", masterItemCode: "MAT-CEM-03", itemName: "ACC Suraksha Power Cement", name: "ACC Suraksha Power Cement (50kg Bag)", category: "CEMENT", subCategory: "Water-Resistant", brand: "ACC Cement", grade: "PPC Super", specification: "Water-repellent active micro-particles", unit: "BAGS", benchmarkRate: 360, gstPercent: 28 },
    { id: "MAT-CEM-04", masterItemCode: "MAT-CEM-04", itemName: "Birla Super 53 Grade Cement", name: "Birla Super 53 Grade Cement", category: "CEMENT", subCategory: "High Strength", brand: "Birla Super", grade: "OPC 53 (IS 269)", specification: "High early setting strength for slabs", unit: "BAGS", benchmarkRate: 375, gstPercent: 28 },
    { id: "MAT-STL-01", masterItemCode: "MAT-STL-01", itemName: "12mm TMT Rebar (Fe 550D)", name: "12mm TMT Rebar (Beam & Column)", category: "TMT STEEL", subCategory: "Primary Rebars", brand: "Tata Tiscon", grade: "Fe 550D Seismic (IS 1786)", specification: "High elongation ductility for earthquake zones", unit: "TONNES", benchmarkRate: 58500, gstPercent: 18 },
    { id: "MAT-STL-02", masterItemCode: "MAT-STL-02", itemName: "10mm TMT Rebar (Fe 550D)", name: "10mm TMT Rebar (Slab & Lintel)", category: "TMT STEEL", subCategory: "Primary Rebars", brand: "JSW Neosteel", grade: "Fe 550D (IS 1786)", specification: "Virgin billet rolled with corrosion protection", unit: "TONNES", benchmarkRate: 58200, gstPercent: 18 },
    { id: "MAT-STL-03", masterItemCode: "MAT-STL-03", itemName: "16mm TMT Rebar (Heavy Column)", name: "16mm TMT Rebar (Heavy Structural)", category: "TMT STEEL", subCategory: "Primary Rebars", brand: "Jindal Panther", grade: "Fe 550D (IS 1786)", specification: "High tensile yield strength 550 N/mm²", unit: "TONNES", benchmarkRate: 58000, gstPercent: 18 },
    { id: "MAT-STL-04", masterItemCode: "MAT-STL-04", itemName: "8mm TMT Rebar (Stirrups & Rings)", name: "8mm TMT Rebar (Binding & Stirrups)", category: "TMT STEEL", subCategory: "Secondary Rebars", brand: "Tata Tiscon", grade: "Fe 550D", specification: "Ring & stirrup ductile bending grade", unit: "TONNES", benchmarkRate: 59000, gstPercent: 18 },
    { id: "MAT-SND-01", masterItemCode: "MAT-SND-01", itemName: "Triple-Washed M-Sand", name: "Triple-Washed M-Sand (Zone II Concrete)", category: "SAND", subCategory: "Manufactured Sand", brand: "Quarry Direct", grade: "Zone II (IS 383)", specification: "Double hydro-cyclone washed silt < 3%", unit: "CFT", benchmarkRate: 48, gstPercent: 18 },
    { id: "MAT-SND-02", masterItemCode: "MAT-SND-02", itemName: "Double-Washed P-Sand", name: "Double-Washed P-Sand (Plastering)", category: "SAND", subCategory: "Plastering Sand", brand: "Quarry Direct", grade: "Zone IV Ultra-Fine", specification: "Sub-150 micron fine washed plaster sand", unit: "CFT", benchmarkRate: 52, gstPercent: 18 },
    { id: "MAT-AGG-01", masterItemCode: "MAT-AGG-01", itemName: "20mm Blue Metal Jelly Aggregate", name: "20mm Coarse Granite Blue Metal Jelly", category: "AGGREGATES", subCategory: "Coarse Aggregate", brand: "Quarry Direct", grade: "Hard Granite Crushed", specification: "Flakiness index < 15%, angular crushed", unit: "CFT", benchmarkRate: 38, gstPercent: 18 },
    { id: "MAT-AGG-02", masterItemCode: "MAT-AGG-02", itemName: "12mm Blue Metal Jelly Aggregate", name: "12mm Coarse Granite Blue Metal Jelly", category: "AGGREGATES", subCategory: "Coarse Aggregate", brand: "Quarry Direct", grade: "Hard Granite Crushed", specification: "Graded for slab and beam concrete mixes", unit: "CFT", benchmarkRate: 40, gstPercent: 18 },
    { id: "MAT-BLK-01", masterItemCode: "MAT-BLK-01", itemName: "6-Inch Concrete Solid Blocks", name: "6-Inch Concrete Solid Blocks (400x200x150)", category: "BLOCKS", subCategory: "Solid Masonry", brand: "APCO Blocks", grade: "Heavy Duty High-Density", specification: "Compressive strength > 5.0 N/mm²", unit: "LOADS", benchmarkRate: 42, gstPercent: 18 },
    { id: "MAT-BLK-02", masterItemCode: "MAT-BLK-02", itemName: "4-Inch Concrete Partition Blocks", name: "4-Inch Concrete Solid Blocks (400x200x100)", category: "BLOCKS", subCategory: "Partition Masonry", brand: "APCO Blocks", grade: "Standard High-Density", specification: "Light partition wall masonry units", unit: "LOADS", benchmarkRate: 32, gstPercent: 18 },
    { id: "MAT-BLK-03", masterItemCode: "MAT-BLK-03", itemName: "8-Inch AAC Lightweight Blocks", name: "8-Inch AAC Lightweight Blocks (600x200x200)", category: "BLOCKS", subCategory: "Autoclaved Aerated", brand: "Sobha Concrete", grade: "Grade 1 (IS 2185 Part 3)", specification: "Thermal insulation density 550-650 kg/m³", unit: "LOADS", benchmarkRate: 75, gstPercent: 18 },
    { id: "MAT-RMC-01", masterItemCode: "MAT-RMC-01", itemName: "M25 Grade ReadyMix Concrete (RMC)", name: "M25 ReadyMix Concrete (RMC Pump Mix)", category: "RMC", subCategory: "ReadyMix Concrete", brand: "UltraTech RMC", grade: "M25 (28-day 25 MPa)", specification: "Transit mixer pump mix with slump 120±25mm", unit: "CUM", benchmarkRate: 4200, gstPercent: 18 }
  ];

  let filtered = canonicalCatalog;
  if (typeof category === "string" && category) {
    filtered = filtered.filter(i => i.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (typeof search === "string" && search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(i => i.name.toLowerCase().includes(s) || i.brand.toLowerCase().includes(s) || i.category.toLowerCase().includes(s));
  }

  return res.status(200).json({
    success: true,
    count: filtered.length,
    categories: Array.from(new Set(canonicalCatalog.map(i => i.category))).sort(),
    catalog: filtered,
    items: filtered
  });
}

