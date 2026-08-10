export interface PlumbingBrandItem {
  category: string;
  luxuryTier: string[];
  premiumTier: string[];
  valueTier: string[];
  specificationNotes: string;
}

export const PLUMBING_BRAND_DIRECTORY: PlumbingBrandItem[] = [
  {
    category: "CPVC / UPVC Pipes & Fittings",
    luxuryTier: ["Astral Silencio (Noise Reduction)", "Ashirvad FlowGuard Gold (SDR 11)"],
    premiumTier: ["Astral Pipes", "Ashirvad Pipes", "Supreme Industries", "Finolex CPVC"],
    valueTier: ["Prince Pipes", "Apollo Pipes", "Vectus"],
    specificationNotes: "SDR 11 CPVC rated up to 93°C for hot water geyser loops; SCH 40/80 UPVC for cold water main risers."
  },
  {
    category: "SWR Drain & Soil Pipes (4-Inch Drainage)",
    luxuryTier: ["Ashirvad Silent SWR (Triple Layer Foam Core)", "Astral DrainMaster"],
    premiumTier: ["Finolex SWR", "Supreme SWR (Ring-Fit)", "Ashirvad SWR"],
    valueTier: ["Prince Silentfit", "Apollo SWR", "Sudhakar"],
    specificationNotes: "Ring-fit SWR PVC pipes prevent joint leaks; 4-inch (110mm) for EWC soil lines & 3-inch for waste water."
  },
  {
    category: "Sanitaryware (EWCs, Wash Basins, Urinals)",
    luxuryTier: ["Kohler", "Grohe", "Toto (Japan)", "Duravit"],
    premiumTier: ["Jaquar", "Hindware", "Cera", "Parryware"],
    valueTier: ["Somany", "Neycer", "Johnson Pedder"],
    specificationNotes: "Wall-hung Rimless EWCs with concealed cisterns save floor space & 3L/6L dual-flush valves reduce water usage."
  },
  {
    category: "CP Bath Fittings (Faucets, Diverters, Showers)",
    luxuryTier: ["Grohe (Germany)", "Kohler", "Hansgrohe", "Gessi"],
    premiumTier: ["Jaquar (Artize / Continental)", "Hindware Italian Collection", "Cera"],
    valueTier: ["Parryware", "Marc", "ESS ESS"],
    specificationNotes: "Single-lever concealed diverters with brass body & 10-year warranty against chrome peeling."
  },
  {
    category: "Water Pumps & Submersible Motors",
    luxuryTier: ["Grundfos (Denmark - Variable Frequency)", "Wilo Pumps"],
    premiumTier: ["Texmo (Taro Pumps)", "Kirloskar Brothers", "CRI Pumps", "Crompton Greaves"],
    valueTier: ["V-Guard", "Havells Pumps", "Lubi"],
    specificationNotes: "Borewell submersibles with copper winding & stainless steel pump jacket; VFD pressure boosters for top floors."
  },
  {
    category: "Overhead Tanks & RWH Filters",
    luxuryTier: ["Sintex Pure (Antimicrobial 4-Layer)", "Ashirvad Nano-Silver UV Tank"],
    premiumTier: ["Supreme WeatherMaster", "Sintex Reno (3-Layer)", "Vectus Granito"],
    valueTier: ["Storewel", "Plasto", "Kaveri Tanks"],
    specificationNotes: "3-layer or 4-layer UV-stabilized food-grade virgin plastic tanks to prevent algae growth."
  }
];
