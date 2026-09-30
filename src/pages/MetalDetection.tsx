import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TelemetryChart } from '../components/TelemetryChart';
import { StatusBadge } from '../components/StatusBadge';
import {
  Activity,
  Zap,
  Gauge,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const MetalDetection: React.FC = () => {
  const {
    telemetry,
    signalHistory,
    detectionHistory,
    triggerDemoAnomaly,
    resetDemoToBaseline,
    setSelectedTarget,
    targets
  } = useSimulation();

  const deviationPct = Math.round(
    ((telemetry.metalResponse - telemetry.baselineResponse) / telemetry.baselineResponse) * 100
  );

  const isExceeded = telemetry.metalResponse >= telemetry.threshold;
  const isElevated = telemetry.metalResponse >= 0.5;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
              METAL DETECTION
            </h2>
            <StatusBadge
              status={isExceeded ? 'THRESHOLD EXCEEDED' : isElevated ? 'ELEVATED RESPONSE' : 'NORMAL BASELINE'}
              pulse={isElevated}
            />
          </div>
          <p className="text-xs font-mono text-cyan-400/90 tracking-wide mt-0.5">
            ELECTROMAGNETIC / MAGNETIC RESPONSE ANALYSIS & INDUCTION MONITORING
          </p>
        </div>

        {/* Demo trigger buttons directly on page for quick video flow */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetDemoToBaseline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ocean-800 hover:bg-ocean-700 text-slate-300 border border-slate-700 font-mono text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>SET BASELINE</span>
          </button>
          <button
            onClick={triggerDemoAnomaly}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-slate-950 font-mono text-xs font-bold shadow-md shadow-amber-950/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRIGGER A-03 PEAK</span>
          </button>
        </div>
      </div>

      {/* Main Visualization: Large Real-Time Signal Graph */}
      <div className="bg-ocean-850/80 rounded-lg border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
              REAL-TIME INDUCTIVE / MAGNETIC SENSOR TRANSIENT RESPONSE
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-0.5 bg-cyan-400" /> Baseline: 0.31 mV/V
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-0.5 bg-rose-500" /> Threshold: 0.65 mV/V
            </span>
          </div>
        </div>

        {/* Large Chart Canvas */}
        <div className="h-64 w-full">
          <TelemetryChart
            data={signalHistory}
            dataKey="response"
            title="DUAL-FREQUENCY ELECTROMAGNETIC INDUCTION AMPLITUDE"
            unit="mV/V"
            height={230}
            showThreshold={true}
            color={isExceeded ? '#f43f5e' : isElevated ? '#f59e0b' : '#00F2FE'}
          />
        </div>

        {/* Graph state progression bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-ocean-950 border border-slate-700 text-slate-300">
              1. NORMAL BASELINE (0.31 mV/V)
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300">
              2. ELEVATED RESPONSE (0.50+ mV/V)
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 font-bold">
              3. ANOMALY DETECTED (&gt;0.65 mV/V)
            </span>
          </div>
          <span className="text-cyan-400 font-semibold">SIGNAL-TO-NOISE: 31.4 dB</span>
        </div>
      </div>

      {/* Response Parameters Grid (As specifically required) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Current Sensor Response */}
        <div className="bg-ocean-850/80 p-4 rounded-lg border border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">
            CURRENT SENSOR RESPONSE
          </span>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
            {telemetry.metalResponse.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">mV/V</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            10 soundings / sec average
          </span>
        </div>

        {/* Baseline */}
        <div className="bg-ocean-850/80 p-4 rounded-lg border border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">
            BASELINE NOISE FLOOR
          </span>
          <div className="text-2xl font-mono font-bold text-cyan-300 mt-1">
            {telemetry.baselineResponse.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">mV/V</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            Calibrated at 4,280m depth
          </span>
        </div>

        {/* Deviation */}
        <div className="bg-ocean-850/80 p-4 rounded-lg border border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">
            RESPONSE DEVIATION
          </span>
          <div className="text-2xl font-mono font-bold text-rose-400 mt-1 flex items-center">
            +{deviationPct}%
            <ArrowUpRight className="w-5 h-5 ml-1 text-rose-400" />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            Above ambient seabed floor
          </span>
        </div>

        {/* Status */}
        <div className="bg-ocean-850/80 p-4 rounded-lg border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">
            DETECTION STATUS
          </span>
          <div className="mt-1">
            <span
              className={`inline-block font-mono text-sm font-bold px-2.5 py-1 rounded border uppercase ${
                isExceeded
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                  : isElevated
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
              }`}
            >
              {isExceeded ? 'HIGH RESPONSE' : isElevated ? 'ELEVATED RESPONSE' : 'NORMAL BASELINE'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1">
            Inductive signature verified
          </span>
        </div>
      </div>

      {/* Detection Threshold Bar */}
      <div className="bg-ocean-850/80 rounded-lg border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">
            !
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-slate-200">
              DETECTION THRESHOLD: {telemetry.threshold} mV/V &nbsp;|&nbsp; CURRENT: {telemetry.metalResponse} mV/V
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Automatic alert triggers when moving average exceeds 0.65 mV/V for &gt; 3 seconds.
            </div>
          </div>
        </div>

        <div>
          <StatusBadge
            status={isExceeded ? 'THRESHOLD EXCEEDED' : 'WITHIN NOMINAL LIMITS'}
            variant={isExceeded ? 'red' : 'green'}
            pulse={isExceeded}
          />
        </div>
      </div>

      {/* Detection History Table (Specified columns and exact rows) */}
      <div className="bg-ocean-850/80 rounded-lg border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
            DETECTION HISTORY LOG
          </h3>
          <span className="text-xs font-mono text-slate-400">
            AUTO-LOGGED TRANSIENT PEAKS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <th className="py-2.5 px-3">TIME</th>
                <th className="py-2.5 px-3">DEPTH</th>
                <th className="py-2.5 px-3">RESPONSE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">TARGET</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {detectionHistory.map((row) => {
                const targetObj = targets.find((t) => t.code === row.target);
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-ocean-800/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (targetObj) setSelectedTarget(targetObj);
                    }}
                  >
                    <td className="py-2.5 px-3 text-cyan-300 font-semibold">{row.time}</td>
                    <td className="py-2.5 px-3">{row.depth}m</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-bold ${
                          row.response >= 0.65
                            ? 'text-rose-400'
                            : row.response >= 0.5
                            ? 'text-amber-400'
                            : 'text-slate-200'
                        }`}
                      >
                        {row.response.toFixed(2)} mV/V
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={row.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3">
                      {row.target !== '—' ? (
                        <span className="font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                          {row.target}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {targetObj && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTarget(targetObj);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 text-[11px] underline"
                        >
                          View Target
                        </button>
                      )}
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
