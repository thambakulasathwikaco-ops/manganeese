import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/60 py-6 px-6 bg-dark-950 text-xs text-slate-400 font-mono flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <span className="text-slate-300 font-bold">MOIL SMARTMINE AI</span> — Integrated Prospectivity, Forecasting & Risk Engine
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <span>Dongri Buzurg / Mansar Mining Belt</span>
        <span>•</span>
        <span>Version 4.2 Production Prototype</span>
      </div>
    </footer>
  );
};
