import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="clay-card p-8 rounded-2xl max-w-md w-full space-y-4 border border-[#252E1D]">
        <div className="w-16 h-16 bg-[#0B0E09] rounded-2xl flex items-center justify-center mx-auto text-[#A4B18A] border border-[#252E1D]">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-black text-[#F1F2E9]">404 — Route Not Found</h2>
        <p className="text-xs text-[#71825B] font-mono">
          The requested SMARTMINE operational view does not exist or has been relocated.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 px-4 btn-clay-primary text-[#0B0E09] font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
        >
          <Home size={16} />
          Return to Executive Dashboard
        </button>
      </div>
    </div>
  );
};

