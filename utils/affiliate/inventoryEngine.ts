import { RealEstateProject, InventoryUnit, AffiliateBooking, CommissionInvoice } from "./commissionEngine";

export interface AnalyticsSummary {
  totalProjects: number;
  totalUnits: number;
  totalAvailable: number;
  totalSold: number;
  totalHold: number;
  totalReserved: number;
  grossSalesValue: number; // Sum of total unit cost of sold units
  totalEarnedCommission: number; // Sum of platform commission on sold units
  totalPendingPayouts: number; // Unpaid/partial invoices sum
  salesVelocity: number; // % of sold units out of total
}

export const computeAnalytics = (
  projects: RealEstateProject[],
  bookings: AffiliateBooking[],
  invoices: CommissionInvoice[]
): AnalyticsSummary => {
  let totalUnits = 0;
  let totalAvailable = 0;
  let totalSold = 0;
  let totalHold = 0;
  let totalReserved = 0;
  let grossSalesValue = 0;
  let totalEarnedCommission = 0;

  projects.forEach((proj) => {
    (proj.inventory || []).forEach((unit) => {
      totalUnits++;
      if (unit.status === "Available") totalAvailable++;
      else if (unit.status === "Sold") {
        totalSold++;
        grossSalesValue += unit.totalUnitCost || 0;
        totalEarnedCommission += unit.calculatedCommission || 0;
      } else if (unit.status === "Hold") totalHold++;
      else if (unit.status === "Reserved") totalReserved++;
    });
  });

  const totalPendingPayouts = invoices
    .filter((inv) => inv.paymentStatus !== "Paid")
    .reduce((sum, inv) => sum + inv.totalInvoiceAmount, 0);

  const salesVelocity = totalUnits > 0 ? Math.round((totalSold / totalUnits) * 100) : 0;

  return {
    totalProjects: projects.length,
    totalUnits,
    totalAvailable,
    totalSold,
    totalHold,
    totalReserved,
    grossSalesValue,
    totalEarnedCommission,
    totalPendingPayouts,
    salesVelocity,
  };
};

export const formatCurrencyINR = (amount: number): string => {
  if (!amount || isNaN(amount)) return "₹0";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const getFacingVastuColor = (facing: string): string => {
  switch (facing) {
    case "East":
    case "North":
    case "North-East":
      return "#10b981"; // Emerald green (Prime Vastu)
    case "West":
    case "North-West":
      return "#3b82f6"; // Blue
    case "South":
    case "South-East":
    case "South-West":
      return "#f59e0b"; // Amber/Orange
    default:
      return "#6b7280";
  }
};

export const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "Available":
      return { bg: "#dcfce7", color: "#15803d", border: "#86efac", label: "Available" };
    case "Hold":
      return { bg: "#fef9c3", color: "#a16207", border: "#fde047", label: "Hold / Blocked" };
    case "Sold":
      return { bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5", label: "Sold" };
    case "Reserved":
      return { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd", label: "Reserved" };
    default:
      return { bg: "#f3f4f6", color: "#374151", border: "#d1d5db", label: status };
  }
};
