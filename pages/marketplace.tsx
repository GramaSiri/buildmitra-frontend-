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
const lower = (v: any) => text(v).toLowerCase();
const money = (v: any) => {
  const n = Number(String(v ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const readArray = (key: string): any[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const users = () => readArray("users");

const roleType = (role: string) => {
  const r = lower(role);
  if (r === "supplier" || r === "vendor") return "Products";
  if (r === "contractor") return "Contractors";
  if (r === "labour" || r === "laboursupply") return "Labours";
  if (r === "machinery" || r === "machinehire") return "Machine Rentals";
  if (r === "realestate") return "Real Estate";
  return "";
};

const productCategories = [
  "All", "Cement", "Steel", "Sand", "Aggregate", "Blocks", "Bricks", "Hardware",
  "Electrical", "Plumbing", "Paint", "Tiles", "Wood", "Glass", "Sanitary",
  "Waterproofing", "Safety", "Tools", "Other"
];

const cleanCategory = (cat: string, type: string) => {
  const c = text(cat);
  if (!c) return type === "Products" ? "Other" : type;
  return c;
};

const isMasterOrWrongKey = (key: string) => {
  const k = lower(key);
  const getProfileItems = (profile: MarketItem | null) => {
    if (!profile) return [];

    const direct = items.filter((item) =>
      item.sourceType === profile.sourceType &&
      (
        (profile.uploaderCode && item.uploaderCode === profile.uploaderCode) ||
        item.uploaderName === profile.uploaderName ||
        item.mobile === profile.mobile
      )
    );

    return direct;
  };

  const downloadProfileQuote = (profile: MarketItem) => {
    const related = getProfileItems(profile);
    const rows = [
      ["BuildMitra Provider Quote / Profile"],
      ["Name", profile.uploaderName],
      ["Code", profile.uploaderCode || "-"],
      ["Type", profile.sourceType],
      ["Location", profile.location],
      ["Contact", profile.mobile || "-"],
      [],
      ["Service / Item", "Category", "Rate", "Unit"]
    ];

    related.forEach((item) => rows.push([item.title, item.category, String(item.rate), item.unit]));

    const csv = rows.map((r) => r.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.uploaderCode || profile.uploaderName}-quote.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    k.includes("bm_material_rates") ||
    k.includes("bm_labour_rates") ||
    k.includes("bm_service_rates") ||
    k.includes("bm_equipment_rates") ||
    k.includes("admin_rates") ||
    k.includes("buildmitraprojects") ||
    k.includes("sharedprojects") ||
    k.includes("contractorprojects") ||
    k.includes("buyerprojects") ||
    k.includes("bm_admin_projects") ||
    k.includes("bm_admin_users") ||
    k.includes("migration") ||
    k === "users" ||
      k.includes("loggedinuser") ||
    k.includes("ticket") ||
    k.includes("transaction")
  );
};

const detectType = (raw: any, key: string) => {
  const k = lower(key);

  const explicit = text(raw.sourceType || raw.marketType || raw.listingType);
  if (["Products", "Contractors", "Labours", "Machine Rentals", "Real Estate"].includes(explicit)) return explicit;

  if (raw.propertyType || raw.propertyName || raw.listingTitle || raw.bhk || raw.plotArea || k.includes("realestate") || k.includes("property")) return "Real Estate";
  if (raw.machineName || raw.equipment || raw.equipmentName || raw.machine || raw.vehicleName || raw.assetName || raw.dailyRate || raw.hourlyRate || raw.rent || raw.hireRate || raw.rentalRate || raw.ratePerHour || raw.ratePerDay || k.includes("machine") || k.includes("machinery") || k.includes("equipment")) return "Machine Rentals";
  if (raw.trade || raw.labourType || raw.labourCategory || raw.workerCount || raw.manpower || raw.skill || raw.role || raw.serviceName || raw.dailyWage || raw.wage || raw.ratePerDay || k.includes("labour") || k.includes("laboursupply") || k.includes("labourservice")) return "Labours";
  if (raw.contractorName || raw.serviceArea || raw.specialization || k.includes("contractor")) return "Contractors";

  if (
    raw.productName || raw.itemName || raw.materialName || raw.material || raw.brand ||
    raw.stock || raw.availableQty || raw.unit || raw.price || raw.rate ||
    k.includes("supplier") || k.includes("product") || k.includes("catalog")
  ) return "Products";

  return "";
};

const titleFor = (raw: any, type: string) => {
  if (type === "Real Estate") return text(raw.propertyName) || text(raw.listingTitle) || text(raw.projectName) || text(raw.title) || "Real Estate Listing";
  if (type === "Machine Rentals") return text(raw.machineName) || text(raw.equipment) || text(raw.equipmentName) || text(raw.machine) || text(raw.vehicleName) || text(raw.assetName) || text(raw.name) || text(raw.itemName) || "Machine Rental";
  if (type === "Labours") return text(raw.trade) || text(raw.labourType) || text(raw.labourCategory) || text(raw.skill) || text(raw.role) || text(raw.serviceName) || text(raw.service) || text(raw.name) || "Labour Service";
  if (type === "Contractors") return text(raw.companyName) || text(raw.contractorName) || text(raw.service) || text(raw.name) || "Contractor Service";
  return text(raw.productName) || text(raw.itemName) || text(raw.materialName) || text(raw.material) || text(raw.name) || text(raw.item) || "";
};

export default function Marketplace() {
  
  const { checkAndRun } = usePaymentBarrier();
const [items, setItems] = useState<MarketItem[]>([]);
  const [search, setSearch] = useState("");
  const [sourceType, setSourceType] = useState("Products");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MarketItem | null>(null);

  const serviceTypes = ["Products", "Contractors", "Labours", "Machine Rentals", "Real Estate"];

  const uploaderFor = (raw: any, type: string) => {
    const allUsers = users();

    const code = text(raw.uploaderCode || raw.uniqueCode || raw.supplierCode || raw.vendorCode || raw.contractorCode || raw.labourCode || raw.machineCode || raw.realEstateCode || raw.userCode);
    const mobile = text(raw.mobile || raw.phone || raw.supplierMobile || raw.vendorMobile || raw.ownerMobile || raw.contractorMobile || raw.contact || raw.userPhone);
    const name = text(raw.uploaderName || raw.supplierName || raw.vendorName || raw.companyName || raw.ownerName || raw.contractorName || raw.labourName || raw.machineOwnerName || raw.realEstateName || raw.userName);

    const matched =
      allUsers.find((u: any) => code && text(u.uniqueCode).toUpperCase() === code.toUpperCase()) ||
      allUsers.find((u: any) => mobile && text(u.mobile || u.phone).replace(/[^0-9]/g, "") === mobile.replace(/[^0-9]/g, "")) ||
      allUsers.find((u: any) => name && lower(u.name) === name.toLowerCase()) ||
      allUsers.find((u: any) => roleType(text(u.role)) === type);

    return {
      name: name || text(matched?.name) || type,
      code: code || text(matched?.uniqueCode),
      mobile: mobile || text(matched?.mobile || matched?.phone),
      address: text(raw.address || raw.supplierAddress || raw.vendorAddress || raw.officeAddress || matched?.address),
      location: text(raw.location || raw.city || raw.area || raw.address || matched?.location || matched?.city) || "Local",
      pincode: text(raw.pincode || raw.pinCode || raw.servicePincode || raw.postcode || matched?.pincode)
    };
  };

  const normalize = (raw: any, key: string, index: number): MarketItem | null => {
    if (!raw || typeof raw !== "object") return null;
    if (isMasterOrWrongKey(key)) return null;

    const type = detectType(raw, key);
    if (!type) return null;

    const title = titleFor(raw, type);
    if (!title) return null;

    const uploader = uploaderFor(raw, type);
    const rate = money(raw.rate ?? raw.price ?? raw.unitRate ?? raw.dailyRate ?? raw.hourlyRate ?? raw.rent ?? raw.hireRate ?? raw.rentalRate ?? raw.ratePerHour ?? raw.ratePerDay ?? raw.dailyWage ?? raw.wage ?? raw.amount ?? raw.expectedPrice);

    return {
      id: text(raw.id) || `${key}-${index}`,
      title,
      category: cleanCategory(text(raw.category || raw.trade || raw.materialCategory || raw.propertyType || raw.machineType), type),
      sourceType: type,
      uploaderName: uploader.name,
      uploaderCode: uploader.code,
      mobile: uploader.mobile,
      address: uploader.address,
      location: uploader.location,
      pincode: uploader.pincode,
      unit: text(raw.unit || raw.uom) || (type === "Machine Rentals" ? "Day" : type === "Labours" ? "Day" : type === "Real Estate" ? "Listing" : "Unit"),
      rate,
      description: text(raw.description || raw.remarks || raw.details),
      status: text(raw.status) || "Active",
      sourceKey: key
    };
  };

  const providerProfiles = (): MarketItem[] => {
    return users().map((u: any) => {
      const type = roleType(text(u.role));
      if (!type || type === "Products") return null;

      const name = text(u.name) || type;
      const code = text(u.uniqueCode);
      return {
        id: `profile-${code || name}`,
        title:
          type === "Contractors" ? `${name} Contractor Service` :
          type === "Machine Rentals" ? `${name} Machine Rental Service` :
          type === "Labours" ? `${name} Labour Supply Service` :
          `${name} Real Estate Service`,
        category: type,
        sourceType: type,
        uploaderName: name,
        uploaderCode: code,
        mobile: text(u.mobile || u.phone),
        address: text(u.address),
        location: text(u.location || u.city || u.area) || "Local",
        pincode: text(u.pincode),
        unit: "Service",
        rate: 0,
        description: "Registered BuildMitra service provider",
        status: "Active",
        sourceKey: "users-profile"
      } as MarketItem;
    }).filter(Boolean) as MarketItem[];
  };

  const loadMarketplace = () => {
    const out: MarketItem[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        if (isMasterOrWrongKey(key)) continue;

        const value = localStorage.getItem(key);
        if (!value) continue;

        let parsed: any;
        try { parsed = JSON.parse(value); } catch { continue; }

        const arrays: any[][] = [];
        if (Array.isArray(parsed)) arrays.push(parsed);
        if (parsed && typeof parsed === "object") {
          ["products", "items", "materials", "equipment", "machines", "labour", "services", "uploads", "listings", "catalog", "properties"].forEach(k => {
            if (Array.isArray(parsed[k])) arrays.push(parsed[k]);
          });
        }

        arrays.forEach(arr => arr.forEach((raw, idx) => {
          const item = normalize(raw, key, idx);
          if (item && lower(item.status) !== "deleted") out.push(item);
        }));
      }

      out.push(...providerProfiles());
    } catch (err) {
      console.error("Marketplace load failed", err);
    }

    const unique = Array.from(new Map(out.map(x => [`${x.sourceType}-${x.id}-${x.title}-${x.uploaderCode || x.uploaderName}`, x])).values());
    setItems(unique);
  };

  useEffect(() => {
    loadMarketplace();
    window.addEventListener("storage", loadMarketplace);
    window.addEventListener("buildmitraMarketplaceUpdated", loadMarketplace);
    const getProfileItems = (profile: MarketItem | null) => {
    if (!profile) return [];

    const direct = items.filter((item) =>
      item.sourceType === profile.sourceType &&
      (
        (profile.uploaderCode && item.uploaderCode === profile.uploaderCode) ||
        item.uploaderName === profile.uploaderName ||
        item.mobile === profile.mobile
      )
    );

    return direct;
  };

  const downloadProfileQuote = (profile: MarketItem) => {
    const related = getProfileItems(profile);
    const rows = [
      ["BuildMitra Provider Quote / Profile"],
      ["Name", profile.uploaderName],
      ["Code", profile.uploaderCode || "-"],
      ["Type", profile.sourceType],
      ["Location", profile.location],
      ["Contact", profile.mobile || "-"],
      [],
      ["Service / Item", "Category", "Rate", "Unit"]
    ];

    related.forEach((item) => rows.push([item.title, item.category, String(item.rate), item.unit]));

    const csv = rows.map((r) => r.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.uploaderCode || profile.uploaderName}-quote.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return () => {
      window.removeEventListener("storage", loadMarketplace);
      window.removeEventListener("buildmitraMarketplaceUpdated", loadMarketplace);
    };
  }, []);

  const categoryOptions = useMemo(() => {
    if (sourceType === "Products") {
      const uploaded = items.filter(i => i.sourceType === "Products").map(i => i.category).filter(Boolean);
      return Array.from(new Set([...productCategories, ...uploaded]));
    }
    return ["All", ...Array.from(new Set(items.filter(i => i.sourceType === sourceType).map(i => i.category).filter(Boolean)))];
  }, [items, sourceType]);

  const vendorOptions = useMemo(() => {
    return ["All", ...Array.from(new Set(items.filter(i => i.sourceType === sourceType).map(i => i.uploaderCode || i.uploaderName).filter(Boolean)))];
  }, [items, sourceType]);

  const isAreaAvailable = () => {
    if (!pincode.trim()) return true;
    const pins = readArray("bm_admin_service_pincodes");
    if (!pins.length) return true;
    return pins.some((p: any) => {
      const pin = String(p.pincode || p.pin || p).trim();
      const type = String(p.sourceType || p.serviceType || "All");
      return pin === pincode.trim() && (type === "All" || type === sourceType);
    });
  };

  const filtered = items.filter(item => {
    const q = lower(search);
    const vendorLabel = item.uploaderCode || item.uploaderName;

    const matchesType = item.sourceType === sourceType;
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesVendor = vendorFilter === "All" || vendorLabel === vendorFilter;
    const matchesArea = !pincode.trim() || isAreaAvailable();
    const matchesSearch =
      !q ||
      lower(item.title).includes(q) ||
      lower(item.category).includes(q) ||
      lower(item.uploaderName).includes(q) ||
      lower(item.uploaderCode).includes(q) ||
      lower(item.location).includes(q) ||
      lower(item.pincode).includes(q);

    return matchesType && matchesCategory && matchesVendor && matchesArea && matchesSearch;
  });

  const checkServiceArea = () => {
    setPincodeChecked(true);
    if (!isAreaAvailable()) {
      alert("Service is not available in your searched area yet. BuildMitra is expanding fast — we will make this service available in your area soon.");
    }
  };

  const selectType = (type: string) => {
    setSourceType(type);
    setCategoryFilter("All");
    setVendorFilter("All");
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

  const getProfileItems = (profile: MarketItem | null) => {
    if (!profile) return [];

    const direct = items.filter((item) =>
      item.sourceType === profile.sourceType &&
      (
        (profile.uploaderCode && item.uploaderCode === profile.uploaderCode) ||
        item.uploaderName === profile.uploaderName ||
        item.mobile === profile.mobile
      )
    );

    return direct;
  };

  const downloadProfileQuote = (profile: MarketItem) => {
    const related = getProfileItems(profile);
    const rows = [
      ["BuildMitra Provider Quote / Profile"],
      ["Name", profile.uploaderName],
      ["Code", profile.uploaderCode || "-"],
      ["Type", profile.sourceType],
      ["Location", profile.location],
      ["Contact", profile.mobile || "-"],
      [],
      ["Service / Item", "Category", "Rate", "Unit"]
    ];

    related.forEach((item) => rows.push([item.title, item.category, String(item.rate), item.unit]));

    const csv = rows.map((r) => r.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.uploaderCode || profile.uploaderName}-quote.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div style={{ padding: 20, background: "#f3f4f6", minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={{ background: "#800020", color: "white", padding: 20, borderRadius: 14, marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>BuildMitra Marketplace</h1>
        <p style={{ margin: "6px 0 0" }}>Products, Contractors, Labours, Machine Rentals and Uploaded Real Estate Listings</p>
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
            <button key={name} onClick={() => selectType(name)} style={{ background: sourceType === name ? color : "white", color: sourceType === name ? "white" : color, border: `2px solid ${color}`, borderRadius: 12, padding: 14, fontWeight: "bold", cursor: "pointer" }}>
              {name}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 12 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${sourceType} by item, code, vendor, pincode...`} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
          <select value={sourceType} onChange={(e) => selectType(e.target.value)} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
            {serviceTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
            {categoryOptions.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
            {vendorOptions.map(v => <option key={v}>{v}</option>)}
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
          No listings found under {sourceType}. Check dashboard uploads, selected category, or pincode.
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
            <div style={{ marginTop: 14, padding: 12, background: "#f8f9fa", borderRadius: 10 }}>
              <h3 style={{ marginTop: 0 }}>
                {selectedProfile.sourceType === "Labours" ? "Uploaded Labour Rates / Services" :
                 selectedProfile.sourceType === "Machine Rentals" ? "Uploaded Machine Hire Catalog" :
                 selectedProfile.sourceType === "Contractors" ? "Uploaded Contractor Services / Quote" :
                 selectedProfile.sourceType === "Real Estate" ? "Uploaded Real Estate Listings" :
                 "Uploaded Product Catalog"}
              </h3>

              <div style={{ maxHeight: 220, overflow: "auto" }}>
                {getProfileItems(selectedProfile).map((x) => (
                  <div key={`${x.sourceKey}-${x.id}`} style={{ display: "grid", gridTemplateColumns: "1.6fr .8fr .8fr", gap: 8, padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: 13 }}>
                    <div><strong>{x.title}</strong><br/><span style={{ color: "#666" }}>{x.category}</span></div>
                    <div>₹{x.rate.toLocaleString()}</div>
                    <div>{x.unit}</div>
                  </div>
                ))}
                {getProfileItems(selectedProfile).length === 0 && <div style={{ color: "#666" }}>No uploaded catalog/quote found for this provider yet.</div>}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => saveEnquiry(selectedProfile)} style={{ flex: 1, background: "#28a745", color: "white", border: 0, borderRadius: 8, padding: 10, cursor: "pointer" }}>Send Enquiry</button>
              <button onClick={() => downloadProfileQuote(selectedProfile)} style={{ flex: 1, background: "#800020", color: "white", border: 0, borderRadius: 8, padding: 10, cursor: "pointer" }}>Download Uploaded Quote</button>
            </div>

            <button onClick={() => setSelectedProfile(null)} style={{ marginTop: 10, background: "#6b7280", color: "white", border: 0, borderRadius: 8, padding: 10, width: "100%", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}








