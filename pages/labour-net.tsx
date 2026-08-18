import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Sidebar from "../components/Sidebar";
import { getApiBase } from "../utils/apiConfig";

const API_BASE = getApiBase();

type Worker = {
  _id?: string;
  workerCode?: string;
  name?: string;
  skill?: string;
  dailyWage?: string;
  rateUnit?: string;
  mobile?: string;
  status?: string;
  location?: string;
  pincode?: string;
  experience?: string;
  teamSize?: string;
  description?: string;
  photo?: string;
  uploaderName?: string;
  uploaderMobile?: string;
  stayingAvailable?: boolean | string;
  stayingCost?: string;
  foodAvailable?: boolean | string;
  foodCost?: string;
  conveyanceAvailable?: boolean | string;
  conveyanceCost?: string;
  pickupDropAvailable?: boolean | string;
  pickupDropDetails?: string;
  pickupDropCost?: string;
  workingHours?: string;
  overtimeRate?: string;
  availableFrom?: string;
  listingType?: "supplier" | "individual";
};

function text(value: unknown, fallback = "Not provided") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.join(", ") || fallback;
  }

  if (typeof value === "object") {
    return fallback;
  }

  return String(value);
}

function yes(value: unknown) {
  return (
    value === true ||
    String(value).toLowerCase() === "true" ||
    String(value).toLowerCase() === "yes" ||
    String(value).toLowerCase() === "available"
  );
}

function digits(value?: string) {
  return String(value || "").replace(/\D/g, "");
}

