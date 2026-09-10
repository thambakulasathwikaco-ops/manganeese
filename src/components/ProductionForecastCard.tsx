import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { forecastService } from '../services/forecastService';
import { TrendingUp, ArrowUpRight, Target, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { AnimatedCounter } from './AnimatedCounter';

export const ProductionForecastCard: React.FC = () => {
  const navigate = useNavigate();
  const { productionFactors, activeTimeframe } = useAppStore();

  const { predictedProduction, shortfall, confidencePct } = forecastService.calculateForecast(productionFactors);
  const target = productionFactors.productionTarget;

  const chartData = forecastService.generateForecastSeries(productionFactors, activeTimeframe);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => navigate('/production')}
      className="clay-card p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
    >
      <div>
        {/* Header with 02 / FORECAST Module Number */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-bold text-[#A4B18A] px-2.5 py-0.5 rounded-lg bg-[#0B0E09] border border-[#252E1D] shadow-inner">
              02 / FORECAST
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#71825B] tracking-wider">
                Production Forecast Engine
              </span>
              <h3 className="text-base font-extrabold text-[#F1F2E9]">30-Day Output Forecast</h3>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/production'); }}
            className="p-2 rounded-xl text-[#71825B] hover:text-[#F1F2E9] hover:bg-[#1D2517] transition flex items-center gap-1 text-xs font-semibold"
          >
            <span>Details</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Tonnage Summary Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="clay-recessed p-3.5 border border-[#252E1D]">
            <div className="text-[#71825B] text-[10px] uppercase font-mono flex items-center gap-1">
              <Target size={12} className="text-[#71825B]" />
              Target Output
            </div>
            <div className="text-2xl font-black text-[#F1F2E9] mt-1 font-mono">
              <AnimatedCounter value={target} /> <span className="text-xs text-[#71825B] font-sans font-normal">MT</span>
            </div>
          </div>

          <div className="clay-recessed p-3.5 border border-[#252E1D]">
            <div className="text-[#71825B] text-[10px] uppercase font-mono flex items-center gap-1">
              <TrendingUp size={12} className="text-[#A4B18A]" />
              AI Predicted Forecast
            </div>
            <div className="text-2xl font-black text-[#A4B18A] mt-1 font-mono">
              <AnimatedCounter value={predictedProduction} /> <span className="text-xs text-[#71825B] font-sans font-normal">MT</span>
            </div>
          </div>
        </div>

        {/* Sparkline Chart Container */}
        <div className="h-28 mt-4 w-full clay-recessed p-2 overflow-hidden border border-[#252E1D]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A4B18A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#A4B18A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E09', borderColor: '#252E1D', borderRadius: '10px', fontSize: '11px', color: '#F1F2E9' }}
                formatter={(val: any) => [`${Number(val || 0).toLocaleString()} MT`, 'Forecast']}
              />
              <Area type="monotone" dataKey="forecast" stroke="#A4B18A" strokeWidth={2} fillOpacity={1} fill="url(#forecastGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-[#1D2517] flex items-center justify-between text-[11px] font-mono">
        <span className="text-[#71825B] flex items-center gap-1">
          <ShieldCheck size={13} className="text-[#A4B18A]" />
          Confidence: <strong className="text-[#F1F2E9]"><AnimatedCounter value={confidencePct} formatter={(v) => `${Math.round(v)}%`} /></strong>
        </span>
        <span className={shortfall > 0 ? 'text-[#A4B18A] font-bold' : 'text-[#71825B] font-bold'}>
          {shortfall > 0 ? `Gap: -${shortfall.toLocaleString()} MT` : 'Target Achieved'}
        </span>
      </div>
    </motion.div>
  );
};


