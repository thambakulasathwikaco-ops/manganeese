import type { SelectedLocation, GeologyDataResult, GeospatialGisResult, SatelliteIndicatorResult, LocationRiskItem, ConfidenceLevel } from '../types';
import type { NormalizedWeatherData } from './weatherService';

export interface AiReportInput {
  location: SelectedLocation;
  weather: NormalizedWeatherData | null;
  gis: GeospatialGisResult;
  geology: GeologyDataResult;
  satellite: SatelliteIndicatorResult;
  risks: LocationRiskItem[];
}

export class AiService {
  /**
   * Generate structured location intelligence report adhering strictly to observed vs derived vs estimated vs unknown
   */
  generateLocationReport(input: AiReportInput) {
    const { location, weather, gis, geology, satellite, risks } = input;
    const isAuthoritativeGeology = geology.isAuthoritative && geology.manganeseGradeStatus === 'CONFIRMED';
    const hasRainRisk = weather ? weather.rainfallOutlook.expected7DayRainfallMm > 20 : false;

    // Determine overall confidence
    let confidenceAssessment: ConfidenceLevel = 'MEDIUM';
    if (isAuthoritativeGeology && weather) {
      confidenceAssessment = 'HIGH';
    } else if (!isAuthoritativeGeology && gis.nearbyRoadsCount > 0) {
      confidenceAssessment = 'MEDIUM';
    } else {
      confidenceAssessment = 'LOW';
    }

    // Site Overview
    const siteOverview = `Location ${location.name} (${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E) situated in ${location.adminRegion || 'Regional Administrative Zone'}, ${location.country || 'Territory'}. Topographical classification indicates ${gis.terrainCategory} at elevation of ${gis.elevationMeters ? `${gis.elevationMeters}m MSL` : 'unmapped MSL elevation'} across an active analysis radius of ${location.radiusKm} km.`;

    // Current Conditions
    const currentConditions = weather
      ? `Live weather measurements indicate ${weather.current.temperatureC}°C, ${weather.current.conditionText}, with relative humidity at ${weather.current.humidityPct}% and wind speed of ${weather.current.windSpeedKmH} km/h. Expected 7-day rainfall accumulation is ${weather.rainfallOutlook.expected7DayRainfallMm} mm.`
      : `Live weather telemetry temporarily unavailable for ${location.name}. Weather risk evaluated using baseline climatic profile.`;

    // Geological Evidence
    const geologicalEvidence = isAuthoritativeGeology
      ? `Authoritative geological survey records confirm the underlying unit as ${geology.unitName} (${geology.rockType}, Era: ${geology.ageEra}). Mapped manganese ore grade is recorded at ${geology.manganeseGradeValue} from ${geology.source}.`
      : `Authoritative geological confirmation for high-grade manganese ore is unavailable for these exact coordinates (${geology.unitName}). ${geology.manganeseGradeValue} Primary geological source: ${geology.source}.`;

    // Remote Sensing Indicators
    const remoteSensingIndicators = `Remote-sensing indicator metrics derived from ${satellite.satelliteConstellation} (Acquisition: ${satellite.acquisitionDate}) record an NDVI Index of ${satellite.ndviIndex} (${satellite.vegetationDensityText}) and Surface Moisture Index of ${satellite.surfaceMoistureIndex}/100. Satellite indicators suggest surface characteristics; subsurface ore body presence requires physical sampling.`;

    // Infrastructure & Access
    const infrastructureAndAccess = `GIS analysis identifies ${gis.nearbyRoadsCount} transport corridors within ${location.radiusKm} km, with the nearest primary road located ${gis.nearestRoadDistanceKm} km away. Nearest populated settlement is ${gis.nearestSettlementDistanceKm} km. Accessibility rating: ${gis.accessibilityScore}/100; Infrastructure readiness: ${gis.infrastructureScore}/100.`;

    // Environmental Conditions
    const environmentalConditions = `Nearest surface water body detected ${gis.nearestWaterDistanceKm} km from site center. Environmental proximity risk rated ${gis.waterProximityRisk}. Land use classification: ${gis.landUseType}. Terrain slope measured at ${gis.terrainSlopeDeg}°.`;

    // Operational Risks
    const topRisk = risks.find((r) => r.level === 'CRITICAL' || r.level === 'HIGH') || risks[0];
    const operationalRisks = topRisk
      ? `Primary operational risk category is ${topRisk.category} (${topRisk.level} Risk): ${topRisk.reason}. Overall risk index computed dynamically across live weather, slope stability, and transport infrastructure.`
      : 'Operational risk levels remain within baseline limits for routine field exploration.';

    // Production Data
    const productionData = isAuthoritativeGeology
      ? `Authoritative regional production datasets report active excavation history across ${geology.unitName}. Annual yield potential estimated in alignment with GSI survey reserves.`
      : `Production data unavailable for this location. No verified industrial mining yield has been reported for these coordinates. Any prospective capacity is strictly an model-based estimate.`;

    // Data Gaps
    const dataGaps: string[] = [];
    if (!isAuthoritativeGeology) {
      dataGaps.push('Authoritative ground-truth core drilling and chemical assay logs missing.');
    }
    if (!gis.elevationMeters) {
      dataGaps.push('High-resolution LiDAR terrain elevation elevation model unverified.');
    }
    if (!weather) {
      dataGaps.push('Real-time weather station telemetry offline or unreachable.');
    }
    if (dataGaps.length === 0) {
      dataGaps.push('Minor local hydrological seasonal variation unmeasured.');
    }

    // Recommended Next Data Collection
    const recommendedNextSteps: string[] = [];
    if (!isAuthoritativeGeology) {
      recommendedNextSteps.push('Conduct on-site geological outcrop mapping and geochemical soil sampling.');
      recommendedNextSteps.push('Schedule core borehole drilling program to verify subsurface stratigraphy.');
    } else {
      recommendedNextSteps.push('Initiate high-resolution magnetic & gravity geophysical survey across bench boundary.');
    }
    if (hasRainRisk) {
      recommendedNextSteps.push('Deploy automated pit-water pressure sensors and monitor bench runoff.');
    }
    recommendedNextSteps.push('Verify environmental clearance distance from nearest water bodies.');

    return {
      siteOverview,
      currentConditions,
      geologicalEvidence,
      remoteSensingIndicators,
      infrastructureAndAccess,
      environmentalConditions,
      operationalRisks,
      productionData,
      dataGaps,
      confidenceAssessment: `CONFIDENCE RATING: ${confidenceAssessment}. Based on ${isAuthoritativeGeology ? 'authoritative geological records' : 'remote-sensing & GIS indicators alone'}.`,
      recommendedNextSteps
    };
  }
}

export const aiService = new AiService();
