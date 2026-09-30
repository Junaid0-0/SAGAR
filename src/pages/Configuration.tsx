import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Settings,
  Sliders,
  HardDrive,
  Wifi,
  Save,
  RotateCcw,
  CheckCircle2,
  Shield,
  SlidersHorizontal
} from 'lucide-react';

export const Configuration: React.FC = () => {
  const { telemetry, addNotification } = useSimulation();

  const [samplingRate, setSamplingRate] = useState<number>(10);
  const [threshold, setThreshold] = useState<number>(0.65);
  const [lineSpacing, setLineSpacing] = useState<number>(50);
  const [surveySpeed, setSurveySpeed] = useState<number>(0.8);
  const [sensitivity, setSensitivity] = useState<string>('Medium');
  const [loggingEnabled, setLoggingEnabled] = useState<boolean>(true);
  const [telemetryInterval, setTelemetryInterval] = useState<number>(2);

  const handleSaveConfig = () => {
    addNotification(
      'CONFIGURATION COMMITTED',
      `Parameters updated — Detection Threshold: ${threshold} mV/V, Sampling: ${samplingRate} Hz.`,
      'success'
    );
  };

  const handleResetDefaults = () => {
    setSamplingRate(10);
    setThreshold(0.65);
    setLineSpacing(50);
    setSurveySpeed(0.8);
    setSensitivity('Medium');
    setLoggingEnabled(true);
    setTelemetryInterval(2);
    addNotification('DEFAULTS RESTORED', 'Standard oceanographic parameters restored.', 'info');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
              SYSTEM CONFIGURATION
            </h2>
            <StatusBadge status="SETTINGS LOCKED" variant="cyan" />
          </div>
          <p className="text-xs font-mono text-cyan-400/90 tracking-wide mt-0.5">
            MISSION PARAMETERS, ACOUSTIC PROTOCOLS & SENSOR CALIBRATION
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ocean-850 hover:bg-ocean-800 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEFAULTS</span>
          </button>
          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-slate-950 text-xs font-mono font-bold shadow-md shadow-cyan-950/40 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>APPLY PARAMETERS</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: MISSION PARAMETERS */}
        <div className="bg-ocean-850/80 rounded-lg border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
              MISSION PARAMETERS
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Sampling Rate */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>SAMPLING RATE</span>
                <span className="font-bold text-cyan-300">{samplingRate} Hz</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={samplingRate}
                onChange={(e) => setSamplingRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">Dual-frequency excitation cycle rate</span>
            </div>

            {/* Detection Threshold */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>DETECTION THRESHOLD</span>
                <span className="font-bold text-amber-400">{threshold.toFixed(2)} mV/V</span>
              </div>
              <input
                type="range"
                min="0.40"
                max="1.20"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[10px] text-slate-500">Trigger limit for candidate anomaly logging</span>
            </div>

            {/* Survey Line Spacing */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>SURVEY LINE SPACING</span>
                <span className="font-bold text-slate-200">{lineSpacing} m</span>
              </div>
              <select
                value={lineSpacing}
                onChange={(e) => setLineSpacing(Number(e.target.value))}
                className="w-full bg-ocean-900 border border-slate-700 rounded p-2 text-slate-200 text-xs font-mono"
              >
                <option value={25}>25 m (High-Density Ultra-Res)</option>
                <option value={50}>50 m (Standard Lawnmower)</option>
                <option value={100}>100 m (Reconnaissance Grid)</option>
              </select>
            </div>

            {/* Survey Speed */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>SURVEY SPEED</span>
                <span className="font-bold text-slate-200">{surveySpeed.toFixed(1)} m/s (1.6 kt)</span>
              </div>
              <select
                value={surveySpeed}
                onChange={(e) => setSurveySpeed(Number(e.target.value))}
                className="w-full bg-ocean-900 border border-slate-700 rounded p-2 text-slate-200 text-xs font-mono"
              >
                <option value={0.5}>0.5 m/s (Slow Precision Tow)</option>
                <option value={0.8}>0.8 m/s (Nominal Cruise)</option>
                <option value={1.2}>1.2 m/s (Fast Transit)</option>
              </select>
            </div>

            {/* Target Sensitivity */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>TARGET SENSITIVITY</span>
                <span className="font-bold text-cyan-300">{sensitivity}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {['Low', 'Medium', 'High'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSensitivity(s)}
                    className={`py-1.5 rounded border text-center transition-all ${
                      sensitivity === s
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-ocean-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: DATA LOGGING */}
        <div className="bg-ocean-850/80 rounded-lg border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
              DATA LOGGING
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Logging Toggle */}
            <div className="flex items-center justify-between p-3 rounded bg-ocean-900/80 border border-slate-800">
              <div>
                <div className="font-bold text-slate-200">NVMe POD LOGGING</div>
                <div className="text-[10px] text-slate-400">Record all raw soundings</div>
              </div>
              <button
                onClick={() => setLoggingEnabled(!loggingEnabled)}
                className={`px-3 py-1 rounded text-[11px] font-bold border transition-all ${
                  loggingEnabled
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {loggingEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Storage Available */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>NVMe LOCAL STORAGE</span>
                <span className="font-bold text-emerald-400">72% FREE</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[28%] h-full bg-cyan-400 rounded-full" />
              </div>
              <span className="text-[10px] text-slate-500">1.84 GB / 64 GB used</span>
            </div>

            {/* Telemetry Interval */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>TELEMETRY SYNC INTERVAL</span>
                <span className="font-bold text-cyan-300">{telemetryInterval} sec</span>
              </div>
              <select
                value={telemetryInterval}
                onChange={(e) => setTelemetryInterval(Number(e.target.value))}
                className="w-full bg-ocean-900 border border-slate-700 rounded p-2 text-slate-200 text-xs font-mono"
              >
                <option value={1}>1 second (High Bandwidth)</option>
                <option value={2}>2 seconds (Nominal Umbilical)</option>
                <option value={5}>5 seconds (Low Power Acoustic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: COMMUNICATION */}
        <div className="bg-ocean-850/80 rounded-lg border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
              COMMUNICATION HARNESS
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded bg-ocean-900/80 border border-slate-800">
              <div>
                <div className="font-bold text-slate-200">ACOUSTIC USBL TETHER</div>
                <div className="text-[10px] text-slate-400">Two-way telemetry linked</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">
                LINKED
              </span>
            </div>

            <div className="bg-ocean-900/80 p-3 rounded border border-slate-800 space-y-2 text-[11px]">
              <div className="text-slate-400 uppercase font-semibold">TETHER PROTOCOL:</div>
              <div className="flex justify-between">
                <span>Modulation:</span>
                <span className="text-slate-200">FSK Acoustic Sub-Carrier</span>
              </div>
              <div className="flex justify-between">
                <span>Center Freq:</span>
                <span className="text-slate-200">24.5 kHz</span>
              </div>
              <div className="flex justify-between">
                <span>Parity Verification:</span>
                <span className="text-emerald-400">CRC-32 ACTIVE</span>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/30 rounded border border-cyan-500/20 text-[11px] text-cyan-300 font-sans">
              "Prototype interface — simulated configuration controls for demonstration."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
