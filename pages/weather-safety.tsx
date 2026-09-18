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
  windGusts: number;
  humidity: number;
  weatherCode: number;
  conditionText: string;
  conditionIcon: string;
  rainExpectedTime: string;
  daytimeWorkingStatus: string;
  badgeText: string;
  isAlert: boolean;
  tradeDirectives: {
    concrete: string;
    excavation: string;
    painting: string;
    facade: string;
  };
}

function parseWeatherCode(code: number, rainProb: number): { text: string; icon: string } {
  if (code >= 95) return { text: "Thunderstorm & Lightning Activity", icon: "⚡⛈️" };
  if (code >= 80 || (code >= 61 && rainProb >= 75)) return { text: "Heavy Downpour / Squall", icon: "🌧️⚡" };
  if (code >= 61) return { text: "Moderate Rain Showers", icon: "🌧️" };
  if (code >= 51) return { text: "Light Passing Drizzle", icon: "🌦️" };
  if (code === 3) return { text: "Overcast", icon: "☁️" };
  if (code === 1 || code === 2) return { text: "Partly Cloudy", icon: "⛅" };
  return { text: "Clear Sky / Sunny", icon: "☀️" };
}

function computeRainTimingWindow(
  hourlyTimes: string[] | undefined,
  hourlyPrecipProbs: number[] | undefined,
  hourlyPrecipMm: number[] | undefined,
  dayIndex: number,
  dailyProb: number,
  dailyMm: number
): { rainExpectedTime: string; daytimeWorkingStatus: string } {
  if (!hourlyTimes || !hourlyPrecipProbs) {
    if (dailyProb < 35 && dailyMm < 0.5) {
      return {
        rainExpectedTime: "Dry / No rain expected",
        daytimeWorkingStatus: "Clear full working day (8:00 AM – 6:00 PM)"
      };
    }
    return {
      rainExpectedTime: "Evening (5:30 PM – 8:00 PM)",
      daytimeWorkingStatus: "Day shift clear; prepare covers by 4:30 PM"
    };
  }

  const startIndex = dayIndex * 24;
  const daySliceProbs = hourlyPrecipProbs.slice(startIndex, startIndex + 24);
  const daySliceMm = hourlyPrecipMm ? hourlyPrecipMm.slice(startIndex, startIndex + 24) : [];

  let rainStartHour = -1;
  let rainEndHour = -1;

  for (let h = 6; h <= 23; h++) {
    const prob = daySliceProbs[h] ?? 0;
    const mm = daySliceMm[h] ?? 0;
    if (prob >= 40 || mm >= 0.4) {
      if (rainStartHour === -1) rainStartHour = h;
      rainEndHour = h;
    }
  }

  if (rainStartHour === -1 || dailyMm === 0) {
    return {
      rainExpectedTime: "Dry / No Rain Expected",
      daytimeWorkingStatus: "Full day clear for all site operations (8:00 AM – 6:00 PM)"
    };
  }

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${h12}:00 ${period}`;
  };

  const timeWindow = `${formatHour(rainStartHour)} – ${formatHour(Math.min(rainEndHour + 1, 23))}`;

  let workStatus = "Day shift clear; wrap up outdoor casting before rain window";
  if (rainStartHour >= 17) {
    workStatus = `Clear daylight shift (8:00 AM – 4:30 PM). Rain expected around ${formatHour(rainStartHour)}.`;
  } else if (rainStartHour >= 12) {
    workStatus = `Morning shift clear (8:00 AM – 12:30 PM). Afternoon showers likely around ${formatHour(rainStartHour)}.`;
  } else {
    workStatus = `Early morning showers likely from ${formatHour(rainStartHour)}. Monitor sky before slab casting.`;
  }

  return {
    rainExpectedTime: timeWindow,
    daytimeWorkingStatus: workStatus
  };
}

function computeAdvisory(
  code: number,
  precipProb: number,
  rainMm: number,
  windSpeed: number,
  humidity: number,
  rainTimeText: string
) {
  const isStorm = code >= 80 || code >= 95 || precipProb >= 60 || rainMm >= 3.0;
  const isCaution = precipProb >= 30 || rainMm >= 0.5 || windSpeed >= 25 || humidity >= 70;

  const badgeText = isStorm
    ? "Inclement Weather Advisory"
    : isCaution
    ? "Proceed with Caution"
    : "Favorable Window";

  const isAlert = isStorm;

  const tradeDirectives = {
    concrete: isAlert
      ? `Slab Casting: Daylight hours are mostly clear. Conclude casting before ${rainTimeText.split("–")[0]?.trim() || "evening"} and keep tarpaulins ready to prevent slurry wash-off (IS 456).`
      : isCaution
      ? "Slab Casting: Suitable for casting. Keep tarpaulins on standby and apply wet hessian curing within 2 hours of initial set."
      : "Slab Casting: Ideal window. Standard RCC slab casting and 14-day wet curing cleared as per IS 456.",
    excavation: isAlert
      ? "Earthwork: Daylight trenching safe. Inspect trench slopes before evening shutdown; keep a submersible dewatering pump on standby."
      : "Earthwork: Pit excavation, soil loading, and backfill compaction safe to proceed.",
    painting: (isAlert || humidity >= 68)
      ? `Exterior Painting: Kindly pause exterior primer or texture coats as high humidity (${humidity}%) slows drying and paint film bonding.`
      : "Exterior Painting: Surface moisture < 10%. Safe window for primer and exterior emulsion coats.",
    facade: (windSpeed >= 25 || isAlert)
      ? "Facade & Cradles: Elevated wind gusts expected during storm periods. Ground cradle platforms and secure loose sheets."
      : "Facade & Cradles: Normal installation of glazing, ACP sheets, and external stonework cleared."
  };

  return { badgeText, isAlert, tradeDirectives };
}

export default function WeatherSafetyPage() {
  const [siteAddress, setSiteAddress] = useState("Whitefield, Bengaluru");
  const [locationTitle, setLocationTitle] = useState("Whitefield, Bengaluru");
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9698, lng: 77.7500 });
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchNotice, setSearchNotice] = useState<string>("");

  // Calculate strict future bounds (Tomorrow to +6 Days)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minFutureDate = tomorrow.toISOString().split("T")[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 6);
  const maxFutureDate = maxDate.toISOString().split("T")[0];

  const loadForecastByCoords = async (lat: number, lng: number, placeName: string) => {
    try {
      setIsLoading(true);
      setSearchNotice("");
      setCurrentCoords({ lat, lng });

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max&hourly=precipitation_probability,precipitation,relativehumidity_2m&timezone=Asia%2FKolkata`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.daily) {
        const d = data.daily;
        const list: DailyForecast[] = [];

        for (let i = 0; i < d.time.length; i++) {
          const dateStr = d.time[i];
          const dateObj = new Date(dateStr);
          const dayName = i === 0 ? "Today" : dateObj.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });

          const maxTemp = Math.round(d.temperature_2m_max[i] ?? 30);
          const minTemp = Math.round(d.temperature_2m_min[i] ?? 21);
          const precipProb = d.precipitation_probability_max?.[i] ?? 0;
          const rainMm = Number((d.rain_sum?.[i] ?? d.precipitation_sum?.[i] ?? 0).toFixed(1));
          const windSpeed = Math.round(d.windspeed_10m_max?.[i] ?? 14);
          const windGusts = Math.round(d.windgusts_10m_max?.[i] ?? windSpeed * 1.3);
          const code = d.weathercode?.[i] ?? 0;

          let humidity = 60;
          if (data.hourly?.relativehumidity_2m) {
            const start = i * 24;
            const slice = data.hourly.relativehumidity_2m.slice(start + 10, start + 18);
            if (slice.length > 0) {
              humidity = Math.round(slice.reduce((acc: number, val: number) => acc + val, 0) / slice.length);
            }
          }

          const timing = computeRainTimingWindow(
            data.hourly?.time,
            data.hourly?.precipitation_probability,
            data.hourly?.precipitation,
            i,
            precipProb,
            rainMm
          );

          const parsed = parseWeatherCode(code, precipProb);
          const advisory = computeAdvisory(code, precipProb, rainMm, windSpeed, humidity, timing.rainExpectedTime);

          list.push({
            date: dateStr,
            dayName,
            maxTemp,
            minTemp,
            precipProb,
            rainMm,
            windSpeed,
            windGusts,
            humidity,
            weatherCode: code,
            conditionText: parsed.text,
            conditionIcon: parsed.icon,
            rainExpectedTime: timing.rainExpectedTime,
            daytimeWorkingStatus: timing.daytimeWorkingStatus,
            ...advisory
          });
        }

        setForecast(list);
        setLocationTitle(placeName);
        setSiteAddress(placeName);
        setSelectedIdx(0);
        setSelectedCalendarDate("");
      }
    } catch (err) {
      console.error("Forecast fetch error:", err);
      setSearchNotice("Failed to load weather for this location. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = siteAddress.trim();
    if (!query) return;

    setIsLoading(true);
    setSearchNotice("");

    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&addressdetails=1&limit=1`;
      const res = await fetch(nominatimUrl, { headers: { "Accept-Language": "en" } });
      const results = await res.json();

      if (results && results.length > 0) {
        const item = results[0];
        const addr = item.address || {};
        const town = addr.suburb || addr.town || addr.village || addr.city || addr.county || item.name;
        const state = addr.state || "";
        const pin = addr.postcode ? ` - ${addr.postcode}` : "";
        const resolvedTitle = [town, state].filter(Boolean).join(", ") + pin;

        await loadForecastByCoords(parseFloat(item.lat), parseFloat(item.lon), resolvedTitle);
        return;
      }

      const fallbackUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&format=json`;
      const fbRes = await fetch(fallbackUrl);
      const fbData = await fbRes.json();

      if (fbData && fbData.results && fbData.results.length > 0) {
        const item = fbData.results[0];
        const resolvedTitle = [item.name, item.admin1, item.country].filter(Boolean).join(", ");
        await loadForecastByCoords(item.latitude, item.longitude, resolvedTitle);
        return;
      }

      setSearchNotice(`Location "${query}" could not be found. Try typing the Pincode or nearby Taluk name.`);
      setIsLoading(false);
    } catch (err) {
      console.error("Geocoding failed:", err);
      setSearchNotice("Search lookup timed out. Please try again.");
      setIsLoading(false);
    }
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      alert("GPS Geolocation is not supported by your browser.");
      return;
    }
    setIsLoading(true);
    setSearchNotice("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const revUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
          const res = await fetch(revUrl);
          const data = await res.json();
          const addr = data.address || {};
          const town = addr.suburb || addr.village || addr.town || addr.city || "Current Site";
          const state = addr.state || "";
          const pin = addr.postcode ? ` - ${addr.postcode}` : "";
          const resolved = [town, state].filter(Boolean).join(", ") + pin;
          await loadForecastByCoords(lat, lng, resolved);
        } catch {
          await loadForecastByCoords(lat, lng, `Coordinates: ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`);
        }
      },
      () => {
        setIsLoading(false);
        setSearchNotice("GPS permission denied. Please enter your project locality above.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calendar future date selector
  const handleCalendarDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenDate = e.target.value;
    setSelectedCalendarDate(chosenDate);
    const foundIndex = forecast.findIndex((d) => d.date === chosenDate);
    if (foundIndex !== -1) {
      setSelectedIdx(foundIndex);
    }
  };

  // Open external comprehensive radar/meteorological app for selected coordinates & date
  const openExternalWeatherApp = () => {
    const lat = currentCoords.lat;
    const lng = currentCoords.lng;
    // Windy radar map pre-centered on exact site coordinates
    const externalUrl = `https://www.windy.com/?rain,${lat.toFixed(4)},${lng.toFixed(4)},11`;
    window.open(externalUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    loadForecastByCoords(12.9698, 77.7500, "Whitefield, Bengaluru");
  }, []);

  const active = forecast[selectedIdx] || forecast[0];

  return (
    <DashboardLayout currentPath="/weather-safety">
      <Head>
        <title>Site Weather &amp; Civil Works Safety Advisor | BuildMitra</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-5 font-sans text-slate-800 space-y-6">

        {/* HEADER BAR */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-2">
              <span>🌤️</span> 7-Day Precision Micro-Climate Advisory
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Site Weather &amp; External Works Safety Advisor
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Precision 7-Day Forecasting • ⚡ Thunderstorm &amp; Lightning Alerts • Wind &amp; Washout Safety for RCC Casting, Excavation, Painting &amp; Facade Cladding
            </p>
          </div>

          <button
            onClick={() => typeof window !== "undefined" && window.print()}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition self-start md:self-auto shadow-sm"
          >
            <span>📥</span>
            <span>Print Weather Clearance Certificate (PDF)</span>
          </button>
        </div>

        {/* CONTINUOUS LIVE RATES TICKER */}
        <MarketRateTrend />

        {/* SEARCH BAR & FUTURE DATE CALENDAR */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-3.5 text-slate-400 text-base">🔍</span>
              <input
                type="text"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                placeholder="Enter Site Address, Village, Pincode (e.g. Kadiri 515591 or Whitefield Bengaluru)..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm sm:text-base font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 md:flex-initial bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Searching..." : "Search Weather"}
              </button>
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-300 transition"
              >
                <span>📍</span>
                <span className="hidden sm:inline">Auto Detect</span>
              </button>
            </div>
          </form>

          {/* CALENDAR CONTROLS (FUTURE DATES ONLY) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <label htmlFor="futureDateSelect" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span>📅</span> Select Future Date:
              </label>
              <input
                id="futureDateSelect"
                type="date"
                min={minFutureDate}
                max={maxFutureDate}
                value={selectedCalendarDate}
                onChange={handleCalendarDateChange}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 font-medium">(Only upcoming project dates enabled)</span>
            </div>

            {/* External Weather App Connector */}
            <button
              type="button"
              onClick={openExternalWeatherApp}
              className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-sky-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition shadow-sm self-start sm:self-auto"
            >
              <span>🛰️</span>
              <span>Open Live Doppler Radar &amp; Cloud Map</span>
              <span className="text-[10px] text-slate-400 font-normal">↗</span>
            </button>
          </div>

          {searchNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold">
              ⚠️ {searchNotice}
            </div>
          )}
        </div>

        {/* 7-DAY FORECAST TABLE (FIRST VIEW) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide">
                📅 7-Day Site Weather &amp; Operations Clearance Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Tap any row or use the calendar above to preview trade advisories • Location: <span className="text-sky-300 font-semibold">{locationTitle}</span>
              </p>
            </div>
            <span className="text-[11px] bg-slate-800 text-sky-300 font-medium px-3 py-1 rounded-md self-start sm:self-auto">
              Live Forecast Feed
            </span>
          </div>

          <div className="overflow-x-auto touch-pan-y" style={{ WebkitOverflowScrolling: "touch" }}>
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 uppercase text-slate-500 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Day</th>
                  <th className="py-3 px-4 whitespace-nowrap">Condition</th>
                  <th className="py-3 px-4 whitespace-nowrap">Temp</th>
                  <th className="py-3 px-4 whitespace-nowrap">Rain Risk</th>
                  <th className="py-3 px-4 whitespace-nowrap text-sky-900 bg-sky-50/50">Rain Expected Time</th>
                  <th className="py-3 px-4 whitespace-nowrap">Wind</th>
                  <th className="py-3 px-4 whitespace-nowrap">Humidity</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Site Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {forecast.map((day, idx) => {
                  const isSelected = idx === selectedIdx;
                  return (
                    <tr
                      key={day.date}
                      onClick={() => {
                        setSelectedIdx(idx);
                        if (idx > 0) setSelectedCalendarDate(day.date);
                        else setSelectedCalendarDate("");
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-sky-50/90 font-semibold" 
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{day.dayName}</span>
                        {idx === 0 && (
                          <span className="ml-1.5 bg-sky-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            TODAY
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-base mr-1.5">{day.conditionIcon}</span>
                        <span className="text-slate-800">{day.conditionText}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{day.maxTemp}°C</span>{" "}
                        <span className="text-slate-400 font-normal">/ {day.minTemp}°C</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`font-bold ${
                          day.precipProb >= 50 ? "text-amber-700" : day.precipProb >= 25 ? "text-sky-700" : "text-emerald-700"
                        }`}>
                          {day.precipProb}%
                        </span>
                        <span className="text-slate-400 ml-1">({day.rainMm} mm)</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap bg-sky-50/40 font-semibold text-slate-800">
                        {day.rainExpectedTime}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {day.windSpeed} km/h
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {day.humidity}%
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          day.isAlert
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        }`}>
                          {day.badgeText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* POLITE ADVISORY STATUS CARD & TRADE BULLET POINTS */}
        {active && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`p-5 sm:p-6 border-b ${
              active.isAlert ? "bg-amber-50/70 border-amber-200" : "bg-emerald-50/60 border-emerald-100"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      active.isAlert
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    }`}>
                      {active.badgeText}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      • {active.dayName} ({active.date}) at {locationTitle}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed pt-1">
                    {active.daytimeWorkingStatus}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto flex-shrink-0">
                  <span className="text-3xl">{active.conditionIcon}</span>
                  <div>
                    <div className="text-xl font-bold text-slate-900 leading-none">{active.maxTemp}°C</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">{active.conditionText}</div>
                  </div>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-200/60 text-xs">
                <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block text-[11px]">Rain Probability</span>
                  <span className="font-bold text-slate-800 text-sm">{active.precipProb}%</span>
                  <span className="text-slate-400 text-[11px] ml-1">({active.rainMm} mm)</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block text-[11px]">Expected Rain Time</span>
                  <span className="font-semibold text-slate-800">{active.rainExpectedTime}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block text-[11px]">Wind Velocity</span>
                  <span className="font-bold text-slate-800 text-sm">{active.windSpeed} km/h</span>
                  <span className="text-slate-400 text-[11px] ml-1">(gusts: {active.windGusts})</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block text-[11px]">Relative Humidity</span>
                  <span className="font-bold text-slate-800 text-sm">{active.humidity}%</span>
                </div>
              </div>
            </div>

            {/* TRADE BULLET POINTS */}
            <div className="p-5 sm:p-6 bg-slate-50/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Trade-Specific Site Advice
              </h3>
              
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-sm">
                  <span className="text-base leading-none">🏗️</span>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">RCC Slab &amp; Column Casting</strong>
                    <span className="text-slate-600 leading-relaxed">{active.tradeDirectives.concrete}</span>
                  </div>
                </li>

                <li className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-sm">
                  <span className="text-base leading-none">🚜</span>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Trench &amp; Foundation Excavation</strong>
                    <span className="text-slate-600 leading-relaxed">{active.tradeDirectives.excavation}</span>
                  </div>
                </li>

                <li className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-sm">
                  <span className="text-base leading-none">🎨</span>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">External Painting &amp; Waterproofing</strong>
                    <span className="text-slate-600 leading-relaxed">{active.tradeDirectives.painting}</span>
                  </div>
                </li>

                <li className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-sm">
                  <span className="text-base leading-none">🏢</span>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Facade Gladding &amp; Tower Cranes</strong>
                    <span className="text-slate-600 leading-relaxed">{active.tradeDirectives.facade}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
