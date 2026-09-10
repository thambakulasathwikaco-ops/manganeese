import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import type { Recommendation } from '../types';
import { RecommendationModal } from './RecommendationModal';
import { Ban, Eye, Check, Cpu } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { Card, CardHeader, CardBadge, CardTitle, CardContent, ListCard, EmptyStateCard } from './ui/Card';

export const RecommendedStepsCard: React.FC<{ staggerIndex?: number }> = ({ staggerIndex }) => {
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
    <Card variant="primary" staggerIndex={staggerIndex} className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CardBadge variant="sage">04 / DECIDE</CardBadge>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#71825B] tracking-wider block">
                Autonomous Decision Intelligence
              </span>
              <CardTitle>Recommended Steps</CardTitle>
            </div>
          </div>

          <div className="flex items-center p-1 bg-[#0B0E09] rounded-xl border border-[#252E1D] shadow-inner text-xs self-start sm:self-auto font-mono">
            {(['pending', 'accepted', 'dismissed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer capitalize ${
                  activeTab === tab
                    ? 'bg-[#1D2517] text-[#F1F2E9] font-extrabold border border-[#252E1D] shadow-sm'
                    : 'text-[#71825B] hover:text-[#F1F2E9]'
                }`}
              >
                {tab} (<AnimatedCounter value={counts[tab]} />)
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="mt-4 space-y-3 min-h-[220px]">
          <AnimatePresence mode="popLayout">
            {filteredRecs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyStateCard
                  icon={Cpu}
                  title="Queue Clear"
                  description={`No recommendations currently in ${activeTab.toUpperCase()} queue.`}
                />
              </motion.div>
            ) : (
              filteredRecs.map((rec) => (
                <ListCard
                  key={rec.id}
                  title={rec.title}
                  subtitle={rec.category}
                  badge={
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        rec.priority === 'HIGH'
                          ? 'bg-[#1D2517] text-[#F1F2E9] border border-[#71825B]'
                          : 'bg-[#171D12] text-[#71825B] border border-[#252E1D]'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  }
                  actions={
                    <div className="flex items-center gap-2">
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
                  }
                >
                  <p className="text-[#71825B] text-[11px] line-clamp-1 font-sans">{rec.reason}</p>
                </ListCard>
              ))
            )}
          </AnimatePresence>
        </CardContent>
      </div>

      <RecommendationModal
        recommendation={selectedRec}
        onClose={() => setSelectedRec(null)}
      />
    </Card>
  );
};
