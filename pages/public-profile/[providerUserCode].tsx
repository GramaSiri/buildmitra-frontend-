import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { getApiBase } from "../../utils/apiConfig";
const API_BASE = getApiBase();

export default function PublicProviderProfile() {
  const router = useRouter();
  const { providerUserCode } = router.query;
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerUserCode) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/provider/public-profile/${encodeURIComponent(String(providerUserCode))}`);
        const data = await res.json();
        setProfile(data.profile || null);
        setListings(data.listings || []);
      } catch {
        setProfile(null);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [providerUserCode]);

  const phone = String(profile?.providerPhone || "").replace(/\D/g, "").replace(/^91/, "");

  if (loading) return <div style={styles.page}>Loading profile...</div>;
  if (!profile) return <div style={styles.page}>Provider profile not found.</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => router.push("/marketplace")}>Back to Marketplace</button>
        <h1 style={styles.title}>{profile.providerName}</h1>
        <div style={styles.verified}>Verified BuildMitra Provider</div>
        <div style={styles.meta}>{profile.providerRole || "provider"} - {profile.providerCity || "-"} {profile.providerArea ? `, ${profile.providerArea}` : ""} {profile.providerPincode ? `- ${profile.providerPincode}` : ""}</div>
        <div style={styles.actions}>
          {phone ? <button style={styles.whatsapp} onClick={() => window.open(`https://wa.me/91${phone}`, "_blank")}>WhatsApp</button> : null}
          {profile.providerPhone ? <button style={styles.secondary} onClick={() => window.open(`tel:${profile.providerPhone}`)}>Call</button> : null}
        </div>
      </div>

      <div style={styles.grid}>
        {listings.map((item) => (
          <div key={item._id || item.listingCode} style={styles.card}>
            <img src={item.imageUrl} alt={item.itemName} style={styles.image} />
            <div style={styles.body}>
              <h2 style={styles.item}>{item.itemName}</h2>
              <div style={styles.meta}>{item.brand || item.category} {item.category ? `- ${item.category}` : ""}</div>
              <div style={styles.price}>Rs {Number(item.rate || 0).toLocaleString()} <span style={styles.unit}>/ {item.unit || "unit"}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f7fb", padding: 24, fontFamily: "Arial, sans-serif", color: "#111827" },
  header: { maxWidth: 1100, margin: "0 auto 20px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20 },
  back: { border: "1px solid #d1d5db", background: "#fff", borderRadius: 8, padding: "9px 12px", cursor: "pointer", marginBottom: 14 },
  title: { margin: 0, fontSize: 32, fontWeight: 900 },
  verified: { color: "#138a4e", marginTop: 8, fontWeight: 800 },
  meta: { color: "#4b5563", marginTop: 8 },
  actions: { display: "flex", gap: 10, marginTop: 16 },
  whatsapp: { border: 0, background: "#16a34a", color: "#fff", borderRadius: 8, padding: "11px 16px", fontWeight: 900, cursor: "pointer" },
  secondary: { border: "1px solid #d1d5db", background: "#fff", borderRadius: 8, padding: "11px 16px", fontWeight: 800, cursor: "pointer" },
  grid: { maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" },
  image: { width: "100%", height: 170, objectFit: "cover", background: "#eef2f7" },
  body: { padding: 14 },
  item: { margin: "0 0 8px", fontSize: 19 },
  price: { marginTop: 12, fontSize: 23, fontWeight: 900, color: "#087443" },
  unit: { fontSize: 14, color: "#374151", fontWeight: 500 },
};

