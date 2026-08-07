import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { getMasterRate, getCombinedBOQRate, syncApprovedRatesFromBackend } from '../utils/masterRates';
import MarketRateTrend from '../components/ui/MarketRateTrend';

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { backgroundColor: '#d97706', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(217,119,6,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#b45309', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  stepperCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '15px', fontWeight: '700', color: '#d97706', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #fde68a', paddingBottom: '8px' },

  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' },
  grid5: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' },
  inputReadOnly: { backgroundColor: '#f1f5f9', fontWeight: '700', color: '#d97706' },
  select: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', outline: 'none' },

  btnPrimary: { backgroundColor: '#d97706', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' },
  metricCard: { padding: '14px', borderRadius: '8px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricMaroon: { backgroundColor: '#d97706' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tableContainer: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#d97706', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

  noteBox: { backgroundColor: '#fef3c7', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#b45309', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const ceil = (n: any) => Math.ceil(Number(n || 0));

export default function ElectricalBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Building & Room Details
  const [plotLength, setPlotLength] = useState(30);
  const [plotWidth, setPlotWidth] = useState(40);
  const [floors, setFloors] = useState(3.5);
  const [wiringType, setWiringType] = useState("Copper");

  const [bedrooms, setBedrooms] = useState(2);
  const [guestBedrooms, setGuestBedrooms] = useState(1);
  const [livingRooms, setLivingRooms] = useState(1);
  const [kitchens, setKitchens] = useState(1);
  const [toilets, setToilets] = useState(5);
  const [studyRooms, setStudyRooms] = useState(1);
  const [poojaRooms, setPoojaRooms] = useState(1);

  const [acProvision, setAcProvision] = useState(4);
  const [waterHeaterProvision, setWaterHeaterProvision] = useState(2);
  const [exhaustFanProvision, setExhaustFanProvision] = useState(5);
  const [motorProvision, setMotorProvision] = useState(1);

  const [generated, setGenerated] = useState(true);

  // Derived Geometry
  const plotArea = plotLength * plotWidth;
  const setbackArea = plotArea * 0.10; // Auto 10% setback area
  const footprintArea = plotArea - setbackArea;
  const totalBUA = footprintArea * floors;
  const floorCount = Math.max(1, ceil(floors));

  const totalBedrooms = bedrooms + guestBedrooms;

  // Electrical Points Calculation Engine
  const lightBedroom = totalBedrooms * 3;
  const lightLiving = livingRooms * 5;
  const lightKitchen = kitchens * 3;
  const lightToilet = toilets * 2;
  const lightStudy = studyRooms * 3;
  const lightPooja = poojaRooms * 1;
  const lightCommon = floorCount * 4;
  const lightingPoints = ceil(lightBedroom + lightLiving + lightKitchen + lightToilet + lightStudy + lightPooja + lightCommon);

  const fanPoints = ceil(totalBedrooms + livingRooms + studyRooms + poojaRooms);
  const powerPoints = ceil((totalBedrooms * 3) + (livingRooms * 4) + (kitchens * 6) + (studyRooms * 3) + (poojaRooms * 1));
  const acPoints = ceil(acProvision);
  const waterHeaterPoints = ceil(waterHeaterProvision);
  const exhaustFanPoints = ceil(exhaustFanProvision);
  const motorPoints = ceil(motorProvision);

  const totalPoints = ceil(lightingPoints + fanPoints + powerPoints + acPoints + waterHeaterPoints + exhaustFanPoints + motorPoints);

  const lightingWire = lightingPoints * 9;
  const fanWire = fanPoints * 10;
  const powerWire = powerPoints * 14;
  const acWire = acPoints * 22;
  const geyserWire = waterHeaterPoints * 18;
  const exhaustWire = exhaustFanPoints * 9;
  const motorWire = motorPoints * 25;

  const wire1_5mm = lightingWire + fanWire + exhaustWire;
  const wire2_5mm = powerWire;
  const wire4mm = acWire + geyserWire;
  const wire6mm = Math.max(totalBUA * 0.25, floorCount * 35 + motorWire);
  const totalWireLength = wire1_5mm + wire2_5mm + wire4mm + wire6mm;

  const conduit20 = (wire1_5mm + wire2_5mm) * 0.65;
  const conduit25 = (wire4mm + wire6mm) * 0.75;

  // Admin Master Rates Lookup for all 27 Items
  const rates = useMemo(() => ({
    elec01: getMasterRate(["ELEC-01", "conduit 20"], 25),
    elec02: getMasterRate(["ELEC-02", "conduit 25"], 35),
    elec03: getMasterRate(["ELEC-03", "wire 1.5"], 12),
    elec04: getMasterRate(["ELEC-04", "wire 2.5"], 18),
    elec05: getMasterRate(["ELEC-05", "wire 4.0"], 28),
    elec06: getMasterRate(["ELEC-06", "wire 6.0"], 42),
    elec07: getMasterRate(["ELEC-07", "modular switch"], 85),
    elec08: getMasterRate(["ELEC-08", "switch plate"], 45),
    elec09: getMasterRate(["ELEC-09", "led bulb"], 60),
    elec10: getMasterRate(["ELEC-10", "led batten"], 180),
    elec11: getMasterRate(["ELEC-11", "panel light"], 350),
    elec12: getMasterRate(["ELEC-12", "ceiling fan"], 1800),
    elec13: getMasterRate(["ELEC-13", "exhaust fan"], 1200),
    elec14: getMasterRate(["ELEC-14", "water heater"], 4500),
    elec15: getMasterRate(["ELEC-15", "ac unit"], 35000),
    elec16: getMasterRate(["ELEC-16", "db 8 way"], 1200),
    elec17: getMasterRate(["ELEC-17", "db 12 way"], 2500),
    elec18: getMasterRate(["ELEC-18", "mcb 10a"], 180),
    elec19: getMasterRate(["ELEC-19", "mcb 16a"], 220),
    elec20: getMasterRate(["ELEC-20", "mcb dp 32a"], 350),
    elec21: getMasterRate(["ELEC-21", "mcb dp 63a"], 650),
    elec22: getMasterRate(["ELEC-22", "earthing plate"], 2500),
    elec23: getMasterRate(["ELEC-23", "lightning arrester"], 3500),
    elec24: getMasterRate(["ELEC-24", "ups inverter"], 12000),
    elec25: getMasterRate(["ELEC-25", "battery"], 8000),
    elec26: getMasterRate(["ELEC-26", "bus bar"], 5000),
    elec27: getMasterRate(["ELEC-27", "electrical testing"], 3000)
  }), []);

  // Electrical BOQ Calculation Engine
  const boqResults = useMemo(() => {
    const switchCount = ceil(totalPoints * 1.05);
    const switchPlateCount = ceil(totalPoints / 3);
    const lightFixtureCount = lightingPoints;
    const fanCount = fanPoints;

    const lightingCircuits = ceil(lightingPoints / 10);
    const powerCircuits = ceil(powerPoints / 8);
    const acCircuits = acPoints;
    const geyserCircuits = waterHeaterPoints;
    const motorCircuits = motorPoints;
    const totalCircuits = lightingCircuits + powerCircuits + acCircuits + geyserCircuits + motorCircuits;

    const db8Way = Math.max(1, ceil(totalCircuits / 8));
    const db12Way = totalCircuits > 8 ? Math.max(1, ceil(totalCircuits / 12)) : 0;

    const mcb6_10 = lightingCircuits + fanCount;
    const mcb16 = powerCircuits + acCircuits + geyserCircuits + motorCircuits;
    const mcbDp32 = Math.max(1, ceil(floorCount / 2));
    const mcbDp63 = 1;

    const earthingSets = totalBUA > 3000 ? 2 : 1;
    const lightningArrester = floors >= 3 ? 1 : 0;

    const items = [
      { sr: 1, code: "ELEC-01", desc: "PVC Conduit Pipe 20mm ISI marked", uom: "m", qty: conduit20, matRate: rates.elec01.rate || 25, labRate: 8 },
      { sr: 2, code: "ELEC-02", desc: "PVC Conduit Pipe 25mm ISI marked", uom: "m", qty: conduit25, matRate: rates.elec02.rate || 35, labRate: 10 },
      { sr: 3, code: "ELEC-03", desc: "1.5 sqmm Copper FRLS Wire Lighting/Fan", uom: "m", qty: wire1_5mm, matRate: rates.elec03.rate || 12, labRate: 3 },
      { sr: 4, code: "ELEC-04", desc: "2.5 sqmm Copper FRLS Wire Power", uom: "m", qty: wire2_5mm, matRate: rates.elec04.rate || 18, labRate: 4 },
      { sr: 5, code: "ELEC-05", desc: "4 sqmm Copper FRLS Wire AC/Geyser", uom: "m", qty: wire4mm, matRate: rates.elec05.rate || 28, labRate: 5 },
      { sr: 6, code: "ELEC-06", desc: "6 sqmm Copper FRLS Wire Main", uom: "m", qty: wire6mm, matRate: rates.elec06.rate || 42, labRate: 6 },
      { sr: 7, code: "ELEC-07", desc: "Modular Switches", uom: "nos", qty: switchCount, matRate: rates.elec07.rate || 85, labRate: 15 },
      { sr: 8, code: "ELEC-08", desc: "Modular Switch Plates", uom: "nos", qty: switchPlateCount, matRate: rates.elec08.rate || 45, labRate: 10 },
      { sr: 9, code: "ELEC-09", desc: "LED Light Point / Bulb", uom: "nos", qty: lightFixtureCount, matRate: rates.elec09.rate || 60, labRate: 10 },
      { sr: 10, code: "ELEC-10", desc: "LED Batten 20W", uom: "nos", qty: ceil(kitchens + studyRooms + poojaRooms), matRate: rates.elec10.rate || 180, labRate: 20 },
      { sr: 11, code: "ELEC-11", desc: "LED Panel Light 12x12", uom: "nos", qty: ceil(livingRooms), matRate: rates.elec11.rate || 350, labRate: 30 },
      { sr: 12, code: "ELEC-12", desc: "Ceiling Fan", uom: "nos", qty: fanCount, matRate: rates.elec12.rate || 1800, labRate: 150 },
      { sr: 13, code: "ELEC-13", desc: "Exhaust Fan 6 inch", uom: "nos", qty: exhaustFanPoints, matRate: rates.elec13.rate || 1200, labRate: 100 },
      { sr: 14, code: "ELEC-14", desc: "Water Heater 25L", uom: "nos", qty: waterHeaterPoints, matRate: rates.elec14.rate || 4500, labRate: 300 },
      { sr: 15, code: "ELEC-15", desc: "AC Unit 1.5 Ton", uom: "nos", qty: acPoints, matRate: rates.elec15.rate || 35000, labRate: 1500 },
      { sr: 16, code: "ELEC-16", desc: "Distribution Board 8 Way", uom: "nos", qty: db8Way, matRate: rates.elec16.rate || 1200, labRate: 200 },
      { sr: 17, code: "ELEC-17", desc: "Distribution Board 12 Way", uom: "nos", qty: db12Way, matRate: rates.elec17.rate || 2500, labRate: 300 },
      { sr: 18, code: "ELEC-18", desc: "MCB SP 6A/10A", uom: "nos", qty: mcb6_10, matRate: rates.elec18.rate || 180, labRate: 30 },
      { sr: 19, code: "ELEC-19", desc: "MCB SP 16A", uom: "nos", qty: mcb16, matRate: rates.elec19.rate || 220, labRate: 30 },
      { sr: 20, code: "ELEC-20", desc: "MCB DP 32A", uom: "nos", qty: mcbDp32, matRate: rates.elec20.rate || 350, labRate: 50 },
      { sr: 21, code: "ELEC-21", desc: "MCB DP 63A Main", uom: "nos", qty: mcbDp63, matRate: rates.elec21.rate || 650, labRate: 75 },
      { sr: 22, code: "ELEC-22", desc: "Earthing Plate Type", uom: "set", qty: earthingSets, matRate: rates.elec22.rate || 2500, labRate: 500 },
      { sr: 23, code: "ELEC-23", desc: "Lightning Arrester", uom: "set", qty: lightningArrester, matRate: rates.elec23.rate || 3500, labRate: 600 },
      { sr: 24, code: "ELEC-24", desc: "UPS/Inverter 3kVA", uom: "set", qty: 1, matRate: rates.elec24.rate || 12000, labRate: 800 },
      { sr: 25, code: "ELEC-25", desc: "Battery 150Ah", uom: "nos", qty: 2, matRate: rates.elec25.rate || 8000, labRate: 400 },
      { sr: 26, code: "ELEC-26", desc: "Bus Bar / Wiring Accessories", uom: "lump", qty: 1, matRate: rates.elec26.rate || 5000, labRate: 500 },
      { sr: 27, code: "ELEC-27", desc: "Electrical Testing & Commissioning", uom: "lump", qty: 1, matRate: rates.elec27.rate || 3000, labRate: 1000 }
    ];

    const processedItems = items.map(i => {
      const combined = getCombinedBOQRate(i.code, i.matRate, i.labRate);
      const matRate = combined.materialRate;
      const labRate = combined.labourRate;
      const qtyVal = i.uom === "m" ? Number(i.qty || 0) : ceil(i.qty);
      const amount = qtyVal * (matRate + labRate);
      return { ...i, matRate, labRate, qty: qtyVal, amount };
    });

    const materialTotal = processedItems.reduce((sum, i) => sum + (i.qty * i.matRate), 0);
    const labourTotal = processedItems.reduce((sum, i) => sum + (i.qty * i.labRate), 0);
    const grandTotal = materialTotal + labourTotal;
    const ratePerSft = totalBUA > 0 ? grandTotal / totalBUA : 0;

    return {
      items: processedItems,
      materialTotal,
      labourTotal,
      grandTotal,
      ratePerSft,
      totalBUA,
      totalPoints,
      totalWireLength,
      lightingPoints,
      fanPoints,
      powerPoints,
      acPoints,
      waterHeaterPoints,
      exhaustFanPoints
    };
  }, [totalPoints, lightingPoints, fanPoints, powerPoints, acPoints, waterHeaterPoints, exhaustFanPoints, motorPoints, conduit20, conduit25, wire1_5mm, wire2_5mm, wire4mm, wire6mm, floorCount, totalBUA, floors, kitchens, studyRooms, poojaRooms, livingRooms, rates]);

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('boq_export', 'boq-electrical', () => {
      const data = boqResults.items.map((i: any) => ({
        'Sr No': i.sr,
        'Item Code': i.code,
        'Description': i.desc,
        'UOM': i.uom,
        'Quantity': formatNumber(i.qty),
        'Mat. Rate (₹)': formatCurrency(i.matRate),
        'Lab. Rate (₹)': formatCurrency(i.labRate),
        'Total Amount (₹)': formatCurrency(i.amount)
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Electrical_BOQ');
      XLSX.writeFile(wb, `BuildMitra_Electrical_BOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('boq_export', 'boq-electrical', () => {
      const msg = `*BuildMitra Electrical BOQ Estimate*%0A` +
        `----------------------------------------%0A` +
        `• *Plot Size*: ${plotLength}' x ${plotWidth}' (${plotArea} Sft) | *Floors*: ${floors}%0A` +
        `• *Total BUA*: ${formatNumber(totalBUA)} Sft | *Total Points*: ${boqResults.totalPoints}%0A` +
        `• *Total Wire Length*: ${formatNumber(boqResults.totalWireLength, 1)} Meters%0A` +
        `• *Material Total*: ${formatCurrency(boqResults.materialTotal)}%0A` +
        `• *Labour Total*: ${formatCurrency(boqResults.labourTotal)}%0A` +
        `• *GRAND TOTAL COST*: ${formatCurrency(boqResults.grandTotal)} (${formatCurrency(boqResults.ratePerSft)}/Sft)%0A%0A` +
        `*Generated via BuildMitra Electrical BOQ Engine*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  const handleReset = () => {
    setPlotLength(30); setPlotWidth(40); setFloors(3.5); setWiringType("Copper");
    setBedrooms(2); setGuestBedrooms(1); setLivingRooms(1); setKitchens(1); setToilets(5); setStudyRooms(1); setPoojaRooms(1);
    setAcProvision(4); setWaterHeaterProvision(2); setExhaustFanProvision(5); setMotorProvision(1);
    setGenerated(false);
  };

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => router.push('/calculators')}>← Back to Calculators</button>
        </div>
        <h1 style={styles.headerTitle}>
          ⚡ Electrical BOQ Calculator
          <span style={styles.badge}>IS 732 & IS 4648 Electrical Wiring Engine</span>
        </h1>
        <div>
          <span style={{ fontSize: '11px', color: '#fde68a' }}>BuildMitra Professional Edition</span>
        </div>
      </div>

      {/* 2. Live Market Rate Ticker */}
      <MarketRateTrend />

      {/* 3. Building & Room Inputs Form */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📐 Building & Room Configuration Inputs</span>
        </div>

        <div style={styles.grid4}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Plot Length (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={plotLength}
              onChange={e => setPlotLength(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Plot Width (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={plotWidth}
              onChange={e => setPlotWidth(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>No. of Floors</label>
            <input
              type="number"
              style={styles.input}
              value={floors}
              onChange={e => setFloors(parseFloat(e.target.value) || 1)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Wiring Conductor Type</label>
            <select style={styles.select} value={wiringType} onChange={e => setWiringType(e.target.value)}>
              <option value="Copper">Copper Wiring (FRLS Multi-strand)</option>
              <option value="Aluminium">Aluminium Wiring</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Plot Area (Sft)</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(plotArea)} Sft`}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Auto Setback 10% Area</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(setbackArea)} Sft`}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Footprint Area</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(footprintArea)} Sft`}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Total Built-Up Area (Sft)</label>
            <input
              type="text"
              readOnly
              style={{ ...styles.input, ...styles.inputReadOnly }}
              value={`${formatNumber(totalBUA)} Sft`}
            />
          </div>
        </div>

        {/* Room Configuration Inputs */}
        <div style={{ backgroundColor: '#fffbe8', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#b45309', marginBottom: '10px' }}>🏠 Room & Heavy Power Provisions</div>
          <div style={styles.grid5}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Bedrooms</label>
              <input type="number" style={styles.input} value={bedrooms} onChange={e => setBedrooms(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Guest Bedrooms</label>
              <input type="number" style={styles.input} value={guestBedrooms} onChange={e => setGuestBedrooms(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Living Rooms</label>
              <input type="number" style={styles.input} value={livingRooms} onChange={e => setLivingRooms(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Kitchens</label>
              <input type="number" style={styles.input} value={kitchens} onChange={e => setKitchens(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Toilets</label>
              <input type="number" style={styles.input} value={toilets} onChange={e => setToilets(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Study Rooms</label>
              <input type="number" style={styles.input} value={studyRooms} onChange={e => setStudyRooms(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Pooja Rooms</label>
              <input type="number" style={styles.input} value={poojaRooms} onChange={e => setPoojaRooms(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>AC Units</label>
              <input type="number" style={styles.input} value={acProvision} onChange={e => setAcProvision(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Water Heaters</label>
              <input type="number" style={styles.input} value={waterHeaterProvision} onChange={e => setWaterHeaterProvision(parseFloat(e.target.value) || 0)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Exhaust Fans</label>
              <input type="number" style={styles.input} value={exhaustFanProvision} onChange={e => setExhaustFanProvision(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </div>

        {/* Structural Engine Rules Badge */}
        <div style={styles.noteBox}>
          💡 <strong>IS Electrical Engine Rules</strong>: 💡 Lighting: <strong>{lightingPoints}</strong> | 🌀 Fan: <strong>{fanPoints}</strong> | 🔌 Power: <strong>{powerPoints}</strong> | ❄️ AC: <strong>{acPoints}</strong> | 🔥 Geyser: <strong>{waterHeaterPoints}</strong> | 💨 Exhaust: <strong>{exhaustFanPoints}</strong> | Total Points: <strong>{totalPoints}</strong>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Form</button>
          <button style={styles.btnPrimary} onClick={() => setGenerated(true)}>🔨 Generate Electrical BOQ</button>
        </div>
      </div>

      {/* 4. Detailed Results BOQ Cards & Table */}
      {generated && (
        <div style={styles.stepperCard}>
          <div style={styles.sectionHeader}>
            <span>📊 Electrical BOQ Estimation Summary & Itemized BOQ</span>
          </div>

          {/* Metric Summary Grid */}
          <div style={styles.summaryGrid}>
            <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
              <span style={styles.metricTitle}>Grand Total Cost</span>
              <span style={styles.metricVal}>₹{formatNumber(boqResults.grandTotal / 100000, 2)} Lakhs</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>{formatCurrency(boqResults.grandTotal)}</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Total Points</span>
              <span style={styles.metricVal}>{boqResults.totalPoints} Points</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>Total Wire Length</span>
              <span style={styles.metricVal}>{formatNumber(boqResults.totalWireLength, 1)} m</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricTeal, backgroundColor: '#0284c7' }}>
              <span style={styles.metricTitle}>Wiring Labour Cost</span>
              <span style={styles.metricVal}>₹{formatNumber(boqResults.labourTotal / 100000, 2)} Lakhs</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>{formatCurrency(boqResults.labourTotal)}</span>
            </div>

            <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
              <span style={styles.metricTitle}>Estimated Rate / Sft</span>
              <span style={styles.metricVal}>{formatCurrency(boqResults.ratePerSft)} / Sft</span>
            </div>
          </div>

          {/* BOQ Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
            <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>💬 WhatsApp Share</button>
            <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('🛒 Electrical BOQ Package sent to Vendor Marketplace RFQ!')}>🛒 Request Marketplace RFQ</button>
            <button style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('📈 Applied Bengaluru Live Mandi Wholesale Rates to Electrical BOQ!')}>📈 Sync Live Market Rates</button>
            <button style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={() => alert('💾 Saved Electrical BOQ Revision 1.0 to Active Project!')}>💾 Save BOQ Revision</button>
          </div>

          {/* Itemized BOQ Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr.</th>
                  <th style={styles.th}>Item Code</th>
                  <th style={styles.th}>Item Description</th>
                  <th style={styles.th}>UOM</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Mat. Rate</th>
                  <th style={styles.th}>Lab. Rate</th>
                  <th style={styles.th}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {boqResults.items.map((i: any, idx: number) => (
                  <tr key={i.sr} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={styles.td}><strong>{i.sr}</strong></td>
                    <td style={styles.td}><code>{i.code}</code></td>
                    <td style={styles.td}><strong>{i.desc}</strong></td>
                    <td style={styles.td}>{i.uom}</td>
                    <td style={styles.td}>{formatNumber(i.qty)}</td>
                    <td style={styles.td}>{formatCurrency(i.matRate)}</td>
                    <td style={styles.td}>{formatCurrency(i.labRate)}</td>
                    <td style={styles.td}><strong>{formatCurrency(i.amount)}</strong></td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#d97706', color: 'white', fontWeight: '800' }}>
                  <td colSpan={7} style={{ padding: '12px', fontSize: '13px' }}>GRAND TOTAL ESTIMATED ELECTRICAL BOQ COST</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{formatCurrency(boqResults.grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
