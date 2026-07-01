import React, { useState, useEffect } from "react";
import { logoutToLogin } from "../utils/session";

export default function RealEstateDashboard() {
const [activeTab, setActiveTab] = useState("overview");
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editProperty, setEditProperty] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [userName, setUserName] = useState("Real Estate Agent");
  const [isClient, setIsClient] = useState(false);
  const [propertyType, setPropertyType] = useState("plot");
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [calculatedArea, setCalculatedArea] = useState(0);
  
  const [properties, setProperties] = useState([]);

  // Property type fields configuration with ALL types
  const getPropertyFields = (type) => {
    switch(type) {
      case "plot":
        return {
          title: "Plot Details",
          fields: [
            { key: "eastWest", label: "East to West (ft)", type: "number", required: true },
            { key: "northSouth", label: "North to South (ft)", type: "number", required: true },
            { key: "roadFacing", label: "Road Facing", type: "select", options: ["East", "West", "North", "South", "Corner"], required: true },
            { key: "roadWidth", label: "Road Width (ft)", type: "number", required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true, readonly: true, calculated: true },
            { key: "totalAmount", label: "Total Amount (₹)", type: "number", required: true, readonly: true, calculated: true }
          ]
        };
      case "agriculture":
        return {
          title: "Agriculture Land Details",
          fields: [
            { key: "eastWest", label: "East to West (ft)", type: "number", required: true },
            { key: "northSouth", label: "North to South (ft)", type: "number", required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true, readonly: true, calculated: true },
            { key: "totalAreaAcres", label: "Total Area (Acres)", type: "number", required: true, readonly: true, calculated: true },
            { key: "soilType", label: "Soil Type", type: "select", options: ["Black", "Red", "Sandy", "Clay", "Loam", "Mixed"], required: true },
            { key: "waterSource", label: "Water Source", type: "select", options: ["Borewell", "Open Well", "River", "Canal", "Rainfed"], required: true },
            { key: "roadAccess", label: "Road Access", type: "select", options: ["Metalled Road", "Kutcha Road", "No Road"], required: true },
            { key: "ratePerAcre", label: "Rate per Acre (₹)", type: "number", required: true },
            { key: "totalAmount", label: "Total Amount (₹)", type: "number", required: true, readonly: true, calculated: true }
          ]
        };
      case "farmland":
        return {
          title: "Farm Land Details",
          fields: [
            { key: "eastWest", label: "East to West (ft)", type: "number", required: true },
            { key: "northSouth", label: "North to South (ft)", type: "number", required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true, readonly: true, calculated: true },
            { key: "totalAreaAcres", label: "Total Area (Acres)", type: "number", required: true, readonly: true, calculated: true },
            { key: "cropType", label: "Crop Type", type: "select", options: ["Coconut", "Arecanut", "Rubber", "Tea", "Coffee", "Mixed Crops", "Dry Land"], required: true },
            { key: "irrigation", label: "Irrigation Facility", type: "select", options: ["Drip", "Sprinkler", "Flood", "Rainfed", "Well"], required: true },
            { key: "fencing", label: "Fencing", type: "select", options: ["Barbed Wire", "Stone Wall", "Live Hedge", "No Fencing"], required: true },
            { key: "ratePerAcre", label: "Rate per Acre (₹)", type: "number", required: true },
            { key: "totalAmount", label: "Total Amount (₹)", type: "number", required: true, readonly: true, calculated: true }
          ]
        };
      case "revenue":
        return {
          title: "Revenue Sites Details",
          fields: [
            { key: "siteNumber", label: "Site Number", type: "text", required: true },
            { key: "surveyNumber", label: "Survey Number", type: "text", required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
            { key: "totalAmount", label: "Total Amount (₹)", type: "number", required: true, readonly: true, calculated: true },
            { key: "roadFacing", label: "Road Facing", type: "select", options: ["East", "West", "North", "South", "Corner"], required: true },
            { key: "roadWidth", label: "Road Width (ft)", type: "number", required: true },
            { key: "status", label: "Status", type: "select", options: ["Approved", "Pending Approval", "Ready for Registration"], required: true }
          ]
        };
      case "bmrda":
        return {
          title: "BMRDA Sites Details",
          fields: [
            { key: "siteNumber", label: "Site Number", type: "text", required: true },
            { key: "layoutName", label: "Layout Name", type: "text", required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
            { key: "totalAmount", label: "Total Amount (₹)", type: "number", required: true, readonly: true, calculated: true },
            { key: "roadFacing", label: "Road Facing", type: "select", options: ["East", "West", "North", "South", "Corner"], required: true },
            { key: "roadWidth", label: "Road Width (ft)", type: "number", required: true },
            { key: "approvalStatus", label: "Approval Status", type: "select", options: ["BMRDA Approved", "Approval Pending", "Final Layout Ready"], required: true }
          ]
        };
      case "industrial":
        return {
          title: "Industrial Land Details",
          fields: [
            { key: "eastWest", label: "East to West (ft)", type: "number", required: true },
            { key: "northSouth", label: "North to South (ft)", type: "number", required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true, readonly: true, calculated: true },
            { key: "totalAreaAcres", label: "Total Area (Acres)", type: "number", required: true, readonly: true, calculated: true },
            { key: "zoneType", label: "Zone Type", type: "select", options: ["Industrial", "Special Industrial", "Mixed Use"], required: true },
            { key: "powerAvailability", label: "Power Availability", type: "select", options: ["Yes - 3 Phase", "Yes - Single Phase", "No"], required: true },
            { key: "waterSupply", label: "Water Supply", type: "select", options: ["Borewell", "Municipal", "River", "Rainfed"], required: true },
            { key: "roadAccess", label: "Road Access", type: "select", options: ["NH/SH", "District Road", "Village Road", "No Road"], required: true },
            { key: "ratePerAcre", label: "Rate per Acre (₹)", type: "number", required: true },
            { key: "totalAmount", label: "Total Amount (₹)", type: "number", required: true, readonly: true, calculated: true }
          ]
        };
      case "apartment":
        return {
          title: "Apartment Details",
          fields: [
            { key: "flatNo", label: "Flat No", type: "text", required: true },
            { key: "floorNo", label: "Floor No", type: "number", required: true },
            { key: "totalFloors", label: "Total Floors", type: "number", required: true },
            { key: "bhk", label: "No of BHK", type: "select", options: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK"], required: true },
            { key: "toilets", label: "No of Toilets", type: "number", required: true },
            { key: "furnishing", label: "Furnishing", type: "select", options: ["Unfurnished", "Semi-furnished", "Fully Furnished"], required: true },
            { key: "status", label: "Property Status", type: "select", options: ["Ready to Move", "Under Construction"], required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
            { key: "totalAmount", label: "Total Amount (₹)", type: "number", required: true, readonly: true, calculated: true }
          ]
        };
      case "villa":
        return {
          title: "Villa Details",
          fields: [
            { key: "plotArea", label: "Plot Area (sq.ft)", type: "number", required: true },
            { key: "builtUpArea", label: "Built-up Area (sq.ft)", type: "number", required: true },
            { key: "bedrooms", label: "Bedrooms", type: "number", required: true },
            { key: "bathrooms", label: "Bathrooms", type: "number", required: true },
            { key: "floors", label: "Floors", type: "number", required: true },
            { key: "furnishing", label: "Furnishing", type: "select", options: ["Unfurnished", "Semi-furnished", "Fully Furnished"], required: true },
            { key: "status", label: "Property Status", type: "select", options: ["Ready to Move", "Under Construction"], required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
            { key: "totalAmount", label: "Total Amount (₹)", type: "number", required: true, readonly: true, calculated: true }
          ]
        };
      case "commercial":
        return {
          title: "Commercial Property Details",
          fields: [
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true },
            { key: "floorNo", label: "Floor No", type: "number", required: true },
            { key: "totalFloors", label: "Total Floors", type: "number", required: true },
            { key: "officeType", label: "Office Type", type: "select", options: ["Retail", "Office Space", "Showroom", "Warehouse", "Factory"], required: true },
            { key: "parking", label: "Parking Available", type: "select", options: ["Yes", "No"], required: true },
            { key: "status", label: "Property Status", type: "select", options: ["Ready to Move", "Under Construction"], required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
            { key: "totalAmount", label: "Total Amount (₹)", type: "number", required: true, readonly: true, calculated: true }
          ]
        };
      case "land":
        return {
          title: "Land Details",
          fields: [
            { key: "eastWest", label: "East to West (ft)", type: "number", required: true },
            { key: "northSouth", label: "North to South (ft)", type: "number", required: true },
            { key: "totalArea", label: "Total Area (sq.ft)", type: "number", required: true, readonly: true, calculated: true },
            { key: "totalAreaAcres", label: "Total Area (Acres)", type: "number", required: true, readonly: true, calculated: true },
            { key: "roadFacing", label: "Road Facing", type: "select", options: ["East", "West", "North", "South", "Corner"], required: true },
            { key: "roadWidth", label: "Road Width (ft)", type: "number", required: true },
            { key: "zonation", label: "Zonation", type: "select", options: ["Residential", "Commercial", "Industrial", "Agricultural"], required: true },
            { key: "ratePerSft", label: "Rate per sq.ft (₹)", type: "number", required: true },
            { key: "totalAmount", label: "Total Amount (₹)", type: "number", required: true, readonly: true, calculated: true }
          ]
        };
      default:
        return { title: "Property Details", fields: [] };
    }
  };

  useEffect(() => {
    setIsClient(true);
    const name = localStorage.getItem("userName") || "Real Estate Agent";
    setUserName(name);
    
    const saved = localStorage.getItem("realEstateProperties");
    if (saved) {
      setProperties(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isClient && properties.length > 0) {
      localStorage.setItem("realEstateProperties", JSON.stringify(properties));
    }
  }, [properties, isClient]);

  // Calculate Total Amount and Area based on type
  const calculateTotals = (formData, type) => {
    let totalArea = 0;
    let totalAmount = 0;
    let totalAreaAcres = 0;
    
    const fields = getPropertyFields(type).fields;
    const data = {};
    
    // Get all form values
    fields.forEach(f => {
      data[f.key] = parseFloat(formData.get(f.key)) || 0;
    });
    
    switch(type) {
      case "plot":
      case "land":
        totalArea = data.eastWest * data.northSouth;
        totalAmount = totalArea * data.ratePerSft;
        totalAreaAcres = totalArea / 43560; // 1 acre = 43560 sq.ft
        break;
        
      case "agriculture":
      case "farmland":
      case "industrial":
        totalArea = data.eastWest * data.northSouth;
        totalAreaAcres = totalArea / 43560;
        totalAmount = totalAreaAcres * data.ratePerAcre;
        break;
        
      case "revenue":
      case "bmrda":
        totalAmount = data.totalArea * data.ratePerSft;
        totalArea = data.totalArea;
        break;
        
      case "apartment":
      case "villa":
      case "commercial":
        totalAmount = data.totalArea * data.ratePerSft;
        totalArea = data.totalArea;
        break;
        
      default:
        totalAmount = data.totalArea * data.ratePerSft;
        totalArea = data.totalArea;
    }
    
    return { totalArea, totalAmount, totalAreaAcres };
  };

  // Update calculated values when form changes
  const handleFieldChange = (e, form) => {
    const formData = new FormData(form);
    const type = formData.get("type") || propertyType;
    const results = calculateTotals(formData, type);
    
    setCalculatedTotal(results.totalAmount);
    setCalculatedArea(results.totalArea);
    
    // Update the readonly fields
    const areaField = form.querySelector('[name="totalArea"]');
    const amountField = form.querySelector('[name="totalAmount"]');
    const acresField = form.querySelector('[name="totalAreaAcres"]');
    
    if (areaField) areaField.value = results.totalArea || 0;
    if (amountField) amountField.value = results.totalAmount || 0;
    if (acresField) acresField.value = results.totalAreaAcres || 0;
  };

  const addProperty = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const propertyData = {};
    
    const fields = getPropertyFields(propertyType).fields;
    fields.forEach(f => {
      propertyData[f.key] = formData.get(f.key) || "";
    });
    
    // Calculate totals
    const results = calculateTotals(formData, propertyType);
    propertyData.totalArea = results.totalArea || propertyData.totalArea;
    propertyData.totalAmount = results.totalAmount || propertyData.totalAmount;
    propertyData.totalAreaAcres = results.totalAreaAcres || 0;
    
    const newProperty = { listingType: activeTab === "rental" ? "Rental" : activeTab === "buy" ? "Buy" : "Sell",
      id: Date.now(),
      type: propertyType,
      title: formData.get("title"),
      location: formData.get("location"),
      description: formData.get("description"),
      contactNumber: formData.get("contactNumber") || "9876543210",
      ...propertyData,
      images: selectedImage ? [URL.createObjectURL(selectedImage)] : [],
      documents: selectedDocument ? [selectedDocument.name] : [],
      video: selectedVideo ? URL.createObjectURL(selectedVideo) : null,
      status: "Available",
      createdAt: new Date().toISOString().split("T")[0],
      enquiries: []
    };
    
    setProperties([...properties, newProperty]);
    setShowPropertyModal(false);
    setSelectedImage(null);
    setSelectedDocument(null);
    setSelectedVideo(null);
    setCalculatedTotal(0);
    setCalculatedArea(0);
    alert("Property added successfully!");
  };

  // Render Property Fields based on type with auto-calc
  const renderPropertyFields = (type, data = {}) => {
    const fields = getPropertyFields(type).fields;
    return fields.map(f => {
      const value = data[f.key] || "";
      if (f.type === "select") {
        return React.createElement("div", { key: f.key },
          React.createElement("label", { style: styles.label }, f.label, f.required ? " *" : ""),
          React.createElement("select", { 
            name: f.key, 
            defaultValue: value,
            required: f.required,
            style: styles.select,
            readOnly: f.readonly
          },
            React.createElement("option", null, "Select"),
            f.options.map(opt => React.createElement("option", { key: opt, value: opt }, opt))
          )
        );
      }
      return React.createElement("div", { key: f.key },
        React.createElement("label", { style: styles.label }, f.label, f.required ? " *" : ""),
        React.createElement("input", { 
          type: f.type, 
          name: f.key, 
          defaultValue: value,
          required: f.required,
          readOnly: f.readonly,
          onChange: (e) => {
            if (!f.readonly) {
              const form = e.target.closest("form");
              if (form) handleFieldChange(e, form);
            }
          },
          style: { ...styles.input, ...(f.readonly ? { backgroundColor: "#f0f0f0", fontWeight: "bold" } : {}) },
          placeholder: f.label
        })
      );
    });
  };

  // Rest of the functions remain the same...
  const deleteProperty = (id) => {
    if (window.confirm("Delete this property?")) {
      setProperties(properties.filter(p => p.id !== id));
    }
  };

  const updatePropertyStatus = (id, status) => {
    setProperties(properties.map(p => p.id === id ? { ...p, status } : p));
  };

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
    progressFill: { height: "100%", backgroundColor: "#10b981", borderRadius: "4px" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "700px", maxHeight: "85vh", overflow: "auto" },
    statusBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "500", display: "inline-block" },
    statValue: { fontSize: "28px", fontWeight: "bold", color: "#1a5f7a" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" },
    fileInput: { padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px", width: "100%" }
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "properties", name: "Properties", icon: "🏠" },
    { id: "rental", name: "Rental", icon: "🏘️" },
    { id: "buy", name: "Buy", icon: "🛒" },
    { id: "sell", name: "Sell", icon: "🏷️" },
    { id: "affiliate", name: "Affiliate", icon: "🤝" },
    { id: "analytics", name: "Analytics", icon: "📈" }
  ];

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price/10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price/100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  const renderOverview = () => {
    const totalProperties = properties.length;
    const available = properties.filter(p => p.status === "Available").length;
    const totalValue = properties.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    return React.createElement("div", null,
      React.createElement("div", { style: styles.grid4 },
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, totalProperties),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Total Properties")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, available),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Available")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, totalProperties - available),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Booked/Sold")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" } },
          React.createElement("div", { style: { fontSize: "28px", fontWeight: "bold" } }, formatPrice(totalValue)),
          React.createElement("div", { style: { fontSize: "12px", opacity: 0.9 } }, "Portfolio Value")
        )
      )
    );
  };

  const renderProperties = (mode = "all") => {
    const titleMap = {
      all: "All Properties",
      rental: "Rental Properties",
      buy: "Properties for Buy",
      sell: "Properties for Sell"
    };

    const filtered = properties.filter((p) => {
      const listingType = String(p.listingType || "Sell").toLowerCase();
      if (mode === "rental") return listingType.includes("rental") || listingType.includes("rent");
      if (mode === "buy") return listingType.includes("buy") || listingType.includes("sell") || listingType.includes("sale");
      if (mode === "sell") return listingType.includes("sell") || listingType.includes("sale");
      return true;
    });

    return React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 } },
        React.createElement("h2", { style: { margin: 0, color: "#1a5f7a" } }, titleMap[mode] || "Properties"),
        React.createElement("button", { onClick: () => setShowPropertyModal(true), style: styles.button }, "+ Add Property")
      ),
      React.createElement("div", { style: { marginTop: "16px" } },
        filtered.length === 0
          ? React.createElement("div", { style: styles.card }, "No properties found in this tab. Add a new property.")
          : filtered.map(p =>
            React.createElement("div", { key: p.id, style: styles.card },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap" } },
                React.createElement("div", null,
                  React.createElement("h3", { style: { margin: "0 0 4px 0" } }, p.title),
                  React.createElement("p", { style: { margin: "4px 0", fontSize: "12px", color: "#666" } }, p.location, " | ", p.type, " | ", p.listingType || "Sell"),
                  React.createElement("p", { style: { margin: "4px 0", fontSize: "12px" } }, "📐 ", p.totalArea || p.plotArea || "N/A", " sq.ft")
                ),
                React.createElement("div", { style: { textAlign: "right" } },
                  React.createElement("div", { style: { fontSize: "24px", fontWeight: "bold", color: "#1a5f7a" } }, formatPrice(p.totalAmount || 0)),
                  React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: p.status === "Available" ? "#d1fae5" : "#fed7aa", color: p.status === "Available" ? "#065f46" : "#92400e" } }, p.status),
                  React.createElement("br", null),
                  React.createElement("select", {
                    value: p.status,
                    onChange: (e) => updatePropertyStatus(p.id, e.target.value),
                    style: { marginTop: "4px", padding: "4px", borderRadius: "4px", border: "1px solid #ddd" }
                  },
                    React.createElement("option", null, "Available"),
                    React.createElement("option", null, "Booked"),
                    React.createElement("option", null, "Sold"),
                    React.createElement("option", null, "Rented")
                  )
                )
              ),
              React.createElement("p", { style: { fontSize: "12px", color: "#666", marginTop: "8px" } }, p.description),
              React.createElement("div", { style: { marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" } },
                React.createElement("button", { onClick: () => window.open(`https://wa.me/${p.contactNumber || "9876543210"}?text=Hi, I'm interested in ${p.title}`, "_blank"), style: styles.buttonSuccess }, "📱 Enquire")
              )
            )
          )
      )
    );
  };

  const renderAffiliate = () => {
    const layouts = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("bm_realestate_layouts") || "[]") : [];
    const plots = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("bm_realestate_plots") || "[]") : [];

    const saveLayout = () => {
      const get = (id) => ((document.getElementById(id) || {}) as any).value || "";
      const layout = {
        id: Date.now(),
        layoutName: get("layoutName"),
        developerName: get("developerName"),
        reraNo: get("reraNo"),
        location: get("layoutLocation"),
        googleMap: get("googleMap"),
        brochureUrl: get("brochureUrl"),
        masterPlanUrl: get("masterPlanUrl"),
        imageUrls: get("imageUrls"),
        videoUrl: get("videoUrl"),
        droneVideoUrl: get("droneVideoUrl"),
        amenities: get("amenities"),
        authority: get("authority"),
        contactPerson: get("contactPerson"),
        phone: get("layoutPhone"),
        website: get("website"),
        ratePerSft: Number(get("ratePerSft") || 0),
        discount: get("discount"),
        offer: get("offer"),
        status: "Live",
        featured: true,
        createdAt: new Date().toISOString()
      };
      const all = [layout, ...layouts];
      localStorage.setItem("bm_realestate_layouts", JSON.stringify(all));
      alert("Layout uploaded to Real Estate Hub.");
      window.location.reload();
    };

    const savePlot = () => {
      const get = (id) => ((document.getElementById(id) || {}) as any).value || "";
      const area = Number(get("plotArea") || 0);
      const rate = Number(get("plotRate") || 0);
      const plot = {
        id: Date.now(),
        layoutName: get("plotLayoutName"),
        plotNo: get("plotNo"),
        facing: get("plotFacing"),
        dimensions: get("plotDimensions"),
        area,
        ratePerSft: rate,
        totalAmount: area * rate,
        offerPrice: get("plotOfferPrice"),
        discount: get("plotDiscount"),
        status: get("plotStatus") || "Available",
        remarks: get("plotRemarks"),
        createdAt: new Date().toISOString()
      };
      const all = [plot, ...plots];
      localStorage.setItem("bm_realestate_plots", JSON.stringify(all));
      alert("Plot inventory updated in Real Estate Hub.");
      window.location.reload();
    };

    return React.createElement("div", null,
      React.createElement("div", { style: styles.card },
        React.createElement("h2", { style: { color: "#1a5f7a", marginTop: 0 } }, "🏘️ BuildMitra Marketing Partner - Layout Upload"),
        React.createElement("p", null, "Upload layout details here. These details will display publicly in Real Estate Hub."),
        React.createElement("div", { style: styles.grid2 },
          [
            ["layoutName", "Layout Name"], ["developerName", "Developer / Owner Name"], ["reraNo", "RERA No"],
            ["layoutLocation", "Location"], ["googleMap", "Google Map Link"], ["brochureUrl", "Brochure PDF Link"],
            ["masterPlanUrl", "Master Plan PDF Link"], ["imageUrls", "Image / Photo URLs comma separated"],
            ["videoUrl", "Video Link"], ["droneVideoUrl", "Drone Video Link"], ["amenities", "Amenities"],
            ["authority", "Approval Authority"], ["contactPerson", "Contact Person"], ["layoutPhone", "WhatsApp / Phone"],
            ["website", "Website"], ["ratePerSft", "Rate per SFT"], ["discount", "Discount"], ["offer", "Offer"]
          ].map(([id, ph]) => React.createElement("input", { key: id, id, placeholder: ph, style: styles.input }))
        ),
        React.createElement("button", { style: styles.button, onClick: saveLayout }, "+ Add New Layout to Hub")
      ),

      React.createElement("div", { style: styles.card },
        React.createElement("h2", { style: { color: "#1a5f7a", marginTop: 0 } }, "📍 Plot Inventory - Available / Sold / Booked"),
        React.createElement("div", { style: styles.grid3 },
          [
            ["plotLayoutName", "Layout Name"], ["plotNo", "Plot No"], ["plotFacing", "Facing"],
            ["plotDimensions", "Dimensions"], ["plotArea", "Area SFT"], ["plotRate", "Rate/SFT"],
            ["plotOfferPrice", "Offer Price"], ["plotDiscount", "Discount"], ["plotStatus", "Available / Booked / Sold"],
            ["plotRemarks", "Remarks"]
          ].map(([id, ph]) => React.createElement("input", { key: id, id, placeholder: ph, style: styles.input }))
        ),
        React.createElement("button", { style: styles.button, onClick: savePlot }, "+ Add Plot to This Layout")
      ),

      React.createElement("div", { style: styles.card },
        React.createElement("h2", null, "📋 Uploaded Layouts"),
        layouts.length === 0 ? React.createElement("p", null, "No layouts uploaded yet.") :
          layouts.map(l => React.createElement("div", { key: l.id, style: { padding: 10, borderBottom: "1px solid #eee" } },
            React.createElement("b", null, l.layoutName), " - ", l.location, " - ₹", l.ratePerSft, "/sft"
          ))
      ),

      React.createElement("div", { style: styles.card },
        React.createElement("h2", null, "📍 Plot List"),
        plots.length === 0 ? React.createElement("p", null, "No plots added yet.") :
          plots.map(p => React.createElement("div", { key: p.id, style: { padding: 10, borderBottom: "1px solid #eee" } },
            React.createElement("b", null, "Plot ", p.plotNo), " - ", p.layoutName, " - ", p.status, " - ₹", p.ratePerSft, "/sft"
          ))
      )
    );
  };
  const renderAnalytics = () => {
    const totalProperties = properties.length;
    const totalValue = properties.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const avgPrice = totalProperties ? totalValue / totalProperties : 0;
    const available = properties.filter(p => p.status === "Available").length;
    const byType = {};
    properties.forEach(p => {
      byType[p.type] = (byType[p.type] || 0) + 1;
    });

    return React.createElement("div", null,
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "📊 Property Status"),
          React.createElement("div", { style: { padding: "20px" } },
            React.createElement("div", null, React.createElement("strong", null, "Available:"), " ", available, " properties"),
            React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${(available/totalProperties)*100}%`, backgroundColor: "#10b981" } })),
            React.createElement("div", null, React.createElement("strong", null, "Booked/Sold:"), " ", totalProperties - available, " properties"),
            React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${((totalProperties - available)/totalProperties)*100}%`, backgroundColor: "#f59e0b" } }))
          )
        ),
        React.createElement("div", { style: styles.card },
          React.createElement("div", { style: styles.cardTitle }, "💰 Value Summary"),
          React.createElement("div", null,
            React.createElement("p", null, React.createElement("strong", null, "Total Portfolio:"), " ", formatPrice(totalValue)),
            React.createElement("p", null, React.createElement("strong", null, "Average Price:"), " ", formatPrice(avgPrice)),
            React.createElement("p", null, React.createElement("strong", null, "Total Properties:"), " ", totalProperties)
          )
        )
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "📈 Properties by Type"),
        React.createElement("div", { style: { padding: "20px" } },
          Object.keys(byType).map(type =>
            React.createElement("div", { key: type },
              React.createElement("div", null, React.createElement("strong", null, type), ": ", byType[type], " properties"),
              React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${(byType[type]/totalProperties)*100}%` } }))
            )
          )
        )
      )
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case "overview": return renderOverview();
      case "properties": return renderProperties("all");
      case "rental": return renderProperties("rental");
      case "buy": return renderProperties("buy");
      case "sell": return renderProperties("sell");
      case "affiliate": return renderAffiliate();
      case "analytics": return renderAnalytics();
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
        React.createElement("h1", { style: styles.headerTitle }, "🏢 Real Estate Dashboard"),
        React.createElement("div", { style: styles.welcomeText }, "👋 Welcome, ", userName),
        React.createElement("p", { style: styles.headerSub }, "Manage properties, track enquiries, and close deals")
      ),
        React.createElement("button", { onClick: logoutToLogin, style: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "🚪 Logout")
    ),
    React.createElement("div", { style: styles.tabContainer },
      tabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.icon, " ", tab.name))
    ),
    renderContent(),
    
    // Add Property Modal
    showPropertyModal && React.createElement("div", { style: styles.modal, onClick: () => setShowPropertyModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#1a5f7a" } }, "Add New Property"),
        React.createElement("form", { onSubmit: addProperty },
          React.createElement("div", { style: styles.row2 },
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Property Type *"),
              React.createElement("select", { 
                name: "type", 
                required: true,
                style: styles.select,
                onChange: (e) => {
                  setPropertyType(e.target.value);
                  setCalculatedTotal(0);
                  setCalculatedArea(0);
                }
              },
                React.createElement("option", { value: "plot" }, "Plot"),
                React.createElement("option", { value: "agriculture" }, "Agriculture Land"),
                React.createElement("option", { value: "farmland" }, "Farm Land"),
                React.createElement("option", { value: "revenue" }, "Revenue Sites"),
                React.createElement("option", { value: "bmrda" }, "BMRDA Sites"),
                React.createElement("option", { value: "industrial" }, "Industrial Land"),
                React.createElement("option", { value: "apartment" }, "Apartment"),
                React.createElement("option", { value: "villa" }, "Villa"),
                React.createElement("option", { value: "commercial" }, "Commercial"),
                React.createElement("option", { value: "land" }, "Land")
              )
            ),
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Property Title *"),
              React.createElement("input", { name: "title", placeholder: "e.g., Luxury Villa in Whitefield", required: true, style: styles.input })
            )
          ),
          React.createElement("div", { style: styles.row2 },
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Location *"),
              React.createElement("input", { name: "location", placeholder: "Full address with area", required: true, style: styles.input })
            ),
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Contact Number"),
              React.createElement("input", { name: "contactNumber", placeholder: "Your contact number", defaultValue: "9876543210", style: styles.input })
            )
          ),
          React.createElement("div", { style: styles.row3 },
            renderPropertyFields(propertyType)
          ),
          React.createElement("div", { style: { backgroundColor: "#e8f5e9", padding: "12px", borderRadius: "8px", marginBottom: "16px" } },
            React.createElement("div", null, "📐 Calculated Total Area: ", calculatedArea.toLocaleString(), " sq.ft"),
            React.createElement("div", null, "💰 Calculated Total Amount: ₹", (calculatedTotal || 0).toLocaleString())
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Description"),
            React.createElement("textarea", { name: "description", placeholder: "Detailed property description", rows: "3", style: { ...styles.input, minHeight: "80px" } })
          ),
          React.createElement("div", { style: styles.row3 },
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Upload Images"),
              React.createElement("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => setSelectedImage(e.target.files[0]), style: styles.fileInput })
            ),
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Upload Video"),
              React.createElement("input", { type: "file", accept: "video/*", onChange: (e) => setSelectedVideo(e.target.files[0]), style: styles.fileInput })
            ),
            React.createElement("div", null,
              React.createElement("label", { style: styles.label }, "Upload Documents"),
              React.createElement("input", { type: "file", accept: ".pdf,.doc,.docx", onChange: (e) => setSelectedDocument(e.target.files[0]), style: styles.fileInput })
            )
          ),
          React.createElement("button", { type: "submit", style: { ...styles.buttonSuccess, width: "100%", marginTop: "16px" } }, "Add Property")
        )
      )
    )
  );
}






