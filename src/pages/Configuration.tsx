import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Sliders,
  HardDrive,
  Wifi,
  Save,
  RotateCcw
} from 'lucide-react';

export const Configuration: React.FC = () => {
  const { addNotification } = useSimulation();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BDCED3]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-sans font-semibold tracking-wide text-[#1F4B60] uppercase">
              SYSTEM CONFIGURATION
            </h2>
            <StatusBadge status="SETTINGS LOCKED" variant="cyan" />
          </div>
          <p className="text-xs text-[#60868C] font-sans mt-0.5">
            Mission Parameters, Acoustic Protocols & Sensor Calibration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F8F6F2] text-[#1F4B60] border border-[#BDCED3] text-xs font-sans font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#60868C]" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#2A7C7A] hover:bg-[#1F4B60] text-[#FFFFFF] text-xs font-sans font-medium transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply Parameters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: MISSION PARAMETERS */}
        <div className="bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E2]">
            <Sliders className="w-4 h-4 text-[#2A7C7A]" />
            <h3 className="font-sans text-sm font-semibold tracking-wide text-[#1F4B60] uppercase">
              MISSION PARAMETERS
            </h3>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* Sampling Rate */}
            <div>
              <div className="flex justify-between text-[#1F4B60] mb-1">
                <span className="font-medium text-[#60868C]">SAMPLING RATE</span>
                <span className="font-mono font-semibold text-[#2A7C7A]">{samplingRate} Hz</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={samplingRate}
                onChange={(e) => setSamplingRate(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E7E5E2] rounded-lg appearance-none cursor-pointer accent-[#2A7C7A]"
              />
              <span className="text-[10px] text-[#60868C]">Sensor measurement cycle frequency</span>
            </div>

            {/* Detection Threshold */}
            <div>
              <div className="flex justify-between text-[#1F4B60] mb-1">
                <span className="font-medium text-[#60868C]">DETECTION THRESHOLD</span>
                <span className="font-mono font-semibold text-[#B78332]">{threshold.toFixed(2)} mV/V</span>
              </div>
              <input
                type="range"
                min="0.40"
                max="1.20"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E7E5E2] rounded-lg appearance-none cursor-pointer accent-[#B78332]"
              />
              <span className="text-[10px] text-[#60868C]">Trigger condition for metal detection logging</span>
            </div>

            {/* Survey Line Spacing */}
            <div>
              <div className="flex justify-between text-[#1F4B60] mb-1">
                <span className="font-medium text-[#60868C]">SURVEY LINE SPACING</span>
                <span className="font-mono font-semibold text-[#1F4B60]">{lineSpacing} m</span>
              </div>
              <select
                value={lineSpacing}
                onChange={(e) => setLineSpacing(Number(e.target.value))}
                className="w-full bg-[#F8F6F2] border border-[#BDCED3] rounded-[6px] p-2 text-[#1F4B60] text-xs font-mono"
              >
                <option value={25}>25 m (High-Density Ultra-Res)</option>
                <option value={50}>50 m (Standard Lawnmower)</option>
                <option value={100}>100 m (Reconnaissance Grid)</option>
              </select>
            </div>

            {/* Survey Speed */}
            <div>
              <div className="flex justify-between text-[#1F4B60] mb-1">
                <span className="font-medium text-[#60868C]">SURVEY SPEED</span>
                <span className="font-mono font-semibold text-[#1F4B60]">{surveySpeed.toFixed(1)} m/s (1.6 kt)</span>
              </div>
              <select
                value={surveySpeed}
                onChange={(e) => setSurveySpeed(Number(e.target.value))}
                className="w-full bg-[#F8F6F2] border border-[#BDCED3] rounded-[6px] p-2 text-[#1F4B60] text-xs font-mono"
              >
                <option value={0.5}>0.5 m/s (Slow Precision Tow)</option>
                <option value={0.8}>0.8 m/s (Nominal Cruise)</option>
                <option value={1.2}>1.2 m/s (Fast Transit)</option>
              </select>
            </div>

            {/* Target Sensitivity */}
            <div>
              <div className="flex justify-between text-[#1F4B60] mb-1.5">
                <span className="font-medium text-[#60868C]">TARGET SENSITIVITY</span>
                <span className="font-mono font-semibold text-[#2A7C7A]">{sensitivity}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-sans text-xs">
                {['Low', 'Medium', 'High'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSensitivity(s)}
                    className={`py-1.5 rounded-[4px] border text-center transition-colors ${
                      sensitivity === s
                        ? 'bg-[#E2EFF0] border-[#2A7C7A] text-[#2A7C7A] font-semibold'
                        : 'bg-[#F8F6F2] border-[#BDCED3] text-[#60868C] hover:text-[#1F4B60]'
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
        <div className="bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E2]">
            <HardDrive className="w-4 h-4 text-[#2A7C7A]" />
            <h3 className="font-sans text-sm font-semibold tracking-wide text-[#1F4B60] uppercase">
              DATA LOGGING
            </h3>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* Logging Toggle */}
            <div className="flex items-center justify-between p-3 rounded-[6px] bg-[#F8F6F2] border border-[#BDCED3]">
              <div>
                <div className="font-semibold text-[#1F4B60]">NVMe POD LOGGING</div>
                <div className="text-[10px] text-[#60868C]">Record all raw soundings</div>
              </div>
              <button
                onClick={() => setLoggingEnabled(!loggingEnabled)}
                className={`px-3 py-1 rounded-[4px] text-[11px] font-mono font-semibold border transition-colors ${
                  loggingEnabled
                    ? 'bg-[#E5F2EC] border-[#BDCED3] text-[#3F8068]'
                    : 'bg-[#F8F6F2] border-[#BDCED3] text-[#60868C]'
                }`}
              >
                {loggingEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Storage Available */}
            <div>
              <div className="flex justify-between text-[#1F4B60] mb-1">
                <span className="font-medium text-[#60868C]">NVMe LOCAL STORAGE</span>
                <span className="font-mono font-semibold text-[#3F8068]">72% FREE</span>
              </div>
              <div className="w-full h-2 bg-[#E7E5E2] rounded-full overflow-hidden">
                <div className="w-[28%] h-full bg-[#2A7C7A] rounded-full" />
              </div>
              <span className="text-[10px] text-[#60868C] font-mono">1.84 GB / 64 GB used</span>
            </div>

            {/* Telemetry Interval */}
            <div>
              <div className="flex justify-between text-[#1F4B60] mb-1">
                <span className="font-medium text-[#60868C]">TELEMETRY SYNC INTERVAL</span>
                <span className="font-mono font-semibold text-[#2A7C7A]">{telemetryInterval} sec</span>
              </div>
              <select
                value={telemetryInterval}
                onChange={(e) => setTelemetryInterval(Number(e.target.value))}
                className="w-full bg-[#F8F6F2] border border-[#BDCED3] rounded-[6px] p-2 text-[#1F4B60] text-xs font-mono"
              >
                <option value={1}>1 second (High Bandwidth)</option>
                <option value={2}>2 seconds (Nominal Umbilical)</option>
                <option value={5}>5 seconds (Extended Sync)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: COMMUNICATION */}
        <div className="bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E2]">
            <Wifi className="w-4 h-4 text-[#2A7C7A]" />
            <h3 className="font-sans text-sm font-semibold tracking-wide text-[#1F4B60] uppercase">
              COMMUNICATION & TELEMETRY LINK
            </h3>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3 rounded-[6px] bg-[#F8F6F2] border border-[#BDCED3]">
              <div>
                <div className="font-semibold text-[#1F4B60]">ACOUSTIC TELEMETRY LINK</div>
                <div className="text-[10px] text-[#60868C]">Two-way telemetry synchronized</div>
              </div>
              <span className="px-2 py-0.5 rounded-[4px] bg-[#E5F2EC] border border-[#BDCED3] text-[#3F8068] font-mono font-semibold text-[10px]">
                LINKED
              </span>
            </div>

            <div className="bg-[#F8F6F2] p-3 rounded-[6px] border border-[#BDCED3] space-y-2 text-[11px] font-mono">
              <div className="text-[#1F4B60] uppercase font-semibold font-sans">TELEMETRY LINK STATUS:</div>
              <div className="flex justify-between">
                <span className="text-[#60868C]">Uplink / Downlink:</span>
                <span className="text-[#1F4B60]">Bi-Directional Acoustic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#60868C]">Sampling Sync:</span>
                <span className="text-[#1F4B60]">10 Hz Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#60868C]">Packet Verification:</span>
                <span className="text-[#3F8068] font-semibold">100% NOMINAL</span>
              </div>
            </div>

            <div className="p-3 bg-[#E2EFF0] rounded-[6px] border border-[#BDCED3] text-[11px] text-[#2A7C7A] font-sans font-medium">
              Prototype interface — simulated configuration controls for demonstration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
