import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { X, CheckCheck, Bell, AlertTriangle, MapPin, Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();

  if (!isOpen) return null;

  const handleNotificationClick = (n: NotificationItem) => {
    markNotificationRead(n.id);
    if (n.link) {
      navigate(n.link);
    }
    onClose();
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'risk':
        return <ShieldAlert className="text-red-400" size={18} />;
      case 'zone':
        return <MapPin className="text-emerald-400" size={18} />;
      case 'equipment':
        return <AlertTriangle className="text-amber-400" size={18} />;
      case 'ai':
        return <Cpu className="text-purple-400" size={18} />;
      default:
        return <CheckCircle2 className="text-blue-400" size={18} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-dark-950/60 backdrop-blur-xs flex justify-end">
      <div className="glass-panel w-full max-w-md h-full border-l border-slate-700/60 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-dark-900/60">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-brand-400" />
            <h3 className="font-bold text-slate-100 text-lg">System Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-brand-500 text-dark-950 text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold transition"
                title="Mark all as read"
              >
                <CheckCheck size={16} />
                Mark read
              </button>
            )}
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No notifications available.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex gap-3 ${
                  n.read
                    ? 'bg-dark-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-dark-850/80 border-brand-500/30 text-slate-200 hover:border-brand-500/60 shadow-sm'
                }`}
              >
                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-semibold truncate ${!n.read ? 'text-slate-100' : 'text-slate-300'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0 self-center" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700/50 bg-dark-950/60 text-center text-xs text-slate-400">
          MOIL SMARTMINE Real-time Operations Engine
        </div>
      </div>
    </div>
  );
};
