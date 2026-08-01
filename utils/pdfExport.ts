export interface PDFExportData {
  documentTitle: string;
  documentNo?: string;
  date?: string;
  buyerName?: string;
  buyerCode?: string;
  contractorName?: string;
  contractorCode?: string;
  projectName?: string;
  items: Array<{
    sno?: number;
    description: string;
    quantity: number | string;
    unit?: string;
    rate?: number | string;
    amount?: number | string;
    notes?: string;
  }>;
  subtotal?: number;
  gstAmount?: number;
  grandTotal?: number;
  terms?: string[];
  notes?: string;
}

import { BUILDMITRA_LOGO_DATA_URI } from "./logoDataUri";

export const DEFAULT_STANDARD_CONDITIONS = [
  "The calculations and material quantities are fetched strictly as per your inputs provided.",
  "For actual site quantities, structural design accuracy, and detailed execution BOQ, please submit your architectural and structural drawings.",
  "Estimates are indicative and subject to standard site wastage (typically 3–5%), local supplier rates, and site execution variations.",
  "All structural suggestions follow IS Codes (IS 456 / IS 800); site structural engineer approval is recommended prior to procurement.",
  "BuildMitra Infra & Construction Technologies provides estimations for planning and budgeting purposes and assumes no liability for execution deviations."
];

export const downloadBuildMitraPDF = (data: PDFExportData) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download/print the BuildMitra document.");
    return;
  }

  const subtotal = data.subtotal ?? data.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const gst = data.gstAmount ?? Math.round(subtotal * 0.18);
  const grandTotal = data.grandTotal ?? (subtotal + gst);
  const dateStr = data.date || new Date().toISOString().split("T")[0];
  const docNo = data.documentNo || `BM-DOC-${Date.now().toString().slice(-6)}`;

  const itemsRows = data.items.map((item, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${item.sno || idx + 1}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 500;">
        ${item.description}
        ${item.notes ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Note: ${item.notes}</div>` : ''}
      </td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 600;">${typeof item.quantity === 'number' ? (Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)) : item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${item.unit || 'Nos'}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">${item.rate != null && item.rate !== '' ? '₹' + Number(item.rate).toLocaleString() : '-'}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700;">${item.amount != null && item.amount !== '' ? '₹' + Number(item.amount).toLocaleString() : '-'}</td>
    </tr>
  `).join("");

  const defaultTerms = data.terms || DEFAULT_STANDARD_CONDITIONS;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.documentTitle} - ${docNo}</title>
      <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; color: #0f172a; background-color: #fff; }
        .letterhead-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px; }
        .company-title { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
        .tagline { font-size: 11px; font-weight: 600; color: #0284c7; margin-top: 2px; }
        .address { font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.4; }
        .contact-block { text-align: right; font-size: 11px; color: #334155; line-height: 1.5; border-left: 2px solid #e2e8f0; padding-left: 16px; }
        .doc-banner { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
        .doc-title { font-size: 16px; font-weight: 800; color: #0369a1; text-transform: uppercase; }
        .table-custom { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
        .table-custom th { background-color: #0284c7; color: #ffffff; padding: 10px; border: 1px solid #0284c7; text-align: left; }
        .totals-card { width: 280px; margin-left: auto; margin-bottom: 20px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; font-size: 12px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .grand-total { border-top: 2px solid #0284c7; padding-top: 6px; font-weight: 800; font-size: 14px; }
        .terms-block { border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-bottom: 24px; font-size: 11px; color: #475569; }
        .terms-list { margin: 6px 0 0 0; padding-left: 18px; color: #64748b; line-height: 1.6; }
        .footer-note { border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>BuildMitra
      <div class="no-print" style="text-align: right; margin-bottom: 16px;">
        <button onclick="window.print()" style="background-color: #0284c7; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          
        </button>
      </div>

      <div class="letterhead-header">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img src="${BUILDMITRA_LOGO_DATA_URI}" alt="" style="max-width: 70px; max-height: 70px; object-fit: contain; border-radius: 8px;" />
          </div>
          <div>
            BuildMitra
            <div class="tagline">Build Smart, Cost Less • Materials, BOQ Costing & Real Estate Suite</div>
            <div class="address">📍 No:378, Near Gurusidheswra theater, 80 ft Road, JP Nagar, 4th Block, 9th Phase, Bengaluru- 560062</div>
          </div>
        </div>
        <div class="contact-block">
          <div><strong>📱 Mobile:</strong> +91 76769 42386</div>
          <div><strong>📧 Email:</strong> support@buildmitra.in</div>
          <div><strong>🌐 Web:</strong> www.buildmitra.com</div>
          <div><strong>GSTIN:</strong> 29AAAAA0000A1Z5</div>
        </div>
      </div>

      <div class="doc-banner">
        <div>
          <div class="doc-title">📄 ${data.documentTitle}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Ref No: <strong>${docNo}</strong></div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #334155;">
          <div>Date: <strong>${dateStr}</strong></div>
          ${data.projectName ? `<div>Project: <strong>${data.projectName}</strong></div>` : ''}
        </div>
      </div>

      ${(data.buyerName || data.contractorName) ? `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background-color: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-size: 12px;">
          ${data.buyerName ? `<div><strong style="color: #64748b; font-size: 10px;">BUYER / CLIENT:</strong><br/><strong>${data.buyerName}</strong> ${data.buyerCode ? `(${data.buyerCode})` : ''}</div>` : ''}
          ${data.contractorName ? `<div><strong style="color: #64748b; font-size: 10px;">SUPPLIER / CONTRACTOR:</strong><br/><strong>${data.contractorName}</strong> ${data.contractorCode ? `(${data.contractorCode})` : ''}</div>` : ''}
        </div>
      ` : ''}

      <table class="table-custom">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th>Item Description & Specifications</th>
            <th style="width: 80px; text-align: center;">Qty</th>
            <th style="width: 70px; text-align: center;">Unit</th>
            <th style="width: 100px; text-align: right;">Rate (₹)</th>
            <th style="width: 110px; text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      ${grandTotal > 0 ? `
        <div class="totals-card">
          <div class="total-row"><span>Subtotal:</span><span>₹${subtotal.toLocaleString()}</span></div>
          <div class="total-row" style="color: #64748b;"><span>GST (18%):</span><span>₹${gst.toLocaleString()}</span></div>
          <div class="total-row grand-total"><span>Grand Total:</span><span>₹${grandTotal.toLocaleString()}</span></div>
        </div>
      ` : ''}

      ${data.notes ? `<div style="background-color: #fffbe6; border: 1px solid #ffe58f; border-radius: 6px; padding: 10px; margin-bottom: 16px; font-size: 11px; color: #873800;"><strong>Remarks:</strong> ${data.notes}</div>` : ''}

      <div class="terms-block">
        <strong style="text-transform: uppercase; color: #0284c7; font-weight: 700;">📜 Standard Terms & Conditions:</strong>
        <ul class="terms-list">
          ${defaultTerms.map(t => `<li>${t}</li>`).join("")}
        </ul>
      </div>

      <div class="footer-note">
        BuildMitra Infra & Construction Technologies • www.buildmitra.com • Official Estimation Document
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};


