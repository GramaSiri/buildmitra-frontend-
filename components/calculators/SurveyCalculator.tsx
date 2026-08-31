import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";

export type MeasurementMode = "simple_survey" | "polygon_survey" | "gps_survey" | "satellite_survey";
export type UnitType = "feet" | "meters" | "yards";
export type MapTypeId = "satellite" | "hybrid" | "roadmap" | "terrain";

export type BoundarySegment = {
  id: string;
  fromLabel: string;
  toLabel: string;
  lengthFt: string;
  lengthIn: string;
};

export type DiagonalSegment = {
  id: string;
  fromLabel: string;
  toLabel: string;
  lengthFt: string;
  lengthIn: string;
};

export type BearingPoint = {
  id: string;
  pointName: string;
  distance: string;
  bearingDeg: string;
};

export type GpsPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  acc: number;
};

export type SatellitePin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  pixelX: number;
  pixelY: number;
};

export type SavedSurvey = {
  id: number;
  date: string;
  mode: string;
  areaSft: string;
  acres: string;
  cents: string;
  points: number;
  method: string;
};

const KNOWN_VILLAGES: Record<string, { lat: number; lng: number; label: string }> = {
  belagondapalli: { lat: 12.8251, lng: 77.8124, label: "Belagondapalli, Hosur, Tamil Nadu" },
  hosur: { lat: 12.7409, lng: 77.8253, label: "Hosur Industrial Zone, Tamil Nadu" },
  devanahalli: { lat: 13.2483, lng: 77.7127, label: "Devanahalli Airport Belt, Bengaluru" },
  sarjapur: { lat: 12.8584, lng: 77.7869, label: "Sarjapur Land Belt, Bengaluru" },
  whitefield: { lat: 12.9698, lng: 77.7499, label: "Whitefield Zone, Bengaluru" },
  electronic_city: { lat: 12.8452, lng: 77.6602, label: "Electronic City, Bengaluru" },
  nelamangala: { lat: 13.0984, lng: 77.3934, label: "Nelamangala Highway, Karnataka" },
  hyderabad: { lat: 17.385, lng: 78.4867, label: "Hyderabad Land Belt, Telangana" },
};

const ALPHABET_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"];

const heronArea = (a: number, b: number, c: number) => {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  if (a + b <= c || a + c <= b || b + c <= a) return 0;
  const s = (a + b + c) / 2;
  const val = s * (s - a) * (s - b) * (s - c);
  return val > 0 ? Math.sqrt(val) : 0;
};

