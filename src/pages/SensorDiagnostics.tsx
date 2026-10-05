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
  Compass,
  Cable,
  CheckCircle2
} from 'lucide-react';

export const SensorDiagnostics: React.FC = () => {
  const { telemetry } = useSimulation();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BDCED3]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-sans font-semibold tracking-wide text-[#1F4B60] uppercase">
              SENSOR DIAGNOSTICS
            </h2>
            <StatusBadge status="ALL SENSORS OPERATIONAL" variant="green" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#DCEEEE] border border-[#B8CCD1] text-[#2A7C7A] font-semibold">
              SIMULATION MODE
            </span>
          </div>
          <p className="text-xs text-[#60868C] font-sans mt-0.5">
            Real Sensor Status, Calibration State & Tether Communication Verification
          </p>
        </div>

        {/* Real Operational Status Badge (No fake percentage) */}
        <div className="flex items-center gap-3 bg-[#FFFFFF] px-4 py-2 rounded-[8px] border border-[#BDCED3] shadow-sm text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-[#3F8068]" />
          <div>
            <div className="text-[10px] font-sans font-semibold text-[#60868C] uppercase">
              PLATFORM STATUS
            </div>
            <div className="text-xs font-bold text-[#1F4B60]">
              8/8 INSTRUMENTS ACTIVE &bull; TETHER LINKED
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics Cards Grid — Real Sensor Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* 1. Metal Detection Sensor */}
        <SensorCard
          name="METAL DETECTION SENSOR"
          status="ONLINE"
          icon={<Zap className="w-4 h-4" />}
          specs={[
            { label: 'Current Response', value: `${telemetry.metalResponse.toFixed(2)} mV/V`, highlight: true },
            { label: 'Signal State', value: telemetry.metalResponse >= telemetry.threshold ? 'Metal Detected' : telemetry.metalResponse >= 0.5 ? 'Elevated' : 'Nominal' },
            { label: 'Baseline Calibration', value: `${telemetry.baselineResponse.toFixed(2)} mV/V (Calibrated)` },
            { label: 'Detection Threshold', value: `${telemetry.threshold.toFixed(2)} mV/V (Active)` },
          ]}
        />

        {/* 2. RM3100 Magnetometer */}
        <SensorCard
          name="RM3100 MAGNETOMETER"
          status="ONLINE"
          icon={<Compass className="w-4 h-4" />}
          specs={[
            { label: 'X-Axis Status', value: '+18.3 µT (Active)' },
            { label: 'Y-Axis Status', value: '-12.4 µT (Active)' },
            { label: 'Z-Axis Status', value: '-35.8 µT (Active)' },
            { label: 'Calibration Status', value: 'Geomagnetic Baseline Valid' },
            { label: 'Current Total Field', value: '42.3 µT (Normal)', highlight: true },
          ]}
        />

        {/* 3. Pressure Sensor */}
        <SensorCard
          name="PRESSURE SENSOR"
          status="ONLINE"
          icon={<Gauge className="w-4 h-4" />}
          specs={[
            { label: 'Current Pressure', value: `${telemetry.pressure.toFixed(1)} MPa`, highlight: true },
            { label: 'Hydrostatic Calibration', value: 'Valid (Calibrated)' },
            { label: 'Calculated Depth', value: `${telemetry.depth.toFixed(1)} m` },
            { label: 'Zero Reference', value: '+0.01 MPa Offset' },
          ]}
        />

        {/* 4. Temperature Sensor */}
        <SensorCard
          name="TEMPERATURE SENSOR"
          status="ONLINE"
          icon={<Thermometer className="w-4 h-4" />}
          specs={[
            { label: 'Current Temperature', value: `${telemetry.temperature.toFixed(1)} °C`, highlight: true },
            { label: 'Calibration Status', value: 'Thermal Zero Calibrated' },
            { label: 'Response Rate', value: '80 ms' },
            { label: 'Probe Channel', value: 'Seabed Ambient Sensor' },
          ]}
        />

        {/* 5. 3-Axis IMU */}
        <SensorCard
          name="3-AXIS IMU"
          status="ONLINE"
          icon={<RotateCw className="w-4 h-4" />}
          specs={[
            { label: 'Roll Axis', value: `${telemetry.roll >= 0 ? '+' : ''}${telemetry.roll.toFixed(1)}°` },
            { label: 'Pitch Axis', value: `${telemetry.pitch >= 0 ? '+' : ''}${telemetry.pitch.toFixed(1)}°` },
            { label: 'Yaw (Heading)', value: `${telemetry.yaw.toFixed(1)}°`, highlight: true },
            { label: 'Calibration / Status', value: 'Attitude Lock Stabilized' },
          ]}
        />

        {/* 6. Tether / Communication Link */}
        <SensorCard
          name="TETHER / DATA LINK"
          status="LINKED"
          icon={<Cable className="w-4 h-4" />}
          specs={[
            { label: 'Connection Status', value: 'Surface Umbilical Linked', highlight: true },
            { label: 'Telemetry Status', value: '10 Hz Active Sync' },
            { label: 'Downlink Packet Loss', value: `${telemetry.packetLoss}%` },
            { label: 'Link Latency', value: `${telemetry.latency} ms` },
          ]}
        />

        {/* 7. Data Logger */}
        <SensorCard
          name="DATA LOGGER"
          status="ONLINE"
          icon={<HardDrive className="w-4 h-4" />}
          specs={[
            { label: 'Logging Status', value: 'Soundings Recording Active', highlight: true },
            { label: 'Storage Availability', value: '72% Available' },
            { label: 'Soundings Written', value: `${telemetry.measurementsCount.toLocaleString()} Records` },
            { label: 'Write Verification', value: 'Checksum Verified' },
          ]}
        />

        {/* 8. Sensor Pod Housing */}
        <SensorCard
          name="SENSOR POD HOUSING"
          status="ONLINE"
          icon={<Cpu className="w-4 h-4" />}
          specs={[
            { label: 'Housing Seal Status', value: 'Dry / Safe (Sealed)', highlight: true },
            { label: 'Internal Humidity', value: '12% RH (Nominal)' },
            { label: 'Internal Pressure', value: '1.01 atm' },
            { label: 'Moisture Ingress Sensor', value: 'No Moisture Detected' },
          ]}
        />
      </div>
    </div>
  );
};
