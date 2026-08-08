import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { DRGProjectState, BOQItem, AreaStatement } from "./types";

/**
 * Exports architectural layout drawing as high-res PNG image
 */
export function exportDrawingAsPng(filename = "buildmitra-drawing.png"): void {
  if (typeof window === "undefined") return;
  const svg = document.getElementById("drg-architectural-svg") as unknown as SVGSVGElement | null;
  if (!svg) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  canvas.width = 2400;
  canvas.height = 1800;

  img.onload = () => {
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const a = document.createElement("a");
      a.download = filename;
      a.href = canvas.toDataURL("image/png");
      a.click();
    }
  };

  const svgXml = new XMLSerializer().serializeToString(svg);
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgXml);
}

/**
 * Downloads raw SVG drawing file
 */
export function exportDrawingAsSvg(filename = "buildmitra-drawing.svg"): void {
  if (typeof window === "undefined") return;
  const svg = document.getElementById("drg-architectural-svg") as unknown as SVGSVGElement | null;
  if (!svg) return;

  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const source = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * High-Resolution Client-Side PDF Export Engine
 */
export async function exportDrawingAsPdf(
  elementId = "drg-architectural-svg",
  filename = "BuildMitra-Architectural-Drawing.pdf"
): Promise<void> {
  if (typeof window === "undefined") return;

  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID '${elementId}' not found for PDF export.`);
    return;
  }

  try {
    const canvas = await html2canvas(element as HTMLElement, {
      scale: 3, // High-DPI (300+ DPI quality)
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a3",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (err) {
    console.error("PDF export failed:", err);
    exportDrawingAsPng(filename.replace(".pdf", ".png"));
  }
}

/**
 * Exports complete architectural report & BOQ as PDF
 */
export function exportProjectAsPdf(
  state: DRGProjectState,
  filename = "buildmitra-architectural-report.pdf"
): void {
  if (typeof window === "undefined") return;

  const doc = new jsPDF();
  const inputs = state.inputs;
  const area = state.areaStatement;

  doc.setFontSize(18);
  doc.text("BUILDMITRA — ARCHITECTURAL CONCEPT REPORT", 14, 20);

  doc.setFontSize(10);
  doc.text(`Drawing Code: DRG-${Date.now().toString().slice(-6)}`, 14, 28);
  doc.text(`Date: ${new Date().toISOString().split("T")[0]}`, 14, 34);

  // Area Statement Table
  doc.setFontSize(12);
  doc.text("1. Area Statement & Compliance", 14, 46);

  const areaRows = [
    ["Plot Dimensions", `${inputs.plotWidth} ft × ${inputs.plotLength} ft`],
    ["Total Plot Area", `${area.plotAreaSqft} Sq.Ft`],
    ["Setback Reservation Area", `${area.setbackAreaSqft} Sq.Ft`],
    ["Buildable Footprint", `${area.buildableFootprintSqft} Sq.Ft`],
    ["Ground Coverage Achieved", `${area.groundCoverageSqft} Sq.Ft (${area.groundCoveragePercent}%)`],
    ["Total Built-Up Area (BUA)", `${area.totalBUASqft} Sq.Ft`],
    ["FAR Achieved", `${area.farAchieved}`],
  ];

  autoTable(doc, {
    startY: 50,
    head: [["Metric", "Specification"]],
    body: areaRows,
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(filename);
}
