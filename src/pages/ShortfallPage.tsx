import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { riskService } from '../services/riskService';
import { dataService } from '../services/dataService';
import { RiskGauge } from '../components/RiskGauge';
import {
  Download,
  AlertOctagon,
  ChevronDown,
  MapPin,
  Sparkles,
  Compass,
  Check,
  ExternalLink,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts';
import { AnnouncementCard, PrimaryCard, Card } from '../components/ui/Card';
import type { LocationAnalysisRecord, LocationAnalysisStatus } from '../types';

import { LocationHeaderSelector } from '../components/LocationHeaderSelector';

export const ShortfallPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { siteIntelligenceRecords, setSelectedZoneId } = useAppStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Read locationId from URL search parameters, default to first available record if valid
  const queryLocId = searchParams.get('locationId');

  const selectedRecord = useMemo(() => {
    if (!siteIntelligenceRecords || siteIntelligenceRecords.length === 0) return null;

    if (queryLocId) {
      const matched = siteIntelligenceRecords.find(
        (r) => r.id === queryLocId || r.locationId === queryLocId
      );
      if (matched) return matched;
    }

    // Default to top analyzed location record if query is absent/invalid
    return siteIntelligenceRecords[0];
  }, [siteIntelligenceRecords, queryLocId]);

  // Sync selected location ID into URL search parameter
  const handleSelectLocation = (record: LocationAnalysisRecord) => {
    setSearchParams({ locationId: record.id });
    setIsDropdownOpen(false);
  };

  // Location-specific Risk & Shortfall calculations
  const locationRiskResult = useMemo(() => {
    if (!selectedRecord) return null;
    return riskService.calculateLocationRisk(selectedRecord);
  }, [selectedRecord]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return '#F1F2E9';
      case 'HIGH':
        return '#A4B18A';
      case 'MEDIUM':
        return '#71825B';
      default:
        return '#596A43';
    }
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

  const handleExportRiskReport = () => {
    if (!selectedRecord || !locationRiskResult) return;

    const reportData = locationRiskResult.contributions.map((c) => ({
      Location_Name: selectedRecord.locationName,
      Location_ID: selectedRecord.locationId,
      Region_District: selectedRecord.region,
      Coordinates: `${selectedRecord.latitude}° N, ${selectedRecord.longitude}° E`,
      AI_Score: `${selectedRecord.overallScore}%`,
      Monthly_Target_MT: locationRiskResult.target,
      Predicted_Output_MT: locationRiskResult.predictedProduction,
      Shortfall_Variance_MT: locationRiskResult.shortfall,
      Shortfall_Percentage: `${locationRiskResult.shortfallPct}%`,
      Overall_Risk_Level: locationRiskResult.riskLevel,
      Factor_Category: c.factor,
      Contribution_Percentage: `${c.contributionPct}%`,
      Impact_Description: c.impactDescription
    }));

    dataService.exportToCSV(
      `${selectedRecord.locationId}_shortfall_risk_report.csv`,
      reportData
    );
  };

  // State 1: No Analyzed Locations in Application Store
  if (!siteIntelligenceRecords || siteIntelligenceRecords.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between border-b border-clay-border pb-5">
          <div>
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">
              Shortfall & Operational Risk Analysis
            </h1>
            <p className="text-xs text-clay-muted font-mono mt-1">
              Location-Specific Bottleneck Decomposition & Factor Sensitivity Attribution
            </p>
          </div>
        </div>

        <div className="clay-card p-12 text-center flex flex-col items-center justify-center space-y-4 border border-clay-border my-6">
          <div className="w-16 h-16 rounded-3xl bg-[#1D2517] border border-clay-border flex items-center justify-center text-[#A4B18A] shadow-inner">
            <Compass size={32} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#F1F2E9]">No analyzed locations available</h3>
            <p className="text-xs text-clay-muted max-w-md mt-1 font-sans">
              Analyze a location first in the Analyzed Locations module to generate location-specific Shortfall & Risk Analysis.
            </p>
          </div>
          <button
            onClick={() => navigate('/analyzed-locations')}
            className="btn-clay-primary px-5 py-3 text-xs font-bold font-mono flex items-center gap-2 uppercase tracking-wider text-[#0B0E09] cursor-pointer mt-2"
          >
            <Sparkles size={14} />
            <span>GO TO ANALYZED LOCATIONS</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Central Location Selector Bar */}
      <LocationHeaderSelector />
      
      {/* 1. Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-clay-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">
              Shortfall & Operational Risk Analysis
            </h1>
            <span className="bg-[#0B0E09] border border-clay-border text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              LOCATION-SPECIFIC ENGINE
            </span>
          </div>
          <p className="text-xs text-clay-muted font-mono mt-1">
            Dynamic Bottleneck Decomposition & Factor Sensitivity Attribution
          </p>
        </div>

        <button
          onClick={handleExportRiskReport}
          disabled={!selectedRecord}
          className="btn-clay-primary text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 self-start sm:self-auto uppercase tracking-wider text-[#0B0E09] cursor-pointer disabled:opacity-50"
        >
          <Download size={15} className="text-[#0B0E09]" />
          <span>EXPORT RISK REPORT (CSV)</span>
        </button>
      </div>

      {/* 2. Location Selector Area */}
      <div className="clay-card p-5 border border-clay-border space-y-3 relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#A4B18A] tracking-wider">
              ANALYSIS LOCATION
            </span>
            <p className="text-xs text-clay-muted font-mono">
              Select from locations previously analyzed by the AI
            </p>
          </div>

          <div className="text-xs font-mono text-clay-muted">
            <strong className="text-[#F1F2E9]">{siteIntelligenceRecords.length}</strong> Analyzed Locations Available
          </div>
        </div>

        {/* Custom Location Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full clay-recessed p-3.5 rounded-xl border border-clay-border flex items-center justify-between text-left transition hover:border-[#A4B18A] cursor-pointer"
          >
            {selectedRecord ? (
              <div className="flex items-center justify-between w-full pr-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1D2517] border border-clay-border flex items-center justify-center text-[#A4B18A]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#F1F2E9]">
                      {selectedRecord.locationName}
                    </div>
                    <div className="text-xs font-mono text-clay-muted">
                      {selectedRecord.region} • {selectedRecord.locationId} • {selectedRecord.latitude}° N, {selectedRecord.longitude}° E
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="bg-[#0B0E09] px-2.5 py-1 rounded-lg border border-clay-border text-[#A4B878] font-bold">
                    AI Score: {selectedRecord.overallScore}%
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColorClass(selectedRecord.status)}`}>
                    {selectedRecord.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs font-mono text-clay-muted">
                Select an analyzed location ▼
              </span>
            )}
            <ChevronDown size={18} className={`text-clay-muted transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#A4B18A]' : ''}`} />
          </button>

          {/* Dropdown Options Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#0D120C] border border-clay-border rounded-xl shadow-2xl overflow-hidden z-30 max-h-80 overflow-y-auto divide-y divide-clay-border">
              {siteIntelligenceRecords.map((record) => {
                const isSelected = selectedRecord?.id === record.id;
                return (
                  <div
                    key={record.id}
                    onClick={() => handleSelectLocation(record)}
                    className={`p-3.5 flex items-center justify-between hover:bg-[#171D12] cursor-pointer transition ${
                      isSelected ? 'bg-[#1D2517]/80' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <Check size={16} className="text-[#A4B878] shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-clay-border shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-[#F1F2E9]">
                          {record.locationName}
                        </div>
                        <div className="text-[11px] font-mono text-clay-muted">
                          {record.region} • {record.locationId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-[#A4B878] font-bold">
                        AI Score: {record.overallScore}%
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColorClass(record.status)}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Location Selected State / Context Header Banner */}
      {selectedRecord && locationRiskResult && (
        <>
          {/* Selected Location Context Card */}
          <div className="clay-card p-4 sm:p-5 border border-clay-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#11170E]/90">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#1D2517] border border-clay-border text-[#A4B18A]">
                <Layers size={20} />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-[#A4B18A] tracking-widest block">
                  ANALYSIS SOURCE: ANALYZED LOCATION RECORD
                </span>
                <h2 className="text-base font-extrabold text-[#F1F2E9] mt-0.5">
                  {selectedRecord.locationName}
                </h2>
                <p className="text-xs text-clay-muted font-mono">
                  {selectedRecord.region} • {selectedRecord.locationId} • Coordinates: {selectedRecord.latitude}° N, {selectedRecord.longitude}° E
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs self-start sm:self-auto">
              <div className="clay-recessed px-3 py-1.5 rounded-xl border border-clay-border">
                <span className="text-clay-muted text-[10px] uppercase block">AI Suitability Score</span>
                <span className="text-sm font-black text-[#A4B878]">{selectedRecord.overallScore}%</span>
              </div>
              <div className="clay-recessed px-3 py-1.5 rounded-xl border border-clay-border">
                <span className="text-clay-muted text-[10px] uppercase block">Last Evaluated</span>
                <span className="text-sm font-bold text-[#F1F2E9]">{selectedRecord.analyzedAt.split('T')[0]}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedZoneId(selectedRecord.locationId);
                  navigate(`/manganese-map?lat=${selectedRecord.latitude}&lng=${selectedRecord.longitude}&zone=${selectedRecord.locationId}`);
                }}
                className="p-2.5 btn-clay-secondary rounded-xl text-clay-muted hover:text-[#F1F2E9]"
                title="View on Map"
              >
                <ExternalLink size={15} />
              </button>
            </div>
          </div>

          {/* Location-Specific Diagnostic Narrative Alert Banner */}
          <AnnouncementCard
            title="Shortfall Risk Diagnostic Narrative"
            message={locationRiskResult.explanation}
            icon={AlertOctagon}
            badge={`${locationRiskResult.riskLevel} SEVERITY`}
          />

          {/* Main Grid: Location Gauge & Metrics + Factor Contributions Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Location Risk Gauge & Production Data */}
            <Card variant="primary" className="flex flex-col justify-between items-center text-center space-y-6">
              <div className="w-full text-left">
                <span className="text-[10px] font-mono text-clay-muted uppercase font-bold tracking-wider">
                  Current Risk Level
                </span>
                <h3 className="text-xl font-black text-[#F1F2E9]">
                  {locationRiskResult.riskLevel} RISK
                </h3>
              </div>

              <RiskGauge
                value={locationRiskResult.shortfallPct}
                label={`${locationRiskResult.riskLevel} RISK`}
                sublabel={`GAP: ${locationRiskResult.shortfall.toLocaleString()} MT`}
                color={getRiskColor(locationRiskResult.riskLevel)}
                size={220}
              />

              <div className="w-full space-y-2 text-xs font-mono">
                <div className="clay-recessed p-3 rounded-xl flex justify-between border border-clay-border">
                  <span className="text-clay-muted">Monthly Target</span>
                  <span className="text-[#F1F2E9] font-bold">
                    {locationRiskResult.target.toLocaleString()} MT
                  </span>
                </div>
                <div className="clay-recessed p-3 rounded-xl flex justify-between border border-clay-border">
                  <span className="text-clay-muted">Predicted Output</span>
                  <span className="text-[#F1F2E9] font-bold">
                    {locationRiskResult.predictedProduction.toLocaleString()} MT
                  </span>
                </div>
                <div className="clay-recessed p-3 rounded-xl flex justify-between border border-clay-border">
                  <span className="text-clay-muted">Shortfall Variance</span>
                  <span className="text-[#A4B878] font-bold">
                    -{locationRiskResult.shortfall.toLocaleString()} MT ({locationRiskResult.shortfallPct}%)
                  </span>
                </div>
                <div className="clay-recessed p-3 rounded-xl flex justify-between border border-clay-border">
                  <span className="text-clay-muted">Forecast Confidence</span>
                  <span className="text-[#F1F2E9] font-bold">
                    {locationRiskResult.forecastConfidence}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Right Column: Normalized Factor Contribution Breakdown Chart */}
            <div className="lg:col-span-2">
              <PrimaryCard
                title="Normalized Factor Contribution Breakdown"
                subtitle={`QUANTIFIED PERCENTAGE LOSS CONTRIBUTION FOR ${selectedRecord.locationName.toUpperCase()}`}
                badge="100% Normalized"
              >
                {/* Bar Chart */}
                <div className="h-64 w-full clay-recessed p-4 rounded-xl border border-clay-border">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={locationRiskResult.contributions}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1D2517" />
                      <XAxis type="number" stroke="#858E78" fontSize={11} domain={[0, 100]} unit="%" />
                      <YAxis dataKey="factor" type="category" stroke="#F1F2E9" fontSize={11} width={140} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0D120C',
                          borderColor: '#252E1D',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#F1F2E9',
                          fontFamily: 'monospace'
                        }}
                        formatter={(val: any) => [`${val}% Contribution`, 'Impact']}
                      />
                      <Bar dataKey="contributionPct" radius={[0, 8, 8, 0]}>
                        {locationRiskResult.contributions.map((_, index) => {
                          const colors = ['#A4B878', '#71825B', '#596A43', '#4C5D38', '#39422F'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Location-Specific Factor Detail Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  {locationRiskResult.contributions.map((c, idx) => {
                    const colors = ['#A4B878', '#71825B', '#596A43', '#4C5D38', '#39422F'];
                    return (
                      <div
                        key={c.id}
                        className="clay-recessed p-3.5 rounded-xl space-y-1 border border-clay-border"
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-[#F1F2E9]">{c.factor}</span>
                          <span
                            className="font-bold"
                            style={{ color: colors[idx % colors.length] }}
                          >
                            {c.contributionPct}%
                          </span>
                        </div>
                        <p className="text-[11px] text-clay-muted leading-relaxed font-sans">{c.impactDescription}</p>
                      </div>
                    );
                  })}
                </div>
              </PrimaryCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
