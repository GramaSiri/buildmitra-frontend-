import { getApiBase } from "../utils/apiConfig";
import { authFetch } from "../utils/authFetch";

export interface DBProperty {
  id: string;
  propertyId: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  type: string;
  listingType: string;
  propertyType: string;
  price: string;
  priceNum: number;
  rate: string;
  ratePerSqFt?: string;
  bhk: string;
  dimensions: string;
  approach: string;
  approachRoad?: string;
  roadFacing: string;
  zoning: string;
  sroOffice: string;
  guidanceValue: number;
  image: string;
  tag: string;
  status: 'Available' | 'Under Pipeline' | 'Sold / Closed';
  companyName?: string;
  sellerCode?: string;
  phone?: string;
  seller?: {
    companyName: string;
    sellerCode: string;
    phone: string;
  };
  createdAt?: any;
}

export interface DBEnquiry {
  id: string;
  propertyId: string;
  callerName: string;
  phone: string;
  date: string;
  budget: string;
  status: 'New Enquiry' | 'Site Visit Scheduled' | 'Under Pipeline' | 'Deal Closed' | 'Dropped';
  createdAt?: any;
}

const LOCAL_PROPERTIES_KEY = 'realestate_properties';
const LOCAL_ENQUIRIES_KEY = 'bm_realestate_enquiries';

export function formatImageUrl(src: string): string {
  if (!src) return '/images/bda_plot_bsk_stage_6.jpeg';
  const clean = String(src).trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  const apiBase = getApiBase();
  const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
  return `${apiBase}${cleanPath}`;
}

export async function fetchAllProperties(sellerCode: string = "REA-000003"): Promise<DBProperty[]> {
  try {
    const apiBase = getApiBase();
    const res = await authFetch(`${apiBase}/api/realestate/mine/${encodeURIComponent(sellerCode)}`, {
      headers: { "x-user-code": sellerCode }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.properties) && data.properties.length > 0) {
      const mapped: DBProperty[] = data.properties.map((p: any) => {
        const rawImg = p.coverImage || (Array.isArray(p.images) && p.images[0]) || p.imageUrl || p.image || '';
        return {
          id: p.propertyCode || p._id || p.id,
          propertyId: p.propertyCode || p._id || p.id,
          title: p.title || "Property",
          location: p.locality || p.city || p.location || "Bengaluru",
          lat: Number(p.lat || p.latitude) || (p.intelligence?.coordinates?.lat) || 12.8718,
          lng: Number(p.lng || p.longitude) || (p.intelligence?.coordinates?.lng) || 77.5753,
          type: p.listingType || "Sale",
          listingType: p.listingType || "Sale",
          propertyType: p.propertyType || "Plot",
          price: p.price || (typeof p.totalAmount === "number" ? `₹${(p.totalAmount / 10000000).toFixed(2)} Cr` : "₹1.50 Cr"),
          priceNum: Number(p.priceNum) || (p.totalAmount ? Math.round(p.totalAmount / 100000) : 150),
          rate: p.displayFormattedRate || p.rate || `₹${p.pricePerSqft || 12500} / Sq.ft`,
          ratePerSqFt: String(p.ratePerSqFt || p.pricePerSqft || "12500"),
          bhk: p.propertyType?.includes("plot") ? "Plot" : "3 BHK",
          dimensions: p.dimensions || "30′ × 40′ (1,200 Sq.ft)",
          approach: p.approachRoad || p.approach || "40 Ft Asphalt",
          approachRoad: p.approachRoad || p.approach || "40 Ft Asphalt",
          roadFacing: p.roadFacing || p.facing || "East Facing Main Road",
          zoning: p.zoning || p.approvalType || "BDA Approved",
          sroOffice: p.sroOffice || (p.intelligence?.jurisdiction?.defaultSro) || "SRO JP Nagar",
          guidanceValue: Number(p.guidanceValue) || (p.intelligence?.guidelineValuation?.guidanceRatePerSqFt) || 6800,
          image: formatImageUrl(rawImg),
          tag: '✓ Live Verified Listing',
          status: p.status === 'Sold' ? 'Sold / Closed' : p.status === 'Pending' ? 'Under Pipeline' : 'Available',
          companyName: p.providerName || "Garden Greens",
          sellerCode: p.providerUserCode || sellerCode,
          phone: p.providerPhone || "9845012345"
        };
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(mapped));
      }
      return mapped;
    }
  } catch (err) {
    console.log("Cloud properties fetch error, falling back to local cache:", err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }
  return [];
}

export async function savePropertyToCloud(propData: DBProperty): Promise<DBProperty> {
  const propertyWithMeta = {
    ...propData,
    image: formatImageUrl(propData.image),
    status: propData.status || 'Available',
    createdAt: new Date().toISOString()
  };

  try {
    const apiBase = getApiBase();
    await authFetch(`${apiBase}/api/realestate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-code": propData.sellerCode || "REA-000003"
      },
      body: JSON.stringify({
        ...propData,
        providerUserCode: propData.sellerCode || "REA-000003",
        providerName: propData.companyName || "Garden Greens",
        providerPhone: propData.phone || "9845012345",
        askingPrice: propData.priceNum ? propData.priceNum * 10000000 : 15000000,
        price: propData.priceNum ? propData.priceNum * 10000000 : 15000000,
        totalAmount: propData.priceNum ? propData.priceNum * 10000000 : 15000000,
        coverImage: propData.image,
        image: propData.image,
        images: propData.image ? [propData.image] : [],
        imageUrls: propData.image ? [propData.image] : []
      })
    });
  } catch (err) {
    console.log("Save property to cloud error:", err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    const list: DBProperty[] = cached ? JSON.parse(cached) : [];
    const updated = [propertyWithMeta, ...list.filter((p) => p.id !== propertyWithMeta.id)];
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(updated));
    // Trigger broadcast for live synchronizing Real Estate Hub
    window.dispatchEvent(new CustomEvent('bm_property_saved', { detail: propertyWithMeta }));
  }

  return propertyWithMeta;
}

export async function updatePropertyStatusInCloud(propId: string, newStatus: 'Available' | 'Under Pipeline' | 'Sold / Closed'): Promise<void> {
  try {
    const apiBase = getApiBase();
    const backendStatus = newStatus === 'Sold / Closed' ? 'Sold' : newStatus === 'Under Pipeline' ? 'Pending' : 'Available';
    await authFetch(`${apiBase}/api/realestate/${encodeURIComponent(propId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: backendStatus })
    });
  } catch (err) {
    console.log("Update property status in cloud error:", err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    if (cached) {
      const list: DBProperty[] = JSON.parse(cached);
      const updated = list.map((p) => (p.id === propId ? { ...p, status: newStatus } : p));
      localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(updated));
    }
  }
}

