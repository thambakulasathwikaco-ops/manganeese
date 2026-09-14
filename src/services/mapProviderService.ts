export interface MapProviderConfig {
  id: 'carto_dark_matter' | 'carto_voyager' | 'carto_positron';
  name: string;
  styleUrl: string;
  attribution: string;
  requiresKey: boolean;
  badgeLabel: string;
  maxZoom?: number;
  apiKey?: string;
}

export class MapProviderService {
  /**
   * Get configured map provider configuration.
   * Primary Provider: CARTO Dark Matter (Public or Authenticated vector GL style via MapLibre GL JS)
   */
  getProviderConfig(): MapProviderConfig {
    const apiKey = import.meta.env.VITE_CARTO_API_KEY;
    const hasKey = typeof apiKey === 'string' && apiKey.trim().length > 0 && apiKey !== 'YOUR_CARTO_KEY';

    const baseUrl = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
    const styleUrl = hasKey ? `${baseUrl}?api_key=${apiKey.trim()}` : baseUrl;

    return {
      id: 'carto_dark_matter',
      name: 'CARTO Dark Matter',
      styleUrl: styleUrl,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
      requiresKey: false,
      badgeLabel: hasKey ? 'CARTO GIS (AUTH)' : 'CARTO GIS MAP',
      apiKey: hasKey ? apiKey.trim() : undefined,
      maxZoom: 19
    };
  }
}

export const mapProviderService = new MapProviderService();




