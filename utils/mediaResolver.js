const { getApiBase } = require('./apiConfig');

const FALLBACK_IMAGE_URL = "/assets/placeholder-product.svg";

function resolveMediaUrl(imagePath) {
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

  trimmed = trimmed.replace(/\\/g, "/");

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  if (trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (/^http:\/\/(?:localhost|127\.0\.0\.1):5000/i.test(trimmed)) {
    trimmed = trimmed.replace(/^http:\/\/(?:localhost|127\.0\.0\.1):5000/i, "");
    if (!trimmed) return FALLBACK_IMAGE_URL;
  }

  if (trimmed.startsWith("http://")) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

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

  const base = getApiBase();
  return `${base}${cleanPath}`;
}

module.exports = {
  resolveMediaUrl,
  FALLBACK_IMAGE_URL
};