export async function fetchAllEnquiries(sellerCode: string = "REA-000003"): Promise<DBEnquiry[]> {
  try {
    const apiBase = getApiBase();
    const res = await authFetch(`${apiBase}/api/enquiry?providerUserCode=${encodeURIComponent(sellerCode)}`, {
      headers: { "x-user-code": sellerCode }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.enquiries) && data.enquiries.length > 0) {
      const mapped: DBEnquiry[] = data.enquiries.map((e: any) => ({
        id: e._id || e.enquiryCode,
        propertyId: e.propertyCode || e.listingCode || "REP-197127",
        callerName: e.buyerName || "Enquiry Client",
        phone: e.buyerPhone || "9876543210",
        date: e.createdAt ? e.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
        budget: e.quotedAmount ? `₹${e.quotedAmount}` : "₹1.50 Cr",
        status: e.status === "Approved" ? "Site Visit Scheduled" : e.status === "Closed" ? "Deal Closed" : "New Enquiry"
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_ENQUIRIES_KEY, JSON.stringify(mapped));
      }
      return mapped;
    }
  } catch (err) {
    console.log("Enquiries cloud fetch error:", err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_ENQUIRIES_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }
  return [];
}

export async function logNewEnquiryToCloud(enquiryData: DBEnquiry): Promise<DBEnquiry> {
  const enquiryWithMeta = {
    ...enquiryData,
    createdAt: new Date().toISOString()
  };

  try {
    const apiBase = getApiBase();
    await authFetch(`${apiBase}/api/enquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerName: enquiryData.callerName,
        buyerPhone: enquiryData.phone,
        propertyCode: enquiryData.propertyId,
        enquiryCategory: "realestate",
        providerUserCode: "REA-000003",
        providerRole: "realestate"
      })
    });
  } catch (err) {
    console.log("Log enquiry to cloud error:", err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_ENQUIRIES_KEY);
    const list: DBEnquiry[] = cached ? JSON.parse(cached) : [];
    const updated = [enquiryWithMeta, ...list];
    localStorage.setItem(LOCAL_ENQUIRIES_KEY, JSON.stringify(updated));
  }

  return enquiryWithMeta;
}
