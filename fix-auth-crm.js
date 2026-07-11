const fs = require("fs");

const loginFile = "./pages/login.tsx";
const adminFile = "./pages/admin-dashboard.tsx";

function backupMessage(file) {
  console.log("Working on:", file);
}

/* =========================================================
   1. LOGIN: CLEAR ENTERED CREDENTIALS AFTER EVERY ATTEMPT
   ========================================================= */

backupMessage(loginFile);

let login = fs.readFileSync(loginFile, "utf8");

// Detect password state setter.
const passwordState =
  login.match(
    /const\s*\[\s*(password\w*)\s*,\s*(setPassword\w*)\s*\]\s*=\s*(?:React\.)?useState/
  );

if (!passwordState) {
  throw new Error(
    "LOGIN PATCH STOPPED: Password state was not found. Original file was not changed."
  );
}

const passwordVariable = passwordState[1];
const passwordSetter = passwordState[2];

// Detect the phone/email/login identifier state setter.
const loginStatePatterns = [
  /const\s*\[\s*(phoneOrEmail)\s*,\s*(setPhoneOrEmail)\s*\]\s*=\s*(?:React\.)?useState/,
  /const\s*\[\s*(emailOrPhone)\s*,\s*(setEmailOrPhone)\s*\]\s*=\s*(?:React\.)?useState/,
  /const\s*\[\s*(loginId)\s*,\s*(setLoginId)\s*\]\s*=\s*(?:React\.)?useState/,
  /const\s*\[\s*(identifier)\s*,\s*(setIdentifier)\s*\]\s*=\s*(?:React\.)?useState/,
  /const\s*\[\s*(email)\s*,\s*(setEmail)\s*\]\s*=\s*(?:React\.)?useState/,
  /const\s*\[\s*(phone)\s*,\s*(setPhone)\s*\]\s*=\s*(?:React\.)?useState/
];

let loginState = null;

for (const pattern of loginStatePatterns) {
  const match = login.match(pattern);

  if (match) {
    loginState = match;
    break;
  }
}

if (!loginState) {
  throw new Error(
    "LOGIN PATCH STOPPED: Phone/email state was not found. Original file was not changed."
  );
}

const loginVariable = loginState[1];
const loginSetter = loginState[2];

const clearCode = `${loginSetter}(""); ${passwordSetter}("");`;

// Add a reusable clearing function inside the component.
// Insert immediately before handleLogin.
if (!login.includes("const clearLoginCredentials =")) {
  const handlePattern =
    /(\s*)(const\s+handleLogin\s*=\s*async|async\s+function\s+handleLogin|function\s+handleLogin)/;

  const handleMatch = login.match(handlePattern);

  if (!handleMatch) {
    throw new Error(
      "LOGIN PATCH STOPPED: handleLogin was not found. Original file was not changed."
    );
  }

  login = login.replace(
    handlePattern,
    `${handleMatch[1]}const clearLoginCredentials = () => {\n` +
      `${handleMatch[1]}  ${loginSetter}("");\n` +
      `${handleMatch[1]}  ${passwordSetter}("");\n` +
      `${handleMatch[1]}};\n\n` +
      `${handleMatch[1]}${handleMatch[2]}`
  );
}

// Ensure a normal form submit clears fields after handleLogin finishes.
if (/onSubmit\s*=\s*\{\s*handleLogin\s*\}/.test(login)) {
  login = login.replace(
    /onSubmit\s*=\s*\{\s*handleLogin\s*\}/,
    `onSubmit={async (event) => {
      try {
        await handleLogin(event);
      } finally {
        clearLoginCredentials();
      }
    }}`
  );
} else if (/onClick\s*=\s*\{\s*handleLogin\s*\}/.test(login)) {
  // Some existing pages use the login button directly.
  login = login.replace(
    /onClick\s*=\s*\{\s*handleLogin\s*\}/,
    `onClick={async (event) => {
      try {
        await handleLogin(event);
      } finally {
        clearLoginCredentials();
      }
    }}`
  );
} else if (
  !login.includes("await handleLogin(event);") &&
  !login.includes("clearLoginCredentials();")
) {
  throw new Error(
    "LOGIN PATCH STOPPED: Login submit binding was not found. Original file was not changed."
  );
}

