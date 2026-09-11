import type { NextApiRequest, NextApiResponse } from "next";
import { submitBid, getMaskedCompetitorView } from "../../../utils/whatsappAuctionStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { auction_id, basic_rate_per_unit, vendor_name, vendor_phone } = req.body || {};

      if (!auction_id || !basic_rate_per_unit) {
        return res.status(400).json({ success: false, error: "auction_id and basic_rate_per_unit are required." });
      }

      const submitResult = submitBid({
        auction_id,
        vendor_name: vendor_name || "WhatsApp Mobile Supplier",
        vendor_phone: vendor_phone || "+91 98450 99887",
        basic_rate_per_unit: Number(basic_rate_per_unit),
        can_deliver_on_time: true
      });

      if (!submitResult.success) {
        return res.status(400).json(submitResult);
      }

      const competitorView = getMaskedCompetitorView(auction_id);

      return res.status(200).json({
        success: true,
        message: `WhatsApp interactive bid accepted! New rank: ${submitResult.rank}`,
        bid: submitResult.bid,
        rank: submitResult.rank,
        competitor_view: competitorView
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
