import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapProviderService } from '../services/mapProviderService';
import { AlertCircle } from 'lucide-react';

interface LocationMapSelectorProps {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  onSelectCoordinates: (lat: number, lon: number) => void;
}

// GeoJSON Circle Generator for Target Mining Radius Overlay
const createGeoJsonCircle = (center: [number, number], radiusKm: number, points = 64) => {
  const coords: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * (2 * Math.PI);
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    const deltaLat = dy / 110.574;
    const deltaLng = dx / (111.32 * Math.cos((center[1] * Math.PI) / 180));
    coords.push([center[0] + deltaLng, center[1] + deltaLat]);
  }
  coords.push(coords[0]);
  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords]
    },
    properties: {}
  };
};

export const LocationMapSelector: React.FC<LocationMapSelectorProps> = ({
  latitude,
  longitude,
  radiusKm = 10,
  onSelectCoordinates
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onSelectCoordinatesRef = useRef(onSelectCoordinates);

  const [hasMapError, setHasMapError] = useState<boolean>(false);
  const mapConfig = mapProviderService.getProviderConfig();

  // Keep latest callback ref to avoid re-binding handlers
  useEffect(() => {
    onSelectCoordinatesRef.current = onSelectCoordinates;
  }, [onSelectCoordinates]);

  // 1. Initialize MapLibre GL JS Instance with CARTO Dark Matter GL Style
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    setHasMapError(false);

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapConfig.style,
        center: [longitude, latitude], // MapLibre expects [lng, lat]
        zoom: 11,
        attributionControl: { compact: true }
      });

      mapRef.current = map;

      // Add navigation controls (+ / - zoom & compass)
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: true }),
        'bottom-right'
      );

      // Custom Manganese Mining Marker DOM element
      const el = document.createElement('div');
      el.className = 'custom-manganese-marker';
      el.style.cssText = 'position: relative; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
      el.innerHTML = `
        <div style="position: absolute; width: 32px; height: 32px; background: rgba(169, 181, 141, 0.35); border-radius: 50%; animation: pulse 2.5s infinite;"></div>
        <div style="width: 14px; height: 14px; background: #F1F1E9; border: 2.5px solid #182016; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.8), 0 0 12px rgba(169, 181, 141, 0.6);"></div>
      `;

      // Create & Add Draggable Marker
      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([longitude, latitude])
        .addTo(map);

      markerRef.current = marker;

      // Handle Marker Drag Event
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        const lat = Number(lngLat.lat.toFixed(4));
        const lon = Number(lngLat.lng.toFixed(4));

        if (map.getSource('selected-target-radius')) {
          (map.getSource('selected-target-radius') as maplibregl.GeoJSONSource).setData(
            createGeoJsonCircle([lon, lat], radiusKm) as any
          );
        }

        onSelectCoordinatesRef.current(lat, lon);
      });

      // Handle Map Click Event
      map.on('click', (e: maplibregl.MapMouseEvent) => {
        const lat = Number(e.lngLat.lat.toFixed(4));
        const lon = Number(e.lngLat.lng.toFixed(4));
        marker.setLngLat([lon, lat]);

        if (map.getSource('selected-target-radius')) {
          (map.getSource('selected-target-radius') as maplibregl.GeoJSONSource).setData(
            createGeoJsonCircle([lon, lat], radiusKm) as any
          );
        }

        onSelectCoordinatesRef.current(lat, lon);
      });

      // Add Mining Target Exploration Radius Layer on Map Load
      map.on('load', () => {
        map.resize();

        if (!map.getSource('selected-target-radius')) {
          map.addSource('selected-target-radius', {
            type: 'geojson',
            data: createGeoJsonCircle([longitude, latitude], radiusKm) as any
          });

          map.addLayer({
            id: 'selected-target-radius-fill',
            type: 'fill',
            source: 'selected-target-radius',
            paint: {
              'fill-color': '#A9B58D',
              'fill-opacity': 0.12
            }
          });

          map.addLayer({
            id: 'selected-target-radius-stroke',
            type: 'line',
            source: 'selected-target-radius',
            paint: {
              'line-color': '#A9B58D',
              'line-width': 1.5,
              'line-dasharray': [3, 3]
            }
          });
        }
      });

      map.on('error', (e: any) => {
        console.warn('CARTO MapLibre error:', e);
        if (e.error?.message?.includes('style') || e.error?.message?.includes('fetch')) {
          setHasMapError(true);
        }
      });
    } catch (err) {
      console.error('Failed to initialize CARTO MapLibre GL map:', err);
      setHasMapError(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run once on mount

  // 2. Synchronize Map Center, Marker, and Exploration Overlay on Coordinate Changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const currentLngLat = markerRef.current.getLngLat();
    const isDifferent =
      Math.abs(currentLngLat.lat - latitude) > 0.0001 ||
      Math.abs(currentLngLat.lng - longitude) > 0.0001;

    if (isDifferent) {
      markerRef.current.setLngLat([longitude, latitude]);

      if (mapRef.current.getSource('selected-target-radius')) {
        (mapRef.current.getSource('selected-target-radius') as maplibregl.GeoJSONSource).setData(
          createGeoJsonCircle([longitude, latitude], 2.5) as any
        );
      }

      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        duration: 1000
      });
      setTimeout(() => mapRef.current?.resize(), 300);
    }
  }, [latitude, longitude]);

  return (
    <div className="w-full h-full min-h-[320px] rounded-xl overflow-hidden relative z-0 shadow-inner bg-[#111811]">
      {/* MapLibre Canvas Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[320px] absolute inset-0"
      />

      {/* Fallback Error Overlay */}
      {hasMapError && (
        <div className="absolute inset-0 z-[500] bg-[#0B100B]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-xs font-mono text-[#9EA493]">
          <AlertCircle size={24} className="text-[#A9B58D] mb-2 animate-bounce" />
          <span className="font-bold text-[#F1F1E9] text-sm uppercase">MAP DATA UNAVAILABLE</span>
          <p className="max-w-xs mt-1 leading-relaxed text-[11px]">
            Unable to load geographic map data. Please check your connection and try again.
          </p>
        </div>
      )}

      {/* CARTO Badge */}
      <div className="absolute top-3 right-3 z-[400] bg-[#0B100B]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#A9B58D]/25 text-[9px] font-mono font-bold text-[#F1F1E9] pointer-events-none shadow-inner">
        {mapConfig.badgeLabel}
      </div>

      {/* Map Hint Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-[#0B100B]/90 backdrop-blur-md px-3 py-1 rounded-lg border border-[#A9B58D]/25 text-[9px] font-mono text-[#9EA493] pointer-events-none shadow-inner">
        Click map or drag marker to select point
      </div>
    </div>
  );
};




