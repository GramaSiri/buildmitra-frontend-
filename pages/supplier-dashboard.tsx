import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function SupplierDashboard() {
  const [userName, setUserName] = useState("Supplier");
  const [userId, setUserId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [shopPhoto, setShopPhoto] = useState(null);
  const [businessCard, setBusinessCard] = useState(null);
  const [quoteResponse, setQuoteResponse] = useState({ price: "", deliveryDate: "", notes: "" });
  const [pincode, setPincode] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", unit: "kg", price: "", stock: "", minOrder: "", description: ""
  });
  const [newOffer, setNewOffer] = useState({
    offerName: "", productName: "", bulkQuantity: "", bulkValue: "", discount: "", 
    freeDelivery: "No", buyGet: "", billDiscount: "", validFrom: "", validTo: ""
  });
  const [editProduct, setEditProduct] = useState({
    id: "", name: "", category: "", unit: "", price: "", stock: "", minOrder: "", description: ""
  });

  // Load user data on mount
  useEffect(() => {
    setIsClient(true);
    
    const user = localStorage.getItem("loggedInUser");
    if (user) {
      const userData = JSON.parse(user);
      setUserName(userData.name);
      setUserId(userData.userId);
      console.log("✅ User loaded with userId:", userData.userId);
      loadUserData(userData.userId);
    }
  }, []);

  const loadUserData = (uid) => {
    // Load supplier info
    const info = localStorage.getItem("supplierInfo_" + uid);
    if (info) {
      setSupplierInfo(JSON.parse(info));
    }
    
    // Load products for this specific user
    const savedProducts = localStorage.getItem("supplierProducts_" + uid);
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
      console.log("✅ Loaded products for user:", uid, JSON.parse(savedProducts).length);
    } else {
      setProducts([]);
    }
  };

  // State
  const [supplierInfo, setSupplierInfo] = useState({
    shopName: "",
    ownerName: "",
    shopPhotoUrl: null,
    businessCardUrl: null,
    gstNo: "",
    address: "",
    phone: "",
    email: "",
    since: new Date().getFullYear().toString(),
    rating: 0,
    totalOrdersCompleted: 0,
    totalRevenue: 0,
    activeOffers: 0,
    totalProducts: 0,
    totalEnquiries: 0
  });

  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quoteRequests, setQuoteRequests] = useState([]);

  // Save products with userId
  useEffect(() => {
    if (isClient && userId) {
      localStorage.setItem("supplierProducts_" + userId, JSON.stringify(products));
      // Also update supplierProducts for backward compatibility
      localStorage.setItem("supplierProducts", JSON.stringify(products));
    }
  }, [products, isClient, userId]);

  // Add Product - CRITICAL FIX: Store ownerName with EVERY product
  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please fill product name and price");
      return;
    }
    
    // Get current user info
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const supplierInfoData = JSON.parse(localStorage.getItem("supplierInfo_" + user.userId) || "{}");
    
    // CRITICAL: Get the correct owner name
    const ownerName = supplierInfoData.shopName || user.name || "Supplier";
    const ownerPhone = supplierInfoData.phone || user.phone || "";
    
    console.log("📝 Adding product with ownerName:", ownerName);
    console.log("📝 User:", user);
    
    const product = {
      id: Date.now(),
      userId: user.userId,
      ownerName: ownerName,  // CRITICAL: Store the name here
      ownerPhone: ownerPhone,
      shopName: ownerName,
      businessName: ownerName,
      name: newProduct.name,
      category: newProduct.category || "Others",
      unit: newProduct.unit || "piece",
      price: parseFloat(newProduct.price) || 0,
      stock: parseInt(newProduct.stock) || 0,
      minOrder: parseInt(newProduct.minOrder) || 1,
      description: newProduct.description || "",
      rating: 0,
      soldCount: 0,
      status: "Active",
      createdAt: new Date().toISOString()
    };
    
    console.log("✅ Product created with ownerName:", product.ownerName);
    
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    setSupplierInfo({ ...supplierInfo, totalProducts: updatedProducts.length });
    
    // Save immediately
    localStorage.setItem("supplierProducts_" + user.userId, JSON.stringify(updatedProducts));
    localStorage.setItem("supplierProducts", JSON.stringify(updatedProducts));
    
    setNewProduct({ name: "", category: "", unit: "kg", price: "", stock: "", minOrder: "", description: "" });
    setShowProductModal(false);
    alert("✅ Product added successfully!");
  };

  // Bulk Upload - CRITICAL FIX: Store ownerName with EVERY product
  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select a file to upload");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // Get current user info
        const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
        const supplierInfoData = JSON.parse(localStorage.getItem("supplierInfo_" + user.userId) || "{}");
        const ownerName = supplierInfoData.shopName || user.name || "Supplier";
        const ownerPhone = supplierInfoData.phone || user.phone || "";
        
        console.log("📝 Bulk upload with ownerName:", ownerName);
        
        const newProducts = [];
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const productName = row["Product Name"] || row["ProductName"] || row["name"];
          
          if (productName) {
            newProducts.push({
              id: Date.now() + i,
              userId: user.userId,
              ownerName: ownerName,
              ownerPhone: ownerPhone,
              shopName: ownerName,
              businessName: ownerName,
              name: String(productName),
              category: row["Category"] || row["category"] || "Others",
              unit: row["Unit"] || row["unit"] || "piece",
              price: Number(row["Price"] || row["price"]) || 0,
              stock: Number(row["Stock"] || row["stock"]) || 0,
              minOrder: Number(row["Min Order"] || row["minOrder"]) || 1,
              description: row["Description"] || row["description"] || "",
              rating: 0,
              soldCount: 0,
              status: "Active",
              createdAt: new Date().toISOString()
            });
          }
        }
        
        if (newProducts.length > 0) {
          const updatedProducts = [...products, ...newProducts];
          setProducts(updatedProducts);
          setSupplierInfo({ ...supplierInfo, totalProducts: updatedProducts.length });
          localStorage.setItem("supplierProducts_" + user.userId, JSON.stringify(updatedProducts));
          localStorage.setItem("supplierProducts", JSON.stringify(updatedProducts));
          alert(`✅ ${newProducts.length} products uploaded successfully!`);
          setShowBulkUploadModal(false);
          e.target.value = '';
        } else {
          alert("No valid products found.");
        }
      } catch (error) {
        alert("Error reading file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Delete Product
  const deleteProduct = (productId, productName) => {
    if(window.confirm(`Delete "${productName}"?`)) {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      setSupplierInfo({ ...supplierInfo, totalProducts: updatedProducts.length });
      localStorage.setItem("supplierProducts_" + userId, JSON.stringify(updatedProducts));
      localStorage.setItem("supplierProducts", JSON.stringify(updatedProducts));
      alert("Product deleted!");
    }
  };

  // Edit Product
  const updateProduct = () => {
    if (!editProduct.name || !editProduct.price) {
      alert("Please fill product name and price");
      return;
    }
    
    const updatedProducts = products.map(p => 
      p.id === editProduct.id ? {
        ...p,
        name: editProduct.name,
        category: editProduct.category,
        unit: editProduct.unit,
        price: parseFloat(editProduct.price),
        stock: parseInt(editProduct.stock) || 0,
        minOrder: parseInt(editProduct.minOrder) || 1,
        description: editProduct.description
      } : p
    );
    
    setProducts(updatedProducts);
    localStorage.setItem("supplierProducts_" + userId, JSON.stringify(updatedProducts));
    localStorage.setItem("supplierProducts", JSON.stringify(updatedProducts));
    setShowEditProductModal(false);
    alert("Product updated successfully!");
  };

  // STYLES - Keep existing styles
  const styles = {
    container: { padding: "20px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#1a5f7a", color: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
    welcomeText: { fontSize: "14px", opacity: 0.9, marginTop: "4px" },
    headerSub: { margin: "5px 0 0", fontSize: "12px", opacity: 0.9 },
    tabContainer: { display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #ddd", flexWrap: "wrap", backgroundColor: "white", padding: "0 16px", borderRadius: "12px 12px 0 0" },
    tab: { padding: "12px 20px", cursor: "pointer", borderBottom: "3px solid transparent", fontSize: "14px", fontWeight: "500" },
    activeTab: { borderBottomColor: "#1a5f7a", color: "#1a5f7a" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    cardTitle: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px", borderBottom: "2px solid #1a5f7a", paddingBottom: "10px" },
    grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px", marginBottom: "20px" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", marginBottom: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px", marginBottom: "20px" },
    button: { backgroundColor: "#1a5f7a", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
    buttonSuccess: { backgroundColor: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonInfo: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonWarning: { backgroundColor: "#ffc107", color: "#333", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonDanger: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "13px", overflowX: "auto" },
    th: { textAlign: "left", padding: "12px", borderBottom: "1px solid #ddd", backgroundColor: "#f8f9fa" },
    td: { padding: "12px", borderBottom: "1px solid #eee" },
    input: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "12px", color: "#333" },
    select: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" },
    progressBar: { height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden", marginTop: "8px" },
    progressFill: { height: "100%", backgroundColor: "#10b981", borderRadius: "4px", transition: "width 0.3s" },
    statValue: { fontSize: "28px", fontWeight: "bold", color: "#1a5f7a" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "700px", maxHeight: "85vh", overflow: "auto" },
    statusBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "500", display: "inline-block" },
    shopPhotoContainer: { width: "100px", height: "100px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "16px" },
    shopPhoto: { width: "100%", height: "100%", objectFit: "cover" },
    editIcon: { cursor: "pointer", color: "#1a5f7a", marginRight: "8px", fontSize: "18px" },
    deleteIcon: { cursor: "pointer", color: "#dc3545", fontSize: "18px" }
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "products", name: "Products", icon: "📦" },
    { id: "offers", name: "Offers", icon: "🏷️" },
    { id: "orders", name: "Orders", icon: "🛒" },
    { id: "quotes", name: "Quote Requests", icon: "💬" },
    { id: "analytics", name: "Analytics", icon: "📈" }
  ];

  // Rest of the functions (handleShopPhotoUpload, handleBusinessCardUpload, etc.)
  const handleShopPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setShopPhoto(url);
      setSupplierInfo({ ...supplierInfo, shopPhotoUrl: url });
      localStorage.setItem("supplierInfo_" + userId, JSON.stringify({ ...supplierInfo, shopPhotoUrl: url }));
      alert("Shop photo uploaded!");
    }
  };

  const handleBusinessCardUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBusinessCard(url);
      setSupplierInfo({ ...supplierInfo, businessCardUrl: url });
      localStorage.setItem("supplierInfo_" + userId, JSON.stringify({ ...supplierInfo, businessCardUrl: url }));
      alert("Business card uploaded!");
    }
  };

  const downloadBulkTemplate = () => {
    const templateData = [
      ["Product Name", "Category", "Unit", "Price", "Stock", "Min Order", "Description"],
      ["UltraTech Cement", "Cement", "bag", "380", "5000", "100", "Best quality cement"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProductTemplate");
    XLSX.writeFile(wb, "product_bulk_upload_template.xlsx");
    alert("Template downloaded!");
  };

  const addOffer = () => {
    if (!newOffer.offerName || !newOffer.discount) {
      alert("Please fill offer name and discount");
      return;
    }
    const offer = {
      id: offers.length + 1,
      ...newOffer,
      discount: parseFloat(newOffer.discount),
      status: "Active",
      ordersReceived: 0
    };
    setOffers([...offers, offer]);
    setSupplierInfo({ ...supplierInfo, activeOffers: supplierInfo.activeOffers + 1 });
    localStorage.setItem("supplierOffers_" + userId, JSON.stringify([...offers, offer]));
    setNewOffer({ offerName: "", productName: "", bulkQuantity: "", bulkValue: "", discount: "", freeDelivery: "No", buyGet: "", billDiscount: "", validFrom: "", validTo: "" });
    setShowOfferModal(false);
    alert("Offer created!");
  };

  const updateOrderStatus = (orderId, status) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updatedOrders);
    localStorage.setItem("supplierOrders_" + userId, JSON.stringify(updatedOrders));
    alert(`Order ${status}`);
  };

  const submitQuote = (enquiryId) => {
    if (!quoteResponse.price) {
      alert("Please enter your price");
      return;
    }
    const updatedQuotes = quoteRequests.map(q => 
      q.id === enquiryId ? { 
        ...q, 
        status: "Quoted", 
        quotedPrice: quoteResponse.price, 
        deliveryDate: quoteResponse.deliveryDate,
        notes: quoteResponse.notes,
        quotedDate: new Date().toISOString().split("T")[0]
      } : q
    );
    setQuoteRequests(updatedQuotes);
    localStorage.setItem("supplierQuotes_" + userId, JSON.stringify(updatedQuotes));
    setShowQuoteModal(false);
    setQuoteResponse({ price: "", deliveryDate: "", notes: "" });
    setSupplierInfo({ ...supplierInfo, totalEnquiries: supplierInfo.totalEnquiries + 1 });
    alert("Quote sent!");
  };

  // Render functions
  const renderOverview = () => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status === "Delivered" ? o.totalAmount : 0), 0);
    const completedOrders = orders.filter(o => o.status === "Delivered").length;
    
    return React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "20px" } },
          React.createElement("div", { style: styles.shopPhotoContainer },
            supplierInfo.shopPhotoUrl ? React.createElement("img", { src: supplierInfo.shopPhotoUrl, alt: "Shop", style: styles.shopPhoto }) : React.createElement("div", { style: { textAlign: "center", fontSize: "40px" } }, "🏪")
          ),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("h2", { style: { margin: "0 0 8px 0", color: "#1a5f7a" } }, supplierInfo.shopName || userName),
            React.createElement("p", null, "👤 Owner: ", supplierInfo.ownerName || userName),
            React.createElement("p", null, "📞 ", supplierInfo.phone || "Not set"),
            React.createElement("p", null, "📍 ", supplierInfo.address || "Not set")
          )
        )
      ),
      React.createElement("div", { style: styles.grid4 },
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, "₹", (totalRevenue/100000).toFixed(2), "L"),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Revenue")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, completedOrders),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Orders Completed")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, supplierInfo.totalEnquiries || 0),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Enquiries")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, supplierInfo.activeOffers || 0),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Active Offers")
        )
      )
    );
  };

  const renderProducts = () => {
    return React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: () => setShowProductModal(true), style: styles.button }, "+ Add Product"),
        React.createElement("button", { onClick: () => setShowBulkUploadModal(true), style: styles.buttonInfo }, "📂 Bulk Upload"),
        React.createElement("button", { onClick: downloadBulkTemplate, style: styles.buttonWarning }, "📥 Download Template")
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "📦 Product Catalog (", products.length, " products)"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "#"),
                React.createElement("th", { style: styles.th }, "Product"),
                React.createElement("th", { style: styles.th }, "Category"),
                React.createElement("th", { style: styles.th }, "Price"),
                React.createElement("th", { style: styles.th }, "Stock"),
                React.createElement("th", { style: styles.th }, "Actions")
              )
            ),
            React.createElement("tbody", null,
              products.map((p, idx) =>
                React.createElement("tr", { key: p.id },
                  React.createElement("td", { style: styles.td }, idx + 1),
                  React.createElement("td", { style: styles.td }, React.createElement("strong", null, p.name)),
                  React.createElement("td", { style: styles.td }, p.category),
                  React.createElement("td", { style: styles.td }, "₹", p.price, "/", p.unit),
                  React.createElement("td", { style: styles.td }, p.stock.toLocaleString()),
                  React.createElement("td", { style: styles.td },
                    React.createElement("span", { onClick: () => { setEditProduct(p); setShowEditProductModal(true); }, style: styles.editIcon }, "✏️"),
                    React.createElement("span", { onClick: () => deleteProduct(p.id, p.name), style: styles.deleteIcon }, "🗑️")
                  )
                )
              )
            )
          )
        )
      )
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case "overview": return renderOverview();
      case "products": return renderProducts();
      case "offers": return React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.cardTitle }, "Offers"), React.createElement("button", { onClick: () => setShowOfferModal(true), style: styles.button }, "+ Create Offer"));
      case "orders": return React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.cardTitle }, "Orders"));
      case "quotes": return React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.cardTitle }, "Quote Requests"));
      case "analytics": return React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.cardTitle }, "Analytics"));
      default: return renderOverview();
    }
  };

  if (!isClient) {
    return React.createElement("div", { style: styles.container },
      React.createElement("div", { style: styles.header },
        React.createElement("h1", { style: styles.headerTitle }, "Loading...")
      )
    );
  }

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "🏭 Supplier Dashboard"),
        React.createElement("div", { style: styles.welcomeText }, "👋 Welcome, ", userName),
        React.createElement("p", { style: styles.headerSub }, "Manage products, offers, orders, and enquiries")
      ),
      React.createElement("button", { onClick: () => window.location.href = "/", style: { ...styles.buttonDanger } }, "🚪 Logout")
    ),
    React.createElement("div", { style: styles.tabContainer },
      tabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.icon, " ", tab.name))
    ),
    renderContent(),
    
    // Add Product Modal
    showProductModal && React.createElement("div", { style: styles.modal, onClick: () => setShowProductModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", null, "Add New Product"),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "text", placeholder: "Product Name", value: newProduct.name, onChange: (e) => setNewProduct({...newProduct, name: e.target.value}), style: styles.input }),
          React.createElement("select", { value: newProduct.category, onChange: (e) => setNewProduct({...newProduct, category: e.target.value}), style: styles.select },
            React.createElement("option", null, "Cement"), React.createElement("option", null, "Steel"), React.createElement("option", null, "Bricks")
          )
        ),
        React.createElement("div", { style: styles.row3 },
          React.createElement("input", { type: "number", placeholder: "Price (₹)", value: newProduct.price, onChange: (e) => setNewProduct({...newProduct, price: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "text", placeholder: "Unit", value: newProduct.unit, onChange: (e) => setNewProduct({...newProduct, unit: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Stock", value: newProduct.stock, onChange: (e) => setNewProduct({...newProduct, stock: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: addProduct, style: { ...styles.buttonSuccess, width: "100%" } }, "Add Product")
      )
    ),
    
    // Bulk Upload Modal
    showBulkUploadModal && React.createElement("div", { style: styles.modal, onClick: () => setShowBulkUploadModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", null, "Bulk Upload Products"),
        React.createElement("button", { onClick: downloadBulkTemplate, style: styles.buttonInfo }, "📥 Download Template"),
        React.createElement("input", { type: "file", accept: ".xlsx,.xls,.csv", onChange: handleBulkUpload, style: styles.input })
      )
    ),
    
    // Edit Product Modal
    showEditProductModal && React.createElement("div", { style: styles.modal, onClick: () => setShowEditProductModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", null, "Edit Product"),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "text", placeholder: "Product Name", value: editProduct.name, onChange: (e) => setEditProduct({...editProduct, name: e.target.value}), style: styles.input }),
          React.createElement("select", { value: editProduct.category, onChange: (e) => setEditProduct({...editProduct, category: e.target.value}), style: styles.select },
            React.createElement("option", null, "Cement"), React.createElement("option", null, "Steel"), React.createElement("option", null, "Bricks")
          )
        ),
        React.createElement("div", { style: styles.row3 },
          React.createElement("input", { type: "number", placeholder: "Price (₹)", value: editProduct.price, onChange: (e) => setEditProduct({...editProduct, price: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "text", placeholder: "Unit", value: editProduct.unit, onChange: (e) => setEditProduct({...editProduct, unit: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Stock", value: editProduct.stock, onChange: (e) => setEditProduct({...editProduct, stock: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: updateProduct, style: { ...styles.buttonSuccess, width: "100%" } }, "Update Product")
      )
    ),
    
    // Offer Modal
    showOfferModal && React.createElement("div", { style: styles.modal, onClick: () => setShowOfferModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", null, "Create Special Offer"),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Offer Name *"),
          React.createElement("input", { type: "text", placeholder: "e.g., Stock Clearance", value: newOffer.offerName, onChange: (e) => setNewOffer({...newOffer, offerName: e.target.value}), style: styles.input })
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Discount (%) *"),
          React.createElement("input", { type: "number", placeholder: "e.g., 10", value: newOffer.discount, onChange: (e) => setNewOffer({...newOffer, discount: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: addOffer, style: { ...styles.buttonSuccess, width: "100%" } }, "Publish Offer")
      )
    )
  );
}
