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
    backgroundColor: '#0284c7',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(2,132,199,0.2)'
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
    backgroundColor: '#0369a1',
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
    color: '#0284c7',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #bae6fd',
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
  metricBlue: { backgroundColor: '#0284c7' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
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
  th: { backgroundColor: '#0284c7', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '14px' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '14px' },

  btnPrimary: { backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return "Master Mapping Required / Approved Rate Unavailable";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ALL_PLUMBING_ITEMS_DEF = [
  { id: "PLB01", slNo: 1, code: "PLB01", name: "Water Supply Piping (CPVC/UPVC)", materials: "CPVC 20mm & 25mm SDR 11 pipes, fittings, clamps", defaultUom: "m" },
  { id: "PLB02", slNo: 2, code: "PLB02", name: "Sanitary Piping (PVC Soil & Waste)", materials: "SWR UPVC 110mm & 75mm 4kg/cm² soil & waste pipes", defaultUom: "m" },
  { id: "PLB03", slNo: 3, code: "PLB03", name: "Internal Water Supply Points (Kitchen & Bathrooms)", materials: "Brass concealed bib cocks, angle valves, concealed stop cocks", defaultUom: "Points" },
  { id: "PLB04", slNo: 4, code: "PLB04", name: "Toilet Fittings (WC, EWC, Washbasin, CP Fittings)", materials: "EWC commode, health faucet, washbasin, pillar cock, CP fittings", defaultUom: "set" },
  { id: "PLB05", slNo: 5, code: "PLB05", name: "Kitchen Sink & CP Fittings", materials: "SS 304 Kitchen sink, sink mixer/tap, bottle trap, waste coupling", defaultUom: "set" },
  { id: "PLB06", slNo: 6, code: "PLB06", name: "Geyser & Hot Water Line Points", materials: "Insulated CPVC hot water piping, inlet/outlet angle valves", defaultUom: "Points" },
  { id: "PLB07", slNo: 7, code: "PLB07", name: "Overhead Syntex Tank (0.5 L per sqft capacity)", materials: "Triple layer HDPE insulated water storage tank", defaultUom: "LTR" },
  { id: "PLB08", slNo: 8, code: "PLB08", name: "1 HP Pump Installation", materials: "1 HP Monoblock/Submersible water pump, NRV, strainer", defaultUom: "set" },
  { id: "PLB09", slNo: 9, code: "PLB09", name: "Water Level Controller", materials: "Automatic magnetic float switch, indicator panel, sensor wiring", defaultUom: "set" },
  { id: "PLB10", slNo: 10, code: "PLB10", name: "Solar Water Heater (150 LPD)", materials: "150 LPD Solar collector panel, insulated tank, stand & piping", defaultUom: "set" },
  { id: "PLB11", slNo: 11, code: "PLB11", name: "Cauvery Water Connection (Main Line + Meter)", materials: "GI/HDPE main line inlet pipe, water meter chamber, NRV, ferrule", defaultUom: "LS" },
  { id: "PLB12", slNo: 12, code: "PLB12", name: "Drainage Lines (External PVC/Stoneware)", materials: "160mm / 6 inch heavy duty PVC / Stoneware sewer pipes", defaultUom: "m" },
  { id: "PLB13", slNo: 13, code: "PLB13", name: "Rainwater Downpipes & Connections", materials: "110mm UV stabilized PVC downpipes, shoe bends, leaf strainers", defaultUom: "m" },
  { id: "PLB14", slNo: 14, code: "PLB14", name: "Manholes & Chambers (Inspection/Septic)", materials: "Brickwork/Precast inspection chamber, CI cover, gully trap", defaultUom: "nos" },
  { id: "PLB15", slNo: 15, code: "PLB15", name: "Testing & Commissioning (Water Supply + Sanitary)", materials: "Hydrostatic pressure testing, smoke testing, flushing & commissioning", defaultUom: "LS" }
];

export default function PlumbingBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  const [plotLength, setPlotLength] = useState(0);
  const [plotWidth, setPlotWidth] = useState(0);
  const [floors, setFloors] = useState(0);
  const [toilets, setToilets] = useState(0);
  const [packageTier, setPackageTier] = useState<'Standard' | 'Premium' | 'Ultra Premium'>('Standard');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(ALL_PLUMBING_ITEMS_DEF.map(it => it.id));
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(true);
  const [itemSearch, setItemSearch] = useState<string>('');

  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
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
    setSelectedItemIds(ALL_PLUMBING_ITEMS_DEF.map(it => it.id));
    setIsInputModified(true);
  };

  const deselectAllItems = () => {
    setSelectedItemIds([]);
    setIsInputModified(true);
  };

  // Authoritative Admin Rate Master Lookups (with fallback seeds from rate sheet)
  const plb01Rate = getMasterRate(["PLB01"], 26);
  const plb02Rate = getMasterRate(["PLB02"], 22);
  const plb03Rate = getMasterRate(["PLB03"], 1250);
  const plb04Rate = getMasterRate(["PLB04"], 11500);
  const plb05Rate = getMasterRate(["PLB05"], 6500);
  const plb06Rate = getMasterRate(["PLB06"], 2800);
  const plb07Rate = getMasterRate(["PLB07"], 8.5);
  const plb08Rate = getMasterRate(["PLB08"], 11500);
  const plb09Rate = getMasterRate(["PLB09"], 3800);
  const plb10Rate = getMasterRate(["PLB10"], 28000);
  const plb11Rate = getMasterRate(["PLB11"], 25000);
  const plb12Rate = getMasterRate(["PLB12"], 22);
  const plb13Rate = getMasterRate(["PLB13"], 14);
  const plb14Rate = getMasterRate(["PLB14"], 1800);
  const plb15Rate = getMasterRate(["PLB15"], 5000);

  const calculations = useMemo(() => {
    const totalBUA = Math.round(plotLength * plotWidth * 0.9 * floors);
    const tierMultiplier = packageTier === 'Ultra Premium' ? 1.50 : packageTier === 'Premium' ? 1.25 : 1.0;

    // IS Standard Plumbing Quantity Scaling Formulas based on BUA, Toilets, Floors
    const qty1 = Math.round(totalBUA * 0.90); // Water Supply Piping (~0.90 m per sqft BUA)
    const qty2 = Math.round(totalBUA * 0.65); // Sanitary Piping (~0.65 m per sqft BUA)
    const qty3 = Math.ceil((toilets * 6) + (floors * 2)); // Internal Water Supply Points (6 per toilet + 2 per floor)
    const qty4 = toilets; // Toilet Fittings Sets
    const qty5 = Math.max(1, floors); // Kitchen Sink & CP Fittings Sets (1 kitchen per floor / unit)
    const qty6 = toilets; // Geyser & Hot Water Line Points
    const qty7 = Math.round(totalBUA * 0.5); // Overhead Tank Capacity (0.5 L per sqft BUA)
    const qty8 = 1; // 1 HP Pump Installation Set
    const qty9 = 1; // Water Level Controller Set
    const qty10 = Math.max(1, Math.ceil(totalBUA / 2500)); // Solar Water Heater (150 LPD) Sets (1 per 2500 sqft)
    const qty11 = 1; // Cauvery Water Connection LS
    const qty12 = Math.round(totalBUA * 0.25); // Drainage Lines (~0.25 m per sqft BUA)
    const qty13 = Math.round(totalBUA * 0.35); // Rainwater Downpipes (~0.35 m per sqft BUA)
    const qty14 = Math.max(2, Math.ceil(totalBUA / 1000) + 1); // Manholes & Chambers
    const qty15 = 1; // Testing & Commissioning LS

    const rawItems = [
      { id: "PLB01", slNo: 1, code: plb01Rate.itemCode || "PLB01", category: "Water Supply System", name: "Water Supply Piping (CPVC/UPVC)", materials: "CPVC 20mm & 25mm SDR 11 pipes, fittings, clamps", uom: "m", qty: qty1, rateObj: plb01Rate },
      { id: "PLB02", slNo: 2, code: plb02Rate.itemCode || "PLB02", category: "Sanitary & Drainage System", name: "Sanitary Piping (PVC Soil & Waste)", materials: "SWR UPVC 110mm & 75mm 4kg/cm² soil & waste pipes", uom: "m", qty: qty2, rateObj: plb02Rate },
      { id: "PLB03", slNo: 3, code: plb03Rate.itemCode || "PLB03", category: "Internal Fixtures & Outlets", name: "Internal Water Supply Points (Kitchen & Bathrooms)", materials: "Brass concealed bib cocks, angle valves, concealed stop cocks", uom: "Points", qty: qty3, rateObj: plb03Rate },
      { id: "PLB04", slNo: 4, code: plb04Rate.itemCode || "PLB04", category: "Bathroom Sanitaryware", name: "Toilet Fittings (WC, EWC, Washbasin, CP Fittings)", materials: "EWC commode, health faucet, washbasin, pillar cock, CP fittings", uom: "set", qty: qty4, rateObj: plb04Rate },
      { id: "PLB05", slNo: 5, code: plb05Rate.itemCode || "PLB05", category: "Kitchen Plumbing", name: "Kitchen Sink & CP Fittings", materials: "SS 304 Kitchen sink, sink mixer/tap, bottle trap, waste coupling", uom: "set", qty: qty5, rateObj: plb05Rate },
      { id: "PLB06", slNo: 6, code: plb06Rate.itemCode || "PLB06", category: "Hot Water System", name: "Geyser & Hot Water Line Points", materials: "Insulated CPVC hot water piping, inlet/outlet angle valves", uom: "Points", qty: qty6, rateObj: plb06Rate },
      { id: "PLB07", slNo: 7, code: plb07Rate.itemCode || "PLB07", category: "Water Storage Infrastructure", name: "Overhead Syntex Tank (0.5 L per sqft capacity)", materials: "Triple layer HDPE insulated water storage tank", uom: "LTR", qty: qty7, rateObj: plb07Rate },
      { id: "PLB08", slNo: 8, code: plb08Rate.itemCode || "PLB08", category: "Pumping & Circulation", name: "1 HP Pump Installation", materials: "1 HP Monoblock/Submersible water pump, NRV, strainer", uom: "set", qty: qty8, rateObj: plb08Rate },
      { id: "PLB09", slNo: 9, code: plb09Rate.itemCode || "PLB09", category: "Automation & Controls", name: "Water Level Controller", materials: "Automatic magnetic float switch, indicator panel, sensor wiring", uom: "set", qty: qty9, rateObj: plb09Rate },
      { id: "PLB10", slNo: 10, code: plb10Rate.itemCode || "PLB10", category: "Solar Heating Infrastructure", name: "Solar Water Heater (150 LPD)", materials: "150 LPD Solar collector panel, insulated tank, stand & piping", uom: "set", qty: qty10, rateObj: plb10Rate },
      { id: "PLB11", slNo: 11, code: plb11Rate.itemCode || "PLB11", category: "Utility Water Connection", name: "Cauvery Water Connection (Main Line + Meter)", materials: "GI/HDPE main line inlet pipe, water meter chamber, NRV, ferrule", uom: "LS", qty: qty11, rateObj: plb11Rate },
      { id: "PLB12", slNo: 12, code: plb12Rate.itemCode || "PLB12", category: "External Sewer Infrastructure", name: "Drainage Lines (External PVC/Stoneware)", materials: "160mm / 6 inch heavy duty PVC / Stoneware sewer pipes", uom: "m", qty: qty12, rateObj: plb12Rate },
      { id: "PLB13", slNo: 13, code: plb13Rate.itemCode || "PLB13", category: "Rainwater Harvesting", name: "Rainwater Downpipes & Connections", materials: "110mm UV stabilized PVC downpipes, shoe bends, leaf strainers", uom: "m", qty: qty13, rateObj: plb13Rate },
      { id: "PLB14", slNo: 14, code: plb14Rate.itemCode || "PLB14", category: "Sewer Chambers & Septic", name: "Manholes & Chambers (Inspection/Septic)", materials: "Brickwork/Precast inspection chamber, CI cover, gully trap", uom: "nos", qty: qty14, rateObj: plb14Rate },
      { id: "PLB15", slNo: 15, code: plb15Rate.itemCode || "PLB15", category: "Quality & Testing", name: "Testing & Commissioning (Water Supply + Sanitary)", materials: "Hydrostatic pressure testing, smoke testing, flushing & commissioning", uom: "LS", qty: qty15, rateObj: plb15Rate }
    ];

    const selectedItems = rawItems.filter(it => selectedItemIds.includes(it.id));

    let totalMaterialCost = 0;
    let totalLabourCost = 0;

    const processedItems = selectedItems.map((it, idx) => {
      const isFound = it.rateObj.found && Number(it.rateObj.rate) > 0;
      const baseRate = isFound ? Number(it.rateObj.rate) : 0;
      const rateVal = Math.round(baseRate * tierMultiplier);
      const amountVal = isFound ? Math.round(it.qty * rateVal) : 0;

      // 65% material, 35% labour distribution
      totalMaterialCost += amountVal * 0.65;
      totalLabourCost += amountVal * 0.35;

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
  }, [selectedItemIds, plotLength, plotWidth, floors, toilets, packageTier, plb01Rate, plb02Rate, plb03Rate, plb04Rate, plb05Rate, plb06Rate, plb07Rate, plb08Rate, plb09Rate, plb10Rate, plb11Rate, plb12Rate, plb13Rate, plb14Rate, plb15Rate]);

  const handleCalculate = () => {
    setHasCalculated(true);
    setIsInputModified(false);
    setIsCalculatedBlue(true);
    setTimeout(() => setIsCalculatedBlue(false), 2000);
  };

  const handleExportExcel = () => {
    checkAndRun("plumbing_boq_export", "PLM-BOQ", () => {
      const data = [
        ["BUILDMITRA RESIDENTIAL PLUMBING BOQ REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Package Tier", `${packageTier} (${packageTier === 'Ultra Premium' ? '+50% Luxury Multiplier' : packageTier === 'Premium' ? '+25% Premium Multiplier' : 'Baseline Standard Multiplier'})`],
        ["Built-up Area", `${calculations.totalBUA} Sq.ft`],
        ["Toilets Count", toilets],
        ["Material Subtotal", formatCurrency(calculations.totalMaterialCost)],
        ["Labour Subtotal", formatCurrency(calculations.totalLabourCost)],
        ["Est. Rate / Sq.ft", `${formatCurrency(calculations.costPerSqft)} / Sq.ft`],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(calculations.grandTotalCost)],
        [],
        ["ITEMIZED PLUMBING BOQ"],
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
      XLSX.utils.book_append_sheet(wb, ws, "Plumbing_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Plumbing_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = () => {
    checkAndRun("plumbing_boq_export", "PLM-BOQ", () => {
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
        "BuildMitra – Residential Plumbing BOQ Report",
        [
          ["Package Tier:", `${packageTier} (${packageTier === 'Ultra Premium' ? '+50% Luxury' : packageTier === 'Premium' ? '+25% Premium' : 'Baseline Standard'})`],
          ["Built-up Area:", `${calculations.totalBUA} Sq.ft`],
          ["Toilets Count:", toilets],
          ["Material Subtotal:", formatCurrency(calculations.totalMaterialCost)],
          ["Labour Subtotal:", formatCurrency(calculations.totalLabourCost)],
          ["Est. Rate / Sq.ft:", `₹${calculations.costPerSqft.toFixed(2)} / Sq.ft`],
          ["GRAND TOTAL ESTIMATED COST:", formatCurrency(calculations.grandTotalCost)]
        ],
        headers,
        rows,
        `BuildMitra_Plumbing_BOQ_${Date.now()}.pdf`
      );
    });
  };

  return (
    <>
      <Head>
        <title>Plumbing &amp; Sanitary BOQ Estimator | BuildMitra</title>
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header} className="bm-boq-top-header">
          <div>
            <span style={styles.badge}>MEP &amp; PLUMBING BOQ</span>
            <h1 style={styles.headerTitle}>🚰 BuildMitra – Plumbing BOQ Estimator</h1>
          </div>
          <button style={styles.backBtn} className="bm-top-back-btn" onClick={() => router.push("/contractor-dashboard")}>← Back to Dashboard</button>
        </div>

        <MarketRateTrend />

        {/* Inputs */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span>📐 Enter Plumbing &amp; Building Specifications</span>
          </div>

          <div style={styles.gridCompact}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Plot Length (ft)</label>
              <input type="number" placeholder="e.g. 30" value={plotLength || ''} onChange={(e) => handleInputChange(setPlotLength, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Plot Width (ft)</label>
              <input type="number" placeholder="e.g. 40" value={plotWidth || ''} onChange={(e) => handleInputChange(setPlotWidth, Number(e.target.value))} style={{ ...styles.input, ...(isInputModified ? styles.inputModified : {}) }} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Floors Count</label>
              <input type="number" placeholder="e.g. 3" value={floors || ''} onChange={(e) => handleInputChange(setFloors, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Toilets Count</label>
              <input type="number" placeholder="e.g. 4" value={toilets || ''} onChange={(e) => handleInputChange(setToilets, Number(e.target.value))} style={styles.input} />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Specification Package Tier</label>
              <select
                value={packageTier}
                onChange={(e) => handleInputChange(setPackageTier, e.target.value as any)}
                style={{
                  ...styles.select,
                  fontWeight: '700',
                  color: packageTier === 'Ultra Premium' ? '#7c3aed' : packageTier === 'Premium' ? '#2563eb' : '#0284c7',
                  borderColor: packageTier === 'Ultra Premium' ? '#c4b5fd' : packageTier === 'Premium' ? '#93c5fd' : '#7dd3fc',
                  backgroundColor: packageTier === 'Ultra Premium' ? '#f5f3ff' : packageTier === 'Premium' ? '#eff6ff' : '#f0f9ff'
                }}
              >
                <option value="Standard">Standard (Baseline ~₹120/sqft)</option>
                <option value="Premium">Premium (+25% Tier Multiplier)</option>
                <option value="Ultra Premium">Ultra Premium (+50% Tier Multiplier)</option>
              </select>
            </div>
          </div>

          {/* Horizontal Plumbing Line Items Selector */}
          <div style={{ marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <span>📋 <strong>Include / Exclude Plumbing BOQ Line Items</strong></span>
                <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#0284c7', color: '#ffffff', padding: '3px 10px', borderRadius: '12px' }}>
                  {selectedItemIds.length} of {ALL_PLUMBING_ITEMS_DEF.length} Selected
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
                  ✓ Select All ({ALL_PLUMBING_ITEMS_DEF.length})
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
                  style={{ padding: '5px 12px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: '1px solid #0284c7', backgroundColor: isDropdownOpen ? '#0284c7' : '#ffffff', color: isDropdownOpen ? '#ffffff' : '#0284c7', cursor: 'pointer' }}
                >
                  {isDropdownOpen ? '▲ Hide Items' : '▼ Filter Items List'}
                </button>
              </div>
            </div>

            {/* Horizontal Pill Badges List */}
            {isDropdownOpen && (
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px', marginTop: '8px', maxHeight: '280px', overflowY: 'auto', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALL_PLUMBING_ITEMS_DEF.filter(it => it.name.toLowerCase().includes(itemSearch.toLowerCase()) || it.code.toLowerCase().includes(itemSearch.toLowerCase()) || it.materials.toLowerCase().includes(itemSearch.toLowerCase())).map(item => {
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
                          backgroundColor: isChecked ? '#0284c7' : '#ffffff',
                          color: isChecked ? '#ffffff' : '#475569',
                          border: isChecked ? '1px solid #0284c7' : '1px solid #cbd5e1',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: isChecked ? '700' : '500',
                          boxShadow: isChecked ? '0 2px 4px rgba(2,132,199,0.18)' : 'none',
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
                          <code style={{ fontSize: '11px', color: isChecked ? '#e0f2fe' : '#0284c7' }}>{item.code}</code> – {item.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bm-boq-actions" style={{ marginTop: '12px' }}>
            <button style={styles.btnPrimary} onClick={handleCalculate}>
              <span className="bm-desktop-only">⚡ Calculate Plumbing BOQ</span>
              <span className="bm-mobile-only">⚡ Calc</span>
            </button>
            <button style={styles.btnReset} onClick={() => { setPlotLength(0); setPlotWidth(0); setFloors(0); setToilets(0); setHasCalculated(false); setPackageTier('Standard'); selectAllItems(); }}>
              <span className="bm-desktop-only">🔄 Reset</span>
              <span className="bm-mobile-only">🔄 Reset</span>
            </button>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>
              <span className="bm-desktop-only">📊 Export Excel</span>
              <span className="bm-mobile-only">📊 Excel</span>
            </button>
            <button style={styles.btnSuccess} onClick={handleExportPDF}>
              <span className="bm-desktop-only">📄 Export PDF Report</span>
              <span className="bm-mobile-only">📄 PDF</span>
            </button>
          </div>
        </div>

        {!hasCalculated ? (
          <div style={{
            backgroundColor: "#ffffff",
            border: "2px dashed #0284c7",
            borderRadius: "14px",
            padding: "36px 20px",
            textAlign: "center",
            color: "#0284c7",
            margin: "20px 0"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚰</div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Ready for Plumbing BOQ Calculation</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>Please enter plot length, width &amp; toilet count above (e.g. 30ft × 40ft, 4 toilets) and click <strong>"⚡ Calculate Plumbing BOQ"</strong> to generate itemized BOQ report.</div>
          </div>
        ) : (
          <>
            {/* Result Metric Cards */}
        <div style={styles.summaryGrid} className="bm-boq-summary-scroll">
          <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">Built-up Area</span>
              <span className="bm-mobile-only">BUA</span>
            </span>
            <span style={{ ...styles.metricVal, color: isCalculatedBlue ? '#e0f2fe' : '#ffffff' }}>{calculations.totalBUA.toLocaleString()} Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">Material Subtotal</span>
              <span className="bm-mobile-only">Mat ₹</span>
            </span>
            <span style={styles.metricVal}>{formatCurrency(calculations.totalMaterialCost)}</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricPurple }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">Labour Subtotal</span>
              <span className="bm-mobile-only">Lab ₹</span>
            </span>
            <span style={styles.metricVal}>{formatCurrency(calculations.totalLabourCost)}</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">Est. Rate / Sq.ft</span>
              <span className="bm-mobile-only">Rate/Sq.ft</span>
            </span>
            <span style={styles.metricVal}>₹{calculations.costPerSqft.toFixed(2)} / Sq.ft</span>
          </div>
          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>
              <span className="bm-desktop-only">GRAND ESTIMATED TOTAL</span>
              <span className="bm-mobile-only">Grand ₹</span>
            </span>
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
        <div style={styles.tableContainer} className="bm-boq-table-scroll">
          <div style={{ padding: '12px 16px', backgroundColor: '#0284c7', color: 'white', fontWeight: '800', fontSize: '16px' }}>
            📑 Itemized Plumbing &amp; Sanitary BOQ (Admin Master Linked - 15 Line Items)
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sl.No</th>
                <th style={styles.th} className="bm-hide-mobile">Item Code</th>
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
                  <td style={styles.td} className="bm-hide-mobile"><code>{it.code}</code></td>
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
              <tr style={{ backgroundColor: '#0284c7', color: 'white', fontWeight: '800' }}>
                <td colSpan={7} style={{ padding: '12px 14px', fontSize: '16px' }}>GRAND TOTAL ESTIMATED COST</td>
                <td style={{ padding: '12px 14px', fontSize: '18px' }}>{formatCurrency(calculations.grandTotalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
          </>
        )}
      </div>
    </>
  );
}


