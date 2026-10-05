import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from './StatusBadge';
import { X, Ship, MapPin, FileText } from 'lucide-react';

export const MissionModal: React.FC = () => {
  const { selectedMission, setSelectedMission, exportData } = useSimulation();

  if (!selectedMission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F4B60]/40 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#BDCED3] rounded-[8px] shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#BDCED3] bg-[#F8F6F2]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#E2EFF0] border border-[#BDCED3] flex items-center justify-center text-[#2A7C7A]">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-base font-semibold tracking-wide text-[#1F4B60]">
                  {selectedMission.name} — Mission Dossier
                </h3>
                <StatusBadge status={selectedMission.status} />
              </div>
              <p className="text-[11px] font-mono text-[#60868C] flex items-center gap-2 mt-0.5">
                <span>{selectedMission.vessel}</span>
                <span>•</span>
                <span>{selectedMission.date}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedMission(null)}
            className="text-[#60868C] hover:text-[#1F4B60] p-1 rounded-[4px] hover:bg-[#E7E5E2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Location & Sector */}
          <div className="bg-[#F8F6F2] p-3.5 rounded-[6px] border border-[#BDCED3]">
            <div className="text-[10px] font-sans font-semibold text-[#60868C] uppercase mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2A7C7A]" />
              OPERATIONAL BASIN / SURVEY SECTOR
            </div>
            <div className="text-sm font-semibold font-sans text-[#1F4B60]">
              {selectedMission.location}
            </div>
            <div className="text-xs text-[#2A7C7A] font-mono mt-0.5">
              Primary Objective: {selectedMission.primaryZone}
            </div>
          </div>

          {/* Metric Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#BDCED3]">
              <span className="text-[10px] font-sans text-[#60868C] uppercase block font-semibold">DEPTH</span>
              <span className="text-base font-bold font-mono text-[#1F4B60]">
                {selectedMission.depth} m
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#BDCED3]">
              <span className="text-[10px] font-sans text-[#60868C] uppercase block font-semibold">DISTANCE</span>
              <span className="text-base font-bold font-mono text-[#2A7C7A]">
                {selectedMission.distance} km
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#BDCED3]">
              <span className="text-[10px] font-sans text-[#60868C] uppercase block font-semibold">AREA SURVEYED</span>
              <span className="text-base font-bold font-mono text-[#1F4B60]">
                {selectedMission.area} km²
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#BDCED3]">
              <span className="text-[10px] font-sans text-[#60868C] uppercase block font-semibold">METAL DETECTIONS</span>
              <span className="text-base font-bold font-mono text-[#B78332]">
                {selectedMission.anomalies} LOGGED
              </span>
            </div>
          </div>

          {/* Mission Summary / Geological debrief */}
          <div className="bg-[#E2EFF0] p-4 rounded-[6px] border-l-4 border-l-[#2A7C7A] border border-[#BDCED3]">
            <div className="text-xs font-sans font-semibold text-[#2A7C7A] uppercase mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              SCIENTIFIC & SENSOR SURVEY SUMMARY
            </div>
            <p className="text-xs text-[#1F4B60] leading-relaxed font-sans">
              {selectedMission.summary}
            </p>
          </div>

          <div className="bg-[#F8F6F2] p-3 rounded-[6px] border border-[#BDCED3] text-[11px] font-mono text-[#60868C] space-y-1">
            <div className="text-[#1F4B60] font-semibold uppercase text-[10px]">ARCHIVAL REGISTRATION:</div>
            <div>• Hydrographic Data Logged: {selectedMission.measurements.toLocaleString()} soundings</div>
            <div>• Instrument Package: Dual EM Loop + 3-Axis Fluxgate Magnetometer + CTD Pod</div>
            <div>• Archive Status: Synchronized with National Seafloor Database</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#BDCED3] bg-[#F8F6F2]">
          <button
            onClick={() => exportData('mission-archive')}
            className="px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F2F6F6] text-[#1F4B60] text-xs font-sans font-medium border border-[#BDCED3] transition-colors"
          >
            Export Mission Log
          </button>
          <button
            onClick={() => setSelectedMission(null)}
            className="px-4 py-1.5 rounded-[6px] bg-[#2A7C7A] hover:bg-[#1F4B60] text-[#FFFFFF] text-xs font-sans font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
