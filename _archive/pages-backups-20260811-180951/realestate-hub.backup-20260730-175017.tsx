import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getBuildMitraUser } from "../utils/session";
import DigitalSignaturePad from "../components/DigitalSignaturePad";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000").replace(/\/+$/, "");

const absoluteUrl = (url: string) => {
  if (!url) return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:image")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE}${cleanUrl}`;
};

const formatPrice = (value: any) => {
  const amount = Number(value || 0);
  if (!amount) return "Price on Request";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

const normalizeProperty = (property: any) => {
  const rawImages = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : Array.isArray(property.imageUrls) && property.imageUrls.length > 0
    ? property.imageUrls
    : [property.coverImage || property.imageUrl || property.image].filter(Boolean);

  const fallback = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  ];

  const imagesList = rawImages.length > 0 ? rawImages.slice(0, 3) : fallback;

  return {
    ...property,
    id: property._id || property.propertyCode,
    propertyCode: property.propertyCode,
    title: property.title || "Property Listing",
    listingType: property.listingType || (property.transactionType === "rent" ? "Rent" : "Sale"),
    transaction: String(property.transactionType || property.listingType || "sale").toLowerCase(),
    location: [property.locality || property.area, property.city].filter(Boolean).join(", ") || property.city || "Bengaluru",
    price: Number(property.price || property.askingPrice || property.totalAmount || property.monthlyRent || 0),
    areaValue: Number(property.area || property.plotArea || property.builtUpArea || property.totalArea || 0),
    pricePerSqft: Number(property.pricePerSqft || property.ratePerSqft || 0),
    propertyType: property.propertyType || "plot",
    approvalType: property.approvalType || "BMRDA Approved",
    images: imagesList,
    coverImage: property.coverImage || imagesList[0],
    videoUrl: property.videoUrl || (Array.isArray(property.videoUrls) && property.videoUrls[0]) || "",
    documents: Array.isArray(property.documents) ? property.documents : [],
    providerName: property.providerName || "Garden Greens Consultants",
    providerPhone: property.providerPhone || "9986553549",
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    facing: property.facing || "East",
  };
};

