export interface TdsClassification {
  tdsPpm: number;
  qualityCategory: "Ideal" | "Acceptable" | "Hard Water (Softener Required)" | "Severe Hardness (RO + Softener Required)";
  recommendedTreatment: string;
  geyserProtectionNote: string;
}

export function classifyWaterQuality(tdsPpm: number = 450): TdsClassification {
  if (tdsPpm <= 300) {
    return {
      tdsPpm,
      qualityCategory: "Ideal",
      recommendedTreatment: "Standard Dual-Media Sand Filter for sediment & turbidity removal.",
      geyserProtectionNote: "No scaling risk. Heating elements and CP fittings will last 10+ years."
    };
  } else if (tdsPpm <= 600) {
    return {
      tdsPpm,
      qualityCategory: "Acceptable",
      recommendedTreatment: "Activated Carbon Filter + UV Purifier for drinking water.",
      geyserProtectionNote: "Minor scaling. Mild maintenance required every 24 months."
    };
  } else if (tdsPpm <= 1200) {
    return {
      tdsPpm,
      qualityCategory: "Hard Water (Softener Required)",
      recommendedTreatment: "Automatic Ion-Exchange Resin Water Softener (1000–2000 LPH) + RO System for drinking.",
      geyserProtectionNote: "High scaling risk! Centralized softener recommended to protect geysers, solar glass, and Kohler/Jaquar CP fittings."
    };
  } else {
    return {
      tdsPpm,
      qualityCategory: "Severe Hardness (RO + Softener Required)",
      recommendedTreatment: "High-Capacity Dual-Column Water Softener + Multi-Stage RO Plant.",
      geyserProtectionNote: "Severe scaling! Heating coils will fail within 12 months without automated brine water softening."
    };
  }
}

export interface TankCleaningStage {
  stepNo: number;
  stageName: string;
  description: string;
  toolUsed: string;
}

export const MECHANIZED_TANK_CLEANING_STAGES: TankCleaningStage[] = [
  { stepNo: 1, stageName: "Dewatering", description: "Automated high-capacity submersible pump dewatering down to bottom 2 inches.", toolUsed: "Dirty Water Submersible Pump" },
  { stepNo: 2, stageName: "Sludge Removal", description: "Manual & mechanical extraction of heavy silt, mud, and bottom sediment.", toolUsed: "Sludge Extractor & Scraper" },
  { stepNo: 3, stageName: "High-Pressure Jet Wash", description: "Rotary jet wash at 150-bar pressure to blast algae and fungal wall deposits.", toolUsed: "150 Bar High-Pressure Jet Cleaner" },
  { stepNo: 4, stageName: "Vacuum Cleaning", description: "Industrial wet vacuuming of suspended micro-particles and dirty residual water.", toolUsed: "Industrial Sludge Vacuum Unit" },
  { stepNo: 5, stageName: "Anti-Bacterial Spray", description: "Non-toxic food-grade anti-bacterial disinfectant spray across walls, ceiling, and floor.", toolUsed: "High-Atomization Chemical Sprayer" },
  { stepNo: 6, stageName: "UV Sterilization", description: "Ultraviolet light beam exposure to kill 99.9% remaining bacterial spores.", toolUsed: "Portable UV Sterilizer Lamp" }
];

export interface RwhResult {
  plotAreaSqFt: number;
  roofAreaSqM: number;
  isBwssbMandatory: boolean;
  annualRainfallMm: number; // Bengaluru average = ~950–1000 mm
  annualHarvestedLiters: number;
  recommendedFilterType: string;
  recommendedRechargePitFt: { diameterFt: number; depthFt: number };
}

export function calculateRwhYield(
  plotLengthFt: number = 30,
  plotWidthFt: number = 40,
  roofCoverageRatio: number = 0.8
): RwhResult {
  const plotAreaSqFt = plotLengthFt * plotWidthFt;

  // BWSSB Regulation: Mandatory for all plots measuring 1200 sq.ft (30x40 ft) and above
  const isBwssbMandatory = plotAreaSqFt >= 1200;

  // Roof Area in Sq.Meters (1 Sq.Ft = 0.092903 Sq.M)
  const roofAreaSqFt = plotAreaSqFt * roofCoverageRatio;
  const roofAreaSqM = roofAreaSqFt * 0.092903;

  const annualRainfallMm = 950; // Average annual rainfall in Bengaluru
  const runoffCoefficient = 0.85; // Concrete RCC slab runoff efficiency factor

  // Volume (Liters) = Area (sq.m) x Rainfall (mm) x Runoff Coefficient
  const annualHarvestedLiters = Math.round(roofAreaSqM * annualRainfallMm * runoffCoefficient);

  let recommendedFilterType = "Rainy FL-100 Auto-Clean Dual-Stage Filter";
  if (roofAreaSqFt > 2500) recommendedFilterType = "Rainy FL-300 Commercial RWH Filter (Up to 500 Sq.M)";
  else if (roofAreaSqFt > 1500) recommendedFilterType = "Rainy FL-150 Roof Filter (Up to 300 Sq.M)";

  return {
    plotAreaSqFt,
    roofAreaSqM: Math.round(roofAreaSqM),
    isBwssbMandatory,
    annualRainfallMm,
    annualHarvestedLiters,
    recommendedFilterType,
    recommendedRechargePitFt: { diameterFt: 6, depthFt: 10 }
  };
}
