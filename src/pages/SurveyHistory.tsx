import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  History,
  Ship,
  FileDown,
  Layers,
  ArrowUpRight,
  Compass,
  Calendar,
  Waves
} from 'lucide-react';

export const SurveyHistory: React.FC = () => {
  const { missions, setSelectedMission, exportData } = useSimulation();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
              SURVEY HISTORY
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-ocean-850 text-cyan-300 border border-slate-700">
              5 EXPEDITIONS LOGGED
            </span>
          </div>
          <p className="text-xs font-mono text-cyan-400/90 tracking-wide mt-0.5">
            HISTORICAL OCEANOGRAPHIC SURVEY CAMPAIGNS & BATHYMETRIC CRUISE RECORDS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('cruises-master-archive')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>EXPORT SURVEY ARCHIVE</span>
          </button>
        </div>
      </div>

      {/* Historical Missions Table */}
      <div className="bg-ocean-850/80 rounded-lg border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
              CENTRAL INDIAN OCEAN SURVEY REGISTRY
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            CLICK ROW TO INSPECT MISSION DOSSIER
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-3">MISSION</th>
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-3">DEPTH</th>
                <th className="py-3 px-3">DISTANCE</th>
                <th className="py-3 px-3">AREA</th>
                <th className="py-3 px-3">MEASUREMENTS</th>
                <th className="py-3 px-3">ANOMALIES</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {missions.map((mission) => {
                const isActive = mission.status === 'ACTIVE';

                return (
                  <tr
                    key={mission.id}
                    onClick={() => setSelectedMission(mission)}
                    className="hover:bg-ocean-800/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <Ship className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span className="font-bold text-slate-100 group-hover:text-cyan-300">
                          {mission.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">{mission.date}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-200">{mission.depth} m</td>
                    <td className="py-3.5 px-3 text-cyan-300">{mission.distance} km</td>
                    <td className="py-3.5 px-3">{mission.area} km²</td>
                    <td className="py-3.5 px-3">{mission.measurements.toLocaleString()}</td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                        {mission.anomalies}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge
                        status={mission.status}
                        variant={isActive ? 'green' : 'slate'}
                        size="sm"
                        pulse={isActive}
                      />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="text-cyan-400 group-hover:underline text-[11px] flex items-center justify-end gap-1">
                        DETAILS <ArrowUpRight className="w-3 h-3" />
                      </span>
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
