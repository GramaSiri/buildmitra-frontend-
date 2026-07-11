import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", itemType: "", category: "", subCategory: "", brand: "", city: "", area: "", pincode: "", minPrice: "", maxPrice: "", sort: "newest" });

  const [showEnquiry, setShowEnquiry] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [enquiry, setEnquiry] = useState({
    buyerName: "",
    buyerPhone: "",
    itemType: "material",
    quantity: "",
    unit: "",
    location: "",
    specification: "",
    message: "",
    pincode: "",
  });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/provider/marketplace-listings?${query}`);
        const data = await res.json();
        setListings(data.listings || []);
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query]);

  const cleanPhone = (phone: string) => String(phone || "").replace(/\D/g, "").replace(/^91/, "");

  const sendWhatsApp = (item: any) => {
    sendEnquiry(item);
  };

  const sendEnquiry = (item: any) => {
    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : {};

    setSelectedItem(item);

    setEnquiry({
      buyerName: user.name || "",
      buyerPhone: user.phone || "",
      itemType: item.itemType || "material",
      quantity: "",
      unit: item.unit || "",
      location: "",
      specification: "",
      message: "",
    pincode: "",
  });

    setShowEnquiry(true);
  };

  const submitEnquiry = async () => {
    if (!selectedItem) return;
    if (!enquiry.buyerName || !enquiry.buyerPhone || !enquiry.location || !enquiry.pincode) {
      alert("Please fill name, phone, delivery address/location and pincode.");
      return;
    }

    const res = await fetch(`${API_BASE}/api/enquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerUserCode: selectedItem.providerUserCode,
        providerName: selectedItem.providerName,
        providerPhone: selectedItem.providerPhone,
        itemName: selectedItem.itemName,
        listingCode: selectedItem.listingCode,
        masterItemCode: selectedItem.masterItemCode,
        buyerName: enquiry.buyerName,
        buyerPhone: enquiry.buyerPhone,
        itemType: enquiry.itemType,
        quantity: enquiry.quantity,
        unit: enquiry.unit,
        location: enquiry.location,
        pincode: enquiry.pincode,
        specification: enquiry.specification,
        message: enquiry.message || `Marketplace enquiry for ${selectedItem.itemName}`,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      const phone = cleanPhone(selectedItem.providerPhone);
      const enquiryCode = data.enquiry?.enquiryCode || "";
      const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const replyQuoteLink = `${PUBLIC_URL}/quick-quote?enquiryCode=${enquiryCode}`;
      const rejectLink = `${PUBLIC_URL}/quick-quote?enquiryCode=${enquiryCode}&action=reject`;

      const whatsappMessage =
