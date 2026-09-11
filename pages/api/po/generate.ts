import type { NextApiRequest, NextApiResponse } from "next";
import { generatePurchaseOrderPdf } from "../../../utils/whatsappAuctionStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { auction_id, bid_id, buyer_notes } = req.body || {};
      if (!auction_id) {
        return res.status(400).json({ success: false, error: "auction_id is required." });
      }

      const result = generatePurchaseOrderPdf(auction_id, bid_id, buyer_notes);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
