const DEFAULT_LOCAL_API = "http://localhost:5000";
const PRODUCTION_API = "https://buildmitra-backend-beta.onrender.com";

function cleanBase(value: string): string {
  return String(value || "").replace(/\/+$/, "");
}

function isLocalHost(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.endsWith(".local")
  );
}

function isLocalApi(value: string): boolean {
  return (
    value.includes("localhost") ||
    value.includes("127.0.0.1")
  );
}

export function getApiBase(): string {
  const publicConfigured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "";

  if (typeof window !== "undefined") {
    const runtimeOverride = (window as any).__BUILDMITRA_API_BASE__;

    if (runtimeOverride) {
      return cleanBase(String(runtimeOverride));
    }

    const host = window.location.hostname;

    if (isLocalHost(host)) {
      return cleanBase(publicConfigured || DEFAULT_LOCAL_API);
    }

    // A remotely deployed browser must NEVER call its own localhost.
    if (publicConfigured && !isLocalApi(publicConfigured)) {
      return cleanBase(publicConfigured);
    }

    return PRODUCTION_API;
  }

  const serverConfigured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.BACKEND_API_URL ||
    "";

  if (serverConfigured && !isLocalApi(serverConfigured)) {
    return cleanBase(serverConfigured);
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_API;
  }

  return cleanBase(serverConfigured || DEFAULT_LOCAL_API);
}

export function getApiUrl(endpoint: string = ""): string {
  const base = getApiBase();

  if (!endpoint) return base;

  const cleanPath = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${base}${cleanPath}`;
}

export const API_BASE = getApiBase();

export default getApiBase;
