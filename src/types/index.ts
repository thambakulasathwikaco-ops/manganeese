export type PotentialLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type WeatherRisk = 'LOW' | 'MEDIUM' | 'HIGH';
export type EquipmentStatus = 'ACTIVE' | 'MAINTENANCE' | 'CRITICAL';
export type RecommendationPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type RecommendationStatus = 'pending' | 'accepted' | 'dismissed';
export type DatasetType = 'Production' | 'Equipment' | 'Weather' | 'Borehole' | 'Geological';

export interface Zone {
  zoneId: string;
  name: string;
  prospectivityScore: number;
  potentialLevel: PotentialLevel;
  confidence: number;
  geologicalScore: number;
  satelliteScore: number;
  boreholeScore: number;
  terrainScore: number;
  areaSqKm: number;
  estimatedReserveTons: number;
  manganeseGradePct: number;
  recommendation: string;
  priority: boolean;
  coordinates: [number, number][];
  center: [number, number];
}

export interface ProductionFactors {
  baseProduction: number;
  productionTarget: number;
  equipmentAvailability: number; // 0 - 100
  rainfallRiskLevel: WeatherRisk;
  blastingDelayDays: number;
  transportAvailability: number; // 0 - 100
  oreAvailability: number; // 0 - 100
  operationalFactor: number; // 0.5 - 1.5
}

export interface ProductionForecastPoint {
  date: string;
  label: string;
  historical?: number;
  forecast: number;
  target: number;
  gap: number;
}

export interface EquipmentItem {
  equipmentId: string;
  name: string;
  type: 'Excavator' | 'Dumper' | 'Drill Rig' | 'Crusher' | 'Wheel Loader';
  availability: number; // %
  utilization: number; // %
  downtimeHours: number;
  status: EquipmentStatus;
  location: string;
  lastMaintenance: string;
}

export interface WeatherDay {
  day: string;
  date: string;
  condition: string;
  rainfallMm: number;
  temperatureC: number;
  soilMoisturePct: number;
  landSurfaceTempC: number;
  weatherRisk: WeatherRisk;
}

export interface RiskContribution {
  id: string;
  factor: string;
  contributionPct: number;
  color: string;
  impactDescription: string;
}

export interface Recommendation {
  id: string;
  priority: RecommendationPriority;
  title: string;
  reason: string;
  action: string;
  impact: string;
  status: RecommendationStatus;
  createdAt: string;
  category: 'Equipment' | 'Scheduling' | 'Blasting' | 'Transport' | 'Ore' | 'General';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'risk' | 'zone' | 'equipment' | 'system' | 'ai';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface UploadedDataset {
  fileId: string;
  fileName: string;
  type: DatasetType;
  rowCount: number;
  columnCount: number;
  columns: string[];
  missingValuesCount: number;
  duplicateRowsCount: number;
  invalidValuesCount: number;
  qualityScore: number; // 0 - 100
  previewData: Record<string, any>[];
  uploadedAt: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  animationIntensity: 'low' | 'medium' | 'high';
  notificationsEnabled: boolean;
  demoMode: boolean;
}

export interface AiModelInfo {
  id: string;
  name: string;
  type: string;
  inputs: string[];
  output: string;
  purpose: string;
  algorithm: string;
  accuracyMetric: string;
  status: 'ACTIVE' | 'CALIBRATING' | 'READY';
  lastTrained: string;
}

export type DataProvenanceType = 'CONFIRMED' | 'DERIVED' | 'ESTIMATE' | 'UNAVAILABLE';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT DATA';
export type AnalysisRadiusKm = 1 | 5 | 10 | 25 | 50;

export interface DataSourceItem {
  id: string;
  sourceName: string;
  datasetName: string;
  dataType: string;
  coverage: string;
  lastUpdated: string;
  status: 'LIVE' | 'CACHE' | 'HISTORICAL' | 'UNAVAILABLE';
  url?: string;
  notes?: string;
}

export type LocationSource = 'search' | 'gps' | 'map';

export interface SelectedLocation {
  latitude: number;
  longitude: number;
  name: string;
  adminRegion?: string;
  country?: string;
  elevationMeters?: number | null;
  accuracy?: number;
  source: LocationSource;
  radiusKm: AnalysisRadiusKm;
  timestamp: string;
  dataSources?: DataSourceItem[];
}

export interface GeologyDataResult {
  rockType: string;
  unitName: string;
  ageEra: string;
  lithologyDescription: string;
  manganeseGradeStatus: DataProvenanceType;
  manganeseGradeValue: string; // e.g. "46.2% (Confirmed)" or "Unavailable - Insufficient authoritative data"
  reserveQuantityStatus: DataProvenanceType;
  reserveQuantityValue: string;
  source: string;
  isAuthoritative: boolean;
  notes: string;
}

export interface GeospatialGisResult {
  elevationMeters: number | null;
  terrainSlopeDeg: number;
  terrainCategory: 'Flat Plain' | 'Rolling Hills' | 'Rugged Ridge' | 'Plateau' | 'Escarpment';
  nearbyRoadsCount: number;
  nearestRoadDistanceKm: number;
  nearbyWaterBodiesCount: number;
  nearestWaterDistanceKm: number;
  nearbySettlementsCount: number;
  nearestSettlementDistanceKm: number;
  landUseType: string;
  accessibilityScore: number; // 0-100
  infrastructureScore: number; // 0-100
  waterProximityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  dataFreshness: string;
}

export interface SatelliteIndicatorResult {
  ndviIndex: number; // -1 to 1
  vegetationDensityText: string;
  surfaceMoistureIndex: number;
  terrainRoughnessScore: number;
  landCoverChangeRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  acquisitionDate: string;
  satelliteConstellation: string;
  label: 'Remote-sensing indicator' | 'Geospatial indicator';
  provenance: 'DERIVED' | 'UNAVAILABLE';
  notes: string;
}

export interface LocationRiskItem {
  id: string;
  category: 'Environmental' | 'Weather' | 'Accessibility' | 'Infrastructure' | 'Geological Data Confidence' | 'Operational' | 'Supply';
  level: RiskLevel;
  supportingData: string;
  timestamp: string;
  confidence: ConfidenceLevel;
  reason: string;
}

export interface LocationIntelligenceReport {
  id: string;
  location: SelectedLocation;
  analyzedAt: string;
  freshnessTag: string; // e.g. "LIVE", "UPDATED 2 MIN AGO"
  overallSuitabilityScore: number; // 0-100
  overallConfidence: ConfidenceLevel;
  
