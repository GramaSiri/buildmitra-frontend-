function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return (envUrl && !envUrl.includes("localhost") ? envUrl : "https://buildmitra-backend-beta.onrender.com").replace(/\/+$/, "");
    }
  }
  return (envUrl || "http://localhost:5000").replace(/\/+$/, "");
}

export function normalizeImageUrl(
  url: string | null | undefined
): string | null {
  if (!url || typeof url !== "string") return null;

  let trimmed = url.trim();

  if (
    !trimmed ||
    trimmed === "/placeholder-material.png" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return null;
  }

  const apiBase = getApiBase();

  // Convert localhost/127.0.0.1 references to actual API base when accessed externally
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      trimmed = trimmed.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1):5000/i, apiBase);
    }
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

    return `${apiBase}${cleanPath}`;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return `${apiBase}/${trimmed}`;
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

