import React, { useState } from 'react';

interface Props {
  property?: any;
  onClose: () => void;
}

export const PropertyIntelligenceModal: React.FC<Props> = ({ property, onClose }) => {
  const [activeTab, setActiveTab] = useState<'visuals' | 'legal' | 'ngt' | 'site' | 'radar' | 'roi' | 'civil'>('visuals');
  const [mediaView, setMediaView] = useState<'drone' | 'pano' | 'satellite'>('drone');
  const [radarDistance, setRadarDistance] = useState<'1km' | '3km' | '5km' | '10km'>('3km');
  const [holdingYears, setHoldingYears] = useState<number>(5);
  const [expectedCagr, setExpectedCagr] = useState<number>(11.5);

  const basePrice = property?.priceNum || 1.57;
  const calculatedExit = (basePrice * Math.pow(1 + expectedCagr / 100, holdingYears)).toFixed(2);
  const roiMultiple = (parseFloat(calculatedExit) / basePrice).toFixed(1);

  const tabs = [
    { id: 'visuals', label: '🛰️ Digital Site Visit & Map', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
    { id: 'legal', label: '🏛️ Zoning & Legal Checklist', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    { id: 'ngt', label: '🛡️ NGT & Environmental Safety', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
    { id: 'site', label: '🛣️ Site Profile & Infrastructure', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    { id: 'radar', label: '🧭 Radial Distance Radar', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    { id: 'roi', label: '📈 Micro-Market & ROI Simulator', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { id: 'civil', label: '⚡ BuildMitra Civil Tools', color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#f8fafc', overflowY: 'auto', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Top Header Row with Right-Aligned Bold Red Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', backgroundColor: '#ffffff', padding: '18px 24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                ID: {property?.id || 'REP-MEDIA-064401'}
              </span>
              <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                {property?.type || 'Plot • Sale'}
              </span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>
                {property?.price || '₹1.57 Cr'}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
                ({property?.rate || '₹13,100 / Sq.ft'})
              </span>
              <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                +172.9% vs Locality Avg
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              {property?.title || 'LBS Nagar, Anjanapura'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
              📍 12.8580° N, 77.5620° E (Anjanapura 80ft Main Road Corridor) • 60 Ft Asphalt Approach Road
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/919999999999?text=Hello%2C%20I%20am%20interested%20in%20Property%20ID%3A%20REP-MEDIA-064401."
              target="_blank"
              rel="noreferrer"
              style={{ padding: '10px 18px', backgroundColor: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              📲 Connect with Seller
            </a>
            
            <button
              onClick={onClose}
              style={{ padding: '12px 24px', backgroundColor: '#e11d48', color: '#ffffff', fontWeight: 900, fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(225,29,72,0.3)', transition: 'all 0.2s' }}
            >
              ← Back to Real Estate Hub
            </button>
          </div>
        </div>

        {/* 7 Color-Coded Header Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: isActive ? `2px solid ${tab.color}` : `1.5px solid ${tab.border}`,
                  backgroundColor: isActive ? tab.color : tab.bg,
                  color: isActive ? '#ffffff' : tab.color,
                  fontWeight: 800,
                  fontSize: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Tab Panel */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 8px -2px rgba(0,0,0,0.06)', minHeight: '520px' }}>
          
          {/* TAB 1: VISUALS & MAP */}
          {activeTab === 'visuals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  🛰️ Digital Site Visit Visual Deck & Verified Cadastral Map
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setMediaView('drone')} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', backgroundColor: mediaView === 'drone' ? '#4f46e5' : '#f1f5f9', color: mediaView === 'drone' ? '#ffffff' : '#334155' }}>
                    📹 4K Aerial Drone
                  </button>
                  <button onClick={() => setMediaView('pano')} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', backgroundColor: mediaView === 'pano' ? '#4f46e5' : '#f1f5f9', color: mediaView === 'pano' ? '#ffffff' : '#334155' }}>
                    🌐 360° Panorama
                  </button>
                  <button onClick={() => setMediaView('satellite')} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', backgroundColor: mediaView === 'satellite' ? '#4f46e5' : '#f1f5f9', color: mediaView === 'satellite' ? '#ffffff' : '#334155' }}>
                    🗺️ Satellite Topo
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <div style={{ height: '360px', backgroundColor: '#020617', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' }}>
                  {mediaView === 'drone' && (
                    <iframe
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      src="https://www.youtube.com/embed/1la38EfZa7E?autoplay=1&mute=1&loop=1&playlist=1la38EfZa7E&controls=1"
                      title="4K Drone Site Survey"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {mediaView === 'pano' && (
                    <iframe
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      src="https://momento360.com/e/u/0d3f82ee91bc40288dc08e82d8d85f86?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium"
                      title="360 Panorama View"
                      allowFullScreen
                    />
                  )}
                  {mediaView === 'satellite' && (
                    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b' }}>
                      <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
                        alt="Cadastral Overlay"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                      />
                      <div style={{ position: 'absolute', border: '3px dashed #34d399', padding: '16px 24px', borderRadius: '12px', backgroundColor: 'rgba(6, 78, 59, 0.4)' }}>
                        <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '13px', fontWeight: 800, padding: '6px 12px', borderRadius: '20px' }}>
                          Boundary: 30′ × 40′ (1,200 Sq.ft) Verified
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ height: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <iframe
                      title="Anjanapura Map"
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                      src="https://maps.google.com/maps?q=12.8580,77.5620&hl=en&z=15&output=embed"
                    />
                  </div>
                  <div style={{ padding: '14px 18px', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#312e81' }}>60 Ft Wide Asphalt Dual-Carriageway</div>
                      <div style={{ fontSize: '11px', color: '#4338ca', marginTop: '2px' }}>Direct connectivity to Anjanapura 80ft Main Road</div>
                    </div>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=12.8580,77.5620"
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: '8px 14px', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '12px', fontWeight: 800, borderRadius: '8px', textDecoration: 'none' }}
                    >
                      📍 Open Google Maps Route →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEGAL & DOCUMENT CHECKLIST */}
          {activeTab === 'legal' && (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                🏛️ Zoning, Approvals & Title Document Verification Checklist
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Master Plan Zoning</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '4px', fontSize: '14px' }}>CDA 2031: Primary Residential (Yellow)</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Sanction Authority</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '4px', fontSize: '14px' }}>BDA / BMRDA Approved Layout</div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', marginTop: '2px' }}>RERA: PRM/KA/RERA/1251/310/004120</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Legal Title Status</div>
                  <div style={{ fontWeight: 800, color: '#059669', marginTop: '4px', fontSize: '14px' }}>✓ 30-Year Clear Nil EC (Form 15)</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Clear unencumbered freehold title</div>
                </div>
              </div>

              <div style={{ border: '1px solid #cbd5e1', borderRadius: '14px', padding: '20px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                    📋 10-Point Title & Sanction Document Verification Checklist
                  </div>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px' }}>
                    8 of 10 Verified Available
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>BDA / BMRDA Sanctioned Layout Plan</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Signed & sealed engineering blueprint available</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>30-Year Encumbrance Certificate (Form 15)</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Nil encumbrance certificate issued by Sub-Registrar</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>Mother Deed & Root Title Documents</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Continuous ownership lineage traceable 40+ years</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>DC Conversion Order (Section 95)</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Converted from Agricultural to Non-Agricultural Residential</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>Latest Khata Certificate & Extract</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>e-Aasthi / e-Swathu digital registration validated</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>Property Tax Paid Receipts (Latest FY)</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Zero municipal property tax arrears</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>Land Acquisition NOC</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>BDA / KIADB non-acquisition certificate on file</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>Village Map & Survey Sketch (Tippani)</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Akarbandhu & revenue boundary cross-verified</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e11d48', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✗</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#881337' }}>Tree Officer Cutting Clearance</div>
                      <div style={{ fontSize: '11px', color: '#9f1239' }}>Not Available (Not required for vacant residential plot)</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e11d48', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✗</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#881337' }}>KSPCB Pollution Clearance</div>
                      <div style={{ fontSize: '11px', color: '#9f1239' }}>Not Applicable for Individual Villa Plot</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NGT SAFETY */}
          {activeTab === 'ngt' && (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                🛡️ Environmental & Cadastral Buffer Safety Engine (100% NGT Compliant)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '14px' }}>🌊 Lake Buffer Verification</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>✓ Safe</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '8px', fontWeight: 700 }}>Distance: 420m from nearest lake</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Well beyond the 30m NGT buffer guideline.</div>
                </div>

                <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '14px' }}>🌧️ SWD (Rajakaluve) Clearance</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>✓ Clear</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '8px', fontWeight: 700 }}>Distance: 180m from stormwater drain</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>100% clear of 50m primary drain buffer.</div>
                </div>

                <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '14px' }}>⚡ High-Tension Power Line</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>✓ Zero Risk</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '8px', fontWeight: 700 }}>Distance: 650m to nearest HT corridor</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Zero overhead power line restriction.</div>
                </div>

                <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '14px' }}>🏔️ Elevation & Flood Safety</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>✓ High Ground</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '8px', fontWeight: 700 }}>Elevation: 915m above MSL</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Natural ridge topography; zero waterlogging risk.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SITE PROFILE */}
          {activeTab === 'site' && (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                🛣️ Physical Site Profile, Dimensions & Civic Utilities
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Plot Dimensions</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>30′ × 40′</div>
                  <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>1,200.00 Sq.ft (111.48 Sq.m)</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Facing & Vaastu</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>North-East</div>
                  <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>Corner plot with dual road access</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Approach Road</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>60 Ft Wide</div>
                  <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>Asphalt dual carriageway</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Soil & Water</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>Red Loamy</div>
                  <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>SBC: 180 kN/sqm | Water ~450 ft</div>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '10px' }}>Active Civic Utilities Grid</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#166534' }}>
                    ✓ Underground Drainage (UGD)
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#166534' }}>
                    ✓ Cauvery Phase 5 Water
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#166534' }}>
                    ✓ BESCOM 3-Phase Power
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#166534' }}>
                    ✓ High-Speed Fiber Optic
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RADIAL RADAR */}
          {activeTab === 'radar' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  🧭 Radial Infrastructure & Transit Radar
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['1km', '3km', '5km', '10km'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRadarDistance(r)}
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, border: 'none', cursor: 'pointer', backgroundColor: radarDistance === r ? '#7c3aed' : '#f1f5f9', color: radarDistance === r ? '#ffffff' : '#334155' }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>🚇 Transit</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', marginTop: '3px' }}>Anjanapura Metro Terminal (Green Line)</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', marginTop: '4px' }}>1.2 km • 4 mins drive</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>💼 Expressway Access</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', marginTop: '3px' }}>NICE Ring Road Interchange</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', marginTop: '4px' }}>2.4 km • 6 mins drive</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>🏢 Tech Corridors</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', marginTop: '3px' }}>Bannerghatta & Electronic City Ph 1</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', marginTop: '4px' }}>8.5 km • 18 mins drive</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>🎓 Education</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', marginTop: '3px' }}>BGS National Public School</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', marginTop: '4px' }}>2.5 km • 7 mins drive</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>🏥 Healthcare</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', marginTop: '3px' }}>Aster RV Hospital & Fortis</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', marginTop: '4px' }}>5.2 km • 12 mins drive</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>🛒 Retail & Lifestyle</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', marginTop: '3px' }}>Royal Meenakshi Mall</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', marginTop: '4px' }}>4.5 km • 11 mins drive</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ROI SIMULATOR */}
          {activeTab === 'roi' && (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                📈 Micro-Market Valuation & Investment ROI Simulator
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Govt. Guidance Value</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>₹3,200 / Sft</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Locality Market Avg</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>₹4,800 / Sft</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase' }}>Asking Rate</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>₹13,100 / Sft</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>+172.9% vs Base</div>
                </div>
              </div>

              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e3a8a', marginBottom: '16px' }}>Dynamic Return on Investment Calculator</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
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
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                      Annual Appreciation Rate: <strong style={{ color: '#2563eb' }}>{expectedCagr}% p.a.</strong>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', paddingTop: '16px', borderTop: '1px solid #bfdbfe' }}>
                  <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '10px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Gross Rental Yield</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>4.2% p.a.</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '10px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Projected Exit Value</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#1d4ed8', marginTop: '2px' }}>₹{calculatedExit} Cr</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '10px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Total ROI Multiple</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>{roiMultiple}x Return</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CIVIL TOOLS */}
          {activeTab === 'civil' && (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                ⚡ BuildMitra Civil Engineering & Site Feasibility Actions
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#9f1239' }}>📐 Push Dimensions to CAD Generator</div>
                    <div style={{ fontSize: '12px', color: '#881337', marginTop: '6px', lineHeight: '1.5' }}>
                      Load 30′ × 40′ (1,200 Sft) into the architectural CAD engine for automated 2BHK/3BHK Vaastu compliant floor layouts.
                    </div>
                  </div>
                  <button style={{ marginTop: '16px', padding: '10px 16px', backgroundColor: '#e11d48', color: '#ffffff', fontWeight: 800, fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                    Open in CAD Generator →
                  </button>
                </div>

                <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#9f1239' }}>🔨 Calculate Civil Construction BOQ</div>
                    <div style={{ fontSize: '12px', color: '#881337', marginTop: '6px', lineHeight: '1.5' }}>
                      Estimate turnkey construction cost (G+1 / G+2), cement bags, steel tonnage, and masonry based on live Bangalore rates.
                    </div>
                  </div>
                  <button style={{ marginTop: '16px', padding: '10px 16px', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
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


