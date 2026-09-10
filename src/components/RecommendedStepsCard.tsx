import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import type { Recommendation } from '../types';
import { RecommendationModal } from './RecommendationModal';
import { Ban, Eye, Check } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

export const RecommendedStepsCard: React.FC = () => {
  const { recommendations, acceptRecommendation, dismissRecommendation } = useAppStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'dismissed'>('pending');
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  const filteredRecs = recommendations.filter((r) => r.status === activeTab);

  const counts = {
    pending: recommendations.filter((r) => r.status === 'pending').length,
    accepted: recommendations.filter((r) => r.status === 'accepted').length,
    dismissed: recommendations.filter((r) => r.status === 'dismissed').length
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="clay-card p-6 flex flex-col justify-between relative overflow-hidden group"
    >
      <div>
        {/* Header & Tabs with 04 / DECIDE Module Number */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-bold text-[#A4B18A] px-2.5 py-0.5 rounded-lg bg-[#0B0E09] border border-[#252E1D] shadow-inner">
              04 / DECIDE
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#71825B] tracking-wider">
                Autonomous Decision Intelligence
              </span>
              <h3 className="text-base font-extrabold text-[#F1F2E9]">Recommended Steps</h3>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center p-1 bg-[#0B0E09] rounded-xl border border-[#252E1D] shadow-inner text-xs self-start sm:self-auto font-mono">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pending' ? 'bg-[#1D2517] text-[#F1F2E9] font-extrabold border border-[#252E1D] shadow-sm' : 'text-[#71825B] hover:text-[#F1F2E9]'
              }`}
            >
              Actions (<AnimatedCounter value={counts.pending} />)
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'accepted' ? 'bg-[#1D2517] text-[#F1F2E9] font-extrabold border border-[#252E1D] shadow-sm' : 'text-[#71825B] hover:text-[#F1F2E9]'
              }`}
            >
              Accepted (<AnimatedCounter value={counts.accepted} />)
            </button>
            <button
              onClick={() => setActiveTab('dismissed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dismissed' ? 'bg-[#1D2517] text-[#F1F2E9] font-extrabold border border-[#252E1D] shadow-sm' : 'text-[#71825B] hover:text-[#F1F2E9]'
              }`}
            >
              Dismissed (<AnimatedCounter value={counts.dismissed} />)
            </button>
          </div>
        </div>

        {/* Recommendation Cards List */}
        <div className="mt-4 space-y-3 min-h-[220px]">
          <AnimatePresence mode="popLayout">
            {filteredRecs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-[#71825B] text-xs font-mono clay-recessed border border-[#252E1D]"
              >
                No recommendations currently in {activeTab.toUpperCase()} queue.
              </motion.div>
            ) : (
              filteredRecs.map((rec) => (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="clay-recessed p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-[#252E1D]"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                        rec.priority === 'HIGH' ? 'bg-[#1D2517] text-[#F1F2E9] border border-[#71825B]' : 'bg-[#171D12] text-[#71825B] border border-[#252E1D]'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-[9px] font-mono text-[#71825B] uppercase font-semibold">{rec.category}</span>
                    </div>
                    <h4 className="font-bold text-[#F1F2E9] text-xs sm:text-sm">{rec.title}</h4>
                    <p className="text-[#71825B] text-[11px] line-clamp-1">{rec.reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedRec(rec)}
                      className="px-3 py-1.5 rounded-xl bg-[#1D2517] hover:bg-[#252E1D] text-[#F1F2E9] font-semibold flex items-center gap-1 transition text-[11px] border border-[#252E1D] cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={13} />
                      Details
                    </button>

                    {rec.status === 'pending' && (
                      <>
                        <button
                          onClick={() => dismissRecommendation(rec.id)}
                          className="p-2 rounded-xl bg-[#171D12] hover:bg-[#1D2517] text-[#71825B] transition cursor-pointer border border-[#252E1D]"
                          title="Dismiss"
                        >
                          <Ban size={13} />
                        </button>
                        <button
                          onClick={() => acceptRecommendation(rec.id)}
                          className="btn-clay-primary px-3.5 py-1.5 text-[#0B0E09] font-extrabold transition flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Check size={13} />
                          Accept
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <RecommendationModal
        recommendation={selectedRec}
        onClose={() => setSelectedRec(null)}
      />
    </motion.div>
  );
};


