import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface VerifiedSupplier {
  id: string;
  name: string;
  phone: string;
  categories: string[];
  pincodes: string[];
  rating: number;
  city: string;
  isVerified: boolean;
}

export interface AuctionItem {
  id: string;
  material_category: string;
  specific_item: string;
  brand_preference: string;
  grade: string;
  quantity: number;
  unit: string;
  target_price: number;
}

export interface AuctionBid {
  bid_id: string;
  auction_id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_phone: string;
  vendor_rating: number;
  attempt_number: number; // 1 to 5
  basic_rate_per_unit: number;
  gst_percent: number;
  gst_amount: number;
  freight_per_unit: number;
  unloading_per_unit: number;
  total_landed_rate: number;
  total_order_value: number;
  can_deliver_on_time: boolean;
  created_at: number;
  rank?: string;
  is_l1?: boolean;
  item_breakdown?: Array<{ itemId: string; basicRate: number }>;
}

export interface BulkAuction {
  id: string;
  material_category: string;
  specific_item: string;
  brand_preference: string;
  grade: string;
  quantity: number;
  unit: string;
  items?: AuctionItem[]; // Multi-item support
  site_address: string;
  site_pincode: string;
  delivery_deadline: string;
  target_price: number;
  payment_terms: string;
  quality_standard: string;
  status: "ACTIVE" | "EXPIRED" | "AWARDED";
  created_at: number;
  ends_at: number;
  current_l1_rate: number;
  formatted_countdown?: string;
  bids: AuctionBid[];
  broadcast_sent: boolean;
  notified_suppliers_count: number;
  notified_suppliers?: VerifiedSupplier[];
  awarded_bid_id?: string;
  po_number?: string;
  po_generated_at?: number;
}

// Verified Regional Supplier Registry (Bengaluru & South Region)
export const VERIFIED_SUPPLIERS: VerifiedSupplier[] = [
  { id: "VEND-101", name: "Bangalore Cement & Steel Traders", phone: "+91 98450 12345", categories: ["CEMENT", "TMT STEEL", "BLOCKS"], pincodes: ["560068", "560100", "560037", "560048", "560001"], rating: 4.9, city: "Bengaluru", isVerified: true },
  { id: "VEND-102", name: "Mahadev BuildMat Infrastructure", phone: "+91 99001 67890", categories: ["CEMENT", "TMT STEEL", "AGGREGATES", "SAND"], pincodes: ["560068", "560037", "560076", "560102", "560100"], rating: 4.7, city: "Bengaluru", isVerified: true },
  { id: "VEND-103", name: "Sri Laxmi Venkateshwara Enterprises", phone: "+91 97312 34567", categories: ["SAND", "AGGREGATES", "BLOCKS", "CEMENT"], pincodes: ["560068", "560100", "560099", "560037"], rating: 4.8, city: "Bengaluru", isVerified: true },
  { id: "VEND-104", name: "Karnataka Steel & Rebar Hub", phone: "+91 98860 99887", categories: ["TMT STEEL", "CEMENT"], pincodes: ["560068", "560100", "560048", "560001"], rating: 4.9, city: "Bengaluru", isVerified: true },
  { id: "VEND-105", name: "Apex Ceramic Tiles & Sanitary Mart", phone: "+91 94480 11223", categories: ["TILES", "CEMENT"], pincodes: ["560068", "560037", "560001", "560100"], rating: 4.6, city: "Bengaluru", isVerified: true },
  { id: "VEND-106", name: "Southern Paints & Chemical Depot", phone: "+91 96112 55443", categories: ["PAINT", "WATERPROOFING"], pincodes: ["560068", "560100", "560048"], rating: 4.8, city: "Bengaluru", isVerified: true },
  { id: "VEND-107", name: "Metro City AAC Blocks & Masonry", phone: "+91 98441 22334", categories: ["BLOCKS", "SAND", "CEMENT"], pincodes: ["560068", "560100", "560037"], rating: 4.7, city: "Bengaluru", isVerified: true }
];

