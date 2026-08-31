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

export async function fetchAllProperties(): Promise<DBProperty[]> {
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
    status: propData.status || 'Available',
    createdAt: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    const list: DBProperty[] = cached ? JSON.parse(cached) : [];
    const updated = [propertyWithMeta, ...list.filter((p) => p.id !== propertyWithMeta.id)];
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(updated));
  }

  return propertyWithMeta;
}

export async function updatePropertyStatusInCloud(propId: string, newStatus: 'Available' | 'Under Pipeline' | 'Sold / Closed'): Promise<void> {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    if (cached) {
      const list: DBProperty[] = JSON.parse(cached);
      const updated = list.map((p) => (p.id === propId ? { ...p, status: newStatus } : p));
      localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(updated));
    }
  }
}

export async function fetchAllEnquiries(): Promise<DBEnquiry[]> {
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

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_ENQUIRIES_KEY);
    const list: DBEnquiry[] = cached ? JSON.parse(cached) : [];
    const updated = [enquiryWithMeta, ...list];
    localStorage.setItem(LOCAL_ENQUIRIES_KEY, JSON.stringify(updated));
  }

  return enquiryWithMeta;
}
