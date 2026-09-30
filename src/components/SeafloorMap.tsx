import React, { useState, useRef, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TargetAnomaly } from '../types';
import { BATHYMETRIC_CONTOURS, SURVEY_LINES, StaticMeasurementPoint } from '../data/mockSurveyTrack';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Layers,
  MapPin,
  Crosshair,
  Maximize2
} from 'lucide-react';

interface SeafloorMapProps {
  largeMode?: boolean;
  layers?: {
    surveyTrack: boolean;
    measurementPoints: boolean;
    anomalyZones: boolean;
    depthContours: boolean;
    temperature: boolean;
    signalIntensity: boolean;
  };
  mapMode?: 'bathymetry' | 'anomaly' | 'track';
  onSelectAnomaly?: (target: TargetAnomaly) => void;
}

export const SeafloorMap: React.FC<SeafloorMapProps> = ({
  largeMode = false,
  layers = {
    surveyTrack: true,
    measurementPoints: true,
    anomalyZones: true,
    depthContours: true,
    temperature: false,
    signalIntensity: true,
  },
  mapMode = 'bathymetry',
  onSelectAnomaly,
}) => {
  const {
    telemetry,
    targets,
    measurementPoints,
    setSelectedTarget
  } = useSimulation();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverCoords, setHoverCoords] = useState<{ lat: string; lng: string; depth: number } | null>(null);
  const [activePoint, setActivePoint] = useState<StaticMeasurementPoint | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const yPct = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      // Calculate approximate coordinates based on SVG bounds
      const latMinutes = (41.6 + yPct * 1.3).toFixed(2);
      const lngMinutes = (31.1 + xPct * 1.5).toFixed(2);
      const approxDepth = Math.round(4200 + yPct * 190);

      setHoverCoords({
        lat: `12°${latMinutes}'S`,
        lng: `74°${lngMinutes}'E`,
        depth: approxDepth,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleAnomalyClick = (target: TargetAnomaly) => {
    if (onSelectAnomaly) {
      onSelectAnomaly(target);
    } else {
      setSelectedTarget(target);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        setHoverCoords(null);
      }}
      className={`relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-b from-[#040914] via-[#071325] to-[#040a17] border border-cyan-500/20 select-none cursor-${
        isDragging ? 'grabbing' : 'crosshair'
      }`}
    >
      {/* Top Map Status Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded bg-ocean-950/80 border border-slate-700/80 backdrop-blur-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping-slow" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-slate-200 uppercase">
            BATHYMETRIC GRID // 50m TRANSECTS
          </span>
        </div>
        <div className="hidden sm:flex px-2 py-1 rounded bg-ocean-950/70 border border-slate-800 text-[10px] font-mono text-cyan-400">
          DATUM: WGS-84 / UTM ZONE 43S
        </div>
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-ocean-950/80 p-1.5 rounded-md border border-slate-700/80 backdrop-blur-sm shadow-lg">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 rounded hover:bg-ocean-800 text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded hover:bg-ocean-800 text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          className="p-1.5 rounded hover:bg-ocean-800 text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* North Arrow Widget */}
      <div className="absolute top-16 right-4 z-10 flex flex-col items-center pointer-events-none bg-ocean-950/60 p-1.5 rounded border border-slate-800/80 backdrop-blur-sm">
        <div className="font-mono text-[10px] font-bold text-cyan-400 mb-0.5">N</div>
        <Navigation className="w-4 h-4 text-cyan-400 fill-cyan-400/20 transform -rotate-45" />
      </div>

      {/* Scale Bar (500m) */}
      <div className="absolute bottom-10 left-4 z-10 pointer-events-none bg-ocean-950/80 px-2.5 py-1.5 rounded border border-slate-800 backdrop-blur-sm font-mono text-[10px] text-slate-300">
        <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1">
          <span>0m</span>
          <span>250m</span>
          <span>500m</span>
        </div>
        <div className="h-1.5 w-28 bg-slate-700 rounded-sm overflow-hidden flex border border-slate-600">
          <div className="w-1/2 h-full bg-cyan-400" />
          <div className="w-1/2 h-full bg-slate-300" />
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-10 right-4 z-10 pointer-events-none hidden md:flex flex-col gap-1 bg-ocean-950/85 p-2.5 rounded-md border border-slate-800 backdrop-blur-sm font-mono text-[10px]">
        <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider mb-0.5">
          CHART LEGEND
        </span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-300 shadow-sm shadow-rose-500" />
          <span className="text-slate-200">Elevated Anomaly Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-200" />
          <span className="text-slate-200">Moderate Response Area</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-cyan-400" />
          <span className="text-slate-200">Completed Survey Line</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 border-t border-dashed border-slate-600" />
          <span className="text-slate-400">Planned Survey Line</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rotate-45 bg-cyan-300 border border-white" />
          <span className="text-cyan-300 font-bold">Active Sensor Pod</span>
        </div>
      </div>

      {/* SVG Canvas Map Area */}
      <div
        className="w-full h-full transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <svg
          viewBox="0 0 920 540"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Background Bathymetric Gradient */}
            <linearGradient id="oceanFloorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#081b38" />
              <stop offset="50%" stopColor="#061329" />
              <stop offset="100%" stopColor="#040b17" />
            </linearGradient>

            {/* Sonar Ping Radar Radial Gradient */}
            <radialGradient id="sensorPulseGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
            </radialGradient>

            {/* Anomaly A-03 Glow */}
            <radialGradient id="anomalyA03Glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#050c18" stopOpacity="0" />
            </radialGradient>

            {/* Bathymetry Ridge Shadow */}
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Seafloor Base Texture */}
          <rect width="920" height="540" fill="url(#oceanFloorGradient)" />

          {/* Coordinate Grid Lines */}
          <g stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3">
            {/* Vertical meridians */}
            <line x1="100" y1="0" x2="100" y2="540" />
            <line x1="250" y1="0" x2="250" y2="540" />
            <line x1="400" y1="0" x2="400" y2="540" />
            <line x1="550" y1="0" x2="550" y2="540" />
            <line x1="700" y1="0" x2="700" y2="540" />
            <line x1="850" y1="0" x2="850" y2="540" />
            {/* Horizontal parallels */}
            <line x1="0" y1="90" x2="920" y2="90" />
            <line x1="0" y1="200" x2="920" y2="200" />
            <line x1="0" y1="310" x2="920" y2="310" />
            <line x1="0" y1="420" x2="920" y2="420" />
          </g>

          {/* Grid Coordinate Labels */}
          <g fill="#475569" fontSize="9" fontFamily="monospace">
            <text x="105" y="20">74°31.2'E</text>
            <text x="255" y="20">74°31.5'E</text>
            <text x="405" y="20">74°31.8'E</text>
            <text x="555" y="20">74°32.1'E</text>
            <text x="705" y="20">74°32.4'E</text>
            <text x="855" y="20">74°32.7'E</text>

            <text x="10" y="94">12°41.8'S</text>
            <text x="10" y="204">12°42.1'S</text>
            <text x="10" y="314">12°42.4'S</text>
            <text x="10" y="424">12°42.7'S</text>
          </g>

          {/* Depth Contours */}
          {layers.depthContours && (
            <g>
              {BATHYMETRIC_CONTOURS.map((contour) => (
                <g key={contour.id}>
                  <path
                    d={contour.d}
                    fill="none"
                    stroke={contour.color}
                    strokeWidth="1.8"
                    strokeOpacity="0.75"
                  />
                  <text
                    x={contour.labelX}
                    y={contour.labelY}
                    fill="#38bdf8"
                    fontSize="9"
                    fontFamily="monospace"
                    opacity="0.8"
                  >
                    -{contour.depth} m
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Survey Lines Grid (L-01 to L-23 lawnmower pattern) */}
          {layers.surveyTrack && (
            <g>
              {SURVEY_LINES.map((line) => (
                <g key={line.id}>
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={line.completed ? '#0284c7' : '#334155'}
                    strokeWidth={line.completed ? 1.5 : 1}
                    strokeDasharray={line.completed ? undefined : '4 4'}
                    strokeOpacity={line.completed ? 0.8 : 0.4}
                  />
                  <text
                    x={line.x1 - 8}
                    y={line.y1 - 6}
                    fill={line.completed ? '#7dd3fc' : '#64748b'}
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {line.name}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Static Logged Measurement Points */}
          {layers.measurementPoints && (
            <g>
              {measurementPoints.map((pt) => {
                const isElevated = pt.response >= 0.5;
                const isThresholdExceeded = pt.response >= 0.65;
                return (
                  <circle
                    key={pt.id}
                    cx={pt.x}
                    cy={pt.y}
                    r={isThresholdExceeded ? 5 : isElevated ? 4 : 2.5}
                    fill={
                      isThresholdExceeded
                        ? '#ef4444'
                        : isElevated
                        ? '#f59e0b'
                        : '#38bdf8'
                    }
                    fillOpacity={0.8}
                    stroke="#ffffff"
                    strokeWidth={isThresholdExceeded ? 1.2 : 0.6}
                    className="cursor-pointer hover:scale-150 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePoint(pt);
                    }}
                  />
                );
              })}
            </g>
          )}

          {/* Anomaly Zones (A-01 to A-07) */}
          {layers.anomalyZones && (
            <g>
              {targets.map((tgt) => {
                const isHeroA03 = tgt.code === 'A-03';
                const isHigh = tgt.status === 'HIGH' || tgt.status === 'PRIORITY';

                return (
                  <g
                    key={tgt.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnomalyClick(tgt);
                    }}
                  >
                    {/* Outer pulsating anomaly radius */}
                    {isHeroA03 && (
                      <circle
                        cx={tgt.coordinates.x}
                        cy={tgt.coordinates.y}
                        r="32"
                        fill="url(#anomalyA03Glow)"
                        className="animate-pulse"
                      />
                    )}

                    <circle
                      cx={tgt.coordinates.x}
                      cy={tgt.coordinates.y}
                      r={isHeroA03 ? 16 : isHigh ? 13 : 9}
                      fill={isHeroA03 ? '#ef4444' : isHigh ? '#f97316' : '#eab308'}
                      fillOpacity={isHeroA03 ? 0.35 : 0.25}
                      stroke={isHeroA03 ? '#f43f5e' : isHigh ? '#fb923c' : '#facc15'}
                      strokeWidth={1.5}
                      strokeDasharray={isHeroA03 ? '2 2' : undefined}
                    />

                    {/* Central marker dot */}
                    <circle
                      cx={tgt.coordinates.x}
                      cy={tgt.coordinates.y}
                      r={isHeroA03 ? 6 : 4.5}
                      fill={isHeroA03 ? '#f43f5e' : isHigh ? '#f97316' : '#eab308'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Target Identifier Tag */}
                    <rect
                      x={tgt.coordinates.x + 10}
                      y={tgt.coordinates.y - 12}
                      width={isHeroA03 ? 75 : 62}
                      height="20"
                      rx="3"
                      fill="#081324"
                      stroke={isHeroA03 ? '#f43f5e' : '#38bdf8'}
                      strokeWidth="1"
                      fillOpacity="0.9"
                    />
                    <text
                      x={tgt.coordinates.x + 14}
                      y={tgt.coordinates.y + 2}
                      fill={isHeroA03 ? '#fda4af' : '#e0f2fe'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {tgt.code} ({tgt.signalStrength} mV)
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Active Sensor Pod Position with Sonar Ping Cone */}
          <g transform={`translate(${telemetry.sensorX}, ${telemetry.sensorY})`}>
            {/* Sonar sweep / ping waves */}
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="url(#sensorPulseGradient)"
              className="animate-ping-slow"
            />
            <circle
              cx="0"
              cy="0"
              r="14"
              fill="none"
              stroke="#00F2FE"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              className="animate-spin"
              style={{ animationDuration: '8s' }}
            />

            {/* Sensor diamond shape */}
            <polygon
              points="0,-8 8,0 0,8 -8,0"
              fill="#00F2FE"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="filter drop-shadow-[0_0_6px_#00F2FE]"
            />

            {/* Directional heading line */}
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="16"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Live Tag Label */}
            <rect
              x="12"
              y="-10"
              width="95"
              height="20"
              rx="3"
              fill="#050c18"
              stroke="#00F2FE"
              strokeWidth="1.2"
              fillOpacity="0.95"
            />
            <text
              x="17"
              y="4"
              fill="#00F2FE"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              POD-01 [{telemetry.metalResponse} mV/V]
            </text>
          </g>
        </svg>
      </div>

      {/* Selected Measurement Point Tooltip Popup */}
      {activePoint && (
        <div
          className="absolute z-20 bg-ocean-900 border border-cyan-400 p-2.5 rounded shadow-xl text-xs font-mono pointer-events-auto max-w-xs"
          style={{ top: '35%', left: '40%' }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5 text-cyan-300 font-bold">
            <span>SOUNDING ID: {activePoint.id.toUpperCase()}</span>
            <button
              onClick={() => setActivePoint(null)}
              className="text-slate-400 hover:text-white ml-2 text-sm"
            >
              ×
            </button>
          </div>
          <div className="space-y-0.5 text-slate-300 text-[11px]">
            <div>Line: <span className="text-white">{activePoint.line}</span></div>
            <div>Time: <span className="text-white">{activePoint.time}</span></div>
            <div>Depth: <span className="text-white">{activePoint.depth} m</span></div>
            <div>
              Metal Response:{' '}
              <span
                className={`font-bold ${
                  activePoint.response >= 0.65
                    ? 'text-rose-400'
                    : activePoint.response >= 0.5
                    ? 'text-amber-400'
                    : 'text-cyan-300'
                }`}
              >
                {activePoint.response} mV/V
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Live Coordinates Bar */}
      <div className="absolute bottom-2 left-4 right-4 z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none">
        <div className="flex items-center gap-3 bg-ocean-950/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-sm">
          <span className="flex items-center gap-1 text-cyan-400">
            <Crosshair className="w-3 h-3" /> CURSOR:
          </span>
          <span>
            {hoverCoords
              ? `${hoverCoords.lat}, ${hoverCoords.lng} | Depth: -${hoverCoords.depth}m`
              : `${telemetry.sensorLatitude}, ${telemetry.sensorLongitude} | Depth: -${Math.round(telemetry.depth)}m`}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-ocean-950/80 px-2 py-1 rounded border border-slate-800 text-[10px] text-slate-400">
          <span>MODE: {mapMode.toUpperCase()}</span>
          <span>•</span>
          <span className="text-emerald-400">ACOUSTIC USBL LOCK</span>
        </div>
      </div>
    </div>
  );
};
