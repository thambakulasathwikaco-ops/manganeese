import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { CommandPalette } from './CommandPalette';
import { NotificationDrawer } from './NotificationDrawer';
import { Search, Bell, Settings, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { notifications } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPageMeta = (path: string) => {
    switch (path) {
      case '/dashboard':
        return { title: 'Executive Operations Dashboard', sub: 'Real-time mining metrics & AI decision pipeline' };
      case '/manganese-map':
        return { title: 'Manganese GIS Prospectivity Map', sub: 'Spatial orebody core analysis & zone priority' };
      case '/production':
        return { title: 'Production Forecasting Engine', sub: '30-day multi-factor operational yield model' };
      case '/shortfall':
        return { title: 'Shortfall & Risk Attribution', sub: 'Operational bottleneck decomposition' };
      case '/equipment':
        return { title: 'Mining Fleet Operations', sub: 'Equipment availability & downtime status' };
      case '/weather':
        return { title: 'Weather & Climate Impact', sub: 'Precipitation risk & soil moisture forecasting' };
      case '/data':
        return { title: 'CSV Data Integration', sub: 'Core assay & dataset quality assurance' };
      case '/models':
        return { title: 'AI Model Architecture', sub: 'Ensemble model telemetry & training status' };
      case '/settings':
        return { title: 'System Settings', sub: 'Operational thresholds & user preferences' };
      default:
        return { title: 'MANGANESE MINING INTELLIGENCE', sub: 'Explore. Analyze. Plan. Produce.' };
    }
  };

  const meta = getPageMeta(location.pathname);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#0B100B]/95 backdrop-blur-xl border-b border-[#182016] px-4 lg:px-6 flex items-center justify-between">
        
        {/* Left: Mobile Menu Toggle & Page Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-[#9EA493] hover:text-[#F1F1E9] hover:bg-[#182016] transition cursor-pointer"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate('/dashboard')}
              className="lg:hidden flex items-center gap-2 cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-[#182016] border border-[#A9B58D]/30 flex items-center justify-center text-[#F1F1E9] font-black text-xs">M</div>
              <span className="font-extrabold text-[#F1F1E9] tracking-tight text-xs uppercase">MANGANESE MINING</span>
            </div>

            <div className="hidden lg:block">
              <h1 className="text-sm font-extrabold text-[#F1F1E9] tracking-tight">{meta.title}</h1>
              <p className="text-[10px] font-mono text-[#9EA493]">{meta.sub}</p>
            </div>
          </div>
        </div>

        {/* Right: Command Controls */}
        <div className="flex items-center gap-3">
          
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl clay-recessed text-clay-muted hover:text-chrome-plat transition text-xs font-mono border border-clay-border cursor-pointer"
          >
            <Search size={14} className="text-[#A4B18A]" />
            <span className="hidden sm:inline">Search SMARTMINE...</span>
            <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.5 bg-[#0B0E09] rounded-md text-clay-muted border border-clay-border">
              Ctrl K
            </kbd>
          </button>

          {/* Notification Button */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-xl text-[#C0C6B2] hover:text-[#F1F2E9] hover:bg-[#171D12] transition cursor-pointer"
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A4B18A] animate-ai-pulse" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-xl text-[#C0C6B2] hover:text-[#F1F2E9] hover:bg-[#171D12] transition cursor-pointer"
            title="System Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </header>

      {/* Modals & Drawers */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};


