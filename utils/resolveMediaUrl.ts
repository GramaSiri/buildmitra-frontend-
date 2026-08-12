export function resolveMediaUrl(value?: any): string {
  if (!value) return "";

  let raw = String(value).trim();

  if (!raw) return "";

  if (
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  raw = raw.replace(/\\/g, "/");

  // Already-public external image.
  if (
    raw.startsWith("https://") &&
    !raw.includes("/uploads/") &&
    !raw.includes("/api/marketplace/images/")
  ) {
    return raw;
  }

  // Convert old localhost/backend absolute URL to backend path.
  if (raw.startsWith("http://localhost:5000")) {
    raw = raw.replace("http://localhost:5000", "");
  }

  // Absolute backend URL containing an upload path.
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://")
  ) {
    try {
      const url = new URL(raw);

      if (
        url.pathname.startsWith("/uploads/") ||
        url.pathname.startsWith("/api/marketplace/images/") ||
        url.pathname.startsWith("/material-images/")
      ) {
        raw = url.pathname;
      } else {
        return raw;
      }
    } catch {
      return raw;
    }
  }

  const backendOwned =
    raw.startsWith("/uploads/") ||
    raw.startsWith("/api/marketplace/images/") ||
    raw.startsWith("/api/marketplace/image/") ||
    raw.startsWith("/material-images/");

  if (backendOwned) {
    return `/api/media?path=${encodeURIComponent(raw)}`;
  }

  // Stored Windows path containing uploads.
  const uploadIndex = raw.indexOf("/uploads/");

  if (uploadIndex >= 0) {
    const path = raw.substring(uploadIndex);

    return `/api/media?path=${encodeURIComponent(path)}`;
  }

  if (!raw.startsWith("/")) {
    return `/${raw}`;
  }

  return raw;
}
