import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { forecastService } from '../services/forecastService';
import { TrendingUp, ArrowUpRight, Target, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { AnimatedCounter } from './AnimatedCounter';
import { Card, CardHeader, CardBadge, CardTitle, CardContent, CardFooter } from './ui/Card';

export const ProductionForecastCard: React.FC<{ staggerIndex?: number }> = ({ staggerIndex }) => {
  const navigate = useNavigate();
  const { productionFactors, activeTimeframe } = useAppStore();

  const { predictedProduction, shortfall, confidencePct } = forecastService.calculateForecast(productionFactors);
  const target = productionFactors.productionTarget;

  const chartData = forecastService.generateForecastSeries(productionFactors, activeTimeframe);

  return (
    <Card
      variant="primary"
      clickable
      staggerIndex={staggerIndex}
      onClick={() => navigate('/production')}
      className="flex flex-col justify-between"
    >
      <div>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <CardBadge variant="sage">02 / FORECAST</CardBadge>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#71825B] tracking-wider block">
                Production Forecast Engine
              </span>
              <CardTitle>30-Day Output Forecast</CardTitle>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/production');
            }}
            className="p-2 rounded-xl text-[#71825B] hover:text-[#F1F2E9] hover:bg-[#1D2517] transition flex items-center gap-1 text-xs font-semibold"
          >
            <span>Details</span>
            <ArrowUpRight size={15} />
          </button>
        </CardHeader>

        <CardContent className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0B0E09] p-3.5 rounded-xl border border-[#252E1D]">
              <div className="text-[#71825B] text-[10px] uppercase font-mono flex items-center gap-1">
                <Target size={12} className="text-[#71825B]" />
                Target Output
              </div>
              <div className="text-2xl font-black text-[#F1F2E9] mt-1 font-mono">
                <AnimatedCounter value={target} />{' '}
                <span className="text-xs text-[#71825B] font-sans font-normal">MT</span>
              </div>
            </div>

            <div className="bg-[#0B0E09] p-3.5 rounded-xl border border-[#252E1D]">
              <div className="text-[#71825B] text-[10px] uppercase font-mono flex items-center gap-1">
                <TrendingUp size={12} className="text-[#A4B18A]" />
                AI Predicted Forecast
              </div>
              <div className="text-2xl font-black text-[#A4B18A] mt-1 font-mono">
                <AnimatedCounter value={predictedProduction} />{' '}
                <span className="text-xs text-[#71825B] font-sans font-normal">MT</span>
              </div>
            </div>
          </div>

          <div className="h-28 mt-4 w-full bg-[#0B0E09] p-2 rounded-xl overflow-hidden border border-[#252E1D]">
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
                  contentStyle={{
                    backgroundColor: '#0B0E09',
                    borderColor: '#252E1D',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: '#F1F2E9'
                  }}
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString()} MT`, 'Forecast']}
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#A4B18A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#forecastGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </div>

      <CardFooter>
        <span className="text-[#71825B] flex items-center gap-1">
          <ShieldCheck size={13} className="text-[#A4B18A]" />
          Confidence:{' '}
          <strong className="text-[#F1F2E9]">
            <AnimatedCounter value={confidencePct} formatter={(v) => `${Math.round(v)}%`} />
          </strong>
        </span>
        <span className={shortfall > 0 ? 'text-[#A4B18A] font-bold' : 'text-[#71825B] font-bold'}>
          {shortfall > 0 ? `Gap: -${shortfall.toLocaleString()} MT` : 'Target Achieved'}
        </span>
      </CardFooter>
    </Card>
  );
};
