import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExecutiveSummaryBanner } from '../components/ExecutiveSummaryBanner';
import { ProspectivityCard } from '../components/ProspectivityCard';
import { ProductionForecastCard } from '../components/ProductionForecastCard';
import { ShortfallRiskCard } from '../components/ShortfallRiskCard';
import { RecommendedStepsCard } from '../components/RecommendedStepsCard';
import { AiAnalysisModal } from '../components/AiAnalysisModal';
import { useAppStore } from '../store/useAppStore';
import { Cpu, ArrowRight, ArrowLeft } from 'lucide-react';
import { CardGrid } from '../components/ui/Card';

export const DashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { runFullAiAnalysis, aiAnalysisStatus, lastAnalysisTimestamp } = useAppStore();

  useEffect(() => {
    if (location.hash === '#recommendations') {
      const el = document.getElementById('recommendations-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/manganese-map');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="btn-clay-secondary px-3 py-2 rounded-xl text-xs font-mono font-bold text-[#A4B18A] hover:text-[#F1F2E9] flex items-center justify-center gap-1.5 cursor-pointer transition border border-[#252E1D] shadow-sm shrink-0 active:translate-y-px"
            aria-label="Go back"
          >
            <ArrowLeft size={14} />
            <span>BACK</span>
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-[#F1F2E9] tracking-tight">Executive Dashboard</h1>
              <span className="bg-[#0B0E09] border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg shadow-inner tracking-wide">
                LIVE SYSTEM STATE
              </span>
            </div>
            <p className="text-xs text-[#71825B] font-mono mt-1">
              MOIL SmartMine Core Intelligence • Last Analysis: {lastAnalysisTimestamp ? new Date(lastAnalysisTimestamp).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigate('/manganese-map#location-intelligence')}
            className="btn-clay-secondary px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider text-[#A4B18A] hover:text-[#F1F2E9] border border-[#252E1D]"
            aria-label="Analyze location"
          >
            <span>ANALYZE LOCATION</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => runFullAiAnalysis()}
            disabled={aiAnalysisStatus === 'running'}
            className="btn-clay-primary px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 disabled:opacity-50 text-[#0B0E09] cursor-pointer uppercase tracking-wider shadow-sm"
            aria-label="Run AI analysis"
          >
            <Cpu size={15} className={aiAnalysisStatus === 'running' ? 'animate-spin' : ''} />
            <span>{aiAnalysisStatus === 'running' ? 'ANALYZING...' : 'RUN AI ANALYSIS'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Executive Narrative Summary */}
      <ExecutiveSummaryBanner />

      {/* 4 Primary Intelligence Modules in CardGrid */}
      <CardGrid columns={2}>
        <ProspectivityCard />
        <ProductionForecastCard />
        <ShortfallRiskCard />
        <div id="recommendations-section">
          <RecommendedStepsCard />
        </div>
      </CardGrid>

      {/* AI Pipeline Loading Modal */}
      <AiAnalysisModal />
    </div>
  );
};