// In-Memory Global Auction Store
let globalAuctions: BulkAuction[] = [
  {
    id: "BM-AUC-410",
    material_category: "CEMENT",
    specific_item: "UltraTech PPC Cement (50kg Bag)",
    brand_preference: "UltraTech / Birla Super / ACC",
    grade: "PPC (Portland Pozzolana)",
    quantity: 200,
    unit: "BAGS",
    items: [
      { id: "item-1", material_category: "CEMENT", specific_item: "UltraTech PPC Cement (50kg Bag)", brand_preference: "UltraTech", grade: "PPC", quantity: 200, unit: "BAGS", target_price: 345 }
    ],
    site_address: "Plot 42, Green Glen Layout, Bellandur, Bengaluru",
    site_pincode: "560068",
    delivery_deadline: "Tomorrow, by 11:00 AM",
    target_price: 345.0,
    payment_terms: "COD on Unloading",
    quality_standard: "100% Fresh ISI Factory Stock",
    status: "ACTIVE",
    created_at: Date.now() - 1000 * 60 * 15,
    ends_at: Date.now() + 1000 * 60 * 60 * 4.75, // ~4h 45m remaining
    current_l1_rate: 345.0,
    broadcast_sent: true,
    notified_suppliers_count: 5,
    notified_suppliers: VERIFIED_SUPPLIERS.slice(0, 5),
    bids: [
      {
        bid_id: "BID-901",
        auction_id: "BM-AUC-410",
        vendor_id: "VEND-101",
        vendor_name: "Bangalore Cement & Steel Traders",
        vendor_phone: "+91 98450 12345",
        vendor_rating: 4.9,
        attempt_number: 1,
        basic_rate_per_unit: 250.0,
        gst_percent: 28,
        gst_amount: 70.0,
        freight_per_unit: 15.0,
        unloading_per_unit: 10.0,
        total_landed_rate: 345.0,
        total_order_value: 69000.0,
        can_deliver_on_time: true,
        created_at: Date.now() - 1000 * 60 * 10
      },
      {
        bid_id: "BID-902",
        auction_id: "BM-AUC-410",
        vendor_id: "VEND-102",
        vendor_name: "Mahadev BuildMat Infrastructure",
        vendor_phone: "+91 99001 67890",
        vendor_rating: 4.7,
        attempt_number: 1,
        basic_rate_per_unit: 255.0,
        gst_percent: 28,
        gst_amount: 71.4,
        freight_per_unit: 16.0,
        unloading_per_unit: 10.0,
        total_landed_rate: 352.4,
        total_order_value: 70480.0,
        can_deliver_on_time: true,
        created_at: Date.now() - 1000 * 60 * 5
      }
    ]
  },
  {
    id: "BM-AUC-411",
    material_category: "TMT STEEL",
    specific_item: "12mm TMT Rebar (Fe550D)",
    brand_preference: "Tata Tiscon / JSW Neosteel / Jindal Panther",
    grade: "Fe550D (Seismic Grade)",
    quantity: 15,
    unit: "TONNES",
    items: [
      { id: "item-1", material_category: "TMT STEEL", specific_item: "12mm TMT Rebar (Fe550D)", brand_preference: "Tata Tiscon", grade: "Fe550D", quantity: 15, unit: "TONNES", target_price: 58500 }
    ],
    site_address: "Site 18, Electronic City Phase 1, Bengaluru",
    site_pincode: "560100",
    delivery_deadline: "Day after tomorrow, by 2:00 PM",
    target_price: 58500.0,
    payment_terms: "COD on Unloading",
    quality_standard: "100% Fresh ISI Factory Stock",
    status: "ACTIVE",
    created_at: Date.now() - 1000 * 60 * 10,
    ends_at: Date.now() + 1000 * 60 * 60 * 4.85,
    current_l1_rate: 58500.0,
    broadcast_sent: true,
    notified_suppliers_count: 4,
    notified_suppliers: VERIFIED_SUPPLIERS.slice(0, 4),
    bids: [
      {
        bid_id: "BID-903",
        auction_id: "BM-AUC-411",
        vendor_id: "VEND-104",
        vendor_name: "Karnataka Steel & Rebar Hub",
        vendor_phone: "+91 98860 99887",
        vendor_rating: 4.9,
        attempt_number: 1,
        basic_rate_per_unit: 48000.0,
        gst_percent: 18,
        gst_amount: 8640.0,
        freight_per_unit: 1200.0,
        unloading_per_unit: 660.0,
        total_landed_rate: 58500.0,
        total_order_value: 877500.0,
        can_deliver_on_time: true,
        created_at: Date.now() - 1000 * 60 * 8
      }
    ]
  }
];

