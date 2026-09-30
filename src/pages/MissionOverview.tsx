import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import {
  Compass,
  Waves,
  Ruler,
  Maximize,
  Binary,
  Target,
  BatteryCharging,
  ArrowRight,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const MissionOverview: React.FC = () => {
  const {
    telemetry,
    activityLogs,
    targets,
    setCurrentPage,
    setSelectedTarget
  } = useSimulation();

  const heroTarget = targets.find((t) => t.code === 'A-03') || targets[0];
  const progressPct = Math.round((telemetry.completedLines / telemetry.totalLines) * 100);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
              MISSION OVERVIEW
            </h2>
            <StatusBadge status="ACTIVE" variant="green" />
          </div>
          <p className="text-xs font-mono text-cyan-400/90 tracking-wide mt-0.5">
            SEAFLOOR SURVEY 07 — PRELIMINARY SEABED EXPLORATION
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('live-survey')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-slate-950 font-mono text-xs font-bold shadow-md shadow-cyan-950/40 transition-all"
          >
            <span>LAUNCH LIVE SURVEY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top KPI Cards (7 Cards as explicitly specified) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          label="MISSION STATUS"
          value="ACTIVE"
          status="ONLINE"
          statusVariant="green"
          icon={<Compass className="w-4 h-4 text-emerald-400" />}
          highlight={true}
        />
        <MetricCard
          label="DEPLOYMENT DEPTH"
          value={Math.round(telemetry.depth).toLocaleString()}
          unit="m"
          subtext="Hydrostatic: 42.1 MPa"
          icon={<Waves className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          label="SURVEY DISTANCE"
          value={telemetry.surveyDistance.toFixed(2)}
          unit="km"
          subtext="Speed: 0.8 m/s"
          icon={<Ruler className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          label="AREA SURVEYED"
          value={telemetry.areaSurveyed.toFixed(2)}
          unit="km²"
          subtext="Grid: 50m spacing"
          icon={<Maximize className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          label="MEASUREMENTS"
          value={telemetry.measurementsCount.toLocaleString()}
          subtext="Rate: 10 soundings/s"
          icon={<Binary className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          label="ANOMALIES"
          value={String(telemetry.activeAnomaliesCount).padStart(2, '0')}
          status="LOGGED"
          statusVariant="amber"
          icon={<Target className="w-4 h-4 text-amber-400" />}
          highlight={telemetry.metalResponse >= telemetry.threshold}
        />
        <MetricCard
          label="POWER"
          value={telemetry.battery}
          unit="%"
          subtext={`${telemetry.voltage.toFixed(1)} VDC bus`}
          status="HEALTHY"
          statusVariant="green"
          icon={<BatteryCharging className="w-4 h-4 text-emerald-400" />}
        />
      </div>

      {/* Middle Section: Mission Progress & Current Target */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Mission Progress */}
        <div className="bg-ocean-850/80 rounded-lg border border-slate-800 p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
                  MISSION PROGRESS
                </h3>
              </div>
              <span className="font-mono text-lg font-bold text-cyan-300">
                {progressPct}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>Deployment Start</span>
                <span>Transects Execution</span>
                <span>Surface Recovery</span>
              </div>
            </div>

            {/* Sub-parameters specified */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <div className="bg-ocean-900/80 p-3 rounded border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  SURVEY LINES
                </span>
                <span className="text-base font-mono font-bold text-slate-100">
                  {telemetry.completedLines} / {telemetry.totalLines}
                </span>
              </div>

              <div className="bg-ocean-900/80 p-3 rounded border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  AREA SCANNED
                </span>
                <span className="text-base font-mono font-bold text-slate-100">
                  {telemetry.areaSurveyed} km²
                </span>
              </div>

              <div className="bg-ocean-900/80 p-3 rounded border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  MEASUREMENTS
                </span>
                <span className="text-base font-mono font-bold text-cyan-300">
                  {telemetry.measurementsCount.toLocaleString()}
                </span>
              </div>

              <div className="bg-ocean-900/80 p-3 rounded border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  HIGH-PRIORITY TARGETS
                </span>
                <span className="text-base font-mono font-bold text-amber-400">
                  3
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>VESSEL: RV SAMUDRA</span>
            <span className="text-cyan-400">ACOUSTIC LINK: ACTIVE (126 ms)</span>
          </div>
        </div>

        {/* RIGHT: Current Target (Hero card for TARGET A-03) */}
        <div className="bg-ocean-850/80 rounded-lg border border-amber-500/30 p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
                  CURRENT TARGET
                </h3>
              </div>
              <StatusBadge status="REQUIRES DETAILED SURVEY" variant="amber" pulse={true} />
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-mono font-bold text-slate-100">
                  {heroTarget.id}
                </span>
                <p className="text-xs font-mono text-cyan-400 mt-0.5">
                  Position: {heroTarget.coordinates.lat}, {heroTarget.coordinates.lng}
                </p>
              </div>

              <button
                onClick={() => setSelectedTarget(heroTarget)}
                className="px-3 py-1 rounded bg-ocean-800 hover:bg-ocean-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
              >
                VIEW DOSSIER
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono">
              <div className="bg-ocean-900/80 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">
                  METAL-RELATED RESPONSE
                </span>
                <span className="text-base font-bold text-amber-400">
                  HIGH <span className="text-xs font-normal text-slate-400">({heroTarget.signalStrength} mV/V)</span>
                </span>
              </div>

              <div className="bg-ocean-900/80 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">
                  DEPTH
                </span>
                <span className="text-base font-bold text-slate-100">
                  {heroTarget.depth} m
                </span>
              </div>
            </div>

            <div className="mt-3.5 p-3 rounded bg-amber-950/20 border border-amber-500/20">
              <div className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                SCIENTIFIC INTERPRETATION & RECOMMENDATION:
              </div>
              <p className="text-xs text-slate-300 font-sans mt-1 leading-snug">
                Elevated metal-related response detected along Line L-07. Candidate exploration area requires secondary high-resolution acoustic survey and ground-truthing.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">DETECTION TRANSECT: {heroTarget.surveyLine}</span>
            <span className="text-emerald-400 font-semibold">QUEUED FOR SAMPLING</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Mission Activity (Specified timeline sequence) */}
      <div className="bg-ocean-850/80 rounded-lg border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
              MISSION ACTIVITY
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            SYNCHRONIZED WITH ACOUSTIC LOGGER
          </span>
        </div>

        <Timeline logs={activityLogs} />
      </div>
    </div>
  );
};