// Disable browser auto-fill from bringing failed credentials back.
login = login.replace(
  /<form([^>]*)>/,
  (full, attrs) => {
    if (/autoComplete\s*=/.test(attrs)) return full;
    return `<form${attrs} autoComplete="off">`;
  }
);

// Apply safe autocomplete settings to the detected fields.
const loginValuePattern = new RegExp(
  `(value\\s*=\\s*\\{\\s*${loginVariable}\\s*\\})`,
  "g"
);

login = login.replace(
  loginValuePattern,
  `$1 autoComplete="off"`
);

const passwordValuePattern = new RegExp(
  `(value\\s*=\\s*\\{\\s*${passwordVariable}\\s*\\})`,
  "g"
);

login = login.replace(
  passwordValuePattern,
  `$1 autoComplete="new-password"`
);

fs.writeFileSync(loginFile, login, "utf8");

console.log("LOGIN FIXED:");
console.log("- Login field setter:", loginSetter);
console.log("- Password setter:", passwordSetter);
console.log("- Credentials clear after success or failure.");

/* =========================================================
   2. ADMIN CRM: LOAD USERS FROM MONGODB
   ========================================================= */

backupMessage(adminFile);

let admin = fs.readFileSync(adminFile, "utf8");

if (!admin.includes("/api/admin/mongo-users")) {
  // Insert inside AdminDashboard component.
  const componentPatterns = [
    /export\s+default\s+function\s+AdminDashboard\s*\([^)]*\)\s*\{/,
    /function\s+AdminDashboard\s*\([^)]*\)\s*\{/,
    /const\s+AdminDashboard\s*=\s*\([^)]*\)\s*=>\s*\{/
  ];

  let componentMatch = null;

  for (const pattern of componentPatterns) {
    const match = admin.match(pattern);

    if (match) {
      componentMatch = match;
      break;
    }
  }

  if (!componentMatch) {
    throw new Error(
      "ADMIN PATCH STOPPED: AdminDashboard component was not found. Login fix was saved; admin backup remains available."
    );
  }

  if (!admin.includes("setUsers")) {
    throw new Error(
      "ADMIN PATCH STOPPED: setUsers was not found. Login fix was saved; admin file was not changed."
    );
  }

  const liveUsersCode = `

  // Live registered users from the same MongoDB User collection used by login.
  React.useEffect(() => {
    let cancelled = false;

    const loadRegisteredUsers = async () => {
      try {
        const response = await fetch(
          \`\${API_BASE}/api/admin/mongo-users\`,
          {
            headers: {
              "x-user-role": "admin"
            }
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load registered users");
        }

        if (cancelled) return;

        const mappedUsers = (data.users || []).map((user) => ({
          id: user._id || user.id,
          _id: user._id || user.id,
          userCode: user.userCode || "",
          name: user.name || user.companyName || "-",
          email: user.email || "",
          phone: user.phone || "",
          mobile: user.phone || "",
          role: user.businessRole || user.role || "buyer",
          businessRole: user.businessRole || "buyer",
          plan: user.plan || "None",
          expiry: user.expiry || "-",
          kyc: user.isVerified ? "Verified" : "Pending",
          status: user.isActive === false ? "Blocked" : "Active",
          marketplace:
            user.isMarketplaceVisible === false ? "Hidden" : "Visible",
          isActive: user.isActive !== false,
          isMarketplaceVisible: user.isMarketplaceVisible !== false,
          assignedProjects: user.assignedProjects || [],
          city: user.city || "",
          state: user.state || "",
          pincode: user.pincode || "",
          address: user.address || ""
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("MongoDB user directory load failed:", error);
      }
    };

    loadRegisteredUsers();

    return () => {
      cancelled = true;
    };
  }, []);
`;

  admin = admin.replace(
    componentMatch[0],
    componentMatch[0] + liveUsersCode
  );

  fs.writeFileSync(adminFile, admin, "utf8");

  console.log("ADMIN CRM FIXED:");
  console.log("- Loads /api/admin/mongo-users");
  console.log("- User Management and CRM use MongoDB registered users.");
} else {
  console.log("ADMIN CRM already contains the MongoDB users endpoint.");
}

console.log("\nTARGETED PATCH COMPLETED.");
