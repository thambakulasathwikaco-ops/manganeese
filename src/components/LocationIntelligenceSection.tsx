import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Navigation,
  Sparkles,
  Compass,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { SelectedLocation } from '../types';
import { locationService } from '../services/locationService';
import { LocationMapSelector } from './LocationMapSelector';
import { ErrorBoundary } from './ErrorBoundary';
import { useAppStore } from '../store/useAppStore';
import { DataSourceProvenanceModal } from './DataSourceProvenanceModal';

const LocationIntelligenceContent: React.FC = () => {
  const {
    selectedLocation,
    setSelectedLocation,
    analysisRadiusKm,
    analyzeLocation,
    isAnalyzingLocation,
    locationAnalysisStage,
    activeLocationReport
  } = useAppStore();

  const [searchInput, setSearchInput] = useState<string>(selectedLocation?.name || '');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSourcesModal, setShowSourcesModal] = useState<boolean>(false);

  // Handle Search Input
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
        source: 'search',
        radiusKm: analysisRadiusKm,
        timestamp: new Date().toISOString()
      };
      setSelectedLocation(newLoc);
      await analyzeLocation(res.latitude, res.longitude, analysisRadiusKm, res.formattedName);
    } catch (err: any) {
      setErrorMessage(err.message || 'Location could not be found. Try coordinates or a valid place name.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle GPS
  const handleUseCurrentLocation = async () => {
    setErrorMessage(null);
    setIsGpsLoading(true);

    try {
      const gps = await locationService.getCurrentGpsLocation();
      const info = await locationService.reverseGeocodeDetails(gps.latitude, gps.longitude);

      const newLoc: SelectedLocation = {
        latitude: gps.latitude,
        longitude: gps.longitude,
        name: info.formattedName,
        adminRegion: info.adminRegion,
        country: info.country,
        accuracy: gps.accuracy,
        source: 'gps',
        radiusKm: analysisRadiusKm,
        timestamp: new Date().toISOString()
      };
      setSelectedLocation(newLoc);
      setSearchInput(`${gps.latitude}, ${gps.longitude}`);
      await analyzeLocation(gps.latitude, gps.longitude, analysisRadiusKm, info.formattedName);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to access current location.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Handle Map Coordinate Click
  const handleMapCoordinateSelect = async (lat: number, lon: number) => {
    setErrorMessage(null);
    const formattedCoords = `${lat}° N, ${lon}° E`;

    try {
      const info = await locationService.reverseGeocodeDetails(lat, lon);
      const name = info.formattedName || formattedCoords;
      const newLoc: SelectedLocation = {
        latitude: lat,
        longitude: lon,
        name,
        adminRegion: info.adminRegion,
        country: info.country,
        source: 'map',
        radiusKm: analysisRadiusKm,
        timestamp: new Date().toISOString()
      };
      setSelectedLocation(newLoc);
      setSearchInput(`${lat}, ${lon}`);
      await analyzeLocation(lat, lon, analysisRadiusKm, name);
    } catch {
      const newLoc: SelectedLocation = {
        latitude: lat,
        longitude: lon,
        name: formattedCoords,
        source: 'map',
        radiusKm: analysisRadiusKm,
        timestamp: new Date().toISOString()
      };
      setSelectedLocation(newLoc);
      setSearchInput(`${lat}, ${lon}`);
      await analyzeLocation(lat, lon, analysisRadiusKm, formattedCoords);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111811] border border-[#A9B58D]/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9B58D] font-bold bg-[#A9B58D]/10 px-2 py-0.5 rounded border border-[#A9B58D]/20">
                REAL LOCATION ENGINE
              </span>
              <span className="text-[10px] font-mono text-[#9EA493]">Zero Predefined Data Fabrication</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#F1F1E9] tracking-tight">
              Location Mining Intelligence
            </h1>
            <p className="text-xs font-mono text-[#9EA493] mt-1 max-w-2xl">
              Query real Open-Meteo weather, OpenStreetMap Overpass GIS, Macrostrat geological surveys, and Sentinel remote sensing for any coordinate.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSourcesModal(true)}
              disabled={!activeLocationReport}
              className="bg-[#182016] hover:bg-[#1f2b1d] border border-[#A9B58D]/30 text-[#A9B58D] hover:text-[#F1F1E9] font-mono text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-inner disabled:opacity-40"
            >
              <Database size={14} />
              <span>DATA SOURCES</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Map Selector & Input, Right Report View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Map & Location Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#111811] border border-[#A9B58D]/25 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#F1F1E9] uppercase flex items-center gap-1.5">
                <Compass size={14} className="text-[#A9B58D]" />
                SELECT LOCATION ON MAP
              </span>
              <span className="text-[10px] font-mono text-[#9EA493]">{analysisRadiusKm} km Radius</span>
            </div>

            {/* MapLibre Canvas */}
            <div className="h-72 rounded-xl overflow-hidden border border-[#A9B58D]/20">
              <LocationMapSelector
                latitude={selectedLocation.latitude}
                longitude={selectedLocation.longitude}
                radiusKm={analysisRadiusKm}
                onSelectCoordinates={handleMapCoordinateSelect}
              />
            </div>

            {/* Search Input & GPS */}
            <form onSubmit={handleSearch} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter place name or coordinates (e.g. 21.5333, 79.7167)"
                  className="w-full bg-[#182016] border border-[#A9B58D]/30 rounded-xl pl-9 pr-9 py-2.5 text-xs text-[#F1F1E9] placeholder-[#9EA493]/60 focus:outline-none focus:border-[#A9B58D]"
                />
                <Search size={14} className="absolute left-3 top-3 text-[#9EA493]" />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isGpsLoading}
                  className="absolute right-2 top-2 p-1.5 text-[#9EA493] hover:text-[#F1F1E9] rounded-lg"
                  title="Use Current GPS Location"
                >
                  <Navigation size={13} className={isGpsLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => analyzeLocation(selectedLocation.latitude, selectedLocation.longitude, analysisRadiusKm, selectedLocation.name)}
                disabled={isAnalyzingLocation || isSearching}
                className="w-full bg-gradient-to-r from-[#A9B58D] to-[#D4E09B] text-[#111811] hover:brightness-110 font-mono font-bold text-xs py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles size={14} className={isAnalyzingLocation || isSearching ? 'animate-spin' : ''} />
                <span>{isAnalyzingLocation || isSearching ? locationAnalysisStage || 'ANALYZING LOCATION...' : 'RUN LOCATION ANALYSIS'}</span>
              </button>
            </form>

            {errorMessage && (
              <p className="text-xs font-mono text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-500/20">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Dynamic Report View */}
        <div className="lg:col-span-7 space-y-4">
          {activeLocationReport ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111811] border border-[#A9B58D]/30 rounded-2xl p-6 shadow-2xl space-y-6"
            >
              {/* Report Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#A9B58D]/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-[#A9B58D]/15 text-[#A9B58D] px-2 py-0.5 rounded border border-[#A9B58D]/30 font-bold">
                      LOCATION INTELLIGENCE REPORT
                    </span>
                    <span className="text-[10px] font-mono text-[#D4E09B]">
                      Confidence: {activeLocationReport.overallConfidence}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F1F1E9] mt-1">{activeLocationReport.location.name}</h2>
                </div>

                <div className="text-right font-mono text-xs text-[#9EA493]">
                  <div>LAT: {activeLocationReport.location.latitude.toFixed(4)}°</div>
                  <div>LON: {activeLocationReport.location.longitude.toFixed(4)}°</div>
                </div>
              </div>

              {/* Observed Facts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#182016] border border-[#A9B58D]/20 p-3 rounded-xl">
                  <div className="text-[9px] font-mono text-[#9EA493] uppercase">Overall Suitability</div>
                  <div className="text-xl font-bold font-mono text-[#F1F1E9] mt-1">
                    {activeLocationReport.overallSuitabilityScore}/100
                  </div>
                  <span className="text-[9px] font-mono text-[#A9B58D]">Multi-Factor Score</span>
                </div>

                <div className="bg-[#182016] border border-[#A9B58D]/20 p-3 rounded-xl">
                  <div className="text-[9px] font-mono text-[#9EA493] uppercase">Elevation (DEM)</div>
                  <div className="text-xl font-bold font-mono text-[#F1F1E9] mt-1">
                    {activeLocationReport.elevationMeters ? `${activeLocationReport.elevationMeters}m` : 'Unmapped'}
                  </div>
                  <span className="text-[9px] font-mono text-[#9EA493]">Open-Elevation DEM</span>
                </div>

                <div className="bg-[#182016] border border-[#A9B58D]/20 p-3 rounded-xl">
                  <div className="text-[9px] font-mono text-[#9EA493] uppercase">Live Weather</div>
                  <div className="text-xl font-bold font-mono text-[#F1F1E9] mt-1">
                    {activeLocationReport.weather ? `${activeLocationReport.weather.current.temperatureC}°C` : 'N/A'}
                  </div>
                  <span className="text-[9px] font-mono text-[#A9B58D]">
                    {activeLocationReport.weather ? activeLocationReport.weather.current.conditionText : 'Telemetry Offline'}
                  </span>
                </div>

                <div className="bg-[#182016] border border-[#A9B58D]/20 p-3 rounded-xl">
                  <div className="text-[9px] font-mono text-[#9EA493] uppercase">Geology Survey</div>
                  <div className="text-sm font-bold font-mono text-[#F1F1E9] mt-1 truncate">
                    {activeLocationReport.geology.manganeseGradeStatus === 'CONFIRMED' ? 'Confirmed Ore' : 'Unconfirmed'}
                  </div>
                  <span className="text-[9px] font-mono text-amber-400/90 truncate block">
                    {activeLocationReport.geology.manganeseGradeStatus}
                  </span>
                </div>
              </div>

              {/* AI Report Breakdown */}
              <div className="space-y-4 text-xs font-mono text-[#F1F1E9]">
                <div className="bg-[#182016] p-4 rounded-xl border border-[#A9B58D]/20 space-y-1.5">
                  <span className="text-[10px] text-[#A9B58D] font-bold uppercase tracking-wider block">1. SITE OVERVIEW</span>
                  <p className="leading-relaxed text-[#9EA493]">{activeLocationReport.aiReport.siteOverview}</p>
                </div>

                <div className="bg-[#182016] p-4 rounded-xl border border-[#A9B58D]/20 space-y-1.5">
                  <span className="text-[10px] text-[#A9B58D] font-bold uppercase tracking-wider block">2. CURRENT CONDITIONS</span>
                  <p className="leading-relaxed text-[#9EA493]">{activeLocationReport.aiReport.currentConditions}</p>
                </div>

                <div className="bg-[#182016] p-4 rounded-xl border border-[#A9B58D]/20 space-y-1.5">
                  <span className="text-[10px] text-[#A9B58D] font-bold uppercase tracking-wider block">3. GEOLOGICAL EVIDENCE</span>
                  <p className="leading-relaxed text-[#9EA493]">{activeLocationReport.aiReport.geologicalEvidence}</p>
                </div>

                <div className="bg-[#182016] p-4 rounded-xl border border-[#A9B58D]/20 space-y-1.5">
                  <span className="text-[10px] text-[#A9B58D] font-bold uppercase tracking-wider block">4. REMOTE-SENSING INDICATORS</span>
                  <p className="leading-relaxed text-[#9EA493]">{activeLocationReport.aiReport.remoteSensingIndicators}</p>
                </div>

                <div className="bg-[#182016] p-4 rounded-xl border border-[#A9B58D]/20 space-y-1.5">
                  <span className="text-[10px] text-[#A9B58D] font-bold uppercase tracking-wider block">5. INFRASTRUCTURE & ACCESS</span>
                  <p className="leading-relaxed text-[#9EA493]">{activeLocationReport.aiReport.infrastructureAndAccess}</p>
                </div>

                <div className="bg-[#182016] p-4 rounded-xl border border-[#A9B58D]/20 space-y-1.5">
                  <span className="text-[10px] text-[#A9B58D] font-bold uppercase tracking-wider block">6. PRODUCTION DATA</span>
                  <p className="leading-relaxed text-[#9EA493]">{activeLocationReport.productionHeadline}: {activeLocationReport.productionDetails}</p>
                </div>

                {/* Data Gaps & Recommended Next Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1.5 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      DATA GAPS
                    </span>
                    <ul className="space-y-1 text-[11px] text-amber-200/80 list-disc list-inside">
                      {activeLocationReport.aiReport.dataGaps.map((gap, i) => (
                        <li key={i}>{gap}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#182016] border border-[#A9B58D]/30 p-3.5 rounded-xl">
                    <span className="text-[10px] text-[#A9B58D] font-bold uppercase block mb-1.5 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      RECOMMENDED NEXT DATA COLLECTION
                    </span>
                    <ul className="space-y-1 text-[11px] text-[#9EA493] list-disc list-inside">
                      {activeLocationReport.aiReport.recommendedNextSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Provenance Footer */}
              <div className="pt-4 border-t border-[#A9B58D]/20 flex items-center justify-between">
                <button
                  onClick={() => setShowSourcesModal(true)}
                  className="text-xs font-mono text-[#A9B58D] hover:underline flex items-center gap-1.5 font-bold"
                >
                  <ShieldCheck size={14} />
                  View All {activeLocationReport.dataSources.length} Verified Data Sources & Provenance
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#111811] border border-[#A9B58D]/20 rounded-2xl p-12 text-center text-xs font-mono text-[#9EA493] space-y-3">
              <Sparkles size={32} className="mx-auto text-[#A9B58D] animate-pulse" />
              <h3 className="text-base font-bold text-[#F1F1E9]">No Location Intelligence Loaded</h3>
              <p className="max-w-md mx-auto">
                Select coordinates on the map or enter a place name and click "Run Location Analysis" to fetch live weather, Overpass GIS, Macrostrat geology, and Sentinel indicators.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Provenance Modal */}
      {activeLocationReport && (
        <DataSourceProvenanceModal
          isOpen={showSourcesModal}
          onClose={() => setShowSourcesModal(false)}
          sources={activeLocationReport.dataSources}
          locationName={activeLocationReport.location.name}
        />
      )}
    </div>
  );
};

export const LocationIntelligenceSection: React.FC = () => {
  return (
    <ErrorBoundary>
      <LocationIntelligenceContent />
    </ErrorBoundary>
  );
};
