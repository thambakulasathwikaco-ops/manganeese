import type { ProductionFactors, ProductionForecastPoint } from '../types';

export const forecastService = {
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
    const blastingFactor = Math.max(0.6, 1.0 - (blastingDelayDays * 0.025));

    const rawForecast = baseProduction * equipmentFactor * weatherFactor * transportFactor * oreFactor * blastingFactor * operationalFactor;
    const predictedProduction = Math.round(rawForecast);

    const shortfall = Math.max(0, productionTarget - predictedProduction);
    const shortfallPct = productionTarget > 0 ? parseFloat(((shortfall / productionTarget) * 100).toFixed(1)) : 0;

    // Confidence model
    const variability = Math.abs(equipmentAvailability - 85) + (rainfallRiskLevel === 'HIGH' ? 15 : 5);
    const confidencePct = Math.round(Math.min(96, Math.max(68, 92 - variability * 0.4)));

    return {
      predictedProduction,
      shortfall,
      shortfallPct,
      confidencePct
    };
  },

  generateForecastSeries(factors: ProductionFactors, timeframe: '7D' | '30D' | '90D' | '6M'): ProductionForecastPoint[] {
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

      // Add controlled realistic variance
      const noise = (Math.sin(i * 1.5) * 0.08) + 1;
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
};
