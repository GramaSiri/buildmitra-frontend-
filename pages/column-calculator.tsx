import { getCachedBuildMitraMasterRates, fetchBuildMitraMasterRates } from "../utils/buildmitraMasterRates";
import { getBuildMitraReportHeaderHtml, BUILDMITRA_OFFICIAL_LOGO } from "../utils/buildmitraReportBranding";
import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { downloadBuildMitraPDF } from '../utils/pdfExport';
import MarketRateTrend from '../components/ui/MarketRateTrend';
import { getMasterRate, syncApprovedRatesFromBackend, MasterRateResult } from "../utils/masterRates";

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { backgroundColor: '#800020', padding: '16px 20px', borderRadius: '10px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(128,0,32,0.2)' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#a51d36', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  dropdownCard: { backgroundColor: '#eef3f8', borderRadius: '10px', border: '1px solid #94a3b8', padding: '16px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  dropdownLabel: { fontSize: '12px', fontWeight: '800', color: '#800020', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px', display: 'block' },
  modeSelect: { width: '100%', padding: '12px 14px', border: '2px solid #800020', borderRadius: '8px', fontSize: '15px', fontWeight: '700', color: '#800020', backgroundColor: '#fff5f7', outline: 'none', cursor: 'pointer' },

  stepperCard: { backgroundColor: '#eef3f8', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '15px', fontWeight: '700', color: '#800020', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #fecdd3', paddingBottom: '8px' },

  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '14px' },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #94a3b8', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' },
  select: { width: '100%', padding: '9px 12px', border: '1px solid #94a3b8', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', outline: 'none' },

  btnPrimary: { backgroundColor: '#800020', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnSecondary: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnSuccess: { backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  btnReset: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' },
  metricCard: { padding: '14px', borderRadius: '8px', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricMaroon: { backgroundColor: '#800020' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '600' },
  metricVal: { fontSize: '19px', fontWeight: '800', marginTop: '4px' },

  tableContainer: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', marginBottom: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { backgroundColor: '#800020', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

  rateTag: { backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },
  rateTagWarn: { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },

  warnBanner: { backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '600' },
  noteBox: { backgroundColor: '#fff5f7', border: '1px solid #fecdd3', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#7f1d1d', marginBottom: '14px' }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "Rate Unavailable in Admin Master";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};


type ColumnSpecimenProps = {
  heightFt: number;
  widthIn: number;
  depthIn: number;
  grade: string;
  cornerDia: number;
  cornerNos: number;
  middleDia: number;
  middleNos: number;
  tieDia: number;
  tieSpacingMm: number;
  coverMm: number;
  showConcrete: boolean;
  showSteel: boolean;
};

function ColumnSpecimen(props: ColumnSpecimenProps) {
  const heightFt = Math.max(Number(props.heightFt) || 1, 1);
  const widthIn = Math.max(Number(props.widthIn) || 1, 1);
  const depthIn = Math.max(Number(props.depthIn) || 1, 1);

  const visualHeight = Math.min(155, Math.max(75, 65 + heightFt * 7));
  const visualWidth = Math.min(82, Math.max(45, widthIn * 5));
  const visualDepth = Math.min(34, Math.max(17, depthIn * 2.5));

  const x = 120;
  const bottom = 188;
  const top = bottom - visualHeight;
  const left = x - visualWidth / 2;
  const right = x + visualWidth / 2;

  const spacing = Math.max(Number(props.tieSpacingMm) || 150, 50);
  const tieCount = Math.min(
    10,
    Math.max(3, Math.round((heightFt * 304.8) / spacing))
  );

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '260px',
        marginLeft: 'auto',
        padding: '10px',
        backgroundColor: '#eef3f8',
        border: '1px solid #94a3b8',
        borderRadius: '10px',
        boxShadow: '0 3px 10px rgba(15,23,42,0.16)',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px'
        }}
      >
        <strong style={{ fontSize: '13px', color: '#7f1d1d' }}>
          Dynamic Column Specimen
        </strong>

        <span
          style={{
            fontSize: '9px',
            fontWeight: '700',
            color: '#475569',
            backgroundColor: '#f1f5f9',
            padding: '3px 7px',
            borderRadius: '10px'
          }}
        >
          3D ISOMETRIC
        </span>
      </div>

      <svg
        viewBox="0 0 300 225"
        width="100%"
        height="195"
        style={{ display: 'block' }}
      >
        <defs>
          <marker
            id="column-dimension-arrow"
            markerWidth="7"
            markerHeight="7"
            refX="3.5"
            refY="3.5"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#334155" />
          </marker>
        </defs>

        <line
          x1="35"
          y1={bottom + 10}
          x2="250"
          y2={bottom + 10}
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        <polygon
          points={`${left},${top} ${right},${top} ${right},${bottom} ${left},${bottom}`}
          fill={props.showConcrete ? '#cbd5e1' : '#f8fafc'}
          fillOpacity={props.showConcrete ? 0.9 : 0.4}
          stroke="#334155"
          strokeWidth="1.5"
        />

        <polygon
          points={`${right},${top} ${right + visualDepth},${top - visualDepth * 0.48} ${right + visualDepth},${bottom - visualDepth * 0.48} ${right},${bottom}`}
          fill={props.showConcrete ? '#94a3b8' : '#e2e8f0'}
          fillOpacity={props.showConcrete ? 0.9 : 0.4}
          stroke="#334155"
          strokeWidth="1.5"
        />

        <polygon
          points={`${left},${top} ${left + visualDepth},${top - visualDepth * 0.48} ${right + visualDepth},${top - visualDepth * 0.48} ${right},${top}`}
          fill={props.showConcrete ? '#f1f5f9' : '#ffffff'}
          stroke="#334155"
          strokeWidth="1.5"
        />

        {props.showSteel && (
          <>
            <line
              x1={left + 8}
              y1={top + 5}
              x2={left + 8}
              y2={bottom - 5}
              stroke="#b91c1c"
              strokeWidth="3"
            />

            <line
              x1={right - 8}
              y1={top + 5}
              x2={right - 8}
              y2={bottom - 5}
              stroke="#b91c1c"
              strokeWidth="3"
            />

            <line
              x1={right + visualDepth - 7}
              y1={top - visualDepth * 0.48 + 6}
              x2={right + visualDepth - 7}
              y2={bottom - visualDepth * 0.48 - 5}
              stroke="#b91c1c"
              strokeWidth="3"
            />

            {Array.from({ length: tieCount }).map((_, index) => {
              const ratio = tieCount === 1 ? 0 : index / (tieCount - 1);
              const tieY = bottom - 8 - ratio * (visualHeight - 16);

              return (
                <polyline
                  key={index}
                  points={`${left + 5},${tieY} ${right - 5},${tieY} ${right + visualDepth - 5},${tieY - visualDepth * 0.48}`}
                  fill="none"
                  stroke="#15803d"
                  strokeWidth="1.3"
                  strokeDasharray="3 2"
                />
              );
            })}
          </>
        )}

        <line
          x1={left - 23}
          y1={top}
          x2={left - 23}
          y2={bottom}
          stroke="#334155"
          markerStart="url(#column-dimension-arrow)"
          markerEnd="url(#column-dimension-arrow)"
        />

        <text
          x={left - 31}
          y={(top + bottom) / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${left - 31} ${(top + bottom) / 2})`}
          fill="#0f172a"
          fontSize="11"
          fontWeight="700"
        >
          H = {heightFt} ft
        </text>

        <line
          x1={left}
          y1={bottom + 25}
          x2={right}
          y2={bottom + 25}
          stroke="#334155"
          markerStart="url(#column-dimension-arrow)"
          markerEnd="url(#column-dimension-arrow)"
        />

        <text
          x={x}
          y={bottom + 42}
          textAnchor="middle"
          fill="#0f172a"
          fontSize="11"
          fontWeight="700"
        >
          W = {widthIn}"
        </text>

        <text
          x={right + visualDepth + 8}
          y={bottom - visualDepth * 0.48}
          fill="#0f172a"
          fontSize="11"
          fontWeight="700"
        >
          D = {depthIn}"
        </text>

        <rect
          x="198"
          y="23"
          width="94"
          height="122"
          rx="7"
          fill="#ffffff"
          fillOpacity="0.94"
          stroke="#cbd5e1"
        />

        <text x="205" y="38" fill="#7f1d1d" fontSize="11" fontWeight="700">
          {props.grade}
        </text>

        {props.showSteel && (
          <>
            <text x="205" y="57" fill="#b91c1c" fontSize="10" fontWeight="700">
              Main bars
            </text>

            <text x="205" y="71" fill="#334155" fontSize="10">
              {props.cornerNos} x {props.cornerDia} mm
            </text>

            <text x="205" y="84" fill="#334155" fontSize="10">
              {props.middleNos} x {props.middleDia} mm
            </text>

            <text x="205" y="103" fill="#15803d" fontSize="10" fontWeight="700">
              Ties {props.tieDia} mm
            </text>

            <text x="205" y="116" fill="#334155" fontSize="10">
              @ {props.tieSpacingMm} mm
            </text>

            <text x="205" y="135" fill="#334155" fontSize="10">
              Cover {props.coverMm} mm
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

export default function ColumnCalculator() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Scope Option: 'both' vs 'concrete_only' vs 'steel_only'
  const [scopeOption, setScopeOption] = useState<'both' | 'concrete_only' | 'steel_only'>('both');

  // DETAILED COLUMN INPUTS
  const initialInputs = {
    columnNos: 4,      // Number of columns
    heightFt: 10,      // Height in feet
    widthIn: 9,        // Width in inches (e.g. 9")
    depthIn: 9,        // Depth in inches (e.g. 9")
    grade: 'M20',      // Concrete grade: M20, M25, M30

    // Vertical Reinforcement
    cornerDia: 12,     // Corner bar dia in mm
    cornerNos: 4,      // Corner bar count per column
    middleDia: 12,     // Middle bar dia in mm
    middleNos: 4,      // Middle bar count per column

    // Lateral Ties / Stirrups
    tieDia: 8,         // Tie dia in mm (8mm)
    tieSpacingMm: 150, // Spacing in mm
    coverMm: 40        // Clear cover in mm (40mm for columns)
  };

  const [inputs, setInputs] = useState(initialInputs);

  // Admin Master Rates Lookup
  const cementRate = getMasterRate(["MAT-CEM-01", "cement", "opc 53", "opc"], 385);
  const steelRate = getMasterRate(["MAT-STL-01", "tmt steel", "steel", "rebar"], 68);
  const sandRate = getMasterRate(["MAT-MSND-01", "m-sand", "sand"], 46);
  const ca20Rate = getMasterRate(["MAT-AGG-20", "20mm aggregate", "aggregate"], 40);
  const ca12Rate = getMasterRate(["MAT-AGG-12", "12mm aggregate"], 42);
  const wireRate = getMasterRate(["MAT-BWR-01", "binding wire"], 80);
  const coverRate = getMasterRate(["MAT-CVR-01", "cover block"], 5);
  const waterRate = getMasterRate(["MAT-WTR-01", "construction water", "water"], 0.05);
  const shutteringBoxRate = getMasterRate(["SRV-COL-SHT", "shuttering box", "formwork"], 35);
  const rccLabourRate = getMasterRate(["SRV-RCC-LAY", "rcc labour", "column labour"], 1000);

  const handleReset = () => setInputs(initialInputs);

  // IS 456 Structural Column Engine
  const calcResults = useMemo(() => {
    const hasConcrete = scopeOption === 'both' || scopeOption === 'concrete_only';
    const hasSteel = scopeOption === 'both' || scopeOption === 'steel_only';

    const H_m = inputs.heightFt * 0.3048;
    const W_m = (inputs.widthIn * 25.4) / 1000;
    const D_m = (inputs.depthIn * 25.4) / 1000;

    const volPerColCum = H_m * W_m * D_m;
    const totalVolCum = volPerColCum * inputs.columnNos;
    const totalVolCft = totalVolCum * 35.3147;

    // Concrete Mix Ingredients
    let cementFactor = 8.07;
    let mSandFactor = 14.81;
    let ca20Factor = 17.77;
    let ca12Factor = 11.85;

    if (inputs.grade === 'M25') {
      cementFactor = 11.10;
      mSandFactor = 13.60;
      ca20Factor = 16.32;
      ca12Factor = 10.88;
    } else if (inputs.grade === 'M30') {
      cementFactor = 12.50;
      mSandFactor = 12.80;
      ca20Factor = 15.36;
      ca12Factor = 10.24;
    }

    const cementBags = hasConcrete ? (totalVolCum * cementFactor) : 0;
    const mSandCft = hasConcrete ? (totalVolCum * mSandFactor) : 0;
    const ca20Cft = hasConcrete ? (totalVolCum * ca20Factor) : 0;
    const ca12Cft = hasConcrete ? (totalVolCum * ca12Factor) : 0;

    // Vertical Reinforcement
    const L_cornerM = (inputs.heightFt * 0.3048) + (50 * inputs.cornerDia / 1000);
    const L_middleM = (inputs.heightFt * 0.3048) + (50 * inputs.middleDia / 1000);

    const cornerWeightKg = hasSteel ? (inputs.columnNos * inputs.cornerNos * L_cornerM * ((inputs.cornerDia * inputs.cornerDia) / 162.2)) : 0;
    const middleWeightKg = hasSteel ? (inputs.columnNos * inputs.middleNos * L_middleM * ((inputs.middleDia * inputs.middleDia) / 162.2)) : 0;
    const totalVerticalKg = cornerWeightKg + middleWeightKg;

    // Ties / Stirrups
    const W_coreM = Math.max((inputs.widthIn * 25.4 - 2 * inputs.coverMm) / 1000, 0);
    const D_coreM = Math.max((inputs.depthIn * 25.4 - 2 * inputs.coverMm) / 1000, 0);
    const cuttingLengthTieM = (2 * (W_coreM + D_coreM)) + (24 * inputs.tieDia / 1000);

    const tieNosPerCol = Math.ceil((inputs.heightFt * 304.8) / inputs.tieSpacingMm) + 1;
    const totalTieNos = hasSteel ? (tieNosPerCol * inputs.columnNos) : 0;
    const tieTotalWeightKg = hasSteel ? (totalTieNos * cuttingLengthTieM * ((inputs.tieDia * inputs.tieDia) / 162.2)) : 0;

    const totalSteelKg = totalVerticalKg + tieTotalWeightKg;
    const bindingWireKg = hasSteel ? (totalSteelKg * 0.015) : 0;
    const coverBlockNos = hasSteel ? Math.ceil(inputs.columnNos * (inputs.heightFt / 3) * 4) : 0;
    const waterLtr = hasConcrete ? (cementBags * 25) : 0;

    // Column Shuttering Box Surface Area
    const shutteringAreaSqft = hasConcrete ? (2 * ((inputs.widthIn / 12) + (inputs.depthIn / 12)) * inputs.heightFt * inputs.columnNos) : 0;

    // Cost Breakdown
    const cementCost = cementBags * (cementRate.found ? cementRate.rate : 385);
    const steelCost = totalSteelKg * (steelRate.found ? steelRate.rate : 68);
    const sandCost = mSandCft * (sandRate.found ? sandRate.rate : 46);
    const ca20Cost = ca20Cft * (ca20Rate.found ? ca20Rate.rate : 40);
    const ca12Cost = ca12Cft * (ca12Rate.found ? ca12Rate.rate : 42);
    const wireCost = bindingWireKg * (wireRate.found ? wireRate.rate : 80);
    const coverCost = coverBlockNos * (coverRate.found ? coverRate.rate : 5);
    const waterCost = waterLtr * (waterRate.found ? waterRate.rate : 0.05);
    const shutteringCost = shutteringAreaSqft * (shutteringBoxRate.found ? shutteringBoxRate.rate : 35);

    const labourRatePerCum = (hasConcrete && hasSteel) ? 1000 : hasConcrete ? 600 : 400;
    const rccLabourCost = totalVolCum * labourRatePerCum;

    const grandMatCost = cementCost + steelCost + sandCost + ca20Cost + ca12Cost + wireCost + coverCost + waterCost + shutteringCost;
    const grandTotal = grandMatCost + rccLabourCost;
    const costPerCft = totalVolCft > 0 ? grandTotal / totalVolCft : 0;

    const resultItems: any[] = [];

    if (hasConcrete) {
      resultItems.push(
        { code: cementRate.itemCode || "MAT-CEM-01", category: "Material", description: `Cement OPC 53 Grade (${inputs.grade} Mix)`, unit: "BAG", engQty: cementBags, procQty: Math.ceil(cementBags), rate: cementRate.rate, rateFound: cementRate.found, amount: cementCost },
        { code: sandRate.itemCode || "MAT-MSND-01", category: "Material", description: `M-Sand for Concrete Mix`, unit: "CFT", engQty: mSandCft, procQty: Math.ceil(mSandCft), rate: sandRate.rate, rateFound: sandRate.found, amount: sandCost },
        { code: ca20Rate.itemCode || "MAT-AGG-20", category: "Material", description: `20mm Coarse Aggregate`, unit: "CFT", engQty: ca20Cft, procQty: Math.ceil(ca20Cft), rate: ca20Rate.rate, rateFound: ca20Rate.found, amount: ca20Cost },
        { code: ca12Rate.itemCode || "MAT-AGG-12", category: "Material", description: `12mm Coarse Aggregate`, unit: "CFT", engQty: ca12Cft, procQty: Math.ceil(ca12Cft), rate: ca12Rate.rate, rateFound: ca12Rate.found, amount: ca12Cost },
        { code: waterRate.itemCode || "MAT-WTR-01", category: "Site Utility", description: `Construction Water for Curing & Concrete`, unit: "LTR", engQty: waterLtr, procQty: Math.ceil(waterLtr), rate: waterRate.rate, rateFound: waterRate.found, amount: waterCost },
        { code: shutteringBoxRate.itemCode || "SRV-COL-SHT", category: "Formwork", description: `Column Steel/Ply Shuttering Box Rental & Fixing Charges`, unit: "SQFT", engQty: shutteringAreaSqft, procQty: Math.ceil(shutteringAreaSqft), rate: shutteringBoxRate.rate, rateFound: shutteringBoxRate.found, amount: shutteringCost }
      );
    }

    if (hasSteel) {
      resultItems.push(
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - ${inputs.cornerDia}mm Corner Rebar (${inputs.cornerNos} nos x ${inputs.columnNos} cols)`, unit: "KG", engQty: cornerWeightKg, procQty: Math.ceil(cornerWeightKg), rate: steelRate.rate, rateFound: steelRate.found, amount: cornerWeightKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - ${inputs.middleDia}mm Middle Rebar (${inputs.middleNos} nos x ${inputs.columnNos} cols)`, unit: "KG", engQty: middleWeightKg, procQty: Math.ceil(middleWeightKg), rate: steelRate.rate, rateFound: steelRate.found, amount: middleWeightKg * steelRate.rate },
        { code: steelRate.itemCode || "MAT-STL-01", category: "Material", description: `Steel - ${inputs.tieDia}mm Lateral Ties/Stirrups (${totalTieNos} Nos @ ${inputs.tieSpacingMm}mm)`, unit: "KG", engQty: tieTotalWeightKg, procQty: Math.ceil(tieTotalWeightKg), rate: steelRate.rate, rateFound: steelRate.found, amount: tieTotalWeightKg * steelRate.rate },
        { code: wireRate.itemCode || "MAT-BWR-01", category: "Material", description: `Steel Binding Wire (1.5% of steel)`, unit: "KG", engQty: bindingWireKg, procQty: Math.ceil(bindingWireKg), rate: wireRate.rate, rateFound: wireRate.found, amount: wireCost },
        { code: coverRate.itemCode || "MAT-CVR-01", category: "Material", description: `Heavy Duty Column Concrete Cover Blocks (40mm)`, unit: "NOS", engQty: coverBlockNos, procQty: coverBlockNos, rate: coverRate.rate, rateFound: coverRate.found, amount: coverCost }
      );
    }

    resultItems.push({
      code: rccLabourRate.itemCode || "SRV-RCC-LAY",
      category: "Labour",
      description: `Column ${scopeOption === 'both' ? 'Concrete Casting & Bar Bending' : scopeOption === 'concrete_only' ? 'Concrete Casting & Shuttering' : 'Bar Bending & Steel Tying'} Labour`,
      unit: "CUM",
      engQty: totalVolCum,
      procQty: totalVolCum,
      rate: labourRatePerCum,
      rateFound: rccLabourRate.found,
      amount: rccLabourCost
    });

    return {
      hasConcrete,
      hasSteel,
      totalVolCum,
      totalVolCft,
      cementBags,
      totalSteelKg,
      cornerWeightKg,
      middleWeightKg,
      tieTotalWeightKg,
      totalTieNos,
      mSandCft,
      ca20Cft,
      ca12Cft,
      bindingWireKg,
      coverBlockNos,
      waterLtr,
      shutteringAreaSqft,
      grandMatCost,
      rccLabourCost,
      grandTotal,
      costPerCft,
      resultItems
    };
  }, [inputs, scopeOption, cementRate, steelRate, sandRate, ca20Rate, ca12Rate, wireRate, coverRate, waterRate, shutteringBoxRate, rccLabourRate]);

  // Download PDF
  const handleDownloadPDF = () => {
    checkAndRun('calculator_export', 'column-calculator', () => {
      downloadBuildMitraPDF({
        documentTitle: `BuildMitra Column Structural Estimate (${scopeOption})`,
        items: calcResults.resultItems.map((item: any, idx: number) => ({
          sno: idx + 1,
          description: `[${item.category}] ${item.description}`,
          quantity: item.procQty,
          unit: item.unit,
          rate: item.rateFound ? item.rate : 0,
          amount: item.rateFound ? item.amount : 0
        })),
        grandTotal: calcResults.grandTotal
      });
    });
  };

  // Export Excel
  const handleExportExcel = () => {
    checkAndRun('calculator_export', 'column-calculator', () => {
      const data = calcResults.resultItems.map(item => ({
        "Master Item Code": item.code,
        "Category": item.category,
        "Description": item.description,
        "Unit": item.unit,
        "Engineering Qty": item.engQty,
        "Procurement Qty": item.procQty,
        "Approved Rate (₹)": item.rateFound ? item.rate : "Rate Unavailable in Admin Master",
        "Amount (₹)": item.rateFound ? item.amount : 0
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Column_Structural_BOQ");
      XLSX.writeFile(wb, `BuildMitra_Column_Estimate_${scopeOption}.xlsx`);
    });
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    checkAndRun('calculator_export', 'column-calculator', () => {
      const msg = `*BuildMitra RCC Column Structural Report*%0A` +
        `*Scope Option*: ${scopeOption === 'both' ? 'Both Concrete & Steel' : scopeOption === 'concrete_only' ? 'Only Concrete & Shuttering' : 'Only Steel Rebar'}%0A` +
        `----------------------------------------%0A` +
        `• *Columns*: ${inputs.columnNos} Nos (${inputs.widthIn}"x${inputs.depthIn}" x ${inputs.heightFt}ft - ${inputs.grade})%0A` +
        `• *Concrete Volume*: ${formatNumber(calcResults.totalVolCft)} CFT (${formatNumber(calcResults.totalVolCum, 3)} CUM)%0A` +
        (calcResults.hasConcrete ? `• *Cement*: ${formatNumber(calcResults.cementBags)} Bags | *Shuttering Box*: ${formatNumber(calcResults.shutteringAreaSqft)} Sqft%0A` : '') +
        (calcResults.hasSteel ? `• *Steel Rebar*: ${formatNumber(calcResults.totalSteelKg)} kg%0A` : '') +
        `• *Material & Formwork Total*: ${formatCurrency(calcResults.grandMatCost)}%0A` +
        `• *Labour Total*: ${formatCurrency(calcResults.rccLabourCost)}%0A` +
        `• *TOTAL ESTIMATED COST*: ${formatCurrency(calcResults.grandTotal)} (${formatCurrency(calcResults.costPerCft)}/CFT)%0A%0A` +
        `*Generated via BuildMitra Professional Estimator*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  return (
    <div style={styles.container}>
      {/* Top Header, Live Rates, Scope and Dynamic Specimen */}
      <div className="column-top-layout">

        <div className="column-top-left">

          {/* 1. Header */}
          <div
            style={{
              ...styles.header,
              justifyContent: 'flex-start',
              gap: '16px',
              marginBottom: '12px'
            }}
          >
            <button
              style={styles.backBtn}
              onClick={() => router.push('/calculators')}
            >
              ← Back to Calculators
            </button>

            <h1
              style={{
                ...styles.headerTitle,
                flex: 1,
                minWidth: 0,
                flexWrap: 'wrap'
              }}
            >
              🏛️ RCC Column Structural & Formwork Box Calculator

              <span style={styles.badge}>
                IS 456 Column Bar Schedule
              </span>
            </h1>
          </div>

          {/* 2. Live Market Rates restricted to left area */}
          <div
            style={{
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              marginBottom: '12px'
            }}
          >
            <MarketRateTrend />
          </div>

          {/* 3. Scope Option Dropdown */}
          <div
            style={{
              ...styles.dropdownCard,
              marginBottom: 0
            }}
          >
            <label style={styles.dropdownLabel}>
              Select Scope Option
            </label>

            <select
              style={styles.modeSelect}
              value={scopeOption}
              onChange={(e) =>
                setScopeOption(
                  e.target.value as
                    | 'both'
                    | 'concrete_only'
                    | 'steel_only'
                )
              }
            >
              <option value="both">
                🔵 Both Concrete Materials & Steel Rebar
              </option>

              <option value="concrete_only">
                🧱 Only Concrete Materials & Shuttering Box
              </option>

              <option value="steel_only">
                ⚙️ Only Steel Rebar & Bar Bending Schedule
              </option>
            </select>
          </div>
        </div>

        {/* Fixed top-right dynamic specimen */}
        <div className="column-specimen-top">
          <ColumnSpecimen
            heightFt={inputs.heightFt}
            widthIn={inputs.widthIn}
            depthIn={inputs.depthIn}
            grade={inputs.grade}
            cornerDia={inputs.cornerDia}
            cornerNos={inputs.cornerNos}
            middleDia={inputs.middleDia}
            middleNos={inputs.middleNos}
            tieDia={inputs.tieDia}
            tieSpacingMm={inputs.tieSpacingMm}
            coverMm={inputs.coverMm}
            showConcrete={calcResults.hasConcrete}
            showSteel={calcResults.hasSteel}
          />
        </div>
      </div>

      <style jsx>{`
        .column-top-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          gap: 16px;
          align-items: start;
          margin-bottom: 18px;
        }

        .column-top-left {
          min-width: 0;
          overflow: hidden;
        }

        .column-specimen-top {
          width: 260px;
          position: sticky;
          top: 12px;
          align-self: start;
          z-index: 2;
        }

        @media (max-width: 900px) {
          .column-top-layout {
            grid-template-columns: 1fr;
          }

          .column-specimen-top {
            width: 100%;
            max-width: 260px;
            position: static;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>

      {/* 4. Detailed Input Form */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📐 Column Geometry & Structural Specifications</span>
        </div>

        <div style={styles.noteBox}>
          💡 <strong>IS 456 Structural Column Standards</strong>: Select whether to compute Concrete Materials, Steel Rebar, or Both. Includes nominal mix proportions, vertical bar lap weights, stirrup 135° hooks, 40mm clear cover, and column shuttering box rental.
        </div>

        <div style={styles.grid4}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Number of Columns (Nos)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.columnNos}
              onChange={e => setInputs({ ...inputs, columnNos: parseFloat(e.target.value) || 1 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Height (Ft)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.heightFt}
              onChange={e => setInputs({ ...inputs, heightFt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Width (Inches)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.widthIn}
              onChange={e => setInputs({ ...inputs, widthIn: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Depth (Inches)</label>
            <input
              type="number"
              style={styles.input}
              value={inputs.depthIn}
              onChange={e => setInputs({ ...inputs, depthIn: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {calcResults.hasConcrete && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Concrete Mix Grade</label>
              <select
                style={{ ...styles.select, fontWeight: '700' }}
                value={inputs.grade}
                onChange={e => setInputs({ ...inputs, grade: e.target.value })}
              >
                <option value="M20">M20 (1 : 1.5 : 3)</option>
                <option value="M25">M25 (1 : 1 : 2)</option>
                <option value="M30">M30 (Design Mix)</option>
              </select>
            </div>
          )}
        </div>

        {/* Vertical Reinforcement Controls */}
        {calcResults.hasSteel && (
          <div style={{ backgroundColor: '#fff5f7', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecdd3' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#800020', marginBottom: '10px' }}>🔄 Vertical Main Reinforcement (Bar Schedule)</div>
            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Corner Bar Dia (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.cornerDia}
                  onChange={e => setInputs({ ...inputs, cornerDia: parseFloat(e.target.value) || 12 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Corner Bar Count (Nos)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.cornerNos}
                  onChange={e => setInputs({ ...inputs, cornerNos: parseFloat(e.target.value) || 4 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Middle Bar Dia (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.middleDia}
                  onChange={e => setInputs({ ...inputs, middleDia: parseFloat(e.target.value) || 12 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Middle Bar Count (Nos)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.middleNos}
                  onChange={e => setInputs({ ...inputs, middleNos: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lateral Ties / Stirrups */}
        {calcResults.hasSteel && (
          <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#166534', marginBottom: '10px' }}>🔄 Lateral Ties / Stirrups & Cover Controls</div>
            <div style={styles.grid3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Tie Bar Dia (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.tieDia}
                  onChange={e => setInputs({ ...inputs, tieDia: parseFloat(e.target.value) || 8 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Tie Spacing (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.tieSpacingMm}
                  onChange={e => setInputs({ ...inputs, tieSpacingMm: parseFloat(e.target.value) || 150 })}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Clear Cover (mm)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={inputs.coverMm}
                  onChange={e => setInputs({ ...inputs, coverMm: parseFloat(e.target.value) || 40 })}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button style={styles.btnReset} onClick={handleReset}>🔄 Reset Column Form</button>
        </div>
      </div>

      {/* Results Summary Cards */}
      <div style={styles.stepperCard}>
        <div style={styles.sectionHeader}>
          <span>📊 Column Results BOQ ({scopeOption === 'both' ? 'Concrete & Steel' : scopeOption === 'concrete_only' ? 'Concrete & Shuttering' : 'Steel Rebar Only'})</span>
        </div>

        {/* Metric Grid */}
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
            <span style={styles.metricTitle}>Concrete Volume</span>
            <span style={styles.metricVal}>{formatNumber(calcResults.totalVolCft)} CFT</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatNumber(calcResults.totalVolCum, 3)} CUM @ {inputs.grade})</span>
          </div>

          {calcResults.hasConcrete && (
            <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
              <span style={styles.metricTitle}>Cement & Water</span>
              <span style={styles.metricVal}>{formatNumber(calcResults.cementBags, 1)} Bags | {formatNumber(calcResults.waterLtr, 0)} Ltr</span>
            </div>
          )}

          {calcResults.hasSteel && (
            <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
              <span style={styles.metricTitle}>Steel Rebar</span>
              <span style={styles.metricVal}>{formatNumber(calcResults.totalSteelKg, 1)} kg</span>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>({inputs.cornerDia}mm / {inputs.middleDia}mm)</span>
            </div>
          )}

          <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
            <span style={styles.metricTitle}>Total Cost</span>
            <span style={styles.metricVal}>{formatCurrency(calcResults.grandTotal)}</span>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>({formatCurrency(calcResults.costPerCft)} / CFT)</span>
          </div>
        </div>

        {/* BOQ Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Master Code</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Item Description</th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Eng Qty</th>
                <th style={styles.th}>Proc Qty</th>
                <th style={styles.th}>Approved Rate</th>
                <th style={styles.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {calcResults.resultItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={styles.td}><code>{item.code}</code></td>
                  <td style={styles.td}>
                    <span style={{
                      backgroundColor: item.category === 'Material' ? '#e0f2fe' : item.category === 'Labour' ? '#ffedd5' : '#f0fdf4',
                      color: item.category === 'Material' ? '#0369a1' : item.category === 'Labour' ? '#c2410c' : '#166534',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '700',
                      fontSize: '10px'
                    }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={styles.td}><strong>{item.description}</strong></td>
                  <td style={styles.td}>{item.unit}</td>
                  <td style={styles.td}>{formatNumber(item.engQty)}</td>
                  <td style={styles.td}><strong>{formatNumber(item.procQty)}</strong></td>
                  <td style={styles.td}>
                    {item.rateFound ? (
                      <span style={styles.rateTag}>{formatCurrency(item.rate)}</span>
                    ) : (
                      <span style={styles.rateTagWarn}>Rate Unavailable</span>
                    )}
                  </td>
                  <td style={styles.td}><strong>{formatCurrency(item.amount)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} onClick={handleDownloadPDF}>📄 Download in PDF</button>
          <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export in Excel</button>
          <button style={styles.btnSuccess} onClick={handleShareWhatsApp}>📲 Share on WhatsApp</button>
        </div>
      </div>
    </div>
  );
}




