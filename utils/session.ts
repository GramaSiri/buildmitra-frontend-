const SESSION_KEYS = [
  "currentUser",
  "loggedInUser",
  "user",
  "userRole",
  "userName",
  "uniqueCode",
  "token",
  "accessToken",
  "authToken",
  "buildmitra_jwt_session",
  "buildmitraUser"
];

const TEMP_SESSION_KEYS = [
  "justLoggedIn",
  "bm_pending_registration"
];

export const clearBuildMitraSession = () => {
  if (typeof window === "undefined") return;

  SESSION_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });

  TEMP_SESSION_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
};

export const getBuildMitraUser = () => {
  if (typeof window === "undefined") return null;

  const possibleKeys = [
    "currentUser",
    "loggedInUser",
    "user",
    "buildmitraUser"
  ];

  for (const key of possibleKeys) {
    try {
      const rawValue = sessionStorage.getItem(key) || localStorage.getItem(key);

      if (!rawValue) continue;

      const parsedUser = JSON.parse(rawValue);

      if (parsedUser && typeof parsedUser === "object") {
        return parsedUser;
      }
    } catch {
      // Ignore damaged or outdated stored values.
    }
  }

  return null;
};

export const getBuildMitraToken = () => {
  if (typeof window === "undefined") return "";

  const token =
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  if (token) return token;

  const user = getBuildMitraUser();
  return user?.token || "";
};

export const isBuildMitraLoggedIn = () => {
  return Boolean(
    getBuildMitraUser() &&
    getBuildMitraToken()
  );
};

export const logoutToLogin = () => {
  clearBuildMitraSession();

  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
};
