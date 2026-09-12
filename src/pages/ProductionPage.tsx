import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  Sliders,
  Cpu,
  Activity,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Sparkles,
  CheckCircle2,
  BarChart2,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { ProductionFactors, WeatherRisk } from '../types';
import { CardGrid, StatCard, PrimaryCard, Card, CardHeader, CardTitle, CardContent, EmptyStateCard } from '../components/ui/Card';
import { forecastService } from '../services/forecastService';

export const ProductionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { siteIntelligenceRecords, activeTimeframe, setActiveTimeframe } = useAppStore();

  // 1. LOCATION SELECTION FROM URL OR DEFAULT TO FIRST RECORD
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

  // Scenario slider overrides
  const [scenarioOverrides, setScenarioOverrides] = useState<Partial<ProductionFactors>>({});

  // Reset scenario overrides when location changes
  React.useEffect(() => {
    setScenarioOverrides({});
  }, [selectedRecord?.id]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locId = e.target.value;
    if (locId) {
      setSearchParams({ locationId: locId });
    }
  };

  const updateScenario = (updates: Partial<ProductionFactors>) => {
    setScenarioOverrides((prev) => ({ ...prev, ...updates }));
  };

  const resetScenario = () => {
    setScenarioOverrides({});
  };

  const hasScenarioChanged = Object.keys(scenarioOverrides).length > 0;

  // 2. NO ANALYZED LOCATIONS STATE
  if (!siteIntelligenceRecords || siteIntelligenceRecords.length === 0 || !selectedRecord) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">
            Production Forecast Engine
          </h1>
          <p className="text-xs text-[#71825B] font-mono">
            Location-specific manganese production forecasting based on current operating conditions
          </p>
        </div>
        <EmptyStateCard
          title="No analyzed locations available"
          description="Analyze a mining location first to enable location-specific production forecasting and AI operational simulations."
          icon={MapPin}
          actionText="GO TO ANALYZED LOCATIONS"
          onAction={() => navigate('/analyzed-locations')}
        />
      </div>
    );
  }

  // 3. CALCULATE FORECAST FOR SELECTED LOCATION
  const forecastResult = forecastService.calculateLocationForecast(selectedRecord, scenarioOverrides);
  const chartSeries = forecastService.generateLocationForecastSeries(forecastResult, activeTimeframe);

  const {
    targetProduction,
    predictedProduction,
    shortfall,
    shortfallPct,
    isAhead,
    surplus,
    confidencePct,
    factors,
    factorImpacts,
    insightNarrative,
    recommendations
  } = forecastResult;

  return (
    <div className="space-y-6 pb-12">
      {/* 4. TOP LOCATION SELECTOR */}
      <Card variant="primary" padding="md" className="border-[#71825B]/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-[#A4B18A] uppercase tracking-wider bg-[#0B0E09] px-2.5 py-0.5 rounded border border-[#252E1D]">
                SELECT ANALYZED LOCATION
              </span>
              <span className="text-[10px] font-mono text-[#71825B]">
                {siteIntelligenceRecords.length} Mining Sites Stored
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#F1F2E9] flex items-center gap-2">
              <MapPin size={18} className="text-[#A4B18A]" />
              Production Forecast Engine
            </h2>
            <p className="text-xs text-[#71825B] font-mono">
              Location-specific manganese production forecasting based on current operating conditions
            </p>
          </div>

          <div className="w-full md:w-80">
            <select
              value={selectedRecord.locationId || selectedRecord.id}
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

      {/* 5. LOCATION CONTEXT BANNER */}
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
                {selectedRecord.region} • {selectedRecord.locationId}
              </span>
              {hasScenarioChanged && (
                <span className="text-[10px] font-mono font-bold text-[#E6E265] bg-[#2E2D15] border border-[#8C8927] px-2 py-0.5 rounded-lg uppercase">
                  SCENARIO SIMULATION ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-[#71825B] mt-1 flex items-center gap-3 flex-wrap">
              <span>
                Coordinates: <strong className="text-[#F1F2E9]">{selectedRecord.latitude.toFixed(4)}° N, {selectedRecord.longitude.toFixed(4)}° E</strong>
              </span>
              <span>•</span>
              <span>
                AI Suitability: <strong className="text-[#A4B18A]">{selectedRecord.suitabilityScore}%</strong>
              </span>
              <span>•</span>
              <span>
                Last Evaluated: <strong className="text-[#F1F2E9]">{selectedRecord.analyzedAt.split('T')[0]}</strong>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-[#0B0E09] border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A4B18A] animate-ping" />
            FORECAST ACTIVE
          </span>
        </div>
      </div>

      {/* 6. TOP KPI SUMMARY GRID */}
      <CardGrid columns={4}>
        <StatCard
          title="Target Production"
          value={`${targetProduction.toLocaleString()} MT`}
          subtext="Current production target for selected mine"
          icon={TrendingUp}
        />
        <StatCard
          title="Predicted Production"
          value={`${predictedProduction.toLocaleString()} MT`}
          subtext="AI forecast for selected mine"
          icon={Activity}
        />
        <StatCard
          title="Expected Shortfall"
          value={isAhead ? `+${surplus.toLocaleString()} MT` : `${shortfall.toLocaleString()} MT`}
          subtext={isAhead ? `+${((surplus / targetProduction) * 100).toFixed(1)}% Above Target` : `Target gap: ${shortfallPct}%`}
          trend={isAhead ? 'up' : 'down'}
          trendValue={isAhead ? 'ABOVE TARGET' : 'SHORTFALL'}
          icon={AlertTriangle}
        />
        <StatCard
          title="Forecast Confidence"
          value={`${confidencePct}%`}
          subtext="Model confidence & statistical fidelity"
          icon={Cpu}
        />
      </CardGrid>

      {/* 7. MAIN FORECAST CHART + SCENARIO CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN FORECAST TIME-SERIES WITH UNCERTAINTY BOUNDS */}
        <div className="lg:col-span-2 space-y-6">
          <PrimaryCard title="AI Forecast vs Production Target" subtitle="LOCATION TIME-SERIES & UNCERTAINTY BAND">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1D2517]">
              <div>
                <p className="text-xs text-[#71825B] font-mono">
                  30-Day Tonnage Forecast with Upper & Lower Statistical Uncertainty Bounds for {selectedRecord.locationName}
                </p>
              </div>

              {/* Timeframe Controls (7D, 30D, 90D, 6M) */}
              <div className="flex items-center gap-1.5 p-1.5 bg-[#0B0E09] rounded-xl text-xs font-mono border border-[#252E1D]">
                {(['7D', '30D', '90D', '6M'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg transition font-bold text-xs cursor-pointer ${
                      activeTimeframe === tf
                        ? 'btn-clay-primary text-[#0B0E09] shadow-sm'
                        : 'text-[#71825B] hover:text-[#F1F2E9]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Forecast Area Chart */}
            <div className="h-80 w-full pt-2 bg-[#0B0E09] p-4 rounded-xl border border-[#252E1D] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A4B18A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#A4B18A" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="targetColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#71825B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#71825B" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="boundColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A4B18A" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#A4B18A" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1D2517" />
                  <XAxis dataKey="date" stroke="#71825B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71825B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0E09',
                      borderColor: '#252E1D',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#F1F2E9'
                    }}
                    formatter={(val: any, name: any) => [`${Number(val || 0).toLocaleString()} MT`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#F1F2E9' }} />

                  {/* Uncertainty Band (Upper & Lower Bounds) */}
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    name="Upper Bound (+Uncertainty)"
                    stroke="transparent"
                    fill="url(#boundColor)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    name="Lower Bound (-Uncertainty)"
                    stroke="transparent"
                    fill="transparent"
                  />

                  {/* Forecast Line */}
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    name="AI Forecast Output"
                    stroke="#A4B18A"
                    strokeWidth={2.5}
                    fill="url(#forecastColor)"
                  />

                  {/* Target Benchmark Line */}
                  <Area
                    type="monotone"
                    dataKey="target"
                    name="Production Target Benchmark"
                    stroke="#71825B"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="url(#targetColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </PrimaryCard>

          {/* SECOND GRAPH: HISTORICAL PRODUCTION PERFORMANCE */}
          <PrimaryCard title="Production Performance Track Record" subtitle="HISTORICAL ACTUAL VS TARGET COMPARISON">
            <div className="h-64 w-full bg-[#0B0E09] p-4 rounded-xl border border-[#252E1D] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1D2517" />
                  <XAxis dataKey="date" stroke="#71825B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71825B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0E09',
                      borderColor: '#252E1D',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#F1F2E9'
                    }}
                    formatter={(val: any, name: any) => [`${Number(val || 0).toLocaleString()} MT`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#F1F2E9' }} />
                  <Line
                    type="monotone"
                    dataKey="actualHistorical"
                    name="Actual Historical Tonnage"
                    stroke="#E4E7D8"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#E4E7D8' }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target Benchmark"
                    stroke="#71825B"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PrimaryCard>
        </div>

        {/* RIGHT COLUMN: FORECAST SCENARIO CONTROLS */}
        <div className="space-y-6">
          <Card variant="primary" padding="md" className="border-[#71825B]/40">
            <div className="flex items-center justify-between pb-3 border-b border-[#252E1D]">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-[#A4B18A]" />
                <h3 className="font-extrabold text-[#F1F2E9] text-base">
                  FORECAST SCENARIO CONTROLS
                </h3>
              </div>

              {hasScenarioChanged && (
                <button
                  onClick={resetScenario}
                  className="text-xs font-mono font-bold text-[#A4B18A] hover:text-[#F1F2E9] flex items-center gap-1 bg-[#0B0E09] px-2.5 py-1 rounded-lg border border-[#252E1D] cursor-pointer transition"
                  title="Reset sliders to baseline measured data"
                >
                  <RotateCcw size={12} />
                  <span>RESET</span>
                </button>
              )}
            </div>

            <p className="text-xs text-[#71825B] font-mono mt-2 mb-4 leading-relaxed">
              Adjust operational parameters to simulate scenario impacts on predicted output for {selectedRecord.locationName}.
            </p>

            <div className="space-y-4">
              {/* Slider 1: Equipment Availability */}
              <div className="space-y-1.5 text-xs font-mono bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D]">
                <div className="flex justify-between">
                  <span className="text-[#71825B]">Equipment Fleet Availability</span>
                  <span className="text-[#A4B18A] font-bold">
                    {factors.equipmentAvailability}%
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={factors.equipmentAvailability}
                  onChange={(e) => updateScenario({ equipmentAvailability: Number(e.target.value) })}
                  className="w-full accent-[#A4B18A] bg-[#171D12] h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 2: Weather Risk */}
              <div className="space-y-1.5 text-xs font-mono bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D]">
                <div className="flex justify-between">
                  <span className="text-[#71825B]">Monsoon Weather Risk</span>
                  <span className="text-[#F1F2E9] font-bold">
                    {factors.rainfallRiskLevel}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['LOW', 'MEDIUM', 'HIGH'] as WeatherRisk[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => updateScenario({ rainfallRiskLevel: lvl })}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        factors.rainfallRiskLevel === lvl
                          ? 'btn-clay-primary text-[#0B0E09] border-[#71825B]'
                          : 'bg-[#171D12] border-[#252E1D] text-[#71825B] hover:text-[#F1F2E9]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 3: Blasting Delay */}
              <div className="space-y-1.5 text-xs font-mono bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D]">
                <div className="flex justify-between">
                  <span className="text-[#71825B]">Blasting Delay Latency</span>
                  <span className="text-[#A4B18A] font-bold">
                    {factors.blastingDelayDays} Days
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  value={factors.blastingDelayDays}
                  onChange={(e) => updateScenario({ blastingDelayDays: Number(e.target.value) })}
                  className="w-full accent-[#A4B18A] bg-[#171D12] h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 4: Transport Availability */}
              <div className="space-y-1.5 text-xs font-mono bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D]">
                <div className="flex justify-between">
                  <span className="text-[#71825B]">Transport & Rail Evacuation</span>
                  <span className="text-[#A4B18A] font-bold">
                    {factors.transportAvailability}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={factors.transportAvailability}
                  onChange={(e) => updateScenario({ transportAvailability: Number(e.target.value) })}
                  className="w-full accent-[#A4B18A] bg-[#171D12] h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 5: Ore Availability */}
              <div className="space-y-1.5 text-xs font-mono bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D]">
                <div className="flex justify-between">
                  <span className="text-[#71825B]">Run-of-Mine Ore Availability</span>
                  <span className="text-[#A4B18A] font-bold">
                    {factors.oreAvailability}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={factors.oreAvailability}
                  onChange={(e) => updateScenario({ oreAvailability: Number(e.target.value) })}
                  className="w-full accent-[#A4B18A] bg-[#171D12] h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-2 text-[11px] text-[#71825B] font-mono border-t border-[#252E1D]">
                * Scenario adjustments recalculate target gap, charts, risk impacts, and recommendations in real-time.
              </div>
            </div>
          </Card>

          {/* FACTOR IMPACT VISUALIZATION */}
          <Card variant="primary" padding="md">
            <CardHeader>
              <div>
                <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold tracking-wider">
                  DECOMPOSITION & ATTRIBUTION
                </span>
                <CardTitle className="text-sm font-extrabold text-[#F1F2E9]">
                  Operational Factor Impacts
                </CardTitle>
              </div>
              <BarChart2 size={18} className="text-[#A4B18A]" />
            </CardHeader>

            <CardContent className="mt-3 space-y-2.5">
              {factorImpacts.map((f) => (
                <div key={f.id} className="bg-[#0B0E09] p-2.5 rounded-xl border border-[#252E1D] space-y-1 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#F1F2E9] font-bold text-xs truncate max-w-[170px]" title={f.factorName}>
                      {f.factorName}
                    </span>
                    <span className={`font-mono font-extrabold text-xs flex items-center gap-0.5 ${f.isPositive ? 'text-[#A4B18A]' : 'text-[#FF8888]'}`}>
                      {f.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {f.isPositive ? `+${f.impactPct}%` : `${f.impactPct}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#71825B]">
                    <span>Value: {f.currentValue}</span>
                    <span>{f.statusText}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 8. FORECAST INSIGHT & RECOMMENDATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DYNAMIC FORECAST INSIGHT NARRATIVE */}
        <Card variant="primary" className="border-[#71825B]/40 bg-[#1D2517]">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#0B0E09] border border-[#71825B]/40 text-[#A4B18A] shrink-0">
              <Sparkles size={24} />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-[#F1F2E9]">
                  AI Forecast Insight
                </h3>
                <span className="text-[10px] font-mono font-bold text-[#A4B18A] bg-[#0B0E09] border border-[#252E1D] px-2.5 py-0.5 rounded-lg uppercase">
                  MINE-SPECIFIC DIAGNOSTIC
                </span>
              </div>
              <p className="text-xs text-[#E4E7D8] leading-relaxed font-sans mt-2">
                {insightNarrative}
              </p>
            </div>
          </div>
        </Card>

        {/* ACTIONABLE RECOMMENDATIONS */}
        <Card variant="primary">
          <CardHeader>
            <div>
              <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold tracking-wider">
                PRODUCTION OPTIMIZATION
              </span>
              <CardTitle className="text-base font-extrabold text-[#F1F2E9]">
                Recommended Actions
              </CardTitle>
            </div>
            <CheckCircle2 size={20} className="text-[#A4B18A]" />
          </CardHeader>

          <CardContent className="mt-3 space-y-2.5">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#F1F2E9] truncate" title={rec.title}>
                    {rec.title}
                  </h4>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                    rec.priority === 'HIGH'
                      ? 'bg-[#3A1414] border-[#8B2626] text-[#FF8888]'
                      : rec.priority === 'MEDIUM'
                      ? 'bg-[#3A2614] border-[#B86B26] text-[#FFB066]'
                      : 'bg-[#1D2517] border-[#71825B]/40 text-[#A4B18A]'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-[#71825B] font-sans leading-relaxed">
                  {rec.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

