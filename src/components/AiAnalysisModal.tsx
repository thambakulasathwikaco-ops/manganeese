import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Cpu, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const AiAnalysisModal: React.FC = () => {
  const { aiAnalysisStatus, aiAnalysisStage, aiAnalysisProgress } = useAppStore();

  if (aiAnalysisStatus === 'idle') return null;

  const stages = [
    'COLLECTING DATA',
    'PREPROCESSING',
    'EXTRACTING FEATURES',
    'PROSPECTIVITY ANALYSIS',
    'PRODUCTION FORECAST',
    'SHORTFALL ANALYSIS',
    'RECOMMENDATIONS',
    'ANALYSIS COMPLETE'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-[#0B0E09]/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="clay-card w-full max-w-lg p-6 space-y-6 text-center shadow-2xl border border-[#252E1D]"
        >
          {/* Header Icon */}
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center rounded-2xl bg-[#0B0E09] border border-[#252E1D] text-[#A4B18A] shadow-inner">
            {aiAnalysisStatus === 'completed' ? (
              <CheckCircle2 size={32} className="text-[#A4B18A]" />
            ) : (
              <>
                <Cpu size={28} className="animate-pulse text-[#A4B18A]" />
                <Sparkles size={14} className="absolute -top-1 -right-1 text-[#F1F2E9] animate-spin" />
              </>
            )}
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-[#F1F2E9] tracking-tight">
              {aiAnalysisStatus === 'completed' ? 'AI Operational Pipeline Complete' : 'Executing SMARTMINE AI Engine'}
            </h3>
            <p className="text-xs text-[#71825B] mt-1 font-mono">
              MOIL Prototype Neural & Geospatial Intelligence Pipeline
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#71825B] font-mono">
              <span className="font-semibold">{aiAnalysisStage}</span>
              <span className="text-[#A4B18A] font-bold">{aiAnalysisProgress}%</span>
            </div>
            <div className="w-full bg-[#0B0E09] h-2.5 rounded-full overflow-hidden border border-[#252E1D] shadow-inner">
              <motion.div
                className="h-full bg-[#A4B18A] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${aiAnalysisProgress}%` }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
              />
            </div>
          </div>

          {/* Stage checklist */}
          <div className="space-y-2 text-left clay-recessed p-4 text-xs font-mono border border-[#252E1D]">
            {stages.map((stg, idx) => {
              const isCurrent = aiAnalysisStage === stg;
              const isPassed = aiAnalysisProgress >= ((idx + 1) / stages.length) * 100 || aiAnalysisStatus === 'completed';
              return (
                <div key={stg} className="flex items-center justify-between">
                  <span className={isPassed ? 'text-[#A4B18A] font-medium' : isCurrent ? 'text-[#F1F2E9] font-bold' : 'text-[#71825B]'}>
                    {stg}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 size={14} className="text-[#A4B18A] shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 size={14} className="text-[#F1F2E9] animate-spin shrink-0" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border border-[#252E1D] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


