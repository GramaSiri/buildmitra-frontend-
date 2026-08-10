import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (data: any[], columns: string[], fileName: string = "Electrical_BOQ_Report") => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("BuildMitra — Electrical, Power & Solar BOQ Estimate", 14, 16);
  doc.setFontSize(10);
  doc.text("Official Technical Specification & Cost Estimate | Bengaluru Benchmark", 14, 22);

  autoTable(doc, {
    head: [columns],
    body: data.map((row) => columns.map((col) => row[col])),
    startY: 28,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
  });

  doc.save(`${fileName}.pdf`);
};

export const generateElectricalPdfReport = (
  sanctionedKw: number,
  solarKw: number,
  boqItems: Array<{ category: string; itemDescription: string; unit: string; quantity: number; ratePerUnit: number; totalAmount: number }>,
  subtotal: number,
  overheadAmount: number,
  grandTotal: number
) => {
  const doc = new jsPDF();

  // Title Header Block
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BUILDMITRA — ELECTRICAL & SOLAR BOQ REPORT", 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("Residential Electrical Works, BESCOM Utility & Solar PV Specification Sheet", 14, 26);

  // Project Summary Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PROJECT OVERVIEW & BESCOM SANCTION", 14, 46);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`• BESCOM Sanctioned Load: ${sanctionedKw} kW (${sanctionedKw <= 5 ? "Single Phase 230V" : "Three Phase 415V"})`, 14, 53);
  doc.text(`• Rooftop Solar PV Capacity: ${solarKw > 0 ? `${solarKw} kW Grid-Tie Net Metered` : "None"}`, 14, 59);
  doc.text(`• Date of Estimation: ${new Date().toLocaleDateString("en-IN")}`, 14, 65);

  // BOQ Table
  const tableData = boqItems.map((item) => [
    item.category,
    item.itemDescription.length > 45 ? item.itemDescription.slice(0, 42) + "..." : item.itemDescription,
    item.unit,
    item.quantity.toString(),
    `Rs ${item.ratePerUnit.toLocaleString()}`,
    `Rs ${item.totalAmount.toLocaleString()}`,
  ]);

  autoTable(doc, {
    head: [["Category", "Item Description", "Unit", "Qty", "Rate (Rs)", "Amount (Rs)"]],
    body: tableData,
    startY: 72,
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // Grand Total Summary
  doc.setFillColor(241, 245, 249);
  doc.rect(14, finalY + 8, 182, 32, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(`Subtotal Material & Service Cost: Rs ${subtotal.toLocaleString()}`, 20, finalY + 18);
  doc.text(`Contractor Overheads & Labor: Rs ${overheadAmount.toLocaleString()}`, 20, finalY + 24);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 101, 52);
  doc.text(`GRAND TOTAL TURNKEY INVESTMENT: Rs ${grandTotal.toLocaleString()}`, 20, finalY + 33);

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text("Disclaimer: Rates based on Bengaluru market benchmarks. Verify site measurements and BESCOM demand notes before execution.", 14, 285);

  doc.save(`BuildMitra_Electrical_Solar_BOQ_${Date.now()}.pdf`);
};

export const generatePlumbingPdfReport = (
  sumpLiters: number,
  rwhLiters: number,
  boqItems: Array<{ category: string; itemDescription: string; unit: string; quantity: number; ratePerUnit: number; totalAmount: number }>,
  subtotal: number,
  overheadAmount: number,
  grandTotal: number
) => {
  const doc = new jsPDF();

  // Title Header Block
  doc.setFillColor(14, 116, 144); // #0e7490 (Cyan-700)
  doc.rect(0, 0, 210, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BUILDMITRA — PLUMBING, BWSSB & RWH BOQ REPORT", 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(224, 242, 254);
  doc.text("Residential Plumbing Works, BWSSB Connection, Water Treatment & RWH Report", 14, 26);

  // Project Summary Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PROJECT OVERVIEW & WATER SPECIFICATIONS", 14, 46);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`• Recommended Underground Sump Storage: ${sumpLiters.toLocaleString()} Liters (135 LPCD IS 1172 Benchmark)`, 14, 53);
  doc.text(`• Annual Rooftop Rainwater Harvested: ${rwhLiters.toLocaleString()} Liters / Year (BWSSB Compliant)`, 14, 59);
  doc.text(`• Date of Estimation: ${new Date().toLocaleDateString("en-IN")}`, 14, 65);

  // BOQ Table
  const tableData = boqItems.map((item) => [
    item.category,
    item.itemDescription.length > 45 ? item.itemDescription.slice(0, 42) + "..." : item.itemDescription,
    item.unit,
    item.quantity.toString(),
    `Rs ${item.ratePerUnit.toLocaleString()}`,
    `Rs ${item.totalAmount.toLocaleString()}`,
  ]);

  autoTable(doc, {
    head: [["Category", "Item Description", "Unit", "Qty", "Rate (Rs)", "Amount (Rs)"]],
    body: tableData,
    startY: 72,
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [14, 116, 144], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 249, 255] },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // Grand Total Summary
  doc.setFillColor(241, 245, 249);
  doc.rect(14, finalY + 8, 182, 32, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(`Subtotal Material & Fixture Cost: Rs ${subtotal.toLocaleString()}`, 20, finalY + 18);
  doc.text(`Labor, Piping & Fitting Charges: Rs ${overheadAmount.toLocaleString()}`, 20, finalY + 24);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(14, 116, 144);
  doc.text(`GRAND TOTAL TURNKEY INVESTMENT: Rs ${grandTotal.toLocaleString()}`, 20, finalY + 33);

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text("Disclaimer: Rates based on Bengaluru market benchmarks. Verify site plumbing layouts and BWSSB prorata note before execution.", 14, 285);

  doc.save(`BuildMitra_Plumbing_RWH_BOQ_${Date.now()}.pdf`);
};
