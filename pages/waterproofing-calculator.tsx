import React, { useEffect, useMemo, useState } from "react";

let MobileNav: any = null;
try {
  MobileNav = require("../components/MobileNav").default;
} catch {
  MobileNav = null;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000";

type MasterRate = {
  name: string;
  brand: string;
  rate: number;
  unit: string;
};

const locations = [
  "Terrace / Roof",
  "Toilet / Bathroom",
  "Balcony",
  "Sunken Slab",
  "Underground Water Tank",
  "Overhead Water Tank",
  "Basement",
  "Retaining Wall",
  "External Wall",
  "Kitchen / Wet Area",
  "Swimming Pool",
  "Damp Proof Course (DPC)"
];

const systems = [
  "Two Component Cementitious Waterproofing",
  "Polymer Modified Cementitious Coating",
  "Conventional Brick Bat Coba",
  "Cinder Filling Waterproof Treatment",
  "APP / SBS Bituminous Membrane",
  "Self Adhesive Membrane",
  "PU Liquid Membrane",
  "Acrylic Waterproof Coating",
  "Silicone / Elastomeric Coating",
  "Crystalline Waterproofing",
  "Epoxy Waterproof Coating",
  "Damp Proof Course Coating"
];

const defaultBrands = [
  "Admin Master / Any Approved Brand",
  "Dr. Fixit",
  "Fosroc",
  "Sika",
  "MYK Arment",
  "Asian Paints SmartCare",
  "Pidilite",
  "CICO",
  "STP",
  "Sunanda",
  "Ardex Endura",
  "Other"
];

const BENCHMARK_RATES: Record<string, { rate: number; unit: string }> = {
  primer: { rate: 180, unit: "L" },
  cementitious: { rate: 85, unit: "KG" },
  membrane: { rate: 2400, unit: "ROLL" },
  selfadhesive: { rate: 2200, unit: "ROLL" },
  puliquid: { rate: 260, unit: "KG" },
  acrylic: { rate: 160, unit: "KG" },
  silicone: { rate: 220, unit: "KG" },
  crystalline: { rate: 140, unit: "KG" },
  epoxy: { rate: 380, unit: "KG" },
  dpc: { rate: 110, unit: "KG" },
  cement: { rate: 380, unit: "BAG" },
  sand: { rate: 1400, unit: "M³" },
  brickbat: { rate: 1200, unit: "M³" },
  cinder: { rate: 950, unit: "M³" },
  compound: { rate: 120, unit: "KG" },
  labour: { rate: 65, unit: "M²" }
};

const n = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const fmt = (value: number, digits = 2) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value || 0);

function normalizeMasterRates(payload: any): MasterRate[] {
  const rows =
    payload?.materials ||
    payload?.data ||
    payload?.items ||
    payload ||
    [];

  if (!Array.isArray(rows)) return [];

  return rows.map((row: any) => ({
    name: String(
      row.itemName ||
      row.product_name ||
      row.productName ||
      row.materialName ||
      row.name ||
      ""
    ).toLowerCase(),
    brand: String(
      row.brand ||
      row.make ||
      row.manufacturer ||
      ""
    ).trim(),
    rate: n(
      row.rate ??
      row.price ??
      row.unitRate ??
      row.materialRate ??
      row.sellingPrice
    ),
    unit: String(row.unit || row.uom || "")
  }));
}

