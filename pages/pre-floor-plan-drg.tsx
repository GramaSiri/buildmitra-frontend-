import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import {
  FloorPlanRequirement,
  Facing,
  BuildingType,
  Parking,
} from "../data/preFloorPlanLibrary";
import { FloorPlanTemplateStudio } from "../components/floorPlans/FloorPlanTemplateStudio";

const defaultRequirement: FloorPlanRequirement = {
  plotWidth: 30,
  plotLength: 40,
  facing: "South",
  floors: 2,
  bedrooms: 3,
  toilets: 3,
  buildingType: "Duplex",
  parking: "Half Parking",
  lift: true,
  vaastu: true,
  pooja: true,
  utility: true,
  balcony: true,
};

const controlStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 38,
  padding: "8px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  background: "#ffffff",
  color: "#111827",
  fontWeight: 700,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 5,
  fontSize: 11,
  fontWeight: 900,
  color: "#1f2937",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function CheckRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, color: "#172033", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export default function PreFloorPlanDrgPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<FloorPlanRequirement>(defaultRequirement);
  const [requirement, setRequirement] = useState<FloorPlanRequirement>(defaultRequirement);

  const handleApplyRequirements = () => {
    setRequirement(draft);
  };

  const handlePresetSelect = (preset: Partial<FloorPlanRequirement>) => {
    const updated = { ...draft, ...preset };
    setDraft(updated);
    setRequirement(updated);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      {/* HEADER BAR */}
      <header style={{ background: "#0f172a", color: "#ffffff", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 900 }}>BUILDMITRA — PRE FLOOR PLAN DRG RECOMMENDATION ENGINE</h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
            Preloaded Architectural Plan Library + 10-Priority Template Matching & Parametric Adaptation
          </p>
        </div>
        <button
          onClick={() => router.push("/drg")}
          style={{ padding: "8px 16px", background: "#0284c7", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: 800, cursor: "pointer" }}
        >
          GO TO WORKING CAD DRAWINGS →
        </button>
      </header>

      {/* MAIN LAYOUT CONTAINER */}
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px" }}>
        {/* SIDEBAR FORM (USER PARAMETERS) */}
        <aside style={{ background: "#ffffff", borderRadius: "10px", padding: "20px", border: "1px solid #cbd5e1", height: "fit-content" }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: 900, color: "#0f172a", borderBottom: "2px solid #0284c7", paddingBottom: "8px" }}>
            1. USER PARAMETERS
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* PRESET TEST CASES */}
            <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", marginBottom: "6px", display: "block" }}>
                ⚡ QUICK PRESET TEST CASES:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <button onClick={() => handlePresetSelect({ plotWidth: 20, plotLength: 30, facing: "North", bedrooms: 2, floors: 2 })} style={{ fontSize: "10px", padding: "4px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}>20x30 North 2BHK</button>
                <button onClick={() => handlePresetSelect({ plotWidth: 30, plotLength: 40, facing: "South", bedrooms: 3, floors: 2, lift: true })} style={{ fontSize: "10px", padding: "4px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}>30x40 South 3BHK</button>
                <button onClick={() => handlePresetSelect({ plotWidth: 30, plotLength: 50, facing: "East", bedrooms: 3, floors: 2 })} style={{ fontSize: "10px", padding: "4px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}>30x50 East 3BHK</button>
                <button onClick={() => handlePresetSelect({ plotWidth: 40, plotLength: 60, facing: "East", bedrooms: 4, floors: 3, lift: true })} style={{ fontSize: "10px", padding: "4px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}>40x60 East 4BHK</button>
                <button onClick={() => handlePresetSelect({ plotWidth: 50, plotLength: 80, facing: "North", bedrooms: 5, floors: 3, lift: true })} style={{ fontSize: "10px", padding: "4px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}>50x80 North Villa</button>
                <button onClick={() => handlePresetSelect({ plotWidth: 32, plotLength: 45, facing: "South", bedrooms: 3, floors: 2 })} style={{ fontSize: "10px", padding: "4px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}>32x45 Custom Size</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <Field label="Plot Width (Ft)">
                <input type="number" style={controlStyle} value={draft.plotWidth} onChange={(e) => setDraft({ ...draft, plotWidth: Number(e.target.value) })} />
              </Field>
              <Field label="Plot Length (Ft)">
                <input type="number" style={controlStyle} value={draft.plotLength} onChange={(e) => setDraft({ ...draft, plotLength: Number(e.target.value) })} />
              </Field>
            </div>

            <Field label="Road Facing Direction">
              <select style={controlStyle} value={draft.facing} onChange={(e) => setDraft({ ...draft, facing: e.target.value as Facing })}>
                <option value="South">South Facing</option>
                <option value="East">East Facing</option>
                <option value="North">North Facing</option>
                <option value="West">West Facing</option>
              </select>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <Field label="Number of Floors">
                <select style={controlStyle} value={draft.floors} onChange={(e) => setDraft({ ...draft, floors: Number(e.target.value) })}>
                  <option value={1}>Ground Only (1 Floor)</option>
                  <option value={2}>G + 1 (2 Floors)</option>
                  <option value={3}>G + 2 (3 Floors)</option>
                  <option value={4}>G + 3 (4 Floors)</option>
                </select>
              </Field>
              <Field label="Bedrooms (BHK)">
                <input type="number" style={controlStyle} value={draft.bedrooms} onChange={(e) => setDraft({ ...draft, bedrooms: Number(e.target.value) })} />
              </Field>
            </div>

            <Field label="Building Type">
              <select style={controlStyle} value={draft.buildingType} onChange={(e) => setDraft({ ...draft, buildingType: e.target.value as BuildingType })}>
                <option value="Duplex">Duplex Residence</option>
                <option value="Own Use">Independent House</option>
                <option value="Rental Use">Rental Building</option>
                <option value="Multi-unit">Multi-Unit Apartments</option>
              </select>
            </Field>

            <Field label="Ground Floor Parking Mode">
              <select style={controlStyle} value={draft.parking} onChange={(e) => setDraft({ ...draft, parking: e.target.value as Parking })}>
                <option value="Half Parking">Half Parking + Residential</option>
                <option value="Full Parking">Full Parking (Stilt)</option>
                <option value="No Parking">No Parking (Nil)</option>
              </select>
            </Field>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <CheckRow label="Elevator / Lift Required" checked={draft.lift} onChange={(c) => setDraft({ ...draft, lift: c })} />
              <CheckRow label="Strict Vastu Compliance" checked={draft.vaastu} onChange={(c) => setDraft({ ...draft, vaastu: c })} />
              <CheckRow label="Dedicated Pooja Room" checked={draft.pooja} onChange={(c) => setDraft({ ...draft, pooja: c })} />
              <CheckRow label="Kitchen Utility Balcony" checked={draft.utility} onChange={(c) => setDraft({ ...draft, utility: c })} />
              <CheckRow label="Front Sit-Out Balcony" checked={draft.balcony} onChange={(c) => setDraft({ ...draft, balcony: c })} />
            </div>

            <button
              onClick={handleApplyRequirements}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0f172a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: 900,
                fontSize: "12px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              SEARCH & MATCH LIBRARY PLANS →
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA (FLOOR PLAN TEMPLATE STUDIO) */}
        <main>
          <FloorPlanTemplateStudio requirement={requirement} onUpdateRequirement={setRequirement} />
        </main>
      </div>
    </div>
  );
}
