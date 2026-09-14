import * as maplibregl from 'maplibre-gl';

export interface MapProviderConfig {
  id: 'carto_dark_matter' | 'carto_voyager' | 'carto_positron';
  name: string;
  styleSpec: maplibregl.StyleSpecification;
  attribution: string;
  requiresKey: boolean;
  badgeLabel: string;
  maxZoom?: number;
  apiKey?: string;
}

export class MapProviderService {
  /**
   * Get configured CARTO map provider configuration with valid MapLibre StyleSpecification.
   * Primary Provider: CARTO Dark Matter (Raster Tiles via MapLibre GL JS)
   */
  getProviderConfig(variant: 'dark' | 'voyager' | 'positron' = 'dark'): MapProviderConfig {
    const rawApiKey =
      import.meta.env.VITE_CARTO_BASEMAP_API_KEY ||
      import.meta.env.VITE_CARTO_API_KEY;

    const apiKey =
      typeof rawApiKey === 'string' &&
      rawApiKey.trim().length > 0 &&
      rawApiKey !== 'YOUR_CARTO_KEY' &&
      rawApiKey !== 'your_carto_api_key_here' &&
      rawApiKey !== 'your_carto_basemap_api_key_here' &&
      rawApiKey !== 'YOUR_KEY_HERE'
        ? rawApiKey.trim()
        : undefined;

    // Development diagnostic logging (never prints the raw key string)
    if (import.meta.env.DEV) {
      if (!apiKey) {
        console.error('[CARTO GIS] CARTO basemap API key is missing. Set VITE_CARTO_BASEMAP_API_KEY in .env.local');
      } else {
        console.log('[CARTO GIS] CARTO basemap key configured: true');
      }
    }

    let tilePath = 'dark_all';
    let name = 'CARTO Dark Matter';
    if (variant === 'voyager') {
      tilePath = 'rastertiles/voyager';
      name = 'CARTO Voyager';
    } else if (variant === 'positron') {
      tilePath = 'light_all';
      name = 'CARTO Positron';
    }

    const query = apiKey ? `?key=${apiKey}` : '';

    const styleSpec: maplibregl.StyleSpecification = {
      version: 8,
      name,
      sources: {
        'carto-basemap': {
          type: 'raster',
          tiles: [
            `https://a.basemaps.cartocdn.com/${tilePath}/{z}/{x}/{y}{r}.png${query}`,
            `https://b.basemaps.cartocdn.com/${tilePath}/{z}/{x}/{y}{r}.png${query}`,
            `https://c.basemaps.cartocdn.com/${tilePath}/{z}/{x}/{y}{r}.png${query}`,
            `https://d.basemaps.cartocdn.com/${tilePath}/{z}/{x}/{y}{r}.png${query}`
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
          maxzoom: 19
        }
      },
      layers: [
        {
          id: 'carto-basemap-layer',
          type: 'raster',
          source: 'carto-basemap',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };

    return {
      id: variant === 'voyager' ? 'carto_voyager' : variant === 'positron' ? 'carto_positron' : 'carto_dark_matter',
      name,
      styleSpec,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
      requiresKey: false,
      badgeLabel: apiKey ? 'CARTO GIS (AUTH)' : 'CARTO GIS',
      apiKey: apiKey,
      maxZoom: 19
    };
  }
}

export const mapProviderService = new MapProviderService();





