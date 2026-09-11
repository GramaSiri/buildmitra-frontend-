import type { NextApiRequest, NextApiResponse } from "next";
import { getAllAuctions, createAuction } from "../../../utils/whatsappAuctionStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const auctions = getAllAuctions();
      return res.status(200).json({
        success: true,
        count: auctions.length,
        auctions
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const payload = req.body || {};
      const newAuction = createAuction(payload);
      return res.status(201).json({
        success: true,
        message: `Auction #${newAuction.id} created successfully! Broadcast notification sent to verified regional suppliers.`,
        auction: newAuction
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
