import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from './StatusBadge';
import { X, Ship, MapPin, Calendar, Compass, Layers, CheckCircle2, FileText } from 'lucide-react';

export const MissionModal: React.FC = () => {
  const { selectedMission, setSelectedMission, exportData } = useSimulation();

  if (!selectedMission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-ocean-900 border border-cyan-500/40 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-ocean-850/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-bold tracking-wider text-slate-100">
                  {selectedMission.name} — MISSION DOSSIER
                </h3>
                <StatusBadge status={selectedMission.status} />
              </div>
              <p className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-2">
                <span>{selectedMission.vessel}</span>
                <span>•</span>
                <span>{selectedMission.date}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedMission(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-ocean-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Location & Sector */}
          <div className="bg-ocean-850/70 p-3.5 rounded border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              OPERATIONAL BASIN / SURVEY SECTOR
            </div>
            <div className="text-sm font-semibold font-mono text-slate-100">
              {selectedMission.location}
            </div>
            <div className="text-xs text-cyan-300 font-mono mt-0.5">
              Primary Objective: {selectedMission.primaryZone}
            </div>
          </div>

          {/* Metric Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-mono">
            <div className="bg-ocean-850/80 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">DEPTH</span>
              <span className="text-base font-bold font-mono text-slate-100">
                {selectedMission.depth} m
              </span>
            </div>
            <div className="bg-ocean-850/80 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">DISTANCE</span>
              <span className="text-base font-bold font-mono text-cyan-300">
                {selectedMission.distance} km
              </span>
            </div>
            <div className="bg-ocean-850/80 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">AREA SURVEYED</span>
              <span className="text-base font-bold font-mono text-slate-100">
                {selectedMission.area} km²
              </span>
            </div>
            <div className="bg-ocean-850/80 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">ANOMALIES</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {selectedMission.anomalies} DETECTED
              </span>
            </div>
          </div>

          {/* Mission Summary / Geological debrief */}
          <div className="bg-ocean-850/90 p-4 rounded border-l-4 border-cyan-500">
            <div className="text-xs font-mono font-semibold text-cyan-300 uppercase mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              SCIENTIFIC & SENSOR SURVEY SUMMARY
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {selectedMission.summary}
            </p>
          </div>

          <div className="bg-ocean-950/60 p-3 rounded border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold uppercase">ARCHIVAL REGISTRATION:</div>
            <div>• Hydrographic Data Logged: {selectedMission.measurements.toLocaleString()} soundings</div>
            <div>• Instrument Package: Dual EM Loop + 3-Axis Fluxgate Magnetometer + CTD Pod</div>
            <div>• Archive Status: Synchronized with National Seafloor Database</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-ocean-850/90">
          <button
            onClick={() => exportData('mission-archive')}
            className="px-3 py-1.5 rounded bg-ocean-800 hover:bg-ocean-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
          >
            EXPORT MISSION LOG
          </button>
          <button
            onClick={() => setSelectedMission(null)}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
