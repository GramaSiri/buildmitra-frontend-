import React, { useState, useMemo } from "react";
import { FloorPlanRequirement } from "../../data/preFloorPlanLibrary";
import { generateRecommendedOptions } from "../../utils/floorPlans/templateSelector";
import { FloorPlanOptionCard } from "./FloorPlanOptionCard";
import { FloorPlanViewer } from "./FloorPlanViewer";
import { FloorPlanModel } from "../../utils/floorPlans/types";
import { ProfessionalBatchPreview } from "./ProfessionalBatchPreview";
import { findProfessionalBatch } from "../../data/professionalFloorPlanBatches";
import { ProfessionalReferencePlanViewer } from "./ProfessionalReferencePlanViewer";
import { findProfessionalReferencePlan } from "../../data/professionalFloorPlanLibrary";

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
  // BUILDMITRA_PRO_BATCH_LIBRARY_20260820
  const professionalBatch = useMemo(
    () =>
      findProfessionalBatch(
        requirement.plotWidth,
        requirement.plotLength,
        requirement.buildingType
      ),
    [
      requirement.plotWidth,
      requirement.plotLength,
      requirement.buildingType
    ]
  );
  // BUILDMITRA_PRO_REFERENCE_LIBRARY_20260820
  const professionalReference = useMemo(
    () =>
      findProfessionalReferencePlan(
        requirement.plotWidth,
        requirement.plotLength,
        requirement.facing,
        requirement.floors
      ),
    [
      requirement.plotWidth,
      requirement.plotLength,
      requirement.facing,
      requirement.floors
    ]
  );

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* BUILDMITRA_ALL_BATCHES_VISIBLE_20260820 */}

      {professionalBatch && (

        <div
          style={{
            background: "#ffffff",
            border: "2px solid #0f766e",
            borderRadius: "12px",
            padding: "12px"
          }}
        >

          <div
            style={{
              marginBottom: 10
            }}
          >

            <div
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: "#134e4a"
              }}
            >
              PROFESSIONAL FLOOR PLAN LIBRARY MATCH
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#475569",
                marginTop: 3
              }}
            >
              Closest BuildMitra professional batch selected from
              plot size and house type.
            </div>

          </div>

          <ProfessionalBatchPreview
            batch={professionalBatch}
          />

        </div>

      )}

      {/* BUILDMITRA_PRO_REFERENCE_VISIBLE_20260820 */}

      {professionalReference && (

        <div
          style={{
            background: "#ffffff",
            border: "2px solid #2563eb",
            borderRadius: "12px",
            padding: "12px"
          }}
        >

          <div
            style={{
              marginBottom: "10px"
            }}
          >

            <div
              style={{
                fontSize: "15px",
                fontWeight: 900,
                color: "#0f172a"
              }}
            >
              MATCHED PROFESSIONAL FLOOR PLAN
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#475569",
                marginTop: "3px"
              }}
            >
              Selected from BuildMitra professional reference library
              using plot size, facing and floor requirement.
            </div>

          </div>

          <ProfessionalReferencePlanViewer
            plan={professionalReference}
          />

        </div>

      )}

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


