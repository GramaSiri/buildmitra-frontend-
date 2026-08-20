import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { usePaymentBarrier } from '../hooks/usePaymentBarrier';
import { getMasterRate, syncApprovedRatesFromBackend } from '../utils/masterRates';
import Sidebar from '../components/Sidebar';

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#800020',
    padding: '18px 24px',
    borderRadius: '12px',
    marginBottom: '20px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 14px rgba(128,0,32,0.25)',
    flexWrap: 'wrap',
    gap: '12px'
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
    backgroundColor: '#a51d36',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
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
  modeToggleContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
  },
  modeToggleBtn: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '800',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: '0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  stepperCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
  },
  sectionHeader: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#800020',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #fecdd3',
    paddingBottom: '10px'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '14px',
    marginBottom: '16px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    outline: 'none',
    fontWeight: '600'
  },
  inputReadOnly: {
    backgroundColor: '#f1f5f9',
    fontWeight: '800',
    color: '#800020'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    backgroundColor: '#fff',
    outline: 'none',
    fontWeight: '600'
  },
  btnSecondary: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  btnSuccess: {
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  tabContainer: {
    display: 'flex',
    gap: '6px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '20px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  tabBtn: {
    padding: '10px 18px',
    border: 'none',
    background: 'none',
    fontSize: '13px',
    fontWeight: '800',
    color: '#64748b',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    whiteSpace: 'nowrap',
    transition: '0.2s'
  },
  tabBtnActive: {
    color: '#800020',
    backgroundColor: '#fff',
    borderBottom: '3px solid #800020',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '22px'
  },
  metricCard: {
    padding: '16px',
    borderRadius: '10px',
    color: 'white',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
  },
  metricMaroon: { backgroundColor: '#800020' },
  metricTeal: { backgroundColor: '#0f766e' },
  metricGreen: { backgroundColor: '#16a34a' },
  metricOrange: { backgroundColor: '#ea580c' },
  metricBlue: { backgroundColor: '#0284c7' },
  metricTitle: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.9, fontWeight: '700', letterSpacing: '0.5px' },
  metricVal: { fontSize: '20px', fontWeight: '800', marginTop: '6px' },

  tableContainer: {
    overflowX: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#fff',
    marginBottom: '20px'
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { backgroundColor: '#800020', color: 'white', padding: '12px 14px', textAlign: 'left', fontWeight: '700' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155' },
  noteBox: {
    backgroundColor: '#fff5f7',
    border: '1px solid #fecdd3',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#800020',
    marginBottom: '16px',
    lineHeight: '1.6'
  }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function PEBBuildingBOQPage() {
  const router = useRouter();
  const { checkAndRun } = usePaymentBarrier();

  useEffect(() => {
    syncApprovedRatesFromBackend();
  }, []);

  // Mode Selection: Quick BOQ vs Detailed BOQ
  const [boqMode, setBoqMode] = useState<'quick' | 'detailed'>('quick');

  // ---------------- INPUT STATES ----------------
  // 1. Core Plot Dimensions & Specs (User enters only plot size Length x Width, Height, Slope)
  const [lengthFt, setLengthFt] = useState<number>(150);      // 150 ft
  const [widthFt, setWidthFt] = useState<number>(80);         // 80 ft
  const [heightFt, setHeightFt] = useState<number>(24);       // 24 ft clear height
  const [roofSlope, setRoofSlope] = useState<string>("1:10"); // 1:10 slope
  const [buildingType, setBuildingType] = useState<string>("Industrial Shed");

  // Detailed Mode Extra Options
  const [baySpacingFt, setBaySpacingFt] = useState<number>(25);
  const [steelGrade, setSteelGrade] = useState<string>("E350 (350 MPa High Tensile)");
  const [designCode, setDesignCode] = useState<string>("IS 800:2007 & MBMA");
  const [craneRequired, setCraneRequired] = useState<boolean>(true);
  const [craneCapacity, setCraneCapacity] = useState<string>("10 Ton");
  const [mezzanineRequired, setMezzanineRequired] = useState<boolean>(true);
  const [mezzanineAreaSqft, setMezzanineAreaSqft] = useState<number>(2000);
  const [windZone, setWindZone] = useState<string>("44 m/s (Zone 3 - Standard)");
  const [seismicZone, setSeismicZone] = useState<string>("Zone III");
  const [roofSheeting, setRoofSheeting] = useState<string>("0.47mm Galvalume Color Coated Profile");
  const [wallCladding, setWallCladding] = useState<string>("Half Brick Wall (3ft) + 0.47mm Galvalume Sheeting");
  const [insulation, setInsulation] = useState<string>("50mm Glasswool Insulation with Aluminum Foil");
  const [canopyRequired, setCanopyRequired] = useState<boolean>(true);
  const [canopyWidthFt, setCanopyWidthFt] = useState<number>(10);
  const [turboVentilatorsQty, setTurboVentilatorsQty] = useState<number>(8);
  const [skylightPercent, setSkylightPercent] = useState<number>(8);
  const [doorsQty, setDoorsQty] = useState<number>(4);
  const [rollingShuttersQty, setRollingShuttersQty] = useState<number>(2);
  const [windowsQty, setWindowsQty] = useState<number>(12);
  const [guttersType, setGuttersType] = useState<string>("GI Color Coated Eaves Gutter & PVC Downpipes");
  const [anchorBoltsType, setAnchorBoltsType] = useState<string>("High Tensile Grade 8.8 Anchor Bolts");

  // Detailed Unit Rates
  const masterSteelRate = getMasterRate(["MAT-STL-PEB", "peb steel", "structural steel"], 88);
  const masterSheetRate = getMasterRate(["MAT-SHT-ROOF", "roof sheet", "galvalume"], 52);
  const masterPurlinRate = getMasterRate(["MAT-PRL-Z", "z purlin", "c purlin"], 92);
  const masterConcRate = getMasterRate(["MAT-CON-M25", "m25 concrete"], 5200);

  const [ratePrimarySteel, setRatePrimarySteel] = useState<number>(masterSteelRate.rate || 88);
  const [rateSecondarySteel, setRateSecondarySteel] = useState<number>(masterPurlinRate.rate || 92);
  const [rateRoofSheet, setRateRoofSheet] = useState<number>(masterSheetRate.rate || 52);
  const [rateWallSheet, setRateWallSheet] = useState<number>(48);
  const [rateInsulation, setRateInsulation] = useState<number>(22);
  const [rateErectionCrane, setRateErectionCrane] = useState<number>(18);
  const [rateConcreteM25, setRateConcreteM25] = useState<number>(masterConcRate.rate || 5200);
  const [rateFoundationRebar, setRateFoundationRebar] = useState<number>(68);

  const [activeReportTab, setActiveReportTab] = useState<string>("material");

  // ---------------- DERIVED CALCULATIONS (GENERAL) ----------------
  const numBays = useMemo(() => Math.max(1, Math.ceil(lengthFt / Math.max(10, baySpacingFt))), [lengthFt, baySpacingFt]);
  const footprintSqft = useMemo(() => lengthFt * widthFt, [lengthFt, widthFt]);
  const footprintSqM = useMemo(() => footprintSqft * 0.092903, [footprintSqft]);

  const slopeRatio = useMemo(() => {
    if (roofSlope === "1:10") return 0.10;
    if (roofSlope === "1:12") return 0.0833;
    if (roofSlope === "1:15") return 0.0667;
    return 0.05;
  }, [roofSlope]);

  const slopeMultiplier = useMemo(() => Math.sqrt(1 + slopeRatio * slopeRatio), [slopeRatio]);
  const canopySqft = useMemo(() => (canopyRequired ? lengthFt * canopyWidthFt : 0), [canopyRequired, lengthFt, canopyWidthFt]);
  const rawRoofAreaSqft = useMemo(() => (footprintSqft * slopeMultiplier) + canopySqft, [footprintSqft, slopeMultiplier, canopySqft]);
  const skylightAreaSqft = useMemo(() => rawRoofAreaSqft * (skylightPercent / 100), [rawRoofAreaSqft, skylightPercent]);
  const netRoofSheetSqft = useMemo(() => rawRoofAreaSqft - skylightAreaSqft, [rawRoofAreaSqft, skylightAreaSqft]);
  const brickWallHeightFt = useMemo(() => (wallCladding.includes("Half Brick Wall") ? 3 : 0), [wallCladding]);
  const netWallHeightFt = useMemo(() => Math.max(0, heightFt - brickWallHeightFt), [heightFt, brickWallHeightFt]);
  const perimeterFt = useMemo(() => 2 * (lengthFt + widthFt), [lengthFt, widthFt]);
  const rawWallAreaSqft = useMemo(() => perimeterFt * netWallHeightFt, [perimeterFt, netWallHeightFt]);
  const openingsAreaSqft = useMemo(() => (rollingShuttersQty * 144) + (doorsQty * 21) + (windowsQty * 16), [rollingShuttersQty, doorsQty, windowsQty]);
  const netWallSheetSqft = useMemo(() => Math.max(0, rawWallAreaSqft - openingsAreaSqft), [rawWallAreaSqft, openingsAreaSqft]);

  // Structural Steel Tonnage Engine (Detailed Mode)
  const steelTonnageBreakdown = useMemo(() => {
    let primaryIntensity = 3.8;
    if (widthFt >= 80) primaryIntensity += 0.7;
    if (widthFt >= 120) primaryIntensity += 1.2;
    if (heightFt >= 28) primaryIntensity += 0.5;
    if (craneRequired) {
      if (craneCapacity.includes("5")) primaryIntensity += 0.8;
      else if (craneCapacity.includes("10")) primaryIntensity += 1.4;
      else if (craneCapacity.includes("15")) primaryIntensity += 2.0;
      else primaryIntensity += 2.8;
    }
    if (windZone.includes("50")) primaryIntensity += 0.4;
    if (seismicZone.includes("IV") || seismicZone.includes("V")) primaryIntensity += 0.3;

    let secondaryIntensity = 1.8;
    if (baySpacingFt > 24) secondaryIntensity += 0.3;

    let bracingIntensity = 1.0;
    if (mezzanineRequired) bracingIntensity += 0.4;

    const primarySteelKg = footprintSqft * primaryIntensity;
    const mezzanineSteelKg = mezzanineRequired ? mezzanineAreaSqft * 4.5 : 0;
    const totalPrimaryKg = primarySteelKg + mezzanineSteelKg;

    const secondarySteelKg = footprintSqft * secondaryIntensity;
    const bracingSteelKg = footprintSqft * bracingIntensity;

    const totalSteelKg = totalPrimaryKg + secondarySteelKg + bracingSteelKg;
    const totalSteelTonnes = totalSteelKg / 1000;

    return {
      primaryKg: Math.round(totalPrimaryKg),
      secondaryKg: Math.round(secondarySteelKg),
      bracingKg: Math.round(bracingSteelKg),
      totalKg: Math.round(totalSteelKg),
      totalTonnes: Number(totalSteelTonnes.toFixed(2)),
      intensityKgPerSqft: Number((totalSteelKg / footprintSqft).toFixed(2))
    };
  }, [footprintSqft, widthFt, heightFt, craneRequired, craneCapacity, windZone, seismicZone, baySpacingFt, mezzanineRequired, mezzanineAreaSqft]);

  // Foundation Calculations (Detailed Mode)
  const foundationBreakdown = useMemo(() => {
    const numColumns = (numBays + 1) * 2;
    const footingVolCum = numColumns * (1.8 * 1.8 * 0.6);
    const pedestalVolCum = numColumns * (0.5 * 0.5 * 1.2);
    const plinthBeamVolCum = (perimeterFt * 0.3048) * (0.3 * 0.45);
    const totalConcreteCum = Number((footingVolCum + pedestalVolCum + plinthBeamVolCum).toFixed(1));

    const rebarKg = Math.round(totalConcreteCum * 65);
    const excavationCum = Math.round(totalConcreteCum * 2.8);
    const backfillCum = Math.round(excavationCum * 0.7);

    const anchorBoltsQty = numColumns * 4;
    const anchorBoltsKg = Math.round(anchorBoltsQty * 4.5);

    return {
      numColumns,
      totalConcreteCum,
      rebarKg,
      excavationCum,
      backfillCum,
      anchorBoltsQty,
      anchorBoltsKg
    };
  }, [numBays, perimeterFt]);

  // Detailed BOQ Cost Calculations
  const boqCalculations = useMemo(() => {
    const primaryCost = steelTonnageBreakdown.primaryKg * ratePrimarySteel;
    const secondaryCost = steelTonnageBreakdown.secondaryKg * rateSecondarySteel;
    const bracingCost = steelTonnageBreakdown.bracingKg * (rateSecondarySteel * 0.95);

    const roofSheetCost = netRoofSheetSqft * rateRoofSheet;
    const skylightCost = skylightAreaSqft * 140;

    const wallSheetCost = netWallSheetSqft * rateWallSheet;
    const insulationCost = rawRoofAreaSqft * rateInsulation;

    const fastenersCost = (netRoofSheetSqft + netWallSheetSqft) * 4.5;
    const flashingsCost = perimeterFt * 65;
    const guttersCost = (2 * lengthFt) * 120;
    const turboVentCost = turboVentilatorsQty * 3800;

    const doorsCost = (doorsQty * 8500) + (rollingShuttersQty * 24000);
    const windowsCost = windowsQty * 4200;

    const paintAreaSqM = steelTonnageBreakdown.totalTonnes * 28;
    const paintCost = paintAreaSqM * 180;

    const concreteCost = foundationBreakdown.totalConcreteCum * rateConcreteM25;
    const rebarCost = foundationBreakdown.rebarKg * rateFoundationRebar;
    const excavationCost = foundationBreakdown.excavationCum * 160;
    const anchorBoltsCost = foundationBreakdown.anchorBoltsKg * 145;
    const foundationTotalCost = concreteCost + rebarCost + excavationCost + anchorBoltsCost;

    const erectionCost = steelTonnageBreakdown.totalKg * rateErectionCrane;
    const transportCost = steelTonnageBreakdown.totalTonnes * 2200;
    const siteOverheadsCost = (primaryCost + secondaryCost + roofSheetCost) * 0.04;

    const totalMaterialCost = primaryCost + secondaryCost + bracingCost + roofSheetCost + skylightCost + wallSheetCost + insulationCost + fastenersCost + flashingsCost + guttersCost + turboVentCost + doorsCost + windowsCost + paintCost + foundationTotalCost;
    const totalLabourErectionCost = erectionCost + transportCost + siteOverheadsCost;
    const grandTotalCost = totalMaterialCost + totalLabourErectionCost;

    const costPerSqft = grandTotalCost / footprintSqft;
    const costPerKgSteel = grandTotalCost / steelTonnageBreakdown.totalKg;

    return {
      primaryCost,
      secondaryCost,
      bracingCost,
      roofSheetCost,
      skylightCost,
      wallSheetCost,
      insulationCost,
      fastenersCost,
      flashingsCost,
      guttersCost,
      turboVentCost,
      doorsCost,
      windowsCost,
      paintCost,
      concreteCost,
      rebarCost,
      excavationCost,
      anchorBoltsCost,
      foundationTotalCost,
      erectionCost,
      transportCost,
      siteOverheadsCost,
      totalMaterialCost,
      totalLabourErectionCost,
      grandTotalCost,
      costPerSqft,
      costPerKgSteel
    };
  }, [steelTonnageBreakdown, ratePrimarySteel, rateSecondarySteel, netRoofSheetSqft, rateRoofSheet, skylightAreaSqft, netWallSheetSqft, rateWallSheet, rawRoofAreaSqft, rateInsulation, perimeterFt, lengthFt, turboVentilatorsQty, doorsQty, rollingShuttersQty, windowsQty, foundationBreakdown, rateConcreteM25, rateFoundationRebar, rateErectionCrane, footprintSqft]);

  // ---------------- AUTOMATED IS-CODE QUICK PEB BOQ ENGINE ----------------
  // Comprehensive Rate Master Keyword Lookups (No hardcoded rates, fallbacks searched cleanly)
  const quickMasterRates = useMemo(() => {
    return {
      primarySteel: getMasterRate(["MAT-PEB-PRM", "mat-stl-peb", "mat-stl-01", "primary steel", "structural steel", "tmt steel", "peb steel"], 0),
      secondarySteel: getMasterRate(["MAT-PEB-SEC", "mat-prl-z", "secondary steel", "z purlin", "c purlin", "purlin"], 0),
      bracingSteel: getMasterRate(["MAT-PEB-BRC", "bracing steel", "sag rod", "base plate", "structural steel"], 0),
      roofSheet: getMasterRate(["MAT-SHT-ROOF", "mat-rof-sht", "roof profile sheeting", "galvalume roof sheet", "roof sheet"], 0),
      skylightSheet: getMasterRate(["MAT-SHT-SKY", "polycarbonate skylight", "skylight sheet", "skylight"], 0),
      wallSheet: getMasterRate(["MAT-SHT-WALL", "wall cladding sheeting", "galvalume wall sheet", "wall sheet"], 0),
      insulation: getMasterRate(["MAT-INS-ROOF", "roof thermal insulation", "glasswool insulation", "insulation"], 0),
      fasteners: getMasterRate(["MAT-ACC-FST", "self-tapping screws", "fasteners", "epdm washers"], 0),
      flashings: getMasterRate(["MAT-ACC-FLS", "ridge cap", "gable trim", "flashing"], 0),
      gutters: getMasterRate(["MAT-ACC-GUT", "eaves gutters", "downpipe", "gutter"], 0),
      turboVent: getMasterRate(["MAT-ACC-VNT", "turbo ventilator", "roof ventilator"], 0),
      doors: getMasterRate(["MAT-ACC-DOR", "mat-dor-01", "personnel doors", "rolling shutter", "door"], 0),
      windows: getMasterRate(["MAT-ACC-WIN", "mat-win-01", "strip windows", "upvc window", "window"], 0),
      paint: getMasterRate(["MAT-PNT-SYS", "mat-rof-pnt", "epoxy paint", "protective paint", "paint system"], 0),
      concreteM25: getMasterRate(["CIV-FND-CON", "mat-con-m25", "m25 grade concrete", "m25 concrete", "concrete"], 0),
      rebarSteel: getMasterRate(["CIV-FND-STL", "mat-stl-01", "mat-stl-reb", "tmt steel rebar", "rebar steel", "fe500d"], 0),
      anchorBolts: getMasterRate(["CIV-FND-ANC", "anchor bolts", "grade 8.8 anchor bolt", "anchor bolt"], 0),
      erectionCrane: getMasterRate(["LAB-PEB-ERC", "srv-tru-lab", "peb erection labour", "crane erection", "erection"], 0),
      transport: getMasterRate(["LAB-PEB-TRN", "srv-trn-lay", "logistics freight", "heavy transport", "transportation"], 0)
    };
  }, []);

  const quickBOQEngine = useMemo(() => {
    // 1. IS Code Proportional Geometry & Bay Spacing Rules
    const quickBaySpacing = lengthFt <= 60 ? 15 : lengthFt <= 120 ? 20 : 25;
    const quickNumBays = Math.max(1, Math.ceil(lengthFt / quickBaySpacing));
    const numColumns = (quickNumBays + 1) * 2;

    // 2. IS 800:2007 Structural Member Section Sizing
    let colWeb = "350~200x6";
    let colFlg = "160x8";
    let rafWeb = "300~200x6";
    let rafFlg = "140x8";
    let purlinSpec = "Z200 x 65 x 20 x 2.0mm";
    let primaryIntensity = 1.8;
    let secondaryIntensity = 1.2;

    if (widthFt > 50 && widthFt <= 90) {
      colWeb = "600~250x8";
      colFlg = "200x10";
      rafWeb = "500~250x6";
      rafFlg = "180x10";
      purlinSpec = quickBaySpacing > 20 ? "Z220 x 65 x 20 x 2.5mm" : "Z200 x 65 x 20 x 2.0mm";
      primaryIntensity = 2.4;
      secondaryIntensity = 1.4;
    } else if (widthFt > 90) {
      colWeb = "800~250x10";
      colFlg = "220x14";
      rafWeb = "700~250x8";
      rafFlg = "200x12";
      purlinSpec = "Z220 x 65 x 20 x 2.5mm";
      primaryIntensity = 3.2;
      secondaryIntensity = 1.6;
    }

    const bracingIntensity = 0.7;

    // Structural Tonnages (Kg)
    const quickPrimaryKg = Math.round(footprintSqft * primaryIntensity);
    const quickSecondaryKg = Math.round(footprintSqft * secondaryIntensity);
    const quickBracingKg = Math.round(footprintSqft * bracingIntensity);
    const quickTotalSteelKg = quickPrimaryKg + quickSecondaryKg + quickBracingKg;
    const quickTotalSteelTonnes = Number((quickTotalSteelKg / 1000).toFixed(2));

    // 3. IS Ventilation & Openings Ratios (Proportional to Plot Size)
    const quickTurboVentQty = Math.max(1, Math.round(rawRoofAreaSqft / 1800)); // 1 Vent per 1800 sqft
    const quickDoorsQty = Math.max(1, Math.round(footprintSqft / 3000));      // 1 Exit Door per 3000 sqft
    const quickShuttersQty = Math.max(1, Math.round(footprintSqft / 4000));   // 1 Motorized Shutter per 4000 sqft
    const quickWindowsQty = Math.max(2, Math.round(perimeterFt / 30));        // 1 Window per 30 RFT perimeter

    // 4. Sheeting & Openings Deduction
    const quickRoofSheetSqft = Math.round(rawRoofAreaSqft * 0.92);
    const quickSkylightSqft = Math.round(rawRoofAreaSqft * 0.08);
    const quickNetWallHeight = Math.max(0, heightFt - 3); // 3ft brick wall
    const quickRawWallArea = perimeterFt * quickNetWallHeight;
    const quickOpeningsArea = (quickShuttersQty * 100) + (quickDoorsQty * 21) + (quickWindowsQty * 16);
    const quickWallSheetSqft = Math.max(0, Math.round(quickRawWallArea - quickOpeningsArea));

    // 5. Fasteners (Screws & Washers @ 3.5 per sqft)
    const quickFastenersQty = Math.round((quickRoofSheetSqft + quickWallSheetSqft) * 3.5);

    // 6. Foundation (IS 456 / IS 1904 Concrete & Rebar)
    const concPerFooting = widthFt <= 50 ? 0.75 : widthFt <= 90 ? 1.05 : 1.4;
    const quickConcreteCum = Number((numColumns * concPerFooting + (perimeterFt * 0.3048 * 0.3 * 0.45)).toFixed(1));
    const quickRebarKg = Math.round(quickConcreteCum * 60);
    const quickAnchorBoltsKg = Math.round(numColumns * 4 * 3.0); // 4 Bolts M24 Grade 8.8 per column

    // 7. Itemized BOQ Assembly with Exact Calculated Member Sections
    const items = [
      {
        code: "MAT-PEB-PRM",
        category: "Structural Steel",
        name: `Primary Structural Steel (Built-up Tapered Columns Web ${colWeb}mm / Flg ${colFlg}mm & Rafters Web ${rafWeb}mm / Flg ${rafFlg}mm - E350 per IS 800 & MBMA)`,
        uom: "KG",
        qty: quickPrimaryKg,
        rateObj: quickMasterRates.primarySteel
      },
      {
        code: "MAT-PEB-SEC",
        category: "Structural Steel",
        name: `Secondary Steel Members (${quickBaySpacing}ft Bay Spacing - Z/C Cold Formed Purlins & Wall Girts (${purlinSpec}) per IS 811)`,
        uom: "KG",
        qty: quickSecondaryKg,
        rateObj: quickMasterRates.secondarySteel
      },
      {
        code: "MAT-PEB-BRC",
        category: "Structural Steel",
        name: "Bracings, Rods (Dia 16/20mm MS Diagonal Rods), Sag Rods (Dia 12mm), Base & Flange Plates per IS 800",
        uom: "KG",
        qty: quickBracingKg,
        rateObj: quickMasterRates.bracingSteel
      },
      {
        code: "MAT-SHT-ROOF",
        category: "Sheeting & Cladding",
        name: "Roof Profile Sheeting (0.47mm Galvalume High-Tensile 550MPa Profile)",
        uom: "SQFT",
        qty: quickRoofSheetSqft,
        rateObj: quickMasterRates.roofSheet
      },
      {
        code: "MAT-SHT-SKY",
        category: "Sheeting & Cladding",
        name: "Polycarbonate Translucent Skylight Sheeting (8% Daylight Area - 2.0mm UV Embossed)",
        uom: "SQFT",
        qty: quickSkylightSqft,
        rateObj: quickMasterRates.skylightSheet
      },
      {
        code: "MAT-SHT-WALL",
        category: "Sheeting & Cladding",
        name: "Wall Cladding Profile Sheeting (Half Brick Wall (3ft) + 0.47mm Galvalume Sheeting)",
        uom: "SQFT",
        qty: quickWallSheetSqft,
        rateObj: quickMasterRates.wallSheet
      },
      {
        code: "MAT-INS-ROOF",
        category: "Insulation & Openings",
        name: "Roof Thermal Insulation (50mm Glasswool Insulation with Aluminum Foil)",
        uom: "SQFT",
        qty: Math.round(rawRoofAreaSqft),
        rateObj: quickMasterRates.insulation
      },
      {
        code: "MAT-ACC-FST",
        category: "Accessories & Trims",
        name: "Self-Tapping Screws, Fasteners & Weatherproof EPDM Washers (Class 3 12-14x25mm)",
        uom: "NOS",
        qty: quickFastenersQty,
        rateObj: quickMasterRates.fasteners,
        sanitizeRate: 1.50 // ₹1.50/screw NOS rate if master has abnormal rate
      },
      {
        code: "MAT-ACC-FLS",
        category: "Accessories & Trims",
        name: "Flashings (Ridge Cap, Gable Trim, Corner & Drip Flashing - 0.50mm Girth)",
        uom: "RFT",
        qty: perimeterFt,
        rateObj: quickMasterRates.flashings
      },
      {
        code: "MAT-ACC-GUT",
        category: "Accessories & Trims",
        name: "Eaves Gutters & Rainwater PVC/GI Downpipes (GI Color Coated Eaves Gutter)",
        uom: "RFT",
        qty: 2 * lengthFt,
        rateObj: quickMasterRates.gutters
      },
      {
        code: "MAT-ACC-VNT",
        category: "Insulation & Openings",
        name: `Turbo Ventilators (24-inch Stainless Steel - ${quickTurboVentQty} Nos calculated per IS Ventilation Standard)`,
        uom: "NOS",
        qty: quickTurboVentQty,
        rateObj: quickMasterRates.turboVent
      },
      {
        code: "MAT-ACC-DOR",
        category: "Insulation & Openings",
        name: `Personnel Exit Doors (${quickDoorsQty} Nos) & Heavy Duty Motorized Rolling Shutters (${quickShuttersQty} Nos)`,
        uom: "NOS",
        qty: quickDoorsQty + quickShuttersQty,
        rateObj: quickMasterRates.doors
      },
      {
        code: "MAT-ACC-WIN",
        category: "Insulation & Openings",
        name: `Aluminium / UPVC Strip Windows (${quickWindowsQty} Nos calculated per perimeter)`,
        uom: "NOS",
        qty: quickWindowsQty,
        rateObj: quickMasterRates.windows
      },
      {
        code: "MAT-PNT-SYS",
        category: "Coatings & Paint",
        name: "Synthetic Enamel / Epoxy Protective Paint System",
        uom: "SQM",
        qty: Math.round(quickTotalSteelTonnes * 28),
        rateObj: quickMasterRates.paint
      },
      {
        code: "CIV-FND-CON",
        category: "Civil Foundation",
        name: `M25 Grade Concrete for Isolated Footings (${numColumns} Column Footings) & Plinth Beam`,
        uom: "CUM",
        qty: quickConcreteCum,
        rateObj: quickMasterRates.concreteM25
      },
      {
        code: "CIV-FND-STL",
        category: "Civil Foundation",
        name: "Fe500D TMT Reinforcement Steel for Footings",
        uom: "KG",
        qty: quickRebarKg,
        rateObj: quickMasterRates.rebarSteel
      },
      {
        code: "CIV-FND-ANC",
        category: "Civil Foundation",
        name: `High Tensile Anchor Bolts Set (${numColumns * 4} Nos - M${widthFt >= 80 ? '27' : '24'} x 750mm Grade 8.8)`,
        uom: "KG",
        qty: quickAnchorBoltsKg,
        rateObj: quickMasterRates.anchorBolts
      },
      {
        code: "LAB-PEB-ERC",
        category: "Labour & Logistics",
        name: "Structural Steel Erection, Mobile Crane Hire & Rigging Charges",
        uom: "KG",
        qty: quickTotalSteelKg,
        rateObj: quickMasterRates.erectionCrane
      },
      {
        code: "LAB-PEB-TRN",
        category: "Labour & Logistics",
        name: "Logistics, Heavy Trailer Freight & Transportation",
        uom: "TON",
        qty: quickTotalSteelTonnes,
        rateObj: quickMasterRates.transport
      }
    ];

    let grandTotal = 0;
    const processed = items.map((it) => {
      const isFound = it.rateObj.found && Number(it.rateObj.rate) > 0;
      let rateVal = isFound ? Number(it.rateObj.rate) : 0;

      // Handle fastener screw unit rate sanitization if Rate Master has abnormal NOS rate
      if (it.code === "MAT-ACC-FST") {
        if (!isFound || rateVal > 10) {
          rateVal = 1.50; // ₹1.50 per screw NOS
        }
      }

      const effectiveFound = isFound || (it.code === "MAT-ACC-FST" && rateVal > 0);
      const amountVal = effectiveFound ? it.qty * rateVal : 0;
      if (effectiveFound) grandTotal += amountVal;

      return {
        ...it,
        isFound: effectiveFound,
        rateVal,
        amountVal
      };
    });

    const missingItems = processed.filter((it) => !it.isFound);
    const costPerSqftQuick = footprintSqft > 0 ? grandTotal / footprintSqft : 0;

    return {
      quickBaySpacing,
      quickNumBays,
      numColumns,
      colWeb,
      colFlg,
      rafWeb,
      rafFlg,
      purlinSpec,
      quickTotalSteelTonnes,
      quickTotalSteelKg,
      quickTurboVentQty,
      quickDoorsQty,
      quickShuttersQty,
      quickWindowsQty,
      quickRoofSheetSqft,
      quickWallSheetSqft,
      quickConcreteCum,
      items: processed,
      grandTotal,
      costPerSqftQuick,
      missingItems
    };
  }, [lengthFt, widthFt, heightFt, roofSlope, footprintSqft, rawRoofAreaSqft, perimeterFt, quickMasterRates]);

  // ---------------- EXPORTS & REPORTS ----------------
  const handleExportExcel = () => {
    checkAndRun("boq_export", "PEB-BUILDING-BOQ", () => {
      const summaryData = [
        ["BUILDMITRA PEB BUILDING BOQ & COST ESTIMATION REPORT"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Building Type", buildingType],
        ["Dimensions", `${lengthFt} ft (L) x ${widthFt} ft (W) x ${heightFt} ft (H)`],
        ["Footprint Area", `${footprintSqft.toLocaleString()} Sq.ft (${footprintSqM.toFixed(1)} Sq.m)`],
        ["Total Steel Tonnage", `${steelTonnageBreakdown.totalTonnes} Tonnes (${steelTonnageBreakdown.totalKg.toLocaleString()} Kg)`],
        ["Steel Intensity", `${steelTonnageBreakdown.intensityKgPerSqft} kg/sqft`],
        ["Estimated Cost / Sq.ft", formatCurrency(boqCalculations.costPerSqft)],
        ["Estimated Cost / Kg Steel", formatCurrency(boqCalculations.costPerKgSteel)],
        ["GRAND TOTAL PROJECT COST", formatCurrency(boqCalculations.grandTotalCost)],
        [],
        ["ITEMIZED MATERIAL & STRUCTURAL BOQ"],
        ["Code", "Description", "Quantity", "UOM", "Rate (₹)", "Amount (₹)"],
        ["MAT-PEB-PRM", `Primary Steel (Built-up Tapered Columns & Rafters - ${steelGrade})`, steelTonnageBreakdown.primaryKg, "KG", ratePrimarySteel, boqCalculations.primaryCost],
        ["MAT-PEB-SEC", `Secondary Steel (Z/C Purlins & Wall Girts - Cold Formed)`, steelTonnageBreakdown.secondaryKg, "KG", rateSecondarySteel, boqCalculations.secondaryCost],
        ["MAT-PEB-BRC", "Bracings, Rods, Sag Rods, Base & Flange Plates", steelTonnageBreakdown.bracingKg, "KG", Math.round(rateSecondarySteel * 0.95), boqCalculations.bracingCost],
        ["MAT-SHT-ROOF", `Roof Profile Sheeting (${roofSheeting})`, Math.round(netRoofSheetSqft), "SQFT", rateRoofSheet, boqCalculations.roofSheetCost],
        ["MAT-SHT-SKY", `Polycarbonate Skylight Sheets (${skylightPercent}% skylight area)`, Math.round(skylightAreaSqft), "SQFT", 140, boqCalculations.skylightCost],
        ["MAT-SHT-WALL", `Wall Cladding Sheeting (${wallCladding})`, Math.round(netWallSheetSqft), "SQFT", rateWallSheet, boqCalculations.wallSheetCost],
        ["MAT-INS-ROOF", `Roof Insulation (${insulation})`, Math.round(rawRoofAreaSqft), "SQFT", rateInsulation, boqCalculations.insulationCost],
        ["MAT-ACC-FST", "Self Tapping Screws, EPDM Washers & Fasteners", Math.round((netRoofSheetSqft + netWallSheetSqft) * 4.5), "NOS", 1, boqCalculations.fastenersCost],
        ["MAT-ACC-FLS", "Ridge Cap, Gable Flashing & Drip Trim", perimeterFt, "RFT", 65, boqCalculations.flashingsCost],
        ["MAT-ACC-GUT", `Eaves Gutters & Rainwater Downpipes (${guttersType})`, 2 * lengthFt, "RFT", 120, boqCalculations.guttersCost],
        ["MAT-ACC-VNT", "Turbo Ventilators (24-inch SS Stainless Steel)", turboVentilatorsQty, "NOS", 3800, boqCalculations.turboVentCost],
        ["MAT-ACC-DOR", "Personnel Doors & Heavy Duty Rolling Shutters", doorsQty + rollingShuttersQty, "NOS", 0, boqCalculations.doorsCost],
        ["MAT-ACC-WIN", "Aluminium / UPVC Strip Windows", windowsQty, "NOS", 4200, boqCalculations.windowsCost],
        ["MAT-PNT-SYS", "Synthetic Enamel / Epoxy Protective Paint System", Math.round(steelTonnageBreakdown.totalTonnes * 28), "SQM", 180, boqCalculations.paintCost],
        ["CIV-FND-CON", "M25 Grade Concrete for Isolated Footings & Plinth Beam", foundationBreakdown.totalConcreteCum, "CUM", rateConcreteM25, boqCalculations.concreteCost],
        ["CIV-FND-STL", "Fe500D TMT Reinforcement Steel for Footings", foundationBreakdown.rebarKg, "KG", rateFoundationRebar, boqCalculations.rebarCost],
        ["CIV-FND-ANC", `Anchor Bolts Set (${anchorBoltsType})`, foundationBreakdown.anchorBoltsKg, "KG", 145, boqCalculations.anchorBoltsCost],
        ["LAB-PEB-ERC", "Erection, Assembly & Mobile Crane Hire Charges", steelTonnageBreakdown.totalKg, "KG", rateErectionCrane, boqCalculations.erectionCost],
        ["LAB-PEB-TRN", "Logistics, Freight & Heavy Machinery Transportation", steelTonnageBreakdown.totalTonnes, "TON", 2200, boqCalculations.transportCost]
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PEB_Building_BOQ");
      XLSX.writeFile(wb, `BuildMitra_PEB_Building_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportQuickExcel = () => {
    checkAndRun("boq_export", "PEB-QUICK-BOQ", () => {
      const summaryData = [
        ["BUILDMITRA AUTOMATED PRELIMINARY PEB BUILDING BOQ REPORT (IS 800 / IS 875)"],
        ["Generated Date", new Date().toLocaleDateString('en-IN')],
        ["Building Plot Dimensions", `${lengthFt} ft (L) x ${widthFt} ft (W) x ${heightFt} ft (H)`],
        ["Footprint Area", `${footprintSqft.toLocaleString()} Sq.ft (${footprintSqM.toFixed(1)} Sq.m)`],
        ["Calculated Bay Spacing", `${quickBOQEngine.quickBaySpacing} ft (${quickBOQEngine.quickNumBays} Bays)`],
        ["Total Steel Tonnage", `${quickBOQEngine.quickTotalSteelTonnes} Tonnes (${quickBOQEngine.quickTotalSteelKg.toLocaleString()} Kg)`],
        ["Estimated Cost / Sq.ft", formatCurrency(quickBOQEngine.costPerSqftQuick)],
        ["GRAND TOTAL ESTIMATED COST", formatCurrency(quickBOQEngine.grandTotal)],
        [],
        ["ITEMIZED AUTOMATED PRELIMINARY PEB BOQ"],
        ["Code", "Category", "Item Description & Calculated Section Sizes", "Quantity", "UOM", "Rate (₹)", "Amount (₹)"],
        ...quickBOQEngine.items.map(it => [
          it.code,
          it.category,
          it.name,
          it.qty,
          it.uom,
          it.isFound ? it.rateVal : "Rate unavailable",
          it.isFound ? it.amountVal : "—"
        ])
      ];

      if (quickBOQEngine.missingItems.length > 0) {
        summaryData.push([]);
        summaryData.push(["MISSING RATE MASTER ITEMS REPORT"]);
        summaryData.push(["Code", "Item Description", "Quantity", "UOM", "Status"]);
        quickBOQEngine.missingItems.forEach(it => {
          summaryData.push([it.code, it.name, it.qty, it.uom, "Rate Pending Admin Update"]);
        });
      }

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PEB_Quick_BOQ");
      XLSX.writeFile(wb, `BuildMitra_PEB_Quick_BOQ_${Date.now()}.xlsx`);
    });
  };

  const handleExportPDF = async () => {
    checkAndRun("boq_export", "PEB-BUILDING-BOQ", async () => {
      try {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFillColor(128, 0, 32);
        doc.rect(0, 0, 210, 24, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('BuildMitra – PEB Building BOQ Report', 14, 15);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, 15);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('1. PEB Structure Specifications & Metrics', 14, 34);

        const specRows = [
          ['Building Type:', buildingType, 'Design Code:', designCode],
          ['Dimensions:', `${lengthFt}ft (L) x ${widthFt}ft (W) x ${heightFt}ft (H)`, 'Steel Grade:', steelGrade],
          ['Footprint Area:', `${footprintSqft.toLocaleString()} Sq.ft (${footprintSqM.toFixed(1)} Sq.m)`, 'Bay Spacing:', `${baySpacingFt} ft (${numBays} Bays)`],
          ['Crane Capacity:', craneRequired ? craneCapacity : 'None', 'Wind & Seismic:', `${windZone} / ${seismicZone}`],
          ['Total Steel Weight:', `${steelTonnageBreakdown.totalTonnes} Tonnes (${steelTonnageBreakdown.totalKg.toLocaleString()} kg)`, 'Steel Intensity:', `${steelTonnageBreakdown.intensityKgPerSqft} kg/sqft`],
          ['Cost / Sq.ft:', formatCurrency(boqCalculations.costPerSqft), 'Cost / Kg Steel:', formatCurrency(boqCalculations.costPerKgSteel)],
          ['GRAND TOTAL ESTIMATED PROJECT COST:', formatCurrency(boqCalculations.grandTotalCost), '', '']
        ];

        autoTable(doc, {
          startY: 38,
          body: specRows,
          theme: 'grid',
          styles: { fontSize: 8.5, cellPadding: 2.5 },
          headStyles: { fillColor: [128, 0, 32] }
        });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const nextY = (doc as any).lastAutoTable.finalY + 10;
        doc.text('2. Itemized Bill of Quantities & Cost Breakdown', 14, nextY);

        const tableBody = [
          ['1', 'Primary Steel Members (Columns & Rafters)', `${steelTonnageBreakdown.primaryKg.toLocaleString()} kg`, `₹${ratePrimarySteel}/kg`, formatCurrency(boqCalculations.primaryCost)],
          ['2', 'Secondary Steel Members (Z/C Purlins & Girts)', `${steelTonnageBreakdown.secondaryKg.toLocaleString()} kg`, `₹${rateSecondarySteel}/kg`, formatCurrency(boqCalculations.secondaryCost)],
          ['3', 'Bracings, Sag Rods, Base & Flange Plates', `${steelTonnageBreakdown.bracingKg.toLocaleString()} kg`, `₹${Math.round(rateSecondarySteel * 0.95)}/kg`, formatCurrency(boqCalculations.bracingCost)],
          ['4', 'Roof Profile Sheeting (Color Coated Galvalume)', `${Math.round(netRoofSheetSqft).toLocaleString()} sqft`, `₹${rateRoofSheet}/sqft`, formatCurrency(boqCalculations.roofSheetCost)],
          ['5', 'Polycarbonate Skylight Sheeting (8%)', `${Math.round(skylightAreaSqft).toLocaleString()} sqft`, `₹140/sqft`, formatCurrency(boqCalculations.skylightCost)],
          ['6', 'Wall Cladding Sheeting', `${Math.round(netWallSheetSqft).toLocaleString()} sqft`, `₹${rateWallSheet}/sqft`, formatCurrency(boqCalculations.wallSheetCost)],
          ['7', 'Roof Insulation (Glasswool / Bubble Foil)', `${Math.round(rawRoofAreaSqft).toLocaleString()} sqft`, `₹${rateInsulation}/sqft`, formatCurrency(boqCalculations.insulationCost)],
          ['8', 'Fasteners, EPDM Washers & Accessories', `1 LS`, `-`, formatCurrency(boqCalculations.fastenersCost)],
          ['9', 'Flashings, Gutters & Downpipes', `1 LS`, `-`, formatCurrency(boqCalculations.flashingsCost + boqCalculations.guttersCost)],
          ['10', 'Turbo Ventilators, Doors & Windows', `${turboVentilatorsQty + doorsQty + rollingShuttersQty + windowsQty} Nos`, `-`, formatCurrency(boqCalculations.turboVentCost + boqCalculations.doorsCost + boqCalculations.windowsCost)],
          ['11', 'Paint System (Synthetic Enamel / Epoxy)', `${Math.round(steelTonnageBreakdown.totalTonnes * 28)} sq.m`, `₹180/sq.m`, formatCurrency(boqCalculations.paintCost)],
          ['12', 'Substructure Foundation (Concrete, Rebar, Anchor Bolts)', `1 LS`, `-`, formatCurrency(boqCalculations.foundationTotalCost)],
          ['13', 'Erection, Crane Hire & Mobile Rig', `${steelTonnageBreakdown.totalKg.toLocaleString()} kg`, `₹${rateErectionCrane}/kg`, formatCurrency(boqCalculations.erectionCost)],
          ['14', 'Transportation & Logistics Freight', `${steelTonnageBreakdown.totalTonnes} Tonnes`, `₹2,200/Ton`, formatCurrency(boqCalculations.transportCost)]
        ];

        autoTable(doc, {
          startY: nextY + 4,
          head: [['Sr.', 'Item Description', 'Quantity', 'Unit Rate', 'Total Amount (₹)']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [128, 0, 32], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 8.5, cellPadding: 3 }
        });

        doc.save(`BuildMitra_PEB_Building_BOQ_${Date.now()}.pdf`);
      } catch (err) {
        console.error("PDF generation failed:", err);
        alert("Could not generate PDF. Please try again.");
      }
    });
  };

  const handleExportQuickPDF = async () => {
    checkAndRun("boq_export", "PEB-QUICK-BOQ", async () => {
      try {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFillColor(128, 0, 32);
        doc.rect(0, 0, 210, 24, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('BuildMitra – Quick Preliminary PEB BOQ', 14, 15);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, 15);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('1. Plot Dimensions & Derived IS Structural Geometry', 14, 34);

        const specRows = [
          ['Plot Dimensions:', `${lengthFt}ft (L) x ${widthFt}ft (W) x ${heightFt}ft (H)`, 'Roof Slope:', roofSlope],
          ['Footprint Area:', `${footprintSqft.toLocaleString()} Sq.ft (${footprintSqM.toFixed(1)} Sq.m)`, 'Bay Spacing:', `${quickBOQEngine.quickBaySpacing} ft (${quickBOQEngine.quickNumBays} Bays)`],
          ['Primary Columns:', `Web ${quickBOQEngine.colWeb}mm / Flg ${quickBOQEngine.colFlg}mm`, 'Primary Rafters:', `Web ${quickBOQEngine.rafWeb}mm / Flg ${quickBOQEngine.rafFlg}mm`],
          ['Secondary Purlins:', quickBOQEngine.purlinSpec, 'Total Steel Weight:', `${quickBOQEngine.quickTotalSteelTonnes} Tonnes (${quickBOQEngine.quickTotalSteelKg.toLocaleString()} kg)`],
          ['Cost / Sq.ft:', formatCurrency(quickBOQEngine.costPerSqftQuick), 'GRAND TOTAL ESTIMATED COST:', formatCurrency(quickBOQEngine.grandTotal)]
        ];

        autoTable(doc, {
          startY: 38,
          body: specRows,
          theme: 'grid',
          styles: { fontSize: 8.5, cellPadding: 2.5 },
          headStyles: { fillColor: [128, 0, 32] }
        });

        const nextY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('2. Automatic Preliminary Bill of Quantities (IS Code & Rate Master Integrated)', 14, nextY);

        const tableBody = quickBOQEngine.items.map((it, idx) => [
          String(idx + 1),
          it.code,
          it.name,
          `${it.qty.toLocaleString()} ${it.uom}`,
          it.isFound ? formatCurrency(it.rateVal) : 'Rate unavailable',
          it.isFound ? formatCurrency(it.amountVal) : '—'
        ]);

        autoTable(doc, {
          startY: nextY + 4,
          head: [['Sr.', 'Code', 'Item Description', 'Quantity', 'Unit Rate', 'Total Amount (₹)']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [128, 0, 32], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2.5 }
        });

        doc.save(`BuildMitra_PEB_Quick_BOQ_${Date.now()}.pdf`);
      } catch (err) {
        console.error("Quick PDF generation failed:", err);
        alert("Could not generate Quick PDF. Please try again.");
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>BuildMitra – PEB Building BOQ & Cost Estimation</title>
        <meta name="description" content="Generate complete Pre-Engineered Building (PEB) BOQ, Structural Steel Tonnage, Sheeting, Foundation & Erection Cost Estimates with BuildMitra." />
      </Head>

      <Sidebar currentPath="/peb-building-boq">
        <div className="bm-final-boq-page" style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <span style={styles.badge}>PRE-ENGINEERED BUILDINGS</span>
              <h1 style={styles.headerTitle}>
                🏗️ BuildMitra – PEB Building BOQ & Cost Estimation
              </h1>
            </div>
            <button style={styles.backBtn} onClick={() => router.push("/contractor-dashboard")}>
              ← Back to Dashboard
            </button>
          </div>

          {/* Mode Switcher Tab Bar */}
          <div style={styles.modeToggleContainer}>
            <button
              onClick={() => setBoqMode('quick')}
              style={{
                ...styles.modeToggleBtn,
                border: boqMode === 'quick' ? '2px solid #800020' : '1px solid #cbd5e1',
                backgroundColor: boqMode === 'quick' ? '#800020' : '#ffffff',
                color: boqMode === 'quick' ? '#ffffff' : '#475569',
                boxShadow: boqMode === 'quick' ? '0 4px 12px rgba(128,0,32,0.25)' : 'none'
              }}
            >
              ⚡ QUICK BOQ (Automatic Preliminary BOQ)
            </button>
            <button
              onClick={() => setBoqMode('detailed')}
              style={{
                ...styles.modeToggleBtn,
                border: boqMode === 'detailed' ? '2px solid #800020' : '1px solid #cbd5e1',
                backgroundColor: boqMode === 'detailed' ? '#800020' : '#ffffff',
                color: boqMode === 'detailed' ? '#ffffff' : '#475569',
                boxShadow: boqMode === 'detailed' ? '0 4px 12px rgba(128,0,32,0.25)' : 'none'
              }}
            >
              🏗️ DETAILED BOQ (Full Parameter Control)
            </button>
          </div>

          {/* ========================================================================= */}
          {/* MODE 1: QUICK BOQ (AUTOMATIC PRELIMINARY BOQ)                             */}
          {/* ========================================================================= */}
          {boqMode === 'quick' && (
            <div>
              {/* Clean User Input Card (Length, Width, Height, Slope) */}
              <div style={styles.stepperCard}>
                <div style={styles.sectionHeader}>
                  <span>📐 Enter Plot Size (L x W), Height & Roof Slope</span>
                </div>
                <div className="bm-final-boq-input-grid" style={styles.grid4}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Building Length (L in ft)</label>
                    <input type="number" value={lengthFt} onChange={(e) => setLengthFt(Number(e.target.value))} style={styles.input} min={20} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Building Width / Span (W in ft)</label>
                    <input type="number" value={widthFt} onChange={(e) => setWidthFt(Number(e.target.value))} style={styles.input} min={20} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Clear Height (H in ft)</label>
                    <input type="number" value={heightFt} onChange={(e) => setHeightFt(Number(e.target.value))} style={styles.input} min={10} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Roof Slope</label>
                    <select value={roofSlope} onChange={(e) => setRoofSlope(e.target.value)} style={styles.select}>
                      <option value="1:10">1:10 (Standard Slope)</option>
                      <option value="1:12">1:12 (Low Slope)</option>
                      <option value="1:15">1:15 (Flat Slope)</option>
                      <option value="1:20">1:20 (Minimal Slope)</option>
                    </select>
                  </div>
                </div>

                {/* Derived Engineering Geometry & Member Sections Card */}
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', marginTop: '12px' }}>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#166534', marginBottom: '10px' }}>
                    ⚡ Derived Engineering Geometry & Member Sections (IS 800:2007 & MBMA)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '12px', color: '#14532d' }}>
                    <div><strong>Plot Footprint:</strong> {footprintSqft.toLocaleString()} sq.ft ({footprintSqM.toFixed(1)} sq.m)</div>
                    <div><strong>Bay Spacing:</strong> {quickBOQEngine.quickBaySpacing} ft ({quickBOQEngine.quickNumBays} Bays)</div>
                    <div><strong>Portal Columns:</strong> {quickBOQEngine.numColumns} Nos Column Pedestals</div>
                    <div><strong>Primary Columns:</strong> Web {quickBOQEngine.colWeb}mm / Flg {quickBOQEngine.colFlg}mm</div>
                    <div><strong>Primary Rafters:</strong> Web {quickBOQEngine.rafWeb}mm / Flg {quickBOQEngine.rafFlg}mm</div>
                    <div><strong>Secondary Purlins:</strong> {quickBOQEngine.purlinSpec}</div>
                    <div><strong>Turbo Ventilators:</strong> {quickBOQEngine.quickTurboVentQty} No. (IS 875 Ventilation)</div>
                    <div><strong>Openings:</strong> {quickBOQEngine.quickDoorsQty} Exit Door, {quickBOQEngine.quickShuttersQty} Shutter, {quickBOQEngine.quickWindowsQty} Windows</div>
                  </div>
                </div>
              </div>

              {/* Quick BOQ Metric Summary */}
              <div className="bm-final-boq-summary" style={styles.summaryGrid}>
                <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
                  <span style={styles.metricTitle}>Total Steel Tonnage</span>
                  <span style={styles.metricVal}>{quickBOQEngine.quickTotalSteelTonnes} Tonnes</span>
                  <span style={{ fontSize: '11px', opacity: 0.9 }}>({(quickBOQEngine.quickTotalSteelKg / footprintSqft).toFixed(2)} kg/sqft)</span>
                </div>
                <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                  <span style={styles.metricTitle}>Roof Sheeting Area</span>
                  <span style={styles.metricVal}>{quickBOQEngine.quickRoofSheetSqft.toLocaleString()} sqft</span>
                </div>
                <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                  <span style={styles.metricTitle}>Wall Cladding Area</span>
                  <span style={styles.metricVal}>{quickBOQEngine.quickWallSheetSqft.toLocaleString()} sqft</span>
                </div>
                <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                  <span style={styles.metricTitle}>Foundation Concrete</span>
                  <span style={styles.metricVal}>{quickBOQEngine.quickConcreteCum} CUM</span>
                </div>
                <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                  <span style={styles.metricTitle}>Estimated Rate / Sq.ft</span>
                  <span style={styles.metricVal}>{formatCurrency(quickBOQEngine.costPerSqftQuick)}</span>
                  <span style={{ fontSize: '11px', opacity: 0.9 }}>Total: {formatCurrency(quickBOQEngine.grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <button style={styles.btnSecondary} onClick={handleExportQuickExcel}>📊 Export Quick Excel</button>
                <button style={styles.btnSuccess} onClick={handleExportQuickPDF}>📄 Export Quick PDF</button>
                <button style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }} onClick={handlePrint}>🖨️ Print BOQ</button>
                <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }} onClick={() => alert('🛒 Quick PEB BOQ package sent to BuildMitra Supplier Network for wholesale steel & sheeting quotations!')}>🛒 Request Supplier RFQ</button>
              </div>

              {/* Quick BOQ Itemized Table (IS Code & Rate Master Integrated) */}
              <div style={styles.tableContainer}>
                <div style={{ padding: '14px 18px', backgroundColor: '#800020', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px 8px 0 0' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>⚡ Automatic Preliminary PEB BOQ (IS Code & Rate Master Integrated)</h3>
                  <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px' }}>Rate Master Integrated</span>
                </div>
                <div className="bm-final-boq-table-scroll">
                  <table className="bm-final-boq-table" style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Sr.</th>
                        <th style={styles.th}>Master Code</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Item Description & Calculated Section Sizes</th>
                        <th style={styles.th}>UOM</th>
                        <th style={styles.th}>Quantity</th>
                        <th style={styles.th}>Unit Rate (₹)</th>
                        <th style={styles.th}>Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickBOQEngine.items.map((it, idx) => (
                        <tr key={it.code}>
                          <td style={styles.td}>{idx + 1}</td>
                          <td style={styles.td}><code>{it.code}</code></td>
                          <td style={styles.td}>{it.category}</td>
                          <td style={styles.td}><strong>{it.name}</strong></td>
                          <td style={styles.td}>{it.uom}</td>
                          <td style={styles.td}>{it.qty.toLocaleString()}</td>
                          <td style={styles.td}>
                            {it.isFound ? (
                              formatCurrency(it.rateVal)
                            ) : (
                              <span style={{ color: '#dc2626', fontWeight: '800', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Rate unavailable</span>
                            )}
                          </td>
                          <td style={styles.td}>
                            {it.isFound ? (
                              <strong>{formatCurrency(it.amountVal)}</strong>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: '800' }}>
                        <td colSpan={7} style={{ padding: '14px', fontSize: '15px' }}>GRAND TOTAL PRELIMINARY ESTIMATED COST</td>
                        <td style={{ padding: '14px', fontSize: '16px' }}>{formatCurrency(quickBOQEngine.grandTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Missing Rate Master Items Warning Box (if any missing) */}
              {quickBOQEngine.missingItems.length > 0 && (
                <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '16px', marginBottom: '20px', color: '#9f1239' }}>
                  <div style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️ Missing Rate Master Items Report ({quickBOQEngine.missingItems.length} Items Pending Admin Update)</span>
                  </div>
                  <p style={{ fontSize: '12px', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                    The following PEB items were retained in the BOQ with full calculated quantities, but their unit rates are missing or pending approval in the BuildMitra Admin Rate Master system:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
                    {quickBOQEngine.missingItems.map(it => (
                      <li key={it.code} style={{ marginBottom: '4px' }}>
                        <strong><code>{it.code}</code></strong>: {it.name} — Quantity: <strong>{it.qty.toLocaleString()} {it.uom}</strong> (Status: <em>{it.rateObj.status || 'Rate Pending Admin Update'}</em>)
                      </li>
                    ))}
                  </ul>
                  <div style={{ fontSize: '11px', marginTop: '10px', fontStyle: 'italic', color: '#be123c' }}>
                    💡 Please log into the BuildMitra Admin Rate Master dashboard to approve or update prices for these master codes.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: DETAILED BOQ (EXISTING FULL PARAMETER BOQ)                         */}
          {/* ========================================================================= */}
          {boqMode === 'detailed' && (
            <div>
              {/* Form Sections */}
              <div style={styles.stepperCard}>
                {/* Section A: Building Geometry */}
                <div style={styles.sectionHeader}>
                  <span>📐 Section A: Building Dimensions & Structure Specifications</span>
                </div>
                <div className="bm-final-boq-input-grid" style={styles.grid4}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Building Length (ft)</label>
                    <input type="number" value={lengthFt} onChange={(e) => setLengthFt(Number(e.target.value))} style={styles.input} min={20} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Building Width (ft)</label>
                    <input type="number" value={widthFt} onChange={(e) => setWidthFt(Number(e.target.value))} style={styles.input} min={20} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Clear Height (ft)</label>
                    <input type="number" value={heightFt} onChange={(e) => setHeightFt(Number(e.target.value))} style={styles.input} min={10} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Bay Spacing (ft)</label>
                    <input type="number" value={baySpacingFt} onChange={(e) => setBaySpacingFt(Number(e.target.value))} style={styles.input} min={15} max={30} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Calculated Bays</label>
                    <input type="text" value={`${numBays} Bays`} readOnly style={{ ...styles.input, ...styles.inputReadOnly }} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Roof Slope</label>
                    <select value={roofSlope} onChange={(e) => setRoofSlope(e.target.value)} style={styles.select}>
                      <option value="1:10">1:10 (Standard Slope)</option>
                      <option value="1:12">1:12 (Low Slope)</option>
                      <option value="1:15">1:15 (Flat Slope)</option>
                      <option value="1:20">1:20 (Minimal Slope)</option>
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Building Type</label>
                    <select value={buildingType} onChange={(e) => setBuildingType(e.target.value)} style={styles.select}>
                      <option value="Factory">Factory</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Industrial Shed">Industrial Shed</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Cold Storage">Cold Storage</option>
                      <option value="Aircraft Hangar">Aircraft Hangar</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Steel Grade</label>
                    <select value={steelGrade} onChange={(e) => setSteelGrade(e.target.value)} style={styles.select}>
                      <option value="E350 (350 MPa High Tensile)">E350 (350 MPa High Tensile)</option>
                      <option value="E250 (250 MPa Standard Steel)">E250 (250 MPa Standard Steel)</option>
                      <option value="Fe540 (High Strength Steel)">Fe540 (High Strength Steel)</option>
                    </select>
                  </div>
                </div>

                {/* Section B: Crane & Mezzanine */}
                <div style={{ ...styles.sectionHeader, marginTop: '20px' }}>
                  <span>🏗️ Section B: Crane, Mezzanine & Environmental Zones</span>
                </div>
                <div className="bm-final-boq-input-grid" style={styles.grid4}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>EOT Crane Required</label>
                    <select value={craneRequired ? "yes" : "no"} onChange={(e) => setCraneRequired(e.target.value === "yes")} style={styles.select}>
                      <option value="yes">Yes (Crane Gantry Included)</option>
                      <option value="no">No Crane</option>
                    </select>
                  </div>
                  {craneRequired && (
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Crane Capacity</label>
                      <select value={craneCapacity} onChange={(e) => setCraneCapacity(e.target.value)} style={styles.select}>
                        <option value="5 Ton">5 Ton</option>
                        <option value="10 Ton">10 Ton</option>
                        <option value="15 Ton">15 Ton</option>
                        <option value="20 Ton">20 Ton</option>
                        <option value="50 Ton">50 Ton (Heavy Duty)</option>
                      </select>
                    </div>
                  )}
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Mezzanine Floor</label>
                    <select value={mezzanineRequired ? "yes" : "no"} onChange={(e) => setMezzanineRequired(e.target.value === "yes")} style={styles.select}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  {mezzanineRequired && (
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Mezzanine Area (sqft)</label>
                      <input type="number" value={mezzanineAreaSqft} onChange={(e) => setMezzanineAreaSqft(Number(e.target.value))} style={styles.input} />
                    </div>
                  )}
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Wind Speed Zone</label>
                    <select value={windZone} onChange={(e) => setWindZone(e.target.value)} style={styles.select}>
                      <option value="39 m/s (Zone 1)">39 m/s (Zone 1 - Low)</option>
                      <option value="44 m/s (Zone 3 - Standard)">44 m/s (Zone 3 - Standard)</option>
                      <option value="47 m/s (Zone 4)">47 m/s (Zone 4 - High)</option>
                      <option value="50 m/s (Zone 5 - Coastal)">50 m/s (Zone 5 - Coastal Cyclone)</option>
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Seismic Zone</label>
                    <select value={seismicZone} onChange={(e) => setSeismicZone(e.target.value)} style={styles.select}>
                      <option value="Zone II">Zone II (Low)</option>
                      <option value="Zone III">Zone III (Moderate)</option>
                      <option value="Zone IV">Zone IV (Severe)</option>
                      <option value="Zone V">Zone V (Very Severe)</option>
                    </select>
                  </div>
                </div>

                {/* Section C: Sheeting, Cladding & Openings */}
                <div style={{ ...styles.sectionHeader, marginTop: '20px' }}>
                  <span>🎨 Section C: Sheeting, Cladding, Insulation & Openings</span>
                </div>
                <div className="bm-final-boq-input-grid" style={styles.grid3}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Roof Sheeting Type</label>
                    <select value={roofSheeting} onChange={(e) => setRoofSheeting(e.target.value)} style={styles.select}>
                      <option value="0.47mm Galvalume Color Coated Profile">0.47mm Galvalume Color Coated Profile</option>
                      <option value="0.50mm Galvalume Profile">0.50mm Galvalume Profile</option>
                      <option value="Standing Seam Roof (0.55mm)">Standing Seam Roof (0.55mm)</option>
                      <option value="50mm Sandwiched PUFF Panel">50mm Sandwiched PUFF Panel</option>
                      <option value="Bare Galvalume Sheeting">Bare Galvalume Sheeting</option>
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Wall Cladding Type</label>
                    <select value={wallCladding} onChange={(e) => setWallCladding(e.target.value)} style={styles.select}>
                      <option value="Half Brick Wall (3ft) + 0.47mm Galvalume Sheeting">Half Brick Wall (3ft) + 0.47mm Galvalume Sheeting</option>
                      <option value="Full Height 0.47mm Galvalume Sheeting">Full Height 0.47mm Galvalume Sheeting</option>
                      <option value="50mm Sandwiched PUFF Panel Cladding">50mm Sandwiched PUFF Panel Cladding</option>
                      <option value="Bare Galvalume Wall Cladding">Bare Galvalume Wall Cladding</option>
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Roof Insulation</label>
                    <select value={insulation} onChange={(e) => setInsulation(e.target.value)} style={styles.select}>
                      <option value="50mm Glasswool Insulation with Aluminum Foil">50mm Glasswool with Aluminum Foil</option>
                      <option value="100mm Glasswool Insulation">100mm Glasswool Insulation</option>
                      <option value="Rockwool 50mm Insulation">Rockwool 50mm Insulation</option>
                      <option value="Bubble Foil Double Layer">Bubble Foil Double Layer</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Skylight Polycarbonate %</label>
                    <select value={skylightPercent} onChange={(e) => setSkylightPercent(Number(e.target.value))} style={styles.select}>
                      <option value={5}>5% Skylight Area</option>
                      <option value={8}>8% Skylight Area (Standard)</option>
                      <option value={10}>10% Skylight Area</option>
                      <option value={12}>12% Skylight Area</option>
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Turbo Ventilators (Qty)</label>
                    <input type="number" value={turboVentilatorsQty} onChange={(e) => setTurboVentilatorsQty(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Rolling Shutters (Qty)</label>
                    <input type="number" value={rollingShuttersQty} onChange={(e) => setRollingShuttersQty(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Personnel Doors (Qty)</label>
                    <input type="number" value={doorsQty} onChange={(e) => setDoorsQty(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Strip Windows (Qty)</label>
                    <input type="number" value={windowsQty} onChange={(e) => setWindowsQty(Number(e.target.value))} style={styles.input} />
                  </div>
                </div>

                {/* Section D: Rates & Master Benchmark Prices */}
                <div style={{ ...styles.sectionHeader, marginTop: '20px' }}>
                  <span>💰 Section D: Master Unit Rates & Benchmark Pricing (₹)</span>
                </div>
                <div className="bm-final-boq-input-grid" style={styles.grid4}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Primary Steel Rate (₹/kg)</label>
                    <input type="number" value={ratePrimarySteel} onChange={(e) => setRatePrimarySteel(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Secondary Purlin Rate (₹/kg)</label>
                    <input type="number" value={rateSecondarySteel} onChange={(e) => setRateSecondarySteel(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Roof Sheeting Rate (₹/sqft)</label>
                    <input type="number" value={rateRoofSheet} onChange={(e) => setRateRoofSheet(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Wall Cladding Rate (₹/sqft)</label>
                    <input type="number" value={rateWallSheet} onChange={(e) => setRateWallSheet(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Roof Insulation Rate (₹/sqft)</label>
                    <input type="number" value={rateInsulation} onChange={(e) => setRateInsulation(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Erection & Crane Rate (₹/kg)</label>
                    <input type="number" value={rateErectionCrane} onChange={(e) => setRateErectionCrane(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>M25 Concrete Rate (₹/cum)</label>
                    <input type="number" value={rateConcreteM25} onChange={(e) => setRateConcreteM25(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Foundation Rebar Rate (₹/kg)</label>
                    <input type="number" value={rateFoundationRebar} onChange={(e) => setRateFoundationRebar(Number(e.target.value))} style={styles.input} />
                  </div>
                </div>

                {/* Engineering Summary Note Box */}
                <div style={styles.noteBox}>
                  💡 <strong>PEB Structural Design Rule</strong>: Footprint Area: <strong>{footprintSqft.toLocaleString()} Sq.ft</strong> | Total Steel Tonnage: <strong>{steelTonnageBreakdown.totalTonnes} Tonnes</strong> ({steelTonnageBreakdown.intensityKgPerSqft} kg/sqft) | Total Roof Sheeting: <strong>{Math.round(netRoofSheetSqft).toLocaleString()} Sq.ft</strong> | Skylights: <strong>{Math.round(skylightAreaSqft).toLocaleString()} Sq.ft</strong> | Isolated Columns: <strong>{foundationBreakdown.numColumns} Nos</strong>.
                </div>
              </div>

              {/* Metric Summary Cards */}
              <div className="bm-final-boq-summary" style={styles.summaryGrid}>
                <div style={{ ...styles.metricCard, ...styles.metricMaroon }}>
                  <span style={styles.metricTitle}>Total Steel Weight</span>
                  <span style={styles.metricVal}>{steelTonnageBreakdown.totalTonnes} Tonnes</span>
                  <span style={{ fontSize: '11px', opacity: 0.9 }}>({steelTonnageBreakdown.intensityKgPerSqft} kg/sqft)</span>
                </div>
                <div style={{ ...styles.metricCard, ...styles.metricOrange }}>
                  <span style={styles.metricTitle}>Roof Sheeting</span>
                  <span style={styles.metricVal}>{Math.round(netRoofSheetSqft).toLocaleString()} sqft</span>
                </div>
                <div style={{ ...styles.metricCard, ...styles.metricBlue }}>
                  <span style={styles.metricTitle}>Wall Cladding</span>
                  <span style={styles.metricVal}>{Math.round(netWallSheetSqft).toLocaleString()} sqft</span>
                </div>
                <div style={{ ...styles.metricCard, ...styles.metricTeal }}>
                  <span style={styles.metricTitle}>Foundation Concrete</span>
                  <span style={styles.metricVal}>{foundationBreakdown.totalConcreteCum} CUM</span>
                </div>
                <div style={{ ...styles.metricCard, ...styles.metricGreen }}>
                  <span style={styles.metricTitle}>Estimated Rate / Sq.ft</span>
                  <span style={styles.metricVal}>{formatCurrency(boqCalculations.costPerSqft)}</span>
                  <span style={{ fontSize: '11px', opacity: 0.9 }}>Total: {formatCurrency(boqCalculations.grandTotalCost)}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <button style={styles.btnSecondary} onClick={handleExportExcel}>📊 Export Excel</button>
                <button style={styles.btnSuccess} onClick={handleExportPDF}>📄 Export PDF Report</button>
                <button style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }} onClick={handlePrint}>🖨️ Print BOQ</button>
                <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }} onClick={() => alert('🛒 PEB BOQ package sent to BuildMitra Supplier Network for wholesale steel & sheeting quotations!')}>🛒 Request Supplier RFQ</button>
              </div>

              {/* 7 Report Tabs */}
              <div style={styles.tabContainer}>
                <button style={{ ...styles.tabBtn, ...(activeReportTab === "material" ? styles.tabBtnActive : {}) }} onClick={() => setActiveReportTab("material")}>📦 1. Material BOQ</button>
                <button style={{ ...styles.tabBtn, ...(activeReportTab === "labour" ? styles.tabBtnActive : {}) }} onClick={() => setActiveReportTab("labour")}>👷 2. Labour & Erection BOQ</button>
                <button style={{ ...styles.tabBtn, ...(activeReportTab === "cost" ? styles.tabBtnActive : {}) }} onClick={() => setActiveReportTab("cost")}>💰 3. Cost Summary</button>
                <button style={{ ...styles.tabBtn, ...(activeReportTab === "quantity" ? styles.tabBtnActive : {}) }} onClick={() => setActiveReportTab("quantity")}>📊 4. Quantity Summary</button>
                <button style={{ ...styles.tabBtn, ...(activeReportTab === "steel" ? styles.tabBtnActive : {}) }} onClick={() => setActiveReportTab("steel")}>🏗️ 5. Steel Summary</button>
                <button style={{ ...styles.tabBtn, ...(activeReportTab === "foundation" ? styles.tabBtnActive : {}) }} onClick={() => setActiveReportTab("foundation")}>🧱 6. Foundation Summary</button>
                <button style={{ ...styles.tabBtn, ...(activeReportTab === "consolidated" ? styles.tabBtnActive : {}) }} onClick={() => setActiveReportTab("consolidated")}>📑 7. Consolidated BOQ Total Summary</button>
              </div>

              {/* Report Content Panels */}
              {activeReportTab === "material" && (
                <div style={styles.tableContainer}>
                  <div className="bm-final-boq-table-scroll"><table className="bm-final-boq-table" style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Master Code</th>
                        <th style={styles.th}>Material Description & IS Code Member Sizes</th>
                        <th style={styles.th}>UOM</th>
                        <th style={styles.th}>Quantity</th>
                        <th style={styles.th}>Unit Rate (₹)</th>
                        <th style={styles.th}>Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={styles.td}><code>MAT-PEB-PRM</code></td>
                        <td style={styles.td}>
                          <strong>Primary Structural Steel (Built-up Tapered Columns Web {widthFt >= 120 ? '800' : widthFt >= 80 ? '650' : '500'}~250x{widthFt >= 100 || craneRequired ? '8' : '6'}mm Flg {widthFt >= 100 ? '220' : '200'}x{craneRequired ? '14' : '10'}mm & Rafters Web {widthFt >= 120 ? '700' : widthFt >= 80 ? '550' : '400'}~250x{widthFt >= 100 ? '8' : '6'}mm Flg {widthFt >= 100 ? '200' : '180'}x{widthFt >= 100 ? '12' : '10'}mm per {steelGrade})</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>IS 800:2007 / MBMA Design Standard | Yield Strength: 350 MPa</div>
                        </td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{steelTonnageBreakdown.primaryKg.toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(ratePrimarySteel)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.primaryCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>MAT-PEB-SEC</code></td>
                        <td style={styles.td}>
                          <strong>Secondary Steel Members ({baySpacingFt}ft Bay Spacing - Z{baySpacingFt > 25 ? '220' : '200'} x 65 x 20 x {baySpacingFt > 25 ? '2.5' : '2.0'}mm Cold Formed Purlins & Girts per IS 811)</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>IS 811 Cold Formed Steel Sections | Yield Strength: 550 MPa High Tensile</div>
                        </td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{steelTonnageBreakdown.secondaryKg.toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(rateSecondarySteel)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.secondaryCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>MAT-PEB-BRC</code></td>
                        <td style={styles.td}>
                          <strong>Bracings, Sag Rods, Base Plates & Flange Stiffeners (Dia 20mm MS Rod Roof/Wall Diagonal Bracings + Dia 12mm Sag Rods)</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>IS 2062 Grade E250 / IS 800 Wind & Seismic Bracing Schedule</div>
                        </td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{steelTonnageBreakdown.bracingKg.toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(Math.round(rateSecondarySteel * 0.95))}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.bracingCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>MAT-SHT-ROOF</code></td>
                        <td style={styles.td}>
                          <strong>Roof Profile Sheeting ({roofSheeting} - 0.47mm TCT AZ150 550MPa Profile)</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Trapezoidal Profile 28/195 pitch | AZ150 Bare/Color Coating</div>
                        </td>
                        <td style={styles.td}>SQFT</td>
                        <td style={styles.td}>{Math.round(netRoofSheetSqft).toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(rateRoofSheet)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.roofSheetCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>MAT-SHT-SKY</code></td>
                        <td style={styles.td}>
                          <strong>Polycarbonate Skylight Sheeting ({skylightPercent}% Daylight - 2.0mm UV Embossed Sheet)</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>UV Resistant Embossed Translucent Polycarbonate Sheets</div>
                        </td>
                        <td style={styles.td}>SQFT</td>
                        <td style={styles.td}>{Math.round(skylightAreaSqft).toLocaleString()}</td>
                        <td style={styles.td}>₹140.00</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.skylightCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>MAT-SHT-WALL</code></td>
                        <td style={styles.td}>
                          <strong>Wall Cladding Sheeting ({wallCladding})</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Net Cladding Area after deducting doors & window openings</div>
                        </td>
                        <td style={styles.td}>SQFT</td>
                        <td style={styles.td}>{Math.round(netWallSheetSqft).toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(rateWallSheet)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.wallSheetCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>MAT-INS-ROOF</code></td>
                        <td style={styles.td}>
                          <strong>Roof Thermal Insulation ({insulation})</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Thermal Resistance R-Value 1.5 m²K/W | Fire retardant foil</div>
                        </td>
                        <td style={styles.td}>SQFT</td>
                        <td style={styles.td}>{Math.round(rawRoofAreaSqft).toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(rateInsulation)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.insulationCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>MAT-ACC-FST</code></td>
                        <td style={styles.td}>
                          <strong>Fasteners, Self-Tapping Screws & EPDM Seal Washers (Class 3 12-14x25mm)</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Class 3 Corrosion Resistant Screws with Weatherproof EPDM Washers</div>
                        </td>
                        <td style={styles.td}>NOS</td>
                        <td style={styles.td}>{Math.round((netRoofSheetSqft + netWallSheetSqft) * 4.5).toLocaleString()}</td>
                        <td style={styles.td}>₹1.00</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.fastenersCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>MAT-ACC-FLS</code></td>
                        <td style={styles.td}>
                          <strong>Flashings (Ridge Cap, Gable Trim, Corner & Drip Flashing - 0.50mm Girth)</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Matching 0.50mm Galvalume Trims & Flashings Schedule</div>
                        </td>
                        <td style={styles.td}>RFT</td>
                        <td style={styles.td}>{perimeterFt.toLocaleString()}</td>
                        <td style={styles.td}>₹65.00</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.flashingsCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>MAT-ACC-GUT</code></td>
                        <td style={styles.td}>
                          <strong>Eaves Gutters & Rainwater PVC/GI Downpipes ({guttersType})</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Eaves Gutters with Heavy Duty Clamps & Downpipes</div>
                        </td>
                        <td style={styles.td}>RFT</td>
                        <td style={styles.td}>{(2 * lengthFt).toLocaleString()}</td>
                        <td style={styles.td}>₹120.00</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.guttersCost)}</strong></td>
                      </tr>
                      <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: '800' }}>
                        <td colSpan={5} style={{ padding: '12px' }}>TOTAL MATERIAL & ACCESORIES BOQ COST</td>
                        <td style={{ padding: '12px' }}>{formatCurrency(boqCalculations.totalMaterialCost)}</td>
                      </tr>
                    </tbody>
                  </table></div>
                </div>
              )}

              {activeReportTab === "labour" && (
                <div style={styles.tableContainer}>
                  <div className="bm-final-boq-table-scroll"><table className="bm-final-boq-table" style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Task Code</th>
                        <th style={styles.th}>Labour & Erection Service Description</th>
                        <th style={styles.th}>Quantity</th>
                        <th style={styles.th}>UOM</th>
                        <th style={styles.th}>Unit Rate (₹)</th>
                        <th style={styles.th}>Total Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={styles.td}><code>LAB-PEB-ERC</code></td>
                        <td style={styles.td}><strong>Structural Steel Erection, Alignment & Bolting Team</strong></td>
                        <td style={styles.td}>{steelTonnageBreakdown.totalKg.toLocaleString()}</td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{formatCurrency(rateErectionCrane)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.erectionCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>LAB-PEB-TRN</code></td>
                        <td style={styles.td}><strong>Logistics, Heavy Trailer Freight & Crane Rig Hire</strong></td>
                        <td style={styles.td}>{steelTonnageBreakdown.totalTonnes}</td>
                        <td style={styles.td}>TON</td>
                        <td style={styles.td}>₹2,200.00</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.transportCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}><code>LAB-PEB-OVH</code></td>
                        <td style={styles.td}><strong>Site Supervision, Safety Harnessing & Tooling Overheads</strong></td>
                        <td style={styles.td}>1</td>
                        <td style={styles.td}>LS</td>
                        <td style={styles.td}>-</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.siteOverheadsCost)}</strong></td>
                      </tr>
                      <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: '800' }}>
                        <td colSpan={5} style={{ padding: '12px' }}>TOTAL LABOUR, ERECTION & FREIGHT COST</td>
                        <td style={{ padding: '12px' }}>{formatCurrency(boqCalculations.totalLabourErectionCost)}</td>
                      </tr>
                    </tbody>
                  </table></div>
                </div>
              )}

              {activeReportTab === "cost" && (
                <div style={styles.tableContainer}>
                  <div className="bm-final-boq-table-scroll"><table className="bm-final-boq-table" style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Cost Component</th>
                        <th style={styles.th}>Description & Basis</th>
                        <th style={styles.th}>Subtotal Amount (₹)</th>
                        <th style={styles.th}>Share %</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={styles.td}><strong>1. Structural Steel Superstructure</strong></td>
                        <td style={styles.td}>Primary Columns, Rafters, Purlins & Bracings ({steelTonnageBreakdown.totalTonnes} T)</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.primaryCost + boqCalculations.secondaryCost + boqCalculations.bracingCost)}</td>
                        <td style={styles.td}>{(((boqCalculations.primaryCost + boqCalculations.secondaryCost + boqCalculations.bracingCost) / boqCalculations.grandTotalCost) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td style={styles.td}><strong>2. Roof Sheeting & Insulation</strong></td>
                        <td style={styles.td}>Roofing, Skylights & Thermal Insulation</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.roofSheetCost + boqCalculations.skylightCost + boqCalculations.insulationCost)}</td>
                        <td style={styles.td}>{(((boqCalculations.roofSheetCost + boqCalculations.skylightCost + boqCalculations.insulationCost) / boqCalculations.grandTotalCost) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td style={styles.td}><strong>3. Wall Cladding & Accessories</strong></td>
                        <td style={styles.td}>Wall Sheeting, Gutters, Ventilators, Doors & Windows</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.wallSheetCost + boqCalculations.fastenersCost + boqCalculations.flashingsCost + boqCalculations.guttersCost + boqCalculations.turboVentCost + boqCalculations.doorsCost + boqCalculations.windowsCost + boqCalculations.paintCost)}</td>
                        <td style={styles.td}>{(((boqCalculations.wallSheetCost + boqCalculations.fastenersCost + boqCalculations.flashingsCost + boqCalculations.guttersCost + boqCalculations.turboVentCost + boqCalculations.doorsCost + boqCalculations.windowsCost + boqCalculations.paintCost) / boqCalculations.grandTotalCost) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td style={styles.td}><strong>4. Substructure & Foundation</strong></td>
                        <td style={styles.td}>Concrete M25, Footing Steel & Grade 8.8 Anchor Bolts</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.foundationTotalCost)}</td>
                        <td style={styles.td}>{((boqCalculations.foundationTotalCost / boqCalculations.grandTotalCost) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td style={styles.td}><strong>5. Erection, Crane & Freight</strong></td>
                        <td style={styles.td}>Mobile Crane Rig, Heavy Transport & Site Supervision</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.totalLabourErectionCost)}</td>
                        <td style={styles.td}>{((boqCalculations.totalLabourErectionCost / boqCalculations.grandTotalCost) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: '800' }}>
                        <td colSpan={2} style={{ padding: '12px' }}>GRAND TOTAL ESTIMATED PEB BUILDING PROJECT COST</td>
                        <td style={{ padding: '12px' }}>{formatCurrency(boqCalculations.grandTotalCost)}</td>
                        <td style={{ padding: '12px' }}>100.0%</td>
                      </tr>
                    </tbody>
                  </table></div>
                </div>
              )}

              {activeReportTab === "quantity" && (
                <div style={styles.tableContainer}>
                  <div className="bm-final-boq-table-scroll"><table className="bm-final-boq-table" style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Material Category</th>
                        <th style={styles.th}>Total Quantity</th>
                        <th style={styles.th}>UOM</th>
                        <th style={styles.th}>Calculated Unit Rate</th>
                        <th style={styles.th}>Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={styles.td}>Structural Steel Tonnage</td>
                        <td style={styles.td}><strong>{steelTonnageBreakdown.totalTonnes}</strong></td>
                        <td style={styles.td}>Tonnes</td>
                        <td style={styles.td}>₹{Math.round(boqCalculations.primaryCost / steelTonnageBreakdown.primaryKg)}/kg avg</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.primaryCost + boqCalculations.secondaryCost + boqCalculations.bracingCost)}</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>Roof Sheeting (Net Profile)</td>
                        <td style={styles.td}><strong>{Math.round(netRoofSheetSqft).toLocaleString()}</strong></td>
                        <td style={styles.td}>Sq.ft</td>
                        <td style={styles.td}>{formatCurrency(rateRoofSheet)}</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.roofSheetCost)}</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>Wall Cladding Sheeting</td>
                        <td style={styles.td}><strong>{Math.round(netWallSheetSqft).toLocaleString()}</strong></td>
                        <td style={styles.td}>Sq.ft</td>
                        <td style={styles.td}>{formatCurrency(rateWallSheet)}</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.wallSheetCost)}</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>Substructure Footing Concrete</td>
                        <td style={styles.td}><strong>{foundationBreakdown.totalConcreteCum}</strong></td>
                        <td style={styles.td}>CUM</td>
                        <td style={styles.td}>{formatCurrency(rateConcreteM25)}</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.concreteCost)}</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>Foundation Rebar Steel</td>
                        <td style={styles.td}><strong>{foundationBreakdown.rebarKg.toLocaleString()}</strong></td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{formatCurrency(rateFoundationRebar)}</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.rebarCost)}</td>
                      </tr>
                    </tbody>
                  </table></div>
                </div>
              )}

              {activeReportTab === "steel" && (
                <div style={styles.tableContainer}>
                  <div className="bm-final-boq-table-scroll"><table className="bm-final-boq-table" style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Member Type</th>
                        <th style={styles.th}>Section Specs</th>
                        <th style={styles.th}>Weight (Kg)</th>
                        <th style={styles.th}>Weight (Tonnes)</th>
                        <th style={styles.th}>Total Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={styles.td}>Primary Built-up Columns & Rafters</td>
                        <td style={styles.td}>Tapered Built-up Plate Sections ({steelGrade})</td>
                        <td style={styles.td}>{steelTonnageBreakdown.primaryKg.toLocaleString()}</td>
                        <td style={styles.td}>{(steelTonnageBreakdown.primaryKg / 1000).toFixed(2)}</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.primaryCost)}</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>Secondary Purlins & Girts</td>
                        <td style={styles.td}>Cold-formed Z200 / C200 Purlins</td>
                        <td style={styles.td}>{steelTonnageBreakdown.secondaryKg.toLocaleString()}</td>
                        <td style={styles.td}>{(steelTonnageBreakdown.secondaryKg / 1000).toFixed(2)}</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.secondaryCost)}</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>Bracings, Sag Rods & Anchor Plates</td>
                        <td style={styles.td}>Rod/Cable Bracing & Base Plates</td>
                        <td style={styles.td}>{steelTonnageBreakdown.bracingKg.toLocaleString()}</td>
                        <td style={styles.td}>{(steelTonnageBreakdown.bracingKg / 1000).toFixed(2)}</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.bracingCost)}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: '800' }}>
                        <td colSpan={2} style={{ padding: '12px' }}>TOTAL STEEL TONNAGE</td>
                        <td style={{ padding: '12px' }}>{steelTonnageBreakdown.totalKg.toLocaleString()} kg</td>
                        <td style={{ padding: '12px' }}>{steelTonnageBreakdown.totalTonnes} T</td>
                        <td style={{ padding: '12px' }}>{formatCurrency(boqCalculations.primaryCost + boqCalculations.secondaryCost + boqCalculations.bracingCost)}</td>
                      </tr>
                    </tbody>
                  </table></div>
                </div>
              )}

              {activeReportTab === "foundation" && (
                <div style={styles.tableContainer}>
                  <div className="bm-final-boq-table-scroll"><table className="bm-final-boq-table" style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Foundation Component</th>
                        <th style={styles.th}>Technical Specifications</th>
                        <th style={styles.th}>Quantity</th>
                        <th style={styles.th}>UOM</th>
                        <th style={styles.th}>Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={styles.td}>Earthwork Excavation</td>
                        <td style={styles.td}>Isolated Footings & Pit Excavation</td>
                        <td style={styles.td}>{foundationBreakdown.excavationCum}</td>
                        <td style={styles.td}>CUM</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.excavationCost)}</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>M25 Concrete Footings & Pedestals</td>
                        <td style={styles.td}>RMC/Site Mixed M25 Concrete</td>
                        <td style={styles.td}>{foundationBreakdown.totalConcreteCum}</td>
                        <td style={styles.td}>CUM</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.concreteCost)}</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>Footing Reinforcement Steel</td>
                        <td style={styles.td}>Fe500D TMT Rebar (65 kg/cum)</td>
                        <td style={styles.td}>{foundationBreakdown.rebarKg.toLocaleString()}</td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.rebarCost)}</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>High Tensile Anchor Bolts</td>
                        <td style={styles.td}>Grade 8.8 Anchor Bolts & Base Plate Sets</td>
                        <td style={styles.td}>{foundationBreakdown.anchorBoltsKg} kg ({foundationBreakdown.anchorBoltsQty} Bolts)</td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{formatCurrency(boqCalculations.anchorBoltsCost)}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: '800' }}>
                        <td colSpan={4} style={{ padding: '12px' }}>TOTAL SUBSTRUCTURE & FOUNDATION BOQ COST</td>
                        <td style={{ padding: '12px' }}>{formatCurrency(boqCalculations.foundationTotalCost)}</td>
                      </tr>
                    </tbody>
                  </table></div>
                </div>
              )}

              {activeReportTab === "consolidated" && (
                <div style={styles.tableContainer}>
                  <div style={{ padding: '16px 20px', backgroundColor: '#800020', color: 'white', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>📑 CONSOLIDATED MASTER PEB BUILDING BOQ SUMMARY</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Complete itemized material, structural steel, foundation, erection & project overhead cost summary.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>GRAND TOTAL ESTIMATED COST</div>
                      <div style={{ fontSize: '22px', fontWeight: '900' }}>{formatCurrency(boqCalculations.grandTotalCost)}</div>
                    </div>
                  </div>
                  <div className="bm-final-boq-table-scroll"><table className="bm-final-boq-table" style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Sr.</th>
                        <th style={styles.th}>Master Code</th>
                        <th style={styles.th}>Consolidated Work Item Description</th>
                        <th style={styles.th}>UOM</th>
                        <th style={styles.th}>Quantity</th>
                        <th style={styles.th}>Unit Rate (₹)</th>
                        <th style={styles.th}>Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Category 1: Structural Steel */}
                      <tr style={{ backgroundColor: '#f8fafc', fontWeight: '800' }}>
                        <td colSpan={7} style={{ padding: '10px 14px', color: '#800020', borderTop: '2px solid #e2e8f0' }}>I. STRUCTURAL STEEL SUPERSTRUCTURE (IS 800 / MBMA)</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>1</td>
                        <td style={styles.td}><code>MAT-PEB-PRM</code></td>
                        <td style={styles.td}>Primary Structural Steel (Built-up Tapered Columns Web {widthFt >= 120 ? '800' : widthFt >= 80 ? '650' : '500'}~250x{widthFt >= 100 || craneRequired ? '8' : '6'}mm & Rafters Web {widthFt >= 120 ? '700' : widthFt >= 80 ? '550' : '400'}~250x{widthFt >= 100 ? '8' : '6'}mm)</td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{steelTonnageBreakdown.primaryKg.toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(ratePrimarySteel)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.primaryCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>2</td>
                        <td style={styles.td}><code>MAT-PEB-SEC</code></td>
                        <td style={styles.td}>Secondary Steel Members ({baySpacingFt}ft Bay Spacing Z{baySpacingFt > 25 ? '220' : '200'} x 65 x 20 x {baySpacingFt > 25 ? '2.5' : '2.0'}mm Cold Formed Purlins & Girts)</td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{steelTonnageBreakdown.secondaryKg.toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(rateSecondarySteel)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.secondaryCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>3</td>
                        <td style={styles.td}><code>MAT-PEB-BRC</code></td>
                        <td style={styles.td}>Bracings, Sag Rods, Base & Flange Stiffeners (Dia 20mm MS Rod Roof/Wall Bracings + Dia 12mm Sag Rods)</td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{steelTonnageBreakdown.bracingKg.toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(Math.round(rateSecondarySteel * 0.95))}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.bracingCost)}</strong></td>
                      </tr>

                      {/* Category 2: Sheeting & Insulation */}
                      <tr style={{ backgroundColor: '#f8fafc', fontWeight: '800' }}>
                        <td colSpan={7} style={{ padding: '10px 14px', color: '#800020', borderTop: '2px solid #e2e8f0' }}>II. ROOFING, CLADDING & INSULATION</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>4</td>
                        <td style={styles.td}><code>MAT-SHT-ROOF</code></td>
                        <td style={styles.td}>Roof Profile Sheeting ({roofSheeting} - 0.47mm TCT AZ150 550MPa Profile)</td>
                        <td style={styles.td}>SQFT</td>
                        <td style={styles.td}>{Math.round(netRoofSheetSqft).toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(rateRoofSheet)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.roofSheetCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>5</td>
                        <td style={styles.td}><code>MAT-SHT-SKY</code></td>
                        <td style={styles.td}>Polycarbonate Skylight Sheeting ({skylightPercent}% Daylight Area - 2.0mm UV Sheet)</td>
                        <td style={styles.td}>SQFT</td>
                        <td style={styles.td}>{Math.round(skylightAreaSqft).toLocaleString()}</td>
                        <td style={styles.td}>₹140.00</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.skylightCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>6</td>
                        <td style={styles.td}><code>MAT-SHT-WALL</code></td>
                        <td style={styles.td}>Wall Cladding Sheeting ({wallCladding})</td>
                        <td style={styles.td}>SQFT</td>
                        <td style={styles.td}>{Math.round(netWallSheetSqft).toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(rateWallSheet)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.wallSheetCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>7</td>
                        <td style={styles.td}><code>MAT-INS-ROOF</code></td>
                        <td style={styles.td}>Roof Thermal Insulation ({insulation})</td>
                        <td style={styles.td}>SQFT</td>
                        <td style={styles.td}>{Math.round(rawRoofAreaSqft).toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(rateInsulation)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.insulationCost)}</strong></td>
                      </tr>

                      {/* Category 3: Accessories & Openings */}
                      <tr style={{ backgroundColor: '#f8fafc', fontWeight: '800' }}>
                        <td colSpan={7} style={{ padding: '10px 14px', color: '#800020', borderTop: '2px solid #e2e8f0' }}>III. FASTENERS, FLASHINGS & ACCESSORIES</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>8</td>
                        <td style={styles.td}><code>MAT-ACC-FST</code></td>
                        <td style={styles.td}>Fasteners, Self-Tapping Screws & EPDM Seal Washers (Class 3 12-14x25mm)</td>
                        <td style={styles.td}>NOS</td>
                        <td style={styles.td}>{Math.round((netRoofSheetSqft + netWallSheetSqft) * 4.5).toLocaleString()}</td>
                        <td style={styles.td}>₹1.00</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.fastenersCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>9</td>
                        <td style={styles.td}><code>MAT-ACC-FLS</code></td>
                        <td style={styles.td}>Flashings (Ridge Cap, Gable Trim, Corner & Drip Flashing - 0.50mm Girth)</td>
                        <td style={styles.td}>RFT</td>
                        <td style={styles.td}>{perimeterFt.toLocaleString()}</td>
                        <td style={styles.td}>₹65.00</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.flashingsCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>10</td>
                        <td style={styles.td}><code>MAT-ACC-GUT</code></td>
                        <td style={styles.td}>Eaves Gutters & Rainwater PVC/GI Downpipes ({guttersType})</td>
                        <td style={styles.td}>RFT</td>
                        <td style={styles.td}>{(2 * lengthFt).toLocaleString()}</td>
                        <td style={styles.td}>₹120.00</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.guttersCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>11</td>
                        <td style={styles.td}><code>MAT-ACC-VNT</code></td>
                        <td style={styles.td}>Turbo Ventilators ({turboVentilatorsQty} Nos), Doors ({doorsQty} Nos) & Shutters ({rollingShuttersQty} Nos)</td>
                        <td style={styles.td}>NOS</td>
                        <td style={styles.td}>{turboVentilatorsQty + doorsQty + rollingShuttersQty + windowsQty}</td>
                        <td style={styles.td}>-</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.turboVentCost + boqCalculations.doorsCost + boqCalculations.windowsCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>12</td>
                        <td style={styles.td}><code>MAT-PNT-SYS</code></td>
                        <td style={styles.td}>Synthetic Enamel / Epoxy Protective Paint System ({Math.round(steelTonnageBreakdown.totalTonnes * 28)} sq.m)</td>
                        <td style={styles.td}>SQM</td>
                        <td style={styles.td}>{Math.round(steelTonnageBreakdown.totalTonnes * 28)}</td>
                        <td style={styles.td}>₹180.00</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.paintCost)}</strong></td>
                      </tr>

                      {/* Category 4: Substructure & Foundation */}
                      <tr style={{ backgroundColor: '#f8fafc', fontWeight: '800' }}>
                        <td colSpan={7} style={{ padding: '10px 14px', color: '#800020', borderTop: '2px solid #e2e8f0' }}>IV. SUBSTRUCTURE & FOUNDATION WORKS</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>13</td>
                        <td style={styles.td}><code>CIV-FND-CON</code></td>
                        <td style={styles.td}>M25 Concrete for Isolated Footings ({foundationBreakdown.numColumns} Columns) & Plinth Beam</td>
                        <td style={styles.td}>CUM</td>
                        <td style={styles.td}>{foundationBreakdown.totalConcreteCum}</td>
                        <td style={styles.td}>{formatCurrency(rateConcreteM25)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.concreteCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>14</td>
                        <td style={styles.td}><code>LAB-PEB-ERC</code></td>
                        <td style={styles.td}>Erection, Assembly & Crane Rig Charges ({steelTonnageBreakdown.totalKg.toLocaleString()} kg)</td>
                        <td style={styles.td}>KG</td>
                        <td style={styles.td}>{steelTonnageBreakdown.totalKg.toLocaleString()}</td>
                        <td style={styles.td}>{formatCurrency(rateErectionCrane)}</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.erectionCost)}</strong></td>
                      </tr>
                      <tr>
                        <td style={styles.td}>15</td>
                        <td style={styles.td}><code>LAB-PEB-TRN</code></td>
                        <td style={styles.td}>Logistics Freight ({steelTonnageBreakdown.totalTonnes} T) & Site Supervision Overheads</td>
                        <td style={styles.td}>TON</td>
                        <td style={styles.td}>{steelTonnageBreakdown.totalTonnes}</td>
                        <td style={styles.td}>-</td>
                        <td style={styles.td}><strong>{formatCurrency(boqCalculations.transportCost + boqCalculations.siteOverheadsCost)}</strong></td>
                      </tr>

                      {/* GRAND TOTAL */}
                      <tr style={{ backgroundColor: '#800020', color: 'white', fontWeight: '800' }}>
                        <td colSpan={6} style={{ padding: '14px', fontSize: '15px' }}>GRAND TOTAL ESTIMATED CONSOLIDATED PEB BUILDING PROJECT COST</td>
                        <td style={{ padding: '14px', fontSize: '16px' }}>{formatCurrency(boqCalculations.grandTotalCost)}</td>
                      </tr>
                    </tbody>
                  </table></div>
                </div>
              )}
            </div>
          )}
        </div>
      </Sidebar>
    </>
  );
}
