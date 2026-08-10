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

// INITIAL SEED DATA
const MOCK_PROJECTS: RealEstateProject[] = [
  {
    id: "proj-101",
    builderName: "Brigade Developers Ltd",
    builderGstin: "29AAAAA0000A1Z5",
    projectCode: "BD-MEADOWS-01",
    projectName: "Brigade Meadows & Plotted Layouts",
    location: "Kanakapura Road / Electronic City Link, Bengaluru",
    city: "Bengaluru",
    pincode: "560082",
    reraNumber: "PRM/KA/RERA/1251/308/PR/210415/004120",
    totalUnits: 48,
    totalAreaSqFt: 120000,
    commissionType: "percentage",
    defaultCommissionValue: 3.5,
    description: "Premium RERA-approved plotted layout & 2/3 BHK luxury smart residences with clubhouse & Vastu compliant designs.",
    status: "Active",
    heroImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    offers: [
      {
        id: "off-1",
        title: "Early Bird Launch Offer",
        discountType: "per_sqft",
        discountValue: 200,
        description: "Save ₹200/Sq.Ft on first 10 plot bookings this month!",
        validUntil: "2026-09-30",
        code: "EARLYBIRD200",
        isHot: true,
      },
      {
        id: "off-2",
        title: "Festive Registration Benefit",
        discountType: "freebie",
        discountValue: 0,
        description: "Free stamp duty reimbursement & 8g Gold Coin on agreement signing.",
        validUntil: "2026-10-15",
        code: "FESTIVEGOLD",
        isHot: false,
      },
    ],
    mediaDrawings: [
      {
        id: "drg-1",
        title: "Master Site Layout Plan (CAD)",
        category: "site_layout",
        fileUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
        fileType: "image/jpeg",
        description: "Architectural masterplan with 40ft wide internal asphalt roads and underground utility piping.",
      },
      {
        id: "drg-2",
        title: "3BHK Deluxe Floor Plan & Room Dimensions",
        category: "cad_floor_plan",
        fileUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
        fileType: "image/jpeg",
        description: "1550 Sq.Ft 3BHK unit layout showing balcony orientation and Vastu room vectors.",
      },
      {
        id: "drg-3",
        title: "3D Elevation View & Facade",
        category: "elevation_3d",
        fileUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
        fileType: "image/jpeg",
        description: "Architectural 3D render of front elevation and green park view.",
      },
    ],
    inventory: [
      {
        id: "unit-101",
        unitNo: "Plot #12",
        type: "Plot",
        areaSqFt: 1200,
        dimensions: "30x40 Ft",
        baseRatePerSqFt: 4500,
        totalUnitCost: 5400000,
        negotiatedCommissionType: "percentage",
        negotiatedCommissionValue: 3.5,
        negotiatedMarginDiff: 25000,
        calculatedCommission: 214000,
        facing: "East",
        status: "Available",
        notes: "Corner plot facing 40ft main avenue road.",
      },
      {
        id: "unit-102",
        unitNo: "Plot #15",
        type: "Plot",
        areaSqFt: 2400,
        dimensions: "40x60 Ft",
 baseRatePerSqFt: 4400,
        totalUnitCost: 10560000,
        negotiatedCommissionType: "percentage",
        negotiatedCommissionValue: 3.5,
        negotiatedMarginDiff: 50000,
        calculatedCommission: 419600,
        facing: "North",
        status: "Hold",
        notes: "Blocked for VIP site visit.",
      },
      {
        id: "unit-103",
        unitNo: "Flat A-302",
        type: "3BHK",
        areaSqFt: 1550,
        baseRatePerSqFt: 6200,
        totalUnitCost: 9610000,
        negotiatedCommissionType: "percentage",
        negotiatedCommissionValue: 3.5,
        negotiatedMarginDiff: 35000,
        calculatedCommission: 371350,
        facing: "East",
        status: "Available",
        floor: "3rd Floor",
        notes: "Pool view with double height balcony.",
      },
      {
        id: "unit-104",
        unitNo: "Flat B-104",
        type: "2BHK",
        areaSqFt: 1180,
        baseRatePerSqFt: 6000,
        totalUnitCost: 7080000,
        negotiatedCommissionType: "percentage",
        negotiatedCommissionValue: 3.5,
        negotiatedMarginDiff: 20000,
        calculatedCommission: 267800,
        facing: "North-East",
        status: "Sold",
        floor: "1st Floor",
        notes: "Sold via Affiliate Partner Ref #BM-8821",
      },
      {
        id: "unit-105",
        unitNo: "Villa V-08",
        type: "Villa",
        areaSqFt: 3200,
        baseRatePerSqFt: 8500,
        totalUnitCost: 27200000,
        negotiatedCommissionType: "percentage",
        negotiatedCommissionValue: 4.0,
        negotiatedMarginDiff: 100000,
        calculatedCommission: 1188000,
        facing: "East",
        status: "Available",
        floor: "Duplex + Terrace",
        notes: "4 Bedroom Triplex Villa with private garden.",
      },
    ],
    createdAt: "2026-07-01",
  },
  {
    id: "proj-102",
    builderName: "Sobha Developers Ltd",
    builderGstin: "29BBBBB1111B2Z8",
    projectCode: "SOBHA-ROYAL-02",
    projectName: "Sobha Royal Crest Enclave",
    location: "Banashankari 3rd Stage, Outer Ring Road, Bengaluru",
    city: "Bengaluru",
    pincode: "560085",
    reraNumber: "PRM/KA/RERA/1251/310/PR/220510/004890",
    totalUnits: 32,
    totalAreaSqFt: 85000,
    commissionType: "percentage",
    defaultCommissionValue: 4.0,
    description: "Ultra-luxury high rise apartments & commercial retail spaces crafted with German structural technology.",
    status: "Active",
    heroImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    offers: [
      {
        id: "off-3",
        title: "Zero Registration Fee",
        discountType: "flat_percentage",
        discountValue: 2,
        description: "2% instant rebate on agreement registration value.",
        validUntil: "2026-11-30",
        code: "ZEROREG2026",
        isHot: true,
      },
    ],
    mediaDrawings: [
      {
        id: "drg-4",
        title: "Structural Column & Beam Layout",
        category: "cad_floor_plan",
        fileUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
        fileType: "image/jpeg",
        description: "RCC framed structure engineering layout approved by BBMP.",
      },
    ],
    inventory: [
      {
        id: "unit-201",
        unitNo: "Flat 501",
        type: "4BHK",
        areaSqFt: 2450,
        baseRatePerSqFt: 9200,
        totalUnitCost: 22540000,
        negotiatedCommissionType: "percentage",
        negotiatedCommissionValue: 4.0,
        negotiatedMarginDiff: 75000,
        calculatedCommission: 976600,
        facing: "East",
        status: "Available",
        floor: "5th Floor",
      },
      {
        id: "unit-202",
        unitNo: "Shop CS-02",
        type: "Commercial",
        areaSqFt: 850,
        baseRatePerSqFt: 14500,
        totalUnitCost: 12325000,
        negotiatedCommissionType: "percentage",
        negotiatedCommissionValue: 4.5,
        negotiatedMarginDiff: 50000,
        calculatedCommission: 604625,
        facing: "North",
        status: "Reserved",
        floor: "Ground Floor Main Entrance",
      },
    ],
    createdAt: "2026-07-15",
  },
];

