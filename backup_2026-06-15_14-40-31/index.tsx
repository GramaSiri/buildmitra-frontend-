import React, { useState } from "react";

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("buyer");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [membershipNo, setMembershipNo] = useState("");
  const [shopNo, setShopNo] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetMobile, setResetMobile] = useState("");
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  
  // Material trends data
  const materialTrends = [
    { name: "Cement", price: "₹380/bag", trend: "up", change: "+5%" },
    { name: "Steel", price: "₹65/kg", trend: "down", change: "-2%" },
    { name: "Sand", price: "₹60/cft", trend: "up", change: "+3%" },
    { name: "Bricks", price: "₹8/piece", trend: "stable", change: "0%" }
  ];

  const flashNews = [
    { id: 1, title: "New RERA approved projects launched in Andheri!", category: "Projects", date: "2024-02-15", fullDetails: "RERA approved residential projects with modern amenities. Starting from ₹85L onwards. Located near metro station. Contact for site visit.", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400" },
    { id: 2, title: "Steel prices expected to drop next week!", category: "Market Update", date: "2024-02-14", fullDetails: "Due to reduced import duties, steel prices are expected to drop by 5-7% next week. Recommended to wait for purchasing.", image: "https://images.unsplash.com/photo-1513106580091-1d82408b5cd6?w=400" },
    { id: 3, title: "3 BHK ready to move flats available at Bandra", category: "Properties", date: "2024-02-13", fullDetails: "Luxury 3 BHK flats in Bandra West. Sea view, fully furnished. Price ₹2.5Cr onwards. Immediate possession.", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400" },
    { id: 4, title: "Get 10% off on JCB rental this month", category: "Offers", date: "2024-02-12", fullDetails: "Limited period offer: 10% discount on all JCB rentals. Minimum 7 days booking. Terms and conditions apply.", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400" },
    { id: 5, title: "Urgent requirement for Masons in Powai", category: "Jobs", date: "2024-02-11", fullDetails: "Requirement of 20 masons for residential project in Powai. Duration 3 months. Daily wage ₹800 + accommodation.", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400" }
  ];

  const handleLogin = () => {
    if (!mobile) {
      alert("Please enter mobile number");
      return;
    }
    if (role === "buyer") window.location.href = "/buyer-dashboard";
    else if (role === "supplier") window.location.href = "/supplier-dashboard";
    else if (role === "vendor") window.location.href = "/vendor-dashboard";
    else if (role === "labour") window.location.href = "/laboursupply-dashboard";
    else if (role === "machine") window.location.href = "/machinehire-dashboard";
    else if (role === "realestate") window.location.href = "/realestate-dashboard";
    else if (role === "marketplace") window.location.href = "/marketplace";
    else if (role === "admin") window.location.href = "/admin-dashboard";
  };

  const handleRegister = () => {
    if (!name) {
      alert("Please enter your name");
      return;
    }
    if (!mobile) {
      alert("Please enter mobile number");
      return;
    }
    if (!address) {
      alert("Please enter your address");
      return;
    }
    alert("Registration successful! Please login.");
    setIsLogin(true);
    setName("");
    setAddress("");
    setGstNo("");
    setMembershipNo("");
    setShopNo("");
    setBankAccountNo("");
    setPassword("");
  };

  const handleForgotPassword = () => {
    if (!resetMobile) {
      alert("Please enter your registered mobile number");
      return;
    }
    alert(`Password reset link sent to ${resetMobile}`);
    setShowForgotPassword(false);
    setResetMobile("");
  };

  const openNewsDetails = (news) => {
    setSelectedNews(news);
    setShowNewsModal(true);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "auto"
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.55)"
    },
    mainContainer: {
      position: "relative",
      zIndex: 1,
      display: "flex",
      width: "90%",
      maxWidth: "1300px",
      gap: "30px",
      flexWrap: "wrap",
      justifyContent: "center",
      padding: "20px"
    },
    formContainer: {
      flex: 1,
      minWidth: "350px",
      maxWidth: "500px",
      backgroundColor: "white",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      maxHeight: "80vh",
      overflowY: "auto"
    },
    infoContainer: {
      flex: 1,
      minWidth: "300px",
      maxWidth: "400px",
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    },
    infoCard: {
      backgroundColor: "rgba(255,255,255,0.95)",
      borderRadius: "16px",
      padding: "20px",
      backdropFilter: "blur(10px)"
    },
    infoTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#800020",
      marginBottom: "12px",
      borderBottom: "2px solid #800020",
      paddingBottom: "8px"
    },
    trendUp: { color: "#28a745", fontWeight: "bold" },
    trendDown: { color: "#dc3545", fontWeight: "bold" },
    trendStable: { color: "#ffc107", fontWeight: "bold" },
    logo: { fontSize: "48px", marginBottom: "16px", textAlign: "center" },
    title: { fontSize: "28px", fontWeight: "bold", color: "#800020", marginBottom: "8px", textAlign: "center" },
    subtitle: { fontSize: "14px", color: "#666", marginBottom: "24px", textAlign: "center" },
    roleSelect: { width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
    input: { width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
    textarea: { width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", minHeight: "80px", fontFamily: "inherit" },
    loginButton: { width: "100%", padding: "14px", backgroundColor: "#800020", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginBottom: "16px" },
    registerButton: { width: "100%", padding: "14px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginBottom: "16px" },
    toggleButton: { width: "100%", padding: "12px", backgroundColor: "transparent", color: "#800020", border: "2px solid #800020", borderRadius: "8px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", marginTop: "8px" },
    forgotLink: { textAlign: "right", marginBottom: "16px", fontSize: "12px", cursor: "pointer", color: "#800020" },
    newsItem: { padding: "10px 0", borderBottom: "1px solid #eee", fontSize: "13px", lineHeight: "1.4", cursor: "pointer", transition: "background 0.3s" },
    trendItem: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" },
    familyIcon: { fontSize: "24px", marginRight: "10px" },
    featureCard: { backgroundColor: "white", borderRadius: "12px", padding: "16px", marginBottom: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    featureIcon: { fontSize: "32px", marginBottom: "8px" },
    featureTitle: { fontSize: "14px", fontWeight: "bold", color: "#800020", marginBottom: "4px" },
    featureDesc: { fontSize: "11px", color: "#666" }
  };

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.overlay }),
    
    React.createElement("div", { style: styles.mainContainer },
      // Left Side - Form
      React.createElement("div", { style: styles.formContainer },
        React.createElement("div", { style: styles.logo }, "🏗️"),
        React.createElement("h1", { style: styles.title }, "BuildMitra"),
        React.createElement("p", { style: styles.subtitle }, "India's Trusted Construction Platform"),
        
        React.createElement("select", { value: role, onChange: (e) => setRole(e.target.value), style: styles.roleSelect },
          React.createElement("option", { value: "buyer" }, "🏠 Home Owner / Buyer"),
          React.createElement("option", { value: "supplier" }, "📦 Material Supplier"),
          React.createElement("option", { value: "vendor" }, "🏗️ Contractor / Builder"),
          React.createElement("option", { value: "labour" }, "👷 Labour Supply"),
          React.createElement("option", { value: "machine" }, "🚜 Equipment/Machine Hire"),
          React.createElement("option", { value: "realestate" }, "🏡 Real Estate"),
          React.createElement("option", { value: "marketplace" }, "🛒 Marketplace"),
          React.createElement("option", { value: "admin" }, "👑 Admin")
        ),
        
        isLogin ? (
          React.createElement("div", null,
            React.createElement("input", { type: "tel", placeholder: "Mobile Number *", value: mobile, onChange: (e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)), style: styles.input }),
            React.createElement("input", { type: "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), style: styles.input }),
            React.createElement("div", { style: styles.forgotLink, onClick: () => setShowForgotPassword(true) }, "Forgot Password?"),
            React.createElement("button", { onClick: handleLogin, style: styles.loginButton }, "🔐 Login"),
            React.createElement("button", { onClick: () => setIsLogin(false), style: styles.toggleButton }, "New User? Create Account")
          )
        ) : (
          React.createElement("div", null,
            React.createElement("input", { type: "text", placeholder: "Full Name *", value: name, onChange: (e) => setName(e.target.value), style: styles.input }),
            React.createElement("input", { type: "tel", placeholder: "Mobile Number *", value: mobile, onChange: (e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)), style: styles.input }),
            React.createElement("textarea", { placeholder: "Address *", value: address, onChange: (e) => setAddress(e.target.value), style: styles.textarea }),
            React.createElement("input", { type: "text", placeholder: "GST Number (if applicable)", value: gstNo, onChange: (e) => setGstNo(e.target.value), style: styles.input }),
            React.createElement("input", { type: "text", placeholder: "Membership / Association No", value: membershipNo, onChange: (e) => setMembershipNo(e.target.value), style: styles.input }),
            React.createElement("input", { type: "text", placeholder: "Office / Shop Number", value: shopNo, onChange: (e) => setShopNo(e.target.value), style: styles.input }),
            React.createElement("input", { type: "text", placeholder: "Bank Account Number", value: bankAccountNo, onChange: (e) => setBankAccountNo(e.target.value), style: styles.input }),
            React.createElement("input", { type: "password", placeholder: "Password (Optional)", value: password, onChange: (e) => setPassword(e.target.value), style: styles.input }),
            React.createElement("button", { onClick: handleRegister, style: styles.registerButton }, "📝 Create Account"),
            React.createElement("button", { onClick: () => setIsLogin(true), style: styles.toggleButton }, "Already have an account? Login")
          )
        )
      ),
      
      // Right Side - Info Panel
      React.createElement("div", { style: styles.infoContainer },
        // Feature 1: Buy Materials
        React.createElement("div", { style: styles.featureCard },
          React.createElement("div", { style: styles.featureIcon }, "🛒"),
          React.createElement("div", { style: styles.featureTitle }, "Buy Materials & Save Lakhs"),
          React.createElement("div", { style: styles.featureDesc }, "Get best prices on cement, steel, tiles & more. Direct from verified suppliers. Save up to 20% on construction materials.")
        ),
        
        // Feature 2: Verified Contractors
        React.createElement("div", { style: styles.featureCard },
          React.createElement("div", { style: styles.featureIcon }, "🏗️"),
          React.createElement("div", { style: styles.featureTitle }, "Quality Work Verified Contractors"),
          React.createElement("div", { style: styles.featureDesc }, "Connect with verified, licensed contractors. Get quality work done on time. Save time and money with our trusted network.")
        ),
        
        // Flash News (Updated with better visibility)
        React.createElement("div", { style: styles.infoCard },
          React.createElement("div", { style: styles.infoTitle }, "📰 Flash News"),
          flashNews.map((news, idx) => 
            React.createElement("div", { key: idx, style: styles.newsItem, onClick: () => openNewsDetails(news), onMouseEnter: (e) => e.target.style.backgroundColor = "#f5f5f5", onMouseLeave: (e) => e.target.style.backgroundColor = "transparent" }, 
              "📢 ", news.title
            )
          )
        ),
        
        // Material Trends
        React.createElement("div", { style: styles.infoCard },
          React.createElement("div", { style: styles.infoTitle }, "📈 Material Price Trends"),
          materialTrends.map((item, idx) => 
            React.createElement("div", { key: idx, style: styles.trendItem },
              React.createElement("span", null, item.name),
              React.createElement("span", null, item.price),
              React.createElement("span", { style: item.trend === "up" ? styles.trendUp : (item.trend === "down" ? styles.trendDown : styles.trendStable) }, item.trend === "up" ? "▲" : (item.trend === "down" ? "▼" : "●"), " ", item.change)
            )
          )
        ),
        
        // Happy Family Message (with updated labour image description)
        React.createElement("div", { style: styles.infoCard },
          React.createElement("div", { style: styles.infoTitle }, "🏠 Happy Families & Skilled Workforce"),
          React.createElement("div", { style: { display: "flex", alignItems: "center", marginBottom: "12px" } },
            React.createElement("span", { style: styles.familyIcon }, "👷‍♂️"),
            React.createElement("span", null, "10,000+ Skilled Masons, Carpenters, Electricians with professional tools")
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", marginBottom: "12px" } },
            React.createElement("span", { style: styles.familyIcon }, "🏆"),
            React.createElement("span", null, "5000+ Projects Completed Successfully")
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center" } },
            React.createElement("span", { style: styles.familyIcon }, "⭐"),
            React.createElement("span", null, "4.8 Rating from 15,000+ Users")
          )
        )
      )
    ),
    
    // Forgot Password Modal
    showForgotPassword && React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }, onClick: () => setShowForgotPassword(false) },
      React.createElement("div", { style: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "400px" }, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", { style: { marginBottom: "16px", color: "#800020" } }, "Reset Password"),
        React.createElement("p", { style: { marginBottom: "16px", fontSize: "14px", color: "#666" } }, "Enter your registered mobile number to receive password reset link"),
        React.createElement("input", { type: "tel", placeholder: "Registered Mobile Number", value: resetMobile, onChange: (e) => setResetMobile(e.target.value.replace(/\D/g, "").slice(0, 10)), style: { width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #ddd" } }),
        React.createElement("button", { onClick: handleForgotPassword, style: { width: "100%", padding: "12px", backgroundColor: "#800020", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" } }, "Send Reset Link"),
        React.createElement("button", { onClick: () => setShowForgotPassword(false), style: { width: "100%", padding: "12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "8px" } }, "Cancel")
      )
    ),
    
    // News Detail Modal
    showNewsModal && selectedNews && React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }, onClick: () => setShowNewsModal(false) },
      React.createElement("div", { style: { backgroundColor: "white", borderRadius: "16px", padding: "32px", width: "90%", maxWidth: "600px", maxHeight: "85vh", overflow: "auto" }, onClick: (e) => e.stopPropagation() },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" } },
          React.createElement("h2", { style: { color: "#800020", margin: 0 } }, selectedNews.title),
          React.createElement("button", { onClick: () => setShowNewsModal(false), style: { backgroundColor: "transparent", border: "none", fontSize: "24px", cursor: "pointer" } }, "✕")
        ),
        React.createElement("div", { style: { color: "#666", marginBottom: "12px" } },
          React.createElement("span", { style: { backgroundColor: "#f0f2f5", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" } }, selectedNews.category),
          React.createElement("span", { style: { marginLeft: "12px", fontSize: "12px" } }, "📅 ", selectedNews.date)
        ),
        React.createElement("img", { src: selectedNews.image, alt: selectedNews.title, style: { width: "100%", height: "250px", objectFit: "cover", borderRadius: "12px", marginBottom: "20px" } }),
        React.createElement("p", { style: { fontSize: "16px", lineHeight: "1.6", color: "#333", marginBottom: "20px" } }, selectedNews.fullDetails),
        React.createElement("div", { style: { display: "flex", gap: "12px" } },
          React.createElement("button", { onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(selectedNews.title + " - " + selectedNews.fullDetails)}`, "_blank"), style: { padding: "10px 20px", backgroundColor: "#25D366", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" } }, "📱 Share on WhatsApp"),
          React.createElement("button", { onClick: () => setShowNewsModal(false), style: { padding: "10px 20px", backgroundColor: "#800020", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" } }, "Close")
        )
      )
    )
  );
}
