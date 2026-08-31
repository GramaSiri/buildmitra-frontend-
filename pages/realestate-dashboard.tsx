import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import InteractivePinpointMap from '../components/InteractivePinpointMap';
import { autoResolvePropertyGeoData } from '../utils/geoResolver';
import { 
  fetchAllProperties, 
  savePropertyToCloud, 
  updatePropertyStatusInCloud, 
  fetchAllEnquiries, 
  logNewEnquiryToCloud,
  DBProperty, 
  DBEnquiry 
} from '../services/propertyService';

interface ClosedDealItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  finalPriceCr: number;
  commissionEarnedLakhs: number;
  closedDate: string;
  sroOffice: string;
}

export const RealEstateDashboard: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [properties, setProperties] = useState<DBProperty[]>([]);
  const [enquiries, setEnquiries] = useState<DBEnquiry[]>([]);
  const [closedDeals, setClosedDeals] = useState<ClosedDealItem[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'post' | 'pipeline' | 'enquiries' | 'deals'>('listings');

  // New Property Form States
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Near Arya Apartment, JP Nagar 8th Phase, Bengaluru');
  const [lat, setLat] = useState<number>(12.8718);
  const [lng, setLng] = useState<number>(77.5753);
  const [listingType, setListingType] = useState('Sale');
  const [propertyType, setPropertyType] = useState('BDA Plot');
  const [price, setPrice] = useState('1.50');
  const [priceUnit, setPriceUnit] = useState('Cr');
  const [ratePerSqFt, setRatePerSqFt] = useState('12500');
  const [dimensions, setDimensions] = useState('30′ × 40′ (1,200 Sq.ft)');
  const [approachRoad, setApproachRoad] = useState('40 Ft Asphalt');
  const [roadFacing, setRoadFacing] = useState('East Facing Main Road');
  const [zoning, setZoning] = useState('BDA Approved Residential Yellow Zone');

  const [autoSro, setAutoSro] = useState('SRO JP Nagar / Jayanagar (Mini Forest Road)');
  const [autoGuidance, setAutoGuidance] = useState<number>(6800);

  const [companyName, setCompanyName] = useState('Garden Greens');
  const [sellerCode, setSellerCode] = useState('REA-000003');
  const [phone, setPhone] = useState('9845012345');
  const [uploadedImage, setUploadedImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Enquiry Modal State
  const [showAddEnquiry, setShowAddEnquiry] = useState(false);
  const [newEnqName, setNewEnqName] = useState('');
  const [newEnqPhone, setNewEnqPhone] = useState('');
  const [newEnqPropId, setNewEnqPropId] = useState('REP-197127');
  const [newEnqBudget, setNewEnqBudget] = useState('₹1.50 Cr');

  const handleLocationSelect = (newLat: number, newLng: number, newAddress: string) => {
    setLat(newLat);
    setLng(newLng);
    setLocation(newAddress);
    const geo = autoResolvePropertyGeoData(newAddress, title, newLat, newLng);
    setAutoSro(geo.defaultSro);
    setAutoGuidance(geo.guidanceValue);
  };

  const loadData = async () => {
    const props = await fetchAllProperties();
    setProperties(props);

    const enqs = await fetchAllEnquiries();
    setEnquiries(enqs);

    const storedDeals = localStorage.getItem('bm_realestate_deals');
    if (storedDeals) {
      try { setClosedDeals(JSON.parse(storedDeals)); } catch (e) {}
    } else {
      const initDeals: ClosedDealItem[] = [
        { id: 'DEAL-101', propertyId: 'REP-MEDIA-064401', propertyTitle: 'LBS Nagar Residential Villa Plot', buyerName: 'Anand Kumar', finalPriceCr: 1.57, commissionEarnedLakhs: 3.14, closedDate: '2026-08-15', sroOffice: 'SRO JP Nagar / Jayanagar' }
      ];
      setClosedDeals(initDeals);
      localStorage.setItem('bm_realestate_deals', JSON.stringify(initDeals));
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadData();
  }, []);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newProp: DBProperty = {
      id: newId,
      propertyId: newId,
      title: title || `${propertyType} in ${location}`,
      location,
      lat,
      lng,
      type: propertyType.includes('Plot') || propertyType.includes('Land') || propertyType.includes('Site') ? 'Plot' : 'Buy',
      listingType,
      propertyType,
      price: `₹${price} ${priceUnit}`,
      priceNum: priceUnit === 'Cr' ? parseFloat(price) * 100 : parseFloat(price) || 50,
      rate: `₹${ratePerSqFt} / Sq.ft`,
      ratePerSqFt,
      bhk: propertyType.includes('Plot') ? 'Plot' : propertyType.includes('Land') ? 'Land' : '3 BHK',
      dimensions,
      approach: approachRoad,
      approachRoad,
      roadFacing,
      sroOffice: autoSro,
      guidanceValue: autoGuidance,
      zoning,
      companyName,
      sellerCode,
      phone,
      image: uploadedImage || '/images/bda-plot-bsk6.jpeg',
      tag: '✓ Live Verified Listing',
      status: 'Available',
      seller: { companyName, sellerCode, phone }
    };

    await savePropertyToCloud(newProp);
    await loadData();

    setTitle('');
    setUploadedImage('');
    setIsSubmitting(false);
    setActiveTab('listings');
  };

  const handleStatusChange = async (propId: string, newStatus: 'Available' | 'Under Pipeline' | 'Sold / Closed') => {
    await updatePropertyStatusInCloud(propId, newStatus);
    await loadData();
  };

  const handleCloseDeal = async (prop: DBProperty) => {
    const buyer = prompt(`Enter Buyer Name for ${prop.title}:`, 'Mr. C. Reddy');
    if (!buyer) return;

    const priceCr = prop.priceNum > 10 ? prop.priceNum / 100 : prop.priceNum || 1.50;
    const commissionLakhs = parseFloat((priceCr * 100 * 0.02).toFixed(2));

    const newDeal: ClosedDealItem = {
      id: `DEAL-${Math.floor(100 + Math.random() * 900)}`,
      propertyId: prop.id,
      propertyTitle: prop.title,
      buyerName: buyer,
      finalPriceCr: priceCr,
      commissionEarnedLakhs: commissionLakhs,
      closedDate: new Date().toISOString().split('T')[0],
      sroOffice: prop.sroOffice || 'SRO JP Nagar'
    };

    const updatedDeals = [newDeal, ...closedDeals];
    setClosedDeals(updatedDeals);
    localStorage.setItem('bm_realestate_deals', JSON.stringify(updatedDeals));

    await handleStatusChange(prop.id, 'Sold / Closed');
    alert(`🎉 Deal Closed Successfully!\nEarned Commission: ₹${commissionLakhs} Lakhs (2%) on ₹${priceCr} Cr transaction.`);
    setActiveTab('deals');
  };

  const handleAddEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEnq: DBEnquiry = {
      id: `ENQ-${Math.floor(100 + Math.random() * 900)}`,
      propertyId: newEnqPropId,
      callerName: newEnqName,
      phone: newEnqPhone,
      date: new Date().toISOString().split('T')[0],
      budget: newEnqBudget,
      status: 'New Enquiry'
    };

    await logNewEnquiryToCloud(newEnq);
    await loadData();

    setShowAddEnquiry(false);
    setNewEnqName('');
    setNewEnqPhone('');
  };

  if (!isClient) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>;

  const totalEarnedCommission = closedDeals.reduce((sum, d) => sum + d.commissionEarnedLakhs, 0).toFixed(2);
  const totalClosedVolume = closedDeals.reduce((sum, d) => sum + d.finalPriceCr, 0).toFixed(2);
  const pipelineProperties = properties.filter((p) => p.status === 'Under Pipeline');

  return (
    <>
      <Head>
        <title>Broker & Seller CRM | BuildMitra</title>
      </Head>

      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto' }}>
          
          <header style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '24px 30px', borderRadius: '18px', marginBottom: '24px', boxShadow: '0 8px 20px rgba(15,23,42,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                    🏢 {companyName} ({sellerCode})
                  </span>
                  <span style={{ backgroundColor: '#0369a1', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                    ✓ Active Workspace
                  </span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '8px 0 4px 0' }}>
                  Real Estate Inventory, CRM & Deal Pipeline Portal
                </h1>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Manage Agricultural Lands, Revenue Sites, Gramatana Sites, track buyer calls, and log earned brokerage.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '10px 16px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Under Pipeline</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>{pipelineProperties.length} Properties</div>
                </div>

                <div style={{ backgroundColor: '#1e293b', padding: '10px 16px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Closed Volume</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>₹{totalClosedVolume} Cr</div>
                </div>

                <div style={{ backgroundColor: '#064e3b', padding: '10px 16px', borderRadius: '12px', border: '1px solid #059669', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#6ee7b7', fontWeight: 800, textTransform: 'uppercase' }}>Earned Commission</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>₹{totalEarnedCommission} Lakhs</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('listings')}
                style={{ padding: '10px 18px', backgroundColor: activeTab === 'listings' ? '#2563eb' : '#1e293b', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
              >
                📋 All Properties ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('pipeline')}
                style={{ padding: '10px 18px', backgroundColor: activeTab === 'pipeline' ? '#d97706' : '#1e293b', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
              >
                ⏳ Under Pipeline ({pipelineProperties.length})
              </button>
              <button
                onClick={() => setActiveTab('enquiries')}
                style={{ padding: '10px 18px', backgroundColor: activeTab === 'enquiries' ? '#7c3aed' : '#1e293b', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
              >
                📞 Caller Enquiries ({enquiries.length})
              </button>
              <button
                onClick={() => setActiveTab('deals')}
                style={{ padding: '10px 18px', backgroundColor: activeTab === 'deals' ? '#059669' : '#1e293b', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
              >
                🤝 Closed Deals ({closedDeals.length})
              </button>
              <button
                onClick={() => setActiveTab('post')}
                style={{ padding: '10px 18px', backgroundColor: activeTab === 'post' ? '#10b981' : '#1e293b', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
              >
                + Post Property
              </button>
              <a
                href="/realestate-hub"
                target="_blank"
                rel="noreferrer"
                style={{ padding: '10px 18px', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '10px', textDecoration: 'none', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                🌐 View Public Hub →
              </a>
            </div>
          </header>

          {/* TAB 1: ALL PROPERTIES */}
          {activeTab === 'listings' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {properties.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', gridColumn: '1 / -1', color: '#64748b' }}>
                  No properties posted yet. Click <strong>+ Post Property</strong> to create one.
                </div>
              ) : (
                properties.map((prop) => (
                  <div key={prop.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ height: '200px', backgroundColor: '#0f172a', position: 'relative' }}>
                      <img src={prop.image} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.src = '/images/bda-plot-bsk6.jpeg'; }} />
                      <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(15,23,42,0.85)', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px' }}>
                        {prop.propertyType} • {prop.listingType}
                      </span>
                      <span style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: prop.status === 'Sold / Closed' ? '#dc2626' : prop.status === 'Under Pipeline' ? '#d97706' : '#10b981', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px' }}>
                        ● {prop.status}
                      </span>
                    </div>

                    <div style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>{prop.propertyId || prop.id}</span>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>🏛️ {prop.sroOffice}</span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '6px 0 4px 0', color: '#0f172a' }}>{prop.title}</h3>
                      <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {prop.location}</div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{prop.price}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{prop.rate || `₹${prop.ratePerSqFt} / sq.ft`}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {prop.status === 'Available' && (
                            <button
                              onClick={() => handleStatusChange(prop.id, 'Under Pipeline')}
                              style={{ padding: '6px 10px', backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontWeight: 800, fontSize: '11px', borderRadius: '8px', cursor: 'pointer' }}
                            >
                              ⏳ To Pipeline
                            </button>
                          )}
                          {prop.status !== 'Sold / Closed' && (
                            <button
                              onClick={() => handleCloseDeal(prop)}
                              style={{ padding: '6px 12px', backgroundColor: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '11px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                            >
                              🤝 Close Deal
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: UNDER PIPELINE */}
          {activeTab === 'pipeline' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#b45309' }}>⏳ Properties Under Pipeline & Negotiation</h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Properties with active buyer discussions or advance tokens.</p>
              </div>

              {pipelineProperties.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No properties currently in negotiation pipeline.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {pipelineProperties.map((p) => (
                    <div key={p.id} style={{ padding: '16px', borderRadius: '12px', border: '1.5px solid #fde68a', backgroundColor: '#fffbeb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309' }}>{p.propertyType}</span>
                        <span style={{ fontSize: '16px', fontWeight: 900, color: '#78350f' }}>{p.price}</span>
                      </div>
                      <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{p.title}</h4>
                      <div style={{ fontSize: '12px', color: '#475569' }}>📍 {p.location}</div>
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleCloseDeal(p)}
                          style={{ flex: 1, padding: '8px', backgroundColor: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '11px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                        >
                          ✓ Execute Deal Closure
                        </button>
                        <button
                          onClick={() => handleStatusChange(p.id, 'Available')}
                          style={{ padding: '8px 12px', backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', fontWeight: 800, fontSize: '11px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          Back to Active
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CALLER ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0f172a' }}>📞 Buyer Inquiry Management</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Track prospective buyers who called or clicked WhatsApp.</p>
                </div>
                <button
                  onClick={() => setShowAddEnquiry(true)}
                  style={{ padding: '10px 18px', backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: 800, fontSize: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                >
                  + Log New Inquiry
                </button>
              </div>

              {showAddEnquiry && (
                <form onSubmit={handleAddEnquiry} style={{ backgroundColor: '#f5f3ff', padding: '18px', borderRadius: '14px', border: '1px solid #ddd6fe', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#5b21b6', marginBottom: '10px' }}>Quick Log Caller Details:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <input type="text" required placeholder="Caller Full Name" value={newEnqName} onChange={(e) => setNewEnqName(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <input type="text" required placeholder="Phone Number (+91)" value={newEnqPhone} onChange={(e) => setNewEnqPhone(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <input type="text" placeholder="Budget (e.g. ₹1.50 Cr)" value={newEnqBudget} onChange={(e) => setNewEnqBudget(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: 800, fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Save Inquiry →</button>
                  </div>
                </form>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px' }}>Inquiry ID</th>
                    <th style={{ padding: '12px' }}>Caller Name</th>
                    <th style={{ padding: '12px' }}>Contact Phone</th>
                    <th style={{ padding: '12px' }}>Property ID</th>
                    <th style={{ padding: '12px' }}>Budget</th>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No caller inquiries logged yet.</td>
                    </tr>
                  ) : (
                    enquiries.map((enq) => (
                      <tr key={enq.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: 800, color: '#7c3aed' }}>{enq.id}</td>
                        <td style={{ padding: '12px', fontWeight: 800, color: '#0f172a' }}>{enq.callerName}</td>
                        <td style={{ padding: '12px', color: '#334155' }}>{enq.phone}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#2563eb' }}>{enq.propertyId}</td>
                        <td style={{ padding: '12px', fontWeight: 800, color: '#059669' }}>{enq.budget}</td>
                        <td style={{ padding: '12px', color: '#64748b' }}>{enq.date}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ backgroundColor: '#eef2ff', color: '#4338ca', fontWeight: 800, fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}>
                            {enq.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: CLOSED DEALS */}
          {activeTab === 'deals' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0f172a' }}>🤝 Closed Property Registrations & Commission Ledger</h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Permanent ledger of executed property registrations and earned brokerage commissions.</p>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #bbf7d0', color: '#166534' }}>
                    <th style={{ padding: '12px' }}>Deal ID</th>
                    <th style={{ padding: '12px' }}>Property Title</th>
                    <th style={{ padding: '12px' }}>Buyer Name</th>
                    <th style={{ padding: '12px' }}>Execution SRO</th>
                    <th style={{ padding: '12px' }}>Closed Price</th>
                    <th style={{ padding: '12px' }}>Earned Brokerage (2%)</th>
                    <th style={{ padding: '12px' }}>Closing Date</th>
                  </tr>
                </thead>
                <tbody>
                  {closedDeals.map((deal) => (
                    <tr key={deal.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#059669' }}>{deal.id}</td>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#0f172a' }}>{deal.propertyTitle}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{deal.buyerName}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{deal.sroOffice}</td>
                      <td style={{ padding: '12px', fontWeight: 900, color: '#0f172a' }}>₹{deal.finalPriceCr.toFixed(2)} Cr</td>
                      <td style={{ padding: '12px', fontWeight: 900, color: '#16a34a', backgroundColor: '#f0fdf4' }}>+ ₹{deal.commissionEarnedLakhs.toFixed(2)} Lakhs</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{deal.closedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: POST PROPERTY */}
          {activeTab === 'post' && (
            <form onSubmit={handleCreateProperty} style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>Post Verified Property & Land</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Supports Agriculture Lands, Industrial Lands, Revenue Sites, Gramatana Sites, and Layout Plots.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <InteractivePinpointMap
                  initialLat={lat}
                  initialLng={lng}
                  initialAddress={location}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '14px 18px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>✓ Dynamically Resolved Benchmarks</span>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#14532d', marginTop: '2px' }}>
                    🏛️ Registration SRO: <strong>{autoSro}</strong> • 💰 Guidance Value: <strong>₹{autoGuidance.toLocaleString('en-IN')}/Sft</strong>
                  </div>
                </div>
                <span style={{ backgroundColor: '#16a34a', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                  GPS Benchmark Locked
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Property Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Agriculture Land / Gramatana Site / BDA Plot"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Property & Land Category</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#ffffff', fontWeight: 700 }}
                  >
                    <option value="BDA Plot">🏡 BDA Approved Plot</option>
                    <option value="BMRDA Villa Plot">🏡 BMRDA / DTCP Approved Plot</option>
                    <option value="Agriculture Land">🌾 Agriculture Land / Farmland</option>
                    <option value="Industrial Land">🏭 Industrial Land / KIADB Plot</option>
                    <option value="Revenue Sites">📜 Revenue Sites (DC Converted)</option>
                    <option value="Gramatana Sites">🏘️ Gramatana Sites (E-Swathu / Panchayat)</option>
                    <option value="Residential Home">🏠 Residential Home / Villa</option>
                    <option value="Apartment">🏢 Apartment</option>
                    <option value="Commercial Land">🏬 Commercial Land / Building</option>
                  </select>
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
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Sanction & Zoning Authority</label>
                  <select
                    value={zoning}
                    onChange={(e) => setZoning(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#ffffff' }}
                  >
                    <option value="BDA Approved Residential Yellow Zone">BDA Approved Residential Yellow Zone</option>
                    <option value="BMRDA Approved Residential">BMRDA Approved Residential</option>
                    <option value="Green Belt / Agriculture Zone">Green Belt / Agriculture Zone</option>
                    <option value="KIADB Industrial Zone">KIADB Industrial Zone</option>
                    <option value="BBMP A-Khata Approved">BBMP A-Khata Approved</option>
                    <option value="E-Swathu Panchayat Gramatana Approved">E-Swathu Panchayat Gramatana Approved</option>
                    <option value="DC Converted Revenue Approved">DC Converted Revenue Approved</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '24px' }}>
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
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>Plot / Land Dimensions</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 30x40 / 1.5 Acres"
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
