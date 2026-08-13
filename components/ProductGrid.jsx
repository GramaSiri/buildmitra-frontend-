import React from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ items = [], onSendEnquiry }) {
  return (
    <div 
      className="marketplace-grid product-grid grid-compact" 
      style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))", 
        gap: "4px", 
        width: "100%" 
      }}
    >
      {items.map((item, idx) => (
        <ProductCard key={item._id || item.listingCode || idx} item={item} onSendEnquiry={onSendEnquiry} />
      ))}
    </div>
  );
}
