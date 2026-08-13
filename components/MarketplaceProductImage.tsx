import React, { useEffect, useMemo, useState } from "react";
import { resolveMediaUrl, FALLBACK_IMAGE_URL as FALLBACK_IMAGE } from "../utils/mediaResolver";

type Candidate = {
  url: string;
  isPrimary: boolean;
  sourceType: string;
};

function extractUrl(value: any): string {
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

function collectCandidates(item: any): string[] {
  const result: Candidate[] = [];

  const add = (
    value: any,
    isPrimary = false,
    sourceType = ""
  ) => {
    const url = extractUrl(value);

    if (!url) return;

    result.push({
      url,
      isPrimary,
      sourceType,
    });
  };

  /*
   * Structured DB image records.
   *
   * Example:
   * /api/marketplace/images/<id>
   * sourceType = master-image-library
   */
  if (Array.isArray(item?.images)) {
    item.images.forEach((img: any) => {
      add(
        img,
        Boolean(img?.isPrimary),
        String(img?.sourceType || "")
      );
    });
  }

  /*
   * Other possible arrays.
   */
  [
    item?.imageUrls,
    item?.imageURLs,
    item?.mediaUrls,
    item?.photos,
  ].forEach((collection) => {
    if (!Array.isArray(collection)) return;

    collection.forEach((entry: any) => {
      add(entry);
    });
  });

  /*
   * Legacy/single-value fields.
   */
  [
    item?.imageUrl,
    item?.imageURL,
    item?.image_url,
    item?.imagePath,
    item?.image_path,
    item?.image,
    item?.masterImageUrl,
    item?.masterImage,
    item?.productImage,
    item?.product_image,
    item?.thumbnail,
    item?.thumbnailUrl,
  ].forEach((entry) => add(entry));

  /*
   * Highest priority:
   *
   * 1. DB-backed /api/marketplace/images/<id>
   * 2. master-image-library source
   * 3. explicitly primary
   * 4. legacy /uploads paths
   */
  result.sort((a, b) => {
    const score = (candidate: Candidate) => {
      let points = 0;

      if (
        candidate.url.startsWith(
          "/api/marketplace/images/"
        )
      ) {
        points += 1000;
      }

      if (
        candidate.sourceType ===
        "master-image-library"
      ) {
        points += 500;
      }

      if (candidate.isPrimary) {
        points += 250;
      }

      if (
        candidate.url.startsWith("/uploads/")
      ) {
        points += 50;
      }

      return points;
    };

    return score(b) - score(a);
  });

  return Array.from(
    new Set(
      result
        .map((candidate) => candidate.url)
        .filter(Boolean)
    )
  );
}

export default function MarketplaceProductImage({
  item,
  alt,
}: {
  item: any;
  alt?: string;
}) {
  const candidates = useMemo(
    () => collectCandidates(item),
    [item]
  );

  const [index, setIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  useEffect(() => {
    setIndex(0);
    setAllFailed(false);
  }, [
    item?._id,
    item?.listingCode,
    item?.imageUrl,
    item?.images,
  ]);

  const raw =
    !allFailed && candidates[index]
      ? candidates[index]
      : FALLBACK_IMAGE;

  const src =
    raw === FALLBACK_IMAGE
      ? FALLBACK_IMAGE
      : resolveMediaUrl(raw);

  const tryNextImage = () => {
    /*
     * IMPORTANT:
     * Do not immediately show the mountain/sun fallback.
     *
     * Try every real DB/upload candidate first.
     */
    if (index + 1 < candidates.length) {
      setIndex((previous) => previous + 1);
      return;
    }

    setAllFailed(true);
  };

  return (
    <div
      className="thumbnail-wrapper"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 0,
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <img
        key={`${raw}-${index}`}
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
        onError={(e) => {
          e.currentTarget.src = "/assets/placeholder-product.webp";
          if (raw !== FALLBACK_IMAGE) {
            tryNextImage();
          }
        }}
        className="bm-marketplace-product-image object-cover"
        style={{
          display: "block",
          visibility: "visible",
          opacity: 1,
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          objectFit: "cover",
          objectPosition: "center",
          background: "#ffffff",
        }}
      />
    </div>
  );
}

