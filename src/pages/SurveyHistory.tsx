import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  History,
  Ship,
  FileDown,
  ArrowUpRight
} from 'lucide-react';

export const SurveyHistory: React.FC = () => {
  const { missions, setSelectedMission, exportData } = useSimulation();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BDCED3]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-sans font-semibold tracking-wide text-[#1F4B60] uppercase">
              SURVEY HISTORY
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-[#E2EFF0] text-[#2A7C7A] border border-[#BDCED3]">
              5 EXPEDITIONS LOGGED
            </span>
          </div>
          <p className="text-xs text-[#60868C] font-sans mt-0.5">
            Historical Oceanographic Survey Campaigns & Bathymetric Cruise Records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('cruises-master-archive')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8F6F2] text-[#1F4B60] border border-[#BDCED3] text-xs font-sans font-medium transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-[#60868C]" />
            <span>Export Survey Archive</span>
          </button>
        </div>
      </div>

      {/* Historical Missions Table */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2] mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#2A7C7A]" />
            <h3 className="font-sans text-sm font-semibold tracking-wide text-[#1F4B60] uppercase">
              CENTRAL INDIAN OCEAN SURVEY REGISTRY
            </h3>
          </div>
          <span className="text-xs font-mono text-[#60868C]">
            CLICK ROW TO INSPECT MISSION DOSSIER
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#BDCED3] text-[11px] font-sans font-semibold text-[#60868C] uppercase">
                <th className="py-3 px-3">MISSION</th>
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-3">DEPTH</th>
                <th className="py-3 px-3">DISTANCE</th>
                <th className="py-3 px-3">AREA</th>
                <th className="py-3 px-3">MEASUREMENTS</th>
                <th className="py-3 px-3">METAL DETECTIONS</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E2] text-[#1F4B60]">
              {missions.map((mission) => {
                const isActive = mission.status === 'ACTIVE';

                return (
                  <tr
                    key={mission.id}
                    onClick={() => setSelectedMission(mission)}
                    className="hover:bg-[#F8F6F2] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <Ship className={`w-3.5 h-3.5 ${isActive ? 'text-[#2A7C7A]' : 'text-[#60868C]'}`} />
                        <span className="font-semibold text-[#1F4B60] group-hover:text-[#2A7C7A]">
                          {mission.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[#60868C]">{mission.date}</td>
                    <td className="py-3.5 px-3 font-semibold text-[#1F4B60]">{mission.depth} m</td>
                    <td className="py-3.5 px-3 text-[#2A7C7A]">{mission.distance} km</td>
                    <td className="py-3.5 px-3">{mission.area} km²</td>
                    <td className="py-3.5 px-3">{mission.measurements.toLocaleString()}</td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-[#B78332] bg-[#F8EFE3] px-2 py-0.5 rounded-[4px] border border-[#BDCED3]">
                        {mission.anomalies}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge
                        status={mission.status}
                        variant={isActive ? 'green' : 'slate'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMission(mission);
                        }}
                        className="text-[#2A7C7A] group-hover:text-[#1F4B60] text-xs font-sans font-medium inline-flex items-center gap-1 hover:underline"
                      >
                        <span>Dossier</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
