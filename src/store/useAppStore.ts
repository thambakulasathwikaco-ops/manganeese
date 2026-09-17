import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppSettings,
  EquipmentItem,
  LocationAnalysisRecord,
  NotificationItem,
  ProductionFactors,
  Recommendation,
  UploadedDataset,
  WeatherDay,
  WeatherRisk,
  Zone,
  SelectedLocation,
  AnalysisRadiusKm,
  LocationIntelligenceReport
} from '../types';
import { INITIAL_EQUIPMENT, INITIAL_PRODUCTION_FACTORS, INITIAL_SITE_INTELLIGENCE_RECORDS, INITIAL_WEATHER, INITIAL_ZONES } from '../data/initialData';
import { recommendationService } from '../services/recommendationService';
import { miningAnalysisService } from '../services/miningAnalysisService';

export interface AppState {
  productionFactors: ProductionFactors;
  zones: Zone[];
  equipment: EquipmentItem[];
  weather: WeatherDay[];
  recommendations: Recommendation[];
  notifications: NotificationItem[];
  uploadedDatasets: UploadedDataset[];
  siteIntelligenceRecords: LocationAnalysisRecord[];
  settings: AppSettings;
  aiAnalysisStatus: 'idle' | 'running' | 'completed';
  aiAnalysisStage: string;
  aiAnalysisProgress: number; // 0 - 100
  lastAnalysisTimestamp: string | null;
  activeTimeframe: '7D' | '30D' | '90D' | '6M';
  searchQuery: string;
  selectedZoneId: string | null;

  // Real Centralized Location Intelligence State
  selectedLocation: SelectedLocation;
  analysisRadiusKm: AnalysisRadiusKm;
  activeLocationReport: LocationIntelligenceReport | null;
  isAnalyzingLocation: boolean;
  locationAnalysisStage: string;
  locationAnalysisProgress: number;

