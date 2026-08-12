import React, { useEffect, useMemo, useState } from "react";
import { resolveMediaUrl } from "../utils/resolveMediaUrl";

const FALLBACK_IMAGE = "/images/marketplace-fallback.svg";

function firstUseful(value: any): string {
  if (!value) return "";

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = firstUseful(entry);
      if (found) return found;
    }
    return "";
  }

  if (typeof value === "object") {
    return String(
      value.url ||
      value.imageUrl ||
      value.imageURL ||
      value.path ||
      value.src ||
      ""
    ).trim();
  }

  return String(value).trim();
}

function getMarketplaceImage(item: any): string {
  if (!item) return FALLBACK_IMAGE;

  const candidates = [
    item.imageUrl,
    item.imageURL,
    item.image_url,

    item.imagePath,
    item.image_path,

    item.image,
    item.images,

    item.imageUrls,
    item.imageURLs,

    item.photo,
    item.photoUrl,
    item.thumbnail,
    item.thumbnailUrl,

    item.media,
    item.mediaUrls,

    item.productImage,
    item.product_image,

    item.masterImage,
    item.masterImageUrl,
  ];

  for (const candidate of candidates) {
    const value = firstUseful(candidate);

    if (value) {
      return value;
    }
  }

  return FALLBACK_IMAGE;
}

export default function MarketplaceProductImage({
  item,
  alt,
}: {
  item: any;
  alt?: string;
}) {
  const selected = useMemo(
    () => getMarketplaceImage(item),
    [item]
  );

  const resolved = useMemo(
    () => resolveMediaUrl(selected),
    [selected]
  );

  const [src, setSrc] = useState(
    resolved || FALLBACK_IMAGE
  );

  useEffect(() => {
    setSrc(resolved || FALLBACK_IMAGE);
  }, [resolved]);

  return (
    <div
      className="thumbnail-wrapper"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <img
        src={src}
        alt={
          alt ||
          item?.itemName ||
          item?.product_name ||
          item?.productName ||
          item?.name ||
          "BuildMitra product"
        }
        loading="lazy"
        decoding="async"
        onError={() => {
          if (src !== FALLBACK_IMAGE) {
            setSrc(FALLBACK_IMAGE);
          }
        }}
        className="bm-marketplace-product-image"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
          display: "block",
          visibility: "visible",
          opacity: 1,
          background: "#ffffff",
        }}
      />

      <span className="magnifier-badge">
        🔍 Zoom
      </span>
    </div>
  );
}
