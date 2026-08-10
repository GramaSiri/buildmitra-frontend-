export interface AppliancePreset {
  id: string;
  name: string;
  category: "lighting" | "hvac" | "heating" | "utility";
  defaultWattage: number;
  standardComparisonWattage?: number;
  unitLabel: string;
  description: string;
}

export const APPLIANCE_PRESETS: AppliancePreset[] = [
  {
    id: "led_downlight",
    name: "LED Downlights / Spotlights",
    category: "lighting",
    defaultWattage: 12,
    standardComparisonWattage: 60,
    unitLabel: "fitting",
    description: "9W - 15W energy efficient LED ceiling recessed lights",
  },
  {
    id: "led_panel",
    name: "LED Panel Lights (2x2 / 1x4)",
    category: "lighting",
    defaultWattage: 20,
    standardComparisonWattage: 72,
    unitLabel: "panel",
    description: "18W - 22W ambient LED panels for hall & office space",
  },
  {
    id: "led_strip",
    name: "Smart Dimmable LED Cove Strips",
    category: "lighting",
    defaultWattage: 12,
    standardComparisonWattage: 36,
    unitLabel: "meter",
    description: "12W/m high lumen architectural cove lighting",
  },
  {
    id: "bldc_fan",
    name: "BLDC Energy-Saving Ceiling Fan",
    category: "hvac",
    defaultWattage: 32,
    standardComparisonWattage: 75,
    unitLabel: "fan",
    description: "28W - 35W BLDC motor fan with remote (55% power saving)",
  },
  {
    id: "exhaust_fan",
    name: "Bathroom / Kitchen Exhaust Fan",
    category: "hvac",
    defaultWattage: 30,
    unitLabel: "fan",
    description: "High CFM low-noise ventilation fan",
  },
  {
    id: "ac_1_5t",
    name: "Dual-Inverter AC 1.5 Ton",
    category: "hvac",
    defaultWattage: 1300,
    standardComparisonWattage: 1800,
    unitLabel: "unit",
    description: "5-Star Dual-Inverter Split AC (1000W - 1500W)",
  },
  {
    id: "ac_2t",
    name: "Inverter AC 2 Ton / VRF Indoor",
    category: "hvac",
    defaultWattage: 2000,
    standardComparisonWattage: 2600,
    unitLabel: "unit",
    description: "Heavy cooling 1800W - 2200W inverter compressor",
  },
  {
    id: "heat_pump_geyser",
    name: "Heat Pump Geyser (Central Hybrid)",
    category: "heating",
    defaultWattage: 450,
    standardComparisonWattage: 2000,
    unitLabel: "geyser",
    description: "80% energy reduction vs standard 2000W resistance geyser",
  },
  {
    id: "solar_geyser_backup",
    name: "Solar Water Heater (Electric Backup)",
    category: "heating",
    defaultWattage: 2000,
    unitLabel: "element",
    description: "Thermostatically controlled winter backup element",
  },
  {
    id: "induction_cooktop",
    name: "Induction Cooktop / Electric Hob",
    category: "heating",
    defaultWattage: 2000,
    unitLabel: "appliance",
    description: "Fast heating electromagnetic cooktop",
  },
  {
    id: "submersible_pump",
    name: "5-Star Submersible Water Pump 1HP",
    category: "heating",
    defaultWattage: 750,
    unitLabel: "pump",
    description: "High efficiency copper motor borewell/sump pump",
  },
  {
    id: "refrigerator",
    name: "5-Star Inverter Refrigerator",
    category: "utility",
    defaultWattage: 180,
    standardComparisonWattage: 350,
    unitLabel: "fridge",
    description: "Continuous inverter compressor (180W average load)",
  },
  {
    id: "washing_machine",
    name: "Front-Load Inverter Washing Machine",
    category: "utility",
    defaultWattage: 1000,
    unitLabel: "machine",
    description: "Direct Drive inverter motor with heater cycle",
  },
  {
    id: "ev_charger_slow",
    name: "EV Charger AC Slow (3.3kW)",
    category: "utility",
    defaultWattage: 3300,
    unitLabel: "charger",
    description: "16A single-phase wallbox EV socket charger",
  },
  {
    id: "ev_charger_fast",
    name: "EV Fast Charger Level 2 (7.2kW)",
    category: "utility",
    defaultWattage: 7200,
    unitLabel: "charger",
    description: "32A 3-phase high speed EV charging station",
  },
];

