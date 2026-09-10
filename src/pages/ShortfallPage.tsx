import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { riskService } from '../services/riskService';
import { dataService } from '../services/dataService';
import { RiskGauge } from '../components/RiskGauge';
import { Download, AlertOctagon } from 'lucide-react';
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts';
import { AnnouncementCard, PrimaryCard, Card } from '../components/ui/Card';

export const ShortfallPage: React.FC = () => {
  const { productionFactors } = useAppStore();

  const { shortfall, shortfallPct, riskLevel, contributions, explanation } =
    riskService.calculateRisk(productionFactors);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return '#F1F2E9';
      case 'HIGH':
        return '#A4B18A';
      case 'MEDIUM':
        return '#71825B';
      default:
        return '#596A43';
    }
  };

  const handleExportRiskReport = () => {
    const reportData = contributions.map((c) => ({
      Factor_Category: c.factor,
      Contribution_Percentage: `${c.contributionPct}%`,
      Impact_Description: c.impactDescription,
      Current_Shortfall_Tons: shortfall,
      Shortfall_Percentage: `${shortfallPct}%`,
      Overall_Risk_Level: riskLevel
    }));
    dataService.exportToCSV(`MOIL_Shortfall_Risk_Report.csv`, reportData);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#F1F2E9] tracking-tight">
              Shortfall & Operational Risk Analysis
            </h1>
            <span className="bg-[#0B0E09] border border-[#252E1D] text-[#A4B18A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              ATTRIBUTION ENGINE
            </span>
          </div>
          <p className="text-xs text-[#71825B] font-mono mt-1">
            Dynamic Bottleneck Decomposition & Factor Sensitivity Attribution
          </p>
        </div>

        <button
          onClick={handleExportRiskReport}
          className="btn-clay-primary text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 self-start sm:self-auto uppercase tracking-wider text-[#0B0E09] cursor-pointer"
        >
          <Download size={15} className="text-[#0B0E09]" />
          <span>EXPORT RISK REPORT (CSV)</span>
        </button>
      </div>

      {/* Top Narrative Alert Banner */}
      <AnnouncementCard
        title="Shortfall Risk Diagnostic Narrative"
        message={explanation}
        icon={AlertOctagon}
        badge={`${riskLevel} SEVERITY`}
      />

      {/* Main Grid: Gauge + Contribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Risk Gauge & Tonnage Metrics */}
        <Card variant="primary" className="flex flex-col justify-between items-center text-center space-y-6">
          <div className="w-full text-left">
            <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold tracking-wider">
              Current Risk Level
            </span>
            <h3 className="text-xl font-black text-[#F1F2E9]">{riskLevel} RISK</h3>
          </div>

          <RiskGauge
            value={shortfallPct}
            label={`${riskLevel} RISK`}
            sublabel={`GAP: ${shortfall.toLocaleString()} MT`}
            color={getRiskColor(riskLevel)}
            size={220}
          />

          <div className="w-full space-y-2 text-xs font-mono">
            <div className="bg-[#0B0E09] p-3 rounded-xl flex justify-between border border-[#252E1D]">
              <span className="text-[#71825B]">Monthly Target</span>
              <span className="text-[#F1F2E9] font-bold">
                {productionFactors.productionTarget.toLocaleString()} MT
              </span>
            </div>
            <div className="bg-[#0B0E09] p-3 rounded-xl flex justify-between border border-[#252E1D]">
              <span className="text-[#71825B]">Shortfall Variance</span>
              <span className="text-[#A4B18A] font-bold">
                -{shortfall.toLocaleString()} MT ({shortfallPct}%)
              </span>
            </div>
          </div>
        </Card>

        {/* Right Column (2 cols): Factor Contribution Breakdown Chart */}
        <div className="lg:col-span-2">
          <PrimaryCard
            title="Normalized Factor Contribution Breakdown"
            subtitle="QUANTIFIED PERCENTAGE LOSS CONTRIBUTION ACROSS BOTTLENECKS"
            badge="100% Normalized"
          >
            {/* Bar Chart */}
            <div className="h-64 w-full bg-[#0B0E09] p-4 rounded-xl border border-[#252E1D]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={contributions}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1D2517" />
                  <XAxis type="number" stroke="#71825B" fontSize={11} domain={[0, 100]} unit="%" />
                  <YAxis dataKey="factor" type="category" stroke="#F1F2E9" fontSize={11} width={140} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0E09',
                      borderColor: '#252E1D',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#F1F2E9'
                    }}
                    formatter={(val: any) => [`${val}% Contribution`, 'Impact']}
                  />
                  <Bar dataKey="contributionPct" radius={[0, 8, 8, 0]}>
                    {contributions.map((_, index) => {
                      const colors = ['#A4B18A', '#71825B', '#596A43', '#39422F'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Factor Impact Descriptions List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {contributions.map((c, idx) => {
                const colors = ['#A4B18A', '#71825B', '#596A43', '#39422F'];
                return (
                  <div
                    key={c.id}
                    className="bg-[#0B0E09] p-3.5 rounded-xl space-y-1 border border-[#252E1D]"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#F1F2E9]">{c.factor}</span>
                      <span
                        className="font-mono font-bold"
                        style={{ color: colors[idx % colors.length] }}
                      >
                        {c.contributionPct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71825B] line-clamp-2">{c.impactDescription}</p>
                  </div>
                );
              })}
            </div>
          </PrimaryCard>
        </div>
      </div>
    </div>
  );
};
