import React, { useState, useMemo } from "react";
import Head from "next/head";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";

export type LoanType =
  | "home_construction"
  | "plot_construction"
  | "home_purchase"
  | "renovation";

export type EmploymentType = "salaried" | "self_employed";
export type ActiveTab = "calculator" | "clp_plan" | "eligibility" | "bank_comparison" | "rbi_simulator" | "prepayment" | "documents";

export type ClpMilestone = {
  id: string;
  stageName: string;
  disbursalDate: string; // e.g. "2026-06-01"
  percent: number;
};

const DEFAULT_CLP_STAGES: ClpMilestone[] = [
  { id: "clp_1", stageName: "Stage 1 — Booking & Agreement", disbursalDate: "2026-06-01", percent: 10 },
  { id: "clp_2", stageName: "Stage 2 — Excavation & Foundation", disbursalDate: "2026-09-01", percent: 15 },
  { id: "clp_3", stageName: "Stage 3 — Ground Floor Plinth & Slab", disbursalDate: "2026-12-01", percent: 20 },
  { id: "clp_4", stageName: "Stage 4 — Upper Floor Slabs & RCC Core", disbursalDate: "2027-03-01", percent: 25 },
  { id: "clp_5", stageName: "Stage 5 — Brickwork, Plaster & Flooring", disbursalDate: "2027-06-01", percent: 20 },
  { id: "clp_6", stageName: "Stage 6 — Final Painting & Possession", disbursalDate: "2027-09-01", percent: 10 },
];

export type BankOffer = {
  id: string;
  name: string;
  logo: string;
  minRate: number;
  maxRate: number;
  processingFee: string;
  maxTenureYears: number;
  maxLtvPercent: number;
  specialConcession: string;
  isBestValue?: boolean;
};

const BANK_COMPARISON_DATA: BankOffer[] = [
  {
    id: "bob",
    name: "Bank of Baroda",
    logo: "🏛️",
    minRate: 8.40,
    maxRate: 8.85,
    processingFee: "Zero / 0.25% (Max ₹10,000 + GST)",
    maxTenureYears: 30,
    maxLtvPercent: 90,
    specialConcession: "0.05% concession for CIBIL > 775",
    isBestValue: true,
  },
  {
    id: "sbi",
    name: "State Bank of India (SBI)",
    logo: "🏦",
    minRate: 8.50,
    maxRate: 8.90,
    processingFee: "0.35% (Min ₹2,000, Max ₹10,000 + GST)",
    maxTenureYears: 30,
    maxLtvPercent: 90,
    specialConcession: "0.05% concession for women borrowers",
  },
  {
    id: "lic",
    name: "LIC Housing Finance",
    logo: "🏬",
    minRate: 8.50,
    maxRate: 8.95,
    processingFee: "0.25% (Max ₹15,000 + GST)",
    maxTenureYears: 30,
    maxLtvPercent: 85,
    specialConcession: "CIBIL > 750 special rate discount",
  },
  {
    id: "hdfc",
    name: "HDFC Bank",
    logo: "🏦",
    minRate: 8.70,
    maxRate: 9.15,
    processingFee: "0.50% (Max ₹3,000 + GST)",
    maxTenureYears: 30,
    maxLtvPercent: 85,
    specialConcession: "Instant digital sanction for salary account holders",
  },
  {
    id: "icici",
    name: "ICICI Bank",
    logo: "🏦",
    minRate: 8.75,
    maxRate: 9.20,
    processingFee: "0.50% (Min ₹5,000 + GST)",
    maxTenureYears: 30,
    maxLtvPercent: 85,
    specialConcession: "Pre-approved home loan offers available",
  },
  {
    id: "axis",
    name: "Axis Bank",
    logo: "🏦",
    minRate: 8.75,
    maxRate: 9.25,
    processingFee: "0.50% or ₹10,000",
    maxTenureYears: 30,
    maxLtvPercent: 85,
    specialConcession: "12 EMI waiver scheme available",
  },
];

// Helper to format date into "Jun-26" month-year string
const formatMonthYearTag = (startDateStr: string, monthOffsetIndex: number): string => {
  const d = startDateStr ? new Date(startDateStr) : new Date();
  if (isNaN(d.getTime())) return `M${monthOffsetIndex + 1}`;
  d.setMonth(d.getMonth() + monthOffsetIndex);
  const monthsStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mName = monthsStr[d.getMonth()];
  const yShort = String(d.getFullYear()).slice(-2);
  return `${mName}-${yShort}`;
};

