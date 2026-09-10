import type { SelectedLocation, ProspectivityAnalysisResult, PotentialLevel } from '../types';

// Clean sub-service abstractions for real data readiness
export class GeologicalDataService {
  getGeologicalScore(lat: number, lon: number, hashSeed: number): number {
    // Distance factor to manganese belt centroid (Dongri-Mansar belt ~ 21.53°N, 79.71°E)
    const dist = Math.sqrt(Math.pow(lat - 21.5333, 2) + Math.pow(lon - 79.7167, 2));
    if (dist < 0.6) {
      // High potential belt area
      return Math.min(98, Math.max(75, Math.round(92 - dist * 25 + (hashSeed % 11) - 5)));
    } else if (dist < 2.0) {
      // Medium potential surrounding area
      return Math.min(78, Math.max(45, Math.round(68 - dist * 10 + (hashSeed % 15) - 7)));
    } else {
      // Deterministic evaluation for any global coordinate
      const score = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233 + hashSeed * 0.1) * 100);
      return Math.min(95, Math.max(12, Math.round(score)));
    }
  }
}

export class BoreholeDataService {
  getBoreholeScore(lat: number, lon: number, hashSeed: number): number {
    const dist = Math.sqrt(Math.pow(lat - 21.6833, 2) + Math.pow(lon - 79.7000, 2));
    if (dist < 0.6) {
      return Math.min(96, Math.max(72, Math.round(89 - dist * 22 + ((hashSeed * 3) % 9) - 4)));
    } else if (dist < 2.0) {
      return Math.min(75, Math.max(42, Math.round(63 - dist * 8 + ((hashSeed * 3) % 13) - 6)));
    } else {
      const score = Math.abs(Math.sin(lat * 4.1415 + lon * 92.112 + hashSeed * 0.3) * 100);
      return Math.min(92, Math.max(15, Math.round(score)));
    }
  }
}

export class SatelliteDataService {
  getSatelliteScore(lat: number, lon: number, hashSeed: number): number {
    const dist = Math.sqrt(Math.pow(lat - 21.1458, 2) + Math.pow(lon - 79.0882, 2));
    if (dist < 0.8) {
      return Math.min(95, Math.max(70, Math.round(88 - dist * 18 + ((hashSeed * 7) % 10) - 5)));
    } else {
      const score = Math.abs(Math.cos(lat * 8.314 + lon * 43.192 + hashSeed * 0.5) * 100);
      return Math.min(94, Math.max(10, Math.round(score)));
    }
  }
}

export class TerrainDataService {
  getTerrainScore(lat: number, lon: number, hashSeed: number): number {
    const dist = Math.sqrt(Math.pow(lat - 21.5500, 2) + Math.pow(lon - 79.6500, 2));
    if (dist < 1.0) {
      return Math.min(94, Math.max(68, Math.round(84 - dist * 15 + ((hashSeed * 11) % 8) - 4)));
    } else {
      const score = Math.abs(Math.sin(lat * 19.456 + lon * 11.789 + hashSeed * 0.7) * 100);
      return Math.min(90, Math.max(18, Math.round(score)));
    }
  }
}

export class GeospatialDataService {
  geological = new GeologicalDataService();
  borehole = new BoreholeDataService();
  satellite = new SatelliteDataService();
  terrain = new TerrainDataService();

