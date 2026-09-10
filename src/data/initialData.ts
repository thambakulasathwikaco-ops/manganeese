import type { AiModelInfo, EquipmentItem, ProductionFactors, WeatherDay, Zone } from '../types';

export const INITIAL_PRODUCTION_FACTORS: ProductionFactors = {
  baseProduction: 9200,
  productionTarget: 9500,
  equipmentAvailability: 78,
  rainfallRiskLevel: 'MEDIUM',
  blastingDelayDays: 4,
  transportAvailability: 85,
  oreAvailability: 82,
  operationalFactor: 1.0
};

// 12 synthetic demo zones around Nagpur / Bhandara / Balaghat manganese mining belt (Dongri Buzurg, Mansar, Chikla)
export const INITIAL_ZONES: Zone[] = [
  {
    zoneId: 'ZONE-A17',
    name: 'Dongri East Main Bench',
    prospectivityScore: 88,
    potentialLevel: 'HIGH',
    confidence: 94,
    geologicalScore: 92,
    satelliteScore: 85,
    boreholeScore: 90,
    terrainScore: 82,
    areaSqKm: 4.8,
    estimatedReserveTons: 1250000,
    manganeseGradePct: 46.2,
    recommendation: 'Priority excavation zone. High core recovery with 46%+ Mn grade.',
    priority: true,
    center: [21.5333, 79.7167],
    coordinates: [
      [21.5360, 79.7140],
      [21.5360, 79.7190],
      [21.5310, 79.7190],
      [21.5310, 79.7140]
    ]
  },
  {
    zoneId: 'ZONE-B04',
    name: 'Mansar North Extension',
    prospectivityScore: 79,
    potentialLevel: 'HIGH',
    confidence: 89,
    geologicalScore: 84,
    satelliteScore: 78,
    boreholeScore: 82,
    terrainScore: 70,
    areaSqKm: 3.2,
    estimatedReserveTons: 890000,
    manganeseGradePct: 43.8,
    recommendation: 'Secondary bench development recommended. Minor silica inclusion.',
    priority: true,
    center: [21.3917, 79.4417],
    coordinates: [
      [21.3940, 79.4390],
      [21.3940, 79.4440],
      [21.3890, 79.4440],
      [21.3890, 79.4390]
    ]
  },
  {
    zoneId: 'ZONE-C12',
    name: 'Chikla Deep Horizon',
    prospectivityScore: 64,
    potentialLevel: 'MEDIUM',
    confidence: 82,
    geologicalScore: 68,
    satelliteScore: 62,
    boreholeScore: 65,
    terrainScore: 60,
    areaSqKm: 6.1,
    estimatedReserveTons: 640000,
    manganeseGradePct: 38.5,
    recommendation: 'Moderate prospectivity. Requires deep infill drilling before bench development.',
    priority: false,
    center: [21.5500, 79.7500],
    coordinates: [
      [21.5530, 79.7470],
      [21.5530, 79.7530],
      [21.5470, 79.7530],
      [21.5470, 79.7470]
    ]
  },
  {
    zoneId: 'ZONE-D08',
    name: 'Tirodi South Outcrop',
    prospectivityScore: 92,
    potentialLevel: 'HIGH',
    confidence: 96,
    geologicalScore: 95,
    satelliteScore: 90,
    boreholeScore: 94,
    terrainScore: 88,
    areaSqKm: 5.4,
    estimatedReserveTons: 1680000,
    manganeseGradePct: 48.1,
    recommendation: 'Highest priority deposit. Exceptional high-grade battery grade manganese core.',
    priority: true,
    center: [21.6833, 79.7167],
    coordinates: [
      [21.6860, 79.7130],
      [21.6860, 79.7200],
      [21.6800, 79.7200],
      [21.6800, 79.7130]
    ]
  },
  {
    zoneId: 'ZONE-E02',
    name: 'Ukwa East Overburden Zone',
    prospectivityScore: 32,
    potentialLevel: 'LOW',
    confidence: 76,
    geologicalScore: 35,
    satelliteScore: 30,
    boreholeScore: 28,
    terrainScore: 38,
    areaSqKm: 2.9,
    estimatedReserveTons: 120000,
    manganeseGradePct: 24.5,
    recommendation: 'Low potential. High waste-to-ore stripping ratio. Postpone excavation.',
    priority: false,
    center: [21.9667, 80.4667],
    coordinates: [
      [21.9690, 80.4630],
      [21.9690, 80.4700],
      [21.9630, 80.4700],
      [21.9630, 80.4630]
    ]
  },
  {
    zoneId: 'ZONE-F15',
    name: 'Bharweli Shaft-4 Extension',
    prospectivityScore: 85,
    potentialLevel: 'HIGH',
    confidence: 91,
    geologicalScore: 88,
    satelliteScore: 82,
    boreholeScore: 86,
    terrainScore: 84,
    areaSqKm: 4.1,
    estimatedReserveTons: 1420000,
    manganeseGradePct: 45.4,
    recommendation: 'High reserve density. Underground drift expansion currently underway.',
    priority: false,
    center: [21.8000, 80.2167],
    coordinates: [
      [21.8030, 80.2130],
      [21.8030, 80.2200],
      [21.7970, 80.2200],
      [21.7970, 80.2130]
    ]
  },
  {
    zoneId: 'ZONE-G09',
    name: 'Gumgaon Reserve Ridge',
    prospectivityScore: 58,
    potentialLevel: 'MEDIUM',
    confidence: 84,
    geologicalScore: 60,
    satelliteScore: 55,
    boreholeScore: 62,
    terrainScore: 54,
    areaSqKm: 3.8,
    estimatedReserveTons: 490000,
    manganeseGradePct: 36.2,
    recommendation: 'Medium grade ferruginous manganese ore. Suitable for blending.',
    priority: false,
    center: [21.3833, 79.1167],
    coordinates: [
      [21.3860, 79.1130],
      [21.3860, 79.1200],
      [21.3800, 79.1200],
      [21.3800, 79.1130]
    ]
  },
  {
    zoneId: 'ZONE-H11',
    name: 'Ramtek West Flank',
    prospectivityScore: 45,
    potentialLevel: 'MEDIUM',
    confidence: 79,
    geologicalScore: 48,
    satelliteScore: 42,
    boreholeScore: 46,
    terrainScore: 44,
    areaSqKm: 5.0,
    estimatedReserveTons: 380000,
    manganeseGradePct: 32.8,
    recommendation: 'Moderate potential with heavy overburden. Further geophysical survey required.',
    priority: false,
    center: [21.4000, 79.3333],
    coordinates: [
      [21.4030, 79.3300],
      [21.4030, 79.3370],
      [21.3970, 79.3370],
      [21.3970, 79.3300]
    ]
  },
  {
    zoneId: 'ZONE-I03',
    name: 'Kandri Deep Pit',
    prospectivityScore: 76,
    potentialLevel: 'HIGH',
    confidence: 88,
    geologicalScore: 80,
    satelliteScore: 74,
    boreholeScore: 78,
    terrainScore: 72,
    areaSqKm: 2.7,
    estimatedReserveTons: 780000,
    manganeseGradePct: 42.0,
    recommendation: 'Solid high-grade zone. Requires slope stability monitoring before deep stripping.',
    priority: false,
    center: [21.4167, 79.2667],
    coordinates: [
      [21.4190, 79.2630],
      [21.4190, 79.2700],
      [21.4130, 79.2700],
      [21.4130, 79.2630]
    ]
  },
  {
    zoneId: 'ZONE-J19',
    name: 'Sitasaongi North Block',
    prospectivityScore: 28,
    potentialLevel: 'LOW',
    confidence: 72,
    geologicalScore: 30,
    satelliteScore: 25,
    boreholeScore: 29,
    terrainScore: 28,
    areaSqKm: 4.3,
    estimatedReserveTons: 95000,
    manganeseGradePct: 22.0,
    recommendation: 'Low grade siliceous horizon. High silica impurity levels.',
    priority: false,
    center: [21.5167, 79.7833],
    coordinates: [
      [21.5190, 79.7800],
      [21.5190, 79.7870],
      [21.5130, 79.7870],
      [21.5130, 79.7800]
    ]
  },
  {
    zoneId: 'ZONE-K06',
    name: 'Miragpur Prospecting Block',
    prospectivityScore: 52,
    potentialLevel: 'MEDIUM',
    confidence: 81,
    geologicalScore: 55,
    satelliteScore: 50,
    boreholeScore: 54,
    terrainScore: 48,
    areaSqKm: 3.5,
    estimatedReserveTons: 410000,
    manganeseGradePct: 35.1,
    recommendation: 'Balanced medium grade deposit. Exploration borehole drilling ongoing.',
    priority: false,
    center: [21.6333, 79.8000],
    coordinates: [
      [21.6360, 79.7970],
      [21.6360, 79.8030],
      [21.6300, 79.8030],
      [21.6300, 79.7970]
    ]
  },
  {
    zoneId: 'ZONE-L22',
    name: 'Bhandara South Buffer',
    prospectivityScore: 19,
    potentialLevel: 'LOW',
    confidence: 68,
    geologicalScore: 22,
    satelliteScore: 18,
    boreholeScore: 20,
    terrainScore: 16,
    areaSqKm: 6.8,
    estimatedReserveTons: 50000,
    manganeseGradePct: 18.4,
    recommendation: 'Sterile overburden zone. Non-economic mineralization.',
    priority: false,
    center: [21.1667, 79.6500],
    coordinates: [
      [21.1690, 79.6470],
      [21.1690, 79.6530],
      [21.1630, 79.6530],
      [21.1630, 79.6470]
    ]
  }
];

