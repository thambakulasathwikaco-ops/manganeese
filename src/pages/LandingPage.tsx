import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { forecastService } from '../services/forecastService';
import { riskService } from '../services/riskService';
import { LocationIntelligenceSection } from '../components/LocationIntelligenceSection';
import { ManganeseOreCanvas } from '../components/ManganeseOreCanvas';
import { MapPin, TrendingUp, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';
import { CardGrid, StatCard, FeatureCard } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCtaHovered, setIsCtaHovered] = useState<boolean>(false);
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
      desc: 'Ensemble multi-spectral & borehole core sample analytics predicting deposit high-potential orebody zones.',
      route: '/manganese-map',
      badge: `${highPotentialZonesCount} High Potential Zones`
    },
    {
      id: 'forecasting',
      icon: TrendingUp,
      title: '30-Day Production Forecasting',
      desc: 'Multi-factor operational model accounting for equipment downtime, weather, and transport readiness.',
      route: '/production',
      badge: `${predictedProduction.toLocaleString()} MT Output`
    },
    {
      id: 'shortfall',
      icon: ShieldAlert,
      title: 'Shortfall & Bottleneck Attribution',
      desc: 'Dynamic risk quantification decomposing operational losses into normalized percentage drivers.',
      route: '/shortfall',
      badge: `${riskLevel} RISK (${shortfallPct}% Gap)`
    },
    {
      id: 'recommendations',
      icon: Cpu,
      title: 'Autonomous Decision Intelligence',
      desc: 'Actionable recommendations with one-click acceptance, quantified tonnage impact, and audit tracking.',
      route: '/dashboard#recommendations',
      badge: `${pendingRecsCount} Actionable Items`
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B100B] text-[#F1F1E9] flex flex-col justify-between selection:bg-[#A9B58D]/30 selection:text-[#F1F1E9] relative overflow-hidden font-sans">
      
      {/* Deep Atmospheric Subsurface Depth Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-[#182016]/40 via-[#111811]/20 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-30">
        
        {/* Brand Identity: Manganese Mining + Compact M Icon */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 rounded-lg bg-[#182016] border border-[#A9B58D]/30 flex items-center justify-center text-[#F1F1E9] font-black text-sm shadow-inner group-hover:border-[#A9B58D]/60 transition duration-200">
            M
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#F1F1E9] tracking-tight text-sm uppercase">
                MANGANESE MINING
              </span>
              <span className="text-[9px] font-mono font-bold bg-[#111811] text-[#A9B58D] px-2 py-0.5 rounded border border-[#A9B58D]/25 uppercase tracking-wider">
                INTELLIGENCE
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-bold tracking-widest text-[#9EA493]">
          <button
            onClick={() => navigate('/manganese-map')}
            className="hover:text-[#F1F1E9] transition duration-200 cursor-pointer uppercase"
          >
            GIS MAP
          </button>
          <button
            onClick={() => navigate('/data')}
            className="hover:text-[#F1F1E9] transition duration-200 cursor-pointer uppercase"
          >
            MINING DATA
          </button>
          <button
            onClick={() => navigate('/analyzed-locations')}
            className="hover:text-[#F1F1E9] transition duration-200 cursor-pointer uppercase"
          >
            INTELLIGENCE
          </button>
        </nav>

        {/* Header Right CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-[#F1F1E9] text-[#0B100B] hover:bg-[#FFFFFF] font-extrabold text-xs rounded-xl shadow-md transition duration-200 flex items-center gap-2 cursor-pointer uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>ENTER PLATFORM</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Visual-First Main Hero Section */}
      <main className="max-w-6xl mx-auto px-4 pt-4 sm:pt-8 pb-12 text-center z-10 flex-1 flex flex-col justify-center items-center relative">
        
        {/* Dominant Minimal Typography */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none uppercase text-[#F1F1E9] select-none z-10 opacity-90 tracking-tighter"
        >
          MANGANESE
        </motion.h1>

        {/* Central 3D Manganese Ore Animation (55–70% Visual Focus) */}
        <div className="w-full max-w-4xl h-[400px] sm:h-[500px] -mt-8 sm:-mt-16 -mb-6 sm:-mb-10 relative z-20 flex items-center justify-center">
          <ManganeseOreCanvas isCtaHovered={isCtaHovered} />
        </div>

        {/* Primary & Secondary Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14 z-30 w-full sm:w-auto px-4"
        >
          {/* Primary CTA Button */}
          <button
            onClick={() => navigate('/dashboard')}
            onMouseEnter={() => setIsCtaHovered(true)}
            onMouseLeave={() => setIsCtaHovered(false)}
            className="w-full sm:w-auto px-9 py-4 bg-[#F1F1E9] hover:bg-[#FFFFFF] text-[#0B100B] font-extrabold text-xs sm:text-sm rounded-xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>ENTER MINING INTELLIGENCE</span>
            <ArrowRight size={16} />
          </button>
          
          {/* Secondary CTA Button */}
          <button
            onClick={() => navigate('/manganese-map')}
            onMouseEnter={() => setIsCtaHovered(true)}
            onMouseLeave={() => setIsCtaHovered(false)}
            className="w-full sm:w-auto px-8 py-4 bg-[#182016] hover:bg-[#212C1E] text-[#F1F1E9] border border-[#A9B58D]/30 hover:border-[#A9B58D]/60 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0"
          >
            <MapPin size={16} className="text-[#A9B58D]" />
            <span>VIEW MANGANESE MAP</span>
          </button>
        </motion.div>

        {/* Location & Geological Site Intelligence Section */}
        <div className="w-full max-w-5xl mb-12 relative z-10">
          <LocationIntelligenceSection />
        </div>

        {/* Metrics Ticker Row */}
        <div className="mt-4 w-full max-w-5xl text-left relative z-10">
          <CardGrid columns={4}>
            <StatCard
              title="Prospectivity Model"
              value="94.2% AUC"
              subtext="Spatial Core Assays"
            />
            <StatCard
              title="Production Forecast"
              value={`${predictedProduction.toLocaleString()} MT`}
              subtext="30-Day Multi-Factor Yield"
            />
            <StatCard
              title="Shortfall Risk"
              value={riskLevel}
              subtext={`${shortfallPct}% Target Variance`}
            />
            <StatCard
              title="Evaluated Mine Zones"
              value={`${zones.length} Zones`}
              subtext="Dongri-Mansar Belt"
            />
          </CardGrid>
        </div>

        {/* 4 Core Mining Intelligence Feature Cards Grid */}
        <div className="mt-8 w-full max-w-5xl text-left relative z-10">
          <CardGrid columns={2}>
            {features.map((feat) => (
              <FeatureCard
                key={feat.id}
                title={feat.title}
                description={feat.desc}
                icon={feat.icon}
                badge={feat.badge}
                actionText="ENTER MODULE"
                onClick={() => navigate(feat.route)}
              />
            ))}
          </CardGrid>
        </div>
      </main>

      {/* Industrial Landing Footer */}
      <footer className="px-6 sm:px-10 py-6 border-t border-[#182016] max-w-7xl mx-auto w-full text-center sm:flex items-center justify-between text-xs text-[#9EA493] font-mono z-10">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <span className="w-2 h-2 rounded-full bg-[#A9B58D] animate-pulse" />
          <span className="font-bold text-[#F1F1E9]">MANGANESE MINING INTELLIGENCE PLATFORM</span>
          <span>— DONGRI-MANSAR BELT</span>
        </div>
        <div className="mt-2 sm:mt-0 text-[11px] text-[#9EA493]/70">
          Geological GIS • Orebody Analytics • 30-Day Production Engine
        </div>
      </footer>
    </div>
  );
};


