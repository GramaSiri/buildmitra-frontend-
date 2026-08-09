import React from "react";
import { FloorPlanModel } from "../../utils/floorPlans/types";
import { MatchMetadata } from "../../utils/floorPlans/templateSelector";
import { ProfessionalFloorPlanRenderer } from "../../utils/floorPlans/professionalRenderer";

type OptionCardProps = {
  model: FloorPlanModel & { matchMetadata?: MatchMetadata };
  isSelected: boolean;
  onSelect: () => void;
};

export const FloorPlanOptionCard: React.FC<OptionCardProps> = ({
  model,
  isSelected,
  onSelect,
}) => {
  const meta = model.matchMetadata;
  const isVastu = model.optionType === "OPTION_A_VASTU";
  const badgeColor = isVastu ? "#16a34a" : model.optionType === "OPTION_B_SPACE" ? "#2563eb" : "#7c3aed";

  return (
    <div
      onClick={onSelect}
      style={{
        border: isSelected ? `2px solid ${badgeColor}` : "1px solid #cbd5e1",
        borderRadius: "10px",
        padding: "16px",
        background: isSelected ? "#f0f9ff" : "#ffffff",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        boxShadow: isSelected ? "0 4px 20px rgba(2,132,199,0.18)" : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span
          style={{
            background: badgeColor,
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: 800,
            padding: "4px 8px",
            borderRadius: "4px",
            textTransform: "uppercase",
          }}
        >
          {model.optionType.replace(/_/g, " ")}
        </span>
        {meta && (
          <span
            style={{
              background: meta.matchType === "Exact Match" ? "#dcfce7" : "#e0f2fe",
              color: meta.matchType === "Exact Match" ? "#15803d" : "#0369a1",
              fontSize: "10px",
              fontWeight: 800,
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {meta.matchType} ({meta.compatibilityScore}%)
          </span>
        )}
      </div>

      <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
        {model.optionTitle}
      </h4>

      {meta && (
        <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#475569", marginBottom: "10px" }}>
          <div><strong>Template Size:</strong> {meta.originalPlotSize}</div>
          <div><strong>Adaptation:</strong> {meta.adaptationScore}%</div>
          <div><strong>Vastu:</strong> {meta.vastuScore}/100</div>
        </div>
      )}

      {/* MINI SVG PREVIEW */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden", marginBottom: "12px" }}>
        <ProfessionalFloorPlanRenderer model={model} activeLevel={0} compact={true} />
      </div>

      <button
        style={{
          width: "100%",
          padding: "9px",
          border: "none",
          borderRadius: "6px",
          background: isSelected ? badgeColor : "#0f172a",
          color: "#ffffff",
          fontWeight: 800,
          fontSize: "11px",
          cursor: "pointer",
        }}
      >
        {isSelected ? "✓ SELECTED PLAN" : "SELECT THIS ARCHITECTURAL PLAN"}
      </button>
    </div>
  );
};