`Hello ${selectedItem.providerName || "Supplier"},

🏗️ NEW BUILDMITRA ENQUIRY

Customer: ${enquiry.buyerName}
Phone: ${enquiry.buyerPhone}

Type: ${enquiry.itemType}
Item: ${selectedItem.itemName}
Quantity: ${enquiry.quantity || "-"} ${enquiry.unit || ""}
Delivery Address/Location: ${enquiry.location}
Pincode: ${enquiry.pincode}
Specification: ${enquiry.specification || "-"}
Message: ${enquiry.message || "-"}

Please send quotation with rate, delivery, included/excluded items and extra charges if any.

✅ Reply Quote:
${replyQuoteLink}

❌ Reject Enquiry:
${rejectLink}

📞 Buyer Phone:
${enquiry.buyerPhone}`;

      if (!phone) {
        alert("Provider WhatsApp number is missing.");
        return;
      }

      const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(waUrl, "_blank");
      setShowEnquiry(false);
      alert("Enquiry saved and WhatsApp opened.");
    } else {
      alert(data.message || "Could not send enquiry.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>BuildMitra Marketplace</h1>
        <p style={styles.subtitle}>Approved providers with master-item linked rates.</p>
      </div>

      <div style={styles.filters}>
        <input style={styles.input} placeholder="Search item, provider, brand" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select style={styles.input} value={filters.itemType} onChange={(e) => setFilters({ ...filters, itemType: e.target.value })}>
          <option value="">All types</option>
          <option value="material">Material</option>
          <option value="service">Contractor service</option>
          <option value="labour">Labour</option>
          <option value="machine">Machine</option>
          <option value="vendor">Vendor product</option>
        </select>
        <input style={styles.input} placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
        <input style={styles.input} placeholder="Subcategory" value={filters.subCategory} onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })} />
        <input style={styles.input} placeholder="Brand" value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })} />
        <input style={styles.input} placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <input style={styles.input} placeholder="Area" value={filters.area} onChange={(e) => setFilters({ ...filters, area: e.target.value })} />
        <input style={styles.input} placeholder="PIN code" value={filters.pincode} onChange={(e) => setFilters({ ...filters, pincode: e.target.value })} />
        <input style={styles.input} placeholder="Min price" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        <input style={styles.input} placeholder="Max price" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        <select style={styles.input} value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="newest">Newest</option>
          <option value="lowest">Lowest price</option>
        </select>
        <button style={styles.clear} onClick={() => setFilters({ search: "", itemType: "", category: "", subCategory: "", brand: "", city: "", area: "", pincode: "", minPrice: "", maxPrice: "", sort: "newest" })}>Clear</button>
      </div>

      <div style={styles.count}>Showing <strong>{listings.length}</strong> approved listings</div>

      {loading ? (
        <div style={styles.empty}>Loading marketplace...</div>
      ) : listings.length === 0 ? (
        <div style={styles.empty}>No approved listings found.</div>
      ) : (
        <div style={styles.grid}>
          {listings.map((item) => (
            <div key={item._id || item.listingCode} style={styles.card}>
              <div style={styles.providerRow}>
                <div>
                  <div style={styles.providerName}>{item.providerName || "Verified Provider"}</div>
                  <div style={styles.verified}>Verified BuildMitra Provider</div>
                </div>
                <button style={styles.profileBtn} onClick={() => window.location.href = `/public-profile/${item.providerUserCode}`}>View Profile</button>
              </div>

              <img src={item.imageUrl} alt={item.itemName} style={styles.image} />

              <div style={styles.body}>
                <h2 style={styles.item}>{item.itemName}</h2>
                <div style={styles.meta}>{item.brand || item.category || "BuildMitra item"} {item.category ? `- ${item.category}` : ""}</div>
                <div style={styles.price}>Rs {Number(item.rate || 0).toLocaleString()} <span style={styles.unit}>/ {item.unit || "unit"}</span></div>
                <div style={styles.location}>{item.providerCity || item.location || "-"} {item.providerArea ? `, ${item.providerArea}` : ""} {item.providerPincode ? `- ${item.providerPincode}` : ""}</div>
              </div>

              <div style={styles.actions}>
                <button style={styles.whatsapp} onClick={() => sendWhatsApp(item)}>WhatsApp Enquiry</button>
                <button style={styles.secondary} onClick={() => sendEnquiry(item)}>Send Enquiry</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showEnquiry && selectedItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2 style={{ marginTop: 0 }}>Send Enquiry</h2>
            <p><b>{selectedItem.itemName}</b></p>

            <input style={styles.input} placeholder="Your Name" value={enquiry.buyerName} onChange={(e) => setEnquiry({ ...enquiry, buyerName: e.target.value })} />
            <br /><br />
            <input style={styles.input} placeholder="Phone" value={enquiry.buyerPhone} onChange={(e) => setEnquiry({ ...enquiry, buyerPhone: e.target.value })} />
            <br /><br />
            <select style={styles.input} value={enquiry.itemType} onChange={(e) => setEnquiry({ ...enquiry, itemType: e.target.value })}>
              <option value="material">Material</option>
              <option value="service">Service</option>
              <option value="machine">Machine</option>
              <option value="labour">Labour</option>
            </select>
            <br /><br />
            <input style={styles.input} placeholder="Quantity" value={enquiry.quantity} onChange={(e) => setEnquiry({ ...enquiry, quantity: e.target.value })} />
            <br /><br />
            <input style={styles.input} placeholder="Unit" value={enquiry.unit} onChange={(e) => setEnquiry({ ...enquiry, unit: e.target.value })} />
            <br /><br />
            <input style={styles.input} placeholder="Delivery Address / Location" value={enquiry.location} onChange={(e) => setEnquiry({ ...enquiry, location: e.target.value })} />
            <br /><br />
            <input style={styles.input} placeholder="Pincode" value={enquiry.pincode} onChange={(e) => setEnquiry({ ...enquiry, pincode: e.target.value })} />
            <br /><br />
            <textarea style={{ ...styles.input, width: "100%", minHeight: 80 }} placeholder="Specification / Message" value={enquiry.message} onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })} />

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="button" style={styles.whatsapp} onClick={submitEnquiry}>Submit & Open WhatsApp</button>
              <button type="button" style={styles.secondary} onClick={() => setShowEnquiry(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f7fb", padding: 24, fontFamily: "Arial, sans-serif", color: "#111827" },
  header: { maxWidth: 1250, margin: "0 auto 18px" },
  title: { margin: 0, fontSize: 34, fontWeight: 900 },
  subtitle: { marginTop: 8, color: "#6b7280", fontSize: 16 },
  filters: { maxWidth: 1250, margin: "0 auto 14px", background: "#fff", padding: 16, borderRadius: 8, display: "grid", gridTemplateColumns: "2fr repeat(5, 1fr)", gap: 10, border: "1px solid #e5e7eb" },
  input: { padding: "11px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, background: "#fff" },
  clear: { padding: "11px 14px", borderRadius: 8, border: 0, background: "#ef4444", color: "#fff", fontWeight: 800, cursor: "pointer" },
  count: { maxWidth: 1250, margin: "0 auto 16px", color: "#374151" },
  grid: { maxWidth: 1250, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 },
  card: { background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  providerRow: { display: "flex", justifyContent: "space-between", gap: 12, padding: 14, borderBottom: "1px solid #eef0f4" },
  providerName: { fontSize: 17, fontWeight: 900 },
  verified: { fontSize: 12, color: "#138a4e", marginTop: 3 },
  profileBtn: { border: "1px solid #155eef", background: "#fff", color: "#155eef", borderRadius: 8, padding: "8px 10px", fontWeight: 800, cursor: "pointer" },
  image: { width: "100%", height: 190, objectFit: "cover", background: "#eef2f7" },
  body: { padding: 14 },
  item: { margin: "0 0 8px", fontSize: 20, lineHeight: 1.25 },
  meta: { color: "#4b5563", fontSize: 14 },
  price: { marginTop: 12, fontSize: 24, fontWeight: 900, color: "#087443" },
  unit: { fontSize: 14, color: "#374151", fontWeight: 500 },
  location: { marginTop: 8, color: "#4b5563", fontSize: 14 },
  actions: { display: "flex", gap: 10, padding: 14, borderTop: "1px solid #eef0f4" },
  whatsapp: { flex: 1, border: 0, background: "#16a34a", color: "#fff", borderRadius: 8, padding: 11, fontWeight: 900, cursor: "pointer" },
  secondary: { flex: 1, border: "1px solid #d1d5db", background: "#fff", borderRadius: 8, padding: 11, fontWeight: 800, cursor: "pointer" },
  empty: { maxWidth: 1250, margin: "0 auto", background: "#fff", padding: 24, borderRadius: 8, border: "1px solid #e5e7eb" },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  },
  modalBox: {
    background: "#fff",
    borderRadius: 16,
    padding: 22,
    width: "100%",
    maxWidth: 520,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
};







