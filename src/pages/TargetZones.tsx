import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TargetAnomaly } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Target,
  Search,
  Filter,
  FileDown,
  ArrowUpRight,
  Compass,
  Layers,
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const TargetZones: React.FC = () => {
  const { targets, setSelectedTarget, exportData } = useSimulation();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTargets = targets.filter((t) => {
    const matchesFilter = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.surveyLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.coordinates.lat.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
              TARGET ZONES
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {targets.length} LOGGED ANOMALIES
            </span>
          </div>
          <p className="text-xs font-mono text-cyan-400/90 tracking-wide mt-0.5">
            DETECTED SEAFLOOR ANOMALIES & PRELIMINARY EXPLORATION CANDIDATES
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('target-register')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>EXPORT TARGET REPORT</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-ocean-850/80 p-3 rounded-lg border border-slate-800 text-xs font-mono">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] mr-1 uppercase flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" /> STATUS:
          </span>
          {['ALL', 'PRIORITY', 'HIGH', 'REVIEW', 'LOW'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                filterStatus === status
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'bg-ocean-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Target ID or Line..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-ocean-900 border border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-56 font-mono"
          />
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTargets.map((target) => {
          const isPriority = target.status === 'PRIORITY';
          const isHigh = target.status === 'HIGH';

          return (
            <div
              key={target.id}
              onClick={() => setSelectedTarget(target)}
              className={`bg-ocean-850/80 rounded-lg border p-4.5 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-lg ${
                isPriority
                  ? 'border-rose-500/50 hover:border-rose-400 shadow-rose-950/40'
                  : isHigh
                  ? 'border-amber-500/40 hover:border-amber-400 shadow-amber-950/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center ${
                        isPriority
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/50'
                          : isHigh
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/50'
                          : 'bg-ocean-950 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-100">
                      {target.id}
                    </span>
                  </div>

                  <StatusBadge
                    status={target.status}
                    variant={isPriority ? 'red' : isHigh ? 'amber' : 'blue'}
                    size="sm"
                    pulse={isPriority}
                  />
                </div>

                {/* Coordinates & Line */}
                <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {target.coordinates.lat}, {target.coordinates.lng}
                  </span>
                  <span className="text-cyan-400 font-semibold">{target.surveyLine}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                  <div className="bg-ocean-900/80 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">DEPTH</span>
                    <span className="font-bold text-slate-100">{target.depth} m</span>
                  </div>
                  <div className="bg-ocean-900/80 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">RESPONSE</span>
                    <span
                      className={`font-bold ${
                        isPriority ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-cyan-300'
                      }`}
                    >
                      {target.responseLevel} ({target.signalStrength} mV)
                    </span>
                  </div>
                </div>

                {/* Brief Interpretation */}
                <p className="mt-3 text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                  {target.interpretation}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Duration: {target.detectionDuration}</span>
                <span className="text-cyan-400 font-semibold flex items-center gap-0.5 hover:underline">
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
