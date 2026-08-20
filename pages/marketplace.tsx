
import { formatSupplierName } from "../utils/formatters";
import MarketplaceProductImage from "../components/MarketplaceProductImage";
import React, { useEffect, useMemo, useState } from "react";
import MarketRateTrend from "../components/ui/MarketRateTrend";
import { normalizeImageUrl, resolveListingImage } from "../utils/imageUrl";
import { getApiBase } from "../utils/apiConfig";
import { resolveMediaUrl } from "../utils/mediaResolver";

const API_BASE = getApiBase();

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", itemType: "", category: "", subCategory: "", brand: "", city: "", area: "", pincode: "", minPrice: "", maxPrice: "", sort: "newest" });

  const [showEnquiry, setShowEnquiry] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [pendingWhatsApps, setPendingWhatsApps] = useState<any[]>([]);
  const [showWhatsAppQueue, setShowWhatsAppQueue] = useState(false);
  const [cartEnquiry, setCartEnquiry] = useState({
  buyerName: "",
  buyerPhone: "",
  location: "",
  pincode: "",
  message: "",
});
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
    
  const loadCartBuyerDetails = () => {
  if (typeof window === "undefined") return;

  try {
    const user = JSON.parse(
      sessionStorage.getItem("currentUser") ||
      sessionStorage.getItem("loggedInUser") ||
      sessionStorage.getItem("user") ||
      "{}"
    );

    setCartEnquiry((current) => ({
      ...current,
      buyerName: current.buyerName || user.name || "",
      buyerPhone: current.buyerPhone || user.phone || "",
    }));
  } catch {
    // Keep fields editable if saved login data is unavailable.
  }
};
  const getCartIdentity = (item: any) => {
    // Every supplier listing must be treated as its own cart product.
    // Prefer listing Mongo ID because it uniquely identifies the approved
    // supplier-product listing. Fall back safely for older records.
    return String(
      item?._id ||
      item?.listingCode ||
      `${item?.providerUserCode || ""}::${item?.masterItemCode || ""}::${item?.itemName || ""}`
    ).trim();
  };

  const addToCart = (item: any) => {
    // BUILDMITRA_KEEP_CART_OPEN
    setShowCart(true);
    const productKey = getCartIdentity(item);

    setCart((current) => {
      const existingIndex = current.findIndex(
        (cartItem) => getCartIdentity(cartItem) === productKey
      );

      // Same product clicked again:
      // increase quantity instead of creating duplicate row.
      if (existingIndex >= 0) {
        const next = [...current];

        next[existingIndex] = {
          ...next[existingIndex],
          quantity: String(
            (Number(next[existingIndex].quantity || 0) || 0) + 1
          ),
        };

        return next;
      }

      // Different product:
      // ALWAYS append it and preserve every existing cart item.
      return [
        ...current,
        {
          ...item,
          quantity: "1",
          specification: "",
        },
      ];
    });

    loadCartBuyerDetails();

    // Zepto behaviour:
    // every ADD opens the SAME cart containing all previous items.
    setShowCart(true);
  };

  const getCartItemQty = (item: any) => {
    const productKey = getCartIdentity(item);

    const cartItem = cart.find(
      (x) => getCartIdentity(x) === productKey
    );

    return cartItem
      ? Number(cartItem.quantity || 0)
      : 0;
  };

  const updateCartQty = (item: any, delta: number) => {
    const productKey = getCartIdentity(item);

    setCart((current) => {
      const index = current.findIndex(
        (x) => getCartIdentity(x) === productKey
      );

      if (index < 0) {
        if (delta <= 0) return current;

        return [
          ...current,
          {
            ...item,
            quantity: String(delta),
            specification: "",
          },
        ];
      }

      const newQty =
        (Number(current[index].quantity || 0) || 0) + delta;

      if (newQty <= 0) {
        return current.filter(
          (_, currentIndex) => currentIndex !== index
        );
      }

      const next = [...current];

      next[index] = {
        ...next[index],
        quantity: String(newQty),
      };

      return next;
    });
  };
  const getItemRate = (item: any) => {
    const rawRate =
      item?.rate ??
      item?.price ??
      item?.sellingPrice ??
      item?.amount ??
      0;

    return Number(String(rawRate).replace(/,/g, "")) || 0;
  };

  const getItemEstimate = (item: any) => {
    const quantity = Number(item?.quantity || 0);
    return quantity * getItemRate(item);
  };

  const cartEstimatedTotal = cart.reduce(
    (total, item) => total + getItemEstimate(item),
    0
  );

  const normalizedCartPhone = String(
    cartEnquiry.buyerPhone || ""
  )
    .replace(/\D/g, "")
    .slice(-10);

  const cartReadyToSend =
    cart.length > 0 &&
    normalizedCartPhone.length === 10 &&
    String(cartEnquiry.location || "").trim().length > 0 &&
    /^\d{6}$/.test(
      String(cartEnquiry.pincode || "").trim()
    ) &&
    cart.every(
      (item) => Number(item.quantity || 0) > 0
    );
  const sendWhatsApp = (item: any) => {
    sendEnquiry(item);
  };

  const sendEnquiry = (item: any) => {
    let user: any = {};

    if (typeof window !== "undefined") {
      try {
        user = JSON.parse(
          sessionStorage.getItem("currentUser") ||
          sessionStorage.getItem("loggedInUser") ||
          sessionStorage.getItem("user") ||
          "{}"
        );
      } catch {
        user = {};
      }
    }

    setSelectedItem(item);

    setEnquiry({
      buyerName: user.name || "",
      buyerPhone: user.phone || "",
      itemType: item.itemType || "material",
      quantity: "",
      unit: item.unit || "",
      location: "",
      pincode: "",
      specification: "",
      message: "",
    });

    setShowEnquiry(true);
  };

  const submitCartEnquiry = async () => {
    if (cart.length === 0) {
      alert("Your enquiry cart is empty.");
      return;
    }

    if (!cartReadyToSend) {
      alert(
        "Enter valid contact number, delivery address, 6-digit PIN code and quantity."
      );
      return;
    }

    const invalidQuantity = cart.some(
      (item) =>
        !String(item.quantity || "").trim() ||
        Number(item.quantity) <= 0
    );

    if (invalidQuantity) {
      alert(
        "Please enter a valid quantity for every cart item."
      );
      return;
    }

    let currentUser: any = {};

    try {
      currentUser = JSON.parse(
        sessionStorage.getItem("currentUser") ||
          sessionStorage.getItem("loggedInUser") ||
          sessionStorage.getItem("user") ||
          "{}"
      );
    } catch {
      currentUser = {};
    }

    const buyerUserCode =
      currentUser.userCode ||
      currentUser.uniqueCode ||
      "";

    const cartGroupCode = `CART-${Date.now()}`;

      // BUILDMITRA_CART_QUICK_REPLY_CODE
      const cartReplyCode =
        `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;

    try {
      const createdEnquiries: any[] = [];

      /*
        Create one database enquiry for every selected item.
      */
      const batchCode = `BATCH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;


      for (const item of cart) {
        const res = await fetch(`${API_BASE}/api/enquiry`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            batchCode,

            buyerUserCode,
            buyerName: cartEnquiry.buyerName,
            buyerPhone: cartEnquiry.buyerPhone,

            providerUserCode: item.providerUserCode,
            batchCode: cartGroupCode,
            quickReplyCode: cartReplyCode,
            providerName: item.providerName,
            providerPhone: item.providerPhone,

            itemType: item.itemType || "material",
            itemName: item.itemName,
            listingCode: item.listingCode,
            masterItemCode: item.masterItemCode,

            quantity: item.quantity,
            unit: item.unit || "",

            location: cartEnquiry.location,
            pincode: cartEnquiry.pincode,

            specification:
              cartEnquiry.message || "",

            message:
              `${
                cartEnquiry.message ||
                "Grouped marketplace enquiry"
              } ` +
              `[Cart Group: ${cartGroupCode}]`,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          throw new Error(
            data.message ||
              `Could not submit enquiry for ${item.itemName}`
          );
        }

        createdEnquiries.push({
          ...item,
          enquiryCode:
            data.enquiry?.enquiryCode ||
            data.enquiryCode ||
            "",
        });
      }

      /*
        Group all successfully created enquiries supplier-wise.
      */
      const providerGroups = createdEnquiries.reduce(
        (groups: Record<string, any[]>, item: any) => {
          const providerKey =
            item.providerUserCode ||
            item.providerPhone ||
            item.providerName ||
            `provider-${Object.keys(groups).length + 1}`;

          if (!groups[providerKey]) {
            groups[providerKey] = [];
          }

          groups[providerKey].push(item);

          return groups;
        },
        {}
      );

      /*
        Create one WhatsApp URL per supplier.

        We do not open multiple tabs automatically because browsers
        normally block the second and later popup.
      */
      const whatsappQueue = Object.entries(providerGroups)
        .map(([providerKey, groupedItems]) => {
          const providerItems = groupedItems as any[];
          const provider = providerItems[0];

          const phone = cleanPhone(
            provider.providerPhone
          );

          const PUBLIC_URL =
            process.env.NEXT_PUBLIC_APP_URL ||
            window.location.origin;

          const itemLines = providerItems
            .map((item, index) => {
              const qty = Number(item.quantity || 0);
              const unit = String(item.unit || "").toUpperCase();
              const rate = Math.round(
                Number(
                  item.listedRate ??
                  item.uploadedRate ??
                  item.providerRate ??
                  item.rate ??
                  0
                )
              );

              const amount = Math.round(
                Number(
                  item.estimatedAmount ??
                  item.estimate ??
                  qty * rate
                )
              );

              const shortName = String(item.itemName || "")
                .trim()
                .split(/\s+/)
                .slice(0, 9)
                .join(" ");

              return `${index + 1}. ${shortName} - ${qty} ${unit} - ₹${rate.toLocaleString("en-IN")}/- - Amt ₹${amount.toLocaleString("en-IN")}`;
            })
            .join("\n");

          const providerEstimatedTotal =
            providerItems.reduce(
              (total, item) =>
                total + getItemEstimate(item),
              0
            );

          const replyQuoteLink =
            `https://buildmitra-frontend.vercel.app/quick-batch-reply?batchCode=${encodeURIComponent(cartGroupCode)}&provider=${encodeURIComponent(provider.providerUserCode || "")}&code=${encodeURIComponent(cartReplyCode)}`;

          const whatsappMessage =
`🏗️ BUILDMITRA ENQUIRY

Enquiry Ref: ${cartGroupCode}

Buyer: ${cartEnquiry.buyerName} | ${cartEnquiry.buyerPhone}
Delivery: ${cartEnquiry.location} - ${cartEnquiry.pincode}

${itemLines}

Total Estimate Amount: ₹${Math.round(providerEstimatedTotal).toLocaleString("en-IN")}

Reply Quote:
${replyQuoteLink}

BuildMitra`;

          return {
            providerKey,
            providerName:
              provider.providerName ||
              "BuildMitra Supplier",

            providerPhone:
              provider.providerPhone || "",

            itemCount: providerItems.length,

            itemNames: providerItems
              .map((item) => item.itemName)
              .join(", "),

            url: phone
              ? `https://wa.me/91${phone}?text=${encodeURIComponent(
                  whatsappMessage
                )}`
              : "",
          };
        })
        .filter((entry) => entry.url);

      setPendingWhatsApps(whatsappQueue);
      setShowWhatsAppQueue(true);

      setCart([]);
      setShowCart(false);

      setCartEnquiry({
        buyerName: cartEnquiry.buyerName,
        buyerPhone: cartEnquiry.buyerPhone,
        location: "",
        pincode: "",
        message: "",
      });
    } catch (error: any) {
      alert(
        error?.message ||
          "Could not submit grouped cart enquiry."
      );
    }
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
        buyerUserCode:
          JSON.parse(
            sessionStorage.getItem("currentUser") ||
            sessionStorage.getItem("loggedInUser") ||
            sessionStorage.getItem("user") ||
            "{}"
          ).userCode ||
          JSON.parse(
            sessionStorage.getItem("currentUser") ||
            sessionStorage.getItem("loggedInUser") ||
            sessionStorage.getItem("user") ||
            "{}"
          ).uniqueCode ||
          "",
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

      <MarketRateTrend />

      <div className="bm-marketplace-mobile-filters" style={styles.filters}>

        {/* MOBILE ROW 1 + DESKTOP NORMAL FILTERS */}
        <div className="bm-market-filter-row bm-market-filter-location">
          <input
            className="bm-market-city"
            style={styles.input}
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />

          <input
            className="bm-market-pin"
            style={styles.input}
            inputMode="numeric"
            maxLength={6}
            placeholder="PIN Code"
            value={filters.pincode}
            onChange={(e) =>
              setFilters({
                ...filters,
                pincode: e.target.value.replace(/\D/g, "").slice(0, 6)
              })
            }
          />
        </div>

        {/* MOBILE ROW 2 */}
        <div className="bm-market-filter-row bm-market-filter-price">
          <input
            className="bm-market-min"
            style={styles.input}
            inputMode="numeric"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />

          <input
            className="bm-market-max"
            style={styles.input}
            inputMode="numeric"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />

          <select
            className="bm-market-sort"
            style={styles.input}
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          >
            <option value="newest">Newest</option>
            <option value="lowest">Lowest</option>
          </select>
        </div>

        {/* MOBILE ROW 3 */}
        <div className="bm-market-filter-search-row">
          <input
            className="bm-market-search"
            style={styles.input}
            placeholder="Search material / product"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* DESKTOP-ONLY EXTRA FILTERS */}
        <div className="bm-market-desktop-extra">
          <select
            style={styles.input}
            value={filters.itemType}
            onChange={(e) => setFilters({ ...filters, itemType: e.target.value })}
          >
            <option value="">All types</option>
            <option value="material">Material</option>
            <option value="service">Contractor service</option>
            <option value="labour">Labour</option>
            <option value="machine">Machine</option>
            <option value="vendor">Vendor product</option>
          </select>

          <input
            style={styles.input}
            placeholder="Category"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Subcategory"
            value={filters.subCategory}
            onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Brand"
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Area"
            value={filters.area}
            onChange={(e) => setFilters({ ...filters, area: e.target.value })}
          />

          <button
            style={styles.clear}
            onClick={() =>
              setFilters({
                search: "",
                itemType: "",
                category: "",
                subCategory: "",
                brand: "",
                city: "",
                area: "",
                pincode: "",
                minPrice: "",
                maxPrice: "",
                sort: "newest"
              })
            }
          >
            Clear
          </button>
        </div>
      </div>