// ----------------------------------------------------------------------
// SAMPLE LABOUR RECORDS (10 Labour Suppliers + 30 Individual Workers)
// ----------------------------------------------------------------------
const SAMPLE_LABOUR_RECORDS: Worker[] = [
  // --- 10 LABOUR SUPPLIERS / CONTRACTORS ---
  {
    _id: "sup-001",
    workerCode: "SUP-101",
    name: "BuildMitra Workforce Solutions",
    skill: "Turnkey Civil & Structural Labour Supplier",
    dailyWage: "850",
    rateUnit: "day",
    mobile: "+91 98765 10001",
    status: "Available Today",
    location: "Hebbal, Bengaluru",
    pincode: "560024",
    experience: "12 years",
    teamSize: "35 workers",
    description: "Verified supplier providing turnkey RCC civil masons, bar benders, shuttering carpenters and site helpers for commercial & residential projects.",
    uploaderName: "BuildMitra Verified Contractor",
    uploaderMobile: "+91 98765 10001",
    stayingAvailable: true,
    stayingCost: "Free Shed",
    foodAvailable: true,
    foodCost: "150",
    conveyanceAvailable: true,
    conveyanceCost: "Included",
    pickupDropAvailable: true,
    pickupDropDetails: "Site Pickup Available",
    pickupDropCost: "Free",
    workingHours: "8 hrs/day",
    overtimeRate: "₹120/hr",
    availableFrom: "Available Today",
    listingType: "supplier",
  },
  {
    _id: "sup-002",
    workerCode: "SUP-102",
    name: "Namma Labour Services",
    skill: "Masonry & Concrete Labour Supplier",
    dailyWage: "900",
    rateUnit: "day",
    mobile: "+91 98765 10002",
    status: "Available This Week",
    location: "Yelahanka, Bengaluru",
    pincode: "560064",
    experience: "8 years",
    teamSize: "20 workers",
    description: "Specialized in brick masonry, plastering, stone masonry and ready-mix concrete pouring teams.",
    uploaderName: "Namma Labour Agency",
    uploaderMobile: "+91 98765 10002",
    stayingAvailable: true,
    stayingCost: "Site Shed",
    foodAvailable: false,
    conveyanceAvailable: true,
    pickupDropAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available This Week",
    listingType: "supplier",
  },
  {
    _id: "sup-003",
    workerCode: "SUP-103",
    name: "Samruddhi Labour Contractors",
    skill: "Bar Bending & Shuttering Team Supplier",
    dailyWage: "950",
    rateUnit: "day",
    mobile: "+91 98765 10003",
    status: "Available Today",
    location: "Whitefield, Bengaluru",
    pincode: "560066",
    experience: "15 years",
    teamSize: "18 workers",
    description: "Expert steel fixers and aluminium/plywood shuttering carpentry gangs for high-rise residential towers.",
    uploaderName: "Samruddhi Contractors",
    uploaderMobile: "+91 98765 10003",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "supplier",
  },
  {
    _id: "sup-004",
    workerCode: "SUP-104",
    name: "Nemadhi Workforce",
    skill: "Plumbing & Electrical Sub-Contractor",
    dailyWage: "1100",
    rateUnit: "day",
    mobile: "+91 98765 10004",
    status: "Available Today",
    location: "Kengeri, Bengaluru",
    pincode: "560060",
    experience: "9 years",
    teamSize: "15 workers",
    description: "Licensed electricians, conduit piping specialists, CPVC/PVC plumbing installers for apartments and villas.",
    uploaderName: "Nemadhi Services",
    uploaderMobile: "+91 98765 10004",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "supplier",
  },
  {
    _id: "sup-005",
    workerCode: "SUP-105",
    name: "Bengaluru Civil Labour Team",
    skill: "Tile & Marble Fitting Labour Supplier",
    dailyWage: "25",
    rateUnit: "sq.ft",
    mobile: "+91 98765 10005",
    status: "Available from Tomorrow",
    location: "Peenya Industrial Area, Bengaluru",
    pincode: "560058",
    experience: "11 years",
    teamSize: "12 workers",
    description: "Vitrified tile laying, granite kitchen counter cutting, and Italian marble polishing master team.",
    uploaderName: "Bengaluru Labour Hub",
    uploaderMobile: "+91 98765 10005",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available from Tomorrow",
    listingType: "supplier",
  },
  {
    _id: "sup-006",
    workerCode: "SUP-106",
    name: "BuildMitra Skilled Hands",
    skill: "Painting & Waterproofing Contractors",
    dailyWage: "18",
    rateUnit: "sq.ft",
    mobile: "+91 98765 10006",
    status: "Available Today",
    location: "Electronic City, Bengaluru",
    pincode: "560100",
    experience: "7 years",
    teamSize: "16 workers",
    description: "Interior/exterior wall painting, putty finishing, texture coats, and terrace chemical waterproofing gang.",
    uploaderName: "Skilled Hands Team",
    uploaderMobile: "+91 98765 10006",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "supplier",
  },
  {
    _id: "sup-007",
    workerCode: "SUP-107",
    name: "Karnataka Site Workforce",
    skill: "Earthwork, Excavation & Concrete Labour",
    dailyWage: "750",
    rateUnit: "day",
    mobile: "+91 98765 10007",
    status: "Available This Week",
    location: "Devanahalli, Bengaluru",
    pincode: "562110",
    experience: "14 years",
    teamSize: "25 workers",
    description: "Heavy site clearing, foundation digging, backfilling, and trench excavation general labour force.",
    uploaderName: "Karnataka Site Services",
    uploaderMobile: "+91 98765 10007",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available This Week",
    listingType: "supplier",
  },
  {
    _id: "sup-008",
    workerCode: "SUP-108",
    name: "Greenfield Labour Services",
    skill: "Scaffolding & Fabrication Labour Team",
    dailyWage: "1200",
    rateUnit: "day",
    mobile: "+91 98765 10008",
    status: "Available Today",
    location: "Hosur Road, Attibele",
    pincode: "562107",
    experience: "6 years",
    teamSize: "10 workers",
    description: "MS pipe scaffolding erectors, safety net fixers, structural steel welders and truss fabricators.",
    uploaderName: "Greenfield Services",
    uploaderMobile: "+91 98765 10008",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "supplier",
  },
  {
    _id: "sup-009",
    workerCode: "SUP-109",
    name: "Apex Structural Labour Team",
    skill: "Roofing & POP False Ceiling Contractors",
    dailyWage: "22",
    rateUnit: "sq.ft",
    mobile: "+91 98765 10009",
    status: "Available This Week",
    location: "Tumakuru Road, Bengaluru",
    pincode: "560073",
    experience: "8 years",
    teamSize: "14 workers",
    description: "Gypsum board ceiling installers, POP moulding artisans, and GI roofing sheet fabricators.",
    uploaderName: "Apex Ceiling Agency",
    uploaderMobile: "+91 98765 10009",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available This Week",
    listingType: "supplier",
  },
  {
    _id: "sup-010",
    workerCode: "SUP-110",
    name: "Royal Karnataka Workforce",
    skill: "MEP, Solar & CCTV Technical Labour Team",
    dailyWage: "1500",
    rateUnit: "day",
    mobile: "+91 98765 10010",
    status: "Available Today",
    location: "Mysuru Road, Ramanagara",
    pincode: "562159",
    experience: "10 years",
    teamSize: "8 workers",
    description: "Solar panel roof mounting crews, CCTV camera technicians, and fire fighting pipe installers.",
    uploaderName: "Royal Tech Workforce",
    uploaderMobile: "+91 98765 10010",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "supplier",
  },

  // --- 30 INDIVIDUAL WORKERS ---
  {
    _id: "ind-001",
    workerCode: "WRK-201",
    name: "Ramesh K.",
    skill: "Mason",
    dailyWage: "950",
    rateUnit: "day",
    mobile: "+91 98765 10011",
    status: "Available Today",
    location: "Kanakapura Road, Bengaluru",
    pincode: "560062",
    experience: "8 years",
    teamSize: "Individual",
    description: "Expert bricklayer and plastering mason with Vastu wall layout experience.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10011",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: false,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-002",
    workerCode: "WRK-202",
    name: "Manjunath S.",
    skill: "Shuttering Carpenter",
    dailyWage: "1100",
    rateUnit: "day",
    mobile: "+91 98765 10012",
    status: "Available Today",
    location: "Yelahanka, Bengaluru",
    pincode: "560064",
    experience: "10 years",
    teamSize: "Individual",
    description: "Slab, column and beam formwork specialist using ply and MS props.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10012",
    stayingAvailable: true,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-003",
    workerCode: "WRK-203",
    name: "Ravi P.",
    skill: "Bar Bender",
    dailyWage: "1000",
    rateUnit: "day",
    mobile: "+91 98765 10013",
    status: "Available Today",
    location: "Whitefield, Bengaluru",
    pincode: "560066",
    experience: "7 years",
    teamSize: "Individual",
    description: "TMT steel cutting, bending, footing mesh and column stirrup binding expert.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10013",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-004",
    workerCode: "WRK-204",
    name: "Suresh M.",
    skill: "Electrician",
    dailyWage: "1200",
    rateUnit: "day",
    mobile: "+91 98765 10014",
    status: "Available Today",
    location: "Indiranagar, Bengaluru",
    pincode: "560038",
    experience: "9 years",
    teamSize: "Individual",
    description: "Conduit wiring, DB dressing, switchboard fitting and 3-phase power line work.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10014",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-005",
    workerCode: "WRK-205",
    name: "Kumar N.",
    skill: "Plumber",
    dailyWage: "1150",
    rateUnit: "day",
    mobile: "+91 98765 10015",
    status: "Available Today",
    location: "Jayanagar, Bengaluru",
    pincode: "560041",
    experience: "8 years",
    teamSize: "Individual",
    description: "CPVC/SWR pipe fitting, sanitary fixture mounting, and overhead water tank connections.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10015",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-006",
    workerCode: "WRK-206",
    name: "Naveen R.",
    skill: "Painter",
    dailyWage: "900",
    rateUnit: "day",
    mobile: "+91 98765 10016",
    status: "Available This Week",
    location: "Electronic City, Bengaluru",
    pincode: "560100",
    experience: "6 years",
    teamSize: "Individual",
    description: "Emulsion wall painting, primer coating, wall sanding and wood polish master.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10016",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available This Week",
    listingType: "individual",
  },
  {
    _id: "ind-007",
    workerCode: "WRK-207",
    name: "Mahesh B.",
    skill: "Tile Mason",
    dailyWage: "22",
    rateUnit: "sq.ft",
    mobile: "+91 98765 10017",
    status: "Available Today",
    location: "HSR Layout, Bengaluru",
    pincode: "560102",
    experience: "11 years",
    teamSize: "Individual",
    description: "Precision ceramic & vitrified floor tile laying with epoxy grouting.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10017",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-008",
    workerCode: "WRK-208",
    name: "Prakash G.",
    skill: "Granite / Marble Worker",
    dailyWage: "28",
    rateUnit: "sq.ft",
    mobile: "+91 98765 10018",
    status: "Available Today",
    location: "Rajajinagar, Bengaluru",
    pincode: "560010",
    experience: "12 years",
    teamSize: "Individual",
    description: "Granite staircase bull-nosing, kitchen slab moulding, and marble floor polishing.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10018",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-009",
    workerCode: "WRK-209",
    name: "Shankar T.",
    skill: "Gypsum / False Ceiling Worker",
    dailyWage: "20",
    rateUnit: "sq.ft",
    mobile: "+91 98765 10019",
    status: "Available Today",
    location: "Kengeri, Bengaluru",
    pincode: "560060",
    experience: "7 years",
    teamSize: "Individual",
    description: "False ceiling channel framework, gypsum sheet fixing, and joint tape finishing.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10019",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-010",
    workerCode: "WRK-210",
    name: "Arun V.",
    skill: "Waterproofing Worker",
    dailyWage: "1300",
    rateUnit: "day",
    mobile: "+91 98765 10020",
    status: "Available Today",
    location: "Hebbal, Bengaluru",
    pincode: "560024",
    experience: "9 years",
    teamSize: "Individual",
    description: "Terrace brickbat coba, polyurethane membrane coating, and toilet sunken waterproofing.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10020",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-011",
    workerCode: "WRK-211",
    name: "Venkatesh M.",
    skill: "Welder",
    dailyWage: "1250",
    rateUnit: "day",
    mobile: "+91 98765 10021",
    status: "Available Today",
    location: "Peenya, Bengaluru",
    pincode: "560058",
    experience: "10 years",
    teamSize: "Individual",
    description: "Arc & MIG welding for MS gates, safety grills, window frames and roof trusses.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10021",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-012",
    workerCode: "WRK-212",
    name: "Chethan R.",
    skill: "Aluminium Worker",
    dailyWage: "1200",
    rateUnit: "day",
    mobile: "+91 98765 10022",
    status: "Available Today",
    location: "Koramangala, Bengaluru",
    pincode: "560095",
    experience: "6 years",
    teamSize: "Individual",
    description: "Aluminium sliding window fabrication, partition track fixing, and glass fitting.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10022",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-013",
    workerCode: "WRK-213",
    name: "Ganesh P.",
    skill: "POP Worker",
    dailyWage: "950",
    rateUnit: "day",
    mobile: "+91 98765 10023",
    status: "Available Today",
    location: "Malleswaram, Bengaluru",
    pincode: "560003",
    experience: "8 years",
    teamSize: "Individual",
    description: "Plaster of Paris wall smoothing, ceiling corner design mouldings, and decorative arches.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10023",
    stayingAvailable: true,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-014",
    workerCode: "WRK-214",
    name: "Anand K.",
    skill: "Flooring Worker",
    dailyWage: "18",
    rateUnit: "sq.ft",
    mobile: "+91 98765 10024",
    status: "Available Today",
    location: "BTM Layout, Bengaluru",
    pincode: "560076",
    experience: "5 years",
    teamSize: "Individual",
    description: "Wooden laminate flooring installation, SPC click-lock floor laying and skirting alignment.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10024",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-015",
    workerCode: "WRK-215",
    name: "Basavaraj N.",
    skill: "Excavation Labour",
    dailyWage: "750",
    rateUnit: "day",
    mobile: "+91 98765 10025",
    status: "Available Today",
    location: "Devanahalli, Bengaluru",
    pincode: "562110",
    experience: "4 years",
    teamSize: "Individual",
    description: "Manual trench digging, foundation pit excavation, and soil removal.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10025",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-016",
    workerCode: "WRK-216",
    name: "Shivakumar H.",
    skill: "Earthwork Labour",
    dailyWage: "700",
    rateUnit: "day",
    mobile: "+91 98765 10026",
    status: "Available Today",
    location: "Hosur Road, Attibele",
    pincode: "562107",
    experience: "3 years",
    teamSize: "Individual",
    description: "Backfilling, ground levelling, gravel compaction and heavy lifting site helper.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10026",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-017",
    workerCode: "WRK-217",
    name: "Lokesh G.",
    skill: "Concrete Labour",
    dailyWage: "800",
    rateUnit: "day",
    mobile: "+91 98765 10027",
    status: "Available Today",
    location: "Tumakuru",
    pincode: "572101",
    experience: "5 years",
    teamSize: "Individual",
    description: "Vibrator handling, concrete chute guiding, slab levelling and curing specialist.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10027",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-018",
    workerCode: "WRK-218",
    name: "Harish C.",
    skill: "Scaffolding Worker",
    dailyWage: "1050",
    rateUnit: "day",
    mobile: "+91 98765 10028",
    status: "Available Today",
    location: "Bannerghatta Road, Bengaluru",
    pincode: "560076",
    experience: "8 years",
    teamSize: "Individual",
    description: "MS pipe scaffolding assembly, staging erection and safety harness certified worker.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10028",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-019",
    workerCode: "WRK-219",
    name: "Vinod K.",
    skill: "Crane / Machine Helper",
    dailyWage: "850",
    rateUnit: "day",
    mobile: "+91 98765 10029",
    status: "Available Today",
    location: "Peenya Industrial Area, Bengaluru",
    pincode: "560058",
    experience: "4 years",
    teamSize: "Individual",
    description: "Signalman for mobile cranes, JCB excavator site guide, and concrete pump hose helper.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10029",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-020",
    workerCode: "WRK-220",
    name: "Krishna M.",
    skill: "HVAC Technician",
    dailyWage: "1400",
    rateUnit: "day",
    mobile: "+91 98765 10030",
    status: "Available Today",
    location: "Marathahalli, Bengaluru",
    pincode: "560037",
    experience: "9 years",
    teamSize: "Individual",
    description: "VRV/VRF AC indoor unit mounting, copper piping brazing, and GI ducting installation.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10030",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-021",
    workerCode: "WRK-221",
    name: "Raghavendra B.",
    skill: "Solar Installer",
    dailyWage: "1350",
    rateUnit: "day",
    mobile: "+91 98765 10031",
    status: "Available Today",
    location: "Sarjapur Road, Bengaluru",
    pincode: "562125",
    experience: "6 years",
    teamSize: "Individual",
    description: "Rooftop solar PV structure mounting, panel wiring, inverter cabling, and earthing.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10031",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-022",
    workerCode: "WRK-222",
    name: "Mohan R.",
    skill: "CCTV Technician",
    dailyWage: "1500",
    rateUnit: "day",
    mobile: "+91 98765 10032",
    status: "Available Today",
    location: "Vijayanagar, Bengaluru",
    pincode: "560040",
    experience: "7 years",
    teamSize: "Individual",
    description: "IP camera installation, CAT6 cabling, DVR/NVR configuration and biometric door lock fitting.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10032",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-023",
    workerCode: "WRK-223",
    name: "Deepak S.",
    skill: "Fire Fighting Technician",
    dailyWage: "1450",
    rateUnit: "day",
    mobile: "+91 98765 10033",
    status: "Available Today",
    location: "Nagarbhavi, Bengaluru",
    pincode: "560072",
    experience: "8 years",
    teamSize: "Individual",
    description: "MS fire hydrant pipe groove welding, sprinkler head mounting, and fire alarm sensor wiring.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10033",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-024",
    workerCode: "WRK-224",
    name: "Santhosh V.",
    skill: "Landscape / Gardening Worker",
    dailyWage: "900",
    rateUnit: "day",
    mobile: "+91 98765 10034",
    status: "Available Today",
    location: "Mysuru Road, Ramanagara",
    pincode: "562159",
    experience: "5 years",
    teamSize: "Individual",
    description: "Lawn grass turfing, garden plant transplantation, drip irrigation line laying and tree trimming.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10034",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-025",
    workerCode: "WRK-225",
    name: "Siddaramaiah K.",
    skill: "Cleaning / Housekeeping Labour",
    dailyWage: "650",
    rateUnit: "day",
    mobile: "+91 98765 10035",
    status: "Available Today",
    location: "KR Puram, Bengaluru",
    pincode: "560036",
    experience: "3 years",
    teamSize: "Individual",
    description: "Post-construction debris clearance, window glass chemical washing, and floor scrubbing.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10035",
    stayingAvailable: false,
    foodAvailable: false,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-026",
    workerCode: "WRK-226",
    name: "Pradeep M.",
    skill: "Helper",
    dailyWage: "650",
    rateUnit: "day",
    mobile: "+91 98765 10036",
    status: "Available Today",
    location: "Peenya, Bengaluru",
    pincode: "560058",
    experience: "2 years",
    teamSize: "Individual",
    description: "General site helper for material shifting, cement bag carrying and site housekeeping.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10036",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-027",
    workerCode: "WRK-227",
    name: "Chandrashekar B.",
    skill: "Machine Helper",
    dailyWage: "800",
    rateUnit: "day",
    mobile: "+91 98765 10037",
    status: "Available Today",
    location: "Yelahanka New Town, Bengaluru",
    pincode: "560064",
    experience: "4 years",
    teamSize: "Individual",
    description: "Concrete mixer machine feeder, bar cutting machine operator helper, and hoist operator.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10037",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-028",
    workerCode: "WRK-228",
    name: "Kiran Gowda",
    skill: "Mason",
    dailyWage: "950",
    rateUnit: "day",
    mobile: "+91 98765 10038",
    status: "Available Today",
    location: "Mysuru",
    pincode: "570001",
    experience: "9 years",
    teamSize: "Individual",
    description: "Concrete block mason, AAC block adhesive jointing specialist, and coping stone installer.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10038",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-029",
    workerCode: "WRK-229",
    name: "Nagaraju P.",
    skill: "Mason",
    dailyWage: "950",
    rateUnit: "day",
    mobile: "+91 98765 10039",
    status: "Available Today",
    location: "Mandya",
    pincode: "571401",
    experience: "10 years",
    teamSize: "Individual",
    description: "Internal wall sponge plastering, external double coat waterproofing plaster master.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10039",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "Available Today",
    listingType: "individual",
  },
  {
    _id: "ind-030",
    workerCode: "WRK-230",
    name: "Jagadish R.",
    skill: "Helper",
    dailyWage: "650",
    rateUnit: "day",
    mobile: "+91 98765 10040",
    status: "Deployed",
    location: "Yeshwanthpur, Bengaluru",
    pincode: "560022",
    experience: "2 years",
    teamSize: "Individual",
    description: "Unskilled site helper for sand/aggregate loading, curing water spraying, and site clearing.",
    uploaderName: "Direct Worker",
    uploaderMobile: "+91 98765 10040",
    stayingAvailable: true,
    foodAvailable: true,
    conveyanceAvailable: true,
    workingHours: "8 hrs/day",
    availableFrom: "On Project",
    listingType: "individual",
  },
];

