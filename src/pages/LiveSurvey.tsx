import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { SeafloorMap } from '../components/SeafloorMap';
import { TelemetryChart } from '../components/TelemetryChart';
import { StatusBadge } from '../components/StatusBadge';
import {
  Radio,
  Pause,
  Play,
  Bookmark,
  MapPin,
  Anchor,
  Compass,
  Waves,
  Gauge,
  Thermometer,
  RotateCw,
  Activity,
  Zap,
  Target
} from 'lucide-react';

export const LiveSurvey: React.FC = () => {
  const {
    telemetry,
    signalHistory,
    pauseSurvey,
    markTarget,
    saveWaypoint,
    returnToSurface,
    setSelectedTarget,
    targets
  } = useSimulation();

  const heroTarget = targets.find((t) => t.code === 'A-03');

  return (
    <div className="h-[calc(100vh-4rem)] p-4 flex flex-col gap-3 select-none overflow-hidden">
      {/* Top Banner / Hero Title */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-ocean-900/80 rounded-md border border-slate-800/90 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="font-bold text-slate-100 tracking-wider">LIVE SURVEY OPERATIONS</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400">TRANSECT {telemetry.currentLine}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">POS: {telemetry.sensorLatitude}, {telemetry.sensorLongitude}</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={
              telemetry.metalResponse >= telemetry.threshold
                ? 'ANOMALY DETECTED'
                : telemetry.metalResponse >= 0.5
                ? 'ELEVATED RESPONSE'
                : 'NORMAL SURVEY'
            }
            pulse={telemetry.metalResponse >= 0.5}
          />
        </div>
      </div>

      {/* Main Grid: 68% Seafloor Map on Left, 32% Live Telemetry on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left Side: Large Seafloor Map (~68%) */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0 bg-ocean-900/60 rounded-lg border border-slate-800 p-2 overflow-hidden shadow-inner">
          <div className="flex-1 relative min-h-0">
            <SeafloorMap />
          </div>

          {/* Bottom Anomaly Banner on hero screen */}
          {telemetry.metalResponse >= 0.5 && (
            <div className="mt-2 p-2.5 rounded bg-gradient-to-r from-amber-950/80 via-ocean-900 to-rose-950/80 border border-amber-500/40 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-rose-400 animate-pulse" />
                <div>
                  <span className="font-bold text-amber-300">
                    {telemetry.metalResponse >= telemetry.threshold
                      ? 'THRESHOLD EXCEEDED (> 0.65 mV/V)'
                      : 'ELEVATED ELECTROMAGNETIC RESPONSE'}
                  </span>
                  <p className="text-[11px] text-slate-300 font-sans">
                    Localized induction gradient detected along Transect {telemetry.currentLine}.
                  </p>
                </div>
              </div>

              {heroTarget && (
                <button
                  onClick={() => setSelectedTarget(heroTarget)}
                  className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold transition-colors"
                >
                  INSPECT TARGET A-03
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Live Telemetry Panel (~32%) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0 bg-ocean-900/90 rounded-lg border border-slate-800 p-3.5 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {/* Header of Telemetry Panel */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-xs font-bold tracking-wider text-slate-100 uppercase">
                LIVE TELEMETRY PANEL
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              ● SYNC 10 Hz
            </span>
          </div>

          {/* Telemetry Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-2 text-mono">
            {/* DEPTH */}
            <div className="bg-ocean-850/80 p-2 rounded border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Waves className="w-3 h-3 text-cyan-400" /> DEPTH</span>
                <span className="text-cyan-400 text-[9px]">SONAR</span>
              </div>
              <div className="text-lg font-bold text-slate-100 mt-0.5">
                {telemetry.depth.toFixed(1)} <span className="text-xs font-normal text-slate-400">m</span>
              </div>
            </div>

            {/* PRESSURE */}
            <div className="bg-ocean-850/80 p-2 rounded border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-cyan-400" /> PRESSURE</span>
                <span className="text-cyan-400 text-[9px]">HYDRO</span>
              </div>
              <div className="text-lg font-bold text-slate-100 mt-0.5">
                {telemetry.pressure.toFixed(1)} <span className="text-xs font-normal text-slate-400">MPa</span>
              </div>
            </div>

            {/* TEMPERATURE */}
            <div className="bg-ocean-850/80 p-2 rounded border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-cyan-400" /> TEMP</span>
                <span className="text-cyan-400 text-[9px]">CTD</span>
              </div>
              <div className="text-lg font-bold text-slate-100 mt-0.5">
                {telemetry.temperature.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
              </div>
            </div>

            {/* SAMPLING RATE */}
            <div className="bg-ocean-850/80 p-2 rounded border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-cyan-400" /> SAMPLING</span>
                <span className="text-emerald-400 text-[9px]">REAL-TIME</span>
              </div>
              <div className="text-lg font-bold text-slate-100 mt-0.5">
                {telemetry.samplingRate} <span className="text-xs font-normal text-slate-400">Hz</span>
              </div>
            </div>
          </div>

          {/* IMU Attitude: Roll / Pitch / Yaw */}
          <div className="bg-ocean-850/80 p-2.5 rounded border border-slate-800 text-mono">
            <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-cyan-400" /> IMU ATTITUDE
              </span>
              <span className="text-slate-500 text-[9px]">STABILIZED</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-ocean-900/80 p-1 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block">ROLL</span>
                <span className="font-bold text-slate-200">
                  {telemetry.roll >= 0 ? `+${telemetry.roll.toFixed(1)}°` : `${telemetry.roll.toFixed(1)}°`}
                </span>
              </div>
              <div className="bg-ocean-900/80 p-1 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block">PITCH</span>
                <span className="font-bold text-slate-200">
                  {telemetry.pitch >= 0 ? `+${telemetry.pitch.toFixed(1)}°` : `${telemetry.pitch.toFixed(1)}°`}
                </span>
              </div>
              <div className="bg-ocean-900/80 p-1 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block">YAW</span>
                <span className="font-bold text-cyan-300">
                  {telemetry.yaw.toFixed(1)}°
                </span>
              </div>
            </div>
          </div>

          {/* METAL SENSOR HERO READOUT */}
          <div
            className={`p-3 rounded-md border transition-all duration-300 ${
              telemetry.metalResponse >= telemetry.threshold
                ? 'bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-950/50'
                : telemetry.metalResponse >= 0.5
                ? 'bg-amber-950/40 border-amber-500/50'
                : 'bg-ocean-850/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5 uppercase">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                METAL SENSOR RESPONSE
              </span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  telemetry.metalResponse >= telemetry.threshold
                    ? 'bg-rose-900/80 text-rose-200'
                    : telemetry.metalResponse >= 0.5
                    ? 'bg-amber-900/80 text-amber-200'
                    : 'bg-cyan-900/80 text-cyan-200'
                }`}
              >
                {telemetry.metalResponse >= telemetry.threshold ? 'HIGH ANOMALY' : telemetry.metalResponse >= 0.5 ? 'ELEVATED' : 'BASELINE'}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-mono font-bold text-amber-300">
                {telemetry.metalResponse.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-400">mV/V</span>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-400">
                <div>Baseline: {telemetry.baselineResponse} mV/V</div>
                <div>Threshold: {telemetry.threshold} mV/V</div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>SIGNAL QUALITY: <strong className="text-emerald-400">{telemetry.signalQuality}%</strong></span>
              <span>DEV: <strong className="text-amber-300">+{Math.round(((telemetry.metalResponse - telemetry.baselineResponse) / telemetry.baselineResponse) * 100)}%</strong></span>
            </div>
          </div>

          {/* LIVE SIGNAL GRAPH */}
          <div className="flex-1 min-h-[140px]">
            <TelemetryChart
              data={signalHistory}
              dataKey="response"
              title="LIVE ELECTROMAGNETIC RESPONSE"
              unit="mV/V"
              height={125}
              showThreshold={true}
              color={telemetry.metalResponse >= telemetry.threshold ? '#f43f5e' : '#00F2FE'}
            />
          </div>

          {/* SURVEY CONTROLS (All working buttons as requested) */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
              MISSION CONTROLS
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={pauseSurvey}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded border font-semibold transition-all ${
                  telemetry.isPaused
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
                    : 'bg-ocean-800 hover:bg-ocean-700 text-slate-200 border-slate-700'
                }`}
              >
                {telemetry.isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>RESUME</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>PAUSE SURVEY</span>
                  </>
                )}
              </button>

              <button
                onClick={markTarget}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition-all shadow-sm"
              >
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>MARK TARGET</span>
              </button>

              <button
                onClick={saveWaypoint}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
              >
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                <span>SAVE WAYPOINT</span>
              </button>

              <button
                onClick={returnToSurface}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 transition-all"
              >
                <Anchor className="w-3.5 h-3.5 text-rose-400" />
                <span>RETURN SURFACE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
