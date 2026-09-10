export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedName: string;
}

export class LocationService {
  /**
   * Validate and parse string input into coordinates if valid
   */
  parseCoordinates(input: string): { latitude: number; longitude: number } | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Remove degree symbols and compass directions if any, e.g. "21.1458 N, 79.0882 E" or "21.1458, 79.0882"
    const cleaned = trimmed.replace(/[°º]/g, '');
    const parts = cleaned.split(/[,;\s]+/).filter(Boolean);

    if (parts.length < 2) return null;

    let latStr = parts[0];
    let lonStr = parts[1];

    let latDir = 1;
    let lonDir = 1;

    if (latStr.toUpperCase().endsWith('S')) {
      latDir = -1;
      latStr = latStr.slice(0, -1);
    } else if (latStr.toUpperCase().endsWith('N')) {
      latStr = latStr.slice(0, -1);
    }

    if (lonStr.toUpperCase().endsWith('W')) {
      lonDir = -1;
      lonStr = lonStr.slice(0, -1);
    } else if (lonStr.toUpperCase().endsWith('E')) {
      lonStr = lonStr.slice(0, -1);
    }

    const lat = parseFloat(latStr) * latDir;
    const lon = parseFloat(lonStr) * lonDir;

    if (isNaN(lat) || isNaN(lon)) return null;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

    return {
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4))
    };
  }

  /**
   * Search location by place name or coordinates using Nominatim OpenStreetMap API
   */
  async searchLocation(query: string): Promise<GeocodingResult> {
    const parsedCoords = this.parseCoordinates(query);
    if (parsedCoords) {
      // It's valid coordinates! Let's attempt reverse geocode for a nice display name, fallback to coords
      try {
        const address = await this.reverseGeocode(parsedCoords.latitude, parsedCoords.longitude);
        return {
          latitude: parsedCoords.latitude,
          longitude: parsedCoords.longitude,
          formattedName: address
        };
      } catch {
        return {
          latitude: parsedCoords.latitude,
          longitude: parsedCoords.longitude,
          formattedName: `${parsedCoords.latitude}° N, ${parsedCoords.longitude}° E`
        };
      }
    }

    // Otherwise search via Nominatim
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MoilSmartMineAI/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding HTTP error status ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Location could not be found. Try a different location or enter coordinates.');
      }

      const item = data[0];
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);

      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Invalid coordinate response from geocoding service.');
      }

      // Format location name cleanly
      const nameParts = (item.display_name || query).split(',');
      const shortName = nameParts.slice(0, 3).join(',').trim();

      return {
        latitude: Number(lat.toFixed(4)),
        longitude: Number(lon.toFixed(4)),
        formattedName: shortName
      };
    } catch (err: any) {
      if (err.message && err.message.includes('Location could not be found')) {
        throw err;
      }
      throw new Error('Location could not be found. Try a different location or enter coordinates.');
    }
  }

  /**
   * Reverse geocode coordinates into a human-readable location name
   */
  async reverseGeocode(lat: number, lon: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MoilSmartMineAI/1.0'
        }
      });

      if (!response.ok) {
        return `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;
      }

      const data = await response.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        return parts.slice(0, 3).join(',').trim();
      }
    } catch {
      // Fallback
    }

    return `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;
  }

  /**
   * Request GPS coordinates using browser Geolocation API
   */
  getCurrentGpsLocation(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Unable to determine your current location. Browser does not support Geolocation.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: Number(position.coords.latitude.toFixed(4)),
            longitude: Number(position.coords.longitude.toFixed(4)),
            accuracy: Math.round(position.coords.accuracy)
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('LOCATION ACCESS DENIED: Location access was denied. Enter a location manually or select a point on the map.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Unable to determine your current location. Position signal unavailable.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out. Please try again.'));
              break;
            default:
              reject(new Error('Unable to determine your current location.'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }
}

export const locationService = new LocationService();
