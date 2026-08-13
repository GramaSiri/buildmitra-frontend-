const PRODUCTION_API =
  "https://buildmitra-backend-beta.onrender.com";

export function getApiBase(): string {

  // Explicit runtime override
  if (
    typeof window !== "undefined" &&
    (window as any).__BUILDMITRA_API_BASE__
  ) {
    return String(
      (window as any).__BUILDMITRA_API_BASE__
    ).replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {

    const host = window.location.hostname;

    // Local laptop development
    if (
      host === "localhost" ||
      host === "127.0.0.1"
    ) {
      return "http://localhost:5000";
    }

    // Real phone/tablet testing on same LAN
    if (
      /^192\.168\./.test(host) ||
      /^10\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return `http://${host}:5000`;
    }
  }

  // Vercel / production / SSR
  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    PRODUCTION_API;

  if (
    configured.includes("localhost") ||
    configured.includes("127.0.0.1")
  ) {
    return PRODUCTION_API;
  }

  return configured.replace(/\/+$/, "");
}

export const API_BASE = getApiBase();
