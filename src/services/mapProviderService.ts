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
    const rawApiKey = import.meta.env.VITE_CARTO_API_KEY;
    const apiKey = typeof rawApiKey === 'string' && rawApiKey.trim().length > 0 && rawApiKey !== 'YOUR_CARTO_KEY'
      ? rawApiKey.trim()
      : 'cb1_3fkf_2_a80cec9067069e75330c07c1';
    const query = `?api_key=${apiKey}`;

    let tilePath = 'dark_all';
    let name = 'CARTO Dark Matter';
    if (variant === 'voyager') {
      tilePath = 'rastertiles/voyager';
      name = 'CARTO Voyager';
    } else if (variant === 'positron') {
      tilePath = 'light_all';
      name = 'CARTO Positron';
    }

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
      badgeLabel: 'CARTO GIS (AUTH)',
      apiKey: apiKey,
      maxZoom: 19
    };
  }
}

export const mapProviderService = new MapProviderService();





