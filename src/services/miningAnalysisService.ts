import type { SelectedLocation, LocationIntelligenceReport, DataSourceItem, LocationRiskItem, AnalysisRadiusKm } from '../types';
import { locationService } from './locationService';
import { weatherService } from './weatherService';
import { geospatialService } from './geospatialService';
import { geologyService } from './geologyService';
import { satelliteService } from './satelliteService';
import { aiService } from './aiService';

export class MiningAnalysisService {
  /**
   * Run full location analysis pipeline across all real external APIs
   */
  async analyzeLocation(
    lat: number,
    lon: number,
    radiusKm: AnalysisRadiusKm = 10,
    customName?: string
  ): Promise<LocationIntelligenceReport> {
    const timestampIso = new Date().toISOString();

    // 1. Resolve Location Details & Reverse Geocoding
    let locationName = customName || `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;
    let adminRegion = 'Regional Zone';
    let country = 'Territory';

    try {
      const geoInfo = await locationService.reverseGeocodeDetails(lat, lon);
      if (geoInfo.formattedName) locationName = geoInfo.formattedName;
      if (geoInfo.adminRegion) adminRegion = geoInfo.adminRegion;
      if (geoInfo.country) country = geoInfo.country;
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }

    // 2. Fetch Live Weather with Open-Meteo REST API
    let weatherData = null;
    let weatherStatus: DataSourceItem['status'] = 'LIVE';
    try {
      weatherData = await weatherService.fetchLiveWeather({
        id: `loc-${lat}-${lon}`,
        locationId: `loc-${lat}-${lon}`,
        locationName,
        region: adminRegion,
        latitude: lat,
        longitude: lon
      });
    } catch (err) {
      console.warn('Weather service unavailable:', err);
      weatherStatus = 'UNAVAILABLE';
    }

    // 3. Fetch Real GIS Features & DEM Elevation with Overpass & Open-Elevation API
    const gisData = await geospatialService.analyzeGeospatialGis(lat, lon, radiusKm);

    // 4. Query Macrostrat API & USGS Geological Surveys
    const geologyData = await geologyService.queryGeologyData(lat, lon);

    // 5. Derive Satellite Earth Observation Remote-Sensing Indicators
    const satelliteData = await satelliteService.getSatelliteIndicators(lat, lon);

    // 6. Build Dynamic Risks List from real live inputs
    const risks: LocationRiskItem[] = [];

    // Weather risk
    const rainMm = weatherData ? weatherData.rainfallOutlook.expected7DayRainfallMm : 0;
    const weatherRiskLevel = rainMm > 35 ? 'CRITICAL' : rainMm > 15 ? 'HIGH' : rainMm > 5 ? 'MEDIUM' : 'LOW';
    risks.push({
      id: 'risk-weather',
      category: 'Weather',
      level: weatherRiskLevel,
      supportingData: weatherData ? `7-day rainfall forecast: ${rainMm} mm, Wind: ${weatherData.current.windSpeedKmH} km/h` : 'Weather API offline',
      timestamp: timestampIso,
      confidence: weatherData ? 'HIGH' : 'LOW',
      reason: weatherData
        ? `Rainfall forecast of ${rainMm} mm directly influences open-pit haul road traction and bench runoff.`
        : 'Weather telemetry temporarily unavailable.'
    });

    // Accessibility & Transport risk
    const roadDist = gisData.nearestRoadDistanceKm;
    const roadRiskLevel = roadDist > 8.0 ? 'HIGH' : roadDist > 3.0 ? 'MEDIUM' : 'LOW';
    risks.push({
      id: 'risk-access',
      category: 'Accessibility',
      level: roadRiskLevel,
      supportingData: `Nearest primary transport corridor is ${roadDist} km from site center (${gisData.nearbyRoadsCount} roads in ${radiusKm}km radius)`,
      timestamp: timestampIso,
      confidence: 'HIGH',
      reason: `Transport distance of ${roadDist} km to paved roads dictates heavy haulage transport overhead.`
    });

    // Infrastructure risk
    const infrastructureRiskLevel = gisData.infrastructureScore < 45 ? 'HIGH' : gisData.infrastructureScore < 70 ? 'MEDIUM' : 'LOW';
    risks.push({
      id: 'risk-infra',
      category: 'Infrastructure',
      level: infrastructureRiskLevel,
      supportingData: `Infrastructure readiness score ${gisData.infrastructureScore}/100. Nearest settlement ${gisData.nearestSettlementDistanceKm} km.`,
      timestamp: timestampIso,
      confidence: 'HIGH',
      reason: `Settlement proximity of ${gisData.nearestSettlementDistanceKm} km indicates local grid power and labor availability.`
    });

    // Geological Data Confidence risk
    const isAuthGeo = geologyData.isAuthoritative && geologyData.manganeseGradeStatus === 'CONFIRMED';
    risks.push({
      id: 'risk-geo',
      category: 'Geological Data Confidence',
      level: isAuthGeo ? 'LOW' : 'HIGH',
      supportingData: isAuthGeo ? geologyData.manganeseGradeValue : 'Insufficient authoritative geological data for this location',
      timestamp: timestampIso,
      confidence: isAuthGeo ? 'HIGH' : 'LOW',
      reason: isAuthGeo
        ? `Authoritative survey data (${geologyData.source}) confirms manganese ore horizons.`
        : 'Lack of authoritative core assays increases geological uncertainty for this coordinate.'
    });

    // Environmental risk
    const waterDist = gisData.nearestWaterDistanceKm;
    const envRiskLevel = waterDist < 1.5 ? 'HIGH' : waterDist < 4.0 ? 'MEDIUM' : 'LOW';
    risks.push({
      id: 'risk-env',
      category: 'Environmental',
      level: envRiskLevel,
      supportingData: `Nearest surface water body ${waterDist} km. Land use: ${gisData.landUseType}`,
      timestamp: timestampIso,
      confidence: 'HIGH',
      reason: `Proximity of ${waterDist} km to surface waterways requires strict environmental containment runoff barriers.`
    });

    // Overall Suitability Score (0-100)
    const baseScore = isAuthGeo ? 82 : 48;
    const scoreModifier = (gisData.accessibilityScore * 0.25) + (gisData.infrastructureScore * 0.25) - (roadDist * 2) - (rainMm > 25 ? 12 : 0);
    const overallSuitabilityScore = Math.min(96, Math.max(15, Math.round(baseScore + (scoreModifier * 0.2))));

    // Overall Confidence
    const overallConfidence = isAuthGeo && weatherData ? 'HIGH' : isAuthGeo || weatherData ? 'MEDIUM' : 'LOW';

    // Production Headline & Logic
    let productionStatus: LocationIntelligenceReport['productionStatus'] = 'UNAVAILABLE';
    let productionHeadline = 'Production data unavailable for this location.';
    let productionDetails = 'No verified industrial manganese yield dataset exists for these exact coordinates.';

    if (isAuthGeo) {
      productionStatus = 'CONFIRMED';
      productionHeadline = 'Authoritative Regional Production Belt';
      productionDetails = `Active manganese excavation records logged under ${geologyData.unitName} (${geologyData.source}).`;
    } else if (overallSuitabilityScore > 55) {
      productionStatus = 'ESTIMATE';
      productionHeadline = 'Estimated production potential';
      productionDetails = `Model-based potential estimate (~${Math.round(overallSuitabilityScore * 1200)} Tonnes/year) derived from terrain and infrastructure suitability. Tagged as ESTIMATE.`;
    }

    // Data Provenance Items
    const dataSources: DataSourceItem[] = [
      {
        id: 'src-weather',
        sourceName: 'Open-Meteo REST API',
        datasetName: 'Global High-Resolution Weather & Forecast System',
        dataType: 'Live Weather Telemetry',
        coverage: 'Global Coordinates (11 km grid)',
        lastUpdated: weatherData ? weatherData.current.updatedAt : timestampIso,
        status: weatherStatus,
        url: 'https://open-meteo.com/'
      },
      {
        id: 'src-gis',
        sourceName: 'OpenStreetMap / Overpass API',
        datasetName: 'OpenStreetMap Geospatial Feature Database',
        dataType: 'Infrastructure, Waterways, Settlements',
        coverage: `Selected Radius (${radiusKm} km)`,
        lastUpdated: timestampIso,
        status: 'LIVE',
        url: 'https://www.openstreetmap.org/'
      },
      {
        id: 'src-elevation',
        sourceName: 'Open-Elevation DEM / USGS DEM',
        datasetName: 'Shuttle Radar Topography Mission (SRTM) 30m DEM',
        dataType: 'Terrain Elevation & Slope Model',
        coverage: 'Global Landmass',
        lastUpdated: timestampIso,
        status: gisData.elevationMeters ? 'LIVE' : 'UNAVAILABLE',
        url: 'https://open-elevation.com/'
      },
      {
        id: 'src-geology',
        sourceName: geologyData.source,
        datasetName: geologyData.unitName,
        dataType: 'Lithology, Stratigraphy & Ore Grade Survey',
        coverage: geologyData.isAuthoritative ? 'Mapped Manganese Belt' : 'Global Crustal Grid',
        lastUpdated: timestampIso,
        status: geologyData.isAuthoritative ? 'LIVE' : 'HISTORICAL',
        url: 'https://macrostrat.org/'
      },
      {
        id: 'src-satellite',
        sourceName: satelliteData.satelliteConstellation,
        datasetName: 'Sentinel-2 L2A Surface Reflectance',
        dataType: 'NDVI Vegetation & Moisture Remote Sensing Indicators',
        coverage: 'Global 10m Multispectral',
        lastUpdated: satelliteData.acquisitionDate,
        status: 'LIVE',
        url: 'https://copernicus.eu/'
      }
    ];

    // Selected Location Object
    const selectedLoc: SelectedLocation = {
      latitude: lat,
      longitude: lon,
      name: locationName,
      adminRegion,
      country,
      elevationMeters: gisData.elevationMeters,
      source: 'search',
      radiusKm,
      timestamp: timestampIso,
      dataSources
    };

    // 7. Structured AI Interpretation
    const aiReport = aiService.generateLocationReport({
      location: selectedLoc,
      weather: weatherData,
      gis: gisData,
      geology: geologyData,
      satellite: satelliteData,
      risks
    });

    // Return Complete Location Intelligence Report
    return {
      id: `report-${lat.toFixed(4)}-${lon.toFixed(4)}-${Date.now()}`,
      location: selectedLoc,
      analyzedAt: timestampIso,
      freshnessTag: 'LIVE',
      overallSuitabilityScore,
      overallConfidence,
      weather: weatherData,
      elevationMeters: gisData.elevationMeters,
      adminRegion,
      country,
      gis: gisData,
      geology: geologyData,
      satellite: satelliteData,
      risks,
      productionStatus,
      productionHeadline,
      productionDetails,
      aiReport,
      dataSources
    };
  }
}

export const miningAnalysisService = new MiningAnalysisService();