// Helper: Format countdown string
export function formatCountdown(endsAtMs: number): string {
  const diffMs = endsAtMs - Date.now();
  if (diffMs <= 0) return "00h 00m 00s (EXPIRED)";
  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
}

// Auto-check auction expiration
export function updateAuctionExpiry(auction: BulkAuction): BulkAuction {
  if (Date.now() >= auction.ends_at && auction.status === "ACTIVE") {
    auction.status = "EXPIRED";
  }
  auction.formatted_countdown = formatCountdown(auction.ends_at);
  return auction;
}

export function getAllAuctions(): BulkAuction[] {
  return globalAuctions.map((a) => updateAuctionExpiry(a));
}

export function getAuctionById(id: string): BulkAuction | undefined {
  const found = globalAuctions.find((a) => a.id === id);
  if (found) return updateAuctionExpiry(found);
  return undefined;
}

// Capped at up to 5 nearby regional suppliers
export function getNearbyRegionalSuppliers(category: string, pincode: string): VerifiedSupplier[] {
  const cat = category.toUpperCase();
  const matched = VERIFIED_SUPPLIERS.filter(
    (s) => (s.categories.includes(cat) || s.categories.length === 0) &&
           (s.pincodes.includes(pincode) || s.pincodes.length === 0)
  );

  if (matched.length >= 5) return matched.slice(0, 5);

  // Add adjacent area suppliers if less than 5
  const fallback = VERIFIED_SUPPLIERS.filter((s) => !matched.some((m) => m.id === s.id));
  return [...matched, ...fallback].slice(0, 5);
}

export function createAuction(payload: Partial<BulkAuction> & { items?: AuctionItem[] }): BulkAuction {
  const newId = `BM-AUC-${Math.floor(412 + globalAuctions.length)}`;
  const now = Date.now();
  const endsAt = now + 1000 * 60 * 60 * 5; // 5 hours strict reverse clock

  const itemsList: AuctionItem[] = Array.isArray(payload.items) && payload.items.length > 0
    ? payload.items
    : [
        {
          id: "item-1",
          material_category: payload.material_category || "CEMENT",
          specific_item: payload.specific_item || "UltraTech PPC Cement (50kg Bag)",
          brand_preference: payload.brand_preference || "UltraTech",
          grade: payload.grade || "PPC",
          quantity: Number(payload.quantity) || 100,
          unit: payload.unit || "BAGS",
          target_price: Number(payload.target_price) || 345
        }
      ];

  const primaryCategory = itemsList[0].material_category.toUpperCase();
  const pincode = payload.site_pincode || "560068";

  // Filter top 5 nearby regional suppliers
  const nearbySuppliers = getNearbyRegionalSuppliers(primaryCategory, pincode);

  const initialL1 = Number(itemsList[0].target_price) || (primaryCategory === "TMT STEEL" ? 58500 : 345);

  const newAuction: BulkAuction = {
    id: newId,
    material_category: itemsList.length > 1 ? `MULTI-ITEM (${itemsList.length} Items)` : itemsList[0].material_category,
    specific_item: itemsList.length > 1 ? itemsList.map(i => `${i.quantity} ${i.unit} ${i.specific_item}`).join(" + ") : itemsList[0].specific_item,
    brand_preference: itemsList[0].brand_preference,
    grade: itemsList[0].grade,
    quantity: itemsList[0].quantity,
    unit: itemsList[0].unit,
    items: itemsList,
    site_address: payload.site_address || "Plot 42, Green Glen Layout, Bellandur, Bengaluru",
    site_pincode: pincode,
    delivery_deadline: payload.delivery_deadline || "Tomorrow, by 11:00 AM",
    target_price: initialL1,
    payment_terms: payload.payment_terms || "COD on Unloading",
    quality_standard: payload.quality_standard || "100% Fresh ISI Factory Stock",
    status: "ACTIVE",
    created_at: now,
    ends_at: endsAt,
    current_l1_rate: initialL1,
    formatted_countdown: "05h 00m 00s",
    bids: [],
    broadcast_sent: true,
    notified_suppliers_count: nearbySuppliers.length,
    notified_suppliers: nearbySuppliers
  };

  globalAuctions.unshift(newAuction);
  return newAuction;
}

