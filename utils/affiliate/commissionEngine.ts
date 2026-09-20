import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface InventoryUnit {
  id: string;
  unitNo: string;
  type: "Plot" | "1BHK" | "2BHK" | "3BHK" | "4BHK" | "Villa" | "Commercial";
  areaSqFt: number;
  baseRatePerSqFt: number;
  totalUnitCost: number;
  negotiatedCommissionType: "percentage" | "fixed";
  negotiatedCommissionValue: number; // e.g. 3% or Rs. 1,50,000
  negotiatedMarginDiff: number; // Additional platform margin difference
  calculatedCommission: number;
  facing: "East" | "West" | "North" | "South" | "North-East" | "North-West" | "South-East" | "South-West";
  status: "Available" | "Hold" | "Sold" | "Reserved";
  floor?: string;
  dimensions?: string; // e.g. "30x40 Ft"
  notes?: string;
}

export interface MediaDrawing {
  id: string;
  title: string;
  category: "cad_floor_plan" | "site_layout" | "elevation_3d" | "brochure_pdf" | "maps_pin";
  fileUrl: string;
  fileType: string;
  description?: string;
}

export interface ProjectOffer {
  id: string;
  title: string;
  discountType: "per_sqft" | "flat_percentage" | "freebie" | "cashback";
  discountValue: number;
  description: string;
  validUntil: string;
  code: string;
  isHot: boolean;
}

export interface RealEstateProject {
  id: string;
  builderName: string;
  builderGstin: string;
  projectCode: string;
  projectName: string;
  location: string;
  city: string;
  pincode: string;
  reraNumber: string;
  totalUnits: number;
  totalAreaSqFt: number;
  commissionType: "percentage" | "fixed";
  defaultCommissionValue: number;
  description: string;
  status: "Active" | "Upcoming" | "SoldOut";
  heroImage: string;
  mediaDrawings: MediaDrawing[];
  inventory: InventoryUnit[];
  offers: ProjectOffer[];
  createdAt: string;
}

export interface AffiliateBooking {
  id: string;
  bookingCode: string;
  projectId: string;
  projectName: string;
  builderName: string;
  unitId: string;
  unitNo: string;
  unitType: string;
  areaSqFt: number;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerRefCode: string;
  finalSalePrice: number;
  calculatedCommission: number;
  gstAmount: number;
  totalCommissionWithGst: number;
  status: "Booked" | "Agreed" | "Registered" | "Cancelled";
  bookingDate: string;
  siteVisitRequested: boolean;
  visitDate?: string;
  affiliateCode?: string;
  notes?: string;
}

