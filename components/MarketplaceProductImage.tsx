import React, { useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000";

const FALLBACK_IMAGE = "/images/marketplace-fallback.svg";

function firstValue(value: any): any {
  if (Array.isArray(value)) {
    return value.find(Boolean);
  }

  return value;
}

function normalizePath(value: any): string {
  const raw = String(firstValue(value) || "").trim();

  if (!raw) return "";

  if (
    raw.startsWith("data:") ||
    raw.startsWith("blob:") ||
    raw.startsWith("http://") ||
    raw.startsWith("https://")
  ) {
    return raw;
  }

  const cleaned = raw
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "");

  if (cleaned.startsWith("images/")) {
    return `/${cleaned}`;
  }

  if (
    cleaned.startsWith("uploads/") ||
    cleaned.startsWith("api/")
  ) {
    return `${API_BASE}/${cleaned}`;
  }

  return `${API_BASE}/uploads/material-images/${cleaned}`;
}

export function resolveMarketplaceImage(item: any): string {
  const candidates = [
    item?.imageUrl,
    item?.imageURL,
    item?.image,
    item?.imagePath,
    item?.thumbnail,
    item?.photo,
    item?.mediaUrl,
    item?.imageUrls,
    item?.images,
    item?.media,
    item?.productImage,
    item?.materialImage
  ];

  for (const candidate of candidates) {
    const resolved = normalizePath(candidate);

    if (resolved) {
      return resolved;
    }
  }

  return FALLBACK_IMAGE;
}

export default function MarketplaceProductImage({
  item,
  alt
}: {
  item: any;
  alt?: string;
}) {
  const resolved = useMemo(
    () => resolveMarketplaceImage(item),
    [item]
  );

  const [src, setSrc] = useState(resolved);

  React.useEffect(() => {
    setSrc(resolved);
  }, [resolved]);

  return (
    <div className="thumbnail-wrapper" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <img
        src={src}
        alt={
          alt ||
          item?.itemName ||
          item?.product_name ||
          item?.productName ||
          item?.name ||
          "Marketplace item"
        }
        loading="lazy"
        decoding="async"
        onError={() => {
          if (src !== FALLBACK_IMAGE) {
            setSrc(FALLBACK_IMAGE);
          }
        }}
        className="bm-marketplace-product-image"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <span className="magnifier-badge">🔍 Zoom</span>
    </div>
  );
}
