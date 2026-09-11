import type { NextApiRequest, NextApiResponse } from "next";
import { submitBid } from "../../utils/whatsappAuctionStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const payload = req.body || {};
      if (!payload.auction_id) {
        return res.status(400).json({ success: false, error: "auction_id is required." });
      }

      if (!payload.basic_rate_per_unit || Number(payload.basic_rate_per_unit) <= 0) {
        return res.status(400).json({ success: false, error: "Valid basic_rate_per_unit is required." });
      }

      const result = submitBid(payload);
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
