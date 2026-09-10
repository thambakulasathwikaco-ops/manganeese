import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { CloudRain, Sun, CloudLightning, ShieldAlert, Sparkles } from 'lucide-react';
import type { WeatherRisk } from '../types';
import { EventCard, InfoCard, Card } from '../components/ui/Card';

export const WeatherPage: React.FC = () => {
  const { weather, updateWeatherDay, productionFactors } = useAppStore();

  const getConditionIcon = (condition: string) => {
    if (condition.includes('Thunderstorm') || condition.includes('Heavy')) {
      return CloudLightning;
    }
    if (condition.includes('Rain') || condition.includes('Showers')) {
      return CloudRain;
    }
    return Sun;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">
              Weather & Monsoon Impact Operations
            </h1>
            <span className="bg-[#0B0E09] border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              METEOROLOGICAL MODEL
            </span>
          </div>
          <p className="text-xs text-[#71825B] font-mono mt-1">
            Dongri Buzurg & Mansar Pit Dewatering & Rain Inundation Risk Control
          </p>
        </div>

        <Card variant="default" padding="sm" className="flex items-center gap-2 self-start sm:self-auto">
          <ShieldAlert size={16} className="text-[#A4B18A]" />
          <span className="text-xs font-mono text-[#71825B]">
            Current Active Risk: <strong className="text-[#F1F2E9]">{productionFactors.rainfallRiskLevel}</strong>
          </span>
        </Card>
      </div>

      {/* 7-Day Weather Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {weather.map((day, idx) => (
          <EventCard
            key={day.date}
            title={day.condition}
            subtitle={`${day.day} • ${day.date}`}
            icon={getConditionIcon(day.condition)}
            staggerIndex={idx}
            metrics={[
              { label: 'Rainfall', value: `${day.rainfallMm} mm` },
              { label: 'Temp', value: `${day.temperatureC}°C` },
              { label: 'Moisture', value: `${day.soilMoisturePct}%` }
            ]}
            actions={
              <div className="w-full space-y-1 pt-1">
                <span className="text-[9px] uppercase font-mono text-[#71825B] font-bold tracking-wider block text-center">
                  Bench Impact
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(['LOW', 'MEDIUM', 'HIGH'] as WeatherRisk[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => updateWeatherDay(day.date, { weatherRisk: r })}
                      className={`py-1 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                        day.weatherRisk === r
                          ? 'btn-clay-primary text-[#0B0E09]'
                          : 'bg-[#0B0E09] border border-[#252E1D] text-[#71825B] hover:text-[#F1F2E9]'
                      }`}
                    >
                      {r[0]}
                    </button>
                  ))}
                </div>
              </div>
            }
          />
        ))}
      </div>

      {/* Operational Guidelines Box */}
      <InfoCard
        icon={Sparkles}
        title="Monsoon Pit Dewatering & Haul Road Protocols"
        description="Heavy rainfall in the Dongri Buzurg pit bench horizon requires immediate activation of high-head submersible pumps at Bench #4. Soil moisture exceeding 70% mandates speed restrictions on main haulage ramps to prevent dumper skidding."
      />
    </div>
  );
};
