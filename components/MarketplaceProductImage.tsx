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

function getNormalizedMatCode(code: any): string | null {
  if (!code) return null;
  const str = String(code).trim();
  if (/^MAT-\d+$/i.test(str)) return str.toUpperCase();
  const matchCeme = str.match(/^CEME(\d+)$/i);
  if (matchCeme) return "MAT-" + matchCeme[1].padStart(6, "0");
  const matchTmt = str.match(/^TMT\s*(\d+)$/i);
  if (matchTmt) return "MAT-" + matchTmt[1].padStart(6, "0");
  const matchDigits = str.match(/^(\d+)$/);
  if (matchDigits) return "MAT-" + matchDigits[1].padStart(6, "0");
  return null;
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

  // 1. Authoritative DB imageUrl
  add(item?.imageUrl);

  // 2. Primary image from images[] array
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

  // 3. Normalized master item code static CDN candidates (Vercel edge CDN instant 0ms load)
  const normCode = getNormalizedMatCode(item?.masterItemCode || item?.masterCode || item?.itemCode || item?.code);
  if (normCode) {
    add(`/images/master-images/${normCode}.webp`);
    add(`/uploads/master-materials/bulk-material/${normCode}.png`);
    add(`/uploads/master-materials/bricks/${normCode}.png`);
    add(`/uploads/master-materials/concrete-blocks/${normCode}.png`);
    add(`/uploads/master-materials/electrical-wires/${normCode}.png`);
    add(`/uploads/master-materials/plumbing-cpvc/${normCode}.png`);
    add(`/uploads/master-materials/cement/${normCode}.png`);
    add(`/uploads/master-materials/tmt-bars/${normCode}.png`);
    add(`/uploads/master-materials/tiles-flooring/${normCode}.png`);
  }

  // 4. Legacy fields as fallback candidates
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
  const listingId = String(item?._id || item?.listingCode || item?.id || "");

  const candidates = useMemo(
    () => extractCandidates(item),
    [listingId]
  );

  const [index, setIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setIndex(0);
    setUseFallback(false);
  }, [listingId]);

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
      className="bm-marketplace-product-image object-cover"
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
