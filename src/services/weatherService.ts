export interface CurrentWeather {
  temperatureC: number;
  humidityPct: number;
  rainfallMm: number;
  windSpeedKmH: number;
  precipitationProbability: number;
  weatherCode: number;
  conditionText: string;
  updatedAt: string;
  timezone: string;
}

export interface DailyForecastDay {
  date: string;
  dayName: string;
  weatherCode: number;
  conditionText: string;
  tempMaxC: number;
  tempMinC: number;
  rainfallMm: number;
  precipitationProbabilityPct: number;
  humidityPct: number;
  windSpeedKmH: number;
  soilMoisturePct: number;
  operationalRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RainfallOutlook {
  expected7DayRainfallMm: number;
  maxDailyRainfallMm: number;
  highestRainProbabilityPct: number;
  wetDaysCount: number;
  heavyRainDaysCount: number;
}

export interface OperationalImpact {
  id: string;
  factor: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impactDescription: string;
  recommendation: string;
}

export interface DewateringProtocol {
  alertTitle: string;
  protocolText: string;
  actionLevel: 'NORMAL' | 'CAUTION' | 'ALERT' | 'CRITICAL';
}

export interface NormalizedWeatherData {
  locationId: string;
  locationName: string;
  region: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  forecast: DailyForecastDay[];
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rainfallOutlook: RainfallOutlook;
  operationalImpacts: OperationalImpact[];
  dewateringProtocol: DewateringProtocol;
  fetchedAt: string;
}

// In-memory weather cache (10 min TTL)
const weatherCache = new Map<string, { timestamp: number; data: NormalizedWeatherData }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export class WeatherService {
  /**
   * Interpret WMO Weather Codes returned by Open-Meteo API
   */
  getWeatherConditionText(code: number): string {
    switch (code) {
      case 0:
        return 'Clear Sky';
      case 1:
        return 'Mainly Clear';
      case 2:
        return 'Partly Cloudy';
      case 3:
        return 'Overcast';
      case 45:
      case 48:
        return 'Fog & Heavy Haze';
      case 51:
        return 'Light Drizzle';
      case 53:
        return 'Moderate Drizzle';
      case 55:
        return 'Dense Drizzle';
      case 56:
      case 57:
        return 'Freezing Drizzle';
      case 61:
        return 'Slight Rain';
      case 63:
        return 'Moderate Rain';
      case 65:
        return 'Heavy Rain';
      case 66:
      case 67:
        return 'Freezing Rain';
      case 71:
        return 'Slight Snow';
      case 73:
        return 'Moderate Snow';
      case 75:
        return 'Heavy Snow';
      case 77:
        return 'Snow Grains';
      case 80:
        return 'Light Rain Showers';
      case 81:
        return 'Moderate Rain Showers';
      case 82:
        return 'Heavy Rain Showers';
      case 85:
      case 86:
        return 'Snow Showers';
      case 95:
        return 'Thunderstorm';
      case 96:
      case 99:
        return 'Thunderstorm with Hail';
      default:
        return 'Partly Cloudy';
    }
  }

  /**
   * Calculate operational weather risk from real measurements
   */
  calculateOperationalRisk(
    rainMm: number,
    precipProb: number,
    windKmH: number,
    code: number,
    soilMoisturePct: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (rainMm > 25 || [95, 96, 99].includes(code) || (rainMm > 15 && windKmH > 35)) {
      return 'CRITICAL';
    }
    if (rainMm > 12 || precipProb > 75 || [65, 82].includes(code) || (rainMm > 8 && soilMoisturePct > 65)) {
      return 'HIGH';
    }
    if (rainMm > 3 || precipProb > 45 || soilMoisturePct > 55 || windKmH > 25) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Fetch live weather data for a specific mining location using Open-Meteo REST API
   */
  async fetchLiveWeather(
    location: { id: string; locationId: string; locationName: string; region: string; latitude: number; longitude: number },
    bypassCache: boolean = false
  ): Promise<NormalizedWeatherData> {
    const cacheKey = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
    const now = Date.now();

    if (!bypassCache && weatherCache.has(cacheKey)) {
      const cached = weatherCache.get(cacheKey)!;
      if (now - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }

    const lat = location.latitude;
    const lon = location.longitude;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&hourly=relative_humidity_2m,soil_moisture_0_to_1cm&timezone=auto`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo API returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.current || !data.daily) {
        throw new Error('Invalid weather payload received from Open-Meteo provider.');
      }

      const currentRaw = data.current;
      const dailyRaw = data.daily;
      const timezone = data.timezone || 'UTC';

      // Parse current weather
      const currentCode = currentRaw.weather_code ?? 0;
      const currentTemp = Math.round(currentRaw.temperature_2m ?? 28);
      const currentHumidity = Math.round(currentRaw.relative_humidity_2m ?? 65);
      const currentRain = Number((currentRaw.precipitation ?? currentRaw.rain ?? 0).toFixed(1));
      const currentWind = Math.round(currentRaw.wind_speed_10m ?? 12);
      const currentPrecipProb = dailyRaw.precipitation_probability_max ? dailyRaw.precipitation_probability_max[0] ?? 20 : 20;

      const currentWeather: CurrentWeather = {
        temperatureC: currentTemp,
        humidityPct: currentHumidity,
        rainfallMm: currentRain,
        windSpeedKmH: currentWind,
        precipitationProbability: currentPrecipProb,
        weatherCode: currentCode,
        conditionText: this.getWeatherConditionText(currentCode),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timezone
      };

      // Parse 7-day forecast
      const forecastDays: DailyForecastDay[] = [];
      const times: string[] = dailyRaw.time || [];

      // Average hourly soil moisture for daily representation
      const hourlyMoisture: number[] = data.hourly?.soil_moisture_0_to_1cm || [];

      for (let i = 0; i < Math.min(7, times.length); i++) {
        const dateStr = times[i];
        const dateObj = new Date(dateStr);
        const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const code = dailyRaw.weather_code ? dailyRaw.weather_code[i] : 0;
        const maxTemp = Math.round(dailyRaw.temperature_2m_max ? dailyRaw.temperature_2m_max[i] : 30);
        const minTemp = Math.round(dailyRaw.temperature_2m_min ? dailyRaw.temperature_2m_min[i] : 22);
        const rainMm = Number((dailyRaw.precipitation_sum ? dailyRaw.precipitation_sum[i] ?? 0 : 0).toFixed(1));
        const precipProb = dailyRaw.precipitation_probability_max ? dailyRaw.precipitation_probability_max[i] ?? 0 : 0;
        const windSpeed = Math.round(dailyRaw.wind_speed_10m_max ? dailyRaw.wind_speed_10m_max[i] ?? 10 : 10);

        // Approximate average soil moisture percentage from m³/m³ (0.1 - 0.45)
        const dayHourlyMoistureSlice = hourlyMoisture.slice(i * 24, (i + 1) * 24);
        const avgMoistureRaw = dayHourlyMoistureSlice.length > 0
          ? dayHourlyMoistureSlice.reduce((a, b) => a + b, 0) / dayHourlyMoistureSlice.length
          : 0.3;
        const soilMoisturePct = Math.min(95, Math.max(20, Math.round(avgMoistureRaw * 200)));

        const dayHumidity = Math.min(98, Math.max(35, Math.round(currentHumidity + (rainMm > 5 ? 15 : -5))));

        const dayRisk = this.calculateOperationalRisk(rainMm, precipProb, windSpeed, code, soilMoisturePct);

        forecastDays.push({
          date: `${dayName} (${monthDay})`,
          dayName,
          weatherCode: code,
          conditionText: this.getWeatherConditionText(code),
          tempMaxC: maxTemp,
          tempMinC: minTemp,
          rainfallMm: rainMm,
          precipitationProbabilityPct: precipProb,
          humidityPct: dayHumidity,
          windSpeedKmH: windSpeed,
          soilMoisturePct,
          operationalRisk: dayRisk
        });
      }

      // 7-day Rainfall Outlook calculation
      const totalRainfall = Number(forecastDays.reduce((acc, curr) => acc + curr.rainfallMm, 0).toFixed(1));
      const maxDailyRain = Math.max(...forecastDays.map((f) => f.rainfallMm));
      const maxProb = Math.max(...forecastDays.map((f) => f.precipitationProbabilityPct));
      const wetDays = forecastDays.filter((f) => f.rainfallMm >= 1.0).length;
      const heavyRainDays = forecastDays.filter((f) => f.rainfallMm >= 15.0).length;

      const rainfallOutlook: RainfallOutlook = {
        expected7DayRainfallMm: totalRainfall,
        maxDailyRainfallMm: maxDailyRain,
        highestRainProbabilityPct: maxProb,
        wetDaysCount: wetDays,
        heavyRainDaysCount: heavyRainDays
      };

      // Overall risk level across the 7-day window
      const hasCritical = forecastDays.some((f) => f.operationalRisk === 'CRITICAL');
      const hasHigh = forecastDays.some((f) => f.operationalRisk === 'HIGH');
      const hasMed = forecastDays.some((f) => f.operationalRisk === 'MEDIUM');
      const overallRisk = hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : hasMed ? 'MEDIUM' : 'LOW';

      // Mining Operational Impacts
      const operationalImpacts: OperationalImpact[] = [];

      if (totalRainfall > 25 || maxDailyRain > 15) {
        operationalImpacts.push({
          id: 'imp-rain',
          factor: 'Haul Road Mudding & Traction Risk',
          severity: maxDailyRain > 25 ? 'CRITICAL' : 'HIGH',
          impactDescription: `Forecast rainfall of ${maxDailyRain} mm/day creates haul road slipperiness and pit floor mudding at ${location.locationName}.`,
          recommendation: 'Enforce 20 km/h haulage speed limits and apply crushed aggregate to main pit ramps.'
        });
      }

      if (forecastDays.some((f) => f.soilMoisturePct > 65)) {
        operationalImpacts.push({
          id: 'imp-[#02]',
          factor: 'Bench Stability & Heavy Equipment Mobility',
          severity: 'HIGH',
          impactDescription: 'Soil moisture saturation exceeds 65%, reducing ground bearing capacity for heavy excavator and drill rig positioning.',
          recommendation: 'Inspect bench crests for slope displacement and position heavy shovels on solid rock mats.'
        });
      }

      if (forecastDays.some((f) => [95, 96, 99].includes(f.weatherCode))) {
        operationalImpacts.push({
          id: 'imp-lightning',
          factor: 'Thunderstorm & Lightning Operational Suspend',
          severity: 'CRITICAL',
          impactDescription: 'Electrical thunderstorm activity forecast. Outdoor blasting and high-wall mining present severe safety hazards.',
          recommendation: 'Suspend explosive charging and shelter pit personnel immediately upon lightning sensor detection.'
        });
      }

      if (currentWeather.windSpeedKmH > 28 || forecastDays.some((f) => f.windSpeedKmH > 32)) {
        operationalImpacts.push({
          id: 'imp-wind',
          factor: 'High Wind & Mobile Crane Safety Concern',
          severity: 'MEDIUM',
          impactDescription: 'Wind gusts reaching 30+ km/h impact high-reach crane lifts and dust control at stockyards.',
          recommendation: 'Halt elevated crane lifts and engage water sprinkler trucks along active transport corridors.'
        });
      }

      if (operationalImpacts.length === 0) {
        operationalImpacts.push({
          id: 'imp-normal',
          factor: 'Standard Operating Weather Window',
          severity: 'LOW',
          impactDescription: 'Live weather measurements indicate normal atmospheric conditions with minimal rain or wind disruption.',
          recommendation: 'Proceed with planned drilling, blasting, and dumper haulage schedules.'
        });
      }

      // Pit Dewatering Protocol text
      let dewateringProtocol: DewateringProtocol;
      if (totalRainfall > 35 || maxDailyRain > 20) {
        dewateringProtocol = {
          alertTitle: 'Monsoon Pit Dewatering & High Rainfall Protocol Active',
          protocolText: `Heavy rainfall forecast for ${location.locationName} (${lat}° N, ${lon}° E). Expected 7-day accumulation of ${totalRainfall} mm requires immediate deployment of high-head submersible pumps at Bench sumps. Maintain active pit-water monitoring.`,
          actionLevel: 'CRITICAL'
        };
      } else if (totalRainfall > 10 || maxProb > 50) {
        dewateringProtocol = {
          alertTitle: 'Precipitation Advisory & Bench Dewatering Preparation',
          protocolText: `Moderate precipitation forecast for ${location.locationName}. Inspect pit drainage channels, verify standby diesel pump readiness, and monitor bench runoff volumes during rain windows.`,
          actionLevel: 'CAUTION'
        };
      } else {
        dewateringProtocol = {
          alertTitle: 'Normal Pit & Haulage Operating Conditions',
          protocolText: `Clear to moderate weather forecast for ${location.locationName}. No significant rain inundation or road mobility restrictions indicated. Standard excavation and hauling proceed as scheduled.`,
          actionLevel: 'NORMAL'
        };
      }

      const normalizedData: NormalizedWeatherData = {
        locationId: location.locationId || location.id,
        locationName: location.locationName,
        region: location.region,
        latitude: lat,
        longitude: lon,
        current: currentWeather,
        forecast: forecastDays,
        overallRisk,
        rainfallOutlook,
        operationalImpacts,
        dewateringProtocol,
        fetchedAt: new Date().toISOString()
      };

      // Save to cache
      weatherCache.set(cacheKey, { timestamp: now, data: normalizedData });

      return normalizedData;
    } catch (err: any) {
      console.error(`Error fetching live weather from Open-Meteo for ${location.locationName}:`, err);
      throw new Error(`Live weather data could not be retrieved for ${location.locationName}. Please check network connection or try again.`);
    }
  }
}

export const weatherService = new WeatherService();
