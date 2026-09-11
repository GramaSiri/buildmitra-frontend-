const DEFAULT_LOCAL_API = "http://localhost:5000";

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    // Explicit runtime override if configured on window
    if ((window as any).__BUILDMITRA_API_BASE__) {
      return String((window as any).__BUILDMITRA_API_BASE__).replace(/\/+$/, "");
    }

    const host = window.location.hostname;

    // Local laptop / dev / LAN test environment
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.endsWith(".local")
    ) {
      const localBase =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE ||
        DEFAULT_LOCAL_API;
      return localBase.replace(/\/+$/, "");
    }

    return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || DEFAULT_LOCAL_API;
  }

  // Server-side rendering / Node environment fallback
  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.BACKEND_API_URL ||
    DEFAULT_LOCAL_API;

  return configured.replace(/\/+$/, "");
}

export function getApiUrl(endpoint: string = ""): string {
  const base = getApiBase();
  if (!endpoint) return base;
  const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${cleanPath}`;
}

export const API_BASE = getApiBase();

export default getApiBase;
