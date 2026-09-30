import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TargetAnomaly } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  X,
  Target,
  FileDown,
  ListPlus,
  Check,
  Compass,
  Layers,
  Activity,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export const TargetModal: React.FC = () => {
  const {
    selectedTarget,
    setSelectedTarget,
    toggleTargetQueue,
    exportData
  } = useSimulation();

  if (!selectedTarget) return null;

  // Generate localized anomaly curve for this target
  const chartData = [
    { offset: '-50m', response: 0.31 },
    { offset: '-40m', response: 0.33 },
    { offset: '-30m', response: 0.38 },
    { offset: '-20m', response: 0.52 },
    { offset: '-10m', response: 0.69 },
    { offset: '0m (Peak)', response: selectedTarget.signalStrength },
    { offset: '+10m', response: 0.64 },
    { offset: '+20m', response: 0.48 },
    { offset: '+30m', response: 0.36 },
    { offset: '+40m', response: 0.32 },
    { offset: '+50m', response: 0.30 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-ocean-900 border border-cyan-500/40 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-ocean-850/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-bold tracking-wider text-slate-100">
                  {selectedTarget.id}
                </h3>
                <StatusBadge status={selectedTarget.status === 'PRIORITY' ? 'HIGH PRIORITY' : selectedTarget.status} />
              </div>
              <p className="text-[11px] font-mono text-cyan-400/80">
                POSITION: {selectedTarget.coordinates.lat}, {selectedTarget.coordinates.lng}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTarget(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-ocean-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Key Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-ocean-850/80 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">DEPTH</span>
              <div className="text-base font-mono font-bold text-slate-100">
                {selectedTarget.depth.toLocaleString()} m
              </div>
            </div>

            <div className="bg-ocean-850/80 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">SIGNAL STRENGTH</span>
              <div className="text-base font-mono font-bold text-amber-400">
                {selectedTarget.signalStrength.toFixed(2)} <span className="text-xs font-normal text-slate-400">mV/V</span>
              </div>
            </div>

            <div className="bg-ocean-850/80 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">SURVEY TRANSECT</span>
              <div className="text-base font-mono font-bold text-cyan-300">
                {selectedTarget.surveyLine}
              </div>
            </div>

            <div className="bg-ocean-850/80 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">MEASUREMENTS</span>
              <div className="text-base font-mono font-bold text-slate-100">
                {selectedTarget.measurements}
              </div>
            </div>
          </div>

          {/* Secondary Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-ocean-950/60 p-2.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">RESPONSE LEVEL</span>
              <span className="font-semibold text-rose-300">{selectedTarget.responseLevel}</span>
            </div>
            <div className="bg-ocean-950/60 p-2.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">DETECTION DURATION</span>
              <span className="font-semibold text-slate-200">{selectedTarget.detectionDuration}</span>
            </div>
            <div className="bg-ocean-950/60 p-2.5 rounded border border-slate-800/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 uppercase block">LOGGED TIMESTAMP</span>
              <span className="font-semibold text-slate-200">{selectedTarget.timestamp}</span>
            </div>
          </div>

          {/* Spatial Profile Graph */}
          <div className="bg-ocean-850/70 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                LOCALIZED INDUCTION RESPONSE TRANSECT (±50m)
              </span>
              <span className="text-[10px] font-mono text-amber-400">
                PEAK: {selectedTarget.signalStrength} mV/V
              </span>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="offset" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0.2, 0.9]} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c1b33',
                      borderColor: '#0284c7',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  />
                  <ReferenceLine y={0.65} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'THRESHOLD 0.65', fill: '#f87171', fontSize: 9 }} />
                  <ReferenceLine y={0.31} stroke="#0ea5e9" strokeDasharray="2 2" label={{ value: 'BASELINE 0.31', fill: '#38bdf8', fontSize: 9 }} />
                  <Area
                    type="monotone"
                    dataKey="response"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#targetGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Interpretation */}
          <div className="bg-ocean-850/90 border-l-4 border-cyan-400 p-3.5 rounded-r">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-300 uppercase mb-1">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              SYSTEM INTERPRETATION
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              "{selectedTarget.interpretation}"
            </p>
          </div>

          {/* Recommendation */}
          <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              OPERATIONAL RECOMMENDATION
            </div>
            <p className="text-xs font-mono font-semibold text-amber-200">
              {selectedTarget.recommendation}
            </p>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-ocean-850/90">
          <button
            onClick={() => exportData('target-report')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>EXPORT DATA</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTargetQueue(selectedTarget.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
                selectedTarget.queuedForSurvey
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900'
                  : 'bg-ocean-800 border-slate-700 text-slate-300 hover:bg-ocean-700'
              }`}
            >
              {selectedTarget.queuedForSurvey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>QUEUED FOR SURVEY</span>
                </>
              ) : (
                <>
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>ADD TO SURVEY QUEUE</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedTarget(null)}
              className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
