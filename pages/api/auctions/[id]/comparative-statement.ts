import type { NextApiRequest, NextApiResponse } from "next";
import { getComparativeStatement } from "../../../../utils/whatsappAuctionStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const auctionId = Array.isArray(id) ? id[0] : id;

  if (!auctionId) {
    return res.status(400).json({ success: false, error: "Auction ID is required." });
  }

  if (req.method === "GET") {
    try {
      const role = typeof req.query.role === "string" ? req.query.role : "buyer";
      const result = getComparativeStatement(auctionId, role);
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
