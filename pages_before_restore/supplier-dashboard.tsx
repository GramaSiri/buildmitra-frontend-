import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function SupplierDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteMsg, setQuoteMsg] = useState("");
  const [bulkData, setBulkData] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Cement", price: 0, stock: 0, unit: "bag", minOrder: 0, discount: 0, offer: "" });
  const [newOffer, setNewOffer] = useState({ title: "", discount: 0, validUntil: "" });

  const [products, setProducts] = useState([
    { id: 1, name: "UltraTech Cement", category: "Cement", price: 380, stock: 5000, unit: "bag", minOrder: 100, sold: 2500, discount: 0, offer: "", status: "Active" },
    { id: 2, name: "TMT Steel Bars", category: "Steel", price: 65, stock: 10000, unit: "kg", minOrder: 500, sold: 4500, discount: 0, offer: "Buy 1000kg Get 50kg Free", status: "Active" },
    { id: 3, name: "Ceramic Tiles", category: "Tiles", price: 45, stock: 8000, unit: "sqft", minOrder: 200, sold: 3200, discount: 10, offer: "", status: "Active" },
    { id: 4, name: "Asian Paint", category: "Paint", price: 280, stock: 2000, unit: "liter", minOrder: 20, sold: 850, discount: 5, offer: "", status: "Active" }
  ]);

  const [orders, setOrders] = useState([
    { id: 1001, buyer: "Rajesh Sharma", mobile: "+919876511111", material: "UltraTech Cement", quantity: 500, unit: "bag", total: 190000, orderDate: "2024-01-15", deliveryDate: "2024-01-20", status: "Delivered", paymentStatus: "Paid" },
    { id: 1002, buyer: "Priya Constructions", mobile: "+919876522222", material: "TMT Steel Bars", quantity: 2000, unit: "kg", total: 130000, orderDate: "2024-01-18", deliveryDate: "2024-01-25", status: "Dispatched", paymentStatus: "Partial" }
  ]);

  const [enquiries, setEnquiries] = useState([
    { id: 1, buyer: "Ramesh Gupta", mobile: "+919876544444", material: "UltraTech Cement", quantity: 1000, unit: "bag", message: "Need urgent delivery for Andheri project", date: "2024-01-22", status: "Pending" },
    { id: 2, buyer: "Suresh Patel", mobile: "+919876555555", material: "TMT Steel Bars", quantity: 5000, unit: "kg", message: "Bulk discount for commercial project?", date: "2024-01-23", status: "Pending" }
  ]);

  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([
    { id: "INV-001", buyer: "Rajesh Sharma", amount: 190000, date: "2024-01-21", dueDate: "2024-02-05", status: "Paid" }
  ]);
  const [offers, setOffers] = useState([
    { id: 1, title: "Summer Sale", discount: 10, validUntil: "2024-03-31", applicableOn: "All" },
    { id: 2, title: "Bulk Purchase", discount: 5, validUntil: "2024-04-15", applicableOn: "Steel" }
  ]);

  const handleLogout = () => {
    if (confirm("Logout?")) window.location.href = "/";
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) return alert("Fill product details");
    setProducts([...products, { ...newProduct, id: products.length + 1, sold: 0, status: "Active" }]);
    setNewProduct({ name: "", category: "Cement", price: 0, stock: 0, unit: "bag", minOrder: 0, discount: 0, offer: "" });
    setShowProductModal(false);
    alert("Product added!");
  };

  const updateStock = (id, newStock) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: parseFloat(newStock) } : p));
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setBulkData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const importBulkProducts = () => {
    const newProducts = bulkData.map((item, idx) => ({
      id: products.length + idx + 1,
      name: item.name || item.Product,
      category: item.category || "Other",
      price: parseFloat(item.price || 0),
      stock: parseFloat(item.stock || 0),
      unit: item.unit || "piece",
      minOrder: parseFloat(item.minOrder || 0),
      discount: item.discount || 0,
      offer: item.offer || "",
      sold: 0,
      status: "Active"
    }));
    setProducts([...products, ...newProducts]);
    setBulkData([]);
    setShowBulkModal(false);
    alert(`${newProducts.length} products imported!`);
  };

  const updateOrderStatus = (id, status) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    alert(`Order status updated to ${status}`);
  };

  const generateInvoice = (order) => {
    const newInvoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      buyer: order.buyer,
      amount: order.total,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Pending"
    };
    setInvoices([...invoices, newInvoice]);
    alert(`Invoice ${newInvoice.id} generated!`);
  };

  const sendQuote = () => {
    if (!selectedEnquiry || !quotePrice) return alert("Enter price");
    const total = quotePrice * selectedEnquiry.quantity;
    const gst = total * 0.18;
    const grandTotal = total + gst;
    const message = `*QUOTATION*%0A%0AMaterial: ${selectedEnquiry.material}%0AQuantity: ${selectedEnquiry.quantity} ${selectedEnquiry.unit}%0APrice: ₹${quotePrice} per ${selectedEnquiry.unit}%0ASubtotal: ₹${total}%0AGST 18%: ₹${gst}%0ATotal: ₹${grandTotal}%0A%0A${quoteMsg || "Please confirm"}`;
    window.open(`https://wa.me/${selectedEnquiry.mobile}?text=${message}`, "_blank");
    setQuotations([...quotations, { id: quotations.length + 1, buyer: selectedEnquiry.buyer, material: selectedEnquiry.material, quantity: selectedEnquiry.quantity, price: quotePrice, total: total, date: new Date().toISOString().split("T")[0] }]);
    setEnquiries(enquiries.map(e => e.id === selectedEnquiry.id ? { ...e, status: "Replied" } : e));
    setShowEnquiryModal(false);
    setQuotePrice("");
    setQuoteMsg("");
    alert("Quote sent!");
  };

  const shareCatalog = () => {
    const list = products.map(p => `${p.name}: ₹${p.price}/${p.unit}`).join("%0A");
    window.open(`https://wa.me/?text=${list}`, "_blank");
  };

  const addOffer = () => {
    if (!newOffer.title) return alert("Enter title");
    setOffers([...offers, { ...newOffer, id: offers.length + 1 }]);
    setNewOffer({ title: "", discount: 0, validUntil: "" });
    setShowOfferModal(false);
    alert("Offer added!");
  };

  const exportOrders = () => {
    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `orders_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert("Orders exported!");
  };

  const exportProducts = () => {
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, `products_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert("Products exported!");
  };

  const totalRevenue = orders.filter(o => o.paymentStatus === "Paid").reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status !== "Delivered").length;
  const pendingEnquiries = enquiries.filter(e => e.status === "Pending").length;
  const lowStockCount = products.filter(p => p.stock < 1000).length;

  const styles = {
    container: { padding: "16px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#800020", color: "white", padding: "16px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
    headerSub: { margin: "5px 0 0", fontSize: "12px", opacity: 0.9 },
    grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "20px" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" },
    grid5: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "16px", marginBottom: "20px" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "16px", marginBottom: "16px" },
    cardTitle: { fontSize: "16px", fontWeight: "bold", marginBottom: "12px", borderBottom: "2px solid #800020", paddingBottom: "8px" },
    button: { backgroundColor: "#800020", color: "white", padding: "10px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
    buttonSuccess: { backgroundColor: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonInfo: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonWarning: { backgroundColor: "#ffc107", color: "#333", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "12px", fontSize: "12px" },
    th: { textAlign: "left", padding: "8px", borderBottom: "1px solid #eee" },
    td: { padding: "8px", borderBottom: "1px solid #eee" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "550px", maxHeight: "80vh", overflow: "auto" },
    tabContainer: { display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #eee", flexWrap: "wrap" },
    tab: { padding: "8px 16px", cursor: "pointer", borderBottom: "2px solid transparent" },
    activeTab: { borderBottomColor: "#800020", color: "#800020", fontWeight: "bold" },
    input: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "12px" },
    select: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    textarea: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", minHeight: "80px", marginBottom: "12px" },
    row2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "16px" },
    statValue: { fontSize: "24px", fontWeight: "bold", color: "#800020" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" }
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard" },
    { id: "catalog", name: "Product Catalog" },
    { id: "orders", name: "Orders" },
    { id: "enquiries", name: "Enquiries" },
    { id: "quotations", name: "Quotations" },
    { id: "invoices", name: "Invoices" },
    { id: "offers", name: "Offers" },
    { id: "reports", name: "Reports" }
  ];

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "Supplier Dashboard"),
        React.createElement("p", { style: styles.headerSub }, "Manage Products, Orders & WhatsApp Enquiries")
      ),
      React.createElement("div", { style: { display: "flex", gap: "10px" } },
        React.createElement("button", { onClick: shareCatalog, style: { ...styles.buttonSuccess } }, "Share Catalog"),
        React.createElement("button", { onClick: () => navigateTo("/marketplace"), style: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Marketplace"),
        React.createElement("button", { onClick: handleLogout, style: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Logout")
      )
    ),

    React.createElement("div", { style: styles.grid5 },
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, products.length), React.createElement("div", { style: styles.statLabel }, "Products")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, orders.length), React.createElement("div", { style: styles.statLabel }, "Orders")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, pendingOrders), React.createElement("div", { style: styles.statLabel }, "Pending")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, pendingEnquiries), React.createElement("div", { style: styles.statLabel }, "Enquiries")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, "₹", (totalRevenue/100000).toFixed(1), "L"), React.createElement("div", { style: styles.statLabel }, "Revenue"))
    ),

    React.createElement("div", { style: styles.tabContainer },
      tabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.name))
    ),

    activeTab === "dashboard" && React.createElement("div", null,
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Recent Orders"),
          orders.slice(0, 3).map(o => React.createElement("div", { key: o.id, style: { padding: "8px 0", borderBottom: "1px solid #eee" } },
            React.createElement("strong", null, o.buyer), " - ", o.material, " (", o.quantity, " ", o.unit, ")" ))
        ),
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Pending Enquiries"),
          enquiries.filter(e => e.status === "Pending").slice(0, 3).map(e => React.createElement("div", { key: e.id, style: { padding: "8px 0", borderBottom: "1px solid #eee" } },
            React.createElement("strong", null, e.buyer), " wants ", e.material, " (", e.quantity, " ", e.unit, ")" ))
        )
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Low Stock Alert"),
        React.createElement("div", { style: styles.grid3 },
          products.filter(p => p.stock < 1000).map(p => React.createElement("div", { key: p.id, style: { padding: "8px", backgroundColor: "#fff3cd", borderRadius: "8px" } },
            React.createElement("strong", null, p.name), React.createElement("br", null), "Stock: ", p.stock, " ", p.unit
          ))
        )
      )
    ),

    activeTab === "catalog" && React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: () => setShowProductModal(true), style: styles.button }, "+ Add Product"),
        React.createElement("button", { onClick: () => setShowBulkModal(true), style: { ...styles.buttonInfo } }, " Bulk Upload"),
        React.createElement("button", { onClick: exportProducts, style: { ...styles.buttonInfo } }, " Export Products")
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Product Catalog (", products.length, ")"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Product"), React.createElement("th", { style: styles.th }, "Category"),
                React.createElement("th", { style: styles.th }, "Price"), React.createElement("th", { style: styles.th }, "Stock"),
                React.createElement("th", { style: styles.th }, "Min Order"), React.createElement("th", { style: styles.th }, "Offer"), React.createElement("th", { style: styles.th }, "Status")
              )
            ),
            React.createElement("tbody", null,
              products.map(p => React.createElement("tr", { key: p.id },
                React.createElement("td", { style: styles.td }, p.name),
                React.createElement("td", { style: styles.td }, p.category),
                React.createElement("td", { style: styles.td }, "₹", p.price, "/", p.unit),
                React.createElement("td", { style: styles.td }, React.createElement("input", { type: "number", value: p.stock, onChange: (e) => updateStock(p.id, e.target.value), style: { width: "80px", padding: "4px" } })),
                React.createElement("td", { style: styles.td }, p.minOrder, " ", p.unit),
                React.createElement("td", { style: styles.td }, p.discount > 0 ? p.discount + "% off" : (p.offer || "-")),
                React.createElement("td", { style: styles.td }, p.status)
              ))
            )
          )
        )
      )
    ),

    activeTab === "orders" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Customer Orders"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "ID"), React.createElement("th", { style: styles.th }, "Buyer"),
              React.createElement("th", { style: styles.th }, "Material"), React.createElement("th", { style: styles.th }, "Quantity"),
              React.createElement("th", { style: styles.th }, "Total"), React.createElement("th", { style: styles.th }, "Status"),
              React.createElement("th", { style: styles.th }, "Payment"), React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            orders.map(o => React.createElement("tr", { key: o.id },
              React.createElement("td", { style: styles.td }, "#", o.id),
              React.createElement("td", { style: styles.td }, o.buyer),
              React.createElement("td", { style: styles.td }, o.material),
              React.createElement("td", { style: styles.td }, o.quantity, " ", o.unit),
              React.createElement("td", { style: styles.td }, "₹", o.total.toLocaleString()),
              React.createElement("td", { style: styles.td },
                React.createElement("select", { value: o.status, onChange: (e) => updateOrderStatus(o.id, e.target.value), style: { padding: "4px", borderRadius: "4px" } },
                  React.createElement("option", null, "Processing"), React.createElement("option", null, "Dispatched"), React.createElement("option", null, "Delivered")
                )
              ),
              React.createElement("td", { style: styles.td }, o.paymentStatus),
              React.createElement("td", { style: styles.td },
                o.status === "Delivered" && !invoices.find(i => i.buyer === o.buyer && i.amount === o.total) && React.createElement("button", { onClick: () => generateInvoice(o), style: styles.buttonInfo }, "Invoice")
              )
            ))
          )
        )
      ),
      React.createElement("button", { onClick: exportOrders, style: { ...styles.buttonInfo, marginTop: "12px" } }, " Export Orders")
    ),

    activeTab === "enquiries" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "WhatsApp Enquiries (", enquiries.length, ")"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Buyer"), React.createElement("th", { style: styles.th }, "Mobile"),
              React.createElement("th", { style: styles.th }, "Material"), React.createElement("th", { style: styles.th }, "Quantity"),
              React.createElement("th", { style: styles.th }, "Message"), React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            enquiries.map(e => React.createElement("tr", { key: e.id },
              React.createElement("td", { style: styles.td }, e.buyer),
              React.createElement("td", { style: styles.td }, React.createElement("a", { href: `https://wa.me/${e.mobile}`, target: "_blank", style: { color: "#25D366" } }, "📞 ", e.mobile)),
              React.createElement("td", { style: styles.td }, e.material),
              React.createElement("td", { style: styles.td }, e.quantity, " ", e.unit),
              React.createElement("td", { style: styles.td }, e.message.substring(0, 30), "..."),
              React.createElement("td", { style: styles.td }, e.status),
              React.createElement("td", { style: styles.td },
                e.status === "Pending" && React.createElement("button", { onClick: () => { setSelectedEnquiry(e); setShowEnquiryModal(true); }, style: styles.buttonSuccess }, "Send Quote")
              )
            ))
          )
        )
      )
    ),

    activeTab === "quotations" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Quotations Sent"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Buyer"), React.createElement("th", { style: styles.th }, "Material"),
              React.createElement("th", { style: styles.th }, "Quantity"), React.createElement("th", { style: styles.th }, "Price"),
              React.createElement("th", { style: styles.th }, "Total"), React.createElement("th", { style: styles.th }, "Date"), React.createElement("th", { style: styles.th }, "Status")
            )
          ),
          React.createElement("tbody", null,
            quotations.map(q => React.createElement("tr", { key: q.id },
              React.createElement("td", { style: styles.td }, q.buyer),
              React.createElement("td", { style: styles.td }, q.material),
              React.createElement("td", { style: styles.td }, q.quantity, " units"),
              React.createElement("td", { style: styles.td }, "₹", q.price),
              React.createElement("td", { style: styles.td }, "₹", q.total.toLocaleString()),
              React.createElement("td", { style: styles.td }, q.date),
              React.createElement("td", { style: styles.td }, q.status)
            ))
          )
        )
      )
    ),

    activeTab === "invoices" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Invoices"),
      React.createElement("div", { style: { overflowX: "auto" } },
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Invoice No"), React.createElement("th", { style: styles.th }, "Buyer"),
              React.createElement("th", { style: styles.th }, "Amount"), React.createElement("th", { style: styles.th }, "Date"),
              React.createElement("th", { style: styles.th }, "Due Date"), React.createElement("th", { style: styles.th }, "Status")
            )
          ),
          React.createElement("tbody", null,
            invoices.map(i => React.createElement("tr", { key: i.id },
              React.createElement("td", { style: styles.td }, i.id),
              React.createElement("td", { style: styles.td }, i.buyer),
              React.createElement("td", { style: styles.td }, "₹", i.amount.toLocaleString()),
              React.createElement("td", { style: styles.td }, i.date),
              React.createElement("td", { style: styles.td }, i.dueDate),
              React.createElement("td", { style: styles.td }, React.createElement("span", { style: { backgroundColor: i.status === "Paid" ? "#d4edda" : "#f8d7da", padding: "4px 8px", borderRadius: "4px" } }, i.status))
            ))
          )
        )
      )
    ),

    activeTab === "offers" && React.createElement("div", null,
      React.createElement("button", { onClick: () => setShowOfferModal(true), style: styles.button }, "+ Create Offer"),
      React.createElement("div", { style: styles.grid3, marginTop: "16px" },
        offers.map(o => React.createElement("div", { key: o.id, style: styles.card },
          React.createElement("h4", { style: { color: "#800020", margin: "0 0 8px 0" } }, o.title),
          React.createElement("p", { style: { fontSize: "24px", fontWeight: "bold", color: "#ff4757" } }, o.discount, "% OFF"),
          React.createElement("p", null, "Valid until: ", o.validUntil)
        ))
      )
    ),

    activeTab === "reports" && React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "Export Reports"),
      React.createElement("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: exportOrders, style: styles.buttonInfo }, " Orders Report"),
        React.createElement("button", { onClick: exportProducts, style: styles.buttonInfo }, " Products Report"),
        React.createElement("button", { onClick: shareCatalog, style: styles.buttonSuccess }, " Share Catalog")
      )
    ),

    showProductModal && React.createElement("div", { style: styles.modal, onClick: () => setShowProductModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Product"),
        React.createElement("input", { placeholder: "Product Name", value: newProduct.name, onChange: (e) => setNewProduct({...newProduct, name: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row2 },
          React.createElement("select", { value: newProduct.category, onChange: (e) => setNewProduct({...newProduct, category: e.target.value}), style: styles.select },
            React.createElement("option", null, "Cement"), React.createElement("option", null, "Steel"), React.createElement("option", null, "Tiles"), React.createElement("option", null, "Paint")
          ),
          React.createElement("input", { placeholder: "Unit (bag/kg/liter)", value: newProduct.unit, onChange: (e) => setNewProduct({...newProduct, unit: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Price", value: newProduct.price, onChange: (e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Stock", value: newProduct.stock, onChange: (e) => setNewProduct({...newProduct, stock: parseFloat(e.target.value)}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Min Order", value: newProduct.minOrder, onChange: (e) => setNewProduct({...newProduct, minOrder: parseFloat(e.target.value)}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Discount %", value: newProduct.discount, onChange: (e) => setNewProduct({...newProduct, discount: parseFloat(e.target.value)}), style: styles.input })
        ),
        React.createElement("input", { placeholder: "Special Offer", value: newProduct.offer, onChange: (e) => setNewProduct({...newProduct, offer: e.target.value}), style: styles.input }),
        React.createElement("button", { onClick: addProduct, style: styles.buttonSuccess }, "Add Product")
      )
    ),

    showBulkModal && React.createElement("div", { style: styles.modal, onClick: () => setShowBulkModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Bulk Upload Products"),
        React.createElement("p", { style: { fontSize: "12px", color: "#666" } }, "Upload Excel with columns: Name, Category, Price, Stock, Unit, MinOrder"),
        React.createElement("input", { type: "file", accept: ".xlsx,.xls", onChange: handleBulkUpload, style: styles.input }),
        bulkData.length > 0 && React.createElement("button", { onClick: importBulkProducts, style: styles.buttonSuccess }, "Import ", bulkData.length, " Products")
      )
    ),

    showEnquiryModal && selectedEnquiry && React.createElement("div", { style: styles.modal, onClick: () => setShowEnquiryModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Send WhatsApp Quote"),
        React.createElement("p", null, React.createElement("strong", null, "Buyer:"), " ", selectedEnquiry.buyer),
        React.createElement("p", null, React.createElement("strong", null, "Request:"), " ", selectedEnquiry.quantity, " ", selectedEnquiry.unit, " of ", selectedEnquiry.material),
        React.createElement("input", { type: "number", placeholder: "Price per unit", value: quotePrice, onChange: (e) => setQuotePrice(e.target.value), style: styles.input }),
        React.createElement("textarea", { placeholder: "Additional message", value: quoteMsg, onChange: (e) => setQuoteMsg(e.target.value), style: styles.textarea, rows: 3 }),
        React.createElement("button", { onClick: sendQuote, style: styles.buttonSuccess }, "Send Quote")
      )
    ),

    showOfferModal && React.createElement("div", { style: styles.modal, onClick: () => setShowOfferModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Create Offer"),
        React.createElement("input", { placeholder: "Offer Title", value: newOffer.title, onChange: (e) => setNewOffer({...newOffer, title: e.target.value}), style: styles.input }),
        React.createElement("input", { type: "number", placeholder: "Discount %", value: newOffer.discount, onChange: (e) => setNewOffer({...newOffer, discount: parseFloat(e.target.value)}), style: styles.input }),
        React.createElement("input", { type: "date", placeholder: "Valid Until", value: newOffer.validUntil, onChange: (e) => setNewOffer({...newOffer, validUntil: e.target.value}), style: styles.input }),
        React.createElement("button", { onClick: addOffer, style: styles.buttonSuccess }, "Create Offer")
      )
    )
  );
}
