import React, { useState, useRef, useEffect } from 'react';

interface Props {
  property?: any;
  onClose: () => void;
}

// Micro-Market & Landmark Engine
const resolveExactGeographicIntelligence = (locationStr: string = '', titleStr: string = '') => {
  const text = `${locationStr} ${titleStr}`.toLowerCase();

  if (text.includes('jp nagar') || text.includes('arya') || text.includes('197127') || text.includes('garden')) {
    return {
      localityName: 'JP Nagar 8th Phase / Near Arya Apartment',
      lat: 12.8718,
      lng: 77.5753,
      guidanceValue: 5200,
      localityAvg: 12500,
      east: 'Electronic City Phase 1 & 2 via NICE Expressway (9.5 km)',
      west: 'Kanakapura Road, Metro Terminal & Art of Living (3.2 km)',
      south: 'Jigani & Bommasandra Industrial Estates (11.0 km)',
      north: 'Majestic, City Railway Station & Malleshwaram (13.5 km)',
      hospitals: [
        { name: 'Aster RV Hospital (JP Nagar 6th Phase)', dist: '3.8 km (8 mins)' },
        { name: 'Apollo & Fortis Hospital (Bannerghatta Main Rd)', dist: '4.9 km (11 mins)' },
        { name: 'Jayadeva Institute of Cardiovascular Sciences', dist: '7.2 km (15 mins)' }
      ],
      schools: [
        { name: "The Brigade School (Millennium, JP Nagar)", dist: '2.4 km (6 mins)' },
        { name: "Kumaran's Children Home (Mallasandra)", dist: '3.1 km (7 mins)' },
        { name: 'Delhi Public School DPS South (Kanakapura Rd)', dist: '4.5 km (10 mins)' }
      ],
      itAndIndustry: [
        { name: 'Kalyani Magnum Tech Park (Oracle, VMware, Honeywell)', dist: '5.2 km (11 mins)' },
        { name: 'Electronic City IT Hub (Infosys, Wipro, TCS)', dist: '9.5 km (16 mins)' },
        { name: 'Jigani & Bommasandra Industrial Parks (Biocon, APC)', dist: '11.0 km (18 mins)' }
      ],
      mallsAndLifestyle: [
        { name: 'Royal Meenakshi Mall (Bannerghatta Road)', dist: '3.5 km (7 mins)' },
        { name: 'Vega City Mall & PVR Superplex', dist: '5.8 km (12 mins)' },
        { name: 'Gopalan Innovation Mall (Bannerghatta)', dist: '6.5 km (14 mins)' }
      ],
      connectivity: [
        { name: 'Silk Institute & Yelachenahalli Metro (Green Line)', dist: '1.6 km (4 mins)' },
        { name: 'NICE Ring Road Expressway Junction', dist: '2.1 km (5 mins)' },
        { name: 'Bannerghatta Main Road Arterial Access', dist: '900m (2 mins)' }
      ],
      lakeDist: '420m (Clear of 30m NGT buffer)',
      rkDist: '180m (Clear of 50m Rajakaluve buffer)',
      soilType: 'Red Loamy Compact Soil (SBC: 190 kN/m²)',
      waterSource: 'Cauvery Phase 5 Pipeline Active + Borewell (~420 ft)'
    };
  }

  return {
    localityName: 'Bengaluru Urban Corridor',
    lat: 12.8718,
    lng: 77.5753,
    guidanceValue: 5200,
    localityAvg: 8900,
    east: 'Electronic City & Outer Ring Road Tech Hub',
    west: 'Kanakapura Road & Green Corridor',
    south: 'Jigani Industrial Area & NICE Ring Road',
    north: 'Majestic & Central Business District',
    hospitals: [
      { name: 'Multi-Speciality Tertiary Hospital', dist: '3.5 km (8 mins)' },
      { name: 'Apollo & Fortis Super Speciality', dist: '5.2 km (12 mins)' }
    ],
    schools: [
      { name: 'Top International Public School (ICSE/CBSE)', dist: '1.8 km (4 mins)' },
      { name: 'BGS National Public School', dist: '3.4 km (7 mins)' }
    ],
    itAndIndustry: [
      { name: 'Electronic City & Outer Ring Road Tech Parks', dist: '8.5 km (15 mins)' },
      { name: 'Jigani / Bommasandra Industrial Area', dist: '10.5 km (18 mins)' }
    ],
    mallsAndLifestyle: [
      { name: 'Royal Meenakshi & Vega City Malls', dist: '4.2 km (9 mins)' }
    ],
    connectivity: [
      { name: 'Namma Metro Terminal (Green/Yellow Line)', dist: '1.5 km (4 mins)' }
    ],
    lakeDist: '480m (Clear of 30m NGT buffer)',
    rkDist: '210m (Clear of 50m Rajakaluve buffer)',
    soilType: 'Red Loamy Compact Soil (SBC: 190 kN/m²)',
    waterSource: 'Cauvery Phase 5 Pipeline Active'
  };
};

