// BUILDMITRA DRG ENGINE — PHASE 1 DEMONSTRATION & TESTING PAGE (ISOLATED AT /drg-phase1-demo)
// DEMONSTRATES RESPONSIVE UI, CASE A/B/C DATA, VALIDATION, PROJECT HEADER & CONFIRMED VERSIONED SNAPSHOT SAVER

import React, { useState, useMemo } from "react";
import Head from "next/head";
import Sidebar from "../components/Sidebar";
import ProjectInfoHeader from "../components/drg/ProjectInfoHeader";
import Phase1RequirementForm from "../components/drg/Phase1RequirementForm";
import RequirementSummaryView from "../components/drg/RequirementSummaryView";
import {
  ProjectRequirementModel,
  createDefaultProjectRequirementModel,
} from "../utils/drg/projectRequirementModel";
import {
  TEST_CASE_A_MODEL,
  TEST_CASE_B_MODEL,
  TEST_CASE_C_MODEL,
} from "../utils/drg/drgPhase1TestCases";
import { validateProjectRequirementModel } from "../utils/drg/requirementValidator";

export default function DrgPhase1Demo() {
  const [model, setModel] = useState<ProjectRequirementModel>(createDefaultProjectRequirementModel());
  const [viewMode, setViewMode] = useState<"form" | "summary" | "json">("form");
  const [viewportWidth, setViewportWidth] = useState<"100%" | "768px" | "375px">("100%");
  const [savedSnapshots, setSavedSnapshots] = useState<{ version: string; timestamp: string; data: ProjectRequirementModel }[]>([]);

  // Real-time Data Validation
  const validation = useMemo(() => validateProjectRequirementModel(model), [model]);

  // Handle Preset Loading from isolated drgPhase1TestCases.ts
  const loadPreset = (presetModel: ProjectRequirementModel) => {
    setModel({
      ...presetModel,
      isConfirmed: false,
      status: "draft",
      requirementVersion: "1.0.0",
      updatedAt: new Date().toISOString(),
    });
  };

  // Handle Snapshot Confirmation & Saving (Item #3 Rule)
  const handleConfirmAndSaveSnapshot = () => {
    const nextVer = `1.0.${savedSnapshots.length}`;
    const isoTimestamp = new Date().toISOString();
    const confirmedModel: ProjectRequirementModel = {
      ...model,
      version: nextVer,
      requirementVersion: nextVer,
      status: "confirmed",
      confirmedAt: isoTimestamp,
      confirmedBy: `${model.project.clientName || "CLIENT"}_${model.project.pinCode || "560001"}`,
      isConfirmed: true,
      updatedAt: isoTimestamp,
    };

    setModel(confirmedModel);
    setViewMode("json");
    setSavedSnapshots((prev) => [{ version: nextVer, timestamp: new Date().toLocaleString("en-IN"), data: confirmedModel }, ...prev]);
    alert(`✅ Requirement Snapshot v${nextVer} successfully confirmed & saved as Single Source of Truth for Phase 2!\nStatus: CONFIRMED | ConfirmedAt: ${isoTimestamp}`);
  };

  return (
    <>
      <Head>
        <title>BuildMitra DRG — Phase 1 Dynamic Requirement Model</title>
        <meta name="description" content="BuildMitra DRG Engine Phase 1: Dynamic user input, project requirement model, validation engine, and live top project header." />
      </Head>

      <Sidebar currentPath="/drg">
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px", color: "#1e293b", fontFamily: "system-ui, -apple-system, sans-serif" }}>
          
          {/* RESPONSIVE VIEWPORT PREVIEW CONTROLS (DESKTOP, TABLET, MOBILE) */}
          <div style={{ background: "#0f172a", color: "#f8fafc", padding: "10px 16px", borderRadius: "10px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: "bold" }}>
              📱 Responsive Viewport Simulation: <span style={{ color: "#38bdf8" }}>{viewportWidth === "100%" ? "Desktop (Full Width)" : viewportWidth === "768px" ? "Tablet (768px)" : "Mobile (375px)"}</span>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setViewportWidth("100%")}
                style={{ padding: "4px 10px", background: viewportWidth === "100%" ? "#0284c7" : "#334155", color: "#fff", border: 0, borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
              >
                🖥️ Desktop
              </button>
              <button
                onClick={() => setViewportWidth("768px")}
                style={{ padding: "4px 10px", background: viewportWidth === "768px" ? "#0284c7" : "#334155", color: "#fff", border: 0, borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
              >
                📱 Tablet (768px)
              </button>
              <button
                onClick={() => setViewportWidth("375px")}
                style={{ padding: "4px 10px", background: viewportWidth === "375px" ? "#0284c7" : "#334155", color: "#fff", border: 0, borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
              >
                📲 Mobile (375px)
              </button>
            </div>
          </div>

          <div style={{ maxWidth: viewportWidth, margin: "0 auto", transition: "all 0.3s ease" }}>
            
            {/* 1. MANDATORY TOP-OF-OUTPUT PROJECT INFORMATION HEADER */}
            <ProjectInfoHeader model={model} />

            {/* 2. PRESET TEST CASE SELECTOR BANNER */}
            <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "14px", border: "1px solid #cbd5e1", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#0f172a" }}>
                  🧪 Phase 1 Benchmark Test Cases (utils/drg/drgPhase1TestCases.ts)
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Load benchmark test cases isolated from production defaults:
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => loadPreset(TEST_CASE_A_MODEL)}
                  style={{ padding: "8px 14px", background: "#f0f9ff", border: "1px solid #0284c7", color: "#0369a1", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                >
                  🏠 Case A: 30x40 South G+2 Duplex
                </button>

                <button
                  onClick={() => loadPreset(TEST_CASE_B_MODEL)}
                  style={{ padding: "8px 14px", background: "#fff7ed", border: "1px solid #ff7a00", color: "#c2410c", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                >
                  🏢 Case B: 40x60 East Multi-Unit (Blank SBC Alert)
                </button>

                <button
                  onClick={() => loadPreset(TEST_CASE_C_MODEL)}
                  style={{ padding: "8px 14px", background: "#f0fdf4", border: "1px solid #16a34a", color: "#15803d", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                >
                  🏰 Case C: 60x80 North G+3 Villa
                </button>
              </div>
            </div>

            {/* 3. VIEW MODE TAB BAR */}
            <div style={{ background: "#ffffff", padding: "6px", borderRadius: "12px", border: "1px solid #cbd5e1", marginBottom: "20px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                onClick={() => setViewMode("form")}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: 0,
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: viewMode === "form" ? "#ff7a00" : "transparent",
                  color: viewMode === "form" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                📝 Requirement Input Form (Sections A to P)
              </button>

              <button
                onClick={() => setViewMode("summary")}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: 0,
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: viewMode === "summary" ? "#ff7a00" : "transparent",
                  color: viewMode === "summary" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                📋 Requirement Summary &amp; Snapshot Audit
              </button>

              <button
                onClick={() => setViewMode("json")}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: 0,
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: viewMode === "json" ? "#0f172a" : "transparent",
                  color: viewMode === "json" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                🔍 Live Confirmed Snapshot JSON Inspector
              </button>
            </div>

            {/* 4. CONTENT RENDERING BASED ON VIEW MODE */}
            {viewMode === "form" && (
              <Phase1RequirementForm model={model} onChange={setModel} />
            )}

            {viewMode === "summary" && (
              <RequirementSummaryView
                model={model}
                validation={validation}
                onEdit={() => setViewMode("form")}
                onConfirm={handleConfirmAndSaveSnapshot}
              />
            )}

            {viewMode === "json" && (
              <div style={{ background: "#0f172a", color: "#38bdf8", padding: "24px", borderRadius: "16px", border: "1px solid #334155", overflowX: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "bold", color: "#f8fafc" }}>
                    Normalized ProjectRequirementModel JSON Object (Single Source of Truth)
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    ReqVersion: <b>{model.requirementVersion || "1.0.0"}</b> | Status: <b style={{ color: model.status === "confirmed" ? "#4ade80" : "#facc15" }}>{model.status.toUpperCase()}</b> | ConfirmedAt: <b>{model.confirmedAt || "N/A"}</b>
                  </span>
                </div>
                <pre style={{ margin: 0, fontSize: "12px", fontFamily: "monospace", lineHeight: "1.4" }}>
                  {JSON.stringify(model, null, 2)}
                </pre>
              </div>
            )}

            {/* 5. SAVED VERSIONED SNAPSHOTS HISTORY */}
            {savedSnapshots.length > 0 && (
              <div style={{ marginTop: "30px", background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #cbd5e1" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>
                  📚 Confirmed Requirement Snapshots History (Single Source of Truth)
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {savedSnapshots.map((snap, sIdx) => (
                    <div key={sIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}>
                      <div>
                        <span style={{ fontWeight: "900", color: "#16a34a", marginRight: "8px" }}>v{snap.version}</span>
                        <span>{snap.data.project.projectName} ({snap.data.plot.plotWidth}&apos;×{snap.data.plot.plotLength}&apos;, {snap.data.project.projectType})</span>
                        <span style={{ marginLeft: "10px", fontSize: "11px", color: "#0369a1", fontWeight: "bold" }}>[Status: {snap.data.status}]</span>
                      </div>
                      <div style={{ color: "#64748b", fontSize: "11px" }}>Confirmed: {snap.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </Sidebar>
    </>
  );
}
