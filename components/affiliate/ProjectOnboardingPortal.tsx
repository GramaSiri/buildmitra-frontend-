import React, { useState } from "react";
import {
  RealEstateProject,
  InventoryUnit,
  MediaDrawing,
} from "../../utils/affiliate/commissionEngine";
import {
  formatCurrencyINR,
  getStatusBadgeStyle,
  getFacingVastuColor,
} from "../../utils/affiliate/inventoryEngine";
import {
  toggleUnitStatusHelper,
  deleteProjectHelper,
  deleteUnitHelper,
} from "./onboardingHandlers";

interface OnboardingPortalProps {
  projects: RealEstateProject[];
  onUpdateProjects: (updatedProjects: RealEstateProject[]) => void;
  onOpenAddProject?: () => void;
  onOpenAddUnit?: () => void;
  onOpenAddMedia?: () => void;
  selectedProjectId?: string;
  setSelectedProjectId?: (id: string) => void;
}

export default function ProjectOnboardingPortal({
  projects,
  onUpdateProjects,
  onOpenAddProject,
  onOpenAddUnit,
  onOpenAddMedia,
  selectedProjectId: externalProjId,
  setSelectedProjectId: externalSetProjId,
}: OnboardingPortalProps) {
  const [internalProjId, setInternalProjId] = useState(
    projects && projects.length > 0 ? projects[0].id : ""
  );
  const [previewMedia, setPreviewMedia] = useState<MediaDrawing | null>(null);

  const selectedProjectId = externalProjId !== undefined ? externalProjId : internalProjId;
  const setSelectedProjectId = externalSetProjId || setInternalProjId;

  let selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  const handleDeleteProject = (projId: string, projName: string) => {
    if (window.confirm(`Are you sure you want to delete project "${projName}"?`)) {
      const updated = deleteProjectHelper(projId, projects);
      onUpdateProjects(updated);
      if (updated.length > 0) {
        setSelectedProjectId(updated[0].id);
      }
    }
  };

  const handleDeleteUnit = (unitId: string, unitNo: string) => {
    if (!selectedProject) return;
    if (window.confirm(`Are you sure you want to delete unit "${unitNo}"?`)) {
      const updated = deleteUnitHelper(unitId, selectedProject, projects);
      onUpdateProjects(updated);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* HEADER BAR */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          borderRadius: "16px",
          padding: "24px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px rgba(15,23,42,0.15)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>[BUILD]</span>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>
                Developer Project and Inventory Onboarding Portal
              </h2>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
                Onboard new builder projects, configure RERA compliance, manage unit live status matrix and architectural CAD floor plans.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (onOpenAddProject ? onOpenAddProject() : null)}
          style={{
            background: "linear-gradient(135deg, #ff7a00, #ea580c)",
            color: "#ffffff",
            border: 0,
            borderRadius: "10px",
            padding: "12px 20px",
            fontWeight: 800,
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(255,122,0,0.3)",
          }}
        >
          + Onboard New Project
        </button>
      </div>

      {/* PROJECT SELECTOR CAROUSEL */}
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "6px" }}>
        {projects.map((proj) => {
          const isSelected = proj.id === selectedProjectId;
          const availableCount = (proj.inventory || []).filter(
            (u) => u.status === "Available"
          ).length;
          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              style={{
                minWidth: "260px",
                background: isSelected ? "#ffffff" : "#f8fafc",
                border: isSelected ? "2px solid #ff7a00" : "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: isSelected
                  ? "0 4px 15px rgba(255,122,0,0.12)"
                  : "none",
              }}
            >
              <div style={{ fontSize: "11px", color: "#ff7a00", fontWeight: 800 }}>
                RERA: {proj.reraNumber.slice(0, 20)}...
              </div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "4px 0",
                }}
              >
                {proj.projectName}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                [BUILDING] {proj.builderName}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#166534" }}>{availableCount} Available</span>
                <span style={{ color: "#64748b" }}>
                  {proj.inventory?.length || 0} Total Units
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProject && (
        <React.Fragment>
          {/* SELECTED PROJECT DETAILS CARD */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <span
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                RERA COMPLIANT PROJECT
              </span>
              <h3 style={{ margin: "10px 0 4px", fontSize: "20px", color: "#0f172a" }}>
                {selectedProject.projectName}
              </h3>
              <div style={{ fontSize: "13px", color: "#475569", marginBottom: "8px" }}>
                [LOC] {selectedProject.location}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
                <div><b>Builder:</b> {selectedProject.builderName} (GSTIN: {selectedProject.builderGstin || "N/A"})</div>
                <div><b>RERA Registration:</b> {selectedProject.reraNumber}</div>
                <div><b>Platform Commission Standard:</b> {selectedProject.defaultCommissionValue}% agreed margin</div>
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "16px",
                border: "1px dashed #cbd5e1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span>Total Layout Area:</span>
                <b>{selectedProject.totalAreaSqFt.toLocaleString("en-IN")} Sq.Ft</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span>Configured Inventory:</span>
                <b>{selectedProject.inventory?.length || 0} Units</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span>Architectural Media Files:</span>
                <b>{selectedProject.mediaDrawings?.length || 0} CAD/Floorplans</b>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => (onOpenAddUnit ? onOpenAddUnit() : null)}
                  style={{
                    flex: 1,
                    background: "#0f172a",
                    color: "#ffffff",
                    border: 0,
                    borderRadius: "8px",
                    padding: "8px",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  + Add Inventory Unit
                </button>
                <button
                  type="button"
                  onClick={() => (onOpenAddMedia ? onOpenAddMedia() : null)}
                  style={{
                    flex: 1,
                    background: "#2563eb",
                    color: "#ffffff",
                    border: 0,
                    borderRadius: "8px",
                    padding: "8px",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  + Upload Drawing / CAD
                </button>
              </div>
            </div>
          </div>

          {/* UNIT-LEVEL LIVE INVENTORY MANAGER TABLE */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: "17px", color: "#0f172a" }}>
                  [MATRIX] Unit-Level Live Inventory and Status Matrix
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Toggle status in real-time. Live updates sync automatically across the Consumer Project Catalog.
                </p>
              </div>

              {/* Status Legend Badges */}
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ fontSize: "11px", background: "#dcfce7", color: "#15803d", padding: "4px 8px", borderRadius: "6px", fontWeight: 700 }}>
                  Available (Green)
                </span>
                <span style={{ fontSize: "11px", background: "#fef9c3", color: "#a16207", padding: "4px 8px", borderRadius: "6px", fontWeight: 700 }}>
                  Hold/Blocked (Yellow)
                </span>
                <span style={{ fontSize: "11px", background: "#fee2e2", color: "#b91c1c", padding: "4px 8px", borderRadius: "6px", fontWeight: 700 }}>
                  Sold (Red)
                </span>
                <span style={{ fontSize: "11px", background: "#dbeafe", color: "#1e40af", padding: "4px 8px", borderRadius: "6px", fontWeight: 700 }}>
                  Reserved (Blue)
                </span>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "10px 12px" }}>Unit / Plot No.</th>
                    <th style={{ padding: "10px 12px" }}>Category</th>
                    <th style={{ padding: "10px 12px" }}>Facing (Vastu)</th>
                    <th style={{ padding: "10px 12px" }}>Area (Sq.Ft)</th>
                    <th style={{ padding: "10px 12px" }}>Base Rate (₹/Sq.Ft)</th>
                    <th style={{ padding: "10px 12px" }}>Total Cost (₹)</th>
                    <th style={{ padding: "10px 12px" }}>Platform Comm. (₹)</th>
                    <th style={{ padding: "10px 12px" }}>Live Status Matrix</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedProject.inventory || []).length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                        No inventory units added yet. Click "+ Add Inventory Unit" above to add plots or apartments!
                      </td>
                    </tr>
                  ) : (
                    (selectedProject.inventory || []).map((unit) => {
                      const badge = getStatusBadgeStyle(unit.status);
                      const vastuColor = getFacingVastuColor(unit.facing);
                      return (
                        <tr key={unit.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: 800, color: "#0f172a" }}>
                            {unit.unitNo}
                            {unit.dimensions && (
                              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 400 }}>
                                {unit.dimensions}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                              {unit.type}
                            </span>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ color: vastuColor, fontWeight: 700, fontSize: "12px" }}>
                              [VASTU] {unit.facing}
                            </span>
                          </td>
                          <td style={{ padding: "12px" }}>{unit.areaSqFt.toLocaleString("en-IN")} sqft</td>
                          <td style={{ padding: "12px" }}>₹{unit.baseRatePerSqFt.toLocaleString("en-IN")}/sqft</td>
                          <td style={{ padding: "12px", fontWeight: 800 }}>{formatCurrencyINR(unit.totalUnitCost)}</td>
                          <td style={{ padding: "12px", color: "#2563eb", fontWeight: 800 }}>
                            {formatCurrencyINR(unit.calculatedCommission)}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <select
                              value={unit.status}
                              onChange={(e) =>
                                selectedProject && onUpdateProjects(
                                  toggleUnitStatusHelper(
                                    unit.id,
                                    e.target.value,
                                    selectedProject,
                                    projects
                                  )
                                )
                              }
                              style={{
                                background: badge.bg,
                                color: badge.color,
                                border: "1px solid " + badge.border,
                                borderRadius: "8px",
                                padding: "6px 10px",
                                fontWeight: 800,
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              <option value="Available">Available (Green)</option>
                              <option value="Hold">Hold / Blocked (Yellow)</option>
                              <option value="Sold">Sold (Red)</option>
                              <option value="Reserved">Reserved (Blue)</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MEDIA & CAD DRAWING HUB */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "17px", color: "#0f172a" }}>
                  [CAD] Architectural Floor Plans, CAD Drawings and Site Media Hub
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Upload structural drawings, master layout CADs, 3D site elevations, and brochure PDFs for buyers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => (onOpenAddMedia ? onOpenAddMedia() : null)}
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: 0,
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                + Upload CAD / Drawing
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {(selectedProject.mediaDrawings || []).length === 0 ? (
                <div style={{ gridColumn: "1 / -1", padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                  No CAD drawings or floor plan media uploaded yet.
                </div>
              ) : (
                (selectedProject.mediaDrawings || []).map((media) => (
                  <div
                    key={media.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      overflow: "hidden",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        height: "140px",
                        background: "#e2e8f0",
                        position: "relative",
                        backgroundImage: "url(" + media.fileUrl + ")",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          background: "rgba(15,23,42,0.85)",
                          color: "#ffffff",
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        {media.category.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div style={{ padding: "12px" }}>
                      <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>
                        {media.title}
                      </div>
                      {media.description && (
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                          {media.description}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setPreviewMedia(media)}
                        style={{
                          marginTop: "10px",
                          width: "100%",
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          padding: "6px",
                          fontWeight: 700,
                          fontSize: "12px",
                          color: "#0f172a",
                          cursor: "pointer",
                        }}
                      >
                        [VIEW] Inspect Drawing
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </React.Fragment>
      )}

    </div>
  );
}