  /**
   * Produce a deterministic hash seed from coordinates
   */
  private getCoordinateHash(lat: number, lon: number): number {
    const latStr = lat.toFixed(4);
    const lonStr = lon.toFixed(4);
    let hash = 0;
    const combined = `${latStr}:${lonStr}`;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  getIndicators(lat: number, lon: number) {
    const seed = this.getCoordinateHash(lat, lon);
    const geologicalScore = this.geological.getGeologicalScore(lat, lon, seed);
    const boreholeScore = this.borehole.getBoreholeScore(lat, lon, seed);
    const satelliteScore = this.satellite.getSatelliteScore(lat, lon, seed);
    const terrainScore = this.terrain.getTerrainScore(lat, lon, seed);

    return {
      geologicalScore,
      boreholeScore,
      satelliteScore,
      terrainScore
    };
  }
}

export const geospatialDataService = new GeospatialDataService();
export const geologicalDataService = geospatialDataService.geological;
export const boreholeDataService = geospatialDataService.borehole;
export const satelliteDataService = geospatialDataService.satellite;
export const terrainDataService = geospatialDataService.terrain;

export class ProspectivityService {
  /**
   * Calculate prospectivity score, confidence, classification, explanation, and recommendation
   */
  calculateProspectivity(
    input:
      | SelectedLocation
      | { geologicalScore: number; boreholeScore: number; satelliteScore: number; terrainScore: number }
  ): ProspectivityAnalysisResult {
    let location: SelectedLocation | undefined;
    let geologicalScore: number;
    let boreholeScore: number;
    let satelliteScore: number;
    let terrainScore: number;

    if ('latitude' in input && 'longitude' in input) {
      location = input as SelectedLocation;
      const indicators = geospatialDataService.getIndicators(location.latitude, location.longitude);
      geologicalScore = indicators.geologicalScore;
      boreholeScore = indicators.boreholeScore;
      satelliteScore = indicators.satelliteScore;
      terrainScore = indicators.terrainScore;
    } else {
      const scores = input as { geologicalScore: number; boreholeScore: number; satelliteScore: number; terrainScore: number };
      geologicalScore = scores.geologicalScore;
      boreholeScore = scores.boreholeScore;
      satelliteScore = scores.satelliteScore;
      terrainScore = scores.terrainScore;
    }

    // Formula: (geological * 0.35) + (borehole * 0.30) + (satellite * 0.20) + (terrain * 0.15)
    const rawScore =
      geologicalScore * 0.35 +
      boreholeScore * 0.30 +
      satelliteScore * 0.20 +
      terrainScore * 0.15;

    const prospectivityScore = Math.round(rawScore);

    // Classification
    let potentialLevel: PotentialLevel = 'LOW';
    if (prospectivityScore >= 70) {
      potentialLevel = 'HIGH';
    } else if (prospectivityScore >= 40) {
      potentialLevel = 'MEDIUM';
    } else {
      potentialLevel = 'LOW';
    }

    // Confidence calculation (higher when data indicators agree)
    const scoresArr = [geologicalScore, boreholeScore, satelliteScore, terrainScore];
    const mean = scoresArr.reduce((a, b) => a + b, 0) / 4;
    const variance = scoresArr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 4;
    const stdDev = Math.sqrt(variance);
    // Lower standard deviation means higher model confidence (ranging between 78% and 94%)
    const confidence = Math.min(94, Math.max(78, Math.round(92 - stdDev * 0.4)));

    // Generate Dynamic AI Explanation
    const aiExplanation = this.generateAiExplanation(
      geologicalScore,
      boreholeScore,
      satelliteScore,
      terrainScore,
      potentialLevel
    );

    // Generate Dynamic Recommendation
    const recommendedAction = this.generateRecommendation(prospectivityScore);

    return {
      location,
      prospectivityScore,
      score: prospectivityScore,
      potentialLevel,
      classification: potentialLevel,
      confidence,
      geologicalScore,
      boreholeScore,
      satelliteScore,
      terrainScore,
      aiExplanation,
      recommendedAction,
      timestamp: new Date().toISOString()
    };
  }

  private generateAiExplanation(
    geological: number,
    borehole: number,
    satellite: number,
    terrain: number,
    potentialLevel: PotentialLevel
  ): string {
    const factors = [
      { name: 'geological', label: 'Geological indicators', score: geological },
      { name: 'borehole', label: 'Borehole evidence', score: borehole },
      { name: 'satellite', label: 'Satellite indicators', score: satellite },
      { name: 'terrain', label: 'Terrain indicators', score: terrain }
    ];

    factors.sort((a, b) => b.score - a.score);
    const highest = factors[0];
    const lowest = factors[factors.length - 1];

    let sentence1 = '';
    if (highest.name === 'geological') {
      sentence1 = 'Geological indicators are the strongest contributing evidence in this prediction.';
    } else if (highest.name === 'borehole') {
      sentence1 = 'Borehole evidence is the strongest contributing factor in this prediction.';
    } else if (highest.name === 'satellite') {
      sentence1 = 'Satellite indicators are the strongest contributing factor in this prediction.';
    } else {
      sentence1 = 'Terrain structural alignment provides the primary supporting signal for this site.';
    }

    let sentence2 = '';
    if (lowest.score < 45) {
      sentence2 = `${lowest.label} provide weaker supporting evidence for this location.`;
    } else {
      sentence2 = `Secondary parameters (${lowest.label.toLowerCase()}) show moderate alignment with expected manganese core signatures.`;
    }

    return `This location shows ${potentialLevel.toLowerCase()} manganese prospectivity based on the available geological, satellite, borehole and terrain indicators. ${sentence1} ${sentence2}`;
  }

  private generateRecommendation(score: number): string {
    if (score >= 70) {
      return 'Prioritize this area for further geological investigation and drilling validation.';
    } else if (score >= 40) {
      return 'Conduct additional geological sampling and investigation before prioritizing this area.';
    } else {
      return 'Current available indicators show low prospectivity. Consider evaluating alternative areas.';
    }
  }
}

export const prospectivityService = new ProspectivityService();
