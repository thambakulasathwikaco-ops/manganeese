import type { ProductionFactors, RiskContribution, RiskLevel } from '../types';
import { forecastService } from './forecastService';

export const riskService = {
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
