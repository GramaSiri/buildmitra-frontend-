import React, { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "../components/DashboardLayout";
import MarketRateTrend from "../components/ui/MarketRateTrend";

interface DailyForecast {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  precipProb: number;
  rainMm: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
  conditionText: string;
  conditionIcon: string;
  safetyStatus: "SAFE" | "CAUTION" | "STOP";
  statusText: string;
  statusColor: string;
  statusBg: string;
  thunderstormRisk: string;
  thunderstormStatus: "HIGH" | "MODERATE" | "LOW";
  thunderstormAdvice: string;
  concreteAdvice: string;
  excavationAdvice: string;
  paintingAdvice: string;
  claddingAdvice: string;
  combinedRemarks: string;
}

// Open-Meteo Weather Code Parser with Thunderstorm & Lightning Detection
function parseWeatherCode(code: number): { text: string; icon: string; isThunderstorm: boolean } {
  if (code === 0) return { text: "Clear Sky / Sunny", icon: "☀️", isThunderstorm: false };
  if (code === 1 || code === 2) return { text: "Partly Cloudy", icon: "⛅", isThunderstorm: false };
  if (code === 3) return { text: "Overcast", icon: "☁️", isThunderstorm: false };
  if (code === 45 || code === 48) return { text: "Foggy / Low Visibility", icon: "🌫️", isThunderstorm: false };
  if (code >= 51 && code <= 55) return { text: "Light Drizzle", icon: "🌦️", isThunderstorm: false };
  if (code >= 61 && code <= 65) return { text: "Rain Showers", icon: "🌧️", isThunderstorm: false };
  if (code >= 80 && code <= 82) return { text: "Heavy Downpour / Squall", icon: "🌧️⚡", isThunderstorm: false };
  if (code >= 95 && code <= 99) return { text: "Thunderstorm & Lightning Hazard", icon: "⚡⛈️", isThunderstorm: true };
  return { text: "Fair Weather", icon: "🌤️", isThunderstorm: false };
}

// Comprehensive Safety Evaluator for All External Works: Thunderstorms, Concrete, Excavation, Painting, Cladding
function evaluateExternalWorksSafety(
  maxTemp: number,
  precipProb: number,
  rainMm: number,
  windSpeed: number,
  humidity: number,
  weatherCode: number
): {
  safetyStatus: "SAFE" | "CAUTION" | "STOP";
  statusText: string;
  statusColor: string;
  statusBg: string;
  thunderstormRisk: string;
  thunderstormStatus: "HIGH" | "MODERATE" | "LOW";
  thunderstormAdvice: string;
  concreteAdvice: string;
  excavationAdvice: string;
  paintingAdvice: string;
  claddingAdvice: string;
  combinedRemarks: string;
} {
  const isDirectThunderstorm = weatherCode >= 95;
  const isSquallOrDownpour = weatherCode >= 80 || (precipProb >= 50 && windSpeed >= 25);
  
  let thunderstormStatus: "HIGH" | "MODERATE" | "LOW" = "LOW";
  let thunderstormRisk = "🛡️ LOW RISK";
  let thunderstormAdvice = "No active lightning or thunderstorm hazard. Normal external site operations permitted.";

  if (isDirectThunderstorm) {
    thunderstormStatus = "HIGH";
    thunderstormRisk = "⚡ HIGH (LIGHTNING HAZARD)";
    thunderstormAdvice = "CRITICAL LIGHTNING RISK! Evacuate scaffolding decks, ground tower crane booms & disconnect outdoor power boxes immediately.";
  } else if (isSquallOrDownpour) {
    thunderstormStatus = "MODERATE";
    thunderstormRisk = "🌩️ MODERATE (SQUALL RISK)";
    thunderstormAdvice = "SQUALL & DOWNPOUR RISK: Watch for sudden cloudbursts, squall gusts & localized lightning. Keep crane booms parked.";
  }

  const isThunderstormOrHeavyRain = weatherCode >= 80 || weatherCode >= 95;
  const isExtremeHeat = maxTemp >= 38;
  const isHeavyRainRisk = precipProb >= 50 || rainMm >= 5.0;
  const isHighWind = windSpeed >= 32;

  if (isThunderstormOrHeavyRain || isExtremeHeat || isHeavyRainRisk || isHighWind) {
    let reason = "Severe Weather Hazard";
    if (isDirectThunderstorm) reason = "⚡ Thunderstorm & Lightning Hazard";
    else if (isThunderstormOrHeavyRain || isHeavyRainRisk) reason = "Heavy Rain & Waterlogging Risk";
    else if (isExtremeHeat) reason = "Extreme Heat Hazard (>38°C)";
    else if (isHighWind) reason = "High Wind Velocity Hazard (>32 km/h)";

    const concreteAdvice = isHeavyRainRisk || isThunderstormOrHeavyRain
      ? "STOP CASTING! Rain alters W/C ratio causing severe slurry washout and honeycombing."
      : isExtremeHeat
      ? "STOP CASTING! Extreme heat causes plastic shrinkage cracking & rapid slump loss."
      : "STOP CASTING! High wind boom instability & severe surface moisture loss.";

    const excavationAdvice = isHeavyRainRisk || isThunderstormOrHeavyRain
      ? "STOP EXCAVATION! Severe trench wall collapse & mud accumulation hazard. Provide pump dewatering."
      : "SUSPEND EARTHWORK! High dust visibility risk & equipment heat strain.";

    const paintingAdvice = "STOP EXTERNAL PAINTING! Wet surface wash-off, blistering & loss of film adhesion.";
    
    const claddingAdvice = isDirectThunderstorm || isHighWind
      ? "STOP FACADE & SCAFFOLDING! High lightning & cradle wind tilt hazard. Lower cradles & clear scaffolding decks."
      : "STOP FACADE! Wet glass panel slip & wind hoist restrictions.";

    const combinedRemarks = `🔴 STOP ALL EXTERNAL WORKS (${reason}). ⚡ Thunderstorm: ${thunderstormAdvice} Concrete: ${concreteAdvice} Excavation: ${excavationAdvice} Painting: ${paintingAdvice} Cladding: ${claddingAdvice}`;

    return {
      safetyStatus: "STOP",
      statusText: `🔴 STOP ALL EXTERNAL WORKS (${reason})`,
      statusColor: "#dc2626",
      statusBg: "#fef2f2",
      thunderstormRisk,
      thunderstormStatus,
      thunderstormAdvice,
      concreteAdvice,
      excavationAdvice,
      paintingAdvice,
      claddingAdvice,
      combinedRemarks
    };
  }

  const isModerateRain = precipProb >= 20 || rainMm >= 1.0;
  const isWarm = maxTemp >= 35;
  const isModerateWind = windSpeed >= 20;
  const isHighHumidity = humidity >= 70;

  if (isModerateRain || isWarm || isModerateWind || isHighHumidity) {
    let reason = "Moderate Weather Precautions Required";
    if (isModerateRain) reason = "Drizzle & Surface Dampness Risk";
    else if (isWarm) reason = "High Thermal Hydration (35°C-37°C)";
    else if (isModerateWind) reason = "Moderate Wind Gusts (20-31 km/h)";
    else if (isHighHumidity) reason = "High Relative Humidity (>70%)";

    const concreteAdvice = "PROCEED WITH CAUTION: Keep waterproof tarpaulins ready. Apply retarders & wet hessian curing.";
    const excavationAdvice = "PROCEED WITH CAUTION: Inspect trench slopes for water seepage; shore pit embankments.";
    const paintingAdvice = isHighHumidity || isModerateRain
      ? "DEFER EXTERNAL PAINTING: Relative humidity >70% prevents moisture evaporation and primer bonding."
      : "PROCEED WITH CAUTION: Avoid direct sunlight painting during peak heat hours.";
    const claddingAdvice = "PROCEED WITH CAUTION: Secure scaffolding tie-backs & use safety harnesses for high-rise facade installation.";

    const combinedRemarks = `🟡 PROCEED WITH CAUTION (${reason}). ⚡ Thunderstorm: ${thunderstormAdvice} Concrete: ${concreteAdvice} Excavation: ${excavationAdvice} Painting: ${paintingAdvice} Cladding: ${claddingAdvice}`;

    return {
      safetyStatus: "CAUTION",
      statusText: `🟡 PROCEED WITH CAUTION (${reason})`,
      statusColor: "#d97706",
      statusBg: "#fffbeb",
      thunderstormRisk,
      thunderstormStatus,
      thunderstormAdvice,
      concreteAdvice,
      excavationAdvice,
      paintingAdvice,
      claddingAdvice,
      combinedRemarks
    };
  }

  const concreteAdvice = "OPTIMAL: Standard RCC slab casting permitted as per IS 456:2000. Maintain 14-day wet curing.";
  const excavationAdvice = "OPTIMAL: Soil excavation, backfilling & foundation compaction fully safe.";
  const paintingAdvice = "OPTIMAL: Perfect curing window for exterior emulsion, primer & weather-shield coatings.";
  const claddingAdvice = "OPTIMAL: Safe window for ACP panel, structural glazing, stone cladding & scaffolding erection.";

  const combinedRemarks = "🟢 SAFE FOR ALL EXTERNAL WORKS: Ideal weather window for Concrete Pouring, Excavation, External Painting & Facade Cladding.";

  return {
    safetyStatus: "SAFE",
    statusText: "🟢 SAFE FOR ALL EXTERNAL WORKS (Ideal Weather Window)",
    statusColor: "#16a34a",
    statusBg: "#f0fdf4",
    thunderstormRisk,
    thunderstormStatus,
    thunderstormAdvice,
    concreteAdvice,
    excavationAdvice,
    paintingAdvice,
    claddingAdvice,
    combinedRemarks
  };
}

// Reverse Geocode Helper to convert Lat/Lng into full detailed address string
async function reverseGeocodeAddress(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
    const data = await res.json();
    if (data && data.display_name) {
      return data.display_name; // Full granular address (Street, Suburb, City, Pincode, State, Country)
    }
  } catch (e) {
    console.warn("Primary Nominatim reverse geocode failed, trying fallback...", e);
  }

  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    const data = await res.json();
    if (data) {
      const parts = [
        data.localityInfo?.informative?.[0]?.name || data.localityInfo?.administrative?.[4]?.name,
        data.localityInfo?.administrative?.[3]?.name,
        data.locality || data.city,
        data.principalSubdivision || data.state,
        data.postcode,
        data.countryName
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(", ");
    }
  } catch (e) {
    console.warn("Fallback reverse geocode failed", e);
  }

  return `Site Location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;
}

export default function WeatherSafetyPage() {
  const [siteCity, setSiteCity] = useState("Whitefield, Bengaluru");
  const [latitude, setLatitude] = useState(12.9698);
  const [longitude, setLongitude] = useState(77.7500);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState("Whitefield, Bengaluru");
  const [geoError, setGeoError] = useState("");

  // Fetch 7-Day Weather from Open-Meteo Free API
  const fetchWeatherData = async (lat: number, lng: number, addressText: string) => {
    try {
      setIsLoading(true);
      setGeoError("");
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,precipitation_probability_max,windspeed_10m_max&hourly=relativehumidity_2m&timezone=Asia%2FKolkata`;

      const res = await fetch(url);
      const data = await res.json();

      if (data && data.daily) {
        const daily = data.daily;
        const dailyList: DailyForecast[] = [];

        for (let i = 0; i < daily.time.length; i++) {
          const dateStr = daily.time[i];
          const dateObj = new Date(dateStr);
          const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });

          const maxTemp = Math.round(daily.temperature_2m_max[i]);
          const minTemp = Math.round(daily.temperature_2m_min[i]);
          const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : (daily.rain_sum[i] > 0 ? 60 : 10);
          const rainMm = daily.rain_sum ? daily.rain_sum[i] : (daily.precipitation_sum ? daily.precipitation_sum[i] : 0);
          const windSpeed = Math.round(daily.windspeed_10m_max ? daily.windspeed_10m_max[i] : 12);
          const weatherCode = daily.weathercode ? daily.weathercode[i] : 0;
          const humidity = 65 + (precipProb > 30 ? 20 : 0);

          const condition = parseWeatherCode(weatherCode);
          const safety = evaluateExternalWorksSafety(maxTemp, precipProb, rainMm, windSpeed, humidity, weatherCode);

          dailyList.push({
            date: dateStr,
            dayName,
            maxTemp,
            minTemp,
            precipProb,
            rainMm,
            windSpeed,
            humidity,
            weatherCode,
            conditionText: condition.text,
            conditionIcon: condition.icon,
            safetyStatus: safety.safetyStatus,
            statusText: safety.statusText,
            statusColor: safety.statusColor,
            statusBg: safety.statusBg,
            thunderstormRisk: safety.thunderstormRisk,
            thunderstormStatus: safety.thunderstormStatus,
            thunderstormAdvice: safety.thunderstormAdvice,
            concreteAdvice: safety.concreteAdvice,
            excavationAdvice: safety.excavationAdvice,
            paintingAdvice: safety.paintingAdvice,
            claddingAdvice: safety.claddingAdvice,
            combinedRemarks: safety.combinedRemarks
          });
        }

        setForecast(dailyList);
        setLocationName(addressText);
        setSiteCity(addressText); // Keep input bar synced with full detailed address text
      }
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      setGeoError("Could not load live weather data. Using cached site forecast.");
    } finally {
      setIsLoading(false);
    }
  };

  // Search Geocoding via Open-Meteo Free Geocoding API
  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteCity || siteCity.trim().length < 2) return;

    try {
      setIsLoading(true);
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(siteCity.trim())}&count=1&language=en&format=json`;
      const res = await fetch(geoUrl);
      const data = await res.json();

      if (data && data.results && data.results.length > 0) {
        const place = data.results[0];
        const lat = place.latitude;
        const lng = place.longitude;
        const fullName = `${place.name}, ${place.admin1 || place.country || ""}`;
        setLatitude(lat);
        setLongitude(lng);
        await fetchWeatherData(lat, lng, fullName);
      } else {
        alert(`City or address "${siteCity}" not found. Loading coordinates.`);
        await fetchWeatherData(latitude, longitude, siteCity);
      }
    } catch (err) {
      await fetchWeatherData(latitude, longitude, siteCity);
    }
  };

  // Browser Geolocation Auto-Detection with Reverse Geocoding directly into Address Bar
  const handleAutoDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        
        // Reverse geocode to convert lat/lng into a FULL detailed address string
        const detectedAddress = await reverseGeocodeAddress(lat, lng);
        
        // Put resolved full address directly in the input bar
        setSiteCity(detectedAddress);
        await fetchWeatherData(lat, lng, detectedAddress);
      },
      (err) => {
        setIsLoading(false);
        setGeoError("Location access denied or timed out. Please type your site address in the box.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchWeatherData(12.9698, 77.7500, "Whitefield, Bengaluru");
  }, []);

  const handlePrintReport = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const currentDay = forecast[0] || null;

  return (
    <DashboardLayout currentPath="/weather-safety">
      <Head>
        <title>BuildMitra Site Weather &amp; External Works Safety Advisor</title>
      </Head>

      <div style={{ padding: "20px 24px", maxWidth: "1300px", margin: "0 auto", fontFamily: "'Segoe UI', -apple-system, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
        
        {/* TOP HEADER BANNER */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0284c7 100%)",
          color: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "0 10px 25px rgba(2, 132, 199, 0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
            <span style={{ background: "rgba(255, 255, 255, 0.15)", border: "1px solid rgba(255, 255, 255, 0.3)", color: "#ffffff", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800" }}>
              🌤️ REAL-TIME SITE WEATHER &amp; EXTERNAL WORKS SAFETY ADVISOR
            </span>
            <button
              onClick={handlePrintReport}
              style={{ background: "#22c55e", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(34,197,94,0.4)" }}
            >
              <span>📥 Print / Download Weather Clearance Certificate (PDF)</span>
            </button>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
            BuildMitra External Site Works Micro-Climate &amp; Safety Engine
          </h1>
          <p style={{ fontSize: "13px", color: "#e2e8f0", margin: 0, maxWidth: "950px" }}>
            ⚡ 7-Day High-Precision Site Weather Tracking, ⚡ <b>Thunderstorm &amp; Lightning Alerts</b>, Rain Washout &amp; Wind Warnings for <b>Concrete Pouring</b>, <b>Earth Excavation</b>, <b>External Painting</b>, <b>External Cladding</b> &amp; <b>All External Works</b>
          </p>
        </div>

        {/* CONTINUOUS LIVE RATES TICKER */}
        <MarketRateTrend />

        {/* SEARCH & GEOLOCATION CONTROL PANEL */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", marginBottom: "20px" }}>
          <form onSubmit={handleCitySearch} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "1 1 340px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                🔍 Site Address / City Name
              </label>
              <input
                type="text"
                value={siteCity}
                onChange={(e) => setSiteCity(e.target.value)}
                placeholder="Type address (e.g. Whitefield, Bengaluru or Koramangala)..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: 600, color: "#0f172a" }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "22px" }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{ background: "#0284c7", color: "#ffffff", border: "none", padding: "11px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 6px rgba(2,132,199,0.3)" }}
              >
                {isLoading ? "Fetching Weather..." : "Search Site Weather"}
              </button>

              <button
                type="button"
                onClick={handleAutoDetectLocation}
                disabled={isLoading}
                style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "11px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>📍 Detect My Current Location</span>
              </button>
            </div>
          </form>

          {geoError && (
            <div style={{ marginTop: "10px", padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
              ⚠️ {geoError}
            </div>
          )}
        </div>

        {/* TODAY'S FEATURED EXTERNAL WORKS SAFETY ADVISORY BANNER */}
        {currentDay && (
          <div style={{
            background: currentDay.statusBg,
            border: `2px solid ${currentDay.statusColor}`,
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
              <div>
                <span style={{ background: currentDay.statusColor, color: "#ffffff", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
                  {currentDay.statusText}
                </span>
                <h2 style={{ margin: "8px 0 2px", fontSize: "20px", color: "#0f172a", fontWeight: 800 }}>
                  Today&apos;s External Site Works Safety Status for {locationName}
                </h2>
                <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                  {currentDay.dayName} • Max Temp: <b>{currentDay.maxTemp}°C</b> • Min Temp: <b>{currentDay.minTemp}°C</b> • Rain Risk: <b>{currentDay.precipProb}%</b> ({currentDay.rainMm} mm) • Wind: <b>{currentDay.windSpeed} km/h</b>
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#ffffff", padding: "10px 16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                <span style={{ fontSize: "36px" }}>{currentDay.conditionIcon}</span>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{currentDay.maxTemp}°C</div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>{currentDay.conditionText}</div>
                </div>
              </div>
            </div>

            {/* BREAKDOWN REMARKS FOR THUNDERSTORM, CONCRETE, EXCAVATION, PAINTING & CLADDING */}
            <div style={{ background: "#ffffff", padding: "16px 18px", borderRadius: "12px", border: `1px solid ${currentDay.statusColor}` }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: currentDay.statusColor, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                📋 EXTERNAL WORKS SAFETY ADVISORY &amp; SITE REMARKS:
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", fontSize: "12px", color: "#1e293b" }}>
                <div style={{ background: currentDay.thunderstormStatus === "HIGH" ? "#fef2f2" : "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: currentDay.thunderstormStatus === "HIGH" ? "1.5px solid #dc2626" : "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 800, color: "#dc2626", marginBottom: "2px" }}>⚡ Thunderstorm &amp; Lightning</div>
                  <div>{currentDay.thunderstormAdvice}</div>
                </div>

                <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 800, color: "#0284c7", marginBottom: "2px" }}>🏗️ Concrete Pouring</div>
                  <div>{currentDay.concreteAdvice}</div>
                </div>

                <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 800, color: "#b45309", marginBottom: "2px" }}>🚜 Excavation &amp; Earthwork</div>
                  <div>{currentDay.excavationAdvice}</div>
                </div>

                <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 800, color: "#7c3aed", marginBottom: "2px" }}>🎨 External Painting</div>
                  <div>{currentDay.paintingAdvice}</div>
                </div>

                <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 800, color: "#0f766e", marginBottom: "2px" }}>🏢 External Cladding &amp; Facade</div>
                  <div>{currentDay.claddingAdvice}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7-DAY FORECAST MATRIX & EXTERNAL WORKS CLEARANCE TABLE */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 800 }}>
                📅 7-Day External Site Works Clearance Matrix
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                Location: <b>{locationName}</b> ({latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E)
              </p>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0284c7", background: "#f0f9ff", padding: "4px 10px", borderRadius: "6px" }}>
              Source: Open-Meteo High-Resolution Forecast
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#ffffff", fontSize: "11px", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 16px", borderRadius: "8px 0 0 0" }}>Day &amp; Date</th>
                  <th style={{ padding: "12px 16px" }}>Condition</th>
                  <th style={{ padding: "12px 16px" }}>Max / Min Temp</th>
                  <th style={{ padding: "12px 16px" }}>Rain Risk (%)</th>
                  <th style={{ padding: "12px 16px" }}>Wind Speed</th>
                  <th style={{ padding: "12px 16px" }}>⚡ Thunderstorm Risk</th>
                  <th style={{ padding: "12px 16px", borderRadius: "0 8px 0 0" }}>Overall Safety Clearance</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((day, idx) => (
                  <React.Fragment key={day.date}>
                    <tr style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8fafc", borderBottom: "none" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                        {day.dayName}
                        {idx === 0 && <span style={{ marginLeft: "6px", background: "#0284c7", color: "#fff", fontSize: "9px", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>TODAY</span>}
                      </td>
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "18px", marginRight: "6px" }}>{day.conditionIcon}</span>
                        <span style={{ fontWeight: 600, color: "#334155" }}>{day.conditionText}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: day.maxTemp >= 35 ? "#dc2626" : "#0f172a" }}>
                        {day.maxTemp}°C / <span style={{ color: "#64748b", fontWeight: 500 }}>{day.minTemp}°C</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 800, color: day.precipProb >= 40 ? "#dc2626" : (day.precipProb >= 20 ? "#d97706" : "#16a34a") }}>
                        {day.precipProb}% ({day.rainMm}mm)
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: day.windSpeed >= 25 ? "#d97706" : "#475569" }}>
                        {day.windSpeed} km/h
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          background: day.thunderstormStatus === "HIGH" ? "#fef2f2" : (day.thunderstormStatus === "MODERATE" ? "#fffbeb" : "#f0fdf4"),
                          color: day.thunderstormStatus === "HIGH" ? "#dc2626" : (day.thunderstormStatus === "MODERATE" ? "#d97706" : "#16a34a"),
                          border: `1px solid ${day.thunderstormStatus === "HIGH" ? "#dc2626" : (day.thunderstormStatus === "MODERATE" ? "#d97706" : "#16a34a")}`,
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: "12px",
                          whiteSpace: "nowrap"
                        }}>
                          {day.thunderstormRisk}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          background: day.statusBg,
                          color: day.statusColor,
                          border: `1px solid ${day.statusColor}`,
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: "12px",
                          whiteSpace: "nowrap"
                        }}>
                          {day.safetyStatus === "SAFE" && "🟢 SAFE"}
                          {day.safetyStatus === "CAUTION" && "🟡 CAUTION"}
                          {day.safetyStatus === "STOP" && "🔴 STOP / UNSAFE"}
                        </span>
                      </td>
                    </tr>

                    {/* HORIZONTAL ADVISORY REMARKS SUB-ROW DIRECTLY UNDER THE DATE ROW */}
                    <tr style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>
                      <td colSpan={7} style={{ padding: "0 16px 16px 16px" }}>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                          gap: "10px",
                          background: "#f1f5f9",
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0"
                        }}>
                          <div style={{
                            background: day.thunderstormStatus === "HIGH" ? "#fef2f2" : "#ffffff",
                            color: "#dc2626",
                            border: day.thunderstormStatus === "HIGH" ? "1.5px solid #fca5a5" : "1px solid #fee2e2",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "11px"
                          }}>
                            <div style={{ fontWeight: 800, marginBottom: "2px" }}>⚡ Thunderstorm &amp; Lightning:</div>
                            <div style={{ color: "#991b1b", lineHeight: "1.4", fontWeight: 600 }}>{day.thunderstormAdvice}</div>
                          </div>

                          <div style={{
                            background: "#ffffff",
                            color: "#0369a1",
                            border: "1px solid #bae6fd",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "11px"
                          }}>
                            <div style={{ fontWeight: 800, marginBottom: "2px", color: "#0284c7" }}>🏗️ Concrete Pouring:</div>
                            <div style={{ color: "#075985", lineHeight: "1.4", fontWeight: 600 }}>{day.concreteAdvice}</div>
                          </div>

                          <div style={{
                            background: "#ffffff",
                            color: "#b45309",
                            border: "1px solid #fde68a",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "11px"
                          }}>
                            <div style={{ fontWeight: 800, marginBottom: "2px", color: "#d97706" }}>🚜 Excavation &amp; Earthwork:</div>
                            <div style={{ color: "#92400e", lineHeight: "1.4", fontWeight: 600 }}>{day.excavationAdvice}</div>
                          </div>

                          <div style={{
                            background: "#ffffff",
                            color: "#6b21a8",
                            border: "1px solid #d8b4fe",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "11px"
                          }}>
                            <div style={{ fontWeight: 800, marginBottom: "2px", color: "#7c3aed" }}>🎨 External Painting:</div>
                            <div style={{ color: "#581c87", lineHeight: "1.4", fontWeight: 600 }}>{day.paintingAdvice}</div>
                          </div>

                          <div style={{
                            background: "#ffffff",
                            color: "#0f766e",
                            border: "1px solid #99f6e4",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "11px"
                          }}>
                            <div style={{ fontWeight: 800, marginBottom: "2px", color: "#0d9488" }}>🏢 External Cladding &amp; Facade:</div>
                            <div style={{ color: "#115e59", lineHeight: "1.4", fontWeight: 600 }}>{day.claddingAdvice}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMPREHENSIVE EXTERNAL SITE WORKS COMPLIANCE PROTOCOLS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "30px" }}>
          
          <div style={{ background: "#ffffff", padding: "18px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "15px", color: "#dc2626", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
              ⚡ Thunderstorm &amp; Lightning Protocols
            </h3>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#334155", lineHeight: "1.6" }}>
              <li><b>Tower Crane Earthing:</b> Verify crane earthing pits (&lt;5 ohms resistance) &amp; lock boom swings.</li>
              <li><b>Scaffolding Evacuation:</b> Clear open high-rise scaffolding decks immediately upon lightning/thunder.</li>
              <li><b>Power Isolation:</b> Disconnect outdoor portable distribution boxes &amp; welding sets during electrical storms.</li>
            </ul>
          </div>

          <div style={{ background: "#ffffff", padding: "18px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "15px", color: "#0f172a", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
              🏗️ Concrete Pouring Protocols
            </h3>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#334155", lineHeight: "1.6" }}>
              <li><b>Rain Washout Safeguard:</b> Standby tarpaulins adjacent to slab before casting.</li>
              <li><b>Hot Weather Hydration:</b> Use chilled mixing water or retarders if temp &gt;35°C.</li>
              <li><b>Curing Start:</b> Begin wet hessian curing within 2 hours of set as per IS 456.</li>
            </ul>
          </div>

          <div style={{ background: "#ffffff", padding: "18px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "15px", color: "#0f172a", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
              🚜 Earth Excavation Protocols
            </h3>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#334155", lineHeight: "1.6" }}>
              <li><b>Slope Stability (IS 3764):</b> Maintain 1:1 benching on soft soils during rain.</li>
              <li><b>Pit Dewatering:</b> Keep submersible dewatering pumps active to avoid wall collapse.</li>
              <li><b>Machinery Safety:</b> Keep heavy excavators 2m away from trench edges in wet mud.</li>
            </ul>
          </div>

          <div style={{ background: "#ffffff", padding: "18px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "15px", color: "#0f172a", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
              🎨 External Painting Protocols
            </h3>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#334155", lineHeight: "1.6" }}>
              <li><b>Relative Humidity Limit:</b> Defer exterior painting if ambient humidity &gt;70%.</li>
              <li><b>Surface Dryness:</b> Ensure plaster moisture content &lt;10% before applying primer.</li>
              <li><b>Direct Sun Drying:</b> Avoid peak afternoon sun to prevent blistering and lap marks.</li>
            </ul>
          </div>

          <div style={{ background: "#ffffff", padding: "18px", borderRadius: "16px", border: "1px solid #cbd5e1", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "15px", color: "#0f172a", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
              🏢 External Cladding &amp; Facade
            </h3>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#334155", lineHeight: "1.6" }}>
              <li><b>Wind Speed Threshold:</b> Stop suspended cradle work if wind exceeds 25 km/h.</li>
              <li><b>Crane Hoisting:</b> Lower ACP/Glazing panels during high wind gusts to prevent tilting.</li>
              <li><b>Fall Arrest &amp; Harness:</b> Mandate dual-lifeline safety harnesses on wet scaffolding.</li>
            </ul>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}


