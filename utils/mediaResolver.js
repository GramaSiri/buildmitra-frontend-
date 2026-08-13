import { getApiBase } from "./apiConfig";

export const FALLBACK_IMAGE_URL = "/assets/placeholder-product.webp";

export function resolveMediaUrl(imagePath) {
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

  trimmed = trimmed.replace(/\\/g, "/");

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  if (trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (/^http:\/\/(?:localhost|127\.0\.0\.1):5000/i.test(trimmed)) {
    const cleanPath = trimmed.replace(/^http:\/\/(?:localhost|127\.0\.0\.1):5000/i, "");
    if (!cleanPath) return FALLBACK_IMAGE_URL;
    const base = getApiBase();
    return `${base}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
  }

  if (trimmed.startsWith("http://")) {
    return trimmed;
  }

  if (
    trimmed.startsWith("/assets/") ||
    trimmed.startsWith("/logo.png") ||
    trimmed.startsWith("/favicon.ico") ||
    trimmed.startsWith("/images/buildmitra-") ||
    trimmed.startsWith("/images/static/")
  ) {
    return trimmed;
  }

  const base = getApiBase();
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${cleanPath}`;
}

export default resolveMediaUrl;
