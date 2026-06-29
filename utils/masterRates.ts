export type MasterRateResult = {
  rate: number;
  found: boolean;
  source: string;
  matchedName: string;
};

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
  fallback: number,
  stores: string[] = ["bm_material_rates", "bm_labour_rates", "bm_service_rates", "bm_equipment_rates"]
): MasterRateResult => {
  const rows = stores.flatMap((store) =>
    readArray(store).map((row) => ({ ...row, __store: store }))
  );

  const found = rows.find((row) => {
    const searchable = [
      row.code,
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

    return keywords.some((k) => searchable.includes(String(k).toLowerCase())) && Number(row.rate || row.price || row.unitRate || 0) > 0;
  });

  if (!found) {
    return { rate: fallback, found: false, source: "fallback", matchedName: "" };
  }

  return {
    rate: Number(found.rate || found.price || found.unitRate || fallback),
    found: true,
    source: found.__store,
    matchedName: String(found.item || found.itemName || found.material || found.service || found.trade || found.name || "")
  };
};

export const rateStatusMessage = (rates: Record<string, MasterRateResult>) => {
  const missing = Object.entries(rates).filter(([, value]) => !value.found).map(([key]) => key);
  if (!missing.length) return "";
  return `Admin master rate missing for: ${missing.join(", ")}. Fallback rate used.`;
};
