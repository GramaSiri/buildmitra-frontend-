import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MarketRateTrend from "../components/ui/MarketRateTrend";

interface CalcItem {
  id: string;
  name: string;
  icon: string;
  category: "Concrete & RCC" | "Masonry & Steel" | "Finishing & Plumbing" | "Structural Elements";
  unitBadge: "Cum" | "Cft" | "Sft" | "Nos" | "Points" | "Kg" | "Liters";
  description: string;
}

const ALL_19_CALCULATORS: CalcItem[] = [
  { id: 'concrete-calculator', name: 'Concrete Estimator', icon: '🧱', category: 'Concrete & RCC', unitBadge: 'Cum', description: 'Mix ratios M7.5-M30, cement bags, sand, aggregate.' },
  { id: 'steel-calculator', name: 'Steel Rebar Weight & Cost', icon: '🔩', category: 'Masonry & Steel', unitBadge: 'Kg', description: 'Bar diameters 8mm-32mm, cutting length, bend deductions.' },
  { id: 'tile-calculator', name: 'Tile & Flooring Estimator', icon: '📐', category: 'Finishing & Plumbing', unitBadge: 'Sft', description: 'Floor/wall tile count, wastage %, adhesive & grout.' },
  { id: 'paint-calculator', name: 'Paint & Primer Calculator', icon: '🎨', category: 'Finishing & Plumbing', unitBadge: 'Sft', description: 'Wall surface area, double coat paint liters, putty requirement.' },
  { id: 'plaster-calculator', name: 'Plastering Calculator', icon: '🧱', category: 'Finishing & Plumbing', unitBadge: 'Sft', description: '12mm internal & 20mm external 1:4 and 1:6 cement-sand mortar.' },
  { id: 'brick-work-calculator', name: 'Brickwork & AAC Blockwork', icon: '🧱', category: 'Masonry & Steel', unitBadge: 'Nos', description: 'Red bricks, AAC blocks, solid block count & mortar volume.' },
  { id: 'rcc-slab-calculator', name: 'RCC Slab & Beam', icon: '🏗️', category: 'Concrete & RCC', unitBadge: 'Cum', description: 'Slab thickness, main & distribution steel rebar weight.' },
  { id: 'rcc-steel-building-calculator', name: 'RCC + Steel + Blockwork', icon: '🏢', category: 'Concrete & RCC', unitBadge: 'Sft', description: 'Full building superstructure composite material cost breakdown.' },
  { id: 'column-calculator', name: 'Column Estimator', icon: '📏', category: 'Structural Elements', unitBadge: 'Cum', description: 'Vertical rebar, lateral stirrup ties, concrete volume.' },
  { id: 'beam-calculator', name: 'Beam Estimator', icon: '📐', category: 'Structural Elements', unitBadge: 'Cum', description: 'Top/bottom main bars, stirrups spacing, concrete.' },
  { id: 'footing-calculator', name: 'Footing Estimator', icon: '🔽', category: 'Structural Elements', unitBadge: 'Cum', description: 'Trapezoidal & isolated footing concrete & mesh steel.' },
  { id: 'staircase-calculator', name: 'Staircase Estimator', icon: '🪜', category: 'Structural Elements', unitBadge: 'Cum', description: 'Flight waist slab concrete, riser/tread step count.' },
  { id: 'water-tank-calculator', name: 'Water Sump Tank', icon: '💧', category: 'Finishing & Plumbing', unitBadge: 'Liters', description: 'UG sump capacity, slab/wall RCC volume & steel.' },
  { id: 'septic-tank-calculator', name: 'Septic Tank Design', icon: '🪠', category: 'Finishing & Plumbing', unitBadge: 'Liters', description: 'User load capacity, baffle wall, soak pit dimensions.' },
  { id: 'retaining-wall-calculator', name: 'Retaining Wall', icon: '🧱', category: 'Structural Elements', unitBadge: 'Cum', description: 'Stem, heel, toe slab concrete & rebar schedule.' },
  { id: 'roof-truss-calculator', name: 'Roof Truss & Sheet', icon: '🏠', category: 'Masonry & Steel', unitBadge: 'Sft', description: 'Tubular steel purlins, rafters & sheet coverage area.' },
  { id: 'pile-foundation-calculator', name: 'Pile Foundation', icon: '⛏️', category: 'Structural Elements', unitBadge: 'Cum', description: 'Pile bore diameter, depth, reinforcement cage weight.' },
  { id: 'lintel-calculator', name: 'Lintel & Sunshade', icon: '📏', category: 'Structural Elements', unitBadge: 'Cum', description: 'Lintel length, bearing width, rebar schedule.' },
  { id: 'arch-calculator', name: 'Arch & Patio Masonry', icon: '⛩️', category: 'Masonry & Steel', unitBadge: 'Sft', description: 'Curved brickwork arc length, radius, mortar volume.' }
];

