export interface SolarCalcParams {
  monthlyBillAmount?: number;
  monthlyUnitsKwh?: number;
  sanctionedLoadKw: number;
  availableRooftopSqFt?: number;
  desiredSolarKw?: number;
}

export interface SolarCalcResult {
  recommendedSolarKw: number;
  maxPermissibleNetMeteringKw: number;
  requiredShadowFreeAreaSqFt: number;
  dailyGenerationKwh: number;
  monthlyGenerationKwh: number;
  annualGenerationKwh: number;
  estimatedTurnkeyCostGross: number;
  governmentSubsidyAmount: number;
  netTurnkeyCost: number;
  monthlyBillSavingsRupees: number;
  annualBillSavingsRupees: number;
  simplePaybackYears: number;
  co2OffsetTonsPerYear: number;
  pmSuryaGharEligible: boolean;
  subsidyTierLabel: string;
  recommendedHardware: {
    inverterType: string;
    inverterBrands: string[];
    panelType: string;
    panelBrands: string[];
  };
}

export function calculateRooftopSolar(params: SolarCalcParams): SolarCalcResult {
  const bescomTariff = 7.5; // Average BESCOM residential tariff ₹7.50 / unit

  // Determine target kW from units, bill or explicit input
  let targetKw = params.desiredSolarKw || 3;

  if (!params.desiredSolarKw) {
    let monthlyKwh = params.monthlyUnitsKwh || 0;
    if (!monthlyKwh && params.monthlyBillAmount) {
      monthlyKwh = params.monthlyBillAmount / bescomTariff;
    }
    if (monthlyKwh > 0) {
      // 1 kW generates ~120 kWh per month in Bengaluru
      targetKw = Math.ceil(monthlyKwh / 120);
    }
  }

  // BESCOM Net Metering Constraint: Capped at 100% of Sanctioned Load
  const maxPermissibleNetMeteringKw = Math.max(1, params.sanctionedLoadKw);
  const recommendedSolarKw = Math.min(targetKw, maxPermissibleNetMeteringKw);

  // Rooftop Area Requirement: ~80 - 100 sq.ft per 1 kW solar PV
  const requiredShadowFreeAreaSqFt = recommendedSolarKw * 90;

  // Generation Metrics
  const dailyGenerationKwh = Number((recommendedSolarKw * 4.0).toFixed(1));
  const monthlyGenerationKwh = Math.round(dailyGenerationKwh * 30);
  const annualGenerationKwh = Math.round(dailyGenerationKwh * 365);

  // Turnkey Cost (~₹60,000 / kW for Quality On-Grid Setup)
  const estimatedTurnkeyCostGross = recommendedSolarKw * 60000;

  // PM Surya Ghar Muft Bijli Yojana Subsidy Calculation
  // 1 kW: ₹30,000 | 2 kW: ₹60,000 | 3 kW+: ₹78,000 (Max Cap)
  let governmentSubsidyAmount = 0;
  let subsidyTierLabel = "Not Eligible";
  const pmSuryaGharEligible = recommendedSolarKw >= 1;

  if (pmSuryaGharEligible) {
    if (recommendedSolarKw === 1) {
      governmentSubsidyAmount = 30000;
      subsidyTierLabel = "PM Surya Ghar Slab 1: ₹30,000 for 1 kW";
    } else if (recommendedSolarKw === 2) {
      governmentSubsidyAmount = 60000;
      subsidyTierLabel = "PM Surya Ghar Slab 2: ₹60,000 for 2 kW";
    } else {
      governmentSubsidyAmount = 78000;
      subsidyTierLabel = "PM Surya Ghar Slab 3: ₹78,000 (Max Cap for ≥ 3 kW)";
    }
  }

  const netTurnkeyCost = Math.max(0, estimatedTurnkeyCostGross - governmentSubsidyAmount);

  // Savings and Financial Payback
  const monthlyBillSavingsRupees = Math.round(monthlyGenerationKwh * bescomTariff);
  const annualBillSavingsRupees = Math.round(annualGenerationKwh * bescomTariff);

  const simplePaybackYears =
    annualBillSavingsRupees > 0
      ? Number((netTurnkeyCost / annualBillSavingsRupees).toFixed(1))
      : 4.0;

  const co2OffsetTonsPerYear = Number(((annualGenerationKwh * 0.82) / 1000).toFixed(2));

  return {
    recommendedSolarKw,
    maxPermissibleNetMeteringKw,
    requiredShadowFreeAreaSqFt,
    dailyGenerationKwh,
    monthlyGenerationKwh,
    annualGenerationKwh,
    estimatedTurnkeyCostGross,
    governmentSubsidyAmount,
    netTurnkeyCost,
    monthlyBillSavingsRupees,
    annualBillSavingsRupees,
    simplePaybackYears,
    co2OffsetTonsPerYear,
    pmSuryaGharEligible,
    subsidyTierLabel,
    recommendedHardware: {
      inverterType: "On-Grid String Inverter / Micro-Inverter with Net Metering MPPT",
      inverterBrands: ["Enphase (Micro)", "SolarEdge", "Sungrow", "Growatt", "Havells Encharge"],
      panelType: "Mono PERC Half-Cut / Bifacial High-Efficiency Solar Modules (540W - 580W)",
      panelBrands: ["Waaree Energies", "Tata Power Solar", "Vikram Solar", "Adani Solar"],
    },
  };
}

export interface HybridWindBessResult {
  vawtRecommended: boolean;
  vawtCapacityWatts: number;
  vawtNightUnitsPerMonth: number;
  bessCapacityKwh: number;
  recommendedBatteryTech: string;
  backupAutonomyHours: number;
}

export function calculateHybridWindBess(
  floorsCount: number,
  sanctionedLoadKw: number
): HybridWindBessResult {
  // Elevated rooftops (3+ floors) get VAWT recommendations
  const vawtRecommended = floorsCount >= 3;
  const vawtCapacityWatts = vawtRecommended ? (sanctionedLoadKw >= 10 ? 1000 : 500) : 0;
  const vawtNightUnitsPerMonth = vawtRecommended ? (vawtCapacityWatts === 1000 ? 90 : 45) : 0;

  // BESS: Recommended 5kWh for Single Phase, 10kWh-15kWh for 3-Phase
  const bessCapacityKwh = sanctionedLoadKw <= 5 ? 5 : sanctionedLoadKw <= 12 ? 10 : 15;

  return {
    vawtRecommended,
    vawtCapacityWatts,
    vawtNightUnitsPerMonth,
    bessCapacityKwh,
    recommendedBatteryTech: "LiFePO4 (Lithium Iron Phosphate) 48V / 51.2V Modular Rack Battery",
    backupAutonomyHours: 6,
  };
}
