import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Search, MapPin, Truck, AlertTriangle, ArrowRight, X, Cpu, Layers } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { zones, equipment, recommendations } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Search Pages
  const pages = [
    { title: 'Executive Dashboard', path: '/dashboard', icon: Layers },
    { title: 'Manganese GIS Map & Reserves', path: '/manganese-map', icon: MapPin },
    { title: 'Production Forecasting & Factors', path: '/production', icon: Cpu },
    { title: 'Shortfall & Operational Risk Analysis', path: '/shortfall', icon: AlertTriangle },
    { title: 'Mining Equipment Fleet Management', path: '/equipment', icon: Truck },
    { title: 'Weather & Monsoon Impact Operations', path: '/weather', icon: Layers },
    { title: 'CSV Data Upload & Validation Engine', path: '/data', icon: Layers },
    { title: 'AI Model Architecture & Metrics', path: '/models', icon: Cpu },
    { title: 'Application Settings & System Reset', path: '/settings', icon: Layers },
  ];

  const matchedPages = pages.filter((p) => p.title.toLowerCase().includes(normalizedQuery));

  const matchedZones = zones.filter(
    (z) => z.zoneId.toLowerCase().includes(normalizedQuery) || z.name.toLowerCase().includes(normalizedQuery)
  );

  const matchedEquip = equipment.filter(
    (e) => e.equipmentId.toLowerCase().includes(normalizedQuery) || e.name.toLowerCase().includes(normalizedQuery)
  );

  const matchedRecs = recommendations.filter(
    (r) => r.title.toLowerCase().includes(normalizedQuery) || r.category.toLowerCase().includes(normalizedQuery)
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-700/50 bg-dark-900/60">
          <Search className="text-brand-400 mr-3 shrink-0" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search zones, equipment, AI recommendations, pages... (Ctrl + K)"
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 ml-2 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-3 space-y-4 text-sm">
          {/* Quick Pages */}
          {matchedPages.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pages</div>
              <div className="space-y-1 mt-1">
                {matchedPages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.path}
                      onClick={() => handleSelect(p.path)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-brand-500/10 hover:text-brand-300 text-slate-300 transition text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className="text-slate-400 group-hover:text-brand-400" />
                        <span>{p.title}</span>
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-brand-400 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zones */}
          {matchedZones.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Geospatial Zones</div>
              <div className="space-y-1 mt-1">
                {matchedZones.slice(0, 5).map((z) => (
                  <button
                    key={z.zoneId}
                    onClick={() => handleSelect(`/manganese-map?zone=${z.zoneId}`)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-brand-500/10 text-slate-300 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-emerald-400" />
                      <div>
                        <span className="font-semibold text-slate-100">{z.name}</span>
                        <span className="text-xs text-slate-400 ml-2 font-mono">({z.zoneId})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        z.potentialLevel === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {z.prospectivityScore}% {z.potentialLevel}
                      </span>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-brand-400 transition" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {matchedEquip.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Mining Fleet</div>
              <div className="space-y-1 mt-1">
                {matchedEquip.slice(0, 5).map((e) => (
                  <button
                    key={e.equipmentId}
                    onClick={() => handleSelect('/equipment')}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-brand-500/10 text-slate-300 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Truck size={16} className="text-amber-400" />
                      <div>
                        <span className="font-semibold text-slate-100">{e.name}</span>
                        <span className="text-xs text-slate-400 ml-2 font-mono">[{e.equipmentId}]</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      e.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {e.status} ({e.availability}%)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {matchedRecs.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">AI Recommendations</div>
              <div className="space-y-1 mt-1">
                {matchedRecs.slice(0, 4).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect('/dashboard')}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-brand-500/10 text-slate-300 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={16} className="text-purple-400" />
                      <span className="truncate max-w-sm">{r.title}</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase font-semibold">
                      {r.priority} PRIORITY
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedPages.length === 0 && matchedZones.length === 0 && matchedEquip.length === 0 && matchedRecs.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              No matching SMARTMINE entities found for "<span className="text-slate-200">{query}</span>"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-700/40 bg-dark-950/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with <kbd className="px-1.5 py-0.5 bg-dark-800 border border-slate-700 rounded text-slate-300 font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-dark-800 border border-slate-700 rounded text-slate-300 font-mono">↓</kbd></span>
          <span>Close with <kbd className="px-1.5 py-0.5 bg-dark-800 border border-slate-700 rounded text-slate-300 font-mono">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
