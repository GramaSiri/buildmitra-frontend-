const SESSION_KEYS = ["loggedInUser", "userRole", "userName", "justLoggedIn"];

export const clearBuildMitraSession = () => {
  if (typeof window === "undefined") return;
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  sessionStorage.removeItem("justLoggedIn");
};

export const logoutToLogin = () => {
  clearBuildMitraSession();
  window.location.href = "/login";
};
