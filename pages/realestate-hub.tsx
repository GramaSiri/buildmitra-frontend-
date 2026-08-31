import React, { useState, useEffect } from 'react';
import PropertyIntelligenceModal from '../components/PropertyIntelligenceModal';
import InteractivePinpointMap from '../components/InteractivePinpointMap';
import { autoResolvePropertyGeoData } from '../utils/geoResolver';

export interface PropertyItem {
  id: string;
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
  bhk: string;
  dimensions: string;
  approach: string;
  roadFacing: string;
  zoning: string;
  sroOffice: string;
  guidanceValue: number;
  image: string;
  tag: string;
  seller?: {
    companyName: string;
    sellerCode: string;
    phone: string;
  };
}

const ALL_PUBLIC_PROPERTIES: PropertyItem[] = [
  {
    id: 'REP-197127',
    title: 'BDA Residential Villa Plot (BSK 6th Stage)',
    location: 'Near Arya Apartment, JP Nagar 8th Phase / BSK 6th Stage, Bengaluru',
    lat: 12.8718,
    lng: 77.5753,
    type: 'Plot',
    listingType: 'Sale',
    propertyType: 'BDA Plot',
    price: '₹1.50 Cr',
    priceNum: 150,
    rate: '₹12,500 / Sq.ft',
    bhk: 'Plot',
    dimensions: '30′ × 40′ (1,200 Sq.ft)',
    approach: '40 Ft Asphalt Road',
    roadFacing: 'East Facing Main Road',
    zoning: 'BDA Approved Residential Yellow Zone',
    sroOffice: 'SRO JP Nagar / Jayanagar',
    guidanceValue: 6800,
    image: '/images/bda-plot-bsk6.jpeg',
    tag: '🏢 Garden Greens (REA-000003)',
    seller: { companyName: 'Garden Greens', sellerCode: 'REA-000003', phone: '9845012345' }
  },
  {
    id: 'REP-AGRI-00912',
    title: 'Managed Farmland & Agriculture Land (1.5 Acres)',
    location: 'Belagondapalli, Near Taneja Aerospace (TAAL), Hosur Taluk, Krishnagiri Dist, Tamil Nadu',
    lat: 12.6850,
    lng: 77.8100,
    type: 'Plot',
    listingType: 'Sale',
    propertyType: 'Agriculture Land',
    price: '₹1.80 Cr',
    priceNum: 180,
    rate: '₹1.20 Cr / Acre',
    bhk: 'Land',
    dimensions: '1.5 Acres (65,340 Sq.ft)',
    approach: '30 Ft Concrete Approach Road',
    roadFacing: 'North Facing Road',
    zoning: 'Green Belt / Agricultural Zone',
    sroOffice: 'SRO Denkanikottai / SRO Kelamangalam / SRO Hosur (TNREGINET)',
    guidanceValue: 450,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    tag: '🌾 Clear Title Farmland (TN)'
  },
  {
    id: 'REP-IND-00441',
    title: 'KIADB Approved Industrial Land / Plot (1 Acre)',
    location: 'Harohalli Industrial Area Phase 2, Kanakapura NH Corridor',
    lat: 12.6820,
    lng: 77.4550,
    type: 'Plot',
    listingType: 'Sale',
    propertyType: 'Industrial Land',
    price: '₹3.50 Cr',
    priceNum: 350,
    rate: '₹800 / Sq.ft',
    bhk: 'Industrial',
    dimensions: '1 Acre (43,560 Sq.ft)',
    approach: '60 Ft Heavy Vehicle Road',
    roadFacing: 'East Facing Main Road',
    zoning: 'KIADB Industrial Zone',
    sroOffice: 'SRO Harohalli / Kanakapura',
    guidanceValue: 450,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    tag: '🏭 Heavy Power & Water Line'
  },
  {
    id: 'REP-REV-00812',
    title: 'DC Converted Revenue Residential Site (30x40)',
    location: 'Near Anjanapura 11th Block, Bengaluru South',
    lat: 12.8580,
    lng: 77.5620,
    type: 'Plot',
    listingType: 'Sale',
    propertyType: 'Revenue Sites',
    price: '₹65 Lakhs',
    priceNum: 65,
    rate: '₹5,416 / Sq.ft',
    bhk: 'Plot',
    dimensions: '30′ × 40′ (1,200 Sq.ft)',
    approach: '30 Ft Concrete Road',
    roadFacing: 'North Facing Road',
    zoning: 'DC Converted Revenue Approved',
    sroOffice: 'SRO JP Nagar / Begur',
    guidanceValue: 3200,
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
    tag: '📜 DC Converted e-Aasthi'
  },
  {
    id: 'REP-MEDIA-089122',
    title: 'Prestige Layout Premium G+2 Luxury Villa',
    location: 'Sarjapur Road, Near Wipro Campus, Bengaluru',
    lat: 12.9249,
    lng: 77.6835,
    type: 'Buy',
    listingType: 'Sale',
    propertyType: 'Residential Home',
    price: '₹2.85 Cr',
    priceNum: 285,
    rate: '₹9,500 / Sq.ft',
    bhk: '3 BHK',
    dimensions: '40′ × 60′ (2,400 Sq.ft)',
    approach: '40 Ft Asphalt Road',
    roadFacing: 'East Facing Main Road',
    zoning: 'BMRDA Approved Residential',
    sroOffice: 'SRO Bommanahalli / Sarjapur',
    guidanceValue: 4800,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    tag: 'High Rental Yield (5.1%)'
  }
];

