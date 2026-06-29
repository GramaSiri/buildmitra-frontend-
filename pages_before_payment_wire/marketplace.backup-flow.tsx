import React, { useEffect, useMemo, useState } from "react";

type MarketItem = {
  id: string;
  title: string;
  category: string;
  sourceType: string;
  supplier: string;
  mobile: string;
  unit: string;
  rate: number;
  location: string;
  description: string;
  status: string;
  sourceKey: string;
};

const norm = (v: any) => String(v ?? "").trim();
const money = (v: any) => {
  const n = Number(String(v ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export default function Marketplace() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sourceType, setSourceType] = useState("All");

  const normalizeItem = (raw: any, sourceKey: string, index: number): MarketItem | null => {
    if (!raw || typeof raw !== "object") return null;

    const skipKey = sourceKey.toLowerCase();
    if (
      skipKey.includes("user") ||
      skipKey.includes("project") ||
      skipKey.includes("transaction") ||
      skipKey.includes("ticket") ||
      skipKey.includes("payment")
    ) return null;

    const title =
      norm(raw.productName) ||
      norm(raw.itemName) ||
      norm(raw.material) ||
      norm(raw.materialName) ||
      norm(raw.equipment) ||
      norm(raw.machineName) ||
      norm(raw.service) ||
      norm(raw.labourName) ||
      norm(raw.trade) ||
      norm(raw.name) ||
      norm(raw.item);

    const rate = money(raw.rate ?? raw.price ?? raw.rent ?? raw.dailyRate ?? raw.amount);
    const commercialSignal =
      title &&
      (
        rate > 0 ||
        raw.unit ||
        raw.category ||
        raw.supplier ||
        raw.vendor ||
        raw.mobile ||
        raw.phone ||
        raw.trade ||
        raw.equipment ||
        raw.service
      );

    if (!commercialSignal) return null;

    let type = "Supplier";
    if (skipKey.includes("machine") || raw.equipment || raw.machineName || raw.rent || raw.dailyRate) type = "Machine Hire";
    if (skipKey.includes("labour") || raw.labourName || raw.trade || raw.workerCount) type = "Labour Supply";
    if (skipKey.includes("contractor")) type = "Contractor";
    if (skipKey.includes("realestate")) type = "Real Estate";

    return {
      id: norm(raw.id) || `${sourceKey}-${index}`,
      title,
      category: norm(raw.category) || norm(raw.trade) || norm(raw.module) || type,
      sourceType: type,
      supplier: norm(raw.supplierName) || norm(raw.supplier) || norm(raw.vendorName) || norm(raw.companyName) || norm(raw.ownerName) || norm(raw.name) || type,
      mobile: norm(raw.mobile) || norm(raw.phone) || norm(raw.supplierMobile) || norm(raw.contact) || norm(raw.ownerMobile),
      unit: norm(raw.unit) || norm(raw.uom) || (type === "Machine Hire" ? "day" : type === "Labour Supply" ? "day" : "unit"),
      rate,
      location: norm(raw.location) || norm(raw.city) || norm(raw.address) || "Local",
      description: norm(raw.description) || norm(raw.remarks) || norm(raw.details) || "",
      status: norm(raw.status) || "Active",
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
          ["products", "items", "materials", "equipment", "machines", "labour", "services", "uploads", "approvals"].forEach((k) => {
            if (Array.isArray(parsed[k])) arrays.push(parsed[k]);
          });
        }

        arrays.forEach((arr) => {
          arr.forEach((raw, idx) => {
            const item = normalizeItem(raw, key, idx);
            if (item) output.push(item);
          });
        });
      }
    } catch (err) {
      console.error("Marketplace load failed", err);
    }

    const unique = Array.from(new Map(output.map((x) => [`${x.sourceKey}-${x.id}-${x.title}`, x])).values());
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
  const sourceTypes = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.sourceType).filter(Boolean)))], [items]);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.supplier.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    const matchesCategory = category === "All" || item.category === category;
    const matchesSource = sourceType === "All" || item.sourceType === sourceType;
    return matchesSearch && matchesCategory && matchesSource;
  });

  const enquire = (item: MarketItem) => {
    const enquiry = {
      id: Date.now(),
      itemId: item.id,
      itemTitle: item.title,
      category: item.category,
      sourceType: item.sourceType,
      supplier: item.supplier,
      mobile: item.mobile,
      rate: item.rate,
      date: new Date().toISOString(),
      status: "New"
    };

    const old = JSON.parse(localStorage.getItem("bm_marketplace_enquiries") || "[]");
    localStorage.setItem("bm_marketplace_enquiries", JSON.stringify([...old, enquiry]));
    alert("Enquiry saved. You can also contact by WhatsApp.");
  };

  const whatsapp = (item: MarketItem) => {
    const msg = encodeURIComponent(
      `BuildMitra enquiry\n\nItem: ${item.title}\nCategory: ${item.category}\nRate: ₹${item.rate}/${item.unit}\nSupplier: ${item.supplier}`
    );
    const mobile = item.mobile.replace(/[^0-9]/g, "");
    if (mobile) window.open(`https://wa.me/${mobile}?text=${msg}`, "_blank");
    else alert("Mobile number not available for this item.");
  };

  return (
    <div style={{ padding: 20, background: "#f3f4f6", minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={{ background: "#800020", color: "white", padding: 20, borderRadius: 14, marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>BuildMitra Marketplace</h1>
        <p style={{ margin: "6px 0 0" }}>Supplier products, machine hire, labour services and other uploaded listings</p>
      </div>

      <div style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 20, display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search material, machine, labour, supplier..." style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
          {sourceTypes.map(t => <option key={t}>{t}</option>)}
        </select>
        <button onClick={loadMarketplace} style={{ background: "#800020", color: "white", border: 0, borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Refresh</button>
      </div>

      <div style={{ marginBottom: 12, fontWeight: "bold" }}>Showing {filtered.length} of {items.length} listings</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {filtered.map((item) => (
          <div key={`${item.sourceKey}-${item.id}`} style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 12, color: "#800020", fontWeight: "bold" }}>{item.sourceType} • {item.category}</div>
            <h3 style={{ margin: "8px 0" }}>{item.title}</h3>
            <div>Rate: <strong>₹{item.rate.toLocaleString()}</strong> / {item.unit}</div>
            <div>By: {item.supplier}</div>
            <div>Location: {item.location}</div>
            {item.description && <p style={{ color: "#555" }}>{item.description}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => enquire(item)} style={{ flex: 1, background: "#17a2b8", color: "white", border: 0, borderRadius: 8, padding: 10, cursor: "pointer" }}>Enquiry</button>
              <button onClick={() => whatsapp(item)} style={{ flex: 1, background: "#28a745", color: "white", border: 0, borderRadius: 8, padding: 10, cursor: "pointer" }}>WhatsApp</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: "white", padding: 30, borderRadius: 12, textAlign: "center", color: "#666" }}>
          No marketplace uploads found. Add products/equipment/labour from Supplier, Machine Hire or Labour dashboards, then click Refresh.
        </div>
      )}
    </div>
  );
}