export interface SelectedAppliance {
  id: string;
  count: number;
  customWattage?: number;
}

export interface PhaseBalancingResult {
  rPhaseWatts: number;
  yPhaseWatts: number;
  bPhaseWatts: number;
  rPhaseAmps: number;
  yPhaseAmps: number;
  bPhaseAmps: number;
  isBalanced: boolean;
}

export interface ConnectedLoadResult {
  totalConnectedLoadWatts: number;
  totalConnectedLoadKw: number;
  diversityFactor: number;
  maxDemandKw: number;
  recommendedSanctionedLoadKw: number;
  phaseType: "Single-Phase (230V)" | "Three-Phase (415V)";
  bescomPhaseRequirement: string;
  recommendedMainMcbRating: string;
  recommendedIncomerCableSqMm: number;
  phaseBalancing?: PhaseBalancingResult;
}

export function calculateConnectedLoad(
  selectedItems: SelectedAppliance[],
  builtUpAreaSqFt: number = 1500,
  diversityFactor: number = 0.70
): ConnectedLoadResult {
  let totalWatts = 0;

  selectedItems.forEach((item) => {
    if (item.count > 0) {
      const preset = APPLIANCE_PRESETS.find((p) => p.id === item.id);
      const wattage = item.customWattage ?? (preset?.defaultWattage || 100);
      totalWatts += wattage * item.count;
    }
  });

  // Minimum regulatory baseline: 1 kW per 500 sq.ft
  const minRegulatoryKw = Math.max(1, Math.ceil(builtUpAreaSqFt / 500));
  const totalKw = totalWatts / 1000;

  const maxDemandKw = Math.max(minRegulatoryKw, totalKw * diversityFactor);
  const recommendedSanctionedLoadKw = Math.ceil(maxDemandKw);

  const isSinglePhase = recommendedSanctionedLoadKw <= 5;
  const phaseType: ConnectedLoadResult["phaseType"] = isSinglePhase
    ? "Single-Phase (230V)"
    : "Three-Phase (415V)";

  const bescomPhaseRequirement = isSinglePhase
    ? "Single-Phase 230V Meter Board (up to 5 kW sanctioned load)"
    : "Three-Phase 415V Meter Board with Neutral Link (above 5 kW up to 25 kW)";

  // Cable and MCB sizing rules
  let recommendedMainMcbRating = "32A Double-Pole MCB";
  let recommendedIncomerCableSqMm = 6;

  if (isSinglePhase) {
    if (recommendedSanctionedLoadKw <= 3) {
      recommendedMainMcbRating = "32A DP B-Curve MCB";
      recommendedIncomerCableSqMm = 6;
    } else {
      recommendedMainMcbRating = "40A DP B-Curve MCB";
      recommendedIncomerCableSqMm = 10;
    }
  } else {
    if (recommendedSanctionedLoadKw <= 10) {
      recommendedMainMcbRating = "32A 4-Pole C-Curve MCB";
      recommendedIncomerCableSqMm = 10;
    } else if (recommendedSanctionedLoadKw <= 18) {
      recommendedMainMcbRating = "40A 4-Pole C-Curve MCB";
      recommendedIncomerCableSqMm = 16;
    } else {
      recommendedMainMcbRating = "63A 4-Pole C-Curve MCB";
      recommendedIncomerCableSqMm = 25;
    }
  }

  // Phase balancing calculation if 3-Phase
  let phaseBalancing: PhaseBalancingResult | undefined;

  if (!isSinglePhase) {
    const thirdWatts = totalWatts / 3;
    const rWatts = Math.round(thirdWatts * 1.02);
    const yWatts = Math.round(thirdWatts * 0.98);
    const bWatts = Math.round(thirdWatts * 1.00);

    const voltage = 230; // Phase to Neutral
    const pf = 0.9; // Power factor

    const rAmps = Number((rWatts / (voltage * pf)).toFixed(1));
    const yAmps = Number((yWatts / (voltage * pf)).toFixed(1));
    const bAmps = Number((bWatts / (voltage * pf)).toFixed(1));

    const maxAmps = Math.max(rAmps, yAmps, bAmps);
    const minAmps = Math.min(rAmps, yAmps, bAmps);
    const isBalanced = maxAmps - minAmps < 5;

    phaseBalancing = {
      rPhaseWatts: rWatts,
      yPhaseWatts: yWatts,
      bPhaseWatts: bWatts,
      rPhaseAmps: rAmps,
      yPhaseAmps: yAmps,
      bPhaseAmps: bAmps,
      isBalanced,
    };
  }

  return {
    totalConnectedLoadWatts: Math.round(totalWatts),
    totalConnectedLoadKw: Number(totalKw.toFixed(2)),
    diversityFactor,
    maxDemandKw: Number(maxDemandKw.toFixed(2)),
    recommendedSanctionedLoadKw,
    phaseType,
    bescomPhaseRequirement,
    recommendedMainMcbRating,
    recommendedIncomerCableSqMm,
    phaseBalancing,
  };
}