export default function HousingLoanFinance() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("calculator");

  // Selection State: Default to null or initial selection
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);

  // ---------------- 1. LOAN PARAMETERS (INITIAL STATE IS ALL 0) ----------------
  const [propertyValue, setPropertyValue] = useState<number>(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [tenureYears, setTenureYears] = useState<number>(0);
  const [amortizationViewMode, setAmortizationViewMode] = useState<"monthly" | "yearly">("monthly");

  // ---------------- 2. CLP STAGES & PAYMENT MODE ----------------
  const [clpMilestones, setClpMilestones] = useState<ClpMilestone[]>(DEFAULT_CLP_STAGES);
  const [clpPaymentOption, setClpPaymentOption] = useState<"pre_emi" | "full_emi">("pre_emi");

  // ---------------- 3. ELIGIBILITY PARAMETERS (INITIAL STATE IS ALL 0) ----------------
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [existingEmi, setExistingEmi] = useState<number>(0);
  const [employmentType, setEmploymentType] = useState<EmploymentType>("salaried");

  // ---------------- 4. PREPAYMENT ----------------
  const [extraEmiPerYear, setExtraEmiPerYear] = useState<number>(1);

  // ---------------- 5. DOCUMENT CHECKLIST STATE ----------------
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    kyc_pan: true,
    kyc_aadhaar: true,
  });

  const toggleDoc = (docId: string) => {
    setCheckedDocs((prev) => ({ ...prev, [docId]: !prev[docId] }));
  };

  // Reset helper to wipe old cached inputs when switching tabs or loan types
  const resetInputsToZero = () => {
    setPropertyValue(0);
    setDownPaymentPercent(0);
    setInterestRate(0);
    setTenureYears(0);
    setMonthlyIncome(0);
    setExistingEmi(0);
  };

  // Handle Tab Switch — Resets inputs to 0 as requested by user
  const handleTabSwitch = (newTab: ActiveTab) => {
    setActiveTab(newTab);
    resetInputsToZero();
  };

  // Handle Loan Type Switch — Resets inputs to 0 as requested by user
  const handleLoanTypeSwitch = (type: LoanType) => {
    setSelectedLoanType(type);
    resetInputsToZero();
  };

  // Exact Sanctioned Loan Amount = Property Value * (1 - DownPayment%)
  const requiredLoanAmount = useMemo(() => {
    if (propertyValue <= 0) return 0;
    return Math.max(0, propertyValue * (1 - downPaymentPercent / 100));
  }, [propertyValue, downPaymentPercent]);

  // --------------------------------------------------------------------------
  // PROGRESSIVE CUMULATIVE CLP DISBURSAL & PARALLEL INTEREST/EMI ENGINE
  // --------------------------------------------------------------------------
  const clpCalculations = useMemo(() => {
    const P = requiredLoanAmount;
    const annualRate = interestRate / 100;
    const r = annualRate / 12;
    const n = tenureYears * 12;

    let cumAmount = 0;

    const schedule = clpMilestones.map((m) => {
      const amount = (P * (m.percent || 0)) / 100;
      // Progressive Cumulative Balance Addition: 2nd Balance = 1st Balance + 2nd Disbursal Amount
      cumAmount += amount;

      // Monthly Pre-EMI Interest on cumulative released balance
      const preEmi = (cumAmount * annualRate) / 12;

      // Progressive Full EMI on cumulative released balance
      let progressiveFullEmi = 0;
      if (r > 0 && n > 0 && cumAmount > 0) {
        progressiveFullEmi = (cumAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      }

      return {
        ...m,
        amount: Math.round(amount),
        cumAmount: Math.round(cumAmount),
        preEmi: Math.round(preEmi),
        progressiveFullEmi: Math.round(progressiveFullEmi),
      };
    });

    const totalDisbursedBalance = schedule.length > 0 ? schedule[schedule.length - 1].cumAmount : 0;

    return {
      schedule,
      totalDisbursedBalance,
    };
  }, [clpMilestones, requiredLoanAmount, interestRate, tenureYears]);

  // --------------------------------------------------------------------------
  // REAL-WORLD PROGRESSIVE CUMULATIVE MONTH-BY-MONTH AMORTIZATION ENGINE
  // Disbursal amounts are injected on their respective dates/months!
  // Balance = Previous Remaining Balance + New Disbursal Amount!
  // --------------------------------------------------------------------------
  const progressiveMonthlyAmortization = useMemo(() => {
    if (propertyValue <= 0 || interestRate <= 0 || tenureYears <= 0) return { rows: [], totalInterestSum: 0 };

    const P = requiredLoanAmount;
    const annualRate = interestRate / 100;
    const r = annualRate / 12;
    const totalMonths = tenureYears * 12;
    const startDateStr = clpMilestones[0]?.disbursalDate || "2026-06-01";
    const startDate = new Date(startDateStr);

    // Map CLP stage disbursals to month offset index
    const stageDisbursalsByMonthIndex: Record<number, number> = {};
    
    if (activeTab === "clp_plan") {
      clpMilestones.forEach((m) => {
        const mAmount = (P * (m.percent || 0)) / 100;
        if (mAmount <= 0) return;
        let offset = 0;
        if (m.disbursalDate && !isNaN(startDate.getTime())) {
          const d = new Date(m.disbursalDate);
          if (!isNaN(d.getTime())) {
            offset = (d.getFullYear() - startDate.getFullYear()) * 12 + (d.getMonth() - startDate.getMonth());
            offset = Math.max(0, offset);
          }
        }
        stageDisbursalsByMonthIndex[offset] = (stageDisbursalsByMonthIndex[offset] || 0) + mAmount;
      });
    } else {
      // In standard EMI mode, full loan amount disbursed in Month 0
      stageDisbursalsByMonthIndex[0] = P;
    }

    let currentBalance = 0;
    let totalInterestSum = 0;
    const rows: {
      month: number;
      dateTag: string;
      injectedDisbursal: number;
      openingBalance: number;
      principalPaid: number;
      interestPaid: number;
      closingBalance: number;
    }[] = [];

    for (let mIdx = 0; mIdx < totalMonths; mIdx++) {
      const monthNum = mIdx + 1;
      const dateTag = formatMonthYearTag(startDateStr, mIdx);
      const injectedDisbursal = stageDisbursalsByMonthIndex[mIdx] || 0;

      // Opening Balance = Existing Balance + New Disbursal Amount Injected!
      const openingBalance = currentBalance + injectedDisbursal;
      if (openingBalance <= 0) continue;

      const monthInterest = openingBalance * r;
      totalInterestSum += monthInterest;

      let monthEmi = 0;
      let monthPrincipal = 0;

      if (clpPaymentOption === "pre_emi" && activeTab === "clp_plan") {
        // Pre-EMI Mode: Interest only paid till final possession/disbursal
        monthEmi = monthInterest;
        monthPrincipal = 0;
      } else {
        // Full EMI Mode: EMI calculated on active opening balance over remaining tenure
        const remainingTenureMonths = totalMonths - mIdx;
        if (r > 0 && remainingTenureMonths > 0) {
          monthEmi = (openingBalance * r * Math.pow(1 + r, remainingTenureMonths)) / (Math.pow(1 + r, remainingTenureMonths) - 1);
        }
        monthPrincipal = Math.min(openingBalance, monthEmi - monthInterest);
      }

      const closingBalance = Math.max(0, openingBalance - monthPrincipal);
      currentBalance = closingBalance;

      rows.push({
        month: monthNum,
        dateTag,
        injectedDisbursal: Math.round(injectedDisbursal),
        openingBalance: Math.round(openingBalance),
        principalPaid: Math.round(monthPrincipal),
        interestPaid: Math.round(monthInterest),
        closingBalance: Math.round(closingBalance),
      });
    }

    return {
      rows,
      totalInterestSum: Math.round(totalInterestSum),
    };
  }, [propertyValue, interestRate, tenureYears, requiredLoanAmount, clpMilestones, activeTab, clpPaymentOption]);

  // --------------------------------------------------------------------------
  // LOAN SUMMARY ENGINE (CONSOLIDATED FIGURES MATCHED TO TOP BOXES)
  // --------------------------------------------------------------------------
  const loanSummary = useMemo(() => {
    if (propertyValue <= 0 || interestRate <= 0 || tenureYears <= 0) {
      return {
        loanAmount: 0,
        downPaymentAmount: 0,
        emi: 0,
        totalPayable: 0,
        totalInterest: 0,
        totalSavedExtraEmi: 0,
        preEmiMonthly: 0,
        isCalculated: false,
      };
    }

    const P = requiredLoanAmount;
    const annualRate = interestRate / 100;
    const r = annualRate / 12;
    const n = tenureYears * 12;

    let emi = 0;
    if (r > 0 && n > 0 && P > 0) {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayable = emi * n;

    // Use progressive cumulative total interest if on CLP tab, or standard interest
    const totalInterest = activeTab === "clp_plan" ? progressiveMonthlyAmortization.totalInterestSum : Math.max(0, totalPayable - P);

    // Extra EMI Savings Calc
    let bal = P;
    let mCount = 0;
    let interestWithExtra = 0;
    while (bal > 0 && mCount < 360) {
      mCount++;
      const mInterest = bal * r;
      let mPay = emi;
      if (mCount % 12 === 0) {
        mPay += emi * extraEmiPerYear;
      }
      const mPrin = Math.min(bal, mPay - mInterest);
      interestWithExtra += mInterest;
      bal -= mPrin;
    }

    const totalSavedExtraEmi = Math.max(0, totalInterest - interestWithExtra);
    const preEmiMonthly = (P * (interestRate / 100)) / 12;

    return {
      loanAmount: Math.round(P),
      downPaymentAmount: Math.round(propertyValue - P),
      emi: Math.round(emi),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(totalInterest),
      totalSavedExtraEmi: Math.round(totalSavedExtraEmi),
      preEmiMonthly: Math.round(preEmiMonthly),
      isCalculated: true,
    };
  }, [propertyValue, interestRate, tenureYears, requiredLoanAmount, extraEmiPerYear, activeTab, progressiveMonthlyAmortization]);

  const updateClpStage = (id: string, field: keyof ClpMilestone, value: any) => {
    setClpMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const addClpStage = () => {
    const nextIdx = clpMilestones.length + 1;
    const nextYear = 2026 + Math.floor(nextIdx / 4);
    const nextMonthStr = String(((nextIdx * 3) % 12) + 1).padStart(2, "0");

    setClpMilestones((prev) => [
      ...prev,
      {
        id: `clp_${Date.now()}`,
        stageName: `Stage ${nextIdx} — Custom Construction Milestone`,
        disbursalDate: `${nextYear}-${nextMonthStr}-01`,
        percent: 10,
      },
    ]);
  };

  const removeClpStage = (id: string) => {
    setClpMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  // --------------------------------------------------------------------------
  // EXPORT EXCEL & WHATSAPP SHARE
  // --------------------------------------------------------------------------
  const exportToExcel = () => {
    const wsData = [
      ["BUILDMITRA HOUSING LOAN FINANCE REPORT"],
      ["Loan Type", selectedLoanType ? selectedLoanType.toUpperCase() : "NONE"],
      ["Property Cost", propertyValue],
      ["Sanctioned Loan Amount", loanSummary.loanAmount],
      ["CLP Disbursed Balance", clpCalculations.totalDisbursedBalance],
      ["Interest Rate", `${interestRate}% p.a.`],
      ["Tenure", `${tenureYears} Years`],
      ["Monthly EMI", loanSummary.emi],
      ["Total Interest Paid", loanSummary.totalInterest],
      ["Total Paid (Principal + Interest)", clpCalculations.totalDisbursedBalance + loanSummary.totalInterest],
      ["Total Extra EMI Savings", loanSummary.totalSavedExtraEmi],
      [],
      ["CLP PROGRESSIVE DISBURSAL SCHEDULE"],
      ["Milestone Stage", "Disbursal Date", "Share (%)", "Disbursed Amount (₹)", "Cumulative Released (₹)", "Monthly Pre-EMI Interest (₹)", "Full EMI (₹)"],
    ];

    clpCalculations.schedule.forEach((r) => {
      wsData.push([
        r.stageName,
        r.disbursalDate || "N/A",
        `${r.percent}%`,
        r.amount.toString(),
        r.cumAmount.toString(),
        r.preEmi.toString(),
        r.progressiveFullEmi.toString(),
      ]);
    });

    wsData.push([]);
    wsData.push(["MONTH-WISE PROGRESSIVE AMORTIZATION SCHEDULE"]);
    wsData.push(["Month #", "Date (Month-Year)", "Injected Disbursal (₹)", "Opening Balance (₹)", "Principal Paid (₹)", "Interest Paid (₹)", "Closing Balance (₹)"]);

    progressiveMonthlyAmortization.rows.forEach((r) => {
      wsData.push([
        `Month ${r.month}`,
        r.dateTag,
        r.injectedDisbursal.toString(),
        r.openingBalance.toString(),
        r.principalPaid.toString(),
        r.interestPaid.toString(),
        r.closingBalance.toString(),
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Housing Loan Report");
    XLSX.writeFile(wb, "Housing_Loan_Finance_Report.xlsx");
  };

  const shareOnWhatsApp = () => {
    const text = `🏦 *BUILDMITRA HOUSING LOAN REPORT*
💰 *Sanctioned Loan:* ₹${loanSummary.loanAmount.toLocaleString("en-IN")}
🏗️ *CLP Disbursed Balance:* ₹${clpCalculations.totalDisbursedBalance.toLocaleString("en-IN")}
📈 *Interest Rate:* ${interestRate}% p.a. (${tenureYears} Yrs)

📊 *CONSOLIDATED METRICS:*
• *Monthly EMI:* ₹${loanSummary.emi.toLocaleString("en-IN")}/mo
• *Total Interest Paid:* ₹${loanSummary.totalInterest.toLocaleString("en-IN")}
• *Total Paid (Principal + Interest):* ₹${(clpCalculations.totalDisbursedBalance + loanSummary.totalInterest).toLocaleString("en-IN")}

Generated using BuildMitra Financial Engine.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <>
      <Head>
        <title>BuildMitra — Housing Loan Finance Hub</title>
        <meta name="description" content="Housing Loan Finance calculator with date-based progressive cumulative disbursals, Month-Year date tags (Jun-26, Sep-26), total interest paid & total paid (principal + interest) metrics." />
      </Head>

      <Sidebar currentPath="/housing-loan-finance">
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px", color: "#1e293b", fontFamily: "system-ui, -apple-system, sans-serif" }}>
          
          {/* HEADER BANNER */}
          <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", padding: "24px", borderRadius: "16px", marginBottom: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ background: "#ff7a00", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                🏦 Housing Loan Finance Hub
              </span>
              <h1 style={{ margin: "8px 0 4px", fontSize: "24px", fontWeight: "900" }}>
                Housing Loan Finance &amp; Disbursal Calculator
              </h1>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                Enter property cost, interest rate &amp; tenure to calculate monthly EMI, CLP progressive releases, pre-EMI interest, and month-wise amortization.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={exportToExcel} style={{ padding: "10px 18px", background: "#16a34a", color: "#fff", border: 0, borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                📊 Export Excel
              </button>
              <button onClick={shareOnWhatsApp} style={{ padding: "10px 18px", background: "#25D366", color: "#fff", border: 0, borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                💬 Share WhatsApp
              </button>
            </div>
          </div>

          {/* TOP DASHBOARD METRIC BOXES — ALL START AT 0 UNTIL USER ENTERS INPUTS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", padding: "18px", borderRadius: "14px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)", borderLeft: "4px solid #38bdf8" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold" }}>TOTAL SANCTIONED LOAN</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: loanSummary.loanAmount > 0 ? "#38bdf8" : "#94a3b8", marginTop: "4px" }}>
                ₹{loanSummary.loanAmount.toLocaleString("en-IN")}
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", padding: "18px", borderRadius: "14px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)", borderLeft: "4px solid #4ade80" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold" }}>MONTHLY EMI</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: loanSummary.emi > 0 ? "#4ade80" : "#94a3b8", marginTop: "4px" }}>
                ₹{loanSummary.emi.toLocaleString("en-IN")} <span style={{ fontSize: "11px", color: "#94a3b8" }}>/mo</span>
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", padding: "18px", borderRadius: "14px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)", borderLeft: "4px solid #ff7a00" }}>
              <div style={{ fontSize: "11px", color: "#ff7a00", fontWeight: "bold" }}>TOTAL INTEREST PAID</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: loanSummary.totalInterest > 0 ? "#ff7a00" : "#94a3b8", marginTop: "4px" }}>
                ₹{loanSummary.totalInterest.toLocaleString("en-IN")}
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", padding: "18px", borderRadius: "14px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)", borderLeft: "4px solid #a855f7" }}>
              <div style={{ fontSize: "11px", color: "#a855f7", fontWeight: "bold" }}>TOTAL PAID (PRINCIPAL + INTEREST)</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: (clpCalculations.totalDisbursedBalance + loanSummary.totalInterest) > 0 ? "#c084fc" : "#94a3b8", marginTop: "4px" }}>
                ₹{(activeTab === "clp_plan" ? (clpCalculations.totalDisbursedBalance + loanSummary.totalInterest) : loanSummary.totalPayable).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* LOAN TYPE SELECTION CARDS — SWITCHING TYPES RESETS INPUTS & TOP BOXES TO 0 */}
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #cbd5e1", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "15px", color: "#0f172a", fontWeight: "bold" }}>
              📌 Select Housing Loan Category (Switching Resets Inputs to ₹0)
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
              {[
                { id: "home_construction", name: "Home Construction", icon: "🏗️", desc: "Self-construction on own plot with CLP disbursals", bg: "#f0f9ff", border: "#0284c7" },
                { id: "plot_construction", name: "Composite Plot + Build", icon: "🏞️", desc: "Plot purchase + construction loan package", bg: "#f0fdf4", border: "#16a34a" },
                { id: "home_purchase", name: "Ready Home Purchase", icon: "🏠", desc: "Apartment or ready villa purchase loan", bg: "#fff7ed", border: "#ff7a00" },
                { id: "renovation", name: "Home Extension", icon: "🛠️", desc: "Extension, renovation & improvement loan", bg: "#faf5ff", border: "#a855f7" },
              ].map((card) => {
                const isSelected = selectedLoanType === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleLoanTypeSwitch(card.id as LoanType)}
                    style={{
                      padding: "16px",
                      borderRadius: "14px",
                      border: isSelected ? `3px solid ${card.border}` : "1px solid #e2e8f0",
                      background: isSelected ? card.bg : "#ffffff",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected ? "0 4px 14px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{card.icon}</div>
                    <div style={{ fontSize: "14px", fontWeight: "900", color: "#0f172a", marginBottom: "4px" }}>{card.name}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.3 }}>{card.desc}</div>
                    {isSelected && (
                      <span style={{ display: "inline-block", marginTop: "10px", fontSize: "10px", fontWeight: "bold", background: card.border, color: "#ffffff", padding: "2px 8px", borderRadius: "10px" }}>
                        ✓ SELECTED
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SINGLE-ROW INPUT CONTROL PANEL BELOW LOAN TYPES (DEFAULT VALUES 0) */}
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #cbd5e1", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "14px", color: "#0f172a", fontWeight: "bold" }}>
              ⚙️ Enter Loan Details (Enter values below to start calculation)
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 0.8fr", gap: "16px", alignItems: "center" }}>
              
              {/* Property Cost Input & Slider */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                  <span>PROPERTY / BUILD COST</span>
                  <span style={{ color: "#0284c7" }}>₹{propertyValue.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="range"
                    min={0}
                    max={30000000}
                    step={100000}
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(parseFloat(e.target.value) || 0)}
                    style={{ flex: 1, accentColor: "#0284c7" }}
                  />
                  <input
                    type="number"
                    value={propertyValue || ""}
                    placeholder="Enter ₹"
                    onChange={(e) => setPropertyValue(parseFloat(e.target.value) || 0)}
                    style={{ width: "110px", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "bold" }}
                  />
                </div>
              </div>

              {/* Down Payment % */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                  <span>DOWN PAYMENT ({downPaymentPercent}%)</span>
                  <span style={{ color: "#16a34a" }}>₹{(propertyValue - requiredLoanAmount).toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value) || 0)}
                    style={{ flex: 1, accentColor: "#16a34a" }}
                  />
                  <input
                    type="number"
                    value={downPaymentPercent || ""}
                    placeholder="%"
                    onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value) || 0)}
                    style={{ width: "55px", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "bold", textAlign: "center" }}
                  />
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>INTEREST RATE (% p.a.)</label>
                <input
                  type="number"
                  step="0.05"
                  value={interestRate || ""}
                  placeholder="e.g. 8.5"
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "bold" }}
                />
              </div>

              {/* Tenure Years */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>TENURE (YEARS)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={tenureYears || ""}
                  placeholder="e.g. 20"
                  onChange={(e) => setTenureYears(parseInt(e.target.value) || 0)}
                  style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "bold" }}
                />
              </div>

            </div>
          </div>

          {/* TAB NAVIGATION BAR (SWITCHING TABS RESETS CACHED DATA TO 0) */}
          <div style={{ background: "#ffffff", padding: "6px", borderRadius: "12px", border: "1px solid #cbd5e1", marginBottom: "24px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              { id: "calculator", label: "🧮 EMI Overview" },
              { id: "clp_plan", label: "🏗️ Construction Linked Plan (CLP)" },
              { id: "eligibility", label: "👤 Income Eligibility & FOIR Solver" },
              { id: "bank_comparison", label: "🏦 Indian Bank Rates & Offer Matrix" },
              { id: "rbi_simulator", label: "📉 RBI Repo Rate Shift Simulator" },
              { id: "prepayment", label: "💡 Prepayment Interest Saver" },
              { id: "documents", label: "📋 Loan Document Checklist" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id as ActiveTab)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: 0,
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: activeTab === tab.id ? "#ff7a00" : "transparent",
                  color: activeTab === tab.id ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* DEDICATED SEPARATE CLP TAB WITH HIGHLIGHTED SUMMARY METRIC CARDS & STAGE DISBURSALS */}
          {activeTab === "clp_plan" && (
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
              
              {/* DEDICATED TOP HIGHLIGHTED CLP SUMMARY METRIC CARDS */}
              <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "14px", border: "1px solid #cbd5e1", marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 14px", fontSize: "14px", color: "#0f172a", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                  ⭐ CLP Progressive Disbursal Summary (Calculated across entered stages)
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  
                  {/* Card 1: TOTAL INTEREST PAID */}
                  <div style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "2px solid #ff7a00", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#ea580c" }}>🔥 TOTAL CUMULATIVE INTEREST PAID</div>
                    <div style={{ fontSize: "26px", fontWeight: "900", color: "#c2410c", marginTop: "4px" }}>
                      ₹{progressiveMonthlyAmortization.totalInterestSum.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9a3412", marginTop: "4px" }}>
                      Calculated cumulatively across entered disbursals @ {interestRate}% p.a.
                    </div>
                  </div>

                  {/* Card 2: TOTAL PAID (PRINCIPAL + INTEREST) */}
                  <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "2px solid #16a34a", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#15803d" }}>💰 TOTAL PAID (PRINCIPAL + INTEREST)</div>
                    <div style={{ fontSize: "26px", fontWeight: "900", color: "#166534", marginTop: "4px" }}>
                      ₹{(clpCalculations.totalDisbursedBalance + progressiveMonthlyAmortization.totalInterestSum).toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#14532d", marginTop: "4px" }}>
                      Disbursed Balance (₹{clpCalculations.totalDisbursedBalance.toLocaleString("en-IN")}) + Total Interest
                    </div>
                  </div>

                  {/* Card 3: CUMULATIVE DISBURSED BALANCE */}
                  <div style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", border: "2px solid #0284c7", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#0369a1" }}>🏗️ CUMULATIVE DISBURSED BALANCE</div>
                    <div style={{ fontSize: "26px", fontWeight: "900", color: "#075985", marginTop: "4px" }}>
                      ₹{clpCalculations.totalDisbursedBalance.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#0c4a6e", marginTop: "4px" }}>
                      Sanctioned Loan Limit: ₹{loanSummary.loanAmount.toLocaleString("en-IN")}
                    </div>
                  </div>

                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: "bold" }}>
                    🏗️ Construction Linked Plan (CLP) — Disbursal Milestone Stages
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                    Configure stage descriptions, disbursal dates &amp; release percentages below:
                  </p>
                </div>

                {/* Pre-EMI vs Full EMI Payment Selection Toggle Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", padding: "6px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                  <span style={{ fontSize: "11px", fontWeight: "bold", color: "#475569" }}>Disbursal Payment View Mode:</span>
                  <button
                    onClick={() => setClpPaymentOption("pre_emi")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: 0,
                      fontSize: "11px",
                      fontWeight: "bold",
                      background: clpPaymentOption === "pre_emi" ? "#16a34a" : "#e2e8f0",
                      color: clpPaymentOption === "pre_emi" ? "#ffffff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    🟢 Pre-EMI (Interest Only till Possession)
                  </button>
                  <button
                    onClick={() => setClpPaymentOption("full_emi")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: 0,
                      fontSize: "11px",
                      fontWeight: "bold",
                      background: clpPaymentOption === "full_emi" ? "#0284c7" : "#e2e8f0",
                      color: clpPaymentOption === "full_emi" ? "#ffffff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    🔵 Progressive Full EMI (Principal + Interest)
                  </button>

                  <button onClick={addClpStage} style={{ padding: "6px 12px", background: "#ff7a00", color: "#fff", border: 0, borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", marginLeft: "6px" }}>
                    + Add Stage
                  </button>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "2px solid #cbd5e1" }}>
                      <th style={{ padding: "10px", textAlign: "left" }}>Milestone Stage Description</th>
                      <th style={{ padding: "10px", textAlign: "center", width: "135px" }}>Date of Disbursal</th>
                      <th style={{ padding: "10px", textAlign: "center", width: "70px" }}>Share %</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Stage Disbursed Amount</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Cumulative Released Balance</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>
                        {clpPaymentOption === "pre_emi" ? "Est. Monthly Pre-EMI Interest" : "Progressive Full Monthly EMI"}
                      </th>
                      <th style={{ padding: "10px", textAlign: "center", width: "40px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clpCalculations.schedule.map((row) => (
                      <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="text"
                            value={row.stageName}
                            onChange={(e) => updateClpStage(row.id, "stageName", e.target.value)}
                            style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                          />
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <input
                            type="date"
                            value={row.disbursalDate || ""}
                            onChange={(e) => updateClpStage(row.id, "disbursalDate", e.target.value)}
                            style={{ padding: "5px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "bold" }}
                          />
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <input
                            type="number"
                            value={row.percent || 0}
                            onChange={(e) => updateClpStage(row.id, "percent", parseFloat(e.target.value) || 0)}
                            style={{ width: "55px", padding: "6px", borderRadius: "6px", border: "1px solid #0284c7", fontSize: "12px", fontWeight: "bold", textAlign: "center" }}
                          />
                        </td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold", color: "#0284c7" }}>
                          ₹{row.amount.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold", color: "#0f172a" }}>
                          ₹{row.cumAmount.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "8px", textAlign: "right", color: clpPaymentOption === "pre_emi" ? "#ea580c" : "#16a34a", fontWeight: "bold" }}>
                          {clpPaymentOption === "pre_emi"
                            ? `₹${row.preEmi.toLocaleString("en-IN")}/mo`
                            : `₹${row.progressiveFullEmi.toLocaleString("en-IN")}/mo`}
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <button
                            onClick={() => removeClpStage(row.id)}
                            style={{ padding: "4px 8px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ELIGIBILITY SOLVER */}
          {activeTab === "eligibility" && (
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a", fontWeight: "bold" }}>👤 Indian Banking FOIR &amp; LTV Eligibility Audit</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>NET MONTHLY INCOME (₹)</label>
                    <input type="number" value={monthlyIncome || ""} placeholder="Enter ₹" onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "bold" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>EXISTING MONTHLY EMIS (₹)</label>
                    <input type="number" value={existingEmi || ""} placeholder="Enter ₹" onChange={(e) => setExistingEmi(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>EMPLOYMENT TYPE</label>
                    <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}>
                      <option value="salaried">Salaried (Max FOIR 55%)</option>
                      <option value="self_employed">Self-Employed / Business (Max FOIR 60%)</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "12px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                  <div><b>Recommended EMI Limit:</b> <span style={{ color: "#16a34a", fontWeight: "bold" }}>₹{Math.round(monthlyIncome * 0.55 - existingEmi).toLocaleString("en-IN")}/mo</span></div>
                  <div><b>Down Payment Required:</b> ₹{(propertyValue - loanSummary.loanAmount).toLocaleString("en-IN")}</div>
                  <div><b>Sanctioned LTV Ratio:</b> {100 - downPaymentPercent}%</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANK COMPARISON */}
          {activeTab === "bank_comparison" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
              {BANK_COMPARISON_DATA.map((b) => (
                <div key={b.id} style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: b.isBestValue ? "2px solid #ff7a00" : "1px solid #cbd5e1", position: "relative" }}>
                  {b.isBestValue && (
                    <span style={{ position: "absolute", top: "-10px", right: "14px", background: "#ff7a00", color: "#fff", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "bold" }}>
                      ⭐ BEST VALUE OFFER
                    </span>
                  )}
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                    {b.logo} {b.name}
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "900", color: "#16a34a", marginBottom: "6px" }}>
                    {b.minRate.toFixed(2)}% - {b.maxRate.toFixed(2)}% <span style={{ fontSize: "11px", color: "#64748b" }}>p.a.</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div><b>Processing Fee:</b> {b.processingFee}</div>
                    <div><b>Max LTV:</b> Up to {b.maxLtvPercent}%</div>
                    <div><b>Special Scheme:</b> {b.specialConcession}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FULL PAGE PROGRESSIVE CUMULATIVE AMORTIZATION BREAKDOWN TABLE */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: "bold" }}>
                  📊 Progressive Disbursal Month-Wise Amortization Table (Calendar Month-Year Date Tags)
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Displays exact calendar month-year tags (e.g. <b>Jun-26</b>, <b>Sep-26</b>). Disbursals are added progressively to opening balance:
                </p>
              </div>
            </div>

            {/* FULL PAGE SCROLLABLE TABLE WITH DATE TAGS & DISBURSAL INJECTIONS */}
            <div style={{ maxHeight: "550px", overflowY: "auto", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              {progressiveMonthlyAmortization.rows.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                  👈 Enter <b>Property Cost</b>, <b>Interest Rate</b> &amp; <b>Tenure</b> above to load the progressive month-wise amortization schedule.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead style={{ position: "sticky", top: 0, background: "#0f172a", color: "#ffffff" }}>
                    <tr>
                      <th style={{ padding: "10px", textAlign: "center" }}>Month #</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Date (Month-Year)</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Stage Disbursal Added (₹)</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Opening Balance (₹)</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Principal Paid (₹)</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Interest Paid (₹)</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Closing Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressiveMonthlyAmortization.rows.map((r) => (
                      <tr key={r.month} style={{ borderBottom: "1px solid #f1f5f9", background: r.injectedDisbursal > 0 ? "#f0f9ff" : r.month % 2 === 0 ? "#f8fafc" : "#ffffff" }}>
                        <td style={{ padding: "8px", textAlign: "center", fontWeight: "bold" }}>Month {r.month}</td>
                        <td style={{ padding: "8px", textAlign: "center", fontWeight: "bold", color: "#0284c7" }}>{r.dateTag}</td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold", color: r.injectedDisbursal > 0 ? "#16a34a" : "#94a3b8" }}>
                          {r.injectedDisbursal > 0 ? `+₹${r.injectedDisbursal.toLocaleString("en-IN")}` : "-"}
                        </td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold" }}>₹{r.openingBalance.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px", textAlign: "right", color: "#16a34a", fontWeight: "bold" }}>₹{r.principalPaid.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px", textAlign: "right", color: "#ea580c", fontWeight: "bold" }}>₹{r.interestPaid.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold" }}>₹{r.closingBalance.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </Sidebar>
    </>
  );
}
