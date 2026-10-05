import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from './StatusBadge';
import {
  X,
  Target,
  FileDown,
  ListPlus,
  Check,
  Activity,
  AlertTriangle,
  Info,
  BrainCircuit
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';

export const TargetModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedTarget,
    setSelectedTarget,
    toggleTargetQueue,
    exportData,
    targetAnalyses
  } = useSimulation();

  if (!selectedTarget) return null;

  // Localized anomaly curve data
  const chartData = [
    { offset: '-50m', response: 0.31 },
    { offset: '-40m', response: 0.33 },
    { offset: '-30m', response: 0.38 },
    { offset: '-20m', response: 0.52 },
    { offset: '-10m', response: 0.69 },
    { offset: '0m (Peak)', response: selectedTarget.signalStrength },
    { offset: '+10m', response: 0.64 },
    { offset: '+20m', response: 0.48 },
    { offset: '+30m', response: 0.36 },
    { offset: '+40m', response: 0.32 },
    { offset: '+50m', response: 0.30 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F4B60]/40 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#BDCED3] rounded-[8px] shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#BDCED3] bg-[#F8F6F2]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#F9E8E8] border border-[#BDCED3] flex items-center justify-center text-[#B85C5C]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-base font-semibold tracking-wide text-[#1F4B60]">
                  {selectedTarget.id} — Target Dossier
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-[4px] bg-[#E2EFF0] border border-[#BDCED3] text-[#2A7C7A] font-semibold">
                  {selectedTarget.classification}
                </span>
                <StatusBadge status={selectedTarget.status === 'PRIORITY' ? 'HIGH PRIORITY' : selectedTarget.status} />
              </div>
              <p className="text-[11px] font-mono text-[#60868C] mt-0.5">
                POSITION: {selectedTarget.coordinates.lat}, {selectedTarget.coordinates.lng} &bull; TRANSECT: {selectedTarget.surveyLine}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTarget(null)}
            className="text-[#60868C] hover:text-[#1F4B60] p-1 rounded-[4px] hover:bg-[#E7E5E2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Key Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F8F6F2] p-2.5 rounded-[6px] border border-[#BDCED3]">
              <span className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">DEPTH</span>
              <div className="text-base font-mono font-semibold text-[#1F4B60]">
                {selectedTarget.depth.toLocaleString()} m
              </div>
            </div>

            <div className="bg-[#F8F6F2] p-2.5 rounded-[6px] border border-[#BDCED3]">
              <span className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">SIGNAL STRENGTH</span>
              <div className="text-base font-mono font-semibold text-[#B78332]">
                {selectedTarget.signalStrength.toFixed(2)} <span className="text-xs font-normal text-[#60868C]">mV/V</span>
              </div>
            </div>

            <div className="bg-[#F8F6F2] p-2.5 rounded-[6px] border border-[#BDCED3]">
              <span className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">SURVEY TRANSECT</span>
              <div className="text-base font-mono font-semibold text-[#2A7C7A]">
                {selectedTarget.surveyLine}
              </div>
            </div>

            <div className="bg-[#F8F6F2] p-2.5 rounded-[6px] border border-[#BDCED3]">
              <span className="text-[10px] font-sans text-[#60868C] uppercase font-semibold">MEASUREMENTS</span>
              <div className="text-base font-mono font-semibold text-[#1F4B60]">
                {selectedTarget.measurements}
              </div>
            </div>
          </div>

          {/* Secondary Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#BDCED3]">
              <span className="text-[10px] text-[#60868C] uppercase block font-sans font-semibold">RESPONSE LEVEL</span>
              <span className="font-semibold text-[#B85C5C]">{selectedTarget.responseLevel}</span>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#BDCED3]">
              <span className="text-[10px] text-[#60868C] uppercase block font-sans font-semibold">DETECTION DURATION</span>
              <span className="font-semibold text-[#1F4B60]">{selectedTarget.detectionDuration}</span>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#BDCED3] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[#60868C] uppercase block font-sans font-semibold">LOGGED TIMESTAMP</span>
              <span className="font-semibold text-[#1F4B60]">{selectedTarget.timestamp}</span>
            </div>
          </div>

          {/* Spatial Profile Graph */}
          <div className="bg-[#FFFFFF] p-3.5 rounded-[8px] border border-[#BDCED3]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-sans font-semibold text-[#1F4B60] flex items-center gap-1.5 uppercase">
                <Activity className="w-3.5 h-3.5 text-[#2A7C7A]" />
                LOCALIZED INDUCTION RESPONSE TRANSECT (±50m)
              </span>
              <span className="text-[11px] font-mono text-[#B78332] font-semibold">
                PEAK: {selectedTarget.signalStrength} mV/V
              </span>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#E7E5E2" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="offset" stroke="#60868C" tick={{ fontSize: 10, fill: '#60868C' }} />
                  <YAxis domain={[0.2, 0.9]} stroke="#60868C" tick={{ fontSize: 10, fill: '#60868C' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#BDCED3',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#1F4B60',
                      boxShadow: '0 2px 6px rgba(31, 75, 96, 0.08)',
                    }}
                  />
                  <ReferenceLine y={0.65} stroke="#B85C5C" strokeDasharray="3 3" label={{ value: 'THRESHOLD 0.65', fill: '#B85C5C', fontSize: 9 }} />
                  <ReferenceLine y={0.31} stroke="#BDCED3" strokeDasharray="2 2" label={{ value: 'BASELINE 0.31', fill: '#60868C', fontSize: 9 }} />
                  <Area
                    type="monotone"
                    dataKey="response"
                    stroke="#B78332"
                    strokeWidth={1.75}
                    fillOpacity={0.15}
                    fill="#B78332"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gemini AI Synthesis (when available) */}
          {targetAnalyses[selectedTarget.code] && (
            <div className="bg-[#FFFFFF] border border-[#CBD9DA] p-3.5 rounded-[6px] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#2A7C7A] uppercase">
                  <BrainCircuit className="w-4 h-4 text-[#2A7C7A]" />
                  GEMINI AI INTERPRETATION
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-[4px] bg-[#E2EFF0] text-[#1D5E5C] font-semibold border border-[#BDCED3]">
                  {targetAnalyses[selectedTarget.code].classification} &bull; {(targetAnalyses[selectedTarget.code].confidence * 100).toFixed(0)}% CONFIDENCE
                </span>
              </div>
              <p className="text-xs text-[#1F4B60] leading-relaxed font-sans mb-2">
                {targetAnalyses[selectedTarget.code].explanation}
              </p>
              <div className="flex items-center justify-between text-[11px] font-sans pt-1 border-t border-[#E7E5E2]">
                <span className="text-[#60868C]">
                  Resource Potential: <strong className="text-[#2A7C7A] font-mono">{targetAnalyses[selectedTarget.code].mineral_potential}/100</strong>
                </span>
                <button
                  onClick={() => {
                    setSelectedTarget(null);
                    navigate('/ai-analysis');
                  }}
                  className="text-[#2A7C7A] hover:underline font-medium"
                >
                  View in AI Analysis Page &rarr;
                </button>
              </div>
            </div>
          )}

          {/* System Interpretation */}
          <div className="bg-[#E2EFF0] border-l-4 border-l-[#2A7C7A] border border-[#BDCED3] p-3.5 rounded-[6px]">
            <div className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#2A7C7A] uppercase mb-1">
              <Info className="w-3.5 h-3.5 text-[#2A7C7A]" />
              SYSTEM INTERPRETATION
            </div>
            <p className="text-xs text-[#1F4B60] leading-relaxed font-sans">
              "{selectedTarget.interpretation}"
            </p>
          </div>

          {/* Recommendation */}
          <div className="bg-[#F8EFE3] border border-[#BDCED3] p-3.5 rounded-[6px]">
            <div className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#B78332] uppercase mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B78332]" />
              OPERATIONAL RECOMMENDATION
            </div>
            <p className="text-xs font-sans font-medium text-[#1F4B60]">
              {selectedTarget.recommendation}
            </p>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#BDCED3] bg-[#F8F6F2]">
          <button
            onClick={() => exportData('target-report')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F2F6F6] text-[#1F4B60] border border-[#BDCED3] text-xs font-sans font-medium transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-[#60868C]" />
            <span>Export Data</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTargetQueue(selectedTarget.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-sans font-medium transition-colors border ${
                selectedTarget.queuedForSurvey
                  ? 'bg-[#E2EFF0] border-[#BDCED3] text-[#2A7C7A]'
                  : 'bg-[#FFFFFF] border-[#BDCED3] text-[#1F4B60] hover:bg-[#F2F6F6]'
              }`}
            >
              {selectedTarget.queuedForSurvey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#2A7C7A]" />
                  <span>Queued for Survey</span>
                </>
              ) : (
                <>
                  <ListPlus className="w-3.5 h-3.5 text-[#60868C]" />
                  <span>Add to Survey Queue</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedTarget(null)}
              className="px-4 py-1.5 rounded-[6px] bg-[#2A7C7A] hover:bg-[#1F4B60] text-[#FFFFFF] text-xs font-sans font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