export const INITIAL_EQUIPMENT: EquipmentItem[] = [
  { equipmentId: 'EX-01', name: 'CAT 349 Heavy Hydraulic Excavator', type: 'Excavator', availability: 88, utilization: 84, downtimeHours: 4, status: 'ACTIVE', location: 'Dongri East Bench #3', lastMaintenance: '2026-09-02' },
  { equipmentId: 'EX-04', name: 'Komatsu PC1250 Mining Shovel', type: 'Excavator', availability: 62, utilization: 55, downtimeHours: 18, status: 'MAINTENANCE', location: 'Mansar North Pit', lastMaintenance: '2026-08-28' },
  { equipmentId: 'DP-01', name: 'Volvo FMX 460 8x4 Mining Dumper', type: 'Dumper', availability: 92, utilization: 88, downtimeHours: 2, status: 'ACTIVE', location: 'Dongri Haul Road A', lastMaintenance: '2026-09-05' },
  { equipmentId: 'DP-04', name: 'Scania P440 Mining Tipper', type: 'Dumper', availability: 45, utilization: 40, downtimeHours: 32, status: 'CRITICAL', location: 'Chikla Maintenance Shed', lastMaintenance: '2026-08-20' },
  { equipmentId: 'DR-01', name: 'Epiroc FlexiROC T45 Drill Rig', type: 'Drill Rig', availability: 85, utilization: 79, downtimeHours: 6, status: 'ACTIVE', location: 'Tirodi South Bench #2', lastMaintenance: '2026-09-01' },
  { equipmentId: 'DR-03', name: 'Sandvik DI550 Surface Drill', type: 'Drill Rig', availability: 70, utilization: 65, downtimeHours: 12, status: 'MAINTENANCE', location: 'Bharweli Pit Wall', lastMaintenance: '2026-08-30' },
  { equipmentId: 'CR-01', name: 'Metso Outotec Jaw Crusher C130', type: 'Crusher', availability: 95, utilization: 91, downtimeHours: 1, status: 'ACTIVE', location: 'Dongri Secondary Plant', lastMaintenance: '2026-09-07' },
  { equipmentId: 'CR-02', name: 'Terex Finlay Cone Crusher 1540', type: 'Crusher', availability: 78, utilization: 72, downtimeHours: 8, status: 'ACTIVE', location: 'Mansar Stockyard', lastMaintenance: '2026-09-03' },
  { equipmentId: 'WL-01', name: 'CAT 988K Heavy Wheel Loader', type: 'Wheel Loader', availability: 82, utilization: 78, downtimeHours: 5, status: 'ACTIVE', location: 'Dongri Siding #1', lastMaintenance: '2026-09-04' },
  { equipmentId: 'WL-02', name: 'Komatsu WA500 Wheel Loader', type: 'Wheel Loader', availability: 68, utilization: 60, downtimeHours: 14, status: 'MAINTENANCE', location: 'Chikla Stockyard', lastMaintenance: '2026-08-25' }
];

