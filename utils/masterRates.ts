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

export const syncApprovedRatesFromBackend = async (
  apiBase: string = "http://localhost:5000"
): Promise<{ success: boolean; count: number; error?: string }> => {
  if (typeof window === "undefined") return { success: false, count: 0, error: "Browser only" };

  try {
    const res = await fetch(`${apiBase}/api/rates/approved`);
    if (!res.ok) throw new Error(`Rate API failed: ${res.status}`);

    const rows = await res.json();
    const list = Array.isArray(rows) ? rows : rows.rates || rows.data || [];

    const materialRates: any[] = [];
    const labourRates: any[] = [];
    const serviceRates: any[] = [];
    const equipmentRates: any[] = [];

    list.forEach((r: any) => {
      const category = String(r.category || "").toLowerCase();
      const row = {
        code: r.code || r.item_code || "",
        item: r.item_name || r.itemName || r.item || r.name || "",
        itemName: r.item_name || r.itemName || r.item || r.name || "",
        category: r.category || "",
        unit: r.unit || "",
        rate: Number(r.price || r.rate || r.unitRate || 0),
        price: Number(r.price || r.rate || r.unitRate || 0),
        source: "backend-approved",
        updatedAt: r.updated_at || r.updatedAt || new Date().toISOString()
      };

      if (!row.rate || row.rate <= 0) return;

      if (category.includes("labour") || category.includes("labor")) {
        labourRates.push(row);
      } else if (category.includes("service")) {
        serviceRates.push(row);
      } else if (category.includes("equipment") || category.includes("machine") || category.includes("machinery")) {
        equipmentRates.push(row);
      } else {
        materialRates.push(row);
      }
    });

    if (materialRates.length) localStorage.setItem("bm_material_rates", JSON.stringify(materialRates));
    if (labourRates.length) localStorage.setItem("bm_labour_rates", JSON.stringify(labourRates));
    if (serviceRates.length) localStorage.setItem("bm_service_rates", JSON.stringify(serviceRates));
    if (equipmentRates.length) localStorage.setItem("bm_equipment_rates", JSON.stringify(equipmentRates));

    localStorage.setItem("bm_rates_last_sync", new Date().toISOString());

    return { success: true, count: list.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || "Rate sync failed" };
  }
};
