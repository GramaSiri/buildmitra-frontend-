import React from "react";
import {
  RealEstateProject,
  AffiliateBooking,
  CommissionInvoice,
} from "../../utils/affiliate/commissionEngine";
import {
  computeAnalytics,
  formatCurrencyINR,
} from "../../utils/affiliate/inventoryEngine";

interface AffiliateDashboardProps {
  projects: RealEstateProject[];
  bookings: AffiliateBooking[];
  invoices: CommissionInvoice[];
}

export default function AffiliateDashboard({
  projects,
  bookings,
  invoices,
}: AffiliateDashboardProps) {
  const analytics = computeAnalytics(projects, bookings, invoices);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* HEADER BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a, #0284c7)",
          borderRadius: "16px",
          padding: "24px",
          color: "#ffffff",
          boxShadow: "0 10px 25px rgba(2,132,199,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "28px" }}>📈</span>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>
              Real-Time Performance & Platform Revenue Analytics Dashboard
            </h2>
            <p style={{ margin: "4px 0 0", color: "#e0f2fe", fontSize: "13px" }}>
              Live real estate inventory analytics, builder sales velocity metrics, earned platform commissions, and developer payout tracker.
            </p>
          </div>
        </div>
      </div>

      {/* KPI SUMMARY CARDS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {/* CARD 1 */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
            ONBOARDED PROJECTS
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
            {analytics.totalProjects}
          </div>
          <div style={{ fontSize: "11px", color: "#166534", marginTop: "4px", fontWeight: 700 }}>
            {analytics.totalUnits} Total Units Listed
          </div>
        </div>

        {/* CARD 2 */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
            TOTAL UNITS SOLD / BOOKED
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#2563eb", marginTop: "4px" }}>
            {analytics.totalSold + analytics.totalReserved}
          </div>
          <div style={{ fontSize: "11px", color: "#2563eb", marginTop: "4px", fontWeight: 700 }}>
            Sales Velocity: {analytics.salesVelocity}%
          </div>
        </div>

        {/* CARD 3 */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
            GROSS SALES VALUE (₹)
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
            {formatCurrencyINR(analytics.grossSalesValue)}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            Total Transaction Value
          </div>
        </div>

        {/* CARD 4 */}
        <div
          style={{
            background: "linear-gradient(135deg, #10b981, #047857)",
            borderRadius: "14px",
            padding: "18px",
            color: "#ffffff",
            boxShadow: "0 6px 15px rgba(16,185,129,0.2)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#a7f3d0", fontWeight: 700 }}>
            EARNED PLATFORM REVENUE (₹)
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, marginTop: "4px" }}>
            {formatCurrencyINR(analytics.totalEarnedCommission)}
          </div>
          <div style={{ fontSize: "11px", color: "#ecfdf5", marginTop: "4px" }}>
            Negotiated Platform Commission
          </div>
        </div>

        {/* CARD 5 */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
            PENDING DEVELOPER PAYOUTS
          </div>
          <div style={{ fontSize: "24px", fontWeight: 900, color: "#e11d48", marginTop: "4px" }}>
            {formatCurrencyINR(analytics.totalPendingPayouts)}
          </div>
          <div style={{ fontSize: "11px", color: "#e11d48", marginTop: "4px", fontWeight: 700 }}>
            Unpaid Invoices Sum
          </div>
        </div>
      </div>

      {/* BUILDER PERFORMANCE ANALYTICS TABLE */}
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
          🏢 Project-Wise Builder Sales Velocity & Revenue Breakdown
        </h4>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "10px 12px" }}>Project Name</th>
                <th style={{ padding: "10px 12px" }}>Builder Developer</th>
                <th style={{ padding: "10px 12px" }}>Total Units</th>
                <th style={{ padding: "10px 12px" }}>Sold / Reserved</th>
                <th style={{ padding: "10px 12px" }}>Sales Velocity %</th>
                <th style={{ padding: "10px 12px" }}>Gross Transaction Value</th>
                <th style={{ padding: "10px 12px" }}>Platform Earned Revenue</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => {
                const totalU = proj.inventory?.length || 0;
                let soldU = 0;
                let grossVal = 0;
                let earnedRev = 0;

                (proj.inventory || []).forEach((u) => {
                  if (u.status === "Sold" || u.status === "Reserved") {
                    soldU++;
                    grossVal += u.totalUnitCost || 0;
                    earnedRev += u.calculatedCommission || 0;
                  }
                });

                const velocity = totalU > 0 ? Math.round((soldU / totalU) * 100) : 0;

                return (
                  <tr key={proj.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: 800, color: "#0f172a" }}>
                      {proj.projectName}
                    </td>
                    <td style={{ padding: "12px" }}>{proj.builderName}</td>
                    <td style={{ padding: "12px" }}>{totalU} units</td>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#2563eb" }}>{soldU} units</td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${velocity}%`, background: "#10b981" }} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: "11px" }}>{velocity}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatCurrencyINR(grossVal)}</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "#166534" }}>{formatCurrencyINR(earnedRev)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIVE ACTIVITY FEED */}
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
          ⚡ Live Activity Feed & Audit Log
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
                borderRadius: "10px",
                padding: "12px 14px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>🎉</span>
                <div>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>
                    Unit {b.unitNo} reserved by {b.buyerName} ({b.buyerPhone})
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    Project: {b.projectName} | Booking Ref: {b.bookingCode} | Date: {b.bookingDate}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: "#166534" }}>
                  +{formatCurrencyINR(b.calculatedCommission)} Commission
                </div>
                <span style={{ fontSize: "10px", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}

          {invoices.map((inv) => (
            <div
              key={inv.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
                borderRadius: "10px",
                padding: "12px 14px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>🧾</span>
                <div>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>
                    Tax Invoice {inv.invoiceNo} issued to {inv.builderName}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    Sold Unit: {inv.soldUnitNo} ({inv.projectName}) | GSTIN: {inv.builderGstin}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: "#0f172a" }}>
                  {formatCurrencyINR(inv.totalInvoiceAmount)}
                </div>
                <span style={{ fontSize: "10px", background: "#fef9c3", color: "#a16207", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                  {inv.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
