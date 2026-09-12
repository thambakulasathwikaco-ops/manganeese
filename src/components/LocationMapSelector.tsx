import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapProviderService } from '../services/mapProviderService';

// Tactile warm ivory & soft olive SVG marker icon with clay depth
const createCustomMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 30px; height: 30px; background: rgba(164, 177, 138, 0.35); border-radius: 50%; animation: pulse 2.5s infinite;"></div>
        <div style="width: 14px; height: 14px; background: #F1F2E9; border: 2.5px solid #10140D; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.8), 0 0 12px rgba(164, 177, 138, 0.6);"></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};


interface LocationMapSelectorProps {
  latitude: number;
  longitude: number;
  onSelectCoordinates: (lat: number, lon: number) => void;
}

// Sub-component to re-center map when coordinates change externally
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, { duration: 1.0 });
    map.invalidateSize();
  }, [center, map]);
  return null;
};

// Sub-component to capture map click events
const MapEventsHandler: React.FC<{ onSelect: (lat: number, lon: number) => void }> = ({ onSelect }) => {
  useMapEvents({
    click: (e) => {
      onSelect(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)));
    }
  });
  return null;
};

export const LocationMapSelector: React.FC<LocationMapSelectorProps> = ({
  latitude,
  longitude,
  onSelectCoordinates
}) => {
  const markerIcon = useMemo(() => createCustomMarkerIcon(), []);
  const center: [number, number] = [latitude, longitude];
  const mapConfig = useMemo(() => mapProviderService.getProviderConfig(), []);

  const eventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        const marker = e.target;
        if (marker) {
          const latLng = marker.getLatLng();
          onSelectCoordinates(Number(latLng.lat.toFixed(4)), Number(latLng.lng.toFixed(4)));
        }
      }
    }),
    [onSelectCoordinates]
  );

  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden relative z-0 shadow-inner">
      <MapContainer
        center={center}
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
        <MapRecenter center={center} />
        <MapEventsHandler onSelect={onSelectCoordinates} />

        <Marker
          position={center}
          icon={markerIcon}
          draggable={true}
          eventHandlers={eventHandlers}
        />
      </MapContainer>

      {/* Configured Map Provider / Demo Map Badge */}
      <div className="absolute top-3 right-3 z-[400] bg-[#0D1012]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5 text-[9px] font-mono font-bold text-[#D9DDDE] pointer-events-none shadow-inner">
        {mapConfig.badgeLabel}
      </div>

      {/* Map Hint Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-[#0D1012]/90 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5 text-[9px] font-mono text-[#7C8589] pointer-events-none shadow-inner">
        Click map or drag marker to select point
      </div>
    </div>
  );
};

