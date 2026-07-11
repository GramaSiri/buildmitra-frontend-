import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

const roleType: Record<string, string> = {
  supplier: "material",
  contractor: "service",
  laboursupply: "labour",
  machinehire: "machine",
  vendor: "vendor",
};

function getCurrentUser() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("loggedInUser") || localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export default function ProviderSelectItems() {
  const [user, setUser] = useState<any>({});
  const [items, setItems] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [rates, setRates] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({ search: "", itemType: "", category: "", subCategory: "", brand: "", selectedView: "all", page: 1 });
  const [request, setRequest] = useState({ proposedItemName: "", brand: "", specification: "", imageUrl: "", remarks: "" });
  const limit = 25;

  const providerCode = String(user.userCode || user.uniqueCode || user.providerUserCode || "").toUpperCase();
  const providerRole = String(user.businessRole || user.role || "").toLowerCase();
  const defaultType = roleType[providerRole] || "";
  const isSupplier = defaultType === "material";

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", String(limit));
    p.set("page", String(filters.page));
    const type = isSupplier ? "material" : (filters.itemType || defaultType);
    if (type) p.set("itemType", type);
    ["search", "category", "subCategory", "brand"].forEach((key) => {
      const value = (filters as any)[key];
      if (value) p.set(key, value);
    });
    return p.toString();
  }, [filters, defaultType, isSupplier]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/provider/master-items?${query}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyListings = async (code: string) => {
    if (!code) return;
    try {
      const res = await fetch(`${API_BASE}/api/provider/my-listings/${encodeURIComponent(code)}`);
      const data = await res.json();
      setMyListings(data.listings || []);
    } catch {
      setMyListings([]);
    }
  };

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    const code = String(current.userCode || current.uniqueCode || current.providerUserCode || "").toUpperCase();
    loadMyListings(code);
  }, []);

  useEffect(() => {
    loadItems();
  }, [query]);

  const selectedCodes = useMemo(() => new Set(myListings.map((x) => x.masterItemCode)), [myListings]);
  const visibleItems = items.filter((item) => {
    if (filters.selectedView === "selected") return selected[item.masterItemCode] || selectedCodes.has(item.masterItemCode);
    if (filters.selectedView === "unselected") return !selected[item.masterItemCode] && !selectedCodes.has(item.masterItemCode);
    return true;
  });

  const submitSelected = async () => {
    const rows = Object.keys(selected)
      .filter((code) => selected[code])
      .map((masterItemCode) => ({ masterItemCode, rate: Number(rates[masterItemCode] || 0) }))
      .filter((row) => row.rate > 0);
    if (!providerCode) return alert("Provider user code not found. Please login again.");
    if (!rows.length) return alert("Select items and enter valid rates.");
    const provider = {
      providerUserCode: providerCode,
      providerRole,
      providerName: user.companyName || user.name,
      providerPhone: user.phone || user.mobile || user.officePhone,
      providerAddress: user.address,
      city: user.city || user.location,
      pincode: user.pincode,
    };
    const res = await fetch(`${API_BASE}/api/provider/marketplace-listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, items: rows }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return alert(data.message || (data.errors || []).map((e: any) => e.message).join("\n") || "Could not submit listings");
    alert(`${data.listings.length} listing(s) sent for admin approval.`);
    setSelected({});
    setRates({});
    loadMyListings(providerCode);
  };

  const requestNewItem = async () => {
    if (!request.proposedItemName.trim()) return alert("Enter Item name.");
    const res = await fetch(`${API_BASE}/api/provider/new-item-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...request,
        itemType: filters.itemType || defaultType || "material",
        providerUserCode: providerCode,
        providerRole,
        providerName: user.companyName || user.name,
        providerPhone: user.phone || user.mobile || user.officePhone,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return alert(data.message || "Could not send request");
    alert("New item request sent to admin.");
    setRequest({ proposedItemName: "", brand: "", specification: "", imageUrl: "", remarks: "" });
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Add Your Rates</h1>
          <p style={styles.sub}>Select item type, choose master items, enter your rate, then submit for marketplace approval.</p>
        </div>
        <button style={styles.secondaryButton} onClick={() => window.history.back()}>Back</button>
      </div>

      <div style={styles.profileStrip}>
        <strong>{user.companyName || user.name || "Provider"}</strong>
        <span>{providerCode || "No code"}</span>
        <span>{providerRole || "role"}</span>
        <span>{user.city || user.address || "Profile city/address controlled by admin/profile"}</span>
      </div>

      <div style={styles.filters}>
        <input style={styles.input} placeholder="Search item name / code / brand" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
        <select style={styles.input} value={isSupplier ? "material" : (filters.itemType || defaultType)} disabled={isSupplier} onChange={(e) => setFilters({ ...filters, itemType: e.target.value, page: 1 })}>
          {!isSupplier && <option value="">All item types</option>}
          <option value="material">Material</option>
          <option value="service">Contractor Service</option>
          <option value="labour">Labour</option>
          <option value="machine">Machine</option>
          <option value="vendor">Vendor Product</option>
        </select>
        <input style={styles.input} placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })} />
        <input style={styles.input} placeholder="Subcategory" value={filters.subCategory} onChange={(e) => setFilters({ ...filters, subCategory: e.target.value, page: 1 })} />
        <input style={styles.input} placeholder="Brand" value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value, page: 1 })} />
        <select style={styles.input} value={filters.selectedView} onChange={(e) => setFilters({ ...filters, selectedView: e.target.value })}>
          <option value="all">All</option>
          <option value="selected">Selected</option>
          <option value="unselected">Unselected</option>
        </select>
      </div>

      <div style={styles.toolbar}>
        
        
        <button style={styles.successButton} onClick={submitSelected}>Save Selected Rates</button>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["", "Image", "Master Code", "Item", "Brand", "Specification", "Unit", "Rate"].map((h) => <th key={h} style={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td style={styles.td} colSpan={8}>Loading master items...</td></tr>
            ) : visibleItems.length === 0 ? (
              <tr><td style={styles.td} colSpan={8}>No master items found.</td></tr>
            ) : visibleItems.map((item) => (
              <tr key={item.masterItemCode}>
                <td style={styles.td}><input type="checkbox" checked={Boolean(selected[item.masterItemCode])} onChange={(e) => setSelected({ ...selected, [item.masterItemCode]: e.target.checked })} /></td>
                <td style={styles.td}><img src={item.imageUrl || `/master-images/${item.masterItemCode}.webp`} alt={item.itemName} style={styles.thumb} onError={(e) => { const img = e.currentTarget as HTMLImageElement; const slug = String(item.category || "default").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); if (!img.dataset.fallback) { img.dataset.fallback = "1"; img.src = `/master-images/category-${slug}.svg`; } else { img.src = "/master-images/category-default.svg"; } }} /></td>
                <td style={styles.td}><strong>{item.masterItemCode}</strong>{selectedCodes.has(item.masterItemCode) ? <div style={styles.badge}>Submitted</div> : null}</td>
                <td style={styles.td}>{item.itemName}<div style={styles.muted}>{item.category} {item.subCategory ? `/ ${item.subCategory}` : ""}</div></td>
                <td style={styles.td}>{item.brand || "-"}</td>
                <td style={styles.td}>{item.specification || "-"}</td>
                <td style={styles.td}>{item.unit || "-"}</td>
                <td style={styles.td}><input style={styles.rateInput} type="number" min="0" value={rates[item.masterItemCode] || ""} onChange={(e) => setRates({ ...rates, [item.masterItemCode]: e.target.value })} placeholder="Rate" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.pager}>
        <button style={styles.secondaryButton} onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}>Prev</button>
        <span>Page {filters.page}</span>
        <button style={styles.secondaryButton} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
      </div>

      <div style={styles.requestBox}>
        <h2 style={styles.sectionTitle}>Request Missing Item</h2>
        <div style={styles.requestGrid}>
          <input style={styles.input} placeholder="Item name" value={request.proposedItemName} onChange={(e) => setRequest({ ...request, proposedItemName: e.target.value })} />
          <input style={styles.input} placeholder="Brand" value={request.brand} onChange={(e) => setRequest({ ...request, brand: e.target.value })} />
          <input style={styles.input} placeholder="Specification" value={request.specification} onChange={(e) => setRequest({ ...request, specification: e.target.value })} />
          <input style={styles.input} placeholder="Photo URL optional" value={request.imageUrl} onChange={(e) => setRequest({ ...request, imageUrl: e.target.value })} />
          <input style={styles.inputWide} placeholder="Remarks" value={request.remarks} onChange={(e) => setRequest({ ...request, remarks: e.target.value })} />
          <button style={styles.button} onClick={requestNewItem}>Send Request</button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f4f6f8", padding: 24, fontFamily: "Arial, sans-serif", color: "#172033" },
  header: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", maxWidth: 1280, margin: "0 auto 16px" },
  title: { margin: 0, fontSize: 28 },
  sub: { margin: "6px 0 0", color: "#667085" },
  profileStrip: { maxWidth: 1280, margin: "0 auto 14px", display: "flex", gap: 14, flexWrap: "wrap", background: "#fff", border: "1px solid #d8dee8", padding: 12, borderRadius: 8 },
  filters: { maxWidth: 1280, margin: "0 auto 12px", display: "grid", gridTemplateColumns: "220px 1fr 220px", gap: 8 },
  input: { padding: "10px 12px", border: "1px solid #cfd6e4", borderRadius: 8, background: "#fff" },
  inputWide: { padding: "10px 12px", border: "1px solid #cfd6e4", borderRadius: 8, background: "#fff", gridColumn: "span 2" },
  toolbar: { maxWidth: 1280, margin: "0 auto 12px", display: "flex", gap: 8, flexWrap: "wrap" },
  button: { border: 0, background: "#155eef", color: "#fff", padding: "10px 14px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  successButton: { border: 0, background: "#138a4e", color: "#fff", padding: "10px 14px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  secondaryButton: { border: "1px solid #cfd6e4", background: "#fff", color: "#172033", padding: "10px 14px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  tableWrap: { maxWidth: 1280, margin: "0 auto", overflowX: "auto", background: "#fff", border: "1px solid #d8dee8", borderRadius: 8 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 10, background: "#eef2f7", borderBottom: "1px solid #d8dee8", fontSize: 13 },
  td: { padding: 10, borderBottom: "1px solid #edf0f5", verticalAlign: "middle", fontSize: 14 },
  thumb: { width: 52, height: 52, borderRadius: 6, objectFit: "cover", background: "#eef2f7" },
  rateInput: { width: 110, padding: "9px 10px", border: "1px solid #cfd6e4", borderRadius: 8 },
  muted: { color: "#667085", fontSize: 12, marginTop: 4 },
  badge: { display: "inline-block", marginTop: 4, padding: "2px 6px", borderRadius: 6, background: "#e7f8ef", color: "#087443", fontSize: 11 },
  pager: { maxWidth: 1280, margin: "12px auto", display: "flex", gap: 12, alignItems: "center" },
  requestBox: { maxWidth: 1280, margin: "18px auto 0", background: "#fff", border: "1px solid #d8dee8", borderRadius: 8, padding: 16 },
  sectionTitle: { margin: "0 0 12px", fontSize: 20 },
  requestGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 },
};




