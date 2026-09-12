import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Navigation,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  Compass,
  Cpu
} from 'lucide-react';
import type { SelectedLocation, ProspectivityAnalysisResult, LocationAnalysisRecord } from '../types';
import { locationService } from '../services/locationService';
import { prospectivityService } from '../services/prospectivityService';
import { LocationMapSelector } from './LocationMapSelector';
import { ErrorBoundary } from './ErrorBoundary';
import { useAppStore } from '../store/useAppStore';

const ANALYSIS_STAGES = [
  'DATA',
  'PREPROCESS',
  'GEOLOGICAL FEATURES',
  'SATELLITE FEATURES',
  'BOREHOLE FEATURES',
  'TERRAIN FEATURES',
  'PROSPECTIVITY MODEL',
  'CALCULATING CONFIDENCE',
  'RECOMMENDATION',
  'COMPLETE'
];

const LocationIntelligenceContent: React.FC = () => {
  const navigate = useNavigate();
  const { addSiteIntelligenceRecord } = useAppStore();

  // Centralized location state
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
    latitude: 21.1458,
    longitude: 79.0882,
    name: 'Nagpur, Maharashtra',
    source: 'search'
  });

  const [searchInput, setSearchInput] = useState<string>('Nagpur, Maharashtra');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Analysis state model: 'idle' (selection) | 'analyzing' (processing) | 'completed' (result)
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'completed'>('idle');
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<ProspectivityAnalysisResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState<number>(0);

  // Handle Change Location (Clears previous result and returns to location selection state)
  const handleChangeLocation = () => {
    setAnalysisResult(null);
    setAnalysisStatus('idle');
    setSearchInput(''); // Ready for fresh location input
    setErrorMessage(null);
  };

  // Handle Manual Place / Coordinate Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;

    setErrorMessage(null);
    setIsSearching(true);

    try {
      const res = await locationService.searchLocation(searchInput);
      const newLoc: SelectedLocation = {
        latitude: res.latitude,
        longitude: res.longitude,
        name: res.formattedName,
        source: 'search'
      };
      setSelectedLocation(newLoc);
      setAnalysisResult(null);
      setAnalysisStatus('idle');
    } catch (err: any) {
      setErrorMessage(err.message || 'Location could not be found. Try a different location or enter coordinates.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Current GPS Location
  const handleUseCurrentLocation = async () => {
    setErrorMessage(null);
    setIsGpsLoading(true);

    try {
      const gps = await locationService.getCurrentGpsLocation();
      const name = await locationService.reverseGeocode(gps.latitude, gps.longitude);

      const newLoc: SelectedLocation = {
        latitude: gps.latitude,
        longitude: gps.longitude,
        name: name || `GPS Location (${gps.latitude}°, ${gps.longitude}°)`,
        accuracy: gps.accuracy,
        source: 'gps'
      };

      setSelectedLocation(newLoc);
      setSearchInput(`${gps.latitude}, ${gps.longitude}`);
      setAnalysisResult(null);
      setAnalysisStatus('idle');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to determine your current location.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Handle Map Selection
  const handleMapCoordinateSelect = async (lat: number, lon: number) => {
    setErrorMessage(null);
    const formattedCoords = `${lat}° N, ${lon}° E`;

    const newLoc: SelectedLocation = {
      latitude: lat,
      longitude: lon,
      name: formattedCoords,
      source: 'map'
    };

    setSelectedLocation(newLoc);
    setSearchInput(`${lat}, ${lon}`);
    setAnalysisResult(null);
    setAnalysisStatus('idle');

    try {
      const prettyName = await locationService.reverseGeocode(lat, lon);
      if (prettyName && prettyName !== formattedCoords) {
        setSelectedLocation((prev) =>
          prev.latitude === lat && prev.longitude === lon
            ? { ...prev, name: prettyName }
            : prev
        );
      }
    } catch {
      // Keep formattedCoords
    }
  };

  // Handle Analyze Location
  const handleAnalyzeLocation = async () => {
    if (!selectedLocation) return;
    setErrorMessage(null);
    setAnalysisStatus('analyzing');
    setCurrentStageIndex(0);

    for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
      setCurrentStageIndex(i);
      await new Promise((r) => setTimeout(r, 180));
    }

    const result = prospectivityService.calculateProspectivity(selectedLocation);
    setAnalysisResult(result);
    setAnalysisStatus('completed');

    // Create & register site intelligence record in central memory
    const locId = `SITE-CUSTOM-${Math.abs(Math.round(selectedLocation.latitude * 1000 + selectedLocation.longitude * 1000))}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord: LocationAnalysisRecord = {
      id: `site-custom-${Date.now()}`,
      locationId: locId,
      locationName: selectedLocation.name || `Location ${selectedLocation.latitude}, ${selectedLocation.longitude}`,
      region: selectedLocation.name.includes('Maharashtra') ? 'Nagpur District' : 'Custom Prospect',
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      analyzedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      suitabilityScore: result.prospectivityScore,
      productionPotential: Math.min(96, Math.max(20, Math.round(result.prospectivityScore * 0.98))),
      resourcePotential: Math.min(98, Math.max(25, Math.round(result.geologicalScore * 0.95))),
      accessibilityScore: Math.min(94, Math.max(30, Math.round(result.terrainScore * 0.9 + 10))),
      infrastructureScore: Math.min(92, Math.max(35, Math.round(result.satelliteScore * 0.9))),
      transportScore: Math.min(90, Math.max(40, Math.round(result.terrainScore * 0.85 + 10))),
      equipmentAvailability: 80,
      weatherRiskScore: 28,
      weatherRiskLevel: 'LOW',
      operationalRisk: Math.max(10, 100 - result.confidence),
      environmentalScore: Math.min(95, Math.max(50, Math.round(result.satelliteScore * 0.9 + 5))),
      overallScore: result.prospectivityScore,
      status: result.prospectivityScore >= 75 ? 'OPTIMIZED' : result.prospectivityScore >= 50 ? 'ACTIVE' : 'PROSPECTING',
      manganeseGradePct: Number((30 + result.prospectivityScore * 0.18).toFixed(1)),
      estimatedReserveTons: Math.round(result.prospectivityScore * 15000),
      geologicalScore: result.geologicalScore,
      boreholeScore: result.boreholeScore,
      satelliteScore: result.satelliteScore,
      terrainScore: result.terrainScore,
      recommendation: result.aiExplanation,
      history: [
        {
          analyzedAt: todayStr,
          suitabilityScore: result.prospectivityScore,
          productionPotential: Math.round(result.prospectivityScore * 0.98),
          resourcePotential: Math.round(result.geologicalScore * 0.95),
          accessibilityScore: Math.round(result.terrainScore * 0.9 + 10),
          infrastructureScore: Math.round(result.satelliteScore * 0.9),
          transportScore: Math.round(result.terrainScore * 0.85 + 10),
          equipmentAvailability: 80,
          weatherRiskScore: 28,
          operationalRisk: Math.max(10, 100 - result.confidence),
          environmentalScore: Math.round(result.satelliteScore * 0.9 + 5),
          overallScore: result.prospectivityScore
        }
      ]
    };

    addSiteIntelligenceRecord(newRecord);
  };

  // Score counter animation
  useEffect(() => {
    if (analysisStatus === 'completed' && analysisResult) {
      setAnimatedScore(0);
      const target = analysisResult.prospectivityScore;
      const duration = 800;
      const steps = 25;
      const stepTime = duration / steps;
      const increment = target / steps;

      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedScore(target);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [analysisStatus, analysisResult]);

  return (
    <section className="w-full max-w-6xl mx-auto my-8 text-left z-10">
      
      {/* Outer Tactile Sculpted Olive Clay Console Panel */}
      <div className="clay-card p-6 sm:p-8 relative overflow-hidden border border-clay-border">
        
        {/* Header with Breadcrumb Context & Change Location Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-clay-border pb-5">
          <div>
            {/* Contextual Breadcrumb */}
            <div className="text-[10px] font-mono text-clay-muted mb-1 flex items-center gap-1.5">
              <span>Dashboard</span>
              <span>/</span>
              <span>Location Intelligence</span>
              {analysisStatus === 'completed' && (
                <>
                  <span>/</span>
                  <span className="text-[#A4B18A] font-bold">Analysis Result</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#1D2517] border border-clay-border text-[#E4E7D8] shadow-inner">
                <Compass size={17} />
              </span>
              <h2 className="text-lg font-extrabold text-[#F1F2E9] tracking-tight">LOCATION INTELLIGENCE</h2>
              <span className="bg-[#0B0E09] border border-clay-border text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg shadow-inner">
                SPATIAL ANALYSIS
              </span>
            </div>
            <p className="text-xs text-clay-muted font-sans mt-1">
              {analysisStatus === 'completed'
                ? `Prospectivity assessment for ${selectedLocation.name}`
                : 'Select or search a location to evaluate manganese deposit potential.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {analysisStatus === 'completed' && (
              <button
                onClick={handleChangeLocation}
                className="px-3.5 py-2 btn-clay-secondary text-xs font-mono font-bold text-[#A4B18A] hover:text-[#F1F2E9] flex items-center gap-2 cursor-pointer transition border border-clay-border shadow-sm"
                aria-label="Change location"
              >
                <ArrowLeft size={14} />
                <span>CHANGE LOCATION</span>
              </button>
            )}

            <span className="text-[10px] font-mono text-clay-muted bg-[#0B0E09] px-3 py-1 rounded-xl border border-clay-border shadow-inner uppercase tracking-wider font-bold">
              DEMO DATASET ACTIVE
            </span>
          </div>
        </div>

        {/* 3-Column Sculpted Instrument Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[380px]">
          
          {/* Column 1: Location Input & GPS Controls */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4 lg:pr-4 lg:border-r lg:border-clay-border">
            <div className="space-y-4">
              <div className="text-[10px] font-mono font-bold uppercase text-clay-muted tracking-widest flex items-center justify-between">
                <span>01. SEARCH & TARGETING</span>
                {analysisStatus === 'completed' && (
                  <span className="text-[#A4B18A] cursor-pointer hover:underline" onClick={handleChangeLocation}>
                    Clear & Change
                  </span>
                )}
              </div>

              {/* Recessed Clay Location Input Form */}
              <form onSubmit={handleSearch} className="space-y-2.5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-clay-muted">
                    <Search size={15} className="text-[#A4B18A]" />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search location, district, city or coordinates..."
                    className="w-full pl-10 pr-3.5 py-2.5 input-clay text-xs placeholder-[#858E78] font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="py-2.5 px-3 btn-clay-primary text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 uppercase tracking-wider font-bold text-[#0B0E09]"
                    aria-label="Search location"
                  >
                    {isSearching ? (
                      <span className="text-[11px]">RESOLVING...</span>
                    ) : (
                      <>
                        <Search size={13} />
                        <span className="text-[11px]">SEARCH</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isGpsLoading}
                    className="py-2.5 px-3 btn-clay-secondary text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 uppercase tracking-wider font-bold"
                    aria-label="Use my current location"
                  >
                    <Navigation size={13} className={`text-[#A4B18A] ${isGpsLoading ? 'animate-spin' : ''}`} />
                    <span className="text-[11px]">USE MY GPS</span>
                  </button>
                </div>
              </form>

              {/* Error Message Alert */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="p-3 rounded-xl bg-[#5A3D34]/30 border border-[#5A3D34]/50 text-[#E4E7D8] text-xs flex items-start gap-2 font-mono shadow-inner"
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-sage-light" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Raised Clay Selected Location Summary Panel */}
              <div className="clay-card p-4 space-y-2 text-xs border border-clay-border">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-mono font-bold text-[#A4B18A] flex items-center gap-1">
                    <MapPin size={12} />
                    {selectedLocation.source === 'gps'
                      ? 'CURRENT GPS LOCATION'
                      : selectedLocation.source === 'map'
                      ? 'MAP COORDINATE POINT'
                      : 'RESOLVED TARGET'}
                  </span>
                  {selectedLocation.accuracy && (
                    <span className="text-[9px] font-mono text-clay-muted">
                      Acc: {selectedLocation.accuracy}m
                    </span>
                  )}
                </div>

                <div className="font-bold text-[#F1F2E9] text-xs truncate">
                  {selectedLocation.name}
                </div>

                <div className="font-mono text-[11px] text-clay-muted flex justify-between border-t border-clay-border pt-2">
                  <span>LAT: <strong className="text-[#F1F2E9] font-bold">{selectedLocation.latitude}° N</strong></span>
                  <span>LON: <strong className="text-[#F1F2E9] font-bold">{selectedLocation.longitude}° E</strong></span>
                </div>
              </div>
            </div>

            {/* Strongest Interactive Control: Raised Light-Sage / Ivory Button */}
            <button
              onClick={handleAnalyzeLocation}
              disabled={analysisStatus === 'analyzing'}
              className="w-full py-3.5 btn-clay-primary text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-extrabold uppercase tracking-wider text-[#0B0E09]"
              aria-label="Analyze location"
            >
              <Sparkles size={15} />
              <span>ANALYZE LOCATION</span>
            </button>
          </div>

          {/* Column 2: Recessed Interactive Leaflet Map Frame */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-2.5 lg:px-1">
            <div className="text-[10px] font-mono font-bold uppercase text-clay-muted tracking-widest flex items-center justify-between">
              <span>02. GEOSPATIAL CANVAS</span>
              <span className="text-[#A4B18A]">CLICK TO PLACE MARKER</span>
            </div>

            <div className="flex-1 min-h-[280px] clay-recessed p-1.5 overflow-hidden border border-clay-border">
              <LocationMapSelector
                latitude={selectedLocation.latitude}
                longitude={selectedLocation.longitude}
                onSelectCoordinates={handleMapCoordinateSelect}
              />
            </div>
          </div>

          {/* Column 3: Prospectivity Output Precision Instrument Panel */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4 lg:pl-4 lg:border-l lg:border-clay-border">
            <div className="text-[10px] font-mono font-bold uppercase text-clay-muted tracking-widest flex items-center justify-between">
              <span>03. PROSPECTIVITY OUTPUT</span>
              {analysisStatus === 'completed' && (
                <span className="text-[#A4B18A] font-bold">COMPLETED</span>
              )}
            </div>

            {/* State 1: Idle */}
            {analysisStatus === 'idle' && (
              <div className="flex-1 clay-recessed p-5 flex flex-col items-center justify-center text-center space-y-3 min-h-[260px] border border-clay-border">
                <div className="w-12 h-12 rounded-2xl bg-[#1D2517] border border-clay-border flex items-center justify-center text-[#A4B18A] shadow-inner">
                  <Cpu size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#F1F2E9]">Ready for Evaluation</h3>
                  <p className="text-[11px] text-clay-muted max-w-xs mt-1 leading-relaxed font-sans">
                    Select location parameters on left or click on map canvas to execute multi-spectral prospectivity analysis.
                  </p>
                </div>
              </div>
            )}

            {/* State 2: Multi-Stage Processing Sequence */}
            {analysisStatus === 'analyzing' && (
              <div className="flex-1 clay-recessed p-5 flex flex-col items-center justify-center space-y-4 min-h-[260px] border border-clay-border">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-clay-border border-t-[#A4B18A] animate-spin" />
                  <Sparkles size={18} className="text-[#A4B18A] animate-pulse" />
                </div>

                <div className="w-full space-y-2 text-center">
                  <div className="text-xs font-mono font-bold text-[#A4B18A] tracking-wider">
                    {ANALYSIS_STAGES[currentStageIndex]}
                  </div>

                  <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden border border-clay-border shadow-inner">
                    <motion.div
                      className="bg-[#A4B18A] h-full rounded-full"
                      initial={{ width: '0%' }}
                      animate={{
                        width: `${Math.round(((currentStageIndex + 1) / ANALYSIS_STAGES.length) * 100)}%`
                      }}
                      transition={{ ease: 'easeOut', duration: 0.2 }}
                    />
                  </div>

                  <div className="text-[9px] font-mono text-clay-muted flex justify-between">
                    <span>STAGE {currentStageIndex + 1} OF {ANALYSIS_STAGES.length}</span>
                    <span>{Math.round(((currentStageIndex + 1) / ANALYSIS_STAGES.length) * 100)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* State 3: Completed Prospectivity Results */}
            {analysisStatus === 'completed' && analysisResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="flex-1 clay-recessed p-4 flex flex-col justify-between space-y-4 border border-clay-border"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between border-b border-clay-border pb-2">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-clay-muted uppercase tracking-wider">
                        AI-PREDICTED MANGANESE POTENTIAL
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-3xl font-black font-mono text-[#F1F2E9]">
                          {animatedScore}%
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-extrabold uppercase ${
                            analysisResult.potentialLevel === 'HIGH'
                              ? 'bg-[#A4B18A] text-[#10140D] shadow-sm'
                              : analysisResult.potentialLevel === 'MEDIUM'
                              ? 'bg-[#71825B] text-[#F1F2E9]'
                              : 'bg-[#39482B] text-[#C0C6B2]'
                          }`}
                        >
                          {analysisResult.potentialLevel} POTENTIAL
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono text-clay-muted">MODEL CONFIDENCE</span>
                      <div className="text-sm font-mono font-bold text-[#A4B18A]">{analysisResult.confidence}%</div>
                    </div>
                  </div>

                  {/* 4 Tonal Olive Evidence Indicators */}
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-clay-muted text-[10px]">
                      <span>Geological (35%)</span>
                      <span className="text-[#F1F2E9] font-bold">{analysisResult.geologicalScore}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden shadow-inner">
                      <div className="bg-[#A4B18A] h-full rounded-full" style={{ width: `${analysisResult.geologicalScore}%` }} />
                    </div>

                    <div className="flex justify-between text-clay-muted text-[10px]">
                      <span>Borehole (30%)</span>
                      <span className="text-[#F1F2E9] font-bold">{analysisResult.boreholeScore}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden shadow-inner">
                      <div className="bg-[#71825B] h-full rounded-full" style={{ width: `${analysisResult.boreholeScore}%` }} />
                    </div>

                    <div className="flex justify-between text-clay-muted text-[10px]">
                      <span>Satellite (20%)</span>
                      <span className="text-[#F1F2E9] font-bold">{analysisResult.satelliteScore}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden shadow-inner">
                      <div className="bg-[#4C5D38] h-full rounded-full" style={{ width: `${analysisResult.satelliteScore}%` }} />
                    </div>

                    <div className="flex justify-between text-clay-muted text-[10px]">
                      <span>Terrain (15%)</span>
                      <span className="text-[#F1F2E9] font-bold">{analysisResult.terrainScore}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden shadow-inner">
                      <div className="bg-[#39482B] h-full rounded-full" style={{ width: `${analysisResult.terrainScore}%` }} />
                    </div>
                  </div>

                  {/* AI Recommendation Module */}
                  <div className="clay-card p-3 rounded-xl border border-clay-border text-[11px] text-[#C0C6B2] leading-relaxed font-sans shadow-inner">
                    <div className="text-[9px] uppercase font-mono text-[#A4B18A] font-bold flex items-center gap-1 mb-0.5">
                      <Sparkles size={11} /> AI RECOMMENDATION
                    </div>
                    "{analysisResult.aiExplanation}"
                  </div>
                </div>

                <div className="pt-2 border-t border-clay-border flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-mono text-clay-muted italic">
                      * AI prospectivity predictions require geological validation.
                    </p>

                    <button
                      onClick={() =>
                        navigate(
                          `/manganese-map?lat=${selectedLocation.latitude}&lng=${selectedLocation.longitude}`
                        )
                      }
                      className="px-3 py-1.5 btn-clay-primary text-[10px] flex items-center gap-1 shrink-0 cursor-pointer uppercase font-bold text-[#0B0E09]"
                    >
                      <span>DETAILED REPORT</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Contextual Action: Change Location / Analyze Another Location */}
                  <button
                    onClick={handleChangeLocation}
                    className="w-full py-2 btn-clay-secondary text-[11px] font-mono font-bold text-[#A4B18A] hover:text-[#F1F2E9] flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider border border-clay-border"
                    aria-label="Analyze another location"
                  >
                    <RotateCcw size={13} />
                    <span>ANALYZE ANOTHER LOCATION</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const LocationIntelligenceSection: React.FC = () => {
  return (
    <ErrorBoundary>
      <LocationIntelligenceContent />
    </ErrorBoundary>
  );
};