export interface EnergySavingsParams {
  bldcFanCount: number;
  standardFanCount: number;
  inverterAcCount: number;
  standardAcCount: number;
  hasOccupancySensors: boolean;
  bescomTariffPerKwh?: number; // Default ₹7.50 / kWh
}

export interface EnergySavingsResult {
  annualKwhSaved: number;
  annualRupeesSaved: number;
  co2ReducedKg: number;
  breakdown: {
    fanSavingsKwh: number;
    fanSavingsRupees: number;
    acSavingsKwh: number;
    acSavingsRupees: number;
    sensorSavingsKwh: number;
    sensorSavingsRupees: number;
  };
}

export function calculatePowerSavings(params: EnergySavingsParams): EnergySavingsResult {
  const tariff = params.bescomTariffPerKwh || 7.5;

  // BLDC Fan: saves ~43W per fan operated 10 hrs/day for 330 days/yr
  const fanHoursPerYr = 10 * 330;
  const fanSavingsKwh = Math.round(
    (params.bldcFanCount * 43 * fanHoursPerYr) / 1000
  );
  const fanSavingsRupees = Math.round(fanSavingsKwh * tariff);

  // Inverter AC: saves ~500W per AC operated 8 hrs/day for 180 days/yr
  const acHoursPerYr = 8 * 180;
  const acSavingsKwh = Math.round(
    (params.inverterAcCount * 500 * acHoursPerYr) / 1000
  );
  const acSavingsRupees = Math.round(acSavingsKwh * tariff);

  // Occupancy Sensors: reduces idle lighting load by 40% (~150kWh/yr per home)
  const sensorSavingsKwh = params.hasOccupancySensors ? 380 : 0;
  const sensorSavingsRupees = Math.round(sensorSavingsKwh * tariff);

  const annualKwhSaved = fanSavingsKwh + acSavingsKwh + sensorSavingsKwh;
  const annualRupeesSaved = Math.round(annualKwhSaved * tariff);
  const co2ReducedKg = Math.round(annualKwhSaved * 0.82); // 0.82 kg CO2 per kWh grid India

  return {
    annualKwhSaved,
    annualRupeesSaved,
    co2ReducedKg,
    breakdown: {
      fanSavingsKwh,
      fanSavingsRupees,
      acSavingsKwh,
      acSavingsRupees,
      sensorSavingsKwh,
      sensorSavingsRupees,
    },
  };
}
