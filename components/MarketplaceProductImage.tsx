import React, { useEffect, useMemo, useState } from "react";
import { resolveMediaUrl } from "../utils/mediaResolver";

const PLACEHOLDER_DEFAULT = "/master-images/category-default.svg";

function rawImage(value: any): string {
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
      value.path ||
      value.src ||
      ""
    ).trim();
  }

  return "";
}

function resolveApprovedImage(value: any): string {
  const raw = rawImage(value);

  if (!raw) return "";

  // Centralized media resolver handles backend origin (/uploads/ and /api/)
  // and static frontend CDN assets (/master-images/, /assets/, /images/)
  return resolveMediaUrl(raw);
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

function getCategorySvgPath(category?: string, subCategory?: string, itemName?: string): string {
  const text = `${itemName || ""} ${subCategory || ""} ${category || ""}`.toLowerCase().trim();

  if (text.includes("cpvc") || text.includes("upvc") || text.includes("pvc") || text.includes("plumbing") || text.includes("pipe")) {
    return "/master-images/category-plumbing-cpvc.svg";
  }
  if (text.includes("tmt") || text.includes("steel") || text.includes("rebar") || text.includes("iron")) {
    return "/master-images/category-tmt-bars.svg";
  }
  if (text.includes("sand") || text.includes("m-sand") || text.includes("p-sand") || text.includes("aggregate") || text.includes("jelly") || text.includes("gravel") || text.includes("bulk")) {
    return "/master-images/category-bulk-material.svg";
  }
  if (text.includes("brick")) {
    return "/master-images/category-bricks.svg";
  }
  if (text.includes("cement")) {
    return "/master-images/category-cement.svg";
  }
  if (text.includes("concrete block") || text.includes("hollow block") || text.includes("solid block") || text.includes("aerocon") || text.includes("block")) {
    return "/master-images/category-concrete-blocks.svg";
  }
  if (text.includes("adhesive") || text.includes("fevicol") || text.includes("araldite") || text.includes("resin")) {
    return "/master-images/category-adhesive.svg";
  }
  if (text.includes("tile") || text.includes("flooring") || text.includes("granite") || text.includes("marble")) {
    return "/master-images/category-tiles-flooring.svg";
  }
  if (text.includes("wire") || text.includes("cable") || text.includes("electrical") || text.includes("mcb") || text.includes("switch")) {
    return "/master-images/category-electrical-wires.svg";
  }
  if (text.includes("paint") || text.includes("primer") || text.includes("putty")) {
    return "/master-images/category-paints.svg";
  }

  return PLACEHOLDER_DEFAULT;
}

function getApprovedCandidates(item: any): string[] {
  const candidates: string[] = [];

  const add = (value: any) => {
    const src = resolveApprovedImage(value);

    if (src && !candidates.includes(src)) {
      candidates.push(src);
    }
  };

  /*
    PERMANENT MARKETPLACE IMAGE RESOLUTION PRIORITY:
    1. Uploaded file URL (/uploads/... or https://...) attached to listing
    2. Master item code image (/master-images/MAT-XXXXXX.webp)
    3. Category / Product specific SVG icon (/master-images/category-xxx.svg)
    4. Default Category SVG icon (/master-images/category-default.svg)
  */

  // 1. Direct item imageUrl if valid
  add(item?.imageUrl);
  add(item?.masterImageUrl);

  if (Array.isArray(item?.images)) {
    const activeImages = item.images.filter(
      (img: any) =>
        img &&
        img.status !== "rejected" &&
        img.isActive !== false
    );

    const primary = activeImages.find(
      (img: any) => img?.isPrimary === true
    );

    if (primary) add(primary);
    activeImages.forEach(add);
  }

  add(item?.productImage);
  add(item?.imagePath);
  add(item?.image);

  // 2. Master Item Code WebP image (e.g. /master-images/MAT-000001.webp)
  const normCode = getNormalizedMatCode(
    item?.masterItemCode || item?.masterCode || item?.itemCode || item?.code
  );
  if (normCode) {
    const matPath = `/master-images/${normCode}.webp`;
    if (!candidates.includes(matPath)) candidates.push(matPath);
  }

  // 3. Category / Product SVG icon
  const categorySvg = getCategorySvgPath(item?.category, item?.subCategory, item?.itemName);
  if (!candidates.includes(categorySvg)) {
    candidates.push(categorySvg);
  }

  // 4. Default fallback SVG
  if (!candidates.includes(PLACEHOLDER_DEFAULT)) {
    candidates.push(PLACEHOLDER_DEFAULT);
  }

  return candidates;
}

export default function MarketplaceProductImage({
  item,
  alt,
}: {
  item: any;
  alt?: string;
}) {
  const listingIdentity = String(
    item?.listingCode ||
    item?._id ||
    `${item?.providerUserCode || ""}-${item?.itemName || ""}`
  );

  const candidates = useMemo(
    () => getApprovedCandidates(item),
    [
      listingIdentity,
      item?.imageUrl,
      item?.masterImageUrl,
      item?.category,
      item?.subCategory,
      item?.itemName
    ]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [listingIdentity]);

  const src = candidates[index] || PLACEHOLDER_DEFAULT;

  const handleError = () => {
    if (src === PLACEHOLDER_DEFAULT) return;

    if (index + 1 < candidates.length) {
      setIndex((current) => current + 1);
      return;
    }

    setIndex(candidates.length - 1);
  };

  return (
    <img
      key={`${listingIdentity}-${src}`}
      src={src}
      alt={
        alt ||
        item?.itemName ||
        item?.productName ||
        "BuildMitra product"
      }
      loading="eager"
      decoding="async"
      onError={handleError}
      className="bm-marketplace-product-image"
      style={{
        display: "block",
        visibility: "visible",
        opacity: 1,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        background: "#f8fafc",
        border: 0,
      }}
    />
  );
}
