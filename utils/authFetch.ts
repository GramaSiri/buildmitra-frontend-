import { getBuildMitraToken, getBuildMitraUser } from "./session";

export function getAuthHeaders(
  headers: HeadersInit = {}
): HeadersInit {
  const token = getBuildMitraToken();
  const user = getBuildMitraUser();
  const userCode = user?.userCode || user?.uniqueCode || "";

  return {
    ...headers,
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
    ...(userCode
      ? {
          "x-user-code": userCode,
        }
      : {}),
  };
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: getAuthHeaders(init.headers || {}),
  });
}
