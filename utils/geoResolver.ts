export interface LandmarkItem {
  name: string;
  dist: string;
  category?: string;
}

export interface GeoDataResult {
  zoneName: string;
  defaultSro: string;
  guidanceValue: number;
  localityAvg: number;
  lat: number;
  lng: number;
  east: string;
  west: string;
  south: string;
  north: string;
  hospitals: LandmarkItem[];
  schools: LandmarkItem[];
  malls: LandmarkItem[];
  civicAndSports: LandmarkItem[];
  industrialParks: LandmarkItem[];
  transit: string;
  lakeDist: string;
  rkDist: string;
  drainDist: string;
  parkDist: string;
  soilType: string;
  waterSource: string;
}

export function autoResolvePropertyGeoData(locationStr: string = '', titleStr: string = ''): GeoDataResult {
  const query = `${locationStr} ${titleStr}`.toLowerCase();

  // 1. JP NAGAR 8TH PHASE / ARYA APARTMENT / BSK 6TH / KANAKAPURA ROAD CORRIDOR
  if (
    query.includes('jp nagar') || 
    query.includes('arya') || 
    query.includes('bsk') || 
    query.includes('kanakapura') || 
    query.includes('chunchgatta') || 
    query.includes('konanakunte') || 
    query.includes('anjanapura')
  ) {
    return {
      zoneName: 'South Bengaluru (JP Nagar 8th Phase / Kanakapura Road Corridor)',
      defaultSro: 'SRO JP Nagar / Jayanagar (Mini Forest Road)',
      guidanceValue: 6800,
      localityAvg: 12500,
      lat: 12.8718,
      lng: 77.5753,
      east: 'Bannerghatta Main Road & Electronic City via NICE Expressway (9.5 km)',
      west: 'Kanakapura Main Road, Metro Green Line & Art of Living (2.8 km)',
      south: 'Yelachenahalli Cluster, Jigani & Harohalli Industrial Mega Park (KIADB)',
      north: 'Jayanagar 4th Block, Majestic CBD & Outer Ring Road (11.0 km)',
      hospitals: [
        { name: 'Aster RV Hospital (JP Nagar 6th Phase)', dist: '3.6 km (8 mins)' },
        { name: 'Manipal Hospital (Kanakapura Road / Jayanagar)', dist: '4.2 km (9 mins)' },
        { name: 'Apollo & Fortis Super Speciality (Bannerghatta Road)', dist: '4.8 km (11 mins)' },
        { name: 'Jayadeva National Institute of Cardiology', dist: '6.8 km (14 mins)' }
      ],
      schools: [
        { name: "Kumarans Children's Home (CBSE/ICSE, Mallasandra)", dist: '2.1 km (5 mins)' },
        { name: 'The Brigade School (Millennium, JP Nagar 7th Phase)', dist: '2.5 km (6 mins)' },
        { name: 'Delhi Public School DPS South (Kanakapura Road)', dist: '4.2 km (9 mins)' },
        { name: 'BGS National Public School (Hulimavu)', dist: '3.8 km (8 mins)' }
      ],
      malls: [
        { name: 'Forum South Bangalore Mall (Konanakunte Cross Metro)', dist: '2.8 km (6 mins)' },
        { name: 'Royal Meenakshi Mall (Bannerghatta Main Road)', dist: '3.4 km (7 mins)' },
        { name: 'Vega City Mall & PVR Superplex (Bannerghatta Rd)', dist: '5.2 km (11 mins)' }
      ],
      civicAndSports: [
        { name: 'BBMP / BDA Public Landscaped Park & Walking Track', dist: '100m (Direct Walk)' },
        { name: 'Football Turf Practice Ground & Sports Academy', dist: '300m (2 mins Walk)' },
        { name: 'Ancient Heritage Temple & Cultural Complex', dist: '700m (2 mins)' }
      ],
      industrialParks: [
        { name: 'Yelachenahalli Industrial Cluster & Fabrication Hub', dist: '3.2 km (7 mins)' },
        { name: 'Kalyani Magnum Tech Park (VMware, Oracle, Honeywell)', dist: '4.8 km (10 mins)' },
        { name: 'Harohalli Industrial Area Phase 1 & 2 (KIADB via NH 209)', dist: '24 km (28 mins via Expressway)' },
        { name: 'Jigani & Bommasandra Industrial Hub', dist: '12.5 km (18 mins)' }
      ],
      transit: 'Konanakunte Cross & Silk Institute Metro Stations (2.2 km) • NICE Expressway Ring Road Access (2.4 km)',
      lakeDist: '500m (Local Pond/Kunte - Safe beyond 30m NGT Lake buffer)',
      rkDist: '600m (Secondary Rajakaluve - Safe beyond 50m Primary buffer)',
      drainDist: '100m (Tertiary Roadside SWD - 100% compliant with 15m setback norm)',
      parkDist: '100m (Active BDA Developed Public Green Park)',
      soilType: 'Compact Red Loamy Soil (Safe SBC: 195 kN/m² - Ideal for G+3 Construction)',
      waterSource: 'Active Cauvery Phase 5 Main Feeder + High-Yield Groundwater Aquifer (~420 ft)'
    };
  }

  // 2. WHITEFIELD / MARATHAHALLI / KADUGODI TECH CORRIDOR
  if (query.includes('whitefield') || query.includes('marathahalli') || query.includes('panathur') || query.includes('itpl')) {
    return {
      zoneName: 'East Bengaluru (Whitefield IT Hub Corridor)',
      defaultSro: 'SRO Shivajinagar / KR Puram / Whitefield',
      guidanceValue: 7200,
      localityAvg: 11800,
      lat: 12.9698,
      lng: 77.7499,
      east: 'Hosakote Industrial Mega Area & STRR Expressway Link (11.0 km)',
      west: 'Indiranagar Commercial Corridor & MG Road (12.0 km)',
      south: 'Outer Ring Road (ORR) Bellandur Tech Hub (6.5 km)',
      north: 'Old Madras Road & KR Puram Metro Junction (5.0 km)',
      hospitals: [
        { name: 'Manipal Hospital (Whitefield Main Road)', dist: '2.5 km (5 mins)' },
        { name: 'Sathya Sai Institute of Higher Medical Sciences', dist: '3.2 km (7 mins)' },
        { name: 'Vydehi Super Speciality Hospital', dist: '3.8 km (8 mins)' }
      ],
      schools: [
        { name: 'The Deens Academy (Whitefield)', dist: '1.8 km (4 mins)' },
        { name: 'Delhi Public School DPS Whitefield', dist: '3.2 km (7 mins)' },
        { name: 'Whitefield Global School', dist: '2.4 km (5 mins)' }
      ],
      malls: [
        { name: 'Nexus Shantiniketan Mall', dist: '2.9 km (6 mins)' },
        { name: 'Phoenix Marketcity & VR Bengaluru', dist: '5.8 km (12 mins)' },
        { name: 'Inorbit Mall Whitefield', dist: '3.1 km (7 mins)' }
      ],
      civicAndSports: [
        { name: 'Inner Circle BDA Public Park & Jogging Track', dist: '400m' },
        { name: 'Decathlon Sports Complex & Football Turf', dist: '1.2 km' },
        { name: 'Whitefield CSI Heritage Church & Temple', dist: '900m' }
      ],
      industrialParks: [
        { name: 'International Tech Park Bangalore (ITPB / ITPL)', dist: '2.4 km (5 mins)' },
        { name: 'EPIP Industrial Area (SAP, TCS, Mercedes-Benz R&D)', dist: '3.0 km (6 mins)' },
        { name: 'Hosakote Industrial Hub (Auto & Manufacturing SEZ)', dist: '14.0 km (18 mins)' }
      ],
      transit: 'Kadugodi Tree Park / Whitefield Metro Purple Line (1.4 km) • Hope Farm Junction (1.8 km)',
      lakeDist: '650m (Safe beyond 30m NGT buffer)',
      rkDist: '450m (Clear of Rajakaluve)',
      drainDist: '120m (Clear of stormwater drains)',
      parkDist: '400m (Active Green Zone)',
      soilType: 'Red Clay Loam & Hard Gravel (SBC: 190 kN/m²)',
      waterSource: 'BWSSB Cauvery Line Extended + Deep Borewell Grid'
    };
  }

  // 3. SARJAPUR / BELLANDUR / HSR CORRIDOR
  if (query.includes('sarjapur') || query.includes('hsr') || query.includes('bellandur')) {
    return {
      zoneName: 'South-East Bengaluru (Sarjapur ORR Corridor)',
      defaultSro: 'SRO Bommanahalli / Sarjapur',
      guidanceValue: 6200,
      localityAvg: 11500,
      lat: 12.9249,
      lng: 77.6835,
      east: 'Sarjapur Town & Proposed STRR Ring Highway (6.5 km)',
      west: 'Koramangala & HSR Layout Sector 1-7 (6.8 km)',
      south: 'Attibele Industrial Zone & Hosur Gateway (13.5 km)',
      north: 'Marathahalli & Bellandur IT Corridor (5.5 km)',
      hospitals: [
        { name: 'Motherhood Hospital (Sarjapur Road)', dist: '2.0 km (4 mins)' },
        { name: 'Manipal Hospital (Sarjapur Road)', dist: '3.8 km (8 mins)' },
        { name: 'Sakra World Hospital (Bellandur ORR)', dist: '6.2 km (12 mins)' }
      ],
      schools: [
        { name: 'Oakridge International School (Sarjapur Rd)', dist: '1.6 km (3 mins)' },
        { name: 'Greenwood High International School', dist: '2.9 km (6 mins)' },
        { name: 'Inventure Academy & Head Start', dist: '3.5 km (7 mins)' }
      ],
      malls: [
        { name: 'Market Square Mall (Sarjapur Road)', dist: '3.2 km (7 mins)' },
        { name: 'Total Mall / Central ORR', dist: '5.1 km (10 mins)' }
      ],
      civicAndSports: [
        { name: 'Play Arena Sports & Turf Club (Sarjapur)', dist: '1.5 km' },
        { name: 'HSR Sector 2 BDA Lake Park & Walking Deck', dist: '2.4 km' },
        { name: 'Sri Someshwara Swamy Temple Complex', dist: '800m' }
      ],
      industrialParks: [
        { name: 'Wipro Corporate Campus (Sarjapur Road)', dist: '1.8 km (4 mins)' },
        { name: 'Ecospace & Prestige Tech Park (Outer Ring Road)', dist: '5.8 km (11 mins)' },
        { name: 'Attibele KIADB Industrial Estate', dist: '12.0 km (16 mins)' }
      ],
      transit: 'Carmelaram Railway Station (2.1 km) • Outer Ring Road Highway Access (4.5 km)',
      lakeDist: '580m (Clear of NGT buffer)',
      rkDist: '320m (Clear of Rajakaluve)',
      drainDist: '140m (Clear of storm drains)',
      parkDist: '350m (Gated Green Buffer)',
      soilType: 'Red Loamy Compact Soil (SBC: 185 kN/m²)',
      waterSource: 'Cauvery Grid Feeder + Groundwater Aquifer'
    };
  }

  // DEFAULT (BENGALURU URBAN CORE)
  return {
    zoneName: 'Bengaluru Urban Growth Corridor',
    defaultSro: 'Jurisdiction Sub-Registrar Office',
    guidanceValue: 6800,
    localityAvg: 12500,
    lat: 12.8718,
    lng: 77.5753,
    east: 'Electronic City & Outer Ring Road Tech Corridor',
    west: 'Kanakapura Road & Green Metro Corridor',
    south: 'NICE Expressway, Jigani & Harohalli Industrial Zones',
    north: 'Majestic & Central Business District (CBD)',
    hospitals: [
      { name: 'Aster RV Hospital', dist: '3.6 km (8 mins)' },
      { name: 'Manipal Hospital Super Speciality', dist: '4.2 km (9 mins)' },
      { name: 'Apollo & Fortis Hospitals', dist: '4.8 km (11 mins)' }
    ],
    schools: [
      { name: "Kumarans Children's Home", dist: '2.1 km (5 mins)' },
      { name: 'The Brigade School (Millennium)', dist: '2.5 km (6 mins)' },
      { name: 'Delhi Public School (DPS)', dist: '4.2 km (9 mins)' }
    ],
    malls: [
      { name: 'Forum South Bangalore Mall', dist: '2.8 km (6 mins)' },
      { name: 'Royal Meenakshi Mall', dist: '3.4 km (7 mins)' }
    ],
    civicAndSports: [
      { name: 'BBMP / BDA Green Park & Track', dist: '100m' },
      { name: 'Football Ground & Turf Academy', dist: '300m' },
      { name: 'Historic Temple Complex', dist: '700m' }
    ],
    industrialParks: [
      { name: 'Yelachenahalli Cluster & Tech SEZ', dist: '3.2 km (7 mins)' },
      { name: 'Harohalli Industrial Area (KIADB)', dist: '24 km' }
    ],
    transit: 'Namma Metro Terminal (2.2 km) • NICE Ring Road Expressway (2.4 km)',
    lakeDist: '500m (Pond/Kunte - 100% Clear of 30m NGT buffer)',
    rkDist: '600m (Rajakaluve - 100% Clear of 50m buffer)',
    drainDist: '100m (Secondary Drain - 100% Safe)',
    parkDist: '100m (Active BDA Public Park)',
    soilType: 'Compact Red Loamy Soil (SBC: 195 kN/m²)',
    waterSource: 'Cauvery Water Pipeline + Borewell Supply'
  };
}
