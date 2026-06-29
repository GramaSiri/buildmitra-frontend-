export type MasterRate = {
  code?: string;
  item?: string;
  itemName?: string;
  trade?: string;
  service?: string;
  category?: string;
  unit?: string;
  rate?: number;
  status?: string;
};

const read = (key: string): MasterRate[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const cleanCode = (code: string) => String(code || "").trim().toUpperCase();

const findByCode = (rows: MasterRate[], code: string): MasterRate | null => {
  const c = cleanCode(code);
  return rows.find(r => cleanCode(r.code || "") === c && (r.status || "Active") === "Active") || null;
};

export const getMaterialRate = (code: string, fallback = 0) => {
  const row = findByCode(read("bm_material_rates"), code);
  return {
    code,
    rate: Number(row?.rate || fallback),
    unit: row?.unit || "",
    item: row?.item || row?.itemName || "",
    source: row ? "admin" : "fallback",
  };
};

export const getLabourRate = (code: string, fallback = 0) => {
  const row = findByCode(read("bm_labour_rates"), code);
  return {
    code,
    rate: Number(row?.rate || fallback),
    unit: row?.unit || "",
    item: row?.trade || row?.itemName || "",
    source: row ? "admin" : "fallback",
  };
};

export const getServiceRate = (code: string, fallback = 0) => {
  const row = findByCode(read("bm_service_rates"), code);
  return {
    code,
    rate: Number(row?.rate || fallback),
    unit: row?.unit || "",
    item: row?.service || row?.itemName || "",
    source: row ? "admin" : "fallback",
  };
};

export const getEquipmentRate = (code: string, fallback = 0) => {
  const row = findByCode(read("bm_equipment_rates"), code);
  return {
    code,
    rate: Number(row?.rate || fallback),
    unit: row?.unit || "",
    item: row?.item || row?.itemName || "",
    source: row ? "admin" : "fallback",
  };
};

export const getAnyRate = (code: string, fallback = 0) => {
  const prefix = cleanCode(code).charAt(0);
  if (prefix === "M") return getMaterialRate(code, fallback);
  if (prefix === "L") return getLabourRate(code, fallback);
  if (prefix === "S") return getServiceRate(code, fallback);
  if (prefix === "E") return getEquipmentRate(code, fallback);
  return { code, rate: fallback, unit: "", item: "", source: "fallback" };
};