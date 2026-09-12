import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  CloudRain,
  Sun,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudSnow,
  Cloud,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, EmptyStateCard } from '../components/ui/Card';
import { weatherService, type NormalizedWeatherData } from '../services/weatherService';

export const WeatherPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { siteIntelligenceRecords } = useAppStore();

  // Selected Location ID from URL or default to first record
  const paramLocationId = searchParams.get('locationId');

  const selectedRecord = React.useMemo(() => {
    if (!siteIntelligenceRecords || siteIntelligenceRecords.length === 0) return null;
    if (paramLocationId) {
      const found = siteIntelligenceRecords.find(
        (r) => r.locationId === paramLocationId || r.id === paramLocationId
      );
      if (found) return found;
    }
    return siteIntelligenceRecords[0];
  }, [siteIntelligenceRecords, paramLocationId]);

  // Weather state
  const [weatherData, setWeatherData] = useState<NormalizedWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<'temp' | 'rainfall' | 'prob' | 'humidity'>('temp');

  // Fetch weather when selected location changes
  const loadWeather = async (
    loc: typeof selectedRecord,
    bypassCache: boolean = false
  ) => {
    if (!loc) return;

    if (bypassCache) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await weatherService.fetchLiveWeather(
        {
          id: loc.id,
          locationId: loc.locationId,
          locationName: loc.locationName,
          region: loc.region,
          latitude: loc.latitude,
          longitude: loc.longitude
        },
        bypassCache
      );
      setWeatherData(data);
    } catch (err: any) {
      console.error('Weather load error:', err);
      setError(err?.message || 'Failed to fetch live weather data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedRecord) {
      loadWeather(selectedRecord, false);
    }
  }, [selectedRecord?.id, selectedRecord?.latitude, selectedRecord?.longitude]);

  // Handle dropdown selection change
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locId = e.target.value;
    if (locId) {
      setSearchParams({ locationId: locId });
    }
  };

  // Weather Condition Icon Helper
  const getWeatherIcon = (code: number, text: string) => {
    if ([95, 96, 99].includes(code) || text.includes('Thunderstorm')) return CloudLightning;
    if ([61, 63, 65, 80, 81, 82].includes(code) || text.includes('Rain')) return CloudRain;
    if ([51, 53, 55, 56, 57].includes(code) || text.includes('Drizzle')) return CloudDrizzle;
    if ([45, 48].includes(code) || text.includes('Fog')) return CloudFog;
    if ([71, 73, 75, 77, 85, 86].includes(code) || text.includes('Snow')) return CloudSnow;
    if ([1, 2, 3].includes(code) || text.includes('Cloud')) return Cloud;
    return Sun;
  };

  // Operational Risk Color Badges
  const getRiskBadgeVariant = (risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    switch (risk) {
      case 'CRITICAL':
        return { bg: 'bg-[#3A1414] border-[#8B2626] text-[#FF8888]', label: 'CRITICAL RISK' };
      case 'HIGH':
        return { bg: 'bg-[#3A2614] border-[#B86B26] text-[#FFB066]', label: 'HIGH RISK' };
      case 'MEDIUM':
        return { bg: 'bg-[#2E2D15] border-[#8C8927] text-[#E6E265]', label: 'MEDIUM RISK' };
      default:
        return { bg: 'bg-[#1D2517] border-[#71825B]/40 text-[#A4B18A]', label: 'LOW RISK' };
    }
  };

  // 1. NO ANALYZED LOCATIONS STATE
  if (!siteIntelligenceRecords || siteIntelligenceRecords.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">Weather Operations</h1>
          <p className="text-xs text-[#71825B] font-mono">
            Live weather conditions and operational impact for analyzed mining locations
          </p>
        </div>
        <EmptyStateCard
          title="No analyzed locations available"
          description="Analyze a mining location first to enable location-specific weather operations and live meteorological impact assessments."
          icon={MapPin}
          actionText="GO TO ANALYZED LOCATIONS"
          onAction={() => navigate('/analyzed-locations')}
        />
      </div>
    );
  }

  // Current active icon
  const CurrentConditionIcon = weatherData
    ? getWeatherIcon(weatherData.current.weatherCode, weatherData.current.conditionText)
    : Sun;

  return (
    <div className="space-y-6 pb-12">
      {/* 2. TOP LOCATION SELECTOR */}
      <Card variant="primary" padding="md" className="border-[#71825B]/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-[#A4B18A] uppercase tracking-wider bg-[#0B0E09] px-2.5 py-0.5 rounded border border-[#252E1D]">
                WEATHER LOCATION
              </span>
              <span className="text-[10px] font-mono text-[#71825B]">
                {siteIntelligenceRecords.length} Analyzed Locations Available
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#F1F2E9] flex items-center gap-2">
              <MapPin size={18} className="text-[#A4B18A]" />
              Select Analyzed Mining Location
            </h2>
            <p className="text-xs text-[#71825B] font-mono">
              Live weather conditions and operational impact for the selected mining location
            </p>
          </div>

          <div className="w-full md:w-80">
            <select
              value={selectedRecord?.locationId || selectedRecord?.id || ''}
              onChange={handleLocationChange}
              className="w-full bg-[#0B0E09] border border-[#71825B]/50 hover:border-[#A4B18A] text-[#F1F2E9] font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#A4B18A] transition cursor-pointer shadow-inner"
            >
              {siteIntelligenceRecords.map((rec) => (
                <option key={rec.id} value={rec.locationId || rec.id}>
                  {rec.locationName} ({rec.region}) • {rec.latitude.toFixed(4)}°N, {rec.longitude.toFixed(4)}°E • AI: {rec.suitabilityScore}%
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 3. LOCATION CONTEXT HEADER */}
      {selectedRecord && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#171D12] border border-[#252E1D] p-5 rounded-2xl shadow-lg">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-xl bg-[#0B0E09] border border-[#252E1D] text-[#A4B18A] shrink-0">
              <MapPin size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-[#F1F2E9] tracking-tight">
                  {selectedRecord.locationName}
                </h1>
                <span className="text-xs font-mono font-semibold text-[#A4B18A] bg-[#0B0E09] border border-[#252E1D] px-2 py-0.5 rounded-lg">
                  {selectedRecord.region}
                </span>
              </div>
              <p className="text-xs font-mono text-[#71825B] mt-1 flex items-center gap-3 flex-wrap">
                <span>
                  Coordinates: <strong className="text-[#F1F2E9]">{selectedRecord.latitude.toFixed(4)}° N, {selectedRecord.longitude.toFixed(4)}° E</strong>
                </span>
                <span>•</span>
                <span>
                  AI Suitability Score: <strong className="text-[#A4B18A]">{selectedRecord.suitabilityScore}%</strong>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto border-t lg:border-t-0 border-[#252E1D] pt-3 lg:pt-0">
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#71825B] uppercase tracking-wider font-bold">
                Weather Source: Open-Meteo
              </div>
              <div className="text-xs font-mono text-[#F1F2E9]">
                {weatherData ? `Updated ${weatherData.current.updatedAt}` : 'Updating...'}
              </div>
            </div>

            <button
              onClick={() => selectedRecord && loadWeather(selectedRecord, true)}
              disabled={isLoading || isRefreshing}
              className="btn-clay-primary px-3.5 py-2 text-xs font-mono font-bold text-[#0B0E09] rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
              title="Fetch fresh live forecast from Open-Meteo"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Weather'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. API FAILURE HANDLING STATE */}
      {error && selectedRecord && (
        <Card variant="primary" className="border-[#8B2626]/50 bg-[#251010]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
            <div className="flex items-start gap-3">
              <AlertTriangle size={24} className="text-[#FF8888] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-[#FF8888]">Weather data temporarily unavailable</h3>
                <p className="text-xs text-[#E6B0B0] font-sans mt-1">
                  Live weather data could not be retrieved for {selectedRecord.locationName}. {error}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => loadWeather(selectedRecord, true)}
                className="px-3 py-1.5 bg-[#8B2626] hover:bg-[#A83232] text-white text-xs font-mono font-bold rounded-lg cursor-pointer transition"
              >
                Retry API
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* 5. LOADING STATE */}
      {isLoading && !weatherData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#171D12] border border-[#252E1D] rounded-2xl p-4" />
          ))}
        </div>
      )}

      {/* 6. MAIN WEATHER CONTENT (If weatherData loaded) */}
      {weatherData && (
        <>
          {/* CURRENT CONDITIONS & OPERATIONAL RISK GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CURRENT CONDITIONS CARD */}
            <Card variant="primary" className="lg:col-span-2">
              <CardHeader>
                <div>
                  <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold tracking-wider">
                    LIVE METEOROLOGICAL MEASUREMENTS
                  </span>
                  <CardTitle className="text-lg font-black text-[#F1F2E9] mt-0.5">
                    Current Atmospheric Conditions
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <CurrentConditionIcon size={28} className="text-[#A4B18A]" />
                  <span className="text-xs font-mono font-bold text-[#A4B18A] bg-[#0B0E09] px-2.5 py-1 rounded-lg border border-[#252E1D]">
                    {weatherData.current.conditionText}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Temp */}
                  <div className="bg-[#0B0E09] p-3.5 rounded-xl border border-[#252E1D]">
                    <div className="flex items-center gap-1.5 text-xs text-[#71825B] font-mono">
                      <Thermometer size={14} className="text-[#A4B18A]" />
                      <span>Temperature</span>
                    </div>
                    <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-1">
                      {weatherData.current.temperatureC}°C
                    </div>
                    <div className="text-[10px] text-[#71825B] font-mono mt-0.5">
                      Today: {weatherData.forecast[0]?.tempMaxC}° / {weatherData.forecast[0]?.tempMinC}°C
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="bg-[#0B0E09] p-3.5 rounded-xl border border-[#252E1D]">
                    <div className="flex items-center gap-1.5 text-xs text-[#71825B] font-mono">
                      <Droplets size={14} className="text-[#A4B18A]" />
                      <span>Humidity</span>
                    </div>
                    <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-1">
                      {weatherData.current.humidityPct}%
                    </div>
                    <div className="text-[10px] text-[#71825B] font-mono mt-0.5">
                      Soil Moisture: ~{weatherData.forecast[0]?.soilMoisturePct}%
                    </div>
                  </div>

                  {/* Rainfall */}
                  <div className="bg-[#0B0E09] p-3.5 rounded-xl border border-[#252E1D]">
                    <div className="flex items-center gap-1.5 text-xs text-[#71825B] font-mono">
                      <CloudRain size={14} className="text-[#A4B18A]" />
                      <span>Current Rainfall</span>
                    </div>
                    <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-1">
                      {weatherData.current.rainfallMm} <span className="text-xs font-normal text-[#71825B]">mm</span>
                    </div>
                    <div className="text-[10px] text-[#71825B] font-mono mt-0.5">
                      Precip Rate: {weatherData.current.rainfallMm > 0 ? 'Active' : '0.0 mm/h'}
                    </div>
                  </div>

                  {/* Wind */}
                  <div className="bg-[#0B0E09] p-3.5 rounded-xl border border-[#252E1D]">
                    <div className="flex items-center gap-1.5 text-xs text-[#71825B] font-mono">
                      <Wind size={14} className="text-[#A4B18A]" />
                      <span>Wind Speed</span>
                    </div>
                    <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-1">
                      {weatherData.current.windSpeedKmH} <span className="text-xs font-normal text-[#71825B]">km/h</span>
                    </div>
                    <div className="text-[10px] text-[#71825B] font-mono mt-0.5">
                      Gust Peak: {weatherData.forecast[0]?.windSpeedKmH} km/h
                    </div>
                  </div>

                  {/* Rain Prob */}
                  <div className="bg-[#0B0E09] p-3.5 rounded-xl border border-[#252E1D]">
                    <div className="flex items-center gap-1.5 text-xs text-[#71825B] font-mono">
                      <Activity size={14} className="text-[#A4B18A]" />
                      <span>Rain Probability</span>
                    </div>
                    <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-1">
                      {weatherData.current.precipitationProbability}%
                    </div>
                    <div className="text-[10px] text-[#71825B] font-mono mt-0.5">
                      Next 24h Peak
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="bg-[#0B0E09] p-3.5 rounded-xl border border-[#252E1D]">
                    <div className="flex items-center gap-1.5 text-xs text-[#71825B] font-mono">
                      <Calendar size={14} className="text-[#A4B18A]" />
                      <span>Timezone</span>
                    </div>
                    <div className="text-sm font-bold text-[#F1F2E9] font-mono mt-1 truncate">
                      {weatherData.current.timezone}
                    </div>
                    <div className="text-[10px] text-[#71825B] font-mono mt-0.5">
                      Last update: {weatherData.current.updatedAt}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OPERATIONAL WEATHER RISK GAUGE CARD */}
            <Card variant="primary" className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div>
                    <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold tracking-wider">
                      RULE-BASED ASSESSMENT
                    </span>
                    <CardTitle className="text-lg font-black text-[#F1F2E9] mt-0.5">
                      Current Weather Risk
                    </CardTitle>
                  </div>
                  <ShieldAlert size={24} className="text-[#A4B18A]" />
                </CardHeader>

                <div className="mt-4 text-center p-5 rounded-2xl bg-[#0B0E09] border border-[#252E1D]">
                  <div className="text-xs font-mono text-[#71825B] uppercase font-bold tracking-wider">
                    CALCULATED OPERATIONAL RISK
                  </div>

                  {(() => {
                    const badge = getRiskBadgeVariant(weatherData.overallRisk);
                    return (
                      <div className={`mt-3 inline-block font-mono font-black text-2xl px-6 py-2 rounded-xl border ${badge.bg}`}>
                        {badge.label}
                      </div>
                    );
                  })()}

                  <p className="text-xs text-[#A4B18A] font-sans leading-relaxed mt-3 max-w-xs mx-auto">
                    Calculated dynamically from live rainfall intensity, wind gusts, soil saturation, and forecast thunder hazards for {weatherData.locationName}.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#252E1D] text-[11px] font-mono text-[#71825B] flex justify-between">
                <span>Location ID: {weatherData.locationId}</span>
                <span className="text-[#A4B18A]">Live Open-Meteo Stream</span>
              </div>
            </Card>
          </div>

          {/* 7-DAY FORECAST GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#F1F2E9] tracking-tight">
                  7-Day Meteorological Forecast
                </h3>
                <p className="text-xs text-[#71825B] font-mono">
                  Live multi-day forecast derived from Open-Meteo atmospheric models
                </p>
              </div>
              <span className="text-xs font-mono text-[#71825B]">
                7 Days Forecast Range
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {weatherData.forecast.map((day, idx) => {
                const DayIcon = getWeatherIcon(day.weatherCode, day.conditionText);
                const riskBadge = getRiskBadgeVariant(day.operationalRisk);

                return (
                  <div
                    key={idx}
                    className="bg-[#171D12] border border-[#252E1D] hover:border-[#71825B]/50 p-3.5 rounded-2xl flex flex-col justify-between transition shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#F1F2E9]">
                          {day.dayName}
                        </span>
                        <DayIcon size={18} className="text-[#A4B18A]" />
                      </div>
                      <div className="text-[10px] font-mono text-[#71825B] mt-0.5">
                        {day.date.split('(')[1]?.replace(')', '') || ''}
                      </div>

                      <div className="mt-3 text-sm font-extrabold text-[#F1F2E9] truncate" title={day.conditionText}>
                        {day.conditionText}
                      </div>

                      <div className="mt-2 text-base font-black font-mono text-[#F1F2E9]">
                        {day.tempMaxC}° <span className="text-xs font-normal text-[#71825B]">/ {day.tempMinC}°C</span>
                      </div>

                      <div className="mt-3 space-y-1 text-[11px] font-mono bg-[#0B0E09] p-2 rounded-xl border border-[#252E1D]">
                        <div className="flex justify-between">
                          <span className="text-[#71825B]">Rain:</span>
                          <span className="text-[#F1F2E9] font-bold">{day.rainfallMm} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#71825B]">Prob:</span>
                          <span className="text-[#F1F2E9] font-bold">{day.precipitationProbabilityPct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#71825B]">Wind:</span>
                          <span className="text-[#F1F2E9] font-bold">{day.windSpeedKmH} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#71825B]">Humidity:</span>
                          <span className="text-[#F1F2E9] font-bold">{day.humidityPct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className={`block text-center text-[9px] font-mono font-extrabold py-0.5 rounded border ${riskBadge.bg}`}>
                        {day.operationalRisk}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-DAY WEATHER TREND INTERACTIVE CHART */}
          <Card variant="primary">
            <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold tracking-wider">
                  VISUALIZATION & METRICS
                </span>
                <CardTitle className="text-lg font-black text-[#F1F2E9]">
                  7-Day Weather Trend
                </CardTitle>
                <CardDescription>
                  Interactive trend chart for {weatherData.locationName} forecast variables
                </CardDescription>
              </div>

              {/* Chart Metric Tabs */}
              <div className="flex items-center gap-1 bg-[#0B0E09] p-1 rounded-xl border border-[#252E1D]">
                {(
                  [
                    { id: 'temp', label: 'Temperature (°C)' },
                    { id: 'rainfall', label: 'Rainfall (mm)' },
                    { id: 'prob', label: 'Rain Prob (%)' },
                    { id: 'humidity', label: 'Humidity (%)' }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setChartMetric(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      chartMetric === tab.id
                        ? 'btn-clay-primary text-[#0B0E09]'
                        : 'text-[#71825B] hover:text-[#F1F2E9]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="mt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartMetric === 'rainfall' ? (
                    <BarChart data={weatherData.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#252E1D" vertical={false} />
                      <XAxis dataKey="dayName" stroke="#71825B" tick={{ fill: '#71825B', fontSize: 11 }} />
                      <YAxis stroke="#71825B" tick={{ fill: '#71825B', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#171D12', borderColor: '#71825B', borderRadius: '12px', color: '#F1F2E9' }}
                        formatter={(val: any) => [`${val} mm`, 'Rainfall']}
                      />
                      <Bar dataKey="rainfallMm" fill="#A4B18A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={weatherData.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="weatherColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A4B18A" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#A4B18A" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#252E1D" vertical={false} />
                      <XAxis dataKey="dayName" stroke="#71825B" tick={{ fill: '#71825B', fontSize: 11 }} />
                      <YAxis stroke="#71825B" tick={{ fill: '#71825B', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#171D12', borderColor: '#71825B', borderRadius: '12px', color: '#F1F2E9' }}
                        formatter={(val: any) => [
                          chartMetric === 'temp' ? `${val}°C` : `${val}%`,
                          chartMetric === 'temp'
                            ? 'Max Temperature'
                            : chartMetric === 'prob'
                            ? 'Rain Probability'
                            : 'Humidity'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey={
                          chartMetric === 'temp'
                            ? 'tempMaxC'
                            : chartMetric === 'prob'
                            ? 'precipitationProbabilityPct'
                            : 'humidityPct'
                        }
                        stroke="#A4B18A"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#weatherColor)"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* RAINFALL OUTLOOK & OPERATIONAL RISK TIMELINE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RAINFALL OUTLOOK */}
            <Card variant="primary">
              <CardHeader>
                <div>
                  <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold tracking-wider">
                    7-DAY AGGREGATION
                  </span>
                  <CardTitle className="text-lg font-black text-[#F1F2E9]">
                    Rainfall Outlook
                  </CardTitle>
                </div>
                <CloudRain size={22} className="text-[#A4B18A]" />
              </CardHeader>

              <CardContent className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0B0E09] p-3.5 rounded-xl border border-[#252E1D]">
                    <div className="text-[10px] font-mono text-[#71825B] uppercase font-bold">
                      7-Day Expected Rainfall
                    </div>
                    <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-1">
                      {weatherData.rainfallOutlook.expected7DayRainfallMm} <span className="text-xs font-normal text-[#71825B]">mm</span>
                    </div>
                  </div>

                  <div className="bg-[#0B0E09] p-3.5 rounded-xl border border-[#252E1D]">
                    <div className="text-[10px] font-mono text-[#71825B] uppercase font-bold">
                      Highest Daily Rainfall
                    </div>
                    <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-1">
                      {weatherData.rainfallOutlook.maxDailyRainfallMm} <span className="text-xs font-normal text-[#71825B]">mm</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D]">
                    <div className="text-[9px] font-mono text-[#71825B] uppercase font-bold">
                      Peak Rain Prob
                    </div>
                    <div className="text-lg font-black text-[#F1F2E9] font-mono mt-0.5">
                      {weatherData.rainfallOutlook.highestRainProbabilityPct}%
                    </div>
                  </div>

                  <div className="bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D]">
                    <div className="text-[9px] font-mono text-[#71825B] uppercase font-bold">
                      Wet Days (≥1mm)
                    </div>
                    <div className="text-lg font-black text-[#F1F2E9] font-mono mt-0.5">
                      {weatherData.rainfallOutlook.wetDaysCount} / 7
                    </div>
                  </div>

                  <div className="bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D]">
                    <div className="text-[9px] font-mono text-[#71825B] uppercase font-bold">
                      Heavy Days (≥15mm)
                    </div>
                    <div className="text-lg font-black text-[#F1F2E9] font-mono mt-0.5">
                      {weatherData.rainfallOutlook.heavyRainDaysCount} / 7
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OPERATIONAL RISK TIMELINE */}
            <Card variant="primary">
              <CardHeader>
                <div>
                  <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold tracking-wider">
                    HAZARD CHRONOLOGY
                  </span>
                  <CardTitle className="text-lg font-black text-[#F1F2E9]">
                    Operational Risk Timeline
                  </CardTitle>
                </div>
                <Activity size={22} className="text-[#A4B18A]" />
              </CardHeader>

              <CardContent className="mt-4 space-y-2">
                {weatherData.forecast.map((day, idx) => {
                  const badge = getRiskBadgeVariant(day.operationalRisk);
                  return (
                    <div
                      key={idx}
                      className="bg-[#0B0E09] border border-[#252E1D] p-3 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-20 text-xs font-mono font-bold text-[#F1F2E9]">
                          {day.dayName}
                        </span>
                        <span className="text-xs text-[#71825B] font-mono">
                          {day.conditionText}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#71825B]">
                          {day.rainfallMm} mm
                        </span>
                        <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded border ${badge.bg}`}>
                          {day.operationalRisk}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* MINING OPERATIONAL IMPACT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#F1F2E9] tracking-tight">
                  Mining Operational Impact
                </h3>
                <p className="text-xs text-[#71825B] font-mono">
                  Rule-based operational interpretation derived from live weather measurements at {weatherData.locationName}
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#A4B18A] bg-[#0B0E09] border border-[#252E1D] px-2.5 py-1 rounded-lg">
                AI / RULE-BASED ASSESSMENT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weatherData.operationalImpacts.map((imp) => {
                const badge = getRiskBadgeVariant(imp.severity);
                return (
                  <Card key={imp.id} variant="primary" className="border-[#252E1D]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold">
                          OPERATIONAL FACTOR
                        </span>
                        <h4 className="font-extrabold text-[#F1F2E9] text-base mt-0.5">
                          {imp.factor}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded border ${badge.bg}`}>
                        {imp.severity}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-[#C0C6B2] leading-relaxed font-sans bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D]">
                      <strong className="text-[#F1F2E9] block mb-0.5">Impact Assessment:</strong>
                      {imp.impactDescription}
                    </div>

                    <div className="mt-3 text-xs font-mono text-[#A4B18A] flex items-start gap-2">
                      <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#A4B18A]" />
                      <div>
                        <strong className="text-[#F1F2E9] block">Action Recommendation:</strong>
                        {imp.recommendation}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* MONSOON PIT DEWATERING & HAUL ROAD PROTOCOLS */}
          <Card variant="primary" className="border-[#71825B]/40 bg-[#1D2517]">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#0B0E09] border border-[#71825B]/40 text-[#A4B18A] shrink-0">
                <Sparkles size={24} />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-[#F1F2E9]">
                    {weatherData.dewateringProtocol.alertTitle}
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-[#A4B18A] bg-[#0B0E09] border border-[#252E1D] px-2.5 py-0.5 rounded-lg uppercase">
                    ACTION: {weatherData.dewateringProtocol.actionLevel}
                  </span>
                </div>
                <p className="text-xs text-[#E4E7D8] leading-relaxed font-sans">
                  {weatherData.dewateringProtocol.protocolText}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