const MOCK_BOOKINGS: AffiliateBooking[] = [
  {
    id: "book-1001",
    bookingCode: "BK-2026-091",
    projectId: "proj-101",
    projectName: "Brigade Meadows & Plotted Layouts",
    builderName: "Brigade Developers Ltd",
    unitId: "unit-104",
    unitNo: "Flat B-104",
    unitType: "2BHK",
    areaSqFt: 1180,
    buyerName: "Rajesh Kumar Sharma",
    buyerPhone: "+91 98450 12345",
    buyerEmail: "rajesh.sharma@gmail.com",
    buyerRefCode: "REF-BM-8821",
    finalSalePrice: 7080000,
    calculatedCommission: 267800,
    gstAmount: 48204,
    totalCommissionWithGst: 316004,
    status: "Agreed",
    bookingDate: "2026-08-02",
    siteVisitRequested: true,
    affiliateCode: "AFF-BENGALURU-07",
  },
];

const MOCK_INVOICES: CommissionInvoice[] = [
  {
    id: "inv-2001",
    invoiceNo: "INV-BM-2026-001",
    bookingId: "book-1001",
    projectId: "proj-101",
    projectName: "Brigade Meadows & Plotted Layouts",
    builderName: "Brigade Developers Ltd",
    builderGstin: "29AAAAA0000A1Z5",
    soldUnitNo: "Flat B-104",
    buyerRefCode: "REF-BM-8821",
    buyerName: "Rajesh Kumar Sharma",
    salePrice: 7080000,
    commissionBase: 267800,
    gstRate: 18,
    gstAmount: 48204,
    totalInvoiceAmount: 316004,
    paymentTerms: "50% on Agreement, 50% on Registration",
    paymentStatus: "Paid",
    issueDate: "2026-08-03",
    dueDate: "2026-08-18",
    bankAccountDetails: {
      accountName: "BUILDMITRA SOLUTIONS PVT LTD",
      accountNumber: "50200049281729",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank, Indiranagar Branch, Bengaluru",
    },
  },
];

// STORAGE HELPERS
export const getAffiliateProjects = (): RealEstateProject[] => {
  if (typeof window === "undefined") return MOCK_PROJECTS;
  try {
    const raw = localStorage.getItem("buildmitra_affiliate_projects");
    if (!raw) {
      localStorage.setItem("buildmitra_affiliate_projects", JSON.stringify(MOCK_PROJECTS));
      return MOCK_PROJECTS;
    }
    return JSON.parse(raw);
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
