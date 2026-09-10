import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { RefreshCw, Trash2, CheckCircle2, Sliders } from 'lucide-react';
import { PrimaryCard, CardBadge } from '../components/ui/Card';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData, resetAppState } = useAppStore();

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">
            System Settings & Controls
          </h1>
          <span className="bg-[#0B0E09] border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            PREFERENCES
          </span>
        </div>
        <p className="text-xs text-[#71825B] font-mono mt-1">
          Customize UI aesthetics, animation fidelity, notifications, and application state reset
        </p>
      </div>

      {/* Settings Options Box */}
      <PrimaryCard title="Global System Preferences" icon={Sliders}>
        <div className="space-y-6">
          {/* Animation Intensity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1D2517]">
            <div>
              <h3 className="font-bold text-[#F1F2E9] text-sm">Animation Intensity</h3>
              <p className="text-xs text-[#71825B]">
                Controls Framer Motion transitions and card entrance speed
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 bg-[#0B0E09] rounded-xl font-mono text-xs border border-[#252E1D]">
              {(['low', 'medium', 'high'] as const).map((intensity) => (
                <button
                  key={intensity}
                  onClick={() => updateSettings({ animationIntensity: intensity })}
                  className={`px-3 py-1.5 rounded-lg capitalize font-bold text-xs transition cursor-pointer ${
                    settings.animationIntensity === intensity
                      ? 'btn-clay-primary text-[#0B0E09] shadow-sm'
                      : 'text-[#71825B] hover:text-[#F1F2E9]'
                  }`}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1D2517]">
            <div>
              <h3 className="font-bold text-[#F1F2E9] text-sm">System Notifications</h3>
              <p className="text-xs text-[#71825B]">
                Receive operational shortfall alerts and zone priority notifications
              </p>
            </div>
            <button
              onClick={() =>
                updateSettings({ notificationsEnabled: !settings.notificationsEnabled })
              }
              className={`w-12 h-6 rounded-full transition p-1 flex items-center cursor-pointer ${
                settings.notificationsEnabled
                  ? 'bg-[#A4B18A] justify-end'
                  : 'bg-[#0B0E09] border border-[#252E1D] justify-start'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  settings.notificationsEnabled ? 'bg-[#0B0E09]' : 'bg-[#71825B]'
                }`}
              />
            </button>
          </div>

          {/* Demo Mode Status */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1D2517]">
            <div>
              <h3 className="font-bold text-[#F1F2E9] text-sm">Synthetic Demo Mode</h3>
              <p className="text-xs text-[#71825B]">
                Controls fallback to client-side synthetic mining data
              </p>
            </div>
            <CardBadge variant="olive">
              <CheckCircle2 size={14} /> ACTIVE DEMO
            </CardBadge>
          </div>

          {/* State Resets */}
          <div className="pt-2 space-y-3">
            <h3 className="font-bold text-[#F1F2E9] text-sm">Application State Maintenance</h3>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={resetDemoData}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B0E09] text-[#F1F2E9] font-bold text-xs transition flex items-center justify-center gap-2 hover:text-[#A4B18A] border border-[#252E1D] cursor-pointer"
              >
                <RefreshCw size={15} className="text-[#A4B18A]" />
                <span>RESET DEMO DATA</span>
              </button>

              <button
                onClick={resetAppState}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B0E09] border border-[#71825B] text-[#71825B] font-bold text-xs transition flex items-center justify-center gap-2 hover:text-[#F1F2E9] hover:bg-[#1D2517] cursor-pointer"
              >
                <Trash2 size={15} />
                <span>RESET APPLICATION (CLEAR LOCALSTORAGE)</span>
              </button>
            </div>
          </div>
        </div>
      </PrimaryCard>
    </div>
  );
};
