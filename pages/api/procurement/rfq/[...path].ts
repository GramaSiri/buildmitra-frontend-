import type { NextApiRequest, NextApiResponse } from "next";
import { getApiUrl } from "../../../../utils/apiConfig";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { path } = req.query;
    const pathString = Array.isArray(path) ? path.join('/') : path || '';
    const backendUrl = getApiUrl(`/api/procurement/rfq/${pathString}`);

    const options: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers['x-user-code'] ? { 'x-user-code': String(req.headers['x-user-code']) } : {})
      }
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method || '') && req.body) {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const backendRes = await fetch(backendUrl, options);
    const contentType = backendRes.headers.get('content-type') || '';

    if (contentType.includes('application/pdf')) {
      const buffer = await backendRes.arrayBuffer();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', backendRes.headers.get('content-disposition') || 'attachment; filename=PO.pdf');
      return res.send(Buffer.from(buffer));
    }

    const data = await backendRes.json();
    return res.status(backendRes.status).json(data);
  } catch (error: any) {
    console.error("Next API Proxy Error:", error);
    return res.status(500).json({ success: false, message: error.message || 'API Proxy Error' });
  }
}
