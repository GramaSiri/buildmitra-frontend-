import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getApiBase } from "../utils/apiConfig";

const API_BASE = getApiBase();

export type MasterItemRecord = {
  _id?: string;
  masterItemCode: string;
  legacyCode?: string;
  itemType?: string;
  category?: string;
  subCategory?: string;
  itemName?: string;
  brand?: string;
  specification?: string;
  unit?: string;
  gst?: number;
  referenceRate?: number;
  currentRate?: number;
  rate?: number;
  imageUrl?: string;
  status?: string;
  isActive?: boolean;
  imageStatus?: string;
  imageVerified?: boolean;
  updatedAt?: string;
  images?: any[];
};

type UploadResult = {
  success: boolean;
  total?: number;
  matchedCount?: number;
  unmatchedCount?: number;
  matched?: Array<{
    originalName: string;
    masterItemCode: string;
    itemName?: string;
    imageUrl?: string;
  }>;
  unmatched?: Array<{
    originalName: string;
    masterItemCode?: string;
    reason?: string;
  }>;
  message?: string;
};

function normalizeMasterCode(code?: string): string {
  if (!code) return "";
  const str = String(code).trim();
  if (/^MAT-\d+$/i.test(str)) return str.toUpperCase();
  const matchCeme = str.match(/^CEME(\d+)$/i);
  if (matchCeme) return "MAT-" + matchCeme[1].padStart(6, "0");
  const matchTmt = str.match(/^TMT\s*(\d+)$/i);
  if (matchTmt) return "MAT-" + matchTmt[1].padStart(6, "0");
  const matchDigits = str.match(/^(\d+)$/);
  if (matchDigits) return "MAT-" + matchDigits[1].padStart(6, "0");
  return str.toUpperCase();
}

