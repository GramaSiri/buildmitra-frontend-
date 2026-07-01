import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RealEstateHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("partner");
  const [layouts, setLayouts] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState("");
  const [bhk, setBhk] = useState("");
  const [budget, setBudget] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [approvalType, setApprovalType] = useState("");

  useEffect(() => {
    setLayouts(JSON.parse(localStorage.getItem("bm_realestate_layouts") || "[]"));
    setPlots(JSON.parse(localStorage.getItem("bm_realestate_plots") || "[]"));
    setProperties(JSON.parse(localStorage.getItem("realEstateProperties") || "[]"));
  }, []);

  const fmt = (n: any) => {
    const v = Number(n || 0);
    if (v >= 10000000) return "₹" + (v / 10000000).toFixed(1) + "Cr";
    if (v >= 100000) return "₹" + (v / 100000).toFixed(1) + "L";
    return "₹" + v.toLocaleString("en-IN");
  };

  const styles: any = {
    page: { minHeight: "100vh", background: "#f1f5f9", padding: 16, fontFamily: "Arial" },
    hero: { background: "linear-gradient(135deg,#064e3b,#0f766e)", color: "white", padding: 20, borderRadius: 16, marginBottom: 16 },
    tabs: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
    tab: { padding: "10px 14px", borderRadius: 999, border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 800 },
    activeTab: { background: "#0f766e", color: "white", borderColor: "#0f766e" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 },
    card: { background: "white", borderRadius: 14, padding: 16, boxShadow: "0 3px 12px rgba(15,23,42,.12)" },
    btn: { border: 0, borderRadius: 8, padding: "10px 14px", background: "#0f766e", color: "white", fontWeight: 800, cursor: "pointer", marginRight: 8, marginTop: 8 },
    badge: { display: "inline-block", padding: "4px 9px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 800 },
    table: { width: "100%", borderCollapse: "collapse", background: "white", marginTop: 10 },
    th: { background: "#0f766e", color: "white", padding: 8, textAlign: "left" },
    td: { padding: 8, borderBottom: "1px solid #e2e8f0" }
  };

  const demoLayout = {
    id: "demo",
    layoutName: "BuildMitra Green County",
    developerName: "BuildMitra Marketing Partner",
    reraNo: "RERA / Approval details to be updated",
    location: "Bengaluru",
    ratePerSft: 3500,
    discount: "Launch offer",
    offer: "Free site visit + loan assistance",
    amenities: "Roads, drainage, water, electricity, park area",
    phone: "9876543210",
    status: "Featured"
  };

  const displayLayouts = layouts.length ? layouts : [demoLayout];

  const renderPartnerPlots = () => (
    <div>
      <h2 style={{ color: "#0f172a" }}>🌟 BuildMitra Prime Plot Deals</h2>
      <p>Featured layouts and plots uploaded by BuildMitra / real estate owners from dashboard.</p>

      {selectedLayout && (
        <div style={{ ...styles.card, border: "2px solid #0f766e", marginBottom: 16 }}>
          <h2>{selectedLayout.layoutName}</h2>
          <p><b>Developer:</b> {selectedLayout.developerName}</p>
          <p><b>Location:</b> {selectedLayout.location}</p>
          <p><b>RERA / Approval:</b> {selectedLayout.reraNo}</p>
          <p><b>Authority:</b> {selectedLayout.authority}</p>
          <p><b>Rate:</b> {fmt(selectedLayout.ratePerSft)}/sft</p>
          <p><b>Discount:</b> {selectedLayout.discount}</p>
          <p><b>Offer:</b> {selectedLayout.offer}</p>
          <p><b>Amenities:</b> {selectedLayout.amenities}</p>
          <p><b>Google Map:</b> {selectedLayout.googleMap || "Not uploaded"}</p>
          <p><b>Brochure:</b> {selectedLayout.brochureUrl || "Not uploaded"}</p>
          <p><b>Master Plan:</b> {selectedLayout.masterPlanUrl || "Not uploaded"}</p>
          <p><b>Video:</b> {selectedLayout.videoUrl || selectedLayout.droneVideoUrl || "Not uploaded"}</p>
          <button style={styles.btn} onClick={() => window.open(`https://wa.me/91${selectedLayout.phone || "9876543210"}?text=Hi, I am interested in ${selectedLayout.layoutName}`, "_blank")}>WhatsApp Enquiry</button>
          <button style={styles.btn} onClick={() => alert("Site visit request saved for beta testing.")}>Book Site Visit</button>
          <button style={{ ...styles.btn, background: "#64748b" }} onClick={() => setSelectedLayout(null)}>Close Details</button>
        </div>
      )}

      <div style={styles.grid}>
        {displayLayouts.map(l => (
          <div key={l.id} style={styles.card}>
            <span style={styles.badge}>{l.status || "Live"}</span>
            <h2>{l.layoutName}</h2>
            <p><b>Developer:</b> {l.developerName}</p>
            <p><b>Location:</b> {l.location}</p>
            <p><b>Rate:</b> {fmt(l.ratePerSft)}/sft</p>
            <p><b>Offer:</b> {l.offer || l.discount}</p>
            <button style={styles.btn} onClick={() => setSelectedLayout(l)}>View Complete Details</button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 20 }}>📍 Available / Sold Plot Inventory</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Plot</th><th style={styles.th}>Layout</th><th style={styles.th}>Facing</th><th style={styles.th}>Area</th><th style={styles.th}>Rate</th><th style={styles.th}>Total</th><th style={styles.th}>Status</th></tr></thead>
        <tbody>
          {plots.filter(matchesFilter).length === 0 ? <tr><td style={styles.td} colSpan={7}>No matching plot inventory uploaded yet.</td></tr> : plots.filter(matchesFilter).map(p => <tr key={p.id}><td style={styles.td}>{p.plotNo}</td><td style={styles.td}>{p.layoutName}</td><td style={styles.td}>{p.facing}</td><td style={styles.td}>{p.area}</td><td style={styles.td}>{fmt(p.ratePerSft)}</td><td style={styles.td}>{fmt(p.totalAmount)}</td><td style={styles.td}>{p.status}</td></tr>)}
        </tbody>
      </table>
    </div>
  );

  const matchesFilter = (p: any) => {
    const text = JSON.stringify(p || {}).toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (pincode && !text.includes(pincode.toLowerCase())) return false;
    if (bhk && !text.includes(bhk.toLowerCase())) return false;
    if (propertyType && !text.includes(propertyType.toLowerCase())) return false;
    if (approvalType && !text.includes(approvalType.toLowerCase())) return false;
    if (budget && Number(p.totalAmount || p.price || p.quotedPrice || 0) > Number(budget)) return false;
    return true;
  };

  const renderProperties = (type: string) => {
    const filtered = properties.filter(p => {
      const listing = String(p.listingType || "Sell").toLowerCase();
      return listing.includes(type) && matchesFilter(p);
    });

    return (
      <div style={styles.grid}>
        {filtered.length ? filtered.map(p => (
          <div key={p.id} style={styles.card}>
            <span style={styles.badge}>{p.listingType || "Sell"}</span>
            <h2>{p.title}</h2>
            <p><b>Location:</b> {p.location}</p>
            <p><b>Property Type:</b> {p.propertyType || p.type || "Property"}</p>
            <p><b>Approval:</b> {p.approvalType || p.authority || "Not specified"}</p>
            <p><b>BHK:</b> {p.bhk || "N/A"}</p>
            <p><b>Quoted Price:</b> {fmt(p.totalAmount || p.price || p.quotedPrice)}</p>
            <p><b>Discount:</b> {p.discount || "N/A"}</p>
            <button style={styles.btn} onClick={() => window.open(`https://wa.me/${p.contactNumber || "919876543210"}?text=Hi, I am interested in ${p.title}`, "_blank")}>Enquire</button>
          </div>
        )) : <div style={styles.card}>No matching listings found.</div>}
      </div>
    );
  };
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <button onClick={() => router.back()} style={{ ...styles.btn, background: "rgba(255,255,255,.18)" }}>← Back</button>
        <h1>🏘️ BuildMitra Real Estate Hub</h1>
        <p>Public marketplace for layouts, plots, rental, buy/sell and BuildMitra partner plot deals.</p>
      </section>

      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>🔎 Search & Filter Properties</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
          <input style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} placeholder="Search location/layout" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} placeholder="Preferred pincode / area" value={pincode} onChange={(e) => setPincode(e.target.value)} />
          <select style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} value={bhk} onChange={(e) => setBhk(e.target.value)}>
            <option value="">BHK</option><option>1 BHK</option><option>2 BHK</option><option>3 BHK</option><option>4 BHK</option><option>Villa</option>
          </select>
          <select style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="">Budget</option><option value="2500000">Below ₹25L</option><option value="5000000">Below ₹50L</option><option value="10000000">Below ₹1Cr</option><option value="20000000">Below ₹2Cr</option>
          </select>
          <select style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option value="">Property Type</option><option>Plots</option><option>Flats</option><option>Ready to Move In</option><option>Agriculture Land</option><option>Farm Land</option><option>Industrial Land</option><option>Commercial Land</option>
          </select>
          <select style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} value={approvalType} onChange={(e) => setApprovalType(e.target.value)}>
            <option value="">Approval Type</option><option>GBA</option><option>BDA</option><option>BMRDA</option><option>Revenue</option>
          </select>
        </div>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab("partner")} style={{ ...styles.tab, ...(activeTab === "partner" ? styles.activeTab : {}) }}>🌟 BuildMitra Prime Plot Deals</button>
        <button onClick={() => setActiveTab("rental")} style={{ ...styles.tab, ...(activeTab === "rental" ? styles.activeTab : {}) }}>🏠 Rental</button>
        <button onClick={() => setActiveTab("buy")} style={{ ...styles.tab, ...(activeTab === "buy" ? styles.activeTab : {}) }}>🛒 Buy</button>
        <button onClick={() => setActiveTab("sell")} style={{ ...styles.tab, ...(activeTab === "sell" ? styles.activeTab : {}) }}>🏷️ Sell</button>
      </div>

      {activeTab === "partner" && renderPartnerPlots()}
      {activeTab === "rental" && renderProperties("rental")}
      {activeTab === "buy" && renderProperties("buy")}
      {activeTab === "sell" && renderProperties("sell")}
    </main>
  );
}