export default function WaterproofingCalculator() {
  const [location, setLocation] = useState("Terrace / Roof");
  const [system, setSystem] = useState("Two Component Cementitious Waterproofing");
  const [brand, setBrand] = useState("Admin Master / Any Approved Brand");
  const [customBrand, setCustomBrand] = useState("");

  const [useDirectArea, setUseDirectArea] = useState(true);
  const [directArea, setDirectArea] = useState(100);
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(0);
  const [numberOfUnits, setNumberOfUnits] = useState(1);
  const [deductionArea, setDeductionArea] = useState(0);
  const [wastage, setWastage] = useState(5);

  const [coats, setCoats] = useState(2);
  const [coverage, setCoverage] = useState(1.5);
  const [treatmentThickness, setTreatmentThickness] = useState(75);

  const [rollWidth, setRollWidth] = useState(1);
  const [rollLength, setRollLength] = useState(10);
  const [lapEfficiency, setLapEfficiency] = useState(85);

  const [manualLabourRate, setManualLabourRate] = useState(65);
  const [customRates, setCustomRates] = useState<Record<string, number>>({});
  const [gst, setGst] = useState(18);
  const [masterRates, setMasterRates] = useState<MasterRate[]>([]);
  const [rateStatus, setRateStatus] = useState("Loading Admin Master rates...");

  useEffect(() => {
    const loadRates = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/master/materials`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        const rows = normalizeMasterRates(payload);
        setMasterRates(rows);
        setRateStatus(
          rows.length
            ? `${rows.length} Admin Master rates loaded`
            : "No Admin Master rates found — Using Benchmark Rates"
        );
      } catch {
        setMasterRates([]);
        setRateStatus(
          "Admin Master rates unavailable — Market Benchmark rates applied"
        );
      }
    };
    loadRates();
  }, []);

  const availableBrands = useMemo(() => {
    const fromMaster = masterRates.map((row) => row.brand).filter(Boolean);
    return Array.from(new Set([...defaultBrands, ...fromMaster]));
  }, [masterRates]);

  const selectedBrand =
    brand === "Other" ? customBrand.trim() || "Other" : brand;

  const findRate = (benchmarkKey: string, ...terms: string[]) => {
    if (customRates[benchmarkKey] !== undefined) {
      return customRates[benchmarkKey];
    }

    const keywords = terms
      .map((term) => term.toLowerCase().trim())
      .filter(Boolean);

    const brandFilter =
      selectedBrand && selectedBrand !== "Admin Master / Any Approved Brand"
        ? selectedBrand.toLowerCase()
        : "";

    const brandRows = brandFilter
      ? masterRates.filter((row) =>
          row.brand.toLowerCase().includes(brandFilter)
        )
      : masterRates;

    const exact = brandRows.find((row) =>
      keywords.every((keyword) => row.name.includes(keyword))
    );
    if (exact?.rate) return exact.rate;

    const partial = brandRows.find((row) =>
      keywords.some((keyword) => row.name.includes(keyword))
    );
    if (partial?.rate) return partial.rate;

    const fallback = masterRates.find((row) =>
      keywords.some((keyword) => row.name.includes(keyword))
    );
    if (fallback?.rate) return fallback.rate;

    return BENCHMARK_RATES[benchmarkKey]?.rate || 0;
  };

  const handleCustomRateChange = (key: string, val: number) => {
    setCustomRates((prev) => ({ ...prev, [key]: val }));
  };

  const result = useMemo(() => {
    const unitCount = Math.max(1, n(numberOfUnits));

    let grossArea = useDirectArea
      ? n(directArea)
      : n(length) * n(width);

    const enclosedTreatment =
      /tank|basement|pool/i.test(location) &&
      n(height) > 0 &&
      !useDirectArea;

    if (enclosedTreatment) {
      const floorArea = n(length) * n(width);
      const internalWallArea = 2 * (n(length) + n(width)) * n(height);
      grossArea = floorArea + internalWallArea;
    }

    grossArea *= unitCount;
    const netArea = Math.max(0, grossArea - n(deductionArea));
    const billableArea = netArea * (1 + Math.max(0, n(wastage)) / 100);

    const systemText = system.toLowerCase();
    const membraneSystem = /membrane|app|sbs/.test(systemText);
    const conventionalSystem = /brick bat|cinder/.test(systemText);
    const liquidSystem = !membraneSystem && !conventionalSystem;

    const primerQty =
      liquidSystem || membraneSystem
        ? billableArea / 8
        : 0;

    const coatingQty = liquidSystem
      ? (billableArea * Math.max(1, n(coats))) / Math.max(0.01, n(coverage))
      : 0;

    const effectiveRollArea =
      n(rollWidth) *
      n(rollLength) *
      (Math.max(1, n(lapEfficiency)) / 100);

    const membraneRolls = membraneSystem
      ? Math.ceil(billableArea / Math.max(0.01, effectiveRollArea))
      : 0;

    const fillVolume = conventionalSystem
      ? billableArea * (n(treatmentThickness) / 1000)
      : 0;

    const cementKg = conventionalSystem ? fillVolume * 360 : 0;
    const cementBags = cementKg / 50;
    const sandM3 = conventionalSystem ? fillVolume * 0.75 : 0;
    const brickBatM3 = conventionalSystem ? fillVolume * 0.8 : 0;
    const compoundKg = conventionalSystem ? cementKg * 0.02 : 0;

    const rows = [];

    if (primerQty > 0.001) {
      rows.push({
        key: "primer",
        item: "Waterproofing Primer",
        make: selectedBrand,
        quantity: primerQty,
        unit: "L",
        rate: findRate("primer", "waterproof", "primer")
      });
    }

    if (liquidSystem && coatingQty > 0.001) {
      const keyName = systemText.includes("pu")
        ? "puliquid"
        : systemText.includes("acrylic")
        ? "acrylic"
        : systemText.includes("crystalline")
        ? "crystalline"
        : "cementitious";

      rows.push({
        key: keyName,
        item: system,
        make: selectedBrand,
        quantity: coatingQty,
        unit: "KG / L",
        rate: findRate(keyName, "waterproof", "coating")
      });
    }

    if (membraneSystem && membraneRolls > 0) {
      rows.push({
        key: "membrane",
        item: system,
        make: selectedBrand,
        quantity: membraneRolls,
        unit: "ROLL",
        rate: findRate("membrane", "membrane", "app", "sbs")
      });
    }

    if (conventionalSystem) {
      if (cementBags > 0) {
        rows.push({
          key: "cement",
          item: "PPC Cement (IS 1489)",
          make: "Approved Cement Brand",
          quantity: cementBags,
          unit: "BAG",
          rate: findRate("cement", "cement")
        });
      }
      if (sandM3 > 0) {
        rows.push({
          key: "sand",
          item: "Screened River Sand / M-Sand",
          make: "Approved Source",
          quantity: sandM3,
          unit: "M³",
          rate: findRate("sand", "sand")
        });
      }
      if (brickBatM3 > 0) {
        rows.push({
          key: "brickbat",
          item: /cinder/i.test(system) ? "Cinder Aggregates" : "Well-Burnt Brick Bats",
          make: "Approved Source",
          quantity: brickBatM3,
          unit: "M³",
          rate: /cinder/i.test(system) ? findRate("cinder", "cinder") : findRate("brickbat", "brick")
        });
      }
      if (compoundKg > 0) {
        rows.push({
          key: "compound",
          item: "Integral Waterproofing Compound (IS 2645)",
          make: selectedBrand,
          quantity: compoundKg,
          unit: "KG",
          rate: findRate("compound", "compound", "waterproofing")
        });
      }
    }

    const appliedLabourRate = Math.max(0, n(manualLabourRate));
    const materialCost = rows.reduce(
      (sum, row) => sum + row.quantity * row.rate,
      0
    );
    const labourCost = billableArea * appliedLabourRate;
    const subtotal = materialCost + labourCost;
    const gstAmount = subtotal * (Math.max(0, n(gst)) / 100);
    const grandTotal = subtotal + gstAmount;

    return {
      grossArea,
      netArea,
      billableArea,
      primerQty,
      coatingQty,
      membraneRolls,
      fillVolume,
      cementBags,
      sandM3,
      brickBatM3,
      compoundKg,
      rows,
      appliedLabourRate,
      materialCost,
      labourCost,
      subtotal,
      gstAmount,
      grandTotal,
      rateSqM: billableArea > 0 ? grandTotal / billableArea : 0,
      rateSqFt: billableArea > 0 ? grandTotal / (billableArea * 10.7639) : 0
    };
  }, [
    numberOfUnits,
    useDirectArea,
    directArea,
    length,
    width,
    location,
    height,
    deductionArea,
    wastage,
    system,
    coats,
    coverage,
    rollWidth,
    rollLength,
    lapEfficiency,
    treatmentThickness,
    selectedBrand,
    manualLabourRate,
    customRates,
    gst,
    masterRates
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Item", "Make/Brand", "Quantity", "Unit", "Rate (Rs)", "Amount (Rs)"].join(","),
        ...result.rows.map((r) =>
          [
            `"${r.item}"`,
            `"${r.make}"`,
            r.quantity.toFixed(2),
            r.unit,
            r.rate.toFixed(2),
            (r.quantity * r.rate).toFixed(2)
          ].join(",")
        ),
        ["Labour Cost", "-", "-", "-", "-", result.labourCost.toFixed(2)],
        ["Subtotal", "-", "-", "-", "-", result.subtotal.toFixed(2)],
        ["GST (18%)", "-", "-", "-", "-", result.gstAmount.toFixed(2)],
        ["Grand Total", "-", "-", "-", "-", result.grandTotal.toFixed(2)]
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Waterproofing_BOQ_Estimate.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Water Proofing BOQ Estimate",
        text: `BuildMitra Waterproofing BOQ Estimate for ${location}: Billable Area = ${fmt(result.billableArea)} m², Grand Total = ₹${fmt(result.grandTotal)}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      alert(`Waterproofing BOQ Estimate:\nBillable Area: ${fmt(result.billableArea)} m²\nGrand Total: ₹${fmt(result.grandTotal)}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5", padding: "12px" }}>
      <div className="bm-page-container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {MobileNav ? <MobileNav currentModule="buyer" title="Waterproofing BOQ" /> : null}

        {/* Brand Header Banner */}
        <div className="bm-card" style={{ backgroundColor: "#800020", color: "white", padding: "20px", borderRadius: "12px", marginBottom: "16px", boxShadow: "0 4px 15px rgba(128,0,32,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9, fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "3px 8px", borderRadius: "4px" }}>
                BUILDMITRA CALCULATOR & BOQ SUITE
              </span>
              <h1 style={{ margin: "6px 0 4px", fontSize: "22px", fontWeight: 800 }}>
                💧 Waterproofing BOQ & Quantity Estimator
              </h1>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>
                IS 3067, IS 1346 & IS 15898 compliant material quantity, labour, and cost estimation.
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 14px", borderRadius: "8px", fontSize: "11px" }}>
              Status: <strong>{rateStatus}</strong>
            </div>
          </div>
        </div>

        {/* Section 01: Project & Treatment Inputs */}
        <div className="bm-card" style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b", marginBottom: "14px", borderBottom: "2px solid #e2e8f0", paddingBottom: "6px" }}>
            01. Project & Treatment Inputs
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "12px" }}>
            <div className="bm-input-group">
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>Location / Area Type</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="bm-input-group">
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>Waterproofing System</label>
              <select value={system} onChange={(e) => setSystem(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                {systems.map((sys) => (
                  <option key={sys} value={sys}>{sys}</option>
                ))}
              </select>
            </div>

            <div className="bm-input-group">
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>Material Make / Brand</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold", cursor: "pointer", color: "#334155" }}>
              <input
                type="checkbox"
                checked={useDirectArea}
                onChange={(e) => setUseDirectArea(e.target.checked)}
                style={{ marginRight: "6px" }}
              />
              Enter treatment area directly (m²)
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "14px" }}>
            {useDirectArea ? (
              <div className="bm-input-group">
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>Direct Area (m²)</label>
                <input
                  type="number"
                  value={directArea}
                  onChange={(e) => setDirectArea(n(e.target.value))}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>
            ) : (
              <>
                <div className="bm-input-group">
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>Length (m)</label>
                  <input type="number" value={length} onChange={(e) => setLength(n(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                <div className="bm-input-group">
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>Width (m)</label>
                  <input type="number" value={width} onChange={(e) => setWidth(n(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                {/tank|basement|pool/i.test(location) && (
                  <div className="bm-input-group">
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>Depth / Height (m)</label>
                    <input type="number" value={height} onChange={(e) => setHeight(n(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                  </div>
                )}
              </>
            )}

            <div className="bm-input-group">
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>Number of Units</label>
              <input type="number" value={numberOfUnits} onChange={(e) => setNumberOfUnits(n(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
            </div>

            <div className="bm-input-group">
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>Deduction Area (m²)</label>
              <input type="number" value={deductionArea} onChange={(e) => setDeductionArea(n(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
            </div>

            <div className="bm-input-group">
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>Wastage (%)</label>
              <input type="number" value={wastage} onChange={(e) => setWastage(n(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
            </div>
          </div>
        </div>

        {/* HIGH-IMPACT CONSOLIDATED STAT CARDS (COLOUR BOXES) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", marginBottom: "16px" }}>
          {/* Card 1: Billable Area */}
          <div style={{ background: "linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%)", border: "2px solid #3182ce", borderRadius: "12px", padding: "14px", boxShadow: "0 4px 10px rgba(49,130,206,0.1)" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#2c5282", textTransform: "uppercase", letterSpacing: "0.5px" }}>📐 BILLABLE AREA</span>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#2b6cb0", marginTop: "4px" }}>{fmt(result.billableArea)} m²</div>
            <small style={{ fontSize: "10px", color: "#4a5568" }}>Net: {fmt(result.netArea)} m² (+{wastage}% Wastage)</small>
          </div>

          {/* Card 2: Material Cost */}
          <div style={{ background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)", border: "2px solid #805ad5", borderRadius: "12px", padding: "14px", boxShadow: "0 4px 10px rgba(128,90,213,0.1)" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#553c9a", textTransform: "uppercase", letterSpacing: "0.5px" }}>📦 MATERIAL COST</span>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#6b46c1", marginTop: "4px" }}>₹{fmt(result.materialCost)}</div>
            <small style={{ fontSize: "10px", color: "#4a5568" }}>{result.rows.length} Material items estimated</small>
          </div>

          {/* Card 3: Labour Cost */}
          <div style={{ background: "linear-gradient(135deg, #fffaf0 0%, #feebc8 100%)", border: "2px solid #dd6b20", borderRadius: "12px", padding: "14px", boxShadow: "0 4px 10px rgba(221,107,32,0.1)" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#9c4221", textTransform: "uppercase", letterSpacing: "0.5px" }}>👷 LABOUR COST</span>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#c05621", marginTop: "4px" }}>₹{fmt(result.labourCost)}</div>
            <small style={{ fontSize: "10px", color: "#4a5568" }}>Rate: ₹{result.appliedLabourRate}/m²</small>
          </div>

          {/* Card 4: Subtotal & GST */}
          <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "2px solid #16a34a", borderRadius: "12px", padding: "14px", boxShadow: "0 4px 10px rgba(22,163,74,0.1)" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>📑 SUBTOTAL + GST ({gst}%)</span>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#15803d", marginTop: "4px" }}>₹{fmt(result.subtotal)}</div>
            <small style={{ fontSize: "10px", color: "#4a5568" }}>GST Amount: ₹{fmt(result.gstAmount)}</small>
          </div>

          {/* Card 5: Consolidated GRAND TOTAL */}
          <div style={{ background: "linear-gradient(135deg, #800020 0%, #4a0012 100%)", border: "2px solid #ffd700", borderRadius: "12px", padding: "14px", color: "#ffffff", boxShadow: "0 4px 15px rgba(128,0,32,0.25)", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#ffd700" }}>
                  💰 CONSOLIDATED GRAND TOTAL ESTIMATE
                </span>
                <div style={{ fontSize: "26px", fontWeight: 900, marginTop: "2px" }}>₹{fmt(result.grandTotal)}</div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ background: "rgba(255,255,255,0.2)", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                  ₹{fmt(result.rateSqM)} / m²
                </span>
                <span style={{ background: "rgba(255,255,255,0.2)", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                  ₹{fmt(result.rateSqFt)} / sq.ft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 02: Material Estimate & Cost Breakdown */}
        <div className="bm-card" style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b", marginBottom: "14px", borderBottom: "2px solid #e2e8f0", paddingBottom: "6px" }}>
            02. Material Estimate & Detailed Breakdown
          </div>

          <div style={{ overflowX: "auto", marginBottom: "14px" }}>
            <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "10px" }}>Material Item</th>
                  <th style={{ padding: "10px" }}>Make / Brand</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Quantity</th>
                  <th style={{ padding: "10px" }}>Unit</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Rate (₹)</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px", fontWeight: 600 }}>{row.item}</td>
                    <td style={{ padding: "10px", color: "#64748b" }}>{row.make}</td>
                    <td style={{ padding: "10px", textAlign: "right", fontWeight: 700 }}>{fmt(row.quantity)}</td>
                    <td style={{ padding: "10px" }}>{row.unit}</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <input
                        type="number"
                        value={row.rate}
                        onChange={(e) => handleCustomRateChange(row.key, n(e.target.value))}
                        style={{ width: "85px", padding: "4px 6px", fontSize: "11px", textAlign: "right", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                      />
                    </td>
                    <td style={{ padding: "10px", textAlign: "right", fontWeight: 800, color: "#800020" }}>
                      ₹{fmt(row.quantity * row.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 03: Application Guidance */}
        <div className="bm-card" style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b", marginBottom: "10px" }}>
            03. IS Code Application Guidance
          </div>
          <ul style={{ fontSize: "12px", color: "#475569", lineHeight: "1.6", margin: 0, paddingLeft: "20px" }}>
            <li>Clean and prepare substrate thoroughly as per IS 3067.</li>
            <li>Repair cracks and pipe penetrations with polymer modified mortar.</li>
            <li>Apply primer to recommended coverage rate before main coat.</li>
            <li>Apply coats uniformly, allowing recommended curing interval between coats.</li>
            <li>Provide protective screed/mortar layer over membrane before ponding test.</li>
            <li>Perform 48–72 hrs water ponding leak test before final tile/finish application.</li>
          </ul>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
            <button onClick={handlePrint} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#3b82f6", color: "white", fontWeight: 700, cursor: "pointer" }}>
              🖨️ Print / Download PDF
            </button>
            <button onClick={handleExportCSV} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#059669", color: "white", fontWeight: 700, cursor: "pointer" }}>
              📊 Export CSV
            </button>
            <button onClick={handleShare} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#800020", color: "white", fontWeight: 700, cursor: "pointer" }}>
              📱 Share Estimate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