export const INITIAL_WEATHER: WeatherDay[] = [
  { day: 'Wed', date: 'Sep 09', condition: 'Thunderstorm & Rain', rainfallMm: 28.4, temperatureC: 27, soilMoisturePct: 78, landSurfaceTempC: 25.4, weatherRisk: 'HIGH' },
  { day: 'Thu', date: 'Sep 10', condition: 'Moderate Rain', rainfallMm: 16.2, temperatureC: 28, soilMoisturePct: 72, landSurfaceTempC: 26.8, weatherRisk: 'MEDIUM' },
  { day: 'Fri', date: 'Sep 11', condition: 'Scattered Showers', rainfallMm: 8.5, temperatureC: 29, soilMoisturePct: 65, landSurfaceTempC: 28.1, weatherRisk: 'MEDIUM' },
  { day: 'Sat', date: 'Sep 12', condition: 'Partly Cloudy', rainfallMm: 2.1, temperatureC: 31, soilMoisturePct: 54, landSurfaceTempC: 30.5, weatherRisk: 'LOW' },
  { day: 'Sun', date: 'Sep 13', condition: 'Sunny & Clear', rainfallMm: 0.0, temperatureC: 33, soilMoisturePct: 46, landSurfaceTempC: 32.8, weatherRisk: 'LOW' },
  { day: 'Mon', date: 'Sep 14', condition: 'Clear', rainfallMm: 0.0, temperatureC: 34, soilMoisturePct: 40, landSurfaceTempC: 33.4, weatherRisk: 'LOW' },
  { day: 'Tue', date: 'Sep 15', condition: 'Partly Cloudy', rainfallMm: 1.4, temperatureC: 32, soilMoisturePct: 42, landSurfaceTempC: 31.9, weatherRisk: 'LOW' }
];

