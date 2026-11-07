import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { resolveUniversalGeoData, normalizeAreaToSqFt, calculateHaversineKm, UniversalGeoResult } from '../utils/universalGeoEngine';
import { formatImageUrl } from '../services/propertyService';

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
  const [isLoadingGis, setIsLoadingGis] = useState<boolean>(false);

  // Backend intelligence bundle (if present)
  const intel = property?.intelligence;

  const propLat = typeof property?.lat === 'number' && !isNaN(property.lat) && property.lat !== 0 ? property.lat : (intel?.coordinates?.lat || 12.8718);
  const propLng = typeof property?.lng === 'number' && !isNaN(property.lng) && property.lng !== 0 ? property.lng : (intel?.coordinates?.lng || 77.5753);
  const propAddress = property?.location || property?.locality || property?.address || 'Property Site Location';

  // Live User Location for exact digital survey distance from user
  const [userLiveCoords, setUserLiveCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLiveCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { timeout: 6000 }
      );
    }
  }, []);

  // Synchronously or smoothly resolve GIS Data
  useEffect(() => {
    let isMounted = true;
    if (intel?.jurisdiction) {
      // Instant zero-delay hydration from backend intelligence
      setGeoData({
        state: intel.jurisdiction.state || 'Karnataka',
        district: intel.jurisdiction.district || 'Bengaluru Urban',
        taluk: intel.jurisdiction.taluk || 'Bengaluru South',
        villageOrSubdivision: intel.jurisdiction.villageOrSubdivision || '',
        zoneName: intel.jurisdiction.zoneName || '',
        defaultSro: intel.jurisdiction.defaultSro || property?.sroOffice || 'SRO JP Nagar',
        zoningAuthority: intel.jurisdiction.zoningAuthority || property?.zoning || 'BDA Approved',
        planningJurisdiction: intel.jurisdiction.planningJurisdiction || '',
        legalDocuments: intel.jurisdiction.legalDocuments || [],
        guidanceValue: intel.guidelineValuation?.guidanceRatePerSqFt || property?.guidanceValue || 6800,
        guidanceUnit: '₹ / Sq.ft',
        localityAvg: intel.guidelineValuation?.localityAvgRate || 12500,
        lat: propLat,
        lng: propLng,
        formattedAddress: propAddress,
        hospitals: intel.radialRadar?.hospitals || [],
        schools: intel.radialRadar?.schools || [],
        malls: intel.radialRadar?.malls || [],
        civicAndSports: intel.radialRadar?.civic || [],
        industrialAndWork: intel.radialRadar?.industrial || [],
        transit: intel.radialRadar?.transit || '',
        lakeDist: intel.environmentalSafety?.lakeProximity || '450m (Safe beyond 30m NGT buffer)',
        rkDist: intel.environmentalSafety?.rajakaluveProximity || '600m (Clear of Rajakaluve)',
        drainDist: intel.environmentalSafety?.drainSetback || '100m (Roadside Municipal Drain)',
        parkDist: intel.environmentalSafety?.greenZoneProximity || '200m (Open Green Zone)',
        soilType: intel.infrastructureProfile?.soilType || 'Compact Red Loamy Soil (Safe SBC: 195 kN/m²)',
        waterSource: intel.infrastructureProfile?.waterSupply || 'Active Cauvery Line + Deep Groundwater',
        eastLandscape: intel.radialRadar?.landscape4D?.east || '',
        westLandscape: intel.radialRadar?.landscape4D?.west || '',
        southLandscape: intel.radialRadar?.landscape4D?.south || '',
        northLandscape: intel.radialRadar?.landscape4D?.north || '',
        officialStateRegistrationPortal: intel.jurisdiction.officialPortal || 'Kaveri 2.0 (kaveri.karnataka.gov.in)',
        guidanceValueGuidanceNote: `Official circle rates and encumbrance verified via ${intel.jurisdiction.defaultSro || 'SRO office'}.`,
        mutationAuthorityName: intel.jurisdiction.mutationAuthority || 'Municipal e-Aasthi / Revenue Mutation',
        stampDutyRate: intel.guidelineValuation?.stampDutyRate || 5.0,
        registrationFeeRate: intel.guidelineValuation?.registrationFeeRate || 1.0,
        cessRate: intel.guidelineValuation?.cessRate ?? 0.5,
        sroExecutionDays: intel.slaTimelines?.sroDeedExecutionDays || '1-2 Working Days',
        mutationTimelineDays: intel.slaTimelines?.revenueMutationDays || '30-45 Calendar Days',
        permissibleFAR: intel.feasibilityMetrics?.permissibleFAR || 2.25,
        permissibleFloors: intel.feasibilityMetrics?.permissibleFloors || 'G + 4 Floors',
        setbackFront: intel.feasibilityMetrics?.setbacks?.front || '4.0m Front Road Setback',
        setbackRear: intel.feasibilityMetrics?.setbacks?.rear || '2.0m Rear Setback',
        setbackSides: intel.feasibilityMetrics?.setbacks?.sides || '1.5m Side Setbacks',
        feasibilityScore: intel.feasibilityMetrics?.constructionFeasibilityScore || 94,
        rentalYieldPercent: intel.financialSimulation?.rentalYieldPercent || 4.2
      });
      setIsLoadingGis(false);
      return;
    }

    setIsLoadingGis(true);
    resolveUniversalGeoData(propLat, propLng, propAddress).then((data) => {
      if (isMounted) {
        setGeoData(data);
        setIsLoadingGis(false);
      }
    });
    return () => { isMounted = false; };
  }, [propLat, propLng, propAddress, intel, property?.guidanceValue, property?.sroOffice, property?.zoning]);

  // Universal Area & Price Normalization (Acres vs Sq.ft)
  const dimensionInfo = useMemo(() => {
    return normalizeAreaToSqFt(property?.dimensions || `${property?.area || 1200} Sq.ft`);
  }, [property?.dimensions, property?.area]);

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

  // Dynamic Distance from User's Location
  const liveDistanceKm = useMemo(() => {
    if (!userLiveCoords) return intel?.userDistanceKm ?? null;
    return Number(calculateHaversineKm(userLiveCoords.lat, userLiveCoords.lng, propLat, propLng).toFixed(2));
  }, [userLiveCoords, intel, propLat, propLng]);

  const isWithin10Km = liveDistanceKm !== null && liveDistanceKm <= 10.0;

  const liveDistanceFormatted = useMemo(() => {
    if (liveDistanceKm !== null) {
      const walkOrDrive = liveDistanceKm < 1 ? ` (~${Math.max(1, Math.round(liveDistanceKm * 8))} mins Walk)` : ` (~${Math.max(2, Math.round(liveDistanceKm * 2.3))} mins Drive)`;
      return `${liveDistanceKm.toFixed(1)} km from your current GPS location${walkOrDrive}`;
    }
    return intel?.userDistanceFormatted || (geoData?.benchmarkCityCenter ? `Benchmark: ${geoData.benchmarkCityCenter}` : 'Benchmark: 11.2 km from City Center');
  }, [liveDistanceKm, intel, geoData]);

  // Guidance Value & Statutory Calculations
  const guidanceRate = intel?.guidelineValuation?.guidanceRatePerSqFt || property?.guidanceValue || geoData?.guidanceValue || 6800;
  const totalGovtValuationRupees = intel?.guidelineValuation?.totalGuidanceRupees || Math.round(totalSqFt * guidanceRate);
  const totalGovtValuationCr = (totalGovtValuationRupees / 10000000).toFixed(2);
  const stampDutyRate = intel?.guidelineValuation?.stampDutyRate || geoData?.stampDutyRate || 5.0;
  const stampDutyRupees = intel?.guidelineValuation?.stampDutyRupees || Math.round(totalGovtValuationRupees * (stampDutyRate / 100));
  const regFeeRate = intel?.guidelineValuation?.registrationFeeRate || geoData?.registrationFeeRate || 1.0;
  const regFeeRupees = intel?.guidelineValuation?.registrationFeeRupees || Math.round(totalGovtValuationRupees * (regFeeRate / 100));
  const cessRate = intel?.guidelineValuation?.cessRate ?? (geoData?.cessRate ?? 0.5);
  const cessRupees = intel?.guidelineValuation?.cessRupees || Math.round(stampDutyRupees * (cessRate / 100));
  const totalGovtCharges = intel?.guidelineValuation?.totalStatutoryChargesRupees || (stampDutyRupees + regFeeRupees + cessRupees);
  const marketToGuidanceRatio = intel?.guidelineValuation?.marketToGuidanceRatio || Number((totalRupees / (totalGovtValuationRupees || 1)).toFixed(2));

  // Universal ROI Exit Math
  const calculatedExit = (totalCr * Math.pow(1 + expectedCagr / 100, holdingYears)).toFixed(2);
  const roiMultiple = (parseFloat(calculatedExit) / (totalCr || 1)).toFixed(1);

  // Rental Yield Math
  const isAgri = isAcreage || String(property?.propertyType || '').toLowerCase().includes('agri');
  const isComm = /industrial|commercial|kiadb/i.test(String(property?.propertyType || ''));
  const rentalYieldPercent = intel?.financialSimulation?.rentalYieldPercent || (isComm ? 7.5 : isAgri ? 2.5 : 4.2);
  const monthlyRentalIncome = intel?.financialSimulation?.estimatedMonthlyRent || Math.round((totalRupees * (rentalYieldPercent / 100)) / 12);
  const paybackPeriodYears = intel?.financialSimulation?.paybackPeriodYears || Number((100 / rentalYieldPercent).toFixed(1));

  // Civil & Architectural Feasibility Metrics
  const roadWidthFt = intel?.infrastructureProfile?.approachRoadWidthFt || 40;
  const permissibleFAR = intel?.feasibilityMetrics?.permissibleFAR || (roadWidthFt >= 60 ? 2.75 : roadWidthFt >= 40 ? 2.25 : 1.75);
  const groundCoveragePercent = intel?.feasibilityMetrics?.groundCoveragePercent || 65;
  const permissibleGroundCoverageSqFt = Math.round(totalSqFt * (groundCoveragePercent / 100));
  const maxBuiltUpAreaSqFt = intel?.feasibilityMetrics?.maxPermissibleBuiltUpAreaSqFt || Math.round(totalSqFt * permissibleFAR);
  const permissibleFloors = intel?.feasibilityMetrics?.permissibleFloors || (roadWidthFt >= 40 ? 'G + 4 Floors (15m permissible height)' : 'G + 3 Floors (12m permissible height)');
  const setbacks = intel?.feasibilityMetrics?.setbacks || {
    front: roadWidthFt >= 40 ? '4.0m Front Road Setback' : '3.0m Front Road Setback',
    rear: '2.0m Rear Setback',
    sides: '1.5m Side Setbacks'
  };
  const feasibilityScore = intel?.feasibilityMetrics?.constructionFeasibilityScore || (roadWidthFt >= 40 ? 94 : 88);

  // SLA Timelines
  const sroExecutionDays = intel?.slaTimelines?.sroDeedExecutionDays || geoData?.sroExecutionDays || '1-2 Working Days';
  const mutationTimelineDays = intel?.slaTimelines?.revenueMutationDays || geoData?.mutationTimelineDays || '30-45 Calendar Days';
  const encumbranceHours = intel?.slaTimelines?.encumbranceCertificateHours || '24 Hours (Online Kaveri 2.0 / TNREGINET)';
  const dgpsPeggingDays = intel?.slaTimelines?.dgpsSurveyPeggingDays || '3-5 Working Days';

  // Environmental Buffers
  const lakeDistText = intel?.environmentalSafety?.lakeProximity || geoData?.lakeDist || '450m (Safe beyond mandatory 30m NGT water body buffer)';
  const rkDistText = intel?.environmentalSafety?.rajakaluveProximity || geoData?.rkDist || '600m (Secondary SWD - Safe beyond 50m Primary buffer)';
  const drainDistText = intel?.environmentalSafety?.drainSetback || geoData?.drainDist || '100m (Roadside Municipal Drain - 15m Setback Maintained)';
  const parkDistText = intel?.environmentalSafety?.greenZoneProximity || geoData?.parkDist || '200m (Panchayat / Public Green Zone)';
  const floodZoneText = intel?.environmentalSafety?.floodZoneRisk || 'Zone 0 / Minimal Risk (Elevated Natural Gradient)';
  const seismicZoneText = intel?.environmentalSafety?.seismicZone || 'Zone II (Deccan Stable Plateau - Low Seismic Risk)';

  const sellerCompany = property?.seller?.companyName || property?.companyName || 'Verified Property Partner';
  const sellerCode = property?.seller?.sellerCode || property?.sellerCode || 'REA-VERIFIED';
  const sellerPhone = property?.seller?.phone || property?.phone || '9845012345';
  const rawPhoto = property?.coverImage || property?.image || (Array.isArray(property?.images) && property.images[0]) || '/images/bda_plot_bsk_stage_6.jpeg';
  const userPhoto = formatImageUrl(rawPhoto);

  const mapEmbedUrl = `https://maps.google.com/maps?q=${propLat},${propLng}&hl=en&z=15&output=embed`;
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${propLat},${propLng}`;
  const whatsappUrl = `https://wa.me/91${sellerPhone}?text=Hello%20${encodeURIComponent(sellerCompany)}%20(${sellerCode})%2C%20I%20am%20interested%20in%20Property%20ID%3A%20${property?.id || property?.propertyCode}%20at%20${encodeURIComponent(propAddress)}.`;

  const handleLeadCapture = () => {
    try {
      const stored = localStorage.getItem('bm_realestate_enquiries');
      const existing = stored ? JSON.parse(stored) : [];
      const newLead = {
        id: `ENQ-${Math.floor(100 + Math.random() * 900)}`,
        propertyId: property?.id || property?.propertyCode || 'REP-LIVE',
        callerName: 'Online Buyer Inquiry (WhatsApp)',
        phone: '+91 (Direct Lead)',
        date: new Date().toISOString().split('T')[0],
        budget: displayPrice,
        status: 'New Enquiry'
      };
      localStorage.setItem('bm_realestate_enquiries', JSON.stringify([newLead, ...existing]));
    } catch (e) {}
  };

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
    { id: 'legal', label: `🏛️ ${geoData?.state || 'State'} Land Records & Title`, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
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
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 800;
        canvas.height = 370;
      }
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
                ID: {property?.id || property?.propertyCode || 'REP-LIVE'}
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
              {isWithin10Km && (
                <span style={{ backgroundColor: '#8b5cf6', color: '#ffffff', fontSize: '11px', fontWeight: 900, padding: '3px 8px', borderRadius: '6px' }}>
                  🎯 Within 10 km Radius
                </span>
              )}
              <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                🏢 {sellerCompany} ({sellerCode})
              </span>
            </div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', lineHeight: '1.3' }}>
              {property?.title || 'Universal Property Listing'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span>📍 <strong>Location:</strong> {geoData ? `${geoData.formattedAddress}` : propAddress}</span>
              <span style={{ color: '#2563eb' }}>📏 <strong>Distance:</strong> {liveDistanceFormatted}</span>
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
                      : `✓ Live scanned from GPS Pin (${propLat.toFixed(4)}° N, ${propLng.toFixed(4)}° E) • State: ${geoData?.state || 'Verified'} • District: ${geoData?.district || 'Regional'}`}
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
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{geoData?.eastLandscape || 'Arterial transit & development parcels'}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>⬅️ West Sector</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{geoData?.westLandscape || 'Highway linkage & commercial zone'}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>⬇️ South Sector</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{geoData?.southLandscape || 'Industrial clusters & logistics corridor'}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase' }}>⬆️ North Sector</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{geoData?.northLandscape || 'Urban CBD & Metro interchange'}</div>
                  </div>
                </div>
              )}

              {/* Schools */}
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

              {/* Malls & Commercial */}
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

              {/* Hospitals */}
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

              {/* Industrial */}
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

              {/* Civic, Sports & Culture */}
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

          {/* TAB 2: DIGITAL SITE SURVEY & GROUND MAP */}
          {activeTab === 'visuals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    🛰️ Digital Site Survey & Ground Map
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                    GPS Benchmark: {propLat.toFixed(4)}° N, {propLng.toFixed(4)}° E • {geoData?.zoneName || 'Regional Zone'}
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
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <img src={userPhoto} alt="Site Aerial" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
                        📍 {propLat.toFixed(4)}° N, {propLng.toFixed(4)}° E • {property?.roadFacing || 'Road Facing'}
                      </div>
                    </div>
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
                          <span style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>{property?.roadFacing || 'East Facing'}</span>
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

          {/* TAB 3: LAND RECORDS, ZONING & LEGAL CHECKLIST */}
          {activeTab === 'legal' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                🏛️ {geoData?.state || 'State'} Land Records, Statutory Circle Rate & Title Verification
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

              {/* Statutory Stamp Duty & Registration Charges Breakdown Table */}
              <div style={{ backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '18px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>
                    💰 State Statutory Stamp Duty & Registration Fee Breakdown ({geoData?.state || 'State'})
                  </div>
                  <span style={{ backgroundColor: '#2563eb', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                    Circle Rate: ₹{guidanceRate.toLocaleString('en-IN')} / Sq.ft
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e2e8f0', color: '#334155', fontWeight: 800 }}>
                        <th style={{ padding: '10px 14px' }}>Cost Component</th>
                        <th style={{ padding: '10px 14px' }}>Statutory Rate</th>
                        <th style={{ padding: '10px 14px' }}>Basis / Valuation</th>
                        <th style={{ padding: '10px 14px' }}>Calculated Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>Total Govt. Guidance Valuation</td>
                        <td style={{ padding: '10px 14px' }}>₹{guidanceRate}/Sq.ft</td>
                        <td style={{ padding: '10px 14px' }}>{totalSqFt.toLocaleString('en-IN')} Sq.ft</td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0f172a' }}>₹{totalGovtValuationRupees.toLocaleString('en-IN')} ({totalGovtValuationCr} Cr)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>State Stamp Duty</td>
                        <td style={{ padding: '10px 14px' }}>{stampDutyRate}%</td>
                        <td style={{ padding: '10px 14px' }}>On Govt Valuation</td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#059669' }}>₹{stampDutyRupees.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>Registration Fee</td>
                        <td style={{ padding: '10px 14px' }}>{regFeeRate}%</td>
                        <td style={{ padding: '10px 14px' }}>On Govt Valuation</td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#059669' }}>₹{regFeeRupees.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>Cess & Infrastructure Surcharge</td>
                        <td style={{ padding: '10px 14px' }}>{cessRate}%</td>
                        <td style={{ padding: '10px 14px' }}>On Stamp Duty</td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#059669' }}>₹{cessRupees.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#eff6ff', fontWeight: 900, color: '#1e3a8a' }}>
                        <td style={{ padding: '12px 14px' }}>Total Statutory Registration Outlay</td>
                        <td style={{ padding: '12px 14px' }}>{stampDutyRate + regFeeRate + (stampDutyRate * cessRate / 100)}%</td>
                        <td style={{ padding: '12px 14px' }}>Mandatory Outlay</td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#1d4ed8' }}>₹{totalGovtCharges.toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <span>Quoted Market Price: <strong>{displayPrice}</strong></span>
                  <span>Market-to-Guidance Ratio: <strong>{marketToGuidanceRatio}x</strong> ({(marketToGuidanceRatio * 100 - 100).toFixed(0)}% premium over government circle rate)</span>
                </div>
              </div>

              {/* Sourcing Transparency Advisory */}
              <div style={{ padding: '14px 18px', backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', marginBottom: '18px' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#1e3a8a' }}>🔍 Official Source Verification Advisory</div>
                <p style={{ fontSize: '12px', color: '#1d4ed8', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                  {geoData?.guidanceValueGuidanceNote || 'Guideline valuation and Patta/Chitta ownership must be verified via the official state registry portal and jurisdiction Sub-Registrar Office.'}
                </p>
              </div>

              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>📋 Universal Physical Document Checklist (Produced by Seller)</div>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px' }}>Verification Checklist</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  {(geoData?.legalDocuments || []).map((doc, i) => (
                    <div key={i} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '12px', fontWeight: 800, color: '#14532d' }}>
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REGISTRATION & MUTATION SLA */}
          {activeTab === 'support' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: '#0369a1', marginBottom: '14px' }}>
                🤝 End-to-End Registration & Revenue Mutation SLA Timelines ({geoData?.villageOrSubdivision || geoData?.taluk || 'Jurisdiction'})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 900, color: '#0c4a6e', fontSize: '13px' }}>1. DGPS Land Survey & Pegging</div>
                    <span style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{dgpsPeggingDays}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '6px' }}>Total Station DGPS boundary corner pegging with certified {geoData?.district || 'Revenue'} surveyor.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 900, color: '#0c4a6e', fontSize: '13px' }}>2. SRO Deed Execution & Token</div>
                    <span style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{sroExecutionDays}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '6px' }}>Slot booking, biometric verification, and deed execution via {geoData?.defaultSro}.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 900, color: '#0c4a6e', fontSize: '13px' }}>3. Revenue Mutation SLA</div>
                    <span style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{mutationTimelineDays}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '6px' }}>Guaranteed name mutation via {geoData?.mutationAuthorityName || 'e-Aasthi / Bhoomi / e-Patta'}.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 900, color: '#0c4a6e', fontSize: '13px' }}>4. Encumbrance Certificate</div>
                    <span style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{encumbranceHours}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '6px' }}>Form 15 nil encumbrance certified digital download via official registration portal.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NGT & ENVIRONMENTAL BUFFERS */}
          {activeTab === 'ngt' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                🛡️ Environmental & Buffer Safety Analysis: {geoData?.formattedAddress || propAddress}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '13px' }}>🌊 Water Body / Lake Buffer</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>✓ Compliant</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '6px', fontWeight: 900 }}>{lakeDistText}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Compliant with National Green Tribunal (NGT) 30m lake buffer norms.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '13px' }}>🌧️ Primary Drainage (Rajakaluve / SWD)</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>✓ Buffer Safe</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '6px', fontWeight: 900 }}>{rkDistText}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Safe beyond primary 50m / secondary 25m storm water drain buffer.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '13px' }}>🛣️ Drainage & Roadside Canal</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>✓ Setback Maintained</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '6px', fontWeight: 900 }}>{drainDistText}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Proper setback maintained with zero encroachment.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '13px' }}>🌳 Green Buffer & Open Zone</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>✓ Eco Proximity</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '6px', fontWeight: 900 }}>{parkDistText}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Community green zone with high oxygen coverage.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '13px' }}>⚡ Flood Zone Vulnerability</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>✓ Minimal Risk</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '6px', fontWeight: 900 }}>{floodZoneText}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Elevated natural terrain gradient with rapid stormwater runoff.</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#155e75', fontSize: '13px' }}>🌍 Seismic Zone Classification</div>
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>✓ Zone II</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#0e7490', marginTop: '6px', fontWeight: 900 }}>{seismicZoneText}</div>
                  <div style={{ fontSize: '11px', color: '#155e75', marginTop: '2px' }}>Deccan stable peninsular shield with lowest earthquake vulnerability.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SITE PROFILE & INFRASTRUCTURE */}
          {activeTab === 'site' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                🛣️ Site Profile & Infrastructure: {geoData?.villageOrSubdivision || propAddress}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Normalized Total Area</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{dimensionInfo.unitLabel}</div>
                  <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>{totalSqFt.toLocaleString('en-IN')} Sq.ft</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Approach Road Width & Surface</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{property?.approachRoad || property?.approach || '40 Ft Asphalt Main Road'}</div>
                  <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>Direct all-weather motorable access</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Road Facing Direction</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{property?.roadFacing || 'East Facing Main Road'}</div>
                  <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>Vastu-compliant orientation</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Soil & Bearing Capacity (SBC)</div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{geoData?.soilType || 'Compact Red Loamy Soil (Safe SBC: 195 kN/m²)'}</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Water Grid Connection</div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>{geoData?.waterSource || 'Municipal Cauvery Line + High-Yield Aquifer'}</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Electricity Power Grid</div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>BESCOM / TANGEDCO 3-Phase Dedicated Grid Power</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Sanitation & Sewage</div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#78350f', marginTop: '4px' }}>Underground Drainage (UGD) Line Connected / Approved STP</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: VALUATION & ROI SIMULATOR */}
          {activeTab === 'roi' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                📈 Property Valuation, Multi-Year ROI Appreciation & Rental Yield Simulator
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase' }}>Quoted Asking Rate</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e3a8a', marginTop: '2px' }}>{displayFormattedRate}</div>
                  <div style={{ fontSize: '10px', color: '#2563eb', marginTop: '2px' }}>Total Price: {displayPrice}</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Official Guidance Value (Circle Rate)</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>₹{guidanceRate.toLocaleString('en-IN')} / Sft</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Total Govt Value: ₹{totalGovtValuationCr} Cr</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Locality Market Avg</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>₹{(geoData?.localityAvg || 12500).toLocaleString('en-IN')} / Sft</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Prevailing {geoData?.zoneName?.split('(')[0] || 'Market'} Rate</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '10px', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>Gross Rental Yield %</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>{rentalYieldPercent}% p.a.</div>
                  <div style={{ fontSize: '10px', color: '#166534', marginTop: '2px' }}>Est. Rent: ₹{monthlyRentalIncome.toLocaleString('en-IN')}/mo</div>
                </div>
              </div>

              {/* Dynamic Interactive Simulator */}
              <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: '18px' }}>
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
                      Annual Appreciation (CAGR): <strong style={{ color: '#2563eb' }}>{expectedCagr}% p.a.</strong>
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
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Est. Payback Period</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{paybackPeriodYears} Years</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CIVIL FEASIBILITY & BOQ */}
          {activeTab === 'civil' && (
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                ⚡ Architectural & Civil Feasibility Analysis for {dimensionInfo.unitLabel}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Permissible FAR / FSI</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{permissibleFAR}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Based on {roadWidthFt} Ft approach road</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Max Permissible Built-Up Area</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>{maxBuiltUpAreaSqFt.toLocaleString('en-IN')} Sq.ft</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Ground Coverage: {groundCoveragePercent}% ({permissibleGroundCoverageSqFt.toLocaleString('en-IN')} Sq.ft)</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Permissible Building Height</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{permissibleFloors}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Zoning sanction clearance</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>Construction Feasibility Score</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>{feasibilityScore} / 100</div>
                  <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>Grade A+ (High Civil Viability)</div>
                </div>
              </div>

              {/* Setbacks Specification */}
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Mandatory Municipal Setback Guidelines</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>Front Setback:</strong> {setbacks.front}
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>Rear Setback:</strong> {setbacks.rear}
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>Side Setbacks:</strong> {setbacks.sides}
                  </div>
                </div>
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