export function submitBid(payload: {
  auction_id: string;
  vendor_id?: string;
  vendor_name?: string;
  vendor_phone?: string;
  basic_rate_per_unit: number;
  gst_percent?: number;
  freight_per_unit?: number;
  unloading_per_unit?: number;
  can_deliver_on_time?: boolean;
}): { success: boolean; error?: string; bid?: AuctionBid; rank?: string; auction?: BulkAuction } {
  const auction = getAuctionById(payload.auction_id);
  if (!auction) {
    return { success: false, error: "Auction not found." };
  }

  if (auction.status === "EXPIRED" || Date.now() >= auction.ends_at) {
    return { success: false, error: "Bidding window has expired. Reverse clock closed." };
  }

  const vendorId = payload.vendor_id || "VEND-" + Math.floor(108 + Math.random() * 800);
  const vendorName = payload.vendor_name || "Verified BuildMitra Supplier";
  const vendorPhone = payload.vendor_phone || "+91 98000 12345";

  // Check vendor multi-round attempts (Max 5 attempts)
  const existingVendorBids = auction.bids.filter((b) => b.vendor_id === vendorId);
  const attemptNumber = existingVendorBids.length + 1;

  if (attemptNumber > 5) {
    return { success: false, error: "Maximum multi-round rate revisions (5 attempts) reached for this auction." };
  }

  // Calculate landed rate
  const basic = Number(payload.basic_rate_per_unit);
  const gstRate = Number(payload.gst_percent || (auction.material_category === "TMT STEEL" ? 18 : 28));
  const gstAmount = (basic * gstRate) / 100;
  const freight = Number(payload.freight_per_unit || 0);
  const unloading = Number(payload.unloading_per_unit || 0);
  const totalLandedRate = Number((basic + gstAmount + freight + unloading).toFixed(2));
  const totalOrderValue = Number((totalLandedRate * auction.quantity).toFixed(2));

  // Enforce strict downward pricing validation against vendor's previous submission
  if (existingVendorBids.length > 0) {
    const previousBid = existingVendorBids[existingVendorBids.length - 1];
    if (totalLandedRate >= previousBid.total_landed_rate) {
      return {
        success: false,
        error: `Multi-round downward validation failed: Your new landed rate (₹${totalLandedRate.toFixed(2)}) must be strictly lower than your previous bid (₹${previousBid.total_landed_rate.toFixed(2)}).`
      };
    }
  }

  const newBid: AuctionBid = {
    bid_id: `BID-${Math.floor(905 + Math.random() * 9000)}`,
    auction_id: auction.id,
    vendor_id: vendorId,
    vendor_name: vendorName,
    vendor_phone: vendorPhone,
    vendor_rating: 4.8,
    attempt_number: attemptNumber,
    basic_rate_per_unit: basic,
    gst_percent: gstRate,
    gst_amount: Number(gstAmount.toFixed(2)),
    freight_per_unit: freight,
    unloading_per_unit: unloading,
    total_landed_rate: totalLandedRate,
    total_order_value: totalOrderValue,
    can_deliver_on_time: payload.can_deliver_on_time !== false,
    created_at: Date.now()
  };

  auction.bids.push(newBid);

  // Re-rank all bids by total_landed_rate ascending
  auction.bids.sort((a, b) => a.total_landed_rate - b.total_landed_rate);

  // Update current winning L1 rate
  if (auction.bids.length > 0) {
    auction.current_l1_rate = auction.bids[0].total_landed_rate;
  }

  // Assign ranks
  auction.bids.forEach((b, idx) => {
    b.rank = `L${idx + 1}`;
    b.is_l1 = idx === 0;
  });

  const updatedBid = auction.bids.find((b) => b.bid_id === newBid.bid_id) || newBid;

  return {
    success: true,
    bid: updatedBid,
    rank: updatedBid.rank,
    auction
  };
}