export const AI_MODELS: AiModelInfo[] = [
  {
    id: 'model-prospectivity',
    name: 'MOIL Manganese Prospectivity Ensemble (MPE-v4)',
    type: 'Spatial Ensemble (Gradient Boosting + CNN Feature Extractor)',
    inputs: ['Geological Core Assays (35%)', 'Borehole Stratigraphy (30%)', 'Sentinel-2 Multi-spectral Reflectance (20%)', 'DEM Terrain Elevation (15%)'],
    output: 'Prospectivity Index (0-100) & Reserve Classification',
    purpose: 'Predicts high-potential manganese deposits across exploration blocks to prioritize drilling capital.',
    algorithm: 'XGBoost Spatial Classifier + Airborne Magnetic Anomaly Overlay',
    accuracyMetric: 'AUC-ROC: 0.942 | F1-Score: 0.891',
    status: 'ACTIVE',
    lastTrained: '2026-08-15'
  },
  {
    id: 'model-forecast',
    name: 'MOIL Production Shortfall Predictor (PSP-v2)',
    type: 'Multi-Variate Time-Series Regressor',
    inputs: ['Historical Pit Tonnage', 'Fleet Availability %', 'Monsoon Rainfall Risk', 'Blasting Cycle Latency', 'Rail Rake Allocation'],
    output: '30-Day Tonnage Forecast & Shortfall Variance (MT)',
    purpose: 'Forecasts 30-day pit-level manganese output to proactively identify target shortfalls.',
    algorithm: 'Temporal Fusion Transformer (TFT) + Multi-Factor Scaling',
    accuracyMetric: 'MAPE: 3.42% | RMSE: 184.2 MT',
    status: 'ACTIVE',
    lastTrained: '2026-08-28'
  },
  {
    id: 'model-risk',
    name: 'MOIL Operational Risk Attribution Engine (RAE-v3)',
    type: 'Monte Carlo Sensitivity & Factor Decomposition',
    inputs: ['Real-time Fleet Telemetry', 'Weather Radar Feed', 'Explosive Permit Logs', 'Siding Wagon Queue'],
    output: 'Shortfall Severity (LOW/MED/HIGH/CRITICAL) & Factor % Breakdown',
    purpose: 'Decomposes production shortfall into normalized operational bottleneck risk percentages.',
    algorithm: 'Shapley Value Attribution (SHAP) + Monte Carlo 10k Simulations',
    accuracyMetric: 'Attribution Fidelity: 96.8%',
    status: 'ACTIVE',
    lastTrained: '2026-09-01'
  }
];
