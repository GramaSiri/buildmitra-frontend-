export interface TankCapacityResult {
  occupants: number;
  dailyDemandLPCD: number; // IS 1172 Standard = 135 LPCD
  totalDailyDemandLiters: number;
  sumpCapacityLiters: number; // 1.5 to 2.0 days storage
  overheadTankCapacityLiters: number; // 0.75 to 1.0 day storage
  recommendedSumpFt: { lengthFt: number; widthFt: number; depthFt: number };
}

export function calculateStorageCapacity(
  occupants: number = 5,
  sumpDaysBuffer: number = 1.5,
  ohtDaysBuffer: number = 0.75
): TankCapacityResult {
  const dailyDemandLPCD = 135; // IS 1172 Indian Standard baseline
  const totalDailyDemandLiters = occupants * dailyDemandLPCD;

  const sumpCapacityLiters = Math.ceil(totalDailyDemandLiters * sumpDaysBuffer);
  const overheadTankCapacityLiters = Math.ceil(totalDailyDemandLiters * ohtDaysBuffer);

  // Convert Liters to Cubic Feet (1 Cu.Ft = 28.3168 Liters)
  const sumpCuFt = sumpCapacityLiters / 28.3168;

  // Assume standard depth = 6 ft
  const depthFt = 6;
  const areaSqFt = sumpCuFt / depthFt;
  const widthFt = Math.ceil(Math.sqrt(areaSqFt));
  const lengthFt = Math.ceil(areaSqFt / widthFt);

  return {
    occupants,
    dailyDemandLPCD,
    totalDailyDemandLiters,
    sumpCapacityLiters,
    overheadTankCapacityLiters,
    recommendedSumpFt: { lengthFt, widthFt, depthFt }
  };
}

export interface PumpSizingResult {
  staticVerticalHeadFt: number;
  frictionLossFt: number;
  totalDynamicHeadFt: number; // TDH
  recommendedTransferPumpHp: string;
  recommendedBorewellPumpHp: string;
  needsPressureBooster: boolean;
  boosterPumpHp: string;
}

export function calculatePumpHorsepower(
  buildingFloors: number = 3,
  borewellDepthFt: number = 600,
  overheadTankHeightFt: number = 40
): PumpSizingResult {
  // Static Vertical Height from Underground Sump to OHT Roof = buildingFloors * 11 ft + 10 ft
  const staticVerticalHeadFt = Math.max(30, overheadTankHeightFt);
  
  // Friction Loss = 15% of static head for elbow fittings & valves
  const frictionLossFt = staticVerticalHeadFt * 0.15;
  const totalDynamicHeadFt = Math.round(staticVerticalHeadFt + frictionLossFt + 10); // +10 ft residual pressure

  let recommendedTransferPumpHp = "0.5 HP Monoblock";
  if (totalDynamicHeadFt > 80) recommendedTransferPumpHp = "2.0 HP Submersible Transfer";
  else if (totalDynamicHeadFt > 55) recommendedTransferPumpHp = "1.5 HP Monoblock / Submersible";
  else if (totalDynamicHeadFt > 35) recommendedTransferPumpHp = "1.0 HP Self-Priming Monoblock";

  let recommendedBorewellPumpHp = "1.5 HP Submersible (10-Stage)";
  if (borewellDepthFt > 750) recommendedBorewellPumpHp = "5.0 HP Heavy-Duty Submersible (25-Stage)";
  else if (borewellDepthFt > 550) recommendedBorewellPumpHp = "3.0 HP Submersible (18-Stage)";
  else if (borewellDepthFt > 350) recommendedBorewellPumpHp = "2.0 HP Submersible (12-Stage)";

  // Pressure booster recommended for top-floor bathrooms if gravity head < 10 ft
  const needsPressureBooster = buildingFloors >= 3;
  const boosterPumpHp = needsPressureBooster ? "0.75 HP Automatic Constant Pressure System" : "Not Required";

  return {
    staticVerticalHeadFt,
    frictionLossFt: Math.round(frictionLossFt),
    totalDynamicHeadFt,
    recommendedTransferPumpHp,
    recommendedBorewellPumpHp,
    needsPressureBooster,
    boosterPumpHp
  };
}
