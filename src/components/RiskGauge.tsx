import React from 'react';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  value: number; // 0 to 100
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  value,
  label,
  sublabel,
  color = '#A4B18A',
  size = 180
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size / 1.7 }}>
      <svg width={size} height={size / 2 + 10} className="overflow-visible">
        {/* Background Arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="#1D2517"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Animated Value Arc */}
        <motion.path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center">
        <span className="text-3xl font-extrabold text-[#F1F2E9] tracking-tight">{Math.round(value)}%</span>
        <p className="text-xs font-bold uppercase text-[#A4B18A] tracking-wider mt-0.5">{label}</p>
        {sublabel && <p className="text-[10px] text-[#71825B] font-mono mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};
