import type { NextApiRequest, NextApiResponse } from "next";
import { triggerTenMinuteBuzzerAlert } from "../../../../utils/whatsappAuctionStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const auctionId = Array.isArray(id) ? id[0] : id;

  if (!auctionId) {
    return res.status(400).json({ success: false, error: "Auction ID is required." });
  }

  if (req.method === "POST") {
    try {
      const notif = triggerTenMinuteBuzzerAlert(auctionId);
      return res.status(200).json({
        success: true,
        message: "10-minute warning buzzer alarm broadcasted across UI and WhatsApp to all active participants!",
        notification: notif
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}

