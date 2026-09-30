import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Play, SkipForward, RotateCcw, ChevronUp, ChevronDown, Sparkles, Layers } from 'lucide-react';
import { PageId } from '../types';

interface DemoStep {
  step: number;
  label: string;
  page: PageId;
  action?: () => void;
  description: string;
}

export const DemoControls: React.FC = () => {
  const {
    setCurrentPage,
    triggerDemoAnomaly,
    resetDemoToBaseline,
    setSelectedTarget,
    targets
  } = useSimulation();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const demoSteps: DemoStep[] = [
    {
      step: 1,
      label: 'Mission Overview',
      page: 'overview',
      description: 'Landing screen — High-level KPI cards, mission progress, recent activity.',
    },
    {
      step: 2,
      label: 'Live Survey',
      page: 'live-survey',
      description: 'Sensor pod moving across bathymetric seafloor with live acoustic telemetry.',
    },
    {
      step: 3,
      label: 'Telemetry & Data',
      page: 'telemetry-data',
      description: 'Inspect live multi-parameter sensor streams (Depth, Pressure, IMU, Temperature).',
    },
    {
      step: 4,
      label: 'Metal Detection Baseline',
      page: 'metal-detection',
      action: resetDemoToBaseline,
      description: 'Observe baseline background electromagnetic response (0.31 mV/V).',
    },
    {
      step: 5,
      label: 'Elevated Response & Anomaly A-03',
      page: 'metal-detection',
      action: triggerDemoAnomaly,
      description: 'Signal increases past 0.65 mV/V threshold — Anomaly A-03 peak detected!',
    },
    {
      step: 6,
      label: 'Target Zones Registry',
      page: 'target-zones',
      description: 'View Target A-03 categorized as HIGH PRIORITY candidate exploration area.',
    },
    {
      step: 7,
      label: 'Seafloor Map Spatial View',
      page: 'seafloor-map',
      description: 'Inspect bathymetric contours, 50m transects, and Target A-03 highlighted on seabed.',
    },
    {
      step: 8,
      label: 'Inspect Target A-03 Dossier',
      page: 'seafloor-map',
      action: () => {
        const a03 = targets.find((t) => t.code === 'A-03');
        if (a03) setSelectedTarget(a03);
      },
      description: 'Open full scientific target interpretation modal with localized induction gradient.',
    },
    {
      step: 9,
      label: 'Survey History Archive',
      page: 'survey-history',
      description: 'Review historical cruises (Surveys 03-07) and national registry soundings.',
    },
    {
      step: 10,
      label: 'Hardware Diagnostics',
      page: 'sensor-diagnostics',
      description: 'Verify 97% overall sensor pod integrity, calibration validity, and acoustic link.',
    },
  ];

  const handleStep = (idx: number) => {
    setCurrentStepIdx(idx);
    const s = demoSteps[idx];
    setCurrentPage(s.page);
    if (s.action) s.action();
  };

  const handleNext = () => {
    const nextIdx = (currentStepIdx + 1) % demoSteps.length;
    handleStep(nextIdx);
  };

  return (
    <div className="fixed bottom-3 right-6 z-40 select-none">
      <div className="bg-ocean-900/95 border border-cyan-500/40 rounded-lg shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-200">
        {/* Toggle Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-ocean-800/80 transition-colors bg-ocean-850/80"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-cyan-300 uppercase">
              SIH PRESENTATION RUNNER
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              STEP {currentStepIdx + 1}/{demoSteps.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              title="Next Demo Step"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-semibold"
            >
              <span>NEXT STEP</span>
              <SkipForward className="w-3 h-3" />
            </button>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Expanded Steps List */}
        {isExpanded && (
          <div className="p-3 border-t border-slate-800/80 max-h-72 overflow-y-auto w-96 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            <p className="text-[10px] font-sans text-slate-400 mb-2 leading-tight">
              One-click structured walkthrough for jury evaluation, faculty review, and video recording:
            </p>
            {demoSteps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => handleStep(idx)}
                className={`w-full text-left p-2 rounded border text-xs font-mono transition-all flex items-start gap-2 ${
                  currentStepIdx === idx
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                    : 'bg-ocean-850/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-ocean-800'
                }`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    currentStepIdx === idx
                      ? 'bg-cyan-500 text-ocean-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {s.step}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[11px] truncate">{s.label}</div>
                  <div className="text-[9.5px] text-slate-400 font-sans leading-tight mt-0.5">
                    {s.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
