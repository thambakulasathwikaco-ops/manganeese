import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { riskService } from '../services/riskService';
import { ArrowUpRight, AlertOctagon } from 'lucide-react';
import { RiskGauge } from './RiskGauge';
import { AnimatedCounter } from './AnimatedCounter';

export const ShortfallRiskCard: React.FC = () => {
  const navigate = useNavigate();
  const { productionFactors } = useAppStore();

  const { shortfall, shortfallPct, riskLevel, contributions, explanation } = riskService.calculateRisk(productionFactors);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#F1F2E9';
      case 'HIGH': return '#A4B18A';
      case 'MEDIUM': return '#71825B';
      default: return '#596A43';
    }
  };

  const getRiskBadgeStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-[#1D2517] border-[#71825B] text-[#F1F2E9]';
      case 'HIGH': return 'bg-[#1D2517] border-[#71825B] text-[#A4B18A]';
      case 'MEDIUM': return 'bg-[#171D12] border-[#252E1D] text-[#71825B]';
      default: return 'bg-[#0B0E09] border-[#252E1D] text-[#71825B]';
    }
  };

  const topContributor = contributions[0];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => navigate('/shortfall')}
      className="clay-card p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
    >
      <div>
        {/* Header with 03 / RISK Module Number */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-bold text-[#A4B18A] px-2.5 py-0.5 rounded-lg bg-[#0B0E09] border border-[#252E1D] shadow-inner">
              03 / RISK
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#71825B] tracking-wider">
                Shortfall & Risk Engine
              </span>
              <h3 className="text-base font-extrabold text-[#F1F2E9]">Shortfall Bottleneck Risk</h3>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/shortfall'); }}
            className="p-2 rounded-xl text-[#71825B] hover:text-[#F1F2E9] hover:bg-[#1D2517] transition flex items-center gap-1 text-xs font-semibold"
          >
            <span>Analysis</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Risk Gauge & Level Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="flex flex-col items-center">
            <RiskGauge
              value={shortfallPct}
              label={`${riskLevel} RISK`}
              sublabel={`GAP: ${shortfall.toLocaleString()} MT`}
              color={getRiskColor(riskLevel)}
            />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#71825B] font-mono text-[10px] uppercase">Severity Level</span>
              <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-extrabold shadow-inner ${getRiskBadgeStyle(riskLevel)}`}>
                {riskLevel} RISK (<AnimatedCounter value={shortfallPct} formatter={(v) => `${v.toFixed(1)}%`} />)
              </span>
            </div>

            {/* Top Risk Bottleneck Bar */}
            <div className="clay-recessed p-3.5 space-y-1.5 border border-[#252E1D]">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#F1F2E9] font-semibold truncate max-w-[140px]">{topContributor.factor}</span>
                <span className="text-[#A4B18A] font-mono font-bold">
                  <AnimatedCounter value={topContributor.contributionPct} formatter={(v) => `${Math.round(v)}%`} />
                </span>
              </div>
              <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden border border-[#252E1D] shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#71825B] to-[#A4B18A] rounded-full transition-all duration-500"
                  style={{ width: `${topContributor.contributionPct}%` }}
                />
              </div>
              <p className="text-[10px] text-[#71825B] leading-tight mt-1 line-clamp-2">{topContributor.impactDescription}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Narrative Footer */}
      <div className="mt-4 pt-3 border-t border-[#1D2517] text-[11px] text-[#A4B18A] leading-normal flex items-start gap-2">
        <AlertOctagon size={15} className="text-[#A4B18A] shrink-0 mt-0.5" />
        <p className="line-clamp-2 font-sans">{explanation}</p>
      </div>
    </motion.div>
  );
};


