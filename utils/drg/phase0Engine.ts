import {
  DRGInputs,
  Phase0AnalysisReport,
  ProjectDesignBrief,
  DynamicDesignObjective,
  StructuralPlanningRecommendations,
} from "./types";

/**
 * BuildMitra DRG — Dynamic Plot Analysis Engine (Phase 0)
 * Evaluates GBA statutory rules, setbacks (Front ~5%, Sides ~2%, Rear ~1%),
 * Storey Capability (Road Width + SBC Assessment), Parking & Rental Allocation,
 * and 10 Statutory Report Headers.
 */
export function analyzePlotPhase0(inputs: DRGInputs): Phase0AnalysisReport {
  const plotW = Math.max(10, inputs.plotWidth || 30);
  const plotL = Math.max(10, inputs.plotLength || 40);
  const plotAreaSqFt = plotW * plotL;

  // GBA SETBACK RULES (~10% Total: Front ~5%, Sides ~2%, Rear ~1%)
  const gbaFrontFt = Math.max(3, Math.round(plotL * 0.08)); // ~5% area / ~8% length
  const gbaSideFt = Math.max(2, Math.round(plotW * 0.07));  // ~2% area / ~7% width
  const gbaRearFt = Math.max(2, Math.round(plotL * 0.05));  // ~1% area / ~5% length

  const frontSetbackFt = inputs.setbacks?.front || gbaFrontFt;
  const rearSetbackFt = inputs.setbacks?.rear || gbaRearFt;
  const leftSetbackFt = inputs.setbacks?.left || gbaSideFt;
  const rightSetbackFt = inputs.setbacks?.right || gbaSideFt;

  const buildW = Math.max(0, plotW - leftSetbackFt - rightSetbackFt);
  const buildL = Math.max(0, plotL - frontSetbackFt - rearSetbackFt);
  const buildableFootprintSqFt = buildW * buildL;

  const frontAreaSqFt = frontSetbackFt * plotW;
  const rearAreaSqFt = rearSetbackFt * plotW;
  const sidesAreaSqFt = (leftSetbackFt + rightSetbackFt) * (plotL - frontSetbackFt - rearSetbackFt);
  const totalSetbackAreaSqFt = frontAreaSqFt + rearAreaSqFt + sidesAreaSqFt;
  const totalSetbackPct = Math.round((totalSetbackAreaSqFt / plotAreaSqFt) * 100);

  // FAR & STATUTORY COVERAGE
  const coverageCapPercent = inputs.maxCoveragePercent || 75;
  const maxCoverageAreaSqFt = Math.round(plotAreaSqFt * (coverageCapPercent / 100));
  const maxPermittedFootprintSqFt = Math.min(buildableFootprintSqFt, maxCoverageAreaSqFt);

  const farLimit = inputs.farLimit || 1.75;
  const permittedTotalBUASqFt = Math.round(plotAreaSqFt * farLimit);
  const heightRestrictionFt = inputs.heightRestriction || 45;
  const setbackAreaSqFt = totalSetbackAreaSqFt;

  const facing = inputs.facing || "South";
  const roadW = inputs.roadWidth || 30;
  const sbc = inputs.sbcKpa || 250;

  // STOREY CAPABILITY & HEIGHT RECOMMENDATION
  let maxFloorsAllowedByRoad = 4; // Default G+3 for 30ft road
  if (roadW < 25) maxFloorsAllowedByRoad = 3; // G+2
  else if (roadW >= 40 && roadW < 60) maxFloorsAllowedByRoad = 5; // G+4
  else if (roadW >= 60) maxFloorsAllowedByRoad = 7; // G+6+

  let maxFloorsRecommendedBySbc = 4;
  if (sbc < 120) maxFloorsRecommendedBySbc = 2;
  else if (sbc >= 120 && sbc < 180) maxFloorsRecommendedBySbc = 3;
  else if (sbc >= 180 && sbc < 300) maxFloorsRecommendedBySbc = 5;
  else if (sbc >= 300) maxFloorsRecommendedBySbc = 8;

  const finalRecommendedFloors = Math.min(maxFloorsAllowedByRoad, maxFloorsRecommendedBySbc, inputs.floors || 4);
  const recommendationReason = `Road width of ${roadW} ft allows up to ${maxFloorsAllowedByRoad} storeys under GBA byelaws. Soil SBC of ${sbc} kN/m² supports up to ${maxFloorsRecommendedBySbc} storeys. Recommended maximum height: ${finalRecommendedFloors} storeys (${finalRecommendedFloors > 1 ? `G+${finalRecommendedFloors - 1}` : "Ground Floor"}).`;

  // PARKING & RENTAL STRATEGY RECOMMENDATION
  const isRentalOrMixed = inputs.buildingUsage === "Rental Use" || inputs.buildingUsage === "Own and Rental Use";
  let recommendedParkingType: "Stilt Parking" | "Cellar / Basement Parking" | "Ground Half Parking" | "Open Surface Parking" = "Ground Half Parking";

  if (isRentalOrMixed && plotAreaSqFt >= 2000) {
    recommendedParkingType = "Cellar / Basement Parking";
  } else if (isRentalOrMixed || inputs.parkingPreference === "Full Parking") {
    recommendedParkingType = "Stilt Parking";
  }

  const calculatedCars = isRentalOrMixed ? Math.max(2, Math.ceil(inputs.floors * 0.75)) : 2;
  const calculatedBikes = isRentalOrMixed ? Math.max(4, inputs.floors * 2) : 4;
  const allocatedParkingAreaSqFt = inputs.parkingPreference === "Full Parking" ? maxPermittedFootprintSqFt : Math.round(maxPermittedFootprintSqFt * 0.5);

  const parkingRentalStrategy = {
    parkingMode: inputs.parkingPreference || "Half Parking",
    recommendedParkingType,
    carBaysCount: calculatedCars,
    bikeBaysCount: calculatedBikes,
    allocatedParkingAreaSqFt,
    rentalUnitsPossible: isRentalOrMixed ? (inputs.floors - 1) * 2 : 0,
    strategyNotes: `${isRentalOrMixed ? `Rental project requires ${calculatedCars} Car Bays & ${calculatedBikes} Bike Bays.` : "Single family use requires minimum 2 Car Bays."} ${recommendedParkingType} is strongly recommended to preserve structural driveway access.`,
  };

  // 1. PROJECT DESIGN BRIEF
  const projectDesignBrief: ProjectDesignBrief = {
    projectType: `${inputs.buildingType} (${inputs.buildingUsage})`,
    plotSize: `${plotW} ft × ${plotL} ft (${plotAreaSqFt.toLocaleString("en-IN")} sq.ft)`,
    plotFacing: `${facing} Facing`,
    plotShape: inputs.plotShape || "Rectangle",
    floorsRequested: `G+${Math.max(1, inputs.floors - 1)} (${inputs.floors} Storeys)`,
    buildingUsage: inputs.buildingUsage || "Own and Rental Use",
    parkingRequirement: `${inputs.parkingPreference} (${recommendedParkingType})`,
    liftRequirement: inputs.liftRequired ? `Yes (Passenger Lift)` : inputs.futureLiftProvision ? "Future Lift Shaft" : "No Lift",
    vaastuStatus: inputs.vaastuStrictness !== "Ignore" ? `Enabled (${inputs.vaastuStrictness || "Strict"})` : "Disabled",
    userDesignGoal: `Build a highly functional ${inputs.bedroomsCount || 4}BHK ${inputs.buildingType.toLowerCase()} on a ${plotW}x${plotL} plot with optimal daylighting, ventilation, and structural economy.`,
  };

  // 2. DYNAMIC DESIGN OBJECTIVES
  const designObjectives: DynamicDesignObjective[] = [
    {
      id: "obj_area",
      category: "Space Optimization",
      objective: "Maximise Usable Built-Up Area & Coverage Efficiency",
      rationale: `Utilize up to ${maxPermittedFootprintSqFt.toLocaleString("en-IN")} sq.ft footprint per floor respecting ${frontSetbackFt}′ front setback.`,
    },
    {
      id: "obj_gba_setbacks",
      category: "Statutory Bylaws",
      objective: "GBA Setback Allocation & Open Space Ratio",
      rationale: `Maintain Front ${frontSetbackFt}ft (~5%), Sides ${leftSetbackFt}ft (~2%), and Rear ${rearSetbackFt}ft (~1%), keeping ${totalSetbackPct}% open plot area.`,
    },
    {
      id: "obj_daylight",
      category: "Environmental",
      objective: "Natural Daylight & Climate Harvesting",
      rationale: `Harvest morning solar light along ${facing} road facade and open North-East elevation.`,
    },
    {
      id: "obj_circulation",
      category: "Efficiency",
      objective: "Vertical Core Efficiency & Corridor Minimization",
      rationale: `Locate ${inputs.staircaseRequirement} and Lift Core to minimize internal corridor wastage.`,
    },
    {
      id: "obj_parking",
      category: "Mobility",
      objective: "Vehicle Turning Radius & Bay Allocation",
      rationale: `Accommodate ${calculatedCars} Cars and ${calculatedBikes} Two-Wheelers in ${recommendedParkingType}.`,
    },
  ];

  // 3. SITE CONSTRAINTS & OPPORTUNITIES
  const siteConstraints: string[] = [
    `Front Setback (${frontSetbackFt} ft) limits roadward structural cantilever projections.`,
    `Side Setbacks (${leftSetbackFt} ft Left, ${rightSetbackFt} ft Right) define maximum buildable width of ${buildW} ft.`,
    `FAR Limit (${farLimit}) caps total permitted BUA at ${permittedTotalBUASqFt.toLocaleString("en-IN")} sq.ft.`,
    `Road width of ${roadW} ft caps permissible storey height at ${maxFloorsAllowedByRoad} floors.`,
  ];

  const designOpportunities: string[] = [
    `Plot geometry (${plotW} ft × ${plotL} ft) allows efficient ${recommendedParkingType} configuration.`,
    `Orientation (${facing} facing) permits maximum East/North daylight harvesting.`,
    `Rectangular geometry enables 100% structural grid column alignment across floors.`,
    `Dedicated ${frontSetbackFt} ft front setback creates premium road-side balcony decks on upper floors.`,
  ];

  // 4. RECOMMENDATIONS FOR STRUCTURAL PLANNING
  const recommendationsForStructuralPlanning: StructuralPlanningRecommendations = {
    structuralRequirement: `Adopt RCC Framed Structure with M25 Concrete and Fe500D Steel. SBC of ${sbc} kN/m² supports isolated trapezoidal footings.`,
    verticalCirculationRequirement: `Locate ${inputs.staircaseRequirement} and Lift core to avoid load transfers across upper rental units.`,
    parkingRequirement: `Maintain clear column grid span of 12-16 ft in parking zone to allow unhindered vehicle turning radius.`,
    alignmentRequirement: "Maintain vertical column grid continuity across Ground and upper floors.",
    siteConstraints: [
      `Respect buildable envelope (${buildW} ft × ${buildL} ft).`,
      `Respect GBA setbacks (Front ${frontSetbackFt} ft, Rear ${rearSetbackFt} ft, Left ${leftSetbackFt} ft, Right ${rightSetbackFt} ft).`,
      `Respect road frontage (${roadW} ft wide ${facing} Road).`,
      `Accommodate ${inputs.bedroomsCount || 4} Bedrooms, ${inputs.kitchensCount || 2} Kitchens, ${inputs.attachedToiletsCount + inputs.commonToiletsCount || 4} Toilets.`,
    ],
  };

  return {
    projectDesignBrief,
    plotSummary: {
      plotDimensions: `${plotW} ft × ${plotL} ft`,
      plotAreaSqFt,
      plotShape: inputs.plotShape || "Rectangle",
      facing,
      roadInfo: `${roadW} ft wide ${facing} Road`,
      cornerPlot: inputs.isCornerPlot || false,
    },
    regulatorySummary: {
      permittedFAR: farLimit,
      maxCoveragePercent: coverageCapPercent,
      maxHeightFt: heightRestrictionFt,
      buildableEnvelopeFt: `${buildW} ft × ${buildL} ft`,
      buildableFootprintSqFt,
      maxPermittedFootprintSqFt,
      permittedTotalBUASqFt,
      setbackAreaSqFt,
    },
    orientationRecommendation: {
      bestBuildingOrientation: `${facing}-Facing Facade`,
      entryExitLocation: `North-East Gate`,
      vehicleAccessPoint: `North-West Driveway Entry`,
      pedestrianGateLocation: `North-East Gate`,
    },
    openSpaceAndClimate: {
      naturalLightOpportunities: `Optimal daylight along East/North facades (${facing} road).`,
      crossVentilationOpportunities: `SW to NE prevailing wind vector cross-ventilation.`,
      openSpaceAllocationSqFt: setbackAreaSqFt,
    },
    serviceZones: {
      kitchenUtilityZone: "South-East (Agni) Zone",
      toiletsStaircaseZone: "North-West (Vayu) Zone",
      masterBedroomZone: "South-West (Nairuthi) Zone",
      poojaMandirZone: "North-East (Eesanya) Zone",
    },
    statutoryLimits: {
      permissibleFar: farLimit,
      permissibleCoveragePercent: coverageCapPercent,
      maxBuildableAreaSqFt: permittedTotalBUASqFt,
      maxGroundCoverageSqFt: maxCoverageAreaSqFt,
      heightRestrictionFt,
    },
    gbaSetbacks: {
      frontFt: frontSetbackFt,
      sidesFt: leftSetbackFt,
      rearFt: rearSetbackFt,
      frontAreaSqFt,
      sidesAreaSqFt,
      rearAreaSqFt,
      totalSetbackAreaSqFt,
      totalSetbackPct,
    },
    storeyCapability: {
      maxFloorsAllowedByRoad,
      maxFloorsRecommendedBySbc,
      finalRecommendedFloors,
      recommendationReason,
    },
    parkingRentalStrategy,
    constraintsAndOpportunities: {
      siteConstraints,
      designOpportunities,
    },
    designObjectives,
    recommendationsForStructuralPlanning,
  };
}