export function getMaskedCompetitorView(auctionId: string) {
  const auction = getAuctionById(auctionId);
  if (!auction) return { success: false, error: "Auction not found" };

  const anonymizedBids = auction.bids.map((b, idx) => ({
    bid_id: b.bid_id,
    competitor_label: idx === 0 ? "Current Best L1 Offer" : `Rival ${String.fromCharCode(65 + idx - 1)}`,
    rank: b.rank || `L${idx + 1}`,
    is_l1: idx === 0,
    total_landed_rate: b.total_landed_rate,
    basic_rate_per_unit: b.basic_rate_per_unit,
    gst_amount: b.gst_amount,
    freight_and_hamali: b.freight_per_unit + b.unloading_per_unit,
    timestamp: b.created_at
  }));

  return {
    success: true,
    auction_id: auction.id,
    material: auction.items && auction.items.length > 1 ? `Multi-Item Enquiry (${auction.items.length} Items)` : `${auction.quantity} ${auction.unit} ${auction.material_category}`,
    current_l1_rate: auction.current_l1_rate,
    formatted_countdown: auction.formatted_countdown,
    competitor_bids: anonymizedBids
  };
}

export function getComparativeStatement(auctionId: string) {
  const auction = getAuctionById(auctionId);
  if (!auction) return { success: false, error: "Auction not found" };

  const baselineRate = auction.target_price || 365;

  const comparativeSheet = auction.bids.map((b, idx) => {
    const isL1 = idx === 0;
    const unitSavings = Math.max(0, baselineRate - b.total_landed_rate);
    const totalSavings = Number((unitSavings * auction.quantity).toFixed(2));

    return {
      rank: b.rank || `L${idx + 1}`,
      is_l1: isL1,
      bid_id: b.bid_id,
      vendor_id: b.vendor_id,
      vendor_name: b.vendor_name,
      vendor_rating: b.vendor_rating || 4.8,
      attempt_number: b.attempt_number,
      basic_rate_per_unit: b.basic_rate_per_unit,
      gst_percent: b.gst_percent,
      gst_amount: b.gst_amount,
      freight_per_unit: b.freight_per_unit,
      unloading_per_unit: b.unloading_per_unit,
      total_landed_rate: b.total_landed_rate,
      total_order_value: b.total_order_value,
      baseline_benchmark_rate: baselineRate,
      unit_savings: Number(unitSavings.toFixed(2)),
      total_savings: totalSavings,
      can_deliver_on_time: b.can_deliver_on_time
    };
  });

  return {
    success: true,
    auction_id: auction.id,
    material_category: auction.material_category,
    specific_item: auction.specific_item,
    quantity: auction.quantity,
    unit: auction.unit,
    items: auction.items || [],
    site_pincode: auction.site_pincode,
    site_address: auction.site_address,
    status: auction.status,
    formatted_countdown: auction.formatted_countdown,
    comparative_statement: comparativeSheet
  };
}

