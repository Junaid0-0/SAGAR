import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  ArrowRight,
  Target,
  Layers,
  Cable,
  Cpu,
  Wifi
} from 'lucide-react';

export const MissionOverview: React.FC = () => {
  const {
    telemetry,
    targets,
    setCurrentPage,
    setSelectedTarget
  } = useSimulation();

  const heroTarget = targets.find((t) => t.code === 'A-03') || targets[0];
  const progressPct = Math.round((telemetry.completedLines / telemetry.totalLines) * 100);

  const metalDetectedCount = String(
    targets.filter((t) => t.classification === 'METAL DETECTED').length
  ).padStart(2, '0');

  const otherAnomaliesCount = String(
    targets.filter((t) => t.classification !== 'METAL DETECTED').length
  ).padStart(2, '0');

  // Hero target classification label
  const targetClassification = heroTarget.classification || (
    heroTarget.signalStrength >= 0.65 ? 'METAL DETECTED' : 'MAGNETIC ANOMALY'
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto select-none font-sans">
      {/* 1. MISSION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#BDCED3]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-[#1F4B60] uppercase font-sans">
              MISSION OVERVIEW
            </h1>
            <StatusBadge status="ACTIVE" variant="green" />
          </div>
          <p className="text-xs sm:text-sm text-[#60868C] font-sans mt-0.5">
            SAGAR &bull; Seafloor Analysis and Geospatial Assessment for Resource Exploration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('live-survey')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#2A7C7A] hover:bg-[#1F4B60] text-[#FFFFFF] text-xs font-medium transition-colors shadow-sm"
          >
            <span>Launch Live Survey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PLATFORM WORKFLOW BANNER */}
      <div className="bg-[#FFFFFF] border border-[#BDCED3] rounded-[6px] px-4 py-2.5 flex items-center justify-between overflow-x-auto text-[11px] font-mono shadow-sm">
        <span className="text-[#60868C] font-semibold uppercase tracking-wider text-[10px] mr-2">
          OPERATOR WORKFLOW:
        </span>
        <div className="flex items-center gap-2 text-[#1F4B60] whitespace-nowrap">
          <span className="font-semibold text-[#2A7C7A]">DEPLOY</span>
          <span className="text-[#BDCED3]">&rarr;</span>
          <span className="font-semibold text-[#1F4B60]">SENSE</span>
          <span className="text-[#BDCED3]">&rarr;</span>
          <span className="font-semibold text-[#B78332]">DETECT</span>
          <span className="text-[#BDCED3]">&rarr;</span>
          <span>LOCATE</span>
          <span className="text-[#BDCED3]">&rarr;</span>
          <span className="font-semibold text-[#2A7C7A]">MAP</span>
          <span className="text-[#BDCED3]">&rarr;</span>
          <span className="font-semibold text-[#1F4B60]">LOG</span>
        </div>
      </div>

      {/* 2. UNIFIED MISSION SUMMARY */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-6 shadow-sm">
        {/* Mission Identification Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E7E5E2]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-semibold tracking-wider text-[#60868C] uppercase">
              EXPEDITION:
            </span>
            <span className="text-sm font-mono font-bold tracking-wider text-[#1F4B60]">
              MISSION 07
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#E5F2EC] border border-[#BDCED3] text-[#3F8068] font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F8068]" />
              ACTIVE
            </span>
          </div>
          <span className="text-xs font-mono text-[#60868C]">
            RV SAMUDRA &bull; CENTRAL INDIAN RIDGE &bull; SEABED EXPLORATION
          </span>
        </div>

        {/* 4 Core Mission-Level Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-5">
          {/* DEPTH */}
          <div>
            <div className="text-[11px] font-sans font-semibold tracking-wider text-[#60868C] uppercase">
              CURRENT DEPTH
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-[#1F4B60]">
                {Math.round(telemetry.depth).toLocaleString()}
              </span>
              <span className="text-xs font-mono text-[#60868C]">m</span>
            </div>
            <p className="text-[11px] text-[#60868C] font-sans mt-0.5">Current seabed deployment</p>
          </div>

          {/* SURVEY DISTANCE */}
          <div className="sm:border-l sm:border-[#E7E5E2] sm:pl-6">
            <div className="text-[11px] font-sans font-semibold tracking-wider text-[#60868C] uppercase">
              SURVEY DISTANCE
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-[#1F4B60]">
                {telemetry.surveyDistance.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-[#60868C]">km</span>
            </div>
            <p className="text-[11px] text-[#60868C] font-sans mt-0.5">Transects covered to date</p>
          </div>

          {/* METAL DETECTED */}
          <div className="lg:border-l lg:border-[#E7E5E2] lg:pl-6">
            <div className="text-[11px] font-sans font-semibold tracking-wider text-[#60868C] uppercase">
              METAL DETECTED
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-[#B85C5C]">
                {metalDetectedCount}
              </span>
              <span className="text-xs font-mono text-[#60868C]">events</span>
            </div>
            <p className="text-[11px] text-[#60868C] font-sans mt-0.5">Threshold crossed & flagged</p>
          </div>

          {/* ANOMALIES */}
          <div className="sm:border-l sm:border-[#E7E5E2] sm:pl-6">
            <div className="text-[11px] font-sans font-semibold tracking-wider text-[#60868C] uppercase">
              ANOMALIES
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-[#B78332]">
                {otherAnomaliesCount}
              </span>
              <span className="text-xs font-mono text-[#60868C]">logged</span>
            </div>
            <p className="text-[11px] text-[#60868C] font-sans mt-0.5">Magnetic & unclassified</p>
          </div>
        </div>
      </div>

      {/* 3 & 4: MISSION PROGRESS (Primary) + CURRENT TARGET (Secondary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3. MISSION PROGRESS SECTION (7 cols on large screens) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2A7C7A]" />
                <h2 className="font-sans text-xs font-semibold tracking-wider text-[#60868C] uppercase">
                  MISSION PROGRESS
                </h2>
              </div>
              <span className="text-xs font-mono font-medium text-[#60868C]">
                {telemetry.completedLines} / {telemetry.totalLines} survey lines completed
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-mono font-semibold text-[#1F4B60]">
                {progressPct}%
              </span>
              <span className="text-xs font-mono text-[#60868C]">
                Line {telemetry.currentLine} in execution
              </span>
            </div>

            {/* Clean Horizontal Progress Indicator */}
            <div className="mt-3">
              <div className="h-2 w-full bg-[#E7E5E2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2A7C7A] rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#60868C] font-sans mt-1.5">
                <span>Start</span>
                <span>Transects Execution</span>
                <span>Recovery</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E7E5E2] text-[11px] text-[#60868C] flex items-center justify-between">
            <span>Pattern: Lawnmower Grid (50m line spacing)</span>
            <span className="text-[#2A7C7A] font-medium">On Schedule</span>
          </div>
        </div>

        {/* 4. CURRENT TARGET SECTION (5 cols on large screens) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#B85C5C]" />
                <h2 className="font-sans text-xs font-semibold tracking-wider text-[#60868C] uppercase">
                  ACTIVE TARGET
                </h2>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] border font-mono text-[10px] font-semibold uppercase ${
                targetClassification === 'METAL DETECTED'
                  ? 'bg-[#F9E8E8] border-[#BDCED3] text-[#B85C5C]'
                  : 'bg-[#F8EFE3] border-[#BDCED3] text-[#B78332]'
              }`}>
                {targetClassification}
              </span>
            </div>

            <div className="mt-4 space-y-3 font-mono">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-bold text-[#1F4B60]">
                    {heroTarget.id}
                  </span>
                  <div className="text-xs text-[#60868C] font-sans mt-0.5">
                    Survey Line: <strong className="text-[#2A7C7A] font-mono">{heroTarget.surveyLine}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#60868C] font-sans">Depth</div>
                  <div className="text-base font-semibold text-[#1F4B60]">
                    {heroTarget.depth.toLocaleString()} m
                  </div>
                </div>
              </div>

              <div className="bg-[#F8F6F2] p-2.5 rounded-[6px] border border-[#CBD9DA] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-sans text-[#60868C] uppercase block">SENSOR RESPONSE</span>
                  <span className="font-bold text-[#B85C5C] text-sm">
                    {heroTarget.signalStrength.toFixed(2)} mV/V
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-sans text-[#60868C] uppercase block">CLASSIFICATION</span>
                  <span className="font-bold text-[#1F4B60] text-xs">
                    {targetClassification}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action to View Dossier */}
          <div className="mt-4 pt-3 border-t border-[#E7E5E2] flex items-center justify-between">
            <span className="text-[11px] text-[#60868C]">Flagged for investigation</span>
            <button
              onClick={() => setSelectedTarget(heroTarget)}
              className="px-3 py-1 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F2F6F6] text-xs font-medium text-[#1F4B60] border border-[#BDCED3] transition-colors"
            >
              View Dossier
            </button>
          </div>
        </div>
      </div>

      {/* 5. SYSTEM STATUS */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#BDCED3] p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-sans font-semibold tracking-wider text-[#60868C] uppercase flex items-center gap-2">
            <span>SYSTEM STATUS</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-sans">
            {/* Sensor Pod */}
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#60868C]" />
              <span className="text-[#60868C]">Sensor Pod:</span>
              <span className="font-mono font-semibold text-[#3F8068] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F8068]" />
                ONLINE
              </span>
            </div>

            {/* Data Link */}
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-[#60868C]" />
              <span className="text-[#60868C]">Data Link:</span>
              <span className="font-mono font-semibold text-[#2A7C7A] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2A7C7A]" />
                ACTIVE
              </span>
            </div>

            {/* Tether Power */}
            <div className="flex items-center gap-2">
              <Cable className="w-3.5 h-3.5 text-[#3F8068]" />
              <span className="text-[#60868C]">Tether Power:</span>
              <span className="font-mono font-semibold text-[#3F8068] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F8068]" />
                NOMINAL (120 VDC)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
