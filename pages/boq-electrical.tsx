import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../utils/pdfExport';
import { getMasterRate, syncApprovedRatesFromBackend } from '../utils/masterRates';
import MarketRateTrend from '../components/ui/MarketRateTrend';

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    boxSizing: 'border-box',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#d97706',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(217,119,6,0.2)'
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  badge: {
    backgroundColor: '#b45309',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    transition: '0.2s'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '18px',
    marginBottom: '16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
  },
  sectionHeader: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#d97706',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #fde68a',
    paddingBottom: '8px'
  },
  gridCompact: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginBottom: '12px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '2px'
  },
  input: {
    width: '100%',
    height: '38px',
    padding: '8px 12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  inputModified: {
    color: '#dc2626',
    fontWeight: '800',
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2'
  },
  select: {
    width: '100%',
    height: '38px',
    padding: '8px 12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  metricCard: {
    padding: '16px',
    borderRadius: '10px',
    color: 'white',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
  },
  metricAmber: { backgroundColor: '#d97706' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricBlue: { backgroundColor: '#2563eb' },
  metricPurple: { backgroundColor: '#7c3aed' },
  metricTitle: { fontSize: '12px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '700', letterSpacing: '0.5px' },
  metricVal: { fontSize: '18px', fontWeight: '800', marginTop: '6px' },
  metricValGrand: { fontSize: '22px', fontWeight: '900', marginTop: '6px' },

  tableContainer: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    marginBottom: '16px'
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { backgroundColor: '#d97706', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '14px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '14px' },

  btnPrimary: { backgroundColor: '#d97706', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ALL_ELECTRICAL_ITEMS_DEF = [
  { id: "EL01", slNo: 1, code: "EL01", name: "Temporary & Permanent Electrical Connection", materials: "Service cable, meter board, cutouts", defaultUom: "Points" },
  { id: "EL02", slNo: 2, code: "EL02", name: "PVC Conduits & Accessories", materials: "PVC conduits, bends, junction boxes", defaultUom: "m" },
  { id: "EL03", slNo: 3, code: "EL03", name: "Modular Switches, Plates & Sockets", materials: "Anchor/Northwest modular switches, plates, sockets", defaultUom: "nos" },
  { id: "EL04", slNo: 4, code: "EL04", name: "All Wires (Lighting, Power, AC, Main)", materials: "FRLS copper wires (1.5, 2.5, 4, 6 sqmm)", defaultUom: "m" },
  { id: "EL05", slNo: 5, code: "EL05", name: "All Lights (Bulbs, Battens, Panels)", materials: "LED bulbs, battens, panel lights", defaultUom: "nos" },
  { id: "EL06", slNo: 6, code: "EL06", name: "Distribution Boards & MCBs", materials: "DB boxes, copper busbars, MCBs", defaultUom: "nos" },
  { id: "EL07", slNo: 7, code: "EL07", name: "Light Fittings (Decorative, Ceiling, Wall)", materials: "Chandeliers, ceiling lights, wall brackets", defaultUom: "nos" },
  { id: "EL08", slNo: 8, code: "EL08", name: "Electrical Appliances (Fans, Geysers, AC Units)", materials: "Ceiling fans, exhaust fans, geysers, AC units", defaultUom: "nos" },
  { id: "EL09", slNo: 9, code: "EL09", name: "Earthing (Plate/Rod Type)", materials: "GI plate/rod, charcoal, salt", defaultUom: "set" },
  { id: "EL10", slNo: 10, code: "EL10", name: "Inverter/UPS & Battery", materials: "UPS unit, batteries", defaultUom: "set" }
];

export default function ElectricalBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(3);
  const [bedrooms, setBedrooms] = useState(3);
  const [packageTier, setPackageTier] = useState<'Standard' | 'Premium' | 'Ultra Premium'>('Standard');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(ALL_ELECTRICAL_ITEMS_DEF.map(it => it.id));
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(true);
  const [itemSearch, setItemSearch] = useState<string>('');

  const [isInputModified, setIsInputModified] = useState<boolean>(false);
  const [isCalculatedBlue, setIsCalculatedBlue] = useState<boolean>(false);

  const handleInputChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setIsInputModified(true);
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    setIsInputModified(true);
  };

  const selectAllItems = () => {
    setSelectedItemIds(ALL_ELECTRICAL_ITEMS_DEF.map(it => it.id));
    setIsInputModified(true);
  };

  const deselectAllItems = () => {
    setSelectedItemIds([]);
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (with fallback seeds from rate sheet)
  const el01Rate = getMasterRate(["CIV-ELE-01", "EL01", "ele-conn-01", "temporary & permanent electrical connection"], 50000);
  const el02Rate = getMasterRate(["EL02", "ele-cnd-01", "pvc conduits"], 25);
  const el03Rate = getMasterRate(["EL03", "ele-swt-01", "modular switches"], 140);
  const el04Rate = getMasterRate(["EL04", "ele-wir-01", "copper wires"], 28);
  const el05Rate = getMasterRate(["EL05", "ele-lgt-01", "led lights"], 220);
  const el06Rate = getMasterRate(["CIV-ELE-02", "EL06", "ele-mcb-01", "distribution boards"], 3200);
  const el07Rate = getMasterRate(["EL07", "ele-fit-01", "light fittings"], 550);
  const el08Rate = getMasterRate(["CIV-ELE-03", "EL08", "ele-app-01", "electrical appliances"], 950);
  const el09Rate = getMasterRate(["EL09", "ele-eth-01", "earthing"], 3500);
  const el10Rate = getMasterRate(["EL10", "ele-ups-01", "inverter ups"], 21000);

  const calculations = useMemo(() => {
    const totalBUA = Math.round(plotLength * plotWidth * 0.9 * floors);

    const tierMultiplier = packageTier === 'Ultra Premium' ? 1.50 : packageTier === 'Premium' ? 1.25 : 1.0;

    // Residential Electrical QS Quantities based on Built-Up Area & User Specifications
    const qty1 = 1; // Fixed 1 Connection LS / Set
    const qty2 = Math.round(totalBUA * 0.85); // ~0.85m PVC conduits per sqft BUA
    const qty3 = Math.ceil(totalBUA * 0.12);  // ~0.12 modular switches per sqft BUA
    const qty4 = Math.round(totalBUA * 1.60); // ~1.60m FRLS copper wire per sqft BUA
    const qty5 = Math.ceil(totalBUA * 0.035); // ~0.035 LED lights per sqft BUA
    const qty6 = Math.max(1, Math.ceil(totalBUA / 1000)); // DBs & MCBs (1 per 1000 sqft BUA)
    const qty7 = Math.ceil(totalBUA * 0.015); // Light fittings ~0.015 per sqft BUA
    const qty8 = Math.ceil(totalBUA * 0.010); // Electrical appliances ~0.010 per sqft BUA
    const qty9 = 1; // Fixed 1 Earthing Set
    const qty10 = Math.max(1, Math.ceil(totalBUA / 2500)); // Inverter/UPS & Battery (1 set per 2500 sqft BUA)

    const rawItems = [
      { id: "EL01", slNo: 1, code: el01Rate.itemCode || "CIV-ELE-01", category: "Connection & Infrastructure", name: "Temporary & Permanent Electrical Connection", materials: "Service cable, meter board, cutouts", uom: "LS", qty: qty1, rateObj: el01Rate },
      { id: "EL02", slNo: 2, code: el02Rate.itemCode || "EL02", category: "Conduiting & Accessories", name: "PVC Conduits & Accessories", materials: "PVC conduits, bends, junction boxes", uom: "m", qty: qty2, rateObj: el02Rate },
      { id: "EL03", slNo: 3, code: el03Rate.itemCode || "EL03", category: "Switches & Sockets", name: "Modular Switches, Plates & Sockets", materials: "Anchor/Northwest modular switches, plates, sockets", uom: "nos", qty: qty3, rateObj: el03Rate },
      { id: "EL04", slNo: 4, code: el04Rate.itemCode || "EL04", category: "Wiring & Cables", name: "All Wires (Lighting, Power, AC, Main)", materials: "FRLS copper wires (1.5, 2.5, 4, 6 sqmm)", uom: "m", qty: qty4, rateObj: el04Rate },
      { id: "EL05", slNo: 5, code: el05Rate.itemCode || "EL05", category: "Lighting Devices", name: "All Lights (Bulbs, Battens, Panels)", materials: "LED bulbs, battens, panel lights", uom: "nos", qty: qty5, rateObj: el05Rate },
      { id: "EL06", slNo: 6, code: el06Rate.itemCode || "CIV-ELE-02", category: "Distribution & Protection", name: "Distribution Boards & MCBs", materials: "DB boxes, copper busbars, MCBs", uom: "nos", qty: qty6, rateObj: el06Rate },
      { id: "EL07", slNo: 7, code: el07Rate.itemCode || "EL07", category: "Luminaires & Fixtures", name: "Light Fittings (Decorative, Ceiling, Wall)", materials: "Chandeliers, ceiling lights, wall brackets", uom: "nos", qty: qty7, rateObj: el07Rate },
      { id: "EL08", slNo: 8, code: el08Rate.itemCode || "CIV-ELE-03", category: "Electrical Appliances", name: "Electrical Appliances (Fans, Geysers, AC Units)", materials: "Ceiling fans, exhaust fans, geysers, AC units", uom: "nos", qty: qty8, rateObj: el08Rate },
      { id: "EL09", slNo: 9, code: el09Rate.itemCode || "EL09", category: "Earthing System", name: "Earthing (Plate/Rod Type)", materials: "GI plate/rod, charcoal, salt", uom: "set", qty: qty9, rateObj: el09Rate },
      { id: "EL10", slNo: 10, code: el10Rate.itemCode || "EL10", category: "Power Backup & Storage", name: "Inverter/UPS & Battery", materials: "UPS unit, batteries", uom: "set", qty: qty10, rateObj: el10Rate }
    ];

    const selectedItems = rawItems.filter(it => selectedItemIds.includes(it.id));

    let totalMaterialCost = 0;
    let totalLabourCost = 0;

    const processedItems = selectedItems.map((it, idx) => {
      const isFound = it.rateObj.found && Number(it.rateObj.rate) > 0;
      const baseRate = isFound ? Number(it.rateObj.rate) : 0;
      const rateVal = Math.round(baseRate * tierMultiplier);
      const amountVal = isFound ? Math.round(it.qty * rateVal) : 0;

      // 70% material, 30% labour distribution
      totalMaterialCost += amountVal * 0.70;
      totalLabourCost += amountVal * 0.30;

      return {
        ...it,
        slNo: idx + 1,
        isFound,
        rateVal,
        amountVal
      };
    });

    const grandTotalCost = Math.round(totalMaterialCost + totalLabourCost);
    const costPerSqft = totalBUA > 0 ? grandTotalCost / totalBUA : 0;
    const missingItems = processedItems.filter(it => !it.isFound);

    return {
      totalBUA,
      totalMaterialCost: Math.round(totalMaterialCost),
      totalLabourCost: Math.round(totalLabourCost),
      grandTotalCost,
      costPerSqft,
      items: processedItems,
      missingItems
    };
  }, [selectedItemIds, plotLength, plotWidth, floors, bedrooms, packageTier, el01Rate, el02Rate, el03Rate, el04Rate, el05Rate, el06Rate, el07Rate, el08Rate, el09Rate, el10Rate]);

  const handleCalculate = () => {
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("electrical_boq_export", "ELEC-BOQ", () => {
      const data = [
        ["BUILDMITRA RESIDENTIAL ELECTRICAL BOQ REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Package Tier", `${packageTier} (${packageTier === 'Ultra Premium' ? '+50% Luxury Multiplier' : packageTier === 'Premium' ? '+25% Premium Multiplier' : 'Baseline Standard Multiplier'})`],
        ["Built-up Area", `${calculations.totalBUA} Sq.ft`],
        ["Material Subtotal", formatCurrency(calculations.totalMaterialCost)],
        ["Labour Subtotal", formatCurrency(calculations.totalLabourCost)],
        ["Est. Rate / Sq.ft", `${formatCurrency(calculations.costPerSqft)} / Sq.ft`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calculations.grandTotalCost)],
        [],
        ["ITEMIZED ELECTRICAL BOQ"],
        ["Sl.No", "Item Code", "Description", "Key Materials", "UOM", "Quantity", "Approved Rate (₹)", "Total Amount (₹)"],
        ...calculations.items.map(it => [
          it.slNo,
          it.code,
          it.name,
          it.materials,
          it.uom,
          it.qty,
          it.isFound ? it.rateVal : "Master Mapping Required / Approved Rate Unavailable",
          it.isFound ? it.amountVal : "—"
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Electrical_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Electrical_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("electrical_boq_export", "ELEC-BOQ", () => {
      const headers = ["Sl.No", "Item Code", "Description", "Key Materials", "Qty", "UOM", "Rate (₹)", "Amount (₹)"];
      const rows = calculations.items.map(it => [
        String(it.slNo),
        it.code,
        it.name,
        it.materials,
        String(it.qty),
        it.uom,
        it.isFound ? formatCurrency(it.rateVal) : "Rate Pending Admin Update",
        it.isFound ? formatCurrency(it.amountVal) : "—"
      ]);

      downloadBuildMitraPDF(
        "BuildMitra – Residential Electrical BOQ Report",
        [
          ["Package Tier:", `${packageTier} (${packageTier === 'Ultra Premium' ? '+50% Luxury' : packageTier === 'Premium' ? '+25% Premium' : 'Baseline Standard'})`],
          ["Built-up Area:", `${calculations.totalBUA} Sq.ft`],
          ["Material Subtotal:", formatCurrency(calculations.totalMaterialCost)],
          ["Labour Subtotal:", formatCurrency(calculations.totalLabourCost)],
          ["Est. Rate / Sq.ft:", `₹${calculations.costPerSqft.toFixed(2)} / Sq.ft`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calculations.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Electrical_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>Electrical BOQ Estimator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>MEP &amp; ELECTRICAL BOQ</span>
            <h1 style={styles.headerTitle}>⚡ BuildMitra – Electrical BOQ Estimator</h1>
          </div>
          <button style={styles.backBtn} onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Inputs */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>📐 Enter Electrical Load &amp; Building Specifications</span>
          </div>

          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Plot Length (ft)</label>
              <input type="number" value={plotLength} onChange={(e) => handleInputChange(setPlotLength, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Plot Width (ft)</label>
              <input type="number" value={plotWidth} onChange={(e) => handleInputChange(setPlotWidth, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Floors Count</label>
              <input type="number" value={floors} onChange={(e) => handleInputChange(setFloors, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Bedrooms Count</label>
              <input type="number" value={bedrooms} onChange={(e) => handleInputChange(setBedrooms, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Specification Package Tier</label>
              <select
                value={packageTier}
                onChange={(e) => handleInputChange(setPackageTier, e.target.value as any)}
                style={{
                  ...styles.select,
                  fontWeight: '700',
                  color: packageTier === 'Ultra Premium' ? '#7c3aed' : packageTier === 'Premium' ? '#2563eb' : '#d97706',
                  borderColor: packageTier === 'Ultra Premium' ? '#c4b5fd' : packageTier === 'Premium' ? '#93c5fd' : '#fcd34d',
                  backgroundColor: packageTier === 'Ultra Premium' ? '#f5f3ff' : packageTier === 'Premium' ? '#eff6ff' : '#fffbe0'
                }}
              >
                <option value="Standard">Standard (Baseline ~₹135/sqft)</option>
                <option value="Premium">Premium (+25% Tier Multiplier)</option>
                <option value="Ultra Premium">Ultra Premium (+50% Tier Multiplier)</option>
              </select>
            </div>
          </div>

          {/* Horizontal Electrical Line Items Selector */}
          <div style={{ marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <span>📋 <strong>Include / Exclude Electrical BOQ Line Items</strong></span>
                <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#d97706', color: '#ffffff', padding: '3px 10px', borderRadius: '12px' }}>
                  {selectedItemIds.length} of {ALL_ELECTRICAL_ITEMS_DEF.length} Selected
                </span>
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔍 Search items..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    outline: 'none',
                    width: '160px'
                  }}
                />
                <button
                  type="button"
                  onClick={selectAllItems}
                  style={{ padding: '5px 10px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: '1px solid #16a34a', backgroundColor: '#f0fdf4', color: '#15803d', cursor: 'pointer' }}
                >
                  ✓ Select All ({ALL_ELECTRICAL_ITEMS_DEF.length})
                </button>
                <button
                  type="button"
                  onClick={deselectAllItems}
                  style={{ padding: '5px 10px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: '1px solid #dc2626', backgroundColor: '#fef2f2', color: '#b91c1c', cursor: 'pointer' }}
                >
                  ✕ Deselect All
                </button>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ padding: '5px 12px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: '1px solid #d97706', backgroundColor: isDropdownOpen ? '#d97706' : '#ffffff', color: isDropdownOpen ? '#ffffff' : '#d97706', cursor: 'pointer' }}
                >
                  {isDropdownOpen ? '▲ Hide Items' : '▼ Filter Items List'}
                </button>
              </div>
            </div>

            {/* Horizontal Pill Badges List */}
            {isDropdownOpen && (
              <div style={{ backgroundColor: '#fffbebfb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px', marginTop: '8px', maxHeight: '280px', overflowY: 'auto', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALL_ELECTRICAL_ITEMS_DEF.filter(it => it.name.toLowerCase().includes(itemSearch.toLowerCase()) || it.code.toLowerCase().includes(itemSearch.toLowerCase()) || it.materials.toLowerCase().includes(itemSearch.toLowerCase())).map(item => {
                    const isChecked = selectedItemIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          backgroundColor: isChecked ? '#d97706' : '#ffffff',
                          color: isChecked ? '#ffffff' : '#475569',
                          border: isChecked ? '1px solid #d97706' : '1px solid #cbd5e1',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: isChecked ? '700' : '500',
                          boxShadow: isChecked ? '0 2px 4px rgba(217,119,6,0.18)' : 'none',
                          transition: 'all 0.15s ease',
                          userSelect: 'none'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item.id)}
                          style={{ width: '14px', height: '14px', accentColor: '#ffffff', cursor: 'pointer' }}
                        />
                        <span>
                          <code style={{ fontSize: '11px', color: isChecked ? '#fef08a' : '#d97706' }}>{item.code}</code> – {item.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>⚡ Calculate Electrical BOQ</button>
            <button style={styles.btnReset} onClick={() => { setPlotLength(30); setPlotWidth(40); setFloors(3); setBedrooms(3); setPackageTier('Standard'); selectAllItems(); }}>🔄 Reset</button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
          </div>
        </div>

        {/* Result Metric Cards */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricAmber }}>
            <span style={styles.metricTitle}>Built-up Area</span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#fde68a' : '#ffffff' }}>{calculations.totalBUA.toLocaleString()} Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
            <span style={styles.metricTitle}>Material Subtotal</span>
            <span style={styles.metricVal}>{formatCurrency(calculations.totalMaterialCost)}</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricPurple }}>
            <span style={styles.metricTitle}>Labour Subtotal</span>
            <span style={styles.metricVal}>{formatCurrency(calculations.totalLabourCost)}</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>Est. Rate / Sq.ft</span>
            <span style={styles.metricVal}>₹{calculations.costPerSqft.toFixed(2)} / Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>GRAND ESTIMATED TOTAL</span>
            <span style={{ ...styles.metricValGrand, color: isCalculatedBlue ? '#60a5fa' : '#ffffff' }}>{formatCurrency(calculations.grandTotalCost)}</span>
          </div>
        </div>

        {/* Missing Master Rates Warning Banner */}
        {calculations.missingItems.length > 0 && (
          <div style={styles.warnBanner}>
            ⚠️ <strong>Master Mapping Required / Approved Rate Unavailable ({calculations.missingItems.length} Line Items)</strong>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
              {calculations.missingItems.map(it => (
                <li key={it.code}>
                  <code>{it.code}</code>: {it.name} — Quantity: <strong>{it.qty.toLocaleString()} {it.uom}</strong> (Status: <em>Master Mapping Required</em>)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Itemized BOQ Table */}
        <div style={styles.tableContainer}>
          <div style={{ padding: '12px 16px', backgroundColor: '#d97706', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized Electrical BOQ (Admin Master Linked - 10 Line Items)
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sl.No</th>
                <th style={styles.th}>Item Code</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Key Materials</th>
                <th style={styles.th}>UOM</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Approved Rate (₹)</th>
                <th style={styles.th}>Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {calculations.items.map(it => (
                <tr key={it.code}>
                  <td style={styles.td}><strong>{it.slNo}</strong></td>
                  <td style={styles.td}><code>{it.code}</code></td>
                  <td style={styles.td}><strong>{it.name}</strong></td>
                  <td style={styles.td}>{it.materials}</td>
                  <td style={styles.td}>{it.uom}</td>
                  <td style={styles.td}>{it.qty.toLocaleString()}</td>
                  <td style={styles.td}>
                    {it.isFound ? formatCurrency(it.rateVal) : <span style={{ color: '#dc2626', fontWeight: '700' }}>Master Mapping Required / Approved Rate Unavailable</span>}
                  </td>
                  <td style={styles.td}>
                    {it.isFound ? <strong>{formatCurrency(it.amountVal)}</strong> : <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#d97706', color: 'white', fontWeight: '800' }}>
                <td colSpan={7} style={{ padding: '12px 14px', fontSize: '16px' }}>GRAND TOTAL ESTIMATED COST</td>
                <td style={{ padding: '12px 14px', fontSize: '18px' }}>{formatCurrency(calculations.grandTotalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
