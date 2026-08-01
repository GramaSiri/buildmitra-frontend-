import React from "react";
import BuildMitraLogo from "./branding/BuildMitraLogo";

export interface LetterheadProps {
  documentTitle: string;
  documentNo?: string;
  date?: string;
  buyerName?: string;
  buyerCode?: string;
  contractorName?: string;
  contractorCode?: string;
  projectName?: string;
  projectCode?: string;
  items?: Array<{
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
  showSignature?: boolean;
  onPrint?: () => void;
  onShareWhatsApp?: () => void;
}

export const BUILDMITRA_COMPANY_DETAILS = {
  name: "BuildMitra",
  tagline: "Build Smart, Cost Less • Materials, BOQ Costing & Real Estate Suite",
  address: "No:378, Near Gurusidheswra theater, 80 ft Road, JP Nagar, 4th Block, 9th Phase, Bengaluru- 560062",
  mobile: "+91 76769 42386",
  email: "support@buildmitra.in",
  website: "www.buildmitra.com",
  gstin: "29AAAAA0000A1Z5"
};

export const DEFAULT_TERMS_AND_CONDITIONS = [
  "The calculations and material quantities are fetched strictly as per your inputs provided.",
  "For actual site quantities, structural design accuracy, and detailed execution BOQ, please submit your architectural and structural drawings.",
  "Estimates are indicative and subject to standard site wastage (typically 3–5%), local supplier rates, and site execution variations.",
  "All structural suggestions follow IS Codes (IS 456 / IS 800); site structural engineer approval is recommended prior to procurement.",
  "BuildMitra Infra & Construction Technologies provides estimations for planning and budgeting purposes and assumes no liability for execution deviations."
];

export const BuildMitraLetterhead: React.FC<LetterheadProps> = ({
  documentTitle,
  documentNo = `BM-DOC-${Date.now().toString().slice(-6)}`,
  date = new Date().toISOString().split("T")[0],
  buyerName,
  buyerCode,
  contractorName,
  contractorCode,
  projectName,
  projectCode,
  items = [],
  subtotal,
  gstAmount,
  grandTotal,
  terms = DEFAULT_TERMS_AND_CONDITIONS,
  notes,
  onPrint,
  onShareWhatsApp
}) => {
  const computedSubtotal = subtotal ?? items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const computedGst = gstAmount ?? (computedSubtotal > 0 ? Math.round(computedSubtotal * 0.18) : 0);
  const computedGrandTotal = grandTotal ?? (computedSubtotal + computedGst);

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      padding: "24px",
      maxWidth: "850px",
      margin: "0 auto",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      color: "#1e293b"
    }}>
      {/* Action Bar (Download PDF / WhatsApp) */}
      {(onPrint || onShareWhatsApp) && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "16px" }} className="no-print">
          {onShareWhatsApp && (
            <button
              onClick={onShareWhatsApp}
              style={{
                backgroundColor: "#25D366",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              📲 Share on WhatsApp
            </button>
          )}
          {onPrint && (
            <button
              onClick={onPrint}
              style={{
                backgroundColor: "#0284c7",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              📄 Download in PDF
            </button>
          )}
        </div>
      )}

      {/* Official BuildMitra Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "3px solid #0284c7",
        paddingBottom: "16px",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BuildMitraLogo width={70} height={70} />
          </div>
          <div>
            <h1 style={{ margin: "0", fontSize: "18px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
              {BUILDMITRA_COMPANY_DETAILS.name}
            </h1>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#0284c7", marginTop: "2px" }}>
              {BUILDMITRA_COMPANY_DETAILS.tagline}
            </div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px", lineHeight: "1.4" }}>
              📍 {BUILDMITRA_COMPANY_DETAILS.address}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "11px", color: "#334155", lineHeight: "1.5", borderLeft: "2px solid #e2e8f0", paddingLeft: "16px" }}>
          <div><strong>📱 Phone:</strong> {BUILDMITRA_COMPANY_DETAILS.mobile}</div>
          <div><strong>📧 Email:</strong> {BUILDMITRA_COMPANY_DETAILS.email}</div>
          <div><strong>🌐 Web:</strong> {BUILDMITRA_COMPANY_DETAILS.website}</div>
          <div><strong>GSTIN:</strong> {BUILDMITRA_COMPANY_DETAILS.gstin}</div>
        </div>
      </div>

      {/* Document Title Banner */}
      <div style={{
        backgroundColor: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            📄 {documentTitle}
          </span>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
            Doc Ref No: <strong>{documentNo}</strong>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "12px", color: "#334155" }}>
          <div>Date: <strong>{date}</strong></div>
          {projectName && <div>Project: <strong>{projectName} {projectCode ? `(${projectCode})` : ""}</strong></div>}
        </div>
      </div>

      {/* Parties Info Block (Buyer & Contractor) */}
      {(buyerName || contractorName) && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "20px",
          backgroundColor: "#f1f5f9",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "12px"
        }}>
          {buyerName && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>BUYER / CLIENT DETAILS</div>
              <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px" }}>{buyerName}</div>
              {buyerCode && <div style={{ color: "#475569" }}>Code: <strong>{buyerCode}</strong></div>}
            </div>
          )}
          {contractorName && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>SUPPLIER / CONTRACTOR</div>
              <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px" }}>{contractorName}</div>
              {contractorCode && <div style={{ color: "#475569" }}>Code: <strong>{contractorCode}</strong></div>}
            </div>
          )}
        </div>
      )}

      {/* Items Breakdown Table */}
      {items.length > 0 && (
        <div style={{ overflowX: "auto", marginBottom: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "#0284c7", color: "#ffffff", textAlign: "left" }}>
                <th style={{ padding: "10px 12px", border: "1px solid #0284c7", width: "40px" }}>#</th>
                <th style={{ padding: "10px 12px", border: "1px solid #0284c7" }}>Item Description & Specification</th>
                <th style={{ padding: "10px 12px", border: "1px solid #0284c7", textAlign: "center", width: "80px" }}>Qty</th>
                <th style={{ padding: "10px 12px", border: "1px solid #0284c7", textAlign: "center", width: "70px" }}>Unit</th>
                <th style={{ padding: "10px 12px", border: "1px solid #0284c7", textAlign: "right", width: "100px" }}>Rate (₹)</th>
                <th style={{ padding: "10px 12px", border: "1px solid #0284c7", textAlign: "right", width: "110px" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                  <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", textAlign: "center" }}>{item.sno || idx + 1}</td>
                  <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", fontWeight: "500" }}>
                    {item.description}
                    {item.notes && <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Note: {item.notes}</div>}
                  </td>
                  <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", textAlign: "center", fontWeight: "600" }}>{item.quantity}</td>
                  <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", textAlign: "center" }}>{item.unit || "Nos"}</td>
                  <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", textAlign: "right" }}>
                    {item.rate != null && item.rate !== "" ? `₹${Number(item.rate).toLocaleString()}` : "-"}
                  </td>
                  <td style={{ padding: "10px 12px", border: "1px solid #e2e8f0", textAlign: "right", fontWeight: "700" }}>
                    {item.amount != null && item.amount !== "" ? `₹${Number(item.amount).toLocaleString()}` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals Summary Card */}
      {computedGrandTotal > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <div style={{ width: "280px", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "12px 16px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span>Subtotal:</span>
              <span>₹{computedSubtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "#64748b" }}>
              <span>GST (18%):</span>
              <span>₹{computedGst.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #0284c7", paddingTop: "6px", fontWeight: "800", fontSize: "14px", color: "#0f172a" }}>
              <span>Grand Total:</span>
              <span>₹{computedGrandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Notes / Special Instructions */}
      {notes && (
        <div style={{ backgroundColor: "#fffbe6", border: "1px solid #ffe58f", borderRadius: "6px", padding: "10px 14px", marginBottom: "16px", fontSize: "11px", color: "#873800" }}>
          <strong>Note / Remarks:</strong> {notes}
        </div>
      )}

      {/* Standard Terms & Conditions */}
      {terms.length > 0 && (
        <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "12px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#0284c7", textTransform: "uppercase", marginBottom: "6px" }}>
            📜 Standard Terms & Conditions:
          </div>
          <ul style={{ margin: "0", paddingLeft: "18px", fontSize: "11px", color: "#64748b", lineHeight: "1.6" }}>
            {terms.map((term, idx) => (
              <li key={idx}>{term}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px", textAlign: "center", fontSize: "10px", color: "#94a3b8" }}>
        BuildMitra Infra & Construction Technologies • www.buildmitra.com • Official Estimation Document
      </div>
    </div>
  );
};





