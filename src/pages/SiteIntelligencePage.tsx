import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  BarChart3,
  Activity,
  X,
  Compass,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import type { LocationAnalysisRecord, LocationAnalysisStatus } from '../types';

type TrendMetricKey =
  | 'suitabilityScore'
  | 'productionPotential'
  | 'resourcePotential'
  | 'accessibilityScore'
  | 'infrastructureScore'
  | 'operationalRisk';

export const SiteIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { siteIntelligenceRecords, setSelectedZoneId } = useAppStore();

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSuitabilityRange, setSelectedSuitabilityRange] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'potential' | 'name'>('score');

  // Selected Location for Details Modal & Trend Graph
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(
    siteIntelligenceRecords.length > 0 ? siteIntelligenceRecords[0].id : null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [activeTrendMetric, setActiveTrendMetric] = useState<TrendMetricKey>('suitabilityScore');

  // Handle URL query parameter ?locationId=ZONE-A17
  useEffect(() => {
    const qLoc = searchParams.get('locationId');
    if (qLoc) {
      const found = siteIntelligenceRecords.find(
        (r) => r.locationId === qLoc || r.id === qLoc || r.locationName.toLowerCase().includes(qLoc.toLowerCase())
      );
      if (found) {
        setSelectedRecordId(found.id);
        setIsDetailModalOpen(true);
      }
    }
  }, [searchParams, siteIntelligenceRecords]);

  // Comparative selection for multi-location comparison
  const [comparedRecordIds, setComparedRecordIds] = useState<string[]>(
    siteIntelligenceRecords.slice(0, 4).map((r) => r.id)
  );

  // Derived unique regions
  const uniqueRegions = useMemo(() => {
    const set = new Set<string>();
    siteIntelligenceRecords.forEach((r) => {
      if (r.region) set.add(r.region);
    });
    return Array.from(set);
  }, [siteIntelligenceRecords]);

  // Filtering logic
  const filteredRecords = useMemo(() => {
    return siteIntelligenceRecords.filter((record) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        record.locationName.toLowerCase().includes(query) ||
        record.locationId.toLowerCase().includes(query) ||
        record.region.toLowerCase().includes(query) ||
        `${record.latitude}, ${record.longitude}`.includes(query);

      // Region Filter
      const matchesRegion = selectedRegion === 'ALL' || record.region === selectedRegion;

      // Status Filter
      const matchesStatus = selectedStatus === 'ALL' || record.status === selectedStatus;

      // Suitability Filter
      let matchesSuitability = true;
      if (selectedSuitabilityRange === 'HIGH') {
        matchesSuitability = record.suitabilityScore >= 80;
      } else if (selectedSuitabilityRange === 'MEDIUM') {
        matchesSuitability = record.suitabilityScore >= 50 && record.suitabilityScore < 80;
      } else if (selectedSuitabilityRange === 'LOW') {
        matchesSuitability = record.suitabilityScore < 50;
      }

      return matchesSearch && matchesRegion && matchesStatus && matchesSuitability;
    });
  }, [siteIntelligenceRecords, searchQuery, selectedRegion, selectedStatus, selectedSuitabilityRange]);

  // Sorted Records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      if (sortBy === 'score') return b.overallScore - a.overallScore;
      if (sortBy === 'potential') return b.productionPotential - a.productionPotential;
      if (sortBy === 'date') return new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime();
      if (sortBy === 'name') return a.locationName.localeCompare(b.locationName);
      return 0;
    });
  }, [filteredRecords, sortBy]);

  // Overview Metrics Calculations
  const metrics = useMemo(() => {
    if (siteIntelligenceRecords.length === 0) {
      return {
        totalAnalyzed: 0,
        avgSiteScore: 0,
        highestPotentialRecord: null as LocationAnalysisRecord | null,
        avgProductionPotential: 0
      };
    }

    const totalAnalyzed = siteIntelligenceRecords.length;
    const avgSiteScore = Math.round(
      siteIntelligenceRecords.reduce((acc, curr) => acc + curr.overallScore, 0) / totalAnalyzed
    );
    const avgProductionPotential = Math.round(
      siteIntelligenceRecords.reduce((acc, curr) => acc + curr.productionPotential, 0) / totalAnalyzed
    );

    const highestPotentialRecord = [...siteIntelligenceRecords].sort((a, b) => b.overallScore - a.overallScore)[0];

    return {
      totalAnalyzed,
      avgSiteScore,
      highestPotentialRecord,
      avgProductionPotential
    };
  }, [siteIntelligenceRecords]);

  // Currently focused record for Detail Modal & Trend Graph
  const activeRecord = useMemo(() => {
    return siteIntelligenceRecords.find((r) => r.id === selectedRecordId) || sortedRecords[0] || null;
  }, [siteIntelligenceRecords, selectedRecordId, sortedRecords]);

  // Recharts metric data for active record historical graph
  const activeRecordTrendData = useMemo(() => {
    if (!activeRecord || !activeRecord.history || activeRecord.history.length === 0) return [];
    return activeRecord.history.map((h) => ({
      date: h.analyzedAt,
      value: h[activeTrendMetric],
      overall: h.overallScore,
      production: h.productionPotential
    }));
  }, [activeRecord, activeTrendMetric]);

  // Data for multi-location comparison chart
  const comparisonData = useMemo(() => {
    const selected = siteIntelligenceRecords.filter((r) => comparedRecordIds.includes(r.id));
    return selected.map((r) => ({
      name: r.locationName.length > 15 ? `${r.locationName.substring(0, 14)}...` : r.locationName,
      fullName: r.locationName,
      overallScore: r.overallScore,
      productionPotential: r.productionPotential,
      accessibilityScore: r.accessibilityScore,
      infrastructureScore: r.infrastructureScore,
      operationalRisk: r.operationalRisk
    }));
  }, [siteIntelligenceRecords, comparedRecordIds]);

  // Overall Site Intelligence summary distribution charts data
  const productionDistributionData = useMemo(() => {
    return siteIntelligenceRecords
      .slice(0, 8)
      .map((r) => ({
        name: r.locationName.split(' ')[0],
        fullName: r.locationName,
        production: r.productionPotential,
        suitability: r.suitabilityScore
      }))
      .sort((a, b) => b.production - a.production);
  }, [siteIntelligenceRecords]);

  const suitabilityCategoryData = useMemo(() => {
    const high = siteIntelligenceRecords.filter((r) => r.overallScore >= 80).length;
    const med = siteIntelligenceRecords.filter((r) => r.overallScore >= 50 && r.overallScore < 80).length;
    const low = siteIntelligenceRecords.filter((r) => r.overallScore < 50).length;
    return [
      { name: 'High Potential (80%+)', count: high, color: '#A4B878' },
      { name: 'Medium Potential (50-79%)', count: med, color: '#596A43' },
      { name: 'Low Potential (<50%)', count: low, color: '#39422F' }
    ].filter((item) => item.count > 0);
  }, [siteIntelligenceRecords]);

  // Navigation helper to Manganese Map
  const handleNavigateToMap = (record: LocationAnalysisRecord) => {
    setSelectedZoneId(record.locationId);
    navigate(`/manganese-map?lat=${record.latitude}&lng=${record.longitude}&zone=${record.locationId}`);
  };

  const getStatusColorClass = (status: LocationAnalysisStatus) => {
    switch (status) {
      case 'OPTIMIZED':
        return 'bg-[#A4B878] text-[#10140D] border-[#A4B878]/40';
      case 'ACTIVE':
        return 'bg-[#71825B] text-[#F1F2E9] border-[#71825B]/40';
      case 'UNDER_REVIEW':
        return 'bg-[#596A43] text-[#F1F2E9] border-[#596A43]/40';
      case 'FEASIBILITY':
        return 'bg-[#4C5D38] text-[#C0C6B2] border-[#4C5D38]/40';
      case 'PROSPECTING':
      default:
        return 'bg-[#39422F] text-[#C0C6B2] border-[#39422F]/40';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-clay-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#1D2517] border border-clay-border text-[#A4B18A] shadow-inner">
              <BrainCircuit size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">Analyzed Locations</h1>
                <span className="bg-[#0B0E09] border border-clay-border text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-inner uppercase tracking-wider">
                  CENTRAL MEMORY LAYER
                </span>
              </div>
              <p className="text-xs text-clay-muted font-mono mt-0.5">
                Historical location analysis, site performance & operational intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => navigate('/manganese-map#location-intelligence')}
            className="btn-clay-primary px-4 py-2.5 text-xs font-bold font-mono flex items-center gap-2 uppercase tracking-wider text-[#0B0E09] cursor-pointer"
          >
            <Sparkles size={14} />
            <span>ANALYZE NEW LOCATION</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Locations Analyzed */}
        <div className="clay-card p-5 border border-clay-border space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-clay-muted tracking-wider">
              LOCATIONS ANALYZED
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1D2517] border border-clay-border flex items-center justify-center text-[#A4B18A]">
              <MapPin size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#F1F2E9]">{metrics.totalAnalyzed}</div>
          <p className="text-[10px] font-mono text-clay-muted">Total evaluated mining blocks</p>
        </div>

        {/* Metric 2: Average Site Score */}
        <div className="clay-card p-5 border border-clay-border space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-clay-muted tracking-wider">
              AVERAGE SITE SCORE
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1D2517] border border-clay-border flex items-center justify-center text-[#A4B18A]">
              <Award size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#A4B878]">{metrics.avgSiteScore}%</div>
          <p className="text-[10px] font-mono text-clay-muted">Mean AI suitability score</p>
        </div>

        {/* Metric 3: Highest Potential Site */}
        <div className="clay-card p-5 border border-clay-border space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-clay-muted tracking-wider">
              HIGHEST POTENTIAL
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1D2517] border border-clay-border flex items-center justify-center text-[#A4B18A]">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-extrabold text-[#F1F2E9] truncate max-w-[170px]">
              {metrics.highestPotentialRecord ? metrics.highestPotentialRecord.locationName : 'N/A'}
            </div>
            <span className="text-xl font-black font-mono text-[#A4B878]">
              {metrics.highestPotentialRecord ? `${metrics.highestPotentialRecord.overallScore}%` : '-'}
            </span>
          </div>
          <p className="text-[10px] font-mono text-clay-muted truncate">
            {metrics.highestPotentialRecord ? `${metrics.highestPotentialRecord.region}` : 'No dataset'}
          </p>
        </div>

        {/* Metric 4: Average Production Potential */}
        <div className="clay-card p-5 border border-clay-border space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-clay-muted tracking-wider">
              AVG PRODUCTION POTENTIAL
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1D2517] border border-clay-border flex items-center justify-center text-[#A4B18A]">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[#F1F2E9]">{metrics.avgProductionPotential}%</div>
          <p className="text-[10px] font-mono text-clay-muted">Predicted yield across network</p>
        </div>
      </div>

      {/* 3. Search & Filter Controls */}
      <div className="clay-card p-4 sm:p-5 border border-clay-border space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A4B18A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location name, district, ID, or coordinates..."
              className="w-full pl-10 pr-4 py-2.5 input-clay text-xs font-sans placeholder-[#858E78]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-clay-muted hover:text-chrome-plat"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Region Filter */}
            <div className="flex items-center gap-1.5 clay-recessed px-3 py-1.5 rounded-xl border border-clay-border text-xs font-mono">
              <Filter size={13} className="text-[#A4B18A]" />
              <span className="text-clay-muted text-[10px] uppercase">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent text-[#F1F2E9] focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0D120C] text-[#F1F2E9]">All Regions</option>
                {uniqueRegions.map((r) => (
                  <option key={r} value={r} className="bg-[#0D120C] text-[#F1F2E9]">{r}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 clay-recessed px-3 py-1.5 rounded-xl border border-clay-border text-xs font-mono">
              <span className="text-clay-muted text-[10px] uppercase">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-[#F1F2E9] focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0D120C]">All Statuses</option>
                <option value="ACTIVE" className="bg-[#0D120C]">ACTIVE</option>
                <option value="OPTIMIZED" className="bg-[#0D120C]">OPTIMIZED</option>
                <option value="UNDER_REVIEW" className="bg-[#0D120C]">UNDER REVIEW</option>
                <option value="FEASIBILITY" className="bg-[#0D120C]">FEASIBILITY</option>
                <option value="PROSPECTING" className="bg-[#0D120C]">PROSPECTING</option>
              </select>
            </div>

            {/* Performance Range Filter */}
            <div className="flex items-center gap-1.5 clay-recessed px-3 py-1.5 rounded-xl border border-clay-border text-xs font-mono">
              <span className="text-clay-muted text-[10px] uppercase">Suitability:</span>
              <select
                value={selectedSuitabilityRange}
                onChange={(e) => setSelectedSuitabilityRange(e.target.value)}
                className="bg-transparent text-[#F1F2E9] focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0D120C]">All Scores</option>
                <option value="HIGH" className="bg-[#0D120C]">High (80%+)</option>
                <option value="MEDIUM" className="bg-[#0D120C]">Medium (50-79%)</option>
                <option value="LOW" className="bg-[#0D120C]">Low (&lt;50%)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 clay-recessed px-3 py-1.5 rounded-xl border border-clay-border text-xs font-mono">
              <ArrowUpDown size={13} className="text-[#A4B18A]" />
              <span className="text-clay-muted text-[10px] uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#F1F2E9] focus:outline-none cursor-pointer"
              >
                <option value="score" className="bg-[#0D120C]">Overall Score</option>
                <option value="potential" className="bg-[#0D120C]">Production Potential</option>
                <option value="date" className="bg-[#0D120C]">Latest Analysis</option>
                <option value="name" className="bg-[#0D120C]">Location Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filters Clearer */}
        <div className="flex items-center justify-between text-xs font-mono text-clay-muted pt-2 border-t border-clay-border">
          <span>Showing <strong className="text-[#F1F2E9]">{filteredRecords.length}</strong> of <strong className="text-[#F1F2E9]">{siteIntelligenceRecords.length}</strong> analyzed locations</span>
          {(searchQuery || selectedRegion !== 'ALL' || selectedStatus !== 'ALL' || selectedSuitabilityRange !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('ALL');
                setSelectedStatus('ALL');
                setSelectedSuitabilityRange('ALL');
              }}
              className="text-[#A4B18A] hover:underline font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Section Header & Analyzed Locations Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div>
          <h2 className="text-lg font-extrabold text-[#F1F2E9] tracking-tight uppercase font-mono">
            ANALYZED LOCATIONS ({filteredRecords.length})
          </h2>
          <p className="text-xs text-clay-muted font-mono">
            Historical site analysis records
          </p>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="clay-card p-12 text-center flex flex-col items-center justify-center space-y-4 border border-clay-border my-6">
          <div className="w-16 h-16 rounded-3xl bg-[#1D2517] border border-clay-border flex items-center justify-center text-[#A4B18A] shadow-inner">
            <Compass size={32} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#F1F2E9]">No locations analyzed yet</h3>
            <p className="text-xs text-clay-muted max-w-md mt-1 font-sans">
              {siteIntelligenceRecords.length === 0
                ? 'Analyze a location to create your first site intelligence record.'
                : 'No analyzed locations match your current filter parameters.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/manganese-map#location-intelligence')}
            className="btn-clay-primary px-5 py-3 text-xs font-bold font-mono flex items-center gap-2 uppercase tracking-wider text-[#0B0E09] cursor-pointer mt-2"
          >
            <Sparkles size={14} />
            <span>ANALYZE NEW LOCATION</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRecords.map((record) => {
            const isSelected = activeRecord?.id === record.id;
            return (
              <motion.div
                key={record.id}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRecordId(record.id)}
                className={`clay-card p-6 flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200 border ${
                  isSelected ? 'border-[#A4B18A] shadow-clay-raised' : 'border-clay-border hover:border-clay-muted'
                }`}
              >
                <div>
                  {/* Card Top Row: Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-clay-muted uppercase">
                        {record.locationId} • {record.region}
                      </span>
                      <h3 className="text-base font-extrabold text-[#F1F2E9] mt-0.5 line-clamp-1">
                        {record.locationName}
                      </h3>
                      <div className="text-[11px] font-mono text-clay-muted">
                        {record.latitude}° N, {record.longitude}° E
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusColorClass(record.status)}`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Visual Scores Hierarchy */}
                  <div className="mt-5 clay-recessed p-4 space-y-2.5 border border-clay-border">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono text-clay-muted">Overall AI Score</span>
                      <span className="text-2xl font-black font-mono text-[#F1F2E9]">{record.overallScore}%</span>
                    </div>

                    <div className="space-y-2 text-xs font-mono pt-1">
                      <div>
                        <div className="flex justify-between text-[10px] text-clay-muted">
                          <span>Production Potential</span>
                          <span className="text-[#F1F2E9] font-bold">{record.productionPotential}%</span>
                        </div>
                        <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden mt-0.5">
                          <div className="bg-[#A4B878] h-full rounded-full" style={{ width: `${record.productionPotential}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-clay-muted">
                          <span>Accessibility</span>
                          <span className="text-[#F1F2E9] font-bold">{record.accessibilityScore}%</span>
                        </div>
                        <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden mt-0.5">
                          <div className="bg-[#71825B] h-full rounded-full" style={{ width: `${record.accessibilityScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-clay-muted">
                          <span>Operational Risk</span>
                          <span className="text-[#F1F2E9] font-bold">{record.operationalRisk}%</span>
                        </div>
                        <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden mt-0.5">
                          <div className="bg-[#596A43] h-full rounded-full" style={{ width: `${record.operationalRisk}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reserve & Grade Details */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="clay-recessed p-2.5">
                      <div className="text-[9px] text-clay-muted uppercase">Mn Grade</div>
                      <div className="font-bold text-[#A4B878] text-xs">{record.manganeseGradePct}% Mn</div>
                    </div>
                    <div className="clay-recessed p-2.5">
                      <div className="text-[9px] text-clay-muted uppercase">Reserve</div>
                      <div className="font-bold text-[#F1F2E9] text-xs">{(record.estimatedReserveTons / 1000).toFixed(0)}k MT</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-clay-border flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRecordId(record.id);
                      setIsDetailModalOpen(true);
                    }}
                    className="flex-1 py-2 btn-clay-secondary text-xs font-mono font-bold text-[#A4B18A] hover:text-[#F1F2E9] flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                  >
                    <Layers size={13} />
                    <span>VIEW ANALYSIS &rarr;</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToMap(record);
                    }}
                    className="p-2 btn-clay-primary text-[#0B0E09] rounded-xl shrink-0 cursor-pointer"
                    title="View on Map"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 5. Location Details Modal */}
      <AnimatePresence>
        {isDetailModalOpen && activeRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050704]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="clay-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-clay-border shadow-2xl space-y-6 text-left relative"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-clay-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#A4B18A] uppercase">
                      LOCATION ANALYSIS • {activeRecord.locationId}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${getStatusColorClass(activeRecord.status)}`}>
                      {activeRecord.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#F1F2E9] mt-1">Location Analysis — {activeRecord.locationName}</h2>
                  <p className="text-xs text-clay-muted font-mono">
                    Region: {activeRecord.region} • Coordinates: {activeRecord.latitude}° N, {activeRecord.longitude}° E • Evaluated: {activeRecord.analyzedAt.split('T')[0]}
                  </p>
                </div>

                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 rounded-xl bg-[#1D2517] border border-clay-border text-clay-muted hover:text-[#F1F2E9] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Location Overview Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="clay-recessed p-3">
                  <div className="text-[9px] text-clay-muted uppercase">Overall AI Score</div>
                  <div className="text-xl font-black text-[#F1F2E9]">{activeRecord.overallScore}%</div>
                </div>
                <div className="clay-recessed p-3">
                  <div className="text-[9px] text-clay-muted uppercase">Production Potential</div>
                  <div className="text-xl font-black text-[#A4B878]">{activeRecord.productionPotential}%</div>
                </div>
                <div className="clay-recessed p-3">
                  <div className="text-[9px] text-clay-muted uppercase">Manganese Grade</div>
                  <div className="text-xl font-black text-[#F1F2E9]">{activeRecord.manganeseGradePct}% Mn</div>
                </div>
                <div className="clay-recessed p-3">
                  <div className="text-[9px] text-clay-muted uppercase">Estimated Reserve</div>
                  <div className="text-xl font-black text-[#F1F2E9]">{activeRecord.estimatedReserveTons.toLocaleString()} MT</div>
                </div>
              </div>

              {/* 10 Site Intelligence Breakdown Factors */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#F1F2E9] tracking-tight uppercase font-mono flex items-center gap-2">
                  <Activity size={16} className="text-[#A4B18A]" />
                  SITE INTELLIGENCE FACTOR METRICS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Site Suitability */}
                  <div className="clay-recessed p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-clay-muted">Site Suitability</span>
                      <span className="text-[#F1F2E9] font-bold">{activeRecord.suitabilityScore}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#A4B878] h-full rounded-full" style={{ width: `${activeRecord.suitabilityScore}%` }} />
                    </div>
                  </div>

                  {/* Production Potential */}
                  <div className="clay-recessed p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-clay-muted">Production Potential</span>
                      <span className="text-[#F1F2E9] font-bold">{activeRecord.productionPotential}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#71825B] h-full rounded-full" style={{ width: `${activeRecord.productionPotential}%` }} />
                    </div>
                  </div>

                  {/* Resource Potential */}
                  <div className="clay-recessed p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-clay-muted">Resource Potential</span>
                      <span className="text-[#F1F2E9] font-bold">{activeRecord.resourcePotential}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#4C5D38] h-full rounded-full" style={{ width: `${activeRecord.resourcePotential}%` }} />
                    </div>
                  </div>

                  {/* Accessibility */}
                  <div className="clay-recessed p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-clay-muted">Accessibility</span>
                      <span className="text-[#F1F2E9] font-bold">{activeRecord.accessibilityScore}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#A4B878] h-full rounded-full" style={{ width: `${activeRecord.accessibilityScore}%` }} />
                    </div>
                  </div>

                  {/* Infrastructure */}
                  <div className="clay-recessed p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-clay-muted">Infrastructure</span>
                      <span className="text-[#F1F2E9] font-bold">{activeRecord.infrastructureScore}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#71825B] h-full rounded-full" style={{ width: `${activeRecord.infrastructureScore}%` }} />
                    </div>
                  </div>

                  {/* Transportation */}
                  <div className="clay-recessed p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-clay-muted">Transportation</span>
                      <span className="text-[#F1F2E9] font-bold">{activeRecord.transportScore}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#4C5D38] h-full rounded-full" style={{ width: `${activeRecord.transportScore}%` }} />
                    </div>
                  </div>

                  {/* Equipment Availability */}
                  <div className="clay-recessed p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-clay-muted">Equipment Availability</span>
                      <span className="text-[#F1F2E9] font-bold">{activeRecord.equipmentAvailability}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#A4B878] h-full rounded-full" style={{ width: `${activeRecord.equipmentAvailability}%` }} />
                    </div>
                  </div>

                  {/* Weather Risk */}
                  <div className="clay-recessed p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-clay-muted">Weather Risk Level</span>
                      <span className="text-[#F1F2E9] font-bold">{activeRecord.weatherRiskScore}% ({activeRecord.weatherRiskLevel})</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#596A43] h-full rounded-full" style={{ width: `${activeRecord.weatherRiskScore}%` }} />
                    </div>
                  </div>

                  {/* Operational Risk */}
                  <div className="clay-recessed p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-clay-muted">Operational Risk</span>
                      <span className="text-[#F1F2E9] font-bold">{activeRecord.operationalRisk}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#39422F] h-full rounded-full" style={{ width: `${activeRecord.operationalRisk}%` }} />
                    </div>
                  </div>

                  {/* Environmental Considerations */}
                  <div className="clay-recessed p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-clay-muted">Environmental Score</span>
                      <span className="text-[#F1F2E9] font-bold">{activeRecord.environmentalScore}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#71825B] h-full rounded-full" style={{ width: `${activeRecord.environmentalScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="clay-recessed p-4 text-xs font-sans text-[#C0C6B2] space-y-1 border border-clay-border">
                <div className="text-[10px] font-mono uppercase text-[#A4B18A] font-bold flex items-center gap-1">
                  <Sparkles size={12} /> AI STRATEGIC DIRECTIVE
                </div>
                <p className="leading-relaxed">{activeRecord.recommendation}</p>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-clay-border flex items-center justify-end gap-3 font-mono text-xs">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2.5 btn-clay-secondary text-clay-muted hover:text-[#F1F2E9] cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleNavigateToMap(activeRecord);
                  }}
                  className="px-5 py-2.5 btn-clay-primary text-[#0B0E09] font-bold uppercase flex items-center gap-2 cursor-pointer"
                >
                  <span>VIEW ON MAP</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Location Analysis Graph (Selected Location Trend over Time) */}
      {activeRecord && (
        <div className="clay-card p-6 sm:p-8 border border-clay-border space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-clay-border pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#A4B18A]">
                HISTORICAL LOCATION ANALYSIS TREND
              </span>
              <h2 className="text-lg font-extrabold text-[#F1F2E9] mt-0.5">
                {activeRecord.locationName} Performance Over Time
              </h2>
              <p className="text-xs text-clay-muted font-mono">
                Tracking historical analysis snapshots for {activeRecord.locationId} ({activeRecord.region})
              </p>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 clay-recessed p-1 rounded-xl border border-clay-border text-xs font-mono">
              <button
                onClick={() => setActiveTrendMetric('suitabilityScore')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTrendMetric === 'suitabilityScore' ? 'btn-clay-primary text-[#0B0E09] font-bold' : 'text-clay-muted hover:text-[#F1F2E9]'
                }`}
              >
                Suitability
              </button>
              <button
                onClick={() => setActiveTrendMetric('productionPotential')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTrendMetric === 'productionPotential' ? 'btn-clay-primary text-[#0B0E09] font-bold' : 'text-clay-muted hover:text-[#F1F2E9]'
                }`}
              >
                Production
              </button>
              <button
                onClick={() => setActiveTrendMetric('resourcePotential')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTrendMetric === 'resourcePotential' ? 'btn-clay-primary text-[#0B0E09] font-bold' : 'text-clay-muted hover:text-[#F1F2E9]'
                }`}
              >
                Resource
              </button>
              <button
                onClick={() => setActiveTrendMetric('accessibilityScore')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTrendMetric === 'accessibilityScore' ? 'btn-clay-primary text-[#0B0E09] font-bold' : 'text-clay-muted hover:text-[#F1F2E9]'
                }`}
              >
                Accessibility
              </button>
              <button
                onClick={() => setActiveTrendMetric('infrastructureScore')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTrendMetric === 'infrastructureScore' ? 'btn-clay-primary text-[#0B0E09] font-bold' : 'text-clay-muted hover:text-[#F1F2E9]'
                }`}
              >
                Infrastructure
              </button>
              <button
                onClick={() => setActiveTrendMetric('operationalRisk')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTrendMetric === 'operationalRisk' ? 'btn-clay-primary text-[#0B0E09] font-bold' : 'text-clay-muted hover:text-[#F1F2E9]'
                }`}
              >
                Operational Risk
              </button>
            </div>
          </div>

          {/* Line Chart */}
          <div className="w-full h-[320px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeRecordTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252E1D" vertical={false} />
                <XAxis dataKey="date" stroke="#858E78" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#858E78" fontSize={11} fontFamily="monospace" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D120C',
                    borderColor: '#252E1D',
                    borderRadius: '12px',
                    color: '#F1F2E9',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={activeTrendMetric.replace(/([A-Z])/g, ' $1')}
                  stroke="#A4B878"
                  strokeWidth={3}
                  dot={{ fill: '#A4B878', r: 5 }}
                  activeDot={{ r: 7, fill: '#F1F2E9' }}
                />
                <Line
                  type="monotone"
                  dataKey="overall"
                  name="Overall Score"
                  stroke="#596A43"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 7. Location Performance Comparison */}
      <div className="clay-card p-6 sm:p-8 border border-clay-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-clay-border pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#F1F2E9]">Location Performance Comparison</h2>
            <p className="text-xs text-clay-muted font-mono">
              Side-by-side metric comparison of selected analyzed sites
            </p>
          </div>

          <div className="text-xs font-mono text-clay-muted">
            Comparing <strong className="text-[#F1F2E9]">{comparedRecordIds.length}</strong> sites
          </div>
        </div>

        {/* Multi-Location Checkbox Selector */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {siteIntelligenceRecords.map((r) => {
            const isChecked = comparedRecordIds.includes(r.id);
            return (
              <button
                key={r.id}
                onClick={() => {
                  if (isChecked) {
                    if (comparedRecordIds.length > 1) {
                      setComparedRecordIds(comparedRecordIds.filter((id) => id !== r.id));
                    }
                  } else {
                    setComparedRecordIds([...comparedRecordIds, r.id]);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                  isChecked
                    ? 'bg-[#1D2517] text-[#F1F2E9] border-[#A4B878]'
                    : 'bg-[#0B0E09] text-clay-muted border-clay-border hover:border-clay-muted'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-[#A4B878]' : 'bg-[#39422F]'}`} />
                <span>{r.locationName}</span>
              </button>
            );
          })}
        </div>

        {/* Horizontal Bar Chart for Comparison */}
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252E1D" horizontal={false} />
              <XAxis type="number" stroke="#858E78" fontSize={11} fontFamily="monospace" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" stroke="#858E78" fontSize={11} fontFamily="monospace" width={110} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D120C',
                  borderColor: '#252E1D',
                  borderRadius: '12px',
                  color: '#F1F2E9',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              />
              <Bar dataKey="overallScore" name="Overall Score %" fill="#A4B878" radius={[0, 6, 6, 0]} />
              <Bar dataKey="productionPotential" name="Production Potential %" fill="#71825B" radius={[0, 6, 6, 0]} />
              <Bar dataKey="accessibilityScore" name="Accessibility %" fill="#596A43" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 8. Overall Site Intelligence (Network Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Production Potential by Location (Horizontal Bar Chart) */}
        <div className="lg:col-span-8 clay-card p-6 border border-clay-border space-y-4">
          <div className="flex items-center justify-between border-b border-clay-border pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#F1F2E9]">Production Potential by Location</h3>
              <p className="text-xs text-clay-muted font-mono">Top predicted manganese production targets</p>
            </div>
            <BarChart3 size={18} className="text-[#A4B18A]" />
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252E1D" vertical={false} />
                <XAxis dataKey="name" stroke="#858E78" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#858E78" fontSize={11} fontFamily="monospace" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D120C',
                    borderColor: '#252E1D',
                    borderRadius: '12px',
                    color: '#F1F2E9',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="production" name="Production Potential %" radius={[6, 6, 0, 0]}>
                  {productionDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.production >= 80 ? '#A4B878' : entry.production >= 50 ? '#596A43' : '#39422F'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Site Suitability Category Distribution */}
        <div className="lg:col-span-4 clay-card p-6 border border-clay-border space-y-4 flex flex-col justify-between">
          <div className="border-b border-clay-border pb-3">
            <h3 className="text-base font-extrabold text-[#F1F2E9]">Suitability Distribution</h3>
            <p className="text-xs text-clay-muted font-mono">Breakdown across network potential categories</p>
          </div>

          <div className="space-y-3 py-2">
            {suitabilityCategoryData.map((cat) => {
              const pct = Math.round((cat.count / siteIntelligenceRecords.length) * 100);
              return (
                <div key={cat.name} className="clay-recessed p-3.5 space-y-1 border border-clay-border">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#F1F2E9] font-bold">{cat.name}</span>
                    <span className="text-[#A4B18A] font-bold">{cat.count} sites ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#0B0E09] h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="clay-recessed p-3 text-[11px] text-[#C0C6B2] font-sans border border-clay-border">
            <span className="font-bold font-mono text-[#A4B18A] uppercase block mb-0.5">EXECUTIVE SUMMARY</span>
            {metrics.avgSiteScore >= 70
              ? 'Manganese belt intelligence indicates strong overall deposit suitability. Prioritize high-potential blocks for drilling.'
              : 'Moderate belt potential. Optimize operational parameters and infrastructure before capital expansion.'}
          </div>
        </div>
      </div>

      {/* 9. Analysis History Log Table */}
      <div className="clay-card p-6 sm:p-8 border border-clay-border space-y-5">
        <div className="flex items-center justify-between border-b border-clay-border pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#F1F2E9]">Analysis History Log</h2>
            <p className="text-xs text-clay-muted font-mono">
              Audit trail of stored site evaluation records
            </p>
          </div>

          <span className="text-xs font-mono text-clay-muted bg-[#0B0E09] px-3 py-1 rounded-xl border border-clay-border">
            {siteIntelligenceRecords.length} HISTORICAL RECORDS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-clay-border text-clay-muted uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-3">Location</th>
                <th className="pb-3 px-3">Region</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Overall Score</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Key Directive</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clay-border/50">
              {siteIntelligenceRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#171D12] transition">
                  <td className="py-3 px-3 font-bold text-[#F1F2E9]">
                    {rec.locationName}
                    <span className="block text-[10px] font-normal text-clay-muted">{rec.locationId}</span>
                  </td>
                  <td className="py-3 px-3 text-clay-muted">{rec.region}</td>
                  <td className="py-3 px-3 text-clay-muted">{rec.analyzedAt.split('T')[0]}</td>
                  <td className="py-3 px-3 font-black text-[#A4B878]">{rec.overallScore}%</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColorClass(rec.status)}`}>
                      {rec.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-clay-muted max-w-xs truncate font-sans text-[11px]">
                    {rec.recommendation}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleNavigateToMap(rec)}
                      className="px-2.5 py-1 btn-clay-primary text-[10px] font-bold text-[#0B0E09] rounded-lg cursor-pointer uppercase inline-flex items-center gap-1"
                    >
                      <span>MAP</span>
                      <ArrowRight size={10} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
