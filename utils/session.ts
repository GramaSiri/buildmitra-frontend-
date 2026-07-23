const SESSION_KEYS = [
  "currentUser",
  "loggedInUser",
  "user",
  "userRole",
  "userName",
  "uniqueCode",
  "token",
  "accessToken",
  "authToken"
];

const TEMP_SESSION_KEYS = [
  "justLoggedIn"
];

export const clearBuildMitraSession = () => {
  if (typeof window === "undefined") return;

  SESSION_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
  });

  TEMP_SESSION_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
  });
};

export const getBuildMitraUser = () => {
  if (typeof window === "undefined") return null;

  const possibleKeys = [
    "currentUser",
    "loggedInUser",
    "user"
  ];

  for (const key of possibleKeys) {
    try {
      const rawValue = sessionStorage.getItem(key);

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

  return (
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("authToken") ||
    ""
  );
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

