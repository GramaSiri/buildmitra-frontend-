import React, { useState, useMemo } from "react";
import { FloorPlanRequirement } from "../../data/preFloorPlanLibrary";
import { generateRecommendedOptions } from "../../utils/floorPlans/templateSelector";
import { FloorPlanOptionCard } from "./FloorPlanOptionCard";
import { FloorPlanViewer } from "./FloorPlanViewer";
import { FloorPlanModel } from "../../utils/floorPlans/types";

type StudioProps = {
  requirement: FloorPlanRequirement;
  onUpdateRequirement: (req: FloorPlanRequirement) => void;
};

export const FloorPlanTemplateStudio: React.FC<StudioProps> = ({
  requirement,
  onUpdateRequirement,
}) => {
  const optionsBundle = useMemo(() => {
    return generateRecommendedOptions(requirement);
  }, [requirement]);

  const [selectedOption, setSelectedOption] = useState<FloorPlanModel>(optionsBundle.optionA);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 3 RECOMMENDED OPTIONS CARDS GRID */}
      <div>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
          RECOMMENDED ARCHITECTURAL OPTIONS (SELECT YOUR PREFERRED TOPOLOGY)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <FloorPlanOptionCard
            model={optionsBundle.optionA}
            isSelected={selectedOption.optionType === "OPTION_A_VASTU"}
            onSelect={() => setSelectedOption(optionsBundle.optionA)}
          />
          <FloorPlanOptionCard
            model={optionsBundle.optionB}
            isSelected={selectedOption.optionType === "OPTION_B_SPACE"}
            onSelect={() => setSelectedOption(optionsBundle.optionB)}
          />
          <FloorPlanOptionCard
            model={optionsBundle.optionC}
            isSelected={selectedOption.optionType === "OPTION_C_PREMIUM"}
            onSelect={() => setSelectedOption(optionsBundle.optionC)}
          />
        </div>
      </div>

      {/* SELECTED OPTION MULTI-FLOOR VIEWER */}
      <div>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
          DETAILED WORKING FLOOR PLAN BLUEPRINT ({selectedOption.optionTitle})
        </h3>
        <FloorPlanViewer model={selectedOption} />
      </div>
    </div>
  );
};
