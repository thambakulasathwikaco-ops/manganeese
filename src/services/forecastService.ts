import type { LocationAnalysisRecord, ProductionFactors, ProductionForecastPoint } from '../types';

export interface LocationForecastResult {
  locationId: string;
  locationName: string;
  region: string;
  targetProduction: number;
  predictedProduction: number;
  shortfall: number;
  shortfallPct: number;
  isAhead: boolean;
  surplus: number;
  confidencePct: number;
  factors: ProductionFactors;
  factorImpacts: FactorImpact[];
  insightNarrative: string;
  recommendations: LocationRecommendation[];
}

export interface FactorImpact {
  id: string;
  factorName: string;
  currentValue: string;
  impactPct: number;
  isPositive: boolean;
  statusText: string;
}

export interface LocationRecommendation {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  estimatedGainMt: number;
}

export interface ExtendedForecastPoint extends ProductionForecastPoint {
  upperBound: number;
  lowerBound: number;
  actualHistorical?: number;
}

export class ForecastService {
  /**
   * Derive baseline ProductionFactors for a specific LocationAnalysisRecord
   */
  getBaselineFactorsForLocation(location: LocationAnalysisRecord): ProductionFactors {
    const targetProduction = Math.round(
      Math.min(18000, Math.max(5000, (location.estimatedReserveTons || 1000000) * 0.0075))
    );

    const baseProduction = Math.round(targetProduction * (location.productionPotential / 100));
    const blastingDelayDays = Math.max(0, Math.min(15, Math.round((100 - location.suitabilityScore) * 0.12)));

    return {
      baseProduction,
      productionTarget: targetProduction,
      equipmentAvailability: location.equipmentAvailability || 80,
      rainfallRiskLevel: location.weatherRiskLevel || 'LOW',
      blastingDelayDays,
      transportAvailability: location.transportScore || 80,
      oreAvailability: location.resourcePotential || 85,
      operationalFactor: 1.0
    };
  }

