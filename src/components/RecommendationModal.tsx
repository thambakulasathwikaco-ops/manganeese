import React from 'react';
import type { Recommendation } from '../types';
import { useAppStore } from '../store/useAppStore';
import { X, CheckCircle, Ban, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface RecommendationModalProps {
  recommendation: Recommendation | null;
  onClose: () => void;
}

export const RecommendationModal: React.FC<RecommendationModalProps> = ({ recommendation, onClose }) => {
  const { acceptRecommendation, dismissRecommendation } = useAppStore();

  if (!recommendation) return null;

  const handleAccept = () => {
    acceptRecommendation(recommendation.id);
    onClose();
  };

  const handleDismiss = () => {
    dismissRecommendation(recommendation.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0E09]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="clay-card w-full max-w-lg rounded-2xl border border-[#252E1D] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#1D2517] border border-[#71825B] rounded-xl text-[#A4B18A]">
              <AlertTriangle size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono px-2 py-0.5 rounded bg-[#0B0E09] text-[#A4B18A] border border-[#252E1D]">
                {recommendation.category} • {recommendation.priority} PRIORITY
              </span>
              <h3 className="text-lg font-bold text-[#F1F2E9] mt-1">{recommendation.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-[#71825B] hover:text-[#F1F2E9] p-1">
            <X size={20} />
          </button>
        </div>

        {/* Reason / Context */}
        <div className="clay-recessed p-3.5 rounded-xl border border-[#252E1D] text-xs space-y-1">
          <span className="text-[#71825B] font-semibold uppercase tracking-wider text-[10px] font-mono">Operational Trigger</span>
          <p className="text-[#F1F2E9]">{recommendation.reason}</p>
        </div>

        {/* Detailed Action Plan */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[#71825B] uppercase tracking-wider font-mono">Recommended Action Plan</h4>
          <div className="clay-recessed p-4 rounded-xl border border-[#252E1D] text-sm text-[#F1F2E9] flex items-start gap-3">
            <ArrowRight size={18} className="text-[#A4B18A] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{recommendation.action}</p>
          </div>
        </div>

        {/* Quantified Impact */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-[#71825B] uppercase tracking-wider font-mono">Quantified Production Impact</h4>
          <div className="bg-[#1D2517] p-3.5 rounded-xl border border-[#71825B]/40 text-xs text-[#A4B18A] font-medium flex items-center gap-2.5">
            <ShieldCheck size={18} className="shrink-0 text-[#A4B18A]" />
            <span>{recommendation.impact}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1D2517]">
          <button
            onClick={handleDismiss}
            disabled={recommendation.status === 'dismissed'}
            className="btn-clay-secondary px-4 py-2 text-xs font-semibold text-[#71825B] hover:text-[#F1F2E9] flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Ban size={15} />
            {recommendation.status === 'dismissed' ? 'Dismissed' : 'Dismiss'}
          </button>
          <button
            onClick={handleAccept}
            disabled={recommendation.status === 'accepted'}
            className="btn-clay-primary px-5 py-2 text-xs font-extrabold text-[#0B0E09] flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle size={15} />
            {recommendation.status === 'accepted' ? 'Accepted' : 'Accept Action'}
          </button>
        </div>
      </div>
    </div>
  );
};
