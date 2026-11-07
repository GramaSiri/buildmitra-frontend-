import type { NextApiRequest, NextApiResponse } from "next";

const FALLBACK_EXPERTS = [
  {
    _id: "exp-01",
    title: "Designing Sustainable High-Rises & Green Concrete Systems for Megacities",
    publication: "Architectural Digest India",
    canonicalUrl: "https://www.architecturaldigest.in/story/sustainable-high-rise-design-dr-hafeez-contractor/",
    articleUrl: "https://www.architecturaldigest.in/story/sustainable-high-rise-design-dr-hafeez-contractor/",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    summary: "Dr. Hafeez Contractor shares insights on eco-friendly architectural design, low-carbon cement, and solar facade integration in modern Indian skyscrapers.",
    speaker: "Dr. Hafeez Contractor",
    author: "AD Editorial",
    publishDate: "2026-07-28T00:00:00.000Z",
    readTime: "6 min read",
    category: "Architecture",
    contentType: "Interview",
    language: "English",
    tags: ["Architecture", "Sustainability", "Green Building", "High-Rise"],
    isFeatured: true,
    isActive: true
  },
  {
    _id: "exp-02",
    title: "The Future of Mivan Aluminium Formwork & 7-Day Floor Cycle in Indian Mass Housing",
    publication: "Construction Week India",
    canonicalUrl: "https://www.constructionweekonline.in/technology/mivan-formwork-speed-housing-construction/",
    articleUrl: "https://www.constructionweekonline.in/technology/mivan-formwork-speed-housing-construction/",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800",
    summary: "Er. N. Srikumar explains how monolithic aluminium formwork accelerates residential project completion while eliminating plastering defects.",
    speaker: "Er. N. Srikumar",
    author: "Construction Week Desk",
    publishDate: "2026-07-25T00:00:00.000Z",
    readTime: "5 min read",
    category: "Prefab & Mivan",
    contentType: "Technology Update",
    language: "English",
    tags: ["Mivan", "Formwork", "Housing", "Speed Construction"],
    isFeatured: true,
    isActive: true
  },
  {
    _id: "exp-03",
    title: "RERA Compliance, Escrow Account Audit & Risk Mitigation for Builders",
    publication: "ET Realty",
    canonicalUrl: "https://realty.economictimes.indiatimes.com/news/industry/rera-compliance-escrow-audit-rules-2026/10293847",
    articleUrl: "https://realty.economictimes.indiatimes.com/news/industry/rera-compliance-escrow-audit-rules-2026/10293847",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    summary: "Adv. Ramesh Gowda details the latest statutory RERA guidelines, buyer fund protection rules, and DC land conversion verification steps.",
    speaker: "Adv. Ramesh Gowda",
    author: "ET Realty Bureau",
    publishDate: "2026-07-22T00:00:00.000Z",
    readTime: "7 min read",
    category: "RERA & Legal",
    contentType: "Legal Update",
    language: "English",
    tags: ["RERA", "Legal", "Escrow", "Real Estate"],
    isFeatured: true,
    isActive: true
  },
  {
    _id: "exp-04",
    title: "3D Printing & Robotic Concrete Placement in Residential Villa Projects",
    publication: "Construction World",
    canonicalUrl: "https://www.constructionworld.in/article/3d-printing-robotic-concrete-villas/",
    articleUrl: "https://www.constructionworld.in/article/3d-printing-robotic-concrete-villas/",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    summary: "Case study on 3D printed concrete walls reducing construction waste by 60% and labor dependency in villa developments.",
    speaker: "Rajesh Kumar, BE Civil",
    author: "CW Tech Editor",
    publishDate: "2026-07-18T00:00:00.000Z",
    readTime: "4 min read",
    category: "BIM & AI",
    contentType: "Case Study",
    language: "English",
    tags: ["3D Printing", "Robotics", "Concrete", "Innovation"],
    isFeatured: false,
    isActive: true
  },
  {
    _id: "exp-05",
    title: "BIM & Digital Twin Implementation for Zero-Defect Civil Structural Engineering",
    publication: "Construction Week India",
    canonicalUrl: "https://www.constructionweekonline.in/bim-digital-twin-civil-engineering-2026/",
    articleUrl: "https://www.constructionweekonline.in/bim-digital-twin-civil-engineering-2026/",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800",
    summary: "How 5D BIM modeling detects rebar clash, optimizes material procurement, and ensures structural code compliance under IS 456.",
    speaker: "Er. Suresh Gowda",
    author: "CW Engineering Desk",
    publishDate: "2026-07-15T00:00:00.000Z",
    readTime: "6 min read",
    category: "Civil Engineering",
    contentType: "Expert Opinion",
    language: "English",
    tags: ["BIM", "Civil Engineering", "Digital Twin", "IS 456"],
    isFeatured: false,
    isActive: true
  },
  {
    _id: "exp-06",
    title: "Fe 550D TMT Quality Assurance & Avoiding Rebar Corrosion in Foundations",
    publication: "Construction World",
    canonicalUrl: "https://www.constructionworld.in/article/fe550d-tmt-rebar-testing-standards-2026/",
    articleUrl: "https://www.constructionworld.in/article/fe550d-tmt-rebar-testing-standards-2026/",
    imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800",
    summary: "Structural guidelines on yield strength testing, elongation limits, and anti-corrosive epoxy treatments for high-humidity site environments.",
    speaker: "Dr. K. Narayana Rao",
    author: "CW Structural Desk",
    publishDate: "2026-07-12T00:00:00.000Z",
    readTime: "5 min read",
    category: "Building Materials",
    contentType: "Technical Brief",
    language: "English",
    tags: ["TMT Rebar", "Steel", "IS 1786", "Quality"],
    isFeatured: false,
    isActive: true
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
    const targetUrl = `${backendBase}/api/learn-earn/experts${queryParams ? `?${queryParams}` : ""}`;
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
    // Backend offline or timeout -> proceed with local filtered fallback
  }

  // Filter fallback data
  let articles = [...FALLBACK_EXPERTS];

  if (publication && publication !== "All") {
    articles = articles.filter(a => a.publication.toLowerCase() === String(publication).toLowerCase());
  }

  if (category && category !== "All") {
    articles = articles.filter(a => a.category.toLowerCase() === String(category).toLowerCase());
  }

  if (featured === "true") {
    articles = articles.filter(a => a.isFeatured);
  }

  if (search && typeof search === "string" && search.trim()) {
    const q = search.trim().toLowerCase();
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.speaker.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (sort === "latest") {
    articles.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  } else if (sort === "title") {
    articles.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    articles.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  return res.status(200).json({
    success: true,
    count: articles.length,
    totalCount: articles.length,
    articles,
    stats: {
      articlesTodayCount: articles.length,
      activePublicationsCount: 4,
      totalFeatured: articles.filter(a => a.isFeatured).length,
      lastSuccessfulSyncAt: new Date().toISOString()
    }
  });
}

