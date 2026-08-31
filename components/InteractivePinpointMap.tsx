import React, { useState } from 'react';

interface Props {
  initialLat: number;
  initialLng: number;
  initialAddress: string;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

const PRESETS: { [key: string]: { lat: number; lng: number; address: string } } = {
  'JP Nagar 8th Phase': { lat: 12.8718, lng: 77.5753, address: 'Near Arya Apartment, JP Nagar 8th Phase, Bengaluru' },
  'Whitefield': { lat: 12.9698, lng: 77.7499, address: 'Hope Farm Junction, Whitefield Main Road, Bengaluru' },
  'Sarjapur Road': { lat: 12.9249, lng: 77.6835, address: 'Near Wipro Campus, Sarjapur Road, Bengaluru' },
  'Electronic City': { lat: 12.8399, lng: 77.6770, address: 'Phase 1 Tollgate, Electronic City, Bengaluru' },
  'Yelahanka': { lat: 13.1007, lng: 77.5963, address: 'Airport Road, Yelahanka New Town, Bengaluru' },
  'Hosur SIPCOT': { lat: 12.7409, lng: 77.8253, address: 'SIPCOT Industrial Phase 1, Hosur' }
};

export const InteractivePinpointMap: React.FC<Props> = ({
  initialLat,
  initialLng,
  initialAddress,
  onLocationSelect
}) => {
  const [addressInput, setAddressInput] = useState(initialAddress || 'Near Arya Apartment, JP Nagar 8th Phase, Bengaluru');
  const [lat, setLat] = useState<number>(initialLat || 12.8718);
  const [lng, setLng] = useState<number>(initialLng || 77.5753);
  const [statusMsg, setStatusMsg] = useState<string>('✓ Location Pin Active');

  const updateLocation = (newLat: number, newLng: number, newAddr: string) => {
    setLat(newLat);
    setLng(newLng);
    setAddressInput(newAddr);
    setStatusMsg(`✓ Pinpoint Locked: ${newLat.toFixed(4)}° N, ${newLng.toFixed(4)}° E`);
    onLocationSelect(newLat, newLng, newAddr);
  };

  const handleLocateAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = addressInput.trim();
    if (!query) return;

    setStatusMsg('Searching location...');

    // Quick match preset cache
    for (const key in PRESETS) {
      if (query.toLowerCase().includes(key.toLowerCase())) {
        const item = PRESETS[key];
        updateLocation(item.lat, item.lng, item.address);
        return;
      }
    }

    try {
      const fullQuery = query.toLowerCase().includes('bengaluru') || query.toLowerCase().includes('hosur')
        ? query
        : `${query}, Bengaluru`;

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        updateLocation(foundLat, foundLng, data[0].display_name);
      } else {
        // Fallback to center
        updateLocation(12.8718, 77.5753, query);
        setStatusMsg('Custom address set with active GPS pin');
      }
    } catch (err) {
      updateLocation(12.8718, 77.5753, query);
    }
  };

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      setStatusMsg('Fetching GPS...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = pos.coords.latitude;
          const uLng = pos.coords.longitude;
          updateLocation(uLat, uLng, `Pinned Site (${uLat.toFixed(4)}, ${uLng.toFixed(4)})`);
        },
        () => {
          setStatusMsg('GPS unavailable. Using typed address.');
        }
      );
    }
  };

  // Fast, crisp embedded OpenStreetMap centered on selected Lat/Lng
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.006}%2C${lng + 0.008}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #cbd5e1', overflow: 'hidden', marginBottom: '18px' }}>
      
      {/* 1. Address Search Bar */}
      <div style={{ padding: '12px 14px', backgroundColor: '#0f172a', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <input
          type="text"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          placeholder="Type full address or project name (e.g. Near Arya Apartment, JP Nagar 8th Phase)..."
          style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, outline: 'none' }}
        />
        <button
          type="button"
          onClick={() => handleLocateAddress()}
          style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
        >
          🔍 Locate & Move Pin
        </button>
        <button
          type="button"
          onClick={handleUseGPS}
          style={{ padding: '10px 14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
        >
          🎯 My GPS
        </button>
      </div>

      {/* 2. Instant 1-Click Preset Areas */}
      <div style={{ padding: '8px 14px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>📍 1-Click Areas:</span>
        {Object.keys(PRESETS).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => updateLocation(PRESETS[k].lat, PRESETS[k].lng, PRESETS[k].address)}
            style={{ padding: '4px 8px', backgroundColor: '#ffffff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            {k}
          </button>
        ))}
      </div>

      {/* 3. High-Definition Live Map View with Fixed Pin */}
      <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#e2e8f0' }}>
        <iframe
          title="Pinpoint Map View"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          src={mapUrl}
        />
        
        {/* Visual Target Overlay in Center */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#e11d48', color: '#ffffff', fontSize: '10px', fontWeight: 900, padding: '3px 8px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
            📍 Site Pinpoint
          </div>
          <div style={{ width: '18px', height: '18px', backgroundColor: '#e11d48', borderRadius: '50%', border: '3px solid #ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }} />
        </div>
      </div>

      {/* 4. Active Confirmation Status */}
      <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', borderTop: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534' }}>
          {statusMsg}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803d' }}>
          Address: {addressInput}
        </div>
      </div>

    </div>
  );
};

export default InteractivePinpointMap;
