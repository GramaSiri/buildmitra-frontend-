export interface ConductorStandard {
  sizeSqMm: number;
  useCase: string;
  maxCurrentRatingAmps: number;
  maxWatts230V: number;
  recommendedConduitMm: number;
  colorCode: string;
}

export const CONDUCTOR_STANDARDS: ConductorStandard[] = [
  {
    sizeSqMm: 1.5,
    useCase: "Lighting & Fan point wiring (Max 800W or 10 points per circuit)",
    maxCurrentRatingAmps: 14,
    maxWatts230V: 1200,
    recommendedConduitMm: 20,
    colorCode: "Red / Black / Green (Earth)",
  },
  {
    sizeSqMm: 2.5,
    useCase: "6A Socket circuits, primary lighting mains, TV & desk power points",
    maxCurrentRatingAmps: 20,
    maxWatts230V: 2400,
    recommendedConduitMm: 20,
    colorCode: "Red / Black / Green (Earth)",
  },
  {
    sizeSqMm: 4.0,
    useCase: "16A Heavy power sockets (Geyser, Microwave, Washing Machine, 1.5T AC)",
    maxCurrentRatingAmps: 27,
    maxWatts230V: 4000,
    recommendedConduitMm: 25,
    colorCode: "Blue / Yellow / Green (Earth)",
  },
  {
    sizeSqMm: 6.0,
    useCase: "2T AC, 3T VRF, Main Sub-distribution lines, Solar PV Incomer line",
    maxCurrentRatingAmps: 36,
    maxWatts230V: 6000,
    recommendedConduitMm: 25,
    colorCode: "Blue / Red / Yellow",
  },
  {
    sizeSqMm: 10.0,
    useCase: "Main Incomer Cable from Meter Board to Main DB (up to 10 kW load)",
    maxCurrentRatingAmps: 50,
    maxWatts230V: 10000,
    recommendedConduitMm: 32,
    colorCode: "4-Core Armoured / Unarmoured",
  },
  {
    sizeSqMm: 16.0,
    useCase: "Heavy 3-Phase Incomer Cable from Meter Board to Main DB (> 10 kW load)",
    maxCurrentRatingAmps: 68,
    maxWatts230V: 18000,
    recommendedConduitMm: 40,
    colorCode: "4-Core XLPE Armoured Cable",
  },
];

export interface EarthingProtectionStandard {
  category: string;
  requirement: string;
  specification: string;
  complianceRule: string;
}

export const EARTHING_PROTECTION_STANDARDS: EarthingProtectionStandard[] = [
  {
    category: "Chemical Pipe Earthing",
    requirement: "2 Pits Minimum (Mains + Sensitive Electronics)",
    specification: "50mm dia 3-meter copper-bonded / GI chemical electrode filled with Bentonite compound",
    complianceRule: "Earth resistance must be < 5 Ohms for BESCOM L-Form clearance.",
  },
  {
    category: "Solar & Lightning Protection",
    requirement: "Dedicated 3rd Earth Pit",
    specification: "Independent dedicated pit connected to Type 2 Surge Protection Device (SPD) & Lightning Rod",
    complianceRule: "Isolated from domestic earthing grid to prevent surge feedback into appliances.",
  },
  {
    category: "Shock Protection (RCCB / ELCB)",
    requirement: "Main Residual Current Circuit Breaker",
    specification: "30mA sensitivity trip rating, 4-Pole 40A / 63A",
    complianceRule: "Mandatory requirement under IS 12640 & Central Electricity Authority (CEA) regulations.",
  },
  {
    category: "Overload & Short Circuit (MCB)",
    requirement: "Circuit Breakers (B & C Curve)",
    specification: "B-Curve for lighting (6A/10A); C-Curve for inductive motor/power loads (16A/25A/32A)",
    complianceRule: "10kA breaking capacity for residential sub-distribution boards.",
  },
];

export interface BrandTier {
  category: string;
  tier: "Premium / Luxury" | "High Durability / Standard" | "Value / Commercial";
  brandName: string;
  keyFeatures: string;
  warrantyPeriod: string;
}

export const BRAND_DIRECTORY: BrandTier[] = [
  // Wires
  {
    category: "Wires & Cables",
    tier: "Premium / Luxury",
    brandName: "Finolex Flamegard / Polycab Green Wire (FR-LSH)",
    keyFeatures: "100% Electrolytic Grade Copper, 105°C thermal rating, zero halogen toxic smoke",
    warrantyPeriod: "20 Years",
  },
  {
    category: "Wires & Cables",
    tier: "High Durability / Standard",
    brandName: "Havells Life Line Plus / Anchor by Panasonic",
    keyFeatures: "Anti-rodent HRFR insulation, 99.97% pure copper core",
    warrantyPeriod: "15 Years",
  },
  {
    category: "Wires & Cables",
    tier: "Value / Commercial",
    brandName: "RR Kabel / KEI Wires",
    keyFeatures: "Flame retardant PVC, IS 694 certified conductor",
    warrantyPeriod: "10 Years",
  },

  // Switches
  {
    category: "Modular Switches",
    tier: "Premium / Luxury",
    brandName: "Legrand Arteor / Schneider Zencelo / Crabtree",
    keyFeatures: "Glass/Metal finish plates, soft-touch operation, smart home automation ready",
    warrantyPeriod: "10 Years",
  },
  {
    category: "Modular Switches",
    tier: "High Durability / Standard",
    brandName: "Anchor Roma Classic / Havells Fabio / GM Modular",
    keyFeatures: "Silver cadmium contacts, spark-shield technology, poly-carbonate UV resistance",
    warrantyPeriod: "10 Years",
  },

  // Switchgear
  {
    category: "Switchgear (MCB / RCCB / DB)",
    tier: "Premium / Luxury",
    brandName: "Hager / ABB / Schneider Acti9 / Legrand DX3",
    keyFeatures: "Class-3 current limiting, bi-connect terminals, IP42 powder coated DB enclosure",
    warrantyPeriod: "5 Years",
  },
  {
    category: "Switchgear (MCB / RCCB / DB)",
    tier: "High Durability / Standard",
    brandName: "L&T Tripper / Havells Euro-II / Siemens Betagard",
    keyFeatures: "Quick breaking mechanism, 10kA fault rating, CE & ISI marked",
    warrantyPeriod: "5 Years",
  },

  // Solar Hardware
  {
    category: "Solar Hardware",
    tier: "Premium / Luxury",
    brandName: "Enphase Micro-Inverters / SolarEdge + Waaree Mono PERC",
    keyFeatures: "Panel-level MPPT optimization, 25-year linear performance warranty",
    warrantyPeriod: "25 Years",
  },
  {
    category: "Solar Hardware",
    tier: "High Durability / Standard",
    brandName: "Sungrow / Growatt String Inverter + Tata Power Solar / Vikram Solar",
    keyFeatures: "Dual MPPT, IP65 outdoor casing, BESCOM net meter approved",
    warrantyPeriod: "10 Years (Inverter) / 25 Years (Panels)",
  },
];
