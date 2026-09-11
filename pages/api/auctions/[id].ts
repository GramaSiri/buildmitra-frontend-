import type { NextApiRequest, NextApiResponse } from "next";
import { getAuctionById, getMaskedCompetitorView } from "../../../utils/whatsappAuctionStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const auctionId = Array.isArray(id) ? id[0] : id;

  if (!auctionId) {
    return res.status(400).json({ success: false, error: "Auction ID is required." });
  }

  if (req.method === "GET") {
    try {
      const auction = getAuctionById(auctionId);
      if (!auction) {
        return res.status(404).json({ success: false, error: "Auction not found." });
      }

      const maskedCompetitorView = getMaskedCompetitorView(auctionId);

      return res.status(200).json({
        success: true,
        auction,
        masked_competitor_view: maskedCompetitorView
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
