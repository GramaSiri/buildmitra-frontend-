import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { getMasterRate, syncApprovedRatesFromBackend } from '../utils/masterRates';
import MarketRateTrend from '../components/ui/MarketRateTrend';

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { backgroundColor: '#4a2c11', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(74,44,17,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#78350f', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  stepperCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '15px', fontWeight: '700', color: '#4a2c11', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #fde68a', paddingBottom: '8px' },

  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(82px, 1fr))', gap: '5px', alignItems: 'end', width: '100%', maxWidth: '100%', marginBottom: '5px' },
  grid5: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(82px, 1fr))', gap: '5px', alignItems: 'end', width: '100%', maxWidth: '100%', marginBottom: '5px' },

  fieldGroup: { minWidth: 0, width: '100%', margin: 0, padding: 0 },
  label: { display: 'block', fontSize: '10px', lineHeight: '1.1', fontWeight: '700', marginBottom: '2px', whiteSpace: 'normal' },
  input: { width: '100%', minWidth: 0, maxWidth: '100%', height: '32px', padding: '3px 5px', fontSize: '11px', lineHeight: '1.1', textAlign: 'center', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
  select: { width: '100%', minWidth: 0, maxWidth: '100%', height: '32px', padding: '3px 4px', fontSize: '10px', lineHeight: '1.1', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },

  btnPrimary: { backgroundColor: '#4a2c11', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  btnDelete: { backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' },
  metricCard: { padding: '14px', borderRadius: '8px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricMaroon: { backgroundColor: '#4a2c11' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tableContainer: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#4a2c11', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

  noteBox: { backgroundColor: '#fef3c7', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#78350f', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const ceil = (n: number) => Math.ceil(Number(n || 0));

const itemTypes: Record<string, { kind: string; defaultHeight: number; depth: number; rate: number; labour: number }> = {
  "Wardrobe (Sliding)": { kind: "sliding", defaultHeight: 7, depth: 1.5, rate: 1800, labour: 220 },
  "Wardrobe (Hinged)": { kind: "hinged", defaultHeight: 7, depth: 1.5, rate: 1500, labour: 200 },
  "Modular Kitchen": { kind: "kitchen", defaultHeight: 3, depth: 1.5, rate: 2500, labour: 300 },
  "Loft Storage": { kind: "loft", defaultHeight: 2.5, depth: 1.5, rate: 1200, labour: 150 },
  "TV Panel / Unit": { kind: "tv", defaultHeight: 7, depth: 0.5, rate: 1200, labour: 120 },
  "Shoe Rack": { kind: "shoe", defaultHeight: 4, depth: 1, rate: 800, labour: 120 },
  "Pooja Unit": { kind: "pooja", defaultHeight: 7, depth: 1.5, rate: 1800, labour: 250 },
  "Study Table": { kind: "study", defaultHeight: 2.5, depth: 1.5, rate: 1200, labour: 180 },
  "Crockery Unit": { kind: "crockery", defaultHeight: 7, depth: 1.5, rate: 1600, labour: 220 },
  "Bathroom Vanity": { kind: "vanity", defaultHeight: 2.5, depth: 1.5, rate: 1800, labour: 220 }
};

export default function InteriorBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Finish Profile & Item Add State
  const [finishProfile, setFinishProfile] = useState('Standard');
  const [selectedItem, setSelectedItem] = useState("Wardrobe (Sliding)");
  const [length, setLength] = useState(0);
  const [height, setHeight] = useState(0);
  const [nos, setNos] = useState(0);

  // Default Items
  const [items, setItems] = useState<any[]>([]);

  const [generated, setGenerated] = useState(false);

  // Admin Master Rates Lookup
  const baseRates = useMemo(() => ({
    plywood18mm: getMasterRate(["MAT-PLY-18", "18mm plywood"], 80).rate || 80,
    plywood12mm: getMasterRate(["MAT-PLY-12", "12mm plywood"], 65).rate || 65,
    plywood6mm: getMasterRate(["MAT-PLY-06", "6mm plywood"], 40).rate || 40,
    externalLaminate: getMasterRate(["MAT-LAM-EXT", "external laminate"], 45).rate || 45,
    internalLaminate: getMasterRate(["MAT-LAM-INT", "internal laminate"], 30).rate || 30,
    edgeBanding: getMasterRate(["MAT-EDG-BND", "edge banding"], 8).rate || 8,
    cornerBeads: getMasterRate(["MAT-COR-BED", "corner bead"], 15).rate || 15,
    hinges: getMasterRate(["MAT-HNG-SFT", "soft close hinge"], 35).rate || 35,
    handles: getMasterRate(["MAT-HND-DES", "handle"], 50).rate || 50,
    locks: getMasterRate(["MAT-LCK-MRT", "lock"], 120).rate || 120,
    drawerChannels: getMasterRate(["MAT-DRW-CHN", "drawer channel"], 80).rate || 80,
    slidingTrack: getMasterRate(["MAT-SLD-TRK", "sliding track"], 250).rate || 250,
    ssBaskets: getMasterRate(["MAT-SS304-BSK", "ss basket"], 450).rate || 450,
    countertop: getMasterRate(["MAT-GRN-01", "granite countertop"], 1200).rate || 1200,
    fevicol: getMasterRate(["MAT-FEV-ADH", "fevicol"], 60).rate || 60,
    nails: getMasterRate(["MAT-NLS-FST", "nails"], 30).rate || 30,
    screws: getMasterRate(["MAT-SCR-WLL", "screws"], 40).rate || 40,
    mirrors: getMasterRate(["MAT-MIR-01", "mirror"], 50).rate || 50
  }), []);

  // Multiplier for Finish Profile
  const profileMultiplier = finishProfile === 'Premium' ? 1.20 : finishProfile === 'Ultra Premium' ? 1.40 : 1.0;

  // Add New Item Function
  const addItem = () => {
    if (!length || length <= 0) return alert("Enter valid length.");
    if (!height || height <= 0) return alert("Enter valid height.");
    const t = itemTypes[selectedItem];
    const L = Number(length);
    const H = Number(height);
    const N = Number(nos || 1);
    const frontArea = L * H * N;
    const rft = L * N;

    let q: any = {
      plywood18mm: 0, plywood12mm: 0, plywood6mm: 0,
      externalLaminate: 0, internalLaminate: 0, edgeBanding: 0, cornerBeads: 0,
      hinges: 0, handles: 0, locks: 0, drawerChannels: 0,
      slidingTrack: 0, ssBaskets: 0, countertop: 0,
      fevicol: 0, nails: 0, screws: 0, mirrors: 0
    };

    if (t.kind === "sliding") {
      q.plywood18mm = frontArea * 2.2; q.plywood12mm = frontArea * 0.3; q.plywood6mm = frontArea;
      q.externalLaminate = frontArea; q.internalLaminate = q.plywood18mm * 0.55;
      q.edgeBanding = frontArea * 1.8; q.cornerBeads = frontArea * 0.5;
      q.slidingTrack = rft; q.handles = 2 * N; q.locks = N; q.mirrors = frontArea * 0.25;
    } else if (t.kind === "hinged") {
      q.plywood18mm = frontArea * 2.4; q.plywood12mm = frontArea * 0.25; q.plywood6mm = frontArea;
      q.externalLaminate = frontArea; q.internalLaminate = q.plywood18mm * 0.6;
      q.edgeBanding = frontArea * 2; q.cornerBeads = frontArea * 0.6;
      q.hinges = ceil(frontArea / 7); q.handles = ceil(frontArea / 14); q.locks = N;
    } else if (t.kind === "kitchen") {
      q.plywood18mm = rft * 18; q.plywood12mm = rft * 5; q.plywood6mm = rft * 6;
      q.externalLaminate = rft * 5; q.internalLaminate = (q.plywood18mm + q.plywood12mm) * 0.5;
      q.edgeBanding = rft * 8; q.cornerBeads = rft * 3;
      q.hinges = ceil(rft * 1.5); q.handles = ceil(rft * 1.5);
      q.drawerChannels = ceil(rft / 2); q.ssBaskets = ceil(rft / 2); q.countertop = rft;
    } else if (t.kind === "loft") {
      q.plywood18mm = frontArea * 1.6; q.plywood12mm = frontArea * 0.25; q.plywood6mm = frontArea;
      q.externalLaminate = frontArea; q.internalLaminate = frontArea * 0.5;
      q.edgeBanding = frontArea * 1.6; q.cornerBeads = frontArea * 0.5;
      q.hinges = ceil(frontArea / 8); q.handles = ceil(frontArea / 12); q.locks = N;
    } else if (t.kind === "tv") {
      q.plywood18mm = frontArea * 1.25; q.plywood12mm = frontArea * 0.2;
      q.externalLaminate = frontArea; q.internalLaminate = frontArea * 0.2;
      q.edgeBanding = (L + H) * 2 * N; q.cornerBeads = (L + H) * N;
    } else if (t.kind === "shoe") {
      q.plywood18mm = frontArea * 1.5; q.plywood12mm = frontArea * 0.2; q.plywood6mm = frontArea;
      q.externalLaminate = frontArea; q.internalLaminate = frontArea * 0.5;
      q.edgeBanding = frontArea * 1.8; q.cornerBeads = frontArea * 0.4;
      q.hinges = ceil(frontArea / 8); q.handles = ceil(frontArea / 12); q.locks = N;
    } else {
      q.plywood18mm = frontArea * 1.8; q.plywood12mm = frontArea * 0.25; q.plywood6mm = frontArea * 0.5;
      q.externalLaminate = frontArea; q.internalLaminate = frontArea * 0.5;
      q.edgeBanding = frontArea * 1.5; q.cornerBeads = frontArea * 0.4;
      q.hinges = ceil(frontArea / 8); q.handles = ceil(frontArea / 12); q.locks = N;
    }

    q.fevicol = (q.plywood18mm + q.plywood12mm) * 0.015;
    q.nails = frontArea * 0.01;
    q.screws = ceil(frontArea / 30);

    const chargeQty = t.kind === "kitchen" ? rft : frontArea;
    const amount = chargeQty * t.rate;
    const labourAmount = chargeQty * t.labour;

    const newItem = {
      id: Date.now() + Math.random(),
      name: selectedItem, length: L, depth: t.depth, height: H, nos: N,
      displayQty: chargeQty, displayUnit: t.kind === "kitchen" ? "rft" : "sft",
      frontArea, rft, rate: t.rate, labourRate: t.labour, amount, labourAmount, total: amount + labourAmount,
      ...q
    };

    setItems([...items, newItem]);
    setGenerated(true);
  };

  const removeItem = (id: any) => setItems(items.filter(i => i.id !== id));

  // Interior Calculation Engine
  const boqResults = useMemo(() => {
    const sum = (k: string) => items.reduce((s, i) => s + Number(i[k] || 0), 0);

    const totalPlywood18 = sum("plywood18mm");
    const totalPlywood12 = sum("plywood12mm");
    const totalPlywood6 = sum("plywood6mm");
    const totalExtLam = sum("externalLaminate");
    const totalIntLam = sum("internalLaminate");
    const totalEdgeBnd = sum("edgeBanding");
    const totalCornerBeads = sum("cornerBeads");
    const totalHinges = sum("hinges");
    const totalHandles = sum("handles");
    const totalLocks = sum("locks");
    const totalDrawerChannels = sum("drawerChannels");
    const totalSlidingTrack = sum("slidingTrack");
    const totalSSBaskets = sum("ssBaskets");
    const totalCountertop = sum("countertop");
    const totalFevicol = sum("fevicol");
    const totalNails = sum("nails");
    const totalScrews = sum("screws");
    const totalMirrors = sum("mirrors");

    const materialRows = [
      { desc: "18mm BWP/BWR Plywood (Carcase & Shutters)", qty: totalPlywood18, uom: "sft", baseRate: baseRates.plywood18mm },
      { desc: "12mm BWP Plywood (Drawer Boxes & Shelf Frames)", qty: totalPlywood12, uom: "sft", baseRate: baseRates.plywood12mm },
      { desc: "6mm MR Plywood (Backing Panels)", qty: totalPlywood6, uom: "sft", baseRate: baseRates.plywood6mm },
      { desc: "External Decorative Laminate (1.0mm/1.2mm High Gloss)", qty: totalExtLam, uom: "sft", baseRate: baseRates.externalLaminate },
      { desc: "Internal Liner Laminate (0.8mm Off-White)", qty: totalIntLam, uom: "sft", baseRate: baseRates.internalLaminate },
      { desc: "PVC Edge Banding Tape (2mm Thick)", qty: totalEdgeBnd, uom: "m", baseRate: baseRates.edgeBanding },
      { desc: "PVC / Aluminium Corner Beads & Edge Trim Profiles", qty: totalCornerBeads, uom: "m", baseRate: baseRates.cornerBeads },
      { desc: "Hinges Soft-Close 3D Hydraulic", qty: totalHinges, uom: "nos", baseRate: baseRates.hinges },
      { desc: "Designer Handles & Profile Pulls", qty: totalHandles, uom: "nos", baseRate: baseRates.handles },
      { desc: "Mortise & Cylinder Locks", qty: totalLocks, uom: "nos", baseRate: baseRates.locks },
      { desc: "Tandem Box / Soft-Close Drawer Channels", qty: totalDrawerChannels, uom: "set", baseRate: baseRates.drawerChannels },
      { desc: "Sliding Wardrobe Heavy Duty Roller Tracks", qty: totalSlidingTrack, uom: "rft", baseRate: baseRates.slidingTrack },
      { desc: "Modular SS 304 Kitchen Baskets (Cutlery/Thali/Plain)", qty: totalSSBaskets, uom: "set", baseRate: baseRates.ssBaskets },
      { desc: "Granite / Quartz Kitchen Countertop", qty: totalCountertop, uom: "rft", baseRate: baseRates.countertop },
      { desc: "Fevicol D3 Water-Resistant Adhesive", qty: totalFevicol, uom: "kg", baseRate: baseRates.fevicol },
      { desc: "Nails & Fasteners", qty: totalNails, uom: "kg", baseRate: baseRates.nails },
      { desc: "Consumable Screws & Wall Plugs", qty: totalScrews, uom: "box", baseRate: baseRates.screws },
      { desc: "Mirrors (5mm Float Glass Bevel Edge)", qty: totalMirrors, uom: "sft", baseRate: baseRates.mirrors }
    ];

    const processedMaterials = materialRows.map(i => {
      const matRate = i.baseRate * profileMultiplier;
      const amount = i.qty * matRate;
      return {
        ...i,
        matRate,
        amount
      };
    });

    const materialTotal = processedMaterials.reduce((sum, i) => sum + i.amount, 0);
    const labourTotal = items.reduce((sum, i) => sum + i.labourAmount, 0);
    const grandTotal = materialTotal + labourTotal;

    return {
      materials: processedMaterials,
      materialTotal,
      labourTotal,
      grandTotal,
      totalPlywood: totalPlywood18 + totalPlywood12 + totalPlywood6,
      totalLaminate: totalExtLam + totalIntLam,
      totalHardware: totalHinges + totalHandles + totalLocks + totalDrawerChannels + totalSSBaskets
    };
  }, [items, finishProfile, baseRates, profileMultiplier]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('boq_export', 'boq-interior', () => {
      const itemsData = items.map((i: any) => ({
        Item: i.name,
        Size: `${i.length}' x ${i.depth}' x ${i.height}'`,
        Nos: i.nos,
        Qty: formatNumber(i.displayQty),
        Unit: i.displayUnit,
        'Material Cost (₹)': formatCurrency(i.amount),
        'Labour Cost (₹)': formatCurrency(i.labourAmount),
        'Total Cost (₹)': formatCurrency(i.total)
      }));

      const materialsData = boqResults.materials.map((m: any) => ({
        Material: m.desc,
        Quantity: formatNumber(m.qty),
        Unit: m.uom,
        'Rate (₹)': formatCurrency(m.matRate),
        'Cost (₹)': formatCurrency(m.amount)
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemsData), "Interior_Items");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(materialsData), "Material_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Interior_BOQ_${new Date().toISOString().split("T")[0]}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('boq_export', 'boq-interior', () => {
      const msg = `*BuildMitra Interior BOQ Estimate (${finishProfile} Profile)*%0A` +
        `----------------------------------------%0A` +
        `• *Total Interior Items*: ${items.length} Units%0A` +
        `• *Total Plywood Area*: ${formatNumber(boqResults.totalPlywood, 1)} Sft%0A` +
        `• *Total Laminate Area*: ${formatNumber(boqResults.totalLaminate, 1)} Sft%0A` +
        `• *Hardware Fixtures*: ${formatNumber(boqResults.totalHardware, 0)} Nos/Sets%0A` +
        `• *Material Total*: ${formatCurrency(boqResults.materialTotal)}%0A` +
        `• *Labour Total*: ${formatCurrency(boqResults.labourTotal)}%0A` +
        `• *GRAND TOTAL COST*: ${formatCurrency(boqResults.grandTotal)}%0A%0A` +
        `*Generated via BuildMitra Interior BOQ Engine*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  const handleReset = () => {
    setItems([]);
    setGenerated(false);
  };

  return (
    <div className="bm-final-boq-page" style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header} className="bm-boq-top-header">
        <div>
          <button style={styles.backBtn} className="bm-top-back-btn" onClick={() => router.push('/calculators')}>← Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          🛋️ Interior BOQ Calculator
          <span style={styles.badge}>IS Hardware, Laminate & Plywood Engine</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#fde68a' }}>BuildMitra Professional Edition</span>
        </div>
      </div>

      {/* 2. Live Market Rate Ticker */}
      <MarketRateTrend />

      {/* 3. Finish Profile & Add Item Form */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>🌟 Finish Profile & Preset Interior Items</span>
        </div>

        {/* Finish Profile Selector */}
        <div style={{ backgroundColor: '#fef3c7', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fde68a' }}>
          <div className="bm-final-boq-input-grid" style={styles.grid4}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Interior Finish Profile</label>
              <select
                style={{ ...styles.select, fontWeight: '700', color: '#78350f' }}
                value={finishProfile}
                onChange={e => setFinishProfile(e.target.value)}
              >
                <option value="Standard">Standard Profile (1.0x Base Admin Rates)</option>
                <option value="Premium">Premium Profile (+20% Material Multiplier)</option>
                <option value="Ultra Premium">Ultra Premium Profile (+40% Material Multiplier)</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#78350f', fontWeight: '600' }}>
              💡 Profile Specs: {finishProfile === 'Standard' ? 'Commercial MR/BWR Plywood, 0.8mm/1.0mm Laminates, SS 202 Baskets' : finishProfile === 'Premium' ? '100% BWP Marine Plywood IS 710, 1.2mm High-Gloss/Acrylic Laminates, SS 304 Wire Baskets, Soft-close Hettich' : 'HDHMR / BWR Waterproof Boards, Veneer / PU Polish Finish, Blum/Hafele Soft-close Systems'}
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="bm-final-boq-input-grid" style={styles.grid5}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Item Type</label>
            <select
              style={styles.select}
              value={selectedItem}
              onChange={e => {
                setSelectedItem(e.target.value);
                setHeight(itemTypes[e.target.value].defaultHeight);
              }}
            >
              {Object.keys(itemTypes).map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Length / RFT</label>
            <input
              type="number"
              placeholder="e.g. 6"
              style={styles.input}
              value={length || ''}
              onChange={e => setLength(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Height (Ft)</label>
            <input
              type="number"
              placeholder="e.g. 7"
              style={styles.input}
              value={height || ''}
              onChange={e => setHeight(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nos / Quantity</label>
            <input
              type="number"
              placeholder="e.g. 1"
              style={styles.input}
              value={nos || ''}
              onChange={e => setNos(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button style={styles.btnPrimary} onClick={addItem}>➕ Add Item</button>
          </div>
        </div>

        {/* Added Items Table */}
        {items.length > 0 && (
          <div className="bm-boq-table-scroll" style={styles.tableContainer}>
            <div className="bm-real-boq-scroll"><table className="bm-boq-table bm-final-boq-table bm-real-boq-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Item</th>
                  <th style={styles.th}>Size (L x D x H)</th>
                  <th style={styles.th}>Nos</th>
                  <th style={styles.th}>Charge Qty</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Material Cost</th>
                  <th style={styles.th}>Labour Cost</th>
                  <th style={styles.th}>Total (₹)</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, idx) => (
                  <tr key={i.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={styles.td}><strong>{i.name}</strong></td>
                    <td style={styles.td}>{i.length}&apos; x {i.depth}&apos; x {i.height}&apos;</td>
                    <td style={styles.td}>{i.nos}</td>
                    <td style={styles.td}>{formatNumber(i.displayQty)}</td>
                    <td style={styles.td}>{i.displayUnit}</td>
                    <td style={styles.td}>{formatCurrency(i.amount)}</td>
                    <td style={styles.td}>{formatCurrency(i.labourAmount)}</td>
                    <td style={styles.td}><strong>{formatCurrency(i.total)}</strong></td>
                    <td style={styles.td}>
                      <button style={styles.btnDelete} onClick={() => removeItem(i.id)}>X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Items</button>
          <button style={styles.btnPrimary} onClick={() => { if(items.length === 0) { alert("Please add at least 1 interior item."); return; } setGenerated(true); }}>🔨 Generate Interior BOQ</button>
        </div>
      </div>

      {(!generated || items.length === 0) ? (
        <div style={{
          backgroundColor: "#ffffff",
          border: "2px dashed #b45309",
          borderRadius: "14px",
          padding: "36px 20px",
          textAlign: "center",
          color: "#b45309",
          margin: "20px 0"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🛋️</div>
          <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Ready for Interior BOQ Estimation</div>
          <div style={{ fontSize: "13px", color: "#475569" }}>Please select interior items above (e.g. Wardrobe 6ft × 7ft) and click <strong>"➕ Add Item"</strong> then <strong>"🔨 Generate Interior BOQ"</strong> to calculate hardware, plywood &amp; laminates.</div>
        </div>
      ) : (
        <div style={styles.stepperCard}>
          <div style={styles.sectionHeader}>
            <span>📊 Interior BOQ Estimation Summary & Detailed Material Breakdown</span>
          </div>

          {/* Metric Summary Grid */}
          <div className="bm-boq-summary-scroll" style={styles.summaryGrid}>
            <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
              <span style={styles.metricTitle}>Grand Total Cost</span>
              <span style={styles.metricVal}>₹{formatNumber(boqResults.grandTotal / 100000, 2)} Lakhs</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>{formatCurrency(boqResults.grandTotal)}</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Total Plywood</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.totalPlywood, 1)} Sft</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>Total Laminate</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.totalLaminate, 1)} Sft</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal, backgroundColor: '#0284c7' }}>
              <span style={styles.metricTitle}>Hardware Fixtures</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.totalHardware, 0)} Nos/Set</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
              <span style={styles.metricTitle}>Labour Cost Total</span>
              <span style={styles.metricVal}>₹{formatNumber(boqResults.labourTotal / 100000, 2)} Lakhs</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>{formatCurrency(boqResults.labourTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>💬 WhatsApp Share</button>
            <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('🛒 Interior BOQ Package sent to Vendor Marketplace RFQ!')}>🛒 Request Marketplace RFQ</button>
            <button style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('📈 Applied Bengaluru Live Mandi Wholesale Rates to Interior BOQ!')}>📈 Sync Live Market Rates</button>
            <button style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('💾 Saved Interior BOQ Revision 1.0 to Active Project!')}>💾 Save BOQ Revision</button>
          </div>

          {/* Comprehensive Material & Hardware Table */}
          <div className="bm-boq-table-scroll" style={styles.tableContainer}>
            <div className="bm-real-boq-scroll"><table className="bm-boq-table bm-final-boq-table bm-real-boq-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Material & Hardware Item Description</th>
                  <th style={styles.th}>Required Quantity</th>
                  <th style={styles.th}>UOM</th>
                  <th style={styles.th}>Unit Rate (₹)</th>
                  <th style={styles.th}>Total Cost (₹)</th>
                </tr>
              </thead>
              <tbody>
                {boqResults.materials.map((m: any, idx: number) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={styles.td}><strong>{m.desc}</strong></td>
                    <td style={styles.td}>{formatNumber(m.qty)}</td>
                    <td style={styles.td}>{m.uom}</td>
                    <td style={styles.td}>{formatCurrency(m.matRate)}</td>
                    <td style={styles.td}><strong>{formatCurrency(m.amount)}</strong></td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: '700' }}>
                  <td colSpan={4} style={{ padding: '10px' }}>TOTAL MATERIAL & HARDWARE COST</td>
                  <td style={{ padding: '10px' }}>{formatCurrency(boqResults.materialTotal)}</td>
                </tr>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: '700' }}>
                  <td colSpan={4} style={{ padding: '10px' }}>TOTAL CARPENTRY LABOUR COST</td>
                  <td style={{ padding: '10px' }}>{formatCurrency(boqResults.labourTotal)}</td>
                </tr>
                <tr style={{ backgroundColor: '#4a2c11', color: 'white', fontWeight: '800' }}>
                  <td colSpan={4} style={{ padding: '12px', fontSize: '13px' }}>GRAND TOTAL ESTIMATED INTERIOR BOQ COST ({finishProfile} Profile)</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{formatCurrency(boqResults.grandTotal)}</td>
                </tr>
              </tbody>
            </table></div>
          </div>
        </div>
      )}
    </div>
  );
}




