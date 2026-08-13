// Centralized BuildMitra API Configuration
const PRODUCTION_API = "https://buildmitra-backend-beta.onrender.com";

export function getApiBase() {
  if (typeof window !== "undefined") {
    if (window.__BUILDMITRA_API_BASE__) {
      return String(window.__BUILDMITRA_API_BASE__).replace(/\/+$/, "");
    }

    const host = window.location.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      const localBase =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE ||
        "http://localhost:5000";
      return localBase.replace(/\/+$/, "");
    }

    return PRODUCTION_API;
  }

  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.BACKEND_API_URL ||
    PRODUCTION_API;

  if (configured.includes("localhost") || configured.includes("127.0.0.1")) {
    return PRODUCTION_API;
  }

  return configured.replace(/\/+$/, "");
}

export function getApiUrl(endpoint = "") {
  const base = getApiBase();
  if (!endpoint) return base;
  const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${cleanPath}`;
}

export const API_BASE = getApiBase();

export default {
  getApiBase,
  getApiUrl,
  API_BASE,
  PRODUCTION_API,
};
