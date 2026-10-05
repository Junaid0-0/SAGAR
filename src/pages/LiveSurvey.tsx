import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TelemetryChart } from '../components/TelemetryChart';
import { StatusBadge } from '../components/StatusBadge';
import {
  Pause,
  Play,
  Bookmark,
  Anchor,
  Waves,
  Gauge,
  Thermometer,
  RotateCw,
  Activity,
  Zap,
  Target,
  ArrowDownUp,
  Compass,
  Video,
  Sun,
  Eye,
  ArrowUp,
  Cable
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
    targets,
    triggerDemoAnomaly,
    resetDemoToBaseline,
    addNotification
  } = useSimulation();

  const heroTarget = targets.find((t) => t.code === 'A-03');

  // Camera settings state for simulated underwater optics
  const [showHud, setShowHud] = useState<boolean>(true);
  const [floodlightActive, setFloodlightActive] = useState<boolean>(true);

  const handleAscend = () => {
    addNotification(
      'WINCH ASCENT SIGNAL',
      'Winch hoist commanded +5 m. Altitude adjusting over seabed.',
      'info'
    );
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto select-none font-sans">
      {/* 1. Page Header (With GPS Position retained) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#CBD9DA]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-sans font-semibold tracking-wide text-[#1F4B60] uppercase">
              LIVE SURVEY
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-[#E2EFF0] text-[#2A7C7A] border border-[#CBD9DA]">
              TRANSECT {telemetry.currentLine} ACTIVE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#DCEEEE] border border-[#B8CCD1] text-[#2A7C7A] font-semibold">
              SIMULATION MODE
            </span>
          </div>
          <p className="text-xs text-[#60868C] font-sans mt-0.5">
            Tethered Deep-Seafloor Sensor Pod &bull; Optical Feed & Station Control
          </p>
        </div>

        {/* GPS/Position Display - Retained as requested */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="bg-[#FFFFFF] px-3 py-1.5 rounded-[6px] border border-[#CBD9DA] shadow-sm flex items-center gap-1.5">
            <span className="text-[#60868C]">GPS / POS:</span>
            <span className="font-semibold text-[#1F4B60]">
              {telemetry.sensorLatitude}, {telemetry.sensorLongitude}
            </span>
          </div>
          <div className="bg-[#FFFFFF] px-3 py-1.5 rounded-[6px] border border-[#CBD9DA] shadow-sm flex items-center gap-1.5">
            <span className="text-[#60868C]">GRID:</span>
            <span className="font-semibold text-[#2A7C7A]">CIOB-04 / 50m TRANSECTS</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN SECTION: LIVE CAMERA VIEW (Main) + COMPACT POD CONTROLS (Right Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* MAIN VISUAL AREA: LIVE UNDERWATER CAMERA (8 cols) */}
        <div className="lg:col-span-8 bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-3 shadow-sm flex flex-col">
          {/* Camera Header Bar */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E5E2] mb-2.5">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#2A7C7A]" />
              <h3 className="font-sans text-xs font-semibold tracking-wide text-[#1F4B60] uppercase">
                LIVE UNDERWATER CAMERA
              </h3>
              <span className="text-[10px] font-mono text-[#60868C]">
                [SIMULATED OPTICAL FEED]
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFloodlightActive(!floodlightActive)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-[4px] border text-[11px] font-sans transition-colors ${
                  floodlightActive
                    ? 'bg-[#E2EFF0] text-[#2A7C7A] border-[#2A7C7A]/40'
                    : 'bg-[#FFFFFF] text-[#60868C] border-[#CBD9DA]'
                }`}
                title="Toggle Subsea Floodlights"
              >
                <Sun className="w-3 h-3" />
                <span>Floodlights {floodlightActive ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowHud(!showHud)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-[4px] border text-[11px] font-sans transition-colors ${
                  showHud
                    ? 'bg-[#E2EFF0] text-[#2A7C7A] border-[#2A7C7A]/40'
                    : 'bg-[#FFFFFF] text-[#60868C] border-[#CBD9DA]'
                }`}
                title="Toggle Telemetry HUD"
              >
                <Eye className="w-3 h-3" />
                <span>HUD</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs font-mono text-[#B85C5C]">
                <span className="w-2 h-2 rounded-full bg-[#B85C5C] animate-pulse" />
                <span className="text-[10.5px] font-bold">REC CH-01</span>
              </div>
            </div>
          </div>

          {/* Undersea Camera Canvas / Simulated Viewport */}
          <div className="relative w-full aspect-[16/9] min-h-[380px] max-h-[520px] rounded-[6px] overflow-hidden bg-gradient-to-b from-[#091B24] via-[#0D2836] to-[#051118] border border-[#CBD9DA] flex items-center justify-center select-none shadow-inner">
            {/* Deep Seafloor Background Graphics */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
                floodlightActive ? 'opacity-85' : 'opacity-30'
              }`}
            >
              {/* Floodlight Beam Cone Effect */}
              <div
                className="absolute inset-0 bg-radial from-[#2C5F6D]/35 via-[#133A4A]/25 to-transparent pointer-events-none"
                style={{ backgroundPosition: '50% 60%' }}
              />

              {/* Distant Seafloor Silhouette */}
              <svg className="absolute bottom-0 inset-x-0 w-full h-44 text-[#0B212D]/90" preserveAspectRatio="none" viewBox="0 0 1000 200">
                <path
                  d="M0,130 Q180,90 320,120 T620,105 T850,135 T1000,110 L1000,200 L0,200 Z"
                  fill="currentColor"
                />
                <path
                  d="M0,155 Q210,135 440,160 T750,140 T1000,165 L1000,200 L0,200 Z"
                  fill="#06161F"
                />
              </svg>

              {/* Dynamic Marine Snow / Suspended Sediments */}
              <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4EFF2] absolute top-[28%] left-[22%] blur-[0.6px] animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-[#D4EFF2] absolute top-[44%] left-[64%] blur-[0.4px] animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-[#D4EFF2] absolute top-[68%] left-[41%] blur-[0.8px] opacity-60" />
                <div className="w-1 h-1 rounded-full bg-[#D4EFF2] absolute top-[75%] left-[82%] blur-[0.5px]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4EFF2] absolute top-[18%] left-[78%] blur-[0.5px]" />
                <div className="w-1 h-1 rounded-full bg-[#D4EFF2] absolute top-[52%] left-[15%] blur-[0.3px]" />
              </div>
            </div>

            {/* Target marker in camera field of view if anomaly peak */}
            {telemetry.metalResponse >= 0.5 && (
              <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-dashed border-[#B85C5C] animate-spin" style={{ animationDuration: '8s' }} />
                <div className="w-10 h-10 -mt-13 rounded-full border border-[#B85C5C]/60 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#B85C5C] animate-ping" />
                </div>
                <div className="mt-4 px-2 py-0.5 rounded-[3px] bg-[#051118]/85 border border-[#B85C5C] text-[#F9E8E8] font-mono text-[9px] font-semibold tracking-wider">
                  TARGET A-03 // SENSOR PEAK {telemetry.metalResponse.toFixed(2)} mV/V
                </div>
              </div>
            )}

            {/* Subsea Camera HUD Overlay */}
            {showHud && (
              <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between text-white font-mono text-xs">
                {/* Top HUD Line */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#051118]/70 px-2.5 py-1 rounded-[4px] border border-white/10 backdrop-blur-xs">
                    <span className="text-[#64D2B8] font-bold">POD-01</span>
                    <span className="text-white/40">|</span>
                    <span className="text-white/80">TETHERED SENSOR POD</span>
                    <span className="text-white/40">|</span>
                    <span className="text-[#E5B568]">{telemetry.isPaused ? 'STATION HOLD' : 'TOW ACTIVE'}</span>
                  </div>

                  <div className="bg-[#051118]/70 px-2.5 py-1 rounded-[4px] border border-white/10 backdrop-blur-xs flex items-center gap-3 text-[11px]">
                    <span>ALT: <strong className="text-[#64D2B8]">12.4m</strong></span>
                    <span>SPD: <strong className="text-white">0.8 m/s</strong></span>
                    <span>HDG: <strong className="text-[#64D2B8]">{telemetry.yaw.toFixed(1)}°</strong></span>
                  </div>
                </div>

                {/* Center Reticle / Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  <div className="w-28 h-28 border border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border border-white/40 rounded-full" />
                  </div>
                  <div className="absolute w-36 h-[1px] bg-white/25" />
                  <div className="absolute h-36 w-[1px] bg-white/25" />
                  {/* Artificial horizon tick marks */}
                  <div
                    className="absolute w-20 flex justify-between text-[8px] text-white/50 transition-transform duration-200"
                    style={{ transform: `rotate(${-telemetry.roll}deg)` }}
                  >
                    <span>- -</span>
                    <span>- -</span>
                  </div>
                </div>

                {/* Bottom HUD Line */}
                <div className="flex items-end justify-between">
                  <div className="bg-[#051118]/75 px-3 py-1.5 rounded-[4px] border border-white/10 backdrop-blur-xs space-y-0.5 text-[10.5px]">
                    <div>DEPTH: <strong className="text-[#64D2B8] text-sm">{telemetry.depth.toFixed(1)} m</strong></div>
                    <div className="text-white/70">HYDRO PRESSURE: {telemetry.pressure.toFixed(1)} MPa &bull; TEMP: {telemetry.temperature.toFixed(1)} °C</div>
                    <div className="text-[#89B3BC]">COORDS: {telemetry.sensorLatitude}, {telemetry.sensorLongitude}</div>
                  </div>

                  <div className="bg-[#051118]/75 px-3 py-1.5 rounded-[4px] border border-white/10 backdrop-blur-xs text-right text-[10.5px]">
                    <div className="text-[#64D2B8]">TELEMETRY SYNC: 10 Hz</div>
                    <div className="text-white/60">ROLL: {telemetry.roll > 0 ? `+${telemetry.roll.toFixed(1)}` : telemetry.roll.toFixed(1)}° &bull; PITCH: {telemetry.pitch > 0 ? `+${telemetry.pitch.toFixed(1)}` : telemetry.pitch.toFixed(1)}°</div>
                    <div className="text-[#E5B568] font-bold">
                      SENSOR: {telemetry.metalResponse.toFixed(2)} mV/V
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Corner Simulation Watermark */}
            <div className="absolute top-2 right-2 text-[9px] font-mono text-white/40 bg-[#000000]/60 px-1.5 py-0.5 rounded-[3px] pointer-events-none">
              VIRTUAL FEED &bull; SIMULATION MODE
            </div>
          </div>

          {/* Under-Camera Status Strip */}
          <div className="pt-2.5 mt-2 border-t border-[#E7E5E2] flex flex-wrap items-center justify-between text-[11px] font-sans text-[#60868C]">
            <div className="flex items-center gap-3">
              <span>Platform: <strong>Tethered Deep-Seafloor Pod</strong></span>
              <span>&bull;</span>
              <span>FOV: <strong>92° Optical Cone</strong></span>
              <span>&bull;</span>
              <span>Deployment: <strong>Umbilical Winch Tow</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#2A7C7A] font-mono">
                {telemetry.isPaused ? 'WINCH STATION-KEEPING HOLD' : 'TOWED TRANSECT ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: COMPACT POD CONTROLS (4 cols) — Realistic Tethered Pod Interface */}
        <div className="lg:col-span-4 bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E5E2]">
              <div className="flex items-center gap-2">
                <Cable className="w-4 h-4 text-[#2A7C7A]" />
                <h3 className="font-sans text-xs font-semibold tracking-wide text-[#1F4B60] uppercase">
                  POD CONTROLS
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#3F8068] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F8068]" />
                TETHER LINKED
              </span>
            </div>
            <p className="text-[11px] text-[#60868C] font-sans">
              Tethered pod station-keeping & winch deployment directives
            </p>

            {/* Tether & Winch Status Card */}
            <div className="p-3 bg-[#F8F6F2] rounded-[6px] border border-[#CBD9DA] space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-sans font-semibold text-[#60868C] uppercase">
                  UMBILICAL TETHER
                </span>
                <span className="font-bold text-[#1F4B60]">4,310 m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-sans font-semibold text-[#60868C] uppercase">
                  WINCH TENSION
                </span>
                <span className="font-semibold text-[#3F8068]">14.2 kN (Nominal)</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#CBD9DA]/60 text-[11px]">
                <span className="text-[10px] font-sans font-semibold text-[#60868C] uppercase">
                  SURFACE VESSEL
                </span>
                <span className="text-[#2A7C7A] font-semibold">RV SAMUDRA</span>
              </div>
            </div>

            {/* Compact Pod Operational Action Commands */}
            <div className="space-y-2">
              {/* 1. HOLD / PAUSE (Station-Keeping Hold) */}
              <button
                onClick={pauseSurvey}
                className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-[6px] border font-sans text-xs font-semibold transition-colors shadow-xs ${
                  telemetry.isPaused
                    ? 'bg-[#3F8068] hover:bg-[#1F4B60] text-[#FFFFFF] border-[#3F8068]'
                    : 'bg-[#2A7C7A] hover:bg-[#1F4B60] text-[#FFFFFF] border-[#2A7C7A]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {telemetry.isPaused ? (
                    <Play className="w-4 h-4 fill-current" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                  <span>{telemetry.isPaused ? 'RESUME SURVEY TRANSECT' : 'HOLD / PAUSE POD'}</span>
                </div>
                <span className="font-mono text-[10px] bg-[#FFFFFF]/20 px-1.5 py-0.5 rounded-[3px]">
                  {telemetry.isPaused ? 'HOLD ACTIVE' : 'TOWING'}
                </span>
              </button>

              {/* 2. MARK TARGET */}
              <button
                onClick={markTarget}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8EFE3] text-[#1F4B60] border border-[#CBD9DA] font-sans text-xs font-medium transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#B78332]" />
                  <span>MARK TARGET</span>
                </div>
                <span className="font-mono text-[10px] text-[#60868C]">LOG DETECT</span>
              </button>

              {/* 3. SAVE WAYPOINT */}
              <button
                onClick={saveWaypoint}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#E2EFF0] text-[#1F4B60] border border-[#CBD9DA] font-sans text-xs font-medium transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#2A7C7A]" />
                  <span>SAVE WAYPOINT</span>
                </div>
                <span className="font-mono text-[10px] text-[#60868C]">GPS TAG</span>
              </button>

              {/* 4. ASCEND (Adjust Winch +5m) */}
              <button
                onClick={handleAscend}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F2F6F6] text-[#1F4B60] border border-[#CBD9DA] font-sans text-xs font-medium transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-4 h-4 text-[#2A7C7A]" />
                  <span>ASCEND (+5 m WINCH)</span>
                </div>
                <span className="font-mono text-[10px] text-[#2A7C7A]">HOIST</span>
              </button>

              {/* 5. RETRACT / SURFACE */}
              <button
                onClick={returnToSurface}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-[6px] bg-[#F9E8E8] hover:bg-[#F8F6F2] text-[#B85C5C] border border-[#CBD9DA] font-sans text-xs font-medium transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-[#B85C5C]" />
                  <span>RETRACT / SURFACE</span>
                </div>
                <span className="font-mono text-[10px] text-[#B85C5C]">RECOVERY</span>
              </button>
            </div>
          </div>

          {/* Operational Notes */}
          <div className="pt-3 border-t border-[#E7E5E2] text-[11px] font-sans text-[#60868C] leading-snug">
            Tethered pod operation: Depth and towing speed (0.8 m/s) controlled from RV Samudra surface winch.
          </div>
        </div>
      </div>

      {/* 3. THRESHOLD EVENT STRIP (If elevated or metal detected) */}
      {telemetry.metalResponse >= 0.5 && (
        <div className="p-2.5 px-4 rounded-[6px] bg-[#F8EFE3] border border-[#CBD9DA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B85C5C] flex-shrink-0 animate-ping" />
            <span className="font-mono font-bold text-[#B85C5C] uppercase tracking-wide">
              {telemetry.metalResponse >= telemetry.threshold ? 'METAL DETECTED // THRESHOLD EXCEEDED' : 'ELEVATED SENSOR RESPONSE'}
            </span>
            <span className="text-[#CBD9DA] hidden sm:inline">|</span>
            <span className="font-mono text-[#1F4B60]">
              {telemetry.currentLine} &bull; Response: {telemetry.metalResponse.toFixed(2)} mV/V &bull; Target: A-03
            </span>
          </div>

          {heroTarget && (
            <button
              onClick={() => setSelectedTarget(heroTarget)}
              className="self-start sm:self-auto flex items-center gap-1 px-3 py-1 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8F6F2] text-[#B85C5C] border border-[#CBD9DA] font-mono text-xs font-semibold transition-colors"
            >
              <span>INSPECT TARGET A-03 &rarr;</span>
            </button>
          )}
        </div>
      )}

      {/* 4. LIVE TELEMETRY SECTION (Scientific Instrumentation Strip Layout) */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-4 shadow-sm space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2A7C7A]" />
            <h3 className="font-sans text-xs font-semibold tracking-wide text-[#1F4B60] uppercase">
              LIVE TELEMETRY
            </h3>
            <span className="text-[10px] font-mono text-[#60868C]">
              INSTRUMENTATION RACK
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-[#3F8068] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3F8068] animate-pulse" />
            TELEMETRY SYNC 10 Hz
          </span>
        </div>

        {/* Dynamic Telemetry Metrics Strip: Aligned columns */}
        <div className="bg-[#F8F6F2] rounded-[6px] border border-[#CBD9DA] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#CBD9DA]/70 font-mono">
          {/* DEPTH */}
          <div className="p-3">
            <div className="flex items-center justify-between text-[10px] text-[#60868C] font-sans uppercase mb-1 font-medium tracking-wide">
              <span className="flex items-center gap-1">
                <Waves className="w-3 h-3 text-[#2A7C7A]" /> DEPTH
              </span>
              <span className="text-[9px] font-mono text-[#8EA8AE]">SONAR</span>
            </div>
            <div className="text-xl font-bold text-[#1F4B60]">
              {telemetry.depth.toFixed(1)}{' '}
              <span className="text-xs font-normal text-[#60868C]">m</span>
            </div>
          </div>

          {/* TEMPERATURE */}
          <div className="p-3">
            <div className="flex items-center justify-between text-[10px] text-[#60868C] font-sans uppercase mb-1 font-medium tracking-wide">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-[#2A7C7A]" /> TEMPERATURE
              </span>
              <span className="text-[9px] font-mono text-[#8EA8AE]">RTD</span>
            </div>
            <div className="text-xl font-bold text-[#1F4B60]">
              {telemetry.temperature.toFixed(1)}{' '}
              <span className="text-xs font-normal text-[#60868C]">°C</span>
            </div>
          </div>

          {/* SPEED */}
          <div className="p-3">
            <div className="flex items-center justify-between text-[10px] text-[#60868C] font-sans uppercase mb-1 font-medium tracking-wide">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-[#2A7C7A]" /> SPEED
              </span>
              <span className="text-[9px] font-mono text-[#8EA8AE]">TOW</span>
            </div>
            <div className="text-xl font-bold text-[#1F4B60]">
              0.8 <span className="text-xs font-normal text-[#60868C]">m/s</span>
            </div>
          </div>

          {/* PRESSURE */}
          <div className="p-3">
            <div className="flex items-center justify-between text-[10px] text-[#60868C] font-sans uppercase mb-1 font-medium tracking-wide">
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-[#2A7C7A]" /> PRESSURE
              </span>
              <span className="text-[9px] font-mono text-[#8EA8AE]">HYDRO</span>
            </div>
            <div className="text-xl font-bold text-[#1F4B60]">
              {telemetry.pressure.toFixed(1)}{' '}
              <span className="text-xs font-normal text-[#60868C]">MPa</span>
            </div>
          </div>

          {/* SAMPLING */}
          <div className="p-3">
            <div className="flex items-center justify-between text-[10px] text-[#60868C] font-sans uppercase mb-1 font-medium tracking-wide">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#2A7C7A]" /> SAMPLING
              </span>
              <span className="text-[9px] font-mono text-[#3F8068] font-semibold">VALID</span>
            </div>
            <div className="text-xl font-bold text-[#1F4B60]">
              {telemetry.samplingRate}{' '}
              <span className="text-xs font-normal text-[#60868C]">Hz</span>
            </div>
          </div>

          {/* ALTITUDE / AOB */}
          <div className="p-3">
            <div className="flex items-center justify-between text-[10px] text-[#60868C] font-sans uppercase mb-1 font-medium tracking-wide">
              <span className="flex items-center gap-1">
                <ArrowDownUp className="w-3 h-3 text-[#2A7C7A]" /> ALTITUDE
              </span>
              <span className="text-[9px] font-mono text-[#8EA8AE]">ALTIMETER</span>
            </div>
            <div className="text-xl font-bold text-[#1F4B60]">
              12.4 <span className="text-xs font-normal text-[#60868C]">m</span>
            </div>
          </div>
        </div>

        {/* PLATFORM ATTITUDE (Roll, Pitch, Yaw) */}
        <div className="pt-3 border-t border-[#E7E5E2] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5 text-[#2A7C7A]" />
            <span className="font-sans text-xs font-semibold text-[#1F4B60] uppercase tracking-wide">
              PLATFORM ATTITUDE
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <div className="bg-[#F8F6F2] px-3 py-1.5 rounded-[4px] border border-[#CBD9DA] flex items-center gap-2">
              <span className="text-[#60868C] text-[10px] font-sans font-medium">ROLL:</span>
              <span className="font-bold text-[#1F4B60]">
                {telemetry.roll >= 0 ? `+${telemetry.roll.toFixed(1)}°` : `${telemetry.roll.toFixed(1)}°`}
              </span>
            </div>

            <div className="bg-[#F8F6F2] px-3 py-1.5 rounded-[4px] border border-[#CBD9DA] flex items-center gap-2">
              <span className="text-[#60868C] text-[10px] font-sans font-medium">PITCH:</span>
              <span className="font-bold text-[#1F4B60]">
                {telemetry.pitch >= 0 ? `+${telemetry.pitch.toFixed(1)}°` : `${telemetry.pitch.toFixed(1)}°`}
              </span>
            </div>

            <div className="bg-[#F8F6F2] px-3 py-1.5 rounded-[4px] border border-[#CBD9DA] flex items-center gap-2">
              <span className="text-[#60868C] text-[10px] font-sans font-medium">YAW / HEADING:</span>
              <span className="font-bold text-[#1F4B60]">
                {telemetry.yaw.toFixed(1)}°
              </span>
            </div>

            <span className="px-2.5 py-1 rounded-[4px] bg-[#E5F2EC] text-[#3F8068] border border-[#CBD9DA] text-[10px] font-mono font-semibold">
              STABILIZED
            </span>
          </div>
        </div>
      </div>

      {/* 5. SENSOR RESPONSE STRIP & REAL-TIME GRAPH */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E7E5E2]">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#B78332]" />
            <h3 className="font-sans text-xs font-semibold tracking-wide text-[#1F4B60] uppercase">
              SENSOR RESPONSE
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerDemoAnomaly}
              className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8EFE3] text-[#B85C5C] border border-[#CBD9DA] transition-colors"
            >
              SIMULATE ANOMALY
            </button>
            <button
              onClick={resetDemoToBaseline}
              className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-[4px] bg-[#FFFFFF] hover:bg-[#F8F6F2] text-[#60868C] border border-[#CBD9DA] transition-colors"
            >
              RESET BASELINE
            </button>
            <StatusBadge
              status={
                telemetry.metalResponse >= telemetry.threshold
                  ? 'METAL DETECTED'
                  : telemetry.metalResponse >= 0.5
                  ? 'ELEVATED RESPONSE'
                  : 'NORMAL BASELINE'
              }
              variant={
                telemetry.metalResponse >= telemetry.threshold
                  ? 'red'
                  : telemetry.metalResponse >= 0.5
                  ? 'amber'
                  : 'green'
              }
            />
          </div>
        </div>

        {/* Live Sensor Response Waveform */}
        <div className="pt-1">
          <TelemetryChart
            data={signalHistory}
            dataKey="response"
            title="REAL-TIME SENSOR RESPONSE STREAM"
            unit="mV/V"
            height={140}
            showThreshold={true}
            color={telemetry.metalResponse >= telemetry.threshold ? '#B85C5C' : '#2A7C7A'}
          />
        </div>
      </div>
    </div>
  );
};
