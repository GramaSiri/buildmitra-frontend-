const fs = require("fs");

const supplierFile = "pages/supplier-dashboard.tsx";
let s = fs.readFileSync(supplierFile, "utf8");

// Add helper after imports if not already present
if (!s.includes("function getBuildMitraSupplierKeys")) {
  s = s.replace(
    'import * as XLSX from "xlsx";',
    `import * as XLSX from "xlsx";

function getBuildMitraSupplierKeys(user, fallbackId) {
  const keys = [];
  const add = (v) => {
    if (v !== undefined && v !== null && String(v).trim() !== "" && !keys.includes(String(v).trim())) {
      keys.push(String(v).trim());
    }
  };

  add(fallbackId);
  add(user?.userCode);
  add(user?.supplierUserCode);
  add(user?.uniqueCode);
  add(user?.userId);
  add(user?.id);
  add(user?._id);
  add(user?.phone);
  add(user?.mobile);

  return keys.length ? keys : ["supplier"];
}

function saveBuildMitraSupplierProducts(user, fallbackId, products) {
  const keys = getBuildMitraSupplierKeys(user, fallbackId);
  keys.forEach((key) => {
    localStorage.setItem("supplierProducts_" + key, JSON.stringify(products));
  });
  localStorage.setItem("supplierProducts", JSON.stringify(products));
  return keys;
}`
  );
}

// Make user parsing stronger in add/bulk sections
s = s.replaceAll(
  'const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");',
  `const user =
      JSON.parse(localStorage.getItem("currentUser") || "null") ||
      JSON.parse(localStorage.getItem("loggedInUser") || "null") ||
      JSON.parse(localStorage.getItem("user") || "{}");`
);

// Make supplierInfo lookup stronger
s = s.replaceAll(
  'const supplierInfoData = JSON.parse(localStorage.getItem("supplierInfo_" + user.userId) || "{}");',
  `const supplierInfoData =
      JSON.parse(localStorage.getItem("supplierInfo_" + (user.userCode || user.userId || user.id || user.phone || userId || "supplier")) || "{}");`
);

// Replace save calls in add product / upload / edit / delete with multi-key save helper
s = s.replaceAll(
  'localStorage.setItem("supplierProducts_" + user.userId, JSON.stringify(updatedProducts));\n    localStorage.setItem("supplierProducts", JSON.stringify(updatedProducts));',
  `const savedKeys = saveBuildMitraSupplierProducts(user, userId, updatedProducts);
    console.log("Supplier products saved to keys:", savedKeys);`
);

s = s.replaceAll(
  'localStorage.setItem("supplierProducts_" + user.userId, JSON.stringify(updatedProducts));\n          localStorage.setItem("supplierProducts", JSON.stringify(updatedProducts));',
  `const savedKeys = saveBuildMitraSupplierProducts(user, userId, updatedProducts);
          console.log("Supplier bulk products saved to keys:", savedKeys);`
);

s = s.replaceAll(
  'localStorage.setItem("supplierProducts_" + userId, JSON.stringify(updatedProducts));\n      localStorage.setItem("supplierProducts", JSON.stringify(updatedProducts));',
  `const userForSave =
        JSON.parse(localStorage.getItem("currentUser") || "null") ||
        JSON.parse(localStorage.getItem("loggedInUser") || "null") ||
        JSON.parse(localStorage.getItem("user") || "{}");
      const savedKeys = saveBuildMitraSupplierProducts(userForSave, userId, updatedProducts);
      console.log("Supplier products saved to keys:", savedKeys);`
);

fs.writeFileSync(supplierFile, s, "utf8");

const marketFile = "pages/marketplace.tsx";
let m = fs.readFileSync(marketFile, "utf8");

// Ensure marketplace also reads generic supplierProducts if supplierProducts_ keys are missing
if (!m.includes("BuildMitra generic supplierProducts fallback")) {
  const marker = 'var users = JSON.parse(localStorage.getItem("users") || "[]");';
  if (m.includes(marker)) {
    m = m.replace(
      marker,
      `${marker}

      // BuildMitra generic supplierProducts fallback
      try {
        var genericSupplierProducts = JSON.parse(localStorage.getItem("supplierProducts") || "[]");
        if (Array.isArray(genericSupplierProducts) && genericSupplierProducts.length > 0) {
          genericSupplierProducts.forEach(function(p) {
            supplierItems.push({
              ...p,
              id: p.id || ("GEN-SUP-" + Math.random()),
              type: p.itemType || "material",
              itemType: p.itemType || "material",
              category: p.category || "Materials",
              name: p.name || p.productName || p.itemName || "Supplier Product",
              itemName: p.itemName || p.name || p.productName || "Supplier Product",
              ownerName: p.ownerName || p.supplierName || p.providerName || p.shopName || "Supplier",
              businessName: p.businessName || p.ownerName || p.supplierName || p.providerName || "Supplier",
              providerRole: p.providerRole || "supplier",
              providerUserCode: p.providerUserCode || p.supplierUserCode || p.userCode || p.userId || "",
              userCode: p.providerUserCode || p.supplierUserCode || p.userCode || p.userId || "",
              phone: p.providerPhone || p.supplierPhone || p.ownerPhone || p.phone || "",
              price: p.price || 0,
              unit: p.unit || "piece",
              description: p.description || p.specification || ""
            });
          });
        }
      } catch (e) {
        console.warn("Could not read generic supplierProducts", e);
      }`
    );
  }
}

fs.writeFileSync(marketFile, m, "utf8");

console.log("Supplier storage key and marketplace fallback patched.");
