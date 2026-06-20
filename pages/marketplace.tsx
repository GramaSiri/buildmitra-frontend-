import React, { useState, useEffect } from "react";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [pincode, setPincode] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [enquiryData, setEnquiryData] = useState({
    name: "",
    phone: "",
    location: "",
    quantity: "",
    requirement: ""
  });
  const [isClient, setIsClient] = useState(false);

  const serviceablePincodes = ["560062", "560108", "400001", "400002", "411001", "600001", "500001", "682001"];

  const subCategories = {
    supplier: [
      { id: "all", name: "All Materials" },
      { id: "cement", name: "Cement" },
      { id: "steel", name: "Steel" },
      { id: "hardware", name: "Hardware" },
      { id: "doors", name: "Doors & Windows" },
      { id: "wood", name: "Wood & Plywood" },
      { id: "ss", name: "SS Steel" },
      { id: "rmc", name: "Ready Mix Concrete" },
      { id: "pavers", name: "Pavers & Blocks" },
      { id: "tiles", name: "Tiles" },
      { id: "sanitary", name: "Sanitaryware & CP Fittings" },
      { id: "locks", name: "Locks & Hardware" },
      { id: "paints", name: "Paints & Coatings" },
      { id: "falseceiling", name: "False Ceiling" },
      { id: "electrical", name: "Electrical" },
      { id: "plumbing", name: "Plumbing" },
      { id: "consumables", name: "Consumables" }
    ],
    contractor: [
      { id: "all", name: "All Services" },
      { id: "civil", name: "Civil Works" },
      { id: "electrical", name: "Electrical" },
      { id: "plumbing", name: "Plumbing" },
      { id: "carpenter", name: "Carpenter" },
      { id: "painter", name: "Painter" },
      { id: "barbender", name: "Barbender" },
      { id: "shuttering", name: "Shuttering" },
      { id: "earthwork", name: "Earth Work" },
      { id: "tilelayer", name: "Tile Layers" },
      { id: "fabrication", name: "Fabrication" },
      { id: "waterproofing", name: "Waterproofing" }
    ],
    machinery: [
      { id: "all", name: "All Equipment" },
      { id: "excavator", name: "Excavator" },
      { id: "jcb", name: "JCB" },
      { id: "crane", name: "Crane" },
      { id: "concretepump", name: "Concrete Pump" },
      { id: "transitmixer", name: "Transit Mixer" },
      { id: "compactor", name: "Compactor" },
      { id: "generator", name: "Generator" },
      { id: "welding", name: "Welding Machine" },
      { id: "scaffolding", name: "Scaffolding" }
    ],
    labour: [
      { id: "all", name: "All Labour" },
      { id: "mason", name: "Mason" },
      { id: "carpenter", name: "Carpenter" },
      { id: "helper", name: "Helper" },
      { id: "electrician", name: "Electrician" },
      { id: "plumber", name: "Plumber" },
      { id: "painter", name: "Painter" },
      { id: "barbender", name: "Barbender" },
      { id: "shuttering", name: "Shuttering Carpenter" },
      { id: "tilelayer", name: "Tile Layer" },
      { id: "welder", name: "Welder" },
      { id: "driver", name: "Driver" }
    ],
    realestate: [
      { id: "all", name: "All Properties" },
      { id: "residential", name: "Residential" },
      { id: "commercial", name: "Commercial" },
      { id: "villa", name: "Villa" },
      { id: "plot", name: "Plot/Land" },
      { id: "agriculture", name: "Agriculture Land" },
      { id: "industrial", name: "Industrial" },
      { id: "revenue", name: "Revenue Sites" },
      { id: "bmrda", name: "BMRDA Sites" }
    ]
  };

  useEffect(function() {
    setIsClient(true);
    loadAllMarketplaceData();
  }, []);

  function loadAllMarketplaceData() {
    try {
      var allItems = [];
      var users = JSON.parse(localStorage.getItem("users") || "[]");
      var allKeys = Object.keys(localStorage);
      var productKeys = allKeys.filter(function(key) {
        return key.startsWith("supplierProducts_") && key !== "supplierProducts_undefined";
      });
      
      productKeys.forEach(function(key) {
        try {
          var productsData = localStorage.getItem(key);
          if (productsData) {
            var userProducts = JSON.parse(productsData);
            var userId = key.replace("supplierProducts_", "");
            var user = users.find(function(u) { return u.userId == userId; });
            var userName = user?.name || "Unknown Supplier";
            var userPhone = user?.phone || "+919876543210";
            
            var supplierInfo = null;
            var infoKey = "supplierInfo_" + userId;
            if (localStorage.getItem(infoKey)) {
              supplierInfo = JSON.parse(localStorage.getItem(infoKey));
            }
            
            userProducts.forEach(function(p) {
              var subCategory = "all";
              var lowerName = (p.name || "").toLowerCase();
              if (lowerName.includes("cement")) subCategory = "cement";
              else if (lowerName.includes("steel") || lowerName.includes("tmt")) subCategory = "steel";
              else if (lowerName.includes("brick") || lowerName.includes("block")) subCategory = "pavers";
              else if (lowerName.includes("tile")) subCategory = "tiles";
              else if (lowerName.includes("paint")) subCategory = "paints";
              else if (lowerName.includes("door") || lowerName.includes("window")) subCategory = "doors";
              else if (lowerName.includes("wood") || lowerName.includes("ply")) subCategory = "wood";
              else if (lowerName.includes("pipe") || lowerName.includes("fitting")) subCategory = "plumbing";
              else if (lowerName.includes("wire") || lowerName.includes("switch")) subCategory = "electrical";
              else if (lowerName.includes("sanitary") || lowerName.includes("cp")) subCategory = "sanitary";
              else if (lowerName.includes("lock") || lowerName.includes("handle")) subCategory = "locks";
              else if (lowerName.includes("rmc") || lowerName.includes("ready mix")) subCategory = "rmc";
              
              allItems.push({
                id: "supplier_" + p.id,
                category: "supplier",
                subCategory: subCategory,
                type: "supplier",
                name: p.name,
                ownerName: p.ownerName || supplierInfo?.shopName || userName,
                businessName: p.ownerName || supplierInfo?.shopName || userName,
                ownerPhone: p.ownerPhone || userPhone,
                phone: p.ownerPhone || userPhone,
                location: p.location || (supplierInfo?.address ? supplierInfo.address.split(",")[0] : "Bengaluru"),
                price: p.price,
                unit: p.unit,
                priceRange: "₹" + p.price + " per " + p.unit,
                rating: p.rating || 4.0,
                isVerified: true,
                description: p.description || "Quality construction material",
                image: getProductImage(p.name),
                availablePincodes: p.availablePincodes || ["560062", "560108"],
                userId: userId
              });
            });
          }
        } catch (e) {}
      });

      var realEstateData = localStorage.getItem("realEstateProperties");
      if (realEstateData) {
        var properties = JSON.parse(realEstateData);
        properties.forEach(function(p) {
          var subCategory = "all";
          var type = (p.type || "").toLowerCase();
          if (type.includes("villa")) subCategory = "villa";
          else if (type.includes("commercial")) subCategory = "commercial";
          else if (type.includes("plot") || type.includes("land")) subCategory = "plot";
          else if (type.includes("agriculture")) subCategory = "agriculture";
          else if (type.includes("industrial")) subCategory = "industrial";
          else if (type.includes("revenue")) subCategory = "revenue";
          else if (type.includes("bmrda")) subCategory = "bmrda";
          
          allItems.push({
            id: "realestate_" + p.id,
            category: "realestate",
            subCategory: subCategory,
            type: "realestate",
            name: p.title,
            businessName: p.title,
            ownerName: "Real Estate Agent",
            phone: p.contactNumber || "+919876543210",
            location: p.location || "Bengaluru",
            price: p.totalAmount || 0,
            priceRange: formatPrice(p.totalAmount || 0),
            rating: 4.5,
            isVerified: true,
            description: p.description || (p.type || "Property") + " property available",
            image: getPropertyImage(p.type),
            propertyType: p.type,
            totalArea: p.totalArea || p.plotArea || 0,
            bedrooms: p.bedrooms || p.bhk || 0,
            bathrooms: p.bathrooms || p.toilets || 0,
            status: p.status || "Available",
            availablePincodes: ["560062", "560108"]
          });
        });
      }

      var demoContractors = [
        { id: "demo_contractor_1", name: "Sharma Constructions", owner: "Rajesh Sharma", phone: "+919876543216", location: "Bengaluru", rating: 4.7, desc: "25+ years experience", sub: "civil" },
        { id: "demo_contractor_2", name: "Green Valley Builders", owner: "Nitin Gupta", phone: "+919876543217", location: "Bengaluru", rating: 4.8, desc: "Eco-friendly construction", sub: "civil" },
        { id: "demo_contractor_3", name: "Elite Electricals", owner: "Amit Patel", phone: "+919876543218", location: "Bengaluru", rating: 4.6, desc: "Electrical works", sub: "electrical" },
        { id: "demo_contractor_4", name: "Precision Plumbers", owner: "Suresh Kumar", phone: "+919876543219", location: "Bengaluru", rating: 4.5, desc: "Plumbing services", sub: "plumbing" },
        { id: "demo_contractor_5", name: "Fine Finish Painters", owner: "Manoj Singh", phone: "+919876543220", location: "Bengaluru", rating: 4.4, desc: "Painting services", sub: "painter" }
      ];
      demoContractors.forEach(function(d) {
        allItems.push({
          id: d.id,
          category: "contractor",
          subCategory: d.sub,
          type: "contractor",
          name: d.name,
          businessName: d.name,
          ownerName: d.owner,
          phone: d.phone,
          location: d.location,
          priceRange: "₹1800 - ₹2200 per sq.ft",
          rating: d.rating,
          isVerified: true,
          description: d.desc,
          image: "🏗️",
          availablePincodes: ["560062", "560108"]
        });
      });

      var demoMachinery = [
        { id: "demo_machinery_1", name: "JCB Rentals", owner: "Manoj Kumar", phone: "+919876543221", location: "Bengaluru", rating: 4.4, desc: "JCB 3DX available", sub: "jcb" },
        { id: "demo_machinery_2", name: "Concrete Pump Rental", owner: "Vikram Singh", phone: "+919876543222", location: "Bengaluru", rating: 4.7, desc: "Latest concrete pumps", sub: "concretepump" },
        { id: "demo_machinery_3", name: "Excavator Services", owner: "Ravi Kumar", phone: "+919876543223", location: "Bengaluru", rating: 4.5, desc: "Excavator for hire", sub: "excavator" },
        { id: "demo_machinery_4", name: "Crane Rental", owner: "Suresh Reddy", phone: "+919876543224", location: "Bengaluru", rating: 4.6, desc: "Cranes available", sub: "crane" }
      ];
      demoMachinery.forEach(function(d) {
        allItems.push({
          id: d.id,
          category: "machinery",
          subCategory: d.sub,
          type: "machinery",
          name: d.name,
          businessName: d.name,
          ownerName: d.owner,
          phone: d.phone,
          location: d.location,
          priceRange: "₹800 - ₹1500 per hour",
          rating: d.rating,
          isVerified: true,
          description: d.desc,
          image: "🚜",
          availablePincodes: ["560062", "560108"]
        });
      });

      var demoLabour = [
        { id: "demo_labour_1", name: "SK Labour Supply", owner: "Suresh Kumar", phone: "+919876543225", location: "Bengaluru", rating: 4.3, desc: "Masons available", sub: "mason" },
        { id: "demo_labour_2", name: "Bangalore Labour Supply", owner: "Hitesh Patel", phone: "+919876543226", location: "Bengaluru", rating: 4.5, desc: "Steel Fixers available", sub: "barbender" },
        { id: "demo_labour_3", name: "Elite Electricians", owner: "Rajesh Kumar", phone: "+919876543227", location: "Bengaluru", rating: 4.4, desc: "Electricians available", sub: "electrician" },
        { id: "demo_labour_4", name: "Prime Plumbers", owner: "Manoj Singh", phone: "+919876543228", location: "Bengaluru", rating: 4.2, desc: "Plumbers available", sub: "plumber" },
        { id: "demo_labour_5", name: "Perfect Painters", owner: "Amit Patel", phone: "+919876543229", location: "Bengaluru", rating: 4.3, desc: "Painters available", sub: "painter" }
      ];
      demoLabour.forEach(function(d) {
        allItems.push({
          id: d.id,
          category: "labour",
          subCategory: d.sub,
          type: "labour",
          name: d.name,
          businessName: d.name,
          ownerName: d.owner,
          phone: d.phone,
          location: d.location,
          priceRange: "₹700 - ₹1500 per day",
          rating: d.rating,
          isVerified: true,
          description: d.desc,
          image: "👷",
          availablePincodes: ["560062", "560108"]
        });
      });

      console.log("✅ Total marketplace items:", allItems.length);
      setProducts(allItems);
      setLoading(false);
    } catch (error) {
      console.error("Error loading marketplace data:", error);
      setLoading(false);
    }
  }

  function getProductImage(name) {
    var lower = (name || "").toLowerCase();
    if (lower.includes("cement")) return "🏭";
    if (lower.includes("steel") || lower.includes("tmt")) return "⚙️";
    if (lower.includes("brick")) return "🧱";
    if (lower.includes("sand")) return "🏖️";
    if (lower.includes("aggregate")) return "🪨";
    if (lower.includes("paint")) return "🎨";
    if (lower.includes("tile")) return "⬜";
    if (lower.includes("pipe")) return "🔧";
    if (lower.includes("wood")) return "🪵";
    if (lower.includes("door")) return "🚪";
    if (lower.includes("lock")) return "🔒";
    if (lower.includes("wire") || lower.includes("switch")) return "⚡";
    return "📦";
  }

  function getPropertyImage(type) {
    var images = {
      "Plot": "📐",
      "Apartment": "🏢",
      "Villa": "🏡",
      "Commercial": "🏪",
      "Land": "🌾",
      "default": "🏠"
    };
    return images[type] || images.default;
  }

  function formatPrice(price) {
    if (price >= 10000000) return "₹" + (price/10000000).toFixed(1) + "Cr";
    if (price >= 100000) return "₹" + (price/100000).toFixed(1) + "L";
    return "₹" + price.toLocaleString();
  }

  function checkPincodeServiceability(pincode) {
    if (serviceablePincodes.includes(pincode)) {
      setPincodeError("");
      setPincodeVerified(true);
      return true;
    } else {
      setPincodeError("📍 Service not yet available in pincode " + pincode + ". We are expanding soon!");
      setPincodeVerified(false);
      return false;
    }
  }

  function handlePincodeChange(e) {
    var value = e.target.value;
    setPincode(value);
    if (value.length === 6) {
      checkPincodeServiceability(value);
    } else {
      setPincodeError("");
      setPincodeVerified(false);
    }
  }

  function getSubCategories() {
    if (selectedCategory === "all") return [];
    return subCategories[selectedCategory] || [];
  }

  useEffect(function() {
    if (!isClient) return;
    function handleStorageChange() {
      loadAllMarketplaceData();
    }
    window.addEventListener("storage", handleStorageChange);
    return function() { window.removeEventListener("storage", handleStorageChange); };
  }, [isClient]);

  var categories = [
    { id: "all", name: "All", icon: "🏠" },
    { id: "supplier", name: "Suppliers", icon: "📦" },
    { id: "contractor", name: "Contractors", icon: "🏗️" },
    { id: "machinery", name: "Machinery", icon: "🚜" },
    { id: "labour", name: "Labours", icon: "👷" },
    { id: "realestate", name: "Real Estate", icon: "🏡" }
  ];

  var cities = ["all", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Kerala", "Pune", "Delhi"];

  var filteredItems = products.filter(function(item) {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (selectedSubCategory !== "all" && item.subCategory !== selectedSubCategory) return false;
    if (searchTerm && !(item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(item.description || "").toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCity !== "all" && !(item.location || "").toLowerCase().includes(selectedCity.toLowerCase())) return false;
    if (pincode && pincode.length === 6 && pincodeVerified) {
      if (!(item.availablePincodes || []).includes(pincode)) return false;
    }
    return true;
  });

  function openWhatsApp(item) {
    if (!enquiryData.name || !enquiryData.phone || !enquiryData.quantity) {
      alert("Please fill your name, phone number and requirement");
      return;
    }
    
    if (!pincodeVerified) {
      alert("📍 Please enter a valid serviceable pincode first");
      return;
    }
    
    var phoneNumber = item.phone || "+919876543210";
    phoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('91')) {
        phoneNumber = '+' + phoneNumber;
      } else {
        phoneNumber = '+91' + phoneNumber;
      }
    }
    
    var message = "Hello " + (item.businessName || item.name) + ",%0A%0A📋 NEW ENQUIRY FROM MARKETPLACE%0A%0A👤 Customer Name: " + enquiryData.name + "%0A📞 Phone: " + enquiryData.phone + "%0A📍 Location: " + (enquiryData.location || "Not specified") + "%0A📮 Pincode: " + pincode + "%0A📊 Requirement: " + enquiryData.quantity + "%0A📝 Additional Details: " + (enquiryData.requirement || "None") + "%0A%0A";
    
    if (item.category === "realestate") {
      message += "🏡 Property: " + item.name + "%0A💰 Price: " + item.priceRange + "%0A📐 Area: " + (item.totalArea || "N/A") + " sq.ft%0A🛏️ Bedrooms: " + (item.bedrooms || "N/A") + "%0A🛁 Bathrooms: " + (item.bathrooms || "N/A") + "%0A📋 Status: " + (item.status || "Available") + "%0A📍 Location: " + item.location + "%0A";
    } else {
      message += "📦 Product/Service: " + item.name + "%0A💰 Price: " + (item.priceRange || "Contact for pricing") + "%0A📍 Location: " + item.location + "%0A";
    }
    
    message += "%0A---%0AFrom: BuildTrack Marketplace";
    
    window.open("https://wa.me/" + phoneNumber + "?text=" + message, "_blank");
    setShowEnquiryModal(false);
    setEnquiryData({ name: "", phone: "", location: "", quantity: "", requirement: "" });
    alert("✅ Enquiry sent!");
  }

  function openEnquiryModal(item) {
    if (!pincodeVerified) {
      alert("📍 Please enter a valid serviceable pincode first");
      return;
    }
    setSelectedItem(item);
    setShowEnquiryModal(true);
  }

  function openProfileModal(item) {
    setSelectedItem(item);
    setShowProfileModal(true);
  }

  function renderStars(rating) {
    return "⭐".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  }

  var styles = {
    container: { padding: "20px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#1a5f7a", color: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
    headerSub: { margin: "5px 0 0", fontSize: "12px", opacity: 0.9 },
    locationBar: { backgroundColor: "white", padding: "12px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" },
    pincodeInput: { width: "150px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", textAlign: "center" },
    warningMessage: { backgroundColor: "#fff3cd", border: "1px solid #ffc107", padding: "12px", borderRadius: "8px", color: "#856404", marginTop: "8px" },
    searchBar: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
    searchInput: { flex: 1, padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" },
    select: { padding: "10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", minWidth: "150px" },
    categoryContainer: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
    categoryBtn: { padding: "10px 24px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontWeight: "500" },
    categoryBtnActive: { backgroundColor: "#1a5f7a", color: "white", border: "none" },
    subCategoryContainer: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", padding: "8px 0" },
    subCategoryBtn: { padding: "6px 16px", backgroundColor: "#f0f2f5", border: "1px solid #ddd", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "500" },
    subCategoryBtnActive: { backgroundColor: "#1a5f7a", color: "white", border: "none" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    badge: { display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "500", marginRight: "8px" },
    verifiedBadge: { backgroundColor: "#d1fae5", color: "#065f46" },
    button: { backgroundColor: "#25D366", color: "white", padding: "10px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: "100%", marginTop: "8px" },
    buttonOutline: { backgroundColor: "#1a5f7a", color: "white", padding: "10px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: "100%", marginTop: "8px" },
    loading: { textAlign: "center", padding: "60px", fontSize: "18px", color: "#666" },
    rating: { color: "#f59e0b", fontSize: "14px" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "550px", maxHeight: "85vh", overflow: "auto" },
    input: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "12px", color: "#333" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
    profileSection: { marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #eee" },
    supplierName: { fontSize: "16px", fontWeight: "bold", color: "#1a5f7a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" },
    realEstateBadge: { backgroundColor: "#dbeafe", color: "#1a56db", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "500", display: "inline-block", marginLeft: "8px" },
    pincodeVerifiedBadge: { backgroundColor: "#d1fae5", color: "#065f46", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", display: "inline-block", marginLeft: "8px" }
  };

  if (!isClient || loading) {
    return React.createElement("div", { style: styles.container },
      React.createElement("div", { style: styles.loading }, loading ? "Loading marketplace..." : "Loading...")
    );
  }

  var subCategoriesList = getSubCategories();

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "🏪 BuildTrack Marketplace"),
        React.createElement("p", { style: styles.headerSub }, "Connect with verified suppliers, contractors, machinery, labour, and real estate")
      ),
      React.createElement("button", { onClick: function() { window.location.href = "/"; }, style: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" } }, "🚪 Exit")
    ),

    React.createElement("div", { style: styles.locationBar },
      React.createElement("span", { style: { fontWeight: "bold" } }, "📍 Enter Pincode to Search (Mandatory):"),
      React.createElement("input", {
        type: "text",
        placeholder: "Enter 6-digit pincode",
        value: pincode,
        onChange: handlePincodeChange,
        maxLength: 6,
        style: styles.pincodeInput
      }),
      pincode && pincodeVerified && React.createElement("span", { style: styles.pincodeVerifiedBadge }, "✅ Service available!"),
      pincode && !pincodeVerified && pincode.length === 6 && 
        React.createElement("div", { style: styles.warningMessage }, "📍 Service not yet available in pincode ", pincode, ". We are expanding soon!")
    ),

    React.createElement("div", { style: styles.searchBar },
      React.createElement("input", {
        type: "text",
        placeholder: "🔍 Search by business, product, location...",
        value: searchTerm,
        onChange: function(e) { setSearchTerm(e.target.value); },
        style: styles.searchInput
      }),
      React.createElement("select", {
        value: selectedCity,
        onChange: function(e) { setSelectedCity(e.target.value); },
        style: styles.select
      },
        cities.map(function(city) { return React.createElement("option", { key: city, value: city }, city === "all" ? "All Cities" : city); })
      )
    ),

    React.createElement("div", { style: styles.categoryContainer },
      categories.map(function(cat) {
        return React.createElement("button", {
          key: cat.id,
          onClick: function() {
            setSelectedCategory(cat.id);
            setSelectedSubCategory("all");
          },
          style: { ...styles.categoryBtn, ...(selectedCategory === cat.id ? styles.categoryBtnActive : {}) }
        }, cat.icon, " ", cat.name);
      })
    ),

    subCategoriesList.length > 0 && React.createElement("div", { style: styles.subCategoryContainer },
      subCategoriesList.map(function(sub) {
        return React.createElement("button", {
          key: sub.id,
          onClick: function() { setSelectedSubCategory(sub.id); },
          style: { ...styles.subCategoryBtn, ...(selectedSubCategory === sub.id ? styles.subCategoryBtnActive : {}) }
        }, sub.name);
      })
    ),

    filteredItems.length === 0 ?
      React.createElement("div", { style: { textAlign: "center", padding: "60px", color: "#666" } }, 
        pincodeVerified ? "No listings found in your area." : "Please enter a valid pincode to see listings.") :
      React.createElement("div", { style: styles.grid },
        filteredItems.map(function(item) {
          var isRealEstate = item.category === "realestate";
          var productImage = item.image || getProductImage(item.name);
          
          return React.createElement("div", { key: item.id, style: styles.card },
            React.createElement("div", { style: styles.supplierName },
              "🏢 ", item.ownerName || item.businessName || item.name,
              isRealEstate && React.createElement("span", { style: styles.realEstateBadge }, "🏠 Real Estate")
            ),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" } },
              React.createElement("div", null,
                React.createElement("span", { style: { ...styles.badge, ...styles.verifiedBadge } }, item.isVerified ? "✅ Verified" : "🔄 Pending"),
                React.createElement("span", { style: { ...styles.badge, backgroundColor: "#e0e7ff", color: "#3730a3" } }, 
                  item.category === "supplier" ? "🏷️ Supplier" : 
                  item.category === "contractor" ? "🏗️ Contractor" : 
                  item.category === "machinery" ? "🚜 Machinery" : 
                  item.category === "labour" ? "👷 Labour" : "🏡 Real Estate")
              ),
              React.createElement("div", { style: styles.rating }, renderStars(item.rating), " ", item.rating)
            ),
            
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" } },
              React.createElement("div", { style: { fontSize: "40px" } }, productImage),
              React.createElement("div", null,
                React.createElement("h3", { style: { margin: "0 0 4px 0" } }, item.name),
                React.createElement("p", { style: { margin: 0, fontSize: "11px", color: "#666" } }, 
                  (item.description || "").substring(0, 60) || "Available"
                )
              )
            ),
            
            React.createElement("p", { style: { fontSize: "18px", fontWeight: "bold", color: "#1a5f7a", margin: "8px 0" } }, 
              item.priceRange || "Contact for pricing"
            ),
            React.createElement("p", { style: { margin: "4px 0", fontSize: "12px" } }, "📍 ", item.location),
            React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "12px" } },
              React.createElement("button", { onClick: function() { openProfileModal(item); }, style: { ...styles.buttonOutline, padding: "8px" } }, "👁️ Profile"),
              React.createElement("button", { onClick: function() { openEnquiryModal(item); }, style: { ...styles.button, padding: "8px" } }, "💬 Enquiry")
            )
          );
        })
      ),

    showProfileModal && selectedItem && React.createElement("div", { style: styles.modal, onClick: function() { setShowProfileModal(false); } },
      React.createElement("div", { style: styles.modalContent, onClick: function(e) { e.stopPropagation(); } },
        React.createElement("div", { style: { textAlign: "center", marginBottom: "20px" } },
          React.createElement("div", { style: { fontSize: "60px" } }, selectedItem.image || getProductImage(selectedItem.name)),
          React.createElement("h2", { style: { margin: "8px 0 4px" } }, selectedItem.businessName || selectedItem.name),
          React.createElement("div", { style: styles.rating }, renderStars(selectedItem.rating), " ", selectedItem.rating),
          React.createElement("span", { style: { ...styles.badge, ...styles.verifiedBadge, marginTop: "8px", display: "inline-block" } }, selectedItem.isVerified ? "✅ Verified" : "🔄 Pending")
        ),
        React.createElement("div", { style: styles.profileSection },
          React.createElement("h3", { style: { margin: "0 0 12px 0" } }, "📋 Business Details"),
          React.createElement("p", null, React.createElement("strong", null, "Business:"), " ", selectedItem.businessName || selectedItem.name),
          React.createElement("p", null, React.createElement("strong", null, "Owner:"), " ", selectedItem.ownerName || "Not specified"),
          React.createElement("p", null, React.createElement("strong", null, "📞 Phone:"), " ", selectedItem.phone || "Not specified"),
          React.createElement("p", null, React.createElement("strong", null, "📍 Location:"), " ", selectedItem.location || "Not specified"),
          React.createElement("p", null, React.createElement("strong", null, "📋 Description:"), " ", selectedItem.description || "No description available"),
          selectedItem.category === "realestate" && React.createElement(React.Fragment, null,
            React.createElement("p", null, React.createElement("strong", null, "🏡 Property Type:"), " ", selectedItem.propertyType),
            React.createElement("p", null, React.createElement("strong", null, "📐 Area:"), " ", selectedItem.totalArea || "N/A", " sq.ft"),
            React.createElement("p", null, React.createElement("strong", null, "🛏️ Bedrooms:"), " ", selectedItem.bedrooms || "N/A"),
            React.createElement("p", null, React.createElement("strong", null, "🛁 Bathrooms:"), " ", selectedItem.bathrooms || "N/A"),
            React.createElement("p", null, React.createElement("strong", null, "📋 Status:"), " ", selectedItem.status || "Available")
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: "12px", marginTop: "20px" } },
          React.createElement("button", { onClick: function() { setShowProfileModal(false); openEnquiryModal(selectedItem); }, style: { ...styles.buttonOutline, flex: 1 } }, "📞 Send Enquiry"),
          React.createElement("button", { onClick: function() { setShowProfileModal(false); }, style: { ...styles.button, flex: 1, backgroundColor: "#6c757d" } }, "Close")
        )
      )
    ),

    showEnquiryModal && selectedItem && React.createElement("div", { style: styles.modal, onClick: function() { setShowEnquiryModal(false); } },
      React.createElement("div", { style: styles.modalContent, onClick: function(e) { e.stopPropagation(); } },
        React.createElement("h2", { style: { color: "#1a5f7a", marginBottom: "16px" } }, "Send Enquiry to ", selectedItem.businessName || selectedItem.name),
        React.createElement("div", { style: { backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px", marginBottom: "16px" } },
          React.createElement("p", { style: { margin: "4px 0" } }, "⭐ Rating: ", renderStars(selectedItem.rating), " (", selectedItem.rating, ")"),
          React.createElement("p", { style: { margin: "4px 0" } }, "📍 ", selectedItem.location),
          React.createElement("p", { style: { margin: "4px 0" } }, "💰 ", selectedItem.priceRange || "Contact for pricing")
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Your Name *"),
          React.createElement("input", { type: "text", placeholder: "Enter your name", value: enquiryData.name, onChange: function(e) { setEnquiryData({...enquiryData, name: e.target.value}); }, style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Phone Number *"),
            React.createElement("input", { type: "tel", placeholder: "Your mobile number", value: enquiryData.phone, onChange: function(e) { setEnquiryData({...enquiryData, phone: e.target.value}); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Location"),
            React.createElement("input", { type: "text", placeholder: "Your city", value: enquiryData.location, onChange: function(e) { setEnquiryData({...enquiryData, location: e.target.value}); }, style: styles.input })
          )
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Requirement *"),
          React.createElement("input", { type: "text", placeholder: "e.g., 500 bags, 1000 sq.ft, 10 labours", value: enquiryData.quantity, onChange: function(e) { setEnquiryData({...enquiryData, quantity: e.target.value}); }, style: styles.input })
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Additional Details"),
          React.createElement("textarea", { placeholder: "Any specific requirements...", value: enquiryData.requirement, onChange: function(e) { setEnquiryData({...enquiryData, requirement: e.target.value}); }, style: { ...styles.input, minHeight: "80px" } })
        ),
        React.createElement("button", { onClick: function() { openWhatsApp(selectedItem); }, style: { ...styles.button, marginTop: "16px" } }, "💬 Send Enquiry via WhatsApp")
      )
    )
  );
}
