import React, { useMemo } from "react";
import type {
  Facing,
  FloorPlanRequirement,
  FloorPlanTemplate,
} from "../data/preFloorPlanLibrary";
import { solveParametricFloorPlan } from "../utils/floorPlans/parametricAdapter";
import { ProfessionalFloorPlanRenderer } from "../utils/floorPlans/professionalRenderer";

type Props = {
  template: FloorPlanTemplate;
  requirement: FloorPlanRequirement;
  floor: number;
  compact?: boolean;
};

/**
 * REPLACEMENT PreFloorPlanSvg COMPONENT (RULE 9 ENFORCEMENT)
 * DOES NOT call generateVastuFloorPlan inside render.
 * Delegates layout solving to solveParametricFloorPlan and renders through ProfessionalFloorPlanRenderer.
 */
export default function PreFloorPlanSvg({
  template,
  requirement,
  floor,
  compact = false,
}: Props) {
  const solvedModel = useMemo(() => {
    return solveParametricFloorPlan(requirement, "OPTION_A_VASTU", template?.id);
  }, [requirement, template]);

  return (
    <ProfessionalFloorPlanRenderer
      model={solvedModel}
      activeLevel={floor}
      compact={compact}
    />
  );
}
