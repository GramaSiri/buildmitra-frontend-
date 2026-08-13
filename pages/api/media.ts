import type { NextApiRequest, NextApiResponse } from "next";

const RAW_BACKEND =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://buildmitra-backend-beta.onrender.com";

const BACKEND = (() => {
  try {
    const url = new URL(RAW_BACKEND);
    return url.origin;
  } catch {
    return "https://buildmitra-backend-beta.onrender.com";
  }
})();

function allowedMediaPath(path: string) {
  return (
    path.startsWith("/uploads/") ||
    path.startsWith("/api/marketplace/images/") ||
    path.startsWith("/api/marketplace/image/") ||
    path.startsWith("/material-images/")
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).end("Method Not Allowed"); return;
  }

  let mediaPath = String(req.query.path || "").trim();

  if (!mediaPath) {
    res.status(400).json({
      success: false,
      message: "Media path is required",
    }); return;
  }

  try {
    mediaPath = decodeURIComponent(mediaPath);
  } catch {}

  mediaPath = mediaPath.replace(/\\/g, "/");

  // If an old localhost URL was saved, retain only its backend path.
  if (mediaPath.startsWith("http://localhost:5000")) {
    mediaPath = mediaPath.replace("http://localhost:5000", "");
  }

  // Prevent arbitrary proxying / SSRF.
  if (!allowedMediaPath(mediaPath)) {
    res.status(403).json({
      success: false,
      message: "Media path not allowed",
    }); return;
  }

  const backendBase = BACKEND.replace(/\/+$/, "");
  const cleanPath = `/${mediaPath.replace(/^\/+/, "")}`;
  const target = `${backendBase}${cleanPath}`;

  try {
    const upstream = await fetch(target, {
      method: req.method === "HEAD" ? "HEAD" : "GET",
      headers: {
        Accept: req.headers.accept || "*/*",
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).end(); return;
    }

    const contentType =
      upstream.headers.get("content-type") ||
      "application/octet-stream";

    res.setHeader("Content-Type", contentType);

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    res.setHeader(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
    );

    res.setHeader("X-Content-Type-Options", "nosniff");

    if (req.method === "HEAD") {
      res.status(200).end(); return;
    }

    const arrayBuffer = await upstream.arrayBuffer();

    return res
      .status(200)
      .send(Buffer.from(arrayBuffer));

  } catch (error) {
    console.error("BuildMitra media proxy error:", error);

    return res.status(502).json({
      success: false,
      message: "Unable to load media",
    });
  }
}