<div style={styles.marketplaceTopRow}>
  <div style={styles.count}>
    Showing <strong>{listings.length}</strong> approved listings
  </div>

  <button
    type="button"
    style={styles.cartButton}
    onClick={() => {
  loadCartBuyerDetails();
  setShowCart(true);
}}
  >
    Enquiry Cart ({cart.length})
  </button>
</div>

      {loading ? (
        <div style={styles.empty}>Loading marketplace...</div>
      ) : listings.length === 0 ? (
        <div style={styles.empty}>No approved listings found.</div>
      ) : (
        <div style={styles.grid} className="marketplace-grid">
          {listings.map((item) => {
            const qty = getCartItemQty(item);

            return (
              <div key={item._id || item.listingCode} style={styles.card} className="marketplace-card product-card">
                {/* 1. Product Image Thumbnail */}
                <div className="product-image-container thumbnail-wrapper" style={{ width: "100%", height: 180, position: "relative" }}>
                  <MarketplaceProductImage item={item} />
                </div>

                {/* 2. Product Name */}
                <h2 style={styles.item} className="product-title">
                  {item.itemName}
                </h2>

                {/* 3. Supplier Name */}
                <div className="supplier-name" style={{ fontSize: 11, color: "#64748b", fontWeight: 600, margin: "2px 0" }}>
                  {formatSupplierName(item.providerName, 8)}
                </div>

                {/* 4. Rate / Unit */}
                <div style={styles.price} className="product-price">
                  ₹{Number(item.rate || 0).toLocaleString("en-IN")} <span style={styles.unit}>/ {item.unit || "unit"}</span>
                </div>

                {/* Hidden Metadata Elements */}
                <div className="verified-badge" style={{ display: "none" }}>Verified BuildMitra Provider</div>
                <div className="location-text" style={{ display: "none" }}>{item.providerCity || item.location}</div>

                {/* 5. Zepto-Style Add to Cart Stepper */}
                <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                  {qty === 0 ? (
                    <button
                      type="button"
                      style={styles.zeptoAddBtn}
                      onClick={() => addToCart(item)}
                    >
                      ADD 🛒
                    </button>
                  ) : (
                    <div style={styles.zeptoStepper}>
                      <button
                        type="button"
                        style={styles.zeptoStepBtn}
                        onClick={() => updateCartQty(item, -1)}
                      >
                        −
                      </button>
                      <span style={styles.zeptoQtyVal}>{qty}</span>
                      <button
                        type="button"
                        style={styles.zeptoStepBtn}
                        onClick={() => {
                          updateCartQty(item, 1);
                          loadCartBuyerDetails();
                          setShowCart(true);
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zepto-Style Floating Bottom Cart Bar */}
      {cart.length > 0 && !showCart && (
        <div style={styles.floatingCartBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={styles.cartBadgeCount}>
              🛒 {cart.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)} ITEMS
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#a7f3d0", textTransform: "uppercase", fontWeight: 700 }}>Estimated Total</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#ffffff" }}>
                ₹{cartEstimatedTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
          <button style={styles.floatingCartBtn} onClick={() => setShowCart(true)}>
            View Cart & Send Enquiries ➔
          </button>
        </div>
      )}
      {showCart && (
        <div
          style={{ ...styles.modalOverlay, background: "transparent", pointerEvents: "none" }}
        >
          <div
            style={{ ...styles.cartModalBox, pointerEvents: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.cartHeader}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>My Cart</h2>

                <div style={styles.cartSubText}>
                  {cart.length} item{cart.length === 1 ? "" : "s"}
                </div>
              </div>

              <button
                type="button"
                style={styles.cartCloseButton}
                onClick={() => setShowCart(false)}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={styles.cartEmpty}>
                <div style={{ fontSize: 38, marginBottom: 10 }}>🛒</div>
                <strong>Your cart is empty</strong>

                <div style={{ marginTop: 6 }}>
                  Select materials from the marketplace.
                </div>
              </div>
            ) : (
              <>
                <div style={styles.cartScrollArea}>
                  <div style={styles.cartList}>
                    {cart.map((cartItem, index) => {
                      const quantity =
                        Number(cartItem.quantity || 0) || 0;

                      const increaseQuantity = () => {
                        setCart((current) =>
                          current.map((item, cartIndex) =>
                            cartIndex === index
                              ? {
                                  ...item,
                                  quantity: String(
                                    (Number(item.quantity || 0) || 0) + 1
                                  ),
                                }
                              : item
                          )
                        );
                      };

                      const decreaseQuantity = () => {
                        if (quantity <= 1) {
                          setCart((current) =>
                            current.filter(
                              (_, cartIndex) => cartIndex !== index
                            )
                          );

                          return;
                        }

                        setCart((current) =>
                          current.map((item, cartIndex) =>
                            cartIndex === index
                              ? {
                                  ...item,
                                  quantity: String(
                                    Math.max(
                                      1,
                                      (Number(item.quantity || 1) || 1) - 1
                                    )
                                  ),
                                }
                              : item
                          )
                        );
                      };

                      return (
                        <div
                          key={`${cartItem.providerUserCode}-${cartItem.listingCode}-${index}`}
                          style={styles.cartItem}
                        >
                          <div style={styles.cartProductIcon}>
                            {String(cartItem.itemName || "M")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div style={styles.cartProductDetails}>
                            <div style={styles.cartItemName}>
                              {String(cartItem.itemName || "").trim().split(/\s+/).slice(0, 8).join(" ")}
                            </div>

                            <div style={styles.cartProvider}>
                              {cartItem.providerName ||
                                "Verified Supplier"}
                            </div>

                            <div style={styles.cartRate}>
                              ₹
                              {getItemRate(cartItem).toLocaleString(
                                "en-IN"
                              )}
                              {cartItem.unit
                                ? ` / ${cartItem.unit}`
                                : ""}
                            </div>

                            <div style={styles.cartItemBottom}>
                              <div style={styles.quantityControl}>
                                <button
                                  type="button"
                                  style={styles.quantityButton}
                                  onClick={decreaseQuantity}
                                >
                                  −
                                </button>

                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  style={styles.quantityInput}
                                  value={cartItem.quantity || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    setCart((current) =>
                                      current.map(
                                        (item, cartIndex) =>
                                          cartIndex === index
                                            ? {
                                                ...item,
                                                quantity: value,
                                              }
                                            : item
                                      )
                                    );
                                  }}
                                />

                                <button
                                  type="button"
                                  style={styles.quantityButton}
                                  onClick={increaseQuantity}
                                >
                                  +
                                </button>
                              </div>

                              <div style={styles.cartItemEstimate}>
                                ₹
                                {getItemEstimate(
                                  cartItem
                                ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                              </div>
                            </div>

                            {/* Item-level Special Specification Input */}
                            <textarea
                              style={{
                                display: "none",
                                width: "100%",
                                marginTop: 10,
                                padding: "6px 10px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: 12,
                                minHeight: 42,
                                fontFamily: "inherit",
                                boxSizing: "border-box",
                                outline: "none"
                              }}
                              placeholder="Any special specification, size or notes..."
                              value={cartItem.specification || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCart((current) =>
                                  current.map((item, cartIndex) =>
                                    cartIndex === index
                                      ? { ...item, specification: val }
                                      : item
                                  )
                                );
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            style={styles.cartDeleteButton}
                            onClick={() =>
                              setCart((current) =>
                                current.filter(
                                  (_, cartIndex) =>
                                    cartIndex !== index
                                )
                              )
                            }
                            aria-label="Remove item"
                          >
                            🗑
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div style={styles.cartDeliveryCard}>
                    <div style={styles.cartSectionTitle}>
                      Delivery details
                    </div>

                    <div style={styles.cartLoggedBuyer}>
                      <div>
                        <strong>
                          {cartEnquiry.buyerName ||
                            "Logged-in buyer"}
                        </strong>

                        {cartEnquiry.buyerPhone && (
                          <input
  type="tel"
  inputMode="numeric"
  maxLength={10}
  required
  value={cartEnquiry.buyerPhone}
  placeholder="Contact number *"
  onChange={(e) =>
    setCartEnquiry({
      ...cartEnquiry,
      buyerPhone: e.target.value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").slice(-10),
    })
  }
  style={{
    width: "100%",
    marginTop: 6,
    boxSizing: "border-box",
    padding: "10px 11px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 14,
    background: "#ffffff",
  }}
/>
                        )}
                      </div>
                    </div>

                    <textarea
                      style={styles.cartAddressInput}
                      placeholder="Delivery address / location *" required
                      value={cartEnquiry.location}
                      onChange={(e) =>
                        setCartEnquiry({
                          ...cartEnquiry,
                          location: e.target.value,
                        })
                      }
                    />

                    <input
                      style={styles.cartPincodeInput}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Delivery PIN code *" required
                      value={cartEnquiry.pincode}
                      onChange={(e) =>
                        setCartEnquiry({
                          ...cartEnquiry,
                          pincode: e.target.value.replace(
                            /\D/g,
                            ""
                          ),
                        })
                      }
                    />

                    <textarea
                      style={styles.cartSpecificationInput}
                      placeholder="Specification or delivery instructions"
                      value={cartEnquiry.message}
                      onChange={(e) =>
                        setCartEnquiry({
                          ...cartEnquiry,
                          message: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div style={styles.cartPriceDetails}>
                    <div style={styles.cartPriceHeading}>
                      Price details
                    </div>

                    <div style={styles.cartPriceRow}>
                      <span>Item estimate</span>

                      <strong>
                        ₹
                        {cartEstimatedTotal.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </strong>
                    </div>

                    <div style={styles.cartPriceNote}>
                      Final quotation may include GST, transport,
                      loading, unloading and supplier terms.
                    </div>
                  </div>
                </div>

                <div style={styles.cartStickyFooter}>
                  <div>
                    <div style={styles.cartFooterLabel}>
                      Estimated total
                    </div>

                    <div style={styles.cartFooterAmount}>
                      ₹
                      {cartEstimatedTotal.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      ...styles.cartSubmitButton,
                      opacity: cartReadyToSend ? 1 : 0.45,
                      cursor: cartReadyToSend ? "pointer" : "not-allowed",
                    }}
                    disabled={!cartReadyToSend}
                    onClick={submitCartEnquiry}
                  >
                    Send Enquiry
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showWhatsAppQueue && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(17,24,39,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
          onClick={() => setShowWhatsAppQueue(false)}
        >
          <div
            style={{
              width: "min(460px, 100%)",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: 16,
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.25)",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                padding: "16px 18px",
                background: "#ffffff",
                borderBottom:
                  "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 19,
                  }}
                >
                  WhatsApp Messages Ready
                </h2>

                <div
                  style={{
                    marginTop: 4,
                    color: "#6b7280",
                    fontSize: 12,
                  }}
                >
                  Open one message for each supplier
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowWhatsAppQueue(false)
                }
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border:
                    "1px solid #e5e7eb",
                  background: "#f9fafb",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: 14,
                display: "grid",
                gap: 10,
              }}
            >
              {pendingWhatsApps.map(
                (whatsappItem, index) => (
                  <div
                    key={
                      whatsappItem.providerKey ||
                      index
                    }
                    style={{
                      padding: 13,
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: 12,
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 900,
                            color: "#111827",
                          }}
                        >
                          {index + 1}.{" "}
                          {
                            whatsappItem.providerName
                          }
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            color: "#6b7280",
                            fontSize: 12,
                          }}
                        >
                          {
                            whatsappItem.providerPhone
                          }
                        </div>

                        <div
                          style={{
                            marginTop: 7,
                            color: "#374151",
                            fontSize: 12,
                            lineHeight: 1.45,
                          }}
                        >
                          {
                            whatsappItem.itemCount
                          }{" "}
                          item
                          {whatsappItem.itemCount ===
                          1
                            ? ""
                            : "s"}
                          :{" "}
                          {whatsappItem.itemNames}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            whatsappItem.url,
                            "_blank"
                          )
                        }
                        style={{
                          flexShrink: 0,
                          border: 0,
                          borderRadius: 9,
                          background: "#16a34a",
                          color: "#ffffff",
                          padding: "11px 13px",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        Open WhatsApp
                      </button>
                    </div>
                  </div>
                )
              )}

              <div
                style={{
                  padding: 11,
                  borderRadius: 10,
                  background: "#f0fdf4",
                  color: "#166534",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                Enquiries are already saved. Open every
                supplier’s WhatsApp button to send their
                separate message.
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowWhatsAppQueue(false);
                  setPendingWhatsApps([]);
                }}
                style={{
                  width: "100%",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: 10,
                  background: "#ffffff",
                  padding: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {showEnquiry && selectedItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2 style={{ marginTop: 0 }}>Send Enquiry</h2>
            <p><b>{selectedItem?.itemName || ""}</b></p>

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
  page: { minHeight: "100vh", background: "#f5f7fb", padding: typeof window !== "undefined" && window.innerWidth < 768 ? "4px 0px" : 24, fontFamily: "Arial, sans-serif", color: "#111827" },
  header: { maxWidth: 1250, margin: "0 auto 18px" },
  title: { margin: 0, fontSize: 34, fontWeight: 900 },
  subtitle: { marginTop: 8, color: "#6b7280", fontSize: 16 },
  filters: { maxWidth: "100%", margin: typeof window !== "undefined" && window.innerWidth < 768 ? "0 0 8px 0" : "0 auto 14px", background: "#fff", padding: typeof window !== "undefined" && window.innerWidth < 768 ? "8px 4px" : 16, borderRadius: 8, display: "flex", flexWrap: "wrap", gap: typeof window !== "undefined" && window.innerWidth < 768 ? 6 : 12, alignItems: "center" },
  input: { padding: "11px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, background: "#fff" },
  clear: { padding: "11px 14px", borderRadius: 8, border: 0, background: "#ef4444", color: "#fff", fontWeight: 800, cursor: "pointer" },
  count: {
  maxWidth: 1250,
  margin: "0 auto 16px",
  color: "#374151",
},

marketplaceTopRow: {
  maxWidth: 1250,
  margin: "0 auto 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
},

cartButton: {
  border: 0,
  background: "#155eef",
  color: "#fff",
  borderRadius: 8,
  padding: "11px 16px",
  fontWeight: 900,
  cursor: "pointer",
},

cartAddButton: {
  flex: 1,
  border: 0,
  background: "#f59e0b",
  color: "#111827",
  borderRadius: 8,
  padding: 11,
  fontWeight: 900,
  cursor: "pointer",
},
  grid: {
  maxWidth: "100%",
  margin: "0 auto",
  padding: typeof window !== "undefined" && window.innerWidth < 768 ? "4px" : "0",
  display: "grid",
  gridTemplateColumns:
    typeof window !== "undefined" && window.innerWidth < 768
      ? "repeat(2, minmax(0, 1fr))"
      : "repeat(auto-fit, minmax(260px, 1fr))",
  gap:
    typeof window !== "undefined" && window.innerWidth < 768
      ? 8
      : 16,
  width: "100%",
  overflow: "visible",
},
  card: { background: "#fff", minWidth: 0, width: "100%", display: "block", visibility: "visible", opacity: 1, borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
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
  cartModalBox: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "min(420px, 100vw)",
    height: "100vh",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-10px 0 35px rgba(0,0,0,0.18)",
    overflow: "hidden",
    zIndex: 1001,
  },

  cartHeader: {
    minHeight: 68,
    padding: "14px 16px",
    borderBottom: "1px solid #e5e7eb",
    background: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },

  cartSubText: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 3,
  },

  cartCloseButton: {
    width: 38,
    height: 38,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    borderRadius: "50%",
    fontSize: 17,
    fontWeight: 900,
    cursor: "pointer",
  },

  cartEmpty: {
    margin: "auto 20px",
    padding: 28,
    textAlign: "center",
    color: "#6b7280",
    border: "1px dashed #d1d5db",
    borderRadius: 14,
    background: "#f9fafb",
  },

  cartScrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 14px 120px",
    background: "#f5f6f8",
  },

  cartList: { display: "grid", gap: 5,
  },

  cartItem: { position: "relative", display: "flex", gap: 4, padding: "7px 5px",
    border: "1px solid #e5e7eb",
    borderRadius: 13,
    background: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  cartProductIcon: {
    display: "none",
  },

  cartProductDetails: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 92px 58px 76px",
    columnGap: 5,
    alignItems: "center",
  },

  cartItemName: {
    gridColumn: "1",
    gridRow: "1",
    minWidth: 0,
    padding: 0,
    fontWeight: 800,
    fontSize: 11,
    lineHeight: 1.15,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  cartProvider: {
    display: "none",
  },

  cartRate: {
    gridColumn: "3",
    gridRow: "1",
    margin: 0,
    padding: 0,
    fontSize: 11,
    fontWeight: 800,
    color: "#111827",
    textAlign: "right",
    whiteSpace: "nowrap",
  },

  cartItemBottom: {
    display: "contents",
  },

  quantityControl: {
    gridColumn: "2",
    gridRow: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    height: 26,
    border: "1px solid #16a34a",
    borderRadius: 5,
    overflow: "hidden",
    background: "#fff",
  },

  quantityButton: {
    width: 20,
    minWidth: 20,
    height: 24,
    padding: 0,
    border: 0,
    background: "#ecfdf5",
    color: "#15803d",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
  },

  quantityInput: {
    width: 42,
    minWidth: 42,
    height: 24,
    padding: "0 1px",
    border: 0,
    outline: "none",
    textAlign: "center",
    fontSize: 10,
    fontWeight: 800,
    background: "#fff",
    boxSizing: "border-box",
  },

  cartItemEstimate: {
    gridColumn: "4",
    gridRow: "1",
    margin: 0,
    fontSize: 11,
    fontWeight: 900,
    color: "#111827",
    textAlign: "right",
    whiteSpace: "nowrap",
  },

  cartDeleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    border: 0,
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
  },

  cartDeliveryCard: {
    marginTop: 14,
    padding: 14,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 13,
  },

  cartSectionTitle: {
    fontSize: 15,
    fontWeight: 900,
    marginBottom: 10,
  },

  cartLoggedBuyer: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 9,
    background: "#f9fafb",
    color: "#374151",
    fontSize: 13,
  },

  cartAddressInput: {
    width: "100%",
    minHeight: 66,
    padding: 11,
    border: "1px solid #d1d5db",
    borderRadius: 9,
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  },

  cartPincodeInput: {
    width: "100%",
    marginTop: 9,
    padding: 11,
    border: "1px solid #d1d5db",
    borderRadius: 9,
    boxSizing: "border-box",
    outline: "none",
  },

  cartSpecificationInput: {
    width: "100%",
    minHeight: 70,
    marginTop: 9,
    padding: 11,
    border: "1px solid #d1d5db",
    borderRadius: 9,
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  },

  cartPriceDetails: {
    marginTop: 14,
    padding: 14,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 13,
  },

  cartPriceHeading: {
    fontWeight: 900,
    marginBottom: 12,
  },

  cartPriceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
  },

  cartPriceNote: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px dashed #d1d5db",
    color: "#6b7280",
    fontSize: 11,
    lineHeight: 1.45,
  },

  cartStickyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 82,
    padding: "12px 14px",
    borderTop: "1px solid #e5e7eb",
    background: "#ffffff",
    boxShadow: "0 -8px 25px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },

  cartFooterLabel: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: 700,
  },

  cartFooterAmount: {
    marginTop: 2,
    fontSize: 21,
    fontWeight: 900,
    color: "#111827",
  },

  cartSubmitButton: {
    minWidth: 155,
    border: 0,
    borderRadius: 10,
    padding: "13px 16px",
    background: "#16a34a",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(17,24,39,0.42)",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "stretch",
    padding: 0,
  },
  modalBox: {
    background: "#fff",
    borderRadius: 16,
    padding: 22,
    width: "100%",
    maxWidth: 520,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },

  zeptoAddBtn: {
    minWidth: 82,
    width: "auto",
    whiteSpace: "nowrap",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: "7px 16px",
    borderRadius: 8,
    border: "1px solid #16a34a",
    background: "#f0fdf4",
    color: "#16a34a",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
    flex: 1,
    textAlign: "center",
  },
  zeptoStepper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid #16a34a",
    borderRadius: 8,
    background: "#f0fdf4",
    overflow: "hidden",
    flex: 1,
  },
  zeptoStepBtn: {
    padding: "6px 12px",
    border: 0,
    background: "#dcfce7",
    color: "#15803d",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
  },
  zeptoQtyVal: {
    padding: "0 8px",
    fontSize: 14,
    fontWeight: 900,
    color: "#166534",
  },
  floatingCartBar: {
    position: "fixed",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(600px, 92vw)",
    background: "#065f46",
    borderRadius: 16,
    padding: "12px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    zIndex: 999,
  },
  cartBadgeCount: {
    background: "#047857",
    color: "#ffffff",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 900,
  },
  floatingCartBtn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: 0,
    background: "#10b981",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
};
















































