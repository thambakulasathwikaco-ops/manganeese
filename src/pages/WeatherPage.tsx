import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { CloudRain, Sun, CloudLightning, ShieldAlert, Sparkles } from 'lucide-react';
import type { WeatherRisk } from '../types';

export const WeatherPage: React.FC = () => {
  const { weather, updateWeatherDay, productionFactors } = useAppStore();

  const getConditionIcon = (condition: string) => {
    if (condition.includes('Thunderstorm') || condition.includes('Heavy')) {
      return <CloudLightning size={24} className="text-[#F1F2E9]" />;
    }
    if (condition.includes('Rain') || condition.includes('Showers')) {
      return <CloudRain size={24} className="text-[#A4B18A]" />;
    }
    return <Sun size={24} className="text-[#71825B]" />;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">Weather & Monsoon Impact Operations</h1>
            <span className="clay-recessed border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#0B0E09]">
              METEOROLOGICAL MODEL
            </span>
          </div>
          <p className="text-xs text-[#71825B] font-mono mt-1">
            Dongri Buzurg & Mansar Pit Dewatering & Rain Inundation Risk Control
          </p>
        </div>

        <div className="clay-card px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 self-start sm:self-auto border border-[#252E1D]">
          <ShieldAlert size={16} className="text-[#A4B18A]" />
          <span className="text-[#71825B]">Current Active Risk: <strong className="text-[#F1F2E9]">{productionFactors.rainfallRiskLevel}</strong></span>
        </div>
      </div>

      {/* 7-Day Weather Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {weather.map((day) => (
          <div
            key={day.date}
            className="clay-card p-4 rounded-2xl flex flex-col justify-between items-center text-center space-y-3 border border-[#252E1D]"
          >
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#71825B]">{day.day} • {day.date}</span>
              <div className="mt-2 flex justify-center">{getConditionIcon(day.condition)}</div>
              <h4 className="font-extrabold text-[#F1F2E9] text-xs mt-2 line-clamp-1">{day.condition}</h4>
            </div>

            {/* Metrics */}
            <div className="w-full text-xs font-mono space-y-1.5 clay-recessed p-2.5 rounded-xl border border-[#252E1D]">
              <div className="flex justify-between">
                <span className="text-[#71825B]">Rainfall:</span>
                <span className="text-[#A4B18A] font-bold">{day.rainfallMm} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71825B]">Temp:</span>
                <span className="text-[#F1F2E9]">{day.temperatureC}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71825B]">Moisture:</span>
                <span className="text-[#A4B18A]">{day.soilMoisturePct}%</span>
              </div>
            </div>

            {/* Interactive Risk Toggle */}
            <div className="w-full space-y-1 pt-1">
              <span className="text-[9px] uppercase font-mono text-[#71825B] font-bold tracking-wider">Bench Impact</span>
              <div className="grid grid-cols-3 gap-1">
                {(['LOW', 'MEDIUM', 'HIGH'] as WeatherRisk[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => updateWeatherDay(day.date, { weatherRisk: r })}
                    className={`py-1 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                      day.weatherRisk === r
                        ? 'btn-clay-primary text-[#0B0E09]'
                        : 'clay-recessed text-[#71825B] hover:text-[#F1F2E9]'
                    }`}
                  >
                    {r[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Guidelines Box */}
      <div className="clay-card p-6 rounded-2xl space-y-3 border border-[#252E1D]">
        <div className="flex items-center gap-2 text-[#A4B18A] font-bold text-sm">
          <Sparkles size={18} />
          <span className="text-[#F1F2E9] font-extrabold">Monsoon Pit Dewatering & Haul Road Protocols</span>
        </div>
        <p className="text-xs text-[#71825B] leading-relaxed font-sans">
          Heavy rainfall in the Dongri Buzurg pit bench horizon requires immediate activation of high-head submersible pumps at Bench #4. Soil moisture exceeding 70% mandates speed restrictions on main haulage ramps to prevent dumper skidding.
        </p>
      </div>
    </div>
  );
};

