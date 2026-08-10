import React, { useState } from "react";
import {
  AffiliateBooking,
  CommissionInvoice,
  RealEstateProject,
  generateAffiliateInvoicePdf,
} from "../../utils/affiliate/commissionEngine";
import { formatCurrencyINR } from "../../utils/affiliate/inventoryEngine";

interface InvoicingHubProps {
  projects: RealEstateProject[];
  bookings: AffiliateBooking[];
  invoices: CommissionInvoice[];
  onUpdateInvoices: (updatedInvoices: CommissionInvoice[]) => void;
}

export default function InvoicingHub({
  projects,
  bookings,
  invoices,
  onUpdateInvoices,
}: InvoicingHubProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<CommissionInvoice | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === "all") return true;
    return inv.paymentStatus.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleGenerateInvoiceFromBooking = (booking: AffiliateBooking) => {
    // Check if invoice already exists for this booking
    const existing = invoices.find((i) => i.bookingId === booking.id);
    if (existing) {
      alert(`Invoice ${existing.invoiceNo} already exists for this booking!`);
      return;
    }

    const proj = projects.find((p) => p.id === booking.projectId);
    const builderGstin = proj?.builderGstin || "29AAAAA0000A1Z5";

    const newInvoice: CommissionInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: `INV-BM-2026-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: booking.id,
      projectId: booking.projectId,
      projectName: booking.projectName,
      builderName: booking.builderName,
      builderGstin,
      soldUnitNo: booking.unitNo,
      buyerRefCode: booking.buyerRefCode,
      buyerName: booking.buyerName,
      salePrice: booking.finalSalePrice,
      commissionBase: booking.calculatedCommission,
      gstRate: 18,
      gstAmount: booking.gstAmount,
      totalInvoiceAmount: booking.totalCommissionWithGst,
      paymentTerms: "50% on Agreement, 50% on Registration",
      paymentStatus: "Unpaid",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      bankAccountDetails: {
        accountName: "BUILDMITRA SOLUTIONS PVT LTD",
        accountNumber: "50200049281729",
        ifscCode: "HDFC0001234",
        bankName: "HDFC Bank, Indiranagar Branch, Bengaluru",
      },
    };

    onUpdateInvoices([newInvoice, ...invoices]);
    alert(`Tax Invoice ${newInvoice.invoiceNo} generated successfully for ${booking.builderName}!`);
  };

  const handleStatusChange = (invoiceId: string, newStatus: CommissionInvoice["paymentStatus"]) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return { ...inv, paymentStatus: newStatus };
      }
      return inv;
    });
    onUpdateInvoices(updated);
  };

  const handleDownloadPdf = (invoice: CommissionInvoice) => {
    try {
      generateAffiliateInvoicePdf(invoice);
    } catch (e: any) {
      alert("Error generating PDF: " + e.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
          borderRadius: "16px",
          padding: "24px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>🧾</span>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>
                Automated Commission Calculation & Invoicing Hub
              </h2>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
                Auto-generate developer GST commission invoices upon sales. Export official PDF invoices complete with bank details and digital signatures.
              </p>
            </div>
          </div>
        </div>

        {/* STATUS FILTER BUTTONS */}
        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "Paid", "Unpaid"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                background: filterStatus === st ? "#ff7a00" : "rgba(255,255,255,0.12)",
                color: "#ffffff",
                border: 0,
                borderRadius: "8px",
                padding: "8px 14px",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {st} Invoices
            </button>
          ))}
        </div>
      </div>

      {/* PENDING BOOKINGS RECONCILIATION CARD */}
      {bookings.length > 0 && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          <h4 style={{ margin: "0 0 12px", fontSize: "16px", color: "#0f172a" }}>
            ⚡ Live Unit Sales Pending Developer Invoice Generation
          </h4>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "10px 12px" }}>Booking Ref</th>
                  <th style={{ padding: "10px 12px" }}>Developer / Project</th>
                  <th style={{ padding: "10px 12px" }}>Sold Unit</th>
                  <th style={{ padding: "10px 12px" }}>Buyer Name</th>
                  <th style={{ padding: "10px 12px" }}>Sale Price (₹)</th>
                  <th style={{ padding: "10px 12px" }}>Platform Comm. + GST (18%)</th>
                  <th style={{ padding: "10px 12px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((book) => {
                  const hasInv = invoices.some((i) => i.bookingId === book.id);
                  return (
                    <tr key={book.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px", fontWeight: 800, color: "#2563eb" }}>
                        {book.bookingCode}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{book.builderName}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{book.projectName}</div>
                      </td>
                      <td style={{ padding: "12px", fontWeight: 700 }}>{book.unitNo}</td>
                      <td style={{ padding: "12px" }}>{book.buyerName}</td>
                      <td style={{ padding: "12px", fontWeight: 700 }}>{formatCurrencyINR(book.finalSalePrice)}</td>
                      <td style={{ padding: "12px", color: "#166534", fontWeight: 800 }}>
                        {formatCurrencyINR(book.totalCommissionWithGst)}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {hasInv ? (
                          <span style={{ color: "#166534", fontSize: "11px", fontWeight: 700 }}>
                            ✓ Invoice Issued
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGenerateInvoiceFromBooking(book)}
                            style={{
                              background: "linear-gradient(135deg, #ff7a00, #ea580c)",
                              color: "#ffffff",
                              border: 0,
                              borderRadius: "6px",
                              padding: "6px 12px",
                              fontWeight: 800,
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                          >
                            + Generate Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISSUED DEVELOPER INVOICES TABLE */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        <h4 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a" }}>
          📜 Issued Developer Commission Tax Invoices ({filteredInvoices.length})
        </h4>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "10px 12px" }}>Invoice No</th>
                <th style={{ padding: "10px 12px" }}>Developer GSTIN & Name</th>
                <th style={{ padding: "10px 12px" }}>Sold Unit & Project</th>
                <th style={{ padding: "10px 12px" }}>Base Comm. (₹)</th>
                <th style={{ padding: "10px 12px" }}>18% GST (₹)</th>
                <th style={{ padding: "10px 12px" }}>Total Tax Invoice (₹)</th>
                <th style={{ padding: "10px 12px" }}>Payout Status</th>
                <th style={{ padding: "10px 12px" }}>Export / Print</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                    No invoices match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.paymentStatus === "Paid";
                  return (
                    <tr key={inv.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px", fontWeight: 800, color: "#0f172a" }}>
                        {inv.invoiceNo}
                        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 400 }}>
                          Issued: {inv.issueDate}
                        </div>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{inv.builderName}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>GST: {inv.builderGstin || "N/A"}</div>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: 700 }}>{inv.soldUnitNo}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{inv.projectName}</div>
                      </td>

                      <td style={{ padding: "12px" }}>{formatCurrencyINR(inv.commissionBase)}</td>
                      <td style={{ padding: "12px", color: "#64748b" }}>{formatCurrencyINR(inv.gstAmount)}</td>

                      <td style={{ padding: "12px", fontWeight: 800, color: "#166534", fontSize: "14px" }}>
                        {formatCurrencyINR(inv.totalInvoiceAmount)}
                      </td>

                      <td style={{ padding: "12px" }}>
                        <select
                          value={inv.paymentStatus}
                          onChange={(e) =>
                            handleStatusChange(inv.id, e.target.value as CommissionInvoice["paymentStatus"])
                          }
                          style={{
                            background: isPaid ? "#dcfce7" : "#fef9c3",
                            color: isPaid ? "#15803d" : "#a16207",
                            border: `1px solid ${isPaid ? "#86efac" : "#fde047"}`,
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontWeight: 800,
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          <option value="Unpaid">Unpaid / Pending</option>
                          <option value="Partial">Partial Payout</option>
                          <option value="Paid">Paid in Full</option>
                        </select>
                      </td>

                      <td style={{ padding: "12px" }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(inv)}
                          style={{
                            background: "#0f172a",
                            color: "#ffffff",
                            border: 0,
                            borderRadius: "6px",
                            padding: "6px 10px",
                            fontWeight: 700,
                            fontSize: "11px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          📄 Export PDF
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
