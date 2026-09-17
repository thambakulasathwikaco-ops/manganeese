import * as maplibregl from 'maplibre-gl';

export interface MapProviderConfig {
  id: 'openfreemap_dark' | 'openfreemap_liberty' | 'openfreemap_bright';
  name: string;
  style: string | maplibregl.StyleSpecification;
  styleSpec: string | maplibregl.StyleSpecification;
  attribution: string;
  requiresKey: boolean;
  badgeLabel: string;
  maxZoom?: number;
  apiKey?: string;
}

export class MapProviderService {
  /**
   * Get open, keyless MapLibre vector map provider configuration (OpenFreeMap).
   * Guarantees 100% watermark-free map rendering on both localhost and production Vercel builds.
   */
  getProviderConfig(variant: 'dark' | 'voyager' | 'positron' = 'dark'): MapProviderConfig {
    let styleUrl = 'https://tiles.openfreemap.org/styles/dark';
    let name = 'OpenFreeMap Dark';
    let id: 'openfreemap_dark' | 'openfreemap_liberty' | 'openfreemap_bright' = 'openfreemap_dark';

    if (variant === 'voyager') {
      styleUrl = 'https://tiles.openfreemap.org/styles/liberty';
      name = 'OpenFreeMap Liberty';
      id = 'openfreemap_liberty';
    } else if (variant === 'positron') {
      styleUrl = 'https://tiles.openfreemap.org/styles/bright';
      name = 'OpenFreeMap Bright';
      id = 'openfreemap_bright';
    }

    const attribution = '&copy; <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

    return {
      id,
      name,
      style: styleUrl,
      styleSpec: styleUrl,
      attribution,
      requiresKey: false,
      badgeLabel: 'OPEN MAP DATA',
      apiKey: undefined,
      maxZoom: 19
    };
  }
}

export const mapProviderService = new MapProviderService();





