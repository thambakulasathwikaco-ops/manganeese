import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { prospectivityService } from '../services/prospectivityService';
import { MapPin, ArrowUpRight, Sparkles } from 'lucide-react';
import { RiskGauge } from './RiskGauge';
import { AnimatedCounter } from './AnimatedCounter';

export const ProspectivityCard: React.FC = () => {
  const navigate = useNavigate();
  const { zones } = useAppStore();

  const topZone = zones.find((z) => z.priority) || zones[0];
  const prospectivityResult = prospectivityService.calculateProspectivity({
    geologicalScore: topZone.geologicalScore,
    boreholeScore: topZone.boreholeScore,
    satelliteScore: topZone.satelliteScore,
    terrainScore: topZone.terrainScore
  });

  const highCount = zones.filter((z) => z.potentialLevel === 'HIGH').length;
  const prioritizedCount = zones.filter((z) => z.priority).length;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => navigate('/manganese-map')}
      className="clay-card p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
    >
      <div>
        {/* Header with 01 / PREDICT Module Number */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-bold text-[#A4B18A] px-2.5 py-0.5 rounded-lg bg-[#0B0E09] border border-[#252E1D] shadow-inner">
              01 / PREDICT
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#71825B] tracking-wider">
                Reserves & Prospectivity Engine
              </span>
              <h3 className="text-base font-extrabold text-[#F1F2E9]">Manganese Prospectivity AI</h3>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/manganese-map'); }}
            className="p-2 rounded-xl text-[#71825B] hover:text-[#F1F2E9] hover:bg-[#1D2517] transition flex items-center gap-1 text-xs font-semibold"
          >
            <span>GIS Map</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Core Gauge & Summary Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="flex flex-col items-center">
            <RiskGauge
              value={prospectivityResult.prospectivityScore}
              label={prospectivityResult.potentialLevel}
              sublabel={`CONFIDENCE: ${prospectivityResult.confidence}%`}
              color={prospectivityResult.potentialLevel === 'HIGH' ? '#A4B18A' : '#71825B'}
            />
          </div>

          <div className="space-y-2.5 text-xs font-sans">
            <div className="clay-recessed p-3.5 space-y-1 border border-[#252E1D]">
              <div className="text-[#71825B] text-[10px] uppercase font-mono">Focus Deposit Horizon</div>
              <div className="text-[#F1F2E9] font-bold text-sm truncate">{topZone.name}</div>
              <div className="text-[#A4B18A] font-mono text-[11px] mt-0.5 flex items-center gap-1">
                <MapPin size={12} />
                <span>{topZone.zoneId} • <AnimatedCounter value={topZone.estimatedReserveTons} /> MT Reserve</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 font-mono">
              <div className="clay-recessed p-3 text-center border border-[#252E1D]">
                <div className="text-[10px] text-[#71825B]">HIGH POTENTIAL</div>
                <div className="text-base font-extrabold text-[#A4B18A] mt-0.5">
                  <AnimatedCounter value={highCount} /> Zones
                </div>
              </div>
              <div className="clay-recessed p-3 text-center border border-[#252E1D]">
                <div className="text-[10px] text-[#71825B]">PRIORITIZED</div>
                <div className="text-base font-extrabold text-[#F1F2E9] mt-0.5">
                  <AnimatedCounter value={prioritizedCount} /> Zones
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer Tag */}
      <div className="mt-4 pt-3 border-t border-[#1D2517] flex items-center justify-between text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-[#A4B18A] font-mono text-[10px] bg-[#0B0E09] px-2.5 py-0.5 rounded-lg border border-[#252E1D] shadow-inner">
          <Sparkles size={12} />
          PROTOTYPE PREDICTION MODEL
        </span>
        <span className="text-[#71825B] text-[10px] font-mono">4-Factor Spatial Model</span>
      </div>
    </motion.div>
  );
};


