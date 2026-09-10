import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { prospectivityService } from '../services/prospectivityService';
import { MapPin, ArrowUpRight, Sparkles } from 'lucide-react';
import { RiskGauge } from './RiskGauge';
import { AnimatedCounter } from './AnimatedCounter';
import { Card, CardHeader, CardBadge, CardTitle, CardContent, CardFooter } from './ui/Card';

export const ProspectivityCard: React.FC<{ staggerIndex?: number }> = ({ staggerIndex }) => {
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
    <Card
      variant="primary"
      clickable
      staggerIndex={staggerIndex}
      onClick={() => navigate('/manganese-map')}
      className="flex flex-col justify-between"
    >
      <div>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <CardBadge variant="sage">01 / PREDICT</CardBadge>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#71825B] tracking-wider block">
                Reserves & Prospectivity Engine
              </span>
              <CardTitle>Manganese Prospectivity AI</CardTitle>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/manganese-map');
            }}
            className="p-2 rounded-xl text-[#71825B] hover:text-[#F1F2E9] hover:bg-[#1D2517] transition flex items-center gap-1 text-xs font-semibold"
          >
            <span>GIS Map</span>
            <ArrowUpRight size={15} />
          </button>
        </CardHeader>

        <CardContent className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex flex-col items-center">
              <RiskGauge
                value={prospectivityResult.prospectivityScore}
                label={prospectivityResult.potentialLevel}
                sublabel={`CONFIDENCE: ${prospectivityResult.confidence}%`}
                color={prospectivityResult.potentialLevel === 'HIGH' ? '#A4B18A' : '#71825B'}
              />
            </div>

            <div className="space-y-2.5 text-xs font-sans">
              <div className="bg-[#0B0E09] p-3.5 space-y-1 rounded-xl border border-[#252E1D]">
                <div className="text-[#71825B] text-[10px] uppercase font-mono">Focus Deposit Horizon</div>
                <div className="text-[#F1F2E9] font-bold text-sm truncate">{topZone.name}</div>
                <div className="text-[#A4B18A] font-mono text-[11px] mt-0.5 flex items-center gap-1">
                  <MapPin size={12} />
                  <span>
                    {topZone.zoneId} • <AnimatedCounter value={topZone.estimatedReserveTons} /> MT Reserve
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <div className="bg-[#0B0E09] p-3 text-center rounded-xl border border-[#252E1D]">
                  <div className="text-[10px] text-[#71825B]">HIGH POTENTIAL</div>
                  <div className="text-base font-extrabold text-[#A4B18A] mt-0.5">
                    <AnimatedCounter value={highCount} /> Zones
                  </div>
                </div>
                <div className="bg-[#0B0E09] p-3 text-center rounded-xl border border-[#252E1D]">
                  <div className="text-[10px] text-[#71825B]">PRIORITIZED</div>
                  <div className="text-base font-extrabold text-[#F1F2E9] mt-0.5">
                    <AnimatedCounter value={prioritizedCount} /> Zones
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter>
        <span className="inline-flex items-center gap-1.5 text-[#A4B18A] font-mono text-[10px] bg-[#0B0E09] px-2.5 py-0.5 rounded-lg border border-[#252E1D] shadow-inner">
          <Sparkles size={12} />
          PROTOTYPE PREDICTION MODEL
        </span>
        <span className="text-[#71825B] text-[10px] font-mono">4-Factor Spatial Model</span>
      </CardFooter>
    </Card>
  );
};
