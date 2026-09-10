import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { X, CheckCheck, Bell, AlertTriangle, MapPin, Cpu, ShieldAlert, CheckCircle2, BellOff } from 'lucide-react';
import type { NotificationItem } from '../types';
import { Card, EmptyStateCard } from './ui/Card';

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
        return <ShieldAlert className="text-[#A4B18A]" size={18} />;
      case 'zone':
        return <MapPin className="text-[#A4B18A]" size={18} />;
      case 'equipment':
        return <AlertTriangle className="text-[#E4E7D8]" size={18} />;
      case 'ai':
        return <Cpu className="text-[#A4B18A]" size={18} />;
      default:
        return <CheckCircle2 className="text-[#71825B]" size={18} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0B0E09]/75 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md h-full bg-[#171D12] border-l border-[#252E1D] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-[#252E1D] flex items-center justify-between bg-[#10140D]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#1D2517] text-[#A4B18A] border border-[#252E1D]">
              <Bell size={18} />
            </div>
            <h3 className="font-extrabold text-[#F1F2E9] text-base tracking-tight">
              System Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-[#A4B18A] text-[#0B0E09] text-xs px-2 py-0.5 rounded-full font-extrabold font-mono">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-[#A4B18A] hover:text-[#F1F2E9] flex items-center gap-1 font-mono font-bold transition cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck size={16} />
                Mark read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#71825B] hover:text-[#F1F2E9] hover:bg-[#1D2517] transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <EmptyStateCard
              icon={BellOff}
              title="No Notifications"
              description="You have no unread operational alerts or system updates."
            />
          ) : (
            notifications.map((n) => (
              <Card
                key={n.id}
                variant="list"
                clickable
                padding="sm"
                onClick={() => handleNotificationClick(n)}
                className={`flex gap-3 items-start transition ${
                  n.read
                    ? 'opacity-60 bg-[#0B0E09]'
                    : 'bg-[#1D2517] border-[#71825B]/40 shadow-sm'
                }`}
              >
                <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-[#0B0E09] border border-[#252E1D]">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-xs font-extrabold truncate ${
                        !n.read ? 'text-[#F1F2E9]' : 'text-[#C0C6B2]'
                      }`}
                    >
                      {n.title}
                    </h4>
                    <span className="text-[10px] font-mono text-[#71825B] shrink-0">
                      {new Date(n.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-[#71825B] mt-1 line-clamp-2 font-sans">
                    {n.message}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-[#A4B18A] shrink-0 self-center" />
                )}
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#252E1D] bg-[#10140D] text-center text-xs font-mono text-[#71825B]">
          MOIL SMARTMINE Real-time Operations Engine
        </div>
      </div>
    </div>
  );
};
