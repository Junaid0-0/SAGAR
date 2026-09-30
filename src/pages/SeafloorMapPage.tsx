import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { SeafloorMap } from '../components/SeafloorMap';
import { StatusBadge } from '../components/StatusBadge';
import {
  Layers,
  Map as MapIcon,
  Crosshair,
  Sliders,
  Eye,
  Activity,
  Compass,
  FileDown
} from 'lucide-react';

export const SeafloorMapPage: React.FC = () => {
  const { setSelectedTarget, exportData } = useSimulation();

  // Layer toggles
  const [layers, setLayers] = useState({
    surveyTrack: true,
    measurementPoints: true,
    anomalyZones: true,
    depthContours: true,
    temperature: false,
    signalIntensity: true,
  });

  // Map mode
  const [mapMode, setMapMode] = useState<'bathymetry' | 'anomaly' | 'track'>('bathymetry');

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 flex flex-col gap-3 select-none overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-ocean-900/80 rounded-md border border-slate-800 text-xs font-mono">
        <div>
          <h2 className="font-bold text-slate-100 text-sm tracking-wider uppercase flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-cyan-400" />
            SEAFLOOR MAP — BATHYMETRIC & ANOMALY VISUALIZATION
          </h2>
          <p className="text-[10px] text-cyan-400/80">
            REGIONAL SURVEY GRID // CENTRAL INDIAN RIDGE DEEP TRANSECTS (4,200m – 4,400m)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('geotiff-bathymetry')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>EXPORT BATHYMETRY GIS</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Full-bleed Map Canvas + Right Side Control Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Full Large Seafloor Map Canvas */}
        <div className="lg:col-span-9 h-full min-h-0 bg-ocean-900/60 rounded-lg border border-slate-800 p-2 overflow-hidden shadow-inner relative">
          <SeafloorMap
            largeMode={true}
            layers={layers}
            mapMode={mapMode}
            onSelectAnomaly={(target) => setSelectedTarget(target)}
          />
        </div>

        {/* Right-Side Map Control Panel */}
        <div className="lg:col-span-3 h-full min-h-0 bg-ocean-900/90 rounded-lg border border-slate-800 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            {/* MAP MODE SELECTOR */}
            <div>
              <div className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                MAP VISUALIZATION MODE
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
                {[
                  { id: 'bathymetry', label: 'Bathymetry (Depth Contours)', desc: 'Isobath lines from -4,200m to -4,400m' },
                  { id: 'anomaly', label: 'Anomaly Response Heatmap', desc: 'Inductive gradient & anomaly highlights' },
                  { id: 'track', label: 'Survey Track & Transects', desc: '50m spacing lawnmower execution' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setMapMode(mode.id as any)}
                    className={`w-full text-left p-2.5 rounded border transition-all ${
                      mapMode === mode.id
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm'
                        : 'bg-ocean-850/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-ocean-800'
                    }`}
                  >
                    <div className="font-bold text-xs">{mode.label}</div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* LAYERS TOGGLE */}
            <div>
              <div className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                DISPLAY LAYERS
              </div>

              <div className="space-y-2 bg-ocean-850/70 p-3 rounded border border-slate-800 text-xs font-mono">
                <label className="flex items-center justify-between cursor-pointer hover:text-white">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={layers.surveyTrack}
                      onChange={() => toggleLayer('surveyTrack')}
                      className="rounded bg-ocean-950 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Survey Track (L-01 to L-23)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">23 lines</span>
                </label>

                <label className="flex items-center justify-between cursor-pointer hover:text-white">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={layers.measurementPoints}
                      onChange={() => toggleLayer('measurementPoints')}
                      className="rounded bg-ocean-950 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Measurement Points</span>
                  </span>
                  <span className="text-[10px] text-slate-500">12,842</span>
                </label>

                <label className="flex items-center justify-between cursor-pointer hover:text-white">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={layers.anomalyZones}
                      onChange={() => toggleLayer('anomalyZones')}
                      className="rounded bg-ocean-950 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Anomaly Zones (A-01..A-07)</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">7 zones</span>
                </label>

                <label className="flex items-center justify-between cursor-pointer hover:text-white">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={layers.depthContours}
                      onChange={() => toggleLayer('depthContours')}
                      className="rounded bg-ocean-950 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Depth Contours</span>
                  </span>
                  <span className="text-[10px] text-cyan-400">50m int</span>
                </label>

                <label className="flex items-center justify-between cursor-pointer hover:text-white">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={layers.temperature}
                      onChange={() => toggleLayer('temperature')}
                      className="rounded bg-ocean-950 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Temperature Gradient</span>
                  </span>
                  <span className="text-[10px] text-slate-500">CTD</span>
                </label>

                <label className="flex items-center justify-between cursor-pointer hover:text-white">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={layers.signalIntensity}
                      onChange={() => toggleLayer('signalIntensity')}
                      className="rounded bg-ocean-950 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Signal Intensity Halo</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Inductive</span>
                </label>
              </div>
            </div>

            {/* Target Quick Jump */}
            <div>
              <div className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase mb-2">
                CLICK ANOMALY TO INSPECT:
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                {[
                  { code: 'A-01', status: 'REVIEW', color: 'amber' },
                  { code: 'A-02', status: 'HIGH', color: 'amber' },
                  { code: 'A-03', status: 'PRIORITY', color: 'red' },
                  { code: 'A-04', status: 'LOW', color: 'slate' },
                ].map((t) => (
                  <button
                    key={t.code}
                    onClick={() => {
                      const found = useSimulation().targets.find((tgt) => tgt.code === t.code);
                      if (found) setSelectedTarget(found);
                    }}
                    className="p-1.5 rounded bg-ocean-850/80 hover:bg-ocean-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-colors"
                  >
                    <span className="font-bold text-slate-200">{t.code}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        t.color === 'red'
                          ? 'bg-rose-950 text-rose-300'
                          : t.color === 'amber'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-ocean-950/80 rounded border border-slate-800 text-[10px] font-mono text-slate-400">
            <span className="text-cyan-400 font-bold block mb-1">ACOUSTIC BATHYMETRIC NOTES:</span>
            Subsea terrain indicates undulating volcanic ridge morphology overlaid by pelagic sediments.
          </div>
        </div>
      </div>
    </div>
  );
};
