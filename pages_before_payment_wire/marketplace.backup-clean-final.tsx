import React, { useEffect, useMemo, useState } from "react";

type MarketItem = {
  id: string;
  title: string;
  category: string;
  sourceType: string;
  uploaderName: string;
  uploaderCode: string;
  mobile: string;
  address: string;
  location: string;
  unit: string;
  rate: number;
  description: string;
  status: string;
  pincode: string;
  sourceKey: string;
};

const text = (v: any) => String(v ?? "").trim();
const num = (v: any) => {
  const n = Number(String(v ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export default function Marketplace() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [search, setSearch] = useState("");
  const [sourceType, setSourceType] = useState("All");
  const [pincode, setPincode] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MarketItem | null>(null);

  const serviceTypes = ["All", "Products", "Contractors", "Labours", "Machine Rentals", "Real Estate"];

  const normalizeItem = (raw: any, sourceKey: string, index: number): MarketItem | null => {
    if (!raw || typeof raw !== "object") return null;

    const key = sourceKey.toLowerCase();

    const title =
      text(raw.productName) ||
      text(raw.itemName) ||
      text(raw.material) ||
      text(raw.materialName) ||
      text(raw.equipment) ||
      text(raw.machineName) ||
      text(raw.service) ||
      text(raw.labourName) ||
      text(raw.trade) ||
      text(raw.projectName) ||
      text(raw.name) ||
      text(raw.item);

    if (!title) return null;

    let type = "Products";
    if (key.includes("contractor") || raw.contractorName || raw.serviceType === "contractor") type = "Contractors";
    if (key.includes("machine") || key.includes("machinery") || raw.equipment || raw.machineName || raw.dailyRate || raw.rent) type = "Machine Rentals";
    if (key.includes("labour") || raw.labourName || raw.trade || raw.workerCount) type = "Labours";
    if (key.includes("realestate") || key.includes("real_estate") || raw.propertyType || raw.propertyName) type = "Real Estate";
    if (key.includes("supplier") || raw.productName || raw.materialName || raw.material) type = "Products";

    const rate = num(raw.rate ?? raw.price ?? raw.unitRate ?? raw.dailyRate ?? raw.rent ?? raw.amount ?? raw.expectedPrice);

    return {
      id: text(raw.id) || `${sourceKey}-${index}`,
      title,
      category: text(raw.category) || text(raw.trade) || text(raw.module) || type,
      sourceType: type,
      uploaderName:
        text(raw.supplierName) ||
        text(raw.supplier) ||
        text(raw.vendorName) ||
        text(raw.companyName) ||
        text(raw.ownerName) ||
        text(raw.contractorName) ||
        text(raw.userName) ||
        text(raw.name) ||
        type,
      uploaderCode: text(raw.uniqueCode) || text(raw.supplierCode) || text(raw.vendorCode) || text(raw.contractorCode) || text(raw.userCode),
      mobile:
        text(raw.mobile) ||
        text(raw.phone) ||
        text(raw.supplierMobile) ||
        text(raw.vendorMobile) ||
        text(raw.ownerMobile) ||
        text(raw.contact) ||
        text(raw.userPhone),
      address: text(raw.address) || text(raw.supplierAddress) || text(raw.vendorAddress) || text(raw.officeAddress),
      location: text(raw.location) || text(raw.city) || text(raw.area) || text(raw.address) || "Local",
      pincode: text(raw.pincode) || text(raw.pinCode) || text(raw.servicePincode) || text(raw.postcode),
      unit: text(raw.unit) || text(raw.uom) || (type === "Machinery Hire" || type === "Labour Supply" ? "day" : "unit"),
      rate,
      description: text(raw.description) || text(raw.remarks) || text(raw.details),
      status: text(raw.status) || "Active",
      sourceKey
    };
  };

  const loadMarketplace = () => {
    const output: MarketItem[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        const value = localStorage.getItem(key);
        if (!value) continue;

        let parsed: any;
        try { parsed = JSON.parse(value); } catch { continue; }

        const arrays: any[][] = [];
        if (Array.isArray(parsed)) arrays.push(parsed);

        if (parsed && typeof parsed === "object") {
          ["products", "items", "materials", "equipment", "machines", "labour", "services", "uploads", "listings", "catalog"].forEach((k) => {
            if (Array.isArray(parsed[k])) arrays.push(parsed[k]);
          });
        }

        arrays.forEach((arr) => {
          arr.forEach((raw, idx) => {
            const item = normalizeItem(raw, key, idx);
            if (item && item.status.toLowerCase() !== "deleted") output.push(item);
          });
        });
      }
    } catch (err) {
      console.error("Marketplace load failed", err);
    }

    const unique = Array.from(new Map(output.map((x) => [`${x.sourceType}-${x.id}-${x.title}-${x.uploaderName}`, x])).values());
    setItems(unique);
  };

  useEffect(() => {
    loadMarketplace();
    window.addEventListener("storage", loadMarketplace);
    window.addEventListener("buildmitraMarketplaceUpdated", loadMarketplace);
    return () => {
      window.removeEventListener("storage", loadMarketplace);
      window.removeEventListener("buildmitraMarketplaceUpdated", loadMarketplace);
    };
  }, []);

  const isAreaAvailable = () => {
    if (!pincode.trim()) return true;
    const adminPins = JSON.parse(localStorage.getItem("bm_admin_service_pincodes") || "[]");

    if (!Array.isArray(adminPins) || adminPins.length === 0) {
      return true; // until admin config is added, do not block testing
    }

    return adminPins.some((p: any) => {
      const pin = String(p.pincode || p.pin || p).trim();
      const type = String(p.sourceType || p.serviceType || "All");
      return pin === pincode.trim() && (type === "All" || type === sourceType || sourceType === "All");
    });
  };

  const checkServiceArea = () => {
    setPincodeChecked(true);
    if (!isAreaAvailable()) {
      alert("Service is not available in your searched area yet. BuildMitra is expanding fast — we will make this service available in your area soon.");
    }
  };

  const serviceAllowed = (item: MarketItem) => {
    if (!pincode.trim()) return true;
    if (!isAreaAvailable()) return false;
    return !item.pincode || item.pincode === pincode.trim() || item.location.includes(pincode.trim());
  };

  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))], [items]);
  const vendors = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.uploaderName).filter(Boolean)))], [items]);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.uploaderName.toLowerCase().includes(q) ||
      item.uploaderCode.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);

    const matchType = sourceType === "All" || item.sourceType === sourceType;
    const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchVendor = vendorFilter === "All" || item.uploaderName === vendorFilter;
    return matchSearch && matchType && matchCategory && matchVendor && serviceAllowed(item);
  });

  const saveEnquiry = (item: MarketItem, viaWhatsApp = true) => {
    const logged = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

    const buyerName = logged.name || "BuildMitra User";
    const buyerMobile = logged.mobile || logged.phone || "";
    const qty = "1";
    const deliveryLocation = pincode || logged.location || item.location || "";
    const instructions = "Please share best quote and availability.";

    const enquiry = {
      id: Date.now(),
      itemId: item.id,
      itemTitle: item.title,
      sourceType: item.sourceType,
      category: item.category,
      uploaderName: item.uploaderName,
      uploaderCode: item.uploaderCode,
      vendorMobile: item.mobile,
      seenRate: item.rate,
      unit: item.unit,
      qty,
      deliveryLocation,
      instructions,
      buyerName,
      buyerMobile,
      buyerCode: logged.uniqueCode || "",
      date: new Date().toISOString(),
      status: "New"
    };

    const allOld = JSON.parse(localStorage.getItem("bm_marketplace_enquiries") || "[]");
    localStorage.setItem("bm_marketplace_enquiries", JSON.stringify([...allOld, enquiry]));

    const vendorKey = `bm_enquiries_${(item.uploaderCode || item.mobile || item.uploaderName).replace(/[^a-zA-Z0-9]/g, "_")}`;
    const vendorOld = JSON.parse(localStorage.getItem(vendorKey) || "[]");
    localStorage.setItem(vendorKey, JSON.stringify([...vendorOld, enquiry]));

    window.dispatchEvent(new Event("buildmitraMarketplaceUpdated"));

    const msg = encodeURIComponent(
      `BuildMitra Enquiry\n\nItem: ${item.title}\nSupplier: ${item.uploaderName}${item.uploaderCode ? ` (${item.uploaderCode})` : ""}\nQty: ${qty}\nSeen Rate: ₹${item.rate}/${item.unit}\nDelivery: ${deliveryLocation}\nInstruction: ${instructions}\nBuyer: ${buyerName}\nBuyer Mobile: ${buyerMobile}`
    );

    const mobile = String(item.mobile || "").replace(/[^0-9]/g, "");
    if (viaWhatsApp && mobile) {
      window.open(`https://wa.me/${mobile}?text=${msg}`, "_blank");
      alert("Enquiry saved and WhatsApp opened to supplier.");
    } else {
      alert("Enquiry successfully delivered to supplier dashboard.");
    }
  };

  return (
    <div style={{ padding: 20, background: "#f3f4f6", minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={{ background: "#800020", color: "white", padding: 20, borderRadius: 14, marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>BuildMitra Marketplace</h1>
        <p style={{ margin: "6px 0 0" }}>Products, contractors, machinery hire, labour supply and real estate listings</p>
      </div>

      <div style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr auto", gap: 12, marginBottom: 14 }}>
          <input value={pincode} onChange={(e) => { setPincode(e.target.value); setPincodeChecked(false); }} placeholder="Enter PIN code / service area first" style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }} />
          <button onClick={checkServiceArea} style={{ background: "#800020", color: "white", border: 0, borderRadius: 8, padding: "10px 18px", cursor: "pointer" }}>Check Area</button>
        </div>

        {pincodeChecked && isAreaAvailable() && <div style={{ padding: 10, borderRadius: 8, background: "#e8f5e9", color: "#166534", marginBottom: 12 }}>✅ Service available in this area. Choose category below.</div>}
        {pincodeChecked && !isAreaAvailable() && <div style={{ padding: 10, borderRadius: 8, background: "#fff3cd", color: "#92400e", marginBottom: 12 }}>🚧 Service is not available in this searched area yet. BuildMitra will serve this area soon.</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 14 }}>
          {[
            ["Products", "#2563eb"],
            ["Contractors", "#16a34a"],
            ["Labours", "#f97316"],
            ["Machine Rentals", "#7c3aed"],
            ["Real Estate", "#dc2626"]
          ].map(([name, color]) => (
            <button key={name} onClick={() => setSourceType(name)} style={{ background: sourceType === name ? color : "white", color: sourceType === name ? "white" : color, border: `2px solid ${color}`, borderRadius: 12, padding: 14, fontWeight: "bold", cursor: "pointer" }}>
              {name}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 12 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search item, category, pincode, vendor, location..." style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
          <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
            {serviceTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
            {vendors.map(v => <option key={v}>{v}</option>)}
          </select>
          <button onClick={loadMarketplace} style={{ background: "#800020", color: "white", border: 0, borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Refresh</button>
        </div>
      </div>

      <div style={{ marginBottom: 12, fontWeight: "bold" }}>Showing {filtered.length} of {items.length} listings</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map((item) => (
          <div key={`${item.sourceKey}-${item.id}`} style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 12, color: "#800020", fontWeight: "bold" }}>{item.sourceType} • {item.category}</div>
            <h3 style={{ margin: "8px 0" }}>{item.title}</h3>

            <button onClick={() => setSelectedProfile(item)} style={{ border: 0, background: "transparent", color: "#800020", textDecoration: "underline", cursor: "pointer", padding: 0, fontWeight: "bold" }}>
              {item.uploaderName}{item.uploaderCode ? ` (${item.uploaderCode})` : ""}
            </button>

            <div style={{ marginTop: 8 }}>Rate: <strong>₹{item.rate.toLocaleString()}</strong> / {item.unit}</div>
            <div>Location: {item.location}</div>
            {item.description && <p style={{ color: "#555" }}>{item.description}</p>}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => saveEnquiry(item, true)} style={{ flex: 1, background: "#28a745", color: "white", border: 0, borderRadius: 8, padding: 10, cursor: "pointer" }}>Enquiry</button>
              <button onClick={() => setSelectedProfile(item)} style={{ flex: 1, background: "#17a2b8", color: "white", border: 0, borderRadius: 8, padding: 10, cursor: "pointer" }}>Profile</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: "white", padding: 30, borderRadius: 12, textAlign: "center", color: "#666", marginTop: 20 }}>
          No listings found. Check uploaded products or pincode availability.
        </div>
      )}

      {selectedProfile && (
        <div onClick={() => setSelectedProfile(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", padding: 24, borderRadius: 14, width: "90%", maxWidth: 480 }}>
            <h2 style={{ marginTop: 0, color: "#800020" }}>Uploader Profile</h2>
            <p><strong>Name:</strong> {selectedProfile.uploaderName}</p>
            <p><strong>Unique Code:</strong> {selectedProfile.uploaderCode || "Not available"}</p>
            <p><strong>Type:</strong> {selectedProfile.sourceType}</p>
            <p><strong>Address:</strong> {selectedProfile.address || "Not available"}</p>
            <p><strong>Location:</strong> {selectedProfile.location}</p>
            <p><strong>Contact:</strong> {selectedProfile.mobile || "Not available"}</p>
            <p><strong>Item:</strong> {selectedProfile.title}</p>
            <p><strong>Rate:</strong> ₹{selectedProfile.rate.toLocaleString()} / {selectedProfile.unit}</p>
            <button onClick={() => saveEnquiry(selectedProfile, true)} style={{ background: "#28a745", color: "white", border: 0, borderRadius: 8, padding: 10, width: "100%", cursor: "pointer" }}>Send Enquiry</button>
            <button onClick={() => setSelectedProfile(null)} style={{ marginTop: 10, background: "#6b7280", color: "white", border: 0, borderRadius: 8, padding: 10, width: "100%", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


