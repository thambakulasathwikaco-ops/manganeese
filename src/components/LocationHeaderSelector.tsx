import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Navigation,
  Sparkles,
  CheckCircle2,
  Clock,
  Globe,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { locationService } from '../services/locationService';
import type { SelectedLocation, AnalysisRadiusKm } from '../types';

export const LocationHeaderSelector: React.FC = () => {
  const {
    selectedLocation,
    setSelectedLocation,
    analysisRadiusKm,
    setAnalysisRadiusKm,
    analyzeLocation,
    isAnalyzingLocation,
    locationAnalysisStage,
    locationAnalysisProgress,
    activeLocationReport
  } = useAppStore();

  const [searchInput, setSearchInput] = useState<string>(selectedLocation.name || '');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRadiusDropdown, setShowRadiusDropdown] = useState<boolean>(false);

  const radiusOptions: AnalysisRadiusKm[] = [1, 5, 10, 25, 50];

  // Search by place name or coordinates
  const handleSearchSubmit = async (e?: React.FormEvent) => {
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
      // Trigger full location analysis
      await analyzeLocation(res.latitude, res.longitude, analysisRadiusKm, res.formattedName);
    } catch (err: any) {
      setErrorMessage(err.message || 'Location could not be found. Enter valid place name or coordinates.');
    } finally {
      setIsSearching(false);
    }
  };

  // Browser GPS
  const handleGpsLocation = async () => {
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
      setErrorMessage(err.message || 'Unable to access GPS location.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleSelectRadius = (r: AnalysisRadiusKm) => {
    setAnalysisRadiusKm(r);
    setShowRadiusDropdown(false);
    if (selectedLocation) {
      analyzeLocation(selectedLocation.latitude, selectedLocation.longitude, r, selectedLocation.name);
    }
  };

  return (
    <div className="w-full bg-[#111811]/90 backdrop-blur-md border border-[#A9B58D]/20 rounded-2xl p-4 lg:p-5 shadow-2xl relative overflow-hidden mb-6">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#A9B58D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Loading Bar Overlay */}
      {isAnalyzingLocation && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#182016]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#A9B58D] via-[#D4E09B] to-[#A9B58D]"
            initial={{ width: '0%' }}
            animate={{ width: `${locationAnalysisProgress}%` }}
            transition={{ ease: 'easeInOut', duration: 0.3 }}
          />
        </div>
      )}

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Left Section: Active Location Badge & Information */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="p-3 bg-[#A9B58D]/15 border border-[#A9B58D]/30 rounded-xl text-[#A9B58D] shrink-0 mt-0.5">
            <MapPin size={22} className={isAnalyzingLocation ? 'animate-bounce' : ''} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9B58D] font-bold bg-[#A9B58D]/10 px-2 py-0.5 rounded border border-[#A9B58D]/20">
                ACTIVE LOCATION INTELLIGENCE TARGET
              </span>
              {activeLocationReport && (
                <span className="text-[10px] font-mono text-[#D4E09B] bg-[#D4E09B]/10 px-2 py-0.5 rounded border border-[#D4E09B]/30 flex items-center gap-1">
                  <Clock size={10} />
                  {activeLocationReport.freshnessTag}
                </span>
              )}
              {selectedLocation.country && (
                <span className="text-[10px] font-mono text-[#9EA493] flex items-center gap-1">
                  <Globe size={10} />
                  {selectedLocation.country}
                </span>
              )}
            </div>

            <h2 className="text-lg lg:text-xl font-bold text-[#F1F1E9] truncate tracking-tight">
              {selectedLocation.name}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs font-mono text-[#9EA493]">
              <span>
                <strong className="text-[#F1F1E9]">LAT:</strong> {selectedLocation.latitude.toFixed(4)}° N
              </span>
              <span>
                <strong className="text-[#F1F1E9]">LON:</strong> {selectedLocation.longitude.toFixed(4)}° E
              </span>
              {selectedLocation.elevationMeters !== undefined && selectedLocation.elevationMeters !== null && (
                <span className="text-[#A9B58D]">
                  <strong className="text-[#F1F1E9]">ELEV:</strong> {selectedLocation.elevationMeters}m MSL
                </span>
              )}
              <span>
                <strong className="text-[#F1F1E9]">RADIUS:</strong> {analysisRadiusKm} km
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Location Search & Radius Selector Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72 lg:w-80">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search place, mine, or '18.0129, 79.8500'..."
              className="w-full bg-[#182016] border border-[#A9B58D]/30 rounded-xl pl-9 pr-20 py-2.5 text-xs text-[#F1F1E9] placeholder-[#9EA493]/60 focus:outline-none focus:border-[#A9B58D] transition-colors"
            />
            <Search size={14} className="absolute left-3 top-3.5 text-[#9EA493]" />

            <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={handleGpsLocation}
                disabled={isGpsLoading || isAnalyzingLocation}
                title="Use Current GPS Location"
                className="p-1.5 text-[#9EA493] hover:text-[#F1F1E9] hover:bg-[#A9B58D]/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <Navigation size={13} className={isGpsLoading ? 'animate-spin' : ''} />
              </button>

              <button
                type="submit"
                disabled={isSearching || isAnalyzingLocation}
                className="bg-[#A9B58D] text-[#111811] hover:bg-[#D4E09B] text-[11px] font-bold font-mono px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                {isSearching ? <Sparkles size={12} className="animate-spin" /> : 'GO'}
              </button>
            </div>
          </form>

          {/* Radius Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
              className="w-full sm:w-auto bg-[#182016] hover:bg-[#1f2b1d] border border-[#A9B58D]/30 rounded-xl px-3 py-2.5 text-xs font-mono text-[#F1F1E9] flex items-center justify-between gap-2 transition-colors"
            >
              <SlidersHorizontal size={13} className="text-[#A9B58D]" />
              <span>{analysisRadiusKm} km radius</span>
              <ChevronDown size={13} className="text-[#9EA493]" />
            </button>

            <AnimatePresence>
              {showRadiusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-1.5 w-36 bg-[#182016] border border-[#A9B58D]/30 rounded-xl shadow-2xl p-1 z-50"
                >
                  <div className="text-[9px] font-mono uppercase text-[#9EA493] px-2 py-1">
                    Select Radius
                  </div>
                  {radiusOptions.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleSelectRadius(r)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                        analysisRadiusKm === r
                          ? 'bg-[#A9B58D]/20 text-[#A9B58D] font-bold'
                          : 'text-[#9EA493] hover:text-[#F1F1E9] hover:bg-[#A9B58D]/10'
                      }`}
                    >
                      <span>{r} km</span>
                      {analysisRadiusKm === r && <CheckCircle2 size={12} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Primary Action Button: Analyze Location */}
          <button
            type="button"
            onClick={() => analyzeLocation(selectedLocation.latitude, selectedLocation.longitude, analysisRadiusKm, selectedLocation.name)}
            disabled={isAnalyzingLocation}
            className="bg-gradient-to-r from-[#A9B58D] to-[#D4E09B] text-[#111811] hover:brightness-110 font-mono font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Sparkles size={14} className={isAnalyzingLocation ? 'animate-spin' : ''} />
            <span>{isAnalyzingLocation ? 'ANALYZING...' : 'ANALYZE LOCATION'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Stage Indicator Bar */}
      {isAnalyzingLocation && (
        <div className="mt-3 pt-3 border-t border-[#A9B58D]/15 flex items-center justify-between text-xs font-mono text-[#A9B58D]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A9B58D] animate-ping" />
            {locationAnalysisStage}
          </span>
          <span>{locationAnalysisProgress}%</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-3 p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs font-mono">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
