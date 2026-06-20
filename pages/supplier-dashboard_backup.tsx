import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function SupplierDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shopPhoto, setShopPhoto] = useState(null);
  const [businessCard, setBusinessCard] = useState(null);
  
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", unit: "kg", price: "", stock: "", minOrder: "", description: ""
  });
  
  const [editProduct, setEditProduct] = useState({
    id: "", name: "", category: "", unit: "", price: "", stock: "", minOrder: "", description: ""
  });
  
  const [newOffer, setNewOffer] = useState({
    productId: "", discount: "", validFrom: "", validTo: "", bulkQty: ""
  });
  const [quoteResponse, setQuoteResponse] = useState({ price: "", deliveryDate: "", notes: "" });

  const [supplierInfo, setSupplierInfo] = useState({
    shopName: "Sharma Building Materials",
    ownerName: "Rajesh Sharma",
    shopPhotoUrl: null,
    businessCardUrl: null,
    gstNo: "27AAACS1234A1Z",
    address: "123, Construction Market, Andheri East, Mumbai - 400069",
    phone: "+919876543210",
    email: "sharma@buildtrack.com",
    since: "2015",
    rating: 4.6,
    totalOrdersCompleted: 342,
    totalRevenue: 12500000,
    activeOffers: 3,
    totalProducts: 3
  });

  const [products, setProducts] = useState([
    { id: 1, name: "UltraTech Cement", category: "Cement", unit: "bag", price: 380, stock: 5000, minOrder: 100, rating: 4.5, soldCount: 12500, status: "Active" },
    { id: 2, name: "TMT Steel Fe500", category: "Steel", unit: "kg", price: 62, stock: 25000, minOrder: 1000, rating: 4.8, soldCount: 87500, status: "Active" },
    { id: 3, name: "Konark Bricks", category: "Bricks", unit: "piece", price: 9, stock: 50000, minOrder: 5000, rating: 4.2, soldCount: 250000, status: "Active" }
  ]);

  const [offers, setOffers] = useState([
    { id: 1, productId: 1, productName: "UltraTech Cement", discount: 10, validFrom: "2024-01-01", validTo: "2024-12-31", bulkQty: 500, bulkPrice: 342, status: "Active", ordersReceived: 45 },
    { id: 2, productId: 2, productName: "TMT Steel Fe500", discount: 8, validFrom: "2024-02-01", validTo: "2024-08-31", bulkQty: 5000, bulkPrice: 57, status: "Active", ordersReceived: 28 }
  ]);

  const [orders, setOrders] = useState([
    { id: 1, productId: 1, productName: "UltraTech Cement", buyerName: "Sharma Construction", quantity: 500, unit: "bags", totalAmount: 190000, status: "Delivered", orderDate: "2024-06-10", deliveryDate: "2024-06-20", location: "Mumbai" },
    { id: 2, productId: 1, productName: "UltraTech Cement", buyerName: "Sunrise Builders", quantity: 1000, unit: "bags", totalAmount: 380000, status: "Shipped", orderDate: "2024-06-15", deliveryDate: "2024-06-25", location: "Pune" },
    { id: 3, productId: 2, productName: "TMT Steel Fe500", buyerName: "Patel Construction", quantity: 5000, unit: "kg", totalAmount: 310000, status: "Processing", orderDate: "2024-06-18", deliveryDate: "2024-06-28", location: "Nashik" }
  ]);

  const [quoteRequests, setQuoteRequests] = useState([
    { id: 1, productName: "Ready Mix Concrete", quantity: 200, unit: "cubic meter", buyerName: "Sunrise Constructions", location: "Pune", requiredBy: "2024-07-01", status: "Pending", message: "Need best price for bulk order" }
  ]);

  const styles = {
    container: { padding: "20px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#1a5f7a", color: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
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
    businessCard: { border: "1px solid #ddd", borderRadius: "12px", padding: "16px", backgroundColor: "#f8f9fa", marginTop: "12px" },
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

  const handleShopPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setShopPhoto(url);
      setSupplierInfo({ ...supplierInfo, shopPhotoUrl: url });
    }
  };

  const handleBusinessCardUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBusinessCard(url);
      setSupplierInfo({ ...supplierInfo, businessCardUrl: url });
    }
  };

  const downloadBulkTemplate = () => {
    const templateData = [
      ["Product Name", "Category", "Unit", "Price", "Stock", "Min Order", "Description"],
      ["UltraTech Cement", "Cement", "bag", "380", "5000", "100", "Best quality cement"],
      ["TMT Steel Fe500", "Steel", "kg", "62", "25000", "1000", "High strength steel"],
      ["Konark Bricks", "Bricks", "piece", "9", "50000", "5000", "Premium bricks"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProductTemplate");
    XLSX.writeFile(wb, "product_bulk_upload_template.xlsx");
    alert("Template downloaded!");
  };

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
        
        const newProducts = [];
        let startId = products.length;
        
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const productName = row["Product Name"] || row["ProductName"] || row["name"];
          
          if (productName) {
            newProducts.push({
              id: startId + i + 1,
              name: String(productName),
              category: row["Category"] || row["category"] || "Others",
              unit: row["Unit"] || row["unit"] || "piece",
              price: Number(row["Price"] || row["price"]) || 0,
              stock: Number(row["Stock"] || row["stock"]) || 0,
              minOrder: Number(row["Min Order"] || row["minOrder"]) || 1,
              description: row["Description"] || row["description"] || "",
              rating: 0,
              soldCount: 0,
              status: "Active"
            });
          }
        }
        
        if (newProducts.length > 0) {
          const updatedProducts = [...products, ...newProducts];
          setProducts(updatedProducts);
          setSupplierInfo({ ...supplierInfo, totalProducts: updatedProducts.length });
          alert(`✅ ${newProducts.length} products uploaded! Total: ${updatedProducts.length}`);
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

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please fill product name and price");
      return;
    }
    const product = {
      id: products.length + 1,
      ...newProduct,
      stock: parseInt(newProduct.stock) || 0,
      price: parseFloat(newProduct.price),
      rating: 0,
      soldCount: 0,
      status: "Active"
    };
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    setSupplierInfo({ ...supplierInfo, totalProducts: updatedProducts.length });
    setNewProduct({ name: "", category: "", unit: "kg", price: "", stock: "", minOrder: "", description: "" });
    setShowProductModal(false);
    alert(`✅ Product added! Total: ${updatedProducts.length}`);
  };

  // Edit Product Function
  const openEditModal = (product) => {
    setEditProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      unit: product.unit,
      price: product.price,
      stock: product.stock,
      minOrder: product.minOrder,
      description: product.description || ""
    });
    setShowEditProductModal(true);
  };

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
    setShowEditProductModal(false);
    alert(`✅ Product "${editProduct.name}" updated successfully!`);
  };

  const deleteProduct = (productId, productName) => {
    if(window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      setSupplierInfo({ ...supplierInfo, totalProducts: updatedProducts.length });
      alert(`✅ Product "${productName}" deleted!`);
    }
  };

  const addOffer = () => {
    if (!newOffer.productId || !newOffer.discount) {
      alert("Please select product and enter discount");
      return;
    }
    const product = products.find(p => p.id === parseInt(newOffer.productId));
    const bulkPrice = product ? product.price * (1 - parseFloat(newOffer.discount) / 100) : 0;
    const offer = {
      id: offers.length + 1,
      ...newOffer,
      productId: parseInt(newOffer.productId),
      productName: product?.name,
      discount: parseFloat(newOffer.discount),
      bulkPrice: bulkPrice,
      status: "Active",
      ordersReceived: 0
    };
    setOffers([...offers, offer]);
    setSupplierInfo({ ...supplierInfo, activeOffers: supplierInfo.activeOffers + 1 });
    setNewOffer({ productId: "", discount: "", validFrom: "", validTo: "", bulkQty: "" });
    setShowOfferModal(false);
    alert("Offer published!");
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: status } : o));
    if (status === "Delivered") {
      setSupplierInfo({ ...supplierInfo, totalOrdersCompleted: supplierInfo.totalOrdersCompleted + 1 });
    }
    alert(`Order ${status} updated`);
  };

  const submitQuote = () => {
    if (!quoteResponse.price) {
      alert("Please enter your price quote");
      return;
    }
    setQuoteRequests(quoteRequests.map(q => 
      q.id === selectedQuoteRequest?.id ? { 
        ...q, 
        status: "Quoted", 
        quotedPrice: quoteResponse.price, 
        deliveryDate: quoteResponse.deliveryDate,
        notes: quoteResponse.notes 
      } : q
    ));
    setShowQuoteModal(false);
    setQuoteResponse({ price: "", deliveryDate: "", notes: "" });
    alert("Quote sent to buyer!");
  };

  const sendMessageToBuyer = (buyerName, productName) => {
    const phone = "919876543210";
    const message = `Hello ${buyerName},%0A%0AThank you for your interest in ${productName}.%0A%0APlease contact us.%0A%0ARegards,%0A${supplierInfo.shopName}`;
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    const message = `🏭 ${supplierInfo.shopName}%0A📊 Revenue: ₹${(supplierInfo.totalRevenue/100000).toFixed(2)}L%0A📦 Products: ${supplierInfo.totalProducts}%0A🛒 Orders: ${supplierInfo.totalOrdersCompleted}`;
    window.open(`https://wa.me/919876543210?text=${message}`, "_blank");
  };

  const generateReport = () => {
    let data = [];
    if (activeTab === "products") {
      data = products.map(p => ({
        Product: p.name, Category: p.category, Price: p.price, Stock: p.stock, Unit: p.unit
      }));
    } else if (activeTab === "orders") {
      data = orders.map(o => ({
        OrderId: o.id, Product: o.productName, Buyer: o.buyerName, Quantity: o.quantity, Amount: o.totalAmount, Status: o.status
      }));
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab);
    XLSX.writeFile(wb, `${activeTab}_report_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert("Report downloaded!");
  };

  const removeCorruptedProducts = () => {
    const cleanProducts = products.filter(p => p && p.name && typeof p.name === 'string' && p.name.length < 50 && !p.name.includes('�') && p.price > 0);
    const removed = products.length - cleanProducts.length;
    setProducts(cleanProducts);
    setSupplierInfo({ ...supplierInfo, totalProducts: cleanProducts.length });
    alert(`Removed ${removed} corrupted entries. ${cleanProducts.length} valid products.`);
  };

  const resetToDefaultProducts = () => {
    if(window.confirm("Reset to default 3 products?")) {
      setProducts([
        { id: 1, name: "UltraTech Cement", category: "Cement", unit: "bag", price: 380, stock: 5000, minOrder: 100, rating: 4.5, soldCount: 12500, status: "Active" },
        { id: 2, name: "TMT Steel Fe500", category: "Steel", unit: "kg", price: 62, stock: 25000, minOrder: 1000, rating: 4.8, soldCount: 87500, status: "Active" },
        { id: 3, name: "Konark Bricks", category: "Bricks", unit: "piece", price: 9, stock: 50000, minOrder: 5000, rating: 4.2, soldCount: 250000, status: "Active" }
      ]);
      setSupplierInfo({ ...supplierInfo, totalProducts: 3 });
      alert("Products reset to default!");
    }
  };

  const completedOrders = orders.filter(o => o.status === "Delivered").length;
  const pendingOrders = orders.filter(o => o.status !== "Delivered").length;

  const renderOverview = () => (
    <div>
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={styles.shopPhotoContainer}>
            {supplierInfo.shopPhotoUrl ? <img src={supplierInfo.shopPhotoUrl} alt="Shop" style={styles.shopPhoto} /> : <div style={{ textAlign: "center", fontSize: "40px" }}>🏪</div>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={styles.businessCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ margin: "0 0 8px 0", color: "#1a5f7a" }}>{supplierInfo.shopName}</h2>
                  <p style={{ margin: "4px 0" }}>👤 Owner: {supplierInfo.ownerName}</p>
                  <p style={{ margin: "4px 0" }}>📞 {supplierInfo.phone}</p>
                  <p style={{ margin: "4px 0" }}>📍 {supplierInfo.address}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>⭐{supplierInfo.rating}</div>
                  {supplierInfo.businessCardUrl ? (
                    <a href={supplierInfo.businessCardUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#1a5f7a" }}>📇 View Card</a>
                  ) : (
                    <label style={{ fontSize: "12px", color: "#1a5f7a", cursor: "pointer" }}>
                      📇 Upload Card
                      <input type="file" accept="image/*" onChange={handleBusinessCardUpload} style={{ display: "none" }} />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div style={{ marginTop: "12px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <label style={{ ...styles.buttonInfo, cursor: "pointer", padding: "6px 12px", fontSize: "12px" }}>
                📸 Upload Shop Photo
                <input type="file" accept="image/*" onChange={handleShopPhotoUpload} style={{ display: "none" }} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.grid4}>
        <div style={{ ...styles.card, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>₹{(supplierInfo.totalRevenue/100000).toFixed(2)}L</div>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total Revenue</div>
        </div>
        <div style={{ ...styles.card, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>{completedOrders}</div>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Orders Completed</div>
        </div>
        <div style={{ ...styles.card, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>{pendingOrders}</div>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Pending Orders</div>
        </div>
        <div style={{ ...styles.card, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>{supplierInfo.activeOffers}</div>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Active Offers</div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>🏷️ Your Active Offers</div>
        {offers.map(o => (
          <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
            <div><strong>{o.productName}</strong><br/>{o.discount}% OFF - Min {o.bulkQty} units</div>
            <div style={{ textAlign: "right" }}>₹{o.bulkPrice}/{o.productName.includes("Cement") ? "bag" : "unit"}<br/>{o.ordersReceived} orders</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <button onClick={() => setShowProductModal(true)} style={styles.button}>+ Add Product</button>
        <button onClick={() => setShowBulkUploadModal(true)} style={styles.buttonInfo}>📂 Bulk Upload</button>
        <button onClick={downloadBulkTemplate} style={styles.buttonWarning}>📥 Download Template</button>
        <button onClick={removeCorruptedProducts} style={styles.buttonDanger}>🗑️ Remove Corrupted</button>
        <button onClick={resetToDefaultProducts} style={styles.buttonWarning}>🔄 Reset</button>
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>📦 Product Catalog ({products.length} products)</div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>#</th><th style={styles.th}>Product</th><th style={styles.th}>Category</th><th style={styles.th}>Price</th><th style={styles.th}>Stock</th><th style={styles.th}>Min Order</th><th style={styles.th}>Actions</th></tr></thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}><strong>{p.name}</strong><br/><span style={{ fontSize: "11px", color: "#666" }}>{p.unit}</span></td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>₹{p.price}/{p.unit}</td>
                  <td style={styles.td}>{p.stock?.toLocaleString()}</td>
                  <td style={styles.td}>{p.minOrder}</td>
                  <td style={styles.td}>
                    <span onClick={() => openEditModal(p)} style={styles.editIcon} title="Edit Product">✏️</span>
                    <span onClick={() => deleteProduct(p.id, p.name)} style={styles.deleteIcon} title="Delete Product">🗑️</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOffers = () => (
    <div>
      <button onClick={() => setShowOfferModal(true)} style={styles.button}>+ Create Offer</button>
      <div style={{ ...styles.card, marginTop: "16px" }}>
        <div style={styles.cardTitle}>🏷️ Your Offers</div>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Product</th><th style={styles.th}>Discount</th><th style={styles.th}>Valid Till</th><th style={styles.th}>Bulk Price</th><th style={styles.th}>Orders</th></tr></thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id}><td style={styles.td}>{o.productName}</td><td style={styles.td}>{o.discount}% OFF</td><td style={styles.td}>{o.validTo}</td><td style={styles.td}>₹{o.bulkPrice}</td><td style={styles.td}>{o.ordersReceived}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>🛒 All Orders</div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Product</th><th style={styles.th}>Buyer</th><th style={styles.th}>Quantity</th><th style={styles.th}>Amount</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td style={styles.td}>{o.productName}</td>
              <td style={styles.td}>{o.buyerName}</td>
              <td style={styles.td}>{o.quantity} {o.unit}</td>
              <td style={styles.td}>₹{o.totalAmount.toLocaleString()}</td>
              <td style={styles.td}>{o.status}</td>
              <td style={styles.td}>
                <select onChange={(e) => updateOrderStatus(o.id, e.target.value)} style={{ padding: "4px", borderRadius: "4px" }}>
                  <option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option>
                </select>
                <button onClick={() => sendMessageToBuyer(o.buyerName, o.productName)} style={{ ...styles.buttonInfo, marginLeft: "8px", padding: "4px 8px", fontSize: "11px" }}>📱 Message</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderQuotes = () => (
    <div style={styles.card}>
      <div style={styles.cardTitle}>💬 Quote Requests</div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Product</th><th style={styles.th}>Quantity</th><th style={styles.th}>Buyer</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th></tr></thead>
        <tbody>
          {quoteRequests.map(q => (
            <tr key={q.id}>
              <td style={styles.td}>{q.productName}</td>
              <td style={styles.td}>{q.quantity} {q.unit}</td>
              <td style={styles.td}>{q.buyerName}</td>
              <td style={styles.td}>{q.status}</td>
              <td style={styles.td}>
                {q.status === "Pending" && <button onClick={() => { setSelectedQuoteRequest(q); setShowQuoteModal(true); }} style={styles.buttonSuccess}>Send Quote</button>}
                <button onClick={() => sendMessageToBuyer(q.buyerName, q.productName)} style={{ ...styles.buttonInfo, marginLeft: "8px", padding: "4px 8px", fontSize: "11px" }}>💬 Chat</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>📊 Order Statistics</div>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#1a5f7a" }}>{orders.length}</div>
            <div>Total Orders</div>
            <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-around" }}>
              <div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>{completedOrders}</div><div>Completed</div></div>
              <div><div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffc107" }}>{pendingOrders}</div><div>Pending</div></div>
            </div>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>📈 Revenue</div>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#1a5f7a" }}>₹{(supplierInfo.totalRevenue/100000).toFixed(2)}L</div>
            <div>Total Revenue</div>
          </div>
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>📈 Top Selling Products</div>
        {products.slice(0, 5).map((p, idx) => (
          <div key={p.id} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>#{idx + 1} {p.name}</span><span>{p.soldCount?.toLocaleString()} sold</span></div>
            <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${(p.soldCount / (products[0]?.soldCount || 1)) * 100}%` }}></div></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case "overview": return renderOverview();
      case "products": return renderProducts();
      case "offers": return renderOffers();
      case "orders": return renderOrders();
      case "quotes": return renderQuotes();
      case "analytics": return renderAnalytics();
      default: return renderOverview();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div><h1 style={styles.headerTitle}>🏭 Supplier Dashboard</h1><p style={styles.headerSub}>Manage products, offers, orders</p></div>
        <div><button onClick={shareOnWhatsApp} style={styles.buttonSuccess}>📱 Share</button><button onClick={generateReport} style={{ ...styles.buttonInfo, marginLeft: "8px" }}>📊 Export</button><button onClick={() => window.location.href = "/"} style={{ ...styles.buttonDanger, marginLeft: "8px" }}>🚪 Logout</button></div>
      </div>

      <div style={styles.tabContainer}>{tabs.map(tab => <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) }}>{tab.icon} {tab.name}</div>)}</div>

      {renderContent()}

      {/* Add Product Modal */}
      {showProductModal && <div style={styles.modal} onClick={() => setShowProductModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: "#1a5f7a" }}>Add New Product</h2>
        <div style={styles.row2}><input type="text" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={styles.input} /><select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={styles.select}><option>Cement</option><option>Steel</option><option>Bricks</option><option>Sand</option><option>Aggregate</option><option>Others</option></select></div>
        <div style={styles.row3}><input type="number" placeholder="Price (₹)" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} style={styles.input} /><input type="text" placeholder="Unit" value={newProduct.unit} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} style={styles.input} /><input type="number" placeholder="Stock" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} style={styles.input} /></div>
        <div style={styles.row2}><input type="number" placeholder="Min Order" value={newProduct.minOrder} onChange={(e) => setNewProduct({...newProduct, minOrder: e.target.value})} style={styles.input} /></div>
        <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} style={{ ...styles.input, minHeight: "60px" }} />
        <button onClick={addProduct} style={{ ...styles.buttonSuccess, width: "100%" }}>Add to Marketplace</button>
      </div></div>}

      {/* Edit Product Modal */}
      {showEditProductModal && <div style={styles.modal} onClick={() => setShowEditProductModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: "#1a5f7a" }}>Edit Product</h2>
        <div style={styles.row2}><input type="text" placeholder="Product Name" value={editProduct.name} onChange={(e) => setEditProduct({...editProduct, name: e.target.value})} style={styles.input} /><select value={editProduct.category} onChange={(e) => setEditProduct({...editProduct, category: e.target.value})} style={styles.select}><option>Cement</option><option>Steel</option><option>Bricks</option><option>Sand</option><option>Aggregate</option><option>Others</option></select></div>
        <div style={styles.row3}><input type="number" placeholder="Price (₹)" value={editProduct.price} onChange={(e) => setEditProduct({...editProduct, price: e.target.value})} style={styles.input} /><input type="text" placeholder="Unit" value={editProduct.unit} onChange={(e) => setEditProduct({...editProduct, unit: e.target.value})} style={styles.input} /><input type="number" placeholder="Stock" value={editProduct.stock} onChange={(e) => setEditProduct({...editProduct, stock: e.target.value})} style={styles.input} /></div>
        <div style={styles.row2}><input type="number" placeholder="Min Order" value={editProduct.minOrder} onChange={(e) => setEditProduct({...editProduct, minOrder: e.target.value})} style={styles.input} /></div>
        <textarea placeholder="Description" value={editProduct.description} onChange={(e) => setEditProduct({...editProduct, description: e.target.value})} style={{ ...styles.input, minHeight: "60px" }} />
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}><button onClick={updateProduct} style={{ ...styles.buttonSuccess, flex: 1 }}>Save Changes</button><button onClick={() => setShowEditProductModal(false)} style={{ ...styles.buttonDanger, flex: 1 }}>Cancel</button></div>
      </div></div>}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && <div style={styles.modal} onClick={() => setShowBulkUploadModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: "#1a5f7a" }}>Bulk Upload Products</h2>
        <button onClick={downloadBulkTemplate} style={{ ...styles.buttonInfo, marginBottom: "16px" }}>📥 Download Template</button>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} style={styles.input} />
        <button onClick={() => setShowBulkUploadModal(false)} style={{ ...styles.buttonDanger, width: "100%", marginTop: "16px" }}>Cancel</button>
      </div></div>}

      {/* Add Offer Modal */}
      {showOfferModal && <div style={styles.modal} onClick={() => setShowOfferModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: "#1a5f7a" }}>Create Offer</h2>
        <select value={newOffer.productId} onChange={(e) => setNewOffer({...newOffer, productId: e.target.value})} style={styles.select}><option value="">Select Product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}</select>
        <div style={styles.row2}><input type="number" placeholder="Discount %" value={newOffer.discount} onChange={(e) => setNewOffer({...newOffer, discount: e.target.value})} style={styles.input} /><input type="number" placeholder="Bulk Qty" value={newOffer.bulkQty} onChange={(e) => setNewOffer({...newOffer, bulkQty: e.target.value})} style={styles.input} /></div>
        <div style={styles.row2}><input type="date" placeholder="Valid From" value={newOffer.validFrom} onChange={(e) => setNewOffer({...newOffer, validFrom: e.target.value})} style={styles.input} /><input type="date" placeholder="Valid To" value={newOffer.validTo} onChange={(e) => setNewOffer({...newOffer, validTo: e.target.value})} style={styles.input} /></div>
        <button onClick={addOffer} style={{ ...styles.buttonSuccess, width: "100%" }}>Publish Offer</button>
      </div></div>}

      {/* Quote Modal */}
      {showQuoteModal && selectedQuoteRequest && <div style={styles.modal} onClick={() => setShowQuoteModal(false)}><div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: "#1a5f7a" }}>Send Quote to {selectedQuoteRequest.buyerName}</h2>
        <p><strong>Product:</strong> {selectedQuoteRequest.productName} | <strong>Qty:</strong> {selectedQuoteRequest.quantity} {selectedQuoteRequest.unit}</p>
        <input type="number" placeholder="Your Price (₹)" value={quoteResponse.price} onChange={(e) => setQuoteResponse({...quoteResponse, price: e.target.value})} style={styles.input} />
        <input type="date" placeholder="Delivery Date" value={quoteResponse.deliveryDate} onChange={(e) => setQuoteResponse({...quoteResponse, deliveryDate: e.target.value})} style={styles.input} />
        <textarea placeholder="Notes" value={quoteResponse.notes} onChange={(e) => setQuoteResponse({...quoteResponse, notes: e.target.value})} style={{ ...styles.input, minHeight: "60px" }} />
        <button onClick={submitQuote} style={{ ...styles.buttonSuccess, width: "100%" }}>Send Quote</button>
      </div></div>}
    </div>
  );
}
