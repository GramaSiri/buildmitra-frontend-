import React, { useState } from "react";
import {
  RealEstateProject,
  InventoryUnit,
  MediaDrawing,
} from "../../utils/affiliate/commissionEngine";
import {
  createNewProjectHelper,
  createNewUnitHelper,
  addMediaHelper,
} from "./onboardingHandlers";

interface ModalsProps {
  showAddProjectModal: boolean;
  setShowAddProjectModal: (v: boolean) => void;
  showAddUnitModal: boolean;
  setShowAddUnitModal: (v: boolean) => void;
  showAddMediaModal: boolean;
  setShowAddMediaModal: (v: boolean) => void;
  previewMedia: MediaDrawing | null;
  setPreviewMedia: (v: MediaDrawing | null) => void;
  selectedProject: RealEstateProject | null;
  projects: RealEstateProject[];
  onUpdateProjects: (updated: RealEstateProject[]) => void;
  setSelectedProjectId: (id: string) => void;
}

export default function ProjectOnboardingModals({
  showAddProjectModal,
  setShowAddProjectModal,
  showAddUnitModal,
  setShowAddUnitModal,
  showAddMediaModal,
  setShowAddMediaModal,
  previewMedia,
  setPreviewMedia,
  selectedProject,
  projects,
  onUpdateProjects,
  setSelectedProjectId,
}: ModalsProps) {
  const [newProject, setNewProject] = useState({
    builderName: "",
    builderGstin: "",
    projectCode: "",
    projectName: "",
    location: "",
    city: "Bengaluru",
    pincode: "560001",
    reraNumber: "",
    totalUnits: 20,
    totalAreaSqFt: 50000,
    commissionType: "percentage",
    defaultCommissionValue: 3.5,
    description: "",
    heroImage:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
  });

  const [newUnit, setNewUnit] = useState({
    unitNo: "",
    type: "Plot",
    areaSqFt: 1200,
    dimensions: "30x40 Ft",
    baseRatePerSqFt: 4500,
    negotiatedCommissionType: "percentage",
    negotiatedCommissionValue: 3.5,
    negotiatedMarginDiff: 25000,
    facing: "East",
    status: "Available",
    floor: "",
    notes: "",
  });

  const [newMedia, setNewMedia] = useState({
    title: "",
    category: "cad_floor_plan",
    fileUrl: "",
    fileType: "image/jpeg",
    description: "",
  });

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewProject((prev) => ({ ...prev, heroImage: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewMedia((prev) => ({
            ...prev,
            fileUrl: reader.result as string,
            fileType: file.type || "image/jpeg",
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProject.projectName || !newProject.builderName || !newProject.reraNumber) {
      alert("Please fill in Builder Name, Project Name, and RERA Number!");
      return;
    }
    const { created, updated } = createNewProjectHelper(newProject, projects);
    onUpdateProjects(updated);
    setSelectedProjectId(created.id);
    setShowAddProjectModal(false);
    alert("Project " + created.projectName + " onboarded successfully!");
  }

  function handleCreateUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject || !newUnit.unitNo) {
      alert("Please specify a Unit/Plot Number!");
      return;
    }
    const { createdUnit, updatedProjects } = createNewUnitHelper(
      newUnit,
      selectedProject,
      projects
    );
    onUpdateProjects(updatedProjects);
    setShowAddUnitModal(false);
    alert("Unit " + createdUnit.unitNo + " added to " + selectedProject.projectName + "!");
  }

  function handleAddMedia(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject || !newMedia.title || !newMedia.fileUrl) {
      alert("Please provide media title and file URL!");
      return;
    }
    const { createdMedia, updatedProjects } = addMediaHelper(
      newMedia,
      selectedProject,
      projects
    );
    onUpdateProjects(updatedProjects);
    setShowAddMediaModal(false);
    alert("Architectural Media " + createdMedia.title + " added!");
  }

  return (
    <React.Fragment>
      {/* MODAL: ONBOARD NEW PROJECT */}
      {showAddProjectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <form
            onSubmit={handleCreateProject}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "#0f172a" }}>
              [BUILD] Onboard New Builder and Real Estate Project
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Builder / Developer Name *</label>
                <input
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. BuildMitra Demo Projects"
                  value={newProject.builderName}
                  onChange={(e) => setNewProject({ ...newProject, builderName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Developer GSTIN</label>
                <input
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  value={newProject.builderGstin}
                  onChange={(e) => setNewProject({ ...newProject, builderGstin: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Project Name *</label>
                <input
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. Buildmitra Meadows"
                  value={newProject.projectName}
                  onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Project Code</label>
                <input
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. BM-MEADOWS-01"
                  value={newProject.projectCode}
                  onChange={(e) => setNewProject({ ...newProject, projectCode: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>RERA Registration Number *</label>
                <input
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="PRM/KA/RERA/1251/308/PR/..."
                  value={newProject.reraNumber}
                  onChange={(e) => setNewProject({ ...newProject, reraNumber: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Location and Area</label>
                <input
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="Sarjapur Road, Bengaluru"
                  value={newProject.location}
                  onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Platform Commission Type</label>
                <select
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={newProject.commissionType}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      commissionType: e.target.value,
                    })
                  }
                >
                  <option value="percentage">Percentage (%) of Sale Price</option>
                  <option value="fixed">Fixed Rate (₹) per Unit</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Default Rate / Commission</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={newProject.defaultCommissionValue}
                  onChange={(e) =>
                    setNewProject({ ...newProject, defaultCommissionValue: Number(e.target.value) })
                  }
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Project Description & Highlights</label>
                <textarea
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "60px", fontSize: "12px" }}
                  placeholder="e.g. Premium RERA approved gated community layout with clubhouse & 40ft roads."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: "1 / -1", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>Project Showcase Photo / Image</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "6px", alignItems: "center" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroFileChange}
                    style={{ fontSize: "12px", flex: 1 }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748b" }}>OR Enter URL</span>
                </div>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newProject.heroImage}
                  onChange={(e) => setNewProject({ ...newProject, heroImage: e.target.value })}
                  style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "6px", fontSize: "12px" }}
                />
                {newProject.heroImage && (
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={newProject.heroImage} alt="Preview" style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                    <span style={{ fontSize: "11px", color: "#166534", fontWeight: 700 }}>✓ Image Loaded</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: "#ff7a00",
                  color: "#ffffff",
                  border: 0,
                  borderRadius: "8px",
                  padding: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Onboard Project
              </button>
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                style={{
                  background: "#e2e8f0",
                  border: 0,
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD INVENTORY UNIT */}
      {showAddUnitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <form
            onSubmit={handleCreateUnit}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "#0f172a" }}>
              + Add Inventory Unit to {selectedProject?.projectName}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Unit / Plot No. *</label>
                <input
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="Plot #24 or Flat C-401"
                  value={newUnit.unitNo}
                  onChange={(e) => setNewUnit({ ...newUnit, unitNo: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Category *</label>
                <select
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={newUnit.type}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, type: e.target.value })
                  }
                >
                  <option value="Plot">Plot Layout</option>
                  <option value="1BHK">1BHK Apartment</option>
                  <option value="2BHK">2BHK Apartment</option>
                  <option value="3BHK">3BHK Apartment</option>
                  <option value="4BHK">4BHK Apartment</option>
                  <option value="Villa">Villa / Duplex</option>
                  <option value="Commercial">Commercial Shop</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Area (Sq.Ft) *</label>
                <input
                  type="number"
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={newUnit.areaSqFt}
                  onChange={(e) => setNewUnit({ ...newUnit, areaSqFt: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Base Rate (₹/Sq.Ft) *</label>
                <input
                  type="number"
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={newUnit.baseRatePerSqFt}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, baseRatePerSqFt: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Facing (Vastu)</label>
                <select
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={newUnit.facing}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, facing: e.target.value })
                  }
                >
                  <option value="East">East (Prime Vastu)</option>
                  <option value="North">North (Prime Vastu)</option>
                  <option value="North-East">North-East</option>
                  <option value="West">West</option>
                  <option value="South">South</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Initial Live Status</label>
                <select
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={newUnit.status}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, status: e.target.value })
                  }
                >
                  <option value="Available">Available (Green)</option>
                  <option value="Hold">Hold / Blocked (Yellow)</option>
                  <option value="Sold">Sold (Red)</option>
                  <option value="Reserved">Reserved (Blue)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: "#0f172a",
                  color: "#ffffff",
                  border: 0,
                  borderRadius: "8px",
                  padding: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Save Inventory Unit
              </button>
              <button
                type="button"
                onClick={() => setShowAddUnitModal(false)}
                style={{
                  background: "#e2e8f0",
                  border: 0,
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD MEDIA DRAWING */}
      {showAddMediaModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <form
            onSubmit={handleAddMedia}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "#0f172a" }}>
              [CAD] Upload CAD Floor Plan / Site Media
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Drawing / Media Title *</label>
                <input
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. 3BHK Master Floorplan CAD"
                  value={newMedia.title}
                  onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Category *</label>
                <select
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={newMedia.category}
                  onChange={(e) =>
                    setNewMedia({ ...newMedia, category: e.target.value })
                  }
                >
                  <option value="cad_floor_plan">CAD Floor Plan</option>
                  <option value="site_layout">Master Site Layout</option>
                  <option value="elevation_3d">3D Elevation View</option>
                  <option value="brochure_pdf">Brochure PDF Document</option>
                </select>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>CAD / Drawing File Upload *</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "6px", alignItems: "center" }}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleMediaFileChange}
                    style={{ fontSize: "12px", flex: 1 }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748b" }}>OR Enter URL</span>
                </div>
                <input
                  required
                  type="text"
                  placeholder="https://..."
                  value={newMedia.fileUrl}
                  onChange={(e) => setNewMedia({ ...newMedia, fileUrl: e.target.value })}
                  style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "6px", fontSize: "12px" }}
                />
                {newMedia.fileUrl && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#166534", fontWeight: 700 }}>
                    ✓ Drawing file ready ({newMedia.fileType || "URL"})
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Description</label>
                <input
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="Structural specifications and room orientation details"
                  value={newMedia.description}
                  onChange={(e) => setNewMedia({ ...newMedia, description: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: "#2563eb",
                  color: "#ffffff",
                  border: 0,
                  borderRadius: "8px",
                  padding: "10px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Upload Drawing
              </button>
              <button
                type="button"
                onClick={() => setShowAddMediaModal(false)}
                style={{
                  background: "#e2e8f0",
                  border: 0,
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: PREVIEW DRAWING */}
      {previewMedia && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(4px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "20px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                [CAD] {previewMedia.title}
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                style={{ background: "#ef4444", color: "#fff", border: 0, borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}
              >
                X Close
              </button>
            </div>

            <img
              src={previewMedia.fileUrl}
              alt={previewMedia.title}
              style={{ width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0" }}
            />
            {previewMedia.description && (
              <p style={{ marginTop: "12px", color: "#475569", fontSize: "13px" }}>
                {previewMedia.description}
              </p>
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
