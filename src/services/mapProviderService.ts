export interface MapProviderConfig {
  id: 'openfreemap' | 'maptiler' | 'mapbox' | 'osm_fallback';
  name: string;
  url: string;
  styleUrl: string;
  attribution: string;
  isFallback: boolean;
  requiresKey: boolean;
  badgeLabel: string;
  subdomains?: string;
  maxZoom?: number;
}

export class MapProviderService {
  /**
   * Get configured map provider configuration.
   * Primary Provider: OpenFreeMap Liberty (No API key required, public vector tiles)
   */
  getProviderConfig(): MapProviderConfig {
    return {
      id: 'openfreemap',
      name: 'OpenFreeMap Dark',
      url: 'https://tiles.openfreemap.org/styles/dark',
      styleUrl: 'https://tiles.openfreemap.org/styles/dark',
      attribution: '&copy; <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      isFallback: false,
      requiresKey: false,
      badgeLabel: 'OPEN MAP DATA',
      maxZoom: 19
    };
  }
}

export const mapProviderService = new MapProviderService();
