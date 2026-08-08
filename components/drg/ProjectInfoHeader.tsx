// BUILDMITRA DRG ENGINE — TOP HORIZONTAL PROJECT INFORMATION HEADER (SECTIONS 1 TO 6)
// VISIBLE ACROSS ALL SCREENS IN DRG MODULE AS THE SINGLE SOURCE OF TRUTH

import React from "react";
import { ProjectRequirementModel } from "../../utils/drg/projectRequirementModel";

interface ProjectInfoHeaderProps {
  model: ProjectRequirementModel;
}

export default function ProjectInfoHeader({ model }: ProjectInfoHeaderProps) {
  const { project, plot, siteSoil, building, floors, verticalCirculation, waterServices, isConfirmed, version } = model;
  const isSbcMissing = !siteSoil.isSoilTestAvailable || !siteSoil.sbcKpa || siteSoil.sbcKpa <= 0;
  const groundParkingMode = floors[0]?.parking?.parkingMode || "Half Parking";

  return (
    <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", padding: "20px", borderRadius: "16px", marginBottom: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", borderLeft: "5px solid #ff7a00" }}>
      
      {/* SBC WARNING BANNER IF SBC IS MISSING / AWAITING SOIL TEST */}
      {isSbcMissing && (
        <div style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", padding: "8px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>⚠️</span>
          <span>SOIL TEST / SBC REQUIRED FOR FINAL FOUNDATION DESIGN</span>
          <span style={{ fontSize: "10px", color: "#7f1d1d", fontWeight: "normal", marginLeft: "auto" }}>[ Preliminary Assumptions Active ]</span>
        </div>
      )}

      {/* TOP TITLE & SNAPSHOT TAGS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ background: "#ff7a00", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            BUILDMITRA DRG ENGINE v{version}
          </span>
          <span style={{ background: isConfirmed ? "#16a34a" : "#ca8a04", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
            {isConfirmed ? "✓ CONFIRMED SNAPSHOT" : "✏️ DRAFT REQUIREMENT"}
          </span>
        </div>

        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          Single Source of Truth: <b>{project.projectName || "Reddy Residential Project"}</b>
        </div>
      </div>

      {/* 6 HORIZONTAL SECTION CARDS GRID — VISIBLE ACROSS ALL DRG SCREENS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px" }}>
        
        {/* SECTION 1 — PROJECT INFORMATION */}
        <HeaderCard title="Section 1 — Project Info" icon="📁">
          <DetailRow label="Project Name" value={project.projectName || "Reddy Residential Project"} highlight />
          <DetailRow label="City" value={project.city || "Bengaluru"} />
          <DetailRow label="State" value={project.state || "Karnataka"} />
        </HeaderCard>

        {/* SECTION 2 — PLOT INFORMATION */}
        <HeaderCard title="Section 2 — Plot Info" icon="🏞️">
          <DetailRow label="Plot Width" value={`${plot.plotWidth} ft`} />
          <DetailRow label="Plot Length" value={`${plot.plotLength} ft`} />
          <DetailRow label="Road Facing Side" value={`${plot.siteFacing} Facing`} highlight />
          <DetailRow label="Road Width" value={`${plot.roadWidthFt} ft`} />
        </HeaderCard>

        {/* SECTION 3 — BUILDING INFORMATION */}
        <HeaderCard title="Section 3 — Building Info" icon="🏢">
          <DetailRow label="Floors / Storeys" value={`${building.numberOfFloors} (${building.numberOfFloors > 1 ? `G+${building.numberOfFloors - 1}` : "Ground"})`} highlight />
          <DetailRow label="Building Type" value={project.projectType || "Residential Building"} />
          <DetailRow label="Building Usage" value="Own and Rental Use" />
        </HeaderCard>

        {/* SECTION 4 — SOIL & STRUCTURAL INFORMATION */}
        <HeaderCard title="Section 4 — Soil & Structure" icon="🧪">
          <DetailRow label="Soil Type" value={siteSoil.soilType || "Medium Clay / Sand"} />
          <DetailRow label="SBC (kN/m²)" value={isSbcMissing ? "Awaiting Test" : `${siteSoil.sbcKpa} kN/m²`} warn={isSbcMissing} highlight={!isSbcMissing} />
        </HeaderCard>

        {/* SECTION 5 — CIRCULATION & SERVICES */}
        <HeaderCard title="Section 5 — Services" icon="🛗">
          <DetailRow label="Staircase Type" value={verticalCirculation.staircase.typePreference || "Both Internal & External"} />
          <DetailRow label="Lift Required" value={verticalCirculation.lift.required ? `Yes (${verticalCirculation.lift.passengerCapacity})` : "Future Provision"} />
          <DetailRow label="UG Water Tank" value={waterServices.ugWaterSumpRequired ? `Yes (${waterServices.ugWaterSumpCapacityLiters.toLocaleString()}L)` : "No"} />
        </HeaderCard>

        {/* SECTION 6 — PARKING PREFERENCE */}
        <HeaderCard title="Section 6 — Parking" icon="🚗">
          <DetailRow label="Parking Preference" value={groundParkingMode} highlight />
          <DetailRow label="Stilt / Ground" value={building.hasStilt ? "Stilt Parking" : "Ground Parking"} />
        </HeaderCard>

      </div>
    </div>
  );
}

function HeaderCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
      <div style={{ fontSize: "10px", fontWeight: "bold", color: "#ff7a00", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
        <span>{icon}</span> <span>{title}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>{children}</div>
    </div>
  );
}

function DetailRow({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
      <span style={{ color: "#94a3b8" }}>{label}:</span>
      <span style={{ fontWeight: "bold", color: warn ? "#f87171" : highlight ? "#38bdf8" : "#f1f5f9", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "110px" }} title={value}>
        {value}
      </span>
    </div>
  );
}
