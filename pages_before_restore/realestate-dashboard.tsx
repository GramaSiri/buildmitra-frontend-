import React, { useState } from "react";

export default function RealEstateDashboard() {
  const [activeTab, setActiveTab] = useState("properties");
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [enquiryBuyer, setEnquiryBuyer] = useState({ name: "", mobile: "", email: "", message: "" });

  const categories = [
    "GBA", "BDA", "BMRDA", "Municipal", "Ready to Move-in",
    "Agriculture Land", "Industrial Land", "Farmland", "Revenue Sites"
  ];

  const [properties, setProperties] = useState([
    { 
      id: 1, name: "Sunrise Villa", category: "BDA", type: "Villa", 
      plotLength: 50, plotWidth: 40, totalSqft: 2000, ratePerSft: 22500, totalAmount: 45000000,
      location: "Andheri East", city: "Mumbai", pincode: "400069", 
      bedrooms: 4, bathrooms: 4, furnished: "Fully Furnished",
      description: "Luxury villa with modern amenities",
      images: [], videos: [], documents: [], status: "Available", listedDate: "2024-01-15"
    }
  ]);

  const [newProperty, setNewProperty] = useState({
    name: "", category: "BDA", type: "Apartment",
    plotLength: 0, plotWidth: 0, totalSqft: 0, ratePerSft: 0, totalAmount: 0,
    location: "", city: "", pincode: "",
    bedrooms: 0, bathrooms: 0, furnished: "Semi Furnished",
    description: "", status: "Available",
    images: [], videos: [], documents: []
  });

  const [tempImages, setTempImages] = useState([]);
  const [tempVideos, setTempVideos] = useState([]);
  const [tempDocuments, setTempDocuments] = useState([]);

  const [enquiries, setEnquiries] = useState([
    { id: 1, propertyId: 1, propertyName: "Sunrise Villa", category: "BDA", 
      buyer: "Rajesh Sharma", mobile: "+919876511111", email: "rajesh@example.com", 
      message: "Interested in this property", date: "2024-02-15", status: "Pending" }
  ]);

  const calculateTotals = () => {
    const length = Number(newProperty.plotLength) || 0;
    const width = Number(newProperty.plotWidth) || 0;
    const rate = Number(newProperty.ratePerSft) || 0;
    const sqft = length * width;
    const amount = sqft * rate;
    setNewProperty(prev => ({ ...prev, totalSqft: sqft, totalAmount: amount }));
  };

  const updatePlotLength = (val) => {
    const numVal = Number(val) || 0;
    setNewProperty(prev => ({ ...prev, plotLength: numVal }));
    setTimeout(calculateTotals, 10);
  };

  const updatePlotWidth = (val) => {
    const numVal = Number(val) || 0;
    setNewProperty(prev => ({ ...prev, plotWidth: numVal }));
    setTimeout(calculateTotals, 10);
  };

  const updateRatePerSft = (val) => {
    const numVal = Number(val) || 0;
    setNewProperty(prev => ({ ...prev, ratePerSft: numVal }));
    setTimeout(calculateTotals, 10);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setTempImages([...tempImages, ...imageUrls]);
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    const videoUrls = files.map(file => URL.createObjectURL(file));
    setTempVideos([...tempVideos, ...videoUrls]);
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const docUrls = files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
    setTempDocuments([...tempDocuments, ...docUrls]);
  };

  const addProperty = () => {
    if (!newProperty.name || !newProperty.location) {
      alert("Please fill property name and location");
      return;
    }
    setProperties([...properties, {
      ...newProperty,
      id: properties.length + 1,
      plotLength: Number(newProperty.plotLength) || 0,
      plotWidth: Number(newProperty.plotWidth) || 0,
      ratePerSft: Number(newProperty.ratePerSft) || 0,
      bedrooms: Number(newProperty.bedrooms) || 0,
      bathrooms: Number(newProperty.bathrooms) || 0,
      images: tempImages,
      videos: tempVideos,
      documents: tempDocuments,
      listedDate: new Date().toISOString().split("T")[0]
    }]);
    setNewProperty({
      name: "", category: "BDA", type: "Apartment",
      plotLength: 0, plotWidth: 0, totalSqft: 0, ratePerSft: 0, totalAmount: 0,
      location: "", city: "", pincode: "",
      bedrooms: 0, bathrooms: 0, furnished: "Semi Furnished",
      description: "", status: "Available",
      images: [], videos: [], documents: []
    });
    setTempImages([]);
    setTempVideos([]);
    setTempDocuments([]);
    setShowAddProperty(false);
    alert("Property added successfully!");
  };

  const sendEnquiry = () => {
    if (!enquiryBuyer.name || !enquiryBuyer.mobile) {
      alert("Please enter your name and mobile number");
      return;
    }
    const newEnquiry = {
      id: enquiries.length + 1,
      propertyId: selectedProperty.id,
      propertyName: selectedProperty.name,
      category: selectedProperty.category,
      buyer: enquiryBuyer.name,
      mobile: enquiryBuyer.mobile,
      email: enquiryBuyer.email || "",
      message: enquiryBuyer.message || "Interested in this property",
      date: new Date().toISOString().split("T")[0],
      status: "Pending"
    };
    setEnquiries([...enquiries, newEnquiry]);
    alert("Enquiry sent! You will receive a response shortly.");
    setShowEnquiryModal(false);
    setEnquiryBuyer({ name: "", mobile: "", email: "", message: "" });
  };

  const sendWhatsAppReply = (enquiry) => {
    const message = `Property: ${enquiry.propertyName}%0A%0A${replyMessage || "Property is available for site visit."}`;
    window.open(`https://wa.me/${enquiry.mobile}?text=${message}`, "_blank");
    setEnquiries(enquiries.map(e => e.id === enquiry.id ? { ...e, status: "Replied" } : e));
    setShowReplyModal(false);
    setReplyMessage("");
    alert("Reply sent!");
  };

  const viewPropertyDetails = (property) => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
  };

  const filteredProperties = categoryFilter === "all" 
    ? properties 
    : properties.filter(p => p.category === categoryFilter);

  const styles = {
    container: { padding: "20px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#800020", color: "white", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "20px" },
    headerTitle: { margin: 0, fontSize: "20px" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "16px", marginBottom: "16px" },
    cardTitle: { fontSize: "16px", fontWeight: "bold", marginBottom: "12px", borderBottom: "2px solid #800020", paddingBottom: "8px" },
    button: { backgroundColor: "#800020", color: "white", padding: "10px 16px", border: "none", borderRadius: "8px", cursor: "pointer" },
    buttonSuccess: { backgroundColor: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonInfo: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "12px", fontSize: "12px" },
    th: { textAlign: "left", padding: "8px", borderBottom: "1px solid #eee" },
    td: { padding: "8px", borderBottom: "1px solid #eee" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "650px", maxHeight: "80vh", overflow: "auto" },
    tabContainer: { display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #eee", flexWrap: "wrap" },
    tab: { padding: "8px 16px", cursor: "pointer", borderBottom: "2px solid transparent" },
    activeTab: { borderBottomColor: "#800020", color: "#800020", fontWeight: "bold" },
    input: { width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px", fontSize: "14px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#333" },
    select: { width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px", fontSize: "14px", backgroundColor: "white" },
    textarea: { width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", minHeight: "80px", marginBottom: "12px", fontSize: "14px" },
    row2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "16px" },
    row3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "16px" },
    grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "20px" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" },
    statValue: { fontSize: "24px", fontWeight: "bold", color: "#800020" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" },
    uploadArea: { border: "2px dashed #800020", borderRadius: "8px", padding: "20px", textAlign: "center", backgroundColor: "#f8f9fa", cursor: "pointer", marginBottom: "12px" },
    imagePreview: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", margin: "4px" },
    propertyCard: { border: "1px solid #eee", borderRadius: "12px", padding: "16px", marginBottom: "16px", cursor: "pointer", transition: "all 0.3s", backgroundColor: "white" },
    requiredStar: { color: "#dc3545", marginLeft: "4px" },
    calcBox: { backgroundColor: "#e8f5e9", padding: "12px", borderRadius: "8px", marginBottom: "16px" }
  };

  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === "Available").length;
  const totalValue = properties.reduce((sum, p) => sum + p.totalAmount, 0);
  const pendingEnquiries = enquiries.filter(e => e.status === "Pending").length;

  const tabs = [
    { id: "properties", name: "Properties" },
    { id: "enquiries", name: "Enquiries" },
    { id: "categories", name: "Categories" },
    { id: "dashboard", name: "Dashboard" }
  ];

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("h1", { style: styles.headerTitle }, "Real Estate Dashboard"),
      React.createElement("div", { style: { display: "flex", gap: "10px" } },
        React.createElement("button", { onClick: () => window.location.href = "/marketplace", style: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Marketplace"),
        React.createElement("button", { onClick: () => window.location.href = "/", style: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "Logout")
      )
    ),

    React.createElement("div", { style: styles.grid4 },
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, totalProperties), React.createElement("div", { style: styles.statLabel }, "Properties")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, availableProperties), React.createElement("div", { style: styles.statLabel }, "Available")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, "₹", (totalValue/10000000).toFixed(1), "Cr"), React.createElement("div", { style: styles.statLabel }, "Total Value")),
      React.createElement("div", { style: styles.card }, React.createElement("div", { style: styles.statValue }, pendingEnquiries), React.createElement("div", { style: styles.statLabel }, "Enquiries"))
    ),

    React.createElement("div", { style: styles.tabContainer },
      tabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.name))
    ),

    activeTab === "properties" && React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: () => setShowAddProperty(true), style: styles.button }, "+ Add Property"),
        React.createElement("select", { value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), style: styles.select },
          React.createElement("option", { value: "all" }, "All Categories"),
          categories.map(cat => React.createElement("option", { key: cat, value: cat }, cat))
        )
      ),
      React.createElement("div", null,
        filteredProperties.map(p => React.createElement("div", { key: p.id, style: styles.propertyCard, onClick: () => viewPropertyDetails(p) },
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" } },
            React.createElement("div", null,
              React.createElement("h3", { style: { margin: "0 0 8px 0", color: "#800020" } }, p.name),
              React.createElement("p", { style: { margin: "4px 0", fontSize: "12px", color: "#666" } }, p.category, " | ", p.type, " | ", p.location)
            ),
            React.createElement("div", { style: { textAlign: "right" } },
              React.createElement("div", { style: { fontSize: "20px", fontWeight: "bold", color: "#800020" } }, "₹", (p.totalAmount/10000000).toFixed(1), "Cr"),
              React.createElement("div", { style: { fontSize: "12px", color: "#666" } }, p.status)
            )
          ),
          React.createElement("div", { style: { display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" } },
            React.createElement("div", null, "📐 ", p.totalSqft, " sqft"),
            React.createElement("div", null, "💰 ₹", p.ratePerSft, "/sqft"),
            React.createElement("div", null, "🛏️ ", p.bedrooms, " BHK")
          )
        ))
      )
    ),

    activeTab === "enquiries" && React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "Buyer Enquiries"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Property"),
                React.createElement("th", { style: styles.th }, "Buyer"),
                React.createElement("th", { style: styles.th }, "Mobile"),
                React.createElement("th", { style: styles.th }, "Status"),
                React.createElement("th", { style: styles.th }, "Action")
              )
            ),
            React.createElement("tbody", null,
              enquiries.map(e => React.createElement("tr", { key: e.id },
                React.createElement("td", { style: styles.td }, e.propertyName),
                React.createElement("td", { style: styles.td }, e.buyer),
                React.createElement("td", { style: styles.td }, e.mobile),
                React.createElement("td", { style: styles.td }, e.status),
                React.createElement("td", { style: styles.td },
                  e.status === "Pending" && React.createElement("button", { onClick: () => { setSelectedEnquiry(e); setShowReplyModal(true); }, style: styles.buttonSuccess }, "Reply")
                )
              ))
            )
          )
        )
      )
    ),

    activeTab === "categories" && React.createElement("div", null,
      React.createElement("div", { style: styles.grid3 },
        categories.map(cat => {
          const count = properties.filter(p => p.category === cat).length;
          return React.createElement("div", { key: cat, onClick: () => { setCategoryFilter(cat); setActiveTab("properties"); }, style: { ...styles.card, cursor: "pointer", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: "32px" } }, 
              cat === "GBA" ? "🏢" : cat === "BDA" ? "🏛️" : cat === "BMRDA" ? "🏗️" : cat === "Farmland" ? "🌾" : "🏠"),
            React.createElement("h3", null, cat),
            React.createElement("p", null, count, " properties")
          );
        })
      )
    ),

    activeTab === "dashboard" && React.createElement("div", null,
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Recent Properties"),
          properties.slice(0, 3).map(p => React.createElement("div", { key: p.id, style: { padding: "8px 0", borderBottom: "1px solid #eee" } },
            React.createElement("strong", null, p.name), " (", p.category, ")", React.createElement("br", null), p.location, " | ", p.totalSqft, " sqft"
          ))
        ),
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "Recent Enquiries"),
          enquiries.slice(0, 3).map(e => React.createElement("div", { key: e.id, style: { padding: "8px 0", borderBottom: "1px solid #eee" } },
            React.createElement("strong", null, e.buyer), " interested in ", e.propertyName
          ))
        )
      )
    ),

    // ADD PROPERTY MODAL
    showAddProperty && React.createElement("div", { style: styles.modal, onClick: () => setShowAddProperty(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#800020", marginBottom: "20px" } }, "Add New Property"),

        React.createElement("label", { style: styles.label }, "Property Name", React.createElement("span", { style: styles.requiredStar }, "*")),
        React.createElement("input", { type: "text", placeholder: "Enter property name", value: newProperty.name, onChange: (e) => setNewProperty({...newProperty, name: e.target.value}), style: styles.input }),

        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Category"),
            React.createElement("select", { value: newProperty.category, onChange: (e) => setNewProperty({...newProperty, category: e.target.value}), style: styles.select },
              categories.map(cat => React.createElement("option", { key: cat, value: cat }, cat))
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Property Type"),
            React.createElement("select", { value: newProperty.type, onChange: (e) => setNewProperty({...newProperty, type: e.target.value}), style: styles.select },
              React.createElement("option", null, "Apartment"), React.createElement("option", null, "Villa"),
              React.createElement("option", null, "Commercial"), React.createElement("option", null, "Land")
            )
          )
        ),

        React.createElement("label", { style: { ...styles.label, marginTop: "8px" } }, "Plot Details"),
        React.createElement("div", { style: styles.row3 },
          React.createElement("div", null,
            React.createElement("label", { style: { fontSize: "11px", color: "#666" } }, "Length (ft)"),
            React.createElement("input", { type: "number", placeholder: "Length", value: newProperty.plotLength, onChange: (e) => updatePlotLength(e.target.value), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: { fontSize: "11px", color: "#666" } }, "Width (ft)"),
            React.createElement("input", { type: "number", placeholder: "Width", value: newProperty.plotWidth, onChange: (e) => updatePlotWidth(e.target.value), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: { fontSize: "11px", color: "#666" } }, "Rate per sqft (₹)"),
            React.createElement("input", { type: "number", placeholder: "Rate/sqft", value: newProperty.ratePerSft, onChange: (e) => updateRatePerSft(e.target.value), style: styles.input })
          )
        ),

        React.createElement("div", { style: styles.calcBox },
          React.createElement("div", null, "📐 Total Area: ", newProperty.totalSqft, " sqft"),
          React.createElement("div", null, "💰 Total Amount: ₹", newProperty.totalAmount.toLocaleString())
        ),

        React.createElement("label", { style: styles.label }, "Location Details"),
        React.createElement("div", { style: styles.row3 },
          React.createElement("div", null,
            React.createElement("label", { style: { fontSize: "11px", color: "#666" } }, "Locality"),
            React.createElement("input", { type: "text", placeholder: "Locality", value: newProperty.location, onChange: (e) => setNewProperty({...newProperty, location: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: { fontSize: "11px", color: "#666" } }, "City"),
            React.createElement("input", { type: "text", placeholder: "City", value: newProperty.city, onChange: (e) => setNewProperty({...newProperty, city: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: { fontSize: "11px", color: "#666" } }, "Pincode"),
            React.createElement("input", { type: "text", placeholder: "Pincode", value: newProperty.pincode, onChange: (e) => setNewProperty({...newProperty, pincode: e.target.value}), style: styles.input })
          )
        ),

        React.createElement("div", { style: styles.row3 },
          React.createElement("div", null,
            React.createElement("label", { style: { fontSize: "11px", color: "#666" } }, "Bedrooms"),
            React.createElement("input", { type: "number", placeholder: "Bedrooms", value: newProperty.bedrooms, onChange: (e) => setNewProperty({...newProperty, bedrooms: Number(e.target.value)}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: { fontSize: "11px", color: "#666" } }, "Bathrooms"),
            React.createElement("input", { type: "number", placeholder: "Bathrooms", value: newProperty.bathrooms, onChange: (e) => setNewProperty({...newProperty, bathrooms: Number(e.target.value)}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: { fontSize: "11px", color: "#666" } }, "Furnished"),
            React.createElement("select", { value: newProperty.furnished, onChange: (e) => setNewProperty({...newProperty, furnished: e.target.value}), style: styles.select },
              React.createElement("option", null, "Fully Furnished"), React.createElement("option", null, "Semi Furnished"),
              React.createElement("option", null, "Unfurnished")
            )
          )
        ),

        React.createElement("label", { style: styles.label }, "Description"),
        React.createElement("textarea", { placeholder: "Property description", value: newProperty.description, onChange: (e) => setNewProperty({...newProperty, description: e.target.value}), style: styles.textarea, rows: 3 }),
        
        React.createElement("label", { style: styles.label }, "Upload Images"),
        React.createElement("div", { style: styles.uploadArea, onClick: () => document.getElementById("imageUpload").click() },
          React.createElement("div", null, "📸 Click to upload images"),
          React.createElement("input", { id: "imageUpload", type: "file", accept: "image/*", multiple: true, onChange: handleImageUpload, style: { display: "none" } })
        ),
        tempImages.length > 0 && React.createElement("div", { style: { marginBottom: "12px" } },
          tempImages.map((img, idx) => React.createElement("img", { key: idx, src: img, style: styles.imagePreview }))
        ),

        React.createElement("label", { style: styles.label }, "Upload Video"),
        React.createElement("div", { style: styles.uploadArea, onClick: () => document.getElementById("videoUpload").click() },
          React.createElement("div", null, "🎥 Click to upload video"),
          React.createElement("input", { id: "videoUpload", type: "file", accept: "video/*", onChange: handleVideoUpload, style: { display: "none" } })
        ),

        React.createElement("label", { style: styles.label }, "Upload Documents"),
        React.createElement("div", { style: styles.uploadArea, onClick: () => document.getElementById("docUpload").click() },
          React.createElement("div", null, "📄 Click to upload documents"),
          React.createElement("input", { id: "docUpload", type: "file", accept: ".pdf,.doc,.docx", multiple: true, onChange: handleDocumentUpload, style: { display: "none" } })
        ),

        React.createElement("button", { onClick: addProperty, style: { ...styles.buttonSuccess, width: "100%", padding: "12px", marginTop: "16px" } }, "Add Property")
      )
    ),

    // PROPERTY DETAILS MODAL
    showPropertyDetails && selectedProperty && React.createElement("div", { style: styles.modal, onClick: () => setShowPropertyDetails(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#800020" } }, selectedProperty.name),
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" } },
          React.createElement("span", { style: { backgroundColor: selectedProperty.status === "Available" ? "#d4edda" : "#f8d7da", padding: "4px 12px", borderRadius: "20px" } }, selectedProperty.status)
        ),
        React.createElement("div", { style: styles.grid2 },
          React.createElement("div", null,
            React.createElement("p", null, React.createElement("strong", null, "Category:"), " ", selectedProperty.category),
            React.createElement("p", null, React.createElement("strong", null, "Type:"), " ", selectedProperty.type),
            React.createElement("p", null, React.createElement("strong", null, "Location:"), " ", selectedProperty.location, ", ", selectedProperty.city, " - ", selectedProperty.pincode)
          ),
          React.createElement("div", null,
            React.createElement("p", null, React.createElement("strong", null, "Total Area:"), " ", selectedProperty.totalSqft, " sqft"),
            React.createElement("p", null, React.createElement("strong", null, "Rate:"), " ₹", selectedProperty.ratePerSft, "/sqft"),
            React.createElement("p", null, React.createElement("strong", null, "Total Amount:"), " ₹", (selectedProperty.totalAmount/10000000).toFixed(2), " Cr")
          )
        ),
        React.createElement("div", { style: styles.row3 },
          React.createElement("p", null, React.createElement("strong", null, "Bedrooms:"), " ", selectedProperty.bedrooms),
          React.createElement("p", null, React.createElement("strong", null, "Bathrooms:"), " ", selectedProperty.bathrooms),
          React.createElement("p", null, React.createElement("strong", null, "Furnished:"), " ", selectedProperty.furnished)
        ),
        React.createElement("p", null, React.createElement("strong", null, "Description:"), " ", selectedProperty.description),
        
        selectedProperty.images.length > 0 && React.createElement("div", null,
          React.createElement("h4", null, "Images"),
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px" } },
            selectedProperty.images.map((img, idx) => React.createElement("img", { key: idx, src: img, style: styles.imagePreview }))
          )
        ),
        React.createElement("button", { onClick: () => setShowEnquiryModal(true), style: { ...styles.buttonSuccess, width: "100%", marginTop: "16px", padding: "12px" } }, "📞 Enquire Now")
      )
    ),

    // ENQUIRY MODAL
    showEnquiryModal && selectedProperty && React.createElement("div", { style: styles.modal, onClick: () => setShowEnquiryModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Enquire about ", selectedProperty.name),
        React.createElement("label", { style: styles.label }, "Your Name", React.createElement("span", { style: styles.requiredStar }, "*")),
        React.createElement("input", { type: "text", placeholder: "Enter your name", value: enquiryBuyer.name, onChange: (e) => setEnquiryBuyer({...enquiryBuyer, name: e.target.value}), style: styles.input }),
        React.createElement("label", { style: styles.label }, "Mobile Number", React.createElement("span", { style: styles.requiredStar }, "*")),
        React.createElement("input", { type: "tel", placeholder: "Enter mobile number", value: enquiryBuyer.mobile, onChange: (e) => setEnquiryBuyer({...enquiryBuyer, mobile: e.target.value}), style: styles.input }),
        React.createElement("label", { style: styles.label }, "Message"),
        React.createElement("textarea", { placeholder: "Your message", value: enquiryBuyer.message, onChange: (e) => setEnquiryBuyer({...enquiryBuyer, message: e.target.value}), style: styles.textarea, rows: 4 }),
        React.createElement("button", { onClick: sendEnquiry, style: { ...styles.buttonSuccess, width: "100%", padding: "12px", marginTop: "16px" } }, "Submit Enquiry")
      )
    ),

    // REPLY MODAL
    showReplyModal && selectedEnquiry && React.createElement("div", { style: styles.modal, onClick: () => setShowReplyModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Reply to ", selectedEnquiry.buyer),
        React.createElement("p", null, React.createElement("strong", null, "Property:"), " ", selectedEnquiry.propertyName),
        React.createElement("p", null, React.createElement("strong", null, "Buyer Message:"), " ", selectedEnquiry.message),
        React.createElement("textarea", { placeholder: "Type your reply here", value: replyMessage, onChange: (e) => setReplyMessage(e.target.value), style: styles.textarea, rows: 4 }),
        React.createElement("button", { onClick: () => sendWhatsAppReply(selectedEnquiry), style: { ...styles.buttonSuccess, width: "100%", padding: "12px", marginTop: "16px" } }, "Send WhatsApp Reply")
      )
    )
  );
}
