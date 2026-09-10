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

export type LocationSource = 'search' | 'gps' | 'map';

export interface SelectedLocation {
  latitude: number;
  longitude: number;
  name: string;
  accuracy?: number;
  source: LocationSource;
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