export interface CommissionInvoice {
  id: string;
  invoiceNo: string;
  bookingId: string;
  projectId: string;
  projectName: string;
  builderName: string;
  builderGstin: string;
  soldUnitNo: string;
  buyerRefCode: string;
  buyerName: string;
  salePrice: number;
  commissionBase: number;
  gstRate: number; // e.g. 18
  gstAmount: number;
  totalInvoiceAmount: number;
  paymentTerms: string;
  paymentStatus: "Unpaid" | "Partial" | "Paid";
  issueDate: string;
  dueDate: string;
  bankAccountDetails: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

// ----------------------------------------------------------------------
// FORMULA: Commission Amount = (Agreed Percentage * Final Sale Price) + Negotiated Margin Difference
// ----------------------------------------------------------------------
export const calculateUnitCommission = (
  unit: Partial<InventoryUnit>,
  finalSalePrice?: number
): number => {
  const salePrice = finalSalePrice ?? unit.totalUnitCost ?? 0;
  const marginDiff = unit.negotiatedMarginDiff ?? 0;

  if (unit.negotiatedCommissionType === "percentage") {
    const rate = (unit.negotiatedCommissionValue ?? 3) / 100;
    return Math.round(rate * salePrice + marginDiff);
  } else {
    // Fixed rate mode
    const fixedVal = unit.negotiatedCommissionValue ?? 100000;
    return Math.round(fixedVal + marginDiff);
  }
};

// PRODUCTION EMPTY STATE
// Transactions must originate from genuine application activity.
const MOCK_PROJECTS: RealEstateProject[] = [];
const MOCK_BOOKINGS: AffiliateBooking[] = [];
const MOCK_INVOICES: CommissionInvoice[] = [];

// STORAGE HELPERS
export const getAffiliateProjects = (): RealEstateProject[] => {
  if (typeof window === "undefined") return MOCK_PROJECTS;
  try {
    const raw = localStorage.getItem("buildmitra_affiliate_projects");
    if (!raw) {
      localStorage.setItem("buildmitra_affiliate_projects", JSON.stringify(MOCK_PROJECTS));
      return MOCK_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.some((p: any) => p.projectName.includes("Brigade") || p.projectName.includes("Sobha") || p.projectName.includes("BuildMitra Enclave"))) {
      localStorage.setItem("buildmitra_affiliate_projects", JSON.stringify(MOCK_PROJECTS));
      return MOCK_PROJECTS;
    }
    return parsed;
  } catch (e) {
    console.error("Error reading affiliate projects", e);
    return MOCK_PROJECTS;
  }
};

export const saveAffiliateProjects = (projects: RealEstateProject[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("buildmitra_affiliate_projects", JSON.stringify(projects));
  } catch (e) {
    console.error("Error saving affiliate projects", e);
  }
};

export const getAffiliateBookings = (): AffiliateBooking[] => {
  if (typeof window === "undefined") return MOCK_BOOKINGS;
  try {
    const raw = localStorage.getItem("buildmitra_affiliate_bookings");
    if (!raw) {
      localStorage.setItem("buildmitra_affiliate_bookings", JSON.stringify(MOCK_BOOKINGS));
      return MOCK_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading affiliate bookings", e);
    return MOCK_BOOKINGS;
  }
};

export const saveAffiliateBookings = (bookings: AffiliateBooking[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("buildmitra_affiliate_bookings", JSON.stringify(bookings));
  } catch (e) {
    console.error("Error saving affiliate bookings", e);
  }
};

export const getAffiliateInvoices = (): CommissionInvoice[] => {
  if (typeof window === "undefined") return MOCK_INVOICES;
  try {
    const raw = localStorage.getItem("buildmitra_affiliate_invoices");
    if (!raw) {
      localStorage.setItem("buildmitra_affiliate_invoices", JSON.stringify(MOCK_INVOICES));
      return MOCK_INVOICES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading affiliate invoices", e);
    return MOCK_INVOICES;
  }
};

export const saveAffiliateInvoices = (invoices: CommissionInvoice[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("buildmitra_affiliate_invoices", JSON.stringify(invoices));
  } catch (e) {
    console.error("Error saving affiliate invoices", e);
  }
};

// ----------------------------------------------------------------------
// OFFICIAL PDF COMMISSION TAX INVOICE EXPORTER
// ----------------------------------------------------------------------
export const generateAffiliateInvoicePdf = (invoice: CommissionInvoice) => {
  const doc = new jsPDF();

  // Primary Header Banner (Navy/Dark Blue Theme)
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 42, "F");

  // Company Name & Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("BUILDMITRA SOLUTIONS PVT LTD", 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(226, 232, 240);
  doc.text("Official Real Estate Affiliate Commission Tax Invoice", 14, 26);
  doc.text("GSTIN: 29AAACB1234C1Z9 | RERA Agent Ref: AG/KA/BENGALURU/9920", 14, 34);

  // Invoice Number Badge (Right Aligned)
  doc.setFillColor(255, 122, 0); // Accent Orange #ff7a00
  doc.roundedRect(138, 10, 58, 22, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 144, 18);
  doc.setFontSize(9);
  doc.text(invoice.invoiceNo, 144, 26);

  // Billing Metadata Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DEVELOPER / BUILDER DETAILS:", 14, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Builder Name: ${invoice.builderName}`, 14, 59);
  doc.text(`Developer GSTIN: ${invoice.builderGstin || "N/A"}`, 14, 65);
  doc.text(`Project Name: ${invoice.projectName}`, 14, 71);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("INVOICE META & REF:", 120, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Issue Date: ${invoice.issueDate}`, 120, 59);
  doc.text(`Due Date: ${invoice.dueDate}`, 120, 65);
  doc.text(`Buyer Ref Code: ${invoice.buyerRefCode}`, 120, 71);
  doc.text(`Sold Unit No: ${invoice.soldUnitNo}`, 120, 77);

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 82, 196, 82);

  // Financial Breakdown Table
  const tableData = [
    [
      "1",
      `Platform Commission Fee for ${invoice.soldUnitNo} (${invoice.projectName})`,
      `Rs. ${invoice.salePrice.toLocaleString("en-IN")}`,
      `Rs. ${invoice.commissionBase.toLocaleString("en-IN")}`,
    ],
    [
      "2",
      `CGST @ 9% (Services)`,
      "-",
      `Rs. ${(invoice.gstAmount / 2).toLocaleString("en-IN")}`,
    ],
    [
      "3",
      `SGST @ 9% (Services)`,
      "-",
      `Rs. ${(invoice.gstAmount / 2).toLocaleString("en-IN")}`,
    ],
  ];

  autoTable(doc, {
    head: [["S.No", "Description of Services", "Unit Sale Value", "Commission Amount (Rs)"]],
    body: tableData,
    startY: 86,
    styles: { fontSize: 8.5, cellPadding: 4 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;

  // Grand Total Summary Box
  doc.setFillColor(241, 245, 249);
  doc.rect(14, finalY + 6, 182, 38, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(`Base Platform Commission: Rs. ${invoice.commissionBase.toLocaleString("en-IN")}`, 20, finalY + 16);
  doc.text(`18% Goods & Services Tax (GST): Rs. ${invoice.gstAmount.toLocaleString("en-IN")}`, 20, finalY + 23);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 101, 52); // Dark Green #166534
  doc.text(`TOTAL PAYABLE AMOUNT: Rs. ${invoice.totalInvoiceAmount.toLocaleString("en-IN")}`, 20, finalY + 34);

  // Bank & Payment Terms Box
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT TERMS & BANK DETAILS FOR REMITTANCE:", 14, finalY + 52);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`• Terms: ${invoice.paymentTerms}`, 14, finalY + 59);
  doc.text(`• Account Name: ${invoice.bankAccountDetails.accountName}`, 14, finalY + 65);
  doc.text(`• Bank Account No: ${invoice.bankAccountDetails.accountNumber} | IFSC: ${invoice.bankAccountDetails.ifscCode}`, 14, finalY + 71);
  doc.text(`• Bank Branch: ${invoice.bankAccountDetails.bankName}`, 14, finalY + 77);

  // Digital Signature Block
  doc.setDrawColor(203, 213, 225);
  doc.rect(130, finalY + 52, 66, 30);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("For BUILDMITRA SOLUTIONS PVT LTD", 133, finalY + 58);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("[ Digitally Signed Invoice ]", 133, finalY + 70);
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signatory", 133, finalY + 78);

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184);
  doc.text("This is a computer-generated tax invoice issued in compliance with RERA & GST guidelines. BuildMitra Platform Engine.", 14, 285);

  doc.save(`${invoice.invoiceNo}_BuildMitra_Commission.pdf`);
};