export function generatePurchaseOrderPdf(auctionId: string, bidId?: string, buyerNotes?: string) {
  const auction = getAuctionById(auctionId);
  if (!auction) throw new Error("Auction not found");

  const selectedBid = bidId
    ? auction.bids.find((b) => b.bid_id === bidId)
    : auction.bids[0];

  if (!selectedBid) throw new Error("No eligible L1 bid found for PO generation");

  auction.status = "AWARDED";
  auction.awarded_bid_id = selectedBid.bid_id;
  auction.po_number = `BM-PO-${Math.floor(88000 + Math.random() * 9000)}`;
  auction.po_generated_at = Date.now();

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BUILDMITRA INFRASTRUCTURE HUB", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL L1 PURCHASE ORDER — REVERSE AUCTION", 14, 23);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`PO #: ${auction.po_number}`, 150, 15);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 150, 22);

  // Order & Site Summary
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("1. BUYER & DELIVERY SITE DETAILS", 14, 42);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Auction Reference ID: #${auction.id}`, 14, 48);
  doc.text(`Material Item: ${auction.specific_item} (${auction.material_category})`, 14, 54);
  doc.text(`Brand Preference: ${auction.brand_preference}`, 14, 60);
  doc.text(`Order Quantity: ${auction.quantity} ${auction.unit}`, 14, 66);
  doc.text(`Delivery Site Address: ${auction.site_address}`, 14, 72);
  doc.text(`Site Pincode: ${auction.site_pincode}`, 14, 78);
  doc.text(`Unloading Deadline: ${auction.delivery_deadline}`, 14, 84);

  // Supplier Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("2. AWARDED L1 SUPPLIER DETAILS", 110, 42);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Vendor Name: ${selectedBid.vendor_name}`, 110, 48);
  doc.text(`Vendor Contact: ${selectedBid.vendor_phone}`, 110, 54);
  doc.text(`Vendor Rating: ${selectedBid.vendor_rating} / 5.0 Star Verified`, 110, 60);
  doc.text(`Bid Attempt #: R${selectedBid.attempt_number} (Winning L1 Submission)`, 110, 66);
  doc.text(`Payment Terms: ${auction.payment_terms}`, 110, 72);
  doc.text(`Quality Standard: ${auction.quality_standard}`, 110, 78);

  // Landed Cost Table
  const tableHead = [["Item Description", "Qty", "Unit", "Basic Rate", "GST", "Freight/Unit", "Hamali/Unit", "Landed Rate", "Total Order Value"]];
  const tableData = [
    [
      auction.specific_item,
      String(auction.quantity),
      auction.unit,
      `INR ${selectedBid.basic_rate_per_unit.toFixed(2)}`,
      `${selectedBid.gst_percent}% (INR ${selectedBid.gst_amount.toFixed(2)})`,
      `INR ${selectedBid.freight_per_unit.toFixed(2)}`,
      `INR ${selectedBid.unloading_per_unit.toFixed(2)}`,
      `INR ${selectedBid.total_landed_rate.toFixed(2)}`,
      `INR ${selectedBid.total_order_value.toLocaleString("en-IN")}`
    ]
  ];

  autoTable(doc, {
    startY: 92,
    head: tableHead,
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 120;

  // Savings Box
  const baselineRate = auction.target_price || 365;
  const unitSavings = Math.max(0, baselineRate - selectedBid.total_landed_rate);
  const totalSavings = unitSavings * auction.quantity;

  doc.setFillColor(240, 253, 244); // #f0fdf4
  doc.setDrawColor(34, 197, 94); // #22c55e
  doc.roundedRect(14, finalY + 8, 182, 22, 3, 3, "FD");

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`REVERSE AUCTION PROJECT SAVINGS SUMMARY`, 20, finalY + 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Baseline Market Rate: INR ${baselineRate.toFixed(2)} / ${auction.unit}  |  Winning L1 Rate: INR ${selectedBid.total_landed_rate.toFixed(2)} / ${auction.unit}`, 20, finalY + 23);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Net Project Savings: INR ${totalSavings.toLocaleString("en-IN")} (${((totalSavings / (baselineRate * auction.quantity)) * 100).toFixed(1)}% Saved)`, 110, finalY + 16);

  // Signatures & Notes
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(buyerNotes || "Authorized BuildMitra Automated Zero-Touch Reverse Auction System Document.", 14, finalY + 38);

  doc.setFont("helvetica", "normal");
  doc.text("BuildMitra Authorized Digital Seal", 145, finalY + 44);
  doc.setLineWidth(0.5);
  doc.line(140, finalY + 42, 190, finalY + 42);

  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBase64 = Buffer.from(pdfArrayBuffer).toString("base64");

  return {
    success: true,
    po_number: auction.po_number,
    po_details: {
      po_number: auction.po_number,
      auction_id: auction.id,
      vendor_name: selectedBid.vendor_name,
      vendor_phone: selectedBid.vendor_phone,
      material: auction.specific_item,
      quantity: auction.quantity,
      unit: auction.unit,
      landed_rate: selectedBid.total_landed_rate,
      total_order_value: selectedBid.total_order_value,
      total_savings: totalSavings,
      delivery_address: auction.site_address,
      issued_at: new Date().toISOString()
    },
    pdf_base64: pdfBase64
  };
}
