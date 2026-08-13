import { getApiBase } from "./apiConfig";
export type BuildMitraMasterRates = {
  steel: number;
  bindingWire: number;
  coverBlock: number;
  steelLabour: number;
  [key: string]: number;
};

const API_BASE = getApiBase();

const CACHE_KEY = "buildmitra_admin_master_rates_v1";

const emptyRates: BuildMitraMasterRates = {
  steel: 0,
  bindingWire: 0,
  coverBlock: 0,
  steelLabour: 0
};

function numberValue(value: any): number {
  const parsed = Number(
    String(value ?? "")
      .replace(/[₹,\s]/g, "")
      .trim()
  );

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function itemName(item: any): string {
  return String(
    item?.itemName ||
    item?.product_name ||
    item?.productName ||
    item?.materialName ||
    item?.name ||
    item?.description ||
    ""
  ).toLowerCase();
}

function itemRate(item: any): number {
  return numberValue(
    item?.rate ??
    item?.price ??
    item?.unitRate ??
    item?.materialRate ??
    item?.sellingPrice ??
    item?.currentRate
  );
}

function findRate(items: any[], keywords: string[]): number {
  const match = items.find((item) => {
    const name = itemName(item);
    return keywords.some((keyword) => name.includes(keyword));
  });

  return match ? itemRate(match) : 0;
}

export async function fetchBuildMitraMasterRates(
  force = false
): Promise<BuildMitraMasterRates> {
  if (typeof window !== "undefined" && !force) {
    try {
      const cached = JSON.parse(
        localStorage.getItem(CACHE_KEY) || "null"
      );

      if (
        cached?.rates &&
        Date.now() - Number(cached.savedAt || 0) < 15 * 60 * 1000
      ) {
        return { ...emptyRates, ...cached.rates };
      }
    } catch {}
  }

  const endpoints = [
    `${API_BASE}/api/master/materials`
];

  let items: any[] = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);

      if (!response.ok) continue;

      const body = await response.json();

      const rows = Array.isArray(body)
        ? body
        : body?.materials ||
          body?.data ||
          body?.items ||
          body?.rates ||
          [];

      if (Array.isArray(rows) && rows.length) {
        items = rows;
        break;
      }
    } catch {}
  }

  const rates: BuildMitraMasterRates = {
    steel: findRate(items, [
      "tmt",
      "rebar",
      "reinforcement steel",
      "steel bar"
    ]),

    bindingWire: findRate(items, [
      "binding wire",
      "annealed steel wire",
      "annealed wire"
    ]),

    coverBlock: findRate(items, [
      "cover block",
      "concrete cover block"
    ]),

    steelLabour: findRate(items, [
      "bar bending labour",
      "steel fixing labour",
      "rebar labour",
      "cutting bending labour"
    ])
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        rates,
        savedAt: Date.now()
      })
    );
  }

  return rates;
}

export function getCachedBuildMitraMasterRates():
  BuildMitraMasterRates {
  if (typeof window === "undefined") return emptyRates;

  try {
    const cached = JSON.parse(
      localStorage.getItem(CACHE_KEY) || "null"
    );

    return {
      ...emptyRates,
      ...(cached?.rates || {})
    };
  } catch {
    return emptyRates;
  }
}

export function clearBuildMitraRateCache() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CACHE_KEY);
  }
}


