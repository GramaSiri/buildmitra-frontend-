import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const welcomeUser =
  typeof window !== "undefined"
    ? localStorage.getItem("userName") || ""
    : "";
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
  if (typeof window !== "undefined") {

    const user = localStorage.getItem("loggedInUser");

    if (user) {
      console.log("Existing session:", JSON.parse(user));
    }

  }

  setIsCheckingSession(false);

}, []);

  const redirectToDashboard = (role) => {
    switch(role) {
      case "buyer": router.push("/buyer-dashboard"); break;
      case "supplier": router.push("/supplier-dashboard"); break;
      case "contractor": router.push("/contractor-dashboard"); break;
      case "machinery": router.push("/machinery-dashboard"); break;
      case "labour": router.push("/labour-dashboard"); break;
      case "realestate": router.push("/realestate-dashboard"); break;
      default: router.push("/buyer-dashboard");
    }
  };

  // Generate unique code based on role
  const generateUniqueCode = (role, users = []) => {
    const prefix = {
      supplier: "SUP",
      contractor: "CON",
      buyer: "BUY",
      machinery: "MCH",
      labour: "LAB",
      realestate: "REL"
    };
    const codePrefix = prefix[role] || "USR";
    const existingCodes = new Set(
      users.map((user) => String(user.uniqueCode || "").toUpperCase())
    );
    for (let attempt = 0; attempt < 10000; attempt += 1) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const candidate = `${codePrefix}-${randomNum}`;
      if (!existingCodes.has(candidate)) return candidate;
    }
    // The four-digit namespace is unexpectedly exhausted; retain uniqueness.
    return `${codePrefix}-${Date.now()}`;
  };

  // Reset data based on role
  const resetUserData = (userId, userName, userPhone, uniqueCode, role) => {
    if (role === "supplier") {
      resetSupplierData(userId, userName, userPhone, uniqueCode);
    } else if (role === "contractor") {
      resetContractorData(userId, userName, userPhone, uniqueCode);
    } else if (role === "machinery") {
      resetMachineryData(userId, userName, userPhone, uniqueCode);
    } else if (role === "labour") {
      resetLabourData(userId, userName, userPhone, uniqueCode);
    } else if (role === "realestate") {
      resetRealEstateData(userId, userName, userPhone, uniqueCode);
    } else {
      resetBuyerData(userId, userName, userPhone, uniqueCode);
    }
  };

  const resetSupplierData = (userId, userName, userPhone, uniqueCode) => {
    const keysToRemove = [
      "supplierInfo", "supplierProducts", "supplierOffers",
      "supplierOrders", "supplierQuotes", "shopPhoto", "businessCard"
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    const freshSupplierInfo = {
      userId: userId,
      uniqueCode: uniqueCode,
      shopName: userName,
      ownerName: userName,
      phone: userPhone,
      shopPhotoUrl: null,
      businessCardUrl: null,
      gstNo: "",
      address: "",
      email: "",
      since: new Date().getFullYear().toString(),
      rating: 0,
      totalOrdersCompleted: 0,
      totalRevenue: 0,
      activeOffers: 0,
      totalProducts: 0,
      totalEnquiries: 0,
      isNewUser: true
    };
    localStorage.setItem("supplierInfo", JSON.stringify(freshSupplierInfo));
    localStorage.setItem("supplierInfo_" + userId, JSON.stringify(freshSupplierInfo));
    localStorage.setItem("supplierProducts_" + userId, JSON.stringify([]));
    localStorage.setItem("supplierOffers_" + userId, JSON.stringify([]));
    localStorage.setItem("supplierOrders_" + userId, JSON.stringify([]));
    localStorage.setItem("supplierQuotes_" + userId, JSON.stringify([]));
  };

  const resetContractorData = (userId, userName, userPhone, uniqueCode) => {
    localStorage.removeItem("contractorInfo");
    localStorage.removeItem("contractorProjects");
    
    const freshContractorInfo = {
      userId: userId,
      uniqueCode: uniqueCode,
      companyName: userName,
      ownerName: userName,
      phone: userPhone,
      email: "",
      address: "",
      gstNo: "",
      since: new Date().getFullYear().toString(),
      rating: 0,
      completedProjects: 0,
      totalRevenue: 0,
      isNewUser: true
    };
    localStorage.setItem("contractorInfo", JSON.stringify(freshContractorInfo));
    localStorage.setItem("contractorProjects", JSON.stringify([]));
  };

  const resetMachineryData = (userId, userName, userPhone, uniqueCode) => {
    localStorage.removeItem("machineryInfo");
    localStorage.removeItem("machineryListings");
    
    const freshMachineryInfo = {
      userId: userId,
      uniqueCode: uniqueCode,
      businessName: userName + "'s Machinery",
      ownerName: userName,
      phone: userPhone,
      email: "",
      address: "",
      gstNo: "",
      since: new Date().getFullYear().toString(),
      rating: 0,
      totalEquipment: 0,
      totalRevenue: 0,
      isNewUser: true
    };
    localStorage.setItem("machineryInfo", JSON.stringify(freshMachineryInfo));
    localStorage.setItem("machineryListings", JSON.stringify([]));
  };

  const resetLabourData = (userId, userName, userPhone, uniqueCode) => {
    localStorage.removeItem("labourInfo");
    localStorage.removeItem("labourListings");
    
    const freshLabourInfo = {
      userId: userId,
      uniqueCode: uniqueCode,
      businessName: userName + "'s Labour Supply",
      ownerName: userName,
      phone: userPhone,
      email: "",
      address: "",
      gstNo: "",
      since: new Date().getFullYear().toString(),
      rating: 0,
      totalLabours: 0,
      totalRevenue: 0,
      isNewUser: true
    };
    localStorage.setItem("labourInfo", JSON.stringify(freshLabourInfo));
    localStorage.setItem("labourListings", JSON.stringify([]));
  };

  const resetRealEstateData = (userId, userName, userPhone, uniqueCode) => {
    localStorage.removeItem("realEstateInfo");
    localStorage.removeItem("realEstateProperties");
    
    const freshRealEstateInfo = {
      userId: userId,
      uniqueCode: uniqueCode,
      businessName: userName + "'s Real Estate",
      ownerName: userName,
      phone: userPhone,
      email: "",
      address: "",
      gstNo: "",
      since: new Date().getFullYear().toString(),
      rating: 0,
      totalProperties: 0,
      totalRevenue: 0,
      isNewUser: true
    };
    localStorage.setItem("realEstateInfo", JSON.stringify(freshRealEstateInfo));
    localStorage.setItem("realEstateProperties", JSON.stringify([]));
  };

  const resetBuyerData = (userId, userName, userPhone, uniqueCode) => {
    localStorage.removeItem("buyerProjects");
    localStorage.removeItem("buyerInfo");
    
    const freshBuyerInfo = {
      userId: userId,
      uniqueCode: uniqueCode,
      name: userName,
      phone: userPhone,
      email: "",
      address: "",
      totalProjects: 0,
      isNewUser: true
    };
    localStorage.setItem("buyerInfo", JSON.stringify(freshBuyerInfo));
    localStorage.setItem("buyerProjects", JSON.stringify([]));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    
    localStorage.removeItem("loggedInUser");
    
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => {
      const phoneMatch = u.phone === formData.phone;
      const emailMatch = u.email && u.email === formData.email;
      const phoneAsEmail = formData.phone && u.email === formData.phone;
      return (phoneMatch || emailMatch || phoneAsEmail) && u.password === formData.password;
    });
    
    if (user) {
      const loggedInUser = {
        userId: user.userId,
        uniqueCode: user.uniqueCode,
        name: user.name,
        phone: user.phone,
        email: user.email || "",
        role: user.role,
        location: user.location || "Bengaluru"
      };
      
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userRole", user.role);
      sessionStorage.setItem("justLoggedIn", "true");
      
      setSuccess(`✅ Login successful! Welcome ${user.name}!`);
      setTimeout(() => redirectToDashboard(user.role), 1000);
    } else {
      setError("❌ Invalid phone/email or password. Please try again.");
      setLoading(false);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!agreePolicy) {
    setLoading(true);
  if (!agreePolicy) {
  setError("Please accept BuildMitra Terms & Conditions and Privacy Policy");
  setLoading(false);
  return;
}
  return;
}
    
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    
    if (!formData.name.trim()) {
      setError("Full Name is required");
      setLoading(false);
      return;
    }
    
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError("Valid Phone Number is required (min 10 digits)");
      setLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    if (users.find(u => u.phone === formData.phone)) {
      setError("❌ User with this phone number already exists. Please login.");
      setLoading(false);
      return;
    }
    
    if (formData.email && users.find(u => u.email === formData.email)) {
      setError("User with this email already exists");
      setLoading(false);
      return;
    }
    
    // Generate unique userId
    const userId = Date.now() + Math.floor(Math.random() * 10000);
    
    // Generate unique code
    const uniqueCode = generateUniqueCode(formData.role, users);
    
    const newUser = {
      userId: userId,
      uniqueCode: uniqueCode,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || "",
      password: formData.password,
      role: formData.role,
      location: formData.location || "Bengaluru",
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    
    // Reset dashboard data
    resetUserData(userId, formData.name.trim(), formData.phone.trim(), uniqueCode, formData.role);
    
    setSuccess(`✅ Registration successful! Welcome ${formData.name}! (Code: ${uniqueCode}) Please login to continue.`);
    setLoading(false);
    
    setTimeout(() => {
      setIsLogin(true);
      setFormData({ ...formData, password: "", confirmPassword: "", phone: "", email: "" });
      setSuccess("");
    }, 2500);
  };

  // STYLES
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a5f7a 0%, #2d8db5 100%)",
      padding: "20px"
    },
    card: {
      backgroundColor: "white",
      borderRadius: "20px",
      padding: "40px",
      width: "100%",
      maxWidth: "450px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
    },
    logo: {
      textAlign: "center",
      marginBottom: "30px"
    },
    logoText: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#1a5f7a",
      margin: 0
    },
    logoSub: {
      fontSize: "14px",
      color: "#666",
      margin: "5px 0 0"
    },
    toggleContainer: {
      display: "flex",
      backgroundColor: "#f0f2f5",
      borderRadius: "12px",
      padding: "4px",
      marginBottom: "24px"
    },
    toggleBtn: {
      flex: 1,
      padding: "10px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.3s"
    },
    toggleActive: {
      backgroundColor: "#1a5f7a",
      color: "white"
    },
    toggleInactive: {
      backgroundColor: "transparent",
      color: "#666"
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      fontSize: "14px",
      marginBottom: "16px"
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "6px"
    },
    labelRequired: {
      color: "#dc3545",
      marginLeft: "4px"
    },
    button: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#1a5f7a",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer"
    },
    buttonDisabled: {
      opacity: 0.7,
      cursor: "not-allowed"
    },
    error: {
      backgroundColor: "#fee2e2",
      color: "#dc2626",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "16px",
      fontSize: "14px"
    },
    success: {
      backgroundColor: "#d1fae5",
      color: "#065f46",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "16px",
      fontSize: "14px"
    },
    link: {
      color: "#1a5f7a",
      cursor: "pointer",
      fontWeight: "500"
    },
    footer: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "13px",
      color: "#666"
    },
    roleSelect: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      fontSize: "14px",
      marginBottom: "16px",
      backgroundColor: "white"
    },
    note: {
      fontSize: "12px",
      color: "#888",
      marginTop: "-8px",
      marginBottom: "12px"
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isCheckingSession) {
    return React.createElement("div", { style: styles.container },
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.logo },
          React.createElement("h1", { style: styles.logoText }, "🏗️ BuildMitra"),
          React.createElement("p", { style: styles.logoSub }, "Loading...")
        )
      )
    );
  }

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.logo },
        React.createElement("h1", { style: styles.logoText }, "🏗️ BuildMitra"),
        React.createElement(
  "p",
  { style: styles.logoSub },
  welcomeUser
   ? "Welcome BuildMitra"
    : "Construction Management Platform"
)
      ),
      
      React.createElement("div", { style: styles.toggleContainer },
        React.createElement("button", {
          onClick: () => { setIsLogin(true); setError(""); setSuccess(""); },
          style: { ...styles.toggleBtn, ...(isLogin ? styles.toggleActive : styles.toggleInactive) }
        }, "Login"),
        React.createElement("button", {
          onClick: () => { setIsLogin(false); setError(""); setSuccess(""); },
          style: { ...styles.toggleBtn, ...(!isLogin ? styles.toggleActive : styles.toggleInactive) }
        }, "Register")
      ),
      
      error && React.createElement("div", { style: styles.error }, error),
      success && React.createElement("div", { style: styles.success }, success),
      
      isLogin ? 
        React.createElement("form", { onSubmit: handleLogin },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Phone Number or Email"),
            React.createElement("input", {
              type: "text",
              name: "phone",
              placeholder: "Enter your phone number or email",
              value: formData.phone || formData.email,
              onChange: (e) => {
                const val = e.target.value;
                if (val.includes('@')) {
                  setFormData({ ...formData, email: val, phone: "" });
                } else {
                  setFormData({ ...formData, phone: val, email: "" });
                }
              },
              required: true,
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Password"),
            React.createElement("input", {
              type: "password",
              name: "password",
              placeholder: "Enter your password",
              value: formData.password,
              onChange: handleInputChange,
              required: true,
              style: styles.input
            })
          ),
          React.createElement("button", { 
            type: "submit", 
            style: { ...styles.button, ...(loading ? styles.buttonDisabled : {}) },
            disabled: loading
          }, loading ? "Logging in..." : "Login"),
          React.createElement("div", { style: styles.footer },
            "New to BuildMitra? ",
            React.createElement("span", { 
              style: styles.link, 
              onClick: () => { setIsLogin(false); setError(""); setSuccess(""); }
            }, "Create an Account")
          )
        ) :
        React.createElement("form", { onSubmit: handleRegister },
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, 
              "Full Name", 
              React.createElement("span", { style: styles.labelRequired }, " *")
            ),
            React.createElement("input", {
              type: "text",
              name: "name",
              placeholder: "Enter your full name",
              value: formData.name,
              onChange: handleInputChange,
              required: true,
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, 
              "Phone Number", 
              React.createElement("span", { style: styles.labelRequired }, " *")
            ),
            React.createElement("input", {
              type: "tel",
              name: "phone",
              placeholder: "Enter your 10-digit phone number",
              value: formData.phone,
              onChange: handleInputChange,
              required: true,
              minLength: 10,
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, "Email Address (Optional)"),
            React.createElement("input", {
              type: "email",
              name: "email",
              placeholder: "Enter your email (optional)",
              value: formData.email,
              onChange: handleInputChange,
              style: styles.input
            }),
            React.createElement("div", { style: styles.note }, "Email is optional. You can login with phone number.")
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, 
              "Role",
              React.createElement("span", { style: styles.labelRequired }, " *")
            ),
            React.createElement("select", {
              name: "role",
              value: formData.role,
              onChange: handleInputChange,
              required: true,
              style: styles.roleSelect
            },
              React.createElement("option", { value: "buyer" }, "🏠 Buyer"),
              React.createElement("option", { value: "supplier" }, "📦 Supplier"),
              React.createElement("option", { value: "contractor" }, "🏗️ Contractor"),
              React.createElement("option", { value: "machinery" }, "🚜 Machinery Hire"),
              React.createElement("option", { value: "labour" }, "👷 Labour Supply"),
              React.createElement("option", { value: "realestate" }, "🏡 Real Estate")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, 
              "Password",
              React.createElement("span", { style: styles.labelRequired }, " *")
            ),
            React.createElement("input", {
              type: "password",
              name: "password",
              placeholder: "Create a password (min 6 characters)",
              value: formData.password,
              onChange: handleInputChange,
              required: true,
              minLength: 6,
              style: styles.input
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { style: styles.label }, 
              "Confirm Password",
              React.createElement("span", { style: styles.labelRequired }, " *")
            ),
            React.createElement("input", {
              type: "password",
              name: "confirmPassword",
              placeholder: "Confirm your password",
              value: formData.confirmPassword,
              onChange: handleInputChange,
              required: true,
              style: styles.input
            })
          ),
          React.createElement("div", {
  style: {
    marginBottom: "15px",
    fontSize: "13px"
  }
},
  React.createElement("input", {
    type: "checkbox",
    checked: agreePolicy,
    onChange: (e) => setAgreePolicy(e.target.checked),
    style: { marginRight: "8px" }
  }),
  "I agree to BuildMitra Terms & Conditions and Privacy Policy"
),
React.createElement("button", {
  type: "submit",
  style: {
    ...styles.button,
    ...(loading ? styles.buttonDisabled : {})
  },
  disabled: loading
}, loading ? "Registering..." : "Register"),
          React.createElement("div", { style: styles.footer },
            "Already have an account? ",
            React.createElement("span", { 
              style: styles.link, 
              onClick: () => { setIsLogin(true); setError(""); setSuccess(""); }
            }, "Login Here")
          )
        )
    )
  );
}
