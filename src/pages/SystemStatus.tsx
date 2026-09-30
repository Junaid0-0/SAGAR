import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  ShieldCheck,
  Clock,
  HardDrive,
  Radio,
  Wifi,
  Cpu,
  Layers,
  CheckCircle2,
  Server
} from 'lucide-react';

export const SystemStatus: React.FC = () => {
  const { telemetry } = useSimulation();

  const engineeringSubsystems = [
    { name: 'DEPLOYMENT SYSTEM', status: 'READY', desc: 'Umbilical winch tension nominal, slip ring stable' },
    { name: 'SENSOR POD', status: 'ONLINE', desc: 'Titanium pressure vessel sealed, internal environment dry' },
    { name: 'METAL SENSOR', status: 'ONLINE', desc: 'Dual-frequency induction coils receiving resonant telemetry' },
    { name: 'PRESSURE TRANSMITTER', status: 'ONLINE', desc: 'Piezo-resistive diaphragm transmitting depth at 10 Hz' },
    { name: '3-AXIS IMU', status: 'ONLINE', desc: 'Attitude and heading reference system active' },
    { name: 'DATA LOGGER', status: 'ONLINE', desc: 'High-speed local NVMe writing duplicate soundings' },
    { name: 'POWER SUB-SYSTEM', status: `${telemetry.battery}%`, desc: `${telemetry.voltage.toFixed(1)}V DC bus, lithium iron phosphate pack` },
    { name: 'COMMUNICATION LINK', status: 'LINKED', desc: 'Acoustic positioning & telemetry tether operating' },
    { name: 'MISSION CONTROL CONSOLE', status: 'ACTIVE', desc: 'RV Samudra hydrographic workstation synchronizing' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
              SYSTEM STATUS
            </h2>
            <StatusBadge status="ALL SUBSYSTEMS NOMINAL" variant="green" />
          </div>
          <p className="text-xs font-mono text-cyan-400/90 tracking-wide mt-0.5">
            ENGINEERING & DEPLOYMENT TELEMETRY // PRAGYA-SEA PLATFORM
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            FIRMWARE BUILD: v2.4.1-OCEAN
          </span>
        </div>
      </div>

      {/* Top Engineering Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="MISSION UPTIME"
          value="04:18:32"
          subtext="Continuous seabed deployment"
          icon={<Clock className="w-4 h-4 text-cyan-400" />}
          highlight={true}
        />
        <MetricCard
          label="DATA LOGGED"
          value="1.84"
          unit="GB"
          subtext="NVMe Local SSD Mirror"
          icon={<HardDrive className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          label="PACKETS RECEIVED"
          value="128,421"
          subtext="CRC Validation 100%"
          icon={<Radio className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          label="PACKET LOSS"
          value={telemetry.packetLoss}
          unit="%"
          subtext="Downlink Error Rate: Minimal"
          status="NOMINAL"
          statusVariant="green"
          icon={<Wifi className="w-4 h-4 text-emerald-400" />}
        />
      </div>

      {/* Engineering Subsystem Matrix (As specifically required) */}
      <div className="bg-ocean-850/80 rounded-lg border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
              SUBSYSTEM INTEGRITY MATRIX
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            9/9 MODULES OPERATIONAL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {engineeringSubsystems.map((sub, idx) => (
            <div
              key={idx}
              className="bg-ocean-900/80 p-3.5 rounded border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-mono text-xs font-bold text-slate-100 tracking-wider">
                  {sub.name}
                </div>
                <div className="font-sans text-[11px] text-slate-400 mt-1 leading-snug">
                  {sub.desc}
                </div>
              </div>

              <StatusBadge status={sub.status} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
