import { getApiBase } from "./apiConfig";

export const FALLBACK_IMAGE_URL = "/assets/placeholder-product.svg";

/**
 * Centralized Media Resolver for BuildMitra
 *
 * Logic:
 * a) Base64 or blob or https:// URLs -> Return as-is.
 * b) Strip http://localhost:5000 or http://127.0.0.1:5000 prefix.
 * c) Static Vercel CDN assets (/uploads/..., /material-images/..., /assets/...) -> Return relative path for 0ms Vercel CDN delivery on mobile.
 * d) Dynamic API image endpoints -> Prepend Render backend origin.
 * e) Missing/invalid paths -> Return /assets/placeholder-product.svg.
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
    trimmed === "[object Object]" ||
    trimmed === "/placeholder-material.png"
  ) {
    return FALLBACK_IMAGE_URL;
  }

  // Normalize Windows backslashes
  trimmed = trimmed.replace(/\\/g, "/");

  // Base64 or blob URLs -> Return as-is
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // https:// URLs -> Return as-is
  if (trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Strip http://localhost:5000 or http://127.0.0.1:5000 prefix
  if (/^http:\/\/(?:localhost|127\.0\.0\.1):5000/i.test(trimmed)) {
    trimmed = trimmed.replace(/^http:\/\/(?:localhost|127\.0\.0\.1):5000/i, "");
    if (!trimmed) return FALLBACK_IMAGE_URL;
  }

  // Generic http:// external URLs
  if (trimmed.startsWith("http://")) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // Static Vercel CDN assets in /public (uploads, material-images, assets, images)
  if (
    cleanPath.startsWith("/uploads/") ||
    cleanPath.startsWith("/material-images/") ||
    cleanPath.startsWith("/assets/") ||
    cleanPath.startsWith("/images/") ||
    cleanPath.startsWith("/logo") ||
    cleanPath.startsWith("/favicon")
  ) {
    return cleanPath;
  }

  // Dynamic backend API endpoints
  const base = getApiBase();
  return `${base}${cleanPath}`;
}

export default resolveMediaUrl;

