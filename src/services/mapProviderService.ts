export interface MapProviderConfig {
  id: 'carto' | 'osm_fallback' | 'maptiler' | 'mapbox' | 'custom';
  name: string;
  url: string;
  attribution: string;
  isFallback: boolean;
  requiresKey: boolean;
  hasValidKey: boolean;
  badgeLabel: string;
  subdomains?: string;
  maxZoom?: number;
}

export class MapProviderService {
  /**
   * Get configured map provider configuration based on available environment variables.
   * Dynamically injects import.meta.env.VITE_CARTO_API_KEY if present without hardcoding or logging keys.
   */
  getProviderConfig(): MapProviderConfig {
    const cartoKey = import.meta.env.VITE_CARTO_API_KEY;
    const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY;
    const mapboxKey = import.meta.env.VITE_MAPBOX_API_KEY;

    // 1. Authenticated CARTO Basemaps API
    if (cartoKey && cartoKey.trim().length > 0 && cartoKey !== 'YOUR_CARTO_KEY') {
      return {
        id: 'carto',
        name: 'CARTO Basemaps Dark',
        url: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${encodeURIComponent(cartoKey.trim())}`,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        isFallback: false,
        requiresKey: true,
        hasValidKey: true,
        badgeLabel: 'CARTO MAP',
        subdomains: 'abc',
        maxZoom: 19
      };
    }

    // 2. Authenticated MapTiler API
    if (maptilerKey && maptilerKey.trim().length > 0) {
      return {
        id: 'maptiler',
        name: 'MapTiler Dark',
        url: `https://api.maptiler.com/maps/ch-swisstopo-lbm-dark/{z}/{x}/{y}.png?key=${encodeURIComponent(maptilerKey.trim())}`,
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        isFallback: false,
        requiresKey: true,
        hasValidKey: true,
        badgeLabel: 'MAPTILER',
        maxZoom: 19
      };
    }

    // 3. Authenticated Mapbox API
    if (mapboxKey && mapboxKey.trim().length > 0) {
      return {
        id: 'mapbox',
        name: 'Mapbox Dark',
        url: `https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=${encodeURIComponent(mapboxKey.trim())}`,
        attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        isFallback: false,
        requiresKey: true,
        hasValidKey: true,
        badgeLabel: 'MAPBOX',
        maxZoom: 19
      };
    }

    // 4. Default Safe Fallback: OpenStreetMap Tile Layer with dark CSS filter styling
    return {
      id: 'osm_fallback',
      name: 'OpenStreetMap (Demo Fallback)',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      isFallback: true,
      requiresKey: false,
      hasValidKey: false,
      badgeLabel: 'DEMO MAP',
      subdomains: 'abc',
      maxZoom: 19
    };
  }
}

export const mapProviderService = new MapProviderService();
