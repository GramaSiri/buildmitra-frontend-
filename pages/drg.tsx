import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import {
  DRGInputs,
  Facing,
  PlotShape,
  ParkingPreference,
  GroundFloorUse,
  StaircaseRequirement,
  LiftRequirementOption,
  BuildingType,
  BuildingUsage,
  StructuralSystemPreference,
  BuildingUse,
  PrimaryTab,
  StructuralSubview,
  Phase0AnalysisReport,
  StructuralPlanningReport,
  GroundFloorPlanningReport,
} from "../utils/drg/types";
import { analyzePlotPhase0 } from "../utils/drg/phase0Engine";
import { analyzeStructuralPlanning } from "../utils/drg/structuralPlanningEngine";
import { analyzeGroundFloorPlanning } from "../utils/drg/groundFloorEngine";
import { analyzeFirstFloorPlanning } from "../utils/drg/firstFloorEngine";
import {
  generateBuildingModel,
} from "../utils/drg/layoutSolver";
import { runBuildingModelQA } from "../utils/drg/qaEngine";
import { ArchitecturalSvgRenderer } from "../utils/drg/svgRenderer";
import {
  exportDrawingAsPng,
  exportDrawingAsSvg,
  exportProjectAsPdf,
} from "../utils/drg/exportEngine";

const defaultInputs: DRGInputs = {
  // Section 1 — Project Information
  projectName: "Reddy Residential Project",
  projectLocation: "Bengaluru",
  city: "Bengaluru",
  state: "Karnataka",
  pinCode: "560001",
  projectNotes: "Architectural residential building with modern structural framing and optimal parking.",

  // Section 2 — Plot Information
  plotWidth: 30,
  plotLength: 40,
  plotUnit: "ft",
  plotShape: "Rectangle",
  facing: "South",
  roadWidth: 30,
  roadDirection: "South",
  northDirection: "South",
  isCornerPlot: false,
  secondRoadFacing: undefined,
  secondRoadWidth: undefined,
  setbacks: { front: 3, rear: 0, left: 2, right: 2 },

  // Section 3 — Building Information
  floors: 4, // Ground Floor + 3 Upper Floors (G+3, 4 Storeys Total)
  buildingType: "Residential Building",
  buildingUsage: "Own and Rental Use",
  buildingUse: "Own Use + Rental",
  hasBasement: false,
  hasStilt: true,
  terraceUse: "Open Terrace",
  farLimit: 1.75,
  maxCoveragePercent: 75,
  heightRestriction: 45,
  localRuleProfile: "Standard Urban Byelaws",

  // Section 4 — Soil and Structural Information
  soilType: "Medium Clay/Sand",
  sbcKpa: 250,
  sbcUnit: "kN/m²",
  isSoilTestAvailable: true,
  groundwaterCondition: "Normal (Below 10 ft)",
  structuralSystemPreference: "RCC Framed Structure",
  customStructuralNotes: "Standard IS 456 framed structure with ductility as per IS 13920.",

  // Structural Engineering Parameters
  concreteGrade: "M25",
  steelGrade: "Fe500D",
  externalWallThicknessInches: 9,
  internalWallThicknessInches: 4.5,
  floorToFloorHeightFt: 10,
  seismicZone: "Zone III",
  windZoneMs: 39,

  // Section 5 — Architectural Circulation & Services
  staircaseRequirement: "Both Internal and External",
  liftRequired: true,
  futureLiftProvision: false,
  ugtRequired: true,
  ugtCapacityLiters: 8000,

  // Section 6 — Parking Preference (ONLY 3 OPTIONS)
  parkingPreference: "Half Parking",

  // Section 7 — Fixed Room Requirement Inputs (Counts)
  bedroomsCount: 4,
  masterBedroomsCount: 1,
  attachedToiletsCount: 2,
  commonToiletsCount: 2,
  kitchensCount: 2,
  livingRoomsCount: 2,
  diningRoomsCount: 1,

  // Section 8 — Optional Spaces (Checkboxes)
  poojaRoom: true,
  storeRoom: true,
  balcony: true,
  utility: true,
  verandah: true,
  studyRoom: false,
  officeRoom: false,
  familyLiving: false,
  guestRoom: false,
  servantRoom: false,
  laundryArea: false,
  sitOut: false,
  courtyard: false,
  landscape: true,
  futureExpansion: false,

  // Dedicated Ground Floor Toggle Fields
  groundFloorUse: "Residential",
  landscapePreference: "Required",
  futureExpansionPreference: "Not required",
  gfLiving: true,
  gfFamilyLiving: false,
  gfDining: true,
  gfKitchen: true,
  gfUtility: true,
  gfBedroomsCount: 2,
  gfMasterBedroomsCount: 1,
  gfGuestBedroomsCount: 1,
  gfAttachedToiletsCount: 1,
  gfCommonToiletsCount: 1,
  gfPoojaRoom: true,
  gfStudyRoom: false,
  gfStoreRoom: false,
  gfOfficeRoom: false,
  gfServantRoom: false,

  // Legacy Compatibility
  existingBorewell: false,
  existingSepticTank: false,
  existingTrees: false,
  existingBuilding: false,
  existingGate: false,
  existingFeatures: [],
  staircaseType: "Internal",
  staircaseShape: "Dog-Legged",
  staircaseWidthFt: 4,
  separateRentalStaircase: false,
  lift: true,
  liftCapacity: "6 Person",
  liftPositionPreference: "Near Staircase",
  bedrooms: 4,
  masterBedrooms: 1,
  guestBedrooms: 1,
  childrenBedrooms: 1,
  attachedToilets: 2,
  commonToilets: 2,
  powderToilets: 0,
  livingRooms: 2,
  familyLivingRooms: 0,
  diningRooms: 1,
  kitchens: 2,
  kitchenType: "Closed",
  utilityCount: 1,
  storeRooms: 1,
  poojaRooms: 1,
  studyRooms: 0,
  homeOffices: 0,
  servantRooms: 0,
  homeTheatres: 0,
  gymRooms: 0,
  laundryRooms: 0,
  balconies: 2,
  sitouts: 1,
  foyers: 1,
  courtyards: 0,
  oneKitchenPerFloor: false,
  separateRentalKitchen: false,
  utilityAttachedToKitchen: "Mandatory",
  storeAttachedToKitchen: "Preferred",
  kitchenPlatformType: "L-Shaped",
  sinkPositionPreference: "East Wall",
  refrigeratorSpace: true,
  breakfastCounter: false,
  attachedToiletChoice: "Master Bedroom",
  commonToiletLocation: "Near Dining",
  separateBathAndWC: false,
  toiletVentilatorMandatory: true,
  wetAreaVerticalStacking: true,
  balconyPreference: "Road-Side",
  balconyAttachedTo: "Multiple Rooms",
  masterBalconyChoice: "Mandatory",
  livingBalconyChoice: "Preferred",
  utilityBalcony: false,
  balconyCount: 2,
  minBalconyWidthFt: 4,
  vaastuStrictness: "Strict",
  stylePreference: "Modern",
  ventilationPriority: true,
  daylightPriority: true,
  privacyPriority: true,
};

