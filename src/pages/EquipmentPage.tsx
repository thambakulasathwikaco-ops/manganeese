import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { dataService } from '../services/dataService';
import { Search, Download, Wrench, ShieldAlert, CheckCircle } from 'lucide-react';

export const EquipmentPage: React.FC = () => {
  const { equipment, updateEquipmentStatus } = useAppStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredEquipment = equipment.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.equipmentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const avgAvailability = Math.round(
    equipment.reduce((acc, curr) => acc + curr.availability, 0) / (equipment.length || 1)
  );

  const activeCount = equipment.filter((e) => e.status === 'ACTIVE').length;
  const maintCount = equipment.filter((e) => e.status === 'MAINTENANCE').length;
  const criticalCount = equipment.filter((e) => e.status === 'CRITICAL').length;

  const handleExportEquipment = () => {
    const exportData = equipment.map((e) => ({
      Equipment_ID: e.equipmentId,
      Name: e.name,
      Type: e.type,
      Availability_Pct: `${e.availability}%`,
      Utilization_Pct: `${e.utilization}%`,
      Downtime_Hours: e.downtimeHours,
      Status: e.status,
      Location: e.location,
      Last_Maintenance: e.lastMaintenance
    }));
    dataService.exportToCSV(`MOIL_Equipment_Fleet_Report.csv`, exportData);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">Mining Fleet Equipment Management</h1>
            <span className="clay-recessed border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#0B0E09]">
              TELEMETRY & AVAILABILITY
            </span>
          </div>
          <p className="text-xs text-[#71825B] font-mono mt-1">
            Real-time Fleet Availability & Downtime Impact Control
          </p>
        </div>

        <button
          onClick={handleExportEquipment}
          className="btn-clay-primary text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 self-start sm:self-auto uppercase tracking-wider text-[#0B0E09] cursor-pointer"
        >
          <Download size={15} className="text-[#0B0E09]" />
          <span>EXPORT FLEET REPORT (CSV)</span>
        </button>
      </div>

      {/* Fleet Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clay-card p-4 rounded-2xl relative overflow-hidden border border-[#252E1D]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#A4B18A]">Fleet Availability</div>
            <CheckCircle size={16} className="text-[#A4B18A]" />
          </div>
          <div className="text-2xl font-black text-[#A4B18A] font-mono mt-2">{avgAvailability}%</div>
          <div className="text-[11px] text-[#71825B] font-mono mt-1">Average Fleet Readiness</div>
        </div>

        <div className="clay-card p-4 rounded-2xl relative overflow-hidden border border-[#252E1D]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#A4B18A]">Active Duty</div>
            <CheckCircle size={16} className="text-[#A4B18A]" />
          </div>
          <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-2">{activeCount} Units</div>
          <div className="text-[11px] text-[#71825B] font-mono mt-1">Operational Units</div>
        </div>

        <div className="clay-card p-4 rounded-2xl relative overflow-hidden border border-[#252E1D]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#71825B]">Maintenance Shed</div>
            <Wrench size={16} className="text-[#71825B]" />
          </div>
          <div className="text-2xl font-black text-[#71825B] font-mono mt-2">{maintCount} Units</div>
          <div className="text-[11px] text-[#71825B] font-mono mt-1">Scheduled Servicing</div>
        </div>

        <div className="clay-card p-4 rounded-2xl relative overflow-hidden border border-[#252E1D]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#F1F2E9]">Critical Breakdown</div>
            <ShieldAlert size={16} className="text-[#F1F2E9]" />
          </div>
          <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-2">{criticalCount} Units</div>
          <div className="text-[11px] text-[#71825B] font-mono mt-1">Unscheduled Downtime</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 clay-recessed p-3 rounded-2xl border border-[#252E1D]">
        
        {/* Search Input */}
        <div className="flex items-center bg-[#0B0E09] px-3.5 py-2 rounded-xl text-xs font-mono w-full sm:w-80 border border-[#252E1D]">
          <Search size={14} className="text-[#A4B18A] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by equipment name or ID..."
            className="bg-transparent text-[#F1F2E9] placeholder-[#71825B] focus:outline-none w-full"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#0B0E09] rounded-xl text-xs font-mono border border-[#252E1D]">
          {(['ALL', 'ACTIVE', 'MAINTENANCE', 'CRITICAL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition font-bold text-xs cursor-pointer ${
                filterStatus === st
                  ? 'btn-clay-primary text-[#0B0E09] shadow-sm'
                  : 'text-[#71825B] hover:text-[#F1F2E9]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <div
            key={item.equipmentId}
            className="clay-card p-5 rounded-2xl flex flex-col justify-between space-y-4 border border-[#252E1D]"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold">{item.equipmentId} • {item.type}</span>
                  <h3 className="font-extrabold text-[#F1F2E9] text-base mt-0.5">{item.name}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  item.status === 'ACTIVE' ? 'bg-[#1D2517] text-[#A4B18A] border-[#71825B]' :
                  item.status === 'MAINTENANCE' ? 'bg-[#171D12] text-[#71825B] border-[#252E1D]' :
                  'bg-[#1D2517] text-[#F1F2E9] border-[#71825B]'
                }`}>
                  {item.status}
                </span>
              </div>

              {/* Location & Maintenance */}
              <div className="mt-3 text-xs font-mono text-[#71825B] space-y-1.5 clay-recessed p-3 rounded-xl border border-[#252E1D]">
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-[#F1F2E9] font-semibold">{item.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Downtime:</span>
                  <span className={item.downtimeHours > 10 ? 'text-[#F1F2E9] font-bold' : 'text-[#F1F2E9]'}>{item.downtimeHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Service:</span>
                  <span className="text-[#F1F2E9]">{item.lastMaintenance}</span>
                </div>
              </div>

              {/* Availability Slider Control */}
              <div className="mt-4 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#71825B]">Unit Availability</span>
                  <span className="text-[#A4B18A] font-bold">{item.availability}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={item.availability}
                  onChange={(e) => updateEquipmentStatus(item.equipmentId, item.status, Number(e.target.value))}
                  className="w-full accent-[#A4B18A] bg-[#0B0E09] h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="pt-3 border-t border-[#1D2517] flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => updateEquipmentStatus(item.equipmentId, 'ACTIVE', 90)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  item.status === 'ACTIVE'
                    ? 'btn-clay-primary text-[#0B0E09]'
                    : 'clay-recessed text-[#71825B] hover:text-[#A4B18A]'
                }`}
              >
                ACTIVE
              </button>
              <button
                onClick={() => updateEquipmentStatus(item.equipmentId, 'MAINTENANCE', 60)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  item.status === 'MAINTENANCE'
                    ? 'bg-[#1D2517] text-[#F1F2E9] border border-[#71825B]'
                    : 'clay-recessed text-[#71825B] hover:text-[#A4B18A]'
                }`}
              >
                MAINT
              </button>
              <button
                onClick={() => updateEquipmentStatus(item.equipmentId, 'CRITICAL', 30)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  item.status === 'CRITICAL'
                    ? 'bg-[#252E1D] text-[#F1F2E9] border border-[#71825B]'
                    : 'clay-recessed text-[#71825B] hover:text-[#F1F2E9]'
                }`}
              >
                CRITICAL
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

