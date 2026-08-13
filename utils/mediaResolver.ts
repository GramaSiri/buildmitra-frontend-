import { getApiBase } from "./apiConfig";

export const FALLBACK_IMAGE_URL = "/assets/placeholder-product.webp";

/**
 * Centralized Media Resolver for BuildMitra
 *
 * Logic:
 * a) Base64 or https:// URLs -> Return as-is.
 * b) Paths starting with http://localhost:5000/ -> Strip localhost prefix and attach Render backend origin.
 * c) Relative paths like /uploads/... or uploads/... -> Prepend Render backend origin.
 * d) Missing/broken paths -> Return fallback image /assets/placeholder-product.webp.
 */
export function resolveMediaUrl(imagePath?: any): string {
  if (!imagePath || typeof imagePath !== "string") {
    return FALLBACK_IMAGE_URL;
  }

  let trimmed = imagePath.trim();

  if (
    !trimmed ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "[object Object]"
  ) {
    return FALLBACK_IMAGE_URL;
  }

  // Normalize Windows backslashes
  trimmed = trimmed.replace(/\\/g, "/");

  // Rule a: Base64 or blob URLs -> Return as-is
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // Rule a: https:// URLs -> Return as-is
  if (trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Rule b: Paths starting with http://localhost:5000/ or http://127.0.0.1:5000/
  if (/^http:\/\/(?:localhost|127\.0\.0\.1):5000/i.test(trimmed)) {
    const cleanPath = trimmed.replace(/^http:\/\/(?:localhost|127\.0\.0\.1):5000/i, "");
    if (!cleanPath) return FALLBACK_IMAGE_URL;
    const base = getApiBase();
    return `${base}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
  }

  // Generic http:// external URLs
  if (trimmed.startsWith("http://")) {
    return trimmed;
  }

  // Frontend static assets in /public
  if (
    trimmed.startsWith("/assets/") ||
    trimmed.startsWith("/logo.png") ||
    trimmed.startsWith("/favicon.ico") ||
    trimmed.startsWith("/images/buildmitra-") ||
    trimmed.startsWith("/images/static/")
  ) {
    return trimmed;
  }

  // Rule c: Relative paths like /uploads/..., uploads/..., /material-images/...
  const base = getApiBase();
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${cleanPath}`;
}

export default resolveMediaUrl;
