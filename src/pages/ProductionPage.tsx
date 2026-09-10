import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { forecastService } from '../services/forecastService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Sliders, RefreshCw, Cpu, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import type { WeatherRisk } from '../types';

export const ProductionPage: React.FC = () => {
  const {
    productionFactors,
    updateFactors,
    activeTimeframe,
    setActiveTimeframe,
    runFullAiAnalysis,
    aiAnalysisStatus
  } = useAppStore();

  const { predictedProduction, shortfall, shortfallPct, confidencePct } = forecastService.calculateForecast(productionFactors);
  const target = productionFactors.productionTarget;
  const isAhead = predictedProduction >= target;

  const chartSeries = forecastService.generateForecastSeries(productionFactors, activeTimeframe);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">Production Forecast Engine</h1>
            <span className="clay-recessed border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#0B0E09]">
              MULTI-FACTOR MODEL
            </span>
          </div>
          <p className="text-xs text-[#71825B] font-mono mt-1">
            Real-time Operational Parameter Adjustments & Dynamic Tonnage Prediction
          </p>
        </div>

        <button
          onClick={() => runFullAiAnalysis()}
          disabled={aiAnalysisStatus === 'running'}
          className="btn-clay-primary text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 self-start sm:self-auto uppercase tracking-wider text-[#0B0E09] cursor-pointer"
        >
          <RefreshCw size={15} className={aiAnalysisStatus === 'running' ? 'animate-spin' : ''} />
          <span>RUN AI FORECAST</span>
        </button>
      </div>

      {/* Top Stat Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clay-card p-4 rounded-2xl relative overflow-hidden border border-[#252E1D]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#71825B]">Target Tonnage</div>
            <TrendingUp size={16} className="text-[#71825B]" />
          </div>
          <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-2">{target.toLocaleString()} <span className="text-xs font-sans text-[#71825B]">MT</span></div>
          <div className="text-[11px] text-[#71825B] mt-1 font-mono">30-Day Benchmark</div>
        </div>

        <div className="clay-card p-4 rounded-2xl relative overflow-hidden border border-[#252E1D]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#A4B18A]">Predicted AI Output</div>
            <Activity size={16} className="text-[#A4B18A]" />
          </div>
          <div className="text-2xl font-black text-[#A4B18A] font-mono mt-2">{predictedProduction.toLocaleString()} <span className="text-xs font-sans text-[#71825B]">MT</span></div>
          <div className="text-[11px] text-[#A4B18A] mt-1 font-mono">{isAhead ? '+ Ahead of Target' : `Variance: ${shortfallPct}%`}</div>
        </div>

        <div className="clay-card p-4 rounded-2xl relative overflow-hidden border border-[#252E1D]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#71825B]">Shortfall Gap</div>
            <AlertTriangle size={16} className="text-[#71825B]" />
          </div>
          <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-2">{shortfall.toLocaleString()} <span className="text-xs font-sans text-[#71825B]">MT</span></div>
          <div className="text-[11px] text-[#71825B] mt-1 font-mono">Mitigation Action Required</div>
        </div>

        <div className="clay-card p-4 rounded-2xl relative overflow-hidden border border-[#252E1D]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#A4B18A]">Forecast Confidence</div>
            <Cpu size={16} className="text-[#A4B18A]" />
          </div>
          <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-2">{confidencePct}%</div>
          <div className="text-[11px] text-[#71825B] mt-1 font-mono">Statistical Fidelity</div>
        </div>
      </div>

      {/* Main Grid: Chart + Factor Control Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Recharts Area Chart */}
        <div className="lg:col-span-2 clay-card p-6 rounded-2xl space-y-4 border border-[#252E1D]">
          
          {/* Chart Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1D2517]">
            <div>
              <h3 className="font-extrabold text-[#F1F2E9] text-base">Production Forecast vs Target</h3>
              <p className="text-xs text-[#71825B] font-mono">Historical baseline vs AI neural regression timeline</p>
            </div>

            {/* Timeframe Controls (7D, 30D, 90D, 6M) */}
            <div className="flex items-center gap-1.5 p-1.5 clay-recessed rounded-xl text-xs font-mono border border-[#252E1D]">
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

          {/* Recharts Area Chart */}
          <div className="h-80 w-full pt-2 clay-recessed p-4 rounded-xl border border-[#252E1D]">
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2517" />
                <XAxis dataKey="date" stroke="#71825B" fontSize={11} tickLine={false} />
                <YAxis stroke="#71825B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0E09', borderColor: '#252E1D', borderRadius: '12px', fontSize: '12px', color: '#F1F2E9' }}
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString()} MT`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#F1F2E9' }} />
                <Area type="monotone" dataKey="forecast" name="AI Forecast" stroke="#A4B18A" strokeWidth={2.5} fill="url(#forecastColor)" />
                <Area type="monotone" dataKey="target" name="Target Output" stroke="#71825B" strokeWidth={2} strokeDasharray="4 4" fill="url(#targetColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Live Factor Input Sliders */}
        <div className="clay-card p-6 rounded-2xl space-y-5 border border-[#252E1D]">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1D2517]">
            <Sliders size={18} className="text-[#A4B18A]" />
            <h3 className="font-bold text-[#F1F2E9] text-base">Operational Factors</h3>
          </div>

          {/* Slider 1: Equipment Availability */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#71825B]">Equipment Fleet Availability</span>
              <span className="text-[#A4B18A] font-bold">{productionFactors.equipmentAvailability}%</span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              value={productionFactors.equipmentAvailability}
              onChange={(e) => updateFactors({ equipmentAvailability: Number(e.target.value) })}
              className="w-full accent-[#A4B18A] bg-[#0B0E09] h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 2: Weather Risk */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#71825B]">Monsoon Weather Risk</span>
              <span className="text-[#F1F2E9] font-bold">
                {productionFactors.rainfallRiskLevel}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['LOW', 'MEDIUM', 'HIGH'] as WeatherRisk[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => updateFactors({ rainfallRiskLevel: lvl })}
                  className={`py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    productionFactors.rainfallRiskLevel === lvl
                      ? 'btn-clay-primary text-[#0B0E09] border-[#71825B]'
                      : 'clay-recessed border-[#252E1D] text-[#71825B] hover:text-[#F1F2E9]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Slider 3: Blasting Delay */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#71825B]">Blasting Delay (Days)</span>
              <span className="text-[#A4B18A] font-bold">{productionFactors.blastingDelayDays} Days</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              value={productionFactors.blastingDelayDays}
              onChange={(e) => updateFactors({ blastingDelayDays: Number(e.target.value) })}
              className="w-full accent-[#A4B18A] bg-[#0B0E09] h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 4: Transport Availability */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#71825B]">Transport & Rail Evacuation</span>
              <span className="text-[#A4B18A] font-bold">{productionFactors.transportAvailability}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              value={productionFactors.transportAvailability}
              onChange={(e) => updateFactors({ transportAvailability: Number(e.target.value) })}
              className="w-full accent-[#A4B18A] bg-[#0B0E09] h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 5: Ore Availability */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#71825B]">Run-of-Mine Ore Availability</span>
              <span className="text-[#A4B18A] font-bold">{productionFactors.oreAvailability}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              value={productionFactors.oreAvailability}
              onChange={(e) => updateFactors({ oreAvailability: Number(e.target.value) })}
              className="w-full accent-[#A4B18A] bg-[#0B0E09] h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div className="pt-2 text-[11px] text-[#71825B] font-mono">
            * Adjusting factors recalculates forecast, shortfall, risk, and recommendations in real-time.
          </div>
        </div>
      </div>
    </div>
  );
};

