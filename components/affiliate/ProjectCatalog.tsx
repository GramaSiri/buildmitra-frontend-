import React, { useState, useMemo } from "react";
import {
  RealEstateProject,
  InventoryUnit,
  MediaDrawing,
  ProjectOffer,
  AffiliateBooking,
  calculateUnitCommission,
} from "../../utils/affiliate/commissionEngine";
import {
  formatCurrencyINR,
  getStatusBadgeStyle,
  getFacingVastuColor,
} from "../../utils/affiliate/inventoryEngine";

interface ProjectCatalogProps {
  projects: RealEstateProject[];
  bookings: AffiliateBooking[];
  onUpdateProjects: (projects: RealEstateProject[]) => void;
  onUpdateBookings: (bookings: AffiliateBooking[]) => void;
}

export default function ProjectCatalog({
  projects,
  bookings,
  onUpdateProjects,
  onUpdateBookings,
}: ProjectCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilder, setSelectedBuilder] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFacing, setSelectedFacing] = useState("");
  const [budgetLimit, setBudgetLimit] = useState<number>(0);

  // Selected Items for Modals
  const [activeDrawing, setActiveDrawing] = useState<{
    project: RealEstateProject;
    media: MediaDrawing;
  } | null>(null);
  const [bookingUnit, setBookingUnit] = useState<{
    project: RealEstateProject;
    unit: InventoryUnit;
  } | null>(null);

  // Lead Booking Form State
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("AFF-BENGALURU-07");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unique Builder List
  const builders = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(p.builderName));
    return Array.from(set);
  }, [projects]);

  // Flash Offers
  const allOffers = useMemo(() => {
    const list: { offer: ProjectOffer; projectName: string }[] = [];
    projects.forEach((p) => {
      (p.offers || []).forEach((off) => {
        list.push({ offer: off, projectName: p.projectName });
      });
    });
    return list;
  }, [projects]);

  // Filtered Projects & Units
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedBuilder && p.builderName !== selectedBuilder) return false;
      const textMatch =
        !searchTerm ||
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.builderName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!textMatch) return false;

      // Check if any unit in the project satisfies unit-level filters
      if (selectedCategory || selectedFacing || budgetLimit > 0) {
        const hasMatchingUnit = (p.inventory || []).some((u) => {
          if (selectedCategory && u.type !== selectedCategory) return false;
          if (selectedFacing && u.facing !== selectedFacing) return false;
          if (budgetLimit > 0 && u.totalUnitCost > budgetLimit) return false;
          return true;
        });
        if (!hasMatchingUnit) return false;
      }
      return true;
    });
  }, [projects, searchTerm, selectedBuilder, selectedCategory, selectedFacing, budgetLimit]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingUnit || !buyerName || !buyerPhone) {
      alert("Please fill in Buyer Name and Contact Number!");
      return;
    }

    setIsSubmitting(true);
    const { project, unit } = bookingUnit;

    const calcComm = calculateUnitCommission(unit, unit.totalUnitCost);
    const gstAmt = Math.round(calcComm * 0.18);

    const newBooking: AffiliateBooking = {
      id: `book-${Date.now()}`,
      bookingCode: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      projectId: project.id,
      projectName: project.projectName,
      builderName: project.builderName,
      unitId: unit.id,
      unitNo: unit.unitNo,
      unitType: unit.type,
      areaSqFt: unit.areaSqFt,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerEmail: buyerEmail.trim(),
      buyerRefCode: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      finalSalePrice: unit.totalUnitCost,
      calculatedCommission: calcComm,
      gstAmount: gstAmt,
      totalCommissionWithGst: calcComm + gstAmt,
      status: "Agreed",
      bookingDate: new Date().toISOString().split("T")[0],
      siteVisitRequested: Boolean(visitDate),
      visitDate,
      affiliateCode,
    };

    // Update Unit status to 'Reserved' or 'Sold'
    const updatedProjects = projects.map((p) => {
      if (p.id === project.id) {
        const updatedInventory = (p.inventory || []).map((u) => {
          if (u.id === unit.id) {
            return { ...u, status: "Reserved" as InventoryUnit["status"] };
          }
          return u;
        });
        return { ...p, inventory: updatedInventory };
      }
      return p;
    });

    onUpdateProjects(updatedProjects);
    onUpdateBookings([newBooking, ...bookings]);

    setIsSubmitting(false);
    setBookingUnit(null);

    alert(
      `🎉 Congratulations! Unit ${unit.unitNo} reserved under Booking Ref #${newBooking.bookingCode}. Commission tracking initiated!`
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* FLASH OFFERS BANNER */}
      {allOffers.length > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            borderRadius: "16px",
            padding: "16px 20px",
            color: "#ffffff",
            boxShadow: "0 8px 20px rgba(124,58,237,0.2)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#c4b5fd" }}>
            ⚡ Live Developer Offers & Flash Discounts Engine
          </div>

          <div style={{ display: "flex", gap: "14px", overflowX: "auto", marginTop: "10px", paddingBottom: "4px" }}>
            {allOffers.map(({ offer, projectName }, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: "280px",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(6px)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ background: "#ff7a00", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "10px", fontWeight: 800 }}>
                    {offer.code}
                  </span>
                  <span style={{ fontSize: "11px", opacity: 0.9 }}>Valid till {offer.validUntil}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: "14px", marginTop: "6px" }}>{offer.title}</div>
                <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "2px" }}>{offer.description}</div>
                <div style={{ fontSize: "11px", color: "#a5b4fc", marginTop: "6px", fontWeight: 700 }}>
                  📍 {projectName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Search Project / Location</label>
          <input
            type="text"
            style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            placeholder="e.g. Electronic City or Brigade"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Builder / Developer</label>
          <select
            style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            value={selectedBuilder}
            onChange={(e) => setSelectedBuilder(e.target.value)}
          >
            <option value="">All Developers</option>
            {builders.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Property Type</label>
          <select
            style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories (Plot/BHK/Villa)</option>
            <option value="Plot">Plot Layout</option>
            <option value="1BHK">1BHK Apartment</option>
            <option value="2BHK">2BHK Apartment</option>
            <option value="3BHK">3BHK Apartment</option>
            <option value="4BHK">4BHK Apartment</option>
            <option value="Villa">Villa / Duplex</option>
            <option value="Commercial">Commercial Shop</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Vastu Facing</label>
          <select
            style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            value={selectedFacing}
            onChange={(e) => setSelectedFacing(e.target.value)}
          >
            <option value="">Any Facing</option>
            <option value="East">East (Prime Vastu)</option>
            <option value="North">North (Prime Vastu)</option>
            <option value="North-East">North-East</option>
            <option value="West">West</option>
            <option value="South">South</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Max Budget Limit</label>
          <select
            style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(Number(e.target.value))}
          >
            <option value={0}>Any Budget</option>
            <option value={6000000}>Under ₹60 Lakh</option>
            <option value={10000000}>Under ₹1 Crore</option>
            <option value={20000000}>Under ₹2 Crore</option>
          </select>
        </div>
      </div>

      {/* PROJECT CATALOG SHOWCASE */}
      {filteredProjects.length === 0 ? (
        <div style={{ background: "#ffffff", padding: "40px", borderRadius: "16px", textAlign: "center", color: "#64748b" }}>
          <h3>No projects matched your criteria.</h3>
          <p>Try resetting filters or searching with a different location.</p>
        </div>
      ) : (
        filteredProjects.map((project) => {
          const totalUnits = project.inventory?.length || 0;
          const availableUnits = (project.inventory || []).filter((u) => u.status === "Available");

          return (
            <div
              key={project.id}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
              }}
            >
              {/* PROJECT HEADER CARD */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    height: "220px",
                    backgroundImage: `url(${project.heroImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "#166534",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "20px",
                    }}
                  >
                    RERA APPROVED
                  </span>
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#ff7a00", fontWeight: 800 }}>
                      🏢 {project.builderName}
                    </div>
                    <h3 style={{ margin: "4px 0 6px", fontSize: "22px", color: "#0f172a" }}>
                      {project.projectName}
                    </h3>
                    <div style={{ fontSize: "13px", color: "#475569" }}>
                      📍 {project.location}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                      RERA No: {project.reraNumber}
                    </div>
                    <p style={{ fontSize: "13px", color: "#334155", margin: "10px 0 0", lineHeight: 1.4 }}>
                      {project.description}
                    </p>
                  </div>

                  {/* DRAWING PREVIEW BUTTONS */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                    {(project.mediaDrawings || []).map((media) => (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() => setActiveDrawing({ project, media })}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#0f172a",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        📐 {media.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* INVENTORY UNITS GRID */}
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
                    Available Plot & Unit Inventory ({availableUnits.length} / {totalUnits})
                  </h4>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Tap any unit to reserve or schedule site visit with affiliate tracking
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {(project.inventory || []).map((unit) => {
                    const statusBadge = getStatusBadgeStyle(unit.status);
                    const vastuColor = getFacingVastuColor(unit.facing);
                    const isAvailable = unit.status === "Available";

                    return (
                      <div
                        key={unit.id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "16px",
                          background: isAvailable ? "#ffffff" : "#f8fafc",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>
                              {unit.unitNo}
                            </span>
                            <span
                              style={{
                                background: statusBadge.bg,
                                color: statusBadge.color,
                                border: `1px solid ${statusBadge.border}`,
                                fontSize: "10px",
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: "10px",
                              }}
                            >
                              {statusBadge.label}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                            <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                              {unit.type}
                            </span>
                            <span style={{ color: vastuColor, fontSize: "11px", fontWeight: 700 }}>
                              🧭 {unit.facing} Facing
                            </span>
                          </div>

                          <div style={{ marginTop: "10px", fontSize: "13px", color: "#475569" }}>
                            <div><b>Area:</b> {unit.areaSqFt.toLocaleString("en-IN")} Sq.Ft ({unit.dimensions || "Standard"})</div>
                            <div><b>Rate:</b> ₹{unit.baseRatePerSqFt.toLocaleString("en-IN")}/sqft</div>
                            <div style={{ marginTop: "4px", fontSize: "17px", fontWeight: 800, color: "#166534" }}>
                              {formatCurrencyINR(unit.totalUnitCost)}
                            </div>
                          </div>
                        </div>

                        {/* BOOK / RESERVE ACTION BUTTONS */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setBookingUnit({ project, unit })}
                            style={{
                              flex: 1,
                              background: isAvailable
                                ? "linear-gradient(135deg, #10b981, #059669)"
                                : "#cbd5e1",
                              color: "#ffffff",
                              border: 0,
                              borderRadius: "8px",
                              padding: "10px",
                              fontWeight: 800,
                              fontSize: "12px",
                              cursor: isAvailable ? "pointer" : "not-allowed",
                            }}
                          >
                            {isAvailable ? "⚡ Instant Reserve / Book" : "Unit Blocked"}
                          </button>

                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `Hi, I am interested in booking ${unit.unitNo} (${unit.type}) at ${project.projectName} by ${project.builderName}. Total cost: ${formatCurrencyINR(
                                unit.totalUnitCost
                              )}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: "#25d366",
                              color: "#ffffff",
                              borderRadius: "8px",
                              padding: "10px 12px",
                              fontWeight: 800,
                              fontSize: "12px",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            💬
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* DRAWING INSPECTOR MODAL */}
      {activeDrawing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(4px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "850px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: 800 }}>
                  {activeDrawing.project.projectName}
                </span>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                  📐 {activeDrawing.media.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveDrawing(null)}
                style={{ background: "#ef4444", color: "#fff", border: 0, borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontWeight: 800 }}
              >
                ✕ Close
              </button>
            </div>

            <img
              src={activeDrawing.media.fileUrl}
              alt={activeDrawing.media.title}
              style={{ width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0" }}
            />

            <div style={{ marginTop: "16px", background: "#f8fafc", padding: "14px", borderRadius: "10px", fontSize: "13px", color: "#475569" }}>
              <b>Architectural Specifications:</b> {activeDrawing.media.description || "Official RERA CAD Drawing Document."}
            </div>
          </div>
        </div>
      )}

      {/* LEAD GENERATION & BOOKING MODAL */}
      {bookingUnit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <form
            onSubmit={handleBookingSubmit}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "#166534", fontWeight: 800 }}>AFFILIATE BOOKING RECONCILIATION</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#15803d" }}>
                {bookingUnit.unit.unitNo} ({bookingUnit.unit.type}) — {formatCurrencyINR(bookingUnit.unit.totalUnitCost)}
              </div>
              <div style={{ fontSize: "12px", color: "#374151" }}>{bookingUnit.project.projectName} ({bookingUnit.project.builderName})</div>
            </div>

            <h3 style={{ margin: "0 0 14px", fontSize: "17px", color: "#0f172a" }}>
              📋 Complete Buyer Details for Unit Reservation
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Buyer Full Name *</label>
                <input
                  required
                  style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. Suresh Kumar"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Buyer Mobile Number *</label>
                <input
                  required
                  style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="+91 98450 00000"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Buyer Email Address</label>
                <input
                  type="email"
                  style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="suresh@gmail.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Preferred Site Visit Date (Optional)</label>
                <input
                  type="date"
                  style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Affiliate Tracking Code</label>
                <input
                  style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  border: 0,
                  borderRadius: "8px",
                  padding: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {isSubmitting ? "Processing Reservation..." : "Confirm & Reserve Unit"}
              </button>
              <button
                type="button"
                onClick={() => setBookingUnit(null)}
                style={{
                  background: "#e2e8f0",
                  border: 0,
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
