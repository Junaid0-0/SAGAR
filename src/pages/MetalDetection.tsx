import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TelemetryChart } from '../components/TelemetryChart';
import { StatusBadge } from '../components/StatusBadge';
import {
  Activity,
  RotateCcw,
  Zap,
  ArrowUpRight,
  Compass,
  Info,
  Layers
} from 'lucide-react';

export const MetalDetection: React.FC = () => {
  const {
    telemetry,
    signalHistory,
    detectionHistory,
    triggerDemoAnomaly,
    resetDemoToBaseline,
    setSelectedTarget,
    targets
  } = useSimulation();

  const deviationPct = Math.round(
    ((telemetry.metalResponse - telemetry.baselineResponse) / telemetry.baselineResponse) * 100
  );

  const isExceeded = telemetry.metalResponse >= telemetry.threshold;
  const isElevated = telemetry.metalResponse >= 0.5;

  // DYNAMIC SIMULATED RM3100 MAGNETOMETER VALUES (Additive to metal response)
  // Ambient subsea magnetic field at survey location ~42-45 µT
  const baselineField = 42.10; // in µT

  // 3-Axis components reacting dynamically to platform attitude & survey segment
  const magX = parseFloat((18.25 + (telemetry.roll * 0.12)).toFixed(2));
  const magY = parseFloat((-12.40 + (telemetry.pitch * 0.15)).toFixed(2));

  // Z-axis deflection increases when crossing magnetic variation zones
  const zAnomalyShift = isExceeded ? 3.45 : isElevated ? 1.65 : 0.15;
  const magZ = parseFloat((-35.80 + zAnomalyShift + ((telemetry.depth % 1) * 0.18)).toFixed(2));

  const totalField = parseFloat(Math.sqrt(magX * magX + magY * magY + magZ * magZ).toFixed(2));
  const deltaB = parseFloat(Math.abs(totalField - baselineField).toFixed(2));
  const magDeviationPct = parseFloat(((deltaB / baselineField) * 100).toFixed(1));
  const magThreshold = 2.20; // µT deviation threshold

  const magStatus: 'NORMAL' | 'ELEVATED' | 'MAGNETIC ANOMALY' =
    deltaB >= magThreshold
      ? 'MAGNETIC ANOMALY'
      : deltaB >= 1.0
      ? 'ELEVATED'
      : 'NORMAL';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BDCED3]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-sans font-semibold tracking-wide text-[#1F4B60] uppercase">
              METAL DETECTION & SENSOR ANALYSIS
            </h2>
            <StatusBadge
              status={isExceeded ? 'METAL DETECTED' : isElevated ? 'ELEVATED RESPONSE' : 'NORMAL BASELINE'}
              variant={isExceeded ? 'red' : isElevated ? 'amber' : 'green'}
            />
          </div>
          <p className="text-xs text-[#60868C] font-sans mt-0.5">
            Primary Sensor Analysis & Complementary RM3100 Magnetometer Telemetry
          </p>
        </div>

        {/* Demo trigger buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetDemoToBaseline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F2F6F6] text-[#1F4B60] border border-[#BDCED3] font-sans text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#60868C]" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={triggerDemoAnomaly}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#2A7C7A] hover:bg-[#1F4B60] text-[#FFFFFF] font-sans text-xs font-medium transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Anomaly Peak</span>
          </button>
        </div>
      </div>

      {/* 1. PRIMARY SENSOR RESPONSE (Single Clean Graph) */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2] mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2A7C7A]" />
            <h3 className="font-sans text-sm font-semibold tracking-wide text-[#1F4B60] uppercase">
              METAL DETECTION RESPONSE
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-[#60868C]">
              <span className="w-2.5 h-0.5 bg-[#BDCED3]" /> Baseline: {telemetry.baselineResponse.toFixed(2)} mV/V
            </span>
            <span className="flex items-center gap-1 text-[#B85C5C]">
              <span className="w-2.5 h-0.5 bg-[#B85C5C]" /> Threshold: {telemetry.threshold.toFixed(2)} mV/V
            </span>
          </div>
        </div>

        {/* Single Main Response Graph */}
        <div className="h-60 w-full">
          <TelemetryChart
            data={signalHistory}
            dataKey="response"
            title="SENSOR RESPONSE OVER TIME"
            unit="mV/V"
            height={215}
            showThreshold={true}
            color={isExceeded ? '#B85C5C' : isElevated ? '#B78332' : '#2A7C7A'}
          />
        </div>

        {/* Detection hierarchy indicator strip */}
        <div className="mt-3 pt-3 border-t border-[#E7E5E2] flex flex-wrap items-center justify-between text-xs font-sans text-[#60868C] gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-[4px] bg-[#F8F6F2] border border-[#BDCED3] text-[#1F4B60] font-mono text-[11px]">
              1. NORMAL BASELINE (0.31 mV/V)
            </span>
            <span className="text-[#60868C]">&rarr;</span>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#F8EFE3] border border-[#BDCED3] text-[#B78332] font-mono text-[11px]">
              2. ELEVATED RESPONSE (0.50+ mV/V)
            </span>
            <span className="text-[#60868C]">&rarr;</span>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#F9E8E8] border border-[#BDCED3] text-[#B85C5C] font-mono text-[11px] font-semibold">
              3. METAL DETECTED (&gt;0.65 mV/V)
            </span>
          </div>
          <span className="text-[#2A7C7A] font-mono font-semibold">SAMPLING: {telemetry.samplingRate} Hz</span>
        </div>
      </div>

      {/* Response Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Current Sensor Response */}
        <div className="bg-[#FFFFFF] p-3.5 rounded-[8px] border border-[#BDCED3] shadow-sm">
          <span className="text-[10px] font-sans font-semibold text-[#60868C] uppercase block">
            CURRENT RESPONSE
          </span>
          <div className={`text-2xl font-mono font-semibold mt-1 ${isExceeded ? 'text-[#B85C5C]' : isElevated ? 'text-[#B78332]' : 'text-[#1F4B60]'}`}>
            {telemetry.metalResponse.toFixed(2)}{' '}
            <span className="text-xs font-normal text-[#60868C]">mV/V</span>
          </div>
          <span className="text-[11px] font-sans text-[#60868C] mt-1 block">
            Live sensor amplitude
          </span>
        </div>

        {/* Baseline */}
        <div className="bg-[#FFFFFF] p-3.5 rounded-[8px] border border-[#BDCED3] shadow-sm">
          <span className="text-[10px] font-sans font-semibold text-[#60868C] uppercase block">
            BASELINE
          </span>
          <div className="text-2xl font-mono font-semibold text-[#2A7C7A] mt-1">
            {telemetry.baselineResponse.toFixed(2)}{' '}
            <span className="text-xs font-normal text-[#60868C]">mV/V</span>
          </div>
          <span className="text-[11px] font-sans text-[#60868C] mt-1 block">
            Background noise floor
          </span>
        </div>

        {/* Detection Threshold */}
        <div className="bg-[#FFFFFF] p-3.5 rounded-[8px] border border-[#BDCED3] shadow-sm">
          <span className="text-[10px] font-sans font-semibold text-[#60868C] uppercase block">
            DETECTION THRESHOLD
          </span>
          <div className="text-2xl font-mono font-semibold text-[#B78332] mt-1">
            {telemetry.threshold.toFixed(2)}{' '}
            <span className="text-xs font-normal text-[#60868C]">mV/V</span>
          </div>
          <span className="text-[11px] font-sans text-[#60868C] mt-1 block">
            Metal trigger condition
          </span>
        </div>

        {/* Signal Quality */}
        <div className="bg-[#FFFFFF] p-3.5 rounded-[8px] border border-[#BDCED3] shadow-sm">
          <span className="text-[10px] font-sans font-semibold text-[#60868C] uppercase block">
            SIGNAL QUALITY
          </span>
          <div className="text-2xl font-mono font-semibold text-[#3F8068] mt-1">
            {telemetry.signalQuality}%
          </div>
          <span className="text-[11px] font-sans text-[#60868C] mt-1 block">
            Signal integrity index
          </span>
        </div>

        {/* Deviation */}
        <div className="bg-[#FFFFFF] p-3.5 rounded-[8px] border border-[#BDCED3] shadow-sm">
          <span className="text-[10px] font-sans font-semibold text-[#60868C] uppercase block">
            DEVIATION
          </span>
          <div className={`text-2xl font-mono font-semibold mt-1 flex items-center ${deviationPct > 100 ? 'text-[#B85C5C]' : deviationPct > 40 ? 'text-[#B78332]' : 'text-[#3F8068]'}`}>
            +{deviationPct}%
            <ArrowUpRight className="w-4 h-4 ml-0.5" />
          </div>
          <span className="text-[11px] font-sans text-[#60868C] mt-1 block">
            Above baseline
          </span>
        </div>
      </div>

      {/* 2. DEDICATED RM3100 MAGNETOMETER SECTION (ADDITIVE & SIMULATED) */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-5 shadow-sm space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7E5E2]">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-[#2A7C7A]" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-sm font-semibold tracking-wide text-[#1F4B60] uppercase">
                  RM3100 MAGNETOMETER
                </h3>
                <span className="px-2 py-0.2 rounded-[4px] bg-[#DCEEEE] border border-[#B8CCD1] text-[#2A7C7A] font-mono text-[10px] font-semibold">
                  SIMULATION MODE
                </span>
                <span className={`px-2 py-0.2 rounded-[4px] border font-mono text-[10px] font-semibold uppercase ${
                  magStatus === 'MAGNETIC ANOMALY'
                    ? 'bg-[#F9E8E8] text-[#B85C5C] border-[#BDCED3]'
                    : magStatus === 'ELEVATED'
                    ? 'bg-[#F8EFE3] text-[#B78332] border-[#BDCED3]'
                    : 'bg-[#E5F2EC] text-[#3F8068] border-[#BDCED3]'
                }`}>
                  {magStatus}
                </span>
              </div>
              <p className="text-[11px] text-[#60868C] font-sans mt-0.5">
                Simulated future sensing architecture for 3-axis subsea geomagnetic field measurement
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono">
            <span className="text-[#60868C]">MAGNETIC STATUS: </span>
            <strong className={magStatus === 'MAGNETIC ANOMALY' ? 'text-[#B85C5C]' : magStatus === 'ELEVATED' ? 'text-[#B78332]' : 'text-[#3F8068]'}>
              {magStatus}
            </strong>
          </div>
        </div>

        {/* Informative Concept Callout */}
        <div className="p-3 bg-[#F8F6F2] rounded-[6px] border border-[#CBD9DA] text-xs font-sans text-[#1F4B60] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2A7C7A] mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-[11.5px] leading-relaxed">
            <div>
              <strong>Complementary Sensing Overview:</strong> The <strong>Metal Detection Sensor</strong> provides localized inductive eddy-current response (mV/V), while the <strong>RM3100 Magnetometer</strong> measures regional magnetic field variations (&micro;T).
            </div>
            <div className="text-[#60868C]">
              <em>Note:</em> A magnetic anomaly indicates magnetic-field deviation and is not by itself proof of a metal target. The platform cross-references both sensors to flag locations for investigation.
            </div>
          </div>
        </div>

        {/* RM3100 Direct Sensor Values (X, Y, Z in µT) */}
        <div>
          <div className="text-[11px] font-sans font-semibold tracking-wider text-[#60868C] uppercase mb-2">
            DIRECT SENSOR VALUES (3-AXIS MAGNETIC FIELD)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            {/* X Field */}
            <div className="bg-[#F8F6F2] p-3 rounded-[6px] border border-[#CBD9DA]">
              <div className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">
                X MAGNETIC FIELD
              </div>
              <div className="text-xl font-bold text-[#1F4B60] mt-1">
                {magX >= 0 ? `+${magX.toFixed(2)}` : magX.toFixed(2)}{' '}
                <span className="text-xs font-normal text-[#60868C]">&micro;T</span>
              </div>
              <div className="text-[10px] text-[#60868C] font-sans mt-0.5">Surge axis vector</div>
            </div>

            {/* Y Field */}
            <div className="bg-[#F8F6F2] p-3 rounded-[6px] border border-[#CBD9DA]">
              <div className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">
                Y MAGNETIC FIELD
              </div>
              <div className="text-xl font-bold text-[#1F4B60] mt-1">
                {magY >= 0 ? `+${magY.toFixed(2)}` : magY.toFixed(2)}{' '}
                <span className="text-xs font-normal text-[#60868C]">&micro;T</span>
              </div>
              <div className="text-[10px] text-[#60868C] font-sans mt-0.5">Sway axis vector</div>
            </div>

            {/* Z Field */}
            <div className="bg-[#F8F6F2] p-3 rounded-[6px] border border-[#CBD9DA]">
              <div className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">
                Z MAGNETIC FIELD
              </div>
              <div className={`text-xl font-bold mt-1 ${isExceeded ? 'text-[#B85C5C]' : 'text-[#1F4B60]'}`}>
                {magZ >= 0 ? `+${magZ.toFixed(2)}` : magZ.toFixed(2)}{' '}
                <span className="text-xs font-normal text-[#60868C]">&micro;T</span>
              </div>
              <div className="text-[10px] text-[#60868C] font-sans mt-0.5">Vertical heave vector</div>
            </div>
          </div>
        </div>

        {/* RM3100 Derived Magnetic Values */}
        <div>
          <div className="text-[11px] font-sans font-semibold tracking-wider text-[#60868C] uppercase mb-2">
            DERIVED MAGNETIC PARAMETERS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
            {/* Total Magnetic Field */}
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#CBD9DA]">
              <div className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">TOTAL FIELD (B)</div>
              <div className="text-base font-bold text-[#1F4B60] mt-0.5">
                {totalField.toFixed(2)} <span className="text-[10px] text-[#60868C]">&micro;T</span>
              </div>
            </div>

            {/* Baseline Field */}
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#CBD9DA]">
              <div className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">BASELINE FIELD</div>
              <div className="text-base font-bold text-[#2A7C7A] mt-0.5">
                {baselineField.toFixed(2)} <span className="text-[10px] text-[#60868C]">&micro;T</span>
              </div>
            </div>

            {/* Magnetic Field Change / ΔB */}
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#CBD9DA]">
              <div className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">CHANGE (&Delta;B)</div>
              <div className={`text-base font-bold mt-0.5 ${deltaB >= magThreshold ? 'text-[#B85C5C]' : deltaB >= 1.0 ? 'text-[#B78332]' : 'text-[#1F4B60]'}`}>
                {deltaB.toFixed(2)} <span className="text-[10px] text-[#60868C]">&micro;T</span>
              </div>
            </div>

            {/* Percentage Deviation */}
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#CBD9DA]">
              <div className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">% DEVIATION</div>
              <div className={`text-base font-bold mt-0.5 ${magDeviationPct > 5 ? 'text-[#B85C5C]' : 'text-[#3F8068]'}`}>
                +{magDeviationPct}%
              </div>
            </div>

            {/* Magnetic Detection Threshold */}
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#CBD9DA]">
              <div className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">MAG THRESHOLD</div>
              <div className="text-base font-bold text-[#B78332] mt-0.5">
                {magThreshold.toFixed(2)} <span className="text-[10px] text-[#60868C]">&micro;T</span>
              </div>
            </div>

            {/* Magnetic Status */}
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#CBD9DA]">
              <div className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">STATUS</div>
              <div className={`text-xs font-bold mt-1 uppercase ${magStatus === 'MAGNETIC ANOMALY' ? 'text-[#B85C5C]' : magStatus === 'ELEVATED' ? 'text-[#B78332]' : 'text-[#3F8068]'}`}>
                {magStatus}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETECTION HISTORY LOG TABLE */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2] mb-3">
          <h3 className="font-sans text-sm font-semibold tracking-wide text-[#1F4B60] uppercase">
            DETECTION HISTORY LOG
          </h3>
          <span className="text-xs font-mono text-[#60868C]">
            AUTO-LOGGED SENSOR RESPONSES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#BDCED3] text-[11px] font-sans font-semibold text-[#60868C] uppercase">
                <th className="py-2.5 px-3">TIME</th>
                <th className="py-2.5 px-3">DEPTH</th>
                <th className="py-2.5 px-3">SENSOR RESPONSE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">TARGET</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E2] text-[#1F4B60]">
              {detectionHistory.map((row) => {
                const targetObj = targets.find((t) => t.code === row.target);
                const isThreshold = row.response >= 0.65;
                const isElevatedRow = row.response >= 0.5;

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F2F6F6] transition-colors cursor-pointer"
                    onClick={() => {
                      if (targetObj) setSelectedTarget(targetObj);
                    }}
                  >
                    <td className="py-2.5 px-3 text-[#2A7C7A] font-semibold">{row.time}</td>
                    <td className="py-2.5 px-3">{row.depth}m</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          isThreshold
                            ? 'text-[#B85C5C]'
                            : isElevatedRow
                            ? 'text-[#B78332]'
                            : 'text-[#1F4B60]'
                        }`}
                      >
                        {row.response.toFixed(2)} mV/V
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block font-mono text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border uppercase ${
                          isThreshold
                            ? 'bg-[#F9E8E8] text-[#B85C5C] border-[#BDCED3]'
                            : isElevatedRow
                            ? 'bg-[#F8EFE3] text-[#B78332] border-[#BDCED3]'
                            : 'bg-[#E5F2EC] text-[#3F8068] border-[#BDCED3]'
                        }`}
                      >
                        {isThreshold ? 'METAL DETECTED' : isElevatedRow ? 'ELEVATED' : 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {row.target !== '—' ? (
                        <span className="font-semibold text-[#B78332] bg-[#F8EFE3] px-2 py-0.5 rounded-[4px] border border-[#BDCED3]">
                          {row.target}
                        </span>
                      ) : (
                        <span className="text-[#60868C]">&mdash;</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {targetObj && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTarget(targetObj);
                          }}
                          className="text-[#2A7C7A] hover:text-[#1F4B60] text-xs font-sans font-medium hover:underline"
                        >
                          View Target
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