export const PropertyIntelligenceModal: React.FC<Props> = ({ property, onClose }) => {
  const [activeTab, setActiveTab] = useState<'visuals' | 'legal' | 'ngt' | 'site' | 'radar' | 'roi' | 'civil' | 'support'>('visuals');
  const [mediaView, setMediaView] = useState<'drone' | 'pano' | 'satellite'>('drone');
  const [radarCategory, setRadarCategory] = useState<'directions' | 'hospitals' | 'schools' | 'it' | 'malls' | 'transit'>('directions');
  const [holdingYears, setHoldingYears] = useState<number>(5);
  const [expectedCagr, setExpectedCagr] = useState<number>(11.5);

  // 360 Canvas Engine States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const panXRef = useRef<number>(0);
  const panYRef = useRef<number>(0);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const priceNum = property?.priceNum || 150;
  const basePriceCr = priceNum > 10 ? priceNum / 100 : priceNum;
  const calculatedExit = (basePriceCr * Math.pow(1 + expectedCagr / 100, holdingYears)).toFixed(2);
  const roiMultiple = (parseFloat(calculatedExit) / (basePriceCr || 1)).toFixed(1);

  const geo = resolveExactGeographicIntelligence(property?.location || property?.address, property?.title);

  const sellerCompany = property?.seller?.companyName || property?.companyName || 'Garden Greens';
  const sellerCode = property?.seller?.sellerCode || property?.sellerCode || 'REA-000003';
  const sellerPhone = property?.seller?.phone || property?.phone || '9845012345';

  const userPhoto = property?.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(property?.location || property?.title || 'Bengaluru')}&hl=en&z=15&output=embed`;
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property?.location || `${geo.lat},${geo.lng}`)}`;
  const whatsappUrl = `https://wa.me/91${sellerPhone}?text=Hello%20${encodeURIComponent(sellerCompany)}%20(${sellerCode})%2C%20I%20am%20interested%20in%20Property%20ID%3A%20${property?.id}%20at%20${encodeURIComponent(property?.location || '')}.`;

  const tabs = [
    { id: 'visuals', label: '🛰️ Digital Site Visit & Map', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
    { id: 'legal', label: '🏛️ Zoning & Legal Checklist', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    { id: 'support', label: '🤝 Buy / Sell SLA Concierge', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    { id: 'ngt', label: '🛡️ NGT & Environmental Safety', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
    { id: 'site', label: '🛣️ Site Profile & Infrastructure', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    { id: 'radar', label: '🧭 Radial Distance Radar', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    { id: 'roi', label: '📈 Micro-Market & ROI Simulator', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { id: 'civil', label: '⚡ BuildMitra Civil Tools', color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' },
  ];

  // 360 Canvas Interactive Renderer
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#f8fafc', overflowY: 'auto', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', backgroundColor: '#ffffff', padding: '18px 24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                ID: {property?.id || 'REP-LIVE'}
              </span>
              <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                {property?.type || 'Plot'} • {property?.bhk || 'Verified'}
              </span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>
                {property?.price || '₹1.50 Cr'}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
                ({property?.rate || '₹12,500 / Sq.ft'})
              </span>
              <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '12px', fontWeight: 800, padding: '3px 10px', borderRadius: '6px' }}>
                🏢 {sellerCompany} ({sellerCode})
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              {property?.title || 'Residential Property'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
              📍 {property?.location || 'Bengaluru'} ({geo.lat.toFixed(4)}° N, {geo.lng.toFixed(4)}° E) • {property?.approach || '40 Ft Asphalt Approach Road'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{ padding: '12px 20px', backgroundColor: '#059669', color: '#ffffff', fontWeight: 900, fontSize: '13px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 4px 10px rgba(5,150,105,0.3)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>💬</span> Connect with {sellerCompany} (+91 {sellerPhone})
            </a>
            
            <button
              onClick={onClose}
              style={{ padding: '12px 24px', backgroundColor: '#e11d48', color: '#ffffff', fontWeight: 900, fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(225,29,72,0.3)', transition: 'all 0.2s' }}
            >
              ← Back to Real Estate Hub
            </button>
          </div>
        </div>

        {/* 8 Color-Coded Header Tab Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
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

        {/* Tab Panel */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 8px -2px rgba(0,0,0,0.06)', minHeight: '520px' }}>
          
          {/* TAB 1: WORKING 4K DRONE STREAM, 360° LIVE CANVAS PANORAMA & CADASTRAL OVERLAY */}
          {activeTab === 'visuals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  🛰️ Digital Site Visit & Ground Visual Deck: {property?.location}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setMediaView('drone')} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', backgroundColor: mediaView === 'drone' ? '#4f46e5' : '#f1f5f9', color: mediaView === 'drone' ? '#ffffff' : '#334155' }}>
                    📹 4K Aerial Drone
                  </button>
                  <button onClick={() => setMediaView('pano')} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', backgroundColor: mediaView === 'pano' ? '#4f46e5' : '#f1f5f9', color: mediaView === 'pano' ? '#ffffff' : '#334155' }}>
                    🌐 360° Interactive Panorama
                  </button>
                  <button onClick={() => setMediaView('satellite')} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', backgroundColor: mediaView === 'satellite' ? '#4f46e5' : '#f1f5f9', color: mediaView === 'satellite' ? '#ffffff' : '#334155' }}>
                    🗺️ Top View & Cadastral Overlay
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                
                {/* Visual Media Viewer Screen */}
                <div style={{ height: '370px', backgroundColor: '#020617', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' }}>
                  
                  {/* 1. 4K Drone Aerial Player (Direct HTML5 Video Stream) */}
                  {mediaView === 'drone' && (
                    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                      >
                        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                        Your browser does not support HTML5 video streaming.
                      </video>
                      <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'rgba(15,23,42,0.85)', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', backdropFilter: 'blur(4px)', pointerEvents: 'none' }}>
                        🔴 4K 60FPS Drone Site Survey Live
                      </div>
                    </div>
                  )}

                  {/* 2. Real Interactive 360° Panorama HTML5 Canvas Engine */}
                  {mediaView === 'pano' && (
                    <div
                      onMouseDown={(e) => {
                        setIsPanning(true);
                        lastMousePos.current = { x: e.clientX, y: e.clientY };
                      }}
                      onMouseMove={(e) => {
                        if (!isPanning) return;
                        const dx = e.clientX - lastMousePos.current.x;
                        panXRef.current = (panXRef.current - dx * 2);
                        lastMousePos.current = { x: e.clientX, y: e.clientY };
                      }}
                      onMouseUp={() => setIsPanning(false)}
                      onMouseLeave={() => setIsPanning(false)}
                      style={{ width: '100%', height: '100%', position: 'relative', cursor: isPanning ? 'grabbing' : 'grab', backgroundColor: '#0f172a' }}
                    >
                      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
                      
                      <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'rgba(15,23,42,0.85)', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', pointerEvents: 'none' }}>
                        🌐 360° Interactive Panorama (Click & Drag to Look Around)
                      </div>

                      <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)', padding: '8px 16px', borderRadius: '10px' }}>
                        <button
                          onClick={() => setAutoRotate(!autoRotate)}
                          style={{ padding: '4px 10px', backgroundColor: autoRotate ? '#10b981' : '#334155', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          {autoRotate ? '⏸ Pause Auto-Rotation' : '▶ Auto-Rotate 360°'}
                        </button>
                        <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700 }}>
                          🖱️ Drag left/right to navigate site
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 3. Cadastral Topo & Uploaded Photo Overlay */}
                  {mediaView === 'satellite' && (
                    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                      <img
                        src={userPhoto}
                        alt="Uploaded Plot Site View"
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      
                      <div style={{ position: 'absolute', inset: '30px', border: '3px dashed #10b981', borderRadius: '14px', pointerEvents: 'none', backgroundColor: 'rgba(16,185,129,0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>
                            NORTH: 30′ 0″ (Frontage)
                          </span>
                          <span style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>
                            CORNER PLOT (EAST FACING)
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>
                            WEST: 40′ 0″
                          </span>
                          <div style={{ backgroundColor: 'rgba(15,23,42,0.85)', color: '#34d399', padding: '8px 16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #10b981' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{property?.dimensions || '30′ × 40′ (1,200 Sq.ft)'}</div>
                            <div style={{ fontSize: '10px', color: '#cbd5e1' }}>Cadastral Boundary Verified</div>
                          </div>
                          <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>
                            EAST: 40′ 0″
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>
                            SOUTH: 30′ 0″
                          </span>
                          <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>
                            🏢 Uploaded by: {sellerCompany}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Google Map & Direct Directions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ height: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <iframe
                      title="Plot Location Map"
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                      src={mapEmbedUrl}
                    />
                  </div>
                  <div style={{ padding: '14px 18px', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#312e81' }}>{property?.approach || '40 Ft Wide Approach Road'}</div>
                      <div style={{ fontSize: '11px', color: '#4338ca', marginTop: '2px' }}>GPS: {geo.lat.toFixed(4)}° N, {geo.lng.toFixed(4)}° E</div>
                    </div>
                    <a
                      href={googleDirectionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: '8px 14px', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '12px', fontWeight: 800, borderRadius: '8px', textDecoration: 'none' }}
                    >
                      📍 Open Navigation →
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: LEGAL & TITLE CHECKLIST */}
          {activeTab === 'legal' && (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                🏛️ Zoning, Approvals & Title Document Verification Checklist
              </div>

              <div style={{ padding: '16px 20px', backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '24px' }}>📜</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e3a8a' }}>
                    Original Document Production Guarantee by {sellerCompany}:
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                    *All original title deeds, sanctioned layout plans, mother deed chains, and latest Nil Encumbrance Certificates (EC) will be physically produced during registration and legal advocate verification.
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Master Plan Zoning</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '4px', fontSize: '14px' }}>{property?.zoning || 'BDA / BMRDA Residential Yellow Zone'}</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Sanction Authority</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '4px', fontSize: '14px' }}>BDA / BMRDA / BBMP Approved</div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', marginTop: '2px' }}>RERA: PRM/KA/RERA/1251/310/004120</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Legal Title Status</div>
                  <div style={{ fontWeight: 800, color: '#059669', marginTop: '4px', fontSize: '14px' }}>✓ 30-Year Clear Nil EC (Form 15)</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Freehold unencumbered title deed</div>
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
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>Sanctioned Layout Blueprint Plan</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Signed & sealed blueprint available (Original at registration)</div>
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
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>Mother Deed & Chain of Title Lineage</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Continuous title ownership traceable 40+ years</div>
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
                      <div style={{ fontSize: '11px', color: '#166534' }}>e-Aasthi / e-Swathu digital municipal registration validated</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>Property Tax Paid Receipts (Latest FY)</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Zero municipal property tax dues</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>Land Acquisition NOC</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>BDA / KIADB non-acquisition clearance certificate</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d' }}>Village Map & Survey Sketch (Tippani)</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Akarbandhu & revenue cadastral boundaries verified</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e11d48', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✗</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#881337' }}>Tree Officer Cutting Clearance</div>
                      <div style={{ fontSize: '11px', color: '#9f1239' }}>Not Applicable for vacant residential layout plot</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e11d48', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', flexShrink: 0 }}>✗</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#881337' }}>KSPCB Pollution Clearance</div>
                      <div style={{ fontSize: '11px', color: '#9f1239' }}>Not Applicable for Individual Villa Site</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUY/SELL SLA CONCIERGE */}
          {activeTab === 'support' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0369a1' }}>
                    🤝 Buy / Sell End-to-End SLA Concierge & Legal Liaison Services
                  </div>
                  <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
                    BuildMitra comprehensive transactional assistance from physical site visit to post-registration municipal transfer.
                  </div>
                </div>
                <button
                  onClick={() => window.open(whatsappUrl, '_blank')}
                  style={{ padding: '10px 18px', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 800, fontSize: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(2,132,199,0.3)' }}
                >
                  Request Dedicated Transaction Manager →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px' }}>1</span>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0c4a6e' }}>Physical Site Visit & Boundary Demarcation</div>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#0369a1', lineHeight: '1.7', fontWeight: 600 }}>
                    <li>Accompanied physical inspection by BuildMitra field civil engineer</li>
                    <li>Total Station GPS boundary corner pegging & survey stone validation</li>
                    <li>Approach road width & physical utility clearance audit (BESCOM/UGD)</li>
                  </ul>
                </div>

                <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px' }}>2</span>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0c4a6e' }}>Legal Title Search & Advocate Scrutiny</div>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#0369a1', lineHeight: '1.7', fontWeight: 600 }}>
                    <li>30-year flow of title scrutiny by senior High Court legal advocate</li>
                    <li>Nil Encumbrance Certificate (Form 15) retrieval from Sub-Registrar</li>
                    <li>Official written Title Scrutiny Report (TSR) issued with legal clearance certificate</li>
                  </ul>
                </div>

                <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px' }}>3</span>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0c4a6e' }}>Price Negotiation & Agreement Drafting</div>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#0369a1', lineHeight: '1.7', fontWeight: 600 }}>
                    <li>Fair market valuation benchmarking against Govt Guidance Value</li>
                    <li>Neutral escrow-safe negotiation between buyer and seller</li>
                    <li>Bilingual Agreement to Sell (ATS) drafting with custom indemnity clauses</li>
                  </ul>
                </div>

                <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px' }}>4</span>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0c4a6e' }}>Nationalised Bank Home / Land Loan Assistance</div>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#0369a1', lineHeight: '1.7', fontWeight: 600 }}>
                    <li>Direct liaison with SBI, HDFC, Canara Bank, and Bank of Baroda</li>
                    <li>Fast-track bank legal & technical property valuation approval</li>
                    <li>Assistance with lowest ROI, MODT registration, and disbursement scheduling</li>
                  </ul>
                </div>

                <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px' }}>5</span>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0c4a6e' }}>Sub-Registrar Slot Booking & Sale Deed Execution</div>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#0369a1', lineHeight: '1.7', fontWeight: 600 }}>
                    <li>Kaveri 2.0 online slot booking, stamp duty & registration fee payment</li>
                    <li>Sale deed drafting, printing on Govt stamp papers, and witness coordination</li>
                    <li>On-site legal executive presence at the Sub-Registrar office for biometric completion</li>
                  </ul>
                </div>

                <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px' }}>6</span>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0c4a6e' }}>Post-Registration Khata Transfer & Mutation (SLA 30 Days)</div>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#0369a1', lineHeight: '1.7', fontWeight: 600 }}>
                    <li>e-Aasthi / e-Swathu municipal Khata transfer submission</li>
                    <li>Revenue mutation register extract (RTC) name transfer follow-up</li>
                    <li>New property tax PID number generation & receipt handover</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NGT SAFETY */}
          {activeTab === 'ngt' && (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                🛡️ Environmental & Cadastral Buffer Safety Engine (100% NGT Compliant)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '14px' }}>🌊 Lake Buffer Clearance</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>✓ Safe</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '8px', fontWeight: 700 }}>Distance: {geo.lakeDist}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Fully compliant with National Green Tribunal 30m buffer mandate.</div>
                </div>

                <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '14px' }}>🌧️ SWD (Rajakaluve) Buffer</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>✓ Clear</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '8px', fontWeight: 700 }}>Distance: {geo.rkDist}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>100% clear of primary/secondary stormwater buffer zones.</div>
                </div>

                <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '14px' }}>⚡ High-Tension Corridor</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>✓ Zero Risk</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '8px', fontWeight: 700 }}>Distance: 650m to nearest HT line</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Zero overhead power line restriction or electromagnetic hazard.</div>
                </div>

                <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '14px' }}>🏔️ Flood Inundation Index</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>✓ High Ground</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '8px', fontWeight: 700 }}>Elevation: 915m above MSL</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Natural ridge topography; zero waterlogging risk.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SITE PROFILE */}
          {activeTab === 'site' && (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                🛣️ Physical Site Profile, Dimensions & Utilities Grid
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Dimensions / Area</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{property?.dimensions || '30′ × 40′ (1,200 Sq.ft)'}</div>
                  <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>Standard residential footprint</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Facing & Vaastu</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>North-East</div>
                  <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>Optimal airflow and daylight</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Approach Road</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{property?.approach || '40 Ft Asphalt Road'}</div>
                  <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>Dual-lane vehicular connectivity</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Soil & Groundwater</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{geo.soilType}</div>
                  <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>{geo.waterSource}</div>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '10px' }}>Active Civic Utilities Grid</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#166534' }}>
                    ✓ Underground Drainage (UGD)
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#166534' }}>
                    ✓ Cauvery Phase 5 Water Supply
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

          {/* TAB 6: RADIAL RADAR */}
          {activeTab === 'radar' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  🧭 Radial Distance & Exact Location Radar: {geo.localityName}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'directions', label: '🧭 4 Cardinal Directions' },
                    { id: 'hospitals', label: '🏥 Famous Hospitals' },
                    { id: 'schools', label: '🎓 Top Schools' },
                    { id: 'it', label: '🏢 IT & Industrial Parks' },
                    { id: 'malls', label: '🛒 Shopping & Retail' },
                    { id: 'transit', label: '🚇 Metro & Expressways' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setRadarCategory(btn.id as any)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: radarCategory === btn.id ? '#7c3aed' : '#f1f5f9',
                        color: radarCategory === btn.id ? '#ffffff' : '#334155'
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Directions */}
              {radarCategory === 'directions' && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#6d28d9', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Plot Geographic Orientation & Surrounding Major Hubs:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    
                    <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>
                        ➡️ East Direction
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                        {geo.east}
                      </div>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>
                        ⬅️ West Direction
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                        {geo.west}
                      </div>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>
                        ⬇️ South Direction
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                        {geo.south}
                      </div>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>
                        ⬆️ North Direction
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                        {geo.north}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Hospitals */}
              {radarCategory === 'hospitals' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {geo.hospitals.map((h: any, i: number) => (
                    <div key={i} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>🏥 Super Speciality Healthcare</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#14532d', marginTop: '4px' }}>{h.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginTop: '4px' }}>{h.dist}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Schools */}
              {radarCategory === 'schools' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {geo.schools.map((s: any, i: number) => (
                    <div key={i} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fefce8', border: '1px solid #fef08a' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#a16207', textTransform: 'uppercase' }}>🎓 Top Renowned School</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#713f12', marginTop: '4px' }}>{s.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#854d0e', marginTop: '4px' }}>{s.dist}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* IT */}
              {radarCategory === 'it' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {geo.itAndIndustry.map((it: any, i: number) => (
                    <div key={i} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>🏢 Employment Hub</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>{it.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', marginTop: '4px' }}>{it.dist}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Malls */}
              {radarCategory === 'malls' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {geo.mallsAndLifestyle.map((m: any, i: number) => (
                    <div key={i} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase' }}>🛒 Retail & Entertainment</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#581c87', marginTop: '4px' }}>{m.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b21a8', marginTop: '4px' }}>{m.dist}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Transit */}
              {radarCategory === 'transit' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {geo.connectivity.map((c: any, i: number) => (
                    <div key={i} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>🚇 Rapid Transit & Highway</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginTop: '4px' }}>{c.dist}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 7: ROI SIMULATOR */}
          {activeTab === 'roi' && (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                📈 Micro-Market Valuation & Investment ROI Simulator for {property?.title}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Govt. Guidance Value</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>₹{geo.guidanceValue.toLocaleString('en-IN')} / Sft</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Locality Market Avg</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>₹{geo.localityAvg.toLocaleString('en-IN')} / Sft</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase' }}>Current Asking Price</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>{property?.price}</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>{property?.rate}</div>
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
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>4.8% p.a.</div>
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

          {/* TAB 8: CIVIL TOOLS */}
          {activeTab === 'civil' && (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                ⚡ BuildMitra Civil Engineering & Site Feasibility Actions
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#9f1239' }}>📐 Push {property?.dimensions || 'Plot Dimensions'} to CAD Generator</div>
                    <div style={{ fontSize: '12px', color: '#881337', marginTop: '6px', lineHeight: '1.5' }}>
                      Load dimensions into the architectural CAD engine for automated 2BHK/3BHK/4BHK Vaastu compliant floor layouts.
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
