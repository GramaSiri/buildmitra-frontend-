import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ProjectCatalog from "../components/affiliate/ProjectCatalog";
import ProjectOnboardingPortal from "../components/affiliate/ProjectOnboardingPortal";
import InvoicingHub from "../components/affiliate/InvoicingHub";
import AffiliateDashboard from "../components/affiliate/AffiliateDashboard";
import {
  RealEstateProject,
  AffiliateBooking,
  CommissionInvoice,
  getAffiliateProjects,
  saveAffiliateProjects,
  getAffiliateBookings,
  saveAffiliateBookings,
  getAffiliateInvoices,
  saveAffiliateInvoices,
} from "../utils/affiliate/commissionEngine";

export default function AffiliateMarketingPage() {
  const [activeTab, setActiveTab] = useState<
    "catalog" | "onboarding" | "invoicing" | "dashboard"
  >("catalog");

  const [projects, setProjects] = useState<RealEstateProject[]>([]);
  const [bookings, setBookings] = useState<AffiliateBooking[]>([]);
  const [invoices, setInvoices] = useState<CommissionInvoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedProjects = getAffiliateProjects();
    const loadedBookings = getAffiliateBookings();
    const loadedInvoices = getAffiliateInvoices();

    setProjects(loadedProjects);
    setBookings(loadedBookings);
    setInvoices(loadedInvoices);
    setIsLoaded(true);
  }, []);

  const handleUpdateProjects = (updated: RealEstateProject[]) => {
    setProjects(updated);
    saveAffiliateProjects(updated);
  };

  const handleUpdateBookings = (updated: AffiliateBooking[]) => {
    setBookings(updated);
    saveAffiliateBookings(updated);
  };

  const handleUpdateInvoices = (updated: CommissionInvoice[]) => {
    setInvoices(updated);
    saveAffiliateInvoices(updated);
  };

  if (!isLoaded) {
    return (
      <Sidebar currentPath="/affiliate-marketing">
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading Real Estate Affiliate & Direct Marketing Engine...
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar currentPath="/affiliate-marketing">
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* MODULE HEADER BAR */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px 24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  background: "linear-gradient(135deg, #ff7a00, #ea580c)",
                  color: "#ffffff",
                  fontSize: "24px",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(255,122,0,0.25)",
                }}
              >
                📢
              </span>
              <div>
                <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 900, color: "#0f172a" }}>
                  Real Estate Affiliate & Direct Marketing Engine
                </h1>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Direct Developer Project Onboarding, Live Inventory Manager, Automated GST Tax Invoicing & CAD Drawing Showcase.
                </p>
              </div>
            </div>
          </div>

          {/* TOP QUICK STAT BADGES */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "8px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 700 }}>PROJECTS</div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a" }}>
                {projects.length}
              </div>
            </div>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "8px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "10px", color: "#166534", fontWeight: 700 }}>BOOKINGS</div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#15803d" }}>
                {bookings.length}
              </div>
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "8px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "10px", color: "#1e40af", fontWeight: 700 }}>INVOICES</div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#2563eb" }}>
                {invoices.length}
              </div>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION HEADER */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "2px solid #e2e8f0",
            marginBottom: "20px",
            overflowX: "auto",
          }}
        >
          {[
            { id: "catalog", label: "📢 Consumer Project Showcase & Inventory", icon: "🏠" },
            { id: "onboarding", label: "🏗️ Developer Onboarding & Media", icon: "📐" },
            { id: "invoicing", label: "🧾 Commission Invoicing & Billing", icon: "📄" },
            { id: "dashboard", label: "📈 Sales & Revenue Analytics", icon: "📊" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px 10px 0 0",
                  border: "1px solid transparent",
                  borderBottom: isActive ? "3px solid #ff7a00" : "1px solid transparent",
                  background: isActive ? "#ffffff" : "transparent",
                  color: isActive ? "#ff7a00" : "#64748b",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT AREA */}
        {activeTab === "catalog" && (
          <ProjectCatalog
            projects={projects}
            bookings={bookings}
            onUpdateProjects={handleUpdateProjects}
            onUpdateBookings={handleUpdateBookings}
          />
        )}

        {activeTab === "onboarding" && (
          <ProjectOnboardingPortal
            projects={projects}
            onUpdateProjects={handleUpdateProjects}
          />
        )}

        {activeTab === "invoicing" && (
          <InvoicingHub
            projects={projects}
            bookings={bookings}
            invoices={invoices}
            onUpdateInvoices={handleUpdateInvoices}
          />
        )}

        {activeTab === "dashboard" && (
          <AffiliateDashboard
            projects={projects}
            bookings={bookings}
            invoices={invoices}
          />
        )}
      </div>
    </Sidebar>
  );
}
