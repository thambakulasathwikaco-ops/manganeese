import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import { useAppStore } from '../store/useAppStore';
import type { Zone } from '../types';
import { dataService } from '../services/dataService';
import { mapProviderService } from '../services/mapProviderService';
import { LocationIntelligenceSection } from '../components/LocationIntelligenceSection';
import { Search, Star, Download, Sparkles } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Component to dynamically re-center Leaflet map on zone selection
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, { duration: 1.2 });
  }, [center, map]);
  return null;
};

export const ManganeseMapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { zones, togglePriorityZone, selectedZoneId, setSelectedZoneId } = useAppStore();

  const [filterPotential, setFilterPotential] = useState<string>('ALL');
  const [filterPriorityOnly, setFilterPriorityOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const mapConfig = React.useMemo(() => mapProviderService.getProviderConfig(), []);

  // Handle URL query parameter ?zone=ZONE-A17 or ?lat=21.1458&lng=79.0882 or #location-intelligence
  useEffect(() => {
    if (window.location.hash === '#location-intelligence') {
      const el = document.getElementById('location-intelligence');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }

    const qLat = searchParams.get('lat');
    const qLng = searchParams.get('lng');

    if (qLat && qLng) {
      const latNum = parseFloat(qLat);
      const lngNum = parseFloat(qLng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setMapCenter([latNum, lngNum]);
        return;
      }
    }

    const qZone = searchParams.get('zone');
    if (qZone && zones.some((z) => z.zoneId === qZone)) {
      setSelectedZoneId(qZone);
    } else if (!selectedZoneId && zones.length > 0) {
      setSelectedZoneId(zones[0].zoneId);
    }
  }, [searchParams, zones]);

  const activeZone = zones.find((z) => z.zoneId === selectedZoneId) || zones[0];

  const filteredZones = zones.filter((z) => {
    const matchesSearch = z.name.toLowerCase().includes(searchQuery.toLowerCase()) || z.zoneId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPotential = filterPotential === 'ALL' || z.potentialLevel === filterPotential;
    const matchesPriority = !filterPriorityOnly || z.priority;
    return matchesSearch && matchesPotential && matchesPriority;
  });

  const getZoneColor = (level: string) => {
    switch (level) {
      case 'HIGH': return '#A4B878';      // Monochromatic Light Sage/Olive
      case 'MEDIUM': return '#596A43';    // Medium Olive
      default: return '#39422F';          // Dark Olive
    }
  };

  const handleExportZone = (zone: Zone) => {
    const exportData = [{
      Zone_ID: zone.zoneId,
      Zone_Name: zone.name,
      Prospectivity_Score: zone.prospectivityScore,
      Potential_Level: zone.potentialLevel,
      Model_Confidence_Pct: zone.confidence,
      Geological_Score: zone.geologicalScore,
      Satellite_Score: zone.satelliteScore,
      Borehole_Score: zone.boreholeScore,
      Terrain_Score: zone.terrainScore,
      Area_SqKm: zone.areaSqKm,
      Estimated_Reserve_MT: zone.estimatedReserveTons,
      Manganese_Grade_Pct: zone.manganeseGradePct,
      Priority_Target: zone.priority ? 'YES' : 'NO',
      Recommendation: zone.recommendation,
      Latitude: zone.center[0],
      Longitude: zone.center[1]
    }];

    dataService.exportToCSV(`${zone.zoneId}_prospectivity_report.csv`, exportData);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-chrome-plat tracking-tight">Manganese GIS Map & Reserves</h1>
            <span className="clay-recessed border border-clay-border text-sage-light text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-inner uppercase tracking-wider">
              GEOSPATIAL CANVAS
            </span>
            <span className="clay-recessed border border-clay-border text-clay-muted text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-inner">
              {mapConfig.badgeLabel}
            </span>
          </div>
          <p className="text-xs text-clay-muted font-mono mt-1">
            Dongri-Mansar Manganese Mining Belt • 12 Evaluated Exploration Zones
          </p>
        </div>

        {/* Monochromatic Olive Legend */}
        <div className="flex items-center gap-4 text-xs font-mono clay-recessed px-3.5 py-2 rounded-xl border border-clay-border self-start sm:self-auto">
          <span className="flex items-center gap-1.5 text-chrome-plat font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A4B878]" /> HIGH (70-100)
          </span>
          <span className="flex items-center gap-1.5 text-[#C0C6B2]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#596A43]" /> MED (40-69)
          </span>
          <span className="flex items-center gap-1.5 text-clay-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39422F]" /> LOW (0-39)
          </span>
        </div>
      </div>

      {/* Main Grid: Full-Screen GIS Canvas + Floating Zone Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[680px]">
        
        {/* Left: CartoDB Dark Matter GIS Map Container */}
        <div className="lg:col-span-8 clay-recessed p-1 rounded-2xl overflow-hidden relative flex flex-col">
          
          {/* Floating Controls Overlay */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            
            {/* Search Input */}
            <div className="pointer-events-auto flex items-center clay-recessed px-3.5 py-2 rounded-xl border border-clay-border text-xs font-mono">
              <Search size={14} className="text-sage-light mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter zones..."
                className="bg-transparent text-[#F1F2E9] placeholder-clay-muted focus:outline-none w-32 sm:w-44"
              />
            </div>

            {/* Segmented Filter Buttons */}
            <div className="pointer-events-auto flex items-center gap-1 clay-recessed p-1 rounded-xl border border-clay-border text-xs font-mono">
              <button
                onClick={() => setFilterPotential('ALL')}
                className={`px-3 py-1 rounded-lg transition ${filterPotential === 'ALL' ? 'btn-clay-primary text-clay-bg font-bold shadow-sm' : 'text-clay-muted hover:text-chrome-plat'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPotential('HIGH')}
                className={`px-3 py-1 rounded-lg transition ${filterPotential === 'HIGH' ? 'bg-[#A4B878] text-[#10140D] font-bold' : 'text-clay-muted hover:text-chrome-plat'}`}
              >
                High
              </button>
              <button
                onClick={() => setFilterPriorityOnly(!filterPriorityOnly)}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${filterPriorityOnly ? 'bg-sage-light text-[#10140D] font-bold' : 'text-clay-muted hover:text-chrome-plat'}`}
              >
                <Star size={12} /> Priority
              </button>
            </div>
          </div>

          {/* Leaflet Map with Configurable Provider */}
          <div className="w-full h-full rounded-xl overflow-hidden">
            <MapContainer
              center={mapCenter || (activeZone ? activeZone.center : [21.5333, 79.7167])}
              zoom={11}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution={mapConfig.attribution}
                url={mapConfig.url}
                subdomains={mapConfig.subdomains || 'abc'}
                maxZoom={mapConfig.maxZoom || 19}
              />
              <MapRecenter center={mapCenter || (activeZone ? activeZone.center : [21.5333, 79.7167])} />

              {filteredZones.map((zone) => {
                const isSelected = zone.zoneId === activeZone.zoneId;
                const color = getZoneColor(zone.potentialLevel);
                return (
                  <Polygon
                    key={zone.zoneId}
                    positions={zone.coordinates}
                    pathOptions={{
                      color: isSelected ? '#F1F2E9' : color,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.65 : 0.4,
                      weight: isSelected ? 2.5 : 1.5
                    }}
                    eventHandlers={{
                      click: () => setSelectedZoneId(zone.zoneId)
                    }}
                  >
                    <Popup>
                      <div className="p-1.5 space-y-1 font-sans">
                        <div className="font-bold text-[#F1F2E9] text-sm">{zone.name}</div>
                        <div className="text-xs font-mono text-[#A4B18A]">{zone.zoneId} • {zone.prospectivityScore}% Score</div>
                        <div className="text-[11px] text-clay-muted">Grade: {zone.manganeseGradePct}% Mn</div>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Right: Selected Zone Floating Panel */}
        <div className="lg:col-span-4 clay-card p-6 flex flex-col justify-between overflow-y-auto space-y-5">
          
          <div>
            {/* Header: Zone ID & Status Badge */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-sage-light">
                  {activeZone.zoneId} • {activeZone.areaSqKm} SQ KM
                </span>
                <h2 className="text-base font-extrabold text-chrome-plat mt-0.5">{activeZone.name}</h2>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                activeZone.potentialLevel === 'HIGH' ? 'bg-[#A4B878] text-[#10140D]' :
                activeZone.potentialLevel === 'MEDIUM' ? 'bg-[#596A43] text-[#F1F2E9]' :
                'bg-[#39422F] text-[#C0C6B2]'
              }`}>
                {activeZone.potentialLevel} POTENTIAL
              </span>
            </div>

            {/* Score & Confidence Overview */}
            <div className="mt-5 clay-recessed p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-clay-muted">Prospectivity Score</span>
                <span className="text-2xl font-black font-mono text-[#F1F2E9]">{activeZone.prospectivityScore}%</span>
              </div>

              {/* Tonal Olive Horizontal Evidence Bars */}
              <div className="space-y-2 text-xs font-mono pt-1">
                <div>
                  <div className="flex justify-between text-[10px] text-clay-muted">
                    <span>Geological Core (35%)</span>
                    <span className="text-[#F1F2E9] font-bold">{activeZone.geologicalScore}%</span>
                  </div>
                  <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden mt-0.5 shadow-inner">
                    <div className="bg-[#A4B878] h-full rounded-full" style={{ width: `${activeZone.geologicalScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-clay-muted">
                    <span>Borehole Layer (30%)</span>
                    <span className="text-[#F1F2E9] font-bold">{activeZone.boreholeScore}%</span>
                  </div>
                  <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden mt-0.5 shadow-inner">
                    <div className="bg-[#71825B] h-full rounded-full" style={{ width: `${activeZone.boreholeScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-clay-muted">
                    <span>Satellite Multispectral (20%)</span>
                    <span className="text-[#F1F2E9] font-bold">{activeZone.satelliteScore}%</span>
                  </div>
                  <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden mt-0.5 shadow-inner">
                    <div className="bg-[#4C5D38] h-full rounded-full" style={{ width: `${activeZone.satelliteScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-clay-muted">
                    <span>Terrain Slope (15%)</span>
                    <span className="text-[#F1F2E9] font-bold">{activeZone.terrainScore}%</span>
                  </div>
                  <div className="w-full bg-[#0B0E09] h-1.5 rounded-full overflow-hidden mt-0.5 shadow-inner">
                    <div className="bg-[#39482B] h-full rounded-full" style={{ width: `${activeZone.terrainScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Reserve & Mn Grade */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="clay-recessed p-3.5">
                <div className="text-clay-muted text-[10px] uppercase font-mono">Estimated Reserve</div>
                <div className="text-base font-extrabold text-[#F1F2E9] font-mono mt-0.5">
                  {activeZone.estimatedReserveTons.toLocaleString()} <span className="text-xs text-clay-muted font-sans font-normal">MT</span>
                </div>
              </div>
              <div className="clay-recessed p-3.5">
                <div className="text-clay-muted text-[10px] uppercase font-mono">Mn Grade Ratio</div>
                <div className="text-base font-extrabold text-sage-light font-mono mt-0.5">
                  {activeZone.manganeseGradePct}% Mn
                </div>
              </div>
            </div>

            {/* AI Recommendation Summary */}
            <div className="mt-4 clay-recessed p-4 text-xs text-[#C0C6B2] space-y-1">
              <div className="text-[10px] uppercase font-mono text-sage-light font-bold flex items-center gap-1">
                <Sparkles size={12} /> AI Exploration Directive
              </div>
              <p className="leading-relaxed text-[#C0C6B2] font-sans">{activeZone.recommendation}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-clay-border space-y-2.5">
            <button
              onClick={() => togglePriorityZone(activeZone.zoneId)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
                activeZone.priority
                  ? 'btn-clay-primary text-[#10140D] font-extrabold'
                  : 'btn-clay-secondary'
              }`}
            >
              <Star size={14} fill={activeZone.priority ? 'currentColor' : 'none'} />
              <span>{activeZone.priority ? 'PRIORITIZED TARGET' : 'ADD TO PRIORITY'}</span>
            </button>

            <button
              onClick={() => handleExportZone(activeZone)}
              className="w-full py-2.5 px-4 btn-clay-primary text-xs transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-extrabold"
            >
              <Download size={14} />
              <span>EXPORT ZONE DATA (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Location Intelligence Console for Targeted Prospectivity Search & Analysis */}
      <div id="location-intelligence">
        <LocationIntelligenceSection />
      </div>
    </div>
  );
};


