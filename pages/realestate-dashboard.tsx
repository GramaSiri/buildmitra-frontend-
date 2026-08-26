import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface Property {
  id: string;
  propertyId: string;
  title: string;
  location: string;
  type: string;
  listingType: string;
  propertyType: string;
  price: string;
  priceNum: number;
  ratePerSqFt: string;
  dimensions: string;
  approachRoad: string;
  roadFacing: string;
  zoning: string;
  companyName: string;
  sellerCode: string;
  phone: string;
  image: string;
  status: string;
}

export const RealEstateDashboard: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'post'>('listings');

  // Form states
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('BDA Plot');
  const [listingType, setListingType] = useState('Sale');
  const [price, setPrice] = useState('1.50');
  const [priceUnit, setPriceUnit] = useState('Cr');
  const [ratePerSqFt, setRatePerSqFt] = useState('12500');
  const [dimensions, setDimensions] = useState('30′ × 40′ (1,200 Sq.ft)');
  const [approachRoad, setApproachRoad] = useState('40 Ft Asphalt');
  const [roadFacing, setRoadFacing] = useState('East Facing Main Road');
  const [zoning, setZoning] = useState('BDA Approved Residential Yellow Zone');
  const [companyName, setCompanyName] = useState('Garden Greens');
  const [sellerCode, setSellerCode] = useState('REA-000003');
  const [phone, setPhone] = useState('9845012345');
  const [uploadedImage, setUploadedImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('realestate_properties');
    if (stored) {
      try {
        setProperties(JSON.parse(stored));
      } catch (e) {}
    } else {
      const initialProps: Property[] = [
        {
          id: 'REP-197127',
          propertyId: 'REP-197127',
          title: 'BDA Residential Villa Plot (BSK 6th Stage)',
          location: 'Near Arya Apartment, JP Nagar 8th Phase / BSK 6th Stage, Bengaluru',
          type: 'Plot',
          listingType: 'Sale',
          propertyType: 'BDA Plot',
          price: '₹1.50 Cr',
          priceNum: 150,
          ratePerSqFt: '12500',
          dimensions: '30′ × 40′ (1,200 Sq.ft)',
          approachRoad: '40 Ft Asphalt',
          roadFacing: 'East Facing Main Road',
          zoning: 'BDA Approved Residential Yellow Zone',
          companyName: 'Garden Greens',
          sellerCode: 'REA-000003',
          phone: '9845012345',
          image: '/images/bda-plot-bsk6.jpeg',
          status: 'Available'
        }
      ];
      setProperties(initialProps);
      localStorage.setItem('realestate_properties', JSON.stringify(initialProps));
    }
  }, []);

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

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newProp: Property = {
      id: newId,
      propertyId: newId,
      title: title || `${propertyType} for ${listingType} in ${location}`,
      location: location || 'Bengaluru',
      type: propertyType.includes('Plot') ? 'Plot' : 'Buy',
      listingType,
      propertyType,
      price: `₹${price} ${priceUnit}`,
      priceNum: priceUnit === 'Cr' ? parseFloat(price) * 100 : parseFloat(price) || 50,
      ratePerSqFt,
      dimensions,
      approachRoad,
      roadFacing,
      zoning,
      companyName,
      sellerCode,
      phone,
      image: uploadedImage || '/images/bda-plot-bsk6.jpeg',
      status: 'Available'
    };

    const updated = [newProp, ...properties];
    setProperties(updated);
    localStorage.setItem('realestate_properties', JSON.stringify(updated));

    setTitle('');
    setLocation('');
    setUploadedImage('');
    setIsSubmitting(false);
    setActiveTab('listings');
  };

  if (!isClient) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
        <h2>Loading Real Estate Workspace...</h2>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Real Estate Seller Dashboard | BuildMitra</title>
      </Head>

      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          
          {/* Header Banner */}
          <header style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '24px 30px', borderRadius: '18px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                  Live Seller Portal
                </span>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700 }}>
                  Seller Code: {sellerCode}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '8px 0 4px 0' }}>
                Welcome back, {companyName}
              </h1>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                Manage verified inventory, local drive photos, and live portal synchronization.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('listings')}
                style={{ padding: '10px 18px', backgroundColor: activeTab === 'listings' ? '#2563eb' : '#334155', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
              >
                📋 My Listings ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('post')}
                style={{ padding: '10px 18px', backgroundColor: activeTab === 'post' ? '#10b981' : '#334155', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
              >
                + Post New Property
              </button>
              <a
                href="/realestate-hub"
                target="_blank"
                rel="noreferrer"
                style={{ padding: '10px 18px', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                🌐 View Public Hub Live →
              </a>
            </div>
          </header>

          {/* TAB 1: LISTINGS VIEW */}
          {activeTab === 'listings' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {properties.map((prop) => (
                <div key={prop.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ height: '200px', backgroundColor: '#0f172a', position: 'relative' }}>
                    <img
                      src={prop.image}
                      alt={prop.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(15,23,42,0.85)', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px' }}>
                      {prop.propertyType} • {prop.listingType}
                    </span>
                    <span style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: '#10b981', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px' }}>
                      ✓ {prop.status}
                    </span>
                  </div>

                  <div style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>{prop.propertyId}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>{prop.companyName}</span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '6px 0 4px 0', color: '#0f172a' }}>{prop.title}</h3>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>📍 {prop.location}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{prop.price}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>₹{prop.ratePerSqFt} / sq.ft</div>
                      </div>
                      <a
                        href="/realestate-hub"
                        style={{ padding: '8px 14px', backgroundColor: '#eef2ff', color: '#4f46e5', fontWeight: 800, fontSize: '12px', borderRadius: '8px', textDecoration: 'none' }}
                      >
                        View in Hub →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: POST PROPERTY FORM (WITH HORIZONTAL MEDIA UPLOADS) */}
          {activeTab === 'post' && (
            <form onSubmit={handleCreateProperty} style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px -2px rgba(0,0,0,0.05)' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>Post New Verified Real Estate Listing</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>All submitted details automatically sync with the live Real Estate Hub & Feasibility Engine.</p>
              </div>

              {/* Grid 1: Basic Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Property Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BDA Residential Villa Plot (BSK 6th Stage)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Exact Location / Landmark</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near Arya Apartment, JP Nagar 8th Phase"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Road Facing & Orientation</label>
                  <select
                    value={roadFacing}
                    onChange={(e) => setRoadFacing(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#ffffff' }}
                  >
                    <option value="East Facing Main Road">East Facing Main Road</option>
                    <option value="North Facing Main Road">North Facing Main Road</option>
                    <option value="North-East Corner Plot">North-East Corner Plot</option>
                    <option value="West Facing 40ft Road">West Facing 40ft Road</option>
                    <option value="South Facing 60ft Road">South Facing 60ft Road</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#ffffff' }}
                  >
                    <option value="BDA Plot">BDA Plot</option>
                    <option value="BMRDA Villa Plot">BMRDA Villa Plot</option>
                    <option value="Residential Home">Residential Home / Villa</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Commercial Land">Commercial Land</option>
                  </select>
                </div>
              </div>

              {/* Grid 2: Pricing & Measurements */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Asking Price</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                    <select
                      value={priceUnit}
                      onChange={(e) => setPriceUnit(e.target.value)}
                      style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
                    >
                      <option value="Cr">Cr</option>
                      <option value="Lakhs">Lakhs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Rate / Sq.ft (₹)</label>
                  <input
                    type="text"
                    value={ratePerSqFt}
                    onChange={(e) => setRatePerSqFt(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Plot Dimensions / Area</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Approach Road Width</label>
                  <input
                    type="text"
                    value={approachRoad}
                    onChange={(e) => setApproachRoad(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* HORIZONTAL MEDIA UPLOADS SECTION */}
              <div style={{ backgroundColor: '#ffffff', padding: '22px', borderRadius: '16px', border: '1.5px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>📁</span>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Property Media Uploads (Permanent Storage)</h3>
                  </div>
                  <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                    Local Drive Storage Active
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center' }}>
                  
                  {/* Left Column: Local File Input */}
                  <div style={{ padding: '18px', borderRadius: '12px', border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                      📷 Property Photos (Max 3: JPG, PNG, WEBP)
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>
                      Select ground site scans directly from your local computer drive.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      style={{ fontSize: '12px', cursor: 'pointer', color: '#334155' }}
                    />
                    {uploadedImage && (
                      <div style={{ marginTop: '10px', fontSize: '11px', color: '#059669', fontWeight: 800 }}>
                        ✓ File loaded ready for live sync
                      </div>
                    )}
                  </div>

                  {/* Right Column: Feasibility Verification Tag */}
                  <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>🛰️</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>Digital Drone Survey & 360° Panorama Tag</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#15803d', margin: 0, lineHeight: '1.5' }}>
                      Uploaded files are mapped to BuildMitra’s 4K Drone survey pipeline and interactive 360° ground navigation for buyer inspection.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span style={{ backgroundColor: '#ffffff', color: '#166534', border: '1px solid #bbf7d0', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        ✓ GPS Tagged
                      </span>
                      <span style={{ backgroundColor: '#ffffff', color: '#166534', border: '1px solid #bbf7d0', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        ✓ 100% High-Res
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('listings')}
                  style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 800, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '12px 28px', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 900, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Property to Live Hub →'}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>
    </>
  );
};

export default RealEstateDashboard;
