import React, { useState, useEffect } from 'react';
import PropertyIntelligenceModal from '../components/PropertyIntelligenceModal';

interface PropertyItem {
  id: string;
  title: string;
  location: string;
  type: string;
  price: string;
  priceNum: number;
  rate: string;
  bhk: string;
  dimensions: string;
  approach: string;
  zoning: string;
  image: string;
  tag: string;
  seller?: {
    companyName: string;
    sellerCode: string;
    phone: string;
  };
  lat?: number;
  lng?: number;
}

// Complete Public Verified Property Catalog (All 9+ Core Properties)
const ALL_PUBLIC_PROPERTIES: PropertyItem[] = [
  {
    id: 'REP-197127',
    title: 'BDA Residential Villa Plot (BSK 6th Stage)',
    location: 'Near Arya Apartment, JP Nagar 8th Phase / BSK 6th Stage, Bengaluru',
    type: 'Plot',
    price: '₹1.50 Cr',
    priceNum: 150,
    rate: '₹12,500 / Sq.ft',
    bhk: 'Plot',
    dimensions: '30′ × 40′ (1,200 Sq.ft)',
    approach: '40 Ft Asphalt Road',
    zoning: 'BDA Approved Residential Yellow Zone',
    image: '/images/bda-plot-bsk6.jpeg',
    tag: '🏢 Garden Greens (REA-000003)',
    seller: {
      companyName: 'Garden Greens',
      sellerCode: 'REA-000003',
      phone: '9845012345'
    },
    lat: 12.8718,
    lng: 77.5753
  },
  {
    id: 'REP-MEDIA-064401',
    title: 'LBS Nagar Residential Villa Plot',
    location: 'Anjanapura, Bengaluru',
    type: 'Plot',
    price: '₹1.57 Cr',
    priceNum: 157,
    rate: '₹13,100 / Sq.ft',
    bhk: 'Plot',
    dimensions: '30′ × 40′ (1,200 Sq.ft)',
    approach: '60 Ft Asphalt Road',
    zoning: 'CDA 2031 Yellow Zone',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
    tag: '+172.9% vs Locality Avg',
    lat: 12.8580,
    lng: 77.5620
  },
  {
    id: 'REP-MEDIA-089122',
    title: 'Prestige Layout Premium G+2 Luxury Villa',
    location: 'Sarjapur Road, Near Wipro Campus, Bengaluru',
    type: 'Buy',
    price: '₹2.85 Cr',
    priceNum: 285,
    rate: '₹9,500 / Sq.ft',
    bhk: '3 BHK',
    dimensions: '40′ × 60′ (2,400 Sq.ft)',
    approach: '40 Ft Asphalt Road',
    zoning: 'BMRDA Approved Residential',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    tag: 'High Rental Yield (5.1%)',
    lat: 12.9249,
    lng: 77.6835
  },
  {
    id: 'REP-MEDIA-044211',
    title: 'Commercial Corner Plot / Showroom Space',
    location: 'Hosur Main Road, Electronic City Phase 1',
    type: 'Commercial',
    price: '₹4.20 Cr',
    priceNum: 420,
    rate: '₹17,500 / Sq.ft',
    bhk: 'Commercial',
    dimensions: '60′ × 40′ (2,400 Sq.ft)',
    approach: '80 Ft Main Arterial Road',
    zoning: 'BBMP Commercial BDA',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    tag: 'NICE Road Expressway Access',
    lat: 12.8399,
    lng: 77.6770
  },
  {
    id: 'REP-MEDIA-011923',
    title: 'Sobha Dream Acres High-Rise Apartment',
    location: 'Panathur, Whitefield, Bengaluru',
    type: 'Buy',
    price: '₹1.15 Cr',
    priceNum: 115,
    rate: '₹9,200 / Sq.ft',
    bhk: '2 BHK',
    dimensions: '1,250 Sq.ft Super Built-up',
    approach: '50 Ft Main Road',
    zoning: 'BDA Approved / RERA Verified',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    tag: 'Near Outer Ring Road IT Hub',
    lat: 12.9352,
    lng: 77.7126
  },
  {
    id: 'REP-MEDIA-073381',
    title: 'Brigade Meadows Modern Apartment',
    location: 'Kanakapura Road, Bengaluru',
    type: 'Rent',
    price: '₹35,000 / mo',
    priceNum: 0.35,
    rate: '₹26 / Sq.ft',
    bhk: '2 BHK',
    dimensions: '1,150 Sq.ft',
    approach: '40 Ft Road',
    zoning: 'BMRDA Residential',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    tag: 'Near Silk Institute Metro',
    lat: 12.8225,
    lng: 77.5348
  },
  {
    id: 'REP-MEDIA-051839',
    title: 'BMRDA Gated Community Residential Plot',
    location: 'Chandapura-Anekal Road, Bengaluru',
    type: 'Plot',
    price: '₹58.00 Lakhs',
    priceNum: 58,
    rate: '₹3,866 / Sq.ft',
    bhk: 'Plot',
    dimensions: '30′ × 50′ (1,500 Sq.ft)',
    approach: '40 Ft Concrete Road',
    zoning: 'BMRDA Approved Layout',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    tag: 'Fast Appreciating Zone',
    lat: 12.7891,
    lng: 77.6974
  },
  {
    id: 'REP-MEDIA-098271',
    title: 'Godrej Eternity Garden Duplex Villa',
    location: 'Holiday Village Road, Kanakapura Road',
    type: 'Buy',
    price: '₹2.10 Cr',
    priceNum: 210,
    rate: '₹10,500 / Sq.ft',
    bhk: '3 BHK',
    dimensions: '2,000 Sq.ft Built-up',
    approach: '60 Ft Road',
    zoning: 'BDA Approved',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    tag: 'Vaastu 100% Compliant',
    lat: 12.8682,
    lng: 77.5451
  },
  {
    id: 'REP-MEDIA-032918',
    title: 'Prestige Tech Park Office Space',
    location: 'Marathahalli - Sarjapur Outer Ring Road',
    type: 'Commercial',
    price: '₹1.80 Lakhs / mo',
    priceNum: 1.8,
    rate: '₹75 / Sq.ft',
    bhk: 'Commercial',
    dimensions: '2,400 Sq.ft Carpet',
    approach: '100 Ft Outer Ring Road',
    zoning: 'BBMP Grade-A IT SEZ',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    tag: 'Fully Furnished Plug & Play',
    lat: 12.9378,
    lng: 77.6934
  },
  {
    id: 'REP-MEDIA-029411',
    title: 'Independent 4 BHK Luxury Bungalow',
    location: 'HSR Layout Sector 2, Bengaluru',
    type: 'Buy',
    price: '₹5.50 Cr',
    priceNum: 550,
    rate: '₹15,277 / Sq.ft',
    bhk: '4+ BHK',
    dimensions: '50′ × 80′ (3,600 Sq.ft Built-up)',
    approach: '50 Ft Avenue Road',
    zoning: 'BBMP A-Khata Freehold',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    tag: 'Prime Core Bengaluru Corridor',
    lat: 12.9116,
    lng: 77.6474
  }
];

