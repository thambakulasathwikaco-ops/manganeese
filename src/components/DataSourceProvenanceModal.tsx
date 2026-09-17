import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShieldCheck, Database, CheckCircle2, Clock } from 'lucide-react';
import type { DataSourceItem } from '../types';

interface DataSourceProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: DataSourceItem[];
  locationName: string;
}

export const DataSourceProvenanceModal: React.FC<DataSourceProvenanceModalProps> = ({
  isOpen,
  onClose,
  sources,
  locationName
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B100B]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#111811] border border-[#A9B58D]/30 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-[#A9B58D]/20 flex items-center justify-between bg-[#182016]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#A9B58D]/15 border border-[#A9B58D]/30 rounded-xl text-[#A9B58D]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F1F1E9]">Data Provenance & Source Transparency</h3>
                <p className="text-xs font-mono text-[#9EA493]">
                  Authoritative datasets backing intelligence report for {locationName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#9EA493] hover:text-[#F1F1E9] hover:bg-[#A9B58D]/20 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sources List */}
          <div className="p-5 overflow-y-auto space-y-3.5 flex-1 custom-scrollbar">
            {sources && sources.length > 0 ? (
              sources.map((src) => (
                <div
                  key={src.id}
                  className="bg-[#182016] border border-[#A9B58D]/20 rounded-xl p-4 transition-all hover:border-[#A9B58D]/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Database size={15} className="text-[#A9B58D]" />
                      <span className="text-sm font-bold text-[#F1F1E9]">{src.sourceName}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 uppercase font-bold ${
                        src.status === 'LIVE'
                          ? 'bg-[#A9B58D]/15 text-[#A9B58D] border-[#A9B58D]/30'
                          : src.status === 'CACHE'
                          ? 'bg-[#D4E09B]/15 text-[#D4E09B] border-[#D4E09B]/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {src.status === 'LIVE' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {src.status} DATA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-[#9EA493] mt-2 bg-[#111811] p-2.5 rounded-lg border border-[#A9B58D]/10">
                    <div>
                      <span className="block text-[10px] uppercase text-[#9EA493]/70">Dataset Name</span>
                      <span className="text-[#F1F1E9] font-medium">{src.datasetName}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase text-[#9EA493]/70">Data Type</span>
                      <span className="text-[#A9B58D]">{src.dataType}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase text-[#9EA493]/70">Coverage / Resolution</span>
                      <span className="text-[#F1F1E9]">{src.coverage}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-[#9EA493]">
                    <span>Last updated: {src.lastUpdated.split('T')[0]}</span>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#A9B58D] hover:underline flex items-center gap-1"
                      >
                        Provider API Endpoint <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-xs font-mono text-[#9EA493]">
                No external data source logs available.
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#A9B58D]/20 bg-[#182016] flex items-center justify-between text-xs font-mono text-[#9EA493]">
            <span>Data Transparency Commitment: Zero Fabricated Metrics</span>
            <button
              onClick={onClose}
              className="bg-[#A9B58D] text-[#111811] hover:bg-[#D4E09B] font-bold px-4 py-2 rounded-xl transition-colors"
            >
              CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
