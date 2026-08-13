import React, { useMemo, useState, useEffect } from "react";
import { resolveMediaUrl } from "../utils/mediaResolver";

const FALLBACK_IMAGE = "/assets/placeholder-product.webp";

function getCandidateUrl(value: any): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    return String(
      value.url ||
      value.imageUrl ||
      value.imageURL ||
      value.imagePath ||
      value.image_path ||
      value.path ||
      value.src ||
      ""
    ).trim();
  }

  return "";
}

function extractCandidates(item: any): string[] {
  const candidates: string[] = [];

  const add = (value: any) => {
    const url = getCandidateUrl(value);

    if (!url) return;

    if (!candidates.includes(url)) {
      candidates.push(url);
    }
  };

  // The reconciled MongoDB imageUrl is the authoritative first choice.
  add(item?.imageUrl);

  // Then use the primary image from images[].
  if (Array.isArray(item?.images)) {
    const primary = item.images.find(
      (img: any) =>
        img?.isPrimary === true &&
        img?.isActive !== false &&
        img?.status !== "rejected"
    );

    if (primary) add(primary);

    item.images.forEach((img: any) => {
      if (img?.isActive !== false && img?.status !== "rejected") {
        add(img);
      }
    });
  }

  // Legacy fields are fallback candidates only.
  add(item?.image);
  add(item?.imagePath);
  add(item?.image_path);
  add(item?.masterImageUrl);
  add(item?.masterImage);
  add(item?.productImage);
  add(item?.thumbnail);

  return candidates;
}

export default function MarketplaceProductImage({
  item,
  alt
}: {
  item: any;
  alt?: string;
}) {
  const candidates = useMemo(
    () => extractCandidates(item),
    [
      item?._id,
      item?.listingCode,
      item?.masterItemCode,
      item?.imageUrl,
      item?.images,
      item?.image
    ]
  );

  const [index, setIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setIndex(0);
    setUseFallback(false);
  }, [
    item?._id,
    item?.listingCode,
    item?.masterItemCode,
    item?.imageUrl
  ]);

  const raw =
    !useFallback && candidates[index]
      ? candidates[index]
      : FALLBACK_IMAGE;

  const src =
    raw === FALLBACK_IMAGE
      ? FALLBACK_IMAGE
      : resolveMediaUrl(raw);

  const handleError = () => {
    if (useFallback || raw === FALLBACK_IMAGE) {
      return;
    }

    if (index + 1 < candidates.length) {
      setIndex((current) => current + 1);
      return;
    }

    setUseFallback(true);
  };

  return (
    <img
      src={src}
      alt={
        alt ||
        item?.itemName ||
        item?.productName ||
        "BuildMitra product"
      }
      loading="lazy"
      decoding="async"
      onError={handleError}
      className="bm-marketplace-product-image"
      style={{
        display: "block",
        visibility: "visible",
        opacity: 1,
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        objectFit: "cover",
        objectPosition: "center",
        border: 0
      }}
    />
  );
}
