const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000"
).replace(/\/+$/, "");

/**
 * Normalizes relative uploaded image paths to full browser-accessible URLs.
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "/placeholder-material.png" || trimmed === "null" || trimmed === "undefined") {
    return null;
  }

  // Already absolute or base64
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Relative backend upload path
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${API_BASE}${cleanPath}`;
  }

  // Other relative assets
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return `${API_BASE}/${trimmed}`;
}

/**
 * Resolves the primary product image from listing object supporting canonical images[] and legacy fields.
 */
export function resolveListingImage(item: any): string | null {
  if (!item || typeof item !== "object") return null;

  // 1. Check canonical images array for primary
  if (Array.isArray(item.images) && item.images.length > 0) {
    const primary = item.images.find((img: any) => img && img.isPrimary && (img.url || img.imageUrl));
    if (primary) {
      const url = normalizeImageUrl(primary.url || primary.imageUrl);
      if (url) return url;
    }
    const first = item.images[0];
    if (first) {
      const url = normalizeImageUrl(typeof first === "string" ? first : (first.url || first.imageUrl));
      if (url) return url;
    }
  }

  // 2. Legacy imageUrl field
  if (item.imageUrl) {
    const url = normalizeImageUrl(item.imageUrl);
    if (url) return url;
  }

  // 3. Legacy productImage field
  if (item.productImage) {
    const url = normalizeImageUrl(item.productImage);
    if (url) return url;
  }

  // 4. Legacy image field
  if (item.image) {
    const url = normalizeImageUrl(item.image);
    if (url) return url;
  }

  return null;
}
