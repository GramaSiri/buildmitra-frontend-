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
  "CIV-ELE01": ["civ-ele01", "civ-ele-sqft", "civ-ele-01", "electrical works sqft", "electrical allowance"],
  "CIV-PLB01": ["civ-plb01", "civ-plb-01", "plumbing works sqft", "plumbing allowance"],
  "CIV-WTP-01": ["waterproofing works", "waterproofing", "terrace waterproofing", "toilet waterproofing"],
  "CIV-SMP-01": ["underground sump", "concrete sump", "water sump"],
  "CIV-OHT-01": ["overhead tank", "water tank", "hdpe tank", "oht"],
  "CIV-CCTV-01": ["cctv installation", "cctv", "security camera", "hd camera"],
  "CIV-CWD-01": ["compound wall + gate", "compound wall", "main gate", "paver blocks", "landscaping"],
  "CIV-TRC-01": ["terrace canopy", "party hall", "canopy"],
  "CIV-INT-01": ["all interiors", "interiors", "cabinets", "wardrobes", "modular kitchen"],
  "EL01": ["el01", "ele-conn-01", "temporary & permanent electrical connection", "service cable"],
  "EL02": ["el02", "ele-cnd-01", "pvc conduits & accessories"],
  "EL03": ["el03", "ele-swt-01", "modular switches, plates & sockets"],
  "EL04": ["el04", "ele-wir-01", "all wires (lighting, power, ac, main)"],
  "EL05": ["el05", "ele-lgt-01", "all lights (bulbs, battens, panels)"],
  "EL06": ["el06", "ele-mcb-01", "distribution boards & mcbs"],
  "EL07": ["el07", "ele-fit-01", "light fittings (decorative, ceiling, wall)"],
  "EL08": ["el08", "ele-app-01", "electrical appliances (fans, geysers, ac units)"],
  "EL09": ["el09", "ele-eth-01", "earthing (plate/rod type)"],
  "EL10": ["el10", "ele-ups-01", "inverter/ups & battery"],
  "PLB01": ["plb01", "water supply piping"],
  "PLB02": ["plb02", "sanitary piping"],
  "PLB03": ["plb03", "internal water supply points"],
  "PLB04": ["plb04", "toilet fittings"],
  "PLB05": ["plb05", "kitchen sink & cp fittings"],
  "PLB06": ["plb06", "geyser & hot water line points"],
  "PLB07": ["plb07", "overhead syntex tank"],
  "PLB08": ["plb08", "1 hp pump installation"],
  "PLB09": ["plb09", "water level controller"],
  "PLB10": ["plb10", "solar water heater"],
  "PLB11": ["plb11", "cauvery water connection"],
  "PLB12": ["plb12", "drainage lines"],
  "PLB13": ["plb13", "rainwater downpipes"],
  "PLB14": ["plb14", "manholes & chambers"],
  "PLB15": ["plb15", "testing & commissioning"],
  "PNT01": ["pnt01", "pnt-01", "wall putty"],
  "PNT02": ["pnt02", "pnt-02", "interior primer"],
  "PNT03": ["pnt03", "pnt-03", "interior paint"],
  "PNT04": ["pnt04", "pnt-04", "exterior paint"],
  "PNT05": ["pnt05", "pnt-05", "ceiling paint"],
  "PNT06": ["pnt06", "pnt-06", "enamel paint"],
  "PNT07": ["pnt07", "pnt-07", "sand paper"],
  "PNT08": ["pnt08", "pnt-08", "masking tape"],
  "PNT09": ["pnt09", "pnt-09", "scaffolding"],
  "PNT10": ["pnt10", "pnt-10", "painting finishing"],
  "PNT11": ["pnt11", "pnt-11", "wood polishing"],
  "PNT12": ["pnt12", "pnt-12", "texture paint"],
  "PNT13": ["pnt13", "pnt-13", "royale paint"],
  "SRV-MAS-LAY": ["srv-mas-lay", "masonry laying labour", "brickwork labour", "blockwork labour"],
  "SRV-PLS-LAY": ["srv-pls-lay", "plastering laying labour", "plastering labour"],
  "SRV-RCC-LAY": ["srv-rcc-lay", "rcc casting labour", "concrete labour"],
  "SRV-COL-SHT": ["srv-col-sht", "column shuttering labour", "formwork labour", "shuttering labour"],
  "SRV-RET-SHT": ["srv-ret-sht", "retaining wall shuttering labour"],
  "SRV-TIL-LAY": ["srv-til-lay", "tile laying labour", "tile labour"],
  "SRV-GRN-LAY": ["srv-grn-lay", "granite laying labour", "stone labour"],
  "SRV-WOD-LAY": ["srv-wod-lay", "wooden flooring labour", "laminate labour"],
  "SRV-CLD-LAY": ["srv-cld-lay", "cladding labour", "elevation labour"],
  "SRV-SKT-LAY": ["srv-skt-lay", "skirting labour", "skirting fixing"],
  "SRV-STL-FAB": ["srv-stl-fab", "rebar fabrication labour", "steel tying labour"],
  "SRV-PNT-LAY": ["srv-pnt-lay", "painting laying labour", "painting labour"],
  "SRV-TRN-LAY": ["srv-trn-lay", "bescom deposit", "service main"],
  "LAB-MAS-01": ["lab-mas-01", "mason daily rate", "head mason"],
  "LAB-HLP-01": ["lab-hlp-01", "helper daily rate", "unskilled labour"],
  "LAB-CRP-01": ["lab-crp-01", "carpenter daily rate", "formwork carpenter"],
  "LAB-BAR-01": ["lab-bar-01", "bar bender daily rate", "steelfixer"],
  "LAB-ELE-01": ["lab-ele-01", "electrician daily rate"],
  "LAB-PLB-01": ["lab-plb-01", "plumber daily rate"],
  "LAB-PNT-01": ["lab-pnt-01", "painter daily rate"],
  "MAT-BRK-01": ["mat-brk-01", "clay brick", "red brick"],
  "MAT-BLK-04": ["mat-blk-04", "solid block 4", "concrete block 4"],
  "MAT-BLK-06": ["mat-blk-06", "solid block 6", "concrete block 6"],
  "MAT-AAC-01": ["mat-aac-01", "aac block", "lightweight block"],
  "MAT-MSH-01": ["mat-msh-01", "chicken mesh", "gi mesh"],
  "MAT-WPR-01": ["mat-wpr-01", "waterproofing chemical", "waterproofing admixture"],
  "MAT-VIT-01": ["mat-vit-01", "vitrified tiles", "vitrified"],
  "MAT-CER-01": ["mat-cer-01", "ceramic tiles", "ceramic"],
  "MAT-POR-01": ["mat-por-01", "porcelain tiles", "porcelain"],
  "MAT-PRK-01": ["mat-prk-01", "anti-skid tiles", "anti skid"],
  "MAT-PRK-02": ["mat-prk-02", "parking tiles", "paver tiles"],
  "MAT-STP-01": ["mat-stp-01", "staircase tiles", "step tiles"],
  "MAT-MRB-01": ["mat-mrb-01", "marble slab", "marble"],
  "MAT-KOT-01": ["mat-kot-01", "kota stone", "kota"],
  "MAT-TND-01": ["mat-tnd-01", "tandur stone", "tandur"],
  "MAT-WOD-01": ["mat-wod-01", "wooden flooring", "hardwood"],
  "MAT-LAM-01": ["mat-lam-01", "laminate flooring", "laminate"],
  "MAT-VNY-01": ["mat-vny-01", "vinyl flooring", "pvc flooring"],
  "MAT-SPC-01": ["mat-spc-01", "spc flooring", "rigid core"],
  "MAT-CLD-01": ["mat-cld-01", "wall cladding", "elevation stone"],
  "MAT-ADH-01": ["mat-adh-01", "tile adhesive", "adhesive"],
  "MAT-ADH-02": ["mat-adh-02", "stone adhesive", "granite adhesive"],
  "MAT-GRT-01": ["mat-grt-01", "tile grout", "grout"],
  "MAT-SPC-02": ["mat-spc-02", "tile spacers", "spacers"],
  "MAT-UND-01": ["mat-und-01", "underlay foam", "flooring pad"],
  "MAT-TRM-01": ["mat-trm-01", "floor trims", "skirting profile"],
  "MAT-PUT-01": ["mat-put-01", "pnt01", "wall putty", "putty"],
  "MAT-PRM-01": ["mat-prm-01", "pnt02", "wall primer", "primer"],
  "MAT-PNT-ROY": ["mat-pnt-roy", "pnt13", "royal paint", "premium paint"],
  "MAT-PNT-EXT": ["mat-pnt-ext", "pnt04", "exterior paint", "weatherproof paint"],
  "MAT-ELE-01": ["mat-ele-01", "electrical conduit", "light point"],
  "MAT-ELE-LGT": ["mat-ele-lgt", "light point wiring"],
  "MAT-ELE-6A": ["mat-ele-6a", "6a socket"],
  "MAT-ELE-16A": ["mat-ele-16a", "16a socket", "heavy power"],
  "MAT-ELE-DB": ["mat-ele-db", "distribution board", "db box"],
  "MAT-ELE-ETH": ["mat-ele-eth", "chemical earthing", "earth pit"],
  "MAT-PEB-PRM": ["mat-peb-prm", "solar pv", "solar panel"]
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
  { code: "CIV-ELE01", masterItemCode: "CIV-ELE01", itemCode: "CIV-ELE01", itemName: "Electrical & External Lighting Works", category: "MEP Services - Electrical", unit: "SQFT", rate: 135, currentRate: 135, isActive: true, source: "BuildMitra Approved" },
  { code: "CIV-PLB01", masterItemCode: "CIV-PLB01", itemCode: "CIV-PLB01", itemName: "Plumbing Works", category: "MEP Services - Plumbing", unit: "SQFT", rate: 120, currentRate: 120, isActive: true, source: "BuildMitra Approved" },
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
  { code: "PNT01", masterItemCode: "PNT01", itemCode: "PNT01", itemName: "Wall Putty (2 Coats)", category: "Painting & Protective Coatings", unit: "KG", rate: 28, currentRate: 28, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT02", masterItemCode: "PNT02", itemCode: "PNT02", itemName: "Interior Primer Coat", category: "Painting & Protective Coatings", unit: "LTR", rate: 120, currentRate: 120, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT03", masterItemCode: "PNT03", itemCode: "PNT03", itemName: "Interior Emulsion Paint (2 Coats)", category: "Painting & Protective Coatings", unit: "LTR", rate: 220, currentRate: 220, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT04", masterItemCode: "PNT04", itemCode: "PNT04", itemName: "Exterior Weather Coat Paint", category: "Painting & Protective Coatings", unit: "LTR", rate: 280, currentRate: 280, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT05", masterItemCode: "PNT05", itemCode: "PNT05", itemName: "Ceiling Tractor Emulsion Paint", category: "Painting & Protective Coatings", unit: "LTR", rate: 180, currentRate: 180, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT06", masterItemCode: "PNT06", itemCode: "PNT06", itemName: "Enamel Paint for Doors & Windows", category: "Painting & Protective Coatings", unit: "LTR", rate: 260, currentRate: 260, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT07", masterItemCode: "PNT07", itemCode: "PNT07", itemName: "Sand Paper Sheets", category: "Painting Accessories", unit: "NOS", rate: 12, currentRate: 12, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT08", masterItemCode: "PNT08", itemCode: "PNT08", itemName: "Masking Tape & Protective Rolls", category: "Painting Accessories", unit: "ROLL", rate: 80, currentRate: 80, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT09", masterItemCode: "PNT09", itemCode: "PNT09", itemName: "Scaffolding & Ladder Support Hire", category: "Painting Services", unit: "LS", rate: 2500, currentRate: 2500, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT10", masterItemCode: "PNT10", itemCode: "PNT10", itemName: "Final Touchup & Site Cleaning", category: "Painting Services", unit: "LS", rate: 1500, currentRate: 1500, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT11", masterItemCode: "PNT11", itemCode: "PNT11", itemName: "Wood & Door Polishing (PU / Melamyne Finish)", category: "Painting & Protective Coatings", unit: "SQFT", rate: 45, currentRate: 45, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT12", masterItemCode: "PNT12", itemCode: "PNT12", itemName: "Feature Wall Texture Paint (10% of BUA Coverage)", category: "Painting & Protective Coatings", unit: "SQFT", rate: 65, currentRate: 65, isActive: true, source: "BuildMitra Approved" },
  { code: "PNT13", masterItemCode: "PNT13", itemCode: "PNT13", itemName: "Royale / Luxury Accent Wall Emulsion Paint (10% of BUA Coverage)", category: "Painting & Protective Coatings", unit: "SQFT", rate: 38, currentRate: 38, isActive: true, source: "BuildMitra Approved" },
  // Labour & Services Items for Calculators
  { code: "SRV-MAS-LAY", masterItemCode: "SRV-MAS-LAY", itemCode: "SRV-MAS-LAY", itemName: "Masonry Laying Labour", category: "Labour & Services", unit: "CFT", rate: 45, currentRate: 45, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-PLS-LAY", masterItemCode: "SRV-PLS-LAY", itemCode: "SRV-PLS-LAY", itemName: "Plastering Laying Labour", category: "Labour & Services", unit: "SQFT", rate: 18, currentRate: 18, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-RCC-LAY", masterItemCode: "SRV-RCC-LAY", itemCode: "SRV-RCC-LAY", itemName: "RCC Casting & Placement Labour", category: "Labour & Services", unit: "CUM", rate: 1200, currentRate: 1200, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-COL-SHT", masterItemCode: "SRV-COL-SHT", itemCode: "SRV-COL-SHT", itemName: "Column & Slab Shuttering Labour", category: "Labour & Services", unit: "SQFT", rate: 35, currentRate: 35, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-RET-SHT", masterItemCode: "SRV-RET-SHT", itemCode: "SRV-RET-SHT", itemName: "Retaining Wall Shuttering Labour", category: "Labour & Services", unit: "SQFT", rate: 45, currentRate: 45, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-TIL-LAY", masterItemCode: "SRV-TIL-LAY", itemCode: "SRV-TIL-LAY", itemName: "Tile Laying Labour", category: "Labour & Services", unit: "SQFT", rate: 35, currentRate: 35, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-GRN-LAY", masterItemCode: "SRV-GRN-LAY", itemCode: "SRV-GRN-LAY", itemName: "Granite / Marble Laying Labour", category: "Labour & Services", unit: "SQFT", rate: 55, currentRate: 55, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-WOD-LAY", masterItemCode: "SRV-WOD-LAY", itemCode: "SRV-WOD-LAY", itemName: "Wooden Flooring Installation Labour", category: "Labour & Services", unit: "SQFT", rate: 45, currentRate: 45, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-CLD-LAY", masterItemCode: "SRV-CLD-LAY", itemCode: "SRV-CLD-LAY", itemName: "Wall Cladding Installation Labour", category: "Labour & Services", unit: "SQFT", rate: 50, currentRate: 50, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-SKT-LAY", masterItemCode: "SRV-SKT-LAY", itemCode: "SRV-SKT-LAY", itemName: "Skirting Laying Labour", category: "Labour & Services", unit: "RFT", rate: 15, currentRate: 15, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-STL-FAB", masterItemCode: "SRV-STL-FAB", itemCode: "SRV-STL-FAB", itemName: "Rebar Fabrication & Tying Labour", category: "Labour & Services", unit: "KG", rate: 8, currentRate: 8, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-PNT-LAY", masterItemCode: "SRV-PNT-LAY", itemCode: "SRV-PNT-LAY", itemName: "Painting Laying Labour", category: "Labour & Services", unit: "SQFT", rate: 12, currentRate: 12, isActive: true, source: "BuildMitra Approved" },
  { code: "SRV-TRN-LAY", masterItemCode: "SRV-TRN-LAY", itemCode: "SRV-TRN-LAY", itemName: "Electrical Transformer & Service Line Installation", category: "Labour & Services", unit: "LS", rate: 25000, currentRate: 25000, isActive: true, source: "BuildMitra Approved" },
  // Trade Daily Labour Rates
  { code: "LAB-MAS-01", masterItemCode: "LAB-MAS-01", itemCode: "LAB-MAS-01", itemName: "Head Mason Daily Labour Rate", category: "Trade Daily Labour Rates", unit: "DAY", rate: 1200, currentRate: 1200, isActive: true, source: "BuildMitra Approved" },
  { code: "LAB-HLP-01", masterItemCode: "LAB-HLP-01", itemCode: "LAB-HLP-01", itemName: "Helper / Labourer Daily Rate", category: "Trade Daily Labour Rates", unit: "DAY", rate: 700, currentRate: 700, isActive: true, source: "BuildMitra Approved" },
  { code: "LAB-CRP-01", masterItemCode: "LAB-CRP-01", itemCode: "LAB-CRP-01", itemName: "Carpenter / Shuttering Skilled Labour Daily Rate", category: "Trade Daily Labour Rates", unit: "DAY", rate: 1500, currentRate: 1500, isActive: true, source: "BuildMitra Approved" },
  { code: "LAB-BAR-01", masterItemCode: "LAB-BAR-01", itemCode: "LAB-BAR-01", itemName: "Bar Benders & Steelfixers Daily Rate", category: "Trade Daily Labour Rates", unit: "DAY", rate: 1400, currentRate: 1400, isActive: true, source: "BuildMitra Approved" },
  { code: "LAB-ELE-01", masterItemCode: "LAB-ELE-01", itemCode: "LAB-ELE-01", itemName: "Electrician Skilled Labour Daily Rate", category: "Trade Daily Labour Rates", unit: "DAY", rate: 1300, currentRate: 1300, isActive: true, source: "BuildMitra Approved" },
  { code: "LAB-PLB-01", masterItemCode: "LAB-PLB-01", itemCode: "LAB-PLB-01", itemName: "Plumber Skilled Labour Daily Rate", category: "Trade Daily Labour Rates", unit: "DAY", rate: 1300, currentRate: 1300, isActive: true, source: "BuildMitra Approved" },
  { code: "LAB-PNT-01", masterItemCode: "LAB-PNT-01", itemCode: "LAB-PNT-01", itemName: "Painter Skilled Labour Daily Rate", category: "Trade Daily Labour Rates", unit: "DAY", rate: 1100, currentRate: 1100, isActive: true, source: "BuildMitra Approved" },
  // Material Items for Calculators
  { code: "MAT-BRK-01", masterItemCode: "MAT-BRK-01", itemCode: "MAT-BRK-01", itemName: "Clay Modular Red Bricks", category: "Masonry Materials", unit: "NOS", rate: 10.5, currentRate: 10.5, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-BLK-04", masterItemCode: "MAT-BLK-04", itemCode: "MAT-BLK-04", itemName: "Concrete Solid Block 4 inch", category: "Masonry Materials", unit: "NOS", rate: 35, currentRate: 35, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-BLK-06", masterItemCode: "MAT-BLK-06", itemCode: "MAT-BLK-06", itemName: "Concrete Solid Block 6 inch", category: "Masonry Materials", unit: "NOS", rate: 45, currentRate: 45, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-AAC-01", masterItemCode: "MAT-AAC-01", itemCode: "MAT-AAC-01", itemName: "AAC Lightweight Block 6 inch", category: "Masonry Materials", unit: "NOS", rate: 65, currentRate: 65, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-MSH-01", masterItemCode: "MAT-MSH-01", itemCode: "MAT-MSH-01", itemName: "Chicken Wire GI Mesh for Joint Plastering", category: "Wall & Ceiling Finishes", unit: "SQFT", rate: 12, currentRate: 12, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-WPR-01", masterItemCode: "MAT-WPR-01", itemCode: "MAT-WPR-01", itemName: "Waterproofing Liquid Admixture", category: "Waterproofing & Insulation", unit: "LTR", rate: 145, currentRate: 145, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-VIT-01", masterItemCode: "MAT-VIT-01", itemCode: "MAT-VIT-01", itemName: "Vitrified Tiles (600x600mm / 800x800mm)", category: "Flooring & Surfaces", unit: "SQFT", rate: 65, currentRate: 65, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-CER-01", masterItemCode: "MAT-CER-01", itemCode: "MAT-CER-01", itemName: "Ceramic Floor / Wall Tiles", category: "Flooring & Surfaces", unit: "SQFT", rate: 45, currentRate: 45, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-POR-01", masterItemCode: "MAT-POR-01", itemCode: "MAT-POR-01", itemName: "Porcelain High Gloss Tiles", category: "Flooring & Surfaces", unit: "SQFT", rate: 75, currentRate: 75, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-PRK-01", masterItemCode: "MAT-PRK-01", itemCode: "MAT-PRK-01", itemName: "Anti-Skid Bathroom Tiles", category: "Flooring & Surfaces", unit: "SQFT", rate: 55, currentRate: 55, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-PRK-02", masterItemCode: "MAT-PRK-02", itemCode: "MAT-PRK-02", itemName: "Parking Paver Tiles", category: "Flooring & Surfaces", unit: "SQFT", rate: 48, currentRate: 48, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-STP-01", masterItemCode: "MAT-STP-01", itemCode: "MAT-STP-01", itemName: "Staircase Step & Riser Tiles", category: "Flooring & Surfaces", unit: "SQFT", rate: 70, currentRate: 70, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-MRB-01", masterItemCode: "MAT-MRB-01", itemCode: "MAT-MRB-01", itemName: "Marble Slab Flooring", category: "Flooring & Surfaces", unit: "SQFT", rate: 145, currentRate: 145, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-KOT-01", masterItemCode: "MAT-KOT-01", itemCode: "MAT-KOT-01", itemName: "Kota Stone Polished Slab", category: "Flooring & Surfaces", unit: "SQFT", rate: 42, currentRate: 42, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-TND-01", masterItemCode: "MAT-TND-01", itemCode: "MAT-TND-01", itemName: "Tandur Blue/Yellow Stone", category: "Flooring & Surfaces", unit: "SQFT", rate: 48, currentRate: 48, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-WOD-01", masterItemCode: "MAT-WOD-01", itemCode: "MAT-WOD-01", itemName: "Wooden Hardwood Parquet Flooring", category: "Flooring & Surfaces", unit: "SQFT", rate: 160, currentRate: 160, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-LAM-01", masterItemCode: "MAT-LAM-01", itemCode: "MAT-LAM-01", itemName: "Laminate Wooden Flooring", category: "Flooring & Surfaces", unit: "SQFT", rate: 95, currentRate: 95, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-VNY-01", masterItemCode: "MAT-VNY-01", itemCode: "MAT-VNY-01", itemName: "Vinyl PVC Sheet Flooring", category: "Flooring & Surfaces", unit: "SQFT", rate: 65, currentRate: 65, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-SPC-01", masterItemCode: "MAT-SPC-01", itemCode: "MAT-SPC-01", itemName: "SPC Stone Polymer Composite Flooring", category: "Flooring & Surfaces", unit: "SQFT", rate: 110, currentRate: 110, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-CLD-01", masterItemCode: "MAT-CLD-01", itemCode: "MAT-CLD-01", itemName: "Wall Cladding Elevation Stone", category: "Flooring & Surfaces", unit: "SQFT", rate: 85, currentRate: 85, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-ADH-01", masterItemCode: "MAT-ADH-01", itemCode: "MAT-ADH-01", itemName: "Tile Polymer Adhesive (20kg Bag)", category: "Flooring & Surfaces", unit: "BAG", rate: 380, currentRate: 380, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-ADH-02", masterItemCode: "MAT-ADH-02", itemCode: "MAT-ADH-02", itemName: "Stone Heavy Duty Adhesive (20kg Bag)", category: "Flooring & Surfaces", unit: "BAG", rate: 480, currentRate: 480, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-GRT-01", masterItemCode: "MAT-GRT-01", itemCode: "MAT-GRT-01", itemName: "Epoxy Tile Grout (1kg Pack)", category: "Flooring & Surfaces", unit: "NOS", rate: 220, currentRate: 220, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-SPC-02", masterItemCode: "MAT-SPC-02", itemCode: "MAT-SPC-02", itemName: "Tile Spacers & Levellers (Pack of 100)", category: "Flooring & Surfaces", unit: "NOS", rate: 65, currentRate: 65, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-UND-01", masterItemCode: "MAT-UND-01", itemCode: "MAT-UND-01", itemName: "Underlay Foam Cushioning Pad", category: "Flooring & Surfaces", unit: "SQFT", rate: 12, currentRate: 12, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-TRM-01", masterItemCode: "MAT-TRM-01", itemCode: "MAT-TRM-01", itemName: "Floor Transition Profile Trims", category: "Flooring & Surfaces", unit: "NOS", rate: 120, currentRate: 120, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-PUT-01", masterItemCode: "MAT-PUT-01", itemCode: "MAT-PUT-01", itemName: "Acrylic Water Resistant Wall Putty", category: "Painting & Protective Coatings", unit: "KG", rate: 28, currentRate: 28, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-PRM-01", masterItemCode: "MAT-PRM-01", itemCode: "MAT-PRM-01", itemName: "Interior Water-Based Wall Primer", category: "Painting & Protective Coatings", unit: "LTR", rate: 120, currentRate: 120, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-PNT-ROY", masterItemCode: "MAT-PNT-ROY", itemCode: "MAT-PNT-ROY", itemName: "Royale Luxury Emulsion Paint", category: "Painting & Protective Coatings", unit: "LTR", rate: 450, currentRate: 450, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-PNT-EXT", masterItemCode: "MAT-PNT-EXT", itemCode: "MAT-PNT-EXT", itemName: "Exterior Weather Shield Protection Paint", category: "Painting & Protective Coatings", unit: "LTR", rate: 280, currentRate: 280, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-ELE-01", masterItemCode: "MAT-ELE-01", itemCode: "MAT-ELE-01", itemName: "Electrical Point Wiring & Accessories", category: "MEP Services - Electrical", unit: "NOS", rate: 650, currentRate: 650, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-ELE-LGT", masterItemCode: "MAT-ELE-LGT", itemCode: "MAT-ELE-LGT", itemName: "Light & Fan Point Complete Wiring", category: "MEP Services - Electrical", unit: "NOS", rate: 650, currentRate: 650, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-ELE-6A", masterItemCode: "MAT-ELE-6A", itemCode: "MAT-ELE-6A", itemName: "6A Convenience Plug Socket Point", category: "MEP Services - Electrical", unit: "NOS", rate: 550, currentRate: 550, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-ELE-16A", masterItemCode: "MAT-ELE-16A", itemCode: "MAT-ELE-16A", itemName: "16A Heavy Power Socket Point (AC/Geyser)", category: "MEP Services - Electrical", unit: "NOS", rate: 950, currentRate: 950, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-ELE-DB", masterItemCode: "MAT-ELE-DB", itemCode: "MAT-ELE-DB", itemName: "Main Distribution Board Box with MCBs", category: "MEP Services - Electrical", unit: "NOS", rate: 3800, currentRate: 3800, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-ELE-ETH", masterItemCode: "MAT-ELE-ETH", itemCode: "MAT-ELE-ETH", itemName: "Chemical Pipe Earthing Pit Complete", category: "MEP Services - Electrical", unit: "NOS", rate: 4500, currentRate: 4500, isActive: true, source: "BuildMitra Approved" },
  { code: "MAT-PEB-PRM", masterItemCode: "MAT-PEB-PRM", itemCode: "MAT-PEB-PRM", itemName: "Rooftop Solar PV On-Grid System", category: "MEP Services - Electrical", unit: "KW", rate: 55000, currentRate: 55000, isActive: true, source: "BuildMitra Approved" }
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

  const rawInputs = keywords.map(k => String(k).trim().toLowerCase()).filter(Boolean);

  // Priority 0: Exact Direct Code Match (before any alias expansion)
  let directMatch = rows.find((row) => {
    if (row.isActive === false) return false;
    const rowCode = String(row.code || row.masterItemCode || row.itemCode || "").trim().toLowerCase();
    const rate = Number(row.rate || row.currentRate || row.referenceRate || row.price || 0);
    return rowCode && rawInputs.includes(rowCode) && rate > 0;
  });

  if (directMatch) {
    const rateValue = Number(directMatch.rate || directMatch.currentRate || directMatch.referenceRate || directMatch.price || fallback);
    return {
      rate: rateValue > 0 ? rateValue : fallback,
      found: rateValue > 0,
      source: directMatch.source || directMatch.__store || "BuildMitra Admin Master Rate",
      matchedName: String(directMatch.item || directMatch.itemName || directMatch.material || directMatch.service || directMatch.trade || directMatch.name || ""),
      itemCode: String(directMatch.code || directMatch.masterItemCode || directMatch.itemCode || ""),
      unit: normalizeUnit(directMatch.unit),
      city: directMatch.city || "Bengaluru",
      status: rateValue > 0 ? "approved" : "Rate Pending Admin Update"
    };
  }

  // Alias expansion on cleanKeywords if direct code match not hit
  let cleanKeywords = [...rawInputs];
  Object.entries(CANONICAL_ALIAS_MAP).forEach(([masterCode, aliases]) => {
    if (cleanKeywords.some(k => aliases.some(alias => k === alias.toLowerCase() || k.includes(alias.toLowerCase()) || alias.toLowerCase().includes(k)))) {
      cleanKeywords.push(masterCode.toLowerCase());
    }
  });

  // Priority 1: Exact Master Item Code match after alias expansion
  let found = rows.find((row) => {
    if (row.isActive === false) return false;
    const rowCode = String(row.code || row.masterItemCode || row.itemCode || "").trim().toLowerCase();
    const rate = Number(row.rate || row.currentRate || row.referenceRate || row.price || 0);
    return rowCode && cleanKeywords.includes(rowCode) && rate > 0;
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

