import Papa from 'papaparse';
import type { DatasetType, UploadedDataset } from '../types';

export const dataService = {
  parseCSV(file: File, type: DatasetType): Promise<UploadedDataset> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const rows = results.data as Record<string, any>[];
          const columns = results.meta.fields || [];
          const rowCount = rows.length;
          const columnCount = columns.length;

          let missingValuesCount = 0;
          let invalidValuesCount = 0;
          const seenRows = new Set<string>();
          let duplicateRowsCount = 0;

          rows.forEach((row) => {
            const strRepresentation = JSON.stringify(row);
            if (seenRows.has(strRepresentation)) {
              duplicateRowsCount++;
            } else {
              seenRows.add(strRepresentation);
            }

            columns.forEach((col) => {
              const val = row[col];
              if (val === null || val === undefined || val === '') {
                missingValuesCount++;
              } else if (typeof val === 'number' && isNaN(val)) {
                invalidValuesCount++;
              }
            });
          });

          // Quality score calculation
          const totalCells = Math.max(1, rowCount * columnCount);
          const penalty = (missingValuesCount * 1.5 + duplicateRowsCount * 3 + invalidValuesCount * 2) / totalCells;
          const qualityScore = Math.max(0, Math.min(100, Math.round(100 - (penalty * 100))));

          const dataset: UploadedDataset = {
            fileId: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            fileName: file.name,
            type,
            rowCount,
            columnCount,
            columns,
            missingValuesCount,
            duplicateRowsCount,
            invalidValuesCount,
            qualityScore,
            previewData: rows.slice(0, 15),
            uploadedAt: new Date().toISOString()
          };

          resolve(dataset);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  },

  downloadTemplate(type: DatasetType) {
    let headers: string[] = [];
    let sampleRow: Record<string, any> = {};

    switch (type) {
      case 'Production':
        headers = ['Date', 'Block_ID', 'Target_Tons', 'Actual_Tons', 'Equipment_Availability_Pct', 'Operator_Shift'];
        sampleRow = { Date: '2026-09-01', Block_ID: 'MOIL-A17', Target_Tons: 350, Actual_Tons: 340, Equipment_Availability_Pct: 88, Operator_Shift: 'Day-1' };
        break;
      case 'Equipment':
        headers = ['Equipment_ID', 'Name', 'Type', 'Availability_Pct', 'Utilization_Pct', 'Downtime_Hours', 'Status', 'Location'];
        sampleRow = { Equipment_ID: 'EX-01', Name: 'CAT 349 Hydraulic Excavator', Type: 'Excavator', Availability_Pct: 85, Utilization_Pct: 78, Downtime_Hours: 4, Status: 'ACTIVE', Location: 'Dongri Buzurg Bench 3' };
        break;
      case 'Weather':
        headers = ['Date', 'Rainfall_mm', 'Temperature_C', 'Soil_Moisture_Pct', 'Land_Surface_Temp_C', 'Weather_Risk'];
        sampleRow = { Date: '2026-09-01', Rainfall_mm: 12.4, Temperature_C: 28.5, Soil_Moisture_Pct: 42, Land_Surface_Temp_C: 30.2, Weather_Risk: 'MEDIUM' };
        break;
      case 'Borehole':
        headers = ['Borehole_ID', 'Zone_ID', 'Depth_Meters', 'Mn_Grade_Pct', 'Fe_Grade_Pct', 'Silica_Pct', 'Core_Recovery_Pct'];
        sampleRow = { Borehole_ID: 'BH-104', Zone_ID: 'Zone A-17', Depth_Meters: 84.5, Mn_Grade_Pct: 44.2, Fe_Grade_Pct: 7.8, Silica_Pct: 12.1, Core_Recovery_Pct: 92.5 };
        break;
      case 'Geological':
        headers = ['Zone_ID', 'Geological_Score', 'Satellite_Score', 'Resistivity_OhmM', 'Magnetic_Anomaly_nT', 'Overburden_Ratio'];
        sampleRow = { Zone_ID: 'Zone A-17', Geological_Score: 88, Satellite_Score: 82, Resistivity_OhmM: 145.2, Magnetic_Anomaly_nT: 420, Overburden_Ratio: 3.2 };
        break;
    }

    const csvContent = Papa.unparse([sampleRow], { columns: headers });
    this.triggerDownload(`${type.toLowerCase()}_template.csv`, csvContent);
  },

  exportToCSV(fileName: string, data: Record<string, any>[]) {
    if (!data || data.length === 0) return;
    const csvContent = Papa.unparse(data);
    this.triggerDownload(fileName, csvContent);
  },

  triggerDownload(filename: string, text: string) {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
