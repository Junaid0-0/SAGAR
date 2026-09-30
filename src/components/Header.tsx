import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { PageId } from '../types';
import {
  Activity,
  Ship,
  Clock,
  Sparkles,
  Zap,
  RotateCcw,
  Sliders,
  Radio
} from 'lucide-react';

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  'overview': { title: 'MISSION OVERVIEW', subtitle: 'PRELIMINARY SEABED EXPLORATION' },
  'live-survey': { title: 'LIVE SURVEY', subtitle: 'REAL-TIME UNDERWATER SURVEY OPERATIONS' },
  'seafloor-map': { title: 'SEAFLOOR MAP', subtitle: 'BATHYMETRIC & ANOMALY VISUALIZATION' },
  'metal-detection': { title: 'METAL DETECTION', subtitle: 'ELECTROMAGNETIC / MAGNETIC RESPONSE ANALYSIS' },
  'target-zones': { title: 'TARGET ZONES', subtitle: 'DETECTED SEAFLOOR ANOMALIES' },
  'telemetry-data': { title: 'TELEMETRY & DATA', subtitle: 'LIVE SENSOR DATA & SYSTEM TELEMETRY' },
  'survey-history': { title: 'SURVEY HISTORY', subtitle: 'PREVIOUS SEAFLOOR SURVEY MISSIONS' },
  'sensor-diagnostics': { title: 'SENSOR DIAGNOSTICS', subtitle: 'SYSTEM HEALTH & SENSOR INTEGRITY' },
  'system-status': { title: 'SYSTEM STATUS', subtitle: 'ENGINEERING & DEPLOYMENT TELEMETRY' },
  'configuration': { title: 'SYSTEM CONFIGURATION', subtitle: 'MISSION PARAMETERS & SENSOR CALIBRATION' },
};

export const Header: React.FC = () => {
  const {
    currentPage,
    telemetry,
    triggerDemoAnomaly,
    resetDemoToBaseline
  } = useSimulation();

  const [timeUtc, setTimeUtc] = useState<string>('14:32:18');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      const seconds = now.getUTCSeconds().toString().padStart(2, '0');
      setTimeUtc(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const pageInfo = PAGE_TITLES[currentPage] || { title: 'MISSION CONTROL', subtitle: 'PRAGYA-SEA PLATFORM' };

  return (
    <header className="h-16 bg-ocean-900/95 border-b border-cyan-500/20 px-6 flex items-center justify-between select-none relative z-30 shadow-md backdrop-blur-md">
      {/* LEFT: Current Page Name */}
      <div className="flex items-center gap-3 min-w-[260px]">
        <div className="w-2.5 h-7 bg-gradient-to-b from-cyan-400 to-teal-600 rounded-sm" />
        <div>
          <h1 className="text-base font-bold font-mono tracking-widest text-slate-100 flex items-center gap-2">
            {pageInfo.title}
          </h1>
          <p className="text-[10px] font-mono tracking-wider text-cyan-400/80 uppercase">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* CENTER: Mission 07 / Seafloor Survey */}
      <div className="hidden lg:flex items-center gap-6 px-6 py-1.5 rounded-md bg-ocean-850/80 border border-slate-800 shadow-inner">
        <div className="text-center">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            ACTIVE MISSION
          </div>
          <div className="text-sm font-bold font-mono text-cyan-300 tracking-wider">
            MISSION 07
          </div>
        </div>
        <div className="h-6 w-[1px] bg-slate-700/60" />
        <div className="text-center">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            OPERATION
          </div>
          <div className="text-sm font-semibold font-mono text-slate-200 tracking-wide">
            SEAFLOOR SURVEY
          </div>
        </div>
        <div className="h-6 w-[1px] bg-slate-700/60" />
        <div className="text-center">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            TARGET LINE
          </div>
          <div className="text-sm font-mono font-bold text-amber-300">
            {telemetry.currentLine} <span className="text-xs font-normal text-slate-400">({telemetry.completedLines}/{telemetry.totalLines})</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Status Indicators & Simulation Controls */}
      <div className="flex items-center gap-4">
        {/* Quick Demo Controls for presentation */}
        <div className="hidden xl:flex items-center gap-1.5 bg-ocean-850/70 p-1 rounded border border-slate-800 text-xs">
          <button
            onClick={triggerDemoAnomaly}
            title="Simulate Anomaly Detection (A-03 Peak) for Demo Video"
            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all font-mono text-[11px]"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Simulate Anomaly</span>
          </button>
          <button
            onClick={resetDemoToBaseline}
            title="Reset Metal Response to Normal Baseline (0.31 mV/V)"
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700 transition-all font-mono text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Baseline</span>
          </button>
        </div>

        {/* Simulation Mode Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold tracking-wider shadow-sm shadow-cyan-950/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span>SIMULATION MODE</span>
        </div>

        {/* Vessel */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1">
            <Ship className="w-3 h-3 text-slate-400" /> VESSEL
          </span>
          <span className="text-xs font-mono font-bold text-slate-200">
            RV SAMUDRA
          </span>
        </div>

        {/* System Online */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            SYSTEM
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* UTC Clock */}
        <div className="flex flex-col text-right pl-2 border-l border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> UTC
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
            {timeUtc}
          </span>
        </div>
      </div>
    </header>
  );
};