  /**
   * Calculate location forecast using active location data + optional scenario overrides
   */
  calculateLocationForecast(
    location: LocationAnalysisRecord,
    scenarioFactors?: Partial<ProductionFactors>
  ): LocationForecastResult {
    const base = this.getBaselineFactorsForLocation(location);

    const factors: ProductionFactors = {
      ...base,
      ...scenarioFactors
    };

    const targetProduction = factors.productionTarget;

    const equipmentCoeff = (factors.equipmentAvailability - 80) * 0.004;
    const transportCoeff = (factors.transportAvailability - 80) * 0.003;
    const oreCoeff = (factors.oreAvailability - 80) * 0.0035;

    let weatherCoeff = 0;
    if (factors.rainfallRiskLevel === 'HIGH') weatherCoeff = -0.12;
    else if (factors.rainfallRiskLevel === 'MEDIUM') weatherCoeff = -0.05;

    const blastingCoeff = -(factors.blastingDelayDays * 0.015);

    const totalMulti = 1 + equipmentCoeff + transportCoeff + oreCoeff + weatherCoeff + blastingCoeff;
    const rawForecast = Math.round(targetProduction * (location.productionPotential / 100) * Math.max(0.4, totalMulti));
    const predictedProduction = Math.round(rawForecast);

    const shortfall = Math.max(0, targetProduction - predictedProduction);
    const isAhead = predictedProduction >= targetProduction;
    const surplus = Math.max(0, predictedProduction - targetProduction);
    const shortfallPct = targetProduction > 0 ? parseFloat(((shortfall / targetProduction) * 100).toFixed(1)) : 0;

    const variability = Math.abs(factors.equipmentAvailability - 85) + (factors.rainfallRiskLevel === 'HIGH' ? 12 : 4);
    const confidencePct = Math.round(Math.min(96, Math.max(68, location.suitabilityScore * 0.8 + 15 - variability * 0.2)));

    const factorImpacts: FactorImpact[] = [
      {
        id: 'equip',
        factorName: 'Equipment Fleet Availability',
        currentValue: `${factors.equipmentAvailability}%`,
        impactPct: parseFloat((equipmentCoeff * 100).toFixed(1)),
        isPositive: equipmentCoeff >= 0,
        statusText: equipmentCoeff >= 0 ? 'Positive Fleet Impact' : 'Downtime Constraint'
      },
      {
        id: 'ore',
        factorName: 'Run-of-Mine Ore Availability',
        currentValue: `${factors.oreAvailability}%`,
        impactPct: parseFloat((oreCoeff * 100).toFixed(1)),
        isPositive: oreCoeff >= 0,
        statusText: oreCoeff >= 0 ? 'High Ore Feed' : 'Ore Feed Restriction'
      },
      {
        id: 'transport',
        factorName: 'Transport & Rail Evacuation',
        currentValue: `${factors.transportAvailability}%`,
        impactPct: parseFloat((transportCoeff * 100).toFixed(1)),
        isPositive: transportCoeff >= 0,
        statusText: transportCoeff >= 0 ? 'Clear Rail Siding' : 'Siding Bottleneck'
      },
      {
        id: 'weather',
        factorName: 'Monsoon Weather Risk',
        currentValue: factors.rainfallRiskLevel,
        impactPct: parseFloat((weatherCoeff * 100).toFixed(1)),
        isPositive: weatherCoeff >= 0,
        statusText: weatherCoeff >= 0 ? 'Favorable Climate' : 'Rain Inundation Hazard'
      },
      {
        id: 'blasting',
        factorName: 'Blasting Cycle Latency',
        currentValue: `${factors.blastingDelayDays} Days`,
        impactPct: parseFloat((blastingCoeff * 100).toFixed(1)),
        isPositive: blastingCoeff >= 0,
        statusText: blastingCoeff >= 0 ? 'On-Schedule Blasting' : 'Explosive Delay Impact'
      }
    ].sort((a, b) => Math.abs(b.impactPct) - Math.abs(a.impactPct));

    let insightNarrative = '';
    if (isAhead) {
      insightNarrative = `Current operating conditions indicate that ${location.locationName} is projected to exceed its target by +${surplus.toLocaleString()} MT (+${((surplus / targetProduction) * 100).toFixed(1)}%). Strong equipment availability (${factors.equipmentAvailability}%) and robust ore feed (${factors.oreAvailability}%) are driving peak production velocity.`;
    } else {
      insightNarrative = `Current operating conditions indicate that ${location.locationName} is likely to finish ${shortfall.toLocaleString()} MT below its current production target of ${targetProduction.toLocaleString()} MT. Equipment availability (${factors.equipmentAvailability}%) provides baseline support, while blasting delays (${factors.blastingDelayDays} days) and weather risk (${factors.rainfallRiskLevel}) are reducing expected output.`;
    }

    const recommendations: LocationRecommendation[] = [];

    if (factors.equipmentAvailability < 85) {
      recommendations.push({
        id: 'rec-equip',
        priority: 'HIGH',
        title: 'Optimize Excavator Fleet Preventative Maintenance',
        description: `Increase ${location.locationName} shovel availability to 88% to recover an estimated +${Math.round(targetProduction * 0.04)} MT/month.`,
        estimatedGainMt: Math.round(targetProduction * 0.04)
      });
    }

    if (factors.blastingDelayDays > 2) {
      recommendations.push({
        id: 'rec-blast',
        priority: 'HIGH',
        title: 'Expedite Bench #2 Explosive Clearance Permits',
        description: `Reduce blasting cycle latency from ${factors.blastingDelayDays} days down to 1 day to unlock +${Math.round(targetProduction * 0.035)} MT/month in blasted ore.`,
        estimatedGainMt: Math.round(targetProduction * 0.035)
      });
    }

    if (factors.rainfallRiskLevel === 'HIGH' || factors.rainfallRiskLevel === 'MEDIUM') {
      recommendations.push({
        id: 'rec-rain',
        priority: 'MEDIUM',
        title: 'Activate High-Head Pit Dewatering Pumps',
        description: `Pre-emptively clear sump water at ${location.locationName} pit floor to maintain dumper haul road traction during rain events.`,
        estimatedGainMt: Math.round(targetProduction * 0.025)
      });
    }

    if (factors.transportAvailability < 85) {
      recommendations.push({
        id: 'rec-trans',
        priority: 'MEDIUM',
        title: 'Request Additional Broad-Gauge Rail Rake Siding',
        description: `Expand wagon loading shifts at ${location.region} siding to eliminate stockyard bottlenecks.`,
        estimatedGainMt: Math.round(targetProduction * 0.02)
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec-opt',
        priority: 'LOW',
        title: 'Maintain Current High-Performance Production Schedule',
        description: `All operational parameters at ${location.locationName} are optimized. Continue monitoring bench extraction rates.`,
        estimatedGainMt: 0
      });
    }

    return {
      locationId: location.locationId || location.id,
      locationName: location.locationName,
      region: location.region,
      targetProduction,
      predictedProduction,
      shortfall,
      shortfallPct,
      isAhead,
      surplus,
      confidencePct,
      factors,
      factorImpacts,
      insightNarrative,
      recommendations
    };
  }

