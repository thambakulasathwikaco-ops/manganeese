import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { riskService } from '../services/riskService';
import { Sparkles } from 'lucide-react';
import { AnnouncementCard } from './ui/Card';

export const ExecutiveSummaryBanner: React.FC = () => {
  const { productionFactors } = useAppStore();
  const { executiveSummary } = riskService.calculateRisk(productionFactors);

  return (
    <AnnouncementCard
      title="AI Operational Executive Summary"
      message={executiveSummary}
      icon={Sparkles}
      badge="LIVE SYNTHESIS"
    />
  );
};
