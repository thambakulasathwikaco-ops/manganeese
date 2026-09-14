import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  ShieldAlert,
  Truck,
  CloudRain,
  Database,
  BrainCircuit,
  Sliders
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { zones } = useAppStore();
  const prioritizedCount = zones.filter((z) => z.priority).length;

  const sections = [
    {
      title: 'INTELLIGENCE',
      items: [
        { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Manganese Map & Reserves', path: '/manganese-map', icon: MapPin, badge: prioritizedCount > 0 ? `${prioritizedCount} Priority` : undefined },
        { label: 'Production Forecast', path: '/production', icon: TrendingUp },
        { label: 'Shortfall & Risk', path: '/shortfall', icon: ShieldAlert },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Mining Fleet', path: '/equipment', icon: Truck },
        { label: 'Weather Operations', path: '/weather', icon: CloudRain },
        { label: 'Data Integration', path: '/data', icon: Database },
      ]
    },
    {
      title: 'AI',
      items: [
        { label: 'Analyzed Locations', path: '/analyzed-locations', icon: BrainCircuit },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings & Controls', path: '/settings', icon: Sliders },
      ]
    }
  ];

  return (
    <aside
      className={`fixed lg:sticky top-16 z-20 h-[calc(100vh-4rem)] w-64 bg-[#0D120C]/95 lg:bg-transparent flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? 'translate-x-0 bg-[#0D120C]/95 backdrop-blur-xl border-r border-clay-border' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="py-4 px-3 space-y-6 overflow-y-auto">
        
        {/* Brand Header in Sidebar */}
        <div
          onClick={() => navigate('/')}
          className="px-3 pt-1 pb-3 cursor-pointer group border-b border-[#182016]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#182016] border border-[#A9B58D]/30 flex items-center justify-center text-[#F1F1E9] font-black text-xs">
              M
            </div>
            <div>
              <span className="font-extrabold text-[#F1F1E9] tracking-tight text-xs uppercase block">
                MANGANESE MINING
              </span>
              <span className="font-mono text-[9px] text-[#A9B58D] font-bold uppercase tracking-wider block">
                INTELLIGENCE
              </span>
            </div>
          </div>
          <p className="text-[9px] font-mono text-[#9EA493] tracking-widest mt-1.5 uppercase">
            EXPLORE. ANALYZE. PLAN. PRODUCE.
          </p>
        </div>

        {/* Section Groups */}
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-1.5">
            <div className="px-3 text-[10px] font-mono font-bold uppercase text-clay-muted tracking-widest">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
                      isActive
                        ? 'bg-[#1D2517] text-[#F1F2E9] font-bold shadow-clay-raised border border-clay-border active:translate-y-px active:shadow-clay-pressed'
                        : 'text-[#C0C6B2] hover:text-[#F1F2E9] hover:bg-[#171D12] hover:translate-y-[-1px] active:translate-y-px'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#71825B] rounded-r-md" />
                      )}

                      <div className="flex items-center gap-3 pl-1">
                        <Icon
                          size={15}
                          className={`transition duration-150 ${
                            isActive ? 'text-[#A4B18A]' : 'text-[#858E78] group-hover:text-[#C0C6B2]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className="text-[9px] font-mono font-bold bg-[#0B0E09] text-[#A4B18A] px-2 py-0.5 rounded-md border border-clay-border shadow-inner">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-clay-border">
        <div className="px-3 py-2 text-[10px] font-mono text-clay-muted flex items-center justify-between bg-[#0B0E09] rounded-xl border border-clay-border shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A4B18A] animate-ai-pulse" />
            <span className="text-chrome-plat font-bold">AI ENGINE ONLINE</span>
          </div>
          <span className="text-[9px] text-clay-muted">v4.2</span>
        </div>
      </div>
    </aside>
  );
};


