import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { dataService } from '../services/dataService';
import { Search, Download, Wrench, ShieldAlert, CheckCircle, Truck } from 'lucide-react';
import { CardGrid, StatCard, ProfileCard, EmptyStateCard, Card } from '../components/ui/Card';

export const EquipmentPage: React.FC = () => {
  const { equipment, updateEquipmentStatus } = useAppStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredEquipment = equipment.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.equipmentId.toLowerCase().includes(searchQuery.toLowerCase());
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
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">
              Mining Fleet Equipment Management
            </h1>
            <span className="bg-[#0B0E09] border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
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
      <CardGrid columns={4}>
        <StatCard
          title="Fleet Availability"
          value={`${avgAvailability}%`}
          subtext="Average Fleet Readiness"
          icon={CheckCircle}
        />
        <StatCard
          title="Active Duty"
          value={`${activeCount} Units`}
          subtext="Operational Units"
          icon={CheckCircle}
        />
        <StatCard
          title="Maintenance Shed"
          value={`${maintCount} Units`}
          subtext="Scheduled Servicing"
          icon={Wrench}
        />
        <StatCard
          title="Critical Breakdown"
          value={`${criticalCount} Units`}
          subtext="Unscheduled Downtime"
          icon={ShieldAlert}
        />
      </CardGrid>

      {/* Search & Filter Toolbar */}
      <Card variant="list" padding="sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
      </Card>

      {/* Equipment Fleet Grid */}
      {filteredEquipment.length === 0 ? (
        <EmptyStateCard
          icon={Truck}
          title="No Equipment Found"
          description="No fleet items matched your current search parameters or filter."
          actionText="CLEAR FILTERS"
          onAction={() => {
            setSearchQuery('');
            setFilterStatus('ALL');
          }}
        />
      ) : (
        <CardGrid columns={3}>
          {filteredEquipment.map((item) => (
            <ProfileCard
              key={item.equipmentId}
              name={item.name}
              subtitle={`${item.equipmentId} • ${item.type}`}
              status={item.status}
              metrics={[
                { label: 'Location', value: item.location },
                { label: 'Downtime', value: `${item.downtimeHours} Hours` },
                { label: 'Last Service', value: item.lastMaintenance }
              ]}
              actions={
                <div className="flex items-center gap-2 text-xs font-mono">
                  <button
                    onClick={() => updateEquipmentStatus(item.equipmentId, 'ACTIVE', 90)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      item.status === 'ACTIVE'
                        ? 'btn-clay-primary text-[#0B0E09]'
                        : 'bg-[#0B0E09] text-[#71825B] hover:text-[#A4B18A] border border-[#252E1D]'
                    }`}
                  >
                    ACTIVE
                  </button>
                  <button
                    onClick={() => updateEquipmentStatus(item.equipmentId, 'MAINTENANCE', 60)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      item.status === 'MAINTENANCE'
                        ? 'bg-[#1D2517] text-[#F1F2E9] border border-[#71825B]'
                        : 'bg-[#0B0E09] text-[#71825B] hover:text-[#A4B18A] border border-[#252E1D]'
                    }`}
                  >
                    MAINT
                  </button>
                  <button
                    onClick={() => updateEquipmentStatus(item.equipmentId, 'CRITICAL', 30)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      item.status === 'CRITICAL'
                        ? 'bg-[#252E1D] text-[#F1F2E9] border border-[#71825B]'
                        : 'bg-[#0B0E09] text-[#71825B] hover:text-[#F1F2E9] border border-[#252E1D]'
                    }`}
                  >
                    CRITICAL
                  </button>
                </div>
              }
            >
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#71825B]">Unit Availability</span>
                  <span className="text-[#A4B18A] font-bold">{item.availability}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={item.availability}
                  onChange={(e) =>
                    updateEquipmentStatus(item.equipmentId, item.status, Number(e.target.value))
                  }
                  className="w-full accent-[#A4B18A] bg-[#0B0E09] h-2 rounded-lg cursor-pointer"
                />
              </div>
            </ProfileCard>
          ))}
        </CardGrid>
      )}
    </div>
  );
};
