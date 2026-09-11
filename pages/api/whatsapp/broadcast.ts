import type { NextApiRequest, NextApiResponse } from "next";
import { getAuctionById, getNearbyRegionalSuppliers } from "../../../utils/whatsappAuctionStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { auction_id } = req.body || {};
      if (!auction_id) {
        return res.status(400).json({ success: false, error: "auction_id is required." });
      }

      const auction = getAuctionById(auction_id);
      if (!auction) {
        return res.status(404).json({ success: false, error: "Auction not found." });
      }

      const primaryCat = (auction.material_category || "CEMENT").split(" ")[0].toUpperCase();
      const pincode = auction.site_pincode || "560068";

      // Get up to 5 nearby regional suppliers
      const nearbySuppliers = getNearbyRegionalSuppliers(primaryCat, pincode);

      return res.status(200).json({
        success: true,
        message: `WhatsApp Broadcast dispatched to ${nearbySuppliers.length} nearby verified suppliers in Pincode region ${pincode}.`,
        auction_id: auction.id,
        recipient_count: nearbySuppliers.length,
        suppliers: nearbySuppliers.map((s) => ({ id: s.id, name: s.name, phone: s.phone, rating: s.rating, pincodes: s.pincodes })),
        action_button: {
          label: "Place Bid",
          url: `https://buildmitra.com/bulk-buying?auctionId=${auction.id}&tab=supplier_bidding`
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
