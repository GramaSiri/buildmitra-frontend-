import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { normalizeImageUrl, resolveListingImage } from "../utils/imageUrl";
import { getApiBase } from "../utils/apiConfig";

// Safe fetch wrapper that validates JSON response before parsing
async function safeFetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Server returned non-JSON response (Status ${res.status}). Please verify backend server is running.`
    );
  }
  return await res.json();
}

function getCurrentUser() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      sessionStorage.getItem("currentUser") ||
      sessionStorage.getItem("loggedInUser") ||
      sessionStorage.getItem("user") ||
      "{}"
    );
  } catch {
    return {};
  }
}

// Stable, Non-Blinking Product Thumbnail Component with Fallback Locking
function ProductThumbnail({ item }: { item: any }) {
  const resolvedUrl = useMemo(() => {
    return (
      resolveListingImage(item) ||
      normalizeImageUrl(item?.imageUrl) ||
      "/images/master-materials/material-default.png"
    );
  }, [item?.imageUrl, item?.images]);

  const [imgSrc, setImgSrc] = useState(resolvedUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(resolvedUrl);
    setHasError(false);
  }, [resolvedUrl]);

  if (hasError || !imgSrc) {
    return (
      <div style={styles.placeholderThumb} title={item?.itemName || "Master Item"}>
        📦
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={item?.itemName || "Master Product"}
      style={styles.thumb}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}

export default function ProviderSelectItems() {
  const [user, setUser] = useState<any>({});
  const [items, setItems] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Selections & Commercial Inputs
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [rates, setRates] = useState<Record<string, string>>({});
  const [stocks, setStocks] = useState<Record<string, string>>({});
  const [deliveryTimes, setDeliveryTimes] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  // Bulk rate apply
  const [bulkRateInput, setBulkRateInput] = useState("");
  const [bulkStockInput, setBulkStockInput] = useState("100");

  // Filters: Category -> Subcategory -> Brand -> Search
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    subCategory: "",
    brand: "",
    selectedView: "all",
    page: 1,
  });

  // Missing Item Request State
  const [request, setRequest] = useState({
    proposedItemName: "",
    category: "",
    subCategory: "",
    brand: "",
    specification: "",
    unit: "",
    imageUrl: "",
    remarks: "",
  });

  const providerCode = String(
    user.userCode || user.uniqueCode || user.providerUserCode || ""
  ).toUpperCase();
  const providerRole = String(user.businessRole || user.role || "supplier").toLowerCase();

  // Load existing supplier products to mark already added items
  const loadMyListings = async (code: string) => {
    if (!code) return;
    try {
      const apiBase = getApiBase();
      const data = await safeFetchJson(`${apiBase}/api/provider/my-listings/${encodeURIComponent(code)}`);
      setMyListings(data.listings || []);
    } catch {
      setMyListings([]);
    }
  };

  // Build Query Params for MasterItems
  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", "1000");
    p.set("itemType", "material"); // Suppliers pick active materials
    p.set("status", "active"); // Active Admin catalogue only!
    if (filters.search) p.set("search", filters.search);
    if (filters.category) p.set("category", filters.category);
    if (filters.subCategory) p.set("subCategory", filters.subCategory);
    if (filters.brand) p.set("brand", filters.brand);
    return p.toString();
  }, [filters]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const apiBase = getApiBase();
      const data = await safeFetchJson(`${apiBase}/api/provider/master-items?${query}`);
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    const code = String(
      current.userCode || current.uniqueCode || current.providerUserCode || ""
    ).toUpperCase();
    if (code) loadMyListings(code);
  }, []);

  useEffect(() => {
    loadItems();
  }, [query]);

  // Derive unique categories & subcategories from master items for cascading dropdowns
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.category && set.add(i.category));
    return Array.from(set).sort();
  }, [items]);

  const subCategoriesList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (!filters.category || i.category === filters.category) {
        if (i.subCategory) set.add(i.subCategory);
      }
    });
    return Array.from(set).sort();
  }, [items, filters.category]);

  const brandsList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (!filters.category || i.category === filters.category) {
        if (i.brand) set.add(i.brand);
      }
    });
    return Array.from(set).sort();
  }, [items, filters.category]);

  // Existing Codes Set
  const existingCodesSet = useMemo(() => {
    return new Set(myListings.map((l) => l.masterItemCode));
  }, [myListings]);

  // Filtered Visible Items
  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.selectedView === "selected" && !selected[item.masterItemCode]) {
        return false;
      }
      if (filters.selectedView === "added" && !existingCodesSet.has(item.masterItemCode)) {
        return false;
      }
      return true;
    });
  }, [items, selected, existingCodesSet, filters.selectedView]);

  // Supplier product pagination - 50 products per page.
  // Selection is preserved across pages, but Select/Deselect Page
  // affects only the currently displayed 50 products.
  const ITEMS_PER_PAGE = 50;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / ITEMS_PER_PAGE));

  const pagedItems = visibleItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Any filter/search change starts again from page 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Keep page valid if catalogue/filter result becomes smaller.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Selection Handlers
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const toggleSelectAllFiltered = () => {
    if (pagedItems.length === 0) return;

    const allSelected = pagedItems.every(
      (i) => Boolean(selected[i.masterItemCode])
    );

    const next = { ...selected };

    pagedItems.forEach((i) => {
      next[i.masterItemCode] = !allSelected;
    });

    setSelected(next);
  };

  const applyBulkRateToSelected = () => {
    const rateNum = Number(bulkRateInput);
    if (!rateNum || rateNum <= 0) {
      alert("Please enter a valid rate greater than zero.");
      return;
    }
    const nextRates = { ...rates };
    const nextStocks = { ...stocks };
    visibleItems.forEach((item) => {
      if (selected[item.masterItemCode]) {
        nextRates[item.masterItemCode] = String(rateNum);
        if (bulkStockInput) {
          nextStocks[item.masterItemCode] = bulkStockInput;
        }
      }
    });
    setRates(nextRates);
    setStocks(nextStocks);
    alert(`Applied rate ₹${rateNum} to ${selectedCount} selected item(s).`);
  };

  // Handle Excel Upload for Bulk Import
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (!data.length) {
          alert("Excel sheet is empty");
          return;
        }

        const nextSelected = { ...selected };
        const nextRates = { ...rates };
        const nextStocks = { ...stocks };
        let matched = 0;
        let unknownCodes: string[] = [];

        data.forEach((row) => {
          const code = String(row["MasterCode"] || row["masterItemCode"] || row["Code"] || "").trim().toUpperCase();
          const rate = Number(row["Rate"] || row["supplierRate"] || row["Price"] || 0);
          const stock = String(row["Stock"] || row["stock"] || "100");

          if (code && rate > 0) {
            const masterExists = items.some((i) => i.masterItemCode === code);
            if (masterExists) {
              nextSelected[code] = true;
              nextRates[code] = String(rate);
              nextStocks[code] = stock;
              matched++;
            } else {
              unknownCodes.push(code);
            }
          }
        });

        setSelected(nextSelected);
        setRates(nextRates);
        setStocks(nextStocks);

        let msg = `✅ Imported and selected ${matched} valid product(s) from Excel.`;
        if (unknownCodes.length > 0) {
          msg += `\n⚠️ ${unknownCodes.length} code(s) were not found in Admin Master List. Use "Request Missing Item" for non-catalog items.`;
        }
        alert(msg);
      } catch (err) {
        alert("Error parsing Excel file. Please ensure column headers match 'MasterCode' and 'Rate'.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit Selected Items to Supplier DB
  const submitSelectedListings = async () => {
    const selectedCodes = Object.keys(selected).filter((k) => selected[k]);

    if (!selectedCodes.length) {
      alert("Please select at least one product using the checkboxes.");
      return;
    }

    const rows: any[] = [];
    const missingRateItems: string[] = [];

    selectedCodes.forEach((code) => {
      const item = items.find((i) => i.masterItemCode === code);
      const userRate = Number(rates[code] || 0);

      if (!userRate || userRate <= 0) {
        if (item) missingRateItems.push(item.itemName || code);
      } else if (item) {
        rows.push({
          masterItemCode: item.masterItemCode,
          itemName: item.itemName,
          category: item.category,
          subCategory: item.subCategory,
          brand: item.brand,
          specification: item.specification,
          unit: item.unit,
          proposedRate: userRate,
          rate: userRate,
          providerStock: Number(stocks[code] || 100),
          availability: Number(stocks[code] || 100) > 0 ? "In Stock" : "Out of Stock",
          minOrderQty: 1,
          deliveryTime: deliveryTimes[code] || "24-48 Hours",
          remarks: remarks[code] || "",
        });
      }
    });

    if (missingRateItems.length > 0) {
      alert(
        `Please enter a valid rate (> 0) for selected items:\n- ${missingRateItems.slice(0, 5).join("\n- ")}${
          missingRateItems.length > 5 ? `\n...and ${missingRateItems.length - 5} more.` : ""
        }`
      );
      return;
    }

    if (!rows.length) {
      alert("Please select at least one item and enter a valid rate greater than zero.");
      return;
    }

    const provider = {
      providerUserCode: providerCode,
      providerRole,
      providerName: user.companyName || user.name || "BuildMitra Supplier",
      providerPhone: user.phone || user.mobile || user.officePhone || "",
      providerAddress: user.address || "",
      city: user.city || user.location || "Bengaluru",
      pincode: user.pincode || "",
    };

    try {
      const apiBase = getApiBase();
      const data = await safeFetchJson(`${apiBase}/api/provider/marketplace-listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, items: rows }),
      });

      if (!data.success) {
        alert(
          data.message ||
            (data.errors || []).map((e: any) => e.message).join("\n") ||
            "Could not submit listings"
        );
        return;
      }

      alert(`✅ ${data.listings.length} item offer(s) saved permanently to your Supplier DB! Pending Admin Rate approval.`);
      setSelected({});
      setRates({});
      setStocks({});
      loadMyListings(providerCode);
    } catch (err: any) {
      alert(err.message || "Network error. Could not connect to backend server.");
    }
  };

  // Request Missing Item
  const requestNewItem = async () => {
    if (!request.proposedItemName.trim()) {
      alert("Please enter Item Name");
      return;
    }

    try {
      const apiBase = getApiBase();
      const data = await safeFetchJson(`${apiBase}/api/provider/new-item-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...request,
          itemType: "material",
          providerUserCode: providerCode,
          providerRole,
          providerName: user.companyName || user.name,
          providerPhone: user.phone || user.mobile || user.officePhone,
        }),
      });

      if (!data.success) {
        alert(data.message || "Could not send request");
        return;
      }

      alert("✅ Request for new item sent to Admin for catalogue addition.");
      setRequest({
        proposedItemName: "",
        category: "",
        subCategory: "",
        brand: "",
        specification: "",
        unit: "",
        imageUrl: "",
        remarks: "",
      });
    } catch (e: any) {
      alert(e.message || "Error sending request to Admin.");
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation Header Strip */}
      <div style={styles.headerStrip}>
        <div>
          <h1 style={styles.title}>Select Active Items & Add Supplier Rates</h1>
          <p style={styles.subtitle}>
            Pick active products from Admin Master Catalogue ({items.length} materials loaded) & enter supplier rates
            {loading && <span style={{ color: "#10b981", marginLeft: 10, fontWeight: "bold" }}>⚡ Updating Catalogue...</span>}
          </p>
        </div>
        <button style={styles.backBtn} onClick={() => (window.location.href = "/supplier-dashboard")}>
          ⬅ Back to Supplier Dashboard
        </button>
      </div>

      {/* Cascading Filter Bar */}
      <div style={styles.filterBox}>
        <div style={styles.filterGrid}>
          {/* Category Dropdown */}
          <div>
            <label style={styles.label}>1. Category / Group</label>
            <select
              style={styles.select}
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, subCategory: "", brand: "" })}
            >
              <option value="">All Categories ({categoriesList.length})</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div>
            <label style={styles.label}>2. Sub Category</label>
            <select
              style={styles.select}
              value={filters.subCategory}
              onChange={(e) => setFilters({ ...filters, subCategory: e.target.value, brand: "" })}
            >
              <option value="">All Subcategories ({subCategoriesList.length})</option>
              {subCategoriesList.map((sc) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div>
            <label style={styles.label}>3. Brand</label>
            <select
              style={styles.select}
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            >
              <option value="">All Brands ({brandsList.length})</option>
              {brandsList.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label style={styles.label}>4. Search Product / Code</label>
            <input
              type="text"
              style={styles.input}
              placeholder="Search Name, Code, Specification..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>

        {/* View Mode Chips */}
        <div style={styles.chipStrip}>
          <button
            style={{ ...styles.chip, ...(filters.selectedView === "all" ? styles.chipActive : {}) }}
            onClick={() => setFilters({ ...filters, selectedView: "all" })}
          >
            All Active MasterItems ({items.length})
          </button>
          <button
            style={{ ...styles.chip, ...(filters.selectedView === "selected" ? styles.chipActive : {}) }}
            onClick={() => setFilters({ ...filters, selectedView: "selected" })}
          >
            Checked Selected ({selectedCount})
          </button>
          <button
            style={{ ...styles.chip, ...(filters.selectedView === "added" ? styles.chipActive : {}) }}
            onClick={() => setFilters({ ...filters, selectedView: "added" })}
          >
            Already in My DB ({myListings.length})
          </button>
        </div>
      </div>

      {/* Product Pagination - 50 items per page */}
      {visibleItems.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 12,
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#fff",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            Showing{" "}
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, visibleItems.length)} of{" "}
            {visibleItems.length} products
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              style={styles.actionBtn}
              disabled={currentPage <= 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
            >
              ← Previous
            </button>

            <span style={{ fontSize: 13, fontWeight: 700 }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              style={styles.actionBtn}
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Bulk Action Controls */}
      <div style={styles.bulkBox}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            style={styles.actionBtn}
            onClick={toggleSelectAllFiltered}
            disabled={pagedItems.length === 0}
          >
            {pagedItems.length > 0 &&
            pagedItems.every((i) => Boolean(selected[i.masterItemCode]))
              ? `Deselect Page (${pagedItems.length})`
              : `Select Page (${pagedItems.length})`}
          </button>
          <span style={{ fontSize: 13, fontWeight: "bold", color: "#1a5f7a" }}>
            {selectedCount} item(s) selected
          </span>
        </div>

        {/* Bulk Rate Entry */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <input
            style={{ ...styles.input, width: 120 }}
            placeholder="Bulk Rate ₹"
            type="number"
            value={bulkRateInput}
            onChange={(e) => setBulkRateInput(e.target.value)}
          />
          <button style={styles.primaryButton} onClick={applyBulkRateToSelected}>
            Apply Rate to Selected
          </button>
        </div>

        {/* Excel Import */}
        <div>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            id="excel-import-input"
            style={{ display: "none" }}
            onChange={handleExcelUpload}
          />
          <label htmlFor="excel-import-input" style={styles.excelBtn}>
            📂 Import CSV/Excel by MasterCode
          </label>
        </div>

        <button style={styles.successButton} onClick={submitSelectedListings}>
          💾 Save Selected Items to Supplier DB
        </button>
      </div>

      {/* Products Table / Cards */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Select</th>
              <th style={styles.th}>Image</th>
              <th style={styles.th}>Master Code</th>
              <th style={styles.th}>Product Name</th>
              <th style={styles.th}>Brand</th>
              <th style={styles.th}>Specification</th>
              <th style={styles.th}>Unit</th>
              <th style={styles.th}>Admin Ref Rate</th>
              <th style={styles.th}>Your Rate (₹) *</th>
              <th style={styles.th}>Stock Qty</th>
              <th style={styles.th}>Delivery Time</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={11}>
                  {loading ? "Loading active MasterItems from Admin catalogue..." : "No MasterItems found matching filters."}
                </td>
              </tr>
            ) : (
              pagedItems.map((item) => {
                const isSelected = Boolean(selected[item.masterItemCode]);
                const isAlreadyInDB = existingCodesSet.has(item.masterItemCode);

                return (
                  <tr key={item.masterItemCode} style={{ background: isSelected ? "#f0fdf4" : "transparent" }}>
                    {/* Checkbox */}
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          setSelected({ ...selected, [item.masterItemCode]: e.target.checked })
                        }
                      />
                    </td>

                    {/* Non-Blinking Product Thumbnail */}
                    <td style={styles.td}>
                      <ProductThumbnail item={item} />
                    </td>

                    {/* Master Code (Read-Only) */}
                    <td style={styles.td}>
                      <strong>{item.masterItemCode}</strong>
                      {isAlreadyInDB && <div style={styles.inDbBadge}>In DB</div>}
                    </td>

                    {/* Product Name (Read-Only) */}
                    <td style={styles.td}>
                      <strong>{item.itemName}</strong>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{item.category} / {item.subCategory}</div>
                    </td>

                    {/* Brand (Read-Only) */}
                    <td style={styles.td}>
                      {item.brand ? <span style={styles.brandBadge}>{item.brand}</span> : "-"}
                    </td>

                    {/* Specification (Read-Only) */}
                    <td style={styles.td}>{item.specification || "-"}</td>

                    {/* Unit (Read-Only) */}
                    <td style={styles.td}><strong>{item.unit || "NOS"}</strong></td>

                    {/* Admin Ref Rate (Read-Only) */}
                    <td style={styles.td}>
                      {item.referenceRate > 0 ? (
                        <span style={{ color: "#64748b" }}>₹{item.referenceRate}</span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>-</span>
                      )}
                    </td>

                    {/* Supplier Rate Input */}
                    <td style={styles.td}>
                      <input
                        type="number"
                        style={{ ...styles.input, width: 110, fontWeight: "bold", borderColor: isSelected ? "#10b981" : "#cbd5e1" }}
                        placeholder="Rate ₹"
                        value={rates[item.masterItemCode] || ""}
                        onChange={(e) => {
                          setRates({ ...rates, [item.masterItemCode]: e.target.value });
                          if (!selected[item.masterItemCode]) {
                            setSelected({ ...selected, [item.masterItemCode]: true });
                          }
                        }}
                      />
                    </td>

                    {/* Stock Input */}
                    <td style={styles.td}>
                      <input
                        type="number"
                        style={{ ...styles.input, width: 80 }}
                        placeholder="100"
                        value={stocks[item.masterItemCode] || ""}
                        onChange={(e) => setStocks({ ...stocks, [item.masterItemCode]: e.target.value })}
                      />
                    </td>

                    {/* Delivery Time Input */}
                    <td style={styles.td}>
                      <input
                        type="text"
                        style={{ ...styles.input, width: 110 }}
                        placeholder="24-48 Hours"
                        value={deliveryTimes[item.masterItemCode] || ""}
                        onChange={(e) => setDeliveryTimes({ ...deliveryTimes, [item.masterItemCode]: e.target.value })}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Request Missing Item Section */}
      <div style={styles.requestCard}>
        <h3 style={{ margin: "0 0 8px 0", color: "#1a5f7a" }}>Item Not in Admin Catalogue? Request Missing Product</h3>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
          If a product is missing from the 3,250+ Admin Master List, submit details below to request Admin addition.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          <input
            type="text"
            style={styles.input}
            placeholder="Proposed Item Name *"
            value={request.proposedItemName}
            onChange={(e) => setRequest({ ...request, proposedItemName: e.target.value })}
          />
          <input
            type="text"
            style={styles.input}
            placeholder="Category / Group"
            value={request.category}
            onChange={(e) => setRequest({ ...request, category: e.target.value })}
          />
          <input
            type="text"
            style={styles.input}
            placeholder="Brand Name"
            value={request.brand}
            onChange={(e) => setRequest({ ...request, brand: e.target.value })}
          />
          <input
            type="text"
            style={styles.input}
            placeholder="Specification / Size"
            value={request.specification}
            onChange={(e) => setRequest({ ...request, specification: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button style={styles.primaryButton} onClick={requestNewItem}>
            📨 Send Request to Admin
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, Arial, sans-serif" },
  headerStrip: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 14 },
  title: { margin: 0, fontSize: 22, color: "#0f172a", fontWeight: 800 },
  subtitle: { margin: "4px 0 0 0", fontSize: 13, color: "#64748b" },
  backBtn: { padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", fontWeight: 600, cursor: "pointer" },

  filterBox: { background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 16 },
  filterGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 },
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 },
  select: { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, background: "#fff" },
  input: { padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 },
  chipStrip: { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" },
  chip: { padding: "6px 14px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 12, cursor: "pointer", fontWeight: 500 },
  chipActive: { background: "#1a5f7a", color: "#fff", borderColor: "#1a5f7a", fontWeight: 700 },

  bulkBox: { background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 16, display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" },
  actionBtn: { padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "pointer", fontSize: 12 },
  primaryButton: { padding: "8px 16px", borderRadius: 8, border: 0, background: "#1a5f7a", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 },
  successButton: { padding: "9px 18px", borderRadius: 8, border: 0, background: "#10b981", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13 },
  excelBtn: { padding: "8px 14px", borderRadius: 8, border: "1px solid #047857", background: "#ecfdf5", color: "#047857", fontWeight: 700, cursor: "pointer", fontSize: 12, display: "inline-block" },

  tableWrap: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflowX: "auto", marginBottom: 24 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "12px 14px", background: "#f1f5f9", textAlign: "left", color: "#334155", fontWeight: 700, borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px 14px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  thumb: { width: 44, height: 44, borderRadius: 6, objectFit: "cover", background: "#f1f5f9" },
  placeholderThumb: { width: 44, height: 44, borderRadius: 6, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  brandBadge: { display: "inline-block", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 },
  inDbBadge: { display: "inline-block", background: "#d1fae5", color: "#047857", padding: "1px 5px", borderRadius: 4, fontSize: 10, fontWeight: 700, marginTop: 2 },

  requestCard: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" },
};