export const RealEstateHubPage: React.FC = () => {
  const [properties, setProperties] = useState<PropertyItem[]>(ALL_PUBLIC_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);

  // Original Clean Filters
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedBhk, setSelectedBhk] = useState<string>('ALL');
  const [budgetRange, setBudgetRange] = useState<string>('ALL');

  const fetchLiveProperties = async () => {
    let dashboardItems: any[] = [];
    if (typeof window !== 'undefined') {
      const storageKeys = ['realestate_properties', 'properties', 'bm_properties'];
      for (const k of storageKeys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) dashboardItems = [...dashboardItems, ...parsed];
          } catch(e) {}
        }
      }
    }

    if (dashboardItems.length > 0) {
      const seenIds = new Set<string>();
      const mapped: PropertyItem[] = [];

      for (const item of dashboardItems) {
        const id = item.propertyId || item.id || `REP-${Math.floor(1000 + Math.random() * 9000)}`;
        if (seenIds.has(id)) continue;
        seenIds.add(id);

        const rawPrice = item.price || '1.50 Cr';
        const priceNumVal = typeof item.priceNum === 'number' ? item.priceNum : 150;

        mapped.push({
          id,
          title: item.title || `${item.propertyType || 'Property'} in ${item.location || 'Bengaluru'}`,
          location: item.location || 'Bengaluru',
          type: item.propertyType?.includes('Plot') ? 'Plot' : item.propertyType?.includes('Commercial') ? 'Commercial' : item.type === 'Rent' ? 'Rent' : 'Buy',
          price: String(rawPrice).startsWith('₹') ? rawPrice : `₹${rawPrice}`,
          priceNum: priceNumVal,
          rate: item.ratePerSqFt ? `₹${item.ratePerSqFt} / Sq.ft` : '₹12,500 / Sq.ft',
          bhk: item.bhk ? `${item.bhk} BHK` : item.propertyType?.includes('Plot') ? 'Plot' : '3 BHK',
          dimensions: item.dimensions || '1,200 Sq.ft',
          approach: item.approachRoad || '40 Ft Asphalt Road',
          zoning: item.zoning || 'BDA Approved Residential',
          image: item.image || '/images/bda-plot-bsk6.jpeg',
          tag: item.companyName ? `🏢 ${item.companyName}` : '✓ Live Verified',
          seller: {
            companyName: item.companyName || 'Garden Greens',
            sellerCode: item.sellerCode || 'REA-000003',
            phone: item.phone || '9845012345'
          },
          lat: item.lat ? parseFloat(item.lat) : 12.8718,
          lng: item.lng ? parseFloat(item.lng) : 77.5753
        });
      }

      // Merge user dashboard uploaded properties with full public catalog
      const merged = [...mapped];
      for (const def of ALL_PUBLIC_PROPERTIES) {
        if (!seenIds.has(def.id)) {
          merged.push(def);
        }
      }
      setProperties(merged);
    }
  };

  useEffect(() => {
    fetchLiveProperties();
  }, []);

  const filteredProperties = properties.filter((p) => {
    const locMatch = searchLocation === '' || 
      p.location.toLowerCase().includes(searchLocation.toLowerCase()) || 
      p.title.toLowerCase().includes(searchLocation.toLowerCase()) ||
      p.id.toLowerCase().includes(searchLocation.toLowerCase());

    const typeMatch = selectedType === 'ALL' || p.type.toLowerCase() === selectedType.toLowerCase();

    const bhkMatch = selectedBhk === 'ALL' || 
      (selectedBhk === 'Plot' && p.bhk === 'Plot') ||
      (selectedBhk === '4+' && (p.bhk.includes('4') || p.bhk.includes('5'))) ||
      p.bhk.startsWith(selectedBhk);

    let budgetMatch = true;
    if (budgetRange === 'under_50l') budgetMatch = p.priceNum <= 50;
    else if (budgetRange === '50l_1cr') budgetMatch = p.priceNum > 50 && p.priceNum <= 100;
    else if (budgetRange === '1cr_3cr') budgetMatch = p.priceNum > 100 && p.priceNum <= 300;
    else if (budgetRange === 'above_3cr') budgetMatch = p.priceNum > 300;

    return locMatch && typeMatch && bhkMatch && budgetMatch;
  });

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      
      {/* Top Banner */}
      <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '28px 32px', borderRadius: '20px', marginBottom: '24px', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.15)', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#2563eb', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                BuildMitra Verified Real Estate Hub
              </span>
              <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                {filteredProperties.length} Public Listings Active
              </span>
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '10px 0 6px 0', letterSpacing: '-0.02em' }}>
              Verified Real Estate & Land Intelligence Hub
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, maxWidth: '800px' }}>
              Public buyer repository for BDA/BMRDA residential plots, luxury villas, apartments, and commercial sites across Bengaluru & Hosur.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={fetchLiveProperties}
              style={{ padding: '12px 18px', backgroundColor: '#334155', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
            >
              🔄 Refresh Listings
            </button>
            <a
              href="/realestate-dashboard"
              style={{ padding: '12px 22px', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>+</span> Vendor Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Multi-Filter Search Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
          
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              📍 Locality / ID / Project
            </label>
            <input
              type="text"
              placeholder="e.g. JP Nagar, Sarjapur, Whitefield..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              🏷️ Category
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }}
            >
              <option value="ALL">All Categories</option>
              <option value="Plot">🏡 Villa Plots & Layouts</option>
              <option value="Buy">🏠 Residential Homes / Villas</option>
              <option value="Rent">🔑 Rentals & Leases</option>
              <option value="Commercial">🏢 Commercial Properties</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              🛏️ BHK / Layout
            </label>
            <select
              value={selectedBhk}
              onChange={(e) => setSelectedBhk(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }}
            >
              <option value="ALL">Any Configuration</option>
              <option value="Plot">Plots (No BHK)</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4+">4+ BHK / Villas</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              💰 Budget Range
            </label>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }}
            >
              <option value="ALL">All Price Ranges</option>
              <option value="under_50l">Under ₹50 Lakhs</option>
              <option value="50l_1cr">₹50 Lakhs - ₹1.00 Cr</option>
              <option value="1cr_3cr">₹1.00 Cr - ₹3.00 Cr</option>
              <option value="above_3cr">Above ₹3.00 Cr</option>
            </select>
          </div>

        </div>
      </div>

      {/* Public Property Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            onClick={() => setSelectedProperty(property)}
            style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s ease-in-out', display: 'flex', flexDirection: 'column' }}
          >
            {/* Image Box */}
            <div style={{ position: 'relative', height: '230px', backgroundColor: '#0f172a' }}>
              <img
                src={property.image}
                alt={property.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '5px 10px', borderRadius: '8px' }}>
                {property.type} • {property.bhk}
              </span>
              <span style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '5px 10px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(5,150,105,0.4)' }}>
                {property.tag}
              </span>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>{property.id}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>✓ Title Verified</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '6px 0 4px 0', lineHeight: '1.3' }}>
                  {property.title}
                </h3>
                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                  📍 {property.location}
                </div>

                {/* Specs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '14px 0' }}>
                  <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '11px', color: '#334155' }}>
                    📐 <strong>{property.dimensions}</strong>
                  </div>
                  <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '11px', color: '#334155' }}>
                    🛣️ <strong>{property.approach}</strong>
                  </div>
                </div>
              </div>

              {/* Price & Action Button */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>{property.price}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{property.rate}</div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProperty(property);
                  }}
                  style={{ padding: '10px 16px', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 800, fontSize: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                >
                  View Property Intelligence →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProperty && (
        <PropertyIntelligenceModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

    </div>
  );
};

export default RealEstateHubPage;
