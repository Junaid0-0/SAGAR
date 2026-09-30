import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TelemetryChart } from '../components/TelemetryChart';
import { StatusBadge } from '../components/StatusBadge';
import {
  Database,
  Waves,
  Gauge,
  Thermometer,
  RotateCw,
  Zap,
  BatteryCharging,
  Wifi,
  FileDown,
  Layers,
  Clock,
  HardDrive
} from 'lucide-react';

export const TelemetryData: React.FC = () => {
  const {
    telemetry,
    signalHistory,
    exportData
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'live' | 'historical' | 'raw'>('live');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
              TELEMETRY & DATA
            </h2>
            <StatusBadge status="TELEMETRY LINKED" variant="cyan" />
          </div>
          <p className="text-xs font-mono text-cyan-400/90 tracking-wide mt-0.5">
            LIVE MULTI-PARAMETRIC INSTRUMENTATION & HIGH-FREQUENCY SOUNDING LOGS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('raw-telemetry-csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-mono">
        {[
          { id: 'live', label: 'LIVE DATA', icon: <Wifi className="w-3.5 h-3.5 text-cyan-400" /> },
          { id: 'historical', label: 'HISTORICAL TIME-SERIES', icon: <Clock className="w-3.5 h-3.5 text-amber-400" /> },
          { id: 'raw', label: 'RAW READINGS TABLE', icon: <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold transition-all ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-300 bg-ocean-850/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: LIVE DATA */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Key Parameters Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hydrographic & Environment */}
            <div className="bg-ocean-850/80 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-cyan-400 font-bold">
                <span className="flex items-center gap-1.5"><Waves className="w-4 h-4" /> HYDROGRAPHICS</span>
                <span className="text-[10px] text-slate-400">ACOUSTIC</span>
              </div>
              <div className="mt-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">DEPTH</span>
                  <span className="font-bold text-slate-100">{telemetry.depth.toFixed(1)} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">HYDROSTATIC PRESSURE</span>
                  <span className="font-bold text-slate-100">{telemetry.pressure.toFixed(1)} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AMBIENT WATER TEMP</span>
                  <span className="font-bold text-slate-100">{telemetry.temperature.toFixed(1)} °C</span>
                </div>
              </div>
            </div>

            {/* IMU Attitude */}
            <div className="bg-ocean-850/80 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-cyan-400 font-bold">
                <span className="flex items-center gap-1.5"><RotateCw className="w-4 h-4" /> 3-AXIS IMU</span>
                <span className="text-[10px] text-emerald-400 font-bold">LOCKED</span>
              </div>
              <div className="mt-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">ROLL</span>
                  <span className="font-bold text-slate-100">{telemetry.roll >= 0 ? `+${telemetry.roll.toFixed(1)}°` : `${telemetry.roll.toFixed(1)}°`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PITCH</span>
                  <span className="font-bold text-slate-100">{telemetry.pitch >= 0 ? `+${telemetry.pitch.toFixed(1)}°` : `${telemetry.pitch.toFixed(1)}°`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">YAW / HEADING</span>
                  <span className="font-bold text-cyan-300">{telemetry.yaw.toFixed(1)}°</span>
                </div>
              </div>
            </div>

            {/* Metal Sensor */}
            <div className="bg-ocean-850/80 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-amber-400 font-bold">
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> METAL SENSOR</span>
                <span className="text-[10px] text-amber-300 font-bold">ACTIVE</span>
              </div>
              <div className="mt-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">RESPONSE</span>
                  <span className="font-bold text-amber-300">{telemetry.metalResponse.toFixed(2)} mV/V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">BASELINE</span>
                  <span className="font-bold text-slate-300">{telemetry.baselineResponse.toFixed(2)} mV/V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SIGNAL INTEGRITY</span>
                  <span className="font-bold text-emerald-400">{telemetry.signalQuality}%</span>
                </div>
              </div>
            </div>

            {/* Power & Comm */}
            <div className="bg-ocean-850/80 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5"><BatteryCharging className="w-4 h-4" /> POWER & LINK</span>
                <span className="text-[10px] text-emerald-400 font-bold">CONNECTED</span>
              </div>
              <div className="mt-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">BUS VOLTAGE</span>
                  <span className="font-bold text-slate-100">{telemetry.voltage.toFixed(1)} V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">BATTERY RESERVE</span>
                  <span className="font-bold text-emerald-400">{telemetry.battery}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PACKET LOSS / LAT</span>
                  <span className="font-bold text-slate-300">{telemetry.packetLoss}% / {telemetry.latency}ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Multiple Small Time-Series Charts Grid (As explicitly requested) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TelemetryChart
              data={signalHistory}
              dataKey="response"
              title="METAL INDUCTION RESPONSE"
              unit="mV/V"
              height={150}
              color="#f59e0b"
            />
            <TelemetryChart
              data={signalHistory}
              dataKey="depth"
              title="SENSOR DEPTH SOUNDING"
              unit="m"
              height={150}
              showThreshold={false}
              color="#38bdf8"
            />
            <TelemetryChart
              data={signalHistory}
              dataKey="pressure"
              title="HYDROSTATIC PRESSURE"
              unit="MPa"
              height={150}
              showThreshold={false}
              color="#06b6d4"
            />
            <TelemetryChart
              data={signalHistory}
              dataKey="temperature"
              title="AMBIENT SEABED TEMPERATURE"
              unit="°C"
              height={150}
              showThreshold={false}
              color="#10b981"
            />
            <TelemetryChart
              data={signalHistory}
              dataKey="battery"
              title="BATTERY CELL DISCHARGE"
              unit="%"
              height={150}
              showThreshold={false}
              color="#22c55e"
            />
            <div className="bg-ocean-850/80 rounded-md border border-slate-800 p-4 flex flex-col justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">TELEMETRY DIGEST</span>
              <div className="space-y-1 text-slate-300 text-[11px]">
                <div>• Frame Buffer: 120 packets / sec</div>
                <div>• CRC Checksum: PASS (0 errors)</div>
                <div>• Acoustic Transceiver: USBL Beacon 01</div>
                <div>• Data Storage: Local NVMe Pod Flash</div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-400">
                LINK LATENCY STABLE (126 ms)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORICAL TIME-SERIES */}
      {activeTab === 'historical' && (
        <div className="bg-ocean-850/80 p-5 rounded-lg border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-slate-100 uppercase">
              EXTENDED 60-MINUTE SOUNDINGS TIMELINE
            </h3>
            <span className="text-xs font-mono text-cyan-400">INTERVAL: 2 SEC</span>
          </div>
          <div className="h-72 w-full">
            <TelemetryChart
              data={signalHistory}
              dataKey="response"
              title="CONTINUOUS ELECTROMAGNETIC TIME-SERIES"
              unit="mV/V"
              height={260}
              showThreshold={true}
              color="#00F2FE"
            />
          </div>
        </div>
      )}

      {/* TAB 3: RAW READINGS TABLE */}
      {activeTab === 'raw' && (
        <div className="bg-ocean-850/80 p-5 rounded-lg border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-mono font-bold text-slate-100 uppercase">
              HIGH-PRECISION RAW SOUNDINGS STREAM
            </h3>
            <span className="text-xs font-mono text-slate-400">BUFFER: LAST 30 SAMPLES</span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left font-mono text-xs">
              <thead className="sticky top-0 bg-ocean-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2 px-3">TIMESTAMP</th>
                  <th className="py-2 px-3">RESPONSE (mV/V)</th>
                  <th className="py-2 px-3">DEPTH (m)</th>
                  <th className="py-2 px-3">PRESSURE (MPa)</th>
                  <th className="py-2 px-3">TEMP (°C)</th>
                  <th className="py-2 px-3">BATTERY (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {signalHistory.slice().reverse().map((pt, idx) => (
                  <tr key={idx} className="hover:bg-ocean-800/40">
                    <td className="py-2 px-3 text-cyan-300">{pt.time}</td>
                    <td className="py-2 px-3 font-bold text-amber-300">{pt.response.toFixed(3)}</td>
                    <td className="py-2 px-3">{pt.depth.toFixed(1)}</td>
                    <td className="py-2 px-3">{pt.pressure.toFixed(2)}</td>
                    <td className="py-2 px-3">{pt.temperature.toFixed(2)}</td>
                    <td className="py-2 px-3 text-emerald-400">{Math.round(pt.battery)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
