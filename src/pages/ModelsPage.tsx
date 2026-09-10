import React from 'react';
import { AI_MODELS } from '../data/initialData';
import { Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { PrimaryCard, CardBadge } from '../components/ui/Card';

export const ModelsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">
              AI Model Architecture & Metrics
            </h1>
            <span className="bg-[#0B0E09] border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
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
      <div className="space-y-6">
        {AI_MODELS.map((model, idx) => (
          <PrimaryCard
            key={model.id}
            title={model.name}
            subtitle={model.type}
            icon={Cpu}
            staggerIndex={idx}
            action={
              <div className="flex items-center gap-3 font-mono text-xs">
                <CardBadge variant="olive">
                  <CheckCircle2 size={13} />
                  {model.status}
                </CardBadge>
                <span className="text-[#71825B]">Trained: {model.lastTrained}</span>
              </div>
            }
          >
            <p className="text-xs text-[#71825B] leading-relaxed font-sans mt-2">{model.purpose}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mt-4">
              <div className="bg-[#0B0E09] p-4 rounded-xl space-y-2 border border-[#252E1D]">
                <span className="text-[#71825B] uppercase font-bold text-[10px] tracking-wider">
                  Model Feature Inputs
                </span>
                <ul className="space-y-1.5 text-[#F1F2E9]">
                  {model.inputs.map((inp, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A4B18A]" />
                      {inp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0B0E09] p-4 rounded-xl space-y-3 border border-[#252E1D]">
                <div>
                  <span className="text-[#71825B] uppercase font-bold text-[10px] tracking-wider">
                    Predicted Output Signal
                  </span>
                  <div className="text-[#F1F2E9] font-bold mt-0.5">{model.output}</div>
                </div>
                <div>
                  <span className="text-[#71825B] uppercase font-bold text-[10px] tracking-wider">
                    Algorithm Architecture
                  </span>
                  <div className="text-[#A4B18A] font-bold mt-0.5">{model.algorithm}</div>
                </div>
                <div>
                  <span className="text-[#71825B] uppercase font-bold text-[10px] tracking-wider">
                    Validation Metric
                  </span>
                  <div className="text-[#A4B18A] font-bold mt-0.5">{model.accuracyMetric}</div>
                </div>
              </div>
            </div>
          </PrimaryCard>
        ))}
      </div>
    </div>
  );
};
