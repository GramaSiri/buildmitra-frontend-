import type { NextApiRequest, NextApiResponse } from "next";
import { getNearbyRegionalSuppliers } from "../../../utils/whatsappAuctionStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { pincode, category, categories, radius, auctionId } = req.query;
      const cleanPin = typeof pincode === "string" ? pincode : "560078";
      const cleanCat = typeof categories === "string" ? categories : (typeof category === "string" ? category : "CEMENT");
      const maxRadius = typeof radius === "string" ? parseFloat(radius) : 25.0;
      const aucId = typeof auctionId === "string" ? auctionId : "";

      const suppliers = getNearbyRegionalSuppliers(cleanCat, cleanPin, maxRadius, aucId);

      return res.status(200).json({
        success: true,
        pincode: cleanPin,
        category: cleanCat,
        radiusKm: maxRadius,
        matchedCount: suppliers.length,
        suppliers
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}

