import { resolveMediaUrl as resolveMediaUrlImpl, FALLBACK_IMAGE_URL } from "./mediaResolver";

export function resolveMediaUrl(value?: any): string {
  if (!value) return FALLBACK_IMAGE_URL;
  return resolveMediaUrlImpl(value);
}

export default resolveMediaUrl;
