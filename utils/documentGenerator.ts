import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type BuildMitraDocumentType =
  | "ENQUIRY"
  | "QUOTATION"
  | "PURCHASE ORDER"
  | "INVOICE"
  | "RECEIPT"
  | "DELIVERY CHALLAN";

export type BuildMitraDocumentItem = {
  description: string;
  quantity?: number | string;
  unit?: string;
  rate?: number | string;
  gst?: number | string;
  amount?: number | string;
};

export type BuildMitraDocumentData = {
  documentType: BuildMitraDocumentType;
  documentNumber?: string;
  date?: string;

  providerName?: string;
  providerCode?: string;
  providerPhone?: string;
  providerEmail?: string;
  providerAddress?: string;
  providerGstin?: string;

  customerName?: string;
  customerCode?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;

  projectName?: string;
  subject?: string;

  items?: BuildMitraDocumentItem[];

  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  gstAmount?: number;
  grandTotal?: number;

  validity?: string;
  deliveryTerms?: string;
  paymentTerms?: string;
  notes?: string;

  fileName?: string;
};

const money = (value: any) => {
  const amount = Number(value || 0);

  return `Rs. ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const safe = (value: any) => String(value ?? "").trim() || "-";

export const generateBuildMitraDocument = (
  data: BuildMitraDocumentData
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const documentDate =
    data.date || new Date().toLocaleDateString("en-IN");

  const documentNumber =
    data.documentNumber ||
    `BM-${data.documentType.replace(/\s/g, "-")}-${Date.now()}`;

  // Header
  doc.setFillColor(128, 0, 32);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("BUILDMITRA", 14, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Build Smarter. Save Bigger.", 14, 20);
  doc.text("Construction, Marketplace & Project Management Platform", 14, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(data.documentType, pageWidth - 14, 14, {
    align: "right"
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`No: ${documentNumber}`, pageWidth - 14, 21, {
    align: "right"
  });
  doc.text(`Date: ${documentDate}`, pageWidth - 14, 26, {
    align: "right"
  });

  doc.setTextColor(30, 41, 59);

  // Provider and customer details
  autoTable(doc, {
    startY: 36,
    margin: { left: 14, right: 14 },
    theme: "grid",
    head: [["FROM / PROVIDER", "TO / CUSTOMER"]],
    body: [
      [
        [
          safe(data.providerName),
          data.providerCode ? `Code: ${data.providerCode}` : "",
          data.providerPhone ? `Mobile: ${data.providerPhone}` : "",
          data.providerEmail ? `Email: ${data.providerEmail}` : "",
          data.providerAddress
            ? `Address: ${data.providerAddress}`
            : "",
          data.providerGstin ? `GSTIN: ${data.providerGstin}` : ""
        ]
          .filter(Boolean)
          .join("\n"),

        [
          safe(data.customerName),
          data.customerCode ? `Code: ${data.customerCode}` : "",
          data.customerPhone ? `Mobile: ${data.customerPhone}` : "",
          data.customerEmail ? `Email: ${data.customerEmail}` : "",
          data.customerAddress
            ? `Address: ${data.customerAddress}`
            : ""
        ]
          .filter(Boolean)
          .join("\n")
      ]
    ],
    headStyles: {
      fillColor: [128, 0, 32],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
      valign: "top"
    }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 7;

  if (data.projectName || data.subject) {
    doc.setFontSize(10);

    if (data.projectName) {
      doc.setFont("helvetica", "bold");
      doc.text("Project:", 14, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(safe(data.projectName), 34, currentY);
      currentY += 6;
    }

    if (data.subject) {
      doc.setFont("helvetica", "bold");
      doc.text("Subject:", 14, currentY);
      doc.setFont("helvetica", "normal");

      const subjectLines = doc.splitTextToSize(
        safe(data.subject),
        pageWidth - 49
      );

      doc.text(subjectLines, 34, currentY);
      currentY += subjectLines.length * 5 + 3;
    }
  }

  const items =
    data.items && data.items.length
      ? data.items
      : [
          {
            description: data.subject || data.documentType,
            quantity: 1,
            unit: "Job",
            rate: data.subtotal || data.grandTotal || 0,
            gst: 0,
            amount: data.subtotal || data.grandTotal || 0
          }
        ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: "grid",
    head: [
      [
        "Sl.",
        "Description",
        "Qty",
        "Unit",
        "Rate",
        "GST %",
        "Amount"
      ]
    ],
    body: items.map((item, index) => [
      index + 1,
      safe(item.description),
      safe(item.quantity),
      safe(item.unit),
      money(item.rate),
      safe(item.gst),
      money(item.amount)
    ]),
    headStyles: {
      fillColor: [128, 0, 32],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 65 },
      2: { cellWidth: 15, halign: "right" },
      3: { cellWidth: 17 },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 17, halign: "right" },
      6: { cellWidth: 29, halign: "right" }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  const subtotal =
    data.subtotal ??
    items.reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );

  const discount = Number(data.discount || 0);
  const deliveryCharge = Number(data.deliveryCharge || 0);
  const gstAmount = Number(data.gstAmount || 0);

  const grandTotal =
    data.grandTotal ??
    subtotal - discount + deliveryCharge + gstAmount;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 110, right: 14 },
    theme: "grid",
    body: [
      ["Subtotal", money(subtotal)],
      ["Discount", money(discount)],
      ["Delivery Charges", money(deliveryCharge)],
      ["GST", money(gstAmount)],
      ["Grand Total", money(grandTotal)]
    ],
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "right" }
    },
    didParseCell: (hookData: any) => {
      if (hookData.row.index === 4) {
        hookData.cell.styles.fillColor = [128, 0, 32];
        hookData.cell.styles.textColor = [255, 255, 255];
        hookData.cell.styles.fontStyle = "bold";
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  const terms = [
    data.validity ? `Validity: ${data.validity}` : "",
    data.deliveryTerms
      ? `Delivery Terms: ${data.deliveryTerms}`
      : "",
    data.paymentTerms
      ? `Payment Terms: ${data.paymentTerms}`
      : "",
    data.notes ? `Notes: ${data.notes}` : ""
  ].filter(Boolean);

  if (terms.length) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Terms & Notes", 14, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const lines = doc.splitTextToSize(
      terms.join("\n"),
      pageWidth - 28
    );

    doc.text(lines, 14, currentY + 6);
  }

  // Footer on every page
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);

    doc.setDrawColor(128, 0, 32);
    doc.line(14, pageHeight - 17, pageWidth - 14, pageHeight - 17);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);

    doc.text(
      "Computer-generated document from BuildMitra.",
      14,
      pageHeight - 11
    );

    doc.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - 14,
      pageHeight - 11,
      { align: "right" }
    );

    doc.text(
      "Build Smarter. Save Bigger.",
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  const cleanFileName = (
    data.fileName ||
    `${data.documentType}-${documentNumber}`
  )
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "-");

  doc.save(`${cleanFileName}.pdf`);

  return {
    documentNumber,
    grandTotal,
    fileName: `${cleanFileName}.pdf`
  };
};