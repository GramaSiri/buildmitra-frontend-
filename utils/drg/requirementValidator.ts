// BUILDMITRA DRG ENGINE — PHASE 1 DATA VALIDATION ENGINE
// VALIDATES PROJECT REQUIREMENT MODEL WITHOUT SILENT FALLBACKS

import { ProjectRequirementModel } from "./projectRequirementModel";

export interface ValidationIssue {
  type: "error" | "warning" | "info";
  section: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  hasWarnings: boolean;
  issues: ValidationIssue[];
}

export function validateProjectRequirementModel(model: ProjectRequirementModel): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. SECTION A: PROJECT DETAILS VALIDATION
  if (!model.project.projectName.trim()) {
    issues.push({ type: "error", section: "Project Details", field: "projectName", message: "Project Name is required." });
  }
  if (!model.project.clientName.trim()) {
    issues.push({ type: "error", section: "Project Details", field: "clientName", message: "Client Name is required." });
  }
  if (!model.project.city.trim()) {
    issues.push({ type: "error", section: "Project Details", field: "city", message: "City is required." });
  }

  // 2. SECTION B: PLOT DETAILS VALIDATION
  if (model.plot.plotWidth <= 0) {
    issues.push({ type: "error", section: "Plot Details", field: "plotWidth", message: "Plot Width must be greater than 0." });
  }
  if (model.plot.plotLength <= 0) {
    issues.push({ type: "error", section: "Plot Details", field: "plotLength", message: "Plot Length must be greater than 0." });
  }
  if (model.plot.roadWidthFt <= 0) {
    issues.push({ type: "error", section: "Plot Details", field: "roadWidthFt", message: "Road Width must be greater than 0 ft." });
  }
  if (model.plot.isCornerPlot) {
    if (!model.plot.secondRoadSide) {
      issues.push({ type: "error", section: "Plot Details", field: "secondRoadSide", message: "Corner plot requires Second Road Facing direction." });
    }
    if (!model.plot.secondRoadWidthFt || model.plot.secondRoadWidthFt <= 0) {
      issues.push({ type: "error", section: "Plot Details", field: "secondRoadWidthFt", message: "Corner plot requires valid Second Road Width." });
    }
  }

  // 3. SECTION C: SITE / SOIL INFORMATION & SBC WARNING (CRITICAL REQUIREMENT)
  if (!model.siteSoil.isSoilTestAvailable || !model.siteSoil.sbcKpa || model.siteSoil.sbcKpa <= 0) {
    issues.push({
      type: "warning",
      section: "Site & Soil Information",
      field: "sbcKpa",
      message: "SOIL TEST / SBC REQUIRED FOR FINAL FOUNDATION DESIGN",
    });
  }

  // 4. SECTION D: SETBACKS VALIDATION
  const s = model.setbacks.finalAcceptedSetback;
  if (s.front < 0 || s.rear < 0 || s.left < 0 || s.right < 0) {
    issues.push({ type: "error", section: "Setbacks", field: "finalAcceptedSetback", message: "Setback values cannot be negative." });
  }
  if (s.front + s.rear >= model.plot.plotLength) {
    issues.push({ type: "error", section: "Setbacks", field: "setbacksLength", message: "Sum of Front + Rear setbacks exceeds total plot length." });
  }
  if (s.left + s.right >= model.plot.plotWidth) {
    issues.push({ type: "error", section: "Setbacks", field: "setbacksWidth", message: "Sum of Left + Right setbacks exceeds total plot width." });
  }

  // 5. SECTION E & F: BUILDING & FLOOR-WISE VALIDATION
  if (model.building.numberOfFloors <= 0) {
    issues.push({ type: "error", section: "Building Config", field: "numberOfFloors", message: "Number of floors must be at least 1." });
  }
  if (model.floors.length !== model.building.numberOfFloors) {
    issues.push({
      type: "error",
      section: "Building Config",
      field: "floorsMismatch",
      message: `Floor requirements count (${model.floors.length}) does not match configured floor count (${model.building.numberOfFloors}).`,
    });
  }

  // Check each floor's requirements
  model.floors.forEach((f, idx) => {
    const isParkingFloor = f.parking.parkingMode === "Full Parking" || f.parking.parkingMode === "Half Parking";
    const totalRooms =
      f.rooms.livingRoomCount +
      f.rooms.diningCount +
      f.rooms.kitchenCount +
      f.rooms.masterBedrooms +
      f.rooms.otherBedrooms +
      f.rooms.guestBedrooms +
      f.rooms.childrenBedrooms +
      f.rooms.customRooms.length;

    if (!isParkingFloor && totalRooms === 0) {
      issues.push({
        type: "warning",
        section: "Floor Requirements",
        field: `floor_${idx}`,
        message: `${f.floorLabel} has no parking and no rooms specified. Please add room requirements.`,
      });
    }
  });

  // 6. SECTION I: DUPLEX / TRIPLEX CONSISTENCY
  if (model.duplexTriplex.isDuplex && model.duplexTriplex.duplexFloors.length < 2) {
    issues.push({
      type: "error",
      section: "Duplex / Triplex",
      field: "duplexFloors",
      message: "Duplex configuration must select at least 2 connected floors.",
    });
  }
  if (model.duplexTriplex.isTriplex && model.duplexTriplex.triplexFloors.length < 3) {
    issues.push({
      type: "error",
      section: "Duplex / Triplex",
      field: "triplexFloors",
      message: "Triplex configuration must select at least 3 connected floors.",
    });
  }

  // 7. SECTION J & K: VERTICAL CIRCULATION VALIDATION
  if (!model.verticalCirculation.staircase.required) {
    issues.push({
      type: "warning",
      section: "Vertical Circulation",
      field: "staircase",
      message: "No staircase specified. Building must have at least one vertical staircase for emergency egress.",
    });
  }
  if (model.building.numberOfFloors > 4 && !model.verticalCirculation.lift.required) {
    issues.push({
      type: "warning",
      section: "Vertical Circulation",
      field: "lift",
      message: "Building has 5+ floors. Provisioning a passenger lift is strongly recommended by Indian National Building Code (NBC).",
    });
  }

  // 8. SECTION L: WATER & SERVICES
  if (model.waterServices.ugWaterSumpRequired && model.waterServices.ugWaterSumpCapacityLiters <= 0) {
    issues.push({
      type: "error",
      section: "Water & Site Services",
      field: "ugWaterSumpCapacityLiters",
      message: "UG Water Sump capacity must be greater than 0 Liters.",
    });
  }

  const hasErrors = issues.some((i) => i.type === "error");
  const hasWarnings = issues.some((i) => i.type === "warning");

  return {
    isValid: !hasErrors,
    hasWarnings,
    issues,
  };
}