  /**
   * Generate Forecast Time-Series with Uncertainty Bounds matching the exact location forecast
   */
  generateLocationForecastSeries(
    result: LocationForecastResult,
    timeframe: '7D' | '30D' | '90D' | '6M'
  ): ExtendedForecastPoint[] {
    const { targetProduction, predictedProduction, confidencePct } = result;

    const count = timeframe === '7D' ? 7 : timeframe === '30D' ? 10 : timeframe === '90D' ? 12 : 12;
    const points: ExtendedForecastPoint[] = [];

    const baseTarget = Math.round(targetProduction / count);
    const baseForecast = Math.round(predictedProduction / count);

    const bandSpread = Math.max(0.04, (100 - confidencePct) * 0.003);

    const now = new Date();
    for (let i = 0; i < count; i++) {
      let label = '';
      if (timeframe === '7D') {
        const d = new Date(now);
        d.setDate(d.getDate() - (count - 1 - i));
        label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      } else if (timeframe === '30D') {
        label = `Day ${(i + 1) * 3}`;
      } else if (timeframe === '90D') {
        label = `Wk ${i + 1}`;
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = months[i % 12];
      }

      const noise = Math.sin(i * 1.4) * 0.06 + 1;
      const pointForecast = Math.round(baseForecast * noise);
      const pointTarget = baseTarget;

      const upperBound = Math.round(pointForecast * (1 + bandSpread));
      const lowerBound = Math.round(pointForecast * (1 - bandSpread));

      const isPast = i < Math.floor(count * 0.4);
      const actualHistorical = isPast
        ? Math.round(pointForecast * (0.96 + Math.sin(i * 2.1) * 0.05))
        : undefined;

      points.push({
        date: label,
        label,
        historical: isPast ? pointForecast : undefined,
        actualHistorical,
        forecast: pointForecast,
        target: pointTarget,
        gap: Math.max(0, pointTarget - pointForecast),
        upperBound,
        lowerBound
      });
    }

    return points;
  }

  /**
   * Legacy calculation method for global/card widgets
   */
  calculateForecast(factors: ProductionFactors): {
    predictedProduction: number;
    shortfall: number;
    shortfallPct: number;
    confidencePct: number;
  } {
    const {
      baseProduction,
      productionTarget,
      equipmentAvailability,
      rainfallRiskLevel,
      blastingDelayDays,
      transportAvailability,
      oreAvailability,
      operationalFactor
    } = factors;

    const equipmentFactor = Math.min(1.2, Math.max(0.4, equipmentAvailability / 100));
    let weatherFactor = 1.0;
    if (rainfallRiskLevel === 'HIGH') weatherFactor = 0.72;
    else if (rainfallRiskLevel === 'MEDIUM') weatherFactor = 0.88;

    const transportFactor = Math.min(1.15, Math.max(0.5, transportAvailability / 100));
    const oreFactor = Math.min(1.1, Math.max(0.5, oreAvailability / 100));
    const blastingFactor = Math.max(0.6, 1.0 - blastingDelayDays * 0.025);

    const rawForecast =
      baseProduction *
      equipmentFactor *
      weatherFactor *
      transportFactor *
      oreFactor *
      blastingFactor *
      operationalFactor;
    const predictedProduction = Math.round(rawForecast);

    const shortfall = Math.max(0, productionTarget - predictedProduction);
    const shortfallPct =
      productionTarget > 0 ? parseFloat(((shortfall / productionTarget) * 100).toFixed(1)) : 0;

    const variability =
      Math.abs(equipmentAvailability - 85) + (rainfallRiskLevel === 'HIGH' ? 15 : 5);
    const confidencePct = Math.round(Math.min(96, Math.max(68, 92 - variability * 0.4)));

    return {
      predictedProduction,
      shortfall,
      shortfallPct,
      confidencePct
    };
  }

  /**
   * Legacy series generator method for global/card widgets
   */
  generateForecastSeries(
    factors: ProductionFactors,
    timeframe: '7D' | '30D' | '90D' | '6M'
  ): ProductionForecastPoint[] {
    const { predictedProduction } = this.calculateForecast(factors);
    const productionTarget = factors.productionTarget;
    const count = timeframe === '7D' ? 7 : timeframe === '30D' ? 10 : timeframe === '90D' ? 12 : 12;
    const points: ProductionForecastPoint[] = [];

    const baseTarget = Math.round(productionTarget / count);
    const baseForecast = Math.round(predictedProduction / count);

    const now = new Date();
    for (let i = 0; i < count; i++) {
      let label = '';
      if (timeframe === '7D') {
        const d = new Date(now);
        d.setDate(d.getDate() - (count - 1 - i));
        label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      } else if (timeframe === '30D') {
        label = `Day ${(i + 1) * 3}`;
      } else if (timeframe === '90D') {
        label = `Wk ${i + 1}`;
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = months[i % 12];
      }

      const noise = Math.sin(i * 1.5) * 0.08 + 1;
      const pointForecast = Math.round(baseForecast * noise);
      const pointTarget = baseTarget;
      const isPast = i < Math.floor(count * 0.4);

      points.push({
        date: label,
        label,
        historical: isPast ? Math.round(pointForecast * (0.95 + Math.random() * 0.1)) : undefined,
        forecast: pointForecast,
        target: pointTarget,
        gap: Math.max(0, pointTarget - pointForecast)
      });
    }

    return points;
  }
}

export const forecastService = new ForecastService();