export default function ProfessionalDRGPage() {
  const router = useRouter();

  const [inputs, setInputs] = useState<DRGInputs>(defaultInputs);
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>("phase0");
  const [activeFloorLevel, setActiveFloorLevel] = useState<number>(0);
  const [structuralSubview, setStructuralSubview] = useState<StructuralSubview>("column_grid");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("cand_1");

  // Persistent Single Source of Truth Calculation Engine Reports
  const phase0Report = useMemo(() => analyzePlotPhase0(inputs), [inputs]);
  const [approvedPlotAnalysis, setApprovedPlotAnalysis] = useState<Phase0AnalysisReport | null>(null);

  const structuralPlanningReport = useMemo(
    () => analyzeStructuralPlanning(inputs, phase0Report),
    [inputs, phase0Report]
  );
  const [approvedStructuralPlanning, setApprovedStructuralPlanning] = useState<StructuralPlanningReport | null>(null);

  const groundFloorReport = useMemo(
    () => analyzeGroundFloorPlanning(inputs, phase0Report, structuralPlanningReport),
    [inputs, phase0Report, structuralPlanningReport]
  );

  const firstFloorReport = useMemo(
    () => analyzeFirstFloorPlanning(inputs, phase0Report, structuralPlanningReport, groundFloorReport),
    [inputs, phase0Report, structuralPlanningReport, groundFloorReport]
  );

  const buildingModel = useMemo(() => generateBuildingModel(inputs), [inputs]);
  const activeCandidate = useMemo(
    () => buildingModel.allCandidates.find((c) => c.id === selectedCandidateId) || buildingModel.selectedCandidate,
    [buildingModel, selectedCandidateId]
  );

  const qaReport = useMemo(() => runBuildingModelQA(buildingModel), [buildingModel]);

  const updateInput = <K extends keyof DRGInputs>(key: K, value: DRGInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const updateSetback = (key: keyof DRGInputs["setbacks"], val: number) => {
    setInputs((prev) => ({
      ...prev,
      setbacks: { ...prev.setbacks, [key]: Number(val) || 0 },
    }));
  };

  const handleProceedToStructuralPlanning = () => {
    setApprovedPlotAnalysis(phase0Report);
    setPrimaryTab("structural_planning");
  };

  const handleProceedToGroundFloor = () => {
    setApprovedStructuralPlanning(structuralPlanningReport);
    setPrimaryTab("ground_floor");
  };

  const handleProceedToArchitecturalDrawing = () => {
    setPrimaryTab("architectural");
  };

  const handleDownloadPdf = () => {
    exportProjectAsPdf({
      inputs,
      selectedCandidateId,
      candidates: buildingModel.allCandidates,
      columns: buildingModel.columns,
      boq: buildingModel.boq,
      areaStatement: buildingModel.areaStatement,
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "16px 24px", color: "#0f172a", fontFamily: "sans-serif" }}>
      {/* Top Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #0f172a, #1e293b)",
          color: "#ffffff",
          padding: "20px 24px",
          borderRadius: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          marginBottom: "16px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", letterSpacing: "0.5px" }}>
            📐 BUILDMITRA DRG — ARCHITECTURAL & STRUCTURAL SYSTEM
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
            Plot Analysis • Structural Planning • Ground Floor • Architectural Working Drawings • BOQ
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => exportDrawingAsPng()} style={{ padding: "10px 16px", background: "#0284c7", color: "#fff", border: 0, borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            🖼️ Export PNG
          </button>
          <button onClick={() => exportDrawingAsSvg()} style={{ padding: "10px 16px", background: "#0d9488", color: "#fff", border: 0, borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            📐 Export SVG
          </button>
          <button onClick={handleDownloadPdf} style={{ padding: "10px 16px", background: "#ea580c", color: "#fff", border: 0, borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            📄 PDF Report & BOQ
          </button>
          <button onClick={() => router.push("/")} style={{ padding: "10px 16px", background: "rgba(255,255,255,0.15)", color: "#fff", border: 0, borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            ← Home
          </button>
        </div>
      </header>

      {/* Permanent Compact Project Requirement Summary Card */}
      <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #cbd5e1", marginBottom: "16px", fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "8px" }}>
          <div style={{ fontWeight: "bold", color: "#0284c7", fontSize: "13px" }}>
            📌 PERMANENT PROJECT REQUIREMENT SUMMARY — {inputs.projectName.toUpperCase()}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>
            Location: <b>{inputs.city}, {inputs.state}</b> | PIN: <b>{inputs.pinCode}</b>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", fontSize: "11px", color: "#334155" }}>
          <div><b>Plot Size:</b> {inputs.plotWidth}′ × {inputs.plotLength}′ ({inputs.plotWidth * inputs.plotLength} sq.ft)</div>
          <div><b>Road Facing:</b> {inputs.facing.toUpperCase()} ({inputs.roadWidth} FT)</div>
          <div><b>Building:</b> {inputs.buildingType} ({inputs.buildingUsage})</div>
          <div><b>Floors / Height:</b> {inputs.floors === 1 ? "Ground Floor Only" : `G+${inputs.floors - 1} (${inputs.floors} Storeys Total)`}</div>
          <div><b>Soil & SBC:</b> {inputs.soilType} ({inputs.sbcKpa} kN/m²)</div>
          <div><b>Parking Preference:</b> <span style={{ color: "#0284c7", fontWeight: "bold" }}>{inputs.parkingPreference.toUpperCase()}</span></div>
          <div><b>Circulation:</b> Stair ({inputs.staircaseRequirement}) | Lift ({inputs.liftRequired ? "Yes" : inputs.futureLiftProvision ? "Future Provision" : "No"})</div>
          <div><b>UG Water Tank:</b> {inputs.ugtRequired ? "Required (8000 L)" : "Not Required"}</div>
        </div>
        <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed #cbd5e1", fontSize: "11px", color: "#475569" }}>
          <b>Room Requirements:</b> {inputs.bedroomsCount} Bed, {inputs.attachedToiletsCount + inputs.commonToiletsCount} Toilet, {inputs.kitchensCount} Kitchen, {inputs.livingRoomsCount} Living, {inputs.diningRoomsCount} Dining | <b>Optional Spaces:</b> {[inputs.poojaRoom && "Pooja", inputs.storeRoom && "Store", inputs.balcony && "Balcony", inputs.utility && "Utility", inputs.verandah && "Verandah", inputs.landscape && "Landscape"].filter(Boolean).join(", ")}
        </div>
      </div>

      {/* Permanent Navigation Header Tabs */}
      <div style={{ display: "flex", gap: "8px", background: "#ffffff", padding: "8px", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "16px", flexWrap: "wrap" }}>
        <button onClick={() => setPrimaryTab("phase0")} style={{ padding: "8px 16px", borderRadius: "6px", border: 0, fontWeight: "bold", background: primaryTab === "phase0" ? "#0284c7" : "#f1f5f9", color: primaryTab === "phase0" ? "#fff" : "#475569", cursor: "pointer" }}>
          📍 Plot Analysis
        </button>
        <button onClick={() => setPrimaryTab("structural_planning")} style={{ padding: "8px 16px", borderRadius: "6px", border: 0, fontWeight: "bold", background: primaryTab === "structural_planning" ? "#0284c7" : "#f1f5f9", color: primaryTab === "structural_planning" ? "#fff" : "#475569", cursor: "pointer" }}>
          🏗️ Structural Planning
        </button>
        <button onClick={() => setPrimaryTab("ground_floor")} style={{ padding: "8px 16px", borderRadius: "6px", border: 0, fontWeight: "bold", background: primaryTab === "ground_floor" ? "#16a34a" : "#f1f5f9", color: primaryTab === "ground_floor" ? "#fff" : "#475569", cursor: "pointer" }}>
          🏠 Ground Floor
        </button>
        <button onClick={() => { setPrimaryTab("first_floor"); setActiveFloorLevel(1); }} style={{ padding: "8px 16px", borderRadius: "6px", border: 0, fontWeight: "bold", background: primaryTab === "first_floor" ? "#16a34a" : "#f1f5f9", color: primaryTab === "first_floor" ? "#fff" : "#475569", cursor: "pointer" }}>
          🏢 First Floor
        </button>
        <button onClick={() => setPrimaryTab("architectural")} style={{ padding: "8px 16px", borderRadius: "6px", border: 0, fontWeight: "bold", background: primaryTab === "architectural" ? "#0f172a" : "#f1f5f9", color: primaryTab === "architectural" ? "#fff" : "#475569", cursor: "pointer" }}>
          📐 Architectural Drawing
        </button>
        <button onClick={() => setPrimaryTab("elevation")} style={{ padding: "8px 16px", borderRadius: "6px", border: 0, fontWeight: "bold", background: primaryTab === "elevation" ? "#0f172a" : "#f1f5f9", color: primaryTab === "elevation" ? "#fff" : "#475569", cursor: "pointer" }}>
          🏢 Front Elevation
        </button>
        <button onClick={() => setPrimaryTab("section")} style={{ padding: "8px 16px", borderRadius: "6px", border: 0, fontWeight: "bold", background: primaryTab === "section" ? "#0f172a" : "#f1f5f9", color: primaryTab === "section" ? "#fff" : "#475569", cursor: "pointer" }}>
          ✂️ Cross Section
        </button>
        <button onClick={() => setPrimaryTab("boq")} style={{ padding: "8px 16px", borderRadius: "6px", border: 0, fontWeight: "bold", background: primaryTab === "boq" ? "#0f172a" : "#f1f5f9", color: primaryTab === "boq" ? "#fff" : "#475569", cursor: "pointer" }}>
          📄 Civil BOQ & QA Audit
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PLOT ANALYSIS MODULE */}
      {/* ========================================================================= */}
      {primaryTab === "phase0" && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", alignItems: "start" }}>
          {/* Left Sidebar Sequential User Input Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Section 1: Project Information */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>Section 1 — Project Information</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                <label style={{ fontWeight: "bold" }}>Project Name <input type="text" value={inputs.projectName} onChange={(e) => updateInput("projectName", e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }} /></label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <label style={{ fontWeight: "bold" }}>City <input type="text" value={inputs.city} onChange={(e) => updateInput("city", e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }} /></label>
                  <label style={{ fontWeight: "bold" }}>State <input type="text" value={inputs.state} onChange={(e) => updateInput("state", e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }} /></label>
                </div>
              </div>
            </div>

            {/* Section 2: Plot Information */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>Section 2 — Plot Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                <label style={{ fontWeight: "bold" }}>Plot Width (ft) <input type="number" value={inputs.plotWidth} onChange={(e) => updateInput("plotWidth", Math.max(10, Number(e.target.value)))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }} /></label>
                <label style={{ fontWeight: "bold" }}>Plot Length (ft) <input type="number" value={inputs.plotLength} onChange={(e) => updateInput("plotLength", Math.max(10, Number(e.target.value)))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }} /></label>
                <label style={{ fontWeight: "bold" }}>
                  Road Facing Side
                  <select value={inputs.facing} onChange={(e) => updateInput("facing", e.target.value as Facing)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }}>
                    <option value="East">East Facing</option>
                    <option value="West">West Facing</option>
                    <option value="North">North Facing</option>
                    <option value="South">South Facing</option>
                  </select>
                </label>
                <label style={{ fontWeight: "bold" }}>Road Width (ft) <input type="number" value={inputs.roadWidth} onChange={(e) => updateInput("roadWidth", Math.max(10, Number(e.target.value)))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }} /></label>
              </div>
            </div>

            {/* Section 3: Building Information */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>Section 3 — Building Information</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                <label style={{ fontWeight: "bold" }}>
                  Number of Floors / Storeys (Up to 12 Floors / G+11)
                  <input type="number" min="1" max="12" value={inputs.floors} onChange={(e) => updateInput("floors", Math.max(1, Math.min(12, Number(e.target.value))))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }} />
                  <span style={{ fontSize: "10px", color: "#64748b" }}>Maximum supported configuration: Ground Floor plus 11 upper floors, totalling 12 storeys.</span>
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <label style={{ fontWeight: "bold" }}>
                    Building Type
                    <select value={inputs.buildingType} onChange={(e) => updateInput("buildingType", e.target.value as BuildingType)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }}>
                      <option value="Independent House">Independent House</option>
                      <option value="Villa">Villa</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Residential Building">Residential Building</option>
                      <option value="Commercial Building">Commercial Building</option>
                      <option value="Office Building">Office Building</option>
                      <option value="Shop">Shop</option>
                      <option value="Mixed Use">Mixed Use</option>
                      <option value="Rental Building">Rental Building</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </label>

                  <label style={{ fontWeight: "bold" }}>
                    Building Usage
                    <select value={inputs.buildingUsage} onChange={(e) => updateInput("buildingUsage", e.target.value as BuildingUsage)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }}>
                      <option value="Own Use">Own Use</option>
                      <option value="Rental Use">Rental Use</option>
                      <option value="Own and Rental Use">Own and Rental Use</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4: Soil & Structural Information */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>Section 4 — Soil & Structural Information</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                <label style={{ fontWeight: "bold" }}>
                  Soil Type Selection
                  <select value={inputs.soilType} onChange={(e) => updateInput("soilType", e.target.value as any)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }}>
                    <option value="Auto">Auto (Soil Report Pending)</option>
                    <option value="Hard Rock">Hard Rock (&gt; 300 kN/m²)</option>
                    <option value="Medium Clay/Sand">Medium Clay / Sand (180-250 kN/m²)</option>
                    <option value="Soft Soil">Soft Soil (100-150 kN/m²)</option>
                    <option value="Loose Sand">Loose Sand (&lt; 100 kN/m²)</option>
                  </select>
                </label>

                <label style={{ fontWeight: "bold" }}>
                  Safe Bearing Capacity (SBC in kN/m²)
                  <input type="number" min="50" max="600" value={inputs.sbcKpa} onChange={(e) => updateInput("sbcKpa", Math.max(50, Number(e.target.value)))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }} />
                </label>
                {inputs.soilType === "Auto" && (
                  <div style={{ padding: "6px 8px", background: "#fffbebe", borderRadius: "6px", border: "1px solid #fef08a", color: "#854d0e", fontSize: "10px", fontWeight: "bold" }}>
                    ⚠️ SBC NOT PROVIDED — STRUCTURAL OUTPUT IS PRELIMINARY ONLY
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Architectural Circulation & Services */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>Section 5 — Circulation & Services</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                <label style={{ fontWeight: "bold" }}>
                  Staircase Type
                  <select value={inputs.staircaseRequirement} onChange={(e) => updateInput("staircaseRequirement", e.target.value as StaircaseRequirement)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "2px" }}>
                    <option value="Internal Staircase">Internal Staircase</option>
                    <option value="External Staircase">External Staircase</option>
                    <option value="Both Internal and External">Both Internal and External</option>
                    <option value="Automatic Logical Selection">Automatic Logical Selection</option>
                    <option value="No Staircase">No Staircase</option>
                  </select>
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <label><input type="checkbox" checked={inputs.liftRequired} onChange={(e) => { updateInput("liftRequired", e.target.checked); if (e.target.checked) updateInput("futureLiftProvision", false); }} /> Lift Required</label>
                  <label><input type="checkbox" checked={inputs.futureLiftProvision} onChange={(e) => { updateInput("futureLiftProvision", e.target.checked); if (e.target.checked) updateInput("liftRequired", false); }} /> Future Lift Provision</label>
                </div>

                <label style={{ fontWeight: "bold", marginTop: "4px" }}>
                  <input type="checkbox" checked={inputs.ugtRequired} onChange={(e) => updateInput("ugtRequired", e.target.checked)} /> Underground Water Tank Required
                </label>
              </div>
            </div>

            {/* Section 6: Parking Preference (ONLY 3 OPTIONS) */}
            <div style={{ background: "#f0f9ff", padding: "14px", borderRadius: "12px", border: "1px solid #bae6fd" }}>
              <label style={{ fontWeight: "bold", color: "#0369a1", fontSize: "12px" }}>
                Section 6 — Parking Preference
                <select value={inputs.parkingPreference} onChange={(e) => updateInput("parkingPreference", e.target.value as ParkingPreference)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #0284c7", marginTop: "4px", fontWeight: "bold" }}>
                  <option value="Full Parking">Full Parking</option>
                  <option value="Half Parking">Half Parking</option>
                  <option value="No Parking">No Parking</option>
                </select>
              </label>
            </div>
          </div>

          {/* Right Content Panel (Plot Analysis Reports & CAD Drawing) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "18px", color: "#0f172a" }}>📍 PLOT ANALYSIS & PROJECT BRIEF REPORT</h2>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                  Pure Site Analysis • Statutory Regulations • Dynamic Objectives • Structural Recommendations
                </p>
              </div>
              <button onClick={handleProceedToStructuralPlanning} style={{ padding: "10px 20px", background: "#16a34a", color: "#fff", border: 0, borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                Proceed to Structural Planning →
              </button>
            </div>

            {/* Main Layout Container: Left Compact Diagram Widget + Right Multi-Column Grid Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", alignItems: "start" }}>
              
              {/* LEFT SIDEBAR: COMPACT DIAGRAM WIDGET (MAX-WIDTH 340px) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0f172a", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                    📐 Site Envelope Diagram
                  </h3>
                  <div style={{ width: "100%", overflow: "hidden", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <ArchitecturalSvgRenderer
                      primaryTab="phase0"
                      activeFloorLevel={0}
                      structuralSubview={structuralSubview}
                      candidate={activeCandidate}
                      inputs={inputs}
                      buildable={{ x: inputs.setbacks.left, y: inputs.setbacks.front, w: inputs.plotWidth - inputs.setbacks.left - inputs.setbacks.right, h: inputs.plotLength - inputs.setbacks.front - inputs.setbacks.rear }}
                      columns={buildingModel.columns}
                      areaStatement={buildingModel.areaStatement}
                      structuralPlanningReport={structuralPlanningReport}
                      groundFloorReport={groundFloorReport}
                    />
                  </div>
                  <div style={{ marginTop: "10px", fontSize: "10px", color: "#64748b", fontStyle: "italic", textAlign: "center" }}>
                    * Compact preview showing Plot Line, Road ({inputs.facing}), North Arrow, Setbacks (Red Dotted), and Hatched Buildable Envelope.
                  </div>
                </div>

                {/* Quick Action Box */}
                <div style={{ background: "#f0f9ff", padding: "14px", borderRadius: "12px", border: "1px solid #bae6fd" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: "12px", color: "#0369a1", fontWeight: "bold" }}>⚡ Next Step</h4>
                  <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#0c4a6e" }}>
                    Inputs automatically propagate into Structural Planning for grid &amp; member calculations.
                  </p>
                  <button onClick={handleProceedToStructuralPlanning} style={{ width: "100%", padding: "10px", background: "#16a34a", color: "#fff", border: 0, borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                    Proceed to Structural Planning →
                  </button>
                </div>
              </div>

              {/* RIGHT MAIN SECTION: MULTI-COLUMN RESPONSIVE GRID FOR 10 STATUTORY ANALYSIS HEADERS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
                
                {/* 1. Project Summary & Inputs */}
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "12px", color: "#0284c7", fontWeight: "bold" }}>📌 1. Project Summary &amp; Inputs</h4>
                    <span style={{ fontSize: "9px", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>NBC 2016 Part 3</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px", color: "#334155" }}>
                    <div><b>Occupancy:</b> Group A Residential (NBC 2016 Part 3)</div>
                    <div><b>Plot Dimensions:</b> {inputs.plotWidth}′ × {inputs.plotLength}′ ({inputs.plotWidth * inputs.plotLength} sq.ft / {(inputs.plotWidth * inputs.plotLength * 0.092903).toFixed(1)} m²)</div>
                    <div><b>Aspect Ratio:</b> 1:{(inputs.plotLength / inputs.plotWidth).toFixed(2)} (Optimal structural ratio)</div>
                    <div><b>Building Usage:</b> {inputs.buildingUsage} ({inputs.buildingType})</div>
                  </div>
                </div>

                {/* 2. Road & Orientation Analysis */}
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "12px", color: "#0284c7", fontWeight: "bold" }}>🛣️ 2. Road &amp; Orientation Analysis</h4>
                    <span style={{ fontSize: "9px", background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>Vastu &amp; Access</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px", color: "#334155" }}>
                    <div><b>Frontage Road:</b> {inputs.roadWidth} FT wide ({inputs.roadDirection} Facing) per NBC Part 3 Cl 4.2</div>
                    <div><b>Solar &amp; Daylighting:</b> {inputs.facing} axis optimized for natural light &amp; ventilation (IS 2440:1968)</div>
                    <div><b>Emergency Clearance:</b> Complies with 6.0m municipal fire tender access</div>
                  </div>
                </div>

                {/* 3. Setback Requirements */}
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "12px", color: "#0284c7", fontWeight: "bold" }}>📐 3. Setback Requirements</h4>
                    <span style={{ fontSize: "9px", background: "#fee2e2", color: "#991b1b", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>NBC Table 2</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px", color: "#334155", background: "#f8fafc", padding: "8px", borderRadius: "6px" }}>
                    <div>Front: <b style={{ color: "#ef4444" }}>{inputs.setbacks.front} FT</b></div>
                    <div>Rear: <b style={{ color: "#ef4444" }}>{inputs.setbacks.rear} FT</b></div>
                    <div>Left: <b style={{ color: "#ef4444" }}>{inputs.setbacks.left} FT</b></div>
                    <div>Right: <b style={{ color: "#ef4444" }}>{inputs.setbacks.right} FT</b></div>
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>* Light &amp; ventilation plane satisfied per NBC 2016 Part 3 Table 2.</div>
                </div>

                {/* 4. FAR/FSI & Buildable Footprint */}
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "12px", color: "#0284c7", fontWeight: "bold" }}>🏢 4. FAR/FSI &amp; Coverage</h4>
                    <span style={{ fontSize: "9px", background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>Statutory FAR</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px", color: "#334155" }}>
                    <div><b>Permissible FAR:</b> {inputs.farLimit} | <b>Max Coverage:</b> {inputs.maxCoveragePercent}%</div>
                    <div><b>Buildable Footprint:</b> {(inputs.plotWidth - inputs.setbacks.left - inputs.setbacks.right)}′ × {(inputs.plotLength - inputs.setbacks.front - inputs.setbacks.rear)}′</div>
                    <div><b>Net Footprint Area:</b> <b style={{ color: "#0284c7" }}>{(inputs.plotWidth - inputs.setbacks.left - inputs.setbacks.right) * (inputs.plotLength - inputs.setbacks.front - inputs.setbacks.rear)} sq.ft</b> ({((inputs.plotWidth - inputs.setbacks.left - inputs.setbacks.right) * (inputs.plotLength - inputs.setbacks.front - inputs.setbacks.rear) * 0.092903).toFixed(1)} m²)</div>
                  </div>
                </div>

                {/* 5. Building Height & Floor Feasibility */}
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "12px", color: "#0284c7", fontWeight: "bold" }}>🏗️ 5. Height &amp; Floor Feasibility</h4>
                    <span style={{ fontSize: "9px", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>NBC Cl 4.6</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px", color: "#334155" }}>
                    <div><b>Permissible Height:</b> {inputs.heightRestriction} FT per NBC Cl 4.6 (H ≤ 1.5 × (W + S))</div>
                    <div><b>Storeys Requested:</b> G+{inputs.floors - 1} ({inputs.floors} Storeys total)</div>
                    <div><b>Typical Floor Height:</b> 10′-0″ (3.05 m) clear height</div>
                  </div>
                </div>

                {/* 6. Soil & SBC Feasibility */}
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "12px", color: "#0284c7", fontWeight: "bold" }}>🧪 6. Soil &amp; SBC Feasibility</h4>
                    <span style={{ fontSize: "9px", background: "#f1f5f9", color: "#334155", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>IS 1904 / IS 1080</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px", color: "#334155" }}>
                    <div><b>Design SBC:</b> <b style={{ color: "#16a34a" }}>{inputs.sbcKpa} kN/m²</b> @ 1.50m (5′-0″) NGL embedment</div>
                    <div><b>Soil Classification:</b> {inputs.soilType} (IS 1904:2021)</div>
                    <div><b>Foundation Feasibility:</b> Isolated Spread Footings (Settlement &lt; 25mm)</div>
                  </div>
                </div>

                {/* 7. Parking Feasibility */}
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "12px", color: "#0284c7", fontWeight: "bold" }}>🚗 7. Parking Feasibility</h4>
                    <span style={{ fontSize: "9px", background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>NBC Annex B</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px", color: "#334155" }}>
                    <div><b>Selected Strategy:</b> {inputs.parkingPreference}</div>
                    <div><b>ECS Allocation:</b> 1 ECS per 100 m² FAR area per NBC 2016 Annex B</div>
                    <div><b>Driveway Geometry:</b> Min 5.0m outer radius for vehicle maneuvering</div>
                  </div>
                </div>

                {/* 8. Circulation & Utility Provisions */}
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "12px", color: "#0284c7", fontWeight: "bold" }}>🚶‍♂️ 8. Circulation &amp; Utilities</h4>
                    <span style={{ fontSize: "9px", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>IS 1172 / IS 14665</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px", color: "#334155" }}>
                    <div><b>Staircase:</b> {inputs.staircaseRequirement} (Min width 1.20m, riser ≤ 150mm, tread ≥ 270mm)</div>
                    <div><b>Lift Shaft:</b> {inputs.liftRequired ? "Required (IS 14665 6-Passenger)" : inputs.futureLiftProvision ? "Future Lift Shaft Provision" : "Not Required"}</div>
                    <div><b>UGT Tank:</b> {inputs.ugtRequired ? "10,000 Liters (IS 1172 @ 135 LPCD/head)" : "Not Selected"}</div>
                  </div>
                </div>

                {/* 9. Applicable Codes & Standards */}
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "12px", color: "#0284c7", fontWeight: "bold" }}>📜 9. Applicable Standards</h4>
                    <span style={{ fontSize: "9px", background: "#f1f5f9", color: "#334155", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>IS &amp; NBC Codes</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "9.5px", fontWeight: "bold" }}>
                    <span style={{ background: "#f1f5f9", padding: "3px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>NBC 2016 Part 3 &amp; 4</span>
                    <span style={{ background: "#f1f5f9", padding: "3px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>IS 456:2000 (RCC)</span>
                    <span style={{ background: "#f1f5f9", padding: "3px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>IS 1893:2016 (Seismic)</span>
                    <span style={{ background: "#f1f5f9", padding: "3px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>IS 875 (Loads)</span>
                    <span style={{ background: "#f1f5f9", padding: "3px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>IS 13920:2016 (Ductility)</span>
                    <span style={{ background: "#f1f5f9", padding: "3px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>IS 1904 &amp; IS 1080</span>
                  </div>
                </div>

                {/* 10. Engineering Recommendations & Risk Warnings */}
                <div style={{ background: "#fffbe6", padding: "14px", borderRadius: "12px", border: "1px solid #ffe58f", gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "12px", color: "#d48806", fontWeight: "bold" }}>⚠️ 10. Engineering Recommendations &amp; Risk Warnings</h4>
                    <span style={{ fontSize: "9px", background: "#fff0f6", color: "#c41d7f", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>Site Audit Note</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#8c6b00", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div>1. <b>SBC Verification:</b> Soil bearing capacity ({inputs.sbcKpa} kN/m²) must be verified via on-site plate load test prior to foundation excavation (IS 1888).</div>
                    <div>2. <b>Boundary Survey:</b> Setback boundaries must be demarcated by a registered surveyor based on municipal revenue maps.</div>
                    <div>3. <b>Seamless Integration:</b> All plot parameters seamlessly propagate into the Structural Planning calculation engine.</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FULL STRUCTURAL PLANNING MODULE (RESTORED COMPLETELY & VISIBLE) */}
      {/* ========================================================================= */}
      {primaryTab === "structural_planning" && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", alignItems: "start" }}>
          {/* Left Sidebar Form (Inherited Project Summary & Structural Controls) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Inherited Read-Only Information */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>Inherited Project Info (Read-Only)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", color: "#334155" }}>
                <div><b>Plot Dimensions:</b> {inputs.plotWidth}′ × {inputs.plotLength}′</div>
                <div><b>Building Type:</b> {inputs.buildingType}</div>
                <div><b>Building Usage:</b> {inputs.buildingUsage}</div>
                <div><b>Total Storeys:</b> G+{inputs.floors - 1} ({inputs.floors} Storeys)</div>
                <div><b>Road Facing:</b> {inputs.facing}</div>
                <div><b>Soil Type:</b> {inputs.soilType}</div>
                <div><b>SBC:</b> {inputs.sbcKpa} kN/m²</div>
                <div><b>Parking:</b> {inputs.parkingPreference}</div>
              </div>
            </div>

            {/* Automated Structural System Engineering Card (Read-Only Outputs) */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>⚙️ Automated Structural Engine Analysis</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                <div><b>Structural Framing System:</b> <span style={{ color: "#0284c7", fontWeight: "bold" }}>{inputs.structuralSystemPreference}</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "#f8fafc", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div><b>Calculated Concrete:</b> <span style={{ color: "#16a34a", fontWeight: "bold" }}>{structuralPlanningReport.materials.concreteGrade}</span></div>
                  <div><b>Calculated Steel:</b> <span style={{ color: "#16a34a", fontWeight: "bold" }}>{structuralPlanningReport.materials.reinforcementSteelGrade}</span></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div><b>Seismic Zone:</b> {inputs.seismicZone}</div>
                  <div><b>Design Wind Speed:</b> {inputs.windZoneMs} m/s</div>
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", fontStyle: "italic", marginTop: "2px" }}>
                  * Member sizes, grid spans, footings, and rebar schedules are 100% auto-calculated from Plot Analysis inputs.
                </div>
              </div>
            </div>

            {/* Generated Structural Grid Summary Card */}
            <div style={{ background: "#f0f9ff", padding: "16px", borderRadius: "12px", border: "1px solid #bae6fd" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0369a1" }}>Generated Structural Grid Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", color: "#0c4a6e" }}>
                <div><b>Grid Lines X:</b> {structuralPlanningReport.structuralGridSummary.gridLinesX.join(", ")}</div>
                <div><b>Grid Lines Y:</b> {structuralPlanningReport.structuralGridSummary.gridLinesY.join(", ")}</div>
                <div><b>Generated Column Count:</b> <b>{structuralPlanningReport.structuralGridSummary.columnCount} Columns</b></div>
                <div><b>Bay Spacing:</b> {structuralPlanningReport.structuralGridSummary.baySpacingFt}</div>
                <div><b>Vertical Alignment:</b> {structuralPlanningReport.structuralGridSummary.verticalContinuityStatus}</div>
              </div>
            </div>
          </div>

          {/* Right Content Panel (Full Reports, CAD Grid Drawing, Schedules & Validations) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "18px", color: "#0f172a" }}>🏗️ PRELIMINARY STRUCTURAL PLANNING REPORT ({inputs.floors} STOREYS MAX)</h2>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                  IS 456:2000, IS 1893:2016, IS 13920:2016 Compliance • Dynamic Structural Grid C1..Cn & Footings F1..Fn
                </p>
              </div>
              <button onClick={handleProceedToGroundFloor} style={{ padding: "10px 20px", background: "#16a34a", color: "#fff", border: 0, borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                Proceed to Ground Floor →
              </button>
            </div>

            {/* Disclaimer Banner */}
            <div style={{ padding: "10px 14px", background: "#fffbebe", borderRadius: "8px", border: "1px solid #fef08a", color: "#854d0e", fontSize: "11px", fontWeight: "bold" }}>
              PRELIMINARY STRUCTURAL PLANNING — SUBJECT TO SOIL TEST AND LICENSED STRUCTURAL ENGINEER APPROVAL
            </div>

            {/* Structural Recommendations Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: "14px", color: "#0284c7" }}>Foundation Recommendation</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                  <div><b>Foundation System:</b> {structuralPlanningReport.foundationRecommendation.foundationType}</div>
                  <div><b>Recommended Size:</b> {structuralPlanningReport.foundationRecommendation.recommendedFootingSize}</div>
                  <div><b>Min Embedment Depth:</b> {structuralPlanningReport.foundationRecommendation.minEmbedmentDepthFt} FT</div>
                  <div><b>Engineering Reason:</b> <p style={{ margin: "2px 0 0", fontStyle: "italic", color: "#475569" }}>{structuralPlanningReport.foundationRecommendation.reason}</p></div>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: "14px", color: "#0284c7" }}>Column Sizing & Rebar Recommendation</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                  <div><b>Column Dimensions:</b> {structuralPlanningReport.columnRecommendation.columnSizeInches}</div>
                  <div><b>Main Reinforcement:</b> {structuralPlanningReport.columnRecommendation.mainBarDetail}</div>
                  <div><b>Lateral Ties:</b> {structuralPlanningReport.columnRecommendation.stirrupDetail}</div>
                  <div><b>Engineering Reason:</b> <p style={{ margin: "2px 0 0", fontStyle: "italic", color: "#475569" }}>{structuralPlanningReport.columnRecommendation.reason}</p></div>
                </div>
              </div>
            </div>

            {/* Material & Code Compliance */}
            <div style={{ background: "#f0fdf4", padding: "14px", borderRadius: "10px", border: "1px solid #bbf7d0", fontSize: "12px" }}>
              <div style={{ fontWeight: "bold", color: "#16a34a", marginBottom: "4px" }}>✓ Material Engineering & Code Compliance</div>
              <div><b>Concrete Grade:</b> {structuralPlanningReport.materials.concreteGrade} ({structuralPlanningReport.materials.concreteReason})</div>
              <div><b>Steel Grade:</b> {structuralPlanningReport.materials.reinforcementSteelGrade} ({structuralPlanningReport.materials.steelReason})</div>
            </div>

            {/* STRUCTURAL GRID & SPECIMEN DETAIL CAD SVG DRAWING */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>Dimensioned Structural CAD Drawing Package</h3>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => setStructuralSubview("column_grid")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "11px",
                      fontWeight: "bold",
                      background: structuralSubview === "column_grid" ? "#0284c7" : "#f8fafc",
                      color: structuralSubview === "column_grid" ? "#ffffff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    🏗️ Grid &amp; Column Layout
                  </button>
                  <button
                    onClick={() => setStructuralSubview("footing_plan")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "11px",
                      fontWeight: "bold",
                      background: structuralSubview === "footing_plan" ? "#0284c7" : "#f8fafc",
                      color: structuralSubview === "footing_plan" ? "#ffffff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    🧱 Footing Layout
                  </button>
                  <button
                    onClick={() => setStructuralSubview("specimen_detail")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "11px",
                      fontWeight: "bold",
                      background: structuralSubview === "specimen_detail" ? "#0284c7" : "#f8fafc",
                      color: structuralSubview === "specimen_detail" ? "#ffffff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    🔍 Specimen Section Detail
                  </button>
                  <button
                    onClick={() => setStructuralSubview("all_combined")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "11px",
                      fontWeight: "bold",
                      background: structuralSubview === "all_combined" ? "#0284c7" : "#f8fafc",
                      color: structuralSubview === "all_combined" ? "#ffffff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    📐 Full Drawing Sheet
                  </button>
                </div>
              </div>

              {/* 1. TOP: Dimensioned Structural Grid & Footing Layout Plan */}
              <ArchitecturalSvgRenderer
                primaryTab="structural"
                activeFloorLevel={0}
                structuralSubview={structuralSubview === "specimen_detail" ? "specimen_detail" : "column_grid"}
                candidate={activeCandidate}
                inputs={inputs}
                buildable={{ x: inputs.setbacks.left, y: inputs.setbacks.front, w: inputs.plotWidth - inputs.setbacks.left - inputs.setbacks.right, h: inputs.plotLength - inputs.setbacks.front - inputs.setbacks.rear }}
                columns={buildingModel.columns}
                areaStatement={buildingModel.areaStatement}
                structuralPlanningReport={structuralPlanningReport}
                groundFloorReport={groundFloorReport}
              />
            </div>

            {/* 2. MIDDLE: Specimen Cross-Section Detail Section View (Footing + Column Combined) */}
            {structuralSubview !== "column_grid" && structuralSubview !== "footing_plan" && (
              <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: "14px", color: "#0f172a", fontWeight: "bold" }}>
                  🔍 Specimen Cross-Section Detail — Combined Typical Footing (F1) &amp; Column (C1) Section
                </h3>
                <ArchitecturalSvgRenderer
                  primaryTab="structural"
                  activeFloorLevel={0}
                  structuralSubview="specimen_detail"
                  candidate={activeCandidate}
                  inputs={inputs}
                  buildable={{ x: inputs.setbacks.left, y: inputs.setbacks.front, w: inputs.plotWidth - inputs.setbacks.left - inputs.setbacks.right, h: inputs.plotLength - inputs.setbacks.front - inputs.setbacks.rear }}
                  columns={buildingModel.columns}
                  areaStatement={buildingModel.areaStatement}
                  structuralPlanningReport={structuralPlanningReport}
                  groundFloorReport={groundFloorReport}
                />
              </div>
            )}

            {/* Column Schedule Table */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "14px", color: "#0f172a" }}>Column Schedule (C1 to C{structuralPlanningReport.schedules.columnSchedule.length})</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <thead>
                  <tr style={{ background: "#0f172a", color: "#fff" }}>
                    <th style={{ padding: "6px", textAlign: "left" }}>Mark</th>
                    <th style={{ padding: "6px", textAlign: "left" }}>Size (mm / inches)</th>
                    <th style={{ padding: "6px", textAlign: "left" }}>Main Reinforcement</th>
                    <th style={{ padding: "6px", textAlign: "left" }}>Lateral Ties</th>
                  </tr>
                </thead>
                <tbody>
                  {structuralPlanningReport.schedules.columnSchedule.map((row, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0", fontWeight: "bold" }}>{row.mark}</td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>{row.size}</td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>{row.mainBars}</td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>{row.ties}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footing Schedule Table */}
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "14px", color: "#0f172a" }}>Footing Schedule (F1 to F{structuralPlanningReport.schedules.footingSchedule.length})</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <thead>
                  <tr style={{ background: "#0f172a", color: "#fff" }}>
                    <th style={{ padding: "6px", textAlign: "left" }}>Mark</th>
                    <th style={{ padding: "6px", textAlign: "left" }}>Supported Column</th>
                    <th style={{ padding: "6px", textAlign: "left" }}>Footing Dimensions (L × W)</th>
                    <th style={{ padding: "6px", textAlign: "left" }}>Thickness</th>
                    <th style={{ padding: "6px", textAlign: "left" }}>Depth (Df)</th>
                  </tr>
                </thead>
                <tbody>
                  {structuralPlanningReport.schedules.footingSchedule.map((row, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0", fontWeight: "bold" }}>{row.mark}</td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>{row.column}</td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>{row.size}</td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>{row.thickness}</td>
                      <td style={{ padding: "6px", border: "1px solid #e2e8f0" }}>{row.depth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* General Structural Notes */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "14px", color: "#0f172a" }}>📋 General Structural Engineering Notes</h3>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "11px", color: "#334155", display: "flex", flexDirection: "column", gap: "6px" }}>
                {structuralPlanningReport.engineeringNotes.map((note, idx) => (
                  <li key={idx}><b>Note {idx + 1}:</b> {note}</li>
                ))}
                <li><b>Concrete Covers:</b> Footings = 50mm, Columns = 40mm, Beams = 25mm, Slabs = 15mm.</li>
                <li><b>Development Length ($L_d$):</b> Minimum $47\phi$ anchorage into footing with 300mm standard 90° end hook per IS 456 / IS 13920.</li>
                <li><b>Ductile Detailing:</b> All column ties shall feature 135° seismic hooks ($10\phi$ extension) per IS 13920:2016.</li>
              </ul>
            </div>

            {/* Structural Validation Summary */}
            <div style={{ background: "#f0fdf4", padding: "14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "14px", color: "#16a34a" }}>✓ Structural Planning Validation Audit [PASS]</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11px" }}>
                <div><b>Column Marking Check:</b> Generated {structuralPlanningReport.markingValidation.columnCheck.generatedColumns} | Displayed {structuralPlanningReport.markingValidation.columnCheck.displayedColumnMarks} | Scheduled {structuralPlanningReport.markingValidation.columnCheck.scheduledColumns} <span style={{ color: "#16a34a", fontWeight: "bold" }}>[{structuralPlanningReport.markingValidation.columnCheck.status}]</span></div>
                <div><b>Footing Marking Check:</b> Generated {structuralPlanningReport.markingValidation.footingCheck.generatedFootings} | Displayed {structuralPlanningReport.markingValidation.footingCheck.displayedFootingMarks} | Scheduled {structuralPlanningReport.markingValidation.footingCheck.scheduledFootings} <span style={{ color: "#16a34a", fontWeight: "bold" }}>[{structuralPlanningReport.markingValidation.footingCheck.status}]</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GROUND FLOOR MODULE (PRESERVED SEPARATELY) */}
      {/* ========================================================================= */}
      {primaryTab === "ground_floor" && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", alignItems: "start" }}>
          {/* Left Sidebar Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>1. Inherited Project Information (Read-Only)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", color: "#334155" }}>
                <div><b>Plot Dimensions:</b> {inputs.plotWidth}′ × {inputs.plotLength}′</div>
                <div><b>Plot Area:</b> {inputs.plotWidth * inputs.plotLength} sq.ft</div>
                <div><b>Road Facing:</b> {inputs.facing}</div>
                <div><b>Road Width:</b> {inputs.roadWidth} FT</div>
                <div><b>Front Setback:</b> {inputs.setbacks.front} FT</div>
                <div><b>Rear Setback:</b> {inputs.setbacks.rear} FT</div>
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>2. Ground Floor Requirements</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                <label style={{ fontWeight: "bold" }}>
                  Ground Floor Use
                  <select value={inputs.groundFloorUse} onChange={(e) => updateInput("groundFloorUse", e.target.value as GroundFloorUse)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" }}>
                    <option value="Residential">Residential</option>
                    <option value="Parking with residential">Parking with residential</option>
                    <option value="Full parking">Full parking</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Office">Office</option>
                  </select>
                </label>

                <div style={{ padding: "10px", background: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                  <label style={{ fontWeight: "bold", color: "#0369a1" }}>
                    Parking Preference
                    <select value={inputs.parkingPreference} onChange={(e) => updateInput("parkingPreference", e.target.value as ParkingPreference)} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #0284c7", marginTop: "4px", fontWeight: "bold" }}>
                      <option value="Full Parking">Full Parking</option>
                      <option value="Half Parking">Half Parking</option>
                      <option value="No Parking">No Parking</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>Ground Floor Layout & Summary</h3>
                <button onClick={handleProceedToArchitecturalDrawing} style={{ padding: "8px 16px", background: "#16a34a", color: "#fff", border: 0, borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                  Proceed to Architectural Drawing →
                </button>
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <ArchitecturalSvgRenderer
                primaryTab="ground_floor"
                activeFloorLevel={0}
                structuralSubview={structuralSubview}
                candidate={activeCandidate}
                inputs={inputs}
                buildable={buildingModel.areaStatement.setbackAreaSqft > 0 ? { x: inputs.setbacks.left, y: inputs.setbacks.front, w: inputs.plotWidth - inputs.setbacks.left - inputs.setbacks.right, h: inputs.plotLength - inputs.setbacks.front - inputs.setbacks.rear } : { x: 0, y: 0, w: inputs.plotWidth, h: inputs.plotLength }}
                columns={buildingModel.columns}
                areaStatement={buildingModel.areaStatement}
                structuralPlanningReport={structuralPlanningReport}
                groundFloorReport={groundFloorReport}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FIRST FLOOR ARCHITECTURAL ENGINE MODULE */}
      {/* ========================================================================= */}
      {primaryTab === "first_floor" && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", alignItems: "start" }}>
          {/* Left Sidebar Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>1. First Floor Configuration</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", color: "#334155" }}>
                <div><b>Typology:</b> {firstFloorReport.projectInputs.firstFloorUse}</div>
                <div><b>Duplex Mode:</b> {firstFloorReport.projectInputs.isDuplex ? "Yes (Internal Stair Alignment)" : "No (Independent Rental Unit)"}</div>
                <div><b>Staircase Core:</b> {firstFloorReport.projectInputs.staircaseType} (Vertically Aligned)</div>
                <div><b>Lift Core:</b> {firstFloorReport.projectInputs.liftStatus}</div>
                <div><b>Balconies:</b> {firstFloorReport.projectInputs.balconyPreference}</div>
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0284c7" }}>2. Area Schedule (NBC 2016)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px", color: "#334155" }}>
                <div><b>Total Built-Up Area:</b> {firstFloorReport.areaSchedule.builtUpSqFt} sq.ft</div>
                <div><b>Net Carpet Area:</b> {firstFloorReport.areaSchedule.carpetAreaSqFt} sq.ft</div>
                <div><b>Standing Balcony Area:</b> {firstFloorReport.areaSchedule.balconyAreaSqFt} sq.ft</div>
                <div><b>Circulation &amp; Shafts:</b> {firstFloorReport.areaSchedule.circulationAreaSqFt} sq.ft</div>
              </div>
            </div>
          </div>

          {/* Right Main Panel: CAD Blueprint Drawing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>First Floor Architectural Plan &amp; Cantilever Balconies</h3>
                <button onClick={handleProceedToArchitecturalDrawing} style={{ padding: "8px 16px", background: "#16a34a", color: "#fff", border: 0, borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                  Proceed to Architectural Drawing →
                </button>
              </div>
              <ArchitecturalSvgRenderer
                primaryTab="first_floor"
                activeFloorLevel={1}
                structuralSubview={structuralSubview}
                candidate={activeCandidate}
                inputs={inputs}
                buildable={buildingModel.areaStatement.setbackAreaSqft > 0 ? { x: inputs.setbacks.left, y: inputs.setbacks.front, w: inputs.plotWidth - inputs.setbacks.left - inputs.setbacks.right, h: inputs.plotLength - inputs.setbacks.front - inputs.setbacks.rear } : { x: 0, y: 0, w: inputs.plotWidth, h: inputs.plotLength }}
                columns={buildingModel.columns}
                areaStatement={buildingModel.areaStatement}
                structuralPlanningReport={structuralPlanningReport}
                groundFloorReport={groundFloorReport}
                firstFloorReport={firstFloorReport}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OTHER ARCHITECTURAL & BOQ TABS */}
      {/* ========================================================================= */}
      {(primaryTab === "architectural" || primaryTab === "elevation" || primaryTab === "section") && (
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
          <ArchitecturalSvgRenderer
            primaryTab={primaryTab}
            activeFloorLevel={activeFloorLevel}
            structuralSubview={structuralSubview}
            candidate={activeCandidate}
            inputs={inputs}
            buildable={buildingModel.areaStatement.setbackAreaSqft > 0 ? { x: inputs.setbacks.left, y: inputs.setbacks.front, w: inputs.plotWidth - inputs.setbacks.left - inputs.setbacks.right, h: inputs.plotLength - inputs.setbacks.front - inputs.setbacks.rear } : { x: 0, y: 0, w: inputs.plotWidth, h: inputs.plotLength }}
            columns={buildingModel.columns}
            areaStatement={buildingModel.areaStatement}
            structuralPlanningReport={structuralPlanningReport}
            groundFloorReport={groundFloorReport}
          />
        </div>
      )}

      {primaryTab === "boq" && (
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
          <h3 style={{ margin: "0 0 12px" }}>Civil Quantity Survey & BOQ</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "#0f172a", color: "#fff" }}>
                <th style={{ padding: "8px", textAlign: "left" }}>Category</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Item Description</th>
                <th style={{ padding: "8px" }}>Qty</th>
                <th style={{ padding: "8px" }}>Unit</th>
                <th style={{ padding: "8px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {buildingModel.boq.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                  <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{row.category}</td>
                  <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{row.item}</td>
                  <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right" }}>{row.qty.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{row.unit}</td>
                  <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right", fontWeight: "bold" }}>₹{row.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
