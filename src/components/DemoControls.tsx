import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { SkipForward, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
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
      description: 'Underwater camera view, pod directional controls, and live dynamic telemetry.',
    },
    {
      step: 3,
      label: 'Telemetry & Data',
      page: 'telemetry-data',
      description: 'Live sensor telemetry, focused trend charts, and raw observations table.',
    },
    {
      step: 4,
      label: 'Metal Detection Baseline',
      page: 'metal-detection',
      action: resetDemoToBaseline,
      description: 'Observe baseline background response (0.31 mV/V) and normal geomagnetic field.',
    },
    {
      step: 5,
      label: 'Metal Detection & Peak',
      page: 'metal-detection',
      action: triggerDemoAnomaly,
      description: 'Signal increases past 0.65 mV/V threshold — Metal Detected & RM3100 magnetic response.',
    },
    {
      step: 6,
      label: 'Target Zones Registry',
      page: 'target-zones',
      description: 'Classified candidate targets (Metal Detected, Magnetic Anomaly, Unclassified).',
    },
    {
      step: 7,
      label: 'Seafloor Map (2D)',
      page: 'seafloor-map',
      description: 'Dedicated 2D bathymetric survey map with depth contours, transects, and targets.',
    },
    {
      step: 8,
      label: 'Inspect Target Dossier',
      page: 'seafloor-map',
      action: () => {
        const a03 = targets.find((t) => t.code === 'A-03');
        if (a03) setSelectedTarget(a03);
      },
      description: 'Open target dossier modal with classification, localized response, and coordinates.',
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
      description: 'Verify sensor pod integrity, calibration validity, and acoustic link.',
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
      <div className="bg-[#FFFFFF] border border-[#BDCED3] rounded-[8px] shadow-lg overflow-hidden transition-all duration-200">
        {/* Toggle Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F2F6F6] transition-colors bg-[#FFFFFF]"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2A7C7A]" />
            <span className="font-sans text-[11px] font-semibold tracking-wider text-[#1F4B60] uppercase">
              PRESENTATION RUNNER
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-[#E2EFF0] border border-[#BDCED3] text-[#2A7C7A]">
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
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-[#2A7C7A] hover:bg-[#1F4B60] text-[#FFFFFF] text-[10px] font-sans font-semibold transition-colors"
            >
              <span>NEXT STEP</span>
              <SkipForward className="w-3 h-3" />
            </button>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#60868C]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[#60868C]" />
            )}
          </div>
        </div>

        {/* Expanded Steps List */}
        {isExpanded && (
          <div className="p-3 border-t border-[#BDCED3] max-h-72 overflow-y-auto w-96 space-y-1.5 bg-[#F8F6F2]">
            <p className="text-[10px] font-sans text-[#60868C] mb-2 leading-tight">
              Structured walkthrough for evaluation, review, and demonstration:
            </p>
            {demoSteps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => handleStep(idx)}
                className={`w-full text-left p-2 rounded-[6px] border text-xs font-sans transition-all flex items-start gap-2 ${
                  currentStepIdx === idx
                    ? 'bg-[#E2EFF0] border-[#2A7C7A] text-[#1F4B60]'
                    : 'bg-[#FFFFFF] border-[#BDCED3] text-[#60868C] hover:text-[#1F4B60] hover:bg-[#F2F6F6]'
                }`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono font-semibold ${
                    currentStepIdx === idx
                      ? 'bg-[#2A7C7A] text-[#FFFFFF]'
                      : 'bg-[#E7E5E2] text-[#60868C]'
                  }`}
                >
                  {s.step}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[11px] truncate">{s.label}</div>
                  <div className="text-[9.5px] text-[#60868C] leading-tight mt-0.5">
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