function absoluteImageUrl(value?: string) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function AdminMasterImageLibrary() {
  const router = useRouter();

  const [items, setItems] = useState<MasterItemRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(50);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<MasterItemRecord | null>(null);
  const [editRate, setEditRate] = useState<string>("");
  const [editName, setEditName] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editBrand, setEditBrand] = useState<string>("");
  const [editUnit, setEditUnit] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    masterItemCode: "",
    itemName: "",
    category: "",
    subCategory: "",
    brand: "",
    specification: "",
    unit: "NOS",
    referenceRate: 0,
    itemType: "material"
  });

  const loadItems = async (targetPage = page) => {
    try {
      setLoading(true);
      setMessage("");

      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("page", String(targetPage));

      if (search.trim()) {
        params.set("search", search.trim());
      }
      if (categoryFilter) {
        params.set("category", categoryFilter);
      }

      const response = await fetch(`${API_BASE}/api/provider/master-items?${params.toString()}`);
      const data = await response.json();

      if (data && Array.isArray(data.items)) {
        setItems(data.items);
        setTotalCount(data.total || data.count || data.items.length);
      } else {
        setItems([]);
        setTotalCount(0);
      }
    } catch (error: any) {
      setMessage(error.message || "Could not load master catalogue items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(1);
  }, [search, categoryFilter, statusFilter]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === "active" && item.status === "inactive") return false;
      if (statusFilter === "inactive" && item.status !== "inactive") return false;
      if (statusFilter === "has_image" && !item.imageUrl) return false;
      if (statusFilter === "no_image" && item.imageUrl) return false;
      return true;
    });
  }, [items, statusFilter]);

  const handleUpdateRate = async (item: MasterItemRecord, newRate: number) => {
    try {
      setMessage("");
      const res = await fetch(`${API_BASE}/api/admin/master-items/${encodeURIComponent(item.masterItemCode)}/rate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify({ referenceRate: newRate, currentRate: newRate, rate: newRate })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Rate updated for ${item.masterItemCode} to ₹${newRate}`);
        setItems(prev => prev.map(i => i.masterItemCode === item.masterItemCode ? { ...i, referenceRate: newRate, currentRate: newRate, rate: newRate } : i));
      } else {
        setMessage(data.message || "Failed to update rate");
      }
    } catch (err: any) {
      setMessage(`Rate update error: ${err.message}`);
    }
  };

  const handleToggleActive = async (item: MasterItemRecord) => {
    const nextStatus = item.status === "inactive" ? "active" : "inactive";
    try {
      setMessage("");
      const res = await fetch(`${API_BASE}/api/admin/master-items/${encodeURIComponent(item.masterItemCode)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify({ status: nextStatus, isActive: nextStatus === "active" })
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setMessage(`Item ${item.masterItemCode} marked as ${nextStatus}`);
        setItems(prev => prev.map(i => i.masterItemCode === item.masterItemCode ? { ...i, status: nextStatus, isActive: nextStatus === "active" } : i));
      }
    } catch (err: any) {
      setMessage(`Status update error: ${err.message}`);
    }
  };

  const handleDeleteItem = async (item: MasterItemRecord) => {
    const confirmDelete = window.confirm(
      `Safely delete or deactivate ${item.masterItemCode} (${item.itemName})?\nIf referenced in marketplace or enquiries, it will be safely deactivated to preserve history.`
    );
    if (!confirmDelete) return;

    try {
      setMessage("");
      const res = await fetch(`${API_BASE}/api/admin/master-items/${encodeURIComponent(item.masterItemCode)}`, {
        method: "DELETE",
        headers: { "x-user-role": "admin" }
      });
      const data = await res.json();
      setMessage(data.message || `Master item ${item.masterItemCode} processed.`);
      loadItems(page);
    } catch (err: any) {
      setMessage(`Delete error: ${err.message}`);
    }
  };

  const uploadFiles = async (files: FileList | null, uploadType: "images" | "folder") => {
    if (!files || !files.length) return;
    try {
      setUploading(true);
      setMessage("");
      setResult(null);

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        const normCode = normalizeMasterCode(file.name.substring(0, file.name.lastIndexOf(".")) || file.name);
        const ext = file.name.substring(file.name.lastIndexOf(".")) || ".png";
        formData.append("images", file, `${normCode}${ext}`);
      });
      formData.append("uploadedBy", "ADM-000001");

      const response = await fetch(`${API_BASE}/api/master-images/upload-images`, {
        method: "POST",
        headers: { "x-user-role": "admin", "x-user-code": "ADM-000001" },
        body: formData
      });

      const data: UploadResult = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || `${uploadType} upload failed.`);
      }

      setResult(data);
      setMessage(`Upload completed: ${data.matchedCount || 0} matched, ${data.unmatchedCount || 0} unmatched.`);
      await loadItems(page);
    } catch (error: any) {
      setMessage(error.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>BUILDMITRA ADMIN</div>
          <h1 style={styles.title}>Master Images & Rates Library</h1>
          <p style={styles.subtitle}>
            Authoritative Master Catalogue: <strong>{totalCount.toLocaleString()}</strong> items in MongoDB Atlas.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={() => setShowAddModal(true)} style={styles.primaryButton}>
            + Add Master Item
          </button>
          <button type="button" onClick={() => router.push("/admin-dashboard")} style={styles.secondaryButton}>
            ← Admin Dashboard
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{totalCount.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Master Items</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: "#166534" }}>
            {items.filter(i => i.imageUrl).length}
          </div>
          <div style={styles.statLabel}>Images Verified</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: "#ca8a04" }}>
            {items.filter(i => Number(i.referenceRate || i.currentRate || i.rate || 0) > 0).length}
          </div>
          <div style={styles.statLabel}>Rates Configured</div>
        </div>
      </div>

      {/* Upload Controls */}
      <div style={styles.uploadCard}>
        <h2 style={styles.sectionTitle}>Bulk Master Image & Rate Sync</h2>
        <div style={styles.uploadButtons}>
          <label style={styles.primaryButton}>
            Upload Master Images
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              disabled={uploading}
              onChange={(e) => {
                uploadFiles(e.target.files, "images");
                e.currentTarget.value = "";
              }}
              style={{ display: "none" }}
            />
          </label>

          <label style={styles.primaryButton}>
            Upload Folder
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              disabled={uploading}
              onChange={(e) => {
                uploadFiles(e.target.files, "folder");
                e.currentTarget.value = "";
              }}
              style={{ display: "none" }}
              {...({ webkitdirectory: "", directory: "" } as any)}
            />
          </label>
        </div>

        {uploading && <div style={styles.progressMessage}>Syncing and verifying master items...</div>}
        {message && <div style={styles.message}>{message}</div>}
      </div>

      {/* Search & Filter Bar */}
      <div style={styles.libraryCard}>
        <div style={styles.libraryHeader}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "100%" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Code (MAT-000001, CEME000195), Item Name, Brand, Category..."
              style={styles.searchInput}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.selectFilter}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="has_image">Has Image</option>
              <option value="no_image">No Image</option>
            </select>
          </div>
        </div>

        {/* Master Item Table */}
        {loading ? (
          <div style={styles.empty}>Loading Master Catalogue from MongoDB...</div>
        ) : !filteredItems.length ? (
          <div style={styles.empty}>No Master Items found matching search criteria.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Code / Legacy</th>
                  <th style={styles.th}>Item Name</th>
                  <th style={styles.th}>Category / Sub</th>
                  <th style={styles.th}>Brand / Spec</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Reference Rate (₹)</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const img = absoluteImageUrl(item.imageUrl);
                  const displayRate = Number(item.referenceRate || item.currentRate || item.rate || 0);

                  return (
                    <tr key={item.masterItemCode} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={styles.td}>
                        {img ? (
                          <img src={img} alt={item.itemName} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }} />
                        ) : (
                          <div style={{ width: 44, height: 44, background: "#f1f5f9", color: "#94a3b8", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>No Image</div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <strong style={{ color: "#0f172a" }}>{item.masterItemCode}</strong>
                        {item.legacyCode && item.legacyCode !== item.masterItemCode && (
                          <div style={{ fontSize: 10, color: "#64748b" }}>Legacy: {item.legacyCode}</div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>{item.itemName}</div>
                      </td>
                      <td style={styles.td}>
                        <div>{item.category || "—"}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>{item.subCategory}</div>
                      </td>
                      <td style={styles.td}>
                        <div>{item.brand || "Generic"}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>{item.specification}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.unitBadge}>{item.unit || "NOS"}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontWeight: 800, color: "#166534" }}>₹{displayRate}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const val = prompt(`Enter new reference rate for ${item.masterItemCode}:`, String(displayRate));
                              if (val !== null && !isNaN(Number(val))) {
                                handleUpdateRate(item, Number(val));
                              }
                            }}
                            style={{ background: "none", border: 0, color: "#2563eb", cursor: "pointer", fontSize: 11 }}
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          style={{
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "10px",
                            fontWeight: 800,
                            border: 0,
                            cursor: "pointer",
                            background: item.status === "inactive" ? "#fee2e2" : "#dcfce7",
                            color: item.status === "inactive" ? "#991b1b" : "#166534"
                          }}
                        >
                          {item.status === "inactive" ? "Inactive" : "Active"}
                        </button>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <label style={styles.smallBtn}>
                            Img
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  const file = e.target.files[0];
                                  const transfer = new DataTransfer();
                                  transfer.items.add(new File([file], `${item.masterItemCode}.png`, { type: file.type }));
                                  uploadFiles(transfer.files, "images");
                                }
                              }}
                            />
                          </label>
                          <button type="button" onClick={() => handleDeleteItem(item)} style={{ ...styles.smallBtn, background: "#ef4444", color: "#fff" }}>
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Showing page {page} of {Math.ceil(totalCount / limit) || 1} ({totalCount.toLocaleString()} total Master Items)
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                loadItems(p);
              }}
              style={styles.secondaryButton}
            >
              Previous Page
            </button>
            <button
              type="button"
              disabled={page * limit >= totalCount}
              onClick={() => {
                const p = page + 1;
                setPage(p);
                loadItems(p);
              }}
              style={styles.secondaryButton}
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: "16px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" },
  eyebrow: { color: "#2563eb", fontWeight: 800, fontSize: "11px", letterSpacing: "1px" },
  title: { margin: "2px 0", fontSize: "24px", fontWeight: "800", color: "#0f172a" },
  subtitle: { margin: 0, color: "#64748b", fontSize: "13px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "16px" },
  statCard: { background: "#ffffff", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" },
  statNumber: { fontSize: "22px", fontWeight: "800", color: "#0f172a" },
  statLabel: { fontSize: "11px", color: "#64748b", marginTop: "2px" },
  uploadCard: { background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", margin: "0 0 10px 0" },
  uploadButtons: { display: "flex", gap: "8px", flexWrap: "wrap" },
  primaryButton: { background: "#2563eb", color: "#ffffff", border: 0, padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-block" },
  secondaryButton: { background: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" },
  smallBtn: { background: "#3b82f6", color: "#ffffff", border: 0, padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer" },
  progressMessage: { marginTop: "10px", fontSize: "12px", color: "#2563eb" },
  message: { marginTop: "10px", padding: "8px 12px", background: "#f0fdf4", color: "#166534", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
  libraryCard: { background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" },
  libraryHeader: { marginBottom: "12px" },
  searchInput: { flex: 1, minWidth: "220px", padding: "8px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1" },
  selectFilter: { padding: "8px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff" },
  empty: { padding: "30px", textAlign: "center", color: "#64748b", fontSize: "13px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "12px" },
  th: { padding: "8px 10px", fontSize: "11px", fontWeight: "700", color: "#475569", borderBottom: "2px solid #e2e8f0" },
  td: { padding: "8px 10px", verticalAlign: "middle" },
  unitBadge: { background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }
};