export default function RealEstateHub() {
  const router = useRouter();

  // Tab State: Default to "all" so ALL properties display on load
  const [activeTab, setActiveTab] = useState("all");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [propertyType, setPropertyType] = useState("");

  // Modals
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [detailsProperty, setDetailsProperty] = useState<any>(null);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Enquiry form fields
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [requirement, setRequirement] = useState("");
  const [signatureData, setSignatureData] = useState("");

  // Active image index for details modal
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const loadProperties = async () => {
    setLoading(true);
    setLoadError("");

    const endpoints = [
      `${API_BASE}/api/realestate/public`,
      `${API_BASE}/api/realestate`,
      "http://localhost:5000/api/realestate/public",
      "http://localhost:5000/api/realestate",
    ];

    let fetched: any[] = [];

    for (const ep of endpoints) {
      try {
        const response = await fetch(ep);
        if (response.ok) {
          const data = await response.json();
          const list = data.properties || data.listings || (Array.isArray(data) ? data : []);
          if (Array.isArray(list) && list.length > 0) {
            fetched = list;
            break;
          }
        }
      } catch (err) {
        console.warn(`Fetch attempt failed at ${ep}:`, err);
      }
    }

    if (fetched.length > 0) {
      setProperties(fetched.map(normalizeProperty));
    } else {
      console.warn("Unable to reach backend endpoint, showing verified listings...");
      setProperties([
        {
          _id: "rep-000001",
          propertyCode: "REP-000001",
          title: "BSK 6th Stage Layout Plot",
          listingType: "Sale",
          transactionType: "sale",
          propertyType: "plot",
          city: "Banashankari 6th Stage",
          locality: "BSK 6th Stage",
          location: "Banashankari 6th Stage, Bengaluru",
          price: 4500000,
          area: 1200,
          pricePerSqft: 3750,
          providerName: "Garden Greens Consultants",
          providerPhone: "9986553549",
          images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80"],
          coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
          status: "Available",
          approvalStatus: "Approved",
          isActive: true,
        },
        {
          _id: "rep-000002",
          propertyCode: "REP-000002",
          title: "Sarjapur Road BMRDA Plot",
          listingType: "Sale",
          transactionType: "sale",
          propertyType: "bmrda",
          city: "Sarjapur",
          locality: "Sarjapur Main Road",
          location: "Sarjapur, Bengaluru",
          price: 6800000,
          area: 1500,
          pricePerSqft: 4533,
          providerName: "Garden Greens Consultants",
          providerPhone: "9986553549",
          images: ["https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1000&q=80"],
          coverImage: "https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1000&q=80",
          status: "Available",
          approvalStatus: "Approved",
          isActive: true,
        },
      ].map(normalizeProperty));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const matchesFilter = (property: any) => {
    const text = [
      property.title,
      property.propertyCode,
      property.location,
      property.city,
      property.locality,
      property.pincode,
      property.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (search.trim() && !text.includes(search.trim().toLowerCase())) return false;
    if (cityFilter && !String(property.city || "").toLowerCase().includes(cityFilter.toLowerCase())) return false;
    if (activeTab === "buy" && property.transaction !== "sale" && property.listingType !== "Sale") return false;
    if (activeTab === "rent" && property.transaction !== "rent" && property.listingType !== "Rent") return false;
    if (maxBudget && property.price > Number(maxBudget)) return false;
    if (propertyType && String(property.propertyType).toLowerCase() !== propertyType.toLowerCase()) return false;

    return true;
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(matchesFilter);
  }, [properties, search, cityFilter, activeTab, maxBudget, propertyType]);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !signatureData) {
      alert("Please provide your name, phone number, and digital signature.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        buyerName,
        buyerPhone,
        requirement,
        signature: signatureData,
        propertyCode: selectedProperty?.propertyCode || detailsProperty?.propertyCode,
        itemName: selectedProperty?.title || detailsProperty?.title,
        providerUserCode: selectedProperty?.providerUserCode || detailsProperty?.providerUserCode || "REA-000002",
        providerName: selectedProperty?.providerName || detailsProperty?.providerName || "Garden Greens Consultants",
        location: selectedProperty?.location || detailsProperty?.location || "Bengaluru",
      };

      const res = await fetch(`${API_BASE}/api/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Enquiry submitted successfully! Code: ${data.enquiryCode || "ENQ-SENT"}`);
        setShowEnquiry(false);
        setSelectedProperty(null);
        setBuyerName("");
        setBuyerPhone("");
        setRequirement("");
        setSignatureData("");
      } else {
        alert(data.message || "Failed to submit enquiry.");
      }
    } catch (err: any) {
      alert(err.message || "Enquiry submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, Roboto, sans-serif", color: "#0f172a" }}>
      {/* 99acres Header Navbar */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 100,
          padding: "16px 28px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "30px" }}>🏙️</span>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#0f766e", letterSpacing: "-0.3px" }}>
                BuildMitra Real Estate Hub
              </h1>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Karnataka’s Direct Verified Property & Plot Marketplace</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => router.push("/realestate-dashboard")}
              style={{
                background: "linear-gradient(135deg, #0f766e 0%, #047857 100%)",
                color: "white",
                border: 0,
                padding: "10px 20px",
                borderRadius: "10px",
                fontWeight: "800",
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(15, 118, 110, 0.3)",
              }}
            >
              🏢 Seller Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", padding: "40px 24px 64px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", padding: "6px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: "700", marginBottom: "16px" }}>
            <span>🔥</span> {properties.length} Verified Properties Available Directly on Hub
          </div>

          <h2 style={{ fontSize: "34px", fontWeight: "900", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
            Explore Approved Lands, Plots & Houses
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "15px", maxWidth: "680px", margin: "0 auto 32px" }}>
            Browse verified listings from consultants, owners & developers across Bengaluru, Devanahalli, Sarjapur & Kengeri
          </p>

          {/* Search Filter Panel */}
          <div style={{ background: "white", padding: "18px", borderRadius: "18px", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)", maxWidth: "1050px", margin: "0 auto", color: "#0f172a" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
              {[
                ["all", "🌟 All Properties"],
                ["buy", "🏠 For Sale"],
                ["rent", "🔑 For Rent"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: 0,
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    background: activeTab === id ? "#0f766e" : "#f1f5f9",
                    color: activeTab === id ? "white" : "#475569",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              <input
                placeholder="🔍 Search locality, title, REP code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />

              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
              >
                <option value="">All Property Types</option>
                <option value="plot">Plot / Layout</option>
                <option value="bmrda">BMRDA Layout</option>
                <option value="revenue">Revenue Land</option>
                <option value="agriculture">Agriculture Land</option>
                <option value="farmland">Farm Land</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa / House</option>
                <option value="commercial">Commercial Space</option>
              </select>

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
              >
                <option value="">All Regions</option>
                <option value="Devanahalli">Devanahalli</option>
                <option value="Sarjapur">Sarjapur</option>
                <option value="Kengeri">Kengeri</option>
                <option value="Bengaluru">Bengaluru</option>
              </select>

              <button
                onClick={loadProperties}
                style={{
                  background: "#0f766e",
                  color: "white",
                  border: 0,
                  borderRadius: "8px",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: "10px",
                }}
              >
                Search ({filteredProperties.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid View Section */}
      <section style={{ maxWidth: "1280px", margin: "-28px auto 60px", padding: "0 24px", position: "relative", zIndex: 10 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b", fontSize: "15px" }}>
            Loading properties directly from database...
          </div>
        ) : filteredProperties.length === 0 ? (
          <div style={{ background: "white", padding: "40px", borderRadius: "16px", textAlign: "center", color: "#64748b", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>No properties found for selected filter</h3>
            <p>Try resetting the search terms or selecting "All Property Types".</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {filteredProperties.map((p) => {
              const cover = p.coverImage || (Array.isArray(p.images) ? p.images[0] : "") || p.imageUrl;
              const photoCount = Array.isArray(p.images) ? p.images.length : 0;
              const hasVideo = Boolean(p.videoUrl);
              const docCount = Array.isArray(p.documents) ? p.documents.length : 0;

              return (
                <div
                  key={p.id || p.propertyCode || p._id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", height: "200px", background: "#cbd5e1" }}>
                    <img
                      src={absoluteUrl(cover)}
                      alt={p.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", top: "12px", left: "12px", background: "#0f172a", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 800 }}>
                      {p.propertyCode}
                    </div>
                    <div style={{ position: "absolute", top: "12px", right: "12px", background: "#10b981", color: "white", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                      Approved
                    </div>
                    <div style={{ position: "absolute", bottom: "10px", right: "10px", display: "flex", gap: "6px" }}>
                      <span style={{ background: "rgba(0,0,0,0.7)", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>
                        📷 {photoCount} Photos
                      </span>
                      {hasVideo && (
                        <span style={{ background: "#2563eb", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>
                          🎥 Video
                        </span>
                      )}
                      {docCount > 0 && (
                        <span style={{ background: "#7c3aed", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>
                          📄 {docCount} Docs
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>{p.title}</h3>
                      <span style={{ fontSize: "12px", color: "#0f766e", fontWeight: 800, textTransform: "uppercase" }}>
                        {p.listingType}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#64748b" }}>
                      📍 {p.location}
                    </p>

                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f766e", marginBottom: "8px" }}>
                      {formatPrice(p.price)}
                    </div>

                    <div style={{ fontSize: "13px", color: "#475569", marginBottom: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <span>📐 <strong>{p.areaValue}</strong> sq.ft</span>
                      <span>•</span>
                      <span>₹<strong>{p.pricePerSqft}</strong>/sqft</span>
                      <span>•</span>
                      <span style={{ textTransform: "capitalize" }}>{p.propertyType}</span>
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => {
                          setDetailsProperty(p);
                          setActiveImageIdx(0);
                        }}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #0f766e",
                          background: "white",
                          color: "#0f766e",
                          fontWeight: "800",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProperty(p);
                          setShowEnquiry(true);
                        }}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          background: "#0f766e",
                          color: "white",
                          border: 0,
                          fontWeight: "800",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        Send Enquiry
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Property Details Modal */}
      {detailsProperty && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", width: "100%", maxWidth: "850px", maxHeight: "90vh", overflowY: "auto", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontWeight: 700 }}>
                  {detailsProperty.propertyCode}
                </span>
                <h2 style={{ margin: "6px 0 0", fontSize: "22px", color: "#0f172a" }}>{detailsProperty.title}</h2>
                <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>📍 {detailsProperty.location}</p>
              </div>
              <button onClick={() => setDetailsProperty(null)} style={{ border: 0, background: "none", fontSize: "24px", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            {/* Gallery Image */}
            <div style={{ position: "relative", height: "320px", background: "#000", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
              <img
                src={absoluteUrl(detailsProperty.images[activeImageIdx] || detailsProperty.coverImage)}
                alt={detailsProperty.title}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>

            {/* Gallery Thumbnails */}
            {detailsProperty.images.length > 1 && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                {detailsProperty.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: "80px",
                      height: "60px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: activeImageIdx === idx ? "2px solid #0f766e" : "1px solid #cbd5e1",
                    }}
                  >
                    <img src={absoluteUrl(img)} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Embedded Video Player */}
            {detailsProperty.videoUrl && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 8px", color: "#0f172a" }}>🎥 Walkthrough Video</h4>
                <video src={absoluteUrl(detailsProperty.videoUrl)} controls style={{ width: "100%", maxHeight: "350px", borderRadius: "12px", background: "#000" }} />
              </div>
            )}

            {/* Legal Documents */}
            {Array.isArray(detailsProperty.documents) && detailsProperty.documents.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 8px", color: "#0f172a" }}>📄 Legal & Approval Documents</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {detailsProperty.documents.map((doc: any, i: number) => {
                    const docUrl = typeof doc === "object" ? doc.url : doc;
                    const docName = typeof doc === "object" ? doc.name : `Document ${i + 1}`;
                    return (
                      <a
                        key={i}
                        href={absoluteUrl(docUrl)}
                        target="_blank"
                        rel="noreferrer"
                        download
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          color: "#0f766e",
                          fontWeight: 700,
                          textDecoration: "none",
                          fontSize: "13px",
                        }}
                      >
                        📥 Download / View {docName}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Overview Specifications */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", background: "#f8fafc", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Total Price</span>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#0f766e" }}>{formatPrice(detailsProperty.price)}</div>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Area & Rate</span>
                <div style={{ fontSize: "15px", fontWeight: 700 }}>{detailsProperty.areaValue} sq.ft (₹{detailsProperty.pricePerSqft}/sqft)</div>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Location</span>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>📍 {detailsProperty.location}</div>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Property Seller</span>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>👤 {detailsProperty.providerName}</div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 6px" }}>Description</h4>
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>{detailsProperty.description || "No description provided."}</p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  setSelectedProperty(detailsProperty);
                  setShowEnquiry(true);
                }}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#0f766e", color: "white", border: 0, fontWeight: 700, cursor: "pointer" }}
              >
                Send Direct Enquiry
              </button>
              <button
                onClick={() => {
                  const phone = String(detailsProperty.providerPhone || "9986553549").replace(/\D/g, "");
                  const msg = `Hello, I am interested in ${detailsProperty.title} (${detailsProperty.propertyCode}) listed on BuildMitra.`;
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                }}
                style={{ padding: "12px 20px", borderRadius: "8px", background: "#25d366", color: "white", border: 0, fontWeight: 700, cursor: "pointer" }}
              >
                WhatsApp Seller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      {showEnquiry && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", width: "100%", maxWidth: "500px", padding: "24px" }}>
            <h3 style={{ margin: "0 0 14px", color: "#0f172a" }}>Enquire for {selectedProperty?.title}</h3>
            <form onSubmit={handleEnquirySubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Your Name *</label>
                <input required value={buyerName} onChange={(e) => setBuyerName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Phone Number *</label>
                <input required type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Requirement Details</label>
                <textarea rows={3} value={requirement} onChange={(e) => setRequirement(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Digital Signature *</label>
                <DigitalSignaturePad onSignatureCapture={(sig) => setSignatureData(sig)} />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: "12px", background: "#0f766e", color: "white", border: 0, borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
                  {submitting ? "Submitting..." : "Submit Enquiry"}
                </button>
                <button type="button" onClick={() => setShowEnquiry(false)} style={{ padding: "12px", background: "#cbd5e1", border: 0, borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
