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
  "MAT-CEM-01": ["cement", "opc 53", "opc cement", "ppc cement", "portland cement"],
  "MAT-STL-01": ["tmt steel", "steel rebar", "fe 500d", "rebar", "reinforcement steel", "tmt bar", "tor steel"],
  "MAT-MSND-01": ["m-sand", "m sand", "manufactured sand", "crushed sand", "plastering sand"],
  "MAT-AGG-20": ["20mm aggregate", "20mm coarse aggregate", "coarse aggregate 20mm", "aggregate 20mm", "jelly 20mm"],
  "MAT-AGG-12": ["12mm aggregate", "12mm coarse aggregate", "coarse aggregate 12mm", "aggregate 12mm", "jelly 12mm"],
  "MAT-BRK-01": ["clay brick", "red brick", "modular brick", "brickwork brick", "table moulded brick"],
  "MAT-BLK-01": ["concrete block", "solid block", "concrete solid block", "cement block", "6 inch block", "8 inch block"],
  "MAT-AAC-01": ["aac block", "autoclaved aerated concrete", "siporex block", "lightweight block"],
  "MAT-VIT-01": ["vitrified tile", "vitrified tiles", "600x600 tile", "floor tile", "body tile"],
  "MAT-CER-01": ["ceramic tile", "ceramic tiles", "wall tile", "bathroom tile"],
  "MAT-GRN-01": ["granite", "granite slab", "black granite", "granite flooring"],
  "MAT-MRB-01": ["marble", "marble slab", "italian marble", "white marble"],
  "MAT-ADH-01": ["tile adhesive", "kerakoll", "ferroke", "araldite", "adhesive 20kg"],
  "MAT-GRT-01": ["tile grout", "epoxy grout", "cement grout"],
  "MAT-PUT-01": ["wall putty", "putty", "birla white putty", "jk putty"],
  "MAT-PRM-01": ["primer", "wall primer", "exterior primer", "interior primer"],
  "MAT-PNT-01": ["emulsion paint", "paint", "acrylic paint", "wall paint", "interior paint"],
  "MAT-PEB-PRM": ["primary steel", "peb primary steel", "built-up column", "tapered rafter"],
  "MAT-PEB-SEC": ["secondary steel", "z purlin", "c purlin", "girt"],
  "CIV-FND-CON": ["m25 concrete", "foundation concrete", "ready mix concrete", "footing concrete"],
  "SRV-RCC-LAY": ["rcc casting labour", "concrete labour", "casting labour"],
  "SRV-PLS-LAY": ["plastering labour", "plaster labour", "masonry plaster labour"],
  "SRV-PNT-LAY": ["painting labour", "painter labour", "paint labour"],
  "SRV-TIL-LAY": ["tile laying labour", "tiling labour", "tile mason"],
  "SRV-BRK-LAY": ["brickwork labour", "masonry labour", "brick mason"]
};

export const getMasterRate = (
  keywords: string[],
  fallback: number = 0,
  stores: string[] = ["bm_material_rates", "bm_labour_rates", "bm_service_rates", "bm_equipment_rates"]
): MasterRateResult => {
  const rows = stores.flatMap((store) =>
    readArray(store).map((row) => ({ ...row, __store: store }))
  );

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

