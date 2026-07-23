import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getBuildMitraUser } from "../utils/session";
import DigitalSignaturePad from "../components/DigitalSignaturePad";
import PrivacyConsentModal from "../components/PrivacyConsentModal";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:5000";

const formatPrice = (value: any) => {
  const amount = Number(value || 0);
  if (!amount) return "Price on request";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

const normalizeProperty = (property: any) => ({
  ...property,
  id: property._id || property.propertyCode,
  transaction: String(
    property.transactionType || property.listingType || "sell"
  ).toLowerCase(),
  location:
    [property.area, property.city].filter(Boolean).join(", ") ||
    property.location ||
    "",
  price:
    property.askingPrice ||
    property.totalAmount ||
    property.monthlyRent ||
    property.depositAmount ||
    0,
  areaValue:
    property.plotArea ||
    property.builtUpArea ||
    property.superBuiltUpArea ||
    property.totalArea ||
    0,
  image:
    Array.isArray(property.imageUrls) && property.imageUrls.length
      ? property.imageUrls[0]
      : "",
});

export default function RealEstateHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("featured");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState("");
  const [budget, setBudget] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [requirement, setRequirement] = useState("");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [signatureData, setSignatureData] = useState("");

  const loadProperties = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`${API_BASE}/api/realestate/public`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load approved properties");
      }
      setProperties((data.properties || []).map(normalizeProperty));
    } catch (error: any) {
      console.error("Real Estate Hub load error:", error);
      setProperties([]);
      setLoadError(error.message || "Unable to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const matchesFilter = (property: any) => {
    const text = [
      property.title,
      property.description,
      property.location,
      property.city,
      property.area,
      property.pincode,
      property.propertyType,
      property.approvalType,
      property.authority,
      property.bhk,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (search && !text.includes(search.toLowerCase())) return false;
    if (pincode && !String(property.pincode || "").includes(pincode)) return false;
    if (
      propertyType &&
      !String(property.propertyType || "")
        .toLowerCase()
        .includes(propertyType.toLowerCase())
    )
      return false;
    if (budget && Number(property.price || 0) > Number(budget)) return false;

    if (activeTab === "featured" && !property.isFeatured) return false;
    if (
      activeTab === "rental" &&
      !["rent", "rental"].some((value) => property.transaction.includes(value))
    )
      return false;
    if (
      activeTab === "buy" &&
      !["sell", "sale", "buy"].some((value) =>
        property.transaction.includes(value)
      )
    )
      return false;

    return true;
  };

  const filteredProperties = useMemo(
    () => properties.filter(matchesFilter),
    [properties, search, pincode, budget, propertyType, activeTab]
  );

  const openEnquiry = (property: any) => {
    const currentUser = getBuildMitraUser() || {};
    setSelectedProperty(property);
    setBuyerName(currentUser.name || "");
    setBuyerPhone(currentUser.phone || currentUser.mobile || "");
    setRequirement("");
    setShowEnquiry(true);
  };

  const submitEnquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProperty) return;

    setSubmitting(true);
    try {
      const currentUser = getBuildMitraUser() || {};
      const response = await fetch(`${API_BASE}/api/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryCategory: "realestate",
          itemType: "realestate",
          itemName: selectedProperty.title,
          propertyCode: selectedProperty.propertyCode,
          buyerUserCode:
            currentUser.userCode ||
            currentUser.uniqueCode ||
            currentUser.userId ||
            "",
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          location: selectedProperty.location,
          specification:
            requirement.trim() ||
            `Interested in ${selectedProperty.title}`,
          message:
            requirement.trim() ||
            `Interested in ${selectedProperty.title}`,
          providerUserCode: selectedProperty.providerUserCode,
          providerRole: selectedProperty.providerRole || "realestate",
          providerName: selectedProperty.providerName,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Enquiry could not be submitted");
      }

      alert(
        `${data.enquiryCode} submitted to BuildMitra Admin. The selected provider will receive it only after Admin approval.`
      );
      setShowEnquiry(false);
      setSelectedProperty(null);
    } catch (error: any) {
      alert(error.message || "Enquiry could not be submitted");
    } finally {
      setSubmitting(false);
    }
  };

  const styles: any = {
    page: {
      minHeight: "100vh",
      background: "#f1f5f9",
      padding: 16,
      fontFamily: "Arial, sans-serif",
    },
    hero: {
      background: "linear-gradient(135deg,#064e3b,#0f766e)",
      color: "white",
      padding: 22,
      borderRadius: 16,
      marginBottom: 16,
    },
    panel: {
      background: "white",
      borderRadius: 14,
      padding: 16,
      boxShadow: "0 3px 12px rgba(15,23,42,.10)",
      marginBottom: 16,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))",
      gap: 16,
    },
    card: {
      background: "white",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 3px 12px rgba(15,23,42,.12)",
      border: "1px solid #e2e8f0",
    },
    content: { padding: 16 },
    image: {
      width: "100%",
      height: 180,
      objectFit: "cover",
      background: "#e2e8f0",
      display: "block",
    },
    placeholder: {
      height: 180,
      background: "linear-gradient(135deg,#d1fae5,#ccfbf1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 42,
    },
    btn: {
      border: 0,
      borderRadius: 8,
      padding: "10px 14px",
      background: "#0f766e",
      color: "white",
      fontWeight: 800,
      cursor: "pointer",
    },
    tab: {
      padding: "10px 14px",
      borderRadius: 999,
      border: "1px solid #cbd5e1",
      background: "white",
      cursor: "pointer",
      fontWeight: 800,
    },
    activeTab: {
      background: "#0f766e",
      color: "white",
      borderColor: "#0f766e",
    },
    input: {
      padding: 11,
      border: "1px solid #cbd5e1",
      borderRadius: 8,
      width: "100%",
      boxSizing: "border-box",
    },
    badge: {
      display: "inline-block",
      padding: "4px 9px",
      borderRadius: 999,
      background: "#dcfce7",
      color: "#166534",
      fontSize: 12,
      fontWeight: 800,
    },
    modalBackdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 1000,
    },
    modal: {
      background: "white",
      borderRadius: 14,
      padding: 20,
      width: "100%",
      maxWidth: 520,
      maxHeight: "90vh",
      overflowY: "auto",
    },
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <button
          onClick={() => router.back()}
          style={{ ...styles.btn, background: "rgba(255,255,255,.18)" }}
        >
          ← Back
        </button>
        <p style={{ margin: "6px 0 0 0", opacity: 0.9 }}>
          Browse Admin-approved properties. Every enquiry first reaches
          BuildMitra Admin for review and assignment.
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowPrivacyModal(true)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: 0, background: "rgba(255,255,255,0.2)", color: "#ffffff", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
          >
            🔒 RERA / GDPR Privacy Consent
          </button>
        </div>
      </section>

      <PrivacyConsentModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />

      <section style={styles.panel}>
        <h2 style={{ marginTop: 0 }}>Search Properties</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
            gap: 10,
          }}
        >
          <input
            style={styles.input}
            placeholder="Location, title or approval"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Pincode"
            value={pincode}
            onChange={(event) => setPincode(event.target.value)}
          />
          <select
            style={styles.input}
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          >
            <option value="">Any budget</option>
            <option value="2500000">Below ₹25 Lakh</option>
            <option value="5000000">Below ₹50 Lakh</option>
            <option value="10000000">Below ₹1 Crore</option>
            <option value="20000000">Below ₹2 Crore</option>
          </select>
          <select
            style={styles.input}
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
          >
            <option value="">All property types</option>
            <option value="plot">Plot</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="agriculture">Agriculture Land</option>
            <option value="farmland">Farm Land</option>
            <option value="industrial">Industrial Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </section>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {[
          ["featured", "Prime Deals"],
          ["rental", "Rental"],
          ["buy", "Buy"],
          ["all", "All Approved"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              ...styles.tab,
              ...(activeTab === key ? styles.activeTab : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.panel}>Loading approved properties...</div>
      ) : loadError ? (
        <div style={styles.panel}>
          <b>Properties could not be loaded.</b>
          <p>{loadError}</p>
          <button style={styles.btn} onClick={loadProperties}>
            Retry
          </button>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div style={styles.panel}>
          No matching Admin-approved properties are available.
        </div>
      ) : (
        <section style={styles.grid}>
          {filteredProperties.map((property) => (
            <article key={property.id} style={styles.card}>
              {property.image ? (
                <img
                  src={property.image}
                  alt={property.title}
                  style={styles.image}
                />
              ) : (
                <div style={styles.placeholder}>🏠</div>
              )}
              <div style={styles.content}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={styles.badge}>
                    {property.isFeatured ? "Prime Deal" : "Admin Approved"}
                  </span>
                  <small>{property.propertyCode}</small>
                </div>
                <h2 style={{ marginBottom: 6 }}>{property.title}</h2>
                <p style={{ color: "#475569", marginTop: 0 }}>
                  {property.location || "Location not specified"}
                </p>
                <p>
                  <b>Type:</b> {property.propertyType || "Property"}
                </p>
                <p>
                  <b>Area:</b>{" "}
                  {property.areaValue
                    ? `${Number(property.areaValue).toLocaleString("en-IN")} ${
                        property.areaUnit || "sqft"
                      }`
                    : "Not specified"}
                </p>
                <p>
                  <b>Price:</b> {formatPrice(property.price)}
                  {property.monthlyRent ? " / month" : ""}
                </p>
                <button
                  style={styles.btn}
                  onClick={() => openEnquiry(property)}
                >
                  Send Enquiry to Admin
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {showEnquiry && selectedProperty && (
        <div style={styles.modalBackdrop}>
          <form style={styles.modal} onSubmit={submitEnquiry}>
            <h2 style={{ marginTop: 0 }}>Property Enquiry</h2>
            <p>
              <b>{selectedProperty.title}</b>
              <br />
              {selectedProperty.propertyCode}
            </p>
            <p style={{ fontSize: 13, color: "#475569" }}>
              Your enquiry and contact number will first go to BuildMitra Admin.
              The provider cannot view them until Admin approval.
            </p>
            <label>Name *</label>
            <input
              required
              style={{ ...styles.input, margin: "6px 0 12px" }}
              value={buyerName}
              onChange={(event) => setBuyerName(event.target.value)}
            />
            <label>Mobile Number *</label>
            <input
              required
              inputMode="numeric"
              style={{ ...styles.input, margin: "6px 0 12px" }}
              value={buyerPhone}
              onChange={(event) => setBuyerPhone(event.target.value)}
            />
            <label>Requirement</label>
            <textarea
              style={{ ...styles.input, margin: "6px 0 12px", minHeight: 90 }}
              placeholder="Budget, preferred visit date or questions"
              value={requirement}
              onChange={(event) => setRequirement(event.target.value)}
            />
            <div style={{ marginBottom: "16px" }}>
              <DigitalSignaturePad onSignComplete={(dataUrl) => setSignatureData(dataUrl)} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={submitting} style={styles.btn} type="submit">
                {submitting ? "Submitting..." : "Submit to Admin"}
              </button>
              <button
                type="button"
                style={{ ...styles.btn, background: "#64748b" }}
                onClick={() => setShowEnquiry(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
