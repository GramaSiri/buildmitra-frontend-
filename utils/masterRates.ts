export type MasterRateResult = {
  rate: number;
  found: boolean;
  source: string;
  matchedName: string;
  itemCode?: string;
  unit?: string;
  city?: string;
};

export function normalizeUnit(unit: string): string {
  if (!unit) return '';
  const u = String(unit).trim().toUpperCase();
  if (['KG', 'KGS', 'KILOGRAM', 'KILOGRAMS'].includes(u)) return 'KG';
  if (['BAG', 'BAGS', 'BAG (50KG)'].includes(u)) return 'BAG';
  if (['CFT', 'CU.FT', 'CUFT', 'CUBIC FEET', 'CUBIC FOOT'].includes(u)) return 'CFT';
  if (['SQFT', 'SQ.FT', 'SFT', 'SQUARE FEET', 'SQ FT'].includes(u)) return 'SQFT';
  if (['RFT', 'RUNNING FEET', 'RUNNING FOOT'].includes(u)) return 'RFT';
  if (['NOS', 'NO', 'NUMBERS', 'NUMBER', 'PIECE', 'PIECES', 'NOS.', 'PKT', 'PACKET'].includes(u)) return 'NOS';
  if (['LTR', 'LITRE', 'LITER', 'LITRES', 'LITERS'].includes(u)) return 'LTR';
  if (['M', 'METER', 'METRE', 'METERS'].includes(u)) return 'M';
  if (['CUM', 'CU.M', 'CUBIC METER'].includes(u)) return 'CUM';
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

export const getMasterRate = (
  keywords: string[],
  fallback: number = 0,
  stores: string[] = ["bm_material_rates", "bm_labour_rates", "bm_service_rates", "bm_equipment_rates"]
): MasterRateResult => {
  const rows = stores.flatMap((store) =>
    readArray(store).map((row) => ({ ...row, __store: store }))
  );

  const cleanKeywords = keywords.map(k => String(k).trim().toLowerCase()).filter(Boolean);

  // Priority 1: Exact Master Item Code match
  let found = rows.find((row) => {
    const rowCode = String(row.code || row.masterItemCode || row.itemCode || "").trim().toLowerCase();
    return rowCode && cleanKeywords.includes(rowCode) && Number(row.rate || row.currentRate || row.price || 0) > 0 && row.isActive !== false;
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

      return cleanKeywords.some((k) => searchable.includes(k)) && Number(row.rate || row.currentRate || row.price || 0) > 0;
    });
  }

  if (!found) {
    return {
      rate: fallback,
      found: false,
      source: "fallback",
      matchedName: "Rate Unavailable in Admin Master"
    };
  }

  const rateValue = Number(found.rate || found.currentRate || found.price || fallback);

  return {
    rate: rateValue > 0 ? rateValue : fallback,
    found: rateValue > 0,
    source: found.__store || "BuildMitra Admin Master Rate",
    matchedName: String(found.item || found.itemName || found.material || found.service || found.trade || found.name || ""),
    itemCode: String(found.code || found.masterItemCode || found.itemCode || ""),
    unit: normalizeUnit(found.unit),
    city: found.city || "Bengaluru"
  };
};

export const rateStatusMessage = (rates: Record<string, MasterRateResult>) => {
  const missing = Object.entries(rates).filter(([, value]) => !value.found).map(([key]) => key);
  if (!missing.length) return "";
  return `Rate Unavailable in Admin Master for: ${missing.join(", ")}.`;
};

export const syncApprovedRatesFromBackend = async (
  apiBase: string = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"
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
      const currentRate = Number(r.currentRate || r.rate || r.price || 0);

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