  // Confirmed & Measured Facts
  weather: any; // NormalizedWeatherData
  elevationMeters: number | null;
  adminRegion: string;
  country: string;

  // Real GIS & Topography
  gis: GeospatialGisResult;

  // Real Geological Survey query
  geology: GeologyDataResult;

  // Satellite Remote Sensing Indicators
  satellite: SatelliteIndicatorResult;

  // Dynamic Risks
  risks: LocationRiskItem[];

  // Production Logic (Explicitly actual vs estimate vs unavailable)
  productionStatus: DataProvenanceType;
  productionHeadline: string;
  productionDetails: string;

  // Structured AI Interpretation
  aiReport: {
    siteOverview: string;
    currentConditions: string;
    geologicalEvidence: string;
    remoteSensingIndicators: string;
    infrastructureAndAccess: string;
    environmentalConditions: string;
    operationalRisks: string;
    productionData: string;
    dataGaps: string[];
    confidenceAssessment: string;
    recommendedNextSteps: string[];
  };

  // Data Provenance List
  dataSources: DataSourceItem[];
}

export interface ProspectivityAnalysisResult {
  location?: SelectedLocation;
  prospectivityScore: number;
  score: number;
  potentialLevel: PotentialLevel;
  classification: PotentialLevel;
  confidence: number;
  geologicalScore: number;
  boreholeScore: number;
  satelliteScore: number;
  terrainScore: number;
  aiExplanation: string;
  recommendedAction: string;
  timestamp: string;
}

export type LocationAnalysisStatus = 'ACTIVE' | 'OPTIMIZED' | 'UNDER_REVIEW' | 'PROSPECTING' | 'FEASIBILITY';

export interface LocationAnalysisSnapshot {
  analyzedAt: string;
  suitabilityScore: number;
  productionPotential: number;
  resourcePotential: number;
  accessibilityScore: number;
  infrastructureScore: number;
  transportScore: number;
  equipmentAvailability: number;
  weatherRiskScore: number;
  operationalRisk: number;
  environmentalScore: number;
  overallScore: number;
}

export interface LocationAnalysisRecord {
  id: string;
  locationId: string;
  locationName: string;
  region: string;
  latitude: number;
  longitude: number;
  analyzedAt: string;
  lastUpdated: string;
  suitabilityScore: number;
  productionPotential: number;
  resourcePotential: number;
  accessibilityScore: number;
  infrastructureScore: number;
  transportScore: number;
  equipmentAvailability: number;
  weatherRiskScore: number;
  weatherRiskLevel: WeatherRisk;
  operationalRisk: number;
  environmentalScore: number;
  overallScore: number;
  status: LocationAnalysisStatus;
  manganeseGradePct: number;
  estimatedReserveTons: number;
  geologicalScore: number;
  boreholeScore: number;
  satelliteScore: number;
  terrainScore: number;
  recommendation: string;
  history: LocationAnalysisSnapshot[];
}




