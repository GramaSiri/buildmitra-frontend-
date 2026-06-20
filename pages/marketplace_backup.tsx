import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("all");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [enquiryData, setEnquiryData] = useState({ 
    name: "", 
    phone: "", 
    location: "", 
    quantity: "", 
    requirement: "" 
  });

  // Cities with their pincodes
  const cities = [
    { name: "Mumbai", pincodes: ["400001", "400002", "400003", "400004", "400005", "400006", "400007", "400008", "400009", "400010", "400020", "400030", "400040", "400050", "400060", "400070", "400080", "400090", "400100"] },
    { name: "Bengaluru", pincodes: ["560001", "560002", "560003", "560004", "560005", "560006", "560007", "560008", "560009", "560010", "560062", "560068", "560070", "560076", "560078", "560085", "560091", "560102", "560103", "560108"] },
    { name: "Chennai", pincodes: ["600001", "600002", "600003", "600004", "600005", "600006", "600007", "600008", "600009", "600010", "600020", "600028", "600032", "600034", "600040", "600041", "600042", "600044", "600045", "600048"] },
    { name: "Hyderabad", pincodes: ["500001", "500002", "500003", "500004", "500005", "500006", "500007", "500008", "500009", "500010", "500016", "500018", "500020", "500022", "500024", "500026", "500028", "500030", "500032", "500034"] },
    { name: "Kerala", pincodes: ["682001", "682002", "682003", "682004", "682005", "682006", "682007", "682008", "682009", "682010", "682011", "682012", "682013", "682014", "682015", "682016", "682017", "682018", "682019", "682020"] }
  ];

  // Serviceable pincodes (Admin controlled) - Activated specific pincodes
  const [serviceablePincodes, setServiceablePincodes] = useState([
    // Mumbai pincodes
    "400001", "400002", "400003", "400004", "400005", "400006", "400007", "400008", "400009", "400010",
    "400020", "400030", "400040", "400050", "400060", "400070", "400080", "400090", "400100",
    // Bengaluru pincodes (Activated specific ones)
    "560062", "560108", "560001", "560002", "560003", "560004", "560005", "560006", "560007", "560008",
    // Chennai pincodes
    "600001", "600002", "600003", "600004", "600005", "600006", "600007", "600008", "600009", "600010",
    // Hyderabad pincodes
    "500001", "500002", "500003", "500004", "500005", "500006", "500007", "500008", "500009", "500010",
    // Kerala pincodes
    "682001", "682002", "682003", "682004", "682005", "682006", "682007", "682008", "682009", "682010"
  ]);

  const [showPincodeWarning, setShowPincodeWarning] = useState(false);
  const [requestedPincode, setRequestedPincode] = useState("");

  // All Marketplace Listings
  const [listings, setListings] = useState({
    suppliers: [
      { 
        id: 1, 
        category: "supplier", 
        businessName: "UltraTech Cement Suppliers", 
        ownerName: "Rajesh Sharma",
        phone: "+919876543210",
        alternatePhone: "+919876543211",
        email: "contact@ultratech.com",
        location: "Mumbai",
        city: "Mumbai",
        pincode: "400001",
        rating: 4.8,
        totalReviews: 245,
        since: "2010",
        products: ["UltraTech Cement", "53 Grade Cement", "PPC Cement"],
        priceRange: "₹380 - ₹450 per bag",
        offer: "10% off on bulk orders (500+ bags)",
        isVerified: true,
        logo: null,
        gstNo: "27AAACS1234A1Z",
        description: "Authorized dealer of UltraTech Cement. Supply across Mumbai & Thane.",
        availablePincodes: ["400001", "400002", "400003", "400004", "400005", "560062", "560108"]
      },
      {
        id: 2,
        category: "supplier",
        businessName: "Tata Steel Distributors",
        ownerName: "Amit Patel",
        phone: "+919876543212",
        alternatePhone: "+919876543213",
        email: "amit@tatasteel.com",
        location: "Mumbai",
        city: "Mumbai",
        pincode: "400001",
        rating: 4.9,
        totalReviews: 189,
        since: "2012",
        products: ["TMT Steel Fe500", "TMT Steel Fe550", "Structural Steel"],
        priceRange: "₹58 - ₹65 per kg",
        offer: "Free delivery on orders above 5000 kg",
        isVerified: true,
        logo: null,
        gstNo: "27AAACS1234A2Z",
        description: "Premium quality steel for construction",
        availablePincodes: ["400001", "400002", "400003", "400004", "400005", "560062", "560108"]
      },
      {
        id: 3,
        category: "supplier",
        businessName: "Bangalore Cement Suppliers",
        ownerName: "Suresh Mehta",
        phone: "+919876543214",
        alternatePhone: "+919876543215",
        email: "suresh@banglorecement.com",
        location: "Bengaluru",
        city: "Bengaluru",
        pincode: "560062",
        rating: 4.7,
        totalReviews: 156,
        since: "2015",
        products: ["ACC Cement", "UltraTech Cement", "Ramco Cement"],
        priceRange: "₹370 - ₹430 per bag",
        offer: "5% off on first order",
        isVerified: true,
        logo: null,
        gstNo: "29AAACS1234A3Z",
        description: "Leading cement supplier in Bengaluru",
        availablePincodes: ["560062", "560108", "560001", "560002", "560003"]
      }
    ],
    contractors: [
      {
        id: 101,
        category: "contractor",
        businessName: "Sharma Constructions",
        ownerName: "Rajesh Sharma",
        phone: "+919876543216",
        alternatePhone: "+919876543217",
        email: "rajesh@sharmaconstructions.com",
        location: "Mumbai",
        city: "Mumbai",
        pincode: "400001",
        rating: 4.7,
        totalReviews: 89,
        since: "2010",
        services: ["Residential Construction", "Commercial Building", "Renovation"],
        priceRange: "₹1800 - ₹2200 per sq.ft",
        offer: "Free site visit & estimate",
        isVerified: true,
        completedProjects: 45,
        logo: null,
        gstNo: "27AAACS1234A4Z",
        description: "25+ years experience in construction",
        availablePincodes: ["400001", "400002", "400003", "400004", "400005", "400006", "400007", "560062", "560108"]
      },
      {
        id: 102,
        category: "contractor",
        businessName: "Bangalore Builders",
        ownerName: "Nitin Gupta",
        phone: "+919876543218",
        alternatePhone: "+919876543219",
        email: "nitin@bangalorebuilders.com",
        location: "Bengaluru",
        city: "Bengaluru",
        pincode: "560062",
        rating: 4.8,
        totalReviews: 112,
        since: "2012",
        services: ["Villa Construction", "Apartment Complex", "Commercial Space"],
        priceRange: "₹1900 - ₹2400 per sq.ft",
        offer: "10% off on interiors",
        isVerified: true,
        completedProjects: 38,
        logo: null,
        gstNo: "29AAACS1234A5Z",
        description: "Premium builder in Bengaluru",
        availablePincodes: ["560062", "560108", "560001", "560002", "560003", "560004", "560005"]
      }
    ],
    machinery: [
      {
        id: 201,
        category: "machinery",
        businessName: "JCB Rentals",
        ownerName: "Manoj Kumar",
        phone: "+919876543220",
        alternatePhone: "+919876543221",
        email: "manoj@jcbrentals.com",
        location: "Mumbai",
        city: "Mumbai",
        pincode: "400001",
        rating: 4.4,
        totalReviews: 56,
        since: "2015",
        equipment: ["JCB 3DX", "Excavator", "Loader", "Backhoe"],
        priceRange: "₹800 - ₹1500 per hour",
        offer: "10% off on weekly rental",
        isVerified: true,
        logo: null,
        gstNo: "27AAACS1234A6Z",
        description: "Well-maintained JCB machines with operators",
        availablePincodes: ["400001", "400002", "400003", "400004", "400005", "560062", "560108"]
      }
    ],
    labours: [
      {
        id: 301,
        category: "labour",
        businessName: "SK Labour Supply",
        ownerName: "Suresh Kumar",
        phone: "+919876543224",
        alternatePhone: "+919876543225",
        email: "suresh@sklabour.com",
        location: "Mumbai",
        city: "Mumbai",
        pincode: "400001",
        rating: 4.3,
        totalReviews: 78,
        since: "2016",
        labourTypes: ["Masons", "Carpenters", "Helpers", "Electricians", "Plumbers"],
        priceRange: "₹800 - ₹1500 per day",
        offer: "5% off on 10+ labours",
        isVerified: true,
        totalLabours: 150,
        logo: null,
        gstNo: "27AAACS1234A8Z",
        description: "Skilled and semi-skilled labour available",
        availablePincodes: ["400001", "400002", "400003", "400004", "400005", "560062", "560108"]
      },
      {
        id: 302,
        category: "labour",
        businessName: "Bangalore Labour Supply",
        ownerName: "Hitesh Patel",
        phone: "+919876543226",
        alternatePhone: "+919876543227",
        email: "hitesh@bangalorelabour.com",
        location: "Bengaluru",
        city: "Bengaluru",
        pincode: "560062",
        rating: 4.5,
        totalReviews: 45,
        since: "2014",
        labourTypes: ["Masons", "Helpers", "Steel Fixers", "Shuttering Carpenters"],
        priceRange: "₹700 - ₹1200 per day",
        offer: "Free safety equipment",
        isVerified: true,
        totalLabours: 200,
        logo: null,
        gstNo: "29AAACS1234A9Z",
        description: "Professional labour for construction sites",
        availablePincodes: ["560062", "560108", "560001", "560002", "560003", "560004"]
      }
    ]
  });

  const [offers, setOffers] = useState([
    { id: 1, businessName: "UltraTech Cement", discount: "10% OFF", validTill: "2024-12-31", code: "CEMENT10", category: "supplier", phone: "+919876543210" },
    { id: 2, businessName: "Sharma Constructions", discount: "Free Site Visit", validTill: "2024-12-31", code: "FREESITE", category: "contractor", phone: "+919876543216" },
    { id: 3, businessName: "Bangalore Builders", discount: "15% OFF", validTill: "2024-11-30", code: "BLR15", category: "contractor", phone: "+919876543218" }
  ]);

  // Load products from localStorage (from supplier dashboard)
  useEffect(() => {
    const loadSupplierProducts = () => {
      try {
        // Check multiple possible storage keys
        const savedProducts = localStorage.getItem("supplierProducts") || 
                            localStorage.getItem("products") || 
                            sessionStorage.getItem("supplierProducts");
        
        if (savedProducts) {
          const products = JSON.parse(savedProducts);
          console.log("Loaded products from storage:", products.length);
          
          const supplierListings = products.map((p, index) => ({
            id: 1000 + index,
            category: "supplier",
            businessName: p.name || p.productName || "Construction Material",
            ownerName: "Verified Supplier",
            phone: p.phone || "+919876543210",
            alternatePhone: p.alternatePhone || "",
            email: p.email || "supplier@buildtrack.com",
            location: p.location || "Mumbai",
            city: p.city || "Mumbai",
            pincode: p.pincode || "400001",
            rating: p.rating || 4.0,
            totalReviews: p.reviews || 0,
            since: "2024",
            products: [p.name || p.productName],
            priceRange: `₹${p.price || 0} per ${p.unit || "unit"}`,
            offer: p.offer || "New arrival",
            isVerified: p.isVerified || false,
            logo: null,
            description: p.description || "Construction material supplier",
            availablePincodes: p.availablePincodes || ["400001", "400002", "400003", "560062", "560108"]
          }));
          
          setListings(prev => ({
            ...prev,
            suppliers: [...prev.suppliers, ...supplierListings]
          }));
        } else {
          // Add demo products if no products in storage
          const demoProducts = [
            { name: "Premium Cement", price: 380, unit: "bag", description: "Best quality OPC 53 Grade Cement", phone: "+919876543210", location: "Bengaluru", city: "Bengaluru", pincode: "560062" },
            { name: "TMT Steel Bars", price: 62, unit: "kg", description: "Fe500D Earthquake resistant steel", phone: "+919876543211", location: "Bengaluru", city: "Bengaluru", pincode: "560062" },
            { name: "Red Bricks", price: 9, unit: "piece", description: "High quality clay bricks", phone: "+919876543212", location: "Bengaluru", city: "Bengaluru", pincode: "560062" },
            { name: "Construction Sand", price: 55, unit: "cft", description: "River sand for construction", phone: "+919876543213", location: "Bengaluru", city: "Bengaluru", pincode: "560062" },
            { name: "20mm Aggregate", price: 45, unit: "cft", description: "Crushed stone aggregate", phone: "+919876543214", location: "Bengaluru", city: "Bengaluru", pincode: "560062" }
          ];
          
          const demoListings = demoProducts.map((p, index) => ({
            id: 1000 + index,
            category: "supplier",
            businessName: p.name,
            ownerName: "Demo Supplier",
            phone: p.phone,
            email: "demo@buildtrack.com",
            location: p.location,
            city: p.city,
            pincode: p.pincode,
            rating: 4.2,
            totalReviews: 25,
            since: "2024",
            products: [p.name],
            priceRange: `₹${p.price} per ${p.unit}`,
            offer: "New in marketplace",
            isVerified: true,
            description: p.description,
            availablePincodes: ["560062", "560108", "400001", "400002", "600001"]
          }));
          
          setListings(prev => ({
            ...prev,
            suppliers: [...prev.suppliers, ...demoListings]
          }));
        }
      } catch (error) {
        console.error("Error loading supplier products:", error);
      }
    };
    
    loadSupplierProducts();
  }, []);

  const styles = {
    container: { padding: "20px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#1a5f7a", color: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
    headerSub: { margin: "5px 0 0", fontSize: "12px", opacity: 0.9 },
    locationBar: { backgroundColor: "white", padding: "12px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" },
    citySelect: { padding: "10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", minWidth: "150px" },
    pincodeInput: { width: "150px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", textAlign: "center" },
    searchBar: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
    searchInput: { flex: 1, padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" },
    categoryContainer: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
    categoryBtn: { padding: "10px 24px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontWeight: "500" },
    categoryBtnActive: { backgroundColor: "#1a5f7a", color: "white", border: "none" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px", marginBottom: "20px" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "transform 0.2s" },
    badge: { display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "500", marginRight: "8px" },
    verifiedBadge: { backgroundColor: "#d1fae5", color: "#065f46" },
    offerBadge: { backgroundColor: "#fed7aa", color: "#92400e" },
    ratingStar: { color: "#f59e0b", fontSize: "14px" },
    button: { backgroundColor: "#25D366", color: "white", padding: "10px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" },
    buttonOutline: { backgroundColor: "#1a5f7a", color: "white", padding: "10px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
    buttonInfo: { backgroundColor: "#6c757d", color: "white", padding: "8px 12px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "28px", width: "90%", maxWidth: "550px", maxHeight: "85vh", overflow: "auto" },
    input: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "12px", color: "#333" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
    offersContainer: { display: "flex", gap: "16px", overflowX: "auto", padding: "8px 0", marginBottom: "20px" },
    offerCard: { minWidth: "250px", backgroundColor: "white", borderRadius: "12px", padding: "16px", border: "2px solid #ffc107", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    warningCard: { backgroundColor: "#fff3cd", border: "1px solid #ffc107", padding: "16px", borderRadius: "12px", marginBottom: "20px", textAlign: "center" }
  };

  const categories = [
    { id: "all", name: "All", icon: "🏠" },
    { id: "supplier", name: "Suppliers", icon: "📦" },
    { id: "contractor", name: "Contractors", icon: "🏗️" },
    { id: "machinery", name: "Machinery", icon: "🚜" },
    { id: "labour", name: "Labours", icon: "👷" },
    { id: "offers", name: "Offers", icon: "🏷️" }
  ];

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setPincode("");
    setPincodeError("");
    const selectedCityData = cities.find(c => c.name === city);
    if (selectedCityData && selectedCityData.pincodes.length > 0) {
      // Auto-select first pincode of the city
      setPincode(selectedCityData.pincodes[0]);
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value;
    setPincode(value);
    setPincodeError("");
    setShowPincodeWarning(false);
    
    if (value.length === 6) {
      if (serviceablePincodes.includes(value)) {
        setPincodeError("");
        // Find city for this pincode
        const foundCity = cities.find(city => city.pincodes.includes(value));
        if (foundCity) {
          setSelectedCity(foundCity.name);
        }
      } else {
        setPincodeError("This pincode is not serviceable yet");
        setShowPincodeWarning(true);
        setRequestedPincode(value);
      }
    }
  };

  const getAllListings = () => {
    return [
      ...listings.suppliers.map(l => ({ ...l, type: "supplier" })),
      ...listings.contractors.map(l => ({ ...l, type: "contractor" })),
      ...listings.machinery.map(l => ({ ...l, type: "machinery" })),
      ...listings.labours.map(l => ({ ...l, type: "labour" }))
    ];
  };

  const getFilteredListings = () => {
    let all = getAllListings();
    
    if (selectedCategory !== "all" && selectedCategory !== "offers") {
      all = all.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm) {
      all = all.filter(item => 
        item.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.products?.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.services?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.equipment?.some(e => e.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.labourTypes?.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by pincode serviceability
    if (pincode && pincode.length === 6 && serviceablePincodes.includes(pincode)) {
      all = all.filter(item => item.availablePincodes?.includes(pincode));
    }
    
    // Filter by city
    if (selectedCity) {
      all = all.filter(item => item.city === selectedCity);
    }
    
    if (sortBy === "rating") {
      all.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "reviews") {
      all.sort((a, b) => b.totalReviews - a.totalReviews);
    }
    
    return all;
  };

  const openWhatsApp = (item, customMessage = null) => {
    const phone = item.phone || (item.category === "offer" ? item.phone : null);
    if (!phone) {
      alert("Phone number not available");
      return;
    }
    
    let message = customMessage;
    if (!message) {
      message = `Hello ${item.businessName || item.name || "Team"},%0A%0A📋 I'm interested in your services.%0A%0A📦 Name: ${enquiryData.name || "Customer"}%0A📍 Location: ${enquiryData.location || selectedCity || "Not specified"}%0A📞 Phone: ${enquiryData.phone || "Not provided"}%0A📊 Requirement: ${enquiryData.quantity || "Need quote"}%0A📝 Details: ${enquiryData.requirement || "Please share your best offer"}%0A%0A👤 From: BuildTrack Marketplace`;
    }
    
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, "_blank");
    setShowProductModal(false);
    setEnquiryData({ name: "", phone: "", location: "", quantity: "", requirement: "" });
  };

  const openEnquiryModal = (item) => {
    if (!serviceablePincodes.includes(pincode) && pincode.length === 6) {
      setShowPincodeWarning(true);
      return;
    }
    setSelectedItem(item);
    setShowProductModal(true);
  };

  const openProfileModal = (item) => {
    setSelectedItem(item);
    setShowProfileModal(true);
  };

  const renderStars = (rating) => {
    return "⭐".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  const renderListingCard = (item) => {
    let details = "";
    let badge = "";
    const isServiceable = item.availablePincodes?.includes(pincode) || !pincode;
    
    if (item.type === "supplier") {
      details = `📦 Products: ${item.products?.slice(0, 3).join(", ")}`;
      badge = "🏷️ Supplier";
    } else if (item.type === "contractor") {
      details = `🏗️ Services: ${item.services?.slice(0, 3).join(", ")}`;
      badge = "🏗️ Contractor";
    } else if (item.type === "machinery") {
      details = `🚜 Equipment: ${item.equipment?.slice(0, 3).join(", ")}`;
      badge = "🚜 Machinery";
    } else {
      details = `👷 Labour: ${item.labourTypes?.slice(0, 3).join(", ")}`;
      badge = "👷 Labour";
    }
    
    return React.createElement("div", { key: item.id, style: { ...styles.card, cursor: "pointer", opacity: isServiceable ? 1 : 0.6 }, onClick: () => openProfileModal(item) },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" } },
        React.createElement("div", null,
          React.createElement("span", { style: { ...styles.badge, ...styles.verifiedBadge } }, item.isVerified ? "✅ Verified" : "🔄 Pending"),
          React.createElement("span", { style: { ...styles.badge, backgroundColor: "#e0e7ff", color: "#3730a3" } }, badge)
        ),
        React.createElement("div", { style: { fontSize: "20px", fontWeight: "bold", color: "#f59e0b" } }, renderStars(item.rating), " ", item.rating)
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" } },
        React.createElement("div", { style: { width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" } }, item.category === "supplier" ? "📦" : item.category === "contractor" ? "🏗️" : item.category === "machinery" ? "🚜" : "👷"),
        React.createElement("div", null,
          React.createElement("h3", { style: { margin: "0 0 4px 0" } }, item.businessName),
          React.createElement("p", { style: { margin: 0, fontSize: "12px", color: "#666" } }, "⭐ ", item.totalReviews, " reviews • Since ", item.since)
        )
      ),
      React.createElement("p", { style: { fontSize: "13px", color: "#666", marginBottom: "8px" } }, details),
      React.createElement("p", { style: { fontSize: "12px", marginBottom: "4px" } }, "📍 ", item.city || item.location, pincode && item.availablePincodes?.includes(pincode) ? " ✅ Available in your area" : ""),
      React.createElement("p", { style: { fontSize: "12px", fontWeight: "bold", color: "#1a5f7a", marginBottom: "8px" } }, "💰 ", item.priceRange),
      item.offer && React.createElement("p", { style: { ...styles.badge, ...styles.offerBadge, marginBottom: "8px" } }, "🎉 ", item.offer),
      React.createElement("div", { style: { marginTop: "12px", display: "flex", gap: "8px" } },
        React.createElement("button", { onClick: (e) => { e.stopPropagation(); openProfileModal(item); }, style: styles.buttonInfo }, "👁️ View Profile"),
        React.createElement("button", { onClick: (e) => { e.stopPropagation(); openEnquiryModal(item); }, style: styles.buttonOutline }, "📞 Contact"),
        React.createElement("button", { onClick: (e) => { e.stopPropagation(); openWhatsApp(item); }, style: styles.button }, "💬 WhatsApp")
      )
    );
  };

  const renderProfileModal = () => {
    if (!selectedItem) return null;
    
    return React.createElement("div", { style: styles.modal, onClick: () => setShowProfileModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("div", { style: { textAlign: "center", marginBottom: "20px" } },
          React.createElement("div", { style: { width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", margin: "0 auto" } }, 
            selectedItem.category === "supplier" ? "📦" : selectedItem.category === "contractor" ? "🏗️" : selectedItem.category === "machinery" ? "🚜" : "👷"
          ),
          React.createElement("h2", { style: { margin: "12px 0 4px" } }, selectedItem.businessName),
          React.createElement("div", { style: { fontSize: "16px", color: "#f59e0b" } }, renderStars(selectedItem.rating), " ", selectedItem.rating, " (", selectedItem.totalReviews, " reviews)")
        ),
        React.createElement("div", { style: { borderTop: "1px solid #eee", paddingTop: "16px" } },
          React.createElement("p", null, React.createElement("strong", null, "👤 Owner:"), " ", selectedItem.ownerName),
          React.createElement("p", null, React.createElement("strong", null, "📞 Phone:"), " ", selectedItem.phone),
          selectedItem.alternatePhone && React.createElement("p", null, React.createElement("strong", null, "📞 Alternate:"), " ", selectedItem.alternatePhone),
          React.createElement("p", null, React.createElement("strong", null, "📧 Email:"), " ", selectedItem.email),
          React.createElement("p", null, React.createElement("strong", null, "📍 Location:"), " ", selectedItem.city || selectedItem.location),
          React.createElement("p", null, React.createElement("strong", null, "📅 Since:"), " ", selectedItem.since),
          selectedItem.gstNo && React.createElement("p", null, React.createElement("strong", null, "GST No:"), " ", selectedItem.gstNo),
          React.createElement("p", null, React.createElement("strong", null, "💰 Price Range:"), " ", selectedItem.priceRange),
          React.createElement("p", null, React.createElement("strong", null, "📋 Description:"), " ", selectedItem.description),
          React.createElement("div", { style: { marginTop: "16px", display: "flex", gap: "12px" } },
            React.createElement("button", { onClick: () => { setShowProfileModal(false); openEnquiryModal(selectedItem); }, style: { ...styles.buttonOutline, flex: 1 } }, "📞 Contact"),
            React.createElement("button", { onClick: () => { setShowProfileModal(false); openWhatsApp(selectedItem); }, style: { ...styles.button, flex: 1 } }, "💬 WhatsApp")
          )
        )
      )
    );
  };

  const renderOffersSection = () => {
    if (selectedCategory !== "offers" && selectedCategory !== "all") return null;
    
    return React.createElement("div", null,
      React.createElement("div", { style: styles.card, marginBottom: "20px" },
        React.createElement("div", { style: styles.cardTitle }, "🏷️ Hot Offers & Discounts"),
        React.createElement("div", { style: styles.offersContainer },
          offers.map(offer =>
            React.createElement("div", { key: offer.id, style: styles.offerCard },
              React.createElement("div", { style: { fontSize: "28px", marginBottom: "8px" } }, "🎉"),
              React.createElement("h3", { style: { margin: "0 0 4px 0" } }, offer.businessName),
              React.createElement("p", { style: { fontSize: "20px", fontWeight: "bold", color: "#dc2626", margin: "8px 0" } }, offer.discount),
              React.createElement("p", { style: { fontSize: "12px", color: "#666" } }, "Valid till: ", offer.validTill),
              React.createElement("p", { style: { fontSize: "12px", backgroundColor: "#f3f4f6", padding: "4px 8px", borderRadius: "4px", marginTop: "8px" } }, "Code: ", offer.code),
              React.createElement("button", { onClick: () => { 
                const message = `Hello ${offer.businessName},%0A%0AI'm interested in your ${offer.discount} offer. Please share more details.%0A%0AFrom: BuildTrack Marketplace`;
                openWhatsApp({ phone: offer.phone, businessName: offer.businessName }, message);
              }, style: { ...styles.button, width: "100%", marginTop: "12px", backgroundColor: "#25D366" } }, "Claim Offer 💬")
            )
          )
        )
      )
    );
  };

  const renderContent = () => {
    if (selectedCategory === "offers") {
      return renderOffersSection();
    }
    
    const filteredListings = getFilteredListings();
    
    return React.createElement("div", null,
      filteredListings.length === 0 ? 
        React.createElement("div", { style: { textAlign: "center", padding: "60px", color: "#666" } }, 
          pincode && serviceablePincodes.includes(pincode) ? 
            "No service providers available in your pincode yet. Try another pincode!" :
            "No listings found. Try searching something else!"
        ) :
        React.createElement("div", { style: styles.grid3 }, filteredListings.map(item => renderListingCard(item)))
    );
  };

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "🏪 BuildTrack Marketplace"),
        React.createElement("p", { style: styles.headerSub }, "Connect with verified suppliers, contractors, machinery rentals, and labour")
      ),
      React.createElement("div", null,
        React.createElement("button", { onClick: () => window.location.href = "/", style: { ...styles.buttonOutline, backgroundColor: "#dc3545" } }, "🚪 Exit")
      )
    ),
    
    // Location Bar with City and Pincode
    React.createElement("div", { style: styles.locationBar },
      React.createElement("span", { style: { fontWeight: "bold" } }, "📍 Select Location:"),
      React.createElement("select", { 
        value: selectedCity, 
        onChange: (e) => handleCityChange(e.target.value),
        style: styles.citySelect 
      },
        React.createElement("option", { value: "" }, "-- Select City --"),
        cities.map(city => React.createElement("option", { key: city.name, value: city.name }, city.name))
      ),
      React.createElement("input", { 
        type: "text", 
        placeholder: "Enter 6-digit pincode", 
        value: pincode, 
        onChange: handlePincodeChange,
        maxLength: 6,
        style: styles.pincodeInput 
      }),
      pincodeError && React.createElement("span", { style: { color: "#dc2626", fontSize: "12px" } }, pincodeError),
      pincode && serviceablePincodes.includes(pincode) && React.createElement("span", { style: { color: "#10b981", fontSize: "12px" } }, "✅ Service available!")
    ),
    
    // Service Not Available Warning
    showPincodeWarning && React.createElement("div", { style: styles.warningCard },
      React.createElement("p", { style: { margin: 0, color: "#856404" } }, 
        "🙏 We're sorry! Our services are not yet available in pincode ", requestedPincode, 
        ". We're expanding soon! Please check back later or try a different pincode."
      )
    ),
    
    React.createElement("div", { style: styles.searchBar },
      React.createElement("input", { 
        type: "text", 
        placeholder: "🔍 Search by business, product, location...", 
        value: searchTerm, 
        onChange: (e) => setSearchTerm(e.target.value),
        style: styles.searchInput 
      }),
      React.createElement("select", { 
        value: sortBy, 
        onChange: (e) => setSortBy(e.target.value),
        style: { ...styles.searchInput, maxWidth: "150px" }
      },
        React.createElement("option", { value: "rating" }, "⭐ Top Rated"),
        React.createElement("option", { value: "reviews" }, "📊 Most Reviews")
      )
    ),
    
    React.createElement("div", { style: styles.categoryContainer },
      categories.map(cat =>
        React.createElement("button", {
          key: cat.id,
          onClick: () => setSelectedCategory(cat.id),
          style: { ...styles.categoryBtn, ...(selectedCategory === cat.id ? styles.categoryBtnActive : {}) }
        }, cat.icon, " ", cat.name)
      )
    ),
    
    renderContent(),
    
    // Enquiry Modal
    showProductModal && selectedItem && React.createElement("div", { style: styles.modal, onClick: () => setShowProductModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#1a5f7a", marginBottom: "16px" } }, "Send Enquiry to ", selectedItem.businessName),
        React.createElement("div", { style: { backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px", marginBottom: "16px" } },
          React.createElement("p", { style: { margin: "4px 0" } }, "⭐ Rating: ", renderStars(selectedItem.rating), " (", selectedItem.totalReviews, " reviews)"),
          React.createElement("p", { style: { margin: "4px 0" } }, "📍 ", selectedItem.city || selectedItem.location),
          React.createElement("p", { style: { margin: "4px 0" } }, "💰 ", selectedItem.priceRange),
          selectedItem.offer && React.createElement("p", { style: { margin: "4px 0", color: "#dc2626" } }, "🎉 ", selectedItem.offer)
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Your Name *"),
          React.createElement("input", { type: "text", placeholder: "Enter your name", value: enquiryData.name, onChange: (e) => setEnquiryData({...enquiryData, name: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Phone Number *"),
            React.createElement("input", { type: "tel", placeholder: "Your mobile number", value: enquiryData.phone, onChange: (e) => setEnquiryData({...enquiryData, phone: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Location"),
            React.createElement("input", { type: "text", placeholder: "Your city/location", value: enquiryData.location, onChange: (e) => setEnquiryData({...enquiryData, location: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Requirement Details *"),
          React.createElement("input", { type: "text", placeholder: "e.g., 500 bags, 1000 sq.ft, 10 labours", value: enquiryData.quantity, onChange: (e) => setEnquiryData({...enquiryData, quantity: e.target.value}), style: styles.input })
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Additional Details"),
          React.createElement("textarea", { placeholder: "Any specific requirements...", value: enquiryData.requirement, onChange: (e) => setEnquiryData({...enquiryData, requirement: e.target.value}), style: { ...styles.input, minHeight: "80px" } })
        ),
        React.createElement("div", { style: { display: "flex", gap: "12px", marginTop: "16px" } },
          React.createElement("button", { onClick: () => openWhatsApp(selectedItem), style: { ...styles.button, flex: 1 } }, "💬 Send via WhatsApp"),
          React.createElement("button", { onClick: () => setShowProductModal(false), style: { ...styles.buttonOutline, backgroundColor: "#6c757d", flex: 1 } }, "Cancel")
        )
      )
    ),
    
    // Profile Modal
    showProfileModal && renderProfileModal()
  );
}