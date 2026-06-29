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
  pincode: string;
  unit: string;
  rate: number;
  description: string;
  status: string;
  sourceKey: string;
};

const text = (v: any) => String(v ?? "").trim();
const num = (v: any) => {
  const n = Number(String(v ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const readArray = (key: string): any[] => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const getUsers = () => readArray("users");

const roleToType = (role: string) => {
  const r = role.toLowerCase();
  if (r === "supplier" || r === "vendor") return "Products";
  if (r === "contractor") return "Contractors";
  if (r === "labour" || r === "laboursupply") return "Labours";
  if (r === "machinery" || r === "machinehire") return "Machine Rentals";
  if (r === "realestate") return "Real Estate";
  return "";
};

export default function Marketplace() {
  
  const { checkAndRun } = usePaymentBarrier();
const [items, setItems] = useState<MarketItem[]>([]);
  const [search, setSearch] = useState("");
  const [sourceType, setSourceType] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MarketItem | null>(null);

  const serviceTypes = ["All", "Products", "Contractors", "Labours", "Machine Rentals", "Real Estate"];

  const findUploader = (raw: any, fallbackType: string) => {
    const users = getUsers();

    const code =
      text(raw.uploaderCode) ||
      text(raw.uniqueCode) ||
      text(raw.supplierCode) ||
      text(raw.vendorCode) ||
      text(raw.contractorCode) ||
      text(raw.labourCode) ||
      text(raw.machineCode) ||
      text(raw.realEstateCode) ||
      text(raw.userCode);

    const mobile =
      text(raw.mobile) ||
      text(raw.phone) ||
      text(raw.supplierMobile) ||
      text(raw.vendorMobile) ||
      text(raw.ownerMobile) ||
      text(raw.contractorMobile) ||
      text(raw.contact) ||
      text(raw.userPhone);

    const name =
      text(raw.uploaderName) ||
      text(raw.supplierName) ||
      text(raw.vendorName) ||
      text(raw.companyName) ||
      text(raw.ownerName) ||
      text(raw.contractorName) ||
      text(raw.labourName) ||
      text(raw.machineOwnerName) ||
      text(raw.realEstateName) ||
      text(raw.userName);

    const matched =
      users.find((u: any) => code && text(u.uniqueCode).toUpperCase() === code.toUpperCase()) ||
      users.find((u: any) => mobile && text(u.mobile || u.phone).replace(/[^0-9]/g, "") === mobile.replace(/[^0-9]/g, "")) ||
      users.find((u: any) => name && text(u.name).toLowerCase() === name.toLowerCase()) ||
      users.find((u: any) => roleToType(text(u.role)) === fallbackType);

    return {
      name: name || text(matched?.name) || fallbackType,
      code: code || text(matched?.uniqueCode),
      mobile: mobile || text(matched?.mobile || matched?.phone),
      address: text(raw.address) || text(raw.supplierAddress) || text(raw.vendorAddress) || text(raw.officeAddress) || text(matched?.address),
      location: text(raw.location) || text(raw.city) || text(raw.area) || text(raw.address) || text(matched?.location) || "Local",
      pincode: text(raw.pincode) || text(raw.pinCode) || text(raw.servicePincode) || text(raw.postcode) || text(matched?.pincode)
    };
  };

  const isBlockedKey = (key: string) => {
    const k = key.toLowerCase();
    return (
      k.includes("bm_material_rates") ||
      k.includes("bm_labour_rates") ||
      k.includes("bm_service_rates") ||
      k.includes("bm_equipment_rates") ||
      k.includes("buildmitraprojects") ||
      k.includes("sharedprojects") ||
      k.includes("contractorprojects") ||
      k.includes("buyerprojects") ||
      k.includes("bm_admin_projects") ||
      k.includes("bm_admin_users") ||
      k === "users" ||
      k.includes("loggedinuser") ||
      k.includes("transaction") ||
      k.includes("ticket") ||
      k.includes("payment") ||
      k.includes("migration")
    );
  };

  const typeFromKey = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes("supplier") || k.includes("vendor") || k.includes("product")) return "Products";
    if (k.includes("contractor")) return "Contractors";
    if (k.includes("laboursupply") || k.includes("labour_service") || k.includes("labourservice")) return "Labours";
    if (k.includes("machinehire") || k.includes("machinery") || k.includes("machine_item") || k.includes("machineitem")) return "Machine Rentals";
    if (k.includes("realestate") || k.includes("real_estate") || k.includes("property")) return "Real Estate";
    if (k.includes("bm_marketplace_items")) return "Mixed";
    return "";
  };

  const normalizeUpload = (raw: any, sourceKey: string, index: number): MarketItem | null => {
    if (!raw || typeof raw !== "object" || isBlockedKey(sourceKey)) return null;

    let type = typeFromKey(sourceKey);

    if (type === "Mixed") {
      type = text(raw.sourceType) || text(raw.type) || "Products";
    }

    if (!type) return null;

    if (raw.equipment || raw.machineName || raw.dailyRate || raw.rent) type = "Machine Rentals";
    if (raw.trade || raw.workerCount || raw.labourRole) type = "Labours";
    if (raw.propertyType || raw.propertyName || raw.listingTitle) type = "Real Estate";

    const title =
      text(raw.productName) ||
      text(raw.itemName) ||
      text(raw.material) ||
      text(raw.materialName) ||
      text(raw.equipment) ||
      text(raw.machineName) ||
      text(raw.service) ||
      text(raw.trade) ||
      text(raw.propertyName) ||
      text(raw.listingTitle) ||
      text(raw.title) ||
      text(raw.item);

    if (!title) return null;

    const uploader = findUploader(raw, type);
    const rate = num(raw.rate ?? raw.price ?? raw.unitRate ?? raw.dailyRate ?? raw.rent ?? raw.amount ?? raw.expectedPrice);

    return {
      id: text(raw.id) || `${sourceKey}-${index}`,
      title,
      category: text(raw.category) || text(raw.trade) || text(raw.module) || type,
      sourceType: type,
      uploaderName: uploader.name,
      uploaderCode: uploader.code,
      mobile: uploader.mobile,
      address: uploader.address,
      location: uploader.location,
      pincode: uploader.pincode,
      unit: text(raw.unit) || text(raw.uom) || (type === "Machine Rentals" || type === "Labours" ? "day" : "unit"),
      rate,
      description: text(raw.description) || text(raw.remarks) || text(raw.details),
      status: text(raw.status) || "Active",
      sourceKey
    };
  };

  const profileListings = () => {
    return getUsers()
      .map((u: any): MarketItem | null => {
        const type = roleToType(text(u.role));
        if (!type || type === "Products") return null;

        const code = text(u.uniqueCode);
        const name = text(u.name) || type;
        const title =
          type === "Contractors" ? `${name} Contractor Service` :
          type === "Machine Rentals" ? `${name} Machine Rental Service` :
          type === "Labours" ? `${name} Labour Supply Service` :
          type === "Real Estate" ? `${name} Real Estate Service` :
          `${name} Service`;

        return {
          id: `profile-${code || name}`,
          title,
          category: type,
          sourceType: type,
          uploaderName: name,
          uploaderCode: code,
          mobile: text(u.mobile || u.phone),
          address: text(u.address),
          location: text(u.location || u.city || u.area) || "Local",
          pincode: text(u.pincode),
          unit: "service",
          rate: 0,
          description: "Registered BuildMitra service provider",
          status: "Active",
          sourceKey: "users-profile"
        };
      })
      .filter(Boolean) as MarketItem[];
  };

  const loadMarketplace = () => {
    const output: MarketItem[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        if (isBlockedKey(key)) continue;

        const value = localStorage.getItem(key);
        if (!value) continue;

        let parsed: any;
        try { parsed = JSON.parse(value); } catch { continue; }

        const arrays: any[][] = [];
        if (Array.isArray(parsed)) arrays.push(parsed);

        if (parsed && typeof parsed === "object") {
          ["products", "items", "materials", "equipment", "machines", "labour", "services", "uploads", "listings", "catalog", "properties"].forEach((k) => {
            if (Array.isArray(parsed[k])) arrays.push(parsed[k]);
          });
        }

        arrays.forEach(arr => arr.forEach((raw, idx) => {
          const item = normalizeUpload(raw, key, idx);
          if (item && item.status.toLowerCase() !== "deleted") output.push(item);
        }));
      }

      output.push(...profileListings());
    } catch (err) {
      console.error("Marketplace load failed", err);
    }

    const unique = Array.from(
      new Map(output.map(x => [`${x.sourceType}-${x.id}-${x.title}-${x.uploaderCode || x.uploaderName}`, x])).values()
    );

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

  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))], [items]);
  const vendors = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.uploaderCode || i.uploaderName).filter(Boolean)))], [items]);

  const isAreaAvailable = () => {
    if (!pincode.trim()) return true;
    const adminPins = readArray("bm_admin_service_pincodes");
    if (!adminPins.length) return true;
    return adminPins.some((p: any) => {
      const pin = String(p.pincode || p.pin || p).trim();
      const type = String(p.sourceType || p.serviceType || "All");
      return pin === pincode.trim() && (type === "All" || type === sourceType || sourceType === "All");
    });
  };

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const vendorLabel = item.uploaderCode || item.uploaderName;

    const matchSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.uploaderName.toLowerCase().includes(q) ||
      item.uploaderCode.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.pincode.toLowerCase().includes(q);

    const matchType = sourceType === "All" || item.sourceType === sourceType;
    const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchVendor = vendorFilter === "All" || vendorLabel === vendorFilter;
    const matchArea = !pincode.trim() || isAreaAvailable();

    return matchSearch && matchType && matchCategory && matchVendor && matchArea;
  });

  const checkServiceArea = () => {
    setPincodeChecked(true);
    if (!isAreaAvailable()) {
      alert("Service is not available in your searched area yet. BuildMitra is expanding fast — we will make this service available in your area soon.");
    }
  };

  const saveEnquiry = (item: MarketItem) => {
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

    const allOld = readArray("bm_marketplace_enquiries");
    localStorage.setItem("bm_marketplace_enquiries", JSON.stringify([...allOld, enquiry]));

    const vendorKey = `bm_enquiries_${(item.uploaderCode || item.mobile || item.uploaderName || "unknown").replace(/[^a-zA-Z0-9]/g, "_")}`;
    const vendorOld = readArray(vendorKey);
    localStorage.setItem(vendorKey, JSON.stringify([...vendorOld, enquiry]));

    window.dispatchEvent(new Event("buildmitraMarketplaceUpdated"));

    const msg = encodeURIComponent(
      `BuildMitra Enquiry\n\nItem/Service: ${item.title}\nCode: ${item.uploaderCode || "-"}\nQty: ${qty}\nSeen Rate: ₹${item.rate}/${item.unit}\nDelivery: ${deliveryLocation}\nInstruction: ${instructions}\nBuyer: ${buyerName}\nBuyer Mobile: ${buyerMobile}`
    );

    const mobile = String(item.mobile || "").replace(/[^0-9]/g, "");
    window.open(mobile ? `https://wa.me/${mobile}?text=${msg}` : `https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div style={{ padding: 20, background: "#f3f4f6", minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={{ background: "#800020", color: "white", padding: 20, borderRadius: 14, marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>BuildMitra Marketplace</h1>
        <p style={{ margin: "6px 0 0" }}>Products, Contractors, Labours, Machine Rentals and Real Estate listings</p>
      </div>

      <div style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr auto", gap: 12, marginBottom: 14 }}>
          <input value={pincode} onChange={(e) => { setPincode(e.target.value); setPincodeChecked(false); }} placeholder="Enter PIN code / service area first" style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }} />
          <button onClick={checkServiceArea} style={{ background: "#800020", color: "white", border: 0, borderRadius: 8, padding: "10px 18px", cursor: "pointer" }}>Check Area</button>
        </div>

        {pincodeChecked && isAreaAvailable() && <div style={{ padding: 10, borderRadius: 8, background: "#e8f5e9", color: "#166534", marginBottom: 12 }}>✅ Service available in this area.</div>}
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search item, category, pincode, code, vendor, location..." style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
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
        {filtered.map(item => (
          <div key={`${item.sourceKey}-${item.id}`} style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 12, color: "#800020", fontWeight: "bold" }}>{item.sourceType} • {item.category}</div>
            <h3 style={{ margin: "8px 0" }}>{item.title}</h3>
            <button onClick={() => setSelectedProfile(item)} style={{ border: 0, background: "transparent", color: "#800020", textDecoration: "underline", cursor: "pointer", padding: 0, fontWeight: "bold" }}>
              {item.uploaderCode || item.uploaderName}
            </button>
            <div style={{ marginTop: 8 }}>Rate: <strong>₹{item.rate.toLocaleString()}</strong> / {item.unit}</div>
            <div>Area: {item.location}{item.pincode ? ` - ${item.pincode}` : ""}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => saveEnquiry(item)} style={{ flex: 1, background: "#28a745", color: "white", border: 0, borderRadius: 8, padding: 10, cursor: "pointer" }}>Enquiry</button>
              <button onClick={() => setSelectedProfile(item)} style={{ flex: 1, background: "#17a2b8", color: "white", border: 0, borderRadius: 8, padding: 10, cursor: "pointer" }}>Profile</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: "white", padding: 30, borderRadius: 12, textAlign: "center", color: "#666", marginTop: 20 }}>
          No listings found. Check dashboard uploads, category, or pincode.
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
            <p><strong>Pincode:</strong> {selectedProfile.pincode || "Not available"}</p>
            <p><strong>Contact:</strong> {selectedProfile.mobile || "Not available"}</p>
            <p><strong>Item/Service:</strong> {selectedProfile.title}</p>
            <p><strong>Rate:</strong> ₹{selectedProfile.rate.toLocaleString()} / {selectedProfile.unit}</p>
            <button onClick={() => saveEnquiry(selectedProfile)} style={{ background: "#28a745", color: "white", border: 0, borderRadius: 8, padding: 10, width: "100%", cursor: "pointer" }}>Send Enquiry</button>
            <button onClick={() => setSelectedProfile(null)} style={{ marginTop: 10, background: "#6b7280", color: "white", border: 0, borderRadius: 8, padding: 10, width: "100%", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

