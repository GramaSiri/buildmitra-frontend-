export const setUserSession = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

export const getName = () => {
  return getUser()?.name || "User";
};

export const getRole = () => {
  return getUser()?.role || "guest";
};

export const logout = () => {
  localStorage.removeItem("user");
  window.location.href = "/login";
};