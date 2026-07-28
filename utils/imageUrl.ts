const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000"
).replace(/\/+$/, "");

export function normalizeImageUrl(
  url: string | null | undefined
): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();

  if (
    !trimmed ||
    trimmed === "/placeholder-material.png" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return null;
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  if (
    trimmed.startsWith("/api/marketplace/images/") ||
    trimmed.startsWith("api/marketplace/images/") ||
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("uploads/")
  ) {
    const cleanPath = trimmed.startsWith("/")
      ? trimmed
      : `/${trimmed}`;

    return `${API_BASE}${cleanPath}`;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return `${API_BASE}/${trimmed}`;
}

export function resolveListingImage(item: any): string | null {
  if (!item || typeof item !== "object") return null;

  if (Array.isArray(item.images) && item.images.length > 0) {
    const activeImages = item.images.filter(
      (image: any) =>
        image &&
        image.status !== "rejected" &&
        image.isActive !== false
    );

    const primary = activeImages.find(
      (image: any) =>
        image &&
        image.isPrimary &&
        (image.url || image.imageUrl)
    );

    if (primary) {
      const resolved = normalizeImageUrl(
        primary.url || primary.imageUrl
      );

      if (resolved) return resolved;
    }

    const first = activeImages[0];

    if (first) {
      const resolved = normalizeImageUrl(
        typeof first === "string"
          ? first
          : first.url || first.imageUrl
      );

      if (resolved) return resolved;
    }
  }

  const legacyCandidates = [
    item.imageUrl,
    item.productImage,
    item.image,
  ];

  for (const candidate of legacyCandidates) {
    const resolved = normalizeImageUrl(candidate);

    if (resolved) return resolved;
  }

  return null;
}
