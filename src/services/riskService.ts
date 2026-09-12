import type { LocationAnalysisRecord, ProductionFactors, RiskContribution, RiskLevel } from '../types';
import { forecastService } from './forecastService';

export interface LocationRiskResult {
  target: number;
  predictedProduction: number;
  shortfall: number;
  shortfallPct: number;
  forecastConfidence: number;
  riskLevel: RiskLevel;
  contributions: RiskContribution[];
  explanation: string;
  executiveSummary: string;
}

export const riskService = {
  calculateLocationRisk(record: LocationAnalysisRecord): LocationRiskResult {
    // 1. Calculate Monthly Target & Predicted Output for the selected location
    const target = Math.max(7500, Math.min(12500, Math.round(record.estimatedReserveTons / 120)));
    const predictedProduction = Math.round(target * (record.productionPotential / 100));
    const shortfall = Math.max(0, target - predictedProduction);
    const shortfallPct = Math.round((shortfall / target) * 100);

    // 2. Forecast Confidence based on model consensus
    const forecastConfidence = Math.min(96, Math.max(82, Math.round(92 - Math.abs(record.geologicalScore - record.boreholeScore) * 0.3)));

    // 3. Location-Specific Risk Level determination
    let riskLevel: RiskLevel = 'LOW';
    if (record.operationalRisk >= 40 || shortfallPct > 20) {
      riskLevel = 'CRITICAL';
    } else if (record.operationalRisk >= 28 || shortfallPct > 12) {
      riskLevel = 'HIGH';
    } else if (record.operationalRisk >= 18 || shortfallPct > 6) {
      riskLevel = 'MEDIUM';
    }

    // 4. Location-Specific Contributing Factor Losses
    const eqLoss = Math.max(2, 100 - record.equipmentAvailability);
    const oreLoss = Math.max(2, 100 - record.resourcePotential);
    const blastLoss = Math.max(2, Math.round((100 - record.accessibilityScore) * 0.8));
    const rainLoss = Math.max(2, record.weatherRiskScore);
    const transportLoss = Math.max(2, 100 - record.transportScore);

    const totalRawLoss = eqLoss + oreLoss + blastLoss + rainLoss + transportLoss || 1;

    const rawContributions = [
      {
        id: 'eq',
        factor: 'Equipment Downtime',
        loss: eqLoss,
        color: '#A4B878',
        desc: `Fleet availability is currently ${record.equipmentAvailability}%, creating haulage & pit excavation constraints.`
      },
      {
        id: 'ore',
        factor: 'Ore Grade & Availability',
        loss: oreLoss,
        color: '#71825B',
        desc: `Resource potential is at ${record.resourcePotential}% with ${record.manganeseGradePct}% Mn grade core recovery.`
      },
      {
        id: 'blast',
        factor: 'Blasting Schedule Delays',
        loss: blastLoss,
        color: '#596A43',
        desc: `Terrain accessibility index is at ${record.accessibilityScore}%, creating bench slope & blasting delays.`
      },
      {
        id: 'rain',
        factor: 'Rainfall & Monsoon Impact',
        loss: rainLoss,
        color: '#4C5D38',
        desc: `Weather risk index is at ${record.weatherRiskScore}% (${record.weatherRiskLevel} severity level).`
      },
      {
        id: 'trans',
        factor: 'Rail/Road Transport Capacity',
        loss: transportLoss,
        color: '#39422F',
        desc: `Evacuation transport score is operating at ${record.transportScore}%.`
      }
    ];

    // Calculate percentage contributions & sort descending
    const contributions: RiskContribution[] = rawContributions
      .map((c) => ({
        id: c.id,
        factor: c.factor,
        contributionPct: Math.round((c.loss / totalRawLoss) * 100),
        color: c.color,
        impactDescription: c.desc
      }))
      .sort((a, b) => b.contributionPct - a.contributionPct);

    // Normalize so sum equals 100%
    const sum = contributions.reduce((acc, curr) => acc + curr.contributionPct, 0);
    if (sum !== 100 && contributions.length > 0) {
      contributions[0].contributionPct += 100 - sum;
    }

    const topDriver = contributions[0];
    const secondDriver = contributions[1] || contributions[0];

    // Dynamic diagnostic narrative specific to this location
    let explanation = '';
    if (riskLevel === 'LOW') {
      explanation = `${record.locationName} in ${record.region} is operating with LOW production shortfall risk (${shortfallPct}% gap). Minor operational friction is driven by ${topDriver.factor.toLowerCase()} (${topDriver.contributionPct}% contribution). ${record.recommendation}`;
    } else {
      explanation = `${record.locationName} in ${record.region} is currently experiencing a ${riskLevel} production shortfall (${shortfallPct}% gap, -${shortfall.toLocaleString()} MT variance), primarily driven by ${topDriver.factor.toLowerCase()} (${topDriver.contributionPct}% contribution) and ${secondDriver.factor.toLowerCase()} (${secondDriver.contributionPct}% contribution). ${record.recommendation}`;
    }

    const executiveSummary = `${record.locationName} (${record.locationId}) analysis indicates predicted monthly output of ${predictedProduction.toLocaleString()} MT against target of ${target.toLocaleString()} MT. Main bottleneck: ${topDriver.factor} (${topDriver.contributionPct}% contribution).`;

    return {
      target,
      predictedProduction,
      shortfall,
      shortfallPct,
      forecastConfidence,
      riskLevel,
      contributions,
      explanation,
      executiveSummary
    };
  },

  calculateRisk(factors: ProductionFactors): {
    shortfall: number;
    shortfallPct: number;
    riskLevel: RiskLevel;
    contributions: RiskContribution[];
    explanation: string;
    executiveSummary: string;
  } {
    const forecastResult = forecastService.calculateForecast(factors);
    const { predictedProduction, shortfall, shortfallPct } = forecastResult;

    let riskLevel: RiskLevel = 'LOW';
    if (shortfallPct > 20) {
      riskLevel = 'CRITICAL';
    } else if (shortfallPct > 10) {
      riskLevel = 'HIGH';
    } else if (shortfallPct > 5) {
      riskLevel = 'MEDIUM';
    }

    // Dynamic factor contribution weighting
    const eqLoss = Math.max(0, 100 - factors.equipmentAvailability);
    const rainLoss = factors.rainfallRiskLevel === 'HIGH' ? 30 : factors.rainfallRiskLevel === 'MEDIUM' ? 15 : 2;
    const blastLoss = factors.blastingDelayDays * 4;
    const transportLoss = Math.max(0, 100 - factors.transportAvailability);
    const oreLoss = Math.max(0, 100 - factors.oreAvailability);

    const totalRawLoss = eqLoss + rainLoss + blastLoss + transportLoss + oreLoss || 1;

    const rawContributions = [
      { id: 'eq', factor: 'Equipment Downtime', loss: eqLoss, color: '#ef4444', desc: `Fleet availability is at ${factors.equipmentAvailability}%, creating haulage bottlenecks.` },
      { id: 'rain', factor: 'Rainfall & Monsoon Impact', loss: rainLoss, color: '#3b82f6', desc: `Heavy precipitation risk is ${factors.rainfallRiskLevel}, impacting bench access.` },
      { id: 'blast', factor: 'Blasting Schedule Delays', loss: blastLoss, color: '#f59e0b', desc: `Blasting cycle delayed by ${factors.blastingDelayDays} days.` },
      { id: 'trans', factor: 'Rail/Road Transport Capacity', loss: transportLoss, color: '#8b5cf6', desc: `Evacuation transport capacity operating at ${factors.transportAvailability}%.` },
      { id: 'ore', factor: 'Ore Grade & Availability', loss: oreLoss, color: '#10b981', desc: `Run-of-mine ore availability is at ${factors.oreAvailability}%.` }
    ];

    const contributions: RiskContribution[] = rawContributions.map(c => ({
      id: c.id,
      factor: c.factor,
      contributionPct: Math.round((c.loss / totalRawLoss) * 100),
      color: c.color,
      impactDescription: c.desc
    })).sort((a, b) => b.contributionPct - a.contributionPct);

    // Normalize so sum equals 100%
    const sum = contributions.reduce((acc, curr) => acc + curr.contributionPct, 0);
    if (sum !== 100 && contributions.length > 0) {
      contributions[0].contributionPct += (100 - sum);
    }

    const topDriver = contributions[0];

    // Generate dynamic explanation
    let explanation = '';
    if (riskLevel === 'LOW') {
      explanation = `Production shortfall risk is LOW. Operational metrics indicate smooth mining throughput with ${topDriver.factor.toLowerCase()} being the minor contributing variable.`;
    } else {
      explanation = `Production shortfall risk is currently ${riskLevel} (${shortfallPct}% gap) because ${topDriver.factor.toLowerCase()} is the primary bottleneck (${topDriver.contributionPct}% contribution).`;
    }

    // Dynamic executive summary text generator
    const gapDirection = predictedProduction >= factors.productionTarget ? 'above' : 'below';
    const executiveSummary = `AI operational analysis indicates manganese prospectivity remains strong across core pit zones. Current 30-day production is forecast at ${predictedProduction.toLocaleString()} MT vs target of ${factors.productionTarget.toLocaleString()} MT (${gapDirection} target), resulting in a ${riskLevel} shortfall risk (${shortfallPct}% gap). ${topDriver.factor} represents the single largest operational vulnerability (${topDriver.contributionPct}% contribution). Immediate deployment of recommended mitigation actions is advised.`;

    return {
      shortfall,
      shortfallPct,
      riskLevel,
      contributions,
      explanation,
      executiveSummary
    };
  }
};
