import { getApiBase } from "./apiConfig";
export type MasterRateResult = {
  rate: number;
  found: boolean;
  source: string;
  matchedName: string;
  itemCode?: string;
  unit?: string;
  city?: string;
  status?: string;
};

export function normalizeUnit(unit: string): string {
  if (!unit) return '';
  const u = String(unit).trim().toUpperCase();
  if (['KG', 'KGS', 'KILOGRAM', 'KILOGRAMS'].includes(u)) return 'KG';
  if (['BAG', 'BAGS', 'BAG (50KG)'].includes(u)) return 'BAG';
  if (['CFT', 'CU.FT', 'CUFT', 'CUBIC FEET', 'CUBIC FOOT'].includes(u)) return 'CFT';
  if (['SQFT', 'SQ.FT', 'SFT', 'SQUARE FEET', 'SQ FT'].includes(u)) return 'SQFT';
  if (['SQM', 'SQ.M', 'SQUARE METER', 'SQUARE METRE', 'M2', 'M²'].includes(u)) return 'SQM';
  if (['RFT', 'RUNNING FEET', 'RUNNING FOOT'].includes(u)) return 'RFT';
  if (['NOS', 'NO', 'NUMBERS', 'NUMBER', 'PIECE', 'PIECES', 'NOS.', 'PKT', 'PACKET', 'SET', 'SETS'].includes(u)) return 'NOS';
  if (['LTR', 'LITRE', 'LITER', 'LITRES', 'LITERS', 'L'].includes(u)) return 'LTR';
  if (['M', 'METER', 'METRE', 'METERS'].includes(u)) return 'M';
  if (['CUM', 'CU.M', 'CUBIC METER', 'CUBIC METRE', 'M3', 'M³'].includes(u)) return 'CUM';
  if (['MT', 'TON', 'TONNE', 'METRIC TON'].includes(u)) return 'MT';
  return u;
}

