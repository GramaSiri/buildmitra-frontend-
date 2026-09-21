import { getBuildMitraToken } from "./session";

export function getAuthHeaders(
  headers: HeadersInit = {}
): HeadersInit {
  const token = getBuildMitraToken();

  return {
    ...headers,
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
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
