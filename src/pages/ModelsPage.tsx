import React from 'react';
import { AI_MODELS } from '../data/initialData';
import { Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export const ModelsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">AI Model Architecture & Metrics</h1>
            <span className="clay-recessed border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#0B0E09]">
              NEURAL ARCHITECTURE
            </span>
          </div>
          <p className="text-xs text-[#71825B] font-mono mt-1">
            Transparent Breakdown of Machine Learning & Spatial Intelligence Algorithms
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-[#A4B18A] font-mono text-xs bg-[#1D2517] px-3 py-1.5 rounded-xl border border-[#71825B] font-bold self-start sm:self-auto uppercase tracking-wider">
          <Sparkles size={14} />
          PROTOTYPE / SAMPLE EVALUATION
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {AI_MODELS.map((model) => (
          <div
            key={model.id}
            className="clay-card p-6 rounded-2xl space-y-4 relative overflow-hidden border border-[#252E1D]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1D2517]">
              <div className="flex items-center gap-3">
                <div className="p-3 clay-recessed rounded-xl text-[#A4B18A] border border-[#252E1D]">
                  <Cpu size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#71825B]">{model.type}</span>
                  <h3 className="text-lg font-extrabold text-[#F1F2E9]">{model.name}</h3>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="clay-recessed text-[#A4B18A] px-3 py-1 rounded-full border border-[#71825B] font-bold flex items-center gap-1 bg-[#1D2517]">
                  <CheckCircle2 size={14} />
                  {model.status}
                </span>
                <span className="text-[#71825B]">Trained: {model.lastTrained}</span>
              </div>
            </div>

            {/* Purpose */}
            <p className="text-xs text-[#71825B] leading-relaxed font-sans">{model.purpose}</p>

            {/* Inputs & Outputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="clay-recessed p-4 rounded-xl space-y-2 border border-[#252E1D]">
                <span className="text-[#71825B] uppercase font-bold text-[10px] tracking-wider">Model Feature Inputs</span>
                <ul className="space-y-1.5 text-[#F1F2E9]">
                  {model.inputs.map((inp, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A4B18A]" />
                      {inp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="clay-recessed p-4 rounded-xl space-y-3 border border-[#252E1D]">
                <div>
                  <span className="text-[#71825B] uppercase font-bold text-[10px] tracking-wider">Predicted Output Signal</span>
                  <div className="text-[#F1F2E9] font-bold mt-0.5">{model.output}</div>
                </div>
                <div>
                  <span className="text-[#71825B] uppercase font-bold text-[10px] tracking-wider">Algorithm Architecture</span>
                  <div className="text-[#A4B18A] font-bold mt-0.5">{model.algorithm}</div>
                </div>
                <div>
                  <span className="text-[#71825B] uppercase font-bold text-[10px] tracking-wider">Validation Metric</span>
                  <div className="text-[#A4B18A] font-bold mt-0.5">{model.accuracyMetric}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

