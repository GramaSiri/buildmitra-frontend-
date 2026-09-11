import { syncApprovedRatesFromBackend } from "../utils/masterRates";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';

const styles = {
  container: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' as const },
  header: { maxWidth: '100%', margin: '0 0 8px 0', padding: '6px 10px', borderRadius: '6px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '16px', lineHeight: '1.15', fontWeight: '800', display: 'flex', alignItems: 'center', flexWrap: 'wrap' as const, gap: '4px' },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#2d6a4f', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' as const, border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(68px, 1fr))', gap: '5px', alignItems: 'end', width: '100%', maxWidth: '100%', marginBottom: '5px' },
  inputGroup: { marginBottom: '0px', minWidth: 0 },
  label: { display: 'block', fontSize: '10px', lineHeight: '1.1', fontWeight: '700', marginBottom: '2px', whiteSpace: 'normal' as const },
  input: { width: '100%', minWidth: 0, maxWidth: '100%', height: '32px', padding: '3px 5px', fontSize: '12px', lineHeight: '1.1', textAlign: 'center' as const, borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' as const },
  select: { width: '100%', minWidth: 0, maxWidth: '100%', height: '32px', padding: '3px 4px', fontSize: '11px', lineHeight: '1.1', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
  buttonRow: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(68px, 1fr))', gap: '4px', marginBottom: '6px', width: '100%' },
  buttonGenerate: { backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 6px', height: '32px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'normal' as const },
  buttonExport: { backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 6px', height: '32px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'normal' as const },
  buttonWhatsapp: { backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 6px', height: '32px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'normal' as const },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(112px, 1fr))',
    gap: '5px',
    width: '100%',
    maxWidth: '100%',
    overflowX: 'auto' as const,
    overflowY: 'hidden' as const,
    WebkitOverflowScrolling: 'touch' as const,
    touchAction: 'pan-x' as const,
    overscrollBehaviorX: 'contain' as const,
    scrollSnapType: 'x proximity',
    padding: '3px 2px 7px',
    margin: '3px 0 6px'
  },
  card: { padding: "3px 2px", borderRadius: "4px", textAlign: "center" as const, minHeight: "0", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" as const, justifyContent: "center", alignItems: "center" },
  cardBlue: { backgroundColor: '#2196F3' },
  cardLightGreen: { backgroundColor: '#8BC34A' },
  cardLightOrange: { backgroundColor: '#FFB74D' },
  cardLightTeal: { backgroundColor: '#4DB6AC' },
  cardValue: { fontSize: "10px", fontWeight: "bold", margin: "1px 0 0 0", color: "#0f172a", whiteSpace: "nowrap" as const },
  tablecontainer: { width: '100%', maxWidth: '100%', margin: '0', padding: '4px 8px', boxSizing: 'border-box' as const },
  table: { width: '100%', tableLayout: 'fixed' as const, borderCollapse: 'collapse' as const, fontSize: '10px' },
  th: { padding: '3px 4px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#f1f5f9', textAlign: 'left' as const, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' as const },
  td: { padding: '3px 4px', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' as const },
  evenRow: { backgroundColor: '#f9f9f9' },
  rateInfo: { maxWidth: '100%', margin: '0 0 8px 0', padding: '4px 8px', borderRadius: '6px' }
};

const formatNumber = (num: any) => {
  if (!num || isNaN(num)) return "0";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function PatioPage() {
  React.useEffect(() => { syncApprovedRatesFromBackend(); }, []);
  
  const { checkAndRun } = usePaymentBarrier();
  const router = useRouter();
  const { rates, loading } = useRates();
  
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [thickness, setThickness] = useState(100);
  const [unit, setUnit] = useState('feet');
  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [wastage, setWastage] = useState(3);
  
  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  const calculateResults = () => {
    let L = unit === 'feet' ? length * 0.3048 : length;
    let W = unit === 'feet' ? width * 0.3048 : width;
    let T = unit === 'feet' ? thickness / 304.8 : thickness / 1000;
    
    const volumeCum = L * W * T;
    const volumeCft = volumeCum * 35.315;
    
    let cement, sand, aggregate20, aggregate12;
    if (concreteGrade === 'M20') {
      cement = volumeCum * 7.5;
      sand = volumeCum * 0.42;
      aggregate20 = volumeCum * 0.5;
      aggregate12 = volumeCum * 0.34;
    } else if (concreteGrade === 'M25') {
      cement = volumeCum * 8.2;
      sand = volumeCum * 0.4;
      aggregate20 = volumeCum * 0.48;
      aggregate12 = volumeCum * 0.32;
    } else {
      cement = volumeCum * 8.8;
      sand = volumeCum * 0.38;
      aggregate20 = volumeCum * 0.45;
      aggregate12 = volumeCum * 0.31;
    }
    
    const cementWithWastage = cement * (1 + wastage/100);
    const sandCft = sand * 35.315;
    const agg20Cft = aggregate20 * 35.315;
    const agg12Cft = aggregate12 * 35.315;
    const waterLtr = cementWithWastage * 50 * 0.45;
    
    const cementCost = cementWithWastage * (rates?.cement || 400);
    const sandCost = sandCft * (rates?.sand || 55);
    const agg20Cost = agg20Cft * (rates?.aggregate || 45);
    const agg12Cost = agg12Cft * (rates?.aggregate || 50);
    const waterCost = (waterLtr / 1000) * (rates?.water || 100);
    
    const materialTotal = cementCost + sandCost + agg20Cost + agg12Cost + waterCost;
    
    const labourRate = rates?.labour?.concrete || 450;
    const shutteringCost = volumeCum * labourRate * 0.35;
    const barBendingCost = volumeCum * labourRate * 0.25;
    const concretingCost = volumeCum * labourRate * 0.40;
    const contractorProfit = materialTotal * 0.10;
    const totalLabour = shutteringCost + barBendingCost + concretingCost + contractorProfit;
    
    const grandTotal = materialTotal + totalLabour;
    
    return {
      area: { sqft: formatNumber(length * width), sqm: formatNumber(L * W) },
      concrete: { volumeCum: formatNumber(volumeCum), volumeCft: formatNumber(volumeCft), cement: formatNumber(cementWithWastage), sandCft: formatNumber(sandCft), agg20Cft: formatNumber(agg20Cft), agg12Cft: formatNumber(agg12Cft), water: formatNumber(waterLtr) },
      costs: { cement: formatNumber(cementCost), sand: formatNumber(sandCost), agg20: formatNumber(agg20Cost), agg12: formatNumber(agg12Cost), water: formatNumber(waterCost), materialTotal: formatNumber(materialTotal), labour: formatNumber(totalLabour), grandTotal: formatNumber(grandTotal) },
      labourBreakdown: { shuttering: formatNumber(shutteringCost), barBending: formatNumber(barBendingCost), concreting: formatNumber(concretingCost), profit: formatNumber(contractorProfit) }
    };
  };

  const handleGenerate = () => {
    setResults(calculateResults());
    setGenerated(true);
  };

  const handleBack = () => {
    router.push('/calculators');
  };

  const handleExportExcel = () => {
    if (!results) return;
    const data = [
      { Item: 'Patio Area', Quantity: results.area.sqft, Unit: 'sqft', Cost: '-' },
      { Item: 'Con. Vol', Quantity: results.concrete.volumeCft, Unit: 'CFT', Cost: '-' },
      { Item: 'Cement', Quantity: results.concrete.cement, Unit: 'bags', Cost: `₹${results.costs.cement}` },
      { Item: 'M Sand', Quantity: results.concrete.sandCft, Unit: 'CFT', Cost: `₹${results.costs.sand}` },
      { Item: '20mm Aggregate', Quantity: results.concrete.agg20Cft, Unit: 'CFT', Cost: `₹${results.costs.agg20}` },
      { Item: '12mm Aggregate', Quantity: results.concrete.agg12Cft, Unit: 'CFT', Cost: `₹${results.costs.agg12}` },
      { Item: 'Water', Quantity: results.concrete.water, Unit: 'Ltr', Cost: `₹${results.costs.water}` },
      { Item: 'Material Total', Quantity: '', Unit: '', Cost: `₹${results.costs.materialTotal}` },
      { Item: 'Labour Total', Quantity: '', Unit: '', Cost: `₹${results.costs.labour}` },
      { Item: 'Grand Total (₹)', Quantity: '', Unit: '', Cost: `₹${results.costs.grandTotal}` }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patio');
    XLSX.writeFile(wb, `Patio_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🧱 PATIO MASONRY\n\nArea: ${results.area.sqft} sqft\nConcrete: ${results.concrete.volumeCft} CFT\nTotal Cost: ₹${results.costs.grandTotal}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading rates...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backButton}>←</button>
        <h1 style={styles.headerTitle}>🧱 Patio &amp; Courtyard Masonry Calculator</h1>
      </div>
      
      <div style={styles.rateInfo}>
        <span>💰 Rates automatically updated from Admin Master Rate Engine</span>
      </div>
      
      <div style={styles.sectionTitle}>📐 Patio Dimensions</div>
      <div style={styles.row6}>
        <div>
          <label style={styles.label}>Length</label>
          <input type="number" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>Width</label>
          <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>Unit</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} style={styles.select}>
            <option value="feet">Feet (ft)</option>
            <option value="meters">Meters (m)</option>
          </select>
        </div>
        <div>
          <label style={styles.label}>Thickness (mm)</label>
          <input type="number" value={thickness} onChange={(e) => setThickness(parseFloat(e.target.value) || 0)} style={styles.input} />
        </div>
      </div>
      
      <div style={styles.buttonRow}>
        <button onClick={handleGenerate} style={styles.buttonGenerate}>🔨 Generate</button>
        {generated && results && (
          <>
            <button onClick={() => checkAndRun('calculator_export', 'patio-calculator', handleExportExcel)} style={styles.buttonExport}>📊 Excel</button>
            <button onClick={() => checkAndRun('calculator_export', 'patio-calculator', handleWhatsApp)} style={styles.buttonWhatsapp}>💬 Share</button>
          </>
        )}
      </div>
      
      {!generated ? (
        <div style={{
          backgroundColor: "#ffffff",
          border: "2px dashed #16a34a",
          borderRadius: "14px",
          padding: "36px 20px",
          textAlign: "center",
          color: "#16a34a",
          margin: "20px 0"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🧱</div>
          <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Ready for Patio Masonry Estimation</div>
          <div style={{ fontSize: "13px", color: "#475569" }}>Please enter patio length &amp; width dimensions above and click <strong>"🔨 Generate"</strong> to view concrete volume, material quantities &amp; itemized BOQ.</div>
        </div>
      ) : results && (
        <div>
          <div style={styles.cardContainer}>
            <div style={{ ...styles.card, ...styles.cardBlue }}><div style={{ fontSize: "16px" }}>📦</div><div>Concrete</div><div style={styles.cardValue}>{results.concrete.volumeCft} CFT</div></div>
            <div style={{ ...styles.card, ...styles.cardLightGreen }}><div style={{ fontSize: "16px" }}>🪣</div><div>Cement</div><div style={styles.cardValue}>{results.concrete.cement} bags</div></div>
            <div style={{ ...styles.card, ...styles.cardLightOrange }}><div style={{ fontSize: "16px" }}>💰</div><div>Material Total</div><div style={styles.cardValue}>₹{results.costs.materialTotal}</div></div>
            <div style={{ ...styles.card, ...styles.cardLightTeal }}><div style={{ fontSize: "16px" }}>💎</div><div>Grand Total (₹)</div><div style={styles.cardValue}>₹{results.costs.grandTotal}</div></div>
          </div>
          
          <div className="bm-item-results-scroll" style={styles.tablecontainer}>
            <table className="bm-item-results-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Item</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={styles.td}>Patio Area</td><td style={styles.td}>{results.area.sqft}</td><td style={styles.td}>sqft</td><td style={styles.td}>-</td></tr>
                <tr style={styles.evenRow}><td style={styles.td}>Con. Vol</td><td style={styles.td}>{results.concrete.volumeCft}</td><td style={styles.td}>CFT</td><td style={styles.td}>-</td></tr>
                <tr><td style={styles.td}>Cement</td><td style={styles.td}>{results.concrete.cement}</td><td style={styles.td}>bags</td><td style={styles.td}>₹{results.costs.cement}</td></tr>
                <tr style={styles.evenRow}><td style={styles.td}>M Sand</td><td style={styles.td}>{results.concrete.sandCft}</td><td style={styles.td}>CFT</td><td style={styles.td}>₹{results.costs.sand}</td></tr>
                <tr><td style={styles.td}>20mm Aggregate</td><td style={styles.td}>{results.concrete.agg20Cft}</td><td style={styles.td}>CFT</td><td style={styles.td}>₹{results.costs.agg20}</td></tr>
                <tr style={styles.evenRow}><td style={styles.td}>12mm Aggregate</td><td style={styles.td}>{results.concrete.agg12Cft}</td><td style={styles.td}>CFT</td><td style={styles.td}>₹{results.costs.agg12}</td></tr>
                <tr><td style={styles.td}>Water</td><td style={styles.td}>{results.concrete.water}</td><td style={styles.td}>Ltr</td><td style={styles.td}>₹{results.costs.water}</td></tr>
                <tr style={{ backgroundColor: '#e8f4f8', fontWeight: 'bold' }}><td colSpan={3} style={styles.td}>Material Total</td><td style={styles.td}>₹{results.costs.materialTotal}</td></tr>
                <tr><td style={styles.td}>Labour - Shuttering</td><td style={styles.td}>{results.concrete.volumeCum}</td><td style={styles.td}>CUM</td><td style={styles.td}>₹{results.labourBreakdown.shuttering}</td></tr>
                <tr style={styles.evenRow}><td style={styles.td}>Labour - Bar Bending</td><td style={styles.td}>{results.concrete.volumeCum}</td><td style={styles.td}>CUM</td><td style={styles.td}>₹{results.labourBreakdown.barBending}</td></tr>
                <tr><td style={styles.td}>Labour - Concreting</td><td style={styles.td}>{results.concrete.volumeCum}</td><td style={styles.td}>CUM</td><td style={styles.td}>₹{results.labourBreakdown.concreting}</td></tr>
                <tr style={styles.evenRow}><td style={styles.td}>Contractor Profit</td><td style={styles.td}>{results.concrete.volumeCum}</td><td style={styles.td}>CUM</td><td style={styles.td}>₹{results.labourBreakdown.profit}</td></tr>
                <tr style={{ backgroundColor: '#f0f7f5', fontWeight: 'bold' }}><td colSpan={3} style={styles.td}>Total Labour</td><td style={styles.td}>₹{results.costs.labour}</td></tr>
                <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: 'bold' }}><td colSpan={3} style={{ padding: '8px' }}>Grand Total (₹)</td><td style={{ padding: '8px' }}>₹{results.costs.grandTotal}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
