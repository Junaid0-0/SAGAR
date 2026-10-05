import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TelemetryChart } from '../components/TelemetryChart';
import { StatusBadge } from '../components/StatusBadge';
import {
  Waves,
  RotateCw,
  Zap,
  Wifi,
  FileDown,
  Clock,
  HardDrive,
  Compass,
  Cable,
  ArrowDown
} from 'lucide-react';

export const TelemetryData: React.FC = () => {
  const {
    telemetry,
    signalHistory,
    exportData
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'live' | 'historical' | 'raw'>('live');

  // Simulated RM3100 magnetic fields derived from telemetry
  const magX = (18.25 + telemetry.roll * 0.12).toFixed(1);
  const magY = (-12.40 + telemetry.pitch * 0.15).toFixed(1);
  const zShift = telemetry.metalResponse >= 0.65 ? 3.4 : telemetry.metalResponse >= 0.5 ? 1.6 : 0.2;
  const magZ = (-35.80 + zShift).toFixed(1);
  const totalB = Math.sqrt(Number(magX) ** 2 + Number(magY) ** 2 + Number(magZ) ** 2).toFixed(1);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BDCED3]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-sans font-semibold tracking-wide text-[#1F4B60] uppercase">
              TELEMETRY & DATA
            </h2>
            <StatusBadge status="TETHERED TELEMETRY SYNC" variant="cyan" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#DCEEEE] border border-[#B8CCD1] text-[#2A7C7A] font-semibold">
              SIMULATION MODE
            </span>
          </div>
          <p className="text-xs text-[#60868C] font-sans mt-0.5">
            Tethered Deep-Seafloor Sensor Pod &bull; Hydrographic, IMU, Induction & Magnetic Streams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('raw-telemetry-csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F2F6F6] text-[#1F4B60] border border-[#BDCED3] text-xs font-sans font-medium transition-colors shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5 text-[#60868C]" />
            <span>Export CSV Log</span>
          </button>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex items-center gap-2 border-b border-[#BDCED3] text-xs font-sans">
        {[
          { id: 'live', label: 'LIVE DATA', icon: <Wifi className="w-3.5 h-3.5 text-[#2A7C7A]" /> },
          { id: 'historical', label: 'HISTORICAL DATA', icon: <Clock className="w-3.5 h-3.5 text-[#B78332]" /> },
          { id: 'raw', label: 'RAW READINGS TABLE', icon: <HardDrive className="w-3.5 h-3.5 text-[#3F8068]" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-[#2A7C7A] text-[#2A7C7A] bg-[#E2EFF0] rounded-t-[4px] font-semibold'
                : 'border-transparent text-[#60868C] hover:text-[#1F4B60]'
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
          {/* Key Parameters Cards (4 Focused Sensor Cards across full width) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Hydrographics & Environment */}
            <div className="bg-[#FFFFFF] p-4 rounded-[8px] border border-[#BDCED3] shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2] text-xs font-sans text-[#2A7C7A] font-semibold">
                <span className="flex items-center gap-1.5"><Waves className="w-4 h-4" /> HYDROGRAPHICS</span>
                <span className="text-[10px] text-[#60868C] font-mono">SEABED</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">DEPTH:</span>
                  <span className="font-mono font-bold text-[#1F4B60]">{telemetry.depth.toFixed(1)} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">HYDRO PRESSURE:</span>
                  <span className="font-mono font-semibold text-[#1F4B60]">{telemetry.pressure.toFixed(1)} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">WATER TEMP:</span>
                  <span className="font-mono font-semibold text-[#1F4B60]">{telemetry.temperature.toFixed(1)} °C</span>
                </div>
              </div>
            </div>

            {/* 2. IMU Attitude */}
            <div className="bg-[#FFFFFF] p-4 rounded-[8px] border border-[#BDCED3] shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2] text-xs font-sans text-[#2A7C7A] font-semibold">
                <span className="flex items-center gap-1.5"><RotateCw className="w-4 h-4" /> 3-AXIS IMU</span>
                <span className="text-[10px] text-[#3F8068] font-mono font-semibold">STABLE</span>
              </div>
              <div className="mt-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">ROLL AXIS:</span>
                  <span className="font-semibold text-[#1F4B60]">
                    {telemetry.roll >= 0 ? `+${telemetry.roll.toFixed(1)}°` : `${telemetry.roll.toFixed(1)}°`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">PITCH AXIS:</span>
                  <span className="font-semibold text-[#1F4B60]">
                    {telemetry.pitch >= 0 ? `+${telemetry.pitch.toFixed(1)}°` : `${telemetry.pitch.toFixed(1)}°`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">HEADING (YAW):</span>
                  <span className="font-semibold text-[#2A7C7A]">{telemetry.yaw.toFixed(1)}°</span>
                </div>
              </div>
            </div>

            {/* 3. Metal Sensor Response */}
            <div className="bg-[#FFFFFF] p-4 rounded-[8px] border border-[#BDCED3] shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2] text-xs font-sans text-[#B78332] font-semibold">
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> METAL SENSOR</span>
                <span className="text-[10px] font-mono text-[#60868C]">INDUCTION</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">RESPONSE:</span>
                  <span className="font-mono font-bold text-[#B78332]">{telemetry.metalResponse.toFixed(2)} mV/V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">BASELINE:</span>
                  <span className="font-mono font-semibold text-[#1F4B60]">{telemetry.baselineResponse.toFixed(2)} mV/V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">THRESHOLD:</span>
                  <span className="font-mono font-semibold text-[#B85C5C]">{telemetry.threshold.toFixed(2)} mV/V</span>
                </div>
              </div>
            </div>

            {/* 4. RM3100 & Tether Status */}
            <div className="bg-[#FFFFFF] p-4 rounded-[8px] border border-[#BDCED3] shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2] text-xs font-sans text-[#2A7C7A] font-semibold">
                <span className="flex items-center gap-1.5"><Compass className="w-4 h-4" /> RM3100 & TETHER</span>
                <span className="text-[10px] text-[#3F8068] font-mono font-semibold">LINKED</span>
              </div>
              <div className="mt-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">TOTAL MAG FIELD:</span>
                  <span className="font-semibold text-[#1F4B60]">{totalB} &micro;T</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">UMBILICAL TETHER:</span>
                  <span className="font-semibold text-[#2A7C7A]">4,310 m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#60868C] font-sans">PACKET LOSS / LAT:</span>
                  <span className="text-[#60868C]">{telemetry.packetLoss}% / {telemetry.latency}ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Useful Focused Graphs (2 Primary Graphs: Sensor Response + Inverted Descent Depth Profile) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* GRAPH 1: SENSOR RESPONSE OVER TIME (7 cols) */}
            <div className="lg:col-span-7 bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E5E2] mb-2.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#B78332]" />
                    <h3 className="font-sans text-xs font-semibold tracking-wide text-[#1F4B60] uppercase">
                      SENSOR RESPONSE OVER TIME
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#60868C]">
                    CURRENT: <strong className="text-[#1F4B60]">{telemetry.metalResponse.toFixed(2)} mV/V</strong>
                  </span>
                </div>

                <div className="h-56 w-full">
                  <TelemetryChart
                    data={signalHistory}
                    dataKey="response"
                    title="LIVE ELECTROMAGNETIC SENSOR AMPLITUDE"
                    unit="mV/V"
                    height={200}
                    showThreshold={true}
                    color={telemetry.metalResponse >= telemetry.threshold ? '#B85C5C' : '#2A7C7A'}
                  />
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-[#E7E5E2] flex items-center justify-between text-[11px] font-sans text-[#60868C]">
                <span>Continuous inductive measurement</span>
                <span className="font-mono text-[#2A7C7A]">Threshold: 0.65 mV/V</span>
              </div>
            </div>

            {/* GRAPH 2: PROPER DEPTH PROFILE (Surface to Seabed Descent Column) (5 cols) */}
            <div className="lg:col-span-5 bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E5E2] mb-2.5">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-[#2A7C7A]" />
                    <h3 className="font-sans text-xs font-semibold tracking-wide text-[#1F4B60] uppercase">
                      DEPTH PROFILE
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#2A7C7A] font-semibold">
                    -{telemetry.depth.toFixed(1)} m
                  </span>
                </div>

                <p className="text-[11px] text-[#60868C] font-sans mb-3">
                  Pod deployment depth during descent through water column to seabed
                </p>

                {/* Vertical Water Column & Descent Diagram */}
                <div className="bg-[#EBF3F5] rounded-[6px] border border-[#CBD9DA] p-3 relative h-48 flex items-center justify-between overflow-hidden">
                  {/* Left Water Column Depth Scale */}
                  <div className="flex flex-col justify-between h-full text-[10px] font-mono text-[#60868C] pr-3 border-r border-[#CBD9DA]">
                    <div className="flex items-center gap-1 text-[#2A7C7A] font-bold">
                      <span>SURFACE (0 m)</span>
                    </div>
                    <div>-1,000 m</div>
                    <div>-2,000 m</div>
                    <div>-3,000 m</div>
                    <div>-4,000 m</div>
                    <div className="flex items-center gap-1 text-[#1F4B60] font-bold">
                      <span>SEABED (-4,300 m)</span>
                    </div>
                  </div>

                  {/* Center Vertical Deployment Tether Visualization */}
                  <div className="flex-1 px-4 h-full relative flex flex-col items-center justify-between">
                    {/* Surface Vessel Icon */}
                    <div className="text-[10px] font-mono text-[#2A7C7A] font-semibold bg-[#FFFFFF] px-2 py-0.5 rounded-[4px] border border-[#CBD9DA] shadow-xs">
                      RV SAMUDRA
                    </div>

                    {/* Umbilical Tether Line extending downwards */}
                    <div className="w-[1.5px] h-full bg-[#2A7C7A]/60 absolute top-5 bottom-8" />

                    {/* Sensor Pod Marker at Current Depth */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 transition-all duration-300 flex items-center gap-2"
                      style={{
                        top: `${Math.min(82, Math.max(15, (telemetry.depth / 4300) * 80))}%`
                      }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-[#2A7C7A] border-2 border-[#FFFFFF] shadow-sm" />
                      <div className="bg-[#1F4B60] text-[#FFFFFF] text-[10px] font-mono font-bold px-2 py-0.5 rounded-[3px] shadow-sm whitespace-nowrap">
                        POD DEPTH: {telemetry.depth.toFixed(1)} m
                      </div>
                    </div>

                    {/* Seafloor Base Line */}
                    <div className="w-full text-center text-[10px] font-mono text-[#60868C] bg-[#D4E5E8] py-1 rounded-[3px] border border-[#CBD9DA]">
                      SEABED BOUNDARY (-4,286 m &bull; ALTITUDE: 12.4 m)
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-[#E7E5E2] flex items-center justify-between text-[11px] font-sans text-[#60868C]">
                <span>Hydrostatic Pressure: <strong>{telemetry.pressure.toFixed(1)} MPa</strong></span>
                <span className="font-mono text-[#3F8068]">Station Hold Locked</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORICAL DATA */}
      {activeTab === 'historical' && (
        <div className="bg-[#FFFFFF] p-5 rounded-[8px] border border-[#BDCED3] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2]">
            <div>
              <h3 className="text-sm font-sans font-semibold text-[#1F4B60] uppercase">
                CONTINUOUS SURVEY TRANSECT SENSOR RESPONSE
              </h3>
              <p className="text-xs text-[#60868C] font-sans mt-0.5">
                Time-series sensor observations recorded along survey transect
              </p>
            </div>
            <span className="text-xs font-mono text-[#60868C]">SAMPLING INTERVAL: 2 SEC</span>
          </div>

          <div className="h-72 w-full">
            <TelemetryChart
              data={signalHistory}
              dataKey="response"
              title="SENSOR RESPONSE HISTORICAL PROFILE"
              unit="mV/V"
              height={260}
              showThreshold={true}
              color="#2A7C7A"
            />
          </div>
        </div>
      )}

      {/* TAB 3: RAW READINGS TABLE (Communicates TIME, DEPTH, SENSOR RESPONSE, STATUS, TARGET) */}
      {activeTab === 'raw' && (
        <div className="bg-[#FFFFFF] p-5 rounded-[8px] border border-[#BDCED3] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2]">
            <div>
              <h3 className="text-sm font-sans font-semibold text-[#1F4B60] uppercase">
                LOGGED OBSERVATIONS TABLE
              </h3>
              <p className="text-xs text-[#60868C] font-sans mt-0.5">
                Timestamped sensor records demonstrating continuous platform logging
              </p>
            </div>
            <span className="text-xs font-mono text-[#60868C]">BUFFER: RECENT 30 SAMPLES</span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left font-mono text-xs">
              <thead className="sticky top-0 bg-[#F8F6F2] border-b border-[#BDCED3] text-[11px] font-sans font-semibold text-[#60868C] uppercase">
                <tr>
                  <th className="py-2.5 px-3">TIME</th>
                  <th className="py-2.5 px-3">DEPTH</th>
                  <th className="py-2.5 px-3">PRESSURE</th>
                  <th className="py-2.5 px-3">TEMP</th>
                  <th className="py-2.5 px-3">SENSOR RESPONSE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">TARGET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E2] text-[#1F4B60]">
                {signalHistory.slice().reverse().map((pt, idx) => {
                  const isMetal = pt.response >= 0.65;
                  const isElevated = pt.response >= 0.50;
                  const statusText = isMetal
                    ? 'METAL DETECTED'
                    : isElevated
                    ? 'ELEVATED'
                    : 'NORMAL';

                  const targetLabel = isMetal ? 'A-03' : isElevated ? 'A-02' : '—';

                  return (
                    <tr key={idx} className="hover:bg-[#F2F6F6] transition-colors">
                      <td className="py-2.5 px-3 text-[#2A7C7A] font-semibold">{pt.time}</td>
                      <td className="py-2.5 px-3">{pt.depth.toFixed(1)} m</td>
                      <td className="py-2.5 px-3">{pt.pressure.toFixed(1)} MPa</td>
                      <td className="py-2.5 px-3">{pt.temperature.toFixed(1)} °C</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1F4B60]">
                        <span className={isMetal ? 'text-[#B85C5C]' : isElevated ? 'text-[#B78332]' : 'text-[#1F4B60]'}>
                          {pt.response.toFixed(3)} mV/V
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block font-mono text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border uppercase ${
                            isMetal
                              ? 'bg-[#F9E8E8] text-[#B85C5C] border-[#BDCED3]'
                              : isElevated
                              ? 'bg-[#F8EFE3] text-[#B78332] border-[#BDCED3]'
                              : 'bg-[#E5F2EC] text-[#3F8068] border-[#BDCED3]'
                          }`}
                        >
                          {statusText}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {targetLabel !== '—' ? (
                          <span className="font-semibold text-[#B78332] bg-[#F8EFE3] px-2 py-0.5 rounded-[4px] border border-[#BDCED3]">
                            {targetLabel}
                          </span>
                        ) : (
                          <span className="text-[#60868C]">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
