import { resolveMediaUrl } from "./mediaResolver";

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

  const resolved = resolveMediaUrl(trimmed);
  if (resolved === "/assets/placeholder-product.webp" || resolved === "/assets/placeholder-product.svg") return null;
  return resolved;
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
