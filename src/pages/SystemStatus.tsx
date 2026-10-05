import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  Clock,
  HardDrive,
  Radio,
  Wifi,
  Server
} from 'lucide-react';

export const SystemStatus: React.FC = () => {
  const { telemetry } = useSimulation();

  const engineeringSubsystems = [
    { name: 'DEPLOYMENT SYSTEM', status: 'READY', desc: 'Umbilical winch tension nominal, slip ring stable' },
    { name: 'SENSOR POD', status: 'ONLINE', desc: 'Sensor pod housing sealed, internal environment dry' },
    { name: 'METAL SENSOR', status: 'ONLINE', desc: 'Electromagnetic metal detection sensor active' },
    { name: 'PRESSURE TRANSMITTER', status: 'ONLINE', desc: 'Hydrostatic pressure sensor transmitting depth at 10 Hz' },
    { name: '3-AXIS IMU', status: 'ONLINE', desc: 'Attitude and heading reference system active' },
    { name: 'DATA LOGGER', status: 'ONLINE', desc: 'High-speed local NVMe writing duplicate soundings' },
    { name: 'TETHER POWER SUB-SYSTEM', status: '120 VDC', desc: 'Continuous surface power feed via armored umbilical cable' },
    { name: 'COMMUNICATION LINK', status: 'LINKED', desc: 'High-speed subsea telemetry tether operating' },
    { name: 'MISSION CONTROL CONSOLE', status: 'ACTIVE', desc: 'RV Samudra hydrographic workstation synchronizing' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BDCED3]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-sans font-semibold tracking-wide text-[#1F4B60] uppercase">
              SYSTEM STATUS
            </h2>
            <StatusBadge status="ALL SUBSYSTEMS NOMINAL" variant="green" />
          </div>
          <p className="text-xs text-[#60868C] font-sans mt-0.5">
            Engineering & Deployment Telemetry // SAGAR Platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#60868C]">
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
          icon={<Clock className="w-4 h-4 text-[#2A7C7A]" />}
          highlight={true}
        />
        <MetricCard
          label="DATA LOGGED"
          value="1.84"
          unit="GB"
          subtext="NVMe Local SSD Mirror"
          icon={<HardDrive className="w-4 h-4 text-[#2A7C7A]" />}
        />
        <MetricCard
          label="PACKETS RECEIVED"
          value="128,421"
          subtext="CRC Validation 100%"
          icon={<Radio className="w-4 h-4 text-[#2A7C7A]" />}
        />
        <MetricCard
          label="PACKET LOSS"
          value={telemetry.packetLoss}
          unit="%"
          subtext="Downlink Error Rate: Minimal"
          status="NOMINAL"
          statusVariant="green"
          icon={<Wifi className="w-4 h-4 text-[#3F8068]" />}
        />
      </div>

      {/* Engineering Subsystem Matrix */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2] mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#2A7C7A]" />
            <h3 className="font-sans text-sm font-semibold tracking-wide text-[#1F4B60] uppercase">
              SUBSYSTEM INTEGRITY MATRIX
            </h3>
          </div>
          <span className="text-xs font-mono text-[#3F8068] font-semibold">
            9/9 MODULES OPERATIONAL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {engineeringSubsystems.map((sub, idx) => (
            <div
              key={idx}
              className="bg-[#F8F6F2] p-3.5 rounded-[6px] border border-[#BDCED3] flex items-start justify-between gap-3 hover:border-[#2A7C7A] transition-colors"
            >
              <div className="min-w-0">
                <div className="font-sans text-xs font-semibold text-[#1F4B60] tracking-wide uppercase">
                  {sub.name}
                </div>
                <div className="font-sans text-[11px] text-[#60868C] mt-1 leading-snug">
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
