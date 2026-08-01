import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { useRates } from '../contexts/RateContext';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate } from "../utils/masterRates";

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '12px', backgroundColor: '#f5f0e8', minHeight: '100vh', boxSizing: 'border-box' },
  header: { backgroundColor: '#5a3e2b', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '5px' },
  headerTitle: { margin: 0, fontSize: '18px', flex: 1 },
  sectionTitle: { backgroundColor: '#e8f4f8', color: '#5a3e2b', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #cce5ed' },
  row6: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px' },
  inputGroup: { marginBottom: '8px' },
  label: { display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '11px', color: '#555' },
  input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff' },
  select: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff' },
  buttonRow: { display: 'flex', justifyContent: 'center', gap: '15px', margin: '20px 0' },
  buttonGenerate: { backgroundColor: '#800020', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  buttonExport: { backgroundColor: '#28a745', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  buttonWhatsapp: { backgroundColor: '#25D366', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  cardContainer: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' },
  card: { padding: '8px', borderRadius: '10px', textAlign: 'center', color: 'white' },
  cardBlue: { backgroundColor: '#2196F3' },
  cardLightGreen: { backgroundColor: '#8BC34A' },
  cardLightOrange: { backgroundColor: '#FFB74D' },
  cardLightTeal: { backgroundColor: '#4DB6AC' },
  cardValue: { fontSize: '14px', fontWeight: 'bold', marginTop: '4px' },
  tableContainer: { overflowX: 'auto', marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#5a3e2b', color: 'white', padding: '8px', textAlign: 'left' },
  td: { padding: '6px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  rateInfo: { backgroundColor: '#e8f4f8', padding: '6px', borderRadius: '4px', fontSize: '10px', textAlign: 'center', marginBottom: '10px', color: '#555' }
};

const formatNumber = (num: number | null | undefined, decimals = 2): string => {
  if (num === null || num === undefined || isNaN(num)) return "Rate Unavailable";
  return num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rate Unavailable";
  return `₹${formatNumber(amount, 2)}`;
};

export default function ConcretePage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();
  const { rates: contextRates, loading } = useRates();
  
  const [length, setLength] = useState(26);
  const [width, setWidth] = useState(37);
  const [thickness, setThickness] = useState(150);
  const [unit, setUnit] = useState('feet');
  const [concreteGrade, setConcreteGrade] = useState('M20');
  const [wastage, setWastage] = useState(3);
  
  const [results, setResults] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  // Dynamic Rate Lookup from Admin Master Rates approved list (Fallback 0 to identify unavailable rates)
  const cementRateRes = getMasterRate(["cement", "opc", "ppc", "cement bag"], 0, ["bm_material_rates"]);
  const sandRateRes = getMasterRate(["m sand", "m-sand", "sand", "fine aggregate"], 0, ["bm_material_rates"]);
  const agg20RateRes = getMasterRate(["20mm aggregate", "20 mm aggregate", "ca1", "20mm"], 0, ["bm_material_rates"]);
  const agg12RateRes = getMasterRate(["12mm aggregate", "12 mm aggregate", "ca2", "12mm", "10mm aggregate"], 0, ["bm_material_rates"]);
  const waterRateRes = getMasterRate(["water", "construction water"], 0, ["bm_material_rates", "bm_service_rates"]);
  const rmcRateRes = getMasterRate(["rmc", "ready mix concrete", "ready-mix concrete"], 0, ["bm_material_rates", "bm_service_rates"]);

  // Labour Rates from Admin Master Rates
  const concretingLabourRes = getMasterRate(["concrete labour", "concreting labour", "concrete pouring", "labour concrete"], 0, ["bm_labour_rates", "bm_service_rates"]);
  const shutteringLabourRes = getMasterRate(["shuttering labour", "formwork labour", "shuttering"], 0, ["bm_labour_rates", "bm_service_rates"]);
  const barBendingLabourRes = getMasterRate(["bar bending", "steel binding", "rebar labour", "bar bending labour"], 0, ["bm_labour_rates", "bm_service_rates"]);

  // Standard Mix Ratios according to IS 456:2000 & IS 10262:2019 (Quantities per CUM of wet concrete)
  const concreteMix: Record<string, { cementBags: number; sandCft: number; agg20Cft: number; agg12Cft: number; waterLtr: number; isRmc?: boolean }> = {
    M15: { cementBags: 6.34, sandCft: 15.54, agg20Cft: 18.65, agg12Cft: 12.43, waterLtr: 177.5 },
    M20: { cementBags: 8.06, sandCft: 14.83, agg20Cft: 17.80, agg12Cft: 11.87, waterLtr: 201.5 },
    M25: { cementBags: 8.70, sandCft: 13.80, agg20Cft: 17.00, agg12Cft: 11.30, waterLtr: 165.0 },
    M30: { cementBags: 9.30, sandCft: 12.70, agg20Cft: 16.20, agg12Cft: 10.80, waterLtr: 160.0 },
    M35: { cementBags: 9.80, sandCft: 12.10, agg20Cft: 15.80, agg12Cft: 10.50, waterLtr: 155.0 },
    M40: { cementBags: 10.40, sandCft: 11.50, agg20Cft: 15.20, agg12Cft: 10.10, waterLtr: 150.0 },
    RMC_M20: { cementBags: 0, sandCft: 0, agg20Cft: 0, agg12Cft: 0, waterLtr: 0, isRmc: true },
    RMC_M25: { cementBags: 0, sandCft: 0, agg20Cft: 0, agg12Cft: 0, waterLtr: 0, isRmc: true }
  };

  const calculateResults = () => {
    // Exact Volume Calculation (thickness is in mm)
    let lengthFt = unit === 'feet' ? length : length * 3.2808399;
    let widthFt = unit === 'feet' ? width : width * 3.2808399;
    let thicknessFt = thickness / 304.8; // 150 mm = 0.492126 ft

    let volumeCft = lengthFt * widthFt * thicknessFt; // 26 * 37 * (150/304.8) = 473.43 CFT
    let volumeCum = volumeCft / 35.3146667;          // 473.425 / 35.31467 = 13.406 m³

    // Surface Area & Steel Reinforcement for Labour Measurement Basis (IS 1200 / CPWD)
    // Contact Surface Area for Formwork (SQFT) = Bottom Area + Edge Perimeter * Thickness
    let shutteringAreaSqft = (lengthFt * widthFt) + (2 * (lengthFt + widthFt) * thicknessFt);
    // Estimated Reinforcement Steel Weight (KG) = Volume (CUM) * 80 kg/CUM (1% nominal steel ratio per IS 456)
    let steelWeightKg = volumeCum * 80;

    const mix = concreteMix[concreteGrade] || concreteMix.M20;
    const wastageFactor = 1 + (Number(wastage || 0) / 100);

    // Apply wastage ONLY ONCE to material quantities
    const cementBags = mix.isRmc ? 0 : volumeCum * mix.cementBags * wastageFactor;
    const sandCft = mix.isRmc ? 0 : volumeCum * mix.sandCft * wastageFactor;
    const agg20Cft = mix.isRmc ? 0 : volumeCum * mix.agg20Cft * wastageFactor;
    const agg12Cft = mix.isRmc ? 0 : volumeCum * mix.agg12Cft * wastageFactor;
    const waterLtr = mix.isRmc ? 0 : volumeCum * mix.waterLtr * wastageFactor;
    const rmcVolumeCum = mix.isRmc ? volumeCum * wastageFactor : 0;

    // Costs using Admin Master Rates (If found === false, cost is null)
    const cementCost = mix.isRmc ? 0 : (cementRateRes.found && cementRateRes.rate > 0 ? cementBags * cementRateRes.rate : null);
    const sandCost = mix.isRmc ? 0 : (sandRateRes.found && sandRateRes.rate > 0 ? sandCft * sandRateRes.rate : null);
    const agg20Cost = mix.isRmc ? 0 : (agg20RateRes.found && agg20RateRes.rate > 0 ? agg20Cft * agg20RateRes.rate : null);
    const agg12Cost = mix.isRmc ? 0 : (agg12RateRes.found && agg12RateRes.rate > 0 ? agg12Cft * agg12RateRes.rate : null);
    const waterCost = mix.isRmc ? 0 : (waterRateRes.found && waterRateRes.rate > 0 ? waterLtr * waterRateRes.rate : null);
    const rmcCost = mix.isRmc ? (rmcRateRes.found && rmcRateRes.rate > 0 ? rmcVolumeCum * rmcRateRes.rate : null) : 0;

    // Material Total
    let materialTotal: number | null = 0;
    if (mix.isRmc) {
      materialTotal = rmcCost;
    } else {
      if (cementCost !== null && sandCost !== null && agg20Cost !== null && agg12Cost !== null && waterCost !== null) {
        materialTotal = cementCost + sandCost + agg20Cost + agg12Cost + waterCost;
      } else {
        materialTotal = null; // Mark material total as Unavailable if any material rate is missing
      }
    }

    // Labour Calculations on Measurement Basis
    const concretingLabourCost = concretingLabourRes.found && concretingLabourRes.rate > 0 ? volumeCum * concretingLabourRes.rate : null;
    const shutteringLabourCost = shutteringLabourRes.found && shutteringLabourRes.rate > 0 ? shutteringAreaSqft * shutteringLabourRes.rate : null;
    const barBendingLabourCost = barBendingLabourRes.found && barBendingLabourRes.rate > 0 ? steelWeightKg * barBendingLabourRes.rate : null;

    let labourTotal: number | null = 0;
    if (concretingLabourCost !== null && shutteringLabourCost !== null && barBendingLabourCost !== null) {
      labourTotal = concretingLabourCost + shutteringLabourCost + barBendingLabourCost;
    } else {
      labourTotal = null;
    }

    let grandTotal: number | null = 0;
    if (materialTotal !== null && labourTotal !== null) {
      grandTotal = materialTotal + labourTotal;
    } else {
      grandTotal = null;
    }

    return {
      volumeCum,
      volumeCft,
      shutteringAreaSqft,
      steelWeightKg,
      quantities: {
        cementBags,
        sandCft,
        agg20Cft,
        agg12Cft,
        waterLtr,
        rmcVolumeCum
      },
      rates: {
        cement: cementRateRes,
        sand: sandRateRes,
        agg20: agg20RateRes,
        agg12: agg12RateRes,
        water: waterRateRes,
        rmc: rmcRateRes,
        concretingLabour: concretingLabourRes,
        shutteringLabour: shutteringLabourRes,
        barBendingLabour: barBendingLabourRes
      },
      costs: {
        cement: cementCost,
        sand: sandCost,
        agg20: agg20Cost,
        agg12: agg12Cost,
        water: waterCost,
        rmc: rmcCost,
        materialTotal,
        concretingLabour: concretingLabourCost,
        shutteringLabour: shutteringLabourCost,
        barBendingLabour: barBendingLabourCost,
        labourTotal,
        grandTotal
      }
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
    const isRmc = concreteGrade.startsWith("RMC");
    const data = [
      { Item: 'Concrete Volume (CFT)', Quantity: formatNumber(results.volumeCft), Unit: 'CFT', Rate: '-', Cost: '-' },
      { Item: 'Concrete Volume (CUM)', Quantity: formatNumber(results.volumeCum), Unit: 'CUM', Rate: '-', Cost: '-' },
      ...(isRmc ? [
        { Item: 'Ready-Mix Concrete (RMC)', Quantity: formatNumber(results.quantities.rmcVolumeCum), Unit: 'CUM', Rate: formatCurrency(results.rates.rmc.rate), Cost: formatCurrency(results.costs.rmc) }
      ] : [
        { Item: 'Cement', Quantity: formatNumber(results.quantities.cementBags), Unit: 'bags', Rate: formatCurrency(results.rates.cement.rate), Cost: formatCurrency(results.costs.cement) },
        { Item: 'M Sand / Fine Agg', Quantity: formatNumber(results.quantities.sandCft), Unit: 'CFT', Rate: formatCurrency(results.rates.sand.rate), Cost: formatCurrency(results.costs.sand) },
        { Item: '20mm Coarse Aggregate', Quantity: formatNumber(results.quantities.agg20Cft), Unit: 'CFT', Rate: formatCurrency(results.rates.agg20.rate), Cost: formatCurrency(results.costs.agg20) },
        { Item: '12mm Coarse Aggregate', Quantity: formatNumber(results.quantities.agg12Cft), Unit: 'CFT', Rate: formatCurrency(results.rates.agg12.rate), Cost: formatCurrency(results.costs.agg12) },
        { Item: 'Water', Quantity: formatNumber(results.quantities.waterLtr), Unit: 'Ltr', Rate: formatCurrency(results.rates.water.rate), Cost: formatCurrency(results.costs.water) }
      ]),
      { Item: 'Material Subtotal', Quantity: '', Unit: '', Rate: '', Cost: formatCurrency(results.costs.materialTotal) },
      { Item: 'Labour - Concreting', Quantity: formatNumber(results.volumeCum), Unit: 'CUM', Rate: formatCurrency(results.rates.concretingLabour.rate), Cost: formatCurrency(results.costs.concretingLabour) },
      { Item: 'Labour - Formwork / Shuttering', Quantity: formatNumber(results.shutteringAreaSqft), Unit: 'SQFT', Rate: formatCurrency(results.rates.shutteringLabour.rate), Cost: formatCurrency(results.costs.shutteringLabour) },
      { Item: 'Labour - Steel Bar Bending', Quantity: formatNumber(results.steelWeightKg), Unit: 'KG', Rate: formatCurrency(results.rates.barBendingLabour.rate), Cost: formatCurrency(results.costs.barBendingLabour) },
      { Item: 'Labour Subtotal', Quantity: '', Unit: '', Rate: '', Cost: formatCurrency(results.costs.labourTotal) },
      { Item: 'GRAND TOTAL', Quantity: '', Unit: '', Rate: '', Cost: formatCurrency(results.costs.grandTotal) }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Concrete_Calculator');
    XLSX.writeFile(wb, `Concrete_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleWhatsApp = () => {
    if (!results) return;
    const message = `🧱 BUILDMITRA CONCRETE ESTIMATE\n\nDimensions: ${length} x ${width} x ${thickness}mm (${unit})\nGrade: ${concreteGrade}\nConcrete Volume: ${formatNumber(results.volumeCft)} CFT (${formatNumber(results.volumeCum)} m³)\nCement: ${formatNumber(results.quantities.cementBags)} bags\nGrand Total: ${formatCurrency(results.costs.grandTotal)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Loading Admin Master Rates...');
  }

  const isRmc = concreteGrade.startsWith("RMC");

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: handleBack, style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, 'Concrete Calculator (IS 456:2000 & IS 10262:2019)')
    ),

    React.createElement(MarketRateTrend, null),
    
    React.createElement('div', { style: styles.rateInfo },
      React.createElement('span', null, `💰 Admin Master Rates: Cement ${cementRateRes.found ? `₹${cementRateRes.rate}/bag` : 'Rate Unavailable'} | Sand ${sandRateRes.found ? `₹${sandRateRes.rate}/CFT` : 'Rate Unavailable'} | 20mm Agg ${agg20RateRes.found ? `₹${agg20RateRes.rate}/CFT` : 'Rate Unavailable'}`),
      React.createElement('div', null, React.createElement('small', null, `👷 Labour: Concreting ${concretingLabourRes.found ? `₹${concretingLabourRes.rate}/CUM` : 'Rate Unavailable'} | Shuttering ${shutteringLabourRes.found ? `₹${shutteringLabourRes.rate}/SQFT` : 'Rate Unavailable'} | Bar Bending ${barBendingLabourRes.found ? `₹${barBendingLabourRes.rate}/KG` : 'Rate Unavailable'}`))
    ),
    
    React.createElement('div', { style: styles.sectionTitle }, '📐 Concrete Member Dimensions & Mix Specifications'),
    React.createElement('div', { style: styles.row6 },
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Length'), React.createElement('input', { type: 'number', value: length, onChange: (e) => setLength(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Width'), React.createElement('input', { type: 'number', value: width, onChange: (e) => setWidth(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Thickness (mm)'), React.createElement('input', { type: 'number', value: thickness, onChange: (e) => setThickness(parseFloat(e.target.value) || 0), style: styles.input })),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Unit'), React.createElement('select', { value: unit, onChange: (e) => setUnit(e.target.value), style: styles.select }, React.createElement('option', { value: 'feet' }, 'Feet'), React.createElement('option', { value: 'meters' }, 'Meters'))),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Concrete Grade'), React.createElement('select', { value: concreteGrade, onChange: (e) => setConcreteGrade(e.target.value), style: styles.select }, 
        React.createElement('option', { value: 'M15' }, 'M15 (1:2:4)'),
        React.createElement('option', { value: 'M20' }, 'M20 (1:1.5:3)'),
        React.createElement('option', { value: 'M25' }, 'M25 (1:1:2)'),
        React.createElement('option', { value: 'M30' }, 'M30 (Design Mix)'),
        React.createElement('option', { value: 'M35' }, 'M35 (Design Mix)'),
        React.createElement('option', { value: 'M40' }, 'M40 (High Strength)'),
        React.createElement('option', { value: 'RMC_M20' }, 'RMC M20 (Ready Mix)'),
        React.createElement('option', { value: 'RMC_M25' }, 'RMC M25 (Ready Mix)')
      )),
      React.createElement('div', null, React.createElement('label', { style: styles.label }, 'Wastage (%)'), React.createElement('input', { type: 'number', value: wastage, onChange: (e) => setWastage(parseFloat(e.target.value) || 0), style: styles.input }))
    ),
    
    React.createElement('div', { style: styles.buttonRow },
      React.createElement('button', { onClick: handleGenerate, style: styles.buttonGenerate }, '🔨 Calculate Concrete & Materials'),
      generated && results && React.createElement(React.Fragment, null,
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'concrete-calculator', handleExportExcel), style: styles.buttonExport }, '📊 Excel'),
        React.createElement('button', { onClick: () => checkAndRun('calculator_export', 'concrete-calculator', handleWhatsApp), style: styles.buttonWhatsapp }, '💬 Share')
      )
    ),
    
    generated && results && React.createElement('div', null,
      React.createElement('div', { style: styles.cardContainer },
        React.createElement('div', { style: { ...styles.card, ...styles.cardBlue } }, React.createElement('div', null, '📦'), React.createElement('div', null, 'Concrete Volume'), React.createElement('div', { style: styles.cardValue }, `${formatNumber(results.volumeCft)} CFT (${formatNumber(results.volumeCum)} m³)`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightGreen } }, React.createElement('div', null, '🪣'), React.createElement('div', null, isRmc ? 'RMC Volume' : 'Cement Bags'), React.createElement('div', { style: styles.cardValue }, isRmc ? `${formatNumber(results.quantities.rmcVolumeCum)} m³` : `${formatNumber(results.quantities.cementBags)} bags`)),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightOrange } }, React.createElement('div', null, '💰'), React.createElement('div', null, 'Material Subtotal'), React.createElement('div', { style: styles.cardValue }, formatCurrency(results.costs.materialTotal))),
        React.createElement('div', { style: { ...styles.card, ...styles.cardLightTeal } }, React.createElement('div', null, '💎'), React.createElement('div', null, 'Grand Total'), React.createElement('div', { style: styles.cardValue }, formatCurrency(results.costs.grandTotal)))
      ),
      
      React.createElement('div', { style: styles.tableContainer },
        React.createElement('table', { style: styles.table },
          React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', { style: styles.th }, 'Item / Material'), React.createElement('th', { style: styles.th }, 'Quantity'), React.createElement('th', { style: styles.th }, 'Unit'), React.createElement('th', { style: styles.th }, 'Master Rate'), React.createElement('th', { style: styles.th }, 'Cost'))),
          React.createElement('tbody', null,
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Concrete Net Volume'), React.createElement('td', { style: styles.td }, formatNumber(results.volumeCft)), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, '-'), React.createElement('td', { style: styles.td }, '-')),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Concrete Metric Volume'), React.createElement('td', { style: styles.td }, formatNumber(results.volumeCum)), React.createElement('td', { style: styles.td }, 'CUM (m³)'), React.createElement('td', { style: styles.td }, '-'), React.createElement('td', { style: styles.td }, '-')),
            
            !isRmc && React.createElement(React.Fragment, null,
              React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Cement (PPC / OPC)'), React.createElement('td', { style: styles.td }, formatNumber(results.quantities.cementBags)), React.createElement('td', { style: styles.td }, 'bags'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.cement.rate)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.cement))),
              React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'M Sand / Fine Aggregate'), React.createElement('td', { style: styles.td }, formatNumber(results.quantities.sandCft)), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.sand.rate)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.sand))),
              React.createElement('tr', null, React.createElement('td', { style: styles.td }, '20mm Coarse Aggregate'), React.createElement('td', { style: styles.td }, formatNumber(results.quantities.agg20Cft)), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.agg20.rate)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.agg20))),
              React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, '12mm Coarse Aggregate'), React.createElement('td', { style: styles.td }, formatNumber(results.quantities.agg12Cft)), React.createElement('td', { style: styles.td }, 'CFT'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.agg12.rate)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.agg12))),
              React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Water'), React.createElement('td', { style: styles.td }, formatNumber(results.quantities.waterLtr)), React.createElement('td', { style: styles.td }, 'Ltr'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.water.rate)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.water)))
            ),

            isRmc && React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Ready-Mix Concrete (RMC)'), React.createElement('td', { style: styles.td }, formatNumber(results.quantities.rmcVolumeCum)), React.createElement('td', { style: styles.td }, 'CUM'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.rmc.rate)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.rmc))),

            React.createElement('tr', { style: { backgroundColor: '#e8f4f8', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 4, style: styles.td }, 'Material Subtotal'), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.materialTotal))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Labour — Concreting (Pouring & Compaction)'), React.createElement('td', { style: styles.td }, formatNumber(results.volumeCum)), React.createElement('td', { style: styles.td }, 'CUM'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.concretingLabour.rate)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.concretingLabour))),
            React.createElement('tr', { style: styles.evenRow }, React.createElement('td', { style: styles.td }, 'Labour — Formwork & Shuttering (Surface Area)'), React.createElement('td', { style: styles.td }, formatNumber(results.shutteringAreaSqft)), React.createElement('td', { style: styles.td }, 'SQFT'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.shutteringLabour.rate)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.shutteringLabour))),
            React.createElement('tr', null, React.createElement('td', { style: styles.td }, 'Labour — Steel Bar Bending & Tying'), React.createElement('td', { style: styles.td }, formatNumber(results.steelWeightKg)), React.createElement('td', { style: styles.td }, 'KG'), React.createElement('td', { style: styles.td }, formatCurrency(results.rates.barBendingLabour.rate)), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.barBendingLabour))),
            React.createElement('tr', { style: { backgroundColor: '#f0f7f5', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 4, style: styles.td }, 'Labour Subtotal'), React.createElement('td', { style: styles.td }, formatCurrency(results.costs.labourTotal))),
            React.createElement('tr', { style: { backgroundColor: '#800020', color: 'white', fontWeight: 'bold' } }, React.createElement('td', { colSpan: 4, style: { padding: '8px' } }, 'GRAND TOTAL'), React.createElement('td', { style: { padding: '8px' } }, formatCurrency(results.costs.grandTotal)))
          )
        )
      ),

      React.createElement('div', { style: { display: 'flex', gap: '10px', marginTop: '15px' } },
        React.createElement('button', {
          onClick: () => {
            alert('Saved Concrete Calculation to Active Project!');
          },
          style: { flex: 1, padding: '10px', borderRadius: '6px', border: 0, backgroundColor: '#0f766e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }
        }, '💾 Save to Project'),
        React.createElement('button', {
          onClick: () => {
            alert('Added Concrete Volume to BOQ Line Items!');
          },
          style: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #0f766e', backgroundColor: 'white', color: '#0f766e', fontWeight: 'bold', cursor: 'pointer' }
        }, '📋 Add to BOQ')
      ),

      React.createElement('div', { style: { marginTop: '20px', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '11px', color: '#334155' } },
        React.createElement('b', null, '📜 Applicable Standards & Engineering Basis:'),
        React.createElement('div', { style: { marginTop: '6px' } }, '• IS 456:2000 (Plain & Reinforced Concrete Code of Practice)'),
        React.createElement('div', null, '• IS 10262:2019 (Concrete Mix Proportioning Guidelines)'),
        React.createElement('div', null, '• Dry Volume Factor: 1.54 (Accounts for voids and compaction)'),
        React.createElement('div', null, '• Single-Wastage Allowance applied to net material procurement'),
        React.createElement('div', null, '• Measurement Basis: Concreting (CUM), Formwork/Shuttering (SQFT Surface Area), Reinforcement Steel (KG Weight)'),
        React.createElement('div', null, '• ⚠️ Warning: Preliminary assistance only. Formal structural designs require approval from a certified structural engineer.')
      )
    )
  );
}
