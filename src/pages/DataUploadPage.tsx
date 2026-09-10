import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { dataService } from '../services/dataService';
import type { DatasetType } from '../types';
import { UploadCloud, FileSpreadsheet, Download, AlertTriangle } from 'lucide-react';

export const DataUploadPage: React.FC = () => {
  const { uploadDataset, processUploadedDataset, uploadedDatasets, runFullAiAnalysis } = useAppStore();

  const [selectedType, setSelectedType] = useState<DatasetType>('Production');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    if (!file.name.endsWith('.csv')) {
      setUploadError('Invalid file format. Please upload a standard CSV file.');
      return;
    }

    try {
      const parsedDataset = await dataService.parseCSV(file, selectedType);
      uploadDataset(parsedDataset);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse CSV file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">CSV Data Integration & Quality Engine</h1>
            <span className="clay-recessed border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#0B0E09]">
              DATA PIPELINE
            </span>
          </div>
          <p className="text-xs text-[#71825B] font-mono mt-1">
            Automated CSV Structural Validation & Quality Score Verification
          </p>
        </div>

        {/* Template Downloads */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#71825B] font-semibold hidden sm:inline">Templates:</span>
          {(['Production', 'Equipment', 'Weather', 'Borehole', 'Geological'] as DatasetType[]).map((t) => (
            <button
              key={t}
              onClick={() => dataService.downloadTemplate(t)}
              className="px-2.5 py-1.5 rounded-lg bg-[#1D2517] text-[#A4B18A] border border-[#252E1D] font-bold transition flex items-center gap-1 text-[11px] hover:text-[#F1F2E9] cursor-pointer"
              title={`Download ${t} CSV Template`}
            >
              <Download size={12} />
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Box & Dataset Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Drag & Drop Dropzone */}
        <div className="clay-card p-6 rounded-2xl space-y-4 border border-[#252E1D]">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase font-bold tracking-wider text-[#71825B]">Select Dataset Type</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {(['Production', 'Equipment', 'Weather', 'Borehole', 'Geological'] as DatasetType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`py-2 px-3 rounded-xl text-left font-bold transition cursor-pointer ${
                    selectedType === type
                      ? 'btn-clay-primary text-[#0B0E09]'
                      : 'clay-recessed text-[#71825B] hover:text-[#F1F2E9]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Target Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition cursor-pointer ${
              dragActive
                ? 'border-[#A4B18A] bg-[#1D2517]'
                : 'border-[#252E1D] hover:border-[#71825B] bg-[#0B0E09]'
            }`}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e: any) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              };
              input.click();
            }}
          >
            <UploadCloud size={40} className="text-[#A4B18A] mb-3 animate-pulse" />
            <h3 className="font-extrabold text-[#F1F2E9] text-sm">Drag & Drop {selectedType} CSV File</h3>
            <p className="text-xs text-[#71825B] mt-1">or click to browse local files</p>
            <span className="mt-3 text-[10px] font-mono bg-[#171D12] border border-[#252E1D] text-[#A4B18A] px-2.5 py-1 rounded-full uppercase tracking-wider">
              CSV UTF-8 Standard
            </span>
          </div>

          {uploadError && (
            <div className="p-3 clay-recessed border border-[#71825B] rounded-xl text-xs text-[#F1F2E9] flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-[#A4B18A]" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Right Column (2 cols): Uploaded Datasets List & Validation Reports */}
        <div className="lg:col-span-2 clay-card p-6 rounded-2xl space-y-4 border border-[#252E1D]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1D2517]">
            <h3 className="font-bold text-[#F1F2E9] text-base">Processed Operational Datasets</h3>
            <span className="text-xs font-mono text-[#71825B]">{uploadedDatasets.length} Uploaded</span>
          </div>

          <div className="space-y-4">
            {uploadedDatasets.length === 0 ? (
              <div className="py-12 text-center text-[#71825B] text-xs font-mono clay-recessed rounded-xl border border-dashed border-[#252E1D]">
                No datasets uploaded in this session yet. Upload a CSV file or download a template above.
              </div>
            ) : (
              uploadedDatasets.map((ds) => (
                <div
                  key={ds.fileId}
                  className="clay-recessed p-4 rounded-xl space-y-3 border border-[#252E1D]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="text-[#A4B18A] shrink-0" size={20} />
                      <div>
                        <h4 className="font-bold text-[#F1F2E9] text-sm">{ds.fileName}</h4>
                        <span className="text-[10px] font-mono text-[#71825B]">
                          {ds.type} • {ds.rowCount} rows • {ds.columnCount} columns
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-[#71825B] uppercase">Quality Score</span>
                        <div className="text-base font-extrabold text-[#A4B18A]">{ds.qualityScore}%</div>
                      </div>
                      <button
                        onClick={() => {
                          processUploadedDataset(ds.fileId);
                          runFullAiAnalysis();
                        }}
                        className="btn-clay-primary text-xs font-extrabold px-3.5 py-1.5 rounded-lg uppercase tracking-wider text-[#0B0E09] cursor-pointer"
                      >
                        PROCESS DATA
                      </button>
                    </div>
                  </div>

                  {/* Validation Stats */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-[#71825B] bg-[#0B0E09] p-2.5 rounded-lg border border-[#252E1D]">
                    <div>Missing Values: <span className="text-[#F1F2E9]">{ds.missingValuesCount}</span></div>
                    <div>Duplicate Rows: <span className="text-[#F1F2E9]">{ds.duplicateRowsCount}</span></div>
                    <div>Invalid Numbers: <span className="text-[#F1F2E9]">{ds.invalidValuesCount}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

