import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { logoutToLogin } from "../utils/session";
import { BuildMitraHeader } from "../components/ui/DesignSystem";
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

// -----------------------------------------------------------------------------
// CANONICAL ADMIN MASTER IMAGE SYNC
// Supplier Dashboard must use the latest Admin Master Library image by
// masterItemCode. One canonical image source; no duplicate supplier image DB.
// -----------------------------------------------------------------------------

let supplierMasterImagePromise: Promise<Record<string, string>> | null = null;

function resolveSupplierImageUrl(value?: string): string {
  const src = String(value || "").trim();

  if (!src) return "";

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  if (src.startsWith("/api/")) {
    const apiBase = getApiBase();
    return `${apiBase}${src}`;
  }

  return src;
}

function loadSupplierMasterImageMap(): Promise<Record<string, string>> {

  if (supplierMasterImagePromise) {
    return supplierMasterImagePromise;
  }

  supplierMasterImagePromise = (async () => {

    const map: Record<string, string> = {};
    const apiBase = getApiBase();

    let page = 1;

    while (true) {

      try {

        const res = await fetch(
          `${apiBase}/api/provider/master-items?page=${page}&limit=500`
        );

        if (!res.ok) break;

        const data = await res.json();
        const batch = Array.isArray(data?.items) ? data.items : [];

        batch.forEach((item: any) => {

          const code = String(
            item?.masterItemCode ||
            item?.masterCode ||
            ""
          ).trim().toUpperCase();

          const image = String(
            item?.imageUrl ||
            item?.masterImageUrl ||
            ""
          ).trim();

          if (code && image) {
            map[code] = resolveSupplierImageUrl(image);
          }
        });

        if (batch.length < 500) break;

        page++;

      } catch {
        break;
      }
    }

    return map;
  })();

  return supplierMasterImagePromise;
}

// Stable, non-blinking Product Thumbnail Component with fallback & error locking
function ProductThumbnail({ src, alt, masterItemCode }: { src?: string; alt?: string; masterItemCode?: string }) {
  const [imgSrc, setImgSrc] = useState(resolveSupplierImageUrl(src));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {

    let active = true;

    setHasError(false);

    const directImage = resolveSupplierImageUrl(src);

    if (directImage) {
      setImgSrc(directImage);
    } else {
      setImgSrc("");
    }

    const code = String(masterItemCode || "").trim().toUpperCase();

    if (code) {

      loadSupplierMasterImageMap().then((map) => {

        if (!active) return;

        const masterImage = map[code];

        // Canonical Admin Master image always wins.
        if (masterImage) {
          setImgSrc(masterImage);
          setHasError(false);
        }
      });
    }

    return () => {
      active = false;
    };

  }, [src, masterItemCode]);

  if (hasError || !imgSrc) {
    return (
      <div style={styles.placeholderThumb} title={alt || "Product Image"}>
        📦
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt || "Product"}
      style={styles.thumb}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}

