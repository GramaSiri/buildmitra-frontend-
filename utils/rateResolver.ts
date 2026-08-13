import { getApiBase } from "./apiConfig";
export interface RateResolveItemInput {
  masterItemCode?: string;
  itemCode?: string;
  code?: string;
  itemName: string;
  itemType: 'material' | 'labour' | 'service' | 'machine' | string;
  unit: string;
  category?: string;
  specification?: string;
  brand?: string;
}

export interface ResolvedRateItem {
  masterItemCode: string;
  itemName: string;
  itemType: string;
  unit: string;
  resolvedRate: number;
  rateSource: string;
  city: string;
  effectiveDate: string;
  status: string;
}

const API_BASE = getApiBase();

export async function resolveBulkRates(
  items: RateResolveItemInput[],
  city = "Bengaluru"
): Promise<ResolvedRateItem[]> {
  if (!items || items.length === 0) return [];

  try {
    const res = await fetch(`${API_BASE}/api/rates/resolve-bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, items })
    });

    const data = await res.json();
    if (data && data.success && Array.isArray(data.resolvedItems)) {
      return data.resolvedItems;
    }
  } catch (err) {
    console.warn("Failed to reach /api/rates/resolve-bulk:", err);
  }

  return items.map((item) => ({
    masterItemCode: item.masterItemCode || item.code || "PENDING",
    itemName: item.itemName,
    itemType: item.itemType || "material",
    unit: item.unit || "NOS",
    resolvedRate: 0,
    rateSource: "pending_admin_update",
    city,
    effectiveDate: new Date().toISOString().split("T")[0],
    status: "Rate Pending Admin Update"
  }));
}

