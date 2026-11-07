import type { NextApiRequest, NextApiResponse } from "next";

const FALLBACK_MAGAZINES = [
  {
    _id: "mag-01",
    title: "Construction Week India — July 2026: Precast Megaprojects & Smart Concretes",
    publication: "Construction Week India",
    edition: "July 2026",
    issueNumber: "Vol 16, Issue 7",
    publishDate: "2026-07-01T00:00:00.000Z",
    coverImageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800",
    pdfUrl: "https://www.constructionweekonline.in/digital-magazine/cwi-july-2026.pdf",
    readUrl: "https://www.constructionweekonline.in/digital-magazine/cwi-july-2026",
    summary: "Exclusive cover feature on India's rapid shift to precast segmental bridges, automated rebar tying robots, and high-performance Grade 60 fly-ash concrete mixes.",
    highlights: [
      "Precast High-Rise Construction in Bengaluru & Mumbai Metro Corridors",
      "Green Cement: UltraTech, ACC & Dalmia's Low-Carbon Slag Innovations",
      "CEOs Roundtable: Managing Rising TMT Steel Volatility & Supply Chain Sourcing"
    ],
    category: "Civil & Infrastructure",
    pageCount: 96,
    fileSize: "24.5 MB",
    language: "English",
    isFeatured: true,
    isActive: true,
    publisher: "ITP Media Group",
    tags: ["Precast", "Concrete", "High-Rise", "Infrastructure", "CWI"]
  },
  {
    _id: "mag-02",
    title: "Architectural Digest India — July 2026: Climate-Responsive Urban Living",
    publication: "Architectural Digest India",
    edition: "July 2026",
    issueNumber: "Vol 15, Issue 4",
    publishDate: "2026-07-05T00:00:00.000Z",
    coverImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    pdfUrl: "https://www.architecturaldigest.in/digital-editions/adi-july-2026.pdf",
    readUrl: "https://www.architecturaldigest.in/digital-editions/adi-july-2026",
    summary: "Showcasing breathtaking vernacular architecture, solar courtyard designs, engineered timber ceilings, and sustainable terracotta rainscreens across top Indian villas.",
    highlights: [
      "Dr. Hafeez Contractor & Sanjay Puri on Biophilic Urban Masterplans",
      "Zero-Energy Luxury Homes: Integrating Geothermal Cooling & BIPV Solar",
      "Top 50 Natural Stone & Italian Marble Trends for Indian Penthouses"
    ],
    category: "Architecture & Design",
    pageCount: 124,
    fileSize: "32.0 MB",
    language: "English",
    isFeatured: true,
    isActive: true,
    publisher: "Condé Nast India",
    tags: ["Architecture", "Luxury Homes", "Biophilic", "Sustainable", "AD India"]
  },
  {
    _id: "mag-03",
    title: "ET Realty Digest — July 2026: PropTech, REITs & RERA Escrow Framework",
    publication: "ET Realty",
    edition: "July 2026",
    issueNumber: "Vol 11, Issue 7",
    publishDate: "2026-07-10T00:00:00.000Z",
    coverImageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    pdfUrl: "https://realty.economictimes.indiatimes.com/magazine/etr-july-2026.pdf",
    readUrl: "https://realty.economictimes.indiatimes.com/magazine/etr-july-2026",
    summary: "Critical investigative analysis of RERA escrow compliance audits, digital land registries, and institutional foreign capital inflows into Tier-2 warehousing hubs.",
    highlights: [
      "Karnataka & Maharashtra RERA: Strict Penalties for Project Delay Clauses",
      "Commercial Real Estate Index: Office Leases Surge 22% Across Tech Parks",
      "Fractional Ownership & SEBI Small-Medium REIT Regulations Explained"
    ],
    category: "Real Estate & Policy",
    pageCount: 88,
    fileSize: "19.2 MB",
    language: "English",
    isFeatured: true,
    isActive: true,
    publisher: "The Economic Times",
    tags: ["RERA", "PropTech", "REITs", "Real Estate", "ET Realty"]
  },
  {
    _id: "mag-04",
    title: "Construction World — June 2026: Expressways, Tunneling & Heavy Earthmoving",
    publication: "Construction World",
    edition: "June 2026",
    issueNumber: "Vol 28, Issue 6",
    publishDate: "2026-06-15T00:00:00.000Z",
    coverImageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    pdfUrl: "https://www.constructionworld.in/magazines/cw-june-2026.pdf",
    readUrl: "https://www.constructionworld.in/magazines/cw-june-2026",
    summary: "Special issue covering mega-tunneling projects, NHAI smart highway contracts, and telematics-enabled heavy excavators cutting fleet fuel costs.",
    highlights: [
      "NHAI 2026 Bidding Pipeline: Top 10 EPC Contractors Winning Package Bids",
      "Underground Metro Tunnels: Slurry vs Earth Pressure Balance TBM Comparison",
      "Diesel to Electric: The Fleet Decarbonization Drive in Indian Quarries"
    ],
    category: "Civil & Infrastructure",
    pageCount: 104,
    fileSize: "28.4 MB",
    language: "English",
    isFeatured: false,
    isActive: true,
    publisher: "ASAPP Info Global Group",
    tags: ["Highways", "Tunneling", "Earthmoving", "Machinery", "Construction World"]
  },
  {
    _id: "mag-05",
    title: "EPC World — July 2026: Industrial Sourcing, Steel TMT & Project Procurement",
    publication: "EPC World",
    edition: "July 2026",
    issueNumber: "Vol 14, Issue 7",
    publishDate: "2026-07-08T00:00:00.000Z",
    coverImageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800",
    pdfUrl: "https://www.epcworld.in/magazines/epc-july-2026.pdf",
    readUrl: "https://www.epcworld.in/magazines/epc-july-2026",
    summary: "Procurement benchmarks for primary steel manufacturers (Jindal, Tata, SAIL), bulk cement price indexes, and reverse auction best practices for EPC managers.",
    highlights: [
      "B2B Reverse Auctions: Slashing Material Sourcing Lead Times by 35%",
      "Quality Benchmarking: Fe 550D Rebars vs Corrosion-Resistant TMT Alloys",
      "Port & Logistics Modernization: Bulk Cement Terminals on the Western Coast"
    ],
    category: "Building Materials & Concrete",
    pageCount: 92,
    fileSize: "21.8 MB",
    language: "English",
    isFeatured: false,
    isActive: true,
    publisher: "EPC World Media",
    tags: ["Procurement", "TMT Steel", "Cement", "Supply Chain", "EPC World"]
  },
  {
    _id: "mag-06",
    title: "NBM&CW — June 2026: Advanced Admixtures, AAC Blocks & Waterproofing Formulations",
    publication: "NBM&CW",
    edition: "June 2026",
    issueNumber: "Vol 31, Issue 6",
    publishDate: "2026-06-20T00:00:00.000Z",
    coverImageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800",
    pdfUrl: "https://www.nbmcw.com/digital-edition/nbmcw-june-2026.pdf",
    readUrl: "https://www.nbmcw.com/digital-edition/nbmcw-june-2026",
    summary: "Technical review of crystalline waterproofing admixtures, polycarboxylate ether superplasticizers for high-rise pumping, and precision AAC jointing mortars.",
    highlights: [
      "Preventing Basements Dampness: Modern Crystalline Waterproofing Coatings",
      "AAC Blocks vs Red Clay Bricks: Thermal Insulation & Structural Load Reduction",
      "Mivan Formwork Release Agents: Ensuring Mirror-Finish Fair-Faced Concrete"
    ],
    category: "Building Materials & Concrete",
    pageCount: 110,
    fileSize: "26.1 MB",
    language: "English",
    isFeatured: false,
    isActive: true,
    publisher: "New Building Materials & Construction World",
    tags: ["Admixtures", "AAC Blocks", "Waterproofing", "Mivan", "NBM&CW"]
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

  const {
    publication,
    category,
    search,
    sort,
    featured
  } = req.query;

  // Try proxying to backend if accessible
  const backendBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:5000";
  try {
    const queryParams = new URLSearchParams(req.query as any).toString();
    const targetUrl = `${backendBase}/api/learn-earn/magazines${queryParams ? `?${queryParams}` : ""}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const backendRes = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" }
    });
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const data = await backendRes.json();
      return res.status(200).json(data);
    }
  } catch (_e) {
    // Backend offline or timeout -> proceed with fallback
  }

  // Filter fallback data
  let magazines = [...FALLBACK_MAGAZINES];

  if (publication && publication !== "All") {
    magazines = magazines.filter(m => m.publication.toLowerCase() === String(publication).toLowerCase());
  }

  if (category && category !== "All") {
    magazines = magazines.filter(m => m.category.toLowerCase() === String(category).toLowerCase());
  }

  if (featured === "true") {
    magazines = magazines.filter(m => m.isFeatured);
  }

  if (search && typeof search === "string" && search.trim()) {
    const q = search.trim().toLowerCase();
    magazines = magazines.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.publication.toLowerCase().includes(q) ||
      m.highlights.some(h => h.toLowerCase().includes(q)) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (sort === "latest") {
    magazines.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  } else if (sort === "title") {
    magazines.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    magazines.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  return res.status(200).json({
    success: true,
    count: magazines.length,
    totalCount: magazines.length,
    magazines,
    stats: {
      totalMagazines: magazines.length,
      totalFeatured: magazines.filter(m => m.isFeatured).length,
      activePublicationsCount: 6,
      latestEdition: "July 2026",
      lastUpdated: new Date().toISOString()
    }
  });
}

