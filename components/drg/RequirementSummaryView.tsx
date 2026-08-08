// BUILDMITRA DRG ENGINE — PHASE 1 REQUIREMENT SUMMARY & VERSIONED SNAPSHOT VIEW (SECTION S)

import React from "react";
import { ProjectRequirementModel } from "../../utils/drg/projectRequirementModel";
import { ValidationResult } from "../../utils/drg/requirementValidator";

interface RequirementSummaryViewProps {
  model: ProjectRequirementModel;
  validation: ValidationResult;
  onEdit: () => void;
  onConfirm: () => void;
}

export default function RequirementSummaryView({ model, validation, onEdit, onConfirm }: RequirementSummaryViewProps) {
  const { project, plot, siteSoil, setbacks, building, floors, duplexTriplex, verticalCirculation, waterServices, vastu, structuralInputs, constructionPreferences } = model;
  const isSbcMissing = !siteSoil.isSoilTestAvailable || !siteSoil.sbcKpa || siteSoil.sbcKpa <= 0;

  return (
    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "14px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>
            📋 PROJECT REQUIREMENT SUMMARY &amp; AUDIT
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
            Review captured inputs below. Click <b>CONFIRM &amp; SAVE VERSIONED SNAPSHOT</b> to lock requirements as the Single Source of Truth for Phase 2.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onEdit} style={{ padding: "10px 18px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
            ✏️ EDIT REQUIREMENTS
          </button>

          <button
            onClick={onConfirm}
            disabled={!validation.isValid}
            style={{
              padding: "10px 20px",
              background: validation.isValid ? "#16a34a" : "#94a3b8",
              color: "#ffffff",
              border: 0,
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: validation.isValid ? "pointer" : "not-allowed",
              fontSize: "12px",
              boxShadow: validation.isValid ? "0 4px 12px rgba(22,163,74,0.3)" : "none",
            }}
          >
            ✓ CONFIRM &amp; CONTINUE (SAVE SNAPSHOT)
          </button>
        </div>
      </div>

      {/* VALIDATION ISSUES DISPLAY */}
      {validation.issues.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          {validation.issues.map((issue, idx) => (
            <div
              key={idx}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "8px",
                background: issue.type === "error" ? "#fef2f2" : issue.type === "warning" ? "#fff7ed" : "#f0f9ff",
                color: issue.type === "error" ? "#991b1b" : issue.type === "warning" ? "#c2410c" : "#0369a1",
                border: `1px solid ${issue.type === "error" ? "#fca5a5" : issue.type === "warning" ? "#fed7aa" : "#bae6fd"}`,
              }}
            >
              <span>{issue.type === "error" ? "❌ ERROR: " : issue.type === "warning" ? "⚠️ WARNING: " : "ℹ️ INFO: "}</span>
              <span>[{issue.section}] {issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* GRID OF SUMMARY CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        
        {/* CARD 1: PROJECT & PLOT */}
        <SummaryCard title="📁 Project & Plot Specifications" icon="🏞️">
          <Item label="Project Name" value={project.projectName} />
          <Item label="Client Name" value={project.clientName} />
          <Item label="Location" value={`${project.projectLocation}, ${project.city}`} />
          <Item label="Plot Dimensions" value={`${plot.plotWidth}' × ${plot.plotLength}' (${plot.plotAreaSqFt} sq.ft)`} highlight />
          <Item label="Site Facing" value={plot.siteFacing} />
          <Item label="Road Width" value={`${plot.roadWidthFt} ft (${plot.roadSide} facing)`} />
          {plot.isCornerPlot && <Item label="Corner Plot" value={`Yes (${plot.secondRoadSide} road - ${plot.secondRoadWidthFt}ft)`} />}
        </SummaryCard>

        {/* CARD 2: SITE, SOIL & SETBACKS */}
        <SummaryCard title="🧪 Site, Soil & Setbacks" icon="📏">
          <Item label="Soil Test Available" value={siteSoil.isSoilTestAvailable ? "Yes" : "No (Awaiting Soil Test)"} />
          <Item label="SBC Status" value={isSbcMissing ? "SOIL TEST / SBC REQUIRED" : `${siteSoil.sbcKpa} ${siteSoil.sbcUnit}`} warn={isSbcMissing} />
          <Item label="Setbacks Mode" value={setbacks.mode} />
          <Item label="Front / Rear Setback" value={`${setbacks.finalAcceptedSetback.front}' / ${setbacks.finalAcceptedSetback.rear}'`} />
          <Item label="Left / Right Setback" value={`${setbacks.finalAcceptedSetback.left}' / ${setbacks.finalAcceptedSetback.right}'`} />
        </SummaryCard>

        {/* CARD 3: BUILDING & VERTICAL CIRCULATION */}
        <SummaryCard title="🏢 Building & Circulation" icon="🛗">
          <Item label="Storeys" value={`${building.numberOfFloors} Floors (${building.hasStilt ? "Stilt + Floors" : "Ground + Upper"})`} highlight />
          <Item label="Basement / Stilt" value={`Basement: ${building.hasBasement ? "Yes" : "No"} | Stilt: ${building.hasStilt ? "Yes" : "No"}`} />
          <Item label="Duplex / Triplex" value={duplexTriplex.isDuplex ? "Duplex (Internal Stairs)" : duplexTriplex.isTriplex ? "Triplex" : "Standard Floors"} />
          <Item label="Staircase Type" value={`${verticalCirculation.staircase.typePreference} (${verticalCirculation.staircase.locationPref})`} />
          <Item label="Passenger Lift" value={verticalCirculation.lift.required ? `Required (${verticalCirculation.lift.passengerCapacity})` : "Not Provisioned"} />
        </SummaryCard>

        {/* CARD 4: WATER & SITE SERVICES */}
        <SummaryCard title="💧 Water & Site Services" icon="⚡">
          <Item label="UG Water Sump" value={waterServices.ugWaterSumpRequired ? `${waterServices.ugWaterSumpCapacityLiters.toLocaleString()} Liters` : "No"} />
          <Item label="Overhead Tank" value={waterServices.overheadTankRequired ? `${waterServices.overheadTankCapacityLiters.toLocaleString()} Liters` : "No"} />
          <Item label="Rainwater Harvesting" value={waterServices.rainwaterHarvestingRequired ? "Yes (Recharge Pit Included)" : "No"} />
          <Item label="Borewell / Solar" value={`Borewell: ${waterServices.borewellRequired ? "Yes" : "No"} | Solar: ${waterServices.solarRequirement ? "Yes" : "No"}`} />
        </SummaryCard>

        {/* CARD 5: VASTU & CONSTRUCTION */}
        <SummaryCard title="🧭 Vastu & Construction Quality" icon="🧱">
          <Item label="Vastu Level" value={vastu.level} />
          <Item label="Main Door / Kitchen" value={`Door: ${vastu.mainDoorDirection || "N/A"} | Kitchen: ${vastu.kitchenDirection || "N/A"}`} />
          <Item label="Wall Material" value={constructionPreferences.wallType} />
          <Item label="Quality Grade" value={constructionPreferences.constructionQuality} />
          <Item label="Structural Preference" value={structuralInputs.structuralSystemPreference} />
        </SummaryCard>

      </div>

      {/* FLOOR-WISE BREAKDOWN SUMMARY */}
      <div style={{ marginTop: "24px", background: "#f8fafc", padding: "18px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
        <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>
          📑 Floor-Wise Requirement Breakdown ({floors.length} Floors Configured)
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {floors.map((f, idx) => (
            <div key={idx} style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontWeight: "900", color: "#0284c7" }}>{f.floorLabel} ({f.floorType})</span>
                <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold", color: "#475569" }}>
                  Parking: {f.parking.parkingMode} ({f.parking.carsCount} Cars, {f.parking.twoWheelersCount} Bikes)
                </span>
              </div>
              <div style={{ color: "#334155" }}>
                Living: <b>{f.rooms.livingRoomCount}</b> | Kitchen: <b>{f.rooms.kitchenCount}</b> | Master Bed: <b>{f.rooms.masterBedrooms}</b> | Other Bed: <b>{f.rooms.otherBedrooms}</b> | Bathrooms: <b>{f.rooms.attachedToilets + f.rooms.commonToilets}</b>
                {f.rooms.poojaRoom && " | Pooja Room"}
                {f.rooms.studyRoom && " | Study/Office"}
                {f.rooms.familyLounge && " | Family Lounge"}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function SummaryCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a", marginBottom: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
        {icon} {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{children}</div>
    </div>
  );
}

function Item({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
      <span style={{ color: "#64748b" }}>{label}:</span>
      <span style={{ fontWeight: "bold", color: warn ? "#dc2626" : highlight ? "#0284c7" : "#1e293b", textAlign: "right" }}>{value}</span>
    </div>
  );
}
