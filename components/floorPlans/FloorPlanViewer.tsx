import React, { useState } from "react";
import { FloorPlanModel } from "../../utils/floorPlans/types";
import { ProfessionalFloorPlanRenderer } from "../../utils/floorPlans/professionalRenderer";

type ViewerProps = {
  model: FloorPlanModel;
};

export const FloorPlanViewer: React.FC<ViewerProps> = ({ model }) => {
  const [activeLevel, setActiveLevel] = useState<number>(0);

  return (
    <div style={{ background: "#ffffff", borderRadius: "10px", padding: "18px", border: "1px solid #e2e8f0" }}>
      {/* DYNAMIC FLOOR LEVEL TABS CONTROLLED BY USER FLOORS COUNT */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
        {model.floors.map((fl) => (
          <button
            key={fl.level}
            onClick={() => setActiveLevel(fl.level)}
            style={{
              padding: "8px 16px",
              border: activeLevel === fl.level ? "2px solid #0284c7" : "1px solid #cbd5e1",
              background: activeLevel === fl.level ? "#e0f2fe" : "#ffffff",
              color: activeLevel === fl.level ? "#0369a1" : "#334155",
              fontWeight: 800,
              fontSize: "12px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {fl.name}
          </button>
        ))}
      </div>

      {/* ARCHITECTURAL CAD VECTOR SVG RENDERER */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <ProfessionalFloorPlanRenderer model={model} activeLevel={activeLevel} compact={false} />
      </div>

      {/* DETAILED AREA SCHEDULE & TECHNICAL INFORMATION */}
      <div style={{ marginTop: "18px", padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <h5 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
          TECHNICAL PARAMETERS & AREA SCHEDULE
        </h5>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "11px", color: "#334155" }}>
          <div><strong>Plot Width:</strong> {model.plot.width}′</div>
          <div><strong>Plot Length:</strong> {model.plot.length}′</div>
          <div><strong>Total Plot Area:</strong> {model.plot.areaSqFt} Sq.Ft</div>
          <div><strong>Road Facing:</strong> {model.plot.facing} ({model.plot.roadWidth} Ft Road)</div>
          <div><strong>Vastu Score:</strong> {model.validation.vastuScore}/100</div>
          <div><strong>Validation Status:</strong> <span style={{ color: "#16a34a", fontWeight: "bold" }}>{model.validation.status}</span></div>
        </div>
      </div>
    </div>
  );
};
