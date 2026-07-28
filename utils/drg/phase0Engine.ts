import {
  DRGInputs,
  Phase0AnalysisReport,
  ProjectDesignBrief,
  DynamicDesignObjective,
  StructuralPlanningRecommendations,
} from "./types";

/**
 * BuildMitra DRG — Plot Analysis Engine (Phase 0 Final Refinement)
 * Pure Analysis Module: Analyzes project parameters, statutory regulations, solar/wind climate vectors,
 * and site constraints to generate the mandatory Project Design Brief, Dynamic Design Objectives,
 * and Recommendations for Structural Planning.
 * Does NOT generate floor layouts, rooms, structural grid, columns, beams, or floor room distributions.
 */
export function analyzePlotPhase0(inputs: DRGInputs): Phase0AnalysisReport {
  const plotW = Math.max(10, inputs.plotWidth || 30);
  const plotL = Math.max(10, inputs.plotLength || 40);
  const plotAreaSqFt = plotW * plotL;

  const sFront = inputs.setbacks?.front || 0;
  const sRear = inputs.setbacks?.rear || 0;
  const sLeft = inputs.setbacks?.left || 0;
  const sRight = inputs.setbacks?.right || 0;

  const buildW = Math.max(0, plotW - sLeft - sRight);
  const buildL = Math.max(0, plotL - sFront - sRear);
  const buildableFootprintSqFt = buildW * buildL;

  const coverageCapPercent = inputs.maxCoveragePercent || 75;
  const maxCoverageAreaSqFt = Math.round(plotAreaSqFt * (coverageCapPercent / 100));
  const maxPermittedFootprintSqFt = Math.min(buildableFootprintSqFt, maxCoverageAreaSqFt);

  const farLimit = inputs.farLimit || 1.75;
  const permittedTotalBUASqFt = Math.round(plotAreaSqFt * farLimit);
  const setbackAreaSqFt = plotAreaSqFt - buildableFootprintSqFt;

  const facing = inputs.facing || "East";
  const roadW = inputs.roadWidth || 30;

  // 1. Project Design Brief
  const projectDesignBrief: ProjectDesignBrief = {
    projectType: `${inputs.buildingUse} Residence`,
    plotSize: `${plotW} ft × ${plotL} ft (${plotAreaSqFt.toLocaleString("en-IN")} sq.ft)`,
    plotFacing: `${facing} Facing`,
    plotShape: inputs.plotShape || "Rectangle",
    floorsRequested: `G+${Math.max(1, inputs.floors - 1)} (${inputs.floors} Floors)`,
    buildingUsage: inputs.buildingUse,
    parkingRequirement: inputs.parking,
    liftRequirement: inputs.lift ? `Yes (${inputs.liftCapacity})` : "No Elevator Required",
    vaastuStatus: inputs.vaastuStrictness !== "Ignore" ? `Enabled (${inputs.vaastuStrictness})` : "Disabled",
    userDesignGoal: `Create an architect-designed ${inputs.bedrooms}BHK ${inputs.buildingUse.toLowerCase()} project with optimum daylight, ventilation, and structural efficiency.`,
  };

  // 2. Dynamic Design Objectives (Generated dynamically from inputs without hard-coded span ranges)
  const designObjectives: DynamicDesignObjective[] = [
    {
      id: "obj_area",
      category: "Space Optimization",
      objective: "Maximise Usable Living Area & Footprint Efficiency",
      rationale: `Utilize up to ${maxPermittedFootprintSqFt.toLocaleString("en-IN")} sq.ft max permitted footprint per floor while respecting ${sFront}′ front setback.`,
    },
    {
      id: "obj_daylight",
      category: "Environmental",
      objective: "Improve Natural Daylight Harvesting",
      rationale: `Harvest morning solar light along ${facing} road facade and open North elevation.`,
    },
    {
      id: "obj_ventilation",
      category: "Environmental",
      objective: "Improve Cross Ventilation Flow",
      rationale: "Align fenestrations along South-West to North-East wind flow vector.",
    },
    {
      id: "obj_circulation",
      category: "Efficiency",
      objective: "Reduce Circulation Loss & Corridor Wastage",
      rationale: "Locate vertical circulation core efficiently to minimize linear corridor passages.",
    },
  ];

  if (inputs.parking !== "No Parking") {
    designObjectives.push({
      id: "obj_parking",
      category: "Mobility",
      objective: "Optimise Vehicle Parking & Driveway Access",
      rationale: `Accommodate ${inputs.carCount} cars and ${inputs.twoWheelerCount} bikes with unhindered turning radius.`,
    });
  }

  if (inputs.futureExpansion) {
    designObjectives.push({
      id: "obj_expansion",
      category: "Flexibility",
      objective: "Allow Future Floor Expansion",
      rationale: "Ensure structural design considers future additional floor loading.",
    });
  }

  designObjectives.push({
    id: "obj_structure",
    category: "Engineering",
    objective: "Engineering Objective",
    rationale: "Develop a safe, economical and vertically aligned structural system in the Structural Planning module, considering floor count, parking movement, soil information, seismic requirements, load paths and architectural needs.",
  });

  // 3. Orientation & Climate Opportunities (Pure Analysis)
  let bestBuildingOrientation = "East-Facing Longitudinally Extended Facade";
  let entryExitLocation = "North-East (Eesanya) Gate & Entrance Threshold";
  let vehicleAccessPoint = "North-West (Vayu) Driveway Entry";
  let pedestrianGateLocation = "North-East Gate";

  if (facing === "North") {
    bestBuildingOrientation = "North-Facing Open Facade with Shaded Verandah";
    entryExitLocation = "North-East Gate";
    vehicleAccessPoint = "North-West Driveway Entry";
  } else if (facing === "South") {
    bestBuildingOrientation = "South Road Entry with Deep Verandah Protection";
    entryExitLocation = "South-East Gate";
    vehicleAccessPoint = "South-West Driveway Entry";
  } else if (facing === "West") {
    bestBuildingOrientation = "West Facade with Louvered Solar Screening";
    entryExitLocation = "North-West Gate";
    vehicleAccessPoint = "South-West Driveway Entry";
  }

  const naturalLightOpportunities = `Optimal morning solar daylight gain along East & North building edges (${facing} facing road frontage). Lower solar heat gain along South-West.`;
  const crossVentilationOpportunities = "Predominant South-West to North-East wind vector. Deep window openings on SW and NE facades encourage natural cross ventilation.";
  const openSpaceAllocationSqFt = setbackAreaSqFt + Math.max(0, buildableFootprintSqFt - maxPermittedFootprintSqFt);

  // 4. Service Zones (Dynamic Vaastu / Functional Zoning Recommendations)
  const kitchenUtilityZone = "South-East (Agni) Zone recommended for Kitchen & Wet Utility.";
  const toiletsStaircaseZone = "North-West (Vayu) or West Zone recommended for Toilets & Vertical Core.";
  const masterBedroomZone = "South-West (Nairuthi) Zone recommended for Primary Master Suite.";
  const poojaMandirZone = inputs.vaastuStrictness !== "Ignore" ? "North-East (Eesanya) Zone recommended for Spiritual Core." : "Flexible central or living area placement.";

  // 5. Constraints & Opportunities
  const siteConstraints: string[] = [
    `Front Setback Requirement (${sFront} ft) limits maximum roadward projection.`,
    `Side Setbacks (Left: ${sLeft} ft, Right: ${sRight} ft) define buildable envelope width of ${buildW} ft.`,
    `FAR Limit (${farLimit}) caps total permitted BUA at ${permittedTotalBUASqFt.toLocaleString("en-IN")} sq.ft.`,
    `Height restriction cap (${inputs.heightRestriction || 45} ft) accommodates up to G+3 floors cleanly.`,
  ];

  const designOpportunities: string[] = [
    `Plot dimension (${plotW} ft × ${plotL} ft) allows efficient ${inputs.parking === "Full Parking" ? "Full Stilt Parking Ground Floor" : "Ground Floor Covered Parking Bay"}.`,
    `Orientation (${facing} facing) permits maximum East/North daylight harvesting.`,
    `Corner-to-corner rectangular geometry enables 100% structural grid column alignment across floors.`,
    `Dedicated ${sFront} ft front setback creates premium road-side balcony decks on upper floors.`,
  ];

  // 6. Recommendations for Structural Planning (Exact User Prompt Text & Structure)
  const recommendationsForStructuralPlanning: StructuralPlanningRecommendations = {
    structuralRequirement: "Evaluate the suitable structural system dynamically based on project usage, building height, number of floors, soil information, seismic zone, loading and buildable envelope.",
    verticalCirculationRequirement: "Structural Planning must evaluate the most suitable staircase and lift-core location without assuming that the core must be central.",
    parkingRequirement: "Avoid structural elements that obstruct required vehicle movement, turning radius, parking bays and pedestrian access.",
    alignmentRequirement: "Maintain practical vertical load-path continuity across floors wherever possible.",
    siteConstraints: [
      `Respect the approved buildable envelope (${buildW} ft × ${buildL} ft).`,
      `Respect statutory setbacks (Front ${sFront} ft, Rear ${sRear} ft, Left ${sLeft} ft, Right ${sRight} ft).`,
      `Respect access road frontage (${roadW} ft wide ${facing} Road).`,
      `Respect open-space requirements (${openSpaceAllocationSqFt.toLocaleString("en-IN")} sq.ft open ground).`,
      `Fulfill user priorities (${inputs.bedrooms} Bedrooms, ${inputs.attachedToilets + inputs.commonToilets} Toilets, ${inputs.parking}).`,
    ],
  };

  return {
    projectDesignBrief,
    plotSummary: {
      plotDimensions: `${plotW} ft × ${plotL} ft`,
      plotAreaSqFt,
      plotShape: inputs.plotShape || "Rectangle",
      facing,
      roadInfo: `${roadW} ft wide ${inputs.roadDirection || facing} Road`,
      cornerPlot: inputs.plotShape === "Irregular",
    },
    regulatorySummary: {
      permittedFAR: farLimit,
      maxCoveragePercent: coverageCapPercent,
      maxHeightFt: inputs.heightRestriction || 45,
      buildableEnvelopeFt: `${buildW} ft × ${buildL} ft`,
      buildableFootprintSqFt,
      maxPermittedFootprintSqFt,
      permittedTotalBUASqFt,
      setbackAreaSqFt,
    },
    orientationRecommendation: {
      bestBuildingOrientation,
      entryExitLocation,
      vehicleAccessPoint,
      pedestrianGateLocation,
    },
    openSpaceAndClimate: {
      naturalLightOpportunities,
      crossVentilationOpportunities,
      openSpaceAllocationSqFt,
    },
    serviceZones: {
      kitchenUtilityZone,
      toiletsStaircaseZone,
      masterBedroomZone,
      poojaMandirZone,
    },
    constraintsAndOpportunities: {
      siteConstraints,
      designOpportunities,
    },
    designObjectives,
    recommendationsForStructuralPlanning,
  };
}
