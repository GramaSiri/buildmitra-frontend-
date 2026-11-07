import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropertyIntelligenceModal from '../components/PropertyIntelligenceModal';
import InteractivePinpointMap from '../components/InteractivePinpointMap';
import { autoResolvePropertyGeoData } from '../utils/geoResolver';
import { calculateHaversineKm } from '../utils/universalGeoEngine';
import { getApiBase } from '../utils/apiConfig';
import { authFetch } from '../utils/authFetch';
import { formatImageUrl } from '../services/propertyService';

export interface PropertyItem {
  id: string;
  propertyCode?: string;
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
  approachRoad?: string;
  roadFacing: string;
  zoning: string;
  sroOffice: string;
  guidanceValue: number;
  image: string;
  images?: string[];
  tag: string;
  seller?: {
    companyName: string;
    sellerCode: string;
    phone: string;
  };
  intelligence?: any;
  distanceFromUserKm?: number | null;
}

export const RealEstateHubPage: React.FC = () => {
  // Instant Initial Hydration from cached database listings
  const [properties, setProperties] = useState<PropertyItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('realestate_properties');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Strip any obsolete mock entries
            const valid = parsed.filter(
              (p: any) =>
                p &&
                p.id &&
                !p.id.includes('AGRI-00912') &&
                !p.id.includes('IND-00441') &&
                !p.id.includes('REV-00812') &&
                !p.id.includes('MEDIA-089122')
            );
            if (valid.length > 0) return valid;
          }
        }
      } catch (e) {}
    }
    return [];
  });

  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  // User Live Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filterWithin10Km, setFilterWithin10Km] = useState<boolean>(false);

  // Search & Filters
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [budgetRange, setBudgetRange] = useState<string>('ALL');
  const [transactionFilter, setTransactionFilter] = useState<string>('ALL');

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

  // 1. Acquire User Geolocation Gracefully
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  // 2. Fetch Live Properties from Backend API (/api/realestate/public)
  const fetchPublicProperties = useCallback(async (userLat?: number, userLng?: number) => {
    try {
      setIsLoadingApi(true);
      const apiBase = getApiBase();
      const queryParams = new URLSearchParams();
      if (typeof userLat === 'number' && typeof userLng === 'number') {
        queryParams.set('userLat', String(userLat));
        queryParams.set('userLng', String(userLng));
      }

      const url = `${apiBase}/api/realestate/public${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await authFetch(url);
      const data = await res.json();

      if (data && data.success && Array.isArray(data.properties) && data.properties.length > 0) {
        const mappedFromBackend: PropertyItem[] = data.properties.map((p: any) => {
          const rawImg = p.coverImage || (Array.isArray(p.images) && p.images[0]) || p.imageUrl || p.image || '';
          return {
            id: p.propertyCode || p._id || p.id,
            propertyCode: p.propertyCode || p.id,
            title: p.title || 'Property',
            location: p.locality || p.city || p.location || p.address || 'Bengaluru',
            lat: Number(p.lat || p.latitude) || 12.8718,
            lng: Number(p.lng || p.longitude) || 77.5753,
            type: p.listingType || (String(p.transactionType || '').toLowerCase().includes('buy') ? 'Buy Requirement' : 'Sale'),
            listingType: p.listingType || (String(p.transactionType || '').toLowerCase().includes('buy') ? 'Buy Requirement' : 'Sale'),
            propertyType: p.propertyType || 'Plot',
            price: p.price || (typeof p.totalAmount === 'number' ? `₹${(p.totalAmount / 10000000).toFixed(2)} Cr` : '₹1.50 Cr'),
            priceNum: Number(p.priceNum) || (p.totalAmount ? Math.round(p.totalAmount / 100000) : 150),
            rate: p.displayFormattedRate || p.rate || `₹${p.ratePerSqFt || p.pricePerSqft || 12500} / Sq.ft`,
            bhk: p.propertyType?.toLowerCase().includes('plot') ? 'Plot' : p.bhk || '3 BHK',
            dimensions: p.dimensions || `${p.area || 1200} sqft`,
            approach: p.approachRoad || p.approach || '40 Ft Asphalt',
            approachRoad: p.approachRoad || p.approach || '40 Ft Asphalt',
            roadFacing: p.roadFacing || p.facing || 'East Facing Main Road',
            zoning: p.zoning || p.approvalType || 'BDA Approved',
            sroOffice: p.sroOffice || (p.intelligence?.jurisdiction?.defaultSro) || 'SRO JP Nagar',
            guidanceValue: Number(p.guidanceValue) || (p.intelligence?.guidelineValuation?.guidanceRatePerSqFt) || 6800,
            image: formatImageUrl(rawImg),
            images: Array.isArray(p.images) ? p.images.map((img: string) => formatImageUrl(img)) : [formatImageUrl(rawImg)],
            tag: p.tag || (String(p.transactionType || '').toLowerCase().includes('requirement') ? '📋 Verified Requirement' : '✓ Live Verified Listing'),
            seller: p.seller || {
              companyName: p.providerName || 'BuildMitra Verified Partner',
              sellerCode: p.providerUserCode || 'REA-VERIFIED',
              phone: p.providerPhone || '9845012345'
            },
            intelligence: p.intelligence || null
          };
        });

        // Store authentic database properties without mock placeholders
        const idSet = new Set<string>();
        const uniqueList: PropertyItem[] = [];

        for (const item of mappedFromBackend) {
          if (!idSet.has(item.id)) {
            idSet.add(item.id);
            uniqueList.push(item);
          }
        }

        setProperties(uniqueList);
        if (typeof window !== 'undefined') {
          localStorage.setItem('realestate_properties', JSON.stringify(uniqueList));
        }
      }
    } catch (err) {
      console.log('Public realestate fetch error, using client cache:', err);
    } finally {
      setIsLoadingApi(false);
    }
  }, []);

  // Fetch when mounted or when userLocation becomes available
  useEffect(() => {
    fetchPublicProperties(userLocation?.lat, userLocation?.lng);
  }, [fetchPublicProperties, userLocation?.lat, userLocation?.lng]);

  // Real-time listener for seamless synchronization from User Dashboard & cross-tabs
  useEffect(() => {
    const handleSync = () => {
      fetchPublicProperties(userLocation?.lat, userLocation?.lng);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('bm_property_saved', handleSync);
      window.addEventListener('storage', handleSync);
      window.addEventListener('focus', handleSync);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('bm_property_saved', handleSync);
        window.removeEventListener('storage', handleSync);
        window.removeEventListener('focus', handleSync);
      }
    };
  }, [fetchPublicProperties, userLocation?.lat, userLocation?.lng]);

  // Fetch when mounted or when userLocation becomes available
  useEffect(() => {
    fetchPublicProperties(userLocation?.lat, userLocation?.lng);
  }, [fetchPublicProperties, userLocation?.lat, userLocation?.lng]);

  const handleMapLocationSelect = useCallback((newLat: number, newLng: number, addressText: string) => {
    setLat(newLat);
    setLng(newLng);
    setLocation(addressText);
    const geo = (autoResolvePropertyGeoData as any)(addressText, title, newLat, newLng);
    setAutoSro(geo.defaultSro);
    setAutoGuidance(geo.guidanceValue);
  }, [title]);

  const openPostModal = useCallback((propToEdit?: PropertyItem) => {
    if (propToEdit) {
      setEditingPropertyId(propToEdit.id);
      setTitle(propToEdit.title);
      setLocation(propToEdit.location);
      setLat(propToEdit.lat || 12.8718);
      setLng(propToEdit.lng || 77.5753);
      setPropertyType(propToEdit.propertyType || 'BDA Plot');
      setListingType(propToEdit.listingType || 'Sale');
      setDimensions(propToEdit.dimensions);
      setApproachRoad(propToEdit.approach || propToEdit.approachRoad || '40 Ft Asphalt');
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
  }, []);

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const pid = editingPropertyId || `REP-${Math.floor(100000 + Math.random() * 900000)}`;
    const priceNumeric = priceUnit === 'Cr' ? parseFloat(price) * 100 : parseFloat(price) || 50;
    const resolvedImg = uploadedImage || (editingPropertyId ? (properties.find(p => p.id === editingPropertyId)?.image || '') : '') || '/images/bda_plot_bsk_stage_6.jpeg';

    const newProp: PropertyItem = {
      id: pid,
      propertyCode: pid,
      title: title || `${propertyType} in ${location}`,
      location,
      lat,
      lng,
      type: listingType.includes('Requirement') ? 'Buy Requirement' : propertyType.includes('Plot') || propertyType.includes('Land') || propertyType.includes('Site') ? 'Plot' : 'Buy',
      listingType,
      propertyType,
      price: `₹${price} ${priceUnit}`,
      priceNum: priceNumeric,
      rate: `₹${ratePerSqFt} / Sq.ft`,
      bhk: propertyType.toLowerCase().includes('plot') ? 'Plot' : propertyType.toLowerCase().includes('land') ? 'Land' : '3 BHK',
      dimensions,
      approach: approachRoad,
      approachRoad,
      roadFacing,
      zoning,
      sroOffice: autoSro,
      guidanceValue: autoGuidance,
      image: formatImageUrl(resolvedImg),
      tag: listingType.includes('Requirement') ? '📋 Verified Requirement' : '✓ Live Pinpointed Listing',
      seller: { companyName: 'BuildMitra Verified Seller', sellerCode: 'USR-LIVE', phone: '9845012345' }
    };

    // Optimistic UI update
    let updatedList: PropertyItem[];
    if (editingPropertyId) {
      updatedList = properties.map((p) => (p.id === editingPropertyId ? newProp : p));
    } else {
      updatedList = [newProp, ...properties];
    }
    setProperties(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('realestate_properties', JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('bm_property_saved', { detail: newProp }));
    }
    setIsPostModalOpen(false);

    // Save to MongoDB via backend API
    try {
      const apiBase = getApiBase();
      const postUrl = editingPropertyId ? `${apiBase}/api/realestate/code/${encodeURIComponent(editingPropertyId)}` : `${apiBase}/api/realestate`;
      const postMethod = editingPropertyId ? 'PUT' : 'POST';

      await authFetch(postUrl, {
        method: postMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProp,
          propertyCode: pid,
          price: priceUnit === 'Cr' ? parseFloat(price) * 10000000 : parseFloat(price) * 100000,
          askingPrice: priceUnit === 'Cr' ? parseFloat(price) * 10000000 : parseFloat(price) * 100000,
          totalAmount: priceUnit === 'Cr' ? parseFloat(price) * 10000000 : parseFloat(price) * 100000,
          coverImage: resolvedImg,
          image: resolvedImg,
          images: resolvedImg ? [resolvedImg] : [],
          imageUrls: resolvedImg ? [resolvedImg] : [],
          latitude: lat,
          longitude: lng,
          approachRoad,
          roadFacing,
          zoning,
          sroOffice: autoSro,
          guidanceValue: autoGuidance
        })
      });
      fetchPublicProperties(userLocation?.lat, userLocation?.lng);
    } catch (saveErr) {
      console.log('Background save to cloud error:', saveErr);
    }
  };

  const handleImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) setUploadedImage(result);
      };
      reader.readAsDataURL(files[0]);
    }
  }, []);

  // Compute live distance & filter with useMemo
  const filteredProperties = useMemo(() => {
    return properties
      .map((p) => {
        const distKm = userLocation
          ? calculateHaversineKm(userLocation.lat, userLocation.lng, p.lat, p.lng)
          : null;
        return {
          ...p,
          distanceFromUserKm: distKm
        };
      })
      .filter((p) => {
        const locMatch =
          searchLocation === '' ||
          p.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
          p.title.toLowerCase().includes(searchLocation.toLowerCase()) ||
          p.id.toLowerCase().includes(searchLocation.toLowerCase());

        const catMatch =
          selectedCategory === 'ALL' ||
          p.propertyType.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(p.propertyType.toLowerCase());

        let txMatch = true;
        if (transactionFilter === 'Sale') {
          txMatch = p.listingType?.toLowerCase().includes('sale') && !p.listingType?.toLowerCase().includes('requirement');
        } else if (transactionFilter === 'Rent') {
          txMatch = p.listingType?.toLowerCase().includes('rent') && !p.listingType?.toLowerCase().includes('requirement');
        } else if (transactionFilter === 'Requirement') {
          txMatch = p.listingType?.toLowerCase().includes('requirement') || p.type?.toLowerCase().includes('requirement') || p.tag?.toLowerCase().includes('requirement');
        }

        let budgetMatch = true;
        if (budgetRange === 'under_50l') budgetMatch = p.priceNum <= 50;
        else if (budgetRange === '50l_1cr') budgetMatch = p.priceNum > 50 && p.priceNum <= 100;
        else if (budgetRange === '1cr_3cr') budgetMatch = p.priceNum > 100 && p.priceNum <= 300;
        else if (budgetRange === 'above_3cr') budgetMatch = p.priceNum > 300;

        let radialMatch = true;
        if (filterWithin10Km && p.distanceFromUserKm !== null && p.distanceFromUserKm !== undefined) {
          radialMatch = p.distanceFromUserKm <= 10.0;
        }

        return locMatch && catMatch && budgetMatch && radialMatch && txMatch;
      });
  }, [properties, userLocation, searchLocation, selectedCategory, budgetRange, transactionFilter, filterWithin10Km]);

  const propertiesWithin10KmCount = useMemo(() => {
    if (!userLocation) return 0;
    return properties.filter((p) => {
      const d = calculateHaversineKm(userLocation.lat, userLocation.lng, p.lat, p.lng);
      return d <= 10.0;
    }).length;
  }, [properties, userLocation]);

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      
      {/* Top Banner */}
      <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '28px 32px', borderRadius: '20px', marginBottom: '24px', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.15)', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#2563eb', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                BuildMitra Verified Real Estate Hub
              </span>
              <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                {filteredProperties.length} Properties Active
              </span>
              {userLocation && (
                <span style={{ backgroundColor: '#8b5cf6', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                  📍 GPS Active ({userLocation.lat.toFixed(2)}° N, {userLocation.lng.toFixed(2)}° E)
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '10px 0 6px 0', letterSpacing: '-0.02em' }}>
              Verified Real Estate, Land & Intelligence Hub
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, maxWidth: '800px' }}>
              Browse BDA Plots, Farmland, KIADB Industrial Lands, Revenue & Gramatana Sites with instant 10 km radial proximity, SRO jurisdiction, guideline values, and civil feasibility.
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>📍 Locality / Pin / Title</label>
            <input
              type="text"
              placeholder="e.g. BSK 6th Stage, Sarjapur, Kengeri, Devanahalli..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>🔄 Listing / Requirement</label>
            <select
              value={transactionFilter}
              onChange={(e) => setTransactionFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }}
            >
              <option value="ALL">All Listings & Requirements</option>
              <option value="Sale">🏷️ Properties for Sale</option>
              <option value="Rent">🔑 Properties for Rent</option>
              <option value="Requirement">📋 Buy / Sell Requirements</option>
            </select>
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

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>🧭 Proximity Radius</label>
            <button
              onClick={() => setFilterWithin10Km(!filterWithin10Km)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: filterWithin10Km ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: filterWithin10Km ? '#f5f3ff' : '#f8fafc',
                color: filterWithin10Km ? '#6d28d9' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{filterWithin10Km ? '🎯' : '🌐'}</span>
              <span>{filterWithin10Km ? 'Within 10 km Active' : `Within 10 km (${propertiesWithin10KmCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
        {filteredProperties.map((property) => {
          const hasUserDist = property.distanceFromUserKm !== null && property.distanceFromUserKm !== undefined;
          const isNear = hasUserDist && property.distanceFromUserKm! <= 10.0;

          return (
            <div
              key={property.id}
              onClick={() => setSelectedProperty(property)}
              style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'transform 0.15s ease' }}
            >
              <div style={{ position: 'relative', height: '230px', backgroundColor: '#0f172a' }}>
                <img
                  src={formatImageUrl(property.image)}
                  alt={property.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = '/images/bda_plot_bsk_stage_6.jpeg';
                  }}
                />
                <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '5px 10px', borderRadius: '8px' }}>
                  {property.propertyType} • {property.listingType}
                </span>

                {hasUserDist && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: isNear ? '#7c3aed' : 'rgba(15,23,42,0.85)', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '5px 10px', borderRadius: '8px', backdropFilter: 'blur(4px)' }}>
                    {isNear ? `🎯 Within 10 km (${property.distanceFromUserKm!.toFixed(1)} km)` : `📍 ${property.distanceFromUserKm!.toFixed(1)} km away`}
                  </span>
                )}

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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(130px, 100%), 1fr))', gap: '8px', margin: '14px 0' }}>
                    <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>Area / Dims</span>
                      <strong style={{ color: '#0f172a' }}>{property.dimensions}</strong>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>Facing / Road</span>
                      <strong style={{ color: '#0f172a' }}>{property.roadFacing || 'Road Facing'}</strong>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>SRO Jurisdiction</span>
                      <strong style={{ color: '#059669' }}>{property.sroOffice || 'Verified SRO'}</strong>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>Govt. Guidance</span>
                      <strong style={{ color: '#0f172a' }}>₹{property.guidanceValue?.toLocaleString('en-IN') || 6800}/Sft</strong>
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '14px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>{property.price}</div>
                    <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>{property.rate}</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View Intelligence →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProperties.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>No Properties Matched Your Filter</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Try clearing your search query or expanding the proximity filter.</p>
          <button
            onClick={() => { setSearchLocation(''); setSelectedCategory('ALL'); setBudgetRange('ALL'); setFilterWithin10Km(false); }}
            style={{ marginTop: '14px', padding: '8px 16px', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '12px', fontWeight: 800, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            Reset Filters
          </button>
        </div>
      )}

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