export default function SupplierDashboard() {
  const [userName, setUserName] = useState("Supplier");
  const [userCode, setUserCode] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // DB Data
  const [listings, setListings] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);

  // Reports Filter & View State
  const [reportType, setReportType] = useState("full_statement"); // customer_wise, payment_pending, total_business, full_statement
  const [savingReport, setSavingReport] = useState(false);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editRate, setEditRate] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editAvailability, setEditAvailability] = useState("In Stock");
  const [editMinOrder, setEditMinOrder] = useState("1");
  const [editDeliveryTime, setEditDeliveryTime] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteDelivery, setQuoteDelivery] = useState("");

  // BUILDMITRA SUPPLIER CONSOLIDATED BATCH QUOTE 19-08-2026
  const [selectedBatchItems, setSelectedBatchItems] = useState<any[]>([]);
  const [batchQuoteItems, setBatchQuoteItems] = useState<Record<string, any>>({});
  const [quoteGstPercent, setQuoteGstPercent] = useState("");
  const [quoteTransport, setQuoteTransport] = useState("");
  const [quoteLoadingCharge, setQuoteLoadingCharge] = useState("");
  const [quoteUnloadingCharge, setQuoteUnloadingCharge] = useState("");
  const [quoteDiscount, setQuoteDiscount] = useState("");
  const [quotePaymentTerms, setQuotePaymentTerms] = useState("");
  const [batchLinkOpened, setBatchLinkOpened] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const userStr =
      sessionStorage.getItem("currentUser") ||
      sessionStorage.getItem("loggedInUser") ||
      sessionStorage.getItem("user");

    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const code = String(
          u.userCode || u.uniqueCode || u.providerUserCode || u.userId || ""
        ).toUpperCase();

        setUserName(u.companyName || u.name || "Supplier");
        setUserCode(code);

        if (code) {
          fetchMyListings(code);
          fetchMyEnquiries(code);
          fetchMyReports(code);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMyListings = async (code: string) => {
    setLoading(true);
    try {
      const apiBase = getApiBase();
      const data = await safeFetchJson(`${apiBase}/api/provider/my-listings/${encodeURIComponent(code)}`);
      if (data.success) {
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error("Failed to fetch supplier listings", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEnquiries = async (code: string) => {
    try {
      const apiBase = getApiBase();
      const data = await safeFetchJson(
        `${apiBase}/api/enquiry/provider/my?providerUserCode=${encodeURIComponent(code)}`,
        { headers: { "x-user-code": code } }
      );
      if (data.success) {
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Failed to fetch supplier enquiries", err);
    }
  };

  const fetchMyReports = async (code: string) => {
    try {
      const apiBase = getApiBase();
      const data = await safeFetchJson(`${apiBase}/api/provider/reports/${encodeURIComponent(code)}`);
      if (data.success) {
        setReportData(data);
      }
    } catch (err) {
      console.error("Failed to fetch supplier reports", err);
    }
  };

  // Metrics computation from REAL MongoDB data
  const metrics = useMemo(() => {
    const totalProducts = listings.length;
    const approved = listings.filter((l) => l.status === "approved" || l.approvalStatus === "approved").length;
    const pending = listings.filter((l) => l.status === "pending" || l.approvalStatus === "pending").length;
    const rejected = listings.filter((l) => l.status === "rejected" || l.approvalStatus === "rejected").length;
    const outOfStock = listings.filter(
      (l) => l.availability === "Out of Stock" || Number(l.providerStock || 0) <= 0
    ).length;

    const totalEnquiries = enquiries.length;
    const quotesPending = enquiries.filter((e) => e.status !== "Quoted" && e.status !== "Closed").length;
    const quotesSent = enquiries.filter((e) => e.status === "Quoted").length;

    return {
      totalProducts,
      approved,
      pending,
      rejected,
      outOfStock,
      totalEnquiries,
      quotesPending,
      quotesSent,
    };
  }, [listings, enquiries]);

  // Unique Categories & Brands for filtering
  const categories = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => l.category && set.add(l.category));
    return Array.from(set);
  }, [listings]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => l.brand && set.add(l.brand));
    return Array.from(set);
  }, [listings]);

  // Category distribution for bar chart
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    listings.forEach((l) => {
      const cat = l.category || "General";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [listings]);

  // Filtered Products
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const search = searchQuery.toLowerCase().trim();
      if (search) {
        const matchName = (item.itemName || "").toLowerCase().includes(search);
        const matchCode = (item.masterItemCode || "").toLowerCase().includes(search);
        const matchBrand = (item.brand || "").toLowerCase().includes(search);
        const matchCategory = (item.category || "").toLowerCase().includes(search);
        if (!matchName && !matchCode && !matchBrand && !matchCategory) return false;
      }

      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      if (selectedBrand !== "all" && item.brand !== selectedBrand) return false;

      if (statusFilter === "approved" && item.status !== "approved") return false;
      if (statusFilter === "pending" && item.status !== "pending") return false;
      if (statusFilter === "rejected" && item.status !== "rejected") return false;
      if (statusFilter === "outOfStock") {
        if (item.availability !== "Out of Stock" && Number(item.providerStock || 0) > 0) return false;
      }

      return true;
    });
  }, [listings, searchQuery, selectedCategory, selectedBrand, statusFilter]);

  // Toggle Availability (Immediate Stock Update)
  const toggleAvailability = async (item: any) => {
    const newAvail = item.availability === "Out of Stock" ? "In Stock" : "Out of Stock";
    const newStock = newAvail === "Out of Stock" ? 0 : (item.providerStock > 0 ? item.providerStock : 100);

    try {
      const apiBase = getApiBase();
      const data = await safeFetchJson(`${apiBase}/api/provider/listing/${item._id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: newAvail, stock: newStock }),
      });
      if (data.success) {
        setListings((prev) =>
          prev.map((l) => (l._id === item._id ? { ...l, availability: newAvail, providerStock: newStock } : l))
        );
      } else {
        alert(data.message || "Failed to update availability");
      }
    } catch (e: any) {
      alert(e.message || "Error updating availability");
    }
  };

  // Open Edit Modal
  const openEdit = (item: any) => {
    setEditingItem(item);
    setEditRate(String(item.proposedRate || item.rate || item.approvedRate || ""));
    setEditStock(String(item.providerStock || 0));
    setEditAvailability(item.availability || "In Stock");
    setEditMinOrder(String(item.minOrderQty || 1));
    setEditDeliveryTime(item.deliveryTime || "");
    setEditRemarks(item.remarks || "");
    setShowEditModal(true);
  };

  // Submit Rate & Commercial Edit (Preserves approvedRate, sets proposedRate + Pending)
  const saveRateEdit = async () => {
    if (!editingItem) return;
    const rateNum = Number(editRate);
    if (!rateNum || rateNum <= 0) {
      alert("Please enter a valid rate greater than zero");
      return;
    }

    setSubmittingEdit(true);
    try {
      const apiBase = getApiBase();
      const targetId = editingItem._id || editingItem.id;
      const endpoint = targetId
        ? `${apiBase}/api/provider/listing/${targetId}`
        : `${apiBase}/api/provider/listing`;

      const data = await safeFetchJson(endpoint, {
        method: targetId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerUserCode: userCode,
          providerName: userName || "Supplier",
          masterItemCode: editingItem.masterItemCode,
          proposedRate: rateNum,
          rate: rateNum,
          providerStock: Number(editStock || 0),
          availability: editAvailability,
          minOrderQty: Number(editMinOrder || 1),
          deliveryTime: editDeliveryTime,
          remarks: editRemarks,
        }),
      });

      if (!data.success) {
        alert(data.message || "Failed to save rate edit");
        return;
      }

      alert("✅ Price edit submitted successfully! Existing approved rate remains active until Admin approves your new proposed rate.");
      setShowEditModal(false);
      fetchMyListings(userCode);
    } catch (err: any) {
      alert(err.message || "Error submitting rate edit");
    } finally {
      setSubmittingEdit(false);
    }
  };

  /*
    Group marketplace enquiries supplier-side by batchCode.
    Legacy enquiries without batchCode remain individual groups.
  */
  const groupedEnquiries = useMemo(() => {
    const groups: Record<string, any[]> = {};

    enquiries.forEach((e: any) => {
      const key =
        String(e.batchCode || "").trim() ||
        String(e.enquiryCode || e._id || "");

      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    return Object.entries(groups)
      .map(([groupKey, items]) => {
        const first = items[0] || {};

        return {
          ...first,
          _groupKey: groupKey,
          _batchItems: items,
          _batchCount: items.length,
        };
      })
      .sort((a: any, b: any) => {
        const ad = new Date(a.createdAt || 0).getTime();
        const bd = new Date(b.createdAt || 0).getTime();
        return bd - ad;
      });
  }, [enquiries]);

  const openBatchQuote = (group: any) => {
    const items = Array.isArray(group?._batchItems)
      ? group._batchItems
      : [group];

    const initial: Record<string, any> = {};

    items.forEach((item: any) => {
      const key = String(item._id || item.enquiryCode);

      initial[key] = {
        rate: String(
          item.uploadedRate ??
          item.listedRate ??
          item.providerRate ??
          item.rate ??
          ""
        ),
        availability: "Available",
        remarks: "",
      };
    });

    setSelectedEnquiry(group);
    setSelectedBatchItems(items);
    setBatchQuoteItems(initial);

    setQuoteNotes("");
    setQuoteDelivery("");
    setQuoteGstPercent("");
    setQuoteTransport("");
    setQuoteLoadingCharge("");
    setQuoteUnloadingCharge("");
    setQuoteDiscount("");
    setQuotePaymentTerms("");

    setShowQuoteModal(true);
  };


  // BUILDMITRA_DIRECT_BATCH_QUOTE_LINK
  useEffect(() => {
    if (batchLinkOpened) return;
    if (typeof window === "undefined") return;
    if (!groupedEnquiries.length) return;

    const params = new URLSearchParams(window.location.search);
    const batchCodeFromLink = String(
      params.get("batchCode") || ""
    ).trim();

    const shouldOpen =
      params.get("openQuote") === "1";

    if (!batchCodeFromLink || !shouldOpen) return;

    const group = groupedEnquiries.find(
      (row: any) =>
        String(row.batchCode || "").trim() === batchCodeFromLink
    );

    if (!group) return;

    setBatchLinkOpened(true);
    openBatchQuote(group);
  }, [groupedEnquiries, batchLinkOpened]);
  const submitBatchQuote = async () => {
    // Open immediately from the supplier click.
    // This prevents browsers/mobile from blocking WhatsApp
    // after the asynchronous quote API request completes.
    const buyerQuoteWindow =
      typeof window !== "undefined"
        ? window.open("about:blank", "buildmitra-buyer-quotation")
        : null;
    if (!selectedEnquiry || selectedBatchItems.length === 0) {
      alert("No enquiry items selected.");
      return;
    }

    const batchCode = String(selectedEnquiry.batchCode || "").trim();

    /*
      Old enquiries without batchCode retain the existing
      single-enquiry quote behaviour.
    */
    if (!batchCode) {
      if (selectedBatchItems.length === 1) {
        const only = selectedBatchItems[0];
        const key = String(only._id || only.enquiryCode);
        const rate = Number(batchQuoteItems[key]?.rate || 0);

        if (rate <= 0) {
          alert("Please enter quoted rate.");
          return;
        }

        try {
          const apiBase = getApiBase();

          const data = await safeFetchJson(
            `${apiBase}/api/enquiry/${only._id}/quote`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "x-user-code": userCode,
              },
              body: JSON.stringify({
                quotedAmount: rate,
                quoteMessage:
                  quoteNotes || "Supplier quotation",
                quoteValidityDate: quoteDelivery || "",
                paymentTerms: quotePaymentTerms || "",
                gstIncluded: Number(quoteGstPercent || 0) > 0,
                transportCharges: Number(quoteTransport || 0),
              }),
            }
          );

          if (!data?.success) {
            alert(data?.message || "Could not submit quote.");
            return;
          }

          alert("Quote submitted successfully.");
          setShowQuoteModal(false);
          setSelectedBatchItems([]);
          setBatchQuoteItems({});

          fetchMyEnquiries(userCode);
          fetchMyReports(userCode);
        } catch (error: any) {
          alert(error?.message || "Could not submit quote.");
        }

        return;
      }

      alert("This older enquiry has no batch code.");
      return;
    }

    const invalid = selectedBatchItems.some((item: any) => {
      const key = String(item._id || item.enquiryCode);
      return Number(batchQuoteItems[key]?.rate || 0) <= 0;
    });

    if (invalid) {
      alert("Enter a valid quoted rate for every item.");
      return;
    }

    const items = selectedBatchItems.map((item: any) => {
      const key = String(item._id || item.enquiryCode);
      const q = batchQuoteItems[key] || {};

      const quantity = Number(item.quantity || 0);
      const rate = Number(q.rate || 0);

      return {
        enquiryId: item._id,
        enquiryCode: item.enquiryCode,
        itemName: item.itemName,
        quantity,
        unit: item.unit || "",
        rate,
        amount: quantity * rate,
        availability: q.availability || "Available",
        remarks: q.remarks || "",
      };
    });

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.amount || 0),
      0
    );

    const gstAmount =
      subtotal * (Number(quoteGstPercent || 0) / 100);

    try {
      const apiBase = getApiBase();

      const data = await safeFetchJson(
        `${apiBase}/api/enquiry/batch/${encodeURIComponent(batchCode)}/quote`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-code": userCode,
          },
          body: JSON.stringify({
            items,
            gstAmount,
            gstIncluded: Number(quoteGstPercent || 0) > 0,
            transportCharges: Number(quoteTransport || 0),
            loadingCharges: Number(quoteLoadingCharge || 0),
            unloadingCharges: Number(quoteUnloadingCharge || 0),
            discount: Number(quoteDiscount || 0),
            deliveryTime: quoteDelivery,
            paymentTerms: quotePaymentTerms,
            remarks: quoteNotes,
          }),
        }
      );

      if (!data?.success) {
        alert(data?.message || "Could not submit consolidated quote.");
        return;
      }

      const quoteLines = items
        .map((item: any, index: number) => {
          const shortName = String(item.itemName || "")
            .trim()
            .split(/\s+/)
            .slice(0, 9)
            .join(" ");

          return `${index + 1}. ${shortName} - ${item.quantity} ${String(item.unit || "").toUpperCase()} - ₹${Math.round(item.rate).toLocaleString("en-IN")}/- - Amt ₹${Math.round(item.amount).toLocaleString("en-IN")}`;
        })
        .join("\n");

      const buyerPhone = String(selectedEnquiry.buyerPhone || "")
        .replace(/\D/g, "")
        .replace(/^91/, "");

      const buyerQuoteMessage =
`🏗️ BUILDMITRA QUOTATION

Enquiry Ref: ${batchCode}

Supplier: ${selectedEnquiry.providerName || selectedEnquiry.assignedProviderName || "BuildMitra Supplier"}

${quoteLines}

Subtotal: ₹${Math.round(Number(data.subtotal || subtotal)).toLocaleString("en-IN")}
GST: ₹${Math.round(Number(data.gstAmount || 0)).toLocaleString("en-IN")}
Transport: ₹${Math.round(Number(data.transportCharges || 0)).toLocaleString("en-IN")}
Loading: ₹${Math.round(Number(data.loadingCharges || 0)).toLocaleString("en-IN")}
Unloading: ₹${Math.round(Number(data.unloadingCharges || 0)).toLocaleString("en-IN")}
Discount: ₹${Math.round(Number(data.discount || 0)).toLocaleString("en-IN")}

Grand Total: ₹${Math.round(Number(data.grandTotal || 0)).toLocaleString("en-IN")}

Delivery: ${quoteDelivery || "-"}
Payment Terms: ${quotePaymentTerms || "-"}
Remarks: ${quoteNotes || "-"}

BuildMitra`;

      if (buyerPhone) {
        const buyerWaUrl =
          `https://wa.me/91${buyerPhone}?text=${encodeURIComponent(buyerQuoteMessage)}`;

        if (buyerQuoteWindow && !buyerQuoteWindow.closed) {
          buyerQuoteWindow.location.href = buyerWaUrl;
        } else {
          window.location.href = buyerWaUrl;
        }
      } else {
        if (buyerQuoteWindow && !buyerQuoteWindow.closed) {
          buyerQuoteWindow.close();
        }

        alert(
          "Quote saved, but buyer mobile number is missing. WhatsApp could not be opened."
        );
      }

      alert(
        `Consolidated quote submitted for ${data.count || items.length} item(s). Buyer WhatsApp opened.`
      );

      setShowQuoteModal(false);
      setSelectedEnquiry(null);
      setSelectedBatchItems([]);
      setBatchQuoteItems({});

      fetchMyEnquiries(userCode);
      fetchMyReports(userCode);

    } catch (error: any) {
      if (buyerQuoteWindow && !buyerQuoteWindow.closed) {
        buyerQuoteWindow.close();
      }

      alert(
        error?.message ||
        "Could not submit consolidated supplier quote."
      );
    }
  };

  // Submit Quote to Buyer Enquiry
  const submitQuote = async () => {
    if (!selectedEnquiry || !quotePrice) {
      alert("Please enter quoted price");
      return;
    }

    try {
      const apiBase = getApiBase();
      const data = await safeFetchJson(`${apiBase}/api/enquiry/${selectedEnquiry._id}/quote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-code": userCode,
        },
        body: JSON.stringify({
          quotedAmount: Number(quotePrice),
          quoteMessage: quoteNotes || "Official BuildMitra Supplier Quote",
          quoteValidityDate: quoteDelivery || "",
          paymentTerms: "100% Advance / Mutually agreed",
        }),
      });

      if (data.success) {
        alert("Quote submitted successfully!");
        setShowQuoteModal(false);
        fetchMyEnquiries(userCode);
        fetchMyReports(userCode);
      } else {
        alert(data.message || "Could not submit quote");
      }
    } catch (e: any) {
      alert(e.message || "Quote submission failed");
    }
  };

  // Action: Print Current Report Statement
  const printReport = () => {
    window.print();
  };

  // Action: Export Report to Excel Spreadsheet
  const exportReportExcel = () => {
    if (!reportData) return alert("No report data available to export");

    let exportRows: any[] = [];
    let filename = "BuildMitra_Supplier_Report.xlsx";

    if (reportType === "customer_wise") {
      exportRows = (reportData.customerReport || []).map((c: any) => ({
        "Customer Name": c.customerName,
        "Phone": c.customerPhone,
        "Location": c.location,
        "Enquiries Count": c.enquiriesCount,
        "Total Quoted Amount (₹)": c.totalQuotedAmount,
        "Completed Amount (₹)": c.completedAmount,
        "Pending Amount (₹)": c.pendingAmount,
      }));
      filename = `Supplier_Customer_Report_${userCode}.xlsx`;
    } else if (reportType === "payment_pending") {
      exportRows = (reportData.paymentPendingReport || []).map((p: any) => ({
        "Enquiry Code": p.enquiryCode,
        "Buyer Name": p.buyerName,
        "Phone": p.buyerPhone,
        "Item": p.itemName,
        "Quantity": `${p.quantity} ${p.unit || ""}`,
        "Quoted Amount (₹)": p.quotedAmount || 0,
        "Status": p.status,
        "Date": p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
      }));
      filename = `Supplier_Pending_Payments_${userCode}.xlsx`;
    } else {
      exportRows = listings.map((l: any) => ({
        "Master Code": l.masterItemCode,
        "Item Name": l.itemName,
        "Category": l.category,
        "Brand": l.brand,
        "Unit": l.unit,
        "Approved Rate (₹)": l.approvedRate || (l.status === "approved" ? l.rate : "N/A"),
        "Proposed Rate (₹)": l.proposedRate || "-",
        "Stock": l.providerStock,
        "Availability": l.availability,
        "Status": l.status,
      }));
      filename = `Supplier_Statement_${userCode}.xlsx`;
    }

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, filename);
  };

  // Action: Save Statement Snapshot to MongoDB
  const saveReportToDb = async () => {
    setSavingReport(true);
    try {
      const apiBase = getApiBase();
      const data = await safeFetchJson(`${apiBase}/api/provider/reports/${encodeURIComponent(userCode)}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          title: `BuildMitra Statement - ${reportType.replace("_", " ").toUpperCase()}`,
          totalBusinessDone: reportData?.summary?.totalBusinessDone || 0,
          totalQuotedBusiness: reportData?.summary?.totalQuotedBusiness || 0,
          pendingPayments: reportData?.summary?.pendingPayments || 0,
          totalOrders: reportData?.summary?.totalEnquiries || 0,
          customerCount: reportData?.summary?.totalCustomers || 0,
          reportData: reportData?.customerReport || [],
          notes: `Generated on ${new Date().toLocaleString()}`,
        }),
      });

      if (data.success) {
        alert("✅ Report statement saved permanently to MongoDB database!");
        fetchMyReports(userCode);
      } else {
        alert(data.message || "Failed to save report to DB");
      }
    } catch (e: any) {
      alert(e.message || "Error saving report snapshot to database");
    } finally {
      setSavingReport(false);
    }
  };

  if (!isClient) {
    return <div style={{ padding: 20 }}>Loading Supplier Dashboard...</div>;
  }

  return (
    <div style={styles.container} className="printable-container">
      <BuildMitraHeader
        moduleTitle="Supplier Module"
        pageTitle="Supplier Dashboard, Inventory & Statements"
        subtitle={`Welcome, ${userName} (${userCode || "Supplier"}) | Manage products, reports, enquiries & SAS statements`}
        showBackToDashboard={false}
      />

      {/* Main Top Navigation / Action Bar */}
      <div style={styles.actionStrip} className="no-print">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{ ...styles.actionBtn, ...(activeTab === "overview" ? styles.actionBtnActive : {}) }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab("products")}
            style={{ ...styles.actionBtn, ...(activeTab === "products" ? styles.actionBtnActive : {}) }}
          >
            📦 My Products ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            style={{ ...styles.actionBtn, ...(activeTab === "reports" ? styles.actionBtnActive : {}) }}
          >
            📑 Reports & SAS Statements
          </button>
          <button
            onClick={() => setActiveTab("enquiries")}
            style={{ ...styles.actionBtn, ...(activeTab === "enquiries" ? styles.actionBtnActive : {}) }}
          >
            💬 Enquiries ({enquiries.length})
          </button>
          <button
            onClick={() => (window.location.href = "/provider-select-items")}
            style={styles.addBtn}
          >
            ➕ Select Active Items & Add Rates
          </button>
        </div>
        <button onClick={logoutToLogin} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>

      {/* Overview Tab Content */}
      {activeTab === "overview" && (
        <div>
          {/* Top Compact KPI Cards */}
          <div style={styles.kpiGrid}>
            <div
              style={{ ...styles.kpiCard, borderLeft: "4px solid #1a5f7a" }}
              onClick={() => { setActiveTab("products"); setStatusFilter("all"); }}
            >
              <div style={styles.kpiTitle}>My Products</div>
              <div style={styles.kpiValue}>{metrics.totalProducts}</div>
              <div style={styles.kpiSub}>Total catalogue listings</div>
            </div>

            <div
              style={{ ...styles.kpiCard, borderLeft: "4px solid #10b981" }}
              onClick={() => { setActiveTab("products"); setStatusFilter("approved"); }}
            >
              <div style={styles.kpiTitle}>Approved</div>
              <div style={{ ...styles.kpiValue, color: "#10b981" }}>{metrics.approved}</div>
              <div style={styles.kpiSub}>Live in Marketplace</div>
            </div>

            <div
              style={{ ...styles.kpiCard, borderLeft: "4px solid #f59e0b" }}
              onClick={() => { setActiveTab("products"); setStatusFilter("pending"); }}
            >
              <div style={styles.kpiTitle}>Pending Approval</div>
              <div style={{ ...styles.kpiValue, color: "#f59e0b" }}>{metrics.pending}</div>
              <div style={styles.kpiSub}>Proposed rate awaiting admin</div>
            </div>

            <div
              style={{ ...styles.kpiCard, borderLeft: "4px solid #ef4444" }}
              onClick={() => { setActiveTab("products"); setStatusFilter("outOfStock"); }}
            >
              <div style={styles.kpiTitle}>Out of Stock</div>
              <div style={{ ...styles.kpiValue, color: "#ef4444" }}>{metrics.outOfStock}</div>
              <div style={styles.kpiSub}>Immediate stock update required</div>
            </div>

            <div
              style={{ ...styles.kpiCard, borderLeft: "4px solid #6366f1" }}
              onClick={() => setActiveTab("reports")}
            >
              <div style={styles.kpiTitle}>Total Business Done</div>
              <div style={{ ...styles.kpiValue, color: "#6366f1", fontSize: 20 }}>
                ₹{reportData?.summary?.totalBusinessDone || 0}
              </div>
              <div style={styles.kpiSub}>Through BuildMitra orders</div>
            </div>

            <div
              style={{ ...styles.kpiCard, borderLeft: "4px solid #8b5cf6" }}
              onClick={() => setActiveTab("reports")}
            >
              <div style={styles.kpiTitle}>Payment Pending</div>
              <div style={{ ...styles.kpiValue, color: "#8b5cf6", fontSize: 20 }}>
                ₹{reportData?.summary?.pendingPayments || 0}
              </div>
              <div style={styles.kpiSub}>Pending quotes & terms</div>
            </div>
          </div>

          {/* Graphical Widgets Section (Real DB Data) */}
          <div style={styles.widgetGrid}>
            {/* Widget 1: Product Status Distribution Donut/Ring */}
            <div style={styles.widgetCard}>
              <h3 style={styles.widgetTitle}>Product Approval Breakdown</h3>
              {metrics.totalProducts === 0 ? (
                <div style={styles.emptyText}>No products added yet. Click "Select Active Items" to add your catalog.</div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginTop: 10 }}>
                  <svg width="120" height="120" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e5e7eb" strokeWidth="6" />
                    <circle
                      cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="6"
                      strokeDasharray={`${(metrics.approved / metrics.totalProducts) * 100} ${100 - (metrics.approved / metrics.totalProducts) * 100}`}
                      strokeDashoffset="25"
                    />
                    <circle
                      cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="6"
                      strokeDasharray={`${(metrics.pending / metrics.totalProducts) * 100} ${100 - (metrics.pending / metrics.totalProducts) * 100}`}
                      strokeDashoffset={`${25 - (metrics.approved / metrics.totalProducts) * 100}`}
                    />
                  </svg>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                    <div><span style={{ ...styles.dot, background: "#10b981" }}></span> Approved: <strong>{metrics.approved}</strong> ({Math.round((metrics.approved / (metrics.totalProducts || 1)) * 100)}%)</div>
                    <div><span style={{ ...styles.dot, background: "#f59e0b" }}></span> Pending: <strong>{metrics.pending}</strong> ({Math.round((metrics.pending / (metrics.totalProducts || 1)) * 100)}%)</div>
                    <div><span style={{ ...styles.dot, background: "#ef4444" }}></span> Rejected: <strong>{metrics.rejected}</strong> ({Math.round((metrics.rejected / (metrics.totalProducts || 1)) * 100)}%)</div>
                    <div><span style={{ ...styles.dot, background: "#6b7280" }}></span> Out of Stock: <strong>{metrics.outOfStock}</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Widget 2: Enquiry → Quote Pipeline Graphic */}
            <div style={styles.widgetCard}>
              <h3 style={styles.widgetTitle}>Enquiry → Quote Pipeline</h3>
              <div style={{ marginTop: 16 }}>
                <div style={styles.pipelineRow}>
                  <span>Total Enquiries Received</span>
                  <strong>{metrics.totalEnquiries}</strong>
                </div>
                <div style={styles.barWrap}>
                  <div style={{ ...styles.barFill, width: "100%", background: "#6366f1" }}></div>
                </div>

                <div style={{ ...styles.pipelineRow, marginTop: 12 }}>
                  <span>Quotes Sent</span>
                  <strong>{metrics.quotesSent} ({metrics.totalEnquiries ? Math.round((metrics.quotesSent / metrics.totalEnquiries) * 100) : 0}%)</strong>
                </div>
                <div style={styles.barWrap}>
                  <div style={{ ...styles.barFill, width: `${metrics.totalEnquiries ? (metrics.quotesSent / metrics.totalEnquiries) * 100 : 0}%`, background: "#10b981" }}></div>
                </div>

                <div style={{ ...styles.pipelineRow, marginTop: 12 }}>
                  <span>Pending Supplier Response</span>
                  <strong>{metrics.quotesPending}</strong>
                </div>
                <div style={styles.barWrap}>
                  <div style={{ ...styles.barFill, width: `${metrics.totalEnquiries ? (metrics.quotesPending / metrics.totalEnquiries) * 100 : 0}%`, background: "#f59e0b" }}></div>
                </div>
              </div>
            </div>

            {/* Widget 3: Category Count Bar Chart */}
            <div style={styles.widgetCard}>
              <h3 style={styles.widgetTitle}>Category Product Count</h3>
              {categoryStats.length === 0 ? (
                <div style={styles.emptyText}>No product categories found.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                  {categoryStats.slice(0, 5).map((stat) => {
                    const max = Math.max(...categoryStats.map((s) => s.count)) || 1;
                    const pct = Math.round((stat.count / max) * 100);
                    return (
                      <div key={stat.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
                          <span>{stat.name}</span>
                          <strong>{stat.count} items</strong>
                        </div>
                        <div style={styles.barWrap}>
                          <div style={{ ...styles.barFill, width: `${pct}%`, background: "#1a5f7a" }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Widget 4: Recent Activity Log */}
            <div style={styles.widgetCard}>
              <h3 style={styles.widgetTitle}>Recent Activity Timeline</h3>
              {listings.length === 0 ? (
                <div style={styles.emptyText}>No recent activity logged.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12, maxHeight: 180, overflowY: "auto" }}>
                  {listings.slice(0, 6).map((item) => (
                    <div key={item._id} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12 }}>
                      <span style={{ fontSize: 14 }}>
                        {item.status === "approved" ? "✅" : item.status === "pending" ? "⏳" : "⚠️"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <strong>{item.itemName}</strong> ({item.masterItemCode})
                        <div style={{ color: "#666", fontSize: 11 }}>
                          Proposed: ₹{item.proposedRate || item.rate} | Status: {item.status} | Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Recently"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports & SAS Statements Tab */}
      {activeTab === "reports" && (
        <div style={{ marginTop: 24 }}>
          {/* Action Bar for Reports */}
          <div style={styles.filterBox} className="no-print">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => setReportType("full_statement")}
                  style={{ ...styles.chip, ...(reportType === "full_statement" ? styles.chipActive : {}) }}
                >
                  📑 Full SAS Statement
                </button>
                <button
                  onClick={() => setReportType("customer_wise")}
                  style={{ ...styles.chip, ...(reportType === "customer_wise" ? styles.chipActive : {}) }}
                >
                  👥 Customer-Wise Report
                </button>
                <button
                  onClick={() => setReportType("payment_pending")}
                  style={{ ...styles.chip, ...(reportType === "payment_pending" ? styles.chipActive : {}) }}
                >
                  💳 Payment Pending Report
                </button>
                <button
                  onClick={() => setReportType("total_business")}
                  style={{ ...styles.chip, ...(reportType === "total_business" ? styles.chipActive : {}) }}
                >
                  📊 BuildMitra Business Done
                </button>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={printReport} style={styles.actionBtn}>
                  🖨️ Print / Save PDF
                </button>
                <button onClick={exportReportExcel} style={styles.actionBtn}>
                  📥 Export Excel
                </button>
                <button onClick={saveReportToDb} disabled={savingReport} style={styles.addBtn}>
                  {savingReport ? "Saving..." : "💾 Save Statement to DB"}
                </button>
              </div>
            </div>
          </div>

          {/* Printable SAS Statement Card */}
          <div style={styles.reportPrintCard}>
            <div style={styles.reportHeader}>
              <div>
                <h2 style={{ margin: 0, color: "#1a5f7a", fontSize: 22 }}>
                  BUILDMITRA SUPPLIER BUSINESS STATEMENT
                </h2>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Supplier: <strong>{userName}</strong> ({userCode}) | Report Type: <strong>{reportType.toUpperCase()}</strong>
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: "#64748b" }}>
                <div>Date Generated: <strong>{new Date().toLocaleDateString()}</strong></div>
                <div>System: <strong>BuildMitra ERP / SAS Reporting</strong></div>
              </div>
            </div>

            {/* Report Financial Summary Bar */}
            <div style={styles.reportSummaryStrip}>
              <div>
                <div style={styles.summaryLabel}>Total Business Done</div>
                <div style={{ ...styles.summaryVal, color: "#10b981" }}>₹{reportData?.summary?.totalBusinessDone || 0}</div>
              </div>
              <div>
                <div style={styles.summaryLabel}>Quoted Business Pipeline</div>
                <div style={{ ...styles.summaryVal, color: "#6366f1" }}>₹{reportData?.summary?.totalQuotedBusiness || 0}</div>
              </div>
              <div>
                <div style={styles.summaryLabel}>Pending Payments / Quotes</div>
                <div style={{ ...styles.summaryVal, color: "#f59e0b" }}>₹{reportData?.summary?.pendingPayments || 0}</div>
              </div>
              <div>
                <div style={styles.summaryLabel}>Active Customers</div>
                <div style={styles.summaryVal}>{reportData?.summary?.totalCustomers || 0}</div>
              </div>
              <div>
                <div style={styles.summaryLabel}>Catalogue Products</div>
                <div style={styles.summaryVal}>{reportData?.summary?.totalProducts || 0}</div>
              </div>
            </div>

            {/* Customer-Wise Report View */}
            {reportType === "customer_wise" && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Customer Name</th>
                    <th style={styles.th}>Contact Phone</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Enquiries</th>
                    <th style={styles.th}>Quoted Amount</th>
                    <th style={styles.th}>Completed Business</th>
                    <th style={styles.th}>Pending Business</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData?.customerReport || []).length === 0 ? (
                    <tr><td colSpan={7} style={{ ...styles.td, textAlign: "center" }}>No customer records found.</td></tr>
                  ) : (
                    (reportData?.customerReport || []).map((c: any, idx: number) => (
                      <tr key={idx}>
                        <td style={styles.td}><strong>{c.customerName}</strong></td>
                        <td style={styles.td}>{c.customerPhone}</td>
                        <td style={styles.td}>{c.location || "Bengaluru"}</td>
                        <td style={styles.td}>{c.enquiriesCount}</td>
                        <td style={styles.td}>₹{c.totalQuotedAmount}</td>
                        <td style={styles.td}><strong style={{ color: "#10b981" }}>₹{c.completedAmount}</strong></td>
                        <td style={styles.td}><strong style={{ color: "#f59e0b" }}>₹{c.pendingAmount}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Payment Pending Report View */}
            {reportType === "payment_pending" && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Enquiry Code</th>
                    <th style={styles.th}>Buyer Name & Phone</th>
                    <th style={styles.th}>Item Requested</th>
                    <th style={styles.th}>Quantity</th>
                    <th style={styles.th}>Quoted Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData?.paymentPendingReport || []).length === 0 ? (
                    <tr><td colSpan={7} style={{ ...styles.td, textAlign: "center" }}>No pending payments or open quotes.</td></tr>
                  ) : (
                    (reportData?.paymentPendingReport || []).map((p: any) => (
                      <tr key={p._id}>
                        <td style={styles.td}><strong>{p.enquiryCode}</strong></td>
                        <td style={styles.td}>
                          <strong>{p.buyerName}</strong>
                          <div style={{ fontSize: 11, color: "#666" }}>{p.buyerPhone}</div>
                        </td>
                        <td style={styles.td}>{p.itemName}</td>
                        <td style={styles.td}>{p.quantity} {p.unit}</td>
                        <td style={styles.td}><strong style={{ color: "#f59e0b" }}>₹{p.quotedAmount || 0}</strong></td>
                        <td style={styles.td}><span style={styles.statusBadge}>{p.status}</span></td>
                        <td style={styles.td}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Full Statement & Total Business Report View */}
            {(reportType === "full_statement" || reportType === "total_business") && (
              <div>
                <h3 style={{ fontSize: 16, color: "#1e293b", margin: "16px 0 8px" }}>Enquiries & Quoted Transactions</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Enquiry Code</th>
                      <th style={styles.th}>Buyer Name</th>
                      <th style={styles.th}>Item</th>
                      <th style={styles.th}>Quantity</th>
                      <th style={styles.th}>Quoted Amount</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.length === 0 ? (
                      <tr><td colSpan={7} style={{ ...styles.td, textAlign: "center" }}>No transaction records found.</td></tr>
                    ) : (
                      enquiries.map((e) => (
                        <tr key={e._id}>
                          <td style={styles.td}><strong>{e.enquiryCode}</strong></td>
                          <td style={styles.td}>{e.buyerName} ({e.buyerPhone})</td>
                          <td style={styles.td}>{e.itemName}</td>
                          <td style={styles.td}>{e.quantity} {e.unit}</td>
                          <td style={styles.td}><strong>₹{e.quotedAmount || 0}</strong></td>
                          <td style={styles.td}><span style={styles.statusBadge}>{e.status}</span></td>
                          <td style={styles.td}>{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Products Tab Content */}
      {(activeTab === "overview" || activeTab === "products") && (
        <div style={{ marginTop: 24 }}>
          {/* E-Commerce Filter Header & Search Bar */}
          <div style={styles.filterBox} className="no-print">
            <div style={styles.searchBarWrap}>
              <input
                type="text"
                placeholder="Search by Product Name, Master Code, Brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterRow}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="all">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Status Filter Chips */}
              <div style={styles.chipWrap}>
                <button
                  onClick={() => setStatusFilter("all")}
                  style={{ ...styles.chip, ...(statusFilter === "all" ? styles.chipActive : {}) }}
                >
                  All ({listings.length})
                </button>
                <button
                  onClick={() => setStatusFilter("approved")}
                  style={{ ...styles.chip, ...(statusFilter === "approved" ? styles.chipActive : {}) }}
                >
                  Approved ({metrics.approved})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  style={{ ...styles.chip, ...(statusFilter === "pending" ? styles.chipActive : {}) }}
                >
                  Pending ({metrics.pending})
                </button>
                <button
                  onClick={() => setStatusFilter("rejected")}
                  style={{ ...styles.chip, ...(statusFilter === "rejected" ? styles.chipActive : {}) }}
                >
                  Rejected ({metrics.rejected})
                </button>
                <button
                  onClick={() => setStatusFilter("outOfStock")}
                  style={{ ...styles.chip, ...(statusFilter === "outOfStock" ? styles.chipActive : {}) }}
                >
                  Out of Stock ({metrics.outOfStock})
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Table & Mobile Card View */}
          <div style={styles.tableCardWrap}>
            {loading ? (
              <div style={{ padding: 30, textAlign: "center" }}>Loading your permanent product catalogue...</div>
            ) : filteredListings.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
                No products match the selected filters. Click <strong>"Select Active Items & Add Rates"</strong> to add products.
              </div>
            ) : (
              <>
                {/* Desktop Responsive Table View */}
                <div style={styles.desktopTableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Product & Code</th>
                        <th style={styles.th}>Spec & Brand</th>
                        <th style={styles.th}>Unit</th>
                        <th style={styles.th}>Approved Rate</th>
                        <th style={styles.th}>Proposed Rate</th>
                        <th style={styles.th}>Stock & Avail</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th} className="no-print">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.map((item) => {
                        const isApproved = item.status === "approved" || item.approvalStatus === "approved";
                        const isPending = item.status === "pending" || item.approvalStatus === "pending";

                        return (
                          <tr key={item._id}>
                            {/* Product & Non-blinking Thumbnail */}
                            <td style={styles.td}>
                              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <ProductThumbnail src={item.imageUrl} alt={item.itemName} masterItemCode={item.masterItemCode} />
                                <div>
                                  <strong>{item.itemName}</strong>
                                  <div style={styles.codeText}>{item.masterItemCode}</div>
                                  <div style={styles.catText}>{item.category} {item.subCategory ? `/ ${item.subCategory}` : ""}</div>
                                </div>
                              </div>
                            </td>

                            {/* Spec */}
                            <td style={styles.td}>
                              <div>{item.specification || "-"}</div>
                              {item.brand && <span style={styles.brandBadge}>{item.brand}</span>}
                            </td>

                            {/* Unit */}
                            <td style={styles.td}><strong>{item.unit || "NOS"}</strong></td>

                            {/* Approved Rate (Live Rate) */}
                            <td style={styles.td}>
                              {item.approvedRate > 0 ? (
                                <strong style={{ color: "#10b981", fontSize: 15 }}>₹{item.approvedRate}</strong>
                              ) : isApproved ? (
                                <strong style={{ color: "#10b981", fontSize: 15 }}>₹{item.rate}</strong>
                              ) : (
                                <span style={{ color: "#9ca3af", fontSize: 13 }}>Not Approved</span>
                              )}
                            </td>

                            {/* Proposed Rate (Pending Approval) */}
                            <td style={styles.td}>
                              {item.proposedRate > 0 ? (
                                <div>
                                  <strong style={{ color: "#f59e0b", fontSize: 15 }}>₹{item.proposedRate}</strong>
                                  {isPending && <div style={{ fontSize: 10, color: "#f59e0b" }}>Pending Approval</div>}
                                </div>
                              ) : (
                                <span style={{ color: "#9ca3af" }}>-</span>
                              )}
                            </td>

                            {/* Stock & Availability */}
                            <td style={styles.td}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <div>Stock: <strong>{item.providerStock || 0}</strong></div>
                                <button
                                  onClick={() => toggleAvailability(item)}
                                  style={{
                                    ...styles.availBtn,
                                    background: item.availability === "Out of Stock" ? "#fee2e2" : "#d1fae5",
                                    color: item.availability === "Out of Stock" ? "#dc2626" : "#047857",
                                  }}
                                  className="no-print"
                                >
                                  {item.availability || "In Stock"} (Click to Toggle)
                                </button>
                              </div>
                            </td>

                            {/* Status */}
                            <td style={styles.td}>
                              <span
                                style={{
                                  ...styles.statusBadge,
                                  background: isApproved ? "#d1fae5" : isPending ? "#fef3c7" : "#fee2e2",
                                  color: isApproved ? "#047857" : isPending ? "#b45309" : "#b91c1c",
                                }}
                              >
                                {isApproved ? "Approved" : isPending ? "Pending Approval" : "Rejected"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td style={styles.td} className="no-print">
                              <button onClick={() => openEdit(item)} style={styles.editBtn}>
                                ✏️ Edit Commercials
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Compact Cards View (320px - 430px) */}
                <div style={styles.mobileCardWrap}>
                  {filteredListings.map((item) => {
                    const isApproved = item.status === "approved" || item.approvalStatus === "approved";
                    const isPending = item.status === "pending" || item.approvalStatus === "pending";

                    return (
                      <div key={item._id} style={styles.mobileCard}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                          <ProductThumbnail src={item.imageUrl} alt={item.itemName} masterItemCode={item.masterItemCode} />
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: 14 }}>{item.itemName}</strong>
                            <div style={{ fontSize: 11, color: "#666" }}>{item.masterItemCode} | {item.category}</div>
                          </div>
                          <span
                            style={{
                              ...styles.statusBadge,
                              background: isApproved ? "#d1fae5" : isPending ? "#fef3c7" : "#fee2e2",
                              color: isApproved ? "#047857" : isPending ? "#b45309" : "#b91c1c",
                            }}
                          >
                            {isApproved ? "Approved" : isPending ? "Pending" : "Rejected"}
                          </span>
                        </div>

                        <div style={styles.mobileCardGrid}>
                          <div>
                            <div style={{ fontSize: 11, color: "#666" }}>Approved Rate</div>
                            <div style={{ fontWeight: "bold", color: "#10b981" }}>
                              {item.approvedRate > 0 ? `₹${item.approvedRate}` : isApproved ? `₹${item.rate}` : "N/A"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#666" }}>Proposed Rate</div>
                            <div style={{ fontWeight: "bold", color: "#f59e0b" }}>
                              {item.proposedRate > 0 ? `₹${item.proposedRate}` : "-"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#666" }}>Stock</div>
                            <div>{item.providerStock || 0} {item.unit}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#666" }}>Availability</div>
                            <button
                              onClick={() => toggleAvailability(item)}
                              style={{
                                padding: "2px 6px", borderRadius: 4, border: 0, fontSize: 10, fontWeight: "bold", cursor: "pointer",
                                background: item.availability === "Out of Stock" ? "#fee2e2" : "#d1fae5",
                                color: item.availability === "Out of Stock" ? "#dc2626" : "#047857"
                              }}
                            >
                              {item.availability || "In Stock"}
                            </button>
                          </div>
                        </div>

                        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                          <button onClick={() => openEdit(item)} style={styles.editBtn}>
                            ✏️ Edit Rate / Commercials
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Enquiries Tab */}
      {activeTab === "enquiries" && (
        <div style={{ marginTop: 24 }}>
          <div style={styles.filterBox}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Buyer Enquiries & Quote Requests</h3>
          </div>
          <div style={styles.tableCardWrap}>
            {enquiries.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "#666" }}>No active buyer enquiries received yet.</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Buyer</th>
                    <th style={styles.th}>Item Requested</th>
                    <th style={styles.th}>Quantity & Location</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedEnquiries.map((e: any) => (
                    <tr key={e._id}>
                      <td style={styles.td}>{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "-"}</td>
                      <td style={styles.td}>
                        <strong>{e.buyerName || "Buyer"}</strong>
                        <div style={{ fontSize: 11, color: "#666" }}>{e.buyerPhone}</div>
                      </td>
                      <td style={styles.td}>
                        <strong>
  {e._batchCount > 1
    ? `${e._batchCount} Items`
    : (e.itemName || e.masterItemCode)}
</strong>
{e._batchCount > 1 && (
  <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>
    {e._batchItems
      .slice(0, 3)
      .map((x: any) => x.itemName)
      .join(", ")}
    {e._batchCount > 3 ? ` +${e._batchCount - 3} more` : ""}
  </div>
)}
                        <div style={{ fontSize: 11, color: "#666" }}>{e.specification}</div>
                      </td>
                      <td style={styles.td}>
                        {e._batchCount > 1
  ? `${e._batchCount} requested items | ${e.location || "Bengaluru"}`
  : `${e.quantity} ${e.unit || ""} | ${e.location || "Bengaluru"}`}
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, background: e.status === "Quoted" ? "#d1fae5" : "#fef3c7" }}>
                          {e.status || "Pending"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {e.status !== "Quoted" && (
                          <button
                            onClick={() => openBatchQuote(e)}
                            style={styles.addBtn}
                          >
                            View & Quote
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Edit Rate & Commercial Modal */}
      {showEditModal && editingItem && (
        <div style={styles.modalBackdrop} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: "#1a5f7a", fontSize: 20 }}>Edit Supplier Rate & Commercials</h2>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              <strong>{editingItem.itemName}</strong> ({editingItem.masterItemCode})
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={styles.label}>Proposed Rate (₹ per {editingItem.unit || "unit"}) *</label>
                <input
                  type="number"
                  style={styles.modalInput}
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  placeholder="Enter new proposed rate"
                />
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  Current Approved Rate: <strong>₹{editingItem.approvedRate || editingItem.rate || "N/A"}</strong>
                </div>
              </div>

              <div>
                <label style={styles.label}>Stock Quantity</label>
                <input
                  type="number"
                  style={styles.modalInput}
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <label style={styles.label}>Availability Status</label>
                <select
                  style={styles.modalInput}
                  value={editAvailability}
                  onChange={(e) => setEditAvailability(e.target.value)}
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Limited Stock">Limited Stock</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Minimum Order Qty (MOQ)</label>
                <input
                  type="number"
                  style={styles.modalInput}
                  value={editMinOrder}
                  onChange={(e) => setEditMinOrder(e.target.value)}
                />
              </div>

              <div>
                <label style={styles.label}>Delivery Lead Time</label>
                <input
                  type="text"
                  style={styles.modalInput}
                  value={editDeliveryTime}
                  onChange={(e) => setEditDeliveryTime(e.target.value)}
                  placeholder="e.g. 24-48 Hours"
                />
              </div>

              <div>
                <label style={styles.label}>Remarks / Transport Terms</label>
                <input
                  type="text"
                  style={styles.modalInput}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="e.g. Free delivery on 100+ bags"
                />
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={saveRateEdit} disabled={submittingEdit} style={styles.saveBtn}>
                {submittingEdit ? "Submitting..." : "Submit Edit for Approval"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quote Response Modal */}
      {showQuoteModal && selectedEnquiry && (
        <div
          style={styles.modalBackdrop}
          onClick={() => setShowQuoteModal(false)}
        >
          <div
            style={{
              ...styles.modalContent,
              width: "min(960px, 96vw)",
              maxWidth: 960,
              maxHeight: "92vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, color: "#1a5f7a" }}>
              Consolidated Supplier Quote
            </h2>

            <div
              style={{
                fontSize: 13,
                marginBottom: 12,
                color: "#475569",
              }}
            >
              Buyer: <strong>{selectedEnquiry.buyerName}</strong>
              {" • "}
              {selectedEnquiry.buyerPhone}
              {" • "}
              {selectedBatchItems.length} item
              {selectedBatchItems.length === 1 ? "" : "s"}
              {selectedEnquiry.batchCode
                ? ` • Batch ${selectedEnquiry.batchCode}`
                : ""}
            </div>

            <div
              style={{
                width: "100%",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: 760,
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={styles.th}>Item</th>
                    <th style={styles.th}>Qty</th>
                    <th style={styles.th}>Unit</th>
                    <th style={styles.th}>Rate ₹</th>
                    <th style={styles.th}>Availability</th>
                    <th style={styles.th}>Amount ₹</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedBatchItems.map((item: any) => {
                    const key = String(item._id || item.enquiryCode);
                    const q = batchQuoteItems[key] || {};
                    const rate = Number(q.rate || 0);
                    const amount =
                      (Number(item.quantity || 0) || 0) * rate;

                    return (
                      <tr key={key}>
                        <td style={styles.td}>
                          <strong>{item.itemName}</strong>
                          <div style={{ fontSize: 10, color: "#64748b" }}>
                            {item.enquiryCode}
                          </div>
                        </td>

                        <td style={styles.td}>{item.quantity}</td>
                        <td style={styles.td}>{item.unit || "-"}</td>

                        <td style={styles.td}>
                          <input
                            type="number"
                            min="0"
                            value={q.rate || ""}
                            placeholder="Rate"
                            style={{
                              ...styles.modalInput,
                              width: 105,
                              minWidth: 90,
                            }}
                            onChange={(ev) =>
                              setBatchQuoteItems((current) => ({
                                ...current,
                                [key]: {
                                  ...current[key],
                                  rate: ev.target.value,
                                },
                              }))
                            }
                          />
                        </td>

                        <td style={styles.td}>
                          <select
                            value={q.availability || "Available"}
                            style={{
                              ...styles.modalInput,
                              width: 135,
                            }}
                            onChange={(ev) =>
                              setBatchQuoteItems((current) => ({
                                ...current,
                                [key]: {
                                  ...current[key],
                                  availability: ev.target.value,
                                },
                              }))
                            }
                          >
                            <option>Available</option>
                            <option>Limited Stock</option>
                            <option>Out of Stock</option>
                            <option>On Order</option>
                          </select>
                        </td>

                        <td style={styles.td}>
                          <strong>
                            ₹{amount.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(145px, 1fr))",
                gap: 10,
                marginTop: 14,
              }}
            >
              <div>
                <label style={styles.label}>GST %</label>
                <input
                  type="number"
                  value={quoteGstPercent}
                  onChange={(e) => setQuoteGstPercent(e.target.value)}
                  style={styles.modalInput}
                  placeholder="0"
                />
              </div>

              <div>
                <label style={styles.label}>Transport ₹</label>
                <input
                  type="number"
                  value={quoteTransport}
                  onChange={(e) => setQuoteTransport(e.target.value)}
                  style={styles.modalInput}
                  placeholder="0"
                />
              </div>

              <div>
                <label style={styles.label}>Loading ₹</label>
                <input
                  type="number"
                  value={quoteLoadingCharge}
                  onChange={(e) => setQuoteLoadingCharge(e.target.value)}
                  style={styles.modalInput}
                  placeholder="0"
                />
              </div>

              <div>
                <label style={styles.label}>Unloading ₹</label>
                <input
                  type="number"
                  value={quoteUnloadingCharge}
                  onChange={(e) => setQuoteUnloadingCharge(e.target.value)}
                  style={styles.modalInput}
                  placeholder="0"
                />
              </div>

              <div>
                <label style={styles.label}>Discount ₹</label>
                <input
                  type="number"
                  value={quoteDiscount}
                  onChange={(e) => setQuoteDiscount(e.target.value)}
                  style={styles.modalInput}
                  placeholder="0"
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
                marginTop: 12,
              }}
            >
              <div>
                <label style={styles.label}>Delivery</label>
                <input
                  value={quoteDelivery}
                  onChange={(e) => setQuoteDelivery(e.target.value)}
                  style={styles.modalInput}
                  placeholder="Example: 2-3 days"
                />
              </div>

              <div>
                <label style={styles.label}>Payment Terms</label>
                <input
                  value={quotePaymentTerms}
                  onChange={(e) => setQuotePaymentTerms(e.target.value)}
                  style={styles.modalInput}
                  placeholder="Advance / credit terms"
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={styles.label}>Common Remarks</label>
              <textarea
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                style={{
                  ...styles.modalInput,
                  width: "100%",
                  minHeight: 70,
                  boxSizing: "border-box",
                }}
                placeholder="Quotation remarks / exclusions"
              />
            </div>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                position: "sticky",
                bottom: 0,
                background: "#fff",
                paddingTop: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitBatchQuote}
                style={styles.saveBtn}
              >
                Submit Consolidated Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Styles & CSS Variables
const styles: Record<string, React.CSSProperties> = {
  container: { padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, Arial, sans-serif" },
  actionStrip: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" },
  actionBtn: { padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", fontWeight: 600, cursor: "pointer" },
  actionBtnActive: { background: "#1a5f7a", color: "#fff", borderColor: "#1a5f7a" },
  addBtn: { padding: "8px 16px", borderRadius: 8, border: 0, background: "#10b981", color: "#fff", fontWeight: 700, cursor: "pointer" },
  logoutBtn: { padding: "8px 14px", borderRadius: 8, border: 0, background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer" },

  // KPI Grid
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 },
  kpiCard: { background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", cursor: "pointer" },
  kpiTitle: { fontSize: 12, color: "#64748b", fontWeight: 600 },
  kpiValue: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "4px 0" },
  kpiSub: { fontSize: 11, color: "#94a3b8" },

  // Widgets Grid
  widgetGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 },
  widgetCard: { background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  widgetTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 },
  emptyText: { fontSize: 13, color: "#94a3b8", marginTop: 14 },
  dot: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", marginRight: 6 },
  pipelineRow: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#475569" },
  barWrap: { height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden", marginTop: 4 },
  barFill: { height: "100%", borderRadius: 3, transition: "width 0.3s" },

  // Report Section
  reportPrintCard: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" },
  reportHeader: { display: "flex", justifyContent: "space-between", gap: 20, borderBottom: "2px solid #1a5f7a", paddingBottom: 16, marginBottom: 16, flexWrap: "wrap" },
  reportSummaryStrip: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, background: "#f8fafc", padding: 14, borderRadius: 8, marginBottom: 20 },
  summaryLabel: { fontSize: 11, color: "#64748b", fontWeight: 600 },
  summaryVal: { fontSize: 18, fontWeight: 800, color: "#0f172a" },

  // Filters
  filterBox: { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 16 },
  searchBarWrap: { marginBottom: 12 },
  searchInput: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 },
  filterRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  selectFilter: { padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, background: "#fff" },
  chipWrap: { display: "flex", gap: 6, flexWrap: "wrap", marginLeft: "auto" },
  chip: { padding: "6px 12px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 12, cursor: "pointer", fontWeight: 500 },
  chipActive: { background: "#1a5f7a", color: "#fff", borderColor: "#1a5f7a", fontWeight: 700 },

  // Table & Cards
  tableCardWrap: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" },
  desktopTableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "12px 14px", background: "#f1f5f9", textAlign: "left", color: "#334155", fontWeight: 700, borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px 14px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  thumb: { width: 40, height: 40, borderRadius: 6, objectFit: "cover", background: "#f1f5f9" },
  placeholderThumb: { width: 40, height: 40, borderRadius: 6, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  codeText: { fontSize: 11, color: "#64748b", fontWeight: 600 },
  catText: { fontSize: 11, color: "#94a3b8" },
  brandBadge: { display: "inline-block", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 },
  statusBadge: { display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 },
  availBtn: { border: 0, padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" },
  editBtn: { background: "#1a5f7a", color: "#fff", border: 0, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" },

  // Mobile View
  mobileCardWrap: { display: "none" },
  mobileCard: { padding: 14, borderBottom: "1px solid #e2e8f0" },
  mobileCardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 },

  // Modals
  modalBackdrop: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modalContent: { background: "#fff", borderRadius: 14, padding: 24, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto" },
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 },
  modalInput: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 },
  cancelBtn: { padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer" },
  saveBtn: { padding: "8px 16px", borderRadius: 8, border: 0, background: "#1a5f7a", color: "#fff", fontWeight: 700, cursor: "pointer" },
};






