export interface FixturePreset {
  id: string;
  name: string;
  category: "bathroom" | "kitchen" | "utility";
  lpm: number; // Liters per Minute flow rate
  wsfu: number; // Water Supply Fixture Units
  recommendedPipeInch: string;
}

export const FIXTURE_PRESETS: FixturePreset[] = [
  { id: "shower", name: "Overhead Shower", category: "bathroom", lpm: 12, wsfu: 2.0, recommendedPipeInch: "0.75 in (20mm)" },
  { id: "health_faucet", name: "Health Faucet", category: "bathroom", lpm: 6, wsfu: 1.0, recommendedPipeInch: "0.5 in (15mm)" },
  { id: "wash_basin", name: "Wash Basin Tap", category: "bathroom", lpm: 6, wsfu: 1.0, recommendedPipeInch: "0.5 in (15mm)" },
  { id: "ewc_flush", name: "EWC Dual Flush Tank (6L/3L)", category: "bathroom", lpm: 6, wsfu: 2.0, recommendedPipeInch: "0.5 in (15mm)" },
  { id: "diverter", name: "Concealed Bath Diverter", category: "bathroom", lpm: 15, wsfu: 3.0, recommendedPipeInch: "0.75 in (20mm)" },
  { id: "kitchen_sink", name: "Kitchen Sink Tap", category: "kitchen", lpm: 8, wsfu: 1.5, recommendedPipeInch: "0.5 in (15mm)" },
  { id: "washing_machine", name: "Washing Machine Inlet", category: "utility", lpm: 12, wsfu: 2.0, recommendedPipeInch: "0.75 in (20mm)" },
  { id: "dishwasher", name: "Dishwasher Outlet", category: "utility", lpm: 10, wsfu: 1.5, recommendedPipeInch: "0.75 in (20mm)" }
];

export interface PipeSizingGuide {
  sizeInch: string;
  sizeMm: number;
  application: string;
  maxFixtures: string;
}

export const CPVC_PIPE_STANDARDS: PipeSizingGuide[] = [
  { sizeInch: "0.5 in", sizeMm: 15, application: "Individual fixture branches (Taps, Basins, Faucets)", maxFixtures: "1–2 Fixtures" },
  { sizeInch: "0.75 in", sizeMm: 20, application: "Internal bathroom loop & riser branches", maxFixtures: "3–4 Simultaneous Fixtures" },
  { sizeInch: "1.0 in", sizeMm: 25, application: "OHT down-comer main line (1–2 Bathrooms)", maxFixtures: "5–8 Fixtures" },
  { sizeInch: "1.25 in", sizeMm: 32, application: "Primary vertical distribution riser (3+ Bathrooms)", maxFixtures: "9–15 Fixtures" },
  { sizeInch: "1.5 in", sizeMm: 40, application: "Multi-floor main distribution header", maxFixtures: "16+ Fixtures" },
  { sizeInch: "4.0 in", sizeMm: 110, application: "SWR Soil Pipe (EWC line) & Main Waste Drainage", maxFixtures: "Main Soil / UGD Line" }
];

export function calculateWaterSavings(
  standardTapCount: number,
  avgMinutesPerTapPerDay: number = 10,
  occupants: number = 4
) {
  // Standard Tap Flow Rate = 10 LPM; Low-Flow Aerator = 3 LPM (70% savings)
  const standardLitersPerDay = standardTapCount * 10 * avgMinutesPerTapPerDay;
  const aeratorLitersPerDay = standardTapCount * 3 * avgMinutesPerTapPerDay;

  const litersSavedPerDay = standardLitersPerDay - aeratorLitersPerDay;
  const litersSavedPerYear = litersSavedPerDay * 365;

  // Average Tanker / Municipal Water Cost in Bengaluru = ₹0.15 per Liter (₹150 / 1000L tanker)
  const rupeesSavedPerYear = Math.round(litersSavedPerYear * 0.15);

  // Dual Flush Savings: Single Flush = 12L per flush; Dual Flush = Avg 4.5L per flush
  const flushesPerPersonPerDay = 5;
  const singleFlushDaily = occupants * flushesPerPersonPerDay * 12;
  const dualFlushDaily = occupants * flushesPerPersonPerDay * 4.5;
  const flushLitersSavedPerYear = (singleFlushDaily - dualFlushDaily) * 365;
  const flushRupeesSavedPerYear = Math.round(flushLitersSavedPerYear * 0.15);

  return {
    aeratorDailySavedLiters: Math.round(litersSavedPerDay),
    aeratorYearlySavedLiters: Math.round(litersSavedPerYear),
    aeratorYearlySavedRupees: rupeesSavedPerYear,
    flushYearlySavedLiters: Math.round(flushLitersSavedPerYear),
    flushYearlySavedRupees: flushRupeesSavedPerYear,
    totalYearlySavedRupees: rupeesSavedPerYear + flushRupeesSavedPerYear
  };
}