const readArray = (key: string): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const CANONICAL_ALIAS_MAP: Record<string, string[]> = {
  "MAT-CEM-01": ["cement", "opc 53", "opc cement", "ppc cement", "portland cement", "cement opc 53 grade"],
  "MAT-STL-01": ["tmt steel", "steel rebar", "fe 500d", "rebar", "reinforcement steel", "tmt bar", "tor steel"],
  "MAT-MSND-01": ["m-sand", "m sand", "manufactured sand", "crushed sand", "plastering sand"],
  "MAT-AGG-01": ["mat-agg-12", "mat-agg-20", "aggregates ca-1 & ca-2", "aggregates ca-1", "aggregates ca-2", "20mm & 12mm aggregate", "coarse jelly", "jelly"],
  "MAT-AGG-12": ["aggregates ca-1 & ca-2", "aggregates ca-1", "aggregates ca-2", "20mm & 12mm aggregate", "coarse jelly"],
  "CIV-CLR-01": ["site clearing", "site clearance", "site leveling", "site marking", "marking & leveling"],
  "CIV-FND-01": ["civ-fnd-con", "foundation + damp proof course", "foundation", "damp proof course", "dpc 50mm", "dpc"],
  "CIV-FND-CON": ["foundation + damp proof course", "foundation", "damp proof course", "dpc 50mm"],
  "CIV-RCC-01": ["all rcc concrete works", "rcc concrete", "rcc footing", "rcc beam", "rcc column", "rcc slab"],
  "CIV-MAS-01": ["mat-blk-01", "mat-brk-01", "mat-aac-01", "masonry walls", "brickwork", "blockwork", "aac block", "interlock masonry"],
  "MAT-BLK-01": ["masonry walls", "concrete block", "solid block", "concrete solid block"],
  "CIV-PLS-01": ["mat-pls-01", "srv-pls-lay", "all plastering", "plastering", "internal smooth + external sponge"],
  "MAT-PLS-01": ["all plastering", "plastering", "internal smooth + external sponge"],
  "CIV-FLR-01": ["mat-grn-01", "mat-vit-01", "flooring + kitchen platform", "flooring", "vitrified tiles", "granite", "kitchen platform"],
  "MAT-GRN-01": ["flooring + kitchen platform", "flooring", "vitrified tiles / granite", "granite"],
  "CIV-WND-01": ["windows & doors", "windows", "doors", "upvc windows", "teak doors"],
  "CIV-GRL-01": ["grills & railings", "window grills", "balcony railing", "staircase railing"],
  "CIV-PNT-01": ["mat-pnt-01", "srv-pnt-lay", "painting works", "painting", "interior emulsion + exterior weather shield"],
  "MAT-PNT-01": ["painting works", "painting", "interior emulsion + exterior weather shield"],
  "CIV-FCL-01": ["false ceiling works", "false ceiling", "gypsum ceiling", "pop ceiling"],
  "CIV-ELE-01": ["electrical + external lighting", "electrical works", "electrical", "lighting", "distribution board", "mcb"],
  "CIV-PLB-01": ["plumbing works", "plumbing", "cp fittings", "sanitaryware", "cpvc piping"],
  "CIV-WTP-01": ["waterproofing works", "waterproofing", "terrace waterproofing", "toilet waterproofing"],
  "CIV-SMP-01": ["underground sump", "concrete sump", "water sump"],
  "CIV-OHT-01": ["overhead tank", "water tank", "hdpe tank", "oht"],
  "CIV-CCTV-01": ["cctv installation", "cctv", "security camera", "hd camera"],
  "CIV-CWD-01": ["compound wall + gate", "compound wall", "main gate", "paver blocks", "landscaping"],
  "CIV-TRC-01": ["terrace canopy", "party hall", "canopy"],
  "CIV-INT-01": ["all interiors", "interiors", "cabinets", "wardrobes", "modular kitchen"],
  "CIV-ELE-01": ["civ-ele-01", "el01", "ele-conn-01", "temporary & permanent electrical connection", "service cable", "meter board", "cutouts"],
  "EL01": ["civ-ele-01", "el01", "ele-conn-01", "temporary & permanent electrical connection", "service cable", "meter board", "cutouts"],
  "EL02": ["el02", "ele-cnd-01", "pvc conduits & accessories", "pvc conduits", "conduit"],
  "EL03": ["el03", "ele-swt-01", "modular switches, plates & sockets", "modular switches", "anchor modular", "northwest modular"],
  "EL04": ["el04", "ele-wir-01", "all wires (lighting, power, ac, main)", "frls copper wires", "copper wire", "1.5 sqmm", "2.5 sqmm"],
  "EL05": ["el05", "ele-lgt-01", "all lights (bulbs, battens, panels)", "led bulbs", "battens", "panel lights"],
  "CIV-ELE-02": ["civ-ele-02", "el06", "ele-mcb-01", "distribution boards & mcbs", "db boxes", "copper busbars", "mcbs"],
  "EL06": ["civ-ele-02", "el06", "ele-mcb-01", "distribution boards & mcbs", "db boxes", "copper busbars", "mcbs"],
  "EL07": ["el07", "ele-fit-01", "light fittings (decorative, ceiling, wall)", "chandeliers", "ceiling lights", "wall brackets"],
  "CIV-ELE-03": ["civ-ele-03", "el08", "ele-app-01", "electrical appliances (fans, geysers, ac units)", "ceiling fans", "exhaust fans", "geysers", "ac units"],
  "EL08": ["civ-ele-03", "el08", "ele-app-01", "electrical appliances (fans, geysers, ac units)", "ceiling fans", "exhaust fans", "geysers", "ac units"],
  "EL09": ["el09", "ele-eth-01", "earthing (plate/rod type)", "gi plate", "rod type", "earthing"],
  "EL10": ["el10", "ele-ups-01", "inverter/ups & battery", "ups unit", "batteries", "inverter"],
  "PLB01": ["civ-plb-01", "plb01", "water supply piping", "cpvc water supply", "upvc water supply"],
  "PLB02": ["civ-plb-02", "plb02", "sanitary piping", "pvc soil & waste", "swr upvc"],
  "PLB03": ["civ-plb-03", "plb03", "internal water supply points", "water supply points"],
  "PLB04": ["civ-plb-04", "plb04", "toilet fittings", "wc", "ewc", "washbasin"],
  "PLB05": ["civ-plb-05", "plb05", "kitchen sink & cp fittings", "kitchen sink", "cp fittings"],
  "PLB06": ["civ-plb-06", "plb06", "geyser & hot water line points", "hot water line"],
  "PLB07": ["civ-plb-07", "plb07", "overhead syntex tank", "overhead tank 0.5l"],
  "PLB08": ["civ-plb-08", "plb08", "1 hp pump installation", "water pump"],
  "PLB09": ["civ-plb-09", "plb09", "water level controller", "automatic level controller"],
  "PLB10": ["civ-plb-10", "plb10", "solar water heater", "150 lpd solar"],
  "PLB11": ["civ-plb-11", "plb11", "cauvery water connection", "municipal water connection"],
  "PLB12": ["civ-plb-12", "plb12", "drainage lines", "external pvc stoneware"],
  "PLB13": ["civ-plb-13", "plb13", "rainwater downpipes", "rainwater downpipes & connections"],
  "PLB14": ["civ-plb-14", "plb14", "manholes & chambers", "inspection chambers", "septic tank chamber"],
  "PLB15": ["civ-plb-15", "plb15", "testing & commissioning", "water supply sanitary testing"],
  "PNT-01": ["pnt-01", "wall putty", "putty"],
  "PNT-02": ["pnt-02", "interior primer", "primer coat"],
  "PNT-03": ["pnt-03", "interior paint", "interior emulsion"],
  "PNT-04": ["pnt-04", "exterior paint", "weather coat"],
  "PNT-05": ["pnt-05", "ceiling paint", "ceiling emulsion"],
  "PNT-06": ["pnt-06", "enamel paint", "door enamel"],
  "PNT-07": ["pnt-07", "sand paper"],
  "PNT-08": ["pnt-08", "masking tape"],
  "PNT-09": ["pnt-09", "scaffolding"],
  "PNT-10": ["pnt-10", "painting finishing", "cleaning"],
  "PNT-11": ["pnt-11", "wood polishing", "pu polish", "melamyne polish"],
  "PNT-12": ["pnt-12", "texture paint", "wall texture"],
  "PNT-13": ["pnt-13", "royale paint", "luxury accent paint"]
};

