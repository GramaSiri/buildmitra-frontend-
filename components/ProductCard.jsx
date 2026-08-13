import React from "react";
import { resolveMediaUrl } from "../utils/mediaResolver";
import { formatSupplierName } from "../utils/formatters";

export default function ProductCard({ item, product, onSendEnquiry }) {
  const p = item || product;
  if (!p) return null;

  const rawImage = p.image || p.imageUrl || p.image_url || p.imagePath || p.image_path || (Array.isArray(p.images) && p.images[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url || p.images[0].imageUrl) : "");
  const imageSrc = resolveMediaUrl(rawImage || p);

  return (
    <div className="marketplace-card product-card card-compact">
      <div 
        className="product-image-container thumbnail-wrapper aspect-square" 
        style={{ width: "100%", aspectRatio: "1 / 1", cursor: "pointer", position: "relative", overflow: "hidden" }} 
        onClick={() => onSendEnquiry && onSendEnquiry(p)}
      >
        <img
          src={imageSrc}
          alt={p.itemName || p.productName || p.name || "BuildMitra product"}
          loading="lazy"
          decoding="async"
          onError={(e) => { e.currentTarget.src = "/assets/placeholder-product.svg"; }}
          className="bm-marketplace-product-image object-cover"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center"
          }}
        />
      </div>

      <h2 
        className="product-title" 
        style={{ fontSize: 11, fontWeight: 700, margin: "2px 0", cursor: "pointer" }}
        onClick={() => onSendEnquiry && onSendEnquiry(p)}
      >
        {p.itemName || p.productName || p.title || "Material Item"}
      </h2>

      <div className="supplier-name" style={{ fontSize: 10, color: "#64748b", fontWeight: 600, margin: "1px 0" }}>
        {formatSupplierName(p.providerName || p.supplierName || "Supplier", 8)}
      </div>

      <div className="product-price" style={{ fontSize: 11, fontWeight: 800, color: "#166534" }}>
        ₹{Number(p.rate || p.price || 0).toLocaleString("en-IN")} <span className="unit" style={{ fontSize: 9, color: "#475569" }}>/ {p.unit || "unit"}</span>
      </div>

      <div className="card-actions" style={{ marginTop: 4 }}>
        <button
          type="button"
          className="profileBtn input-compact"
          style={{ width: "100%", textAlign: "center", minHeight: 26, fontSize: 10, padding: "2px 4px" }}
          onClick={() => onSendEnquiry && onSendEnquiry(p)}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

