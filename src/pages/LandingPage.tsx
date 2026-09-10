import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { forecastService } from '../services/forecastService';
import { riskService } from '../services/riskService';
import { LocationIntelligenceSection } from '../components/LocationIntelligenceSection';
import { MapPin, TrendingUp, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { productionFactors, zones, recommendations } = useAppStore();

  const { predictedProduction } = forecastService.calculateForecast(productionFactors);
  const { riskLevel, shortfallPct } = riskService.calculateRisk(productionFactors);

  const highPotentialZonesCount = zones.filter((z) => z.potentialLevel === 'HIGH').length;
  const pendingRecsCount = recommendations.filter((r) => r.status === 'pending').length;

  const features = [
    {
      id: 'prospectivity',
      icon: MapPin,
      title: 'Manganese Prospectivity AI',
      desc: 'Ensemble multi-spectral & borehole core sample analytics predicting deposit high-potential zones.',
      route: '/manganese-map',
      badge: `${highPotentialZonesCount} High Potential Zones`,
      iconBg: 'clay-recessed text-sage-light'
    },
    {
      id: 'forecasting',
      icon: TrendingUp,
      title: '30-Day Production Forecasting',
      desc: 'Multi-factor operational model accounting for equipment downtime, weather, and transport readiness.',
      route: '/production',
      badge: `${predictedProduction.toLocaleString()} MT Output`,
      iconBg: 'clay-recessed text-sage-light'
    },
    {
      id: 'shortfall',
      icon: ShieldAlert,
      title: 'Shortfall & Bottleneck Attribution',
      desc: 'Dynamic risk quantification decomposing operational losses into normalized percentage drivers.',
      route: '/shortfall',
      badge: `${riskLevel} RISK (${shortfallPct}% Gap)`,
      iconBg: 'clay-recessed text-olive-accent'
    },
    {
      id: 'recommendations',
      icon: Cpu,
      title: 'Autonomous Decision Intelligence',
      desc: 'Actionable recommendations with one-click acceptance, quantified tonnage impact, and audit tracking.',
      route: '/dashboard#recommendations',
      badge: `${pendingRecsCount} Actionable Items`,
      iconBg: 'clay-recessed text-ivory-warm'
    }
  ];

  return (
    <div className="min-h-screen bg-[#10140D] text-[#F1F2E9] flex flex-col justify-between selection:bg-[#71825B]/30 selection:text-[#F1F2E9] relative overflow-hidden">
      
      {/* Quiet Atmospheric Ambient Topographic Depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#303A25]/20 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Landing Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-[#1D2517] border border-clay-border flex items-center justify-center text-sage-light font-black text-lg shadow-inner">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#F1F2E9] tracking-tight text-base">MOIL SMARTMINE</span>
              <span className="text-[10px] font-mono font-bold bg-[#0B0E09] text-sage-light px-2 py-0.5 rounded-md border border-clay-border shadow-inner">AI</span>
            </div>
            <p className="text-[9px] font-mono text-clay-muted tracking-widest uppercase">PREDICT. PLAN. PRODUCE.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/manganese-map')}
            className="hidden sm:flex px-4 py-2 rounded-xl text-xs font-semibold text-[#C0C6B2] hover:text-[#F1F2E9] hover:bg-[#171D12] transition cursor-pointer"
          >
            GIS Map
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 btn-clay-primary text-xs transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span>ENTER SMARTMINE</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-20 text-center z-10 flex-1 flex flex-col justify-center items-center">
        
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] uppercase text-sage-light mb-4 sm:mb-6"
        >
          MOIL SMARTMINE AI
        </motion.div>

        {/* Main Hero Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] max-w-5xl text-center mb-6 sm:mb-8">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="block text-[#F1F2E9] uppercase tracking-[0.01em]"
          >
            MANGANESE
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="block text-[#A4B18A] uppercase tracking-[0.01em]"
          >
            INTELLIGENCE, REIMAGINED.
          </motion.span>
        </h1>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="text-xs sm:text-sm md:text-base font-mono font-bold tracking-[0.3em] uppercase text-[#C0C6B2] mb-10 sm:mb-14"
        >
          PREDICT. PLAN. PRODUCE.
        </motion.div>

        {/* Hero Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-12 sm:mb-16"
        >
          {/* Primary Raised Light-Olive / Ivory Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 btn-clay-primary text-sm transition flex items-center justify-center gap-3 group cursor-pointer uppercase tracking-wider font-extrabold"
          >
            <span>ENTER SMARTMINE DASHBOARD</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
          </button>
          
          {/* Secondary Dark Olive Clay Surface with Sage Border Highlight */}
          <button
            onClick={() => navigate('/manganese-map')}
            className="w-full sm:w-auto px-8 py-3.5 btn-clay-secondary text-sm transition flex items-center justify-center gap-2 cursor-pointer font-bold uppercase tracking-wider"
          >
            <MapPin size={16} className="text-sage-light" />
            <span>VIEW MANGANESE MAP</span>
          </button>
        </motion.div>

        {/* Location Intelligence Console (Single Sculpted Instrument) */}
        <LocationIntelligenceSection />

        {/* Metrics Ticker Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-10 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 text-left"
        >
          <div className="clay-recessed p-4 rounded-xl">
            <div className="text-[10px] uppercase font-mono text-clay-muted font-bold tracking-wider">Prospectivity Model</div>
            <div className="text-xl font-extrabold text-[#F1F2E9] font-mono mt-1">94.2% AUC</div>
            <div className="text-[11px] text-clay-muted font-mono mt-0.5">Spatial Core Assays</div>
          </div>
          <div className="clay-recessed p-4 rounded-xl">
            <div className="text-[10px] uppercase font-mono text-clay-muted font-bold tracking-wider">Production Forecast</div>
            <div className="text-xl font-extrabold text-sage-light font-mono mt-1">{predictedProduction.toLocaleString()} MT</div>
            <div className="text-[11px] text-clay-muted font-mono mt-0.5">30-Day Multi-Factor</div>
          </div>
          <div className="clay-recessed p-4 rounded-xl">
            <div className="text-[10px] uppercase font-mono text-clay-muted font-bold tracking-wider">Shortfall Risk</div>
            <div className="text-xl font-extrabold text-olive-accent font-mono mt-1">
              {riskLevel}
            </div>
            <div className="text-[11px] text-clay-muted font-mono mt-0.5">{shortfallPct}% Target Variance</div>
          </div>
          <div className="clay-recessed p-4 rounded-xl">
            <div className="text-[10px] uppercase font-mono text-clay-muted font-bold tracking-wider">Evaluated Mine Zones</div>
            <div className="text-xl font-extrabold text-ivory-warm font-mono mt-1">{zones.length} Zones</div>
            <div className="text-[11px] text-clay-muted font-mono mt-0.5">Dongri-Mansar Belt</div>
          </div>
        </motion.div>

        {/* 4 Core Intelligence Cards Grid */}
        <div className="mt-14 w-full max-w-5xl text-left grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => navigate(feat.route)}
                className="clay-card clay-card-hover p-6 cursor-pointer space-y-4 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${feat.iconBg} border border-clay-border shadow-inner`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase clay-recessed text-chrome-plat px-3 py-1 rounded-full border border-clay-border">
                    {feat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#F1F2E9] group-hover:text-sage-light transition">{feat.title}</h3>
                  <p className="text-xs text-clay-muted leading-relaxed mt-1.5">{feat.desc}</p>
                </div>

                <div className="pt-1 flex items-center gap-1 text-xs font-mono font-bold text-sage-light group-hover:translate-x-1 transition duration-200 uppercase tracking-wider">
                  <span>LAUNCH MODULE</span>
                  <ArrowRight size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Landing Footer */}
      <footer className="px-6 py-6 border-t border-clay-border max-w-7xl mx-auto w-full text-center sm:flex items-center justify-between text-xs text-clay-muted font-mono z-10">
        <div>MOIL SMARTMINE AI — Operational Intelligence Platform</div>
        <div className="mt-2 sm:mt-0 text-clay-muted">Built with React, TypeScript, Leaflet & Recharts</div>
      </footer>
    </div>
  );
};

