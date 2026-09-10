import type { ProductionFactors, Recommendation } from '../types';
import { forecastService } from './forecastService';

export const recommendationService = {
  generateRecommendations(factors: ProductionFactors): Recommendation[] {
    const list: Recommendation[] = [];
    const nowStr = new Date().toISOString();
    const { shortfallPct } = forecastService.calculateForecast(factors);

    if (factors.equipmentAvailability < 80) {
      list.push({
        id: 'rec-eq-1',
        priority: factors.equipmentAvailability < 65 ? 'HIGH' : 'MEDIUM',
        title: 'Heavy Fleet Availability Optimization',
        category: 'Equipment',
        reason: `Equipment availability dropped to ${factors.equipmentAvailability}%, causing excavation delays.`,
        action: 'Mobilize standby hydraulic excavators EX-04 and reassign dumper fleet DP-07 for preventive maintenance.',
        impact: 'Recovers +12% equipment availability and increases daily haulage by ~450 MT.',
        status: 'pending',
        createdAt: nowStr
      });
    }

    if (factors.rainfallRiskLevel === 'HIGH' || factors.rainfallRiskLevel === 'MEDIUM') {
      list.push({
        id: 'rec-weather-1',
        priority: factors.rainfallRiskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
        title: 'Weather-Resilient Pit Dewatering & Bench Access Plan',
        category: 'Scheduling',
        reason: `Monsoon rainfall risk is elevated (${factors.rainfallRiskLevel}), threatening pit floor inundation.`,
        action: 'Deploy high-head submersible pumps at Pit Bench #4 and shift excavation to upper non-inundated strata.',
        impact: 'Mitigates up to 800 MT/day weather-induced production loss during heavy downpours.',
        status: 'pending',
        createdAt: nowStr
      });
    }

    if (factors.blastingDelayDays > 3) {
      list.push({
        id: 'rec-blast-1',
        priority: factors.blastingDelayDays > 7 ? 'HIGH' : 'MEDIUM',
        title: 'Sequential Blasting & Explosive Stockpile Acceleration',
        category: 'Blasting',
        reason: `Blasting operations are delayed by ${factors.blastingDelayDays} days due to explosive permit clearance.`,
        action: 'Execute fast-track electronic detonator pattern for pit face B-12 and pre-drill Bench #5 core.',
        impact: 'Unlocks 12,000 MT of blasted manganese ore reserve within 48 hours.',
        status: 'pending',
        createdAt: nowStr
      });
    }

    if (factors.transportAvailability < 80) {
      list.push({
        id: 'rec-trans-1',
        priority: factors.transportAvailability < 65 ? 'HIGH' : 'MEDIUM',
        title: 'Rail Rake & Road Fleet Evacuation Dispatch',
        category: 'Transport',
        reason: `Transport evacuation is at ${factors.transportAvailability}%, risking pit-head yard congestion.`,
        action: 'Request 2 additional Indian Railways manganese rake allocations and reroute trucks to Siding #2.',
        impact: 'Clears 3,200 MT stock buildup and prevents crusher feeder choking.',
        status: 'pending',
        createdAt: nowStr
      });
    }

    if (factors.oreAvailability < 80) {
      list.push({
        id: 'rec-ore-1',
        priority: 'MEDIUM',
        title: 'High-Grade Ore Blending & Beneficiation Adjustment',
        category: 'Ore',
        reason: `ROM ore availability is at ${factors.oreAvailability}%, causing feed grade variance.`,
        action: 'Blend medium-grade ROM from Zone B-14 with high-grade stock at Jigging Plant #1.',
        impact: 'Maintains required 44% Mn market grade standard while maximizing throughput.',
        status: 'pending',
        createdAt: nowStr
      });
    }

    if (shortfallPct > 5) {
      list.push({
        id: 'rec-shortfall-1',
        priority: shortfallPct > 15 ? 'HIGH' : 'MEDIUM',
        title: 'Target Shortfall Mitigation & Double Shift Activation',
        category: 'General',
        reason: `Forecast shows a ${shortfallPct}% shortfall against monthly production target.`,
        action: 'Implement extended 2-shift excavation pattern on Zone A-17 high-prospectivity bench.',
        impact: 'Closes shortfall gap by up to 1,500 MT over the remaining production cycle.',
        status: 'pending',
        createdAt: nowStr
      });
    }

    // Default baseline recommendation if all factors are optimal
    if (list.length === 0) {
      list.push({
        id: 'rec-opt-1',
        priority: 'LOW',
        title: 'Continuous Pit Optimization & Sensor Calibration',
        category: 'General',
        reason: 'Current operations are performing within target metrics.',
        action: 'Maintain current fleet dispatch routines and calibrate pit-head conveyor scale sensors.',
        impact: 'Sustains 98%+ operational efficiency across all active benches.',
        status: 'pending',
        createdAt: nowStr
      });
    }

    return list;
  }
};