const toNumber = (v: string | number) => {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const parseFtInToFt = (ftStr: string, inStr: string = "0"): number => {
  const ft = toNumber(ftStr);
  const inches = toNumber(inStr);
  return ft + inches / 12;
};

const fmt = (n: number, d = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-IN", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      })
    : "0.00";

export default function SurveyCalculator() {
  const router = useRouter();
  const [mode, setMode] = useState<MeasurementMode>("satellite_survey");
  const [unit, setUnit] = useState<UnitType>("feet");
  const [plotName, setPlotName] = useState<string>("Belagondapalli Land Survey");
  const [surveyNo, setSurveyNo] = useState<string>("Sy.No 142/3A");
  const [locationName, setLocationName] = useState<string>("Belagondapalli, Hosur, Tamil Nadu");

  // MAP TYPE & LOCATION STATE
  const [satMapType, setSatMapType] = useState<MapTypeId>("satellite");
  const [satZoom, setSatZoom] = useState<number>(17);
  const [satSearchInput, setSatSearchInput] = useState<string>("Belagondapalli, Tamil Nadu");
  const [satCenterLat, setSatCenterLat] = useState<number>(12.8251);
  const [satCenterLng, setSatCenterLng] = useState<number>(77.8124);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState<boolean>(false);
  const [isMarkingActive, setIsMarkingActive] = useState<boolean>(false);

  // REAL LEAFLET MAP REFS
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const featureGroupRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState<boolean>(false);

  // MODE 1: SIMPLE SURVEY
  const [segments, setSegments] = useState<BoundarySegment[]>([
    { id: "seg_1", fromLabel: "A", toLabel: "B", lengthFt: "950", lengthIn: "0" },
    { id: "seg_2", fromLabel: "B", toLabel: "C1", lengthFt: "865", lengthIn: "0" },
    { id: "seg_3", fromLabel: "C1", toLabel: "C2", lengthFt: "456", lengthIn: "0" },
    { id: "seg_4", fromLabel: "C2", toLabel: "C3", lengthFt: "59", lengthIn: "0" },
    { id: "seg_5", fromLabel: "C3", toLabel: "D", lengthFt: "786", lengthIn: "0" },
    { id: "seg_6", fromLabel: "D", toLabel: "A", lengthFt: "786", lengthIn: "0" },
  ]);

  const [diagonals, setDiagonals] = useState<DiagonalSegment[]>([
    { id: "diag_1", fromLabel: "A", toLabel: "C1", lengthFt: "1250", lengthIn: "0" },
    { id: "diag_2", fromLabel: "A", toLabel: "C2", lengthFt: "1380", lengthIn: "0" },
    { id: "diag_3", fromLabel: "A", toLabel: "C3", lengthFt: "1110", lengthIn: "0" },
  ]);

  // MODE 2: POLYGON SURVEY
  const [bearingPoints, setBearingPoints] = useState<BearingPoint[]>([
    { id: "p1", pointName: "A", distance: "950", bearingDeg: "90" },
    { id: "p2", pointName: "B", distance: "865", bearingDeg: "160" },
    { id: "p3", pointName: "C1", distance: "456", bearingDeg: "210" },
    { id: "p4", pointName: "C2", distance: "59", bearingDeg: "250" },
    { id: "p5", pointName: "C3", distance: "786", bearingDeg: "300" },
    { id: "p6", pointName: "D", distance: "786", bearingDeg: "355" },
  ]);

  // MODE 3: GPS SURVEY
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([
    { id: "gps_1", name: "Point A", lat: 12.8251, lng: 77.8124, acc: 1.8 },
    { id: "gps_2", name: "Point B", lat: 12.8260, lng: 77.8124, acc: 2.1 },
    { id: "gps_3", name: "Point C1", lat: 12.8260, lng: 77.8135, acc: 1.5 },
    { id: "gps_4", name: "Point C2", lat: 12.8255, lng: 77.8139, acc: 2.4 },
    { id: "gps_5", name: "Point D", lat: 12.8251, lng: 77.8139, acc: 1.9 },
  ]);
  const [isGpsActive, setIsGpsActive] = useState(false);

  // MODE 4: AERIAL SATELLITE SURVEY (STARTS 100% CLEAN)
  const [satellitePins, setSatellitePins] = useState<SatellitePin[]>([]);

  // SAVED HISTORY
  const [savedSurveys, setSavedSurveys] = useState<SavedSurvey[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("buildmitra_saved_land_surveys");
      if (stored) setSavedSurveys(JSON.parse(stored));
    } catch {}
  }, []);

  // DYNAMICALLY LOAD LEAFLET CSS & JS FROM CDN
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!(window as any).L && !document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        setIsLeafletReady(true);
      };
      document.body.appendChild(script);
    } else if ((window as any).L) {
      setIsLeafletReady(true);
    }
  }, []);

  // INITIALIZE REAL INTERACTIVE LEAFLET MAP
  useEffect(() => {
    if (!isLeafletReady || !mapDivRef.current || mode !== "satellite_survey") return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapDivRef.current, {
        center: [satCenterLat, satCenterLng],
        zoom: satZoom,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      const featureGroup = L.featureGroup().addTo(map);
      featureGroupRef.current = featureGroup;

      // Add Tile Layer
      const esriSatellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Esri World Imagery Satellite" }
      );
      esriSatellite.addTo(map);
      tileLayerRef.current = esriSatellite;

      // Handle Map Click to Drop Pins
      map.on("click", (e: any) => {
        handleLeafletPointDrop(e.latlng.lat, e.latlng.lng, e.layerPoint.x, e.layerPoint.y);
      });

      // Update Center State on Map Move
      map.on("moveend", () => {
        const center = map.getCenter();
        setSatCenterLat(parseFloat(center.lat.toFixed(6)));
        setSatCenterLng(parseFloat(center.lng.toFixed(6)));
      });
    }

    // Cleanup on unmount or tab switch
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        featureGroupRef.current = null;
      }
    };
  }, [isLeafletReady, mode]);

  // SWITCH LEAFLET TILE LAYERS DYNAMICALLY
  useEffect(() => {
    if (!mapInstanceRef.current || !isLeafletReady) return;
    const L = (window as any).L;
    if (!L) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    let attr = "Esri World Imagery Satellite";

    if (satMapType === "roadmap") {
      tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      attr = "OpenStreetMap Standard";
    } else if (satMapType === "terrain") {
      tileUrl = "https://tile.opentopomap.org/{z}/{x}/{y}.png";
      attr = "OpenTopoMap Terrain";
    }

    const newLayer = L.tileLayer(tileUrl, { maxZoom: 19, attribution: attr });
    newLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [satMapType, isLeafletReady]);

  // SYNCHRONIZE LEAFLET MARKERS & POLYGON
  useEffect(() => {
    if (!mapInstanceRef.current || !featureGroupRef.current || !isLeafletReady) return;
    const L = (window as any).L;
    if (!L) return;

    featureGroupRef.current.clearLayers();

    if (satellitePins.length > 0) {
      const latlngs = satellitePins.map((p) => [p.lat, p.lng]);

      // Draw Polygon if at least 2 points
      if (satellitePins.length >= 2) {
        const polygon = L.polygon(latlngs, {
          color: "#34d399",
          weight: 3.5,
          fillColor: "#34d399",
          fillOpacity: 0.35,
          dashArray: "6, 2",
        });
        featureGroupRef.current.addLayer(polygon);
      }

      // Add Custom DivIcon Markers
      satellitePins.forEach((pin) => {
        const customIcon = L.divIcon({
          className: "custom-leaflet-pin",
          html: `<div style="background:#0f172a; border:2px solid #00f0ff; color:#ffffff; padding:3px 8px; border-radius:12px; font-weight:900; font-size:11px; text-align:center; font-family:Inter,sans-serif; box-shadow:0 2px 8px rgba(0,0,0,0.4); whitespace:nowrap;">📍 ${pin.name}</div>`,
          iconSize: [80, 30],
          iconAnchor: [40, 15],
        });
        const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });
        featureGroupRef.current.addLayer(marker);
      });
    }
  }, [satellitePins, isLeafletReady]);

  // HANDLE MAP FLY-TO LOCATION
  const handlePerformLocationSearch = (queryStr: string = satSearchInput) => {
    const q = queryStr.trim().toLowerCase();
    if (!q) return;

    let targetLat = satCenterLat;
    let targetLng = satCenterLng;
    let targetLabel = queryStr;

    // Check direct Lat, Lng coordinate match
    const coordMatch = q.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      targetLat = parseFloat(coordMatch[1]);
      targetLng = parseFloat(coordMatch[2]);
      targetLabel = `Coordinates (${targetLat.toFixed(4)}, ${targetLng.toFixed(4)})`;
    } else {
      let foundKey = Object.keys(KNOWN_VILLAGES).find((k) => q.includes(k));
      if (foundKey) {
        const v = KNOWN_VILLAGES[foundKey];
        targetLat = v.lat;
        targetLng = v.lng;
        targetLabel = v.label;
      } else {
        targetLat = 12.8251;
        targetLng = 77.8124;
      }
    }

    setSatCenterLat(targetLat);
    setSatCenterLng(targetLng);
    setLocationName(targetLabel);
    setIsLocationConfirmed(false);
    setSatellitePins([]);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([targetLat, targetLng], 17, { duration: 1.5 });
    }
  };

  const handleConfirmLocation = () => {
    setIsLocationConfirmed(true);
    setIsMarkingActive(true);
  };

  const handleResetPoints = () => {
    setSatellitePins([]);
  };

  // HANDLE LEAFLET / CANVAS CLICK TO DROP SEQUENTIAL POINTS
  const handleLeafletPointDrop = (lat: number, lng: number, px: number = 400, py: number = 265) => {
    const nextIdx = satellitePins.length;
    const labelLetter = ALPHABET_LABELS[nextIdx] || `P${nextIdx + 1}`;
    const name = `Point ${labelLetter}`;

    setSatellitePins((prev) => [
      ...prev,
      {
        id: `sat_${Date.now()}`,
        name,
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
        pixelX: px,
        pixelY: py,
      },
    ]);
  };

  const handleMapCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "satellite_survey") return;
    if (!isLocationConfirmed || !isMarkingActive) {
      alert("Please click 'Confirm Location' in Step 1 first before dropping boundary points.");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const scaleX = 800 / rect.width;
    const scaleY = 530 / rect.height;
    const px = Math.round(clickX * scaleX);
    const py = Math.round(clickY * scaleY);

    const deltaLat = ((265 - py) / 265) * 0.0025;
    const deltaLng = ((px - 400) / 400) * 0.0025;

    handleLeafletPointDrop(satCenterLat + deltaLat, satCenterLng + deltaLng, px, py);
  };

  const removeSatellitePin = (id: string) => {
    setSatellitePins((prev) => prev.filter((p) => p.id !== id));
  };

  // Quick Presets Loader
  const loadPreset = (preset: "20x30" | "30x40" | "40x60" | "50x80" | "1acre" | "5acre" | "50acre") => {
    setMode("simple_survey");
    setUnit("feet");
    if (preset === "20x30") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", lengthFt: "20", lengthIn: "0" },
        { id: "r2", fromLabel: "B", toLabel: "C", lengthFt: "30", lengthIn: "0" },
        { id: "r3", fromLabel: "C", toLabel: "D", lengthFt: "20", lengthIn: "0" },
        { id: "r4", fromLabel: "D", toLabel: "A", lengthFt: "30", lengthIn: "0" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", lengthFt: "36.06", lengthIn: "0" }]);
    } else if (preset === "30x40") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", lengthFt: "30", lengthIn: "0" },
        { id: "r2", fromLabel: "B", toLabel: "C", lengthFt: "40", lengthIn: "0" },
        { id: "r3", fromLabel: "C", toLabel: "D", lengthFt: "30", lengthIn: "0" },
        { id: "r4", fromLabel: "D", toLabel: "A", lengthFt: "40", lengthIn: "0" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", lengthFt: "50", lengthIn: "0" }]);
    } else if (preset === "40x60") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", lengthFt: "40", lengthIn: "0" },
        { id: "r2", fromLabel: "B", toLabel: "C", lengthFt: "60", lengthIn: "0" },
        { id: "r3", fromLabel: "C", toLabel: "D", lengthFt: "40", lengthIn: "0" },
        { id: "r4", fromLabel: "D", toLabel: "A", lengthFt: "60", lengthIn: "0" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", lengthFt: "72.11", lengthIn: "0" }]);
    } else if (preset === "50x80") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", lengthFt: "50", lengthIn: "0" },
        { id: "r2", fromLabel: "B", toLabel: "C", lengthFt: "80", lengthIn: "0" },
        { id: "r3", fromLabel: "C", toLabel: "D", lengthFt: "50", lengthIn: "0" },
        { id: "r4", fromLabel: "D", toLabel: "A", lengthFt: "80", lengthIn: "0" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", lengthFt: "94.34", lengthIn: "0" }]);
    } else if (preset === "1acre") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", lengthFt: "200", lengthIn: "0" },
        { id: "r2", fromLabel: "B", toLabel: "C", lengthFt: "217.8", lengthIn: "0" },
        { id: "r3", fromLabel: "C", toLabel: "D", lengthFt: "200", lengthIn: "0" },
        { id: "r4", fromLabel: "D", toLabel: "A", lengthFt: "217.8", lengthIn: "0" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", lengthFt: "295.73", lengthIn: "0" }]);
    } else if (preset === "5acre") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", lengthFt: "330", lengthIn: "0" },
        { id: "r2", fromLabel: "B", toLabel: "C", lengthFt: "660", lengthIn: "0" },
        { id: "r3", fromLabel: "C", toLabel: "D", lengthFt: "330", lengthIn: "0" },
        { id: "r4", fromLabel: "D", toLabel: "A", lengthFt: "660", lengthIn: "0" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", lengthFt: "737.9", lengthIn: "0" }]);
    } else if (preset === "50acre") {
      setSegments([
        { id: "r1", fromLabel: "A", toLabel: "B", lengthFt: "1475", lengthIn: "0" },
        { id: "r2", fromLabel: "B", toLabel: "C", lengthFt: "1475", lengthIn: "0" },
        { id: "r3", fromLabel: "C", toLabel: "D", lengthFt: "1475", lengthIn: "0" },
        { id: "r4", fromLabel: "D", toLabel: "A", lengthFt: "1475", lengthIn: "0" },
      ]);
      setDiagonals([{ id: "d1", fromLabel: "A", toLabel: "C", lengthFt: "2086", lengthIn: "0" }]);
    }
  };

  const handleNewSurvey = () => {
    if (mode === "simple_survey") {
      setSegments([
        { id: "s1", fromLabel: "A", toLabel: "B", lengthFt: "", lengthIn: "0" },
        { id: "s2", fromLabel: "B", toLabel: "C", lengthFt: "", lengthIn: "0" },
        { id: "s3", fromLabel: "C", toLabel: "D", lengthFt: "", lengthIn: "0" },
      ]);
      setDiagonals([]);
    } else if (mode === "polygon_survey") {
      setBearingPoints([
        { id: "p1", pointName: "A", distance: "", bearingDeg: "" },
        { id: "p2", pointName: "B", distance: "", bearingDeg: "" },
        { id: "p3", pointName: "C", distance: "", bearingDeg: "" },
      ]);
    } else if (mode === "gps_survey") {
      setGpsPoints([]);
    } else {
      setSatellitePins([]);
      setIsLocationConfirmed(false);
      setIsMarkingActive(false);
    }
  };

  // Mode 1 Handlers
  const addSegment = () => {
    const nextIdx = segments.length + 1;
    const lastSeg = segments[segments.length - 1];
    const newFrom = lastSeg ? lastSeg.toLabel : "A";
    setSegments((prev) => [
      ...prev,
      { id: `seg_${Date.now()}`, fromLabel: newFrom, toLabel: `P${nextIdx}`, lengthFt: "", lengthIn: "0" },
    ]);
  };

  const updateSegment = (id: string, field: keyof BoundarySegment, value: string) => {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 3) return;
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  const addDiagonal = () => {
    setDiagonals((prev) => [
      ...prev,
      { id: `diag_${Date.now()}`, fromLabel: "A", toLabel: segments[2]?.toLabel || "C", lengthFt: "", lengthIn: "0" },
    ]);
  };

  const updateDiagonal = (id: string, field: keyof DiagonalSegment, value: string) => {
    setDiagonals((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const removeDiagonal = (id: string) => {
    setDiagonals((prev) => prev.filter((d) => d.id !== id));
  };

  // Mode 2 Handlers
  const addBearingPoint = () => {
    const nextIdx = bearingPoints.length + 1;
    const labels = ["A", "B", "C", "C1", "C2", "C3", "D", "E", "F"];
    const name = labels[nextIdx - 1] || `P${nextIdx}`;
    setBearingPoints((prev) => [
      ...prev,
      { id: `pt_${Date.now()}`, pointName: name, distance: "", bearingDeg: "" },
    ]);
  };

  const updateBearingPoint = (id: string, field: keyof BearingPoint, value: string) => {
    setBearingPoints((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removeBearingPoint = (id: string) => {
    if (bearingPoints.length <= 3) return;
    setBearingPoints((prev) => prev.filter((p) => p.id !== id));
  };

  // Mode 3 Handlers
  const handleCaptureGpsPoint = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGpsActive(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const labels = ["Point A", "Point B", "Point C", "Point C1", "Point C2", "Point D"];
        const name = labels[gpsPoints.length] || `Point P${gpsPoints.length + 1}`;
        setGpsPoints((prev) => [
          ...prev,
          {
            id: `gps_${Date.now()}`,
            name,
            lat: parseFloat(latitude.toFixed(6)),
            lng: parseFloat(longitude.toFixed(6)),
            acc: accuracy ? parseFloat(accuracy.toFixed(1)) : 2.0,
          },
        ]);
        setIsGpsActive(false);
      },
      () => {
        const last = gpsPoints[gpsPoints.length - 1] || { lat: satCenterLat, lng: satCenterLng };
        const name = `Point P${gpsPoints.length + 1}`;
        setGpsPoints((prev) => [
          ...prev,
          {
            id: `gps_${Date.now()}`,
            name,
            lat: parseFloat((last.lat + 0.0004).toFixed(6)),
            lng: parseFloat((last.lng + 0.0004).toFixed(6)),
            acc: 1.8,
          },
        ]);
        setIsGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const removeGpsPoint = (id: string) => {
    setGpsPoints((prev) => prev.filter((p) => p.id !== id));
  };

  // AUTOMATIC VERTICAL ROWS CALCULATOR FOR SATELLITE PINS
  const satSegmentRows = useMemo(() => {
    if (satellitePins.length < 2) return [];
    const rows = [];
    const R_FT = 20902231;
    for (let i = 0; i < satellitePins.length; i++) {
      const current = satellitePins[i];
      const next = satellitePins[(i + 1) % satellitePins.length];
      
      const latRad1 = (current.lat * Math.PI) / 180;
      const latRad2 = (next.lat * Math.PI) / 180;
      const dLat = ((next.lat - current.lat) * Math.PI) / 180;
      const dLng = ((next.lng - current.lng) * Math.PI) / 180;

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(latRad1) * Math.cos(latRad2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distFt = R_FT * c;

      rows.push({
        id: `row_${i}`,
        fromLabel: current.name.replace("Point ", ""),
        toLabel: next.name.replace("Point ", ""),
        lengthFt: distFt > 0 ? distFt.toFixed(1) : "120.0",
        lat: current.lat,
        lng: current.lng,
      });
    }
    return rows;
  }, [satellitePins]);

  // CORE CALCULATION ENGINE
  const result = useMemo(() => {
    let areaSft = 0;
    let perimeterFt = 0;
    let pointCount = 0;
    let methodTitle = "";
    let closureErrorFt = 0;
    let misclosureRatio = "";
    let isClosed = true;
    let scaledNodes: { px: number; py: number; label: string }[] = [];
    let pathD = "";
    let derivedWidthFt = 0;
    let derivedLengthFt = 0;

    const unitFactor = unit === "meters" ? 3.28084 : unit === "yards" ? 3 : 1;

    // 1. SIMPLE SURVEY MODE
    if (mode === "simple_survey") {
      const validSegs = segments.filter((s) => parseFtInToFt(s.lengthFt, s.lengthIn) > 0);
      pointCount = validSegs.length;
      const segLens = validSegs.map((s) => parseFtInToFt(s.lengthFt, s.lengthIn) * unitFactor);
      perimeterFt = segLens.reduce((sum, len) => sum + len, 0);

      if (validSegs.length === 3) {
        const [a, b, c] = segLens;
        areaSft = heronArea(a, b, c);
        methodTitle = `Simple Triangle Survey (${validSegs.length} sides)`;
      } else if (validSegs.length === 4) {
        const [a, b, c, d] = segLens;
        const validDiag = diagonals.find((diag) => parseFtInToFt(diag.lengthFt, diag.lengthIn) > 0);
        if (validDiag) {
          const diagLen = parseFtInToFt(validDiag.lengthFt, validDiag.lengthIn) * unitFactor;
          areaSft = heronArea(a, b, diagLen) + heronArea(c, d, diagLen);
          methodTitle = `Simple 4-Sided Survey via Diagonal (${(diagLen / unitFactor).toFixed(1)} ${unit})`;
        } else {
          if (Math.abs(a - c) < 1 && Math.abs(b - d) < 1 && a > 0 && b > 0) {
            areaSft = a * b;
            methodTitle = `Simple Rectangular Survey (${(a / unitFactor).toFixed(0)} × ${(b / unitFactor).toFixed(0)} ${unit})`;
          } else {
            areaSft = ((a + c) / 2) * ((b + d) / 2);
            methodTitle = `Simple 4-Sided Irregular Survey`;
          }
        }
      } else if (validSegs.length > 4) {
        const validDiags = diagonals.filter((diag) => parseFtInToFt(diag.lengthFt, diag.lengthIn) > 0);
        if (validDiags.length >= validSegs.length - 3) {
          let totalTri = 0;
          const diagLens = validDiags.map((diag) => parseFtInToFt(diag.lengthFt, diag.lengthIn) * unitFactor);
          let prevDiag = segLens[0];
          for (let i = 0; i < diagLens.length; i++) {
            totalTri += heronArea(prevDiag, segLens[i + 1], diagLens[i]);
            prevDiag = diagLens[i];
          }
          totalTri += heronArea(prevDiag, segLens[segLens.length - 2], segLens[segLens.length - 1]);
          areaSft = totalTri;
          methodTitle = `Simple Multi-Segment Irregular Survey (${validSegs.length} sides)`;
        } else {
          areaSft = Math.pow(perimeterFt / 4, 2);
          methodTitle = `Simple Multi-Segment Parcel (Estimated)`;
        }
      }
      derivedWidthFt = Math.sqrt(areaSft);
      derivedLengthFt = Math.sqrt(areaSft);

      scaledNodes = [
        { px: 40, py: 130, label: "A" },
        { px: 240, py: 130, label: "B" },
        { px: 240, py: 30, label: "C" },
        { px: 40, py: 30, label: "D" },
      ];
      pathD = `M 40 130 L 240 130 L 240 30 L 40 30 Z`;
    }

    // 2. POLYGON SURVEY MODE
    else if (mode === "polygon_survey") {
      const validPts = bearingPoints.filter((p) => toNumber(p.distance) > 0);
      pointCount = validPts.length;
      let currX = 0, currY = 0;
      const coords = [{ x: 0, y: 0, label: validPts[0]?.pointName || "A" }];
      perimeterFt = 0;

      validPts.forEach((pt, i) => {
        const dist = toNumber(pt.distance) * unitFactor;
        const bearing = toNumber(pt.bearingDeg);
        perimeterFt += dist;
        const rad = (bearing * Math.PI) / 180;
        currX += dist * Math.sin(rad);
        currY += dist * Math.cos(rad);
        coords.push({ x: currX, y: currY, label: validPts[i + 1]?.pointName || "Start" });
      });

      const lastCoord = coords[coords.length - 1] || { x: 0, y: 0 };
      closureErrorFt = Math.sqrt(lastCoord.x * lastCoord.x + lastCoord.y * lastCoord.y);
      if (perimeterFt > 0) {
        const ratio = Math.round(perimeterFt / Math.max(0.001, closureErrorFt));
        misclosureRatio = `1:${ratio.toLocaleString("en-IN")}`;
      }
      if (closureErrorFt > 3.0 && validPts.length > 2) isClosed = false;

      let areaSum = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        const j = i + 1;
        areaSum += coords[i].x * coords[j].y - coords[j].x * coords[i].y;
      }
      areaSft = Math.abs(areaSum) / 2;
      methodTitle = `Polygon Bearing Traverse Survey (${validPts.length} points)`;

      if (coords.length > 1) {
        const xs = coords.map((c) => c.x), ys = coords.map((c) => c.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const dx = Math.max(1, maxX - minX), dy = Math.max(1, maxY - minY);
        scaledNodes = coords.map((c) => ({
          px: 40 + ((c.x - minX) / dx) * 220,
          py: 130 - ((c.y - minY) / dy) * 90,
          label: c.label,
        }));
        pathD = scaledNodes.reduce((acc, n, i) => `${acc} ${i === 0 ? "M" : "L"} ${n.px} ${n.py}`, "") + " Z";
      }
      derivedWidthFt = Math.sqrt(areaSft);
      derivedLengthFt = Math.sqrt(areaSft);
    }

    // 3. GPS SURVEY MODE
    else if (mode === "gps_survey") {
      pointCount = gpsPoints.length;
      if (gpsPoints.length >= 3) {
        const avgLat = gpsPoints.reduce((sum, p) => sum + p.lat, 0) / gpsPoints.length;
        const latRad = (avgLat * Math.PI) / 180;
        const R_FT = 20902231;

        const coords = gpsPoints.map((p) => ({
          x: (p.lng * Math.PI / 180) * R_FT * Math.cos(latRad),
          y: (p.lat * Math.PI / 180) * R_FT,
          label: p.name,
        }));

        let areaSum = 0, perim = 0;
        for (let i = 0; i < coords.length; i++) {
          const j = (i + 1) % coords.length;
          areaSum += coords[i].x * coords[j].y - coords[j].x * coords[i].y;
          const dx = coords[j].x - coords[i].x;
          const dy = coords[j].y - coords[i].y;
          perim += Math.sqrt(dx * dx + dy * dy);
        }

        areaSft = Math.abs(areaSum) / 2;
        perimeterFt = perim;
        methodTitle = `Geodesic Mercator GPS Satellite Pin Survey (${gpsPoints.length} pins)`;

        const xs = coords.map((c) => c.x), ys = coords.map((c) => c.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const dx = Math.max(1, maxX - minX), dy = Math.max(1, maxY - minY);
        scaledNodes = coords.map((c) => ({
          px: 40 + ((c.x - minX) / dx) * 220,
          py: 130 - ((c.y - minY) / dy) * 90,
          label: c.label,
        }));
        pathD = scaledNodes.reduce((acc, n, i) => `${acc} ${i === 0 ? "M" : "L"} ${n.px} ${n.py}`, "") + " Z";
      } else {
        methodTitle = `Requires at least 3 GPS pins`;
      }
      derivedWidthFt = Math.sqrt(areaSft);
      derivedLengthFt = Math.sqrt(areaSft);
    }

    // 4. AERIAL SATELLITE SURVEY MODE (LEAFLET INTERACTIVE CANVAS ENGINE)
    else if (mode === "satellite_survey") {
      pointCount = satellitePins.length;
      if (satellitePins.length >= 3) {
        const avgLat = satellitePins.reduce((sum, p) => sum + p.lat, 0) / satellitePins.length;
        const latRad = (avgLat * Math.PI) / 180;
        const R_FT = 20902231;

        const coords = satellitePins.map((p) => ({
          x: (p.lng * Math.PI / 180) * R_FT * Math.cos(latRad),
          y: (p.lat * Math.PI / 180) * R_FT,
          label: p.name,
        }));

        let areaSum = 0, perim = 0;
        for (let i = 0; i < coords.length; i++) {
          const j = (i + 1) % coords.length;
          areaSum += coords[i].x * coords[j].y - coords[j].x * coords[i].y;
          const dx = coords[j].x - coords[i].x;
          const dy = coords[j].y - coords[i].y;
          perim += Math.sqrt(dx * dx + dy * dy);
        }

        areaSft = Math.abs(areaSum) / 2;
        perimeterFt = perim;
        methodTitle = `Remote Satellite Map (${satMapType.toUpperCase()}) — ${locationName} (${satellitePins.length} pins)`;

        scaledNodes = satellitePins.map((p) => ({
          px: p.pixelX,
          py: p.pixelY,
          label: p.name,
        }));
        pathD = scaledNodes.reduce((acc, n, i) => `${acc} ${i === 0 ? "M" : "L"} ${n.pixelX} ${n.pixelY}`, "") + " Z";
      } else {
        methodTitle = `Aerial Satellite Survey Mode — ${isLocationConfirmed ? "Click map to mark Points A, B, C, D..." : "Step 1: Search & Confirm Location"}`;
      }
      derivedWidthFt = Math.sqrt(areaSft);
      derivedLengthFt = Math.sqrt(areaSft);
    }

    // REGIONAL UNITS CONVERSIONS
    const sqMeters = areaSft / 10.7639;
    const sqYards = areaSft / 9;
    const acres = areaSft / 43560;
    const cents = areaSft / 435.6;
    const guntha = areaSft / 1089;
    const ground = areaSft / 2400;
    const bighaPucca = areaSft / 27225;
    const bighaKacha = areaSft / 14400;
    const kanal = areaSft / 5445;
    const marla = areaSft / 272.25;

    return {
      areaSft,
      sqMeters,
      sqYards,
      acres,
      cents,
      guntha,
      ground,
      bighaPucca,
      bighaKacha,
      kanal,
      marla,
      perimeterFt,
      perimeterMeters: perimeterFt / 3.28084,
      pointCount,
      methodTitle,
      closureErrorFt: (closureErrorFt / unitFactor).toFixed(2),
      misclosureRatio,
      isClosed,
      scaledNodes,
      pathD,
      derivedWidthFt: Math.round(derivedWidthFt),
      derivedLengthFt: Math.round(derivedLengthFt),
    };
  }, [mode, unit, satMapType, locationName, isLocationConfirmed, segments, diagonals, bearingPoints, gpsPoints, satellitePins]);

  // DOWNSTREAM HANDOFF ROUTERS
  const handlePassToBOQ = () => {
    router.push({
      pathname: "/boq-calculator",
      query: {
        plotWidth: result.derivedWidthFt || 30,
        plotLength: result.derivedLengthFt || 40,
        plinthArea: Math.round(result.areaSft * 0.8),
        totalPlotArea: Math.round(result.areaSft),
      },
    });
  };

  const handlePassToFloorPlan = () => {
    router.push({
      pathname: "/pre-floor-plan-drg",
      query: {
        width: result.derivedWidthFt || 30,
        length: result.derivedLengthFt || 40,
      },
    });
  };

  const handlePassToLayout = () => {
    router.push({
      pathname: "/layout-plans",
      query: {
        grossArea: Math.round(result.areaSft),
        width: result.derivedWidthFt || 100,
        length: result.derivedLengthFt || 100,
      },
    });
  };

  const handleSaveSurvey = () => {
    if (result.areaSft <= 0) return;
    const newRecord: SavedSurvey = {
      id: Date.now(),
      date: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      mode,
      areaSft: fmt(result.areaSft),
      acres: fmt(result.acres, 4),
      cents: fmt(result.cents),
      points: result.pointCount,
      method: result.methodTitle,
    };
    const updated = [newRecord, ...savedSurveys];
    setSavedSurveys(updated);
    try {
      localStorage.setItem("buildmitra_saved_land_surveys", JSON.stringify(updated));
    } catch {}
    alert(`Saved Survey: ${fmt(result.areaSft)} Sft (${fmt(result.acres, 4)} Acres)`);
  };

  const handleExportExcel = () => {
    const rows = [
      ["Land Survey Calculation & Regional Unit Report — BuildMitra"],
      ["Plot Name", plotName],
      ["Survey No.", surveyNo],
      ["Location", locationName],
      ["Method", result.methodTitle],
      ["Area (Sq.Ft)", fmt(result.areaSft)],
      ["Area (Cents)", fmt(result.cents)],
      ["Area (Gunthas)", fmt(result.guntha)],
      ["Area (Acres)", fmt(result.acres, 4)],
      ["Area (Sq.Yards / Gaj)", fmt(result.sqYards)],
      ["Area (Ground)", fmt(result.ground)],
      ["Area (Bigha Pucca)", fmt(result.bighaPucca, 3)],
      ["Area (Kanal)", fmt(result.kanal, 2)],
      ["Area (Marla)", fmt(result.marla, 2)],
      ["Area (Sq.Meters)", fmt(result.sqMeters)],
      ["Perimeter (Ft)", fmt(result.perimeterFt, 1)],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Survey Report");
    XLSX.writeFile(wb, `${plotName.replace(/\s+/g, "_")}_survey_report.xlsx`);
  };

  return (
    <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", color: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      
      {/* HEADER BANNER */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "20px 24px", borderRadius: "14px", color: "#ffffff", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ background: "rgba(0, 240, 255, 0.2)", border: "1px solid rgba(0, 240, 255, 0.4)", color: "#00f0ff", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
              REAL LEAFLET INTERACTIVE SATELLITE MAP & CLICK-TO-PIN STUDIO
            </span>
            <h1 style={{ margin: "8px 0 0 0", fontSize: "24px", fontWeight: "900" }}>
              🗺️ Land Survey Calculator & Interactive Satellite Studio
            </h1>
            <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>
              Search any village (e.g. Belagondapalli), confirm location, and click smoothly on the live interactive map to mark boundary points A, B, C, D...
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={handleNewSurvey} style={{ background: "#334155", color: "#ffffff", border: 0, padding: "8px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
              🔄 New Survey
            </button>
            <button onClick={handleSaveSurvey} style={{ background: "#ff7a00", color: "#ffffff", border: 0, padding: "8px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
              💾 Save Survey
            </button>
            <button onClick={handleExportExcel} style={{ background: "#16a34a", color: "#ffffff", border: 0, padding: "8px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
              📊 Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* QUICK PRESETS BAR */}
      <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
        <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
          Quick Land Presets (Tap to Load Dimensions):
        </span>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {[
            { id: "20x30", label: "20 × 30 ft (600 Sft)" },
            { id: "30x40", label: "30 × 40 ft (1,200 Sft)" },
            { id: "40x60", label: "40 × 60 ft (2,400 Sft)" },
            { id: "50x80", label: "50 × 80 ft (4,000 Sft)" },
            { id: "1acre", label: "1 Acre (43,560 Sft)" },
            { id: "5acre", label: "5 Acre Parcel" },
            { id: "50acre", label: "50 Acre Land" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id as any)}
              style={{ padding: "6px 12px", borderRadius: "20px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", fontWeight: "700", fontSize: "12px", cursor: "pointer", whitespace: "nowrap" }}
            >
              📍 {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* RESTORED 4 SURVEY MODE TABS */}
      <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "satellite_survey", label: "🛰️ 1. Aerial Satellite Survey" },
            { id: "simple_survey", label: "📏 2. Simple Survey" },
            { id: "polygon_survey", label: "🧭 3. Polygon Survey" },
            { id: "gps_survey", label: "📡 4. GPS Survey" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as MeasurementMode)}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                border: 0,
                fontWeight: "800",
                fontSize: "13px",
                cursor: "pointer",
                background: mode === m.id ? (m.id === "satellite_survey" ? "#0284c7" : "#ff7a00") : "#f1f5f9",
                color: mode === m.id ? "#ffffff" : "#475569",
                boxShadow: mode === m.id ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Unit:</span>
          {(["feet", "meters", "yards"] as UnitType[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: unit === u ? "#0f172a" : "#ffffff", color: unit === u ? "#ffffff" : "#334155", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* MODE 4: REAL LEAFLET INTERACTIVE SATELLITE MAP STUDIO */}
      {mode === "satellite_survey" && (
        <div style={{ marginBottom: "20px" }}>
          
          {/* WORKFLOW STEP PROGRESS BAR */}
          <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div style={{ background: isLocationConfirmed ? "#f0fdf4" : "#eff6ff", border: `1.5px solid ${isLocationConfirmed ? "#22c55e" : "#0284c7"}`, padding: "10px 14px", borderRadius: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 900, color: isLocationConfirmed ? "#16a34a" : "#0284c7", textTransform: "uppercase" }}>STEP 1</span>
              <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>
                {isLocationConfirmed ? "✅ Location Confirmed" : "🔍 Search & Fly-To Site"}
              </strong>
              <span style={{ fontSize: "11px", color: "#64748b" }}>{locationName}</span>
            </div>

            <div style={{ background: isMarkingActive ? "#fff7ed" : "#f8fafc", border: `1.5px solid ${isMarkingActive ? "#ff7a00" : "#cbd5e1"}`, padding: "10px 14px", borderRadius: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 900, color: isMarkingActive ? "#ea580c" : "#64748b", textTransform: "uppercase" }}>STEP 2</span>
              <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>
                {satellitePins.length > 0 ? `📍 ${satellitePins.length} Points Plotted` : "Mark Points (A, B, C, D...)"}
              </strong>
              <span style={{ fontSize: "11px", color: "#64748b" }}>{isMarkingActive ? "Click directly on map to drop points" : "Confirm location in Step 1 to unlock"}</span>
            </div>

            <div style={{ background: satellitePins.length >= 3 ? "#f0fdf4" : "#f8fafc", border: `1.5px solid ${satellitePins.length >= 3 ? "#22c55e" : "#cbd5e1"}`, padding: "10px 14px", borderRadius: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 900, color: satellitePins.length >= 3 ? "#16a34a" : "#64748b", textTransform: "uppercase" }}>STEP 3</span>
              <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>
                {satellitePins.length >= 3 ? `✅ ${fmt(result.areaSft)} SFT Calculated` : "Auto Area & Row Calculation"}
              </strong>
              <span style={{ fontSize: "11px", color: "#64748b" }}>{satellitePins.length >= 3 ? `${fmt(result.acres, 4)} Acres / ${fmt(result.cents, 2)} Cents` : "Drop at least 3 points"}</span>
            </div>
          </div>

          {/* STEP 1: SEARCH & CONFIRM LOCATION HEADER CONTROL */}
          <div style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", padding: "16px 20px", borderRadius: "14px 14px 0 0", color: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              
              {/* SEARCH INPUT */}
              <div style={{ flex: 1, minWidth: "280px" }}>
                <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px", color: "#bae6fd" }}>
                  STEP 1: ENTER VILLAGE, TOWN, OR SURVEY LOCATION:
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Search village e.g. Belagondapalli, Tamil Nadu or paste Lat, Lng..."
                    value={satSearchInput}
                    onChange={(e) => setSatSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePerformLocationSearch()}
                    style={{ flex: 1, padding: "9px 14px", borderRadius: "8px", border: "0", fontSize: "13px", fontWeight: "700", backgroundColor: "#ffffff", color: "#0f172a" }}
                  />
                  <button onClick={() => handlePerformLocationSearch()} style={{ backgroundColor: "#38bdf8", color: "#050c17", border: 0, padding: "9px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "900", cursor: "pointer" }}>
                    🚀 Fly-To Site
                  </button>
                  <button onClick={handleConfirmLocation} style={{ backgroundColor: isLocationConfirmed ? "#22c55e" : "#00ff9d", color: "#050c17", border: 0, padding: "9px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: "900", cursor: "pointer" }}>
                    {isLocationConfirmed ? "✅ Location Confirmed" : "🔒 Confirm Location"}
                  </button>
                </div>
              </div>

              {/* MAP VIEW SWITCHING BUTTONS */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ backgroundColor: "rgba(255,255,255,0.15)", padding: "4px 8px", borderRadius: "8px", display: "flex", gap: "4px" }}>
                  {[
                    { id: "satellite", label: "🛰️ Satellite" },
                    { id: "roadmap", label: "🗺️ Roadmap" },
                    { id: "terrain", label: "🏔️ Terrain" }
                  ].map((t) => (
                    <button key={t.id} onClick={() => setSatMapType(t.id as MapTypeId)} style={{ padding: "5px 10px", backgroundColor: satMapType === t.id ? "#ffffff" : "transparent", color: satMapType === t.id ? "#0284c7" : "#ffffff", border: 0, borderRadius: "6px", fontSize: "11px", fontWeight: 900, cursor: "pointer" }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <button onClick={handleResetPoints} style={{ padding: "6px 12px", backgroundColor: "#ef4444", color: "#ffffff", border: 0, borderRadius: "6px", fontSize: "12px", fontWeight: 900, cursor: "pointer" }}>
                  🗑️ Clear Points
                </button>
              </div>

            </div>

            {/* QUICK VILLAGE CHIPS */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginTop: "10px", paddingTop: "4px" }}>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#e0f2fe" }}>Popular Villages:</span>
              {[
                { name: "Belagondapalli", query: "Belagondapalli, Tamil Nadu" },
                { name: "Hosur Belt", query: "Hosur, Tamil Nadu" },
                { name: "Devanahalli", query: "Devanahalli, Bengaluru" },
                { name: "Sarjapur", query: "Sarjapur, Bengaluru" },
                { name: "Whitefield", query: "Whitefield, Bengaluru" },
                { name: "Nelamangala", query: "Nelamangala, Karnataka" }
              ].map((v) => (
                <button
                  key={v.name}
                  onClick={() => {
                    setSatSearchInput(v.query);
                    handlePerformLocationSearch(v.query);
                  }}
                  style={{ padding: "3px 10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "10px", fontWeight: 800, cursor: "pointer", whitespace: "nowrap" }}
                >
                  📍 {v.name}
                </button>
              ))}
            </div>
          </div>

          {/* REAL LEAFLET MAP & FALLBACK CANVAS WRAPPER (550PX HIGH FULL WIDTH) */}
          <div style={{ height: "550px", minHeight: "500px", width: "100%", backgroundColor: "#0f172a", position: "relative", borderRadius: "0 0 14px 14px", border: "2px solid #0284c7", overflow: "hidden" }}>
            
            {/* Real Interactive Leaflet Map Div Container */}
            <div ref={mapDivRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />

            {/* Fallback Interactive Click Canvas Layer if Leaflet Script is Loading */}
            {!isLeafletReady && (
              <svg
                onClick={handleMapCanvasClick}
                viewBox="0 0 800 530"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", cursor: isLocationConfirmed ? "crosshair" : "not-allowed", zIndex: 2, background: "#064e3b" }}
              >
                <defs>
                  <pattern id="surveyGrid550Fallback" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#surveyGrid550Fallback)" />

                {/* Satellite Fallback Texture Text */}
                <text x="400" y="200" fill="#34d399" fontSize="14" fontWeight="900" textAnchor="middle">
                  🛰️ SATELLITE FIELD LAYER — {locationName.toUpperCase()}
                </text>
                <text x="400" y="225" fill="#94a3b8" fontSize="12" textAnchor="middle">
                  (Loading Live Leaflet Map Engine...) Click anywhere to mark Point A, B, C, D...
                </text>

                {/* Connecting Polygon */}
                {satellitePins.length >= 2 && (
                  <path
                    d={satellitePins.reduce((acc, n, i) => `${acc} ${i === 0 ? "M" : "L"} ${n.pixelX} ${n.pixelY}`, "") + (satellitePins.length >= 3 ? " Z" : "")}
                    fill={satellitePins.length >= 3 ? "rgba(52, 211, 153, 0.3)" : "none"}
                    stroke="#34d399"
                    strokeWidth="3.5"
                    strokeDasharray="6,2"
                  />
                )}

                {/* Pins */}
                {satellitePins.map((sat) => (
                  <g key={sat.id} transform={`translate(${sat.pixelX}, ${sat.pixelY})`}>
                    <circle cx="0" cy="0" r="12" fill="rgba(0, 240, 255, 0.4)" />
                    <circle cx="0" cy="0" r="7" fill="#00f0ff" stroke="#ffffff" strokeWidth="2" />
                    <rect x="-24" y="-30" width="48" height="18" rx="4" fill="#0f172a" stroke="#00f0ff" strokeWidth="1" />
                    <text x="0" y="-17" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">{sat.name}</text>
                  </g>
                ))}
              </svg>
            )}

            {/* Instruction Overlay if Unconfirmed */}
            {!isLocationConfirmed && (
              <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", background: "rgba(15, 23, 42, 0.94)", border: "2px solid #00f0ff", padding: "12px 24px", borderRadius: "30px", color: "#ffffff", boxShadow: "0 4px 14px rgba(0,0,0,0.3)", zIndex: 1000, pointerEvents: "none" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#00f0ff" }}>
                  👈 STEP 1: Click "Confirm Location" above to unlock Point Marking mode.
                </span>
              </div>
            )}

            {/* Bottom HUD Location Badge */}
            <div style={{ position: "absolute", bottom: "16px", left: "16px", background: "rgba(15, 23, 42, 0.9)", border: "1px solid #0284c7", padding: "8px 14px", borderRadius: "10px", color: "#ffffff", zIndex: 1000, pointerEvents: "none" }}>
              <span style={{ fontSize: "10px", color: "#38bdf8", fontWeight: "800", textTransform: "uppercase", display: "block" }}>
                ACTIVE SITE CENTER: {locationName}
              </span>
              <strong style={{ fontSize: "12px", color: "#00ff9d" }}>
                Lat: {satCenterLat.toFixed(6)} | Lng: {satCenterLng.toFixed(6)}
              </strong>
            </div>

            <div style={{ position: "absolute", bottom: "16px", right: "16px", background: "rgba(15, 23, 42, 0.9)", border: "1px solid #34d399", padding: "8px 14px", borderRadius: "10px", color: "#ffffff", textAlign: "right", zIndex: 1000, pointerEvents: "none" }}>
              <span style={{ fontSize: "10px", color: "#34d399", fontWeight: "800", textTransform: "uppercase", display: "block" }}>
                CALCULATED LAND AREA ({satellitePins.length} Points):
              </span>
              <strong style={{ fontSize: "15px", color: "#ffffff" }}>
                {satellitePins.length >= 3 ? `${fmt(result.areaSft)} SFT (${fmt(result.cents, 2)} Cents / ${fmt(result.acres, 4)} Acres)` : "Drop at least 3 points on map"}
              </strong>
            </div>
          </div>

          {/* STEP 3: AUTOMATIC VERTICAL ROWS POPULATED AS POINTS ARE DROPPED */}
          <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0", marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "900", color: "#0284c7" }}>
                  📋 Step 3: Automatically Populated Vertical Input Rows ({satSegmentRows.length} Segments)
                </h3>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Segment lengths and coordinates auto-fill as you drop points on the interactive map:</span>
              </div>
              {satellitePins.length > 0 && (
                <button onClick={handleResetPoints} style={{ background: "#ef4444", color: "#ffffff", border: 0, padding: "6px 12px", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                  🗑️ Clear All Points
                </button>
              )}
            </div>

            {satSegmentRows.length > 0 ? (
              <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {satSegmentRows.map((r, idx) => (
                  <div key={r.id} style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", padding: "10px 14px", borderRadius: "10px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "900", color: "#0284c7", width: "180px" }}>
                      ROW #{idx + 1}: POINT {r.fromLabel} → POINT {r.toLabel}
                    </span>
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
                      <div style={{ background: "#ffffff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                        <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>SEGMENT DISTANCE</span>
                        <strong style={{ fontSize: "13px", color: "#0f172a" }}>{r.lengthFt} FT</strong>
                      </div>
                      <div style={{ background: "#ffffff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                        <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>LATITUDE</span>
                        <strong style={{ fontSize: "11px", color: "#334155" }}>{r.lat}</strong>
                      </div>
                      <div style={{ background: "#ffffff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                        <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>LONGITUDE</span>
                        <strong style={{ fontSize: "11px", color: "#334155" }}>{r.lng}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#f8fafc", padding: "20px", textAlign: "center", borderRadius: "10px", border: "1px dashed #cbd5e1", color: "#64748b", fontSize: "13px" }}>
                📍 No points dropped yet. Confirm your location in Step 1, then click on the interactive satellite map to drop Point A, Point B, Point C, Point D...
              </div>
            )}
          </div>

        </div>
      )}

      {/* DYNAMIC SHAPE INPUT FOR OTHER MODES */}
      {mode !== "satellite_survey" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          
          {/* LEFT COLUMN: SPACIOUS VERTICAL ROW INPUT CONTROLS */}
          <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            
            {/* TAB 2: SIMPLE SURVEY */}
            {mode === "simple_survey" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>
                      📏 Simple Boundary Segments (Vertical Rows)
                    </h3>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Enter distance for each boundary segment line below:</span>
                  </div>
                  <button onClick={addSegment} style={{ background: "#ff7a00", color: "#ffffff", border: 0, padding: "7px 14px", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                    + Add Boundary Row
                  </button>
                </div>

                <div style={{ maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
                  {segments.map((seg, idx) => (
                    <div key={seg.id} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px 14px", borderRadius: "10px", marginBottom: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "900", color: "#ff7a00" }}>
                          BOUNDARY ROW #{idx + 1}: FROM SEGMENT {seg.fromLabel} TO {seg.toLabel}
                        </span>
                        {segments.length > 3 && (
                          <button onClick={() => removeSegment(seg.id)} style={{ background: "transparent", color: "#ef4444", border: 0, cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                            ✕ Remove Row
                          </button>
                        )}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr 1fr", gap: "10px", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", display: "block" }}>FROM</span>
                          <input
                            type="text"
                            value={seg.fromLabel}
                            onChange={(e) => updateSegment(seg.id, "fromLabel", e.target.value)}
                            style={{ width: "100%", padding: "6px", textAlign: "center", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "800", backgroundColor: "#ffffff" }}
                          />
                        </div>

                        <div>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", display: "block" }}>TO</span>
                          <input
                            type="text"
                            value={seg.toLabel}
                            onChange={(e) => updateSegment(seg.id, "toLabel", e.target.value)}
                            style={{ width: "100%", padding: "6px", textAlign: "center", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "800", backgroundColor: "#ffffff" }}
                          />
                        </div>

                        <div>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", display: "block" }}>DISTANCE (FEET)</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={seg.lengthFt}
                            onChange={(e) => updateSegment(seg.id, "lengthFt", e.target.value)}
                            style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "800", backgroundColor: "#ffffff" }}
                          />
                        </div>

                        <div>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", display: "block" }}>INCHES</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={seg.lengthIn}
                            onChange={(e) => updateSegment(seg.id, "lengthIn", e.target.value)}
                            style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "800", backgroundColor: "#ffffff" }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: POLYGON SURVEY */}
            {mode === "polygon_survey" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>
                      🧭 Polygon Bearing Traverse Rows (0° - 360°)
                    </h3>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Enter distance and bearing angle for each station point:</span>
                  </div>
                  <button onClick={addBearingPoint} style={{ background: "#ff7a00", color: "#ffffff", border: 0, padding: "7px 14px", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                    + Add Station
                  </button>
                </div>

                <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                  {bearingPoints.map((pt, idx) => (
                    <div key={pt.id} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px 14px", borderRadius: "10px", marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "900", color: "#ff7a00" }}>
                          STATION ROW #{idx + 1}: POINT {pt.pointName}
                        </span>
                        {bearingPoints.length > 3 && (
                          <button onClick={() => removeBearingPoint(pt.id)} style={{ background: "transparent", color: "#ef4444", border: 0, cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                            ✕ Remove Station
                          </button>
                        )}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr", gap: "10px", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", display: "block" }}>POINT</span>
                          <input
                            type="text"
                            value={pt.pointName}
                            onChange={(e) => updateBearingPoint(pt.id, "pointName", e.target.value)}
                            style={{ width: "100%", padding: "6px", textAlign: "center", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "800", backgroundColor: "#ffffff" }}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", display: "block" }}>DISTANCE ({unit.toUpperCase()})</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={pt.distance}
                            onChange={(e) => updateBearingPoint(pt.id, "distance", e.target.value)}
                            style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "800", backgroundColor: "#ffffff" }}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", display: "block" }}>BEARING (BEARING °)</span>
                          <input
                            type="number"
                            placeholder="0° - 360°"
                            value={pt.bearingDeg}
                            onChange={(e) => updateBearingPoint(pt.id, "bearingDeg", e.target.value)}
                            style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "800", backgroundColor: "#ffffff" }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: GPS SURVEY */}
            {mode === "gps_survey" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>
                      📡 Live Field Satellite GPS Pins ({gpsPoints.length})
                    </h3>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Capture real-time field pins using your device GPS:</span>
                  </div>
                  <button onClick={handleCaptureGpsPoint} disabled={isGpsActive} style={{ background: "#16a34a", color: "#ffffff", border: 0, padding: "7px 14px", borderRadius: "6px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>
                    {isGpsActive ? "Acquiring..." : "+ Capture GPS Pin"}
                  </button>
                </div>

                <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                  {gpsPoints.map((pin, idx) => (
                    <div key={pin.id} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px 14px", borderRadius: "10px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "12px", fontWeight: "900", color: "#16a34a", display: "block" }}>
                          GPS PIN ROW #{idx + 1}: 📍 {pin.name}
                        </span>
                        <span style={{ fontSize: "11px", color: "#475569", fontFamily: "monospace" }}>
                          Lat: {pin.lat}, Lng: {pin.lng} (Accuracy: ±{pin.acc}m)
                        </span>
                      </div>
                      <button onClick={() => removeGpsPoint(pin.id)} style={{ background: "transparent", color: "#ef4444", border: 0, cursor: "pointer", fontWeight: "bold" }}>
                        ✕ Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: VISUAL VECTOR MAP */}
          <div style={{ background: "#1a1a2e", padding: "18px", borderRadius: "14px", border: "1px solid #2a2a4a", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#8ab3d8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", display: "block" }}>
              Vector Polygon Sketch & Plot Diagram
            </span>

            <svg viewBox="0 0 280 160" style={{ width: "100%", height: "220px", background: "#0f172a", borderRadius: "10px" }}>
              <defs>
                <pattern id="surveyGrid3" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#surveyGrid3)" />

              {/* Dynamic Polygon Coordinates Plotting */}
              {result.scaledNodes.length >= 3 ? (
                <>
                  <path d={result.pathD} fill="rgba(255, 122, 0, 0.2)" stroke="#ff7a00" strokeWidth="2.5" />
                  {result.scaledNodes.map((n, i) => (
                    <g key={i}>
                      <circle cx={n.px} cy={n.py} r="4" fill="#ff7a00" stroke="#ffffff" strokeWidth="1.5" />
                      <text x={n.px} y={n.py - 8} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">{n.label}</text>
                    </g>
                  ))}
                </>
              ) : (
                <>
                  <polygon points="40,130 240,130 240,30 40,30" fill="rgba(0, 240, 255, 0.15)" stroke="#00f0ff" strokeWidth="2.5" />
                  <circle cx="40" cy="130" r="4" fill="#00f0ff" />
                  <text x="30" y="142" fill="#ffffff" fontSize="10" fontWeight="bold">A</text>
                  <circle cx="240" cy="130" r="4" fill="#00f0ff" />
                  <text x="245" y="142" fill="#ffffff" fontSize="10" fontWeight="bold">B</text>
                  <circle cx="240" cy="30" r="4" fill="#00f0ff" />
                  <text x="245" y="25" fill="#ffffff" fontSize="10" fontWeight="bold">C</text>
                  <circle cx="40" cy="30" r="4" fill="#00f0ff" />
                  <text x="30" y="25" fill="#ffffff" fontSize="10" fontWeight="bold">D</text>
                </>
              )}

              {/* Compass Rose */}
              <g transform="translate(30, 25)">
                <circle cx="0" cy="0" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <path d="M0 -8 L-3 2 L0 0 L3 2 Z" fill="#ff7a00" />
                <text x="0" y="18" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ffffff">N</text>
              </g>
            </svg>

            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <span style={{ background: "rgba(0, 240, 255, 0.2)", color: "#00f0ff", padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "800" }}>
                DERIVED SIZE: {result.derivedWidthFt}′ × {result.derivedLengthFt}′ ({fmt(result.areaSft)} SFT)
              </span>
            </div>
          </div>

        </div>
      )}

      {/* PROMINENT RESULTS PANEL & SIMULTANEOUS INDIAN REGIONAL UNIT CONVERTER */}
      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
          <div>
            <span style={{ background: "#00f0ff", color: "#050c17", fontSize: "9px", fontWeight: "900", padding: "2px 6px", borderRadius: "3px" }}>
              INSTANT REGIONAL AREA CONVERTED
            </span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "17px", fontWeight: "900", color: "#0f172a" }}>
              ✅ Official Survey Area Results & Indian Regional Units
            </h2>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handlePassToBOQ} style={{ background: "#00ff9d", color: "#050c17", border: 0, padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "900", cursor: "pointer" }}>
              🔨 Turnkey BOQ →
            </button>
            <button onClick={handlePassToFloorPlan} style={{ background: "#00f0ff", color: "#050c17", border: 0, padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "900", cursor: "pointer" }}>
              🏛️ Floor Plan Studio →
            </button>
            <button onClick={handlePassToLayout} style={{ background: "#38bdf8", color: "#050c17", border: 0, padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "900", cursor: "pointer" }}>
              🗺️ Master Layout →
            </button>
          </div>
        </div>

        {/* REGIONAL UNITS CONVERSION GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "16px" }}>
          
          <div style={{ background: "#fff7ed", border: "1px solid #ffdeaf", padding: "12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#c2410c", textTransform: "uppercase", display: "block" }}>Acres</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#ea580c" }}>{fmt(result.acres, 4)}</span>
            <span style={{ fontSize: "10px", color: "#9a3412", display: "block", marginTop: "2px" }}>Acres</span>
          </div>

          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", padding: "12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#7e22ce", textTransform: "uppercase", display: "block" }}>Cents</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#9333ea" }}>{fmt(result.cents, 2)}</span>
            <span style={{ fontSize: "10px", color: "#6b21a8", display: "block", marginTop: "2px" }}>Cents (435.6 sft)</span>
          </div>

          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#15803d", textTransform: "uppercase", display: "block" }}>Gunthas</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#16a34a" }}>{fmt(result.guntha, 2)}</span>
            <span style={{ fontSize: "10px", color: "#166534", display: "block", marginTop: "2px" }}>Gunthas (1,089 sft)</span>
          </div>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase", display: "block" }}>Sq. Feet (Sft)</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>{fmt(result.areaSft, 2)}</span>
            <span style={{ fontSize: "10px", color: "#64748b", display: "block", marginTop: "2px" }}>Sq.Ft</span>
          </div>

          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#1d4ed8", textTransform: "uppercase", display: "block" }}>Sq. Yards (Gaj)</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#2563eb" }}>{fmt(result.sqYards, 2)}</span>
            <span style={{ fontSize: "10px", color: "#1e40af", display: "block", marginTop: "2px" }}>Sq.Yd</span>
          </div>

          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: "12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#be123c", textTransform: "uppercase", display: "block" }}>Ground (South)</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#e11d48" }}>{fmt(result.ground, 2)}</span>
            <span style={{ fontSize: "10px", color: "#9f1239", display: "block", marginTop: "2px" }}>Ground (2,400 sft)</span>
          </div>

          <div style={{ background: "#fefce8", border: "1px solid #fef08a", padding: "12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#a16207", textTransform: "uppercase", display: "block" }}>Bigha (Pucca)</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#ca8a04" }}>{fmt(result.bighaPucca, 3)}</span>
            <span style={{ fontSize: "10px", color: "#854d0e", display: "block", marginTop: "2px" }}>Bigha (27,225 sft)</span>
          </div>

          <div style={{ background: "#f0fdfa", border: "1px solid #99f6e4", padding: "12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#0f766e", textTransform: "uppercase", display: "block" }}>Kanal / Marla</span>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#0d9488" }}>{fmt(result.kanal, 2)} K / {fmt(result.marla, 1)} M</span>
            <span style={{ fontSize: "10px", color: "#115e59", display: "block", marginTop: "2px" }}>5,445 sft / 272 sft</span>
          </div>

          <div style={{ background: "#fdf4ff", border: "1px solid #f5d0fe", padding: "12px", borderRadius: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#a21caf", textTransform: "uppercase", display: "block" }}>Sq. Meters</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#c026d3" }}>{fmt(result.sqMeters, 2)}</span>
            <span style={{ fontSize: "10px", color: "#86198f", display: "block", marginTop: "2px" }}>m²</span>
          </div>

        </div>

        {/* Perimeter & Summary Metrics Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Perimeter Length</span>
            <strong style={{ fontSize: "13px", color: "#0f172a" }}>{fmt(result.perimeterFt, 1)} ft ({fmt(result.perimeterMeters, 1)} m)</strong>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Approx. BUA Factor (75%)</span>
            <strong style={{ fontSize: "13px", color: "#00ff9d" }}>{fmt(result.areaSft * 0.75)} Sft Plinth</strong>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Points Measured</span>
            <strong style={{ fontSize: "13px", color: "#ff7a00" }}>{result.pointCount} Vertices</strong>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Survey Mode</span>
            <strong style={{ fontSize: "13px", color: "#16a34a" }}>{result.methodTitle}</strong>
          </div>
        </div>

      </div>

      {/* SAVED CALCULATIONS HISTORY */}
      {savedSurveys.length > 0 && (
        <div style={{ background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
              💾 Saved Survey History ({savedSurveys.length})
            </h3>
            <button onClick={() => { setSavedSurveys([]); localStorage.removeItem("buildmitra_saved_land_surveys"); }} style={{ background: "transparent", color: "#ef4444", border: 0, cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}>
              Clear History
            </button>
          </div>

          <div style={{ maxHeight: "160px", overflowY: "auto" }}>
            {savedSurveys.map((rec) => (
              <div key={rec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "6px" }}>
                <div>
                  <strong style={{ color: "#ff7a00", fontSize: "13px" }}>{rec.areaSft} Sft</strong>
                  <span style={{ fontSize: "12px", color: "#475569" }}> ({rec.acres} Acres / {rec.cents} Cents)</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>{rec.method} — Saved at {rec.date}</span>
                </div>
                <span style={{ background: "#e2e8f0", color: "#334155", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                  {rec.points} Points
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
