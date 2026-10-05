import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from './../components/StatusBadge';
import {
  Target,
  Search,
  Filter,
  FileDown,
  ArrowUpRight,
  MapPin,
  BrainCircuit
} from 'lucide-react';

export const TargetZones: React.FC = () => {
  const { targets, setSelectedTarget, exportData } = useSimulation();
  const [filterClassification, setFilterClassification] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTargets = targets.filter((t) => {
    const matchesClassification =
      filterClassification === 'ALL' || t.classification === filterClassification;
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.surveyLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.coordinates.lat.includes(searchTerm) ||
      t.classification.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClassification && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BDCED3]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-sans font-semibold tracking-wide text-[#1F4B60] uppercase">
              TARGET ZONES & DETECTION REGISTER
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-[#E2EFF0] text-[#2A7C7A] border border-[#BDCED3]">
              {targets.length} FLAGGED TARGETS
            </span>
          </div>
          <p className="text-xs text-[#60868C] font-sans mt-0.5">
            Classified Detection Locations Flagged for Further Survey & Investigation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/ai-analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#E2EFF0] hover:bg-[#D5E7E9] text-[#1D5E5C] border border-[#BDCED3] text-xs font-sans font-medium transition-colors"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#2A7C7A]" />
            <span>AI Interpretation</span>
          </Link>

          <button
            onClick={() => exportData('target-register')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F2F6F6] text-[#1F4B60] border border-[#BDCED3] text-xs font-sans font-medium transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-[#60868C]" />
            <span>Export Target Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-[8px] border border-[#BDCED3] text-xs font-sans shadow-sm">
        {/* Classification Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#60868C] text-[11px] mr-1 uppercase font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#2A7C7A]" /> CLASSIFICATION:
          </span>
          {['ALL', 'METAL DETECTED', 'MAGNETIC ANOMALY', 'UNCLASSIFIED ANOMALY'].map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClassification(cls)}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                filterClassification === cls
                  ? 'bg-[#E2EFF0] text-[#2A7C7A] border border-[#2A7C7A] font-semibold'
                  : 'bg-[#F8F6F2] text-[#60868C] hover:text-[#1F4B60] border border-[#BDCED3]'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#60868C]" />
          <input
            type="text"
            placeholder="Search Target ID, Line or Coords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#F8F6F2] border border-[#BDCED3] rounded-[6px] pl-8 pr-3 py-1.5 text-xs text-[#1F4B60] placeholder-[#60868C] focus:outline-none focus:border-[#2A7C7A] w-64 font-sans"
          />
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTargets.map((target) => {
          const isMetal = target.classification === 'METAL DETECTED';
          const isMagnetic = target.classification === 'MAGNETIC ANOMALY';
          const isPriority = target.status === 'PRIORITY';
          const isHigh = target.status === 'HIGH';

          return (
            <div
              key={target.id}
              onClick={() => setSelectedTarget(target)}
              className={`bg-[#FFFFFF] rounded-[8px] border p-4 transition-colors cursor-pointer flex flex-col justify-between shadow-sm ${
                isMetal
                  ? 'border-[#B85C5C]/50 hover:border-[#B85C5C]'
                  : isMagnetic
                  ? 'border-[#B78332]/50 hover:border-[#B78332]'
                  : 'border-[#BDCED3] hover:border-[#2A7C7A]'
              }`}
            >
              <div>
                {/* Header: ID + Priority Status */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2]">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-[4px] flex items-center justify-center ${
                        isMetal
                          ? 'bg-[#F9E8E8] text-[#B85C5C] border border-[#BDCED3]'
                          : isMagnetic
                          ? 'bg-[#F8EFE3] text-[#B78332] border border-[#BDCED3]'
                          : 'bg-[#E2EFF0] text-[#2A7C7A] border border-[#BDCED3]'
                      }`}
                    >
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-sans font-bold text-sm text-[#1F4B60]">
                        {target.id}
                      </span>
                    </div>
                  </div>

                  <StatusBadge
                    status={target.status}
                    variant={isPriority ? 'red' : isHigh ? 'amber' : 'blue'}
                    size="sm"
                  />
                </div>

                {/* Classification Badge (Clear Hierarchy) */}
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">
                    CLASSIFICATION:
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-[4px] font-semibold border ${
                      isMetal
                        ? 'bg-[#F9E8E8] text-[#B85C5C] border-[#B85C5C]/30'
                        : isMagnetic
                        ? 'bg-[#F8EFE3] text-[#B78332] border-[#B78332]/30'
                        : 'bg-[#F8F6F2] text-[#1F4B60] border-[#BDCED3]'
                    }`}
                  >
                    {target.classification}
                  </span>
                </div>

                {/* Coordinates & Survey Line */}
                <div className="mt-2 flex items-center justify-between text-xs font-mono text-[#60868C]">
                  <span className="flex items-center gap-1 text-[#1F4B60]">
                    <MapPin className="w-3 h-3 text-[#2A7C7A]" />
                    {target.coordinates.lat}, {target.coordinates.lng}
                  </span>
                  <span className="text-[#2A7C7A] font-semibold">{target.surveyLine}</span>
                </div>

                {/* Depth & Sensor Response Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                  <div className="bg-[#F8F6F2] p-2 rounded-[6px] border border-[#BDCED3]">
                    <span className="text-[10px] text-[#60868C] uppercase font-sans font-semibold block">DEPTH</span>
                    <span className="font-semibold text-[#1F4B60]">{target.depth} m</span>
                  </div>
                  <div className="bg-[#F8F6F2] p-2 rounded-[6px] border border-[#BDCED3]">
                    <span className="text-[10px] text-[#60868C] uppercase font-sans font-semibold block">SENSOR RESPONSE</span>
                    <span
                      className={`font-semibold ${
                        isMetal ? 'text-[#B85C5C]' : isMagnetic ? 'text-[#B78332]' : 'text-[#2A7C7A]'
                      }`}
                    >
                      {target.signalStrength.toFixed(2)} mV/V
                    </span>
                  </div>
                </div>

                {/* Neutral Engineering Interpretation */}
                <p className="mt-3 text-xs text-[#60868C] font-sans line-clamp-2 leading-relaxed">
                  {target.interpretation}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#E7E5E2] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#60868C]">Duration: {target.detectionDuration}</span>
                <span className="text-[#2A7C7A] font-sans font-medium flex items-center gap-0.5 hover:underline">
                  OPEN DOSSIER <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
