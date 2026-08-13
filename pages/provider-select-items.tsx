import React, { useEffect, useMemo, useState } from "react";
import { normalizeImageUrl, resolveListingImage } from "../utils/imageUrl";
import { getApiBase } from "../utils/apiConfig";

const API_BASE = getApiBase();

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
    return JSON.parse(sessionStorage.getItem("currentUser") || sessionStorage.getItem("loggedInUser") || sessionStorage.getItem("user") || "{}");
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
  const [itemImages, setItemImages] = useState<Record<string, Array<{ url: string; isPrimary: boolean }>>>({});
  const [uploadingItem, setUploadingItem] = useState<string>("");
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

  // Handle uploading product images (Target 3 & Target 5: Max 5 files, 5MB limit, JPG/PNG/WEBP)
  const handleImageUpload = async (masterItemCode: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const existingCount = (itemImages[masterItemCode] || []).length;
    if (existingCount + files.length > 5) {
      alert("Maximum 5 product images allowed per item.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds maximum allowed size of 5MB.`);
        return;
      }
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        alert(`File "${file.name}" format not allowed. Only JPG, JPEG, PNG, WEBP are accepted.`);
        return;
      }
      formData.append("images", file);
    }

    setUploadingItem(masterItemCode);
    try {
      const res = await fetch(`${API_BASE}/api/marketplace/upload-images`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to upload product images");
        return;
      }

      const uploadedFiles =
        Array.isArray(data.images) && data.images.length
          ? data.images
          : Array.isArray(data.files)
            ? data.files
            : [];

      const newImgs = uploadedFiles
        .map((file: any, index: number) => ({
          url: String(file?.url || "").trim(),
          isPrimary:
            existingCount === 0 &&
            index === 0,
        }))
        .filter((image: any) => image.url);

      if (!newImgs.length) {
        alert("Upload completed, but no valid image URL was returned.");
        return;
      }

      setItemImages((previous) => {
        const existing = previous[masterItemCode] || [];
        const combined = [...existing, ...newImgs].slice(0, 5);

        if (!combined.some((image) => image.isPrimary) && combined.length) {
          combined[0] = {
            ...combined[0],
            isPrimary: true,
          };
        }

        return {
          ...previous,
          [masterItemCode]: combined,
        };
      });

      setSelected((previous) => ({
        ...previous,
        [masterItemCode]: true,
      }));

      e.target.value = "";
    } catch (err: any) {
      alert(err.message || "Image upload failed");
    } finally {
      setUploadingItem("");
    }
  };

  const removeUploadedImage = (masterItemCode: string, index: number) => {
    setItemImages((prev) => {
      const current = [...(prev[masterItemCode] || [])];
      current.splice(index, 1);
      if (current.length > 0 && !current.some((i) => i.isPrimary)) {
        current[0].isPrimary = true;
      }
      return { ...prev, [masterItemCode]: current };
    });
  };

  const setPrimaryImage = (masterItemCode: string, index: number) => {
    setItemImages((prev) => {
      const current = (prev[masterItemCode] || []).map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }));
      return { ...prev, [masterItemCode]: current };
    });
  };

  const submitSelected = async () => {
    const rows = Object.keys(selected)
      .filter((code) => selected[code])
      .map((masterItemCode) => {
        const imgs = (itemImages[masterItemCode] || [])
          .map((image) => ({
            url: String(image.url || "").trim(),
            isPrimary: Boolean(image.isPrimary),
          }))
          .filter((image) => image.url);

        if (imgs.length && !imgs.some((image) => image.isPrimary)) {
          imgs[0].isPrimary = true;
        }

        const primaryObj =
          imgs.find((image) => image.isPrimary) ||
          imgs[0];

        return {
          masterItemCode,
          rate: Number(rates[masterItemCode] || 0),
          images: imgs,
          imageUrl: primaryObj?.url || "",
        };
      })
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
    setItemImages({});
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
          <h1 style={styles.title}>Add Your Rates & Product Images</h1>
          <p style={styles.sub}>Select item type, upload product images, enter your rate, then submit for marketplace approval.</p>
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
        <button style={styles.successButton} onClick={submitSelected}>Save Selected Rates & Images</button>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["", "Product Image", "Master Code", "Item", "Brand", "Specification", "Unit", "Rate", "Upload Photos"].map((h) => <th key={h} style={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td style={styles.td} colSpan={9}>Loading master items...</td></tr>
            ) : visibleItems.length === 0 ? (
              <tr><td style={styles.td} colSpan={9}>No master items found.</td></tr>
            ) : visibleItems.map((item) => {
              const uploadedImgs = itemImages[item.masterItemCode] || [];
              const uploadedDisplayUrl =
                normalizeImageUrl(
                  uploadedImgs.find((image) => image.isPrimary)?.url ||
                  uploadedImgs[0]?.url
                );

              const displayUrl =
                uploadedDisplayUrl ||
                resolveListingImage(item) ||
                normalizeImageUrl(item.imageUrl);

              return (
                <tr key={item.masterItemCode}>
                  <td style={styles.td}><input type="checkbox" checked={Boolean(selected[item.masterItemCode])} onChange={(e) => setSelected({ ...selected, [item.masterItemCode]: e.target.checked })} /></td>
                  <td style={styles.td}>
                    {displayUrl ? (
                      <img src={displayUrl} alt={item.itemName} style={styles.thumb} onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }} />
                    ) : (
                      <div style={styles.placeholderThumb}>ðŸ—ï¸</div>
                    )}
                  </td>
                  <td style={styles.td}><strong>{item.masterItemCode}</strong>{selectedCodes.has(item.masterItemCode) ? <div style={styles.badge}>Submitted</div> : null}</td>
                  <td style={styles.td}>{item.itemName}<div style={styles.muted}>{item.category} {item.subCategory ? `/ ${item.subCategory}` : ""}</div></td>
                  <td style={styles.td}>{item.brand || "-"}</td>
                  <td style={styles.td}>{item.specification || "-"}</td>
                  <td style={styles.td}>{item.unit || "-"}</td>
                  <td style={styles.td}><input style={styles.rateInput} type="number" min="0" value={rates[item.masterItemCode] || ""} onChange={(e) => setRates({ ...rates, [item.masterItemCode]: e.target.value })} placeholder="Rate" /></td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        id={`file-${item.masterItemCode}`}
                        style={{ display: "none" }}
                        onChange={(e) => handleImageUpload(item.masterItemCode, e)}
                      />
                      <label htmlFor={`file-${item.masterItemCode}`} style={styles.uploadBtn}>
                        {uploadingItem === item.masterItemCode ? "Uploading..." : `ðŸ“· Select Photos (${uploadedImgs.length}/5)`}
                      </label>

                      {/* Image Previews */}
                      {uploadedImgs.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                          {uploadedImgs.map((img, idx) => (
                            <div key={idx} style={{ position: "relative" }}>
                              <img
                                src={normalizeImageUrl(img.url) || ""}
                                alt="preview"
                                style={{ width: 36, height: 36, borderRadius: 4, border: img.isPrimary ? "2px solid #138a4e" : "1px solid #ccc", objectFit: "cover", cursor: "pointer" }}
                                title={img.isPrimary ? "Primary Image" : "Click to set primary"}
                                onClick={() => setPrimaryImage(item.masterItemCode, idx)}
                              />
                              <span
                                style={styles.removeBtn}
                                onClick={() => removeUploadedImage(item.masterItemCode, idx)}
                                title="Remove photo"
                              >
                                Ã—
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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
  thumb: { width: 48, height: 48, borderRadius: 6, objectFit: "cover", background: "#eef2f7" },
  placeholderThumb: { width: 48, height: 48, borderRadius: 6, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  rateInput: { width: 110, padding: "9px 10px", border: "1px solid #cfd6e4", borderRadius: 8 },
  uploadBtn: { background: "#17a2b8", color: "#fff", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-block", textAlign: "center" },
  removeBtn: { position: "absolute", top: -4, right: -4, background: "#dc3545", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: "bold" },
  muted: { color: "#667085", fontSize: 12, marginTop: 4 },
  badge: { display: "inline-block", marginTop: 4, padding: "2px 6px", borderRadius: 6, background: "#e7f8ef", color: "#087443", fontSize: 11 },
  pager: { maxWidth: 1280, margin: "12px auto", display: "flex", gap: 12, alignItems: "center" },
  requestBox: { maxWidth: 1280, margin: "18px auto 0", background: "#fff", border: "1px solid #d8dee8", borderRadius: 8, padding: 16 },
  sectionTitle: { margin: "0 0 12px", fontSize: 20 },
  requestGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 },
};


