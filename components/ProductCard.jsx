import React from "react";
import MarketplaceProductImage from "./MarketplaceProductImage";
import { formatSupplierName } from "../utils/formatters";

export default function ProductCard({ item, onSendEnquiry }) {
  if (!item) return null;

  return (
    <div className="marketplace-card product-card card-compact">
      <div 
        className="product-image-container thumbnail-wrapper aspect-square" 
        style={{ width: "100%", aspectRatio: "1 / 1", cursor: "pointer", position: "relative" }} 
        onClick={() => onSendEnquiry && onSendEnquiry(item)}
      >
        <MarketplaceProductImage item={item} />
      </div>

      <h2 
        className="product-title" 
        style={{ fontSize: 11, fontWeight: 700, margin: "2px 0", cursor: "pointer" }}
        onClick={() => onSendEnquiry && onSendEnquiry(item)}
      >
        {item.itemName || item.productName || item.title || "Material Item"}
      </h2>

      <div className="supplier-name" style={{ fontSize: 10, color: "#64748b", fontWeight: 600, margin: "1px 0" }}>
        {formatSupplierName(item.providerName || item.supplierName || "Supplier", 8)}
      </div>

      <div className="product-price" style={{ fontSize: 11, fontWeight: 800, color: "#166534" }}>
        ₹{Number(item.rate || item.price || 0).toLocaleString("en-IN")} <span className="unit" style={{ fontSize: 9, color: "#475569" }}>/ {item.unit || "unit"}</span>
      </div>

      <div className="card-actions" style={{ marginTop: 4 }}>
        <button
          type="button"
          className="profileBtn input-compact"
          style={{ width: "100%", textAlign: "center", minHeight: 26, fontSize: 10, padding: "2px 4px" }}
          onClick={() => onSendEnquiry && onSendEnquiry(item)}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