export const RealEstateHubPage: React.FC = () => {
  const [properties, setProperties] = useState<PropertyItem[]>(ALL_PUBLIC_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  // Filters
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [budgetRange, setBudgetRange] = useState<string>('ALL');

  // Form states
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Near Arya Apartment, JP Nagar 8th Phase, Bengaluru');
  const [lat, setLat] = useState<number>(12.8718);
  const [lng, setLng] = useState<number>(77.5753);
  const [propertyType, setPropertyType] = useState('BDA Plot');
  const [listingType, setListingType] = useState('Sale');
  const [price, setPrice] = useState('1.50');
  const [priceUnit, setPriceUnit] = useState('Cr');
  const [ratePerSqFt, setRatePerSqFt] = useState('12500');
  const [dimensions, setDimensions] = useState('30′ × 40′ (1,200 Sq.ft)');
  const [approachRoad, setApproachRoad] = useState('40 Ft Asphalt');
  const [roadFacing, setRoadFacing] = useState('East Facing Main Road');
  const [zoning, setZoning] = useState('BDA Approved Residential Yellow Zone');
  const [uploadedImage, setUploadedImage] = useState('');

  // Auto-Sourced Intelligence State
  const [autoSro, setAutoSro] = useState('SRO JP Nagar / Jayanagar');
  const [autoGuidance, setAutoGuidance] = useState<number>(6800);

  const handleMapLocationSelect = (newLat: number, newLng: number, addressText: string) => {
    setLat(newLat);
    setLng(newLng);
    setLocation(addressText);
    const geo = autoResolvePropertyGeoData(addressText, title, newLat, newLng);
    setAutoSro(geo.defaultSro);
    setAutoGuidance(geo.guidanceValue);
  };

  const openPostModal = (propToEdit?: PropertyItem) => {
    if (propToEdit) {
      setEditingPropertyId(propToEdit.id);
      setTitle(propToEdit.title);
      setLocation(propToEdit.location);
      setLat(propToEdit.lat || 12.8718);
      setLng(propToEdit.lng || 77.5753);
      setPropertyType(propToEdit.propertyType || 'BDA Plot');
      setListingType(propToEdit.listingType || 'Sale');
      setDimensions(propToEdit.dimensions);
      setApproachRoad(propToEdit.approach);
      setRoadFacing(propToEdit.roadFacing || 'East Facing Main Road');
      setZoning(propToEdit.zoning);
      setUploadedImage(propToEdit.image);
      setAutoSro(propToEdit.sroOffice);
      setAutoGuidance(propToEdit.guidanceValue);
    } else {
      setEditingPropertyId(null);
      setTitle('');
      setLocation('Near Arya Apartment, JP Nagar 8th Phase, Bengaluru');
      setLat(12.8718);
      setLng(77.5753);
      setUploadedImage('');
    }
    setIsPostModalOpen(true);
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = editingPropertyId || `REP-${Math.floor(100000 + Math.random() * 900000)}`;
    const priceNumeric = priceUnit === 'Cr' ? parseFloat(price) * 100 : parseFloat(price) || 50;

    const newProp: PropertyItem = {
      id: pid,
      title: title || `${propertyType} in ${location}`,
      location,
      lat,
      lng,
      type: propertyType.includes('Plot') || propertyType.includes('Land') || propertyType.includes('Site') ? 'Plot' : 'Buy',
      listingType,
      propertyType,
      price: `₹${price} ${priceUnit}`,
      priceNum: priceNumeric,
      rate: `₹${ratePerSqFt} / Sq.ft`,
      bhk: propertyType.includes('Plot') ? 'Plot' : propertyType.includes('Land') ? 'Land' : '3 BHK',
      dimensions,
      approach: approachRoad,
      roadFacing,
      zoning,
      sroOffice: autoSro,
      guidanceValue: autoGuidance,
      image: uploadedImage || '/images/bda-plot-bsk6.jpeg',
      tag: '✓ Live Pinpointed Listing',
      seller: { companyName: 'BuildMitra Verified Seller', sellerCode: 'USR-LIVE', phone: '9845012345' }
    };

    let updatedList: PropertyItem[];
    if (editingPropertyId) {
      updatedList = properties.map((p) => (p.id === editingPropertyId ? newProp : p));
    } else {
      updatedList = [newProp, ...properties];
    }

    setProperties(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('realestate_properties', JSON.stringify(updatedList));
    }
    setIsPostModalOpen(false);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) setUploadedImage(result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('realestate_properties');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Replace any old mismatched coordinates in stored records
            const synced = parsed.map((item: PropertyItem) => {
              if (item.location?.toLowerCase().includes('belagondapalli') || item.location?.toLowerCase().includes('taneja')) {
                return { ...item, lat: 12.6850, lng: 77.8100 };
              }
              return item;
            });
            const seen = new Set<string>();
            const merged: PropertyItem[] = [];
            for (const item of [...synced, ...ALL_PUBLIC_PROPERTIES]) {
              if (!seen.has(item.id)) {
                seen.add(item.id);
                merged.push(item);
              }
            }
            setProperties(merged);
            localStorage.setItem('realestate_properties', JSON.stringify(merged));
            return;
          }
        } catch (e) {}
      }
      setProperties(ALL_PUBLIC_PROPERTIES);
      localStorage.setItem('realestate_properties', JSON.stringify(ALL_PUBLIC_PROPERTIES));
    }
  }, []);

  const filteredProperties = properties.filter((p) => {
    const locMatch = searchLocation === '' || 
      p.location.toLowerCase().includes(searchLocation.toLowerCase()) || 
      p.title.toLowerCase().includes(searchLocation.toLowerCase()) ||
      p.id.toLowerCase().includes(searchLocation.toLowerCase());
    
    const catMatch = selectedCategory === 'ALL' || p.propertyType.toLowerCase() === selectedCategory.toLowerCase();
    
    let budgetMatch = true;
    if (budgetRange === 'under_50l') budgetMatch = p.priceNum <= 50;
    else if (budgetRange === '50l_1cr') budgetMatch = p.priceNum > 50 && p.priceNum <= 100;
    else if (budgetRange === '1cr_3cr') budgetMatch = p.priceNum > 100 && p.priceNum <= 300;
    else if (budgetRange === 'above_3cr') budgetMatch = p.priceNum > 300;
    
    return locMatch && catMatch && budgetMatch;
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
                {filteredProperties.length} Verified Properties Active
              </span>
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '10px 0 6px 0', letterSpacing: '-0.02em' }}>
              Verified Real Estate, Land & Intelligence Hub
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, maxWidth: '800px' }}>
              Browse BDA Plots, Agriculture Farmland, Industrial KIADB Lands, Revenue & Gramatana Sites with instant SRO and GIS intelligence.
            </p>
          </div>

          <button
            onClick={() => openPostModal()}
            style={{ padding: '14px 24px', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 900, fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.35)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>📍</span> + Pinpoint & Post Land / Property
          </button>
        </div>
      </div>

      {/* Multi-Filter Search Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>📍 Locality / Pin</label>
            <input
              type="text"
              placeholder="e.g. Belagondapalli, JP Nagar, Harohalli, Sarjapur..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>🏷️ Land & Property Type</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }}
            >
              <option value="ALL">All Categories</option>
              <option value="BDA Plot">🏡 BDA Approved Plot</option>
              <option value="BMRDA Villa Plot">🏡 BMRDA / DTCP Plot</option>
              <option value="Agriculture Land">🌾 Agriculture Land / Farmland</option>
              <option value="Industrial Land">🏭 Industrial Land / KIADB</option>
              <option value="Revenue Sites">📜 Revenue Sites (DC Converted)</option>
              <option value="Gramatana Sites">🏘️ Gramatana Sites (E-Swathu)</option>
              <option value="Residential Home">🏠 Residential Home / Villa</option>
              <option value="Apartment">🏢 Apartment</option>
              <option value="Commercial Land">🏬 Commercial Land / Building</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>💰 Budget Range</label>
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

      {/* Property Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            onClick={() => setSelectedProperty(property)}
            style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
          >
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
                {property.propertyType} • {property.listingType}
              </span>
              <span style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '5px 10px', borderRadius: '8px' }}>
                {property.tag}
              </span>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>{property.id}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPostModal(property);
                    }}
                    style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    📍 Pinpoint / Adjust Map
                  </button>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '6px 0 4px 0', lineHeight: '1.3' }}>
                  {property.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📍 {property.location}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '14px 0' }}>
                  <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '11px', color: '#334155' }}>
                    📐 <strong>{property.dimensions}</strong>
                  </div>
                  <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '11px', color: '#334155' }}>
                    🛣️ <strong>{property.approach}</strong>
                  </div>
                </div>
              </div>

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

      {/* POST / UPDATE MODAL */}
      {isPostModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={handleSaveProperty} style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '980px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '28px', border: '1px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  {editingPropertyId ? `Adjust Property Pinpoint (${editingPropertyId})` : '📍 Pinpoint & Post Property / Land'}
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Search building name, type address, or drag the red pin directly to your site.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                style={{ backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontWeight: 900, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* INTERACTIVE LEAFLET PINPOINT MAP COMPONENT */}
            <div style={{ marginBottom: '20px' }}>
              <InteractivePinpointMap
                initialLat={lat}
                initialLng={lng}
                initialAddress={location}
                onLocationSelect={handleMapLocationSelect}
              />
            </div>

            {/* Auto-Captured Intelligence Matrix */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px 16px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>✓ Auto-Resolved Benchmarks</span>
                <div style={{ fontSize: '12px', fontWeight: 900, color: '#14532d', marginTop: '2px' }}>
                  🏛️ Jurisdiction: <strong>{autoSro}</strong> • 💰 Govt. Guidance Value: <strong>₹{autoGuidance.toLocaleString('en-IN')}/Sft</strong>
                </div>
              </div>
              <span style={{ backgroundColor: '#16a34a', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                Benchmark Locked
              </span>
            </div>

            {/* Basic Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agriculture Land / Gramatana Site / BDA Plot"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>Property & Land Category</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff', fontWeight: 700 }}
                >
                  <option value="BDA Plot">🏡 BDA Approved Plot</option>
                  <option value="BMRDA Villa Plot">🏡 BMRDA / DTCP Plot</option>
                  <option value="Agriculture Land">🌾 Agriculture Land / Farmland</option>
                  <option value="Industrial Land">🏭 Industrial Land / KIADB</option>
                  <option value="Revenue Sites">📜 Revenue Sites (DC Converted)</option>
                  <option value="Gramatana Sites">🏘️ Gramatana Sites (E-Swathu)</option>
                  <option value="Residential Home">🏠 Residential Home / Villa</option>
                  <option value="Apartment">🏢 Apartment</option>
                  <option value="Commercial Land">🏬 Commercial Land / Building</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>Road Facing</label>
                <select
                  value={roadFacing}
                  onChange={(e) => setRoadFacing(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="East Facing Main Road">East Facing Main Road</option>
                  <option value="North Facing Main Road">North Facing Main Road</option>
                  <option value="North-East Corner Plot">North-East Corner Plot</option>
                  <option value="West Facing 40ft Road">West Facing 40ft Road</option>
                </select>
              </div>
            </div>

            {/* Pricing & Dimensions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>Price</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                  />
                  <select
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#ffffff' }}
                  >
                    <option value="Cr">Cr</option>
                    <option value="Lakhs">Lakhs</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>Rate / Sq.ft (₹)</label>
                <input
                  type="text"
                  value={ratePerSqFt}
                  onChange={(e) => setRatePerSqFt(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>Plot / Land Dimensions</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 30x40 / 1.5 Acres"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>Approach Road Width</label>
                <input
                  type="text"
                  value={approachRoad}
                  onChange={(e) => setApproachRoad(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Media Upload */}
            <div style={{ padding: '14px', borderRadius: '10px', border: '1.5px dashed #cbd5e1', backgroundColor: '#f8fafc', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>📷 Property Photo (JPG, PNG, WEBP)</div>
              <input type="file" accept="image/*" onChange={handleImageFile} style={{ fontSize: '12px', cursor: 'pointer' }} />
              {uploadedImage && <div style={{ fontSize: '11px', color: '#059669', fontWeight: 800, marginTop: '6px' }}>✓ Image Loaded Ready</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 800, fontSize: '13px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '10px 24px', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 900, fontSize: '13px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}
              >
                {editingPropertyId ? 'Save & Lock Pinpoint Benchmark →' : 'Publish Property with Fixed Pin →'}
              </button>
            </div>
          </form>
        </div>
      )}

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
