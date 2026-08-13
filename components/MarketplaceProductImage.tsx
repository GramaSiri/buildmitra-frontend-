import React, { useEffect, useMemo, useState } from "react";
import { resolveMediaUrl } from "../utils/mediaResolver";

const PLACEHOLDER_SRC = "/assets/placeholder-product.webp";

function extractUrl(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
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

function collectCandidates(item: any): string[] {
  if (!item) return [];

  const result: string[] = [];

  const add = (val: any) => {
    const url = extractUrl(val);
    if (url && !result.includes(url) && url !== PLACEHOLDER_SRC) {
      result.push(url);
    }
  };

  // 1. Structured images array from DB
  if (Array.isArray(item.images)) {
    item.images.forEach((img: any) => {
      if (img?.isPrimary) add(img);
    });
    item.images.forEach((img: any) => add(img));
  }

  // 2. Direct listing fields
  add(item.imageUrl);
  add(item.image);
  add(item.imagePath);
  add(item.image_url);
  add(item.image_path);
  add(item.masterImage);
  add(item.masterImageUrl);
  add(item.productImage);
  add(item.thumbnail);
  add(item.thumbnailUrl);

  return result;
}

export default function MarketplaceProductImage({
  item,
  alt,
}: {
  item: any;
  alt?: string;
}) {
  // Stable listing identity - reset ONLY when this unique identity changes
  const listingId = String(item?._id || item?.listingCode || item?.id || "");

  // Build candidate list once per listing identity
  const candidates = useMemo(() => collectCandidates(item), [listingId]);

  // Track failed URLs so each URL is attempted at most ONCE
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  // Reset candidate index & failed tracking ONLY when listing identity changes
  useEffect(() => {
    setCandidateIndex(0);
    setFailedUrls([]);
  }, [listingId]);

  // Find first candidate that has NOT failed
  let activeCandidate: string | null = null;
  for (let i = candidateIndex; i < candidates.length; i++) {
    const candidate = candidates[i];
    const resolved = resolveMediaUrl(candidate);
    if (!failedUrls.includes(resolved) && !failedUrls.includes(candidate)) {
      activeCandidate = candidate;
      break;
    }
  }

  // Determine final display src
  const displaySrc = activeCandidate ? resolveMediaUrl(activeCandidate) : PLACEHOLDER_SRC;

  const handleImageError = () => {
    // Terminal placeholder guarantee: never retry if placeholder is displayed
    if (displaySrc === PLACEHOLDER_SRC) return;

    // Record the current failed URL
    setFailedUrls((prev) => {
      if (prev.includes(displaySrc)) return prev;
      return [...prev, displaySrc];
    });

    // Advance candidate index to try next unique candidate
    setCandidateIndex((prev) => prev + 1);
  };

  return (
    <img
      src={displaySrc}
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
      onError={handleImageError}
      className="bm-marketplace-product-image object-cover"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        objectFit: "cover",
        objectPosition: "center",
        visibility: "visible",
        opacity: 1,
        background: "#ffffff",
      }}
    />
  );
}