  // Actions
  setSelectedLocation: (location: SelectedLocation) => void;
  setAnalysisRadiusKm: (radiusKm: AnalysisRadiusKm) => void;
  analyzeLocation: (lat?: number, lon?: number, radiusKm?: AnalysisRadiusKm, customName?: string) => Promise<LocationIntelligenceReport>;
  updateFactors: (factors: Partial<ProductionFactors>) => void;
  togglePriorityZone: (zoneId: string) => void;
  acceptRecommendation: (id: string) => void;
  dismissRecommendation: (id: string) => void;
  updateEquipmentStatus: (equipmentId: string, status: EquipmentItem['status'], availability: number) => void;
  updateWeatherDay: (date: string, partial: Partial<WeatherDay>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  uploadDataset: (dataset: UploadedDataset) => void;
  processUploadedDataset: (fileId: string) => void;
  runFullAiAnalysis: () => Promise<void>;
  addSiteIntelligenceRecord: (record: LocationAnalysisRecord) => void;
  updateSiteIntelligenceRecord: (id: string, record: Partial<LocationAnalysisRecord>) => void;
  deleteSiteIntelligenceRecord: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setActiveTimeframe: (timeframe: '7D' | '30D' | '90D' | '6M') => void;
  setSearchQuery: (query: string) => void;
  setSelectedZoneId: (zoneId: string | null) => void;
  resetDemoData: () => void;
  resetAppState: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  animationIntensity: 'medium',
  notificationsEnabled: true,
  demoMode: true
};

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Shortfall Risk Alert',
    message: 'Medium shortfall risk detected due to equipment availability at 78%.',
    type: 'risk',
    timestamp: new Date().toISOString(),
    read: false,
    link: '/shortfall'
  },
  {
    id: 'notif-2',
    title: 'High Prospectivity Zone Identified',
    message: 'Zone D-08 (Tirodi South Outcrop) evaluated at 92% manganese potential.',
    type: 'zone',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    link: '/manganese-map'
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      productionFactors: INITIAL_PRODUCTION_FACTORS,
      zones: INITIAL_ZONES,
      equipment: INITIAL_EQUIPMENT,
      weather: INITIAL_WEATHER,
      recommendations: recommendationService.generateRecommendations(INITIAL_PRODUCTION_FACTORS),
      notifications: DEFAULT_NOTIFICATIONS,
      uploadedDatasets: [],
      siteIntelligenceRecords: INITIAL_SITE_INTELLIGENCE_RECORDS,
      settings: DEFAULT_SETTINGS,
      aiAnalysisStatus: 'idle',
      aiAnalysisStage: '',
      aiAnalysisProgress: 0,
      lastAnalysisTimestamp: '2026-09-09T18:00:00Z',
      activeTimeframe: '30D',
      searchQuery: '',
      selectedZoneId: null,
      selectedLocation: {
        latitude: 21.5333,
        longitude: 79.7167,
        name: 'Dongri Buzurg, Maharashtra',
        adminRegion: 'Bhandara / Nagpur District',
        country: 'India',
        elevationMeters: 325,
        source: 'search',
        radiusKm: 10,
        timestamp: new Date().toISOString()
      },
      analysisRadiusKm: 10,
      activeLocationReport: null,
      isAnalyzingLocation: false,
      locationAnalysisStage: '',
      locationAnalysisProgress: 0,

      setSelectedLocation: (selectedLocation) => {
        set({ selectedLocation });
      },

      setAnalysisRadiusKm: (radiusKm) => {
        set((state) => ({
          analysisRadiusKm: radiusKm,
          selectedLocation: { ...state.selectedLocation, radiusKm }
        }));
      },

      analyzeLocation: async (lat, lon, radius, customName) => {
        const state = get();
        const targetLat = lat ?? state.selectedLocation.latitude;
        const targetLon = lon ?? state.selectedLocation.longitude;
        const targetRadius = radius ?? state.analysisRadiusKm;
        const targetName = customName ?? state.selectedLocation.name;

        set({
          isAnalyzingLocation: true,
          locationAnalysisStage: 'Locating site...',
          locationAnalysisProgress: 12
        });
        await new Promise((r) => setTimeout(r, 200));

        set({
          locationAnalysisStage: 'Fetching geospatial data...',
          locationAnalysisProgress: 28
        });
        await new Promise((r) => setTimeout(r, 200));

        set({
          locationAnalysisStage: 'Checking live weather telemetry...',
          locationAnalysisProgress: 42
        });
        await new Promise((r) => setTimeout(r, 200));

        set({
          locationAnalysisStage: 'Analyzing terrain & DEM slope...',
          locationAnalysisProgress: 58
        });
        await new Promise((r) => setTimeout(r, 200));

        set({
          locationAnalysisStage: 'Querying Macrostrat geological survey...',
          locationAnalysisProgress: 75
        });
        await new Promise((r) => setTimeout(r, 200));

        set({
          locationAnalysisStage: 'Processing Sentinel remote sensing indicators...',
          locationAnalysisProgress: 88
        });
        await new Promise((r) => setTimeout(r, 200));

        set({
          locationAnalysisStage: 'Generating location intelligence report...',
          locationAnalysisProgress: 96
        });

        const report = await miningAnalysisService.analyzeLocation(targetLat, targetLon, targetRadius, targetName);

        set({
          selectedLocation: report.location,
          activeLocationReport: report,
          isAnalyzingLocation: false,
          locationAnalysisStage: 'Analysis complete',
          locationAnalysisProgress: 100
        });

        return report;
      },

      updateFactors: (newFactors) => {
        set((state) => {
          const updatedFactors = { ...state.productionFactors, ...newFactors };
          const newRecs = recommendationService.generateRecommendations(updatedFactors);
          
          // Preserving existing accepted/dismissed statuses
          const mergedRecs = newRecs.map((nr) => {
            const existing = state.recommendations.find((r) => r.id === nr.id);
            return existing ? { ...nr, status: existing.status } : nr;
          });

          return {
            productionFactors: updatedFactors,
            recommendations: mergedRecs
          };
        });
      },

      togglePriorityZone: (zoneId) => {
        set((state) => {
          const updatedZones = state.zones.map((z) => {
            if (z.zoneId === zoneId) {
              const newPriority = !z.priority;
              return { ...z, priority: newPriority };
            }
            return z;
          });

          const targetZone = updatedZones.find((z) => z.zoneId === zoneId);
          let newNotifs = state.notifications;
          if (targetZone) {
            const notif: NotificationItem = {
              id: `notif-${Date.now()}`,
              title: targetZone.priority ? 'Zone Prioritized' : 'Zone Priority Removed',
              message: `${targetZone.name} (${targetZone.zoneId}) has been ${targetZone.priority ? 'added to' : 'removed from'} priority targets.`,
              type: 'zone',
              timestamp: new Date().toISOString(),
              read: false,
              link: '/manganese-map'
            };
            newNotifs = [notif, ...state.notifications];
          }

          return {
            zones: updatedZones,
            notifications: newNotifs
          };
        });
      },

      acceptRecommendation: (id) => {
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, status: 'accepted' } : r
          )
        }));
      },

      dismissRecommendation: (id) => {
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, status: 'dismissed' } : r
          )
        }));
      },

      updateEquipmentStatus: (equipmentId, status, availability) => {
        set((state) => {
          const updatedEquip = state.equipment.map((e) =>
            e.equipmentId === equipmentId ? { ...e, status, availability } : e
          );

          // Calculate average equipment availability across all fleet
          const avgAvailability = Math.round(
            updatedEquip.reduce((acc, curr) => acc + curr.availability, 0) / updatedEquip.length
          );

          const updatedFactors = {
            ...state.productionFactors,
            equipmentAvailability: avgAvailability
          };

          const newRecs = recommendationService.generateRecommendations(updatedFactors);

          return {
            equipment: updatedEquip,
            productionFactors: updatedFactors,
            recommendations: newRecs
          };
        });
      },

      updateWeatherDay: (date, partial) => {
        set((state) => {
          const updatedWeather = state.weather.map((w) =>
            w.date === date ? { ...w, ...partial } : w
          );

          // Highest risk in upcoming days influences factors
          const hasHighRisk = updatedWeather.some((w) => w.weatherRisk === 'HIGH');
          const hasMedRisk = updatedWeather.some((w) => w.weatherRisk === 'MEDIUM');
          const rainfallRiskLevel: WeatherRisk = hasHighRisk ? 'HIGH' : hasMedRisk ? 'MEDIUM' : 'LOW';

          const updatedFactors: ProductionFactors = {
            ...state.productionFactors,
            rainfallRiskLevel
          };

          return {
            weather: updatedWeather,
            productionFactors: updatedFactors
          };
        });
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true }))
        }));
      },

      uploadDataset: (dataset) => {
        set((state) => ({
          uploadedDatasets: [dataset, ...state.uploadedDatasets],
          notifications: [
            {
              id: `notif-upload-${Date.now()}`,
              title: 'CSV Dataset Uploaded',
              message: `${dataset.fileName} (${dataset.rowCount} rows, Quality: ${dataset.qualityScore}%) parsed successfully.`,
              type: 'system',
              timestamp: new Date().toISOString(),
              read: false,
              link: '/data'
            },
            ...state.notifications
          ]
        }));
      },

      processUploadedDataset: (fileId) => {
        const state = get();
        const dataset = state.uploadedDatasets.find((d) => d.fileId === fileId);
        if (!dataset) return;

        // If dataset is Equipment or Production, simulate factor adjustments
        if (dataset.type === 'Equipment') {
          get().updateFactors({ equipmentAvailability: 86 });
        } else if (dataset.type === 'Production') {
          get().updateFactors({ baseProduction: 9400 });
        } else if (dataset.type === 'Weather') {
          get().updateFactors({ rainfallRiskLevel: 'LOW' });
        }

        set((s) => ({
          notifications: [
            {
              id: `notif-proc-${Date.now()}`,
              title: 'Data Integration Complete',
              message: `Integrated ${dataset.fileName} into SMARTMINE core intelligence store.`,
              type: 'system',
              timestamp: new Date().toISOString(),
              read: false,
              link: '/dashboard'
            },
            ...s.notifications
          ]
        }));
      },

      runFullAiAnalysis: async () => {
        set({ aiAnalysisStatus: 'running', aiAnalysisProgress: 12, aiAnalysisStage: 'COLLECTING DATA' });
        await new Promise((r) => setTimeout(r, 450));

        set({ aiAnalysisProgress: 25, aiAnalysisStage: 'PREPROCESSING' });
        await new Promise((r) => setTimeout(r, 450));

        set({ aiAnalysisProgress: 38, aiAnalysisStage: 'EXTRACTING FEATURES' });
        await new Promise((r) => setTimeout(r, 500));

        set({ aiAnalysisProgress: 50, aiAnalysisStage: 'PROSPECTIVITY ANALYSIS' });
        await new Promise((r) => setTimeout(r, 500));

        set({ aiAnalysisProgress: 65, aiAnalysisStage: 'PRODUCTION FORECAST' });
        await new Promise((r) => setTimeout(r, 500));

        set({ aiAnalysisProgress: 80, aiAnalysisStage: 'SHORTFALL ANALYSIS' });
        await new Promise((r) => setTimeout(r, 450));

        set({ aiAnalysisProgress: 92, aiAnalysisStage: 'RECOMMENDATIONS' });
        await new Promise((r) => setTimeout(r, 400));

        const nowIso = new Date().toISOString();
        set((state) => {
          const freshRecs = recommendationService.generateRecommendations(state.productionFactors);
          const newNotif: NotificationItem = {
            id: `notif-ai-${Date.now()}`,
            title: 'AI Pipeline Complete',
            message: 'Full SMARTMINE operational pipeline re-calculated across all 8 intelligence stages.',
            type: 'ai',
            timestamp: nowIso,
            read: false,
            link: '/dashboard'
          };

          return {
            aiAnalysisStatus: 'completed',
            aiAnalysisStage: 'ANALYSIS COMPLETE',
            aiAnalysisProgress: 100,
            lastAnalysisTimestamp: nowIso,
            recommendations: freshRecs,
            notifications: [newNotif, ...state.notifications]
          };
        });

        setTimeout(() => {
          set({ aiAnalysisStatus: 'idle', aiAnalysisProgress: 0, aiAnalysisStage: '' });
        }, 1200);
      },

      addSiteIntelligenceRecord: (record) => {
        set((state) => {
          // Check if record for location already exists, if so update/prepend snapshot
          const existingIndex = state.siteIntelligenceRecords.findIndex(
            (r) => r.locationId === record.locationId || (r.latitude === record.latitude && r.longitude === record.longitude)
          );
          let updatedList: LocationAnalysisRecord[];
          if (existingIndex >= 0) {
            const existing = state.siteIntelligenceRecords[existingIndex];
            const mergedRecord: LocationAnalysisRecord = {
              ...record,
              id: existing.id,
              history: [
                ...existing.history,
                {
                  analyzedAt: record.analyzedAt.split('T')[0],
                  suitabilityScore: record.suitabilityScore,
                  productionPotential: record.productionPotential,
                  resourcePotential: record.resourcePotential,
                  accessibilityScore: record.accessibilityScore,
                  infrastructureScore: record.infrastructureScore,
                  transportScore: record.transportScore,
                  equipmentAvailability: record.equipmentAvailability,
                  weatherRiskScore: record.weatherRiskScore,
                  operationalRisk: record.operationalRisk,
                  environmentalScore: record.environmentalScore,
                  overallScore: record.overallScore
                }
              ]
            };
            updatedList = [
              mergedRecord,
              ...state.siteIntelligenceRecords.filter((_, idx) => idx !== existingIndex)
            ];
          } else {
            updatedList = [record, ...state.siteIntelligenceRecords];
          }
          return { siteIntelligenceRecords: updatedList };
        });
      },

      updateSiteIntelligenceRecord: (id, partialRecord) => {
        set((state) => ({
          siteIntelligenceRecords: state.siteIntelligenceRecords.map((r) =>
            r.id === id ? { ...r, ...partialRecord, lastUpdated: new Date().toISOString() } : r
          )
        }));
      },

      deleteSiteIntelligenceRecord: (id) => {
        set((state) => ({
          siteIntelligenceRecords: state.siteIntelligenceRecords.filter((r) => r.id !== id)
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setActiveTimeframe: (activeTimeframe) => set({ activeTimeframe }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedZoneId: (selectedZoneId) => set({ selectedZoneId }),

      resetDemoData: () => {
        set({
          productionFactors: INITIAL_PRODUCTION_FACTORS,
          zones: INITIAL_ZONES,
          equipment: INITIAL_EQUIPMENT,
          weather: INITIAL_WEATHER,
          recommendations: recommendationService.generateRecommendations(INITIAL_PRODUCTION_FACTORS),
          uploadedDatasets: [],
          siteIntelligenceRecords: INITIAL_SITE_INTELLIGENCE_RECORDS,
          notifications: DEFAULT_NOTIFICATIONS,
          settings: DEFAULT_SETTINGS,
          lastAnalysisTimestamp: new Date().toISOString()
        });
      },

      resetAppState: () => {
        localStorage.removeItem('moil-smartmine-storage');
        get().resetDemoData();
      }
    }),
    {
      name: 'moil-smartmine-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('LocalStorage corruption detected, resetting to default state:', error);
          state?.resetDemoData();
        }
      }
    }
  )
);