export default function CalculatorsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Concrete & RCC", "Masonry & Steel", "Finishing & Plumbing", "Structural Elements"];

  const filteredCalcs = ALL_19_CALCULATORS.filter(c => {
    const matchesCat = selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>19 Civil Construction Calculators | BuildMitra</title>
        <meta name="description" content="19 Industry-standard technical calculators for Concrete, Steel rebar, Brickwork, Plaster, Tile, RCC Slab, Columns, Beams, Footings, and Tanks." />
      </Head>

      <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "Inter, sans-serif" }}>
        
        {/* HEADER BAR */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "16px", padding: "28px 32px", color: "#ffffff", marginBottom: "28px", boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ background: "rgba(34, 197, 94, 0.2)", border: "1px solid rgba(34, 197, 94, 0.4)", color: "#4ade80", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800" }}>
                19 VERIFIED IS-CODE ENGINE TOOLS
              </span>
              <h1 style={{ margin: "10px 0 0 0", fontSize: "28px", fontWeight: "900" }}>
                📐 Technical Construction Calculators (19)
              </h1>
              <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
                Accurate material, rebar, and volume estimation engines grouped by units (Cum, Cft, Sft, Nos, Points).
              </p>
            </div>

            <button
              onClick={() => router.push("/reports")}
              style={{ background: "#2563eb", color: "#ffffff", border: 0, borderRadius: "10px", padding: "12px 20px", fontWeight: "800", fontSize: "14px", cursor: "pointer" }}
            >
              📑 Export All Estimations Report →
            </button>
          </div>
        </div>

        <MarketRateTrend />

        {/* CONTROLS BAR */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "16px 20px", marginBottom: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="🔍 Search calculator tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: "240px", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: 0,
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: selectedCategory === cat ? "#0f172a" : "#f1f5f9",
                  color: selectedCategory === cat ? "#ffffff" : "#475569"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* CALCULATORS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {filteredCalcs.map((calc) => (
            <div
              key={calc.id}
              onClick={() => router.push(`/${calc.id}`)}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "32px" }}>{calc.icon}</span>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "900",
                    background: calc.unitBadge === "Cum" ? "#dbeafe" : calc.unitBadge === "Cft" ? "#f3e8ff" : calc.unitBadge === "Sft" ? "#dcfce7" : calc.unitBadge === "Kg" ? "#fee2e2" : "#fef3c7",
                    color: calc.unitBadge === "Cum" ? "#1d4ed8" : calc.unitBadge === "Cft" ? "#7e22ce" : calc.unitBadge === "Sft" ? "#15803d" : calc.unitBadge === "Kg" ? "#b91c1c" : "#b45309"
                  }}>
                    UNIT: {calc.unitBadge}
                  </span>
                </div>

                <h3 style={{ margin: "0 0 6px 0", fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                  {calc.name}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                  {calc.description}
                </p>
              </div>

              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700" }}>Open Calculator</span>
                <span style={{ color: "#2563eb", fontWeight: "900" }}>→</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
