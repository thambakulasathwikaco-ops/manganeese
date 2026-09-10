import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { riskService } from '../services/riskService';
import { Sparkles } from 'lucide-react';

export const ExecutiveSummaryBanner: React.FC = () => {
  const { productionFactors } = useAppStore();
  const { executiveSummary } = riskService.calculateRisk(productionFactors);

  return (
    <div className="clay-card p-5 flex items-start gap-3.5 border border-clay-border">
      <div className="p-2.5 bg-[#1D2517] border border-clay-border rounded-xl text-[#A4B18A] shrink-0 mt-0.5 shadow-inner">
        <Sparkles size={18} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F1F2E9]">
            AI Operational Executive Summary
          </h2>
          <span className="bg-[#0B0E09] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border border-clay-border shadow-inner">
            LIVE SYNTHESIS
          </span>
        </div>
        <p className="text-xs text-[#C0C6B2] mt-1.5 leading-relaxed font-sans font-medium">
          {executiveSummary}
        </p>
      </div>
    </div>
  );
};