export default function LabourNet() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [listingType, setListingType] = useState("");
  const [tradeCategory, setTradeCategory] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Worker | null>(null);

  async function loadWorkers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/labour-net`);
      if (!response.ok) {
        throw new Error(`API status ${response.status}`);
      }
      const body = await response.json();

      const rows = Array.isArray(body.labours)
        ? body.labours
        : Array.isArray(body.workers)
        ? body.workers
        : [];

      const validRows = rows.filter((r: any) => r.name && r.name !== "Worker A");
      if (validRows.length >= 5) {
        setWorkers(validRows);
      } else {
        setWorkers(SAMPLE_LABOUR_RECORDS);
      }
    } catch (err: any) {
      console.log("Labour Net built-in directory active:", err?.message);
      setWorkers(SAMPLE_LABOUR_RECORDS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkers();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workers.filter((worker) => {
      const combined = [
        worker.name,
        worker.workerCode,
        worker.skill,
        worker.mobile,
        worker.location,
        worker.pincode,
        worker.status,
        worker.uploaderName,
        worker.teamSize,
        worker.description,
      ]
        .map((item) => String(item || ""))
        .join(" ")
        .toLowerCase();

      const searchMatch = !query || combined.includes(query);

      const statusMatch =
        !status ||
        String(worker.status || "").toLowerCase().includes(status.toLowerCase());

      const workerPin = String(worker.pincode || "")
        .replace(/\D/g, "")
        .slice(-6);

      const pinMatch = !pincode || workerPin.includes(pincode);

      const isSupplierItem =
        worker.listingType === "supplier" ||
        (worker.teamSize &&
          worker.teamSize !== "Individual" &&
          !worker.teamSize.includes("1 worker"));

      const typeMatch =
        !listingType ||
        (listingType === "supplier" && isSupplierItem) ||
        (listingType === "individual" && !isSupplierItem);

      const tradeMatch =
        !tradeCategory ||
        String(worker.skill || "").toLowerCase().includes(tradeCategory.toLowerCase());

      return searchMatch && statusMatch && pinMatch && typeMatch && tradeMatch;
    });
  }, [workers, search, status, pincode, listingType, tradeCategory]);

  async function openWhatsApp(worker: Worker) {
    let phone = digits(worker.mobile || worker.uploaderMobile);

    if (!phone) {
      alert("Contact number is not available for this record.");
      return;
    }

    if (phone.length === 10) phone = `91${phone}`;

    try {
      let currentUser: any = {};
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("currentUser") || localStorage.getItem("user");
        if (stored) {
          try {
            currentUser = JSON.parse(stored);
          } catch {}
        }
      }

      const buyerName = currentUser.name || currentUser.fullName || "";
      const buyerPhone = currentUser.phone || currentUser.mobile || "";

      if (buyerName && digits(buyerPhone).length >= 10) {
        await fetch(`${API_BASE}/api/enquiry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enquiryCategory: "general",
            buyerName,
            buyerPhone,
            providerName: worker.name || "Labour Provider",
            itemType: "labour",
            itemName: worker.skill || worker.name || "Labour Requirement",
            listingCode: worker.workerCode || String(worker._id || ""),
            unit: worker.rateUnit || "day",
            location: worker.location || "",
            message: "Enquiry created from BuildMitra Labour Net",
          }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error("Labour enquiry logging notice:", e);
    }

    const message = encodeURIComponent(
      `Hello ${text(worker.name, "Labour Provider")},\n\n` +
        `I found your profile on BuildMitra Labour Net.\n\n` +
        `Skill / Category: ${text(worker.skill)}\n` +
        `Rate: ${worker.dailyWage ? `₹${worker.dailyWage}/${worker.rateUnit || "day"}` : "Please share"}\n` +
        `Team Size: ${text(worker.teamSize, "Individual")}\n` +
        `Location: ${text(worker.location)}\n\n` +
        `Please let me know availability for our construction project.`
    );

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  }

  return (
    <>
      <Head>
        <title>Labour Net | BuildMitra</title>
        <meta
          name="description"
          content="Find skilled construction workers, labour teams and verified labour contractors with transparent rates across Karnataka."
        />
      </Head>

      <Sidebar currentPath="/labour-net">
        <main className="page">
          {/* HERO BANNER */}
          <section className="hero">
            <div>
              <span className="badge">BUILDMITRA WORKFORCE PLATFORM</span>
              <h1>👷 Labour Net Directory</h1>
              <p>
                Browse verified construction labour suppliers, specialized trade contractors, and skilled / semi-skilled individual workers across Bengaluru & Karnataka.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => (window.location.href = "/labour-attendance")}
                style={{
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  border: 0,
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                📍 50m Geofence Attendance
              </button>
              <button type="button" onClick={loadWorkers} disabled={loading}>
                {loading ? "Refreshing..." : "🔄 Refresh Directory"}
              </button>
            </div>
          </section>

          {/* FILTER TOOLBAR */}
          <section className="filters">
            <input
              type="text"
              placeholder="🔍 Search name, skill, location, pincode..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={listingType}
              onChange={(event) => setListingType(event.target.value)}
            >
              <option value="">All Listing Types</option>
              <option value="supplier">🏢 Labour Suppliers / Contractors</option>
              <option value="individual">👷 Individual Workers</option>
            </select>

            <select
              value={tradeCategory}
              onChange={(event) => setTradeCategory(event.target.value)}
            >
              <option value="">All Trade Categories</option>
              <option value="Mason">🧱 Masons (Civil / Brick / Block)</option>
              <option value="Helper">🔨 Helpers & Site General Labour</option>
              <option value="Bar Bender">🔩 Bar Benders & Steel Fixers</option>
              <option value="Shuttering">🏗️ Shuttering & Formwork Carpenters</option>
              <option value="Electrician">⚡ Electricians & Conduit Wiring</option>
              <option value="Plumber">🔧 Plumbers & Sanitary Installers</option>
              <option value="Painter">🎨 Painters & Wall Finishing</option>
              <option value="Tile">📐 Tile Masons & Flooring Layers</option>
              <option value="Granite">🪨 Granite & Marble Specialists</option>
              <option value="Ceiling">🏠 False Ceiling & Gypsum POP</option>
              <option value="Waterproofing">💧 Waterproofing Technicians</option>
              <option value="Welder">🔥 Welders & Structural Fabricators</option>
              <option value="Aluminium">🪟 Aluminium & Glass Fitters</option>
              <option value="Earthwork">🚜 Earthwork & Excavation Labour</option>
              <option value="Scaffolding">🪜 Scaffolding & Rigging Crews</option>
              <option value="Solar">☀️ HVAC / Solar / CCTV / Fire Techs</option>
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available Today</option>
              <option value="Week">Available This Week</option>
              <option value="Deployed">Deployed / Busy</option>
            </select>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="PIN code (e.g. 560064)"
              value={pincode}
              onChange={(event) =>
                setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </section>

          {/* COUNTER BADGE BAR */}
          <div className="countBar">
            <span>
              Showing <strong>{filtered.length}</strong> of <strong>{workers.length}</strong> verified labour listings
            </span>
            <div className="stats">
              <span style={{ color: "#ea580c" }}>🏢 10 Suppliers</span>
              <span style={{ color: "#0284c7" }}>👷 30 Individual Workers</span>
            </div>
          </div>

          {error && <div className="message error">{error}</div>}

          {loading ? (
            <div className="message">Loading BuildMitra Labour Directory...</div>
          ) : filtered.length === 0 ? (
            <div className="message">
              No labour records match your selected filter criteria. Try clearing search or filter options.
            </div>
          ) : (
            <section className="grid">
              {filtered.map((worker, index) => {
                const contact = worker.mobile || worker.uploaderMobile;
                const isSupplier =
                  worker.listingType === "supplier" ||
                  (worker.teamSize &&
                    worker.teamSize !== "Individual" &&
                    !worker.teamSize.includes("1 worker"));

                return (
                  <article key={worker._id || worker.workerCode || index} className="card">
                    {/* CARD TYPE TAG */}
                    <div className={isSupplier ? "supplierTag" : "workerTag"}>
                      {isSupplier ? "🏢 LABOUR CONTRACTOR / SUPPLIER" : "👷 INDIVIDUAL WORKER"}
                    </div>

                    <div className="cardTop">
                      <div>
                        <small>{text(worker.workerCode, `LAB-${index + 1}`)}</small>
                        <h2>{text(worker.name)}</h2>
                        <strong className="skill">{text(worker.skill, "General Labour")}</strong>
                      </div>

                      <div className="photo">{isSupplier ? "🏢" : "👷"}</div>
                    </div>

                    <div className="status">{text(worker.status, "Available Today")}</div>

                    <div className="costBox">
                      <span>Rate / Pricing</span>
                      <strong>
                        {worker.dailyWage
                          ? `₹${worker.dailyWage}/${worker.rateUnit || "day"}`
                          : "Contact for Rate"}
                      </strong>
                    </div>

                    <div className="details">
                      <div>
                        <label>Location</label>
                        <strong>{text(worker.location)}</strong>
                      </div>

                      <div>
                        <label>Experience</label>
                        <strong>{text(worker.experience)}</strong>
                      </div>

                      <div>
                        <label>Team Size</label>
                        <strong style={{ color: isSupplier ? "#ea580c" : "#0f172a" }}>
                          {text(worker.teamSize, "Individual")}
                        </strong>
                      </div>

                      <div>
                        <label>Working Hours</label>
                        <strong>{text(worker.workingHours, "8 hrs/day")}</strong>
                      </div>
                    </div>

                    <h3>Facilities & Support</h3>

                    <div className="facilityGrid">
                      <div>
                        <span>Staying</span>
                        <strong>
                          {yes(worker.stayingAvailable)
                            ? worker.stayingCost
                              ? `₹${worker.stayingCost}`
                              : "Available"
                            : "Not Available"}
                        </strong>
                      </div>

                      <div>
                        <span>Food</span>
                        <strong>
                          {yes(worker.foodAvailable)
                            ? worker.foodCost
                              ? `₹${worker.foodCost}`
                              : "Available"
                            : "Not Available"}
                        </strong>
                      </div>

                      <div>
                        <span>Conveyance</span>
                        <strong>
                          {yes(worker.conveyanceAvailable)
                            ? worker.conveyanceCost
                              ? `₹${worker.conveyanceCost}`
                              : "Included"
                            : "Not Available"}
                        </strong>
                      </div>

                      <div>
                        <span>Pickup/Drop</span>
                        <strong>
                          {yes(worker.pickupDropAvailable)
                            ? text(worker.pickupDropDetails, "Available")
                            : "Not Available"}
                        </strong>
                      </div>
                    </div>

                    <div className="provider">
                      <span>Uploaded By</span>
                      <strong>{text(worker.uploaderName, worker.name || "Provider")}</strong>
                      <small>{text(contact, "Contact not provided")}</small>
                    </div>

                    <div className="actions">
                      <button type="button" onClick={() => setSelected(worker)}>
                        Details
                      </button>

                      {contact ? (
                        <a href={`tel:${contact}`}>Call</a>
                      ) : (
                        <button type="button" disabled>
                          Call
                        </button>
                      )}

                      <button type="button" onClick={() => openWhatsApp(worker)}>
                        WhatsApp
                      </button>

                      <button type="button" onClick={() => openWhatsApp(worker)}>
                        Enquiry
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </main>
      </Sidebar>

      {/* DETAILS MODAL */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="close" onClick={() => setSelected(null)}>
              ×
            </button>

            <h2>{text(selected.name)}</h2>
            <p style={{ color: "#0284c7", fontWeight: 700 }}>{text(selected.skill)}</p>

            <div className="modalGrid">
              <div>
                <span>Rate / Pricing</span>
                <strong>
                  {selected.dailyWage
                    ? `₹${selected.dailyWage}/${selected.rateUnit || "day"}`
                    : "Not provided"}
                </strong>
              </div>
              <div>
                <span>Availability Status</span>
                <strong>{text(selected.status)}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{text(selected.location)}</strong>
              </div>
              <div>
                <span>PIN Code</span>
                <strong>{text(selected.pincode)}</strong>
              </div>
              <div>
                <span>Experience</span>
                <strong>{text(selected.experience)}</strong>
              </div>
              <div>
                <span>Team / Crew Size</span>
                <strong>{text(selected.teamSize)}</strong>
              </div>
              <div>
                <span>Mobile Contact</span>
                <strong>{text(selected.mobile)}</strong>
              </div>
              <div>
                <span>Working Hours</span>
                <strong>{text(selected.workingHours)}</strong>
              </div>
              <div>
                <span>Overtime Rate</span>
                <strong>{text(selected.overtimeRate)}</strong>
              </div>
              <div>
                <span>Staying Support</span>
                <strong>
                  {yes(selected.stayingAvailable)
                    ? selected.stayingCost || "Available"
                    : "Not Available"}
                </strong>
              </div>
              <div>
                <span>Food Support</span>
                <strong>
                  {yes(selected.foodAvailable)
                    ? selected.foodCost || "Available"
                    : "Not Available"}
                </strong>
              </div>
              <div>
                <span>Conveyance Support</span>
                <strong>
                  {yes(selected.conveyanceAvailable)
                    ? selected.conveyanceCost || "Included"
                    : "Not Available"}
                </strong>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span>Workforce Overview & Description</span>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#334155" }}>
                  {text(selected.description, "No additional description available.")}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => openWhatsApp(selected)}
                style={{
                  flex: 1,
                  background: "#16a34a",
                  color: "#fff",
                  border: 0,
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                💬 Contact on WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  background: "#e2e8f0",
                  color: "#0f172a",
                  border: 0,
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 24px;
          background: #f8fafc;
          color: #0f172a;
          font-family: inherit;
        }

        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 24px;
          border-radius: 16px;
          color: white;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
        }

        .badge {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.2px;
          color: #ff7a00;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 4px 0;
          font-size: 26px;
          font-weight: 900;
        }

        .hero p {
          max-width: 760px;
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: #94a3b8;
        }

        .hero button {
          padding: 10px 16px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.2s;
        }

        .hero button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .filters {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr 120px;
          gap: 10px;
          margin-top: 16px;
          padding: 14px;
          border-radius: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .filters input,
        .filters select {
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font: inherit;
          font-size: 13px;
          color: #0f172a;
          background: #ffffff;
        }

        .countBar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 14px 2px;
          color: #64748b;
          font-size: 13px;
        }

        .stats {
          display: flex;
          gap: 16px;
          font-weight: 800;
          font-size: 12px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 16px;
        }

        .card {
          position: relative;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }

        .supplierTag {
          font-size: 10px;
          font-weight: 900;
          color: #ea580c;
          background: #fff7ed;
          border: 1px solid #ffedd5;
          padding: 3px 8px;
          border-radius: 6px;
          margin-bottom: 8px;
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .workerTag {
          font-size: 10px;
          font-weight: 900;
          color: #0284c7;
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
          padding: 3px 8px;
          border-radius: 6px;
          margin-bottom: 8px;
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .cardTop small {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
        }

        .cardTop h2 {
          margin: 2px 0;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .skill {
          color: #0284c7;
          font-size: 12px;
          font-weight: 700;
        }

        .photo {
          flex: 0 0 45px;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #f1f5f9;
          font-size: 22px;
        }

        .status {
          display: inline-block;
          align-self: flex-start;
          margin: 8px 0;
          padding: 3px 10px;
          border-radius: 12px;
          background: #f0fdf4;
          color: #166534;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid #bbf7d0;
        }

        .costBox {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 12px;
        }

        .costBox span {
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }

        .costBox strong {
          color: #166534;
          font-size: 14px;
          font-weight: 900;
        }

        .details,
        .facilityGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }

        .details div,
        .facilityGrid div,
        .modalGrid div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        label,
        .facilityGrid span,
        .provider span,
        .modalGrid span {
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .details strong,
        .facilityGrid strong {
          font-size: 12px;
          color: #1e293b;
        }

        h3 {
          margin: 10px 0 2px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .provider {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          font-size: 11px;
        }

        .actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-top: 12px;
        }

        .actions button,
        .actions a {
          padding: 8px 4px;
          border: 0;
          border-radius: 8px;
          background: #0f172a;
          color: white;
          text-align: center;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s;
        }

        .actions button:hover,
        .actions a:hover {
          opacity: 0.9;
        }

        .actions button:nth-child(3) {
          background: #16a34a;
        }

        .actions button:nth-child(4) {
          background: #ea580c;
        }

        .actions button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .message {
          padding: 24px;
          border-radius: 12px;
          background: white;
          text-align: center;
          font-size: 14px;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .error {
          color: #b42318;
          background: #fff0ef;
        }

        .overlay {
          position: fixed;
          z-index: 9999;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
        }

        .modal {
          position: relative;
          width: min(650px, 100%);
          max-height: 85vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 16px;
          background: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .close {
          position: absolute;
          top: 12px;
          right: 16px;
          border: 0;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
        }

        .modalGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        @media (max-width: 900px) {
          .filters {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 12px;
          }

          .hero {
            align-items: flex-start;
            flex-direction: column;
          }

          .filters,
          .details,
          .facilityGrid,
          .modalGrid {
            grid-template-columns: 1fr;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .countBar {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>
    </>
  );
}