export const DEFAULT_CIVIL_MASTER_RATES: any[] = [
  { code: "MAT-CEM-01", masterItemCode: "MAT-CEM-01", itemCode: "MAT-CEM-01", itemName: "Cement OPC 53 Grade", category: "Substructure & Superstructure", unit: "BAG", rate: 410, currentRate: 410, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-STL-01", masterItemCode: "MAT-STL-01", itemCode: "MAT-STL-01", itemName: "Reinforcement Steel", category: "Reinforcement Steel", unit: "KG", rate: 67, currentRate: 67, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-MSND-01", masterItemCode: "MAT-MSND-01", itemCode: "MAT-MSND-01", itemName: "M-Sand", category: "Aggregates & Mortar", unit: "CFT", rate: 48, currentRate: 48, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-AGG-01", masterItemCode: "MAT-AGG-01", itemCode: "MAT-AGG-01", itemName: "Aggregates CA-1 & CA-2", category: "Aggregates & Mortar", unit: "CFT", rate: 42, currentRate: 42, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-AGG-12", masterItemCode: "MAT-AGG-12", itemCode: "MAT-AGG-12", itemName: "Aggregates CA-1 & CA-2", category: "Aggregates & Mortar", unit: "CFT", rate: 42, currentRate: 42, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-CLR-01", masterItemCode: "CIV-CLR-01", itemCode: "CIV-CLR-01", itemName: "Site Clearing", category: "Earthwork & Site Prep", unit: "SQFT", rate: 20, currentRate: 20, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-FND-01", masterItemCode: "CIV-FND-01", itemCode: "CIV-FND-01", itemName: "Foundation + Damp Proof Course", category: "Substructure & Foundation", unit: "SQFT", rate: 45, currentRate: 45, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-FND-CON", masterItemCode: "CIV-FND-CON", itemCode: "CIV-FND-CON", itemName: "Foundation + Damp Proof Course", category: "Substructure & Foundation", unit: "SQFT", rate: 45, currentRate: 45, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-RCC-01", masterItemCode: "CIV-RCC-01", itemCode: "CIV-RCC-01", itemName: "All RCC Concrete Works", category: "Superstructure Concrete", unit: "CUM", rate: 4850, currentRate: 4850, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-MAS-01", masterItemCode: "CIV-MAS-01", itemCode: "CIV-MAS-01", itemName: "Masonry Walls", category: "Masonry Construction", unit: "NOS", rate: 42, currentRate: 42, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-BLK-01", masterItemCode: "MAT-BLK-01", itemCode: "MAT-BLK-01", itemName: "Masonry Walls", category: "Masonry Construction", unit: "NOS", rate: 42, currentRate: 42, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-PLS-01", masterItemCode: "CIV-PLS-01", itemCode: "CIV-PLS-01", itemName: "All Plastering", category: "Wall & Ceiling Finishes", unit: "SQFT", rate: 48, currentRate: 48, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-PLS-01", masterItemCode: "MAT-PLS-01", itemCode: "MAT-PLS-01", itemName: "All Plastering", category: "Wall & Ceiling Finishes", unit: "SQFT", rate: 48, currentRate: 48, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-FLR-01", masterItemCode: "CIV-FLR-01", itemCode: "CIV-FLR-01", itemName: "Flooring + Kitchen Platform", category: "Flooring & Surfaces", unit: "SQFT", rate: 85, currentRate: 85, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-GRN-01", masterItemCode: "MAT-GRN-01", itemCode: "MAT-GRN-01", itemName: "Flooring + Kitchen Platform", category: "Flooring & Surfaces", unit: "SQFT", rate: 85, currentRate: 85, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-WND-01", masterItemCode: "CIV-WND-01", itemCode: "CIV-WND-01", itemName: "Windows & Doors", category: "Doors & Windows", unit: "SQFT", rate: 680, currentRate: 680, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-GRL-01", masterItemCode: "CIV-GRL-01", itemCode: "CIV-GRL-01", itemName: "Grills & Railings", category: "Metal Fabrication", unit: "SQFT", rate: 120, currentRate: 120, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-PNT-01", masterItemCode: "CIV-PNT-01", itemCode: "CIV-PNT-01", itemName: "Painting Works", category: "Painting & Protective Coatings", unit: "SQFT", rate: 35, currentRate: 35, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-PNT-01", masterItemCode: "MAT-PNT-01", itemCode: "MAT-PNT-01", itemName: "Painting Works", category: "Painting & Protective Coatings", unit: "SQFT", rate: 35, currentRate: 35, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-FCL-01", masterItemCode: "CIV-FCL-01", itemCode: "CIV-FCL-01", itemName: "False Ceiling Works", category: "Ceiling & Joinery", unit: "SQFT", rate: 65, currentRate: 65, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-ELE-01", masterItemCode: "CIV-ELE-01", itemCode: "CIV-ELE-01", itemName: "Temporary & Permanent Electrical Connection", category: "MEP Services - Electrical", unit: "LS", rate: 50000, currentRate: 50000, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-ELE-02", masterItemCode: "CIV-ELE-02", itemCode: "CIV-ELE-02", itemName: "Distribution Boards & MCBs", category: "MEP Services - Electrical", unit: "NOS", rate: 3200, currentRate: 3200, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-ELE-03", masterItemCode: "CIV-ELE-03", itemCode: "CIV-ELE-03", itemName: "Electrical Appliances (Fans, Geysers, AC Units)", category: "MEP Services - Electrical", unit: "NOS", rate: 950, currentRate: 950, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-PLB-01", masterItemCode: "CIV-PLB-01", itemCode: "CIV-PLB-01", itemName: "Plumbing Works", category: "MEP Services - Plumbing", unit: "SQFT", rate: 120, currentRate: 120, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-WTP-01", masterItemCode: "CIV-WTP-01", itemCode: "CIV-WTP-01", itemName: "Waterproofing Works", category: "Waterproofing & Insulation", unit: "SQFT", rate: 42, currentRate: 42, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-SMP-01", masterItemCode: "CIV-SMP-01", itemCode: "CIV-SMP-01", itemName: "Underground Sump", category: "Water Storage Systems", unit: "LTR", rate: 9.5, currentRate: 9.5, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-OHT-01", masterItemCode: "CIV-OHT-01", itemCode: "CIV-OHT-01", itemName: "Overhead Tank", category: "Water Storage Systems", unit: "LTR", rate: 6.5, currentRate: 6.5, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-CCTV-01", masterItemCode: "CIV-CCTV-01", itemCode: "CIV-CCTV-01", itemName: "CCTV Installation", category: "Security & Automation", unit: "NOS", rate: 3500, currentRate: 3500, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-CWD-01", masterItemCode: "CIV-CWD-01", itemCode: "CIV-CWD-01", itemName: "Compound Wall + Gate + External Paving + Landscaping", category: "External & Site Infra", unit: "SQFT", rate: 160, currentRate: 160, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-TRC-01", masterItemCode: "CIV-TRC-01", itemCode: "CIV-TRC-01", itemName: "Terrace Canopy / Party Hall", category: "Special Structures", unit: "SQFT", rate: 480, currentRate: 480, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-INT-01", masterItemCode: "CIV-INT-01", itemCode: "CIV-INT-01", itemName: "All Interiors", category: "Interior Works", unit: "SQFT", rate: 950, currentRate: 950, isActive: true, source: "BuildMitra Approved" },
  // Electrical 10 Line Items Benchmark Defaults (Calibrated to ₹135/sqft baseline)
  { code: "EL01", masterItemCode: "EL01", itemCode: "EL01", itemName: "Temporary & Permanent Electrical Connection", category: "MEP Services - Electrical", unit: "LS", rate: 50000, currentRate: 50000, isActive: true, source: "BuildMitra Approved" },
  { code: "EL02", masterItemCode: "EL02", itemCode: "EL02", itemName: "PVC Conduits & Accessories", category: "MEP Services - Electrical", unit: "M", rate: 25, currentRate: 25, isActive: true, source: "BuildMitra Approved" },
  { code: "EL03", masterItemCode: "EL03", itemCode: "EL03", itemName: "Modular Switches, Plates & Sockets", category: "MEP Services - Electrical", unit: "NOS", rate: 140, currentRate: 140, isActive: true, source: "BuildMitra Approved" },
  { code: "EL04", masterItemCode: "EL04", itemCode: "EL04", itemName: "All Wires (Lighting, Power, AC, Main)", category: "MEP Services - Electrical", unit: "M", rate: 28, currentRate: 28, isActive: true, source: "BuildMitra Approved" },
  { code: "EL05", masterItemCode: "EL05", itemCode: "EL05", itemName: "All Lights (Bulbs, Battens, Panels)", category: "MEP Services - Electrical", unit: "NOS", rate: 220, currentRate: 220, isActive: true, source: "BuildMitra Approved" },
  { code: "EL06", masterItemCode: "EL06", itemCode: "EL06", itemName: "Distribution Boards & MCBs", category: "MEP Services - Electrical", unit: "NOS", rate: 3200, currentRate: 3200, isActive: true, source: "BuildMitra Approved" },
  { code: "EL07", masterItemCode: "EL07", itemCode: "EL07", itemName: "Light Fittings (Decorative, Ceiling, Wall)", category: "MEP Services - Electrical", unit: "NOS", rate: 550, currentRate: 550, isActive: true, source: "BuildMitra Approved" },
  { code: "EL08", masterItemCode: "EL08", itemCode: "EL08", itemName: "Electrical Appliances (Fans, Geysers, AC Units)", category: "MEP Services - Electrical", unit: "NOS", rate: 950, currentRate: 950, isActive: true, source: "BuildMitra Approved" },
  { code: "EL09", masterItemCode: "EL09", itemCode: "EL09", itemName: "Earthing (Plate/Rod Type)", category: "MEP Services - Electrical", unit: "SET", rate: 3500, currentRate: 3500, isActive: true, source: "BuildMitra Approved" },
  { code: "EL10", masterItemCode: "EL10", itemCode: "EL10", itemName: "Inverter/UPS & Battery", category: "MEP Services - Electrical", unit: "SET", rate: 21000, currentRate: 21000, isActive: true, source: "BuildMitra Approved" },
  // Plumbing 15 Line Items Benchmark Defaults (Calibrated to ₹120/sqft baseline)
  { code: "PLB01", masterItemCode: "PLB01", itemCode: "PLB01", itemName: "Water Supply Piping (CPVC/UPVC)", category: "MEP Services - Plumbing", unit: "M", rate: 26, currentRate: 26, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB02", masterItemCode: "PLB02", itemCode: "PLB02", itemName: "Sanitary Piping (PVC Soil & Waste)", category: "MEP Services - Plumbing", unit: "M", rate: 22, currentRate: 22, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB03", masterItemCode: "PLB03", itemCode: "PLB03", itemName: "Internal Water Supply Points (Kitchen & Bathrooms)", category: "MEP Services - Plumbing", unit: "POINTS", rate: 1250, currentRate: 1250, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB04", masterItemCode: "PLB04", itemCode: "PLB04", itemName: "Toilet Fittings (WC, EWC, Washbasin, CP Fittings)", category: "MEP Services - Plumbing", unit: "SET", rate: 11500, currentRate: 11500, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB05", masterItemCode: "PLB05", itemCode: "PLB05", itemName: "Kitchen Sink & CP Fittings", category: "MEP Services - Plumbing", unit: "SET", rate: 6500, currentRate: 6500, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB06", masterItemCode: "PLB06", itemCode: "PLB06", itemName: "Geyser & Hot Water Line Points", category: "MEP Services - Plumbing", unit: "POINTS", rate: 2800, currentRate: 2800, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB07", masterItemCode: "PLB07", itemCode: "PLB07", itemName: "Overhead Syntex Tank (0.5 L per sqft capacity)", category: "MEP Services - Plumbing", unit: "LTR", rate: 8.5, currentRate: 8.5, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB08", masterItemCode: "PLB08", itemCode: "PLB08", itemName: "1 HP Pump Installation", category: "MEP Services - Plumbing", unit: "SET", rate: 11500, currentRate: 11500, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB09", masterItemCode: "PLB09", itemCode: "PLB09", itemName: "Water Level Controller", category: "MEP Services - Plumbing", unit: "SET", rate: 3800, currentRate: 3800, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB10", masterItemCode: "PLB10", itemCode: "PLB10", itemName: "Solar Water Heater (150 LPD)", category: "MEP Services - Plumbing", unit: "SET", rate: 28000, currentRate: 28000, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB11", masterItemCode: "PLB11", itemCode: "PLB11", itemName: "Cauvery Water Connection (Main Line + Meter)", category: "MEP Services - Plumbing", unit: "LS", rate: 25000, currentRate: 25000, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB12", masterItemCode: "PLB12", itemCode: "PLB12", itemName: "Drainage Lines (External PVC/Stoneware)", category: "MEP Services - Plumbing", unit: "M", rate: 22, currentRate: 22, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB13", masterItemCode: "PLB13", itemCode: "PLB13", itemName: "Rainwater Downpipes & Connections", category: "MEP Services - Plumbing", unit: "M", rate: 14, currentRate: 14, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB14", masterItemCode: "PLB14", itemCode: "PLB14", itemName: "Manholes & Chambers (Inspection/Septic)", category: "MEP Services - Plumbing", unit: "NOS", rate: 1800, currentRate: 1800, isActive: true, source: "BuildMitra Approved" },
  { code: "PLB15", masterItemCode: "PLB15", itemCode: "PLB15", itemName: "Testing & Commissioning (Water Supply + Sanitary)", category: "MEP Services - Plumbing", unit: "LS", rate: 5000, currentRate: 5000, isActive: true, source: "BuildMitra Approved" },
  // Painting 13 Line Items Benchmark Defaults
  { code: "PNT-01", masterItemCode: "PNT-01", itemCode: "PNT-01", itemName: "Wall Putty (2 Coats)", category: "Painting & Protective Coatings", unit: "KG", rate: 28, currentRate: 28, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-02", masterItemCode: "PNT-02", itemCode: "PNT-02", itemName: "Interior Primer Coat", category: "Painting & Protective Coatings", unit: "LTR", rate: 120, currentRate: 120, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-03", masterItemCode: "PNT-03", itemCode: "PNT-03", itemName: "Interior Emulsion Paint (2 Coats)", category: "Painting & Protective Coatings", unit: "LTR", rate: 220, currentRate: 220, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-04", masterItemCode: "PNT-04", itemCode: "PNT-04", itemName: "Exterior Weather Coat Paint", category: "Painting & Protective Coatings", unit: "LTR", rate: 280, currentRate: 280, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-05", masterItemCode: "PNT-05", itemCode: "PNT-05", itemName: "Ceiling Tractor Emulsion Paint", category: "Painting & Protective Coatings", unit: "LTR", rate: 180, currentRate: 180, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-06", masterItemCode: "PNT-06", itemCode: "PNT-06", itemName: "Enamel Paint for Doors & Windows", category: "Painting & Protective Coatings", unit: "LTR", rate: 260, currentRate: 260, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-07", masterItemCode: "PNT-07", itemCode: "PNT-07", itemName: "Sand Paper Sheets", category: "Painting Accessories", unit: "NOS", rate: 12, currentRate: 12, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-08", masterItemCode: "PNT-08", itemCode: "PNT-08", itemName: "Masking Tape & Protective Rolls", category: "Painting Accessories", unit: "ROLL", rate: 80, currentRate: 80, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-09", masterItemCode: "PNT-09", itemCode: "PNT-09", itemName: "Scaffolding & Ladder Support Hire", category: "Painting Services", unit: "LS", rate: 2500, currentRate: 2500, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-10", masterItemCode: "PNT-10", itemCode: "PNT-10", itemName: "Final Touchup & Site Cleaning", category: "Painting Services", unit: "LS", rate: 1500, currentRate: 1500, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-11", masterItemCode: "PNT-11", itemCode: "PNT-11", itemName: "Wood & Door Polishing (PU / Melamyne Finish)", category: "Painting & Protective Coatings", unit: "SQFT", rate: 45, currentRate: 45, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-12", masterItemCode: "PNT-12", itemCode: "PNT-12", itemName: "Feature Wall Texture Paint (10% of BUA Coverage)", category: "Painting & Protective Coatings", unit: "SQFT", rate: 65, currentRate: 65, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT-13", masterItemCode: "PNT-13", itemCode: "PNT-13", itemName: "Royale / Luxury Accent Wall Emulsion Paint (10% of BUA Coverage)", category: "Painting & Protective Coatings", unit: "SQFT", rate: 38, currentRate: 38, isActive: true, source: "BuildMitra Approved" }
];

export const getMasterRate = (
  keywords: string[],
  fallback: number = 0,
  stores: string[] = ["bm_material_rates", "bm_labour_rates", "bm_service_rates", "bm_equipment_rates"]
): MasterRateResult => {
  const customRows = stores.flatMap((store) =>
    readArray(store).map((row) => ({ ...row, __store: store }))
  );

  const rows = [...customRows, ...DEFAULT_CIVIL_MASTER_RATES];

  let cleanKeywords = keywords.map(k => String(k).trim().toLowerCase()).filter(Boolean);

  // Check canonical aliases and expand cleanKeywords with target master code
  Object.entries(CANONICAL_ALIAS_MAP).forEach(([masterCode, aliases]) => {
    if (cleanKeywords.some(k => aliases.some(alias => k.includes(alias) || alias.includes(k)))) {
      cleanKeywords.push(masterCode.toLowerCase());
    }
  });

  // Priority 1: Exact Master Item Code match
  let found = rows.find((row) => {
    const rowCode = String(row.code || row.masterItemCode || row.itemCode || "").trim().toLowerCase();
    return rowCode && cleanKeywords.includes(rowCode) && Number(row.rate || row.currentRate || row.referenceRate || row.price || 0) > 0 && row.isActive !== false;
  });

  // Priority 2: Canonical Name or Alias search match
  if (!found) {
    found = rows.find((row) => {
      if (row.isActive === false) return false;
      const searchable = [
        row.code,
        row.masterItemCode,
        row.itemCode,
        row.item,
        row.itemName,
        row.material,
        row.materialName,
        row.productName,
        row.service,
        row.trade,
        row.category,
        row.subCategory,
        row.module,
        row.name
      ].filter(Boolean).join(" ").toLowerCase();

      return cleanKeywords.some((k) => searchable.includes(k)) && Number(row.rate || row.currentRate || row.referenceRate || row.price || 0) > 0;
    });
  }

  if (!found) {
    return {
      rate: fallback,
      found: fallback > 0,
      source: fallback > 0 ? "Benchmark Rate" : "Rate Pending Admin Update",
      matchedName: "Rate Unavailable in Admin Master",
      status: fallback > 0 ? "approved" : "Rate Pending Admin Update"
    };
  }

  const rateValue = Number(found.rate || found.currentRate || found.referenceRate || found.price || fallback);

  return {
    rate: rateValue > 0 ? rateValue : fallback,
    found: rateValue > 0,
    source: found.source || found.__store || "BuildMitra Admin Master Rate",
    matchedName: String(found.item || found.itemName || found.material || found.service || found.trade || found.name || ""),
    itemCode: String(found.code || found.masterItemCode || found.itemCode || ""),
    unit: normalizeUnit(found.unit),
    city: found.city || "Bengaluru",
    status: rateValue > 0 ? "approved" : "Rate Pending Admin Update"
  };
};

export const rateStatusMessage = (rates: Record<string, MasterRateResult>) => {
  const missing = Object.entries(rates).filter(([, value]) => !value.found).map(([key]) => key);
  if (!missing.length) return "";
  return `Rate Pending Admin Update for: ${missing.join(", ")}.`;
};

export type CombinedRateResult = {
  primaryCode: string;
  linkedLabourCode: string;
  materialRate: number;
  labourRate: number;
  totalUnitRate: number;
  matFound: boolean;
  labFound: boolean;
};

export const getCombinedBOQRate = (
  primaryCode: string,
  fallbackMat: number = 0,
  fallbackLab: number = 0,
  linkedLabourCode?: string
): CombinedRateResult => {
  const code = String(primaryCode || "").toUpperCase();
  const labCode = (linkedLabourCode || `LAB-${code.replace(/^(MAT|SRV|SER|PLB|ELEC|FCL)-?/, "")}`).toUpperCase();

  const matResult = getMasterRate([code], fallbackMat);
  const labResult = getMasterRate([labCode], fallbackLab);

  const materialRate = matResult.rate;
  const labourRate = labResult.rate;

  return {
    primaryCode: code,
    linkedLabourCode: labCode,
    materialRate,
    labourRate,
    totalUnitRate: materialRate + labourRate,
    matFound: matResult.found,
    labFound: labResult.found
  };
};

export const syncApprovedRatesFromBackend = async (
  apiBase: string = getApiBase()
): Promise<{ success: boolean; count: number; error?: string }> => {
  if (typeof window === "undefined") return { success: false, count: 0, error: "Browser only" };

  try {
    const res = await fetch(`${apiBase}/api/rates/approved`);
    if (!res.ok) throw new Error(`Rate API failed: ${res.status}`);

    const data = await res.json();
    const list = Array.isArray(data) ? data : data.rates || data.data || [];

    const materialRates: any[] = [];
    const labourRates: any[] = [];
    const serviceRates: any[] = [];
    const equipmentRates: any[] = [];

    list.forEach((r: any) => {
      if (r.isActive === false || r.approvalStatus === "rejected") return;

      const category = String(r.category || "").toLowerCase();
      const code = r.masterItemCode || r.itemCode || r.code || "";
      const itemName = r.itemName || r.item_name || r.item || r.name || "";
      const currentRate = Number(r.currentRate || r.referenceRate || r.rate || r.price || 0);

      if (!currentRate || currentRate <= 0) return;

      const row = {
        code,
        masterItemCode: code,
        itemCode: code,
        item: itemName,
        itemName,
        category: r.category || "",
        subCategory: r.subCategory || "",
        specification: r.specification || "",
        unit: normalizeUnit(r.unit),
        rate: currentRate,
        currentRate,
        previousRate: Number(r.previousRate || currentRate),
        gst: Number(r.gst || 0),
        city: r.city || "Bengaluru",
        state: r.state || "Karnataka",
        source: r.sourceType || "admin_manual",
        isActive: true
      };

      if (r.itemType === "labour" || category.includes("labour")) {
        labourRates.push(row);
      } else if (r.itemType === "service" || category.includes("service")) {
        serviceRates.push(row);
      } else if (r.itemType === "equipment" || category.includes("equipment")) {
        equipmentRates.push(row);
      } else {
        materialRates.push(row);
      }
    });

    localStorage.setItem("bm_material_rates", JSON.stringify(materialRates));
    localStorage.setItem("bm_labour_rates", JSON.stringify(labourRates));
    localStorage.setItem("bm_service_rates", JSON.stringify(serviceRates));
    localStorage.setItem("bm_equipment_rates", JSON.stringify(equipmentRates));

    return { success: true, count: list.length };
  } catch (err: any) {
    console.warn("Failed to sync approved rates from backend:", err.message);
    return { success: false, count: 0, error: err.message };
  }
};

export async function resolveModuleBulkRates(
  items: Array<{ masterItemCode?: string; itemName: string; itemType: string; unit: string; category?: string }>,
  city = "Bengaluru",
  apiBase = getApiBase()
) {
  try {
    const res = await fetch(`${apiBase}/api/rates/resolve-bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, items })
    });
    const data = await res.json();
    if (data && data.success && Array.isArray(data.resolvedItems)) {
      return data.resolvedItems;
    }
  } catch (err) {
    console.warn("Bulk rate resolution failed, using fallback:", err);
  }
  return items.map(item => ({
    masterItemCode: item.masterItemCode || "PENDING",
    itemName: item.itemName,
    itemType: item.itemType,
    unit: item.unit,
    resolvedRate: 0,
    rateSource: "pending_admin_update",
    city,
    effectiveDate: new Date().toISOString().split("T")[0],
    status: "Rate Pending Admin Update"
  }));
}

