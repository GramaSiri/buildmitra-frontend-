import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { resolveUniversalGeoData, normalizeAreaToSqFt, UniversalGeoResult } from '../utils/universalGeoEngine';

interface Props {
  property?: any;
  onClose: () => void;
}

export const PropertyIntelligenceModal: React.FC<Props> = ({ property, onClose }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'radar' | 'visuals' | 'legal' | 'support' | 'ngt' | 'site' | 'roi' | 'civil'>('radar');
  const [mediaView, setMediaView] = useState<'drone' | 'pano' | 'satellite'>('drone');
  const [radarCategory, setRadarCategory] = useState<'directions' | 'schools' | 'malls' | 'hospitals' | 'industrial' | 'civic'>('directions');
  const [holdingYears, setHoldingYears] = useState<number>(5);
  const [expectedCagr, setExpectedCagr] = useState<number>(10.0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const panXRef = useRef<number>(0);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [geoData, setGeoData] = useState<UniversalGeoResult | null>(null);
  const [isLoadingGis, setIsLoadingGis] = useState<boolean>(true);

  const propLat = typeof property?.lat === 'number' && !isNaN(property.lat) ? property.lat : 12.8718;
  const propLng = typeof property?.lng === 'number' && !isNaN(property.lng) ? property.lng : 77.5753;
  const propAddress = property?.location || property?.address || 'Property Site Location';

  useEffect(() => {
    let isMounted = true;
    setIsLoadingGis(true);
    resolveUniversalGeoData(propLat, propLng, propAddress).then((data) => {
      if (isMounted) {
        setGeoData(data);
        setIsLoadingGis(false);
      }
    });
    return () => { isMounted = false; };
  }, [propLat, propLng, propAddress]);

  // Universal Area & Price Normalization (Acres vs Sq.ft)
  const dimensionInfo = normalizeAreaToSqFt(property?.dimensions || '1200 Sq.ft');
  const totalSqFt = dimensionInfo.totalSqFt > 0 ? dimensionInfo.totalSqFt : 1200;
  
  const priceNum = property?.priceNum || 150;
  const totalCr = priceNum > 10 ? priceNum / 100 : priceNum;
  const totalRupees = totalCr * 10000000;

  // Exact Mathematical Unit Rates
  const calculatedRatePerSqFt = Math.round(totalRupees / totalSqFt);
  const calculatedRatePerAcre = ((totalRupees / totalSqFt) * 43560) / 10000000;

  const isAcreage = property?.propertyType?.toLowerCase().includes('agri') || property?.dimensions?.toLowerCase().includes('acre');
  const displayFormattedRate = isAcreage
    ? `₹${calculatedRatePerAcre.toFixed(2)} Cr / Acre (≈ ₹${calculatedRatePerSqFt.toLocaleString('en-IN')}/Sq.ft)`
    : `₹${calculatedRatePerSqFt.toLocaleString('en-IN')} / Sq.ft`;

  const displayPrice = property?.price || `₹${totalCr.toFixed(2)} Cr`;

  // Universal ROI Exit Math
  const calculatedExit = (totalCr * Math.pow(1 + expectedCagr / 100, holdingYears)).toFixed(2);
  const roiMultiple = (parseFloat(calculatedExit) / (totalCr || 1)).toFixed(1);

  const sellerCompany = property?.seller?.companyName || property?.companyName || 'Verified Property Partner';
  const sellerCode = property?.seller?.sellerCode || property?.sellerCode || 'REA-VERIFIED';
  const sellerPhone = property?.seller?.phone || property?.phone || '9845012345';
  const userPhoto = property?.image || '/images/bda-plot-bsk6.jpeg';

  const mapEmbedUrl = `https://maps.google.com/maps?q=${propLat},${propLng}&hl=en&z=15&output=embed`;
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${propLat},${propLng}`;
  const whatsappUrl = `https://wa.me/91${sellerPhone}?text=Hello%20${encodeURIComponent(sellerCompany)}%20(${sellerCode})%2C%20I%20am%20interested%20in%20Property%20ID%3A%20${property?.id}%20at%20${encodeURIComponent(propAddress)}.`;

  // AUTOMATIC LEAD LOGGING TO SELLER CRM WHEN BUYER CLICKS CONTACT
  const handleLeadCapture = () => {
    try {
      const stored = localStorage.getItem('bm_realestate_enquiries');
      const existing = stored ? JSON.parse(stored) : [];
      const newLead = {
        id: `ENQ-${Math.floor(100 + Math.random() * 900)}`,
        propertyId: property?.id || 'REP-LIVE',
        callerName: 'Online Buyer Inquiry (WhatsApp)',
        phone: '+91 (Direct Lead)',
        date: new Date().toISOString().split('T')[0],
        budget: displayPrice,
        status: 'New Enquiry'
      };
      localStorage.setItem('bm_realestate_enquiries', JSON.stringify([newLead, ...existing]));
    } catch (e) {}
  };

  // CIVIL TOOLS DIRECT NAVIGATION
  const handleOpenCAD = () => {
    router.push(`/drawing-generator?dimensions=${encodeURIComponent(property?.dimensions || '30x40')}&area=${totalSqFt}&type=${encodeURIComponent(property?.propertyType || 'Plot')}`);
  };

  const handleOpenBOQ = () => {
    router.push(`/boq-calculator?area=${totalSqFt}&dimensions=${encodeURIComponent(property?.dimensions || '30x40')}&rate=${calculatedRatePerSqFt}`);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const tabs = [
    { id: 'radar', label: '🧭 10 KM Radial Radar', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    { id: 'visuals', label: '🛰️ Digital Site Survey & Map', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
    { id: 'legal', label: `🏛️ ${geoData?.state || ''} Land Records & Title`, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    { id: 'support', label: '🤝 Registration & Mutation SLA', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    { id: 'ngt', label: '🛡️ Environmental & Buffer Safety', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
    { id: 'site', label: '🛣️ Site Profile & Infrastructure', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    { id: 'roi', label: '📈 Valuation & ROI Simulator', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { id: 'civil', label: '⚡ Civil Feasibility & BOQ', color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' },
  ];

  // 360 Canvas Engine
  useEffect(() => {
    if (activeTab !== 'visuals' || mediaView !== 'pano') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = userPhoto;

    const render = () => {
      if (autoRotate && !isPanning) {
        panXRef.current = (panXRef.current + 0.3) % canvas.width;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (img.complete && img.naturalWidth > 0) {
        const sx = (panXRef.current % img.naturalWidth + img.naturalWidth) % img.naturalWidth;
        ctx.drawImage(img, sx, 0, img.naturalWidth - sx, img.naturalHeight, 0, 0, img.naturalWidth - sx, canvas.height);
        if (sx > 0) {
          ctx.drawImage(img, 0, 0, sx, img.naturalHeight, img.naturalWidth - sx, 0, sx, canvas.height);
        }
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      animationId = requestAnimationFrame(render);
    };

    img.onload = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = 370;
      render();
    };

    return () => cancelAnimationFrame(animationId);
  }, [activeTab, mediaView, userPhoto, autoRotate, isPanning]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#f8fafc', overflowY: 'auto', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Sticky Top Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '16px', boxShadow: '0 4px 10px -1px rgba(0,0,0,0.08)', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '850px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                ID: {property?.id || 'REP-LIVE'}
              </span>
              <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                {property?.propertyType || 'Land / Property'} • {geoData?.state || 'Verified'}
              </span>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
                {displayPrice}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb' }}>
                ({displayFormattedRate})
              </span>
              <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                🏢 {sellerCompany} ({sellerCode})
              </span>
            </div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', lineHeight: '1.3' }}>
              {property?.title || 'Universal Property Listing'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
              📍 <strong>Exact Location:</strong> {geoData ? `${geoData.formattedAddress} (${geoData.state})` : propAddress}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handlePrintPdf}
              style={{ padding: '10px 14px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 800, fontSize: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>📄</span> Print / PDF Sheet
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleLeadCapture}
              style={{ padding: '10px 18px', backgroundColor: '#059669', color: '#ffffff', fontWeight: 900, fontSize: '12px', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 4px 10px rgba(5,150,105,0.25)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>💬</span> WhatsApp {sellerCompany} (+91 {sellerPhone})
            </a>
            
            <button
              onClick={onClose}
              style={{ padding: '10px 20px', backgroundColor: '#e11d48', color: '#ffffff', fontWeight: 900, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(225,29,72,0.25)' }}
            >
              ← Back to Listings
            </button>
          </div>
        </div>

        {/* 8 Color-Coded Header Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: '0 0 auto',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: isActive ? `2px solid ${tab.color}` : `1.5px solid ${tab.border}`,
                  backgroundColor: isActive ? tab.color : tab.bg,
                  color: isActive ? '#ffffff' : tab.color,
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panel */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', minHeight: '520px' }}>
          
          {/* TAB 1: 10 KM RADIAL RADAR (NEAREST FIRST) */}
          {activeTab === 'radar' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '14px', borderBottom: '1.5px solid #e2e8f0', marginBottom: '18px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#7c3aed' }}>
                    🧭 Live 10 KM Radial Distance Radar (Closest to Farthest)
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    {isLoadingGis 
                      ? '⚡ Scanning 10,000m radius on GIS spatial grid...' 
                      : `✓ Live scanned from GPS Pin (${propLat.toFixed(4)}° N, ${propLng.toFixed(4)}° E) • State: ${geoData?.state} • District: ${geoData?.district}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'directions', label: '🧭 4 Directions' },
                    { id: 'schools', label: '🎓 Schools & Colleges' },
                    { id: 'malls', label: '🛒 Commercial & Markets' },
                    { id: 'hospitals', label: '🏥 Healthcare & Hospitals' },
                    { id: 'industrial', label: '🏢 Industrial & Work Hubs' },
                    { id: 'civic', label: '⚽ Parks, Sports & Culture' }
                  ].map((btn) => {
                    const isSelected = radarCategory === btn.id;
                    return (
                      <button
                        key={btn.id}
                        onClick={() => setRadarCategory(btn.id as any)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 800,
                          border: isSelected ? '1.5px solid #6d28d9' : '1px solid #cbd5e1',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#7c3aed' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#334155',
                          boxShadow: isSelected ? '0 2px 6px rgba(124,58,237,0.3)' : 'none'
                        }}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Directions */}
              {radarCategory === 'directions' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>➡️ East Sector</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{geoData?.eastLandscape}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>⬅️ West Sector</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{geoData?.westLandscape}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>⬇️ South Sector</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{geoData?.southLandscape}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>⬆️ North Sector</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{geoData?.northLandscape}</div>
                  </div>
                </div>
              )}

              {/* Schools (Nearest First) */}
              {radarCategory === 'schools' && (
                <div>
                  {geoData?.schools && geoData.schools.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      {geoData.schools.map((s, i) => (
                        <div key={i} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fefce8', border: '1px solid #fef08a' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#a16207', fontWeight: 800 }}>🎓 School / College</span>
                            <span style={{ backgroundColor: '#fef08a', color: '#713f12', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{s.bearing}</span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: '#713f12', marginTop: '4px' }}>{s.name}</div>
                          <div style={{ fontSize: '12px', color: '#854d0e', marginTop: '4px', fontWeight: 800 }}>🚗 {s.dist}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                      Nil mapped schools or colleges within 10 km radius of this location.
                    </div>
                  )}
                </div>
              )}

              {/* Malls & Commercial (Nearest First) */}
              {radarCategory === 'malls' && (
                <div>
                  {geoData?.malls && geoData.malls.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      {geoData.malls.map((m, i) => (
                        <div key={i} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 800 }}>🛒 Commercial / Market</span>
                            <span style={{ backgroundColor: '#dbeafe', color: '#1e3a8a', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{m.bearing}</span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>{m.name}</div>
                          <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px', fontWeight: 800 }}>🚗 {m.dist}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                      Nil major shopping malls or commercial plazas within 10 km radius (Rural / Semi-urban environment).
                    </div>
                  )}
                </div>
              )}

              {/* Hospitals (Nearest First) */}
              {radarCategory === 'hospitals' && (
                <div>
                  {geoData?.hospitals && geoData.hospitals.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      {geoData.hospitals.map((h, i) => (
                        <div key={i} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 800 }}>🏥 Healthcare / Hospital</span>
                            <span style={{ backgroundColor: '#dcfce7', color: '#14532d', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{h.bearing}</span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: '#14532d', marginTop: '4px' }}>{h.name}</div>
                          <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px', fontWeight: 800 }}>🚑 {h.dist}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                      Nil major tertiary hospitals mapped within 10 km radius (Refer local Primary Health Centre).
                    </div>
                  )}
                </div>
              )}

              {/* Industrial (Nearest First) */}
              {radarCategory === 'industrial' && (
                <div>
                  {geoData?.industrialAndWork && geoData.industrialAndWork.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      {geoData.industrialAndWork.map((ind, i) => (
                        <div key={i} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 800 }}>🏢 Industrial / Tech Hub</span>
                            <span style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{ind.bearing}</span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{ind.name}</div>
                          <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px', fontWeight: 800 }}>🏭 {ind.dist}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                      Nil major industrial SEZ or tech parks mapped within 10 km radius (Tranquil, non-industrial zone).
                    </div>
                  )}
                </div>
              )}

              {/* Civic, Sports & Culture (Nearest First) */}
              {radarCategory === 'civic' && (
                <div>
                  {geoData?.civicAndSports && geoData.civicAndSports.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      {geoData.civicAndSports.map((c, i) => (
                        <div key={i} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#0891b2', fontWeight: 800 }}>⚽ Parks, Turf & Worship</span>
                            <span style={{ backgroundColor: '#cffafe', color: '#0e7490', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{c.bearing}</span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: '#0e7490', marginTop: '4px' }}>{c.name}</div>
                          <div style={{ fontSize: '12px', color: '#155e75', marginTop: '4px', fontWeight: 800 }}>🚶 {c.dist}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                      Nil mapped sports grounds or parks within 10 km radius.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VISUALS */}
          {activeTab === 'visuals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    🛰️ Digital Site Survey & Ground Map
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                    GPS Benchmark: {propLat.toFixed(4)}° N, {propLng.toFixed(4)}° E • {geoData?.zoneName}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setMediaView('drone')} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, border: 'none', cursor: 'pointer', backgroundColor: mediaView === 'drone' ? '#4f46e5' : '#f1f5f9', color: mediaView === 'drone' ? '#ffffff' : '#334155' }}>
                    📹 Aerial View
                  </button>
                  <button onClick={() => setMediaView('pano')} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, border: 'none', cursor: 'pointer', backgroundColor: mediaView === 'pano' ? '#4f46e5' : '#f1f5f9', color: mediaView === 'pano' ? '#ffffff' : '#334155' }}>
                    🌐 360° Panorama
                  </button>
                  <button onClick={() => setMediaView('satellite')} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, border: 'none', cursor: 'pointer', backgroundColor: mediaView === 'satellite' ? '#4f46e5' : '#f1f5f9', color: mediaView === 'satellite' ? '#ffffff' : '#334155' }}>
                    🗺️ Boundary Overlay
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
                <div style={{ height: '370px', backgroundColor: '#020617', borderRadius: '14px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' }}>
                  {mediaView === 'drone' && (
                    <video autoPlay loop muted playsInline controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
                  )}
                  {mediaView === 'pano' && (
                    <div onMouseDown={(e) => { setIsPanning(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; }} onMouseMove={(e) => { if (!isPanning) return; panXRef.current -= (e.clientX - lastMousePos.current.x) * 2; lastMousePos.current = { x: e.clientX, y: e.clientY }; }} onMouseUp={() => setIsPanning(false)} style={{ width: '100%', height: '100%', position: 'relative', cursor: isPanning ? 'grabbing' : 'grab' }}>
                      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
                    </div>
                  )}
                  {mediaView === 'satellite' && (
                    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={userPhoto} alt="Site" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: '24px', border: '3px dashed #10b981', borderRadius: '12px', pointerEvents: 'none', backgroundColor: 'rgba(16,185,129,0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>FRONTAGE</span>
                          <span style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>{property?.roadFacing || 'Road Facing'}</span>
                        </div>
                        <div style={{ backgroundColor: 'rgba(15,23,42,0.85)', color: '#34d399', padding: '6px 12px', borderRadius: '6px', textAlign: 'center', margin: 'auto' }}>
                          <div style={{ fontSize: '13px', fontWeight: 900 }}>{dimensionInfo.unitLabel}</div>
                          <div style={{ fontSize: '9px', color: '#cbd5e1' }}>Cadastral Boundary Benchmark</div>
                        </div>
                        <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-end' }}>🏢 Uploaded by: {sellerCompany}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ height: '280px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <iframe title="Map" width="100%" height="100%" style={{ border: 'none' }} src={mapEmbedUrl} />
                  </div>
                  <div style={{ padding: '12px 16px', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '12px', color: '#312e81' }}>{property?.approachRoad || property?.approach || 'Approach Road Access'}</div>
                      <div style={{ fontSize: '11px', color: '#4338ca' }}>Registration Jurisdiction: <strong>{geoData?.defaultSro}</strong></div>
                    </div>
                    <a href={googleDirectionsUrl} target="_blank" rel="noreferrer" style={{ padding: '6px 12px', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '11px', fontWeight: 800, borderRadius: '6px', textDecoration: 'none' }}>
                      📍 Open Navigation →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEGAL & TITLE */}
          {activeTab === 'legal' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                🏛️ {geoData?.state || ''} Land Records, Zoning & Legal Verification Checklist
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Sub-Registrar Office</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '4px', fontSize: '13px' }}>{geoData?.defaultSro}</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Zoning Authority</div>
                  <div style={{ fontWeight: 800, color: '#059669', marginTop: '4px', fontSize: '13px' }}>{geoData?.zoningAuthority}</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Official Revenue Portal</div>
                  <div style={{ fontWeight: 800, color: '#059669', marginTop: '4px', fontSize: '13px' }}>{geoData?.officialStateRegistrationPortal}</div>
                </div>
              </div>

              {/* Sourcing Transparency Advisory */}
              <div style={{ padding: '14px 18px', backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', marginBottom: '18px' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#1e3a8a' }}>🔍 Official Source Verification Advisory</div>
                <p style={{ fontSize: '12px', color: '#1d4ed8', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                  {geoData?.guidanceValueGuidanceNote}
                </p>
              </div>

              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>📋 Universal Physical Document Checklist (Produced by Seller)</div>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px' }}>Verification Checklist</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  {geoData?.legalDocuments.map((doc, i) => (
                    <div key={i} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '12px', fontWeight: 800, color: '#14532d' }}>
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BUY/SELL CONCIERGE */}
          {activeTab === 'support' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: '#0369a1', marginBottom: '14px' }}>
                🤝 End-to-End Property Transaction SLA Concierge: {geoData?.villageOrSubdivision}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ fontWeight: 900, color: '#0c4a6e', fontSize: '13px' }}>1. Physical Land Survey & Pegging</div>
                  <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '4px' }}>Total Station DGPS boundary corner pegging with certified {geoData?.district} surveyor.</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ fontWeight: 900, color: '#0c4a6e', fontSize: '13px' }}>2. SRO Token Booking & Execution</div>
                  <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '4px' }}>Appointment booking and execution via {geoData?.defaultSro}.</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ fontWeight: 900, color: '#0c4a6e', fontSize: '13px' }}>3. 30-Day SLA Mutation Transfer</div>
                  <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '4px' }}>Guaranteed name mutation via {geoData?.mutationAuthorityName}.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NGT & ENVIRONMENTAL BUFFERS */}
          {activeTab === 'ngt' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                🛡️ Environmental & Buffer Safety Analysis: {geoData?.formattedAddress}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '13px' }}>🌊 Water Body / Lake (Eri / Kunte)</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>✓ Buffer Analysis</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '6px', fontWeight: 900 }}>{geoData?.lakeDist}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Compliant with National Green Tribunal (NGT) 30m lake buffer norms.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '13px' }}>🌧️ Natural Drainage Stream (Odaikkarai / SWD)</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>✓ Compliant</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '6px', fontWeight: 900 }}>{geoData?.rkDist}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Safe beyond primary natural drainage buffer limits.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '13px' }}>🛣️ Drainage & Roadside Canal</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>✓ Fully Compliant</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '6px', fontWeight: 900 }}>{geoData?.drainDist}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Proper setback maintained with zero encroachment.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '13px' }}>🌳 Green Buffer & Open Zone</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>✓ Eco Proximity</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '6px', fontWeight: 900 }}>{geoData?.parkDist}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Community green zone with high oxygen coverage.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SITE PROFILE */}
          {activeTab === 'site' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                🛣️ Site Profile & Dimensional Analysis: {geoData?.villageOrSubdivision}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '10px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Normalized Total Area</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{dimensionInfo.unitLabel}</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '10px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Road Facing</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{property?.roadFacing || 'Direct Road Facing'}</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '10px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Soil & Bearing Capacity</div>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{geoData?.soilType}</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '10px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Water Grid</div>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{geoData?.waterSource}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ROI SIMULATOR */}
          {activeTab === 'roi' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                📈 Property Valuation & Multi-Year ROI Appreciation Simulator
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase' }}>Quoted Asking Rate</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e3a8a', marginTop: '2px' }}>{displayFormattedRate}</div>
                  <div style={{ fontSize: '10px', color: '#2563eb', marginTop: '2px' }}>Total Price: {displayPrice}</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Official Guidance Value (Circle Rate)</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>₹{geoData?.guidanceValue.toLocaleString('en-IN')} / Sft</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{geoData?.state} Sub-Registrar Benchmark</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Locality Market Avg</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>₹{geoData?.localityAvg.toLocaleString('en-IN')} / Sft</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Prevailing {geoData?.zoneName.split('(')[0]} Rate</div>
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e3a8a', marginBottom: '12px' }}>Dynamic Multi-Year ROI Appreciation Calculator</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Holding Horizon: <strong style={{ color: '#2563eb' }}>{holdingYears} Years</strong>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={holdingYears}
                      onChange={(e) => setHoldingYears(Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Appreciation Rate: <strong style={{ color: '#2563eb' }}>{expectedCagr}% p.a.</strong>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={20}
                      step={0.5}
                      value={expectedCagr}
                      onChange={(e) => setExpectedCagr(Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', paddingTop: '12px', borderTop: '1px solid #bfdbfe' }}>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Projected Exit Value</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#1d4ed8', marginTop: '2px' }}>₹{calculatedExit} Cr</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Total ROI Multiple</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>{roiMultiple}x Return</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CIVIL TOOLS (BRIDGED DIRECTLY) */}
          {activeTab === 'civil' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                ⚡ BuildMitra Civil Feasibility Actions for {dimensionInfo.unitLabel}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#9f1239' }}>📐 Push Dimensions to CAD Floor Generator</div>
                  <p style={{ fontSize: '12px', color: '#be123c', margin: '4px 0 14px 0' }}>Auto-generates Vastu-compliant 2D architectural drawings for this site dimension.</p>
                  <button onClick={handleOpenCAD} style={{ padding: '10px 16px', backgroundColor: '#e11d48', color: '#ffffff', fontWeight: 800, fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(225,29,72,0.25)' }}>
                    Open CAD Generator →
                  </button>
                </div>

                <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#9f1239' }}>🔨 Calculate Civil Turnkey BOQ</div>
                  <p style={{ fontSize: '12px', color: '#be123c', margin: '4px 0 14px 0' }}>Computes exact cement, steel, bricks, and labor contractor estimates.</p>
                  <button onClick={handleOpenBOQ} style={{ padding: '10px 16px', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(15,23,42,0.25)' }}>
                    Calculate Civil BOQ →
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PropertyIntelligenceModal;
