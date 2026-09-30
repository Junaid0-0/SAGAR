import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { SensorCard } from '../components/SensorCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  Cpu,
  Zap,
  Gauge,
  RotateCw,
  Thermometer,
  HardDrive,
  Wifi,
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SensorDiagnostics: React.FC = () => {
  const { telemetry } = useSimulation();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
              SENSOR DIAGNOSTICS
            </h2>
            <StatusBadge status="HARDWARE INTEGRITY PASS" variant="green" />
          </div>
          <p className="text-xs font-mono text-cyan-400/90 tracking-wide mt-0.5">
            SUBSEA INSTRUMENTATION INTEGRITY & CALIBRATION HARNESS
          </p>
        </div>

        {/* Global Health Indicator: 97% */}
        <div className="flex items-center gap-4 bg-ocean-850/80 px-4 py-2 rounded-lg border border-slate-800 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              OVERALL SYSTEM HEALTH
            </div>
            <div className="text-xl font-mono font-bold text-emerald-400">
              97%
            </div>
          </div>
          <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[97%] h-full bg-emerald-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Diagnostics Cards Grid (As specifically required) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Metal Detection Module */}
        <SensorCard
          name="METAL DETECTION MODULE"
          status="ONLINE"
          icon={<Zap className="w-4 h-4" />}
          healthScore={98}
          specs={[
            { label: 'Signal Integrity', value: `${telemetry.signalQuality}%`, highlight: true },
            { label: 'Calibration', value: 'VALID (0.31 mV/V)' },
            { label: 'Inductive Coil Loop', value: 'BALANCED' },
            { label: 'Excitation Freq', value: '1.2 kHz / 5.4 kHz' },
          ]}
        />

        {/* Pressure Sensor */}
        <SensorCard
          name="PRESSURE SENSOR"
          status="ONLINE"
          icon={<Gauge className="w-4 h-4" />}
          healthScore={99}
          specs={[
            { label: 'Current Reading', value: `${telemetry.pressure.toFixed(1)} MPa`, highlight: true },
            { label: 'Hydrostatic Calibration', value: 'VALID' },
            { label: 'Rated Limit', value: '60.0 MPa (6000m)' },
            { label: 'Zero Offset', value: '+0.01 MPa' },
          ]}
        />

        {/* IMU */}
        <SensorCard
          name="3-AXIS IMU"
          status="ONLINE"
          icon={<RotateCw className="w-4 h-4" />}
          healthScore={96}
          specs={[
            { label: 'Calibration', value: 'VALID' },
            { label: 'Drift Rate', value: '0.03° / hr', highlight: true },
            { label: 'Heading Lock', value: `${telemetry.yaw.toFixed(1)}°` },
            { label: 'Attitude Filter', value: 'Extended Kalman' },
          ]}
        />

        {/* Temperature Sensor */}
        <SensorCard
          name="TEMPERATURE SENSOR"
          status="ONLINE"
          icon={<Thermometer className="w-4 h-4" />}
          healthScore={99}
          specs={[
            { label: 'Current Reading', value: `${telemetry.temperature.toFixed(1)} °C`, highlight: true },
            { label: 'Sensor Type', value: 'Platinum RTD Pt100' },
            { label: 'Calibration', value: 'VALID (NIST Trace)' },
            { label: 'Response Time', value: '80 ms' },
          ]}
        />

        {/* Data Logger */}
        <SensorCard
          name="DATA LOGGER"
          status="ONLINE"
          icon={<HardDrive className="w-4 h-4" />}
          healthScore={95}
          specs={[
            { label: 'NVMe Storage', value: '72% Available', highlight: true },
            { label: 'Write Rate', value: '1.2 MB / s' },
            { label: 'Sector Integrity', value: '100% CLEAN' },
            { label: 'Redundant Mirror', value: 'ENABLED' },
          ]}
        />

        {/* Communication */}
        <SensorCard
          name="ACOUSTIC USBL / UMBILICAL"
          status="LINKED"
          icon={<Wifi className="w-4 h-4" />}
          healthScore={94}
          specs={[
            { label: 'Packet Loss', value: `${telemetry.packetLoss}%`, highlight: true },
            { label: 'Downlink Latency', value: `${telemetry.latency} ms` },
            { label: 'Baud Rate', value: '115,200 bps' },
            { label: 'Carrier Strength', value: '-62 dBm' },
          ]}
        />

        {/* Battery */}
        <SensorCard
          name="POWER & BATTERY PACK"
          status="HEALTHY"
          icon={<BatteryCharging className="w-4 h-4" />}
          healthScore={96}
          specs={[
            { label: 'State of Charge', value: `${telemetry.battery}%`, highlight: true },
            { label: 'Bus Voltage', value: `${telemetry.voltage.toFixed(1)} VDC` },
            { label: 'Current Draw', value: '3.42 A' },
            { label: 'Cell Temp', value: '18.4 °C' },
          ]}
        />

        {/* Deployment Pod Housing */}
        <SensorCard
          name="TITANIUM POD HOUSING"
          status="ONLINE"
          icon={<Cpu className="w-4 h-4" />}
          healthScore={99}
          specs={[
            { label: 'Hull Stress Gauges', value: 'NOMINAL', highlight: true },
            { label: 'Internal Humidity', value: '12% RH' },
            { label: 'Internal Pressure', value: '1.01 atm' },
            { label: 'Leak Detector Loop', value: 'DRY (SAFE)' },
          ]}
        />
      </div>
    </div>
  );
};
