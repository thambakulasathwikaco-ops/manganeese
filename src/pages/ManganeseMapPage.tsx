import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import type { Zone } from '../types';
import { dataService } from '../services/dataService';
import { LocationIntelligenceSection } from '../components/LocationIntelligenceSection';
import {
  Search,
  Star,
  Download,
  Sparkles,
  Layers,
  MapPin,
  ExternalLink,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Semantic prospectivity color definitions
const PROSPECTIVITY_COLORS = {
  HIGH: {
    hex: '#EF4444',        // Crisp Red
    borderHex: '#DC2626',
    strokeHex: '#F87171',
    bgRgba: 'rgba(239, 68, 68, 0.35)',
    badgeBg: 'bg-red-500/20',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-500/40',
    barBg: 'bg-red-500',
    glow: 'rgba(239, 68, 68, 0.5)'
  },
  MEDIUM: {
    hex: '#F59E0B',        // Amber / Yellow
    borderHex: '#D97706',
    strokeHex: '#FBBF24',
    bgRgba: 'rgba(245, 158, 11, 0.35)',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/40',
    barBg: 'bg-amber-500',
    glow: 'rgba(245, 158, 11, 0.5)'
  },
  LOW: {
    hex: '#10B981',        // Emerald / Green
    borderHex: '#059669',
    strokeHex: '#34D399',
    bgRgba: 'rgba(16, 185, 129, 0.35)',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/40',
    barBg: 'bg-emerald-500',
    glow: 'rgba(16, 185, 129, 0.5)'
  }
};

// Fallback high-performance MapLibre Raster Style (Guarantees basemap renders even if vector PBF/glyphs fail)
const FALLBACK_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'open-basemap': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
    }
  },
  layers: [
    {
      id: 'open-basemap-layer',
      type: 'raster',
      source: 'open-basemap',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export const ManganeseMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { zones, siteIntelligenceRecords, togglePriorityZone, selectedZoneId, setSelectedZoneId } = useAppStore();

  const [filterPotential, setFilterPotential] = useState<string>('ALL');
  const [filterPriorityOnly, setFilterPriorityOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLayer, setActiveLayer] = useState<'PROSPECTIVITY' | 'RESERVES' | 'GRADE'>('PROSPECTIVITY');
  const [selectedStyleMode, setSelectedStyleMode] = useState<'dark' | 'liberty' | 'raster'>('dark');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);

  // MapLibre Container & Instance References
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Map state tracking
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [hasLoadError, setHasLoadError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Filtered zones array based on search and filters
  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        z.name.toLowerCase().includes(q) ||
        z.zoneId.toLowerCase().includes(q) ||
        `${z.center[0]}, ${z.center[1]}`.includes(q);

      const matchesPotential = filterPotential === 'ALL' || z.potentialLevel === filterPotential;
      const matchesPriority = !filterPriorityOnly || z.priority;

      return matchesSearch && matchesPotential && matchesPriority;
    });
  }, [zones, searchQuery, filterPotential, filterPriorityOnly]);

  const activeZone = useMemo(() => {
    return zones.find((z) => z.zoneId === selectedZoneId) || zones[0] || null;
  }, [zones, selectedZoneId]);

  // Handle URL query parameter ?zone=ZONE-A17 or ?lat=21.1458&lng=79.0882 or #location-intelligence
  useEffect(() => {
    if (window.location.hash === '#location-intelligence') {
      const el = document.getElementById('location-intelligence');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }

    const qZone = searchParams.get('zone');
    if (qZone && zones.some((z) => z.zoneId === qZone)) {
      setSelectedZoneId(qZone);
    } else if (!selectedZoneId && zones.length > 0) {
      setSelectedZoneId(zones[0].zoneId);
    }
  }, [searchParams, zones]);

  // Initialize MapLibre GL JS Map with OpenFreeMap Vector/Raster Style
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    // Clean up existing instance if retrying or changing style mode
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    setIsMapLoaded(false);
    setHasLoadError(false);

    const initialCenter: [number, number] = activeZone
      ? [activeZone.center[1], activeZone.center[0]] // MapLibre uses [lng, lat]
      : [79.7167, 21.5333];

    let targetStyle: string | maplibregl.StyleSpecification = 'https://tiles.openfreemap.org/styles/liberty';
    if (selectedStyleMode === 'dark') {
      targetStyle = 'https://tiles.openfreemap.org/styles/dark';
    } else if (selectedStyleMode === 'raster') {
      targetStyle = FALLBACK_RASTER_STYLE;
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: targetStyle,
        center: initialCenter,
        zoom: 11,
        attributionControl: { compact: true }
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

      // Explicit Step 4 Logging & Lifecycle hooks
      map.on('load', () => {
        if (!isMounted) return;
        console.log('MAPLIBRE: map loaded');
        setIsMapLoaded(true);
        setHasLoadError(false);
        map.resize();
      });

      map.on('error', (event) => {
        console.error('MAPLIBRE ERROR:', event);
      });

      map.on('styledata', () => {
        console.log('MAPLIBRE: style loaded');
        if (isMounted && map.isStyleLoaded()) {
          setIsMapLoaded(true);
          setHasLoadError(false);
        }
      });

      map.on('sourcedata', (event) => {
        if (event?.sourceId) {
          console.log('MAPLIBRE SOURCE:', event.sourceId);
        }
      });

      // Synchronous check if style loaded immediately
      if (map.isStyleLoaded() || map.loaded()) {
        console.log('MAPLIBRE: style loaded synchronously');
        setIsMapLoaded(true);
        setHasLoadError(false);
        map.resize();
      }

      // Auto-resize MapLibre container whenever element dimensions change (Step 8)
      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      mapRef.current = map;

      return () => {
        isMounted = false;
        resizeObserver.disconnect();
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (err) {
      console.error('Failed to initialize MapLibre map:', err);
      setHasLoadError(true);
    }
  }, [retryCount, selectedStyleMode]);

  // Update Polygon GeoJSON layers & Markers whenever filteredZones, activeZone, or activeLayer changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    // 1. Remove previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 2. Build GeoJSON FeatureCollection for prospectivity zone polygons
    const geojsonFeatures = filteredZones.map((zone) => {
      const isSelected = activeZone && zone.zoneId === activeZone.zoneId;
      const colorDef = PROSPECTIVITY_COLORS[zone.potentialLevel] || PROSPECTIVITY_COLORS.LOW;

      // Close polygon ring in [lng, lat] format
      const ringCoords = [
        ...zone.coordinates.map(([lat, lng]) => [lng, lat]),
        [zone.coordinates[0][1], zone.coordinates[0][0]]
      ];

      return {
        type: 'Feature' as const,
        properties: {
          zoneId: zone.zoneId,
          name: zone.name,
          potentialLevel: zone.potentialLevel,
          prospectivityScore: zone.prospectivityScore,
          isSelected,
          fillColor: colorDef.hex,
          strokeColor: isSelected ? '#FFFFFF' : colorDef.borderHex,
          strokeWidth: isSelected ? 3.5 : 2,
          fillOpacity: isSelected ? 0.55 : 0.35
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [ringCoords]
        }
      };
    });

    const geojsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: geojsonFeatures
    };

    // Add or update MapLibre GeoJSON Source
    if (map.getSource('prospectivity-zones')) {
      (map.getSource('prospectivity-zones') as maplibregl.GeoJSONSource).setData(geojsonData);
    } else {
      map.addSource('prospectivity-zones', {
        type: 'geojson',
        data: geojsonData
      });

      // Fill Layer
      map.addLayer({
        id: 'prospectivity-zones-fill',
        type: 'fill',
        source: 'prospectivity-zones',
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': ['get', 'fillOpacity']
        }
      });

      // Outline Layer
      map.addLayer({
        id: 'prospectivity-zones-stroke',
        type: 'line',
        source: 'prospectivity-zones',
        paint: {
          'line-color': ['get', 'strokeColor'],
          'line-width': ['get', 'strokeWidth']
        }
      });

      // Click event on polygon layer
      map.on('click', 'prospectivity-zones-fill', (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (e.features && e.features[0]) {
          const zId = e.features[0].properties?.zoneId;
          if (zId) {
            setSelectedZoneId(zId);
          }
        }
      });

      // Hover cursor style
      map.on('mouseenter', 'prospectivity-zones-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'prospectivity-zones-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    }

    // 3. Render Custom MapLibre Pin Markers
    filteredZones.forEach((zone) => {
      const isSelected = activeZone && zone.zoneId === activeZone.zoneId;
      const colorDef = PROSPECTIVITY_COLORS[zone.potentialLevel] || PROSPECTIVITY_COLORS.LOW;

      const el = document.createElement('div');
      el.className = 'custom-maplibre-pin';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${
            isSelected || zone.priority
              ? `<div style="
                  position: absolute;
                  width: 38px;
                  height: 38px;
                  border-radius: 50%;
                  background: ${colorDef.hex};
                  opacity: 0.35;
                  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>`
              : ''
          }
          <div style="
            position: relative;
            z-index: 10;
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 50%;
            background-color: #0d120a;
            border: 2.5px solid ${isSelected ? '#ffffff' : colorDef.hex};
            box-shadow: 0 0 14px ${colorDef.glow};
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${colorDef.hex};
            font-family: monospace;
            font-weight: 800;
            font-size: ${isSelected ? '11px' : '10px'};
            transition: all 0.2s ease;
          ">
            ${zone.priority ? '★' : `${zone.prospectivityScore}`}
          </div>
        </div>
      `;

      // Tooltip HTML for hover / click popup
      const popupHtml = `
        <div style="padding: 8px; max-width: 230px; font-family: system-ui, sans-serif; background:#10150e; border-radius:8px; border:1px solid rgba(255,255,255,0.15);">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:5px; margin-bottom:6px;">
            <strong style="color:#fff; font-size:12px;">${zone.name}</strong>
            <span style="background:${colorDef.bgRgba}; color:${colorDef.hex}; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px;">
              ${zone.potentialLevel}
            </span>
          </div>
          <div style="font-size:11px; color:#ccc; display:flex; justify-content:space-between; margin-bottom:3px;">
            <span>Prospectivity Score:</span> <strong style="color:#10b981;">${zone.prospectivityScore}%</strong>
          </div>
          <div style="font-size:11px; color:#ccc; display:flex; justify-content:space-between; margin-bottom:3px;">
            <span>Estimated Reserve:</span> <strong style="color:#fff;">${zone.estimatedReserveTons.toLocaleString()} MT</strong>
          </div>
          <div style="font-size:11px; color:#ccc; display:flex; justify-content:space-between;">
            <span>Mn Grade Ratio:</span> <strong style="color:#34d399;">${zone.manganeseGradePct}% Mn</strong>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([zone.center[1], zone.center[0]])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        setSelectedZoneId(zone.zoneId);
        map.flyTo({ center: [zone.center[1], zone.center[0]], zoom: 12, speed: 1.2 });
      });

      markersRef.current.push(marker);
    });
  }, [filteredZones, activeZone, activeLayer, isMapLoaded, setSelectedZoneId]);

  // Re-center MapLibre camera smoothly when activeZone changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded || !activeZone) return;

    map.flyTo({
      center: [activeZone.center[1], activeZone.center[0]],
      zoom: 12,
      speed: 1.2
    });
  }, [activeZone, isMapLoaded]);

  const handleExportZone = (zone: Zone) => {
    const exportData = [
      {
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
      }
    ];

    dataService.exportToCSV(`${zone.zoneId}_prospectivity_report.csv`, exportData);
  };

  // Find matching site intelligence record for full analysis view
  const matchingIntelligenceRecord = useMemo(() => {
    if (!activeZone) return null;
    return siteIntelligenceRecords.find(
      (r) => r.locationId === activeZone.zoneId || r.locationName.toLowerCase() === activeZone.name.toLowerCase()
    );
  }, [activeZone, siteIntelligenceRecords]);

  const handleViewFullAnalysis = () => {
    if (!activeZone) return;
    const targetId = matchingIntelligenceRecord ? matchingIntelligenceRecord.id : activeZone.zoneId;
    navigate(`/analyzed-locations?locationId=${targetId}`);
  };

  // Calculate stats across filtered zones
  const stats = useMemo(() => {
    const highCount = zones.filter((z) => z.potentialLevel === 'HIGH').length;
    const medCount = zones.filter((z) => z.potentialLevel === 'MEDIUM').length;
    const lowCount = zones.filter((z) => z.potentialLevel === 'LOW').length;
    const priorityCount = zones.filter((z) => z.priority).length;
    return { highCount, medCount, lowCount, priorityCount };
  }, [zones]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-chrome-plat tracking-tight">
              Manganese Map & Reserves
            </h1>
            
            {/* OpenFreeMap / MapLibre Open Data Badge */}
            <span className="clay-recessed border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-inner uppercase tracking-wider flex items-center gap-1.5 bg-emerald-500/10">
              <CheckCircle2 size={12} className="text-emerald-400" />
              OPEN MAP DATA
            </span>

            <span className="clay-recessed border border-clay-border text-clay-muted text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-inner">
              DEMO DATASET • MOIL EXPLORATION MODEL
            </span>
          </div>
          <p className="text-xs text-clay-muted font-mono mt-1">
            Spatial intelligence for manganese prospectivity, reserves & deposit prioritization • Dongri-Mansar Belt
          </p>
        </div>

        {/* Top Summary Stat Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="clay-recessed px-3 py-1.5 rounded-xl border border-red-500/30 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-red-400 font-bold">{stats.highCount} HIGH</span>
          </div>
          <div className="clay-recessed px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="text-amber-400 font-bold">{stats.medCount} MEDIUM</span>
          </div>
          <div className="clay-recessed px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-emerald-400 font-bold">{stats.lowCount} LOW</span>
          </div>
          <div className="clay-recessed px-3 py-1.5 rounded-xl border border-yellow-500/30 flex items-center gap-1.5 text-yellow-400 font-bold">
            <Star size={12} fill="currentColor" />
            <span>{stats.priorityCount} PRIORITY</span>
          </div>
        </div>
      </div>

      {/* Main Container: Map Canvas + Floating Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        
        {/* Left: GIS Map Canvas (col-span-8 on desktop) */}
        <div className="lg:col-span-8 clay-recessed p-1 rounded-2xl overflow-hidden relative flex flex-col h-[700px] border border-clay-border shadow-2xl bg-[#0e130c]">
          
          {/* Top Floating Control Overlay */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            
            {/* Search Input Box */}
            <div className="pointer-events-auto flex items-center clay-card px-3.5 py-2 rounded-xl border border-clay-border text-xs font-mono shadow-lg backdrop-blur-md bg-[#0e130c]/90">
              <Search size={14} className="text-emerald-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location, zone ID..."
                className="bg-transparent text-[#F1F2E9] placeholder-clay-muted focus:outline-none w-36 sm:w-52"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-clay-muted hover:text-white text-xs ml-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Segmented Filter Buttons */}
            <div className="pointer-events-auto flex items-center gap-1 clay-card p-1 rounded-xl border border-clay-border text-xs font-mono shadow-lg backdrop-blur-md bg-[#0e130c]/90">
              <button
                onClick={() => setFilterPotential('ALL')}
                className={`px-3 py-1 rounded-lg transition-all font-bold ${
                  filterPotential === 'ALL'
                    ? 'btn-clay-primary text-clay-bg font-bold shadow-sm'
                    : 'text-clay-muted hover:text-chrome-plat'
                }`}
              >
                ALL ({zones.length})
              </button>
              <button
                onClick={() => setFilterPotential('HIGH')}
                className={`px-3 py-1 rounded-lg transition-all font-bold flex items-center gap-1.5 ${
                  filterPotential === 'HIGH'
                    ? 'bg-red-500/30 text-red-400 border border-red-500/50 shadow-sm'
                    : 'text-clay-muted hover:text-red-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500" /> HIGH
              </button>
              <button
                onClick={() => setFilterPotential('MEDIUM')}
                className={`px-3 py-1 rounded-lg transition-all font-bold flex items-center gap-1.5 ${
                  filterPotential === 'MEDIUM'
                    ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50 shadow-sm'
                    : 'text-clay-muted hover:text-amber-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" /> MED
              </button>
              <button
                onClick={() => setFilterPotential('LOW')}
                className={`px-3 py-1 rounded-lg transition-all font-bold flex items-center gap-1.5 ${
                  filterPotential === 'LOW'
                    ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 shadow-sm'
                    : 'text-clay-muted hover:text-emerald-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> LOW
              </button>
              <button
                onClick={() => setFilterPriorityOnly(!filterPriorityOnly)}
                className={`px-3 py-1 rounded-lg transition-all font-bold flex items-center gap-1 ${
                  filterPriorityOnly
                    ? 'bg-yellow-500 text-black shadow-sm'
                    : 'text-clay-muted hover:text-yellow-400'
                }`}
              >
                <Star size={12} fill={filterPriorityOnly ? 'currentColor' : 'none'} />
                <span>PRIORITY</span>
              </button>
            </div>

            {/* Layer Control Dropdown */}
            <div className="pointer-events-auto relative">
              <button
                onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                className="flex items-center gap-1.5 clay-card px-3 py-2 rounded-xl border border-clay-border text-xs font-mono text-emerald-400 font-bold hover:bg-emerald-500/10 transition shadow-lg backdrop-blur-md bg-[#0e130c]/90"
              >
                <Layers size={14} />
                <span>Layer: {activeLayer}</span>
              </button>

              {isLayerMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 clay-card border border-clay-border p-2 rounded-xl shadow-2xl z-30 space-y-1 font-mono text-xs">
                  <div className="px-2 py-1 text-[10px] text-clay-muted font-bold uppercase">Intelligence Layers</div>
                  <button
                    onClick={() => { setActiveLayer('PROSPECTIVITY'); setIsLayerMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      activeLayer === 'PROSPECTIVITY' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-clay-muted hover:text-white'
                    }`}
                  >
                    ● Prospectivity Score
                  </button>
                  <button
                    onClick={() => { setActiveLayer('RESERVES'); setIsLayerMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      activeLayer === 'RESERVES' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-clay-muted hover:text-white'
                    }`}
                  >
                    ● Manganese Reserves (MT)
                  </button>
                  <button
                    onClick={() => { setActiveLayer('GRADE'); setIsLayerMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      activeLayer === 'GRADE' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-clay-muted hover:text-white'
                    }`}
                  >
                    ● Mn Grade Ratio (%)
                  </button>
                  <div className="px-2 py-1 text-[10px] text-clay-muted font-bold uppercase pt-1 border-t border-clay-border">Map Style</div>
                  <button
                    onClick={() => { setSelectedStyleMode('liberty'); setIsLayerMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      selectedStyleMode === 'liberty' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-clay-muted hover:text-white'
                    }`}
                  >
                    🗺️ OpenFreeMap Liberty
                  </button>
                  <button
                    onClick={() => { setSelectedStyleMode('dark'); setIsLayerMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      selectedStyleMode === 'dark' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-clay-muted hover:text-white'
                    }`}
                  >
                    🗺️ OpenFreeMap Dark
                  </button>
                  <button
                    onClick={() => { setSelectedStyleMode('raster'); setIsLayerMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      selectedStyleMode === 'raster' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-clay-muted hover:text-white'
                    }`}
                  >
                    🗺️ OpenStreetMap Standard
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MapLibre Container Viewport */}
          <div className="relative w-full h-[600px] min-h-[600px] rounded-xl overflow-hidden bg-[#0a0e08]">
            {filteredZones.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3 bg-[#0a0e08]">
                <ShieldAlert size={36} className="text-amber-400 animate-pulse" />
                <div className="text-sm font-mono text-white font-bold">No analyzed locations match your criteria.</div>
                <div className="text-xs text-clay-muted max-w-sm">
                  Try adjusting search query or clearing potential filters to view all 12 Dongri-Mansar mining zones.
                </div>
                <button
                  onClick={() => { setFilterPotential('ALL'); setFilterPriorityOnly(false); setSearchQuery(''); }}
                  className="btn-clay-primary text-xs px-4 py-2 font-mono font-bold uppercase mt-2"
                >
                  Reset Map Filters
                </button>
              </div>
            ) : (
              <div
                ref={mapContainerRef}
                className="absolute inset-0 w-full h-full rounded-xl"
                style={{ width: '100%', height: '100%', minHeight: '600px' }}
              />
            )}

            {/* MapLibre Loading Skeleton Overlay */}
            {!isMapLoaded && !hasLoadError && filteredZones.length > 0 && (
              <div className="absolute inset-0 z-10 bg-[#0a0e08]/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3 pointer-events-none">
                <Sparkles size={32} className="text-emerald-400 animate-spin" />
                <div className="text-xs font-mono text-white font-bold tracking-wider">
                  LOADING GEOSPATIAL INTELLIGENCE...
                </div>
                <div className="text-[11px] font-mono text-clay-muted">
                  Fetching OpenFreeMap vector basemap & prospectivity overlays
                </div>
              </div>
            )}

            {/* Map Load Error State */}
            {hasLoadError && (
              <div className="absolute inset-0 z-10 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3 pointer-events-auto">
                <AlertTriangle size={36} className="text-amber-400 animate-pulse" />
                <div className="text-sm font-mono text-white font-bold">Map basemap unavailable.</div>
                <div className="text-xs text-clay-muted max-w-xs">
                  Unable to connect to OpenFreeMap vector tiles. Click below to retry.
                </div>
                <button
                  onClick={() => setRetryCount((prev) => prev + 1)}
                  className="btn-clay-primary text-xs px-4 py-2 font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer mt-1"
                >
                  <RotateCcw size={14} /> Retry Map
                </button>
              </div>
            )}
          </div>

          {/* Bottom Left Floating Legend Box */}
          <div className="absolute bottom-4 left-4 z-20 clay-card p-3 rounded-xl border border-clay-border shadow-2xl backdrop-blur-md bg-[#0e130c]/90 text-xs font-mono space-y-2 pointer-events-auto">
            <div className="text-[10px] font-bold text-clay-muted uppercase tracking-wider flex items-center justify-between gap-3">
              <span>PROSPECTIVITY LEGEND</span>
              <span className="text-emerald-400 font-normal">{filteredZones.length} Zones</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 pt-0.5">
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                <span>HIGH</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                <span>MEDIUM</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span>LOW</span>
              </div>
            </div>

            <div className="border-t border-clay-border/60 pt-1.5 flex items-center justify-between gap-4 text-[10px] text-clay-muted">
              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                <Star size={10} fill="currentColor" /> Priority Target
              </span>
              <span className="flex items-center gap-1 text-white font-bold">
                <MapPin size={10} className="text-emerald-400" /> Selected Pin
              </span>
            </div>
          </div>
        </div>

        {/* Right: Selected Location Intelligence Panel (col-span-4 on desktop) */}
        {activeZone && (
          <div className="lg:col-span-4 clay-card p-6 flex flex-col justify-between overflow-y-auto space-y-5 border border-clay-border shadow-2xl rounded-2xl bg-[#0f140d]">
            
            <div>
              {/* Header: Zone ID & Semantic Potential Badge */}
              <div className="flex items-start justify-between gap-2 border-b border-clay-border/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">
                      {activeZone.zoneId}
                    </span>
                    <span className="text-clay-muted text-[10px] font-mono">
                      • {activeZone.areaSqKm} SQ KM
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-chrome-plat mt-0.5 leading-snug">
                    {activeZone.name}
                  </h2>
                  <div className="text-[11px] font-mono text-clay-muted mt-0.5">
                    Lat: {activeZone.center[0].toFixed(4)} | Lng: {activeZone.center[1].toFixed(4)}
                  </div>
                </div>

                {/* Semantic Status Badge */}
                {(() => {
                  const colorDef = PROSPECTIVITY_COLORS[activeZone.potentialLevel] || PROSPECTIVITY_COLORS.LOW;
                  return (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider border shadow-md shrink-0 ${colorDef.badgeBg} ${colorDef.badgeText} ${colorDef.badgeBorder}`}
                    >
                      {activeZone.potentialLevel} POTENTIAL
                    </span>
                  );
                })()}
              </div>

              {/* Prospectivity Score Visualization (Circular Radial Gauge) */}
              <div className="mt-5 clay-recessed p-5 rounded-xl border border-clay-border space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-clay-muted uppercase tracking-wider">
                    Prospectivity Score
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {activeZone.confidence}% MODEL CONFIDENCE
                  </span>
                </div>

                <div className="flex items-center justify-around py-2">
                  {/* Circular Radial SVG Gauge */}
                  {(() => {
                    const colorDef = PROSPECTIVITY_COLORS[activeZone.potentialLevel] || PROSPECTIVITY_COLORS.LOW;
                    const radius = 42;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (activeZone.prospectivityScore / 100) * circumference;

                    return (
                      <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          {/* Background Track */}
                          <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            className="stroke-[#131a11]"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          {/* Animated Color Gauge */}
                          <motion.circle
                            cx="50"
                            cy="50"
                            r={radius}
                            stroke={colorDef.hex}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>

                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black font-mono text-white leading-none">
                            {activeZone.prospectivityScore}%
                          </span>
                          <span className={`text-[9px] font-mono font-bold uppercase mt-1 ${colorDef.badgeText}`}>
                            {activeZone.potentialLevel}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Quick Summary Metadata */}
                  <div className="space-y-2 text-xs font-mono border-l border-clay-border/60 pl-4">
                    <div>
                      <div className="text-[10px] text-clay-muted uppercase">Estimated Reserve</div>
                      <div className="text-sm font-extrabold text-white mt-0.5">
                        {activeZone.estimatedReserveTons.toLocaleString()} <span className="text-xs text-clay-muted font-normal">MT</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-clay-muted uppercase">Mn Grade Ratio</div>
                      <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                        {activeZone.manganeseGradePct}% Mn
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence / Factor Breakdown Progress Bars */}
                <div className="space-y-2.5 text-xs font-mono pt-2 border-t border-clay-border/60">
                  <div className="text-[10px] font-bold text-clay-muted uppercase tracking-wider">
                    Geospatial Evaluation Factors
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-clay-muted">
                      <span>Geological Core (35%)</span>
                      <span className="text-white font-bold">{activeZone.geologicalScore}%</span>
                    </div>
                    <div className="w-full bg-[#0a0e08] h-1.5 rounded-full overflow-hidden mt-0.5 shadow-inner">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                        style={{ width: `${activeZone.geologicalScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-clay-muted">
                      <span>Borehole Layer (30%)</span>
                      <span className="text-white font-bold">{activeZone.boreholeScore}%</span>
                    </div>
                    <div className="w-full bg-[#0a0e08] h-1.5 rounded-full overflow-hidden mt-0.5 shadow-inner">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${activeZone.boreholeScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-clay-muted">
                      <span>Satellite Multispectral (20%)</span>
                      <span className="text-white font-bold">{activeZone.satelliteScore}%</span>
                    </div>
                    <div className="w-full bg-[#0a0e08] h-1.5 rounded-full overflow-hidden mt-0.5 shadow-inner">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                        style={{ width: `${activeZone.satelliteScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-clay-muted">
                      <span>Terrain Slope (15%)</span>
                      <span className="text-white font-bold">{activeZone.terrainScore}%</span>
                    </div>
                    <div className="w-full bg-[#0a0e08] h-1.5 rounded-full overflow-hidden mt-0.5 shadow-inner">
                      <div
                        className="bg-emerald-700 h-full rounded-full transition-all duration-700"
                        style={{ width: `${activeZone.terrainScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Exploration Directive Box */}
              <div className="mt-4 clay-recessed p-4 rounded-xl text-xs text-clay-muted space-y-1 border border-emerald-500/20 bg-emerald-950/10">
                <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <Sparkles size={13} /> AI Exploration Directive
                </div>
                <p className="leading-relaxed text-[#D0D6C4] font-sans text-xs pt-1">
                  {activeZone.recommendation}
                </p>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="pt-4 border-t border-clay-border space-y-2.5">
              
              {/* Prioritize Target Toggle */}
              <button
                onClick={() => togglePriorityZone(activeZone.zoneId)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider border shadow-md ${
                  activeZone.priority
                    ? 'bg-yellow-500 text-black border-yellow-400 font-extrabold shadow-yellow-500/20'
                    : 'btn-clay-secondary text-clay-muted hover:text-white border-clay-border'
                }`}
              >
                <Star size={14} fill={activeZone.priority ? 'currentColor' : 'none'} />
                <span>{activeZone.priority ? 'PRIORITIZED TARGET' : 'ADD TO PRIORITY TARGETS'}</span>
              </button>

              {/* Export Zone Data (CSV) */}
              <button
                onClick={() => handleExportZone(activeZone)}
                className="w-full py-2.5 px-4 btn-clay-secondary text-xs transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-bold border border-clay-border text-white hover:bg-emerald-500/10"
              >
                <Download size={14} className="text-emerald-400" />
                <span>EXPORT ZONE DATA (CSV)</span>
              </button>

              {/* View Full Analysis Button (Navigates to Analyzed Locations module) */}
              <button
                onClick={handleViewFullAnalysis}
                className="w-full py-3 px-4 btn-clay-primary text-xs transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-black shadow-lg"
              >
                <span>VIEW FULL ANALYSIS</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Location Intelligence Console for Targeted Prospectivity Search & Analysis */}
      <div id="location-intelligence">
        <LocationIntelligenceSection />
      </div>
    </div>
  );
};
